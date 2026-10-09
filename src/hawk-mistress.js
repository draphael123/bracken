// src/hawk-mistress.js - THE HAWK-MISTRESS, THE BANDIT KSAR's boss (claude/ksar, the Opus greybox, 2026-10-07; THE ROOFTOPS, claude/ksar2 2026-10-08). The
// raiders' chief and falconer - not a goblin, not another king (Daniel 10-06). Concept + interview: .claude/briefs/brief-banditksar.md; the rework:
// scratch/brief-ksar2.md (Daniel-approved: the rooftop arena, three new told moves of hers, two of the hawk's, the B15 floor, tuned WITH FLASKS).
//
// WHAT SHE IS (design standard B11): A HUMAN DUELIST, NOT A PUZZLE. She is ALWAYS HITTABLE and GUARDS BY ANGLE: her falconer's GAUNTLET turns a blow from
//   the front by a hero standing at her height while she is ON GUARD (walking, recovering) - CLANK, "HER GAUNTLET" (src/boss-read.js's read) - but (B15, the
//   RESISTANCE FLOOR) a turned blow still lands at HM.floor (0.4x); from BEHIND her, or from ABOVE (a jump), it lands whole; in her tells and her strikes
//   she is committed and every blow lands. She is on src/boss-greed.js FULL_DAMAGE (no global chip; greed is still counted - the mash bot's reprisal).
//   Her kit: THE WHIP, A CURVED KNIFE, A BANDOLIER OF THROWING KNIVES, the fort's POWDER, and THE HAWK.
// THE ARENA (claude/ksar2): THE FORT'S FLAT ROOFS - three roofs at one height with two SPIKED SHAFTS between them (HM_STAGE.shafts). A fall in costs a
//   quarter of the bar and the shaft's HOT UPDRAFT throws you back up onto the roof edge (src/ksar-hands.js: never a death, never a soft-lock). She LEAPS
//   roof to roof after you (a told leap, B12: she lands on the roof where you can follow, never in an opening).
// THE HAWK (her kit, not a foe: never in the enemy list - "IT RIDES THE AIR"). It circles over her: her eyes.
// HER OPENINGS ARE THE RULE'S (B1): THE FORT ANSWERS ITS GONGS -
//   RING A GONG (E: the roofs' gongs are the level's, src/ksar-hands.js) and the noise sends the hawk WHEELING off; or BLIND IT with a FLASH FLASK; or
//   (claude/ksar2) STRIKE IT MID-DIVE / TURN IT ON A SHIELD (its rake and its snatch): it FLINCHES and is SENT OFF; or KICK HER OWN KEG BACK INTO HER.
//   Either way she is OPEN (HM.openT s; B10: a gold ring and a timer bar), a blow x HM.openMul, one opening HM.openCap of her at most. B4: open, she
//   stands where she is, glove up, whistling - no step, no retreat. B3: when the opening ends the hawk is home on her glove - a TOLD HM.wardT s WARD
//   (a blow clanks WARDED and lands at the B15 floor; a gong or a flash finds the hawk home).
// PHASE ONE - THE ROOFTOP DUEL (to HM.p2): WHIP LASH (!! a long low lash: jump it), KNIFE FEINT (a feint, then the real cut, !), THE HAWK SPOTS (! it marks
//   your spot: her next lash cracks there), and HER NEW MOVE: THE WHIP SNARE (!! the lash wraps you and YANKS you toward a shaft: JUMP or ROLL breaks it).
//   THE HAWK's own: THE RAKE DIVE (! a told line from high to one side through your spot: step off it, or STRIKE IT / BLOCK IT - it flinches, is sent off,
//   and she is open while she whistles it back).
// PHASE TWO - HER GUARD ANSWERS THE GONGS (HM.p2 to HM.p3). HER NEW MOVE: THE KNIFE FAN (! three throwing knives, HIGH / MID / LOW, each drawn on her
//   hand before it flies: DUCK the high one, JUMP the low one, a shield turns any). THE HAWK's new one: THE SNATCH (! it hangs over you and drops: caught,
//   it carries you over a shaft and lets go - BLOCK it or STRIKE it as it drops: it flinches, is sent off, she is open). The arena: THE CALL (her guard runs
//   for a gong; cut its rope - E hangs it back).
// PHASE THREE - THE POWDER STORE BURNS (HM.p3 to 0). HER NEW MOVE: THE KEG KICK (!! she kicks a lit keg rolling across the roof at you: JUMP it, or STRIKE IT
//   BACK - it rolls home and blows under her: OPEN). The arena: the fire burns the roofs' two ends and the ROOF LEDGES CRUMBLE end by end.
// PURE: no DOM, no main.js. The world is a context `c` (src/hawk-mistress-hands.js binds it). hmPlan is the boss lab's HUMAN bot (src/lab.js).

export const HM = {
  hp: 2850, w: 16, h: 30, markH: 48, floor: 0.4,
  openMul: 2.0, openCap: 0.12, openT: 3.6, wardT: 3.0, wheelT: 0.9, blindT: 0.7, flashHawk: 80, flinchT: 0.35,
  p2: 0.6, p3: 0.25,
  walk: 70, keep: 50, turn: 0.35, gap: [0.5, 0.42, 0.36],
  lashTell: 0.55, lashT: 0.16, lashReach: 86, lashH: 16, lashRange: 110,
  feintTell: 0.42, feintHold: 0.24, cutTell: 0.34, cutT: 0.18, cutReach: 34, cutStep: 210,   /* (the knife LUNGES: ~38 px in on the cut) */
  spotTell: 0.9, markLashTell: 0.65, markR: 22,
  callTell: 0.8, runT: 2.4, guardCap: 2,
  leapT: 0.55, leapH: 44,
  snareTell: 0.6, snareReach: 104, snareH: 26, snareHold: 1.3, snarePull: 120,
  fanTell: 0.7, fanGap: 0.24, knifeV: 230, knifeR: 6,
  kegTell: 0.6, kegV: 120, kegBack: 1.35, kegFuse: 3.2, kegR: 34,
  rakeTell: 0.85, rakeFly: 0.42, rakeR: 12,
  snatchTell: 1.0, snatchLock: 0.35, snatchDrop: 0.22, snatchR: 16, carryT: 0.8,
  hawkAlt: 74, hawkR: 30,
  fireW: 3, fireTick: 0.5, roofEvery: 4.0,
  dmg: { lash: 31, cut: 34, markLash: 37, rake: 26, fire: 9, snare: 14, knife: 17, keg: 30, snatch: 10 },
};
/* EVERY CYCLE CHANGES: the order of each pass, by phase (cycle k uses [k % n]). One new move of hers a phase: snare (1), fan (2), keg (3); the hawk's
   rake from the start and its snatch from phase two */
export const CYCLES = {
  1: [['lash', 'feint', 'snare', 'rake'], ['feint', 'rake', 'lash', 'spot'], ['snare', 'lash', 'feint', 'rake']],
  2: [['call', 'fan', 'lash', 'snatch'], ['fan', 'feint', 'rake', 'snare'], ['snatch', 'lash', 'fan', 'call']],
  3: [['keg', 'lash', 'rake', 'fan'], ['snatch', 'keg', 'feint', 'snare'], ['keg', 'fan', 'call', 'lash']],
};
/* THE MOVES: the mode while it is told, its mark, the answer (src/marks.js keeps the same rows) */
export const MOVES = {
  lashTell: { mark: '!!', answer: 'jump' }, feintTell: { mark: '', answer: '' }, cutTell: { mark: '!', answer: 'block' }, spotTell: { mark: '!', answer: '' },
  markLashTell: { mark: '!!', answer: 'dodge' }, callTell: { mark: '!', answer: '' },
  snareTell: { mark: '!!', answer: 'jump' }, fanTell: { mark: '!', answer: 'block' }, kegTell: { mark: '!!', answer: 'jump' },
  rakeTell: { mark: '!', answer: 'block' }, snatchTell: { mark: '!', answer: 'block' },
};
export const MOVE_NAME = { lash: 'HER WHIP', cut: 'HER KNIFE', markLash: 'HER WHIP', rake: 'HER HAWK', fire: 'THE FIRE', snare: 'HER WHIP', knife: 'HER KNIVES', keg: 'HER KEG', snatch: 'HER HAWK' };
export const NEW_MOVES = { 1: 'snare', 2: 'fan', 3: 'keg' };   /* hers, one a phase (B5) */
export const HAWK_MOVES = { rake: 1, snatch: 2 };               /* the hawk's: the phase each joins */

