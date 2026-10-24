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
  perchG: 900, perchDown: 12, ledgeDown: 7, haulV: 60, near: 150 };
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

  /* ================= THE ART (claude/hangpolish: the village's own hemp and planks, polished - knotted nets, rope rails, sandbags, wheels, cut stubs) ================= */
  const R = Math.round;
  const rect = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(R(x), R(y), w, h); };
  const CUTFACE = '#f4e8c0';
  function ropeRaw(g, x0, y0, x1, y1, taut = true) {   /* a twisted hemp line, dark-edged, two pixels */
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 2)), sag = taut ? 0 : Math.min(10, Math.abs(x1 - x0) * 0.06);
    const px = [], py = []; for (let i = 0; i <= n; i++) { const u = i / n; px.push(R(x0 + (x1 - x0) * u)); py.push(R(y0 + (y1 - y0) * u + Math.sin(u * Math.PI) * sag)); }
    /* (path-batched: one fill per colour, not one fillRect per dot - the arena draws a dozen ropes a frame) */
    g.fillStyle = OUT; g.beginPath(); for (let i = 0; i <= n; i++) g.rect(px[i] - 1, py[i], 1, 2); g.fill();
    g.fillStyle = HEMP; g.beginPath(); for (let i = 0; i <= n; i++) if ((i >> 1) & 1) g.rect(px[i], py[i], 1, 2); g.fill();
    g.fillStyle = HEMP_D; g.beginPath(); for (let i = 0; i <= n; i++) if (!((i >> 1) & 1)) g.rect(px[i], py[i], 1, 2); g.fill();
  }
  /* (claude/b120release) THE ROPE CACHE: the same (dx, dy) rope is drawn every frame - the arena has a dozen - so the second sighting bakes it once and every frame after blits it (moving ropes keep drawing direct until a shape repeats) */
  const ROPES = new Map();
  function ropeLine(g, x0, y0, x1, y1, taut = true) {
    const dx = R(x1 - x0), dy = R(y1 - y0); if (Math.abs(dx) + Math.abs(dy) < 20) return ropeRaw(g, x0, y0, x1, y1, taut);
    const key = dx + "," + dy + (taut ? "t" : "s"); let e = ROPES.get(key);
    if (!e) { if (ROPES.size > 600) ROPES.clear(); ROPES.set(key, { n: 1 }); return ropeRaw(g, x0, y0, x1, y1, taut); }
    if (!e.c) { const P = 3, ox = P + (dx < 0 ? -dx : 0), oy = P + (dy < 0 ? -dy : 0), c = document.createElement("canvas"); c.width = Math.abs(dx) + P * 2 + 1; c.height = Math.abs(dy) + P * 2 + 14;
      ropeRaw(c.getContext("2d"), ox, oy, ox + dx, oy + dy, taut); e.c = c; e.ox = ox; e.oy = oy; }
    g.drawImage(e.c, R(x0) - e.ox, R(y0) - e.oy);
  }
  /* A BAKED SPRITE: the static pieces (sandbag, deck, knot, net, wheel) are drawn once into their own canvas and blitted - the arena has seven ropes on screen at 4x throttle */
  const BAKE = new Map();
  function baked(key, w, h, ax, ay, draw) { let c = BAKE.get(key); if (!c) { c = document.createElement('canvas'); c.width = w; c.height = h; const g2 = c.getContext('2d'); draw(g2, ax, ay); BAKE.set(key, c); } return [c, ax, ay]; }
  const blit = (g, b, x, y) => g.drawImage(b[0], R(x) - b[1], R(y) - b[2]);
  /* A CUT END, FRAYED: the pale cut face and a fan of loose fibres, pointing `s` (+1 down, -1 up) away from the rope that is left */
  function frayEnd(g, x, y, s) { x = R(x); y = R(y);
    rect(g, CUTFACE, x - 1, y, 2, 1); rect(g, OUT, x - 2, y, 1, 1); rect(g, OUT, x + 1, y, 1, 1);
    rect(g, HEMP, x - 1, y + s, 1, 1); rect(g, HEMP_D, x, y + s, 1, 1); rect(g, HEMP, x + 1, y + s, 1, 1);
    rect(g, HEMP_D, x - 2, y + 2 * s, 1, 1); rect(g, HEMP, x, y + 2 * s, 1, 1); rect(g, HEMP, x + 2, y + 2 * s, 1, 1);
    rect(g, HEMP, x - 2, y + 3 * s, 1, 1); rect(g, HEMP_D, x + 3, y + 3 * s, 1, 1);
  }
  /* A SPENT KNOT: the cleat with the red wrap slackened and the rope gone from it - a short CUT STUB standing up off the post, its end frayed, a tail of the
     wrap hanging. It must read as DONE next to a live knot (no gold, no glow, no flag). */
  function knotSpent(g, x, y, high) {
    x = R(x); y = R(y);
    if (!high) { rect(g, OUT, x - 3, y - 13, 7, 13); rect(g, '#5a3e22', x - 2, y - 12, 5, 12); rect(g, '#74583a', x - 2, y - 12, 1, 12); rect(g, OUT, x - 4, y - 14, 9, 2); rect(g, '#74583a', x - 3, y - 14, 7, 1); }
    else { rect(g, OUT, x - 1, y - 14, 3, 6); rect(g, '#4a4a52', x, y - 14, 1, 5); }
    rect(g, OUT, x - 3, y - 10, 7, 4); rect(g, '#5a2a2c', x - 2, y - 9, 5, 1); rect(g, '#6a3034', x - 2, y - 7, 3, 1);   /* the wrap, dull and loose */
    rect(g, GOLD_D, x - 3, y - 9, 1, 1);
    rect(g, OUT, x, y - 21, 3, 8); rect(g, HEMP_D, x + 1, y - 20, 1, 7); rect(g, HEMP, x, y - 20, 1, 6); frayEnd(g, x + 1, y - 21, -1);   /* THE STUB */
    rect(g, OUT, x + 3, y - 8, 3, 7); rect(g, HEMP_D, x + 4, y - 7, 1, 5); rect(g, HEMP, x + 3, y - 7, 1, 4); frayEnd(g, x + 4, y - 1, 1);   /* the tail of the wrap, hanging */
  }
  /* THE KNOT: a cleat post with the rope bound round it in red and gold, a gold pennant on top (the silhouette that reads at phone size) - every rope you can cut wears this, and it glints when you are near */
  function knot(g, x, y, hot, time, high, spent) {
    x = R(x); y = R(y);
    if (spent) { blit(g, baked('ks' + (high ? 1 : 0), 20, 40, 8, 30, (g2, ax, ay) => knotSpent(g2, ax, ay, high)), x, y); return; }
    const fw0 = Math.round(Math.sin(time * 5 + x * 0.3) * 0.6 + 0.4);
    blit(g, baked('kl' + (high ? 1 : 0) + fw0, 22, 40, 8, 30, (g2, ax, ay) => knotLive(g2, ax, ay, high, fw0)), x, y);
    if (hot) { const k = 0.5 + 0.5 * Math.sin(time * 9); g.globalAlpha = 0.25 + 0.45 * k; g.strokeStyle = GOLD; g.lineWidth = 1; g.beginPath(); g.arc(x, y - 8, 9 + 2 * k, 0, 7); g.stroke(); g.globalAlpha = 0.6 * k; rect(g, '#fff6c8', x - 1, y - 28 - R(2 * k), 2, 2); g.globalAlpha = 1; }
  }
  function knotLive(g, x, y, high, fw) {
    if (!high) { rect(g, OUT, x - 3, y - 13, 7, 13); rect(g, '#6a4a2a', x - 2, y - 12, 5, 12); rect(g, '#8a6a40', x - 2, y - 12, 1, 12); rect(g, OUT, x - 4, y - 14, 9, 2); rect(g, '#8a6a40', x - 3, y - 14, 7, 1); }
    else { rect(g, OUT, x - 1, y - 14, 3, 6); rect(g, '#5a5a62', x, y - 14, 1, 5); }   /* (a hook in the rock: the high knots) */
    rect(g, OUT, x - 4, y - 11, 9, 8);   /* the wrap's dark rim keeps it a block of colour on any wall */
    rect(g, RED_D, x - 3, y - 10, 7, 5); rect(g, RED, x - 3, y - 10, 7, 1); rect(g, RED, x - 3, y - 8, 7, 1); rect(g, RED, x - 3, y - 6, 7, 1);
    rect(g, '#e8545c', x - 2, y - 9, 2, 1);
    rect(g, GOLD_D, x - 4, y - 11, 9, 1); rect(g, GOLD, x - 4, y - 5, 9, 1); rect(g, GOLD, x + 2, y - 9, 2, 2);
    g.strokeStyle = GOLD; g.lineWidth = 1; g.beginPath(); g.arc(x + 4, y - 8, 2.5, 0, 7); g.stroke();
    /* the pennant: a gold flag on a short staff above the cleat */
    rect(g, OUT, x - 1, y - 24, 3, 11); rect(g, '#6a4a2a', x, y - 23, 1, 10);
    rect(g, OUT, x + 1, y - 24, 8, 6 + fw); rect(g, GOLD, x + 1, y - 23, 7, 4); rect(g, GOLD_D, x + 1, y - 20, 7, 1 + fw); rect(g, RED, x + 3, y - 22, 2, 2); rect(g, OUT, x + 8, y - 22 + fw, 1, 2);
  }
  /* WHAT IT WILL DO, DRAWN FIRST (A3/A6): the landing in a ring of gold dots (a faint gold wash inside), and an arrow of gold dots marching the way it goes */
  function ghostRect(g, x, y, w, h, time) { x = R(x); y = R(y); g.globalAlpha = 0.12; rect(g, GOLD, x, y, w, h);
    g.globalAlpha = 0.62 + 0.2 * Math.sin(time * 4); for (let i = 0; i < w; i += 4) { rect(g, GOLD, x + i, y, 1, 1); rect(g, GOLD, x + i, y + h - 1, 1, 1); } for (let j = 0; j < h; j += 4) { rect(g, GOLD, x, y + j, 1, 1); rect(g, GOLD, x + w - 1, y + j, 1, 1); }
    for (const [cx0, cy0] of [[x, y], [x + w - 2, y], [x, y + h - 2], [x + w - 2, y + h - 2]]) rect(g, GOLD, cx0, cy0, 2, 2); g.globalAlpha = 1; }
  function ghostArrow(g, x0, y0, x1, y1, time) { const len = Math.hypot(x1 - x0, y1 - y0) || 1, ux = (x1 - x0) / len, uy = (y1 - y0) / len, ph = (time * 9) % 5;
    for (let d = ph; d < len - 6; d += 5) { g.globalAlpha = 0.25 + 0.45 * (d / len); rect(g, GOLD, x0 + ux * d, y0 + uy * d, 2, 2); }
    g.globalAlpha = 0.85; const a = Math.atan2(y1 - y0, x1 - x0); g.fillStyle = GOLD; g.beginPath(); g.moveTo(R(x1), R(y1)); g.lineTo(R(x1 - Math.cos(a - 0.5) * 6), R(y1 - Math.sin(a - 0.5) * 6)); g.lineTo(R(x1 - Math.cos(a + 0.5) * 6), R(y1 - Math.sin(a + 0.5) * 6)); g.fill(); g.globalAlpha = 1; }
  function planks(g, x, y, w, seed) {   /* a run of lashed planks, the village's own */
    for (let i = 0; i < w; i += 4) { const ww = Math.min(4, w - i); rect(g, OUT, x + i, y - 1, ww, 1); rect(g, ((i >> 2) + seed) % 2 ? PLANK.top : '#c99e62', x + i, y, ww - 1, 1); rect(g, PLANK.mid, x + i, y + 1, ww - 1, 3); rect(g, PLANK.low, x + i, y + 4, ww, 1); }
    rect(g, PLANK.nail, x + 2, y + 2, 1, 1); rect(g, PLANK.nail, x + w - 3, y + 2, 1, 1);
  }
  /* THE SANDBAG: burlap (a woven dither), a gathered neck tied in twine, a stitched seam, a patch, a ring to hang it by */
  function sandbag(g, x, y) { x = R(x); y = R(y);
    rect(g, OUT, x - 2, y - 4, 5, 4); rect(g, '#6a6a72', x - 1, y - 3, 3, 2); rect(g, OUT, x - 1, y - 6, 3, 2);   /* the ring and its shackle */
    rect(g, OUT, x - 3, y - 1, 7, 5); rect(g, '#8a7448', x - 2, y, 5, 3);   /* the gathered neck */
    rect(g, OUT, x - 7, y + 3, 15, 15); rect(g, OUT, x - 6, y + 2, 13, 1); rect(g, '#a08a5a', x - 6, y + 3, 13, 14); rect(g, OUT, x - 6, y + 17, 13, 1);
    for (let j = 0; j < 14; j += 2) for (let i = 0; i < 13; i += 2) rect(g, '#b8a06c', x - 6 + i + ((j >> 1) & 1), y + 3 + j, 1, 1);   /* the weave */
    rect(g, '#c8b280', x - 6, y + 4, 2, 11); rect(g, '#7a6640', x + 4, y + 4, 3, 13); rect(g, '#665430', x + 6, y + 6, 1, 11);   /* light on the left, belly shadow on the right */
    for (let j = 4; j < 16; j += 2) rect(g, '#5a4a30', x, y + j, 1, 1);   /* the seam: stitches down the middle */
    rect(g, '#8a6a50', x + 1, y + 9, 4, 4); rect(g, '#5a4a30', x + 1, y + 9, 4, 1); rect(g, '#5a4a30', x + 1, y + 12, 4, 1);   /* a patch */
    rect(g, HEMP, x - 3, y + 2, 7, 1); rect(g, HEMP_D, x - 3, y + 3, 7, 1); rect(g, HEMP, x + 3, y + 4, 1, 3);   /* the twine round the neck, an end hanging */
  }
  /* THE CARGO NET: the lost cargo in a diamond mesh of hemp, knotted at every crossing, pulled in to a ring at the top and bellying out under its weight */
  function netBundle(g, x, y, w, swing, falling) {
    x = R(x + swing); y = R(y); const cx0 = x + w / 2, h = 21, hw = w / 2;
    const bag = () => { g.beginPath(); g.moveTo(cx0 - 2, y + 1); g.quadraticCurveTo(x - 1, y + 6, x, y + 14); g.quadraticCurveTo(x, y + h, x + 4, y + h); g.lineTo(x + w - 4, y + h); g.quadraticCurveTo(x + w, y + h, x + w, y + 14); g.quadraticCurveTo(x + w + 1, y + 6, cx0 + 2, y + 1); g.closePath(); };
    g.fillStyle = OUT; g.save(); g.translate(0, 0); bag(); g.fill(); g.restore();
    g.save(); bag(); g.clip();
    rect(g, '#6a4e2c', x, y + 2, w, h);   /* the dark of the load behind the mesh */
    rect(g, '#8a6a40', x + 1, y + 7, 12, 14); rect(g, '#a8844e', x + 1, y + 7, 12, 2); rect(g, '#5a4020', x + 1, y + 13, 12, 1); rect(g, '#5a4020', x + 6, y + 8, 1, 13);   /* a crate: top board, slat, post */
    rect(g, '#bca474', x + 13, y + 9, Math.max(6, w - 14), 13); rect(g, '#d0b888', x + 14, y + 10, 4, 9); rect(g, '#8a7448', x + 19, y + 11, 3, 10);   /* a sack */
    g.fillStyle = '#a08a5a'; g.beginPath(); g.ellipse(cx0 + 2, y + 8, 7, 4, 0, 0, 7); g.fill(); rect(g, '#c8b280', cx0 - 2, y + 6, 3, 1);   /* a round sack on top */
    g.strokeStyle = HEMP; g.lineWidth = 1;
    for (let r = 0, yy = y + 1; yy < y + h + 6; r++, yy += 4) for (let xx = x - 2 + ((r & 1) ? 2 : 0); xx < x + w + 4; xx += 5) {   /* the mesh: every strand runs diagonally to the knots of the next row */
      g.beginPath(); g.moveTo(xx + 0.5, yy + 0.5); g.lineTo(xx + 2.5, yy + 4.5); g.stroke(); g.beginPath(); g.moveTo(xx + 0.5, yy + 0.5); g.lineTo(xx - 1.5, yy + 4.5); g.stroke(); }
    for (let r = 0, yy = y + 1; yy < y + h + 6; r++, yy += 4) for (let xx = x - 2 + ((r & 1) ? 2 : 0); xx < x + w + 4; xx += 5) { rect(g, '#2a1c0c', xx, yy + 1, 2, 1); rect(g, '#f0dca0', xx, yy, 2, 1); }   /* a knot at every crossing */
    g.restore();
    g.strokeStyle = OUT; g.lineWidth = 1; bag(); g.stroke();
    g.strokeStyle = HEMP; g.beginPath(); g.moveTo(x + 2.5, y + h - 0.5); g.lineTo(x + w - 2.5, y + h - 0.5); g.stroke();   /* the hem rope along the sagging bottom */
    for (const sx of [-1, 1]) ropeLine(g, cx0 + sx * 1, y - 4, cx0 + sx * (hw - 3), y + 7);   /* the gathering lines from the ring to the rim */
    rect(g, OUT, R(cx0) - 3, y - 6, 6, 5); rect(g, HEMP_D, R(cx0) - 2, y - 5, 4, 3); rect(g, '#6a6a72', R(cx0) - 1, y - 4, 2, 1);   /* the ring */
    if (falling) { g.globalAlpha = 0.4; rect(g, '#fff6e0', x + 3, y - 12, 1, 8); rect(g, '#fff6e0', x + w - 4, y - 16, 1, 10); g.globalAlpha = 1; }   /* (the speed lines) */
  }
  /* THE COUNTERWEIGHT DECK: lashed planks on a beam, side cleats with eyes, and a bridle of two ropes meeting at a ring and shackle */
  function deck(g, m, cx, cy) { const x = R(m.x - cx), y = R(m.y - cy);
    rect(g, OUT, x - 1, y + 5, 34, 3); rect(g, '#4a3218', x, y + 5, 32, 2); rect(g, OUT, x + 4, y + 5, 3, 4); rect(g, OUT, x + 25, y + 5, 3, 4);   /* the beam under, and its two hangers */
    planks(g, x, y, 32, 1);
    for (const ex of [x, x + 29]) { rect(g, OUT, ex, y - 5, 3, 6); rect(g, PLANK.mid, ex, y - 4, 2, 5); rect(g, HEMP, ex, y - 3, 2, 1); }   /* the end posts, a lashing */
    ropeLine(g, x + 1, y - 4, x + 16, y - 15); ropeLine(g, x + 30, y - 4, x + 16, y - 15);
    rect(g, OUT, x + 13, y - 18, 7, 5); rect(g, '#6a6a72', x + 14, y - 17, 5, 3); rect(g, '#9a9aa2', x + 14, y - 17, 5, 1); rect(g, OUT, x + 15, y - 16, 3, 1);   /* the ring and shackle */
  }
  /* THE PULLEY WHEEL: a rim, six spokes that turn as the deck travels, a gold hub, on a bracket */
  function wheel(g, x, y, r, ang) { const q = ((Math.round(ang / (Math.PI / 12)) % 12) + 12) % 12; blit(g, baked('wh' + r + '_' + q, 24, 24, 12, 12, (g2, ax, ay) => wheelDraw(g2, ax, ay, r, q * Math.PI / 12)), x, y); }
  function wheelDraw(g, x, y, r, ang) { x = R(x); y = R(y);
    g.fillStyle = OUT; g.beginPath(); g.arc(x, y, r + 1.5, 0, 7); g.fill(); g.fillStyle = '#8a6a40'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.fillStyle = '#3a2814'; g.beginPath(); g.arc(x, y, r - 1.6, 0, 7); g.fill();
    g.strokeStyle = '#b8935a'; g.lineWidth = 1; for (let k = 0; k < 6; k++) { const a = ang + k * Math.PI / 3; g.beginPath(); g.moveTo(x + 0.5, y + 0.5); g.lineTo(x + 0.5 + Math.cos(a) * (r - 1), y + 0.5 + Math.sin(a) * (r - 1)); g.stroke(); }
    rect(g, '#c9a870', x - 1, y - 1, 3, 3); rect(g, OUT, x, y, 1, 1); }

  H.drawWorld = (g, cx, cy, VW, VH, time) => {
    if (!S) return; const P = ctx.players()[0] || {};
    const vis = (x0, y0, x1, y1) => x1 - cx > -40 && x0 - cx < VW + 40 && y1 - cy > -60 && y0 - cy < VH + 60;
    for (const s of S.r.values()) { const d = s.d, kp = d.knot ? knotPx(d) : null, hot = kp && s.state === 'tied' && Math.hypot(P.x - kp.x, P.y - kp.y) < HR.near;
      if (d.kind === 'net') { const x0 = d.x * TS, w = d.w * TS, top = d.ring[1] * TS + 4, rx = d.ring[0] * TS + 8; if (!vis(Math.min(x0, kp.x), top, Math.max(x0 + w, kp.x), (d.land + 1) * TS)) continue;
        const sw = s.state === 'tied' ? Math.sin(time * 1.4 + d.x) * 1.5 : 0, ny = s.yb - 20;
        /* THE HOOK: an iron hoist hook on a short beam, where the net hung */
        rect(g, OUT, rx - 4 - cx, top - 3 - cy, 9, 3); rect(g, PLANK.mid, rx - 3 - cx, top - 2 - cy, 7, 1); rect(g, OUT, rx - 2 - cx, top - cy, 5, 4); rect(g, '#6a6a72', rx - 1 - cx, top + 1 - cy, 3, 2);
        if (s.state === 'tied') { ropeLine(g, x0 + w / 2 + sw - cx, ny - 4 - cy, rx - cx, top + 2 - cy); ropeLine(g, rx - cx, top + 2 - cy, kp.x - cx, kp.y - 12 - cy, false);
          ghostRect(g, x0 - cx, d.land * TS - cy, w, TS, time); ghostArrow(g, x0 + w / 2 - cx, s.yb + 4 - cy, x0 + w / 2 - cx, d.land * TS - 3 - cy, time); }
        else { ropeLine(g, rx - cx, top + 2 - cy, rx - cx, top + 9 - cy); frayEnd(g, rx - cx, top + 9 - cy, 1);   /* the stub left on the hook */
          if (s.state === 'fall') { ropeLine(g, x0 + w / 2 - cx, ny - 12 - cy, x0 + w / 2 - cx, ny - 4 - cy); frayEnd(g, x0 + w / 2 - cx, ny - 12 - cy, -1); } }
        { const by0 = (s.state === 'down' ? (d.land + 1) * TS - 18 : ny) - cy, fl = s.state === 'fall'; blit(g, baked('net' + w + (fl ? 'f' : ''), w + 20, 52, 10, 20, (g2, ax, ay) => netBundle(g2, ax, ay, w, 0, fl)), x0 - cx + R(sw), by0); }
        knot(g, kp.x - cx, kp.y - cy, hot, time, d.high, s.state !== 'tied'); }
      else if (d.kind === 'bridge') { const [b0, b1, row] = d.span, Lb = (b1 - b0 + 1) * TS, hx = d.hinge > 0 ? (b1 + 1) * TS : b0 * TS, hy = row * TS; if (!vis(Math.min(hx, kp.x) - Lb, hy - Lb, Math.max(hx, kp.x) + Lb, hy + 16)) continue;
        if (s.state !== 'down') {
          const standing = (a, full, alpha) => { const th = a * Math.PI / 2, ux = -d.hinge * Math.sin(th), uy = -Math.cos(th), px = -uy, py = ux; g.globalAlpha = alpha; g.lineCap = 'butt';
            /* THE BRIDGE STANDING: slats across two side ropes, hinged at the lip - planks perpendicular to its length, so it reads as a bridge on end, not a ladder */
            if (full) for (let i = 2; i < Lb; i += 5) { const mx = hx + ux * i - cx, my = hy + uy * i - cy; g.lineWidth = 4; g.strokeStyle = OUT; g.beginPath(); g.moveTo(R(mx - px * 6), R(my - py * 6)); g.lineTo(R(mx + px * 6), R(my + py * 6)); g.stroke();
              g.lineWidth = 2; g.strokeStyle = (i / 5 | 0) % 2 ? PLANK.top : '#c99e62'; g.beginPath(); g.moveTo(R(mx - px * 5), R(my - py * 5)); g.lineTo(R(mx + px * 5), R(my + py * 5)); g.stroke();
              rect(g, PLANK.nail, mx - px * 5, my - py * 5, 1, 1); rect(g, PLANK.nail, mx + px * 5, my + py * 5, 1, 1); }
            g.lineWidth = 1; const tx = hx + ux * Lb, ty = hy + uy * Lb; for (const k of [-6, 6]) { ropeLine(g, hx + px * k - cx, hy + py * k - cy, tx + px * k - cx, ty + py * k - cy); if (full) ropeLine(g, hx + px * k - cx + 1, hy + py * k - cy, tx + px * k - cx + 1, ty + py * k - cy); }
            if (full) { g.lineWidth = 5; g.strokeStyle = OUT; g.beginPath(); g.moveTo(R(tx - px * 8 - cx), R(ty - py * 8 - cy)); g.lineTo(R(tx + px * 8 - cx), R(ty + py * 8 - cy)); g.stroke(); g.lineWidth = 3; g.strokeStyle = PLANK.mid; g.beginPath(); g.moveTo(R(tx - px * 7 - cx), R(ty - py * 7 - cy)); g.lineTo(R(tx + px * 7 - cx), R(ty + py * 7 - cy)); g.stroke(); g.lineWidth = 1; }   /* the head beam */
            g.globalAlpha = 1; return [tx, ty, px, py, ux, uy]; };
          if (s.state === 'tied') { ghostRect(g, b0 * TS - cx, hy - cy, Lb, 6, time); ghostArrow(g, hx - cx - d.hinge * 4, hy - Lb * 0.7 - cy, hx - d.hinge * Lb * 0.7 - cx, hy - 6 - cy, time); }
          if (s.state === 'swing') { standing(Math.max(0, s.a - 0.22), false, 0.18); standing(Math.max(0, s.a - 0.11), false, 0.3); }   /* the swing: the last two places it was, faint */
          const sway = s.state === 'tied' ? Math.sin(time * 1.6 + d.span[0]) * 0.012 : 0, [tx, ty, px, py] = standing(s.a + sway, true, 1);
          if (s.state === 'tied') { for (const k of [-6, 6]) ropeLine(g, tx + px * k - cx, ty + py * k - cy, tx - cx, ty - 8 - cy); ropeLine(g, tx - cx, ty - 8 - cy, kp.x - cx, kp.y - 12 - cy, false); rect(g, OUT, tx - 2 - cx, ty - 10 - cy, 5, 4); rect(g, '#6a6a72', tx - 1 - cx, ty - 9 - cy, 3, 2); }   /* the bridle to the tie */
          else { const ex = tx - px * 0, ey = ty - 0; ropeLine(g, ex - cx, ey - cy, ex - cx, ey - 8 - cy); frayEnd(g, ex - cx, ey - 8 - cy, -1); } }
        else { for (let x = b0; x <= b1; x++) planks(g, x * TS - cx, hy - cy, TS, x);
          const e0 = b0 * TS, e1 = (b1 + 1) * TS - 1;
          ropeLine(g, e0 - cx, hy + 5 - cy, e1 - cx, hy + 5 - cy, false);   /* the bridge's belly rope under the boards, sagging */
          for (const x of [e0, e1]) { rect(g, OUT, x - 1 - cx, hy - 10 - cy, 4, 10); rect(g, '#6a4a2a', x - cx, hy - 9 - cy, 2, 9); rect(g, HEMP, x - cx, hy - 5 - cy, 2, 1); rect(g, OUT, x - 2 - cx, hy - 11 - cy, 6, 2); rect(g, '#8a6a40', x - 1 - cx, hy - 11 - cy, 4, 1); }   /* the end posts */
          ropeLine(g, e0 + 2 - cx, hy - 8 - cy, e1 - 1 - cx, hy - 8 - cy, false);   /* the rope rail, sagging between the posts */
          for (let x = e0 + 12; x < e1 - 6; x += 12) { const u = (x - e0) / (e1 - e0), sg = Math.min(10, (e1 - e0) * 0.06) * Math.sin(u * Math.PI); rect(g, HEMP_D, x - cx, hy - 8 + sg - cy, 1, 8 - sg + 1); } }   /* the ties from rail to boards */
        knot(g, kp.x - cx, kp.y - cy, hot, time, d.high, s.state !== 'tied'); }
      else if (d.kind === 'counter') { const m = moverOf(d.id); if (!m) continue; const wy = d.wheelRow * TS + 8, bx = d.bag * TS + 8, dx = m.x + 16, wx = (dx + bx) / 2; if (!vis(Math.min(m.x, bx, kp.x), wy - 16, Math.max(m.x + 32, bx, kp.x), m.y0 + 16)) continue;
        const travel = m.y0 - m.y, by = wy + 12 + travel;   /* the bag goes down as far as the deck goes up */
        /* the frame: a beam across the top, a post on each side, the wheel in the middle with a guide wheel over each rope */
        const lo = Math.min(dx, bx) - 6, hi = Math.max(dx, bx) + 6;
        rect(g, OUT, lo - cx, wy - 15 - cy, hi - lo, 5); rect(g, PLANK.mid, lo + 1 - cx, wy - 14 - cy, hi - lo - 2, 3); rect(g, PLANK.top, lo + 1 - cx, wy - 14 - cy, hi - lo - 2, 1);
        for (const px0 of [dx, bx]) { rect(g, OUT, px0 - 2 - cx, wy - 11 - cy, 5, 6); rect(g, '#6a6a72', px0 - 1 - cx, wy - 10 - cy, 3, 3); }
        ropeLine(g, dx - cx, m.y - 18 - cy, dx - cx, wy - 8 - cy); ropeLine(g, bx - cx, wy - 8 - cy, bx - cx, by - 6 - cy); ropeLine(g, dx - cx, wy - 8 - cy, bx - cx, wy - 8 - cy, true);
        wheel(g, wx - cx, wy - cy, 6, travel * 0.09); wheel(g, dx - cx, wy - 6 - cy, 2.5, travel * 0.2); wheel(g, bx - cx, wy - 6 - cy, 2.5, -travel * 0.2);
        rect(g, OUT, wx - 2 - cx, wy - 10 - cy, 5, 3); rect(g, '#7a5a34', wx - 1 - cx, wy - 9 - cy, 3, 1);   /* the wheel's yoke up to the beam */
        blit(g, baked('sandbag', 20, 28, 10, 8, (g2, ax, ay) => sandbag(g2, ax, ay)), bx - cx, by - cy); blit(g, baked('deck', 44, 46, 6, 24, (g2, ax, ay) => deck(g2, { x: ax, y: ay }, 0, 0)), m.x - cx, m.y - cy);
        if (s.fray > 0) { const p = 1 - Math.min(1, s.fray / 0.8), fx = R(dx - cx), fy = R(m.y - 26 - cy); g.globalAlpha = 0.5 + 0.5 * Math.sin(time * 30); g.strokeStyle = '#ff6b6b'; g.beginPath(); g.arc(fx, fy, 10, 0, 7); g.stroke(); g.globalAlpha = 1;
          for (let i = 0; i < 2 + R(p * 5); i++) { const sd = i % 2 ? 1 : -1; rect(g, i % 3 ? HEMP : CUTFACE, fx + sd * (1 + ((i * 5 + R(time * 40)) % 5)), fy - 3 + ((i * 3 + R(time * 25)) % 7), 2, 1); } rect(g, OUT, fx - 1, fy, 3, 1 + R(p * 2)); }   /* (her beak on the deck's rope: it thins, and the fibres fly) */
        if (m.rs === 'tied') { ropeLine(g, m.x + (kp.x > m.x ? 30 : 2) - cx, m.y + 4 - cy, kp.x - cx, kp.y - 10 - cy, false); ghostRect(g, m.x - cx, m.y1 - cy, 32, 6, time); ghostArrow(g, m.x + 16 - cx, m.y - 20 - cy, m.x + 16 - cx, m.y1 + 10 - cy, time); }
        else { const sd = kp.x > m.x ? 30 : 2; ropeLine(g, m.x + sd - cx, m.y + 4 - cy, m.x + sd - cx, m.y + 12 - cy); frayEnd(g, m.x + sd - cx, m.y + 12 - cy, 1); }   /* the cut tie still hangs from the deck */
        knot(g, kp.x - cx, kp.y - cy, hot && m.rs === 'tied', time, d.high, m.rs !== 'tied'); }
      else if (d.kind === 'line') { const m = moverOf(d.id); if (!m) continue; const ax = d.a[0] * TS + 16, ay = (d.a[1] + 1) * TS - 22, bx = d.b[0] * TS + 16, by = (d.b[1] + 1) * TS - 22; if (!vis(Math.min(ax, bx) - 20, Math.min(ay, by) - 30, Math.max(ax, bx) + 20, Math.max(ay, by) + 30)) continue;
        for (const [px0, py0, sd] of [[ax, ay, 1], [bx, by, -1]]) { rect(g, OUT, px0 - cx - 2, py0 - cy - 8, 5, 30); rect(g, '#7a5a34', px0 - cx - 1, py0 - cy - 7, 3, 28); rect(g, '#9a7448', px0 - cx - 1, py0 - cy - 7, 1, 28);
          rect(g, OUT, px0 - cx - 5, py0 - cy - 10, 11, 4); rect(g, PLANK.top, px0 - cx - 4, py0 - cy - 9, 9, 1); rect(g, PLANK.mid, px0 - cx - 4, py0 - cy - 8, 9, 1);   /* the cap */
          rect(g, OUT, px0 - cx + sd * 3 - 1, py0 - cy - 4, 3, 11); rect(g, '#6a6a72', px0 - cx + sd * 3, py0 - cy - 3, 1, 9);   /* the stop block on the post */
          rect(g, HEMP_D, px0 - cx - 2, py0 - cy + 14, 5, 2); rect(g, HEMP, px0 - cx - 2, py0 - cy + 17, 5, 1); }   /* a lashing round each post */
        ropeLine(g, ax - cx, ay - cy, bx - cx, by - cy); ropeLine(g, ax - cx, ay - cy + 1, bx - cx, by - cy + 1);   /* the line itself: two strands laid together, taut */
        const sx = m.x + 16, sy = m.y - 22, rolling = m.rs === 'run';   /* THE TROLLEY: two wheels on the line, a plate, a ring, and the hanger ropes to the seat */
        for (const wo of [-3, 3]) { rect(g, OUT, sx + wo - 2 - cx, sy - cy - 4, 5, 5); rect(g, '#9a9aa2', sx + wo - 1 - cx, sy - cy - 3, 3, 3); rect(g, OUT, sx + wo - cx, sy - cy - 2, 1, 1); }
        rect(g, OUT, sx - 5 - cx, sy - cy + 0, 11, 5); rect(g, '#5a5a62', sx - 4 - cx, sy - cy + 1, 9, 3); rect(g, '#8a8a92', sx - 4 - cx, sy - cy + 1, 9, 1); rect(g, GOLD_D, sx - 1 - cx, sy - cy + 2, 3, 1);
        ropeLine(g, sx - 3 - cx, sy - cy + 4, m.x + 2 - cx, m.y - cy); ropeLine(g, sx + 3 - cx, sy - cy + 4, m.x + 30 - cx, m.y - cy);
        if (rolling) for (let i = 0; i < 3; i++) { g.globalAlpha = 0.8 - i * 0.25; rect(g, i ? '#ffd36b' : '#fff6c8', sx - 8 - i * 4 - cx, sy - cy - 2 + ((i * 7 + R(time * 30)) % 3), 2, 1); } g.globalAlpha = 1;   /* sparks off the line */
        rect(g, OUT, m.x - cx - 1, m.y - cy + 5, 34, 2); rect(g, '#4a3218', m.x - cx, m.y - cy + 5, 32, 1);   /* the seat's beam */
        planks(g, R(m.x - cx), R(m.y - cy), 32, 0);
        rect(g, OUT, m.x - cx - 1, m.y - cy - 4, 3, 5); rect(g, PLANK.mid, m.x - cx, m.y - cy - 3, 1, 4); rect(g, OUT, m.x - cx + 30, m.y - cy - 4, 3, 5); rect(g, PLANK.mid, m.x - cx + 31, m.y - cy - 3, 1, 4);   /* the seat's end posts */
        if (m.rs === 'tied') { ropeLine(g, m.x + 2 - cx, m.y + 3 - cy, kp.x - cx, kp.y - 10 - cy, false); ghostRect(g, d.b[0] * TS - cx, (d.b[1] + 1) * TS - cy, 32, 6, time); ghostArrow(g, ax + (bx - ax) * 0.15 - cx, ay + (by - ay) * 0.15 + 14 - cy, bx - (bx - ax) * 0.1 - cx, by - (by - ay) * 0.1 + 14 - cy, time); }
        else { ropeLine(g, m.x + 2 - cx, m.y + 3 - cy, m.x + 2 - cx, m.y + 11 - cy); frayEnd(g, m.x + 2 - cx, m.y + 11 - cy, 1); }
        knot(g, kp.x - cx, kp.y - cy, hot && m.rs === 'tied', time, d.high, m.rs !== 'tied'); }
      else if (d.kind === 'perch' || d.kind === 'ledge') { const x0 = d.x0 * TS, x1 = (d.x1 + 1) * TS, top = d.top * TS + 4; if (!vis(x0 - 20, top, x1 + 20, d.floor * TS + 10)) continue;
        const y = s.state === 'tied' ? d.row * TS : s.y, cut = s.state === 'fall' || s.state === 'down', sw = s.state === 'tied' ? Math.sin(time * 1.1 + d.x0) * 0.5 : 0;
        for (const rx of [x0 + 3, x1 - 4]) { rect(g, OUT, rx - 3 - cx, top - 3 - cy, 7, 4); rect(g, '#6a6a72', rx - 2 - cx, top - 2 - cy, 5, 2);   /* the iron eye each rope hangs from */
          if (!cut) { ropeLine(g, rx - cx, top - cy, rx + sw - cx, y - cy); rect(g, OUT, rx - 2 + sw - cx, y - 3 - cy, 5, 5); rect(g, HEMP, rx - 1 + sw - cx, y - 2 - cy, 3, 1); rect(g, HEMP_D, rx - 1 + sw - cx, y - cy, 3, 1); }   /* (the lashing round the plank) */
          else { ropeLine(g, rx - cx, top - cy, rx - cx, top + 14 - cy); frayEnd(g, rx - cx, top + 14 - cy, 1);   /* the stub that stays on the eye */
            const py = y - (s.state === 'down' ? 5 : 0); ropeLine(g, rx - cx, py - 8 - cy, rx - cx, py - cy); frayEnd(g, rx - cx, py - 8 - cy, -1); } }   /* and the stub that fell with the plank */
        if (s.state !== 'tied') planks(g, x0 - cx, y - cy - (s.state === 'down' ? 5 : 0), x1 - x0, d.x0);
        if (kp) { const k = s.state === 'tied'; if (k) ropeLine(g, x1 - 4 - cx, top - cy, kp.x - cx, kp.y - 12 - cy, false); knot(g, kp.x - cx, kp.y - cy, hot, time, false, !k);
          if (k && ctx.owlOn && ctx.owlOn(d.k)) { g.globalAlpha = 0.5 + 0.3 * Math.sin(time * 10); ghostArrow(g, (x0 + x1) / 2 - cx, y + 8 - cy, (x0 + x1) / 2 - cx, d.floor * TS - 6 - cy, time); g.globalAlpha = 1; } }
        if (s.fray > 0) { const p = 1 - Math.min(1, s.fray / 0.8), fx = R((x0 + x1) / 2 - cx), fy = R(y - 12 - cy); g.globalAlpha = 0.5 + 0.5 * Math.sin(time * 30); g.strokeStyle = '#ff6b6b'; g.beginPath(); g.arc(fx, fy, 10, 0, 7); g.stroke(); g.globalAlpha = 1;
          for (const rx of [x0 + 3, x1 - 4]) { const gx = rx - cx, gy = y - 20 - cy;   /* (her beak on it: the rope thins, the fibres fly, the nick goes in) */
            for (let i = 0; i < 2 + R(p * 4); i++) { const sd = i % 2 ? 1 : -1; rect(g, i % 3 ? HEMP : CUTFACE, gx + sd * (1 + ((i * 5 + R(time * 40)) % 5)), gy - 2 + ((i * 3 + R(time * 25)) % 7), 2, 1); }
            rect(g, OUT, gx - 1, gy + 2, 3, 1 + R(p * 2)); rect(g, '#ff6b6b', gx - 1, gy - 6 + R(Math.sin(time * 40) * 1), 3, 2); } } }
    }
  };
  return H;
}
