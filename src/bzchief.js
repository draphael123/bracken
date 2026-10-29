// src/bzchief.js - THE BERSERKER CHIEFTAIN, THE WAR CAIRN's boss - THE HERO AS THE BOSS (claude/warcairn, the OPUS GREYBOX; scratch/brief-crownpath-1028.md section 3).
// Internal id 'bzchief' (never 'chief' / 'chieftain': those are the Stockade's goblin Chieftain). Beaten, the hero Berserker can be bought (src/main.js HEROES, behind
// src/hero-roster.js WARCAIRN_SHIPS) and anyone who beats him earns THE CHIEFTAIN'S AXES (a weapon skin).
//
// WHO HE IS (B5 + B11 + B16): the hero Berserker's own sheet (src/chars.js bakeBerserkerHero) drawn x BZC.scale by main.js like the Paladin boss, with ONLY the hero's kit
//   (src/berserker.js BZ) scaled to a boss: the FLURRY (L-R-L-R chops stepping in, the run going on only while chops LAND), the CROSS-CHOP (the fifth blow), the DOUBLE CHOP
//   (the held heavy), TAKE IT (the crossed axes: a stance), the AXE THROW (one-handed until he pulls it out of the floor), the WHIRL (T2: the answer to a hero behind him),
//   THE POUNCE (the coil) and THE GROUND-SPLITTER (T3). His RAGE fills (his blows landing, blows on his axes, blows that find him) and FULL is a FRENZY - P2 on.
//   Every told move has its own windup + release pose (BZC_POSES), and one windup runs at a time.
// A DUELIST (B11/B15): ALWAYS HITTABLE. Committed (a told move or its recovery, a reel, the fetch, a landing) x1.0; walking x0.7; TAKE IT x0.4 from the front (and the
//   blow feeds his rage) - x1.0 round him. NEVER under x0.4 outside an opening (the post-opening ward is x0.4 too: Daniel 10-08, nothing is ever wholly turned).
//   He is off the x0.05 chip (src/boss-greed.js FULL_DAMAGE); the greed reprisal still counts.
// THE ARENA TAKES PART (B17): THE WAR CAIRN RING - two WAR DRUMS (src/war-cairn-hands.js: a blow on one is a BEAT) ~6 tiles in from each wall; the clan on the rim.
//   A. BREAK THE BEAT (the main opening): a beat WHILE HE FRENZIES - he loses the rhythm, the frenzy ends, STAGGERED: OPEN BZC.open.t s (gold ring + timer), x BZC.open.mul,
//      at most BZC.open.cap of him; then a told BZC.wardT s WARD (x BZC.ward.take). The drum re-arms on its own clock (WC.beat.spent).
//   B. THE STUCK CROSS-CHOP (gold bonus): a whiffed cross-chop leaves both axes in the stone - x BZC.stuck.mul for BZC.stuck.t s. Shares the ward with A (no chain-lock).
//   C. TAKE IT broken by a HEAVY blow (any hero's held attack or plunge) or a beat: he REELS BZC.reelT s at x1.0. ON THE BEAT (a light blow as the stance goes up) he PARRIES
//      it: you are thrown back and his next cut is the cross-chop.
// PHASES (one new move each; the drums change each phase):
//   P1 100-65% THE CHALLENGE      the drums are quiet; his rage fills but he cannot spend it yet. He teaches the duel.
//   P2  65-30% THE DRUMS BEAT     a howl; the rim beats time. Rage fills x BZC.rage.p2 and FRENZY unlocks. New: THE POUNCE.
//   P3  30- 0% THE LAST RAGE      New: THE GROUND-SPLITTER (the floor splits both ways; the slab it cracks breaks on the next - the ring narrows). He TAKES A DRUM for each
//                                 frenzy: walks to it (told), strikes it and frenzies at once - that drum burns red as HIS. Only THE OTHER drum breaks him.
// WIN: THE CHIEFTAIN YIELDS (he kneels and offers his axes). PURE: no DOM, no main.js - the world is `c` (src/bzchief-hands.js binds it). bzcPlan is the lab's HUMAN bot.

export const BZC = {
  hp: 2000, w: 16, h: 32, scale: 1.35, markH: 56,
  heroHp: { knight: 1.0, warden: 0.85, geomancer: 0.95, ranger: 0.85, berserker: 1.0, pyro: 0.95, paladin: 1.0, pirate: 0.95, reaper: 1.0 },
  heroDmg: { knight: 1.0, warden: 0.9, geomancer: 1.0, ranger: 0.85, berserker: 0.95, pyro: 0.9, paladin: 1.0, pirate: 0.9, reaper: 1.0 },   /* (the tune lane owns these: start flat, measure 12 seeds with flasks) */
  walk: 70, keep: 34, turn: 0.4, gap: [0.6, 0.5, 0.42],
  mul: { walk: 0.7, take: 0.4, committed: 1.0 },              /* B15: never under 0.4 outside an opening */
  rage: { max: 100, land: 12, taken: 8, hit: 2, p2: 1.5, decay: 0 },
  frenzy: { t: 6, takeMul: 1.25, heal: 0.02, healCap: 0.04, quick: 0.75, cry: 0.7 },   /* heal: of his max a blow of his that lands in a frenzy; healCap: of his max a frenzy */
  open: { t: 3.0, mul: 2.0, cap: 0.15 }, stuck: { t: 1.2, mul: 1.5 }, wardT: 2.0, ward: { take: 0.4 }, reelT: 0.8,
  flurry: { tell: 0.5, beat: 0.2, t: 0.16, reach: 34, step: 110, dmg: 18, n: 4 },
  cross: { tell: 0.55, t: 0.22, reach: 38, dmg: 30 },
  double: { tell: 0.8, t: 0.26, reach: 40, dmg: 34 },
  take: { t: 1.2, beat: 0.22, heat: 2.4 },                      /* heat: blows into his walk that raise the stance (like the Paladin's ward) */
  throw: { tell: 0.55, sp: 300, range: 260, dmg: 22, hy: 16, hr: 6, cd: 9, min: 90, one: 1.3, pull: 0.9, walk: 90 },   /* one: his chops' tells x this one-handed */
  whirl: { tell: 0.45, t: 0.35, r: 46, dmg: 22, cd: 4, behind: 0.5 },
  pounce: { tell: 0.7, t: 0.45, v: 330, dmg: 30, land: 0.6, cd: 7, min: 70 },
  split: { tell: 1.05, t: 0.3, r: 26, dmg: 32, wave: 18, v: 190, life: 1.2, seg: 4 },
  drumWalk: { t: 3.5, near: 18 },
  p2: 0.65, p3: 0.3,
};
/* THE CYCLES, by phase (cycle k uses [k % n]); TAKE IT, THE WHIRL, the frenzy and the drum walk are not in them - they come off you, his rage and the drums (nextMove) */
export const CYCLES = {
  1: [['flurry', 'double', 'flurry', 'throw', 'cross'], ['throw', 'flurry', 'cross', 'flurry', 'double'], ['flurry', 'cross', 'double', 'flurry', 'throw']],
  2: [['pounce', 'flurry', 'double', 'throw', 'flurry'], ['flurry', 'cross', 'pounce', 'flurry', 'double'], ['throw', 'pounce', 'flurry', 'cross', 'double']],
  3: [['split', 'flurry', 'pounce', 'double', 'throw'], ['flurry', 'split', 'cross', 'flurry', 'pounce'], ['double', 'split', 'throw', 'flurry', 'cross']],
};
/* THE MOVES: the mode while it is told, its mark, the answer (src/marks.js keeps the same rows) */
export const MOVES = {
  flurryTell: { mark: '!', answer: 'block' }, flurryBeat: { mark: '!', answer: 'block' }, crossTell: { mark: '!!', answer: 'dodge' }, doubleTell: { mark: '!!', answer: 'dodge' },
  throwTell: { mark: '!', answer: 'jump' }, whirlTell: { mark: '!', answer: 'dodge' }, coil: { mark: '!!', answer: 'jump' }, splitTell: { mark: '!!', answer: 'jump' },
  warcry: { mark: '', answer: '' }, drumWalk: { mark: '', answer: '' }, take: { mark: '', answer: '' },
};
export const MOVE_NAME = { flurry: 'THE FLURRY', cross: 'THE CROSS-CHOP', double: 'THE DOUBLE CHOP', throw: 'THE AXE THROW', whirl: 'THE WHIRL', pounce: 'THE POUNCE',
  split: 'THE GROUND-SPLITTER', wave: 'THE SPLIT', };
