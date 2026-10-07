// hedge-warden.js — THE HEDGE WARDEN, the Witchlight Stair's mini (batch 4c, 2026-09-22). Brief: .claude/briefs/witchlight-stair.md.
// A giant topiary knight at the tower's garden gate, clipped box hedge for armour and a hedge-sword. He is fought between
// two WITCHLIGHT BRAZIERS (witchlight.js). His art: src/redraw/queue_bosses.js (bakeHedgeWarden).
//   THE CUT         !    the sword up over the helm and down in front: guard it, or step back out of it
//   THE RUSH        !    he stamps and charges the length of his reach with the blade out: guard it, or jump him
//   THORNS          ✕    arms flung wide, thorns bristle all round him and burst: too many to guard - get out of reach
//   THE THORN LASH  !    (claude/hedgewarden2) the sword arm drawn back and a thorn vine coiling off the blade, then the vine
//                        cracks along the lawn a room's third out in front of him: guard it, or jump it. Standing off him is no
//                        answer to it
//   THE ROOTS       ✕    (claude/hedgewarden2) the sword lifted point-down and driven into the lawn: a root crawls out along the floor
//                        at you (in phase two, both ways). No shield turns it: jump it - or stand at a brazier, where the
//                        witch-fire burns it out. The garden before his gate teaches it (witchlight.js, THE ROOTED GARDEN)
// HE GROWS BACK. His health is three GROWTHS. Cut a growth down to its root and he falls to a STUMP, and the stump regrows:
// cut the root out before it is up and that growth is gone for good; let it grow and he stands again - but on only what is left
// of his root (claude/hedgewarden3: DAMAGE DONE STAYS DONE, his bar never goes up. It used to grow the whole growth back, and
// Daniel's playtest read that as him healing for no reason). The last growth's root is his life.
// THE OPENING IS YOURS, AND IT IS THE ONLY ONE (tools/boss-openings.mjs proves it): he follows you. Cut him down BESIDE A
// BRAZIER and the witch-fire takes the stump: it burns, open - every blow on it counts twice, and it cannot regrow while it
// burns. Cut down on the open lawn, the stump is GREEN WOOD: a blow only chips it, a quarter (claude/hedgewarden3; it took nothing
// in claude/hedgewarden2), it puffs smoke, and the hint says GREEN WOOD: DRIVE HIM TO THE FIRE. Up again on a green root, a blow on
// the lawn still only chips it, and a blow beside a brazier fells him there, burning. While he is up his two braziers pulse.
// The fire is the big payoff (a burning stump takes a blow twice over); the lawn is the slow way, and it does get there.
// PHASE TWO (the last growth): he is quicker, the thorns reach further, his roots go out both ways, and a stump that regrows
// throws off a topiary cutting.
// Touching him never hurts (the touch rule): his damage is his sword, his rush, his thorns, his lash and his roots.
export const HEDGE = {
  hp: 900,   /* (claude/sweep3: 600 - with his quicker blows the fight needed a little more of him: band 70-75%) */   /* 486 until claude/hedgewarden4 (his told opening made him a duel: measured 93% at 486, band 70-75%); /* 420 until claude/hedgewarden2 (+16%, Daniel's playtest 2026-09-28: "a bit harder"); main.js EHP reads it */
  walk: 30, keep: 34, cd: 0.85, cdP2: 0.65,   /* (claude/sweep3: 1.3 / 0.95 - a breath between blows long enough that the standard bot met every one) */
  tell: { cut: 0.62, rush: 0.6, thorn: 0.75, lash: 0.66, roots: 0.75 },   /* (claude/sweep3: 0.85 / 0.8 / 1.0 / 0.9 / 0.95 - the standard bot met every one and took nothing) */
  dmg: { cut: 41, rush: 35, thorn: 35, lash: 35, roots: 28 },   /* (claude/sweep3: 16/14/14/14/12 until the standard bot won 12/12 at L28 taking 0-117 of ~245; band 70-75%) */
  cutReach: 50, rushV: 150, rushT: 0.6, thornR: 46, thornRP2: 58,
  lashReach: 150, lashT: 0.35, low: 10,                /* the lash and the roots run along the lawn: feet more than `low` px up are over them */
  rootV: 120, rootHalf: 9, fireStop: 12, rootWarn: 0.8, rootsT: 0.5,   /* a root's speed, its head's half-width, how near a fire burns it, a garden hedge's warning */
  growths: 3, root: 0.14, regrow: 4.6, regrowP2: 3.8, burnT: 3.2, burnMul: 2, greenMul: 0.25, brazierNear: 44, cuttings: 2,
  stuck: 3.0, stuckMul: 1.35, reopen: 2.5, answerNear: 80,   /* claude/hedgewarden4: ANSWER HIM AND HE IS OPEN for `stuck` s (his blows pay x`stuckMul`); not again for `reopen` s after; a root burning out within `answerNear` of you is answered */   /* greenMul: what a blow on green wood takes (claude/hedgewarden3) */
  order: ['cut', 'lash', 'rush', 'cut', 'thorn', 'roots', 'rush', 'cut', 'lash', 'thorn', 'roots'],
};
const TELL = { cut: 'cutTell', rush: 'rushTell', thorn: 'thornTell', lash: 'lashTell', roots: 'rootsTell' };
const SAY = { cutTell: 'THE CUT', rushTell: 'HE CHARGES', thornTell: 'THORNS: GET CLEAR', lashTell: 'THE THORN LASH', rootsTell: 'THE ROOTS: JUMP, OR GET TO THE FIRE' };
const RED = new Set(['thorn', 'roots']);
export const hedgeOpen = e => (e.burnT || 0) > 0 || (e.stuckT || 0) > 0;   /* burning stump, or ANSWERED (sword stuck in the lawn / parried) */
const STUMP = new Set(['felled', 'stump']);
export const hedgeStump = e => STUMP.has(e.mode);
/* the thirds of his bar: the floor of the growth he is on, and where its root starts */
const third = e => e.maxHp / HEDGE.growths;
const floorOf = e => Math.max(0, e.maxHp - third(e) * ((e.growth || 0) + 1));
const rootOf = e => floorOf(e) + e.maxHp * HEDGE.root;
/* the frames of bakeHedgeWarden: 0 stand | 1,2 walk | 3 cut tell | 4 cut | 5 thorn tell | 6 thorns | 7 stump | 8,9 regrowing |
   10 lash tell | 11 roots tell | 12 roots (the sword in the lawn) */
