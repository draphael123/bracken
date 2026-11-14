// src/line-jumpers.js - THE LINE-JUMPER, the BOARDER of the zip-line cart rides (claude/hlcartf, 11-14; scratch/lane-reports/hlcart-plan.md section 3, lane 3 HLCARTF).
// A HOOKJACK VARIANT: the same goblin line-rigger skin (src/hookjack.js; goblins in the High Lines are Daniel's 11-12 call), not a new foe family. A PURE foe module like src/hookjack.js: no DOM, no
// main.js. src/line-jumpers-hands.js is the thin wiring; tools/hl-jumpers.mjs is the node proof. Behind the cart flag (HL_CART, src/line-cart.js, ?hlcart=1, default OFF): nothing here is ever
// called with the flag off and no level carries jumper rows, so with it off no frame of the game runs a line of this.
//
// WHO HE IS and the whole fight (every number is in JK below):
//   idle     waits on his iron ARM above-ahead of the cart's rope. The cart comes within JK.tellLead px of the arm (it is running, a hero aboard): he
//   hang     HANGS from a short drop-line for JK.tell s = THE TELL: a yellow !, the arm creaks, a rope whistle, and a LANDING RING (a lit ring) on the cart floor where he will land. He is on screen
//            (the ride camera) for the whole of it. A hit on him or a shot that cuts the drop-line now = he falls and dies (KNOCK-OFF).
//   swing    JK.swing s swinging in; the ring follows the cart. He is in the air: the same knock-off (a shot at the line, a shot or blow at him).
//   land     LANDS with no guard: JK.stagger s STAGGER (pale flash). OPEN: any blow knocks him off his feet = off the cart = he falls and dies. Standing off the ring and hitting him here is the answer.
//   guard    then the hook rises, FRONT GUARD (a blow from the front x JK.guard, never immune; from behind whole), and he steps at the nearest hero on the cart (he stays JK.inset px inside the lips)
//   pullTell JK.pullTell s HOOK PULL tell: hook raised, yellow !, chain rattle. OPEN (a blow knocks him off the cart like the stagger). Then
//   pull     JK.pullT s: the hook reaches JK.pullReach px; JK.dmg dmg and a YANK of JK.yank px toward his side (at him from the middle; toward the lip he stands at when he is at an end) (src/line-cart.js dragOver: the lips are off for the drag, so two yanks at the lip
//            carry a hero over = the net, 10%). A held guard ('blocked') takes nothing and he recoils; a PARRY ('parried') spins him JK.spin s (gold ring, open): one blow knocks him off.
//   recover  JK.recover s guard up, backs off a step, then he comes again. Never two pulls inside JK.noStack s of each other (w.lastSwipe / w.swiped).
// KNOCK-OFF = KILL: his feet leave the cart (a hit in the stagger or the tell or the spin, a push over the lip - a front blow's knock, a shield bash, the warden's ward - or a cut drop-line) and he falls
// and dies. He drops ONE coin on the cart (the fight's reward). HP JK.hp (about half a Hookjack) only matters once he is guarding. Boarders left on a cart with no hero aboard fall off it.
// Positions: ON the cart he is e.off px from the cart's centre (e.x = cs.x + e.off, e.y = cs.floorY: the cart's moving floor carries him, he needs no platform of his own); in the air e.x/e.y are world.
// Every hero answers (tools/hl-jumpers.mjs proves it per class): see ANSWERS.
//
// DATA (a ride row, lane HLCARTL puts it in L.lineCarts[i].jumpers): { leg, ax: tile x of the arm, off: landing px from the cart centre (default 0, within +-JK.offMax), seats: min seats aboard (default 1) }
//   const e = newJumper(row, ride)    jumpersOf(ride, seats) -> [e]    jumperQuota(base, seats)   lintJumpers(ride) -> [problems]   jumperStep(e, dt, w)   jumperTake(e, dmg, fromX, w, o)
//   jumperPush(e, dx, w)  jumperCut(e, w)  jumperDied(e, w)  jumperOpen(e)  jumperBox(e)  jumperRope(e)  jumperShotHits(e, x, y, r)  jumperPose(e)  jumperRing(e)  drawJumper(g, e, cx, cy, time)
// w (the world, from the hands): { cart: cs (src/line-cart.js cartInit: x, floorY, dirX, legIdx, st, R, id), heroes(): [body] (cartRide === cs.id when aboard),
//   hurt(h, dmg, fromX) -> 'parried'|'blocked'|'hit'|'miss', drag(h, dx), time(), lastSwipe(), swiped(t), say(x, y, text, col), sound(k), mark(e, m), coin(x, y, off) }
import { drawHook } from './hookjack.js';

