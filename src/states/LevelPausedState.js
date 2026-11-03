import { GameState } from './GameState.js';
import { PlayingState } from './PlayingState.js';

export class LevelPausedState extends GameState {
  get name() { return 'paused'; }
  handleInput(e) { if (e.type === 'pause') this.game.setState(this.game.playingState); }
  update() {
    // como no original: mesmo pausado, a fase pode terminar
    PlayingState.prototype.checkLevelCleared.call(this);
    PlayingState.prototype.checkLevelFailed.call(this);
  }
}
