// src/hornet-queen-hands.js - THE HORNET QUEEN 2's HANDS (claude/hornetsnest; ONE ARENA since claude/hornetsnest2). src/hornet-queen.js is the fight (pure); this binds it
// to the world (main.js): her told blows on the heroes (keyed once a blow; a shield turns the dive, the sweep and the stingers), her brood (drones out of her cells), the
// comb her wing-buzz brings down, THE HALL TEARING (the inner perches hang again as the TORN COMBS and THE LAST COMB - they are the nest's own combs, src/hornets-nest-hands.js
// addCombs: cut one and it drops - and the HONEY floods the floor: the nest's sticky rule, addHoney), the smoke that dazes her (smokeUnder), the comb that pins her, and,
// once she is dead, THE FALLING NEST's comb down the trunk (main.js hqDown) - and the drawing.
// GREYBOX ART (readable; the art lane draws it - see the lane report's ART HOOKS): POSE is the contract - every move its OWN windup and release pose (B16): the
// aim (hanging over you, abdomen curled under, the sting cocked) and the dive (stretched along her stoop, wings swept back), stuck (abdomen down, the sting buried,
// wings beating), winded / dazed (down on the floor, wings drooped / smoke round her head), the sweep's tell (low and level, head forward) and the sweep (long and
// flat), the wing-buzz (hung upright, wings a wide blur), the tear (reared up, legs out), the volley's tell (abdomen curled forward under her) and its release
// (thrust), the cloak's tell (wings spread, her hornets gathering), PINNED (on her side under the trunk / the comb), the thrash, the circle (flying), sleeping.
// main.js calls: spawnBoss, owns, on, update, tick, take, strike, potHits, drawBack, drawBoss, drawOver, barName, end, read, show, clear, restore.
import * as HQM from './hornet-queen.js';
import { BOSS_PHASE } from './boss-music.js';
import { canvas, flipX, whiten } from './px.js';
import * as HQA from './redraw/hornet_queen_art.js';   /* (claude/hornetsnestart) her baked frames, her live extras, her darts */
import * as HNP from './redraw/hornets_nest_props.js';
const { HQ } = HQM;
const SOUND = { aim: s => (s.buzz || s.tell)(), held: s => (s.tell || s.buzz)(), dive: s => (s.charge || s.whoosh || s.tell)(), stuck: s => { (s.thud || s.heavy)(); (s.crack || s.thud)(); },
  winded: s => (s.thud || s.heavy)(), dazed: s => (s.puff || s.thud)(), thrash: s => (s.queenShriek || s.roar)(), sweepTell: s => (s.buzz || s.tell)(), sweep: s => (s.charge || s.whoosh)(),
  buzz: s => { (s.buzzSwell || (() => {}))(); (s.buzz || s.tell)(); }, buzzDrop: s => { (s.crack || s.thud)(); (s.heavy || s.thud)(); }, chunk: s => (s.thud || s.stone)(), brood: s => { (s.buzzSwell || (() => {}))(); (s.buzz || s.tell)(); }, hatch: s => (s.chitter || s.buzz)(),
  tear: s => (s.queenShriek || s.roar)(), torn: s => { (s.crack || s.thud)(); (s.heavy || s.thud)(); }, volleyTell: s => (s.buzz || s.tell)(), volley: s => (s.spit || s.throwWhoosh)(), cloakTell: s => { (s.buzzSwell || (() => {}))(); (s.buzz || s.tell)(); }, cloak: s => { (s.buzzCloak || (() => {}))(); (s.chitter || s.buzz)(); },
  scatter: s => (s.puff || s.buzz)(), pinned: s => { (s.heavy || s.thud)(); (s.crack || s.thud)(); }, cut: s => (s.crack || s.thud)(), clank: s => (s.clank || s.thud)() };