export const JK = {
  hp: 18, w: 10, h: 18, tell: 1.0, swing: 0.55, stagger: 0.5, guard: 0.4, pullTell: 0.7, pullT: 0.2, pullReach: 34, pullAt: 30, yank: 16, dmg: 12, recover: 0.7, spin: 1.2, gap: 0.4, noStack: 0.8,
  guardMin: 0.45, yankSide: 8, endAt: 12, footSpeed: 34, inset: 8, offMax: 22, knock: 7, ward: 26, bash: 30, recoil: 5, trig: 48, cartSpeed: 96, perchUp: 40, drop: 22, fallG: 900, fallT: 0.9, leave: 0.6,
  atOnce: 2, aboardMax: 3, cartW: 64, windowS: 5.5,   /* the most that are in the fight at once (ride 2); the co-op ceiling; the cart's width; one jumper's fight window in the overlap lint */
};
JK.tellLead = JK.cartSpeed * JK.tell + JK.trig;   /* the cart is this far short of the arm (along the leg) when he starts to hang: the tell runs out with the cart JK.trig short of it */
export const JK_SAY = { hang: 'HE BOARDS: STAND OFF THE RING', land: 'HE LANDS OPEN: HIT HIM', pull: 'HIS HOOK PULLS: BLOCK IT', clank: 'HIS HOOK GUARDS HIS FRONT', fell: 'KNOCKED OFF', parried: 'PARRIED: HE SPINS' };
/* THE ANSWER ROW (the per-class proof tools/hl-jumpers.mjs holds): every hero has at least two. 'stagger' = a base blow/shot in the landing stagger or either open tell; 'swing' = a shot that cuts the
   drop-line or hits him in the swing; 'block' = tap C block (the pull comes to nothing) or the parry (he spins, one blow knocks him off); 'push' = a shield bash / ward that sends him over the lip. */
export const ANSWERS = {
  knight: ['stagger', 'block'], berserker: ['stagger', 'block'], paladin: ['stagger', 'block', 'push'], reaper: ['stagger', 'block', 'swing'],
  ranger: ['stagger', 'swing', 'block'], pirate: ['stagger', 'swing', 'block'], pyro: ['stagger', 'swing', 'block'], geomancer: ['stagger', 'swing', 'block'], warden: ['stagger', 'block', 'push'],
};

export function newJumper(row, ride) {
  return { t: 'linejumper', hp: JK.hp, w: JK.w, h: JK.h, mode: 'idle', modeT: 0, face: -1, leg: row.leg, ax: row.ax * 16, off: Math.max(-JK.offMax, Math.min(JK.offMax, row.off || 0)), minSeats: row.seats || 1,
    ride: ride ? ride.id : null, x: row.ax * 16, y: 0, vx: 0, vy: 0, alive: true, anim: 0, flash: 0, emptyT: 0, ring: null, perchY: 0, sx: 0, sy: 0, hit: false,
    jN: { tells: 0, lands: 0, pulls: 0, parried: 0, blocked: 0, hits: 0, yanks: 0, clanks: 0, knockoffs: 0, coins: 0, cuts: 0, pushes: 0, replays: 0 } };
}
/* the quota in co-op: +1 per extra seat, never more than JK.aboardMax aboard */
export const jumperQuota = (base, seats) => Math.min(JK.aboardMax, base + Math.max(0, (seats || 1) - 1));
export function jumpersOf(ride, seats = 1) { return (ride.jumpers || []).filter(r => (r.seats || 1) <= seats).map(r => newJumper(r, ride)); }

