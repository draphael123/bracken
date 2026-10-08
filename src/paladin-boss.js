// src/paladin-boss.js - THE PALADIN, THE LIT CHURCH's boss (claude/litchurch, the Opus greybox, 2026-10-08). The man the church's paladin order was sworn
// to: you beat THE PALADIN to buy the Paladin (clearing the church sells the hero for 800 coins). Concept: .claude/briefs/the-lit-church-concept.md and the
// 10-07 settled lines (HANDOFF 12:30 / 12:55): a B11 DUELIST (always hittable, guards by angle, NOT the x0.05 chip) with a LIGHT BAR; STARVE THE LIGHT -> a
// 3 s FALTER is the big told opening; an anti-spam ward after it; one new move a phase. (Waymeet's old 'closedhelm', who used to be called THE PALADIN, is
// THE CRUSADER now: names only - his fight is untouched.)
//
// WHAT HE IS (design standard B11): A DUELIST, NOT A PUZZLE. He is ALWAYS HITTABLE and GUARDS BY ANGLE. His AEGIS (the hero Paladin's own ward - "hold C:
//   AEGIS, a ward in front of him") turns a blow from the FRONT by a hero at his height while he is ON GUARD (walking, recovering): CLANK, "HIS AEGIS DRINKS
//   IT" (src/boss-read.js) - and THE AEGIS FEEDS HIS LIGHT (the class's own trade: every blow turned fills the bar). From BEHIND him, from ABOVE (a jump),
//   or while he is COMMITTED (his tells, his blows, his MEND, his KINDLE) a blow lands WHOLE - and it DRAINS his light. src/boss-greed.js FULL_DAMAGE (no
//   global chip; greed is still counted - the mash bot's reprisal).
// HIS LIGHT (a gold bar over him, drawn with every change: a gold tick up when the aegis drinks a blow, a dark notch out when one lands): it fills from the
//   blows his aegis turns and from THE SANCTUARY'S LAMPS (PB.light.regen a second for each one burning - the three you lit to come in); he SPENDS it on MEND
//   (he heals) and RADIANCE (columns of light). A blow that lands takes light away, and a lamp SNUFFED (a blade through it, standing in the open to do it)
//   takes PB.light.lampDim at once and the regen with it ("THE LAMP DIES: HIS LIGHT DIMS").
// THE OPENING (B1: the level's rule, made by the player): STARVE THE LIGHT - go round the aegis (bait, from behind, from a jump, cut his mend) and snuff
//   his lamps. Empty, HE FALTERS: PB.falterT s on one knee, the hammer's head on the floor (B4: he stands still) - OPEN (B10: a gold ring and a timer bar),
//   a blow x PB.falterMul, at most PB.falterCap of him an opening. Hammering his aegis all fight opens NOTHING - it feeds him (tools/lit-church.mjs proves it).
//   B3: when the falter ends A TOLD PB.wardT s WARD: the light comes back up his hammer (every blow clanks WARDED) and the bar refills to PB.light.refill.
// HE KINDLES: with two of his lamps dark he walks to the nearest and lights it again (no mark: a gold glow and the word; PB.kindleT s, committed - a blow
//   that lands cuts it and it stays dark).
// PHASE ONE - THE OATH (to PB.p2): HAMMER CHAIN (! two or three blows of the maul, stepping in: a shield turns each), AEGIS BASH (! the ward shoved
//   forward: a shield takes it - the concept's shield bash - or jump it, or roll), MEND (no mark - a gold glow and the word MEND, PB.mendT s: a blow cuts it and the light stays spent).
// PHASE TWO - THE ROSE WINDOW (PB.p2 to PB.p3). NEW MOVE: RADIANCE (!! red crosses on the floor - one for each lamp still burning: columns of light come
//   down on them PB.radTell s later; step off). The arena changes: the rose window over the altar blazes (drawn), and his regen climbs with it.
// PHASE THREE - JUDGEMENT (PB.p3 to 0). NEW MOVE: JUDGEMENT (!! his Hammer Leap: a red ring at your feet, he leaps and slams it - the ring's floor burns
//   with holy light for PB.holyT s after). The arena changes: the burning floor where he lands.
// PURE: no DOM, no main.js. The world is a context `c` (src/paladin-boss-hands.js binds it). pbPlan is the boss lab's HUMAN bot (src/lab.js).

