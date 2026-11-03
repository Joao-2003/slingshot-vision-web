"""Gera src/levels_settled.js simulando as 14 fases do jogo em Python no Pymunk.

Uso (pymunk==6.0.0 e pygame instalados):
    python tools/export_levels.py ../Angry_Birds_Computer_Vision_Python/src src/levels_settled.js
"""
import os, sys, math, json, types
os.environ['SDL_VIDEODRIVER'] = 'dummy'; os.environ['SDL_AUDIODRIVER'] = 'dummy'
SRC = os.path.abspath(sys.argv[1]); OUT = os.path.abspath(sys.argv[2])
sys.path.insert(0, SRC); os.chdir(SRC)
import pygame, pymunk as pm
pygame.init(); pygame.display.set_mode((10, 10))
sys.modules['Vision'] = types.ModuleType('Vision')
from Level import Level
from BigSize import BigSize
class G: bool_space = False
levels = []
for n in range(14):
    g = G(); space = pm.Space(); space.gravity = (0, -700)
    sb = pm.Body(body_type=pm.Body.STATIC); ln = pm.Segment(sb, (0, 60), (1200, 60), 0); ln.elasticity = .95; ln.friction = 1
    space.add(sb, ln)
    pigs, cols, beams, birds = [], [], [], []
    L = Level(g, pigs, cols, beams, space, birds, BigSize()); L.load_level(n)
    for i in range(90): [space.step(0.01) for _ in range(2)]
    r = lambda v: round(v, 2)
    levels.append({
        'columns': [[r(p.body.position.x), r(p.body.position.y), round(p.body.angle, 4)] for p in cols],
        'beams': [[r(p.body.position.x), r(p.body.position.y), round(p.body.angle, 4)] for p in beams],
        'targets': [[r(q.body.position.x), r(q.body.position.y)] for q in pigs],
    })
with open(OUT, 'w') as f:
    f.write('// Posições das peças depois de 90 quadros (1,8 s) de simulação no Pymunk 6.0.0,\n')
    f.write('// geradas a partir do Level.py original. Assim cada fase começa exatamente como no jogo em Python.\n')
    f.write('// [x, y, ângulo] em coordenadas do Pymunk (y para cima).\n')
    f.write('export const SETTLED = ' + json.dumps(levels, separators=(',', ':')).replace('},{', '},\n{') + ';\n')
print('ok', sum(len(l['columns'])+len(l['beams']) for l in levels))
