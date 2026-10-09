// src/dune-worm.js — THE DUNE WORM, the Sunken Caravan's boss, as a pure state machine (no DOM, no main.js). main.js's
// updateDuneWormBoss feeds wormStep() the world each frame and turns its events into hitboxes, tells, sounds, tiles and art.
// Brief: docs/briefs/dune-worm.md, REWORKED by claude/caravan2 (Daniel's live playtest 2026-10-09, scratch/brief-caravan2.md part B).
// Rules it is built to, and tools/caravan.mjs checks:
//   A1 five told attacks, each a `<thing>Tell` mode        A7 an arena of about forty tiles
//   the signature (the ripple and its breach) is FIRST in the chain; every timer is a number at spawn (A3)
//
// HIS HIDE (claude/caravan2 - DANIEL'S B15 EXCEPTION, like the Gargoyle's spikes): outside his opening he takes NOTHING. A blow on him up out
// of the sand CLANKS, flashes and says why (main.js: HIDE TOO THICK - MAKE HIM HIT A LEDGE); through the sand a blade finds only sand.
// THE OPENING is player-made (A11, B14's "the level's verb"): THE RISING STONES. Two slabs of the old town's sandstone (three in phase two)
// are always up somewhere in his hollow, rising out of the sand at random fair spots with a told rise (dust and a rumble, WORM.LEDGE.rise s)
// and sinking again after a while. Stand by one - under it, or on it - when the ripple comes for you, and leave the spot LATE: his breach
// comes up under the stone and HE HITS HIS HEAD ON IT. STUNNED, head down against the rock, for WORM.stunned s at WORM.stunMult (the
// shared gold read and a timer bar, B10). The stone he hit is cracked and sinks once he is free, so the next one is somewhere else.
// After every stun a told WARD (B3, WORM.ward s: the sand runs over his hide and it says WARDED) - a breach under a stone in the ward
// stuns nothing, so he can never be chain-locked. A breach in open sand opens nothing.
// A stone is SHADE while it stands (the level's rule, A1: the sun drain is off under it - main.js hands the boxes to the shade, cvCanopies),
// and FOOTING (a one-way shelf three rows up: a breach that catches the stone never reaches a hero standing on it).
//
// The attacks (mark: '!' = the shield turns it, '!!' = nothing does, move):
//   RIPPLE -> BREACH   !!  the sand bulges and runs at you, TRACKS for rippleTrack s, then COMMITS: it locks on to where you
//                          stand at that moment, a dome rises, and rippleCommit s later it bursts up there in a column. Move.
//   SAND BREATH         !  (claude/caravan2, replacing the spit's fan of clots) surfaced, he rears back, throat lit, DRAWS BREATH,
//                          and blasts a cone of sand from his mouth along the floor in front of him: grit in the eyes (the world blinds
//                          you a moment) and damage. A shield facing him takes it; or be behind him, or roll through it.
//   LUNGE AND DIVE     !!  it coils, then arcs out of the sand across the arena and back in; its SHADOW marks where it lands.
//                          (claude/caravan2: his KILL ATTACK - the coil is +50% longer, sound + word + colour, never a one-shot)
//   SWALLOW            !!  a sinkhole opens under you and drags you to its mouth: jump, and keep jumping (src/quicksand.js).
//                          (claude/caravan2: the sinkhole's tell is +50% longer too)
//   TAIL SWEEP         !!  surfaced in front of you, he rears, and his TAIL breaks the sand BEHIND you; then it scythes along the
//                          floor through you to his head, and back. Low: jump it (or be past the tail when it starts).
// PHASE 2 (under half, A10): THE STORM, in his hollow only (no storm in the level: Daniel). The world starts it on 'stormOn' (the
// sun goes in, gusts on src/desert-rules.js's clock shove you along the sand, told); here, every ripple brings a DECOY that never
// rises at the commit (only the real one bulges: readable, late), and a THIRD stone stands in the hollow (the arena changes, B5).