export const PHASE_NAME = { 1: 'THE CHALLENGE', 2: 'THE DRUMS BEAT FOR HIM', 3: 'THE LAST RAGE' };
export const BZC_SAY = {
  wake: 'THE BERSERKER CHIEFTAIN', rule: 'HE FIGHTS TO THE DRUMS: STRIKE ONE IN HIS FRENZY', take: 'HE TAKES IT: A HEAVY BLOW OR A BEAT BREAKS HIS GUARD', taken: 'ON HIS AXES: IT FEEDS HIS RAGE',
  reel: 'HIS GUARD BREAKS: HE REELS', parry: 'ON THE BEAT: HE PARRIES', frenzy: 'FRENZY: STRIKE A DRUM', broken: 'HE LOSES THE BEAT: STRIKE', ward: 'HE GATHERS HIMSELF: HE IS WARDED',
  stuck: 'HIS AXES ARE IN THE STONE', frenzyShort: 'FRENZY', burnsOut: 'HIS FRENZY BURNS OUT', forDrum: 'HE GOES FOR A DRUM', whirl: 'THE WHIRL: STAY OFF HIS BACK', cross: 'THE CROSS-CHOP: DODGE IT - A MISS LEAVES HIS AXES IN THE STONE', double: 'THE DOUBLE CHOP: OUT OF REACH', throw: 'THE AXE THROW: JUMP IT', pounce: 'THE POUNCE: JUMP OVER IT', split: 'THE GROUND-SPLITTER: JUMP THE SPLIT', beatReel: 'ON THE BEAT: HE REELS', notYet: 'HE IS WARDED: NOT YET', oneHand: 'ONE AXE: HE GOES FOR THE OTHER', knocked: 'KNOCKED OFF HIS AXE', p2: 'THE DRUMS BEAT FOR HIM: HIS RAGE RUNS', p3: 'THE LAST RAGE: HE TAKES A DRUM',
  hisDrum: 'HIS DRUM: STRIKE THE OTHER', ownTime: 'HE KEEPS HIS OWN TIME: WAIT FOR HIS FRENZY', yields: 'THE CHIEFTAIN YIELDS', winOwned: 'HIS AXES ARE YOURS', winNew: 'THE BERSERKER WILL FIGHT FOR YOU - 10 SILVER IN THE STORE', cracked: 'THE SLAB CRACKS', breaks: 'THE SLAB BREAKS AWAY',
};
const STRIKE = new Set(['flurry', 'cross', 'double', 'throw', 'whirl', 'pounce', 'split']);
const GUARD_MODES = new Set(['walk', 'recover']);
export const isWalking = m => GUARD_MODES.has(m);

/* ---------- HIS SPRITE IS THE HERO'S OWN SHEET (src/chars.js bakeBerserkerHero): main.js bakes this list into SPR.bzchief, a pose per frame, drawn x BZC.scale.
   [pose, frame]; the LAST row is his hurt. Every told move has its OWN windup + release here (B16) ---------- */
export const BZC_POSES = [['idle', 0], ['run', 0], ['run', 2], ['run', 4],
  ['bzFlurryL', 0], ['bzFlurryL', 2], ['bzFlurryR', 0], ['bzFlurryR', 2],   /* 4-7   THE FLURRY: lead axe (windup, chop), hatchet (windup, chop) */
  ['bzCross', 0], ['bzCross', 2],                                         /* 8,9   THE CROSS-CHOP */
  ['windup', 2], ['heavy', 2],                                            /* 10,11 THE DOUBLE CHOP (and 11 = both axes in the stone: stuck) */
  ['bzTake', 0], ['bzTake', 1],                                           /* 12,13 TAKE IT (raised, a blow on it) */
  ['bzThrow', 0], ['bzThrow', 1],                                         /* 14,15 THE AXE THROW */
  ['bzWind2', 0], ['bzTier2', 1],                                         /* 16,17 THE WHIRL */
  ['bzCoil', 0], ['bzPounce', 0], ['bzPLand', 0],                         /* 18-20 THE POUNCE */
  ['bzWind3', 0], ['bzTier3', 2],                                         /* 21,22 THE GROUND-SPLITTER */
  ['bzRoar', 0], ['blast', 0],                                            /* 23,24 THE WAR CRY / the frenzy's stamp */
  ['slump', 0], ['slump', 1], ['hurt', 0]];                               /* 25 broken (he loses the beat) | 26 he yields | 27 hurt */
