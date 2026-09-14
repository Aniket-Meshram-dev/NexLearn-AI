'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const popularTopics = [
  'Web Development', 'Python Programming', 'Machine Learning', 
  'Data Structures', 'Digital Marketing', 'Graphic Design'
];

const icons = ['💻', '🐍', '🤖', '🌳', '📱', '🎨'];

function DiscoverContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');

  useEffect(() => {
    const query = searchParams.get('search');
    if (query) setSearch(query);
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      const topic = search.trim();
      setSearch(''); // Clear input
      const params = new URLSearchParams({ topic });
      router.push(`/generate?${params.toString()}`);
    }
  };

  return (
    <div className="discover-container" style={{ maxWidth: 1000, margin: '0 auto', padding: '0 16px' }}>
      <div className="page-header" style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.75rem)', marginBottom: 12, fontWeight: 800, letterSpacing: '-0.03em' }}>
          🔍 Discover Courses
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
          Find new topics to learn or generate custom courses instantly
        </p>
      </div>

      <div className="card discover-hero" style={{ 
        padding: 'clamp(24px, 5vw, 48px)', 
        marginBottom: 40, 
        textAlign: 'center', 
        background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', 
        color: 'white',
        borderRadius: 24,
        boxShadow: '0 20px 40px rgba(79, 70, 229, 0.2)'
      }}>
        <h2 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.75rem)', marginBottom: 24, fontWeight: 700 }}>
          What do you want to learn today?
        </h2>
        <form onSubmit={handleSearch} style={{ 
          display: 'flex', 
          gap: 12, 
          maxWidth: 640, 
          margin: '0 auto',
          flexDirection: 'row',
          flexWrap: 'wrap'
        }}>
          <input 
            type="text" 
            placeholder="Search for any topic..." 
            className="form-input" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              flex: '1 1 300px', 
              padding: '16px 28px', 
              fontSize: '1.1rem', 
              borderRadius: '50px', 
              border: 'none', 
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
              background: 'white',
              color: 'var(--text)'
            }}
          />
          <button type="submit" className="btn btn-secondary discover-search-btn" style={{ 
            borderRadius: '50px', 
            padding: '16px 36px', 
            fontSize: '1.1rem', 
            fontWeight: 700,
            background: 'white',
            color: 'var(--primary)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
            border: 'none'
          }}>
            Generate →
          </button>
        </form>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <span style={{ fontSize: '1.5rem' }}>🔥</span>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>Popular Roadmap Topics</h2>
      </div>
      
      <div className="grid-auto" style={{ marginBottom: 48, gap: 24 }}>
        {popularTopics.map((topic, i) => (
          <Link key={i} href={`/generate?topic=${encodeURIComponent(topic)}`} className="card topic-card" style={{ 
            textDecoration: 'none', 
            textAlign: 'center', 
            padding: '32px 24px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: 16, 
            borderRadius: 20,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            <div style={{ 
              width: 64, height: 64, borderRadius: '20px', 
              background: 'var(--primary-bg)', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', 
              fontSize: '2rem',
              boxShadow: 'inset 0 0 0 1px rgba(79, 70, 229, 0.1)'
            }}>
              {icons[i]}
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{topic}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Complete learning roadmap</p>
            </div>
            <span style={{ 
              fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 700, 
              padding: '6px 16px', borderRadius: '50px', 
              background: 'var(--primary-bg)',
              marginTop: 'auto'
            }}>Start →</span>
          </Link>
        ))}
      </div>
      
      <div className="card" style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        gap: 32, padding: '32px 40px', borderRadius: 24,
        background: 'var(--bg-white)',
        border: '1px solid var(--border)',
        flexDirection: 'row',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: '1 1 300px' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8, color: 'var(--text)' }}>Custom Roadmap?</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>
            Use our AI Course Generator to create a perfectly tailored learning path for any niche topic.
          </p>
        </div>
        <Link href="/generate" className="btn btn-primary btn-lg" style={{ borderRadius: 16, padding: '16px 32px' }}>
          🤖 Launch Generator
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

