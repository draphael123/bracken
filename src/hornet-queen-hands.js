// src/hornet-queen-hands.js - THE HORNET QUEEN 2's HANDS (claude/hornetsnest). src/hornet-queen.js is the fight (pure); this binds it to the world (main.js): her told
// blows on the heroes (keyed once a blow; a shield turns the dive, the sweep and the stingers), her brood (drones out of her cells), the comb her wing-buzz brings
// down, the hall she tears out of and the escape down the trunk (main.js escapeBegin swaps the arena), the great pine's marked pines and THE LAST COMB, the smoke
// that dazes her (src/hornets-nest-hands.js smokeUnder) - and the drawing.
// GREYBOX ART (readable; the art lane draws it - see the lane report's ART HOOKS): POSE is the contract - every move its OWN windup and release pose (B16): the
// aim (hanging over you, abdomen curled under, the sting cocked) and the dive (stretched along her stoop, wings swept back), stuck (abdomen down, the sting buried,
// wings beating), winded / dazed (down on the floor, wings drooped / smoke round her head), the sweep's tell (low and level, head forward) and the sweep (long and
// flat), the wing-buzz (hung upright, wings a wide blur), the tear (reared up, legs out), the volley's tell (abdomen curled forward under her) and its release
// (thrust), the cloak's tell (wings spread, her hornets gathering), PINNED (on her side under the trunk / the comb), the thrash, the circle (flying), sleeping.
// main.js calls: spawnBoss, owns, on, update, tick, take, strike, potHits, drawBack, drawBoss, drawOver, barName, end, read, show, clear.
import * as HQM from './hornet-queen.js';
import { BOSS_PHASE } from './boss-music.js';
import { canvas, flipX, whiten } from './px.js';
const { HQ } = HQM;
const SOUND = { aim: s => (s.buzz || s.tell)(), held: s => (s.tell || s.buzz)(), dive: s => (s.charge || s.whoosh || s.tell)(), stuck: s => { (s.thud || s.heavy)(); (s.crack || s.thud)(); },
  winded: s => (s.thud || s.heavy)(), dazed: s => (s.puff || s.thud)(), thrash: s => (s.queenShriek || s.roar)(), sweepTell: s => (s.buzz || s.tell)(), sweep: s => (s.charge || s.whoosh)(),
  buzz: s => (s.buzz || s.tell)(), buzzDrop: s => { (s.crack || s.thud)(); (s.heavy || s.thud)(); }, chunk: s => (s.thud || s.stone)(), brood: s => (s.buzz || s.tell)(), hatch: s => (s.chitter || s.buzz)(),
  tear: s => (s.queenShriek || s.roar)(), volleyTell: s => (s.buzz || s.tell)(), volley: s => (s.spit || s.throwWhoosh)(), cloakTell: s => (s.buzz || s.tell)(), cloak: s => (s.chitter || s.buzz)(),
  scatter: s => (s.puff || s.buzz)(), pinned: s => { (s.heavy || s.thud)(); (s.crack || s.thud)(); }, stroke: s => { (s.crack || s.thud)(); (s.creak || s.thud)(); }, creak: s => (s.creak || s.crack)(),
  timber: s => { (s.heavy || s.thud)(); (s.thud || s.heavy)(); }, cut: s => (s.crack || s.thud)(), clank: s => (s.clank || s.thud)() };
