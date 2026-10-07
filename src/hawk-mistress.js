// src/hawk-mistress.js - THE HAWK-MISTRESS, THE BANDIT KSAR's boss (claude/ksar, the Opus greybox, 2026-10-07). The raiders' chief and falconer - not a
// goblin, not another king (Daniel 10-06). Concept + interview: .claude/briefs/brief-banditksar.md (Daniel 10-07: THE HAWK IS PART OF HER KIT - one
// target, unkillable; it spots and dives; a rung gong sends it wheeling, a flash blinds it -> she is open while she whistles it back).
//
// WHAT SHE IS (design standard B11): A HUMAN DUELIST, NOT A PUZZLE. She is ALWAYS HITTABLE and GUARDS BY ANGLE: her falconer's GAUNTLET turns a blow from
//   the front by a hero standing at her height while she is ON GUARD (walking, recovering) - CLANK, "HER GAUNTLET" (src/boss-read.js's read); from BEHIND
//   her, or from ABOVE (a jump), it lands whole; in her tells and her strikes she is committed and every blow lands. She is on src/boss-greed.js
//   FULL_DAMAGE (no global chip; greed is still counted - the mash bot's reprisal). Her kit: THE WHIP, A CURVED KNIFE, FLASH POWDER, and THE HAWK.
// THE HAWK (her kit, not a foe: never in the enemy list, a blade passes through it - "IT RIDES THE AIR"). It circles over her: her eyes.
// HER OPENINGS ARE THE RULE'S (B1): THE FORT ANSWERS ITS GONGS -
//   RING A GONG (E: the courtyard's gongs are the level's, src/ksar-hands.js) and the noise sends the hawk WHEELING off; or BLIND IT with a FLASH FLASK
//   (the racks in the courtyard; the flash within HM.flashHawk of it). Either way SHE WHISTLES IT BACK: OPEN (HM.openT s; B10: a gold ring and a timer
//   bar), a blow x HM.openMul, one opening HM.openCap of her at most. B4: open, she stands where she is, glove up, whistling - no step, no retreat.
//   B3: when the opening ends the hawk is home on her glove - a TOLD HM.wardT s WARD (every blow clanks WARDED; a gong or a flash finds the hawk home).
//   Her OWN guards' gongs do not spook it (it knows her bandits' beat) - only a stranger's hand on a gong.
// PHASE ONE - THE COURTYARD DUEL (to HM.p2): WHIP LASH (! a long low lash: jump it, or a shield takes it), KNIFE FEINT (a feint step, nothing - then the
//   real cut, !: a shield turns it), THE HAWK SPOTS (! it drops over you and shrieks: your spot is MARKED - her next lash cracks there, !!: step off it).
// PHASE TWO - HER GUARD ANSWERS THE GONGS (HM.p2 to HM.p3). NEW MOVE: THE CALL (! two notes): a guard runs the wall walk for the nearest gong; rung, a door
//   opens and her guard comes down (HM.guardCap alive). CUT THE ROPES to fight her alone - a cut gong cannot call her guard, but it cannot send the hawk
//   off either: then the FLASKS are the way in. The arena changes: the guard doors and the runners on the wall walk.
// PHASE THREE - THE POWDER STORE BURNS (HM.p3 to 0). NEW MOVE: THE HAWK DIVES (!! its shadow marks your spot, it stoops: step off it - no shield turns
//   it). The arena changes: the store's fire burns along the yard's two ends and the ROOF LEDGES CRUMBLE end by end (told: "THE ROOF GOES").
//   DESPERATION (once, under HM.desp): FLASH POWDER (!! a white burst round her: be out of it).
// PURE: no DOM, no main.js. The world is a context `c` (src/hawk-mistress-hands.js binds it). hmPlan is the boss lab's HUMAN bot (src/lab.js).

