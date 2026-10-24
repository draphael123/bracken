// src/hanging-ropes.js - THE HANGING VILLAGE 3: CUT IT AND RIDE IT (claude/hanging3, Daniel 10-24: "the level is good, but it lacks a verb ...
// the boss doesn't really fit. I don't want to rework the entire level, but we need a central mechanic, and the boss based around it").
// THE RULE (L.rule): THE VILLAGE HANGS ON ROPES, AND A ROPE CAN BE CUT. Now felt on every floor: a RED-AND-GOLD KNOT is a rope you can cut - any
// blow, every hero, a bolt or an ember too - and what it holds is drawn first, in gold dots, where it will go (the trebuchet test, A3/A6).
// src/level.js (hangingVillage) lays the ropes in L.ropes; main.js owns the world and calls:
//   reset (spawnEntities: every rope is tied again - the village re-ties what you cut when you come back), update(dt), strike(hb) (a blow's box),
//   mover(m, dt) (the counterweight decks and the pulley seats: m.rope), drawWorld, props (the guide's), read (tools), and for THE OWL REEVE:
//   perchUp(k) / owlTargets() / owlCut(id) / ropeOf(id).
// FOUR USES ON THE ROAD, taught safe -> tested -> remixed -> the exam:
//   NET      a cargo net over the road: cut it onto what stands under it (crushed, stunned), and it lies there as a step.
//   BRIDGE   a hanging bridge held up by a tie: cut the tie and it swings down across the gap - a way over.
//   COUNTER  a COUNTERWEIGHT deck held down by a tie: stand on it, cut the tie, the sandbag falls and the deck shoots up. It comes back down empty.
//   LINE     a PULLEY LINE: a seat tied off at the top of a rope run: cut it and ride the line down and across. One way: it comes back empty.
// AND THE REEVE'S CROWN: PERCH (her perches hang on ropes tied off at the floor: cut it while she sits on it and she comes down with it) and
//   LEDGE (the side climbs hang too: in her second phase SHE cuts them, told). Every perch/ledge is hauled back up after a while.
// Every capital line it says is in HR_SAY (src/hint-lines.js routes them).

export const HR = { netG: 900, netDmg: 60, netStun: 2.4, bridgeT: 0.5, cwUp: 165, cwDown: 60, cwHold: 1.4, cwDrop: 170, lineV: 150, lineBack: 90, lineWait: 1.2,
  perchG: 900, perchDown: 7, ledgeDown: 7, haulV: 60, near: 150 };
export const HR_SAY = {
  net: 'THE NET DROPS ON HIM', netStep: 'THE NET LANDS: A STEP', bridge: 'THE BRIDGE SWINGS DOWN: A WAY ACROSS', counter: 'THE SANDBAG FALLS: UP YOU GO',
  line: 'THE LINE RUNS: HOLD ON', perch: 'HER PERCH FALLS', perchEmpty: 'THE PERCH FALLS', retied: 'RE-TIED', back: 'HAULED BACK UP',
  owlGo: 'SHE GOES FOR THE ROPES', owlCut: 'SHE CUTS THE ROPE', owlDown: 'DOWN WITH HER PERCH: HIT HER',   /* (said in src/main.js updateOwl) */
};
const GOLD = '#ffd36b', GOLD_D = '#c9a83a', RED = '#c8323a', RED_D = '#7a1a20', HEMP = '#e0c68a', HEMP_D = '#9a7e48', OUT = '#2a1c0c';
const PLANK = { top: '#d6ae72', mid: '#9a7444', low: '#4a3218', nail: '#d9d4c2' };