export const WORM = {
  hp: 2300,       /* (claude/caravan2: every blow outside the stun is nothing now, so his health is what the stuns pay for - tuned WITH FLASKS) */
  rippleSpeed: 170, rippleTrack: 0.88, rippleCommit: 0.45, commitSpeed: 215,
  breachR: 14, breachH: 60, breachT: 0.3,
  stunned: 3.0, stunMult: 1.5,                    /* THE OPENING: his head on the stone. B15: openings pay 1.5-2x */
  ward: 3.0,                                      /* B3: the told ward after every opening */
  surfaced: 1.0,
  /* THE SAND BREATH (claude/caravan2): breathTell s drawing it in, then breath s of a cone breathReach px long from his mouth to the floor */
  breathTell: 0.8, breath: 0.9, breathGrow: 0.25, breathReach: 130, breathH: 52, breathBlind: 1.4,
  /* THE LUNGE comes from AFAR: he surfaces lungeFar px off you, on the side with room, and arcs across at you. claude/caravan2: his kill
     attack - the coil (lungeTell) +50%, 0.6 -> 0.9 s */
  lungeTell: 0.9, lunge: 0.8, lungeH: 70, lungeR: 16, lungeFar: 140,
  swallowTell: 1.2, swallow: 1.6, swallowR: 44, swallowPull: 60, biteR: 12,   /* (claude/caravan2: the sinkhole's tell +50%, 0.8 -> 1.2 s) */
  /* THE TAIL SWEEP (claude/duneworm2): the tail comes up sweepFar px past you, on the far side from his head, for sweepTell s, then crosses
     to his head along the floor in `sweep` s; its blow is a box sweepR either side of the tail and sweepH high: a jump clears it */
  sweepTell: 0.65, sweep: 0.45, sweepBack: 0.38, sweepFar: 90, sweepR: 12, sweepH: 16,   /* and BACK: it whips from his head out to where it rose, FASTER (sweepBack s: a whip) - jump it, and again */
  /* THE CRASH (claude/duneworm2): where his lunge comes down, two waves of sand run out along the floor, waveV px/s for waveT s, waveH high: jump them */
  waveV: 120, waveT: 0.9, waveR: 8, waveH: 12,
  under: 0.35, underJitter: 0.26, dive: 0.44,   /* how long he stays down between moves: 0.22-0.48 s on the world's dice (world.rng), 0.35 without them */
  turn: 0.5,      /* s a hero may stand behind him while he is up before he TURNS to face her (a beast does not hold still to be read) */
  phase2: 0.5,
  /* claude/caravan2: -25% across his moves (Daniel: "less damage"), the spit's clot becomes the breath's one blast */
  dmg: { breach: 31, breath: 18, lunge: 31, bite: 31, sweep: 35, wave: 28 },
  /* THE STORM IN THE HOLLOW: a gust's push along the sand, px/s (the pyramid's is 150, src/desert-rules.js; at 100 an unbraced hero goes
     about ten tiles, and walking INTO it gets you nowhere - braced (holding block), under one tile) */
  gust: 100,
  /* THE RISING STONES (claude/caravan2): `keep` up at once (keep2 in phase two), each w px wide with its top `rows` tiles over the floor;
     a told rise of `rise` s, `life` s standing (on the dice, inside the range), `sink` s going down. A new one rises `every` s after one
     goes, at a random slot `edge` px clear of each wall, `clear` px clear of the hero (never up under him) and `apart` px clear of another
     stone. The longest the hollow may stand with NO stone up is `gapCap` s (the brief: 6-8) */
  LEDGE: { w: 48, rows: 3, rise: 1.0, sink: 0.7, life: [11, 15], keep: 2, keep2: 3, every: 1.2, edge: 64, clear: 44, apart: 24, gapCap: 6 },
  CHAIN: ['ripple', 'breath', 'ripple', 'lunge', 'ripple', 'swallow', 'ripple', 'sweep', 'ripple', 'sweep'],   // the signature leads, and comes round every other turn. WITH DICE (world.rng) the five between
                                                                                         // the ripples come in a fresh order every round: all four moves every round, the tail twice (A3), never the same rhythm twice
};
export const WORM_MOVES = ['breath', 'lunge', 'swallow', 'sweep', 'sweep'];   /* THE TAIL comes twice a round: it is the one a hand has to time, not just read */
/* the worm's own state; `arena` = { x0, x1, floorY, avoid?: [[x0, x1] px where no stone may rise (the rim's overhang, the gate)] }.
   EVERY TIMER IS A NUMBER HERE (A3: an undefined one is never <= 0) */
