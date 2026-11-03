// Physics.py: colisões e regras de dano, com os mesmos tratadores e limiares do original.
// O motor é o Chipmunk2D (porte em JavaScript), o mesmo que o Pymunk usa por baixo; por isso
// massa, momento, elasticidade e atrito se combinam e se comportam como no jogo em Python.
import { COLLISION } from './characters/Character.js';

export const toScreen = (v) => ({ x: v.x, y: 600 - v.y }); // Physics.to_pygame()

export class Physics {
  constructor(game) {
    this.game = game;
    const s = game.space, C = COLLISION, post = (fn) => (arb) => { fn.call(this, arb); return true; };
    s.addCollisionHandler(C.bird, C.pest, null, null, post(this.postSolveBirdPig), null);
    s.addCollisionHandler(C.bird, C.wood, null, null, post(this.postSolveBirdWood), null);
    s.addCollisionHandler(C.pest, C.wood, null, null, post(this.postSolvePigWood), null);
  }

  // arbiter.total_impulse do Pymunk (inclui atrito)
  static impulse(arb) { const v = arb.totalImpulseWithFriction(); return Math.hypot(v.x, v.y); }
  static shapes(arb) { return arb.getShapes(); } // na ordem dos tipos registrados, como arbiter.shapes

  postSolveBirdPig(arb) {
    if (!this.game.damageOn) return;
    const [, pigShape] = Physics.shapes(arb);
    this.killPest(pigShape.owner);
  }

  postSolveBirdWood(arb) {
    if (!this.game.damageOn || Physics.impulse(arb) <= 1100) return;
    const [, woodShape] = Physics.shapes(arb);
    this.breakBlock(woodShape.owner);
  }

  postSolvePigWood(arb) {
    if (!this.game.damageOn || Physics.impulse(arb) <= 700) return;
    const g = this.game, [pigShape] = Physics.shapes(arb), pest = pigShape.owner;
    if (!g.pests.includes(pest)) return;
    pest.life -= 20; g.score += 10000;
    if (pest.life <= 0) this.killPest(pest, false);
    else g.renderer.hit(pest.position);
  }

  // o Chipmunk não deixa remover corpos no meio do passo: a remoção vai para o fim dele
  later(fn) { const s = this.game.space; if (s.locked) s.addPostStepCallback(fn); else fn(); }

  killPest(pest, addScore = true) {
    const g = this.game;
    if (!pest || !g.pests.includes(pest)) return;
    g.pests = g.pests.filter((p) => p !== pest);
    if (addScore) g.score += 10000;
    g.renderer.burst(pest.position, '#8bc34a');
    g.sound.hit();
    this.later(() => pest.remove(g.space));
  }

  breakBlock(block) {
    const g = this.game;
    if (!block || !g.blocks.includes(block)) return;
    g.blocks = g.blocks.filter((b) => b !== block);
    g.score += 5000;
    g.renderer.burst(block.position, '#c8955a');
    g.sound.crack();
    this.later(() => block.remove(g.space));
  }
}