/* ---------- THE ROOFTOPS ---------- */
/* local columns (0..45), the roofs' surface row R (the hero stands on R-1). Three ROOFS at one height and two SPIKED SHAFTS between them (cols, inclusive; the
   shaft is shaftD rows deep, its updraft the level's). Two GONGS (the level's gongs: src/ksar-hands.js rings and cuts them), two FLASK RACKS, three LEDGES
   over the roofs (one-way: the angle from above), two GUARD DOORS in the back wall. She starts at `her`, on the middle roof */
export const HM_STAGE = { W: 46, door: 6, shaftD: 6, shafts: [[13, 14], [30, 31]], gongs: [{ id: 'yardW', x: 4 }, { id: 'yardE', x: 41 }], racks: [9, 36],
  ledges: [{ x0: 1, x1: 8, dy: 4 }, { x0: 18, x1: 27, dy: 7 }, { x0: 37, x1: 44, dy: 4 }], doors: [2, 43], her: 23, wallRow: 12 };
export function stageHawkMistress(W, T, TS, sx, R) {
  const { set, block, ent, air } = W, ex = sx + HM_STAGE.W;
  const carve = () => {
    air(sx, ex - 1, R - 18, R - 1);
    block(sx - 1, sx - 1, R - 22, R - HM_STAGE.door - 1);   /* the west wall over the door you came in by (shut behind you) */
    block(ex, ex, R - 22, R - 1);
    block(sx - 1, ex, R - 22, R - 19);                       /* the high back wall of the keep (its wall walk is drawn: the runners use it) */
    for (const [a, b] of HM_STAGE.shafts) { air(sx + a, sx + b, R, R + HM_STAGE.shaftD - 1); block(sx + a, sx + b, R + HM_STAGE.shaftD, R + HM_STAGE.shaftD); }   /* THE SHAFTS: down between the roofs to the spikes */
    for (const l of HM_STAGE.ledges) for (let x = sx + l.x0; x <= sx + l.x1; x++) set(x, R - l.dy, T.ONEWAY);
    for (const g of HM_STAGE.gongs) ent('ksgong', sx + g.x, R - 1, { id: g.id, arena: true });
    for (const [i, x] of HM_STAGE.racks.entries()) ent('ksflasks', sx + x, R - 1, { id: 'rack' + i, arena: true });
    ent('hawkmistress', sx + HM_STAGE.her, R - 1, { face: -1 });
  };
  const arena = { x0: sx * TS, x1: ex * TS, floor: R * TS, trigger: (sx + 2) * TS, wallL: sx - 1, wallR: ex, boss: 'hawkmistress', music: 'hawkmistress',
    tint: '#c8843a', tintA: 0.05, start: [sx + 2, R - 1], y0: (R - 18) * TS, y1: (R + HM_STAGE.shaftD + 1) * TS, hm: { sx, R } };
  const shafts = HM_STAGE.shafts.map(([a, b]) => ({ x0: sx + a, x1: sx + b, top: R, bottom: R + HM_STAGE.shaftD - 1 }));
  return { arena, carve, shafts, gongs: HM_STAGE.gongs.map(g => ({ id: g.id, x: sx + g.x, y: R - 1, ear: 24, earY: 12, arena: true })), racks: HM_STAGE.racks.map((x, i) => ({ id: 'rack' + i, x: sx + x, y: R - 1, kind: 'flask', n: 2, arena: true })) };
}
/* the rooftops in world px, from the arena */
export function geom(A, TS = 16) {
  const q = A.hm, X = c => (q.sx + c) * TS, sh = HM_STAGE.shafts;
  const roofs = [[0, sh[0][0] - 1], [sh[0][1] + 1, sh[1][0] - 1], [sh[1][1] + 1, HM_STAGE.W - 1]].map(([a, b]) => [X(a), X(b + 1)]);
  return { TS, x0: X(0), x1: X(HM_STAGE.W), floorY: q.R * TS, wallY: (q.R - 18) * TS,
    shafts: sh.map(([a, b]) => [X(a), X(b + 1)]), roofs,
    gongs: HM_STAGE.gongs.map(g => ({ id: g.id, x: X(g.x) + 8 })), racks: HM_STAGE.racks.map((x, i) => ({ id: 'rack' + i, x: X(x) + 8 })),
    ledges: HM_STAGE.ledges.map(l => ({ x0: X(l.x0), x1: X(l.x1 + 1), y: (q.R - l.dy) * TS, c0: q.sx + l.x0, c1: q.sx + l.x1, row: q.R - l.dy })),
    doors: HM_STAGE.doors.map(c => X(c) + 8), fire: [[X(0), X(HM.fireW)], [X(HM_STAGE.W - HM.fireW), X(HM_STAGE.W)]] };
}
/* which roof a point is over (0..2), the nearest one when it is over a shaft; and whether it is over a shaft */
export const roofOf = (G, x) => { if (!G.roofs) return 0; let b = 0, bd = 1e9; G.roofs.forEach(([a, c], i) => { const d = x < a ? a - x : x > c ? x - c : 0; if (d < bd) { bd = d; b = i; } }); return b; };
export const overShaft = (G, x, pad = 0) => !!G.shafts && G.shafts.some(([a, b]) => x > a - pad && x < b + pad);
export const nearestShaft = (G, x) => (G.shafts || []).slice().sort((p, q) => Math.abs((p[0] + p[1]) / 2 - x) - Math.abs((q[0] + q[1]) / 2 - x))[0] || null;

/* ---------- ONE FIGHT ---------- */
export function newFight(G) {
  return { G, ph: 1, cycle: 0, step: 0, script: null, act: 0, ward: 0, openTaken: 0, behindT: 0, pend: 0, pendWhy: '', mark: null, runner: null, leap: null,
    knives: [], fan: null, keg: null, rake: null, snatch: null,
    hawk: { mode: 'circle', a: 0, x: 0, y: 0, t: 0, fx: 0, fy: 0, tx: 0, ty: 0 }, roofT: HM.roofEvery, fireT: 0, told: {},
    n: { cycles: 0, opens: 0, wheels: 0, blinds: 0, wards: 0, warded: 0, guarded: 0, rings: 0, ringsHome: 0, calls: 0, callsCut: 0, guards: 0, spots: 0, lashes: 0, cuts: 0, flashes: 0, crumbles: 0,
      leaps: 0, snares: 0, snared: 0, fans: 0, knives: 0, knivesHit: 0, kegs: 0, kegsBack: 0, kegOpens: 0, rakes: 0, snatches: 0, snatched: 0, flinches: 0, moves: {} } };
}
export const hPhase = e => (e.hp <= e.maxHp * HM.p3 ? 3 : e.hp <= e.maxHp * HM.p2 ? 2 : 1);
export const hmOpen = e => !!e && e.mode === 'whistle' && (e.open || 0) > 0;
const STRIKE = new Set(['lash', 'cut', 'markLash', 'snare', 'fan', 'leap']);
const GUARD_MODES = new Set(['walk', 'recover', 'feintHold']);
/* HER GAUNTLET: a blow from in front of her by a hero at her height (not from above, not in the air over her), while she is on guard */
export const guarded = (e, hx, hy, airborne) => !!e && !hmOpen(e) && !(e.broken > 0) && GUARD_MODES.has(e.mode) && (e.face || 1) * (hx - e.x) > -6 && !(airborne && hy < e.y - 10) && Math.abs(hy - e.y) < 26;
export const hawkAloft = S => !!S && ['circle', 'spot', 'climb'].includes(S.hawk.mode);

