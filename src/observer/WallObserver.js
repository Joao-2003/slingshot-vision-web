// WallObserver.py: tecla W liga e desliga a parede da direita.
import { Observer } from './Subject.js';

export class WallObserver extends Observer {
  constructor(game) { super(); this.game = game; }
  update(event) { if (event.type === 'toggle-wall') this.toggleWall(); }
  toggleWall() {
    const g = this.game;
    if (g.wallOn) g.space.removeShape(g.wall); else g.space.addShape(g.wall);
    g.wallOn = !g.wallOn;
    g.ui.setToggle('wall', g.wallOn);
  }
}
