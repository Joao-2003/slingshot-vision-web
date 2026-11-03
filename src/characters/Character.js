// Character.py: classe base dos personagens circulares (pássaro e alvo).
const { Bodies, Body, Composite } = Matter;

export class Character {
  constructor(x, y, world, size, kind) {
    if (new.target === Character) throw new Error('Character é abstrata');
    this.size = size;
    this.life = size.getLife();
    this.kind = kind;
    // Character.py: elasticidade 0,95, atrito 1, massa do tamanho e momento de inércia de um disco
    const r = size.getRadius(), m = size.getMass();
    this.body = Bodies.circle(x, y, r, { restitution: 0.95, friction: 1, frictionAir: 0, label: kind });
    Body.setMass(this.body, m);
    Body.setInertia(this.body, (m * r * r) / 2); // pm.moment_for_circle(mass, 0, radius)
    this.body.plugin.owner = this;
    Composite.add(world, this.body);
  }
  get radius() { return this.size.getRadius(); }
}
