// src/canal-hands.js - THE FOG CANAL's hands in the game (claude/canal). src/canal-rig.js is the machinery (pure); this runs it against the live
// level: the water in the locks (the engine's pools), the gates and the swing bridges in the grid, the barge (a mover), the paddles, capstans,
// foghorns, lantern posts and the tiller struck by any hero's blow, the low beams, the weir run's jolts, the fog and what shows through it, and
// the two new foes' context (src/canal-foes.js). src/main.js hands it a context object H (its own globals behind functions) and calls
// canalReset / canalMover / canalUpdate / drawCanal / drawCanalMover / drawCanalFog / paintCanalRoom and the foe hooks - a few one-line
// hooks, so main.js carries almost nothing of it. Greybox: plain shapes the art lane replaces (docs/briefs/fog-canal.md, "art notes").
import * as R from './canal-rig.js';
import * as F from './canal-foes.js';
import { duckBox, duckClears } from './duck.js';
import { beamHit } from './chase.js';
const TS = 16;
const GADGET = new Set(['locksluice', 'swingcap', 'foghorn', 'lanternpost']);

/* A NEW ATTEMPT: the canal as the level was built, and the barge where the last checkpoint left her */
export function canalReset(H) {
  const L = H.L(); if (!L || !L.canal) return null;
  const D = L.canal, T = H.T;
  const st = R.newCanal(D); st.D = D; st.told = {}; st.props = []; st.beamCd = 0; st.hold = null; st.eyes = D.eyes || [];
  st.brights = (D.weeds || []).filter(w => w[3] === 'bright').map(([x0, x1, row]) => ({ x0, x1, row, t: 0, gone: 0 }));   /* BRIGHT WEED: a floor for RIG.weedHold s, then water */
  /* WHERE SHE WAITS: the mooring of the checkpoint the hero wakes at (the start's, if none) - and the locks and bridges as they stood when he lit it */
  const cp = H.checkpoint(), cpT = cp ? [Math.floor(cp.x / TS), Math.floor(cp.y / TS) - 1] : null;
  const moor = (cpT && D.moorings.find(m => m.cp && Math.abs(m.cp[0] - cpT[0]) <= 1 && Math.abs(m.cp[1] - cpT[1]) <= 2)) || D.moorings.find(m => !m.cp);
  if (moor) { for (const id of moor.fill || []) { const r = R.reachById(st, id); if (r) r.y = r.to = R.surfaceY(r.hi); }
    for (const [i, s] of Object.entries(moor.bridges || {})) { const b = st.bridges[+i]; if (b) { b.across = s !== 'open'; b.k = b.across ? 0 : 1; } }
    st.barge = R.newBarge(st, moor.x * TS); }
  R.gatesSettle(st);
  for (const g of st.gates) gateCells(H, g);
  for (const b of st.bridges) bridgeCells(H, b);
  syncPools(st, H);
  for (const e of L.ents) if (GADGET.has(e.t)) { const p = { t: e.t, e, x: e.x * TS + 8, y: (e.y + 1) * TS, reach: e.reach, bridge: e.bridge, fogs: e.fogs, flash: 0, cd: 0, lit: true };
    st.props.push(p); if (e.t === 'lanternpost') st.posts.push(p); if (e.t === 'foghorn') st.horns.push(p); }
  const m = bargeMover(H); if (m) { m.x = st.barge.x; m.y = st.barge.y; m.dx = 0; m.dy = 0; }
  H.resolve();
  return st;
}
const bargeMover = H => H.movers().find(q => q.canal);
function gateCells(H, g) { const T = H.T; for (let y = g.top; y <= g.bot; y++) H.cellSet(g.x, y, g.open ? T.AIR : T.SOLID); }
function bridgeCells(H, b) { const T = H.T, on = R.bridgeHolds(b); for (let x = b.x0; x <= b.x1; x++) H.cellSet(x, b.row, on ? T.ONEWAY : T.AIR); }
function syncPools(st, H) { const pools = H.L().pools || []; for (const r of st.reaches) { const p = pools[r.pool]; if (p) { p.y = r.y; p.depth = r.bed * TS - r.y; } } }
function hint(st, H, key, msg) { if (st.told[key]) return; st.told[key] = 1; H.hint(msg); }
export const tellHint = (st, H, key, msg) => { if (st) hint(st, H, key, msg); };