const nextScript = S => { const set = CYCLES[S.ph]; return set[S.cycle % set.length].slice(); };
function setMode(e, m, t) { e.mode = m; e.modeT = t; }
const clampX = (G, x) => Math.max(G.x0 + 16, Math.min(G.x1 - 16, x));
/* she keeps to the roof she stands on (a lunge or a step never carries her over a shaft's lip) */
const clampRoof = (G, x, from) => { const r = G.roofs ? G.roofs[roofOf(G, from)] : [G.x0, G.x1]; return Math.max(r[0] + 10, Math.min(r[1] - 10, clampX(G, x))); };
function tell(e, S, c, mode, t) { setMode(e, mode, t); S.act++; S.n.moves[mode] = (S.n.moves[mode] || 0) + 1; const mv = MOVES[mode]; if (mv && mv.mark) c.mark(mv.mark); c.sound(mv && mv.mark === '!!' ? 'tellHard' : 'tell'); }
function endOpen(e, S, c) { e.open = 0; S.ward = HM.wardT; S.n.wards++; S.openTaken = 0; S.hawk.mode = 'home'; S.hawk.t = HM.wardT; c.number(e.x, e.y - 70, 'THE HAWK IS HOME: SHE GUARDS', '#9ab0c0'); c.sound('tell'); c.fx('ward', e.x, e.y); }
function open(e, S, c) { setMode(e, 'whistle', HM.openT + 0.05); e.open = HM.openT; S.openTaken = 0; S.n.opens++; if (S.pendWhy === 'keg') S.n.kegOpens++;
  if (S.hawk.mode !== 'sent') { S.hawk.mode = 'return'; S.hawk.t = HM.openT; S.hawk.fx = S.hawk.x; S.hawk.fy = S.hawk.y; } else { S.hawk.t = Math.max(S.hawk.t, 0.4); S.hawk.after = 'return'; }
  S.leap = null; S.fan = null; c.fx('open', e.x, e.y); c.sound('whistle');
  c.number(e.x, e.y - 70, S.pendWhy === 'blind' ? 'THE HAWK IS BLIND: SHE WHISTLES IT BACK - CUT HER' : S.pendWhy === 'struck' ? 'THE HAWK FLINCHES OFF: SHE WHISTLES IT BACK - CUT HER' : S.pendWhy === 'keg' ? 'HER OWN KEG! SHE REELS - CUT HER' : 'THE HAWK WHEELS OFF: SHE WHISTLES IT BACK - CUT HER', '#8fd160'); }
/* THE HAWK FLINCHES (struck mid-dive, or turned on a shield): it is SENT OFF, and she whistles - an opening (unless the hawk was home / she is warded) */
function flinch(e, S, c, x, y) {
  S.n.flinches++; S.rake = null; S.snatch = null; S.mark = null;
  S.hawk.mode = 'sent'; S.hawk.t = 1.2; S.hawk.fx = x; S.hawk.fy = y; c.sound('hawk'); c.fx('flinch', x, y);
  if (!S.told.flinch) { S.told.flinch = 1; c.number(x, y - 18, 'THE HAWK FLINCHES OFF', '#ffd36b'); }
  if (S.ward > 0 || hmOpen(e) || S.pend > 0) return;
  S.pend = HM.flinchT; S.pendWhy = 'struck';
}

/* ---------- THE RULE ON HER (the hands call these) ---------- */
/* A GONG RUNG BY A HERO (src/ksar-hands.js, the roofs' gongs): the hawk wheels off, unless it is home. Returns 'wheel' | 'home' | 'busy' */
export function ringHeard(e, S, c) {
  if (!e || !e.alive || e.mode === 'sleep' || e.mode === 'wake') return 'busy';
  if (S.ward > 0 || S.hawk.mode === 'home' || S.hawk.mode === 'return') { S.n.ringsHome++; c.number(e.x, e.y - 64, 'THE HAWK IS ON HER GLOVE: IT KNOWS THE GONG', '#9ab0c0'); return 'home'; }
  if (S.pend > 0 || hmOpen(e)) return 'busy';
  S.rake = null; S.snatch = null;
  S.n.rings++; S.n.wheels++; S.hawk.mode = 'wheel'; S.hawk.t = HM.wheelT; S.hawk.fx = S.hawk.x; S.hawk.fy = S.hawk.y; S.pend = HM.wheelT; S.pendWhy = 'wheel'; c.sound('hawk');
  if (!S.told.wheel) { S.told.wheel = 1; c.number(e.x, e.y - 64, 'THE GONG SENDS THE HAWK WHEELING', '#ffd36b'); } return 'wheel';
}
/* A FLASH at (x, y) (a thrown flask, src/ksar-hands.js): the hawk in reach is blinded, unless it is home. Returns 'blind' | 'home' | 'far' | 'busy' */
export function flashAt(e, S, c, x, y) {
  if (!e || !e.alive || e.mode === 'sleep' || e.mode === 'wake') return 'busy';
  if (Math.hypot(S.hawk.x - x, S.hawk.y - y) > HM.flashHawk) return 'far';
  if (S.ward > 0 || S.hawk.mode === 'home' || S.hawk.mode === 'return') { c.number(e.x, e.y - 64, 'THE HAWK IS ON HER GLOVE', '#9ab0c0'); return 'home'; }
  if (S.pend > 0 || hmOpen(e)) return 'busy';
  S.rake = null; S.snatch = null;
  S.n.blinds++; S.hawk.mode = 'blind'; S.hawk.t = HM.blindT; S.pend = HM.blindT; S.pendWhy = 'blind'; c.sound('hawk');
  if (!S.told.blind) { S.told.blind = 1; c.number(e.x, e.y - 64, 'THE FLASH BLINDS THE HAWK', '#ffd36b'); } return 'blind';
}

/* ---------- ONE FRAME. h = the heroes [{ x, y, ground, alive, air, pp }], c = the world:
   c.hit(box, dmg, name, o) -> landed   c.number(x, y, line, col)  c.mark(m)  c.sound(k)  c.fx(kind, x, y)  c.shake(n)  c.music(ph)
   c.gongs() -> [{ id, x, cut, hum }]   c.guardRing(id) -> bool   c.guards() -> alive count   c.crumble() -> bool   c.time()
   (claude/ksar2) c.snare(dir) -> bool (a hero is wrapped: the hands yank him)   c.knife(k) -> 'hit' | 'blocked' | 'under' | 'over' | null
   c.keg(k) -> 'hit' | 'struck' | null   c.hawkAt(box, dmg, name, key) -> 'hit' | 'blocked' | 'struck' | null   c.carry(x) (the snatch: carry the caught hero over x) ---------- */
