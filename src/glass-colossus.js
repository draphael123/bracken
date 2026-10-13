// src/glass-colossus.js - THE GLASS COLOSSUS, THE GLASS SEA's boss (claude/glasssea, the OPUS GREYBOX). Pure: no DOM, no main.js. The world, the
// drawing and the mirrors' turning are src/glass-colossus-hands.js; the bot that fights it is colPlan below (src/lab.js drives the keys).
//
// A PUZZLE BOSS (design standard B11): THE RULE PERSONIFIED. A giant of lightning-glass rooted in the steps at the edge of the sea, its feet fused
// into the glass it was made of. It focuses the sun: its SUN LANCE is the level's own beam turned on you. You climb its body to the cracks.
// THE SHARED READ (B10): OPEN = a gold ring on the weak point and a timer bar; WARDED = a pale glass shell over it and the word; a blow that does
// nothing CLANKS, flashes and says why (SHUT / GLAZED / WARDED). Never silent.
// LEGS ARE ALWAYS HITTABLE (B13): its knee cracks and heels take a hero's blow whole - from a purse per phase (COL.legPurse); spent, the cracks GLAZE
// over until the next phase (told) - the climb is how you reach the big weak points for most of its health.
//
// THE ARENA (COLOSSUS_STAGE, columns from the arena's west wall): 40 wide; it stands at column 20; its body's HOLDS are glass ledges either side (one-way
// tiles: the knee row F-3, the hip row F-6, the shoulder row F-9). Two SHELF-MIRRORS at 12 and 28 (E turns one: FACING THE GIANT / TO THE FIRE / TO THE
// SKY), a campfire at each wall (2, 37). The floor is plain (the slick glass floor is an open choice: it fought the read).
// THE PHASES (one new move each; each changes the arena):
//   P1 DUSK (100-55%): SUN LANCE (red X: a line along the ground to where it ends), STOMP (!!: a shard ring runs out both ways along the ground - jump it),
//      SHARD RAIN (!: marks where the glass falls). OPENING: bait the lance into a FACING mirror - it reflects into its chest and CRACKS it open
//      (COL.openT). NEW MOVE: THE SHAKE (told: HOLD! - a climber who does not grip (hold DOWN) is thrown off: a blow and the floor, never a death).
//   P2 NIGHT (55-25%): no lance (no reflection); the sky goes dark; THE CRACK LINE (new; claude/colossus3 - it replaced THE SWARM CALL: Daniel wants no
//      adds in this fight): its foot drives a crack along the floor to you - amber, told - and glass spikes erupt along it (jump, or step off the line)
//      unless FIRELIGHT holds its crack: a mirror turned TO THE FIRE throws the campfire's light along the floor onto the crack. Held, it strains and its
//      SHOULDER CRACKS BLAZE OPEN - climb, and strike or PLUNGE them.
//   P3 DAWN (25-0%): the sun returns and so does the lance (the chest again). NEW: a mirror turned TO THE SKY catches the dawn and burns its CROWN -
//      DAZZLED, the last opening. DESPERATION: THE SHARD WAVE (!!: rolled across the whole floor - jump it).
// B3: every opening ends in a TOLD COL.wardT s ward (immune), then it KNOCKS THE MIRROR that opened it back round to FACING (no chain-lock: each
// opening wants a fresh TURN). B12: no lance and no crack line for COL.lockT s after a ward. B4: open, it stands still.
/* (claude/colossusrework, Daniel 10-13: "he should MOVE AROUND a little (slowly), and the ARENA can be bigger so the mirrors still affect him") the arena is 64 wide
   (was 40); THREE STATIONS (16, 32, 48 - he wakes on the middle one) and FOUR shelf-mirrors (8, 24, 40, 56: two more), each with its own brazier on its outer side
   (6, 22, 42, 58 - index-aligned with the mirrors: a mirror TO THE FIRE throws ITS brazier's light). From any station the mirror either side of him (8 tiles off)
   is his FLANK: the firelight and the dawn reach him only from a flanking mirror; the lance runs out to the first FACING mirror on its side, however far */
export const COLOSSUS_STAGE = { W: 64, cc: 32, stations: [16, 32, 48], mirrors: [8, 24, 40, 56], fires: [6, 22, 42, 58], knee: 3, hip: 6, shoulder: 9, crown: 12,
  kneeW: [-5, -3], kneeE: [2, 4], hipW: [-4, -2], hipE: [1, 3], shoulderW: [-5, -2], shoulderE: [1, 4], crack: [-3, 2] };
export const COL = {
  /* (claude/glasssea2, Daniel 10-07: "a third of the health, quicker tells, two more told attacks") hp 2000 -> 680, every tell ~15% quicker, the gaps shorter;
     an opening may take a fifth of it (openCap 0.09 -> 0.2: the same few hits, on a smaller bar) */
  hp: 680, w: 72, h: 200,
  /* (claude/colossus3, Daniel 10-07 after playing it: "the laser A LOT SLOWER") the windup ~1.7x longer, and the lance no longer lands along the whole line at once:
     a BOLT of light (lanceLen px) TRAVELS out from its chest at lanceV px/s to the mirror or the wall - you see it come, and jump it as it passes */
  lanceTell: 1.65, lanceTell3: 1.45, lanceV: 190, lanceLen: 56, lanceDmg: 124, lanceBand: [28, 4],
  stompTell: 0.72, stompV: 240, stompH: 14, stompDmg: 108,
  shardTell: 0.85, shardAct: 0.25, shardDmg: 74, shardR: 9, shardSpread: 60,
  shakeTell: 0.85, shake: 0.9, shakeDmg: 36, shakeAfter: 1.2, shakeCd: 5,
  /* NEW P2 (claude/colossus3, Daniel 10-07: "no add summoning" - the swarm call is gone from the fight): THE CRACK LINE (!!) - an amber glow runs along the
     floor from its foot to where you stand (and a little past); then glass spikes erupt along it, foot first, the front running out at crackV px/s (a spike
     bites for crackHot s as it rises). Jump it, or step off the line (past its end, or up on a hold). FIRELIGHT on its crack as they finish HOLDS it:
     its SHOULDERS BLAZE once the spikes are done (the phase's opening, as the swarm's was): dodge the line, then climb */
  crackTell: 1.15, crackV: 260, crackHot: 0.22, crackH: 22, crackDmg: 92, crackFoot: 30, crackOver: 30, crackMin: 48,
  waveTell: 0.85, waveV: 260, waveH: 16, waveDmg: 92,
  /* NEW P1: THE SHARD SWEEP (!!) - its arm reaches out to the wall on your side and drags back along the floor to its feet: jump it, or be up on a hold */
  sweepTell: 0.75, sweepV: 380, sweepH: 18, sweepDmg: 92, sweepIn: 40,
  /* NEW P2: THE GLASS QUAKE (!!) - the floor plates under you and either side heave up (marked), then lie as slick tilted shards that slide you outward */
  quakeTell: 0.9, quakeAct: 0.35, quakeDmg: 82, quakeW: 20, quakeH: 24, quakeSpread: 76, quakeSlick: 3.0, quakePush: 70,
  /* (claude/colossusrework tune, Daniel 10-13 "he is a little easy": every blow ~70% harder - stomp 60->108, shards 37->74, crack 52->92, wave 53->92, sweep 47->92, quake 45->82, lance 92->124, shake 29->36 (the human bot with the kit took ~45% of its pool and won 17/18) -
     and an opening may take 13% (was 10%): sixty-four tiles and the walk made the fight long, the warden timed out in phase two) */
  openT: 5.2, openShoulders: 5.6, openCrown: 5.4, openMul: 2.0, plungeMul: 2.4, openCap: 0.13,
  legPurse: [0.1, 0.06, 0.05], legMul: 1.0,
  wardT: 3.0, lockT: 1.5, phase2: 0.55, phase3: 0.25, phaseT: 2.2,
  gap: [0.3, 0.27, 0.22],   /* (claude/colossusrework tune: was 0.45/0.4/0.32 - the wider arena and the walk gave the time back) */
  /* (claude/colossusrework, Daniel 10-13: "he should MOVE AROUND a little (slowly)") HE WALKS between his stations: told (walkTell - his weight goes back, IT STRIDES,
     the ground shakes), then a slow stride (walkV px/s) to the next station, a footfall every strideT s (the step sound, a shake, and THE TRAMPLE under the landing
     foot: a small red bite, told by the lifted foot and its mark - step out of his path). His holds go with him (a climber rides) */
  walkTell: 0.9, walkV: 54, strideT: 0.6, trampleW: 16, trampleH: 14, trampleDmg: 40, footOut: 28,
  /* NEW (P1, P3; claude/colossusrework, Daniel 10-13: "~two more attacks"): THE GAZE (!!) - his eyes burn and the gaze sweeps the floor from the far wall to your side:
     BREAK HIS LINE OF SIGHT - stand in a mirror's SHADE (drawn behind every disc during the tell), behind a mirror FACING him (it catches the gaze: all beyond it is dark),
     or up on his hips / shoulders (under his chin). gazeV px/s; the shade behind a disc runs shadeMin + shadeK x its distance from him (max shadeMax) */
  gazeTell: 1.15, gazeV: 300, gazeW: 12, gazeDmg: 90, shadeMin: 30, shadeK: 0.26, shadeMax: 92,
  /* NEW (P2, P3): THE SHARD LUNGE (!, yellow - block or parry it): he draws a glass spear and drives it at the MIRROR nearest you (or at you, with none near): the
     marked ground round it erupts and the mirror is speared round to the wrong notch (P1 sky, P2 facing, P3 fire). Step off the mirror, or block */
  lungeTell: 0.95, lungeAct: 0.35, lungeW: 34, lungeH: 44, lungeDmg: 84, lungeReach: 440, lungeNear: 80,
  chain: { 1: ['lance', 'stomp', 'gaze', 'sweep', 'shards', 'walk', 'lance', 'sweep', 'gaze', 'shards', 'stomp', 'walk'], 2: ['crack', 'quake', 'lunge', 'shards', 'walk', 'crack', 'stomp', 'lunge', 'quake', 'walk'],
    3: ['lance', 'gaze', 'lunge', 'wave', 'walk', 'sweep', 'lance', 'shards', 'lunge', 'quake', 'gaze', 'walk'] },
};
/* THE STAGE: carve the arena into the level (the level lays the floor and the walls); returns { arena, carve } */
export function stageColossus(Wr, T, TS, sx, F) {
  const S = COLOSSUS_STAGE, cc = sx + S.cc, holds = [];   /* (claude/colossusrework) the hold cells laid at his first station: the level marks them machineCells (no posts) */
  const carve = () => {
    const led = (a, b, row) => { for (let x = cc + a; x <= cc + b; x++) { Wr.set(x, F - row, T.ONEWAY); holds.push([x, F - row]); } };
    led(...S.kneeW, S.knee); led(...S.kneeE, S.knee); led(...S.hipW, S.hip); led(...S.hipE, S.hip); led(...S.shoulderW, S.shoulder); led(...S.shoulderE, S.shoulder);
    Wr.ent('colossus', S.cc + sx, F - 1, { face: -1 });
    for (const m of S.mirrors) Wr.ent('colmirror', sx + m, F - 1, {});
    for (const f of S.fires) Wr.ent('gscampfire', sx + f, F - 1, { id: 'arena' + f, arena: true });
  };
  const arena = { x0: sx * TS, x1: (sx + S.W) * TS, floor: F * TS, trigger: (sx + 4) * TS, wallL: sx - 1, wallR: sx + S.W, boss: 'colossus', music: 'colossus',
    tint: '#9ad0e8', tintA: 0.06, start: [sx + 6, F - 1], colossus: { sx, F } };
  return { arena, carve, holds };
}
/* the arena in world px */
export function geom(A, TS = 16) {
  const q = A.colossus, S = COLOSSUS_STAGE, sx = q.sx, F = q.F, px = c => c * TS;
  const G = { x0: px(sx), x1: px(sx + S.W), floor: F * TS, F, sx, TS, stations: S.stations.map(c => px(sx + c)),
    mirrors: S.mirrors.map((m, i) => ({ i, x: px(sx + m) + 8 })), fires: S.fires.map(f => px(sx + f) + 8),
    kneeY: (F - S.knee) * TS, hipY: (F - S.hip) * TS, shoulderY: (F - S.shoulder) * TS, crownY: (F - S.crown) * TS };
  seat(G, sx + S.cc); return G;
}
/* (claude/colossusrework) WHERE HE STANDS: his holds (one-way tiles), the crack under him and his centre line, from the column he stands on. While he walks his
   centre (G.cx) glides with him and his holds are re-seated a whole column at a time (src/glass-colossus-hands.js reseat moves the tiles: drawn = solid) */
