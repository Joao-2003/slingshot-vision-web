import { GameState } from './GameState.js';

export class LevelClearedState extends GameState {
  get name() { return 'cleared'; }
  handleInput(e) {
    if (e.type === 'next') this.game.loadLevel(this.game.level.number + 1);
    if (e.type === 'replay') this.game.loadLevel(this.game.level.number);
  }
}