/* ---------- helpers ---------- */
export const jumperOpen = e => e.mode === 'land' || e.mode === 'pullTell' || e.mode === 'spin' || e.mode === 'hang' || e.mode === 'swing';   /* a blow knocks him off: stagger, either tell, the spin, and the air */
const aboardMode = e => e.mode === 'land' || e.mode === 'guard' || e.mode === 'pullTell' || e.mode === 'pull' || e.mode === 'spin' || e.mode === 'recover';
const airMode = e => e.mode === 'hang' || e.mode === 'swing';
const living = h => !!h && h.alive !== false && !h.dead && !(h.down > 0);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function floorAt(cs, x) { const R = cs.R, i = clamp(cs.legIdx || 0, 0, R.legs.length - 1), L = R.legs[i]; return R.S[i].y + (L.dx ? L.dy * (x - R.S[i].x) / L.dx : 0); }
const heroesAboard = (w, cs) => w.heroes().filter(h => living(h) && h.cartRide === cs.id);
const nearest = (e, hs) => hs.slice().sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0];
function place(e, cs) { e.x = cs.x + e.off; e.y = cs.floorY; }
/* THE CART CAN CARRY HIM no further than its lips: he never walks off on his own */
const insetOff = () => JK.cartW / 2 - JK.inset;
/* a jumper who lands at an END of the cart HOLDS that end (he steps at you but never crosses toward the middle past JK.yankSide): his pulls then drag toward the lip he stands at */
const holdSide = e => { if (e.home && Math.sign(e.off) !== e.home) e.off = e.home * JK.yankSide; else if (e.home && Math.abs(e.off) < JK.yankSide) e.off = e.home * JK.yankSide; };

function knockOff(e, w, why, how) {
  if (e.fell || !e.alive) return;
  const cOff = how === 'push' && e.offAt !== undefined ? e.offAt : e.off;   /* the coin lands on the cart where he stood */
  e.fell = true; e.mode = 'fall'; e.modeT = JK.fallT; e.vy = 0; e.vx = (w.cart.dirX || 1) * 20; e.jN.knockoffs++; e.how = how || 'blow';
  if (e.how === 'cut') e.jN.cuts++; if (e.how === 'push') e.jN.pushes++;
  w.say(e.x, e.y - 30, why || JK_SAY.fell, '#8fd160'); w.sound('fell'); coin(e, w, cOff);
}
function coin(e, w, off0) { if (e.coined) return; e.coined = true; e.jN.coins++; const cs = w.cart, off = clamp(off0 === undefined ? e.off : off0, -insetOff(), insetOff()); w.coin(cs.x + off, cs.floorY, off); }