export function seat(G, col, cx) {
  const S = COLOSSUS_STAGE, TS = G.TS, F = G.F, px = c => c * TS, ledge = ([a, b], row) => ({ l: px(col + a), r: px(col + b + 1), y: (F - row) * TS });
  G.col = col; G.cx = cx ?? px(col);
  G.knee = [ledge(S.kneeW, S.knee), ledge(S.kneeE, S.knee)]; G.hip = [ledge(S.hipW, S.hip), ledge(S.hipE, S.hip)]; G.shoulder = [ledge(S.shoulderW, S.shoulder), ledge(S.shoulderE, S.shoulder)];
  G.crack = [px(col + S.crack[0]), px(col + S.crack[1] + 1)]; return G;
}
/* every hold cell [x, y] (tiles) a seat lays: the stage's carve and the hands' reseat share it */
export function holdCells(G) { const out = []; for (const l of [...G.knee, ...G.hip, ...G.shoulder]) for (let x = Math.round(l.l / G.TS); x < Math.round(l.r / G.TS); x++) out.push([x, Math.round(l.y / G.TS)]); return out; }
/* HIS FLANK: the nearest mirror on each side of him - the only ones whose firelight (night) or dawn (P3) reaches him. [west, east] (either may be null) */
export function flank(S) { const cx = S.G.cx; let w = null, e = null; for (const m of S.mirrors) { if (m.x < cx && (!w || m.x > w.x)) w = m; if (m.x > cx && (!e || m.x < e.x)) e = m; } return [w, e]; }
/* WHERE A BLOW LANDS on it, by the striker's feet: the floor (and a jump off it) = the LEGS; the hip holds = the CHEST; the shoulders and up = SHOULDERS / CROWN */
export function zoneOf(G, footY) { if (footY > G.floor - 2.5 * G.TS) return 'legs'; if (footY > G.floor - 7.5 * G.TS) return 'chest'; return 'top'; }
/* on its body's holds (the hip or the shoulder row, over its body): the SHAKE throws a climber who does not grip */
export function onBody(G, x, y, ground) { if (!ground) return false; for (const l of [...G.hip, ...G.shoulder]) if (Math.abs(y - l.y) < 3 && x >= l.l - 2 && x <= l.r + 2) return true; return false; }
export const colOpen = e => !!e && (e.open || 0) > 0 && ['cracked', 'blazing', 'dazzled'].includes(e.mode);

export function newFight(G) {
  return { G, ph: 1, i: 0, cd: 1.4, t: 0, ward: 0, lock: 0, phaseT: 0, legPurse: COL.legPurse[0], openTaken: 0, opened: null, by: null,
    lance: null, rings: [], marks: [], wave: null, sweep: null, plates: [], slick: [], crack: null, held: false, shakeCd: 2, bodyT: new Map(), cracks: 0, pose: POSE0(),
    st: G.stations.indexOf(G.cx) < 0 ? 1 : G.stations.indexOf(G.cx), walk: null, gaze: null, lunge: null,   /* (claude/colossusrework) his station, the walk, the gaze, the lunge */
    /* (claude/glasssea2, Daniel: "make the mirror read VERY clear") the shelf-mirrors start TO THE SKY: the first thing the fight asks is the verb - TURN THE MIRROR TO HIM */
    mirrors: G.mirrors.map(m => ({ ...m, notch: 'sky' })), n: { walk: 0, steps: 0, trample: 0, gaze: 0, gazeHit: 0, caught: 0, shaded: 0, lunge: 0, speared: 0, lance: 0, reflect: 0, stomp: 0, shards: 0, shake: 0, thrown: 0, crack: 0, held: 0, dazzle: 0, wave: 0, sweep: 0, quake: 0, slid: 0, opens: 0, warded: 0, shut: 0, glazed: 0, leg: 0 },
    told: {}, said: {} };
}
const NOTCH = ['face', 'fire', 'sky'];
export const STALL_LINE = { 1: 'TURN THE MIRROR TO HIM', 2: 'TURN A MIRROR TO THE FIRE: ITS LIGHT HOLDS THE CRACK', 3: 'TURN A MIRROR TO THE SKY, OR TO FACE ITS LANCE' };
export const MIRROR_LINE = 'TURN THE MIRROR TO HIM: HIS LANCE COMES BACK INTO HIS CHEST';
/* ---------- THE POSE CLOCK (claude/glasssea2; the COLOSSUS ART lane draws its parts to these keys) ----------
   poseOf(e, S, t) -> { key, lean, bob, footL, footR, armL: [dx, dy], armR: [dx, dy] }   (px; lean + = toward +x; bob + = down; foot = lift up; arm dx + = outward)
   keys: idle (a weight shift: lean +-3, the free foot lifts 3-4, the arms sway +-2, a 1 px bob), lanceWind, lanceFire, stompRaise, stompDown, sweepWind, sweep,
   shardShrug, quakeRaise, quakeSlam, crackWind, crackDrive (claude/colossus3: they replace swarmCall), shake, waveRoll, phase, stagger (open: slumped, a tremble
   of 1 px or less - B4), sleep, wake */
export const POSE_KEYS = ['walkWind', 'walkStride', 'gazeWind', 'gazeSweep', 'lungeWind', 'lungeThrust', 'idle', 'lanceWind', 'lanceFire', 'stompRaise', 'stompDown', 'sweepWind', 'sweep', 'shardShrug', 'quakeRaise', 'quakeSlam', 'crackWind', 'crackDrive', 'shake', 'waveRoll', 'phase', 'stagger', 'sleep', 'wake'];
function POSE0() { return { key: 'sleep', lean: 0, bob: 0, footL: 0, footR: 0, armL: [0, 0], armR: [0, 0], swL: 0, swR: 0, fdL: 0, fdR: 0, glow: 0, sun: 0, eye: 1 }; }
/* (claude/colossus3 ART lane) THE POSE CLOCK is smooth now: every value is a float eased through the tell/act (the art rounds at draw), and a pose adds art-only fields:
   swL/swR = an arm sheared outward from the shoulder (px at the fist: a reach without pulling the arm off its shoulder hold), fdL/fdR = a foot's sole slid OUTWARD (px, + = away from the centre line),
   glow = a body-wide surge 0..1, sun = the lance's charge in the chest 0..1, eye = how lit its eyes are. NOTHING here is read by the fight: pure drawing, no timing. */