export const BZC_IDX = { broken: 25, yield: 26, hurt: 27 };
export function bzcFrame(e) {
  switch (e.mode) {
    case 'flurryTell': case 'flurryBeat': return e.left ? 4 : 6; case 'flurry': return e.left ? 5 : 7;
    case 'crossTell': return 8; case 'cross': return 9; case 'stuck': return 11;
    case 'doubleTell': return 10; case 'double': return 11;
    case 'take': return e.takeHitT > 0 ? 13 : 12;
    case 'throwTell': return 14; case 'throw': return 15;
    case 'whirlTell': return 16; case 'whirl': return 17;
    case 'coil': return 18; case 'pounce': return 19; case 'land': return 20;
    case 'splitTell': return 21; case 'split': return 22;
    case 'warcry': return 23; case 'drumStrike': return 24;
    case 'broken': return 25; case 'yield': return 26; case 'reel': return 27; case 'sleep': case 'wake': return 0;
  }
  if (e.hurtT > 0) return 27;
  return Math.abs(e.vx || 0) > 3 ? 1 + Math.floor((e.anim || 0) * 8) % 3 : 0;
}

/* ---------- THE WAR CAIRN RING ---------- */
/* local columns (0..W-1) from sx; floor row (the hero stands on floor-1); roof rows of air over it; the two drums; where he starts; the floor's outer SLABS (the ground-splitter
   cracks one, the next breaks it: the ring narrows - never past a drum) */
export const BZC_STAGE = { sx: 404, floor: 20, roof: 15, W: 44, drums: [6, 37], him: 34, slabs: [[0, 3], [40, 43]] };
/* the ring in world px, from the arena */
export function geom(A, TS = 16) {
  const q = A.bzc, X = c => (q.sx + c) * TS;
  return { TS, x0: X(0), x1: X(BZC_STAGE.W), floorY: q.R * TS, roofY: (q.R - BZC_STAGE.roof) * TS,
    drums: BZC_STAGE.drums.map((c, i) => ({ id: 'arena' + i, x: X(c) + 8 })),
    slabs: BZC_STAGE.slabs.map(([a, b], i) => ({ i, c0: q.sx + a, c1: q.sx + b, x0: X(a), x1: X(b + 1), row: q.R })) };
}

/* ---------- ONE FIGHT ---------- */
export function newFight(G) {
  return { G, ph: 1, cycle: 0, step: 0, script: null, act: 0, rage: 0, frenzy: 0, ward: 0, openTaken: 0, healed: 0, behindT: 0, chainLeft: 0, nextCross: false,
    oneHand: false, axe: null, knocked: false, heat: 0, throwCd: 3, whirlCd: 0, pounceCd: 2, hisDrum: null, waves: [], told: {}, lastRage: 0,
    cracked: [0, 0],   /* per outer slab: 0 whole, 1 cracked, 2 broken */
    n: { cycles: 0, frenzies: 0, breaks: 0, stucks: 0, reels: 0, parries: 0, takes: 0, takenOn: 0, landed: 0, warded: 0, walked: 0, flurries: 0, chops: 0, crosses: 0, doubles: 0,
      throws: 0, fetches: 0, knocks: 0, whirls: 0, pounces: 0, splits: 0, drumWalks: 0, beatsIdle: 0, beatsHis: 0, heal: 0, moves: {} } };
}
export const pPhase = e => (e.hp <= e.maxHp * BZC.p3 ? 3 : e.hp <= e.maxHp * BZC.p2 ? 2 : 1);
export const bzcOpen = e => !!e && ((e.mode === 'broken' && (e.open || 0) > 0) || (e.mode === 'stuck' && (e.open || 0) > 0));
export const frenzied = S => (S.frenzy || 0) > 0;
const nextScript = S => { const set = CYCLES[S.ph]; return set[S.cycle % set.length].slice(); };
function setMode(e, m, t) { e.mode = m; e.modeT = t; }
const clampX = (G, x) => Math.max(G.x0 + 18, Math.min(G.x1 - 18, x));
const quick = S => (frenzied(S) ? BZC.frenzy.quick : 1) * (S.oneHand ? BZC.throw.one : 1);
function tell(e, S, c, mode, t) { setMode(e, mode, t); S.act++; S.n.moves[mode] = (S.n.moves[mode] || 0) + 1; const mv = MOVES[mode]; if (mv && mv.mark) c.mark(mv.mark); c.sound(mv && mv.mark === '!!' ? 'tellHard' : mv && mv.mark ? 'tell' : 'growl'); }
function addRage(e, S, c, n) { if (frenzied(S) || !(n > 0)) return; const k = S.ph >= 2 ? BZC.rage.p2 : 1; S.rage = Math.min(BZC.rage.max, S.rage + n * k); }
function startFrenzy(e, S, c) { S.frenzy = BZC.frenzy.t; S.rage = 0; S.healed = 0; S.n.frenzies++; c.sound('roar'); c.shake(5); c.fx('frenzy', e.x, e.y); c.drums('answer');
  c.number(e.x, e.y - 84, S.told.frenzy ? BZC_SAY.frenzyShort : BZC_SAY.frenzy, '#ff6b6b'); S.told.frenzy = 1; }
function endWard(e, S, c) { S.ward = BZC.wardT; S.openTaken = 0; c.fx('ward', e.x, e.y); c.sound('growl'); c.number(e.x, e.y - 80, BZC_SAY.ward, '#c8b8a8'); }

/* ---------- THE RULE ON HIM (the hands call these) ---------- */
/* A BLOW ON HIM. heavy: a held attack or a plunge (it breaks TAKE IT); fromX: the hero's x (TAKE IT turns the front only). Returns { dmg, read }:
   read 'open' (A or B), 'ward' (x0.4 after an opening), 'take' (on his axes: x0.4, fed his rage), 'reel' (TAKE IT broken), 'parry' (on the beat: the hero is thrown back), 'walk' (x0.7), 'landed' */
