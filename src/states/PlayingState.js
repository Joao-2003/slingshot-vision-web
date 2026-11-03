import { GameState } from './GameState.js';

export class PlayingState extends GameState {
  get name() { return 'playing'; }
  handleInput(e) { if (e.type === 'pause') this.game.setState(this.game.pausedState); }
  update() {
    const g = this.game;
    const input = g.input;
    if (input.pressed && g.level.birdsLeft > 0) {
      if (!g.pulling) g.sound.stretch();
      g.pulling = true;
      g.aim = input.position;
    }
    if (!input.pressed && g.pulling) {
      g.pulling = false;
      if (g.level.birdsLeft > 0) g.launch();
    }
    this.checkLevelCleared();
    this.checkLevelFailed();
  }
  checkLevelCleared() {
    const g = this.game;
    if (g.level.birdsLeft >= 0 && g.pests.length === 0) {
      if (g.bonusOnce) g.score += Math.max(0, g.level.birdsLeft - 1) * 10000;
      g.bonusOnce = false;
      g.setState(g.clearedState);
    }
  }
  checkLevelFailed() {
    const g = this.game;
    if (g.level.birdsLeft <= 0 && g.pests.length > 0 && performance.now() - g.lastLaunch > 6000) {
      g.setState(g.failedState);
    }
  }
}