const c01 = x => x < 0 ? 0 : x > 1 ? 1 : x, sst = x => { x = c01(x); return x * x * (3 - 2 * x); }, eoc = x => 1 - Math.pow(1 - c01(x), 3), ebk = x => { x = c01(x) - 1; return 1 + 2.7 * x * x * x + 1.7 * x * x; };
export function poseOf(e, S, t) {
  const p = POSE0(), face = e.face || -1, side = (d, v) => { if (d < 0) p.armL = v; else p.armR = v; }, sw = (d, v) => { if (d < 0) p.swL = v; else p.swR = v; }, ft = (d, v) => { if (d < 0) p.footL = v; else p.footR = v; }, fdx = (d, v) => { if (d < 0) p.fdL = v; else p.fdR = v; };
  const k = n => c01(1 - (e.modeT || 0) / n), ea = n => Math.max(0, n - (e.modeT || 0));   /* k: how far through a tell; ea: how long an act has run */
  switch (e.mode) {
    case 'sleep': p.key = 'sleep'; p.bob = 2 + 0.35 * Math.sin(t * 1.3); p.armL = [0, 3]; p.armR = [0, 3]; p.eye = 0; p.glow = 0.05; break;   /* a slow breath in its sleep */
    case 'wake': { const q = k(1.6); p.key = 'wake'; p.bob = 2 * (1 - ebk(q)); p.armL = [2 - 3 * sst(q), -4 * ebk(q)]; p.armR = p.armL.slice(); p.swL = p.swR = 5 * Math.sin(q * Math.PI); p.lean = 1.6 * (1 - q) * Math.sin(q * 34); p.eye = c01((q - 0.3) / 0.35); p.glow = sst(q); break; }
    case 'lanceTell': { const q = k(S.ph === 3 ? COL.lanceTell3 : COL.lanceTell), dip = q < 0.14 ? Math.sin(q / 0.14 * Math.PI) * 1.8 : 0, tr = q > 0.6 ? Math.sin(t * 62) * 0.55 * (q - 0.6) / 0.4 : 0;   /* a dip, then the long lean back while the sun fills its chest */
      p.key = 'lanceWind'; p.lean = -face * (1 + 4.2 * sst(q)) + tr; p.bob = dip - 1.2 * sst(q); p.armL = [3 - 7 * sst(q), -5 - 10 * sst(q)]; p.armR = p.armL.slice(); p.swL = p.swR = -3 * sst(q); p.sun = q; p.glow = q * q; break; }
    case 'lance': { const a = ea(9), f = Math.exp(-a * 3.2);   /* the snap forward as it fires, a spring back, the light fading out of the chest while the bolt runs */
      p.key = 'lanceFire'; p.lean = face * (1.4 + 3.3 * f * Math.cos(a * 6)); p.bob = 1.2 * f; p.armL = [-2 + 7 * f, 2 - 2 * f]; p.armR = p.armL.slice(); p.swL = p.swR = 4 * f; p.sun = Math.exp(-a * 2.2); p.glow = Math.exp(-a * 1.6); break; }
    case 'stompTell': { const q = k(COL.stompTell); p.key = 'stompRaise'; p.lean = -face * (1 + 3.2 * sst(q)); p.bob = q < 0.12 ? 1.2 * Math.sin(q / 0.12 * Math.PI) : 0.9 * sst(q);
      ft(face, 4 + 8 * eoc(q / 0.8) + (q > 0.82 ? Math.sin(t * 55) * 0.4 : 0)); fdx(face, -2.2 * sst(q)); p.armL = [4, -3 - 5 * sst(q)]; p.armR = p.armL.slice(); p.swL = p.swR = 2 * sst(q); break; }
    case 'stomp': { const a = ea(0.3), f = Math.exp(-a * 7); p.key = 'stompDown'; p.bob = 3.2 * Math.exp(-a * 6) * Math.cos(a * 17); p.lean = face * 2.2 * Math.exp(-a * 5); p.armL = [2, 2 + 3 * f]; p.armR = p.armL.slice(); ft(-face, 1.4 * f); break; }   /* the other heel hops with the shock */
    case 'sweepTell': { const d = S.sweep ? S.sweep.dir : face, q = k(COL.sweepTell); p.key = 'sweepWind'; p.lean = -d * (1 + 3 * sst(q)); p.bob = q < 0.15 ? Math.sin(q / 0.15 * Math.PI) * 1.2 : 0;
      side(d, [2 + 6 * sst(q), -18 * sst(q)]); sw(d, 14 * sst(q)); side(-d, [-1 * sst(q), 1 + sst(q)]); sw(-d, -2 * sst(q)); break; }
    case 'sweep': { const d = S.sweep ? S.sweep.dir : face, G = S.G, wall = d < 0 ? G.x0 + 6 : G.x1 - 6, to = G.cx + d * COL.sweepIn, pr = S.sweep ? c01(1 - Math.abs(S.sweep.x - to) / Math.max(1, Math.abs(wall - to))) : 1;   /* the arm drags in: it reaches far at first and is hauled to its side */
      p.key = 'sweep'; p.lean = d * (1 + 3 * sst(pr)); p.bob = 1 + pr; side(d, [4, 4]); sw(d, 18 - 14 * sst(pr)); side(-d, [-1, 1]); sw(-d, -3 * sst(pr)); break; }
    case 'shardTell': { const q = k(COL.shardTell), up = sst((q - 0.18) / 0.5); p.key = 'shardShrug'; p.bob = q < 0.18 ? 1.5 * Math.sin(q / 0.18 * Math.PI / 2) : 1.5 - 4 * up; p.armL = [3 + 2 * up, -2 - 6 * up]; p.armR = p.armL.slice(); p.swL = p.swR = 2 * up; p.lean = q > 0.7 ? Math.sin(t * 50) * 0.5 : 0; break; }
    case 'shards': { const a = ea(COL.shardAct), f = Math.exp(-a * 9); p.key = 'shardShrug'; p.bob = 2.6 * f; p.armL = [3, -6 + 9 * (1 - Math.exp(-a * 14))]; p.armR = p.armL.slice(); p.swL = p.swR = 1; break; }
    case 'quakeTell': { const q = k(COL.quakeTell), lift = sst((q - 0.2) / 0.8); p.key = 'quakeRaise'; p.bob = q < 0.3 ? 2.5 * sst(q / 0.3) : 2.5 - 4.5 * sst((q - 0.3) / 0.7); p.armL = [2 + 4 * sst(q), 2 * (1 - sst(q / 0.4)) - 20 * lift]; p.armR = p.armL.slice(); p.swL = p.swR = 3 * lift; p.lean = q > 0.8 ? Math.sin(t * 58) * 0.6 : 0; p.glow = lift; break; }
    case 'quake': { const a = ea(COL.quakeAct); p.key = 'quakeSlam'; p.bob = 3.6 * Math.exp(-a * 7) * Math.cos(a * 12); p.armL = [3, 8 * Math.exp(-a * 5)]; p.armR = p.armL.slice(); p.swL = p.swR = -2 * Math.exp(-a * 6); break; }
    /* (claude/colossus3) THE CRACK LINE: the foot on your side lifts and GRINDS (3 -> 10 px), the fist on that side drawn down, the other arm up, leaning back; then the foot drives down and it leans in along the line */
    case 'crackTell': { const d = S.crack ? S.crack.dir : face, q = k(COL.crackTell); p.key = 'crackWind'; p.lean = -d * (1 + 1.5 * sst(q)); p.bob = 0.9 * sst(q); ft(d, 3 + 7 * sst(q)); fdx(d, Math.sin(t * 14) * (2.4 * (1 - sst(q)) + 0.5));
      side(d, [3, 6]); sw(d, 2 * sst(q)); side(-d, [2, -3 - 4 * sst(q)]); sw(-d, 3 * sst(q)); p.glow = q * 0.6; break; }
    case 'crack': { const d = S.crack ? S.crack.dir : face, a = ea(9), f = Math.exp(-a * 8); p.key = 'crackDrive'; p.lean = d * (2.2 + 1.3 * Math.exp(-a * 5)); p.bob = 2 + 1.4 * f; side(d, [6, 8]); sw(d, 5 + 3 * f); side(-d, [1, 1]); sw(-d, -2); p.glow = 0.5 * Math.exp(-a * 1.2); break; }
    case 'shakeTell': { const q = k(COL.shakeTell); p.key = 'shake'; p.lean = Math.sin(t * 14) * (0.6 + 2.2 * q); p.bob = 0.9 * q + (q < 0.15 ? 1 : 0); p.armL = [4 + 2 * q, -2]; p.armR = p.armL.slice(); p.swL = Math.sin(t * 14) * 2 * q; p.swR = -p.swL; p.glow = q; break; }
    case 'shake': p.key = 'shake'; p.lean = Math.sin(t * 40) * 3; p.bob = Math.sin(t * 53) * 1; p.armL = [6, -2]; p.armR = [6, -2]; p.swL = Math.sin(t * 40 + 1) * 3; p.swR = Math.sin(t * 40 + 2.5) * 3; p.footL = Math.max(0, Math.sin(t * 20)) * 1.6; p.footR = Math.max(0, -Math.sin(t * 20)) * 1.6; p.glow = 0.7; break;
    case 'waveTell': { const q = k(COL.waveTell), wd = S.waveDir || 1; p.key = 'waveRoll'; p.bob = 2.6 * sst(q); p.lean = -wd * 2 * sst(q); p.armL = [6 + 4 * sst(q), 2 + 2 * sst(q)]; p.armR = p.armL.slice(); p.swL = p.swR = -4 * sst(q); break; }
    case 'wave': { const a = ea(0.4), wd = S.waveDir || 1, f = Math.exp(-a * 6); p.key = 'waveRoll'; p.bob = 2.6 * f; p.lean = wd * 2 * (1 - f); p.armL = [6, 4]; p.armR = [6, 4]; p.swL = p.swR = 10 * f - 2; break; }
    case 'phase': { const c = c01(1 - (e.modeT || 0) / COL.phaseT), up = sst((c - 0.12) / 0.3); p.key = 'phase'; p.bob = c < 0.12 ? 1.2 * Math.sin(c / 0.12 * Math.PI / 2) : 1.2 - 3.2 * up; p.armL = [3 + 11 * up, -8 - 6 * up]; p.armR = p.armL.slice(); p.swL = p.swR = 6 * up; p.lean = Math.sin(t * 30) * 1.2 * Math.sin(c * Math.PI); p.glow = Math.sin(c * Math.PI); break; }
    /* (claude/colossusrework, B16: each its OWN windup + release) THE WALK: the weight rocks back onto the trailing heel, the lead foot lifts (walkWind); then the stride -
       the lead foot swings up and plants every strideT, the trunk leans into the way it goes, the arms swing against the legs (walkStride) */
    case 'walkTell': { const d = S.walk ? S.walk.dir : face, q = k(COL.walkTell); p.key = 'walkWind'; p.lean = -d * (1 + 2.6 * sst(q)); p.bob = 1.6 * sst(q); ft(d, 2 + 6 * sst(q)); fdx(d, 2 * sst(q));
      side(d, [3, -5 * sst(q)]); side(-d, [1, 2 + sst(q)]); sw(d, 2 * sst(q)); p.glow = 0.2 * q; break; }
    case 'walk': { const W = S.walk, d = W ? W.dir : face, u = W ? c01(1 - W.stepT / COL.strideT) : 0, lead = W && W.n % 2 ? -d : d, lift = 9 * Math.sin(u * Math.PI);
      p.key = 'walkStride'; p.lean = d * (2 + 1.2 * Math.sin(u * Math.PI)); p.bob = u > 0.85 ? 2.5 * (u - 0.85) / 0.15 : 0.6; ft(lead, lift); fdx(lead, 3 * Math.sin(u * Math.PI)); side(lead, [2, 3 * Math.sin(u * Math.PI)]); side(-lead, [2, -3 * Math.sin(u * Math.PI)]); sw(lead, -2); sw(-lead, 3); p.glow = 0.15; break; }
    /* THE GAZE: the head draws back and up, the arms brace low, the eyes flare (gazeWind); the sweep: the trunk turns with the burning spot (gazeSweep) */
    case 'gazeTell': { const q = k(COL.gazeTell); p.key = 'gazeWind'; p.lean = -face * (1 + 2.2 * sst(q)); p.bob = -1.8 * sst(q); p.armL = [4, 3 + 3 * sst(q)]; p.armR = p.armL.slice(); p.swL = p.swR = -3 * sst(q); p.eye = 1; p.glow = 0.3 + 0.6 * q; break; }
    case 'gaze': { const Z = S.gaze, ld = Z ? Math.max(-1, Math.min(1, (Z.x - e.x) / 140)) : 0; p.key = 'gazeSweep'; p.lean = 3.6 * ld; p.bob = -1.2; p.armL = [5, 4]; p.armR = [5, 4]; p.swL = p.swR = -2; p.eye = 1; p.glow = 0.85; break; }
    /* THE SHARD LUNGE: the spear arm drawn far back and up, the trunk coiled away (lungeWind); then the thrust - lean in hard, the arm driven out along the floor (lungeThrust) */
    case 'lungeTell': { const d = S.lunge ? Math.sign(S.lunge.x - e.x) || face : face, q = k(COL.lungeTell); p.key = 'lungeWind'; p.lean = -d * (1 + 3.6 * sst(q)); p.bob = 1.2 * sst(q);
      side(d, [-2 - 4 * sst(q), -10 - 12 * sst(q)]); sw(d, -6 * sst(q)); side(-d, [3, -2]); ft(-d, 2.5 * sst(q)); p.glow = 0.3 * q; break; }
    case 'lunge': { const d = S.lunge ? Math.sign(S.lunge.x - e.x) || face : face, a = ea(COL.lungeAct), f = Math.exp(-a * 6); p.key = 'lungeThrust'; p.lean = d * (3 + 3 * f); p.bob = 2 * f;
      side(d, [8, 6]); sw(d, 8 + 20 * f); side(-d, [-1, 1]); sw(-d, -2); ft(d, 1.5 * f); p.glow = 0.4 * f; break; }
    case 'cracked': case 'blazing': case 'dazzled': p.key = 'stagger'; p.bob = 3 + 0.3 * Math.sin(t * 17); p.armL = [1, 4]; p.armR = [1, 4]; p.lean = Math.sin(t * 31) * 0.6; break;   /* B4: it stands its ground - a tremble, no more */
    default: { /* IDLE: the weight shift - the slow clock a giant breathes on (3.2 s): it leans onto one foot, lifts the other (the toe slides out), its arms swing a little against it, and it breathes */
      const w = Math.sin(t * Math.PI * 2 / 3.2), br = Math.sin(t * Math.PI * 2 / 2.4);
      p.key = 'idle'; p.lean = 3 * w; p.bob = 0.55 + 0.45 * br; p.footL = 4 * sst((-w - 0.45) / 0.55); p.footR = 4 * sst((w - 0.45) / 0.55); p.fdL = 1.6 * sst((-w - 0.45) / 0.55); p.fdR = 1.6 * sst((w - 0.45) / 0.55);
      p.armL = [0, 2 * w + 0.4 * br]; p.armR = [0, -2 * w + 0.4 * br]; p.swL = 1.2 * w; p.swR = -1.2 * w; p.glow = 0.12 + 0.1 * br; }
  }
  return p;
}
export const NOTCH_WORD = { face: 'FACING THE GIANT', fire: 'TO THE FIRE', sky: 'TO THE SKY' };
/* E at a mirror: the next notch. Returns the new notch */
export function turnMirror(S, i) { const m = S.mirrors[i]; m.notch = NOTCH[(NOTCH.indexOf(m.notch) + 1) % 3]; m.turnedT = 0; return m.notch; }
/* the lance's end on its side: the first FACING mirror between it and the wall, or the wall */
export function lanceEnd(S, dir) {
  const G = S.G, ms = S.mirrors.filter(m => m.notch === 'face' && Math.sign(m.x - G.cx) === dir).sort((a, b) => Math.abs(a.x - G.cx) - Math.abs(b.x - G.cx));
  return ms.length ? { x: ms[0].x, mirror: ms[0].i } : { x: dir < 0 ? G.x0 + 4 : G.x1 - 4, mirror: -1 };
}
/* the firelight relay in phase two: a mirror TO THE FIRE throws the campfire behind it along the floor inward, to the crack under it */
export const relaying = S => flank(S).some(m => m && m.notch === 'fire');   /* (claude/colossusrework) only a FLANKING mirror's firelight reaches his crack */
/* THE GAZE's line of sight (claude/colossusrework): is floor point x lit by his eyes? Dark behind a mirror FACING him (it catches the gaze) and in a disc's shade */
export const shadeLen = (S, m) => Math.max(COL.shadeMin, Math.min(COL.shadeMax, COL.shadeMin + COL.shadeK * Math.abs(m.x - S.G.cx)));
export function gazeBlock(S, x) { const ex = S.G.cx, d = x - ex, s = Math.sign(d); let by = null;
  for (const m of S.mirrors) { const dm = m.x - ex; if (Math.sign(dm) !== s || Math.abs(dm) < 20) continue; const past = Math.abs(d) - Math.abs(dm);
    if (m.notch === 'face' && past > -6) return { m, how: 'caught' }; if (past > -6 && past <= shadeLen(S, m)) by = { m, how: 'shade' }; }
  return by; }
