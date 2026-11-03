// Physics.py: colisões e regras de dano, com os mesmos limiares de impulso do original.
import { SUBSTEPS } from './Game.js';
const { Events, Composite, Pair } = Matter;

// O Pymunk combina elasticidade e atrito multiplicando os valores das duas formas
// (pássaro 0,95 x madeira 0 = sem quique; pássaro x chão = 0,9). O Matter.js usa o
// maior e o menor valor; este ajuste reproduz a regra do Pymunk.
if (!Pair.__pymunk) {
  const update = Pair.update;
  Pair.update = function (pair, collision, timestamp) {
    update(pair, collision, timestamp);
    const a = collision.parentA, b = collision.parentB;
    pair.restitution = a.restitution * b.restitution;
    pair.friction = a.friction * b.friction;
  };
  Pair.__pymunk = true;
}

export class Physics {
  constructor(game) {
    this.game = game;
    Events.on(game.engine, 'collisionStart', (ev) => this.onCollision(ev));
  }

  static impulse(pair) {
    const a = pair.bodyA, b = pair.bodyB, n = pair.collision.normal;
    const rel = ((a.velocity.x - b.velocity.x) * n.x + (a.velocity.y - b.velocity.y) * n.y) * 60 * SUBSTEPS; // px/s (velocidade do Matter é por subpasso)
    const ma = a.isStatic ? Infinity : a.mass, mb = b.isStatic ? Infinity : b.mass;
    const mEff = ma === Infinity ? mb : mb === Infinity ? ma : (ma * mb) / (ma + mb);
    return Math.abs(rel) * mEff * 1.5; // (1 + elasticidade)
  }

  onCollision(ev) {
    const g = this.game;
    if (performance.now() < g.damageEnabledAt) return;
    for (const pair of ev.pairs) {
      const kinds = [pair.bodyA, pair.bodyB].map((b) => b.label);
      const imp = Physics.impulse(pair);
      const get = (k) => (pair.bodyA.label === k ? pair.bodyA : pair.bodyB);
      if (kinds.includes('bird') && kinds.includes('pest')) {
        this.killPest(get('pest').plugin.owner);                       // post_solve_bird_pig
      } else if (kinds.includes('bird') && kinds.includes('wood') && imp > 1100) {
        this.breakBlock(get('wood'));                                  // post_solve_bird_wood
      } else if (kinds.includes('pest') && kinds.includes('wood') && imp > 700) {
        const pest = get('pest').plugin.owner;                         // post_solve_pig_wood
        pest.life -= 20; g.score += 10000;
        if (pest.life <= 0) this.killPest(pest, false);
        else g.renderer.hit(pest.body.position);
      }
    }
  }

  killPest(pest, addScore = true) {
    const g = this.game;
    if (!pest || !g.pests.includes(pest)) return;
    g.pests = g.pests.filter((p) => p !== pest);
    if (addScore) g.score += 10000;
    g.renderer.burst(pest.body.position, '#8bc34a');
    g.sound.hit();
    Composite.remove(g.engine.world, pest.body);
  }

  breakBlock(block) {
    const g = this.game;
    if (!g.blocks.includes(block)) return;
    g.blocks = g.blocks.filter((b) => b !== block);
    g.score += 5000;
    g.renderer.burst(block.position, '#c8955a');
    g.sound.crack();
    Composite.remove(g.engine.world, block);
  }
}
