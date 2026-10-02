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
import * as CTL from './redraw/canal_tiles.js';
import * as CP from './redraw/canal_props.js';
import { CANAL_NUDGE } from './hint-lines.js';
const TS = 16;
const GADGET = new Set(['locksluice', 'swingcap', 'foghorn', 'lanternpost']);

/* THE TILE KIT (src/redraw/canal_tiles.js): the level's own data tells it where the water stands, the gates, the bridges and the weed */
export function canalTile(t, x, y, at, T, L) { const D = L.canal; if (!D) return null;
  if (!D.tctx) D.tctx = { T, gates: D.gates, bridges: D.bridges, rooms: L.interiors || [], jetties: D.jetties || [], grates: D.grates || [], hatches: new Set((D.hatches || []).map(([x, y]) => x + ',' + y)), lock: L.lockArena ? { sx: L.lockArena.sx, R: L.lockArena.R } : null, weedCells: new Set((D.weeds || []).flatMap(([x0, x1, row]) => { const o = []; for (let i = x0; i <= x1; i++) o.push(i + ',' + row); return o; })),
    levels: (D.reaches || []).flatMap(r => [...new Set([r.lo, r.hi])].map(row => ({ row, x0: r.x0, x1: r.x1 }))) };
  return CTL.canalTile(t, x, y, at, D.tctx); }

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
  st.carriers = []; st.gang = { on: false, t: 0, skiff: null }; st.boomCd = 0; st.lapCd = 0;
  for (const e of L.ents) if (GADGET.has(e.t)) { const p = { t: e.t, e, x: e.x * TS + 8, y: (e.y + 1) * TS, reach: e.reach, bridge: e.bridge, fogs: e.fogs, clear: e.clear, flash: 0, cd: 0, lit: e.lit !== false };
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
  const x0 = b.x, y0 = b.y, on = aboard(st, H), go = on || ahead(st, H) || underArch(st, on);
  for (const ev of R.bargeStep(st, dt, go)) bargeEvent(st, H, ev);
  if (!go && b.mode === 'float') { comeBack(st, H, dt); b.reach = R.reachAt(st, b.x + b.w / 2); b.y = R.deckOf(st.reaches[b.reach].y); }
  m.x = b.x; m.y = b.y; m.dx = b.x - x0; m.dy = b.y - y0; m.w = b.w;
  floodLaps(st, H);
  return true;
}
/* THE LONG ARCH (claude/canalfix, review fix 7): with her bow at the arch's mouth and nobody aboard, she goes on through it - whoever was scraped
   off at the face is not left waiting for her to come back under him */
function underArch(st, on) { const a = st.D.arch, b = st.barge; return !!a && !on && b.mode === 'float' && b.x + b.w >= a[0] * TS - 10 && b.x < (a[1] + 1) * TS; }
/* THE FLOOD LAPS HER STERN (claude/canalfix, review fix 3): on THE HEAD RACE's steps she runs slow (RIG.headRace) and the flood's front is kept at
   least at her stern + RIG.lap - a rider standing aft is in it (the chase's own contact: its damage, then its hold); one standing forward is not */
