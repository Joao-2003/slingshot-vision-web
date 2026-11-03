// Level.py: monta as fases 1 a 14 e gera fases aleatórias da 15ª em diante,
// combinando duas fases base com tamanhos de personagens sorteados.
import { LEVELS } from './levels.js';
import { SETTLED } from './levels_settled.js';
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

  // Posições já assentadas pelo Pymunk (tools/export_levels.py), para cada fase começar igual ao original.
  // Porcos de outro tamanho (fases 15+) mantêm o ponto de apoio: o centro sobe ou desce conforme o raio.
  baseSpec(n, pestSize, shiftX = 0) {
    const L = LEVELS[n], S = SETTLED[n], BIG = SIZES.big.getRadius();
    return {
      birds: L.birds, birdsLowGravity: L.birdsLowGravity,
      targets: S.targets.map(([x, y]) => ({ x: x + shiftX, y: y - BIG + pestSize.getRadius(), size: pestSize })),
      blocks: [
        ...S.columns.map(([x, y, a]) => ({ x: x + shiftX, y, a, ...COL })),
        ...S.beams.map(([x, y, a]) => ({ x: x + shiftX, y, a, ...BEAM })),
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

  build(spec) {
    const g = this.game, world = g.engine.world;
    const items = [
      ...spec.blocks.map((b) => ({ ...b, type: 'block' })),
      ...spec.targets.map((t) => ({ x: t.x, y: t.y, w: t.size.getRadius() * 2, h: t.size.getRadius() * 2, size: t.size, type: 'pest' })),
    ];
    for (const it of items) {
      const y = toScreenY(it.y);
      if (it.type === 'pest') {
        g.pests.push(this.pestFactory.createCharacter(it.x, y, world, it.size));
      } else {
        // Polygon.py: massa 5, atrito 0,5, sem elasticidade
        const body = Bodies.rectangle(it.x, y, it.w, it.h, { angle: -(it.a || 0), friction: 0.5, restitution: 0, frictionAir: 0, slop: 0.02, label: 'wood' });
        Body.setMass(body, 5);
        // momento de inércia físico do retângulo (no Pymunk era 1000 fixo; com esse valor o Matter.js não sustenta as pilhas)
        Body.setInertia(body, (5 * (it.w * it.w + it.h * it.h)) / 12);
        body.plugin.kind = it.w > it.h ? 'beam' : 'column';
        Composite.add(world, body);
        g.blocks.push(body);
      }
    }
  }
}