export function newWorm(arena, x) {
  return { x, y: arena.floorY, hp: WORM.hp, maxHp: WORM.hp, mode: 'under', t: WORM.under, i: 0, ripples: [], face: 1, phase2: false, hitMult: 1,
    lungeFrom: x, lungeTo: x, behindT: 0, waves: [], tailX: x, tailFrom: x, pit: null, next: 'breath', caught: null, stuns: 0, ward: 0, wardBlocked: 0,
    breathX: x, breathFace: 1, breathK: 0, ledges: [], ledgeT: 0, ledgeId: 0, noLedgeT: 0, noLedgeMax: 0, seed: 12345, arena };
}
const TOUCH = new Set(['breach', 'stunned', 'surfaced', 'breathTell', 'breath', 'lungeTell', 'swallow', 'dive', 'sweepTell', 'sweep', 'sweepBack']);
const TURNS = new Set(['surfaced', 'dive', 'breach', 'swallow']);
/* touchable: is he up out of the sand this frame (anything a blade can reach - and turn off his hide) */
export const wormTouchable = W => TOUCH.has(W.mode);
/* what a blow is worth: WORM.stunMult while his head is on the stone, NOTHING otherwise (Daniel's B15 exception) */
export const wormTake = W => W.mode === 'stunned' ? WORM.stunMult : 0;
/* a blow his hide turned: he is up out of the sand, and not stunned (main.js clanks it and says HIDE TOO THICK - MAKE HIM HIT A LEDGE) */
export const wormHide = W => wormTouchable(W) && W.mode !== 'stunned';
export const wormPlated = wormHide;   /* (the old name, claude/duneworm2's plates: kept so a caller written to it still asks the right thing) */
export const wormOpen = W => W.mode === 'stunned';
/* the stones a hero can see and use: rising, standing or sinking (the world draws all three; only 'up' is footing and a trap) */
export const wormLedges = W => (W.ledges || []);
export const ledgeUp = l => l.state === 'up';
/* the stone (standing) over x, or null */
export const ledgeOver = (W, x, pad = 2) => (W.ledges || []).find(l => l.state === 'up' && x >= l.x0 - pad && x <= l.x1 + pad) || null;
/* a stone's box as [x0, x1, top, floor] px: its shade, and its footing's top */
export const ledgeBox = (W, l) => [l.x0, l.x1, W.arena.floorY - WORM.LEDGE.rows * 16, W.arena.floorY];
/* the modes a player reads a TELL off (each one ends in Tell: main.js's windingUp() plays its sound, src/marks.js marks it) */
export const WORM_TELLS = ['rippleTell', 'breathTell', 'lungeTell', 'swallowTell', 'sweepTell'];

/* THE STONES, one step: rise -> up -> sink -> gone, and a new one up whenever fewer than `keep` stand */
function ledgeStep(W, world, dt, ev, rnd) {
  const LG = WORM.LEDGE, A = W.arena, keep = W.phase2 ? LG.keep2 : LG.keep;
  for (const l of W.ledges) { l.t -= dt;
    if (l.state === 'rise' && l.t <= 0) { l.state = 'up'; l.t = l.life; ev.push({ t: 'ledgeUp', l }); }
    else if (l.state === 'up' && l.t <= 0 && !(W.mode === 'stunned' && W.caught === l.id)) { l.state = 'sink'; l.t = LG.sink; ev.push({ t: 'ledgeSink', l }); }
    else if (l.state === 'sink' && l.t <= 0) { l.state = 'gone'; ev.push({ t: 'ledgeGone', l }); } }
  W.ledges = W.ledges.filter(l => l.state !== 'gone');
  const live = W.ledges.filter(l => l.state === 'rise' || l.state === 'up').length;
  W.ledgeT -= dt;
  if (live < keep && W.ledgeT <= 0) {
    /* A FAIR SPOT: whole tiles from the arena's left wall, clear of the walls, of anything the world says (the overhang, the gate), of the
       hero (never up under her feet) and of every other stone */
    const slots = [];
    for (let x0 = A.x0 + LG.edge; x0 + LG.w <= A.x1 - LG.edge; x0 += 16) { const x1 = x0 + LG.w, c = (x0 + x1) / 2;
      if (Math.abs(c - world.px) < LG.clear + LG.w / 2) continue;
      if ((A.avoid || []).some(([a, b]) => x1 > a && x0 < b)) continue;
      if (W.ledges.some(l => x1 + LG.apart > l.x0 && x0 - LG.apart < l.x1)) continue;
      slots.push(x0); }
    if (slots.length) { const x0 = slots[Math.floor(rnd() * slots.length) % slots.length], life = LG.life[0] + (LG.life[1] - LG.life[0]) * rnd();
      const l = { id: ++W.ledgeId, x0, x1: x0 + LG.w, state: 'rise', t: LG.rise, life }; W.ledges.push(l); W.ledgeT = LG.every; ev.push({ t: 'ledgeRise', l }); } }
  /* the longest stretch with no stone standing (a measure the checks read: never zero for long) */
  if (W.ledges.some(l => l.state === 'up')) W.noLedgeT = 0; else { W.noLedgeT += dt; W.noLedgeMax = Math.max(W.noLedgeMax, W.noLedgeT); }
}

