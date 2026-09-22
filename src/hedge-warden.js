// hedge-warden.js — THE HEDGE WARDEN, the Witchlight Stair's mini (batch 4c, 2026-09-22). Brief: .claude/briefs/witchlight-stair.md.
// A giant topiary knight at the tower's garden gate, clipped box hedge for armour and a hedge-sword. He is fought between
// two WITCHLIGHT BRAZIERS (witchlight.js). His art: src/redraw/queue_bosses.js (bakeHedgeWarden).
//   THE CUT     !    the sword up over the helm and down in front: guard it, or step back out of it
//   THE RUSH    !    he stamps and charges the length of his reach with the blade out: guard it, or jump him
//   THORNS      ✕    arms flung wide, thorns bristle all round him and burst: too many to guard - get out of reach
// HE GROWS BACK. His health is three GROWTHS. Cut a growth down to its root and he falls to a STUMP, and the stump regrows:
// cut the root out before it is up and that growth is gone for good; let it grow and he stands again with the growth back.
// The last growth's root is his life.
// THE OPENING IS YOURS (tools/boss-openings.mjs proves it): he follows you. Cut him down BESIDE A BRAZIER and the witch-fire
// takes the stump: it burns, open - every blow on it counts twice, and it cannot regrow while it burns. Cut down on the open
// lawn, the stump just regrows.
// PHASE TWO (the last growth): he is quicker, the thorns reach further, and a stump that regrows throws off a topiary cutting.
// Touching him never hurts (the touch rule): his damage is his sword, his rush and his thorns.
export const HEDGE = {
  walk: 30, keep: 34, cd: 1.3, cdP2: 0.95,
  tell: { cut: 0.85, rush: 0.8, thorn: 1.0 },
  dmg: { cut: 16, rush: 14, thorn: 14 },
  cutReach: 50, rushV: 150, rushT: 0.6, thornR: 46, thornRP2: 58,
  growths: 3, root: 0.14, regrow: 4.6, regrowP2: 3.8, burnT: 3.2, burnMul: 2, brazierNear: 44, cuttings: 2,
  order: ['cut', 'rush', 'cut', 'thorn', 'rush', 'cut', 'thorn'],
};
const TELL = { cut: 'cutTell', rush: 'rushTell', thorn: 'thornTell' };
const SAY = { cutTell: 'THE CUT', rushTell: 'HE CHARGES', thornTell: 'THORNS: GET CLEAR' };
export const hedgeOpen = e => (e.burnT || 0) > 0;
const STUMP = new Set(['felled', 'stump']);
export const hedgeStump = e => STUMP.has(e.mode);
/* the thirds of his bar: the floor of the growth he is on, and where its root starts */
const third = e => e.maxHp / HEDGE.growths;
const floorOf = e => Math.max(0, e.maxHp - third(e) * ((e.growth || 0) + 1));
const rootOf = e => floorOf(e) + e.maxHp * HEDGE.root;
/* the frames of bakeHedgeWarden: 0 stand | 1,2 walk | 3 cut tell | 4 cut | 5 thorn tell | 6 thorns | 7 stump | 8,9 regrowing */
export function hedgeFrame(e) {
  switch (e.mode) {
    case 'cutTell': return 3; case 'cut': return 4; case 'rush': return 4; case 'rushTell': return 1 + Math.floor((e.anim || 0) * 12) % 2;
    case 'thornTell': return 5; case 'thorn': return 6; case 'felled': return 7;
    case 'stump': { const k = e.regrowK || 0; return k < 0.4 ? 7 : k < 0.75 ? 8 : 9; }
    case 'sleep': case 'wake': return 0;
  }
  return Math.abs(e.vx || 0) > 3 ? 1 + Math.floor((e.anim || 0) * 5) % 2 : 0;
}
/* HIS HEALTH, three growths deep: called by hurtEnemy0 with the blow's damage, returns what comes off the bar. Standing, no
   blow takes him past his root (it fells him there); a stump loses its root, twice as fast while it burns; the last growth's
   root is his life, so only there does the bar reach nothing. */
