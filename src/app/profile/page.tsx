'use client';
import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Country, State, City } from 'country-state-city';
import ContributionCalendar from '@/components/profile/ContributionCalendar';
import {
  Zap,
  Sparkles,
  User,
  MapPin,
  Calendar,
  Target,
  GraduationCap,
  BookOpen,
  Award,
  Trophy,
  ArrowRight,
  Camera,
  History,
  FileCheck,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  Check,
  X,
  Share2,
  Globe,
  ShieldCheck,
  ExternalLink,
  Flame,
  Crown,
  Sun,
  Moon,
  Rocket,
  Medal,
  RefreshCw,
  Clock,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { LinkedInIcon, XIcon, GithubIcon } from '@/components/SocialIcons';

const getProfileBadgeIcon = (title: string, category: string): LucideIcon => {
  const t = title.toLowerCase();
  if (t.includes('streak') || t.includes('blazing')) return Flame;
  if (t.includes('iron') || t.includes('lightning')) return Zap;
  if (t.includes('legendary') || t.includes('grandmaster')) return Crown;
  if (t.includes('dawn')) return Sun;
  if (t.includes('night')) return Moon;
  if (t.includes('weekend')) return Calendar;
  if (t.includes('maniac')) return Rocket;
  if (t.includes('hoarder')) return BookOpen;
  if (t.includes('quiz') || t.includes('sharpshooter')) return Target;
  if (t.includes('mid-term')) return Medal;
  if (t.includes('comeback')) return RefreshCw;
  if (t.includes('triple')) return Award;
  if (t.includes('polymath')) return GraduationCap;
  if (t.includes('marathon')) return Clock;
  if (category === 'streak') return Flame;
  if (category === 'quiz') return Target;
  if (category === 'course') return Trophy;
  return Sparkles;
};

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: '',
    learningGoal: '',
    dob: '',
    gender: '',
    bio: '',
    country: '',
    state: '',
    city: '',
    educationLevel: '',
  });
  const [socialLinks, setSocialLinks] = useState({
    github: '',
    linkedin: '',
    website: '',
    twitter: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // country-state-city isoCode tracking
  const [countryIso, setCountryIso] = useState('');
  const [stateIso, setStateIso] = useState('');
  const [points, setPoints] = useState(0);
  const [heatMap, setHeatMap] = useState({});
  const [stats, setStats] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('current');

  const avatars = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Princess',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Tigger',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Harley',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
  ];

  // Derive available states and cities from ISO codes
  const availableStates = useMemo(() => (countryIso ? State.getStatesOfCountry(countryIso) : []), [countryIso]);
  const availableCities = useMemo(
    () => (countryIso && stateIso ? City.getCitiesOfState(countryIso, stateIso) : []),
    [countryIso, stateIso]
  );

  // When loading existing profile data, resolve country/state ISO codes from stored names
  useEffect(() => {
    if (!form.country) return;
    const allCountries = Country.getAllCountries();
    const matchedCountry = allCountries.find((c) => c.name === form.country);
    if (matchedCountry) {
      setCountryIso(matchedCountry.isoCode);
      if (form.state) {
        const allStates = State.getStatesOfCountry(matchedCountry.isoCode);
        const matchedState = allStates.find((s) => s.name === form.state);
        if (matchedState) setStateIso(matchedState.isoCode);
      }
    }
  }, [form.country, form.state]);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated') {
      Promise.all([
        fetch('/api/user/profile').then((r) => r.json()),
        fetch('/api/user/stats').then((r) => r.json()),
      ])
        .then(([profile, statsData]) => {
          setData(profile || {});
          if (statsData?.stats) {
            setPoints(statsData.stats.points ?? 0);
            setStats(statsData.stats);
          }
          setHeatMap(statsData?.heatMapData || {});

          let formattedDob = '';
          if (profile?.user?.dob) {
            formattedDob = new Date(profile.user.dob).toISOString().split('T')[0];
          }

          setAvailableYears(statsData?.availableYears || []);
          setSelectedYear(String(statsData?.requestedYear || 'current'));
          if (profile?.user) {
            setForm({
              name: profile.user.name || '',
              learningGoal: profile.user.learningGoal || '',
              dob: formattedDob,
              gender: profile.user.gender || '',
              bio: profile.user.bio || '',
              country: profile.user.country || '',
              state: profile.user.state || '',
              city: profile.user.city || '',
              educationLevel: profile.user.educationLevel || '',
            });

            // Load saved social links
            if (typeof window !== 'undefined') {
              try {
                const saved = localStorage.getItem(`nexlearn_social_${profile.user.id}`);
                if (saved) {
                  setSocialLinks(JSON.parse(saved));
                }
              } catch (e) {}
            }
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status, router]);

  // Profile Strength Calculation
  const profileStrength = useMemo(() => {
    let score = 0;
    const items = [
      { label: 'Profile Photo', done: Boolean(data?.user?.avatar), weight: 20 },
      { label: 'Name & Bio', done: Boolean(data?.user?.name && data?.user?.bio), weight: 20 },
      { label: 'Specialization / Goal', done: Boolean(data?.user?.learningGoal), weight: 20 },
      { label: 'Education & Location', done: Boolean(data?.user?.educationLevel && (data?.user?.country || data?.user?.city)), weight: 20 },
      { label: 'Professional Links', done: Boolean(socialLinks.github || socialLinks.linkedin || socialLinks.website), weight: 20 },
    ];
    items.forEach((item) => {
      if (item.done) score += item.weight;
    });
    return { score, items };
  }, [data, socialLinks]);

  const updateAvatar = async (url: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: url }),
      });
      if (res.ok) {
        const updated = await res.json();
        setData((prev: any) => ({ ...prev, user: updated.user }));
        setShowAvatarModal(false);
        setMessage('Avatar updated successfully!');
      }
    } catch (err) {}
    setSaving(false);
  };

  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        setMessage('Image must be less than 1MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => updateAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const updated = await res.json();
        setData({ ...data, user: updated.user });
        if (update) {
          await update({ name: updated.user.name });
        }

        // Persist social links
        if (typeof window !== 'undefined' && data?.user?.id) {
          localStorage.setItem(`nexlearn_social_${data.user.id}`, JSON.stringify(socialLinks));
        }

        setEditing(false);
        setMessage('Profile updated successfully!');
      } else {
        setMessage('Failed to update profile.');
      }
    } catch {
      setMessage('An error occurred.');
    }
    setSaving(false);
  };

  const handleShareProfile = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/profile`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);

      window.dispatchEvent(
        new CustomEvent('icmsystem_toast', {
          detail: {
            title: 'Profile Link Copied!',
            message: 'Your public portfolio URL is copied to clipboard.',
            type: 'success',
          },
        })
      );
    }
  };

  if (loading || !data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 20 }}>
        <div style={{ width: 40, height: 40, border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Loading your profile...</p>
      </div>
    );
  }

  const initials = data?.user?.name
    ? data.user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
    : '?';

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', paddingBottom: 60 }}>
      {/* Page Header */}
      <div
        className="page-header"
        style={{
          textAlign: 'left',
          marginBottom: 28,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
            My <span style={{ color: 'var(--primary)' }}>Profile</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0, fontWeight: 500 }}>
            Institutional identity, competencies, verified credentials, and learning telemetry
          </p>
        </div>

        {/* Share Profile Button */}
        <button
          onClick={handleShareProfile}
          className="btn btn-outline"
          style={{
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 700,
            fontSize: '0.86rem',
          }}
        >
          {copiedLink ? <Check size={16} color="#10B981" /> : <Share2 size={16} />}
          <span>{copiedLink ? 'Link Copied!' : 'Share Portfolio'}</span>
        </button>
      </div>

      {message && (
        <div
          className={`alert ${message.toLowerCase().includes('success') || message.toLowerCase().includes('updated') ? 'alert-success' : 'alert-danger'}`}
          style={{
            marginBottom: 24,
            padding: '12px 20px',
            borderRadius: 12,
            fontWeight: 600,
            background: message.toLowerCase().includes('success') || message.toLowerCase().includes('updated') ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            color: message.toLowerCase().includes('success') || message.toLowerCase().includes('updated') ? '#10B981' : '#EF4444',
            border: `1px solid ${message.toLowerCase().includes('success') || message.toLowerCase().includes('updated') ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {message.toLowerCase().includes('success') || message.toLowerCase().includes('updated') ? (
              <CheckCircle2 size={16} />
            ) : (
              <AlertTriangle size={16} />
            )}
            <span>{message}</span>
          </div>
        </div>
      )}

      {/* Profile Strength Meter Bar */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '18px',
          padding: '16px 22px',
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div style={{ flex: '1 1 280px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={15} color="var(--primary)" />
              Profile Strength
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: profileStrength.score >= 80 ? '#10B981' : 'var(--primary)' }}>
              {profileStrength.score}% Complete
            </span>
          </div>
          <div style={{ height: '7px', borderRadius: '999px', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${profileStrength.score}%`,
                borderRadius: '999px',
                background: profileStrength.score >= 80 ? 'linear-gradient(90deg, #6366f1, #10b981)' : 'linear-gradient(90deg, #6366f1, #a855f7)',
                transition: 'width 0.5s ease',
              }}
            />
          </div>
        </div>

        {/* Missing items pill helper */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {profileStrength.items.map((item, idx) => (
            <span
              key={idx}
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '8px',
                background: item.done ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-secondary)',
                color: item.done ? '#10B981' : 'var(--text-muted)',
                border: `1px solid ${item.done ? 'rgba(16, 185, 129, 0.25)' : 'var(--border)'}`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {item.done ? <Check size={11} /> : null}
              {item.label}
            </span>
          ))}
        </div>
      </div>

      {/* Main Profile Hero Card */}
      <div
        className="card"
        style={{
          marginBottom: 32,
          padding: 0,
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid var(--border)',
          borderRadius: 24,
          boxShadow: 'var(--shadow-md)',
          background: 'var(--bg-card)',
        }}
      >
        {/* Banner Header */}
        <div
          style={{
            height: 160,
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #0f172a 100%)',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.15,
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h1v1H0V0zm1 1h1v1H1V1z\' fill=\'%23ffffff\' fill-opacity=\'0.2\'/%3E%3C/svg%3E")',
            }}
          />

          {!editing && (
            <button
              className="btn"
              style={{
                position: 'absolute',
                top: 20,
                right: 24,
                padding: '8px 20px',
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
              onClick={() => setEditing(true)}
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Profile Card Body */}
        <div style={{ padding: '0 36px 36px', marginTop: -60, position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div
                style={{
                  width: 136,
                  height: 136,
                  borderRadius: '50%',
                  background: 'var(--bg-card)',
                  padding: 4,
                  boxShadow: '0 10px 25px -4px rgba(0, 0, 0, 0.25)',
                  border: '3px solid var(--border)',
                }}
              >
                {data?.user?.avatar ? (
                  <img
                    src={data.user.avatar}
                    alt="Avatar"
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '3.2rem',
                      fontWeight: 850,
                    }}
                  >
                    {initials}
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowAvatarModal(true)}
                style={{
                  position: 'absolute',
                  bottom: 4,
                  right: 4,
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  border: '3px solid var(--bg-card)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                  color: 'white',
                }}
                title="Change Avatar"
              >
                <Camera size={16} />
              </button>
            </div>

            {/* Profile Info / Form */}
            <div style={{ flex: 1, minWidth: 320, paddingTop: 56 }}>
              {editing ? (
                <form
                  onSubmit={handleSave}
                  style={{
                    background: 'var(--bg-card)',
                    padding: 24,
                    borderRadius: 20,
                    border: '1px solid var(--border)',
                  }}
                >
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                        Full Name
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        style={{ borderRadius: 10 }}
                        value={form.name || ''}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                        Specialization
                      </label>
                      <select
                        className="form-select"
                        style={{ borderRadius: 10 }}
                        value={form.learningGoal || ''}
                        onChange={(e) => setForm({ ...form, learningGoal: e.target.value })}
                      >
                        <option value="">No specific goal</option>
                        <option value="Full-Stack Engineering">Full-Stack Engineering</option>
                        <option value="AI & Autonomous Agents">AI & Autonomous Agents</option>
                        <option value="Systems Architecture">Systems Architecture</option>
                        <option value="Interview Preparation">Interview Preparation</option>
                        <option value="Project Building">Project Building</option>
                        <option value="Skill Development">Skill Development</option>
                        <option value="Career Change">Career Change</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                        Gender
                      </label>
                      <select
                        className="form-select"
                        style={{ borderRadius: 10 }}
                        value={form.gender || ''}
                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-Binary">Non-Binary</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        className="form-input"
                        style={{ borderRadius: 10 }}
                        value={form.dob || ''}
                        onChange={(e) => setForm({ ...form, dob: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                        Education Level
                      </label>
                      <select
                        className="form-select"
                        style={{ borderRadius: 10 }}
                        value={form.educationLevel || ''}
                        onChange={(e) => setForm({ ...form, educationLevel: e.target.value })}
                      >
                        <option value="">Select Education</option>
                        <option value="High School">High School</option>
                        <option value="Undergraduate">Undergraduate (B.Tech / BS)</option>
                        <option value="Postgraduate">Postgraduate (M.Tech / MS)</option>
                        <option value="Doctorate">Doctorate / PhD</option>
                        <option value="Self-Taught / Professional">Self-Taught / Professional</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                        Country
                      </label>
                      <select
                        className="form-select"
                        style={{ borderRadius: 10 }}
                        value={countryIso}
                        onChange={(e) => {
                          const iso = e.target.value;
                          const country = Country.getCountryByCode(iso);
                          setCountryIso(iso);
                          setStateIso('');
                          setForm({ ...form, country: country?.name || '', state: '', city: '' });
                        }}
                      >
                        <option value="">Select Country</option>
                        {Country.getAllCountries().map((c) => (
                          <option key={c.isoCode} value={c.isoCode}>
                            {c.flag} {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                        State / Province
                      </label>
                      <select
                        className="form-select"
                        style={{ borderRadius: 10 }}
                        value={stateIso}
                        disabled={!countryIso}
                        onChange={(e) => {
                          const iso = e.target.value;
                          const state = availableStates.find((s) => s.isoCode === iso);
                          setStateIso(iso);
                          setForm({ ...form, state: state?.name || '', city: '' });
                        }}
                      >
                        <option value="">{countryIso ? 'Select State / Province' : 'Select Country first'}</option>
                        {availableStates.map((s) => (
                          <option key={s.isoCode} value={s.isoCode}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                        City
                      </label>
                      <select
                        className="form-select"
                        style={{ borderRadius: 10 }}
                        value={form.city || ''}
                        disabled={!stateIso}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                      >
                        <option value="">{stateIso ? 'Select City' : 'Select State first'}</option>
                        {availableCities.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Social & Professional Links */}
                  <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>
                      Professional & Social Profiles
                    </div>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                          GitHub Profile URL
                        </label>
                        <input
                          type="url"
                          placeholder="https://github.com/username"
                          className="form-input"
                          style={{ borderRadius: 10 }}
                          value={socialLinks.github}
                          onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                          LinkedIn Profile URL
                        </label>
                        <input
                          type="url"
                          placeholder="https://linkedin.com/in/username"
                          className="form-input"
                          style={{ borderRadius: 10 }}
                          value={socialLinks.linkedin}
                          onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                          Portfolio / Personal Website
                        </label>
                        <input
                          type="url"
                          placeholder="https://yourportfolio.dev"
                          className="form-input"
                          style={{ borderRadius: 10 }}
                          value={socialLinks.website}
                          onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: 14 }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      About Me / Bio
                    </label>
                    <textarea
                      className="form-input"
                      rows={3}
                      placeholder="Tell the community about your research interests and tech stack..."
                      style={{ borderRadius: 10, resize: 'vertical' }}
                      value={form.bio || ''}
                      onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                    <button type="submit" className="btn btn-primary" style={{ borderRadius: 10, padding: '10px 24px', fontWeight: 700 }}>
                      Save Changes
                    </button>
                    <button type="button" className="btn btn-secondary" style={{ borderRadius: 10, padding: '10px 20px' }} onClick={() => setEditing(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <h2 style={{ fontSize: '2.4rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                    {data.user.name}
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', marginTop: 4, fontWeight: 500 }}>
                    {data.user.email}
                  </p>

                  {data.user.bio && (
                    <p style={{ color: 'var(--text-primary)', fontSize: '0.92rem', marginTop: 10, lineHeight: 1.6, fontStyle: 'italic', borderLeft: '3px solid var(--primary)', paddingLeft: 12 }}>
                      &ldquo;{data.user.bio}&rdquo;
                    </p>
                  )}

                  {/* Info Chips Row */}
                  <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span
                      style={{
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        padding: '5px 14px',
                        borderRadius: 30,
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        border: '1px solid var(--border)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Zap size={14} style={{ color: '#F59E0B' }} /> Lvl {Math.floor(points / 500) + 1} Learner
                    </span>
                    <span
                      style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: '#10B981',
                        padding: '5px 14px',
                        borderRadius: 30,
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Sparkles size={14} /> {points} Knowledge XP
                    </span>

                    {data.user.gender && (
                      <span
                        style={{
                          background: 'rgba(168, 85, 247, 0.1)',
                          color: '#A855F7',
                          padding: '5px 14px',
                          borderRadius: 30,
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          border: '1px solid rgba(168, 85, 247, 0.25)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <User size={14} /> {data.user.gender}
                      </span>
                    )}
                  </div>

                  {/* Clickable Social Badges */}
                  {(socialLinks.github || socialLinks.linkedin || socialLinks.website) && (
                    <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      {socialLinks.github && (
                        <a
                          href={socialLinks.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: '5px 12px',
                            borderRadius: '8px',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-primary)',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <GithubIcon size={13} />
                          <span>GitHub</span>
                          <ExternalLink size={10} color="var(--text-muted)" />
                        </a>
                      )}
                      {socialLinks.linkedin && (
                        <a
                          href={socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: '5px 12px',
                            borderRadius: '8px',
                            background: 'rgba(10, 102, 194, 0.1)',
                            border: '1px solid rgba(10, 102, 194, 0.25)',
                            color: '#0A66C2',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <LinkedInIcon size={13} />
                          <span>LinkedIn</span>
                          <ExternalLink size={10} />
                        </a>
                      )}
                      {socialLinks.website && (
                        <a
                          href={socialLinks.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: '5px 12px',
                            borderRadius: '8px',
                            background: 'rgba(99, 102, 241, 0.1)',
                            border: '1px solid rgba(99, 102, 241, 0.25)',
                            color: 'var(--primary)',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <Globe size={13} />
                          <span>Portfolio</span>
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Detail Grid */}
                  {(data.user.dob || data.user.city || data.user.state || data.user.country || data.user.learningGoal) && (
                    <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px 24px' }}>
                      {(data.user.city || data.user.state || data.user.country) && (
                        <div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={12} />
                            <span>Location</span>
                          </div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                            {[data.user.city, data.user.state, data.user.country].filter(Boolean).join(', ')}
                          </div>
                        </div>
                      )}
                      {data.user.dob && (
                        <div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} />
                            <span>Date of Birth</span>
                          </div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                            {new Date(data.user.dob).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </div>
                        </div>
                      )}
                      {data.user.learningGoal && (
                        <div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Target size={12} />
                            <span>Specialization</span>
                          </div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>{data.user.learningGoal}</div>
                        </div>
                      )}
                      {data.user.educationLevel && (
                        <div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <GraduationCap size={12} />
                            <span>Education</span>
                          </div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>{data.user.educationLevel}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        <div className="card" style={{ textAlign: 'center', padding: '24px 16px', border: '1px solid var(--border)', borderRadius: 20, background: 'var(--bg-card)' }}>
          <div style={{ display: 'inline-flex', padding: 12, borderRadius: 14, background: 'rgba(99, 102, 241, 0.12)', color: 'var(--primary)', marginBottom: 8 }}>
            <BookOpen size={28} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{data.courseCount}</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Courses Enrolled</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '24px 16px', border: '1px solid var(--border)', borderRadius: 20, background: 'var(--bg-card)' }}>
          <div style={{ display: 'inline-flex', padding: 12, borderRadius: 14, background: 'rgba(16, 185, 129, 0.12)', color: '#10B981', marginBottom: 8 }}>
            <GraduationCap size={28} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10B981' }}>{data.completedCourses}</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Completed Courses</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '24px 16px', border: '1px solid var(--border)', borderRadius: 20, background: 'var(--bg-card)' }}>
          <div style={{ display: 'inline-flex', padding: 12, borderRadius: 14, background: 'rgba(168, 85, 247, 0.12)', color: '#A855F7', marginBottom: 8 }}>
            <Award size={28} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{points}</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Knowledge XP</div>
        </div>
      </div>

      {/* GitHub-Style Daily Learning Activity Contribution Calendar */}
      <ContributionCalendar />

      {/* Badges & Timeline Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1.8fr)', gap: 32, marginBottom: 32 }}>
        {/* Achievements Column */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={20} style={{ color: '#F59E0B' }} />
              <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>Unlocked Badges</h3>
            </div>
            <Link href="/achievements" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span>All Badges</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {data.unlockedAchievements && data.unlockedAchievements.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.unlockedAchievements.map((ua: any) => (
                <div
                  key={ua.id}
                  style={{
                    display: 'flex',
                    gap: 16,
                    alignItems: 'center',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 20,
                    padding: '16px 20px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: 'var(--primary)' }} />
                  {(() => { const BadgeIcon = getProfileBadgeIcon(ua.achievement.title, ua.achievement.category); return <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BadgeIcon size={22} style={{ color: 'var(--primary)' }} /></div>; })()}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 2 }}>
                      {ua.achievement.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {ua.achievement.description}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span>Unlocked</span>
                    <Check size={13} strokeWidth={3} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: 30, textAlign: 'center', border: '2px dashed var(--border)', borderRadius: 16, background: 'var(--bg-card)' }}>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Complete quizzes and lessons to unlock your first badge!
              </p>
            </div>
          )}
        </div>

        {/* Activity Timeline & Completed Certificates */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 16 }}>
            <History size={20} style={{ color: 'var(--primary)' }} />
            <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>Recent Milestones</h3>
          </div>
          <div className="card" style={{ padding: '24px', borderRadius: 24, border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {data.recentActivity && data.recentActivity.length > 0 ? (
                data.recentActivity.map((activity: any, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: 16, position: 'relative' }}>
                    {i < data.recentActivity.length - 1 && (
                      <div style={{ position: 'absolute', left: 16, top: 32, bottom: -16, width: 2, background: 'var(--border)' }} />
                    )}
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        background: 'var(--bg-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.1rem',
                        zIndex: 1,
                        border: '2px solid var(--border)',
                      }}
                    >
                      <BookOpen size={16} style={{ color: 'var(--primary)' }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{activity.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {new Date(activity.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No recent activity logged yet.</p>
              )}
            </div>
          </div>

          {/* Completed Certificates Section */}
          {data.completedCourses > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 16 }}>
                <FileCheck size={20} style={{ color: 'var(--primary)' }} />
                <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Verified Credentials ({data.completedCourses})
                </h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {data.completedCoursesList?.map((c: any) => (
                  <div
                    key={c.id}
                    style={{
                      padding: '18px 22px',
                      background: 'var(--bg-card)',
                      borderRadius: 18,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '1px solid var(--border)',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div
                        style={{
                          width: 46,
                          height: 46,
                          borderRadius: 12,
                          background: 'rgba(99, 102, 241, 0.12)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Award size={24} style={{ color: 'var(--primary)' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-primary)' }}>
                          {c.title}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <ShieldCheck size={12} />
                          <span>Tamper-Evident Credential</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link
                        href={`/certificate/${c.id}`}
                        className="btn btn-outline"
                        style={{ borderRadius: 10, fontSize: '0.82rem', padding: '6px 14px' }}
                      >
                        <span>View</span>
                      </Link>
                      <Link
                        href={`/verify?id=${encodeURIComponent(c.id)}`}
                        className="btn btn-primary"
                        style={{ borderRadius: 10, fontSize: '0.82rem', padding: '6px 14px' }}
                      >
                        <span>Verify Seal</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Avatar Picker Modal */}
      {showAvatarModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: 20,
          }}
        >
          <div className="card" style={{ width: '100%', maxWidth: '500px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Choose your Avatar</h3>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="btn btn-sm btn-outline"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
              {avatars.map((url, i) => (
                <button
                  key={i}
                  onClick={() => updateAvatar(url)}
                  style={{
                    padding: 0,
                    border: '2px solid transparent',
                    borderRadius: '50%',
                    background: 'none',
                    cursor: 'pointer',
                    transition: 'border 0.2s',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onMouseOut={(e) => (e.currentTarget.style.borderColor = 'transparent')}
                >
                  <img src={url} alt="preset" style={{ width: '100%', borderRadius: '50%' }} />
                </button>
              ))}
            </div>

            <div style={{ textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: 20 }}>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Or upload from your device</p>
              <label className="btn btn-outline" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Upload size={14} />
                <span>Upload Photo</span>
                <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
              </label>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>Max size: 1MB</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