export const HM = {
  hp: 1400, w: 16, h: 30, markH: 48,
  openMul: 1.6, openCap: 0.07, openT: 3.6, wardT: 3.0, wheelT: 0.9, blindT: 0.7, flashHawk: 80,
  p2: 0.6, p3: 0.25, desp: 0.12,
  walk: 70, keep: 50, turn: 0.35, gap: [0.5, 0.42, 0.36],
  lashTell: 0.55, lashT: 0.16, lashReach: 86, lashH: 16, lashRange: 110,
  feintTell: 0.42, feintHold: 0.24, cutTell: 0.34, cutT: 0.14, cutReach: 34, cutStep: 110,
  spotTell: 0.9, markLashTell: 0.65, markR: 22,
  callTell: 0.8, runT: 2.4, guardCap: 2,
  diveTell: 0.95, diveFly: 0.32, diveR: 20, diveLow: 0.7,
  flashTell: 0.85, flashR: 62,
  hawkAlt: 74, hawkR: 30,
  fireW: 3, fireTick: 0.5, roofEvery: 4.0,
  dmg: { lash: 31, cut: 34, markLash: 36, dive: 36, flash: 26, fire: 9 },
};
/* EVERY CYCLE CHANGES: the order of each pass, by phase (cycle k uses [k % n]) */
export const CYCLES = {
  1: [['lash', 'feint', 'spot', 'lash'], ['feint', 'lash', 'feint', 'spot'], ['spot', 'lash', 'feint', 'lash']],
  2: [['call', 'lash', 'feint', 'spot'], ['lash', 'feint', 'call', 'lash'], ['feint', 'spot', 'lash', 'call']],
  3: [['dive', 'lash', 'feint', 'dive'], ['lash', 'dive', 'feint', 'spot'], ['dive', 'feint', 'lash', 'call']],
};
/* THE MOVES: the mode while it is told, its mark, the answer (src/marks.js keeps the same rows) */
export const MOVES = {
  lashTell: { mark: '!', answer: 'jump' }, feintTell: { mark: '', answer: '' }, cutTell: { mark: '!', answer: 'block' }, spotTell: { mark: '!', answer: '' },
  markLashTell: { mark: '!!', answer: 'dodge' }, callTell: { mark: '!', answer: '' }, diveTell: { mark: '!!', answer: 'dodge' }, flashTell: { mark: '!!', answer: 'dodge' },
};
export const MOVE_NAME = { lash: 'HER WHIP', cut: 'HER KNIFE', markLash: 'HER WHIP', dive: 'HER HAWK', flash: 'HER FLASH POWDER', fire: 'THE FIRE' };

/* ---------- THE COURTYARD ---------- */
/* local columns (0..39), the floor's surface row R (the hero stands on R-1). Two GONGS by the walls (the level's gongs: src/ksar-hands.js rings and cuts them),
   two FLASK RACKS, three ROOF LEDGES (one-way: the angle from above), two GUARD DOORS in the back wall. She starts at `her` */
export const HM_STAGE = { W: 40, door: 6, gongs: [{ id: 'yardW', x: 5 }, { id: 'yardE', x: 34 }], racks: [12, 27], ledges: [{ x0: 1, x1: 8, dy: 4 }, { x0: 16, x1: 23, dy: 7 }, { x0: 31, x1: 38, dy: 4 }], doors: [2, 37], her: 30, wallRow: 12 };
export function stageHawkMistress(W, T, TS, sx, R) {
  const { set, block, ent, air } = W, ex = sx + HM_STAGE.W;
  const carve = () => {
    air(sx, ex - 1, R - 18, R - 1);
    block(sx - 1, sx - 1, R - 22, R - HM_STAGE.door - 1);   /* her west wall over the door you came in by (shut behind you) */
    block(ex, ex, R - 22, R - 1);
    block(sx - 1, ex, R - 22, R - 19);                       /* the courtyard's high back wall (its wall walk is drawn: the runners use it) */
    for (const l of HM_STAGE.ledges) for (let x = sx + l.x0; x <= sx + l.x1; x++) set(x, R - l.dy, T.ONEWAY);
    for (const g of HM_STAGE.gongs) ent('ksgong', sx + g.x, R - 1, { id: g.id, arena: true });
    for (const [i, x] of HM_STAGE.racks.entries()) ent('ksflasks', sx + x, R - 1, { id: 'rack' + i, arena: true });
    ent('hawkmistress', sx + HM_STAGE.her, R - 1, { face: -1 });
  };
  const arena = { x0: sx * TS, x1: ex * TS, floor: R * TS, trigger: (sx + 2) * TS, wallL: sx - 1, wallR: ex, boss: 'hawkmistress', music: 'hawkmistress',
    tint: '#c8843a', tintA: 0.05, start: [sx + 2, R - 1], y0: (R - 18) * TS, y1: (R + 1) * TS, hm: { sx, R } };
  return { arena, carve, gongs: HM_STAGE.gongs.map(g => ({ id: g.id, x: sx + g.x, y: R - 1, ear: 24, earY: 12, arena: true })), racks: HM_STAGE.racks.map((x, i) => ({ id: 'rack' + i, x: sx + x, y: R - 1, kind: 'flask', n: 2, arena: true })) };
}
/* the courtyard in world px, from the arena */
export function geom(A, TS = 16) {
  const q = A.hm, X = c => (q.sx + c) * TS;
  return { TS, x0: X(0), x1: X(HM_STAGE.W), floorY: q.R * TS, wallY: (q.R - 18) * TS,
    gongs: HM_STAGE.gongs.map(g => ({ id: g.id, x: X(g.x) + 8 })), racks: HM_STAGE.racks.map((x, i) => ({ id: 'rack' + i, x: X(x) + 8 })),
    ledges: HM_STAGE.ledges.map(l => ({ x0: X(l.x0), x1: X(l.x1 + 1), y: (q.R - l.dy) * TS, c0: q.sx + l.x0, c1: q.sx + l.x1, row: q.R - l.dy })),
    doors: HM_STAGE.doors.map(c => X(c) + 8), fire: [[X(0), X(HM.fireW)], [X(HM_STAGE.W - HM.fireW), X(HM_STAGE.W)]] };
}

