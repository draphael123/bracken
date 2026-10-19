// src/paladin-boss.js - THE PALADIN, THE LIT CHURCH's boss - THE HERO AS THE BOSS (claude/church2: Daniel 10-10 "the sprite of the paladin, a little bigger, use his
// moves, play like a normal player character"; RE-POINTED by claude/church3 to the PALADIN 4 kit and the church's FLAME - Daniel 10-17 "flames in the boss").
//
// WHO HE IS (design standard B5 + B11 + B17): the hero Paladin (src/chars.js bakePaladin, drawn x PB.scale by main.js like the Death Knight boss) with ONLY the
//   hero's PALADIN 4 kit (src/holy-ground.js HG is his numbers, scaled to a boss):
//     the WAR HAMMER chain (his X), CONVICTION (five pips: earned by his hammer landing, by his ward turning your blows and by PRAYER), the tiers he spends them on
//     - SMITE (1), TWIN SMITE (2), RADIANCE (3), RADIANCE+ (4, from the Bastion), SUNFALL (5, the finisher) - each spend lighting his HALLOWED AURA (his holy ground,
//     travelling with him: in it he hits x HG_HIT, a hero standing in it burns), the SPEAR OF LIGHT (his skill), HEAVEN'S ARC (his up-air: the answer to a hero
//     over his head), PRAYER (the crouch rule: he kneels by a holy light to fill his pips - x3 at a lit brazier), the LIGHT-WARD (his guard: ALL ROUND), the
//     SANCTUARY STEP (his dodge), VERDICT (his held strike, the Bastion) and DAWNFALL (his plunge, the Earthbreaker). He walks at a hero's pace and never teleports.
// A DUELIST (B11): ALWAYS HITTABLE. On guard (walking, recovering, the ward raised, a step) THE LIGHT-WARD turns a blow from ANY side - the Paladin 4 ward is all
//   round, so there is no going round him - at PB.ward.take (B15: never less than 0.4) and the turned blow FEEDS his conviction; while he is COMMITTED (every told
//   move, its recovery, his prayer, a reel) a blow lands whole.
// THE CENTRAL MECHANIC (B17, the level's verb - THE FLAME): the sanctuary's three BRAZIERS stand dark. Carry a flame (E at the votive stand by the door, the altar
//   fire at the east end, or any lit brazier) and LIGHT A BRAZIER BESIDE HIM (src/flame.js FIGHT.beside): the holy fire breaks his LIGHT-WARD - HE FALTERS:
//   PB.falterT s on one knee, OPEN (B10: the gold ring + timer), x PB.falterMul, at most PB.falterCap of him; B4 he stands still; B3 then a told PB.wardT s WARD.
//   A brazier lit away from him is a holy light he PRAYS at (x3 pips) - the trade. THE BASTION (P2) turns it: he SNUFFS the lit braziers (a told move, its own
//   windup + release: the hammer driven down into the fire) - and a dark brazier at his feet is the next one to light, under his hammer.
// HIS TOLD MOVES (each its own windup + release frame off the hero sheet, PAL_POSES - B16; one windup at a time):
//   WAR HAMMER   !   two or three blows stepping in (a shield turns each; ON THE BEAT he reels)                         answer: block / parry / back off
//   SMITE        !   (1 pip) the quick holy strike in front of him                                                     answer: block / back off
//   TWIN SMITE   !   (2 pips) the smite, and the backhand a beat later                                                 answer: block twice / back off
//   RADIANCE     !!  (3 pips; RADIANCE+ at 4 from the Bastion: bigger, it mends him a little) a burst of light all round him   answer: get out of it
//   SUNFALL      !!  (5 pips, the finisher) five crosses round him, then the light comes down on them                  answer: stand between the columns, or far off
//   SPEAR OF LIGHT ! the spear drawn over his shoulder, then thrown at your waist (it stops at the first hero)          answer: jump it / a shield
//   HEAVEN'S ARC !  a hero over his head: the hammer whirled overhead, two hits                                       answer: do not hang over him
//   P2 VERDICT  !!  the hammer held up: a sigil falls where you stand, and again, and again - then light strikes them all   answer: keep moving off the sigils
//   P3 DAWNFALL !!  a red ring at your feet, he leaps and comes down hammer-first: a pillar of light, quakes both ways      answer: off the ring, jump the quake
//   (his PRAYER, his WARD stance, his SNUFF and his STEP are told stances: a word, a glow, the pose - B17's "quiet-but-told" reading)
// PURE: no DOM, no main.js. The world is a context `c` (src/paladin-boss-hands.js binds it); c.hg is a makeHolyGround instance (side 'foe') for his aura.
// pbPlan is the boss lab's HUMAN bot (src/lab.js). DIAL_EXEMPT in src/boss-pressure.js (self-tuned in this lane).
import { FIGHT } from './flame.js';

export const PB = {
  hp: 1850, w: 18, h: 36,
  heroHp: { knight: 1.35, warden: 0.64, pyro: 0.95, paladin: 1.0 }, heroDmg: { knight: 2.6, warden: 1.4, pyro: 2.0, paladin: 1.25 },   /* heroDmg: his blows on that hero (the shield hero turns his yellow ones; the red ones must cost him) */   /* (claude/church3) THE DUEL PER HERO (the wardgap lane's accepted pattern): the shield hero turns every yellow blow of his, so he stands longer against her - B15's wall unchanged */ scale: 1.5, markH: 62,
  walk: 64, keep: 40, turn: 0.42, gap: [0.62, 0.52, 0.44],
  conv: { pips: 5, start: 2, land: 0.5, turned: 0.34, blocked: 0.3, kneel: 1.25, anywhere: 0.4, refill: 2 },   /* blocked: his blow taken on a shield still earns (the hero's rule: a blow that meets you) */   /* pips: his hammer landing +land, a blow his ward turns +turned, prayer a second (kneel at a lit brazier, anywhere slow) */
  ward: { take: 0.4 },                                      /* B15: a turned blow still bites x take */
  falterT: 3.4, falterMul: 1.7, falterCap: 0.15, wardT: 2.0, reelT: 0.8,
  aura: { r: 52, base: 3, perPip: 1.1, burnK: 0.32, mend: 0.18 },   /* his HALLOWED AURA: HG.aura scaled to a boss; lit for base + perPip s a pip spent; burnK x the hero's burn on a hero in it; mend x HG.heal */
  chain: { tell: 0.55, beat: 0.4, t: 0.18, n: [2, 3, 3], reach: 40, step: 120, dmg: 22 },
  smite: { tell: 0.5, t: 0.22, reach: 46, dmg: 26, cost: 1 },
  twin: { gap: 0.3, cost: 2 },
  radiance: { tell: 0.8, t: 0.35, r: 70, dmg: 26, cost: 3 },
  radPlus: { tell: 0.85, r: 92, dmg: 30, mend: 0.012, cost: 4 },
  sunfall: { tell: 1.0, gap: 66, r: 14, t: 0.35, dmg: 40, near: 165, cost: 5 },
  spear: { tell: 0.7, sp: 340, range: 300, dmg: 24, hy: 20, hr: 6, cd: 7, min: 96 },
  arc: { tell: 0.4, t: 0.32, dmg: 20, cd: 4.5, w: 28 },
  pray: { below: 2, t: 2.4, cd: 8, walkT: 3, far: 110 },
  snuff: { tell: 0.75, t: 0.4, cd: 4, walkT: 3, reach: 170 },
  verdict: { every: 0.42, max: 3, r: 14, t: 0.35, dmg: 30 },
  dawn: { tell: 0.85, fly: 0.55, r: 30, dmg: 34, wave: 18, v: 175, life: 1.05 },
  step: { t: 0.26, v: 240, cd: 3.5, pr: 0.4 },
  brazier: { near: FIGHT.beside },
  p2: 0.65, p3: 0.3,
};
/* THE CYCLES, by phase (cycle k uses [k % n]); SUNFALL, PRAYER, the SNUFF, HEAVEN'S ARC and the STEP are not in them - they come off his pips, the braziers and you (nextMove) */
export const CYCLES = {
  1: [['chain', 'smite', 'spear', 'chain', 'radiance'], ['spear', 'chain', 'twin', 'chain', 'smite'], ['chain', 'twin', 'radiance', 'chain', 'spear']],
  2: [['verdict', 'chain', 'twin', 'spear', 'chain'], ['chain', 'radiance', 'verdict', 'chain', 'smite'], ['spear', 'verdict', 'chain', 'twin', 'radiance']],
  3: [['dawn', 'chain', 'twin', 'verdict', 'spear'], ['chain', 'dawn', 'radiance', 'chain', 'verdict'], ['twin', 'dawn', 'spear', 'chain', 'radiance']],
};
/* THE MOVES: the mode while it is told, its mark, the answer (src/marks.js BY_HAND keeps the same rows) */
export const MOVES = {
  chainTell: { mark: '!', answer: 'block' }, chainBeatTell: { mark: '!', answer: 'block' }, smiteTell: { mark: '!', answer: 'block' }, twinTell: { mark: '!', answer: 'block' },
  radianceTell: { mark: '!!', answer: 'dodge' }, sunfallTell: { mark: '!!', answer: 'dodge' }, spearTell: { mark: '!', answer: 'jump' }, arcTell: { mark: '!', answer: 'dodge' },
  verdictTell: { mark: '!!', answer: 'dodge' }, dawnTell: { mark: '!!', answer: 'dodge' }, prayTell: { mark: '', answer: '' }, snuffTell: { mark: '', answer: '' },
};
export const MOVE_NAME = { chain: 'HIS WAR HAMMER', smite: 'SMITE', twin: 'TWIN SMITE', radiance: 'RADIANCE', sunfall: 'SUNFALL', spear: 'THE SPEAR OF LIGHT', arc: 'HEAVEN\'S ARC',
  verdict: 'VERDICT', dawn: 'DAWNFALL', quake: 'THE QUAKE', ground: 'HIS HALLOWED AURA' };
