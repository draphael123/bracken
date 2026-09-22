// src/dune-worm.js — THE DUNE WORM, the Sunken Caravan's boss, as a pure state machine (no DOM, no main.js). The boss batch
// wires it: a spawn case feeds wormStep() the world each frame and turns its events into hitboxes, tells, sounds and art.
// Brief: .claude/briefs/sunken-caravan.md. Rules (RULES-LEVELS-AND-BOSSES.md) it is built to, and tools/caravan.mjs checks:
//   A1 four told attacks, each a `<thing>Tell` mode        A5 nothing untouchable for more than ~2 s
//   A6 every untouchable stretch owes an open one            A7 an arena of about forty tiles
//   the signature (the ripple and its breach) is FIRST in the chain; every cooldown starts initialised (A3)
//   THE OPENING is player-made: a breach into a WAGON WRECK sticks it, head out, for STUCK s at double damage. A breach in
//   open sand opens nothing.
//
// The attacks (mark: '!' = the shield turns it, 'X' = the red cross, move):
//   RIPPLE -> BREACH   X  the sand bulges and runs at you, TRACKS for rippleTrack s, then COMMITS: it locks on to where you
//                         stand at that moment, a bulge rises, and rippleCommit s later it bursts up there in a column. Move.
//   SPRAY              !  surfaced, it rears and sprays a fan of grit: block it, or put a wreck between you.
//   LUNGE AND DIVE     X  it arcs out of the sand across the arena and back in; its SHADOW marks where it lands.
//   SWALLOW            X  a sinkhole opens under you and drags you to its mouth: jump, and keep jumping (src/quicksand.js).
// PHASE 2 (under half): every ripple brings a DECOY that never breaches (only the real one bulges at the commit), the storm
// comes in (the level's gusts: `stormOn` event), and a wreck it sticks in is SMASHED - fewer places to make the opening.

export const WORM = {
  hp: 1200,
  rippleSpeed: 150, rippleTrack: 1.0, rippleCommit: 0.45, commitSpeed: 190,
  breachR: 14, breachH: 60, breachT: 0.35, wreckR: 22,
  stuck: 3.0, stuckMult: 2,
  surfaced: 1.2,
  sprayTell: 0.7, spray: 0.35, sprayN: 7,
  lungeTell: 0.8, lunge: 0.9, lungeH: 70,
  swallowTell: 0.9, swallow: 1.8, swallowR: 44, swallowPull: 60, biteR: 12,
  under: 0.4, dive: 0.5,
  phase2: 0.5,
  CHAIN: ['ripple', 'spray', 'ripple', 'lunge', 'ripple', 'swallow'],   // the signature leads, and comes round every other turn
};
/* the worm's own state; `arena` = { x0, x1, floorY } in px */
export function newWorm(arena, x) { return { x, y: arena.floorY, hp: WORM.hp, mode: 'under', t: WORM.under, i: 0, ripples: [], face: 1, phase2: false, stuckT: 0, hitMult: 1, lungeFrom: 0, lungeTo: 0, pit: null, arena }; }
/* touchable: can the player's blows land on it this frame (and at what multiple) */
export const wormTouchable = W => ['breach', 'stuck', 'surfaced', 'sprayTell', 'spray', 'lunge', 'swallow', 'dive'].includes(W.mode);

