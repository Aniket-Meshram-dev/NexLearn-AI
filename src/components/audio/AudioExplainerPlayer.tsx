'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Sliders,
  ChevronUp,
  ChevronDown,
  X,
  Sparkles,
  BookOpen,
  Headphones,
} from 'lucide-react';
import {
  MentorPersonaId,
  MENTOR_PERSONAS,
  AudioBriefingScript,
} from '@/lib/mentor-personas';
import {
  SentenceVoicePlayer,
  PlaybackStatus,
  getStoredVoicePrefs,
} from '@/lib/voice-engine';
import VoiceSettingsModal from './VoiceSettingsModal';

interface AudioExplainerPlayerProps {
  courseId: string;
  moduleId: string;
  moduleTitle: string;
  onClose: () => void;
}

export default function AudioExplainerPlayer({
  courseId,
  moduleId,
  moduleTitle,
  onClose,
}: AudioExplainerPlayerProps) {
  const [persona, setPersona] = useState<MentorPersonaId>('elena');
  const [script, setScript] = useState<AudioBriefingScript | null>(null);
  const [loadingScript, setLoadingScript] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<PlaybackStatus>('idle');
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [activeSentenceText, setActiveSentenceText] = useState('');
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const playerRef = useRef<SentenceVoicePlayer | null>(null);

  // Initialize Player
  useEffect(() => {
    const p = new SentenceVoicePlayer(persona, {
      onSentenceChange: (idx, text) => {
        setCurrentSentenceIndex(idx);
        setActiveSentenceText(text);
      },
      onStatusChange: (s) => setStatus(s),
      onEnd: () => setStatus('idle'),
      onError: (err) => setError(typeof err === 'string' ? err : 'Playback error occurred'),
    });
    playerRef.current = p;

    return () => {
      p.stop();
    };
  }, []);

  // Fetch or generate script when persona or module changes
  const fetchBriefing = async (selectedPersona: MentorPersonaId) => {
    setLoadingScript(true);
    setError(null);
    try {
      const res = await fetch(`/api/courses/${courseId}/modules/${moduleId}/audio-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona: selectedPersona }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to synthesize audio briefing');
      }
      const data = await res.json();
      setScript(data.briefing);

      if (playerRef.current && data.briefing?.sentences) {
        playerRef.current.loadSentences(data.briefing.sentences);
        setActiveSentenceText(data.briefing.sentences[0] || '');
        setCurrentSentenceIndex(0);
        // Start playing automatically upon ready
        setTimeout(() => {
          playerRef.current?.play(0);
        }, 150);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to load audio script.');
    } finally {
      setLoadingScript(false);
    }
  };

  useEffect(() => {
    fetchBriefing(persona);
  }, [courseId, moduleId]);

  const handlePersonaChange = (newPersona: MentorPersonaId) => {
    if (newPersona === persona) return;
    playerRef.current?.stop();
    setPersona(newPersona);
    playerRef.current?.updatePersona(newPersona);
    fetchBriefing(newPersona);
  };

  const handleTogglePlay = () => {
    if (!playerRef.current) return;
    if (status === 'playing') {
      playerRef.current.pause();
    } else {
      playerRef.current.play(currentSentenceIndex);
    }
  };

  const handleSkipNext = () => {
    playerRef.current?.skipNext();
  };

  const handleSkipPrev = () => {
    playerRef.current?.skipPrev();
  };

  const handleReplay = () => {
    playerRef.current?.stop();
    playerRef.current?.play(0);
  };

  const handleCycleSpeed = () => {
    const speeds = [0.85, 1.0, 1.25, 1.5, 1.75];
    const nextIdx = (speeds.indexOf(speedMultiplier) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setSpeedMultiplier(nextSpeed);
    playerRef.current?.updatePreferences({ rate: nextSpeed });
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    playerRef.current?.updatePreferences({ volume: next ? 0 : 1.0 });
  };

  const totalSentences = script?.sentences?.length || 1;
  const progressRatio = Math.min(100, Math.max(0, Math.round(((currentSentenceIndex + 1) / totalSentences) * 100)));
  const currentPersona = MENTOR_PERSONAS[persona];

  return (
    <>
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: '860px',
          zIndex: 1000,
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(99, 102, 241, 0.25)',
          borderRadius: '20px',
          background: 'var(--bg-white)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Progress Bar Header Line */}
        <div
          style={{
            height: '3px',
            width: '100%',
            background: 'rgba(99, 102, 241, 0.15)',
            position: 'relative',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progressRatio}%`,
              background: `linear-gradient(90deg, var(--primary), ${currentPersona.accentColor})`,
              transition: 'width 0.2s ease',
            }}
          />
        </div>

        {/* Main Audio Control Bar */}
        <div
          style={{
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            flexWrap: 'wrap',
          }}
        >
          {/* Left: Persona Avatar & Title & Waveform */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '220px', flex: '1 1 auto' }}>
            {/* Persona Avatar Badge */}
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '14px',
                background: `linear-gradient(135deg, ${currentPersona.accentColor}22, ${currentPersona.accentColor}44)`,
                border: `1.5px solid ${currentPersona.accentColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.35rem',
                flexShrink: 0,
                position: 'relative',
              }}
            >
              {currentPersona.avatar}
              {status === 'playing' && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#10b981',
                    border: '2px solid white',
                  }}
                />
              )}
            </div>

            {/* Info & Persona Switcher */}
            <div style={{ overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text)' }}>
                  {currentPersona.name}
                </span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: currentPersona.accentColor,
                    background: `${currentPersona.accentColor}18`,
                    padding: '2px 6px',
                    borderRadius: '6px',
                  }}
                >
                  AI Briefing
                </span>
              </div>
              <div
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '280px',
                }}
              >
                {loadingScript ? 'Generating AI podcast script...' : script?.title || moduleTitle}
              </div>
            </div>

            {/* Animated Waveform Bars */}
            {status === 'playing' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '22px', marginLeft: '6px' }}>
                {[0.6, 1.0, 0.4, 0.8, 0.5, 0.9, 0.3].map((factor, i) => (
                  <span
                    key={i}
                    style={{
                      width: '3px',
                      height: `${Math.max(6, 20 * factor)}px`,
                      background: currentPersona.accentColor,
                      borderRadius: '2px',
                      animation: `pulse 0.7s ease-in-out infinite alternate`,
                      animationDelay: `${i * 0.12}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Center: Playback Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <button
              onClick={handleSkipPrev}
              disabled={loadingScript || currentSentenceIndex <= 0}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: currentSentenceIndex > 0 ? 'pointer' : 'not-allowed',
                color: currentSentenceIndex > 0 ? 'var(--text)' : 'var(--text-muted)',
                padding: '6px',
                borderRadius: '8px',
              }}
              title="Previous Sentence"
              aria-label="Previous Sentence"
            >
              <SkipBack size={17} />
            </button>

            <button
              onClick={handleTogglePlay}
              disabled={loadingScript}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, var(--primary), ${currentPersona.accentColor})`,
                color: 'white',
                border: 'none',
                cursor: loadingScript ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 8px 20px ${currentPersona.accentColor}44`,
                transition: 'transform 0.15s',
              }}
              title={status === 'playing' ? 'Pause' : 'Play'}
              aria-label={status === 'playing' ? 'Pause' : 'Play'}
            >
              {loadingScript ? (
                <span className="spinner spinner-sm" style={{ borderTopColor: 'white' }} />
              ) : status === 'playing' ? (
                <Pause size={19} className="fill-current" />
              ) : (
                <Play size={19} className="fill-current" style={{ marginLeft: '2px' }} />
              )}
            </button>

            <button
              onClick={handleSkipNext}
              disabled={loadingScript || currentSentenceIndex >= totalSentences - 1}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: currentSentenceIndex < totalSentences - 1 ? 'pointer' : 'not-allowed',
                color: currentSentenceIndex < totalSentences - 1 ? 'var(--text)' : 'var(--text-muted)',
                padding: '6px',
                borderRadius: '8px',
              }}
              title="Next Sentence"
              aria-label="Next Sentence"
            >
              <SkipForward size={17} />
            </button>

            <button
              onClick={handleReplay}
              disabled={loadingScript}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                padding: '6px',
                borderRadius: '8px',
              }}
              title="Restart from beginning"
              aria-label="Restart"
            >
              <RotateCcw size={15} />
            </button>
          </div>

          {/* Right: Persona Switcher, Speed & Settings Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {/* Speed Selector Button */}
            <button
              onClick={handleCycleSpeed}
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '4px 8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--text)',
                cursor: 'pointer',
              }}
              title="Toggle Speed"
            >
              {speedMultiplier.toFixed(2).replace(/\.00$/, '')}x
            </button>

            {/* Mute Toggle */}
            <button
              onClick={handleToggleMute}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: isMuted ? '#ef4444' : 'var(--text-secondary)',
                padding: '6px',
                borderRadius: '8px',
              }}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
            </button>

            {/* Voice Settings Trigger */}
            <button
              onClick={() => setShowSettings(true)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                padding: '6px',
                borderRadius: '8px',
              }}
              title="Voice Settings & Persona Customization"
            >
              <Sliders size={17} />
            </button>

            {/* Expand / Transcript Toggle */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                padding: '6px',
                borderRadius: '8px',
              }}
              title={isExpanded ? 'Hide Transcript' : 'Show Full Transcript'}
            >
              {isExpanded ? <ChevronDown size={19} /> : <ChevronUp size={19} />}
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                playerRef.current?.stop();
                onClose();
              }}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '6px',
                borderRadius: '8px',
              }}
              title="Close Audio Player"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        {/* Live Subtitle Teleprompter Strip */}
        <div
          style={{
            background: 'var(--bg)',
            borderTop: '1px solid var(--border)',
            padding: '10px 20px',
            fontSize: '0.85rem',
            color: 'var(--text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: 'var(--primary)',
                background: 'rgba(99, 102, 241, 0.12)',
                padding: '2px 6px',
                borderRadius: '6px',
                flexShrink: 0,
              }}
            >
              {currentSentenceIndex + 1}/{totalSentences}
            </span>
            <p
              style={{
                margin: 0,
                fontStyle: 'italic',
                color: 'var(--text)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              &ldquo;{activeSentenceText || 'Preparing audio stream...'}&rdquo;
            </p>
          </div>
        </div>

        {/* Expandable Transcript & Section Outline Drawer */}
        {isExpanded && script && (
          <div
            style={{
              maxHeight: '260px',
              overflowY: 'auto',
              background: 'var(--bg-white)',
              borderTop: '1px solid var(--border)',
              padding: '16px 20px',
            }}
          >
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Introduction
              </div>
              <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {script.intro}
              </p>
            </div>

            {script.sections?.map((sec, idx) => (
              <div key={idx} style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: currentPersona.accentColor, marginBottom: '2px' }}>
                  {sec.heading}
                </div>
                <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {sec.text}
                </p>
              </div>
            ))}

            {script.takeaways?.length > 0 && (
              <div style={{ marginTop: '14px', padding: '10px 14px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.08)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>
                  Key Takeaways
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {script.takeaways.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Voice Settings & Customizer Modal */}
      <VoiceSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        activePersona={persona}
        onSelectPersona={handlePersonaChange}
        onSettingsChanged={() => {
          if (playerRef.current) {
            const currentPrefs = getStoredVoicePrefs(persona);
            playerRef.current.updatePreferences(currentPrefs);
          }
        }}
      />
    </>
  );
}
