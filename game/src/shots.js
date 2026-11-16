// The screenshot scenes behind ?shot=start|play|storm|end. Each one plays
// the real rules forward from a fresh world for a fixed number of steps,
// steered by a simple autopilot (chase the nearest golden wind, keep clear
// of anything dark), so the frame is what a short game really looks like
// and the same seed always gives the same frame.
import { FIELD, STEP } from './config.js';
import { EVENT_OVER, EVENT_LEVEL, EVENT_WIN } from './world.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './render.js';

const START_SECONDS = 6;
const PLAY_SECONDS = 24;
const STORM_SECONDS = 18;
const END_LIMIT_SECONDS = 300;
const SAMPLE = 1 / 30;

/** The nearest thing worth catching, or null when the sky is empty. */
function nearestOrb(state) {
  let best = null;
  let bestDist = Infinity;
  for (const orb of state.orbs) {
    const d = Math.hypot(orb.x - state.kite.x, orb.y - state.kite.y);
    if (d < bestDist) {
      bestDist = d;
      best = orb;
    }
  }
  return best;
}

/** True when a hazard is close enough to matter in the next moment. */
function dangerNear(state, x, y, radius) {
  for (const h of state.hazards) {
    if (Math.hypot(h.x - x, h.y - y) < h.r + radius + 26) return h;
  }
  return null;
}

/**
 * Steer toward `target` unless a hazard is in the way, in which case climb
 * away from it. `mode` is 'safe' (dodge), 'reckless' (ignore hazards) or
 * 'suicidal' (steer into the nearest hazard: the end scene's pilot is
 * over-eager, as a hurried player is, and the storm catches it).
 */
function autopilot(state, mode) {
  const kite = state.kite;
  if (mode === 'suicidal') {
    let threat = null;
    let threatDist = 320;
    for (const h of state.hazards) {
      const d = Math.hypot(h.x - kite.x, h.y - kite.y);
      if (d < threatDist) {
        threatDist = d;
        threat = h;
      }
    }
    if (threat) {
      const dx = threat.x - kite.x;
      const dy = threat.y - kite.y;
      const len = Math.hypot(dx, dy) || 1;
      return { x: dx / len, y: dy / len, mag: 1 };
    }
  }
  const orb = nearestOrb(state);
  let tx = orb ? orb.x : FIELD.width / 2;
  let ty = orb ? orb.y : 380;
  if (mode === 'safe') {
    const threat = dangerNear(state, kite.x, kite.y, 24);
    if (threat) {
      // Climb away from the threat, sideways if it is above us.
      ty = threat.y > kite.y ? kite.y - 190 : kite.y + 130;
      tx = kite.x + (kite.x < threat.x ? -170 : 170);
    }
  }
  const dx = tx - kite.x;
  const dy = ty - kite.y;
  const len = Math.hypot(dx, dy) || 1;
  // The pointer spring the live game uses, replayed by hand.
  return { x: dx / len, y: dy / len, mag: Math.min(1, len / 220) };
}

/**
 * Set `world` to the named scene and return the screen to draw over it.
 * `world` is the object { state, step, reset } from createWorld.
 */
export function stageShot(name, world) {
  const { state } = world;
  if (name !== 'play' && name !== 'storm' && name !== 'end') {
    world.reset(0);
    for (let i = 0; i < START_SECONDS / STEP; i += 1) world.step(STEP, null, null, true);
    return { screen: SCREEN_TITLE, best: 0 };
  }

  if (name === 'storm') {
    world.reset(3);
    for (let i = 0; i < STORM_SECONDS / STEP; i += 1) {
      const pilot = autopilot(state, 'safe');
      const events = world.step(STEP, pilot.mag > 0.08 ? pilot : null, null, false);
      if (events & (EVENT_OVER | EVENT_LEVEL | EVENT_WIN)) break;
    }
    return { screen: state.lives === 0 ? SCREEN_OVER : SCREEN_PLAY, best: state.score };
  }

  if (name === 'end') {
    world.reset(0);
    for (let i = 0; i < END_LIMIT_SECONDS / STEP; i += 1) {
      const pilot = autopilot(state, 'suicidal');
      const events = world.step(STEP, pilot.mag > 0.08 ? pilot : null, null, false);
      if (events & EVENT_OVER) break;
      if (events & (EVENT_LEVEL | EVENT_WIN)) {
        // An over-eager pilot that finishes a level starts the next one anyway.
        world.reset(Math.min(4, state.level + 1));
      }
    }
    return { screen: SCREEN_OVER, best: state.score };
  }

  world.reset(0);
  for (let i = 0; i < PLAY_SECONDS / STEP; i += 1) {
    const pilot = autopilot(state, 'safe');
    const events = world.step(STEP, pilot.mag > 0.08 ? pilot : null, null, false);
    if (events & (EVENT_OVER | EVENT_LEVEL | EVENT_WIN)) break;
  }
  const over = state.lives === 0;
  return { screen: over ? SCREEN_OVER : SCREEN_PLAY, best: state.score };
}
