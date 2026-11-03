// WallObserver.py: tecla W liga e desliga a parede da direita.
import { Observer } from './Subject.js';
const { Composite } = Matter;

export class WallObserver extends Observer {
  constructor(game) { super(); this.game = game; }
  update(event) { if (event.type === 'toggle-wall') this.toggleWall(); }
  toggleWall() {
    const g = this.game;
    if (g.wallOn) Composite.remove(g.engine.world, g.wall); else Composite.add(g.engine.world, g.wall);
    g.wallOn = !g.wallOn;
    g.ui.setToggle('wall', g.wallOn);
  }
}
