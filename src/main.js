import { GameFacade } from './GameFacade.js';
import { UI } from './ui.js';

const canvas = document.getElementById('game');
const ui = new UI();
const game = new GameFacade(canvas, ui).start(0);
ui.bind(game);
window.__game = game; // facilita testes no console
