// unburied-foes.js — THE UNBURIED FIELD's creatures and its battle (Lane C2, 2026-09-25). Brief: .claude/briefs/unburied-field.md.
// The level is src/unburied-field.js; this file is everything that MOVES on it. main.js keeps only the glue (one block,
// "THE UNBURIED FIELD", beside villageReset) and the table rows every creature needs. Nothing here imports main.js, so
// tools/unburied-fights.mjs can drive every fight in Node.
//
// THE LEVEL'S SENTENCE: WHILE A BEARER'S STANDARD FLIES, THE FALLEN NEAR IT GET UP. CUT THE BEARER AND THEY STAY DOWN.
//   THE FALLEN (corpse)        lies on the field. Under a planted standard it RISES (a quiet tell: dust and a violet glint)
//                              and fights - one told cut, ! a shield turns it. Cut down under a standard it only FALLS,
//                              and gets up again; struck while it lies there, or burned, it is finished for good.
//   THE BANNER-BEARER          walks the standard up to you and PLANTS it (quiet: the plant is not a blow), then guards it
//                              with the pole, ! a shield turns it. Kill him and every man his standard raised lies down,
//                              and his stretch of ridge stops loosing volleys (the field goes quiet behind you).
//   THE STANDARD-BEARER (mini) the army's great banner. SWEEP ! (guard or step back), CHARGE !! (the banner lowered like a
//                              lance, at the ankles: jump it), PLANT (quiet): the banner in the ground, and a wave gets up.
//                              THE OPENING IS YOURS: while it stands in the ground, cut the BANNER, not him - three blows
//                              and it tears, his wave lies down and he is on one knee, open. Left alone the plant ends
//                              and he pulls it up: nothing opens.
//   THE FIRST DEATH KNIGHT     the armour and the scythe the class inherits, and his kit turned on you:
//                              THE SWATHE  !!  a wide arc whose INSIDE barely cuts: close in (or jump it)
//                              THE REAPING !!  a full circle that DRAGS you in, cut at the ankles: jump it, or stand
//                                              on a tomb ledge where the drag cannot reach you
//                              THE PASSING !!  he steps through you and leaves a mark where you stood; it goes off: leave it
//                              THE CUT     !   a short blade when you crowd him: guard it
//                              RAISE           (quiet) the dead get up off his chapel floor
//                              THE OPENING IS CAUSED: a Reaping that drags one of his own RISEN dead into the circle cuts
//                              it, and he is left OPEN (a stagger, and blows land half as hard again). Unprovoked, the
//                              Reaping opens nothing - tools/unburied-fights.mjs and tools/boss-openings.mjs prove both.
//                              PHASE TWO (under half; A10, PROPOSED - the brief does not specify one): HE IS THE BANNER.
//                              RAISE calls up three, and anything of his that falls in the chapel gets up again unless you
//                              finish it on the floor or let his own Reaping cut it - the duel becomes a crowd you manage
//                              with the one trick his first phase taught you.
// Touching none of them hurts (the touch rule): every blow is a told one.
import { canvas, rect, line, circle, fillPoly, outline, flipX, whiten } from './px.js';

export const UNB = {
  hp: { bannerbearer: 56, corpse: 30, standardbearer: 680, deathknight: 1150 },
  dmg: { pole: 12, corpseCut: 10, sbSweep: 18, sbCharge: 16, sbBash: 12, swathe: 20, swatheIn: 4, reap: 16, mark: 16, dkCut: 14, volley: 8, cavalry: 18 },
  bannerR: 120,        /* a planted standard raises the fallen within this many pixels of its foot */
  riseT: 1.1, downT: 3.2, plantRange: 150, tether: 44,
  corpseSpeed: 21, bearerSpeed: 26,
  sb: { walk: 30, keep: 40, cd: 1.1, cdP2: 0.8, tell: { sweep: 0.85, charge: 1.0, plant: 0.9, bash: 0.6 }, sweepR: 64, chargeV: 250, plantT: 4.2, plantTP2: 3.6, flagHits: 3, tornT: 3.6, tornMul: 2, raise: 2, raiseP2: 3, adds: 4,
    order: ['sweep', 'plant', 'charge', 'sweep', 'charge', 'plant'] },
  dk: { walk: 34, keep: 48, cd: 1.15, cdP2: 0.85, tell: { swathe: 0.9, reap: 1.1, pass: 0.8, raise: 1.2, cut: 0.6 },
    swatheIn: 28, swatheOut: 104, reapR: 112, pullR: 150, pullV: 95, passStep: 60, markT: 1.3, markR: 34, cutR: 40, openT: 3.4, openMul: 1.5,
    raise: 2, raiseP2: 3, adds: 2, addsP2: 4,
    order: ['swathe', 'raise', 'reap', 'pass', 'cut', 'swathe', 'raise', 'reap', 'pass'],
    orderP2: ['raise', 'reap', 'swathe', 'pass', 'raise', 'reap', 'cut', 'pass'] },
};
export const UNB_FOES = new Set(['bannerbearer', 'corpse', 'standardbearer', 'deathknight']);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const tells = e => typeof e.mode === 'string' && e.mode.endsWith('Tell');

/* ---------------- THE BANNER RULE ---------------- */
/* Who is holding a standard up over this spot: a bearer whose standard is PLANTED, the Standard-Bearer while his great banner
   is in the ground, or - in his second phase, inside his own chapel - the First Death Knight himself. */
export function coverOf(q, bearers, o = {}) {
  for (const b of bearers) {
    if (!b || !b.alive) continue;
    if (b.t === 'bannerbearer' && b.planted && Math.abs(q.x - b.flagX) < UNB.bannerR && Math.abs(q.y - b.flagY) < 64) return b;
    if (b.t === 'standardbearer' && b.flagUp && Math.abs(q.x - b.flagX) < UNB.bannerR * 1.6 && Math.abs(q.y - b.y) < 64) return b;
    if (b.t === 'deathknight' && b.phase === 2 && o.bossLive && o.arena && q.x > o.arena.x0 && q.x < o.arena.x1 && Math.abs(q.y - o.arena.floor) < 60) return b;
  }
  return null;
}
/* THE FALLEN, TAKING A BLOW. Returns the damage to apply, or false when the blow is absorbed here. 'finish' is the answer to
   the whole level: a corpse that is LYING DOWN is finished by any blow at all (the scythe's rule, and anybody's boot). */
export function corpseHurt(e, dmg, cover, burning) {
  if (e.mode === 'down' || e.mode === 'riseTell') return Math.max(dmg, e.hp + 1);
  if (dmg >= e.hp && cover && !burning) { layDown(e, cover); return false; }
  return dmg;
}
export function layDown(e, cover) { e.mode = 'down'; e.modeT = UNB.downT; e.hp = e.hp0 || UNB.hp.corpse; e.h = 7; e.vx = 0; e.raisedBy = cover || null; e.fell = (e.fell || 0) + 1; }
/* A BEARER IS CUT DOWN: every man his standard holds up lies down, and they do not get up for him again */
export function bannerFalls(b, foes) {
  let n = 0;
  for (const q of foes) if (q.alive && q.t === 'corpse' && q.raisedBy === b && q.mode !== 'down') { layDown(q, null); q.modeT = 1e9; q.laid = true; n++; }
  if (b.t === 'bannerbearer') b.planted = false;
  return n;
}

/* ---------------- THE FALLEN ---------------- */
export function updateCorpse(e, dt, c) {
  const { P } = c; e.modeT -= dt; e.vx = 0; e.hp0 ??= e.hp;
  e.vy = Math.min(320, (e.vy || 0) + 1000 * dt); { const r = c.move(e, 0, e.vy * dt); if (r && r.ground) e.vy = 0; }
  if (e.mode === 'down') { e.h = 7;
    if (e.burn > 0) { c.finish(e, 'IT BURNS AND STAYS DOWN'); return; }   /* burned corpses do not rise again */
    const b = c.cover(e); if (b && e.modeT <= 0) { e.mode = 'riseTell'; e.modeT = UNB.riseT; e.raisedBy = b; e.laid = false; c.say('THE FALLEN RISE', '#c8b6ff'); c.sound('rise'); }
    return; }
  if (e.mode === 'riseTell') { e.h = 7 + Math.round(17 * clamp(1 - e.modeT / UNB.riseT, 0, 1)); if (e.modeT <= 0) { e.mode = 'walk'; e.h = 24; } return; }
  e.h = 24;
  if (e.mode === 'cutTell') { if (e.modeT > 0) return;
    const dx = (P.x - e.x) * e.face; if (!P.dead && dx > -6 && dx < 30 && Math.abs(P.y - e.y) < 24) c.hit(e.x, UNB.dmg.corpseCut, false, 'A DEAD MAN\'S BLADE');
    e.mode = 'cut'; e.modeT = 0.25; c.sound('slash'); return; }
  if (e.mode === 'cut') { if (e.modeT <= 0) { e.mode = 'rest'; e.modeT = 0.8; } return; }
  if (e.mode === 'rest') { if (e.modeT <= 0) e.mode = 'walk'; return; }
  const dx = P.x - e.x; e.face = Math.sign(dx) || e.face || 1;
  if (!P.dead && Math.abs(dx) < 26 && Math.abs(P.y - e.y) < 24) { e.mode = 'cutTell'; e.modeT = 0.75; return; }
  if (Math.abs(dx) > 18 && Math.abs(dx) < 260 && c.solid(e.x + e.face * 10, e.y + 4) && !c.solid(e.x + e.face * 10, e.y - 8)) { e.vx = e.face * UNB.corpseSpeed; c.move(e, e.vx * dt, 0); }
}

