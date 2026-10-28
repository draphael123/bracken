// src/forge-rails.js - THE SMELTER FLOOR and THE FORGE (claude/forgemaster, the OPUS GREYBOX; Daniel 10-15 interview + 10-26 go-ahead,
// scratch/brief-forgemaster-rails-1015.md). THE DEEP RAILS' on-foot smelter section and the room of its SECOND MINI, THE FORGEMASTER.
// src/minecart.js lays the data (L.forgeLoops / forgePoints / forgePlugs / forgeLoaders); main.js owns the world (the carts are its 'cart' movers, the
// Forgemaster is its updateForgemaster) and calls:
//   reset()            a load or a life: the loop carts pooled at their mouths, every junction SET, every slag plug shut (a plug once broken stays broken
//                      for the load - a death does not undo the way you opened)
//   update(dt)         THE LOOP (ore carts roll the overhead line, mouth to mouth), THE JUNCTION LEVERS (a blow on one, or E: OPEN - the next cart over the
//                      points DROPS to the floor and rolls on along it: a SENT cart), THE SLAG PLUGS (a sent or thrown cart smashes one), THE LOADERS (a goblin
//                      who kicks a cart down the floor at you, told: '!' and its lane), the carts' rooms (a cart that leaves its room is smashed on its wall)
//   interact(P)        E at a junction lever throws it
//   drawWorld(g, cx, cy, time)   greybox: the mouths, the levers (their arrow: UP = the cart rides on, DOWN = it drops), the open points' drop, the
//                      plugs, a loader's lane, the next cart's ETA pip over every lever
//   read(), state(name)          for the tools, the lab bot and the stuck glint (src/stuck-spots.js STUCK_HANDS.minecart 'forge.<plug>': shut / open)
//
// THE RULE IT ADDS (the level's own verb, A2 / B1): THROW THE POINTS. On the smelter floor the points are not under your cart - they are in the ore line
// over your head, and what drops through them is an ore cart that rolls on along the floor: into a slag plug (TEACH, the required use), into a goblin
// brute (TEST), back at the loader who kicks carts at you (REMIX), past an elite and through the last plug (EXAM), and into THE FORGEMASTER (the mini:
// a cart into him staggers him OPEN, every blow doubled - B1, the boss is the level's rule personified). He answers with the same carts: he chains one
// down off the loop and HURLS it along the floor at you (told: B16 windup, its lane drawn red - jump it).
import * as FA from './redraw/forge_art.js';
export const FORGE = {
  cartW: 28, cartH: 10,
  leverReach: 30,      /* px: E throws a junction lever this close (a blow on its box from anywhere) */
  sentMin: 60,         /* px/s: a cart rolling at least this fast is a blow (a plug, a goblin, the smith) */
  near: 520,           /* px: a loop runs while the hero is this close to it (off the screen it rests) */
  /* THE FORGEMASTER on the rails (src/main.js updateForgemaster, e.rails) */
  openT: 3.0,          /* s: a cart into him - STAGGERED, OPEN (x2 blows) */
  cartDmg: 40,         /* the cart's own blow */
  parryT: 1.6,         /* s: HAMMER AND TONGS' last blow turned on a shield - his arm rings, OPEN */
  wardT: 3.0,          /* s: B3, after every opening a told ward: a cart into him CLANGS off (blades still land at x0.5 - B15) */
  hurlTell: 0.8,       /* s: he has the chained cart at his side, its lane drawn red, before it goes (B16) */
  hurlV: 250,          /* px/s: the thrown cart */
  ingotTell: 0.8,      /* s: HOT INGOTS - the marks are drawn where they will land from the first moment of the windup */
  ingotFly: 0.85,
  loaderTell: 0.8, loaderEvery: 3.6, loaderV: 190, loaderHurl: 1.6,   /* A LOADER: '!' and the lane, then a cart down the floor at you */
};
/* a lever's box (blows), from its column and its floor row */
export const leverBox = (p, TS = 16) => { const x = p.x * TS + 8, y = p.lrow * TS; return { l: x - 10, r: x + 10, t: y - 30, b: y }; };
/* where a cart on the loop line is, in px of its centre; when it reaches the points' first column (s, from now) - Infinity if it never will */
export const etaTo = (c, colX, TS = 16) => { const cx = c.x + c.w / 2, tx = colX * TS; if (c.gone || cx > tx) return Infinity; const v = Math.max(1, Math.abs(c.vx) || c.speed || 1); return (tx - cx) / v; };