/* the nearest dark floor for a hero at x: [{ x, how }] candidates (behind a FACING mirror, or in a disc's shade), nearest first */
export function gazeSafe(S, x) { const ex = S.G.cx, G = S.G, out = [];
  for (const m of S.mirrors) { const s = Math.sign(m.x - ex); if (!s || Math.abs(m.x - ex) < 20) continue; const t = m.notch === 'face' ? m.x + s * 22 : m.x + s * Math.min(shadeLen(S, m) - 8, 22);
    if (t > G.x0 + 8 && t < G.x1 - 8) out.push({ x: t, how: m.notch === 'face' ? 'caught' : 'shade', m: m.i }); }
  return out.sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x)); }
/* THE LUNGE's mark: the mirror nearest the hero (within lungeNear of him and lungeReach of the giant), or the hero himself */
export function lungeTarget(S, h, face) { const G = S.G; if (!h) return { x: Math.max(G.x0 + 40, Math.min(G.x1 - 40, G.cx + face * 120)), mirror: -1 };
  const ms = S.mirrors.filter(m => Math.abs(m.x - h.x) <= COL.lungeNear && Math.abs(m.x - G.cx) <= COL.lungeReach && Math.abs(m.x - G.cx) >= 40).sort((a, b) => Math.abs(a.x - h.x) - Math.abs(b.x - h.x));
  return ms.length ? { x: ms[0].x, mirror: ms[0].i } : { x: Math.max(G.x0 + 20, Math.min(G.x1 - 20, h.x)), mirror: -1 }; }
/* THE WALK's next station: a neighbour, toward the nearest hero's side (from an end station, inward) */
export function nextStation(S, h, face) { const n = S.G.stations.length, d = h ? (Math.sign(h.x - S.G.cx) || face) : face; let to = S.st + d; if (to < 0 || to >= n) to = S.st - d; return to >= 0 && to < n && to !== S.st ? to : null; }
const beginOpen = (e, S, what, t, by, c) => { e.mode = what; e.open = t; e.openT0 = t; S.openTaken = 0; S.opened = what; S.by = by; S.lance = null; S.n.opens++; c.sound && c.sound('open'); c.fx && c.fx('open', e.x, e.y); };

/* ---------- ONE FRAME ---------- heroes: [{ x, y, ground, grip, alive, pp }]; c: { hit(box, dmg, name, o), number(x, y, t, col), sound(k), shake(n),
   fx(k, x, y), music(ph), held() -> crack in firelight, slap(i) (a mirror knocked round), dazzleOk() } */