export const PB = {
  hp: 3200, w: 18, h: 34, markH: 54,
  light: { max: 100, start: 80, regen: 2.6, feed: 13, drain: 10, drainHeavy: 17, mendCost: 30, radCost: 20, lampDim: 14, refill: 65, turned: 6, riposte: 12 },   /* turned: a hammer or bash a hero turns aside dims him; riposte: one answered on the beat (a parry, a perfect guard, a roll through) more, and he reels */
  reelT: 0.8,
  falterT: 3.0, falterMul: 1.8, falterCap: 0.13, wardT: 3.0,
  mendT: 1.0, mendHeal: 0.05, kindleT: 1.4, kindleCd: 7,   /* kindleCd: s before he goes for a lamp again (he always fights: a kindle is a beat, not a loop) */
  p2: 0.6, p3: 0.3,
  walk: 62, keep: 38, turn: 0.45, gap: [0.55, 0.45, 0.4],
  chainTell: 0.5, chainBeat: 0.34, chainT: 0.16, chainN: [2, 2, 3], chainReach: 38, chainStep: 130,
  bashTell: 0.62, bashT: 0.2, bashReach: 34, bashStep: 200,
  radTell: 0.95, radR: 13, radT: 0.35, radGap: 46,
  leapTell: 0.85, leapFly: 0.45, leapR: 24, holyT: 2.6, holyW: 26,
  dmg: { chain: 24, bash: 36, rad: 40, leap: 46, holy: 8 },
};
/* EVERY CYCLE CHANGES: the order of each pass, by phase (cycle k uses [k % n]) */
export const CYCLES = {
  1: [['chain', 'bash', 'chain', 'mend'], ['bash', 'chain', 'mend', 'chain'], ['chain', 'chain', 'bash', 'mend']],
  2: [['rad', 'chain', 'bash', 'mend'], ['chain', 'rad', 'mend', 'bash'], ['bash', 'chain', 'rad', 'chain']],
  3: [['leap', 'chain', 'rad', 'mend'], ['chain', 'leap', 'bash', 'rad'], ['rad', 'bash', 'leap', 'chain']],
};
/* THE MOVES: the mode while it is told, its mark, the answer (src/marks.js keeps the same rows) */
export const MOVES = {
  chainTell: { mark: '!', answer: 'block' }, chainBeatTell: { mark: '!', answer: 'block' }, bashTell: { mark: '!', answer: 'block' },
  mendTell: { mark: '', answer: '' }, kindleTell: { mark: '', answer: '' }, radTell: { mark: '!!', answer: 'dodge' }, leapTell: { mark: '!!', answer: 'dodge' },
};
export const MOVE_NAME = { chain: 'HIS HAMMER', bash: 'HIS AEGIS', rad: 'THE RADIANCE', leap: 'JUDGEMENT', holy: 'THE HOLY FLOOR' };

/* ---------- THE SANCTUARY ---------- */
/* local columns (0..41), the floor's surface row R (the hero stands on R-1). THE CHOIR STALLS (one-way ledges: the angle from above), THE ALTAR at the east
   end (drawn), THE ROSE WINDOW over it (drawn), THREE LAMPS on the floor (the ones you lit to come in: snuff one and his light dims). He starts at `him` */
export const PB_STAGE = { W: 42, door: 6, lamps: [7, 21, 35], stalls: [{ x0: 2, x1: 9, dy: 3 }, { x0: 32, x1: 39, dy: 3 }], him: 30, roof: 20 };
export function stagePaladin(W, T, TS, sx, R) {
  const { set, block, ent, air } = W, ex = sx + PB_STAGE.W;
  const lamps = PB_STAGE.lamps.map((x, i) => ({ id: 'arena' + i, x: sx + x, y: R - 1, room: 'sanctuary', kind: 'arena', lit: true }));
  const carve = () => {
    air(sx, ex - 1, R - PB_STAGE.roof, R - 1);
    block(sx - 1, sx - 1, R - PB_STAGE.roof - 4, R - PB_STAGE.door - 1);   /* the west wall over the door you came in by (shut behind you) */
    block(ex, ex, R - PB_STAGE.roof - 4, R - 1);
    block(sx - 1, ex, R - PB_STAGE.roof - 4, R - PB_STAGE.roof - 1);        /* the vault */
    for (const l of PB_STAGE.stalls) for (let x = sx + l.x0; x <= sx + l.x1; x++) set(x, R - l.dy, T.ONEWAY);
    for (const l of lamps) ent('lclamp', l.x, l.y, { id: l.id, arena: true });
    ent('paladinboss', sx + PB_STAGE.him, R - 1, { face: -1 });
  };
  const arena = { x0: sx * TS, x1: ex * TS, floor: R * TS, trigger: (sx + 2) * TS, wallL: sx - 1, wallR: ex, boss: 'paladinboss', music: 'paladin',
    tint: '#d8c070', tintA: 0.04, start: [sx + 2, R - 1], y0: (R - PB_STAGE.roof) * TS, y1: (R + 1) * TS, pb: { sx, R } };
  return { arena, carve, lamps };
}
/* the sanctuary in world px, from the arena */
export function geom(A, TS = 16) {
  const q = A.pb, X = c => (q.sx + c) * TS;
  return { TS, x0: X(0), x1: X(PB_STAGE.W), floorY: q.R * TS, roofY: (q.R - PB_STAGE.roof) * TS,
    lamps: PB_STAGE.lamps.map((x, i) => ({ id: 'arena' + i, x: X(x) + 8 })),
    stalls: PB_STAGE.stalls.map(l => ({ x0: X(l.x0), x1: X(l.x1 + 1), y: (q.R - l.dy) * TS })) };
}