export function makeForgeRails(ctx) {
  let M = null;
  const H = {}, R = Math.round;
  const TSz = () => ctx.TS;
  const Lv = () => ctx.L;
  H.on = () => !!(M && Lv() && Lv().forgeLoops && M.L === Lv());

  const mkCart = (x, y, o) => Object.assign({ kind: 'cart', x, y, x0: x, y0: y, w: FORGE.cartW, h: FORGE.cartH, dir: 1, vx: 0, vy: 0, rolling: false, auto: true, gone: true, respawnT: 1e9,
    hit: new Set(), speed: 120, dx: 0, dy: 0, forge: true }, o || {});
  const layPoints = p => { for (let x = p.x0; x <= p.x1; x++) ctx.cellSet(x, p.row, p.state === 'set' ? ctx.T.RAIL : ctx.T.AIR); };
  const layPlug = q => { for (let y = q.y0; y <= q.y1; y++) for (let x = q.x0; x <= q.x1; x++) ctx.cellSet(x, y, q.broken ? ctx.T.AIR : ctx.T.SOLID); };

  H.reset = () => {
    const L = Lv(); if (!L || !L.forgeLoops) { M = null; return; }
    const keep = M && M.L === L ? M.brokenPlugs : new Set(), ts = TSz();
    const mv = ctx.movers(); for (let i = mv.length - 1; i >= 0; i--) if (mv[i].forge) mv.splice(i, 1);
    M = { L, brokenPlugs: keep, n: { throws: 0, drops: 0, plugs: 0, kicks: 0, smashed: 0, foeHits: 0 },
      loops: L.forgeLoops.map(lp => ({ ...lp, t: lp.phase || 0, pool: [] })),
      points: (L.forgePoints || []).map(p => ({ ...p, state: 'set', flash: 0, dropT: 0 })),
      plugs: (L.forgePlugs || []).map(q => ({ ...q, broken: keep.has(q.id) })),
      loaders: (L.forgeLoaders || []).map(q => ({ ...q, t: q.phase || 1.5, tell: 0, pool: [] })) };
    for (const lp of M.loops) { const n = lp.carts || 3; for (let i = 0; i < n; i++) { const c = mkCart(lp.x0 * ts, lp.row * ts - FORGE.cartH, { loop: lp.id, speed: lp.speed || 120, zone: lp.zone }); mv.push(c); lp.pool.push(c); } }
    for (const q of M.loaders) for (let i = 0; i < 2; i++) { const c = mkCart(q.x * ts, q.row * ts - FORGE.cartH, { loader: q.id, dir: -1, speed: FORGE.loaderV, zone: q.zone }); mv.push(c); q.pool.push(c); }
    for (const p of M.points) layPoints(p);
    for (const q of M.plugs) layPlug(q);
  };

  /* ---------- THE JUNCTION LEVERS ---------- */
  function throwLever(p, how) {
    if (p.flash > 0.25) return false;
    p.state = p.state === 'set' ? 'open' : 'set'; p.flash = 0.5; layPoints(p); M.n.throws++;
    const ts = TSz(); ctx.sfx.clank && ctx.sfx.clank(); ctx.sfx.leverClunk && ctx.sfx.leverClunk(); ctx.sparks(p.x * ts + 8, p.lrow * ts - 16, 1, 5);
    ctx.number(p.x * ts + 8, p.lrow * ts - 40, p.state === 'open' ? 'POINTS OPEN: THE NEXT CART DROPS' : 'POINTS SET: THE CARTS RIDE ON', p.state === 'open' ? '#ffd36b' : '#bce8fa');
    return true;
  }
  H.interact = P => { if (!H.on() || !P || P.dead) return false; const ts = TSz();
    const p = M.points.find(q => Math.abs(q.x * ts + 8 - P.x) <= FORGE.leverReach && Math.abs(P.y - q.lrow * ts) <= 24);
    return p ? throwLever(p, 'E') : false; };

  const live = c => !c.gone;
  const smash = (c, x) => { c.gone = true; c.respawnT = 1e9; c.rolling = false; c.vx = 0; c.vy = 0; c.sent = false; c.hurled = 0; c.kicked = false; c.dragged = false; c.ridden = false; c.hit.clear();
    if (x !== undefined) { ctx.burst(x, c.y + 4, 12, ['#5a6270', '#8a919c', '#c98a3a'], 80, 0.5); ctx.sfx.heavy && ctx.sfx.heavy(); ctx.shake(2); M.n.smashed++; } };
  const inZone = (c, z) => { if (!z) return true; const ts = TSz(), cx = c.x + c.w / 2; return cx >= z[0] * ts && cx <= (z[1] + 1) * ts; };

  H.update = dt => {
    if (!H.on()) return;
    const ts = TSz(), P0 = ctx.hero(), now = ctx.time();
    if (ctx.sfx.forgeAir) ctx.sfx.forgeAir(P0 ? Math.max(0, Math.min(1, 1 - Math.max(FA.FX0 * ts - 100 - P0.x, P0.x - (FA.FX1 + 4) * ts, 0) / 360)) : 0);   /* the forge's air (audio bed) swells as you near it */
    /* a blow on a lever throws it */
    const hb = ctx.attackBox(); if (hb && P0) for (const p of M.points) if (!P0.hitSet.has(p) && ctx.overlap(hb, leverBox(p, ts))) { P0.hitSet.add(p); throwLever(p, 'blow'); }
    /* THE LINE IS NO PERCH: the ore line over the floor will not hold a body (a trace found the bot on it over the smith, out of his reach and he of
       its - a 240 s stalemate - and a perch there would walk you over a slag plug, past the required use). Feet on a loop line, or on a cart riding it: you slip off, told */
    if (P0 && !P0.dead) { const ride = P0.onMover && P0.onMover.forge ? P0.onMover : null;
      for (const lp of M.loops) { const top = lp.row * ts; if (P0.x < lp.x0 * ts - 8 || P0.x > (lp.x1 + 1) * ts + 8) continue;
        if ((P0.ground && Math.abs(P0.y - top) < 3 && !ride) || (ride && ride.loop === lp.id && !ride.sent)) {
          P0.onMover = null; P0.ground = false; P0.y = top + 8; P0.vy = Math.max(P0.vy || 0, 60);   /* past the one-way catch (src/slopes.js: a hero lands on a one-way from 6 px under its top) */
          if (!(M.slipSaid > now)) { M.slipSaid = now + 1.5; ctx.number(P0.x, top - 14, "THE LINE WON'T HOLD YOU", '#c9d1dc'); ctx.sparks(P0.x, top, 1, 4); ctx.sfx.clank && ctx.sfx.clank(); }
          break; } } }
    for (const p of M.points) { p.flash = Math.max(0, p.flash - dt); if (p.dropT > 0) { p.dropT -= dt; if (p.dropT <= 0 && p.state === 'open') { p.state = 'set'; layPoints(p); } } }
    /* THE LOOP: a cart from the west mouth every `every` s while the hero is near; a cart that reaches the east mouth goes into it */
    for (const lp of M.loops) {
      const mid = (lp.x0 + lp.x1) / 2 * ts, near = P0 && Math.abs(P0.x - mid) < FORGE.near + (lp.x1 - lp.x0) * ts / 2;
      lp.t -= dt;
      if (lp.t <= 0 && near) { lp.t = lp.every || 2.8; const c = lp.pool.find(q => q.gone && !(q.dragged));
        if (c) { Object.assign(c, { gone: false, x: lp.x0 * ts, y: lp.row * ts - FORGE.cartH, vx: lp.speed || 120, vy: 0, dir: 1, rolling: true, auto: true, kicked: false, ridden: false, sent: false, hurled: 0, dragged: false, pHit: 0, speed: lp.speed || 120 }); c.hit.clear(); } }
      for (const c of lp.pool) { if (c.gone || c.dragged) continue;
        const onLine = Math.abs(c.y + c.h - lp.row * ts) < 3;
        if (onLine && !c.sent && !c.hurled && c.x + c.w / 2 >= (lp.x1 + 1) * ts) { smash(c); continue; }   /* into the east mouth (round the loop, out of sight) */
        /* over OPEN points: it drops - a SENT cart (the points close behind it) */
        if (onLine && !c.sent) for (const p of M.points) { if (p.loop !== lp.id || p.state !== 'open') continue; const cx = c.x + c.w / 2; if (cx >= p.x0 * ts && cx <= (p.x1 + 1) * ts) { c.sent = true; c.kicked = false; c.hit.clear(); p.dropT = 0.5; M.n.drops++; ctx.sfx.rattle && ctx.sfx.rattle(1); ctx.number(cx, c.y - 10, 'IT DROPS', '#ffd36b'); } }
        if (!inZone(c, c.zone)) smash(c, c.x + c.w / 2);
        if (c.y > (lp.row + 12) * ts) smash(c); } }
    /* THE LOADERS: told ('!' and the lane), then a cart down the floor at you */
    for (const q of M.loaders) { const e = q.e || (q.e = (ctx.enemies() || []).find(f => f.squad === q.squad)); if (!e || !e.alive || !P0 || P0.dead) { q.tell = 0; continue; }
      const ex = e.x, near = Math.abs(P0.x - ex) < 300 && P0.x < ex && Math.abs(P0.y - e.y) < 40;
      if (q.tell > 0) { q.tell -= dt; e.mcTelling = true; e.mcPose = { sy: 1.05, rot: -0.14 }; if (q.tell <= 0) { e.mcTelling = false; e.mcPose = null; const c = q.pool.find(k => k.gone);
          if (c) { Object.assign(c, { gone: false, x: ex - 34, y: q.row * ts - FORGE.cartH, vx: -FORGE.loaderV, vy: 0, dir: -1, rolling: true, auto: true, kicked: true, sent: false, ridden: false, hurled: FORGE.loaderHurl, pHit: 0, speed: FORGE.loaderV }); c.hit.clear(); c.hit.add(e); M.n.kicks++;
            ctx.sfx.throwWhoosh && ctx.sfx.throwWhoosh(); ctx.sfx.clank && ctx.sfx.clank(); ctx.shake(2); } } }
      else { q.t -= dt; if (q.t <= 0 && near && !(e.stagger > 0)) { q.t = q.every || FORGE.loaderEvery; q.tell = FORGE.loaderTell; ctx.number(ex, e.y - 26, '!', '#ff6b6b'); ctx.sfx.charge && ctx.sfx.charge(); } }
      for (const c of q.pool) { if (c.gone) continue; if (!inZone(c, c.zone)) smash(c, c.x + c.w / 2); else if (c.y > (q.row + 12) * ts) smash(c); } }
    /* THE SLAG PLUGS: a cart rolling into one (sent, kicked, thrown) smashes it - and itself */
    for (const q of M.plugs) { if (q.broken) continue; const x0 = q.x0 * ts, x1 = (q.x1 + 1) * ts, yb = (q.y1 + 1) * ts, yt = q.y0 * ts;
      for (const c of ctx.movers()) { if (c.kind !== 'cart' || c.gone || Math.abs(c.vx) < FORGE.sentMin * 0.6) continue; if (c.y + c.h < yt || c.y > yb) continue;
        const front = c.vx > 0 ? c.x + c.w : c.x; if (front >= x0 - 4 && front <= x1 + 4) { q.broken = true; M.brokenPlugs.add(q.id); layPlug(q); M.n.plugs++;
          ctx.burst((x0 + x1) / 2, yb - 16, 26, ['#3a2a22', '#6a4a34', '#ff9a5c', '#ffd36b'], 130, 0.8); ctx.sfx.crack && ctx.sfx.crack(); ctx.sfx.heavy && ctx.sfx.heavy(); ctx.shake(6);
          ctx.number((x0 + x1) / 2, yt - 10, 'THE PLUG BREAKS', '#8fd160'); smash(c); break; } } }
  };

  /* ---------- FOR THE FORGEMASTER (main.js updateForgemaster, e.rails) ---------- */
  /* the loop cart he chains: one on the line over his room, not one already dropping, nearest him */
  H.chainCart = (e, A) => { if (!H.on()) return null; const ts = TSz(); let best = null, bd = 1e9;
    for (const lp of M.loops) for (const c of lp.pool) { if (c.gone || c.sent || c.hurled || c.dragged) continue; const cx = c.x + c.w / 2; if (cx < A.x0 + 24 || cx > A.x1 - 24) continue; const d = Math.abs(cx - e.x); if (d < bd) { bd = d; best = c; } }
    return best; };
  H.loopRowOf = c => { const lp = M && M.loops.find(q => q.id === c.loop); return lp ? lp.row : null; };

  /* ---------- READ / STATE ---------- */
  H.state = name => { if (!M) return ''; const [kind, id] = String(name).split('.');
    if (kind === 'forge' || kind === 'plug') { const q = M.plugs.find(p => p.id === id); return q ? (q.broken ? 'open' : 'shut') : ''; }
    if (kind === 'fpoints') { const p = M.points.find(q => q.id === id); return p ? p.state : ''; }
    return ''; };
  H.read = () => M && { points: M.points.map(p => ({ id: p.id, state: p.state, x: p.x, lrow: p.lrow, x0: p.x0, x1: p.x1, row: p.row, loop: p.loop })),
    plugs: M.plugs.map(q => ({ id: q.id, broken: q.broken, x0: q.x0, x1: q.x1 })),
    carts: ctx.movers().filter(c => c.forge && !c.gone).map(c => ({ x: R(c.x + c.w / 2), y: R(c.y + c.h), vx: R(c.vx), loop: c.loop || null, loader: c.loader || null, sent: !!c.sent, hurled: !!(c.hurled > 0), dragged: !!c.dragged })),
    loaders: M.loaders.map(q => ({ id: q.id, tell: q.tell > 0, alive: !!(q.e && q.e.alive) })), n: { ...M.n } };
  /* the next loop cart over a lever's points: seconds, or Infinity (the lab's hands and the pilot read what a player sees - the carts on the line) */
  H.etaAt = id => { if (!M) return Infinity; const p = M.points.find(q => q.id === id); if (!p) return Infinity; const lp = M.loops.find(q => q.id === p.loop); if (!lp) return Infinity;
    let t = Infinity; for (const c of lp.pool) { if (c.sent || c.hurled || c.dragged) continue; t = Math.min(t, etaTo(c, p.x0, TSz())); } return t; };
  H.points = () => (M ? M.points : []);
  H.throwAt = (id) => { const p = M && M.points.find(q => q.id === id); return p ? throwLever(p, 'tool') : false; };

  /* ---------- DRAWING (claude/forgemasterart: src/redraw/forge_art.js dresses every read the greybox laid down) ---------- */
  const smith = () => (ctx.enemies() || []).find(f => f.t === 'forgemaster');
  /* how hot the furnace burns: dull while he sleeps, brighter in phase two and while he BRACES, a flare on his furnace breath, banked when he is down (THE FORGE COOLS) */
  const heat = () => { const e = smith(); let k = 0.4; if (e) { if (!e.alive) k = 0.08; else { if ((e.phase || 1) >= 2) k += 0.45; if (e.ward > 0) k += 0.45; if (e.mode === 'breath' || e.mode === 'breathTell') k += 0.5; } }
    M.hk = M.hk === undefined ? k : M.hk + (k - M.hk) * 0.08; return M.hk; };
  H.heat = () => (M ? M.hk : 0);
  H.drawBack = (g, cx, cy, vw, vh, time) => {
    if (!H.on()) return; const L = Lv(), ts = TSz(), sf = (L.decor || []).find(d => d.kind === 'smelterfloor'); if (!sf) return; const fn = (L.decor || []).find(d => d.kind === 'furnace');
    if (cx > (sf.x1 + 6) * ts || cx + vw < (sf.x0 - 6) * ts) return;
    FA.drawBack(g, cx, cy, vw, vh, time, { x0: sf.x0, x1: sf.x1, D: sf.row, furn: fn ? { x: fn.x * ts + 8, bright: heat() } : null }); };
  /* the forge's carts: iron, a heap of ore; hot when SENT down the floor or kicked or hurled; chained while he hauls one */
  H.drawCart = (g, m, cx, cy, time) => { if (!m.forge) return false; if (m.gone) return true;
    const hot = !!(m.sent || m.dragged || m.hurled > 0 || (m.kicked && Math.abs(m.vx) > 60));
    FA.cart(g, R(m.x) - cx, R(m.y) - cy, hot, !!m.dragged, m.vx, time, ((m.x0 | 0) >> 4) + (m.loop ? m.loop.length : 3)); return true; };
  H.drawWorld = (g, cx, cy, time) => {
    if (!H.on()) return; const ts = TSz(), vw = ctx.VW(), L = Lv(); heat();
    const vis = x => x > cx - 80 && x < cx + vw + 80;
    /* THE SLAG GUTTERS (decor): molten, told */
    for (const d of L.decor || []) { if (d.kind !== 'slaggutter') continue; const x0 = R(d.x0 * ts - cx), x1 = R((d.x1 + 1) * ts - cx); if (x1 < -60 || x0 > vw + 60) continue; FA.gutter(g, x0, x1, R((d.row - 4) * ts - cy), 64, time, d.x0); }
    /* THE MOUTHS: the loop's two brick furnace arches, west (where the carts come out) and east (where they go) */
    for (const lp of M.loops) for (const [mx, west] of [[lp.x0 * ts, true], [(lp.x1 + 1) * ts, false]]) { if (!vis(mx)) continue; FA.mouth(g, R(mx - cx), R(lp.row * ts - cy), west, time, lp.x0 + (west ? 0 : 7)); }
    /* THE JUNCTION LEVERS and their points */
    for (const p of M.points) { const lx = p.x * ts + 8; if (!vis(lx)) continue; const x = R(lx - cx), y = R(p.lrow * ts - cy), open = p.state === 'open';
      const px0 = R(p.x0 * ts - cx), px1 = R((p.x1 + 1) * ts - cx), py = R(p.row * ts - cy);
      FA.pullChain(g, x + (open ? 5 : -5) + 1, py + 7, y - 36, open, time);   /* the pull-chain up to the points */
      FA.points(g, px0, px1, py, open, time);
      FA.junction(g, x, y, open, p.flash, time);
      if (open) { const k = 0.5 + 0.5 * Math.sin(time * 12);
        g.strokeStyle = '#ffd36b'; g.globalAlpha = 0.5; g.setLineDash([3, 3]); g.beginPath(); g.moveTo((px0 + px1) / 2, py + 12); g.lineTo((px0 + px1) / 2, y - 40); g.stroke(); g.setLineDash([]);
        /* and the way it will roll, along the floor */ g.globalAlpha = 0.3 + 0.3 * k; g.fillStyle = '#ffd36b'; for (let i = 0; i < 4; i++) { const ax = (px0 + px1) / 2 + 14 + i * 14 + (time * 30) % 14; g.beginPath(); g.moveTo(ax, y - 6); g.lineTo(ax + 5, y - 3); g.lineTo(ax, y); g.fill(); } g.globalAlpha = 1; }
      /* the next cart's ETA, a pip that fills as it comes (what a player reads off the line) */
      const eta = H.etaAt(p.id); if (eta < 4) FA.etaPip(g, x, y - 44, eta); }
    /* THE SLAG PLUGS: a black heap with hot cracks, shut across the floor */
    for (const q of M.plugs) { if (q.broken) continue; const x0 = q.x0 * ts; if (!vis(x0)) continue; FA.plug(g, R(x0 - cx), R(q.y0 * ts - cy), (q.x1 - q.x0 + 1) * ts, (q.y1 - q.y0 + 1) * ts, time, q.x0); }
    /* A LOADER's lane while he winds up - and the boot he kicks with */
    for (const q of M.loaders) { if (!(q.tell > 0) || !q.e || !q.e.alive) continue; const k = 0.5 + 0.5 * Math.sin(time * 18), y = R(q.row * ts - cy), xa = R(q.e.x - cx), xb = R(q.zone[0] * ts - cx);
      g.globalAlpha = 0.18 + 0.22 * k; g.fillStyle = '#ff6b6b'; g.fillRect(Math.min(xa, xb), y - 12, Math.abs(xa - xb), 12); g.globalAlpha = 1;
      FA.loaderKick(g, xa, y, -1, 1 - q.tell / FORGE.loaderTell, time); }
  };
  return H;
}