export function stepHawkMistress(e, S, dt, h, c) {
  const G = S.G, P = h.filter(q => q.alive).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0] || h[0];
  e.modeT -= dt; e.y = G.floorY;
  if (e.open > 0) e.open = Math.max(0, e.open - dt);
  if (S.ward > 0) S.ward = Math.max(0, S.ward - dt); e.ward = S.ward;
  stepHawk(e, S, dt, P, c); stepRunner(e, S, dt, c); stepKnives(e, S, dt, c); stepKeg(e, S, dt, c);
  if (S.ph === 3) stepFire(e, S, dt, h, c);
  if (e.mode === 'sleep') return;
  if (e.mode === 'wake') { if (e.modeT <= 0) { S.script = nextScript(S); S.step = 0; setMode(e, 'walk', 0.6); } return; }
  /* THE HAWK IS OFF (a gong, a flash, a flinch, her own keg): she breaks off a TELL at once, finishes a blade already moving, and WHISTLES - open */
  if (S.pend > 0) { S.pend -= dt; if (S.pend <= 0 && !STRIKE.has(e.mode)) { open(e, S, c); return; } if (S.pend <= 0) S.pend = 0.01; }
  /* BROKEN (her poise bar, emptied by heavies): she reels where she stands (B4) */
  if (e.broken > 0 && !hmOpen(e) && (GUARD_MODES.has(e.mode) || /Tell$/.test(e.mode))) { e.modeT += dt; return; }
  /* THE PHASES: a new one waits for the blow in hand and never cuts an opening short */
  const want = hPhase(e);
  if (want > S.ph && !hmOpen(e) && S.pend <= 0 && (e.mode === 'walk' || e.mode === 'recover')) {
    S.ph = want; S.cycle = 0; S.step = 0; S.script = null; e.phase = want; c.music(want);
    if (want === 2) { c.number(e.x, e.y - 70, 'HER GUARD ANSWERS THE GONGS: CUT THE ROPE HE RUNS FOR', '#ff9a5c'); c.sound('whistle'); setMode(e, 'recover', 0.6);
      for (const g of c.gongs().filter(q => !q.cut).slice(0, HM.guardCap)) if (c.guards() < HM.guardCap && c.guardRing(g.id)) S.n.guards++;
      return; }
    if (want === 3) { c.number((G.x0 + G.x1) / 2, G.floorY - 120, 'THE POWDER STORE BURNS: THE ROOFS GO', '#ff6b6b'); c.sound('blast'); c.shake(6); setMode(e, 'recover', 0.8); return; } }
  switch (e.mode) {
    case 'whistle': if (e.open <= 0) { endOpen(e, S, c); setMode(e, 'recover', 0.5); } return;   /* B4: she stands, glove up */
    case 'recover': if (e.modeT <= 0) nextMove(e, S, P, c); return;
    case 'leap': { const L = S.leap; if (!L) { setMode(e, 'recover', 0.2); return; } L.t += dt; const k = Math.min(1, L.t / HM.leapT); e.x = L.x0 + (L.x1 - L.x0) * k; e.yOff = -Math.sin(Math.PI * k) * HM.leapH;
      if (k >= 1) { S.leap = null; e.yOff = 0; c.fx('land', e.x, G.floorY); setMode(e, 'recover', 0.25); } return; }
    case 'walk': {
      const d = P.x - e.x;
      if ((e.face || 1) * d < -8) { S.behindT += dt; if (S.behindT > HM.turn) { e.face = Math.sign(d) || e.face; S.behindT = 0; } } else S.behindT = 0;
      /* AFTER YOU, ROOF TO ROOF: you are on another roof - she walks to her lip and LEAPS (B12: onto your roof, never into an opening) */
      if (G.roofs && roofOf(G, P.x) !== roofOf(G, e.x) && Math.abs(d) > HM.keep) { const mine = G.roofs[roofOf(G, e.x)], lip = d > 0 ? mine[1] - 12 : mine[0] + 12;
        if (Math.abs(e.x - lip) < 4) { const next = G.roofs[roofOf(G, e.x) + Math.sign(d)]; if (next) { const x1 = d > 0 ? next[0] + 18 : next[1] - 18; S.leap = { x0: e.x, x1, t: 0 }; e.face = Math.sign(d); S.n.leaps++; setMode(e, 'leap', HM.leapT); c.sound('leap'); if (!S.told.leap) { S.told.leap = 1; c.number(e.x, e.y - 60, 'SHE LEAPS THE SHAFT', '#ffd36b'); } return; } }
        e.x = clampRoof(G, e.x + Math.sign(lip - e.x) * Math.min(Math.abs(lip - e.x), HM.walk * 1.2 * dt), e.x); if (e.modeT <= 0) e.modeT = 0.1; return; }
      if (Math.abs(d) > HM.keep) e.x = clampRoof(G, e.x + Math.sign(d) * HM.walk * dt, e.x);
      else if (Math.abs(d) < HM.keep - 26) e.x = clampRoof(G, e.x - Math.sign(d) * HM.walk * 0.5 * dt, e.x);   /* she keeps her whip's distance */
      if (e.modeT <= 0) nextMove(e, S, P, c); return; }
  }
  stepMove(e, S, dt, P, h, c);
}
function nextMove(e, S, P, c) {
  if (!S.script || S.step >= S.script.length) { S.cycle++; S.n.cycles++; S.script = nextScript(S); S.step = 0; }
  let m = S.script[S.step++]; const dx = P.x - e.x, ad = Math.abs(dx), G = S.G;
  e.face = Math.sign(dx) || e.face;
  if ((m === 'lash' || m === 'snare') && ad > HM.lashRange) { setMode(e, 'walk', 0.45); S.step--; return; }      /* out of the whip's reach: she closes first */
  if ((m === 'feint' || m === 'keg') && ad > HM.lashRange + 30) { setMode(e, 'walk', 0.45); S.step--; return; }
  if ((m === 'spot' || m === 'rake' || m === 'snatch') && !hawkAloft(S)) m = 'lash';
  if (m === 'call') { const gs = c.gongs().filter(g => !g.cut); if (!gs.length || c.guards() >= HM.guardCap) m = hawkAloft(S) ? 'rake' : 'lash'; }
  if (m === 'keg' && S.keg) m = 'fan';
  if (m === 'lash' && ad > HM.lashRange) { setMode(e, 'walk', 0.45); return; }
  switch (m) {
    case 'lash': tell(e, S, c, 'lashTell', HM.lashTell); return;
    case 'feint': tell(e, S, c, 'feintTell', HM.feintTell); return;
    case 'snare': tell(e, S, c, 'snareTell', HM.snareTell); S.n.snares++; if (!S.told.snare) { S.told.snare = 1; c.number(e.x, e.y - 60, 'HER WHIP SNARES: JUMP OR ROLL FREE', '#ff6b6b'); } return;
    case 'fan': { tell(e, S, c, 'fanTell', HM.fanTell); const P3 = [['high', 'low', 'mid'], ['low', 'high', 'low'], ['mid', 'high', 'low'], ['high', 'high', 'low']];
      S.fan = { set: P3[(S.n.fans++) % P3.length], i: 0, t: 0 }; if (!S.told.fan) { S.told.fan = 1; c.number(e.x, e.y - 60, 'HER KNIVES: DUCK THE HIGH, JUMP THE LOW', '#ffd36b'); } return; }
    case 'keg': tell(e, S, c, 'kegTell', HM.kegTell); if (!S.told.keg) { S.told.keg = 1; c.number(e.x, e.y - 60, 'A LIT KEG: JUMP IT - OR STRIKE IT BACK AT HER', '#ff6b6b'); } return;
    case 'spot': { tell(e, S, c, 'spotTell', HM.spotTell); S.mark = { x: clampX(G, P.x) }; S.hawk.mode = 'spot'; S.hawk.t = HM.spotTell; S.hawk.fx = S.hawk.x; S.hawk.fy = S.hawk.y; S.n.spots++; c.sound('hawk'); return; }
    case 'call': { tell(e, S, c, 'callTell', HM.callTell); const gs = c.gongs().filter(g => !g.cut).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x)); S.callGong = gs[0].id; S.n.calls++; return; }
    case 'rake': { tell(e, S, c, 'rakeTell', HM.rakeTell); const d = P.x >= e.x ? 1 : -1, sx = clampX(G, P.x - d * 120), tx = P.x + d * 26;
      S.rake = { x0: sx, y0: G.floorY - 112, x1: tx, y1: G.floorY - 8, t: 0, key: 'rake' + S.act }; S.n.rakes++;
      S.hawk.mode = 'rakeTell'; S.hawk.t = HM.rakeTell; S.hawk.fx = S.hawk.x; S.hawk.fy = S.hawk.y; c.sound('hawk');
      if (!S.told.rake) { S.told.rake = 1; c.number(e.x, e.y - 60, 'THE RAKE: STEP OFF ITS LINE, OR STRIKE THE HAWK', '#ffd36b'); } return; }
    case 'snatch': { tell(e, S, c, 'snatchTell', HM.snatchTell); S.snatch = { x: clampX(G, P.x), t: 0, key: 'snatch' + S.act, lock: false }; S.n.snatches++;
      S.hawk.mode = 'hover'; S.hawk.t = HM.snatchTell; S.hawk.fx = S.hawk.x; S.hawk.fy = S.hawk.y; c.sound('hawk');
      if (!S.told.snatch) { S.told.snatch = 1; c.number(e.x, e.y - 60, 'THE SNATCH: BLOCK IT OR STRIKE IT AS IT DROPS', '#ffd36b'); } return; }
  }
  setMode(e, 'walk', 0.5);
}
const G0 = S => S.G;
/* THE TOLD BLOWS */
function stepMove(e, S, dt, P, h, c) {
  const G = S.G, f = e.face || 1, after = (t) => setMode(e, 'recover', t ?? HM.gap[S.ph - 1]);
  switch (e.mode) {
    case 'lashTell': if (e.modeT <= 0) { setMode(e, 'lash', HM.lashT); S.n.lashes++; c.sound('lash');
        c.hit([f > 0 ? e.x : e.x - HM.lashReach, f > 0 ? e.x + HM.lashReach : e.x, e.y - HM.lashH, e.y + 2], HM.dmg.lash, MOVE_NAME.lash, { key: 'lash' + S.act, low: true }); } return;
    case 'lash': if (e.modeT <= 0) after(); return;
    case 'snareTell': if (e.modeT <= 0) { setMode(e, 'snare', 0.2); c.sound('lash');
        const got = c.hit([f > 0 ? e.x : e.x - HM.snareReach, f > 0 ? e.x + HM.snareReach : e.x, e.y - HM.snareH, e.y + 2], HM.dmg.snare, MOVE_NAME.snare, { key: 'snare' + S.act });
        if (got && c.snare && c.snare(f)) S.n.snared++; } return;
    case 'snare': if (e.modeT <= 0) after(0.45); return;
    case 'fanTell': if (e.modeT <= 0) { setMode(e, 'fan', HM.fanGap * 3 + 0.1); } return;
    case 'fan': { const F = S.fan; if (F) { F.t -= dt; if (F.t <= 0 && F.i < F.set.length) { F.t = HM.fanGap; const ht = F.set[F.i++], dy = ht === 'high' ? 24 : ht === 'mid' ? 14 : 4;
          S.knives.push({ x: e.x + f * 10, y: G.floorY - dy, vx: f * HM.knifeV, ht, key: 'knife' + S.act + '_' + F.i }); S.n.knives++; c.sound('slash'); } }
      if (e.modeT <= 0) { S.fan = null; after(); } return; }
    case 'kegTell': if (e.modeT <= 0) { S.keg = { x: e.x + f * 14, vx: f * HM.kegV, fuse: HM.kegFuse, back: false }; S.n.kegs++; c.sound('blast'); c.fx('kick', e.x + f * 10, G.floorY); after(0.5); } return;
    case 'feintTell': if (e.modeT <= 0) { setMode(e, 'feintHold', HM.feintHold); c.fx('feint', e.x + f * 8, e.y); } return;
    case 'feintHold': if (e.modeT <= 0) { e.face = Math.sign(P.x - e.x) || f; tell(e, S, c, 'cutTell', HM.cutTell); } return;
    case 'cutTell': if (e.modeT <= 0) { setMode(e, 'cut', HM.cutT); S.n.cuts++; c.sound('slash'); } return;
    case 'cut': { e.x = clampRoof(G, e.x + f * HM.cutStep * dt, e.x); c.hit([f > 0 ? e.x - 6 : e.x - HM.cutReach, f > 0 ? e.x + HM.cutReach : e.x + 6, e.y - 28, e.y], HM.dmg.cut, MOVE_NAME.cut, { blockable: true, key: 'cut' + S.act });
      if (e.modeT <= 0) after(); return; }
    case 'spotTell': if (e.modeT <= 0) { S.hawk.mode = 'climb'; S.hawk.t = 0.8; S.hawk.fx = S.hawk.x; S.hawk.fy = S.hawk.y; tell(e, S, c, 'markLashTell', HM.markLashTell); } return;
    case 'markLashTell': if (e.modeT <= 0) { setMode(e, 'markLash', 0.18); c.sound('lash'); const mx = S.mark ? S.mark.x : P.x;
        c.hit([mx - HM.markR, mx + HM.markR, e.y - 44, e.y + 2], HM.dmg.markLash, MOVE_NAME.markLash, { key: 'mlash' + S.act }); c.fx('crack', mx, e.y); } return;
    case 'markLash': if (e.modeT <= 0) { S.mark = null; after(); } return;
    case 'callTell': if (e.modeT <= 0) { S.runner = { gong: S.callGong, t: HM.runT, t0: HM.runT, from: (S.callGong && c.gongs().find(g => g.id === S.callGong) || { x: e.x }).x < (G.x0 + G.x1) / 2 ? G.x1 - 30 : G.x0 + 30 };
        if (!S.told.call) { S.told.call = 1; c.number((G.x0 + G.x1) / 2, G.wallY + 30, 'A GUARD RUNS FOR A GONG: CUT ITS ROPE', '#ffd36b'); } after(0.4); } return;
    case 'rakeTell': if (e.modeT <= 0) { after(HM.rakeFly + 0.35); } return;           /* the hawk flies its line (stepHawk); she watches it go */
    case 'snatchTell': if (e.modeT <= 0) { after(HM.snatchDrop + 0.4); } return;
    default: setMode(e, 'walk', 0.5);
  }
}
/* THE KNIVES of the fan: they fly flat at their heights; the hands say what each did to a hero */
function stepKnives(e, S, dt, c) {
  if (!S.knives.length) return; const G = S.G;
  for (const k of S.knives) { k.x += k.vx * dt; const r = c.knife ? c.knife(k) : null;
    if (r === 'hit') { S.n.knivesHit++; k.dead = true; } else if (r === 'blocked') k.dead = true;
    if (k.x < G.x0 || k.x > G.x1) k.dead = true; }
  S.knives = S.knives.filter(k => !k.dead);
}
/* THE KEG: it rolls; over a shaft it drops in and blows there; struck by a hero it rolls BACK faster - home under her it blows and she reels (OPEN) */
function stepKeg(e, S, dt, c) {
  const K = S.keg; if (!K) return; const G = S.G;
  K.x += K.vx * dt; K.fuse -= dt;
  const boom = (x, why) => { S.keg = null; c.fx('blast', x, G.floorY - 6); c.sound('blast'); c.shake(4);
    if (why !== 'shaft') c.hit([x - HM.kegR, x + HM.kegR, G.floorY - 40, G.floorY + 2], HM.dmg.keg, MOVE_NAME.keg, { key: 'kegb' + Math.round(x) + '_' + S.n.kegs, noKnock: false }); };
  if (overShaft(G, K.x)) { S.keg = null; c.fx('shaftBlast', K.x, G.floorY + 20); c.sound('blast'); return; }
  if (K.x < G.x0 + 8 || K.x > G.x1 - 8 || K.fuse <= 0) { boom(K.x, 'fuse'); return; }
  if (K.back) { if (Math.abs(K.x - e.x) < 16 && e.alive) { S.keg = null; c.fx('blast', e.x, G.floorY - 6); c.sound('blast'); c.shake(6);
      if (!(S.ward > 0) && !hmOpen(e) && !(S.pend > 0)) { S.pend = 0.05; S.pendWhy = 'keg'; } } return; }
  const r = c.keg ? c.keg(K) : null;
  if (r === 'struck') { K.back = true; K.vx = -K.vx * HM.kegBack; K.fuse = Math.max(K.fuse, 2.5); S.n.kegsBack++; c.sound('clank'); c.number(K.x, G.floorY - 30, 'BACK AT HER!', '#8fd160'); }
  else if (r === 'hit') boom(K.x, 'hit');
}
/* THE HAWK: circles over her; wheels off (a gong); blinded (a flash); comes back to her whistle; home on her glove through the ward; drops to spot you;
   (claude/ksar2) RAKES along a told line; HOVERS and SNATCHES; is SENT OFF when it flinches; CARRIES a caught hero over a shaft */