/* ---------- ONE FIGHT ---------- */
export function newFight(G) {
  return { G, ph: 1, cycle: 0, step: 0, script: null, act: 0, light: PB.light.start, ward: 0, falterTaken: 0, behindT: 0, chainLeft: 0, marks: [], leap: null, holy: [], told: {}, flash: 0, lastLight: PB.light.start,
    n: { cycles: 0, falters: 0, wards: 0, warded: 0, guarded: 0, fed: 0, drained: 0, landed: 0, mends: 0, mendsCut: 0, kindles: 0, kindlesCut: 0, rads: 0, leaps: 0, chains: 0, bashes: 0, lampsOut: 0, moves: {} } };
}
export const pPhase = e => (e.hp <= e.maxHp * PB.p3 ? 3 : e.hp <= e.maxHp * PB.p2 ? 2 : 1);
export const pbOpen = e => !!e && e.mode === 'falter' && (e.open || 0) > 0;
const STRIKE = new Set(['chain', 'bash', 'rad', 'leap', 'land']);
const GUARD_MODES = new Set(['walk', 'recover']);
const COMMITTED = new Set(['reel', 'chainTell', 'chainBeatTell', 'chain', 'bashTell', 'bash', 'mendTell', 'kindleTell', 'radTell', 'rad', 'leapTell', 'leap', 'land']);
/* HIS AEGIS: a blow from in front of him by a hero at his height (not from above, not in the air over him), while he is on guard */
export const guarded = (e, hx, hy, airborne) => !!e && !pbOpen(e) && !(e.broken > 0) && GUARD_MODES.has(e.mode) && (e.face || 1) * (hx - e.x) > -6 && !(airborne && hy < e.y - 12) && Math.abs(hy - e.y) < 26;
export const litLamps = c => (c.lamps ? c.lamps().filter(l => l.lit).length : 3);

const nextScript = S => { const set = CYCLES[S.ph]; return set[S.cycle % set.length].slice(); };
function setMode(e, m, t) { e.mode = m; e.modeT = t; }
const clampX = (G, x) => Math.max(G.x0 + 18, Math.min(G.x1 - 18, x));
function tell(e, S, c, mode, t) { setMode(e, mode, t); S.act++; S.n.moves[mode] = (S.n.moves[mode] || 0) + 1; const mv = MOVES[mode]; if (mv && mv.mark) c.mark(mv.mark); c.sound(mv && mv.mark === '!!' ? 'tellHard' : mv && mv.mark ? 'tell' : 'glow'); }
const setLight = (S, v) => { S.light = Math.max(0, Math.min(PB.light.max, v)); };
function falter(e, S, c) { setMode(e, 'falter', PB.falterT + 0.05); e.open = PB.falterT; S.falterTaken = 0; S.n.falters++; S.chainLeft = 0; S.marks = []; S.leap = null; c.fx('open', e.x, e.y); c.sound('falter'); c.shake(3);
  c.number(e.x, e.y - 74, 'HIS LIGHT IS OUT: HE FALTERS - STRIKE', '#8fd160'); }
function endFalter(e, S, c) { e.open = 0; S.ward = PB.wardT; S.n.wards++; S.falterTaken = 0; setLight(S, PB.light.refill); c.fx('ward', e.x, e.y); c.sound('tell');
  c.number(e.x, e.y - 74, 'THE LIGHT RETURNS: HE IS WARDED', '#9ab0c0'); }