/* ---------- ONE FIGHT ---------- */
export function newFight(G) {
  return { G, ph: 1, cycle: 0, step: 0, script: null, act: 0, ward: 0, openTaken: 0, behindT: 0, pend: 0, pendWhy: '', mark: null, runner: null, despDone: false,
    hawk: { mode: 'circle', a: 0, x: 0, y: 0, t: 0, fx: 0, fy: 0, tx: 0, ty: 0 }, roofT: HM.roofEvery, fireT: 0, told: {},
    n: { cycles: 0, opens: 0, wheels: 0, blinds: 0, wards: 0, warded: 0, guarded: 0, rings: 0, ringsHome: 0, calls: 0, callsCut: 0, guards: 0, spots: 0, dives: 0, lashes: 0, cuts: 0, flashes: 0, crumbles: 0, moves: {} } };
}
export const hPhase = e => (e.hp <= e.maxHp * HM.p3 ? 3 : e.hp <= e.maxHp * HM.p2 ? 2 : 1);
export const hmOpen = e => !!e && e.mode === 'whistle' && (e.open || 0) > 0;
const STRIKE = new Set(['lash', 'cut', 'markLash', 'flash']);
const GUARD_MODES = new Set(['walk', 'recover', 'feintHold']);
/* HER GAUNTLET: a blow from in front of her by a hero at her height (not from above, not in the air over her), while she is on guard */
export const guarded = (e, hx, hy, airborne) => !!e && !hmOpen(e) && !(e.broken > 0) && GUARD_MODES.has(e.mode) && (e.face || 1) * (hx - e.x) > -6 && !(airborne && hy < e.y - 10) && Math.abs(hy - e.y) < 26;
export const hawkAloft = S => !!S && ['circle', 'spot', 'climb'].includes(S.hawk.mode);

const nextScript = S => { const set = CYCLES[S.ph]; return set[S.cycle % set.length].slice(); };
function setMode(e, m, t) { e.mode = m; e.modeT = t; }
const clampX = (G, x) => Math.max(G.x0 + 16, Math.min(G.x1 - 16, x));
function tell(e, S, c, mode, t) { setMode(e, mode, t); S.act++; S.n.moves[mode] = (S.n.moves[mode] || 0) + 1; const mv = MOVES[mode]; if (mv && mv.mark) c.mark(mv.mark); c.sound(mv && mv.mark === '!!' ? 'tellHard' : 'tell'); }
function endOpen(e, S, c) { e.open = 0; S.ward = HM.wardT; S.n.wards++; S.openTaken = 0; S.hawk.mode = 'home'; S.hawk.t = HM.wardT; c.number(e.x, e.y - 70, 'THE HAWK IS HOME: SHE GUARDS', '#9ab0c0'); c.sound('tell'); c.fx('ward', e.x, e.y); }
function open(e, S, c) { setMode(e, 'whistle', HM.openT + 0.05); e.open = HM.openT; S.openTaken = 0; S.n.opens++; S.hawk.mode = 'return'; S.hawk.t = HM.openT; S.hawk.fx = S.hawk.x; S.hawk.fy = S.hawk.y; c.fx('open', e.x, e.y); c.sound('whistle');
  c.number(e.x, e.y - 70, S.pendWhy === 'blind' ? 'THE HAWK IS BLIND: SHE WHISTLES IT BACK - CUT HER' : 'THE HAWK WHEELS OFF: SHE WHISTLES IT BACK - CUT HER', '#8fd160'); }

