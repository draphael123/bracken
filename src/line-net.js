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
    P.x = H.x0 + (H.x1 - H.x0) * e; P.y = H.y0 + (H.y1 - H.y0) * e; P.vx = 0; P.vy = 0; P.ground = true; P.inv = Math.max(P.inv || 0, 0.25);
    if (k >= 1) { P.x = H.x1; P.y = H.y1; S.haul = null; S.net = -1; S.apex = P.y; ev.push({ t: 'haulEnd' }); }
    return ev;
  }
  if (P.lk || P.climb) { S.apex = P.y; S.net = -1; }
  else if (!P.ground) { S.apex = S.apex === null ? P.y : Math.min(S.apex, P.y); S.net = -1; }
  else {
    const net = P.onMover ? null : netUnder(rec, P);
    if (net) {
      if (S.net !== net.i) {   /* the catch */
        S.net = net.i; const fall = S.apex === null ? 0 : P.y - S.apex;
        if (fall >= NET.FALL_MIN) { const cost = Math.max(1, Math.round((P.maxHp || 100) * NET.COST)); P.hp = Math.max(Math.min(P.hp, 1), P.hp - cost); P.inv = Math.max(P.inv || 0, NET.GRACE); ev.push({ t: 'netLand', cost, fall }); }
        else ev.push({ t: 'netStand' });
      }
      if ((inp.strike || inp.talk) && !P.lk) { const plan = haulPlan(rec, S, P, net); if (plan) { S.haul = plan; P.inv = Math.max(P.inv || 0, 0.25); ev.push({ t: 'haulStart', dur: plan.dur }); } }
    } else {
      S.net = -1;
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

/* ---------------- GREYBOX DRAWING (art owed): the net's rope, the drum house at each end, the haul rope, the cab / cage departure beat ---------------- */
const HEMP = '#b8a070', HEMP_D = '#7a6a48', IRON = '#4a505c', IRON_L = '#8a929e', AMBER = '#ffcf5a';
export function drawNets(g, rec, cx, cy, VW, VH, time, seats, text) {
  if (!rec || !rec.on) return;
  g.save();
  for (const n of rec.nets) {
    if (n.x1 - cx < -40 || n.x0 - cx > VW + 40 || n.y - cy < -40 || n.y - cy > VH + 40) continue;
    const y = Math.round(n.y - cy), xa = Math.max(Math.round(n.x0 - cx), -4), xb = Math.min(Math.round(n.x1 - cx), VW + 4);
    g.strokeStyle = HEMP_D; g.lineWidth = 1; g.beginPath();   /* the mesh: a sagging top rope, hanging cross-ropes */
    for (let x = Math.round(n.x0 - cx); x < n.x1 - cx; x += 8) { if (x < -8 || x > VW + 8) continue; g.moveTo(x + 0.5, y + 1); g.lineTo(x + 0.5, y + 6); }
    g.stroke();
    g.fillStyle = HEMP; g.fillRect(xa, y, xb - xa, 2); g.fillStyle = HEMP_D; g.fillRect(xa, y + 2, xb - xa, 1);
    for (const ex of [Math.round(n.x0 - cx), Math.round(n.x1 - cx) - 12]) {   /* THE RETURN WINCH: an iron drum house at each end, a rope stub going up */
      if (ex < -16 || ex > VW + 16) continue;
      g.fillStyle = IRON; g.fillRect(ex, y - 12, 12, 12); g.fillStyle = IRON_L; g.fillRect(ex, y - 12, 12, 1); g.fillRect(ex + 1, y - 11, 1, 10);
      g.fillStyle = HEMP_D; g.beginPath(); g.arc(ex + 6, y - 6, 3.5, 0, Math.PI * 2); g.fill(); g.fillStyle = HEMP; g.fillRect(ex + 5, y - 7, 2, 2);
      g.fillStyle = IRON; g.fillRect(ex + 5, y - 20, 2, 8); }
  }
  for (const s of seats || []) {   /* a hauling hero: the rope from the pulley over his ledge down to him */
    if (!s.haul) continue; const H = s.haul;
    g.strokeStyle = HEMP; g.lineWidth = 2; g.beginPath(); g.moveTo(H.x1 - cx, H.y1 - 30 - cy); g.lineTo(s.x - cx, s.y - 22 - cy); g.stroke();
    g.fillStyle = IRON; g.beginPath(); g.arc(H.x1 - cx, H.y1 - 30 - cy, 3, 0, Math.PI * 2); g.fill();
  }
  if (text) for (const s of seats || []) if (s.ready && !s.haul) text('STRIKE: THE WINCH HAULS YOU BACK UP', Math.round(s.x - cx), Math.round(s.y - cy) - 34, AMBER, 'center', 6);
  g.restore();
}
/* the cab / cage beat: a bar over the car that fills in the 0.6 s before it leaves (lamp amber), then an amber 'waiting for the party' bar while the others catch up */
export function drawBeat(g, kit, cx, cy, time) {
  if (!kit || !kit.fix3) return;
  const bar = (x, y, f, wait) => { const X = Math.round(x - cx) - 14, Y = Math.round(y - cy); g.fillStyle = IRON; g.fillRect(X - 1, Y - 1, 30, 6); g.fillStyle = wait ? AMBER : '#e8e0c8'; g.fillRect(X, Y, Math.round(28 * Math.max(0, Math.min(1, f))), 4); g.fillStyle = Math.floor(time * 8) & 1 ? AMBER : '#c0402a'; g.fillRect(X + 11, Y - 5, 6, 3); };
  g.save();
  for (const c of kit.cabs) if (c.st === 'board') { const top = c.hookY + 40 - 56; if (c.wait > 0) bar(c.x, top, 1 - c.wait / 2.5, true); else bar(c.x, top, 1 - Math.max(0, c.t) / 0.6, false); }
  for (const W of kit.weights) if (W.boardT > 0 && !W.go) { const d = W.d, y = (d.b.bot * TS) - (W.k * (d.b.bot - d.b.top) * TS) - 40, x = (d.b.x0 + d.b.x1 + 1) / 2 * TS; if (W.wait > 0) bar(x, y, 1 - W.wait / 2.5, true); else bar(x, y, W.boardT / 0.6, false); }
  g.restore();
}