/* one step. world = { px, py, pGround, wrecks: [{ x, alive }], rng } -> events: [{ t: 'tell'|'hit'|'open'|'smash'|'stormOn'|'pull'|'mode', ... }] */
export function wormStep(W, world, dt) {
  const ev = [], A = W.arena, clampX = x => Math.max(A.x0 + 24, Math.min(A.x1 - 24, x));
  if (!W.phase2 && W.hp <= WORM.hp * WORM.phase2) { W.phase2 = true; ev.push({ t: 'stormOn' }); }
  const go = (mode, t, extra) => { W.mode = mode; W.t = t; ev.push({ t: 'mode', mode }); if (extra) Object.assign(W, extra); };
  W.t -= dt;
  switch (W.mode) {
    case 'under': if (W.t <= 0) { const next = WORM.CHAIN[W.i++ % WORM.CHAIN.length];
        if (next === 'ripple') { W.ripples = [{ x: clampX(W.x), real: true }]; if (W.phase2) W.ripples.push({ x: clampX(world.px + (world.px < (A.x0 + A.x1) / 2 ? 140 : -140)), real: false });
          go('rippleTell', WORM.rippleTrack + WORM.rippleCommit); ev.push({ t: 'tell', what: 'ripple', mark: 'X' }); }
        else if (next === 'spray' || next === 'lunge') { go('surfaced', WORM.surfaced, { x: clampX(W.x), next }); }   // it comes up first: SPRAY and LUNGE start from the surface
        else { W.pit = { x: clampX(world.px) }; go('swallowTell', WORM.swallowTell); ev.push({ t: 'tell', what: 'swallow', mark: 'X', x: W.pit.x }); } }
      break;
    case 'rippleTell': { const tracking = W.t > WORM.rippleCommit;
      for (const r of W.ripples) { if (tracking) { const d = world.px - r.x; r.v = Math.sign(d) * Math.min(Math.abs(d) / dt, WORM.rippleSpeed); r.commit = false; }
        else { if (!r.commit) { r.commit = true; r.tx = clampX(r.real ? world.px : r.x + Math.sign(r.v || 1) * 60); r.cs = Math.max(WORM.commitSpeed, Math.abs(r.tx - r.x) / (WORM.rippleCommit * 0.8)); } r.bulge = r.real;   /* at the commit only the real one bulges: the decoy is readable, late */
          const d = r.tx - r.x; r.v = Math.sign(d) * Math.min(Math.abs(d) / dt, r.cs); }   /* COMMITTED: it races to where you stood as it committed and ALWAYS bursts there (a far ripple used to burst short of it, somewhere you could not read) - move now */
        r.x = clampX(r.x + r.v * dt); }
      if (W.t <= 0) { const real = W.ripples.find(r => r.real); W.x = real.x; W.ripples = [];
        go('breach', WORM.breachT); ev.push({ t: 'hit', what: 'breach', mark: 'X', box: [W.x - WORM.breachR, W.x + WORM.breachR, A.floorY - WORM.breachH, A.floorY] });
        const wreck = world.wrecks.find(w => w.alive && Math.abs(w.x - W.x) <= WORM.wreckR);
        W.caught = wreck || null; }
      break; }
    case 'breach': if (W.t <= 0) {
        if (W.caught) { go('stuck', WORM.stuck, { hitMult: WORM.stuckMult }); ev.push({ t: 'open', x: W.x });   /* THE OPENING: in the timbers, head out */
          if (W.phase2) { W.caught.alive = false; ev.push({ t: 'smash', x: W.caught.x }); } W.caught = null; }
        else go('surfaced', WORM.surfaced, { next: 'spray' }); }
      break;
    case 'stuck': if (W.t <= 0) { W.hitMult = 1; go('dive', WORM.dive); } break;
    case 'surfaced': if (W.t <= 0) { W.face = Math.sign(world.px - W.x) || 1;
        if (W.next === 'lunge') { W.lungeFrom = W.x; W.lungeTo = Math.max(A.x0 + 48, Math.min(A.x1 - 48, world.px));   /* never into a corner: a hero against the wall must be able to stand clear of the shadow (clamped at 24, its landing covered the corner) */ go('lungeTell', WORM.lungeTell); ev.push({ t: 'tell', what: 'lunge', mark: 'X', x: W.lungeTo }); }
        else { go('sprayTell', WORM.sprayTell); ev.push({ t: 'tell', what: 'spray', mark: '!' }); } }
      break;
    case 'sprayTell': if (W.t <= 0) { go('spray', WORM.spray); const shots = []; for (let k = 0; k < WORM.sprayN; k++) { const a = -Math.PI / 2 + W.face * (0.25 + k * 0.18); shots.push({ x: W.x, y: A.floorY - 30, vx: Math.cos(a) * 170, vy: Math.sin(a) * 170 }); } ev.push({ t: 'hit', what: 'spray', mark: '!', shots, blockable: true }); } break;
    case 'spray': if (W.t <= 0) go('dive', WORM.dive); break;
    case 'lungeTell': if (W.t <= 0) go('lunge', WORM.lunge); break;
    case 'lunge': { const k = 1 - Math.max(0, W.t) / WORM.lunge; W.x = W.lungeFrom + (W.lungeTo - W.lungeFrom) * k; W.y = A.floorY - Math.sin(k * Math.PI) * WORM.lungeH;
      ev.push({ t: 'hit', what: 'lunge', mark: 'X', box: [W.x - 16, W.x + 16, W.y - 24, W.y] });
      if (W.t <= 0) { W.y = A.floorY; go('dive', WORM.dive); } break; }
    case 'swallowTell': if (W.t <= 0) go('swallow', WORM.swallow); break;
    case 'swallow': { const d = world.px - W.pit.x;
      if (Math.abs(d) < WORM.swallowR && world.pGround) ev.push({ t: 'pull', toX: W.pit.x, v: WORM.swallowPull, quicksand: true });   /* the quicksand verb: jump, and keep jumping */
      if (W.t <= 0) { if (Math.abs(d) < WORM.biteR && world.pGround) ev.push({ t: 'hit', what: 'bite', mark: 'X', box: [W.pit.x - WORM.biteR, W.pit.x + WORM.biteR, A.floorY - 20, A.floorY] });
        W.x = W.pit.x; W.pit = null; go('surfaced', WORM.surfaced, { next: 'spray' }); } break; }
    case 'dive': if (W.t <= 0) go('under', WORM.under); break;
  }
  return ev;
}
export function wormHurt(W, dmg) { if (!wormTouchable(W)) return 0; const d = dmg * W.hitMult; W.hp = Math.max(0, W.hp - d); return d; }
