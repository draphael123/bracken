// src/line-net.js - THE FALL NET and THE RETURN WINCH (claude/hlfix3, 11-14; behind HL_FIX3 = L.lineKit.fix3, OFF by default).
// Daniel played THE HIGH LINES live (11-14): "a missed line drops you a whole section ... so it is not as annoying". The rule, for EVERY section:
//   a NET (a one-way rope deck strung wall to wall at the section's own bottom station, in L.nets) catches whoever falls; the landing costs ~10 pct max hp (never lethal by itself:
//   the floor is 1 hp) and a brief grace so no foe camps the net; a RETURN WINCH (an iron drum house at each end of the net) then hauls the hero straight back to the ledge he fell
//   from - STRIKE or INTERACT while he stands on the net, a few seconds. A fall that ends on a landing or a line of its own section costs nothing, as before. Death (hp 0 from a foe) is the last shrine, as ever.
// Pure: no DOM, no main.js (the drawing takes a 2d context). src/highlines-hands.js wires it to the seat (netSeat each frame, held() while it hauls). tools/hl-fix3.mjs proves it.
//   const rec = netInit(L)            L.nets (the net rows), L.landings (the ledges he fell from), L.lineKit.fix3 (off = rec.on false: every call is a no-op)
//   netSeat(rec, P, inp, dt) -> events    P = the seat's body { x, y (feet, px), vy, hp, maxHp, inv, ground, lk, dead, down }; inp = { strike, talk }
//                                         events: { t: 'netLand', cost, fall } the catch (hp already docked), { t: 'haulStart', dur }, { t: 'haulEnd' }
//   netHeld(P) true while the winch carries the seat (main.js skips moveBody for him)
//   netReset(P) a checkpoint / party wipe: no memory of a ledge, no haul
export const NET = { COST: 0.10, FALL_MIN: 48, GRACE: 1.5, HAUL_SPEED: 180, HAUL_MIN: 1.2, HAUL_MAX: 4.5, HAUL_NEAR: 24, EDGE: 10 };
const TS = 16;
const px = t => t * TS;
export function netInit(L) {
  const D = (L && L.lineKit) || {}, on = !!D.fix3;
  return { on, nets: on ? (L.nets || []).map((b, i) => ({ i, x0: px(b[0]), x1: px(b[2] + 1), y: px(b[1]) })) : [], decks: on ? (L.landings || []).map((b, i) => ({ i, x0: px(b[0]), x1: px(b[2] + 1), y: px(b[1]) })) : [] };
}
const st = P => P.hlNet || (P.hlNet = { home: null, apex: null, net: -1, haul: null, told: false });
export const netHeld = P => !!(P && P.hlNet && P.hlNet.haul);
export function netReset(P) { if (P) P.hlNet = null; }
const netUnder = (rec, P) => rec.nets.find(n => P.x >= n.x0 && P.x < n.x1 && Math.abs(P.y - n.y) <= 2) || null;
const deckUnder = (rec, P) => rec.decks.find(d => P.x >= d.x0 && P.x < d.x1 && Math.abs(P.y - d.y) <= 2) || null;
/* the winch's way: from the net to the ledge he stood on (null: nothing above to haul him to) */
export function haulPlan(rec, S, P, net) {
  const h = S.home; if (!h) return null;   /* up to the ledge he fell from - or down to it, when the net that caught him stands higher (W6's top part into the ambush's net: the winch lowers him to the east lee) */
  const dist = Math.hypot(h.x - P.x, h.y - P.y); if (dist < NET.HAUL_NEAR) return null;
  return { x0: P.x, y0: P.y, x1: h.x, y1: h.y, dur: Math.max(NET.HAUL_MIN, Math.min(NET.HAUL_MAX, dist / NET.HAUL_SPEED)), t: 0 };
}
export function netSeat(rec, P, inp, dt) {
  const ev = []; if (!rec || !rec.on || !P) return ev;
  const S = st(P);
  if (P.dead || P.down > 0) { S.haul = null; S.net = -1; return ev; }
  if (S.haul) {   /* THE WINCH CARRIES HIM: i-frames the whole way, up to the ledge he fell from */
    const H = S.haul; H.t += dt; const k = Math.min(1, H.t / H.dur), e = k * k * (3 - 2 * k);
    P.x = H.x0 + (H.x1 - H.x0) * e; P.y = H.y0 + (H.y1 - H.y0) * e; P.vx = 0; P.vy = 0; P.ground = true; P.inv = Math.max(P.inv || 0, 0.25); P.poseInv = Math.max(P.poseInv || 0, 0.25);   /* (look fix) a steady 0.25 of i-frames read as 'blink off' every frame: the hauled hero was NOT DRAWN. poseInv = a posed grace that does not blink */
    if (k >= 1) { P.x = H.x1; P.y = H.y1; S.haul = null; S.net = -1; S.apex = P.y; ev.push({ t: 'haulEnd' }); }
    return ev;
  }
  if (P.lk || P.climb) { S.apex = P.y; S.net = -1; S.last = 'l'; }
  else if (!P.ground) { S.apex = S.apex === null ? P.y : Math.min(S.apex, P.y); S.net = -1; }
  else {
    const net = P.onMover ? null : netUnder(rec, P);
    if (net) {
      if (S.net !== net.i) {   /* the catch */
        S.net = net.i; const fall = S.apex === null ? 0 : P.y - S.apex, hop = S.last === 'n' + net.i;   /* (look fix) a jump from this very net, landing on it again, is a hop and not a fall: a full jump rises 3.1 rows and cost a tenth of his hp every time */
        if (fall >= NET.FALL_MIN && !hop) { const cost = Math.max(1, Math.round((P.maxHp || 100) * NET.COST)); P.hp = Math.max(Math.min(P.hp, 1), P.hp - cost); P.inv = Math.max(P.inv || 0, NET.GRACE); ev.push({ t: 'netLand', cost, fall }); }
        else ev.push({ t: 'netStand' });
      }
      S.last = 'n' + net.i;
      if ((inp.strike || inp.talk) && !P.lk) { const plan = haulPlan(rec, S, P, net); if (plan) { S.haul = plan; P.inv = Math.max(P.inv || 0, 0.25); ev.push({ t: 'haulStart', dur: plan.dur }); } }
    } else {
      S.net = -1; S.last = 'd';
      if (!P.onMover) { const d = deckUnder(rec, P); if (d) S.home = { x: Math.max(d.x0 + NET.EDGE, Math.min(d.x1 - NET.EDGE, P.x)), y: d.y, i: d.i }; }   /* the ledge he last stood on is where he goes back to */
    }
    S.apex = P.y;
  }
  return ev;
}
/* can the winch haul this seat right now (the prompt: he stands on a net and has a ledge to go back to) */
export function haulReady(rec, P) {
  if (!rec || !rec.on || !P || P.lk || !P.ground || P.dead || !P.hlNet || P.hlNet.haul) return false;
  const net = netUnder(rec, P); return !!(net && haulPlan(rec, P.hlNet, P, net));
}

