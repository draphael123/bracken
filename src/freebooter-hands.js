// src/freebooter-hands.js - THE FREEBOOTER's HANDS (claude/water1, the greybox). src/freebooter-boss.js is the fight (pure); this binds it to the world: his deck and HIS
// SLOOP (a prize of src/pirate-fleet-hands.js, riding the second swell - in phase two HE hauls her alongside), his told blows on every seat (keyed once a blow; a guard
// turns the ! moves, the pistol goes through it), the sea gap between the decks (a hero who goes in is HAULED OUT onto his deck - the Admiral's rule, a hazard's share),
// every blow on him (take: guard by angle, never under 0.4x), and the drawing (GREYBOX poses: windup and release per move - the art pass owes his sheet).
// main.js calls: spawnBoss, owns, on, update, take, strike, drawBoss, drawOver, barName, end, read, clear.
import * as FBM from './freebooter-boss.js';
const { FB } = FBM;
const R = Math.round;
const SOUND = { tell: s => s.tell && s.tell(false), tellHard: s => s.tell && s.tell(true), slash: s => (s.foeSlash || s.slash)(), open: s => (s.bell || s.clank)(), pistol: s => (s.gun || s.musket || s.crack || s.boom)(),
  whistle: s => (s.whistle || s.tell)(true), whoosh: s => (s.whoosh || s.pJump || s.tell)(), thud: s => (s.thud || s.crack)(), flash: s => (s.boom || s.crack)(), clank: s => s.clank() };

