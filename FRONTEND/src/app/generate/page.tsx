'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Bot,
  BookOpen,
  ArrowLeft,
  Plus,
  CheckCircle2,
  ListOrdered,
  Clock,
  Layers,
  AlertCircle,
} from 'lucide-react';

function GenerateContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    topic: '',
    level: 'Beginner',
    goal: 'Skill Development',
    hoursPerDay: 1,
    duration: '4 weeks',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      const currentUrl =
        typeof window !== 'undefined'
          ? window.location.pathname + window.location.search
          : '/generate';
      router.push(`/register?callbackUrl=${encodeURIComponent(currentUrl)}`);
    }
  }, [status, router]);

  useEffect(() => {
    const topicParam = searchParams.get('topic');
    if (topicParam) {
      setForm((prev) => ({ ...prev, topic: topicParam }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/courses/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate course');

      setPreview(data.course);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToAccount = async () => {
    if (!preview) return;
    setIsSaving(true);
    try {
      window.dispatchEvent(
        new CustomEvent('icmsystem_toast', {
          detail: {
            id: 'local-' + Date.now(),
            title: 'Added to Account Catalog!',
            message: `The course "${preview.title}" is now available in your catalog.`,
            type: 'success',
            read: false,
          },
        })
      );
      router.push('/dashboard#available');
    } catch (err: any) {
      setError(err.message || 'Failed to add to account');
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 840, margin: '0 auto' }}>
      <div className="page-header" style={{ textAlign: 'center', marginBottom: 32 }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'rgba(99, 102, 241, 0.12)',
            color: 'var(--primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px',
          }}
        >
          <Sparkles size={26} />
        </div>
        <h1
          style={{
            fontSize: 'clamp(2rem, 4vw, 2.5rem)',
            marginBottom: 8,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          AI Curriculum Generator
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
          Enter a topic and let our intelligent engine architect an adaptive learning path
        </p>
      </div>

      {!preview ? (
        <div className="card" style={{ padding: '32px 36px', borderRadius: 20 }}>
          {error && (
            <div
              className="alert alert-danger"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '12px',
                marginBottom: '20px',
              }}
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label" htmlFor="topic" style={{ fontWeight: 600 }}>
                Topic / Subject *
              </label>
              <input
                type="text"
                id="topic"
                name="topic"
                required
                className="form-input"
                placeholder="e.g., Quantum Computing, Distributed Systems with Go, Advanced React & Next.js..."
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                style={{ borderRadius: 10, padding: '12px 16px' }}
              />
              <span className="form-hint" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>
                Be specific for tailored, production-grade syllabus results
              </span>
            </div>

            <div className="grid-2" style={{ marginBottom: 20 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Experience Level
                </label>
                <select
                  className="form-select"
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                  style={{ borderRadius: 10, padding: '12px 14px' }}
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Primary Objective
                </label>
                <select
                  className="form-select"
                  value={form.goal}
                  onChange={(e) => setForm({ ...form, goal: e.target.value })}
                  style={{ borderRadius: 10, padding: '12px 14px' }}
                >
                  <option>Skill Development</option>
                  <option>Interview Preparation</option>
                  <option>Project Building</option>
                  <option>Exam Preparation</option>
                </select>
              </div>
            </div>

            <div className="grid-2" style={{ marginBottom: 28 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Study Commitment
                </label>
                <select
                  className="form-select"
                  value={form.hoursPerDay}
                  onChange={(e) => setForm({ ...form, hoursPerDay: Number(e.target.value) })}
                  style={{ borderRadius: 10, padding: '12px 14px' }}
                >
                  <option value={1}>1 hour / day</option>
                  <option value={2}>2 hours / day</option>
                  <option value={3}>3 hours / day</option>
                  <option value={4}>4+ hours / day</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Target Duration
                </label>
                <select
                  className="form-select"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  style={{ borderRadius: 10, padding: '12px 14px' }}
                >
                  <option>1 week</option>
                  <option>2 weeks</option>
                  <option>4 weeks</option>
                  <option>8 weeks</option>
                  <option>12 weeks</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{
                width: '100%',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {loading ? (
                <>
                  <span className="spinner spinner-sm" style={{ width: 18, height: 18 }} />
                  <span>Synthesizing Curriculum... (15-30s)</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Generate Course Curriculum</span>
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
          <div className="card" style={{ marginBottom: 24, border: '2px solid var(--primary)', borderRadius: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={20} style={{ color: 'var(--primary)' }} />
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Preview: {preview.title}</h2>
              </div>
              <button
                onClick={() => setPreview(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--primary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <ArrowLeft size={16} />
                <span>Edit Parameters</span>
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: 24 }}>
              {preview.description}
            </p>

            <div className="grid-2" style={{ marginBottom: 24 }}>
              <div style={{ padding: '16px 20px', background: 'var(--primary-bg)', borderRadius: 12 }}>
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    color: 'var(--primary)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    marginBottom: 4,
                  }}
                >
                  Curriculum Depth
                </span>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)' }}>
                  {preview.modules.length} Detailed Modules
                </span>
              </div>
              <div style={{ padding: '16px 20px', background: 'var(--primary-bg)', borderRadius: 12 }}>
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    color: 'var(--primary)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    marginBottom: 4,
                  }}
                >
                  Target Complexity
                </span>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)' }}>
                  {form.level} Path
                </span>
              </div>
            </div>

            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 16 }}>
                <ListOrdered size={18} style={{ color: 'var(--primary)' }} />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Synthesized Module Roadmap</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {preview.modules.map((m: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      padding: '16px 18px',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      display: 'flex',
                      gap: 16,
                      alignItems: 'center',
                      background: 'var(--bg)',
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        background: 'var(--primary)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text)' }}>{m.title}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                        {m.duration || 'Session ' + (i + 1)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleAddToAccount}
              className="btn btn-primary btn-lg"
              disabled={isSaving}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '1.05rem',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {isSaving ? (
                'Processing...'
              ) : (
                <>
                  <Plus size={18} />
                  <span>Add this course to my Account</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div
          className="card"
          style={{
            marginTop: 24,
            textAlign: 'center',
            padding: '60px 40px',
            background: 'var(--bg-white)',
            border: '1px solid var(--border)',
            borderRadius: 24,
          }}
        >
          <div style={{ position: 'relative', width: 88, height: 88, margin: '0 auto 28px' }}>
            <div
              className="spinner"
              style={{
                width: '100%',
                height: '100%',
                borderWidth: 4,
                borderColor: 'var(--primary-bg)',
                borderTopColor: 'var(--primary)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
              }}
            >
              <Bot size={36} />
            </div>
          </div>

          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: 10, fontFamily: "'Outfit', sans-serif" }}>
            Architecting your Custom Curriculum...
          </h2>

          <div style={{ maxWidth: 420, margin: '0 auto' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 28, fontSize: '0.95rem', lineHeight: 1.5 }}>
              Analyzing <strong>&quot;{form.topic}&quot;</strong> to synthesize interactive modules, structured theory, and quizzes.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    boxShadow: '0 0 10px var(--primary)',
                  }}
                />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Synthesizing module hierarchy</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: 0.7 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--border)' }} />
                <span style={{ fontSize: '0.9rem' }}>Generating detailed learning content</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: 0.7 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--border)' }} />
                <span style={{ fontSize: '0.9rem' }}>Creating interactive quizzes & assessments</span>
              </div>
            </div>
          </div>

          <div
            className="progress-bar"
            style={{
              marginTop: 40,
              maxWidth: 320,
              margin: '40px auto 0',
              height: 8,
              background: 'var(--secondary)',
            }}
          >
            <div className="progress-fill" style={{ width: '72%' }} />
          </div>
          <p
            style={{
              marginTop: 14,
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Estimated time: 15-20 seconds
          </p>
        </div>
      )}
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense fallback={<div style={{ padding: '60px 20px', textAlign: 'center' }}>Loading generator...</div>}>
      <GenerateContent />
    </Suspense>
  );
}
