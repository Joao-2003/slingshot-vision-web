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
const { Engine, Bodies, Composite } = Matter;

export const ROPE_LENGTH = 90;
export const STARS = [20000, 40000, 60000];

export class Game {
  constructor(canvas, ui) {
    this.canvas = canvas; this.ui = ui;
    this.engine = Engine.create({ positionIterations: 12, velocityIterations: 10, enableSleeping: true });
    this.engine.gravity.scale = GRAVITY_NORMAL;
    const w = canvas.width;
    this.ground = Bodies.rectangle(w / 2, 540 + 50, w * 3, 100, { isStatic: true, friction: 1, restitution: 0.5, label: 'ground' });
    this.wall = Bodies.rectangle(w + 25, 300, 50, 1200, { isStatic: true, restitution: 0.6, label: 'wall' });
    Composite.add(this.engine.world, this.ground);
    this.wallOn = false; this.lowGravity = false;

    this.sling = { x: 147, y: 418 };
    this.pests = []; this.birds = []; this.blocks = [];
    this.score = 0; this.bonusOnce = true; this.lastLaunch = 0; this.damageEnabledAt = 0;
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
    // assenta as estruturas antes de liberar o dano (no Pymunk isso acontecia nos primeiros quadros)
    this.damageEnabledAt = Infinity;
    for (let i = 0; i < 90; i++) Engine.update(this.engine, 1000 / 60);
    this.damageEnabledAt = performance.now() + 300;
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
    const bird = this.birdFactory.createCharacter(p.distance, angle, p.x, p.y, this.engine.world, this.birdSize);
    this.birds.push(bird);
    this.level.birdsLeft -= 1;
    this.lastLaunch = performance.now();
    this.sound.release();
  }

  step() {
    this.state.update();
    if (this.state !== this.pausedState) Engine.update(this.engine, 1000 / 60);
    const last = this.birds[this.birds.length - 1];
    if (last && last.path.length < 400 && last.body.speed > 0.5) last.path.push({ ...last.body.position });
    for (const b of [...this.birds]) {
      const { x, y } = b.body.position;
      if (x > 1500 || x < -300 || y > 900) { Composite.remove(this.engine.world, b.body); this.birds = this.birds.filter((q) => q !== b); }
    }
    for (const p of [...this.pests]) if (p.body.position.y > 900 || p.body.position.x > 1500) this.physics.killPest(p);
    this.renderer.render();
    this.ui.update(this);
  }
}
