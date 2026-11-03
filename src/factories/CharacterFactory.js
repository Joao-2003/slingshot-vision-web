// Abstract Factory (AbstractFactory.py, BirdFactory.py, PigFactory.py no original).
import { Bird } from '../characters/Bird.js';
import { Pest } from '../characters/Pest.js';

export class CharacterFactory {
  createCharacter() { throw new Error('abstrato'); }
}
export class BirdFactory extends CharacterFactory {
  createCharacter(distance, angle, x, y, world, size) { return new Bird(distance, angle, x, y, world, size); }
}
export class PestFactory extends CharacterFactory {
  createCharacter(x, y, world, size) { return new Pest(x, y, world, size); }
}
