'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { AlertTriangle, RefreshCw } from 'lucide-react';

import DashboardHero from '@/components/dashboard/DashboardHero';
import StatsOverview from '@/components/dashboard/StatsOverview';
import DailyTargetWidget from '@/components/dashboard/DailyTargetWidget';
import AnalyticsSection from '@/components/dashboard/AnalyticsSection';
import RecentActivityFeed from '@/components/dashboard/RecentActivityFeed';
import RecommendationsSection from '@/components/dashboard/RecommendationsSection';
import CourseTabsSection from '@/components/dashboard/CourseTabsSection';
import DeleteCourseModal from '@/components/dashboard/DeleteCourseModal';

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [deleteModal, setDeleteModal] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [activeCourseTab, setActiveCourseTab] = useState<'enrolled' | 'available' | 'completed'>('enrolled');

  const loadStats = () => {
    setLoading(true);
    setFetchError(false);
    fetch('/api/user/stats')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load stats');
        return r.json();
      })
      .then((d) => {
        if (d && (d.recentCourses !== undefined || d.stats)) {
          setData(d);
        } else {
          setData({
            stats: {
              streak: 0,
              totalCourses: 0,
              completedModules: 0,
              totalModules: 0,
              totalQuizzes: 0,
              avgScore: 0,
              points: 0,
              courseCompletion: 0,
            },
            weeklyStudy: [],
            recommendations: [],
            recentCourses: [],
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching dashboard stats:', err);
        setFetchError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated') {
      loadStats();
    }
  }, [status, router]);

  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    const tabParam = searchParams?.get('tab');
    if (hash === '#available' || hash === '#catalog' || tabParam === 'available') {
      setActiveCourseTab('available');
    } else if (hash === '#completed' || tabParam === 'completed') {
      setActiveCourseTab('completed');
    } else if (
      hash === '#courses' ||
      hash === '#courses-section' ||
      hash === '#enrolled' ||
      tabParam === 'enrolled'
    ) {
      setActiveCourseTab('enrolled');
    }
  }, [pathname, searchParams]);

  // Smooth scroll to courses-section once dashboard finishes loading
  useEffect(() => {
    if (!loading && data) {
      const hash = typeof window !== 'undefined' ? window.location.hash : '';
      if (
        hash === '#courses-section' ||
        hash === '#courses' ||
        hash === '#available' ||
        hash === '#catalog' ||
        hash === '#completed'
      ) {
        const timer = setTimeout(() => {
          const el = document.getElementById('courses-section');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 120);
        return () => clearTimeout(timer);
      }
    }
  }, [loading, data, pathname]);

  // Handle in-page hash changes while already mounted on /dashboard
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#courses-section' || hash === '#courses') {
        setActiveCourseTab('enrolled');
        const el = document.getElementById('courses-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (hash === '#available' || hash === '#catalog') {
        setActiveCourseTab('available');
        const el = document.getElementById('courses-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (hash === '#completed') {
        setActiveCourseTab('completed');
        const el = document.getElementById('courses-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleEnrollMatch = async (courseId: string) => {
    setEnrollingId(courseId);
    try {
      await fetch(`/api/courses/${courseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrolled: true }),
      });
      setData((prev: any) => ({
        ...prev,
        recentCourses: prev.recentCourses.map((c: any) =>
          c.id === courseId ? { ...c, enrolled: true } : c
        ),
      }));
      window.dispatchEvent(
        new CustomEvent('icmsystem_toast', {
          detail: {
            id: 'enroll-' + Date.now(),
            title: 'Course Enrolled!',
            message: 'You have actively enrolled in the course curriculum.',
            type: 'success',
            read: false,
          },
        })
      );
    } catch (err) {
      console.error('Error enrolling course:', err);
    }
    setEnrollingId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal) return;
    setIsDeleting(true);
    try {
      if (deleteModal.isRemoving) {
        await fetch(`/api/courses/${deleteModal.id}`, { method: 'DELETE' });
        setData((prev: any) => ({
          ...prev,
          recentCourses: prev.recentCourses.filter((rc: any) => rc.id !== deleteModal.id),
        }));

        window.dispatchEvent(
          new CustomEvent('icmsystem_toast', {
            detail: {
              id: 'delete-' + Date.now(),
              title: 'Course Removed',
              message: `"${deleteModal.title}" has been removed from your catalog.`,
              type: 'success',
              read: false,
            },
          })
        );
      } else {
        await fetch(`/api/courses/${deleteModal.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enrolled: false }),
        });
        setData((prev: any) => ({
          ...prev,
          recentCourses: prev.recentCourses.map((c: any) =>
            c.id === deleteModal.id ? { ...c, enrolled: false } : c
          ),
        }));

        window.dispatchEvent(
          new CustomEvent('icmsystem_toast', {
            detail: {
              id: 'unenroll-' + Date.now(),
              title: 'Course Unenrolled',
              message: `"${deleteModal.title}" moved back to your available catalog.`,
              type: 'success',
              read: false,
            },
          })
        );
      }
    } catch (err) {
      console.error('Error modifying course:', err);
    } finally {
      setIsDeleting(false);
      setDeleteModal(null);
    }
  };

  if (fetchError) {
    return (
      <div className="card" style={{ maxWidth: 480, margin: '80px auto', textAlign: 'center', padding: '44px 28px', borderRadius: '18px' }}>
        <div style={{ width: 56, height: 56, borderRadius: '16px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <AlertTriangle size={28} />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Workspace Offline</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: 24, lineHeight: 1.55 }}>
          Could not establish a connection to your learning database. Please verify your connection or try again.
        </p>
        <button onClick={loadStats} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 10 }}>
          <RefreshCw size={16} />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Loading your learning workspace...</p>
      </div>
    );
  }

  const {
    stats,
    weeklyStudy = [],
    recommendations = [],
    recentCourses = [],
    dailyTarget,
    resumeLesson,
    recentActivities = [],
  } = data;
  const availableCourses = (recentCourses || []).filter((c: any) => !c.enrolled && !c.fullyCompleted);
  const enrolledCourses = (recentCourses || []).filter((c: any) => c.enrolled && !c.fullyCompleted);
  const completedCourses = (recentCourses || []).filter((c: any) => c.fullyCompleted);
  const firstName = session?.user?.name ? session.user.name.split(' ')[0] : 'Scholar';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* 🚀 Hero Greeting Banner */}
      <DashboardHero
        firstName={firstName}
        streak={stats.streak}
        resumeLesson={resumeLesson}
        onExploreCatalog={() => setActiveCourseTab('available')}
      />

      {/* 🎯 Daily Study Target Widget */}
      <DailyTargetWidget
        dailyTarget={dailyTarget}
        streak={stats.streak}
        resumeLink={resumeLesson?.link}
      />

      {/* 📊 Top 4 Metric Stat Cards */}
      <StatsOverview stats={stats} />

      {/* 📈 Charts & Progress Section */}
      <AnalyticsSection stats={stats} weeklyStudy={weeklyStudy} />

      {/* ⚡ Live Recent Activity Stream */}
      <RecentActivityFeed activities={recentActivities} />

      {/* 🧠 Smart Recommendations */}
      <RecommendationsSection recommendations={recommendations} />

      {/* 📑 Segmented Control Course Workspace */}
      <CourseTabsSection
        recentCourses={recentCourses}
        enrolledCourses={enrolledCourses}
        availableCourses={availableCourses}
        completedCourses={completedCourses}
        activeCourseTab={activeCourseTab}
        setActiveCourseTab={setActiveCourseTab}
        enrollingId={enrollingId}
        onEnroll={handleEnrollMatch}
        onOpenDeleteModal={setDeleteModal}
      />

      {/* Delete / Unenroll Confirmation Modal */}
      <DeleteCourseModal
        deleteModal={deleteModal}
        isDeleting={isDeleting}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div style={{ padding: '60px 20px', textAlign: 'center' }}>Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