export function stepColossus(e, S, dt, heroes, c) {
  const G = S.G; S.t += dt; S.pose = poseOf(e, S, S.t);
  if (e.mode === 'sleep') return;
  if (e.mode === 'wake') { e.modeT = (e.modeT ?? 1.6) - dt; if (e.modeT <= 0) { e.mode = 'idle'; S.cd = 1.0; } return; }
  const live = heroes.filter(h => h.alive); const near = live.slice().sort((a, b) => Math.abs(a.x - G.cx) - Math.abs(b.x - G.cx))[0];
  for (const h of live) { const on = onBody(G, h.x, h.y, h.ground); S.bodyT.set(h.pp, on ? (S.bodyT.get(h.pp) || 0) + dt : 0); }
  S.shakeCd -= dt; S.lock = Math.max(0, S.lock - dt);
  for (const m of S.mirrors) m.turnedT = (m.turnedT || 0) + dt;
  /* (fix pass) THE ARENA STALL NUDGE: no mirror on a notch that can open it this phase for 10 s -> the line, again every 10 s (never a once-only line) */
  { const fl = flank(S), ok = S.ph === 2 ? relaying(S) : S.ph === 3 ? fl.some(m => m && m.notch === 'sky') || S.mirrors.some(m => m.notch === 'face') : S.mirrors.some(m => m.notch === 'face');   /* (claude/colossusrework: the fire and the dawn from his FLANK) */
    if (!colOpen(e) && S.ward <= 0 && !ok) { S.stallT = (S.stallT || 0) + dt; if (S.stallT >= 10) { S.stallT = 0; S.n.nudge = (S.n.nudge || 0) + 1; c.number(e.x, G.crownY - 20, S.ph === 2 ? 'TURN A MIRROR TO THE FIRE: ITS LIGHT HOLDS THE CRACK' : S.ph === 3 ? 'TURN A MIRROR TO THE SKY, OR TO FACE ITS LANCE' : 'TURN THE MIRROR TO HIM', '#ffd36b');   /* (= STALL_LINE[S.ph]; literals for tools/hint-shown) */ } } else S.stallT = 0; }
  /* the travelling hazards: stomp rings, the shard wave */
  for (const r of S.rings) { r.x += r.dir * COL.stompV * dt; if (r.x < G.x0 || r.x > G.x1) r.dead = true; else c.hit([r.x - 10, r.x + 10, G.floor - COL.stompH, G.floor], COL.stompDmg, 'THE STOMP', { key: 'ring' + r.id });   /* (!!: a ring of shards along the ground - JUMP it; no shield turns it) */ }
  S.rings = S.rings.filter(r => !r.dead);
  if (S.wave) { const w = S.wave; w.x += w.dir * COL.waveV * dt; if (w.x < G.x0 - 20 || w.x > G.x1 + 20) S.wave = null; else c.hit([w.x - 14, w.x + 14, G.floor - COL.waveH, G.floor], COL.waveDmg, 'THE SHARD WAVE', { key: 'wave' + w.id }); }
  /* (claude/glasssea2) THE SHARD SWEEP: the arm drags in from the wall to its feet along the floor (jump it, or be up on a hold) */
  if (S.sweep && S.sweep.live) { const w = S.sweep; w.x -= w.dir * COL.sweepV * dt; if ((w.x - G.cx) * w.dir <= COL.sweepIn) S.sweep = null; else c.hit([w.x - 12, w.x + 12, G.floor - COL.sweepH, G.floor], COL.sweepDmg, 'THE SHARD SWEEP', { key: 'sweep' + w.id }); }
  /* THE GLASS QUAKE's slick plates: tilted shards that slide a hero standing on them outward (c.push), until they settle */
  for (const q of S.slick) { q.t -= dt; for (const h of live) if (h.ground && Math.abs(h.y - G.floor) < 4 && Math.abs(h.x - q.x) <= COL.quakeW) { c.push && c.push(h, q.dir * COL.quakePush, dt); S.n.slid += dt; } }
  S.slick = S.slick.filter(q => q.t > 0);
  /* THE WARD after an opening (B3), then the lockout (B12) */
  if (S.ward > 0) { S.ward -= dt; if (S.ward <= 0) { S.ward = 0; S.lock = COL.lockT; const to = S.ph === 1 ? 'sky' : 'face';   /* (claude/glasssea2) in P1 it knocks the mirror that cracked it AWAY (to the sky): every opening wants a fresh TURN TO HIM */
    if (S.by != null && S.by >= 0 && S.mirrors[S.by] && S.mirrors[S.by].notch !== to) { S.mirrors[S.by].notch = to; c.slap && c.slap(S.by); } S.by = null; } }
  /* THE OPENINGS (B4: it stands still) */
  if (colOpen(e)) { e.open -= dt; if (e.open <= 0) { e.open = 0; e.mode = 'idle'; S.cd = COL.gap[S.ph - 1] + 0.2; S.ward = COL.wardT; S.n.warded++; c.sound && c.sound('ward'); c.fx && c.fx('ward', e.x, e.y); if (!S.told.ward) { S.told.ward = 1; c.number(e.x, G.crownY - 20, 'IT GLAZES ITS CRACKS OVER: WAIT FOR THE GLASS TO CLEAR', '#c8d8e8'); } } return; }
  /* THE PHASES (not inside an opening) */
  const k = e.hp / e.maxHp;
  if (e.mode !== 'phase' && e.mode !== 'walk' && ((S.ph === 1 && k <= COL.phase2) || (S.ph === 2 && k <= COL.phase3))) {   /* (claude/colossusrework: never mid-stride - he finishes the walk to his station) */
    S.ph++; e.phase = S.ph; e.mode = 'phase'; e.modeT = COL.phaseT; S.lance = null; S.marks = []; S.sweep = null; S.plates = []; S.crack = null; S.gaze = null; S.lunge = null; S.walk = null; S.legPurse = e.maxHp * COL.legPurse[S.ph - 1]; S.i = 0; S.ward = 0;
    for (const m of S.mirrors) m.notch = 'face';
    c.music && c.music(S.ph); c.shake && c.shake(5); c.sound && c.sound('phase');
    c.number(e.x, G.crownY - 30, S.ph === 2 ? 'NIGHT FALLS IN ITS GLASS: THE LANCE IS DARK' : 'DAWN: THE SUN RETURNS TO IT', S.ph === 2 ? '#9ab0e8' : '#ffd36b'); return; }
  if (e.mode === 'phase') { e.modeT -= dt; if (e.modeT <= 0) { e.mode = 'idle'; S.cd = 1.0; if (S.ph === 2) c.number(e.x, G.crownY - 30, 'IT SPLITS THE GLASS TO YOU: FIRELIGHT ON ITS CRACK HOLDS IT', '#ffd36b'); if (S.ph === 3) c.number(e.x, G.crownY - 30, 'A MIRROR TO THE SKY THROWS THE DAWN ON ITS CROWN', '#ffd36b'); } return; }
  /* P3: THE DAWN ON ITS CROWN - a mirror TO THE SKY, no ward, no lockout: DAZZLED (it may cancel a tell, never a blow in flight) */
  if (S.ph === 3 && S.ward <= 0 && !['lance', 'shards', 'stomp', 'shake', 'wave', 'sweep', 'quake', 'crack', 'gaze', 'lunge', 'walk', 'walkTell'].includes(e.mode)) { const m = flank(S).find(q => q && q.notch === 'sky');   /* (claude/colossusrework: the dawn from his FLANK) */ if (m) { S.n.dazzle++; S.marks = []; beginOpen(e, S, 'dazzled', COL.openCrown, m.i, c); c.number(e.x, G.crownY - 26, 'THE DAWN BURNS ITS CROWN: DAZZLED', '#ffd36b'); return; } }
  e.modeT = (e.modeT || 0) - dt;
  switch (e.mode) {
    case 'idle': { if (near) e.face = Math.sign(near.x - e.x) || e.face; S.cd -= dt; if (S.cd > 0) break;
      /* a climber on its body for long enough: THE SHAKE (it never shakes in an opening, and not too often) */
      const climber = live.find(h => (S.bodyT.get(h.pp) || 0) >= COL.shakeAfter);
      if (climber && S.shakeCd <= 0) { e.mode = 'shakeTell'; e.modeT = COL.shakeTell; S.n.shake++; c.sound && c.sound('tellHard'); c.number(e.x, G.crownY - 14, 'HOLD!', '#ff6b6b'); break; }
      const ch = COL.chain[S.ph]; let name = ch[S.i % ch.length]; S.i++;
      if ((name === 'lance' || name === 'crack') && S.lock > 0) name = 'shards';
      if (name === 'stomp' && live.some(h => onBody(G, h.x, h.y, h.ground)) && S.shakeCd <= 0) { e.mode = 'shakeTell'; e.modeT = COL.shakeTell; S.n.shake++; c.number(e.x, G.crownY - 14, 'HOLD!', '#ff6b6b'); break; }   /* a stomp with a climber on it is the shake */
      if (name === 'lance') { const dir = near ? (Math.sign(near.x - G.cx) || e.face) : e.face; e.face = dir; S.lance = { dir, end: lanceEnd(S, dir) }; e.mode = 'lanceTell'; e.modeT = S.ph === 3 ? COL.lanceTell3 : COL.lanceTell; S.n.lance++; c.sound && c.sound('lanceTell'); }
      else if (name === 'stomp') { e.mode = 'stompTell'; e.modeT = COL.stompTell; c.sound && c.sound('tell'); }
      else if (name === 'shards') { S.marks = live.flatMap(h => [-COL.shardSpread, 0, COL.shardSpread].map(d => ({ x: Math.max(G.x0 + 10, Math.min(G.x1 - 10, h.x + d)), y: c.surface ? c.surface(h.x + d, h.y) : G.floor }))); e.mode = 'shardTell'; e.modeT = COL.shardTell; c.sound && c.sound('tell'); }
      else if (name === 'crack') { const dir = near ? (Math.sign(near.x - G.cx) || e.face) : e.face, from = G.cx + dir * COL.crackFoot, lim = x => Math.max(G.x0 + 8, Math.min(G.x1 - 8, x));
        let to = lim((near ? near.x : from) + dir * COL.crackOver); if ((to - from) * dir < COL.crackMin) to = lim(from + dir * COL.crackMin);
        e.face = dir; S.n.crack++; S.crack = { dir, from, to, id: S.n.crack, front: null }; S.held = false; e.mode = 'crackTell'; e.modeT = COL.crackTell; c.sound && c.sound('tellHard'); }   /* (the words, !! CRACK LINE: JUMP OR STEP ASIDE, and the amber line: src/glass-colossus-hands.js drawOver) */
      else if (name === 'sweep') { const dir = near ? (Math.sign(near.x - G.cx) || e.face) : e.face; e.face = dir; S.n.sweep++; S.sweep = { dir, x: dir < 0 ? G.x0 + 6 : G.x1 - 6, id: S.n.sweep, live: false }; e.mode = 'sweepTell'; e.modeT = COL.sweepTell; c.sound && c.sound('tellHard'); }
      else if (name === 'quake') { S.n.quake++; const xs = []; for (const h of live) for (const d of [-COL.quakeSpread, 0, COL.quakeSpread]) { const x = Math.max(G.x0 + COL.quakeW + 4, Math.min(G.x1 - COL.quakeW - 4, h.x + d)); if (!xs.some(q => Math.abs(q - x) < COL.quakeW * 2)) xs.push(x); }
        S.plates = xs.map(x => ({ x, dir: Math.sign(x - G.cx) || 1 })); e.mode = 'quakeTell'; e.modeT = COL.quakeTell; c.sound && c.sound('tellHard'); }
      else if (name === 'walk') { const to = nextStation(S, near, e.face); if (to == null) { S.cd = 0.05; break; } const x = G.stations[to], dir = Math.sign(x - G.cx);
        S.n.walk++; S.walk = { st: to, to: x, dir, from: G.cx, stepT: COL.strideT * 0.5, n: 0, id: S.n.walk }; e.face = dir; e.mode = 'walkTell'; e.modeT = COL.walkTell;
        c.sound && c.sound('walkTell'); c.shake && c.shake(2); c.number(e.x, G.crownY - 14, 'IT STRIDES', '#ffd36b'); }
      else if (name === 'gaze') { const dir = near ? (Math.sign(near.x - G.cx) || e.face) : e.face; S.n.gaze++; S.gaze = { dir, x: dir > 0 ? G.x0 + 6 : G.x1 - 6, id: S.n.gaze, live: false, caught: -1 };
        e.face = dir; e.mode = 'gazeTell'; e.modeT = COL.gazeTell; c.sound && c.sound('gazeTell'); }   /* (the words, !! HIS GAZE: INTO A MIRROR'S SHADE, the shades and the start: src/glass-colossus-hands.js drawOver) */
      else if (name === 'lunge') { const tg = lungeTarget(S, near, e.face); S.n.lunge++; S.lunge = { ...tg, id: S.n.lunge }; e.face = Math.sign(tg.x - G.cx) || e.face; e.mode = 'lungeTell'; e.modeT = COL.lungeTell; c.sound && c.sound('lungeTell'); }
      else if (name === 'wave') { e.mode = 'waveTell'; e.modeT = COL.waveTell; S.wave = null; S.waveDir = near && near.x < G.cx ? 1 : -1; c.sound && c.sound('tellHard'); }
      break; }
    case 'lanceTell': if (S.lance) S.lance.end = lanceEnd(S, S.lance.dir);   /* (a mirror turned during the tell changes where it ends: the ring moves) */
      if (e.modeT <= 0) { e.mode = 'lance'; e.modeT = 9; S.lance.fired = true; S.lance.head = 0; c.sound && c.sound('lance'); c.shake && c.shake(2); } break;
    /* (claude/colossus3) THE BOLT TRAVELS: its head runs out from the chest at lanceV; it burns only the lanceLen px behind its head (jump it as it passes);
       it stops at the face of a FACING mirror - thrown back into its chest - or runs on to the wall */
    case 'lance': { const L0 = S.lance; if (!L0) { e.mode = 'idle'; S.cd = COL.gap[S.ph - 1]; break; }
      const far = Math.abs(L0.end.x - G.cx); L0.head = (L0.head || 0) + COL.lanceV * dt; const hd = Math.min(L0.head, far), tl = Math.max(0, L0.head - COL.lanceLen), [hi, lo] = COL.lanceBand;
      if (tl < far) { const a = G.cx + L0.dir * tl, b = G.cx + L0.dir * hd; c.hit([Math.min(a, b), Math.max(a, b), G.floor - hi, G.floor - lo], COL.lanceDmg, 'THE SUN LANCE', { key: 'lance' + S.n.lance }); }
      if (L0.end.mirror >= 0 && !L0.reflected && L0.head >= far) { L0.reflected = true; S.n.reflect++; S.lastReflect = L0.end.mirror; c.sound && c.sound('reflect'); c.number(e.x, G.hipY - 30, 'THE MIRROR THROWS IT BACK: ITS CHEST CRACKS', '#ffd36b'); beginOpen(e, S, 'cracked', COL.openT, L0.end.mirror, c); S.by = S.ph === 1 ? L0.end.mirror : -1; return; }
      if (tl >= far) { e.mode = 'idle'; S.cd = COL.gap[S.ph - 1]; S.lance = null; if (L0.end.mirror < 0 && !S.told.miss) { S.told.miss = 1; c.number(e.x, G.hipY - 30, 'THE LANCE MISSED THE MIRRORS: NOTHING OPENS', '#9aa39a'); } } break; }
    case 'stompTell': if (e.modeT <= 0) { e.mode = 'stomp'; e.modeT = 0.3; S.n.stomp++; const id = S.n.stomp; S.rings.push({ x: G.cx - 30, dir: -1, id: id + 'w' }, { x: G.cx + 30, dir: 1, id: id + 'e' }); c.sound && c.sound('stomp'); c.shake && c.shake(4); } break;
    case 'stomp': if (e.modeT <= 0) { e.mode = 'idle'; S.cd = COL.gap[S.ph - 1]; } break;
    case 'shardTell': if (e.modeT <= 0) { e.mode = 'shards'; e.modeT = COL.shardAct; S.n.shards++; c.sound && c.sound('shards');
        for (const m of S.marks) c.hit([m.x - COL.shardR, m.x + COL.shardR, m.y - 40, m.y], COL.shardDmg, 'THE SHARD RAIN', { blockable: true, key: 'shard' + S.n.shards + ':' + Math.round(m.x) }); } break;
    case 'shards': if (e.modeT <= 0) { e.mode = 'idle'; S.cd = COL.gap[S.ph - 1]; S.marks = []; } break;
    case 'shakeTell': if (e.modeT <= 0) { e.mode = 'shake'; e.modeT = COL.shake; S.shakeCd = COL.shakeCd; c.sound && c.sound('shake'); c.shake && c.shake(6);
        for (const h of live) if (onBody(G, h.x, h.y, h.ground) && !h.grip) { S.n.thrown++; c.throwOff && c.throwOff(h, Math.sign(h.x - G.cx) || 1); } } break;
    case 'shake': for (const h of live) if (onBody(G, h.x, h.y, h.ground) && !h.grip) { S.n.thrown++; c.throwOff && c.throwOff(h, Math.sign(h.x - G.cx) || 1); }
      if (e.modeT <= 0) { e.mode = 'idle'; S.cd = COL.gap[S.ph - 1]; } break;
    /* (claude/colossus3) THE CRACK LINE: the spikes ALWAYS erupt along the line (jump them or step off it); if FIRELIGHT holds its crack as they finish, it strains
       and its SHOULDERS BLAZE - dodge the line, then climb and punish */
    case 'crackTell': S.held = !!(c.held && c.held());
      if (e.modeT <= 0) { e.mode = 'crack'; e.modeT = 9; if (S.crack) S.crack.front = S.crack.from; c.sound && c.sound('crack'); c.shake && c.shake(3); } break;
    case 'crack': { const K = S.crack; if (!K || K.front == null) { S.crack = null; e.mode = 'idle'; S.cd = COL.gap[S.ph - 1]; break; }
      K.front += K.dir * COL.crackV * dt; const back = COL.crackV * COL.crackHot, f = (K.front - K.to) * K.dir > 0 ? K.to : K.front, b0 = K.front - K.dir * back, b = (b0 - K.from) * K.dir < 0 ? K.from : b0;
      if ((b - K.to) * K.dir < 0) c.hit([Math.min(f, b) - 3, Math.max(f, b) + 3, G.floor - COL.crackH, G.floor], COL.crackDmg, 'THE CRACK LINE', { key: 'crack' + K.id });
      else { S.crack = null; S.held = !!(c.held && c.held()); if (S.held) { S.n.held++; c.number(e.x, G.shoulderY - 30, 'THE FIRE HOLDS THE CRACK: ITS SHOULDERS BLAZE', '#ffd36b'); const m = S.mirrors.find(q => q.notch === 'fire'); beginOpen(e, S, 'blazing', COL.openShoulders, m ? m.i : -1, c); return; } e.mode = 'idle'; S.cd = COL.gap[S.ph - 1]; } break; }
    case 'sweepTell': if (e.modeT <= 0) { e.mode = 'sweep'; e.modeT = 2.0; if (S.sweep) S.sweep.live = true; c.sound && c.sound('sweep'); c.shake && c.shake(2); } break;
    case 'sweep': if (!S.sweep || e.modeT <= 0) { S.sweep = null; e.mode = 'idle'; S.cd = COL.gap[S.ph - 1]; } break;
    case 'quakeTell': if (e.modeT <= 0) { e.mode = 'quake'; e.modeT = COL.quakeAct; c.sound && c.sound('quake'); c.shake && c.shake(5);
        for (const p of S.plates) { c.hit([p.x - COL.quakeW, p.x + COL.quakeW, G.floor - COL.quakeH, G.floor], COL.quakeDmg, 'THE GLASS QUAKE', { key: 'quake' + S.n.quake + ':' + Math.round(p.x) }); S.slick.push({ x: p.x, dir: p.dir, t: COL.quakeSlick }); } S.plates = []; } break;
    case 'quake': if (e.modeT <= 0) { e.mode = 'idle'; S.cd = COL.gap[S.ph - 1]; } break;
    case 'waveTell': if (e.modeT <= 0) { e.mode = 'wave'; e.modeT = 0.4; S.n.wave++; S.wave = { x: S.waveDir > 0 ? G.x0 : G.x1, dir: S.waveDir, id: S.n.wave }; c.sound && c.sound('wave'); c.shake && c.shake(3); } break;
    case 'wave': if (e.modeT <= 0) { e.mode = 'idle'; S.cd = COL.gap[S.ph - 1] + 0.6; } break;
    /* (claude/colossusrework) THE WALK: a slow stride to the next station; his holds are re-seated a column at a time (c.reseat moves the tiles and carries a climber) */
    case 'walkTell': if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 30; } break;
    case 'walk': { const W = S.walk; if (!W) { e.mode = 'idle'; S.cd = COL.gap[S.ph - 1]; break; }
      const nx = e.x + W.dir * COL.walkV * dt, arrived = (nx - W.to) * W.dir >= 0; e.x = arrived ? W.to : nx;
      W.stepT -= dt; if (W.stepT <= 0 && !arrived) { W.stepT += COL.strideT; W.n++; S.n.steps++; const fx = e.x + W.dir * COL.footOut; S.lastStep = { x: fx, t: S.t };
        c.sound && c.sound('step'); c.shake && c.shake(3); if (c.hit([fx - COL.trampleW, fx + COL.trampleW, G.floor - COL.trampleH, G.floor], COL.trampleDmg, 'THE TRAMPLE', { key: 'tr' + W.id + ':' + W.n })) S.n.trample++; }
      const col = Math.round(e.x / G.TS); if (col !== G.col) { const old = holdCells(G), d = col - G.col; seat(G, col, e.x); c.reseat && c.reseat(old, holdCells(G), d); } else G.cx = e.x;
      if (arrived) { S.st = W.st; S.walk = null; G.cx = W.to; e.mode = 'idle'; S.cd = COL.gap[S.ph - 1] + 0.2; c.sound && c.sound('step'); c.shake && c.shake(4); } break; }
    /* THE GAZE: told, then the sweep from the far wall to your side; it burns whoever its spot passes in its light (B10: the shade and the caught gaze are drawn) */
    case 'gazeTell': if (e.modeT <= 0) { e.mode = 'gaze'; e.modeT = 9; if (S.gaze) S.gaze.live = true; c.sound && c.sound('gaze'); } break;
    case 'gaze': { const Z = S.gaze; if (!Z) { e.mode = 'idle'; S.cd = COL.gap[S.ph - 1]; break; }
      Z.x += Z.dir * COL.gazeV * dt; const b = gazeBlock(S, Z.x); Z.dark = b ? b.how : null;
      if (b && b.how === 'caught' && Z.caught < 0) { Z.caught = b.m.i; S.n.caught++; if (!S.told.caught) { S.told.caught = 1; c.number(b.m.x, G.floor - 54, 'THE MIRROR CATCHES HIS GAZE', '#ffd36b'); } }
      for (const h of live) { if (onBody(G, h.x, h.y, h.ground) || Math.abs(h.x - Z.x) > COL.gazeW + 7) continue; const hb = gazeBlock(S, h.x);
        if (hb) { const k = 'sh' + Z.id + ':' + (h.pp && h.pp.id || 0); if (!S.said[k]) { S.said[k] = 1; S.n.shaded++; } continue; }
        if (c.hit([h.x - 2, h.x + 2, G.hipY + 4, G.floor], COL.gazeDmg, 'THE GAZE', { key: 'gaze' + Z.id })) S.n.gazeHit++; }
      if (Z.x < G.x0 || Z.x > G.x1) { S.gaze = null; e.mode = 'idle'; S.cd = COL.gap[S.ph - 1]; } break; }
    /* THE SHARD LUNGE: the spear lands on its mark (yellow: a shield turns it) and spears that mirror round */
    case 'lungeTell': if (e.modeT <= 0) { e.mode = 'lunge'; e.modeT = COL.lungeAct; const Lg = S.lunge; c.sound && c.sound('lunge'); c.shake && c.shake(3);
        if (Lg) { c.hit([Lg.x - COL.lungeW, Lg.x + COL.lungeW, G.floor - COL.lungeH, G.floor], COL.lungeDmg, 'THE SHARD LUNGE', { blockable: true, key: 'lunge' + Lg.id });
          if (Lg.mirror >= 0) { const m = S.mirrors[Lg.mirror], to = S.ph === 1 ? 'sky' : S.ph === 2 ? 'face' : 'fire'; if (m.notch !== to) { m.notch = to; m.turnedT = 0; S.n.speared++; c.spear ? c.spear(Lg.mirror, to) : c.slap && c.slap(Lg.mirror); } } } } break;
    case 'lunge': if (e.modeT <= 0) { S.lunge = null; e.mode = 'idle'; S.cd = COL.gap[S.ph - 1]; } break;
    default: e.mode = 'idle';
  }
}

