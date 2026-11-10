// src/gobgeo-hands.js - THE GOBLIN GEOMANCER's HANDS (claude/gobgeo). src/gob-geomancer.js is the rules (pure); this binds them to the game:
//   his body (spawn, the brain each frame, his gravity and his ledge), the blow on him (take: his orbit guards his front), his drawing (the sheet's frame + the orbit),
//   and HIS STONE IN FLIGHT - the lobbed rocks and the slate volleys, in THEIR OWN ARRAY (never `seeds`: the pyro's ember ward, the pirate's hook catch and the ranger's
//   snatch eat seeds - the Goblin Queen's shards live apart for the same reason, src/gqueen-hands.js).
// SENT BACK. A rock or a slate that a hero PARRIES (the shared parry counter moved during the hit: every hero's parry, deflect, ward - gqHit's rule) or MEETS WITH A BLOW
// (his attack box on the rock, once a blow) flies straight back at its thrower and smashes the FIRST thing in its path:
//   a ROCKLOCK (the level's: a GEODE SEAL on a barred gate -> the gate opens; THE OLD STONE of a tower face -> a secret opens), a GATEBELL (src/bell-gate.js: it rings,
//   its foes run under it and its gate drops on them), a CHANDELIER (it falls on whoever is under it), a goblin (a SHIELD from the front is knocked aside; anyone else is
//   struck), and him: STAGGERED, his orbit dropped. Walls stop it. Nothing here writes the grid except a smashed rocklock (as the game's other broken things: kept for the attempt).
// main.js calls: load, clear, owns, spawn, foeUpdate, take, frame, update, drawWorld, drawOver, read.
import { GG, GG_SAY, newGeo, geoStep, lob, fan, homeVel, geoTake, geoStruck, sweep, inBox } from './gob-geomancer.js';
import { Q4 } from './gq4q.js'; import { heroStrikes } from './hero-strikes.js';   /* (claude/gq4q) any blow or hero shot sends a rock back */
import * as GGA from './redraw/gob_geomancer_art.js'; import * as GQ3A from './redraw/gq3_art.js';   /* (claude/gq3art) the counterweights, the pivot slabs, the geode grille */
import { BELLGATE } from './bell-gate.js';
import { LANCE4, bellStrike } from './lance-support.js';