/* ---------------- DRAWING (claude/hlfix3 look pass, 11-14: iron, rope, pulleys, like the rest of THE HIGH LINES; draw code only): the net's rope mesh, the winch house at each end (a riveted iron frame, a rope drum with a crank, a pulley on a post, a lamp that goes amber when a hero stands on the net), the haul rope, the cab / cage departure beat ---------------- */
const HEMP = '#b8a070', HEMP_D = '#7a6a48', HEMP_L = '#d6c08a', IRON = '#4a505c', IRON_D = '#2c3038', IRON_L = '#8a929e', AMBER = '#ffcf5a', RUST = '#c0402a';
function winchHouse(g, x, y, dir, lit, time, haul) {   /* x: left edge of the house, y: the net's deck line; dir: -1 the house stands at the net's left end and opens right, 1 at the right end */
  g.fillStyle = IRON_D; g.fillRect(x - 1, y - 18, 16, 19);   /* the dark body */
  g.fillStyle = IRON; g.fillRect(x, y - 17, 14, 17); g.fillStyle = IRON_L; g.fillRect(x, y - 17, 14, 1); g.fillRect(x, y - 17, 1, 17);   /* frame + lit edges */
  g.fillStyle = IRON_D; g.fillRect(x + 2, y - 14, 10, 9);   /* the window the drum turns in */
  const cx = x + 7, cy = y - 9, a = (haul ? time * 9 : lit ? time * 1.6 : 0) * dir;
  g.fillStyle = HEMP_D; g.beginPath(); g.arc(cx, cy, 4, 0, Math.PI * 2); g.fill(); g.strokeStyle = HEMP; g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, 3, 0, Math.PI * 2); g.stroke();   /* the drum, rope wound */
  g.strokeStyle = IRON_L; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * 6, cy + Math.sin(a) * 6); g.stroke(); g.fillStyle = IRON_L; g.fillRect(Math.round(cx + Math.cos(a) * 6) - 1, Math.round(cy + Math.sin(a) * 6) - 1, 2, 2);   /* the crank */
  g.fillStyle = IRON_L; for (const rx of [x + 1, x + 12]) for (const ry of [y - 16, y - 3]) g.fillRect(rx, ry, 1, 1);   /* rivets */
  g.fillStyle = lit ? (Math.floor(time * 4) & 1 ? AMBER : '#e8a83a') : '#5a3a30'; g.fillRect(x + 5, y - 21, 4, 3); g.fillStyle = IRON_D; g.fillRect(x + 4, y - 22, 6, 1);   /* the lamp on the roof */
  const px2 = x + (dir < 0 ? 15 : -2); g.fillStyle = IRON; g.fillRect(px2, y - 24, 1, 24); g.fillStyle = IRON_L; g.beginPath(); g.arc(px2 + 0.5, y - 24, 2.5, 0, Math.PI * 2); g.fill(); g.fillStyle = IRON_D; g.fillRect(px2, y - 25, 1, 2);   /* the pulley on its post */
  g.strokeStyle = HEMP; g.beginPath(); g.moveTo(px2 + 0.5, y - 22); g.lineTo(cx + dir * 3, cy - 3); g.stroke();   /* rope from the pulley down to the drum */
}
export function drawNets(g, rec, cx, cy, VW, VH, time, seats, text) {
  if (!rec || !rec.on) return;
  const lit = (seats || []).some(s => s.ready || s.haul), hauling = (seats || []).some(s => s.haul);
  g.save();
  for (const n of rec.nets) {
    if (n.x1 - cx < -40 || n.x0 - cx > VW + 40 || n.y - cy < -40 || n.y - cy > VH + 40) continue;
    const y = Math.round(n.y - cy), X0 = Math.round(n.x0 - cx), X1 = Math.round(n.x1 - cx), xa = Math.max(X0, -4), xb = Math.min(X1, VW + 4);
    g.lineWidth = 1; g.strokeStyle = HEMP_D; g.beginPath();   /* the mesh: diagonal ropes in two rows, knotted at every crossing */
    for (let x = X0 - (X0 % 8) - 8; x < X1; x += 8) { if (x < -16 || x > VW + 8) continue;
      g.moveTo(x + 0.5, y + 2); g.lineTo(x + 8.5, y + 8); g.moveTo(x + 8.5, y + 2); g.lineTo(x + 0.5, y + 8); g.moveTo(x + 4.5, y + 8); g.lineTo(x + 8.5, y + 13); g.moveTo(x + 4.5, y + 8); g.lineTo(x + 0.5, y + 13); }
    g.stroke();
    g.fillStyle = HEMP_L; for (let x = X0 - (X0 % 8) - 8; x < X1; x += 8) { if (x < -16 || x > VW + 8) continue; g.fillRect(x + 4, y + 7, 2, 2); g.fillRect(x, y + 2, 1, 1); }   /* knots */
    g.fillStyle = HEMP; g.fillRect(xa, y, xb - xa, 2); g.fillStyle = HEMP_L; g.fillRect(xa, y, xb - xa, 1); g.fillStyle = HEMP_D; g.fillRect(xa, y + 2, xb - xa, 1);   /* the edge rope */
    for (const [ex, d] of [[X0, -1], [X1 - 14, 1]]) { if (ex < -30 || ex > VW + 30) continue; winchHouse(g, ex, y, d, lit, time, hauling); }   /* THE RETURN WINCH: a house at each end */
  }
  for (const s of seats || []) {   /* a hauling hero: the rope from the pulley over his ledge down to him, a hook ring at his belt */
    if (!s.haul) continue; const H = s.haul, hx = H.x1 - cx, hy = H.y1 - 30 - cy, sx = s.x - cx, sy = s.y - 22 - cy;
    g.strokeStyle = HEMP_D; g.lineWidth = 3; g.beginPath(); g.moveTo(hx, hy); g.lineTo(sx, sy); g.stroke(); g.strokeStyle = HEMP; g.lineWidth = 1; g.beginPath(); g.moveTo(hx, hy); g.lineTo(sx, sy); g.stroke();
    g.fillStyle = IRON_D; g.beginPath(); g.arc(hx, hy, 4, 0, Math.PI * 2); g.fill(); g.fillStyle = IRON_L; g.beginPath(); g.arc(hx, hy, 2.5, 0, Math.PI * 2); g.fill(); g.fillStyle = IRON_D; g.fillRect(Math.round(hx) - 1, Math.round(hy) - 1, 2, 2);   /* the pulley block over the ledge */
    g.strokeStyle = IRON_L; g.beginPath(); g.arc(sx, sy + 2, 2.5, 0, Math.PI * 2); g.stroke();
  }
  if (text) for (const s of seats || []) if (s.ready && !s.haul) text('STRIKE: THE WINCH HAULS YOU BACK UP', Math.round(s.x - cx), Math.round(s.y - cy) - 34, AMBER, 'center', 6);
  g.restore();
}
/* the cab / cage beat: a bar over the car that fills in the 0.6 s before it leaves (lamp amber), then an amber 'waiting for the party' bar while the others catch up */
export function drawBeat(g, kit, cx, cy, time) {
  if (!kit || !kit.fix3) return;
  const bar = (x, y, f, wait) => { const X = Math.round(x - cx) - 17, Y = Math.round(y - cy) + 2; g.fillStyle = IRON_D; g.fillRect(X - 1, Y - 1, 36, 10); g.fillStyle = IRON; g.fillRect(X, Y, 34, 8); g.fillStyle = IRON_L; g.fillRect(X, Y, 34, 1); g.fillStyle = '#14161a'; g.fillRect(X + 3, Y + 2, 28, 4); g.fillStyle = wait ? AMBER : '#e8e0c8'; g.fillRect(X + 3, Y + 2, Math.round(28 * Math.max(0, Math.min(1, f))), 4); g.fillStyle = IRON_L; for (const tx of [7, 14, 21]) g.fillRect(X + 3 + tx, Y + 6, 1, 1); g.fillStyle = Math.floor(time * 8) & 1 ? AMBER : RUST; g.fillRect(X + 15, Y - 5, 4, 4); g.fillStyle = IRON_D; g.fillRect(X + 14, Y - 6, 6, 1); g.fillRect(X + 16, Y - 2, 2, 3); };   /* an iron gauge plate over the car: the beat fills it, amber when it waits for the party */
  g.save();
  for (const c of kit.cabs) if (c.st === 'board') { const top = c.hookY + 40 - 56; if (c.wait > 0) bar(c.x, top, 1 - c.wait / 2.5, true); else bar(c.x, top, 1 - Math.max(0, c.t) / 0.6, false); }
  for (const W of kit.weights) if (W.boardT > 0 && !W.go) { const d = W.d, y = (d.b.bot * TS) - (W.k * (d.b.bot - d.b.top) * TS) - 40, x = (d.b.x0 + d.b.x1 + 1) / 2 * TS; if (W.wait > 0) bar(x, y, 1 - W.wait / 2.5, true); else bar(x, y, W.boardT / 0.6, false); }
  g.restore();
}
