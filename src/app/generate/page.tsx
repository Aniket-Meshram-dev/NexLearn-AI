'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  ArrowLeft,
  Plus,
  CheckCircle2,
  Layers,
  AlertCircle,
  Play,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit2,
  Check,
  X,
  GraduationCap,
  ShieldCheck,
  BookOpen,
  Rocket,
  Bot,
  Terminal,
  Cloud,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import NexLearnLoader from '@/components/NexLearnLoader';

const POPULAR_PATHWAYS: { Icon: LucideIcon; label: string; topic: string; level: string; goal: string; duration: string }[] = [
  {
    Icon: Rocket,
    label: 'Full-Stack Next.js 15 & React 19',
    topic: 'Full-Stack Next.js 15 & React 19 with Server Actions',
    level: 'Intermediate',
    goal: 'Project Building',
    duration: '4 weeks',
  },
  {
    Icon: Bot,
    label: 'AI Agents & LangGraph',
    topic: 'Autonomous AI Agents with LangChain, LangGraph & Python',
    level: 'Advanced',
    goal: 'Project Building',
    duration: '4 weeks',
  },
  {
    Icon: Layers,
    label: 'System Design for FAANG',
    topic: 'High Scale System Design, Microservices & Distributed Caching',
    level: 'Advanced',
    goal: 'Interview Preparation',
    duration: '8 weeks',
  },
  {
    Icon: Terminal,
    label: 'Rust Systems & Concurrency',
    topic: 'Rust Systems Programming, Concurrency & Memory Safety',
    level: 'Intermediate',
    goal: 'Skill Development',
    duration: '4 weeks',
  },
  {
    Icon: Cloud,
    label: 'Kubernetes & Docker DevOps',
    topic: 'Cloud Native DevOps, Docker Containers & Kubernetes Orchestration',
    level: 'Intermediate',
    goal: 'Skill Development',
    duration: '4 weeks',
  },
];

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
  const [selectedPathway, setSelectedPathway] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savingAction, setSavingAction] = useState<'enroll' | 'save' | null>(null);

  // Syllabus customization state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [showAddModule, setShowAddModule] = useState(false);

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

      setPreview(data.course || data.coursePreview);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPathway = (p: typeof POPULAR_PATHWAYS[0]) => {
    setSelectedPathway(p.label);
    setForm((prev) => ({
      ...prev,
      topic: p.topic,
      level: p.level,
      goal: p.goal,
      duration: p.duration,
    }));
  };

  const handleMoveModule = (index: number, direction: 'up' | 'down') => {
    if (!preview?.modules) return;
    const newModules = [...preview.modules];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newModules.length) return;
    const temp = newModules[index];
    newModules[index] = newModules[targetIndex];
    newModules[targetIndex] = temp;
    setPreview({ ...preview, modules: newModules });
  };

  const handleDeleteModule = (index: number) => {
    if (!preview?.modules) return;
    if (preview.modules.length <= 1) {
      setError('A course must have at least one module.');
      return;
    }
    const newModules = preview.modules.filter((_: any, i: number) => i !== index);
    setPreview({ ...preview, modules: newModules });
  };

  const handleStartEdit = (index: number, currentTitle: string) => {
    setEditingIndex(index);
    setEditingTitle(currentTitle);
  };

  const handleSaveEdit = (index: number) => {
    if (!preview?.modules || !editingTitle.trim()) return;
    const newModules = [...preview.modules];
    newModules[index] = { ...newModules[index], title: editingTitle.trim() };
    setPreview({ ...preview, modules: newModules });
    setEditingIndex(null);
    setEditingTitle('');
  };

  const handleAddCustomModule = () => {
    if (!newModuleTitle.trim() || !preview?.modules) return;
    const newModule = {
      title: newModuleTitle.trim(),
      description: `Custom lesson: ${newModuleTitle.trim()}`,
      difficulty: form.level || 'Intermediate',
      duration: 'Lesson ' + (preview.modules.length + 1),
      notes: `## ${newModuleTitle.trim()}\n\nWelcome to this custom module. Focus on practical implementation and key principles.\n\n---page---\n### Core Concepts\n\nStudy the essential components and practice with hands-on exercises.`,
    };
    setPreview({ ...preview, modules: [...preview.modules, newModule] });
    setNewModuleTitle('');
    setShowAddModule(false);
  };

  const handleAddToAccount = async (enrollNow: boolean = false) => {
    if (!preview || isSaving) return;
    setIsSaving(true);
    setSavingAction(enrollNow ? 'enroll' : 'save');
    setError('');
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: form.topic,
          level: form.level,
          goal: form.goal,
          hoursPerDay: form.hoursPerDay,
          duration: form.duration,
          preGeneratedCourse: preview,
          enrolled: enrollNow,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save course to account');

      const savedCourseId = data.course?.id;

      window.dispatchEvent(
        new CustomEvent('icmsystem_toast', {
          detail: {
            id: 'saved-' + Date.now(),
            title: enrollNow ? 'Ready to Learn!' : 'Saved to Your Courses!',
            message: `"${preview.title}" is ready in your dashboard.`,
            type: 'success',
            read: false,
          },
        })
      );

      if (enrollNow && savedCourseId) {
        router.push(`/course/${savedCourseId}`);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save course');
      setIsSaving(false);
      setSavingAction(null);
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
          Create a New Course
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
          Type any topic you want to learn, and AI will build easy step-by-step lessons for you.
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
            {/* Popular Career Pathways Chips */}
            <div style={{ marginBottom: 22 }}>
              <label className="form-label" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Sparkles size={14} style={{ color: 'var(--accent-primary)' }} />
                <span>Popular Career Pathways (1-Click Fill)</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {POPULAR_PATHWAYS.map((p) => {
                  const isSelected = selectedPathway === p.label || form.topic === p.topic;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => handleSelectPathway(p)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 13px',
                        borderRadius: '999px',
                        fontSize: '0.82rem',
                        fontWeight: isSelected ? 700 : 500,
                        background: isSelected ? 'rgba(99, 102, 241, 0.16)' : 'var(--surface-raised, rgba(255, 255, 255, 0.04))',
                        color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-hairline)',
                        cursor: 'pointer',
                        transition: 'all 0.18s ease',
                      }}
                    >
                      <p.Icon size={14} />
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label" htmlFor="topic" style={{ fontWeight: 600 }}>
                What do you want to learn? *
              </label>
              <input
                type="text"
                id="topic"
                name="topic"
                required
                className="form-input"
                placeholder="e.g., Python Programming, Web Design, Cloud Basics, Digital Marketing..."
                value={form.topic}
                onChange={(e) => {
                  setSelectedPathway(null);
                  setForm({ ...form, topic: e.target.value });
                }}
                style={{ borderRadius: 10, padding: '12px 16px' }}
              />
              <span className="form-hint" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>
                Tip: You can learn anything! Choose a pathway above or type your customized topic.
              </span>
            </div>

            <div className="grid-2" style={{ marginBottom: 20 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Your Level
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
                  What is your main goal?
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
                  Daily Study Time
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
                  Course Length
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
                  <span>Creating your course...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Create Course</span>
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
                <span>Change Settings</span>
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: 24 }}>
              {preview.description}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 14, marginBottom: 24 }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Level</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: 4 }}>{preview.level || form.level}</div>
              </div>
              <div style={{ background: 'var(--bg-secondary)', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Goal</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: 4 }}>{form.goal}</div>
              </div>
              <div style={{ background: 'var(--bg-secondary)', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Daily Study</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: 4 }}>{form.hoursPerDay} hr / day</div>
              </div>
              <div style={{ background: 'var(--bg-secondary)', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Total Lessons</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: 4 }}>{preview.modules?.length || 0} modules</div>
              </div>
            </div>

            {/* Prerequisites & Outcomes Checklist */}
            <div className="grid-2" style={{ gap: 14, marginBottom: 24 }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '16px 18px', borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: '#3b82f6', fontWeight: 700, fontSize: '0.9rem' }}>
                  <BookOpen size={16} />
                  <span>Recommended Prerequisites</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <li>Basic knowledge of foundational concepts</li>
                  <li>Willingness to review interactive step-by-step notes</li>
                  <li>Ready modern browser & environment for exercises</li>
                </ul>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '16px 18px', borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: '#10b981', fontWeight: 700, fontSize: '0.9rem' }}>
                  <ShieldCheck size={16} />
                  <span>Key Competencies & Outcomes</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <li>Mastery of {preview.modules?.length || 0} progressive modules</li>
                  <li>Verified Tamper-Evident Credential upon quiz completion</li>
                  <li>Direct AI Mentor support for all exercise questions</li>
                </ul>
              </div>
            </div>

            {/* Editable Interactive Syllabus */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Layers size={18} style={{ color: 'var(--primary)' }} />
                  <span>Course Modules ({preview.modules?.length || 0})</span>
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    Reorder or edit lessons
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddModule(!showAddModule)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.78rem', padding: '5px 12px', borderRadius: 7, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    <Plus size={13} />
                    <span>Add Lesson</span>
                  </button>
                </div>
              </div>

              {showAddModule && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 14, padding: 12, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <input
                    type="text"
                    placeholder="Enter custom lesson title (e.g. Advanced Production Deployment)..."
                    value={newModuleTitle}
                    onChange={(e) => setNewModuleTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomModule())}
                    className="form-input"
                    style={{ flex: 1, padding: '8px 12px', fontSize: '0.88rem', borderRadius: 8 }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomModule}
                    className="btn btn-primary btn-sm"
                    disabled={!newModuleTitle.trim()}
                    style={{ padding: '8px 14px', borderRadius: 8, fontSize: '0.84rem' }}
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAddModule(false); setNewModuleTitle(''); }}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '8px 12px', borderRadius: 8, fontSize: '0.84rem' }}
                  >
                    Cancel
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {preview.modules?.map((m: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      padding: '12px 16px',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 14,
                      background: 'var(--bg)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 9,
                          background: 'var(--primary)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.84rem',
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </div>

                      {editingIndex === i ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSaveEdit(i))}
                            className="form-input"
                            style={{ flex: 1, padding: '5px 10px', fontSize: '0.88rem', borderRadius: 7 }}
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(i)}
                            style={{ background: 'transparent', border: 'none', color: '#10b981', cursor: 'pointer', padding: 6 }}
                            title="Save title"
                          >
                            <Check size={17} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingIndex(null)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 6 }}
                            title="Cancel"
                          >
                            <X size={17} />
                          </button>
                        </div>
                      ) : (
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.92rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {m.title}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                            {m.duration || 'Lesson ' + (i + 1)} • {m.difficulty || form.level}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Reorder and Edit Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => handleMoveModule(i, 'up')}
                        disabled={i === 0}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: i === 0 ? 'var(--border)' : 'var(--text-secondary)',
                          cursor: i === 0 ? 'not-allowed' : 'pointer',
                          padding: 5,
                          borderRadius: 5,
                        }}
                        title="Move Up"
                      >
                        <ArrowUp size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveModule(i, 'down')}
                        disabled={i === (preview.modules.length - 1)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: i === (preview.modules.length - 1) ? 'var(--border)' : 'var(--text-secondary)',
                          cursor: i === (preview.modules.length - 1) ? 'not-allowed' : 'pointer',
                          padding: 5,
                          borderRadius: 5,
                        }}
                        title="Move Down"
                      >
                        <ArrowDown size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(i, m.title)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          padding: 5,
                          borderRadius: 5,
                        }}
                        title="Edit Title"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteModule(i)}
                        disabled={preview.modules.length <= 1}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: preview.modules.length <= 1 ? 'var(--border)' : '#ef4444',
                          cursor: preview.modules.length <= 1 ? 'not-allowed' : 'pointer',
                          padding: 5,
                          borderRadius: 5,
                        }}
                        title="Delete Module"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '24px' }}>
              <button
                onClick={() => handleAddToAccount(true)}
                className="btn btn-primary btn-lg"
                disabled={isSaving}
                style={{
                  flex: '1 1 240px',
                  padding: '16px',
                  fontSize: '1.02rem',
                  fontWeight: 700,
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {isSaving && savingAction === 'enroll' ? (
                  <>
                    <span className="spinner spinner-sm" style={{ width: 16, height: 16 }} />
                    <span>Opening Course...</span>
                  </>
                ) : (
                  <>
                    <Play size={18} fill="currentColor" />
                    <span>Start Course Now</span>
                  </>
                )}
              </button>
              <button
                onClick={() => handleAddToAccount(false)}
                className="btn btn-secondary btn-lg"
                disabled={isSaving}
                style={{
                  flex: '1 1 180px',
                  padding: '16px',
                  fontSize: '1rem',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {isSaving && savingAction === 'save' ? (
                  <>
                    <span className="spinner spinner-sm" style={{ width: 16, height: 16 }} />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    <span>Save for Later</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div style={{ marginTop: 24 }}>
          <NexLearnLoader
            title="Creating your course..."
            subtitle={`Getting lessons, simple notes, and practice quizzes ready for "${form.topic}".`}
            steps={[
              'Planning lesson topics',
              'Writing clear notes and examples',
              'Adding practice questions and quizzes',
            ]}
            estimatedTime="Takes about 10-15 seconds"
          />
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
