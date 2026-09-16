import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateQuiz } from '@/lib/gemini';

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, moduleId } = await params;
  const module = await prisma.module.findFirst({
    where: { id: moduleId, courseId: id, course: { userId: session.user.id } },
    include: {
      quiz: { include: { questions: true } },
      course: { select: { title: true } },
    },
  });

  if (!module) return NextResponse.json({ error: 'Module not found' }, { status: 404 });

  // Enforce sequential progression
  const courseModules = await prisma.module.findMany({
    where: { courseId: id },
    orderBy: { orderIndex: 'asc' },
    select: { id: true, completed: true }
  });

  const currentIndex = courseModules.findIndex(m => m.id === moduleId);
  if (currentIndex > 0 && !courseModules[currentIndex - 1].completed) {
    return NextResponse.json({ error: 'Locked. Please complete the previous module first.', isLocked: true }, { status: 403 });
  }

  // Ensure current module is marked as completed before starting quiz
  if (!module.completed) {
    return NextResponse.json({ 
      error: 'Module not completed. You must mark the module as completed before starting the quiz.', 
      isLocked: true 
    }, { status: 403 });
  }

  // Generate quiz if not exists
  if (!module.quiz) {
    try {
      let subtopics = [module.title];
      if (module.subtopics) {
        try {
          subtopics = JSON.parse(module.subtopics);
          if (!Array.isArray(subtopics)) subtopics = [module.subtopics];
        } catch (e) {
          subtopics = [module.subtopics];
        }
      }
      const quizData = await generateQuiz(module.title, subtopics, module.difficulty, module.notes);

      const quiz = await prisma.quiz.create({
        data: {
          moduleId: module.id,
          questions: {
            create: quizData.questions.map(q => ({
              text: q.text,
              options: JSON.stringify(q.options),
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
            })),
          },
        },
        include: { questions: true },
      });

      return NextResponse.json({
        quiz,
        moduleTitle: module.title,
        courseTitle: module.course?.title,
      });
    } catch (error) {
      console.error('Quiz generation error:', error);
      return NextResponse.json({ error: 'Failed to generate quiz. Try again.' }, { status: 500 });
    }
  }

  // Fetch last attempt results if requested
  const lastAttempt = await prisma.quizAttempt.findFirst({
    where: { userId: session.user.id, quizId: module.quiz.id },
    orderBy: { createdAt: 'desc' },
  });

  let lastResult = null;
  if (lastAttempt) {
    try {
      const userAnswers = JSON.parse(lastAttempt.answers);
      const results = module.quiz.questions.map((q, i) => {
        const isCorrect = userAnswers[i] === q.correctAnswer;
        return {
          questionId: q.id, text: q.text,
          options: JSON.parse(q.options),
          selectedAnswer: userAnswers[i],
          correctAnswer: q.correctAnswer,
          isCorrect, explanation: q.explanation,
        };
      });
      lastResult = {
        score: lastAttempt.score,
        total: lastAttempt.totalQuestions,
        percentage: Math.round((lastAttempt.score / lastAttempt.totalQuestions) * 100),
        results,
      };
    } catch(e) {}
  }

  return NextResponse.json({
    quiz: module.quiz,
    lastResult,
    moduleTitle: module.title,
    courseTitle: module.course?.title,
  });
}

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, moduleId } = await params;
  const { answers, timeTaken } = await request.json();

  const module = await prisma.module.findFirst({
    where: { id: moduleId, courseId: id, course: { userId: session.user.id } },
    include: { quiz: { include: { questions: true } } },
  });

  if (!module?.quiz) return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });

  // Enforce sequential progression
  const courseModules = await prisma.module.findMany({
    where: { courseId: id },
    orderBy: { orderIndex: 'asc' },
    select: { id: true, completed: true }
  });

  const currentIndex = courseModules.findIndex(m => m.id === moduleId);
  if (currentIndex > 0 && !courseModules[currentIndex - 1].completed) {
    return NextResponse.json({ error: 'Locked. Please complete the previous module first.', isLocked: true }, { status: 403 });
  }

  // Ensure current module was marked as completed before accepting current quiz
  if (!module.completed) {
    return NextResponse.json({ error: 'You must mark the module as completed before submitting a quiz.', isLocked: true }, { status: 403 });
  }

  // Calculate score
  let score = 0;
  const results = module.quiz.questions.map((q, i) => {
    const isCorrect = answers[i] === q.correctAnswer;
    if (isCorrect) score++;
    return {
      questionId: q.id, text: q.text,
      options: JSON.parse(q.options),
      selectedAnswer: answers[i],
      correctAnswer: q.correctAnswer,
      isCorrect, explanation: q.explanation,
    };
  });

  // Save attempt
  const attempt = await prisma.quizAttempt.create({
    data: {
      userId: session.user.id,
      quizId: module.quiz.id,
      score,
      totalQuestions: module.quiz.questions.length,
      answers: JSON.stringify(answers),
      timeTaken: timeTaken || 0,
    },
  });

  // Log study session
  await prisma.studySession.create({
    data: { userId: session.user.id, duration: Math.max(1, Math.ceil(timeTaken / 60)) },
  });

  // Achievement checks
  const unlockedAchievements = [];
  const quizInitiate = await prisma.achievement.findUnique({ where: { title: 'Quiz Initiate' } });
  if (quizInitiate) {
    const existing = await prisma.userAchievement.findUnique({
      where: { userId_achievementId: { userId: session.user.id, achievementId: quizInitiate.id } }
    });
    if (!existing) {
      await prisma.userAchievement.create({
        data: { userId: session.user.id, achievementId: quizInitiate.id },
      });
      const notif = await prisma.notification.create({
        data: {
          userId: session.user.id,
          title: 'Achievement Unlocked: Quiz Initiate!',
          message: 'You submitted your very first quiz — the journey of a thousand questions begins!',
          type: 'success'
        }
      });
      unlockedAchievements.push(notif);
    }
  }

  if (score === module.quiz.questions.length && score > 0) {
    const flawless = await prisma.achievement.findUnique({ where: { title: 'Flawless' } });
    if (flawless) {
      const existing = await prisma.userAchievement.findUnique({
        where: { userId_achievementId: { userId: session.user.id, achievementId: flawless.id } }
      });
      if (!existing) {
        await prisma.userAchievement.create({
          data: { userId: session.user.id, achievementId: flawless.id },
        });
        const notif = await prisma.notification.create({
          data: {
            userId: session.user.id,
            title: 'Achievement Unlocked: Flawless!',
            message: `Perfect 100% on the "${module.title}" quiz — absolutely flawless!`,
            type: 'success'
          }
        });
        unlockedAchievements.push(notif);
      }
    }
  }

  // --- Automated Certification & Mastery Logic ---
  const fullCourse = await prisma.course.findUnique({
    where: { id },
    include: { 
      modules: { 
        include: { 
          quiz: { include: { attempts: { where: { userId: session.user.id } } } } 
        } 
      }
    }
  });

  if (fullCourse) {
    const allModulesDone = fullCourse.modules.every(m => m.completed);
    const allQuizzesAttempted = fullCourse.modules.every(m => m.quiz && (m.quiz.attempts.length > 0 || m.quiz.id === module.quiz.id));

    if (allModulesDone && allQuizzesAttempted) {
      const achievement = await prisma.achievement.findUnique({ where: { title: 'Course Conqueror' } });
      if (achievement) {
        const existing = await prisma.userAchievement.findUnique({
          where: { userId_achievementId: { userId: session.user.id, achievementId: achievement.id } }
        });
        if (!existing) {
          await prisma.userAchievement.create({
            data: { userId: session.user.id, achievementId: achievement.id },
          });
          const notif = await prisma.notification.create({
            data: {
              userId: session.user.id,
              title: 'Achievement Unlocked: Course Conqueror!',
              message: `You fully mastered "${fullCourse.title}".`,
              type: 'success'
            }
          });
          unlockedAchievements.push(notif);
        }
      }
    }
  }

  return NextResponse.json({
    score, total: module.quiz.questions.length,
    percentage: Math.round((score / module.quiz.questions.length) * 100),
    results, attemptId: attempt.id,
    unlockedAchievements
  });
}
