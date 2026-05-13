'use client';
import { useState, useRef, useEffect } from 'react';

export default function AiMentor({ moduleId, moduleTitle }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [wasVoiceInitiated, setWasVoiceInitiated] = useState(false);
  const [placeholder, setPlaceholder] = useState('Ask anything about this module...');
  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const savedVoiceName = localStorage.getItem('icm_preferred_voice');
    if (savedVoiceName) {
      // Voice logic handled in speak() directly via localStorage check
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
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

      recognitionRef.current.onerror = (event) => {
        if (event.error === 'no-speech') {
          setPlaceholder('No speech detected. Try again.');
          setTimeout(() => setPlaceholder('Ask anything about this module...'), 3000);
          console.warn('No speech detected.');
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

  const speak = (text) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Strip HTML for speaking
    let plainText = text.replace(/<[^>]*>?/gm, '');
    
    // Filter out special characters but keep alphanumeric and basic punctuation for natural pauses
    plainText = plainText
      .replace(/[^\w\s\.,\?!\/]/gi, '') // Keep letters, numbers, spaces, and . , ? ! /
      .replace(/_/g, ' ')               // Replace underscores with spaces
      .trim();

    const utterance = new SpeechSynthesisUtterance(plainText);
    
    // Set preferred voice
    const preferredVoice = getPreferredVoice();
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onstart = () => setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const formatMessage = (text) => {
    if (!text) return '';
    return text
      .replace(/```(.*?)\n([\s\S]*?)```/gm, '<pre class="code-block">$2</pre>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
      .replace(/\n/g, '<br/>');
  };

  const handleSend = async (e, forcedInput = null) => {
    if (e) e.preventDefault();
    const messageContent = forcedInput || input;
    if (!messageContent.trim() || loading) return;

    const userMessage = { role: 'user', content: messageContent };
    setMessages(prev => [...prev, userMessage]);
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

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      
      // Auto-speak if it was voice-initiated
      if (wasVoiceInitiated || forcedInput) {
        speak(data.response);
        setWasVoiceInitiated(false); // Reset for next interaction
      }
    } catch (err) {
      const errorMsg = "⚠️ Sorry, I'm having trouble connecting to the ICM SYSTEM logic. Please try again later.";
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
      if (wasVoiceInitiated || forcedInput) {
        speak(errorMsg);
        setWasVoiceInitiated(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mentor-container" style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999 }}>
      {/* Mentor Icon / Trigger */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="mentor-trigger"
          style={{
            width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary)',
            color: 'white', border: 'none', cursor: 'pointer', fontSize: '2rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(79, 70, 229, 0.4)', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            transform: 'scale(1)',
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.1) translateY(-5px)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1) translateY(0)'}
        >
          🤖
          <div className="pulse-ring"></div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="mentor-window fade-in" style={{
          width: '380px', height: '600px', background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
          animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {/* Header */}
          <div style={{
            padding: '20px', background: 'linear-gradient(135deg, var(--primary) 0%, #6366f1 100%)',
            color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', fontSize: '1.2rem' }}>🎓</div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>ICM AI Mentor</h3>
                <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.8, fontWeight: 600, textTransform: 'uppercase' }}>Module: {moduleTitle}</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem', padding: '5px' }}>✕</button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>👋</div>
                <h4 style={{ fontWeight: 800, marginBottom: '8px' }}>Hello, Scholar!</h4>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>I&apos;m your ICM AI Mentor. If you&apos;re confused by anything in this module, just ask!</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%', position: 'relative',
                display: 'flex', flexDirection: 'column', gap: '4px'
              }}>
                <div style={{
                  padding: '12px 16px', borderRadius: '18px',
                  fontSize: '0.95rem', lineHeight: '1.5',
                  background: m.role === 'user' ? 'var(--primary)' : 'white',
                  color: m.role === 'user' ? 'white' : 'var(--text)',
                  boxShadow: m.role === 'assistant' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                  border: m.role === 'assistant' ? '1px solid var(--border)' : 'none',
                }}
                dangerouslySetInnerHTML={{ __html: formatMessage(m.content) }}
                />
                {m.role === 'assistant' && (
                  <button 
                    onClick={() => speak(m.content)}
                    style={{
                      alignSelf: 'flex-start', background: 'none', border: 'none',
                      fontSize: '0.8rem', cursor: 'pointer', opacity: 0.6,
                      display: 'flex', alignItems: 'center', gap: '4px', padding: '0 4px'
                    }}
                  >
                    {isSpeaking ? '⏹️ Stop' : '🔊 Listen'}
                  </button>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ alignSelf: 'flex-start', padding: '12px 16px', background: 'white', borderRadius: '18px', display: 'flex', gap: '5px', border: '1px solid var(--border)' }}>
                <div className="thinking-dot"></div>
                <div className="thinking-dot"></div>
                <div className="thinking-dot"></div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} style={{ padding: '20px', background: 'white', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button 
              type="button" 
              onClick={toggleListening}
              className={isListening ? 'mic-active' : ''}
              style={{
                width: '45px', height: '45px', borderRadius: '12px', 
                background: isListening ? '#ef4444' : 'var(--border)', 
                color: isListening ? 'white' : 'var(--text)',
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s ease',
                boxShadow: isListening ? '0 0 15px rgba(239, 68, 68, 0.5)' : 'none'
              }}
              title="Voice Input"
            >
              {isListening ? '🎤' : '🎙️'}
            </button>
            <input 
              type="text" value={input} onChange={(e) => setInput(e.target.value)}
              placeholder={placeholder}
              style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '2px solid var(--border)', outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
            <button type="submit" disabled={!input.trim() || loading} style={{
              width: '45px', height: '45px', borderRadius: '12px', background: 'var(--primary)', color: 'white',
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: !input.trim() || loading ? 0.5 : 1
            }}>
              🚀
            </button>
          </form>
        </div>
      )}

      <style jsx>{`
        .mentor-window {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        :global(.code-block) {
          background: #1e293b;
          color: white;
          padding: 12px;
          border-radius: 8px;
          font-family: monospace;
          font-size: 0.85rem;
          margin: 10px 0;
          overflow-x: auto;
          white-space: pre-wrap;
          word-break: break-all;
        }
        :global(.inline-code) {
          background: rgba(0,0,0,0.05);
          padding: 2px 4px;
          border-radius: 4px;
          font-family: monospace;
          font-weight: 600;
        }
        @keyframes pulse-red {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .mic-active {
          animation: pulse-red 1.5s infinite;
        }
      `}</style>
    </div>
  );
}
