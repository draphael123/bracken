// src/tourney-hands.js - THE TOURNEY's HANDS (claude/tourney, the OPUS GREYBOX). src/tourney.js lays the meadow; this runs it:
//   THE HORSE        inside a ride's columns (L.ty.rides) a hero is mounted. In the open lists it is THE MINECART'S SIBLING: its pace is src/minecart.js
//                    cartSpeed (trot = the cart's cruise, gallop = its pump, rein = its brake to a walk - never a stop, never back), a hurdle ridden into
//                    is a told bump and a bounce. In THE CHAMPION'S LISTS the ride is two-way (LEFT / RIGHT gallop that way, nothing pulls up) and it ends
//                    when he is unhorsed (src/ty-champion-hands.js mountedPhase).
//   THE COUCHED LANCE HOLD ATTACK (a tap is still a sword blow: main.js swallows the hold's heavy while mounted). It lowers after LANCE.lower s, holds
//                    LANCE.hold s, then the arm tires (LANCE.tired s up). Couched at pace >= LANCE.pace it takes rings, strikes straw targets, spins
//                    quintains and UNHORSES a mounted lancer or horse archer (damage swordDmg x LANCE.k - the skill-k rule).
//   THE QUINTAINS    struck (a blow or the lance) they spin; the arm comes round told: upright in its sweep = hit (10) and flung; braced (block) = flung, no
//                    hurt (THE CARRY: L.strikers tells the reach); ducked = it passes over. At the gallop you are past before it comes round.
//   THE HORSE ARCHER (tyarcher, the level's one new foe) - mounted, circles its beat, a told draw ('!'), an aimed arrow (blockable). x0.6 in the saddle;
//                    the couched lance puts him over and he fights on foot.
// GREYBOX DRAWING (the sonnet art lane draws the final). main.js calls (one tagged line each): on, reset, mounted, couch, drive, update, strike, spawn,
// archer, takeArcher, drawBack, drawHorse, drawLance, drawArcher, drawOver, read. Pure enough for node: tools/tourney.mjs drives it with a fake ctx.
import { cartSpeed, MC } from './minecart.js';   /* THE SHARED VEHICLE CODE: the horse's trot / gallop / rein is the cart's pace model */
import { TY } from './tourney.js';
import { TY_SAY } from './ty-lines.js';

export const HORSE = { arenaGallop: 230, arenaAcc: 420, arenaStop: 520, bumpDmg: 12, bumpBack: 120, bumpCd: 0.6, minRide: 8 };
export const LANCE = { lower: 0.18, hold: 1.4, tired: 0.7, pace: 110, reach: 30, height: 16, k: 1.5, hitR: 10 };
export const QUINT = { tell: 0.45, sweep: 0.3, rest: 0.5, reach: 30, top: 34, dmg: 10 };
export const ARCHER = { hp: 64, footHp: 0, w: 20, h: 28, footW: 10, footH: 14, ride: 80, sense: 280, senseY: 90, drawTell: 0.6, footTell: 0.75, cd: 2.2, footCd: 2.8, arrowV: 270, arrowDmg: 14, arrowLife: 2.2, barding: 0.6, down: 1.0 };
const SOUND = { mount: s => (s.snort || s.ui || s.tell)(), groom: s => (s.ui || s.tell)(), couch: s => (s.clank || s.tell)(), tired: s => (s.thud || s.tell)(), ring: s => (s.coin || s.ui || s.tell)(),
  target: s => (s.thud)(), bump: s => (s.heavy || s.thud)(), spin: s => (s.whoosh || s.tell)(), armTell: s => (s.clank || s.tell)(), arm: s => (s.whoosh || s.thud)(), unhorse: s => { (s.heavy || s.thud)(); (s.clank || s.thud)(); },
  drawTell: s => (s.tell)(), loose: s => (s.bow || s.whoosh || s.tell)(), arrowHit: s => (s.thud)(), gallop: s => (s.snort || s.tell)() };