/* ---------- THE RULE ON HER (the hands call these) ---------- */
/* A GONG RUNG BY A HERO (src/ksar-hands.js, the courtyard's gongs): the hawk wheels off, unless it is home. Returns 'wheel' | 'home' | 'busy' */
export function ringHeard(e, S, c) {
  if (!e || !e.alive || e.mode === 'sleep' || e.mode === 'wake') return 'busy';
  if (S.ward > 0 || S.hawk.mode === 'home' || S.hawk.mode === 'return') { S.n.ringsHome++; c.number(e.x, e.y - 64, 'THE HAWK IS ON HER GLOVE: IT KNOWS THE GONG', '#9ab0c0'); return 'home'; }
  if (S.pend > 0 || hmOpen(e)) return 'busy';
  S.n.rings++; S.n.wheels++; S.hawk.mode = 'wheel'; S.hawk.t = HM.wheelT; S.hawk.fx = S.hawk.x; S.hawk.fy = S.hawk.y; S.pend = HM.wheelT; S.pendWhy = 'wheel'; c.sound('hawk');
  if (!S.told.wheel) { S.told.wheel = 1; c.number(e.x, e.y - 64, 'THE GONG SENDS THE HAWK WHEELING', '#ffd36b'); } return 'wheel';
}
/* A FLASH at (x, y) (a thrown flask, src/ksar-hands.js): the hawk in reach is blinded, unless it is home. Returns 'blind' | 'home' | 'far' | 'busy' */
export function flashAt(e, S, c, x, y) {
  if (!e || !e.alive || e.mode === 'sleep' || e.mode === 'wake') return 'busy';
  if (Math.hypot(S.hawk.x - x, S.hawk.y - y) > HM.flashHawk) return 'far';
  if (S.ward > 0 || S.hawk.mode === 'home' || S.hawk.mode === 'return') { c.number(e.x, e.y - 64, 'THE HAWK IS ON HER GLOVE', '#9ab0c0'); return 'home'; }
  if (S.pend > 0 || hmOpen(e)) return 'busy';
  S.n.blinds++; S.hawk.mode = 'blind'; S.hawk.t = HM.blindT; S.pend = HM.blindT; S.pendWhy = 'blind'; c.sound('hawk');
  if (!S.told.blind) { S.told.blind = 1; c.number(e.x, e.y - 64, 'THE FLASH BLINDS THE HAWK', '#ffd36b'); } return 'blind';
}

/* ---------- ONE FRAME. h = the heroes [{ x, y, ground, alive, air, pp }], c = the world:
   c.hit(box, dmg, name, o) -> landed   c.number(x, y, line, col)  c.mark(m)  c.sound(k)  c.fx(kind, x, y)  c.shake(n)  c.music(ph)
   c.gongs() -> [{ id, x, cut, hum }]   c.guardRing(id) (her guard reaches a gong: rung by her bandit, if it hangs) -> bool   c.guards() -> alive count ---------- */
