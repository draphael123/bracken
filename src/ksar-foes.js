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

/* ================= (claude/ksarfoes, Daniel 10-14: brief-ksarfix-1014.md part B) THE KSAR'S TWO NEW BANDITS - VARIANTS of proven machines (A9: the hawk scout stays the
   Ksar's one brand-new AI). src/ksar-hands.js runs them; src/redraw/ksar_foes_art.js draws them; tools/ksar.mjs checks them.
   THE FALCONER (cnSkin 'falconer'): the CUTTHROAT's machine (feint, knife) + a HAWK SCOUT on a leash (an ent with `falcon: <his squad>`). The hawk circles over him; he
   SENDS it (a told windup, sendTell, then the release - his own poses B16): it wheels over you and STOOPS on your spot (the hawk scout's own told stoop: its shadow,
   '!!'), lands a beat, climbs - and he CALLS it back to his glove (a told whistle, callTell). WHILE IT RIDES OVER HIM IT GUARDS HIM: a blow lands at guardMul with a clank
   (HIS HAWK GUARDS) - the Hawk-Mistress's grammar in small (B8). KNOCK IT DOWN (two blows; a torch or a keg's blast burns it out of the air; a flash blinds it) and he is
   OPEN (openMul, a gold ring + its timer, B10) for openT s (blind: while it is blind); with it dead he fights on unguarded.
   THE PLATED BANDIT (cnSkin 'ksarplate'): the CUTTHROAT's machine, weightier (walkMul, a longer real windup). Steel plate: a blade (any hero's blow, any fire) lands at
   plateMul with a clank and a word: THROW A BOMB (the shared turned read, src/boss-read.js). A KEG'S BLAST (thrown, kicked, a chain's) strips the plate: he staggers
   (stripStun s) and takes everything whole from then on (cnSkin stays; he wears 'ksarplatebare'). Keg stacks stand by every one of them. */
export const FALCON = { sendTell: 0.65, sendGo: 0.25, callTell: 0.6, glove: 1.2, cd: 3.0, sendR: 180, nearR: 34, guardR: 96, guardMul: 0.4, openMul: 1.5, openT: 3.5, leash: 36, alt: 66, toGloveV: 150 };
export const PLATE = { plateMul: 0.25, walkMul: 0.65, slashExtra: 0.2, stripStun: 1.2 };
/* the falconer's hawk guards him while it is up over him - not while it is out on a stoop, on the ground, blind, or dead */
export const falconGuards = (m, k) => !!(m && k && k.alive && k.st && ['patrol', 'climb', 'glove', 'toGlove', 'shriek'].includes(k.st.mode) && Math.abs(k.x - m.x) < FALCON.guardR);
export const falconDown = k => !k || !k.alive || (k.st && k.st.mode === 'blind');
