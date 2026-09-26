// geomancer.js — THE GEOMANCER'S KIT (docs/briefs/geomancer.md). The Knight absorbs a blow, the Warden turns it at range, and the
// Geomancer BUILDS SOMETHING IN ITS WAY and then uses what she built. Her magic changes the level itself, so everything here that
// stands is written into the level's own grid for a few seconds - which is why the step is a real platform, why the wall really
// stops an arrow (a shot dies in rock, main.js seeds) and why a foe cannot walk through either.
//
// THE RULES THIS FILE KEEPS (and tools/geomancer.mjs proves, red first):
//   1. ROCK ONLY GOES INTO AIR. A cell is written only if it is empty level (T.AIR) with no living body - her or a foe - in it,
//      and it gives back exactly what was there. A body that is where a pillar comes up is LIFTED onto its top (if there is room
//      over it), never buried; a body with no room over it stops the pillar short.
//   2. NOTHING STANDS FOR LONG. Every piece crumbles on its own (GEO.life, ~4 s; the archway 6 s), and it VISIBLY CRACKS for its
//      last second first (C1: a thing about to change is told). Her held X - FAULT LINE (round 3, 2026-09-24; it was UPHEAVAL, a
//      pillar) - writes no rock at all: it is a crack in the floor that hits, and a spike at the end of it that is drawn, not built.
//   3. THE CAP. At most three pieces (four with THE FOURTH STONE) stand at once: raising another crumbles the oldest.
//   4. NEVER A TRAP. Each frame, a piece with a living body inside it (a foe spawned or thrown there, a respawn) crumbles at once.
//   5. A level that is left or reloaded takes its pieces with it: a piece only ever restores the grid it was written into.
// The kit is bound to main.js through `api` (makeGeomancer) - main.js owns the world, the input and the tal() reads; this owns
// what she makes in it.
export const GEO = {
  cap: 3, life: 4, lifeLong: 6, archLife: 6, crack: 1.0, rise: 0.12,
  pillarH: 2, wallH: 2, perfect: 0.2, wallHp: 3,
  /* FAULT LINE (her held X from round 3, Daniel, 2026-09-24 - it replaces UPHEAVAL). Upheaval bet on a SPOT and the foe walked off it;
     this is a LINE. She slams the stave and a crack races along the floor ahead of her (speed px/s), hitting everything along it once.
     THE CHARGE SETS THE LENGTH AND THE DAMAGE: len0 + lenK * wound px (22 at the quickest release, which covers a foe touching her -
     and that one is hit AT ONCE, in the release frame - to 160 at a full wind), at mul0 + mulK * wound of her blow. A FULL wind
     (fullAt) ends in a ROCK SPIKE at the tip that launches what it hits (spikeMul, spikeVy). It FOLLOWS THE FLOOR: it stops at the
     first gap (no floor under it) and at the first wall (rock at her feet' height), so it never crosses a pit and never goes up
     through rock (A12). While she winds, the line it will take is drawn on the floor (C1). Her wind stays the longer 0.5 s.
     THE DAMAGE IS AT THE END (Daniel, 2026-09-25: it was spammable - 1.0-1.4x to everything along it, 0.6x more from the spike): the
     crack is half that (mul0/mulK), and the full wind's spike is the big hit (spikeMul), so a foe at its tip takes about what it did
     and a crowd along it takes half. */
  wind: 0.5,
  fault: { len0: 22, lenK: 138, speed: 520, mul0: 0.5, mulK: 0.2, fullAt: 0.98, spikeMul: 1.2, spikeVy: -360, spikeVyTall: -440, linger: 0.35 },
  /* THE RUNE-WARD (her C from round 3, Daniel, 2026-09-24 - it replaces the two-hit ROCK SHIELD and THE MEND). The Knight's guard,
     SIDEGRADED: the same rules (hold to block, YELLOW blocked, RED breaks through, a blocked blow costs wind, out of wind is a
     GUARD BREAK at half the blow), but a projected slab of rune-cut stone, taller than she is and lipped over her head. Against his:
     `raise` - it takes a tenth of a second to rise (his is up the frame C goes down), and the PERFECT window (`perfect`) opens only
     once it has risen, so her beat is earlier (0.10-0.17 s after C, his 0-0.11) and tighter (0.07 s to his 0.11); `hitSt` - a blocked blow costs 20 wind (his 14); she is ROOTED
     while it stands (the stave planted: she can turn, not walk - he walks at guard pace); `holdSt` - holding it drains as his does
     once the perfect window has passed; no riposte and no wind back on a perfect guard. For that: it covers OVERHEAD, a bolt does not
     pierce it, a blow does not push her back, and a PERFECT guard throws a shot back the way it came and EMPOWERS her for `emp` s -
     her blows `empMul` as hard and TREMOR filling `empTremor` times as fast, the runes on her alight so it reads. `hold`: a tap
     keeps it up this long after it has risen (a tap on the beat is a guard). `lock`: after it breaks, how long before it will rise. */
  ward: { raise: 0.1, perfect: 0.07, hold: 0.15, hitSt: 20, holdSt: 19, lock: 0.6, emp: 3, empMul: 1.25, empTremor: 2 },
  tremor: { wall: 18, perfect: 28, launch: 14, shot: 6 },
  launchVy: -330, heroLaunchVy: -430, stepVy: -400,
  quakeR: 200, quakeWideMul: 1.5,
  roll: { sp: 230, r: 5, life: 1.0, dmg: 1.0 }, boulder: { sp: 190, r: 8, life: 3.2, dmg: 1.0, bounces: 2 },   /* (1.6 and a fresh hit on every bounce measured 120 at level 3 on the probe, four times Harrier's; each foe is hit ONCE now) */
};
const STONE = { base: '#7c7a6e', hi: '#a8a696', lo: '#5e5c54', dark: '#44423a', moss: '#6f9a4a', moss2: '#557a38', rune: '#e8a83a', crack: '#26241e' };
const EARTH = { base: '#6e4c30', hi: '#8c6844', lo: '#4c3420' };   /* the packed soil her ward is bound in (the earth shield) */