const R = Math.round;
const rect = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), R(w), R(h)); };
const ell = (g, x, y, rx, ry, col, rot = 0) => { g.fillStyle = col; g.beginPath(); g.ellipse(R(x), R(y), Math.max(1, rx), Math.max(1, ry), rot, 0, 7); g.fill(); };
const C = { body: '#6a3a14', bodyD: '#3a1e0a', amber: '#e8a030', amberL: '#ffd070', stripe: '#2a160a', wing: 'rgba(220,232,244,0.55)', wingE: '#c8d8e8', eye: '#ff3a2a', sting: '#f0e8d0', leg: '#2a160a', crown: '#ffd36b' };
/* THE POSE A MODE WEARS (local px, facing right, her centre at 0,0): body tilt (rad), abdomen angle relative to the body, wings, lying, legs out */
export const POSE = {   /* (claude/hornetsnestart: the abdomen's angle reads as the TAIL'S SWING - abd < 0 hangs it down and curls it under, > 0 flicks it up; the art lane re-signed the greybox's table so the sting points where the move says) */
  sleep: { tilt: 0.1, abd: -0.4, wing: 'fold', y: 0 }, wake: { tilt: -0.1, abd: -0.2, wing: 'blur' }, hover: { tilt: 0, abd: -0.25, wing: 'blur' }, rise: { tilt: -0.15, abd: -0.3, wing: 'blur' },
  circle: { tilt: 0.1, abd: -0.15, wing: 'blur' }, rejoin: { tilt: -0.1, abd: -0.2, wing: 'blur' }, enter: { tilt: 0.3, abd: -0.1, wing: 'back' },
  aim: { tilt: -0.1, abd: -1.3, wing: 'blur', sting: true }, dive: { tilt: 1.0, abd: -2.3, wing: 'back', sting: true }, skim: { tilt: -0.5, abd: -0.4, wing: 'blur' },
  stuck: { tilt: 0.15, abd: -1.6, wing: 'beat', sting: true }, winded: { tilt: 0.2, abd: -0.6, wing: 'droop', y: 2 }, dazed: { tilt: -0.2, abd: -0.5, wing: 'droop', y: 2, stars: true },
  thrash: { tilt: -0.4, abd: 0.4, wing: 'beat' }, sweepTell: { tilt: -0.1, abd: 0.15, wing: 'blur', head: 3 }, sweep: { tilt: 0.05, abd: 0.3, wing: 'back' },
  buzzTell: { tilt: -1.1, abd: -0.3, wing: 'wide' }, buzz: { tilt: -1.0, abd: -0.4, wing: 'wide' }, tearTell: { tilt: -1.3, abd: -0.6, wing: 'wide', legs: true },
  volleyTell: { tilt: -0.1, abd: -2.2, wing: 'blur', sting: true }, volley: { tilt: 0.1, abd: -2.7, wing: 'blur', sting: true }, cloakTell: { tilt: -0.3, abd: -0.4, wing: 'wide' },
  tear: { tilt: -1.4, abd: -0.7, wing: 'wide', legs: true }, pinned: { tilt: 0, abd: -0.2, wing: 'fold', lying: true }, away: { tilt: 0, abd: 0, wing: 'blur' },
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

/* (claude/hornetsnestart) bake every frame of every pose at the level's load: the first draw of a pose in the fight was a hitch */
export function warmQueen() { for (const p of Object.values(POSE)) for (let k = 0; k < HQA.beats(p); k++) HQA.queenFrame(p, k, false); }
export function makeHornetQueenHands(ctx) {
  let S = null; const H = {}; let perchSaved = [];
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'hornetqueen' ? ctx.L.arena : null);
  const NEST = () => (ctx.nest ? ctx.nest() : null);
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => e.t === 'hornetqueen';
  H.clear = () => { S = null; BOSS_PHASE.hornetqueen = 1; };
  const live = () => { const e = ctx.boss; return e && e.alive && e.t === 'hornetqueen' ? e : null; };
  const hurt = (name, fn) => { const P = ctx.hero(), h0 = P.hp; fn(); if (S) S.hurt[name] = (S.hurt[name] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); };
  const keyed = (pp, key) => { pp.hqKeys = pp.hqKeys || new Map(); if (pp.hqKeys.size > 160) pp.hqKeys.clear(); if (pp.hqKeys.has(key)) return true; pp.hqKeys.set(key, 1); return false; };
  /* HER SPAWN: in the hall, asleep. Once she is dead (L.hqDown: a death on the way down the trunk) she does not come back - the falling nest goes on without her */
  H.spawnBoss = base => { const Lv = ctx.L; if (!Lv || !Lv.arena || Lv.arena.boss !== 'hornetqueen') return null;
    S = HQM.newFight(HQM.geom(Lv.arena, Lv.descent, ctx.TS)); BOSS_PHASE.hornetqueen = 1;
    if (Lv.hqDown) { S.stage = 'down'; return null; }
    const hp = ctx.EHP.hornetqueen || HQ.hp;
    const e = { ...base, t: 'hornetqueen', w: HQ.w, h: HQ.h, hp, maxHp: hp, noGrav: true, markH: HQ.markH, face: -1, mode: 'sleep', modeT: 0, phase: 1, boss: true, ward: 0, vx: 0, vy: 0, anim: 0 };
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
          const parried = (P.parryT || 0) > 0.2;
          if (res === 'blocked' && o.blockChip && !parried) { const c = Math.max(1, Math.round(d * o.blockChip)); P.hp = Math.max(1, P.hp - c); if (S) S.hurt[name + 'Chip'] = (S.hurt[name + 'Chip'] || 0) + c; ctx.number(P.x, P.y - 30, HQM.HQ_SAY.jarred, '#ff9a5c'); }   /* (a plain block of her sweep still jars you: a parry, or a jump) */
          if (res === 'blocked' && o.onBlock && (!o.parryOnly || parried)) o.onBlock(); }); },
      hitHero: (h, d, name, key) => { const pp = h.pp; ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return; if (key && keyed(pp, key)) return; hurt(name, () => ctx.damagePlayer(e.x, d, { who: e, name, unblockable: true })); }); },
      hatch: (c, n) => { for (let i = 0; i < n; i++) ctx.spawnDrone(c.x + (i ? 10 : -10), c.y - 22 - i * 6); },
      drones: () => ctx.enemies().filter(q => q.alive && q.t === 'wasp' && q.drone).length,
      perchGone: (p, torn) => { for (let x = p.x0; x <= p.x1; x++) { perchSaved.push([x, p.row]); ctx.cellSet(x, p.row, ctx.T.AIR); } if (!torn) ctx.burst((p.x0p + p.x1p) / 2, p.y, 18, ['#e0a838', '#a8741e', '#fff1a0'], 90, 0.8); },
      /* THE HALL TEARS: the torn combs and THE LAST COMB hang (the nest's own combs: cut them and they drop), the honey floods the floor (the nest's sticky rule) */
      tearHall: () => { const N = NEST(), G = S.G.h; if (N && N.addCombs) N.addCombs([...G.torn, ...(G.last ? [G.last] : [])].map(c => ({ id: c.id, x0: c.x0, x1: c.x1, row: c.row, rows: c.rows, last: c.last, hq: true })));
        if (N && N.addHoney && G.honey) N.addHoney(G.honey.x0, G.honey.x1, G.honey.row, Infinity, 'flood');
        ctx.burst((G.x0 + G.x1) / 2, G.top + 20, 30, ['#e0a838', '#fff1a0', '#c47a14', '#d8c8a0'], 160, 1.2); },
    };
  }
  /* the hall's combs as her fight reads them (the nest's hands hold them): hanging, falling, or cut down into the honey */
  const mirrorCombs = () => { const N = NEST(); if (!N || !S) return; S.combs = N.combs().filter(c => c.hq).map(c => ({ id: c.id, x0p: c.x0 * ctx.TS, x1p: (c.x1 + 1) * ctx.TS, y: c.y, rows: c.rows, st: c.st === 'down' ? 'down' : c.st, last: !!c.last })); };
  /* ---------- ONE FRAME OF HER (while her fight is on) ---------- */
  H.update = (e, dt) => {
    if (!S || !e.alive) return; const w = world(e);
    if (e.mode === 'wake' && !S.woke && S.stage === 1) { S.woke = true; e.modeT = 1.6; ctx.number(e.x, e.y - 60, HQ_SAY_WAKE, '#ffd36b'); SOUND.thrash(ctx.sfx); ctx.shake(5); }
    mirrorCombs();
    /* THE SMOKE UNDER HER: a cloud, a set-down pot or a carried one (src/hornets-nest-hands.js) - she is dazed (P2: her cloak goes first) */
    if (HQM.feelsSmoke(e) && !(S.ward > 0) && ctx.smokeUnder) { const sm = ctx.smokeUnder(e.x, e.y, HQ.dazed.r, HQ.dazed.h); if (sm && !(e.smokeCd > 0)) { if (HQM.dazed(e, S, w)) e.smokeCd = HQ.dazed.cd; } else if (sm && !(e.fanSaid > 0)) { e.fanSaid = 2.5; ctx.number(e.x, e.y - HQ.h - 16, HQM.HQ_SAY.smokeOff, '#c8d0d8'); } }   /* (a daze leaves her wary of smoke a while: she fans it off, told) */
    e.fanSaid = Math.max(0, (e.fanSaid || 0) - dt);
    e.smokeCd = Math.max(0, (e.smokeCd || 0) - dt);
    HQM.stepQueen(e, S, dt, heroes(), w);
    if (S.tStart === undefined) S.tStart = ctx.time(); S.tStage = S.tStage || {}; if (S.tStage[S.stage] === undefined) S.tStage[S.stage] = Math.round(ctx.time() - S.tStart);   /* (when each phase began, from her waking: tools read it) */
    e.phase = S.stage === 2 ? 2 : 1; e.open = HQM.hqOpen(e) ? Math.max(0, e.modeT) : 0; e.openKind = e.mode;
  };
  /* THE LEVEL'S FRAME, fight or not: once she is dead, THE FALLING NEST's comb comes down the trunk at the hero (her stepQueen does not run: the chunks fall on their own clock here) */
  H.tick = dt => { if (!S || S.stage !== 'down') return; const w = world({ x: 0, y: 0 }); HQM.stepEscape(S, dt, heroes(), w);
    for (const c of S.chunks) { if (c.st === 'told') { c.t -= dt; if (c.t <= 0) c.st = 'fall'; } else if (c.st === 'fall') { c.vy = Math.min(520, c.vy + 900 * dt); c.y += c.vy * dt;
        if (c.y >= c.floorY) { c.st = 'done'; ctx.dust(c.x, c.floorY, 8); SOUND.chunk(ctx.sfx); w.hit([c.x - HQ.descent.r, c.x + HQ.descent.r, c.floorY - 26, c.floorY + 2], HQ.descent.dmg, 'falling comb', { key: c.key }); } } }
    S.chunks = S.chunks.filter(c => c.st !== 'done'); };
  /* A HERO'S BLOW (main.js attackBox): a hall brood cell smashed (the hall's combs are the nest's: src/hornets-nest-hands.js strike cuts them) */
  H.strike = hb => { if (!S || !hb || !ctx.bossActive) return; const e = live(); if (!e) return;
    if (S.stage === 1) for (const c of S.cells) { if (c.st !== 'idle' && c.st !== 'pulse') continue; if (hb.l < c.x + 8 && hb.r > c.x - 8 && hb.t < c.y && hb.b > c.y - 14) { c.st = 'broken'; c.t = HQ.brood.every * 2; S.n.smashed++; ctx.burst(c.x, c.y - 6, 12, ['#e0b040', '#fff1a0', '#c06040'], 70, 0.6); SOUND.cut(ctx.sfx); } } };
  /* A THROWN SMOKE POT that meets her (src/hornets-nest-hands.js onQueen): it breaks on her - and the cloud it leaves is under her */
  H.potHits = (x, y) => { const e = live(); if (!e || !ctx.bossActive || !S || S.stage === 'down') return false; return Math.abs(x - e.x) < HQ.w / 2 + 4 && y > e.y - HQ.h - 4 && y < e.y + 6; };
  /* A BLOW ON HER (B15; src/hornet-queen.js takeBlow) - the turned share clanks and says why */
  H.take = (e, dmg, fromX, pl) => { if (!S) return dmg; const [d, word] = HQM.takeBlow(e, S, dmg, pl); S.dmgBy = S.dmgBy || {}; const mk = (S.ward > 0 ? 'ward' : e.mode) + (S.stage === 2 ? '2' : ''); S.dmgBy[mk] = (S.dmgBy[mk] || 0) + d;   /* (what each of her states gave: a tool's ledger) */
    if (word && d > 0) { e.chipHit = ctx.time(); e.guardFx = 0.25; e.guardWord = word; ctx.sfx.clank && ctx.sfx.clank(); const sd = Math.sign(ctx.hero().x - e.x) || 1; ctx.sparks(e.x + sd * 12, e.y - 12, sd, 4);
      if (!S.told.shell && word === HQM.HQ_SAY.shell) { S.told.shell = 1; ctx.hint && ctx.hint('HER SHELL TURNS A CUT. BAIT HER DIVE INTO A COMB PERCH, SMOKE UNDER HER, OR COME DOWN ON HER FROM ABOVE.'); } }
    return d; };
  H.barName = e => 'THE HORNET QUEEN' + (HQM.hqOpen(e) ? '  ' + (HQM.OPEN_NAME[e.mode] || 'OPEN') : S && S.ward > 0 ? '  WARDED' : S && S.cloak > 0 ? '  CLOAKED' : S && S.stage === 2 ? '  THE HONEY HALL' : '');
  /* HER DEATH: the fight stops; THE FALLING NEST begins (main.js hqDown: the checkpoint at the hall's torn east side, the road on to the gate) */
  H.end = e => { if (S) { S.chunks = []; S.stingers = []; S.stage = 'down'; } BOSS_PHASE.hornetqueen = 1; if (ctx.down) ctx.down(); };
  H.stage = () => (S ? S.stage : 0);
  H.read = () => S && { stage: S.stage, tStage: S.tStage, dmgBy: S.dmgBy, maxHp: ctx.boss && ctx.boss.maxHp, mode: ctx.boss && ctx.boss.mode, ward: S.ward, cloak: S.cloak, perches: S.perches.map(p => ({ id: p.id, st: p.st })), cells: S.cells.map(c => ({ x: c.x, st: c.st })),
    combs: S.combs.map(c => ({ id: c.id, st: c.st, y: c.y, last: c.last })), pinUsed: { ...S.pinUsed }, n: JSON.parse(JSON.stringify(S.n)), hurt: { ...S.hurt } };
  /* a level reload or a fresh attempt: the perches her buzz brought down (or the tear tore loose) are back (the nest's reset takes its torn combs and honey up) */
  H.restore = () => { for (const [x, y] of perchSaved) ctx.cellSet(x, y, ctx.T.ONEWAY); perchSaved = []; };
  /* ---------- DRAWING ---------- */
  H.drawBack = (g, cx, cy, time) => { if (!S) return; const VW = ctx.VW(), G = S.G.h;
    /* THE HONEY (P2): the flood on the hall's floor, a glossy amber skin with its slow creep, and the drips from the torn vault */
    if (S.stage === 2 && G.honey) { const x0 = G.honey.x0 - cx, w = G.honey.x1 - G.honey.x0, y = G.floor - cy;
      g.globalAlpha = 0.85; g.fillStyle = '#c47a14'; g.fillRect(R(x0), R(y - 3), R(w), 3); g.fillStyle = '#eea52a'; g.fillRect(R(x0), R(y - 4), R(w), 1); g.globalAlpha = 1;
      for (let k = 6; k < w - 4; k += 11) { const ph = (time * 0.5 + k * 0.071) % 1; if (ph < 0.35) rect(g, x0 + k, y - 4, 2, 1, '#fff0a0'); }
      for (let k = 0; k < 7; k++) { const xx = x0 + 24 + k * (w - 48) / 6, ph = (time * 0.6 + k * 0.37) % 1, top = G.top - cy + 6, len = 10 + ((k * 13) % 17); rect(g, xx, top, 2, len, '#c47a14'); rect(g, xx, top + len + ph * (y - top - len), 2, 3, '#eea52a'); } }
    /* THE HALL (P1): her brood cells in its walls */
    for (const k of S.cells) { const x = R(k.x - cx), y = R(k.y - cy); if (x < -30 || x > VW + 30) continue; HNP.cell(g, x, y, k.st, k.st === 'pulse' ? 1 - k.t / HQ.brood.pulse : 0, time); }
    /* a perch her buzz (or the tear) has set shaking: it drips and trembles (the tell) */
    for (const p of S.perches) if (p.st === 'shake') { const x0 = p.x0p - cx, y = p.y - cy; for (let k = 0; k < 4; k++) rect(g, x0 + 4 + k * 18 + Math.sin(time * 30 + k) * 1.5, y + 2, 2, 3 + ((time * 8 + k) % 4), '#ff9a5c'); } };
  H.drawBoss = (g, e, cx, cy, time) => { if (!S || e.mode === 'away') return; e.guardFx = Math.max(0, (e.guardFx || 0) - 1 / 60);
    const f = e.face || 1, x = e.x - cx, y = e.y - cy - HQ.h / 2, p = POSE[e.mode] || POSE.hover, flash = (e.hurtT || 0) > 0 || (e.flash || 0) > 0.06;
    if (S.stage !== 'down') { const fl = S.G.h.floor; g.globalAlpha = 0.25; ell(g, x, fl - cy - 1, 14, 2.5, '#10060a'); g.globalAlpha = 1; }
    if (S.cloak > 0) HQA.cloak(g, x, y, time);
    const at = HQA.drawQueen(g, x, y + (p.y || 0), f, p, time, flash);
    HQA.queenFx(g, { mode: e.mode, x, y, f, time, tip: at.tip, head: at.head, vx: (e.vx || 0) * f, vy: e.vy || 0, held: !!e.held });
    if (e.mode === 'aim' && e.held && Math.floor(time * 6) % 2) rect(g, x - f * 14, y + 10, 3, 3, '#ffd36b');
    if ((e.smokeCd || 0) > 0) { g.globalAlpha = 0.5; for (let k = 0; k < 3; k++) { const ph = (time * 2 + k / 3) % 1; rect(g, x + (k - 1) * 10, y - 12 - ph * 14, 4, 2, '#c8d0d8'); } g.globalAlpha = 1; } };   /* wary of smoke: her wings fan it off (the read of her smoke cooldown) */
  H.drawOver = (g, cx, cy, time) => { if (!S) return; const e = live(), X = v => R(v - cx), Y = v => R(v - cy), blink = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0';
    /* the falling comb: a chunk in the air, and its red ring where it will land */
    for (const c of S.chunks) { g.strokeStyle = blink; g.beginPath(); g.ellipse(X(c.x), Y(c.floorY) - 1, HQ.buzz.r, 3, 0, 0, 7); g.stroke(); if (c.st === 'fall') HNP.slab(g, X(c.x) - 8, Y(c.y) - 9, 16, 11, false, time); }
    for (const s of S.stingers) HQA.dart(g, X(s.x), Y(s.y), s.vx, s.vy, time);
    if (!e || !ctx.bossActive || e.mode === 'away') return;
    /* HER FLIGHT (P2), told: her loop's shadow on the honey ahead of her where she will pass low - and a hanging comb she will pass under glows on its plumb line */
    if (S.stage === 2 && (e.mode === 'circle' || e.mode === 'rejoin')) { g.fillStyle = 'rgba(40,20,10,0.35)'; for (let k = 1; k <= 14; k++) { const q = HQM.loopAhead(S, k * 0.18); if (S.G.h.floor - q.y > 60) continue; g.fillRect(X(q.x) - 2, Y(S.G.h.floor) - 6, 4, 2); }
      for (const c of S.combs) if (c.st === 'hang') { let soon = false; for (let k = 1; k <= 5; k++) if (HQM.underComb(c, HQM.loopAhead(S, k * 0.12))) soon = true; if (soon) { g.globalAlpha = 0.5 + 0.3 * Math.sin(time * 14); g.strokeStyle = '#ffd36b'; g.strokeRect(X(c.x0p) + 0.5, Y(c.y) + 0.5, R(c.x1p - c.x0p) - 1, c.rows * 16 - 1); g.globalAlpha = 1; } } }
    /* THE READ (B10) */
    const x = X(e.x), y = Y(e.y - HQ.h / 2);
    if (HQM.hqOpen(e)) { const kk = Math.max(0, e.modeT / (e.openT0 || 1)); g.globalAlpha = 0.6 + 0.3 * Math.sin(time * 10); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 24, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      const by = Y(e.y - 40); ctx.text(HQM.OPEN_NAME[e.mode] || 'OPEN', x, by - 6, '#ffd36b', 'center', 6); g.fillStyle = '#1b1626'; g.fillRect(x - 18, by, 36, 3); g.fillStyle = '#ffd36b'; g.fillRect(x - 18, by, R(36 * kk), 3); }
    if (S.ward > 0) { g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 6); g.strokeStyle = '#c8d8e8'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 26, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1; ctx.text('WARDED', x, Y(e.y - HQ.h - 22), '#c8d8e8', 'center', 5); }
    if (e.guardFx > 0 && e.guardWord) ctx.text(e.guardWord, x, Y(e.y - HQ.h - 34) - R((0.25 - e.guardFx) * 30), Math.floor(time * 12) % 2 ? '#ffffff' : '#e8c070', 'center', 6); };
  return H;
}
const HQ_SAY_WAKE = HQM.HQ_SAY.wake;
/* HER BESTIARY CARD: two of her poses (hover, the aim) - main.js SPR.hornetqueenCard */
export function bakeHornetQueenCard() {
  const fr = HQA.bakeCard([POSE.hover, POSE.aim]);
  const white = fr.map(c => whiten(c)); return { R: fr, L: fr.map(flipX), white: { R: white, L: white.map(flipX) }, ax: 56, ay: 62, w: HQ.w, h: HQ.h };
}
