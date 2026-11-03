// Bird.py: o pássaro nasce no estilingue já com o impulso do lançamento.
import { Character } from './Character.js';
const { Body } = Matter;

export const LAUNCH_POWER = 53; // mesmo fator do original: impulso = distância × 53

export class Bird extends Character {
  constructor(distance, angle, x, y, world, size) {
    super(x, y, world, size, 'bird');
    // impulso / massa = velocidade em px/s; o Matter.js usa px por passo (1/60 s)
    const speed = (distance * LAUNCH_POWER) / size.getMass() / 60;
    Body.setVelocity(this.body, { x: speed * Math.cos(angle), y: speed * Math.sin(angle) });
    this.path = [];
  }
}