/* A HERO'S BLOW ON IT: what comes off the bar (0 = turned, with the word in out.word). footY: the striker's feet; plunge: a plunge */
export function takeBlow(e, S, dmg, footY, plunge, out = {}) {
  const G = S.G, z = zoneOf(G, footY);
  if (e.mode === 'sleep' || e.mode === 'wake' || e.mode === 'phase') { out.word = 'WARDED'; return 0; }
  if (S.ward > 0) { S.n.warded++; out.word = 'WARDED'; return 0; }
  const capLeft = () => Math.max(0, e.maxHp * COL.openCap - S.openTaken);
  const opened = (mul) => { const d = Math.min(dmg * mul, capLeft()); S.openTaken += d; out.cap = 'open'; if (capLeft() <= 0.01 && e.open > 0.3) { e.open = 0.3; out.word = 'IT SEALS THE CRACK'; } return d; };
  if (z === 'legs') { if (S.legPurse > 0) { const d = Math.min(dmg * COL.legMul, S.legPurse); S.legPurse -= d; out.cap = 'leg'; S.n.leg += d; if (S.legPurse <= 0.01) { S.legPurse = 0; out.word = 'THE KNEE CRACKS GLAZE OVER: CLIMB'; } return d; }
    S.n.glazed++; out.word = S.n.glazed < 4 ? 'GLAZED: CLIMB TO ITS CRACKS' : 'GLAZED'; return 0; }
  if (z === 'chest' && e.mode === 'cracked') return opened(plunge ? COL.plungeMul : COL.openMul);
  if (z === 'top' && (e.mode === 'blazing' || e.mode === 'dazzled')) return opened(plunge ? COL.plungeMul : COL.openMul);
  if (z === 'chest' && (e.mode === 'blazing' || e.mode === 'dazzled')) { out.word = e.mode === 'blazing' ? 'HIGHER: THE SHOULDERS' : 'HIGHER: THE CROWN'; return 0; }
  if (z === 'top' && e.mode === 'cracked') { out.word = 'LOWER: THE CHEST'; return 0; }
  S.n.shut++; out.word = S.n.shut > 4 ? 'SHUT' : S.ph === 2 ? 'SHUT: FIRELIGHT ON ITS CRACK OPENS IT' : S.ph === 3 && S.n.shut % 2 ? 'SHUT: A MIRROR TO THE SKY' : 'SHUT: BAIT ITS LANCE INTO A MIRROR'; return 0;
}