/* ---------- THE RULE ON HIM (the hands call these) ---------- */
/* A BLOW ON HIM from a hero at (hx, hy) (airborne: in the air). Returns { dmg, read } - read: 'aegis' (turned: it fed him), 'ward', 'open', 'landed' */
export function blowOn(e, S, c, dmg, hx, hy, airborne, heavy) {
  if (!e || !e.alive || e.mode === 'sleep' || e.mode === 'wake') return { dmg: 0, read: 'ward' };
  if (S.ward > 0) { S.n.warded++; return { dmg: 0, read: 'ward' }; }
  if (pbOpen(e)) { const cap = e.maxHp * PB.falterCap - S.falterTaken; const d = Math.max(0, Math.min(Math.round(dmg * PB.falterMul), Math.round(cap))); S.falterTaken += d; return { dmg: d, read: 'open' }; }
  if (guarded(e, hx, hy, airborne)) { S.n.guarded++; S.n.fed++; setLight(S, S.light + PB.light.feed); S.flash = 0.3;
    if (!S.told.aegis || S.n.guarded % 4 === 0) { S.told.aegis = 1; c.number(e.x, e.y - 64, 'HIS AEGIS DRINKS IT: GO ROUND', '#ffd36b'); } return { dmg: 0, read: 'aegis' }; }
  /* it LANDS: the man takes it, and his light goes */
  S.n.landed++; S.n.drained++; setLight(S, S.light - (heavy ? PB.light.drainHeavy : PB.light.drain));
  if (e.mode === 'mendTell') { S.n.mendsCut++; setMode(e, 'recover', 0.5); c.number(e.x, e.y - 64, 'THE MEND IS CUT: THE LIGHT IS SPENT', '#8fd160'); }
  if (e.mode === 'kindleTell') { S.n.kindlesCut++; setMode(e, 'recover', 0.5); c.number(e.x, e.y - 64, 'THE KINDLING IS CUT', '#8fd160'); }
  if (!S.told.drain) { S.told.drain = 1; c.number(e.x, e.y - 64, 'IT LANDS: HIS LIGHT DRAINS', '#8fd160'); }
  return { dmg, read: 'landed' };
}
/* HIS BLOW TURNED (the hands, off what damagePlayer said): a shield that takes his hammer or his bash dims his light; one answered ON THE BEAT (a parry, a perfect
   guard, a roll through it - main.js answered) is the RIPOSTE the concept asks for: more light, and he REELS PB.reelT s (committed: every blow lands) */
export function blowTurned(e, S, c, perfect) { if (!e || !e.alive || pbOpen(e) || S.ward > 0) return; setLight(S, S.light - (perfect ? PB.light.riposte : PB.light.turned)); S.n.turned = (S.n.turned || 0) + 1;
  if (perfect && (e.mode === 'chain' || e.mode === 'bash' || e.mode === 'chainBeatTell')) { S.n.ripostes = (S.n.ripostes || 0) + 1; S.chainLeft = 0; setMode(e, 'reel', PB.reelT); c.number(e.x, e.y - 64, S.told.riposte ? 'HE REELS ON THE BEAT' : 'ON THE BEAT: HE REELS, HIS LIGHT DIMS', '#8fd160'); S.told.riposte = 1; } }
/* A SANCTUARY LAMP SNUFFED (a hero's blade through it): his light dims at once, and his regen with it */
export function lampOut(e, S, c) { if (!e || !e.alive || e.mode === 'sleep') return; S.n.lampsOut++; setLight(S, S.light - PB.light.lampDim);
  c.number(e.x, e.y - 64, S.told.lamp ? 'HIS LIGHT DIMS' : 'THE LAMP DIES: HIS LIGHT DIMS', '#8fd160'); S.told.lamp = 1; }

/* ---------- ONE FRAME. h = the heroes [{ x, y, ground, alive, air, pp }], c = the world:
   c.hit(box, dmg, name, o) -> landed   c.number(x, y, line, col)  c.mark(m)  c.sound(k)  c.fx(kind, x, y)  c.shake(n)  c.music(ph)
   c.lamps() -> [{ id, x, lit }]   c.kindle(id) (a lamp lit again) ---------- */