function stepHawk(e, S, dt, P, c) {
  const k = S.hawk, G = S.G, up = G.floorY - HM.hawkAlt;
  k.t -= dt;
  const lerpTo = (tx, ty, r) => { k.x += (tx - k.x) * Math.min(1, dt * r); k.y += (ty - k.y) * Math.min(1, dt * r); };
  switch (k.mode) {
    case 'circle': k.a += dt * 2.2; lerpTo(e.x + Math.cos(k.a) * HM.hawkR, up + Math.sin(k.a * 2) * 7, 4); break;
    case 'home': k.x = e.x + (e.face || 1) * 9; k.y = e.y - 22; if (k.t <= 0 && S.ward <= 0) { k.mode = 'climb'; k.t = 0.7; k.fx = k.x; k.fy = k.y; } break;
    case 'climb': { const q = Math.max(0, Math.min(1, 1 - k.t / 0.7)); k.x = k.fx + (e.x - k.fx) * q; k.y = k.fy + (up - k.fy) * q; if (k.t <= 0) k.mode = 'circle'; break; }
    case 'wheel': { k.a += dt * 6; const r = 110 + 40 * Math.sin(k.a); lerpTo(clampX(G, e.x + Math.cos(k.a) * r), up - 50 + Math.sin(k.a) * 20, 3); break; }
    case 'blind': k.x += Math.sin(k.t * 31) * 40 * dt; k.y += Math.cos(k.t * 23) * 30 * dt; break;
    case 'sent': { k.y -= 90 * dt; k.x += (k.x < e.x ? -60 : 60) * dt; if (k.t <= 0) { k.mode = k.after || 'climb'; k.after = null; k.t = k.mode === 'return' ? HM.openT * 0.7 : 0.7; k.fx = k.x; k.fy = k.y; } break; }
    case 'return': { const q = Math.max(0, Math.min(1, 1 - k.t / HM.openT)); const tx = e.x + (e.face || 1) * 9, ty = e.y - 22;
      if (q < 0.5) { k.a += dt * 4; lerpTo(clampX(G, e.x + Math.cos(k.a) * 90), up - 30, 2); } else { k.x = k.x + (tx - k.x) * Math.min(1, dt * 3 * q); k.y = k.y + (ty - k.y) * Math.min(1, dt * 3 * q); } break; }
    case 'spot': if (S.mark) lerpTo(S.mark.x, G.floorY - 46, 6); break;
    /* THE RAKE: up to the line's high end while she tells it, then down the line and on past your spot */
    case 'rakeTell': if (S.rake) lerpTo(S.rake.x0, S.rake.y0, 6); if (k.t <= 0 && S.rake) { k.mode = 'rake'; k.t = HM.rakeFly; k.fx = k.x; k.fy = k.y; } break;
    case 'rake': { const R = S.rake; if (!R) { k.mode = 'climb'; k.t = 0.7; k.fx = k.x; k.fy = k.y; break; }
      const q = Math.max(0, Math.min(1, 1 - k.t / HM.rakeFly)), ex = R.x1 + (R.x1 - R.x0) * 0.35, ey = R.y1; k.x = k.fx + (ex - k.fx) * q; k.y = k.fy + (ey - k.fy) * q;
      const r = c.hawkAt ? c.hawkAt([k.x - HM.rakeR, k.x + HM.rakeR, k.y - HM.rakeR, k.y + HM.rakeR], HM.dmg.rake, MOVE_NAME.rake, R.key) : null;
      if (r === 'blocked' || r === 'struck') { flinch(e, S, c, k.x, k.y); break; }
      if (k.t <= 0) { S.rake = null; k.mode = 'climb'; k.t = 0.7; k.fx = k.x; k.fy = k.y; } break; }
    /* THE SNATCH: it hangs over you (tracking, then locked), drops; caught, it carries you over a shaft and lets go */
    case 'hover': { const Sn = S.snatch; if (!Sn) { k.mode = 'climb'; k.t = 0.7; k.fx = k.x; k.fy = k.y; break; }
      if (k.t > HM.snatchLock) Sn.x = clampX(G, P.x); else Sn.lock = true; lerpTo(Sn.x, G.floorY - 60, 7);
      if (k.t <= 0) { k.mode = 'drop'; k.t = HM.snatchDrop; k.fx = k.x; k.fy = k.y; } break; }
    case 'drop': { const Sn = S.snatch; if (!Sn) { k.mode = 'climb'; k.t = 0.7; k.fx = k.x; k.fy = k.y; break; }
      const q = Math.max(0, Math.min(1, 1 - k.t / HM.snatchDrop)); k.x = k.fx + (Sn.x - k.fx) * q; k.y = k.fy + (G.floorY - 14 - k.fy) * q;
      const r = c.hawkAt ? c.hawkAt([Sn.x - HM.snatchR, Sn.x + HM.snatchR, k.y - 10, G.floorY + 2], HM.dmg.snatch, MOVE_NAME.snatch, Sn.key) : null;
      if (r === 'blocked' || r === 'struck') { flinch(e, S, c, k.x, k.y); break; }
      if (r === 'hit') { S.n.snatched++; const sh = nearestShaft(G, Sn.x); k.mode = 'carry'; k.t = HM.carryT; k.fx = k.x; k.fy = k.y; k.tx = sh ? (sh[0] + sh[1]) / 2 : Sn.x; S.snatch = null; if (c.carry) c.carry(k.tx, HM.carryT); break; }
      if (k.t <= 0) { S.snatch = null; k.mode = 'climb'; k.t = 0.7; k.fx = k.x; k.fy = k.y; } break; }
    case 'carry': { const q = Math.max(0, Math.min(1, 1 - k.t / HM.carryT)); k.x = k.fx + (k.tx - k.fx) * q; k.y = k.fy + (G.floorY - 70 - k.fy) * q;
      if (k.t <= 0) { k.mode = 'climb'; k.t = 0.7; k.fx = k.x; k.fy = k.y; } break; }
  }
}
/* HER GUARD's RUNNER (phase two's CALL): along the wall walk to the gong; there he rings it if its rope still hangs (a door opens: her guard comes down) */
function stepRunner(e, S, dt, c) {
  const r = S.runner; if (!r) return; r.t -= dt; if (r.t > 0) return; S.runner = null;
  const g = c.gongs().find(q => q.id === r.gong);
  if (!g || g.cut) { S.n.callsCut++; c.number(g ? g.x : e.x, S.G.wallY + 30, 'THE ROPE IS CUT: NO ONE COMES', '#8fd160'); return; }
  if (c.guardRing(r.gong)) S.n.guards++;
}
/* PHASE THREE: the store's fire burns the roofs' two ends (a tick on a hero in it) and the roof ledges crumble end by end */
function stepFire(e, S, dt, h, c) {
  const G = S.G; S.fireT -= dt;
  if (S.fireT <= 0) { S.fireT = HM.fireTick; for (const [a, b] of G.fire) c.hit([a, b, G.floorY - 20, G.floorY + 2], HM.dmg.fire, MOVE_NAME.fire, { key: 'fire' + Math.round(c.time() * 2) + a, noKnock: true }); }
  S.roofT -= dt; if (S.roofT <= 0) { S.roofT = HM.roofEvery; if (c.crumble()) S.n.crumbles++; }
}

