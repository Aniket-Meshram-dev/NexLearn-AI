'use client';

import { MentorPersonaId, MENTOR_PERSONAS } from './mentor-personas';

export interface VoicePreference {
  personaId: MentorPersonaId;
  voiceName?: string;
  pitch: number;
  rate: number;
  volume: number;
}

export const DEFAULT_VOICE_PREFS: Record<MentorPersonaId, VoicePreference> = {
  elena: {
    personaId: 'elena',
    pitch: 1.1,
    rate: 1.0,
    volume: 1.0,
  },
  alex: {
    personaId: 'alex',
    pitch: 0.95,
    rate: 1.0,
    volume: 1.0,
  },
  marcus: {
    personaId: 'marcus',
    pitch: 1.05,
    rate: 1.15,
    volume: 1.0,
  },
  sophia: {
    personaId: 'sophia',
    pitch: 1.0,
    rate: 0.95,
    volume: 1.0,
  },
};

const STORAGE_KEY = 'nexlearn_mentor_voice_prefs';

export function getStoredVoicePrefs(personaId: MentorPersonaId): VoicePreference {
  if (typeof window === 'undefined') return DEFAULT_VOICE_PREFS[personaId];
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${personaId}`);
    if (raw) {
      return { ...DEFAULT_VOICE_PREFS[personaId], ...JSON.parse(raw) };
    }
  } catch (e) {}
  return DEFAULT_VOICE_PREFS[personaId];
}

export function saveStoredVoicePrefs(pref: VoicePreference) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_KEY}_${pref.personaId}`, JSON.stringify(pref));
  } catch (e) {}
}

/**
 * Returns all installed speech synthesis voices, waiting for voiceschanged if needed.
 */
export function getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return resolve([]);
    }

    const current = window.speechSynthesis.getVoices();
    if (current && current.length > 0) {
      return resolve(current);
    }

    const handler = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
      resolve(window.speechSynthesis.getVoices());
    };

    window.speechSynthesis.addEventListener('voiceschanged', handler);

    // Safety timeout in case voiceschanged does not fire
    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
      resolve(window.speechSynthesis.getVoices());
    }, 400);
  });
}

/**
 * Selects the best available system voice for a given mentor persona.
 */
export function selectBestVoiceForPersona(
  voices: SpeechSynthesisVoice[],
  personaId: MentorPersonaId,
  preferredVoiceName?: string
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  // 1. Explicit user override
  if (preferredVoiceName) {
    const match = voices.find((v) => v.name === preferredVoiceName);
    if (match) return match;
  }

  const persona = MENTOR_PERSONAS[personaId] || MENTOR_PERSONAS.elena;
  const isFemale = persona.voiceGender === 'female';

  const femaleKeywords = ['female', 'jenny', 'zira', 'samantha', 'serena', 'karen', 'victoria', 'fiona', 'hazel', 'ava'];
  const maleKeywords = ['male', 'guy', 'david', 'george', 'daniel', 'oliver', 'mark', 'alex', 'brian'];

  const targetKeywords = isFemale ? femaleKeywords : maleKeywords;

  // English voices prioritize natural/online/google voices
  const enVoices = voices.filter((v) => v.lang.startsWith('en'));
  const candidatePool = enVoices.length > 0 ? enVoices : voices;

  // 2. High-quality natural voices matching gender
  const naturalGenderMatch = candidatePool.find((v) => {
    const lower = v.name.toLowerCase();
    const isNatural = lower.includes('natural') || lower.includes('google') || lower.includes('online');
    return isNatural && targetKeywords.some((kw) => lower.includes(kw));
  });
  if (naturalGenderMatch) return naturalGenderMatch;

  // 3. Any voice matching gender keywords
  const anyGenderMatch = candidatePool.find((v) => {
    const lower = v.name.toLowerCase();
    return targetKeywords.some((kw) => lower.includes(kw));
  });
  if (anyGenderMatch) return anyGenderMatch;

  // 4. Fallback to any natural/Google English voice
  const naturalFallback = candidatePool.find((v) => {
    const lower = v.name.toLowerCase();
    return lower.includes('natural') || lower.includes('google');
  });
  if (naturalFallback) return naturalFallback;

  // 5. Fallback to first candidate
  return candidatePool[0] || null;
}

export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused';