/* ---------- ONE FRAME ---------- */
export function jumperStep(e, dt, w) {
  if (!e.alive) return;
  const cs = w.cart, now = w.time(), hs = w.heroes(), aboard = heroesAboard(w, cs); e.anim += dt; if (e.flash > 0) e.flash -= dt;
  if (e.mode === 'idle' || airMode(e)) {   /* the ring on the cart floor: it follows the cart */
    const off = e.off; e.ring = { x: cs.x + off, y: cs.floorY, off, k: e.mode === 'hang' ? clamp(1 - e.modeT / JK.tell, 0, 1) : 1 };
  }
  if (aboardMode(e) && !aboard.length) { e.emptyT += dt; if (e.emptyT >= JK.leave) { knockOff(e, w, JK_SAY.fell, 'empty'); } } else e.emptyT = 0;   /* boarders left on an empty cart fall off it */
  switch (e.mode) {
    case 'idle': {
      if (cs.st !== 'run' || (cs.legIdx | 0) !== e.leg || !aboard.length) break;
      const ahead = (e.ax - cs.x) * cs.dirX;
      if (ahead > 0 && ahead <= JK.tellLead) {
        e.mode = 'hang'; e.modeT = JK.tell; e.x = e.ax; e.perchY = floorAt(cs, e.ax) - JK.perchUp; e.y = e.perchY; e.face = -cs.dirX; e.jN.tells++; e.hit = false;
        w.mark(e, '!'); w.sound('creak'); w.say(e.x, e.y - 34, JK_SAY.hang, '#ffd36b');
      }
      break; }
    case 'hang': {
      e.modeT -= dt; e.x = e.ax; e.y = e.perchY; e.face = -cs.dirX;
      if (!aboard.length) { e.mode = 'idle'; e.jN.replays++; break; }   /* everyone fell: he lets go of nothing - the leg is ridden again and he comes again */
      if (e.modeT <= 0) { e.mode = 'swing'; e.modeT = JK.swing; e.sx = e.x; e.sy = e.y; w.sound('swing'); }
      break; }
    case 'swing': {
      e.modeT -= dt; if (!aboard.length) { e.mode = 'idle'; e.jN.replays++; e.x = e.ax; e.y = e.perchY; break; }
      const k = clamp(1 - e.modeT / JK.swing, 0, 1), tx = cs.x + e.off, ty = cs.floorY;
      e.x = e.sx + (tx - e.sx) * k; e.y = e.sy + (ty - e.sy) * k * k; e.face = Math.sign(tx - e.sx) || e.face;
      if (e.modeT <= 0) { e.mode = 'land'; e.modeT = JK.stagger; e.flash = JK.stagger; e.jN.lands++; e.home = Math.abs(e.off) >= JK.endAt ? Math.sign(e.off) : 0; place(e, cs); w.sound('land'); w.say(e.x, e.y - 30, JK_SAY.land, '#ffd36b'); }
      break; }
    case 'land': { e.modeT -= dt; place(e, cs); const P = nearest(e, aboard); if (P) e.face = Math.sign(P.x - e.x) || e.face; if (e.modeT <= 0) { e.mode = 'guard'; e.modeT = JK.guardMin; } break; }
    case 'guard': case 'recover': {
      e.modeT -= dt; const P = nearest(e, aboard); let d = 1e9;
      if (P) { d = Math.abs(P.x - e.x); e.face = Math.sign(P.x - e.x) || e.face; }
      if (e.mode === 'recover') { if (e.modeT > 0) { e.off = clamp(e.off - e.face * JK.footSpeed * 0.5 * dt, -insetOff(), insetOff()); holdSide(e); } else { e.mode = 'guard'; e.modeT = JK.gap; } place(e, cs); break; }
      if (P && d > JK.pullAt - 8) { e.off = clamp(e.off + e.face * JK.footSpeed * dt, -insetOff(), insetOff()); holdSide(e); }
      place(e, cs);
      if (P && d <= JK.pullAt && Math.abs(P.y - e.y) < 24 && e.modeT <= 0) {
        if (now - w.lastSwipe() < JK.noStack) { e.held = (e.held || 0) + 1; }   /* another one's pull is in the air: he waits his turn (guard up) */
        else { e.mode = 'pullTell'; e.modeT = JK.pullTell; e.jN.tells++; w.mark(e, '!'); w.sound('tell'); w.say(e.x, e.y - 30, JK_SAY.pull, '#ffd36b'); }
      }
      break; }
    case 'pullTell': {
      e.modeT -= dt; place(e, cs);
      if (e.modeT <= 0 && now - w.lastSwipe() < JK.noStack) { e.modeT = 0.05; e.held = (e.held || 0) + 1; break; }   /* he HOLDS his tell (still open) */
      if (e.modeT <= 0) { e.mode = 'pull'; e.modeT = JK.pullT; e.hit = false; e.jN.pulls++; w.swiped(now); w.sound('swipe'); }
      break; }
    case 'pull': {
      e.modeT -= dt; place(e, cs);
      if (!e.hit) for (const h of aboard) {
        const dx = (h.x - e.x) * e.face; if (dx < -4 || dx > JK.pullReach || Math.abs(h.y - e.y) > 22) continue;
        e.hit = true; const r = w.hurt(h, JK.dmg, e.x);
        if (r === 'parried') { e.jN.parried++; e.mode = 'spin'; e.modeT = JK.spin; w.say(e.x, e.y - 30, JK_SAY.parried, '#ffd36b'); w.sound('parried'); }
        else if (r === 'blocked') { e.jN.blocked++; e.off = clamp(e.off - e.face * JK.recoil, -insetOff(), insetOff()); }
        else if (r === 'hit') { e.jN.hits++; e.jN.yanks++; w.drag(h, (e.home ? e.home : Math.sign(e.x - h.x)) * JK.yank);   /* toward HIS side: from a jumper who holds an end that is toward that lip (two yanks carry a hero over), from the middle straight at him */ }
        break;
      }
      if (e.mode === 'pull' && e.modeT <= 0) { e.mode = 'recover'; e.modeT = JK.recover; }
      break; }
    case 'spin': { e.modeT -= dt; place(e, cs); if (e.modeT <= 0) { e.mode = 'recover'; e.modeT = JK.recover * 0.5; } break; }
    case 'fall': {
      e.modeT -= dt; e.vy = Math.min(420, e.vy + JK.fallG * dt); e.y += e.vy * dt; e.x += e.vx * dt;
      if (e.modeT <= 0) { e.alive = false; e.gone = true; e.hp = 0; }
      break; }
  }
}

