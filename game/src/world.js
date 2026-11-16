// Langit — Kite of the Monsoon: the simulation. One fixed step moves the
// kite, the wind, the orbs, the hazards and the gusts, and reports what
// happened as event bits so the loop can play sounds and change screens.
// Nothing here draws or listens: it only moves numbers.
import { FIELD, KITE, LEVELS, ORB, STAR, GUST, COMBO_WINDOW, COMBO_MAX, LIVES } from './config.js';

export const EVENT_COLLECT = 1;
export const EVENT_HIT = 2;
export const EVENT_LEVEL = 4;
export const EVENT_OVER = 8;
export const EVENT_WIN = 16;
export const EVENT_STAR = 32;

export function createWorld(random) {
  const state = {
    kite: { x: 640, y: 420, vx: 0, vy: 0, tilt: 0, invuln: 0 },
    wind: { strength: 20, target: 20, changeIn: 5 },
    orbs: [],
    hazards: [],
    gusts: [],
    particles: [],
    floaters: [],
    score: 0,
    combo: 0,
    comboTimer: 0,
    lives: LIVES,
    level: 0,
    altitude: 0,
    time: 0,
    shake: 0,
    flash: 0,
    flashX: 0,
    flashY: 0,
    ridingGust: false,
    orbIn: 0,
    hazardIn: 0,
    starIn: 0,
    gustIn: 0,
  };

  function level() {
    return LEVELS[state.level];
  }

  function burst(x, y, color, count, speed) {
    for (let i = 0; i < count; i += 1) {
      const a = random.range(0, Math.PI * 2);
      const s = random.range(speed * 0.3, speed);
      state.particles.push({
        x, y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - 30,
        life: random.range(0.4, 0.9),
        maxLife: 0.9,
        color,
        size: random.range(2, 5),
      });
    }
  }

  function floater(x, y, text, color) {
    state.floaters.push({ x, y, text, color: color ?? '#ffe9a8', life: 1.1 });
  }

  function spawnOrb(star) {
    state.orbs.push({
      x: random.range(70, FIELD.width - 70),
      y: -24,
      phase: random.range(0, Math.PI * 2),
      star,
      r: star ? STAR.radius : ORB.radius,
      fall: (star ? STAR.fall : ORB.fall) * random.range(0.85, 1.2),
    });
  }

  function spawnHazard() {
    const roll = random.next();
    const speedScale = level().hazardSpeed;
    if (roll < 0.42) {
      // A storm cloud sinks slowly from the sky, crackling.
      state.hazards.push({
        kind: 'cloud',
        x: random.range(90, FIELD.width - 90),
        y: -50,
        vx: random.range(-14, 14),
        vy: random.range(26, 40) * speedScale,
        r: 46,
        phase: random.range(0, Math.PI * 2),
      });
    } else if (roll < 0.72) {
      // A crow cuts across the sky, fast and level.
      const fromLeft = random.chance(0.5);
      state.hazards.push({
        kind: 'crow',
        x: fromLeft ? -40 : FIELD.width + 40,
        y: random.range(90, FIELD.height - 220),
        vx: (fromLeft ? 1 : -1) * random.range(170, 250) * speedScale,
        vy: 0,
        r: 20,
        phase: random.range(0, Math.PI * 2),
      });
    } else {
      // A rival kite tumbles down, swaying side to side.
      state.hazards.push({
        kind: 'rival',
        x: random.range(90, FIELD.width - 90),
        y: -40,
        vx: 0,
        vy: random.range(52, 74) * speedScale,
        r: 24,
        phase: random.range(0, Math.PI * 2),
        hue: random.pick(['#e14b4b', '#b04be1', '#e17a2e']),
      });
    }
  }

  function spawnGust() {
    const dir = random.chance(0.5) ? 1 : -1;
    state.gusts.push({
      x: random.range(160, FIELD.width - 160),
      width: GUST.width,
      dir,
      life: GUST.life,
      maxLife: GUST.life,
    });
  }

  function reset(levelIndex) {
    state.level = levelIndex;
    state.kite = { x: 640, y: 420, vx: 0, vy: 0, tilt: 0, invuln: 0 };
    state.wind = { strength: LEVELS[levelIndex].windBase, target: LEVELS[levelIndex].windBase, changeIn: 5 };
    state.orbs = [];
    state.hazards = [];
    state.gusts = [];
    state.particles = [];
    state.floaters = [];
    state.combo = 0;
    state.comboTimer = 0;
    state.altitude = 0;
    state.time = 0;
    state.shake = 0;
    state.flash = 0;
    state.ridingGust = false;
    state.orbIn = 0.4;
    state.hazardIn = 1.6;
    state.starIn = LEVELS[levelIndex].starEvery;
    state.gustIn = 3.5;
  }

  function collectOrb(orb, index) {
    state.orbs.splice(index, 1);
    state.combo = Math.min(state.combo + 1, COMBO_MAX);
    state.comboTimer = COMBO_WINDOW;
    const gain = orb.star ? STAR.score : ORB.score;
    const points = Math.round(gain * (1 + state.combo * 0.05));
    state.score += points;
    state.altitude += orb.star ? STAR.altitude : ORB.altitude * (20 / level().orbNeed);
    burst(orb.x, orb.y, orb.star ? '#fff3b0' : '#ffd166', orb.star ? 14 : 9, 130);
    floater(orb.x, orb.y - 18, `+${points}`, orb.star ? '#fff3b0' : '#ffe9a8');
    return orb.star ? EVENT_STAR : EVENT_COLLECT;
  }

  function hitHazard(hazard) {
    state.lives -= 1;
    state.combo = 0;
    state.comboTimer = 0;
    state.kite.invuln = KITE.invulnSeconds;
    state.shake = 0.45;
    burst(state.kite.x, state.kite.y, '#e14b4b', 14, 190);
    burst(state.kite.x, state.kite.y, '#3a3f4a', 8, 120);
    floater(state.kite.x, state.kite.y - 34, 'HIT!', '#ff8a7a');
    return state.lives <= 0 ? EVENT_HIT | EVENT_OVER : EVENT_HIT;
  }

  // Advance the world one fixed step. `steer` is a unit vector from the keys
  // (or null); `pointer` is the mouse target (or null). `attract` runs the
  // title-screen background: the kite drifts on its own and nothing can hurt
  // it. Returns the event bits for this step.
  function step(dt, steer, pointer, attract) {
    const lv = level();
    state.time += dt;
    let events = 0;

    // The wind wanders: a new target every few seconds, eased toward.
    state.wind.changeIn -= dt;
    if (state.wind.changeIn <= 0) {
      state.wind.changeIn = random.range(4, 7);
      state.wind.target = (random.chance(0.5) ? 1 : -1) * random.range(lv.windBase * 0.4, lv.windBase + lv.windSwing);
    }
    state.wind.strength += (state.wind.target - state.wind.strength) * Math.min(1, dt * 0.5);

    // The kite.
    const kite = state.kite;
    if (attract) {
      kite.x = 640 + Math.sin(state.time * 0.45) * 260;
      kite.y = 400 + Math.sin(state.time * 0.9) * 55;
      kite.vx = Math.cos(state.time * 0.45) * 120;
      kite.vy = Math.cos(state.time * 0.9) * 50;
    } else {
      if (steer) {
        kite.vx += steer.x * KITE.accel * dt;
        kite.vy += steer.y * KITE.accel * dt;
      } else if (pointer) {
        const dx = pointer.x - kite.x;
        const dy = pointer.y - kite.y;
        const wantX = Math.max(-KITE.maxSpeed, Math.min(KITE.maxSpeed, dx * KITE.pointerSpring * 0.28));
        const wantY = Math.max(-KITE.maxSpeed, Math.min(KITE.maxSpeed, dy * KITE.pointerSpring * 0.28));
        kite.vx += (wantX - kite.vx) * Math.min(1, dt * 9);
        kite.vy += (wantY - kite.vy) * Math.min(1, dt * 9);
      }
      // The wind always pushes a little, and the kite drags through the air.
      kite.vx += state.wind.strength * 0.55 * dt;
      kite.vy += Math.sin(state.time * 1.7) * 14 * dt;
      const damp = Math.exp(-KITE.drag * dt);
      kite.vx *= damp;
      kite.vy *= damp;
      const speed = Math.hypot(kite.vx, kite.vy);
      if (speed > KITE.maxSpeed) {
        kite.vx = (kite.vx / speed) * KITE.maxSpeed;
        kite.vy = (kite.vy / speed) * KITE.maxSpeed;
      }
      kite.x += kite.vx * dt;
      kite.y += kite.vy * dt;
      if (kite.x < 30) { kite.x = 30; kite.vx = Math.abs(kite.vx) * 0.4; }
      if (kite.x > FIELD.width - 30) { kite.x = FIELD.width - 30; kite.vx = -Math.abs(kite.vx) * 0.4; }
      if (kite.y < 46) { kite.y = 46; kite.vy = Math.abs(kite.vy) * 0.4; }
      if (kite.y > FIELD.height - 26) { kite.y = FIELD.height - 26; kite.vy = -Math.abs(kite.vy) * 0.4; }
      if (kite.invuln > 0) kite.invuln -= dt;
    }
    kite.tilt += (Math.max(-0.45, Math.min(0.45, kite.vx * 0.0011)) - kite.tilt) * Math.min(1, dt * 8);

    if (state.shake > 0) state.shake -= dt;
    if (state.flash > 0) state.flash -= dt;
    if (state.comboTimer > 0) {
      state.comboTimer -= dt;
      if (state.comboTimer <= 0) state.combo = 0;
    }

    // Spawning.
    state.orbIn -= dt;
    if (state.orbIn <= 0) {
      spawnOrb(false);
      state.orbIn = lv.orbEvery * random.range(0.85, 1.2);
    }
    state.starIn -= dt;
    if (state.starIn <= 0) {
      spawnOrb(true);
      state.starIn = lv.starEvery * random.range(0.9, 1.2);
    }
    if (!attract) {
      state.hazardIn -= dt;
      if (state.hazardIn <= 0 && state.hazards.length < 6) {
        spawnHazard();
        state.hazardIn = lv.hazardEvery * random.range(0.85, 1.25);
      }
    }
    state.gustIn -= dt;
    if (state.gustIn <= 0) {
      spawnGust();
      state.gustIn = GUST.every * random.range(0.85, 1.3);
    }

    // Orbs drift down and sway; the kite gathers them.
    for (let i = state.orbs.length - 1; i >= 0; i -= 1) {
      const orb = state.orbs[i];
      orb.y += orb.fall * dt;
      orb.x += Math.sin(state.time * 2 + orb.phase) * ORB.sway * dt;
      if (orb.y > FIELD.height + 30) {
        state.orbs.splice(i, 1);
        continue;
      }
      if (!attract && Math.hypot(orb.x - kite.x, orb.y - kite.y) < KITE.radius + orb.r) {
        events |= collectOrb(orb, i);
      }
    }

    // Hazards move; the kite must not touch them.
    state.ridingGust = false;
    for (let i = state.hazards.length - 1; i >= 0; i -= 1) {
      const h = state.hazards[i];
      if (h.kind === 'cloud') {
        h.y += h.vy * dt;
        h.x += h.vx * dt + Math.sin(state.time * 1.3 + h.phase) * 12 * dt;
        if (random.chance(dt * 0.12)) {
          state.flash = 0.16;
          state.flashX = h.x + random.range(-30, 30);
          state.flashY = h.y + 30;
        }
      } else if (h.kind === 'crow') {
        h.x += h.vx * dt;
        h.y += Math.sin(state.time * 6 + h.phase) * 26 * dt;
      } else {
        h.y += h.vy * dt;
        h.x += Math.sin(state.time * 2.2 + h.phase) * 60 * dt;
      }
      if (h.y > FIELD.height + 70 || h.x < -90 || h.x > FIELD.width + 90) {
        state.hazards.splice(i, 1);
        continue;
      }
      if (!attract && kite.invuln <= 0 && Math.hypot(h.x - kite.x, h.y - kite.y) < KITE.radius + h.r - 8) {
        events |= hitHazard(h);
        state.hazards.splice(i, 1);
      }
    }

    // Gusts: a band of fast air. Riding one pushes the kite and pays a trickle.
    for (let i = state.gusts.length - 1; i >= 0; i -= 1) {
      const g = state.gusts[i];
      g.life -= dt;
      if (g.life <= 0) {
        state.gusts.splice(i, 1);
        continue;
      }
      if (!attract && Math.abs(kite.x - g.x) < g.width / 2 && kite.y > 60 && kite.y < FIELD.height - 40) {
        kite.vx += g.dir * GUST.push * dt;
        state.ridingGust = true;
        state.score += 15 * dt;
      }
    }

    // Particles and floating score texts fade out.
    for (let i = state.particles.length - 1; i >= 0; i -= 1) {
      const p = state.particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 60 * dt;
      if (p.life <= 0) state.particles.splice(i, 1);
    }
    for (let i = state.floaters.length - 1; i >= 0; i -= 1) {
      const f = state.floaters[i];
      f.life -= dt;
      f.y -= 34 * dt;
      if (f.life <= 0) state.floaters.splice(i, 1);
    }

    // The level ends when the altitude bar fills.
    if (!attract && state.altitude >= 1 && !(events & EVENT_OVER)) {
      state.altitude = 1;
      const bonus = 500 + 100 * state.lives;
      state.score += bonus;
      events |= state.level >= LEVELS.length - 1 ? EVENT_WIN : EVENT_LEVEL;
    }
    return events;
  }

  reset(0);
  return { state, step, reset };
}