/* ---------------- THE BANNER-BEARER ---------------- */
export function updateBannerbearer(e, dt, c) {
  const { P } = c; e.modeT -= dt; e.cd = (e.cd ?? 1) - dt; e.vx = 0;
  e.vy = Math.min(320, (e.vy || 0) + 1000 * dt); { const r = c.move(e, 0, e.vy * dt); if (r && r.ground) e.vy = 0; }
  const dx = P.x - e.x;
  if (e.mode === 'plantTell') { if (e.modeT > 0) return; e.planted = true; e.flagX = e.x + e.face * 10; e.flagY = e.y; e.mode = 'guard'; e.cd = 0.8; c.say('THE BANNER STANDS', '#c8b6ff'); c.sound('plant'); return; }
  if (e.mode === 'poleTell') { if (e.modeT > 0) return;
    const f = (P.x - e.x) * e.face; if (!P.dead && f > -6 && f < 38 && Math.abs(P.y - e.y) < 26) c.hit(e.x, UNB.dmg.pole, false, 'THE STANDARD\'S POLE');
    e.mode = 'pole'; e.modeT = 0.22; c.sound('slash'); return; }
  if (e.mode === 'pole') { if (e.modeT <= 0) { e.mode = 'rest'; e.modeT = 0.8; e.cd = 1.3; } return; }
  if (e.mode === 'rest') { if (e.modeT <= 0) e.mode = e.planted ? 'guard' : 'walk'; return; }
  e.face = Math.sign(dx) || e.face || 1;
  if (!e.planted) {
    if (!P.dead && Math.abs(dx) < UNB.plantRange && Math.abs(P.y - e.y) < 48) { e.mode = 'plantTell'; e.modeT = 0.9; return; }
    if (Math.abs(dx) < 300 && c.solid(e.x + e.face * 10, e.y + 4) && !c.solid(e.x + e.face * 10, e.y - 8)) { e.vx = e.face * UNB.bearerSpeed; c.move(e, e.vx * dt, 0); }
    return; }
  /* planted: he keeps to his standard, and the pole keeps you off it */
  if (!P.dead && Math.abs(dx) < 34 && Math.abs(P.y - e.y) < 26 && e.cd <= 0) { e.mode = 'poleTell'; e.modeT = 0.7; return; }
  const want = clamp(P.x, e.flagX - UNB.tether, e.flagX + UNB.tether), d = want - e.x;
  if (Math.abs(d) > 20 && c.solid(e.x + Math.sign(d) * 10, e.y + 4)) { e.vx = Math.sign(d) * UNB.bearerSpeed; c.move(e, e.vx * dt, 0); }
}

/* ---------------- THE STANDARD-BEARER (mini) ---------------- */
const SB_TELL = { sweep: 'sweepTell', charge: 'chargeTell', plant: 'plantTell', bash: 'bashTell' };
const SB_SAY = { sweepTell: 'THE GREAT POLE: GUARD', chargeTell: 'HE LOWERS THE BANNER: JUMP', plantTell: 'HE PLANTS THE BANNER', bashTell: 'THE BUTT OF THE POLE' };
export const sbOpen = e => e.mode === 'torn';
export function updateStandardBearer(e, dt, c) {
  const { P, A } = c, S = UNB.sb, floor = A.floor;
  if (!e.alive || e.mode === 'sleep') return;
  e.modeT -= dt; e.cd = (e.cd ?? 1) - dt; e.turn ??= 0; e.y = floor; e.vx = 0;
  e.open = sbOpen(e) ? Math.max(0, e.modeT) : 0;
  if (e.phase !== 2 && e.hp <= e.maxHp * 0.5) { e.phase = 2; c.say('THE WHOLE ARMY ANSWERS HIM', '#ff6b6b'); c.sound('horn'); }
  if (e.mode === 'wake') { if (e.modeT <= 0) { e.mode = 'stalk'; e.cd = 0.6; } return; }
  if (e.mode === 'torn') { if (e.modeT <= 0) { e.mode = 'stalk'; e.cd = 0.8; c.say('HE GATHERS THE RAG UP', '#ffd36b'); } return; }
  /* THE BANNER IN THE GROUND IS THE WINDOW: strike IT (not him) and it tears. It stands through his bash as well. */
  e.flagUp = e.mode === 'planted' || e.mode === 'bashTell' || e.mode === 'bash';
  if (e.flagUp) { e.plantLeft -= dt;
    if (c.struck(e.flagX - 7, floor - 58, 14, 58, e.flagKey ??= {})) { e.flagHits = (e.flagHits || 0) + 1; c.sound('crack');
      if (e.flagHits >= S.flagHits) { e.mode = 'torn'; e.modeT = S.tornT; e.open = S.tornT; e.flagUp = false; e.bashing = false; c.collapse(e); c.say('THE BANNER IS DOWN: HE IS OPEN', '#8fd160'); c.sound('heavy'); c.shake(5); return; }
      c.say('THE BANNER TEARS', '#8fd160'); }
    if (e.mode === 'planted' && e.plantLeft <= 0) { e.mode = 'stalk'; e.cd = 0.5; e.flagUp = false; c.say('HE PULLS IT UP', '#ffd36b'); return; } }
  if (e.mode === 'planted') {
    if (!P.dead && Math.abs(P.x - e.x) < 30 && Math.abs(P.y - floor) < 30 && e.cd <= 0) { e.bashing = true; e.mode = 'bashTell'; e.modeT = S.tell.bash; e.face = Math.sign(P.x - e.x) || e.face; c.say(SB_SAY.bashTell, '#ffd36b'); }
    return; }
  if (e.mode === 'charge') {
    const nx = e.x + e.face * S.chargeV * dt; e.x = clamp(nx, A.x0 + 24, A.x1 - 24); e.vx = e.face * S.chargeV;
    if (!e.chargeHit && !P.dead && Math.abs(P.x - e.x) < 22 && P.y > floor - 30) { e.chargeHit = true; c.hit(e.x, UNB.dmg.sbCharge, true, 'THE LOWERED BANNER'); }
    if (e.modeT <= 0 || e.x <= A.x0 + 24 || e.x >= A.x1 - 24) { e.mode = 'rest'; e.modeT = 0.9; c.shake(3); c.sound('heavy'); }
    return; }
  if (e.mode === 'sweep' || e.mode === 'rest' || e.mode === 'bash') { if (e.modeT <= 0) { if (e.bashing) { e.bashing = false; e.mode = 'planted'; e.cd = 1; return; } e.mode = 'stalk'; e.cd = e.phase === 2 ? S.cdP2 : S.cd; } return; }
  if (tells(e)) {
    if (e.mode !== 'chargeTell') e.face = Math.sign(P.x - e.x) || e.face;
    if (e.modeT > 0) return;
    if (e.mode === 'sweepTell') { const f = (P.x - e.x) * e.face; if (!P.dead && f > -10 && f < S.sweepR && Math.abs(P.y - floor) < 34) c.hit(e.x, UNB.dmg.sbSweep, false, 'THE GREAT POLE'); e.mode = 'sweep'; e.modeT = 0.4; c.sound('whoosh'); return; }
    if (e.mode === 'bashTell') { const f = (P.x - e.x) * e.face; if (!P.dead && f > -8 && f < 34 && Math.abs(P.y - floor) < 30) c.hit(e.x, UNB.dmg.sbBash, false, 'THE BUTT OF THE POLE'); e.mode = 'bash'; e.modeT = 0.3; c.sound('slash'); return; }
    if (e.mode === 'chargeTell') { e.mode = 'charge'; e.modeT = 1.3; e.chargeHit = false; c.sound('charge'); return; }
    if (e.mode === 'plantTell') { e.mode = 'planted'; e.flagUp = true; e.plantLeft = e.phase === 2 ? S.plantTP2 : S.plantT; e.modeT = e.plantLeft; e.flagX = clamp(e.x + e.face * 20, A.x0 + 16, A.x1 - 16); e.flagHits = 0; c.sound('plant'); c.shake(3);
      const n = Math.min(e.phase === 2 ? S.raiseP2 : S.raise, S.adds - c.adds(e).filter(q => q.mode !== 'down').length);
      for (let i = 0; i < n; i++) { const side = i % 2 ? -1 : 1, x = clamp(P.x + side * (70 + 30 * i), A.x0 + 30, A.x1 - 30); c.raise(x, floor, e); }
      if (n > 0) c.say('THE FIELD RISES', '#c8b6ff'); return; }
  }
  const d = P.x - e.x, ad = Math.abs(d); e.face = Math.sign(d) || e.face;
  const want = ad > S.keep ? e.face : 0, nx = e.x + want * S.walk * dt; if (nx > A.x0 + 20 && nx < A.x1 - 20) e.x = nx; e.vx = want * S.walk;
  if (e.cd > 0 || P.dead) return;
  let what = S.order[e.turn++ % S.order.length];
  if (what === 'sweep' && ad > S.sweepR + 40) what = 'charge';
  if (e.phase === 2 && what === 'sweep' && e.turn % 3 === 0) what = 'charge';
  e.mode = SB_TELL[what]; e.modeT = S.tell[what]; e.face = Math.sign(P.x - e.x) || e.face;
  c.say(SB_SAY[e.mode], what === 'charge' ? '#ff6b6b' : '#ffd36b');
}
/* 0 idle | 1,2 walk | 3 sweep tell | 4 sweep | 5 charge tell | 6 charge | 7 plant tell | 8 planted (hands empty) | 9 torn (on one knee) | 10 hurt */
export function sbFrame(e) {
  switch (e.mode) { case 'sweepTell': case 'bashTell': return 3; case 'sweep': case 'bash': return 4; case 'chargeTell': return 5; case 'charge': return 6; case 'plantTell': return 7; case 'planted': return 8; case 'torn': return 9; }
  if (e.hurtT > 0) return 10;
  return Math.abs(e.vx || 0) > 3 ? 1 + Math.floor((e.anim || 0) * 5) % 2 : 0;
}

