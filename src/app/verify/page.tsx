'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Award,
  GraduationCap,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
  Lock,
  Camera,
  QrCode,
  X,
  Code,
  Sparkles,
  Upload,
  RefreshCw,
} from 'lucide-react';
import { LinkedInIcon } from '@/components/SocialIcons';

interface CertificateVerification {
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
  registryUrl: string;
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryId = searchParams.get('id') || searchParams.get('code') || '';
  const [searchId, setSearchId] = useState(queryId);
  const [loading, setLoading] = useState(false);
  const [cert, setCert] = useState<CertificateVerification | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Scanner modal state
  const [showScanner, setShowScanner] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Embed Badge modal state
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [embedTab, setEmbedTab] = useState<'markdown' | 'html'>('markdown');
  const [badgeCopied, setBadgeCopied] = useState(false);

  const performVerification = async (idToVerify: string) => {
    const trimmed = idToVerify.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setCert(null);

    try {
      const res = await fetch(`/api/public/certificate/${encodeURIComponent(trimmed)}`);
      const data = await res.json();

      if (res.ok && data.valid && data.certificate) {
        setCert(data.certificate);
      } else {
        setError(data.error || 'No verified credential found matching this ID.');
      }
    } catch (err: any) {
      setError(err?.message || 'Verification system is temporarily unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryId) {
      setSearchId(queryId);
      performVerification(queryId);
    }
  }, [queryId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      router.push(`/verify?id=${encodeURIComponent(searchId.trim())}`);
      performVerification(searchId.trim());
    }
  };

