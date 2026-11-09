// src/lab-gqueen.js - THE GOBLIN QUEEN 3 IN THE BOSS LAB (claude/gq2). Her fight is three stages in one row: P1 in her hall (bar 1), the flee + the
// burning-hall ESCAPE (she is hidden, alive; the hero was fully healed), then P2 on the TOWER TOP (bar 2). bossLab's loop runs while boss.alive, so one
// row plays all three; this file keeps the row's clock per stage and the stuns (her main opening), and decides the escape:
//   (gq3 11-09: the escape is THE BURNING TOWER - her portal in the hall, five storeys of ladders, the hatch; the row ends when she ESCAPES at the roof bar's end: stage 'won' is her flight, not a corpse)
//   opts.gqEscape (or the profile's gqEscape) = 'play' (default: src/lab.js gqEscapeBot walks into her portal and climbs the tower's ladders)
//                                             | 'skip' (King Gorm's gormSkipRun precedent: the climb is measured by the level walker, the lab goes straight to the tower top)
// A played escape that has not reached the tower top in GQ_ESC_STALL s is skipped too (a bot stuck on a rafter must not turn the row into a timeout) and the row says so (skip: 'stall').
// Row field (bossLab rows[i].gq, tools/boss-run.mjs prints it): { stage, stuns, p1Secs, escSecs (= towerSecs, gq3), fled, p2Secs, skip, escHp0, escHpEnd (% of max hp), barLeft (% of the CURRENT bar) }.
export const GQ_ESC_STALL = 90;   /* (gq3) the burning tower is a climb: 90 s before the lab skips it */
export function gqLabState() {
  return { stage: 'hall', hallF: null, escF: null, roofF: null, stuns: 0, lastMode: '', skip: null, escHp0: null, escHpEnd: null, tl: { hp: null, cls: null, d: {}, t: {}, n: {} } };
}
/* one frame of the row (call it every frame, before the hands). true = it skipped to the tower top this frame. spf = seconds a frame */
export function gqLabStep(BK, boss, f, st, mode, spf) {
  const P = BK.P, stage = BK.gqStage ? BK.gqStage() : 'hall';
  if (boss.mode !== st.lastMode) { if (boss.mode === 'stunned') st.stuns++; if (boss.mode === 'stunned' || boss.mode === 'pinned') { const k = gqCls(boss, stage); st.tl.n[k] = (st.tl.n[k] || 0) + 1; } st.lastMode = boss.mode; }
  gqTally(st.tl, boss, stage, spf);
  if (stage !== st.stage) {
    if (st.hallF === null && stage !== 'hall') st.hallF = f;
    if (st.escF === null && stage === 'escape') { st.escF = f; st.escHp0 = pct(P.hp, P.maxHp); }
    if (st.roofF === null && stage === 'roof') { st.roofF = f; st.escHpEnd = pct(P.hp, P.maxHp); }
    st.stage = stage;
  }
  if (stage === 'escape' && st.escF !== null && !P.dead) {
    const why = mode === 'skip' ? 'skip' : (f - st.escF) * spf > GQ_ESC_STALL ? 'stall' : null;
    const H = why && BK.gqHands ? BK.gqHands() : null;
    if (H && H.skipRoof && H.skipRoof()) { st.skip = why; st.roofF = f; st.escHpEnd = pct(P.hp, P.maxHp); st.stage = 'roof'; return true; }
  }
  return false;
}
/* (claude/hcqueen) HER BAR, MOVE BY MOVE: where each point of her hp went, by stage and by what she was doing when it went (the hp delta frame to frame, so every source counts:
   blades, skills, the pin's and the stun's own chunk). Classes: hall.pinL (pinned under the lured grate), hall.pin (any other pin), hall.stun (a parried crown / shard),
   hall.out (outside an opening: the 0.4 plate), roof.stun, roof.open (the tower top takes every blow whole). d = hp lost, t = seconds spent, n = openings entered. */
function gqCls(boss, stage) { const where = stage === 'roof' ? 'roof' : 'hall';
  if (boss.mode === 'pinned') return where + (boss.pinBy === 'lure' ? '.pinL' : '.pin'); if (boss.mode === 'stunned') return where + '.stun'; return where + (where === 'roof' ? '.open' : '.out'); }
function gqTally(tl, boss, stage, spf) {
  const cls = stage === 'hall' || stage === 'roof' ? gqCls(boss, stage) : null;
  if (tl.hp !== null && tl.cls) {
    if (cls && cls.slice(0, 4) === tl.cls.slice(0, 4)) { const dh = tl.hp - Math.max(0, boss.hp);
      if (dh > 0) { const k = cls !== tl.cls && !/out|open/.test(cls) ? cls : tl.cls; tl.d[k] = (tl.d[k] || 0) + dh; } }   /* the frame she enters an opening, its own chunk is the opening's */
    else if (tl.cls.startsWith('hall') && stage !== 'hall') tl.d[tl.cls] = (tl.d[tl.cls] || 0) + Math.max(0, tl.hp);   /* the blow that emptied her hall bar (the spare refills her to the tower top's) */
  }
  if (cls) tl.t[cls] = (tl.t[cls] || 0) + spf;
  tl.hp = boss.hp; tl.cls = cls;
}
const pct = (a, b) => Math.round(100 * Math.max(0, a) / Math.max(1, b));
const span = (a, b, spf) => (a === null ? null : +((b - a) * spf).toFixed(1));
/* the row's gq field at the end of the row (f = the last frame) */
export function gqLabRow(st, boss, f, spf) {
  return {
    stage: !boss.alive ? 'won' : st.stage, stuns: st.stuns, skip: st.skip,
    p1Secs: +((st.hallF ?? f) * spf).toFixed(1),
    escSecs: st.escF === null ? null : span(st.escF, st.roofF ?? f, spf),
    towerSecs: st.escF === null ? null : span(st.escF, st.roofF ?? f, spf),   /* (gq3) the escape IS the burning tower: the same span under its own name */
    fled: !!boss.gqFled,   /* (gq3) the row ended by her ESCAPE (the roof bar emptied), not a corpse */
    p2Secs: st.roofF === null ? null : span(st.roofF, f, spf),
    escHp0: st.escHp0, escHpEnd: st.escHpEnd,
    barLeft: boss.alive ? pct(boss.hp, boss.maxHp) : 0,
    tally: Object.fromEntries(Object.keys({ ...st.tl.d, ...st.tl.t }).sort().map(k => [k, [Math.round(st.tl.d[k] || 0), +(st.tl.t[k] || 0).toFixed(1), st.tl.n[k] || 0]])),   /* (claude/hcqueen) [hp lost, s spent, openings entered] by class */
  };
}
