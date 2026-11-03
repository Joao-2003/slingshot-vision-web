// Bird.py: o pássaro nasce no estilingue já com o impulso do lançamento.
import { Character } from './Character.js';

export const LAUNCH_POWER = 53; // mesmo fator do original: impulso = distância × 53

export class Bird extends Character {
  // x, y e angle chegam em coordenadas da tela, como no Pygame
  constructor(distance, angle, x, y, space, size) {
    super(x, 600 - y, space, size, 'bird');
    // apply_impulse_at_local_point(power * Vec2d(1, 0).rotated(-angle)): impulso / massa = velocidade
    const speed = (distance * LAUNCH_POWER) / size.getMass();
    this.cpBody.setVel(cp.v(speed * Math.cos(angle), -speed * Math.sin(angle)));
    this.path = [];
  }
}