/* ---------------- THE FIRST DEATH KNIGHT (boss) ---------------- */
const DK_TELL = { swathe: 'swatheTell', reap: 'reapTell', pass: 'passTell', raise: 'raiseTell', cut: 'cutTell' };
const DK_SAY = { swatheTell: 'THE SWATHE: CLOSE IN', reapTell: 'THE REAPING: JUMP IT', passTell: 'THE PASSING: LEAVE THE MARK', raiseTell: 'HE RAISES THE DEAD', cutTell: 'THE SHORT CUT: GUARD' };
export const dkOpen = e => e.mode === 'open';
export function updateDeathKnight(e, dt, c) {
  const { P, A } = c, D = UNB.dk, floor = A.floor;
  if (!e.alive || e.mode === 'sleep') return;
  e.modeT -= dt; e.cd = (e.cd ?? 1) - dt; e.turn ??= 0; e.marks ??= []; e.y = floor; e.vx = 0;
  e.open = dkOpen(e) ? Math.max(0, e.modeT) : 0;
  /* THE MARKS HE LEFT: each one goes off where it was laid */
  for (const m of e.marks) { m.t -= dt; if (m.t <= 0 && !m.done) { m.done = true; c.sound('boom'); c.ring(m.x, m.y - 6, D.markR, '#b07cf0');
    if (!P.dead && Math.abs(P.x - m.x) < D.markR && Math.abs(P.y - m.y) < 30) c.hit(m.x, UNB.dmg.mark, true, 'THE MARK OF THE PASSING'); } }
  e.marks = e.marks.filter(m => m.t > -0.3);
  if (e.phase !== 2 && e.hp <= e.maxHp * 0.5 && !tells(e) && e.mode !== 'reap' && e.mode !== 'pass' && e.mode !== 'open') { e.phase = 2; e.mode = 'rally'; e.modeT = 1.4; e.turn = 0; c.say('HE IS THE BANNER NOW: WHAT FALLS HERE GETS UP', '#ff6b6b'); c.sound('horn'); return; }
  if (e.mode === 'wake' || e.mode === 'rally') { if (e.modeT <= 0) { e.mode = 'stalk'; e.cd = 0.6; } return; }
  if (e.mode === 'open') { if (e.modeT <= 0) { e.mode = 'stalk'; e.cd = 0.7; c.say('HE WRENCHES THE SCYTHE FREE', '#ffd36b'); } return; }
  if (e.mode === 'swathe' || e.mode === 'reap' || e.mode === 'cut' || e.mode === 'raise' || e.mode === 'rest') { if (e.modeT <= 0) { e.mode = 'stalk'; e.cd = e.phase === 2 ? D.cdP2 : D.cd; } return; }
  if (e.mode === 'pass') { const k = 1 - clamp(e.modeT / 0.3, 0, 1); e.x = e.passX0 + (e.passX1 - e.passX0) * k; if (e.modeT <= 0) { e.x = e.passX1; e.mode = 'rest'; e.modeT = 0.7; } return; }
  if (tells(e)) {
    if (e.mode !== 'passTell' && e.mode !== 'reapTell') e.face = Math.sign(P.x - e.x) || e.face;
    /* THE REAPING DRAGS: you on the ground, and his own dead with you */
    if (e.mode === 'reapTell') { c.pull(e.x, D.pullR, D.pullV, dt); for (const q of c.adds(e)) if (q.mode !== 'down' && Math.abs(q.x - e.x) < D.pullR && Math.abs(q.x - e.x) > 10) q.x += Math.sign(e.x - q.x) * D.pullV * dt; }
    if (e.modeT > 0) return;
    const f = (P.x - e.x) * e.face, ad = Math.abs(P.x - e.x);
    if (e.mode === 'swatheTell') { e.mode = 'swathe'; e.modeT = 0.35; c.sound('whoosh'); c.ring(e.x + e.face * 60, floor - 20, D.swatheOut - 20, '#ff6b6b');
      if (!P.dead && f > -12 && ad >= D.swatheIn && ad <= D.swatheOut && P.y > floor - 48) c.hit(e.x, UNB.dmg.swathe, true, 'THE SWATHE');
      else if (!P.dead && f > -12 && ad < D.swatheIn && Math.abs(P.y - floor) < 40) c.hit(e.x, UNB.dmg.swatheIn, false, 'THE INSIDE OF THE BLADE');
      return; }
    if (e.mode === 'reapTell') { e.mode = 'reap'; e.modeT = 0.45; c.sound('whoosh'); c.ring(e.x, floor - 10, D.reapR, '#ff6b6b');
      if (!P.dead && ad < D.reapR && P.y > floor - 24) c.hit(e.x, UNB.dmg.reap, true, 'THE REAPING');
      /* A11: THE CAUSED OPENING. His own risen dead in the circle are cut - and the scythe is in them, not in you */
      let cut = 0; for (const q of c.adds(e)) if (Math.abs(q.x - e.x) < D.reapR && Math.abs(q.y - floor) < 30) { const standing = q.mode !== 'down' && q.mode !== 'riseTell'; c.cut(q); if (standing) cut++; }
      if (cut > 0) { e.mode = 'open'; e.modeT = D.openT; e.open = D.openT; c.say('HE CUT HIS OWN DEAD: HE IS OPEN', '#8fd160'); c.sound('crack'); c.shake(5); }
      return; }
    if (e.mode === 'passTell') { e.mode = 'pass'; e.modeT = 0.3; e.passX0 = e.x; const side = Math.sign(e.markX - e.x) || e.face; e.passX1 = clamp(e.markX + side * D.passStep, A.x0 + 24, A.x1 - 24); e.face = side;
      e.marks.push({ x: e.markX, y: e.markY, t: D.markT }); c.sound('pass'); return; }
    if (e.mode === 'raiseTell') { e.mode = 'raise'; e.modeT = 0.5; c.sound('rise');
      const cap = e.phase === 2 ? D.addsP2 : D.adds, n = Math.min(e.phase === 2 ? D.raiseP2 : D.raise, cap - c.adds(e).filter(q => q.mode !== 'down').length);
      for (let i = 0; i < n; i++) { const side = i % 2 ? -1 : 1, x = clamp(e.x + side * (54 + 34 * (i >> 1)), A.x0 + 30, A.x1 - 30); c.raise(x, floor, e); }
      return; }
    if (e.mode === 'cutTell') { e.mode = 'cut'; e.modeT = 0.3; c.sound('slash'); if (!P.dead && f > -8 && f < D.cutR && P.y > floor - 30) c.hit(e.x, UNB.dmg.dkCut, false, 'THE SHORT CUT'); return; }
  }
  /* STALKING */
  const d = P.x - e.x, ad = Math.abs(d); e.face = Math.sign(d) || e.face;
  const want = ad > D.keep ? e.face : 0, nx = e.x + want * D.walk * dt; if (nx > A.x0 + 20 && nx < A.x1 - 20) e.x = nx; e.vx = want * D.walk;
  if (e.cd > 0 || P.dead) return;
  const order = e.phase === 2 ? D.orderP2 : D.order;
  let what = order[e.turn++ % order.length];
  if (what === 'cut' && ad > D.cutR + 30) what = 'swathe';
  begin(e, what, c);
}
function begin(e, what, c) { const { P, A } = c; e.mode = DK_TELL[what]; e.modeT = UNB.dk.tell[what]; e.face = Math.sign(P.x - e.x) || e.face || 1;
  if (what === 'pass') { e.markX = clamp(P.x, A.x0 + 16, A.x1 - 16); e.markY = Number.isFinite(P.y) ? Math.min(P.y, A.floor) : A.floor; }
  c.say(DK_SAY[e.mode], what === 'cut' ? '#ffd36b' : what === 'raise' ? '#c8b6ff' : '#ff6b6b'); }