function floodLaps(st, H) {
  const b = st.barge; if (!R.onHeadRace(st) || !H.chases) return;
  for (const c of H.chases()) { if (!c.sp || c.sp.id !== 'weir' || !c.st || c.st.phase !== 'run' || c.st.hold > 0) continue;
    const front = b.x + R.RIG.lap; if (c.st.pos < front) c.st.pos = front; }
}
function bargeEvent(st, H, ev) {
  const S = H.sfx;
  if (ev.t === 'hold') { const why = ev.why;
    if (why === 'gate') hint(st, H, 'hold-gate', 'THE GATE AHEAD IS SHUT: THE WATER EITHER SIDE OF IT IS NOT LEVEL. WORK THE PADDLE.');
    else if (why === 'bridge') hint(st, H, 'hold-bridge', 'THE BRIDGE STANDS ACROSS THE WATER: HER LANTERN POLE WILL NOT PASS UNDER IT.');
    else if (why === 'fog') hint(st, H, 'hold-fog', 'SHE WILL NOT GO INTO FOG THAT THICK. A FOGHORN CLEARS IT FOR A WHILE.'); }
  else if (ev.t === 'burst') { const g = ev.g; gateCells(H, g); H.resolve(); S.gateDrop ? S.gateDrop() : S.thud(); S.splash && S.splash(); H.shake(6);
    hint(st, H, 'burst', 'THE GATE BURSTS AND SHE RUNS FOR THE WEIR. STAND FORWARD OF THE FLOOD - AND STRIKE THE TILLER BEFORE THE STEPS END FOR THE MILL CUT.'); }
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
      else if (pr.t === 'tiller' && P.onMover === m) {
        if (!R.tillerOpen(st)) { S.clank(); hint(st, H, 'helmset', 'THE HELM IS SET: SHE IS IN THE RACE AND ANSWERS NOTHING NOW.'); continue; }   /* (claude/canalfix: a window, not a choice made at leisure) */
        const helm = R.strikeTiller(b); S.clank(); S.ratchet && S.ratchet();
        if (b.mode === 'loose') H.hint(helm === 'cut' ? 'THE HELM: THE MILL CUT.' : 'THE HELM: THE WEIR.');
        else H.hint(helm === 'cut' ? 'THE HELM: THE OFFSIDE - OUT OF THE TOWPATH HOOKS, UNDER THE BRIDGE TIMBERS.' : 'THE HELM: THE TOWPATH SIDE - CLEAR OF THE TIMBERS, IN REACH OF THE HOOKS.'); }
    } });
  // ---- (claude/canalfix) THE LAMPLIGHTERS' LANTERNS: each one alive lights the hero near him for every archer (R.litAt) ----
  st.carriers = H.enemies().filter(e => e.alive && e.lamplighter).map(e => ({ x: e.x, y: e.y }));
  // ---- (claude/canalfix, UPGRADE C) THE BOARDING GANG: held at the fog wall with a hero aboard or beside her, a skiff comes out of the fog and they board ----
  gangStep(st, H, dt, b, m);
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
  const side = R.sideOf(st, st.D);
  H.eachHero(P => { if (P.dead || st.beamCd > 0) return; for (const bm of st.D.beams || []) { if (bm.side && P.onMover === m && side && side !== bm.side) continue;   /* (a beam on one side of a pound: her helm decides) */
    if (beamHit(duckBox(P), duckClears(P, bm.y), bm, H.time())) { st.beamCd = 1; H.hurtHero((bm.x0 + bm.x1) / 2, bm.dmg || 10, { unblockable: true, name: bm.name }); S.thud(); H.shake(3); hint(st, H, 'beam', 'DUCK UNDER A LOW BEAM: HOLD DOWN ON THE DECK.'); } } });
  // ---- (claude/canalfix, review fix 3) THE BOOMS ON THE WEIR RUN: a log chained across the race at her deck's height sweeps the deck as she runs over it - JUMP it (ducking does nothing) ----
  st.boomCd = Math.max(0, st.boomCd - dt);
  if (b.mode === 'loose' && st.D.weir) for (const bm of st.D.weir.booms || []) { if (!boomLive(st, bm)) continue;
    H.eachHero(P => { if (P.dead || st.boomCd > 0 || P.onMover !== m || !P.ground) return;
      if (Math.abs(P.x - bm.x) < 9) { st.boomCd = 0.8; H.hurtHero(bm.x - 8, bm.dmg || 14, { unblockable: true, name: 'A BOOM' }); P.vy = -90; P.ground = false; S.thud(); H.shake(3); hint(st, H, 'boom', 'A BOOM ACROSS THE RACE SWEEPS HER DECK: JUMP IT. A LOW BEAM: DUCK IT.'); } });
    if (!st.told.boomSeen && Math.abs(bm.x - b.x - b.w) < 120) hint(st, H, 'boomSeen', 'A BOOM ACROSS THE RACE SWEEPS HER DECK: JUMP IT. A LOW BEAM: DUCK IT.'); }
  // ---- (claude/canalfix) THE FLOOD AT HER STERN, told once ----
  if (R.onHeadRace(st) && aboard(st, H)) hint(st, H, 'lap', 'THE FLOOD LAPS HER STERN ON THE STEPS: STAND FORWARD.');
  // ---- THE WAY BACK: the last dry ground you stood on (the canal hands you back to it); on the weir run (and anywhere in the race below the burst gate), the basin's bank ----
  H.eachHero(P => { if (P.dead) return;
    if (st.D.weir && ((b.mode === 'loose' && P.onMover === m) || (P.x > st.D.weir.head[0][0] && P.x < st.D.weir.end - 48 && !P.onMover))) P.safe = { x: st.D.weir.bank[0], y: st.D.weir.bank[1], L: H.L() };
    else if (P.onMover === m && b.mode === 'float') P.safe = { x: Math.max(b.x + 12, Math.min(b.x + b.w - 12, P.x)), y: b.y - 4, L: H.L() };   /* off her deck into the water: back onto her deck (she waits for whoever is not aboard) */
    else if (P.ground && !P.onMover && !P.climb && !R.inWeed(st.D, st, P.x, P.y) && H.solidUnder(P.x, P.y) && !atWater(H, P)) P.safe = { x: P.x, y: P.y, L: H.L() }; });   /* (claude/canalfix3) never ON the water: a bright weed mat that gives way, a wading bed - handed back there, you were handed back into the water: stuck */
  // ---- (claude/canalfix3, Daniel: "you fall in the water and get stuck there") THE SHALLOW WATER HANDS YOU BACK TOO: the race, the cut and the lower river are no place to
  //      be left wading once the run is over (they have no stair out) - after RIG.wadeBack s in one, the canal bites and puts you on the last ground you stood on ----
  for (const p of H.L().pools || []) if (p.handBack && b.mode !== 'loose') H.eachHero(P => { const inIt = !P.dead && P.x > p.x0 && P.x < p.x1 && P.y > p.y + 9 && P.y <= (p.bottom ?? 1e9) + 4;
    if (!inIt) { if (P.wadeIn === p) { P.wadeIn = null; P.wadeT = 0; } return; } if (P.wadeIn !== p) { P.wadeIn = p; P.wadeT = 0; } P.wadeT += dt;
    if (P.wadeT >= R.RIG.wadeBack && P.safe && P.safe.L === H.L()) { P.wadeT = 0; H.hurtHero(P.x, R.RIG.wadeBite, { unblockable: true, name: 'THE CANAL' }); if (!P.dead) { P.x = P.safe.x; P.y = P.safe.y; P.vx = 0; P.vy = 0; P.onMover = null; } S.splash && S.splash(); hint(st, H, 'handback', 'THE CANAL HANDS YOU BACK - AND BITES.'); } });
  // ---- THE HINTS THAT TEACH WHAT SHE DOES ----
  if (m && H.hero().onMover === m) hint(st, H, 'board', 'SHE CASTS OFF. SHE CARRIES YOU WHILE YOU RIDE HER, AND WAITS FOR YOU WHEN YOU ARE AHEAD.');
  { const a = st.D.arch; if (a && b.x + b.w >= a[0] * TS - 10 && b.x < (a[1] + 1) * TS && !aboard(st, H)) hint(st, H, 'arch', 'TOO LOW FOR ANYONE STANDING: SHE GOES ON THROUGH THE ARCH WITHOUT YOU. CATCH HER ON THE FAR SIDE.'); }   /* (claude/canalfix, review fix 7: told at the mouth, where she stalled before) */
  if (side && aboard(st, H)) hint(st, H, 'side', 'THE TILLER AMIDSHIPS STEERS HER: STRIKE IT TO TURN HER HELM.');
  clarity(st, H, dt);   /* (claude/canalfix3) */
  swimStep(st, H, dt);
}
/* ---------------- (claude/canalfix3) CLARITY: what holds her, glinted; her lantern swings to it; after ~10 s with no headway, a nudge names it ---------------- */
export const NUDGE = { after: 10, again: 25, near: 3 * TS };   /* s held before the nudge, s before it says it again, px of headway that counts */
const nearestProp = (cands, x) => cands.slice().sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x))[0] || null;
/* WHAT HOLDS HER: { why, prop } - the paddle of the shut gate ahead (of the chamber that is not level), the capstan of the bridge across, the ready horn of the bank;
   or, in the basin lock's chamber while it is low, its paddle (the door is out of reach). null while nothing holds her, or the machine is already working */
