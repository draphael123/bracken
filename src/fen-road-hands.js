// src/fen-road-hands.js - THE FEN ROAD's HANDS (claude/fenroad). src/fen-road.js lays the road; this works it:
//   THE BOWED SECTIONS (ents 'sag'): a hero's weight bows one (a creak, the boards drawn bending, a shiver at the end); held past its hold it GOES UNDER
//     (its cells are air for SAG.under s, then it floats back). A goblin is too light to bow it. Its LASHING (ents 'lashing', a post at its near end):
//     a hero's blow on the post parts it and the section goes at once - with whoever stands on it, and with any LOAD stacked on it (the crew's
//     barricade: gone for good). The rotten sections of THE TROLL'S CROSSING are the same machine (arena: a longer hold; the troll collapses them:
//     collapse(), and his phase two RIPS stretches of the road away: rip()).
//   THE CREW GAPS (ents 'crewgap'): open water in the road with piles in it; the crew's layer on the far bank lays the road plank by plank toward you
//     while you are near and he is alive and on his feet.
//   SOMETHING UNDER THE ROAD (ent 'undertow'): bubbles under the boards, then an arm out of the water takes the crewman there under (the troll, B8).
//   THE FOOTING: a fall into the fen's water hands you back to the last SOUND board you stood on (main.js keeps P.safe only off the water), never a
//     bowed or laid one, never a ripped one.
//   THE HORIZON: the Stockade's palisade grows on the skyline the further east you are, and its gate stands at the crossing's east wall; war horns
//     sound far off from the Palisade Road on.
// GREYBOX ART (readable; the art lane draws it - see the lane report's ART NOTES). main.js calls: reset, on, update, strike, drawSky, drawWorld, read,
// and the troll's hands call sectionAt, collapse, rip, fixSafe.
export const SAG = { bow: 0.5, hold: 1.1, holdArena: 3.6, under: 3.2, regrow: 14, rise: 0.6, droop: 4 };
export const CREW = { every: 0.85, near: 260 };
export const UNDERTOW = { near: 150, bubble: 1.4, arm: 1.0 };
export const FR_SAY = { creak: 'THE BOARDS BOW: KEEP MOVING', under: 'IT GOES UNDER', cut: 'THE LASHING PARTS', barricade: 'THE BARRICADE GOES UNDER', crew: 'THE CREW LAYS THE ROAD', undertow: 'SOMETHING LIVES UNDER THE ROAD' };
export const FR_HINT = 'A BOWED SECTION GOES UNDER WITH WHOEVER STANDS ON IT. STRIKE ITS LASHING AND IT GOES AT ONCE.';
const R = Math.round;