/* one step. world = { px, py, pGround, rng? } -> events: [{ t: 'tell'|'hit'|'open'|'free'|'ward'|'warded'|'stormOn'|'pull'|'mode'|'turn'|
   'ledgeRise'|'ledgeUp'|'ledgeSink'|'ledgeGone', ... }] */
export function wormStep(W, world, dt) {
  const own = () => (W.seed = (W.seed * 16807) % 2147483647) / 2147483647;   /* no world dice: his own, so a Node run is the same every time */
  const rnd = world.rng || own;
  const ev = [], A = W.arena, clampX = x => Math.max(A.x0 + 24, Math.min(A.x1 - 24, x));
  if (!W.ledges) W.ledges = [];
  if (!W.phase2 && W.hp <= (W.maxHp || WORM.hp) * WORM.phase2)   /* of HIS maximum: the game scales a boss's health to the hero, and the machine is told it (main.js sets W.maxHp) */ { W.phase2 = true; ev.push({ t: 'stormOn' }); }
  const go = (mode, t, extra) => { W.mode = mode; W.t = t; ev.push({ t: 'mode', mode }); if (extra) Object.assign(W, extra); };
  const faceYou = () => { W.face = Math.sign(world.px - W.x) || W.face || 1; };
  if (W.mode !== 'lunge') W.y = A.floorY;   /* only the lunge leaves the sand: whatever else he is doing, he is at the floor */
  W.t -= dt;
  if (W.ward > 0) { W.ward = Math.max(0, W.ward - dt); if (W.ward === 0) ev.push({ t: 'wardEnd', x: W.x }); }
  ledgeStep(W, world, dt, ev, rnd);
  /* HE TURNS: up and not in a windup, a hero behind him for WORM.turn s has him round to face her (told: the 'turn' event - sand off him, a hiss) */
  if (TURNS.has(W.mode)) { const d = world.px - W.x; if (Math.abs(d) >= 6 && Math.sign(d) === -(W.face || 1)) { W.behindT += dt; if (W.behindT >= WORM.turn) { W.face = -(W.face || 1); W.behindT = 0; ev.push({ t: 'turn', x: W.x }); } } else W.behindT = 0; } else W.behindT = 0;
  /* THE CRASH's waves run on whatever he does next */
  if (!W.waves) W.waves = [];
  for (const w of W.waves) { w.x += w.v * dt; w.t -= dt; if (w.t > 0 && w.x > A.x0 && w.x < A.x1) ev.push({ t: 'hit', what: 'wave', mark: '!!', box: [w.x - WORM.waveR, w.x + WORM.waveR, A.floorY - WORM.waveH, A.floorY] }); }
  W.waves = W.waves.filter(w => w.t > 0 && w.x > A.x0 && w.x < A.x1);
  switch (W.mode) {
    case 'under': if (W.t <= 0) { const slot = W.i++ % WORM.CHAIN.length;
        if (slot === 0) { const o = WORM_MOVES.slice(); if (world.rng) for (let k = o.length - 1; k > 0; k--) { const j = Math.floor(rnd() * (k + 1)); [o[k], o[j]] = [o[j], o[k]]; } W.order = o; }
        const next = slot % 2 === 0 ? 'ripple' : ((W.order || WORM_MOVES)[(slot - 1) >> 1] || 'swallow');
        if (next === 'ripple') { W.ripples = [{ x: clampX(W.x), real: true, v: 0 }]; if (W.phase2) W.ripples.push({ x: clampX(world.px + (world.px < (A.x0 + A.x1) / 2 ? 140 : -140)), real: false, v: 0 });
          go('rippleTell', WORM.rippleTrack + WORM.rippleCommit); ev.push({ t: 'tell', what: 'ripple', mark: '!!' }); }
        else if (next === 'breath' || next === 'sweep') { go('surfaced', WORM.surfaced, { x: clampX(W.x), next }); faceYou(); }   // it comes up first: THE BREATH, THE LUNGE and THE TAIL start from the surface
        else if (next === 'lunge') { const s = world.px - A.x0 > A.x1 - world.px ? -1 : 1; go('surfaced', WORM.surfaced, { x: clampX(world.px + s * WORM.lungeFar), next }); faceYou(); }
        else { W.pit = { x: clampX(world.px) }; W.x = W.pit.x; go('swallowTell', WORM.swallowTell); ev.push({ t: 'tell', what: 'swallow', mark: '!!', x: W.pit.x }); } }
      break;
    case 'rippleTell': { const tracking = W.t > WORM.rippleCommit;
      for (const r of W.ripples) { if (tracking) { const d = world.px - r.x; r.v = Math.sign(d) * Math.min(Math.abs(d) / dt, WORM.rippleSpeed); r.commit = false; }
        else { if (!r.commit) { r.commit = true; r.tx = clampX(r.real ? world.px : r.x + Math.sign(r.v || 1) * 60); r.cs = Math.max(WORM.commitSpeed, Math.abs(r.tx - r.x) / (WORM.rippleCommit * 0.8)); } r.bulge = r.real;   /* at the commit only the real one bulges: the decoy is readable, late */
          const d = r.tx - r.x; r.v = Math.sign(d) * Math.min(Math.abs(d) / dt, r.cs); }   /* COMMITTED: it races to where you stood as it committed and ALWAYS bursts there - move now */
        r.x = clampX(r.x + r.v * dt); }
      const real = W.ripples.find(r => r.real); if (real) W.x = real.x;   /* the entity follows the real one, so its mark rides the ripple */
      if (W.t <= 0) { W.x = real.x; W.ripples = []; faceYou();
        /* THE OPENING: did it come up under a standing stone? In the ward, no: he shoulders up past it (told: 'warded') */
        const l = ledgeOver(W, W.x); W.caught = l && !(W.ward > 0) ? l.id : null;
        if (l && W.ward > 0) { W.wardBlocked++; ev.push({ t: 'warded', x: W.x }); }
        const top = W.caught ? A.floorY - (WORM.LEDGE.rows - 1) * 16 : A.floorY - WORM.breachH;   /* caught: the column stops at the stone's underside - a hero standing ON it is never reached */
        go('breach', WORM.breachT); ev.push({ t: 'hit', what: 'breach', mark: '!!', box: [W.x - WORM.breachR, W.x + WORM.breachR, top, A.floorY], ledge: W.caught }); }
      break; }
    case 'breach': if (W.t <= 0) {
        if (W.caught) { W.stuns++; go('stunned', WORM.stunned, { hitMult: WORM.stunMult }); ev.push({ t: 'open', x: W.x, ledge: W.caught }); }   /* his head on the stone: STUNNED */
        else { go('surfaced', WORM.surfaced, { next: 'breath' }); faceYou(); } }
      break;
    case 'stunned': if (W.t <= 0) { W.hitMult = 1;
        const l = W.ledges.find(q => q.id === W.caught); if (l && l.state === 'up') { l.state = 'sink'; l.t = WORM.LEDGE.sink; l.cracked = true; ev.push({ t: 'ledgeSink', l, cracked: true }); }   /* the stone he hit is cracked: it goes down */
        W.caught = null; W.ward = WORM.ward; ev.push({ t: 'free', x: W.x }); ev.push({ t: 'ward', x: W.x, t2: WORM.ward }); go('dive', WORM.dive); } break;
    case 'surfaced': if (W.t <= 0) { faceYou();   /* HE TURNS TO YOU AS HE MOVES, not before */
        if (W.next === 'lunge') { W.lungeFrom = W.x; W.lungeTo = Math.max(A.x0 + 48, Math.min(A.x1 - 48, world.px));   /* never into a corner: a hero against the wall must be able to stand clear of the shadow */ go('lungeTell', WORM.lungeTell); ev.push({ t: 'tell', what: 'lunge', mark: '!!', x: W.lungeTo }); }
        else if (W.next === 'sweep') {
          /* THE TAIL breaks the sand PAST you, on the far side from his head; against a wall it comes up at the wall (it still has to cross you) */
          const s = Math.sign(world.px - W.x) || W.face || 1; W.tailFrom = W.tailX = Math.max(A.x0 + 16, Math.min(A.x1 - 16, world.px + s * WORM.sweepFar));
          go('sweepTell', WORM.sweepTell); ev.push({ t: 'tell', what: 'sweep', mark: '!!', x: W.tailX }); }
        else { go('breathTell', WORM.breathTell, { breathFace: W.face, breathX: W.x }); ev.push({ t: 'tell', what: 'breath', mark: '!' }); } }
      break;
    case 'breathTell': if (W.t <= 0) go('breath', WORM.breath, { breathK: 0 }); break;   /* he drew it in facing you: the cone goes THAT way (it does not follow you round him) */
    case 'breath': { const el = WORM.breath - Math.max(0, W.t), k = Math.min(1, el / WORM.breathGrow); W.breathK = k; W.face = W.breathFace;
      const m = W.x + W.breathFace * 8, far = m + W.breathFace * WORM.breathReach * k;
      ev.push({ t: 'hit', what: 'breath', mark: '!', blockable: true, box: [Math.min(m, far), Math.max(m, far), A.floorY - WORM.breathH, A.floorY], from: W.x });
      if (W.t <= 0) { W.breathK = 0; go('dive', WORM.dive); } break; }
    case 'lungeTell': if (W.t <= 0) go('lunge', WORM.lunge); break;
    case 'lunge': { const k = 1 - Math.max(0, W.t) / WORM.lunge; W.x = W.lungeFrom + (W.lungeTo - W.lungeFrom) * k; W.y = A.floorY - Math.sin(k * Math.PI) * WORM.lungeH;
      if (k >= 0.5) ev.push({ t: 'hit', what: 'lunge', mark: '!!', box: [W.x - WORM.lungeR, W.x + WORM.lungeR, W.y - 24, W.y] });   /* THE HEAD COMING DOWN is the blow, onto the shadow */
      if (W.t <= 0) { W.y = A.floorY; go('dive', WORM.dive); W.waves.push({ x: W.x, v: WORM.waveV, t: WORM.waveT }, { x: W.x, v: -WORM.waveV, t: WORM.waveT }); } break; }   /* THE CRASH: two waves out of where he came down */
    case 'swallowTell': if (W.t <= 0) go('swallow', WORM.swallow); break;
    case 'swallow': { const d = world.px - W.pit.x;
      if (Math.abs(d) < WORM.swallowR && world.pGround) ev.push({ t: 'pull', toX: W.pit.x, v: WORM.swallowPull, quicksand: true });   /* the quicksand verb: jump, and keep jumping */
      if (W.t <= 0) { if (Math.abs(d) < WORM.biteR && world.pGround) ev.push({ t: 'hit', what: 'bite', mark: '!!', box: [W.pit.x - WORM.biteR, W.pit.x + WORM.biteR, A.floorY - 20, A.floorY] });
        W.x = W.pit.x; W.pit = null; go('surfaced', WORM.surfaced, { next: 'breath' }); faceYou(); } break; }
    case 'sweepTell': if (W.t <= 0) go('sweep', WORM.sweep); break;
    case 'sweep': case 'sweepBack': { const back = W.mode === 'sweepBack', k = 1 - Math.max(0, W.t) / (back ? WORM.sweepBack : WORM.sweep);   /* the tail scythes along the floor to his head, and whips back out */
      W.tailX = back ? W.x + (W.tailFrom - W.x) * k : W.tailFrom + (W.x - W.tailFrom) * k;
      ev.push({ t: 'hit', what: 'sweep', mark: '!!', box: [W.tailX - WORM.sweepR, W.tailX + WORM.sweepR, A.floorY - WORM.sweepH, A.floorY] });
      if (W.t <= 0) { if (back) { W.tailX = W.x; go('dive', WORM.dive); } else go('sweepBack', WORM.sweepBack); } break; }
    case 'dive': if (W.t <= 0) go('under', WORM.under + (world.rng ? (rnd() - 0.5) * WORM.underJitter : 0)); break;
  }
  return ev;
}
export function wormHurt(W, dmg) { const k = wormTake(W); if (!k) return 0; const d = dmg * k; W.hp = Math.max(0, W.hp - d); return d; }