/* the order the talent trees come in (the hero's own three: src/main.js TBR) */
export const PHASE_NAME = { 1: 'THE LIGHTBRINGER', 2: 'THE BASTION', 3: 'THE EARTHBREAKER' };
const STRIKE = new Set(['chain', 'smite', 'twin', 'radiance', 'sunfall', 'spear', 'arc', 'verdict', 'dawn', 'land', 'snuff']);
const GUARD_MODES = new Set(['walk', 'recover', 'guard', 'step']);
export const isGuardMode = m => GUARD_MODES.has(m);

/* ---------- HIS SPRITE IS THE HERO'S OWN SHEET (src/chars.js bakePaladin): main.js bakes this list into SPR.paladinboss, a pose per frame, drawn x PB.scale.
   [pose, frame]; the LAST row is his hurt (HAS_HURT reads the last frame of a set). Every told move has its OWN windup + release here (B16). PAL_IDX names the rows
   main.js re-makes from the hero's frames (src/redraw/paladin_boss_art.js: his falter, his reel) ---------- */
export const PAL_POSES = [['idle', 0], ['run', 0], ['run', 2], ['run', 4],
  ['atk', 0], ['atk', 1], ['atk', 2],                      /* 4-6   the war hammer: drawn back, the cut, the follow-through */
  ['smiteQ', 0], ['smiteQ', 1], ['smiteB', 0], ['smiteB', 1], /* 7-10  SMITE (windup, release), TWIN SMITE's backhand (windup, release) */
  ['radiance', 0], ['radiance', 1], ['radiancePlus', 0], ['radiancePlus', 1],   /* 11-14 RADIANCE, RADIANCE+ */
  ['sunfall', 0], ['sunfall', 1],                          /* 15,16 SUNFALL */
  ['lanceDraw', 0], ['lanceThrow', 0],                     /* 17,18 THE SPEAR OF LIGHT */
  ['rise', 0], ['rise', 2],                                /* 19,20 HEAVEN'S ARC (the up-air whirl) */
  ['vWind', 0], ['vHold', 0], ['vRel', 0],                 /* 21-23 VERDICT: the wind, the hold, the release */
  ['leap', 0], ['leap', 1], ['plunge', 0], ['leapLand', 0], /* 24-27 DAWNFALL: back, the top, hammer-first down, the landing */
  ['block', 0], ['block', 1],                              /* 28,29 THE LIGHT-WARD, raised */
  ['pray', 0], ['pray', 1],                                /* 30,31 PRAYER */
  ['heavy', 0], ['heavy', 2],                              /* 32,33 THE SNUFF: the hammer hauled up over the brazier, driven down into it */
  ['sStep', 0],                                            /* 34    SANCTUARY STEP */
  ['slump', 0], ['hurt', 0]];                              /* 35 slump (he falters) | 36 hurt */
export const PAL_IDX = { falter: 35, hurt: 36, snuffTell: 32, snuff: 33 };
export function palFrame(e) {
  const m = e.mode;
  switch (m) {
    case 'chainTell': case 'chainBeatTell': return 4; case 'chain': return e.modeT > PB.chain.t * 0.5 ? 5 : 6;
    case 'smiteTell': return 7; case 'smite': return 8;
    case 'twinTell': return 7; case 'twin': return e.twin2 ? 10 : 8; case 'twinGap': return 9;
    case 'radianceTell': return e.plus ? 13 : 11; case 'radiance': return e.plus ? 14 : 12;
    case 'sunfallTell': return 15; case 'sunfall': return 16;
    case 'spearTell': return 17; case 'spear': return 18;
    case 'arcTell': return 19; case 'arc': return 20;
    case 'verdictTell': return (e.sigils || 0) < 1 ? 21 : 22; case 'verdict': return 23;
    case 'dawnTell': return 24; case 'dawn': return e.lift > 40 && e.modeT > PB.dawn.fly * 0.5 ? 25 : 26; case 'land': return 27;
    case 'guard': return 28 + Math.floor((e.anim || 0) * 3) % 2;
    case 'prayWalk': break;
    case 'prayTell': case 'pray': return 30 + Math.floor((e.anim || 0) * 2) % 2;
    case 'snuffWalk': break;
    case 'snuffTell': return 32; case 'snuff': return 33;
    case 'step': return 34;
    case 'falter': return 35; case 'reel': return 36; case 'sleep': case 'wake': return 0;
  }
  if (e.hurtT > 0) return 36;
  return Math.abs(e.vx || 0) > 3 ? 1 + Math.floor((e.anim || 0) * 7) % 3 : 0;
}

/* ---------- THE SANCTUARY ---------- */
/* local columns (0..41), the floor's surface row R (the hero stands on R-1). THE CHOIR STALLS (one-way ledges), THE ALTAR at the east end (drawn), THE ROSE WINDOW
   over it (drawn), THREE BRAZIERS on the floor (dark: his opening when you light one beside him), and two fires that always burn - THE VOTIVE STAND by the west
   door and THE ALTAR FIRE (a flame in your hand). He starts at `him` */
export const PB_STAGE = { W: 42, door: 6, braziers: [12, 21, 30], votive: 1, altar: 40, stalls: [{ x0: 2, x1: 9, dy: 3 }, { x0: 32, x1: 39, dy: 3 }], him: 30, roof: 20 };
export function stagePaladin(W, T, TS, sx, R) {
  const { set, block, ent, air } = W, ex = sx + PB_STAGE.W;
  const lamps = PB_STAGE.braziers.map((x, i) => ({ id: 'arena' + i, x: sx + x, y: R - 1, room: 'sanctuary', kind: 'arena', brazier: true, lit: false }));
  const sources = [{ id: 'pbVotive', x: sx + PB_STAGE.votive, y: R - 1, kind: 'votive' }, { id: 'pbAltar', x: sx + PB_STAGE.altar, y: R - 1, kind: 'brazier' }];
  const carve = () => {
    air(sx, ex - 1, R - PB_STAGE.roof, R - 1);
    block(sx - 1, sx - 1, R - PB_STAGE.roof - 4, R - PB_STAGE.door - 1);   /* the west wall over the door you came in by (shut behind you) */
    block(ex, ex, R - PB_STAGE.roof - 4, R - 1);
    block(sx - 1, ex, R - PB_STAGE.roof - 4, R - PB_STAGE.roof - 1);        /* the vault */
    for (const l of PB_STAGE.stalls) for (let x = sx + l.x0; x <= sx + l.x1; x++) set(x, R - l.dy, T.ONEWAY);
    for (const l of lamps) ent('lclamp', l.x, l.y, { id: l.id, arena: true });
    for (const s of sources) ent('lcsource', s.x, s.y, { id: s.id });
    ent('paladinboss', sx + PB_STAGE.him, R - 1, { face: -1 });
  };
  const arena = { x0: sx * TS, x1: ex * TS, floor: R * TS, trigger: (sx + 2) * TS, wallL: sx - 1, wallR: ex, boss: 'paladinboss', music: 'paladin',
    tint: '#d8c070', tintA: 0.04, start: [sx + 2, R - 1], y0: (R - PB_STAGE.roof) * TS, y1: (R + 1) * TS, pb: { sx, R } };
  return { arena, carve, lamps, sources };
}
/* the sanctuary in world px, from the arena */
export function geom(A, TS = 16) {
  const q = A.pb, X = c => (q.sx + c) * TS;
  return { TS, x0: X(0), x1: X(PB_STAGE.W), floorY: q.R * TS, roofY: (q.R - PB_STAGE.roof) * TS,
    lamps: PB_STAGE.braziers.map((x, i) => ({ id: 'arena' + i, x: X(x) + 8 })), fires: [X(PB_STAGE.votive) + 8, X(PB_STAGE.altar) + 8],
    stalls: PB_STAGE.stalls.map(l => ({ x0: X(l.x0), x1: X(l.x1 + 1), y: (q.R - l.dy) * TS })) };
}