export function hedgeFrame(e) {
  switch (e.mode) {
    case 'cutTell': return 3; case 'cut': return 4; case 'rush': return 4; case 'rushTell': return 1 + Math.floor((e.anim || 0) * 12) % 2;
    case 'stuck': return 12;
    case 'thornTell': return 5; case 'thorn': return 6; case 'felled': return 7;
    case 'lashTell': return 10; case 'lash': return 4; case 'rootsTell': return 11; case 'roots': return 12;
    case 'stump': { const k = e.regrowK || 0; return k < 0.4 ? 7 : k < 0.75 ? 8 : 9; }
    case 'sleep': case 'wake': return 0;
  }
  return Math.abs(e.vx || 0) > 3 ? 1 + Math.floor((e.anim || 0) * 5) % 2 : 0;
}
/* HIS HEALTH, three growths deep: called by hurtEnemy0 with the blow's damage, returns what comes off the bar. Standing, no
   blow takes him past his root (it fells him there). His ROOT is the wood: burning, it takes a blow twice over; green (a stump
   on the open lawn, or him up again on what is left of his root) it takes a quarter, and up on a green root he is felled again
   only by a blow beside a brazier (e.atFire). The last growth's root is his life, so only there does the bar reach nothing. */
export function hedgeTake(e, dmg) {
  if (!(dmg > 0) || e.mode === 'sleep') return dmg;
  if (hedgeStump(e) || e.greenUp) { const fl = floorOf(e);
    if (!hedgeStump(e) && e.atFire) e.fell = true;                              /* up on a green root and cut beside the fire: down he goes, there */
    if ((e.burnT || 0) > 0) dmg = Math.round(dmg * HEDGE.burnMul); else { e.green = true; dmg = Math.max(1, Math.round(dmg * HEDGE.greenMul)); }
    if (e.hp - dmg <= fl) { e.rooted = true; return fl > 0 ? Math.max(0, e.hp - fl) : dmg; } return dmg; }
  if ((e.stuckT || 0) > 0) dmg = Math.round(dmg * HEDGE.stuckMul);                 /* ANSWERED: his sword is stuck, every blow pays more */
  const r = rootOf(e); if (e.hp - dmg <= r) { e.fell = true; return Math.max(0, e.hp - r); }
  return dmg;
}
const GREEN = 'GREEN WOOD: DRIVE HIM TO THE FIRE';
/* THE ROOT CUT OUT (from a stump, or from him up on a green root): that growth is gone for good, and he wakes on the next */
function rootedOut(e, c) { e.rooted = false; e.greenUp = false;
  if (floorOf(e) <= 0) return;                                                  // the last root: the blow that took it kills him (the engine's)
  e.growth++; e.hp = floorOf(e) + third(e); e.hp = Math.min(e.hp, e.maxHp - third(e) * e.growth); e.burnT = 0;
  if (e.growth >= HEDGE.growths - 1 && e.phase !== 2) { e.phase = 2; c.say('THE LAST GROWTH: HE IS QUICKER', true); }
  c.say('ROOTED OUT', false, true); c.sound('crack'); c.shake(5); e.mode = 'wake'; e.modeT = 1.1; e.regrowK = 1; }
