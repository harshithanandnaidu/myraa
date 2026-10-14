// Web Audio API synthesized romantic music box & sound effects
// Zero external assets required — guaranteed to work offline and without network lag

class BirthdayAudioPlayer {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private timeoutId: number | null = null;
  private noteIndex: number = 0;
  private volume: number = 0.5;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a single soft music-box note
  playChime(frequency: number, duration: number = 1.2, detune: number = 0) {
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Soft sine + overtone for music box sparkle
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
      osc.detune.setValueAtTime(detune, this.ctx.currentTime);

      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.28 * this.volume, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }

  // Play a random sweet heart-chime on click
  playHeartPop() {
    const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5]; // C5, D5, E5, G5, A5, C6
    const note = scale[Math.floor(Math.random() * scale.length)];
    this.playChime(note, 0.8);
    // Add subtle upper harmonic
    setTimeout(() => {
      this.playChime(note * 1.5, 0.5, 5);
    }, 40);
  }

  // Celebration fanfare on blowing candle
  playCelebrationFanfare() {
    const notes = [
      { freq: 523.25, delay: 0 },
      { freq: 659.25, delay: 150 },
      { freq: 783.99, delay: 300 },
      { freq: 1046.5, delay: 450 },
      { freq: 1318.51, delay: 650 },
    ];
    notes.forEach((n) => {
      setTimeout(() => this.playChime(n.freq, 1.8), n.delay);
    });
  }

  // Romantic music box melody: Happy Birthday intertwined with soft romantic lullaby
  private melody: [number, number][] = [
    // Happy Birthday phrase 1
    [261.63, 350], [261.63, 350], [293.66, 700], [261.63, 700], [349.23, 700], [329.63, 1400],
    // Happy Birthday phrase 2
    [261.63, 350], [261.63, 350], [293.66, 700], [261.63, 700], [392.00, 700], [349.23, 1400],
    // Romantic arpeggio transition
    [523.25, 500], [659.25, 500], [783.99, 500], [659.25, 500],
    // Happy Birthday dear Myraa
    [261.63, 350], [261.63, 350], [523.25, 700], [440.00, 700], [349.23, 700], [329.63, 700], [293.66, 1200],
    // Final sweet phrase
    [466.16, 350], [466.16, 350], [440.00, 700], [349.23, 700], [392.00, 700], [349.23, 1600],
    // Gentle lullaby chords (romantic slow flow)
    [392.00, 600], [440.00, 600], [523.25, 900], [493.88, 600], [440.00, 600], [392.00, 900],
    [349.23, 600], [329.63, 600], [293.66, 900], [329.63, 600], [349.23, 600], [392.00, 1200],
  ];

  startMelody() {
    this.initContext();
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.noteIndex = 0;
    this.playNextNote();
  }

  private playNextNote = () => {
    if (!this.isPlaying) return;
    const [freq, duration] = this.melody[this.noteIndex];
    this.playChime(freq, (duration / 1000) * 1.5);

    // Gentle low bass note for depth
    if (this.noteIndex % 4 === 0) {
      this.playChime(freq / 2, 2.0);
    }

    this.noteIndex = (this.noteIndex + 1) % this.melody.length;
    this.timeoutId = window.setTimeout(this.playNextNote, duration);
  };

  stopMelody() {
    this.isPlaying = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  toggleMelody(): boolean {
    if (this.isPlaying) {
      this.stopMelody();
      return false;
    } else {
      this.startMelody();
      return true;
    }
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }
}

export const birthdayAudio = new BirthdayAudioPlayer();