export function makeHangingRopes(ctx) {
  const TS = ctx.TS, H = {};
  const L = () => ctx.L;
  let S = null;
  H.on = () => !!(L() && L().ropes && L().ropes.length);
  const knotBox = d => ({ l: d.knot[0] * TS + 1, r: d.knot[0] * TS + 15, t: (d.knot[1] - 1) * TS + 2, b: (d.knot[1] + 1) * TS });
  const knotPx = d => ({ x: d.knot[0] * TS + 8, y: (d.knot[1] + 1) * TS });
  const said = new Set(); const once = k => { if (said.has(k)) return false; said.add(k); return true; };
  const moverOf = id => ctx.movers().find(m => m.rope === id);

  /* ---------- RESET: everything tied, every cut thing back where it hangs (the grid is the level as built again: spawnEntitiesTail) ---------- */
  H.reset = () => {
    const lv = L(); if (!lv || !lv.ropes) { S = null; return; }
    S = { L: lv, r: new Map(), n: (S && S.L === lv) ? S.n : { cuts: 0, crushed: 0, rides: 0, bridges: 0, perch: 0, owlCuts: 0 } };
    for (const d of lv.ropes) {
      const s = { d, id: d.id, state: 'tied', t: 0, vy: 0 };
      if (d.kind === 'net') s.yb = d.hang * TS + 20;
      if (d.kind === 'bridge') s.a = 0;
      if (d.kind === 'perch' || d.kind === 'ledge') s.y = d.row * TS;
      S.r.set(d.id, s);
    }
    for (const m of ctx.movers()) if (m.rope) { m.x = m.x0r; m.y = m.y0; m.rs = 'tied'; m.t = 0; }
  };
  H.load = () => { S = null; H.reset(); };

  /* ---------- CUT ---------- */
  function cut(s, how) {
    if (!S || s.state !== 'tied') return false; const d = s.d; s.state = 'cut'; s.t = 0; S.n.cuts++; if (how === 'owl') S.n.owlCuts++;
    const k = d.knot ? knotPx(d) : { x: (d.x0 + d.x1 + 1) * TS / 2, y: d.row * TS };
    ctx.sfx.crack && ctx.sfx.crack(); ctx.sfx.creak && ctx.sfx.creak(); ctx.burst(k.x, k.y - 8, 8, [HEMP, HEMP_D, GOLD], 60, 0.5);
    if (d.kind === 'net') { s.state = 'fall'; s.vy = 0; }
    else if (d.kind === 'bridge') { s.state = 'swing'; s.a = 0; }
    else if (d.kind === 'counter') { const m = moverOf(d.id); s.state = 'rise'; if (m) m.rs = 'rise'; if (once('cut:counter')) ctx.number(k.x, k.y - 26, HR_SAY.counter, GOLD); }
    else if (d.kind === 'line') { const m = moverOf(d.id); s.state = 'run'; if (m) { m.rs = 'run'; m.t = 0; } if (once('cut:line')) ctx.number(k.x, k.y - 26, HR_SAY.line, GOLD); }
    else if (d.kind === 'perch' || d.kind === 'ledge') { s.state = 'fall'; s.vy = 0; s.y = d.row * TS;
      for (let x = d.x0; x <= d.x1; x++) ctx.cellSet(x, d.row, ctx.T.AIR);
      for (const p of ctx.players()) if (p && p.ground && !p.dead && p.x > d.x0 * TS - 4 && p.x < (d.x1 + 1) * TS + 4 && Math.abs(p.y - d.row * TS) < 4) { p.ground = false; p.vy = Math.max(p.vy || 0, 20); }
      if (d.kind === 'perch') { const hers = ctx.perchCut ? ctx.perchCut(d.k, how) : false; S.n.perch++;
        ctx.number((d.x0 + d.x1 + 1) * TS / 2, d.row * TS - 30, hers ? HR_SAY.perch : HR_SAY.perchEmpty, hers ? '#8fd160' : GOLD); } }
    return true;
  }
  H.cut = (id, how) => { const s = S && S.r.get(id); return s ? cut(s, how || 'hand') : false; };
  /* (THE OWL REEVE, phase two: she cuts a rope herself - the deck you ride drops back down; a ledge or a perch falls) */
  H.owlCut = id => { const s = S && S.r.get(id); if (!s) return false; const d = s.d;
    if (d.kind === 'counter') { const m = moverOf(id); if (!m || (m.rs !== 'top' && m.rs !== 'rise')) return false; m.rs = 'drop'; s.state = 'drop'; S.n.owlCuts++; ctx.sfx.crack && ctx.sfx.crack(); ctx.burst(m.x + 16, m.y - 4, 8, [HEMP, HEMP_D], 50, 0.5); return true; }
    return cut(s, 'owl'); };

  /* ---------- A BLOW (main.js: the attack box) ---------- */
  H.strike = hb => { if (!S || !hb) return; for (const s of S.r.values()) { const d = s.d; if (!d.knot || s.state !== 'tied') continue;
    if (ctx.overlap(hb, knotBox(d)) && !ctx.hitSet().has(s)) { ctx.hitSet().add(s); cut(s, 'hand'); } } };

  /* ---------- THE RIDES (main.js's mover loop hands every m.rope here) ---------- */
  H.mover = (m, dt) => {
    const s = S && S.r.get(m.rope); if (!s) return; const d = s.d, on = ctx.players().some(p => p && p.onMover === m);
    if (d.kind === 'counter') {
      if (m.rs === 'rise') { m.y = Math.max(m.y1, m.y - HR.cwUp * dt); if (m.y <= m.y1) { m.rs = 'top'; m.t = 0; ctx.sfx.clank && ctx.sfx.clank(); ctx.shake(2); } }
      else if (m.rs === 'top') { m.t = on ? 0 : m.t + dt; if (m.t >= HR.cwHold) { m.rs = 'back'; } }
      else if (m.rs === 'back') { m.y = Math.min(m.y0, m.y + HR.cwDown * dt); if (m.y >= m.y0) { m.rs = 'tied'; s.state = 'tied'; ctx.sfx.clank && ctx.sfx.clank(); } }
      else if (m.rs === 'drop') { m.y = Math.min(m.y0, m.y + HR.cwDrop * dt); if (m.y >= m.y0) { m.rs = 'tied'; s.state = 'tied'; ctx.shake(3); ctx.sfx.heavy && ctx.sfx.heavy(); ctx.dust(m.x + 16, m.y + 8, 8); } }
      if (on && m.rs === 'rise' && Math.random() < dt * 8) ctx.burst(m.x + 16, m.y + 8, 1, [HEMP_D], 20, 0.3);
      return; }
    if (d.kind === 'line') {
      const ax = d.a[0] * TS, ay = (d.a[1] + 1) * TS, bx = d.b[0] * TS, by = (d.b[1] + 1) * TS, len = Math.hypot(bx - ax, by - ay) || 1;
      if (m.rs === 'run') { m.t = Math.min(1, m.t + HR.lineV * dt / len); if (m.t >= 1) { m.rs = 'end'; m.w8 = 0; ctx.sfx.clank && ctx.sfx.clank(); if (on) S.n.rides++; } }
      else if (m.rs === 'end') { m.w8 = on ? 0 : (m.w8 || 0) + dt; if (m.w8 >= HR.lineWait) m.rs = 'back'; }
      else if (m.rs === 'back') { m.t = Math.max(0, m.t - HR.lineBack * dt / len); if (m.t <= 0) { m.rs = 'tied'; s.state = 'tied'; } }
      m.x = ax + (bx - ax) * m.t; m.y = ay + (by - ay) * m.t; }
  };

  /* ---------- UPDATE: what falls, what swings, what is hauled back, and the cuts no blow box carries (bolts, embers, a plunge) ---------- */
  H.update = dt => {
    if (!S) return;
    for (const s of S.r.values()) { const d = s.d;
      if (s.state === 'tied' && d.knot && ctx.struck && ctx.struck(knotBox(d))) cut(s, 'shot');
      if (d.kind === 'net' && s.state === 'fall') { s.vy += HR.netG * dt; s.yb += s.vy * dt; const ly = (d.land + 1) * TS;
        if (s.yb >= ly) { s.yb = ly; s.state = 'down'; landNet(s); } }
      if (d.kind === 'bridge' && s.state === 'swing') { s.a = Math.min(1, s.a + dt / HR.bridgeT * (0.4 + s.a * 1.6)); if (s.a >= 1) { s.state = 'down'; S.n.bridges++;
        for (let x = d.span[0]; x <= d.span[1]; x++) ctx.cellSet(x, d.span[2], ctx.T.PLANK);
        ctx.shake(3); ctx.sfx.heavy && ctx.sfx.heavy(); ctx.dust((d.span[0] + d.span[1] + 1) * TS / 2, d.span[2] * TS, 10);
        if (once('land:bridge')) ctx.number((d.span[0] + d.span[1] + 1) * TS / 2, d.span[2] * TS - 26, HR_SAY.bridge, '#8fd160'); } }
      if ((d.kind === 'perch' || d.kind === 'ledge') && s.state !== 'tied') { const fl = d.floor * TS;
        if (s.state === 'fall') { s.vy += HR.perchG * dt; s.y += s.vy * dt; if (s.y >= fl) { s.y = fl; s.state = 'down'; s.t = d.kind === 'perch' ? HR.perchDown : HR.ledgeDown; ctx.sfx.heavy && ctx.sfx.heavy(); ctx.dust((d.x0 + d.x1 + 1) * TS / 2, fl, 10); ctx.shake(3); } }
        else if (s.state === 'down') { s.t -= dt; if (s.t <= 0) { s.state = 'haul'; ctx.sfx.clank && ctx.sfx.clank(); } }
        else if (s.state === 'haul') { s.y = Math.max(d.row * TS, s.y - HR.haulV * dt);
          if (s.y <= d.row * TS) { const x0 = d.x0 * TS, x1 = (d.x1 + 1) * TS, y0 = d.row * TS, inIt = ctx.players().some(p => p && !p.dead && p.x + 5 > x0 && p.x - 5 < x1 && p.y > y0 + 1 && p.y - 16 < y0 + TS);
            if (!inIt) { for (let x = d.x0; x <= d.x1; x++) ctx.cellSet(x, d.row, ctx.T.ONEWAY); s.state = 'tied'; ctx.sfx.clank && ctx.sfx.clank(); } } } }
    }
  };
  function landNet(s) {
    const d = s.d, x0 = d.x * TS, x1 = (d.x + d.w) * TS, ly = (d.land + 1) * TS, box = { l: x0 - 2, r: x1 + 2, t: ly - 30, b: ly };
    ctx.shake(4); ctx.sfx.heavy && ctx.sfx.heavy(); ctx.dust((x0 + x1) / 2, ly, 12);
    let hit = 0; for (const e of ctx.enemies()) if (e.alive && !e.harmless && !e.maxHp && ctx.overlap(box, ctx.box(e))) { hit++; S.n.crushed++; ctx.hurt(e, HR.netDmg, (x0 + x1) / 2); if (e.alive) { e.stagger = Math.max(e.stagger || 0, HR.netStun); e.vx = 0; } }
    if (hit) ctx.number((x0 + x1) / 2, ly - 40, HR_SAY.net, '#8fd160');
    for (const p of ctx.players()) if (p && !p.dead && p.x > x0 - 5 && p.x < x1 + 5 && p.y > ly - 30 && p.y <= ly + 2) { p.x = p.x < (x0 + x1) / 2 ? x0 - 6 : x1 + 6; p.vx = 0; }   /* (a hero under it is shouldered aside, never shut in the step) */
    for (let x = d.x; x < d.x + d.w; x++) ctx.cellSet(x, d.land, ctx.T.SOLID);
    if (!hit && once('land:net')) ctx.number((x0 + x1) / 2, ly - 30, HR_SAY.netStep, '#8fd160');
  }

  /* ---------- THE REEVE ---------- */
  H.perchUp = k => { if (!S) return true; for (const s of S.r.values()) if (s.d.kind === 'perch' && s.d.k === k) return s.state === 'tied'; return true; };
  /* what she can cut in phase two: a deck that is up (you on it, or not), and every hung ledge and perch she is not sitting on */
  H.owlTargets = () => { if (!S) return []; const out = [];
    for (const s of S.r.values()) { const d = s.d;
      if (d.kind === 'counter' && d.arena) { const m = moverOf(d.id); if (m && (m.rs === 'top' || m.rs === 'rise')) out.push({ id: d.id, kind: 'counter', x: m.x + 16, y: m.y, top: d.wheelRow * TS, ridden: ctx.players().some(p => p && p.onMover === m) }); }
      if ((d.kind === 'ledge' || d.kind === 'perch') && s.state === 'tied') out.push({ id: d.id, kind: d.kind, k: d.k, x: (d.x0 + d.x1 + 1) * TS / 2, y: d.row * TS, x0: d.x0 * TS, x1: (d.x1 + 1) * TS, top: d.top * TS,
        stood: ctx.players().some(p => p && p.ground && !p.dead && p.x > d.x0 * TS - 4 && p.x < (d.x1 + 1) * TS + 4 && Math.abs(p.y - d.row * TS) < 4) }); }
    return out; };
  H.ropeOf = id => S && S.r.get(id);

  /* ---------- THE GUIDE (src/stuck-spots.js: done ['hvrope', col, row, 'cut']) and the tools ---------- */
  H.props = () => { if (!S) return []; const out = []; for (const s of S.r.values()) if (s.d.knot) out.push({ t: 'hvrope', id: s.id, kind: s.d.kind, x: s.d.knot[0] * TS + 8, y: (s.d.knot[1] + 1) * TS, cut: s.state !== 'tied' }); return out; };
  H.read = () => S ? { ropes: [...S.r.values()].map(s => ({ id: s.id, kind: s.d.kind, state: s.state, k: s.d.k, knot: s.d.knot, a: s.a, yb: s.yb, y: s.y })), decks: ctx.movers().filter(m => m.rope).map(m => ({ id: m.rope, rs: m.rs, x: m.x, y: m.y, y0: m.y0, y1: m.y1 })), n: { ...S.n } } : null;

  /* ================= THE ART (greybox-plus, in the village's own hemp and planks) ================= */
  const R = Math.round;
  const rect = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(R(x), R(y), w, h); };
  function ropeLine(g, x0, y0, x1, y1, taut = true) {   /* a twisted hemp line, dark-edged, two pixels */
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 2)), sag = taut ? 0 : Math.min(10, Math.abs(x1 - x0) * 0.06);
    for (let i = 0; i <= n; i++) { const u = i / n, x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u + Math.sin(u * Math.PI) * sag; rect(g, OUT, x - 1, y, 1, 2); rect(g, (i >> 1) & 1 ? HEMP : HEMP_D, x, y, 1, 2); }
  }
  /* THE KNOT: a cleat post with the rope bound round it in red and gold - every rope you can cut wears this, and it glints when you are near */
  function knot(g, x, y, hot, time, high) {
    x = R(x); y = R(y);
    if (!high) { rect(g, OUT, x - 3, y - 13, 7, 13); rect(g, '#6a4a2a', x - 2, y - 12, 5, 12); rect(g, '#8a6a40', x - 2, y - 12, 1, 12); rect(g, OUT, x - 4, y - 14, 9, 2); rect(g, '#8a6a40', x - 3, y - 14, 7, 1); }
    else { rect(g, OUT, x - 1, y - 14, 3, 6); rect(g, '#5a5a62', x, y - 14, 1, 5); }   /* (a hook in the rock: the high knots) */
    const k = hot ? 0.5 + 0.5 * Math.sin(time * 9) : 0;
    rect(g, RED_D, x - 3, y - 10, 7, 5); rect(g, RED, x - 3, y - 10, 7, 1); rect(g, RED, x - 3, y - 8, 7, 1); rect(g, RED, x - 3, y - 6, 7, 1);
    rect(g, GOLD_D, x - 4, y - 11, 9, 1); rect(g, GOLD, x - 4, y - 5, 9, 1); rect(g, GOLD, x + 2, y - 9, 2, 2);
    g.strokeStyle = GOLD; g.lineWidth = 1; g.beginPath(); g.arc(x + 4, y - 8, 2.5, 0, 7); g.stroke();
    if (hot) { g.globalAlpha = 0.25 + 0.45 * k; g.strokeStyle = GOLD; g.beginPath(); g.arc(x, y - 8, 9 + 2 * k, 0, 7); g.stroke(); g.globalAlpha = 0.6 * k; rect(g, '#fff6c8', x - 1, y - 18 - R(2 * k), 2, 2); g.globalAlpha = 1; }
  }
  /* WHAT IT WILL DO, DRAWN FIRST (A3/A6): a gold dotted outline of where the cut thing ends up, and an arrow along the way it goes */
  function ghostRect(g, x, y, w, h, time) { g.globalAlpha = 0.45 + 0.2 * Math.sin(time * 4); g.strokeStyle = GOLD; g.lineWidth = 1; g.setLineDash([2, 3]); g.lineDashOffset = -R(time * 8); g.strokeRect(R(x) + 0.5, R(y) + 0.5, w - 1, h - 1); g.setLineDash([]); g.lineDashOffset = 0; g.globalAlpha = 1; }
  function ghostArrow(g, x0, y0, x1, y1, time) { g.globalAlpha = 0.5; g.strokeStyle = GOLD; g.lineWidth = 1; g.setLineDash([2, 4]); g.lineDashOffset = -R(time * 10); g.beginPath(); g.moveTo(R(x0) + 0.5, R(y0) + 0.5); g.lineTo(R(x1) + 0.5, R(y1) + 0.5); g.stroke(); g.setLineDash([]); g.lineDashOffset = 0;
    const a = Math.atan2(y1 - y0, x1 - x0); g.fillStyle = GOLD; g.beginPath(); g.moveTo(R(x1), R(y1)); g.lineTo(R(x1 - Math.cos(a - 0.5) * 5), R(y1 - Math.sin(a - 0.5) * 5)); g.lineTo(R(x1 - Math.cos(a + 0.5) * 5), R(y1 - Math.sin(a + 0.5) * 5)); g.fill(); g.globalAlpha = 1; }
  function planks(g, x, y, w, seed) {   /* a run of lashed planks, the village's own */
    for (let i = 0; i < w; i += 4) { const ww = Math.min(4, w - i); rect(g, OUT, x + i, y - 1, ww, 1); rect(g, ((i >> 2) + seed) % 2 ? PLANK.top : '#c99e62', x + i, y, ww - 1, 1); rect(g, PLANK.mid, x + i, y + 1, ww - 1, 3); rect(g, PLANK.low, x + i, y + 4, ww, 1); }
    rect(g, PLANK.nail, x + 2, y + 2, 1, 1); rect(g, PLANK.nail, x + w - 3, y + 2, 1, 1);
  }
  function sandbag(g, x, y) { x = R(x); y = R(y); rect(g, OUT, x - 6, y + 2, 13, 13); rect(g, '#a08a5a', x - 5, y + 3, 11, 11); rect(g, '#bca474', x - 5, y + 3, 4, 10); rect(g, '#7a6640', x + 3, y + 5, 2, 9); rect(g, OUT, x - 2, y, 5, 3); rect(g, RED, x - 2, y + 1, 5, 1); rect(g, '#5a4a30', x - 3, y + 9, 7, 1); }
  function netBundle(g, x, y, w, swing) {   /* sacks and a crate in a hemp net, the cargo the hoists lost */
    x = R(x + swing); y = R(y); rect(g, OUT, x - 1, y - 1, w + 2, 22); rect(g, '#8a6a40', x + 1, y + 4, 12, 14); rect(g, '#a8844e', x + 1, y + 4, 12, 2); rect(g, '#bca474', x + 13, y + 6, w - 15, 13); rect(g, '#d0b888', x + 14, y + 7, 4, 10); rect(g, '#a08a5a', x + 4, y + 14, w - 8, 6);
    g.strokeStyle = HEMP; g.lineWidth = 1; for (let i = 3; i < w; i += 5) { g.beginPath(); g.moveTo(x + i + 0.5, y); g.lineTo(x + i - 3.5, y + 20); g.stroke(); g.beginPath(); g.moveTo(x + i - 3 + 0.5, y); g.lineTo(x + i + 1.5, y + 20); g.stroke(); }
    rect(g, HEMP_D, x + R(w / 2) - 2, y - 4, 4, 4); }
  function deck(g, m, cx, cy) { const x = R(m.x - cx), y = R(m.y - cy); planks(g, x, y, 32, 1); ropeLine(g, x + 2, y, x + 16, y - 14); ropeLine(g, x + 30, y, x + 16, y - 14); rect(g, OUT, x + 14, y - 16, 5, 3); rect(g, '#5a5a62', x + 15, y - 15, 3, 1); }

  H.drawWorld = (g, cx, cy, VW, VH, time) => {
    if (!S) return; const P = ctx.players()[0] || {};
    const vis = (x0, y0, x1, y1) => x1 - cx > -40 && x0 - cx < VW + 40 && y1 - cy > -60 && y0 - cy < VH + 60;
    for (const s of S.r.values()) { const d = s.d, kp = d.knot ? knotPx(d) : null, hot = kp && s.state === 'tied' && Math.hypot(P.x - kp.x, P.y - kp.y) < HR.near;
      if (d.kind === 'net') { const x0 = d.x * TS, w = d.w * TS, top = d.ring[1] * TS + 4, rx = d.ring[0] * TS + 8; if (!vis(Math.min(x0, kp.x), top, Math.max(x0 + w, kp.x), (d.land + 1) * TS)) continue;
        const sw = s.state === 'tied' ? Math.sin(time * 1.4 + d.x) * 1.5 : 0, ny = s.yb - 20;
        if (s.state === 'tied') { ropeLine(g, x0 + w / 2 + sw - cx, ny - 4 - cy, rx - cx, top - cy); ropeLine(g, rx - cx, top - cy, kp.x - cx, kp.y - 12 - cy, false); rect(g, OUT, rx - 2 - cx, top - 2 - cy, 5, 4);
          ghostRect(g, x0 - cx, d.land * TS - cy, w, TS, time); ghostArrow(g, x0 + w / 2 - cx, s.yb + 4 - cy, x0 + w / 2 - cx, d.land * TS - 3 - cy, time); }
        else if (s.state === 'fall') ropeLine(g, x0 + w / 2 - cx, ny - 12 - cy, x0 + w / 2 - cx, ny - 2 - cy);
        netBundle(g, x0 - cx, (s.state === 'down' ? (d.land + 1) * TS - 18 : ny) - cy, w, sw);
        knot(g, kp.x - cx, kp.y - cy, hot, time, d.high); }
      else if (d.kind === 'bridge') { const [b0, b1, row] = d.span, Lb = (b1 - b0 + 1) * TS, hx = d.hinge > 0 ? (b1 + 1) * TS : b0 * TS, hy = row * TS; if (!vis(Math.min(hx, kp.x) - Lb, hy - Lb, Math.max(hx, kp.x) + Lb, hy + 16)) continue;
        if (s.state !== 'down') { const th = s.a * Math.PI / 2, ux = -d.hinge * Math.sin(th), uy = -Math.cos(th);
          if (s.state === 'tied') { ghostRect(g, b0 * TS - cx, hy - cy, Lb, 6, time); ghostArrow(g, hx - cx - d.hinge * 4, hy - Lb * 0.7 - cy, hx - d.hinge * Lb * 0.7 - cx, hy - 6 - cy, time); }
          /* THE BRIDGE STANDING: slats across two side ropes, hinged at the lip - planks perpendicular to its length, so it reads as a bridge on end, not a ladder */
          const px = -uy, py = ux, sx = hx + px * 4 - cx, sy = hy + py * 4 - cy; g.lineCap = 'butt';
          for (let i = 2; i < Lb; i += 5) { const mx = hx + ux * i - cx, my = hy + uy * i - cy; g.lineWidth = 4; g.strokeStyle = OUT; g.beginPath(); g.moveTo(R(mx - px * 6), R(my - py * 6)); g.lineTo(R(mx + px * 6), R(my + py * 6)); g.stroke();
            g.lineWidth = 2; g.strokeStyle = (i / 5 | 0) % 2 ? PLANK.top : '#c99e62'; g.beginPath(); g.moveTo(R(mx - px * 5), R(my - py * 5)); g.lineTo(R(mx + px * 5), R(my + py * 5)); g.stroke(); }
          g.lineWidth = 1; const tx = hx + ux * Lb, ty = hy + uy * Lb; for (const k of [-6, 6]) ropeLine(g, hx + px * k - cx, hy + py * k - cy, tx + px * k - cx, ty + py * k - cy);
          if (s.state === 'tied') ropeLine(g, tx - cx, ty - cy, kp.x - cx, kp.y - 12 - cy, false); }
        else { for (let x = b0; x <= b1; x++) planks(g, x * TS - cx, hy - cy, TS, x); ropeLine(g, b0 * TS - cx, hy - 6 - cy, (b1 + 1) * TS - cx, hy - 6 - cy, false); for (const x of [b0 * TS, (b1 + 1) * TS - 1]) rect(g, OUT, x - cx, hy - 9 - cy, 2, 9); }
        knot(g, kp.x - cx, kp.y - cy, hot, time, d.high); }
      else if (d.kind === 'counter') { const m = moverOf(d.id); if (!m) continue; const wy = d.wheelRow * TS + 8, wx = (m.x + 16 + d.bag * TS + 8) / 2, bx = d.bag * TS + 8; if (!vis(Math.min(m.x, bx, kp.x), wy - 10, Math.max(m.x + 32, bx, kp.x), m.y0 + 16)) continue;
        const travel = m.y0 - m.y, by = wy + 10 + travel;   /* the bag goes down as far as the deck goes up */
        ropeLine(g, m.x + 16 - cx, m.y - 16 - cy, m.x + 16 - cx, wy - cy); ropeLine(g, bx - cx, wy - cy, bx - cx, by - cy);
        g.fillStyle = OUT; g.beginPath(); g.arc(R(wx - cx), R(wy - cy), 7, 0, 7); g.fill(); g.fillStyle = '#7a5a34'; g.beginPath(); g.arc(R(wx - cx), R(wy - cy), 5, 0, 7); g.fill(); rect(g, '#c9a870', wx - cx - 1, wy - cy - 1, 2, 2);
        rect(g, '#7a5a34', wx - cx - 1, wy - cy - 30, 2, 24); ropeLine(g, m.x + 16 - cx, wy - cy - 6, bx - cx, wy - cy - 6);
        sandbag(g, bx - cx, by - cy); deck(g, m, cx, cy);
        if (s.fray > 0) { g.globalAlpha = 0.5 + 0.5 * Math.sin(time * 30); g.strokeStyle = '#ff6b6b'; g.beginPath(); g.arc(R(m.x + 16 - cx), R(m.y - 20 - cy), 10, 0, 7); g.stroke(); g.globalAlpha = 1; rect(g, '#ff6b6b', m.x + 15 - cx, m.y - 30 - cy, 3, 2); }   /* (her beak on the deck's rope) */
        if (m.rs === 'tied') { ropeLine(g, m.x + (kp.x > m.x ? 30 : 2) - cx, m.y + 4 - cy, kp.x - cx, kp.y - 10 - cy, false); ghostRect(g, m.x - cx, m.y1 - cy, 32, 6, time); ghostArrow(g, m.x + 16 - cx, m.y - 20 - cy, m.x + 16 - cx, m.y1 + 10 - cy, time); }
        knot(g, kp.x - cx, kp.y - cy, hot && m.rs === 'tied', time, d.high); }
      else if (d.kind === 'line') { const m = moverOf(d.id); if (!m) continue; const ax = d.a[0] * TS + 16, ay = (d.a[1] + 1) * TS - 22, bx = d.b[0] * TS + 16, by = (d.b[1] + 1) * TS - 22; if (!vis(Math.min(ax, bx) - 20, Math.min(ay, by) - 30, Math.max(ax, bx) + 20, Math.max(ay, by) + 30)) continue;
        for (const [px0, py0] of [[ax, ay], [bx, by]]) { rect(g, OUT, px0 - cx - 2, py0 - cy - 8, 5, 30); rect(g, '#7a5a34', px0 - cx - 1, py0 - cy - 7, 3, 28); rect(g, OUT, px0 - cx - 4, py0 - cy - 9, 9, 3); }
        ropeLine(g, ax - cx, ay - cy, bx - cx, by - cy);
        const sx = m.x + 16, sy = m.y - 22; rect(g, OUT, sx - cx - 3, sy - cy - 3, 7, 6); rect(g, '#5a5a62', sx - cx - 2, sy - cy - 2, 5, 4); ropeLine(g, sx - cx, sy - cy + 2, m.x + 2 - cx, m.y - cy); ropeLine(g, sx - cx, sy - cy + 2, m.x + 30 - cx, m.y - cy);
        planks(g, R(m.x - cx), R(m.y - cy), 32, 0);
        if (m.rs === 'tied') { ropeLine(g, m.x + 2 - cx, m.y + 3 - cy, kp.x - cx, kp.y - 10 - cy, false); ghostRect(g, d.b[0] * TS - cx, (d.b[1] + 1) * TS - cy, 32, 6, time); ghostArrow(g, ax + (bx - ax) * 0.15 - cx, ay + (by - ay) * 0.15 + 14 - cy, bx - (bx - ax) * 0.1 - cx, by - (by - ay) * 0.1 + 14 - cy, time); }
        knot(g, kp.x - cx, kp.y - cy, hot && m.rs === 'tied', time, d.high); }
      else if (d.kind === 'perch' || d.kind === 'ledge') { const x0 = d.x0 * TS, x1 = (d.x1 + 1) * TS, top = d.top * TS + 4; if (!vis(x0 - 20, top, x1 + 20, d.floor * TS + 10)) continue;
        const y = s.state === 'tied' ? d.row * TS : s.y, cut = s.state === 'fall' || s.state === 'down';
        if (!cut) for (const rx of [x0 + 3, x1 - 4]) ropeLine(g, rx - cx, top - cy, rx - cx, y - cy);
        else for (const rx of [x0 + 3, x1 - 4]) { ropeLine(g, rx - cx, top - cy, rx - cx, top + 14 - cy); rect(g, HEMP, rx - cx - 1, top + 14 - cy, 1, 4); rect(g, HEMP_D, rx - cx + 1, top + 14 - cy, 1, 3); }
        if (s.state !== 'tied') planks(g, x0 - cx, y - cy - (s.state === 'down' ? 5 : 0), x1 - x0, d.x0);
        if (kp) { const k = s.state === 'tied'; if (k) ropeLine(g, x1 - 4 - cx, top - cy, kp.x - cx, kp.y - 12 - cy, false); knot(g, kp.x - cx, kp.y - cy, hot, time, false);
          if (k && ctx.owlOn && ctx.owlOn(d.k)) { g.globalAlpha = 0.5 + 0.3 * Math.sin(time * 10); ghostArrow(g, (x0 + x1) / 2 - cx, y + 8 - cy, (x0 + x1) / 2 - cx, d.floor * TS - 6 - cy, time); g.globalAlpha = 1; } }
        if (s.fray > 0) { g.globalAlpha = 0.5 + 0.5 * Math.sin(time * 30); g.strokeStyle = '#ff6b6b'; g.beginPath(); g.arc(R((x0 + x1) / 2 - cx), R(y - 12 - cy), 10, 0, 7); g.stroke(); g.globalAlpha = 1;
          for (const rx of [x0 + 3, x1 - 4]) { rect(g, '#ff6b6b', rx - cx - 1, y - 20 - cy + R(Math.sin(time * 40) * 1), 3, 2); } } }   /* (her beak on it: the fray, red, where she saws) */
    }
  };
  return H;
}
