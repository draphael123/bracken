// src/dune-worm.js — THE DUNE WORM, the Sunken Caravan's boss, as a pure state machine (no DOM, no main.js). main.js's
// updateDuneWormBoss feeds wormStep() the world each frame and turns its events into hitboxes, tells, sounds and art.
// Brief: docs/briefs/dune-worm.md (written from .claude/briefs/sunken-caravan.md and amended there). Rules it is built to, and
// tools/caravan.mjs checks:
//   A1 four told attacks, each a `<thing>Tell` mode        A5 nothing untouchable for more than ~2 s
//   A6 every untouchable stretch owes an open one            A7 an arena of about forty tiles
//   the signature (the ripple and its breach) is FIRST in the chain; every timer is a number at spawn (A3)
//   THE OPENING is player-made (A11): THE ROLLED-OUT SHADE. Wind the hollow's awning out, stand under it, leave the spot late:
//   his breach comes up INTO the canvas and he is TANGLED, head wrapped, for WORM.tangled s at double damage. The awning comes
//   down off its rollers as he tears free, so it is wound out again every time. A breach in open sand, or under an awning that
//   is rolled in, opens nothing. (AMENDED from the desert notes' wagon wreck, at Daniel's word: the level's machine is the key.)
//
// The attacks (mark: '!' = the shield turns it, '!!' = nothing does, move):
//   RIPPLE -> BREACH   !!  the sand bulges and runs at you, TRACKS for rippleTrack s, then COMMITS: it locks on to where you
//                          stand at that moment, a dome rises, and rippleCommit s later it bursts up there in a column. Move.
//   SPIT                !  surfaced, it rears back, throat lit, and spits a fan of sand clots: a shield takes grit.
//   LUNGE AND DIVE     !!  it coils, then arcs out of the sand across the arena and back in; its SHADOW marks where it lands.
//   SWALLOW            !!  a sinkhole opens under you and drags you to its mouth: jump, and keep jumping (src/quicksand.js).
// PHASE 2 (under half, A10): THE STORM, in his hollow only (no storm in the level: Daniel). The world starts it on 'stormOn' (the
// sun goes in, gusts on src/desert-rules.js's clock shove you along the sand, told); here, every ripple brings a DECOY that never
// rises at the commit (only the real one bulges: readable, late).

export const WORM = {
  hp: 1100,
  rippleSpeed: 150, rippleTrack: 1.0, rippleCommit: 0.45, commitSpeed: 190,
  breachR: 14, breachH: 60, breachT: 0.35,
  tangled: 2.5, tangledMult: 2,                   /* THE OPENING */
  surfaced: 1.2,
  spitTell: 0.7, spit: 0.35, spitN: 7,
  lungeTell: 0.7, lunge: 0.9, lungeH: 70, lungeR: 16, lungeFar: 140,   /* THE LUNGE comes from AFAR: he surfaces lungeFar px off you, on the side with room, and arcs across at you (from under your feet it was a hop) */
  swallowTell: 0.9, swallow: 1.8, swallowR: 44, swallowPull: 60, biteR: 12,
  under: 0.4, underJitter: 0.3, dive: 0.5,   /* how long he stays down between moves: 0.25-0.55 s on the world's dice (world.rng), 0.4 without them */
  phase2: 0.5,
  dmg: { breach: 30, spit: 9, lunge: 30, bite: 32 },
  /* THE STORM IN THE HOLLOW: a gust's push along the sand, px/s. The pyramid's storm is 150 (src/desert-rules.js); this is a
     hollow forty tiles wide with a wall at each end, and a push of 150 over a 1.6 s gust carried a hero the width of the awning
     and into the far wall. At 100 an unbraced hero goes about ten tiles, and walking INTO it gets you nowhere - so a ripple that commits in a
     gust is left DOWNWIND, the way the arrow points (the storm's read). Braced (holding block), under one tile */
  gust: 100,
  CHAIN: ['ripple', 'spit', 'ripple', 'lunge', 'ripple', 'swallow'],   // the signature leads, and comes round every other turn. WITH DICE (world.rng) the three between
                                                                       // the ripples come in a fresh order every round: all three every round (A3), never the same rhythm twice
};
/* the worm's own state; `arena` = { x0, x1, floorY } in px. EVERY TIMER IS A NUMBER HERE (A3: an undefined one is never <= 0) */
export function newWorm(arena, x) {
  return { x, y: arena.floorY, hp: WORM.hp, maxHp: WORM.hp, mode: 'under', t: WORM.under, i: 0, ripples: [], face: 1, phase2: false, hitMult: 1,
    lungeFrom: x, lungeTo: x, pit: null, next: 'spit', caught: false, tangles: 0, arena };
}
const TOUCH = new Set(['breach', 'tangled', 'surfaced', 'spitTell', 'spit', 'lungeTell', 'lunge', 'swallow', 'dive']);
/* touchable: can the player's blows land on it this frame */
export const wormTouchable = W => TOUCH.has(W.mode);
/* what a blow is worth: nothing through the sand, double while it is tangled in the canvas */
export const wormTake = W => wormTouchable(W) ? W.hitMult : 0;
export const wormOpen = W => W.mode === 'tangled';
/* the modes a player reads a TELL off (each one ends in Tell: main.js's windingUp() plays its sound, src/marks.js marks it) */
export const WORM_TELLS = ['rippleTell', 'spitTell', 'lungeTell', 'swallowTell'];

