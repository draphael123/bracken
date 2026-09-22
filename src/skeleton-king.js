// src/skeleton-king.js — THE SKELETON KING, the desert arc's world boss, as a pure state machine on top of src/light.js and the
// sandstorm in src/desert-rules.js. Not wired in: the boss batch gives him A8's twelve wiring points, a baker and a pilot.
// Brief: docs/desert-arc-brief.md. Proved by tools/skeleton-king.mjs.
//
// THE ROOM (in tiles, 40 wide, the floor's top at row KING.floor): the capstone's shaft at column 20 comes straight down onto the
// ALTAR MIRROR (20, 5); it throws the beam left or right along row 5 to the WALL MIRRORS (6, 5) and (33, 5), which throw it
// down their column to the floor - or up into the vault, wasted. In the side walls, high, two WINDOWS at row 5 with SHUTTERS.
// The player turns a mirror, or opens a shutter, by striking it from the ledge under it.
//
// HIS ARMOUR: gold and linen turn blows - 60% until the light burns him. THE OPENING (player-made): a beam on him. He BURNS:
// staggered, open, double damage, for KING.burnT, then he steps out of it
// and the light only chips him for KING.lightCd. A beam anywhere else opens nothing.
// PHASE 1 (100-66%): the capstone is open. The sun comes down the middle; the mirrors carry it to where he stands.
// PHASE 2 (66-33%): he SHUTS THE CAPSTONE. Dark. The only light is a window you have opened, routed by a wall mirror; he RAISES
//   HIS COURT: two guards, and a PRIEST who goes to the windows and shuts them again. Three layers at once: him, the court, the dark.
// PHASE 3 (<33%): he TEARS THE CAPSTONE OFF and the storm pours in: the sun is back, the gusts come (src/desert-rules.js), he is
//   faster. Him, what is left of the court, the storm.
// ATTACKS (the house marks): CROOK HOOK ! (a hook at the end of his crook, blockable), FLAIL SWEEP X (low, all round him: jump
// it), SAND SPIKES X (three marked tiles crack round you, then spikes: move off them), and in phase 3 SUN FLARE X (he lifts the
// crook and the light in the room flares along every beam: get out of the beams - the light that burns him burns you too, once).
export const KING = {
  hp: 2400, floor: 12, speed: 22, speed3: 32,
  hookTell: 0.6, hook: 0.25, hookR: 46, sweepTell: 0.7, sweep: 0.3, sweepR: 44, spikeTell: 0.9, spike: 0.4, flareTell: 1.0, flare: 0.3,
  cd: 1.3, burnT: 3.0, burnMult: 2, armour: 0.6, lightCd: 6, lightChip: 8,   /* ARMOUR: his gold and linen turn blows (60%) until the light burns him (then 200%): the fight is the light */
  shutT: 1.2, tearT: 1.2, courtCap: 3, priestShut: 7,
  phase2: 2 / 3, phase3: 1 / 3,
  CHAIN: ['hook', 'sweep', 'spikes', 'hook', 'sweep'], CHAIN3: ['hook', 'flare', 'sweep', 'spikes', 'hook', 'flare'],
};
export const ARENA_MIRRORS = () => [{ x: 20, y: 5, state: '/', turnable: true, name: 'altar' }, { x: 6, y: 5, state: '\\', turnable: true, name: 'west' }, { x: 33, y: 5, state: '/', turnable: true, name: 'east' }];
export const ARENA_WINDOWS = () => [{ x: 0, y: 5, dir: 'E', open: false, name: 'west' }, { x: 39, y: 5, dir: 'W', open: false, name: 'east' }];
export function newKing(x) { return { x, y: KING.floor * 16, w: 28, h: 46, hp: KING.hp, face: -1, phase: 1, mode: 'walk', t: 0, cd: 1.0, i: 0, burnCd: 0, hitMult: KING.armour, capstone: true, court: [], storm: false, spikes: null }; }
/* the light sources this moment: the capstone shaft while it is open, and any open window */
export function kingSources(K, windows) { const s = []; if (K.capstone) s.push({ x: 20, y: 0, dir: 'S' }); for (const w of windows) if (w.open) s.push({ x: w.x, y: w.y, dir: w.dir }); return s; }
export const kingBox = K => [K.x - K.w / 2, K.x + K.w / 2, K.y - K.h, K.y];
export const kingTouchable = K => !['shut', 'tear'].includes(K.mode);