export function stepPaladin(e, S, dt, h, c) {
  const G = S.G, P = h.filter(q => q.alive).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0] || h[0];
  e.modeT -= dt; e.y = G.floorY; S.flash = Math.max(0, S.flash - dt); S.kindleCd = Math.max(0, (S.kindleCd || 0) - dt);
  if (e.open > 0) e.open = Math.max(0, e.open - dt);
  if (S.ward > 0) S.ward = Math.max(0, S.ward - dt); e.ward = S.ward; e.pbLight = S.light;   /* (not e.light: main.js's own field - a ghost's lantern) */
  stepHoly(e, S, dt, h, c);
  if (e.mode === 'sleep') return;
  if (e.mode === 'wake') { if (e.modeT <= 0) { S.script = nextScript(S); S.step = 0; setMode(e, 'walk', 0.6); } return; }
  /* STARVED: the bar is empty - he falters, breaking off whatever he was telling (a blow already moving finishes first) */
  if (S.light <= 0 && e.mode !== 'falter' && S.ward <= 0 && !STRIKE.has(e.mode)) { falter(e, S, c); return; }
  /* HIS LAMPS feed him (not while he falters or is warded; never off an empty bar - an empty bar is a falter coming) */
  if (!pbOpen(e) && S.ward <= 0 && S.light > 0) setLight(S, S.light + PB.light.regen * litLamps(c) * (S.ph >= 2 ? 1.25 : 1) * dt);
  /* BROKEN (his poise bar, emptied by heavies): he reels where he stands (B4) */
  if (e.broken > 0 && !pbOpen(e) && (GUARD_MODES.has(e.mode) || /Tell$/.test(e.mode))) { e.modeT += dt; return; }
  /* THE PHASES: a new one waits for the blow in hand and never cuts an opening short */
  const want = pPhase(e);
  if (want > S.ph && !pbOpen(e) && (e.mode === 'walk' || e.mode === 'recover')) {
    S.ph = want; S.cycle = 0; S.step = 0; S.script = null; e.phase = want; c.music(want);
    if (want === 2) { c.number((G.x0 + G.x1) / 2, G.floorY - 140, 'THE ROSE WINDOW BLAZES: HIS RADIANCE', '#ffd36b'); c.sound('tellHard'); c.shake(4); setMode(e, 'recover', 0.8); return; }
    if (want === 3) { c.number((G.x0 + G.x1) / 2, G.floorY - 140, 'HE TAKES THE HAMMER IN BOTH HANDS: JUDGEMENT', '#ff6b6b'); c.sound('tellHard'); c.shake(5); setMode(e, 'recover', 0.8); return; } }
  switch (e.mode) {
    case 'falter': if (e.open <= 0) { endFalter(e, S, c); setMode(e, 'recover', 0.4); } return;   /* B4: on one knee, still */
    case 'recover': if (e.modeT <= 0) nextMove(e, S, P, c); return;
    case 'walk': {
      const d = P.x - e.x;
      if ((e.face || 1) * d < -8) { S.behindT += dt; if (S.behindT > PB.turn) { e.face = Math.sign(d) || e.face; S.behindT = 0; } } else S.behindT = 0;
      if (Math.abs(d) > PB.keep + 6) e.x = clampX(G, e.x + Math.sign(d) * PB.walk * dt);
      if (e.modeT <= 0) nextMove(e, S, P, c); return; }
    case 'kindleWalk': { const l = (c.lamps() || []).find(q => q.id === S.kindleId);
      if (!l || l.lit) { setMode(e, 'walk', 0.3); return; }
      const d = l.x - e.x; e.face = Math.sign(d) || e.face; if (Math.abs(d) > 10) { e.x = clampX(G, e.x + Math.sign(d) * PB.walk * 1.2 * dt); if (e.modeT <= 0) setMode(e, 'walk', 0.3); return; }
      tell(e, S, c, 'kindleTell', PB.kindleT); S.n.kindles++; c.number(e.x, e.y - 64, 'HE KINDLES THE LAMP: CUT IT', '#ffd36b'); return; }
  }
  stepMove(e, S, dt, P, h, c);
}
function nextMove(e, S, P, c) {
  /* HIS LAMPS: two of them dark, he goes to light one (not in a falter or a ward) */
  const lamps = c.lamps ? c.lamps() : [], dark = lamps.filter(l => !l.lit);
  if (dark.length >= 2 && S.ward <= 0 && !(S.kindleCd > 0)) { S.kindleCd = PB.kindleCd; const l = dark.slice().sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0]; S.kindleId = l.id; setMode(e, 'kindleWalk', 2.6); return; }
  if (!S.script || S.step >= S.script.length) { S.cycle++; S.n.cycles++; S.script = nextScript(S); S.step = 0; }
  let m = S.script[S.step++]; const dx = P.x - e.x, ad = Math.abs(dx);
  e.face = Math.sign(dx) || e.face;
  if (m === 'mend' && (S.light < PB.light.mendCost + 8 || e.hp >= e.maxHp)) m = 'chain';   /* (his own mend never empties his bar: a falter is yours to earn) */
  if (m === 'rad' && S.light < PB.light.radCost) m = 'chain';
  if ((m === 'chain' || m === 'bash') && ad > PB.chainReach + 46) { setMode(e, 'walk', 0.45); S.step--; return; }   /* out of the maul's reach: he closes first */
  switch (m) {
    case 'chain': S.chainLeft = PB.chainN[S.ph - 1]; S.n.chains++; tell(e, S, c, 'chainTell', PB.chainTell); return;
    case 'bash': S.n.bashes++; tell(e, S, c, 'bashTell', PB.bashTell); return;
    case 'mend': S.n.mends++; setLight(S, S.light - PB.light.mendCost); tell(e, S, c, 'mendTell', PB.mendT); c.number(e.x, e.y - 64, 'MEND', '#ffd36b'); return;
    case 'rad': { S.n.rads++; setLight(S, S.light - PB.light.radCost); tell(e, S, c, 'radTell', PB.radTell);
      const n = Math.max(1, litLamps(c)), G = S.G; S.marks = [];
      for (let i = 0; i < n; i++) S.marks.push({ x: clampX(G, P.x + (i - (n - 1) / 2) * PB.radGap + (i === 0 && n === 1 ? 0 : 0)) });
      if (!S.told.rad) { S.told.rad = 1; c.number(e.x, e.y - 74, 'RADIANCE: ONE COLUMN FOR EACH LAMP THAT BURNS', '#ffd36b'); }
      for (const mk of S.marks) c.fx('cross', mk.x, S.G.floorY); return; }
    case 'leap': { S.n.leaps++; tell(e, S, c, 'leapTell', PB.leapTell); S.leap = { x: clampX(S.G, P.x), fx: e.x }; c.fx('ring', S.leap.x, S.G.floorY); return; }
  }
  setMode(e, 'walk', 0.5);
}
/* THE TOLD BLOWS */
function stepMove(e, S, dt, P, h, c) {
  const G = S.G, f = e.face || 1, after = (t) => setMode(e, 'recover', t ?? PB.gap[S.ph - 1]);
  switch (e.mode) {
    case 'chainTell': case 'chainBeatTell': if (e.modeT <= 0) { setMode(e, 'chain', PB.chainT); c.sound('slam'); } return;
    case 'chain': { e.x = clampX(G, e.x + f * PB.chainStep * dt);
      c.hit([f > 0 ? e.x - 6 : e.x - PB.chainReach, f > 0 ? e.x + PB.chainReach : e.x + 6, e.y - 30, e.y], PB.dmg.chain, MOVE_NAME.chain, { blockable: true, key: 'chain' + S.act });
      if (e.modeT <= 0) { S.chainLeft--; if (S.chainLeft > 0) { e.face = Math.sign(P.x - e.x) || f; tell(e, S, c, 'chainBeatTell', PB.chainBeat); } else after(); } return; }
    case 'bashTell': if (e.modeT <= 0) { setMode(e, 'bash', PB.bashT); c.sound('bash'); } return;
    case 'bash': { e.x = clampX(G, e.x + f * PB.bashStep * dt);
      c.hit([f > 0 ? e.x - 4 : e.x - PB.bashReach, f > 0 ? e.x + PB.bashReach : e.x + 4, e.y - 32, e.y], PB.dmg.bash, MOVE_NAME.bash, { blockable: true, key: 'bash' + S.act, knock: f });
      if (e.modeT <= 0) after(0.5); return; }
    case 'mendTell': if (e.modeT <= 0) { const heal = Math.round(e.maxHp * PB.mendHeal); e.hp = Math.min(e.maxHp, e.hp + heal); c.fx('mend', e.x, e.y); c.number(e.x, e.y - 50, '+' + heal, '#ffd36b'); after(0.35); } return;
    case 'kindleTell': if (e.modeT <= 0) { if (c.kindle) c.kindle(S.kindleId); after(0.35); } return;
    case 'radTell': if (e.modeT <= 0) { setMode(e, 'rad', PB.radT); c.sound('radiance'); c.shake(2);
        for (const mk of S.marks) { c.hit([mk.x - PB.radR, mk.x + PB.radR, G.roofY, G.floorY + 2], PB.dmg.rad, MOVE_NAME.rad, { key: 'rad' + S.act + '_' + Math.round(mk.x) }); c.fx('column', mk.x, G.floorY); } } return;
    case 'rad': if (e.modeT <= 0) { S.marks = []; after(); } return;
    case 'leapTell': if (e.modeT <= 0) { setMode(e, 'leap', PB.leapFly); S.leap.fx = e.x; c.sound('leap'); } return;
    case 'leap': { const q = Math.max(0, Math.min(1, 1 - e.modeT / PB.leapFly)); e.x = S.leap.fx + (S.leap.x - S.leap.fx) * q; e.lift = Math.sin(q * Math.PI) * 70;
      if (e.modeT <= 0) { e.lift = 0; setMode(e, 'land', 0.55); c.shake(6); c.sound('slam'); c.fx('land', S.leap.x, G.floorY);
        c.hit([S.leap.x - PB.leapR, S.leap.x + PB.leapR, G.floorY - 40, G.floorY + 4], PB.dmg.leap, MOVE_NAME.leap, { key: 'leap' + S.act });
        S.holy.push({ x: S.leap.x, t: PB.holyT }); S.leap = null; } return; }
    case 'land': if (e.modeT <= 0) after(0.3); return;   /* (he lands committed: a beat to punish) */
    case 'reel': if (e.modeT <= 0) after(0.3); return;   /* (the riposte's beat: B4, he stands) */
    default: setMode(e, 'walk', 0.5);
  }
}
/* THE HOLY FLOOR (phase three): where his judgement lands the floor burns a while (a tick on a hero standing in it) */
function stepHoly(e, S, dt, h, c) {
  for (const q of S.holy) { q.t -= dt; q.tick = (q.tick || 0) - dt; if (q.tick <= 0) { q.tick = 0.5; c.hit([q.x - PB.holyW, q.x + PB.holyW, S.G.floorY - 18, S.G.floorY + 2], PB.dmg.holy, MOVE_NAME.holy, { key: 'holy' + Math.round(q.x) + '_' + Math.round(q.t * 2), noKnock: true }); } }
  S.holy = S.holy.filter(q => q.t > 0);
}

