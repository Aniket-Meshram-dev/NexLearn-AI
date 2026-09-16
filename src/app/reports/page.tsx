'use client';
import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import {
  BarChart3,
  Mail,
  Printer,
  Download,
  Target,
  CheckSquare,
  Clock,
  TrendingUp,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Search,
  Sparkles,
  Bot,
  RotateCcw,
  Layers,
  ArrowRight,
  Flame,
  Calendar,
} from 'lucide-react';
import { generateAcademicReportPDF } from '@/lib/academicReportPdf';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');

  const fetchReports = useCallback(
    (range: string) => {
      setLoading(true);
      fetch(`/api/reports?range=${range}`)
        .then((r) => r.json())
        .then((d) => {
          setData(d);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    },
    []
  );

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated') {
      fetchReports(timeRange);
    }
  }, [status, router, timeRange, fetchReports]);

  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);

  const downloadReport = async (isForEmail = false) => {
    if (isExporting) return null;
    setIsExporting(true);

    try {
      const reportRoot = document.getElementById('report-dashboard');
      if (!reportRoot) return null;

      const studentName = session?.user?.name || 'Student Scholar';
      const studentId = (session?.user?.id || 'NL-SCHOLAR').slice(-8).toUpperCase();
      const studyTimeHours = data?.totalStudyMinutes
        ? Math.round((data.totalStudyMinutes / 60) * 10) / 10
        : data?.weeklyStudyTime
        ? Math.round((data.weeklyStudyTime.reduce((acc: number, curr: any) => acc + curr.minutes, 0) / 60) * 10) / 10
        : 0;

      const pdfBase64 = await generateAcademicReportPDF({
        reportElement: reportRoot,
        studentName,
        studentId,
        accuracy: data?.accuracy || 0,
        totalQuizzes: data?.totalQuizzes || 0,
        passedQuizzes: data?.passedQuizzes !== undefined ? data.passedQuizzes : data?.totalQuizzes || 0,
        studyTimeHours,
        isForEmail,
      });

      window.dispatchEvent(
        new CustomEvent('icmsystem_toast', {
          detail: {
            title: 'Academic Report Ready',
            message: 'Your authenticated performance record was generated with high-DPI clarity.',
            type: 'success',
          },
        })
      );

      return pdfBase64;
    } catch (error) {
      console.error('PDF Export Error:', error);
      window.dispatchEvent(
        new CustomEvent('icmsystem_toast', {
          detail: {
            title: 'Export Error',
            message: 'Could not export performance record. Please try again.',
            type: 'error',
          },
        })
      );
      return null;
    } finally {
      setIsExporting(false);
    }
  };

  const handleNativePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  const handleEmailReport = async () => {
    if (isEmailing) return;
    setIsEmailing(true);
    try {
      const pdfBase64 = await downloadReport(true);
      if (!pdfBase64) throw new Error('Failed to generate PDF attachment');

      const res = await fetch('/api/user/stats/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfBase64 }),
      });
      const d = await res.json();
      if (d.error) throw new Error(d.error);

      window.dispatchEvent(
        new CustomEvent('icmsystem_toast', {
          detail: {
            title: 'Report Sent!',
            message: 'Your learning analytics report (with PDF) is on its way to your email.',
            type: 'success',
          },
        })
      );

      await downloadReport(false);
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent('icmsystem_toast', {
          detail: { title: 'Error', message: 'Failed to send report. Please try again.', type: 'error' },
        })
      );
    }
    setIsEmailing(false);
  };

  const handleAskAiMentor = (topicName: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('open_ai_mentor', {
          detail: {
            query: `Can you explain the key concepts and common test questions for "${topicName}"? I need help strengthening my understanding.`,
          },
        })
      );
    }
  };

  if (loading && !data) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="empty-state">
        <h3>No data available</h3>
      </div>
    );
  }

  const lineChartData = {
    labels: data.quizTrends.map((t: any) => t.label),
    datasets: [
      {
        label: 'Quiz Score (%)',
        data: data.quizTrends.map((t: any) => t.score),
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#4F46E5',
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' as const } },
    scales: { y: { min: 0, max: 100 } },
  };

  const barChartData = {
    labels: data.weeklyStudyTime.map((w: any) => w.label),
    datasets: [
      {
        label: 'Study Minutes',
        data: data.weeklyStudyTime.map((w: any) => w.minutes),
        backgroundColor: '#818CF8',
        borderRadius: 6,
      },
    ],
  };

  // Target vs Actual Study Hours Calculation
  const totalStudyMinutes =
    data.totalStudyMinutes ??
    data.weeklyStudyTime.reduce((acc: number, curr: any) => acc + curr.minutes, 0);
  const actualHours = Math.round((totalStudyMinutes / 60) * 10) / 10;
  const targetHours = timeRange === '7d' ? 5 : timeRange === '30d' ? 20 : 50;
  const targetPercentage = Math.min(100, Math.round((actualHours / targetHours) * 100));

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Print-only Header (Hidden on screen) */}
      <div className="print-only-header" style={{ display: 'none' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 0',
            borderBottom: '2px solid var(--primary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <GraduationCap size={32} color="var(--primary)" />
            <div>
              <h1 style={{ color: 'var(--primary)', margin: 0, fontSize: '1.5rem' }}>NexLearn Academic Record</h1>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.8rem' }}>
                AI-Powered Intelligent Learning Ecosystem
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 800, fontSize: '1rem' }}>{session?.user?.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              ID: {session?.user?.id?.slice(-8).toUpperCase()}
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      {/* Page Header with Time Range Selector & Actions */}
      <div
        className="page-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
            }}
          >
            <BarChart3 size={24} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 800 }}>Reports & Analytics</h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Track comprehensive performance, quiz metrics, and learning velocity
            </p>
          </div>
        </div>

        {/* Action Controls & Time Range */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }} className="no-print">
          {/* Time Range Filter Selector */}
          <div
            style={{
              display: 'inline-flex',
              padding: '4px',
              borderRadius: '10px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              gap: '2px',
            }}
          >
            {[
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: 'all', label: 'All Time' },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setTimeRange(r.id as any)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '7px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: timeRange === r.id ? 'var(--primary)' : 'transparent',
                  color: timeRange === r.id ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease',
                }}
              >
                {r.label}
              </button>
            ))}
          </div>

          <button
            className="btn"
            onClick={handleEmailReport}
            disabled={isEmailing}
            style={{
              background: 'var(--primary-bg)',
              color: 'var(--primary)',
              fontWeight: 600,
              border: 'none',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {isEmailing ? (
              <>
                <span className="spinner spinner-sm" style={{ width: '14px', height: '14px' }} />
                <span>Preparing PDF...</span>
              </>
            ) : (
              <>
                <Mail size={15} />
                <span>Email</span>
              </>
            )}
          </button>

          <button
            className="btn btn-secondary"
            onClick={handleNativePrint}
            disabled={isPrinting || isExporting}
            style={{ borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Printer size={15} />
            <span>{isPrinting ? 'Preparing...' : 'Print'}</span>
          </button>

          <button
            className="btn btn-primary"
            onClick={() => downloadReport()}
            disabled={isExporting || isPrinting}
            style={{ minWidth: '170px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {isExporting ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="spinner-sm" /> Capturing Sections...
              </span>
            ) : (
              <>
                <Download size={16} />
                <span>Download Official PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div id="report-dashboard">
        {/* Top 4 Metric Cards (including Target vs Actual) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          {/* Accuracy */}
          <div className="stat-card">
            <div className="stat-icon blue">
              <Target size={22} />
            </div>
            <div className="stat-info">
              <h3>{data.accuracy}%</h3>
              <p>Overall Accuracy</p>
            </div>
          </div>

          {/* Quizzes Passed */}
          <div className="stat-card">
            <div className="stat-icon green">
              <CheckSquare size={22} />
            </div>
            <div className="stat-info">
              <h3>
                {data.passedQuizzes !== undefined ? data.passedQuizzes : data.totalQuizzes}{' '}
                <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  / {data.totalQuizzes}
                </span>
              </h3>
              <p>Quizzes Passed</p>
            </div>
          </div>

          {/* Study Time */}
          <div className="stat-card">
            <div className="stat-icon yellow">
              <Clock size={22} />
            </div>
            <div className="stat-info">
              <h3>{actualHours}h</h3>
              <p>Study Time ({timeRange === '7d' ? 'Last 7 Days' : timeRange === '30d' ? 'Last 30 Days' : 'All Time'})</p>
            </div>
          </div>

          {/* Target vs. Actual Study Hours Card */}
          <div
            className="stat-card"
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.06) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
            }}
          >
            <div className="stat-icon purple">
              <TrendingUp size={22} />
            </div>
            <div className="stat-info" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h3 style={{ fontSize: '1.45rem' }}>
                  {actualHours}{' '}
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    / {targetHours}h
                  </span>
                </h3>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: targetPercentage >= 80 ? '#10B981' : 'var(--primary)',
                  }}
                >
                  {targetPercentage}% Target
                </span>
              </div>
              <div
                style={{
                  height: '6px',
                  borderRadius: '999px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  overflow: 'hidden',
                  marginTop: '6px',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${targetPercentage}%`,
                    borderRadius: '999px',
                    background: 'linear-gradient(90deg, #6366F1, #A855F7)',
                  }}
                />
              </div>
              <p style={{ marginTop: '6px', fontSize: '0.74rem' }}>
                {actualHours >= targetHours
                  ? 'Target achieved! Excellent consistency.'
                  : `${Math.max(0, Math.round((targetHours - actualHours) * 10) / 10)}h left to hit periodic target`}
              </p>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid-2" style={{ marginBottom: 24, gap: '20px' }}>
          <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="card-header">
              <h3 className="card-title">Quiz Performance Trend</h3>
            </div>
            <div style={{ height: 300 }}>
              <Line data={lineChartData} options={lineOptions} />
            </div>
          </div>
          <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="card-header">
              <h3 className="card-title">Weekly Study Velocity</h3>
            </div>
            <div style={{ height: 300 }}>
              <Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>

        {/* Course Progress & Academic Grades */}
        <div className="grid-2" style={{ marginBottom: 24, gap: '20px' }}>
          <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="card-header">
              <h3 className="card-title">Course Progress Overview</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {data.courseCompletion.length === 0 && <p className="form-hint">No courses started</p>}
              {data.courseCompletion.map((c: any, i: number) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>{c.title}...</span>
                    <span>
                      {c.completed}/{c.total} Modules
                    </span>
                  </div>
                  <div className="progress-bar" style={{ height: 8 }}>
                    <div
                      className="progress-fill"
                      style={{ width: `${c.total > 0 ? (c.completed / c.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="card-header">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <GraduationCap size={20} color="var(--primary)" />
                <span>Academic Course Grades</span>
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.courseScores && data.courseScores.filter((c: any) => c.completed).length > 0 ? (
                data.courseScores
                  .filter((c: any) => c.completed)
                  .map((c: any, i: number) => {
                    const getGrade = (score: number) => {
                      if (score >= 90) return 'A+';
                      if (score >= 80) return 'A';
                      if (score >= 70) return 'B';
                      if (score >= 60) return 'C';
                      if (score >= 50) return 'D';
                      return 'F';
                    };
                    const grade = getGrade(c.score);
                    const isPassing = grade !== 'F';

                    return (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '16px',
                          background: 'var(--bg-secondary)',
                          borderRadius: '16px',
                          border: '1px solid var(--border)',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: '12px',
                              background: isPassing ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.2rem',
                              fontWeight: 900,
                              color: isPassing ? '#10B981' : '#EF4444',
                              border: `1px solid ${isPassing ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                            }}
                          >
                            {grade}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: 2 }}>
                              {c.title}
                            </div>
                            {isPassing ? (
                              <div
                                style={{
                                  fontSize: '0.7rem',
                                  color: '#10B981',
                                  textTransform: 'uppercase',
                                  fontWeight: 800,
                                  letterSpacing: '0.05em',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4,
                                }}
                              >
                                <CheckCircle2 size={13} />
                                <span>Verified Graduate</span>
                              </div>
                            ) : (
                              <div
                                style={{
                                  fontSize: '0.7rem',
                                  color: 'var(--danger)',
                                  textTransform: 'uppercase',
                                  fontWeight: 800,
                                  letterSpacing: '0.05em',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4,
                                }}
                              >
                                <XCircle size={13} />
                                <span>Performance Below Passing</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div
                            style={{
                              fontSize: '1.4rem',
                              fontWeight: 950,
                              color: c.score >= 80 ? '#10B981' : c.score >= 60 ? 'var(--primary)' : 'var(--danger)',
                              letterSpacing: '-0.02em',
                            }}
                          >
                            {c.score}%
                          </div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                            FINAL GRADE
                          </div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div style={{ textAlign: 'center', padding: '24px', border: '1px dashed var(--border)', borderRadius: '12px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                    No completed courses found yet. Complete all modules in a course to generate verified grades.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Weak Areas & Targeted Action Plan */}
        <div
          className="card"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '18px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(245, 158, 11, 0.15))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#EF4444',
                }}
              >
                <Sparkles size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  AI Targeted Action Plan & Weak Areas
                </h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
                  Autonomous remediation suggestions for topics scoring below 75% accuracy
                </p>
              </div>
            </div>

            <Link
              href="/flashcards"
              className="btn btn-outline"
              style={{ fontSize: '0.82rem', padding: '6px 14px', borderRadius: '8px', gap: '6px' }}
            >
              <Layers size={14} />
              <span>Practice Flashcards</span>
            </Link>
          </div>

          {data.weakAreas.length === 0 ? (
            <div
              style={{
                padding: '32px 20px',
                textAlign: 'center',
                borderRadius: '16px',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
              }}
            >
              <CheckCircle2 size={36} color="#10B981" style={{ marginBottom: '10px' }} />
              <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Mastery High Across All Syllabus Units!
              </h4>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '480px', marginInline: 'auto' }}>
                All completed module quizzes are scoring 75% or above. Your conceptual foundation is solid and ready for advanced topics.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {data.weakAreas.map((w: any, i: number) => (
                <div
                  key={i}
                  style={{
                    padding: '18px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '14px',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          color: '#EF4444',
                          letterSpacing: '0.04em',
                          background: 'rgba(239, 68, 68, 0.12)',
                          padding: '2px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        Needs Reinforcement
                      </span>
                      <span
                        style={{
                          fontSize: '1.15rem',
                          fontWeight: 900,
                          color: '#EF4444',
                        }}
                      >
                        {w.accuracy}%
                      </span>
                    </div>

                    <h4 style={{ margin: '0 0 6px 0', fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {w.name}
                    </h4>

                    <p style={{ margin: '0 0 14px 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      Topic diagnostic indicates concept gaps. Ask AI Mentor to explain edge cases or review spaced-repetition cards.
                    </p>
                  </div>

                  {/* 1-Click Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleAskAiMentor(w.name)}
                      style={{
                        flex: '1 1 120px',
                        padding: '7px 10px',
                        borderRadius: '8px',
                        background: 'rgba(99, 102, 241, 0.12)',
                        border: '1px solid rgba(99, 102, 241, 0.25)',
                        color: 'var(--primary)',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                      }}
                    >
                      <Bot size={13} />
                      <span>Ask AI Mentor</span>
                    </button>

                    {w.courseId && w.moduleId ? (
                      <Link
                        href={`/course/${w.courseId}/module/${w.moduleId}/quiz`}
                        style={{
                          flex: '1 1 110px',
                          padding: '7px 10px',
                          borderRadius: '8px',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-primary)',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px',
                        }}
                      >
                        <RotateCcw size={13} />
                        <span>Retake Quiz</span>
                      </Link>
                    ) : (
                      <Link
                        href="/flashcards"
                        style={{
                          flex: '1 1 110px',
                          padding: '7px 10px',
                          borderRadius: '8px',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-primary)',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px',
                        }}
                      >
                        <Layers size={13} />
                        <span>Review</span>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
