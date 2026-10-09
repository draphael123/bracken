// src/construct.js - THE CLOCKWORK CONSTRUCT, THE BURIED CITY's one new foe (claude/buriedcity, the Opus greybox, 2026-10-08; the desert-arc concept's signature
// for this level: "construct - Buried City"). Pure: no DOM, no main.js; the desert machines' contract (src/desert-foes.js): newConstruct(x, y) -> state,
// constructStep(s, w, dt) -> events ('tell' / 'hit' with a box, its mark and its damage).
// The city's old watch, still keeping its rounds under the sand: brass plates, an iron frame, a halberd and a winding key in its back. It is SLOW and it is
// HEAVY (design standard A9: a 1v1 threat, the level's heavy): it walks its beat, turns to you, and works its halberd in a told pair -
//   THE POKE  ('!': the halberd drawn back, then thrust level - a shield turns it)
//   THE SWEEP ('!!': the halberd dropped low behind it, then swept along the floor - jump it; no shield turns it)
// It keeps the order POKE, POKE, SWEEP (a rhythm you can read), and a missed poke never hurries the sweep.
// THE TWIST, TIED TO THE RULE (A9): IT RUNS ON ITS SPRINGS, AND SAND IS GRIT IN THE GEARS. A construct the moving sand carries (a room filling or draining
// under it, src/buried-city-hands.js) is JAMMED: it stands slumped, its lens dark, and throws nothing (w.jam > 0 - the hands keep it while the sand moves
// and a beat after) - and a jammed construct takes a blow twice over (the hands: JAMMED). DORMANT ones stand wound down under the great sand of the
// Drowned Quarter (st.dormant) and wind up when you come near once the quarter is drained.
// Frames (src/redraw/desert_glass.js bakeConstruct): 0,1 walk | 2 POKE TELL | 3 POKE | 4 WOUND DOWN (dormant, jammed) | 5 hurt. The sweep's tell is the poke's
// pose held low (frame 2) and its blow the thrust (frame 3); the marks (src/marks.js) say which one it is.
export const CONSTRUCT = { hp: 105, w: 12, h: 18, speed: 22, beat: 54, sight: 150, sightY: 34, pokeR: 34, pokeTell: 0.62, poke: 0.2, sweepR: 46, sweepTell: 0.8, sweep: 0.26,
  cd: 0.85, wake: 64, wakeT: 0.9, dmg: { poke: 21, sweep: 25 } };
const ev = (a, t, extra) => a.push({ t, ...extra });
export function newConstruct(x, y, dormant) { return { kind: 'construct', x, y, home: x, hp: CONSTRUCT.hp, mode: dormant ? 'dormant' : 'walk', t: 0, face: -1, cd: 0.8, frame: dormant ? 4 : 0, n: 0, dormant: !!dormant }; }
export const constructJammed = s => s.mode === 'jammed';
/* w = { px, py, time, jam (s left jammed: the hands set it while the sand moves under it) } */
export function constructStep(e, w, dt) {
  const out = [], d = w.px - e.x, ad = Math.abs(d), near = Math.abs(w.py - e.y) < CONSTRUCT.sightY;
  e.t -= dt; e.cd -= dt;
  if (w.jam > 0 && e.mode !== 'jammed' && e.mode !== 'dormant') { e.mode = 'jammed'; e.t = w.jam; e.frame = 4; ev(out, 'jammed', { x: e.x, y: e.y }); }
  switch (e.mode) {
    case 'dormant': e.frame = 4; if (near && ad < CONSTRUCT.wake && !(w.jam > 0)) { e.mode = 'wake'; e.t = CONSTRUCT.wakeT; e.dormant = false; ev(out, 'wake', { x: e.x, y: e.y }); } break;
    case 'wake': e.frame = Math.floor(w.time * 10) % 2 ? 4 : 0; if (e.t <= 0) { e.mode = 'walk'; e.cd = 0.4; e.face = Math.sign(d) || e.face; } break;
    case 'jammed': e.frame = 4; if (w.jam > 0) e.t = Math.max(e.t, w.jam); if (e.t <= 0) { e.mode = 'walk'; e.cd = 0.6; ev(out, 'unjammed', { x: e.x, y: e.y }); } break;
    case 'walk': {
      e.frame = Math.floor(w.time * 4) % 2;
      const sees = near && ad < CONSTRUCT.sight;
      if (sees) e.face = Math.sign(d) || e.face;
      else if (Math.abs(e.x - e.home) > CONSTRUCT.beat) e.face = Math.sign(e.home - e.x) || e.face;   /* its beat: back and forth over its post */
      const sweepNext = e.n % 3 === 2;
      if (sees && e.cd <= 0 && sweepNext && ad < CONSTRUCT.sweepR) { e.mode = 'sweepTell'; e.t = CONSTRUCT.sweepTell; e.frame = 2; ev(out, 'tell', { what: 'sweep', mark: '!!' }); }
      else if (sees && e.cd <= 0 && !sweepNext && ad < CONSTRUCT.pokeR) { e.mode = 'pokeTell'; e.t = CONSTRUCT.pokeTell; e.frame = 2; ev(out, 'tell', { what: 'poke', mark: '!' }); }
      else if (!(sees && ad < CONSTRUCT.pokeR * 0.75)) e.x += e.face * CONSTRUCT.speed * dt;
      break; }
    case 'pokeTell': if (e.t <= 0) { e.mode = 'poke'; e.t = CONSTRUCT.poke; e.frame = 3; e.n++;
        ev(out, 'hit', { what: 'poke', mark: '!', box: [e.x + (e.face > 0 ? 2 : -CONSTRUCT.pokeR - 4), e.x + (e.face > 0 ? CONSTRUCT.pokeR + 4 : -2), e.y - 16, e.y - 4], blockable: true, dmg: CONSTRUCT.dmg.poke }); } break;
    case 'sweepTell': if (e.t <= 0) { e.mode = 'sweep'; e.t = CONSTRUCT.sweep; e.frame = 3; e.n++;
        ev(out, 'hit', { what: 'sweep', mark: '!!', box: [e.x + (e.face > 0 ? -6 : -CONSTRUCT.sweepR - 2), e.x + (e.face > 0 ? CONSTRUCT.sweepR + 2 : 6), e.y - 9, e.y + 1], dmg: CONSTRUCT.dmg.sweep, low: true }); } break;
    case 'poke': case 'sweep': if (e.t <= 0) { e.cd = e.mode === 'sweep' ? CONSTRUCT.cd * 1.4 : CONSTRUCT.cd; e.mode = 'walk'; } break;
  }
  return out;
}
export const constructOpen = s => s.mode === 'jammed' || s.mode === 'dormant' || s.mode === 'wake';