/* A BLOW LANDS (the hands call this from hurtEnemy, before the damage is taken): returns the damage to take. In the air, in the stagger, in either tell and in the spin a blow KNOCKS HIM OFF
   the cart (he falls and dies, so it returns his whole hp); guarded in front x JK.guard, whole from behind, and the blow's knock (o.knock px) pushes him: over a lip = off. */
export function jumperTake(e, dmg, fromX, w, o = {}) {
  if (!e.alive || e.mode === 'fall') return dmg;
  if (jumperOpen(e)) { knockOff(e, w, JK_SAY.fell, airMode(e) ? 'cut' : 'blow'); return Math.max(dmg, e.hp); }
  const front = Math.sign(fromX - e.x) === (e.face || 1); let d = dmg;
  if (front) { e.jN.clanks++; if (!e.saidClank) { e.saidClank = 1; w.say(e.x, e.y - 24, JK_SAY.clank, '#c8ccd4'); } w.sound('clank'); d = dmg * JK.guard; }
  const k = o.knock === undefined ? JK.knock : o.knock; if (k) { jumperPush(e, (Math.sign(e.x - fromX) || 1) * k, w); if (e.fell) return Math.max(dmg, e.hp); }
  return d;
}
/* a shove along the cart's floor (a front blow's knock, the paladin's shield bash JK.bash, the warden's ward JK.ward): over the lip = his feet leave the cart = off */
export function jumperPush(e, dx, w) {
  if (!aboardMode(e) || !e.alive) return false;
  e.offAt = e.off; e.off += dx;
  if (Math.abs(e.off) > JK.cartW / 2 - 2) { e.off = clamp(e.off, -JK.cartW / 2 - 2, JK.cartW / 2 + 2); place(e, w.cart); knockOff(e, w, JK_SAY.fell, 'push'); return true; }
  place(e, w.cart); return false;
}
/* a shot that cuts the drop-line (or hits him) while he hangs or swings: he falls (no cart under him) and dies */
export function jumperCut(e, w) { if (!airMode(e)) return false; knockOff(e, w, JK_SAY.fell, 'cut'); return true; }
/* he died of his hp (guarded): the coin, once */
export function jumperDied(e, w) { if (e.fell) return; e.alive = false; e.gone = true; e.hp = 0; e.mode = 'dead'; coin(e, w); }
export const jumperBox = e => ({ l: e.x - e.w / 2, r: e.x + e.w / 2, t: e.y - e.h, b: e.y });
/* the drop-line: from the arm down to his shoulders (a shot through it cuts it) */
export const jumperRope = e => airMode(e) ? { x0: e.mode === 'hang' ? e.ax : e.sx, y0: (e.mode === 'hang' ? e.perchY : e.sy) - JK.drop, x1: e.x, y1: e.y - e.h } : null;
export function jumperShotHits(e, x, y, r = 1) {
  const b = jumperBox(e); if (x >= b.l - r && x <= b.r + r && y >= b.t - r && y <= b.b + r) return true;
  const L = jumperRope(e); if (!L) return false;
  const dx = L.x1 - L.x0, dy = L.y1 - L.y0, l2 = dx * dx + dy * dy || 1, t = clamp(((x - L.x0) * dx + (y - L.y0) * dy) / l2, 0, 1); return Math.hypot(x - (L.x0 + dx * t), y - (L.y0 + dy * t)) <= r + 1;
}
export const jumperRing = e => e.ring;