const R = Math.round;
const rect = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), R(w), R(h)); };
const ell = (g, x, y, rx, ry, col, rot = 0) => { g.fillStyle = col; g.beginPath(); g.ellipse(R(x), R(y), Math.max(1, rx), Math.max(1, ry), rot, 0, 7); g.fill(); };
const C = { body: '#6a3a14', bodyD: '#3a1e0a', amber: '#e8a030', amberL: '#ffd070', stripe: '#2a160a', wing: 'rgba(220,232,244,0.55)', wingE: '#c8d8e8', eye: '#ff3a2a', sting: '#f0e8d0', leg: '#2a160a', crown: '#ffd36b' };
/* THE POSE A MODE WEARS (local px, facing right, her centre at 0,0): body tilt (rad), abdomen angle relative to the body, wings, lying, legs out */
export const POSE = {
  sleep: { tilt: 0.1, abd: 0.4, wing: 'fold', y: 0 }, wake: { tilt: -0.1, abd: 0.2, wing: 'blur' }, hover: { tilt: 0, abd: 0.25, wing: 'blur' }, rise: { tilt: -0.15, abd: 0.3, wing: 'blur' },
  circle: { tilt: 0.1, abd: 0.15, wing: 'blur' }, rejoin: { tilt: -0.1, abd: 0.2, wing: 'blur' }, enter: { tilt: 0.3, abd: 0.1, wing: 'back' },
  aim: { tilt: 0.15, abd: 1.35, wing: 'blur', sting: true }, dive: { tilt: 0.9, abd: 0.1, wing: 'back', sting: true }, skim: { tilt: -0.5, abd: 0.4, wing: 'blur' },
  stuck: { tilt: 1.2, abd: 0.2, wing: 'beat', sting: true }, winded: { tilt: 0.2, abd: 0.6, wing: 'droop', y: 2 }, dazed: { tilt: -0.2, abd: 0.5, wing: 'droop', y: 2, stars: true },
  thrash: { tilt: -0.4, abd: -0.3, wing: 'beat' }, sweepTell: { tilt: -0.1, abd: -0.15, wing: 'blur', head: 3 }, sweep: { tilt: 0.05, abd: -0.25, wing: 'back' },
  buzzTell: { tilt: -1.1, abd: 0.3, wing: 'wide' }, buzz: { tilt: -1.0, abd: 0.4, wing: 'wide' }, tearTell: { tilt: -1.3, abd: 0.6, wing: 'wide', legs: true }, tear: { tilt: -0.6, abd: 0.2, wing: 'back' },
  volleyTell: { tilt: -0.1, abd: 1.7, wing: 'blur', sting: true }, volley: { tilt: 0.1, abd: 1.0, wing: 'blur', sting: true }, cloakTell: { tilt: -0.3, abd: 0.4, wing: 'wide' },
  pinned: { tilt: 0, abd: 0.2, wing: 'fold', lying: true }, away: { tilt: 0, abd: 0, wing: 'blur' },
};
/* HER BODY (greybox): a big hornet - a crowned head, the thorax, the striped abdomen and its sting, two pairs of wings - in the pose's angles */
export function drawQueenBody(g, p, time, flash, ph) {
  const t = p.tilt || 0, a = t + (p.abd || 0), col = flash ? '#ffffff' : null;
  g.save(); g.rotate(p.lying ? Math.PI / 2 * 0.9 : 0);
  /* wings (behind) */
  const wingA = p.wing === 'blur' ? Math.sin(time * 60) * 0.6 : p.wing === 'wide' ? Math.sin(time * 70) * 0.9 : p.wing === 'beat' ? Math.sin(time * 25) * 0.7 : p.wing === 'back' ? 0.9 : p.wing === 'droop' ? 1.4 : 1.2;
  for (const k of [0, 1]) { g.save(); g.rotate(-1.2 + wingA + k * 0.35); g.globalAlpha = p.wing === 'blur' || p.wing === 'wide' ? 0.45 : 0.75; ell(g, 9, 0, p.wing === 'wide' ? 15 : 12, 4, col || C.wing); g.globalAlpha = 1; g.restore(); }
  /* abdomen: behind the thorax, at its own angle, stripes and the sting */
  g.save(); g.rotate(a); g.translate(-8, 2);
  ell(g, -7, 0, 10, 6.5, col || C.amber); for (const sx of [-12, -7, -2]) rect(g, sx, -6, 2, 12, col || C.stripe); ell(g, -6, -2, 6, 2, col || C.amberL);
  if (p.sting || ph === 2) { rect(g, -19, -1, 4, 2, col || C.sting); rect(g, -21, 0, 2, 1, col || C.sting); }
  g.restore();
  /* thorax, head, crown */
  g.save(); g.rotate(t);
  ell(g, 0, 0, 7, 6, col || C.body); ell(g, 1, -2, 4, 2, col || C.bodyD);
  const hx = 8 + (p.head || 0); ell(g, hx, -1, 5, 5, col || C.body); rect(g, hx + 1, -4, 3, 3, col || C.eye); rect(g, hx + 4, 2, 3, 2, col || C.stripe);
  rect(g, hx - 3, -8, 2, 3, col || C.crown); rect(g, hx, -9, 2, 4, col || C.crown); rect(g, hx + 3, -8, 2, 3, col || C.crown);
  /* legs */
  for (const lx of [-3, 1, 4]) { const out = p.legs ? 4 : 0; rect(g, lx, 5, 1, 4 + out, col || C.leg); rect(g, lx - 1, 8 + out, 2, 1, col || C.leg); }
  g.restore(); g.restore();
  if (p.stars) for (let k = 0; k < 3; k++) { const an = time * 4 + k * 2.1; rect(g, 10 + Math.cos(an) * 8, -14 + Math.sin(an) * 3, 2, 2, '#ffd36b'); }
}