export function blowOn(e, S, c, dmg, heavy, fromX) {
  if (!e || !e.alive || e.mode === 'sleep' || e.mode === 'wake' || e.mode === 'yield') return { dmg: 0, read: 'none' };
  const fz = frenzied(S) ? BZC.frenzy.takeMul : 1;
  if (bzcOpen(e)) { const mul = e.mode === 'stuck' ? BZC.stuck.mul : BZC.open.mul, cap = e.maxHp * BZC.open.cap - S.openTaken;
    const d = Math.max(0, Math.min(Math.round(dmg * mul * fz), Math.round(cap))); S.openTaken += d; return { dmg: Math.max(1, d), read: 'open' }; }
  if (S.ward > 0) { S.n.warded++; return { dmg: Math.max(1, Math.round(dmg * BZC.ward.take)), read: 'ward' }; }
  if (e.mode === 'take') { const front = Math.sign(fromX - e.x) === (e.face || 1);
    if (heavy) { reel(e, S, c, 'heavy'); return { dmg: Math.round(dmg * fz), read: 'reel' }; }
    if (front && e.modeT > BZC.take.t - BZC.take.beat) { S.n.parries++; S.nextCross = true; setMode(e, 'recover', 0.3); c.number(e.x, e.y - 74, BZC_SAY.parry, '#ffd36b'); c.sound('clank'); return { dmg: 0, read: 'parry' }; }
    if (front) { S.n.takenOn++; addRage(e, S, c, BZC.rage.taken); e.takeHitT = 0.2; if (!S.told.taken || S.n.takenOn % 6 === 0) { S.told.taken = 1; c.number(e.x, e.y - 70, BZC_SAY.taken, '#ff9a5c'); }
      return { dmg: Math.max(1, Math.round(dmg * BZC.mul.take)), read: 'take' }; }
    return { dmg: Math.round(dmg * fz), read: 'landed' }; }
  addRage(e, S, c, BZC.rage.hit);
  if (GUARD_MODES.has(e.mode)) { S.n.walked++; S.heat += 1; return { dmg: Math.max(1, Math.round(dmg * BZC.mul.walk * fz)), read: 'walk' }; }
  /* it LANDS: he is committed - and a blow on him as he pulls his hatchet knocks him off it, once */
  S.n.landed++;
  if (e.mode === 'fetch' && e.pulling && !S.knocked) { S.knocked = true; S.n.knocks++; setMode(e, 'reel', 0.5); c.number(e.x, e.y - 70, BZC_SAY.knocked, '#8fd160'); }
  if (frenzied(S) && dmg > 0) { /* (no flinch in a frenzy: the blow lands, he swings on) */ }
  return { dmg: Math.round(dmg * BZC.mul.committed * fz), read: 'landed' };
}
/* HIS BLOW LANDED on a hero: rage - and in a frenzy he heals a share of it (capped) */
export function blowLanded(e, S, c, d) { addRage(e, S, c, BZC.rage.land);
  if (frenzied(S) && d > 0 && S.healed < e.maxHp * BZC.frenzy.healCap) { const h = Math.min(Math.round(e.maxHp * BZC.frenzy.heal), Math.round(e.maxHp * BZC.frenzy.healCap - S.healed)); if (h > 0) { S.healed += h; S.n.heal += h; c.mend(h); } } }
/* HIS BLOW TURNED (a shield, a parry, a roll): the flurry STOPS (it goes on only while chops land); a turned cross-chop or a whiffed one leaves the axes in the stone */
export function blowTurned(e, S, c, perfect) { if (!e || !e.alive) return; if (e.mode === 'flurry' || e.mode === 'flurryBeat') { S.chainLeft = 0; S.whiffed = true; }
  if (perfect && (e.mode === 'flurry' || e.mode === 'flurryBeat')) { S.n.reels++; setMode(e, 'reel', BZC.reelT * 0.75); e.vx = 0; c.number(e.x, e.y - 70, BZC_SAY.beatReel, '#8fd160'); } }
function reel(e, S, c, why) { S.n.reels++; setMode(e, 'reel', BZC.reelT); e.vx = 0; S.heat = 0; c.number(e.x, e.y - 74, BZC_SAY.reel, '#8fd160'); c.sound('crack'); c.shake(3); }
function stuck(e, S, c) { if (S.ward > 0) { setMode(e, 'recover', 0.6); return; } S.n.stucks++; setMode(e, 'stuck', BZC.stuck.t); e.open = BZC.stuck.t; S.openTaken = 0; c.shake(4); c.sound('crack'); c.fx('stuck', e.x + (e.face || 1) * 20, S.G.floorY);
  c.number(e.x, e.y - 80, BZC_SAY.stuck, '#ffd36b'); }
/* A BEAT (src/war-cairn-hands.js): a war drum struck. by: 'hero' | 'boss'. Returns what it did to him: 'break' (A), 'reel' (C), 'his' (his own drum in P3), 'idle' */
export function beatOn(e, S, c, drumId, by) {
  if (!e || !e.alive || e.mode === 'sleep' || e.mode === 'wake' || e.mode === 'yield' || by !== 'hero') return 'idle';
  if (S.hisDrum && drumId === S.hisDrum) { S.n.beatsHis++; c.number(e.x, e.y - 80, BZC_SAY.hisDrum, '#ff6b6b'); return 'his'; }
  if (e.mode === 'take') { reel(e, S, c, 'beat'); return 'reel'; }
  if (frenzied(S) && !bzcOpen(e)) { if (S.ward > 0) { c.number(e.x, e.y - 80, BZC_SAY.notYet, '#c8b8a8'); return 'ward'; }
    S.frenzy = 0; S.n.breaks++; S.chainLeft = 0; S.waves = []; e.lift = 0; S.openTaken = 0; setMode(e, 'broken', BZC.open.t + 0.05); e.open = BZC.open.t; e.vx = 0;
    c.fx('open', e.x, e.y); c.sound('crack'); c.shake(5); c.number(e.x, e.y - 84, BZC_SAY.broken, '#8fd160'); return 'break'; }
  S.n.beatsIdle++; if (!S.told.ownTime) { S.told.ownTime = 1; c.number(e.x, e.y - 80, BZC_SAY.ownTime, '#c8b8a8'); }
  return 'idle';
}

/* ---------- ONE FRAME. h = the heroes [{ x, y, ground, alive, air, pp }], c = the world:
   c.hit(box, dmg, name, o) -> landed   c.number  c.mark  c.sound  c.fx  c.shake  c.music(ph)  c.mend(n)  c.drums(k)  c.takeDrum(id)  c.crack(i, state)  c.drumsAt() -> [{id,x,spent}] ---------- */
