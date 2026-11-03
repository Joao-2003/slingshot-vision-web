// Level.py: monta as fases 1 a 14 e gera fases aleatórias da 15ª em diante,
// combinando duas fases base com tamanhos de personagens sorteados.
import { LEVELS } from './levels.js';
import { SETTLED } from './levels_settled.js';
import { SIZES, randomSize } from './characters/Size.js';
import { PestFactory } from './factories/CharacterFactory.js';
import { COLLISION } from './characters/Character.js';
import { toScreen } from './Physics.js';

export const GROUND_Y = 60;                 // chão do Pymunk
export const toScreenY = (y) => 600 - y;    // Physics.to_pygame()
const COL = { w: 20, h: 85 }, BEAM = { w: 85, h: 20 };

// Polygon.py: viga ou coluna de madeira com massa 5, momento 1000 e atrito 0,5
export class Block {
  constructor(space, { x, y, a = 0, vx = 0, vy = 0, w0 = 0, w, h }) {
    this.w = w; this.h = h; this.kind = w > h ? 'beam' : 'column';
    this.cpBody = space.addBody(new cp.Body(5, 1000));
    this.cpBody.setPos(cp.v(x, y)); this.cpBody.setAngle(a);
    this.cpBody.setVel(cp.v(vx, vy)); this.cpBody.w = w0;
    this.shape = space.addShape(new cp.BoxShape(this.cpBody, w, h));
    this.shape.setFriction(0.5);
    this.shape.setCollisionType(COLLISION.wood);
    this.shape.owner = this;
  }
  get position() { return toScreen(this.cpBody.p); }
  get angle() { return -this.cpBody.a; }
  remove(space) {
    if (this.shape.space) space.removeShape(this.shape);
    if (this.cpBody.space) space.removeBody(this.cpBody);
  }
}

export class Level {
  constructor(game) {
    this.game = game;
    this.number = 0;
    this.birdsLeft = 4;
    this.pestFactory = new PestFactory();
  }

  restart() {
    const g = this.game;
    [...g.pests, ...g.birds, ...g.blocks].forEach((o) => o.remove(g.space));
    g.pests = []; g.birds = []; g.blocks = [];
  }

  load(number = 0) {
    this.number = number;
    const spec = number > 13 ? this.specialSpec() : this.baseSpec(number, SIZES.big);
    this.game.birdSize = spec.birdSize || SIZES.normal;
    this.birdsLeft = this.game.lowGravity ? Math.max(spec.birdsLowGravity, spec.birds) : spec.birds;
    this.build(spec);
  }

  // Estado de cada fase depois do assentamento no Pymunk (tools/export_levels.py, a partir do Level.py).
  // Porcos de outro tamanho (fases 15+) mantêm o ponto de apoio: o centro sobe ou desce conforme o raio.
  baseSpec(n, pestSize, shiftX = 0) {
    const L = LEVELS[n], S = SETTLED[n], BIG = SIZES.big.getRadius();
    const st = ([x, y, a, vx, vy, w0]) => ({ x: x + shiftX, y, a, vx, vy, w0 });
    return {
      birds: L.birds, birdsLowGravity: L.birdsLowGravity,
      targets: S.targets.map((t) => { const o = st(t); o.y += pestSize.getRadius() - BIG; return { ...o, size: pestSize }; }),
      blocks: [...S.columns.map((c) => ({ ...st(c), ...COL })), ...S.beams.map((b) => ({ ...st(b), ...BEAM }))],
    };
  }

  // load_special_level(): duas fases base, a segunda deslocada 450 px para a esquerda
  specialSpec() {
    const a = this.baseSpec(Math.floor(Math.random() * 14), randomSize());
    const b = this.baseSpec(Math.floor(Math.random() * 14), randomSize(), -450);
    const birds = 5 + Math.floor(Math.random() * 4);
    return { birds, birdsLowGravity: birds, birdSize: randomSize(),
      targets: [...a.targets, ...b.targets], blocks: [...a.blocks, ...b.blocks] };
  }

  build(spec) {
    const g = this.game;
    for (const t of spec.targets) {
      const pest = this.pestFactory.createCharacter(t.x, t.y, g.space, t.size);
      pest.cpBody.setAngle(t.a); pest.cpBody.setVel(cp.v(t.vx, t.vy)); pest.cpBody.w = t.w0;
      g.pests.push(pest);
    }
    for (const b of spec.blocks) g.blocks.push(new Block(g.space, b));
  }
}
