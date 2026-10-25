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
import * as PWB from './redraw/palisade_backdrop.js'; import * as PWW from './redraw/palisade_world.js';   /* (claude/palisadeart) the skyline landmark is baked in src/redraw/palisade_backdrop.js */
export const PROPS = { g: 900, vmax: 520, crush: 30, crewFall: 26, debrisDmg: 12, stakeW: 3, stakeH: 12, stakeV: 150, stakeDmg: 26, stakeHero: 14, stakeMax: 40 };
export const PROP_KIND = { ramp: 'scaffoldprop', tower: 'towerprop', bridge: 'towerprop', crew: 'crewprop', stakes: 'stakeprop' };   /* the ent kind at a prop's foot (src/palisade-wood.js) - the guide's done names it */
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
    e.setT = (e.setT || 0) - dt; if (e.setSlam > 0) e.setSlam = Math.max(0, e.setSlam - dt);
    if (e.setMode === 'tell') { e.vx = 0; e.setTell -= dt; e.face = e.setFace;
      if (e.setTell <= 0) { e.setMode = null; e.setT = SETTER.cd; e.setSlam = 0.32; const w = e.setWall; e.setWall = null;
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
    for (const h of S.hs.values()) { const d = h.d; out.push({ t: PROP_KIND[d.load], id: h.id, x: d.cleat[0] * TS + 8, y: (d.cleat[1] + 1) * TS, on: h.state !== 'hang' }); }
    return out; };
  H.read = () => S ? { hoists: [...S.hs.values()].map(h => ({ id: h.id, load: h.d.load, state: h.state, ly: h.ly, lx: h.lx })), walls: S.walls.filter(w => !w.down).map(w => ({ x: w.x, y: w.y, hits: w.hits })), banner: S.banner ? S.banner.name : null, sec: S.sec, n: { ...S.n } } : null;
  H.hoist = id => S && S.hs.get(id);

  /* ---------- DRAWING (claude/palisadeart: every picture is in src/redraw/palisade_world.js; this file keeps the state and the rules) ---------- */
  H.drawWorld = (g, cx, cy, VW, VH, time) => { if (!S) return; PWW.drawWorld({ g, S, lv: L(), ctx, cx, cy, VW, VH, time, propCells, PROPS, SETTER, standAt }); };
  /* the setter's mallet and his stakes are drawn in his own frames (src/redraw/palisade_foes.js: 5 the raise, 6 the drive); nothing is laid over him now */
  H.setterOver = () => {};
  /* THE LANDMARK on the skyline (claude/palisadeart): THE PALISADE LINE and THE HALF-BUILT GATEHOUSE are baked and placed in src/redraw/palisade_backdrop.js (between the far wood and the mid row, so the trees stand in front of them);
     this is what flies and smokes over the gatehouse: its rust pennant and the crew's fire */
  H.drawSky = (g, cx, cy, VW, VH, time) => { PWB.drawLive(g, time || 0); };
  return H;
}
