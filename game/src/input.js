// Keyboard + pointer input, in one place. The kite answers the mouse (it
// chases the pointer with a spring) and the arrow keys / WASD (they push it);
// Space, Enter or a click confirms, P or Escape pauses.
export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;

export function createInput(canvas) {
  const keys = new Set();
  const pointer = { x: 640, y: 420, active: false, down: false };
  let actions = 0;

  function canvasPoint(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 1280,
      y: ((clientY - rect.top) / rect.height) * 720,
    };
  }

  window.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) event.preventDefault();
    if (event.repeat) return;
    keys.add(event.key.toLowerCase());
    if (event.key === ' ' || event.key === 'Enter') actions |= ACTION_CONFIRM;
    if (event.key === 'p' || event.key === 'P' || event.key === 'Escape') actions |= ACTION_PAUSE;
  });
  window.addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase()));
  window.addEventListener('blur', () => keys.clear());

  canvas.addEventListener('pointermove', (event) => {
    const p = canvasPoint(event.clientX, event.clientY);
    pointer.x = p.x;
    pointer.y = p.y;
    pointer.active = true;
  });
  canvas.addEventListener('pointerdown', (event) => {
    const p = canvasPoint(event.clientX, event.clientY);
    pointer.x = p.x;
    pointer.y = p.y;
    pointer.active = true;
    pointer.down = true;
    actions |= ACTION_CONFIRM;
  });
  canvas.addEventListener('pointerup', () => {
    pointer.down = false;
  });

  // A unit steering vector from the keys, or null when no key is held.
  function keySteer() {
    let x = 0;
    let y = 0;
    if (keys.has('arrowleft') || keys.has('a')) x -= 1;
    if (keys.has('arrowright') || keys.has('d')) x += 1;
    if (keys.has('arrowup') || keys.has('w')) y -= 1;
    if (keys.has('arrowdown') || keys.has('s')) y += 1;
    if (x === 0 && y === 0) return null;
    const len = Math.hypot(x, y);
    return { x: x / len, y: y / len };
  }

  return {
    pointer,
    keySteer,
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
  };
}