/* HIS BRAZIERS CALL while he is up (claude/hedgewarden3): 1 while he stands, 0 while he sleeps, lies a stump or is dead */
export const brazierCall = e => (e && e.alive && e.mode !== 'sleep' && !hedgeStump(e)) ? 1 : 0;
let lastC = null;
/* ANSWERED: his cut guarded on the beat, his lash or rush jumped, his root jumped or burnt out at your fire - he is OPEN for HEDGE.stuck s, his sword stuck in the lawn (claude/hedgewarden4) */
export function hedgeAnswered(e, how) {
  const c = lastC; if (!c || !e || !e.alive || hedgeStump(e) || e.mode === 'sleep' || e.mode === 'wake' || e.mode === 'stuck' || (e.reopenCd || 0) > 0) return false;
  e.mode = 'stuck'; e.stuckT = HEDGE.stuck; e.vx = 0; e.rushHit = true; e.how = how;
  c.say(how === 'roots' ? 'HIS SWORD IS STUCK: OPEN' : 'ANSWERED: HE IS OPEN', false, true); c.sound('crack'); c.shake(3); return true; }
function begin(e, what, c) { e.mode = TELL[what]; e.modeT = HEDGE.tell[what] * (e.phase === 2 ? 0.85 : 1); e.face = Math.sign(c.P.x - e.x) || e.face || 1; c.say(SAY[e.mode], RED.has(what)); }
const rest = (e, rnd) => { e.mode = 'stalk'; e.vx = 0; e.cd = (e.phase === 2 ? HEDGE.cdP2 : HEDGE.cd) * (0.8 + 0.4 * rnd()); };
export function updateHedgeWarden(e, dt, c) {
  const { P, A, hit } = c, floor = A.floor, rnd = c.rnd || Math.random;
  if (!e.alive || e.mode === 'sleep') return;
  e.anim = (e.anim || 0) + dt; e.modeT -= dt; e.cd = (e.cd ?? 1) - dt; e.turn ??= 0; e.growth ??= 0; e.y = floor;
  lastC = c; e.reopenCd = Math.max(0, (e.reopenCd || 0) - dt); e.burnT = Math.max(0, (e.burnT || 0) - dt); e.stuckT = Math.max(0, (e.stuckT || 0) - dt); e.open = Math.max(e.burnT, e.stuckT); e.greenT = Math.max(0, (e.greenT || 0) - dt);
  e.atFire = (c.braziers() || []).some(bx => Math.abs(bx - e.x) < HEDGE.brazierNear);
  if (e.green) { e.green = false; if (c.smoke) c.smoke(e.x, floor - 8);         /* a blow on green wood: it smokes, and now and then says so */
    if (e.greenT <= 0) { e.greenT = 2.5; c.say(GREEN, false); c.sound('thud'); } }
  if (e.rooted && !hedgeStump(e)) { rootedOut(e, c); return; }                  /* up on a green root and it is chipped out: the growth goes, as from a stump */
  if (e.mode === 'wake') { if (e.modeT <= 0) { e.mode = 'stalk'; e.cd = 0.8; if (!e.dealt) { e.dealt = true; e.turn = Math.floor(rnd() * HEDGE.order.length); } } return; }   /* where in his order he starts is his own, fight to fight */
  /* a blow (or a bleed) that took him under his root while he stood fells him there */
  /* (no Math.max back up to his root any more: a bleed that took him under it stays taken - damage done stays done) */
  if (!hedgeStump(e) && (e.fell || (!e.greenUp && e.hp <= rootOf(e)))) { e.fell = false;
    e.mode = 'felled'; e.modeT = 0.5; e.regrowK = 0; e.rooted = false; e.vx = 0; e.stuckT = 0; c.say('CUT DOWN TO THE STUMP', false, true); c.sound('crack'); c.shake(4); c.dust(e.x, floor);
    if (e.atFire) { e.burnT = HEDGE.burnT; e.open = e.burnT; c.say('THE WITCH-FIRE TAKES THE STUMP', false, true); c.sound('fire'); }
    else if (c.teach) c.teach(GREEN);                                           /* felled on the open lawn: the hint says what to do */
    return; }
  // ---- THE STUMP: it regrows unless the root is cut out ----
  if (hedgeStump(e)) {
    if (e.rooted || e.hp <= floorOf(e)) { rootedOut(e, c); return; }
    if (e.mode === 'felled') { if (e.modeT <= 0) { e.mode = 'stump'; e.modeT = e.phase === 2 ? HEDGE.regrowP2 : HEDGE.regrow; } return; }
    if (e.burnT > 0) { e.modeT += dt; return; }                                // burning: it does not grow
    const T0 = e.phase === 2 ? HEDGE.regrowP2 : HEDGE.regrow; e.regrowK = Math.max(0, Math.min(1, 1 - e.modeT / T0));
    if (e.modeT <= 0) { e.greenUp = true; e.mode = 'stalk'; e.cd = 0.9; c.say('HE STANDS AGAIN', true); c.sound('grow');   /* up, on what is left of his root: nothing grows back */
      if (e.phase === 2 && c.adds() < HEDGE.cuttings) c.sprout(e.x + (Math.random() < 0.5 ? -40 : 40)); }
    return; }
  // ---- ANSWERED: stood still, sword in the lawn, open ----
  if (e.mode === 'stuck') { e.vx = 0; e.open = e.stuckT; if (e.stuckT <= 0) { e.mode = 'stalk'; e.cd = 1.1; e.reopenCd = HEDGE.reopen; } return; }
  // ---- THE ATTACKS ----
  if (e.mode === 'cutTell' || e.mode === 'rushTell' || e.mode === 'thornTell' || e.mode === 'lashTell' || e.mode === 'rootsTell') {
    if (e.mode !== 'rushTell') e.face = Math.sign(P.x - e.x) || e.face;
    if (e.modeT > 0) return;
    if (e.mode === 'cutTell') { e.mode = 'cut'; e.modeT = 0.4; c.sound('heavy'); c.shake(2);
      const dx = (P.x - e.x) * e.face; if (!P.dead && dx > -8 && dx < HEDGE.cutReach && Math.abs(P.y - floor) < 34) { const res = hit(e.x, HEDGE.dmg.cut, false, 'THE CUT'); if (c.answered && c.answered(res)) hedgeAnswered(e, 'cut'); } return; }
    if (e.mode === 'rushTell') { e.mode = 'rush'; e.modeT = HEDGE.rushT; e.rushHit = false; c.sound('whoosh'); return; }
    if (e.mode === 'thornTell') { e.mode = 'thorn'; e.modeT = 0.35; c.sound('thorn'); c.shake(3);
      const R = e.phase === 2 ? HEDGE.thornRP2 : HEDGE.thornR; if (!P.dead && Math.abs(P.x - e.x) < R && P.y > floor - 44) hit(e.x, HEDGE.dmg.thorn, true, 'THE THORNS'); return; }
    /* THE THORN LASH: the vine cracks along the lawn in front of him, the length of a room's third; over it is safe, and a shield */
    if (e.mode === 'lashTell') { e.mode = 'lash'; e.modeT = HEDGE.lashT; c.sound('whoosh'); c.shake(2);
      const dx = (P.x - e.x) * e.face; if (!P.dead && dx > -8 && dx < HEDGE.lashReach && P.y > floor - HEDGE.low) { const res = hit(e.x, HEDGE.dmg.lash, false, 'THE THORN LASH'); if (c.answered && c.answered(res)) hedgeAnswered(e, 'lash'); }
      else if (!P.dead && dx > -8 && dx < HEDGE.lashReach && P.y <= floor - HEDGE.low) hedgeAnswered(e, 'lash');   /* jumped over it */
      return; }
    /* THE ROOTS: the sword goes into the lawn and a root crawls out at you (phase two: one each way) - stepRoots runs it */
    if (e.mode === 'rootsTell') { e.mode = 'roots'; e.modeT = HEDGE.rootsT; c.sound('crack'); c.shake(3); c.dust(e.x + e.face * 14, floor);
      if (c.roots) { c.roots(e.x + e.face * 14, e.face); if (e.phase === 2) c.roots(e.x - e.face * 14, -e.face); } return; }
  }
  if (e.mode === 'rush') { const nx = e.x + e.face * HEDGE.rushV * dt; e.vx = e.face * HEDGE.rushV;
    if (nx > A.x0 + 16 && nx < A.x1 - 16) e.x = nx; else e.modeT = 0;
    if (!e.rushHit && !P.dead && Math.abs(P.x - e.x) < 20 && Math.abs(P.y - floor) < 30) { e.rushHit = true; const res = hit(e.x, HEDGE.dmg.rush, false, 'THE RUSH'); if (c.answered && c.answered(res)) { hedgeAnswered(e, 'rush'); return; } }
    else if (!e.rushHit && !P.dead && Math.abs(P.x - e.x) < 20 && !(P.y > floor - 30)) { e.rushHit = true; hedgeAnswered(e, 'rush'); return; }   /* jumped clean over him */
    if (e.modeT <= 0) rest(e, rnd); return; }
  if (e.mode === 'cut' || e.mode === 'thorn' || e.mode === 'lash' || e.mode === 'roots') { if (e.modeT <= 0) rest(e, rnd); return; }
  // ---- STALKING: he keeps to his reach and comes on ----
  const d = P.x - e.x, ad = Math.abs(d); e.face = Math.sign(d) || e.face;
  const want = ad > HEDGE.keep ? e.face : 0, nx = e.x + want * HEDGE.walk * (e.phase === 2 ? 1.3 : 1) * dt;
  if (nx > A.x0 + 16 && nx < A.x1 - 16) e.x = nx; e.vx = want * HEDGE.walk;
  if (e.cd > 0 || P.dead) return;
  let what = HEDGE.order[e.turn++ % HEDGE.order.length];
  if (what === 'cut' && ad > HEDGE.cutReach + 40) what = 'rush';
  if (what === 'thorn' && ad > HEDGE.thornR + 50) what = 'rush';
  if (what === 'lash' && ad > HEDGE.lashReach) what = 'rush';
  if (what === 'rush' && ad < 26) what = 'thorn';
  begin(e, what, c);
}

