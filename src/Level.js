// Level.py: monta as fases 1 a 14 e gera fases aleatórias da 15ª em diante,
// combinando duas fases base com tamanhos de personagens sorteados.
import { LEVELS } from './levels.js';
import { SIZES, randomSize } from './characters/Size.js';
import { PestFactory } from './factories/CharacterFactory.js';
const { Bodies, Body, Composite } = Matter;

export const GROUND_Y = 60;                 // chão do Pymunk
export const toScreenY = (y) => 600 - y;    // Physics.to_pygame()
const COL = { w: 20, h: 85 }, BEAM = { w: 85, h: 20 };

export class Level {
  constructor(game) {
    this.game = game;
    this.number = 0;
    this.birdsLeft = 4;
    this.pestFactory = new PestFactory();
  }

  restart() {
    const g = this.game, world = g.engine.world;
    [...g.pests, ...g.birds].forEach((c) => Composite.remove(world, c.body));
    g.blocks.forEach((b) => Composite.remove(world, b));
    g.pests = []; g.birds = []; g.blocks = [];
  }

  load(number = 0) {
    this.number = number;
    let spec;
    if (number > 13) spec = this.specialSpec();
    else spec = this.baseSpec(number, SIZES.big);
    this.game.birdSize = spec.birdSize || SIZES.normal;
    this.birdsLeft = this.game.lowGravity ? Math.max(spec.birdsLowGravity, spec.birds) : spec.birds;
    this.build(spec);
  }

  baseSpec(n, pestSize, shiftX = 0) {
    const L = LEVELS[n];
    return {
      birds: L.birds, birdsLowGravity: L.birdsLowGravity,
      targets: L.targets.map((t) => ({ x: t.x + shiftX, y: t.y, size: pestSize })),
      blocks: [
        ...L.columns.map(([x, y]) => ({ x: x + shiftX, y, ...COL })),
        ...L.beams.map(([x, y]) => ({ x: x + shiftX, y, ...BEAM })),
      ],
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

  // No Pymunk as peças das fases nascem levemente sobrepostas e o motor as separa.
  // Aqui cada peça é elevada até apoiar no chão ou na peça logo abaixo dela.
  stack(items) {
    const placed = [];
    const sorted = [...items].sort((p, q) => (p.y - p.h / 2) - (q.y - q.h / 2));
    for (const it of sorted) {
      let bottom = Math.max(it.y - it.h / 2, GROUND_Y);
      for (const p of placed) {
        const overlapX = Math.abs(p.x - it.x) < (p.w + it.w) / 2 - 8;
        if (overlapX && p.y < it.y && p.top > bottom) bottom = p.top;
      }
      it.y = bottom + it.h / 2;
      it.top = bottom + it.h;
      placed.push(it);
    }
  }

  build(spec) {
    const g = this.game, world = g.engine.world;
    const items = [
      ...spec.blocks.map((b) => ({ ...b, type: 'block' })),
      ...spec.targets.map((t) => ({ x: t.x, y: t.y, w: t.size.getRadius() * 2, h: t.size.getRadius() * 2, size: t.size, type: 'pest' })),
    ];
    this.stack(items);
    for (const it of items) {
      const y = toScreenY(it.y);
      if (it.type === 'pest') {
        g.pests.push(this.pestFactory.createCharacter(it.x, y, world, it.size));
      } else {
        const body = Bodies.rectangle(it.x, y, it.w, it.h, { friction: 0.8, frictionStatic: 1.2, restitution: 0.05, slop: 0.02, label: 'wood' });
        Body.setMass(body, 5);
        body.plugin.kind = it.w > it.h ? 'beam' : 'column';
        Composite.add(world, body);
        g.blocks.push(body);
      }
    }
  }
}
