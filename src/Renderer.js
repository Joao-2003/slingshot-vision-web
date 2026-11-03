// Render.py: desenha cenário, estilingue, personagens, trajetória e HUD.
// Toda a arte é desenhada em canvas (personagens próprios, sem imagens externas).
import { toScreenY, GROUND_Y } from './Level.js';

const GROUND = toScreenY(GROUND_Y);
const C = { bird: '#2a9d8f', birdBelly: '#e9f5db', beak: '#f4a261', pest: '#6a4c93', pestDark: '#3c2a57',
  wood: '#c8955a', woodDark: '#8d5f34', band: '#3b2416' };

export class Renderer {
  constructor(game, canvas) {
    this.game = game; this.canvas = canvas; this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.clouds = Array.from({ length: 6 }, (_, i) => ({ x: i * 230 + Math.random() * 120, y: 60 + Math.random() * 120, s: 0.7 + Math.random() * 0.6 }));
  }

  burst(pos, color) {
    for (let i = 0; i < 14; i++) {
      const a = Math.random() * Math.PI * 2, v = 1 + Math.random() * 4;
      this.particles.push({ x: pos.x, y: pos.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, life: 40, color });
    }
  }
  hit(pos) { this.burst(pos, '#ffd166'); }

  render() {
    const ctx = this.ctx, g = this.game;
    this.background(ctx);
    this.slingBack(ctx);
    g.blocks.forEach((b) => this.block(ctx, b));
    g.pests.forEach((p) => this.pest(ctx, p.body.position.x, p.body.position.y, p.radius, p.body.angle, p.life / p.size.getLife()));
    this.trajectory(ctx);
    g.birds.forEach((b) => this.bird(ctx, b.body.position.x, b.body.position.y, b.radius, b.body.angle));
    this.slingFront(ctx);
    this.effects(ctx);
    this.hud(ctx);
  }

