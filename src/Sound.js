// Resources.load_music() e load_sounds(): trilha em loop (volume 0.3) e efeitos do jogo original.
// Navegadores só liberam áudio depois de um clique ou toque, então a música começa na primeira interação.
// Se o navegador não tocar .ogg, os efeitos caem para tons sintetizados com Web Audio.
const BASE = 'assets/sound/';

export class Sound {
  constructor() {
    this.ctx = null; this.on = true; this.started = false;
    this.music = new Audio(`${BASE}angry-birds.ogg`);
    this.music.loop = true; this.music.volume = 0.3;
    this.fx = {};
    for (const n of ['stretch', 'release', 'pig']) {
      const a = new Audio(`${BASE}${n}.ogg`); a.preload = 'auto'; this.fx[n] = a;
    }
    this.canOgg = !!new Audio().canPlayType('audio/ogg; codecs="vorbis"');
    const unlock = () => { this.ensure(); this.startMusic(); };
    addEventListener('pointerdown', unlock, { once: true });
    addEventListener('keydown', unlock, { once: true });
  }

  ensure() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); return this.ctx; }

  startMusic() {
    if (!this.on || !this.canOgg) return;
    this.music.play().then(() => { this.started = true; }).catch(() => {});
  }

  setOn(on) {
    this.on = on;
    if (on) this.startMusic(); else this.music.pause();
  }

  play(name, fallback) {
    if (!this.on) return;
    const a = this.fx[name];
    if (this.canOgg && a) {
      const c = a.cloneNode(); c.volume = 0.8;
      c.play().catch(() => fallback && fallback());
    } else if (fallback) fallback();
  }

  tone(f0, f1, dur, type = 'sine', vol = 0.15) {
    if (!this.on) return;
    const ctx = this.ensure(), o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + dur);
  }

  stretch() { this.play('stretch', () => this.tone(180, 420, 0.35, 'triangle', 0.08)); }
  release() { this.play('release', () => this.tone(700, 160, 0.25, 'sawtooth', 0.06)); }
  hit() { this.play('pig', () => this.tone(520, 90, 0.3, 'square', 0.08)); }
  crack() { this.tone(240, 60, 0.18, 'triangle', 0.12); }
}
