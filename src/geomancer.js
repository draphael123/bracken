// geomancer.js — THE GEOMANCER'S KIT (docs/briefs/geomancer.md). The Knight absorbs a blow, the Warden turns it at range, and the
// Geomancer BUILDS SOMETHING IN ITS WAY and then uses what she built. Her magic changes the level itself, so everything here that
// stands is written into the level's own grid for a few seconds - which is why the pillar is a real platform, why the wall really
// stops an arrow (a shot dies in rock, main.js seeds) and why a foe cannot walk through either.
//
// THE RULES THIS FILE KEEPS (and tools/geomancer.mjs proves, red first):
//   1. ROCK ONLY GOES INTO AIR. A cell is written only if it is empty level (T.AIR) with no living body - her or a foe - in it,
//      and it gives back exactly what was there. A body that is where a pillar comes up is LIFTED onto its top (if there is room
//      over it), never buried; a body with no room over it stops the pillar short.
//   2. NOTHING STANDS FOR LONG. Every piece crumbles on its own (GEO.life, ~4 s; the archway 6 s), and it VISIBLY CRACKS for its
//      last second first (C1: a thing about to change is told).
//   3. THE CAP. At most three pieces (four with THE FOURTH STONE) stand at once: raising another crumbles the oldest.
//   4. NEVER A TRAP. Each frame, a piece with a living body inside it (a foe spawned or thrown there, a respawn) crumbles at once.
//   5. A level that is left or reloaded takes its pieces with it: a piece only ever restores the grid it was written into.
// The kit is bound to main.js through `api` (makeGeomancer) - main.js owns the world, the input and the tal() reads; this owns
// what she makes in it.
export const GEO = {
  cap: 3, life: 4, lifeLong: 6, archLife: 6, crack: 1.0, rise: 0.12,
  pillarH: 2, wallH: 2, perfect: 0.2, wallHp: 3,
  tremor: { wall: 18, perfect: 28, launch: 14, shot: 6 },
  launchVy: -330, heroLaunchVy: -430, stepVy: -400,
  quakeR: 200, quakeWideMul: 1.5,
  roll: { sp: 230, r: 5, life: 1.0, dmg: 1.0 }, boulder: { sp: 190, r: 8, life: 3.2, dmg: 1.0, bounces: 2 },   /* (1.6 and a fresh hit on every bounce measured 120 at level 3 on the probe, four times Harrier's; each foe is hit ONCE now) */
};
const STONE = { base: '#7c7a6e', hi: '#a8a696', lo: '#5e5c54', dark: '#44423a', moss: '#6f9a4a', moss2: '#557a38', rune: '#e8a83a', crack: '#26241e' };

