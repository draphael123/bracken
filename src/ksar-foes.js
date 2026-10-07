// src/ksar-foes.js - THE HAWK SCOUT, THE BANDIT KSAR's one new foe (claude/ksar, the Opus greybox, 2026-10-07; Daniel's interview 10-07 picked it as the
// one brand-new AI). Pure: no DOM, no main.js; the desert machines' contract (src/desert-foes.js): newHawk(x0, x1, y) -> state, hawkStep(s, w, dt) ->
// events ('spot' / 'tell' / 'hit' with a box, its mark and its damage).
// One of THE HAWK-MISTRESS's birds (B8: the level foreshadows her). It PATROLS the walls in a told circuit (a slow beat between two towers). One that
// SPOTS you - in its sight, below it, in the open (w.hidden: under a roof or in smoke, src/ksar-hands.js) - wheels over you and SHRIEKS (a red '!' and a
// ring: the 'spot' event - every LOOKOUT in its earshot runs for his gong, src/ksar-hands.js). Then it STOOPS on the spot it marked ('!!': its shadow
// snaps onto your spot - step off it), lands a beat, and climbs home. A FLASH (a thrown flask, src/ksar-hands.js) BLINDS it: it flaps blind in place
// (w.blind), spots nothing, then climbs home. It is a bird: two blows kill it (it is not her hawk - hers is part of her kit and unkillable).
// Frames (src/redraw/ksar_art.js bakeHawk): 0,1 glide/flap | 2 SHRIEK (wings up, beak open) | 3 STOOP TELL (folded, eye red) | 4 STOOP | 5 on the ground | 6 blind (flailing)
export const HAWK = { hp: 14, w: 12, h: 10, patrolV: 64, sight: 150, below: 230, shriek: 0.8, circle: 0.8, circleV: 120, diveTell: 0.8, diveV: 300, ground: 0.6, climb: 0.9,
  cd: 3, blind: 3.2, dmg: 18, earshot: 30, low: 84 };
const ev = (a, t, extra) => a.push({ t, ...extra });
export function newHawk(x0, x1, y) { return { kind: 'hawkscout', x: (x0 + x1) / 2, y, x0, x1, alt: y, home: (x0 + x1) / 2, hp: HAWK.hp, mode: 'patrol', t: 0, dir: 1, face: 1, cd: 1.5, frame: 0, tx: 0, ty: 0, spotted: 0 }; }
/* w = { px, py, time, hidden (the hero cannot be seen: a roof over him, smoke between), blind (s left blind: set by a flash), ground (the floor's px under the hero) } */
export function hawkStep(e, w, dt) {
  const out = [], d = w.px - e.x, ad = Math.abs(d); e.t -= dt; e.cd -= dt;
  if (w.blind > 0 && e.mode !== 'blind') { e.mode = 'blind'; e.t = w.blind; e.frame = 6; }
  switch (e.mode) {
    case 'patrol': { e.x += e.dir * HAWK.patrolV * dt; if (e.x > e.x1) { e.x = e.x1; e.dir = -1; } if (e.x < e.x0) { e.x = e.x0; e.dir = 1; } e.face = e.dir;
      e.y = e.alt + Math.sin(w.time * 2.2 + e.x0) * 5; e.frame = Math.floor(w.time * 4) % 2;
      const sees = !w.hidden && e.cd <= 0 && ad < HAWK.sight && w.py > e.y && w.py - e.y < HAWK.below && w.px > e.x0 - 120 && w.px < e.x1 + 120;
      if (sees) { e.mode = 'shriek'; e.t = HAWK.shriek; e.frame = 2; e.spotted++; e.face = Math.sign(d) || e.face; ev(out, 'spot', { x: e.x, y: e.y, mark: '!' }); ev(out, 'tell', { what: 'shriek', mark: '!' }); }
      break; }
    case 'shriek': e.frame = 2; if (e.t <= 0) { e.mode = 'circle'; e.t = HAWK.circle; } break;
    case 'circle': { const want = w.px; e.x += Math.sign(want - e.x) * Math.min(Math.abs(want - e.x), HAWK.circleV * dt); e.face = Math.sign(d) || e.face; e.frame = Math.floor(w.time * 6) % 2;
      e.y += (Math.max(e.alt, w.py - HAWK.low) - e.y) * Math.min(1, dt * 2.5);   /* it drops to wheel low over you: low enough for a flask */
      if (e.t <= 0) { e.mode = 'diveTell'; e.t = HAWK.diveTell; e.frame = 3; e.tx = w.px; e.ty = w.ground != null ? w.ground : w.py; ev(out, 'tell', { what: 'dive', mark: '!!', x: e.tx }); }
      break; }
    case 'diveTell': if (e.t <= 0) { e.mode = 'dive'; e.frame = 4; e.fx = e.x; e.fy = e.y; e.t = Math.max(0.2, Math.hypot(e.tx - e.x, e.ty - e.y) / HAWK.diveV); e.t0 = e.t; } break;   /* it stoops on the spot it marked: leave the shadow */
    case 'dive': { const k = 1 - Math.max(0, e.t) / e.t0; e.x = e.fx + (e.tx - e.fx) * k; e.y = e.fy + (e.ty - e.fy) * k; e.face = Math.sign(e.tx - e.fx) || e.face;
      ev(out, 'hit', { what: 'dive', mark: '!!', box: [e.x - 9, e.x + 9, e.y - 12, e.y + 2], dmg: HAWK.dmg });
      if (e.t <= 0) { e.mode = 'grounded'; e.t = HAWK.ground; e.y = e.ty; e.frame = 5; } break; }
    case 'grounded': if (e.t <= 0) { e.mode = 'climb'; e.t = HAWK.climb; e.frame = 1; e.cy = e.y; } break;   /* on the ground a beat: cut it */
    case 'blind': e.frame = 6; e.x += Math.sin(w.time * 9 + e.x0) * 30 * dt; e.y += Math.cos(w.time * 7) * 12 * dt; if (e.t <= 0) { e.mode = 'climb'; e.t = HAWK.climb; e.cy = e.y; e.cd = HAWK.cd * 0.5; } break;
    case 'climb': { const k = Math.min(1, 1 - e.t / HAWK.climb); e.y = (e.cy ?? e.y) + (e.alt - (e.cy ?? e.y)) * k; e.x += (Math.max(e.x0, Math.min(e.x1, e.x)) - e.x) * Math.min(1, dt * 2); e.frame = Math.floor(w.time * 8) % 2;
      if (e.t <= 0) { e.mode = 'patrol'; e.cd = Math.max(e.cd, HAWK.cd); e.y = e.alt; } break; }
  }
  return out;
}
export const hawkOpen = e => e.mode === 'grounded' || e.mode === 'blind';