export function makeHornetQueenHands(ctx) {
  let S = null; const H = {}; let heap = null, perchSaved = [];
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'hornetqueen' ? ctx.L.arena : null);
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => e.t === 'hornetqueen';
  H.clear = () => { S = null; BOSS_PHASE.hornetqueen = 1; };
  const live = () => { const e = ctx.boss; return e && e.alive && e.t === 'hornetqueen' ? e : null; };
  const hurt = (name, fn) => { const P = ctx.hero(), h0 = P.hp; fn(); if (S) S.hurt[name] = (S.hurt[name] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); };
  const keyed = (pp, key) => { pp.hqKeys = pp.hqKeys || new Map(); if (pp.hqKeys.size > 160) pp.hqKeys.clear(); if (pp.hqKeys.has(key)) return true; pp.hqKeys.set(key, 1); return false; };
  /* HER SPAWN: in the hall, asleep - or, once she has torn out (L.hqStage2: this level's attempt is past the hall), waiting over the great pine at half */
  H.spawnBoss = base => { const Lv = ctx.L; if (!Lv || !Lv.arena || Lv.arena.boss !== 'hornetqueen') return null;
    const A1 = Lv.hqArena1 || (Lv.hqArena1 = Lv.arena), A2 = Lv.arena2;
    S = HQM.newFight(HQM.geom(A1, A2, Lv.escape, ctx.TS)); BOSS_PHASE.hornetqueen = 1; heap = null;
    const hp = ctx.EHP.hornetqueen || HQ.hp;
    const e = { ...base, t: 'hornetqueen', w: HQ.w, h: HQ.h, hp, maxHp: hp, noGrav: true, markH: HQ.markH, face: -1, mode: 'sleep', modeT: 0, phase: 1, boss: true, ward: 0, vx: 0, vy: 0, anim: 0 };
    if (Lv.hqStage2) { S.stage = 2; e.hp = Math.ceil(hp * HQ.p1End); e.phase = 2; e.x = S.G.p.mid; e.y = S.G.p.floor - 160; BOSS_PHASE.hornetqueen = 2; }
    for (const pp of ctx.players) pp.hqKeys = null; return e; };
  const heroes = () => ctx.players.map(pp => ({ x: pp.x, y: pp.y, vx: pp.vx || 0, ground: !!pp.ground, alive: ctx.upright(pp) && !pp.dead, pp }));
  function world(e) {
    return {
      number: (x, y, t, col) => ctx.number(x, y, t, col), sound: k => { const f = SOUND[k]; if (f) try { f(ctx.sfx); } catch {} }, shake: n => ctx.shake(n),
      music: ph => { BOSS_PHASE.hornetqueen = ph; }, say: m => ctx.hint && ctx.hint(m),
      mark: m => ctx.number(e.x, e.y - HQ.markH, m, m === '!' ? '#ffd36b' : '#ff6b6b'),
      dust: (x, y, n) => ctx.dust(x, y, n),
      fx: (k, x, y) => { if (k === 'open') { ctx.ring(x, y - 10, 30, '#ffd36b'); ctx.burst(x, y - 12, 12, ['#e8a030', '#ffd070', '#c8d8e8'], 90, 0.6); } else if (k === 'ward') ctx.ring(x, y - 10, 32, '#c8d8e8'); },
      hit: (bx, d, name, o = {}) => { for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
          if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P)) || keyed(pp, o.key || name)) return;
          let res = null; hurt(name, () => { res = ctx.damagePlayer(e.x, d, { who: e, name, unblockable: !o.blockable }); });
          if (res === 'blocked' && o.onBlock) o.onBlock(); }); },
      hitHero: (h, d, name, key) => { const pp = h.pp; ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return; if (key && keyed(pp, key)) return; hurt(name, () => ctx.damagePlayer(e.x, d, { who: e, name, unblockable: true })); }); },
      hatch: (c, n) => { for (let i = 0; i < n; i++) ctx.spawnDrone(c.x + (i ? 10 : -10), c.y - 22 - i * 6); },
      drones: () => ctx.enemies().filter(q => q.alive && q.t === 'wasp' && q.drone).length,
      perchGone: p => { for (let x = p.x0; x <= p.x1; x++) { perchSaved.push([x, p.row]); ctx.cellSet(x, p.row, ctx.T.AIR); } ctx.burst((p.x0p + p.x1p) / 2, p.y, 18, ['#e0a838', '#a8741e', '#fff1a0'], 90, 0.8); },
      tearWall: () => { const Lv = ctx.L, A1 = Lv.hqArena1 || Lv.arena; ctx.burst((A1.wallR) * 16 + 8, A1.floor - 40, 24, ['#d8c8a0', '#e0a838', '#8a6a40'], 140, 1.0); ctx.shake(9); },
      escapeBegin: () => { e.x = S.G.p.mid; e.y = S.G.p.floor - 420; e.vx = 0; e.vy = 0; ctx.escapeBegin(e); },
      woodAt: (x, y) => { const G = S.G.p;
        for (const p of S.pines) if ((p.st === 'down' || p.st === 'pin') && y >= G.floor - 14) { const [lo, hi] = HQM.lineOf(p); if (x > lo && x < hi) return true; }
        if (G.bough && x > G.bough.x0 && x < G.bough.x1 && Math.abs(y - G.bough.y) < 8) return true;
        if (S.comb && S.comb.st === 'heap' && x > S.comb.x0 && x < S.comb.x1 && Math.abs(y - S.comb.y) < 8) return true;
        return false; },
      splinter: p => { const [lo, hi] = HQM.lineOf(p); ctx.burst((lo + hi) / 2, S.G.p.floor - 6, 16, ['#8e6440', '#c9b27c', '#3e2614', '#2e5a34'], 110, 0.7); },
      combLand: c => { const H2 = ctx.L.H; for (let y = Math.floor((c.y + c.rows * 16) / 16); y < H2; y++) for (let x = c.cx0; x <= c.cx1; x++) if (ctx.footAt(x, y)) return y * 16; return H2 * 16; },
      combHeap: c => { heap = []; const top = Math.round(c.y / 16); for (let y = top; y < top + c.rows; y++) for (let x = c.cx0; x <= c.cx1; x++) { heap.push([x, y]); ctx.cellSet(x, y, ctx.T.ONEWAY); } },
    };
  }
  /* ---------- ONE FRAME OF HER (while her fight is on) ---------- */
  H.update = (e, dt) => {
    if (!S || !e.alive) return; const w = world(e);
    if (S.stage === 'escape' && e.mode === 'wake') { S.stage = 2; BOSS_PHASE.hornetqueen = 2; }   /* the hero has come down the trunk into the great pine's clearing: her second room */
    if (e.mode === 'wake' && !S.woke && S.stage === 1) { S.woke = true; e.modeT = 1.6; ctx.number(e.x, e.y - 60, HQ_SAY_WAKE, '#ffd36b'); SOUND.thrash(ctx.sfx); ctx.shake(5); }
    /* THE SMOKE UNDER HER: a cloud, a set-down pot or a carried one (src/hornets-nest-hands.js) - she is dazed (P2: her cloak goes first) */
    if (HQM.feelsSmoke(e) && !(S.ward > 0) && ctx.smokeUnder) { const sm = ctx.smokeUnder(e.x, e.y, HQ.dazed.r, HQ.dazed.h); if (sm && !(e.smokeCd > 0)) { if (HQM.dazed(e, S, w)) e.smokeCd = HQ.dazed.cd; } }
    e.smokeCd = Math.max(0, (e.smokeCd || 0) - dt);
    /* THE RANGER's arrow: a stroke in a marked pine, the last comb cut */
    for (const pp of ctx.players) for (const a of (pp.rgArrows || [])) { if (a.state !== 'fly') continue;
      if (S.stage === 2) { const p = S.pines.find(q => q.st === 'stand' && Math.abs(a.x - q.x) < 8 && a.y > S.G.p.floor - 60 && a.y < S.G.p.floor); if (p) { a.state = 'drop'; a.vx *= -0.1; a.vy = -40; HQM.strokePine(S, p, w); continue; }
        const c = S.comb; if (c && c.st === 'hang' && a.x > c.x0 && a.x < c.x1 && a.y > c.y && a.y < c.y + c.rows * 16) { a.state = 'drop'; a.vy = -40; HQM.cutComb(S, w); } } }
    HQM.stepQueen(e, S, dt, heroes(), w);
    S.tStage = S.tStage || {}; if (!S.tStage[S.stage]) S.tStage[S.stage] = Math.round(ctx.time());
    e.phase = S.stage === 2 ? 2 : 1; e.open = HQM.hqOpen(e) ? Math.max(0, e.modeT) : 0; e.openKind = e.mode;
  };
  /* THE LEVEL'S FRAME, fight or not: the escape's falling comb (she is gone, the hall is open, the nest is coming down) */
  H.tick = dt => { if (!S) return; const e = live(); if (S.stage === 'escape') { S.tStage = S.tStage || {}; if (!S.tStage.escape) S.tStage.escape = Math.round(ctx.time()); const w = world(e || { x: 0, y: 0 }); HQM.stepEscape(S, dt, heroes(), w); const hs = heroes();
      /* the chunks fall on their own clock here (her stepQueen does not run while her fight is off) */
      for (const c of S.chunks) { if (c.st === 'told') { c.t -= dt; if (c.t <= 0) c.st = 'fall'; } else if (c.st === 'fall') { c.vy = Math.min(520, c.vy + 900 * dt); c.y += c.vy * dt;
          if (c.y >= c.floorY) { c.st = 'done'; ctx.dust(c.x, c.floorY, 8); SOUND.chunk(ctx.sfx); w.hit([c.x - HQ.escape.r, c.x + HQ.escape.r, c.floorY - 26, c.floorY + 2], HQ.escape.dmg, 'falling comb', { key: c.key }); } } }
      S.chunks = S.chunks.filter(c => c.st !== 'done'); void hs; } };
  /* A HERO'S BLOW (main.js attackBox): a marked pine's stroke, the last comb cut, a hall brood cell smashed */
  H.strike = hb => { if (!S || !hb || !ctx.bossActive) return; const e = live(); if (!e) return; const w = world(e);
    if (S.stage === 2) { for (const p of S.pines) { if (p.st !== 'stand') continue; const box = { l: p.x - 7, r: p.x + 7, t: S.G.p.floor - 60, b: S.G.p.floor };
        if (hb.l < box.r && hb.r > box.l && hb.t < box.b && hb.b > box.t && ctx.hitOnce(p)) HQM.strokePine(S, p, w); }
      const c = S.comb; if (c && c.st === 'hang' && hb.l < c.x1 && hb.r > c.x0 && hb.t < c.y + c.rows * 16 + 12 && hb.b > c.y) HQM.cutComb(S, w); }   /* (its drips hang a hand under it: a blow there cuts it too) */
    if (S.stage === 1) for (const c of S.cells) { if (c.st !== 'idle' && c.st !== 'pulse') continue; if (hb.l < c.x + 8 && hb.r > c.x - 8 && hb.t < c.y && hb.b > c.y - 14) { c.st = 'broken'; c.t = HQ.brood.every * 2; S.n.smashed++; ctx.burst(c.x, c.y - 6, 12, ['#e0b040', '#fff1a0', '#c06040'], 70, 0.6); ctx.number(c.x, c.y - 22, 'SMASHED', '#8fd160'); SOUND.cut(ctx.sfx); } } };
  /* A THROWN SMOKE POT that meets her (src/hornets-nest-hands.js onQueen): it breaks on her - and the cloud it leaves is under her */
  H.potHits = (x, y) => { const e = live(); if (!e || !ctx.bossActive || !S || S.stage === 'escape') return false; return Math.abs(x - e.x) < HQ.w / 2 + 4 && y > e.y - HQ.h - 4 && y < e.y + 6; };
  /* A BLOW ON HER (B15; src/hornet-queen.js takeBlow) - the turned share clanks and says why */
  H.take = (e, dmg, fromX, pl) => { if (!S) return dmg; const [d, word] = HQM.takeBlow(e, S, dmg, pl);
    if (word && d > 0) { e.chipHit = ctx.time(); e.guardFx = 0.25; e.guardWord = word; ctx.sfx.clank && ctx.sfx.clank(); const sd = Math.sign(ctx.hero().x - e.x) || 1; ctx.sparks(e.x + sd * 12, e.y - 12, sd, 4);
      if (!S.told.shell && word === HQM.HQ_SAY.shell) { S.told.shell = 1; ctx.hint && ctx.hint('HER SHELL TURNS A CUT. BAIT HER DIVE INTO A COMB PERCH, SMOKE UNDER HER, OR COME DOWN ON HER FROM ABOVE.'); } }
    return d; };
  H.barName = e => 'THE HORNET QUEEN' + (HQM.hqOpen(e) ? '  ' + (HQM.OPEN_NAME[e.mode] || 'OPEN') : S && S.ward > 0 ? '  WARDED' : S && S.cloak > 0 ? '  CLOAKED' : S && S.stage === 2 ? '  THE PINE' : '');
  H.end = e => { if (S) { S.chunks = []; S.stingers = []; } BOSS_PHASE.hornetqueen = 1; };
  H.stage = () => (S ? S.stage : 0);
  H.read = () => S && { stage: S.stage, tStage: S.tStage, mode: ctx.boss && ctx.boss.mode, ward: S.ward, cloak: S.cloak, perches: S.perches.map(p => ({ id: p.id, st: p.st })), cells: S.cells.map(c => ({ x: c.x, st: c.st })),
    pines: S.pines.map(p => ({ id: p.id, x: p.x, st: p.st, hp: p.hp })), comb: S.comb && { st: S.comb.st, y: S.comb.y }, n: JSON.parse(JSON.stringify(S.n)), hurt: { ...S.hurt } };
  /* a level reload or a fresh attempt: the perches her buzz brought down are back, the comb heap is gone */
  H.restore = () => { for (const [x, y] of perchSaved) ctx.cellSet(x, y, ctx.T.ONEWAY); perchSaved = []; if (heap) for (const [x, y] of heap) ctx.cellSet(x, y, ctx.T.AIR); heap = null; };
  /* ---------- DRAWING (greybox) ---------- */
  H.drawBack = (g, cx, cy, time) => { if (!S) return; const VW = ctx.VW();
    /* THE GREAT PINE (P2): the marked pines (the lumber kit's own, via the old boar's drawer), THE LAST COMB hanging with its plumb line */
    if (ctx.L && ctx.L.arena2) for (const p of S.pines) { if (p.st === 'down' || p.st === 'pin') continue; const x = p.x - cx; if (x < -140 || x > VW + 140) continue;
      const e = live(), hot = e && S.stage === 2 && p.st === 'stand' && HQM.underPine(p, e, S.G.p.floor); const lineCol = S.stage !== 2 ? 'rgba(255,211,107,0.35)' : hot ? (Math.floor(time * 8) % 2 ? '#ff6b6b' : '#ffd36b') : 'rgba(255,211,107,0.55)';
      ctx.drawPine(g, p, x, S.G.p.floor - cy, time, lineCol); }
    const c = S.comb; if (c && (c.st === 'hang' || c.st === 'fall' || c.st === 'onHer' || c.st === 'heap')) { const x = c.x0 - cx, y = c.y - cy, w = c.x1 - c.x0, h = c.rows * 16; if (x < VW + 40 && x + w > -40) {
      if (c.st === 'hang') { rect(g, x + w / 2 - 1, y - 40, 2, 40, '#5a3a10'); g.fillStyle = Math.floor(time * 3) % 2 ? '#ffd36b' : '#d8a840'; for (let q = y + h + 3; q < S.G.p.floor - cy; q += 6) { g.fillRect(R(x + 2), R(q), 2, 2); g.fillRect(R(x + w - 4), R(q), 2, 2); } }
      rect(g, x - 1, y - 1, w + 2, h + 2, '#3a240c'); rect(g, x, y, w, h, c.st === 'heap' ? '#a8741e' : '#e0a838'); for (let yy = 0; yy < h - 2; yy += 4) for (let xx = ((yy / 4) & 1) * 3; xx < w - 2; xx += 6) rect(g, x + xx + 1, y + yy + 1, 3, 2, c.st === 'heap' ? '#7a5014' : '#f6d070'); } }
    /* THE HALL (P1): her brood cells in its walls */
    for (const k of S.cells) { const x = R(k.x - cx), y = R(k.y - cy); if (x < -30 || x > VW + 30) continue;
      if (k.st === 'broken' || k.st === 'hatched') { rect(g, x - 6, y - 5, 12, 5, '#7a5014'); continue; }
      const pz = k.st === 'pulse' ? 1 + 0.2 * Math.sin(time * 14) : 1; rect(g, x - 7 * pz, y - 15 * pz, 14 * pz, 15 * pz, '#3a240c'); rect(g, x - 6 * pz, y - 14 * pz, 12 * pz, 14 * pz, k.st === 'pulse' ? (Math.floor(time * 8) % 2 ? '#ff7a4a' : '#e0a838') : '#c8902c');
      rect(g, x - 2, y - 11 * pz, 4, 8 * pz, '#fff1d0'); if (k.st === 'pulse') { g.fillStyle = '#ff6b6b'; g.fillRect(x - 8, y + 2, R(16 * (1 - k.t / HQ.brood.pulse)), 2); } }
    /* a perch her buzz has set shaking: it drips and trembles (the tell) */
    for (const p of S.perches) if (p.st === 'shake') { const x0 = p.x0p - cx, y = p.y - cy; for (let k = 0; k < 4; k++) rect(g, x0 + 4 + k * 18 + Math.sin(time * 30 + k) * 1.5, y + 2, 2, 3 + ((time * 8 + k) % 4), '#ff9a5c'); } };
  H.drawBoss = (g, e, cx, cy, time) => { if (!S || e.mode === 'away') return; e.guardFx = Math.max(0, (e.guardFx || 0) - 1 / 60);
    const f = e.face || 1, x = e.x - cx, y = e.y - cy - HQ.h / 2, p = POSE[e.mode] || POSE.hover, flash = (e.hurtT || 0) > 0 || (e.flash || 0) > 0.06;
    if (S.stage !== 'escape') { const fl = S.stage === 2 ? S.G.p.floor : S.G.h.floor; g.globalAlpha = 0.25; ell(g, x, fl - cy - 1, 14, 2.5, '#10060a'); g.globalAlpha = 1; }
    if (S.cloak > 0) for (let i = 0; i < 16; i++) { const a = i * 2.39 + time * 4, rr = 16 + (i % 4) * 3; rect(g, x + Math.cos(a) * rr, y + Math.sin(a * 1.3) * rr * 0.7, 2, 2, Math.floor(time * 10 + i) % 2 ? '#d08a1a' : '#2a160a'); }
    g.save(); g.translate(R(x), R(y + (p.y || 0))); g.scale(f, 1); drawQueenBody(g, p, time, flash, S.stage === 2 ? 2 : 1); g.restore();
    if (e.mode === 'aim' && e.held && Math.floor(time * 6) % 2) rect(g, x - f * 14, y + 10, 3, 3, '#ffd36b'); };
  H.drawOver = (g, cx, cy, time) => { if (!S) return; const e = live(), X = v => R(v - cx), Y = v => R(v - cy), blink = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0', VW = ctx.VW();
    /* the felled pines over her (a pinned queen lies under one) */
    for (const p of S.pines) if (p.st === 'down' || p.st === 'pin') ctx.drawPine(g, p, X(p.x), Y(S.G.p.floor), time, null);
    /* the falling comb: a chunk in the air, and its red ring where it will land */
    for (const c of S.chunks) { g.strokeStyle = blink; g.beginPath(); g.ellipse(X(c.x), Y(c.floorY) - 1, HQ.buzz.r, 3, 0, 0, 7); g.stroke(); if (c.st === 'fall') { rect(g, X(c.x) - 5, Y(c.y) - 6, 10, 7, '#3a240c'); rect(g, X(c.x) - 4, Y(c.y) - 5, 8, 5, '#e0a838'); } }
    for (const s of S.stingers) { rect(g, X(s.x) - 2, Y(s.y) - 1, 4, 2, '#f0e8d0'); rect(g, X(s.x) - 1, Y(s.y) - 2, 2, 4, '#3a1e0a'); }
    if (!e || !ctx.bossActive || e.mode === 'away') return;
    /* HER FLIGHT (P2), told: her loop's shadow on the ground ahead of her, a dotted line where she will pass low */
    if (S.stage === 2 && (e.mode === 'circle' || e.mode === 'rejoin')) { g.fillStyle = 'rgba(40,20,10,0.35)'; for (let k = 1; k <= 14; k++) { const q = HQM.loopAhead(S, k * 0.18); if (S.G.p.floor - q.y > HQ.pine.reach) continue; g.fillRect(X(q.x) - 2, Y(S.G.p.floor) - 2, 4, 2); } }
    /* THE READ (B10) */
    const x = X(e.x), y = Y(e.y - HQ.h / 2);
    if (HQM.hqOpen(e)) { const kk = Math.max(0, e.modeT / (e.openT0 || 1)); g.globalAlpha = 0.6 + 0.3 * Math.sin(time * 10); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 24, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      const by = Y(e.y - 40); ctx.text(HQM.OPEN_NAME[e.mode] || 'OPEN', x, by - 6, '#ffd36b', 'center', 6); g.fillStyle = '#1b1626'; g.fillRect(x - 18, by, 36, 3); g.fillStyle = '#ffd36b'; g.fillRect(x - 18, by, R(36 * kk), 3); }
    if (S.ward > 0) { g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 6); g.strokeStyle = '#c8d8e8'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 26, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1; ctx.text('WARDED', x, Y(e.y - HQ.h - 22), '#c8d8e8', 'center', 5); }
    if (e.guardFx > 0 && e.guardWord) ctx.text(e.guardWord, x, Y(e.y - HQ.h - 34) - R((0.25 - e.guardFx) * 30), Math.floor(time * 12) % 2 ? '#ffffff' : '#e8c070', 'center', 6);
    void VW; };
  return H;
}
const HQ_SAY_WAKE = HQM.HQ_SAY.wake;
/* HER BESTIARY CARD: two of her poses (hover, the aim) - main.js SPR.hornetqueenCard */
export function bakeHornetQueenCard() {
  const fr = [POSE.hover, POSE.aim].map((p, i) => { const [c, g] = canvas(64, 40); g.imageSmoothingEnabled = false; g.save(); g.translate(30, 22); drawQueenBody(g, p, i * 0.3, false, 1); g.restore(); return c; });
  const white = fr.map(c => whiten(c)); return { R: fr, L: fr.map(flipX), white: { R: white, L: white.map(flipX) }, ax: 30, ay: 34, w: HQ.w, h: HQ.h };
}