export function stepChief(e, S, dt, h, c) {
  const G = S.G, P = h.filter(q => q.alive).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0] || h[0];
  e.modeT -= dt; e.y = G.floorY - (e.lift || 0); e.anim = (e.anim || 0) + dt; S.heat = Math.max(0, S.heat - dt * 1.1); e.takeHitT = Math.max(0, (e.takeHitT || 0) - dt);
  for (const k of ['throwCd', 'whirlCd', 'pounceCd']) S[k] = Math.max(0, S[k] - dt);
  if (e.open > 0) e.open = Math.max(0, e.open - dt);
  if (S.ward > 0) S.ward = Math.max(0, S.ward - dt);
  if (S.frenzy > 0) { S.frenzy = Math.max(0, S.frenzy - dt); if (S.frenzy === 0) { c.number(e.x, e.y - 80, BZC_SAY.burnsOut, '#c8b8a8'); } }
  e.ward = S.ward; e.bzRage = S.rage; e.frenzy = S.frenzy;
  stepWorld(e, S, dt, h, c);
  if (e.mode === 'sleep' || e.mode === 'yield') return;
  if (e.mode === 'wake') { if (e.modeT <= 0) { S.script = nextScript(S); S.step = 0; setMode(e, 'walk', 0.6); } return; }
  /* BROKEN (his poise bar): he reels where he stands (B4) */
  if (e.broken > 0 && !bzcOpen(e) && (GUARD_MODES.has(e.mode) || /Tell$/.test(e.mode))) { e.modeT += dt; e.vx = 0; return; }
  /* THE PHASES: a new one waits for the blow in hand and never cuts an opening short */
  const want = pPhase(e);
  if (want > S.ph && !bzcOpen(e) && (e.mode === 'walk' || e.mode === 'recover')) {
    S.ph = want; S.cycle = 0; S.step = 0; S.script = null; e.phase = want; c.music(want);
    c.number((G.x0 + G.x1) / 2, G.floorY - 150, want === 2 ? BZC_SAY.p2 : BZC_SAY.p3, want === 2 ? '#ffd36b' : '#ff6b6b'); c.sound('roar'); c.shake(4); c.drums(want === 2 ? 'time' : 'red');
    setMode(e, 'warcry', BZC.frenzy.cry); S.cryOnly = true; return; }
  /* FULL RAGE (P2+): the war cry - in P3 he walks to a drum first and takes it */
  if (S.ph >= 2 && S.rage >= BZC.rage.max && !frenzied(S) && S.ward <= 0 && (e.mode === 'walk' || e.mode === 'recover') && e.modeT <= 0.2) {
    if (S.ph >= 3) { const d = pickDrum(e, S, c); if (d) { S.walkTo = d.id; S.n.drumWalks++; setMode(e, 'drumWalk', BZC.drumWalk.t); c.number(e.x, e.y - 74, BZC_SAY.forDrum, '#ff6b6b'); return; } }
    S.cryOnly = false; tell(e, S, c, 'warcry', BZC.frenzy.cry); return; }
  /* THE WHIRL: a hero at his back a while (on guard only: one windup at a time) */
  if (GUARD_MODES.has(e.mode) && S.whirlCd <= 0) { const back = h.find(q => q.alive && Math.sign(q.x - e.x) === -(e.face || 1) && Math.abs(q.x - e.x) < BZC.whirl.r && Math.abs(q.y - e.y) < 30);
    if (back) { S.behindT += dt; if (S.behindT > BZC.whirl.behind) { S.behindT = 0; S.whirlCd = BZC.whirl.cd; S.n.whirls++; tell(e, S, c, 'whirlTell', BZC.whirl.tell * quick(S)); if (!S.told.whirl) { S.told.whirl = 1; c.number(e.x, e.y - 80, BZC_SAY.whirl, '#ffd36b'); } return; } } }
  switch (e.mode) {
    case 'broken': e.vx = 0; if (e.open <= 0) { endWard(e, S, c); setMode(e, 'recover', 0.4); } return;   /* B4: on his knees, still */
    case 'stuck': e.vx = 0; if (e.open <= 0) { endWard(e, S, c); setMode(e, 'recover', 0.35); } return;
    case 'recover': e.vx = 0; if (e.modeT <= 0) nextMove(e, S, P, h, c); return;
    case 'reel': e.vx = 0; if (e.modeT <= 0) setMode(e, 'recover', 0.25); return;
    case 'take': e.vx = 0; if (e.modeT <= 0) setMode(e, 'recover', 0.2); return;
    case 'warcry': e.vx = 0; if (e.modeT <= 0) { if (!S.cryOnly) startFrenzy(e, S, c); S.cryOnly = false; setMode(e, 'recover', 0.3); } return;
    case 'drumWalk': { const d = (c.drumsAt() || []).find(q => q.id === S.walkTo); if (!d) { setMode(e, 'walk', 0.3); return; }
      const dd = d.x - e.x; e.face = Math.sign(dd) || e.face; if (Math.abs(dd) > BZC.drumWalk.near) { const x0 = e.x; e.x = clampX(G, e.x + Math.sign(dd) * BZC.walk * 1.3 * dt); e.vx = (e.x - x0) / Math.max(1e-6, dt); if (e.modeT <= 0) { S.cryOnly = false; tell(e, S, c, 'warcry', BZC.frenzy.cry); } return; }
      e.vx = 0; setMode(e, 'drumStrike', 0.45); c.sound('slam'); return; }
    case 'drumStrike': e.vx = 0; if (e.modeT <= 0) { S.hisDrum = S.walkTo; c.takeDrum(S.walkTo); startFrenzy(e, S, c); setMode(e, 'recover', 0.3); } return;
    case 'fetch': { const a = S.axe; if (!a) { S.oneHand = false; setMode(e, 'walk', 0.3); return; } const dd = a.x - e.x; e.face = Math.sign(dd) || e.face;
      if (Math.abs(dd) > 10) { const x0 = e.x; e.x = clampX(G, e.x + Math.sign(dd) * BZC.throw.walk * dt); e.vx = (e.x - x0) / Math.max(1e-6, dt); e.pulling = false; return; }
      e.vx = 0; if (!e.pulling) { e.pulling = true; e.modeT = BZC.throw.pull; } if (e.modeT <= 0) { S.axe = null; S.oneHand = false; S.knocked = false; e.pulling = false; c.sound('clank'); setMode(e, 'recover', 0.3); } return; }
    case 'walk': {
      const d = P.x - e.x;
      if ((e.face || 1) * d < -8) { S.turnT = (S.turnT || 0) + dt; if (S.turnT > BZC.turn) { e.face = Math.sign(d) || e.face; S.turnT = 0; } } else S.turnT = 0;
      const x0 = e.x; if (Math.abs(d) > BZC.keep + 6) e.x = clampX(G, e.x + Math.sign(d) * BZC.walk * (frenzied(S) ? 1.3 : 1) * dt); e.vx = (e.x - x0) / Math.max(1e-6, dt);
      /* PRESSED (blows into his walk), he TAKES IT: the stance (told: the crossed axes and a growl) */
      if (S.heat >= BZC.take.heat && Math.abs(d) < 70 && !frenzied(S)) { S.heat = 0; S.n.takes++; tell(e, S, c, 'take', BZC.take.t); e.vx = 0; e.face = Math.sign(d) || e.face;
        if (!S.told.take) { S.told.take = 1; c.number(e.x, e.y - 74, BZC_SAY.take, '#ffd36b'); } return; }
      if (e.modeT <= 0) nextMove(e, S, P, h, c); return; }
  }
  stepMove(e, S, dt, P, h, c);
}
/* P3: the drum he takes - the nearer one that is not spent (or his own again) */
function pickDrum(e, S, c) { const ds = (c.drumsAt() || []).slice(); if (S.hisDrum) { const m = ds.find(d => d.id === S.hisDrum); if (m) return m; }
  return ds.sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0] || null; }
