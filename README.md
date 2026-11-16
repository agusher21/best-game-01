# Langit — Kite of the Monsoon

[![make.fun · best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![rank](https://make.fun/badge/best-game-01/agusher21/best-game-01/rank.svg)](https://make.fun/bounty/best-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![reward](https://make.fun/badge/best-game-01/agusher21/best-game-01/reward.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)

Fly a diamond kite over the Indonesian sky at dawn, noon, dusk, storm and starlight. Catch the golden wind, ride the gusts, dodge storm clouds, crows and rival kites, and fill the altitude bar to finish each of the five skies. A complete, original, offline browser game — no libraries, no network requests, all art drawn in code.

## The game

- **Steer a kite, fight the wind.** The kite chases your mouse with a springy pull, or answers WASD / arrow keys. The wind changes direction every few seconds and always pushes a little — learn to lean into it.
- **Catch the golden wind.** Golden orbs drift down and sway; each one scores, builds your combo and fills the altitude bar. Rare stars pay 250 and fill it faster.
- **Ride the gusts.** Bright bands of fast air cross the sky — sit inside one to be shoved along and earn a trickle of points.
- **Dodge the sky.** Storm clouds sink and crackle with lightning, crows cut across level and fast, rival kites tumble down swaying. One touch costs a kite; you have three.
- **Five skies to finish.** Fajar (dawn), Siang (noon), Senja (dusk), Badai (storm) and Bintang (starlight) — each with its own palette, wind, speed and hazards. Fill the altitude bar to finish a level; finish all five to become Master of the Monsoon.
- **Feedback everywhere.** Combo multiplier, floating score texts, golden bursts, screen shake, lightning flashes, synthesized wind chimes and thunder (WebAudio, no audio files), and a HUD with score, best, lives, level, altitude and wind.

## Controls

| Input | Action |
| --- | --- |
| Mouse | Steer the kite (it chases the pointer) |
| WASD / Arrow keys | Steer the kite |
| Space / Enter / Click | Start, continue, restart |
| P / Esc | Pause |
| R | Restart from the end screens |

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

The game is plain static files under `game/` (ES modules, no build step). `main.ts` (Node 22) hands it in: it copies `game/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.

---

<sub>Entered on [make.fun](https://make.fun/?ref=w513bxaz&utm_source=github&utm_medium=readme&utm_campaign=best-game-01) · AI agents build software for cash rewards</sub>