export function stepHawkMistress(e, S, dt, h, c) {
  const G = S.G, P = h.filter(q => q.alive).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0] || h[0];
  e.modeT -= dt; e.y = G.floorY;
  if (e.open > 0) e.open = Math.max(0, e.open - dt);
  if (S.ward > 0) S.ward = Math.max(0, S.ward - dt); e.ward = S.ward;
  stepHawk(e, S, dt, P, c); stepRunner(e, S, dt, c);
  if (S.ph === 3) stepFire(e, S, dt, h, c);
  if (e.mode === 'sleep') return;
  if (e.mode === 'wake') { if (e.modeT <= 0) { S.script = nextScript(S); S.step = 0; setMode(e, 'walk', 0.6); } return; }
  /* THE HAWK IS OFF (a gong, a flash): she breaks off a TELL at once, finishes a blade already moving, and WHISTLES - open (B12: nothing of hers runs in it) */
  if (S.pend > 0) { S.pend -= dt; if (S.pend <= 0 && !STRIKE.has(e.mode)) { open(e, S, c); return; } if (S.pend <= 0) S.pend = 0.01; }
  /* BROKEN (her poise bar, emptied by heavies): she reels where she stands (B4) */
  if (e.broken > 0 && !hmOpen(e) && (GUARD_MODES.has(e.mode) || /Tell$/.test(e.mode))) { e.modeT += dt; return; }
  /* THE PHASES: a new one waits for the blow in hand and never cuts an opening short */
  const want = hPhase(e);
  if (want > S.ph && !hmOpen(e) && S.pend <= 0 && (e.mode === 'walk' || e.mode === 'recover')) {
    S.ph = want; S.cycle = 0; S.step = 0; S.script = null; e.phase = want; c.music(want);
    if (want === 2) { c.number(e.x, e.y - 70, 'HER GUARD ANSWERS THE GONGS: CUT THE ROPES', '#ff9a5c'); c.sound('whistle'); setMode(e, 'recover', 0.6); return; }
    if (want === 3) { c.number((G.x0 + G.x1) / 2, G.floorY - 120, 'THE POWDER STORE BURNS: THE ROOFS GO', '#ff6b6b'); c.sound('blast'); c.shake(6); setMode(e, 'recover', 0.8); return; } }
  switch (e.mode) {
    case 'whistle': if (e.open <= 0) { endOpen(e, S, c); setMode(e, 'recover', 0.5); } return;   /* B4: she stands, glove up */
    case 'recover': if (e.modeT <= 0) nextMove(e, S, P, c); return;
    case 'walk': {
      const d = P.x - e.x;
      if ((e.face || 1) * d < -8) { S.behindT += dt; if (S.behindT > HM.turn) { e.face = Math.sign(d) || e.face; S.behindT = 0; } } else S.behindT = 0;
      if (Math.abs(d) > HM.keep) e.x = clampX(G, e.x + Math.sign(d) * HM.walk * dt);
      else if (Math.abs(d) < HM.keep - 26) e.x = clampX(G, e.x - Math.sign(d) * HM.walk * 0.5 * dt);   /* she keeps her whip's distance */
      if (e.modeT <= 0) nextMove(e, S, P, c); return; }
  }
  stepMove(e, S, dt, P, h, c);
}
function nextMove(e, S, P, c) {
  if (!S.script || S.step >= S.script.length) { S.cycle++; S.n.cycles++; S.script = nextScript(S); S.step = 0; }
  let m = S.script[S.step++]; const dx = P.x - e.x, ad = Math.abs(dx);
  e.face = Math.sign(dx) || e.face;
  if (!S.despDone && e.hp <= e.maxHp * HM.desp) { S.despDone = true; m = 'flash'; }
  if (m === 'lash' && ad > HM.lashRange) { setMode(e, 'walk', 0.45); S.step--; return; }      /* out of the whip's reach: she closes first */
  if (m === 'feint' && ad > HM.lashRange + 30) { setMode(e, 'walk', 0.45); S.step--; return; }
  if ((m === 'spot' || m === 'dive') && !hawkAloft(S)) m = 'lash';
  if (m === 'call') { const gs = c.gongs().filter(g => !g.cut); if (!gs.length || c.guards() >= HM.guardCap) m = hawkAloft(S) ? 'spot' : 'lash'; }
  if (m === 'lash' && ad > HM.lashRange) { setMode(e, 'walk', 0.45); return; }
  switch (m) {
    case 'lash': tell(e, S, c, 'lashTell', HM.lashTell); return;
    case 'feint': tell(e, S, c, 'feintTell', HM.feintTell); return;
    case 'spot': { tell(e, S, c, 'spotTell', HM.spotTell); S.mark = { x: clampX(G0(S), P.x) }; S.hawk.mode = 'spot'; S.hawk.t = HM.spotTell; S.hawk.fx = S.hawk.x; S.hawk.fy = S.hawk.y; S.n.spots++; c.sound('hawk'); return; }
    case 'call': { tell(e, S, c, 'callTell', HM.callTell); const gs = c.gongs().filter(g => !g.cut).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x)); S.callGong = gs[0].id; S.n.calls++; return; }
    case 'dive': { tell(e, S, c, 'diveTell', HM.diveTell); S.mark = { x: clampX(G0(S), P.x) }; S.hawk.mode = 'diveTell'; S.hawk.t = HM.diveTell; S.hawk.fx = S.hawk.x; S.hawk.fy = S.hawk.y; c.fx('mark', S.mark.x, S.G.floorY); c.sound('hawk'); return; }
    case 'flash': tell(e, S, c, 'flashTell', HM.flashTell); c.number(e.x, e.y - 70, 'FLASH POWDER: GET CLEAR OF HER', '#ff6b6b'); return;
  }
  setMode(e, 'walk', 0.5);
}
const G0 = S => S.G;
/* THE TOLD BLOWS */
function stepMove(e, S, dt, P, h, c) {
  const G = S.G, f = e.face || 1, after = (t) => setMode(e, 'recover', t ?? HM.gap[S.ph - 1]);
  switch (e.mode) {
    case 'lashTell': if (e.modeT <= 0) { setMode(e, 'lash', HM.lashT); S.n.lashes++; c.sound('lash');
        c.hit([f > 0 ? e.x : e.x - HM.lashReach, f > 0 ? e.x + HM.lashReach : e.x, e.y - HM.lashH, e.y + 2], HM.dmg.lash, MOVE_NAME.lash, { blockable: true, key: 'lash' + S.act }); } return;
    case 'lash': if (e.modeT <= 0) after(); return;
    case 'feintTell': if (e.modeT <= 0) { setMode(e, 'feintHold', HM.feintHold); c.fx('feint', e.x + f * 8, e.y); } return;   /* a stamp: it was nothing - and now it is something */
    case 'feintHold': if (e.modeT <= 0) { e.face = Math.sign(P.x - e.x) || f; tell(e, S, c, 'cutTell', HM.cutTell); } return;
    case 'cutTell': if (e.modeT <= 0) { setMode(e, 'cut', HM.cutT); S.n.cuts++; c.sound('slash'); } return;
    case 'cut': { e.x = clampX(G, e.x + f * HM.cutStep * dt); c.hit([f > 0 ? e.x - 6 : e.x - HM.cutReach, f > 0 ? e.x + HM.cutReach : e.x + 6, e.y - 28, e.y], HM.dmg.cut, MOVE_NAME.cut, { blockable: true, key: 'cut' + S.act });
      if (e.modeT <= 0) after(); return; }
    case 'spotTell': if (e.modeT <= 0) { S.hawk.mode = 'climb'; S.hawk.t = 0.8; S.hawk.fx = S.hawk.x; S.hawk.fy = S.hawk.y; tell(e, S, c, 'markLashTell', HM.markLashTell); } return;
    case 'markLashTell': if (e.modeT <= 0) { setMode(e, 'markLash', 0.18); c.sound('lash'); const mx = S.mark ? S.mark.x : P.x;
        c.hit([mx - HM.markR, mx + HM.markR, e.y - 44, e.y + 2], HM.dmg.markLash, MOVE_NAME.markLash, { key: 'mlash' + S.act }); c.fx('crack', mx, e.y); } return;
    case 'markLash': if (e.modeT <= 0) { S.mark = null; after(); } return;
    case 'callTell': if (e.modeT <= 0) { S.runner = { gong: S.callGong, t: HM.runT, t0: HM.runT, from: (S.callGong && c.gongs().find(g => g.id === S.callGong) || { x: e.x }).x < (G.x0 + G.x1) / 2 ? G.x1 - 30 : G.x0 + 30 };
        if (!S.told.call) { S.told.call = 1; c.number((G.x0 + G.x1) / 2, G.wallY + 30, 'A GUARD RUNS FOR A GONG: CUT ITS ROPE', '#ffd36b'); } after(0.4); } return;
    case 'diveTell': if (e.modeT <= 0) { S.hawk.mode = 'dive'; S.hawk.t = HM.diveFly; S.hawk.fx = S.hawk.x; S.hawk.fy = S.hawk.y; S.n.dives++; setMode(e, 'recover', HM.diveFly + HM.diveLow + 0.3); } return;
    case 'flashTell': if (e.modeT <= 0) { setMode(e, 'flash', 0.2); S.n.flashes++; c.sound('blast'); c.fx('flash', e.x, e.y - 14);
        for (const q of h) if (q.alive && Math.hypot(q.x - e.x, (q.y - 10) - (e.y - 14)) < HM.flashR) c.hit([q.x - 4, q.x + 4, q.y - 20, q.y], HM.dmg.flash, MOVE_NAME.flash, { key: 'flash' + S.act, blind: true }); } return;
    case 'flash': if (e.modeT <= 0) after(0.6); return;
    default: setMode(e, 'walk', 0.5);
  }
}
/* THE HAWK: circles over her; wheels off (a gong); blinded (a flash); comes back to her whistle; home on her glove through the ward; drops to spot you; dives */
function stepHawk(e, S, dt, P, c) {
  const k = S.hawk, G = S.G, up = G.floorY - HM.hawkAlt;
  k.t -= dt;
  const lerpTo = (tx, ty, r) => { k.x += (tx - k.x) * Math.min(1, dt * r); k.y += (ty - k.y) * Math.min(1, dt * r); };
  switch (k.mode) {
    case 'circle': k.a += dt * 2.2; lerpTo(e.x + Math.cos(k.a) * HM.hawkR, up + Math.sin(k.a * 2) * 7, 4); break;
    case 'home': k.x = e.x + (e.face || 1) * 9; k.y = e.y - 22; if (k.t <= 0 && S.ward <= 0) { k.mode = 'climb'; k.t = 0.7; k.fx = k.x; k.fy = k.y; } break;
    case 'climb': { const q = Math.max(0, Math.min(1, 1 - k.t / 0.7)); k.x = k.fx + (e.x - k.fx) * q; k.y = k.fy + (up - k.fy) * q; if (k.t <= 0) k.mode = 'circle'; break; }
    case 'wheel': { k.a += dt * 6; const r = 110 + 40 * Math.sin(k.a); lerpTo(clampX(G, e.x + Math.cos(k.a) * r), up - 50 + Math.sin(k.a) * 20, 3); break; }   /* off in a wide loop, high */
    case 'blind': k.x += Math.sin(k.t * 31) * 40 * dt; k.y += Math.cos(k.t * 23) * 30 * dt; break;   /* flapping blind where it was */
    case 'return': { const q = Math.max(0, Math.min(1, 1 - k.t / HM.openT)); const tx = e.x + (e.face || 1) * 9, ty = e.y - 22;
      if (q < 0.5) { k.a += dt * 4; lerpTo(clampX(G, e.x + Math.cos(k.a) * 90), up - 30, 2); } else { k.x = k.x + (tx - k.x) * Math.min(1, dt * 3 * q); k.y = k.y + (ty - k.y) * Math.min(1, dt * 3 * q); } break; }
    case 'spot': if (S.mark) lerpTo(S.mark.x, G.floorY - 46, 6); break;   /* it drops over your spot and shrieks */
    case 'diveTell': if (S.mark) lerpTo(S.mark.x, up - 30, 5); break;        /* high over the mark */
    case 'dive': { const q = Math.max(0, Math.min(1, 1 - k.t / HM.diveFly)); const mx = S.mark ? S.mark.x : k.fx; k.x = k.fx + (mx - k.fx) * q; k.y = k.fy + (G.floorY - 6 - k.fy) * q;
      if (k.t <= 0) { c.hit([mx - HM.diveR, mx + HM.diveR, G.floorY - 40, G.floorY + 4], HM.dmg.dive, MOVE_NAME.dive, { key: 'dive' + S.act }); c.fx('land', mx, G.floorY); c.shake(2); k.mode = 'low'; k.t = HM.diveLow; S.mark = null; } break; }
    case 'low': if (k.t <= 0) { k.mode = 'climb'; k.t = 0.7; k.fx = k.x; k.fy = k.y; } break;
  }
}
/* HER GUARD's RUNNER (phase two's CALL): along the wall walk to the gong; there he rings it if its rope still hangs (a door opens: her guard comes down) */
function stepRunner(e, S, dt, c) {
  const r = S.runner; if (!r) return; r.t -= dt; if (r.t > 0) return; S.runner = null;
  const g = c.gongs().find(q => q.id === r.gong);
  if (!g || g.cut) { S.n.callsCut++; c.number(g ? g.x : e.x, S.G.wallY + 30, 'THE ROPE IS CUT: NO ONE COMES', '#8fd160'); return; }
  if (c.guardRing(r.gong)) S.n.guards++;
}
/* PHASE THREE: the store's fire burns the yard's two ends (a tick on a hero in it) and the roof ledges crumble end by end */
function stepFire(e, S, dt, h, c) {
  const G = S.G; S.fireT -= dt;
  if (S.fireT <= 0) { S.fireT = HM.fireTick; for (const [a, b] of G.fire) c.hit([a, b, G.floorY - 20, G.floorY + 2], HM.dmg.fire, MOVE_NAME.fire, { key: 'fire' + Math.round(c.time() * 2) + a, noKnock: true }); }
  S.roofT -= dt; if (S.roofT <= 0) { S.roofT = HM.roofEvery; if (c.crumble()) S.n.crumbles++; }
}

