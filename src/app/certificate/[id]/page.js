'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function CertificatePage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const certRef = useRef(null);
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;

  useEffect(() => {
    fetch(`/api/courses/${id}`).then(r => r.json()).then(d => {
      if (d.course) setCourseData(d.course);
      setLoading(false);

      if (searchParams && searchParams.get('autoSend') === 'true' && d.course && d.course.completed) {
        // Delay slightly to ensure fonts/images are ready
        setTimeout(() => {
          sendEmail(true);
        }, 1500);
      }
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="loading-page">
      <div className="spinner" />
      <p>Verifying achievement...</p>
    </div>
  );

  const course = courseData;

  if (!course || !course.completed) {
    return (
      <div className="empty-state">
        <div className="empty-icon">⚠️</div>
        <h3>Certificate Unavailable</h3>
        <p style={{ color: "var(--danger)" }}>To generate certificate, complete all quizzes first.</p>
        <Link href={`/course/${id}`} className="btn btn-primary">Return to Course</Link>
      </div>
    );
  }

  const certId = course.certificateId || `ICD-${Math.floor(100000 + Math.random() * 900000)}-${course.id.substring(0, 4).toUpperCase()}`;
  const issueDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });

  const downloadPDF = async (isForEmail = false) => {
    if (isGenerating) return null;
    setIsGenerating(true);
    const element = certRef.current;
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { default: jsPDF } = await import('jspdf');

      const canvas = await html2canvas(element, { scale: 1.5, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/jpeg', 0.82);
      const pdf = new jsPDF('l', 'px', [canvas.width, canvas.height]);
      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);

      if (isForEmail) {
        const b64 = pdf.output('datauristring').split(',')[1];
        console.log(`[Certificate] PDF Generated for email (JPEG): ${b64.length} chars`);
        return b64;
      }

      pdf.save(`Certificate_${course.title.replace(/\s+/g, '_')}.pdf`);
      window.dispatchEvent(new CustomEvent('icmsystem_toast', {
        detail: { title: 'Success', message: 'Certificate downloaded successfully', type: 'success' }
      }));
    } catch (err) {
      console.error(err);
      window.dispatchEvent(new CustomEvent('icmsystem_toast', {
        detail: { title: 'Error', message: 'Download failed. Try higher resolution.', type: 'error' }
      }));
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const sendEmail = async (isAuto = false) => {
    if (isEmailing) return;
    setIsEmailing(true);
    try {
      // First, generate PDF locally to attach 
      const pdfBase64 = await downloadPDF(true);
      if (!pdfBase64) throw new Error('PDF generation failed');

      const res = await fetch(`/api/user/certificate/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: id, pdfBase64 }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      window.dispatchEvent(new CustomEvent('icmsystem_toast', {
        detail: { 
          title: isAuto ? '🎓 Course Mastered!' : 'Sent!', 
          message: isAuto ? 'Awesome work! Your official certificate has been sent to your email with a PDF attachment.' : 'Certificate has been sent to your email with a PDF attachment.', 
          type: 'success' 
        }
      }));
    } catch (err) {
      window.dispatchEvent(new CustomEvent('icmsystem_toast', {
        detail: { title: 'Notification Error', message: 'The platform could not auto-send your certificate. Please use the button manually.', type: 'error' }
      }));
    } finally {
      setIsEmailing(false);
    }
  };

  return (
    <div className="certificate-presentation-root">
      {/* Action Header */}
      <div className="cert-action-header">
        <Link href="/dashboard" className="action-back-link">
          ← Back to Dashboard
        </Link>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn" onClick={sendEmail} disabled={isEmailing} style={{ background: 'var(--primary-bg)', color: 'var(--primary)', fontWeight: 600 }}>
            {isEmailing ? 'Sending...' : '✉️ Send to Email'}
          </button>
          <button className="btn-master-download" onClick={downloadPDF} disabled={isGenerating}>
            {isGenerating ? 'Processing...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* The Certificate Artifact */}
      <div className="credential-artifact" ref={certRef}>
        {/* Decorative Corner Accents */}
        <div className="corner-accent-tl"></div>
        <div className="corner-accent-br"></div>
        <div className="corner-line-tr"></div>
        <div className="corner-line-bl"></div>

        <div className="credential-body">
          {/* Subtle Watermark Branding */}
          <div className="cert-watermark">ICM</div>
          {/* Logo & Branding */}
          <div className="cert-logo-section">
            <div className="cert-logo-box">ICM</div>
            <div className="cert-logo-text">
              ICM SYSTEM - SMART LEARNING
            </div>
          </div>

          <h1 className="cert-main-title">Certificate of Completion</h1>

          <p className="cert-label-small">Presented to</p>
          <div className="cert-recipient-name">
            {course.userName || session?.user?.name || 'Authorized Scholar'}
          </div>

          <p className="cert-statement-mid">For successfully completing a professional course</p>
          <h2 className="cert-course-highlight">{course.title}</h2>

          {/* Centered Certificate ID */}
          <div className="cert-system-id">CERTIFICATE ID: {certId}</div>

          <div className="cert-footer-info">
            <p className="footer-label">Provided by</p>
            <p className="footer-value">
              ICM SYSTEM - SMART LEARNING
            </p>
            <p className="footer-date">(on {issueDate})</p>
          </div>
        </div>
      </div>
    </div>
  );
}