/* ---------- THE ROOTS: his, and the garden's ---------- */
/* A ROOT crawls along a floor from where it broke ground, a hump of thorns at its head and its runner dying back behind it. It
   bites whoever it runs under with their feet on the floor (no shield turns it: jump it), and it BURNS OUT at a witchlight
   brazier - stand at the fire and the roots cannot reach you. `list` is the level's (main.js keeps it on L.hedgeRoots). */
export function rootOut(list, x, y, dir, o = {}) {
  list.push({ x, x0: x, y, dir, v: o.v || HEDGE.rootV, dmg: o.dmg || HEDGE.dmg.roots, lo: o.lo ?? -1e9, hi: o.hi ?? 1e9, hit: false, dead: false, fade: 0, t: 0, boss: !!o.boss });
}
/* one step of every root, and of THE ROOTED GARDEN's hedges (witchlight.js WL.ROOTS: they put out a root every `period` s while the
   hero is near, after `rootWarn` s of shivering). c: { P, fires: [{x, y}] (px), hit(x, dmg), sound(k), burn(x, y), blocked(x, y) } */
export function stepRoots(list, emitters, dt, c) {
  const { P } = c, TS = 16;
  for (const m of emitters || []) { const mx = m.x * TS + 8, my = (m.row + 1) * TS;
    m.t = (m.t ?? m.phase) - dt; const near = !P.dead && Math.abs(P.x - mx) < 26 * TS && Math.abs(P.y - my) < 8 * TS;
    m.tell = near && m.t < HEDGE.rootWarn ? Math.min(1, 1 - m.t / HEDGE.rootWarn) : 0;
    if (m.t <= 0) { m.t += m.period; if (near) { rootOut(list, mx, my, m.dir, { dmg: m.dmg, lo: Math.min(m.x, m.to) * TS, hi: (Math.max(m.x, m.to) + 1) * TS }); c.sound('root'); } } }
  for (const r of list) {
    if (r.dead) { r.fade -= dt; continue; }
    r.t += dt; r.x += r.dir * r.v * dt;
    if ((c.fires || []).some(f => Math.abs(f.y - r.y) < 8 && Math.abs(f.x - r.x) < HEDGE.fireStop)) { r.dead = true; r.burnt = true; r.fade = 0.5; c.burn(r.x, r.y); if (r.boss && c.answer && !P.dead && Math.abs(P.x - r.x) < HEDGE.answerNear) c.answer(r, 'roots'); continue; }
    if (r.x <= r.lo || r.x >= r.hi || (c.blocked && c.blocked(r.x + r.dir * 6, r.y))) { r.dead = true; r.fade = 0.4; continue; }
    if (r.boss && !r.hit && !r.passed && !P.dead && Math.abs(P.x - r.x) < HEDGE.rootHalf && P.y <= r.y - HEDGE.low) { r.passed = true; if (c.answer) c.answer(r, 'roots'); }   /* jumped clean over it */
    if (!r.hit && !P.dead && Math.abs(P.x - r.x) < HEDGE.rootHalf && P.y > r.y - HEDGE.low && P.y < r.y + 8) { r.hit = true; list.hits = (list.hits || 0) + 1; c.hit(r.x, r.dmg); }
  }
  for (let i = list.length - 1; i >= 0; i--) if (list[i].dead && list[i].fade <= 0) list.splice(i, 1);
}

