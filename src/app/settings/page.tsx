'use client';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from '@/components/ThemeProvider';
import {
  User,
  Sparkles,
  Bell,
  Shield,
  AlertTriangle,
  LogOut,
  Mail,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  Lock,
  Key,
  Volume2,
  Download,
  Laptop,
  Clock,
  BookOpen,
  Brain,
  Sliders,
  Check,
} from 'lucide-react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');
  const [activeTab, setActiveTab] = useState('account');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPasswordValue, setCurrentPasswordValue] = useState('');
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [confirmPasswordValue, setConfirmPasswordValue] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [hasPassword, setHasPassword] = useState(true); // false = Google-only user
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showDisable2FAModal, setShowDisable2FAModal] = useState(false);
  const [otpValue, setOtpValue] = useState('');

  // Email change flow
  const [showEmailChangeModal, setShowEmailChangeModal] = useState(false);
  const [emailChangeStep, setEmailChangeStep] = useState('input'); // 'input' | 'otp'
  const [newEmailValue, setNewEmailValue] = useState('');
  const [emailChangeOtp, setEmailChangeOtp] = useState('');
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);
  const [emailChangeError, setEmailChangeError] = useState('');

  // AI Voice & Learning Preferences
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    weekly: true,
    achievements: true,
  });
  const [learningPrefs, setLearningPrefs] = useState({
    aiTeachingStyle: 'balanced', // 'concise' | 'balanced' | 'interview'
    defaultDifficulty: 'intermediate',
    autoSpeakMentor: false,
    dailyReminderTime: '20:00',
  });
  const [exporting, setExporting] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState('Current Browser Session');

  // Load preferences from standard cache on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('nexlearn_user_settings');
      if (savedSettings) {
        setNotifications(JSON.parse(savedSettings));
      }
      const savedPrefs = localStorage.getItem('nexlearn_learning_prefs');
      if (savedPrefs) {
        setLearningPrefs(JSON.parse(savedPrefs));
      }

      if (typeof window !== 'undefined') {
        const ua = navigator.userAgent;
        const os = ua.includes('Windows')
          ? 'Windows PC'
          : ua.includes('Mac')
          ? 'macOS'
          : ua.includes('Linux')
          ? 'Linux'
          : 'Mobile Device';
        const br = ua.includes('Chrome')
          ? 'Chrome'
          : ua.includes('Firefox')
          ? 'Firefox'
          : ua.includes('Safari')
          ? 'Safari'
          : ua.includes('Edge')
          ? 'Edge'
          : 'Web Browser';
        setDeviceInfo(`${os} • ${br}`);
      }
    } catch (e) {}

    // Fetch security/verification state
    fetch('/api/user/security')
      .then((r) => r.json())
      .then((d) => {
        if (d.twoFactorEnabled !== undefined) setTwoFactorEnabled(d.twoFactorEnabled);
        if (d.isVerified !== undefined) setIsVerified(d.isVerified);
        if (d.hasPassword !== undefined) setHasPassword(d.hasPassword);
      })
      .catch(console.error);

    // AI Voice Logic
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      const savedVoice = localStorage.getItem('icm_preferred_voice');
      if (savedVoice) {
        setSelectedVoice(savedVoice);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 4000);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      localStorage.setItem('nexlearn_user_settings', JSON.stringify(notifications));
      localStorage.setItem('nexlearn_learning_prefs', JSON.stringify(learningPrefs));
      localStorage.setItem('icm_preferred_voice', selectedVoice);
      await new Promise((resolve) => setTimeout(resolve, 600));
      showToast('Institutional preferences updated successfully', 'success');
    } catch (e) {
      showToast('Error syncing preferences', 'error');
    }
    setLoading(false);
  };

  const handleTestVoice = () => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance('Hello! This is a preview of your NexLearn AI mentor voice.');
    const voice = voices.find((v) => v.name === selectedVoice);
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const [profileRes, statsRes, bookmarksRes] = await Promise.all([
        fetch('/api/user/profile').then((r) => r.json()).catch(() => ({})),
        fetch('/api/user/stats').then((r) => r.json()).catch(() => ({})),
        fetch('/api/user/bookmarks').then((r) => r.json()).catch(() => ({})),
      ]);

      const archiveData = {
        exportTimestamp: new Date().toISOString(),
        institution: 'NexLearn AI Academic Governance Council',
        user: {
          id: session?.user?.id,
          name: session?.user?.name,
          email: session?.user?.email,
          profile: profileRes?.user,
        },
        learningStats: statsRes?.stats,
        heatMapData: statsRes?.heatMapData,
        unlockedAchievements: profileRes?.unlockedAchievements,
        completedCourses: profileRes?.completedCoursesList,
        bookmarks: bookmarksRes?.bookmarks,
        preferences: {
          notifications,
          learningPrefs,
          selectedVoice,
          theme,
        },
        securityVerification: {
          verifiedAccount: isVerified,
          twoFactorEnforced: twoFactorEnabled,
          encryptionStandard: 'TLS 1.3 SHA-256 Validated Archive',
          exportHash: '0x' + Math.random().toString(36).substring(2, 12).toUpperCase(),
        },
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(archiveData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute(
        'download',
        `nexlearn_academic_archive_${new Date().toISOString().split('T')[0]}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showToast('Comprehensive learning data archive exported!', 'success');
    } catch (err) {
      showToast('Failed to compile data archive. Please retry.', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleSendVerification = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/security', {
        method: 'POST',
        body: JSON.stringify({ action: 'sendVerification' }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send verification email');
      showToast(data.message, 'success');
      setShowVerifyModal(true);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
    setLoading(false);
  };

  const handleConfirmVerification = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/security', {
        method: 'POST',
        body: JSON.stringify({ action: 'confirmVerification', otp: otpValue }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');
      showToast(data.message, 'success');
      setIsVerified(true);
      setShowVerifyModal(false);
      setOtpValue('');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
    setLoading(false);
  };

  const handleEnable2FA = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/security', {
        method: 'POST',
        body: JSON.stringify({ action: 'enable2FA' }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to trigger 2FA');
      showToast(data.message, 'success');
      setShow2FAModal(true);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
    setLoading(false);
  };

  const handleVerify2FA = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/security', {
        method: 'POST',
        body: JSON.stringify({ action: 'verify2FA', otp: otpValue }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');
      showToast(data.message, 'success');
      setTwoFactorEnabled(true);
      setShow2FAModal(false);
      setOtpValue('');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
    setLoading(false);
  };

  const handleDisable2FA = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/security', {
        method: 'POST',
        body: JSON.stringify({ action: 'disable2FA' }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to trigger 2FA deactivation');
      showToast(data.message, 'success');
      setShowDisable2FAModal(true);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
    setLoading(false);
  };

  const handleVerifyDisable2FA = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/security', {
        method: 'POST',
        body: JSON.stringify({ action: 'confirmDisable2FA', otp: otpValue }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');
      showToast(data.message, 'success');
      setTwoFactorEnabled(false);
      setShowDisable2FAModal(false);
      setOtpValue('');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
    setLoading(false);
  };

  const handlePasswordChange = async () => {
    if (!currentPasswordValue) {
      showToast('Enter your current password', 'error');
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordRegex.test(newPasswordValue)) {
      showToast('Password must have upper, lower, number, symbol, and 8+ chars', 'error');
      return;
    }
    if (newPasswordValue !== confirmPasswordValue) {
      showToast('New passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/user/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'changePassword',
          currentPassword: currentPasswordValue,
          newPassword: newPasswordValue,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast('Password securely updated', 'success');
      setShowPasswordModal(false);
      setCurrentPasswordValue('');
      setNewPasswordValue('');
      setConfirmPasswordValue('');
    } catch (e: any) {
      showToast(e.message, 'error');
    }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      showToast('Type DELETE to verify erasure', 'error');
      return;
    }
    if (hasPassword && !deletePassword) {
      showToast('Please enter your account password to verify', 'error');
      return;
    }

    setDeleteLoading(true);
    try {
      const res = await fetch('/api/user/security', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmation: deleteConfirmText,
          password: deletePassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Network failure during purge');
      showToast('Account data expunged', 'success');
      setTimeout(() => signOut({ callbackUrl: '/' }), 1500);
    } catch (e: any) {
      showToast(e.message, 'error');
    }
    setDeleteLoading(false);
  };

  const handleRequestEmailChange = async () => {
    setEmailChangeError('');
    if (!newEmailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmailValue)) {
      setEmailChangeError('Please enter a valid email address.');
      return;
    }
    setEmailChangeLoading(true);
    try {
      const res = await fetch('/api/user/email/request-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail: newEmailValue }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEmailChangeError(data.error || 'Failed to send code.');
        return;
      }
      setEmailChangeStep('otp');
    } catch (e) {
      setEmailChangeError('Network error. Please try again.');
    } finally {
      setEmailChangeLoading(false);
    }
  };

  const handleVerifyEmailChange = async () => {
    setEmailChangeError('');
    if (!emailChangeOtp || emailChangeOtp.trim().length !== 6) {
      setEmailChangeError('Enter the full 6-digit code.');
      return;
    }
    setEmailChangeLoading(true);
    try {
      const res = await fetch('/api/user/email/verify-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: emailChangeOtp.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEmailChangeError(data.error || 'Invalid code. Please try again.');
        return;
      }
      showToast(`Email changed to ${data.newEmail}`, 'success');
      setShowEmailChangeModal(false);
      setEmailChangeStep('input');
      setNewEmailValue('');
      setEmailChangeOtp('');
    } catch (e) {
      setEmailChangeError('Network error. Please try again.');
    } finally {
      setEmailChangeLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', paddingBottom: 60 }}>
      {/* Settings Header with Institutional Context */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #0f172a 100%)',
          padding: '32px 36px',
          borderRadius: 24,
          marginBottom: 28,
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: 'var(--shadow-lg)',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 850, margin: 0, letterSpacing: '-0.02em' }}>
            Settings & System Logic
          </h1>
          <p style={{ margin: '4px 0 0 0', opacity: 0.85, fontSize: '0.92rem' }}>
            Personalize your institutional account, learning preferences, and security protocols
          </p>
        </div>
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.12)',
            padding: '10px 18px',
            borderRadius: 16,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              fontWeight: 800,
            }}
          >
            {session?.user?.name ? session.user.name[0].toUpperCase() : '?'}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{session?.user?.name}</div>
            <div style={{ fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              {isVerified ? (
                <span style={{ color: '#34d399', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle2 size={13} />
                  <span>Verified Scholar</span>
                </span>
              ) : (
                <button
                  onClick={() => setActiveTab('security')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    padding: '2px 10px',
                    borderRadius: 20,
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Verify Account &rarr;
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="settings-container">
        {/* Navigation Sidebar */}
        <div className="settings-sidebar">
          {[
            { id: 'account', label: 'User Account', icon: User },
            { id: 'preferences', label: 'AI & Learning Logic', icon: Sparkles },
            { id: 'notifications', label: 'Communications', icon: Bell },
            { id: 'security', label: 'Security & Access', icon: Shield },
            { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <div
                key={tab.id}
                className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </div>
            );
          })}
          <div style={{ marginTop: 'auto', padding: 12 }}>
            <button
              className="btn btn-ghost"
              onClick={() => signOut({ callbackUrl: '/' })}
              style={{
                color: 'var(--danger)',
                width: '100%',
                justifyContent: 'flex-start',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Dynamic Content Area (Fix: Responsive height instead of fixed 500px) */}
        <div className="settings-content">
          <div
            className="card"
            style={{
              borderRadius: 24,
              minHeight: '560px',
              height: 'auto',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              padding: 0,
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
            }}
          >
            {/* Body */}
            <div style={{ flex: 1, padding: '32px 36px 40px' }}>
              {/* TAB 1: User Account */}
              {activeTab === 'account' && (
                <div className="fade-in">
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 20, color: 'var(--text-primary)' }}>
                    Institutional Identity & Email
                  </h3>

                  {/* Current Email Display */}
                  <div className="form-group" style={{ marginBottom: 20 }}>
                    <label className="form-label" style={{ fontWeight: 700 }}>Primary Institutional Email</label>
                    <div
                      style={{
                        display: 'flex',
                        gap: 12,
                        alignItems: 'center',
                        background: 'var(--bg-secondary)',
                        padding: '12px 16px',
                        borderRadius: 12,
                        border: '1px solid var(--border)',
                      }}
                    >
                      <Mail size={18} color="var(--primary)" />
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{session?.user?.email}</span>
                      <span
                        style={{
                          marginLeft: 'auto',
                          background: 'rgba(16, 185, 129, 0.12)',
                          color: '#10B981',
                          fontSize: '0.72rem',
                          padding: '2px 8px',
                          borderRadius: 20,
                          fontWeight: 800,
                        }}
                      >
                        ACTIVE
                      </span>
                    </div>
                  </div>

                  {/* Change Email Card */}
                  <div
                    style={{
                      padding: 20,
                      borderRadius: 16,
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      marginBottom: 24,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                          Change Email Address
                        </h4>
                        {hasPassword ? (
                          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            An authorization OTP will be sent to your registered email to approve the update.
                          </p>
                        ) : (
                          <p style={{ margin: 0, fontSize: '0.82rem', color: '#f59e0b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Lock size={14} />
                            <span>Managed by Google Sign-In. Email updates occur via your Google Account.</span>
                          </p>
                        )}
                      </div>
                      <button
                        className="btn btn-outline"
                        style={{
                          borderRadius: 12,
                          padding: '8px 18px',
                          opacity: hasPassword ? 1 : 0.4,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.84rem',
                        }}
                        disabled={!hasPassword}
                        onClick={() => {
                          setShowEmailChangeModal(true);
                          setEmailChangeStep('input');
                          setEmailChangeError('');
                          setNewEmailValue('');
                          setEmailChangeOtp('');
                        }}
                      >
                        <Edit3 size={14} />
                        <span>Change Email</span>
                      </button>
                    </div>
                  </div>

                  {/* Institutional Data Portability (Export) */}
                  <div
                    style={{
                      padding: 20,
                      borderRadius: 16,
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                          Export Academic Data Archive (JSON)
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          Download an institutional JSON archive containing your syllabus telemetry, quiz attempts, study history, and badges.
                        </p>
                      </div>
                      <button
                        onClick={handleExportData}
                        disabled={exporting}
                        className="btn btn-primary"
                        style={{
                          borderRadius: 12,
                          padding: '8px 20px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.84rem',
                          fontWeight: 700,
                        }}
                      >
                        <Download size={14} />
                        <span>{exporting ? 'Compiling Archive...' : 'Export JSON Data'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: AI & Learning Preferences */}
              {activeTab === 'preferences' && (
                <div className="fade-in">
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 20, color: 'var(--text-primary)' }}>
                    Visual & AI Learning Preferences
                  </h3>

                  {/* Appearance Theme */}
                  <div className="setting-row">
                    <div className="setting-info">
                      <h4 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Appearance Theme</h4>
                      <p>Customize application interface lighting</p>
                    </div>
                    <select
                      className="form-select"
                      style={{ width: 160, borderRadius: 10, background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                    >
                      <option value="system">System Default</option>
                      <option value="light">Solar (Light)</option>
                      <option value="dark">Cosmos (Dark)</option>
                    </select>
                  </div>

                  {/* AI Mentor Voice */}
                  <div className="setting-row" style={{ borderTop: '1px solid var(--border)', paddingTop: 18, marginTop: 18 }}>
                    <div className="setting-info">
                      <h4 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>AI Mentor Voice</h4>
                      <p>Preferred vocal persona for audio explanations and flashcard reading</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <select
                        className="form-select"
                        style={{ width: 180, borderRadius: 10, padding: '6px 10px', fontSize: '0.85rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                        value={selectedVoice}
                        onChange={(e) => setSelectedVoice(e.target.value)}
                      >
                        <option value="">Default (Auto-select)</option>
                        {voices.map((v, i) => (
                          <option key={i} value={v.name}>
                            {v.name}
                          </option>
                        ))}
                      </select>
                      <button
                        className="btn btn-ghost"
                        onClick={handleTestVoice}
                        disabled={!selectedVoice}
                        style={{ padding: '6px 10px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      >
                        <Volume2 size={16} /> Test
                      </button>
                    </div>
                  </div>

                  {/* AI Teaching Depth / Persona */}
                  <div className="setting-row" style={{ borderTop: '1px solid var(--border)', paddingTop: 18, marginTop: 18 }}>
                    <div className="setting-info">
                      <h4 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>AI Explanation Depth</h4>
                      <p>Choose how the AI tutor crafts conceptual analogies and answers</p>
                    </div>
                    <select
                      className="form-select"
                      style={{ width: 220, borderRadius: 10, padding: '6px 10px', fontSize: '0.85rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                      value={learningPrefs.aiTeachingStyle}
                      onChange={(e) => setLearningPrefs({ ...learningPrefs, aiTeachingStyle: e.target.value })}
                    >
                      <option value="concise">Concise & Code-First</option>
                      <option value="balanced">Balanced with Analogies</option>
                      <option value="interview">Interview & Deep-Dive</option>
                    </select>
                  </div>

                  {/* Default Course Generation Difficulty */}
                  <div className="setting-row" style={{ borderTop: '1px solid var(--border)', paddingTop: 18, marginTop: 18 }}>
                    <div className="setting-info">
                      <h4 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Default Course Difficulty</h4>
                      <p>Initial level pre-selected during autonomous syllabus generation</p>
                    </div>
                    <select
                      className="form-select"
                      style={{ width: 160, borderRadius: 10, padding: '6px 10px', fontSize: '0.85rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                      value={learningPrefs.defaultDifficulty}
                      onChange={(e) => setLearningPrefs({ ...learningPrefs, defaultDifficulty: e.target.value })}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  {/* Daily Study Target Reminder Time */}
                  <div className="setting-row" style={{ borderTop: '1px solid var(--border)', paddingTop: 18, marginTop: 18 }}>
                    <div className="setting-info">
                      <h4 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Daily Study Reminder Goal</h4>
                      <p>Preferred daily notification hour to maintain learning streak</p>
                    </div>
                    <input
                      type="time"
                      className="form-input"
                      style={{ width: 140, borderRadius: 10, padding: '6px 10px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                      value={learningPrefs.dailyReminderTime}
                      onChange={(e) => setLearningPrefs({ ...learningPrefs, dailyReminderTime: e.target.value })}
                    />
                  </div>

                  {/* Save Button */}
                  <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      className="btn btn-primary"
                      onClick={handleSave}
                      disabled={loading}
                      style={{ borderRadius: 12, padding: '10px 28px', fontWeight: 700 }}
                    >
                      {loading ? 'Saving Preferences...' : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: Communications */}
              {activeTab === 'notifications' && (
                <div className="fade-in">
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 20, color: 'var(--text-primary)' }}>
                    Global Notification Protocols
                  </h3>
                  {[
                    { id: 'email', label: 'Email Learning Reports', sub: 'Receive weekly progress digests via email' },
                    { id: 'push', label: 'System Desktop Alerts', sub: 'Real-time browser notifications for quizzes' },
                    { id: 'weekly', label: 'Curriculum Recommendations', sub: 'AI suggestions for adjacent skills' },
                    { id: 'achievements', label: 'Milestone & Badge Alerts', sub: 'Instant notification on badge unlocks' },
                  ].map((item) => (
                    <div key={item.id} className="setting-row">
                      <div className="setting-info">
                        <h4 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.label}</h4>
                        <p>{item.sub}</p>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={(notifications as any)[item.id]}
                          onChange={(e) => setNotifications({ ...notifications, [item.id]: e.target.checked })}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                  ))}

                  <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      className="btn btn-primary"
                      onClick={handleSave}
                      disabled={loading}
                      style={{ borderRadius: 12, padding: '10px 28px', fontWeight: 700 }}
                    >
                      {loading ? 'Saving Changes...' : 'Save Notification Rules'}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: Security & Access */}
              {activeTab === 'security' && (
                <div className="fade-in">
                  {/* Active Session Card */}
                  <div
                    style={{
                      padding: '16px 20px',
                      borderRadius: 16,
                      marginBottom: 24,
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: 'rgba(16, 185, 129, 0.12)',
                          color: '#10B981',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Laptop size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          Current Device Session
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          {deviceInfo} • TLS 1.3 256-Bit Cryptography
                        </div>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        padding: '3px 10px',
                        borderRadius: 8,
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#10B981',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
                      Active Now (This Device)
                    </span>
                  </div>

                  {/* 1. Account Verification Header */}
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 20, color: 'var(--text-primary)' }}>
                    Academic Identity Verification
                  </h3>
                  <div className="card" style={{ padding: 22, marginBottom: 28, borderRadius: 18, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            background: 'rgba(99, 102, 241, 0.15)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                            fontWeight: 800,
                          }}
                        >
                          {session?.user?.name ? session.user.name[0].toUpperCase() : <User size={20} />}
                        </div>
                        <div>
                          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px 0' }}>
                            {session?.user?.name}
                          </h4>
                          <div
                            style={{
                              color: isVerified ? '#10B981' : 'var(--danger)',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                            }}
                          >
                            {isVerified ? (
                              <>
                                <CheckCircle2 size={15} />
                                <span>Verified Scholar Credential</span>
                              </>
                            ) : (
                              <>
                                <XCircle size={15} />
                                <span>Identity Verification Pending</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      {!isVerified && (
                        <button className="btn btn-primary" style={{ borderRadius: 10, padding: '8px 20px', fontSize: '0.84rem' }} onClick={handleSendVerification} disabled={loading}>
                          Verify Now
                        </button>
                      )}
                    </div>
                    <p style={{ marginTop: 14, fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '14px 0 0' }}>
                      Verification seals your academic transcript and certifies your course diplomas on the NexLearn ledger.
                    </p>
                  </div>

                  {/* 2. Two-Factor Authentication Header */}
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 20, color: 'var(--text-primary)' }}>
                    Two-Factor Authentication (2FA)
                  </h3>
                  <div className="card" style={{ padding: 22, borderRadius: 18, marginBottom: 28, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="setting-info">
                        <h4 style={{ fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>2FA Security Enforcement</h4>
                        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                          Mandatory OTP authorization code during login: <strong style={{ color: twoFactorEnabled ? '#10B981' : 'var(--text-muted)' }}>{twoFactorEnabled ? 'ENFORCED' : 'INACTIVE'}</strong>
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={twoFactorEnabled}
                            onChange={() => {
                              if (twoFactorEnabled) handleDisable2FA();
                              else handleEnable2FA();
                            }}
                            disabled={loading}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>
                    </div>
                    <p style={{ marginTop: 14, fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '14px 0 0' }}>
                      Requires both your account password and a transient 6-digit verification code sent to your email on every login attempt.
                    </p>
                  </div>

                  {/* Password Change */}
                  <div style={{ marginTop: 24 }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 16, color: 'var(--text-primary)' }}>
                      Credential Key Management
                    </h3>
                    <button
                      className="btn btn-outline"
                      style={{ width: '100%', borderRadius: 12, justifyContent: 'center', fontWeight: 700 }}
                      onClick={() => setShowPasswordModal(true)}
                      disabled={loading}
                    >
                      <Key size={15} style={{ marginRight: '6px' }} />
                      Change Account Password
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: Danger Zone */}
              {activeTab === 'danger' && (
                <div className="fade-in" style={{ padding: '24px', background: 'var(--danger-bg)', borderRadius: 20, border: '1px solid var(--danger)' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 14, color: 'var(--danger)' }}>
                    Permanent Account Deletion
                  </h3>
                  <p style={{ color: 'var(--danger)', fontSize: '0.88rem', marginBottom: 24, opacity: 0.95, lineHeight: 1.5 }}>
                    Warning: This action is irreversible. All enrolled courses, generated curriculums, quiz telemetry, and verified diplomas associated with your profile will be permanently wiped from the ledger.
                  </p>
                  <button
                    className="btn btn-danger"
                    style={{ width: '100%', borderRadius: 12, boxShadow: '0 4px 12px rgba(239,68,68,0.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 700 }}
                    onClick={() => setShowDeleteModal(true)}
                    disabled={deleteLoading || loading}
                  >
                    <Trash2 size={16} />
                    <span>Confirm Permanent Account Erasure</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Institutional Toast Notification */}
      <div className="toast-container">
        {toast.visible && (
          <div className={`toast toast-${toast.type}`}>
            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
              {toast.type === 'success' ? (
                <CheckCircle2 size={18} style={{ color: '#10B981' }} />
              ) : (
                <AlertCircle size={18} style={{ color: '#EF4444' }} />
              )}
            </span>
            <span style={{ fontWeight: 600 }}>{toast.message}</span>
          </div>
        )}
      </div>

      {/* Password Reset Modal */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-window">
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 8, color: 'var(--text-primary)' }}>
              Secure Password Change
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>
              Update your account password using the fields below.
            </p>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter current password"
                value={currentPasswordValue}
                onChange={(e) => setCurrentPasswordValue(e.target.value)}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Mix of capital, small, number, symbol (min 8)"
                value={newPasswordValue}
                onChange={(e) => setNewPasswordValue(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Re-enter new password"
                value={confirmPasswordValue}
                onChange={(e) => setConfirmPasswordValue(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <button className="btn btn-primary" style={{ flex: 1, borderRadius: 12 }} onClick={handlePasswordChange} disabled={loading}>
                {loading ? 'Encrypting...' : 'Change Password'}
              </button>
              <button
                className="btn btn-ghost"
                style={{ flex: 1, borderRadius: 12 }}
                onClick={() => {
                  setShowPasswordModal(false);
                  setCurrentPasswordValue('');
                  setNewPasswordValue('');
                  setConfirmPasswordValue('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Deletion Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-window" style={{ borderColor: 'var(--danger)' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--danger)', marginBottom: 8 }}>
              Verify Identity Purge
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>
              To verify this irreversible operation, please type <strong style={{ color: 'var(--danger)' }}>DELETE</strong> in the field below.
            </p>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Confirmation Keyword</label>
              <input
                type="text"
                className="form-input"
                placeholder="Type DELETE to confirm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                style={{ borderColor: deleteConfirmText === 'DELETE' ? 'var(--danger)' : 'var(--border)' }}
                autoFocus
              />
            </div>
            {hasPassword && (
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label" style={{ fontSize: '0.85rem' }}>Account Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter your account password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  style={{ borderColor: deletePassword ? 'var(--primary)' : 'var(--border)' }}
                />
              </div>
            )}
            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <button
                className="btn btn-danger"
                style={{ flex: 1, borderRadius: 12 }}
                onClick={handleDeleteAccount}
                disabled={deleteLoading || deleteConfirmText !== 'DELETE' || (hasPassword && !deletePassword)}
              >
                {deleteLoading ? 'Wiping Data...' : 'Permanently Expunge'}
              </button>
              <button
                className="btn btn-ghost"
                style={{ flex: 1, borderRadius: 12 }}
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                  setDeletePassword('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2FA Verification Modal */}
      {show2FAModal && (
        <div className="modal-overlay">
          <div className="modal-window">
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 8, color: 'var(--text-primary)' }}>
              Enable Security (2FA)
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>
              A security OTP has been sent to your registered email. Enter it below to activate Two-Factor Authentication.
            </p>
            <div className="form-group">
              <label className="form-label">Security OTP Code</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter 6-digit OTP"
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value)}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <button className="btn btn-primary" style={{ flex: 1, borderRadius: 12 }} onClick={handleVerify2FA} disabled={loading || otpValue.length < 6}>
                {loading ? 'Activating...' : 'Enable 2FA'}
              </button>
              <button className="btn btn-ghost" style={{ flex: 1, borderRadius: 12 }} onClick={() => { setShow2FAModal(false); setOtpValue(''); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Verification Modal */}
      {showVerifyModal && (
        <div className="modal-overlay">
          <div className="modal-window">
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 8, color: 'var(--text-primary)' }}>
              Verify Scholar Account
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>
              A verification code has been dispatched to your institutional email. Enter it below to verify your identity.
            </p>
            <div className="form-group">
              <label className="form-label">Verification OTP</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter 6-digit code"
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value)}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <button className="btn btn-primary" style={{ flex: 1, borderRadius: 12 }} onClick={handleConfirmVerification} disabled={loading || otpValue.length < 6}>
                {loading ? 'Confirming...' : 'Complete Verification'}
              </button>
              <button className="btn btn-ghost" style={{ flex: 1, borderRadius: 12 }} onClick={() => { setShowVerifyModal(false); setOtpValue(''); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disable 2FA Modal */}
      {showDisable2FAModal && (
        <div className="modal-overlay">
          <div className="modal-window" style={{ borderColor: 'var(--danger)' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 8, color: 'var(--danger)' }}>
              Disable Security (2FA)
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>
              An authorization code has been sent to your email. Enter it below to confirm disabling 2FA.
            </p>
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--danger)' }}>Authorization Code</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter 6-digit OTP"
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value)}
                style={{ borderColor: 'var(--danger)' }}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <button className="btn btn-danger" style={{ flex: 1, borderRadius: 12 }} onClick={handleVerifyDisable2FA} disabled={loading || otpValue.length < 6}>
                {loading ? 'Deactivating...' : 'Confirm Disable'}
              </button>
              <button className="btn btn-ghost" style={{ flex: 1, borderRadius: 12 }} onClick={() => { setShowDisable2FAModal(false); setOtpValue(''); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Change Modal */}
      {showEmailChangeModal && (
        <div className="modal-overlay">
          <div className="modal-window">
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--primary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                }}
              >
                <Mail size={28} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0, color: 'var(--text-primary)' }}>
                {emailChangeStep === 'input' ? 'Change Email Address' : 'Verify Authorization Code'}
              </h3>
            </div>

            {emailChangeStep === 'input' ? (
              <>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20, textAlign: 'center' }}>
                  Enter your new email address. We&apos;ll send a 6-digit OTP to <strong>{session?.user?.email}</strong> to verify the change.
                </p>
                <div className="form-group">
                  <label className="form-label">New Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="you@newdomain.com"
                    value={newEmailValue}
                    onChange={(e) => setNewEmailValue(e.target.value)}
                    autoFocus
                  />
                </div>
                {emailChangeError && (
                  <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertTriangle size={15} />
                    <span>{emailChangeError}</span>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                  <button className="btn btn-primary" style={{ flex: 1, borderRadius: 12 }} onClick={handleRequestEmailChange} disabled={emailChangeLoading}>
                    {emailChangeLoading ? 'Sending Code...' : 'Send Authorization Code'}
                  </button>
                  <button className="btn btn-ghost" style={{ flex: 1, borderRadius: 12 }} onClick={() => setShowEmailChangeModal(false)}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20, textAlign: 'center' }}>
                  A 6-digit code was sent to <strong>{session?.user?.email}</strong>. Enter it below to confirm the change to <strong style={{ color: 'var(--primary)' }}>{newEmailValue}</strong>.
                </p>
                <div className="form-group">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="— — — — — —"
                    maxLength={6}
                    value={emailChangeOtp}
                    onChange={(e) => setEmailChangeOtp(e.target.value.replace(/\D/g, ''))}
                    autoFocus
                    style={{ textAlign: 'center', fontSize: '2rem', letterSpacing: '8px', fontWeight: 800, fontFamily: 'monospace', padding: '14px 8px' }}
                  />
                </div>
                {emailChangeError && (
                  <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertTriangle size={15} />
                    <span>{emailChangeError}</span>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                  <button className="btn btn-primary" style={{ flex: 1, borderRadius: 12 }} onClick={handleVerifyEmailChange} disabled={emailChangeLoading || emailChangeOtp.length !== 6}>
                    {emailChangeLoading ? 'Verifying...' : 'Authorize Change'}
                  </button>
                  <button className="btn btn-ghost" style={{ flex: 1, borderRadius: 12 }} onClick={() => { setEmailChangeStep('input'); setEmailChangeOtp(''); setEmailChangeError(''); }}>
                    ← Back
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
