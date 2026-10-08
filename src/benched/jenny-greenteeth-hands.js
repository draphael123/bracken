// ===== BENCHED (claude/lanterneater, 2026-10-07): UNWIRED - saved for a future mini (kelp armour: HIT HIGH body / HIT LOW hood). =====
// Daniel 10-07: Jenny's raft duel "just isn't working, clunky"; THE FOG CANAL's boss is THE LANTERN-EATER now (src/lantern-eater.js) on the same raft.
// Nothing imports this file: main.js, the lab, the marks, the hint lines and the music no longer name her. Her sprites stay in src/redraw/greenteeth_art.js
// and src/redraw/greenteeth_kelp.js. To bring her back as a mini, wire her as claude/canal4 did (git log -- src/jenny-greenteeth.js) and give her a room.
// src/jenny-greenteeth-hands.js - JENNY GREENTEETH'S HANDS (claude/lockkeeper; claude/jenny2; claude/canal4: THE RAFT DUEL + KELP ARMOUR).
// src/jenny-greenteeth.js is the fight, pure and proved in tools/greenteeth.mjs; this binds it to the world: THE RAFT (a mover the heroes stand on, that
// goes out onto her water, rocks, tips when she heaves it and is dragged lower), her blows on the heroes (the slam, the charge's bow-wave, the weed net that
// tangles - P.rootT - and the vine that yanks you to her), THE KELP (a blow at the bare angle lands whole, one on the kelp CLANKS and says which way to hit),
// a swing along her stuck arm, the raft kept as the ground a hero is handed back to when he falls into her water, and the drawing: the lock's back wall,
// the raft, and over everything her kelp, the bare part's gold outline (the shared OPEN read), her tells, OPEN and its clock, the ring of her wariness.
// main.js calls: spawnBoss, update, strike, weedMover, drawWall, drawBack, drawOver, camY, take, warded, cap, barName, alpha, end, read.
// Every teaching line goes through ctx.number with a line listed in src/hint-lines.js (the hint box).
import * as GM from './jenny-greenteeth.js';
import { bakeLockSkins } from '../redraw/greenteeth_art.js';
import * as K from '../redraw/greenteeth_kelp.js';   /* (claude/canal4art) the kelp's, the raft's and the stuck claws' art */
const { GT } = GM;

