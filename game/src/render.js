// Langit — Kite of the Monsoon: everything the player sees. The sky, the
// volcano and the rice terraces are all drawn from the level's palette, so
// each of the five levels looks like a different time of day over Java.
import { FIELD, KITE, LEVELS, LIVES } from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_LEVEL = 'level';
export const SCREEN_OVER = 'over';
export const SCREEN_WIN = 'win';

const FONT = '"Trebuchet MS", "Segoe UI", sans-serif';

export function createRenderer(canvas) {
  canvas.width = FIELD.width;
  canvas.height = FIELD.height;
  const ctx = canvas.getContext('2d');

  // The background clouds: fixed seeds, drifting with time, so the sky
  // never looks the same twice but never needs an image.
  const skyClouds = [];
  for (let i = 0; i < 9; i += 1) {
    skyClouds.push({
      seed: i * 137.5,
      y: 40 + ((i * 67) % 210),
      scale: 0.6 + ((i * 37) % 10) / 14,
      speed: 6 + ((i * 13) % 12),
    });
  }

  function sky(state) {
    const lv = LEVELS[state.level];
    const g = ctx.createLinearGradient(0, 0, 0, FIELD.height);
    g.addColorStop(0, lv.sky[0]);
    g.addColorStop(0.55, lv.sky[1]);
    g.addColorStop(1, lv.sky[2]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);

    // The sun (or the moon, on the starlight level) with a soft glow.
    const sunX = 1020;
    const sunY = lv.night ? 130 : 150 - Math.sin(state.time * 0.02) * 8;
    const glow = ctx.createRadialGradient(sunX, sunY, 8, sunX, sunY, 150);
    glow.addColorStop(0, lv.sun);
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(sunX - 150, sunY - 150, 300, 300);
    ctx.fillStyle = lv.sun;
    ctx.beginPath();
    ctx.arc(sunX, sunY, lv.night ? 34 : 46, 0, Math.PI * 2);
    ctx.fill();
    if (lv.night) {
      ctx.fillStyle = lv.sky[0];
      ctx.beginPath();
      ctx.arc(sunX + 16, sunY - 8, 30, 0, Math.PI * 2);
      ctx.fill();
      // Stars.
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      for (let i = 0; i < 70; i += 1) {
        const x = (i * 173.3) % FIELD.width;
        const y = (i * 97.7) % 300;
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(state.time * 1.4 + i));
        ctx.globalAlpha = tw;
        ctx.fillRect(x, y, 2.4, 2.4);
      }
      ctx.globalAlpha = 1;
    }

    // Drifting clouds.
    for (const c of skyClouds) {
      const x = ((c.seed + state.time * c.speed) % (FIELD.width + 320)) - 160;
      ctx.fillStyle = lv.night ? 'rgba(210,220,255,0.16)' : 'rgba(255,255,255,0.28)';
      ctx.beginPath();
      ctx.ellipse(x, c.y, 62 * c.scale, 20 * c.scale, 0, 0, Math.PI * 2);
      ctx.ellipse(x + 40 * c.scale, c.y + 8 * c.scale, 44 * c.scale, 16 * c.scale, 0, 0, Math.PI * 2);
      ctx.ellipse(x - 42 * c.scale, c.y + 10 * c.scale, 40 * c.scale, 14 * c.scale, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function landscape(state) {
    const lv = LEVELS[state.level];
    // The volcano, far away, breathing a little smoke.
    ctx.fillStyle = lv.hills[0];
    ctx.beginPath();
    ctx.moveTo(880, 560);
    ctx.lineTo(1030, 330);
    ctx.lineTo(1180, 560);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.beginPath();
    ctx.moveTo(1008, 368);
    ctx.lineTo(1030, 330);
    ctx.lineTo(1054, 370);
    ctx.lineTo(1038, 378);
    ctx.lineTo(1030, 368);
    ctx.lineTo(1022, 380);
    ctx.closePath();
    ctx.fill();
    const smokeY = 320 - (state.time % 6) * 9;
    ctx.fillStyle = `rgba(255,255,255,${0.35 - ((state.time % 6) / 6) * 0.3})`;
    ctx.beginPath();
    ctx.arc(1030 + Math.sin(state.time * 0.7) * 8, smokeY, 14 + (state.time % 6) * 2, 0, Math.PI * 2);
    ctx.fill();

    // Two rolling hill ridges.
    for (let ridge = 0; ridge < 2; ridge += 1) {
      ctx.fillStyle = lv.hills[ridge];
      ctx.beginPath();
      ctx.moveTo(0, 560 + ridge * 30);
      for (let x = 0; x <= FIELD.width; x += 40) {
        const y = 545 + ridge * 30 + Math.sin(x * 0.006 + ridge * 2.1) * 26 + Math.sin(x * 0.017 + ridge) * 10;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(FIELD.width, FIELD.height);
      ctx.lineTo(0, FIELD.height);
      ctx.closePath();
      ctx.fill();
    }

    // Rice terraces: flooded bands catching the sky.
    for (let i = 0; i < 4; i += 1) {
      const y = 612 + i * 28;
      ctx.fillStyle = lv.terraces[i % 2];
      ctx.fillRect(0, y, FIELD.width, 26);
      ctx.fillStyle = 'rgba(255,255,255,0.16)';
      ctx.fillRect(0, y, FIELD.width, 3);
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(0, y + 22, FIELD.width, 4);
    }

    // Palm silhouettes at the edges.
    drawPalm(48, 700, 1.1, lv.hills[1]);
    drawPalm(1240, 706, -1.2, lv.hills[1]);
    drawPalm(120, 712, 0.85, lv.hills[1]);
  }

  function drawPalm(x, y, lean, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(lean * 0.12);
    ctx.strokeStyle = color;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(10 * lean, -70, 26 * lean, -104);
    ctx.stroke();
    ctx.fillStyle = color;
    for (let i = 0; i < 6; i += 1) {
      const a = -Math.PI * (0.08 + i * 0.15);
      ctx.beginPath();
      ctx.ellipse(26 * lean + Math.cos(a) * 34, -104 + Math.sin(a) * 20, 36, 7, a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawGusts(state) {
    for (const g of state.gusts) {
      const alpha = Math.min(1, g.life / 1.2) * 0.07;
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fillRect(g.x - g.width / 2, 0, g.width, 560);
      ctx.strokeStyle = `rgba(255,255,255,${alpha + 0.16})`;
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i += 1) {
        const y = ((state.time * 260 + i * 150) % (FIELD.height + 120)) - 60;
        ctx.beginPath();
        ctx.moveTo(g.x - g.width / 2 + 14, y);
        ctx.lineTo(g.x + g.width / 2 - 14, y + g.dir * 26);
        ctx.stroke();
      }
    }
  }

  function drawOrbs(state) {
    for (const orb of state.orbs) {
      const pulse = 1 + Math.sin(state.time * 5 + orb.phase) * 0.12;
      if (orb.star) {
        ctx.save();
        ctx.translate(orb.x, orb.y);
        ctx.rotate(Math.sin(state.time * 2 + orb.phase) * 0.3);
        ctx.fillStyle = '#fff3b0';
        ctx.shadowColor = '#ffdf6b';
        ctx.shadowBlur = 22;
        starPath(0, 0, 5, orb.r * pulse, orb.r * 0.45 * pulse);
        ctx.fill();
        ctx.restore();
      } else {
        const glow = ctx.createRadialGradient(orb.x, orb.y, 2, orb.x, orb.y, orb.r * 2.1);
        glow.addColorStop(0, 'rgba(255,209,102,0.85)');
        glow.addColorStop(1, 'rgba(255,209,102,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r * 2.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffd166';
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff3d6';
        ctx.beginPath();
        ctx.arc(orb.x - 4, orb.y - 4, orb.r * 0.38, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function starPath(x, y, points, outer, inner) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i += 1) {
      const r = i % 2 === 0 ? outer : inner;
      const a = (i * Math.PI) / points - Math.PI / 2;
      const px = x + Math.cos(a) * r;
      const py = y + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  function drawHazards(state) {
    for (const h of state.hazards) {
      if (h.kind === 'cloud') {
        ctx.fillStyle = 'rgba(30,32,44,0.92)';
        ctx.beginPath();
        ctx.ellipse(h.x, h.y, 52, 26, 0, 0, Math.PI * 2);
        ctx.ellipse(h.x - 34, h.y + 10, 34, 20, 0, 0, Math.PI * 2);
        ctx.ellipse(h.x + 36, h.y + 10, 36, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffd94d';
        ctx.beginPath();
        ctx.arc(h.x - 18, h.y + 2, 3, 0, Math.PI * 2);
        ctx.arc(h.x + 14, h.y - 4, 3, 0, Math.PI * 2);
        ctx.fill();
        if (state.flash > 0 && Math.abs(state.flashX - h.x) < 80) {
          ctx.strokeStyle = '#ffe95e';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(state.flashX, state.flashY - 10);
          ctx.lineTo(state.flashX - 8, state.flashY + 22);
          ctx.lineTo(state.flashX + 4, state.flashY + 22);
          ctx.lineTo(state.flashX - 4, state.flashY + 52);
          ctx.stroke();
        }
      } else if (h.kind === 'crow') {
        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.scale(h.vx < 0 ? -1 : 1, 1);
        const flap = Math.sin(state.time * 9 + h.phase) * 0.55;
        ctx.fillStyle = '#1d1f26';
        ctx.beginPath();
        ctx.ellipse(0, 0, 22, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(14, -2);
        ctx.lineTo(30, -6);
        ctx.lineTo(14, 4);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-4, -4);
        ctx.quadraticCurveTo(-16, -22 - flap * 22, -30, -14 - flap * 18);
        ctx.quadraticCurveTo(-14, -8, -4, 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else {
        drawMiniKite(h.x, h.y, Math.sin(state.time * 3 + h.phase) * 0.2, h.hue, 0.8);
      }
    }
  }

  function drawMiniKite(x, y, tilt, color, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt);
    ctx.scale(scale, scale);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -26);
    ctx.lineTo(20, 0);
    ctx.lineTo(0, 26);
    ctx.lineTo(-20, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.moveTo(0, -26);
    ctx.lineTo(20, 0);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(40,20,20,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -26);
    ctx.lineTo(0, 26);
    ctx.moveTo(-20, 0);
    ctx.lineTo(20, 0);
    ctx.stroke();
    ctx.restore();
  }

  function drawKite(state) {
    const kite = state.kite;
    // The string: from the kite down to the hand at the bottom of the sky.
    ctx.strokeStyle = 'rgba(255,250,235,0.75)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(kite.x, kite.y + 24);
    const sag = 60 + state.wind.strength * 0.4;
    ctx.quadraticCurveTo(kite.x - state.wind.strength * 0.7, kite.y + (FIELD.height - kite.y) * 0.55 + sag * 0.3, 640, FIELD.height - 4);
    ctx.stroke();
    // The tail: a curved line with three bows.
    ctx.strokeStyle = 'rgba(255,240,200,0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(kite.x, kite.y + 26);
    const tx = kite.x - kite.vx * 0.06 - state.wind.strength * 0.2;
    const ty = kite.y + 96;
    ctx.quadraticCurveTo(kite.x - 14, kite.y + 60, tx, ty);
    ctx.stroke();
    for (let i = 1; i <= 3; i += 1) {
      const t = i / 4;
      const bx = kite.x + (tx - kite.x) * t - 12 + Math.sin(state.time * 6 + i) * 4;
      const by = kite.y + 26 + (ty - kite.y - 26) * t;
      ctx.fillStyle = i % 2 ? '#ff5a5a' : '#ffd166';
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(Math.sin(state.time * 6 + i) * 0.4);
      ctx.fillRect(-7, -3.5, 14, 7);
      ctx.restore();
    }
    // The kite itself, blinking while invulnerable.
    if (kite.invuln > 0 && Math.floor(state.time * 12) % 2 === 0) return;
    drawMiniKite(kite.x, kite.y, kite.tilt, '#ff5a5a', 1.35);
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(kite.x, kite.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawParticles(state) {
    for (const p of state.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.font = `bold 20px ${FONT}`;
    ctx.textAlign = 'center';
    for (const f of state.floaters) {
      ctx.globalAlpha = Math.max(0, f.life);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
  }

  function hud(state, best) {
    const lv = LEVELS[state.level];
    ctx.textAlign = 'left';
    ctx.font = `bold 30px ${FONT}`;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillText(`SKOR ${Math.floor(state.score).toLocaleString('en-US')}`, 24, 44);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`SKOR ${Math.floor(state.score).toLocaleString('en-US')}`, 22, 42);
    ctx.font = `bold 16px ${FONT}`;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillText(`BEST ${Math.max(best, Math.floor(state.score)).toLocaleString('en-US')}`, 24, 68);

    // Level name + the altitude bar, centred.
    ctx.textAlign = 'center';
    ctx.font = `bold 18px ${FONT}`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(lv.name, FIELD.width / 2, 30);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(FIELD.width / 2 - 130, 40, 260, 12);
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(FIELD.width / 2 - 130, 40, 260 * Math.min(1, state.altitude), 12);
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(FIELD.width / 2 - 130, 40, 260, 12);

    // Lives, top right, as little kites.
    ctx.textAlign = 'right';
    for (let i = 0; i < LIVES; i += 1) {
      const x = FIELD.width - 34 - i * 44;
      if (i < state.lives) drawMiniKite(x, 40, 0, '#ff5a5a', 0.62);
      else {
        ctx.globalAlpha = 0.3;
        drawMiniKite(x, 40, 0, '#ffffff', 0.62);
        ctx.globalAlpha = 1;
      }
    }
    if (state.combo >= 3) {
      ctx.font = `bold 24px ${FONT}`;
      ctx.fillStyle = '#ffe9a8';
      ctx.fillText(`COMBO x${state.combo}`, FIELD.width - 22, 84);
    }
    // The wind, bottom left.
    ctx.textAlign = 'left';
    ctx.font = `bold 17px ${FONT}`;
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    const arrow = state.wind.strength >= 0 ? '→' : '←';
    ctx.fillText(`ANGIN ${arrow} ${Math.abs(Math.round(state.wind.strength))}`, 24, FIELD.height - 18);
    if (state.ridingGust) {
      ctx.fillStyle = '#bfefff';
      ctx.fillText('Riding the gust! +score', 24, FIELD.height - 44);
    }
  }

  function panel(title, lines, accent) {
    ctx.fillStyle = 'rgba(10,14,30,0.62)';
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    ctx.textAlign = 'center';
    ctx.fillStyle = accent;
    ctx.font = `bold 74px ${FONT}`;
    ctx.fillText(title, FIELD.width / 2, 218);
    ctx.font = `20px ${FONT}`;
    ctx.fillStyle = '#ffffff';
    lines.forEach((line, i) => {
      ctx.fillText(line, FIELD.width / 2, 292 + i * 34);
    });
  }

  function draw(state, screen, best, bonus) {
    ctx.save();
    if (state.shake > 0) {
      const s = state.shake * 22;
      ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
    }
    sky(state);
    landscape(state);
    drawGusts(state);
    drawOrbs(state);
    drawHazards(state);
    drawKite(state);
    drawParticles(state);
    if (state.flash > 0) {
      ctx.fillStyle = `rgba(255,255,220,${state.flash * 0.9})`;
      ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    }
    ctx.restore();

    if (screen === SCREEN_TITLE) {
      ctx.fillStyle = 'rgba(10,14,30,0.45)';
      ctx.fillRect(0, 0, FIELD.width, FIELD.height);
      ctx.textAlign = 'center';
      const gold = ctx.createLinearGradient(0, 130, 0, 230);
      gold.addColorStop(0, '#ffe9a8');
      gold.addColorStop(1, '#ff9e57');
      ctx.fillStyle = gold;
      ctx.font = `bold 118px ${FONT}`;
      ctx.fillText('LANGIT', FIELD.width / 2, 218);
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold 30px ${FONT}`;
      ctx.fillText('Kite of the Monsoon', FIELD.width / 2, 264);
      ctx.font = `20px ${FONT}`;
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.fillText('Steer with the mouse or WASD / arrow keys — catch the golden wind,', FIELD.width / 2, 348);
      ctx.fillText('dodge storm clouds, crows and rival kites. Fill the altitude bar to finish a level.', FIELD.width / 2, 378);
      ctx.fillText('Five skies, from dawn to starlight. Three kites to lose.', FIELD.width / 2, 408);
      if (best > 0) {
        ctx.fillStyle = '#ffd166';
        ctx.font = `bold 22px ${FONT}`;
        ctx.fillText(`BEST  ${best.toLocaleString('en-US')}`, FIELD.width / 2, 462);
      }
      ctx.fillStyle = Math.floor(state.time * 2) % 2 === 0 ? '#ffffff' : '#ffd166';
      ctx.font = `bold 26px ${FONT}`;
      ctx.fillText('PRESS SPACE OR CLICK TO FLY', FIELD.width / 2, 540);
      ctx.font = `17px ${FONT}`;
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText('P pauses · R restarts · a game about the Indonesian sky', FIELD.width / 2, 584);
    } else if (screen === SCREEN_PLAY || screen === SCREEN_PAUSED) {
      hud(state, best);
      if (screen === SCREEN_PAUSED) {
        panel('PAUSED', ['The kite waits for the wind.', 'Press P or click to keep flying.'], '#bfefff');
      }
    } else if (screen === SCREEN_LEVEL) {
      hud(state, best);
      const next = LEVELS[state.level + 1];
      panel('LEVEL COMPLETE!', [
        `Bonus +${bonus} for a steady hand.`,
        next ? `Next sky: ${next.name}` : '',
        'Press SPACE or click to keep flying.',
      ], '#ffd166');
    } else if (screen === SCREEN_OVER) {
      hud(state, best);
      panel('THE KITE FELL', [
        `Score ${Math.floor(state.score).toLocaleString('en-US')}  ·  Best ${Math.max(best, Math.floor(state.score)).toLocaleString('en-US')}`,
        `You reached ${LEVELS[state.level].name}.`,
        'Press SPACE or click to fly again.',
      ], '#ff8a7a');
    } else if (screen === SCREEN_WIN) {
      hud(state, best);
      panel('MASTER OF THE MONSOON!', [
        `All five skies flown — score ${Math.floor(state.score).toLocaleString('en-US')}.`,
        `Best ${Math.max(best, Math.floor(state.score)).toLocaleString('en-US')}`,
        'Press SPACE or click to fly again.',
      ], '#ffd166');
    }
  }

  return { draw };
}