/* one step. world = { px, py, pGround, canopy: [x0, x1] | null (the awning, only while it is rolled OUT), rng? }
   -> events: [{ t: 'tell'|'hit'|'open'|'free'|'stormOn'|'pull'|'mode', ... }] */
export function wormStep(W, world, dt) {
  const rnd = world.rng || null;
  const ev = [], A = W.arena, clampX = x => Math.max(A.x0 + 24, Math.min(A.x1 - 24, x));
  if (!W.phase2 && W.hp <= (W.maxHp || WORM.hp) * WORM.phase2)   /* of HIS maximum: the game scales a boss's health to the hero, and the machine is told it (main.js sets W.maxHp) */ { W.phase2 = true; ev.push({ t: 'stormOn' }); }
  const go = (mode, t, extra) => { W.mode = mode; W.t = t; ev.push({ t: 'mode', mode }); if (extra) Object.assign(W, extra); };
  if (W.mode !== 'lunge') W.y = A.floorY;   /* only the lunge leaves the sand: whatever else he is doing, he is at the floor */
  W.t -= dt;
  switch (W.mode) {
    case 'under': if (W.t <= 0) { const slot = W.i++ % WORM.CHAIN.length;
        if (slot === 0) { const o = ['spit', 'lunge', 'swallow']; if (rnd) for (let k = o.length - 1; k > 0; k--) { const j = Math.floor(rnd() * (k + 1)); [o[k], o[j]] = [o[j], o[k]]; } W.order = o; }
        const next = slot % 2 === 0 ? 'ripple' : (W.order || ['spit', 'lunge', 'swallow'])[(slot - 1) >> 1];
        if (next === 'ripple') { W.ripples = [{ x: clampX(W.x), real: true, v: 0 }]; if (W.phase2) W.ripples.push({ x: clampX(world.px + (world.px < (A.x0 + A.x1) / 2 ? 140 : -140)), real: false, v: 0 });
          go('rippleTell', WORM.rippleTrack + WORM.rippleCommit); ev.push({ t: 'tell', what: 'ripple', mark: '!!' }); }
        else if (next === 'spit') { go('surfaced', WORM.surfaced, { x: clampX(W.x), next }); }   // it comes up first: SPIT and LUNGE start from the surface
        else if (next === 'lunge') { const s = world.px - A.x0 > A.x1 - world.px ? -1 : 1; go('surfaced', WORM.surfaced, { x: clampX(world.px + s * WORM.lungeFar), next }); }
        else { W.pit = { x: clampX(world.px) }; W.x = W.pit.x; go('swallowTell', WORM.swallowTell); ev.push({ t: 'tell', what: 'swallow', mark: '!!', x: W.pit.x }); } }
      break;
    case 'rippleTell': { const tracking = W.t > WORM.rippleCommit;
      for (const r of W.ripples) { if (tracking) { const d = world.px - r.x; r.v = Math.sign(d) * Math.min(Math.abs(d) / dt, WORM.rippleSpeed); r.commit = false; }
        else { if (!r.commit) { r.commit = true; r.tx = clampX(r.real ? world.px : r.x + Math.sign(r.v || 1) * 60); r.cs = Math.max(WORM.commitSpeed, Math.abs(r.tx - r.x) / (WORM.rippleCommit * 0.8)); } r.bulge = r.real;   /* at the commit only the real one bulges: the decoy is readable, late */
          const d = r.tx - r.x; r.v = Math.sign(d) * Math.min(Math.abs(d) / dt, r.cs); }   /* COMMITTED: it races to where you stood as it committed and ALWAYS bursts there (a far ripple used to burst short of it, somewhere you could not read) - move now */
        r.x = clampX(r.x + r.v * dt); }
      const real = W.ripples.find(r => r.real); if (real) W.x = real.x;   /* the entity follows the real one, so its mark rides the ripple */
      if (W.t <= 0) { W.x = real.x; W.ripples = [];
        go('breach', WORM.breachT); ev.push({ t: 'hit', what: 'breach', mark: '!!', box: [W.x - WORM.breachR, W.x + WORM.breachR, A.floorY - WORM.breachH, A.floorY] });
        /* THE OPENING: did it come up under the rolled-out shade? (the canopy is null unless the awning is OUT) */
        W.caught = !!(world.canopy && W.x >= world.canopy[0] && W.x <= world.canopy[1]); }
      break; }
    case 'breach': if (W.t <= 0) {
        if (W.caught) { W.caught = false; W.tangles++; go('tangled', WORM.tangled, { hitMult: WORM.tangledMult }); ev.push({ t: 'open', x: W.x }); }   /* into the canvas, head wrapped: the awning comes down on him */
        else go('surfaced', WORM.surfaced, { next: 'spit' }); }
      break;
    case 'tangled': if (W.t <= 0) { W.hitMult = 1; ev.push({ t: 'free', x: W.x }); go('dive', WORM.dive); } break;
    case 'surfaced': if (W.t <= 0) { W.face = Math.sign(world.px - W.x) || 1;
        if (W.next === 'lunge') { W.lungeFrom = W.x; W.lungeTo = Math.max(A.x0 + 48, Math.min(A.x1 - 48, world.px));   /* never into a corner: a hero against the wall must be able to stand clear of the shadow (clamped at 24, its landing covered the corner) */ go('lungeTell', WORM.lungeTell); ev.push({ t: 'tell', what: 'lunge', mark: '!!', x: W.lungeTo }); }
        else { go('spitTell', WORM.spitTell); ev.push({ t: 'tell', what: 'spit', mark: '!' }); } }
      break;
    case 'spitTell': if (W.t <= 0) { go('spit', WORM.spit); W.face = Math.sign(world.px - W.x) || W.face;
        /* A FAN OF CLOTS from the mouth, arcing down: the nearest lands ~35 px out, the farthest ~145, so there is no safe spot in front
           of him - only the shield, or behind him */
        const shots = []; for (let k = 0; k < WORM.spitN; k++) shots.push({ x: W.x + W.face * 10, y: A.floorY - 50, vx: W.face * (40 + k * 30), vy: -120 + k * 10, g: 420 });
        ev.push({ t: 'hit', what: 'spit', mark: '!', shots, blockable: true }); } break;
    case 'spit': if (W.t <= 0) go('dive', WORM.dive); break;
    case 'lungeTell': if (W.t <= 0) go('lunge', WORM.lunge); break;
    case 'lunge': { const k = 1 - Math.max(0, W.t) / WORM.lunge; W.x = W.lungeFrom + (W.lungeTo - W.lungeFrom) * k; W.y = A.floorY - Math.sin(k * Math.PI) * WORM.lungeH;
      if (k >= 0.5) ev.push({ t: 'hit', what: 'lunge', mark: '!!', box: [W.x - WORM.lungeR, W.x + WORM.lungeR, W.y - 24, W.y] });   /* THE HEAD COMING DOWN is the blow, onto the shadow: going up it is leaving you (a hero cutting at his coil was struck by the take-off, which nothing on the screen had told) */
      if (W.t <= 0) { W.y = A.floorY; go('dive', WORM.dive); } break; }
    case 'swallowTell': if (W.t <= 0) go('swallow', WORM.swallow); break;
    case 'swallow': { const d = world.px - W.pit.x;
      if (Math.abs(d) < WORM.swallowR && world.pGround) ev.push({ t: 'pull', toX: W.pit.x, v: WORM.swallowPull, quicksand: true });   /* the quicksand verb: jump, and keep jumping */
      if (W.t <= 0) { if (Math.abs(d) < WORM.biteR && world.pGround) ev.push({ t: 'hit', what: 'bite', mark: '!!', box: [W.pit.x - WORM.biteR, W.pit.x + WORM.biteR, A.floorY - 20, A.floorY] });
        W.x = W.pit.x; W.pit = null; go('surfaced', WORM.surfaced, { next: 'spit' }); } break; }
    case 'dive': if (W.t <= 0) go('under', WORM.under + (rnd ? (rnd() - 0.5) * WORM.underJitter : 0)); break;
  }
  return ev;
}
export function wormHurt(W, dmg) { const k = wormTake(W); if (!k) return 0; const d = dmg * k; W.hp = Math.max(0, W.hp - d); return d; }