/* A WITCHLIGHT BRAZIER: a stone bowl on a post, its witch-fire going */
function drawBrazier(g, x, fy, time, seed, call) {
  if (call) { const k = 0.5 + 0.5 * Math.sin(time * 4);   /* HIS BRAZIERS CALL while he is up (claude/hedgewarden3): a slow bright pulse and a ring going out, "bring him here" */
    g.globalAlpha = 0.18 + 0.22 * k; g.fillStyle = '#b07cf0'; g.beginPath(); g.arc(x, fy - 24, 22 + 6 * k, 0, 7); g.fill();
    const r = (time * 0.9 + seed * 0.013) % 1; g.globalAlpha = 0.5 * (1 - r); g.strokeStyle = '#e0c8ff'; g.lineWidth = 1; g.beginPath(); g.ellipse(x, fy - 1, 10 + 30 * r, 3 + 5 * r, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }
  g.fillStyle = '#1b1626'; g.fillRect(x - 3, fy - 16, 6, 16); g.fillRect(x - 8, fy - 20, 16, 5); g.fillStyle = '#6a6280'; g.fillRect(x - 2, fy - 15, 4, 15); g.fillStyle = '#8e86a4'; g.fillRect(x - 7, fy - 19, 14, 3);
  for (let k = 0; k < 3; k++) { const h = 6 + Math.round(3 * Math.sin(time * 9 + k * 2 + seed)); g.fillStyle = k === 1 ? '#e0c8ff' : '#9a5ad0'; g.fillRect(x - 5 + k * 4, fy - 20 - h, 3, h); }
  g.globalAlpha = 0.12 + 0.05 * Math.sin(time * 5 + seed); g.fillStyle = '#b07cf0'; g.beginPath(); g.arc(x, fy - 24, 16, 0, 7); g.fill(); g.globalAlpha = 1;
}
/* the roots crawling (and burning out), the garden's braziers, and its rooted hedges shivering before they put one out */
export function drawRoots(g, list, W, cx, cy, time) {
  const TS = 16, VW = g.canvas.width;
  for (const [fx, row] of (W && W.fires) || []) { const x = Math.round(fx * TS + 8 - cx); if (x > -20 && x < VW + 20) drawBrazier(g, x, Math.round((row + 1) * TS - cy), time, fx * TS); }
  for (const m of (W && W.roots) || []) { const x = Math.round(m.x * TS + 8 - cx), fy = Math.round((m.row + 1) * TS - cy); if (x < -40 || x > VW + 40) continue;
    const k = m.tell || 0, sh = k > 0 ? (Math.floor(time * 30) % 2 ? 1 : -1) : 0;   /* THE KNOT: gnarled roots at the hedge's foot; it shivers and the lawn cracks toward where the root will run */
    g.fillStyle = '#3a2a1a'; g.fillRect(x - 5 + sh, fy - 5, 10, 5); g.fillStyle = '#5a4020'; g.fillRect(x - 4 + sh, fy - 5, 3, 2); g.fillRect(x + 1 + sh, fy - 4, 3, 2);
    g.fillStyle = '#2a1e12'; for (let q = 0; q < 3; q++) g.fillRect(x - 7 + q * 5 + sh, fy - 2 - (q % 2), 3, 2);
    if (k > 0) { g.globalAlpha = 0.5 + 0.4 * k; g.fillStyle = '#1a120a'; const n = Math.round(k * 28); for (let d = 4; d < n; d += 3) g.fillRect(x + m.dir * d, fy - 1 - ((d >> 2) % 2), 2, 1);
      g.fillStyle = '#8fd160'; for (let q = 0; q < 3; q++) g.fillRect(x - 4 + q * 4 + sh, fy - 7 - Math.round(3 * k) - (q % 2), 1, 2); g.globalAlpha = 1; } }
  for (const r of list || []) { const hx = Math.round(r.x - cx), fy = Math.round(r.y - cy); if (hx < -80 || hx > VW + 80) continue;
    const a = r.dead ? Math.max(0, r.fade * 2) : 1; if (a <= 0) continue; g.globalAlpha = a;
    const back = Math.min(Math.abs(r.x - r.x0), 56);   /* the runner behind the head, dying back */
    for (let d = 2; d < back; d += 2) { const x = hx - r.dir * d, up = (d % 6 === 0) ? 1 : 0; g.fillStyle = d > back - 10 ? '#2a1e12' : '#4a3418'; g.fillRect(x, fy - 2 - up, 2, 2 + up);
      if (d % 8 === 4) { g.fillStyle = '#8a3a2a'; g.fillRect(x, fy - 4, 1, 1); } }
    if (r.burnt) { for (let k = 0; k < 4; k++) { const h = 4 + Math.round(3 * Math.sin(time * 14 + k)); g.fillStyle = k % 2 ? '#e0c8ff' : '#9a5ad0'; g.fillRect(hx - 6 + k * 3, fy - 2 - h, 2, h); } }
    else { const bob = Math.round(2 * Math.sin(time * 18 + r.x0));   /* THE HEAD: a hump of broken turf and thorns */
      g.fillStyle = '#3a2a1a'; g.fillRect(hx - 6, fy - 5, 12, 5); g.fillStyle = '#5a4020'; g.fillRect(hx - 4, fy - 7 - bob, 8, 3);
      for (let k = 0; k < 4; k++) { const tx = hx - 5 + k * 3, h = 4 + ((k * 5 + (bob & 1)) % 4); g.fillStyle = '#6a8a3a'; g.fillRect(tx, fy - 7 - h, 1, h); g.fillStyle = '#ff6b6b'; g.fillRect(tx, fy - 8 - h, 1, 1); }
      g.fillStyle = '#2a1e12'; g.fillRect(hx + r.dir * 6, fy - 3, 2, 1); g.fillRect(hx + r.dir * 8, fy - 2, 2, 1); }
    g.globalAlpha = 1; }
}
/* the braziers, the thorn ring, the lash, the roots' cracks, the stump's burning and its regrowth */
export function drawHedgeWarden(g, e, braziers, cx, cy, time, floorY) {
  const fy = Math.round(floorY - cy);
  const call = brazierCall(e);
  for (const bx of braziers || []) { const x = Math.round(bx - cx); if (x < -40 || x > g.canvas.width + 40) continue; drawBrazier(g, x, fy, time, bx, call); }
  if (!e?.alive) return;
  const x = Math.round(e.x - cx);
  if (e.mode === 'thornTell' || e.mode === 'thorn') { const R = e.phase === 2 ? HEDGE.thornRP2 : HEDGE.thornR, k = e.mode === 'thorn' ? 1 : 0.45; g.globalAlpha = 0.3 * k + (Math.floor(time * 12) % 2 ? 0.1 : 0);
    g.strokeStyle = '#ff6b6b'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, fy - 8, R, 10, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1; }
  /* THE THORN LASH: told, the vine coils back over his shoulder, longer as the tell runs; struck, it lies cracked along the lawn */
  if (e.mode === 'lashTell') { const k = Math.max(0, Math.min(1, 1 - e.modeT / HEDGE.tell.lash)), n = 6 + Math.round(10 * k);
    for (let i = 0; i < n; i++) { const a = -Math.PI / 2 - e.face * (0.3 + i * 0.22), r = 14 + i * 2.2, px = x - e.face * 6 + Math.cos(a) * r, py = fy - 34 + Math.sin(a) * r * 0.8;
      g.fillStyle = i % 3 ? '#4e7a34' : '#86c060'; g.fillRect(Math.round(px), Math.round(py), 2, 2); if (i % 2) { g.fillStyle = '#ff6b6b'; g.fillRect(Math.round(px), Math.round(py) - 1, 1, 1); } } }
  if (e.mode === 'lash') { const k = Math.max(0, e.modeT / HEDGE.lashT); g.globalAlpha = 0.4 + 0.6 * k;
    for (let d = 10; d < HEDGE.lashReach; d += 3) { const px = x + e.face * d, py = fy - 3 - Math.round(2 * Math.sin(d * 0.3 + time * 30) * k); g.fillStyle = d % 9 === 1 ? '#86c060' : '#4e7a34'; g.fillRect(px, py, 3, 2); if (d % 6 === 1) { g.fillStyle = '#ff6b6b'; g.fillRect(px + 1, py - 2, 1, 2); } }
    g.globalAlpha = 1; }
  /* THE ROOTS, told: the lawn cracks and heaves in front of him (both sides in phase two), where they will break out */
  if (e.mode === 'rootsTell') { const k = Math.max(0, Math.min(1, 1 - e.modeT / HEDGE.tell.roots)), sides = e.phase === 2 ? [e.face, -e.face] : [e.face];
    for (const s of sides) { g.globalAlpha = 0.45 + 0.45 * k; g.fillStyle = '#1a120a'; for (let d = 12; d < 12 + 40 * k; d += 3) g.fillRect(x + s * d, fy - 1 - ((d >> 2) % 2), 2, 1);
      g.fillStyle = '#8fd160'; if (Math.floor(time * 16) % 2) g.fillRect(x + s * (14 + Math.round(30 * k)), fy - 4, 2, 3); g.globalAlpha = 1; } }
  /* B10, THE SHARED READ: open = a gold ring on the lawn and a timer bar over him */
  if (hedgeOpen(e) && e.mode !== 'wake') { const tl = Math.max(e.stuckT || 0, e.burnT || 0), full = (e.stuckT || 0) >= (e.burnT || 0) ? HEDGE.stuck : HEDGE.burnT, k = 0.5 + 0.5 * Math.sin(time * 9);
    g.globalAlpha = 0.55 + 0.35 * k; g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, fy - 2, 26 + 2 * k, 7, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
    const top = fy - (hedgeStump(e) ? 36 : 56); g.fillStyle = '#1b1626'; g.fillRect(x - 14, top, 28, 5); g.fillStyle = '#ffd36b'; g.fillRect(x - 13, top + 1, Math.round(26 * Math.min(1, tl / full)), 3); }
  if (hedgeStump(e)) {
    if (hedgeOpen(e)) { for (let k = 0; k < 5; k++) { const h = 8 + Math.round(5 * Math.sin(time * 11 + k * 1.7)); g.fillStyle = k % 2 ? '#e0c8ff' : '#9a5ad0'; g.fillRect(x - 9 + k * 4, fy - 12 - h, 3, h); }
      const k = 0.5 + 0.5 * Math.sin(time * 10); g.globalAlpha = 0.35 + 0.35 * k; g.strokeStyle = '#8fd160'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, fy - 2, 22 + k * 3, 6, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1; }
    /* the regrowth, as a bar over the stump: when it fills he is up */
    const k = e.mode === 'stump' ? (e.regrowK || 0) : 0; g.fillStyle = '#1b1626'; g.fillRect(x - 13, fy - 30, 26, 4); g.fillStyle = hedgeOpen(e) ? '#b07cf0' : '#5ea050'; g.fillRect(x - 12, fy - 29, Math.round(24 * k), 2); }
}
