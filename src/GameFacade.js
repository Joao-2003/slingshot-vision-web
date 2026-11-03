// Facade (GameFacade.py): esconde a montagem do jogo e dos observadores atrás de start().
import { Game } from './Game.js';
import { GravityObserver } from './observer/GravityObserver.js';
import { WallObserver } from './observer/WallObserver.js';

export class GameFacade {
  constructor(canvas, ui) {
    this.game = new Game(canvas, ui);
    this.game.subject.addObserver(new WallObserver(this.game));
    this.game.subject.addObserver(new GravityObserver(this.game));
  }
  start(level = 0) {
    this.game.loadLevel(level);
    const loop = () => { this.game.step(); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
    return this.game;
  }
}