/* ---------- ONE FIGHT ---------- */
export function newFight(G) {
  return { G, ph: 1, cycle: 0, step: 0, script: null, act: 0, conv: PB.conv.start, ward: 0, falterTaken: 0, behindT: 0, chainLeft: 0,
    marks: [], sigils: [], waves: [], spear: null, leap: null, kneelId: null, snuffId: null, prayCd: 3, spearCd: 2, arcCd: 0, snuffCd: 2, stepCd: 2, heat: 0, told: {}, lastConv: PB.conv.start,
    n: { cycles: 0, falters: 0, breaks: 0, litFar: 0, wards: 0, warded: 0, guarded: 0, fed: 0, landed: 0, prayers: 0, praysCut: 0, snuffs: 0, snuffsCut: 0, steps: 0, smites: 0, twins: 0,
      radiances: 0, pluses: 0, sunfalls: 0, spears: 0, arcs: 0, verdicts: 0, dawns: 0, chains: 0, ripostes: 0, auras: 0, moves: {} } };
}
export const pPhase = e => (e.hp <= e.maxHp * PB.p3 ? 3 : e.hp <= e.maxHp * PB.p2 ? 2 : 1);
export const pbOpen = e => !!e && e.mode === 'falter' && (e.open || 0) > 0;
export const pips = S => Math.floor((S.conv || 0) + 1e-6);
/* THE LIGHT-WARD: on guard it turns a blow from ANY side (the Paladin 4 ward is all round) */
export const guarded = (e, S) => !!e && !pbOpen(e) && !(e.broken > 0) && GUARD_MODES.has(e.mode);
export const litBraziers = c => (c.lamps ? c.lamps().filter(l => l.lit).length : 0);
/* his aura, and whether he (or a body) stands in it */
const auraOf = (e, c) => (c.hg ? c.hg.of(e) : null);
export const inHisAura = (e, c, b) => { const ci = auraOf(e, c); return !!ci && c.hg.inside(ci, b || e); };

const nextScript = S => { const set = CYCLES[S.ph]; return set[S.cycle % set.length].slice(); };
function setMode(e, m, t) { e.mode = m; e.modeT = t; }
const clampX = (G, x) => Math.max(G.x0 + 18, Math.min(G.x1 - 18, x));
function tell(e, S, c, mode, t) { setMode(e, mode, t); S.act++; S.n.moves[mode] = (S.n.moves[mode] || 0) + 1; const mv = MOVES[mode]; if (mv && mv.mark) c.mark(mv.mark); c.sound(mv && mv.mark === '!!' ? 'tellHard' : mv && mv.mark ? 'tell' : 'glow'); }
const setConv = (S, v) => { S.conv = Math.max(0, Math.min(PB.conv.pips, v)); };
/* A SPEND: the pips go, and his HALLOWED AURA lights at his feet (the hero's rule: every spend lights it - base + perPip s a pip) */
function spend(e, S, c, n) { setConv(S, S.conv - n); S.n.auras++; if (!c.hg) return; const life = PB.aura.base + PB.aura.perPip * n, c0 = c.hg.of(e);
  if (c0) { c0.life = c0.max = Math.max(c0.life, life); if (c.hg.flare) c.hg.flare(c0); } else { const a = c.hg.plant(e, e.x, S.G.floorY, { r: PB.aura.r, life, side: 'foe' }); a.aura = true; } }
function falter(e, S, c, why) { setMode(e, 'falter', PB.falterT + 0.05); e.open = PB.falterT; e.lift = 0; S.falterTaken = 0; S.n.falters++; S.chainLeft = 0; S.marks = []; S.sigils = []; S.leap = null; S.spear = null;
  c.fx('open', e.x, e.y); c.sound('falter'); c.shake(4); c.number(e.x, e.y - 80, why || 'THE HOLY FIRE BREAKS HIS LIGHT-WARD: HE FALTERS - STRIKE', '#8fd160'); }
function endFalter(e, S, c) { e.open = 0; e.burn = 0;   /* (the light coming back up him puts out a fire on him: the old fight's rule, kept) */
  S.ward = PB.wardT; S.n.wards++; S.falterTaken = 0; setConv(S, Math.max(S.conv, PB.conv.refill)); c.fx('ward', e.x, e.y); c.sound('tell');
  c.number(e.x, e.y - 80, 'HIS WARD RETURNS: HE IS WARDED', '#9ab0c0'); }

/* ---------- THE RULE ON HIM (the hands call these) ---------- */
/* A BLOW ON HIM. Returns { dmg, read } - read: 'guard' (his light-ward turned it: it fed him), 'ward', 'open', 'landed' */
export function blowOn(e, S, c, dmg) {
  if (!e || !e.alive || e.mode === 'sleep' || e.mode === 'wake') return { dmg: 0, read: 'ward' };
  if (S.ward > 0) { S.n.warded++; return { dmg: 0, read: 'ward' }; }
  if (pbOpen(e)) { const cap = e.maxHp * PB.falterCap - S.falterTaken; const d = Math.max(0, Math.min(Math.round(dmg * PB.falterMul), Math.round(cap))); S.falterTaken += d; return { dmg: d, read: 'open' }; }
  if (guarded(e, S)) { S.n.guarded++; S.n.fed++; setConv(S, S.conv + PB.conv.turned); S.heat += 1;
    if (!S.told.guard || S.n.guarded % 5 === 0) { S.told.guard = 1; c.number(e.x, e.y - 70, 'HIS LIGHT-WARD TURNS IT: LIGHT A BRAZIER BESIDE HIM', '#ffd36b'); } return { dmg: Math.max(1, Math.round(dmg * PB.ward.take)), read: 'guard' }; }
  /* it LANDS: he is committed */
  S.n.landed++;
  if (e.mode === 'pray' || e.mode === 'prayTell') { S.n.praysCut++; setMode(e, 'recover', 0.5); S.prayCd = PB.pray.cd * 0.6; c.number(e.x, e.y - 70, 'THE PRAYER IS BROKEN', '#8fd160'); }
  if (e.mode === 'snuffTell') { S.n.snuffsCut++; setMode(e, 'recover', 0.5); S.snuffCd = PB.snuff.cd; c.number(e.x, e.y - 70, 'HIS HAMMER IS STAYED', '#8fd160'); }
  if (!S.told.land) { S.told.land = 1; c.number(e.x, e.y - 70, 'COMMITTED: IT LANDS', '#8fd160'); }
  return { dmg, read: 'landed' };
}
/* A BURN ON HIM (the pyro's fire, a tick with no blow behind it): it never feeds him. His ward stops it; open it pays x1 inside the falter's cap; otherwise whole (B15) */
export function burnOn(e, S, dmg) {
  if (!e || !e.alive || e.mode === 'sleep' || e.mode === 'wake' || S.ward > 0) return { dmg: 0, read: 'ward' };
  S.n.burns = (S.n.burns || 0) + 1;
  if (pbOpen(e)) { const d = Math.max(0, Math.min(dmg, Math.round(e.maxHp * PB.falterCap - S.falterTaken))); S.falterTaken += d; return { dmg: d, read: 'open' }; }
  if (guarded(e, S)) return { dmg: Math.max(1, Math.round(dmg * PB.ward.take)), read: 'guard' };   /* (claude/church3) the light-ward turns a fire on him too (all round): x take on guard */
  return { dmg, read: 'burn' };
}
/* HIS BLOW TURNED: ON THE BEAT (a parry, a perfect guard, a roll through - main.js answered) a hammer blow or a smite is the RIPOSTE: he REELS PB.reelT */
export function blowTurned(e, S, c, perfect) { if (!e || !e.alive || pbOpen(e) || S.ward > 0) return; if (!perfect) setConv(S, S.conv + PB.conv.blocked);
  if (perfect && (e.mode === 'chain' || e.mode === 'chainBeatTell' || e.mode === 'smite' || e.mode === 'twin' || e.mode === 'twinGap')) { S.n.ripostes++; S.chainLeft = 0; setConv(S, S.conv - 0.5); setMode(e, 'reel', PB.reelT); e.vx = 0;
    c.number(e.x, e.y - 70, S.told.riposte ? 'HE REELS ON THE BEAT' : 'ON THE BEAT: HE REELS', '#8fd160'); S.told.riposte = 1; } }
