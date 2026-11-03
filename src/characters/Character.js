// Character.py: classe base dos personagens circulares (pássaro e porco).
// Mesmo motor do original: Chipmunk2D (o Pymunk é um binding de Python para ele).
import { toScreen } from '../Physics.js';

export const COLLISION = { bird: 0, pest: 1, wood: 2, ground: 3 };

export class Character {
  constructor(x, y, space, size, kind) {
    if (new.target === Character) throw new Error('Character é abstrata');
    this.size = size;
    this.life = size.getLife();
    this.kind = kind;
    const m = size.getMass(), r = size.getRadius();
    // x e y em coordenadas do Pymunk (y para cima, chão em y = 60)
    this.cpBody = space.addBody(new cp.Body(m, cp.momentForCircle(m, 0, r, cp.v(0, 0))));
    this.cpBody.setPos(cp.v(x, y));
    this.shape = space.addShape(new cp.CircleShape(this.cpBody, r, cp.v(0, 0)));
    this.shape.setElasticity(0.95);
    this.shape.setFriction(1);
    this.shape.setCollisionType(COLLISION[kind]);
    this.shape.owner = this;
  }
  get radius() { return this.size.getRadius(); }
  get position() { return toScreen(this.cpBody.p); }   // coordenadas da tela
  get angle() { return -this.cpBody.a; }
  get speed() { return Math.hypot(this.cpBody.vx, this.cpBody.vy); } // px/s
  remove(space) {
    if (this.shape.space) space.removeShape(this.shape);
    if (this.cpBody.space) space.removeBody(this.cpBody);
  }
}
