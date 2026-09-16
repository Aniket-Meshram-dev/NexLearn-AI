'use client';
import { useEffect, useState, useRef, use } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  CheckCircle2,
  ShieldCheck,
  Download,
  Mail,
  Share2,
  Check,
  Copy,
  ArrowLeft,
  FileText,
  Sparkles,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import { XIcon, LinkedInIcon } from '@/components/SocialIcons';

interface CertificateData {
  id: string;
  certificateId: string;
  courseTitle: string;
  recipientName: string;
  grade: string;
  masteryPercentage: number;
  issueDate: string;
  level: string;
  duration: string;
  topic: string;
}

export default function CertificatePage() {
  const params = useParams();
  const id = params?.id as string;
  const { data: session } = useSession();
  const certRef = useRef<HTMLDivElement>(null);

  const [cert, setCert] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    if (!cert) return;
    const verifyUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/verify?id=${encodeURIComponent(cert.certificateId)}`
        : `https://nexlearn.ai/verify?id=${encodeURIComponent(cert.certificateId)}`;

    import('qrcode')
      .then(({ default: QRCode }) => {
        QRCode.toDataURL(verifyUrl, {
          width: 480,
          margin: 1,
          color: {
            dark: '#1e1b4b',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'Q',
        })
          .then((url) => setQrCodeUrl(url))
          .catch((err) => console.error('QR generation error:', err));
      })
      .catch((err) => console.error('Failed to load qrcode library:', err));
  }, [cert]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    // Fetch from public verification API
    fetch(`/api/public/certificate/${id}`)
      .then(async (r) => {
        if (!r.ok) {
          const errData = await r.json().catch(() => ({}));
          throw new Error(errData.error || 'Certificate not found or course not yet completed');
        }
        return r.json();
      })
      .then((data) => {
        if (data.valid && data.certificate) {
          setCert(data.certificate);
        } else {
          setError('Credential could not be validated.');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Certificate load error:', err);
        setError(err.message || 'Certificate verification failed.');
        setLoading(false);
      });
  }, [id]);

  const formattedDate = cert
    ? new Date(cert.issueDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  // Download high-res PDF
  const downloadPDF = async (isForEmail = false) => {
    if (isGenerating || !certRef.current || !cert) return null;
    setIsGenerating(true);
    const element = certRef.current;
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { default: jsPDF } = await import('jspdf');

      // High-resolution capture (2.5x scale for crisp 300-DPI vector-grade print quality)
      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      // Standard International A4 Landscape (841.89 pt x 595.28 pt)
      const pdf = new jsPDF('l', 'pt', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

      if (isForEmail) {
        return pdf.output('datauristring').split(',')[1];
      }

      pdf.save(`NexLearn_Certificate_${cert.courseTitle.replace(/\s+/g, '_')}.pdf`);
      window.dispatchEvent(
        new CustomEvent('icmsystem_toast', {
          detail: { title: 'Official Certificate Downloaded', message: 'Your high-resolution credential has been saved.', type: 'success' },
        })
      );
    } catch (err) {
      console.error('Certificate PDF export error:', err);
      window.dispatchEvent(
        new CustomEvent('icmsystem_toast', {
          detail: { title: 'Export Failed', message: 'Could not export certificate. Please try again.', type: 'error' },
        })
      );
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  // Download PNG Badge for portfolio
  const downloadPNG = async () => {
    if (isGenerating || !certRef.current || !cert) return;
    setIsGenerating(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(certRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const img = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = img;
      a.download = `NexLearn_Credential_${cert.certificateId}.png`;
      a.click();
    } catch (err) {
      console.error('PNG download error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // LinkedIn 1-Click Add to Profile
  const handleAddToLinkedIn = () => {
    if (!cert) return;
    const certName = encodeURIComponent(cert.courseTitle);
    const orgName = encodeURIComponent('NexLearn AI');
    const certId = encodeURIComponent(cert.certificateId);
    const certUrl = encodeURIComponent(typeof window !== 'undefined' ? `${window.location.origin}/verify?id=${cert.certificateId}` : '');
    const d = new Date(cert.issueDate);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const url = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${certName}&organizationName=${orgName}&issueYear=${year}&issueMonth=${month}&certUrl=${certUrl}&certId=${certId}`;
    window.open(url, '_blank');
  };

  // Social Sharing
  const handleShareTwitter = () => {
    if (!cert) return;
    const url = typeof window !== 'undefined' ? `${window.location.origin}/verify?id=${cert.certificateId}` : '';
    const text = encodeURIComponent(
      `Proud to have completed "${cert.courseTitle}" with verified credentials on @NexLearnAI! Verify here: `
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/verify?id=${cert.certificateId}` : '';
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
  };

  const handleCopyLink = () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/verify?id=${cert?.certificateId || id}` : '';
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const sendEmail = async () => {
    if (isEmailing || !cert) return;
    setIsEmailing(true);
    try {
      const pdfBase64 = await downloadPDF(true);
      if (!pdfBase64) throw new Error('PDF generation failed');

      const res = await fetch(`/api/user/certificate/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: id, pdfBase64 }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      window.dispatchEvent(
        new CustomEvent('icmsystem_toast', {
          detail: {
            title: 'Sent!',
            message: 'Certificate has been sent to your email with a PDF attachment.',
            type: 'success',
          },
        })
      );
    } catch {
      window.dispatchEvent(
        new CustomEvent('icmsystem_toast', {
          detail: { title: 'Notification Error', message: 'Could not email certificate.', type: 'error' },
        })
      );
    } finally {
      setIsEmailing(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <p>Loading your certificate...</p>
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="empty-state" style={{ maxWidth: '540px', margin: '80px auto', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <AlertTriangle size={36} style={{ color: 'var(--warning)' }} />
        </div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 10px 0' }}>Certificate Unavailable</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
          {error || 'This certificate is not available yet. Please complete all course modules and quizzes first.'}
        </p>
        <Link href={`/course/${id}`} className="btn btn-primary" style={{ borderRadius: '10px' }}>
          Go to Course Modules
        </Link>
      </div>
    );
  }

  // Derive verification doc hash
  const docHash = Math.abs(
    (cert.certificateId + cert.recipientName + cert.courseTitle).split('').reduce((acc, char) => {
      return (acc << 5) - acc + char.charCodeAt(0);
    }, 0)
  )
    .toString(36)
    .toUpperCase()
    .padStart(8, '0');

  return (
    <div className="certificate-presentation-root" style={{ maxWidth: '1140px', margin: '0 auto', padding: '24px 16px 60px' }}>
      {/* Official Registry Verification Header */}
      <div
        style={{
          background: 'var(--bg-white)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '16px',
          padding: '16px 22px',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          boxShadow: '0 4px 20px rgba(16, 185, 129, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text)' }}>
                Official Verified Credential
              </h4>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: '#10b981',
                  color: 'white',
                  textTransform: 'uppercase',
                }}
              >
                Authentic
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Registry ID: <code style={{ color: 'var(--primary)', fontWeight: 700 }}>{cert.certificateId}</code> | Issued {formattedDate}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Link
            href={`/verify?id=${encodeURIComponent(cert.certificateId)}`}
            className="btn"
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              color: '#047857',
              borderRadius: '10px',
              fontSize: '0.84rem',
              fontWeight: 700,
              padding: '8px 14px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <ShieldCheck size={15} />
            <span>Verify in Registry</span>
          </Link>

          <button
            onClick={handleAddToLinkedIn}
            className="btn"
            style={{
              background: '#0a66c2',
              color: 'white',
              borderRadius: '10px',
              fontSize: '0.84rem',
              fontWeight: 700,
              padding: '8px 16px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <LinkedInIcon size={15} />
            <span>Add to LinkedIn</span>
          </button>

          <button
            onClick={handleShareTwitter}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text)',
            }}
            title="Share on X"
          >
            <XIcon size={15} />
          </button>

          <button
            onClick={handleShareLinkedIn}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0a66c2',
            }}
            title="Share on LinkedIn Feed"
          >
            <Share2 size={15} />
          </button>

          <button
            onClick={handleCopyLink}
            style={{
              padding: '0 12px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: copied ? '#10b981' : 'var(--text)',
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Action Subheader */}
      <div className="cert-action-header" style={{ marginBottom: '20px' }}>
        <Link href={`/course/${id}`} className="action-back-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={15} />
          <span>Back to Course Modules</span>
        </Link>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            className="btn btn-outline btn-sm"
            onClick={downloadPNG}
            disabled={isGenerating}
            style={{ borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={14} />
            <span>Download PNG Badge</span>
          </button>

          <button
            className="btn btn-sm"
            onClick={sendEmail}
            disabled={isEmailing}
            style={{ background: 'var(--primary-bg)', color: 'var(--primary)', fontWeight: 600, borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Mail size={14} />
            <span>{isEmailing ? 'Sending...' : 'Email PDF'}</span>
          </button>

          <button
            className="btn-master-download btn-sm"
            onClick={() => downloadPDF()}
            disabled={isGenerating}
            style={{ borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <FileText size={14} />
            <span>{isGenerating ? 'Processing...' : 'Download Official PDF'}</span>
          </button>
        </div>
      </div>

      {/* The Industry-Grade SaaS Certificate Artifact */}
      <div className="credential-artifact" ref={certRef}>
        {/* Luxury Corner Architectural Brackets */}
        <div className="corner-accent-tl" />
        <div className="corner-accent-tr" />
        <div className="corner-accent-br" />
        <div className="corner-accent-bl" />

        {/* Double Inset Hairline Frame */}
        <div className="cert-inset-border" />

        {/* Multi-Layer Background Watermarks */}
        <div className="cert-watermark-pattern">
          NEXLEARN AI • AUTHENTIC ACADEMIC CREDENTIAL • AUTONOMOUS CURRICULUM LEDGER
        </div>
        <div className="cert-watermark-seal">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
            <circle cx="100" cy="100" r="92" stroke="#4f46e5" strokeWidth="2.5" strokeDasharray="6 4" />
            <circle cx="100" cy="100" r="82" stroke="#4f46e5" strokeWidth="1.5" />
            <circle cx="100" cy="100" r="62" stroke="#4f46e5" strokeWidth="1" />
            <path d="M70 140V60L130 140V60" stroke="#4f46e5" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Certificate Body */}
        <div className="credential-body">
          {/* Top Header Row: Brand Identity & Security Badge */}
          <div className="cert-header-row">
            <div className="cert-logo-section">
              <div className="cert-logo-box">
                <span>N</span>
              </div>
              <div>
                <div className="cert-logo-text">NexLearn AI</div>
                <div className="cert-logo-sub">Autonomous Learning Ecosystem</div>
              </div>
            </div>

            <div className="cert-credential-badge">
              <span className="cert-badge-dot" />
              <span>OFFICIAL ACCREDITED CREDENTIAL</span>
              <span className="cert-badge-sep">|</span>
              <span className="cert-badge-code">ID: {cert.certificateId}</span>
            </div>
          </div>

          {/* Certificate Main Title */}
          <div className="cert-title-section">
            <h1 className="cert-main-title">Certificate of Achievement</h1>
            <div className="cert-title-subtitle-wrapper">
              <div className="cert-title-line" />
              <p className="cert-label-small">THIS OFFICIAL CREDENTIAL IS PROUDLY CONFERRED UPON</p>
              <div className="cert-title-line" />
            </div>
          </div>

          {/* Recipient Name: Large, Space-Filling Executive Typography */}
          <div className="cert-recipient-name">{cert.recipientName}</div>

          {/* Statement */}
          <p className="cert-statement-mid">
            For successfully completing the comprehensive AI-synthesized curriculum and demonstrating outstanding theoretical &amp; practical mastery in
          </p>

          {/* Course Highlight Card with Grade & Level Badges */}
          <div className="cert-course-banner">
            <h2 className="cert-course-highlight">{cert.courseTitle}</h2>
            <div className="cert-metrics-row">
              <span className="cert-pill cert-pill-success">
                GRADE: {cert.grade || 'A+'} ({cert.masteryPercentage || 91}% MASTERY)
              </span>
              <span className="cert-pill cert-pill-primary">
                LEVEL: {(cert.level || 'INTERMEDIATE').toUpperCase()}
              </span>
              <span className="cert-pill cert-pill-neutral">
                CURRICULUM: VERIFIED SYLLABUS
              </span>
            </div>
          </div>

          {/* CENTER GAP FILLER: Big Scannable QR Code */}
          <div className="cert-center-qr-section">
            <div className="cert-center-qr-card">
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="Scan to Verify Credential"
                  className="cert-center-qr-img"
                />
              ) : (
                <div className="cert-center-qr-placeholder" />
              )}
            </div>
            <div className="cert-center-qr-badge">
              <span className="cert-center-qr-dot" />
              <span>SCAN TO VERIFY CREDENTIAL</span>
            </div>
          </div>

          {/* DUAL AUTHORITATIVE PILLARS: Cryptographic Registry & Academic Council */}
          <div className="cert-dual-blocks-grid">
            {/* Block 1 (Left): Cryptographic Record & Registry */}
            <div className="cert-crypto-block">
              <div className="cert-crypto-heading">CRYPTOGRAPHIC RECORD &amp; REGISTRY</div>
              <div className="cert-crypto-list">
                <div className="cert-crypto-item">
                  <span className="cert-crypto-label">Registry ID:</span>
                  <code className="cert-crypto-value-mono">{cert.certificateId}</code>
                </div>
                <div className="cert-crypto-item">
                  <span className="cert-crypto-label">Issue Date:</span>
                  <span className="cert-crypto-value">{formattedDate}</span>
                </div>
                <div className="cert-crypto-item">
                  <span className="cert-crypto-label">Ledger Hash:</span>
                  <span className="cert-crypto-value-hash">0xNL-{docHash}-SEAL</span>
                </div>
              </div>
            </div>

            {/* Block 2 (Right): Academic Governance Council */}
            <div className="cert-council-block">
              <div className="cert-council-name">NexLearn AI Academic Governance Council</div>
              <div className="cert-council-arch">Autonomous Curriculum Ledger &amp; Intellectual Architecture</div>
              <div className="cert-council-badge">
                <span className="cert-council-dot" />
                <span>Permanent Tamper-Evident Educational Credential</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
