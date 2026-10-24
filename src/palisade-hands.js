// src/palisade-hands.js - THE PALISADE WOOD: the level's rule and machines (claude/palisadewood, the OPUS GREYBOX, 2026-10-24; brief scratch/brief-palisadewood-1015.md).
// src/palisade-wood.js builds the level; this binds it to the game. main.js owns the world and calls:
//   reset (spawnEntities), update, strike (a blow's box), setterStep (a stake-setter's frame), props (the guide's), drawSky (THE PALISADE LINE + THE HALF-BUILT GATEHOUSE),
//   drawWorld (props, loads, ghosts, stake walls, harvest, the area banner), read / hoist (tools, the pilot bot).
// THE RULE (L.rule): THE WALL IS STILL GOING UP: KNOCK OUT A PROP AND WHAT IT HOLDS COMES DOWN.
//   A PROP (L.hoists, the Rootway's data shape): a timber shore, a WEDGE at its foot, a rope lashing, strain marks - it glints while it holds. ANY BLOW on it knocks the
//   wedge out and what it holds COMES DOWN. What it will do is DRAWN FIRST (the trebuchet test): a dotted ghost of the ramp / bridge where it will land, a dotted
//   plumb line under a walkway or a stake stack, and the road a stack will roll.
//     ramp     the scaffold section folds down: its steps are laid (solid or boards) and STAY
//     tower / bridge   it topples across its gap: one-way cells, they STAY
//     crew     the walkway's boards go; the crew on it fall (hurt); the timber comes down on whoever stands under it (crushed)
//     stakes   the stack drops (crushes what is under it) then ROLLS (`roll` +1/-1) through every foe on the road until a wall or `rollMax` tiles
// THE STAKE-SETTER (a foe with e.pwSetter, the level's ONE new foe): when you come within his reach on his floor he hammers a WALL OF STAKES (two rows of solid cells,
//   told: a '!' and his mallet raised SETTER.tell s) into the ground between you. It is knocked down by SETTER.wallHits blows (or falls on its own after SETTER.wallLife s),
//   and a hero can JUMP it (two rows). He plants one wall at a time, never into a hero, never in a gap.
// Every capital line it says goes through ctx.number with a line listed here (PW_SAY) and in src/hint-lines.js.
export const PROPS = { g: 900, vmax: 520, crush: 30, crewFall: 26, debrisDmg: 12, stakeW: 3, stakeH: 12, stakeV: 150, stakeDmg: 26, stakeHero: 14, stakeMax: 40 };
export const SETTER = { reach: 7, tell: 0.7, cd: 3.2, wallHits: 2, wallLife: 12, rows: 2 };
export const PW_SAY = {
  knock: 'THE PROP GOES: IT COMES DOWN', ramp: 'THE SCAFFOLD FOLDS: A RAMP', bridge: 'IT FALLS ACROSS: A BRIDGE', crew: 'THE CREW COMES DOWN', crushed: 'CRUSHED UNDER IT',
  rolls: 'THE STAKES ROLL', split: 'THE STAKES SCATTER', stakeHit: 'THE STAKES RUN YOU DOWN', debris: 'THE TIMBER COMES DOWN ON YOU',
  plant: 'HE PLANTS A STAKE WALL', wallDown: 'THE STAKE WALL GOES DOWN',
};

