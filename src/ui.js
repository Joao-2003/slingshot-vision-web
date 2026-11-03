// Interface em HTML: botões, sobreposições de fim de fase e controle da câmera.
import { STARS } from './Game.js';
import { VisionInput } from './input/VisionInput.js';

export class UI {
  constructor() {
    this.$ = (s) => document.querySelector(s);
    this.overlay = this.$('#overlay');
    this.makeDraggable(this.$('#cam-box'));
  }

  // A janela da câmera começa no canto superior esquerdo (abaixo da fase) e pode ser arrastada.
  // A posição fica guardada no navegador, em porcentagem do palco, para valer em qualquer tamanho de tela.
  makeDraggable(box) {
    const stage = box.parentElement, KEY = 'slingshot.camPos';
    const place = (l, t) => {
      const maxL = 100 - (box.offsetWidth / stage.clientWidth) * 100, maxT = 100 - (box.offsetHeight / stage.clientHeight) * 100;
      box.style.left = `${Math.min(Math.max(l, 0), Math.max(maxL, 0))}%`;
      box.style.top = `${Math.min(Math.max(t, 0), Math.max(maxT, 0))}%`;
    };
    try { const s = JSON.parse(localStorage.getItem(KEY)); if (s) place(s.l, s.t); } catch (e) { /* sem armazenamento */ }
    let start = null;
    box.addEventListener('pointerdown', (e) => {
      start = { x: e.clientX, y: e.clientY, l: box.offsetLeft, t: box.offsetTop };
      box.setPointerCapture(e.pointerId); box.classList.add('dragging'); e.preventDefault(); e.stopPropagation();
    });
    box.addEventListener('pointermove', (e) => {
      if (!start) return;
      place(((start.l + e.clientX - start.x) / stage.clientWidth) * 100, ((start.t + e.clientY - start.y) / stage.clientHeight) * 100);
    });
    const end = () => {
      if (!start) return; start = null; box.classList.remove('dragging');
      try { localStorage.setItem(KEY, JSON.stringify({ l: parseFloat(box.style.left), t: parseFloat(box.style.top) })); } catch (e) { /* ignora */ }
    };
    box.addEventListener('pointerup', end); box.addEventListener('pointercancel', end);
  }

  bind(game) {
    const send = (type) => () => { game.sound.ensure(); game.handle({ type }); };
    this.$('#btn-pause').onclick = send('pause');
    this.$('#btn-restart').onclick = () => game.loadLevel(game.level.number);
    this.$('#btn-gravity').onclick = send('toggle-gravity');
    this.$('#btn-wall').onclick = send('toggle-wall');
    this.$('#btn-sound').onclick = () => { game.sound.setOn(!game.sound.on); this.setToggle('sound', !game.sound.on); };
    this.$('#btn-camera').onclick = () => this.toggleCamera(game);
    this.$('#btn-next').onclick = send('next');
    this.$('#btn-replay').onclick = send('replay');
    this.$('#btn-resume').onclick = send('pause');
    addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      if (k === 'p') send('pause')();
      if (k === 's') send('toggle-gravity')();
      if (k === 'w') send('toggle-wall')();
      if (k === 'r') game.loadLevel(game.level.number);
      if (k === 'c') this.toggleCamera(game);
    });
  }

  async toggleCamera(game) {
    const btn = this.$('#btn-camera'), status = this.$('#cam-status'), box = this.$('#cam-box');
    if (game.vision?.active) { game.vision.stop(); box.hidden = true; this.setToggle('camera', false); status.textContent = ''; return; }
    box.hidden = false; status.textContent = 'Carregando o modelo de mãos...'; btn.disabled = true;
    try {
      game.vision = game.vision || new VisionInput(game, this.$('#cam'));
      await game.vision.start();
      status.textContent = 'Junte polegar e indicador para agarrar, mova a mão para mirar e afaste os dedos para lançar.';
      this.setToggle('camera', true);
    } catch (err) {
      console.error(err); box.hidden = true;
      status.textContent = 'Não foi possível abrir a câmera. Use o mouse ou o toque.';
    } finally { btn.disabled = false; }
  }

  setToggle(name, on) { this.$(`#btn-${name}`)?.classList.toggle('on', on); }

  showState(name, game) {
    const o = this.overlay;
    o.dataset.state = name;
    o.hidden = !['paused', 'cleared', 'failed'].includes(name);
    if (name === 'cleared') {
      const stars = STARS.filter((s) => game.score >= s).length;
      this.$('#ov-title').textContent = 'Fase concluída!';
      // stars-edited.png recortada em três estrelas, como no Resources.py
      this.$('#ov-stars').innerHTML = [0, 1, 2].map((i) => `<img src="assets/img/star${i + 1}.png" alt="" class="${i < stars ? 'lit' : ''}">`).join('');
      this.$('#ov-score').textContent = `${game.score.toLocaleString('pt-BR')} pontos`;
    } else if (name === 'failed') {
      this.$('#ov-title').textContent = 'Fase perdida';
      this.$('#ov-stars').innerHTML = '<img src="assets/img/pig_failed.png" alt="" class="failed">';
      this.$('#ov-score').textContent = `${game.score.toLocaleString('pt-BR')} pontos`;
    } else if (name === 'paused') {
      this.$('#ov-title').textContent = 'Pausado';
      this.$('#ov-stars').innerHTML = ''; this.$('#ov-score').textContent = '';
    }
  }

  update() {}
}