  background(ctx) {
    const w = this.canvas.width, h = this.canvas.height;
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
    sky.addColorStop(0, '#8ecae6'); sky.addColorStop(1, '#e0f4fb');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,214,102,.9)'; ctx.beginPath(); ctx.arc(1040, 90, 42, 0, 7); ctx.fill();
    for (const c of this.clouds) {
      c.x += 0.15 * c.s; if (c.x > w + 120) c.x = -160;
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      [[0, 0, 28], [28, -10, 34], [62, 0, 26], [30, 10, 30]].forEach(([dx, dy, r]) => {
        ctx.beginPath(); ctx.arc(c.x + dx * c.s, c.y + dy * c.s, r * c.s, 0, 7); ctx.fill();
      });
    }
    ctx.fillStyle = '#a7c957';
    ctx.beginPath(); ctx.moveTo(0, GROUND);
    for (let x = 0; x <= w; x += 40) ctx.lineTo(x, GROUND - 60 - 35 * Math.sin(x / 170) - 20 * Math.sin(x / 61));
    ctx.lineTo(w, GROUND); ctx.fill();
    ctx.fillStyle = '#6a994e'; ctx.fillRect(0, GROUND, w, 10);
    ctx.fillStyle = '#7f5539'; ctx.fillRect(0, GROUND + 10, w, h - GROUND);
    ctx.fillStyle = 'rgba(0,0,0,.08)';
    for (let x = 0; x < w; x += 46) ctx.fillRect(x, GROUND + 26 + (x % 3) * 9, 22, 4);
  }

  // estilingue em Y: braço de trás desenhado antes do pássaro, tronco e braço da frente depois
  arm(ctx, x0, y0, x1, y1, w, color) {
    ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  }
  slingBack(ctx) {
    const s = this.game.sling;
    this.arm(ctx, s.x, 462, s.x + 22, 410, 11, '#6b3f1d');
  }
  slingFront(ctx) {
    const g = this.game, s = g.sling;
    const tipBack = { x: s.x + 22, y: 412 }, tipFront = { x: s.x - 20, y: 412 };
    let p = null;
    if (g.level.birdsLeft > 0 && g.state === g.playingState) p = g.pulling ? g.pullPoint() : { x: s.x + 1, y: s.y + 4 };
    ctx.strokeStyle = C.band; ctx.lineWidth = 5; ctx.lineCap = 'round';
    if (p) { ctx.beginPath(); ctx.moveTo(tipBack.x, tipBack.y); ctx.lineTo(p.x, p.y); ctx.stroke(); }
    if (p) this.bird(ctx, p.x, p.y, g.birdSize.getRadius(), 0);
    this.arm(ctx, s.x, GROUND + 2, s.x, 460, 16, '#7b4a24');
    this.arm(ctx, s.x, 462, s.x - 20, 410, 12, '#8c5a2b');
    if (p) { ctx.strokeStyle = C.band; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(tipFront.x, tipFront.y); ctx.lineTo(p.x, p.y); ctx.stroke(); }
  }

  bird(ctx, x, y, r, angle) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
    ctx.fillStyle = '#21867a';
    ctx.beginPath(); ctx.moveTo(-r * 0.9, -r * 0.1); ctx.lineTo(-r * 1.55, -r * 0.45); ctx.lineTo(-r * 1.45, r * 0.25); ctx.fill(); // cauda
    ctx.fillStyle = C.bird; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill();
    ctx.fillStyle = C.birdBelly; ctx.beginPath(); ctx.ellipse(r * 0.1, r * 0.42, r * 0.62, r * 0.42, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#21867a'; ctx.beginPath(); ctx.ellipse(-r * 0.25, r * 0.05, r * 0.42, r * 0.26, -0.5, 0, 7); ctx.fill(); // asa
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(r * 0.38, -r * 0.3, r * 0.3, 0, 7); ctx.fill();
    ctx.fillStyle = '#1d3557'; ctx.beginPath(); ctx.arc(r * 0.45, -r * 0.3, r * 0.14, 0, 7); ctx.fill();
    ctx.fillStyle = C.beak; ctx.beginPath(); ctx.moveTo(r * 0.82, -r * 0.08); ctx.lineTo(r * 1.35, r * 0.05); ctx.lineTo(r * 0.82, r * 0.22); ctx.fill();
    ctx.restore();
  }

  pest(ctx, x, y, r, angle, health) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
    ctx.strokeStyle = C.pestDark; ctx.lineWidth = Math.max(1.5, r * 0.08);
    for (const s of [-1, 1]) for (const k of [-0.5, 0, 0.5]) {
      ctx.beginPath(); ctx.moveTo(s * r * 0.6, k * r * 0.8); ctx.lineTo(s * r * 1.15, k * r * 0.8 + r * 0.25); ctx.stroke(); // patas
    }
    ctx.beginPath(); ctx.moveTo(-r * 0.2, -r * 0.9); ctx.quadraticCurveTo(-r * 0.5, -r * 1.5, -r * 0.8, -r * 1.4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(r * 0.2, -r * 0.9); ctx.quadraticCurveTo(r * 0.5, -r * 1.5, r * 0.8, -r * 1.4); ctx.stroke();
    ctx.fillStyle = C.pest; ctx.beginPath(); ctx.ellipse(0, r * 0.1, r * 0.85, r, 0, 0, 7); ctx.fill();
    ctx.fillStyle = C.pestDark; ctx.beginPath(); ctx.ellipse(0, -r * 0.7, r * 0.55, r * 0.38, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = C.pestDark; ctx.lineWidth = Math.max(1, r * 0.07); ctx.beginPath(); ctx.moveTo(0, -r * 0.35); ctx.lineTo(0, r * 1.05); ctx.stroke();
    ctx.fillStyle = '#f1faee';
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * r * 0.22, -r * 0.75, r * 0.13, 0, 7); ctx.fill(); }
    ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.ellipse(-r * 0.35, -r * 0.05, r * 0.16, r * 0.35, 0.3, 0, 7); ctx.fill();
    ctx.restore();
    if (health < 1) {
      ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(x - r, y - r - 12, r * 2, 4);
      ctx.fillStyle = '#e63946'; ctx.fillRect(x - r, y - r - 12, r * 2 * Math.max(0, health), 4);
    }
  }

  block(ctx, b) {
    const v = b.vertices;
    ctx.fillStyle = C.wood; ctx.strokeStyle = C.woodDark; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(v[0].x, v[0].y); for (let i = 1; i < v.length; i++) ctx.lineTo(v[i].x, v[i].y); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.translate(b.position.x, b.position.y); ctx.rotate(b.angle);
    const beam = b.plugin.kind === 'beam', L = beam ? 34 : 34;
    ctx.strokeStyle = 'rgba(141,95,52,.55)'; ctx.lineWidth = 1.2;
    for (const k of [-0.25, 0.25]) {
      ctx.beginPath();
      if (beam) { ctx.moveTo(-L, k * 20); ctx.lineTo(L, k * 20); } else { ctx.moveTo(k * 20, -L); ctx.lineTo(k * 20, L); }
      ctx.stroke();
    }
    ctx.restore();
  }

  trajectory(ctx) {
    const last = this.game.birds[this.game.birds.length - 1];
    if (!last) return;
    ctx.fillStyle = 'rgba(255,255,255,.75)';
    last.path.forEach((p, i) => { if (i % 3 === 0) { ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, 7); ctx.fill(); } });
  }

  effects(ctx) {
    this.particles = this.particles.filter((p) => p.life > 0);
    for (const p of this.particles) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life--;
      ctx.globalAlpha = p.life / 40; ctx.fillStyle = p.color; ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
    }
    ctx.globalAlpha = 1;
  }

  hud(ctx) {
    const g = this.game;
    ctx.fillStyle = 'rgba(29,53,87,.85)'; ctx.font = '700 26px system-ui, sans-serif'; ctx.textAlign = 'right';
    ctx.fillText(`Pontos ${g.score.toLocaleString('pt-BR')}`, 1180, 40);
    ctx.textAlign = 'left'; ctx.fillText(`Fase ${g.level.number + 1}`, 20, 40);
    for (let i = 0; i < g.level.birdsLeft; i++) this.bird(ctx, 30 + i * 28, 72, 10, 0);
  }
}
