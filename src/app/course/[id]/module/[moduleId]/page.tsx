'use client';
import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import MindmapFlow from '@/components/mindmap/MindmapFlow';
import {
  BookOpen,
  GitFork,
  Lightbulb,
  FileText,
  Dumbbell,
  Video,
  Lock,
  Bookmark,
  Volume2,
  Square,
  CheckCircle2,
  Layers,
  BarChart3,
  RotateCcw,
  ClipboardCheck,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  Check,
  Headphones,
  Play,
  Sparkles,
  Trophy,
  Edit3,
  Download,
  HardDrive,
} from 'lucide-react';
import AudioExplainerPlayer from '@/components/audio/AudioExplainerPlayer';
import { generateStudyGuidePDF } from '@/lib/studyGuidePdf';
import { saveModuleOffline, getOfflineModule } from '@/lib/offlineStorage';

export default function LearningModulePage() {
  const { id, moduleId } = useParams();
  const router = useRouter();
  const [mod, setMod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notes');
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [completingModule, setCompletingModule] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [loadingMindmap, setLoadingMindmap] = useState(false);
  const [showAudioExplainer, setShowAudioExplainer] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [enrichingSections, setEnrichingSections] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const autoEnrichSectionsTried = useRef<Record<string, boolean>>({});

  // Target pages: exactly 2 pages per module with 400-500 words on each page
  const courseLevel = mod?.course?.level || mod?.difficulty || 'Intermediate';
  const targetPagesForLevel = 2;

  // Paginated notes state & interactive exercises state
  const [notePage, setNotePage] = useState(0);
  const [solvedExercises, setSolvedExercises] = useState<Record<number, boolean>>({});
  const [expandedHints, setExpandedHints] = useState<Record<number, boolean>>({});
  const [expandedSolutions, setExpandedSolutions] = useState<Record<number, boolean>>({});
  const [userSolutions, setUserSolutions] = useState<Record<number, string>>({});

  // Active study session heartbeat while learning
  useEffect(() => {
    let lastActive = Date.now();
    const handleActivity = () => { lastActive = Date.now(); };

    window.addEventListener('mousemove', handleActivity, { passive: true });
    window.addEventListener('keydown', handleActivity, { passive: true });
    window.addEventListener('scroll', handleActivity, { passive: true });
    window.addEventListener('click', handleActivity, { passive: true });

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && Date.now() - lastActive < 120000) {
        fetch('/api/user/study-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ duration: 1 }),
        }).catch(() => {});
      }
    }, 60000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
  }, [id, moduleId]);

  const handleExportStudyGuide = async () => {
    if (exportingPdf || !mod) return;
    setExportingPdf(true);
    try {
      await generateStudyGuidePDF({
        title: mod.title,
        courseTitle: mod.course?.title,
        difficulty: mod.difficulty || mod.course?.level,
        notes: mod.notes,
        summary: mod.summary,
        examples: mod.examples,
        exercises: mod.exercises,
      });
      window.dispatchEvent(
        new CustomEvent('icmsystem_toast', {
          detail: {
            id: 'pdf-exported-' + Date.now(),
            title: 'Study Guide Downloaded!',
            message: 'Your high-res revision PDF has been generated successfully.',
            type: 'success',
          },
        })
      );
    } catch (err: any) {
      console.error('Failed to export study guide PDF:', err);
      window.dispatchEvent(
        new CustomEvent('icmsystem_toast', {
          detail: {
            id: 'pdf-err-' + Date.now(),
            title: 'Export Error',
            message: 'Could not generate PDF. Please try again.',
            type: 'warning',
          },
        })
      );
    } finally {
      setExportingPdf(false);
    }
  };

  const handleEnrichNotes = async () => {
    if (enriching) return;
    setEnriching(true);
    try {
      const res = await fetch(`/api/courses/${id}/modules/${moduleId}/enrich`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to deepen notes');
      if (data.module) {
        setMod((prev: any) => ({
          ...prev,
          notes: data.module.notes || prev?.notes,
          exercises: data.module.exercises || prev?.exercises,
          examples: data.module.examples || prev?.examples,
          summary: data.module.summary || prev?.summary,
        }));
        setNotePage(0);
        window.dispatchEvent(
          new CustomEvent('icmsystem_toast', {
            detail: {
              id: 'enrich-' + Date.now(),
              title: 'Notes Deepened!',
              message: `Module successfully formatted to 2 full pages (400-500 words/page).`,
              type: 'success',
            },
          })
        );
      }
    } catch (err: any) {
      console.error(err);
      window.dispatchEvent(
        new CustomEvent('icmsystem_toast', {
          detail: {
            id: 'enrich-err-' + Date.now(),
            title: 'Expansion Notice',
            message: err.message || 'Could not expand notes automatically.',
            type: 'warning',
          },
        })
      );
    } finally {
      setEnriching(false);
    }
  };

  const handleEnrichSections = async (silent = false) => {
    if (enrichingSections || enriching) return;
    setEnrichingSections(true);
    try {
      const res = await fetch(`/api/courses/${id}/modules/${moduleId}/enrich`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expandSectionsOnly: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to expand examples & summary');
      if (data.module) {
        setMod((prev: any) => ({
          ...prev,
          examples: data.module.examples || prev?.examples,
          summary: data.module.summary || prev?.summary,
        }));
        if (!silent) {
          window.dispatchEvent(
            new CustomEvent('icmsystem_toast', {
              detail: {
                id: 'enrich-sec-' + Date.now(),
                title: 'Section Deepened!',
                message: 'Concrete worked examples and comprehensive summary generated.',
                type: 'success',
              },
            })
          );
        }
      }
    } catch (err: any) {
      console.error(err);
      if (!silent) {
        window.dispatchEvent(
          new CustomEvent('icmsystem_toast', {
            detail: {
              id: 'enrich-sec-err-' + Date.now(),
              title: 'Expansion Notice',
              message: err.message || 'Could not expand section automatically.',
              type: 'warning',
            },
          })
        );
      }
    } finally {
      setEnrichingSections(false);
    }
  };

  useEffect(() => {
    setNotePage(0);
    setSolvedExercises({});
    setExpandedHints({});
    setExpandedSolutions({});
    setUserSolutions({});
  }, [moduleId]);

  useEffect(() => {
    fetch(`/api/courses/${id}/modules/${moduleId}`)
      .then(async r => {
        if (!r.ok) {
          const errData = await r.json().catch(() => ({}));
          if (r.status === 403 && errData.isLocked) {
            setMod({ locked: true, error: errData.error });
            setLoading(false);
            return null;
          }
          throw new Error('Failed to fetch module');
        }
        return r.json();
      }).then(d => {
        if (d && d.module) {
          setMod(d.module);
          setBookmarked(d.module.bookmarks && d.module.bookmarks.length > 0);
          saveModuleOffline(String(id), d.module); // Auto-cache module offline
          setLoading(false);
        }
      })
      .catch(async () => {
        // Fallback to offline IndexedDB storage
        const cachedModule = await getOfflineModule(String(id), String(moduleId));
        if (cachedModule) {
          setMod({
            ...cachedModule,
            isOfflineCached: true,
          });
        }
        setLoading(false);
      });
  }, [id, moduleId]);

  useEffect(() => {
    if (activeTab === 'videos' && videos.length === 0 && !loadingVideos) {
      setLoadingVideos(true);
      const searchQuery = `${mod.course?.title || ''} ${mod.title}`.trim();
      fetch(`/api/videos/search?q=${encodeURIComponent(searchQuery)}`)
        .then(res => res.json())
        .then(data => {
          if (data.videos && data.videos.length > 0) {
            setVideos(data.videos);
          }
          setLoadingVideos(false);
        })
        .catch(err => {
          console.error(err);
          setLoadingVideos(false);
        });
    }
  }, [activeTab, mod?.title]);

  useEffect(() => {
    if (activeTab === 'mindmap' && mod && !mod.mindmap && !loadingMindmap) {
      setLoadingMindmap(true);
      fetch(`/api/courses/${id}/modules/${moduleId}/mindmap`, {
        method: 'POST',
      })
        .then(res => res.json())
        .then(data => {
          if (data.mindmap) {
            setMod(prev => ({ ...prev, mindmap: data.mindmap }));
          }
          setLoadingMindmap(false);
        })
        .catch(err => {
          console.error('Failed to load mindmap', err);
          setLoadingMindmap(false);
        });
    }
  }, [activeTab, mod, loadingMindmap, id, moduleId]);

  const handleRegenerateMindmap = async () => {
    if (loadingMindmap) return;
    setLoadingMindmap(true);
    try {
      const res = await fetch(`/api/courses/${id}/modules/${moduleId}/mindmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceRegenerate: true }),
      });
      const data = await res.json();
      if (data.mindmap) {
        setMod((prev: any) => ({ ...prev, mindmap: data.mindmap }));
        window.dispatchEvent(
          new CustomEvent('icmsystem_toast', {
            detail: {
              id: 'mm-regen-' + Date.now(),
              title: 'Mind Map Regenerated!',
              message: 'Interactive visual structure updated from notes.',
              type: 'success',
            },
          })
        );
      }
    } catch (err) {
      console.error('Failed to regenerate mindmap', err);
    } finally {
      setLoadingMindmap(false);
    }
  };

  const handleComplete = async () => {
    setCompletingModule(true);
    const res = await fetch(`/api/courses/${id}/modules/${moduleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true }),
    });
    const data = await res.json();
    setCompletingModule(false);
    if (data.unlockedAchievements && data.unlockedAchievements.length > 0) {
      data.unlockedAchievements.forEach(notif => {
        window.dispatchEvent(new CustomEvent('icmsystem_toast', { detail: notif }));
      });
    }
    setMod(prev => ({ ...prev, completed: true }));
  };

  const toggleBookmark = async () => {
    const method = bookmarked ? 'DELETE' : 'POST';
    await fetch('/api/user/bookmarks', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moduleId })
    });
    setBookmarked(!bookmarked);
  };

  const tabs = ['notes', 'mindmap', 'examples', 'summary', 'exercises', 'videos'];
  const tabIcons: Record<string, React.ReactNode> = {
    notes: <BookOpen size={18} />,
    mindmap: <GitFork size={18} />,
    examples: <Lightbulb size={18} />,
    summary: <FileText size={18} />,
    exercises: <Dumbbell size={18} />,
    videos: <Video size={18} />,
  };
  const content = {
    notes: mod?.notes || '',
    examples: mod?.examples || '',
    summary: mod?.summary || '',
    exercises: mod?.exercises || '',
  };

  const sectionMeta = {
    notes: {
      title: 'Theory & Notes',
      description: 'Core concepts and detailed explanations — read through the theory to build your foundation.',
      accentClass: 'section-accent-notes',
    },
    mindmap: {
      title: 'Visual Mind Map',
      description: 'A visual relationship structure of the core concepts generated by AI for easier understanding.',
      accentClass: 'section-accent-notes',
    },
    examples: {
      title: 'Real-World Examples',
      description: 'See how the theory works in practice with concrete demonstrations and case studies.',
      accentClass: 'section-accent-examples',
    },
    summary: {
      title: 'Quick Summary',
      description: 'A concise recap of the key takeaways from the notes — perfect for revision.',
      accentClass: 'section-accent-summary',
    },
    exercises: {
      title: 'Practice Exercises',
      description: 'Challenge yourself with these problems — solve them independently to solidify your learning.',
      accentClass: 'section-accent-exercises',
    },
    videos: {
      title: 'Related Videos',
      description: 'Hand-picked YouTube videos related to this module to enhance your understanding.',
      accentClass: 'section-accent-videos',
    },
  };

  // Split notes into pages based on delimiter or logical chapter divisions
  const notePages = useMemo(() => {
    if (!mod?.notes) return [];

    const raw = mod.notes.trim();

    // 1. Explicit page break delimiters (---page--- or <!-- page -->)
    const explicitParts = raw.split(/\n\s*(?:---+|\*\*\*+|<!--+)\s*page\s*(?:---+|\*\*\*+|--+>)?\s*\n/i);
    if (explicitParts.length > 1) {
      return explicitParts.map((p: string) => p.trim()).filter(Boolean);
    }

    // 2. Explicit Page Headings delimiter: split on "\n## Page \d+"
    const pageHeadingParts = raw.split(/(?=\n##\s+Page\s+\d+)/i);
    if (pageHeadingParts.length > 1) {
      return pageHeadingParts.map((p: string) => p.trim()).filter(Boolean);
    }

    // 3. Fallback: Markdown horizontal rules (\n---\n)
    const hrParts = raw.split(/\n\s*---\s*\n/);
    if (hrParts.length > 1) {
      return hrParts.map((p: string) => p.trim()).filter(Boolean);
    }

    // 4. Fallback for long legacy notes: split on major headings (## )
    const words = raw.split(/\s+/);
    if (words.length > 300) {
      const headingChunks = raw.split(/(?=\n##\s+)/);
      if (headingChunks.length >= 2) {
        const pages: string[] = [];
        let current = '';
        for (const chunk of headingChunks) {
          if (!current) {
            current = chunk;
          } else if ((current + chunk).split(/\s+/).length < 350) {
            current += '\n\n' + chunk;
          } else {
            pages.push(current.trim());
            current = chunk;
          }
        }
        if (current) pages.push(current.trim());
        if (pages.length > 1) return pages;
      }
    }

    return [raw];
  }, [mod?.notes]);

  // Total words and average words per page to detect thin 1-paragraph pages
  const totalWordsInNotes = useMemo(() => {
    return (mod?.notes || '').split(/\s+/).filter(Boolean).length;
  }, [mod?.notes]);

  const avgWordsPerPage = useMemo(() => {
    return notePages.length > 0 ? Math.round(totalWordsInNotes / notePages.length) : 0;
  }, [totalWordsInNotes, notePages.length]);

  const isContentThin = useMemo(() => {
    if (!mod?.notes) return true;
    return notePages.length < targetPagesForLevel || avgWordsPerPage < 300;
  }, [mod?.notes, notePages.length, targetPagesForLevel, avgWordsPerPage]);

  const autoEnrichTried = useRef<Record<string, boolean>>({});

  // Check if examples or summary are thin (< 50 words)
  const isExamplesThin = useMemo(() => {
    const text = mod?.examples || '';
    return text.split(/\s+/).filter(Boolean).length < 50;
  }, [mod?.examples]);

  const isSummaryThin = useMemo(() => {
    const text = mod?.summary || '';
    return text.split(/\s+/).filter(Boolean).length < 50;
  }, [mod?.summary]);

  // Auto-enrich notes seamlessly if content is thin (< 2 pages or < 300 words avg) so user NEVER has to manually click "deepen"
  useEffect(() => {
    const modKey = String(moduleId || '');
    if (mod && !mod.locked && isContentThin && !enriching && modKey && !autoEnrichTried.current[modKey]) {
      autoEnrichTried.current[modKey] = true;
      handleEnrichNotes();
    }
  }, [moduleId, mod, isContentThin, enriching]);

  // Seamlessly deepen examples and summary if user opens that tab and content is thin (< 50 words)
  useEffect(() => {
    const modKey = String(moduleId || '');
    if (!mod || mod.locked || !modKey || enriching || enrichingSections) return;

    if (
      (activeTab === 'examples' && isExamplesThin) ||
      (activeTab === 'summary' && isSummaryThin)
    ) {
      const tabKey = `${modKey}::${activeTab}`;
      if (!autoEnrichSectionsTried.current[tabKey]) {
        autoEnrichSectionsTried.current[tabKey] = true;
        handleEnrichSections(true);
      }
    }
  }, [activeTab, mod, isExamplesThin, isSummaryThin, enriching, enrichingSections, moduleId]);

  const changeNotePage = (newPage: number) => {
    if (newPage < 0 || newPage >= notePages.length) return;
    setNotePage(newPage);
    if (typeof window !== 'undefined') {
      const card = document.querySelector('.premium-content-card');
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Keyboard navigation for notes: Left / Right arrows flip pages
  useEffect(() => {
    if (activeTab !== 'notes' || notePages.length <= 1) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        if (notePage < notePages.length - 1) {
          changeNotePage(notePage + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (notePage > 0) {
          changeNotePage(notePage - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, notePage, notePages.length]);

  // Structured exercises parser for interactive challenges
  const parsedExercises = useMemo(() => {
    if (!mod?.exercises) return [];

    const raw = mod.exercises.trim();

    // Match chunks starting with ### Challenge or ### Exercise or numbered items
    const chunks = raw.split(/(?=\n###\s+|\n(?:\d+\.|\*\*Exercise\s+\d+:?|\*\*Challenge\s+\d+:?))/i);

    if (chunks.length > 1) {
      return chunks.map((chunk, index) => {
        let text = chunk.trim();
        let title = `Practice Challenge ${index + 1}`;
        let hint: string | undefined;
        let solution: string | undefined;

        const titleMatch = text.match(/^(?:###\s*|\*\*)([^\n*]+)(?:\*\*)?/);
        if (titleMatch) {
          title = titleMatch[1].trim();
          text = text.replace(/^(?:###\s*|\*\*)([^\n*]+)(?:\*\*)?/, '').trim();
        }

        const detailsMatch = text.match(/<details>[\s\S]*?<summary>(.*?)<\/summary>([\s\S]*?)<\/details>/i);
        if (detailsMatch) {
          solution = detailsMatch[2].trim();
          text = text.replace(/<details>[\s\S]*?<\/details>/i, '').trim();
        }

        const hintMatch = text.match(/(?:>\s*)?(?:\*\*Hint\*\*|Hint):\s*([^\n]+(?:\n[^\n]+)?)/i);
        if (hintMatch) {
          hint = hintMatch[1].trim();
          text = text.replace(/(?:>\s*)?(?:\*\*Hint\*\*|Hint):\s*[^\n]+(?:\n[^\n]+)?/i, '').trim();
        }

        if (!solution) {
          const solMatch = text.match(/(?:>\s*)?(?:\*\*Solution\*\*|Solution):\s*([\s\S]+)/i);
          if (solMatch) {
            solution = solMatch[1].trim();
            text = text.replace(/(?:>\s*)?(?:\*\*Solution\*\*|Solution):\s*[\s\S]+/i, '').trim();
          }
        }

        return {
          id: index,
          title,
          description: text,
          hint,
          solution,
        };
      }).filter((e) => e.description.length > 0 || e.title.length > 0);
    }

    const lines = raw.split(/\n\n+/);
    if (lines.length > 1) {
      return lines.map((line, idx) => ({
        id: idx,
        title: `Challenge ${idx + 1}`,
        description: line.trim(),
      }));
    }

    return [{
      id: 0,
      title: 'Practice Challenge 1',
      description: raw,
    }];
  }, [mod?.exercises]);

  const getPreferredVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    const savedVoiceName = localStorage.getItem('icads_preferred_voice');

    // 1. Try saved user preference
    if (savedVoiceName) {
      const preferred = voices.find(v => v.name === savedVoiceName);
      if (preferred) return preferred;
    }

    // 2. Fallback: Prefer "Google" voices as they often sound more natural, then look for "female"
    return (
      voices.find(v => v.name.includes('Google') && v.name.includes('Female')) ||
      voices.find(v => v.name.toLowerCase().includes('female')) ||
      voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) ||
      voices[0]
    );
  };

  const toggleReadAloud = () => {
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
    } else {
      const textToRead = (activeTab === 'notes' && notePages.length > 0)
        ? notePages[notePage]
        : content[activeTab as keyof typeof content];
      if (!textToRead) return;

      // Clean markdown/HTML for better speech synthesis
      let cleanText = textToRead
        .replace(/```[\s\S]*?```/g, '') // Remove code blocks
        .replace(/#+\s/g, '')          // Remove headers
        .replace(/\*\*/g, '')          // Remove bold
        .replace(/`/g, '')             // Remove inline code
        .replace(/<li>/g, ' Next point: ') // Better list reading
        .replace(/<[^>]*>?/gm, '');    // Remove any remaining HTML

      // Filter out special characters but keep alphanumeric and basic punctuation for natural pauses
      cleanText = cleanText
        .replace(/[^\w\s\.,\?!\/]/gi, '') // Keep letters, numbers, spaces, and . , ? ! /
        .replace(/_/g, ' ')               // Replace underscores with spaces
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Set preferred voice
      const preferredVoice = getPreferredVoice();
      if (preferredVoice) utterance.voice = preferredVoice;

      utterance.onend = () => setIsReading(false);
      utterance.onstart = () => setIsReading(true);
      utterance.onerror = () => setIsReading(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  // Stop reading when tab or note page changes
  useEffect(() => {
    window.speechSynthesis.cancel();
    setIsReading(false);
  }, [activeTab, notePage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => window.speechSynthesis.cancel();
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /><p>Loading module...</p></div>;
  if (!mod) return <div className="empty-state"><h3>Module not found</h3></div>;

  if (mod.locked) {
    return (
      <div className="empty-state fade-in" style={{ padding: '60px 20px', textAlign: 'center', background: 'var(--bg-white)', borderRadius: '16px', border: '1px solid var(--border)', marginTop: '40px' }}>
        <div style={{ width: 64, height: 64, borderRadius: '16px', background: 'var(--primary-bg)', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Lock size={32} />
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '16px' }}>Module Locked</h2>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '420px', margin: '0 auto 32px auto' }}>
          {mod.error || 'Please complete the previous module first to unlock this content.'}
        </p>
        <Link href={`/course/${id}`} className="btn btn-primary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <ArrowLeft size={16} />
          <span>Back to Course Roadmap</span>
        </Link>
      </div>
    );
  }

  const escapeHtml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const formatInline = (str: string) => {
    return escapeHtml(str)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  };

  const renderContent = (text: string) => {
    if (!text) return <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Content not available for this section.</p>;

    // 1. Extract and protect code blocks before line-splitting so lines inside code are never mangled
    const codeBlocks: string[] = [];
    let processed = text.replace(/```(?:([a-zA-Z0-9_-]+)\n)?([\s\S]*?)```/gm, (_, lang, code) => {
      const idx = codeBlocks.length;
      const langBadge = lang ? `<div class="code-block-lang">${escapeHtml(lang.toUpperCase())}</div>` : '';
      codeBlocks.push(
        `<div class="code-snippet-wrapper">${langBadge}<pre class="code-block"><code>${escapeHtml(code.trim())}</code></pre></div>`
      );
      return `\n\n%%CODE_BLOCK_${idx}%%\n\n`;
    });

    const lines = processed.split('\n');
    let inList = false;
    let inOrderedList = false;
    let inTable = false;
    let tableRows: string[][] = [];
    const finalHtml: string[] = [];

    const flushTable = () => {
      if (!inTable || tableRows.length === 0) {
        inTable = false;
        tableRows = [];
        return;
      }
      const headerRow = tableRows[0];
      const bodyRows = tableRows.slice(1);
      const ths = headerRow.map(c => `<th>${formatInline(c.trim())}</th>`).join('');
      const trs = bodyRows
        .filter(r => r.some(c => c.trim().length > 0))
        .map(r => `<tr>${r.map(c => `<td>${formatInline(c.trim())}</td>`).join('')}</tr>`)
        .join('');
      finalHtml.push(
        `<div class="premium-table-wrapper"><table class="premium-table"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></div>`
      );
      inTable = false;
      tableRows = [];
    };

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const trimmed = rawLine.trim();

      // Check for table row (| a | b |)
      if (/^\|(.+)\|$/.test(trimmed)) {
        if (inList) { finalHtml.push('</ul>'); inList = false; }
        if (inOrderedList) { finalHtml.push('</ol>'); inOrderedList = false; }
        
        // Skip separator row (|---|---|)
        if (/^\|(\s*[-:]+[-| :]*)\|$/.test(trimmed)) {
          continue;
        }

        const cells = trimmed.slice(1, -1).split('|');
        tableRows.push(cells);
        inTable = true;
        continue;
      } else if (inTable) {
        flushTable();
      }

      if (!trimmed) {
        if (inList) { finalHtml.push('</ul>'); inList = false; }
        if (inOrderedList) { finalHtml.push('</ol>'); inOrderedList = false; }
        continue;
      }

      // Check if this line is a code block placeholder
      const placeholderMatch = trimmed.match(/^%%CODE_BLOCK_(\d+)%%$/);
      if (placeholderMatch) {
        if (inList) { finalHtml.push('</ul>'); inList = false; }
        if (inOrderedList) { finalHtml.push('</ol>'); inOrderedList = false; }
        const blockIdx = parseInt(placeholderMatch[1], 10);
        finalHtml.push(codeBlocks[blockIdx] || '');
        continue;
      }

      // Headers
      if (trimmed.startsWith('#### ')) {
        if (inList) { finalHtml.push('</ul>'); inList = false; }
        if (inOrderedList) { finalHtml.push('</ol>'); inOrderedList = false; }
        finalHtml.push(`<h4>${formatInline(trimmed.slice(5))}</h4>`);
        continue;
      }
      if (trimmed.startsWith('### ')) {
        if (inList) { finalHtml.push('</ul>'); inList = false; }
        if (inOrderedList) { finalHtml.push('</ol>'); inOrderedList = false; }
        finalHtml.push(`<h3>${formatInline(trimmed.slice(4))}</h3>`);
        continue;
      }
      if (trimmed.startsWith('## ')) {
        if (inList) { finalHtml.push('</ul>'); inList = false; }
        if (inOrderedList) { finalHtml.push('</ol>'); inOrderedList = false; }
        finalHtml.push(`<h2>${formatInline(trimmed.slice(3))}</h2>`);
        continue;
      }
      if (trimmed.startsWith('# ')) {
        if (inList) { finalHtml.push('</ul>'); inList = false; }
        if (inOrderedList) { finalHtml.push('</ol>'); inOrderedList = false; }
        finalHtml.push(`<h1>${formatInline(trimmed.slice(2))}</h1>`);
        continue;
      }

      // Unordered lists (- or *)
      if (/^[-*]\s+/.test(trimmed)) {
        if (inOrderedList) { finalHtml.push('</ol>'); inOrderedList = false; }
        if (!inList) { finalHtml.push('<ul>'); inList = true; }
        const itemText = trimmed.replace(/^[-*]\s+/, '');
        finalHtml.push(`<li>${formatInline(itemText)}</li>`);
        continue;
      }

      // Ordered lists (1. , 2. )
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        if (inList) { finalHtml.push('</ul>'); inList = false; }
        if (!inOrderedList) { finalHtml.push('<ol>'); inOrderedList = true; }
        finalHtml.push(`<li class="numbered">${formatInline(numMatch[2])}</li>`);
        continue;
      }

      // Close lists if hitting regular text
      if (inList) { finalHtml.push('</ul>'); inList = false; }
      if (inOrderedList) { finalHtml.push('</ol>'); inOrderedList = false; }

      // Blockquotes (> ...) with Callout formatting
      if (trimmed.startsWith('> ')) {
        const quoteContent = trimmed.slice(2);
        if (/^(\*\*Key Takeaway|\*\*Pro[- ]Tip|\*\*Important|\*\*Note|\*\*Tip|\*\*Caution|\*\*Warning)/i.test(quoteContent)) {
          finalHtml.push(`<div class="callout-box">${formatInline(quoteContent)}</div>`);
        } else {
          finalHtml.push(`<blockquote>${formatInline(quoteContent)}</blockquote>`);
        }
        continue;
      }

      // Regular paragraph
      finalHtml.push(`<p>${formatInline(trimmed)}</p>`);
    }

    if (inTable) flushTable();
    if (inList) finalHtml.push('</ul>');
    if (inOrderedList) finalHtml.push('</ol>');

    return (
      <div
        className="premium-prose-content"
        dangerouslySetInnerHTML={{ __html: finalHtml.join('\n') }}
      />
    );
  };

  const currentSection = sectionMeta[activeTab];

  return (
    <div className="fade-in">
      <div className="page-header">
        <Link href={`/course/${id}`} className="back-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={16} />
          <span>Back to Course</span>
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div className="header-content-main">
            <h1 className="module-page-main-title">{mod.title}</h1>
            <div className="module-meta-badges">
              <span className={`badge-pill ${mod.difficulty === 'Easy' ? 'badge-pill-success' : mod.difficulty === 'Hard' ? 'badge-pill-danger' : 'badge-pill-warning'}`}>
                {mod.difficulty}
              </span>
              {mod.isOfflineCached && (
                <span className="badge-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                  <HardDrive size={12} />
                  <span>Offline Cached</span>
                </span>
              )}
              {mod.completed && (
                <span className="badge-pill badge-pill-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={13} strokeWidth={2.5} />
                  <span>Completed</span>
                </span>
              )}
            </div>
          </div>
          <div className="header-actions-extra" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              className="btn btn-outline"
              onClick={handleExportStudyGuide}
              disabled={exportingPdf}
              title="Download Complete Study Guide & Notes as PDF"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                borderRadius: '12px',
                borderColor: 'rgba(16, 185, 129, 0.4)',
                color: 'var(--success, #10b981)',
                background: 'rgba(16, 185, 129, 0.08)',
                fontWeight: 700,
                fontSize: '0.86rem',
                padding: '8px 14px',
                cursor: exportingPdf ? 'wait' : 'pointer',
              }}
            >
              <Download size={15} />
              <span>{exportingPdf ? 'Exporting PDF...' : 'Study Guide (PDF)'}</span>
            </button>

            <button
              className="btn btn-outline"
              onClick={() => {
                window.speechSynthesis?.cancel();
                setIsReading(false);
                setShowAudioExplainer(true);
              }}
              title="Listen to AI Audio Briefing"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                borderRadius: '12px',
                borderColor: 'rgba(99, 102, 241, 0.4)',
                color: 'var(--primary)',
                background: 'rgba(99, 102, 241, 0.08)',
                fontWeight: 700,
                fontSize: '0.86rem',
                padding: '8px 14px',
              }}
            >
              <Headphones size={15} />
              <span>AI Audio Briefing</span>
            </button>

            <button
              className={`bookmark-btn ${bookmarked ? 'active' : ''}`}
              onClick={toggleBookmark}
              title="Bookmark Module"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Bookmark size={15} fill={bookmarked ? 'currentColor' : 'none'} />
              <span>{bookmarked ? 'Saved to Library' : 'Bookmark Module'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="premium-tabs-container">
        <div className="tabs premium-tabs">
          {tabs.map(tab => (
            <button key={tab} className={`tab-premium-item ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}>
              <span className="tab-icon-large">{tabIcons[tab]}</span>
              <span className="tab-label-text">{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={`premium-content-card ${currentSection.accentClass}`}>
        <div className="card-decoration-top"></div>
        {/* Section Header Banner */}
        <div className="section-header-banner">
          <div className="section-header-icon">{tabIcons[activeTab]}</div>
          <div>
            <h2 className="section-header-title">{currentSection.title}</h2>
            <p className="section-header-desc">{currentSection.description}</p>
          </div>
          {activeTab !== 'videos' && activeTab !== 'mindmap' && (
            <button
              onClick={toggleReadAloud}
              style={{
                marginLeft: 'auto',
                padding: '10px 18px',
                borderRadius: '12px',
                background: isReading ? 'var(--danger-bg)' : 'var(--primary-bg)',
                color: isReading ? 'var(--danger)' : 'var(--primary)',
                border: `1px solid ${isReading ? 'var(--danger)' : 'var(--primary)'}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 600,
                fontSize: '0.88rem',
                transition: 'all 0.2s ease',
                boxShadow: isReading ? '0 0 15px rgba(239, 68, 68, 0.2)' : 'none'
              }}
            >
              {isReading ? <Square size={15} fill="currentColor" /> : <Volume2 size={16} />}
              <span>{isReading ? 'Stop Reading' : 'Listen to Section'}</span>
            </button>
          )}
        </div>
        <div className="card-inner-prose">
          {activeTab === 'videos' ? (
            <div className="video-section-container">
              {loadingVideos ? (
                <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <div className="spinner"></div>
                  <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>Finding the best related YouTube videos...</p>
                </div>
              ) : videos.length > 0 ? (
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 20px',
                    borderRadius: '14px',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    marginBottom: '24px',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>Recommended YouTube Lessons</span>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                          fontWeight: 700
                        }}>
                          YouTube
                        </span>
                      </h3>
                      <p style={{ margin: '3px 0 0', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                        Click on any video card to open and watch the complete tutorial directly on YouTube.
                      </p>
                    </div>
                    <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {videos.length} Videos Available
                    </span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '20px'
                  }}>
                    {videos.map((v: any) => (
                      <a
                        key={v.videoId}
                        href={`https://www.youtube.com/watch?v=${v.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          borderRadius: '16px',
                          background: 'var(--bg-white)',
                          border: '1px solid var(--border)',
                          overflow: 'hidden',
                          textDecoration: 'none',
                          color: 'inherit',
                          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                          boxShadow: 'var(--shadow-sm)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.1)';
                          e.currentTarget.style.borderColor = '#ef4444';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                          e.currentTarget.style.borderColor = 'var(--border)';
                        }}
                      >
                        {/* Video Thumbnail */}
                        <div style={{
                          position: 'relative',
                          width: '100%',
                          paddingTop: '56.25%',
                          background: '#0f172a',
                          overflow: 'hidden'
                        }}>
                          <img
                            src={v.thumbnail}
                            alt={v.title}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                          {/* Dark overlay with Play button */}
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(0, 0, 0, 0.25)',
                          }}>
                            <div style={{
                              width: '46px',
                              height: '46px',
                              borderRadius: '50%',
                              background: '#ef4444',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.5)',
                              paddingLeft: '3px'
                            }}>
                              <Play size={20} fill="white" />
                            </div>
                          </div>

                          {/* Duration Badge */}
                          {v.timestamp && (
                            <span style={{
                              position: 'absolute',
                              bottom: '10px',
                              right: '10px',
                              background: 'rgba(0, 0, 0, 0.85)',
                              color: 'white',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '6px'
                            }}>
                              {v.timestamp}
                            </span>
                          )}
                        </div>

                        {/* Video Details */}
                        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <h4 style={{
                            margin: '0 0 6px 0',
                            fontSize: '0.96rem',
                            fontWeight: 700,
                            lineHeight: 1.4,
                            color: 'var(--text)',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {v.title}
                          </h4>

                          <p style={{
                            margin: '0 0 8px 0',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            color: 'var(--text-secondary)'
                          }}>
                            {v.author}
                          </p>

                          {v.description && (
                            <p style={{
                              margin: '0 0 16px 0',
                              fontSize: '0.82rem',
                              color: 'var(--text-muted)',
                              lineHeight: 1.45,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {v.description}
                            </p>
                          )}

                          <div style={{
                            marginTop: 'auto',
                            paddingTop: '12px',
                            borderTop: '1px solid var(--border-light)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            color: '#ef4444',
                            fontWeight: 700,
                            fontSize: '0.84rem'
                          }}>
                            <span>Watch on YouTube</span>
                            <ExternalLink size={14} />
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <p>No related videos found for this topic.</p>
                </div>
              )}
            </div>
          ) : activeTab === 'mindmap' ? (
            <div className="mindmap-section-container">
              {loadingMindmap ? (
                <div style={{ padding: '80px', textAlign: 'center' }}>
                  <div className="spinner"></div>
                  <p style={{ marginTop: '20px', color: 'var(--text-muted)', fontSize: '1.1rem' }}>AI is analyzing the theory and generating your visual map...</p>
                </div>
              ) : mod?.mindmap ? (
                <MindmapFlow
                  data={mod.mindmap}
                  moduleTitle={mod.title}
                  courseTitle={mod.course?.title}
                  moduleId={String(moduleId)}
                  onJumpToNotes={() => setActiveTab('notes')}
                  onRegenerate={handleRegenerateMindmap}
                  isRegenerating={loadingMindmap}
                />
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <p>Mind map generation failed or is unavailable.</p>
                  <button
                    onClick={handleRegenerateMindmap}
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: '12px' }}
                  >
                    Generate Visual Mind Map
                  </button>
                </div>
              )}
            </div>
          ) : activeTab === 'notes' ? (
            <div className="notes-paginated-container">
              {enriching && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 18px',
                  borderRadius: '12px',
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.22)',
                  color: 'var(--primary)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  marginBottom: '20px',
                }}>
                  <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles size={14} />
                    <span>Finalizing in-depth masterclass notes (350-450 words/page)...</span>
                  </span>
                </div>
              )}

              {notePages.length > 1 && (
                <div className="notes-pagination-bar notes-pagination-top" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 20px',
                  marginBottom: '24px',
                  background: 'var(--bg)',
                  borderRadius: '14px',
                  border: '1px solid var(--border)',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: 'var(--primary)',
                      background: 'var(--primary-bg)',
                      padding: '4px 12px',
                      borderRadius: '20px'
                    }}>
                      Page {notePage + 1} of {notePages.length}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      ({Math.round(((notePage + 1) / notePages.length) * 100)}% completed)
                    </span>
                  </div>

                  {/* Page Jump Pills */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {notePages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => changeNotePage(idx)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          border: notePage === idx ? '2px solid var(--primary)' : '1px solid var(--border)',
                          background: notePage === idx ? 'var(--primary)' : 'var(--bg-white)',
                          color: notePage === idx ? '#fff' : 'var(--text)',
                          fontWeight: notePage === idx ? 700 : 500,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        title={`Jump to page ${idx + 1}`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>

                  {/* Prev / Next Page Controls + Deepen Action */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {enriching && (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '5px 10px',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: 'var(--primary)',
                        background: 'rgba(99, 102, 241, 0.08)'
                      }}>
                        <div className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
                        <span>Finalizing...</span>
                      </div>
                    )}
                    <button
                      onClick={() => changeNotePage(notePage - 1)}
                      disabled={notePage === 0}
                      className="btn btn-outline btn-sm"
                      style={{
                        opacity: notePage === 0 ? 0.4 : 1,
                        cursor: notePage === 0 ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 12px',
                        borderRadius: '8px'
                      }}
                    >
                      <ChevronLeft size={16} />
                      <span>Prev</span>
                    </button>
                    <button
                      onClick={() => changeNotePage(notePage + 1)}
                      disabled={notePage === notePages.length - 1}
                      className="btn btn-primary btn-sm"
                      style={{
                        opacity: notePage === notePages.length - 1 ? 0.4 : 1,
                        cursor: notePage === notePages.length - 1 ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 14px',
                        borderRadius: '8px'
                      }}
                    >
                      <span>Next</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Note Content for Current Page */}
              <div className="current-note-page">
                {renderContent(notePages[notePage] || mod?.notes)}
              </div>

              {/* Bottom Navigation Bar */}
              {notePages.length > 1 && (
                <div className="notes-pagination-bottom" style={{
                  marginTop: '36px',
                  paddingTop: '24px',
                  borderTop: '1px solid var(--border-light)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  {/* Progress indicator line */}
                  <div style={{ width: '100%', height: '4px', background: 'var(--border-light)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${((notePage + 1) / notePages.length) * 100}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, var(--primary), var(--accent))',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <button
                      onClick={() => changeNotePage(notePage - 1)}
                      disabled={notePage === 0}
                      className="btn btn-outline"
                      style={{
                        opacity: notePage === 0 ? 0.4 : 1,
                        cursor: notePage === 0 ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        borderRadius: '10px'
                      }}
                    >
                      <ChevronLeft size={18} />
                      <span>Previous Page</span>
                    </button>

                    <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                      Reading page {notePage + 1} of {notePages.length} (Use keyboard ← / → to flip)
                    </span>

                    {notePage < notePages.length - 1 ? (
                      <button
                        onClick={() => changeNotePage(notePage + 1)}
                        className="btn btn-primary"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 22px',
                          borderRadius: '10px',
                          fontWeight: 700,
                          boxShadow: '0 4px 14px rgba(99, 102, 241, 0.25)'
                        }}
                      >
                        <span>Next Page (Page {notePage + 2})</span>
                        <ArrowRight size={18} />
                      </button>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          onClick={() => setActiveTab('exercises')}
                          className="btn btn-primary"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            borderRadius: '10px',
                            fontWeight: 700
                          }}
                        >
                          <Dumbbell size={16} />
                          <span>Go to Exercises</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Completion celebration on the last page */}
                  {notePage === notePages.length - 1 && (
                    <div style={{
                      marginTop: '12px',
                      padding: '20px 24px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(59, 130, 246, 0.08))',
                      border: '1px solid rgba(34, 197, 94, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '16px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '12px',
                          background: 'var(--success-bg)',
                          color: 'var(--success)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Trophy size={22} />
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>You have finished all {notePages.length} pages of theory!</h4>
                          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            Now solidify your knowledge with practice exercises or review key summaries.
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => setActiveTab('mindmap')}
                          className="btn btn-outline btn-sm"
                          style={{ borderRadius: '8px' }}
                        >
                          View Mindmap
                        </button>
                        <button
                          onClick={() => setActiveTab('exercises')}
                          className="btn btn-primary btn-sm"
                          style={{ borderRadius: '8px' }}
                        >
                          Practice Exercises
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : activeTab === 'exercises' ? (
            <div className="interactive-exercises-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Exercise Header & Progress Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderRadius: '12px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>Hands-on Problem Solving</span>
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: 'var(--primary-bg)',
                      color: 'var(--primary)',
                      fontWeight: 600
                    }}>
                      Module Practice
                    </span>
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                    Work through these challenges derived strictly from this module’s concepts to test your practical grasp.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {Object.values(solvedExercises).filter(Boolean).length} / {parsedExercises.length} Solved
                  </span>
                  <div style={{ width: '80px', height: '8px', background: 'var(--border-light)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${parsedExercises.length ? (Object.values(solvedExercises).filter(Boolean).length / parsedExercises.length) * 100 : 0}%`,
                      height: '100%',
                      background: 'var(--success)',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              </div>

              {/* List of Challenges */}
              {parsedExercises.map((ex, idx) => {
                const isSolved = !!solvedExercises[ex.id];
                const isHintOpen = !!expandedHints[ex.id];
                const isSolOpen = !!expandedSolutions[ex.id];

                return (
                  <div
                    key={ex.id}
                    className="exercise-card"
                    style={{
                      padding: '24px',
                      borderRadius: '16px',
                      background: isSolved ? 'rgba(34, 197, 94, 0.03)' : 'var(--bg-white)',
                      border: isSolved ? '1.5px solid rgba(34, 197, 94, 0.4)' : '1px solid var(--border)',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* Card Top: Title and Solved Toggle */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '14px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '8px',
                          background: isSolved ? 'var(--success-bg)' : 'var(--primary-bg)',
                          color: isSolved ? 'var(--success)' : 'var(--primary)',
                          letterSpacing: '0.02em'
                        }}>
                          Challenge #{idx + 1}
                        </span>
                        <h4 style={{ margin: 0, fontSize: '1.12rem', fontWeight: 700, color: 'var(--text)' }}>
                          {ex.title}
                        </h4>
                      </div>

                      <button
                        onClick={() => setSolvedExercises(prev => ({ ...prev, [ex.id]: !prev[ex.id] }))}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          border: isSolved ? '1px solid var(--success)' : '1px solid var(--border)',
                          background: isSolved ? 'var(--success-bg)' : 'var(--bg)',
                          color: isSolved ? 'var(--success)' : 'var(--text-secondary)',
                          fontWeight: 600,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {isSolved ? (
                          <>
                            <Check size={14} />
                            <span>Solved</span>
                          </>
                        ) : (
                          <span>Mark as Solved</span>
                        )}
                      </button>
                    </div>

                    {/* Problem Statement */}
                    <div style={{ marginBottom: '16px' }}>
                      {renderContent(ex.description)}
                    </div>

                    {/* Interactive Scratchpad */}
                    <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                        <Edit3 size={14} />
                        <span>Your Scratchpad / Solution Notes:</span>
                      </label>
                      <textarea
                        value={userSolutions[ex.id] || ''}
                        onChange={(e) => setUserSolutions(prev => ({ ...prev, [ex.id]: e.target.value }))}
                        placeholder="Type your notes, solution code, or thoughts here..."
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '10px',
                          border: '1px solid var(--border)',
                          background: 'var(--bg)',
                          color: 'var(--text)',
                          fontSize: '0.9rem',
                          fontFamily: 'inherit',
                          resize: 'vertical',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    {/* Action Buttons: Hint & Solution */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {ex.hint && (
                        <button
                          onClick={() => setExpandedHints(prev => ({ ...prev, [ex.id]: !prev[ex.id] }))}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '7px 14px',
                            borderRadius: '8px',
                            border: '1px solid rgba(245, 158, 11, 0.4)',
                            background: isHintOpen ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.08)',
                            color: '#b45309',
                            fontWeight: 600,
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <Lightbulb size={14} />
                          <span>{isHintOpen ? 'Hide Hint' : 'Need a Hint?'}</span>
                        </button>
                      )}

                      {ex.solution && (
                        <button
                          onClick={() => setExpandedSolutions(prev => ({ ...prev, [ex.id]: !prev[ex.id] }))}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '7px 14px',
                            borderRadius: '8px',
                            border: '1px solid rgba(16, 185, 129, 0.4)',
                            background: isSolOpen ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)',
                            color: '#047857',
                            fontWeight: 600,
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <CheckCircle2 size={14} />
                          <span>{isSolOpen ? 'Hide Solution' : 'Reveal Solution & Walkthrough'}</span>
                        </button>
                      )}
                    </div>

                    {/* Expandable Hint Box */}
                    {isHintOpen && ex.hint && (
                      <div style={{
                        marginTop: '14px',
                        padding: '14px 18px',
                        borderRadius: '10px',
                        background: '#fffbeb',
                        border: '1px solid #fde68a',
                        color: '#92400e',
                        fontSize: '0.9rem'
                      }}>
                        <div style={{ fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Lightbulb size={16} />
                          <span>Helpful Hint:</span>
                        </div>
                        <p style={{ margin: 0 }}>{ex.hint}</p>
                      </div>
                    )}

                    {/* Expandable Solution Box */}
                    {isSolOpen && ex.solution && (
                      <div style={{
                        marginTop: '14px',
                        padding: '16px 20px',
                        borderRadius: '10px',
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        color: '#166534',
                        fontSize: '0.92rem'
                      }}>
                        <div style={{ fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', color: '#15803d' }}>
                          <CheckCircle2 size={16} />
                          <span>Model Solution & Explanation:</span>
                        </div>
                        <div>{renderContent(ex.solution)}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : activeTab === 'examples' ? (
            <div>
              {enrichingSections && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 18px',
                  borderRadius: '12px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: '#b45309',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  marginBottom: '20px',
                }}>
                  <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles size={14} />
                    <span>Generating concrete production-grade worked examples grounded in module notes...</span>
                  </span>
                </div>
              )}

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                padding: '14px 18px',
                borderRadius: '12px',
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                marginBottom: '24px',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Lightbulb size={20} color="#d97706" />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#b45309' }}>Practical Module Examples</h4>
                    <p style={{ margin: '2px 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                      Real-world applications and demonstrations directly grounded in this module’s theory.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleEnrichSections(false)}
                  disabled={enrichingSections}
                  className="btn btn-outline btn-sm"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderColor: 'rgba(245, 158, 11, 0.4)',
                    color: '#b45309',
                    fontSize: '0.82rem',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    cursor: enrichingSections ? 'not-allowed' : 'pointer',
                  }}
                  title="Regenerate deep worked examples from notes"
                >
                  <Sparkles size={13} />
                  <span>{enrichingSections ? 'Generating...' : 'Refresh Examples'}</span>
                </button>
              </div>
              {renderContent(content[activeTab])}
            </div>
          ) : activeTab === 'summary' ? (
            <div>
              {enrichingSections && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 18px',
                  borderRadius: '12px',
                  background: 'rgba(20, 184, 166, 0.1)',
                  border: '1px solid rgba(20, 184, 166, 0.3)',
                  color: '#0f766e',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  marginBottom: '20px',
                }}>
                  <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles size={14} />
                    <span>Synthesizing comprehensive executive summary across all module notes...</span>
                  </span>
                </div>
              )}

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                padding: '14px 18px',
                borderRadius: '12px',
                background: 'rgba(20, 184, 166, 0.08)',
                border: '1px solid rgba(20, 184, 166, 0.25)',
                marginBottom: '24px',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FileText size={20} color="#0d9488" />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f766e' }}>Module Executive Summary</h4>
                    <p style={{ margin: '2px 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                      Key takeaways and exam essentials distilled directly from the notes for quick revision.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleEnrichSections(false)}
                  disabled={enrichingSections}
                  className="btn btn-outline btn-sm"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderColor: 'rgba(20, 184, 166, 0.4)',
                    color: '#0f766e',
                    fontSize: '0.82rem',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    cursor: enrichingSections ? 'not-allowed' : 'pointer',
                  }}
                  title="Regenerate full summary from notes"
                >
                  <Sparkles size={13} />
                  <span>{enrichingSections ? 'Generating...' : 'Refresh Summary'}</span>
                </button>
              </div>
              {renderContent(content[activeTab])}
            </div>
          ) : (
            renderContent(content[activeTab])
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Left side: Mark as Completed */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {mod.completed ? (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px', borderRadius: '14px',
              background: 'var(--success-bg)', color: 'var(--success)',
              border: '1.5px solid var(--success)', fontWeight: 700, fontSize: '0.95rem'
            }}>
              <CheckCircle2 size={18} />
              <span>Module Completed</span>
            </span>
          ) : (
            <button
              className="btn btn-lg"
              disabled={completingModule}
              onClick={handleComplete}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff', border: 'none', fontWeight: 700,
                boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
                display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              {completingModule ? (
                <><span className="spinner spinner-sm" /> Saving...</>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Mark as Completed</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Right side: Flashcards + Quiz actions */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary btn-lg"
            onClick={() => router.push(`/course/${id}/module/${moduleId}/flashcards`)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Layers size={18} />
            <span>Study Flashcards</span>
          </button>
          {mod.quiz && mod.quiz.attempts && mod.quiz.attempts.length > 0 ? (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => router.push(`/course/${id}/module/${moduleId}/result`)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <BarChart3 size={18} />
                <span>View Quiz Report</span>
              </button>
              <button
                className="btn btn-lg"
                onClick={(e) => {
                  if (!mod.completed) {
                    e.preventDefault();
                    window.dispatchEvent(new CustomEvent('icmsystem_toast', { detail: { title: 'Action Required', message: 'Please mark the module as completed first to unlock the quiz.', type: 'warning' } }));
                    return;
                  }
                  setLoadingQuiz(true);
                  router.push(`/course/${id}/module/${moduleId}/quiz?retake=1`);
                }}
                disabled={loadingQuiz}
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#fff', border: 'none', fontWeight: 700,
                  boxShadow: '0 4px 16px rgba(245,158,11,0.3)',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                {loadingQuiz ? (
                  <><span className="spinner spinner-sm" /> Loading...</>
                ) : (
                  <>
                    <RotateCcw size={16} />
                    <span>Retake Quiz</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary btn-lg"
              disabled={loadingQuiz}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              onClick={async (e) => {
                if (!mod.completed) {
                  e.preventDefault();
                  window.dispatchEvent(new CustomEvent('icmsystem_toast', { detail: { title: 'Action Required', message: 'Please mark the module as completed first to unlock the quiz.', type: 'warning' } }));
                  return;
                }
                setLoadingQuiz(true);
                router.push(`/course/${id}/module/${moduleId}/quiz`);
              }}
            >
              {loadingQuiz ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="spinner spinner-sm" />
                  <span>Loading...</span>
                </span>
              ) : (
                <>
                  <ClipboardCheck size={18} />
                  <span>Start Module Quiz</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* AI Audio Explainer & Customizable Mentor Voice Player */}
      {showAudioExplainer && mod && (
        <AudioExplainerPlayer
          courseId={id as string}
          moduleId={moduleId as string}
          moduleTitle={mod.title}
          onClose={() => setShowAudioExplainer(false)}
        />
      )}
    </div>
  );
}
