// Web Audio API & Web Speech API Sound Synthesis for Zen Dojo

class SoundEffects {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private speechEnabled: boolean = true;
  private speechTimeoutId: number | null = null;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public setSpeechEnabled(enabled: boolean) {
    this.speechEnabled = enabled;
  }

  public isSpeechEnabled(): boolean {
    return this.speechEnabled;
  }

  /**
   * Resonant wooden temple block (Mokugyo 木魚) sound
   * Warm, organic, soothing feedback for correct answers
   */
  public playCorrectSound() {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // Primary body tone (sine wave decaying rapidly)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.12);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);

      // Higher harmonic wood crack
      const clickOsc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      clickOsc.type = 'sine';
      clickOsc.frequency.setValueAtTime(1160, now);
      clickOsc.frequency.exponentialRampToValueAtTime(500, now + 0.05);

      clickGain.gain.setValueAtTime(0.25, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      clickOsc.connect(clickGain);
      clickGain.connect(this.ctx.destination);
      clickOsc.start(now);
      clickOsc.stop(now + 0.09);
    } catch {
      // Audio fallback silent
    }
  }

  /**
   * Shimmering Zen temple bell (Suzu / Rin 鈴) sound
   * Celebrates streaks and mastery milestones
   */
  public playStreakSound() {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const frequencies = [880, 1320, 1760];

      frequencies.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.2 / (idx + 1), now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + 0.75);
      });
    } catch {
      // ignore
    }
  }

  /**
   * Gentle, soft low gong (Kane 鐘) tone
   * Non-punitive, contemplative indicator for wrong answer
   */
  public playIncorrectSound() {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.35);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.42);
    } catch {
      // ignore
    }
  }

  /**
   * Cancel any active Japanese speech synthesis and pending repeat timers
   */
  public cancelSpeech() {
    if (this.speechTimeoutId !== null) {
      window.clearTimeout(this.speechTimeoutId);
      this.speechTimeoutId = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
  }

  /**
   * Pronounce Japanese character or phrase using native SpeechSynthesis once
   */
  public speakJapanese(text: string) {
    this.speakJapaneseRepeated(text, 1);
  }

  /**
   * Pronounce Japanese character or phrase repeating N times with a natural pause between repetitions
   */
  public speakJapaneseRepeated(text: string, count: number = 3, delayBetweenMs: number = 500) {
    if (!this.speechEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    this.cancelSpeech();

    // Clean text: strip leading tildes, take first alternative if slashes exist
    let clean = text.trim();
    if (clean.includes('/')) {
      clean = clean.split('/')[0].trim();
    }
    clean = clean.replace(/^[～~]/, '').trim();
    if (!clean) return;

    let remaining = count;

    const speakIteration = () => {
      if (remaining <= 0) return;

      try {
        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.lang = 'ja-JP';
        utterance.rate = 0.86; // Measured, natural pace for clear pronunciation
        utterance.pitch = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const jaVoice = voices.find((v) => v.lang.startsWith('ja') || v.lang.includes('JP'));
        if (jaVoice) {
          utterance.voice = jaVoice;
        }

        utterance.onend = () => {
          remaining--;
          if (remaining > 0) {
            this.speechTimeoutId = window.setTimeout(() => {
              speakIteration();
            }, delayBetweenMs);
          }
        };

        window.speechSynthesis.speak(utterance);
      } catch {
        // Fallback
      }
    };

    speakIteration();
  }
}

export const soundFx = new SoundEffects();