/* is a hero standing on her */
const aboard = (st, H) => { const m = bargeMover(H); let on = false; H.eachHero(P => { if (!P.dead && P.onMover === m) on = true; }); return on; };
const ahead = (st, H) => { const b = st.barge; let a = false; H.eachHero(P => { if (!P.dead && P.x > b.x + b.w / 2 + 8) a = true; }); return a; };   /* ahead of her middle: she comes on until she is under you */
/* THE WAY BACK FOR HER: nobody aboard, nobody ahead, a hero on dry ground at her deck's height (a quay, a gate's top) behind her in the same water - she comes back up for him (never through
   a shut gate, a bridge across or a thick bank), so a fall is never a barge left out of reach */
function comeBack(st, H, dt) {
  const b = st.barge; if (b.mode !== 'float') return;
  let want = null; H.eachHero(P => { if (!P.dead && P.ground && !P.onMover && P.x < b.x && b.x - P.x < 520 && Math.abs(P.y - b.y) <= 24) want = want === null ? P.x : Math.max(want, P.x); });
  if (want === null) return;
  let floor = st.reaches[0].x0 * TS;
  for (const g of st.gates) { const gx = (g.x + 1) * TS; if (!g.open && gx <= b.x + 2 && gx > floor) floor = gx; }
  for (const br of st.bridges) { const bx = (br.x1 + 1) * TS; if (R.bridgeHolds(br) && bx <= b.x + 2 && bx > floor) floor = bx; }
  for (const f of st.fogs) { const fx = (f.x1 + 1) * TS; if (R.fogThickAhead(f) && fx <= b.x + 2 && fx > floor) floor = fx; }
  const to = Math.max(floor, want - 20); if (to < b.x - 1) { b.x = Math.max(to, b.x - R.RIG.drift * dt); b.back = true; } else b.back = false;
}

/* ONE FRAME OF THE WATER AND OF HER, from updateMovers (before the heroes move, so she carries them this frame) */
export function canalMover(st, H, m, dt) {
  if (!st) { m.dx = 0; m.dy = 0; return true; }
  const b = st.barge, gx0 = g => g.x * TS, gx1 = g => (g.x + 1) * TS;
  const busy = g => (b.x < gx1(g) && b.x + b.w > gx0(g)) || H.bodies().some(q => { const bx = H.box(q); return bx.r > gx0(g) && bx.l < gx1(g) && bx.b > g.top * TS && bx.t < (g.bot + 1) * TS; });
  for (const ev of R.lockStep(st, dt, busy)) {
    if (ev.t === 'open' || ev.t === 'shut') { gateCells(H, ev.g); H.resolve(); if (H.near(ev.g.x * TS, ev.g.top * TS, 320)) { H.sfx.gateLift ? H.sfx.gateLift() : H.sfx.clank(); } }
    if (ev.t === 'still' && H.near(ev.r.x0 * TS, ev.r.y, 360)) H.sfx.thud(); }
  syncPools(st, H);
  const x0 = b.x, y0 = b.y, go = aboard(st, H) || ahead(st, H);
  for (const ev of R.bargeStep(st, dt, go)) bargeEvent(st, H, ev);
  if (!go && b.mode === 'float') { comeBack(st, H, dt); b.reach = R.reachAt(st, b.x + b.w / 2); b.y = R.deckOf(st.reaches[b.reach].y); }
  m.x = b.x; m.y = b.y; m.dx = b.x - x0; m.dy = b.y - y0; m.w = b.w;
  return true;
}
function bargeEvent(st, H, ev) {
  const S = H.sfx;
  if (ev.t === 'hold') { const why = ev.why;
    if (why === 'gate') hint(st, H, 'hold-gate', 'THE GATE AHEAD IS SHUT: THE WATER EITHER SIDE OF IT IS NOT LEVEL. WORK THE PADDLE.');
    else if (why === 'bridge') hint(st, H, 'hold-bridge', 'THE BRIDGE STANDS ACROSS THE WATER: HER LANTERN POLE WILL NOT PASS UNDER IT.');
    else if (why === 'fog') hint(st, H, 'hold-fog', 'SHE WILL NOT GO INTO FOG THAT THICK. A FOGHORN CLEARS IT FOR A WHILE.'); }
  else if (ev.t === 'burst') { const g = ev.g; gateCells(H, g); H.resolve(); S.gateDrop ? S.gateDrop() : S.thud(); S.splash && S.splash(); H.shake(6);
    hint(st, H, 'burst', 'THE GATE BURSTS AND SHE RUNS FOR THE WEIR. THE TILLER STEERS HER: STRIKE IT FOR THE MILL CUT.'); }
  else if (ev.t === 'junction') H.hint(ev.helm === 'cut' ? 'THE MILL CUT: LOW BEAMS AHEAD - DUCK.' : 'OVER THE BROKEN WEIR: BRACE - OR BE IN THE AIR WHEN SHE LANDS.');
  else if (ev.t === 'crash') { H.shake(8); S.thud(); S.splash && S.splash(); const m = bargeMover(H);
    H.eachHero(P => { if (!P.dead && P.onMover === m && P.ground) H.hurtHero(P.x, R.RIG.crash, { unblockable: true, name: 'THE WEIR' }); }); }
  else if (ev.t === 'landed') { hint(st, H, 'landed', 'THE BASIN. THE THEATRE IS ACROSS IT - AND THE FOG IS THICK.'); }
}

