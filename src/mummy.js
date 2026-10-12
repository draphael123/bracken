// src/mummy.js - THE MUMMY, THE SEALED PYRAMID's one new foe (claude/sealedpyramid, the Opus greybox, 2026-10-12; the desert-arc concept's signature for this
// level: "mummy - Pyramid"). Pure: no DOM, no main.js; the desert machines' contract (src/desert-foes.js): newMummy(x, y) -> state, mummyStep(s, w, dt) -> events
// ('tell' / 'hit' with a box, its mark and its damage).
// The tomb's dead, wound in their linen and set to walk the galleries they were buried to guard. SLOW and WEIGHTY (A9: the level's heavy, a 1v1 threat):
//   THE LASH  ('!': a bandage flung out at reach - a shield turns it; it YANKS you a step toward him if it lands)
//   THE GRAB  ('!!': both arms out, a lurch at close quarters - no shield turns it; it HOLDS you (src/sealed-pyramid-hands.js) and squeezes until you strike
//             him or tear free)
// It keeps a rhythm you can read: LASH, LASH, GRAB.
// THE TWIST, TIED TO THE RULE (A9): IT IS HEAVY. A mummy's tread presses a TRAP PLATE as surely as yours (the hands read every walking mummy's feet), so a guard
// that follows you over a plate fires its trap on whoever stands in the reach - and that is how the tomb kills its own when you are the one standing clear.
// AND ITS LINEN BURNS (the concept): a mummy set alight (e.burn, any fire) flails, ablaze, and throws nothing until it goes out (w.burning - the hands keep it).
// A GUARD (st.guard [x0, x1] in px) walks its beat inside a trap's reach and turns back at its ends until it sees you.
// Frames (src/redraw/sealed_pyramid_art.js bakeMummy): 0,1 walk | 2 LASH TELL (arm back, the bandage coiled) | 3 LASH (arm out, the bandage flying) |
// 4 GRAB TELL (both arms up and wide) | 5 GRAB (lurched forward, arms closed) | 6 hurt | 7 BURNING (arms flailing) - every move its own windup and release (B16).
export const MUMMY = { hp: 120, w: 12, h: 20, speed: 17, beat: 46, sight: 150, sightY: 34, lashR: 58, lashTell: 0.66, lash: 0.22, grabR: 22, grabTell: 0.72, grab: 0.24,
  cd: 0.85, yank: 22, hold: 1.1, dmg: { lash: 22, grab: 14, squeeze: 9 } };
const ev = (a, t, extra) => a.push({ t, ...extra });
export function newMummy(x, y, guard) { return { kind: 'mummy', x, y, home: x, hp: MUMMY.hp, mode: 'walk', t: 0, face: -1, cd: 0.6, frame: 0, n: 0, guard: guard || null }; }
/* w = { px, py, time, burning (s left ablaze: the hands set it from e.burn) } */
export function mummyStep(e, w, dt) {
  const out = [], d = w.px - e.x, ad = Math.abs(d), near = Math.abs(w.py - e.y) < MUMMY.sightY;
  e.t -= dt; e.cd -= dt;
  if (w.burning > 0 && e.mode !== 'burning') { e.mode = 'burning'; e.t = w.burning; e.frame = 7; ev(out, 'ablaze', { x: e.x, y: e.y }); }
  switch (e.mode) {
    case 'burning': e.frame = 7; e.x += (Math.sin(w.time * 9) > 0 ? 1 : -1) * MUMMY.speed * 0.6 * dt; if (w.burning > 0) e.t = Math.max(e.t, w.burning); if (e.t <= 0) { e.mode = 'walk'; e.cd = 0.5; } break;
    case 'walk': {
      e.frame = Math.floor(w.time * 3) % 2;
      const sees = near && ad < MUMMY.sight;
      if (sees) e.face = Math.sign(d) || e.face;
      else if (e.guard) { if (e.x <= e.guard[0]) e.face = 1; else if (e.x >= e.guard[1]) e.face = -1; }   /* THE GUARD's beat: back and forth inside the reach */
      else if (Math.abs(e.x - e.home) > MUMMY.beat) e.face = Math.sign(e.home - e.x) || e.face;
      const grabNext = e.n % 3 === 2;
      if (sees && e.cd <= 0 && grabNext && ad < MUMMY.grabR + 6) { e.mode = 'grabTell'; e.t = MUMMY.grabTell; e.frame = 4; ev(out, 'tell', { what: 'grab', mark: '!!' }); }
      else if (sees && e.cd <= 0 && !grabNext && ad < MUMMY.lashR) { e.mode = 'lashTell'; e.t = MUMMY.lashTell; e.frame = 2; ev(out, 'tell', { what: 'lash', mark: '!' }); }
      else if (!(sees && ad < (grabNext ? MUMMY.grabR - 4 : MUMMY.lashR * 0.6))) e.x += e.face * MUMMY.speed * dt;
      break; }
    case 'lashTell': if (e.t <= 0) { e.mode = 'lash'; e.t = MUMMY.lash; e.frame = 3; e.n++;
        ev(out, 'hit', { what: 'lash', mark: '!', box: [e.x + (e.face > 0 ? 2 : -MUMMY.lashR - 2), e.x + (e.face > 0 ? MUMMY.lashR + 2 : -2), e.y - 16, e.y - 6], blockable: true, dmg: MUMMY.dmg.lash, yank: e.face }); } break;
    case 'grabTell': if (e.t <= 0) { e.mode = 'grab'; e.t = MUMMY.grab; e.frame = 5; e.n++; e.x += e.face * 6;
        ev(out, 'hit', { what: 'grab', mark: '!!', box: [e.x + (e.face > 0 ? -4 : -MUMMY.grabR - 4), e.x + (e.face > 0 ? MUMMY.grabR + 4 : 4), e.y - 20, e.y], dmg: MUMMY.dmg.grab, grab: true }); } break;
    case 'lash': case 'grab': if (e.t <= 0) { e.cd = e.mode === 'grab' ? MUMMY.cd * 1.5 : MUMMY.cd; e.mode = 'walk'; } break;
  }
  return out;
}
export const mummyOpen = s => s.mode === 'burning';
