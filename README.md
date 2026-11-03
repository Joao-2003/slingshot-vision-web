# Slingshot Vision

🇧🇷 Português | [🇺🇸 English](README.en.md)

Jogo de estilingue que roda direto no navegador e pode ser controlado **pela mão, pela webcam**. É a versão web do meu jogo em Python com visão computacional ([Angry_Birds_Computer_Vision_Python](https://github.com/Joao-2003/Angry_Birds_Computer_Vision_Python)), reescrita em JavaScript com os mesmos sprites, trilha e efeitos sonoros do original.

**▶ Jogar:** https://joao-2003.github.io/slingshot-vision-web/

![Jogo em andamento](docs/gameplay.png)

## Como jogar

| Controle | Como |
|---|---|
| Mão (webcam) | Clique em **📷 Câmera**, junte polegar e indicador para agarrar o estilingue, mova a mão para mirar e afaste os dedos para lançar |
| Mouse ou toque | Segure perto do estilingue, puxe e solte |
| Teclado | `P` pausa, `R` recomeça, `S` gravidade baixa, `W` parede à direita, `C` câmera |

Derrube os porcos com o menor número de pássaros: cada porco vale 10.000 pontos, cada peça de madeira quebrada 5.000 e cada pássaro que sobra dá bônus. As fases 1 a 14 são as mesmas do jogo original; da 15ª em diante, cada fase é gerada combinando duas fases base com tamanhos de personagens sorteados.

## Da versão em Python para a web

| Python (original) | Web |
|---|---|
| Pygame | Canvas 2D |
| Pymunk (Chipmunk2D) | [Chipmunk2D em JavaScript](https://github.com/josephg/Chipmunk-js), o mesmo motor |
| OpenCV + MediaPipe Hands | [MediaPipe Tasks Vision](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker) (HandLandmarker, roda no navegador via WebAssembly) |
| Sprites e sons em `resources/` | Os mesmos arquivos em `assets/` (fundo, estilingue, pássaro, porco, madeira, estrelas, trilha e efeitos); se algum não carregar, o jogo usa desenho vetorial e Web Audio como reserva |

### Mesma física do original
O Pymunk é um binding de Python para o Chipmunk2D, então a versão web usa o porte do próprio Chipmunk2D para JavaScript, e não um motor diferente:
- Mesmas massas, momentos de inércia (1000 nas peças de madeira), gravidade (700 px/s²), elasticidade (0,95), atrito, impulso de lançamento (distância × 53) e limiares de dano (1100 e 700, pelo `total_impulse` do contato).
- Mesmo passo fixo de 0,01 s do `update_physics()`; o quique e a rolagem do pássaro no chão saem iguais aos do Pymunk.
- Cada fase começa no estado em que o Pymunk deixa as peças do `Level.py` depois de assentar (`tools/export_levels.py`), porque o porte em JavaScript (Chipmunk 6.1) separa as peças sobrepostas de forma mais brusca que o Chipmunk 7 usado pelo Pymunk. Pelo mesmo motivo, o solver usa 20 iterações em vez de 10.

A detecção de pinça segue a lógica do `Vision.py`: a distância entre as pontas do polegar e do indicador, medida em relação ao tamanho da mão, precisa ficar abaixo de um limite por pelo menos 200 ms. A imagem da câmera é processada no próprio navegador e não sai do computador.

## Padrões de projeto

A mesma arquitetura do projeto original, que foi tema do meu TCC em Engenharia de Software:

| Padrão | Onde |
|---|---|
| **State** | `src/states/`: jogando, pausado, fase concluída e fase perdida |
| **Observer** | `src/observer/`: `Subject` repassa eventos para `GravityObserver` e `WallObserver` |
| **Abstract Factory** | `src/factories/CharacterFactory.js`: `BirdFactory` e `PestFactory` |
| **Strategy** | `src/characters/Size.js`: `SmallSize`, `NormalSize` e `BigSize` definem massa, raio e vida |
| **Facade** | `src/GameFacade.js`: monta o jogo e registra os observadores atrás de `start()` |

## Executar localmente

Os módulos JavaScript precisam de um servidor HTTP (e a câmera exige `localhost` ou HTTPS):

```bash
python -m http.server 8000
# abra http://localhost:8000
```

## Tecnologias

JavaScript (ES modules) · Canvas 2D · Chipmunk2D · MediaPipe Tasks Vision · Web Audio API · GitHub Pages

## Créditos

Projeto de fã, acadêmico e sem fins comerciais, inspirado no Angry Birds. Personagens, trilha e marca pertencem à Rovio Entertainment; parte dos sprites vem de sprite sheets de fãs (chinzapep e jared33, DeviantArt). O código é meu.

## Autor

João Victor Guidi de Lima · [LinkedIn](https://www.linkedin.com/in/joão-lima-8b512) · [GitHub](https://github.com/Joao-2003)
