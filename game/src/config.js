// Langit — Kite of the Monsoon: every tunable number lives here, so the
// world, the renderer and the screenshot pilot all agree on one truth.
export const FIELD = { width: 1280, height: 720 };
export const STEP = 1 / 60;
export const BEST_KEY = 'langit-best-score';
export const LIVES = 3;

// The kite: a diamond with a tail, steered by spring toward the pointer or
// pushed by the keys, always fighting the wind a little.
export const KITE = {
  radius: 24,
  accel: 2600,
  pointerSpring: 14,
  maxSpeed: 430,
  drag: 2.4,
  invulnSeconds: 2.0,
};

// What a level asks of the player and how hard it pushes back.
export const LEVELS = [
  {
    name: 'Fajar — Dawn',
    sky: ['#2b3a67', '#e88a5a', '#f7c873'],
    sun: '#ffd98a',
    hills: ['#3d2f5e', '#2c2347'],
    terraces: ['#4a7a4f', '#3a6a44'],
    orbEvery: 0.95,
    orbNeed: 20,
    hazardEvery: 2.4,
    hazardSpeed: 1.0,
    windBase: 26,
    windSwing: 40,
    starEvery: 9,
    night: false,
  },
  {
    name: 'Siang — Noon',
    sky: ['#3f8fd2', '#9fd8ef', '#eaf7ff'],
    sun: '#fff3b0',
    hills: ['#5b7fa6', '#46648a'],
    terraces: ['#5da85f', '#4c9450'],
    orbEvery: 0.9,
    orbNeed: 22,
    hazardEvery: 2.1,
    hazardSpeed: 1.12,
    windBase: 34,
    windSwing: 52,
    starEvery: 9,
    night: false,
  },
  {
    name: 'Senja — Dusk',
    sky: ['#3a2350', '#c94f6d', '#ff9e57'],
    sun: '#ff7a4d',
    hills: ['#33204e', '#241739'],
    terraces: ['#6a4a6b', '#553a58'],
    orbEvery: 0.85,
    orbNeed: 24,
    hazardEvery: 1.8,
    hazardSpeed: 1.25,
    windBase: 44,
    windSwing: 64,
    starEvery: 8,
    night: false,
  },
  {
    name: 'Badai — Storm',
    sky: ['#232a3d', '#4a5568', '#8a7f8d'],
    sun: '#c8ccd4',
    hills: ['#2e3444', '#22262f'],
    terraces: ['#3f4a3a', '#33402f'],
    orbEvery: 0.8,
    orbNeed: 26,
    hazardEvery: 1.45,
    hazardSpeed: 1.45,
    windBase: 58,
    windSwing: 84,
    starEvery: 8,
    night: false,
  },
  {
    name: 'Bintang — Starlight',
    sky: ['#0b1030', '#1b2a5e', '#3b4a8a'],
    sun: '#f4f1de',
    hills: ['#1c2242', '#141830'],
    terraces: ['#2c4a4a', '#234040'],
    orbEvery: 0.75,
    orbNeed: 28,
    hazardEvery: 1.2,
    hazardSpeed: 1.6,
    windBase: 48,
    windSwing: 72,
    starEvery: 7,
    night: true,
  },
];

export const ORB = { radius: 14, fall: 34, sway: 46, score: 100, altitude: 1 / 20 };
export const STAR = { radius: 16, fall: 26, score: 250, altitude: 0.1 };
export const GUST = { width: 150, push: 150, life: 4.5, every: 7 };
export const COMBO_WINDOW = 3;
export const COMBO_MAX = 20;