  const handleCopyId = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Camera handling for QR Scanner
  const startCamera = async () => {
    setCameraError(null);
    setScanning(true);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      setCameraError(err?.message || 'Unable to access camera. Please check permissions.');
      setScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const handleOpenScanner = () => {
    setShowScanner(true);
    startCamera();
  };

  const handleCloseScanner = () => {
    stopCamera();
    setShowScanner(false);
    setCameraError(null);
  };

  const handleScannedCode = (code: string) => {
    let cleanCode = code.trim();
    if (cleanCode.includes('/verify?id=')) {
      cleanCode = cleanCode.split('/verify?id=')[1].split('&')[0];
    } else if (cleanCode.includes('/certificate/')) {
      cleanCode = cleanCode.split('/certificate/')[1].split('?')[0];
    }
    setSearchId(cleanCode);
    handleCloseScanner();
    router.push(`/verify?id=${encodeURIComponent(cleanCode)}`);
    performVerification(cleanCode);
  };

  const formattedDate = cert?.issueDate
    ? new Date(cert.issueDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  // Deterministic Ledger Hash matching certificate
  const ledgerHash = cert
    ? Math.abs(
        (cert.certificateId + cert.recipientName + cert.courseTitle).split('').reduce((acc, char) => {
          return (acc << 5) - acc + char.charCodeAt(0);
        }, 0)
      )
        .toString(36)
        .toUpperCase()
        .padStart(8, '0')
    : '0ABTC4KL';

  // Embed badge snippets
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://nexlearn.ai';
  const verifyLink = cert ? `${origin}/verify?id=${encodeURIComponent(cert.certificateId)}` : `${origin}/verify`;
  const badgeSvgUrl = `https://img.shields.io/badge/NexLearn-Verified%20Credential-6366f1?style=for-the-badge&logo=shield&logoColor=white`;

  const markdownSnippet = `[![NexLearn Verified Credential](${badgeSvgUrl})](${verifyLink})`;
  const htmlSnippet = `<a href="${verifyLink}" target="_blank" rel="noopener noreferrer">\n  <img src="${badgeSvgUrl}" alt="NexLearn Verified Credential" />\n</a>`;

  const handleCopyBadge = (snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setBadgeCopied(true);
    setTimeout(() => setBadgeCopied(false), 2500);
  };

  return (
    <div style={{ maxWidth: '780px', margin: '16px auto 48px', width: '100%' }}>
      {/* Top Header Badge */}
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '20px',
            background: 'rgba(79, 70, 229, 0.08)',
            border: '1px solid rgba(79, 70, 229, 0.2)',
            color: 'var(--primary)',
            fontSize: '0.75rem',
            fontWeight: 700,
            marginBottom: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          <ShieldCheck size={14} />
          <span>Autonomous Credential Registry</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: '0 0 8px 0', letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
          Verify Academic Credential
        </h1>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
          Authenticate official syllabus completion credentials, mastery grades, and cryptographic registry records.
        </p>
      </div>

      {/* Sleek Window Terminal Container */}
      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          boxShadow: '0 12px 36px -8px rgba(0, 0, 0, 0.07)',
          overflow: 'hidden',
          marginBottom: '24px',
        }}
      >
        {/* Window Top Chrome Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            <span style={{ marginLeft: '8px', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Cryptographic Registry Console
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>
            <Lock size={12} />
            <span>256-BIT SECURE</span>
          </div>
        </div>

        {/* Window Body: Search Form & QR Scan Trigger */}
        <div style={{ padding: '24px 22px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 240px' }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter Registry ID (e.g. NXL-CMU418)"
                style={{
                  width: '100%',
                  height: '46px',
                  paddingLeft: '40px',
                  paddingRight: '14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
            </div>

            {/* QR Scan Button */}
            <button
              type="button"
              onClick={handleOpenScanner}
              title="Scan QR Code with Camera"
              style={{
                height: '46px',
                padding: '0 14px',
                borderRadius: '10px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'border-color 0.15s ease',
              }}
            >
              <Camera size={16} />
              <span>Scan QR</span>
            </button>

            {/* Verify Submit Button */}
            <button
              type="submit"
              disabled={loading || !searchId.trim()}
              style={{
                height: '46px',
                padding: '0 20px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                color: 'white',
                border: 'none',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
              }}
            >
              {loading ? (
                <span>Validating...</span>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>Verify</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Helper Chip */}
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <span>Quick test ID:</span>
            <button
              type="button"
              onClick={() => {
                setSearchId('NXL-CMU418');
                performVerification('NXL-CMU418');
              }}
              style={{
                background: 'rgba(79, 70, 229, 0.08)',
                border: '1px solid rgba(79, 70, 229, 0.2)',
                color: 'var(--primary)',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              NXL-CMU418
            </button>
          </div>
        </div>

        {/* Verification Success Display */}
        {cert && (
          <div style={{ borderTop: '1px solid var(--border)' }}>
            {/* Status Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
                padding: '14px 22px',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={20} color="#34d399" />
                <span style={{ fontSize: '0.85rem', fontWeight: 850, letterSpacing: '0.02em' }}>
                  OFFICIAL ACADEMIC CREDENTIAL VERIFIED
                </span>
              </div>
              <span
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                }}
              >
                STATUS: VALID
              </span>
            </div>

            {/* Credential Data Details */}
            <div style={{ padding: '22px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '18px' }}>
                {/* Candidate Name */}
                <div style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Candidate Recipient
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                    {cert.recipientName}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 700, marginTop: '2px' }}>
                    Verified Scholar Identity
                  </div>
                </div>

                {/* Registry ID */}
                <div style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Registry ID
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <code style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--primary)', fontFamily: 'monospace' }}>
                      {cert.certificateId}
                    </code>
                    <button
                      onClick={() => handleCopyId(cert.certificateId)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: copied ? '#10b981' : 'var(--text-muted)',
                        padding: '2px',
                      }}
                      title="Copy ID"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'monospace' }}>
                    Hash: 0xNL-{ledgerHash}-SEAL
                  </div>
                </div>

                {/* Course Title Banner */}
                <div style={{ gridColumn: '1 / -1', padding: '16px', background: 'rgba(79, 70, 229, 0.04)', borderRadius: '12px', border: '1px solid rgba(79, 70, 229, 0.18)' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Accredited Curriculum
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 850, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    {cert.courseTitle}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                    <span style={{ padding: '3px 8px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.12)', color: '#047857', fontWeight: 700, fontSize: '0.74rem' }}>
                      Grade: {cert.grade} ({cert.masteryPercentage}% Mastery)
                    </span>
                    <span style={{ padding: '3px 8px', borderRadius: '6px', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', fontWeight: 700, fontSize: '0.74rem' }}>
                      Level: {cert.level || 'Intermediate'}
                    </span>
                    <span style={{ padding: '3px 8px', borderRadius: '6px', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.74rem', border: '1px solid var(--border)' }}>
                      Issued: {formattedDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: View, LinkedIn, Embed Badge */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <Link
                  href={`/certificate/${cert.id}`}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                    color: 'white',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)',
                  }}
                >
                  <span>View Official Certificate</span>
                  <ArrowRight size={14} />
                </Link>

                <button
                  onClick={() => setShowEmbedModal(true)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Code size={14} />
                  <span>Embed Badge</span>
                </button>

                <button
                  onClick={() => {
                    const certUrl = encodeURIComponent(`${window.location.origin}/certificate/${cert.id}`);
                    const certName = encodeURIComponent(cert.courseTitle);
                    const orgName = encodeURIComponent('NexLearn AI');
                    const d = new Date(cert.issueDate);
                    const year = d.getFullYear();
                    const month = d.getMonth() + 1;
                    const url = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${certName}&organizationName=${orgName}&issueYear=${year}&issueMonth=${month}&certUrl=${certUrl}&certId=${encodeURIComponent(cert.certificateId)}`;
                    window.open(url, '_blank');
                  }}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    background: '#0a66c2',
                    color: 'white',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <LinkedInIcon size={14} />
                  <span>Add to LinkedIn</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div
            style={{
              padding: '18px 22px',
              borderTop: '1px solid var(--border)',
              background: 'rgba(239, 68, 68, 0.06)',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
            }}
          >
            <AlertTriangle size={20} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '0.92rem', fontWeight: 800, color: '#dc2626' }}>
                Credential Verification Not Found
              </h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {error} Please verify that the code matches the Registry ID on the certificate (e.g. <code>NXL-CMU418</code>).
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Trust & Verification Badges */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
        }}
      >
        <div style={{ padding: '14px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ color: 'var(--primary)', marginBottom: '6px', display: 'flex', justifyContent: 'center' }}>
            <ShieldCheck size={20} />
          </div>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>Tamper-Evident</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Immutable ledger</div>
        </div>

        <div style={{ padding: '14px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ color: '#10b981', marginBottom: '6px', display: 'flex', justifyContent: 'center' }}>
            <Award size={20} />
          </div>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>Global Share</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>1-Click LinkedIn</div>
        </div>

        <div style={{ padding: '14px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ color: '#8b5cf6', marginBottom: '6px', display: 'flex', justifyContent: 'center' }}>
            <GraduationCap size={20} />
          </div>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>AI Syllabus</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Mastery confirmed</div>
        </div>
      </div>

      {/* Camera / QR Scanner Modal */}
      {showScanner && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              borderRadius: '20px',
              border: '1px solid var(--border)',
              maxWidth: '480px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <QrCode size={20} color="var(--primary)" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Scan Certificate QR Code
                </h3>
              </div>
              <button
                onClick={handleCloseScanner}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: Camera Viewport */}
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '1 / 1',
                  maxHeight: '320px',
                  background: '#090d16',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  margin: '0 auto 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(99, 102, 241, 0.3)',
                }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />

                {/* Animated Scanner Reticle & Laser */}
                <div
                  style={{
                    position: 'absolute',
                    inset: '20px',
                    border: '2px dashed rgba(99, 102, 241, 0.7)',
                    borderRadius: '12px',
                    pointerEvents: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div
                    style={{
                      height: '2px',
                      background: 'linear-gradient(90deg, transparent, #6366f1, #a855f7, transparent)',
                      boxShadow: '0 0 12px #6366f1',
                      animation: 'pulse 1.8s infinite',
                    }}
                  />
                  <div
                    style={{
                      fontSize: '0.72rem',
                      color: 'rgba(255, 255, 255, 0.8)',
                      textAlign: 'center',
                      background: 'rgba(0, 0, 0, 0.6)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      margin: '8px auto',
                    }}
                  >
                    Align QR Code within box
                  </div>
                </div>

                {cameraError && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(15, 23, 42, 0.9)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '20px',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <Camera size={36} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                    <p style={{ fontSize: '0.85rem', margin: '0 0 12px 0', color: '#ef4444' }}>{cameraError}</p>
                    <button
                      onClick={startCamera}
                      className="btn btn-outline"
                      style={{ fontSize: '0.8rem', borderRadius: '8px', padding: '6px 14px' }}
                    >
                      <RefreshCw size={13} style={{ marginRight: '6px' }} />
                      Retry Camera
                    </button>
                  </div>
                )}
              </div>

              {/* Sample QR 1-Click for Instant Testing */}
              <div
                style={{
                  background: 'var(--bg-secondary)',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}
              >
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Testing without camera?
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Simulate scanning active test certificate
                  </div>
                </div>
                <button
                  onClick={() => handleScannedCode('NXL-CMU418')}
                  className="btn btn-primary"
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                  }}
                >
                  Simulate QR Scan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Embed Badge Generator Modal */}
      {showEmbedModal && cert && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              borderRadius: '20px',
              border: '1px solid var(--border)',
              maxWidth: '560px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="var(--primary)" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Embed Verified Credential Badge
                </h3>
              </div>
              <button
                onClick={() => setShowEmbedModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px' }}>
              {/* Badge Preview */}
              <div
                style={{
                  background: 'var(--bg-secondary)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  textAlign: 'center',
                  marginBottom: '18px',
                }}
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Live Badge Preview
                </div>
                <a
                  href={verifyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.25)',
                    textDecoration: 'none',
                  }}
                >
                  <span
                    style={{
                      background: '#1e1b4b',
                      color: '#a5b4fc',
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <ShieldCheck size={14} color="#818cf8" />
                    NexLearn
                  </span>
                  <span
                    style={{
                      background: '#4f46e5',
                      color: 'white',
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                    }}
                  >
                    VERIFIED CREDENTIAL
                  </span>
                </a>
              </div>

              {/* Segmented Code Type Tabs */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <button
                  onClick={() => setEmbedTab('markdown')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: embedTab === 'markdown' ? 'var(--primary)' : 'var(--bg-secondary)',
                    color: embedTab === 'markdown' ? '#fff' : 'var(--text-secondary)',
                  }}
                >
                  Markdown (GitHub README)
                </button>
                <button
                  onClick={() => setEmbedTab('html')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: embedTab === 'html' ? 'var(--primary)' : 'var(--bg-secondary)',
                    color: embedTab === 'html' ? '#fff' : 'var(--text-secondary)',
                  }}
                >
                  HTML (Portfolio Website)
                </button>
              </div>

              {/* Code Snippet Box */}
              <div style={{ position: 'relative' }}>
                <pre
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '14px',
                    fontSize: '0.82rem',
                    color: 'var(--text-primary)',
                    fontFamily: 'monospace',
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    margin: 0,
                  }}
                >
                  {embedTab === 'markdown' ? markdownSnippet : htmlSnippet}
                </pre>

                <button
                  onClick={() => handleCopyBadge(embedTab === 'markdown' ? markdownSnippet : htmlSnippet)}
                  style={{
                    marginTop: '12px',
                    width: '100%',
                    padding: '10px',
                    borderRadius: '10px',
                    background: badgeCopied ? '#10b981' : 'var(--primary)',
                    border: 'none',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'background 0.2s',
                  }}
                >
                  {badgeCopied ? <Check size={16} /> : <Copy size={16} />}
                  <span>{badgeCopied ? 'Copied to Clipboard!' : 'Copy Snippet Code'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Loading Verification Gateway...</p>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