export function holdTarget(st) {
  const b = st && st.barge; if (!b || b.mode !== 'float') return null; const front = b.x + b.w;
  if (b.holdWhy === 'gate') { const g = st.gates.filter(q => !q.open && !q.burst && !q.weir && q.x * TS >= front - 6 && q.x * TS - front < 24).sort((p, q) => p.x - q.x)[0]; if (!g) return null;
    const rs = [g.a, g.b].map(i => st.reaches[i]).filter(r => r && r.lo !== r.hi); if (rs.some(r => Math.abs(r.to - r.y) > 0.5)) return null;   /* the water is moving: it is working */
    const prop = nearestProp(st.props.filter(p => p.t === 'locksluice' && rs.some(r => r.id === p.reach)), g.x * TS); return prop && { why: 'gate', prop }; }
  if (b.holdWhy === 'bridge') { const i = st.bridges.findIndex(q => R.bridgeHolds(q) && q.across && q.x0 * TS >= front - 6 && q.x0 * TS - front < 24);   /* (the one at her bow: not the next one up the canal) */ if (i < 0) return null; const prop = st.props.find(p => p.t === 'swingcap' && p.bridge === i); return prop && { why: 'bridge', prop }; }
  if (b.holdWhy === 'fog') { const f = st.fogs.find(q => R.fogThickAhead(q) && q.x0 * TS <= front + 8 && (q.x1 + 1) * TS > b.x); if (!f) return null;
    const horns = st.props.filter(p => p.t === 'foghorn' && (p.fogs || []).includes(f.id)), ready = horns.filter(p => !(p.cd > 0)); const prop = nearestProp(ready.length ? ready : horns, b.x + b.w / 2); return prop && { why: 'fog', prop }; }
  /* THE BASIN LOCK: she is in its chamber and it is low - the door over it is out of reach until it is filled (its paddle at her bow) */
  const r = st.reaches[b.reach]; if (r && r.id === 'L5' && Math.abs(r.to - R.surfaceY(r.hi)) > 1) { const prop = st.props.find(p => p.t === 'locksluice' && p.reach === 'L5'); return prop && { why: 'door', prop }; }
  return null;
}
function clarity(st, H, dt) {
  const b = st.barge, tg = holdTarget(st), C = st.stall = st.stall || { key: null, t: 0, best: 1e9, said: -1 }; st.glint = tg;
  /* HER LANTERN SWINGS TO IT (src/redraw/canal_props.js drawBarge reads st.lampAng): toward what holds her, or a slow sway */
  const want = tg ? Math.max(-0.55, Math.min(0.55, -(tg.prop.x - (b.x + 12)) / 220)) : Math.sin(st.clock * 1.3) * 0.06; st.lampAng = (st.lampAng || 0) + (want - (st.lampAng || 0)) * Math.min(1, dt * 3);
  const key = tg ? tg.why + '@' + Math.round(tg.prop.x) : null; if (key !== C.key) { C.key = key; C.t = 0; C.best = 1e9; C.said = -1; } if (!tg) return;
  /* HEADWAY: the hero comes a few tiles nearer the machine than he has been, or strikes it - the clock starts again */
  let d = 1e9; H.eachHero(P => { if (!P.dead) d = Math.min(d, Math.hypot(P.x - tg.prop.x, P.y - tg.prop.y)); }); if (d < C.best - NUDGE.near) { C.best = d; C.t = 0; } if (tg.prop.flash > 0) C.t = 0;
  C.t += dt; if (C.t >= NUDGE.after && (C.said < 0 || st.clock - C.said >= NUDGE.again)) { C.said = st.clock; st.nudges = (st.nudges || 0) + 1; st.lastNudge = CANAL_NUDGE[tg.why]; H.hint(CANAL_NUDGE[tg.why]); }
}
/* (claude/canalfix3) THE SAFE SWIMS: the first time a hero swims one, the nearest grindylow on the green side of its grate comes for him, BUMPS THE BARS (a clank,
   a ring) and cannot get through - GREEN IS HERS, BLUE IS SAFE, taught with no sign. canal-foes.js stepGrindylow runs e.bump */
