// Vision.py portado para o navegador com MediaPipe Tasks (HandLandmarker).
// Encostar polegar e indicador agarra o estilingue, mover a mão mira e soltar os dedos lança.
const VISION_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14';
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
const MIN_PINCH_MS = 200;      // MIN_PINCH_DURATION = 0.2 no original
const PINCH_ON = 0.35, PINCH_OFF = 0.5; // distância polegar-indicador relativa ao tamanho da mão
const GAIN = 700;              // px do jogo por largura de quadro de movimento da mão

export class VisionInput {
  constructor(game, preview) {
    this.game = game; this.preview = preview;
    this.pressed = false; this.position = { ...game.sling };
    this.active = false; this.pinchSince = null; this.anchor = null;
  }

  async start() {
    const { FilesetResolver, HandLandmarker } = await import(`${VISION_URL}/vision_bundle.mjs`);
    const fileset = await FilesetResolver.forVisionTasks(`${VISION_URL}/wasm`);
    this.landmarker = await HandLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' }, runningMode: 'VIDEO', numHands: 1,
    });
    this.video = document.createElement('video');
    this.video.playsInline = true; this.video.muted = true;
    this.video.srcObject = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
    await this.video.play();
    this.active = true;
    this.loop();
  }

  stop() {
    this.active = false; this.pressed = false;
    this.video?.srcObject?.getTracks().forEach((t) => t.stop());
    const ctx = this.preview.getContext('2d'); ctx.clearRect(0, 0, this.preview.width, this.preview.height);
  }

  loop() {
    if (!this.active) return;
    const res = this.landmarker.detectForVideo(this.video, performance.now());
    this.draw(res);
    const hand = res.landmarks?.[0];
    if (hand) this.track(hand); else { this.pressed = false; this.pinchSince = null; this.anchor = null; }
    requestAnimationFrame(() => this.loop());
  }

  track(h) {
    const d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const ratio = d(h[4], h[8]) / Math.max(d(h[0], h[9]), 1e-6);
    const pos = { x: 1 - (h[4].x + h[8].x) / 2, y: (h[4].y + h[8].y) / 2 }; // espelhado
    if (ratio < PINCH_ON || (this.pressed && ratio < PINCH_OFF)) {
      if (this.pinchSince === null) this.pinchSince = performance.now();
      if (performance.now() - this.pinchSince > MIN_PINCH_MS) {
        if (!this.anchor) this.anchor = pos;
        const s = this.game.sling;
        this.position = { x: s.x + (pos.x - this.anchor.x) * GAIN, y: s.y + (pos.y - this.anchor.y) * GAIN };
        this.pressed = true;
      }
    } else { this.pressed = false; this.pinchSince = null; this.anchor = null; }
  }

  draw(res) {
    const c = this.preview, ctx = c.getContext('2d');
    ctx.save(); ctx.translate(c.width, 0); ctx.scale(-1, 1);
    ctx.drawImage(this.video, 0, 0, c.width, c.height);
    ctx.restore();
    for (const h of res.landmarks || []) {
      for (const [i, p] of h.entries()) {
        ctx.fillStyle = i === 4 || i === 8 ? (this.pressed ? '#ffd54f' : '#4fc3f7') : 'rgba(255,255,255,.8)';
        ctx.beginPath(); ctx.arc((1 - p.x) * c.width, p.y * c.height, i === 4 || i === 8 ? 5 : 2.5, 0, 7); ctx.fill();
      }
    }
  }
}