const R = Math.round;
const rect = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), R(w), R(h)); };

export function makeTourneyHands(ctx) {
  const H = {}; let S = null;
  const TS = ctx.TS, L = () => ctx.L, ty = () => (L() && L().ty) || null;
  const snd = k => { const f = SOUND[k]; if (f && ctx.sfx) try { f(ctx.sfx); } catch {} };
  const say = (x, y, t, col) => ctx.number && ctx.number(x, y, t, col || '#ffd36b');
  H.on = () => !!(L() && L().tourney);
  H.show = () => S;
  const fresh = () => ({ t: 0, rings: new Set(), targets: new Set(), quint: {}, arrows: [], told: {}, n: { mounts: 0, grooms: 0, couches: 0, tired: 0, rings: 0, targets: 0, spins: 0, sweeps: 0, carried: 0, armHits: 0, bumps: 0, unhorsed: 0, lanceHits: 0, arrows: 0, arrowHits: 0 } });
  H.reset = () => { if (!H.on()) { S = null; return; } S = fresh(); S.L = L(); for (const pp of ctx.players() || []) if (pp) { pp.tyHorse = null; pp.tyLance = null; } };
  const st = () => (S && S.L === L() ? S : (S = H.on() ? Object.assign(fresh(), { L: L() }) : null));
  /* ---------------- THE RIDES ---------------- */
  const rideAt = x => { const G = ty(); if (!G) return null; const tx = x / TS; return G.rides.find(r => tx >= r.x0 && tx < r.x1) || null; };
  H.rideAt = rideAt;
  H.rideOf = pp => { if (!H.on() || !pp || pp.dead || pp.swim || pp.climb || pp.zip || pp.zipRide) return null; const r = rideAt(pp.x); if (!r) return null;
    if (r.arena && !(ctx.arenaMounted ? ctx.arenaMounted() : true)) return null; return r; };
  H.mounted = pp => !!H.rideOf(pp);
  const horseOf = pp => pp.tyHorse || (pp.tyHorse = { v: 0, bounce: 0, bumpCd: 0, ride: null });
  const lanceOf = pp => pp.tyLance || (pp.tyLance = { held: false, heldT: 0, down: false, downT: 0, tired: 0, hits: new Set() });
  /* THE COUCH: main.js hands the held attack key here every frame while mounted */
  H.couch = (pp, held) => { lanceOf(pp).held = !!held; };
  H.couched = pp => !!(pp && pp.tyLance && pp.tyLance.down && H.mounted(pp));
  H.pace = pp => (pp && pp.tyHorse ? pp.tyHorse.v : 0);
  function stepLance(pp, dt) { const c = lanceOf(pp); c.tired = Math.max(0, c.tired - dt);
    if (!c.held || !H.mounted(pp)) { if (c.down) c.hits = new Set(); c.down = false; c.heldT = 0; return; }
    c.heldT += dt;
    if (!c.down && c.tired <= 0 && c.heldT >= LANCE.lower) { c.down = true; c.downT = 0; c.hits = new Set(); snd('couch'); st().n.couches++; }
    else if (c.down) { c.downT += dt; if (c.downT >= LANCE.hold) { c.down = false; c.tired = LANCE.tired; c.heldT = -1e9; c.hits = new Set(); snd('tired'); st().n.tired++; say(pp.x, pp.y - 40, TY_SAY.tired, '#bfe6f5'); } } }
  /* ---------------- THE HORSE (physics: main.js calls drive before the hero moves) ---------------- */
  const solidAt = (x, y) => ctx.solidAt ? ctx.solidAt(x, y) : false;
  H.drive = (P, dt, keys) => {
    const r = H.rideOf(P), c = horseOf(P), s = st();
    if (!r) { if (c.ride) { c.ride = null; if (!P.dead && s) { s.n.grooms++; snd('groom'); say(P.x, P.y - 36, TY_SAY.dismount, '#bfe6f5'); } } c.v = 0; stepLance(P, dt); return false; }
    if (c.ride !== r.id) { c.ride = r.id; c.v = r.arena ? 0 : MC.crawl; s.n.mounts++; snd('mount'); say(P.x, P.y - 40, TY_SAY.mounted, '#8fd160'); if (!s.told[r.id]) { s.told[r.id] = 1; ctx.hint && ctx.hint(r.arena ? TY_SAY.couch : TY_SAY.ride); } }
    c.bumpCd = Math.max(0, c.bumpCd - dt);
    const grounded = P.ground || P.coyote > 0, right = !!keys.right && !keys.left, left = !!keys.left && !keys.right;
    if (r.arena) {   /* THE CHAMPION'S LISTS: two-way; nothing held pulls the horse up */
      const want = right ? HORSE.arenaGallop : left ? -HORSE.arenaGallop : 0, acc = Math.sign(want) === Math.sign(c.v) || !c.v ? HORSE.arenaAcc : HORSE.arenaStop;
      c.v += Math.max(-acc * dt, Math.min(acc * dt, want - c.v)); if (Math.abs(c.v) > 6) P.face = Math.sign(c.v);
    } else {         /* THE OPEN LISTS: the cart's pace model - trot, gallop, rein to a walk; always forward */
      if (grounded) c.v = cartSpeed(c.v, { boost: right, brake: left }, dt);
      else if (right) c.v = Math.min(MC.boost, c.v + MC.accUp * 0.5 * dt); else if (left) c.v = Math.max(MC.crawl, c.v - MC.brake * 0.5 * dt);
      P.face = 1;
      /* A HURDLE ridden into (two rows of it at the horse's chest): the horse balks - a told bump and a bounce back */
      if (grounded && c.v > 0 && c.bumpCd <= 0) { const ax = P.x + 6 + Math.max(c.v, 30) * dt + 1; if (solidAt(ax, P.y - 4) && solidAt(ax, P.y - 12)) {
          c.bumpCd = HORSE.bumpCd; c.bounce = HORSE.bumpBack; c.v = MC.crawl; s.n.bumps++; snd('bump'); say(P.x, P.y - 40, TY_SAY.bump, '#ff9a5c');
          ctx.asPlayer(P, () => ctx.damage(ax, HORSE.bumpDmg, { name: 'THE HURDLE', unblockable: true, noKnock: true })); } }
    }
    let vx = c.v; if (c.bounce > 0) { vx = -c.bounce; c.bounce = Math.max(0, c.bounce - 600 * dt); }
    P.vx = vx; stepLance(P, dt); return true;
  };
  /* the lance tip of a couched hero at pace (or null) */
  const tipOf = pp => { if (!H.couched(pp) || Math.abs(H.pace(pp)) < LANCE.pace) return null; const f = pp.face || 1; return { x: pp.x + f * LANCE.reach, y: pp.y - LANCE.height, f }; };
  H.tipOf = tipOf;
  /* ---------------- THE QUINTAINS ---------------- */
  const qs = q => { const s = st(); return s.quint[q.id] || (s.quint[q.id] = { st: 'idle', t: 0, dir: 1, hit: new Set() }); };
  function spin(q, dir, by) { const k = qs(q); if (k.st !== 'idle') return false; k.st = 'tell'; k.t = QUINT.tell; k.dir = dir || 1; k.hit = new Set(); st().n.spins++; snd('spin'); snd('armTell');
    say(q.x, q.y - 44, TY_SAY.arm, '#ffd36b'); if (!st().told.quint) { st().told.quint = 1; ctx.hint && ctx.hint(TY_SAY.quint); } return true; }
  H.spin = spin;
  function stepQuints(dt) { const G = ty();
    for (const q of G.quints) { const k = qs(q); if (k.st === 'idle') continue; k.t -= dt;
      if (k.st === 'tell' && k.t <= 0) { k.st = 'sweep'; k.t = QUINT.sweep; snd('arm'); st().n.sweeps++; }
      else if (k.st === 'sweep') { for (const pp of ctx.players() || []) { if (!pp || pp.dead || k.hit.has(pp) || (ctx.upright && !ctx.upright(pp))) continue;
          if (Math.abs(pp.x - q.x) > QUINT.reach || pp.y < q.y - QUINT.top - 8 || pp.y > q.y + 4 || pp.ducking) continue;
          k.hit.add(pp); const braced = !!(pp.block || pp.blocking);
          if (!braced) { st().n.armHits++; ctx.asPlayer(pp, () => ctx.damage(q.x, QUINT.dmg, { name: 'THE QUINTAIN', unblockable: true, noKnock: true })); }
          st().n.carried++; pp.vx = k.dir * TY.carry.vx; pp.vy = TY.carry.vy; pp.ground = false; say(pp.x, pp.y - 36, TY_SAY.carried, '#8fd160'); }
        if (k.t <= 0) { k.st = 'rest'; k.t = QUINT.rest; } }
      else if (k.st === 'rest' && k.t <= 0) k.st = 'idle'; } }
  /* ---------------- THE COUCHED LANCE meets the world ---------------- */
  function stepLances() { const G = ty(), s = st();
    for (const pp of ctx.players() || []) { const tp = tipOf(pp); if (!tp) continue; const c = lanceOf(pp), near = (x, y, r = LANCE.hitR) => Math.abs(tp.x - x) < r && Math.abs(tp.y - y) < r + 4;
      for (const r of G.rings) if (!s.rings.has(r.id) && near(r.x, r.y)) { s.rings.add(r.id); s.n.rings++; snd('ring'); say(r.x, r.y - 14, TY_SAY.ring, '#ffd36b'); ctx.coins && ctx.coins(r.x, r.y, 3);
        const ride = rideAt(r.x), all = G.rings.filter(q => rideAt(q.x) === ride); if (ride && all.every(q => s.rings.has(q.id))) { say(r.x, r.y - 30, TY_SAY.rings, '#8fd160'); ctx.coins && ctx.coins(r.x, r.y, 10); } }
      for (const t of G.targets) if (!s.targets.has(t.id) && near(t.x, t.y, 12)) { s.targets.add(t.id); s.n.targets++; snd('target'); say(t.x, t.y - 14, TY_SAY.target, '#ffd36b'); ctx.coins && ctx.coins(t.x, t.y, 4); }
      for (const q of G.quints) if (near(q.x - (q.face || -1) * 4, q.y - 20, 14)) spin(q, tp.f, pp);
      if (ctx.lanceSquire) ctx.lanceSquire(pp);   /* THE CHAMPION's squire: the lance stops him too (src/ty-champion-hands.js) */
      for (const e of (ctx.enemies && ctx.enemies()) || []) { if (!e.alive || e.boss || c.hits.has(e) || e.t === 'tychampion') continue;
        if (Math.abs(tp.x - e.x) > (e.w || 10) / 2 + 6 || tp.y < e.y - (e.h || 14) - 4 || tp.y > e.y + 2) continue;
        c.hits.add(e); s.n.lanceHits++; const dmg = Math.round((ctx.swordDmg ? ctx.swordDmg() : 20) * LANCE.k);
        if (e.t === 'lancer' && e.mounted) { ctx.unhorse && ctx.unhorse(e); s.n.unhorsed++; }
        else if (e.t === 'tyarcher' && e.mounted) unhorseArcher(e);
        ctx.asPlayer(pp, () => ctx.hurt && ctx.hurt(e, dmg, pp.x)); } } }
  /* ---------------- THE HORSE ARCHER ---------------- */
  H.spawn = (ent, base) => { const x0 = (ent.x0 ?? ent.x - 8) * TS + 8, x1 = (ent.x1 ?? ent.x + 8) * TS + 8;
    return { ...base, t: 'tyarcher', w: ARCHER.w, h: ARCHER.h, hp: ARCHER.hp, maxHp: ARCHER.hp, mounted: true, mode: 'ride', modeT: 0.5, cd: 1 + (ent.x % 3) * 0.4, hx0: x0, hx1: x1, face: base.face || -1, aim: -1, vy: 0, squad: ent.squad }; };
  function unhorseArcher(e) { e.mounted = false; e.w = ARCHER.footW; e.h = ARCHER.footH; e.mode = 'down'; e.modeT = ARCHER.down; e.open = ARCHER.down; e.cd = ARCHER.footCd * 0.5;
    st().n.unhorsed++; snd('unhorse'); say(e.x, e.y - 40, TY_SAY.unhorsed, '#8fd160'); ctx.shake && ctx.shake(4); ctx.loose && ctx.loose(e); }
  H.unhorseArcher = unhorseArcher;
  H.takeArcher = (e, dmg) => (e.mounted && e.mode !== 'down' ? Math.max(1, Math.round(dmg * ARCHER.barding)) : dmg);
  const heroesNear = e => (ctx.players() || []).filter(p => p && !p.dead && (!ctx.upright || ctx.upright(p))).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x));
  H.archer = (e, dt) => { if (!e.alive) return; e.modeT -= dt; e.cd = Math.max(0, e.cd - dt); e.open = Math.max(0, (e.open || 0) - dt); e.anim = (e.anim || 0) + dt;
    const h = heroesNear(e)[0], dx = h ? h.x - e.x : 0, sees = h && Math.abs(dx) < ARCHER.sense && Math.abs(h.y - e.y) < ARCHER.senseY;
    let want = 0;
    switch (e.mode) {
      case 'ride': want = e.face * ARCHER.ride;
        if ((e.face > 0 && e.x >= e.hx1) || (e.face < 0 && e.x <= e.hx0)) { e.mode = 'wheel'; e.modeT = 0.4; }
        else if (sees && e.cd <= 0) { e.mode = 'drawTell'; e.modeT = ARCHER.drawTell; e.aim = Math.sign(dx) || e.face; snd('drawTell'); ctx.number && ctx.number(e.x, e.y - 40, '!', '#ffd36b'); }
        break;
      case 'wheel': want = 0; if (e.modeT <= 0) { e.face = e.x >= e.hx1 ? -1 : e.x <= e.hx0 ? 1 : -e.face; e.mode = 'ride'; e.modeT = 0.3; } break;
      case 'drawTell': want = e.face * ARCHER.ride * 0.5; if (h) e.aim = Math.sign(dx) || e.aim;   /* he keeps circling as he draws: the Parthian shot */
        if (e.modeT <= 0) { loose(e, h); e.mode = 'ride'; e.cd = ARCHER.cd; } break;
      case 'down': want = 0; if (e.modeT <= 0) { e.mode = 'stand'; e.modeT = 0.4; } break;
      case 'stand': want = 0; if (h) e.face = e.aim = Math.sign(dx) || e.face;
        if (sees && e.cd <= 0 && e.modeT <= 0) { e.mode = 'footTell'; e.modeT = ARCHER.footTell; snd('drawTell'); ctx.number && ctx.number(e.x, e.y - 26, '!', '#ffd36b'); } break;
      case 'footTell': want = 0; if (e.modeT <= 0) { loose(e, h); e.mode = 'stand'; e.cd = ARCHER.footCd; } break;
      default: e.mode = e.mounted ? 'ride' : 'stand';
    }
    e.vx = want; e.vy = Math.min(300, (e.vy || 0) + 1000 * dt);
    const r = ctx.moveBody ? ctx.moveBody(e, e.vx * dt, e.vy * dt) : (e.x += e.vx * dt, null);
    if (r && (r.ground || r.hitY)) e.vy = 0; if (r && r.hitX && e.mounted && e.mode === 'ride') { e.mode = 'wheel'; e.modeT = 0.4; } };
  function loose(e, h) { if (!h) return; const s = st(), ax = e.x + e.aim * 8, ay = e.y - (e.mounted ? 24 : 12), tx = h.x, ty0 = h.y - 10, d = Math.hypot(tx - ax, ty0 - ay) || 1;
    s.arrows.push({ x: ax, y: ay, vx: (tx - ax) / d * ARCHER.arrowV, vy: (ty0 - ay) / d * ARCHER.arrowV, t: ARCHER.arrowLife, from: e, key: 'ar' + (++s.n.arrows) }); snd('loose'); }
  function stepArrows(dt) { const s = st();
    for (const a of s.arrows) { a.t -= dt; a.x += a.vx * dt; a.y += a.vy * dt; if (solidAt(a.x, a.y)) { a.t = 0; continue; }
      for (const pp of ctx.players() || []) { if (!pp || pp.dead || a.t <= 0) continue; if (Math.abs(pp.x - a.x) < 7 && a.y > pp.y - 22 && a.y < pp.y + 1) { a.t = 0; s.n.arrowHits++; snd('arrowHit');
          ctx.asPlayer(pp, () => ctx.damage(a.x - Math.sign(a.vx) * 10, ARCHER.arrowDmg, { name: 'A HORSE ARCHER', who: a.from })); } } }
    s.arrows = s.arrows.filter(a => a.t > 0); }
  /* ---------------- ONE FRAME ---------------- */
  H.update = dt => { if (!H.on()) return; const s = st(); s.t += dt; stepQuints(dt); stepLances(); stepArrows(dt); };
  /* A HERO'S BLOW (an attack box): a quintain's shield */
  H.strike = (hb, pp) => { if (!H.on() || !hb) return; const G = ty(); for (const q of G.quints) { const sx = q.x + (q.face || -1) * 6, sy = q.y - 20;
      if (hb.l < sx + 8 && hb.r > sx - 8 && hb.t < sy + 12 && hb.b > sy - 12 && (!ctx.hitOnce || ctx.hitOnce(q))) spin(q, (pp && pp.face) || (ctx.hero && ctx.hero() ? ctx.hero().face : 1) || 1, pp); } };
  H.read = () => S && { n: { ...S.n }, rings: [...S.rings], targets: [...S.targets], arrows: S.arrows.length, quint: Object.fromEntries(Object.entries(S.quint).map(([k, v]) => [k, v.st])) };
  /* ================= THE GREYBOX DRAWING ================= */
  H.drawBack = (g, cx, cy, VW, VH, time) => { const G = ty(); if (!G) return; const x = v => R(v - cx), y = v => R(v - cy), vis = (a, b) => b * TS > cx - 40 && a * TS < cx + VW + 40;
    for (const p of G.props) { if (!vis(p.x0, p.x1)) continue; const X0 = x(p.x0 * TS), Wd = (p.x1 - p.x0 + 1) * TS, top = y(p.top * TS);
      if (p.kind === 'tent' || p.kind === 'pavilion') { rect(g, X0, top, Wd, y(TY.G * TS) - top, p.col || '#c84a3a'); for (let i = 0; i < Wd; i += 8) rect(g, X0 + i, top, 4, y(TY.G * TS) - top, 'rgba(255,255,255,0.18)'); rect(g, X0 + Wd / 2 - 1, top - 14, 2, 14, '#5a4632'); rect(g, X0 + Wd / 2 + 1, top - 14, 8, 5, '#ffd36b'); }
      else if (p.kind === 'stall' || p.kind === 'loft') { rect(g, X0, top, Wd, 4, p.kind === 'stall' ? '#d84a4a' : '#8a6a3a'); rect(g, X0, top + 4, 2, y(TY.G * TS) - top - 4, '#6a4a2a'); rect(g, X0 + Wd - 2, top + 4, 2, y(TY.G * TS) - top - 4, '#6a4a2a'); }
      else if (p.kind === 'royalbox' || p.kind === 'nest') { rect(g, X0, top, Wd, 4, '#6a3a8a'); rect(g, X0, top - 10, Wd, 2, '#ffd36b'); } }
    for (const rl of G.rails) { if (!vis(rl.x0, rl.x1)) continue; for (let c = rl.x0; c <= rl.x1; c += 3) rect(g, x(c * TS + 7), y(rl.row * TS), 2, 2 * TS, '#8a6a4a'); }
    for (const ln of G.lanes) { if (!vis(ln.x0, ln.x1)) continue; rect(g, x(ln.x0 * TS), y(ln.f * TS) - 2, (ln.x1 - ln.x0 + 1) * TS, 2, 'rgba(200,180,120,0.5)'); }
    for (const h of G.hurdles) { if (!vis(h.col, h.col)) continue; rect(g, x(h.col * TS) + 2, y((h.f - 2) * TS), 12, 2 * TS, '#a07a40'); rect(g, x(h.col * TS), y((h.f - 2) * TS) + 4, 16, 3, '#6a4a2a'); }
    for (const r of G.rings) { if (!vis(r.col, r.col)) continue; const taken = S && S.rings.has(r.id); rect(g, x(r.x) - 9, y(r.y) - 4, 2, y(TY.G * TS) - y(r.y), '#6a4a2a'); rect(g, x(r.x) - 9, y(r.y) - 4, 8, 2, '#6a4a2a');
      if (!taken) { g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.arc(x(r.x), y(r.y), 4, 0, Math.PI * 2); g.stroke(); } }
    for (const t of G.targets) { if (!vis(t.col, t.col)) continue; const done = S && S.targets.has(t.id); rect(g, x(t.x) - 6, y(t.y) - 8, 12, 24, done ? '#8a7a50' : '#d8c070'); if (!done) { rect(g, x(t.x) - 3, y(t.y) - 2, 6, 6, '#d84a4a'); rect(g, x(t.x) - 1, y(t.y), 2, 2, '#fff'); } }
    for (const q of G.quints) { const qx = x(q.x), qy = y(q.y); if (qx < -60 || qx > VW + 60) continue; const k = S && S.quint[q.id], a = k && k.st !== 'idle' ? (k.st === 'tell' ? time * 6 : time * 18) : 0;
      rect(g, qx - 2, qy - 36, 4, 36, '#6a4a2a'); rect(g, qx + (q.face || -1) * 8 - 4, qy - 28, 8, 14, '#c8ccd4'); rect(g, qx + (q.face || -1) * 8 - 1, qy - 23, 2, 2, '#ffd36b');
      const ax = Math.cos(a) * 26 * -(q.face || -1), kk = k && k.st === 'sweep'; rect(g, Math.min(qx, qx + ax), qy - 33, Math.abs(ax) + 1, 2, '#6a4a2a'); rect(g, qx + ax - 4, qy - 36, 8, 8, kk ? '#ff6b4a' : '#a07a40'); }   /* the arm and its sandbag, going round */
    for (const e of (L().ents || [])) { if (e.t !== 'tyhorse' && e.t !== 'tygroom') continue; if (!vis(e.x, e.x)) continue; const ex = x(e.x * TS + 8), ey = y((e.y + 1) * TS);
      if (e.t === 'tyhorse') { rect(g, ex - 12, ey - 18, 24, 10, '#8a5a3a'); rect(g, ex + 10, ey - 24, 6, 10, '#8a5a3a'); for (const lx of [-10, -4, 4, 10]) rect(g, ex + lx, ey - 8, 2, 8, '#5a3a2a'); rect(g, ex - 8, ey - 20, 16, 4, '#3a6ac8'); }
      else { rect(g, ex - 3, ey - 16, 6, 16, '#4a7a3a'); rect(g, ex - 3, ey - 20, 6, 5, '#e0b090'); } } };
  /* THE HORSE under a mounted hero (drawn before the hero) */
  H.drawHorse = (g, pp, cx, cy, time) => { if (!H.mounted(pp)) return; const f = pp.face || 1, px = R(pp.x - cx), py = R(pp.y - cy), v = Math.abs(H.pace(pp)), gait = v > 170 ? 14 : v > 60 ? 9 : 4, ph = Math.sin(time * gait) * 3;
    rect(g, px - 14, py - 14, 28, 9, '#8a5a3a'); rect(g, px + f * 12 - 3, py - 22, 7, 10, '#8a5a3a'); rect(g, px + f * 16 - 2, py - 20, 4, 3, '#6a3a2a');
    for (const [lx, k] of [[-11, 1], [-5, -1], [5, 1], [11, -1]]) rect(g, px + lx, py - 6, 2, 6 + (k * ph > 0 ? 0 : -2), '#5a3a2a');
    rect(g, px - 12, py - 15, 24, 3, '#3a6ac8'); };
  /* THE LANCE over a mounted hero: upright, lowering, couched (gold tip), tired (sagging) */
  H.drawLance = (g, pp, cx, cy, time) => { if (!H.mounted(pp)) return; const c = lanceOf(pp), f = pp.face || 1, px = R(pp.x - cx), py = R(pp.y - cy);
    if (c.down) { const lit = Math.abs(H.pace(pp)) >= LANCE.pace; rect(g, px + (f > 0 ? 2 : -LANCE.reach - 2), py - LANCE.height - 1, LANCE.reach, 2, '#d8c8a0'); rect(g, px + f * LANCE.reach - 2, py - LANCE.height - 2, 4, 4, lit ? '#ffd36b' : '#a8a090'); }
    else if (c.tired > 0) rect(g, px + f * 4, py - 30, 2, 22, '#a8a090');
    else { const k = c.held ? Math.min(1, c.heldT / LANCE.lower) : 0; rect(g, px + f * (4 + k * 8), py - 34 + k * 10, 2, 26, '#d8c8a0'); } };
  H.drawArcher = (g, e, cx, cy, time) => { const ex = R(e.x - cx), ey = R(e.y - cy), f = e.face || 1, a = e.aim || f;
    if (e.mounted) { rect(g, ex - 11, ey - 14, 22, 9, '#6a4a3a'); rect(g, ex + f * 10 - 3, ey - 21, 6, 9, '#6a4a3a'); for (const lx of [-9, -4, 4, 9]) rect(g, ex + lx, ey - 6, 2, 6, '#4a2a1a');
      rect(g, ex - 4, ey - 28, 8, 14, '#2a8a6a'); rect(g, ex - 3, ey - 33, 6, 5, '#e0b090'); }
    else { if (e.mode === 'down') { rect(g, ex - 8, ey - 5, 16, 5, '#2a8a6a'); return; } rect(g, ex - 4, ey - 14, 8, 14, '#2a8a6a'); rect(g, ex - 3, ey - 19, 6, 5, '#e0b090'); }
    const by = ey - (e.mounted ? 24 : 10), drawn = /Tell$/.test(e.mode); rect(g, ex + a * 6, by - 7, 2, 14, '#8a6a3a'); if (drawn) rect(g, ex + a * (drawn ? 1 : 6), by, 6, 1, '#fff'); };
  H.drawOver = (g, cx, cy, VW, VH, time) => { if (!S) return; for (const a of S.arrows) { const ax = R(a.x - cx), ay = R(a.y - cy), k = Math.atan2(a.vy, a.vx); rect(g, ax - Math.cos(k) * 6, ay - Math.sin(k) * 6, 2, 2, '#c8c0a0'); rect(g, ax - 1, ay - 1, 3, 3, '#e8e0c0'); }
    const G = ty(); for (const q of G.quints) { const k = S.quint[q.id]; if (k && k.st === 'tell') { const qx = R(q.x - cx), qy = R(q.y - cy); rect(g, qx - QUINT.reach, qy - QUINT.top, QUINT.reach * 2, 2, (time * 10) % 2 < 1 ? '#ff4a2a' : '#ffd36b'); } } };
  return H;
}
