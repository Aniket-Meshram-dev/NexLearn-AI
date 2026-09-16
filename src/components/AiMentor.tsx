'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  X,
  Send,
  Mic,
  Volume2,
  Square,
  AlertCircle,
  Lightbulb,
  HelpCircle,
  Code,
  Brain,
  Compass,
  Trophy,
  Target,
  Zap,
} from 'lucide-react';

function AiThinkingIndicator() {
  return (
    <div className="ai-thinking-card">
      <div className="ai-thinking-icon">
        <Sparkles size={14} className="sparkle-spin" />
      </div>
      <div className="ai-thinking-body">
        <span className="ai-thinking-text">NexLearn AI is thinking</span>
        <div className="ai-thinking-dots">
          <span className="dot dot-1" />
          <span className="dot dot-2" />
          <span className="dot dot-3" />
        </div>
      </div>
    </div>
  );
}

export default function AiMentor({
  moduleId,
  moduleTitle,
}: {
  moduleId?: any;
  moduleTitle?: string;
} = {}) {
  const pathname = usePathname();

  // Extract moduleId from URL if on a module page and not explicitly provided
  const urlMatch = pathname?.match(/\/course\/[^/]+\/module\/([^/]+)/);
  const effectiveModuleId = moduleId || (urlMatch ? urlMatch[1] : null);

  const pageSubtitle = useMemo(() => {
    if (moduleTitle) return `Module: ${moduleTitle}`;
    if (pathname?.includes('/module/')) return 'Active Learning Module';
    if (pathname === '/generate') return 'Course Studio & Generator';
    if (pathname === '/discover') return 'Course Catalog & Discovery';
    if (pathname === '/flashcards') return 'Spaced Repetition Flashcards';
    if (pathname === '/reports') return 'Learning Analytics & Streaks';
    if (pathname === '/achievements') return 'Achievements & Badges';
    if (pathname === '/bookmarks') return 'Saved Concepts & Notes';
    if (pathname === '/dashboard') return 'Academy Dashboard';
    if (pathname === '/settings') return 'Settings & Preferences';
    return 'Omnipresent Platform & Learning Mentor';
  }, [moduleTitle, pathname]);

  const defaultPlaceholder = useMemo(() => {
    if (effectiveModuleId) return 'Ask about this module, concepts, or NexLearn...';
    if (pathname === '/generate') return 'Ask how to prompt or configure your course...';
    if (pathname === '/flashcards') return 'Ask about flashcard tips or study habits...';
    return 'Ask anything about NexLearn AI, your courses, or any topic...';
  }, [effectiveModuleId, pathname]);

  const quickChips = useMemo(() => {
    if (effectiveModuleId) {
      return [
        { icon: Lightbulb, label: 'Summarize key takeaways from this module' },
        { icon: HelpCircle, label: 'Test me with a conceptual quiz question' },
        { icon: Code, label: 'Show a practical code implementation' },
        { icon: Sparkles, label: 'How do I generate another course?' },
      ];
    }
    if (pathname === '/generate') {
      return [
        { icon: Target, label: 'How do I write the best course prompt?' },
        { icon: Compass, label: 'What study pace should I choose?' },
        { icon: Sparkles, label: 'What does the AI generate for each module?' },
      ];
    }
    if (pathname === '/flashcards') {
      return [
        { icon: Brain, label: 'How does the SM-2 algorithm work?' },
        { icon: Compass, label: 'When will my cards be scheduled for review?' },
        { icon: Zap, label: 'Tips for active recall learning' },
      ];
    }
    if (pathname === '/reports') {
      return [
        { icon: Target, label: 'How is my cognitive mastery score calculated?' },
        { icon: Zap, label: 'How do I maintain my daily study streak?' },
        { icon: Trophy, label: 'What do I need to finish to earn a certificate?' },
      ];
    }
    return [
      { icon: Sparkles, label: 'How do I create a new AI course?' },
      { icon: Brain, label: 'How do spaced-repetition flashcards work?' },
      { icon: Trophy, label: 'How do I earn a verified certificate?' },
      { icon: Compass, label: 'How do I use the interactive mind map?' },
    ];
  }, [effectiveModuleId, pathname]);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [wasVoiceInitiated, setWasVoiceInitiated] = useState(false);
  const [placeholder, setPlaceholder] = useState(defaultPlaceholder);

  useEffect(() => {
    setPlaceholder(defaultPlaceholder);
  }, [defaultPlaceholder]);

  // Support contextual external trigger (e.g. from flashcards "Ask AI Mentor")
  useEffect(() => {
    const handleMentorOpen = (e: any) => {
      if (e.detail?.query) {
        setInput(e.detail.query);
        setIsOpen(true);
      }
    };
    window.addEventListener('open_ai_mentor', handleMentorOpen);
    return () => window.removeEventListener('open_ai_mentor', handleMentorOpen);
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const handleSendRef = useRef<any>(null);

  const isGenerating = loading || messages.some((m) => m.isStreaming);

  // Close AI Mentor window when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (windowRef.current && !windowRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.cancel();
          setIsSpeaking(false);
        }
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (_) { }
          setIsListening(false);
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.cancel();
          setIsSpeaking(false);
        }
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (_) { }
          setIsListening(false);
        }
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript.trim()) {
          setIsListening(false);
          setWasVoiceInitiated(true);
          handleSendRef.current?.(null, transcript.trim());
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          setPlaceholder('No speech detected. Try again.');
          setTimeout(() => setPlaceholder('Ask anything about this module...'), 3000);
        } else if (event.error === 'not-allowed') {
          alert('Microphone access was denied. Please check your browser settings.');
        } else {
          console.error('Speech recognition error:', event.error);
        }
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setPlaceholder('Ask anything about this module...');
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
          setPlaceholder('Listening... Speak now!');
        } catch (e) {
          console.error('Speech recognition start error:', e);
        }
      } else {
        alert('Speech recognition is not supported in your browser. (Try Chrome or Edge)');
      }
    }
  };

  const getPreferredVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    const savedVoiceName = localStorage.getItem('icm_preferred_voice');

    if (savedVoiceName) {
      const preferred = voices.find((v) => v.name === savedVoiceName);
      if (preferred) return preferred;
    }

    return (
      voices.find((v) => v.name.includes('Google') && v.name.includes('Female')) ||
      voices.find((v) => v.name.toLowerCase().includes('female')) ||
      voices.find((v) => v.name.includes('Google') && v.lang.startsWith('en')) ||
      voices[0]
    );
  };

  const speak = (text: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    let plainText = text.replace(/<[^>]*>?/gm, '');
    plainText = plainText
      .replace(/[^\w\s\.,\?!\/]/gi, '')
      .replace(/_/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(plainText);
    const preferredVoice = getPreferredVoice();
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onstart = () => setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const escapeHtml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const formatMessage = (text: string) => {
    if (!text) return '';
    const safeText = escapeHtml(text);
    return safeText
      .replace(/```(.*?)\n([\s\S]*?)```/gm, '<pre class="code-block">$2</pre>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
      .replace(/\n/g, '<br/>');
  };

  const handleSend = async (e: React.FormEvent | null, forcedInput: string | null = null) => {
    if (e) e.preventDefault();
    const messageContent = forcedInput || input;
    const isCurrentlyGenerating = loading || messages.some((m) => m.isStreaming);
    if (!messageContent.trim() || isCurrentlyGenerating) return;

    const userMessage = { role: 'user', content: messageContent };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    if (!forcedInput) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageContent,
          moduleId: effectiveModuleId || undefined,
          currentPage: pathname,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        let errMsg = 'Failed to get response';
        try {
          const errData = await res.json();
          if (errData.error) errMsg = errData.error;
        } catch { }
        throw new Error(errMsg);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No stream available');

      // Add empty assistant placeholder for streaming
      setMessages((prev) => [...prev, { role: 'assistant', content: '', isStreaming: true }]);
      setLoading(false);

      const decoder = new TextDecoder();
      let assistantText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          const dataStr = trimmed.slice(6).trim();
          if (dataStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.content) {
              assistantText += parsed.content;
              setMessages((prev) => {
                const updated = [...prev];
                const lastIdx = updated.length - 1;
                if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
                  updated[lastIdx] = {
                    ...updated[lastIdx],
                    content: assistantText,
                    isStreaming: true,
                  };
                }
                return updated;
              });
            } else if (parsed.error) {
              throw new Error(parsed.error);
            }
          } catch (jsonErr: any) {
            if (jsonErr.message && !jsonErr.message.includes('JSON')) {
              throw jsonErr;
            }
          }
        }
      }

      // Mark stream as complete
      setMessages((prev) => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
          updated[lastIdx] = {
            ...updated[lastIdx],
            content: assistantText,
            isStreaming: false,
          };
        }
        return updated;
      });

      if (wasVoiceInitiated || forcedInput) {
        speak(assistantText);
        setWasVoiceInitiated(false);
      }
    } catch (err: any) {
      setLoading(false);
      const errorMsg =
        err?.message ||
        "I'm having trouble connecting to the NexLearn AI logic. Please check your connection and try again.";
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === 'assistant' && last.isStreaming) {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            content: errorMsg,
            isError: true,
            isStreaming: false,
          };
          return updated;
        }
        return [...prev, { role: 'assistant', content: errorMsg, isError: true }];
      });
      if (wasVoiceInitiated || forcedInput) {
        speak(errorMsg);
        setWasVoiceInitiated(false);
      }
    }
  };
  handleSendRef.current = handleSend;

  return (
    <div className="mentor-container" style={{ position: 'fixed', bottom: '28px', right: '28px', zIndex: 9999 }}>
      {/* Mentor Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="mentor-trigger"
          aria-label="Open AI Mentor"
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary) 0%, #818cf8 100%)',
            border: '2.5px solid rgba(255, 255, 255, 0.6)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 12px 30px rgba(99, 102, 241, 0.45)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            position: 'relative',
            padding: 0,
            overflow: 'visible',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1) translateY(-4px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1) translateY(0)')}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#1e1b4b',
            }}
          >
            <img
              src="/images/ai-mentor-avatar.png"
              alt="NexLearn AI Mentor"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scale(1.08)',
              }}
            />
          </div>
          <span
            style={{
              position: 'absolute',
              top: '0px',
              right: '0px',
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              background: '#10B981',
              border: '2.5px solid white',
              boxShadow: '0 0 8px #10B981',
            }}
          />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          ref={windowRef}
          className="mentor-window fade-in"
          style={{
            width: '400px',
            maxWidth: 'calc(100vw - 40px)',
            height: '620px',
            maxHeight: 'calc(100vh - 80px)',
            background: 'var(--bg-white)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '20px',
            border: '1px solid var(--border)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '18px 20px',
              background: 'linear-gradient(135deg, var(--primary) 0%, #6366F1 100%)',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: '#1e1b4b',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid rgba(255, 255, 255, 0.3)',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                }}
              >
                <img
                  src="/images/ai-mentor-avatar.png"
                  alt="AI Mentor"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800 }}>NexLearn AI Mentor</h3>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      background: 'rgba(255,255,255,0.25)',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                    }}
                  >
                    Online
                  </span>
                </div>
                <p
                  style={{
                    margin: '2px 0 0 0',
                    fontSize: '0.74rem',
                    opacity: 0.9,
                    fontWeight: 500,
                    maxWidth: '220px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {moduleTitle}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                borderRadius: '8px',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s',
              }}
              aria-label="Close AI Mentor"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              padding: '20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              background: 'var(--bg)',
            }}
          >
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                <div
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                    boxShadow: '0 8px 24px rgba(99, 102, 241, 0.25)',
                    border: '2px solid rgba(99, 102, 241, 0.2)',
                    background: '#1e1b4b',
                  }}
                >
                  <img
                    src="/images/ai-mentor-avatar.png"
                    alt="NexLearn AI Mentor"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <h4 style={{ fontWeight: 800, fontSize: '1.05rem', margin: '0 0 8px 0', color: 'var(--text)' }}>
                  Hello, Scholar!
                </h4>
                <p style={{ fontSize: '0.86rem', lineHeight: 1.5, margin: 0 }}>
                  I&apos;m your real-time AI Tutor for this module. Ask questions, clarify complex concepts, or test your comprehension!
                </p>

                {quickChips && quickChips.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '22px', textAlign: 'left' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 750, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Suggested Questions
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {quickChips.map((chip, idx) => {
                        const ChipIcon = chip.icon;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setInput(chip.label)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 12px',
                              borderRadius: '10px',
                              background: 'var(--bg-white)',
                              border: '1px solid var(--border)',
                              fontSize: '0.80rem',
                              color: 'var(--text)',
                              cursor: 'pointer',
                              textAlign: 'left',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <ChipIcon size={14} color="var(--primary)" style={{ flexShrink: 0 }} />
                            <span>{chip.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {messages.map((m, i) => {
              const isAssistantThinking =
                m.role === 'assistant' && m.isStreaming && (!m.content || !m.content.trim());

              return (
                <div
                  key={i}
                  style={{
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  {isAssistantThinking ? (
                    <AiThinkingIndicator />
                  ) : (
                    <div
                      style={{
                        padding: '12px 16px',
                        borderRadius: '16px',
                        fontSize: '0.9rem',
                        lineHeight: '1.5',
                        background:
                          m.role === 'user'
                            ? 'var(--primary)'
                            : m.isError
                              ? 'var(--danger-bg)'
                              : 'var(--bg-white)',
                        color:
                          m.role === 'user'
                            ? 'white'
                            : m.isError
                              ? 'var(--danger)'
                              : 'var(--text)',
                        boxShadow: m.role === 'assistant' ? 'var(--shadow-sm)' : 'none',
                        border: m.role === 'assistant' ? '1px solid var(--border)' : 'none',
                      }}
                    >
                      <span dangerouslySetInnerHTML={{ __html: formatMessage(m.content) }} />
                      {m.isStreaming && <span className="streaming-cursor" />}
                    </div>
                  )}

                  {m.role === 'assistant' && !m.isStreaming && m.content && !m.isError && (
                    <button
                      onClick={() => speak(m.content)}
                      style={{
                        alignSelf: 'flex-start',
                        background: 'none',
                        border: 'none',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      {isSpeaking ? (
                        <>
                          <Square size={13} />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 size={13} />
                          <span>Listen</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })}

            {loading && !messages.some((m) => m.role === 'assistant' && m.isStreaming) && (
              <div style={{ alignSelf: 'flex-start' }}>
                <AiThinkingIndicator />
              </div>
            )}
          </div>

          {/* Chat Input Footer */}
          <form
            onSubmit={handleSend}
            style={{
              padding: '16px 18px',
              background: 'var(--bg-white)',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
            }}
          >
            <button
              type="button"
              onClick={toggleListening}
              className={isListening ? 'mic-active' : ''}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: isListening ? '#EF4444' : 'var(--secondary)',
                color: isListening ? 'white' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
              title="Voice Input"
              aria-label="Voice Input"
            >
              <Mic size={18} />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isGenerating ? 'NexLearn AI is responding...' : placeholder}
              disabled={isGenerating}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                outline: 'none',
                background: 'var(--bg)',
                color: 'var(--text)',
                fontSize: '0.88rem',
                opacity: isGenerating ? 0.7 : 1,
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary)';
                e.target.style.boxShadow = '0 0 0 2px rgba(99, 102, 241, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border)';
                e.target.style.boxShadow = 'none';
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isGenerating}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                cursor: !input.trim() || isGenerating ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: !input.trim() || isGenerating ? 0.5 : 1,
                transition: 'opacity 0.2s, transform 0.1s',
              }}
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