/* ONE FRAME OF THE REST, after the heroes and the foes have moved (from updateVillage) */
export function canalUpdate(st, H, dt) {
  if (!st) return; const S = H.sfx, b = st.barge, m = bargeMover(H);
  st.clock += dt;
  // ---- THE STRIKES: any hero's blow on a paddle, a capstan, a horn, a post, or her tiller ----
  const tiller = st.tiller = st.tiller || { t: 'tiller', flash: 0 }; tiller.x = b.x + b.w / 2; tiller.y = b.y;   /* the helm, amidships */   /* one object for the whole attempt: a swing strikes it once */
  H.eachHero(P => { const hb = H.attackBox(); if (!hb || P.dead) return;
    for (const pr of st.props.concat([tiller])) { if (P.hitSet.has(pr)) continue;
      const box = pr.t === 'lanternpost' ? { l: pr.x - 8, r: pr.x + 8, t: pr.y - 30, b: pr.y } : { l: pr.x - 10, r: pr.x + 10, t: pr.y - 24, b: pr.y + 2 };
      if (!H.overlap(hb, box)) continue; P.hitSet.add(pr); pr.flash = 0.25; H.sparks(pr.x, pr.y - 12, P.face || 1, 4);
      if (pr.t === 'locksluice') { const rr = R.reachById(st, pr.reach); if (rr && Math.abs(rr.to - rr.y) > 0.5) { S.clank(); continue; }   /* the water is still moving: the paddle is fast until it settles (a fight beside it cannot undo it) */
        const what = R.strikeSluice(st, pr.reach); S.ratchet ? S.ratchet() : S.clank(); S.splash && S.splash();
        hint(st, H, 'sluice', what === 'fill' ? 'THE PADDLE IS UP: THE CHAMBER FILLS. THE GATE AHEAD OPENS WHEN THE WATER IS LEVEL.' : 'THE PADDLE IS DOWN: THE CHAMBER EMPTIES.'); }
      else if (pr.t === 'swingcap') { const br = st.bridges[pr.bridge]; if (!br) continue; R.strikeBridge(br); S.chain ? S.chain() : S.clank(); S.gateLift && S.gateLift(); }
      else if (pr.t === 'foghorn') { const h = pr; h.fogs = h.fogs || []; if (R.blowHorn(st, h)) { S.roar ? S.roar() : S.thud(); H.shake(2); hint(st, H, 'horn', 'THE FOGHORN: THE FOG LIFTS - FOR A WHILE. EVERY ARCHER SEES YOU NOW.'); } else S.clank(); }
      else if (pr.t === 'lanternpost') { const lit = R.strikePost(pr); S.clank(); hint(st, H, 'post', lit ? 'THE LANTERN IS LIT: YOU SEE - AND ARE SEEN.' : 'THE LANTERN IS OUT: IN THE DARK THE ARCHERS CANNOT SEE YOU. NOR CAN YOU.'); }
      else if (pr.t === 'tiller' && P.onMover === m) { const helm = R.strikeTiller(b); S.clank(); H.hint(helm === 'cut' ? 'THE HELM: THE MILL CUT.' : 'THE HELM: THE WEIR.'); }
    } });
  for (const pr of st.props) if (pr.flash > 0) pr.flash -= dt;
  // ---- THE BRIGHT WEED: stood on, it holds a moment and gives; empty, it knits together again ----
  for (const w of st.brights) { const x0 = w.x0 * TS, x1 = (w.x1 + 1) * TS, top = w.row * TS; let on = false;
    H.eachHero(P => { if (!P.dead && P.ground && !P.onMover && P.x > x0 - 3 && P.x < x1 + 3 && Math.abs(P.y - top) < 3) on = true; });
    if (w.gone > 0) { w.gone -= dt; if (w.gone <= 0 && !H.bodies().some(q => { const bx = H.box(q); return bx.r > x0 && bx.l < x1 && bx.b > top && bx.t < top + TS; })) { for (let x = w.x0; x <= w.x1; x++) H.cellSet(x, w.row, H.T.ONEWAY); H.resolve(); } else if (w.gone <= 0) w.gone = 0.3; continue; }
    w.t = on ? w.t + dt : Math.max(0, w.t - dt * 2);
    if (on) hint(st, H, 'weed', 'BRIGHT WEED: IT HOLDS YOU A MOMENT, THEN GIVES. KEEP MOVING.');
    if (w.t >= R.RIG.weedHold) { w.t = 0; w.gone = R.RIG.weedBack; for (let x = w.x0; x <= w.x1; x++) H.cellSet(x, w.row, H.T.AIR); H.resolve(); S.splash && S.splash(); } }
  // ---- THE SWING BRIDGES ----
  for (const br of st.bridges) { const ev = R.bridgeStep(br, dt); if (ev) { bridgeCells(H, br); H.resolve(); if (H.near(br.x0 * TS, br.row * TS, 360)) S.thud(); } }
  // ---- THE FOG ----
  for (const ev of R.fogStep(st, dt)) if (ev.t === 'rollback' && H.near((ev.f.x0 + ev.f.x1) * 8, H.hero().y, 400)) { S.roar ? S.roar() : S.thud(); }
  // ---- THE LOW BEAMS (the teaching one on the Waymeet pound; the weir's are the chase's) ----
  st.beamCd = Math.max(0, st.beamCd - dt);
  H.eachHero(P => { if (P.dead || st.beamCd > 0) return; for (const bm of st.D.beams || []) if (beamHit(duckBox(P), duckClears(P, bm.y), bm, H.time())) { st.beamCd = 1; H.hurtHero((bm.x0 + bm.x1) / 2, bm.dmg || 10, { unblockable: true, name: bm.name }); S.thud(); H.shake(3); hint(st, H, 'beam', 'DUCK UNDER A LOW BEAM: HOLD DOWN ON THE DECK.'); } });
  // ---- THE WAY BACK: the last dry ground you stood on (the canal hands you back to it); on the weir run (and anywhere in the race below the burst gate), the basin's bank ----
  H.eachHero(P => { if (P.dead) return;
    if (st.D.weir && ((b.mode === 'loose' && P.onMover === m) || (P.x > st.D.weir.head[0][0] && P.x < st.D.weir.end - 48 && !P.onMover))) P.safe = { x: st.D.weir.bank[0], y: st.D.weir.bank[1], L: H.L() };
    else if (P.onMover === m && b.mode === 'float') P.safe = { x: Math.max(b.x + 12, Math.min(b.x + b.w - 12, P.x)), y: b.y - 4, L: H.L() };   /* off her deck into the water: back onto her deck (she waits for whoever is not aboard) */
    else if (P.ground && !P.onMover && !P.climb && !R.inWeed(st.D, st, P.x, P.y) && H.solidUnder(P.x, P.y)) P.safe = { x: P.x, y: P.y, L: H.L() }; });
  // ---- THE HINTS THAT TEACH WHAT SHE DOES ----
  if (m && H.hero().onMover === m) hint(st, H, 'board', 'SHE CASTS OFF. SHE CARRIES YOU WHILE YOU RIDE HER, AND WAITS FOR YOU WHEN YOU ARE AHEAD.');
  if (b.x > 128 * TS && b.x < 150 * TS && !aboard(st, H)) hint(st, H, 'arch', 'SHE GOES ON THROUGH THE ARCH WITHOUT YOU. CATCH HER ON THE FAR SIDE.');
}
/* IS (x, y) LIT: out of the fog, in air a horn has cleared, or in a lantern's light */
export const litAt = (st, x, y) => !st || R.litAt(st, x, y);
export const clearedAt = (st, x, y) => !!st && R.fogAt(st, x, y).some(f => f.fade < 0.3);
/* the water surface under column x: { y, id } from the canal's reaches and its other deep pools  */
export function surfaceAt(st, H, x) {
  if (!st) return null; for (const p of H.L().pools || []) if (!p.dry && x > p.x0 && x < p.x1 && p.canal && p.canal !== 'dock') return { y: p.y, id: p.canal };   /* (the race and the lower river run shallow; the dock has no grindylows) */
  return null;
}