export function hedgeTake(e, dmg) {
  if (!(dmg > 0) || e.mode === 'sleep') return dmg;
  if (hedgeStump(e)) { if (hedgeOpen(e)) dmg = Math.round(dmg * HEDGE.burnMul); const fl = floorOf(e);
    if (e.hp - dmg <= fl) { e.rooted = true; return fl > 0 ? Math.max(0, e.hp - fl) : dmg; } return dmg; }
  const r = rootOf(e); if (e.hp - dmg <= r) { e.fell = true; return Math.max(0, e.hp - r); }
  return dmg;
}
function begin(e, what, c) { e.mode = TELL[what]; e.modeT = HEDGE.tell[what] * (e.phase === 2 ? 0.85 : 1); e.face = Math.sign(c.P.x - e.x) || e.face || 1; c.say(SAY[e.mode], what === 'thorn'); }
export function updateHedgeWarden(e, dt, c) {
  const { P, A, hit } = c, floor = A.floor, rnd = c.rnd || Math.random;
  if (!e.alive || e.mode === 'sleep') return;
  e.anim = (e.anim || 0) + dt; e.modeT -= dt; e.cd = (e.cd ?? 1) - dt; e.turn ??= 0; e.growth ??= 0; e.y = floor;
  e.burnT = Math.max(0, (e.burnT || 0) - dt); e.open = e.burnT;
  if (e.mode === 'wake') { if (e.modeT <= 0) { e.mode = 'stalk'; e.cd = 0.8; if (!e.dealt) { e.dealt = true; e.turn = Math.floor(rnd() * HEDGE.order.length); } } return; }   /* where in his order he starts is his own, fight to fight */
  /* a blow (or a bleed) that took him under his root while he stood fells him there */
  if (!hedgeStump(e) && (e.fell || e.hp <= rootOf(e))) { e.fell = false; e.hp = Math.max(e.hp, rootOf(e));
    e.mode = 'felled'; e.modeT = 0.5; e.regrowK = 0; e.rooted = false; e.vx = 0; c.say('CUT DOWN TO THE STUMP', false, true); c.sound('crack'); c.shake(4); c.dust(e.x, floor);
    const fire = (c.braziers() || []).some(bx => Math.abs(bx - e.x) < HEDGE.brazierNear);
    if (fire) { e.burnT = HEDGE.burnT; e.open = e.burnT; c.say('THE WITCH-FIRE TAKES THE STUMP', false, true); c.sound('fire'); }
    return; }
  // ---- THE STUMP: it regrows unless the root is cut out ----
  if (hedgeStump(e)) {
    if (e.rooted || e.hp <= floorOf(e)) { e.rooted = false;
      if (floorOf(e) <= 0) return;                                             // the last root: the blow that took it kills him (the engine's)
      e.growth++; e.hp = floorOf(e) + third(e); e.hp = Math.min(e.hp, e.maxHp - third(e) * e.growth); e.burnT = 0;
      if (e.growth >= HEDGE.growths - 1 && e.phase !== 2) { e.phase = 2; c.say('THE LAST GROWTH: HE IS QUICKER', true); }
      c.say('ROOTED OUT', false, true); c.sound('crack'); c.shake(5); e.mode = 'wake'; e.modeT = 1.1; e.regrowK = 1; return; }
    if (e.mode === 'felled') { if (e.modeT <= 0) { e.mode = 'stump'; e.modeT = e.phase === 2 ? HEDGE.regrowP2 : HEDGE.regrow; } return; }
    if (e.burnT > 0) { e.modeT += dt; return; }                                // burning: it does not grow
    const T0 = e.phase === 2 ? HEDGE.regrowP2 : HEDGE.regrow; e.regrowK = Math.max(0, Math.min(1, 1 - e.modeT / T0));
    if (e.modeT <= 0) { e.hp = floorOf(e) + third(e); e.mode = 'stalk'; e.cd = 0.9; c.say('HE GROWS BACK', true); c.sound('grow');
      if (e.phase === 2 && c.adds() < HEDGE.cuttings) c.sprout(e.x + (Math.random() < 0.5 ? -40 : 40)); }
    return; }
  // ---- THE ATTACKS ----
  if (e.mode === 'cutTell' || e.mode === 'rushTell' || e.mode === 'thornTell') {
    if (e.mode !== 'rushTell') e.face = Math.sign(P.x - e.x) || e.face;
    if (e.modeT > 0) return;
    if (e.mode === 'cutTell') { e.mode = 'cut'; e.modeT = 0.4; c.sound('heavy'); c.shake(2);
      const dx = (P.x - e.x) * e.face; if (!P.dead && dx > -8 && dx < HEDGE.cutReach && Math.abs(P.y - floor) < 34) hit(e.x, HEDGE.dmg.cut, false, 'THE CUT'); return; }
    if (e.mode === 'rushTell') { e.mode = 'rush'; e.modeT = HEDGE.rushT; e.rushHit = false; c.sound('whoosh'); return; }
    if (e.mode === 'thornTell') { e.mode = 'thorn'; e.modeT = 0.35; c.sound('thorn'); c.shake(3);
      const R = e.phase === 2 ? HEDGE.thornRP2 : HEDGE.thornR; if (!P.dead && Math.abs(P.x - e.x) < R && P.y > floor - 44) hit(e.x, HEDGE.dmg.thorn, true, 'THE THORNS'); return; }
  }
  if (e.mode === 'rush') { const nx = e.x + e.face * HEDGE.rushV * dt; e.vx = e.face * HEDGE.rushV;
    if (nx > A.x0 + 16 && nx < A.x1 - 16) e.x = nx; else e.modeT = 0;
    if (!e.rushHit && !P.dead && Math.abs(P.x - e.x) < 20 && Math.abs(P.y - floor) < 30) { e.rushHit = true; hit(e.x, HEDGE.dmg.rush, false, 'THE RUSH'); }
    if (e.modeT <= 0) { e.mode = 'stalk'; e.vx = 0; e.cd = (e.phase === 2 ? HEDGE.cdP2 : HEDGE.cd) * (0.8 + 0.4 * rnd()); } return; }
  if (e.mode === 'cut' || e.mode === 'thorn') { if (e.modeT <= 0) { e.mode = 'stalk'; e.cd = (e.phase === 2 ? HEDGE.cdP2 : HEDGE.cd) * (0.8 + 0.4 * rnd()); } return; }
  // ---- STALKING: he keeps to his reach and comes on ----
  const d = P.x - e.x, ad = Math.abs(d); e.face = Math.sign(d) || e.face;
  const want = ad > HEDGE.keep ? e.face : 0, nx = e.x + want * HEDGE.walk * (e.phase === 2 ? 1.3 : 1) * dt;
  if (nx > A.x0 + 16 && nx < A.x1 - 16) e.x = nx; e.vx = want * HEDGE.walk;
  if (e.cd > 0 || P.dead) return;
  let what = HEDGE.order[e.turn++ % HEDGE.order.length];
  if (what === 'cut' && ad > HEDGE.cutReach + 40) what = 'rush';
  if (what === 'thorn' && ad > HEDGE.thornR + 50) what = 'rush';
  if (what === 'rush' && ad < 26) what = 'thorn';
  begin(e, what, c);
}
/* the braziers, the thorn ring, the stump's burning and its regrowth */
export function drawHedgeWarden(g, e, braziers, cx, cy, time, floorY) {
  const fy = Math.round(floorY - cy);
  for (const bx of braziers || []) { const x = Math.round(bx - cx); if (x < -20 || x > g.canvas.width + 20) continue;   /* A WITCHLIGHT BRAZIER: a stone bowl on a post */
    g.fillStyle = '#1b1626'; g.fillRect(x - 3, fy - 16, 6, 16); g.fillRect(x - 8, fy - 20, 16, 5); g.fillStyle = '#6a6280'; g.fillRect(x - 2, fy - 15, 4, 15); g.fillStyle = '#8e86a4'; g.fillRect(x - 7, fy - 19, 14, 3);
    for (let k = 0; k < 3; k++) { const h = 6 + Math.round(3 * Math.sin(time * 9 + k * 2 + bx)); g.fillStyle = k === 1 ? '#e0c8ff' : '#9a5ad0'; g.fillRect(x - 5 + k * 4, fy - 20 - h, 3, h); }
    g.globalAlpha = 0.12 + 0.05 * Math.sin(time * 5 + bx); g.fillStyle = '#b07cf0'; g.beginPath(); g.arc(x, fy - 24, 16, 0, 7); g.fill(); g.globalAlpha = 1; }
  if (!e?.alive) return;
  const x = Math.round(e.x - cx);
  if (e.mode === 'thornTell' || e.mode === 'thorn') { const R = e.phase === 2 ? HEDGE.thornRP2 : HEDGE.thornR, k = e.mode === 'thorn' ? 1 : 0.45; g.globalAlpha = 0.3 * k + (Math.floor(time * 12) % 2 ? 0.1 : 0);
    g.strokeStyle = '#ff6b6b'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, fy - 8, R, 10, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1; }
  if (hedgeStump(e)) {
    if (hedgeOpen(e)) { for (let k = 0; k < 5; k++) { const h = 8 + Math.round(5 * Math.sin(time * 11 + k * 1.7)); g.fillStyle = k % 2 ? '#e0c8ff' : '#9a5ad0'; g.fillRect(x - 9 + k * 4, fy - 12 - h, 3, h); }
      const k = 0.5 + 0.5 * Math.sin(time * 10); g.globalAlpha = 0.35 + 0.35 * k; g.strokeStyle = '#8fd160'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, fy - 2, 22 + k * 3, 6, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1; }
    /* the regrowth, as a bar over the stump: when it fills he is up */
    const k = e.mode === 'stump' ? (e.regrowK || 0) : 0; g.fillStyle = '#1b1626'; g.fillRect(x - 13, fy - 30, 26, 4); g.fillStyle = hedgeOpen(e) ? '#b07cf0' : '#5ea050'; g.fillRect(x - 12, fy - 29, Math.round(24 * k), 2); }
}