/* one step. world = { px, py, lightRes (src/light.js trace of the room), windows } -> events */
export function kingStep(K, w, dt, litBox) {
  const out = [], e = (t, x) => out.push({ t, ...x });
  const frac = K.hp / KING.hp;
  K.t -= dt; K.cd -= dt; K.burnCd -= dt;
  if (K.phase === 1 && frac <= KING.phase2 && !['burn'].includes(K.mode)) { K.phase = 2; K.mode = 'shut'; K.t = KING.shutT; e('mode', { mode: 'shut' }); }
  if (K.phase === 2 && frac <= KING.phase3 && !['burn'].includes(K.mode)) { K.phase = 3; K.mode = 'tear'; K.t = KING.tearT; e('mode', { mode: 'tear' }); }
  // THE OPENING: any beam on him (not while already burning, and not again until the light has had its rest)
  const inLight = w.lightRes && litBox(w.lightRes, kingBox(K));
  if (inLight && K.burnCd <= 0 && !['burn', 'shut', 'tear'].includes(K.mode)) { K.mode = 'burn'; K.t = KING.burnT; K.hitMult = KING.burnMult; K.burnCd = KING.burnT + KING.lightCd; K.spikes = null; e('open', { x: K.x }); }
  else if (inLight && K.mode !== 'burn') e('chip', { dmg: KING.lightChip * dt });
  const d = w.px - K.x, ad = Math.abs(d);
  switch (K.mode) {
    case 'shut': if (K.t <= 0) { K.capstone = false; K.mode = 'walk'; K.cd = 0.8; e('dark', {}); e('court', { spawn: [{ kind: 'guard', x: 8 * 16 }, { kind: 'guard', x: 31 * 16 }, { kind: 'priest', x: 20 * 16 }] }); } break;
    case 'tear': if (K.t <= 0) { K.capstone = true; K.storm = true; K.mode = 'walk'; K.cd = 0.6; e('stormOn', {}); } break;
    case 'burn': if (K.t <= 0) { K.hitMult = KING.armour; K.mode = 'walk'; K.cd = 0.6; } break;
    case 'walk': { K.face = Math.sign(d) || K.face; if (ad > 30) K.x += K.face * (K.phase === 3 ? KING.speed3 : KING.speed) * dt;
      if (K.cd <= 0) { const chain = K.phase === 3 ? KING.CHAIN3 : KING.CHAIN, next = chain[K.i++ % chain.length], quick = K.phase === 3 ? 0.85 : 1;
        if (next === 'hook' && ad > KING.hookR * 1.4) { K.i--; break; }                         // walk in for the hook rather than throw it at nothing
        if (next === 'hook') { K.mode = 'hookTell'; K.t = KING.hookTell * quick; e('tell', { what: 'hook', mark: '!' }); }
        if (next === 'sweep') { K.mode = 'sweepTell'; K.t = KING.sweepTell * quick; e('tell', { what: 'sweep', mark: 'X' }); }
        if (next === 'spikes') { K.spikes = [-1, 0, 1].map(k => Math.floor(w.px / 16) + k); K.mode = 'spikeTell'; K.t = KING.spikeTell * quick; e('tell', { what: 'spikes', mark: 'X', tiles: K.spikes }); }
        if (next === 'flare') { K.mode = 'flareTell'; K.t = KING.flareTell; e('tell', { what: 'flare', mark: 'X' }); } }
      break; }
    case 'hookTell': if (K.t <= 0) { K.mode = 'atk'; K.t = KING.hook; e('hit', { what: 'hook', mark: '!', blockable: true, dmg: 14, pull: true, box: [K.x + (K.face > 0 ? 0 : -KING.hookR), K.x + (K.face > 0 ? KING.hookR : 0), K.y - 30, K.y - 4] }); } break;
    case 'sweepTell': if (K.t <= 0) { K.mode = 'atk'; K.t = KING.sweep; e('hit', { what: 'sweep', mark: 'X', dmg: 18, box: [K.x - KING.sweepR, K.x + KING.sweepR, K.y - 12, K.y] }); } break;
    case 'spikeTell': if (K.t <= 0) { K.mode = 'atk'; K.t = KING.spike; for (const tx of K.spikes) e('hit', { what: 'spikes', mark: 'X', dmg: 16, box: [tx * 16, tx * 16 + 16, K.y - 20, K.y] }); K.spikes = null; } break;
    case 'flareTell': if (K.t <= 0) { K.mode = 'atk'; K.t = KING.flare; e('hit', { what: 'flare', mark: 'X', dmg: 12, beams: true }); } break;   // the game hurts whoever stands in a lit tile
    case 'atk': if (K.t <= 0) { K.mode = 'walk'; K.cd = KING.cd * (K.phase === 3 ? 0.8 : 1); } break;
  }
  return out;
}
export function kingHurt(K, dmg) { if (!kingTouchable(K)) return 0; const d = dmg * K.hitMult; K.hp = Math.max(0, K.hp - d); return d; }