export function makeGeomancer(api) {
  let pieces = [], rollers = [], shards = [], falls = [], spikes = [], faults = [], golem = null, spurFx = null, shieldDrawn = false, spunAt = -9;   /* (spunAt: when the draw last set a stone round her geode - tools/geomancer.mjs `staff`) */   /* (shieldDrawn: whether the last draw put her shield on screen - tools/geomancer.mjs `drawn`) */
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
    const p = { kind, tile, grid: g, born: t, age: 0, life: lifeOf(kind), crack: GEO.crack, capped: true, hp: GEO.wallHp, cells: [],
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
    const P = api.P, launched = []; let struck = 0;
    if (!o.noHero && !P.dead && api.overlap(col, heroBox()) && roomAbove(P, top)) { P.y = top; P.vy = o.heroVy || GEO.heroLaunchVy; P.ground = false; P.coyote = 0; P.onMover = null; }
    for (const e of foes()) { if (e.harmless) continue; const eb = api.box(e), inCol = api.overlap(col, eb);
      if (!inCol && !api.overlap({ l: col.l - 8, r: col.r + 8, t: col.t, b: col.b + 2 }, eb)) continue;   /* THE GROUND HEAVES a hand either side: what stands beside the column is hit, not lifted */
      if (inCol && liftable(e) && roomAbove(e, top)) { e.y = top; e.vy = GEO.launchVy; e.geoAirT = api.time; e.stagger = Math.max(e.stagger || 0, 0.5); launched.push(e); }
      if (!e.turncoat && o.hurt !== false) { api.hurtAs('heavy', e, dmg(o.mul || 1.3, o.k), P.x, false); api.sparks(e.x, e.y - (e.h || 16) / 2, 0, 5); struck++; } }
    const cells = []; for (let k = 1; k <= h; k++) { if (!freeCell(tx, fy - k)) break; cells.push([tx, fy - k]); }   /* bottom up: stop at the first that is not air, or has a body in it */
    const p = cells.length ? place(kind, cells, T().SOLID) : null;
    api.dust(tx * TS + 8, fy * TS, 8); api.shakeCam(3); api.SFX.geoRise && api.SFX.geoRise();
    if (launched.length) { gainTremor(GEO.tremor.launch * launched.length); api.number(tx * TS + 8, top - 26, 'LAUNCHED', STONE.rune); }
    return { piece: p, launched, struck };
  }
  function gainTremor(n) { const P = api.P, was = (P.tremor || 0) >= 100; P.tremor = Math.min(100, (P.tremor || 0) + n * (tal('rumble') ? 1.5 : 1) * (empowered() ? GEO.ward.empTremor : 1)); if (!was && P.tremor >= 100) api.meterFull(); }
  const empowered = () => (api.P.geoEmpT || 0) > api.time;   /* EMPOWERED: a perfect ward, for GEO.ward.emp seconds (main.js swordDmg reads it too) */

  /* ==== THE BASE MOVES ==== */
  /* FAULT LINE (hold X, from round 3): a LINE, not a spot. The stave slammed down, and a crack races along the floor ahead of her,
     hitting everything along its length once; the charge sets its length and its damage, and a full one ends in a rock spike that
     launches. No rock is written anywhere (RULE 1 has nothing to guard): the spike is drawn, and gone in 0.6 s. */
  const FL = GEO.fault;
  /* WHERE IT WILL RUN, for the blow and for the line drawn on the floor while she winds it (C1): the same answer both times. It walks
     the floor she stands on two pixels at a time and stops at the first GAP (no floor, solid or one-way, under it) or WALL (rock at her
     feet' height, one row up) - so it never crosses a pit and never climbs into rock (A12) */
  function faultPath(wound) {
    const P = api.P, f = P.face, w = Math.max(0, Math.min(1, wound)), want = FL.len0 + FL.lenK * w;
    const fy = floorRow(Math.floor(P.x / TS), Math.floor((P.y - 1) / TS), 1); if (fy === null) return null;
    let len = 0, stop = null;
    for (let d = 2; d <= want; d += 2) { const tx = Math.floor((P.x + f * d) / TS);
      if (api.isSolid(tx, fy - 1)) { stop = 'wall'; break; }
      if (!(api.isSolid(tx, fy) || api.isOneWay(api.tileAt(tx, fy)))) { stop = 'gap'; break; }
      len = d; }
    return { x0: P.x, dir: f, gy: fy * TS, len, want, full: w >= FL.fullAt, stop };
  }
  function faultHeavy(wound) {
    const P = api.P, w = Math.max(0, Math.min(1, wound)), a = faultPath(w);
    api.SFX.geoThud && api.SFX.geoThud(); api.dust(P.x + P.face * 8, P.y, 5);
    if (!a) { api.number(P.x + P.face * 20, P.y - 20, 'NO GROUND THERE', '#9aa39a'); return null; }
    const fl = { heavy: true, x0: a.x0, dir: a.dir, gy: a.gy, len: Math.min(a.len, FL.len0), max: a.len, spike: a.full, spiked: false, hit: new Set(), struck: 0, dmg: dmg(FL.mul0 + FL.mulK * w), life: a.len / FL.speed + FL.linger };
    faults.push(fl); api.shakeCam(a.full ? 4 : 2); api.SFX.geoShard && api.SFX.geoShard();
    faultHits(fl);   /* THE CONTACT: what is touching her is hit in the release frame, not a beat later */
    return fl;
  }
  /* EVERYTHING ALONG IT, ONCE: a foe standing on the floor the crack runs through, anywhere between her and its tip */
  function faultHits(fl) {
    const lo = fl.dir > 0 ? fl.x0 - 2 : fl.x0 - fl.len, hi = fl.dir > 0 ? fl.x0 + fl.len : fl.x0 + 2;
    for (const e of foes()) { if (e.harmless || e.turncoat || fl.hit.has(e)) continue; const b = api.box(e);
      if (b.r < lo || b.l > hi || e.y < fl.gy - 10 || b.t > fl.gy) continue;   /* on the floor it runs through (a flyer over it is missed) */
      fl.hit.add(e); fl.struck++; api.hurtAs('heavy', e, fl.dmg, fl.x0, false); api.sparks(e.x, e.y - (e.h || 16) / 2, fl.dir, 5);
      if (e.alive) e.stagger = Math.max(e.stagger || 0, api.lcBig(e) ? 0.15 : 0.35);
      if (fl.struck === 2) api.trialEvent && api.trialEvent('fault'); }   /* (her yard's station: two caught in one line) */
  }
  /* THE SPIKE at the end of a FULL charge: it juts up at the tip and launches what it hits (a boss, a flyer, a pinned thing is hit and staggered) */
  function faultSpike(fl) {
    fl.spiked = true; const x = fl.x0 + fl.dir * fl.max, launched = [];
    spikes.push({ x, gy: fl.gy, t: 0, hit: new Set(), dmg: 0, h: 34, w: 8 });   /* (t starts at 0, not below it: drawn, and the spike row's own hit never fires) */
    for (const e of foes()) { if (e.harmless || e.turncoat) continue; const b = api.box(e);
      if (Math.abs(e.x - x) > (e.w || 12) / 2 + 8 || e.y < fl.gy - 12 || b.t > fl.gy) continue;
      api.hurtAs('heavy', e, dmg(FL.spikeMul), x - fl.dir * 8, false); api.sparks(e.x, e.y - (e.h || 16) / 2, 0, 6);
      if (e.alive && liftable(e)) { e.vy = tal('tall') ? FL.spikeVyTall : FL.spikeVy; e.geoAirT = api.time; e.stagger = Math.max(e.stagger || 0, 0.6); launched.push(e); }
      else if (e.alive) e.stagger = Math.max(e.stagger || 0, 0.4); }
    api.dust(x, fl.gy, 8); api.shakeCam(3); api.SFX.geoRise && api.SFX.geoRise();
    if (launched.length) { gainTremor(GEO.tremor.launch * launched.length); api.number(x, fl.gy - 44, 'LAUNCHED', STONE.rune); }
  }
  /* RAISE WALL - her C until THE ROCK SHIELD replaced it, and from 2026-09-24 the bought STONE WALL (level 9, where LODESTONE was):
     a wall rises in the first column wholly in front of her. It stops a yellow blow and a shot, a blow on the beat bounces off it, and a
     red one smashes through (wallTakes). Held to THE CAP and the grid rules by tools/geomancer.mjs */
  function raiseWall() {
    const P = api.P, f = P.face, tx = f > 0 ? Math.ceil((P.x + P.w / 2) / TS) : Math.floor((P.x - P.w / 2) / TS) - 1;
    api.SFX.geoThud && api.SFX.geoThud(); api.kitPose(P, 'gWall', 0.34);
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
      api.number(wx, wy - 14, 'BOUNCED OFF', STONE.rune); api.hitstop(0.08); api.ringAt(wx, wy + 6, 16, STONE.rune, 0.3); gainTremor(GEO.tremor.perfect); api.noteParry && api.noteParry(); P.geoBeatT = api.time; }   /* (geoBeatT: her yard asks whether THIS blow bounced) */
    else { api.number(wx, wy - 14, 'THE WALL TAKES IT', STONE.hi); gainTremor(GEO.tremor.wall); }
    api.SFX.geoBounce(); api.sparks(wx, wy, -Math.sign(wx - P.x) || 1, 6); api.shakeCam(2);
    if (!perfect && --w.hp <= 0) crumble(w, 'broken');
    return 'blocked';
  }
  /* ==== THE RUNE-WARD (her C from round 3; docs/briefs/geomancer.md ROUND 3, 2). C goes down: the stave is planted and a slab of
     rune-cut stone rises in front of her - GEO.ward.raise to come up, taller than she is, its top lipped back over her head. While
     it stands she is ROOTED (she can turn on the planted stave, not walk), holding it drains wind as the Knight's does, and it takes
     YELLOW blows and shots from the front and from overhead for GEO.ward.hitSt wind each; out of wind it breaks (GUARD BREAK: half the
     blow finds her, as it does him). A RED blow BREAKS THROUGH it - the ward shatters and the blow goes on into her (red still means
     move; BULWARK halves it). Raised as a blow lands (within GEO.ward.perfect of rising) it is a PERFECT WARD: the blow bounces off,
     the attacker staggers, it costs nothing, a shot is thrown back the way it came - and she is EMPOWERED. No riposte: that is his. ==== */
  const WD = GEO.ward;
  const wardUp = () => { const P = api.P; return !!P.geoGuard && api.time - P.geoGuardAt >= WD.raise; };
  const wardPerfect = () => { const P = api.P, k = api.time - P.geoGuardAt - WD.raise; return k >= 0 && k < WD.perfect; };
  /* up while C is held (and for `hold` once it has risen, so a tap on the beat is a guard); `turn` is the way she is pressing, so she
     can turn on the planted stave; dt pays for holding it */
  function guard(want, can, dt = 0, turn = 0) { const P = api.P;
    if (!can || (P.geoWardLock || 0) > api.time || (!P.geoGuard && !(P.st > 0))) { if (P.geoGuard) P.geoGuard = false; return; }
    if (want && !P.geoGuard) { P.geoGuard = true; P.geoGuardAt = api.time; api.SFX.geoThud && api.SFX.geoThud(); api.dust(P.x + P.face * 8, P.y, 3); }   /* the stave planted: the thud */
    else if (P.geoGuard && !want && api.time - P.geoGuardAt >= WD.raise + WD.hold) P.geoGuard = false;
    if (!P.geoGuard) return;
    P.rootT = Math.max(P.rootT || 0, 0.05); P.vx = 0; if (turn) P.face = turn;   /* ROOTED: the stave is in the ground */
    if (wardUp() && !P.geoWardRose) { P.geoWardRose = true; api.SFX.geoRise && api.SFX.geoRise(); } else if (!wardUp()) P.geoWardRose = false;   /* (the grind of it coming up) */
    if (api.time - P.geoGuardAt > WD.raise + WD.perfect) { P.st -= WD.holdSt * dt; P.stDelay = Math.max(P.stDelay || 0, 0.5);   /* holding it costs, as his does: the beat itself is free */
      if (P.st <= 0) { P.st = 0; P.stFlash = 0.5; breakWard('TIRED', STONE.hi); } } }
  /* the ward's face in front of her and the lip over her head (for a shot it meets, and for the draw) */
  const wardBoxes = () => { const P = api.P, f = P.face, fr = f > 0 ? { l: P.x + 6, r: P.x + 13 } : { l: P.x - 13, r: P.x - 6 }, lip = f > 0 ? { l: P.x - 7, r: P.x + 13 } : { l: P.x - 13, r: P.x + 7 };
    return [{ ...fr, t: P.y - 34, b: P.y + 1 }, { ...lip, t: P.y - 36, b: P.y - 29 }]; };
  function breakWard(how, col) { const P = api.P, [b] = wardBoxes(), x = (b.l + b.r) / 2, y = (b.t + b.b) / 2;
    P.geoGuard = false; P.geoWardLock = api.time + WD.lock; api.burst(x, y, 18, [STONE.hi, STONE.base, EARTH.base, EARTH.lo, STONE.rune], 140, 0.5); api.SFX.geoCrumble && api.SFX.geoCrumble(); api.SFX.geoShard && api.SFX.geoShard(); api.shakeCam(3);
    api.number(x, y - 20, how, col);
    if (tal('shrapnel')) burstShards(x, y, P.face, 4); }   /* SHRAPNEL: what is left of it flies at them */
  function wardParry(foe) { const P = api.P, [b] = wardBoxes(), x = (b.l + b.r) / 2, y = b.t + 10;
    if (foe) { foe.stagger = Math.max(foe.stagger || 0, api.lcBig(foe) ? 0.35 : 1.1); foe.flash = 0.2; if (!foe.maxHp) foe.vx = Math.sign(foe.x - P.x) * 160; }   /* (the Knight's own stagger: the blow bounces, that is all) */
    const was = empowered(); P.geoEmpT = api.time + WD.emp;
    api.number(x, y - 14, was ? 'EMPOWERED AGAIN' : 'EMPOWERED', STONE.rune); api.hitstop(0.08); api.ringAt(x, y + 6, 18, STONE.rune, 0.3); api.sparks(x, y, P.face, 8);
    gainTremor(GEO.tremor.perfect); api.noteParry && api.noteParry(); P.geoBeatT = api.time; }   /* (geoBeatT: her yard asks whether THIS blow was on the beat) */
  /* A BLOW ON IT (damagePlayer asks first): 'blocked', 'half' (out of wind - a GUARD BREAK - or BULWARK under a red blow) or null (not in its way) */
  function wardTakes(fromX, unblockable, foe) {
    const P = api.P; if (!wardUp()) return null;
    const over = Math.abs(fromX - P.x) <= 8 && (!foe || foe.y - (foe.h || 16) < P.y - 20);   /* OVERHEAD: a blow from right over her - the lip takes it */
    if (Math.sign(fromX - P.x) !== P.face && fromX !== P.x && !over) return null;   /* a blow from behind finds her */
    const [b] = wardBoxes(), x = (b.l + b.r) / 2, y = b.t + 10;
    if (unblockable) { breakWard('BROKEN THROUGH', '#ff6b6b'); return tal('bulwark') ? 'half' : null; }   /* RED STILL MEANS MOVE: it breaks, and the blow goes on into her */
    api.SFX.geoBounce(); api.sparks(x, y, P.face, 6);
    if (wardPerfect()) { wardParry(foe); return 'blocked'; }   /* PERFECT: it costs nothing */
    if (P.st < WD.hitSt) { P.st = 0; P.stFlash = 0.5; breakWard('GUARD BREAK', '#ffd36b'); P.hurt = Math.max(P.hurt || 0, 0.55); return 'half'; }   /* out of wind: his guard break, half the blow */
    P.st -= WD.hitSt; P.stDelay = Math.max(P.stDelay || 0, 0.5); gainTremor(GEO.tremor.wall); api.shakeCam(2); api.number(x, y - 14, 'WARDED', STONE.hi);
    return 'blocked'; }
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
    /* STONE WALL (level 9, in LODESTONE's place from 2026-09-24): her old C, bought back - RAISE WALL, below */
    stoneWall() { return raiseWall(); },
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
    /* THE WARD MEETS A SHOT, on its face or its lip (so one dropping on her from above is met too). Raised on the beat, it is thrown back
       the way it came (and the beat empowers her); with STONEFACE, EVERY shot it meets is thrown back; otherwise it dies on the stone
       for the wind a blow costs - and with no wind for it, it is let through to her, where damagePlayer breaks the ward (GUARD BREAK) */
    if (wardUp()) { const bs = wardBoxes();
      for (const s of api.seeds) { if (s.dead || s.reflected || !bs.some(b => s.x > b.l - 3 && s.x < b.r + 3 && s.y > b.t - 3 && s.y < b.b + 3)) continue;
        if (s.noBlock || s.unblockable) continue;   /* (a red shot is a red blow: it goes on, and breaks the ward on her) */
        const beat = wardPerfect();
        if (beat || tal('returnFire')) { api.reflectSeed(s); api.number(s.x, s.y - 14, 'THROWN BACK', STONE.rune); if (beat) wardParry(null); gainTremor(GEO.tremor.shot); }
        else if (P.st >= WD.hitSt) { s.dead = true; P.st -= WD.hitSt; P.stDelay = Math.max(P.stDelay || 0, 0.5); api.sparks(s.x, s.y, -Math.sign(s.vx) || 1, 4); api.SFX.geoBounce(); gainTremor(GEO.tremor.shot); } } }
    /* THE THIRD BLOW: the spin shatters what it touches */
    if (P.atk >= 0.04 && P.atk < 0.2 && P.heavySwing && !P.heavy && pieces.length) { const b = api.attackBox(); if (b) for (const p of [...pieces]) if (api.overlap(b, { l: p.x0, r: p.x1, t: p.y0, b: p.y1 })) shatter(p, P.face); }
    /* a foe her stone threw into the air lands (the end spike of a full FAULT LINE, a step that lifted it) - THROWN DOWN makes it land hard */
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
    spikes = spikes.filter(s => s.t < 0.6);   /* (FAULT LINE's end spike rides the same clock) */
    /* FAULT LINE, her heavy: the crack runs on at its speed, everything it reaches is hit, and a full one spikes at the end */
    for (const fl of faults) { if (!fl.heavy) continue; fl.life -= dt; const was = fl.len; fl.len = Math.min(fl.max, fl.len + FL.speed * dt);
      if (fl.len > was && Math.random() < 0.7) api.dust(fl.x0 + fl.dir * fl.len, fl.gy, 2);
      faultHits(fl); if (fl.spike && !fl.spiked && fl.len >= fl.max) faultSpike(fl); }
    for (const fl of faults) { if (fl.heavy) continue; fl.life -= dt; const was = fl.len; fl.len = Math.min(fl.max, fl.len + 380 * dt);
      const tipX = fl.x0 + fl.dir * fl.len, ttx = Math.floor(tipX / TS), fy = Math.floor(fl.gy / TS); if (api.isSolid(ttx, fy - 1) || !(api.isSolid(ttx, fy) || api.isOneWay(api.tileAt(ttx, fy)))) fl.max = Math.min(fl.max, fl.len);
      if (fl.len > was && Math.random() < 0.6) api.dust(tipX, fl.gy, 2);
      for (const e of foes()) { if (e.harmless || e.turncoat || fl.hit.has(e) || Math.abs(e.y - fl.gy) > 14) continue; const d = (e.x - fl.x0) * fl.dir; if (d < -6 || d > fl.len) continue;
        fl.hit.add(e); api.hurtAs('heavy', e, dmg(0.8, 'faultLine'), e.x - fl.dir * 8, false);
        if (e.alive && liftable(e)) { e.vy = -320; e.geoAirT = api.time; e.stagger = Math.max(e.stagger || 0, 0.8); api.number(e.x, e.y - (e.h || 16) - 14, 'THROWN UP', STONE.hi); } else if (e.alive) e.stagger = Math.max(e.stagger || 0, 0.4); } }
    faults = faults.filter(f => f.life > 0);
    if (golem) { const G = golem; G.life -= dt; G.rise = Math.min(1, G.rise + dt * 4); G.atkT -= dt; G.swing = Math.max(0, G.swing - dt);
      const tgt = foes().filter(e => !e.harmless && !e.turncoat && Math.abs(e.x - G.x) < 200 && Math.abs(e.y - G.y) < 60).sort((a, b) => Math.abs(a.x - G.x) - Math.abs(b.x - G.x))[0];
      if (tgt) { G.face = Math.sign(tgt.x - G.x) || G.face; const ad = Math.abs(tgt.x - G.x) - (tgt.w || 12) / 2;
        if (ad > 10) { const nx = G.x + G.face * 62 * dt, tx = Math.floor((nx + G.face * 6) / TS); if (!api.isSolid(tx, Math.floor((G.y - 8) / TS))) G.x = nx; }
        else if (G.atkT <= 0) { G.atkT = 1.0; G.swing = 0.2; api.hurtAs('heavy', tgt, dmg(0.6, 'golem'), G.x, false); if (tgt.alive && !api.lcBig(tgt)) tgt.stagger = Math.max(tgt.stagger || 0, 0.4); api.sparks(tgt.x, tgt.y - 8, G.face, 6); api.SFX.geoThud(); } }
      const under = Math.floor((G.y + 1) / TS), gx = Math.floor(G.x / TS); if (!api.isSolid(gx, under) && !api.isOneWay(api.tileAt(gx, under))) { G.vy = Math.min(500, G.vy + 900 * dt); G.y += G.vy * dt; if (G.y > api.LH * TS) G.life = 0; } else { G.vy = 0; G.y = under * TS; }
      if (G.life <= 0) { api.burst(G.x, G.y - 10, 14, [STONE.base, STONE.hi, STONE.moss], 70, 0.6); api.SFX.geoCrumble(); golem = null; } }
  }
  function clear() { for (const p of [...pieces]) crumble(p, 'silent'); pieces = []; rollers = []; shards = []; falls = []; spikes = []; faults = []; golem = null; }

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
    const P = api.P; shieldDrawn = false;
    /* STONES ORBIT THE GEODE WHILE SHE CASTS (round 3, the staff item: they floated round her body before): winding FAULT LINE (closing
       in and speeding up with the wind), any of her nine, her ward and THE QUAKE - two small stones and a grain of grit going round the
       amber geode at the top of her staff, wherever the pose has put it (api.staffTip reads it off the frame drawn). Drawn touching
       nothing: it is how she reads as the one who MOVES STONE, before any stone has moved */
    if (api.isGeo() && !P.dead && !P.geoBurrow) { const kit = P.kPoseT > 0 && /^g[A-Z]/.test(P.kPoseK || ''), k = P.charge > 0 ? Math.min(1, P.charge / api.heavyWind()) : (kit || P.geoGuard || P.blastT > 0) ? 1 : 0, tip = k > 0 && api.staffTip ? api.staffTip() : null;
      if (tip) for (let i = 0; i < 3; i++) { const a = api.time * (4 + 3 * k) + i * 2.1, r = i === 2 ? 7 : 5 + (1 - k) * 2, x = Math.round(tip.x - cx + Math.cos(a) * r), y = Math.round(tip.y - cy + Math.sin(a) * r * 0.6);
        g.fillStyle = i === 0 ? STONE.hi : i === 1 ? STONE.base : STONE.lo; if (i < 2) { g.fillRect(x, y, 2, 2); g.fillStyle = STONE.dark; g.fillRect(x, y + 2, 2, 1); } else g.fillRect(x, y, 1, 1);
        spunAt = api.time; } }
    for (const p of pieces) { const k = Math.min(1, p.age / GEO.rise), left = p.life - p.age, crackK = left < p.crack ? 1 - left / p.crack : 0;
      const jit = left < 0.25 ? (Math.floor(api.time * 40) % 2 ? 1 : -1) : 0, rise = Math.round((1 - k) * (p.y1 - p.y0)), set = new Set(p.cells.map(c => c.i));
      g.save(); g.beginPath(); g.rect(Math.round(p.x0 - cx) - 2, Math.round(p.y0 - cy) - 4, p.x1 - p.x0 + 4, p.y1 - p.y0 + 4); g.clip();
      for (const c of p.cells) { const x = Math.round(c.tx * TS - cx) + jit, y = Math.round(c.ty * TS - cy) + rise;
        const top = !set.has(c.i - api.LW), bot = !set.has(c.i + api.LW);
        if (p.tile === T().ONEWAY) { g.fillStyle = STONE.base; g.fillRect(x, y, TS, 6); g.fillStyle = STONE.hi; g.fillRect(x, y, TS, 2); g.fillStyle = STONE.dark; g.fillRect(x, y + 5, TS, 1); g.fillStyle = STONE.moss; g.fillRect(x + 3, y - 1, 4, 1);
          if (crackK > 0) { g.fillStyle = STONE.crack; g.fillRect(x + 5, y + 1, 1, 4); g.fillRect(x + 10, y + 2, 1, 3); } continue; }
        drawStoneCell(g, x, y, top, bot, c.i % 11, crackK, top); }
      g.restore();
      if (p.bulwarked) { g.globalAlpha = 0.5; g.fillStyle = STONE.rune; g.fillRect(Math.round(p.x0 - cx), Math.round(p.y0 - cy) - 2, p.x1 - p.x0, 1); g.globalAlpha = 1; } }
    /* FAULT LINE, TOLD (C1): while she winds, the line the crack will take is drawn on the floor - a run of amber dashes out to where it
       will stop, longer the longer she holds; at a wall or a gap it ends in a bar, and at a full wind in the spike's point */
    if (P.charge > 0 && api.isGeo()) { const a = faultPath(Math.min(1, P.charge / api.heavyWind()));
      if (a) { const y = Math.round(a.gy - cy), x0 = Math.round(a.x0 - cx), n = Math.floor(a.len / 4); g.globalAlpha = 0.5 + 0.3 * Math.sin(api.time * 18); g.fillStyle = STONE.rune;
        for (let i = 0; i < n; i++) if (i % 2 === 0) g.fillRect(Math.min(x0 + a.dir * i * 4, x0 + a.dir * (i * 4 + 3)), y - 1, 3, 1);
        const tx = x0 + a.dir * a.len; if (a.full) { g.fillRect(tx - 1, y - 4, 3, 1); g.fillRect(tx, y - 6, 1, 5); } else if (a.stop) g.fillRect(tx, y - 4, 1, 4);
        g.globalAlpha = 1; } }
    /* SPUR (UP+X): a stone spike jutting up in front of her while the rising blow is live */
    if (api.isGeo() && P.swingKind === 'rise' && P.atk >= 0) { const k = P.atk < 0.06 ? P.atk / 0.06 : P.atk < 0.2 ? 1 : Math.max(0, 1 - (P.atk - 0.2) / 0.1), h = Math.round(34 * k);
      if (h > 0) { const x = Math.round(P.x + P.face * 16 - cx), y = Math.round(P.y - cy); drawSpike(g, x, y, h, 7); } }
    for (const s of spikes) { if (s.t < 0) { g.globalAlpha = 0.6; g.fillStyle = STONE.dark; g.fillRect(Math.round(s.x - cx) - 3, Math.round(s.gy - cy) - 1, 7, 1); g.globalAlpha = 1; continue; }
      const k = s.t < 0.07 ? s.t / 0.07 : s.t < 0.4 ? 1 : Math.max(0, 1 - (s.t - 0.4) / 0.2); drawSpike(g, Math.round(s.x - cx), Math.round(s.gy - cy), Math.round((s.h || 26) * k), s.w || 6); }
    for (const fl of faults) { const x0 = Math.round(fl.x0 - cx), y = Math.round(fl.gy - cy), n = Math.floor(fl.len / 6);
      if (fl.heavy) { const fade = Math.min(1, fl.life / FL.linger); g.globalAlpha = Math.max(0.25, fade);   /* HER CRACK: a jagged dark seam with a lit lip, broken rock kicked up at the tip as it runs */
        for (let i = 0; i < n; i++) { const x = x0 + fl.dir * i * 6, j = (i * 7) % 3 - 1; g.fillStyle = STONE.crack; g.fillRect(Math.min(x, x + fl.dir * 6), y - 1 + (j > 0 ? 1 : 0), 6, 1); if (j < 0) g.fillRect(x, y - 2, 1, 2);
          g.fillStyle = STONE.hi; g.fillRect(Math.min(x, x + fl.dir * 6), y - 2 + (j > 0 ? 1 : 0), 2, 1); }
        if (fl.len < fl.max) { const tx = x0 + fl.dir * fl.len; g.fillStyle = STONE.base; g.fillRect(tx - 2, y - 4, 2, 3); g.fillStyle = STONE.hi; g.fillRect(tx + 1, y - 6, 2, 2); g.fillStyle = STONE.lo; g.fillRect(tx - 1, y - 7, 1, 1); }
        g.globalAlpha = 1; continue; }
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
    /* THE RUNE-WARD: NOT DRAWN AT ALL WHILE SHE WALKS OR STANDS (round 3, item 4) - only while C has it up. It RISES out of the ground in
       front of her over GEO.ward.raise (faint as it comes, C1: not a guard yet), then stands: an earth shield taller than she is (below),
       its brow curled back over her hood, an amber rune boss at its heart and an amber rim - lit bright for the perfect window, and
       brighter still while she is EMPOWERED. Its break is the burst of shards. */
    if (api.isGeo() && !P.dead && !P.geoBurrow && P.geoGuard) { shieldDrawn = true; const f = P.face, [fr, lip] = wardBoxes(), k = Math.min(1, (api.time - P.geoGuardAt) / WD.raise), beat = wardPerfect(), emp = empowered();
      /* AN EARTH SHIELD, NOT A COURSE OF BLOCKS (Daniel, 2026-09-25): a shield of cracked rock and packed earth, shaped like a heater
         shield, its point driven into a heaped mound of soil at her feet and its top grown back over her hood as a brow with roots and
         dirt hanging from its underside. It SURFACES out of the ground (the whole shield slides up over
         GEO.ward.raise, clipped at the floor), and the amber rune boss at its heart is the guard's tell. The boxes it is drawn over
         (wardBoxes) are the ones the blows and shots meet: only the look changed. `u` runs out from her side of the face, `v` down it. */
      const H = fr.b - fr.t, x0 = Math.round(fr.l - cx), by = Math.round(fr.b - cy), w = fr.r - fr.l, sink = Math.round(H * (1 - k)), top = by - H + sink;
      const px = (u, yy, ww, hh, col) => { g.fillStyle = col; g.fillRect(f > 0 ? x0 + u : x0 + w - u - ww, yy, ww, hh); };
      /* ITS SHAPE, row by row: a heater shield - a rounded top, broad through the middle, tapering to a point driven into the mound -
         with a rough rock edge (a notch here and there) */
      const UC = 4, BV = 13, half = v => (v < 4 ? [3, 5, 6, 6][v] : v < 19 ? 6 : Math.max(1, Math.round(6 - 5 * (v - 19) / (H - 20)))), edge = v => [UC - half(v) + ((v * 7) % 9 === 3 ? 1 : 0), UC + half(v) - ((v * 5) % 11 === 7 ? 1 : 0)];
      const CR = [[-4, 3], [5, 6], [-3, 26], [4, 23], [6, 14]], cracked = new Set();   /* THE CRACKS, run out from its boss to the rim */
      for (const [du, dv] of CR) { const n = Math.max(Math.abs(du), Math.abs(dv - BV)); for (let i = 2; i <= n; i++) cracked.add(Math.round(UC + du * i / n) + ',' + Math.round(BV + (dv - BV) * i / n)); }
      const bodyA = k < 1 ? 0.6 + 0.35 * k : 0.95; g.globalAlpha = bodyA;
      g.save(); g.beginPath(); g.rect(x0 - 16, top - 4, w + 32, by - top + 4); g.clip();
      for (let v = 0; v < H; v++) { const yy = top + v, [ul, ur] = edge(v);
        for (let u = ul + 1; u < ur; u++) { const n = (u * 13 + v * 7) % 17, soil = (v > 20 && n < 6) || n === 0 || (v > H - 7);
          px(u, yy, 1, 1, cracked.has(u + ',' + v) ? EARTH.lo : v === 1 || (v < 4 && u === ul + 1) ? STONE.hi : soil ? (n % 2 ? EARTH.base : EARTH.hi) : n === 5 ? STONE.lo : u >= ur - 2 ? STONE.hi : STONE.base); }
        px(ul, yy, 1, 1, STONE.dark); px(ur, yy, 1, 1, v % 10 === 6 ? STONE.moss : v > H - 8 ? EARTH.hi : STONE.hi);   /* the rim: her side in shadow, the foe's side lit (a tuft of moss here and there) */
        if (v === 0) px(ul + 1, yy, ur - ul - 1, 1, STONE.hi); if (v % 10 === 6) px(ur + 1, yy, 1, 1, STONE.moss2); }
      px(UC - 1, top - 1, 3, 1, STONE.moss); px(UC + 3, top, 2, 1, STONE.moss2);   /* moss along its top */
      if (k >= 1) for (let i = 0; i < 2; i++) { const t = (api.time * 1.3 + i * 0.5) % 1, v = 16 + Math.floor(t * (H - 18)); g.globalAlpha = 0.85 * (1 - t); px(edge(v)[1] + 1, top + v, 1, 1, EARTH.base); }   /* a grain of dirt trickling off its face */
      const cv = top + BV; g.globalAlpha = bodyA;   /* THE BOSS at its heart: a round of worked stone */
      px(UC - 2, cv - 1, 5, 3, STONE.dark); px(UC - 1, cv - 2, 3, 5, STONE.dark); px(UC - 1, cv - 1, 3, 3, STONE.hi); px(UC, cv, 2, 2, STONE.base);
      g.globalAlpha = (emp ? 0.95 : beat ? 0.9 : 0.65) * (k < 1 ? k : 1) + (emp || beat ? 0 : 0.2 * Math.sin(api.time * 5));   /* ITS RUNE, and a glyph cut above and below it: the guard's tell */
      px(UC, cv, 1, 1, STONE.rune); px(UC, top + 5, 1, 3, STONE.rune); px(UC - 1, top + 6, 3, 1, STONE.rune); px(UC, top + 20, 1, 2, STONE.rune); px(UC - 1, top + 21, 1, 1, STONE.rune); px(UC + 1, top + 21, 1, 1, STONE.rune);
      if (beat || emp) { g.globalAlpha = beat ? 0.7 : 0.35 + 0.15 * Math.sin(api.time * 12); for (let v = 0; v < H; v++) px(edge(v)[1] + 1, top + v, 1, 1, STONE.rune); }   /* the amber rim: THE BEAT, and EMPOWERED */
      g.restore(); g.globalAlpha = bodyA;
      if (k > 0) {   /* THE MOUND its point is driven into, heaped either side, with a stone or two in it */
        for (const [r, a, z] of [[1, -3, 11], [2, -1, 9], [3, 1, 7], [4, 3, 5]]) for (let u = a; u <= z; u++) px(u, by - r, 1, 1, r >= 3 ? EARTH.hi : (u * 3 + r) % 5 === 0 ? EARTH.lo : EARTH.base);
        px(-3, by - 2, 1, 1, STONE.lo); px(10, by - 1, 2, 1, STONE.hi); px(0, by - 3, 1, 1, EARTH.hi); }
      if (k >= 1) { const ly = Math.round(lip.t - cy), u0 = f > 0 ? lip.l - fr.l : fr.r - lip.r, uEnd = UC;   /* THE BROW: over her hood, grown from the shield's top, thinning and curling down behind her */
        for (let u = u0; u <= uEnd; u++) { const q = (u - u0) / (uEnd - u0), th = 2 + Math.round(2 * q), dr = Math.round(3 * (1 - q) * (1 - q)), yt = ly + dr;
          px(u, yt, 1, 1, u % 5 === 1 ? STONE.moss : STONE.hi); px(u, yt + 1, 1, th - 1, (u * 3) % 7 === 0 ? EARTH.base : (u + 1) % 5 === 0 ? STONE.lo : STONE.base); px(u, yt + th, 1, 1, EARTH.lo);
          if (u % 4 === 2 && u < uEnd - 3) px(u, yt + th + 1, 1, 1 + (u % 3 === 0 ? 1 : 0), EARTH.lo); }   /* roots and dirt hanging under it */
        px(u0 - 1, ly + 3, 1, 2, STONE.dark); }   /* its curled end */
      g.globalAlpha = 1; }
    /* EMPOWERED (a perfect ward): the runes on HER are alight - four amber marks turning slowly round her chest - and they gutter out
       over the last half second, so the end of it is told */
    if (api.isGeo() && !P.dead && !P.geoBurrow && empowered()) { const left = P.geoEmpT - api.time, a0 = left < 0.5 ? left / 0.5 : 1;
      for (let i = 0; i < 4; i++) { const a = api.time * 1.6 + i * Math.PI / 2, x = Math.round(P.x - cx + Math.cos(a) * 11), y = Math.round(P.y - cy - 12 + Math.sin(a) * 5);
        g.globalAlpha = a0 * (Math.sin(a) > 0 ? 0.95 : 0.5); g.fillStyle = STONE.rune; g.fillRect(x, y - 1, 1, 3); g.fillRect(x - 1, y, 3, 1); }
      g.globalAlpha = 1; }
    if (golem) { const G = golem, x = Math.round(G.x - cx), y = Math.round(G.y - cy), h = Math.round(20 * G.rise), f = G.face, sw = G.swing > 0 ? 4 : 0;
      g.fillStyle = STONE.lo; g.fillRect(x - 6, y - h, 12, h); g.fillStyle = STONE.base; g.fillRect(x - 5, y - h, 10, h - 1); g.fillStyle = STONE.hi; g.fillRect(x - 5, y - h, 10, 2);
      if (h > 14) { g.fillStyle = STONE.moss; g.fillRect(x - 4, y - h - 1, 5, 2); g.fillStyle = STONE.rune; g.fillRect(x + f * 2, y - h + 5, 2, 1); g.fillStyle = STONE.lo; g.fillRect(x + f * (6 + sw) - 2, y - h + 8, 5, 5); g.fillStyle = STONE.base; g.fillRect(x - 3, y - 4, 2, 4); g.fillRect(x + 1, y - 4, 2, 4); } }
  }
  function drawSpike(g, x, y, h, w) { for (let k = 0; k < h; k++) { const ww = Math.max(1, Math.round(w * (1 - k / h))); g.fillStyle = k > h - 3 ? STONE.hi : k % 5 === 0 ? STONE.lo : STONE.base; g.fillRect(x - Math.floor(ww / 2), y - k - 1, ww, 1); } }
  function drawBoulder(g, x, y, r, spin) { x = Math.round(x); y = Math.round(y);
    g.fillStyle = STONE.dark; g.beginPath(); g.arc(x, y, r + 1, 0, 7); g.fill(); g.fillStyle = STONE.base; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    g.fillStyle = STONE.hi; g.fillRect(x - Math.round(r / 2), y - r + 1, Math.max(2, r - 1), 1);
    const a = spin || 0; g.fillStyle = STONE.lo; g.fillRect(Math.round(x + Math.cos(a) * r * 0.5), Math.round(y + Math.sin(a) * r * 0.5), 2, 2); g.fillStyle = STONE.moss; g.fillRect(Math.round(x + Math.cos(a + 2.5) * r * 0.6), Math.round(y + Math.sin(a + 2.5) * r * 0.6), 2, 1); }

  return { update, draw, clear, faultHeavy, faultPath, guard, wardTakes, wardUp, wardPerfect, empowered, raiseWall, wallTakes, rollStone, quake, gainTremor, tombHit, kit,
    shieldDrawn: () => shieldDrawn, spunAt: () => spunAt, pieces: () => pieces, rollers: () => rollers, falls: () => falls, spikes: () => spikes, faults: () => faults, golem: () => golem, freeCell, erupt, place, crumble };
}
