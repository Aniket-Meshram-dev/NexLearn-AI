'use client';
import { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  GraduationCap,
  X,
  Send,
  Mic,
  Volume2,
  Square,
  AlertCircle,
} from 'lucide-react';

export default function AiMentor({ moduleId, moduleTitle }: { moduleId: any; moduleTitle?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [wasVoiceInitiated, setWasVoiceInitiated] = useState(false);
  const [placeholder, setPlaceholder] = useState('Ask anything about this module...');
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

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
          handleSend(null, transcript.trim());
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

  const formatMessage = (text: string) => {
    if (!text) return '';
    return text
      .replace(/```(.*?)\n([\s\S]*?)```/gm, '<pre class="code-block">$2</pre>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
      .replace(/\n/g, '<br/>');
  };

  const handleSend = async (e: React.FormEvent | null, forcedInput: string | null = null) => {
    if (e) e.preventDefault();
    const messageContent = forcedInput || input;
    if (!messageContent.trim() || loading) return;

    const userMessage = { role: 'user', content: messageContent };
    setMessages((prev) => [...prev, userMessage]);
    if (!forcedInput) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageContent,
          moduleId,
          history: messages,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);

      if (wasVoiceInitiated || forcedInput) {
        speak(data.response);
        setWasVoiceInitiated(false);
      }
    } catch (err) {
      const errorMsg =
        "I'm having trouble connecting to the NexLearn AI logic. Please check your connection and try again.";
      setMessages((prev) => [...prev, { role: 'assistant', content: errorMsg, isError: true }]);
      if (wasVoiceInitiated || forcedInput) {
        speak(errorMsg);
        setWasVoiceInitiated(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mentor-container" style={{ position: 'fixed', bottom: '28px', right: '28px', zIndex: 9999 }}>
      {/* Mentor Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="mentor-trigger"
          aria-label="Open AI Mentor"
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary) 0%, #818cf8 100%)',
            color: 'white',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 30px rgba(79, 70, 229, 0.4)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            position: 'relative',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08) translateY(-3px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1) translateY(0)')}
        >
          <Bot size={28} strokeWidth={2.2} />
          <span
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#10B981',
              border: '2px solid white',
              boxShadow: '0 0 6px #10B981',
            }}
          />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
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
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <GraduationCap size={22} />
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
                    width: '60px',
                    height: '60px',
                    borderRadius: '16px',
                    background: 'var(--primary-bg)',
                    color: 'var(--primary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <Sparkles size={30} />
                </div>
                <h4 style={{ fontWeight: 800, fontSize: '1.05rem', margin: '0 0 8px 0', color: 'var(--text)' }}>
                  Hello, Scholar!
                </h4>
                <p style={{ fontSize: '0.86rem', lineHeight: 1.5, margin: 0 }}>
                  I&apos;m your real-time AI Tutor for this module. Ask questions, clarify complex concepts, or test your comprehension!
                </p>
              </div>
            )}

            {messages.map((m, i) => (
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
                  dangerouslySetInnerHTML={{ __html: formatMessage(m.content) }}
                />
                {m.role === 'assistant' && (
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
            ))}

            {loading && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  padding: '12px 16px',
                  background: 'var(--bg-white)',
                  borderRadius: '16px',
                  display: 'flex',
                  gap: '6px',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div className="thinking-dot" />
                <div className="thinking-dot" />
                <div className="thinking-dot" />
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
              placeholder={placeholder}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                outline: 'none',
                background: 'var(--bg)',
                color: 'var(--text)',
                fontSize: '0.88rem',
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
              disabled={!input.trim() || loading}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: !input.trim() || loading ? 0.5 : 1,
                transition: 'opacity 0.2s, transform 0.1s',
              }}
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      <style jsx>{`
        .mentor-window {
          animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        :global(.code-block) {
          background: #0f172a;
          color: #f8fafc;
          padding: 12px;
          border-radius: 8px;
          font-family: 'Fira Code', monospace;
          font-size: 0.82rem;
          margin: 8px 0;
          overflow-x: auto;
          white-space: pre-wrap;
          word-break: break-all;
          border: 1px solid #334155;
        }
        :global(.inline-code) {
          background: rgba(99, 102, 241, 0.12);
          color: var(--primary);
          padding: 2px 5px;
          border-radius: 4px;
          font-family: monospace;
          font-weight: 600;
          font-size: 0.85em;
        }
        @keyframes pulse-red {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          70% {
            transform: scale(1.05);
            box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
        }
        .mic-active {
          animation: pulse-red 1.5s infinite;
        }
      `}</style>
    </div>
  );
}