export const dkForce = (e, what, c) => begin(e, what, c);   /* for the harness: A3, every attack forced */
/* 0 idle | 1,2 walk | 3 swathe tell | 4 swathe | 5 reap tell | 6 reap | 7 pass tell | 8 pass | 9 raise | 10 cut tell | 11 cut | 12 open | 13 hurt */
export function dkFrame(e) {
  switch (e.mode) { case 'swatheTell': return 3; case 'swathe': return 4; case 'reapTell': return 5; case 'reap': return 6; case 'passTell': return 7; case 'pass': return 8;
    case 'raiseTell': case 'raise': case 'rally': return 9; case 'cutTell': return 10; case 'cut': return 11; case 'open': return 12; case 'sleep': case 'wake': return 0; }
  if (e.hurtT > 0) return 13;
  return Math.abs(e.vx || 0) > 3 ? 1 + Math.floor((e.anim || 0) * 5) % 2 : 0;
}
/* 0 idle carrying | 1,2 walk | 3 plant tell | 4 guard (planted, pole in hand) | 5 pole tell | 6 pole | 7 hurt */
export function bbFrame(e) {
  if (e.mode === 'plantTell') return 3; if (e.mode === 'poleTell') return 5; if (e.mode === 'pole') return 6;
  if (e.hurtT > 0) return 7;
  if (Math.abs(e.vx || 0) > 3) return 1 + Math.floor((e.anim || 0) * 6) % 2;
  return e.planted ? 4 : 0;
}
/* 0 lying | 1 kneeling (rising) | 2 standing | 3,4 walk | 5 cut tell | 6 cut | 7 hurt */
export function corpseFrame(e) {
  if (e.mode === 'down') return 0; if (e.mode === 'riseTell') return e.modeT > UNB.riseT * 0.45 ? 1 : 2;
  if (e.mode === 'cutTell') return 5; if (e.mode === 'cut') return 6; if (e.hurtT > 0) return 7;
  return Math.abs(e.vx || 0) > 3 ? 3 + Math.floor((e.anim || 0) * 5) % 2 : 2;
}
export const unbFrame = e => e.t === 'deathknight' ? dkFrame(e) : e.t === 'standardbearer' ? sbFrame(e) : e.t === 'bannerbearer' ? bbFrame(e) : corpseFrame(e);

/* ---------------- THE BATTLE ROUND YOU: volleys, cover, the cavalry, arrow pegs, the engines ---------------- */
/* F is built once a (re)spawn from the level and its placed props, and stepped every frame with the world's hands in c. */
export function newField(L, TS = 16) {
  if (!L || !L.volleys) return null;
  const G = L.cavalry ? L.cavalry.row : 36;
  const props = (L.ents || []).filter(e => ['cover', 'ballista', 'trebuchet', 'oilbarrel'].includes(e.t)).map(e => ({ t: e.t, kind: e.kind, x: e.x * TS + 8, y: (e.y + 1) * TS, tx: e.x, ty: e.y,
    aim: e.aim ? { x: e.aim[0] * TS + 8, y: (e.aim[1] + 1) * TS } : null, spill: e.spill ? [e.spill[0] * TS, (e.spill[1] + 1) * TS] : null, knocks: e.knocks || null, cd: 0, state: 'ready', t2: 0 }));
  return {
    TS, G,
    volleys: L.volleys.map((v, i) => ({ ...v, t: (i * 2.1) % v.period, quiet: false, warn: false, fell: 0 })),
    cav: L.cavalry ? { ...L.cavalry, t: 0, x: null, warn: false, hitP: false } : null,
    pegs: (L.pegs || []).map(p => ({ ...p, up: 0, zone: null, stray: 0 })),
    covers: props.filter(p => p.t === 'cover'), engines: props.filter(p => p.t !== 'cover'),
    bolts: [], stones: [], arrows: [], breach: false,
  };
}
export const HORN_CAV = 3.0;
/* WHERE AN ARROW CANNOT FIND YOU: behind a cover prop on its own floor, or down in a trench (the low route is sheltered) */
export function sheltered(F, P) {
  const TS = F.TS;
  if (P.y > (F.G + 1) * TS + 20) return true;   /* in a trench: two rows under the field */
  return F.covers.some(cv => Math.abs(P.x - cv.x) < 20 && Math.abs(P.y - cv.y) < 12);
}
export function stepField(F, dt, c) {
  if (!F) return;
  const { P } = c, TS = F.TS;
  for (const p of F.pegs) p.zone = F.volleys.find(v => p.x * TS >= v.x0 && p.x * TS <= v.x1) || null;
  /* THE VOLLEYS: a horn, then the ridge looses across its stretch of field. The stretch goes quiet when its bearer is cut. */
  for (const v of F.volleys) {
    if (!v.quiet && v.bearer && !c.bearerAlive(v.bearer)) { v.quiet = true; c.say(P.x, P.y - 40, 'THAT STRETCH OF RIDGE GOES QUIET', '#c8b6ff'); }
    if (v.quiet) { v.warn = false; continue; }
    const near = P.x > v.x0 - 200 && P.x < v.x1 + 200;
    v.t += dt; const wasWarn = v.warn; v.warn = v.t >= v.period - v.horn && v.t < v.period;
    if (v.warn && !wasWarn && near) { c.sound('horn'); if (P.x > v.x0 && P.x < v.x1) c.say(P.x, P.y - 40, 'A HORN ON THE RIDGE: GET UNDER COVER', '#ff6b6b'); }
    if (v.t >= v.period) { v.t -= v.period; v.fell = 0.6;
      if (near) { c.sound('volley'); for (let i = 0; i < 18; i++) F.arrows.push({ x: clamp(P.x + (Math.random() - 0.5) * 400, v.x0, v.x1), y: P.y - 190 - Math.random() * 60, vy: 420 + Math.random() * 80, t: 0.8 }); }
      if (!P.dead && P.x > v.x0 && P.x < v.x1 && !sheltered(F, P)) c.hurtP(P.x, UNB.dmg.volley, 'THE VOLLEY');
      for (const p of F.pegs) if (p.zone === v && c.wallStands(p)) { p.up = p.life; c.pegs(p, true); } }
    v.fell = Math.max(0, v.fell - dt);
  }
  /* A PEG WALL OUT OF ANY ZONE takes a stray flight on the same rhythm: arrows into the wall, nobody under them */
  for (const p of F.pegs) { if (!p.zone) { p.stray += dt; if (p.stray >= 6) { p.stray = 0; if (Math.abs(P.x - p.x * TS) < 400 && c.wallStands(p)) { c.sound('volley'); p.up = p.life; c.pegs(p, true); } } }
    if (p.up > 0) { p.up -= dt; if (p.up <= 0 || !c.wallStands(p)) { p.up = 0; c.pegs(p, false); } } }
  /* THE GHOST CAVALRY: horns and dust, then a line of riders down the lane - off the ground, or be ridden down */
  const cv = F.cav; if (cv) {
    const inLane = P.x > cv.x0 - 120 && P.x < cv.x1 + 120;
    if (cv.x === null) { if (inLane) { cv.t += dt; const warn = cv.t >= cv.period - HORN_CAV; if (warn && !cv.warn) { c.sound('cavhorn'); c.say(P.x, P.y - 40, 'HORNS AND DUST: GET OFF THE GROUND', '#ff6b6b'); } cv.warn = warn;
        if (cv.t >= cv.period) { cv.t = 0; cv.warn = false; cv.x = cv.x1 + 40; cv.hitP = false; c.sound('gallop'); } } }
    else { cv.x -= 380 * dt;
      if (!cv.hitP && !P.dead && Math.abs(P.x - cv.x) < 20 && P.y > (cv.row + 6) * TS - 20) { cv.hitP = true; c.hurtP(cv.x, UNB.dmg.cavalry, 'THE GHOST CAVALRY'); }
      for (const q of c.foes()) if (q.alive && !q.maxHp && Math.abs(q.x - cv.x) < 16 && q.y > (cv.row + 6) * TS - 20 && !q.cavHit) { q.cavHit = true; c.hurtFoe(q, 30, cv.x + 20); }
      if (cv.x < cv.x0 - 40) { cv.x = null; for (const q of c.foes()) q.cavHit = false; } }
  }
  /* THE ENGINES YOU WORK */
  for (const en of F.engines) {
    en.cd = Math.max(0, en.cd - dt);
    if (en.t === 'ballista' && en.cd <= 0 && c.struck(en.x - 14, en.y - 20, 28, 20, en)) { en.cd = 4; c.sound('bolt');
      const dx = en.aim.x - en.x, dy = en.aim.y - 8 - (en.y - 12), d = Math.hypot(dx, dy) || 1; F.bolts.push({ x: en.x, y: en.y - 12, vx: dx / d * 520, vy: dy / d * 520, t: d / 520 + 0.05, hit: new Set() }); }
    if (en.t === 'trebuchet') { if (en.state === 'ready' && c.struck(en.x - 18, en.y - 36, 36, 36, en)) { en.state = 'wind'; en.t2 = 1.0; c.sound('crank'); c.say(en.x, en.y - 50, 'THE COUNTERWEIGHT DROPS', '#ffd36b'); }
      else if (en.state === 'wind') { en.t2 -= dt; if (en.t2 <= 0) { en.state = 'spent'; const T = 1.4; F.stones.push({ x: en.x, y: en.y - 40, vx: (en.aim.x - en.x) / T, vy: (en.aim.y - (en.y - 40) - 0.5 * 400 * T * T) / T, t: T, knocks: en.knocks }); c.sound('whoosh'); } } }
    if (en.t === 'oilbarrel') { if (en.state === 'ready' && c.struck(en.x - 9, en.y - 16, 18, 16, en)) { en.state = 'tip'; en.t2 = 0.6; c.say(en.x, en.y - 30, 'THE PITCH SPILLS', '#ff9a5c'); c.sound('crack'); }
      else if (en.state === 'tip') { en.t2 -= dt; if (en.t2 <= 0) { en.state = 'spent'; c.spill(en.spill[0], en.spill[1], en.y); c.sound('fire'); } } }
  }
  for (const b of F.bolts) { b.x += b.vx * dt; b.y += b.vy * dt; b.t -= dt;
    for (const q of c.foes()) if (q.alive && !b.hit.has(q) && Math.abs(q.x - b.x) < 12 && q.y > b.y - 6 && q.y - (q.h || 16) < b.y + 6) { b.hit.add(q); c.hurtFoe(q, q.maxHp ? 30 : 60, b.x - Math.sign(b.vx) * 10); } }
  F.bolts = F.bolts.filter(b => b.t > 0);
  for (const s of F.stones) { s.vy += 400 * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.t -= dt; if (s.t <= 0 && !s.done) { s.done = true; if (s.knocks === 'tower') { F.breach = true; c.breach(); } } }
  F.stones = F.stones.filter(s => s.t > -0.1);
  for (const a of F.arrows) { a.y += a.vy * dt; a.t -= dt; } F.arrows = F.arrows.filter(a => a.t > 0);
}

