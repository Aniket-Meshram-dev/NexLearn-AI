'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend, Filler
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
} from 'lucide-react';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated') {
      fetch('/api/reports').then(r => r.json()).then(d => { setData(d); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [status, router]);

  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);

  const downloadReport = async (isForEmail = false) => {
    if (isExporting) return null;
    setIsExporting(true);

    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');

      const reportRoot = document.getElementById('report-dashboard');
      if (!reportRoot) return;

      const pdf = new jsPDF('p', 'pt', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 12;
      let currentY = 32; // Starting Y after header

      // --- 🏛️ Professional Header Function ---
      const addHeader = (doc, pageNum) => {
        doc.setFillColor(79, 70, 229); // NexLearn Primary
        doc.rect(0, 0, pdfWidth, 22, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('NexLearn ', margin, 14);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');

        doc.setFontSize(10);
        doc.text(`PAGE ${pageNum}`, pdfWidth - margin, 14, { align: 'right' });
      };

      // --- 🖋️ Footer / Stamp Function ---
      const addFooter = (doc) => {
        const footerY = pdfHeight - 15;
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, footerY - 5, pdfWidth - margin, footerY - 5);
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text('This is an official NexLearn academic record. Information is verified through blockchain-backed credentials.', margin, footerY);
        doc.text(`Timestamp: ${new Date().toISOString()}`, pdfWidth - margin, footerY, { align: 'right' });
      };

      addHeader(pdf, 1);

      pdf.setTextColor(30, 41, 59);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`ACADEMIC PERFORMANCE REPORT: ${session?.user?.name || 'Student'}`, margin, currentY);
      currentY += 8;

      // --- 📸 Smart Section-by-Section Capture ---
      const sections = Array.from(reportRoot.children);

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];

        // Capture individual section with optimized scale and format
        const canvas = await html2canvas(section as HTMLElement, {
          scale: 1.5,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false
        });

        const imgWidth = pdfWidth - (margin * 2);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Auto-pagination logic: If section exceeds page height
        if (currentY + imgHeight > pdfHeight - 20) {
          pdf.addPage();
          addHeader(pdf, (pdf.internal as any).getNumberOfPages());
          currentY = 32; // Reset Y-axis after header
        }

        const imgData = canvas.toDataURL('image/jpeg', 0.82);
        pdf.addImage(imgData, 'JPEG', margin, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 12; // Add spacing between sections
      }

      // Final signature/stamp
      currentY += 10;
      pdf.setDrawColor(79, 70, 229);
      pdf.setLineWidth(0.5);
      pdf.line(margin, currentY, margin + 40, currentY);
      pdf.setFontSize(8);
      pdf.text('AUTHORIZED REGISTRAR', margin, currentY + 4);

      pdf.setDrawColor(16, 185, 129); // Success Green
      pdf.setLineWidth(1);
      pdf.ellipse(pdfWidth - margin - 25, currentY + 5, 20, 10);
      pdf.setTextColor(16, 185, 129);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('VERIFIED', pdfWidth - margin - 25, currentY + 6, { align: 'center' });

      addFooter(pdf);

      const fileName = `NexLearn_Official_Report_${new Date().getFullYear()}.pdf`;
      if (isForEmail) {
        return pdf.output('datauristring').split(',')[1];
      } else {
        pdf.save(fileName);
      }

      window.dispatchEvent(new CustomEvent('icmsystem_toast', {
        detail: {
          title: 'Official Report Ready',
          message: 'Your authenticated academic record has been generated perfectly.',
          type: 'success'
        }
      }));
    } catch (error) {
      console.error('PDF Export Error:', error);
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
      // First, generate the professional PDF locally
      const pdfBase64 = await downloadReport(true);
      if (!pdfBase64) throw new Error('Failed to generate PDF attachment');

      const res = await fetch('/api/user/stats/email', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfBase64 })
      });
      const d = await res.json();
      if (d.error) throw new Error(d.error);
      
      window.dispatchEvent(new CustomEvent('icmsystem_toast', {
        detail: { title: 'Report Sent!', message: 'Your learning analytics report (with PDF) is on its way to your email.', type: 'success' }
      }));

      // Also trigger a local download for convenience
      await downloadReport(false);
    } catch (err) {
      window.dispatchEvent(new CustomEvent('icmsystem_toast', {
        detail: { title: 'Error', message: 'Failed to send report. Please try again.', type: 'error' }
      }));
    }
    setIsEmailing(false);
  };

  if (loading) return <div className="loading-page"><div className="spinner" /><p>Loading analytics...</p></div>;
  if (!data) return <div className="empty-state"><h3>No data available</h3></div>;

  const lineChartData = {
    labels: data.quizTrends.map(t => t.label),
    datasets: [{
      label: 'Quiz Score (%)',
      data: data.quizTrends.map(t => t.score),
      borderColor: '#4F46E5', backgroundColor: 'rgba(79, 70, 229, 0.1)',
      borderWidth: 2, tension: 0.3, fill: true, pointBackgroundColor: '#4F46E5',
    }],
  };

  const lineOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'top' as const } },
    scales: { y: { min: 0, max: 100 } }
  };

  const barChartData = {
    labels: data.weeklyStudyTime.map(w => w.label),
    datasets: [{
      label: 'Study Minutes',
      data: data.weeklyStudyTime.map(w => w.minutes),
      backgroundColor: '#818CF8', borderRadius: 6,
    }],
  };

  return (
    <div>
      {/* Production-grade Print Header (Hidden on screen) */}
      <div className="print-only-header" style={{ display: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderBottom: '2px solid var(--primary)' }}>
          <div>
            <h1 style={{ color: 'var(--primary)', margin: 0 }}>NexLearn Analytics</h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>High-Fidelity Academic Performance Report</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700 }}>{session?.user?.name}</div>
            <div style={{ fontSize: '0.8rem' }}>{new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      {/* Production-grade Print Header (Hidden on screen) */}
      <div className="print-only-header" style={{ display: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderBottom: '2px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '2rem' }}>🎓</div>
            <div>
              <h1 style={{ color: 'var(--primary)', margin: 0, fontSize: '1.5rem' }}>NexLearn Academic Record</h1>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.8rem' }}>AI-Powered Intelligent Learning Ecosystem</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 800, fontSize: '1rem' }}>{session?.user?.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {session?.user?.id?.slice(-8).toUpperCase()}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
            }}
          >
            <BarChart3 size={22} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>Reports & Analytics</h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Track comprehensive performance, quiz metrics, and learning velocity
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }} className="no-print">
          <button
            className="btn"
            onClick={handleEmailReport}
            disabled={isEmailing}
            style={{ background: 'var(--primary-bg)', color: 'var(--primary)', fontWeight: 600, border: 'none', minWidth: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '10px' }}
          >
            {isEmailing ? <><span className="spinner spinner-sm" style={{ width: '14px', height: '14px' }} /> Preparing PDF...</> : <><Mail size={16} /><span>Email Report</span></>}
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleNativePrint}
            disabled={isPrinting || isExporting}
            style={{ borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Printer size={16} />
            <span>{isPrinting ? 'Preparing...' : 'Print Record'}</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={() => downloadReport()}
            disabled={isExporting || isPrinting}
            style={{ minWidth: '180px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}
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

      <div id="report-dashboard" style={{ background: 'var(--bg)', borderRadius: '24px' }}>
        <div className="grid-3" style={{ marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-icon blue">
              <Target size={22} />
            </div>
            <div className="stat-info">
              <h3>{data.accuracy}%</h3>
              <p>Overall Accuracy</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">
              <CheckSquare size={22} />
            </div>
            <div className="stat-info">
              <h3>{data.totalQuizzes}</h3>
              <p>Quizzes Passed</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon yellow">
              <Clock size={22} />
            </div>
            <div className="stat-info">
              <h3>{Math.round(data.weeklyStudyTime.reduce((acc, curr) => acc + curr.minutes, 0) / 60 * 10) / 10}h</h3>
              <p>Study Time (Last 4 Weeks)</p>
            </div>
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom: 24 }}>
          <div className="card">
            <div className="card-header"><h3 className="card-title">Quiz Performance Trend</h3></div>
            <div style={{ height: 300 }}><Line data={lineChartData} options={lineOptions} /></div>
          </div>
          <div className="card">
            <div className="card-header"><h3 className="card-title">Weekly Study Time</h3></div>
            <div style={{ height: 300 }}><Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom: 24 }}>
          <div className="card">
            <div className="card-header"><h3 className="card-title">Course Progress Overview</h3></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {data.courseCompletion.length === 0 && <p className="form-hint">No courses started</p>}
              {data.courseCompletion.map((c, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>{c.title}...</span>
                    <span>{c.completed}/{c.total} Modules</span>
                  </div>
                  <div className="progress-bar" style={{ height: 8 }}>
                    <div className="progress-fill" style={{ width: `${c.total > 0 ? (c.completed / c.total) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3 className="card-title">🎓 Academic Course Grades</h3></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.courseScores && data.courseScores.filter(c => c.completed).length > 0 ? (
                data.courseScores.filter(c => c.completed).map((c, i) => {
                  const getGrade = (score) => {
                    if (score >= 90) return 'A+';
                    if (score >= 80) return 'A';
                    if (score >= 70) return 'B';
                    if (score >= 60) return 'C';
                    if (score >= 50) return 'D';
                    return 'F';
                  };
                  const grade = getGrade(c.score);

                  const isPassing = grade !== 'F';
                  const gradeStyles = {
                    'A+': { bg: 'var(--success-bg)', color: 'var(--success)', border: 'var(--success-light)' },
                    'A': { bg: 'var(--success-bg)', color: 'var(--success)', border: 'var(--success-light)' },
                    'B': { bg: 'var(--primary-bg)', color: 'var(--primary)', border: 'var(--primary-light)' },
                    'C': { bg: 'var(--primary-bg)', color: 'var(--primary)', border: 'var(--primary-light)' },
                    'D': { bg: 'var(--warning-bg)', color: 'var(--warning)', border: 'var(--warning-light)' },
                    'F': { bg: 'var(--danger-bg)', color: 'var(--danger)', border: 'var(--danger-light)' },
                  };
                  const currentStyle = gradeStyles[grade] || gradeStyles['F'];

                  return (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '16px', background: 'var(--secondary)', borderRadius: '16px',
                      border: '1px solid var(--border)', transition: 'all 0.3s ease'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: '12px', background: currentStyle.bg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.2rem', fontWeight: 900, color: currentStyle.color,
                          border: `2px solid ${currentStyle.border}`
                        }}>
                          {grade}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--text)', fontSize: '0.95rem', marginBottom: 2 }}>{c.title}</div>
                          {isPassing ? (
                            <div style={{ fontSize: '0.7rem', color: 'var(--success)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>
                              ✅ Verified Graduate
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.7rem', color: 'var(--danger)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>
                              ❌ Performance Below Passing
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          fontSize: '1.4rem', fontWeight: 950,
                          color: c.score >= 80 ? 'var(--success)' : c.score >= 60 ? 'var(--primary)' : 'var(--danger)',
                          letterSpacing: '-0.02em'
                        }}>
                          {c.score}%
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>FINAL GRADE</div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', border: '1px dashed var(--border)', borderRadius: '12px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No completed courses found yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">🔍 Diagnostic Review: Areas for Improvement</h3></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {data.weakAreas.length === 0 ? (
              <div className="alert alert-success">Great job! No weak areas identified.</div>
            ) : (
              data.weakAreas.map((w, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: 'var(--danger-bg)', borderRadius: '16px', border: '1px solid var(--danger)' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#991B1B', fontSize: '0.9rem', marginBottom: 2 }}>{w.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#B91C1C', fontWeight: 500 }}>Performance Diagnostic: Low Accuracy</div>
                  </div>
                  <div style={{ fontWeight: 900, color: 'var(--danger)', fontSize: '1.1rem' }}>{w.accuracy}%</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