/* ---------- THE BOT (src/lab.js): what a player sees, read a quarter-second late (the house's human bot: react 0.25 s, a tell misread one time in eight) ----------
   missBait: it does not make it behind the mirror for a lance; missTurn: it fumbles a mirror's turn this time (tries again a second later); missGrip: it lets go in a shake */
export const COL_PLAN = { react: 0.25, miss: 0.13, missBait: 0.25, missTurn: 0.2, missGrip: 0.2, missShade: 0.2 };   /* (claude/colossusrework) missShade: it does not make the dark in time for a gaze, one in five (as missBait for the lance) */
/* P: { x, y, ground, face, atk, vy }; returns { gx (walk to), jump, dodge, block, atk, talk (E), grip (hold down), face, why } */
/* (claude/glasssea2) eyes: the v2 / human profile - src/lab-perceive.js already shows it his mode a reaction late (and misreads some), so the plan does not react
   twice: a tell is answered as soon as it is SEEN; only its hands' own fumbles (the bait, the turn, the grip) stay */
export function colPlan({ P, e, S, reach, shield, rng = Math.random, mem = {}, t, roll = true, tip = 0, eyes = false }) {
  const G = S.G, out = { gx: null, face: P.face, why: '' }, cx = G.cx, side = P.x < cx ? -1 : 1;
  const late = (k, d) => { if (eyes) { if (d === undefined) return true; const key = 'f' + k + ':' + e.mode + ':' + S.n.lance + ':' + S.n.shake; return !(mem[key] ??= rng() < d); } const key = k + ':' + (e.mode) + ':' + S.n.lance + ':' + S.n.stomp + ':' + S.n.shards + ':' + S.n.shake + ':' + S.n.wave; if (!(key in mem)) mem[key] = t + COL_PLAN.react - 0.04 + rng() * 0.1; return t >= mem[key] && !(mem['miss' + key] ??= rng() < (d ?? COL_PLAN.miss)); };
  const onFloor = P.ground && P.y > G.floor - 8, onHip = P.ground && Math.abs(P.y - G.hipY) < 4, onSh = P.ground && Math.abs(P.y - G.shoulderY) < 4, onKnee = P.ground && Math.abs(P.y - G.kneeY) < 4;
  const strike = (dirX) => { out.face = dirX; if (P.atk < 0) out.atk = true; };
  /* where to stand to strike its body from side s on a ledge (a spear's TIP pays at a distance from the body's edge: the warden stands back) */
  const spot = (s, l) => { const x = tip ? cx + s * (COL.w / 2 + tip) : s < 0 ? l.r - 4 : l.l + 4; return Math.max(l.l + 4, Math.min(l.r - 4, x)); };
  const legX = s => cx + s * (tip ? COL.w / 2 + tip : 36 + reach * 0.4);
  /* the climb: to the side's holds, row by row (jump straight up through the one-way above) */
  const climbTo = (want, s) => { const k = G.knee[s < 0 ? 0 : 1], h = G.hip[s < 0 ? 0 : 1], sh = G.shoulder[s < 0 ? 0 : 1];
    const mid = l => (l.l + l.r) / 2;
    if (onFloor) { out.gx = mid(k); if (Math.abs(P.x - mid(k)) < 10) out.jump = true; return; }
    if (onKnee) { out.gx = Math.max(h.l + 6, Math.min(h.r - 6, P.x)); if (P.x >= h.l + 4 && P.x <= h.r - 4) out.jump = true; return; }
    if (onHip && want === 'top') { out.gx = Math.max(sh.l + 6, Math.min(sh.r - 6, P.x)); if (P.x >= sh.l + 4 && P.x <= sh.r - 4) out.jump = true; return; }
    if (!P.ground) { out.gx = P.x; out.holdJump = true; } };
  /* 1. THE SHAKE: grip */
  if ((e.mode === 'shakeTell' || e.mode === 'shake') && (onHip || onSh) && late('grip', COL_PLAN.missGrip)) { out.grip = true; out.why = 'grip'; return out; }
  if ((e.mode === 'shakeTell' || e.mode === 'shake') && (onHip || onSh)) { out.why = 'late grip'; return out; }
  /* 2. THE OPENINGS: climb to it and strike inward */
  if (colOpen(e)) { const want = e.mode === 'cracked' ? 'chest' : 'top', s = side;
    if (want === 'chest' && onHip) { out.gx = spot(s, G.hip[s < 0 ? 0 : 1]); if (Math.abs(P.x - out.gx) < 8) strike(-s); out.why = 'chest'; return out; }
    if (want === 'top' && onSh) { out.gx = spot(s, G.shoulder[s < 0 ? 0 : 1]); if (Math.abs(P.x - out.gx) < 8) strike(-s); out.why = 'top'; return out; }
    climbTo(want, s); out.why = 'climb ' + want; return out; }
  /* get off its body when nothing is open (a shake comes for a climber) */
  if ((onHip || onSh) && !colOpen(e)) { out.gx = side < 0 ? G.x0 + 60 : G.x1 - 60; out.why = 'down'; }
  /* 3. THE THREATS IN FLIGHT */
  /* a hazard in flight is SEEN once, a reaction after it appears (and misread one time in eight): then the answer comes at the right moment, as a player's does */
  const seen = id => { if (!(('s' + id) in mem)) { mem['s' + id] = t + COL_PLAN.react - 0.04 + rng() * 0.1; mem['m' + id] = rng() < COL_PLAN.miss; } return t >= mem['s' + id] && !mem['m' + id]; };
  for (const r of S.rings) if (Math.sign(P.x - r.x) === r.dir && onFloor && seen('ring' + r.id)) { const d = Math.abs(r.x - P.x); if (d < 54) { out.jump = true; out.why = 'jump ring'; } }
  /* (fix pass) THE STOMP, READ FROM ITS TELL: a player who SAW the tell knows two rings are coming and jumps each as it arrives (it starts 30 px from its feet -
     too close to answer from the ring alone; the knight, cutting its knees, ate every one). One tell in eight is missed. */
  if (e.mode === 'stompTell') mem['st' + (S.n.stomp + 1)] = true;
  for (const r of S.rings) { const k = parseInt(r.id); if (Math.sign(P.x - r.x) === r.dir && onFloor && mem['st' + k] && !(mem['ms' + k] ??= rng() < COL_PLAN.miss) && Math.abs(r.x - P.x) < 17 + COL.stompV * 0.14) { out.jump = true; out.holdJump = true; out.why = 'jump the stomp'; return out; } }
  /* (claude/glasssea2) THE SHARD SWEEP: its arm drags in from the wall to its feet - jump it as it arrives (seen a reaction after it starts; it comes from far off) */
  if (S.sweep && S.sweep.live && onFloor && Math.sign(P.x - G.cx) === S.sweep.dir && (S.sweep.x - P.x) * S.sweep.dir > -8 && seen('sweep' + S.sweep.id)) { const d = Math.abs(S.sweep.x - P.x); if (d < 20 + COL.sweepV * 0.12) { out.jump = true; out.holdJump = true; out.why = 'jump the sweep'; return out; } }
  /* THE GLASS QUAKE: off the marked plates in its tell (one tell in eight late) */
  if (e.mode === 'quakeTell' && onFloor && late('quake')) { const onP = q => Math.abs(q.x - P.x) < COL.quakeW + 9; if (S.plates.some(onP)) { const free = [P.x - 40, P.x + 40, P.x - 52, P.x + 52].find(x => x > G.x0 + 12 && x < G.x1 - 12 && !S.plates.some(q => Math.abs(q.x - x) < COL.quakeW + 10)); if (free != null) { out.gx = free; out.why = 'off the plates'; return out; } out.jump = true; out.holdJump = true; out.why = 'jump the quake'; return out; } }
  /* (claude/colossus3) THE CRACK LINE: unheld (no fire on its crack), step off the line past its end if there is time, else jump the spikes as their front comes */
  if (S.crack && onFloor) { const K = S.crack, on = (P.x - K.from) * K.dir > -10 && (P.x - K.to) * K.dir < 10;
    if (on && e.mode === 'crackTell' && late('crack')) { const off = K.to + K.dir * 22; if (off > G.x0 + 10 && off < G.x1 - 10 && Math.abs(off - P.x) / 110 < e.modeT - 0.12) { out.gx = off; out.why = 'off the crack line'; return out; } out.gx = P.x; out.why = 'wait to jump the crack'; return out; }
    if (on && e.mode === 'crack' && K.front != null && seen('crack' + K.id)) { const d = (P.x - K.front) * K.dir; if (d > -10 && d < 16 + COL.crackV * 0.1) { out.jump = true; out.holdJump = true; out.why = 'jump the crack line'; return out; } } }
  if (S.wave && onFloor && Math.sign(P.x - S.wave.x) === S.wave.dir && seen('wave' + S.wave.id) && Math.abs(S.wave.x - P.x) < 60) { out.jump = true; out.why = 'jump wave'; }
  if (e.mode === 'shardTell' && late('shard')) { const hitMe = S.marks.some(m => Math.abs(m.x - P.x) < COL.shardR + 6 && Math.abs(m.y - P.y) < 20);
    if (hitMe) { if (shield) { out.block = true; out.why = 'block shards'; return out; } const free = [P.x - 26, P.x + 26, P.x - 60, P.x + 60].find(x => x > G.x0 + 12 && x < G.x1 - 12 && !S.marks.some(m => Math.abs(m.x - x) < COL.shardR + 8)); if (free != null) { out.gx = free; out.why = 'out of shards'; return out; } } }
  if (e.mode === 'shards' && shield && S.marks.some(m => Math.abs(m.x - P.x) < COL.shardR + 6)) { out.block = true; return out; }
  /* (claude/colossusrework) THE GAZE: under his chin (on his hips/shoulders) stay; on the floor, into the nearest dark - behind a FACING mirror, or a disc's shade */
  if ((e.mode === 'gazeTell' || e.mode === 'gaze') && S.gaze) {
    if (onHip || onSh) { out.gx = P.x; out.why = 'under his chin'; return out; }
    if (late('gaze') && !(mem['shade' + S.n.gaze] ??= rng() < COL_PLAN.missShade)) { if (P.ground && gazeBlock(S, P.x)) { out.gx = P.x; out.why = 'in the shade'; return out; }
      const sf = gazeSafe(S, P.x)[0]; if (sf) { out.gx = sf.x; out.why = 'into the ' + sf.how; return out; } } }
  /* THE SHARD LUNGE: off its mark (or a shield turns it: yellow) */
  if ((e.mode === 'lungeTell' || e.mode === 'lunge') && S.lunge && late('lunge')) { const Lg = S.lunge, on = Math.abs(P.x - Lg.x) < COL.lungeW + 10;
    if (on && shield) { out.block = true; out.face = Math.sign(G.cx - P.x) || P.face; out.why = 'block the lunge'; return out; }
    if (on && e.mode === 'lungeTell') { const c2 = [Lg.x - COL.lungeW - 20, Lg.x + COL.lungeW + 20].filter(x => x > G.x0 + 10 && x < G.x1 - 10).sort((a, b) => Math.abs(a - P.x) - Math.abs(b - P.x)); if (c2.length) { out.gx = c2[0]; out.why = 'off the mirror'; return out; } } }
  /* THE WALK: out of his path (he is slow - run on ahead of the landing foot), a climber rides */
  if ((e.mode === 'walkTell' || e.mode === 'walk') && S.walk && onFloor && late('walk')) { const W = S.walk, rel = (P.x - e.x) * W.dir;
    if (rel > -24 && rel < 120) { out.gx = Math.max(G.x0 + 12, Math.min(G.x1 - 12, e.x + W.dir * 160)); out.why = 'out of his path'; return out; } }
  /* 4. THE LANCE: get behind a FACING mirror on its side (the bait), or off the floor, or jump it */
  if ((e.mode === 'lanceTell' || e.mode === 'lance') && S.lance && late('lance')) { const L0 = S.lance, end = L0.end, inLine = onFloor && Math.sign(P.x - cx) === L0.dir && (end.mirror < 0 || Math.abs(P.x - cx) < Math.abs(end.x - cx) + 2);
    if (inLine) { const m = S.mirrors.find(q => q.notch === 'face' && Math.sign(q.x - cx) === L0.dir);
      if (m && e.mode === 'lanceTell' && e.modeT > Math.abs(P.x - (m.x + L0.dir * 18)) / 110 + 0.1 && !(mem['bait' + S.n.lance] ??= rng() < COL_PLAN.missBait)) { out.gx = m.x + L0.dir * 20; out.why = 'behind the mirror'; return out; }
      /* (claude/colossus3) the bolt TRAVELS: jump it as its head comes to you (it burns lanceLen px behind its head) */
      if (e.mode === 'lance') { const hx = Math.abs(P.x - cx), hd = L0.head || 0; if (hx - 7 - hd < 26 && hd - COL.lanceLen < hx + 7) { out.jump = true; out.holdJump = true; out.why = 'jump lance'; return out; } }
      out.gx = P.x; out.why = 'wait to jump'; return out; } }
  /* 5. THE PLAN BY PHASE */
  const myMirror = S.mirrors.reduce((a, b) => Math.abs(b.x - P.x) < Math.abs(a.x - P.x) ? b : a), outside = m => m.x + Math.sign(m.x - cx) * 22;
  const fl = flank(S).filter(Boolean), myFlank = fl.length ? fl.reduce((a, b) => Math.abs(b.x - P.x) < Math.abs(a.x - P.x) ? b : a) : myMirror;   /* (claude/colossusrework) the fire and the dawn come from his FLANK */
  if (S.ph === 2) { const fireM = fl.find(q => q.notch === 'fire');
    if (!fireM && S.ward <= 0) { const myMirror = myFlank; out.gx = myMirror.x; if (Math.abs(P.x - myMirror.x) < 14 && onFloor && late('turn' + myMirror.notch + Math.floor(t), COL_PLAN.missTurn)) { out.talk = true; out.face = Math.sign(myMirror.x - P.x) || P.face; } out.why = 'turn to the fire'; return out; }
    /* wait at its knee (under the hold), ready to climb when the shoulders blaze; cut the legs while the purse lasts */
    const s = fireM ? Math.sign(fireM.x - cx) : side; const kx = (G.knee[s < 0 ? 0 : 1].l + G.knee[s < 0 ? 0 : 1].r) / 2;
    if ((e.mode === 'crackTell' || e.mode === 'crack') && fireM && !onFloor) { out.gx = kx; climbTo('top', s); out.why = 'up for the blaze'; return out; }
    out.gx = kx + s * 6; if (S.legPurse > 0 && onFloor && Math.abs(P.x - cx) < 46 + reach) { out.gx = legX(s); if (Math.abs(P.x - out.gx) < 10 && (mem.legT ?? -9) < t - 0.9) { mem.legT = t; strike(-s); } } out.why = 'p2 wait'; return out; }
  if (S.ph === 3) { const skyM = fl.find(q => q.notch === 'sky');
    if (!skyM && S.ward <= 0 && e.mode !== 'lanceTell' && e.mode !== 'lance') { const m = fl.find(q => Math.sign(q.x - cx) === side) || myFlank; out.gx = m.x; if (Math.abs(P.x - m.x) < 14 && onFloor && late('turnS' + m.notch + Math.floor(t), COL_PLAN.missTurn)) { out.talk = true; out.face = Math.sign(m.x - P.x) || P.face; } out.why = 'turn to the sky'; return out; } }
  /* (claude/glasssea2) P1: THE MIRRORS START TO THE SKY and it knocks the one that cracked it away again - TURN THE MIRROR TO HIM (the nearest; a turn a second, fumbled one in five) */
  const nearM = fl.find(q => Math.sign(q.x - cx) === side);   /* (claude/colossusrework) the FLANKING mirror on your side: a lance thrown back from it leaves time to climb (a far one costs the opening) */
  if (S.ph === 1 && S.ward <= 0 && nearM && nearM.notch !== 'face' && e.mode !== 'lance') { const m = nearM;   /* (claude/colossusrework: four mirrors - the one on YOUR side, the lance comes your way) */ out.gx = m.x; if (Math.abs(P.x - m.x) < 14 && onFloor && late('turnF' + m.notch + Math.floor(t * 1.5), COL_PLAN.missTurn)) { out.talk = true; out.face = Math.sign(m.x - P.x) || P.face; } out.why = 'turn to him'; return out; }
  /* P1 (and P3's lances): wait just outside a FACING mirror on your side; while its lance is far off, cut its legs */
  const m = (nearM && nearM.notch === 'face' ? nearM : null) || S.mirrors.find(q => q.notch === 'face' && Math.sign(q.x - cx) === side) || S.mirrors.find(q => q.notch === 'face');
  if (m) { const safeX = outside(m);
    const recent = (e.mode === 'idle' && S.lock > 0) || mem.after > t;   /* right after an opening (the ward and the lockout): no lance comes - the legs */
    if (S.legPurse > 0 && recent && onFloor) { const s = Math.sign(m.x - cx); out.gx = legX(s); if (Math.abs(P.x - out.gx) < 10 && (mem.legT ?? -9) < t - 0.9) { mem.legT = t; strike(-s); } out.why = 'legs'; return out; }
    out.gx = safeX; out.face = -Math.sign(m.x - cx); out.why = 'bait'; }
  if (S.ward > 0) mem.after = t + 1.4;
  return out;
}