export function makeFreebooterHands(ctx) {
  let S = null, WORD = null; const splashes = [];
  const H = {};
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'freebooter' ? ctx.L.arena : null);
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => e.t === 'freebooter';
  H.clear = () => { S = null; WORD = null; splashes.length = 0; };
  const TS = 16;
  function geom(Ar) { return { deck: [Ar.deck[0] * TS, (Ar.deck[1] + 1) * TS], gap: [Ar.gap[0] * TS, (Ar.gap[1] + 1) * TS], sloop: [Ar.sloop[0] * TS, (Ar.sloop[1] + 1) * TS], floor: Ar.floor, sloopId: Ar.sloopId, x0: Ar.x0, x1: Ar.x1 }; }
  const sloopIn = () => !!(ctx.pfh && S && ctx.pfh.prizeK(S.G.sloopId) >= 1);
  const deckOf = x => { const G = S.G; if (x >= G.deck[0] && x < G.deck[1]) return 0; if (x >= G.sloop[0] && x < G.sloop[1] && sloopIn()) return 1; return -1; };
  const floorAt = x => { const d = deckOf(x); if (d === 0) return S.G.floor; if (d === 1) return ctx.pfh.deckY(S.G.sloopId); return null; };
  const clampX = (x, d) => { const G = S.G; if (d === undefined || d < 0) d = deckOf(x); if (d < 0) d = x > G.gap[1] && sloopIn() ? 1 : 0; if (d === 1 && !sloopIn()) d = 0;
    const [a, b] = d === 1 ? G.sloop : G.deck; return Math.max(a + 12, Math.min(b - 12, x)); };
  const keyed = (pp, key) => { pp.fbKeys = pp.fbKeys || new Map(); if (pp.fbKeys.size > 80) pp.fbKeys.clear(); if (pp.fbKeys.has(key)) return true; pp.fbKeys.set(key, 1); return false; };
  const hurt = (name, fn) => { const P = ctx.hero(), h0 = P.hp; fn(); if (S) S.hurt[name] = (S.hurt[name] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); };

  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null;
    S = FBM.newFight(geom(Ar)); S.hurt = {}; WORD = null;
    const e = { ...base, t: 'freebooter', w: FB.w, h: FB.h, hp: ctx.EHP.freebooter, maxHp: ctx.EHP.freebooter, noGrav: true, markH: FB.markH, face: -1, mode: 'sleep', modeT: 0, open: 0, phase: 1 };
    e.y = S.G.floor; for (const pp of ctx.players) pp.fbKeys = null; if (ctx.pfh) ctx.pfh.unhaul(S.G.sloopId); return e; };

  const heroes = () => ctx.players.map(pp => ({ x: pp.x, y: pp.y, ground: !!pp.ground, alive: ctx.upright(pp) && !pp.dead, dodge: (pp.dodge || 0) > 0, pp }));
  function world(e) {
    const hitOne = (pp, bx, d, name, o) => { let any = false; ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
        if (bx && !ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P))) return; if (keyed(pp, o.key || name)) return;
        const hp0 = P.hp; hurt(name, () => ctx.damagePlayer(e.x, d, { who: e, name, blow: name, unblockable: !o.blockable, noKnock: !!o.shove }));
        if (P.hp < hp0) { any = true; if (o.shove && !P.dead) P.vx = o.shove; } }); return any; };
    return {
      number: (x, y, t, col) => ctx.number(x, y, t, col), sound: k => { const f = SOUND[k]; if (f) try { f(ctx.sfx); } catch {} },
      mark: m => ctx.number(e.x, e.y - FB.markH, m, m === '!' ? '#ffd36b' : '#ff6b6b'),
      hit: (bx, d, name, o = {}) => { let any = false; for (const pp of ctx.players) if (hitOne(pp, bx, d, name, o)) any = true; return any; },
      /* THE PISTOL's ball: a hero whose chest is on the line at the bang is hit, through any guard; a roll's i-frames or a jump over the line slip it */
      shot: (L, d, name) => { for (const pp of ctx.players) { if (pp.dead || (pp.dodge || 0) > 0) continue; const px = pp.x, py = pp.y - FB.pistol.y,
          vx = L.x1 - L.x0, vy = L.y1 - L.y0, u = Math.max(0, Math.min(1, ((px - L.x0) * vx + (py - L.y0) * vy) / (vx * vx + vy * vy || 1))), dd = Math.hypot(L.x0 + vx * u - px, L.y0 + vy * u - py);
          if (dd < 9) hitOne(pp, null, d, name, { key: 'shot' + S.n.pistol }); }
        ctx.burst(L.x0, L.y0, 8, ['#fff6c8', '#ffd36b', '#9aa39a'], 90, 0.3, -10); },
      floorAt, clampX, deckOf, sloopIn,
      haul: () => { if (ctx.pfh) ctx.pfh.haul(S.G.sloopId); },
      flash: ee => { ctx.burst(ee.x, ee.y - 14, 22, ['#fff6c8', '#ff9a5c', '#9aa39a', '#3a3a44'], 120, 0.5, -30); ctx.ring(ee.x, ee.y - 14, 26, '#ff9a5c'); },
      ringWard: ee => ctx.ring(ee.x, ee.y - 18, 32, '#9ab0c0'),
      fx: (k, x, y) => { if (k === 'land') { ctx.shake(5); ctx.burst(x, y - 2, 18, ['#c9b27c', '#6a5a44', '#e8dcc0'], 110, 0.6, -60); } },
    };
  }

  H.update = (e, dt) => {
    if (!S || !e.alive) return; const Ar = A(); if (!Ar) return;
    if (e.mode === 'wake' && !S.woke) { S.woke = true; ctx.number(e.x, e.y - 90, FBM.FB_SAY.woke, '#ffd36b'); if (ctx.music) ctx.music('admiral'); }
    /* THE SEA BETWEEN THE DECKS: in, and you are hauled out onto his deck (the hazard's share of your health) */
    for (const pp of ctx.players) { if (pp.dead || !(pp.y > S.G.floor + 22) || pp.x < S.G.deck[1] - 4 || pp.x > S.G.sloop[1]) continue;
      const to = S.G.deck[1] - 30; splashes.push({ x: pp.x, t: ctx.time() }); ctx.hazard(pp, to, S.G.floor); S.n.hauled = (S.n.hauled || 0) + 1; }
    FBM.stepFreebooter(e, S, dt, heroes(), world(e));
    e.phase = S.ph;
    if (/Tell$/.test(e.mode)) { const k = e.mode.replace(/Tell$/, ''); if (FBM.MOVES[k] && (!WORD || WORD.k !== k)) WORD = { k, t: ctx.time() }; } else WORD = null;
  };
  H.strike = () => {};
  /* A BLOW ON HIM: never nothing, never under 0.4x (B15) - guard by angle (B11) */
  H.take = (e, dmg, blow) => { if (!S) return dmg; const P = ctx.hero();
    const r = FBM.takeAt(e, S, P ? { x: P.x, y: P.y } : null);
    if (r.word && blow) { e.guardFx = 0.25; e.guardWord = r.word; if (ctx.turned) ctx.turned(e, P.x, r.word, { stop: false }); if (r.parry && ctx.sparks) ctx.sparks(e.x, e.y - 20, -(Math.sign(e.x - P.x) || 1), 6); }
    if (r.parry && blow) FBM.parried(e, S, world(e));
    if (blow) FBM.landed(e, S, ctx.time(), world(e));
    return dmg * Math.max(FB.k.floor, r.k); };
  H.barName = e => 'THE FREEBOOTER' + (e.mode === 'reload' && e.open > 0 ? '  RELOADING' : e.mode === 'stuck' && e.open > 0 ? '  STUCK IN THE DECK' : S && S.ward > 0 ? '  WARDED' : '');
  H.end = e => { if (S && e && (!e.alive || e.hp <= 0)) { S.dead = { x: e.x, y: e.y, f: e.face || 1 }; ctx.number(e.x, e.y - 70, FBM.FB_SAY.down, '#ffd36b'); } if (S) { S.mark = null; S.aim = null; S.shot = null; } };
  H.read = () => S && { mode: ctx.boss && ctx.boss.mode, ph: S.ph, ward: S.ward, open: ctx.boss ? ctx.boss.open : 0, sloopIn: sloopIn(), n: { ...S.n }, hurt: { ...S.hurt }, plan: FBM.fbPlan(ctx.boss, S) };

  /* ---------- DRAWING (GREYBOX) ---------- */
  H.drawBoss = (g, e, cx, cy, t) => {
    const x = R(e.x - cx), y = R(e.y - cy), f = e.face || 1, m = e.mode, tell = /Tell$/.test(m), stuck = m === 'stuck';
    /* coat, sash, boots, tricorn: a pirate, the Freebooter's own colours */
    g.fillStyle = '#2a1e1a'; g.fillRect(x - 5, y - 6, 4, 6); g.fillRect(x + 1, y - 6, 4, 6);
    g.fillStyle = '#7a1e22'; g.fillRect(x - 7, y - (stuck ? 18 : 24), 14, stuck ? 12 : 18);
    g.fillStyle = '#c9a83a'; g.fillRect(x - 7, y - 12, 14, 2);
    g.fillStyle = '#e0b890'; g.fillRect(x - 4, y - (stuck ? 26 : 32), 8, 8);
    g.fillStyle = '#1a1612'; g.fillRect(x - 8, y - (stuck ? 28 : 34), 16, 3); g.fillRect(x - 4, y - (stuck ? 31 : 37), 8, 3);
    /* the arm: WINDUP (raised back) in a tell, RELEASE (out) in the blow */
    const arm = tell ? -1 : COMMIT.has(m) ? 1 : 0, ax = x + f * (arm > 0 ? 12 : arm < 0 ? -4 : 6), ay = y - (arm < 0 ? 30 : 18);
    g.fillStyle = '#7a1e22'; g.fillRect(Math.min(x, ax), ay, Math.abs(ax - x) + 2, 3);
    if (m === 'pistolTell' || m === 'pistolFire' || m === 'reload') { g.fillStyle = '#3a3a44'; g.fillRect(x + f * 8, y - 20, f * 8, 3); if (m === 'reload') { g.fillStyle = '#c9b27c'; g.fillRect(x + f * 4, y - 16 + R(Math.sin(t * 10) * 2), 2, 6); } }
    else { g.fillStyle = '#d8d8e0'; g.fillRect(ax + (f > 0 ? 0 : -14), ay - (arm < 0 ? 12 : 0), arm < 0 ? 2 : 14, arm < 0 ? 14 : 2); }
    if (m === 'plungeTell' || m === 'plungeAir') { g.fillStyle = '#d8d8e0'; g.fillRect(x - 1, y + 2, 2, 12); }   /* the cutlass point down */
    if (stuck) { g.fillStyle = '#d8d8e0'; g.fillRect(x + f * 6, y - 6, 2, 8); }   /* the blade in the deck */
    /* THE READ: gold ring + timer when open, grey when warded */
    if (FBM.fbOpen(e)) { const k = e.open / (m === 'stuck' ? FB.plunge.stuck : FB.pistol.reload); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.arc(x, y - 16, 20, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1;
      g.fillStyle = '#ffd36b'; g.fillRect(x - 14, y - 46, R(28 * k), 2); }
    else if (S && S.ward > 0) { g.strokeStyle = '#9ab0c0'; g.beginPath(); g.arc(x, y - 16, 20, 0, Math.PI * 2); g.stroke(); }
    if (WORD && ctx.text) { const M = FBM.MOVES[WORD.k]; ctx.text(FBM.MOVE_NAME[WORD.k] + ': ' + M.answer, x, y - 58, M.mark === '!' ? '#ffd36b' : '#ff6b6b'); }
  };
  const COMMIT = FBM.COMMITTED;
  H.drawOver = (g, cx, cy, t) => {
    if (!S) return; const e = ctx.boss; if (!e || e.t !== 'freebooter' || !e.alive) return;
    /* the pistol's aim: dotted while it tracks, solid red when it LOCKS */
    if (e.mode === 'pistolTell' && S.aim) { const lock = e.modeT <= FB.pistol.lock, x0 = R(e.x + e.face * 10 - cx), y0 = R(e.y - FB.pistol.y - cy), x1 = R(S.aim.x - cx), y1 = R(S.aim.y - cy);
      g.strokeStyle = lock ? '#ff3b3b' : 'rgba(255,107,107,0.7)'; g.setLineDash && g.setLineDash(lock ? [] : [3, 3]); g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + (x1 - x0) * 3, y0 + (y1 - y0) * 3); g.stroke(); g.setLineDash && g.setLineDash([]); }
    if (S.shot && S.shot.t > 0) { S.shot.t -= 1 / 60; g.strokeStyle = 'rgba(255,246,200,0.9)'; g.beginPath(); g.moveTo(R(S.shot.x0 - cx), R(S.shot.y0 - cy)); g.lineTo(R(S.shot.x1 - cx), R(S.shot.y1 - cy)); g.stroke(); }
    /* the plunge's mark: red on the deck where he will come down */
    if ((e.mode === 'plungeTell' || e.mode === 'plungeAir') && S.mark) { const fy = floorAt(S.mark.x); if (fy != null) { const x = R(S.mark.x - cx), y = R(fy - cy), lock = e.mode === 'plungeAir' || e.modeT <= FB.plunge.tell - FB.plunge.track;
      g.fillStyle = lock ? 'rgba(255,59,59,0.85)' : 'rgba(255,107,107,0.5)'; g.fillRect(x - FB.plunge.r, y - 2, FB.plunge.r * 2, 2); } }
  };
  return H;
}