/* ---------- THE LINT (the ride's rows) ---------- */
export function lintJumpers(ride, R) {
  const bad = [], rows = ride.jumpers || [], nLegs = ride.stations.length - 1, S = ride.stations.map(s => ({ x: s.x * 16, y: s.top * 16 }));
  const arrive = (leg, ax) => { let t = 0; for (let i = 0; i < leg; i++) t += Math.hypot(S[i + 1].x - S[i].x, S[i + 1].y - S[i].y) / JK.cartSpeed + 1.0; const dx = S[leg + 1].x - S[leg].x, dy = S[leg + 1].y - S[leg].y; const frac = (ax - S[leg].x) / (dx || 1); return t + frac * Math.hypot(dx, dy) / JK.cartSpeed; };
  const win = [];
  rows.forEach((r, i) => {
    const tag = 'jumper ' + i + ' (leg ' + r.leg + ', arm ' + r.ax + ')';
    if (!(r.leg >= 0 && r.leg < nLegs)) { bad.push(tag + ': no such leg'); return; }
    const ax = r.ax * 16, a = S[r.leg], b = S[r.leg + 1], dir = Math.sign(b.x - a.x) || 1;
    const fromStart = (ax - a.x) * dir, toEnd = (b.x - ax) * dir;
    if (fromStart < JK.tellLead) bad.push(tag + ': the tell would start before the cart is running (' + fromStart.toFixed(0) + ' px from the start, needs ' + JK.tellLead.toFixed(0) + ')');
    if (toEnd < JK.trig + JK.cartW) bad.push(tag + ': too close to the end of the leg (' + toEnd.toFixed(0) + ' px): he must land and be fought on the run');
    if (Math.abs(r.off || 0) > JK.offMax) bad.push(tag + ': the ring is outside the lips (off ' + r.off + ', max ' + JK.offMax + ')');
    const t0 = arrive(r.leg, ax) - JK.tellLead / JK.cartSpeed; win.push({ t0, t1: t0 + JK.tell + JK.swing + JK.windowS, seats: r.seats || 1, tag });
  });
  for (const x of win) { const n = win.filter(y => y.t0 < x.t1 && y.t1 > x.t0 && y.seats <= 1).length; if (n > JK.atOnce) bad.push(x.tag + ': ' + n + ' jumpers at once (max ' + JK.atOnce + ')'); }
  return bad;
}

/* ---------- THE POSES + THE GREYBOX (art owed: HLCARTART) ---------- */
export const JK_POSES = ['hang', 'swing', 'land', 'guard', 'pullTell', 'pull', 'spin', 'recover', 'fall'];
export const jumperPose = e => e.mode === 'idle' || e.mode === 'dead' ? null : e.mode;
const HOOK_MODE = { hang: 'ride', swing: 'ride', land: 'foot', guard: 'foot', pullTell: 'tell', pull: 'swipe', spin: 'spin', recover: 'foot', fall: 'fall' };
export function drawJumper(g, e, cx, cy, time) {
  if (!e.alive && e.mode !== 'fall') return;
  const ring = e.ring && (e.mode === 'hang' || e.mode === 'swing') ? e.ring : null;
  if (ring) { const x = Math.round(ring.x - cx), y = Math.round(ring.y - cy), r = 6 + Math.round((1 - ring.k) * 8); g.strokeStyle = ring.k > 0.6 ? '#ffd36b' : '#ff6b6b'; g.beginPath(); g.ellipse(x, y - 1, r, 3, 0, 0, Math.PI * 2); g.stroke(); }   /* THE LANDING RING on the cart floor */
  const L = jumperRope(e);
  if (L) { g.fillStyle = '#2a2420'; g.fillRect(Math.round(L.x0 - cx) - 5, Math.round(L.y0 - cy) - 14, 11, 3); g.fillStyle = '#9aa0a8'; g.fillRect(Math.round(L.x0 - cx), Math.round(L.y0 - cy) - 12, 1, 12);   /* the iron arm */
    g.strokeStyle = '#5a4630'; g.beginPath(); g.moveTo(Math.round(L.x0 - cx) + 0.5, Math.round(L.y0 - cy)); g.lineTo(Math.round(L.x1 - cx) + 0.5, Math.round(L.y1 - cy)); g.stroke(); }
  const h = { x: e.x, y: e.y, face: e.face || 1, mode: HOOK_MODE[e.mode] || 'foot', anim: e.anim, flash: e.flash > 0 ? 1 : 0, sawT: 0, hkN: {} };
  drawHook(g, h, cx, cy, time);
  if (e.mode === 'land' && e.flash > 0) { g.fillStyle = 'rgba(255,255,255,0.45)'; g.fillRect(Math.round(e.x - cx) - 5, Math.round(e.y - cy) - 19, 11, 19); }   /* the pale stagger flash */
}
