// GravityObserver.py: tecla S alterna entre gravidade normal e quase zero.
import { Observer } from './Subject.js';

export const GRAVITY_NORMAL = 0.0007;  // 700 px/s², como no Pymunk
export const GRAVITY_LOW = 0.00001;    // 10 px/s²

export class GravityObserver extends Observer {
  constructor(game) { super(); this.game = game; }
  update(event) { if (event.type === 'toggle-gravity') this.toggleGravity(); }
  toggleGravity() {
    this.game.lowGravity = !this.game.lowGravity;
    this.game.engine.gravity.scale = this.game.lowGravity ? GRAVITY_LOW : GRAVITY_NORMAL;
    this.game.ui.setToggle('gravity', this.game.lowGravity);
  }
}