/* ---------- THE BOT'S READING (src/lab.js) ----------
   A HUMAN BOT: it sees a tell PLAN.react s late (the v2 profile's eyes already do that: s.v2) and misreads some; it jumps or blocks her lash, blocks or backs
   off her cut, steps off the hawk's mark; (claude/ksar2) it JUMPS a snare free, DUCKS a high knife, JUMPS a low one, blocks or rolls a mid one, JUMPS her keg
   or STRIKES IT BACK (some of the time), steps off the rake's line or swings at the hawk as it comes (some of the time), blocks the snatch or steps out from
   under it, and JUMPS THE SHAFTS between the roofs (never walks into one). Between her blows it works THE RULE: a gong while the hawk is up, the rope her
   guard runs for, a flask at the hawk. Open, it cuts her hard; warded, it waits off her; otherwise her BACK, or from a JUMP, never into her gauntlet.
   s = { P: { x, y, face, ground, atk, carry, snared, lifted }, e, S, gongs, racks, reach, shield, t, rng, mem, v2, hero } ->
       { gx, face, atk, jump, dodge, block, talk, up, down, why } */
export const PLAN = { react: 0.25, miss: 0.12, missRing: 0.15, ringR: 150, kegBack: 0.5, rakeSwing: 0.4, jumpEdge: 4 };
export function hmPlan(s) {
  const out = hmPlan0(s), { P, S } = s, G = S.G;
  /* THE SHAFTS: never a goal inside one; at a lip with the goal across, JUMP it */
  if (G.shafts && out.gx != null) {
    for (const [a, b] of G.shafts) if (out.gx > a - 8 && out.gx < b + 8) out.gx = Math.abs(out.gx - (a - 8)) < Math.abs(out.gx - (b + 8)) ? a - 10 : b + 10;
    if (P.ground && !out.block && !out.down) for (const [a, b] of G.shafts) {
      if (out.gx > b && P.x < a && a - P.x < PLAN.jumpEdge + 6 && a - P.x > 0) { out.jump = true; out.why += ' / over the shaft'; }
      if (out.gx < a && P.x > b && P.x - b < PLAN.jumpEdge + 6 && P.x - b > 0) { out.jump = true; out.why += ' / over the shaft'; } }
  }
  return out;
}
function hmPlan0(s) {
  const { P, e, S, reach } = s, G = S.G, out = { gx: null, face: P.face, atk: false, jump: false, dodge: false, block: false, talk: false, up: false, down: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0;
  mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 600) { mem.seen.clear(); mem.roll.clear(); }
  const seenFor = (key, d = s.v2 ? 0 : PLAN.react) => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= d; };
  const roll = (key, pr) => { if (!mem.roll.has(key)) mem.roll.set(key, rng() < pr); return mem.roll.get(key); };
  const lo = G.x0 + 12, hi = G.x1 - 12, clamp = x => Math.max(lo, Math.min(hi, x));
  const kx = e.x, side = Math.sign(P.x - kx) || 1, dx = Math.abs(kx - P.x), same = Math.abs(P.y - e.y) < 24, hitR = reach + HM.w / 2 - 2;
  const swing = fx => { out.face = Math.sign(fx - P.x) || out.face; out.atk = P.atk < 0; };
  const gongs = s.gongs || [], racks = s.racks || [];
  const fire = S.ph === 3 ? G.fire : [];
  const inFire = x => fire.some(([a, b]) => x > a - 6 && x < b + 6);
  const safeX = x => { let q = clamp(x); for (const [a, b] of fire) if (q > a - 8 && q < b + 8) q = a < G.x0 + 10 ? b + 10 : a - 10; return q; };
  const roomDir = ax => { const away = P.x <= ax ? -1 : 1, room = d => (d < 0 ? P.x - lo : hi - P.x); return room(away) >= 50 ? away : -away; };
  /* 0. WRAPPED IN HER WHIP: jump free (a beat late); OUT OF THE FIRE */
  if (P.snared) { if (seenFor('snare' + S.n.snared, s.v2 ? 0.12 : PLAN.react)) { if (P.ground) { out.jump = true; out.why = 'jump free of the snare'; } else if (!s.noRoll) { out.dodge = true; out.why = 'roll free of the snare'; } } else out.why = 'snared'; out.gx = P.x; return out; }
  if (P.lifted) { out.gx = P.x; out.why = 'the updraft'; return out; }
  if (inFire(P.x) && P.ground) { out.gx = safeX(P.x); out.why = 'out of the fire'; return out; }
  /* 0b. HER KNIVES: duck the high, jump the low, block (or roll) the mid */
  for (const k of S.knives || []) { const ahead = Math.sign(k.vx) === Math.sign(P.x - k.x), d = Math.abs(P.x - k.x); if (!ahead || d > 46) continue;
    if (!seenFor('kn' + k.key) || roll('knm' + k.key, s.v2 ? 0.08 : PLAN.miss)) continue;
    if (s.shield && P.ground) { out.block = true; out.face = Math.sign(k.x - P.x) || 1; out.gx = P.x; out.why = 'shield the knife'; return out; }
    if (k.ht === 'high' && P.ground) { out.down = true; out.gx = P.x; out.why = 'duck the high knife'; return out; }
    if (k.ht === 'low' && P.ground && d < 30) { out.jump = true; out.gx = P.x; out.why = 'jump the low knife'; return out; }
    if (k.ht === 'mid' && P.ground && d < 24 && !s.noRoll) { out.dodge = true; out.gx = P.x + Math.sign(k.vx) * 20; out.why = 'roll through the mid knife'; return out; }
    if (k.ht === 'mid' && P.ground && d < 34) { out.jump = true; out.gx = P.x; out.why = 'jump the mid knife'; return out; }
    out.gx = P.x; out.why = 'reading the knife'; return out; }
  /* 0c. HER KEG: strike it back (some of the time) or jump it */
  if (S.keg && !S.keg.back) { const K = S.keg, comes = Math.sign(K.vx) === Math.sign(P.x - K.x), d = Math.abs(P.x - K.x);
    if (comes && d < 90 && seenFor('keg' + S.n.kegs)) {
      if (roll('kegb' + S.n.kegs, PLAN.kegBack) && d < reach + 10 && d > 6) { out.face = Math.sign(K.x - P.x) || 1; out.atk = P.atk < 0; out.gx = P.x; out.why = 'strike the keg back at her'; return out; }
      if (d < 26 && P.ground) { out.jump = true; out.gx = P.x; out.why = 'jump the keg'; return out; }
      out.gx = P.x; out.face = Math.sign(K.x - P.x) || 1; out.why = 'wait for the keg'; return out; } }
  /* 1. HER BLOWS AND THE HAWK'S (a quarter-second late, some misread) */
  const key = 'k' + S.act + e.mode, hk = S.hawk;
  if (/Tell$/.test(e.mode) || e.mode === 'lash' || e.mode === 'cut' || hk.mode === 'rake' || hk.mode === 'drop' || hk.mode === 'hover') {
    const miss = s.v2 ? false : roll(key + 'm', PLAN.miss), seen = seenFor('a' + S.act + e.mode);
    if (seen && !miss) {
      if ((e.mode === 'markLashTell' || e.mode === 'spotTell') && S.mark && Math.abs(P.x - S.mark.x) < HM.markR + 14) { const d = roomDir(S.mark.x); out.gx = safeX(S.mark.x + d * (HM.markR + 26)); if (e.mode === 'markLashTell' && e.modeT < 0.25 && P.ground && !s.noRoll) out.dodge = true; out.why = 'off the hawk\'s mark'; return out; }
      /* THE RAKE: swing at the hawk as it comes in reach (some), or be off its line's end */
      if (S.rake && (hk.mode === 'rakeTell' || hk.mode === 'rake')) { const end = S.rake.x1, onIt = Math.abs(P.x - end) < 30;
        if (hk.mode === 'rake' && Math.abs(hk.x - P.x) < reach + 14 && Math.abs(hk.y - (P.y - 12)) < 26 && roll('rk' + S.rake.key, PLAN.rakeSwing)) { swing(hk.x); out.gx = P.x; out.why = 'strike the hawk mid-dive'; return out; }
        if (s.shield && hk.mode === 'rake' && Math.abs(hk.x - P.x) < 50) { out.block = true; out.face = Math.sign(hk.x - P.x) || 1; out.gx = P.x; out.why = 'block the rake'; return out; }
        if (onIt) { out.gx = safeX(end + (P.x >= end ? 1 : -1) * 44); out.why = 'off the rake\'s line'; return out; } }
      /* THE SNATCH: block it as it drops, or step out from under it once it locks */
      if (S.snatch && (hk.mode === 'hover' || hk.mode === 'drop') && Math.abs(P.x - S.snatch.x) < HM.snatchR + 22) {
        if (s.shield && (hk.mode === 'drop' || hk.t < 0.3)) { out.block = true; out.face = Math.sign(kx - P.x) || 1; out.gx = P.x; out.why = 'block the snatch'; return out; }
        if (hk.mode === 'drop' && roll('sn' + S.snatch.key, PLAN.rakeSwing)) { swing(hk.x); out.up = true; out.gx = P.x; out.why = 'strike the hawk as it drops'; return out; }
        if (S.snatch.lock) { const d = roomDir(S.snatch.x); out.gx = safeX(S.snatch.x + d * (HM.snatchR + 30)); out.why = 'out from under the snatch'; return out; } }
      if ((e.mode === 'lashTell' || e.mode === 'lash' || e.mode === 'snareTell') && dx < (e.mode === 'snareTell' ? HM.snareReach : HM.lashReach) + 14 && same && (e.face || 1) * (P.x - kx) > -6) {
        if (e.mode !== 'snareTell' && s.hero === 'knight' && s.shield && P.ground && (e.mode === 'lash' || e.modeT < 0.3)) { out.down = true; out.gx = P.x; out.face = Math.sign(kx - P.x) || 1; out.why = 'the low guard: the shield under the lash'; return out; }
        if ((e.mode === 'lash' || e.modeT < 0.16) && P.ground) { out.jump = true; out.gx = P.x; out.why = 'jump the lash'; return out; }
        out.gx = P.x; out.face = Math.sign(kx - P.x) || 1; out.why = 'ready to jump the lash'; return out; }
      if ((e.mode === 'cutTell' || e.mode === 'cut') && dx < 74 && same) { if (s.shield) { out.block = true; out.face = Math.sign(kx - P.x) || 1; out.why = 'block the knife'; return out; }
        out.gx = safeX(kx + side * 96); if (dx < 46 && e.mode === 'cutTell' && e.modeT < 0.18 && !s.noRoll) out.dodge = true; out.why = 'back off the knife'; return out; }
    }
  }
  /* 2. OPEN: cut her (any side); WARDED: off her */
  if (hmOpen(e)) { const st = s.tip ? 30 : 14; out.gx = safeX(kx + side * st); if (dx < hitR + 4 && same) swing(kx); out.why = 'cut her: the hawk is off'; return out; }
  if (S.ward > 0) { out.gx = safeX(kx + side * 80); out.why = 'her ward: wait'; return out; }
  if (S.pend > 0) { out.gx = safeX(kx + side * 30); out.why = 'she is about to whistle: close in'; return out; }
  /* 3. A FLASK IN THE HAND: throw it at the hawk */
  if (P.carry) { const hx = hk.x, hdx = hx - P.x;
    if (!hawkAloft(S)) { out.gx = safeX(P.x + (P.x < kx ? -30 : 30)); out.why = 'flask: wait for the hawk to go up'; return out; }
    const want = clamp(hx - Math.sign(hdx || 1) * 110); if (Math.abs(P.x - want) > 14 && !(Math.abs(hdx) > 70 && Math.abs(hdx) < 150)) { out.gx = safeX(want); out.why = 'flask: to a throw at the hawk'; return out; }
    out.face = Math.sign(hdx) || 1; out.gx = P.x; out.atk = P.atk < 0 && P.ground; out.why = 'flask: throw it at the hawk'; return out; }
  /* 4. PHASE TWO: a runner going for a hanging gong - cut that rope first */
  if (S.runner) { const g = gongs.find(q => q.id === S.runner.gong); if (g && !g.cut) { out.gx = clamp(g.x + (P.x < g.x ? -10 : 10)); if (Math.abs(P.x - g.x) < reach + 6) { out.face = Math.sign(g.x - P.x) || 1; out.gx = P.x; out.atk = P.atk < 0; } out.why = 'cut the rope before he gets there'; return out; } }
  /* 5. MAKE AN OPENING (the rule): RING a hanging, quiet gong; HANG BACK a fallen one; or THROW a flask from a rack - whichever is nearest */
  const free = gongs.filter(g => !g.cut && !(g.hum > 0)), fallen = gongs.filter(g => g.cut);
  if (hawkAloft(S) && !/Tell$/.test(e.mode)) {
    const near = a => a.slice().sort((p, q) => Math.abs(p.x - P.x) - Math.abs(q.x - P.x))[0];
    const g = free.slice().sort((a, b) => Math.abs(a.x - kx) - Math.abs(b.x - kx))[0], r = near(racks.filter(q => q.n > 0)), f = near(fallen);
    const dG = g && Math.abs(g.x - kx) < 260 ? Math.abs(g.x - P.x) : 1e9, dR = r ? Math.abs(r.x - P.x) + (S.ph === 1 ? 80 : 0) : 1e9, dF = f ? Math.abs(f.x - P.x) + 60 : 1e9;
    if (dG < 1e9 && dG <= dR && dG <= dF) { out.gx = clamp(g.x + (kx > g.x ? 10 : -10)); if (Math.abs(P.x - g.x) < 18 && dx < PLAN.ringR + 60 && !roll('ring' + Math.floor(t / 3), PLAN.missRing)) { out.talk = true; out.face = Math.sign(g.x - P.x) || 1; out.why = 'ring the gong: the hawk is up'; } else out.why = 'to a gong'; return out; }
    if (dF < 1e9 && dF < dR) { out.gx = clamp(f.x + (kx > f.x ? 10 : -10)); if (Math.abs(P.x - f.x) < 18 && P.ground && !roll('hang' + Math.floor(t / 3), PLAN.missRing)) { out.talk = true; out.face = Math.sign(f.x - P.x) || 1; out.why = 'hang the gong back'; } else out.why = 'to a fallen gong'; return out; }
    if (r) { out.gx = r.x; if (Math.abs(P.x - r.x) < 10 && P.ground) { out.talk = true; out.why = 'take a flask'; } else out.why = 'to a flask rack'; return out; } }
  /* 5b. WINDED (the lab's stamina rest): off her, out of her whip's reach, until the bar is back */
  if (s.rest) { out.gx = safeX(kx + side * (HM.lashReach + 40)); out.face = Math.sign(kx - P.x) || 1; out.why = 'winded: off her'; return out; }
  /* 6. FIGHT HER: her back when she turns from you; from a jump over her gauntlet (B11) */
  if (e.mode === 'leap') { out.gx = safeX(S.leap ? S.leap.x1 + side * 20 : P.x); out.why = 'where she lands'; return out; }
  if (dx < hitR && same && (e.face || 1) * (P.x - kx) < -6) { swing(kx); out.gx = P.x; out.why = 'cut her back'; return out; }
  if (/Tell$/.test(e.mode) && e.mode !== 'lashTell' && e.mode !== 'cutTell' && e.mode !== 'snareTell' && dx < hitR + 2 && same) { swing(kx); out.gx = P.x; out.why = 'cut her in her tell'; return out; }
  if ((e.mode === 'walk' || e.mode === 'recover') && dx < hitR + 30) { out.face = Math.sign(kx - P.x) || 1; if (dx > hitR - 4) { out.gx = clamp(kx + side * (hitR - 8)); out.why = 'in to her'; return out; }
    out.gx = P.x; if (P.ground) { out.jump = true; out.why = 'up over her gauntlet'; return out; } if (P.y < e.y - 12) out.atk = P.atk < 0; out.why = 'cut from the jump'; return out; }
  out.gx = safeX(kx + side * Math.max(40, hitR + 16)); out.face = Math.sign(kx - P.x) || 1; out.why = 'keep off her whip'; return out;
}
