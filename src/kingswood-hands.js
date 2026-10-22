// src/kingswood-hands.js - KINGSWOOD 2, THE KING'S HUNTING WOOD: the level's rule and machines (claude/kingswood2, the OPUS GREYBOX, 2026-10-22;
// brief scratch/brief-kingswood2-1014.md, the '!! 10-14 LATE' level section; the recipe scratch/review-rootway-recipe-1014.md).
// src/kingswood.js builds the level; this binds it to the game. main.js owns the world and calls:
//   reset (spawnEntities), update, strike (a blow's box), marcher (a foe's frame while the court marches), props (the guide's), drawSky (THE GREAT OAK),
//   drawWorld (the ropes, pegs, loads, the procession's banners, the area banner), read / rope (tools).
// THE RULE (L.rule): THE COURT HOLDS THE ROAD, AND WHAT HANGS OVER IT CAN BE DROPPED ON IT.
//   A ROYAL ROPE (L.hoists, the Rootway's data shape so the guide, the reach fill and the play bot read it the same way): a load hangs on a rope over a
//   pulley, tied off at a PEG (the court's pennant post). A blow on the peg parts the rope and the load DROPS:
//     cage   crushes what is under it; with `land` it stays where it lands as a 2x2 step (solid cells: THE COURT'S CHECKPOINT, THE CAGE STAIR)
//     span   a lashed log lands across its gap (one-way cells) and stays - a bridge (THE HUNTING STANDS)
//     log    THE LOG TRAP, Kingswood's own: it drops, crushes what is under it, then ROLLS along the road (`roll`: +1 / -1) through every foe in its way
//            until a wall (or `rollMax` tiles) splits it. The road it will roll is drawn (a dotted line on the floor) while it hangs.
//   What a rope drops that STAYS (a step, a bridge) stays for the attempt: a death lays its cells again. Logs and loose cages hang again, with the foes.
// THE COURT'S PROCESSION (L.procession): the court marches down the carpet road toward you (a horn, then a drum). Marchers (ents with kw.march) do not
//   fight while they march: a hero ABOVE the road is not seen and they pass under him and out through the side gate; a hero on the road in front of
//   them, or a blow or a drop on one, turns the whole court on him. The pegs over the road are the ambush.
// Every capital line it says goes through ctx.number with a line listed here (KW_SAY) and in src/hint-lines.js.
export const ROPE = { g: 900, vmax: 520, crush: 30, cageDmg: 16, caged: 1.0, logW: 3, logH: 14, logV: 150, logDmg: 26, logHero: 14, logMax: 40, dropTell: 0 };
export const MARCH = { v: 60, see: 72, seeY: 14, wake: 150, exitT: 0.6 };
export const KW_SAY = {
  cut: 'THE ROPE PARTS: IT DROPS', step: 'THE CAGE LANDS: A STEP', bridge: 'THE LOG LANDS: A BRIDGE', crushed: 'CRUSHED UNDER IT',
  rolls: 'THE LOG ROLLS DOWN THE ROAD', split: 'THE LOG SPLITS', caged: 'THE CAGE HAS YOU', logHit: 'THE LOG RUNS YOU DOWN',
  march: 'THE COURT MARCHES: HIDE ABOVE, OR DROP SOMETHING ON IT', seen: 'THE COURT SEES YOU', passed: 'THE COURT HAS PASSED YOU BY', broken: 'THE PROCESSION IS BROKEN',
};