/* ---------- THE BOT'S READING (src/lab.js) ----------
   A HUMAN BOT: it sees a tell PLAN.react s late (the v2 profile's eyes already do that: s.v2) and misreads some; it blocks the hammer (or backs off it), jumps
   or rolls the aegis bash, steps off the radiance crosses and the judgement's ring and out of the holy floor; between his blows it works THE RULE: it never
   swings into his aegis on purpose - it goes ROUND (behind him: he turns in PB.turn s) or comes DOWN on him from a jump; it cuts his MEND and his KINDLE; when
   he is far and at least one of his lamps burns, it SNUFFS the nearest (a blade through it). Open, it hits him hard; warded, it waits off him.
   s = { P: { x, y, face, ground, atk }, e, S, lamps: [{ id, x, lit }], reach, shield, t, rng, mem, v2, hero, rest } -> { gx, face, atk, jump, dodge, block, down, why } */
export const PLAN = { react: 0.25, miss: 0.12, lampR: 110 };
export function pbPlan(s) {
  const { P, e, S, reach } = s, G = S.G, out = { gx: null, face: P.face, atk: false, jump: false, dodge: false, block: false, talk: false, up: false, down: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0;
  mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 600) { mem.seen.clear(); mem.roll.clear(); }
  const seenFor = (key, d = s.v2 ? 0 : PLAN.react) => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= d; };
  const roll = (key, pr) => { if (!mem.roll.has(key)) mem.roll.set(key, rng() < pr); return mem.roll.get(key); };
  const lo = G.x0 + 12, hi = G.x1 - 12, clamp = x => Math.max(lo, Math.min(hi, x));
  const kx = e.x, side = Math.sign(P.x - kx) || 1, dx = Math.abs(kx - P.x), same = Math.abs(P.y - e.y) < 24, hitR = reach + PB.w / 2 - 2;
  const swing = fx => { out.face = Math.sign(fx - P.x) || out.face; out.atk = P.atk < 0; };
  const holy = S.holy || [], inHoly = x => holy.some(q => Math.abs(x - q.x) < PB.holyW + 6);
  const safeX = x => { let q = clamp(x); for (const h of holy) if (Math.abs(q - h.x) < PB.holyW + 8) q = h.x + (q < h.x ? -1 : 1) * (PB.holyW + 10); return clamp(q); };
  const roomDir = ax => { const away = P.x <= ax ? -1 : 1, room = d => (d < 0 ? P.x - lo : hi - P.x); return room(away) >= 50 ? away : -away; };
  /* 0. OUT OF THE HOLY FLOOR */
  if (inHoly(P.x) && P.ground) { out.gx = safeX(P.x); out.why = 'off the holy floor'; return out; }
  /* 1. HIS BLOWS (a quarter-second late, some misread) */
  if (/Tell$/.test(e.mode) || STRIKE.has(e.mode)) {
    const miss = s.v2 ? false : roll('m' + S.act + e.mode, PLAN.miss), seen = seenFor('a' + S.act + e.mode);
    if (seen && !miss) {
      if ((e.mode === 'radTell' || e.mode === 'rad') && S.marks.some(m => Math.abs(P.x - m.x) < PB.radR + 12)) { const m = S.marks.find(q => Math.abs(P.x - q.x) < PB.radR + 12), d = roomDir(m.x); out.gx = safeX(m.x + d * (PB.radR + 20)); if (e.mode === 'radTell' && e.modeT < 0.2 && P.ground && !s.noRoll) out.dodge = true; out.why = 'off the cross'; return out; }
      if ((e.mode === 'leapTell' || e.mode === 'leap') && S.leap && Math.abs(P.x - S.leap.x) < PB.leapR + 16) { const d = roomDir(S.leap.x); out.gx = safeX(S.leap.x + d * (PB.leapR + 30)); if (e.mode === 'leap' && P.ground && !s.noRoll) out.dodge = true; out.why = 'off the judgement ring'; return out; }
      if ((e.mode === 'bashTell' || e.mode === 'bash') && dx < PB.bashReach + 40 && same && (e.face || 1) * (P.x - kx) > -6) {
        if (s.shield) { out.block = true; out.face = Math.sign(kx - P.x) || 1; out.why = 'block the bash'; return out; }
        if ((e.mode === 'bash' || e.modeT < 0.2) && P.ground) { if (!s.noRoll && dx < 40) { out.dodge = true; out.gx = clamp(kx + (e.face || 1) * 60); out.why = 'roll through the bash'; return out; } out.jump = true; out.gx = P.x; out.why = 'jump the bash'; return out; }
        out.gx = P.x; out.face = Math.sign(kx - P.x) || 1; out.why = 'ready for the bash'; return out; }
      if ((e.mode === 'chainTell' || e.mode === 'chainBeatTell' || e.mode === 'chain') && dx < PB.chainReach + 40 && same) {
        if (s.shield) { out.block = true; out.face = Math.sign(kx - P.x) || 1; out.why = 'block the hammer'; return out; }
        out.gx = safeX(kx + side * 92); if (dx < 50 && e.modeT < 0.18 && /Tell$/.test(e.mode) && !s.noRoll) out.dodge = true; out.why = 'back off the hammer'; return out; }
    }
  }
  /* 2. OPEN: hit him (any side); WARDED: off him */
  if (pbOpen(e)) { const st = s.tip ? 30 : 14; out.gx = safeX(kx + side * st); if (dx < hitR + 4 && same) swing(kx); out.why = 'hit him: he falters'; return out; }
  if (S.ward > 0) { out.gx = safeX(kx + side * 80); out.why = 'his ward: wait'; return out; }
  /* 3. HIS MEND, HIS KINDLE: committed - cut them */
  if ((e.mode === 'mendTell' || e.mode === 'kindleTell') && !roll('cut' + S.act, 0.15)) { if (dx > hitR - 2) { out.gx = clamp(kx + side * (hitR - 8)); out.why = 'in to cut the ' + (e.mode === 'mendTell' ? 'mend' : 'kindle'); return out; } swing(kx); out.gx = P.x; out.why = 'cut the ' + (e.mode === 'mendTell' ? 'mend' : 'kindle'); return out; }
  /* 4. STARVE HIM: snuff a lamp when he is far and walking (a blade through it) */
  const lit = (s.lamps || []).filter(l => l.lit);
  if (lit.length && (e.mode === 'walk' || e.mode === 'recover' || e.mode === 'kindleWalk') && dx > 70) { const l = lit.slice().sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
    if (Math.abs(l.x - P.x) < PLAN.lampR && Math.abs(l.x - kx) > 70) { const st = l.x - (Math.sign(l.x - P.x) || 1) * 14; if (Math.abs(P.x - st) > 6) { out.gx = clamp(st); out.why = 'to his lamp'; return out; }
      out.face = Math.sign(l.x - P.x) || 1; out.gx = P.x; out.atk = P.atk < 0; out.why = 'snuff his lamp'; return out; } }
  /* 4b. WINDED (the lab's stamina rest): off him, out of the hammer's reach */
  if (s.rest) { out.gx = safeX(kx + side * (PB.chainReach + 60)); out.face = Math.sign(kx - P.x) || 1; out.why = 'winded: off him'; return out; }
  /* 5. FIGHT HIM: his back when he turns from you; in his tells (committed); from a jump over his aegis (B11) - never into it */
  if (e.mode === 'reel' && dx < hitR + 6 && same) { swing(kx); out.gx = P.x; out.why = 'the riposte: he reels'; return out; }
  if (dx < hitR && same && (e.face || 1) * (P.x - kx) < -6) { swing(kx); out.gx = P.x; out.why = 'hit his back'; return out; }
  if (/Tell$/.test(e.mode) && e.mode !== 'chainTell' && e.mode !== 'chainBeatTell' && e.mode !== 'bashTell' && dx < hitR + 2 && same) { swing(kx); out.gx = P.x; out.why = 'hit him in his tell'; return out; }
  if ((e.mode === 'walk' || e.mode === 'recover' || e.mode === 'land') && dx < hitR + 34) { out.face = Math.sign(kx - P.x) || 1;
    if (e.mode === 'land' && dx < hitR + 2 && same) { swing(kx); out.gx = P.x; out.why = 'hit him as he lands'; return out; }
    if (dx > hitR - 4) { out.gx = clamp(kx + side * (hitR - 8)); out.why = 'in to him'; return out; }
    out.gx = P.x; if (P.ground) { out.jump = true; out.why = 'up over his aegis'; return out; } if (P.y < e.y - 14) out.atk = P.atk < 0; out.why = 'down on him from the jump'; return out; }
  out.gx = safeX(kx + side * Math.max(46, hitR + 18)); out.face = Math.sign(kx - P.x) || 1; out.why = 'keep off his hammer'; return out;
}
