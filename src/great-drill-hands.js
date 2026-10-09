// src/great-drill-hands.js - THE GREAT DRILL's HANDS (claude/minecart, the OPUS GREYBOX). src/great-drill.js is the fight (pure: its phases, its moves,
// the ore carts and the points, the bot's reading); this binds it to the world: its told blows on the heroes, THE TREADMILL (src/minecart-hands.js
// drive asks tread(): while it fights, the bore runs past at the cart's cruise), THE POINTS MAST (a blow or E sets / clears the points), an ore cart
// into a hero's cart, and the drawing (GREYBOX shapes: the machine, its bit and gears and cab, the scrolling bore, the chute, the mast).
// THE SHARED READ (B10): OPEN (JAMMED) = a gold ring round the cab and a timer bar; WARDED = pale plates over the cab and the word; a blow that does
// nothing CLANKS, flashes and says WARDED.
// main.js calls: spawnBoss, owns, on, update, take, interact, tread, drawBack, drawWorld, drawBoss, drawOver, barName, end, read, show, clear, phase.
import * as GD from './great-drill.js';
import * as MCA from './redraw/minecart_art.js';   /* THE ART PASS (claude/minecartart): the machine, its bit, red gears and cab, the bore's lining, the chute, the mast, the ore cart */
import { BOSS_PHASE } from './boss-music.js';
const { DRILL } = GD;

const SOUND = { tell: s => s.tell && s.tell(false), tellHard: s => s.tell && s.tell(true), bore: s => (s.boreRoar || s.heavy)(), grind: s => (s.rumble || s.heavy)(), jam: s => { (s.clank || s.heavy)(); s.crack && s.crack(); },
  ward: s => (s.clank || s.thud)(), phase: s => (s.roar || s.heavy)(), chute: s => (s.rattle ? s.rattle(1) : s.clank && s.clank()), oreLand: s => (s.thud || s.heavy)(), points: s => (s.clank || s.thud)(), eat: s => (s.crack || s.heavy)(), rock: s => (s.rubble || s.thud || s.heavy)() };
BOSS_PHASE.greatdrill = BOSS_PHASE.greatdrill || 1;