function nextMove(e, S, P, h, c) {
  const dx = P.x - e.x, ad = Math.abs(dx), G = S.G;
  e.face = Math.sign(dx) || e.face;
  /* ONE-HANDED: he goes for his hatchet first, a while into it (the walk is your window) */
  if (S.oneHand && S.axe && (S.axe.t || 0) > 1.2) { S.n.fetches++; setMode(e, 'fetch', 9); e.pulling = false; if (!S.told.fetch) { S.told.fetch = 1; c.number(e.x, e.y - 74, BZC_SAY.oneHand, '#ffd36b'); } return; }
  if (S.nextCross && !S.oneHand) { S.nextCross = false; if (ad < BZC.cross.reach + 40) { S.n.crosses++; tell(e, S, c, 'crossTell', BZC.cross.tell * quick(S)); return; } }
  if (!S.script || S.step >= S.script.length) { S.cycle++; S.n.cycles++; S.script = nextScript(S); S.step = 0; }
  let m = S.script[S.step++];
  if (m === 'throw' && (S.throwCd > 0 || ad < BZC.throw.min || S.oneHand)) m = 'flurry';
  if (m === 'cross' && S.oneHand) m = 'flurry';
  if (m === 'pounce' && (S.pounceCd > 0 || ad < BZC.pounce.min)) m = ad > BZC.flurry.reach + 50 ? 'pounce' : 'flurry';
  if (m === 'pounce' && S.pounceCd > 0) m = 'flurry';
  if ((m === 'flurry' || m === 'cross' || m === 'double') && ad > BZC.flurry.reach + 46) { if (S.throwCd <= 0 && ad >= BZC.throw.min && !S.oneHand) m = 'throw'; else if (S.ph >= 2 && S.pounceCd <= 0 && ad >= BZC.pounce.min) m = 'pounce'; else { setMode(e, 'walk', 0.45); S.step--; return; } }
  switch (m) {
    case 'flurry': S.chainLeft = BZC.flurry.n; S.whiffed = false; S.n.flurries++; e.left = true; tell(e, S, c, 'flurryTell', BZC.flurry.tell * quick(S)); return;
    case 'cross': S.n.crosses++; tell(e, S, c, 'crossTell', BZC.cross.tell * quick(S)); if (!S.told.cross) { S.told.cross = 1; c.number(e.x, e.y - 74, BZC_SAY.cross, '#ff6b6b'); } return;
    case 'double': S.n.doubles++; tell(e, S, c, 'doubleTell', BZC.double.tell * (frenzied(S) ? BZC.frenzy.quick : 1)); if (!S.told.double) { S.told.double = 1; c.number(e.x, e.y - 74, BZC_SAY.double, '#ff6b6b'); } return;
    case 'throw': S.n.throws++; S.throwCd = BZC.throw.cd; tell(e, S, c, 'throwTell', BZC.throw.tell); if (!S.told.throw) { S.told.throw = 1; c.number(e.x, e.y - 74, BZC_SAY.throw, '#ffd36b'); } return;
    case 'pounce': S.n.pounces++; S.pounceCd = BZC.pounce.cd; addRage(e, S, c, 4); tell(e, S, c, 'coil', BZC.pounce.tell); S.leapX = clampX(G, P.x); if (!S.told.pounce) { S.told.pounce = 1; c.number(e.x, e.y - 80, BZC_SAY.pounce, '#ff6b6b'); } return;
    case 'split': S.n.splits++; tell(e, S, c, 'splitTell', BZC.split.tell); if (!S.told.split) { S.told.split = 1; c.number(e.x, e.y - 80, BZC_SAY.split, '#ff6b6b'); } return;
  }
  setMode(e, 'walk', 0.5);
}
/* THE TOLD BLOWS */
function stepMove(e, S, dt, P, h, c) {
  const G = S.G, f = e.face || 1, after = (t) => setMode(e, 'recover', t ?? BZC.gap[S.ph - 1] * (frenzied(S) ? 0.7 : 1));
  e.vx = 0;
  const front = (reach, y0 = 30) => [f > 0 ? e.x - 6 : e.x - reach, f > 0 ? e.x + reach : e.x + 6, e.y - y0, e.y];
  const land = (box, d, name, o) => { const r = c.hit(box, d, name, o); if (r) blowLanded(e, S, c, d); return r; };
  switch (e.mode) {
    case 'flurryTell': case 'flurryBeat': if (e.modeT <= 0) { setMode(e, 'flurry', BZC.flurry.t); c.sound('slash'); } return;
    case 'flurry': { const x0 = e.x; e.x = clampX(G, e.x + f * BZC.flurry.step * dt); e.vx = (e.x - x0) / Math.max(1e-6, dt);
      const hit = land(front(BZC.flurry.reach), BZC.flurry.dmg, MOVE_NAME.flurry, { blockable: true, key: 'fl' + S.act });
      if (hit) S.flLanded = true;
      if (e.mode !== 'flurry') return;
      if (e.modeT <= 0) { S.n.chops++;
        /* THE CHAIN GOES ON ONLY WHILE CHOPS LAND: a whiff (or a turned chop) ends the run - four landed and the fifth is the CROSS-CHOP */
        const landed = S.flLanded && !S.whiffed; S.flLanded = false; S.chainLeft--;
        if (!landed) { S.chainLeft = 0; after(); return; }
        if (S.chainLeft > 0) { e.face = Math.sign(P.x - e.x) || f; e.left = !e.left; tell(e, S, c, 'flurryBeat', BZC.flurry.beat * quick(S)); return; }
        if (!S.oneHand) { S.n.crosses++; tell(e, S, c, 'crossTell', BZC.cross.tell * quick(S)); return; }
        after(); } return; }
    case 'crossTell': if (e.modeT <= 0) { e.face = Math.sign(P.x - e.x) || f; setMode(e, 'cross', BZC.cross.t); S.crossHit = false; c.sound('slam'); } return;
    case 'cross': { if (land(front(BZC.cross.reach), BZC.cross.dmg, MOVE_NAME.cross, { key: 'cx' + S.act })) S.crossHit = true;
      if (e.mode === 'cross' && e.modeT <= 0) { if (!S.crossHit) stuck(e, S, c); else after(0.45); } return; }
    case 'doubleTell': if (e.modeT <= 0) { setMode(e, 'double', BZC.double.t); c.sound('slam'); c.shake(4); c.fx('chop', e.x + f * 24, G.floorY); } return;
    case 'double': land(front(BZC.double.reach, 40), BZC.double.dmg, MOVE_NAME.double, { key: 'dc' + S.act }); if (e.mode === 'double' && e.modeT <= 0) after(0.65); return;
    case 'throwTell': if (e.modeT <= 0) { e.face = Math.sign(P.x - e.x) || f; setMode(e, 'throw', 0.25); S.axe = { x: e.x + e.face * 12, x0: e.x, y: G.floorY - BZC.throw.hy, dir: e.face, act: S.act, fly: true, t: 0 }; S.oneHand = true; S.knocked = false; c.sound('throw'); } return;
    case 'throw': if (e.modeT <= 0) after(0.35); return;
    case 'whirlTell': if (e.modeT <= 0) { setMode(e, 'whirl', BZC.whirl.t); c.sound('slash'); } return;
    case 'whirl': { const r = BZC.whirl.r; land([e.x - r, e.x + r, e.y - 34, e.y], BZC.whirl.dmg, MOVE_NAME.whirl, { blockable: true, key: 'wh' + S.act + (e.modeT > BZC.whirl.t / 2 ? 'a' : 'b') });
      if (e.mode === 'whirl' && e.modeT <= 0) after(0.45); return; }
    case 'coil': if (e.modeT <= 0) { e.face = Math.sign(S.leapX - e.x) || f; setMode(e, 'pounce', BZC.pounce.t); S.leapFrom = e.x; c.sound('leap'); } return;
    case 'pounce': { const q = Math.max(0, Math.min(1, 1 - e.modeT / BZC.pounce.t)), dist = Math.min(Math.abs(S.leapX - S.leapFrom) + 40, BZC.pounce.v * BZC.pounce.t);
      e.x = clampX(G, S.leapFrom + e.face * dist * q); e.lift = Math.sin(q * Math.PI) * 10;
      land([e.x - 16, e.x + 16, e.y - 22, e.y + 2], BZC.pounce.dmg, MOVE_NAME.pounce, { key: 'po' + S.act });
      if (e.modeT <= 0) { e.lift = 0; setMode(e, 'land', BZC.pounce.land); c.shake(3); c.sound('slam'); } return; }
    case 'land': if (e.modeT <= 0) after(0.25); return;
    case 'splitTell': if (e.modeT <= 0) { setMode(e, 'split', BZC.split.t); c.sound('slam'); c.shake(6); c.fx('split', e.x, G.floorY);
        land([e.x - BZC.split.r, e.x + BZC.split.r, e.y - 30, e.y + 2], BZC.split.dmg, MOVE_NAME.split, { key: 'sp' + S.act });
        for (const d of [-1, 1]) S.waves.push({ x: e.x + d * BZC.split.r, dir: d, v: BZC.split.v, life: BZC.split.life, dmg: BZC.split.wave, key: 'sw' + S.act + d, name: MOVE_NAME.wave });
        crackSlab(e, S, c); } return;
    case 'split': if (e.modeT <= 0) after(0.6); return;   /* (he stands a beat with both axes in the floor: committed) */
    default: setMode(e, 'walk', 0.5);
  }
}
/* THE RING NARROWS: the ground-splitter cracks the outer slab on the side he faces (the other side if that one is gone); a cracked slab breaks on the next */
function crackSlab(e, S, c) { let i = (e.face || 1) > 0 ? 1 : 0; if (S.cracked[i] >= 2) i = 1 - i; if (S.cracked[i] >= 2) return;
  S.cracked[i]++; c.crack(i, S.cracked[i]); c.number(S.G.slabs[i].x0 + 32, S.G.floorY - 40, S.cracked[i] === 1 ? BZC_SAY.cracked : BZC_SAY.breaks, S.cracked[i] === 1 ? '#ffd36b' : '#ff6b6b'); }