/* A BRAZIER LIT BY A HERO (src/lit-church-hands.js -> the hands): BESIDE HIM the holy fire breaks his light-ward (THE opening); away from him it is a light he prays at */
export function brazierLit(e, S, c, x) { if (!e || !e.alive || e.mode === 'sleep' || e.mode === 'wake') return 'asleep';
  if (pbOpen(e)) return 'open';
  if (Math.abs(x - e.x) > PB.brazier.near) { S.n.litFar++; c.number(x, e.y - 60, S.told.far ? 'TOO FAR FROM HIM: HE WILL PRAY AT IT' : 'THE BRAZIER BURNS - TOO FAR FROM HIM: LIGHT ONE BESIDE HIM', '#ff9a5c'); S.told.far = 1; return 'far'; }
  if (S.ward > 0) { c.number(x, e.y - 60, 'HIS WARD HOLDS: NOT YET', '#9ab0c0'); return 'ward'; }
  S.n.breaks++; e.lift = 0; falter(e, S, c); return 'break'; }
/* A BRAZIER PUT OUT under him while he kneels at it (a hero's blade) cuts the prayer */
export function brazierOut(e, S, c, id) { if (!e || !e.alive || e.mode === 'sleep') return;
  if ((e.mode === 'pray' || e.mode === 'prayTell' || e.mode === 'prayWalk') && id && id === S.kneelId) { S.n.praysCut++; setMode(e, 'recover', 0.5); c.number(e.x, e.y - 70, 'HIS BRAZIER DIES UNDER HIS HANDS', '#8fd160'); } }
/* HIS HAMMER LANDED on a hero (the hero's own rule: a blow landing earns conviction) */
export function hammerLanded(S) { setConv(S, S.conv + PB.conv.land); }

/* ---------- ONE FRAME. h = the heroes [{ x, y, ground, alive, air, flame, pp }], c = the world:
   c.hit(box, dmg, name, o) -> landed   c.number(x, y, line, col)  c.mark(m)  c.sound(k)  c.fx(kind, x, y)  c.shake(n)  c.music(ph)
   c.lamps() -> [{ id, x, lit }] (his braziers)   c.snuff(id) (he puts one out)   c.hg (makeHolyGround, side 'foe')   c.time() ---------- */
export function stepPaladin(e, S, dt, h, c) {
  const G = S.G, P = h.filter(q => q.alive).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0] || h[0];
  e.modeT -= dt; e.y = G.floorY - (e.lift || 0); e.anim = (e.anim || 0) + dt; S.heat = Math.max(0, S.heat - dt * 1.2);
  for (const k of ['prayCd', 'spearCd', 'arcCd', 'snuffCd', 'stepCd']) S[k] = Math.max(0, S[k] - dt);
  if (e.open > 0) e.open = Math.max(0, e.open - dt);
  if (S.ward > 0) S.ward = Math.max(0, S.ward - dt); e.ward = S.ward; e.pbConv = S.conv;   /* (not e.light: main.js's own field - a ghost's lantern) */
  const ci = auraOf(e, c); if (ci && c.hg.follow) c.hg.follow(ci, e.x, G.floorY);   /* HIS HALLOWED AURA walks with him */
  stepWorld(e, S, dt, h, c);
  if (e.mode === 'sleep') return;
  if (e.mode === 'wake') { if (e.modeT <= 0) { S.script = nextScript(S); S.step = 0; setMode(e, 'walk', 0.6); } return; }
  /* BROKEN (his poise bar): he reels where he stands (B4) */
  if (e.broken > 0 && !pbOpen(e) && (GUARD_MODES.has(e.mode) || /Tell$/.test(e.mode))) { e.modeT += dt; e.vx = 0; return; }
  /* THE PHASES: a new one waits for the blow in hand and never cuts an opening short */
  const want = pPhase(e);
  if (want > S.ph && !pbOpen(e) && (e.mode === 'walk' || e.mode === 'recover' || e.mode === 'guard')) {
    S.ph = want; S.cycle = 0; S.step = 0; S.script = null; e.phase = want; c.music(want); S.snuffCd = 1.2;
    if (want === 2) { c.number((G.x0 + G.x1) / 2, G.floorY - 150, 'THE BASTION: HE SNUFFS HIS BRAZIERS - RELIGHT THEM BY HIM', '#ffd36b'); c.sound('tellHard'); c.shake(4); setMode(e, 'recover', 0.8); return; }
    if (want === 3) { c.number((G.x0 + G.x1) / 2, G.floorY - 150, 'THE EARTHBREAKER: THE DAWN FALLS WITH HIM', '#ff6b6b'); c.sound('tellHard'); c.shake(5); setMode(e, 'recover', 0.8); return; } }
  /* HEAVEN'S ARC: a hero hanging over his head - his up-air whirl (on guard only: one windup at a time) */
  if (GUARD_MODES.has(e.mode) && e.mode !== 'step' && S.arcCd <= 0 && S.ward <= 0) { const over = h.find(q => q.alive && q.air && Math.abs(q.x - e.x) < PB.arc.w && q.y < e.y - 20 && q.y > e.y - 96);
    if (over) { S.arcCd = PB.arc.cd; S.n.arcs++; tell(e, S, c, 'arcTell', PB.arc.tell); if (!S.told.arc) { S.told.arc = 1; c.number(e.x, e.y - 80, 'THE ARC OVER HIS HEAD: DO NOT HANG OVER HIM', '#ffd36b'); } return; } }
  switch (e.mode) {
    case 'falter': e.vx = 0; if (e.open <= 0) { endFalter(e, S, c); setMode(e, 'recover', 0.4); } return;   /* B4: on one knee, still */
    case 'recover': e.vx = 0; if (e.modeT <= 0) nextMove(e, S, P, h, c); return;
    case 'guard': e.vx = 0; if (e.modeT <= 0) nextMove(e, S, P, h, c); return;
    case 'step': { const x0 = e.x; e.x = clampX(G, e.x + (e.stepDir || 1) * PB.step.v * dt); e.vx = (e.x - x0) / Math.max(1e-6, dt); if (e.modeT <= 0) setMode(e, 'recover', 0.25); return; }
    case 'walk': {
      const d = P.x - e.x;
      if ((e.face || 1) * d < -8) { S.behindT += dt; if (S.behindT > PB.turn) { e.face = Math.sign(d) || e.face; S.behindT = 0; } } else S.behindT = 0;
      const x0 = e.x; if (Math.abs(d) > PB.keep + 6) e.x = clampX(G, e.x + Math.sign(d) * PB.walk * dt); e.vx = (e.x - x0) / Math.max(1e-6, dt);
      /* PRESSED on his ward (blows turned in a beat), he RAISES it: the stance (told: the pose and the word) */
      if (S.heat >= 2.2 && Math.abs(d) < 70) { S.heat = 0; setMode(e, 'guard', 0.9); e.vx = 0; if (!S.told.stance) { S.told.stance = 1; c.number(e.x, e.y - 70, 'HE RAISES HIS LIGHT-WARD: BRING THE FIRE', '#ffd36b'); } return; }
      /* THE SANCTUARY STEP (from the Bastion): a hero with a flame closing on him by a dark brazier - he steps off it */
      if (S.ph >= 2 && S.stepCd <= 0 && maybeStep(e, S, h, c)) return;
      if (e.modeT <= 0) nextMove(e, S, P, h, c); return; }
    case 'prayWalk': { const l = (c.lamps() || []).find(q => q.id === S.kneelId);
      if (!l || !l.lit) { setMode(e, 'walk', 0.3); return; }
      const d = l.x - e.x; e.face = Math.sign(d) || e.face; if (Math.abs(d) > 12) { const x0 = e.x; e.x = clampX(G, e.x + Math.sign(d) * PB.walk * 1.15 * dt); e.vx = (e.x - x0) / Math.max(1e-6, dt); if (e.modeT <= 0) setMode(e, 'walk', 0.3); return; }
      e.vx = 0; S.n.prayers++; tell(e, S, c, 'prayTell', 0.4); c.number(e.x, e.y - 70, 'HE PRAYS AT THE BRAZIER: BREAK IT OFF', '#ffd36b'); return; }
    case 'prayTell': e.vx = 0; if (e.modeT <= 0) setMode(e, 'pray', PB.pray.t); return;
    case 'pray': { e.vx = 0; const l = S.kneelId ? (c.lamps() || []).find(q => q.id === S.kneelId) : null;
      if (S.kneelId && (!l || !l.lit)) { setMode(e, 'recover', 0.4); return; }
      setConv(S, S.conv + (l ? PB.conv.kneel : PB.conv.anywhere) * dt);
      if (e.modeT <= 0 || S.conv >= PB.conv.pips) { S.prayCd = PB.pray.cd; setMode(e, 'recover', 0.35); } return; }
    case 'snuffWalk': { const l = (c.lamps() || []).find(q => q.id === S.snuffId);
      if (!l || !l.lit) { setMode(e, 'walk', 0.3); return; }
      const d = l.x - e.x; e.face = Math.sign(d) || e.face; if (Math.abs(d) > 16) { const x0 = e.x; e.x = clampX(G, e.x + Math.sign(d) * PB.walk * 1.2 * dt); e.vx = (e.x - x0) / Math.max(1e-6, dt); if (e.modeT <= 0) setMode(e, 'walk', 0.3); return; }
      e.vx = 0; S.n.snuffs++; tell(e, S, c, 'snuffTell', PB.snuff.tell); c.number(e.x, e.y - 70, S.told.snuff ? 'HE SNUFFS THE BRAZIER' : 'HE SNUFFS THE BRAZIER: LIGHT IT AGAIN BESIDE HIM', '#ffd36b'); S.told.snuff = 1; return; }
  }
  stepMove(e, S, dt, P, h, c);
}
/* the step: a hero carrying a flame within reach of him and a DARK brazier beside him - off it, away from the brazier (a chance, a cooldown) */
function maybeStep(e, S, h, c) { const near = PB.brazier.near, q = h.find(p => p.alive && p.flame > 0 && Math.abs(p.x - e.x) < near + 30); if (!q) return false;
  const b = (c.lamps() || []).filter(l => !l.lit && Math.abs(l.x - e.x) <= near).sort((a, z) => Math.abs(a.x - e.x) - Math.abs(z.x - e.x))[0]; if (!b) return false;
  S.stepCd = PB.step.cd; if ((c.rng ? c.rng() : Math.random()) > PB.step.pr) return false;
  e.stepDir = Math.sign(e.x - b.x) || -(Math.sign(q.x - e.x) || 1); if (Math.abs(e.x - (S.G.x0 + 30)) < 30 && e.stepDir < 0) e.stepDir = 1; if (Math.abs(e.x - (S.G.x1 - 30)) < 30 && e.stepDir > 0) e.stepDir = -1;
  S.n.steps++; setMode(e, 'step', PB.step.t); e.vx = 0; if (!S.told.step) { S.told.step = 1; c.number(e.x, e.y - 70, 'HE STEPS OFF THE BRAZIER: CATCH HIM AT ONE', '#ffd36b'); } return true; }
