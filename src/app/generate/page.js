'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function GeneratePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    topic: '', level: 'Beginner', goal: 'Skill Development',
    hoursPerDay: 1, duration: '4 weeks',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const topicParam = searchParams.get('topic');
    if (topicParam) {
      setForm(prev => ({ ...prev, topic: topicParam }));
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.topic.trim()) { setError('Please enter a topic'); return; }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/courses/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPreview(data.coursePreview);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to generate course');
      setLoading(false);
    }
  };

  const handleAddToAccount = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          preGeneratedCourse: preview
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      window.dispatchEvent(new CustomEvent('icads_toast', {
        detail: {
          id: 'local-' + Date.now(),
          title: '✨ Added to Account!',
          message: `The course "${preview.title}" is now in your account catalog.`,
          type: 'success',
          read: false
        }
      }));
      router.push('/dashboard#available');
    } catch (err) {
      setError(err.message || 'Failed to add to account');
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="page-header" style={{ textAlign: 'center' }}>
        <h1>🤖 AI Course Generator</h1>
        <p>Enter a topic and let AI create a personalized learning path for you</p>
      </div>

      {!preview ? (
        <div className="card">
          {error && <div className="alert alert-danger">⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="topic">Topic *</label>
              <input type="text" id="topic" name="topic" required className="form-input" placeholder="e.g., Web Development, Machine Learning, Data Structures..."
                value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
              <span className="form-hint">Be specific for better results</span>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Level</label>
                <select className="form-select" value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Goal</label>
                <select className="form-select" value={form.goal}
                  onChange={(e) => setForm({ ...form, goal: e.target.value })}>
                  <option>Skill Development</option>
                  <option>Interview Preparation</option>
                  <option>Project Building</option>
                  <option>Exam Preparation</option>
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Study Hours/Day</label>
                <select className="form-select" value={form.hoursPerDay}
                  onChange={(e) => setForm({ ...form, hoursPerDay: Number(e.target.value) })}>
                  <option value={1}>1 hour</option>
                  <option value={2}>2 hours</option>
                  <option value={3}>3 hours</option>
                  <option value={4}>4+ hours</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Duration</label>
                <select className="form-select" value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}>
                  <option>1 week</option>
                  <option>2 weeks</option>
                  <option>4 weeks</option>
                  <option>8 weeks</option>
                  <option>12 weeks</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}
              style={{ width: '100%', marginTop: 8 }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                  Generating with AI... This may take 15-30 seconds
                </span>
              ) : '✨ Generate Course'}
            </button>
          </form>
        </div>
      ) : (
        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
          <div className="card" style={{ marginBottom: 24, border: '2px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0 }}>✨ Preview: {preview.title}</h2>
              <button onClick={() => setPreview(null)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>
                ← Edit Topic
              </button>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: 24 }}>
              {preview.description}
            </p>

            <div className="grid-2" style={{ marginBottom: 24 }}>
              <div style={{ padding: 16, background: 'var(--primary-bg)', borderRadius: 12 }}>
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Curriculum</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{preview.modules.length} Detailed Modules</span>
              </div>
              <div style={{ padding: 16, background: 'var(--primary-bg)', borderRadius: 12 }}>
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Complexity</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{form.level} Path</span>
              </div>
            </div>

            <div style={{ marginBottom: 32 }}>
              <h3 style={{ marginBottom: 16 }}>📖 Module Roadmap</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {preview.modules.map((m, i) => (
                  <div key={i} style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 12, display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 16, background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{m.title}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{m.duration || 'Session ' + (i+1)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={handleAddToAccount} 
              className="btn btn-primary btn-lg" 
              disabled={isSaving}
              style={{ width: '100%', padding: '16px', fontSize: '1.2rem', boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.39)' }}
            >
              {isSaving ? 'Processing...' : '✅ Add this course to my Account'}
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="card" style={{ marginTop: 24, textAlign: 'center', padding: '60px 40px', background: 'var(--bg-white)', border: '1px solid var(--primary-light)', borderRadius: 28 }}>
          <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 32px' }}>
            <div className="spinner" style={{ width: '100%', height: '100%', borderWidth: 4, borderColor: 'var(--primary-bg)', borderTopColor: 'var(--primary)', opacity: 0.3 }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', animation: 'float 3s ease-in-out infinite' }}>🤖</div>
          </div>
          
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 12 }}>Architecting your Roadmap...</h2>
          
          <div style={{ maxWidth: 400, margin: '0 auto' }}>
             <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: '1.05rem' }}>
               Our AI is analyzing the topic <strong>&quot;{form.topic}&quot;</strong> to create 
               a personalized, high-fidelity learning path.
             </p>
             
             <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: 1, transition: 'all 0.5s' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' }} />
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Synthesizing module hierarchy</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: 0.6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--border)' }} />
                  <span style={{ fontSize: '0.95rem' }}>Generating detailed learning content</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: 0.6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--border)' }} />
                  <span style={{ fontSize: '0.95rem' }}>Creating interactive quizzes & assessments</span>
                </div>
             </div>
          </div>

          <div className="progress-bar" style={{ marginTop: 48, maxWidth: 300, margin: '48px auto 0', height: 10, background: 'var(--primary-bg)' }}>
            <div className="progress-fill" style={{ width: '68%', animation: 'shimmer 2s infinite' }} />
          </div>
          <p style={{ marginTop: 16, fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estimated time: 15-20 seconds</p>
        </div>
      )}
    </div>
  );
}
