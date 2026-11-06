// src/kp-hands.js - THE KING'S PYRAMID's HANDS (claude/kingspyramid, 11-06, the OPUS GREYBOX). Binds the pure pieces to the world and draws them (GREYBOX,
// readable - the art lane draws the kit: black stone + gold, sun-shaft white):
//   src/kp-rooms.js        the five rooms' pieces (linen, cracked stone, weights, gates, SLIDING presses, switches, spikes, shutters), the keys + THE GREAT DOOR,
//                          THE DEATHLESS (doomed only by the tomb), THE DESCENT (told debris, end-only boarders) - the mirror room is src/sunroom-hands.js's
//   src/gilded-guard.js    THE GILDED GUARD: lit = stripped (e.disarmed: main.js's throughGuard), gold plate x0.6 from behind
//   src/five-seals-king.js THE KING OF FIVE SEALS: his arena's light (drawn with src/beam-path.js), presses, court, storm, boulders, the read
//   CARRIED THINGS         a FIREBRAND (a cresset / a brazier) and a POWDER KEG (a rack): E takes it, ATTACK throws it on the told arc (src/carry-throw.js),
//                          E again sets it down; a struck keg at rest is lit; a blow or a fall drops what you carry (main.js's P.carry / throwCarry protocol)
// main.js calls: on, clear, update(dt), interact(P), strike(hb), takeFoe(e, dmg, blow, tag), draw(g, cx, cy, time), drawOver(g, cx, cy, time), and for the boss
// spawnBoss(base), owns(e), bossUpdate(e, dt), take(e, dmg, blow, tag), barName(e), drawBoss(g, e, cx, cy, time), read().
import * as KR from './kp-rooms.js';
import * as GGM from './gilded-guard.js';
import * as KSM from './five-seals-king.js';
import * as CT from './carry-throw.js';
import * as BP from './beam-path.js';

const C = { stone: '#2a2620', stoneHi: '#4a4236', gold: '#e8c24a', goldDk: '#9a7a2a', linen: '#e8dcc0', crack: '#8a7a5a', press: '#5a5248', spike: '#c8c0b0', sun: '#fff6c8', keg: '#7a4a26', fire: '#ff9a5c', dead: '#b8a888', priest: '#c8a0ff' };
export const KEG = { fuseThrown: 1.3, fuseStruck: 1.6, rackEvery: 4 };
export const BRAND = { lie: 4.0, burnFoe: 3.0, burnLinen: 5.0 };

