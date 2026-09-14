'use client';
import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Country, State, City } from 'country-state-city';
import {
  Zap,
  Sparkles,
  User,
  MapPin,
  Calendar,
  Target,
  GraduationCap,
  Bot,
  BookOpen,
  Award,
  Trophy,
  ArrowRight,
} from 'lucide-react';

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ 
    name: '', learningGoal: '', 
    dob: '', gender: '', bio: '', country: '', state: '', city: '', educationLevel: '' 
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  // country-state-city isoCode tracking (separate from display names stored in form)
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
  const availableStates = useMemo(() => countryIso ? State.getStatesOfCountry(countryIso) : [], [countryIso]);
  const availableCities = useMemo(() => (countryIso && stateIso) ? City.getCitiesOfState(countryIso, stateIso) : [], [countryIso, stateIso]);

  // When loading existing profile data, resolve country/state ISO codes from stored names
  useEffect(() => {
    if (!form.country) return;
    const allCountries = Country.getAllCountries();
    const matchedCountry = allCountries.find(c => c.name === form.country);
    if (matchedCountry) {
      setCountryIso(matchedCountry.isoCode);
      if (form.state) {
        const allStates = State.getStatesOfCountry(matchedCountry.isoCode);
        const matchedState = allStates.find(s => s.name === form.state);
        if (matchedState) setStateIso(matchedState.isoCode);
      }
    }
  }, [form.country]);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated') {
      Promise.all([
        fetch('/api/user/profile').then(r => r.json()),
        fetch('/api/user/stats').then(r => r.json())
      ]).then(([profile, statsData]) => {
        setData(profile);
        setPoints(statsData.stats.points);
        setHeatMap(statsData.heatMapData || {});
        setStats(statsData.stats);
        let formattedDob = '';
        if (profile.user.dob) {
          formattedDob = new Date(profile.user.dob).toISOString().split('T')[0];
        }

        setAvailableYears(statsData.availableYears || []);
        setSelectedYear(String(statsData.requestedYear) || 'current');
        setForm({ 
          name: profile.user.name || '', 
          learningGoal: profile.user.learningGoal || '',
          dob: formattedDob,
          gender: profile.user.gender || '',
          bio: profile.user.bio || '',
          country: profile.user.country || '',
          state: profile.user.state || '',
          city: profile.user.city || '',
          educationLevel: profile.user.educationLevel || ''
        });
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [status, router]);

  const updateAvatar = async (url) => {
    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: url })
      });
      if (res.ok) {
        const updated = await res.json();
        setData(prev => ({ ...prev, user: updated.user }));
        setShowAvatarModal(false);
        setMessage('Avatar updated successfully!');
      }
    } catch (err) { }
    setSaving(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        setMessage('Image must be less than 1MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => updateAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        const updated = await res.json();
        setData({ ...data, user: updated.user });
        if (update) {
          await update({ name: updated.user.name });
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

  if (loading || !data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 20 }}>
        <div style={{ width: 40, height: 40, border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Synchronizing NexLearn Telemetry...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const initials = data?.user?.name
    ? data.user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : '?';

  const getAcademicStanding = (pts) => {
    if (pts >= 3000) return { label: 'Summa Cum Laude', color: '#8b5cf6' };
    if (pts >= 1500) return { label: 'Dean\'s List', color: 'var(--success)' };
    if (pts >= 500) return { label: 'Academic Scholar', color: 'var(--primary)' };
    return { label: 'Rising Star', color: 'var(--text-secondary)' };
  };

  const standing = getAcademicStanding(points);
  const percentile = Math.min(99, 45 + Math.floor(points / 65) + (data.completedCourses * 5));

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 60 }}>
      {/* Dynamic Keyframes for Staggered Entrance */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-stagger > * {
          opacity: 0;
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .animate-stagger > *:nth-child(1) { animation-delay: 0.1s; }
        .animate-stagger > *:nth-child(2) { animation-delay: 0.2s; }
        .animate-stagger > *:nth-child(3) { animation-delay: 0.3s; }
        .animate-stagger > *:nth-child(4) { animation-delay: 0.4s; }
        .animate-stagger > *:nth-child(5) { animation-delay: 0.5s; }
        .animate-stagger > *:nth-child(6) { animation-delay: 0.6s; }
      `}</style>

      <div className="page-header" style={{ textAlign: 'left', marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 8, color: 'var(--text)' }}>
            Student <span style={{ color: 'var(--primary)' }}>Academic Portfolio</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', fontWeight: 500 }}>Verified educational progress and skill telemetry</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Academic Standing</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: standing.color }}>{standing.label}</div>
        </div>
      </div>

      {message && (
        <div className={`alert ${message.toLowerCase().includes('success') || message.toLowerCase().includes('updated') ? 'alert-success' : 'alert-danger'}`} style={{
          marginBottom: 24, padding: '12px 20px', borderRadius: 12, fontWeight: 600,
          background: (message.toLowerCase().includes('success') || message.toLowerCase().includes('updated')) ? '#d1fae5' : '#fee2e2',
          color: (message.toLowerCase().includes('success') || message.toLowerCase().includes('updated')) ? '#065f46' : '#991b1b',
          border: `1px solid ${(message.toLowerCase().includes('success') || message.toLowerCase().includes('updated')) ? '#34d399' : '#f87171'}`
        }}>
          {message.toLowerCase().includes('success') || message.toLowerCase().includes('updated') ? '✓ ' : '⚠ '} {message}
        </div>
      )}

      <div className="animate-stagger">
        <div className="card" style={{
          marginBottom: 32, padding: 0, position: 'relative', overflow: 'hidden',
          border: '1px solid var(--border)', borderRadius: 28, boxShadow: 'var(--shadow-lg)',
          background: 'white'
        }}>
          {/* Sophisticated Slated Header Banner */}
          <div style={{
            height: 160,
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', // DEEP SLATE
            position: 'relative'
          }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h1v1H0V0zm1 1h1v1H1V1z\' fill=\'%23ffffff\' fill-opacity=\'0.2\'/%3E%3C/svg%3E")' }} />

            {!editing && (
              <button className="btn" style={{
                position: 'absolute', top: 20, right: 30, padding: '8px 20px',
                borderRadius: 12, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
                color: 'white', border: '1px solid rgba(255,255,255,0.2)', fontWeight: 700,
                fontSize: '0.8rem', cursor: 'pointer'
              }} onClick={() => setEditing(true)}>Edit Profile</button>
            )}
          </div>

          <div style={{ padding: '0 40px 40px', marginTop: -60, position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: 140, height: 140, borderRadius: '50%', background: 'white', padding: 4,
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e2e8f0'
                }}>
                  {data?.user?.avatar ? (
                    <img src={data.user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%', borderRadius: '50%', background: '#f1f5f9', color: '#64748b',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', fontWeight: 800
                    }}>{initials}</div>
                  )}
                </div>
                <button onClick={() => setShowAvatarModal(true)} style={{
                  position: 'absolute', bottom: 5, right: 5, width: 38, height: 38, borderRadius: '50%',
                  background: '#1e293b', border: '3px solid white', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)', color: 'white'
                }} title="Change Avatar" > 📸 </button>
              </div>

              <div style={{ flex: 1, minWidth: 350, paddingTop: 60 }}>
                {editing ? (
                  <form onSubmit={handleSave} style={{ background: 'white', padding: 24, borderRadius: 20, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Name</label>
                        <input type="text" className="form-input" style={{ borderRadius: 10 }} value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Specialization</label>
                        <select className="form-select" style={{ borderRadius: 10 }} value={form.learningGoal || ''} onChange={e => setForm({ ...form, learningGoal: e.target.value })}>
                          <option value="">No specific goal</option>
                          <option value="Interview Preparation">Interview Preparation</option>
                          <option value="Project Building">Project Building</option>
                          <option value="Exam Preparation">Exam Preparation</option>
                          <option value="Skill Development">Skill Development</option>
                          <option value="Career Change">Career Change</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Gender</label>
                        <select className="form-select" style={{ borderRadius: 10 }} value={form.gender || ''} onChange={e => setForm({ ...form, gender: e.target.value })}>
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Non-Binary">Non-Binary</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Date of Birth</label>
                        <input type="date" className="form-input" style={{ borderRadius: 10 }} value={form.dob || ''} onChange={e => setForm({ ...form, dob: e.target.value })} />
                      </div>

                      <div className="form-group">
                         <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Education Level</label>
                         <select className="form-select" style={{ borderRadius: 10 }} value={form.educationLevel || ''} onChange={e => setForm({ ...form, educationLevel: e.target.value })}>
                           <option value="">Select Education</option>
                           <option value="High School">High School</option>
                           <option value="Undergraduate">Undergraduate</option>
                           <option value="Postgraduate">Postgraduate</option>
                           <option value="Doctorate">Doctorate</option>
                           <option value="Other">Other</option>
                         </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Country</label>
                        <select
                          className="form-select"
                          style={{ borderRadius: 10 }}
                          value={countryIso}
                          onChange={e => {
                            const iso = e.target.value;
                            const country = Country.getCountryByCode(iso);
                            setCountryIso(iso);
                            setStateIso('');
                            setForm({ ...form, country: country?.name || '', state: '', city: '' });
                          }}
                        >
                          <option value="">Select Country</option>
                          {Country.getAllCountries().map(c => (
                            <option key={c.isoCode} value={c.isoCode}>{c.flag} {c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>State / Province</label>
                        <select
                          className="form-select"
                          style={{ borderRadius: 10 }}
                          value={stateIso}
                          disabled={!countryIso}
                          onChange={e => {
                            const iso = e.target.value;
                            const state = availableStates.find(s => s.isoCode === iso);
                            setStateIso(iso);
                            setForm({ ...form, state: state?.name || '', city: '' });
                          }}
                        >
                          <option value="">{countryIso ? 'Select State / Province' : 'Select Country first'}</option>
                          {availableStates.map(s => (
                            <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>City</label>
                        <select
                          className="form-select"
                          style={{ borderRadius: 10 }}
                          value={form.city || ''}
                          disabled={!stateIso}
                          onChange={e => setForm({ ...form, city: e.target.value })}
                        >
                          <option value="">{stateIso ? 'Select City' : 'Select State first'}</option>
                          {availableCities.map(c => (
                            <option key={c.name} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginTop: 12 }}>
                      <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>About Me / Bio</label>
                      <textarea className="form-input" rows={3} placeholder="Tell us about yourself..." style={{ borderRadius: 10, resize: 'vertical' }} value={form.bio || ''} onChange={e => setForm({ ...form, bio: e.target.value })} />
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                      <button type="submit" className="btn" style={{ background: '#1e293b', color: 'white', borderRadius: 10, padding: '10px 20px', fontWeight: 600 }}>Apply Adjustments</button>
                      <button type="button" className="btn btn-secondary" style={{ borderRadius: 10, padding: '10px 20px' }} onClick={() => setEditing(false)}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <h2 style={{ fontSize: '2.4rem', fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '-0.03em' }}>{data.user.name}</h2>
                    <p style={{ color: '#64748b', fontSize: '1rem', marginTop: 4, fontWeight: 500 }}>{data.user.email}</p>

                    {data.user.bio && (
                      <p style={{ color: 'var(--text)', fontSize: '0.95rem', marginTop: 10, lineHeight: 1.6, fontStyle: 'italic', borderLeft: '3px solid var(--primary)', paddingLeft: 12 }}>
                        &ldquo;{data.user.bio}&rdquo;
                      </p>
                    )}

                    {/* Info Chips Row */}
                    <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ background: 'var(--secondary)', color: 'var(--text)', padding: '5px 14px', borderRadius: 30, fontWeight: 700, fontSize: '0.82rem', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Zap size={14} style={{ color: '#F59E0B' }} /> Lvl {Math.floor(points / 500) + 1} NexLearn Scholar
                      </span>
                      <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '5px 14px', borderRadius: 30, fontWeight: 700, fontSize: '0.82rem', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Sparkles size={14} /> {points} Knowledge XP
                      </span>

                      {data.user.gender && (
                        <span style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#A855F7', padding: '5px 14px', borderRadius: 30, fontWeight: 700, fontSize: '0.82rem', border: '1px solid rgba(168, 85, 247, 0.25)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <User size={14} /> {data.user.gender}
                        </span>
                      )}
                    </div>

                    {/* Detail Grid */}
                    {(data.user.dob || data.user.city || data.user.state || data.user.country || data.user.learningGoal) && (
                      <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px 24px' }}>
                        {(data.user.city || data.user.state || data.user.country) && (
                          <div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin size={12} />
                              <span>Location</span>
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text)', fontWeight: 600 }}>
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
                            <div style={{ fontSize: '0.9rem', color: 'var(--text)', fontWeight: 600 }}>
                              {new Date(data.user.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                          </div>
                        )}
                        {data.user.learningGoal && (
                          <div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Target size={12} />
                              <span>Specialization</span>
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text)', fontWeight: 600 }}>{data.user.learningGoal}</div>
                          </div>
                        )}
                        {data.user.educationLevel && (
                          <div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <GraduationCap size={12} />
                              <span>Education</span>
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text)', fontWeight: 600 }}>{data.user.educationLevel}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'stretch' }}>
              <div style={{ background: 'var(--primary-bg)', padding: 24, borderRadius: 24, border: '1px solid var(--primary-light)', display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bot size={18} />
                  <span>AI Career Insight</span>
                </h4>
                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text)', lineHeight: 1.6, fontWeight: 500, flex: 1 }}>
                  {data.courseCount === 0 ? (
                    `Welcome to NexLearn! Start your first course to receive personalized AI career insights based on your learning patterns.`
                  ) : (
                    `With ${data.courseCount} courses in progress and ${data.completedCourses} mastered, your trajectory strongly aligns with ${data.user.learningGoal || 'Full-Stack Engineering'}. Your ${standing.label} standing indicates high aptitude in project-based learning.`
                  )}
                </p>
              </div>
              <div style={{ background: 'var(--bg-secondary)', padding: 24, borderRadius: 24, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text)' }}>ACADEMIC PROGRESSION</span>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--primary)' }}>{Math.floor((points % 500) / 5)}% TO LVL {Math.floor(points / 500) + 2}</span>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ height: 16, background: 'var(--bg-white)', borderRadius: 20, padding: 3, border: '1px solid var(--border)', width: '100%' }}>
                    <div style={{ width: `${Math.min(100, (points % 500) / 5)}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), #6366f1)', borderRadius: 20 }} />
                  </div>
                  <p style={{ marginTop: 12, margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>You are currently outperforming <strong>{percentile}%</strong> of peers in this specialization path.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 32 }}>
          <div className="card" style={{ textAlign: 'center', padding: '24px 16px', border: '1px solid var(--border)', borderRadius: 20, transition: 'all 0.3s ease', cursor: 'default' }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ display: 'inline-flex', padding: 12, borderRadius: 14, background: 'var(--primary-bg)', color: 'var(--primary)', marginBottom: 8 }}>
              <BookOpen size={28} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)' }}>{data.courseCount}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Courses Enrolled</div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '24px 16px', border: '1px solid var(--border)', borderRadius: 20, transition: 'all 0.3s ease', cursor: 'default' }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ display: 'inline-flex', padding: 12, borderRadius: 14, background: 'rgba(16, 185, 129, 0.12)', color: '#10B981', marginBottom: 8 }}>
              <GraduationCap size={28} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10B981' }}>{data.completedCourses}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Mastery Achieved</div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '24px 16px', border: '1px solid var(--border)', borderRadius: 20, transition: 'all 0.3s ease', cursor: 'default' }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ display: 'inline-flex', padding: 12, borderRadius: 14, background: 'rgba(168, 85, 247, 0.12)', color: '#A855F7', marginBottom: 8 }}>
              <Award size={28} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)' }}>{points}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Knowledge XP</div>
          </div>
        </div>


        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1.8fr)', gap: 32, marginBottom: 32 }}>
          {/* Achievements Column */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={20} style={{ color: '#F59E0B' }} />
                <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800 }}>Mastery Milestones</h3>
              </div>
              <Link href="/achievements" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span>All Badges</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {data.unlockedAchievements && data.unlockedAchievements.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {data.unlockedAchievements.map(ua => (
                  <div key={ua.id} style={{
                    display: 'flex', gap: 16, alignItems: 'center', background: 'white',
                    border: '1px solid var(--border)', borderRadius: 20, padding: '16px 20px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: 'var(--shadow-sm)',
                    position: 'relative', overflow: 'hidden'
                  }}
                    onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                  >
                    <div style={{
                      position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: 'var(--primary)'
                    }} />
                    <div style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>{ua.achievement.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 900, fontSize: '0.95rem', color: 'var(--text)', marginBottom: 2 }}>{ua.achievement.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{ua.achievement.description}</div>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verified ✓</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card" style={{ padding: 30, textAlign: 'center', border: '2px dashed var(--border)', borderRadius: 16 }}>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Unlock your first badge!</p>
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div>
            <h3 style={{ marginBottom: 16, fontSize: '1.4rem', fontWeight: 800 }}>📂 Learning Journey</h3>
            <div className="card" style={{ padding: '24px', borderRadius: 24, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {data.recentActivity && data.recentActivity.length > 0 ? data.recentActivity.map((activity, i) => (
                  <div key={i} style={{ display: 'flex', gap: 16, position: 'relative' }}>
                    {i < data.recentActivity.length - 1 && <div style={{ position: 'absolute', left: 16, top: 32, bottom: -16, width: 2, background: 'var(--border)' }} />}
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%', background: 'var(--bg-secondary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', zIndex: 1,
                      border: '2px solid white', boxShadow: 'var(--shadow-sm)'
                    }}>
                      {activity.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>{activity.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {new Date(activity.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                )) : (
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No recent activity logged yet.</p>
                )}
              </div>
            </div>

            {data.completedCourses > 0 && (
              <div style={{ marginTop: 24 }}>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 950, marginBottom: 16, color: 'var(--text)' }}>📜 Academic Credentials</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {data.completedCoursesList?.map(c => (
                    <Link key={c.id} href={`/certificate/${c.id}`} style={{
                      padding: '20px', background: 'white', borderRadius: 20, textDecoration: 'none',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      border: '2px solid #e5e7eb', transition: 'all 0.3s ease',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                      onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{
                          width: 48, height: 48, borderRadius: 12, background: 'var(--primary-bg)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem'
                        }}>📄</div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text)' }}>{c.title} Certificate</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>Official Accreditation Verified</div>
                        </div>
                      </div>
                      <div style={{
                        padding: '8px 16px', background: 'var(--primary)', color: 'white',
                        borderRadius: 12, fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8
                      }}>
                        <span>Download</span>
                        <span style={{ fontSize: '1.1rem' }}>↓</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAvatarModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: 20
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', animation: 'scaleIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>Choose your Avatar</h3>
              <button onClick={() => setShowAvatarModal(false)} className="btn btn-sm btn-outline">✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
              {avatars.map((url, i) => (
                <button
                  key={i}
                  onClick={() => updateAvatar(url)}
                  style={{
                    padding: 0, border: '2px solid transparent', borderRadius: '50%', background: 'none', cursor: 'pointer',
                    transition: 'border 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}
                >
                  <img src={url} alt="preset" style={{ width: '100%', borderRadius: '50%' }} />
                </button>
              ))}
            </div>

            <div style={{ textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: 20 }}>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Or upload from your device</p>
              <label className="btn btn-outline" style={{ cursor: 'pointer', display: 'inline-block' }}>
                📁 Upload Image
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
