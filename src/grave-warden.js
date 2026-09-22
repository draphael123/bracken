// grave-warden.js — THE GRAVE WARDEN, the Burial Caverns' mini (batch 4b, 2026-09-22). Brief: .claude/briefs/burial-rework.md.
// The ossuary's keeper: huge, slow, an armoured skeleton in a gravedigger's hood, a spade and a bell-lantern on a chain.
// Fought in his round bone vault with OPEN GRAVES in the floor (burial-rework.js). His art: src/redraw/queue_bosses.js.
//   SPADE CLEAVE   !    a wide overhead chop, a long windup (the spade behind his head): guard it, or step back
//   GRAVE TOSS     !    he scoops grave dirt and flings three arcing clods: guard, or jump between them
//   LANTERN SWING  ✕    the lantern whirled low round him, twice (three times in phase two): too heavy to guard - jump it
//   DIG AND RISE   ✕    the spade into the floor; the earth cracks where you WERE and a dead hand bursts up there: move
//   TOLL THE DEAD       he rings the lantern and the dead climb out of the open graves (never more than three up)
// THE OPENING IS YOURS (tools/boss-openings.mjs proves it): his dig aims where you stand. Stand beside an open grave, let the
// crack mark it, and leave late: the spade goes into the grave, the soft ground gives, and he pitches to his knees - open,
// taking double. A dig that misses you on solid floor opens NOTHING.
// PHASE TWO (under half): the bone walls shed rolling skulls along the floor (jump them), the lantern swings three times, and
// every TOLL seals one open grave for good - fewer places to make the opening, so use them early.
// Touching him never hurts (the touch rule): his damage is his spade, his dirt, his lantern and the hands.
export const WARDEN = {
  walk: 22, keep: 40, cd: 1.4, cdP2: 1.05,
  tell: { cleave: 0.95, toss: 0.75, swing: 0.8, dig: 0.85, toll: 0.8 },
  dmg: { cleave: 18, clod: 10, swing: 12, hand: 18, skull: 12 },
  cleaveReach: 46, swingR: 50, graveNear: 20, kneelT: 3.2, kneelMul: 2, adds: 3, skullEvery: 5,
  order: ['cleave', 'dig', 'toss', 'swing', 'dig', 'toll', 'cleave', 'swing', 'dig'],
};
const TELL = { cleave: 'cleaveTell', toss: 'tossTell', swing: 'swingTell', dig: 'digTell', toll: 'tollTell' };
const SAY = { cleaveTell: 'THE SPADE', tossTell: 'GRAVE DIRT', swingTell: 'THE LANTERN: JUMP IT', digTell: 'HE DIGS: MOVE', tollTell: 'HE TOLLS THE DEAD' };
export const wardenOpen = e => e.mode === 'kneel';
/* the frames of bakeGraveWarden: 0 idle | 1,2 walk | 3 cleave tell | 4 cleave | 5 toss tell | 6 toss | 7,8 lantern | 9 dig tell | 10 dig | 11 toll | 12 kneel | 13 hurt */
export function wardenFrame(e) {
  switch (e.mode) {
    case 'cleaveTell': return 3; case 'cleave': return 4; case 'tossTell': return 5; case 'toss': return 6;
    case 'swingTell': return 11; case 'swing': return 7 + Math.floor((e.anim || 0) * 8) % 2; case 'digTell': return 9; case 'dig': return 10;
    case 'tollTell': case 'toll': return 11; case 'kneel': return 12; case 'sleep': case 'wake': return 0;
  }
  if (e.hurtT > 0) return 13;
  return Math.abs(e.vx || 0) > 3 ? 1 + Math.floor((e.anim || 0) * 5) % 2 : 0;
}
function begin(e, what, c) { e.mode = TELL[what]; e.modeT = WARDEN.tell[what]; e.face = Math.sign(c.P.x - e.x) || e.face || 1; c.say(SAY[e.mode], what === 'swing' || what === 'dig', what === 'toll'); if (what === 'dig') e.markX = c.P.x; }
export function updateGraveWarden(e, dt, c) {
  const { P, A, hit } = c, floor = A.floor;
  if (!e.alive || e.mode === 'sleep') return;
  e.anim = (e.anim || 0) + dt; e.modeT -= dt; e.cd = (e.cd ?? 1) - dt; e.clods ??= []; e.hands ??= []; e.skulls ??= []; e.turn ??= 0;
  e.open = wardenOpen(e) ? Math.max(0, e.modeT) : 0;
  const p2 = e.hp <= e.maxHp * 0.5; if (p2 && e.phase !== 2) { e.phase = 2; e.skullT = 1; c.say('THE WALLS SHED THEIR DEAD', true); c.sound('roar'); }
  // ---- what he has thrown ----
  for (const q of e.clods) { q.vy += 420 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.t -= dt;
    if (!q.hit && !P.dead && Math.abs(P.x - q.x) < 7 && P.y - 22 < q.y && P.y + 2 > q.y) { q.hit = true; q.t = 0; hit(q.x, WARDEN.dmg.clod, false, 'GRAVE DIRT'); }
    if (q.y >= floor) { q.t = 0; c.dust(q.x, floor); } }
  e.clods = e.clods.filter(q => q.t > 0);
  for (const h of e.hands) { h.t -= dt; if (!h.hit && h.t < 0.35 && h.t > 0.1 && !P.dead && Math.abs(P.x - h.x) < 16 && P.y > floor - 30) { h.hit = true; hit(h.x, WARDEN.dmg.hand, true, 'THE DEAD HAND'); } }
  e.hands = e.hands.filter(h => h.t > 0);
  if (e.phase === 2) { e.skullT = (e.skullT ?? WARDEN.skullEvery) - dt; if (e.skullT <= 0 && e.mode !== 'kneel') { e.skullT = WARDEN.skullEvery; const side = Math.random() < 0.5 ? -1 : 1; e.skulls.push({ x: side < 0 ? A.x0 + 8 : A.x1 - 8, vx: -side * 110, t: 7, rot: 0 }); c.sound('crack'); } }
  for (const s of e.skulls) { s.x += s.vx * dt; s.rot += s.vx * dt / 6; s.t -= dt;
    if (!s.hit && !P.dead && Math.abs(P.x - s.x) < 8 && P.y > floor - 12) { s.hit = true; hit(s.x, WARDEN.dmg.skull, true, 'A ROLLING SKULL'); }
    if (s.x < A.x0 || s.x > A.x1) s.t = 0; }
  e.skulls = e.skulls.filter(s => s.t > 0);
  e.y = floor;
  if (e.mode === 'wake') { if (e.modeT <= 0) { e.mode = 'stalk'; e.cd = 0.8; } return; }
  // ---- THE OPENING: on his knees in the grave ----
  if (e.mode === 'kneel') { if (e.modeT <= 0) { e.mode = 'stalk'; e.cd = 0.9; c.say('HE CLIMBS OUT', false); } return; }
  if (e.mode === 'cleaveTell' || e.mode === 'tossTell' || e.mode === 'swingTell' || e.mode === 'digTell' || e.mode === 'tollTell') {
    if (e.mode !== 'digTell') e.face = Math.sign(P.x - e.x) || e.face;
    if (e.modeT > 0) return;
    if (e.mode === 'cleaveTell') { e.mode = 'cleave'; e.modeT = 0.45; c.sound('heavy'); c.shake(3);
      const dx = (P.x - e.x) * e.face; if (!P.dead && dx > -8 && dx < WARDEN.cleaveReach && Math.abs(P.y - floor) < 30) hit(e.x, WARDEN.dmg.cleave, false, 'THE SPADE'); return; }
    if (e.mode === 'tossTell') { e.mode = 'toss'; e.modeT = 0.5; c.sound('throw');
      const dist = Math.max(40, Math.min(170, Math.abs(P.x - e.x)));
      for (let i = 0; i < 3; i++) { const reach = dist * (0.75 + 0.25 * i), tt = 0.75; e.clods.push({ x: e.x + e.face * 14, y: floor - 34, vx: e.face * reach / tt, vy: (34 - 0.5 * 420 * tt * tt) / tt, t: 3 }); }
      return; }
    if (e.mode === 'swingTell') { e.mode = 'swing'; e.swings = e.phase === 2 ? 3 : 2; e.modeT = 0.5; e.swingHit = false; c.sound('whoosh'); return; }
    if (e.mode === 'digTell') { e.mode = 'dig'; e.modeT = 0.7; c.sound('heavy'); c.shake(4);
      const hitMe = !P.dead && Math.abs(P.x - e.markX) < 16 && P.y > floor - 30;
      e.hands.push({ x: e.markX, t: 0.6 });
      const grave = (c.graves() || []).find(gx => Math.abs((gx + 1) * 16 - e.markX) < WARDEN.graveNear);
      if (grave !== undefined && !hitMe) { e.mode = 'kneel'; e.modeT = WARDEN.kneelT; e.open = WARDEN.kneelT; e.x = (grave + 1) * 16 + (e.x < (grave + 1) * 16 ? -18 : 18);
        c.say('THE GRAVE GIVES: HE IS ON HIS KNEES', false, true); c.sound('crack'); c.shake(6); }
      return; }
    if (e.mode === 'tollTell') { e.mode = 'toll'; e.modeT = 0.6; c.sound('bell');
      const open = c.graves() || []; const up = c.adds();
      for (let i = 0; i < Math.min(open.length, WARDEN.adds - up, 2); i++) c.raise((open[(e.turn + i) % open.length] + 1) * 16, floor);
      if (e.phase === 2 && open.length) { c.sealGrave(open[e.turn % open.length]); c.say('A GRAVE SEALS', true); }
      return; }
  }
  if (e.mode === 'swing') { e.face = e.face || 1;
    if (!e.swingHit && e.modeT < 0.38 && e.modeT > 0.1 && !P.dead && Math.abs(P.x - e.x) < WARDEN.swingR && P.y > floor - 14) { e.swingHit = true; hit(e.x, WARDEN.dmg.swing, true, 'THE LANTERN'); }
    if (e.modeT <= 0) { e.swings--; if (e.swings > 0) { e.modeT = 0.5; e.swingHit = false; c.sound('whoosh'); } else { e.mode = 'stalk'; e.cd = e.phase === 2 ? WARDEN.cdP2 : WARDEN.cd; } }
    return; }
  if (e.mode === 'cleave' || e.mode === 'toss' || e.mode === 'dig' || e.mode === 'toll') { if (e.modeT <= 0) { e.mode = 'stalk'; e.cd = e.phase === 2 ? WARDEN.cdP2 : WARDEN.cd; } return; }
  // ---- STALKING: slow, heavy, always coming ----
  const d = P.x - e.x, ad = Math.abs(d); e.face = Math.sign(d) || e.face;
  const want = ad > WARDEN.keep ? e.face : 0, nx = e.x + want * WARDEN.walk * dt;
  if (nx > A.x0 + 20 && nx < A.x1 - 20) e.x = nx; e.vx = want * WARDEN.walk;
  if (e.cd > 0 || P.dead) return;
  let what = WARDEN.order[e.turn++ % WARDEN.order.length];
  if (what === 'cleave' && ad > WARDEN.cleaveReach + 30) what = 'toss';
  if (what === 'swing' && ad > WARDEN.swingR + 40) what = 'dig';
  if (what === 'toll' && !(c.graves() || []).length) what = 'toss';
  begin(e, what, c);
}
/* his clods, the crack where he will dig, the hands, the rolling skulls, and the ring round him while he kneels */
export function drawGraveWarden(g, e, cx, cy, time, floorY) {
  if (!e?.alive) return;
  const fy = Math.round(floorY - cy);
  if (e.mode === 'digTell') { const x = Math.round(e.markX - cx), k = 1 - Math.max(0, e.modeT) / WARDEN.tell.dig; g.fillStyle = Math.floor(time * 14) % 2 ? '#ff6b6b' : '#3a2a22';
    for (let i = -3; i <= 3; i++) g.fillRect(x + i * 3 - 1, fy - 1 - Math.abs(i) % 2, 2, 2); g.globalAlpha = 0.3 + 0.4 * k; g.fillStyle = '#ff6b6b'; g.fillRect(x - 12, fy - 2, 24, 2); g.globalAlpha = 1; }
  for (const h of e.hands || []) { const x = Math.round(h.x - cx), up = Math.min(1, (0.6 - h.t) / 0.2) * 18; g.fillStyle = '#1b1626'; g.fillRect(x - 4, fy - up - 1, 9, up + 1); g.fillStyle = '#d8ceb4'; g.fillRect(x - 3, fy - up, 7, up); g.fillStyle = '#b0a58a'; for (let i = 0; i < 4; i++) g.fillRect(x - 3 + i * 2, fy - up - 3, 1, 3); }
  for (const q of e.clods || []) { const x = Math.round(q.x - cx), y = Math.round(q.y - cy); g.fillStyle = '#1b1626'; g.fillRect(x - 3, y - 3, 6, 6); g.fillStyle = '#6a5440'; g.fillRect(x - 2, y - 2, 4, 4); g.fillStyle = '#8a7058'; g.fillRect(x - 2, y - 2, 2, 1); }
  for (const s of e.skulls || []) { const x = Math.round(s.x - cx), y = fy - 5; g.save(); g.translate(x, y); g.rotate(s.rot); g.fillStyle = '#1b1626'; g.fillRect(-5, -5, 10, 10); g.fillStyle = '#e0d6bc'; g.fillRect(-4, -4, 8, 8); g.fillStyle = '#261e2c'; g.fillRect(-3, -2, 2, 2); g.fillRect(1, -2, 2, 2); g.fillRect(-1, 2, 2, 1); g.restore(); }
  if (e.mode === 'kneel') { const k = 0.5 + 0.5 * Math.sin(time * 10); g.globalAlpha = 0.35 + 0.35 * k; g.strokeStyle = '#8fd160'; g.lineWidth = 2; g.beginPath(); g.ellipse(Math.round(e.x - cx), fy - 2, 26 + k * 3, 6, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1; }
  if (e.mode === 'swing' || e.mode === 'swingTell') { const k = e.mode === 'swing' ? 1 : 0.4; g.globalAlpha = 0.25 * k; g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.ellipse(Math.round(e.x - cx), fy - 6, WARDEN.swingR, 8, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1; }
}
