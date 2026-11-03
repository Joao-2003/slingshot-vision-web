import { GameState } from './GameState.js';

export class LevelFailedState extends GameState {
  get name() { return 'failed'; }
  handleInput(e) { if (e.type === 'replay') this.game.loadLevel(this.game.level.number); }
}