export function makeKpHands(ctx) {
  if (!CT.KINDS.kpkeg) CT.addKind('kpkeg', { aims: { low: { vx: 100, vy: -100 }, mid: { vx: 165, vy: -170 }, high: { vx: 115, vy: -290 } }, g: 600, r: 4, ring: 14, dots: 14 });   /* the keg's throw (a row, not a second system) */
  let R = null, Lref = null, S = null, objs = [], fx = [], saidOnce = {};
  const H = {}, TS = ctx.TS, Rd = Math.round;
  const L = () => ctx.L;
  const once = k => { if (saidOnce[k]) return false; saidOnce[k] = 1; return true; };
  const say = (x, y, t, col) => ctx.number(x, y, t, col || '#ffd36b');
  const cells = (list, t) => { for (const [x, y] of list) ctx.cellSet(x, y, t); };
  H.on = () => { const l = L(); if (l !== Lref) { Lref = l; R = l && l.kingspyramid && l.kp ? KR.kpInit(l) : null; S = null; objs = []; fx = []; saidOnce = {}; } return !!R; };
  /* a respawn (spawnEntities): the rooms keep what you did (keys, burned linen, open gates), the stones on the ride are told again, nothing stays in your hands */
  H.clear = () => { if (R) KR.rideReset(R); objs = objs.filter(o => o.state === 'rest' && o.kind === 'keg' && !o.lit); for (const pp of ctx.players) if (pp.carry && pp.carry.kp) pp.carry = null; S = null; };
  const liftOf = () => (ctx.movers ? ctx.movers().find(m => m.kpLift) : null);
  const rooms = () => L().kp;

  /* ---------- THE FOES: tags, the guard's light, the deathless ---------- */
  const litAt = body => {
    const l = L(), x = body.x, y0 = body.y - (body.h || 14), y1 = body.y, tx = Math.floor(x / TS);
    for (const s of l.kp.shafts) if (tx === s.x && y1 > s.y0 * TS && y0 < (s.y1 + 1) * TS) return true;
    for (const sh of R.shutters) if (sh.open > 0 && tx === sh.x && y1 > sh.y0 * TS && y0 < (sh.y1 + 1) * TS) return true;
    if (ctx.sunLit && ctx.sunLit({ x, y: body.y, w: body.w || 10, h: body.h || 14 })) return true;
    if (S && S.light && KSM.litBox(S, [x - (body.w || 10) / 2, x + (body.w || 10) / 2, y0, y1])) return true;
    return false;
  };
  const tagFoe = e => { if (e.kpTagged) return; e.kpTagged = true;
    if (e.kp === 'gilded') { e.gg = GGM.newGG(); e.hp = Rd(e.hp * GGM.GG.hpMul); }
    if (e.kp === 'deathless' && R.doomed.has(e.kpId)) { e.alive = false; e.dying = 0; } };   /* a doomed one stays down through a death */
  function foes(dt) {
    const out = [];
    for (const e of ctx.enemies()) {
      if (!e.alive || !e.kp) continue; tagFoe(e); if (!e.alive) continue;
      if (e.kp === 'gilded') { const ev = GGM.ggStep(e.gg, litAt(e), dt); e.disarmed = GGM.ggStripped(e.gg);
        if (ev === 'strip') { say(e.x, e.y - 30, GGM.GG_SAY.strip, '#fff6c8'); ctx.ring && ctx.ring(e.x, e.y - 10, 20, '#fff6c8'); ctx.sfx.chime && ctx.sfx.chime(); if (e.gg.dazzle > 0) e.stagger = Math.max(e.stagger || 0, GGM.GG.dazzle); }
        else if (ev === 'back') say(e.x, e.y - 30, GGM.GG_SAY.back, '#c8a040'); }
      if (e.kp === 'deathless') out.push({ id: e.kpId, x: e.x, y: e.y, w: e.w || 12, h: e.h || 22, e });
      if (e.kpBoard && e.kpHop) { const hop = e.kpHop; hop.t -= dt; if (hop.t <= 0) { e.x += (hop.tx - e.x) * Math.min(1, dt * 6); if (hop.t < -0.6) e.kpHop = null; } }
    }
    return out;
  }
  /* a blow (or a blast, a burn) on a tagged foe */
  H.takeFoe = (e, dmg, blow) => {
    if (!R || !e.kp) return dmg;
    if (e.kp === 'deathless') { if (e.kpDoom) return dmg; if (blow && once('dl' + Math.floor(ctx.time()))) say(e.x, e.y - 34, 'DEATHLESS: ONLY THE TOMB KILLS IT', '#c8c0b0'); return 0; }
    if (e.kp === 'gilded' && e.gg) { const [d, word] = GGM.ggTake(e.gg, dmg); if (word && blow && once('gg' + Math.floor(ctx.time() * 2))) say(e.x, e.y - 28, word, '#e8c24a'); return d; }
    return dmg;
  };

  /* ---------- CARRIED THINGS ---------- */
  const heldBy = P => (P && P.carry && P.carry.kp ? P.carry : null);
  const newObj = (kind, x, y, o) => { const q = { kp: true, kind, t: kind === 'keg' ? 'kpkeg' : 'kpbrand', thrKind: kind === 'keg' ? 'kpkeg' : 'torch', state: 'rest', x, y, vx: 0, vy: 0, lit: false, fuse: 0, lie: 0, noClimb: true, ...o };
    q.launch = PP => CT.launchOf(q.thrKind, PP, ctx.keys ? ctx.keys() : {}); objs.push(q); return q; };
  const solidPx = (x, y, falling) => { const t = ctx.tileAt(Math.floor(x / TS), Math.floor(y / TS)); return t === ctx.T.SOLID || t === ctx.T.CRATE || (falling && t === ctx.T.ONEWAY && (y % TS) < 4); };
  const takeable = P => {
    const l = L(), near = (x, y) => Math.abs(x - P.x) < 18 && Math.abs(y - P.y) < 20;
    for (const o of objs) if (o.state === 'rest' && near(o.x, o.y)) return { o };
    for (const c of l.kp.cressets) if (near(c.x * TS + 8, (c.y + 1) * TS)) return { make: 'brand' };
    for (const r of R.racks || []) if (r.has && near(r.x * TS + 8, (r.y + 1) * TS)) return { make: 'keg', rack: r };
    if (S && ctx.bossActive) { for (const b of KSM.KS_ARENA.braziers) if (near(S.G.px(b), S.G.floorY)) return { make: 'brand' };
      for (const r of S.racks) if (r.has && near(S.G.px(r.c), S.G.floorY)) return { make: 'keg', bossRack: r }; }
    return null;
  };
  H.interact = P => {
    if (!H.on() || P.dead) return false;
    const h = heldBy(P);
    if (h) { P.carry = null; h.state = 'rest'; h.x = P.x + (P.face || 1) * 8; h.y = P.y; if (h.kind === 'brand') h.lie = BRAND.lie; say(P.x, P.y - 30, h.kind === 'keg' ? 'YOU SET THE KEG DOWN' : 'YOU SET THE FIREBRAND DOWN', '#d8c8a0'); return true; }
    if (P.carry) return false;
    /* the great door: five keys */
    const gd = rooms().greatDoor;
    if (!R.door && Math.abs(P.x - gd.x0 * TS) < 30 && P.y > gd.y0 * TS && P.y <= (gd.y1 + 1) * TS + 2) { tryDoor(true); return true; }
    const tk = takeable(P); if (!tk) return false;
    let q = tk.o;
    if (!q) { q = newObj(tk.make, P.x, P.y); if (tk.rack) { tk.rack.has = false; tk.rack.t = tk.rack.every || KEG.rackEvery; } if (tk.bossRack) { tk.bossRack.has = false; tk.bossRack.t = 3; } }
    q.state = 'held'; q.holder = P; P.carry = q; ctx.sfx.clank && ctx.sfx.clank();
    if (q.kind === 'brand' && once('brandTold')) say(P.x, P.y - 34, 'A FIREBRAND: ATTACK THROWS IT (UP LOBS, DOWN TOSSES SHORT). FIRE EATS LINEN.', '#ff9a5c');
    if (q.kind === 'keg' && once('kegTold')) say(P.x, P.y - 34, 'A POWDER KEG: ATTACK THROWS IT LIT. E SETS IT DOWN - STRIKE IT TO LIGHT IT.', '#ffd36b');
    return true;
  };
  const boom = (x, y) => {
    if (S && ctx.bossActive) { const ev = []; KSM.ksThrown(S, 'keg', [x - 40, x + 40, y - 40, y + 30], ev); bossEvents(ev); }   /* (first: the blast that opens him lands x2) */
    ctx.kegBlast(x, y);   /* main.js's blast: the foes and heroes in it (told by the fuse), the shake, the sound */
    for (const v of KR.blastAt(R, Math.floor(x / TS), Math.floor(y / TS))) applyRoom(v);
  };
  const fireAt = (x, y, foe) => {
    for (const v of KR.fireAt(R, Math.floor(x / TS), Math.floor(y / TS))) applyRoom(v);
    if (foe) { foe.burn = Math.max(foe.burn || 0, foe.t === 'mummy' ? BRAND.burnLinen : BRAND.burnFoe); say(foe.x, foe.y - 30, foe.t === 'mummy' ? 'THE LINEN BURNS' : 'ALIGHT', '#ff9a5c'); }
    if (S && ctx.bossActive) { const ev = []; KSM.ksThrown(S, 'fire', [x - 10, x + 10, y - 16, y + 4], ev); bossEvents(ev); }
  };
  function stepObjs(dt) {
    for (const q of objs) {
      if (q.state === 'held') {
        const P = q.holder; if (!P || P.dead || P.carry !== q) { if (P && P.carry === q) P.carry = null; q.state = 'rest'; q.holder = null; if (q.kind === 'brand') q.lie = BRAND.lie; continue; }
        q.x = P.x + (P.face || 1) * 7; q.y = P.y - 4;
        if (P.hurt > 0 && !q.hurtWas) { P.carry = null; q.state = 'rest'; q.holder = null; q.y = P.y; if (q.kind === 'brand') q.lie = 1.0; say(P.x, P.y - 30, 'KNOCKED OUT OF YOUR HANDS', '#ff9a5c'); }
        q.hurtWas = P.hurt > 0; continue; }
      if (q.state === 'fly') {
        if (!q.flown) { q.flown = true; if (q.kind === 'keg') { q.lit = true; q.fuse = KEG.fuseThrown; } while (solidPx(q.x, q.y, false) && q.y > 0) q.y -= 4; }   /* (it leaves the hand, never the floor) */
        const nx = q.x + q.vx * dt, ny = q.y + q.vy * dt; q.vy += (CT.KINDS[q.thrKind] || CT.KINDS.torch).g * dt;
        /* a firebrand catches what it touches in flight: a foe, the King */
        if (q.kind === 'brand') { const f = ctx.enemies().find(e => e.alive && Math.abs(e.x - nx) < (e.w || 10) / 2 + 4 && ny > e.y - (e.h || 14) - 4 && ny < e.y + 2);
          if (f) { fireAt(nx, ny, f.t === 'kingseals' ? null : f); q.state = 'gone'; continue; } }
        if (solidPx(nx, ny, q.vy > 0)) { q.state = 'rest'; q.vx = 0; q.vy = 0; q.y = Math.floor(ny / TS) * TS; if (q.kind === 'brand') { fireAt(q.x, q.y - 4, null); fireAt(nx + Math.sign(q.vx || 1) * 8, ny, null); q.lie = BRAND.lie; } continue; }
        if (solidPx(nx, q.y, false)) { if (q.kind === 'brand') fireAt(nx, q.y, null); q.vx = -q.vx * 0.2; }
        q.x = nx; q.y = ny; if (q.y > L().H * TS) q.state = 'gone';
      }
      if (q.state === 'rest') {
        if (!solidPx(q.x, q.y + 1, true) && q.y < L().H * TS) { q.vy = Math.min(300, (q.vy || 0) + 900 * dt); q.y += q.vy * dt; if (solidPx(q.x, q.y + 1, true)) { q.y = Math.floor((q.y + 1) / TS) * TS; q.vy = 0; } }
        if (q.kind === 'brand') { q.lie -= dt; if (q.lie <= 0) q.state = 'gone'; else fireAt(q.x, q.y - 4, null); }
      }
      if (q.kind === 'keg' && q.lit && q.state !== 'held') { q.fuse -= dt; if (q.fuse <= 0) { q.state = 'gone'; boom(q.x, q.y - 7); } }
      if (q.kind === 'keg' && q.lit && q.state === 'held') { q.fuse -= dt; if (q.fuse <= 0) { const P = q.holder; if (P) P.carry = null; q.state = 'gone'; boom(q.x, q.y - 7); } }
    }
    objs = objs.filter(q => q.state !== 'gone');
  }

  /* ---------- THE ROOMS' EVENTS -> the world ---------- */
  function applyRoom(v) {
    const T = ctx.T, px = x => x * TS + 8, py = y => y * TS;
    if (v.ev === 'burning') { say(px(v.x), py(v.y) - 8, 'THE LINEN CATCHES', '#ff9a5c'); fx.push({ k: 'burn', id: v.id, t: KR.KR.burnT }); }
    else if (v.ev === 'burned') { cells(v.cells, T.AIR); say(px(v.x), py(v.y) - 8, 'THE LINEN IS ASH', '#ff9a5c'); }
    else if (v.ev === 'break') { cells(v.cells, T.AIR); ctx.burst(px(v.x), py(v.y), 18, [C.crack, C.stoneHi, '#d8c8a0'], 120, 0.7); say(px(v.x), py(v.y) - 8, v.id === 'bracket' ? 'THE BRACKET BREAKS' : 'THE CRACKED STONE GIVES', '#ffd36b'); }
    else if (v.ev === 'drop') { cells(v.from, T.AIR); cells(v.to, T.ONEWAY); ctx.shake && ctx.shake(4); say(px(v.x), py(v.y) - 12, 'THE LEDGE DROPS: A STEP', '#ffd36b'); }
    else if (v.ev === 'cleat') { say(px(v.x), py(v.y) - 12, 'THE ROPE PARTS', '#ffd36b'); ctx.sfx.clank && ctx.sfx.clank(); }
    else if (v.ev === 'weight') { cells(v.from, T.AIR); cells(v.to, T.SOLID); ctx.shake && ctx.shake(6); ctx.sfx.heavy && ctx.sfx.heavy(); say(px(v.x), py(v.y) - 12, 'THE WEIGHT FALLS', '#ffd36b'); }
    else if (v.ev === 'gate') { cells(v.cells, T.AIR); ctx.sfx.clank && ctx.sfx.clank(); say(px(v.x), py(v.y) - 40, v.say || 'THE GATE LIFTS', '#8fd160'); }
    else if (v.ev === 'switch') { ctx.sfx.clank && ctx.sfx.clank(); }
    else if (v.ev === 'jam') say(px(v.x), py(v.y) - 12, 'THE PRESSES JAM (' + v.t + ' S)', '#ffd36b');
    else if (v.ev === 'unjam') { if (once('unjam' + v.id + Math.floor(ctx.time()))) { const p = R.presses.find(q => q.id === v.id); if (p) say(px(p.home[0]), py(p.home[1]) - 12, 'THE PRESSES GRIND FREE', '#ff9a5c'); } }
    else if (v.ev === 'pressTell') { ctx.sfx.rattle && ctx.sfx.rattle(0.6); }
    else if (v.ev === 'pressSlide') { ctx.sfx.rumble && ctx.sfx.rumble(); }
    else if (v.ev === 'spikesTell') { ctx.sfx.rattle && ctx.sfx.rattle(0.5); say(px(v.x), py(v.y) - 12, 'THE SPIKES RISE', '#ff9a5c'); }
    else if (v.ev === 'shutter') { say(px(v.x), py(v.y) + 10, 'THE SUN COMES IN', '#fff6c8'); }
    else if (v.ev === 'doomed') { const e = ctx.enemies().find(q => q.alive && q.kp === 'deathless' && q.kpId === v.id); if (e) { e.kpDoom = true; ctx.hurtFoe(e, 99999, e.x); }
      say(v.x, v.y - 34, v.by === 'sun' ? 'THE SUN TAKES THE DEATHLESS' : v.by === 'spikes' ? 'THE SPIKES TAKE THE DEATHLESS' : 'THE PRESS TAKES THE DEATHLESS', '#8fd160'); }
    else if (v.ev === 'debrisWarn') fx.push({ k: 'ring', x: v.x, dy: 0, t: KR.KR.debrisWarn + KR.KR.debrisFall });
    else if (v.ev === 'debris') { hurtHeroes([v.x - v.w / 2, v.x + v.w / 2, v.y - 40, v.y + 2], v.dmg, 'THE FALLING STONE', false); ctx.burst(v.x, v.y - 4, 12, [C.stoneHi, C.crack], 90, 0.5); ctx.shake && ctx.shake(3); }
    else if (v.ev === 'board') { const e = ctx.enemies().find(q => q.alive && q.kpBoard === v.id); const m = liftOf(); if (e && m) { e.kpHop = { t: KR.KR.boardTell, tx: m.x + m.w / 2 + (v.side > 0 ? 18 : -18) }; say(e.x, e.y - 30, '!', '#ff6b6b'); setTimeout0(() => { if (e.alive) { e.vy = -230; e.stagger = Math.max(e.stagger || 0, 0.7); } }, e); } }
  }
  const pending = []; const setTimeout0 = (fn, e) => pending.push({ fn, t: KR.KR.boardTell, e });
  function hurtHeroes(b, dmg, name, blockable, o = {}) {
    for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (P.dead || !ctx.upright(pp)) return;
      if (!ctx.overlap({ l: b[0], r: b[1], t: b[2], b: b[3] }, ctx.box(P))) return;
      if (o.once) { pp.kpOnce = pp.kpOnce || {}; if (pp.kpOnce[o.once]) return; pp.kpOnce[o.once] = 1; }
      ctx.damagePlayer(o.fromX ?? (b[0] + b[1]) / 2, dmg, { name, unblockable: !blockable }); if (o.shove) { P.vx = o.shove * 200; P.vy = -120; P.ground = false; } });
  }
  function tryDoor(asked) {
    if (R.door) return; const order = rooms().keyOrder, gd = rooms().greatDoor;
    if (KR.doorReady(R, order)) { R.door = true; const cs = []; for (let y = gd.y0; y <= gd.y1; y++) for (let x = gd.x0; x <= gd.x1; x++) cs.push([x, y]); cells(cs, ctx.T.AIR); ctx.shake && ctx.shake(8); ctx.sfx.heavy && ctx.sfx.heavy(); say(gd.x0 * TS, gd.y0 * TS - 10, 'FIVE KEYS: THE GREAT DOOR OPENS', '#ffd36b'); }
    else if (asked) say(gd.x0 * TS, gd.y0 * TS - 10, 'THE GREAT DOOR: ' + R.keys.size + ' OF 5 KEYS', '#c8a040');
  }

  /* ---------- UPDATE ---------- */
  H.update = dt => {
    if (!H.on()) return;
    const dl = foes(dt), m = liftOf(), on = !!m && ctx.players.some(pp => pp.onMover === m && !pp.dead);
    const ev = KR.kpStep(R, dt, { TS, deathless: dl, deathlessIds: ['d1', 'd2', 'd3'], lift: m ? { x: m.x, y: m.y, y0: m.y0, y1: m.y1, on } : null, alcoves: rooms().alcoves });
    for (const v of ev) applyRoom(v);
    for (let i = pending.length - 1; i >= 0; i--) { pending[i].t -= dt; if (pending[i].t <= 0) { pending[i].fn(); pending.splice(i, 1); } }
    /* the room presses hurt a hero in them (told: the rumble + the glow first) */
    for (const p of R.presses) if (KR.pressLive(p)) { const t = KR.pressTiles(p); if (t) hurtHeroes([t[0] * TS, (t[2] + 1) * TS, t[1] * TS, (t[3] + 1) * TS], 34, 'THE PRESS', false, { once: p.id + ':' + p.act, shove: p.out[0] < p.home[0] ? -1 : 1 }); }
    for (const sp of R.spikes) if (sp.st === 'up') hurtHeroes([sp.x0 * TS, (sp.x1 + 1) * TS, sp.y * TS + 6, (sp.y + 1) * TS], 30, 'THE SPIKE FLOOR', false, { once: sp.id + ':' + Math.floor(ctx.time() / 1.5) });
    /* the keys: walk onto one */
    for (const k of rooms().keys) if (!R.keys.has(k.id) && ctx.players.some(pp => !pp.dead && Math.abs(pp.x - (k.x * TS + 8)) < 12 && Math.abs(pp.y - (k.y + 1) * TS) < 18)) {
      KR.takeKey(R, k.id); ctx.sfx.chime && ctx.sfx.chime(); say(k.x * TS + 8, k.y * TS - 10, rooms().rooms[k.id].name + ': A KEY (' + R.keys.size + '/5)', '#ffd36b');
      if (R.keys.size === 5) say(k.x * TS + 8, k.y * TS - 24, 'FIVE KEYS: THE GREAT DOOR WILL OPEN', '#ffd36b'); }
    { const gd = rooms().greatDoor; if (!R.door && R.keys.size === 5 && ctx.players.some(pp => !pp.dead && Math.abs(pp.x - gd.x0 * TS) < 30 && pp.y > gd.y0 * TS)) tryDoor(false); }
    stepObjs(dt);
    for (const f of fx) f.t -= dt; fx = fx.filter(f => f.t > 0);
    if (m && on && once('rideTold')) say(m.x + m.w / 2, m.y - 30, 'THE STONE FALLS WHERE THE DUST RINGS', '#ffd36b');
  };
  /* a landed blow: the cleats and switches, a resting keg, and in the fight the arena's mirrors and switches */
  H.strike = hb => {
    if (!hb || !H.on()) return; const b = [hb.l, hb.t, hb.r, hb.b];
    for (const v of KR.strikeAt(R, b, TS)) applyRoom(v);
    for (const q of objs) if (q.kind === 'keg' && q.state === 'rest' && !q.lit && hb.l < q.x + 6 && hb.r > q.x - 6 && hb.t < q.y && hb.b > q.y - 14) { q.lit = true; q.fuse = KEG.fuseStruck; say(q.x, q.y - 22, 'THE FUSE TAKES', '#ff9a5c'); }
    if (S && ctx.bossActive) {
      const hit = (tx, ty) => hb.l < (tx + 1) * TS && hb.r > tx * TS && hb.t < (ty + 1) * TS && hb.b > ty * TS;
      for (const m of S.mirrors) if (hit(m.tx, m.ty) && KSM.ksStrikeMirror(S, m.id)) say(m.tx * TS + 8, m.ty * TS - 8, 'THE MIRROR TURNS', '#fff6c8');
      const ev = []; for (const s of S.switches) if (hit(S.G.x0 + s.x, S.G.floor - s.dy)) KSM.ksStrikeSwitch(S, s.id, ev); bossEvents(ev);
    }
  };

  /* ---------- THE KING ---------- */
  const A = () => (L() && L().arena && L().arena.boss === 'kingseals' ? L().arena : null);
  H.owns = e => e.t === 'kingseals';
  H.phase = () => (S ? S.ph : 1);
  H.spawnBoss = base => { const Ar = A(); if (!Ar || !H.on()) return null;
    S = KSM.newFight(KSM.geom(Ar.ks.x0, Ar.ks.floor, TS));
    return { ...base, t: 'kingseals', w: KSM.KS.w, h: KSM.KS.h, hp: S.hp, maxHp: S.hp, noGrav: true, markH: KSM.KS.markH, face: -1, mode: 'sleep', modeT: 0, open: 0, phase: 1, boss: true, x: S.x, y: S.y }; };
  function bossEvents(ev) {
    const e = ctx.boss;
    for (const v of ev) {
      if (v.t === 'say') { if (v.once && !once(v.once)) continue; say(v.x ?? S.x, S.y - 90, v.text, v.col); }
      else if (v.t === 'open') { say(S.x, S.y - 80, v.text, '#ffd36b'); ctx.ring && ctx.ring(S.x, S.y - 24, 40, '#ffd36b'); ctx.shake && ctx.shake(5); ctx.burst(S.x, S.y - 30, 16, [C.gold, C.sun, C.fire], 120, 0.6); }
      else if (v.t === 'ward') { say(S.x, S.y - 80, v.text, '#c8d8e8'); ctx.ring && ctx.ring(S.x, S.y - 24, 42, '#c8d8e8'); }
      else if (v.t === 'seal') { say((S.G.X0 + S.G.X1) / 2, S.G.floorY - 200, v.text, '#ffd36b'); ctx.shake && ctx.shake(7); fx.push({ k: 'flood', ph: v.ph, t: KSM.KS.sealT }); }
      else if (v.t === 'tell') { say(S.x, S.y - KSM.KS.markH, v.mark, v.mark === '!' ? '#ffd36b' : '#ff6b6b'); if (v.cols) fx.push({ k: 'marks', cols: v.cols, t: KSM.KS.moves[v.id].wind + 0.2, perch: v.id === 'spikes' && S.spikes && S.spikes[0] && S.spikes[0].perch }); }
      else if (v.t === 'hit') { if (v.tick) { tickHeroes(v.box, v.dmg, v.name); continue; } hurtHeroes(v.box, Math.round(v.dmg), v.name, !!v.blockable, { once: v.once, fromX: S.x, shove: v.shove });
        if (v.pull) for (const pp of ctx.players) if (!pp.dead && ctx.overlap({ l: v.box[0], r: v.box[1], t: v.box[2], b: v.box[3] }, ctx.box(pp)) && ctx.moveBody) ctx.moveBody(pp, -v.pull * 18, 0); }
      else if (v.t === 'flare') { for (const pp of ctx.players) if (!pp.dead && S.light && KSM.litBox(S, [pp.x - 5, pp.x + 5, pp.y - 14, pp.y])) hurtHeroes([pp.x - 1, pp.x + 1, pp.y - 2, pp.y], v.dmg, v.name, false); ctx.flash && ctx.flash(0.2); }
      else if (v.t === 'push') { for (const pp of ctx.players) if (!pp.dead && ctx.moveBody) ctx.moveBody(pp, v.dir * v.v * (pp.blocking ? 0.5 : 1) * lastDt, 0); }
      else if (v.t === 'gustWarn') say(S.x, S.G.floorY - 230, v.dir > 0 ? 'THE STORM GATHERS - BRACE (HOLD BLOCK) >>' : '<< THE STORM GATHERS - BRACE (HOLD BLOCK)', '#d8c8a0');
      else if (v.t === 'boulderWarn') fx.push({ k: 'ring', x: v.x, floor: true, t: KSM.KS.boulder.warn + 0.3 });
      else if (v.t === 'crushed') say(v.x, S.G.floorY - 40, v.text, '#8fd160');
      else if (v.t === 'court') say((S.G.X0 + S.G.X1) / 2, S.G.floorY - 180, v.text, '#c8a0ff');
      else if (v.t === 'courtTell') say(v.x, S.G.floorY - 40, v.text || v.mark, v.kind === 'priest' ? C.priest : '#ffd36b');
      else if (v.t === 'dead' && e) { e.hp = 0; }
    }
  }
  const tickAcc = new Map(); let lastDt = 1 / 60;
  function tickHeroes(b, dmg, name) { for (const pp of ctx.players) { if (pp.dead || !ctx.overlap({ l: b[0], r: b[1], t: b[2], b: b[3] }, ctx.box(pp))) continue; const a = (tickAcc.get(pp) || 0) + dmg; if (a >= 8) { tickAcc.set(pp, 0); hurtHeroes([pp.x - 1, pp.x + 1, pp.y - 2, pp.y], 8, name, false); } else tickAcc.set(pp, a); } }
  H.bossUpdate = (e, dt) => {
    if (!S) return; S.hp = e.hp; lastDt = dt;
    const heroes = ctx.players.map(pp => ({ x: pp.x, y: pp.y, alive: !pp.dead && ctx.upright(pp), ground: !!pp.ground, id: pp }));
    bossEvents(KSM.ksStep(S, dt, { heroes, rng: Math.random }));
    e.x = S.x; e.y = S.y; e.face = S.face; e.mode = S.cur ? S.cur.id + ':' + S.cur.st : S.mode; e.open = S.open; e.phase = S.ph; e.hp = Math.min(e.hp, S.hp);
  };
  H.take = (e, dmg) => { if (!S) return dmg; const keep = S.hp; const [d, word] = KSM.takeBlow(S, dmg); S.hp = keep;   /* main.js takes the returned d off e.hp; bossUpdate syncs S.hp */
    if (word) { e.guardWord = word; e.guardFx = 0.25; ctx.sfx.clank && ctx.sfx.clank(); } return d; };
  H.barName = () => 'THE KING OF FIVE SEALS' + (S ? (S.open > 0 ? '  OPEN: ' + KSM.KS_SAY.open[S.openKind] : S.ward > 0 ? '  WARDED' : S.seal > 0 ? '  A SEAL CRACKS' : '  SEAL ' + S.ph + '/4') : '');
  H.end = () => { if (S) { S.court = []; S.boulders = []; S.pools = []; S.cur = null; } };
  H.read = () => S && { ph: S.ph, mode: S.mode, open: S.open, openKind: S.openKind, ward: S.ward, hp: S.hp, lit: KSM.litFloorCols(S), court: S.court.length, n: S.n, keys: R ? [...R.keys] : [] };
  H.rooms = () => R;

  /* ---------- THE DRAWING (greybox) ---------- */
  const box = (g, x0, y0, x1, y1, cx, cy, col) => { g.fillStyle = col; g.fillRect(Rd(x0 - cx), Rd(y0 - cy), Rd(x1 - x0), Rd(y1 - y0)); };
  H.draw = (g, cx, cy, time) => {
    if (!H.on()) return; const l = L(), K = l.kp;
    /* the sun shafts: a white column from the drawn port */
    for (const s of K.shafts) { g.save(); g.globalAlpha = 0.16 + 0.04 * Math.sin(time * 2 + s.x); box(g, s.x * TS + 2, s.y0 * TS, s.x * TS + 14, (s.y1 + 1) * TS, cx, cy, C.sun); g.restore(); box(g, s.x * TS, s.y0 * TS - 3, s.x * TS + 16, s.y0 * TS, cx, cy, C.gold); }
    for (const sh of R.shutters) { box(g, sh.x * TS - 2, sh.y0 * TS - 4, sh.x * TS + 18, sh.y0 * TS, cx, cy, sh.open > 0 ? C.gold : C.goldDk); if (sh.open > 0) { g.save(); g.globalAlpha = 0.3; box(g, sh.x * TS + 1, sh.y0 * TS, sh.x * TS + 15, (sh.y1 + 1) * TS, cx, cy, C.sun); g.restore(); } }
    /* linen walls (burning: flicker) */
    for (const ln of R.linen) if (ln.st !== 'gone') { box(g, ln.x0 * TS, ln.y0 * TS, (ln.x1 + 1) * TS, (ln.y1 + 1) * TS, cx, cy, ln.st === 'burning' ? (Math.floor(time * 16) % 2 ? C.fire : '#ffd36b') : C.linen); g.fillStyle = '#a89070'; for (let y = ln.y0 * TS + 3; y < (ln.y1 + 1) * TS; y += 5) g.fillRect(Rd(ln.x0 * TS - cx), Rd(y - cy), (ln.x1 - ln.x0 + 1) * TS, 1); }
    /* cracked stone: drawn cracks */
    for (const c of R.cracked) if (c.st === 'whole') { g.strokeStyle = C.crack; g.beginPath(); const x = c.x0 * TS - cx, y = c.y0 * TS - cy, w = (c.x1 - c.x0 + 1) * TS, h = (c.y1 - c.y0 + 1) * TS; g.moveTo(x + 2, y + 2); g.lineTo(x + w / 2, y + h / 2); g.lineTo(x + w - 3, y + h - 2); g.moveTo(x + w / 2, y + h / 2); g.lineTo(x + 3, y + h - 4); g.stroke(); }
    /* the hung ledge's chains */
    for (const hgl of R.hung) if (!hgl.dropped) { g.fillStyle = '#8a919c'; for (const x of [hgl.x0, hgl.x1]) g.fillRect(Rd(x * TS + 7 - cx), Rd((hgl.y - 3) * TS - cy), 1, 3 * TS); }
    /* weights + cleats */
    for (const w of R.weights) { if (w.st === 'hung') { g.fillStyle = '#c8b088'; g.fillRect(Rd(w.rope[0] * TS + 7 - cx), Rd(w.rope[1] * TS - cy), 1, (w.cleat[1] - w.rope[1]) * TS); } box(g, w.cleat[0] * TS + 4, w.cleat[1] * TS + 4, w.cleat[0] * TS + 12, w.cleat[1] * TS + 12, cx, cy, w.st === 'hung' ? C.gold : C.goldDk); }
    /* presses: the niche, the tell glow over the lane, the slab with its spiked face */
    for (const p of R.presses) {
      const [ox0, oy0, ox1, oy1] = p.out;
      if (p.st === 'tell') { g.save(); g.globalAlpha = 0.18 + 0.12 * Math.sin(time * 20); box(g, ox0 * TS, oy0 * TS, (ox1 + 1) * TS, (oy1 + 1) * TS, cx, cy, '#ff6b6b'); g.restore(); }
      const t = KR.pressTiles(p) || p.home; box(g, t[0] * TS, t[1] * TS, (t[2] + 1) * TS, (t[3] + 1) * TS, cx, cy, p.jam > 0 ? '#3a3a44' : C.press);
      const face = p.out[0] < p.home[0] ? t[0] * TS : (t[2] + 1) * TS - 3; g.fillStyle = C.spike; for (let y = t[1] * TS + 2; y < (t[3] + 1) * TS; y += 4) g.fillRect(Rd(face - cx), Rd(y - cy), 3, 2);
      if (p.jam > 0) ctx.text('JAMMED ' + Math.ceil(p.jam), Rd((t[0] + t[2] + 1) / 2 * TS - cx), Rd(t[1] * TS - 6 - cy), '#ffd36b', 'center', 4); }
    /* switches */
    for (const s of R.switches) { const x = s.x * TS - cx, y = s.y * TS - cy; g.fillStyle = C.stoneHi; g.fillRect(Rd(x + 4), Rd(y + 2), 8, 12); g.fillStyle = s.cd > 0 ? '#ffffff' : C.gold; g.fillRect(Rd(x + 6), Rd(y + 4), 4, 4); }
    /* spike floors */
    for (const sp of R.spikes) { const up = sp.st === 'up' ? 6 : sp.st === 'rising' ? 2 : 0; g.fillStyle = sp.st === 'down' ? '#5a5248' : C.spike; for (let x = sp.x0 * TS; x < (sp.x1 + 1) * TS; x += 4) g.fillRect(Rd(x - cx), Rd((sp.y + 1) * TS - 1 - up - cy), 2, 1 + up); }
    /* the deathless' seal (a grey ring over each) */
    for (const e of ctx.enemies()) if (e.alive && e.kp === 'deathless') { g.strokeStyle = '#c8c0b0'; g.beginPath(); g.arc(Rd(e.x - cx) + 0.5, Rd(e.y - (e.h || 22) - 6 - cy) + 0.5, 4, 0, Math.PI * 2); g.stroke(); }
    else if (e.alive && e.kp === 'gilded' && e.gg) { g.fillStyle = e.gg.strip > 0 ? '#ffffff' : C.gold; g.fillRect(Rd(e.x + (e.face || 1) * 5 - cx) - 1, Rd(e.y - 12 - cy), 3, 10); if (e.gg.strip > 0) { g.globalAlpha = 0.4; g.fillRect(Rd(e.x - cx) - 6, Rd(e.y - 18 - cy), 12, 1); g.globalAlpha = 1; } }
    /* keys + the great door */
    for (const k of K.keys) if (!R.keys.has(k.id)) { const x = Rd(k.x * TS + 8 - cx), y = Rd(k.y * TS + 8 - cy + Math.sin(time * 3) * 2); g.fillStyle = C.gold; g.fillRect(x - 2, y - 4, 4, 4); g.fillRect(x - 1, y, 2, 6); g.fillRect(x, y + 3, 3, 1); }
    { const gd = K.greatDoor; if (!R.door) { box(g, gd.x0 * TS, gd.y0 * TS, (gd.x1 + 1) * TS, (gd.y1 + 1) * TS, cx, cy, C.stone); K.keyOrder.forEach((id, i) => { const x = gd.x0 * TS + 16, y = gd.y0 * TS + 10 + i * 18; g.strokeStyle = C.gold; g.beginPath(); g.arc(Rd(x - cx) + 0.5, Rd(y - cy) + 0.5, 5, 0, Math.PI * 2); g.stroke(); if (R.keys.has(id)) { g.fillStyle = C.gold; g.fillRect(Rd(x - cx) - 2, Rd(y - cy) - 2, 5, 5); } }); } }
    /* the lift's deck (stone, chains up) */
    const m = liftOf(); if (m) { box(g, m.x, m.y, m.x + m.w, m.y + m.h, cx, cy, C.stoneHi); box(g, m.x, m.y, m.x + m.w, m.y + 2, cx, cy, C.gold); g.fillStyle = '#8a919c'; for (const dx of [6, m.w - 7]) g.fillRect(Rd(m.x + dx - cx), Rd(m.top - cy), 1, Rd(m.y - m.top)); }
    /* carried and lying things */
    for (const q of objs) { const x = Rd(q.x - cx), y = Rd(q.y - cy);
      if (q.kind === 'keg') { g.fillStyle = C.keg; g.fillRect(x - 4, y - 9, 8, 9); g.fillStyle = '#8a919c'; g.fillRect(x - 4, y - 7, 8, 1); g.fillRect(x - 4, y - 3, 8, 1); if (q.lit) { g.fillStyle = Math.floor(time * 20) % 2 ? '#ffffff' : C.fire; g.fillRect(x - 1, y - 12, 2, 3); } }
      else { g.fillStyle = '#6a4a2a'; g.fillRect(x - 1, y - 10, 2, 9); g.fillStyle = Math.floor(time * 14) % 2 ? C.fire : '#ffd36b'; g.fillRect(x - 2, y - 14, 4, 4); }
      if (q.state === 'held' && q.holder && !q.holder.dead) { const h = q.holder, v = CT.launchOf(q.thrKind, h, ctx.keys ? ctx.keys() : {}), arc = CT.predictArc(q.thrKind, q.x, q.y - 6, v, solidPx); CT.drawArc(g, arc, cx, cy, time, q.kind === 'keg' ? '#ffd36b' : C.fire); } }
    for (const c of K.cressets) { const x = Rd(c.x * TS + 8 - cx), y = Rd((c.y + 1) * TS - cy); g.fillStyle = C.goldDk; g.fillRect(x - 4, y - 10, 8, 10); g.fillStyle = Math.floor(time * 10) % 2 ? C.fire : '#ffd36b'; g.fillRect(x - 3, y - 14, 6, 4); }
    for (const r of K.racks) { const x = Rd(r.x * TS + 8 - cx), y = Rd((r.y + 1) * TS - cy); g.fillStyle = C.stoneHi; g.fillRect(x - 7, y - 2, 14, 2); }
    /* the told rings (debris on the deck, boulders on the floor) */
    for (const f of fx) if (f.k === 'ring') { const yy = f.floor && S ? S.G.floorY : (m ? m.y : 0); g.strokeStyle = '#ff6b6b'; g.globalAlpha = 0.5 + 0.4 * Math.sin(time * 18); g.beginPath(); g.ellipse(Rd(f.x - cx), Rd(yy - cy), 9, 3, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; for (let i = 0; i < 3; i++) g.fillRect(Rd(f.x - 6 + i * 6 - cx), Rd(yy - 40 - ((time * 60 + i * 13) % 36) - cy), 1, 2); }
    if (S) drawArena(g, cx, cy, time);
  };
  function drawArena(g, cx, cy, time) {
    const G = S.G;
    if (S.light) for (const p of BP.fromSegs(S.light.segs, TS)) BP.drawBeam(g, p, cx, cy, time, { kind: 'sun', ring: true });
    for (const m of S.mirrors) { const x = Rd(m.tx * TS + 8 - cx), y = Rd(m.ty * TS + 8 - cy), s = m.state === '/' ? 1 : -1; g.fillStyle = C.goldDk; g.fillRect(x - 1, y + 4, 2, 12); g.fillStyle = C.gold; for (let i = -6; i <= 6; i++) g.fillRect(x + i, y - s * i, 1, 2); }
    for (const b of KSM.KS_ARENA.braziers) { const x = Rd(G.px(b) - cx), y = Rd(G.floorY - cy); g.fillStyle = C.goldDk; g.fillRect(x - 5, y - 12, 10, 12); if (S.ph >= 2) { g.fillStyle = Math.floor(time * 10) % 2 ? C.fire : '#ffd36b'; g.fillRect(x - 4, y - 17, 8, 5); } }
    for (const r of S.racks) { const x = Rd(G.px(r.c) - cx), y = Rd(G.floorY - cy); g.fillStyle = C.stoneHi; g.fillRect(x - 7, y - 2, 14, 2); if (r.has && S.ph >= 2) { g.fillStyle = C.keg; g.fillRect(x - 4, y - 11, 8, 9); } }
    for (const s of S.switches) { const x = Rd(G.px(s.x) - 8 - cx), y = Rd((G.floor - s.dy) * TS - cy); g.fillStyle = C.stoneHi; g.fillRect(x + 4, y + 2, 8, 12); g.fillStyle = s.lock > 0 ? C.priest : S.ph >= 3 ? C.gold : '#5a5248'; g.fillRect(x + 6, y + 4, 4, 4); }
    for (const p of S.presses) { if (p.st === 'tell') { const [l, r] = KSM.pressLane(S, p); g.save(); g.globalAlpha = 0.2 + 0.12 * Math.sin(time * 20); box(g, l, G.floorY - 32, r, G.floorY, cx, cy, '#ff6b6b'); g.restore(); }
      const b = KSM.pressBox(S, p); const hb = b || [p.from < p.to ? G.X0 : G.X1 - TS, p.from < p.to ? G.X0 + TS : G.X1, G.floorY - 32, G.floorY]; box(g, hb[0], hb[2], hb[1], hb[3], cx, cy, C.press);
      g.fillStyle = C.spike; const face = p.from < p.to ? hb[1] - 3 : hb[0]; for (let y = hb[2] + 2; y < hb[3]; y += 4) g.fillRect(Rd(face - cx), Rd(y - cy), 3, 2); }
    for (const q of S.court) { const x = Rd(q.x - cx), y = Rd(q.y - cy), h = q.st === 'rise' ? Rd(22 * (1 - q.t)) : 22; g.fillStyle = q.kind === 'priest' ? C.priest : C.dead; g.fillRect(x - 5, y - h, 10, h); g.strokeStyle = '#c8c0b0'; g.beginPath(); g.arc(x + 0.5, y - h - 6 + 0.5, 3, 0, Math.PI * 2); g.stroke(); }
    for (const pl of S.pools) { g.fillStyle = Math.floor(time * 12) % 2 ? C.fire : '#ffd36b'; g.fillRect(Rd(G.px(pl.c) - 10 - cx), Rd(G.floorY - 4 - cy), 20, 4); }
    for (const b of S.boulders) if (b.t <= KSM.KS.boulder.warn && b.t > 0) { const k = 1 - b.t / KSM.KS.boulder.warn; if (k > 0.7) box(g, b.x - 8, G.floorY - 200 + 190 * (k - 0.7) / 0.3 - 16, b.x + 8, G.floorY - 200 + 190 * (k - 0.7) / 0.3, cx, cy, C.stoneHi); }
    for (const f of fx) if (f.k === 'marks') for (const c of f.cols) { const y = f.perch ? G.ledgeY : G.floorY; g.fillStyle = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#ffd36b'; g.fillRect(Rd(G.px(c) - 7 - cx), Rd(y - 2 - cy), 14, 2); }
  }
  /* the King himself (greybox: a tall gold-armoured king with a crook; every move's windup/release named over him until the art lane draws the poses) */
  H.drawBoss = (g, e, cx, cy, time) => {
    if (!S) return; const x = Rd(e.x - cx), y = Rd(e.y - cy), f = S.face, k = KSM.KS;
    const pose = S.cur ? k.moves[S.cur.id].pose[S.cur.st === 'wind' ? 0 : 1] : S.mode;
    g.fillStyle = S.open > 0 ? '#ffffff' : C.gold; g.fillRect(x - k.w / 2, y - k.h + 10, k.w, k.h - 10);
    g.fillStyle = C.goldDk; g.fillRect(x - k.w / 2, y - 20, k.w, 3); g.fillRect(x - 8, y - k.h, 16, 12);
    g.fillStyle = '#1b1626'; g.fillRect(x - 5 + f * 2, y - k.h + 4, 3, 2); g.fillRect(x + 2 + f * 2, y - k.h + 4, 3, 2);
    const wind = S.cur && S.cur.st === 'wind'; g.fillStyle = '#c8b088'; g.fillRect(x + f * (k.w / 2 + (wind ? -4 : 6)), y - k.h - (wind ? 14 : 2), 2, 40);
    for (let i = 0; i < 4; i++) { g.fillStyle = i < S.ph - 1 ? '#5a5248' : C.gold; g.fillRect(x - 14 + i * 8, y - k.h - 10, 5, 5); }   /* his seals: the cracked ones grey */
    if (S.open > 0) { const kk = S.open / k.openT; g.strokeStyle = '#ffd36b'; g.beginPath(); g.arc(x + 0.5, y - 26 + 0.5, 30, 0, Math.PI * 2); g.stroke(); g.fillStyle = '#1b1626'; g.fillRect(x - 20, y - k.h - 22, 40, 3); g.fillStyle = '#ffd36b'; g.fillRect(x - 20, y - k.h - 22, Rd(40 * kk), 3); ctx.text('OPEN', x, y - k.h - 30, '#ffd36b', 'center', 5); }
    else if (S.ward > 0) { g.strokeStyle = '#c8d8e8'; g.beginPath(); g.arc(x + 0.5, y - 26 + 0.5, 32, 0, Math.PI * 2); g.stroke(); ctx.text('WARDED', x, y - k.h - 26, '#c8d8e8', 'center', 5); }
    if (pose && pose !== 'walk') ctx.text(String(pose).toUpperCase(), x, y + 8, '#9aa39a', 'center', 3);   /* (greybox: the pose's name until the art) */
    if (e.guardFx > 0 && e.guardWord) { e.guardFx -= 1 / 60; ctx.text(e.guardWord, x, y - k.h - 40, '#e8c070', 'center', 5); }
  };
  H.drawOver = (g, cx, cy, time) => {
    if (!S || !ctx.bossActive) return; const G = S.G;
    if (S.dark) { g.save(); g.globalAlpha = 0.45; g.fillStyle = '#05040a'; g.fillRect(Rd(G.X0 - cx), Rd(G.floorY - 22 * TS - cy), G.X1 - G.X0, 22 * TS + 4); g.restore(); }   /* P2: the capstone shut (the braziers' fire is all the light) */
    for (const f of fx) if (f.k === 'flood') { const col = ['', C.sun, C.fire, C.press, '#d8c8a0'][f.ph] || C.gold; g.save(); g.globalAlpha = 0.25 * Math.min(1, f.t); g.fillStyle = col; g.fillRect(Rd(G.X0 - cx), Rd(G.floorY - 22 * TS - cy), G.X1 - G.X0, 22 * TS); g.restore(); }
    if (S.storm && S.gust.st !== 'calm') { g.save(); g.globalAlpha = S.gust.st === 'gust' ? 0.22 : 0.08; g.fillStyle = '#d8c8a0'; for (let i = 0; i < 40; i++) { const xx = ((i * 53 + time * 400 * S.gust.dir) % (G.X1 - G.X0) + (G.X1 - G.X0)) % (G.X1 - G.X0); g.fillRect(Rd(G.X0 + xx - cx), Rd(G.floorY - 20 - (i * 37) % 300 - cy), 6, 1); } g.restore(); }
  };
  return H;
}