/* ---------------- DRAWING (the world's parts; the creatures are sprites) ---------------- */
const R = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
/* a torn battle standard on its pole, foot at (x, y): the thing the whole level is about, so it is the loudest colour on the field */
export function drawStandard(g, x, y, time, big, torn) {
  const hgt = big ? 60 : 40, fw = big ? 22 : 14, fh = big ? 16 : 11, top = y - hgt, wave = Math.sin(time * 5 + x) * 1.5;
  R(g, x - 1, top, 2, hgt, '#4a3222'); R(g, x - 2, top - 3, 4, 3, '#d8b04a');
  if (torn) { R(g, x + 1, top + 6, 6, 4, '#7a1e24'); return; }
  for (let i = 0; i < fw; i++) { const k = i / fw, dy = Math.round(Math.sin(time * 6 + i * 0.5) * 1.5 * k + wave * k); R(g, x + 1 + i, top + 2 + dy, 1, fh - (i > fw - 4 ? (i % 2) * 3 : 0), i % 5 === 0 ? '#a8342c' : '#8e2a26'); }
  R(g, x + 3, top + 4 + Math.round(wave * 0.3), Math.min(6, fw - 6), 2, '#e8c35a'); R(g, x + 5, top + 7, 2, 4, '#e8c35a');   /* the order's gold mark */
}
export function drawUnbWorld(g, foes, cx, cy, time) {
  for (const e of foes) {
    if (!e.alive) continue;
    const x = Math.round(e.x - cx), fy = Math.round(e.y - cy);
    if (e.t === 'bannerbearer' && e.planted) { const fx = Math.round(e.flagX - cx);
      g.globalAlpha = 0.14 + 0.06 * Math.sin(time * 3); g.fillStyle = '#b07cf0'; g.fillRect(fx - UNB.bannerR, fy - 2, UNB.bannerR * 2, 2); g.globalAlpha = 1;   /* the ground its standard holds */
      drawStandard(g, fx, fy, time, false, false); }
    if (e.t === 'standardbearer' && (e.flagUp || e.mode === 'torn')) { const fx = Math.round(e.flagX - cx), torn = e.mode === 'torn';
      drawStandard(g, fx, fy, time, true, torn);
      if (!torn) { const k = 0.5 + 0.5 * Math.sin(time * 10); g.globalAlpha = 0.35 + 0.35 * k; g.strokeStyle = '#8fd160'; g.lineWidth = 1; g.strokeRect(fx - 8, fy - 60, 16, 58); g.globalAlpha = 1;   /* THE WINDOW: the banner, outlined green */
        for (let i = 0; i < (e.flagHits || 0); i++) R(g, fx - 6 + i * 5, fy - 66, 3, 3, '#8fd160'); } }
    if (e.t === 'corpse' && e.mode === 'riseTell') { for (let i = 0; i < 3; i++) R(g, x - 8 + i * 7 + Math.round(Math.sin(time * 14 + i) * 2), fy - 3 - ((time * 30 + i * 5) % 8), 2, 2, '#c8b6ff'); }
    if (e.t === 'deathknight') {
      for (const m of e.marks || []) { if (m.done) continue; const mx = Math.round(m.x - cx), my = Math.round(m.y - cy), k = 0.5 + 0.5 * Math.sin(time * (m.t < 0.5 ? 30 : 12));
        g.globalAlpha = 0.3 + 0.4 * k; g.fillStyle = '#ff6b6b'; g.beginPath(); g.ellipse(mx, my - 2, UNB.dk.markR, 6, 0, 0, 7); g.fill(); g.globalAlpha = 1;
        g.strokeStyle = '#ff6b6b'; g.lineWidth = 2; g.beginPath(); g.moveTo(mx - 5, my - 12); g.lineTo(mx + 5, my - 2); g.moveTo(mx + 5, my - 12); g.lineTo(mx - 5, my - 2); g.stroke(); }
      if (e.mode === 'reapTell') { const k = 1 - Math.max(0, e.modeT) / UNB.dk.tell.reap; g.globalAlpha = 0.25 + 0.35 * k; g.strokeStyle = '#ff6b6b'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, fy - 4, UNB.dk.reapR, 10, 0, 0, 7); g.stroke(); g.globalAlpha = 1; }
      if (e.mode === 'swatheTell') { g.globalAlpha = 0.28; g.fillStyle = '#ff6b6b'; const f = e.face || 1; g.fillRect(f > 0 ? x + UNB.dk.swatheIn : x - UNB.dk.swatheOut, fy - 48, UNB.dk.swatheOut - UNB.dk.swatheIn, 48); g.fillStyle = '#8fd160'; g.fillRect(x - UNB.dk.swatheIn, fy - 3, UNB.dk.swatheIn * 2, 3); g.globalAlpha = 1; }   /* red where it cuts, green inside it */
      if (e.mode === 'open') { const k = 0.5 + 0.5 * Math.sin(time * 10); g.globalAlpha = 0.35 + 0.35 * k; g.strokeStyle = '#8fd160'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, fy - 2, 26 + k * 3, 7, 0, 0, 7); g.stroke(); g.globalAlpha = 1; }
    }
    if (e.t === 'standardbearer' && e.mode === 'chargeTell') { const f = e.face || 1; g.globalAlpha = 0.3 + 0.2 * Math.sin(time * 20); g.fillStyle = '#ff6b6b'; g.fillRect(f > 0 ? x : x - 600, fy - 30, 600, 30); g.globalAlpha = 1; }
    if (e.t === 'standardbearer' && e.mode === 'torn') { const k = 0.5 + 0.5 * Math.sin(time * 10); g.globalAlpha = 0.35 + 0.35 * k; g.strokeStyle = '#8fd160'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, fy - 2, 24 + k * 3, 7, 0, 0, 7); g.stroke(); g.globalAlpha = 1; }
  }
}
export function drawField(g, F, cx, cy, time, VW, VH) {
  if (!F) return; const TS = F.TS;
  /* THE GHOST ARMY on the ridge, over every stretch that is still fighting - and nothing over the ones you have ended */
  for (const v of F.volleys) { if (v.quiet) continue; const x0 = Math.max(0, v.x0 - cx), x1 = Math.min(VW, v.x1 - cx); if (x1 <= x0) continue;
    const ry = Math.round((F.G - 13) * TS - cy * 0.6);
    g.globalAlpha = 0.16; for (let x = x0 - ((cx * 0.4) % 9); x < x1; x += 9) { const b = Math.round(Math.sin(time * 2 + x) * 1); R(g, x, ry + b, 3, 8, '#c8b6ff'); R(g, x, ry - 3 + b, 3, 3, '#c8b6ff'); if ((x | 0) % 27 === 0) R(g, x + 1, ry - 12, 1, 10, '#c8b6ff'); }
    g.globalAlpha = 1;
    if (v.warn) { const k = 0.5 + 0.5 * Math.sin(time * 16); g.globalAlpha = 0.07 + 0.08 * k; R(g, x0, 0, x1 - x0, VH, '#ff6b6b'); g.globalAlpha = 1;
      /* C5: the escape, lit from inside the danger - every cover prop in reach glows */
      for (const cv of F.covers) { const sx = cv.x - cx; if (sx < x0 - 20 || sx > x1 + 20) continue; g.globalAlpha = 0.5 + 0.4 * k; g.strokeStyle = '#8fd160'; g.lineWidth = 1; g.strokeRect(Math.round(sx) - 14, Math.round(cv.y - cy) - 26, 28, 26); R(g, sx - 1, cv.y - cy - 34 - k * 3, 3, 5, '#8fd160'); g.globalAlpha = 1; } } }
  for (const a of F.arrows) { const x = Math.round(a.x - cx), y = Math.round(a.y - cy); R(g, x, y - 7, 1, 7, '#5a4a36'); R(g, x - 1, y - 8, 3, 2, '#c8b6ff'); }
  /* COVER: shields, wagons, mantlets */
  for (const cv of F.covers) { const x = Math.round(cv.x - cx), y = Math.round(cv.y - cy); if (x < -40 || x > VW + 40) continue;
    if (cv.kind === 'wagon') { R(g, x - 14, y - 18, 28, 12, '#5a3e26'); R(g, x - 14, y - 18, 28, 2, '#7a5634'); R(g, x - 10, y - 8, 7, 7, '#2e2016'); R(g, x + 4, y - 8, 7, 7, '#2e2016'); R(g, x - 8, y - 6, 3, 3, '#7a5634'); R(g, x + 6, y - 6, 3, 3, '#7a5634'); }
    else if (cv.kind === 'mantlet') { R(g, x - 12, y - 24, 24, 22, '#6a4a2c'); for (let q = -10; q < 12; q += 5) R(g, x + q, y - 24, 1, 22, '#3e2a18'); R(g, x - 12, y - 25, 24, 2, '#8a6a44'); R(g, x - 10, y - 3, 3, 3, '#3e2a18'); R(g, x + 7, y - 3, 3, 3, '#3e2a18'); }
    else { for (let q = 0; q < 3; q++) { const sx = x - 12 + q * 8; R(g, sx, y - 16 + (q % 2) * 2, 8, 14, q % 2 ? '#7a6a58' : '#6a5a48'); R(g, sx + 3, y - 11 + (q % 2) * 2, 2, 4, '#c8a44a'); } }   /* upturned shields */
  }
  /* PEGS: the arrows standing in the palisade, going out in the last second */
  for (const p of F.pegs) { if (!(p.up > 0)) continue; const x = Math.round(p.x * TS - cx), blink = p.up < 1 && Math.floor(time * 14) % 2;
    if (blink) continue; for (const r of p.rows) { const y = Math.round(r * TS - cy); for (let k = 0; k < 3; k++) { R(g, x - 13 + k * 4, y + k % 2, 12 - k * 3, 2, '#6a5236'); R(g, x - 15 + k * 4, y - 1 + k % 2, 3, 3, '#c8b6ff'); } } }
  /* THE CAVALRY: the lane marked while the horns blow, and the riders */
  const cv = F.cav; if (cv) { const ly = Math.round((cv.row + 6) * TS - cy);
    if (cv.warn || cv.x !== null) { const k = 0.5 + 0.5 * Math.sin(time * 18); g.globalAlpha = 0.18 + 0.2 * k; R(g, cv.x0 - cx, ly - 22, cv.x1 - cv.x0, 22, '#ff6b6b'); g.globalAlpha = 1;
      if (cv.warn) { const dx = Math.min(VW - 20, cv.x1 - cx); for (let i = 0; i < 6; i++) { g.globalAlpha = 0.5; R(g, dx - i * 8 + Math.sin(time * 9 + i) * 3, ly - 8 - (i % 3) * 5, 6, 4, '#c9b27c'); } g.globalAlpha = 1;
        text2(g, '!!', Math.max(20, Math.min(VW - 20, cv.x1 - cx - 30)), ly - 40, '#ff6b6b'); } }
    if (cv.x !== null) { const x = Math.round(cv.x - cx); for (let i = 0; i < 5; i++) { const hx = x + i * 26, b = Math.round(Math.sin(time * 26 + i) * 2);
        g.globalAlpha = 0.55; R(g, hx - 10, ly - 16 + b, 22, 9, '#c8d6ff'); R(g, hx - 13, ly - 20 + b, 6, 6, '#c8d6ff'); R(g, hx - 8, ly - 7 + b, 2, 7, '#c8d6ff'); R(g, hx + 8, ly - 7 - b, 2, 7, '#c8d6ff'); R(g, hx + 1, ly - 28 + b, 5, 12, '#e8eeff'); R(g, hx - 8, ly - 30 + b, 20, 1, '#e8eeff'); g.globalAlpha = 1; } } }
  /* THE ENGINES */
  for (const en of F.engines) { const x = Math.round(en.x - cx), y = Math.round(en.y - cy); if (x < -60 || x > VW + 60) continue;
    if (en.t === 'ballista') { R(g, x - 12, y - 8, 24, 8, '#4a3222'); R(g, x - 3, y - 16, 6, 8, '#5a3e26'); R(g, x - 14, y - 18, 28, 3, '#6a4a2c'); R(g, x - 1, y - 20, 16, 2, en.cd > 0 ? '#3a2a1a' : '#c8c8d0');
      if (en.cd <= 0) { g.globalAlpha = 0.25; g.strokeStyle = '#ffd36b'; g.setLineDash([3, 4]); g.beginPath(); g.moveTo(x, y - 12); g.lineTo(Math.round(en.aim.x - cx), Math.round(en.aim.y - 8 - cy)); g.stroke(); g.setLineDash([]); g.globalAlpha = 1; } }
    if (en.t === 'trebuchet') { const arm = en.state === 'ready' ? -0.9 : en.state === 'wind' ? -0.9 + (1 - en.t2) * 2 : 1.1;
      R(g, x - 18, y - 6, 36, 6, '#4a3222'); fillPoly(g, [[x - 14, y - 6], [x - 2, y - 34], [x + 2, y - 34], [x + 14, y - 6]], '#5a3e26');
      g.strokeStyle = '#6a4a2c'; g.lineWidth = 3; g.beginPath(); g.moveTo(x - Math.cos(arm) * 12, y - 34 - Math.sin(arm) * 12); g.lineTo(x + Math.cos(arm) * 30, y - 34 + Math.sin(arm) * 30); g.stroke();
      R(g, x - Math.cos(arm) * 12 - 5, y - 34 - Math.sin(arm) * 12 - 3, 10, 9, '#3a3a44');
      if (en.state === 'ready') { g.globalAlpha = 0.25; g.strokeStyle = '#ffd36b'; g.setLineDash([3, 4]); g.beginPath(); g.moveTo(x, y - 40); g.quadraticCurveTo((x + en.aim.x - cx) / 2, y - 140, Math.round(en.aim.x - cx), Math.round(en.aim.y - cy)); g.stroke(); g.setLineDash([]); g.globalAlpha = 1; } }
    if (en.t === 'oilbarrel' && en.state !== 'spent') { const tilt = en.state === 'tip' ? Math.round((0.6 - en.t2) * 10) : 0; R(g, x - 7 + tilt, y - 15, 14, 15, '#3a2a1c'); R(g, x - 7 + tilt, y - 12, 14, 2, '#8a8a94'); R(g, x - 7 + tilt, y - 5, 14, 2, '#8a8a94'); R(g, x - 3 + tilt, y - 17, 6, 2, '#1a1410'); R(g, x - 2 + tilt, y - 10, 4, 3, '#ff9a5c'); }
  }
  for (const b of F.bolts) { const x = Math.round(b.x - cx), y = Math.round(b.y - cy), f = Math.sign(b.vx) || 1; R(g, f > 0 ? x - 14 : x, y, 14, 2, '#c8c8d0'); R(g, f > 0 ? x : x - 3, y - 1, 3, 4, '#e8e8f0'); }
  for (const s of F.stones) { R(g, s.x - cx - 5, s.y - cy - 5, 10, 10, '#6a6a74'); R(g, s.x - cx - 3, s.y - cy - 4, 4, 3, '#9a9aa4'); }
}
function text2(g, s, x, y, col) { /* two red bars and a gap: the '!!' without the font (the font is main.js's) */ for (let i = 0; i < s.length; i++) { R(g, x + i * 4 - 3, y, 2, 6, col); R(g, x + i * 4 - 3, y + 8, 2, 2, col); } }

