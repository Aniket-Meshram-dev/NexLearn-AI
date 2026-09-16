'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Volume2,
  Sliders,
  Sparkles,
  Check,
  Play,
  RotateCcw,
} from 'lucide-react';
import {
  MentorPersonaId,
  MENTOR_PERSONAS,
} from '@/lib/mentor-personas';
import {
  getAvailableVoices,
  getStoredVoicePrefs,
  saveStoredVoicePrefs,
  DEFAULT_VOICE_PREFS,
  selectBestVoiceForPersona,
  VoicePreference,
} from '@/lib/voice-engine';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePersona: MentorPersonaId;
  onSelectPersona: (p: MentorPersonaId) => void;
  onSettingsChanged?: () => void;
}

export default function VoiceSettingsModal({
  isOpen,
  onClose,
  activePersona,
  onSelectPersona,
  onSettingsChanged,
}: VoiceSettingsModalProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [prefs, setPrefs] = useState<VoicePreference>(() => getStoredVoicePrefs(activePersona));
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  useEffect(() => {
    getAvailableVoices().then(setVoices);
  }, []);

  useEffect(() => {
    setPrefs(getStoredVoicePrefs(activePersona));
  }, [activePersona]);

  if (!isOpen) return null;

  const currentPersonaInfo = MENTOR_PERSONAS[activePersona] || MENTOR_PERSONAS.elena;
  const activeVoiceMatch = selectBestVoiceForPersona(voices, activePersona, prefs.voiceName);

  const handlePersonaChange = (id: MentorPersonaId) => {
    onSelectPersona(id);
    const newPrefs = getStoredVoicePrefs(id);
    setPrefs(newPrefs);
  };

  const handleUpdate = (updates: Partial<VoicePreference>) => {
    const updated = { ...prefs, ...updates };
    setPrefs(updated);
    saveStoredVoicePrefs(updated);
    onSettingsChanged?.();
  };

  const handleReset = () => {
    const defaultPref = DEFAULT_VOICE_PREFS[activePersona];
    setPrefs(defaultPref);
    saveStoredVoicePrefs(defaultPref);
    onSettingsChanged?.();
  };

  const handlePreviewVoice = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    if (isPlayingPreview) {
      setIsPlayingPreview(false);
      return;
    }

    const text = currentPersonaInfo.samplePhrase;
    const utterance = new SpeechSynthesisUtterance(text);

    if (activeVoiceMatch) {
      utterance.voice = activeVoiceMatch;
    }
    utterance.pitch = prefs.pitch;
    utterance.rate = prefs.rate;
    utterance.volume = prefs.volume;

    utterance.onstart = () => setIsPlayingPreview(true);
    utterance.onend = () => setIsPlayingPreview(false);
    utterance.onerror = () => setIsPlayingPreview(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          window.speechSynthesis?.cancel();
          onClose();
        }
      }}
    >
      <div
        style={{
          background: 'var(--bg-white)',
          border: '1px solid var(--border)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          padding: '28px',
          position: 'relative',
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'rgba(99, 102, 241, 0.12)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sliders size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Mentor Voice Studio</h2>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Customize voice persona, system accents, pitch, and speed
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              window.speechSynthesis?.cancel();
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
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Persona Selector Grid */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: '10px' }}>
            Choose AI Mentor Persona
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {Object.values(MENTOR_PERSONAS).map((p) => {
              const isSelected = p.id === activePersona;
              return (
                <button
                  key={p.id}
                  onClick={() => handlePersonaChange(p.id)}
                  style={{
                    background: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg)',
                    border: isSelected ? `2px solid ${p.accentColor}` : '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '1.4rem' }}>{p.avatar}</span>
                    {isSelected && (
                      <span
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: p.accentColor,
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Check size={11} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text)' }}>{p.name}</div>
                  <div style={{ fontSize: '0.72rem', color: p.accentColor, fontWeight: 700, marginBottom: '4px' }}>
                    {p.role}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                    {p.tagline}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* System Voice Selection */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: '8px' }}>
            Synthesized System Voice ({voices.length} detected)
          </label>
          <select
            value={prefs.voiceName || activeVoiceMatch?.name || ''}
            onChange={(e) => handleUpdate({ voiceName: e.target.value })}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '12px',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              fontSize: '0.86rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {voices.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name} ({v.lang}) {v.name.includes('Natural') ? '★' : ''}
              </option>
            ))}
          </select>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Automatically selects the most natural voice installed on your system matching {currentPersonaInfo.name}&apos;s vocal profile.
          </p>
        </div>

        {/* Pitch & Speed Adjustments */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)' }}>Vocal Pitch</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{prefs.pitch.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.75"
              max="1.3"
              step="0.05"
              value={prefs.pitch}
              onChange={(e) => handleUpdate({ pitch: parseFloat(e.target.value) })}
              style={{ width: '100%', accentColor: currentPersonaInfo.accentColor }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)' }}>Playback Speed</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{prefs.rate.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.75"
              max="1.75"
              step="0.05"
              value={prefs.rate}
              onChange={(e) => handleUpdate({ rate: parseFloat(e.target.value) })}
              style={{ width: '100%', accentColor: currentPersonaInfo.accentColor }}
            />
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={handleReset}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <RotateCcw size={14} />
            <span>Reset Defaults</span>
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handlePreviewVoice}
              className="btn btn-outline btn-sm"
              style={{
                borderRadius: '10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                borderColor: currentPersonaInfo.accentColor,
                color: currentPersonaInfo.accentColor,
              }}
            >
              {isPlayingPreview ? (
                <>
                  <Volume2 size={15} className="animate-pulse" />
                  <span>Speaking...</span>
                </>
              ) : (
                <>
                  <Play size={15} />
                  <span>Audition Voice</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                window.speechSynthesis?.cancel();
                onClose();
              }}
              className="btn btn-primary btn-sm"
              style={{ borderRadius: '10px', padding: '8px 18px' }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
