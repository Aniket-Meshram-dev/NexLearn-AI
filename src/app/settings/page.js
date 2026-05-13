'use client';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from '@/components/ThemeProvider';

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
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    weekly: true,
    achievements: true
  });

  // Load preferences from standard cache on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('icads_user_settings');
      if (savedSettings) {
        setNotifications(JSON.parse(savedSettings));
      }
    } catch (e) { }

    // Fetch security/verification state
    fetch('/api/user/security')
      .then(r => r.json())
      .then(d => {
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

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ ...toast, visible: false }), 4000);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      localStorage.setItem('icm_user_settings', JSON.stringify(notifications));
      localStorage.setItem('icm_preferred_voice', selectedVoice);
      await new Promise(resolve => setTimeout(resolve, 800));
      showToast('Session preferences updated', 'success');
    } catch (e) {
      showToast('Error syncing preferences', 'error');
    }
    setLoading(false);
  };

  const handleTestVoice = () => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance("Hello! This is a preview of my selected voice. How does it sound?");
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  };

  const handleSendVerification = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/security', {
        method: 'POST', body: JSON.stringify({ action: 'sendVerification' }), headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send verification email');
      showToast(data.message, 'success');
      setShowVerifyModal(true);
    } catch (err) {
      showToast(err.message, 'error');
    }
    setLoading(false);
  };

  const handleConfirmVerification = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/security', {
        method: 'POST', body: JSON.stringify({ action: 'confirmVerification', otp: otpValue }), headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');
      showToast(data.message, 'success');
      setIsVerified(true);
      setShowVerifyModal(false);
      setOtpValue('');
    } catch (err) {
      showToast(err.message, 'error');
    }
    setLoading(false);
  };

  const handleEnable2FA = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/security', {
        method: 'POST', body: JSON.stringify({ action: 'enable2FA' }), headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to trigger 2FA');
      showToast(data.message, 'success');
      setShow2FAModal(true);
    } catch (err) {
      showToast(err.message, 'error');
    }
    setLoading(false);
  };

  const handleVerify2FA = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/security', {
        method: 'POST', body: JSON.stringify({ action: 'verify2FA', otp: otpValue }), headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');
      showToast(data.message, 'success');
      setTwoFactorEnabled(true);
      setShow2FAModal(false);
      setOtpValue('');
    } catch (err) {
      showToast(err.message, 'error');
    }
    setLoading(false);
  };

  const handleDisable2FA = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/security', {
        method: 'POST', body: JSON.stringify({ action: 'disable2FA' }), headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to trigger 2FA deactivation');
      showToast(data.message, 'success');
      setShowDisable2FAModal(true);
    } catch (err) {
      showToast(err.message, 'error');
    }
    setLoading(false);
  };

  const handleVerifyDisable2FA = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/security', {
        method: 'POST', body: JSON.stringify({ action: 'confirmDisable2FA', otp: otpValue }), headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');
      showToast(data.message, 'success');
      setTwoFactorEnabled(false);
      setShowDisable2FAModal(false);
      setOtpValue('');
    } catch (err) {
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
        body: JSON.stringify({ action: 'changePassword', currentPassword: currentPasswordValue, newPassword: newPasswordValue })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast('Password securely updated', 'success');
      setShowPasswordModal(false);
      setCurrentPasswordValue('');
      setNewPasswordValue('');
      setConfirmPasswordValue('');
    } catch (e) {
      showToast(e.message, 'error');
    }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      showToast('Type DELETE to verify erasure', 'error');
      return;
    }

    setDeleteLoading(true);
    try {
      const res = await fetch('/api/user/security', { method: 'DELETE' });
      if (!res.ok) throw new Error('Network failure during purge');
      showToast('Account data expunged', 'success');
      setTimeout(() => signOut({ callbackUrl: '/' }), 1500);
    } catch (e) {
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
      if (!res.ok) { setEmailChangeError(data.error || 'Failed to send code.'); return; }
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
      if (!res.ok) { setEmailChangeError(data.error || 'Invalid code. Please try again.'); return; }
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
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 60 }}>
      {/* Settings Header with Profile Context */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        padding: '32px 40px', borderRadius: 24, marginBottom: 32, color: 'white',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 850, margin: 0, letterSpacing: '-0.02em' }}>Settings Dashboard</h1>
          <p style={{ margin: '4px 0 0 0', opacity: 0.8, fontSize: '0.95rem' }}>Personalize your institutional account & preferences</p>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.1)', padding: '12px 20px', borderRadius: 16,
          backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', gap: 12
        }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 800 }}>
            {session?.user?.name ? session.user.name[0].toUpperCase() : '?'}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{session?.user?.name}</div>
            <div style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              {isVerified ? (
                <span style={{ color: '#10b981', fontWeight: 700 }}>✅ Verified Account</span>
              ) : (
                <button
                   onClick={() => setActiveTab('security')}
                  style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', padding: '2px 10px', borderRadius: 20, fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}
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
            { id: 'account', label: 'User Account', icon: '👤' },
            { id: 'preferences', label: 'UI Preferences', icon: '✨' },
            { id: 'notifications', label: 'Communications', icon: '🔔' },
            { id: 'security', label: 'Security & Access', icon: '🛡️' },
            { id: 'danger', label: 'Danger Zone', icon: '⚠️' }
          ].map(tab => (
            <div
              key={tab.id}
              className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span style={{ fontSize: '1.2rem' }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </div>
          ))}
          <div style={{ marginTop: 'auto', padding: 12 }}>
            <button className="btn btn-ghost" onClick={() => signOut({ callbackUrl: '/' })} style={{ color: 'var(--danger)', width: '100%', justifyContent: 'flex-start' }}>
              🚪 Log Out
            </button>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="settings-content">
          <div className="card" style={{
            borderRadius: 24, height: 500, display: 'flex', flexDirection: 'column',
            position: 'relative', overflow: 'hidden', padding: 0
          }}>

            {/* Scrollable Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px 40px' }}>

              {activeTab === 'account' && (
                <div className="fade-in">
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 24, color: 'var(--text)' }}>Institutional Identity</h3>

                  {/* Current Email Display */}
                  <div className="form-group">
                    <label className="form-label">Primary Account Email</label>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--bg)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '1.2rem' }}>✉️</span>
                      <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>{session?.user?.email}</span>
                      <span style={{ marginLeft: 'auto', background: 'var(--success-bg)', color: 'var(--success)', fontSize: '0.7rem', padding: '2px 8px', borderRadius: 20, fontWeight: 800 }}>ACTIVE</span>
                    </div>
                  </div>

                  {/* Change Email Section */}
                  <div style={{
                    marginTop: 20, padding: 20, borderRadius: 16,
                    background: hasPassword ? 'var(--bg)' : '#f8fafc',
                    border: `1px solid ${hasPassword ? 'var(--border)' : '#e2e8f0'}`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>Change Email Address</h4>
                        {hasPassword ? (
                          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            An OTP will be sent to your current email to authorize the change.
                          </p>
                        ) : (
                          <p style={{ margin: 0, fontSize: '0.82rem', color: '#f59e0b', fontWeight: 600 }}>
                            🔒 Not available — your account uses Google Sign-In. Email is managed by Google.
                          </p>
                        )}
                      </div>
                      <button
                        className="btn btn-outline"
                        style={{ borderRadius: 12, padding: '8px 20px', flexShrink: 0, marginLeft: 16, opacity: hasPassword ? 1 : 0.4 }}
                        disabled={!hasPassword}
                        onClick={() => { setShowEmailChangeModal(true); setEmailChangeStep('input'); setEmailChangeError(''); setNewEmailValue(''); setEmailChangeOtp(''); }}
                      >
                        ✏️ Change Email
                      </button>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: 24 }}>
                    <label className="form-label">Connected Organization</label>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>ICM SYSTEM Academic Network (Member since {new Date().getFullYear()})</p>
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="fade-in">
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 24, color: 'var(--text)' }}>Visual Experience</h3>
                  <div className="setting-row">
                    <div className="setting-info">
                      <h4>Appearance Theme</h4>
                      <p>Customize the application interface styling</p>
                    </div>
                    <select className="form-select" style={{ width: 160, borderRadius: 12 }} value={theme} onChange={e => setTheme(e.target.value)}>
                      <option value="system">System Logic</option>
                      <option value="light">Solar (Light)</option>
                      <option value="dark">Cosmos (Dark)</option>
                    </select>
                  </div>

                  <div className="setting-row" style={{ borderTop: '1px solid var(--border)', paddingTop: 20, marginTop: 20 }}>
                    <div className="setting-info">
                      <h4 style={{ fontSize: '0.95rem', marginBottom: 2 }}>AI Mentor Voice</h4>
                      <p style={{ fontSize: '0.8rem' }}>Preferred voice for tutor and reader</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <select 
                        className="form-select" 
                        style={{ width: 180, borderRadius: 10, padding: '6px 10px', fontSize: '0.85rem' }} 
                        value={selectedVoice} 
                        onChange={e => setSelectedVoice(e.target.value)}
                      >
                        <option value="">Default (Auto-select)</option>
                        {voices.map((v, i) => (
                          <option key={i} value={v.name}>{v.name}</option>
                        ))}
                      </select>
                      <button 
                        className="btn btn-ghost" 
                        onClick={handleTestVoice}
                        disabled={!selectedVoice}
                        style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                      >
                        🔊 Test
                      </button>
                    </div>
                  </div>

                  <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-primary" onClick={handleSave} disabled={loading} style={{ borderRadius: 12, padding: '10px 32px' }}>
                      {loading ? 'Saving Changes...' : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="fade-in">
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 24, color: 'var(--text)' }}>Global Communication</h3>
                  {[
                    { id: 'email', label: 'Email Alerts', sub: 'Receive institutional updates via email' },
                    { id: 'push', label: 'System Notifications', sub: 'Real-time browser notifications' },
                    { id: 'weekly', label: 'Progress Reports', sub: 'In-depth weekly learning analysis' },
                    { id: 'achievements', label: 'Milestone Alerts', sub: 'Instant notification on badge unlocks' }
                  ].map(item => (
                    <div key={item.id} className="setting-row">
                      <div className="setting-info">
                        <h4>{item.label}</h4>
                        <p>{item.sub}</p>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={notifications[item.id]}
                          onChange={e => setNotifications({ ...notifications, [item.id]: e.target.checked })}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'security' && (
                <div className="fade-in">
                  {/* 1. Account Verification Header */}
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 24, color: 'var(--text)' }}>Account Verification</h3>
                  <div className="card" style={{ padding: 24, marginBottom: 32, borderRadius: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--primary-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800 }}>
                          {session?.user?.name ? session.user.name[0].toUpperCase() : '👤'}
                        </div>
                        <div>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{session?.user?.name}</h4>
                          <div style={{ color: isVerified ? 'var(--success)' : 'var(--danger)', fontSize: '0.85rem', fontWeight: 700 }}>
                            {isVerified ? '✅ Verified Institutional Account' : '❌ Identity Verification Pending'}
                          </div>
                        </div>
                      </div>
                      {!isVerified && (
                        <button className="btn btn-primary" style={{ borderRadius: 12, padding: '8px 24px' }} onClick={handleSendVerification} disabled={loading}>
                          Verify Now
                        </button>
                      )}
                    </div>
                    <p style={{ marginTop: 20, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      Verification adds an official trust layer to your academic profile. It is required to claim certificates and participate in advanced laboratory sessions.
                    </p>
                  </div>

                  {/* 2. Two-Factor Authentication Header */}
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 24, color: 'var(--text)' }}>Two-Factor Authentication</h3>
                  <div className="card" style={{ padding: 24, borderRadius: 20, marginBottom: 32 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="setting-info">
                        <h4 style={{ fontWeight: 700, margin: 0 }}>2FA Security Status</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                          Mandatory OTP verification during login: <strong style={{ color: twoFactorEnabled ? 'var(--success)' : 'var(--text-muted)' }}>{twoFactorEnabled ? 'ENFORCED' : 'INACTIVE'}</strong>
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
                    <p style={{ marginTop: 16, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      Protect your account with an extra layer of security. Every time you log in, we will require both your password and a temporary verification code sent to your email.
                    </p>
                  </div>

                  <div className="form-group" style={{ marginTop: 40 }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 20, color: 'var(--text)' }}>Credential Management</h3>
                    <button className="btn btn-outline" style={{ width: '100%', borderRadius: 12, justifyContent: 'center' }} onClick={() => setShowPasswordModal(true)} disabled={loading}>
                      Change Password
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'danger' && (
                <div className="fade-in" style={{ padding: '24px', background: 'var(--danger-bg)', borderRadius: 20, border: '1px solid var(--danger)' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 16, color: 'var(--danger)' }}>Final Account Deletion</h3>
                  <p style={{ color: 'var(--danger)', fontSize: '0.9rem', marginBottom: 24, opacity: 0.9 }}>
                    Warning: This action is irreversible. All datasets, academic history, and telemetry associated with your account will be permanently expunged.
                  </p>
                  <button className="btn btn-danger" style={{ width: '100%', borderRadius: 12, boxShadow: '0 4px 12px rgba(239,68,68,0.2)' }} onClick={() => setShowDeleteModal(true)} disabled={deleteLoading || loading}>
                    🗑️ Confirm Permanent Account Erasure
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
            <span style={{ fontSize: '1.2rem' }}>
              {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}
            </span>
            <span style={{ fontWeight: 600 }}>{toast.message}</span>
          </div>
        )}
      </div>

      {/* Password Reset Modal */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-window">
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 8 }}>Secure Password Change</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>Update your password using the fields below.</p>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password" className="form-input"
                placeholder="Enter current password"
                value={currentPasswordValue}
                onChange={e => setCurrentPasswordValue(e.target.value)}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password" className="form-input"
                placeholder="Mix of capital, small, number, symbol (min 8)"
                value={newPasswordValue}
                onChange={e => setNewPasswordValue(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password" className="form-input"
                placeholder="Re-enter new password"
                value={confirmPasswordValue}
                onChange={e => setConfirmPasswordValue(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <button
                className="btn btn-primary" style={{ flex: 1, borderRadius: 12 }}
                onClick={handlePasswordChange} disabled={loading}
              >
                {loading ? 'Encrypting...' : 'Change Password'}
              </button>
              <button
                className="btn btn-ghost" style={{ flex: 1, borderRadius: 12 }}
                onClick={() => { setShowPasswordModal(false); setCurrentPasswordValue(''); setNewPasswordValue(''); setConfirmPasswordValue(''); }}
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
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--danger)', marginBottom: 8 }}>Verify Identity Purge</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>
              To verify this irreversible operation, please type <strong style={{ color: 'var(--danger)' }}>DELETE</strong> in the field below.
            </p>
            <div className="form-group">
              <input
                type="text" className="form-input"
                placeholder="Type DELETE to confirm"
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                style={{ borderColor: deleteConfirmText === 'DELETE' ? 'var(--danger)' : 'var(--border)' }}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <button
                className="btn btn-danger" style={{ flex: 1, borderRadius: 12 }}
                onClick={handleDeleteAccount} disabled={deleteLoading || deleteConfirmText !== 'DELETE'}
              >
                {deleteLoading ? 'Wiping Data...' : 'Permanently Expunge'}
              </button>
              <button
                className="btn btn-ghost" style={{ flex: 1, borderRadius: 12 }}
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
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
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 8 }}>Enable Security (2FA)</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>A security OTP has been sent to your email. Please enter it below to activate Two-Factor Authentication.</p>
            <div className="form-group">
              <label className="form-label">Security OTP Code</label>
              <input
                type="text" className="form-input"
                placeholder="Enter 6-digit OTP"
                value={otpValue}
                onChange={e => setOtpValue(e.target.value)}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <button
                className="btn btn-primary" style={{ flex: 1, borderRadius: 12 }}
                onClick={handleVerify2FA} disabled={loading || otpValue.length < 6}
              >
                {loading ? 'Activating...' : 'Enable 2FA'}
              </button>
              <button
                className="btn btn-ghost" style={{ flex: 1, borderRadius: 12 }}
                onClick={() => { setShow2FAModal(false); setOtpValue(''); }}
              >
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
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 8 }}>Verify Account</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>A verification OTP has been sent to your institutional email. Enter it below to verify your identity.</p>
            <div className="form-group">
              <label className="form-label">Verification OTP</label>
              <input
                type="text" className="form-input"
                placeholder="Enter 6-digit code"
                value={otpValue}
                onChange={e => setOtpValue(e.target.value)}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <button
                className="btn btn-primary" style={{ flex: 1, borderRadius: 12 }}
                onClick={handleConfirmVerification} disabled={loading || otpValue.length < 6}
              >
                {loading ? 'Confirming...' : 'Complete Verification'}
              </button>
              <button
                className="btn btn-ghost" style={{ flex: 1, borderRadius: 12 }}
                onClick={() => { setShowVerifyModal(false); setOtpValue(''); }}
              >
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
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 8, color: 'var(--danger)' }}>Disable Security (2FA)</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>
              Are you sure? This reduces account safety. An authorisation code has been sent to your email. Enter it to confirm.
            </p>
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--danger)' }}>Authorisation Code</label>
              <input
                type="text" className="form-input"
                placeholder="Enter 6-digit OTP"
                value={otpValue}
                onChange={e => setOtpValue(e.target.value)}
                style={{ borderColor: 'var(--danger)' }}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <button
                className="btn btn-danger" style={{ flex: 1, borderRadius: 12 }}
                onClick={handleVerifyDisable2FA} disabled={loading || otpValue.length < 6}
              >
                {loading ? 'Deactivating...' : 'Confirm Disable'}
              </button>
              <button
                className="btn btn-ghost" style={{ flex: 1, borderRadius: 12 }}
                onClick={() => { setShowDisable2FAModal(false); setOtpValue(''); }}
              >
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
              <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>✉️</div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0 }}>
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
                    type="email" className="form-input"
                    placeholder="you@newdomain.com"
                    value={newEmailValue}
                    onChange={e => setNewEmailValue(e.target.value)}
                    autoFocus
                  />
                </div>
                {emailChangeError && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: 12, fontWeight: 600 }}>⚠️ {emailChangeError}</div>}
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
                    type="text" className="form-input"
                    placeholder="— — — — — —"
                    maxLength={6}
                    value={emailChangeOtp}
                    onChange={e => setEmailChangeOtp(e.target.value.replace(/\D/g, ''))}
                    autoFocus
                    style={{ textAlign: 'center', fontSize: '2rem', letterSpacing: '8px', fontWeight: 800, fontFamily: 'monospace', padding: '14px 8px' }}
                  />
                </div>
                {emailChangeError && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: 12, fontWeight: 600 }}>⚠️ {emailChangeError}</div>}
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