function swimStep(st, H, dt) {
  const pools = H.L().pools || [];
  for (const sw of st.D.swims || []) { if (sw.taught) continue; const p = pools[sw.pool]; if (!p) continue; let inIt = false;
    H.eachHero(P => { if (!P.dead && P.swim && P.x > p.x0 && P.x < p.x1 && P.y > p.y) inIt = true; }); if (!inIt) continue; sw.taught = true;
    const [gx, gy0, gy1, dir] = sw.grate, gpx = gx * TS + 8 + (sw.grate[3] === -1 ? 0 : 8 * 1.5), gpy = (dir === -1 ? gy0 : (gy0 + gy1) / 2) * TS;
    const gr = H.enemies().filter(e => e.alive && e.t === 'grindylow' && !e.aboard && Math.abs(e.x - (sw.bumpFrom * TS + 8)) < 160).sort((a, b) => Math.abs(a.x - gpx) - Math.abs(b.x - gpx))[0];
    if (gr) { gr.bump = { x: dir === -1 ? gpx + 24 : gx * TS + 16 + 6, y: dir === -1 ? gy0 * TS - 2 : gpy, t: 0, hit: 0 }; st.bumps = (st.bumps || 0) + 1; } }
}
/* THE GLINT over what holds her (after the fog, so it shows through it): a warm pulsing star and ring; off the screen, a chevron at its edge pointing the way */
function drawGlint(st, g, cx, cy, VW, VH, time) {
  const tg = st.glint; if (!tg) return; const p = tg.prop, x = Math.round(p.x - cx), y = Math.round(p.y - 18 - cy), k = 0.5 + 0.5 * Math.sin(time * 5);
  if (x >= -8 && x <= VW + 8 && y >= -8 && y <= VH + 8) { g.globalAlpha = 0.35 + 0.45 * k; g.strokeStyle = '#ffe9a0'; g.lineWidth = 1; g.beginPath(); g.arc(x, y, 9 + 3 * k, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#fff6c8'; const r = 3 + Math.round(3 * k); g.fillRect(x - r, y, r * 2 + 1, 1); g.fillRect(x, y - r, 1, r * 2 + 1); g.fillRect(x - 1, y - 1, 3, 3); g.globalAlpha = 1; return; }
  const ex = Math.max(10, Math.min(VW - 10, x)), ey = Math.max(14, Math.min(VH - 14, y)), dx = Math.sign(x - ex), dy = Math.sign(y - ey); g.globalAlpha = 0.5 + 0.4 * k; g.fillStyle = '#ffe9a0';
  for (let i = 0; i < 4; i++) g.fillRect(ex + dx * (i - 3) - (dy ? i : 0), ey + dy * (i - 3) - (dx ? i : 0), dy ? i * 2 + 1 : 1, dx ? i * 2 + 1 : 1);
  g.globalAlpha = 1;
}

/* (claude/canalfix3) standing at a water surface or under it (a weed mat, a wading bed, a swim): no place to be handed back to */
const atWater = (H, P) => (H.L().pools || []).some(p => !p.dry && P.x > p.x0 - 4 && P.x < p.x1 + 4 && P.y >= p.y - 6 && P.y <= (p.bottom ?? p.y + 64) + 2);
/* ---------------- (claude/canalfix) THE PIECES THE FIX LANE ADDED ---------------- */
/* a boom is live on the path she is taking: 'head' always, 'cut' / 'fall' by her helm (or the branch she took) */
const boomLive = (st, bm) => { const b = st.barge, way = b.chosen || b.helm; return bm.path === 'head' || (bm.path === 'cut' ? way === 'cut' : way === 'weir'); };
/* HER SIDE OF THE POUND, for the towpath's hooks: true when a hero aboard is out of their reach (main.js updateGaffer asks) */
export const offside = (st, H, P) => !!st && R.sideOf(st, st.D) === 'off' && !!P && P.onMover === bargeMover(H);
/* THE LAMPLIGHTER (src/main.js updateSnuffer, e.lamplighter: the snuffer's walk-to-a-lamp, reversed): the nearest DOUSED post on his level */
export function lampTarget(st, e) { if (!st) return null; let best = null, bd = 1e9; for (const p of st.posts) if (!p.lit && Math.abs(p.y - e.y) < 40) { const q = Math.abs(p.x - e.x); if (q < bd) { bd = q; best = p; } } return best; }
export function relightPost(st, H, p) { if (!st || !p || p.lit) return; p.lit = true; p.flash = 0.4; H.sfx.clank(); hint(st, H, 'relit', 'THE LAMPLIGHTER LIGHTS IT AGAIN, AND HIS LANTERN SHOWS YOU: CUT HIM DOWN FIRST.'); }
/* a gang member still in the fog (not yet over her rail) is not drawn and not hit */
export const foeHidden = e => !!(e.boarder && e.waiting);
/* THE BOARDING GANG (UPGRADE C): e.boarder foes wait in the fog wall (e.waiting: held where they stand, unseen, doing nothing) until she is held at the
   wall with a hero aboard or on the bank beside her. Then a skiff comes out of the fog to her bow and they leap aboard one after another; on her deck
   they ride her (pinned to it), and fight there - hooks that throw a rider into the canal, the haft up close */
function gangStep(st, H, dt, b, m) {
  const gang = H.enemies().filter(e => e.boarder && e.alive); if (!gang.length) return; const G = st.gang, S = H.sfx;
  for (const e of gang) if (e.waiting === undefined) { e.waiting = true; e.hx = e.x; e.hy = e.y; }
  const wall = st.D.gangAt;   /* the fog wall's front column: she must be held there */
  if (!G.on && wall && b.mode === 'float' && b.holdWhy === 'fog' && Math.abs(b.x + b.w - wall * TS) < 24) {
    let near = false; H.eachHero(P => { if (!P.dead && (P.onMover === m || (Math.abs(P.x - b.x - b.w / 2) < 120 && Math.abs(P.y - b.y) < 60))) near = true; });
    if (near) { G.on = true; G.t = 0; G.skiff = { x: wall * TS + 120, to: b.x + b.w + 4 }; S.splash && S.splash(); hint(st, H, 'gang', 'OARS IN THE FOG: BOARDERS! FIGHT THEM ON HER DECK - A HOOK THROWS YOU INTO THE CANAL.'); } }
  if (G.on) { G.t += dt; const sk = G.skiff; if (sk) sk.x += (sk.to - sk.x) * Math.min(1, dt * 3); }
  let k = 0; for (const e of gang) {
    if (e.waiting) {
      const go = G.on && G.t > 1.0 + k * 0.4; k++;
      if (!go) { e.x = e.hx; e.y = e.hy; e.vx = 0; e.vy = 0; e.modeT = 0.5; e.cd = 1; continue; }
      e.waiting = false; e.leap = { t: 0, x0: G.skiff ? G.skiff.x : e.x, y0: b.y - 4, bx: b.w - 12 - (k - 1) * 22 }; S.leap ? S.leap() : S.thud(); }
    if (e.leap) { const L0 = e.leap; L0.t += dt; const u = Math.min(1, L0.t / 0.45), tx = b.x + L0.bx;
      e.x = L0.x0 + (tx - L0.x0) * u; e.y = L0.y0 + (b.y - L0.y0) * u - Math.sin(u * Math.PI) * 30; e.vx = 0; e.vy = 0; e.modeT = 0.3; e.cd = Math.max(e.cd, 0.6);
      if (u >= 1) { e.leap = null; e.onDeck = true; e.lastB = b.x; H.dust(e.x, e.y, 6); S.thud(); } continue; }
    if (e.onDeck) { e.x += b.x - (e.lastB ?? b.x); e.lastB = b.x; e.x = Math.max(b.x + 6, Math.min(b.x + b.w - 6, e.x)); e.y = b.y; e.vy = 0; }
  }
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
  const x = Math.round(m.x - cx), y = Math.round(m.y - cy); if (st) st.sideOff = !!(st.barge && st.D && R.sideOf(st, st.D) === 'off');   /* (claude/canalfix) her side of a wide pound: the offside is drawn in shade with a wake (src/redraw/canal_props.js, claude/canalart) */
  CP.drawBarge(g, x, y, m.w, st, time);
}
export function drawCanal(st, g, H, cx, cy, VW, VH, time) {
  if (!st) return; const L = H.L(), D = st.D;
  const on = (x0, x1) => x1 * TS >= cx - 40 && x0 * TS <= cx + VW + 40;
  // ---- the weed: a green mat on the water that reads as ground (the teaching and the lie) ----
  for (const [x0, x1, row, kind] of D.weeds || []) { if (!on(x0, x1 + 1)) continue; const sx = x0 * TS - cx, w = (x1 - x0 + 1) * TS, sy = row * TS - cy, br = kind === 'bright' && st.brights.find(q => q.x0 === x0 && q.row === row);
    if (br && br.gone > 0) continue;   /* given way: nothing there but the water */
    const k0 = br ? br.t / R.RIG.weedHold : 0, shake = br && br.t > 0 ? Math.round(Math.sin(time * 40) * k0 * 1.5) : 0;
    CP.drawWeed(g, kind, sx, sy, w, k0, shake, time); }
  // ---- the lock gates (the leaf is a tile: src/redraw/canal_tiles.js): the balance beam over a shut one, a stub of it on an open one ----
  for (const gt of st.gates) { if (!on(gt.x - 2, gt.x + 2)) continue; const sx = gt.x * TS - cx, sy = gt.top * TS - cy, h = (gt.bot - gt.top + 1) * TS;
    if (gt.open) CP.drawGateOpen(g, sx, sy); else CP.drawGateTop(g, gt, sx, sy, h, time); }
  // ---- the swing bridges: the deck across (a tile) or swung (a short stub at its pivot, foreshortened), the white rail and the pivot drum ----
  for (const br of st.bridges) { if (!on(br.x0 - 1, br.x1 + 1)) continue; const sy = br.row * TS - cy, k = br.k, w = (br.x1 - br.x0 + 1) * TS;
    const px0 = (br.pivot === 'R' ? (br.x1 + 1) * TS : br.x0 * TS) - cx, len = Math.round(w * Math.cos(k * Math.PI / 2)), sx = br.pivot === 'R' ? px0 - len : px0;
    CP.drawBridge(g, br, sy, sx, len, px0, k, time); }
  // ---- the low beams of the Waymeet pound: timbers hanging from the footbridge ----
  for (const bm of D.beams || []) { const sx = bm.x0 - cx, w = bm.x1 - bm.x0; if (sx > VW || sx + w < 0) continue; const top = Math.floor(bm.y / TS) * TS - 24 - cy;
    g.fillStyle = '#2c3238'; g.fillRect(sx, top, w, bm.y - cy - top); g.fillStyle = '#5a646c'; g.fillRect(sx, top, w, 1); for (let q = 2; q < w; q += 6) { g.fillStyle = '#8a929a'; g.fillRect(sx + q, bm.y - cy - 5, 1, 1); } g.fillStyle = '#ff9a5c';   /* (claude/canalfix3) the low bridge's girders are iron, riveted */ g.globalAlpha = 0.6; g.fillRect(sx, bm.y - cy - 2, w, 2); g.globalAlpha = 1; }
  // ---- (claude/canalfix3) the street's ironwork: railings and bollards (behind the heroes) ----
  for (const [x0, x1, row] of (D.street && D.street.railings) || []) { if (!on(x0, x1 + 1)) continue; CP.drawRailing(g, x0 * TS - cx, row * TS - cy, (x1 - x0 + 1) * TS - 1); }
  for (const [bx, row] of (D.street && D.street.bollards) || []) { if (!on(bx - 1, bx + 1)) continue; CP.drawBollard(g, bx * TS + 8 - cx, row * TS - cy); }
  // ---- the machines ----
  for (const pr of st.props) { const x = Math.round(pr.x - cx), y = Math.round(pr.y - cy); if (x < -30 || x > VW + 30 || y < -60 || y > VH + 40) continue; const fl = pr.flash > 0;
    if (pr.t === 'locksluice') { const r = R.reachById(st, pr.reach), up = r && Math.abs(r.to - R.surfaceY(r.hi)) < 1; CP.drawSluice(g, x, y, up, fl, r); }
    else if (pr.t === 'swingcap') { const br = st.bridges[pr.bridge]; CP.drawCapstan(g, x, y, br && R.bridgeHolds(br), fl); }
    else if (pr.t === 'foghorn') { CP.drawHorn(g, x, y, fl, pr.cd > 0 ? 1 - pr.cd / R.RIG.hornWind : 1); }
    else if (pr.t === 'lanternpost') { CP.drawPost(g, pr, x, y, time); }
  }
  // ---- (claude/canalfix) THE ARCH'S LIP: a stone sill with a warning band, one row over her gunwale - "too low" before anyone reaches it ----
  if (D.arch) { const ax = D.arch[0] * TS - cx, ay = (D.arch[2] + 1) * TS - cy; if (ax > -30 && ax < VW + 30) CP.drawSill(g, ax, ay); }
  // ---- (claude/canalfix) THE BOOMS: a chained log across the race, live on her way (a red-and-white band: JUMP), and the lane mark over it ----
  if (D.weir) for (const bm of D.weir.booms || []) { const sx = bm.x - cx; if (sx < -30 || sx > VW + 30) continue; CP.drawBoom(g, sx, bm.y - cy, boomLive(st, bm), st.barge.mode === 'float', time); }
  // ---- (claude/canalfix) THE BOARDERS' SKIFF ----
  if (st.gang && st.gang.skiff) { const sk = st.gang.skiff, sx = sk.x - cx; if (sx > -40 && sx < VW + 40) CP.drawSkiff(g, sx, st.barge.y - cy + 2, time); }
  // ---- JENNY'S LOCK, dressed: weed in curtains, slime, the sunken narrowboat that is her lair (src/redraw/canal_props.js) ----
  if (L.lockArena) CP.drawLair(g, L.lockArena, cx, cy, VW, VH, time);
  // ---- JENNY'S SIGNS, cheap and told: a child's shoe on a lock step, bubbles by the bank where nothing lives ----
  for (const [sx0, sy0] of D.shoes || []) { const x = sx0 * TS + 6 - cx, y = (sy0 + 1) * TS - cy; if (x < -10 || x > VW + 10) continue; CP.drawShoe(g, x, y); }
  for (const [bx, row] of D.bubbles || []) { const x = bx * TS + 8 - cx, s = surfaceAt(st, H, bx * TS + 8), y = (s ? s.y : row * TS) - cy; if (x < -10 || x > VW + 10) continue; const ph = (time * 0.7 + bx * 0.37) % 1; if (ph < 0.45) { g.globalAlpha = 0.6 - ph; g.strokeStyle = '#9ad8c0'; g.lineWidth = 1; g.beginPath(); g.ellipse(x + Math.sin(bx) * 6, y, 2 + ph * 14, 1 + ph * 3, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; } }
}
/* THE FOG, over everything: holes for the hero, each lit post and her lantern; the theatre's glow ahead through it; the wisps and the lanterns burning on top */
let FOGC = null;
export function drawCanalFog(st, g, H, cx, cy, VW, VH, time) {
  if (!st || st.noFog) return; const fogs = st.fogs.filter(f => f.x1 * TS >= cx && f.x0 * TS <= cx + VW && f.y1 * TS >= cy && f.y0 * TS <= cy + VH);
  if (!FOGC || FOGC.width !== VW || FOGC.height !== VH) { FOGC = H.makeCanvas(VW, VH); } if (!FOGC) return;
  const fg = FOGC.getContext('2d'); fg.globalCompositeOperation = 'source-over'; fg.clearRect(0, 0, VW, VH);
  for (const f of fogs) { const a = f.a * f.fade; if (a < 0.02) continue; CP.featherBank(fg, H.makeCanvas, f, f.x0 * TS - cx, (f.x1 + 1) * TS - cx, f.y0 * TS - cy, (f.y1 + 1) * TS - cy, a, time, VW, VH); }   /* (claude/canalart) soft, drifting edges, a lip on the thick ones: the same extents as before */
  fg.globalCompositeOperation = 'destination-out';
  const hole = (x, y, r) => { const gr = fg.createRadialGradient(x, y, r * 0.35, x, y, r); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); fg.fillStyle = gr; fg.fillRect(x - r, y - r, r * 2, r * 2); };
  H.eachHero(P => { if (!P.dead) hole(P.x - cx, P.y - 8 - cy, 34); });
  for (const p of st.posts) if (p.lit) hole(p.x - cx, p.y - 20 - cy, R.RIG.postR);
  const b = st.barge; hole(b.x + 10 - cx, b.y - 30 - cy, R.RIG.bargeR);
  for (const c of st.carriers || []) hole(c.x - cx, c.y - 20 - cy, R.RIG.carryR);   /* (claude/canalfix) a lamplighter's lantern */
  fg.globalCompositeOperation = 'source-over';
  /* THE THEATRE, lit, ahead through the fog the whole way: a warm glow low in the fog at the screen's far side, stronger the nearer you come */
  const k = Math.min(1, Math.max(0, cx / (360 * TS))), gx = VW * 0.86, gy = VH * 0.42, gr = fg.createRadialGradient(gx, gy, 4, gx, gy, 90 + 60 * k);
  gr.addColorStop(0, 'rgba(255,196,110,' + (0.28 + 0.3 * k).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(255,196,110,0)'); fg.fillStyle = gr; fg.fillRect(gx - 160, gy - 160, 320, 320);
  g.drawImage(FOGC, 0, 0);
  /* the lanterns and the wisps burn on top of the fog - the one warm, the other cold: that is the read */
  for (const p of st.posts) if (p.lit) { const x = p.x - cx, y = p.y - 29 - cy; if (x < -30 || x > VW + 30) continue; const fl = 0.8 + 0.2 * Math.sin(time * 7 + p.x), gl = g.createRadialGradient(x, y, 1, x, y, 26); gl.addColorStop(0, 'rgba(255,207,106,' + (0.5 * fl).toFixed(3) + ')'); gl.addColorStop(1, 'rgba(255,207,106,0)'); g.fillStyle = gl; g.fillRect(x - 26, y - 26, 52, 52);
    g.globalAlpha = 0.75 * fl; g.fillStyle = '#ffcf6a'; g.fillRect(Math.round(x) - 2, Math.round(y) - 3, 4, 6); g.fillStyle = '#fff2b0'; g.fillRect(Math.round(x) - 1, Math.round(y) - 1, 2, 2); g.globalAlpha = 1; }   /* a REAL lantern: warm amber, square, steady, on a post */
  /* (claude/canalfix) THE LAMPLIGHTER's pole-lantern, over his shoulder: a long iron-shod pole, a hook, a caged lantern hung from it (his coat and cap are his sprite's, src/redraw/canal_foes_art.js) */
  for (const e of H.enemies()) if (e.alive && e.lamplighter) { const x = Math.round(e.x - cx), y = Math.round(e.y - cy); if (x < -20 || x > VW + 20) continue; const f = e.face || 1, tell = /Tell$|swipe/.test(e.mode || ''), fl = 0.8 + 0.2 * Math.sin(time * 8 + e.x);
    if (!tell) { g.fillStyle = '#3a2c1c'; g.fillRect(x - f * 3, y - 27, 1, 16); g.fillRect(x - f * 3, y - 27, f * 9, 1); g.fillStyle = '#6a5a40'; g.fillRect(x - f * 3, y - 12, 1, 2); }
    const lx = x + f * 6, ly = y - 24; g.fillStyle = '#1b1b20'; g.fillRect(lx - 3, ly - 1, 6, 1); g.fillRect(lx - 3, ly + 6, 6, 1); g.fillRect(lx - 3, ly, 1, 6); g.fillRect(lx + 2, ly, 1, 6);
    const gl2 = g.createRadialGradient(lx, ly + 3, 1, lx, ly + 3, 18); gl2.addColorStop(0, 'rgba(255,207,106,' + (0.45 * fl).toFixed(3) + ')'); gl2.addColorStop(1, 'rgba(255,207,106,0)'); g.fillStyle = gl2; g.fillRect(lx - 18, ly - 15, 36, 36);
    g.globalAlpha = fl; g.fillStyle = '#ffcf6a'; g.fillRect(lx - 2, ly, 4, 6); g.fillStyle = '#fff2b0'; g.fillRect(lx - 1, ly + 2, 2, 2); g.globalAlpha = 1; }
  /* THE WISP, the false lantern: a COLD green teardrop with no post and no cage, a faint face in it close up, flecks trailing off it - nothing like a real lantern (warm, square, on a post) */
  for (const e of H.enemies()) if (e.alive && e.t === 'willowisp' && e.mode === 'spark') { const x = Math.round(e.x - cx), y = Math.round(e.y - 6 - cy), fl = Math.floor(time * 14) % 2; g.globalAlpha = 0.5 + 0.3 * fl; g.fillStyle = '#a0ffd2'; g.fillRect(x - 1, y - 1, 2, 2); g.globalAlpha = 0.25; g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill(); g.globalAlpha = 1; }   /* (claude/canalfix3) popped: an ember, re-forming - strike it and it is out */
  for (const e of H.enemies()) if (e.alive && e.t === 'willowisp' && e.mode !== 'spark') { if (e.mode === 'dash') { g.globalAlpha = 0.35; g.strokeStyle = '#a0ffd2'; g.lineWidth = 2; g.beginPath(); g.moveTo(e.x - cx, e.y - 6 - cy); g.lineTo(e.x - e.vx * 0.08 - cx, e.y - 6 - e.vy * 0.08 - cy); g.stroke(); g.globalAlpha = 1; g.lineWidth = 1; }   /* the dart's streak */
    const x = e.x - cx, y = e.y + (e.bob || 0) - 6 - cy; if (x < -24 || x > VW + 24) continue; const tell = e.mode === 'flareTell', pu = 0.5 + 0.5 * Math.sin(time * 5 + e.x), gr2 = g.createRadialGradient(x, y, 1, x, y, tell ? 22 : 17);
    gr2.addColorStop(0, 'rgba(160,255,210,' + (tell ? 0.9 : 0.5 + 0.12 * pu) + ')'); gr2.addColorStop(1, 'rgba(160,255,210,0)'); g.fillStyle = gr2; g.fillRect(x - 22, y - 22, 44, 44);
    const rx = Math.round(x), ry = Math.round(y), sw = Math.round(Math.sin(time * 6 + e.x));
    g.fillStyle = '#2a8a6a'; g.fillRect(rx - 2, ry - 1, 5, 6); g.fillRect(rx - 1 + sw, ry - 4, 3, 4); g.fillRect(rx + sw, ry - 6, 1, 2); g.fillStyle = '#6ae8b0'; g.fillRect(rx - 1, ry, 3, 4); g.fillRect(rx + sw, ry - 3, 1, 3); g.fillStyle = '#dcffe8'; g.fillRect(rx, ry + 1, 1, 2);
    if (Math.abs(e.x - H.hero().x) < 90) { g.fillStyle = '#0a3a2a'; g.fillRect(rx - 1, ry + 1, 1, 1); g.fillRect(rx + 1, ry + 1, 1, 1); g.fillRect(rx, ry + 3, 1, 1); }   /* a faint face, close up */
    g.fillStyle = '#a0ffd2'; g.globalAlpha = 0.6; for (let k = 0; k < 3; k++) g.fillRect(rx - 4 - k * 3 + sw, ry + 4 + k * 2, 1, 1); g.globalAlpha = 1;
    if (tell) { g.strokeStyle = Math.floor(time * 12) % 2 ? '#ffd36b' : '#dcffe8'; g.lineWidth = 1; g.beginPath(); g.arc(x, y + 1, 9, 0, 6.3); g.stroke(); } }
  drawGlint(st, g, cx, cy, VW, VH, time);   /* (claude/canalfix3) what holds her */
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
/* THE WATER: a sheen on every pound, a lantern's reflection (amber for the barge's and the posts', a cold shimmer under a wisp) - after the engine's own surface (src/redraw/canal_props.js) */
export function drawCanalWater(st, g, H, cx, cy, VW, VH, time) {
  if (!st) return; const b = st.barge, lan = [{ x: b.x + 12, col: '#ffcf6a' }];
  for (const p of st.posts) if (p.lit && Math.abs(p.x - cx - VW / 2) < VW) lan.push({ x: p.x, col: '#ffcf6a', y: p.y });
  for (const c of st.carriers || []) lan.push({ x: c.x, col: '#ffcf6a', k: 0.7 });
  const wis = H.enemies().filter(e => e.alive && e.t === 'willowisp' && Math.abs(e.x - cx - VW / 2) < VW).map(e => ({ x: e.x, k: 1 }));
  CP.drawWater(g, st, H.L().pools || [], cx, cy, VW, VH, time, lan, wis); }
export const canalFoeShown = e => e.t !== 'grindylow' || F.grindylowUp(e);

/* the rooms behind the tiles (src/redraw/canal_props.js paintRoom): the warehouse, the mill, Jenny's door */
/* (claude/canalfix3) the canal's sign: an iron plaque, not a wooden board */
export const signArt = () => CP.canalSign();
export function paintCanalRoom(g, rs, sx, sy, w, h, time) { return CP.paintRoom(g, rs, sx, sy, w, h, time || 0); }