/* ================= THE LOOK (greybox: plain shapes; the art lane replaces them) ================= */
export function drawCanalMover(st, g, H, m, cx, cy, time) {
  const b = st ? st.barge : null, x = Math.round(m.x - cx), y = Math.round(m.y - cy), w = m.w;
  g.fillStyle = '#3a2618'; g.fillRect(x, y, w, 10); g.fillStyle = '#5a3a22'; g.fillRect(x, y, w, 3); g.fillStyle = '#2a1a10'; g.fillRect(x + 2, y + 9, w - 4, 3);   /* the hull and her gunwale */
  g.fillStyle = '#7a5a36'; for (let k = 8; k < w - 6; k += 14) g.fillRect(x + k, y + 4, 8, 2);                                                                    /* the hatch boards */
  g.fillStyle = '#4a3a2a'; g.fillRect(x + 6, y - 34, 2, 34);                                                                                                        /* the lantern pole at her stern */
  const flick = 0.8 + 0.2 * Math.sin(time * 9); g.fillStyle = '#ffcf6a'; g.globalAlpha = flick; g.fillRect(x + 3, y - 40, 8, 7); g.globalAlpha = 1; g.fillStyle = '#6a5030'; g.fillRect(x + 3, y - 41, 8, 1);
  /* THE TILLER, and which way it has her helm (up: the mill cut; down: the weir) */
  const hx = x + (w >> 1); g.fillStyle = '#6a4a2a'; g.fillRect(hx - 1, y - 8, 3, 8); g.fillRect(hx + 1, y - 8, 7, 2);
  if (b) { const up = b.helm === 'cut'; g.fillStyle = up ? '#8fd160' : '#ff9a5c'; g.fillRect(hx + 3, y - 16, 1, 5); if (up) g.fillRect(hx + 2, y - 15, 3, 1); else g.fillRect(hx + 2, y - 12, 3, 1); }
}
export function drawCanal(st, g, H, cx, cy, VW, VH, time) {
  if (!st) return; const L = H.L(), D = st.D;
  const on = (x0, x1) => x1 * TS >= cx - 40 && x0 * TS <= cx + VW + 40;
  // ---- the weed: a green mat on the water that reads as ground (the teaching and the lie) ----
  for (const [x0, x1, row, kind] of D.weeds || []) { if (!on(x0, x1 + 1)) continue; const sx = x0 * TS - cx, w = (x1 - x0 + 1) * TS, sy = row * TS - cy, br = kind === 'bright' && st.brights.find(q => q.x0 === x0 && q.row === row);
    if (br && br.gone > 0) continue;   /* given way: nothing there but the water */
    const k0 = br ? br.t / R.RIG.weedHold : 0, shake = br && br.t > 0 ? Math.round(Math.sin(time * 40) * k0 * 1.5) : 0;
    g.fillStyle = kind === 'bright' ? '#4a8a3a' : '#1e3424'; g.fillRect(sx + shake, sy, w, 5); g.fillStyle = kind === 'bright' ? (k0 > 0.6 ? '#c8e070' : '#8ad060') : '#2e4a30'; for (let k = 0; k < w; k += 6) g.fillRect(sx + k + shake, sy + ((k / 6) % 2), 4, 2); }
  // ---- the lock gates: timber leaves over the rock the grid keeps for them, and the water line on each side ----
  for (const gt of st.gates) { if (!on(gt.x, gt.x + 1)) continue; const sx = gt.x * TS - cx, sy = gt.top * TS - cy, h = (gt.bot - gt.top + 1) * TS;
    if (gt.open) { g.fillStyle = '#3a2a1a'; g.fillRect(sx, sy, 3, 6); continue; }
    g.fillStyle = '#4a3422'; g.fillRect(sx, sy, TS, h); g.fillStyle = '#6a4a2e'; for (let k = 6; k < h; k += 12) g.fillRect(sx + 1, sy + k, TS - 2, 2); g.fillStyle = '#8a6a44'; g.fillRect(sx, sy, TS, 3);
    g.fillStyle = '#2a1a10'; g.fillRect(sx + 3, sy + 2, 2, h - 4); }
  // ---- the swing bridges: the deck across, or swung (a short stub at its pivot, foreshortened) ----
  for (const br of st.bridges) { if (!on(br.x0 - 1, br.x1 + 1)) continue; const sy = br.row * TS - cy, k = br.k, w = (br.x1 - br.x0 + 1) * TS;
    const px0 = (br.pivot === 'R' ? (br.x1 + 1) * TS : br.x0 * TS) - cx, len = Math.round(w * Math.cos(k * Math.PI / 2)), sx = br.pivot === 'R' ? px0 - len : px0;
    g.fillStyle = '#5a4028'; g.fillRect(sx, sy, Math.max(4, len), 5); g.fillStyle = '#8a6a44'; g.fillRect(sx, sy, Math.max(4, len), 2);
    g.fillStyle = '#3a2a1a'; for (let q = 4; q < len - 2; q += 12) g.fillRect(sx + q, sy - 8, 2, 8); if (len > 8) g.fillRect(sx, sy - 8, len, 2); }
  // ---- the low beams of the Waymeet pound: timbers hanging from the footbridge ----
  for (const bm of D.beams || []) { const sx = bm.x0 - cx, w = bm.x1 - bm.x0; if (sx > VW || sx + w < 0) continue; const top = Math.floor(bm.y / TS) * TS - 24 - cy;
    g.fillStyle = '#4a3422'; g.fillRect(sx, top, w, bm.y - cy - top); g.fillStyle = '#ff9a5c'; g.globalAlpha = 0.6; g.fillRect(sx, bm.y - cy - 2, w, 2); g.globalAlpha = 1; }
  // ---- the machines ----
  for (const pr of st.props) { const x = Math.round(pr.x - cx), y = Math.round(pr.y - cy); if (x < -30 || x > VW + 30 || y < -60 || y > VH + 40) continue; const fl = pr.flash > 0;
    if (pr.t === 'locksluice') { const r = R.reachById(st, pr.reach), up = r && Math.abs(r.to - R.surfaceY(r.hi)) < 1; g.fillStyle = '#3a3a44'; g.fillRect(x - 2, y - 18, 4, 18);
      g.strokeStyle = fl ? '#ffffff' : up ? '#8fd160' : '#c8a040'; g.lineWidth = 2; g.beginPath(); g.arc(x, y - 18, 6, 0, Math.PI * 2); g.stroke(); const a = (r ? r.y : 0) / 6; g.fillStyle = g.strokeStyle; g.fillRect(x + Math.round(Math.cos(a) * 5) - 1, y - 18 + Math.round(Math.sin(a) * 5) - 1, 2, 2); }
    else if (pr.t === 'swingcap') { const br = st.bridges[pr.bridge]; g.fillStyle = '#4a3a2a'; g.fillRect(x - 6, y - 10, 12, 10); g.fillStyle = fl ? '#ffffff' : br && R.bridgeHolds(br) ? '#c8a040' : '#8fd160'; g.fillRect(x - 8, y - 12, 16, 2); g.fillRect(x - 1, y - 16, 2, 6); }
    else if (pr.t === 'foghorn') { g.fillStyle = '#5a5048'; g.fillRect(x - 1, y - 20, 3, 20); g.fillStyle = fl ? '#ffffff' : '#b8a060'; g.beginPath(); g.moveTo(x, y - 22); g.lineTo(x + 12, y - 28); g.lineTo(x + 12, y - 14); g.closePath(); g.fill();
      const k = pr.cd > 0 ? 1 - pr.cd / R.RIG.hornWind : 1; g.fillStyle = '#1b1626'; g.fillRect(x - 8, y - 32, 16, 3); g.fillStyle = k >= 1 ? '#8fd160' : '#c8a040'; g.fillRect(x - 7, y - 31, Math.round(14 * k), 1); }   /* the wind-up gauge: green, it will sound */
    else if (pr.t === 'lanternpost') { g.fillStyle = '#3a3040'; g.fillRect(x - 1, y - 26, 2, 26); g.fillStyle = pr.lit ? '#ffcf6a' : '#4a4038'; g.fillRect(x - 3, y - 32, 6, 6); g.fillStyle = '#2a2020'; g.fillRect(x - 4, y - 33, 8, 1); }
  }
  // ---- JENNY'S SIGNS, cheap and told: a child's shoe on a lock step, bubbles by the bank where nothing lives ----
  for (const [sx0, sy0] of D.shoes || []) { const x = sx0 * TS + 6 - cx, y = (sy0 + 1) * TS - cy; if (x < -10 || x > VW + 10) continue; g.fillStyle = '#6a3a2a'; g.fillRect(x, y - 3, 6, 3); g.fillStyle = '#8a5a3a'; g.fillRect(x, y - 4, 3, 1); }
  for (const [bx, row] of D.bubbles || []) { const x = bx * TS + 8 - cx, s = surfaceAt(st, H, bx * TS + 8), y = (s ? s.y : row * TS) - cy; if (x < -10 || x > VW + 10) continue; const ph = (time * 0.7 + bx * 0.37) % 1; if (ph < 0.45) { g.globalAlpha = 0.6 - ph; g.strokeStyle = '#9ad8c0'; g.lineWidth = 1; g.beginPath(); g.ellipse(x + Math.sin(bx) * 6, y, 2 + ph * 14, 1 + ph * 3, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; } }
}
/* THE FOG, over everything: holes for the hero, each lit post and her lantern; the theatre's glow ahead through it; the wisps and the lanterns burning on top */
let FOGC = null;
export function drawCanalFog(st, g, H, cx, cy, VW, VH, time) {
  if (!st || st.noFog) return; const fogs = st.fogs.filter(f => f.x1 * TS >= cx && f.x0 * TS <= cx + VW && f.y1 * TS >= cy && f.y0 * TS <= cy + VH);
  if (!FOGC || FOGC.width !== VW || FOGC.height !== VH) { FOGC = H.makeCanvas(VW, VH); } if (!FOGC) return;
  const fg = FOGC.getContext('2d'); fg.globalCompositeOperation = 'source-over'; fg.clearRect(0, 0, VW, VH);
  for (const f of fogs) { const a = f.a * f.fade; if (a < 0.02) continue; const x0 = Math.max(0, f.x0 * TS - cx), x1 = Math.min(VW, (f.x1 + 1) * TS - cx), y0 = Math.max(0, f.y0 * TS - cy), y1 = Math.min(VH, (f.y1 + 1) * TS - cy);
    fg.fillStyle = 'rgba(' + (f.thick ? '176,190,188' : '150,168,166') + ',' + a.toFixed(3) + ')'; fg.fillRect(x0, y0, x1 - x0, y1 - y0); }
  fg.globalCompositeOperation = 'destination-out';
  const hole = (x, y, r) => { const gr = fg.createRadialGradient(x, y, r * 0.35, x, y, r); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); fg.fillStyle = gr; fg.fillRect(x - r, y - r, r * 2, r * 2); };
  H.eachHero(P => { if (!P.dead) hole(P.x - cx, P.y - 8 - cy, 34); });
  for (const p of st.posts) if (p.lit) hole(p.x - cx, p.y - 20 - cy, R.RIG.postR);
  const b = st.barge; hole(b.x + 10 - cx, b.y - 30 - cy, R.RIG.bargeR);
  fg.globalCompositeOperation = 'source-over';
  /* THE THEATRE, lit, ahead through the fog the whole way: a warm glow low in the fog at the screen's far side, stronger the nearer you come */
  const k = Math.min(1, Math.max(0, cx / (360 * TS))), gx = VW * 0.86, gy = VH * 0.42, gr = fg.createRadialGradient(gx, gy, 4, gx, gy, 90 + 60 * k);
  gr.addColorStop(0, 'rgba(255,196,110,' + (0.28 + 0.3 * k).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(255,196,110,0)'); fg.fillStyle = gr; fg.fillRect(gx - 160, gy - 160, 320, 320);
  g.drawImage(FOGC, 0, 0);
  /* the lanterns and the wisps burn on top of the fog - the one warm, the other cold: that is the read */
  for (const p of st.posts) if (p.lit) { const x = p.x - cx, y = p.y - 29 - cy; if (x < -20 || x > VW + 20) continue; g.globalAlpha = 0.5 + 0.1 * Math.sin(time * 7 + p.x); g.fillStyle = '#ffcf6a'; g.fillRect(x - 3, y - 3, 6, 6); g.globalAlpha = 1; }
  for (const e of H.enemies()) if (e.alive && e.t === 'willowisp') { const x = e.x - cx, y = e.y + (e.bob || 0) - 6 - cy; if (x < -20 || x > VW + 20) continue; const gr2 = g.createRadialGradient(x, y, 1, x, y, 16);
    gr2.addColorStop(0, 'rgba(160,255,210,' + (e.mode === 'flareTell' ? 0.9 : 0.55) + ')'); gr2.addColorStop(1, 'rgba(160,255,210,0)'); g.fillStyle = gr2; g.fillRect(x - 16, y - 16, 32, 32); }
  /* EYES IN THE FOG (Jenny's, glimpsed): a pair that opens now and then where the fog is thickest, and is gone */
  for (const [ex, ey, ph] of st.eyes) { const x = ex * TS - cx, y = ey * TS - cy; if (x < -10 || x > VW + 10 || y < -10 || y > VH + 10) continue; const u = (time * 0.23 + (ph || 0)) % 1; if (u > 0.12) continue;
    g.globalAlpha = Math.sin(u / 0.12 * Math.PI) * 0.8; g.fillStyle = '#b8ff8a'; g.fillRect(x, y, 2, 1); g.fillRect(x + 5, y, 2, 1); g.globalAlpha = 1; }
}
/* A CANAL FOE'S OWN MARKS (drawn before the body): a grindylow under the water is its ripples - and its shadow, in a lantern's light */
export function drawCanalFoeFx(st, g, H, e, cx, cy, time) {
  if (e.t !== 'grindylow') return; const s = surfaceAt(st, H, e.x); if (!s) return; const x = Math.round(e.x - cx), y = Math.round(s.y - cy);
  if (e.mode === 'rippleTell') { const k = 1 - Math.max(0, e.modeT) / F.GRIND.tell; g.strokeStyle = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#c8ffe0'; g.lineWidth = 1; for (let q = 0; q < 3; q++) { g.beginPath(); g.ellipse(x, y, 4 + q * 5 + k * 4, 1.5 + q, 0, 0, Math.PI * 2); g.stroke(); } }
  else if (e.mode === 'lurk' || e.mode === 'dunk') { if (litAt(st, e.x, s.y - 8)) { g.globalAlpha = 0.35; g.fillStyle = '#1e3a28'; g.beginPath(); g.ellipse(x, y + 7, 7, 3, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#e8f8c8'; g.fillRect(x + 1, y + 5, 1, 1); g.fillRect(x + 4, y + 5, 1, 1); g.globalAlpha = 1; } }
}
export const canalFoeShown = e => e.t !== 'grindylow' || F.grindylowUp(e);

/* the rooms, greybox: a colour a room and a few lines, so the spaces read apart */
const ROOM = { cnWarehouse: ['#2a2622', '#322c26'], cnMill: ['#2e2820', '#3a3226'], cnDoor: ['#1a2224', '#222c2e'] };
export function paintCanalRoom(g, rs, sx, sy, w, h) {
  const c = ROOM[rs]; if (!c) return false;
  g.fillStyle = c[0]; g.fillRect(sx, sy, w, h); g.fillStyle = c[1]; for (let x = sx; x < sx + w; x += 32) g.fillRect(x, sy, 2, h);
  return true;
}
