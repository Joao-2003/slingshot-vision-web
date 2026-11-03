// Pig.py no original. Aqui o alvo é uma praga da lavoura (arte própria).
import { Character } from './Character.js';

export class Pest extends Character {
  constructor(x, y, world, size) { super(x, y, world, size, 'pest'); }
}
