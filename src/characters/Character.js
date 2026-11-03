// Character.py: classe base dos personagens circulares (pássaro e alvo).
const { Bodies, Body, Composite } = Matter;

export class Character {
  constructor(x, y, world, size, kind) {
    if (new.target === Character) throw new Error('Character é abstrata');
    this.size = size;
    this.life = size.getLife();
    this.kind = kind;
    this.body = Bodies.circle(x, y, size.getRadius(), {
      restitution: 0.4, friction: 1, frictionAir: 0.002, density: 0.001, sleepThreshold: 90, label: kind,
    });
    Body.setMass(this.body, size.getMass());
    this.body.plugin.owner = this;
    Composite.add(world, this.body);
  }
  get radius() { return this.size.getRadius(); }
}
