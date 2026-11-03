// Resources.py: carrega as imagens do jogo original (pasta assets/img).
// Se alguma imagem não carregar, o Renderer usa o desenho vetorial como reserva.
const FILES = ['background', 'sling', 'bird', 'pig', 'beam', 'column'];

export const images = {};

export function loadImages(base = 'assets/img/') {
  return Promise.all(FILES.map((name) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => { images[name] = img; resolve(); };
    img.onerror = () => resolve();
    img.src = `${base}${name}.png`;
  })));
}
