'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Compass,
  Search,
  Code2,
  Terminal,
  BrainCircuit,
  GitBranch,
  Smartphone,
  Palette,
  Flame,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

const popularTopicData = [
  { topic: 'Web Development', icon: Code2, desc: 'Full-stack modern web apps' },
  { topic: 'Python Programming', icon: Terminal, desc: 'Scripts, backend & automation' },
  { topic: 'Machine Learning', icon: BrainCircuit, desc: 'Deep learning & neural networks' },
  { topic: 'Data Structures', icon: GitBranch, desc: 'Algorithms & core CS foundations' },
  { topic: 'Digital Marketing', icon: Smartphone, desc: 'Growth strategies & metrics' },
  { topic: 'Graphic Design', icon: Palette, desc: 'UI/UX & visual principles' },
];

function DiscoverContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');

  useEffect(() => {
    const query = searchParams.get('search');
    if (query) setSearch(query);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      const topic = search.trim();
      setSearch('');
      const params = new URLSearchParams({ topic });
      router.push(`/generate?${params.toString()}`);
    }
  };

  return (
    <div className="discover-container" style={{ maxWidth: 1040, margin: '0 auto', padding: '0 16px' }}>
      <div className="page-header" style={{ textAlign: 'center', marginBottom: 36 }}>
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
          <Compass size={26} />
        </div>
        <h1
          style={{
            fontSize: 'clamp(2rem, 4.5vw, 2.75rem)',
            marginBottom: 8,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          Discover Knowledge Pathways
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
          Explore curated curriculums or let AI synthesize a custom syllabus instantly
        </p>
      </div>

      <div
        className="card discover-hero"
        style={{
          padding: 'clamp(28px, 5vw, 48px)',
          marginBottom: 44,
          textAlign: 'center',
          background: 'linear-gradient(135deg, var(--primary) 0%, #3730a3 100%)',
          color: 'white',
          borderRadius: 24,
          boxShadow: '0 20px 40px rgba(79, 70, 229, 0.25)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.85rem)', marginBottom: 20, fontWeight: 800 }}>
          What skill do you want to master today?
        </h2>
        <form
          onSubmit={handleSearch}
          style={{
            display: 'flex',
            gap: 12,
            maxWidth: 640,
            margin: '0 auto',
            flexDirection: 'row',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <input
              type="text"
              placeholder="Search or enter any topic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 28px',
                fontSize: '1rem',
                borderRadius: '50px',
                border: 'none',
                boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                background: 'white',
                color: '#1e293b',
                outline: 'none',
              }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-secondary"
            style={{
              borderRadius: '50px',
              padding: '16px 32px',
              fontSize: '1rem',
              fontWeight: 700,
              background: 'white',
              color: 'var(--primary)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
              border: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Sparkles size={16} />
            <span>Synthesize Course</span>
          </button>
        </form>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
        <Flame size={20} style={{ color: '#F59E0B' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
          Trending Curriculums
        </h2>
      </div>

      <div className="grid-3" style={{ marginBottom: 48, gap: 20 }}>
        {popularTopicData.map((item, i) => {
          const IconComp = item.icon;
          return (
            <Link
              key={i}
              href={`/generate?topic=${encodeURIComponent(item.topic)}`}
              className="card topic-card"
              style={{
                textDecoration: 'none',
                padding: '28px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 16,
                borderRadius: 20,
                border: '1px solid var(--border)',
                background: 'var(--bg-white)',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '14px',
                  background: 'var(--primary-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                  boxShadow: 'inset 0 0 0 1px rgba(99, 102, 241, 0.2)',
                }}
              >
                <IconComp size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 4px 0' }}>
                  {item.topic}
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>{item.desc}</p>
              </div>
              <span
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: 'auto',
                }}
              >
                <span>Launch Roadmap</span>
                <ArrowRight size={14} />
              </span>
            </Link>
          );
        })}
      </div>

      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 28,
          padding: '36px 40px',
          borderRadius: 24,
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.06) 0%, rgba(168, 85, 247, 0.04) 100%)',
          border: '1px solid var(--border)',
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginBottom: 32,
        }}
      >
        <div style={{ flex: '1 1 300px' }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text)' }}>
            Need a niche or custom roadmap?
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
            Use our AI Course Generator to create an adaptive, tailored learning path with interactive quizzes and theory for any skill.
          </p>
        </div>
        <Link
          href="/generate"
          className="btn btn-primary btn-lg"
          style={{
            borderRadius: 14,
            padding: '14px 28px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Sparkles size={18} />
          <span>Launch AI Generator</span>
        </Link>
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<div style={{ padding: '60px 20px', textAlign: 'center' }}>Loading courses...</div>}>
      <DiscoverContent />
    </Suspense>
  );
}