export function makeGreenteethHands(ctx) {
  let show = null, SK = null;
  const H = {};
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'greenteeth' ? ctx.L.arena : null);
  const skins = () => SK || (SK = bakeLockSkins());
  const R = Math.round;
  /* WHAT HURT: the health each of her blows took, by name (the pilots print it) */
  const hurt = (name, fn) => { const P = ctx.P, h0 = P.hp; const r = fn(); if (show) { const k = String(name), lost = Math.max(0, h0 - Math.max(0, P.hp)); show.hurt = show.hurt || {}; show.hurt[k] = (show.hurt[k] || 0) + lost; } return r; };
  H.show = () => show;
  H.on = () => !!(show && A());
  H.clear = () => { show = null; };
  const raftMover = () => (ctx.movers || []).find(m => m.gtRaft) || null;
  const cellI = (x, y) => y * ctx.LW() + x;
  /* THE LOCK WEARS ITS OWN SKINS: the gates' oak, the landings' quoins, the bed's setts */
  function skinChamber(S) { const lk = S.lock, sx = lk.sx, Rw = lk.R, ex = sx + GM.STAGE.W - 1, T = ctx.T, K = skins(), D = GM.STAGE.depth;
    const put = (x, y, spr, t) => { const i = cellI(x, y), c = ctx.cellGet(i); if (t === undefined || c[0] === t) ctx.cellSet(i, c[0], spr); };
    for (let y = Rw - GM.STAGE.top; y < Rw; y++) for (const x of [sx, ex]) put(x, y, K.gate[(y + (x === sx ? 0 : 1)) % 3 === 0 ? 1 : (y > Rw - 4 ? 2 : 0)], T.SOLID);
    for (let i = 1; i <= GM.STAGE.land; i++) for (let y = Rw; y <= Rw + D; y++) { put(sx + i, y, y === Rw ? K.walk : K.quoin[y % 2], T.SOLID); put(ex - i, y, y === Rw ? K.walk : K.quoin[y % 2], T.SOLID); }
    for (let x = sx + 1; x < ex; x++) { put(x, Rw + D, K.bed[x % 3], T.SOLID); put(x, Rw + D + 1, K.bed2, T.SOLID); } }
  function skinDoors(S) { const lk = S.lock, K = skins(); for (const x of [S.wallL, S.wallR]) for (let y = lk.R - GM.STAGE.door; y < lk.R; y++) { const i = cellI(x, y), c = ctx.cellGet(i); if (c[0] === ctx.T.SOLID && c[1] !== K.gate[0] && c[1] !== K.gate[2]) ctx.cellSet(i, c[0], K.gate[y > lk.R - 4 ? 2 : 0]); } }
  /* SPAWNING: a fresh attempt is a fresh show, the raft moored at the west landing, she asleep under her water */
  H.spawnBoss = base => { const S = A(); if (!S) return null;
    show = GM.newShow(GM.geom(S.lock.sx, S.lock.R, ctx.TS)); GM.startFight(show);
    skinChamber(S);
    const m = raftMover(); if (m) { m.x = show.raft.x; m.y = show.A.deck; m.w = show.raft.w; m.broken = false; }
    const e = GM.newGreenteeth({ ...base, t: 'greenteeth', w: GT.w, h: GT.h, hp: ctx.EHP.greenteeth, maxHp: ctx.EHP.greenteeth, noGrav: true, markH: GT.markH, face: -1 });
    e.x = show.A.mid; e.y = show.A.surf + 40; return e; };
  H.owns = e => e.t === 'greenteeth';
  H.frame = e => GM.gtFrame(e);
  H.alpha = e => (e.mode === 'sleep' || e.hidden ? 0.12 : 1);   /* (asleep under her water; under the raft as she charges: a shadow) */

  /* ---------- THE HEROES as the fight sees them ---------- */
  function heroes() { const m = raftMover(); return ctx.players.map(pp => ({ x: pp.x, y: pp.y, face: pp.face || 1, alive: ctx.upright(pp) && !pp.dead, ground: !!pp.ground, swim: !!pp.swim, onRaft: !!m && pp.onMover === m, pp })); }
  const keyed = (pp, key) => { pp.gtKeys = pp.gtKeys || new Map(); if (pp.gtKeys.size > 60) pp.gtKeys.clear(); if (pp.gtKeys.has(key)) return true; pp.gtKeys.set(key, 1); return false; };
  const boxOf = bx => ({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] });

  /* ---------- ONE FRAME OF HER ---------- */
  H.update = (e, dt) => {
    if (!show) return; const S = A(); if (!S) return;
    if (!show.skinnedDoors) { show.skinnedDoors = true; skinDoors(S); }
    e.bareHit = false;   /* (the angle of a blow is read as it lands: src/boss-greed.js asks it in the same frame) */
    for (const pp of ctx.players) { if (pp.atk < 0) pp.gtAirSwing = false; else if (pp.atk < 0.06 && !pp.ground && !pp.swim) pp.gtAirSwing = true; }   /* a swing begun in the air stays a jump attack */
    const hs = heroes(), m = raftMover();
    const evs = GM.stepShow(e, show, dt, {
      heroes: hs,
      say: mk => { if (mk === '!' || mk === '!!') ctx.number(e.x, e.y - 56, mk, mk === '!' ? '#ffd36b' : '#ff6b6b'); },
      number: (x, y, line, col) => ctx.number(x, y, line, col),
      sound: k => { const fn = SOUND[k]; if (fn) fn(); },
      raft: r => { if (m) { m.x = r.x; m.w = r.w; m.y = show.A.deck + Math.round(r.bob); m.broken = false; } },
      /* THE HEAVE: a hero on the raft slides toward the low side (he can walk against it) */
      slide: dx => { for (const pp of ctx.players) if (m && pp.onMover === m && !pp.dead) { pp.x += dx; show.n.slid = (show.n.slid || 0) + Math.abs(dx); } },
      /* a band along the deck: LOW (a jump clears it) */
      band: (kind, [t, b], x0, x1, d, name, key, o = {}) => { for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.P; if (!ctx.upright(pp) || P.dead) return;
        if (P.x < x0 || P.x > x1) return; const hb = kind === 'high' ? ctx.duckBox(P) : ctx.box(P); if (!(hb.b > t && hb.t < b) || keyed(pp, key)) return;
        const res = hurt(name, () => ctx.damagePlayer(o.from ?? e.x, d, { who: e, name, unblockable: true })); if (res === 'hit' && name === GM.MOVE_NAME.charge) show.n.chargeHit++; if (o.push && !P.dead) { P.vx = o.push; } }); },
      /* HER VINE: at your feet; caught, YANKED toward her through the air (a throw, never a teleport) */
      vine: ([t, b], x0, x1, d, key, toX) => { let got = null; for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.P; if (!ctx.upright(pp) || P.dead) return;
        if (P.x < x0 || P.x > x1) return; const hb = ctx.box(P); if (!(hb.b > t && hb.t < b) || keyed(pp, key)) return;
        const res = hurt(GM.MOVE_NAME.vine, () => ctx.damagePlayer(toX, d, { who: e, name: GM.MOVE_NAME.vine, unblockable: true, noKnock: true }));
        if (res !== 'hit' || P.dead) return; got = pp;
        P.vx = (Math.sign(toX - P.x) || 1) * GT.vinePull; P.vy = -GT.vineLift; P.ground = false; P.onMover = null; P.hurt = Math.max(P.hurt || 0, GT.vineHurt);
        ctx.burst(P.x, P.y - 4, 8, ['#3e6030', '#7aa83a', '#9ac850'], 60, 0.4); SOUND.weed();
        if (!show.told.vined) { show.told.vined = true; ctx.number(P.x, P.y - 40, 'HER VINE HAS YOU', '#ff6b6b'); } }); return got; },
      /* HER SLAM: a hero under her claws is hurt (no shield turns it); one rolling through is not under them - the claws go into the timber */
      slam: (bx, d) => { let hit = false; for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.P; if (!ctx.upright(pp) || P.dead || P.dodge > 0) return;
        if (!ctx.overlap(boxOf(bx), ctx.box(P))) return; hit = true; hurt(GM.MOVE_NAME.slam, () => ctx.damagePlayer(e.x, d, { who: e, name: GM.MOVE_NAME.slam, unblockable: true })); }); return hit; },
      /* HER WEED NET: caught, a hero is tangled a moment (rooted) */
      net: (bx, d, root) => { let n = 0; for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.P; if (!ctx.upright(pp) || P.dead || P.dodge > 0) return;
        if (!ctx.overlap(boxOf(bx), ctx.box(P))) return; n++; hurt(GM.MOVE_NAME.net, () => ctx.damagePlayer(e.x, d, { who: e, name: GM.MOVE_NAME.net, unblockable: true, noKnock: true }));
        P.rootT = Math.max(P.rootT || 0, root); P.vx = 0; ctx.burst(P.x, P.y - 8, 10, ['#3e6030', '#7aa83a', '#9ac850'], 50, 0.5);
        if (!show.told.netted) { show.told.netted = true; ctx.number(P.x, P.y - 40, 'TANGLED IN THE WEED', '#ff6b6b'); } }); return n > 0; },
    });
    for (const v of evs) {
      if (v.t === 'phase') ctx.enrage(e);
      if (v.t === 'stuck') { ctx.shakeCam(5); ctx.hitstop && ctx.hitstop(0.06); if (e.claw) { ctx.burst(e.claw.x, e.claw.y - 2, 12, ['#6a5030', '#a08050', '#d8c890'], 80, 0.5); ctx.dust(e.claw.x, e.claw.y, 6); } }
      if (v.t === 'slamHit' || v.t === 'slam' || v.t === 'heave' || v.t === 'haul') ctx.shakeCam(3);
      if (v.t === 'charge') { ctx.shakeCam(3); ctx.burst(e.x, show.A.surf, 12, ['#e8f4f0', '#7cc8c8', '#5e8a4a'], 70, 0.4); }
      if (v.t === 'lowered') { ctx.shakeCam(6); const r = show.raft; for (const x of [r.x - 16, r.x + r.w + 16]) ctx.burst(x, show.A.surf, 14, ['#e8f4f0', '#bfe6f5', '#5e8a4a'], 90, 0.6); }
      if (v.t === 'kelp') ctx.burst(e.x, e.y - GT.h / 2, 10, ['#3e6030', '#7aa83a', '#9ac850'], 50, 0.5);
    }
    /* THE RAFT IS THE GROUND A FALL IN HER WATER HANDS YOU BACK TO (main.js L.waterHurts reads P.safe) - before her and on her raft, never the corridor */
    const r = show.raft; for (const pp of ctx.players) if (m && pp.onMover === m && !pp.dead) pp.safe = { x: Math.max(r.x + 16, Math.min(r.x + r.w - 16, pp.x)), y: show.A.deck - 2, L: ctx.L };
    H.lastEvents = evs;
  };

  /* ---------- THE RAFT: main.js moves a weed mover through here (its old slot); the show says where it is ---------- */
  H.weedMover = (m, dt) => { if (!m.gtRaft) { m.broken = true; return; } if (!show) { m.broken = false; return; } const r = show.raft;
    if (show.dead) { const d = r.to - r.x; if (Math.abs(d) > 0.5) r.x += Math.sign(d) * Math.min(Math.abs(d), GT.raftSpeed * dt); }   /* (after her death: to the east landing) */ m.x = r.x; m.w = r.w; m.y = show.A.deck + Math.round(r.bob); m.broken = false; };

  /* ---------- A HERO'S SWING ALONG HER STUCK ARM ---------- */
  H.strike = hb => {
    if (!show || !hb) return; const e = ctx.boss; if (!e || e.t !== 'greenteeth' || !e.alive || !ctx.bossActive) return;
    for (const rr of GM.strikeAt(e, show, hb, ctx.P.hitSet)) if (rr.what === 'claw' && ctx.hurtBoss && ctx.hurtBoss(e)) ctx.burst(e.claw ? e.claw.x : e.x, (e.claw ? e.claw.y : e.y) - 6, 6, ['#5e8a4a', '#86b060'], 60, 0.35);
  };
  /* ---------- THE KELP: what a blow takes off her, by its angle (src/jenny-greenteeth.js blowAngle); a blow on the kelp CLANKS and says so ---------- */
  H.take = e => { if (!show) return GM.gtTake(e); const ang = GM.blowAngle(ctx.P), k = GM.gtTakeAt(e, show, ang); e.lastAngle = ang;
    if (k >= 1 && !GM.gtOpen(e)) { e.bareHit = true; show.n.bare++; } return k; };
  H.warded = e => { if (!show) return; show.n.clank++; ctx.SFX.clank(); ctx.sparks(e.x, e.y - GT.h / 2, -(ctx.P.face || 1), 5);
    if (!(e.wardSaid > ctx.time)) { e.wardSaid = ctx.time + 0.8; const wary = show.wary && show.wary.t > 0; ctx.number(e.x, e.y - 60, wary ? 'WARDED' : show.kelp === 'hood' ? 'KELP - HIT LOW' : 'KELP - HIT HIGH', wary ? '#9aa39a' : '#ffd36b'); } };
  H.cap = (e, dmg) => { const d = GM.gtCap(e, dmg); if (d < dmg && !(e.capSaid > ctx.time)) { e.capSaid = ctx.time + 3; ctx.number(e.x, e.y - 60, 'THAT OPENING IS SPENT: THE KELP TAKES IT', '#9aa39a'); } return d; };
  H.barName = b => (GM.gtOpen(b) ? 'JENNY GREENTEETH  STUCK' : show && show.wary && show.wary.t > 0 ? 'JENNY GREENTEETH  WARY' : show ? 'JENNY GREENTEETH  ' + (show.kelp === 'hood' ? 'HIT LOW' : 'HIT HIGH') : 'JENNY GREENTEETH');
  H.camY = ty => { const S = A(); if (!S) return ty; const VH = ctx.VH(), top = S.y0 - 8, bot = (S.lock.R + GM.STAGE.depth + 1) * ctx.TS;
    if (bot - top <= VH) return (top + bot) / 2 - VH / 2;
    return Math.max(bot - VH, Math.min(ty, top)); };
  /* HER DEATH: she sinks off the raft, and it drifts to the east landing (the way on) */
  H.end = e => { if (!show) return; show.arms = []; show.charge = null; show.raft.heave = 0; show.raft.to = show.A.moorE; show.dead = 0.001; e.claw = null; e.y = show.A.surf + 6; SOUND.die(); };
  H.read = () => show && { mode: ctx.boss && ctx.boss.mode, phase: ctx.boss && ctx.boss.phase, n: { ...show.n }, cycle: show.cycle, kelp: show.kelp, wary: show.wary && show.wary.t > 0 ? show.wary.k : null,
    raft: { x: Math.round(show.raft.x), w: show.raft.w, heave: +show.raft.heave.toFixed(2), low: show.raft.low }, arms: show.arms.map(a => ({ k: a.k, st: a.st, t: +a.t.toFixed(2), x: Math.round(a.x) })),
    charge: show.charge && { x: Math.round(show.charge.x), dir: show.charge.dir }, hurt: { ...(show.hurt || {}) } };

  /* ================= DRAWING ================= */
  /* THE LOCK'S BACK WALL (behind the tiles): coursed stone, slimed below the water, the night over the coping */
  H.drawWall = (cx, cy, time) => { void time;
    const S = A(); if (!S || !show) return; const g = ctx.g(), G = show.A, TS = ctx.TS, x0 = R(G.x0 - cx), w = R(G.x1 - G.x0), top = R(G.top + 2 * TS - cy), bed = R(G.bed - cy), sf = R(G.surf - cy);
    if (x0 > ctx.VW() || x0 + w < 0) return;
    g.fillStyle = '#34352f'; g.fillRect(x0, top, w, bed - top);
    for (let y = 0; y < bed - top; y += 8) { const row = (y / 8) | 0; g.fillStyle = '#26271f'; g.fillRect(x0, top + y, w, 1); for (let x = (row % 2) * 12; x < w; x += 24) g.fillRect(x0 + x, top + y, 1, 8); }
    g.fillStyle = 'rgba(20,34,22,0.45)'; g.fillRect(x0, sf - 24, w, bed - sf + 24); g.fillStyle = 'rgba(90,130,60,0.55)'; g.fillRect(x0, sf - 2, w, 2);   /* the tide-mark */
    g.fillStyle = '#5a5850'; g.fillRect(x0, top - 3, w, 3); g.fillStyle = '#76746a'; g.fillRect(x0, top - 3, w, 1);
    for (let i = 0; i < 14; i++) { const x = x0 + ((i * 97) % w), y = sf - 20 + ((i * 53) % 18); g.fillStyle = i % 2 ? '#3e6030' : '#2a4a22'; g.fillRect(x, y, 2 + (i % 3), 1); } };
  /* THE RAFT (before the bodies): the barge's own hull and lantern pole amidships, widened with the lock's timbers lashed either side; it tips with the heave,
     and dragged lower its ends are under the water */
  H.drawBack = (cx, cy, time) => {
    const S = A(); if (!S || !show) return; const g = ctx.g(), G = show.A, r = show.raft, y = R(G.deck + r.bob - cy), x = R(r.x - cx), w = r.w, mid = x + w / 2;
    if (x > ctx.VW() + 40 || x + w < -40) return;
    g.save(); g.translate(mid, y); g.rotate(r.tilt); g.translate(-mid, -y);
    const lw = r.low ? 0 : 0, tw = GT.raftW;
    if (r.low) { const cut = (tw - w) / 2; g.globalAlpha = 0.45; g.fillStyle = '#3a2c1c'; g.fillRect(x - cut, y + 2, cut, 4); g.fillRect(x + w, y + 2, cut, 4); g.globalAlpha = 1; }   /* the drowned ends, under the water */
    K.drawRaft(g, x, y, w, time);   /* (claude/canal4art) the lashed timbers on iron straps, barrel floats, ring-bolts, hemp lashings, rope fenders (src/redraw/greenteeth_kelp.js) */
    const bx = x + w / 2 - 48; g.fillStyle = '#2a1a10'; g.fillRect(bx, y + 2, 96, 6); g.fillStyle = '#7a2e1e'; g.fillRect(bx, y + 3, 96, 1);   /* her hull, amidships */
    g.fillStyle = '#2a2420'; g.fillRect(bx + 5, y - 30, 2, 30); g.fillRect(bx + 5, y - 32, 8, 1);   /* the lantern pole */
    const fl = 0.82 + 0.18 * Math.sin(time * 9); g.globalAlpha = fl; g.fillStyle = '#ffcf6a'; g.fillRect(bx + 10, y - 30, 4, 6); g.globalAlpha = 1; void lw;
    g.restore();
    /* the heave told: red arrows down the deck toward the low side, while she heaves and while it tips */
    const e = ctx.boss && ctx.boss.t === 'greenteeth' ? ctx.boss : null;
    if (e && (e.mode === 'heave' || r.heave > 0)) { const dir = e.mode === 'heave' ? (r.pendDir || 1) : r.dir, p = 0.5 + 0.5 * Math.sin(time * 14); g.globalAlpha = 0.4 + 0.5 * p; g.fillStyle = '#ff6b6b';
      for (let i = 20; i < w - 10; i += 40) { const ax = x + i, ay = y - 6; g.fillRect(ax - 4, ay, 9, 1); g.fillRect(ax + dir * 4, ay - 2, 1, 5); g.fillRect(ax + dir * 5, ay - 1, 1, 3); } g.globalAlpha = 1; }
    if (e && e.mode === 'lower') { const cut = (GT.raftW - GT.raftLow) / 2, p = 0.5 + 0.5 * Math.sin(time * 14); g.globalAlpha = 0.35 + 0.5 * p; g.fillStyle = '#ff6b6b'; g.fillRect(x, y - 2, cut, 2); g.fillRect(x + w - cut, y - 2, cut, 2);
      g.fillRect(x, y - 12, 1, 10); g.fillRect(x + w - 1, y - 12, 1, 10); g.globalAlpha = 1; }   /* the ends that will go under */
  };
  /* ---------- OVER EVERYTHING: her water, her kelp, the bare part's outline, her tells, OPEN and its clock ---------- */
  H.drawOver = (cx, cy, time) => {
    const S = A(); if (!S || !show) return; const g = ctx.g(), G = show.A, e = ctx.boss && ctx.boss.t === 'greenteeth' && ctx.boss.alive ? ctx.boss : null, pulse = 0.5 + 0.5 * Math.sin(time * 18), dy = R(G.deck + show.raft.bob - cy);
    g.fillStyle = 'rgba(40,70,30,0.22)'; g.fillRect(R(G.pool.x0 - cx), R(G.surf - cy), R(G.pool.x1 - G.pool.x0), R(G.bed - G.surf));   /* her water is green */
    if (!e) return;
    const show2 = !(e.mode === 'sleep' || e.hidden), ex = R(e.x - cx), ey = R(e.y - cy), headY = ey - GT.h + 2, waist = ey - GT.h + 18;
    /* HER KELP: a body wrapped in it (the head bare), or a hood of it (the body bare); wary, it is everywhere */
    if (show2) { const wary = show.wary && show.wary.t > 0, body = show.kelp === 'body' || wary, hood = show.kelp === 'hood' || wary, shifting = e.mode === 'kelp' || e.mode === 'phase';
      const shift = shifting ? R(Math.sin(time * 10) * 3) : 0, stream = shifting ? Math.sin(time * 8) * 0.8 : 0;   /* (claude/canal4art) the BODY kelp is a teal mantle, the HOOD a rust-brown cowl: two shapes, two colours */
      if (body) K.drawKelpBody(g, ex, waist + shift, ey, time, stream);
      if (hood) K.drawKelpHood(g, ex, headY + shift, waist, time, e.face || 1, stream);
      if (shifting && !wary) K.drawKelpSwap(g, ex, headY, waist, time);
      if (!wary) { const y0 = show.kelp === 'body' ? headY - 6 : waist, y1 = show.kelp === 'body' ? waist - 2 : ey; g.globalAlpha = 0.45 + 0.4 * pulse; g.strokeStyle = '#ffd36b'; g.lineWidth = 1; g.strokeRect(ex - 13.5, y0 + 0.5, 27, y1 - y0); g.globalAlpha = 1;
        const up = show.kelp === 'body'; g.fillStyle = '#ffd36b'; const ax = ex + 18, ay = up ? headY : ey - 8; g.fillRect(ax, ay - 2, 1, 5); g.fillRect(ax - 1, up ? ay - 1 : ay + 1, 3, 1); g.fillRect(ax - 2, up ? ay : ay, 5, 1); } }   /* the bare part: the shared OPEN read, and an arrow (high / low) */
    /* HER STUCK ARM: from her shoulder to her claws in the raft's timber */
    if (e.mode === 'stuck' && e.claw) { limb(g, ex, headY + 14, e.claw.x - cx, e.claw.y - 7 - cy, time * 0.2); K.drawStuckClaws(g, e.claw.x - cx, e.claw.y - cy, time); }
    /* HER ARMS AND TELLS */
    for (const a of show.arms) { const k = 1 - Math.max(0, a.t) / a.len;
      if (a.st === 'tell' && (a.k === 'slam' || a.k === 'net')) { const x = R(a.x - cx), y = dy, r = a.k === 'slam' ? GT.slamR : GT.netR, fixed = k >= (a.k === 'slam' ? GT.slamFollow : GT.netFollow);
        g.globalAlpha = (fixed ? 0.6 : 0.3) + 0.35 * pulse; g.fillStyle = '#ff6b6b'; g.fillRect(x - r, y, r * 2 + 1, 1); g.fillRect(x - r, y - 3, 1, 3); g.fillRect(x + r, y - 3, 1, 3); g.globalAlpha = 1;
        if (a.k === 'slam') { limb(g, ex, headY + 12, (ex + x) / 2, Math.min(headY - 18, y - 46), time); claw(g, (ex + x) / 2, Math.min(headY - 18, y - 46)); }
        else netBlob(g, ex - (e.face || 1) * 8, headY - 6, 5, time); }
      if (a.st === 'blow' && a.k === 'slam') { limb(g, ex, headY + 12, a.x - cx, dy - 4, time); claw(g, a.x - cx, dy - 3); }
      if (a.st === 'blow' && a.k === 'net') { const q = 1 - Math.max(0, a.t) / GT.netT, nx = ex + (a.x - cx - ex) * q, ny = headY + (dy - 10 - headY) * q - Math.sin(q * Math.PI) * 30; netBlob(g, nx, ny, 6 + 10 * q, time); }
      if (a.k === 'vine') { const x0 = a.dir > 0 ? a.ox : a.ox - a.reach, x1 = a.dir > 0 ? a.ox + a.reach : a.ox;
        if (a.st === 'tell') { band(g, dy, x0, x1, k, cx, cy, time); g.globalAlpha = 0.5 + 0.4 * pulse; g.fillStyle = '#7aa83a'; const len = a.reach * Math.min(1, k * 1.25); for (let i = 0; i < len; i += 5) g.fillRect(R(a.ox + a.dir * i - cx), dy - 3 + ((i / 5) & 1), 3, 1); g.globalAlpha = 1; netBlob(g, ex - (e.face || 1) * 8, headY - 4, 4 + 3 * k, time); }
        else if (a.st === 'blow') { const tx = a.ox + a.dir * (a.r || 0); vineRope(g, ex, headY + 12, tx - cx, dy - 4, time); claw(g, tx - cx, dy - 5); } }
      if (a.k === 'charge' && a.st === 'tell') { const dir = a.dir; g.globalAlpha = 0.4 + 0.45 * pulse * k; g.fillStyle = '#ff6b6b'; const len = 40 + 120 * k; g.fillRect(dir > 0 ? ex : ex - R(len), dy - 14, R(len), 1); g.fillRect(dir > 0 ? ex : ex - R(len), dy + 3, R(len), 1);
        const ax = ex + dir * R(len); g.fillRect(ax - dir * 6, dy - 8, 1, 9); g.fillRect(ax - dir * 3, dy - 6, 1, 5); g.globalAlpha = 1; } }
    if (show.charge) { const c = show.charge, x = R(c.x - cx); g.fillStyle = '#e8f4f0'; g.fillRect(x - 10, dy - 14, 20, 4); g.fillStyle = '#bfe6f5'; g.fillRect(x - 14, dy - 10, 28, 6); g.fillStyle = '#7cc8c8'; g.fillRect(x - 18, dy - 4, 36, 4);   /* the bow-wave humping the deck */
      g.globalAlpha = 0.9; g.fillStyle = '#e8ff7a'; g.fillRect(x - 3, R(G.surf - cy) + 6, 2, 1); g.fillRect(x + 1, R(G.surf - cy) + 6, 2, 1); g.globalAlpha = 1; }
    /* SHE IS WARY: a slow ring of weed about her */
    if (show.wary && show.wary.t > 0 && !GM.gtOpen(e)) { const k = show.wary.t / GT.wardT; g.globalAlpha = 0.25 + 0.35 * k; g.strokeStyle = '#7aa83a'; g.lineWidth = 1; g.beginPath(); g.ellipse(ex, ey - GT.h / 2, 22, 26, 0, time * 2, time * 2 + Math.PI * 2 * k); g.stroke(); g.globalAlpha = 1; }
    /* OPEN (stuck), and its clock: the gold ring and the timer bar (B10), the green line the opening's share left */
    if (GM.gtOpen(e)) { const full = e.openLen || 3, k = Math.max(0, e.modeT) / full, oy = ey - GT.h / 2;
      g.globalAlpha = 0.5 + 0.4 * pulse; g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.ellipse(ex, oy, 26, 28, 0, 0, 7); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      g.fillStyle = '#1e1624'; g.fillRect(ex - 16, ey + 6, 32, 5); g.fillStyle = '#ffd36b'; g.fillRect(ex - 15, ey + 7, R(30 * k), 1); g.fillStyle = '#8fd160'; g.fillRect(ex - 15, ey + 9, R(30 * Math.max(0, e.capLeft || 0) / Math.max(1, e.capLen || 1)), 1);
      ctx.text('OPEN', ex, oy - 36, pulse > 0.5 ? '#fff6c8' : '#ffd36b', 'center', 6); }
    if (show.dead) show.dead = Math.min(1, show.dead + 1 / 120);
  };
  function limb(g, x0, y0, x1, y1, time) { const mx = (x0 + x1) / 2 + Math.sin(time * 5) * 3, my = (y0 + y1) / 2;
    g.strokeStyle = '#3e6030'; g.lineWidth = 3; g.beginPath(); g.moveTo(R(x0), R(y0)); g.quadraticCurveTo(R(mx), R(my), R(x1), R(y1)); g.stroke();
    g.strokeStyle = '#86b060'; g.lineWidth = 1; g.beginPath(); g.moveTo(R(x0), R(y0) - 1); g.quadraticCurveTo(R(mx), R(my) - 1, R(x1), R(y1) - 1); g.stroke(); }
  function claw(g, x, y) { g.fillStyle = '#5e8a4a'; g.fillRect(R(x) - 2, R(y) - 2, 5, 4); g.fillStyle = '#d0dcb0'; for (let i = -1; i <= 1; i++) g.fillRect(R(x) + i * 2, R(y) - 4, 1, 2); }
  function vineRope(g, x0, y0, x1, y1, time) { const mx = (x0 + x1) / 2, my = Math.min(y0, y1) - 18 - Math.sin(time * 6) * 3;
    g.strokeStyle = '#2e4a22'; g.lineWidth = 3; g.beginPath(); g.moveTo(R(x0), R(y0)); g.quadraticCurveTo(R(mx), R(my), R(x1), R(y1)); g.stroke();
    g.strokeStyle = '#7aa83a'; g.lineWidth = 1; g.beginPath(); g.moveTo(R(x0), R(y0) - 1); g.quadraticCurveTo(R(mx), R(my) - 1, R(x1), R(y1) - 1); g.stroke(); }
  function netBlob(g, x, y, r, time) { for (let i = 0; i < 14; i++) { const q = i / 14 * Math.PI * 2 + time * 2; g.fillStyle = i % 3 ? '#3e6030' : '#9ac850'; g.fillRect(R(x + Math.cos(q) * r), R(y + Math.sin(q) * r * 0.5), 2, 1); } }
  /* A LOW BAND along the deck (jump it), with an arrow at every hero standing in it */
  function band(g, fy, x0, x1, k, cx, cy, time) { const t = fy - 14, b = fy + 6;
    g.globalAlpha = 0.2 + 0.45 * k * (0.6 + 0.4 * Math.sin(time * 30)); g.fillStyle = '#ff6b6b'; g.fillRect(R(x0 - cx), R(t), R(x1 - x0), 1); g.fillRect(R(x0 - cx), R(b - 1), R(x1 - x0), 1);
    for (const pp of ctx.players) { if (pp.x < x0 || pp.x > x1) continue; const px2 = R(pp.x - cx), py2 = R(pp.y - 32 - cy); g.fillRect(px2 - 2, py2, 5, 1); g.fillRect(px2 - 1, py2 - 1, 3, 1); g.fillRect(px2, py2 - 2, 1, 1); }
    g.globalAlpha = 1; }

  /* ---------- HER SOUNDS (src/audio.js: gt*) ---------- */
  const S_ = ctx.SFX, SOUND = {
    slamTell: () => { S_.gtDrip(); S_.gtHiss(); }, slam: () => S_.gtBurst(), stuck: () => { S_.gtPaddle(); S_.gtGrip(); }, wrench: () => S_.gtWeed(),
    chargeTell: () => S_.gtBoil(), charge: () => S_.gtSurge(), haul: () => S_.gtDrag(), netTell: () => S_.gtWeed(), net: () => S_.gtLash(),
    vineTell: () => { S_.gtWeed(); S_.gtHiss(); }, vine: () => S_.gtLash(), heave: () => S_.gtGrip(), heaved: () => { S_.gtSurge(); S_.gtDrag(); },
    wake: () => { S_.gtSurge(); S_.gtBell(); }, phase: () => { S_.gtWeed(); S_.gtBell(); }, lower: () => { S_.gtDrain(); S_.gtBell(); }, lowered: () => S_.gtSurge(), kelp: () => S_.gtWeed(),
    weed: () => S_.gtWeed(), die: () => S_.gtBell(),
  };
  return H;
}