function nextMove(e, S, P, h, c) {
  const dx = P.x - e.x, ad = Math.abs(dx), G = S.G, lamps = c.lamps ? c.lamps() : [];
  e.face = Math.sign(dx) || e.face; e.plus = false;
  /* SUNFALL: five pips - the finisher */
  if (pips(S) >= PB.sunfall.cost && S.ward <= 0) { S.n.sunfalls++; spend(e, S, c, PB.sunfall.cost); tell(e, S, c, 'sunfallTell', PB.sunfall.tell); S.marks = [];
    for (let k = -2; k <= 2; k++) S.marks.push({ x: clampX(G, e.x + k * PB.sunfall.gap) });
    if (ad < PB.sunfall.near && !S.marks.some(m => Math.abs(m.x - P.x) < PB.sunfall.gap / 2)) S.marks.push({ x: clampX(G, P.x) });
    for (const mk of S.marks) c.fx('cross', mk.x, G.floorY);
    c.number(e.x, e.y - 80, 'SUNFALL: STAND BETWEEN THE LIGHTS', '#ff6b6b'); return; }
  /* THE BASTION SNUFFS HIS BRAZIERS: a lit one in his reach, he goes and puts it out (told; a blow stays his hammer) */
  if (S.ph >= 2 && S.snuffCd <= 0 && S.ward <= 0) { const l = lamps.filter(q => q.lit && Math.abs(q.x - e.x) <= PB.snuff.reach).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0];
    if (l) { S.snuffId = l.id; S.snuffCd = PB.snuff.cd; setMode(e, 'snuffWalk', PB.snuff.walkT); return; } }
  /* PRAYER: low on pips - he goes to kneel at a lit brazier (x3), or, with you far off, kneels where he stands */
  const lit = lamps.filter(l => l.lit);
  if (pips(S) < PB.pray.below && S.prayCd <= 0 && S.ward <= 0) { if (lit.length && S.ph < 2) { const l = lit.slice().sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0]; S.kneelId = l.id; S.prayCd = PB.pray.cd * 0.6; setMode(e, 'prayWalk', PB.pray.walkT); return; }
    if (ad > PB.pray.far) { S.kneelId = null; S.prayCd = PB.pray.cd * 0.6; S.n.prayers++; tell(e, S, c, 'prayTell', 0.4); c.number(e.x, e.y - 70, 'HE KNEELS IN PRAYER: BREAK IT OFF', '#ffd36b'); return; } }
  if (!S.script || S.step >= S.script.length) { S.cycle++; S.n.cycles++; S.script = nextScript(S); S.step = 0; }
  let m = S.script[S.step++];
  if (m === 'spear' && (S.spearCd > 0 || ad < PB.spear.min)) m = 'chain';
  if (m === 'twin' && pips(S) < PB.twin.cost) m = pips(S) >= PB.smite.cost ? 'smite' : 'chain';
  if (m === 'smite' && pips(S) < PB.smite.cost) m = 'chain';
  if (m === 'radiance' && pips(S) < PB.radiance.cost) m = pips(S) >= PB.smite.cost ? 'smite' : 'chain';
  if ((m === 'smite' || m === 'twin') && ad > PB.smite.reach + 50) { setMode(e, 'walk', 0.45); S.step--; return; }
  if (m === 'chain' && ad > PB.chain.reach + 50) { if (S.spearCd <= 0 && ad >= PB.spear.min) m = 'spear'; else { setMode(e, 'walk', 0.45); S.step--; return; } }   /* out of the hammer's reach: he closes first (the chain stays next), or throws */
  switch (m) {
    case 'chain': S.chainLeft = PB.chain.n[S.ph - 1]; S.n.chains++; tell(e, S, c, 'chainTell', PB.chain.tell); return;
    case 'smite': S.n.smites++; spend(e, S, c, PB.smite.cost); tell(e, S, c, 'smiteTell', PB.smite.tell); if (!S.told.smite) { S.told.smite = 1; c.number(e.x, e.y - 70, 'SMITE: TAKE IT ON A SHIELD, OR STEP BACK', '#ffd36b'); } return;
    case 'twin': S.n.twins++; spend(e, S, c, PB.twin.cost); e.twin2 = false; tell(e, S, c, 'twinTell', PB.smite.tell); if (!S.told.twin) { S.told.twin = 1; c.number(e.x, e.y - 70, 'TWIN SMITE: AND AGAIN', '#ffd36b'); } return;
    case 'radiance': { const plus = S.ph >= 2 && pips(S) >= PB.radPlus.cost; e.plus = plus; S.n.radiances++; if (plus) S.n.pluses++; spend(e, S, c, plus ? PB.radPlus.cost : PB.radiance.cost);
      tell(e, S, c, 'radianceTell', plus ? PB.radPlus.tell : PB.radiance.tell); if (!S.told.rad) { S.told.rad = 1; c.number(e.x, e.y - 70, 'RADIANCE: GET OUT OF HIS LIGHT', '#ff6b6b'); } return; }
    case 'spear': S.n.spears++; S.spearCd = PB.spear.cd; tell(e, S, c, 'spearTell', PB.spear.tell); if (!S.told.spear) { S.told.spear = 1; c.number(e.x, e.y - 70, 'THE SPEAR OF LIGHT: JUMP IT', '#ffd36b'); } return;
    case 'verdict': S.n.verdicts++; S.sigils = []; e.sigils = 0; S.sigT = 0.12; tell(e, S, c, 'verdictTell', PB.verdict.every * PB.verdict.max + 0.3); if (!S.told.verdict) { S.told.verdict = 1; c.number(e.x, e.y - 70, 'VERDICT: THE SIGILS FALL WHERE YOU STAND - KEEP MOVING', '#ff6b6b'); } return;
    case 'dawn': S.n.dawns++; tell(e, S, c, 'dawnTell', PB.dawn.tell); S.leap = { x: clampX(G, P.x), fx: e.x }; c.fx('ring', S.leap.x, G.floorY); if (!S.told.dawn) { S.told.dawn = 1; c.number(e.x, e.y - 80, 'DAWNFALL: OFF THE RING', '#ff6b6b'); } return;
  }
  setMode(e, 'walk', 0.5);
}
/* THE TOLD BLOWS */
function stepMove(e, S, dt, P, h, c) {
  const G = S.G, f = e.face || 1, after = (t) => setMode(e, 'recover', t ?? PB.gap[S.ph - 1]), mul = inHisAura(e, c) ? HG_HIT : 1;
  e.vx = 0;
  const front = (reach, y0 = 34) => [f > 0 ? e.x - 6 : e.x - reach, f > 0 ? e.x + reach : e.x + 6, e.y - y0, e.y];
  switch (e.mode) {
    case 'chainTell': case 'chainBeatTell': if (e.modeT <= 0) { setMode(e, 'chain', PB.chain.t); c.sound('slam'); } return;
    case 'chain': { const x0 = e.x; e.x = clampX(G, e.x + f * PB.chain.step * dt); e.vx = (e.x - x0) / Math.max(1e-6, dt);
      if (c.hit(front(PB.chain.reach), Math.round(PB.chain.dmg * mul), MOVE_NAME.chain, { blockable: true, key: 'chain' + S.act })) hammerLanded(S);
      if (e.mode !== 'chain') return;
      if (e.modeT <= 0) { S.chainLeft--; if (S.chainLeft > 0) { e.face = Math.sign(P.x - e.x) || f; tell(e, S, c, 'chainBeatTell', PB.chain.beat); } else after(); } return; }
    case 'smiteTell': if (e.modeT <= 0) { setMode(e, 'smite', PB.smite.t); c.sound('slam'); c.fx('smite', e.x + f * 20, G.floorY); } return;
    case 'smite': if (c.hit(front(PB.smite.reach), Math.round(PB.smite.dmg * mul), MOVE_NAME.smite, { blockable: true, key: 'sm' + S.act })) hammerLanded(S); if (e.mode === 'smite' && e.modeT <= 0) after(); return;
    case 'twinTell': if (e.modeT <= 0) { setMode(e, 'twin', PB.smite.t); e.twin2 = false; c.sound('slam'); c.fx('smite', e.x + f * 20, G.floorY); } return;
    case 'twin': if (c.hit(front(PB.smite.reach), Math.round(PB.smite.dmg * mul), MOVE_NAME.twin, { blockable: true, key: 'tw' + S.act + (e.twin2 ? 'b' : 'a') })) hammerLanded(S);
      if (e.mode === 'twin' && e.modeT <= 0) { if (!e.twin2) { setMode(e, 'twinGap', PB.twin.gap); } else after(); } return;
    case 'twinGap': if (e.modeT <= 0) { e.face = Math.sign(P.x - e.x) || f; setMode(e, 'twin', PB.smite.t); e.twin2 = true; c.sound('slam'); c.fx('smite', e.x + e.face * 20, G.floorY); } return;
    case 'radianceTell': if (e.modeT <= 0) { const R = e.plus ? PB.radPlus : PB.radiance; setMode(e, 'radiance', PB.radiance.t); c.sound('radiance'); c.shake(4); c.fx('flare', e.x, G.floorY, R.r);
        if (c.hit([e.x - R.r, e.x + R.r, e.y - 44, e.y + 2], Math.round(R.dmg * mul), MOVE_NAME.radiance, { key: 'rad' + S.act })) hammerLanded(S);
        if (e.plus && c.mend) c.mend(PB.radPlus.mend); } return;
    case 'radiance': if (e.modeT <= 0) after(0.5); return;   /* (he stands a beat in the light he let go: committed) */
    case 'sunfallTell': if (e.modeT <= 0) { setMode(e, 'sunfall', PB.sunfall.t); c.sound('radiance'); c.shake(5);
        for (const mk of S.marks) { c.hit([mk.x - PB.sunfall.r, mk.x + PB.sunfall.r, G.roofY, G.floorY + 2], PB.sunfall.dmg, MOVE_NAME.sunfall, { key: 'sun' + S.act + '_' + Math.round(mk.x) }); c.fx('column', mk.x, G.floorY); } } return;
    case 'sunfall': if (e.modeT <= 0) { S.marks = []; after(0.6); } return;
    case 'spearTell': if (e.modeT <= 0) { e.face = Math.sign(P.x - e.x) || f; setMode(e, 'spear', 0.3); S.spear = { x: e.x + e.face * 12, x0: e.x, y: G.floorY - PB.spear.hy, dir: e.face, act: S.act }; c.sound('throw'); } return;
    case 'spear': if (e.modeT <= 0) after(0.35); return;
    case 'arcTell': if (e.modeT <= 0) { setMode(e, 'arc', PB.arc.t); c.sound('slam'); } return;
    case 'arc': { const b = [e.x - PB.arc.w - 6, e.x + PB.arc.w + 6, e.y - 100, e.y - 18]; if (c.hit(b, Math.round(PB.arc.dmg * mul), MOVE_NAME.arc, { key: 'arc' + S.act + (e.modeT > PB.arc.t / 2 ? 'a' : 'b') })) hammerLanded(S);
      if (e.mode === 'arc' && e.modeT <= 0) after(0.4); return; }
    case 'verdictTell': { S.sigT -= dt; if (S.sigT <= 0 && S.sigils.length < PB.verdict.max) { S.sigT = PB.verdict.every; S.sigils.push({ x: clampX(G, P.x) }); e.sigils = S.sigils.length; c.fx('cross', S.sigils[S.sigils.length - 1].x, G.floorY); c.sound('glow'); }
      if (e.modeT <= 0) { setMode(e, 'verdict', PB.verdict.t); c.sound('radiance'); c.shake(4); for (const sg of S.sigils) { c.hit([sg.x - PB.verdict.r, sg.x + PB.verdict.r, G.roofY, G.floorY + 2], PB.verdict.dmg, MOVE_NAME.verdict, { key: 'vd' + S.act + '_' + Math.round(sg.x) }); c.fx('column', sg.x, G.floorY); } } return; }
    case 'verdict': if (e.modeT <= 0) { S.sigils = []; e.sigils = 0; after(0.55); } return;
    case 'dawnTell': if (e.modeT <= 0) { setMode(e, 'dawn', PB.dawn.fly); S.leap.fx = e.x; c.sound('leap'); } return;
    case 'dawn': { const q = Math.max(0, Math.min(1, 1 - e.modeT / PB.dawn.fly)); e.x = S.leap.fx + (S.leap.x - S.leap.fx) * q; e.lift = Math.sin(q * Math.PI) * 70;
      if (e.modeT <= 0) { e.lift = 0; e.x = S.leap.x; setMode(e, 'land', 0.65); c.shake(6); c.sound('slam'); c.fx('pillar', S.leap.x, G.floorY);
        if (c.hit([S.leap.x - PB.dawn.r, S.leap.x + PB.dawn.r, G.roofY, G.floorY + 4], PB.dawn.dmg, MOVE_NAME.dawn, { key: 'dawn' + S.act })) hammerLanded(S);
        for (const d of [-1, 1]) S.waves.push({ x: S.leap.x + d * (PB.dawn.r - 4), dir: d, v: PB.dawn.v, life: PB.dawn.life, dmg: PB.dawn.wave, key: 'dw' + S.act + d, name: MOVE_NAME.quake });
        spend(e, S, c, 0); S.leap = null; } return; }   /* (DAWNFALL lights his aura where he lands - the hero's rule) */
    case 'land': if (e.modeT <= 0) after(0.3); return;   /* (he lands committed: a beat to punish) */
    case 'snuffTell': if (e.modeT <= 0) { const l = (c.lamps() || []).find(q => q.id === S.snuffId); setMode(e, 'snuff', PB.snuff.t); c.sound('slam'); c.shake(3); if (l && l.lit && c.snuff) c.snuff(l.id); } return;
    case 'snuff': if (e.modeT <= 0) after(0.4); return;
    case 'rebound': case 'reel': if (e.modeT <= 0) after(0.3); return;   /* (B4: he stands) */
    default: setMode(e, 'walk', 0.5);
  }
}
/* HIS THINGS IN THE ROOM: the spear of light, the quake running the floor */
function stepWorld(e, S, dt, h, c) {
  const G = S.G, T = PB.spear;
  const m = S.spear; if (m) { m.x += m.dir * T.sp * dt; const out = Math.abs(m.x - m.x0) > T.range || m.x < G.x0 + 4 || m.x > G.x1 - 4;
    const hitIt = !out && c.hit([m.x - T.hr - 4, m.x + T.hr + 4, m.y - T.hr, m.y + T.hr], T.dmg, MOVE_NAME.spear, { blockable: true, key: 'sp' + m.act, noKnock: true });
    if (out || hitIt || h.some(q => q.alive && Math.abs(q.x - m.x) < 8 && Math.abs((q.y - 14) - m.y) < 14)) S.spear = null; }   /* (it stops at the first hero, struck or turned) */
  for (const w of S.waves) { w.life -= dt; w.x += w.dir * w.v * dt; if (w.x < G.x0 + 4 || w.x > G.x1 - 4) w.life = 0;
    if (w.life > 0) c.hit([w.x - 6, w.x + 6, G.floorY - 14, G.floorY + 2], w.dmg, w.name, { key: w.key, noKnock: true }); }
  S.waves = S.waves.filter(w => w.life > 0);
}
const HG_HIT = 1.3;   /* (src/holy-ground.js HG.hitMul: his blows inside his own holy ground; a literal here so this module stays importable on its own) */