export function makeGobGeoHands(ctx) {
  const H = {}, TS = ctx.TS;
  let S = null;
  const now = () => ctx.time();
  const sfx = k => { const f = ctx.sfx && ctx.sfx[k]; if (f) f(); };
  const sign = v => (v < 0 ? -1 : 1);
  const fresh = L => ({ L, rocks: [], fx: [], lamps: [], smashed: S && S.L === L ? S.smashed : new Set(), fail: new Map(), rid: 0, said: new Set(),
    n: { thrown: 0, slates: 0, back: 0, parried: 0, struck: 0, seals: 0, shields: 0, lamps: 0, bells: 0, staggers: 0, warded: 0, held: 0, foes: 0, hits: 0 } });
  const st = () => { const L = ctx.L; if (!L) return null; if (!S || S.L !== L) S = fresh(L); return S; };
  const once = k => { if (S.said.has(k)) return false; S.said.add(k); return true; };
  /* every seat on his feet: fn(P) with P the seat (main.js asPlayer) */
  const seats = fn => { if (ctx.eachHero) ctx.eachHero(fn); else { const p = ctx.hero(); if (p && !p.dead) fn(p); } };

  H.load = () => { S = null; };
  H.clear = () => { const s = st(); if (!s) return; s.rocks = []; s.fx = []; s.lamps = []; s.fail = new Map(); };   /* a respawn: nothing in the air; a smashed seal STAYS smashed */
  H.owns = e => !!e && e.t === 'gobgeo';
  H.on = () => !!(ctx.L && ((ctx.L.rocklocks || []).length || ctx.enemies().some(e => e.t === 'gobgeo')));

  /* ---------- HIS BODY ---------- */
  H.spawn = (base, e) => { const hp = (ctx.EHP && ctx.EHP.gobgeo) || GG.hp;
    return { ...base, t: 'gobgeo', w: GG.w, h: GG.h, hp, maxHp0: hp, speed: GG.speed, face: e.face || -1, perch: !!e.perch, early: !!e.early, sight: e.sight || 0, sealId: e.seal || null, cd: GG.first,
      ...newGeo({ post: e.leash === 0 ? null : base.x, leash: e.leash || GG.leash }) }; };
  const standable = (tx, ty) => ctx.standable ? ctx.standable(tx, ty) : false;
  H.foeUpdate = (e, dt) => {
    const s = st(); if (!s) return; const P = ctx.hero();
    const ahead = dir => { const tx = Math.floor((e.x + dir * (e.w / 2 + 5)) / TS), ty = Math.floor((e.y + 1) / TS); return standable(tx, ty) && !ctx.solidAt(e.x + dir * (e.w / 2 + 3), e.y - 6); };
    const r = geoStep(e, dt, { tx: P ? P.x : e.x, ty: P ? P.y : e.y, ahead, roll: () => Math.random(), tokWait: !!e.tokWait });
    for (const v of r.events) {
      if (v.ev === 'tell') { if (v.move === 'rockTell') sfx('crumble'); else if (v.move === 'slateTell') { sfx('thud'); ctx.dust(e.x + e.face * 18, e.y, 4); } else sfx('clatter'); }
      else if (v.ev === 'cancel') { if (v.move === 'rockTell') { ctx.burst(e.x, e.y - 34, 6, ['#5c5c6e', '#868698'], 40, 0.4); } }
      else if (v.ev === 'rock') throwRock(e, P);
      else if (v.ev === 'slate') throwSlates(e, P);
      else if (v.ev === 'shell') shellBurst(e);
    }
    if (!(e.knock > 0)) { e.vx = r.vx; }
    e.vy = Math.min(270, (e.vy || 0) + 1000 * dt);
    const m = ctx.moveBody(e, e.vx * dt, e.vy * dt); if (m && m.ground) e.vy = 0;
  };
  const staffTop = e => ({ x: e.x + e.face * 13, y: e.y - 36 });
  function throwRock(e, P) { const s = st(), o = { x: e.x + e.face * 2, y: e.y - (e.perch ? 42 : 36) }, t = P || { x: e.x + e.face * 120, y: e.y };
    const v = lob(o.x, o.y, t.x, t.y - 12, GG.rock, e.perch ? 1.15 : 0);   /* from a roof: a high arc over its merlons */
    s.rocks.push({ kind: 'rock', x: o.x, y: o.y, vx: v.vx, vy: v.vy, g: GG.rock.g, owner: e, back: false, t: 0, life: GG.rock.life, id: ++s.rid, r: GG.rock.r, dmg: GG.rock.dmg });
    s.n.thrown++; sfx('leap'); }
  function throwSlates(e, P) { const s = st(), o = { x: e.x + e.face * 20, y: e.y - 12 }, t = P || { x: e.x + e.face * 120, y: e.y };
    for (const v of fan(o.x, o.y, t.x, t.y - 12)) s.rocks.push({ kind: 'slate', x: o.x, y: o.y, vx: v.vx, vy: v.vy, g: 0, owner: e, back: false, t: 0, life: GG.slate.life, id: ++s.rid, r: GG.slate.r, dmg: GG.slate.dmg });
    s.n.slates++; sfx('crack'); ctx.dust(o.x, e.y, 6); }
  function shellBurst(e) { const s = st(), R = GG.shell; s.fx.push({ k: 'shell', x: e.x, y: e.y - 14, t: 0 }); sfx('crumble'); ctx.shake(2);
    seats(P1 => { if (P1.dead || Math.abs(P1.x - e.x) > R.r || Math.abs((P1.y - 12) - (e.y - 12)) > R.r * 0.8) return;
      const res = ctx.damagePlayer(e.x, R.dmg, { who: e, name: 'THE SHELL BURST' }); if (res && res !== 'blocked') { P1.vx = sign(P1.x - e.x) * R.push; P1.vy = Math.min(P1.vy || 0, -90); P1.ground = false; } });
    ctx.number(e.x, e.y - e.h - 18, GG_SAY.spent, '#c99aff'); }

  /* ---------- THE BLOW ON HIM ---------- */
  H.take = (e, dmg, tag) => {
    const P = ctx.hero(), above = !!(P && (P.plunge || P.y < e.y - e.h - 2));
    const r = geoTake(e, dmg, { tag, fromX: P ? P.x : e.x, above });
    if (r.say === GG_SAY.warded) { const s = st(); if (s) s.n.warded++; ctx.number(e.x, e.y - e.h - 16, r.say, '#c9c9d6'); ctx.burst(e.x + e.face * 10, e.y - 14, 5, ['#5c5c6e', '#868698', '#c99aff'], 60, 0.4); sfx('clank');
      if (S && once('ward')) ctx.number(e.x, e.y - e.h - 28, 'HIS STONE GUARDS HIS FRONT', '#c99aff'); }
    if (r.held) { const s = st(); if (s) s.n.held++; e.stagger = Math.max(e.stagger || 0, r.stagger); ctx.number(e.x, e.y - e.h - 16, r.say, '#ffd36b'); ctx.burst(e.x, e.y - 30, 8, ['#5c5c6e', '#868698', '#b8b8c8'], 70, 0.5); sfx('thud'); }
    return r.dmg;
  };
  H.frame = e => GGA.ggFrame(e);

  /* ---------- HIS STONE IN FLIGHT ---------- */
  const HSX = { eachSeat: fn => seats(fn), hero: () => ctx.hero(), attackBox: () => (ctx.attackBox ? ctx.attackBox() : null), overlap: (a, b) => ctx.overlap(a, b), players: () => (typeof ctx.players === 'function' ? ctx.players() : ctx.players) || [] };   /* (claude/gq4q) fallback for a tool's fake world */
  const rockBox = r => ({ l: r.x - r.r, r: r.x + r.r, t: r.y - r.r, b: r.y + r.r });
  const solid = (x, y) => ctx.solidAt(x, y);
  function sendBack(r, how) { const s = st(); r.back = true; r.g = 0; r.t = 0; r.life = GG.back.life; r.how = how; s.n.back++; if (how === 'parry') s.n.parried++; else s.n.struck++;
    const o = r.owner, hv = o && o.alive ? homeVel(r, o.x, o.y - o.h / 2) : { vx: -r.vx, vy: -r.vy }; if (!(o && o.alive)) { const d = Math.hypot(hv.vx, hv.vy) || 1; hv.vx = hv.vx / d * GG.back.v; hv.vy = hv.vy / d * GG.back.v; }
    r.vx = hv.vx; r.vy = hv.vy; ctx.ring(r.x, r.y, 12, '#c8f08a', 0.25); sfx('parry'); ctx.number(r.x, r.y - 12, GG_SAY.back, '#8fd160');
    if (once('backTeach')) ctx.number(r.x, r.y - 24, 'IT SMASHES THE FIRST THING IT MEETS', '#8fd160'); }
  /* what a sent-back rock meets at (x, y): the first of the room's targets, then a foe */
  function targetAt(r, x, y) {
    const L = ctx.L;
    for (const k of L.rocklocks || []) { if (S.smashed.has(k.id)) continue; if (inBox(x, y, { l: k.box[0] * TS, r: (k.box[1] + 1) * TS, t: k.box[2] * TS, b: (k.box[3] + 1) * TS })) return { k: 'lock', o: k }; }
    for (const pr of ctx.props()) {
      if (pr.t === 'gatebell' && inBox(x, y, { l: pr.x - 9, r: pr.x + 9, t: pr.y - 100, b: pr.y + 30 }))   /* the bell, and its iron hanger up the tower face */ return { k: 'bell', o: pr };
      if (pr.t === 'weight' && pr.lamp && !pr.scenery && pr.state === 'hang' && inBox(x, y, { l: pr.x - 9, r: pr.x + 9, t: pr.y, b: pr.y + pr.len + 16 })) return { k: 'lamp', o: pr };
    }
    const B = ctx.boss ? ctx.boss() : null;
    for (const e of ctx.enemies()) { if (!e.alive || e === B || e.mini || e.xpRole === 'mini' || e.t === 'gqueen' || e.t === 'gprincess' || e.pvpSeat) continue;
      const b = ctx.box(e); if (inBox(x, y, { l: b.l - r.r, r: b.r + r.r, t: b.t - r.r, b: b.b + r.r })) return { k: 'foe', o: e }; }
    return null;
  }
  function smashLock(k, why) { const s = st(); if (s.smashed.has(k.id)) return; s.smashed.add(k.id); s.n.seals++;
    if (k.kind === 'weight') {   /* (gq3 item 3) a GEODE COUNTERWEIGHT: it drops, and its PIVOT SLAB swings level (a 3-col bridge) */
      if (ctx.layCells) ctx.layCells(k.lay || []); const wx = (k.x + 0.5) * TS, wy = k.y * TS;
      ctx.burst(wx, wy + 24, 14, ['#9a5ae0', '#d0a8ff', '#ffffff', '#5a2a9a'], 100, 0.7); ctx.shake(5); sfx('golemShatter'); sfx('thud'); s.fx.push({ k: 'weight', x: wx, y: wy, t: 0, id: k.id });
      ctx.number(wx, wy + 40, why === 'fail' ? 'WITH HIM GONE THE WEIGHT FALLS' : 'THE WEIGHT DROPS: THE SLAB SWINGS LEVEL', '#8fd160'); return; }
    ctx.openCells(k.cells || []);
    const cx0 = (k.x + 0.5) * TS, cy0 = (k.y + 0.5) * TS;
    ctx.burst(cx0, cy0, 16, k.kind === 'crack' ? ['#3e3e4c', '#5c5c6e', '#868698', '#9a5ae0'] : ['#9a5ae0', '#d0a8ff', '#ffffff', '#5a2a9a'], 110, 0.7); ctx.shake(5); sfx('golemShatter'); sfx('crumble');
    ctx.number(cx0, cy0 - 20, why === 'fail' ? GG_SAY.sealFail : k.kind === 'crack' ? GG_SAY.secret : GG_SAY.seal, k.kind === 'crack' ? '#d0a8ff' : '#8fd160');
    if (k.kind === 'crack' && ctx.secretFound) ctx.secretFound(k); }
  function ringBell(pr) { const s = st();
    if (pr.down > 0 || !bellStrike(pr, LANCE4)) { sfx('clank'); return; }
    sfx('seaBell'); s.n.bells++; ctx.number(pr.x, pr.y - 36, 'THE BELL: THEY RUN TO IT', '#ffd36b');
    for (const e of ctx.enemies()) if (e.alive && e.answers === pr.id) { e.answerX = pr.gx; e.answerT = BELLGATE.answer; e.face = Math.sign(pr.gx - e.x) || e.face; } }
  function dropLamp(pr) { const s = st(); pr.state = 'fall'; pr.fy = pr.y + pr.len; pr.vy = 0; pr.hitE = null; pr.hitP = false; s.n.lamps++; s.lamps.push({ pr, t: 0, done: false }); sfx('crack'); sfx('clank');
    ctx.number(pr.x, pr.y + pr.len - 20, GG_SAY.lamp, '#ffd36b'); }
  function struck(r, e) { const s = st();
    if (e.t === 'gobgeo') { const h = geoStruck(e, r.kind === 'slate'); s.n.staggers++; ctx.hurtAs('reflect', e, h.dmg, r.x - sign(r.vx) * 6); if (e.alive) { e.stagger = Math.max(e.stagger || 0, h.stagger); ctx.number(e.x, e.y - e.h - 16, GG_SAY.stagger, '#ffd36b');
        if (Q4 && e.early && e.perch) { e.perch = false; e.early = false; e.vx = -e.face * 80; e.vy = -120; e.stagger = Math.max(e.stagger, 2.0); ctx.number(e.x, e.y - e.h - 30, 'KNOCKED OFF HIS PERCH', '#8fd160'); } /* (claude/gq4q) E1/E2: his own rock sent back drops him off his crag / loft, STUNNED 2 s */ }
      ctx.burst(e.x, e.y - 14, 10, ['#5c5c6e', '#868698', '#c99aff'], 90, 0.6); for (let k = 0; k < 3; k++) s.fx.push({ k: 'chunk', x: e.x + (k - 1) * 8, y: e.y - 20, vx: (k - 1) * 40, vy: -80, t: 0, id: k }); return; }
    if (e.t === 'shield' && e.face === -sign(r.vx) && !(e.broken > 0)) { s.n.shields++; ctx.offBalance(e, GG.shieldAside); ctx.number(e.x, e.y - e.h - 30, GG_SAY.shield, '#8fd160'); sfx('clank'); ctx.burst(e.x + e.face * 8, e.y - 9, 8, ['#c9d1dc', '#ffffff'], 80, 0.4); return; }
    s.n.foes++; ctx.hurtAs('reflect', e, GG.back.foe, r.x - sign(r.vx) * 6); if (e.alive) e.stagger = Math.max(e.stagger || 0, GG.back.foeStagger); ctx.burst(r.x, r.y, 8, ['#5c5c6e', '#868698'], 70, 0.4); sfx('thud'); }

  function rockStep(r, dt) {
    const s = S; r.t += dt; r.life -= dt;
    if (r.life <= 0) { r.dead = true; return; }
    if (r.back) {   /* home on the thrower, smash the first thing on the way */
      const o = r.owner; if (o && o.alive) { const hv = homeVel(r, o.x, o.y - o.h / 2); r.vx = hv.vx; r.vy = hv.vy; }
      const w = sweep(r.x, r.y, r.vx, r.vy, dt, (x, y) => targetAt(r, x, y), solid);
      r.x = w.x; r.y = w.y;
      if (w.hit) { r.dead = true; const h = w.hit;
        if (h.k === 'lock') smashLock(h.o, 'rock'); else if (h.k === 'bell') ringBell(h.o); else if (h.k === 'lamp') dropLamp(h.o); else struck(r, h.o); }
      else if (w.wall) { r.dead = true; ctx.burst(r.x, r.y, 6, ['#5c5c6e', '#868698'], 50, 0.3); sfx('thud'); }
      return;
    }
    r.vy += (r.g || 0) * dt; const nx = r.x + r.vx * dt, ny = r.y + r.vy * dt;
    if (solid(nx, ny)) { r.dead = true; ctx.burst(nx, ny, 5, ['#5c5c6e', '#868698'], 50, 0.3); ctx.dust(nx, ny, 2); return; }
    r.x = nx; r.y = ny;
    /* THE RANGER's tap is a bow shot, not a blade: an arrow of hers IN FLIGHT that meets the rock knocks it back the same way (as src/battering-beast-hands.js reads her arrows) */
    if (Q4) { const hs = heroStrikes(rockBox(r), 'gg' + r.id, HSX); if (hs) { sendBack(r, 'blow'); if (once('blowTeach')) ctx.number(r.x, r.y - 24, 'A BLOW OR A SHOT SENDS IT BACK TOO', '#8fd160'); } }
    else for (const pp of ctx.players || []) for (const ar of pp.rgArrows || []) { if (r.back || ar.state !== 'fly' || ar.ggHit) continue; if (Math.abs(ar.x - r.x) < r.r + 10 && Math.abs(ar.y - r.y) < r.r + 8) { ar.ggHit = true; ar.state = 'drop'; sendBack(r, 'blow'); } }
    if (r.back) return;
    /* a hero's blow that meets it (his swing, once a blow) sends it back; else it lands on him: a parry sends it back, a block breaks it, a hit hurts */
    seats(P1 => { if (r.dead || r.back || P1.dead) return;
      const hb = ctx.attackBox(); const key = 'gg' + r.id;
      if (!Q4 && hb && P1.hitSet && !P1.hitSet.has(key) && ctx.overlap(hb, rockBox(r))) { P1.hitSet.add(key); sendBack(r, 'blow'); if (once('blowTeach')) ctx.number(P1.x, P1.y - 40, 'A BLOW SENDS IT BACK TOO', '#8fd160'); return; }
      if (!ctx.overlap(rockBox(r), ctx.hurtBox())) return;
      const n0 = ctx.parries(); const res = ctx.damagePlayer(r.x - sign(r.vx) * 8, r.dmg, { who: r.owner, name: r.kind === 'slate' ? 'A SLATE' : 'A GEOMANCER\'S ROCK' });
      if (ctx.parries() > n0) { sendBack(r, 'parry'); return; }
      if (res === false) return;   /* a roll, a duck, a grace: it flies on */
      r.dead = true; if (res === 'blocked') { sfx('clank'); ctx.burst(r.x, r.y, 6, ['#5c5c6e', '#868698'], 60, 0.3); if (once('blockTeach')) ctx.number(P1.x, P1.y - 40, 'PARRY IT TO SEND IT BACK', '#ffd36b'); }
      else { s.n.hits++; ctx.burst(r.x, r.y, 6, ['#5c5c6e', '#868698'], 60, 0.3); } });
  }

  /* ONCE A FRAME: the stone in flight, the seals whose Geomancer is gone, the chandeliers coming down, the bits */
  H.update = dt => {
    if (typeof window !== 'undefined' && window.BK && !window.BK.gobgeo) window.BK.gobgeo = () => H;   /* the debug handle (window.BK is made after the hands) */
    const s = st(); if (!s) return;
    for (const r of s.rocks) if (!r.dead) rockStep(r, dt);
    s.rocks = s.rocks.filter(r => !r.dead);
    /* A SEAL IS NEVER A SOFT-LOCK: one whose Geomancer is dead (however he died) and that a hero is near fails on its own */
    const P = ctx.hero();
    for (const k of ctx.L.rocklocks || []) { if (s.smashed.has(k.id) || !k.seal) continue;
      const alive = ctx.enemies().some(e => e.alive && e.t === 'gobgeo' && e.sealId === (k.seal || k.id)), near = P && Math.abs(P.x - (k.x + 0.5) * TS) < 260 && Math.abs(P.y - k.y * TS) < 200;
      if (alive || !near) { s.fail.set(k.id, 0); continue; }
      const t = (s.fail.get(k.id) || 0) + dt; s.fail.set(k.id, t); if (t >= GG.sealFail) smashLock(k, 'fail'); }
    /* A CHANDELIER A ROCK KNOCKED DOWN lands on everyone under it (the game's own weight flattens the one in its column; this is the crash round it) */
    for (const q of s.lamps) { q.t += dt; if (q.done) continue; if (q.pr.state === 'down' || q.t > 1.4) { q.done = true; const x = q.pr.x, y = q.pr.fy || (q.pr.y + q.pr.len); let n = 0;
      for (const e of ctx.enemies()) if (e.alive && !e.maxHp && !e.mini && Math.abs(e.x - x) < GG.lamp.r && Math.abs(e.y - y) < 40) { ctx.hurtAs('reflect', e, GG.lamp.dmg, x); if (e.alive) e.stagger = Math.max(e.stagger || 0, GG.lamp.stagger); n++; }
      ctx.burst(x, y - 4, 14, ['#ffd36b', '#ff9a5c', '#e0c04a', '#5c5c6e'], 90, 0.6); ctx.shake(4); sfx('crack'); if (n) ctx.number(x, y - 34, 'THE CHANDELIER TAKES ' + n, '#8fd160'); } }
    s.lamps = s.lamps.filter(q => q.t < 3);
    for (const f of s.fx) { f.t += dt; if (f.k === 'chunk') { f.vy += 500 * dt; f.x += f.vx * dt; f.y += f.vy * dt; } }
    s.fx = s.fx.filter(f => f.t < (f.k === 'shell' ? 0.35 : 0.8));
  };

  /* ---------- DRAWING ---------- */
  /* before the foes: the seals on their gates, the old stone of a secret (until smashed) */
  let gq3Off = false;
  H.drawWorld = (g, cx, cy, time) => { const s = st(); if (!s) return;
    for (const k of ctx.L.rocklocks || []) { const x = (k.x + 0.5) * TS - cx, y = (k.y + 0.5) * TS - cy; if (x < -60 || x > ctx.VW() + 60) continue;
      if (k.kind === 'weight' && !gq3Off) { try { const hit = s.smashed.has(k.id), sl = (k.lay || [])[0], ceil = 2 * TS + 22 - cy, bob = k.box[2] * TS + Math.round((k.box[3] - k.box[2] + 1) * TS * 0.6) - 8 - cy;
        GQ3A.drawWeight(g, x, ceil, bob, 20 * TS - cy, hit, time); if (sl) GQ3A.drawSlab(g, sl[0], sl[1], sl[2], cx, cy, hit, time); continue; } catch (err) { gq3Off = true; console.warn('gq3 weights art off:', err && err.message); } }
      if (k.kind === 'weight') {   /* GREYBOX (GQ3ART draws the counterweight, its chain, the pivot slab and the shaft): a geode on a chain from the ceiling; its slab hangs vertical at the pivot until the weight drops */
        const hit = s.smashed.has(k.id), sl = (k.lay || [])[0], wx = Math.round(x), top = Math.round(k.box[2] * TS - cy), len = Math.round((k.box[3] - k.box[2] + 1) * TS * 0.6);
        if (!hit) { g.fillStyle = '#6a6a7c'; g.fillRect(wx, Math.round(-cy), 1, top + len - 8 + Math.round(cy)); g.fillStyle = '#5a2a9a'; g.fillRect(wx - 6, top + len - 8, 12, 12); g.fillStyle = '#b28cff'; g.fillRect(wx - 4, top + len - 6, 8, 8); g.fillStyle = '#e8dcff'; g.fillRect(wx - 2, top + len - 5, 3, 3); }
        if (sl) { const sx = Math.round(sl[0] * TS - cx), sy = Math.round(sl[2] * TS - cy); g.fillStyle = '#7a7a8c'; if (hit) g.fillRect(sx, sy, (sl[1] - sl[0] + 1) * TS, 5); else g.fillRect(sx, sy, 5, (sl[1] - sl[0] + 1) * TS); g.fillStyle = '#c9c9d6'; g.fillRect(sx, sy, hit ? (sl[1] - sl[0] + 1) * TS : 5, 1); }
        continue; }
      if (k.id === 'qs-grille' && !gq3Off) { try { const hit = s.smashed.has(k.id); if (hit && !k.hitT) k.hitT = time; GQ3A.drawGrille(g, x, y + 8, time, hit, hit ? Math.min(1, (time - k.hitT) / 0.7) : 0); continue; } catch (err) { gq3Off = true; } }
      if (k.kind === 'crack') { if (!s.smashed.has(k.id)) GGA.drawCrackedFace(g, k.box[0] * TS - cx, k.box[2] * TS - cy, (k.box[1] - k.box[0] + 1) * TS, (k.box[3] - k.box[2] + 1) * TS, time); }
      else GGA.drawSeal(g, x, y, time, s.smashed.has(k.id) ? 1 : 0); } };
  /* after the foes: his orbit, his stone in flight, the bursts */
  H.drawOver = (g, cx, cy, time) => { const s = st(); if (!s) return; const VW = ctx.VW();
    for (const e of ctx.enemies()) { if (!e.alive || e.t !== 'gobgeo' || e.x < cx - 60 || e.x > cx + VW + 60) continue;
      const n = Math.max(0, e.orbit - (e.mode === 'rockTell' ? 1 : 0)), tight = e.mode === 'shellTell', rr = tight ? 8 : GG.orbit.r;
      for (let i = 0; i < n; i++) { const a = time * (tight ? 7 : 2.2) + i * Math.PI * 2 / 3, jit = tight ? (Math.floor(time * 30 + i) & 1) : 0;
        GGA.drawChunk(g, e.x - cx + Math.cos(a) * rr + jit, e.y - 16 - cy + Math.sin(a) * rr * 0.45 + Math.sin(time * 3 + i) * 1.5, i, tight || e.mode === 'slateTell' ? 1 : 0); } }
    for (const r of s.rocks) { if (r.kind === 'rock') GGA.drawRock(g, r.x - cx, r.y - cy, time, r.back, r.id); else GGA.drawSlate(g, r.x - cx, r.y - cy, r.vx, r.vy, r.back); }
    for (const f of s.fx) { if (f.k === 'shell') GGA.drawShell(g, f.x - cx, f.y - cy, 8 + f.t / 0.35 * (GG.shell.r - 8), f.t / 0.35); else if (f.k === 'chunk') GGA.drawChunk(g, f.x - cx, f.y - cy, f.id, 0); }
  };
  H.read = () => S && { rocks: S.rocks.map(r => ({ kind: r.kind, x: r.x, y: r.y, back: r.back })), smashed: [...S.smashed], n: { ...S.n } };
  H.test = { sendBack: r => sendBack(r, 'test'), rocks: () => S && S.rocks, state: () => S, smash: (k, why) => smashLock(k, why) };
  return H;
}
