// src/lab-gqueen.js - THE GOBLIN QUEEN 3 IN THE BOSS LAB (claude/gq2). Her fight is three stages in one row: P1 in her hall (bar 1), the flee + the
// burning-hall ESCAPE (she is hidden, alive; the hero was fully healed), then P2 on the TOWER TOP (bar 2). bossLab's loop runs while boss.alive, so one
// row plays all three; this file keeps the row's clock per stage and the stuns (her main opening), and decides the escape:
//   opts.gqEscape (or the profile's gqEscape) = 'play' (default: src/lab.js gqEscapeBot climbs L.gqEscape.route and walks into her portal)
//                                             | 'skip' (King Gorm's gormSkipRun precedent: the climb is measured by the level walker, the lab goes straight to the tower top)
// A played escape that has not reached the tower top in GQ_ESC_STALL s is skipped too (a bot stuck on a rafter must not turn the row into a timeout) and the row says so (skip: 'stall').
// Row field (bossLab rows[i].gq, tools/boss-run.mjs prints it): { stage, stuns, p1Secs, escSecs, p2Secs, skip, escHp0, escHpEnd (% of max hp), barLeft (% of the CURRENT bar) }.
export const GQ_ESC_STALL = 75;
export function gqLabState() {
  return { stage: 'hall', hallF: null, escF: null, roofF: null, stuns: 0, lastMode: '', skip: null, escHp0: null, escHpEnd: null };
}
/* one frame of the row (call it every frame, before the hands). true = it skipped to the tower top this frame. spf = seconds a frame */
export function gqLabStep(BK, boss, f, st, mode, spf) {
  const P = BK.P, stage = BK.gqStage ? BK.gqStage() : 'hall';
  if (boss.mode !== st.lastMode) { if (boss.mode === 'stunned') st.stuns++; st.lastMode = boss.mode; }
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
const pct = (a, b) => Math.round(100 * Math.max(0, a) / Math.max(1, b));
const span = (a, b, spf) => (a === null ? null : +((b - a) * spf).toFixed(1));
/* the row's gq field at the end of the row (f = the last frame) */
export function gqLabRow(st, boss, f, spf) {
  return {
    stage: !boss.alive ? 'won' : st.stage, stuns: st.stuns, skip: st.skip,
    p1Secs: +((st.hallF ?? f) * spf).toFixed(1),
    escSecs: st.escF === null ? null : span(st.escF, st.roofF ?? f, spf),
    p2Secs: st.roofF === null ? null : span(st.roofF, f, spf),
    escHp0: st.escHp0, escHpEnd: st.escHpEnd,
    barLeft: boss.alive ? pct(boss.hp, boss.maxHp) : 0,
  };
}
