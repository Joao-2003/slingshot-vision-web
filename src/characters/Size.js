// Strategy de tamanho (Size.py, SmallSize.py, NormalSize.py, BigSize.py no original).
// Cada estratégia define massa, raio e vida de um personagem.
export class Size {
  getMass() { throw new Error('abstrato'); }
  getRadius() { throw new Error('abstrato'); }
  getLife() { throw new Error('abstrato'); }
}
export class SmallSize extends Size { getMass() { return 4; } getRadius() { return 8; } getLife() { return 20; } }
export class NormalSize extends Size { getMass() { return 5; } getRadius() { return 14; } getLife() { return 25; } }
export class BigSize extends Size { getMass() { return 6; } getRadius() { return 24; } getLife() { return 30; } }

export const SIZES = { small: new SmallSize(), normal: new NormalSize(), big: new BigSize() };
export const randomSize = () => Object.values(SIZES)[Math.floor(Math.random() * 3)];