export function makeDrillHands(ctx) {
  const txt = (s, x, ...a) => { if (!(x > -48 && x < ctx.VW() + 48)) return; ctx.text(s, x, ...a); };   /* screen words only where the screen is (textfit: a label drawn off the page is a smudge on a wide view) */
  let S = null;
  const H = {};
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'greatdrill' ? ctx.L.arena : null);
  const R = Math.round;
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => e.t === 'greatdrill';
  /* THE HIGH LINE (P3 brings the roof down on it): its rail laid or taken up - laid again whenever the fight is made or ends */
  const highLine = on => { const Ar = A(); if (!Ar || !ctx.cellSet || !ctx.T) return; const q = Ar.drill; for (let x = q.sx; x < q.sx + GD.DRILL_STAGE.W; x++) ctx.cellSet(x, q.F - GD.DRILL_STAGE.lanes[2], on ? ctx.T.RAIL : ctx.T.AIR); };
  H.clear = () => { if (S && S.highDown) highLine(true); S = null; BOSS_PHASE.greatdrill = 1; };
  H.phase = () => (S && ctx.bossActive && ctx.boss && ctx.boss.t === 'greatdrill' && ctx.boss.alive ? S.ph : 0);
  /* THE TREADMILL: while it fights, the bore runs past at the cart's cruise (the arena stands still) */
  H.tread = () => { const e = ctx.boss; if (!S || !A() || !ctx.bossActive || !e || e.t !== 'greatdrill' || !e.alive || e.mode === 'sleep') return null; return { cruise: DRILL.cruise, x0: S.G.x0, x1: S.G.x1 }; };
  const keyed = (pp, key) => { pp.gdKeys = pp.gdKeys || new Map(); if (pp.gdKeys.size > 120) pp.gdKeys.clear(); if (pp.gdKeys.has(key)) return true; pp.gdKeys.set(key, 1); return false; };
  const hurt = (name, fn) => { const P = ctx.hero(), h0 = P.hp; fn(); if (S) { S.hurt = S.hurt || {}; S.hurt[name] = (S.hurt[name] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); } };

  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null;
    highLine(true); S = GD.newFight(GD.geom(Ar, ctx.TS)); S.D = S.G.x0 - 60; BOSS_PHASE.greatdrill = 1;
    const e = { ...base, t: 'greatdrill', w: DRILL.w, h: DRILL.h, hp: ctx.EHP.greatdrill, maxHp: ctx.EHP.greatdrill, noGrav: true, face: 1, mode: 'sleep', modeT: 0, open: 0, phase: 1, boss: true };
    e.x = S.G.x0; e.y = S.G.laneY[1]; for (const pp of ctx.players) pp.gdKeys = null; return e; };

  const heroes = () => ctx.players.map(pp => ({ x: pp.x, y: pp.y, vx: pp.vx, ground: !!pp.ground, alive: ctx.upright(pp) && !pp.dead, lane: pp.ground ? GD.laneOf(S.G, pp.y) : -1, pp }));
  function world(e) {
    return {
      arena: k => { if (k === 'highDown') { highLine(false); ctx.shake(7); const G = S.G; for (let x = G.x0 + 20; x < G.x1; x += 24) ctx.burst(x, G.laneY[2], 6, ['#6b5a48', '#8a7660', '#2a2119'], 90, 0.7); } },
      number: (x, y, t, col) => ctx.number(x, y, t, col), sound: k => { const f = SOUND[k]; if (f) try { f(ctx.sfx); } catch {} }, shake: n => ctx.shake(n),
      music: ph => { BOSS_PHASE.greatdrill = ph; if (ctx.music) ctx.music(ph > 1 ? 'greatdrill:p' + ph : 'greatdrill'); },
      hit: (bx, d, name, o = {}) => { let any = false; for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
          if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P)) || keyed(pp, o.key || name)) return;
          const hp0 = P.hp; hurt(name, () => ctx.damagePlayer(bx[0], d, { who: e, name, unblockable: !o.blockable, noKnock: true })); if (P.hp < hp0) any = true; }); return any; },
      crash: (h, o) => ctx.asPlayer(h.pp, () => { const P = ctx.hero(); hurt('AN ORE CART', () => ctx.damagePlayer(o.x, DRILL.oreDmg, { who: e, name: 'AN ORE CART', unblockable: true, noKnock: true })); const c = ctx.cartOf(P); if (c) c.v *= 0.5;
        ctx.burst(o.x, o.y - 8, 12, ['#5a6270', '#d89a5a', '#ffd36b'], 80, 0.5); ctx.number(o.x, o.y - 30, 'THE ORE CART HITS YOU: KEEP OFF ITS LINE', '#ff9a5c'); }),
    };
  }
  H.update = (e, dt) => {
    if (!S || !e.alive) return; const Ar = A(); if (!Ar) return;
    if (e.mode === 'wake' && !S.woke) { S.woke = true; ctx.number(S.G.x0 + 60, S.G.laneY[2] - 40, 'THE GREAT DRILL BORES OUT OF THE WALL', '#ffd36b'); ctx.shake(8); }
    GD.stepDrill(e, S, dt, heroes(), world(e));
    e.phase = S.ph;
    /* THE POINTS MAST: a blow that lands on it */
    for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(), hb = ctx.attackBox(); if (!hb || P.hitSet.has(S)) return; if (ctx.overlap(hb, mastBox())) { P.hitSet.add(S); throwIt(P); } });
    if (!S.told.cab && e.mode === 'idle' && S.t > 2) { S.told.cab = 1; ctx.number(S.D, S.G.laneY[2] - 44, "ITS CAB TAKES A BLOW: BRAKE BACK TO IT, OFF THE BIT'S LINE", '#ffd36b'); }
  };
  const mastBox = () => { const G = S.G; return { l: G.pointsX - 9, r: G.pointsX + 9, t: G.laneY[2] - 30, b: G.laneY[0] }; };
  const throwIt = P => { const on = GD.throwPoints(S); ctx.sfx.clank && ctx.sfx.clank(); ctx.sparks(S.G.pointsX, P.y - 14, 1, 5); ctx.number(S.G.pointsX, S.G.laneY[2] - 36, on ? 'POINTS SET: THE ORE DROPS TO THE GEARS' : 'POINTS CLEAR', on ? '#ffd36b' : '#9aa39a'); return true; };
  H.interact = P => { if (!S || !ctx.bossActive || !A()) return false; if (Math.abs(P.x - S.G.pointsX) > 26) return false; return throwIt(P); };
  /* A BLOW ON THE CAB */
  H.take = (e, dmg) => { if (!S) return dmg; const o = {}; const d = GD.takeBlow(e, S, dmg, o);
    if (o.word) { e.guardFx = 0.3; e.guardWord = o.word; }
    if (d <= 0) { e.chipHit = ctx.time(); ctx.sfx.clank && ctx.sfx.clank(); ctx.sparks(GD.cabBox(S.G, S).r, S.G.laneY[1] - 20, 1, 4); }
    return d; };
  H.barName = e => 'THE GREAT DRILL' + (e.mode === 'jammed' ? '  JAMMED' : S && S.ward > 0 ? '  WARDED' : '');
  H.end = e => { if (S) { S.ores = []; S.roof = []; S.chute = null; S.bitLen = DRILL.bitIdle; if (S.highDown) { S.highDown = false; highLine(true); } } BOSS_PHASE.greatdrill = 1; if (ctx.L) ctx.L.mcDrillDown = true; };
  H.read = () => S && { mode: ctx.boss && ctx.boss.mode, ph: S.ph, D: R(S.D), bitLane: S.bitLane, bitLen: R(S.bitLen), points: S.points, ores: S.ores.map(o => ({ x: R(o.x), lane: o.lane, drop: o.drop })), ward: S.ward, n: { ...S.n }, hurt: { ...(S.hurt || {}) } };

  /* ---------- DRAWING (greybox) ---------- */
  /* THE BORE behind everything: ribs and sleepers running past at the cart's cruise while it fights */
  H.drawBack = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar) return; const G = S.G, tm = H.tread(), off = tm ? (time * DRILL.cruise) % 32 : 0, x0 = R(G.x0 - cx), w = G.x1 - G.x0;
    MCA.boreBack(g, x0, w, R(G.ceilY - cy), R(G.floor - cy), off, G.laneY.map(v => R(v - cy)), !!S.highDown, time); };
  /* IN THE WORLD: the chute, the points mast, the ore carts */
  H.drawWorld = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar) return; const G = S.G;
    /* the chute (its tell: it rattles and the line it will drop on flashes) */
    const chx = R(G.chuteX - cx), cty = R(G.ceilY - cy); MCA.chute(g, chx, cty, !!S.chute, S.chute ? R(G.laneY[S.chute.lane] - cy) - 2 : 0, time);
    const vw = ctx.VW(), onS = x => x > -40 && x < vw + 40;   /* (labels only where the screen is: textfit found them drawn off the page) */
    if (S.chute && onS(chx)) { const fl = Math.floor(time * 12) % 2; txt('ORE!', chx, cty + 42, fl ? '#ffd36b' : '#ff9a5c', 'center', 6); }
    /* THE POINTS MAST */
    const px = R(G.pointsX - cx), pc = S.points ? '#ffd36b' : '#7fc4e0'; MCA.mast(g, px, R(G.laneY[2] - 30 - cy), R(G.laneY[0] - cy), S.points, time);
    if (onS(px)) txt(S.points ? 'TO THE GEARS' : 'POINTS', px + 8, R(G.laneY[1] - 22 - cy), pc, 'left', 5);
    if (S.points) for (const l of [1, 2]) { g.fillStyle = 'rgba(255,211,107,0.5)'; g.fillRect(px - 8, R(G.laneY[l] - cy) - 1, 16, 2); }
    /* THE ORE CARTS */
    for (const o of S.ores) { const x = R(o.x - cx), y = R(o.y - cy); MCA.tub(g, x, y, 'ore', time, 0); if (onS(x)) txt('ORE', x, y - 24, '#ffd36b', 'center', 5); }
  };
  /* THE MACHINE: its body behind its front, the bit on its line, the gears on the LOW line, the cab and its goblin */
  H.drawBoss = (g, e, cx, cy, time) => { if (!S) return; const G = S.G, D = R(S.D - cx), top = R(G.ceilY + 6 - cy), bot = R(G.floor - cy), jam = GD.drillOpen(e), warded = S.ward > 0;
    const gy = R(G.laneY[0] - 10 - cy), by = R(G.laneY[S.bitLane] - 8 - cy), cb = GD.cabBox(G, S);
    MCA.drill(g, D, top, bot, gy, by, R(S.bitLen), { x: R(cb.l - cx), t: R(cb.t - cy), w: R(cb.r - cb.l), h: R(cb.b - cb.t) }, jam, warded, (e.hurtT || 0) > 0 || (e.flash || 0) > 0, time, S.bitLane);
    if (D - 27 > -40 && D - 27 < ctx.VW() + 40) txt('GEARS', D - 27, gy + 25, jam ? '#ffd36b' : '#ff6b6b', 'center', 5);
  };
  /* OVER EVERYTHING: the tells (the bore's line, the grind, the roof's shadows, full bore) and THE READ */
  H.drawOver = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar || !ctx.bossActive) return; const e = ctx.boss; if (!e || e.t !== 'greatdrill') return; const G = S.G, blink = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0';
    if (e.mode === 'boreTell') { const y = R(G.laneY[S.bitLane] - cy); g.fillStyle = 'rgba(255,90,70,' + (0.25 + 0.2 * Math.sin(time * 20)).toFixed(2) + ')'; g.fillRect(R(S.D - cx), y - 18, R(DRILL.boreLen + 10), 18);
      txt('!! BORE: ' + GD.LANE_NAME[S.bitLane], R(S.D + 70 - cx), y - 24, blink, 'center', 6); }
    if (e.mode === 'grindTell' || e.mode === 'fullTell') { txt(e.mode === 'grindTell' ? '!! GRIND' : '!! FULL BORE', R(S.D + 50 - cx), R(G.laneY[2] - 50 - cy), blink, 'center', 7); g.fillStyle = 'rgba(255,60,30,0.25)'; g.fillRect(R(S.D - cx), R(G.ceilY - cy), 40, G.floor - G.ceilY); }
    for (const r of S.roof) if (r.t > 0) { const x = R(r.x - cx), y = R(G.laneY[r.lane] - cy), k = 1 - r.t / DRILL.roofTell; g.fillStyle = 'rgba(0,0,0,' + (0.3 + 0.4 * k).toFixed(2) + ')'; g.fillRect(x - DRILL.roofW / 2, y - 2, DRILL.roofW, 3);
      g.fillStyle = '#4a3a2c'; g.fillRect(x - 8, R(y - 44 + 40 * k * k), 16, 10); txt('!', x, y - 50, '#ffd36b', 'center', 6); }
    const cb = GD.cabBox(G, S), mx = R((cb.l + cb.r) / 2 - cx), my = R((cb.t + cb.b) / 2 - cy);
    if (GD.drillOpen(e)) { const k = Math.max(0, e.open / (e.openT0 || DRILL.jamT)); g.globalAlpha = 0.6 + 0.3 * Math.sin(time * 10); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.arc(mx, my, 26, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      const byy = my - 40; txt('JAMMED: OPEN', mx, byy - 6, '#ffd36b', 'center', 6); g.fillStyle = '#1b1626'; g.fillRect(mx - 18, byy, 36, 3); g.fillStyle = '#ffd36b'; g.fillRect(mx - 18, byy, R(36 * k), 3); }
    if (S.ward > 0) txt('WARDED', mx, my - 40, '#c8d8e8', 'center', 5);
    if (e.guardFx > 0 && e.guardWord) { e.guardFx = Math.max(0, e.guardFx - 1 / 60); txt(e.guardWord, mx, my - 52 - R((0.3 - e.guardFx) * 30), Math.floor(time * 12) % 2 ? '#ffffff' : '#c8d8e8', 'center', 6); }
  };
  return H;
}
