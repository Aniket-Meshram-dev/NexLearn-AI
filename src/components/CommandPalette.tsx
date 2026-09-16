'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  BookOpen,
  FileText,
  Sparkles,
  LayoutDashboard,
  Compass,
  BarChart3,
  Bookmark,
  Trophy,
  User,
  Settings,
  Layers,
  ArrowRight,
  CornerDownLeft,
  X,
  Command,
} from 'lucide-react';

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  type: 'navigation' | 'action' | 'course' | 'module';
  icon?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    navigation: SearchResultItem[];
    courses: SearchResultItem[];
    modules: SearchResultItem[];
  }>({
    navigation: [],
    courses: [],
    modules: [],
  });
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Flatten items for keyboard navigation
  const flatItems: SearchResultItem[] = useMemo(
    () => [...results.navigation, ...results.courses, ...results.modules],
    [results.navigation, results.courses, results.modules]
  );

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Fetch search results (with debounce)
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/user/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults({
            navigation: data.navigation || [],
            courses: data.courses || [],
            modules: data.modules || [],
          });
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  // Handle item selection
  const handleSelect = useCallback(
    (item: SearchResultItem) => {
      onClose();
      router.push(item.href);
    },
    [router, onClose]
  );

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (flatItems.length > 0 ? (prev + 1) % flatItems.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          flatItems.length > 0 ? (prev - 1 + flatItems.length) % flatItems.length : 0
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (flatItems[selectedIndex]) {
          handleSelect(flatItems[selectedIndex]);
        } else if (query.trim()) {
          // If no result selected, jump to generate course
          onClose();
          router.push(`/generate?topic=${encodeURIComponent(query.trim())}`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, flatItems, selectedIndex, handleSelect, onClose, query, router]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector('.palette-item-active');
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  const renderIcon = (item: SearchResultItem) => {
    if (item.type === 'course') return <BookOpen size={17} style={{ color: 'var(--primary)' }} />;
    if (item.type === 'module') return <FileText size={17} style={{ color: '#06b6d4' }} />;
    if (item.icon === 'Sparkles') return <Sparkles size={17} style={{ color: '#f59e0b' }} />;
    if (item.icon === 'Layers') return <Layers size={17} style={{ color: '#8b5cf6' }} />;
    if (item.icon === 'Compass') return <Compass size={17} style={{ color: '#ec4899' }} />;
    if (item.icon === 'BarChart3') return <BarChart3 size={17} style={{ color: '#10b981' }} />;
    if (item.icon === 'Bookmark') return <Bookmark size={17} style={{ color: '#f97316' }} />;
    if (item.icon === 'Trophy') return <Trophy size={17} style={{ color: '#eab308' }} />;
    if (item.icon === 'User') return <User size={17} style={{ color: '#6366f1' }} />;
    if (item.icon === 'Settings') return <Settings size={17} style={{ color: '#64748b' }} />;
    return <LayoutDashboard size={17} style={{ color: 'var(--primary)' }} />;
  };

  let globalIndexCounter = 0;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(11, 13, 19, 0.75)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
        paddingLeft: '16px',
        paddingRight: '16px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '640px',
          maxWidth: '100%',
          background: 'var(--bg-white)',
          borderRadius: '20px',
          border: '1px solid var(--border)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'paletteScale 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Search Input Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg)',
          }}
        >
          <Search size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, modules, flashcards, or commands..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '1.05rem',
              fontWeight: 500,
              color: 'var(--text)',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
              }}
            >
              <X size={16} />
            </button>
          )}
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              background: 'var(--border)',
              padding: '3px 8px',
              borderRadius: '6px',
              textTransform: 'uppercase',
            }}
          >
            ESC
          </div>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          style={{
            maxHeight: '380px',
            overflowY: 'auto',
            padding: '12px',
          }}
        >
          {loading && flatItems.length === 0 && (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Searching...
            </div>
          )}

          {!loading && flatItems.length === 0 && query.trim() && (
            <div style={{ padding: '36px 20px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 16px 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                No direct matches found for &quot;{query}&quot;
              </p>
              <button
                onClick={() => {
                  onClose();
                  router.push(`/generate?topic=${encodeURIComponent(query.trim())}`);
                }}
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderRadius: '10px',
                  padding: '10px 18px',
                  fontSize: '0.9rem',
                }}
              >
                <Sparkles size={16} />
                <span>Generate AI Course on &quot;{query}&quot;</span>
              </button>
            </div>
          )}

          {/* Navigation & Actions */}
          {results.navigation.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '6px 12px',
                }}
              >
                Navigation & Commands
              </div>
              {results.navigation.map((item) => {
                const itemIndex = globalIndexCounter++;
                const isSelected = itemIndex === selectedIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(itemIndex)}
                    className={isSelected ? 'palette-item-active' : ''}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      background: isSelected ? 'var(--primary-bg)' : 'transparent',
                      color: isSelected ? 'var(--primary)' : 'var(--text)',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {renderIcon(item)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{item.title}</div>
                        <div style={{ fontSize: '0.78rem', color: isSelected ? 'var(--primary)' : 'var(--text-secondary)' }}>
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                    {isSelected && <CornerDownLeft size={16} style={{ opacity: 0.8 }} />}
                  </div>
                );
              })}
            </div>
          )}

          {/* Courses */}
          {results.courses.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '6px 12px',
                }}
              >
                Your Courses
              </div>
              {results.courses.map((item) => {
                const itemIndex = globalIndexCounter++;
                const isSelected = itemIndex === selectedIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(itemIndex)}
                    className={isSelected ? 'palette-item-active' : ''}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      background: isSelected ? 'var(--primary-bg)' : 'transparent',
                      color: isSelected ? 'var(--primary)' : 'var(--text)',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {renderIcon(item)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{item.title}</div>
                        <div style={{ fontSize: '0.78rem', color: isSelected ? 'var(--primary)' : 'var(--text-secondary)' }}>
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                    {isSelected && <CornerDownLeft size={16} style={{ opacity: 0.8 }} />}
                  </div>
                );
              })}
            </div>
          )}

          {/* Modules */}
          {results.modules.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '6px 12px',
                }}
              >
                Modules & Topics
              </div>
              {results.modules.map((item) => {
                const itemIndex = globalIndexCounter++;
                const isSelected = itemIndex === selectedIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(itemIndex)}
                    className={isSelected ? 'palette-item-active' : ''}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      background: isSelected ? 'var(--primary-bg)' : 'transparent',
                      color: isSelected ? 'var(--primary)' : 'var(--text)',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: isSelected ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {renderIcon(item)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{item.title}</div>
                        <div style={{ fontSize: '0.78rem', color: isSelected ? 'var(--primary)' : 'var(--text-secondary)' }}>
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                    {isSelected && <CornerDownLeft size={16} style={{ opacity: 0.8 }} />}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div
          style={{
            padding: '10px 20px',
            background: 'var(--bg)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span>
              <strong style={{ color: 'var(--text)' }}>↑↓</strong> Navigate
            </span>
            <span>
              <strong style={{ color: 'var(--text)' }}>↵</strong> Select
            </span>
            <span>
              <strong style={{ color: 'var(--text)' }}>esc</strong> Close
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Command size={12} />
            <span>NexLearn QuickNav</span>
          </div>
        </div>
      </div>
    </div>
  );
}
