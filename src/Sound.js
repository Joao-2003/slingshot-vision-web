// Efeitos sonoros sintetizados com Web Audio (sem arquivos de áudio).
export class Sound {
  constructor() { this.ctx = null; this.on = true; }
  ensure() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); return this.ctx; }
  tone(f0, f1, dur, type = 'sine', vol = 0.15) {
    if (!this.on) return;
    const ctx = this.ensure(), o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + dur);
  }
  stretch() { this.tone(180, 420, 0.35, 'triangle', 0.08); }
  release() { this.tone(700, 160, 0.25, 'sawtooth', 0.06); }
  hit() { this.tone(520, 90, 0.3, 'square', 0.08); }
  crack() { this.tone(240, 60, 0.18, 'triangle', 0.12); }
}