export function makeFenRoadHands(ctx) {
  const H = {}; let S = null;
  const L = () => ctx.L;
  H.on = () => !!(L() && L().fenroad && S);
  H.reset = () => {
    const lv = L(); S = null; if (!lv || !lv.fenroad) return; const TS = ctx.TS;
    const sags = new Map(), lashes = [], gaps = [], tows = [];
    for (const e of lv.ents) {
      if (e.t === 'sag') sags.set(e.id, { id: e.id, x0: e.x, w: e.w, row: e.y, hold: e.arena ? SAG.holdArena : (e.hold || SAG.hold), arena: !!e.arena, load: e.load || [], loadGone: false, st: 'up', t: 0, vis: 1, told: false });
      else if (e.t === 'lashing') lashes.push({ x: e.x, row: e.y + 1, sag: e.sag, cut: false });
      else if (e.t === 'crewgap') gaps.push({ id: e.id, x0: e.x, w: e.w, dir: e.dir || -1, piles: e.piles || [], laid: 0, t: CREW.every, done: false, layerAt: null, layer: null });
      else if (e.t === 'undertow') tows.push({ x: e.x * TS + 8, st: 'wait', t: 0 });
    }
    for (const g of gaps) { const lay = lv.ents.find(q => q.layer === g.id); if (lay) g.layerAt = { x: lay.x * TS + 8, y: (lay.y + 1) * TS }; }
    const cells = new Set(); for (const [x, y] of lv.sagCells || []) cells.add(y * lv.W + x);
    S = { sags, lashes, gaps, tows, cells, ripped: new Set(), told: {}, hornT: 6, n: { sunk: 0, cut: 0, laid: 0, collapsed: 0, ripped: 0, barricade: 0, undertow: 0 } };
  };
  const cellsOf = s => { const out = []; for (let x = s.x0; x < s.x0 + s.w; x++) out.push([x, s.row]); return out; };
  const setCells = (s, t) => { for (const [x, y] of cellsOf(s)) ctx.cellSet(x, y, t); };
  const say = (x, y, k, col = '#ffd36b') => ctx.number(x, y, FR_SAY[k], col);
  /* ONE BODY ON A SECTION: its feet on the section's row and inside its columns */
  const standsOn = (pp, s) => { if (!pp || pp.dead || !pp.ground || pp.onMover) return false; const TS = ctx.TS; if (Math.floor((pp.y + 1) / TS) !== s.row) return false;
    return pp.x + 3 > s.x0 * TS && pp.x - 3 < (s.x0 + s.w) * TS; };
  const splash = (s, n = 14) => { const TS = ctx.TS; for (let x = s.x0; x < s.x0 + s.w; x++) ctx.burst(x * TS + 8, (s.row + 1) * TS, Math.ceil(n / s.w), ['#9fb3a6', '#e6efe6', '#3e2c1c'], 80, 0.5); };
  /* A SECTION GOES UNDER: its boards are air, and what stood on it falls (a load stacked on it goes for good) */
  function sink(s, why) {
    if (s.st === 'under' || s.st === 'gone') return; const TS = ctx.TS, lv = L();
    /* the TROLL bursts up through the middle of a rotten section: the boards round him give way, the ones at its ends hang on (the wreck you strike him from) */
    if (why === 'troll' && s.w >= 4) { s.hole = [s.x0 + 1, s.x0 + s.w - 2]; for (let x = s.hole[0]; x <= s.hole[1]; x++) ctx.cellSet(x, s.row, ctx.T.AIR); } else { s.hole = [s.x0, s.x0 + s.w - 1]; setCells(s, ctx.T.AIR); }
    s.st = why === 'troll' ? 'gone' : 'under'; s.t = why === 'troll' ? SAG.regrow : SAG.under; S.n.sunk++;
    if (s.load.length && !s.loadGone) { s.loadGone = true; for (const [x, y] of s.load) ctx.cellSet(x, y, ctx.T.AIR); S.n.barricade++; ctx.burst((s.x0 + s.w / 2) * TS, (s.row - 2) * TS, 24, ['#8a6a40', '#b08a5a', '#3e2c1c'], 110, 0.7); say((s.x0 + s.w / 2) * TS, (s.row - 5) * TS, 'barricade'); }
    for (const pp of ctx.players()) if (standsOn(pp, s) || (pp.x + 3 > s.x0 * TS && pp.x - 3 < (s.x0 + s.w) * TS && Math.abs(pp.y - s.row * TS) < 3)) { pp.ground = false; pp.vy = Math.max(pp.vy || 0, 40); }
    splash(s); snd('sink'); if (why !== 'troll' && !S.told.under) { S.told.under = 1; say((s.x0 + s.w / 2) * TS, (s.row - 3) * TS, 'under'); }
    for (const l of S.lashes) if (l.sag === s.id) l.cut = true; void lv;
  }
  const snd = k => { const f = ctx.sfx; try { if (k === 'creak') (f.creak || f.crack || f.thud)(); else if (k === 'sink') { (f.splash || f.thud)(); (f.crack || f.thud)(); } else if (k === 'cut') { (f.crack || f.thud)(); (f.clank || f.thud)(); } else if (k === 'lay') (f.stone || f.thud)(); else if (k === 'rise') (f.puff || f.thud)(); else if (k === 'gurgle') (f.splash || f.puff || f.thud)(); else if (k === 'grab') { (f.splash || f.thud)(); (f.boreRoar || f.roar || f.thud)(); } else if (k === 'horn') (f.farHorn || f.hornDraw || (() => {}))(); } catch {} };
  H.update = dt => {
    if (!H.on()) return; const lv = L(), TS = ctx.TS, T = ctx.T, players = ctx.players();
    /* THE BOWED SECTIONS */
    for (const s of S.sags.values()) {
      if (s.st === 'up' || s.st === 'bow') {
        const w = players.some(pp => standsOn(pp, s));
        if (w) { if (s.st === 'up') { s.st = 'bow'; s.t = 0; snd('creak'); if (!S.told.creak) { S.told.creak = 1; say((s.x0 + s.w / 2) * TS, (s.row - 3) * TS, 'creak'); if (ctx.hint) ctx.hint(FR_HINT); } }
          s.t += dt; if (Math.random() < dt * 5) ctx.burst((s.x0 + Math.random() * s.w) * TS, (s.row + 1) * TS, 1, ['#9fb3a6'], 20, 0.3);
          if (s.t > s.hold * 0.6 && Math.random() < dt * 3) snd('creak');
          if (s.t >= s.hold) sink(s, 'weight'); }
        else if (s.st === 'bow') { s.t -= dt * 0.8; if (s.t <= 0) { s.st = 'up'; s.t = 0; } }
      } else if (s.st === 'under' || s.st === 'gone') {
        s.t -= dt; if (s.t > 0) continue;
        /* it floats back only where no hero is in its row (never up through a body) */
        const blocked = players.some(pp => !pp.dead && pp.x + 4 > s.x0 * TS && pp.x - 4 < (s.x0 + s.w) * TS && pp.y > s.row * TS && pp.y - 14 < (s.row + 1) * TS);
        if (blocked) { s.t = 0.2; continue; }
        if (cellsOf(s).some(([x]) => S.ripped.has(x))) { s.t = 1e9; continue; }
        setCells(s, T.PLANK); s.st = 'up'; s.t = 0; s.vis = 0; snd('rise');
        for (const l of S.lashes) if (l.sag === s.id) l.cut = false;
      }
      if (s.vis < 1) s.vis = Math.min(1, s.vis + dt / SAG.rise);
    }
    /* THE CREW GAPS: the layer lays the road toward you */
    for (const g of S.gaps) {
      if (g.done) continue;
      if (!g.layer && g.layerAt) { let best = null, bd = 64; for (const e of ctx.enemies()) { if (!e.alive || e.boss) continue; const d = Math.hypot(e.x - g.layerAt.x, e.y - g.layerAt.y); if (d < bd) { bd = d; best = e; } } if (best) g.layer = best; }
      const mid = (g.x0 + g.w / 2) * TS, near = players.some(pp => !pp.dead && Math.abs(pp.x - mid) < CREW.near);
      const working = g.layer && g.layer.alive && !(g.layer.stagger > 0) && !(g.layer.broken > 0);
      if (!near || !working) continue;
      g.t -= dt; if (g.t > 0) continue; g.t = CREW.every;
      const cols = []; for (let i = 0; i < g.w; i++) { const x = g.dir < 0 ? g.x0 + g.w - 1 - i : g.x0 + i; if (!g.piles.includes(x)) cols.push(x); }
      const x = cols[g.laid]; if (x === undefined) { g.done = true; continue; }
      if (ctx.tileAt(x, 18) === T.AIR) ctx.cellSet(x, 18, T.PLANK); g.laid++; S.n.laid++; snd('lay'); ctx.dust(x * TS + 8, 18 * TS, 3);
      if (!S.told.crew) { S.told.crew = 1; say(x * TS + 8, 15 * TS, 'crew'); }
      if (g.laid >= cols.length) g.done = true;
    }
    /* SOMETHING UNDER THE ROAD */
    for (const u of S.tows) {
      if (u.st === 'done') continue;
      if (u.st === 'wait') { if (players.some(pp => !pp.dead && pp.x > u.x - UNDERTOW.near - 40 && pp.x < u.x + 40)) { u.st = 'bubble'; u.t = UNDERTOW.bubble; snd('gurgle'); } continue; }
      u.t -= dt;
      if (u.st === 'bubble' && u.t <= 0) { u.st = 'arm'; u.t = UNDERTOW.arm; snd('grab'); ctx.shake(4); S.n.undertow++;
        let v = null, bd = 56; for (const e of ctx.enemies()) { if (!e.alive || e.boss || e.elite) continue; const d = Math.abs(e.x - u.x); if (d < bd && Math.abs(e.y - 18 * TS) < 20) { bd = d; v = e; } }
        if (v) { u.victim = { x: v.x }; v.y = 21 * TS; v.vy = 0; v.x = u.x; }   /* (into the fen: main.js hazardFoe drowns it, no blow of yours) */
        ctx.burst(u.x, 19 * TS, 22, ['#9fb3a6', '#e6efe6', '#3e2c1c', '#4a5a3a'], 120, 0.7); say(u.x, 14 * TS, 'undertow', '#ff9a5c'); }
      else if (u.st === 'arm' && u.t <= 0) u.st = 'done';
    }
    /* THE FOOTING: a sound board you stood on is where the water hands you back */
    for (const pp of players) { if (pp.dead || !pp.ground || pp.onMover) continue; const tx = Math.floor(pp.x / TS), ty = Math.floor((pp.y + 1) / TS), t = ctx.tileAt(tx, ty);
      if ((t === T.PLANK || ctx.solidAt(tx, ty)) && !S.cells.has(ty * lv.W + tx) && !S.ripped.has(tx)) pp.safe = { x: pp.x, y: pp.y, L: lv }; }
    /* THE STOCKADE'S HORNS, far off, from the Palisade Road on */
    if (players[0] && players[0].x > 311 * TS) { S.hornT -= dt; if (S.hornT <= 0) { S.hornT = 10 + Math.random() * 7; snd('horn'); } }
  };
  /* A HERO'S BLOW (main.js attackBox): on a lashing's post, it parts */
  H.strike = hb => { if (!H.on() || !hb) return; const TS = ctx.TS;
    for (const l of S.lashes) { if (l.cut) continue; const s = S.sags.get(l.sag); if (!s || s.st === 'under' || s.st === 'gone') continue;
      const bx = { l: l.x * TS + 3, r: l.x * TS + 13, t: l.row * TS - 18, b: l.row * TS };
      if (hb.l < bx.r && hb.r > bx.l && hb.t < bx.b && hb.b > bx.t) { l.cut = true; S.n.cut++; snd('cut'); say(l.x * TS + 8, (l.row - 2) * TS, 'cut'); ctx.burst(l.x * TS + 8, l.row * TS - 10, 8, ['#c9b27c', '#8a6a40'], 70, 0.4); sink(s, 'lashing'); } } };
  /* THE TROLL'S HANDS: the rotten section under x (px), collapse it, rip stretches of the road, and put a hero's footing back on sound boards */
  H.sectionAt = (x, arenaOnly = true) => { if (!S) return null; const TS = ctx.TS; for (const s of S.sags.values()) if ((!arenaOnly || s.arena) && x >= s.x0 * TS - 2 && x < (s.x0 + s.w) * TS + 2) return s; return null; };
  H.sections = () => (S ? [...S.sags.values()].filter(s => s.arena) : []);
  H.collapse = s => { if (!s || s.st === 'under' || s.st === 'gone') return false; sink(s, 'troll'); S.n.collapsed++; return true; };
  H.rip = ranges => { if (!S) return; const TS = ctx.TS, T = ctx.T;
    for (const [a, b] of ranges) for (let x = a; x <= b; x++) { S.ripped.add(x); ctx.cellSet(x, 18, T.AIR); ctx.burst(x * TS + 8, 18 * TS, 4, ['#8a6a40', '#b08a5a', '#3e2c1c', '#9fb3a6'], 120, 0.7); }
    S.n.ripped++; for (const pp of ctx.players()) H.fixSafe(pp); };
  H.ripped = x => !!(S && S.ripped.has(x));
  H.fixSafe = pp => { if (!S || !pp || !pp.safe) return; const TS = ctx.TS, tx = Math.floor(pp.safe.x / TS); if (!S.ripped.has(tx) && !S.cells.has(Math.floor((pp.safe.y + 1) / TS) * L().W + tx)) return;
    for (let d = 1; d < 30; d++) for (const s of [-1, 1]) { const x = tx + s * d; if (!S.ripped.has(x) && !S.cells.has(18 * L().W + x) && (ctx.tileAt(x, 18) === ctx.T.PLANK || ctx.solidAt(x, 18))) { pp.safe = { x: x * TS + 8, y: 18 * TS, L: L() }; return; } } };
  H.read = () => S && { sags: [...S.sags.values()].map(s => ({ id: s.id, st: s.st, t: +s.t.toFixed(2), arena: s.arena, loadGone: s.loadGone })), lashes: S.lashes.map(l => ({ x: l.x, sag: l.sag, cut: l.cut })), gaps: S.gaps.map(g => ({ id: g.id, laid: g.laid, done: g.done, layer: !!g.layer })), tows: S.tows.map(u => u.st), ripped: [...S.ripped], n: { ...S.n } };
  H.sag = id => S && S.sags.get(id);

  /* ---------- DRAWING (greybox: the art lane draws it) ---------- */
  const rect = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
  /* THE SKYLINE: the Stockade's palisade grows the further east you are (behind everything; a parallax band at the horizon) */
  H.drawSky = (g, cx, cy, VW, VH, time) => {
    if (!H.on()) return; const lv = L(), TS = ctx.TS, k = Math.max(0, Math.min(1, cx / ((lv.W - 40) * TS)));
    const base = R(VH * 0.62 - k * 18), w = R(90 + k * 260), x0 = R(VW * (0.9 - 0.35 * k) - w / 2), sh = R(5 + k * 22);
    g.globalAlpha = 0.35 + 0.35 * k; g.fillStyle = '#2a2a2a';
    for (let x = 0; x < w; x += 4) { const hh = sh + ((x * 7) % 5); g.fillRect(x0 + x, base - hh, 3, hh); g.fillRect(x0 + x + 1, base - hh - 1, 1, 1); }
    rect(g, x0, base - 2, w, 3, '#2a2a2a');
    for (const f of [0.18, 0.78]) { const tx = x0 + R(w * f), th = sh + 10 + R(k * 10); rect(g, tx - 4, base - th, 9, th, '#262626'); rect(g, tx - 6, base - th - 3, 13, 3, '#262626');
      rect(g, tx, base - th - 9, 1, 6, '#3a3a3a'); rect(g, tx + 1, base - th - 9, 4, 3, (Math.floor(time * 2 + f * 10) % 2) ? '#8f2f28' : '#a8443a'); }
    g.globalAlpha = 1;
  };
  H.drawWorld = (g, cx, cy, time) => {
    if (!H.on()) return; const lv = L(), TS = ctx.TS, X = v => R(v - cx), Y = v => R(v - cy);
    /* THE LASHINGS: a post, a coil, and the rope to the section's near board; a glint while a body stands on its section (cut NOW) */
    for (const l of S.lashes) { const x = X(l.x * TS + 8); if (x < -40 || x > ctx.VW() + 40) continue; const yb = Y(l.row * TS), s = S.sags.get(l.sag);
      rect(g, x - 2, yb - 16, 4, 16, '#4a3420'); rect(g, x - 1, yb - 16, 1, 16, '#6a4c30');
      if (!l.cut && s) { rect(g, x - 3, yb - 11, 6, 2, '#c9b27c'); rect(g, x - 3, yb - 8, 6, 2, '#a8925c');
        const ex = X(s.x0 * TS + 1), ey = Y(s.row * TS + 2); g.strokeStyle = '#c9b27c'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 2, yb - 9); g.lineTo(ex, ey); g.stroke();
        const loaded = ctx.enemies().some(e => e.alive && !e.boss && standsOnFoe(e, s)) || s.load.length && !s.loadGone;
        if (loaded && Math.floor(time * 6) % 2) { rect(g, x - 1, yb - 20, 3, 3, '#ffd36b'); rect(g, x, yb - 22, 1, 7, '#fff6e0'); } }
      else { rect(g, x + 2, yb - 10, 2, 1, '#c9b27c'); rect(g, x + 3, yb - 9, 1, 2, '#a8925c'); } }
    /* THE BOWED SECTIONS: rotten boards that bend under weight, shiver at the end, go under, and float back */
    for (const s of S.sags.values()) { const x0 = X(s.x0 * TS); if (x0 > ctx.VW() + 20 || x0 + s.w * TS < -20) continue; const y = Y(s.row * TS);
      const up = s.st === 'up' || s.st === 'bow', b = s.st === 'bow' ? Math.min(1, s.t / SAG.bow) : 0, shiver = s.st === 'bow' && s.t > s.hold * 0.7 ? (Math.floor(time * 30) % 2) : 0;
      for (let i = 0; i < s.w; i++) { const wreck = s.st === 'gone' && s.hole && (s.x0 + i < s.hole[0] || s.x0 + i > s.hole[1]), u = (i + 0.5) / s.w * 2 - 1, off = up ? b * SAG.droop * (1 - u * u) + shiver : wreck ? 3 + (i ? 1 : 0) : 0, yy = up || wreck ? y + off + (up ? (1 - s.vis) * 8 : 0) : Y(19 * TS + 3);
        g.globalAlpha = up || wreck ? 1 : 0.4; rect(g, x0 + i * TS, yy, TS - 1, 5, s.arena ? '#5a4030' : '#6a5038'); rect(g, x0 + i * TS, yy + 5, TS - 1, 2, '#3a2818');
        rect(g, x0 + i * TS + 3 + (i % 3), yy + 1, 4, 1, '#3e2c1c'); if (s.arena) rect(g, x0 + i * TS + 9, yy + 2, 3, 2, '#2e3a22'); }
      g.globalAlpha = 1;
      if (up) { rect(g, x0 - 1, y - 1, 2, 8, '#c9b27c'); rect(g, x0 + s.w * TS - 1, y - 1, 2, 8, '#c9b27c'); }   /* the lashing round each end */
      /* ITS LOAD (the crew's barricade): road-planks stacked on end, roped; and its foot in the section's own row */
      for (const [lx, ly] of [...s.load, ...s.load.filter(([, q]) => q === s.row - 1).map(([q]) => [q, s.row])]) { if (!ctx.solidAt(lx, ly)) continue; const bx = X(lx * TS), by = Y(ly * TS);
        rect(g, bx, by, TS, TS, '#7a5a38'); for (let k = 0; k < 4; k++) rect(g, bx + k * 4, by, 1, TS, '#4a3420'); rect(g, bx, by + 6, TS, 2, '#c9b27c'); }
    }
    /* THE CREW GAPS: the boards the crew has laid (fresh-cut) */
    for (const gp of S.gaps) for (let i = 0; i < gp.w; i++) { const x = gp.x0 + i; if (ctx.tileAt(x, 18) !== ctx.T.PLANK) continue; const sx = X(x * TS); if (sx < -20 || sx > ctx.VW() + 20) continue;
      rect(g, sx, Y(18 * TS), TS - 1, 5, '#b08a5a'); rect(g, sx, Y(18 * TS) + 5, TS - 1, 2, '#6a4c30'); rect(g, sx + 2, Y(18 * TS) + 2, 1, 1, '#3a2818'); rect(g, sx + 12, Y(18 * TS) + 2, 1, 1, '#3a2818'); }
    /* SOMETHING UNDER THE ROAD: the bubbles, then the arm */
    for (const u of S.tows) { const x = X(u.x), y = Y(19 * TS); if (x < -60 || x > ctx.VW() + 60) continue;
      if (u.st === 'bubble') for (let i = 0; i < 4; i++) { const q = (time * 3 + i * 0.37) % 1; g.globalAlpha = 1 - q; rect(g, x - 10 + i * 6, y - q * 8, 2, 2, '#cfe0d0'); g.globalAlpha = 1; }
      if (u.st === 'arm') { const k = Math.sin(Math.min(1, 1 - u.t / UNDERTOW.arm) * Math.PI); drawArm(g, x, y, k, time); } }
    /* THE STOCKADE'S GATE at the crossing's east wall: stakes, a shut gate, a horn tower */
    { const gx = X(ARENA_GATE_X * TS); if (gx > -80 && gx < ctx.VW() + 80) { const yb = Y(18 * TS);
      for (let i = -3; i < 4; i++) { const hh = 70 + ((i * 13) & 7); rect(g, gx + i * 7, yb - hh, 6, hh, '#5a4630'); rect(g, gx + i * 7 + 1, yb - hh - 3, 4, 3, '#4a3826'); rect(g, gx + i * 7, yb - hh + 12, 6, 2, '#c9b27c'); }
      rect(g, gx - 14, yb - 44, 28, 44, '#3e2c1c'); rect(g, gx - 12, yb - 42, 24, 2, '#6a4c30'); rect(g, gx - 1, yb - 44, 2, 44, '#2a1c10');
      rect(g, gx - 22, yb - 96, 12, 26, '#4a3826'); rect(g, gx - 24, yb - 99, 16, 3, '#3a2818'); rect(g, gx - 18, yb - 108, 1, 9, '#2a1c10'); rect(g, gx - 17, yb - 108, 6, 4, '#8f2f28'); } }
  };
  const standsOnFoe = (e, s) => { const TS = ctx.TS; return Math.floor((e.y + 1) / TS) === s.row && e.x + 3 > s.x0 * TS && e.x - 3 < (s.x0 + s.w) * TS; };
  /* the troll's arm out of the fen (greybox): a grey-green forearm, a hand of four fingers, weed */
  function drawArm(g, x, y, k, time) { const h = R(10 + k * 30);
    rect(g, x - 5, y - h, 10, h, '#5a6a4a'); rect(g, x - 5, y - h, 2, h, '#7a8a62'); rect(g, x - 8, y - h - 6, 16, 7, '#5a6a4a');
    for (let i = 0; i < 4; i++) rect(g, x - 8 + i * 4, y - h - 10 + (i === 0 ? 3 : 0), 3, 5, '#4a5a3a'); rect(g, x - 4, y - h + 4, 2, 9, '#2e4a22'); rect(g, x + 2, y - h + 8, 2, 6, '#2e4a22'); void time; }
  H.drawArm = drawArm;
  return H;
}
const ARENA_GATE_X = 451;