export function makeKingswoodHands(ctx) {
  const TS = ctx.TS, H = {};
  const L = () => ctx.L;
  let S = null;
  H.on = () => !!(L() && L().kwood);
  const say = (x, y, k, col = '#ffd36b') => ctx.number(x, y, KW_SAY[k], col);
  const once = k => { if (S.said.has(k)) return false; S.said.add(k); return true; };
  const pegBox = d => ({ l: d.cleat[0] * TS + 1, r: d.cleat[0] * TS + 15, t: (d.cleat[1] - 1) * TS, b: (d.cleat[1] + 1) * TS });
  const loadW = d => d.load === 'span' ? (d.span[1] - d.span[0] + 1) * TS : d.load === 'cage' ? 2 * TS : d.load === 'log' ? ROPE.logW * TS : 12;
  const loadX = d => d.load === 'span' ? (d.span[0] * TS + (d.span[1] + 1) * TS) / 2 : d.load === 'log' ? d.x * TS + 8 : d.x * TS;   /* the centre of what hangs (a cage spans x-1..x; a log is three tiles centred on x) */
  const standAt = (tx, ty) => ctx.solidAt(tx, ty) || ctx.tileAt(tx, ty) === ctx.T.ONEWAY || ctx.tileAt(tx, ty) === ctx.T.PLANK;
  const layCells = d => { if (d.load === 'span') for (let cx = d.span[0]; cx <= d.span[1]; cx++) ctx.cellSet(cx, d.span[2], ctx.T.ONEWAY);
    else if (d.land) for (let y = d.land[1]; y <= d.land[1] + 1; y++) for (let cx = d.land[0]; cx <= d.land[0] + 1; cx++) ctx.cellSet(cx, y, ctx.T.SOLID); };

  /* ---------- RESET (every load and every respawn) ---------- */
  H.reset = () => {
    const lv = L(); if (!lv || !lv.kwood) { S = null; return; }
    const keep = S && S.L === lv ? S : null;
    const hs = new Map();
    for (const d of (lv.hoists || [])) { const was = keep && keep.hs.get(d.id);
      const stay = was && !d.boss && (d.load === 'span' || d.land) && was.state === 'down';   /* a step or a bridge already down stays down (its cells laid again: a death rebuilds the grid) */
      hs.set(d.id, stay ? was : { d, id: d.id, state: 'hang', ly: (d.hang + 1) * TS, lx: loadX(d), vy: 0, t: 0, hit: new Set(), heroHit: false, rolled: 0 });
      if (stay) layCells(d); }
    const pr = lv.procession ? { ...lv.procession, state: keep && keep.proc && keep.proc.done ? 'done' : 'wait', done: !!(keep && keep.proc && keep.proc.done), passed: keep && keep.proc ? keep.proc.passed : 0, killed: 0, t: 0, drumT: 0 } : null;
    S = { L: lv, hs, proc: pr, said: keep ? keep.said : new Set(), sec: -1, banner: keep ? null : null, n: keep ? keep.n : { cuts: 0, crushed: 0, logs: 0, logHits: 0, steps: 0, bridges: 0, marched: 0, passed: 0, seen: 0 } };
    /* the marchers: their march state from the ent (main.js copies e.kw onto the foe); a procession already over takes them off the road */
    for (const e of ctx.enemies()) { if (!e.alive || !e.march) continue;
      if (!pr || pr.done) { e.alive = false; e.march = null; continue; }
      e.marchHp = e.hp; e.face = pr.dir; e.vx = 0; }
  };
  H.load = () => { S = null; H.reset(); };

  /* ---------- CUT: the rope parts, the load drops ---------- */
  function cut(h, how) {
    if (!S || h.state !== 'hang') return false; const d = h.d; S.n.cuts++;
    ctx.sfx.crack && ctx.sfx.crack(); ctx.sfx.creak && ctx.sfx.creak(); ctx.burst(d.cleat[0] * TS + 8, d.cleat[1] * TS, 8, ['#c9b27c', '#a83a2a', '#ffe9a0'], 60, 0.5);
    h.state = 'fall'; h.vy = 0;
    if (!d.boss && once('cut')) say(d.cleat[0] * TS + 8, d.cleat[1] * TS - 20, 'cut');
    if (S.proc && S.proc.state === 'march' && how !== 'boss') for (const e of ctx.enemies()) if (e.alive && e.march && Math.abs(e.x - loadX(d)) < 3 * TS) e.marchDrop = true;   /* a load cut over the march: those under it do not see it coming */
    return true;
  }
  H.cutRope = id => { const h = S && S.hs.get(id); return h ? cut(h, 'boss') : false; };

  const crushBox = (h, d) => d.load === 'log' ? { l: h.lx - loadW(d) / 2, r: h.lx + loadW(d) / 2, t: h.ly - ROPE.logH, b: h.ly } : { l: h.lx - TS, r: h.lx + TS, t: h.ly - 2 * TS, b: h.ly };
  /* LANDING */
  function land(h) {
    const d = h.d, x = h.lx; ctx.shake(d.load === 'span' ? 3 : 4); ctx.sfx.heavy && ctx.sfx.heavy(); ctx.dust(x, h.ly, 10);
    if (d.load === 'span') { h.state = 'down'; layCells(d); S.n.bridges++; if (once('bridge')) say(x, h.ly - 24, 'bridge', '#8fd160'); return; }
    const bx = crushBox(h, d);
    for (const e of ctx.enemies()) if (e.alive && !e.maxHp && ctx.overlap(bx, ctx.box(e))) { h.hit.add(e); ctx.hurt(e, d.land ? 999 : (d.crush || ROPE.crush), x); S.n.crushed++; if (once('crushed')) say(e.x, e.y - 20, 'crushed', '#8fd160'); }
    for (const p of ctx.players()) if (p && !p.dead && ctx.overlap(bx, ctx.boxOf(p))) ctx.asPlayer(p, () => { ctx.damage(x, ROPE.cageDmg, { up: true, unblockable: true, name: d.load === 'log' ? 'THE LOG' : 'THE CAGE' });
      if (d.load === 'cage') { p.caged = ROPE.caged; say(p.x, p.y - 24, 'caged', '#ff6b6b'); } if (d.land) { p.y = d.land[1] * TS; p.vy = 0; } });
    if (d.load === 'cage') { h.state = 'down'; if (d.land) { layCells(d); S.n.steps++; if (once('step')) say(x, h.ly - 40, 'step', '#8fd160'); } return; }
    /* a log: it rolls on if it has a road to roll */
    if (d.roll) { h.state = 'roll'; h.rolled = 0; ctx.sfx.rumble && ctx.sfx.rumble(); if (once('rolls')) say(x, h.ly - 30, 'rolls'); } else h.state = 'down';
  }
  function split(h) { h.state = 'gone'; ctx.sfx.crack && ctx.sfx.crack(); ctx.sfx.thud && ctx.sfx.thud(); ctx.shake(3); ctx.burst(h.lx, h.ly - 6, 14, ['#8a5a32', '#c9a060', '#5c3a1d'], 90, 0.7); S.n.logs++; if (once('split')) say(h.lx, h.ly - 24, 'split', '#c9b27c'); }

  /* ---------- EVERY FRAME ---------- */
  H.update = dt => {
    if (!S) return; const P = ctx.players()[0], lv = L();
    for (const h of S.hs.values()) { const d = h.d;
      if (h.state === 'fall') { h.vy = Math.min(ROPE.vmax, h.vy + ROPE.g * dt); h.ly += h.vy * dt;
        const target = d.load === 'span' ? (d.span[2] + 1) * TS : d.land ? (d.land[1] + 2) * TS : null;
        if (target !== null) { if (h.ly >= target) { h.ly = target; land(h); } }
        else { const ty = Math.floor(h.ly / TS), half = d.load === 'log' ? TS : 8; if (standAt(Math.floor((h.lx - half) / TS), ty) || standAt(Math.floor((h.lx + half) / TS), ty) || standAt(Math.floor(h.lx / TS), ty) || ty >= lv.H - 1) { h.ly = ty * TS; h.vy = 0; land(h); } } }
      else if (h.state === 'roll') { const dir = d.roll, v = ROPE.logV, half = loadW(d) / 2, row = Math.floor((h.ly - 2) / TS);
        const nx = h.lx + dir * v * dt, front = Math.floor((nx + dir * half) / TS);
        if (ctx.solidAt(front, row) || h.rolled >= (d.rollMax || ROPE.logMax) * TS) { split(h); continue; }
        h.rolled += Math.abs(nx - h.lx); h.lx = nx;
        const fy = Math.floor(h.ly / TS); if (!standAt(Math.floor(h.lx / TS), fy)) { h.vy = Math.min(ROPE.vmax, h.vy + ROPE.g * dt); h.ly += h.vy * dt; const ty = Math.floor(h.ly / TS); if (standAt(Math.floor(h.lx / TS), ty)) { h.ly = ty * TS; h.vy = 0; } if (h.ly > lv.H * TS) { split(h); continue; } }
        const bx = crushBox(h, d);
        for (const e of ctx.enemies()) if (e.alive && !e.maxHp && !h.hit.has(e) && ctx.overlap(bx, ctx.box(e))) { h.hit.add(e); ctx.hurt(e, d.crush || ROPE.logDmg, h.lx - dir * 20); e.stagger = Math.max(e.stagger || 0, 0.8); S.n.crushed++; }
        if (P && !P.dead && !h.heroHit && ctx.overlap(bx, ctx.boxOf(P))) { h.heroHit = true; S.n.logHits++; ctx.asPlayer(P, () => { ctx.damage(h.lx - dir * 20, ROPE.logHero, { up: true, unblockable: true, name: 'THE LOG' }); }); say(P.x, P.y - 26, 'logHit', '#ff6b6b'); }
        if (Math.random() < dt * 20) ctx.dust(h.lx - dir * half, h.ly, 1); } }
    /* THE NAMED AREAS: the banner when you come into one */
    if (P && lv.sections) { const k = lv.sections.findIndex(s => P.x >= s.x0 * TS && P.x < s.x1 * TS); if (k >= 0 && k !== S.sec) { if (S.sec >= 0 || k === 0) S.banner = { name: lv.sections[k].name, t: 3.4 }; S.sec = k; } }
    if (S.banner) { S.banner.t -= dt; if (S.banner.t <= 0) S.banner = null; }
    procStep(dt, P);
  };

  /* ---------- THE COURT'S PROCESSION ---------- */
  const marchers = () => ctx.enemies().filter(e => e.alive && e.march);
  function alertAll(x, why) { const pr = S.proc; if (!pr) return; let n = 0;
    for (const e of marchers()) if (Math.abs(e.x - x) < MARCH.wake * 2) { e.march = null; e.woke = 2; e.seenP = true; e.stagger = Math.max(e.stagger || 0, 0.25); e.emote = 'shock'; e.emoteT = 0.7; n++; }
    if (n) { S.n.seen++; ctx.sfx.hornBlast && ctx.sfx.hornBlast(); if (once('seen:' + pr.id + S.n.seen)) say(x, ctx.players()[0].y - 40, why === 'drop' ? 'broken' : 'seen', '#ff9a5c'); } }
  function procStep(dt, P) {
    const pr = S.proc; if (!pr || pr.done) return;
    if (pr.state === 'wait' && P && !P.dead && P.x >= pr.trigger * TS) { pr.state = 'march'; pr.t = 0; S.n.marched++; ctx.sfx.hornBlast && ctx.sfx.hornBlast(); ctx.sfx.farHorn && ctx.sfx.farHorn(); say(P.x, P.y - 40, 'march'); }
    if (pr.state === 'march') { pr.t += dt; pr.drumT -= dt; if (pr.drumT <= 0) { pr.drumT = 0.62; const m = marchers(); if (m.length && ctx.sfx.thud) ctx.sfx.thud(); } }
    const left = ctx.enemies().filter(e => e.alive && (e.march || e.wasMarcher));
    if (pr.state === 'march' && !left.length) { pr.done = true; pr.state = 'done'; if (P) say(P.x, P.y - 40, pr.passed > 0 && !S.n.seen ? 'passed' : 'broken', '#8fd160'); }
  }
  /* a marcher's frame (main.js calls it before the foe's own AI; true = handled, the AI skips this frame) */
  H.marcher = (e, dt) => {
    if (!S || !e.march || !e.alive) return false; const pr = S.proc; if (!pr) { e.march = null; return false; }
    const P = ctx.players()[0]; e.wasMarcher = true;
    e.vy = Math.min(300, (e.vy || 0) + 1000 * dt);
    if (pr.state === 'wait') { e.vx = 0; const r = ctx.moveBody(e, 0, e.vy * dt); if (r && r.ground) e.vy = 0; e.face = pr.dir;
      if (P && !P.dead && Math.abs(P.x - e.x) < 40 && Math.abs(P.y - e.y) < 20) alertAll(e.x, 'seen');
      return true; }
    if (pr.state !== 'march') { e.march = null; return false; }
    if ((e.marchHp !== undefined && e.hp < e.marchHp) || e.marchDrop && e.hp < e.marchHp) { alertAll(e.x, e.marchDrop ? 'drop' : 'seen'); return false; }
    /* seen: a hero ON THE ROAD in front of the court (or right beside it); a hero above it is not looked for */
    if (P && !P.dead && Math.abs(P.y - e.y) < MARCH.seeY && (P.x - e.x) * pr.dir > -20 && (P.x - e.x) * pr.dir < MARCH.see) { alertAll(e.x, 'seen'); return false; }
    e.face = pr.dir; e.vx = pr.dir * MARCH.v; e.anim = (e.anim || 0) + dt;
    const r = ctx.moveBody(e, pr.dir * MARCH.v * dt, e.vy * dt); if (r && r.ground) e.vy = 0;
    if ((pr.dir < 0 && e.x <= pr.exit * TS) || (pr.dir > 0 && e.x >= pr.exit * TS)) { e.alive = false; e.march = null; e.gone = 1; pr.passed++; S.n.passed++; ctx.burst(e.x, e.y - 8, 6, ['#c9b27c', '#8a5a32'], 40, 0.4); }
    return true;
  };

  /* ---------- A BLOW ON A PEG ---------- */
  H.strike = hb => { if (!S || !hb) return; for (const h of S.hs.values()) { const d = h.d; if (h.state !== 'hang' || d.locked) continue; if (ctx.overlap(hb, pegBox(d))) cut(h, 'blade'); } };

  /* ---------- THE GUIDE's props (src/stuck-spots.js reads `on`) ---------- */
  H.props = () => { if (!S) return []; const out = [];
    for (const h of S.hs.values()) { const d = h.d; if (d.boss) continue; out.push({ t: 'hoist', id: h.id, x: d.cleat[0] * TS + 8, y: (d.cleat[1] + 1) * TS, on: h.state !== 'hang' }); }
    return out; };
  H.read = () => S ? { hoists: [...S.hs.values()].map(h => ({ id: h.id, state: h.state, ly: h.ly, lx: h.lx })), proc: S.proc ? { state: S.proc.state, done: S.proc.done, passed: S.proc.passed } : null, banner: S.banner ? S.banner.name : null, sec: S.sec, n: { ...S.n } } : null;
  H.hoist = id => S && S.hs.get(id);

  /* ---------- DRAWING (greybox: the art pass gives the ropes, pegs, cages and logs their own sprites) ---------- */
  const R = Math.round;
  const dots = (g, x, y0, y1, col) => { g.fillStyle = col; for (let y = y0; y < y1; y += 5) g.fillRect(x, y, 1, 2); };
  const hdots = (g, x0, x1, y, col) => { g.fillStyle = col; const a = Math.min(x0, x1), b = Math.max(x0, x1); for (let x = a; x < b; x += 6) g.fillRect(x, y, 3, 1); };
  const rope = (g, x0, y0, x1, y1) => { g.strokeStyle = '#c9a060'; g.lineWidth = 1; g.beginPath(); g.moveTo(x0 + 0.5, y0 + 0.5); g.lineTo(x1 + 0.5, y1 + 0.5); g.stroke(); };
  function drawPeg(g, x, y, up, glint, time) {   /* the court's tie-off: a short post with a red-and-gold pennant; the rope round it while it holds */
    g.fillStyle = '#5c3a1d'; g.fillRect(x - 2, y - 22, 4, 22); g.fillStyle = '#8a5a32'; g.fillRect(x - 2, y - 22, 1, 22);
    g.fillStyle = '#e0b040'; g.fillRect(x - 3, y - 24, 6, 2);
    const fl = Math.sin(time * 4 + x) > 0 ? 1 : 0; g.fillStyle = '#a83a2a'; g.fillRect(x + 2, y - 21, 6 + fl, 4); g.fillStyle = '#e0b040'; g.fillRect(x + 2, y - 21, 6 + fl, 1);
    if (up) { g.fillStyle = '#c9a060'; g.fillRect(x - 3, y - 14, 6, 2); g.fillRect(x - 3, y - 11, 6, 1); }
    else { g.fillStyle = '#c9a060'; g.fillRect(x + 2, y - 12, 4, 1); g.fillRect(x + 4, y - 10, 2, 3); }
    if (glint && Math.floor(time * 3) % 2) { g.fillStyle = '#fff6c8'; g.fillRect(x - 1, y - 27, 2, 2); g.fillRect(x - 4, y - 18, 1, 1); g.fillRect(x + 3, y - 16, 1, 1); } }
  function drawCage(g, x, b, down) { const w = 2 * TS, h = 2 * TS, x0 = x - TS, y0 = b - h;
    g.fillStyle = 'rgba(40,24,14,0.35)'; g.fillRect(x0 + 2, y0 + 2, w - 4, h - 4);
    g.fillStyle = down ? '#6d6458' : '#8b8378'; g.fillRect(x0, y0, w, 3); g.fillRect(x0, b - 3, w, 3); for (let k = 0; k <= 4; k++) g.fillRect(x0 + k * 7 + (k === 4 ? -1 : 0), y0, 2, h);
    g.fillStyle = '#e0b040'; g.fillRect(x - 2, y0 - 3, 4, 3); }
  function drawLog(g, cx, b, w, time, rolling) { const x0 = cx - w / 2, y0 = b - ROPE.logH;
    g.fillStyle = '#6a4424'; g.fillRect(x0, y0 + 1, w, ROPE.logH - 2); g.fillStyle = '#8a5a32'; g.fillRect(x0, y0 + 1, w, 3); g.fillStyle = '#4a2c14'; g.fillRect(x0, b - 3, w, 2);
    const sp = rolling ? (time * 10) % 8 : 0; g.fillStyle = '#5c3a1d'; for (let k = 4 + sp; k < w - 4; k += 8) g.fillRect(Math.round(x0 + k), y0 + 3, 1, ROPE.logH - 6);
    g.fillStyle = '#c9a060'; g.fillRect(x0 - 1, y0 + 2, 3, ROPE.logH - 4); g.fillRect(x0 + w - 2, y0 + 2, 3, ROPE.logH - 4); g.fillStyle = '#8a5a32'; g.fillRect(x0, y0 + 5, 1, 3); g.fillRect(x0 + w - 1, y0 + 5, 1, 3); }
  H.drawWorld = (g, cx, cy, VW, VH, time) => {
    if (!S) return; const lv = L();
    for (const h of S.hs.values()) { const d = h.d, px = R(d.x * TS + (d.load === 'log' ? 8 : 0) - cx), py = R(d.top * TS - cy), lxs = R(h.lx - cx), ly = R(h.ly - cy);
      const ccx = R(d.cleat[0] * TS + 8 - cx), ccy = R((d.cleat[1] + 1) * TS - cy);
      if (Math.max(px, ccx, lxs) < -80 || Math.min(px, ccx, lxs) > VW + 80) continue;
      const up = h.state === 'hang';
      g.fillStyle = '#3a2412'; g.fillRect(px - 4, py - 3, 8, 6); g.fillStyle = '#8a5a32'; g.fillRect(px - 3, py - 2, 6, 4); g.fillStyle = '#e0b040'; g.fillRect(px - 1, py - 1, 2, 2);   /* the pulley on its bough */
      drawPeg(g, ccx, ccy, up, up && !d.boss && !d.locked, time);
      if (up) { rope(g, px, py + 2, ccx, ccy - 13);
        const lt = d.load === 'cage' ? 2 * TS + 3 : d.load === 'span' ? TS : ROPE.logH; rope(g, px, py + 3, lxs, ly - lt);
        if (d.load === 'log' || d.load === 'span') { const w = loadW(d); rope(g, lxs, ly - lt, R(lxs - w / 2 + 3), ly - lt + 2); rope(g, lxs, ly - lt, R(lxs + w / 2 - 3), ly - lt + 2); } }
      /* A3 + the target first: where it lands (a dotted plumb line) and, for a log trap, the road it will roll (a dotted line along the floor) */
      if (up) { const to = d.load === 'span' ? d.span[2] * TS : d.land ? d.land[1] * TS : (() => { let ty = Math.floor(h.ly / TS); while (ty < lv.H - 1 && !standAt(Math.floor(h.lx / TS), ty)) ty++; return ty * TS; })();
        dots(g, lxs, ly + 2, R(to - cy), 'rgba(255,233,160,0.5)');
        if (d.load === 'log' && d.roll) { let tx = Math.floor(h.lx / TS), ty = Math.floor(to / TS), n = 0; const lim = d.rollMax || ROPE.logMax; while (n < lim && !ctx.solidAt(tx + d.roll * 2, ty - 1)) { tx += d.roll; n++; }
          hdots(g, lxs, R((tx + 0.5) * TS - cx), R(to - cy) - 3, 'rgba(255,154,92,0.55)'); } }
      if (d.load === 'span') { if (h.state === 'down') { g.fillStyle = '#6a4424'; g.fillRect(R(d.span[0] * TS - cx), R(d.span[2] * TS - cy), loadW(d), 6); g.fillStyle = '#8a5a32'; g.fillRect(R(d.span[0] * TS - cx), R(d.span[2] * TS - cy), loadW(d), 2); }
        else { const w = loadW(d); g.fillStyle = '#6a4424'; g.fillRect(R(lxs - w / 2), ly - TS + 4, w, 6); g.fillStyle = '#8a5a32'; g.fillRect(R(lxs - w / 2), ly - TS + 4, w, 2); } }
      else if (d.load === 'cage') { if (h.state === 'down' && d.land) drawCage(g, R(d.land[0] * TS + TS - cx), R((d.land[1] + 2) * TS - cy), true); else drawCage(g, lxs, ly, h.state === 'down'); }
      else if (d.load === 'log' && h.state !== 'gone') drawLog(g, lxs, ly, loadW(d), time, h.state === 'roll');
    }
    /* the procession's banners: a pole and a pennant over every other marcher while the court marches */
    if (S.proc && (S.proc.state === 'march' || S.proc.state === 'wait')) { let k = 0; for (const e of marchers()) { if (k++ % 2) continue; const x = R(e.x - cx), y = R(e.y - cy); if (x < -20 || x > VW + 20) continue;
      g.fillStyle = '#5c3a1d'; g.fillRect(x - 1, y - 34, 2, 22); g.fillStyle = '#a83a2a'; g.fillRect(x + 1, y - 34, 9, 6); g.fillStyle = '#e0b040'; g.fillRect(x + 1, y - 34, 9, 1); g.fillRect(x + 4, y - 32, 3, 2); } }
    /* the area banner: the name of the place you have come into */
    if (S.banner && ctx.text) { const a = Math.min(1, S.banner.t / 0.6, (3.4 - S.banner.t) / 0.4 + 0.2); g.globalAlpha = Math.max(0, Math.min(1, a)); g.fillStyle = 'rgba(30,14,8,0.62)'; g.fillRect(VW / 2 - 110, 26, 220, 18);
      g.fillStyle = '#e0b040'; g.fillRect(VW / 2 - 110, 26, 220, 1); g.fillRect(VW / 2 - 110, 43, 220, 1); ctx.text(S.banner.name, VW / 2, 31, '#ffe9b0', 'center'); g.globalAlpha = 1; }
  };
  /* THE GREAT OAK on the skyline (src/redraw/kingswood_oak.js) */
  H.drawSky = (g, cx, cy, VW, VH, time, dY) => { const lv = L(); if (ctx.oak) ctx.oak(g, cx, cy, VW, VH, lv, time, dY); };
  return H;
}