/* ---------------- THE ART (baked once; the house pixel style: px.js shapes, a dark outline, flipped for the left) ---------------- */
/* one armoured body, posed: feet at (cx, fy). o.lean shifts the torso, o.kneel folds a leg, the arms go to where the hands are */
const hx0 = (o, cx, s) => cx + (o.lean || 0) * s;   /* where the shoulders are over the hips */
function figure(g, o) {
  const s = o.s || 1, cx = o.cx, fy = o.fy, P2 = o.pal;
  const hip = fy - 11 * s * (o.kneel ? 0.62 : 1), sh = hip - 11 * s, lean = (o.lean || 0) * s, hx = cx + lean;
  const legA = o.stride || 0;
  /* THE TATTERED CLOAK (2026-09-24, POLISH): hung from the shoulders and flying out behind, its hem torn into tongues. Drawn first, so
     the legs and the body stand in front of it; it is what makes a tall armoured man a SHAPE at game scale and not a column. */
  if (o.cloak && !o.lying) { const [cl, clD] = o.cloak, sy = hip - 11 * s, hem = fy - 2 * s, back = cx - (12 + (o.flut || 0) % 3) * s;
    const pts = [[hx0(o, cx, s) - 4 * s, sy], [hx0(o, cx, s) + 2 * s, sy], [cx + 3 * s, hem]];
    const N = 7; for (let k = 0; k <= N; k++) { const t = k / N, x = cx + 3 * s + (back - cx - 3 * s) * t, tongue = (k + (o.flut || 0)) % 2 ? 0 : 3 + ((k * 5 + (o.flut || 0)) % 3);
      pts.push([x, hem - tongue * s * 0.9 + t * -2 * s]); }
    pts.push([back + 2 * s, sy + 12 * s]);
    fillPoly(g, pts, clD);
    fillPoly(g, [[hx0(o, cx, s) - 2 * s, sy + 1], [hx0(o, cx, s) + 1 * s, sy + 1], [cx, hem - 4 * s], [back + 5 * s, hem - 6 * s], [back + 4 * s, sy + 12 * s]], cl);
    for (let k = 0; k < 3; k++) rect(g, back + (4 + k * 5) * s, hem - (5 + k % 2 * 2) * s, Math.max(1, s), Math.max(1, s), clD); }   /* moth holes */
  if (o.lying) {   /* on his back across the ground, the blade beside him */
    rect(g, cx - 12 * s, fy - 5 * s, 20 * s, 5 * s, P2.mail); rect(g, cx - 10 * s, fy - 6 * s, 12 * s, 3 * s, P2.cloth); circle(g, cx + 11 * s, fy - 3 * s, 3.2 * s, P2.bone); rect(g, cx + 10 * s, fy - 4 * s, 1, 1, P2.eye);
    line(g, cx - 14 * s, fy - 1, cx - 3 * s, fy - 1, P2.steel, 1); return; }
  /* legs */
  if (o.kneel) { line(g, cx - 2 * s, hip, cx - 7 * s, fy - 1, P2.mailD, Math.max(2, 3 * s)); line(g, cx + 2 * s, hip, cx + 8 * s, hip + 2 * s, P2.mailD, Math.max(2, 3 * s)); line(g, cx + 8 * s, hip + 2 * s, cx + 8 * s, fy - 1, P2.mailD, Math.max(2, 3 * s)); }
  else { line(g, cx - 2 * s, hip, cx - 3 * s - legA * 3 * s, fy - 2, P2.mailD, Math.max(2, 3 * s)); line(g, cx + 2 * s, hip, cx + 3 * s + legA * 3 * s, fy - 2, P2.mail, Math.max(2, 3 * s)); }
  rect(g, cx - 5 * s - legA * 3 * s, fy - 2 * s, 5 * s, 2 * s, P2.boot); rect(g, cx + 1 * s + legA * 3 * s, fy - 2 * s, 5 * s, 2 * s, P2.boot);
  /* back arm */
  if (o.back) line(g, hx - 3 * s, sh + 2 * s, cx + o.back[0] * s, fy + o.back[1] * s, P2.mailD, Math.max(2, 2.5 * s));
  /* torso: mail, and the tabard over it */
  fillPoly(g, [[hx - 5 * s, sh], [hx + 5 * s, sh], [cx + 4 * s, hip + 1], [cx - 4 * s, hip + 1]], P2.mail);
  fillPoly(g, [[hx - 3 * s, sh + 2 * s], [hx + 3 * s, sh + 2 * s], [cx + 4 * s, hip + 5 * s], [cx - 4 * s, hip + 5 * s]], P2.cloth, P2.clothD);
  rect(g, cx - 5 * s, hip - 1, 10 * s, Math.max(1, s), P2.belt);
  if (P2.mark) rect(g, hx - 1 * s, sh + 4 * s, 2 * s, 3 * s, P2.mark);
  /* head: a helm with the face gone */
  const hy = sh - 5 * s;
  if (o.helm === 'great' && !o.crest) { rect(g, hx - 4 * s, hy - 5 * s, 8 * s, 9 * s, P2.steel); rect(g, hx - 4 * s, hy - 1 * s, 8 * s, Math.max(1, s), '#101018'); rect(g, hx + 1 * s, hy - 1 * s, 2 * s, Math.max(1, s), P2.eye); rect(g, hx - 1 * s, hy - 8 * s, 2 * s, 3 * s, P2.plume || P2.steel); }   /* (the Standard-Bearer keeps his: he is leaving the field, Daniel 2026-09-24) */
  else if (o.helm === 'great') {
    /* A GREAT HELM, NOT A BOX (2026-09-24, POLISH): an 8x9 rectangle read as a crate on his shoulders. Now: a crown that narrows, cheeks that
       swell and a skirt that flares onto the gorget, lit down its facing edge and dark down its back; a visor slit with the eyes in it,
       breaths punched under it on the side he faces, a ridge down the middle, and a crest - a torn
       iron fin and a horn of bone. The Death Knight's only: the Standard-Bearer is leaving the field and keeps his old one. */
    const u = Math.max(1, s), lo = P2.steelD || P2.mailD, hi = P2.steelL || '#c8ccd4';
    if (o.crest === 'fin') { fillPoly(g, [[hx - 3 * s, hy - 4 * s], [hx + 2 * s, hy - 4 * s], [hx + 1 * s, hy - 8 * s], [hx - 0.5 * s, hy - 6.5 * s], [hx - 2 * s, hy - 10 * s], [hx - 3.5 * s, hy - 7 * s], [hx - 5 * s, hy - 8.5 * s]], P2.plume);
      line(g, hx - 3.5 * s, hy - 2 * s, hx - 7 * s, hy - 5 * s, P2.bone, Math.max(2, 1.5 * s)); line(g, hx - 7 * s, hy - 5 * s, hx - 7.5 * s, hy - 8 * s, P2.bone, u); }
    fillPoly(g, [[hx - 2.5 * s, hy - 5.5 * s], [hx + 2.5 * s, hy - 5.5 * s], [hx + 4 * s, hy - 3.5 * s], [hx + 4.5 * s, hy + 2.5 * s], [hx + 5.5 * s, hy + 4.5 * s], [hx - 5.5 * s, hy + 4.5 * s], [hx - 4.5 * s, hy + 2.5 * s], [hx - 4 * s, hy - 3.5 * s]], P2.steel);
    fillPoly(g, [[hx - 2.5 * s, hy - 5.5 * s], [hx - 1 * s, hy - 5.5 * s], [hx - 2.5 * s, hy + 4.5 * s], [hx - 5.5 * s, hy + 4.5 * s], [hx - 4.5 * s, hy + 2.5 * s], [hx - 4 * s, hy - 3.5 * s]], lo);   /* its back, in shadow */
    line(g, hx + 3.5 * s, hy - 3.5 * s, hx + 4 * s, hy + 2 * s, hi, u);   /* the lit edge on the side he faces */
    line(g, hx + 0.5 * s, hy - 5 * s, hx + 0.5 * s, hy - 2 * s, hi, u);   /* the ridge */
    rect(g, hx - 4 * s, hy - 1.5 * s, 8.5 * s, u, '#101018'); rect(g, hx + 1 * s, hy - 1.5 * s, 2.5 * s, u, P2.eye);   /* the visor slit, and his eyes in it */
    for (let k = 0; k < 3; k++) rect(g, hx + (1.5 + (k % 2) * 1.5) * s, hy + (1 + k) * s, u, u, '#101018');   /* the breaths */
    rect(g, hx - 5.5 * s, hy + 3.5 * s, 11 * s, u, lo); }
  else if (o.helm === 'hood') { circle(g, hx, hy, 4.5 * s, P2.clothD); circle(g, hx + 0.5 * s, hy + 0.5 * s, 3 * s, '#141018'); rect(g, hx + 1 * s, hy, Math.max(1, s), Math.max(1, s), P2.eye); rect(g, hx - 1.5 * s, hy, Math.max(1, s), Math.max(1, s), P2.eye); }
  else { circle(g, hx, hy, 4 * s, P2.bone); rect(g, hx - 4 * s, hy - 4 * s, 8 * s, 3 * s, P2.steel); rect(g, hx + 1 * s, hy - 1 * s, 2 * s, 2 * s, '#101018'); rect(g, hx + 1.5 * s, hy - 0.5 * s, 1, 1, P2.eye); rect(g, hx - 1 * s, hy + 2 * s, 3 * s, 1, '#6a6450'); }
  /* front arm */
  if (o.front) line(g, hx + 3 * s, sh + 2 * s, cx + o.front[0] * s, fy + o.front[1] * s, P2.mail, Math.max(2, 2.5 * s));
}
function setOf(frames, w, h, ax, ay, bw, bh) { const Rr = frames.map(c => outline(c)); const W = Rr.map(c => whiten(c)); return { R: Rr, L: Rr.map(flipX), white: { R: W, L: W.map(flipX) }, ax, ay, w: bw, h: bh }; }
const SOLDIER = { mail: '#7a8088', mailD: '#565c66', cloth: '#7a2a28', clothD: '#5a1e1e', belt: '#4a3a26', boot: '#2e2a28', bone: '#d8d2b8', steel: '#8a8e98', eye: '#c8b6ff', mark: '#c8a44a' };
/* THE FALLEN: a man of the order's army in rotten mail and what is left of the red, the violet in his eyes where the banner reached him */
export function bakeCorpse() {
  const F = [];
  for (let f = 0; f < 8; f++) { const [c, g] = canvas(34, 36), cx = 14, fy = 35;
    if (f === 0) figure(g, { cx: cx + 2, fy, pal: SOLDIER, lying: true });
    else if (f === 1) { figure(g, { cx, fy, pal: SOLDIER, kneel: true, lean: 2, front: [8, -2], back: [-6, -6] }); line(g, cx + 8, fy - 2, cx + 16, fy - 1, SOLDIER.steel, 1); }
    else { const walk = f === 3 ? 1 : f === 4 ? -1 : 0, tell = f === 5, cut = f === 6, hurt = f === 7;
      const hand = tell ? [-2, -30] : cut ? [14, -10] : [7, -13];
      figure(g, { cx: cx - (hurt ? 2 : 0), fy, pal: SOLDIER, stride: walk, lean: hurt ? -3 : tell ? -1 : 1, front: hand, back: [-5, -9] });
      /* the blade he died holding */
      const bx = cx + hand[0], by = fy + hand[1];
      if (tell) line(g, bx, by, bx - 6, by - 11, SOLDIER.steel, 2); else if (cut) line(g, bx, by, bx + 12, by + 4, SOLDIER.steel, 2); else line(g, bx, by, bx + 9, by - 7, SOLDIER.steel, 2); }
    F.push(c); }
  return setOf(F, 34, 36, 14, 35, 10, 24);
}
const BEARER = { ...SOLDIER, cloth: '#9a3028', clothD: '#6a2020', mail: '#6e747e', eye: '#d0b8ff' };
/* THE BANNER-BEARER: the same army, carrying the thing that gets them up - a torn standard on a pole twice his height */
export function bakeBannerbearer() {
  const F = [];
  for (let f = 0; f < 8; f++) { const [c, g] = canvas(44, 64), cx = 18, fy = 63;
    const walk = f === 1 ? 1 : f === 2 ? -1 : 0, plant = f === 3, guard = f === 4, tell = f === 5, pole = f === 6, hurt = f === 7;
    const hand = plant ? [4, -34] : tell ? [-4, -20] : pole ? [16, -14] : guard ? [8, -16] : [6, -18];
    figure(g, { cx: cx - (hurt ? 2 : 0), fy, pal: BEARER, helm: 'hood', stride: walk, lean: hurt ? -3 : tell ? -2 : 0, front: hand, back: plant ? [2, -30] : [-5, -10] });
    const bx = cx + hand[0], by = fy + hand[1];
    if (guard || tell || pole) { const tx = pole ? bx + 16 : tell ? bx - 6 : bx + 2, ty = pole ? by - 2 : tell ? by - 8 : by - 22; line(g, bx - (pole ? 6 : 0), by + (pole ? 0 : 10), tx, ty, '#4a3222', 2); rect(g, tx - 1, ty - 2, 3, 3, '#d8b04a'); }   /* the pole alone: his standard is in the ground */
    else { /* carried: the pole up past his head and the red on it */ const top = plant ? by - 26 : by - 30; line(g, bx, by + 12, bx + (plant ? 0 : 2), top, '#4a3222', 2); rect(g, bx - 1 + (plant ? 0 : 2), top - 3, 3, 3, '#d8b04a');
      for (let i = 0; i < 12; i++) rect(g, bx + (plant ? 1 : 3) + i, top + 1 + (i > 8 ? (i % 2) : 0) + Math.round(Math.sin(i * 0.7 + f) * 1), 1, 9 - (i > 8 ? (i % 2) * 3 : 0), i % 4 === 0 ? '#a8342c' : '#8e2a26');
      rect(g, bx + (plant ? 3 : 5), top + 3, 4, 2, '#e8c35a'); }
    F.push(c); }
  return setOf(F, 44, 64, 18, 63, 12, 26);
}
const HERALD = { mail: '#7a7488', mailD: '#58526a', cloth: '#8e2a26', clothD: '#5e1a1a', belt: '#c8a44a', boot: '#2a2630', bone: '#e0dac0', steel: '#9a9eaa', eye: '#e0c8ff', mark: '#e8c35a', plume: '#a8342c' };
/* THE STANDARD-BEARER: a herald twice a man's height, in the order's red and gold, with the army's great banner */
export function bakeStandardBearer() {
  const F = [];
  for (let f = 0; f < 11; f++) { const [c, g] = canvas(80, 98), cx = 34, fy = 97, s = 1.9;
    const walk = f === 1 ? 1 : f === 2 ? -1 : 0, stell = f === 3, sweep = f === 4, ctell = f === 5, charge = f === 6, ptell = f === 7, planted = f === 8, torn = f === 9, hurt = f === 10;
    const hand = stell ? [-6, -40] : sweep ? [22, -22] : ctell ? [8, -26] : charge ? [14, -22] : ptell ? [4, -58] : planted ? [10, -26] : torn ? [10, -12] : [8, -34];
    figure(g, { cx: cx - (hurt ? 3 : 0), fy, s, pal: HERALD, helm: 'great', stride: walk, kneel: torn, lean: hurt ? -3 : stell ? -2 : ctell || charge ? 3 : 0, front: hand.map(v => v / s), back: ptell ? [2 / s, -54 / s] : [-10 / s, -20 / s] });
    const bx = cx + hand[0], by = fy + hand[1];
    if (planted || torn) { /* hands empty: the banner is in the ground, drawn by the world */ }
    else if (ctell || charge) { line(g, bx - 16, by + 4, bx + 40, by + (ctell ? 6 : 10), '#4a3222', 3); for (let i = 0; i < 18; i++) rect(g, bx - 14 + i, by + 6 + Math.round(Math.sin(i * 0.6 + f) * 1.5), 1, 12 - (i > 13 ? (i % 2) * 4 : 0), i % 4 === 0 ? '#a8342c' : '#8e2a26'); rect(g, bx + 38, by + 4, 5, 5, '#d8b04a'); }
    else if (sweep) { line(g, bx - 20, by - 6, bx + 30, by + 6, '#4a3222', 3); rect(g, bx + 28, by + 4, 5, 5, '#d8b04a'); }
    else { const top = by - (stell ? 26 : 36); line(g, bx, by + 22, bx + 2, top, '#4a3222', 3); rect(g, bx, top - 4, 5, 5, '#d8b04a');
      for (let i = 0; i < 22; i++) rect(g, bx + 4 + i, top + 1 + Math.round(Math.sin(i * 0.5 + f) * 1.5), 1, 18 - (i > 17 ? (i % 2) * 5 : 0), i % 5 === 0 ? '#a8342c' : '#8e2a26');
      rect(g, bx + 9, top + 5, 8, 3, '#e8c35a'); rect(g, bx + 12, top + 8, 2, 7, '#e8c35a'); }
    F.push(c); }
  return setOf(F, 80, 98, 34, 97, 22, 48);
}
const KNIGHT = { steelD: '#38423e', steelL: '#8a9892', mail: '#3e4a44', mailD: '#2a322e', cloth: '#1e2622', clothD: '#141a18', belt: '#6a5a3a', boot: '#161a18', bone: '#c8d0c0', steel: '#5a6660', eye: '#9ff0c0', mark: '#9ff0c0', plume: '#2a3a34' };
/* THE FIRST DEATH KNIGHT: black-green plate, the eyes the class wears, and the scythe - long enough to reach a room */
export function bakeDeathKnight() {
  const F = [];
  for (let f = 0; f < 14; f++) { const [c, g] = canvas(96, 84), cx = 42, fy = 83, s = 2;
    const walk = f === 1 ? 1 : f === 2 ? -1 : 0, stell = f === 3, sw = f === 4, rtell = f === 5, reap = f === 6, ptell = f === 7, pass = f === 8, raise = f === 9, ctell = f === 10, cut = f === 11, open = f === 12, hurt = f === 13;
    const hand = stell ? [-14, -40] : sw ? [24, -24] : rtell ? [2, -56] : reap ? [-20, -26] : ptell ? [10, -22] : pass ? [18, -30] : raise ? [6, -60] : ctell ? [-6, -44] : cut ? [18, -18] : open ? [16, -8] : [10, -30];
    figure(g, { cx: cx - (hurt ? 4 : 0), fy, s, pal: KNIGHT, helm: 'great', crest: 'fin', cloak: ['#1c2420', '#0c100e'], flut: f, stride: walk, kneel: open || ptell, lean: hurt ? -4 : stell ? -3 : pass ? 5 : sw ? 3 : 0, front: hand.map(v => v / s), back: raise ? [-12 / s, -58 / s] : [-10 / s, -22 / s] });
    const bx = cx + hand[0], by = fy + hand[1];
    /* the scythe: a long haft, and the blade hung off the top of it the way the hero's is */
    const ang = stell ? -2.5 : sw ? 0.25 : rtell ? -1.6 : reap ? 2.9 : ptell ? 0.1 : pass ? -0.2 : raise ? -1.5 : ctell ? -2.2 : cut ? 0.6 : open ? 0.35 : -1.25;
    const L1 = 34, tx = bx + Math.cos(ang) * L1, ty = by + Math.sin(ang) * L1, ex = bx - Math.cos(ang) * 14, ey = by - Math.sin(ang) * 14;
    /* THE SCYTHE, READ AT A GLANCE (2026-09-24, POLISH): a haft three pixels through with its lit side, a steel collar where the blade is
       socketed, and the blade a real crescent - broad at the heel, curving to a point, a bright cutting edge and a dark back - where it
       was a thin grey sliver the plate swallowed. Same angles, same hands, frame for frame: only the picture of it changed. */
    line(g, ex, ey, tx, ty, '#3a2e24', 3); line(g, ex + 1, ey, tx + 1, ty, '#6a5440', 1);
    const bl = [Math.cos(ang + 1.9), Math.sin(ang + 1.9)], ca = Math.cos(ang), sa = Math.sin(ang), BL = 27;
    const bpt = (k, off) => [tx + bl[0] * k + ca * off, ty + bl[1] * k + sa * off];
    fillPoly(g, [bpt(0, 4), bpt(8, 6), bpt(17, 6), bpt(BL, 3), bpt(BL - 4, -1), bpt(14, -2), bpt(5, -3), bpt(0, -3)], '#b8c4bc');
    line(g, ...bpt(0, 4), ...bpt(8, 6), '#e8f4ec', 1); line(g, ...bpt(8, 6), ...bpt(17, 6), '#e8f4ec', 1); line(g, ...bpt(17, 6), ...bpt(BL, 3), '#e8f4ec', 1);   /* the edge */
    line(g, ...bpt(5, -3), ...bpt(BL - 4, -1), '#6e7a74', 1);   /* its back */
    rect(g, tx - 2, ty - 2, 4, 4, '#8a968e');   /* the collar */
    if (raise) for (let i = 0; i < 5; i++) rect(g, cx - 18 + i * 9, fy - 4 - (i % 2) * 3, 2, 3, '#9ff0c0');
    if (open) rect(g, bx + 8, fy - 6, 10, 5, '#5a5a4a');   /* the blade is in one of his own */
    F.push(c); }
  return setOf(F, 96, 84, 42, 83, 24, 52);
}
/* the world's own props (cover, engines) are drawn live in drawField; this bakes one sheet of everything for the PNG review */
export function bakeAll() { return { bannerbearer: bakeBannerbearer(), corpse: bakeCorpse(), standardbearer: bakeStandardBearer(), deathknight: bakeDeathKnight() }; }
