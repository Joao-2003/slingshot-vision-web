// Entrada por mouse ou toque: segurar perto do estilingue, puxar e soltar.
export class PointerInput {
  constructor(canvas, game) {
    this.canvas = canvas; this.game = game;
    this.pressed = false; this.position = { x: 0, y: 0 };
    const toGame = (e) => {
      const r = canvas.getBoundingClientRect();
      return { x: ((e.clientX - r.left) / r.width) * canvas.width, y: ((e.clientY - r.top) / r.height) * canvas.height };
    };
    canvas.addEventListener('pointerdown', (e) => {
      const p = toGame(e), s = game.sling;
      if (Math.hypot(p.x - s.x, p.y - s.y) < 110) {
        this.pressed = true; this.position = p; canvas.setPointerCapture(e.pointerId);
      }
    });
    canvas.addEventListener('pointermove', (e) => { if (this.pressed) this.position = toGame(e); });
    const up = () => { this.pressed = false; };
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
  }
}
