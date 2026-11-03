// Game.py: reúne motor físico, estados, fase, entrada e renderização.
import { Level } from './Level.js';
import { Physics } from './Physics.js';
import { Renderer } from './Renderer.js';
import { Sound } from './Sound.js';
import { Subject } from './observer/Subject.js';
import { GRAVITY_NORMAL } from './observer/GravityObserver.js';
import { BirdFactory } from './factories/CharacterFactory.js';
import { SIZES } from './characters/Size.js';
import { PlayingState } from './states/PlayingState.js';
import { LevelPausedState } from './states/LevelPausedState.js';
import { LevelClearedState } from './states/LevelClearedState.js';
import { LevelFailedState } from './states/LevelFailedState.js';
import { PointerInput } from './input/PointerInput.js';
import { COLLISION } from './characters/Character.js';

export const ROPE_LENGTH = 90;
// Physics.update_physics(): passos fixos de 0,01 s, como no Python (que fazia 2 por quadro a 50 fps).
// Aqui o laço roda a 60 fps e acumula o tempo, para manter o mesmo passo e o mesmo ritmo real.
export const DT = 0.01;
export const STARS = [20000, 40000, 60000];

export class Game {
  constructor(canvas, ui) {
    this.canvas = canvas; this.ui = ui;
    // Resources.init(): espaço com gravidade de 700 px/s², chão em y = 60 e muro opcional em x = 1200
    this.space = new cp.Space();
    this.space.gravity = cp.v(0, GRAVITY_NORMAL);
    // o Chipmunk 6.1 (porte em JS) converge mais devagar que o Chipmunk 7 do Pymunk: 20 iterações
    // deixam as pilhas com o mesmo comportamento das 10 do original
    this.space.iterations = 20;
    const line = (a, b) => {
      const seg = new cp.SegmentShape(this.space.staticBody, a, b, 0);
      seg.setElasticity(0.95); seg.setFriction(1); seg.setCollisionType(COLLISION.ground);
      return seg;
    };
    this.ground = this.space.addShape(line(cp.v(0, 60), cp.v(1200, 60)));
    this.wall = line(cp.v(1200, 60), cp.v(1200, 800));
    this.acc = 0;
    this.wallOn = false; this.lowGravity = false;

    this.sling = { x: 147, y: 418 };
    this.pests = []; this.birds = []; this.blocks = [];
    this.score = 0; this.bonusOnce = true; this.lastLaunch = 0; this.damageOn = false;
    this.pulling = false; this.aim = { ...this.sling };
    this.birdSize = SIZES.normal;

    this.subject = new Subject();
    this.sound = new Sound();
    this.birdFactory = new BirdFactory();
    this.level = new Level(this);
    this.physics = new Physics(this);
    this.renderer = new Renderer(this, canvas);
    this.pointer = new PointerInput(canvas, this);
    this.vision = null;

    this.playingState = new PlayingState(this);
    this.pausedState = new LevelPausedState(this);
    this.clearedState = new LevelClearedState(this);
    this.failedState = new LevelFailedState(this);
    this.state = this.playingState;
  }

  get input() { return this.vision?.active ? this.vision : this.pointer; }

  setState(state) { this.state = state; this.ui.showState(state.name, this); }

  handle(event) { this.subject.notifyObservers(event); this.state.handleInput(event); }

  loadLevel(n) {
    this.level.restart();
    this.score = 0; this.bonusOnce = true; this.pulling = false;
    this.level.load(n);
    // a fase já começa assentada (levels_settled.js) e o dano vale desde o início, como no original
    this.acc = 0;
    this.damageOn = true;
    this.setState(this.playingState);
  }

  pullPoint() {
    const s = this.sling, a = this.aim;
    const dx = a.x - s.x, dy = a.y - s.y, d = Math.hypot(dx, dy) || 1e-9;
    const k = Math.min(d, ROPE_LENGTH) / d;
    return { x: s.x + dx * k, y: s.y + dy * k, distance: Math.min(d, ROPE_LENGTH) };
  }

  launch() {
    const p = this.pullPoint();
    if (p.distance < 8) return; // toque sem puxar não gasta pássaro
    const angle = Math.atan2(this.sling.y - p.y, this.sling.x - p.x);
    const bird = this.birdFactory.createCharacter(p.distance, angle, p.x, p.y, this.space, this.birdSize);
    this.birds.push(bird);
    this.level.birdsLeft -= 1;
    this.lastLaunch = performance.now();
    this.sound.release();
  }

  stepPhysics(frame = 1 / 60) {
    this.acc += frame;
    while (this.acc >= DT - 1e-9) { this.space.step(DT); this.acc -= DT; }
  }

  step() {
    this.state.update();
    if (this.state !== this.pausedState) this.stepPhysics();
    const last = this.birds[this.birds.length - 1];
    if (last && last.path.length < 400 && last.speed > 30) last.path.push(last.position);
    // Render.render_birds()/render_pigs(): quem cai abaixo do chão (y < 0 no Pymunk) sai da fase, sem pontos
    for (const b of [...this.birds]) if (b.position.y > 600) { b.remove(this.space); this.birds = this.birds.filter((q) => q !== b); }
    for (const p of [...this.pests]) if (p.position.y > 600) { p.remove(this.space); this.pests = this.pests.filter((q) => q !== p); }
    this.renderer.render();
    this.ui.update(this);
  }
}