const hash = k => { let h = 5381; for (let i = 0; i < k.length; i++) h = (Math.imul(h, 33) + k.charCodeAt(i)) >>> 0; return h; };
/* the cells a prop lays when it comes down: [x, y, 'S'|'O'] (a ramp's solid step fills from its row down to the first solid cell, at most 8) - also read by src/reachcore.js */
export function propCells(d, solidAt) {
  const out = [];
  if (d.load === 'tower' || d.load === 'bridge') for (let x = d.span[0]; x <= d.span[1]; x++) out.push([x, d.span[2], 'O']);
  if (d.load === 'ramp') for (const [x0, x1, row, k] of d.steps) for (let x = x0; x <= x1; x++) { if (k === 'O') { out.push([x, row, 'O']); continue; }
    for (let y = row, n = 0; n < 8 && !(solidAt && solidAt(x, y)); y++, n++) out.push([x, y, 'S']); }
  return out;
}
export function makePalisadeHands(ctx) {
  const TS = ctx.TS, H = {};
  const L = () => ctx.L;
  let S = null;
  H.on = () => !!(L() && L().pwood);
  const say = (x, y, k, col = '#ffd36b') => ctx.number(x, y, PW_SAY[k], col);
  const once = k => { if (S.said.has(k)) return false; S.said.add(k); return true; };
  const propBox = d => ({ l: d.cleat[0] * TS - 2, r: d.cleat[0] * TS + 18, t: (d.cleat[1] - 2) * TS, b: (d.cleat[1] + 1) * TS });
  const standAt = (tx, ty) => ctx.solidAt(tx, ty) || ctx.tileAt(tx, ty) === ctx.T.ONEWAY || ctx.tileAt(tx, ty) === ctx.T.PLANK;
  const layCells = d => { for (const [x, y, k] of propCells(d, (x, y) => ctx.solidAt(x, y))) ctx.cellSet(x, y, k === 'S' ? ctx.T.SOLID : ctx.T.ONEWAY); };
  const walkCells = (d, on) => { const [x0, x1, row] = d.walk; for (let x = x0; x <= x1; x++) ctx.cellSet(x, row, on ? ctx.T.ONEWAY : ctx.T.AIR); };
  const stays = d => d.load === 'ramp' || d.load === 'tower' || d.load === 'bridge';

  /* ---------- RESET (every load and every respawn) ---------- */
  H.reset = () => {
    const lv = L(); if (!lv || !lv.pwood) { S = null; return; }
    const keep = S && S.L === lv ? S : null;
    const hs = new Map();
    for (const d of (lv.hoists || [])) { const was = keep && keep.hs.get(d.id);
      const stay = was && stays(d) && was.state === 'down';
      hs.set(d.id, stay ? was : { d, id: d.id, state: 'hang', lx: d.x * TS + 8, ly: ((d.hang !== undefined ? d.hang : d.load === 'crew' ? d.walk[2] : d.top) + 1) * TS, vy: 0, t: 0, hit: new Set(), heroHit: false, rolled: 0, fold: 0 });
      if (stay) layCells(d); else if (d.load === 'crew') walkCells(d, true); }
    /* a stake wall comes out of the ground with a death (the grid is laid again) */
    S = { L: lv, hs, walls: [], said: keep ? keep.said : new Set(), sec: -1, banner: null, n: keep ? keep.n : { knocks: 0, crushed: 0, ramps: 0, bridges: 0, crews: 0, rolls: 0, stakeHits: 0, walls: 0, wallsDown: 0 } };
    for (const e of ctx.enemies()) if (e.alive && e.pwSetter) { e.setT = 1.2; e.setMode = null; }
  };
  H.load = () => { S = null; H.reset(); };

  /* ---------- KNOCK: the wedge goes, what it holds comes down ---------- */
  function knock(h) {
    if (!S || h.state !== 'hang') return false; const d = h.d; S.n.knocks++;
    ctx.sfx.crack && ctx.sfx.crack(); ctx.sfx.creak && ctx.sfx.creak(); ctx.burst(d.cleat[0] * TS + 8, d.cleat[1] * TS, 8, ['#c9a060', '#8a5a32', '#ffe9a0'], 60, 0.5);
    if (once('knock')) say(d.cleat[0] * TS + 8, d.cleat[1] * TS - 22, 'knock');
    if (d.load === 'ramp' || d.load === 'tower' || d.load === 'bridge') { h.state = 'fold'; h.t = 0; return true; }
    if (d.load === 'crew') { h.state = 'fall'; h.vy = 0; walkCells(d, false); S.n.crews++;
      const [x0, x1, row] = d.walk;
      for (const e of ctx.enemies()) if (e.alive && !e.maxHp && e.x > x0 * TS - 4 && e.x < (x1 + 1) * TS + 4 && Math.abs(e.y - row * TS) < 10) { ctx.hurt(e, PROPS.crewFall, e.x); e.stagger = Math.max(e.stagger || 0, 1.2); e.vy = 40; S.n.crushed++; }
      say((x0 + x1 + 1) * TS / 2, row * TS - 18, 'crew', '#8fd160'); return true; }
    h.state = 'fall'; h.vy = 0; return true;   /* stakes */
  }
  H.knockProp = id => { const h = S && S.hs.get(id); return h ? knock(h) : false; };

  const crushBox = (h, d) => d.load === 'stakes' ? { l: h.lx - PROPS.stakeW * TS / 2, r: h.lx + PROPS.stakeW * TS / 2, t: h.ly - PROPS.stakeH, b: h.ly }
    : { l: d.walk[0] * TS, r: (d.walk[1] + 1) * TS, t: h.ly - 10, b: h.ly };
  function land(h) {
    const d = h.d; ctx.shake(4); ctx.sfx.heavy && ctx.sfx.heavy(); ctx.dust(h.lx, h.ly, 10);
    const bx = crushBox(h, d);
    for (const e of ctx.enemies()) if (e.alive && !e.maxHp && ctx.overlap(bx, ctx.box(e))) { h.hit.add(e); ctx.hurt(e, PROPS.crush, h.lx); S.n.crushed++; if (once('crushed')) say(e.x, e.y - 20, 'crushed', '#8fd160'); }
    for (const p of ctx.players()) if (p && !p.dead && ctx.overlap(bx, ctx.boxOf(p))) ctx.asPlayer(p, () => { ctx.damage(h.lx, PROPS.debrisDmg, { up: true, unblockable: true, name: d.load === 'stakes' ? 'THE STAKES' : 'THE TIMBER' }); });
    if (d.load === 'crew') { h.state = 'down'; h.goneT = 0; return; }
    h.state = 'roll'; h.rolled = 0; ctx.sfx.rumble && ctx.sfx.rumble(); S.n.rolls++; if (once('rolls')) say(h.lx, h.ly - 30, 'rolls');
  }
  function split(h) { h.state = 'gone'; h.goneT = 0; ctx.sfx.crack && ctx.sfx.crack(); ctx.shake(3); ctx.burst(h.lx, h.ly - 6, 14, ['#8a5a32', '#c9a060', '#5c3a1d'], 90, 0.7); if (once('split')) say(h.lx, h.ly - 24, 'split', '#c9b27c'); }

  /* ---------- EVERY FRAME ---------- */
  H.update = dt => {
    if (!S) return; const P = ctx.players()[0], lv = L();
    for (const h of S.hs.values()) { const d = h.d;
      if (h.state === 'fold') { h.t += dt; h.fold = Math.min(1, h.t / 0.55);
        if (h.t >= 0.55) { h.state = 'down'; layCells(d); ctx.shake(4); ctx.sfx.heavy && ctx.sfx.heavy();
          const c = propCells(d), mx = c.length ? c.reduce((s, q) => s + q[0], 0) / c.length : d.x, my = c.length ? Math.min(...c.map(q => q[1])) : d.top;
          ctx.dust(mx * TS + 8, my * TS, 12);
          /* a hero inside the cells it lays is stood on top of them (never shut in) */
          for (const p of ctx.players()) if (p && !p.dead) { const tx = Math.floor(p.x / TS), ty = Math.floor((p.y - 1) / TS); if (c.some(q => q[0] === tx && q[1] === ty && q[2] === 'S')) { let y = ty; while (y > 0 && ctx.solidAt(tx, y - 1)) y--; p.y = y * TS; p.vy = 0; } }
          for (const e of ctx.enemies()) if (e.alive && !e.maxHp) { const tx = Math.floor(e.x / TS), ty = Math.floor((e.y - 1) / TS); if (c.some(q => q[0] === tx && q[1] === ty)) { ctx.hurt(e, PROPS.crush, e.x); S.n.crushed++; } }
          if (d.load === 'ramp') { S.n.ramps++; if (once('ramp')) say(mx * TS + 8, my * TS - 24, 'ramp', '#8fd160'); } else { S.n.bridges++; if (once('bridge')) say(mx * TS + 8, my * TS - 24, 'bridge', '#8fd160'); } } }
      else if (h.state === 'fall') { h.vy = Math.min(PROPS.vmax, h.vy + PROPS.g * dt); h.ly += h.vy * dt;
        const ty = Math.floor(h.ly / TS), xs = d.load === 'crew' ? [d.walk[0], Math.floor((d.walk[0] + d.walk[1]) / 2), d.walk[1]] : [Math.floor((h.lx - TS) / TS), Math.floor(h.lx / TS), Math.floor((h.lx + TS) / TS)];
        if (xs.some(x => standAt(x, ty)) || ty >= lv.H - 1) { h.ly = ty * TS; h.vy = 0; land(h); } }
      else if (h.state === 'gone' || (h.state === 'down' && d.load === 'crew')) h.goneT = (h.goneT || 0) + dt;
      else if (h.state === 'roll') { const dir = d.roll || 1, half = PROPS.stakeW * TS / 2, row = Math.floor((h.ly - 2) / TS);
        const nx = h.lx + dir * PROPS.stakeV * dt, front = Math.floor((nx + dir * half) / TS);
        if (ctx.solidAt(front, row) || h.rolled >= (d.rollMax || PROPS.stakeMax) * TS) { split(h); continue; }
        h.rolled += Math.abs(nx - h.lx); h.lx = nx; h.turn = (h.turn || 0) + dt * 14;
        const fy = Math.floor(h.ly / TS); if (!standAt(Math.floor(h.lx / TS), fy)) { h.vy = Math.min(PROPS.vmax, h.vy + PROPS.g * dt); h.ly += h.vy * dt; const ty = Math.floor(h.ly / TS); if (standAt(Math.floor(h.lx / TS), ty)) { h.ly = ty * TS; h.vy = 0; } if (h.ly > lv.H * TS) { split(h); continue; } }
        const bx = crushBox(h, d);
        for (const e of ctx.enemies()) if (e.alive && !e.maxHp && !h.hit.has(e) && ctx.overlap(bx, ctx.box(e))) { h.hit.add(e); ctx.hurt(e, PROPS.stakeDmg, h.lx - dir * 20); e.stagger = Math.max(e.stagger || 0, 0.8); S.n.crushed++; }
        /* a stake wall in its road goes down under it */
        for (const w of S.walls) if (!w.down && Math.abs(w.x * TS + 8 - h.lx) < half + 8 && Math.abs(w.y * TS - h.ly) < 24) wallDown(w);
        if (P && !P.dead && !h.heroHit && ctx.overlap(bx, ctx.boxOf(P))) { h.heroHit = true; S.n.stakeHits++; ctx.asPlayer(P, () => { ctx.damage(h.lx - dir * 20, PROPS.stakeHero, { up: true, unblockable: true, name: 'THE STAKES' }); }); say(P.x, P.y - 26, 'stakeHit', '#ff6b6b'); }
        if (Math.random() < dt * 20) ctx.dust(h.lx - dir * half, h.ly, 1); } }
    /* stake walls that have stood their time fall over */
    for (const w of S.walls) if (!w.down) { w.t += dt; if (w.t >= SETTER.wallLife) wallDown(w); }
    S.walls = S.walls.filter(w => !w.down || w.goneT < 1); for (const w of S.walls) if (w.down) w.goneT += dt;
    /* THE NAMED AREAS: the banner when you come into one */
    if (P && lv.sections) { const k = lv.sections.findIndex(s => P.x >= s.x0 * TS && P.x < s.x1 * TS); if (k >= 0 && k !== S.sec) { S.banner = { name: lv.sections[k].name, t: 3.4 }; S.sec = k; } }
    if (S.banner) { S.banner.t -= dt; if (S.banner.t <= 0) S.banner = null; }
  };

  /* ---------- THE STAKE-SETTER (main.js calls it before the foe's own AI; true = handled this frame) ---------- */
  function wallDown(w) { if (w.down) return; w.down = true; w.goneT = 0; for (let k = 0; k < SETTER.rows; k++) if (ctx.tileAt(w.x, w.y - k) === ctx.T.SOLID) ctx.cellSet(w.x, w.y - k, ctx.T.AIR); S.n.wallsDown++;
    ctx.sfx.crack && ctx.sfx.crack(); ctx.burst(w.x * TS + 8, w.y * TS, 10, ['#8a5a32', '#c9a060', '#5c3a1d'], 80, 0.6); if (once('wallDown')) say(w.x * TS + 8, (w.y - 2) * TS, 'wallDown', '#8fd160'); }
  H.setterStep = (e, dt) => {
    if (!S || !e.alive || !e.pwSetter) return false; const P = ctx.players()[0];
    e.setT = (e.setT || 0) - dt;
    if (e.setMode === 'tell') { e.vx = 0; e.setTell -= dt; e.face = e.setFace;
      if (e.setTell <= 0) { e.setMode = null; e.setT = SETTER.cd; const w = e.setWall; e.setWall = null;
        if (w && !(e.stagger > 0) && wallFree(w.x, w.y)) { for (let k = 0; k < SETTER.rows; k++) ctx.cellSet(w.x, w.y - k, ctx.T.SOLID); S.walls.push({ x: w.x, y: w.y, t: 0, hits: 0, down: false, by: e }); S.n.walls++;
          ctx.sfx.thud && ctx.sfx.thud(); ctx.dust(w.x * TS + 8, (w.y + 1) * TS, 8); if (once('plant')) say(w.x * TS + 8, (w.y - 3) * TS, 'plant', '#ff9a5c'); } }
      return true; }
    if (e.stagger > 0 || !P || P.dead || e.setT > 0) return false;
    if (S.walls.some(w => !w.down && w.by === e)) return false;
    const dx = P.x - e.x, feet = Math.floor((e.y - 1) / TS);
    if (Math.abs(dx) > SETTER.reach * TS || Math.abs(dx) < 2.5 * TS || Math.abs(P.y - e.y) > 20) return false;
    const dir = Math.sign(dx), wx = Math.floor(e.x / TS) + dir * 2;
    if (!wallFree(wx, feet)) return false;
    e.setMode = 'tell'; e.setTell = SETTER.tell; e.setFace = dir; e.setWall = { x: wx, y: feet };
    ctx.number(e.x, e.y - 30, '!', '#ffd36b'); ctx.sfx.tell && ctx.sfx.tell(); return true;
  };
  /* a wall goes in only on floor, into air, with no hero in it */
  function wallFree(x, y) {
    if (!ctx.solidAt(x, y + 1)) return false;
    for (let k = 0; k < SETTER.rows; k++) if (ctx.tileAt(x, y - k) !== ctx.T.AIR) return false;
    for (const p of ctx.players()) if (p && !p.dead && Math.abs(p.x - (x * TS + 8)) < 16 && p.y > (y - SETTER.rows) * TS && p.y - 26 < (y + 1) * TS) return false;
    return true;
  }

  /* ---------- A BLOW ON A PROP (or on a stake wall) ---------- */
  H.strike = hb => { if (!S || !hb) return;
    for (const h of S.hs.values()) { const d = h.d; if (h.state !== 'hang') continue; if (ctx.overlap(hb, propBox(d))) knock(h); }
    for (const w of S.walls) { if (w.down) continue; const bx = { l: w.x * TS - 2, r: w.x * TS + 18, t: (w.y - SETTER.rows + 1) * TS, b: (w.y + 1) * TS };
      if (ctx.overlap(hb, bx) && w.hitAt !== ctx.time()) { w.hitAt = ctx.time(); w.hits++; ctx.sfx.clank && ctx.sfx.clank(); w.shake = 0.2; if (w.hits >= SETTER.wallHits) wallDown(w); } } };

  /* ---------- THE GUIDE's props (src/stuck-spots.js reads `on`) ---------- */
  H.props = () => { if (!S) return []; const out = [];
    for (const h of S.hs.values()) { const d = h.d; out.push({ t: 'hoist', id: h.id, x: d.cleat[0] * TS + 8, y: (d.cleat[1] + 1) * TS, on: h.state !== 'hang' }); }
    return out; };
  H.read = () => S ? { hoists: [...S.hs.values()].map(h => ({ id: h.id, load: h.d.load, state: h.state, ly: h.ly, lx: h.lx })), walls: S.walls.filter(w => !w.down).map(w => ({ x: w.x, y: w.y, hits: w.hits })), banner: S.banner ? S.banner.name : null, sec: S.sec, n: { ...S.n } } : null;
  H.hoist = id => S && S.hs.get(id);

  /* ---------- DRAWING (GREYBOX: readable shapes; the sonnet art lane redraws every one) ---------- */
  const R = Math.round;
  const rect = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
  const dots = (g, x, y0, y1, col) => { g.fillStyle = col; for (let y = y0; y < y1; y += 5) g.fillRect(x, y, 1, 2); };
  const hdots = (g, x0, x1, y, col) => { g.fillStyle = col; const a = Math.min(x0, x1), b = Math.max(x0, x1); for (let x = a; x < b; x += 6) g.fillRect(x, y, 3, 1); };
  const C = { tim: '#8a5a32', timL: '#b07a44', timD: '#5a3a1d', rope: '#d8c08a', wedge: '#c9a060', strain: '#ff9a5c', gold: '#ffd36b', ghost: 'rgba(255,233,160,0.35)', stake: '#a8783e', stakeT: '#e0c890' };
  /* THE PROP: a shore leaning into what it holds, a wedge at its foot, a rope lashing, strain marks (zig-zags that shiver), a glint while it holds */
  function drawProp(g, x, y, lean, up, time, id) {
    if (!up) { rect(g, x - 9, y - 3, 14, 3, C.timD); rect(g, x + 6, y - 2, 4, 2, C.wedge); return; }   /* knocked: the shore on the ground, the wedge kicked out */
    g.save(); g.translate(x, y); g.rotate(lean);
    rect(g, -2, -30, 4, 30, C.tim); rect(g, -2, -30, 1, 30, C.timL); rect(g, -5, -32, 10, 3, C.timD);
    rect(g, -3, -20, 6, 2, C.rope); rect(g, -3, -14, 6, 2, C.rope);
    const sh = Math.sin(time * 18 + (id % 7)) > 0 ? 1 : 0; g.fillStyle = C.strain;
    for (const sy of [-26, -9]) { g.fillRect(3 + sh, sy, 2, 1); g.fillRect(5 + sh, sy + 1, 2, 1); g.fillRect(3 + sh, sy + 2, 2, 1); }
    g.restore();
    g.fillStyle = C.wedge; g.beginPath(); g.moveTo(x - 7, y); g.lineTo(x + 3, y); g.lineTo(x - 7, y - 6); g.closePath(); g.fill();
    if (Math.floor(time * 3) % 2) { g.globalAlpha = 0.8; rect(g, x - 9, y - 8, 2, 2, C.gold); g.globalAlpha = 1; }
  }
  const frame = (g, x0, y0, w, h, col) => { rect(g, x0, y0, 2, h, col); rect(g, x0 + w - 2, y0, 2, h, col); for (let y = y0; y < y0 + h; y += 12) rect(g, x0, y, w, 2, col);
    g.strokeStyle = col; g.lineWidth = 1; g.beginPath(); for (let y = y0; y + 12 <= y0 + h; y += 12) { g.moveTo(x0, y); g.lineTo(x0 + w, y + 12); } g.stroke(); };
  H.drawWorld = (g, cx, cy, VW, VH, time) => {
    if (!S) return; const lv = L();
    /* THE HARVEST the goblins took (baskets, nuts, rakes, sheaves, apples) */
    for (const [hx, hy, k] of (lv.harvest || [])) { const x = R(hx * TS + 8 - cx), y = R((hy + 1) * TS - cy); if (x < -30 || x > VW + 30) continue;
      if (k === 'basket') { rect(g, x - 6, y - 8, 12, 8, '#a8783e'); rect(g, x - 6, y - 8, 12, 2, '#d8a860'); rect(g, x - 4, y - 11, 3, 3, '#c0402a'); rect(g, x, y - 11, 3, 3, '#e0a030'); }
      else if (k === 'nuts') for (let i = 0; i < 6; i++) rect(g, x - 6 + (i % 3) * 4, y - 3 - Math.floor(i / 3) * 3, 3, 3, i % 2 ? '#8a5a2a' : '#b07a3a');
      else if (k === 'rake') { rect(g, x - 1, y - 18, 2, 18, '#8a5a32'); rect(g, x - 5, y - 18, 10, 2, '#5a3a1d'); }
      else if (k === 'sheaf') { rect(g, x - 4, y - 14, 8, 14, '#d0a83a'); rect(g, x - 5, y - 8, 10, 2, '#8a5a2a'); }
      else if (k === 'apples') for (let i = 0; i < 5; i++) rect(g, x - 6 + i * 3, y - 3 - (i % 2) * 2, 3, 3, i % 2 ? '#c0402a' : '#e06030'); }
    for (const h of S.hs.values()) { const d = h.d, ccx = R(d.cleat[0] * TS + 8 - cx), ccy = R((d.cleat[1] + 1) * TS - cy), lxs = R(h.lx - cx), ly = R(h.ly - cy), up = h.state === 'hang';
      const span = d.span ? [d.span[0] * TS - cx, (d.span[1] + 1) * TS - cx] : null;
      if (Math.max(ccx, lxs, span ? span[1] : -999) < -100 || Math.min(ccx, lxs, span ? span[0] : 9999) > VW + 100) continue;
      const lean = Math.sign(d.x - d.cleat[0]) * 0.25;
      if (d.load === 'ramp') { const c = propCells(d, (x, y) => ctx.solidAt(x, y)), xs = c.map(q => q[0]), x0 = Math.min(...xs), x1 = Math.max(...xs) + 1, yTop = d.top;
        if (up) { const foot = Math.max(...c.map(q => q[1])) + 1; frame(g, R(x0 * TS - cx), R(yTop * TS - cy), (x1 - x0) * TS, (foot - yTop) * TS, C.tim);   /* the section standing against the face */
          g.fillStyle = C.ghost; for (const [x, y, k] of c) if (k === 'O' || !c.some(q => q[0] === x && q[1] === y - 1)) g.fillRect(R(x * TS - cx) + 1, R(y * TS - cy), 14, k === 'O' ? 3 : 2); }   /* THE RESULT FIRST: the ramp's ghost */
        else if (h.state === 'fold') { g.save(); g.globalAlpha = 1 - h.fold * 0.6; frame(g, R(x0 * TS - cx), R((yTop + h.fold * 4) * TS - cy), (x1 - x0) * TS, 3 * TS, C.timD); g.restore(); }
        else for (const [x, y, k] of c) { rect(g, R(x * TS - cx), R(y * TS - cy), 16, k === 'O' ? 4 : 16, k === 'O' ? C.timL : C.tim); rect(g, R(x * TS - cx), R(y * TS - cy), 16, 2, C.timL); } }
      else if (d.load === 'tower' || d.load === 'bridge') { const bx = R(d.x * TS + 8 - cx), foot = R((d.cleat[1] + 1) * TS - cy), top = R(d.top * TS - cy);
        if (up) { if (d.load === 'tower') { frame(g, bx - 10, top + 10, 20, foot - top - 10, C.tim); rect(g, bx - 14, top, 28, 10, C.timD); rect(g, bx - 14, top, 28, 2, C.timL); for (let k = 0; k < 4; k++) rect(g, bx - 13 + k * 7, top - 6, 3, 6, C.stake); }
            else frame(g, bx - 8, top, 16, foot - top, C.tim);
            g.fillStyle = C.ghost; g.fillRect(R(span[0]), R(d.span[2] * TS - cy), R(span[1] - span[0]), 3); hdots(g, bx, R(span[1]), R(d.span[2] * TS - cy) - 2, 'rgba(255,233,160,0.5)'); }
        else if (h.state === 'fold') { g.save(); g.translate(bx, foot); g.rotate(Math.sign(d.span[0] - d.x) * h.fold * Math.PI / 2); frame(g, -8, -(foot - top), 16, foot - top, C.tim); g.restore(); }
        else { const sy = R(d.span[2] * TS - cy); rect(g, R(span[0]), sy, R(span[1] - span[0]), 6, C.tim); rect(g, R(span[0]), sy, R(span[1] - span[0]), 2, C.timL); for (let x = span[0]; x < span[1]; x += 12) rect(g, R(x), sy + 6, 2, 6, C.timD); } }
      else if (d.load === 'crew') { const [x0, x1, row] = d.walk, wx0 = R(x0 * TS - cx), wx1 = R((x1 + 1) * TS - cx), wy = R(row * TS - cy);
        if (up) { rect(g, wx0, wy + 3, wx1 - wx0, 3, C.timD); for (const xx of [wx0 + 2, wx1 - 4]) rect(g, xx, wy + 6, 2, ccy - wy - 6, C.tim);   /* the walkway's legs down to the floor */
          let fy = row + 1; while (fy < lv.H - 1 && !standAt(x0 + 1, fy)) fy++; dots(g, R((wx0 + wx1) / 2), wy + 8, R(fy * TS - cy), 'rgba(255,233,160,0.45)'); }
        else if (h.state === 'fall') { rect(g, wx0, ly - 6, wx1 - wx0, 4, C.tim); for (let x = wx0; x < wx1; x += 10) rect(g, x, ly - 10, 3, 4, C.timL); }
        else if ((h.goneT || 0) < 6) { g.globalAlpha = Math.max(0, 1 - (h.goneT || 0) / 6); for (let x = wx0; x < wx1; x += 7) rect(g, x, ly - 3 - (x % 3), 6, 3, C.timD); g.globalAlpha = 1; } }
      else if (d.load === 'stakes') { const w = PROPS.stakeW * TS;
        if (up) { const top = R(d.top * TS - cy); rect(g, lxs - w / 2 - 4, top, 2, ly - top + 2, C.tim); rect(g, lxs + w / 2 + 2, top, 2, ly - top + 2, C.tim); rect(g, lxs - w / 2 - 4, ly, w + 8, 2, C.timD);   /* the rack */
          let to = Math.floor(h.ly / TS); while (to < lv.H - 1 && !standAt(Math.floor(h.lx / TS), to)) to++; dots(g, lxs, ly + 3, R(to * TS - cy), 'rgba(255,233,160,0.5)');
          if (d.roll) { let tx = Math.floor(h.lx / TS), n = 0; const lim = d.rollMax || PROPS.stakeMax; while (n < lim && !ctx.solidAt(tx + d.roll * 2, to - 1)) { tx += d.roll; n++; } hdots(g, lxs, R((tx + 0.5) * TS - cx), R(to * TS - cy) - 3, 'rgba(255,154,92,0.55)'); } }
        if (h.state !== 'gone') for (let k = 0; k < 3; k++) { const yy = ly - 4 - k * 4, off = h.state === 'roll' ? Math.sin((h.turn || 0) + k) * 2 : 0; rect(g, lxs - w / 2 + off, yy, w, 3, C.stake); rect(g, lxs + w / 2 + off - 1, yy - 1, 4, 5, C.stakeT); }
        else if ((h.goneT || 0) < 2) for (let k = 0; k < 5; k++) rect(g, lxs - 20 + k * 9, ly - 3 - (k % 2) * 3, 8, 2, C.stake); }
      drawProp(g, ccx, ccy, lean, up, time, hash(d.id));
    }
    /* THE STAKE WALLS */
    for (const w of S.walls) { const x = R(w.x * TS - cx), y = R((w.y + 1) * TS - cy); if (x < -20 || x > VW + 20) continue; const sh = w.shake > 0 ? (w.shake -= 1 / 60, Math.sin(time * 60) * 2) : 0;
      if (w.down) { g.globalAlpha = Math.max(0, 1 - w.goneT); for (let k = 0; k < 4; k++) rect(g, x - 6 + k * 6, y - 3, 6, 3, C.stake); g.globalAlpha = 1; continue; }
      for (let k = 0; k < 3; k++) { const sx = x + 1 + k * 5 + sh; rect(g, sx, y - SETTER.rows * TS + 4, 4, SETTER.rows * TS - 4, C.stake); g.fillStyle = C.stakeT; g.beginPath(); g.moveTo(sx, y - SETTER.rows * TS + 4); g.lineTo(sx + 2, y - SETTER.rows * TS - 2); g.lineTo(sx + 4, y - SETTER.rows * TS + 4); g.fill(); }
      rect(g, x, y - 12, 16, 2, C.rope); if (w.hits) rect(g, x + 4, y - 20, 8, 2, C.strain); }
    /* the area banner */
    if (S.banner && ctx.text && !(ctx.talking && ctx.talking())) { const a = Math.min(1, S.banner.t / 0.6, (3.4 - S.banner.t) / 0.4 + 0.2); g.globalAlpha = Math.max(0, Math.min(1, a)); g.fillStyle = 'rgba(40,20,8,0.62)'; g.fillRect(VW / 2 - 110, 26, 220, 18);
      g.fillStyle = '#e0a040'; g.fillRect(VW / 2 - 110, 26, 220, 1); g.fillRect(VW / 2 - 110, 43, 220, 1); ctx.text(S.banner.name, VW / 2, 31, '#ffe9b0', 'center'); g.globalAlpha = 1; }
  };
  /* the setter's mallet raised while he tells (main.js calls it per setter, after its sprite) */
  H.setterOver = (g, e, cx, cy, time) => { if (!e.alive || !e.pwSetter) return; const x = R(e.x - cx), y = R(e.y - cy), f = e.face || -1;
    for (let k = 0; k < 3; k++) rect(g, x - f * (4 + k * 2), y - 18 + k, 2, 10, C.stake);   /* the armful of stakes on his back */
    const up = e.setMode === 'tell'; g.save(); g.translate(x + f * 5, y - 14); g.rotate(f * (up ? -1.9 : -0.4)); rect(g, -1, -10, 2, 10, C.timD); rect(g, -3, -13, 6, 4, C.tim); g.restore(); };
  /* THE LANDMARK on the skyline: THE PALISADE LINE across the trees, its watchtowers, and THE HALF-BUILT GATEHOUSE that grows as you come (greybox silhouettes) */
  H.drawSky = (g, cx, cy, VW, VH) => {
    const lv = L(); if (!lv) return; const k = Math.max(0, Math.min(1, cx / Math.max(1, lv.W * TS - VW))), base = R(VH * 0.62 - k * 10);
    g.fillStyle = 'rgba(74,44,26,0.55)'; const off = -(cx * 0.18) % 14;
    for (let x = off - 14; x < VW + 14; x += 7) { const hgt = 16 + ((Math.floor((x - off + cx * 0.18) / 7) * 37) % 5); g.fillRect(R(x), base - hgt, 5, hgt + 40); g.fillRect(R(x) + 1, base - hgt - 3, 3, 3); }
    for (let i = 0; i < 6; i++) { const tx = R(((i * 220 - cx * 0.18) % (VW + 300) + VW + 300) % (VW + 300) - 120); g.fillRect(tx, base - 44, 4, 44); g.fillRect(tx + 16, base - 44, 4, 44); g.fillRect(tx - 4, base - 52, 28, 8); }
    const s = 0.5 + k * 0.9, gx = R(VW * 0.78 - k * VW * 0.2), gy = base + 4;   /* THE GATEHOUSE: half-built (one tower roofed, one a frame of scaffold) */
    g.fillStyle = 'rgba(60,34,20,0.7)'; g.fillRect(gx - 40 * s, gy - 70 * s, 26 * s, 70 * s); g.fillRect(gx - 46 * s, gy - 80 * s, 38 * s, 10 * s); g.fillRect(gx - 14 * s, gy - 30 * s, 28 * s, 6 * s);
    g.strokeStyle = 'rgba(60,34,20,0.7)'; g.lineWidth = 2; g.strokeRect(gx + 14 * s, gy - 66 * s, 24 * s, 66 * s); g.beginPath(); for (let y = 0; y < 66; y += 16) { g.moveTo(gx + 14 * s, gy - y * s); g.lineTo(gx + 38 * s, gy - (y + 16) * s); } g.stroke(); g.lineWidth = 1;
  };
  return H;
}