export function makeGeomancer(api) {
  let pieces = [], rollers = [], shards = [], falls = [], spikes = [], faults = [], lode = null, golem = null, spurFx = null;
  const TS = api.TS;
  const T = () => api.T;
  const grid = () => api.L.grid;
  const heroBox = () => api.box(api.P);
  const foes = () => api.enemies.filter(e => e.alive && !(e.gone > 0));
  const bodies = () => [heroBox(), ...foes().map(api.box)];
  const cellBox = (tx, ty) => ({ l: tx * TS, r: tx * TS + TS, t: ty * TS, b: ty * TS + TS });
  const tal = k => (api.tal()[k] || 0);
  const lifeOf = kind => kind === 'arch' ? GEO.archLife : GEO.life + (tal('lasting') ? 2 : 0);
  const cap = () => GEO.cap + (tal('fourth') ? 1 : 0);
  const dmg = (mul, k) => Math.max(1, Math.round(api.swordDmg() * mul * (k ? api.amul(k) : 1)));
  const floorRow = (tx, fromTy, span = 4) => { for (let ty = fromTy; ty <= fromTy + span && ty < api.LH; ty++) { const t = api.tileAt(tx, ty); if (api.isSolid(tx, ty) || api.isOneWay(t)) return ty; } return null; };
  /* RULE 1: empty level, in bounds, and nobody in it */
  function freeCell(tx, ty) {
    if (tx < 1 || ty < 1 || tx >= api.LW - 1 || ty >= api.LH - 1) return false;
    if (grid()[ty * api.LW + tx] !== T().AIR) return false;
    const c = cellBox(tx, ty); return !bodies().some(b => api.overlap(c, b));
  }
  function refreshTiles() { api.resolveTiles(); const spr = api.tileSpr; if (spr) for (const p of pieces) for (const c of p.cells) spr[c.i] = null; }
  function crumble(p, why) {
    if (p.gone) return; p.gone = true;
    const g = grid(); if (p.grid === g) for (const c of p.cells) if (g[c.i] === p.tile) g[c.i] = c.was;   /* RULE 5: only ever the grid it was written into */
    pieces = pieces.filter(q => q !== p); if (p.grid === g) refreshTiles();
    const cx = (p.x0 + p.x1) / 2, cy = (p.y0 + p.y1) / 2;
    api.burst(cx, cy, 10 + p.cells.length * 3, [STONE.base, STONE.hi, STONE.lo, STONE.moss], 70, 0.6);
    if (why !== 'silent') api.SFX.geoCrumble && api.SFX.geoCrumble();
    if (p.kind === 'wall' && tal('shrapnel') && why !== 'silent' && why !== 'shatter') burstShards(cx, cy, 0, 4);   /* SHRAPNEL */
  }
  /* write a run of cells as one piece (RULE 1 checked per cell by the caller, re-checked here) */
  function place(kind, cells, tile) {
    cells = cells.filter(([tx, ty]) => freeCell(tx, ty)); if (!cells.length) return null;
    const own = pieces.filter(q => q.capped);
    while (own.length >= cap()) crumble(own.shift(), 'cap');   /* RULE 3 */
    const g = grid(), t = api.time;
    const p = { kind, tile, grid: g, born: t, age: 0, life: lifeOf(kind), capped: true, hp: GEO.wallHp, cells: [],
      x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
    for (const [tx, ty] of cells) { const i = ty * api.LW + tx; p.cells.push({ i, tx, ty, was: g[i] }); g[i] = tile;
      p.x0 = Math.min(p.x0, tx * TS); p.x1 = Math.max(p.x1, tx * TS + TS); p.y0 = Math.min(p.y0, ty * TS); p.y1 = Math.max(p.y1, ty * TS + TS); }
    pieces.push(p); refreshTiles(); return p;
  }
  /* A BODY WHERE STONE COMES UP. The hero and anything light are lifted onto the top of it (if the space over it is open);
     a boss, a mini, a flyer or a thing with a ceiling on it is not moved - the stone stops short under it (RULE 1). */
  function roomAbove(b, top) { const l = Math.floor((b.x - b.w / 2 + 1) / TS), r = Math.floor((b.x + b.w / 2 - 1) / TS), t0 = Math.floor((top - b.h) / TS), t1 = Math.floor((top - 1) / TS);
    for (let tx = l; tx <= r; tx++) for (let ty = t0; ty <= t1; ty++) if (api.isSolid(tx, ty)) return false; return true; }
  function liftable(e) { return !api.lcBig(e) && !e.noGrav && !api.knockSkip(e) && !(e.pinned > 0); }
  /* THE ERUPTION: a column of `h` cells standing on the floor row fy at column tx, launching what is standing there */
  function erupt(tx, fy, h, kind, o = {}) {
    const top = (fy - h) * TS, col = { l: tx * TS, r: tx * TS + TS, t: top - 2, b: fy * TS };
    const P = api.P, launched = [];
    if (!o.noHero && !P.dead && api.overlap(col, heroBox()) && roomAbove(P, top)) { P.y = top; P.vy = o.heroVy || GEO.heroLaunchVy; P.ground = false; P.coyote = 0; P.onMover = null; }
    for (const e of foes()) { if (e.harmless || !api.overlap(col, api.box(e))) continue;
      if (liftable(e) && roomAbove(e, top)) { e.y = top; e.vy = GEO.launchVy; e.geoAirT = api.time; e.stagger = Math.max(e.stagger || 0, 0.5); launched.push(e); }
      if (!e.turncoat && o.hurt !== false) { api.hurtAs('heavy', e, dmg(o.mul || 1.3, o.k), P.x, false); api.sparks(e.x, e.y - (e.h || 16) / 2, 0, 5); } }
    const cells = []; for (let k = 1; k <= h; k++) { if (!freeCell(tx, fy - k)) break; cells.push([tx, fy - k]); }   /* bottom up: stop at the first that is not air, or has a body in it */
    const p = cells.length ? place(kind, cells, T().SOLID) : null;
    api.dust(tx * TS + 8, fy * TS, 8); api.shakeCam(3); api.SFX.geoRise && api.SFX.geoRise();
    if (launched.length) { gainTremor(GEO.tremor.launch * launched.length); api.number(tx * TS + 8, top - 26, 'LAUNCHED', STONE.rune); }
    return { piece: p, launched };
  }
  function gainTremor(n) { const P = api.P, was = (P.tremor || 0) >= 100; P.tremor = Math.min(100, (P.tremor || 0) + n * (tal('rumble') ? 1.5 : 1)); if (!was && P.tremor >= 100) api.meterFull(); }

  /* ==== THE BASE MOVES ==== */
  /* UPHEAVAL (hold X): a pillar erupts ahead of her - further the longer the hold - launches what stands there, and stays as a platform */
  function upheavalX(wound) { return api.P.x + api.P.face * (26 + 40 * Math.max(0, Math.min(1, wound))); }
  function upheaval(wound) {
    const P = api.P, x = upheavalX(wound), tx = Math.floor(x / TS), fy = floorRow(tx, Math.floor((P.y - 1) / TS), 3);
    api.SFX.geoThud && api.SFX.geoThud(); api.dust(P.x + P.face * 8, P.y, 5);
    if (fy === null) { api.number(x, P.y - 20, 'NO GROUND THERE', '#9aa39a'); return null; }
    return erupt(tx, fy, GEO.pillarH + (tal('tall') ? 1 : 0), 'pillar', { mul: 1.3 });
  }
  /* RAISE WALL (tap C): a wall rises in the first column wholly in front of her */
  function raiseWall() {
    const P = api.P, f = P.face, tx = f > 0 ? Math.ceil((P.x + P.w / 2) / TS) : Math.floor((P.x - P.w / 2) / TS) - 1;
    api.SFX.geoThud && api.SFX.geoThud(); api.kitPose(P, 'block', 0.28);
    const fy = floorRow(tx, Math.floor((P.y - 1) / TS), 2); if (fy === null) { api.dust(P.x + f * 10, P.y, 3); return null; }
    /* a small foe stood in that column is shoved out the far side of it, never walled in */
    for (const e of foes()) { const b = api.box(e); if (!api.overlap(cellBox(tx, fy - 1), b) && !api.overlap(cellBox(tx, fy - 2), b)) continue;
      if (!liftable(e)) continue; const nx = f > 0 ? (tx + 1) * TS + e.w / 2 + 1 : tx * TS - e.w / 2 - 1; api.moveBody(e, nx - e.x, 0, false); }
    const cells = []; for (let k = 1; k <= GEO.wallH; k++) { if (!freeCell(tx, fy - k)) break; cells.push([tx, fy - k]); }
    const p = cells.length ? place('wall', cells, T().SOLID) : null;
    if (p) { p.face = f; api.SFX.geoRise && api.SFX.geoRise(); api.dust(tx * TS + 8, fy * TS, 6); }
    return p;
  }
  /* THE WALL IN A BLOW'S WAY (damagePlayer). A yellow blow from the far side stops on it - raised on the beat, the attacker's
     weapon bounces off and it staggers; a RED blow smashes straight through (red still means move), unless BULWARK takes it once. */
  function wallTakes(fromX, unblockable, foe) {
    const P = api.P, w = pieces.find(p => p.kind === 'wall' && !p.gone && Math.abs((p.x0 + p.x1) / 2 - P.x) < 44 && ((p.x0 + p.x1) / 2 - P.x) * (fromX - P.x) > 0 && Math.abs(fromX - P.x) >= Math.abs((p.x0 + p.x1) / 2 - P.x) - 8);
    if (!w) return null;
    const wx = (w.x0 + w.x1) / 2, wy = w.y0 + 6;
    if (unblockable) {
      if (tal('bulwark') && !w.bulwarked) { w.bulwarked = true; w.hp = 1; api.SFX.geoBounce(); api.shakeCam(4); api.number(wx, wy - 14, 'THE WALL HOLDS', STONE.rune); api.sparks(wx, wy, -Math.sign(wx - P.x), 8); return 'blocked'; }
      api.number(wx, wy - 14, 'SMASHED THROUGH', '#ff6b6b'); crumble(w, 'smashed'); return null; }
    const perfect = api.time - w.born < GEO.perfect;
    if (perfect && foe) { foe.stagger = Math.max(foe.stagger || 0, api.lcBig(foe) ? 0.5 : 1.2); foe.flash = 0.2; if (!foe.maxHp) foe.vx = Math.sign(foe.x - P.x) * 150;
      api.number(wx, wy - 14, 'BOUNCED OFF', STONE.rune); api.hitstop(0.08); api.ringAt(wx, wy + 6, 16, STONE.rune, 0.3); gainTremor(GEO.tremor.perfect); api.noteParry && api.noteParry(); }
    else { api.number(wx, wy - 14, 'THE WALL TAKES IT', STONE.hi); gainTremor(GEO.tremor.wall); }
    api.SFX.geoBounce(); api.sparks(wx, wy, -Math.sign(wx - P.x) || 1, 6); api.shakeCam(2);
    if (!perfect && --w.hp <= 0) crumble(w, 'broken');
    return 'blocked';
  }
  /* THE THIRD BLOW (the spin) shatters any stone piece it hits and sprays it forward as shards */
  function shatter(p, dir) { crumble(p, 'shatter'); burstShards((p.x0 + p.x1) / 2, (p.y0 + p.y1) / 2, dir, 5); api.number((p.x0 + p.x1) / 2, p.y0 - 12, 'SHATTERED', STONE.hi); api.hitstop(0.05); api.shakeCam(4, dir * 2); }
  function burstShards(x, y, dir, n) {
    let d = dir; if (!d) { const f = foes().filter(e => !e.harmless).sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x))[0]; d = f ? Math.sign(f.x - x) || 1 : api.P.face; }
    for (let i = 0; i < n; i++) shards.push({ x, y: y + (i - n / 2) * 3, vx: d * (240 + i * 26), vy: -50 + i * 22, life: 0.55, hit: new Set() });
    api.SFX.geoShard && api.SFX.geoShard(); }
  /* ROLLING STONE (X early in a dash): she kicks a small stone ahead that bowls through little foes */
  function rollStone() { const P = api.P; rollers.push({ x: P.x + P.face * 12, y: P.y, vy: 0, dir: P.face, ...GEO.roll, bounces: 0, hit: new Set(), spin: 0, kind: 'roll' }); api.SFX.geoThud(); }
  /* THE QUAKE (a full TREMOR, tap C on the ground): every grounded foe knocked down, and loose rock falls - each told by a shadow */
  function quake() {
    const P = api.P, R = GEO.quakeR * (tal('wideQuake') ? GEO.quakeWideMul : 1);
    P.tremor = 0; P.blastT = 0.6; P.atk = -1; P.vx = 0; api.SFX.geoThud(); api.SFX.geoQuake && api.SFX.geoQuake(); api.shakeCam(10); api.zoomKick(1.08, 0.3);
    api.ringAt(P.x, P.y - 2, 60, STONE.rune, 0.5); api.dust(P.x - 20, P.y, 10); api.dust(P.x + 20, P.y, 10); api.number(P.x, P.y - 34, 'THE QUAKE', STONE.rune);
    for (const e of foes()) { if (e.harmless || e.turncoat || Math.abs(e.x - P.x) > R || Math.abs(e.y - P.y) > 48 || e.noGrav) continue;
      api.hurtAs('heavy', e, dmg(1.1), P.x, false); if (e.alive && !api.floorFoe(e, 1.6)) e.stagger = Math.max(e.stagger || 0, 0.6); }
    const n = tal('wideQuake') ? 10 : 7, aimed = foes().filter(e => !e.harmless && Math.abs(e.x - P.x) < R).slice(0, n);
    for (let i = 0; i < n; i++) { const x = aimed[i] ? aimed[i].x : P.x + (i % 2 ? 1 : -1) * (30 + Math.floor(i / 2) * (R / 4)); dropRock(x, 0.35 + i * 0.1, dmg(0.9), 0.9, aimed[i]); }
    api.trialEvent && api.trialEvent('meter');
  }
  /* a rock that falls from above onto the floor at x, told by a shadow that grows under it */
  function dropRock(x, delay, hit, knock, foe, big) {
    const tx = Math.floor(x / TS), P = api.P; const fy = floorRow(tx, Math.max(0, Math.floor((P.y - 120) / TS)), 16);
    const gy = fy === null ? P.y : fy * TS; falls.push({ x, gy, y: gy - 170, delay, max: delay, st: 'wait', hit, knock, foe, r: big ? 8 : 5 }); }

  /* ==== THE NINE (main.js geomancerKit calls these once it has checked the press, the wait and the wind) ==== */
  const kit = {
    /* STONE STEP: on the ground a pillar under her own feet lifts her; in the air a stone appears under her boots and she jumps off it */
    stoneStep() { const P = api.P; api.kitPose(P, 'gStep', 0.32); api.SFX.geoThud(); const tx = Math.floor(P.x / TS);
      if (P.ground) { const fy = Math.floor((P.y + 1) / TS); erupt(tx, fy, GEO.pillarH + (tal('tall') ? 1 : 0), 'step', { heroVy: GEO.stepVy, hurt: false }); return; }
      const ty = Math.floor((P.y + 2) / TS); const p = freeCell(tx, ty) ? place('step', [[tx, ty]], T().ONEWAY) : null;
      if (p) P.y = ty * TS; P.vy = GEO.stepVy; P.ground = false; P.coyote = 0; api.dust(P.x, P.y, 6); api.squash(0.8, 1.25, 0.1); },
    boulder() { const P = api.P; api.kitPose(P, 'gHeave', 0.34); rollers.push({ x: P.x + P.face * 14, y: P.y, vy: 0, dir: P.face, ...GEO.boulder, hit: new Set(), spin: 0, kind: 'boulder' }); api.SFX.geoRise(); api.shakeCam(3); },
    spikeRow() { const P = api.P; api.kitPose(P, 'gSpikes', 0.4); api.SFX.geoThud(); let fy0 = Math.floor((P.y + 1) / TS);
      for (let i = 0; i < 5; i++) { const x = P.x + P.face * (20 + 15 * i), tx = Math.floor(x / TS), fy = floorRow(tx, fy0 - 1, 2); if (fy === null || api.isSolid(tx, fy - 1)) break; fy0 = fy;
        spikes.push({ x, gy: fy * TS, t: -0.06 * i - 0.1, hit: new Set(), dmg: dmg(0.7, 'spikeRow') }); } },
    archway() { const P = api.P; api.kitPose(P, 'gArch', 0.5); api.SFX.geoRise(); const f = P.face, tx0 = Math.floor(P.x / TS), fy = Math.floor((P.y + 1) / TS);
      const ground = tx => api.isSolid(tx, fy) || api.isOneWay(api.tileAt(tx, fy)); let a = null, b = null;
      for (let k = 1; k <= 8; k++) { const tx = tx0 + f * k; if (a === null) { if (!ground(tx)) a = tx; } else if (ground(tx)) { b = tx - f; break; } }
      const cells = []; if (a !== null && b !== null) { for (let tx = a; tx !== b + f; tx += f) cells.push([tx, fy]); }
      else for (let k = -1; k <= 1; k++) cells.push([tx0 + k, fy - 4]);   /* no gap: an arch over her, a shelter */
      const p = place('arch', cells, T().SOLID); if (p) { api.dust((p.x0 + p.x1) / 2, p.y1, 8); api.number((p.x0 + p.x1) / 2, p.y0 - 12, a !== null && b !== null ? 'A BRIDGE' : 'AN ARCH', STONE.hi); } },
    lodestone() { const P = api.P; api.kitPose(P, 'gLode', 0.42); api.SFX.geoThud(); lode = { x: P.x + P.face * 44, y: P.y - 10, life: 4, bump: new Map() }; },
    entomb() { const P = api.P; api.kitPose(P, 'gTomb', 0.36); api.SFX.geoThud();
      const e = foes().filter(q => !q.harmless && !q.turncoat && (q.x - P.x) * P.face > -6 && Math.abs(q.x - P.x) < 72 && Math.abs(q.y - P.y) < 40).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
      if (!e) { api.number(P.x + P.face * 30, P.y - 24, 'NOTHING TO SEAL', '#9aa39a'); return; }
      if (api.lcBig(e)) { e.disarmOpenT = api.time + 1.5; e.stagger = Math.max(e.stagger || 0, 0.4); api.number(e.x, e.y - (e.h || 16) - 20, 'OPENED UP', STONE.rune); api.SFX.geoBounce(); return; }
      e.frozen = 3; e.stagger = Math.max(e.stagger || 0, 3); e.vx = 0; e.geoTomb = { t: 3, cracks: 0 }; api.SFX.geoRise(); api.number(e.x, e.y - (e.h || 16) - 20, 'ENTOMBED', STONE.hi); },
    faultLine() { const P = api.P; api.kitPose(P, 'gFault', 0.45); api.SFX.geoQuake(); api.shakeCam(5); faults.push({ x0: P.x + P.face * 8, dir: P.face, len: 0, max: 170, gy: Math.floor((P.y + 1) / TS) * TS, hit: new Set(), life: 0.9 }); },
    golem() { const P = api.P; api.kitPose(P, 'gGolem', 0.5); api.SFX.geoRise(); golem = { x: P.x + P.face * 22, y: P.y, vy: 0, face: P.face, life: 10, atkT: 0.4, swing: 0, rise: 0 }; api.dust(golem.x, golem.y, 8); },
    avalanche() { const P = api.P; api.kitPose(P, 'gAval', 0.6); api.SFX.geoQuake(); api.shakeCam(6); P.atk = -1;
      const aimed = foes().filter(e => !e.harmless && !e.turncoat && Math.abs(e.x - P.x) < 190 && Math.abs(e.y - P.y) < 120).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x)).slice(0, 6);
      const xs = aimed.map(e => e.x); for (let k = 0; xs.length < 10 && k < 20; k++) { const x = P.x + (k % 2 ? 1 : -1) * (24 + Math.floor(k / 2) * 36); if (!xs.some(q => Math.abs(q - x) < 18)) xs.push(x); }
      xs.forEach((x, i) => dropRock(x, 0.55 + i * 0.1, dmg(0.6, 'avalanche'), 1.2, aimed[i] || null, true)); },
  };
  /* ENTOMB: a blow on the tomb cracks it and lands half as hard again; the third crack breaks it open (hurtEnemy asks) */
  function tombHit(e, d) { const tb = e.geoTomb; if (!tb) return d; tb.cracks++; api.sparks(e.x, e.y - (e.h || 16) / 2, 0, 5);
    if (tb.cracks >= 3) { e.geoTomb = null; e.frozen = 0; e.stagger = Math.min(e.stagger || 0, 0.3); api.burst(e.x, e.y - (e.h || 16) / 2, 16, [STONE.base, STONE.hi, STONE.lo], 90, 0.6); api.SFX.geoCrumble(); api.number(e.x, e.y - (e.h || 16) - 20, 'BROKEN OPEN', STONE.rune); }
    return Math.round(d * 1.5); }

  /* ==== EACH FRAME ==== */
  function update(dt) {
    const P = api.P, g = grid();
    /* the grid changed under us (a new level, a reload): what stood in the old one is gone with it (RULE 5) */
    if (pieces.some(p => p.grid !== g)) pieces = pieces.filter(p => p.grid === g);
    for (const p of [...pieces]) { p.age += dt;
      if (p.age >= p.life) { crumble(p, 'time'); continue; }   /* RULE 2 */
      const bs = bodies(); if (p.cells.some(c => bs.some(b => api.overlap(cellBox(c.tx, c.ty), b)) && p.tile !== T().ONEWAY)) crumble(p, 'body');   /* RULE 4 */ }
    /* the wall and a shot: a wall raised on the beat throws it back (STONEFACE); anything else is stopped in the stone */
    for (const s of api.seeds) { if (s.dead || s.reflected) continue; const w = pieces.find(p => p.kind === 'wall' && s.x > p.x0 - 3 && s.x < p.x1 + 3 && s.y > p.y0 - 3 && s.y < p.y1 + 3); if (!w) continue;
      if (tal('returnFire') && api.time - w.born < 0.5) { api.reflectSeed(s); api.number((w.x0 + w.x1) / 2, w.y0 - 14, 'THROWN BACK', STONE.rune); }
      else { s.dead = true; api.sparks(s.x, s.y, -Math.sign(s.vx) || 1, 4); } gainTremor(GEO.tremor.shot); }
    /* THE THIRD BLOW: the spin shatters what it touches */
    if (P.atk >= 0.04 && P.atk < 0.2 && P.heavySwing && !P.heavy && pieces.length) { const b = api.attackBox(); if (b) for (const p of [...pieces]) if (api.overlap(b, { l: p.x0, r: p.x1, t: p.y0, b: p.y1 })) shatter(p, P.face); }
    /* a foe a pillar threw lands - THROWN DOWN makes it land hard */
    for (const e of foes()) if (e.geoAirT && api.time - e.geoAirT > 0.2 && (e.vy || 0) >= 0 && api.isSolid(Math.floor(e.x / TS), Math.floor((e.y + 2) / TS))) { e.geoAirT = 0;
      if (tal('hardLand')) { api.hurtAs('heavy', e, dmg(0.8), e.x, false); if (e.alive) api.floorFoe(e, 0.9); api.dust(e.x, e.y, 8); api.shakeCam(3); api.number(e.x, e.y - (e.h || 16) - 14, 'THROWN DOWN', STONE.rune); } }
    for (const e of foes()) if (e.geoTomb) { e.geoTomb.t -= dt; e.vx = 0; if (e.geoTomb.t <= 0 || !(e.frozen > 0)) { e.geoTomb = null; api.burst(e.x, e.y - (e.h || 16) / 2, 10, [STONE.base, STONE.lo], 60, 0.5); } }
    /* the rolling stones and the boulder */
    for (const r of rollers) { r.life -= dt; r.spin += r.dir * dt * r.sp / r.r;
      const nx = r.x + r.dir * r.sp * dt, ahead = Math.floor((nx + r.dir * r.r) / TS), row = Math.floor((r.y - r.r) / TS);
      if (api.isSolid(ahead, row)) { if (r.bounces > 0) { r.bounces--; r.dir = -r.dir; api.SFX.geoThud(); api.dust(r.x, r.y, 4); } else { r.life = 0; } }
      else r.x = nx;
      const under = Math.floor((r.y + 1) / TS), tx = Math.floor(r.x / TS); if (!api.isSolid(tx, under) && !api.isOneWay(api.tileAt(tx, under))) { r.vy = Math.min(500, r.vy + 900 * dt); r.y += r.vy * dt; if (r.y > api.LH * TS) r.life = 0; }
      else { r.vy = 0; r.y = under * TS; }
      for (const e of foes()) { if (e.harmless || e.turncoat || r.hit.has(e)) continue; const b = api.box(e); if (!api.overlap({ l: r.x - r.r, r: r.x + r.r, t: r.y - 2 * r.r, b: r.y }, b)) continue;
        r.hit.add(e); api.hurtAs('heavy', e, dmg(r.dmg, r.kind === 'boulder' ? 'boulder' : null), r.x - r.dir * 10, false); api.sparks(e.x, e.y - (e.h || 16) / 2, r.dir, 6); api.hitstop(0.03);
        if (e.alive && liftable(e)) { if (api.floorFoe(e, r.kind === 'boulder' ? 1.2 : 0.8)) api.number(e.x, e.y - (e.h || 16) - 14, 'BOWLED OVER', STONE.hi); }
        else { r.life = 0; api.shakeCam(3); } }
      if (r.life <= 0) api.burst(r.x, r.y - r.r, 10, [STONE.base, STONE.hi, STONE.lo], 70, 0.5); }
    rollers = rollers.filter(r => r.life > 0);
    for (const s of shards) { s.life -= dt; s.vy += 300 * dt; s.x += s.vx * dt; s.y += s.vy * dt; if (api.isSolid(Math.floor(s.x / TS), Math.floor(s.y / TS))) s.life = 0;
      for (const e of foes()) { if (s.life <= 0 || e.harmless || e.turncoat || s.hit.has(e)) continue; if (!api.overlap({ l: s.x - 2, r: s.x + 2, t: s.y - 2, b: s.y + 2 }, api.box(e))) continue;
        s.hit.add(e); api.hurtAs('shot', e, dmg(0.6), s.x - Math.sign(s.vx) * 10, false); s.life = 0; api.sparks(s.x, s.y, Math.sign(s.vx), 3); } }
    shards = shards.filter(s => s.life > 0);
    for (const f of falls) { if (f.st === 'wait') { f.delay -= dt; if (f.foe && f.foe.alive) f.x += (f.foe.x - f.x) * Math.min(1, dt * 10); if (f.delay <= 0) f.st = 'fall'; continue; }
      if (f.st === 'fall') { f.y += 560 * dt; if (f.y >= f.gy) { f.y = f.gy; f.st = 'done'; f.life = 0.4; api.dust(f.x, f.gy, 6); api.shakeCam(2); api.SFX.geoThud();
          for (const e of foes()) { if (e.harmless || e.turncoat || Math.abs(e.x - f.x) > (e.w || 12) / 2 + f.r + 2 || Math.abs(e.y - f.gy) > 30) continue;
            api.hurtAs('heavy', e, api.lcBig(e) ? Math.round(f.hit * 0.6) : f.hit, f.x, false); if (e.alive) api.floorFoe(e, f.knock); } } }
      else f.life -= dt; }
    falls = falls.filter(f => f.st !== 'done' || f.life > 0);
    for (const s of spikes) { const was = s.t; s.t += dt;
      if (was < 0 && s.t >= 0) { api.dust(s.x, s.gy, 4); api.SFX.geoShard();
        for (const e of foes()) { if (e.harmless || e.turncoat || s.hit.has(e) || Math.abs(e.x - s.x) > (e.w || 12) / 2 + 6 || e.y < s.gy - 30 || e.y - (e.h || 16) > s.gy) continue;
          s.hit.add(e); api.hurtAs('heavy', e, s.dmg, s.x, false); if (e.alive) { e.stagger = Math.max(e.stagger || 0, api.lcBig(e) ? 0.3 : 0.9); e.vx = 0; if (!api.lcBig(e)) api.number(e.x, e.y - (e.h || 16) - 14, 'HELD', STONE.hi); } } } }
    spikes = spikes.filter(s => s.t < 0.6);
    for (const fl of faults) { fl.life -= dt; const was = fl.len; fl.len = Math.min(fl.max, fl.len + 380 * dt);
      const tipX = fl.x0 + fl.dir * fl.len, ttx = Math.floor(tipX / TS), fy = Math.floor(fl.gy / TS); if (api.isSolid(ttx, fy - 1) || !(api.isSolid(ttx, fy) || api.isOneWay(api.tileAt(ttx, fy)))) fl.max = Math.min(fl.max, fl.len);
      if (fl.len > was && Math.random() < 0.6) api.dust(tipX, fl.gy, 2);
      for (const e of foes()) { if (e.harmless || e.turncoat || fl.hit.has(e) || Math.abs(e.y - fl.gy) > 14) continue; const d = (e.x - fl.x0) * fl.dir; if (d < -6 || d > fl.len) continue;
        fl.hit.add(e); api.hurtAs('heavy', e, dmg(0.8, 'faultLine'), e.x - fl.dir * 8, false);
        if (e.alive && liftable(e)) { e.vy = -320; e.geoAirT = api.time; e.stagger = Math.max(e.stagger || 0, 0.8); api.number(e.x, e.y - (e.h || 16) - 14, 'THROWN UP', STONE.hi); } else if (e.alive) e.stagger = Math.max(e.stagger || 0, 0.4); } }
    faults = faults.filter(f => f.life > 0);
    if (lode) { lode.life -= dt;
      for (const e of foes()) { if (e.harmless || e.turncoat || api.lcBig(e) || e.pinned > 0) continue; const dx = lode.x - e.x, ad = Math.abs(dx); if (ad > 130 || ad < 4 || Math.abs(e.y - lode.y) > 60) continue;
        const heavy = !!(e.guardT > 0 || e.shield || e.armour || /shield|armour|guard|helm|knight/.test(e.t));
        api.moveBody(e, Math.sign(dx) * Math.min(ad - 3, (heavy ? 130 : 60) * dt), 0, false);
        if (ad < 10) { const last = lode.bump.get(e) || -9; if (api.time - last > 0.5 && foes().some(q => q !== e && Math.abs(q.x - lode.x) < 10 && Math.abs(q.y - e.y) < 20)) { lode.bump.set(e, api.time); api.hurtAs('heavy', e, dmg(0.5, 'lodestone'), lode.x, false); api.sparks(e.x, e.y - 8, 0, 4); } } }
      for (const s of api.seeds) { if (s.dead || s.reflected) continue; const dx = lode.x - s.x, dy = lode.y - s.y, d = Math.hypot(dx, dy); if (d > 100) continue;
        const sp = Math.max(120, Math.hypot(s.vx, s.vy)); s.vx += (dx / (d || 1) * sp - s.vx) * Math.min(1, dt * 6); s.vy += (dy / (d || 1) * sp - s.vy) * Math.min(1, dt * 6); if (d < 8) { s.dead = true; api.sparks(s.x, s.y, 0, 3); } }
      if (lode.life <= 0) { api.burst(lode.x, lode.y, 10, [STONE.base, STONE.rune], 60, 0.5); lode = null; } }
    if (golem) { const G = golem; G.life -= dt; G.rise = Math.min(1, G.rise + dt * 4); G.atkT -= dt; G.swing = Math.max(0, G.swing - dt);
      const tgt = foes().filter(e => !e.harmless && !e.turncoat && Math.abs(e.x - G.x) < 200 && Math.abs(e.y - G.y) < 60).sort((a, b) => Math.abs(a.x - G.x) - Math.abs(b.x - G.x))[0];
      if (tgt) { G.face = Math.sign(tgt.x - G.x) || G.face; const ad = Math.abs(tgt.x - G.x) - (tgt.w || 12) / 2;
        if (ad > 10) { const nx = G.x + G.face * 62 * dt, tx = Math.floor((nx + G.face * 6) / TS); if (!api.isSolid(tx, Math.floor((G.y - 8) / TS))) G.x = nx; }
        else if (G.atkT <= 0) { G.atkT = 1.0; G.swing = 0.2; api.hurtAs('heavy', tgt, dmg(0.6, 'golem'), G.x, false); if (tgt.alive && !api.lcBig(tgt)) tgt.stagger = Math.max(tgt.stagger || 0, 0.4); api.sparks(tgt.x, tgt.y - 8, G.face, 6); api.SFX.geoThud(); } }
      const under = Math.floor((G.y + 1) / TS), gx = Math.floor(G.x / TS); if (!api.isSolid(gx, under) && !api.isOneWay(api.tileAt(gx, under))) { G.vy = Math.min(500, G.vy + 900 * dt); G.y += G.vy * dt; if (G.y > api.LH * TS) G.life = 0; } else { G.vy = 0; G.y = under * TS; }
      if (G.life <= 0) { api.burst(G.x, G.y - 10, 14, [STONE.base, STONE.hi, STONE.moss], 70, 0.6); api.SFX.geoCrumble(); golem = null; } }
  }
  function clear() { for (const p of [...pieces]) crumble(p, 'silent'); pieces = []; rollers = []; shards = []; falls = []; spikes = []; faults = []; lode = null; golem = null; }

  /* ==== DRAWN IN THE WORLD. A piece is rough grey stone with moss on its crown and a faint amber rune; it grinds up out of the
     ground over GEO.rise, and for its last GEO.crack seconds it CRACKS - dark lines spreading through it, and a shiver at the end. */
  function drawStoneCell(g, x, y, top, bot, seed, crackK, rune) {
    g.fillStyle = STONE.base; g.fillRect(x, y, TS, TS);
    g.fillStyle = STONE.lo; g.fillRect(x, y, 2, TS); g.fillRect(x + 7 + (seed % 3), y + 5, 1, 6);
    g.fillStyle = STONE.dark; g.fillRect(x + TS - 1, y, 1, TS); if (bot) g.fillRect(x, y + TS - 1, TS, 1);
    g.fillStyle = STONE.hi; g.fillRect(x + 2, y + 1, 5, 1); g.fillRect(x + 10, y + 8 + (seed % 2), 4, 1);
    if (top) { g.fillStyle = STONE.hi; g.fillRect(x, y, TS, 2); g.fillStyle = STONE.moss; g.fillRect(x + 1 + (seed % 4), y - 1, 4, 2); g.fillRect(x + 9, y, 3, 1); g.fillStyle = STONE.moss2; g.fillRect(x + 11, y - 1, 2, 1); }
    if (rune) { g.globalAlpha = 0.45 + 0.25 * Math.sin(api.time * 4 + seed); g.fillStyle = STONE.rune; g.fillRect(x + 7, y + 6, 1, 4); g.fillRect(x + 6, y + 7, 3, 1); g.globalAlpha = 1; }
    if (crackK > 0) { g.fillStyle = STONE.crack; const n = Math.ceil(crackK * 6);
      for (let k = 0; k < n; k++) { const cx = x + 3 + ((seed * 7 + k * 5) % 10), cy = y + 2 + ((seed * 3 + k * 4) % 12); g.fillRect(cx, cy, 1, 3); g.fillRect(cx + 1, cy + 2, 2, 1); } }
  }
  function draw(g, cx, cy) { g.save(); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; try { draw0(g, cx, cy); } finally { g.restore(); } }   /* whatever alpha the hero's draw left behind is not the stone's */
  function draw0(g, cx, cy) {
    const P = api.P;
    for (const p of pieces) { const k = Math.min(1, p.age / GEO.rise), left = p.life - p.age, crackK = left < GEO.crack ? 1 - left / GEO.crack : 0;
      const jit = left < 0.25 ? (Math.floor(api.time * 40) % 2 ? 1 : -1) : 0, rise = Math.round((1 - k) * (p.y1 - p.y0)), set = new Set(p.cells.map(c => c.i));
      g.save(); g.beginPath(); g.rect(Math.round(p.x0 - cx) - 2, Math.round(p.y0 - cy) - 4, p.x1 - p.x0 + 4, p.y1 - p.y0 + 4); g.clip();
      for (const c of p.cells) { const x = Math.round(c.tx * TS - cx) + jit, y = Math.round(c.ty * TS - cy) + rise;
        const top = !set.has(c.i - api.LW), bot = !set.has(c.i + api.LW);
        if (p.tile === T().ONEWAY) { g.fillStyle = STONE.base; g.fillRect(x, y, TS, 6); g.fillStyle = STONE.hi; g.fillRect(x, y, TS, 2); g.fillStyle = STONE.dark; g.fillRect(x, y + 5, TS, 1); g.fillStyle = STONE.moss; g.fillRect(x + 3, y - 1, 4, 1);
          if (crackK > 0) { g.fillStyle = STONE.crack; g.fillRect(x + 5, y + 1, 1, 4); g.fillRect(x + 10, y + 2, 1, 3); } continue; }
        drawStoneCell(g, x, y, top, bot, c.i % 11, crackK, top); }
      g.restore();
      if (p.bulwarked) { g.globalAlpha = 0.5; g.fillStyle = STONE.rune; g.fillRect(Math.round(p.x0 - cx), Math.round(p.y0 - cy) - 2, p.x1 - p.x0, 1); g.globalAlpha = 1; } }
    /* UPHEAVAL, TOLD: while she winds it, where it will come up is marked on the floor - further the longer she holds */
    if (P.charge > 0 && api.isGeo()) { const w = Math.min(1, P.charge / api.heavyWind()), x = upheavalX(w), tx = Math.floor(x / TS), fy = floorRow(tx, Math.floor((P.y - 1) / TS), 3);
      if (fy !== null) { const sx = tx * TS - cx, sy = fy * TS - cy; g.globalAlpha = 0.45 + 0.35 * Math.sin(api.time * 18); g.fillStyle = STONE.rune; g.fillRect(sx + 2, sy - 1, 12, 1); g.fillRect(sx + 7, sy - 4, 2, 3); g.globalAlpha = 1; } }
    /* SPUR (UP+X): a stone spike jutting up in front of her while the rising blow is live */
    if (api.isGeo() && P.swingKind === 'rise' && P.atk >= 0) { const k = P.atk < 0.06 ? P.atk / 0.06 : P.atk < 0.2 ? 1 : Math.max(0, 1 - (P.atk - 0.2) / 0.1), h = Math.round(34 * k);
      if (h > 0) { const x = Math.round(P.x + P.face * 16 - cx), y = Math.round(P.y - cy); drawSpike(g, x, y, h, 7); } }
    for (const s of spikes) { if (s.t < 0) { g.globalAlpha = 0.6; g.fillStyle = STONE.dark; g.fillRect(Math.round(s.x - cx) - 3, Math.round(s.gy - cy) - 1, 7, 1); g.globalAlpha = 1; continue; }
      const k = s.t < 0.07 ? s.t / 0.07 : s.t < 0.4 ? 1 : Math.max(0, 1 - (s.t - 0.4) / 0.2); drawSpike(g, Math.round(s.x - cx), Math.round(s.gy - cy), Math.round(26 * k), 6); }
    for (const fl of faults) { const x0 = Math.round(fl.x0 - cx), y = Math.round(fl.gy - cy), n = Math.floor(fl.len / 6);
      g.fillStyle = STONE.crack; for (let i = 0; i < n; i++) { const x = x0 + fl.dir * i * 6; g.fillRect(Math.min(x, x + fl.dir * 6), y - 1 + (i % 2), 6, 1);
        const lift = Math.max(0, Math.round(5 * Math.sin((i * 6 / Math.max(1, fl.len)) * Math.PI) * Math.min(1, fl.life * 2))); if (lift) { g.fillStyle = STONE.base; g.fillRect(x - 2, y - lift, 4, lift); g.fillStyle = STONE.crack; } } }
    for (const r of rollers) drawBoulder(g, r.x - cx, r.y - r.r - cy, r.r, r.spin);
    for (const s of shards) { g.fillStyle = STONE.hi; g.fillRect(Math.round(s.x - cx) - 1, Math.round(s.y - cy) - 1, 3, 2); g.fillStyle = STONE.lo; g.fillRect(Math.round(s.x - cx), Math.round(s.y - cy) + 1, 2, 1); }
    for (const f of falls) { const x = Math.round(f.x - cx), gy = Math.round(f.gy - cy);
      if (f.st !== 'done') { const near = f.st === 'wait' ? 0.35 * (1 - f.delay / Math.max(0.01, f.max)) : 0.35 + 0.65 * Math.min(1, 1 - (f.gy - f.y) / 170); const w = Math.round(4 + f.r * 1.4 * near);
        g.globalAlpha = 0.25 + 0.4 * near; g.fillStyle = '#000000'; g.beginPath(); g.ellipse(x, gy - 1, w, 2, 0, 0, 7); g.fill(); g.globalAlpha = 1; }   /* THE SHADOW grows as it comes */
      if (f.st === 'fall') drawBoulder(g, x, Math.round(f.y - cy) - f.r, f.r, f.y * 0.05);
      if (f.st === 'done') { g.globalAlpha = Math.min(1, f.life / 0.3); drawBoulder(g, x, gy - f.r, f.r, 0); g.globalAlpha = 1; } }
    for (const e of foes()) if (e.geoTomb) { const b = api.box(e), x = Math.round(b.l - cx) - 2, y = Math.round(b.t - cy) - 2, w = Math.round(b.r - b.l) + 4, h = Math.round(b.b - b.t) + 3;
      g.globalAlpha = 0.9; g.fillStyle = STONE.base; g.fillRect(x, y, w, h); g.fillStyle = STONE.hi; g.fillRect(x, y, w, 2); g.fillStyle = STONE.lo; g.fillRect(x, y, 2, h); g.fillStyle = STONE.dark; g.fillRect(x + w - 1, y, 1, h);
      g.fillStyle = STONE.moss; g.fillRect(x + 2, y - 1, 4, 1); g.fillStyle = STONE.crack; for (let k = 0; k < e.geoTomb.cracks * 3; k++) g.fillRect(x + 2 + (k * 5) % Math.max(3, w - 4), y + 3 + (k * 7) % Math.max(3, h - 5), 1, 3); g.globalAlpha = 1; }
    if (lode) { const x = Math.round(lode.x - cx), y = Math.round(lode.y - cy), pu = 0.5 + 0.5 * Math.sin(api.time * 10);
      g.globalAlpha = 0.3 * pu; g.strokeStyle = STONE.rune; g.lineWidth = 1; g.beginPath(); g.arc(x, y, 10 + pu * 16, 0, 7); g.stroke(); g.globalAlpha = 1; drawBoulder(g, x, y, 5, 0); g.fillStyle = STONE.rune; g.fillRect(x - 1, y - 1, 2, 2); }
    if (golem) { const G = golem, x = Math.round(G.x - cx), y = Math.round(G.y - cy), h = Math.round(20 * G.rise), f = G.face, sw = G.swing > 0 ? 4 : 0;
      g.fillStyle = STONE.lo; g.fillRect(x - 6, y - h, 12, h); g.fillStyle = STONE.base; g.fillRect(x - 5, y - h, 10, h - 1); g.fillStyle = STONE.hi; g.fillRect(x - 5, y - h, 10, 2);
      if (h > 14) { g.fillStyle = STONE.moss; g.fillRect(x - 4, y - h - 1, 5, 2); g.fillStyle = STONE.rune; g.fillRect(x + f * 2, y - h + 5, 2, 1); g.fillStyle = STONE.lo; g.fillRect(x + f * (6 + sw) - 2, y - h + 8, 5, 5); g.fillStyle = STONE.base; g.fillRect(x - 3, y - 4, 2, 4); g.fillRect(x + 1, y - 4, 2, 4); } }
  }
  function drawSpike(g, x, y, h, w) { for (let k = 0; k < h; k++) { const ww = Math.max(1, Math.round(w * (1 - k / h))); g.fillStyle = k > h - 3 ? STONE.hi : k % 5 === 0 ? STONE.lo : STONE.base; g.fillRect(x - Math.floor(ww / 2), y - k - 1, ww, 1); } }
  function drawBoulder(g, x, y, r, spin) { x = Math.round(x); y = Math.round(y);
    g.fillStyle = STONE.dark; g.beginPath(); g.arc(x, y, r + 1, 0, 7); g.fill(); g.fillStyle = STONE.base; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    g.fillStyle = STONE.hi; g.fillRect(x - Math.round(r / 2), y - r + 1, Math.max(2, r - 1), 1);
    const a = spin || 0; g.fillStyle = STONE.lo; g.fillRect(Math.round(x + Math.cos(a) * r * 0.5), Math.round(y + Math.sin(a) * r * 0.5), 2, 2); g.fillStyle = STONE.moss; g.fillRect(Math.round(x + Math.cos(a + 2.5) * r * 0.6), Math.round(y + Math.sin(a + 2.5) * r * 0.6), 2, 1); }

  return { update, draw, clear, upheaval, raiseWall, wallTakes, rollStone, quake, gainTremor, tombHit, kit,
    pieces: () => pieces, rollers: () => rollers, falls: () => falls, spikes: () => spikes, faults: () => faults, lode: () => lode, golem: () => golem, freeCell, erupt, place, crumble };
}