/* ---------- THE BOT'S READING (src/lab.js) ----------
   A HUMAN BOT: it sees a tell PLAN.react s late (the v2 profile's eyes already do that: s.v2) and misreads some; it blocks the hammer and the smites (or backs off),
   jumps the spear and the quake, steps off the sunfall's crosses, the verdict's sigils and the dawnfall's ring, leaves his radiance; it never hangs over his head;
   between his blows it works THE RULE: with no flame it fetches one (the votive stand, the altar fire, a lit brazier), carries it to the DARK BRAZIER nearest him
   and lights it the moment he stands beside it (E: out.talk) - he falters, and it hits him hard; it breaks his prayer; it does not hammer his light-ward for long
   (each turned blow feeds him) - it hits him while he is committed. Warded, it waits off him.
   s = { P: { x, y, face, ground, atk }, e, S, aura: { x, r } | null, lamps: [{ id, x, lit }], fires: [x..], flame, reach, shield, t, rng, mem, v2, hero, rest } -> { gx, face, atk, jump, dodge, block, talk, why } */
export const PLAN = { react: 0.25, miss: 0.12, bait: 0.5, fetchR: 400 };
export function pbPlan(s) { const o = pbPlan0(s); if (globalThis.__pbWhy) { const k = o.why; globalThis.__pbWhy[k] = (globalThis.__pbWhy[k] || 0) + 1; } return o; }   /* (globalThis.__pbWhy: a tally of the bot's reasons, for a lane's probe - off unless a page sets it) */
function pbPlan0(s) {
  const { P, e, S, reach } = s, G = S.G, out = { gx: null, face: P.face, atk: false, jump: false, dodge: false, block: false, talk: false, up: false, down: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0;
  mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 600) { mem.seen.clear(); mem.roll.clear(); }
  const seenFor = (key, d = s.v2 ? 0 : PLAN.react) => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= d; };
  const roll = (key, pr) => { if (!mem.roll.has(key)) mem.roll.set(key, rng() < pr); return mem.roll.get(key); };
  const lo = G.x0 + 12, hi = G.x1 - 12, clamp = x => Math.max(lo, Math.min(hi, x));
  const kx = e.x, side = Math.sign(P.x - kx) || 1, dx = Math.abs(kx - P.x), same = Math.abs(P.y - e.y) < 26, hitR = reach + PB.w / 2 - 2;
  const swing = fx => { out.face = Math.sign(fx - P.x) || out.face; out.atk = P.atk < 0; };
  const au = s.aura, inA = x => !!au && Math.abs(x - au.x) <= au.r + 4;
  const roomDir = ax => { const away = P.x <= ax ? -1 : 1, room = d => (d < 0 ? P.x - lo : hi - P.x); return room(away) >= 50 ? away : -away; };
  const flame = s.flame || 0, lamps = s.lamps || [], dark = lamps.filter(l => !l.lit);
  /* 0. THINGS ON THE FLOOR: the quake coming at it - jump as it arrives; the spear at its waist - jump it (or a shield) */
  for (const w of S.waves || []) { const ahead = (P.x - w.x) * w.dir; if (ahead > -4 && ahead < 26 + w.v * 0.05 && P.ground && same) { out.jump = true; out.gx = P.x; out.why = 'jump the quake'; return out; } }
  if (S.spear && P.ground) { const m = S.spear, dd = (P.x - m.x) * m.dir;
    if (dd > -6 && dd < 70 && seenFor('sp' + m.act)) { if (s.shield && roll('spb' + m.act, 0.5)) { out.block = true; out.face = Math.sign(m.x - P.x) || 1; out.why = 'block the spear'; return out; } if (dd < 46) { out.jump = true; out.gx = P.x; out.why = 'jump the spear'; return out; } } }
  /* 1. HIS BLOWS (a quarter-second late, some misread) */
  if (/Tell$/.test(e.mode) || STRIKE.has(e.mode) || e.mode === 'twinGap') {
    const miss = s.v2 ? false : roll('m' + S.act + e.mode, PLAN.miss), seen = seenFor('a' + S.act + e.mode);
    if (seen && !miss) {
      if ((e.mode === 'sunfallTell' || e.mode === 'sunfall') && (S.marks || []).some(m => Math.abs(P.x - m.x) < PB.sunfall.r + 10)) { const m = S.marks.find(q => Math.abs(P.x - q.x) < PB.sunfall.r + 10), d = roomDir(m.x);
        out.gx = clamp(m.x + d * (PB.sunfall.gap / 2)); out.why = 'between the lights'; return out; }
      if (e.mode === 'verdictTell' || e.mode === 'verdict') { const on = (S.sigils || []).find(q => Math.abs(P.x - q.x) < PB.verdict.r + 12);
        if (on) { const d = roomDir(on.x); out.gx = clamp(on.x + d * 44); out.why = 'off the sigil'; return out; }
        if (e.mode === 'verdictTell') { const mv = mem.vdDir || (mem.vdDir = roomDir(kx)); out.gx = clamp(P.x + mv * 40); if (Math.abs(out.gx - P.x) < 6) mem.vdDir = -mv; out.why = 'keep moving: the sigils'; return out; } }
      if ((e.mode === 'dawnTell' || e.mode === 'dawn') && S.leap && Math.abs(P.x - S.leap.x) < PB.dawn.r + 22) { const d = roomDir(S.leap.x); out.gx = clamp(S.leap.x + d * (PB.dawn.r + 34)); if (e.mode === 'dawn' && P.ground && !s.noRoll && Math.abs(P.x - S.leap.x) < PB.dawn.r + 6) out.dodge = true; out.why = 'off the dawnfall ring'; return out; }
      if (e.mode === 'radianceTell' && dx < (e.plus ? PB.radPlus.r : PB.radiance.r) + 14) { out.gx = clamp(kx + side * ((e.plus ? PB.radPlus.r : PB.radiance.r) + 22)); if (dx < 40 && e.modeT < 0.25 && !s.noRoll && P.ground) out.dodge = true; out.why = 'out of his radiance'; return out; }
      if (e.mode === 'arcTell' || e.mode === 'arc') { if (!P.ground && Math.abs(P.x - kx) < PB.arc.w + 8) { out.gx = clamp(kx + side * 60); out.why = 'off his head'; return out; } }
      if ((e.mode === 'smiteTell' || e.mode === 'twinTell' || e.mode === 'smite' || e.mode === 'twin' || e.mode === 'twinGap') && dx < PB.smite.reach + 30 && same) {
        if (s.shield) { out.block = true; out.face = Math.sign(kx - P.x) || 1; out.why = 'block the smite'; return out; }
        out.gx = clamp(kx + side * 84); if (dx < 50 && e.modeT < 0.18 && /Tell$/.test(e.mode) && !s.noRoll) out.dodge = true; out.why = 'back off the smite'; return out; }
      if ((e.mode === 'chainTell' || e.mode === 'chainBeatTell' || e.mode === 'chain') && dx < PB.chain.reach + 40 && same) {
        if (s.shield) { out.block = true; out.face = Math.sign(kx - P.x) || 1; out.why = 'block the hammer'; return out; }
        out.gx = clamp(kx + side * 92); if (dx < 50 && e.modeT < 0.18 && /Tell$/.test(e.mode) && !s.noRoll) out.dodge = true; out.why = 'back off the hammer'; return out; }
    }
  }
  /* 2. OPEN: hit him (any side); WARDED: off him */
  if (pbOpen(e)) { const st = s.tip ? 30 : 14; out.gx = clamp(kx + side * st); if (dx < hitR + 4 && same) swing(kx); out.why = 'hit him: he falters'; return out; }
  if (S.ward > 0) { out.gx = clamp(kx + side * 80); out.why = 'his ward: wait'; return out; }
  /* 3. HIS PRAYER and HIS SNUFF: committed - break them */
  if ((e.mode === 'pray' || e.mode === 'prayTell' || e.mode === 'snuffTell') && !roll('cut' + S.act, 0.15) && !(flame > 0 && e.mode === 'snuffTell')) { if (dx > hitR - 2) { out.gx = clamp(kx + side * (hitR - 8)); out.why = 'in to break it'; return out; } swing(kx); out.gx = P.x; out.why = 'break his prayer'; return out; }
  /* (the fires and the braziers stand on the floor: up on a choir stall, step off its end first) */
  const stall = (G.stalls || []).find(q => P.x > q.x0 - 6 && P.x < q.x1 + 6 && Math.abs(P.y - q.y) < 10);
  const offStall = () => { const L0 = stall.x0 - 12, R0 = stall.x1 + 12, gx = Math.abs(P.x - L0) < Math.abs(P.x - R0) ? (L0 > lo + 4 ? L0 : R0) : (R0 < hi - 4 ? R0 : L0); out.gx = clamp(gx); out.why = 'off the stall to the floor'; return out; };
  if (stall && dark.length && !s.rest) return offStall();
  /* 4. THE RULE: A BRAZIER LIT BESIDE HIM. Carrying a flame - to the dark brazier nearest him, and E the moment he stands beside it */
  /* (the brazier it waits at: the dark one nearest IT that is not on his far side - he comes to it, walking at you) */
  const pick = () => dark.slice().sort((a, z) => (Math.abs(a.x - P.x) + (Math.sign(a.x - kx) === -side && Math.abs(a.x - kx) > 20 ? 400 : 0)) - (Math.abs(z.x - P.x) + (Math.sign(z.x - kx) === -side && Math.abs(z.x - kx) > 20 ? 400 : 0)))[0];
  if (dark.length && flame > 0.5) { const b = dark.find(q => Math.abs(q.x - kx) <= PB.brazier.near - 8 && Math.abs(q.x - P.x) < 60) || pick(), near = Math.abs(b.x - kx) <= PB.brazier.near - 8;
    if (Math.abs(b.x - P.x) > 14) { out.gx = clamp(b.x); out.face = Math.sign(b.x - P.x) || P.face; out.why = 'carry the flame to the brazier by him'; return out; }
    if (near) { out.talk = true; out.gx = P.x; out.face = Math.sign(kx - P.x) || 1; out.why = 'light it beside him'; return out; }
    out.gx = P.x; out.face = Math.sign(kx - P.x) || 1; out.why = 'wait at the brazier for him'; return out; }
  /* ...no flame: fetch one (the nearest fire) - not with him on top of it */
  if (dark.length && flame <= 0.5 && !s.rest) { const fx = (s.fires || []).slice().sort((a, z) => Math.abs(a - P.x) - Math.abs(z - P.x))[0];
    if (fx != null && Math.abs(fx - P.x) < PLAN.fetchR && !(dx < 50 && same && !/Tell$/.test(e.mode))) { if (Math.abs(fx - P.x) > 10) { out.gx = clamp(fx); out.why = 'to the fire for a flame'; return out; } out.talk = true; out.gx = P.x; out.why = 'take a flame'; return out; } }
  /* 4b. WINDED (the lab's stamina rest): off him, out of the hammer's reach (and off his aura) */
  if (s.rest) { let gx = clamp(kx + side * (PB.chain.reach + 64)); if (inA(gx)) gx = clamp(au.x + side * (au.r + 16)); out.gx = gx; out.face = Math.sign(kx - P.x) || 1; out.why = 'winded: off him'; return out; }
  /* 5. FIGHT HIM: while he is committed (his tells' recoveries, a reel, a landing) - and not long into his light-ward (every turned blow feeds him) */
  const committed = e.mode === 'reel' || e.mode === 'land' || e.mode === 'radiance' || e.mode === 'sunfall' || e.mode === 'verdict' || e.mode === 'spear' || e.mode === 'spearTell' || e.mode === 'snuff' || e.mode === 'prayWalk' || e.mode === 'snuffWalk';
  if (committed && same) { if (dx > hitR - 2) { out.gx = clamp(kx + side * (hitR - 8)); out.why = 'in on him: committed'; return out; } swing(kx); out.gx = P.x; out.why = 'hit him: committed'; return out; }
  if ((e.mode === 'walk' || e.mode === 'recover' || e.mode === 'guard') && dx < hitR + 34) { out.face = Math.sign(kx - P.x) || 1;
    if (s.shield && same && roll('bait' + S.cycle + '_' + S.step, PLAN.bait)) { out.gx = clamp(kx + side * (hitR + 6)); out.block = Math.abs(P.x - out.gx) < 8; out.why = 'bait his hammer'; return out; }
    if (roll('poke' + S.cycle + '_' + S.step + '_' + Math.floor(t * 2), 0.5)) { if (dx > hitR - 4) { out.gx = clamp(kx + side * (hitR - 8)); out.why = 'in to him'; return out; } swing(kx); out.gx = P.x; out.why = 'into his ward'; return out; } }
  let gx = clamp(kx + side * Math.max(52, hitR + 22)); if (inA(gx) && au) gx = clamp(au.x + side * (au.r + 16)); out.gx = gx; out.face = Math.sign(kx - P.x) || 1; out.why = 'keep off his hammer'; return out;
}