/* HIS THINGS IN THE ROOM: the hatchet in flight (it sticks in the floor where it comes down), the split running the floor */
function stepWorld(e, S, dt, h, c) {
  const G = S.G, T = BZC.throw, a = S.axe;
  if (a && a.fly) { a.x += a.dir * T.sp * dt; const out = Math.abs(a.x - a.x0) > T.range || a.x < G.x0 + 10 || a.x > G.x1 - 10;
    const hitIt = !out && c.hit([a.x - T.hr - 4, a.x + T.hr + 4, a.y - T.hr, a.y + T.hr], T.dmg, MOVE_NAME.throw, { blockable: true, key: 'ax' + a.act, noKnock: true });
    if (hitIt) blowLanded(e, S, c, T.dmg);
    if (out || hitIt) { a.fly = false; a.x = Math.max(G.x0 + 14, Math.min(G.x1 - 14, a.x)); a.y = G.floorY - 2; c.sound('clank'); } }
  if (a && !a.fly) a.t = (a.t || 0) + dt;
  for (const w of S.waves) { w.life -= dt; w.x += w.dir * w.v * dt; if (w.x < G.x0 + 4 || w.x > G.x1 - 4) w.life = 0;
    if (w.life > 0) c.hit([w.x - 6, w.x + 6, G.floorY - 14, G.floorY + 2], w.dmg, w.name, { key: w.key, noKnock: true }); }
  S.waves = S.waves.filter(w => w.life > 0);
}

/* ---------- THE BOT'S READING (src/lab.js) ----------
   A HUMAN BOT: it sees a tell PLAN.react s late (the v2 profile's eyes do that already) and misreads some; it blocks the flurry (or backs off - the run stops on a whiff),
   rolls or backs off the cross-chop, the double chop and the whirl, jumps the hatchet, the pounce and the split; it never stands at his back long; it does NOT swing
   into TAKE IT (a light blow feeds him) - it waits it out or goes round. THE RULE: when he FRENZIES it runs to the nearest drum that is not his and strikes it
   (any blow on it is a beat: a swing facing it), then hits him hard while he is broken. It hits him while he is committed (recoveries, a reel, the fetch, a landing, stuck).
   s = { P: { x, y, face, ground, atk }, e, S, drums: [{ id, x, spent, his }], reach, shield, t, rng, mem, v2, hero, rest } -> { gx, face, atk, jump, dodge, block, why } */