export interface VoicePlaybackCallbacks {
  onSentenceChange?: (index: number, text: string) => void;
  onStatusChange?: (status: PlaybackStatus) => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

/**
 * Controller that plays sentences sequentially with full playback controls.
 */
export class SentenceVoicePlayer {
  private sentences: string[] = [];
  private currentIndex: number = 0;
  private status: PlaybackStatus = 'idle';
  private callbacks: VoicePlaybackCallbacks = {};
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private personaId: MentorPersonaId = 'elena';
  private prefs: VoicePreference;
  private voices: SpeechSynthesisVoice[] = [];
  private keepAliveInterval: any = null;

  constructor(personaId: MentorPersonaId = 'elena', callbacks: VoicePlaybackCallbacks = {}) {
    this.personaId = personaId;
    this.callbacks = callbacks;
    this.prefs = getStoredVoicePrefs(personaId);
    if (typeof window !== 'undefined') {
      getAvailableVoices().then((v) => {
        this.voices = v;
      });
    }
  }

  public updatePersona(personaId: MentorPersonaId) {
    this.personaId = personaId;
    this.prefs = getStoredVoicePrefs(personaId);
  }

  public updatePreferences(prefs: Partial<VoicePreference>) {
    this.prefs = { ...this.prefs, ...prefs };
    saveStoredVoicePrefs(this.prefs);
  }

  public getPreferences(): VoicePreference {
    return this.prefs;
  }

  public loadSentences(sentences: string[]) {
    this.stop();
    this.sentences = sentences;
    this.currentIndex = 0;
  }

  public play(startIndex: number = 0) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.callbacks.onError?.('Speech synthesis not supported in this browser.');
      return;
    }

    if (this.status === 'paused') {
      this.resume();
      return;
    }

    if (this.sentences.length === 0) return;

    this.currentIndex = Math.max(0, Math.min(startIndex, this.sentences.length - 1));
    this.setStatus('playing');
    this.startKeepAlive();
    this.speakCurrent();
  }

  public pause() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (this.status === 'playing') {
      window.speechSynthesis.pause();
      this.setStatus('paused');
    }
  }

  public resume() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (this.status === 'paused') {
      window.speechSynthesis.resume();
      this.setStatus('playing');
    }
  }

  public stop() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.stopKeepAlive();
    window.speechSynthesis.cancel();
    this.currentUtterance = null;
    this.setStatus('idle');
  }

  public skipTo(index: number) {
    if (index < 0 || index >= this.sentences.length) return;
    const wasPlaying = this.status === 'playing';
    this.stop();
    this.currentIndex = index;
    if (wasPlaying) {
      this.play(index);
    } else {
      this.callbacks.onSentenceChange?.(index, this.sentences[index]);
    }
  }

  public skipNext() {
    if (this.currentIndex < this.sentences.length - 1) {
      this.skipTo(this.currentIndex + 1);
    }
  }

  public skipPrev() {
    if (this.currentIndex > 0) {
      this.skipTo(this.currentIndex - 1);
    }
  }

  public getStatus(): PlaybackStatus {
    return this.status;
  }

  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  public getTotalSentences(): number {
    return this.sentences.length;
  }

  private setStatus(newStatus: PlaybackStatus) {
    this.status = newStatus;
    this.callbacks.onStatusChange?.(newStatus);
  }

  private speakCurrent() {
    if (this.status !== 'playing') return;
    if (this.currentIndex >= this.sentences.length) {
      this.stop();
      this.callbacks.onEnd?.();
      return;
    }

    const text = this.sentences[this.currentIndex];
    this.callbacks.onSentenceChange?.(this.currentIndex, text);

    const utterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance = utterance;

    const voice = selectBestVoiceForPersona(this.voices, this.personaId, this.prefs.voiceName);
    if (voice) utterance.voice = voice;

    utterance.pitch = this.prefs.pitch;
    utterance.rate = this.prefs.rate;
    utterance.volume = this.prefs.volume;

    utterance.onend = () => {
      if (this.status === 'playing') {
        this.currentIndex++;
        this.speakCurrent();
      }
    };

    utterance.onerror = (e) => {
      // Ignore if canceled intentionally
      if (e.error === 'interrupted' || e.error === 'canceled') return;
      console.warn('Speech synthesis utterance error:', e);
      if (this.status === 'playing') {
        this.currentIndex++;
        this.speakCurrent();
      }
    };

    window.speechSynthesis.speak(utterance);
  }

  // Prevents Chrome SpeechSynthesis pause bug on long inactivity
  private startKeepAlive() {
    this.stopKeepAlive();
    this.keepAliveInterval = setInterval(() => {
      if (this.status === 'playing' && window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 12000);
  }

  private stopKeepAlive() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }
}
