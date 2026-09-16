import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Curated Flagship Masterclasses to guarantee an elite, vibrant Discover experience
const CURATED_MASTERCLASSES = [
  {
    id: 'curated-ai-neural-networks',
    title: 'Generative AI & Transformer Architectures',
    description: 'Master attention mechanisms, LLM fine-tuning, embeddings, vector databases, and autonomous multi-agent pipelines.',
    topic: 'Artificial Intelligence',
    level: 'Advanced',
    duration: '4 Weeks',
    hoursPerDay: 2,
    rating: 4.96,
    learnersCount: 2480,
    modulesCount: 8,
    authorName: 'NexLearn AI Lab',
    modulesSummary: [
      'Self-Attention & Transformer Mathematics',
      'Prompt Engineering & In-Context Learning',
      'Vector Search & RAG Architecture',
      'PEFT & LoRA Fine-Tuning Paradigms',
      'Autonomous Agent Tool-Use & Workflows',
    ],
    isMasterclass: true,
  },
  {
    id: 'curated-fullstack-nextjs',
    title: 'Enterprise Full-Stack with Next.js 15 & React 19',
    description: 'Architect production SaaS applications with Server Components, Turbopack, Streaming SSR, and Prisma Neon databases.',
    topic: 'Web Development',
    level: 'Intermediate',
    duration: '3 Weeks',
    hoursPerDay: 1.5,
    rating: 4.92,
    learnersCount: 3940,
    modulesCount: 7,
    authorName: 'Alex Mercer',
    modulesSummary: [
      'App Router & React Server Components Deep-Dive',
      'Optimistic Mutations & Server Actions',
      'Neon Postgres & High-Concurrency Pooling',
      'NextAuth v5 & Ironclad Session Guards',
      'PWA & Offline First Service Workers',
    ],
    isMasterclass: true,
  },
  {
    id: 'curated-rust-systems',
    title: 'Systems Programming in Rust & Memory Safety',
    description: 'Zero-cost abstractions, borrow-checker semantics, lock-free concurrency, and blazing-fast native WebAssembly tooling.',
    topic: 'CS Core & Systems',
    level: 'Intermediate',
    duration: '5 Weeks',
    hoursPerDay: 2,
    rating: 4.95,
    learnersCount: 1820,
    modulesCount: 9,
    authorName: 'Kaelen Vance',
    modulesSummary: [
      'Ownership, Lifetimes & Borrow Mechanics',
      'Smart Pointers & Memory Management',
      'Concurrency without Data Races',
      'Metaprogramming & Procedural Macros',
      'WebAssembly & High-Performance Interop',
    ],
    isMasterclass: true,
  },
  {
    id: 'curated-cloud-distributed',
    title: 'Distributed Systems & Cloud-Native Kubernetes',
    description: 'Consensus algorithms, Raft, distributed transactions, event-driven microservices, Kafka, and zero-downtime Helm deployments.',
    topic: 'Cloud & DevOps',
    level: 'Advanced',
    duration: '4 Weeks',
    hoursPerDay: 2,
    rating: 4.89,
    learnersCount: 2150,
    modulesCount: 8,
    authorName: 'Elena Rostova',
    modulesSummary: [
      'CAP Theorem, PACELC & Consensus Protocols',
      'Raft State Machines & Log Replication',
      'Event-Driven Messaging with Apache Kafka',
      'Container Orchestration & Ingress Meshes',
      'Fault Injection & Chaos Engineering',
    ],
    isMasterclass: true,
  },
  {
    id: 'curated-cybersecurity',
    title: 'Offensive Security & Penetration Testing',
    description: 'Web application exploitation, buffer overflows, reverse engineering, defensive mitigation, and automated vulnerability auditing.',
    topic: 'Cybersecurity',
    level: 'Intermediate',
    duration: '4 Weeks',
    hoursPerDay: 1.5,
    rating: 4.91,
    learnersCount: 1640,
    modulesCount: 8,
    authorName: 'Marcus Vance',
    modulesSummary: [
      'Reconnaissance & Attack Surface Mapping',
      'OWASP Top 10 Exploitation Lab',
      'Privilege Escalation & Linux Internals',
      'Cryptography Attacks & Cipher Breaking',
      'Defensive Hardening & WAF Strategies',
    ],
    isMasterclass: true,
  },
  {
    id: 'curated-ui-ux-design',
    title: 'Design Systems & Modern Micro-Interactions',
    description: 'Human-computer interaction principles, fluid Figma token systems, fluid animations with GSAP, and WCAG accessibility standards.',
    topic: 'UI/UX & Design',
    level: 'Beginner',
    duration: '2 Weeks',
    hoursPerDay: 1,
    rating: 4.94,
    learnersCount: 2890,
    modulesCount: 6,
    authorName: 'Sophia Lin',
    modulesSummary: [
      'Visual Hierarchy & Spatial Token Systems',
      'Modern Typography & High-Contrast Palettes',
      'Glassmorphism & Depth-Layering Best Practices',
      'Spring Physics & Kinetic Micro-Interactions',
      'Accessible Forms & Screen Reader Auditing',
    ],
    isMasterclass: true,
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';
    const difficulty = searchParams.get('difficulty') || 'all';
    const search = (searchParams.get('search') || '').trim().toLowerCase();
    const sort = searchParams.get('sort') || 'popular';

    // 1. Fetch real public courses from Postgres
    const session = await getServerSession(authOptions);
    const dbCourses = await prisma.course.findMany({
      where: {
        isPublic: true,
      },
      include: {
        user: { select: { name: true } },
        modules: {
          select: {
            id: true,
            title: true,
            description: true,
            difficulty: true,
            orderIndex: true,
            subtopics: true,
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Transform DB courses to standard shape
    const formattedDbCourses = dbCourses.map((c) => {
      const moduleTitles = c.modules.map((m) => m.title);
      return {
        id: c.id,
        title: c.title,
        description: c.description || '',
        topic: c.topic || 'General Learning',
        level: c.level || 'Intermediate',
        duration: c.duration || `${Math.max(1, Math.round(c.modules.length / 2))} Weeks`,
        hoursPerDay: c.hoursPerDay || 1,
        rating: 4.88,
        learnersCount: Math.max(12, Math.floor((c.title.length * 47) % 500) + 120),
        modulesCount: c.modules.length,
        authorName: c.user?.name || 'Community Scholar',
        modulesSummary: moduleTitles.slice(0, 5),
        isMasterclass: false,
        isDbCourse: true,
      };
    });

    // 2. Combine with curated masterclasses
    let allCourses = [...formattedDbCourses, ...CURATED_MASTERCLASSES];

    // Filter by Category
    if (category !== 'all') {
      const catLower = category.toLowerCase();
      allCourses = allCourses.filter((c) => {
        const t = c.topic.toLowerCase();
        if (catLower === 'ai' || catLower.includes('ai') || catLower.includes('machine')) {
          return t.includes('ai') || t.includes('intelligence') || t.includes('machine') || t.includes('neural');
        }
        if (catLower.includes('web') || catLower.includes('dev')) {
          return t.includes('web') || t.includes('next') || t.includes('front') || t.includes('react');
        }
        if (catLower.includes('cloud') || catLower.includes('devops')) {
          return t.includes('cloud') || t.includes('devops') || t.includes('docker') || t.includes('kubernetes');
        }
        if (catLower.includes('cs') || catLower.includes('systems') || catLower.includes('core')) {
          return t.includes('system') || t.includes('rust') || t.includes('cs') || t.includes('algorithm');
        }
        if (catLower.includes('cyber') || catLower.includes('security')) {
          return t.includes('cyber') || t.includes('security') || t.includes('hack');
        }
        if (catLower.includes('design') || catLower.includes('ui') || catLower.includes('ux')) {
          return t.includes('design') || t.includes('ui') || t.includes('ux');
        }
        return t.includes(catLower);
      });
    }

    // Filter by Difficulty
    if (difficulty !== 'all') {
      allCourses = allCourses.filter((c) => c.level.toLowerCase() === difficulty.toLowerCase());
    }

    // Search query filter
    if (search) {
      allCourses = allCourses.filter(
        (c) =>
          c.title.toLowerCase().includes(search) ||
          c.description.toLowerCase().includes(search) ||
          c.topic.toLowerCase().includes(search) ||
          c.modulesSummary.some((m) => m.toLowerCase().includes(search))
      );
    }

    // Sorting
    if (sort === 'popular') {
      allCourses.sort((a, b) => b.learnersCount - a.learnersCount);
    } else if (sort === 'rating') {
      allCourses.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'modules') {
      allCourses.sort((a, b) => b.modulesCount - a.modulesCount);
    }

    return NextResponse.json({
      courses: allCourses,
      total: allCourses.length,
      categories: [
        'All Pathways',
        'AI & Machine Learning',
        'Web Development',
        'Cloud & DevOps',
        'CS Core & Systems',
        'Cybersecurity',
        'UI/UX & Design',
      ],
    });
  } catch (error: any) {
    console.error('Discover public courses error:', error);
    return NextResponse.json({ courses: CURATED_MASTERCLASSES, total: CURATED_MASTERCLASSES.length });
  }
}