/* ---------- THE BOT'S READING (src/lab.js) ----------
   A HUMAN BOT: it sees a tell PLAN.react s late (the v2 profile's eyes already do that: s.v2) and misreads some; it jumps or blocks her lash, blocks or backs
   off her cut, steps off the hawk's mark and the dive's shadow, gets clear of the flash; between her blows it works THE RULE: in phase one it walks to a
   hanging gong and RINGS it (E) while the hawk is up and she is near; in phase two a runner going for a gong sends it to CUT that rope (and it cuts the
   others when it can - then it fights with FLASKS); with no gong left (or the nearest humming) it takes a FLASK from a rack (E) and THROWS it at the hawk
   (ATTACK). Open, it cuts her hard; warded, it waits off her; otherwise it cuts her BACK, or from a JUMP, never into her gauntlet.
   s = { P: { x, y, face, ground, atk, carry }, e, S, gongs: [{ id, x, cut, hum }], racks: [{ id, x, n }], reach, shield, t, rng, mem, v2, hero } ->
       { gx, face, atk, jump, dodge, block, talk, up, down, why } */
export const PLAN = { react: 0.25, miss: 0.12, missRing: 0.15, ringR: 150 };
export function hmPlan(s) {
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
  /* 0. OUT OF THE FIRE (phase three) */
  if (inFire(P.x) && P.ground) { out.gx = safeX(P.x); out.why = 'out of the fire'; return out; }
  /* 1. HER BLOWS AND THE HAWK'S (a quarter-second late, some misread) */
  const key = 'k' + S.act + e.mode;
  if (/Tell$/.test(e.mode) || e.mode === 'lash' || e.mode === 'cut' || S.hawk.mode === 'dive') {
    const miss = s.v2 ? false : roll(key + 'm', PLAN.miss), seen = seenFor('a' + S.act + e.mode);
    if (seen && !miss) {
      if (e.mode === 'flashTell') { if (Math.abs(P.x - kx) < HM.flashR + 24) { out.gx = safeX(kx + side * (HM.flashR + 40)); if (dx < HM.flashR && e.modeT < 0.3 && P.ground && !s.noRoll) { out.dodge = true; } out.why = 'clear of the flash'; return out; } }
      if ((e.mode === 'markLashTell' || e.mode === 'spotTell') && S.mark && Math.abs(P.x - S.mark.x) < HM.markR + 14) { const d = roomDir(S.mark.x); out.gx = safeX(S.mark.x + d * (HM.markR + 26)); if (e.mode === 'markLashTell' && e.modeT < 0.25 && P.ground && !s.noRoll) out.dodge = true; out.why = 'off the hawk\'s mark'; return out; }
      if ((e.mode === 'diveTell' || S.hawk.mode === 'dive') && S.mark && Math.abs(P.x - S.mark.x) < HM.diveR + 14) { const d = roomDir(S.mark.x); out.gx = safeX(S.mark.x + d * (HM.diveR + 30)); if (S.hawk.mode === 'dive' && P.ground && !s.noRoll) out.dodge = true; out.why = 'off the dive\'s shadow'; return out; }
      if ((e.mode === 'lashTell' || e.mode === 'lash') && dx < HM.lashReach + 14 && same && (e.face || 1) * (P.x - kx) > -6) {
        if (s.shield) { out.block = true; out.face = Math.sign(kx - P.x) || 1; out.why = 'block the lash'; return out; }
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
  if (P.carry) { const hx = S.hawk.x, hdx = hx - P.x;
    if (!hawkAloft(S)) { out.gx = safeX(P.x + (P.x < kx ? -30 : 30)); out.why = 'flask: wait for the hawk to go up'; return out; }
    /* the mid throw flies ~120 px out: stand that far off the hawk's line and face it */
    const want = clamp(hx - Math.sign(hdx || 1) * 110); if (Math.abs(P.x - want) > 14 && !(Math.abs(hdx) > 70 && Math.abs(hdx) < 150)) { out.gx = safeX(want); out.why = 'flask: to a throw at the hawk'; return out; }
    out.face = Math.sign(hdx) || 1; out.gx = P.x; out.atk = P.atk < 0 && P.ground; out.why = 'flask: throw it at the hawk'; return out; }
  /* 4. PHASE TWO: a runner going for a hanging gong - cut that rope first */
  if (S.runner) { const g = gongs.find(q => q.id === S.runner.gong); if (g && !g.cut) { out.gx = clamp(g.x + (P.x < g.x ? -10 : 10)); if (Math.abs(P.x - g.x) < reach + 6) { out.face = Math.sign(g.x - P.x) || 1; out.gx = P.x; out.atk = P.atk < 0; } out.why = 'cut the rope before he gets there'; return out; } }
  /* 5. MAKE AN OPENING (the rule): a hanging, quiet gong (phase one: ring it; phase two: cut it unless the flasks are gone) - or a flask */
  const free = gongs.filter(g => !g.cut && !(g.hum > 0));
  if (S.ph >= 2 && !mem.p2cut) { const g = gongs.filter(q => !q.cut).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
    if (g && racks.some(r => r.n > 0)) { out.gx = clamp(g.x + (P.x < g.x ? -10 : 10)); if (Math.abs(P.x - g.x) < reach + 6) { out.face = Math.sign(g.x - P.x) || 1; out.gx = P.x; out.atk = P.atk < 0; } out.why = 'phase two: cut her gongs'; return out; }
    if (!g) mem.p2cut = true; }
  if (hawkAloft(S) && !/Tell$/.test(e.mode)) {
    if (S.ph === 1 || (S.ph === 3 && free.length)) { const g = free.sort((a, b) => Math.abs(a.x - kx) - Math.abs(b.x - kx))[0];
      if (g && Math.abs(g.x - kx) < 260) { out.gx = clamp(g.x + (kx > g.x ? 10 : -10)); if (Math.abs(P.x - g.x) < 18 && dx < PLAN.ringR + 60 && !roll('ring' + Math.floor(t / 3), PLAN.missRing)) { out.talk = true; out.face = Math.sign(g.x - P.x) || 1; out.why = 'ring the gong: the hawk is up'; } else out.why = 'to a gong'; return out; } }
    const r = racks.filter(q => q.n > 0).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
    if (r && (S.ph >= 2 || !free.length)) { out.gx = r.x; if (Math.abs(P.x - r.x) < 10 && P.ground) { out.talk = true; out.why = 'take a flask'; } else out.why = 'to a flask rack'; return out; } }
  /* 5b. WINDED (the lab's stamina rest): off her, out of her whip's reach, until the bar is back */
  if (s.rest) { out.gx = safeX(kx + side * (HM.lashReach + 40)); out.face = Math.sign(kx - P.x) || 1; out.why = 'winded: off her'; return out; }
  /* 6. FIGHT HER: her back when she turns from you; from a jump over her gauntlet (B11) */
  if (dx < hitR && same && (e.face || 1) * (P.x - kx) < -6) { swing(kx); out.gx = P.x; out.why = 'cut her back'; return out; }
  if (/Tell$/.test(e.mode) && e.mode !== 'lashTell' && e.mode !== 'cutTell' && dx < hitR + 2 && same) { swing(kx); out.gx = P.x; out.why = 'cut her in her tell'; return out; }
  if ((e.mode === 'walk' || e.mode === 'recover') && dx < hitR + 30) { out.face = Math.sign(kx - P.x) || 1; if (dx > hitR - 4) { out.gx = clamp(kx + side * (hitR - 8)); out.why = 'in to her'; return out; }
    out.gx = P.x; if (P.ground) { out.jump = true; out.why = 'up over her gauntlet'; return out; } if (P.y < e.y - 12) out.atk = P.atk < 0; out.why = 'cut from the jump'; return out; }
  out.gx = safeX(kx + side * Math.max(40, hitR + 16)); out.face = Math.sign(kx - P.x) || 1; out.why = 'keep off her whip'; return out;
}