export const PLAN = { react: 0.25, miss: 0.12, poke: 0.5 };
export function bzcPlan(s) { const o = bzcPlan0(s); if (globalThis.__bzcWhy) { const k = o.why; globalThis.__bzcWhy[k] = (globalThis.__bzcWhy[k] || 0) + 1; } return o; }
function bzcPlan0(s) {
  const { P, e, S, reach } = s, G = S.G, out = { gx: null, face: P.face, atk: false, jump: false, dodge: false, block: false, up: false, down: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0;
  mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 600) { mem.seen.clear(); mem.roll.clear(); }
  const seenFor = (key, d = s.v2 ? 0 : PLAN.react) => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= d; };
  const roll = (key, pr) => { if (!mem.roll.has(key)) mem.roll.set(key, rng() < pr); return mem.roll.get(key); };
  const lo = G.x0 + 12, hi = G.x1 - 12, clamp = x => Math.max(lo, Math.min(hi, x));
  const kx = e.x, side = Math.sign(P.x - kx) || 1, dx = Math.abs(kx - P.x), same = Math.abs(P.y - e.y) < 30, hitR = reach + BZC.w / 2 - 2;
  const swing = fx => { out.face = Math.sign(fx - P.x) || out.face; out.atk = P.atk < 0; };
  const roomDir = ax => { const away = P.x <= ax ? -1 : 1, room = d => (d < 0 ? P.x - lo : hi - P.x); return room(away) >= 50 ? away : -away; };
  /* 0. THINGS ON THE FLOOR: the split coming - jump as it arrives; the hatchet at the waist - jump it (or a shield) */
  for (const w of S.waves || []) { const ahead = (P.x - w.x) * w.dir; if (ahead > -4 && ahead < 26 + w.v * 0.05 && P.ground && same) { out.jump = true; out.gx = P.x; out.why = 'jump the split'; return out; } }
  if (S.axe && S.axe.fly && P.ground) { const a = S.axe, dd = (P.x - a.x) * a.dir;
    if (dd > -6 && dd < 70 && seenFor('ax' + a.act)) { if (s.shield && roll('axb' + a.act, 0.5)) { out.block = true; out.face = Math.sign(a.x - P.x) || 1; out.why = 'block the hatchet'; return out; } if (dd < 44) { out.jump = true; out.gx = P.x; out.why = 'jump the hatchet'; return out; } } }
  /* 1. HIS BLOWS (a quarter-second late, some misread) */
  if (/Tell$/.test(e.mode) || STRIKE.has(e.mode) || e.mode === 'coil' || e.mode === 'flurryBeat') {
    const miss = s.v2 ? false : roll('m' + S.act + e.mode, PLAN.miss), seen = seenFor('a' + S.act + e.mode);
    if (seen && !miss) {
      if ((e.mode === 'coil' || e.mode === 'pounce') && dx < 150 && same) { if (e.mode === 'pounce' || e.modeT < 0.16) { out.jump = P.ground; out.gx = clamp(P.x + side * 10); out.why = 'jump the pounce'; return out; } out.gx = P.x; out.why = 'wait for the pounce'; return out; }
      if ((e.mode === 'splitTell') && dx < 120) { out.gx = clamp(kx + side * (BZC.split.r + 40)); out.why = 'off the splitter'; return out; }
      if ((e.mode === 'crossTell' || e.mode === 'cross' || e.mode === 'doubleTell' || e.mode === 'double') && dx < BZC.double.reach + 34 && same) {
        out.gx = clamp(kx + side * 90); if (dx < 46 && e.modeT < 0.2 && /Tell$/.test(e.mode) && !s.noRoll && P.ground) out.dodge = true; out.why = 'out of the heavy chop'; return out; }
      if ((e.mode === 'whirlTell' || e.mode === 'whirl') && dx < BZC.whirl.r + 16) { out.gx = clamp(kx + side * (BZC.whirl.r + 30)); out.why = 'out of the whirl'; return out; }
      if ((e.mode === 'flurryTell' || e.mode === 'flurryBeat' || e.mode === 'flurry') && dx < BZC.flurry.reach + 40 && same) {
        if (s.shield) { out.block = true; out.face = Math.sign(kx - P.x) || 1; out.why = 'block the flurry'; return out; }
        out.gx = clamp(kx + side * 84); if (dx < 46 && e.modeT < 0.16 && /Tell$/.test(e.mode) && !s.noRoll && P.ground) out.dodge = true; out.why = 'back off the flurry'; return out; }
    }
  }
  /* 2. OPEN (broken or stuck): hit him; WARDED: x0.4 - hit him all the same, it is not wasted, but not greedy */
  if (bzcOpen(e)) { const st = s.tip ? 30 : 14; out.gx = clamp(kx + side * st); if (dx < hitR + 4 && same) swing(kx); out.why = 'hit him: he is open'; return out; }
  /* 3. THE RULE: HE FRENZIES - to the nearest drum that is not his (or spent), and strike it */
  const free = (s.drums || []).filter(d => !d.his && !d.spent);
  if (S.frenzy > 0 && free.length && S.ward <= 0 && !s.rest) { const d = free.slice().sort((a, z) => Math.abs(a.x - P.x) - Math.abs(z.x - P.x))[0];
    const stand = d.x + (P.x < d.x ? -14 : 14), at = Math.abs(P.x - stand) < 10;
    if (!at) { out.gx = clamp(stand); out.why = 'to the drum: he frenzies'; return out; }
    swing(d.x); out.gx = P.x; out.why = 'strike the drum'; return out; }
  /* 4. TAKE IT: never into his axes - wait it out off him (or round him) */
  if (e.mode === 'take') { out.gx = clamp(kx + side * (hitR + 30)); out.face = Math.sign(kx - P.x) || 1; out.why = 'he takes it: off him'; return out; }
  if (s.rest) { out.gx = clamp(kx + side * (BZC.flurry.reach + 64)); out.face = Math.sign(kx - P.x) || 1; out.why = 'winded: off him'; return out; }
  /* 5. FIGHT HIM: while he is committed - and only pokes into his walk (each blow there heats him toward TAKE IT) */
  const committed = e.mode === 'reel' || e.mode === 'land' || e.mode === 'split' || e.mode === 'throw' || e.mode === 'fetch' || e.mode === 'warcry' || e.mode === 'drumWalk' || e.mode === 'drumStrike' || e.mode === 'recover';
  if (committed && same && !(e.mode === 'recover' && e.modeT < 0.12)) { if (dx > hitR - 2) { out.gx = clamp(kx + side * (hitR - 8)); out.why = 'in on him: committed'; return out; } swing(kx); out.gx = P.x; out.why = 'hit him: committed'; return out; }
  if (e.mode === 'walk' && dx < hitR + 34) { out.face = Math.sign(kx - P.x) || 1;
    if (S.heat < BZC.take.heat - 1 && roll('poke' + S.cycle + '_' + S.step + '_' + Math.floor(t * 2), PLAN.poke)) { if (dx > hitR - 4) { out.gx = clamp(kx + side * (hitR - 8)); out.why = 'in to him'; return out; } swing(kx); out.gx = P.x; out.why = 'into his walk'; return out; } }
  out.gx = clamp(kx + side * Math.max(52, hitR + 22)); out.face = Math.sign(kx - P.x) || 1; out.why = 'keep off his axes'; return out;
}
