// src/great-drill-hands.js - THE GREAT DRILL's HANDS (claude/minecart, the OPUS GREYBOX; GREAT DRILL 2, claude/deeprails2). src/great-drill.js is the fight (pure: its
// phases, its moves, the ore carts, the bot's reading); this binds it to the world: its told blows on the heroes, THE ENDLESS TUNNEL (src/minecart-hands.js drive asks
// tread(P): while it fights, the tunnel runs past at the cart's cruise - the hands draw ALL of it, wall to wall and edge to edge, on one seamless loop, so nothing on the
// screen half-moves), an ore cart into a hero's cart, a hero's cart shoved back by its rear, and the drawing (the rig and its goblin driver, src/redraw/minecart_art.js).
// THE SHARED READ (B10): OPEN (JAMMED) = a gold outline on the cab and the gears and a timer bar over the cab; ARMOURED / PLATES UP = the word on a turned blow, a clank.
// main.js calls: spawnBoss, owns, on, update, take, tread, drawBack, drawWorld, drawBoss, drawOver, barName, end, read, show, clear, phase; (deeprails4) takeGear - its GEAR
// BANKS are foes of their own ('drillgear', like the kraken's arms: every hero's blow, shot and skill finds them), placed up its rear face each frame (src/great-drill.js GEARS).
import * as GD from './great-drill.js';
import { MC } from './minecart.js';
import * as MCA from './redraw/minecart_art.js';
import { BOSS_PHASE } from './boss-music.js';
const { DRILL } = GD;

const SOUND = { tell: s => s.tell && s.tell(false), tellHard: s => s.tell && s.tell(true), klaxon: s => { s.tell && s.tell(true); s.clank && s.clank(); }, reverse: s => (s.rumble || s.heavy)(),
  sparks: s => (s.screech || s.zap || s.heavy)(), jam: s => { (s.clank || s.heavy)(); s.crack && s.crack(); }, ward: s => (s.clank || s.thud)(), phase: s => (s.roar || s.heavy)(),
  chute: s => (s.rattle ? s.rattle(1) : s.clank && s.clank()), oreLand: s => (s.thud || s.heavy)(), ram: s => { (s.heavy || s.thud)(); s.clank && s.clank(); }, eat: s => (s.crack || s.heavy)(), rock: s => (s.rubble || s.thud || s.heavy)(),
  /* (deeprails3) GREAT DRILL 3 */ points: s => { (s.leverClunk || s.clank)(); s.stone && s.stone(); }, boom: s => (s.boom || s.heavy)(), lunge: s => { (s.drillLunge || s.screech || s.heavy)(); s.heavy && s.heavy(); }, whine: s => { s.tell && s.tell(true); (s.drillWhine || s.charge || s.screech || s.zap || (() => {}))(); },
  /* (deeprails4) */ gearBreak: s => { (s.crack || s.heavy)(); s.clank && s.clank(); s.rubble && s.rubble(); },
  chain: s => (s.chainRattle ? s.chainRattle() : s.rattle ? s.rattle(1) : s.clank && s.clank()), throw: s => { s.throwWhoosh && s.throwWhoosh(); s.fuseFizz && s.fuseFizz(); }, rumble: s => { s.tell && s.tell(true); (s.rumble || s.thud || s.heavy)(); }, clank: s => s.clank && s.clank() };
BOSS_PHASE.greatdrill = BOSS_PHASE.greatdrill || 1;

export function makeDrillHands(ctx) {
  const txt = (s, x, ...a) => { if (!(x > -48 && x < ctx.VW() + 48)) return; ctx.text(s, x, ...a); };
  let S = null;
  const H = {};
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'greatdrill' ? ctx.L.arena : null);
  const R = Math.round;
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => e.t === 'greatdrill' || e.t === 'drillgear';   /* (deeprails4: and its gear banks - moved and drawn here) */
  /* THE HIGH LINE (P3 brings the roof down on it): its rail laid or taken up - laid again whenever the fight is made or ends */
  const highLine = on => { const Ar = A(); if (!Ar || !ctx.cellSet || !ctx.T) return; const q = Ar.drill; for (let x = q.sx; x < q.sx + GD.DRILL_STAGE.W; x++) ctx.cellSet(x, q.F - GD.DRILL_STAGE.lanes[2], on ? ctx.T.RAIL : ctx.T.AIR); };
  const dropGears = () => { if (S && S.gearEnts) for (const ge of S.gearEnts) ge.alive = false; };
  H.clear = () => { if (S && S.highDown) highLine(true); dropGears(); S = null; BOSS_PHASE.greatdrill = 1; };
  H.phase = () => (S && ctx.bossActive && ctx.boss && ctx.boss.t === 'greatdrill' && ctx.boss.alive ? S.ph : 0);
  const fighting = () => { const e = ctx.boss; return !!(S && A() && ctx.bossActive && e && e.t === 'greatdrill' && e.alive && e.mode !== 'sleep'); };
  /* THE TUNNEL: while it fights the world runs past at the cart's cruise (the arena stands still); a hero cannot ride into the rig (its rear on his line is his limit) */
  H.tread = pp => { if (!fighting()) return null; const lane = pp ? (pp.ground ? GD.laneOf(S.G, pp.y) : GD.laneUnder(S.G, pp.y)) : 0; return { cruise: DRILL.cruise, x0: S.G.x0, x1: S.G.x1, limit: GD.frontFor(S.G, S, lane < 0 ? 0 : lane) - 8, drag: S.snag && S.snag.pp === pp ? DRILL.chainPull : 0 }; };   /* (deeprails3: snagged on its chain, the cart is dragged at its rear) */
  const keyed = (pp, key) => { pp.gdKeys = pp.gdKeys || new Map(); if (pp.gdKeys.size > 160) pp.gdKeys.clear(); if (pp.gdKeys.has(key)) return true; pp.gdKeys.set(key, 1); return false; };
  const hurt = (name, fn) => { const P = ctx.hero(), h0 = P.hp; fn(); if (S) { S.hurt = S.hurt || {}; S.hurt[name] = (S.hurt[name] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); } };

  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null;
    highLine(true); dropGears(); for (const q of ctx.enemies()) if (q.t === 'drillgear') q.alive = false; S = GD.newFight(GD.geom(Ar, ctx.TS)); S.R = DRILL.maxR + 80; BOSS_PHASE.greatdrill = 1;
    const e = { ...base, t: 'greatdrill', w: DRILL.cabW, h: DRILL.cabH, hp: ctx.EHP.greatdrill, maxHp: ctx.EHP.greatdrill, noGrav: true, face: -1, mode: 'sleep', modeT: 0, open: 0, phase: 1, boss: true };
    const cb = GD.cabBox(S.G, S); e.x = (cb.l + cb.r) / 2; e.y = cb.b; for (const pp of ctx.players) pp.gdKeys = null; return e; };

  const heroes = () => ctx.players.map(pp => { const c = ctx.cartOf ? ctx.cartOf(pp) : null; return { x: pp.x, y: pp.y, vx: pp.vx, ground: !!pp.ground, alive: ctx.upright(pp) && !pp.dead, lane: pp.ground ? GD.laneOf(S.G, pp.y) : -1, v: c ? c.v : 0, pp }; });
  const throwIt = () => GD.throwLever(S, world(ctx.boss));   /* (deeprails3) THE CHUTE'S POINTS LEVER: a blow on it, or E beside it */
  function world(e) {
    return {
      ramV: MC.ramV,
      arena: k => { if (k === 'highDown') { highLine(false); ctx.shake(7); const G = S.G; for (let x = G.x0 + 20; x < G.x1; x += 24) ctx.burst(x, G.laneY[2], 6, ['#6b5a48', '#8a7660', '#2a2119'], 90, 0.7); } },
      number: (x, y, t, col) => ctx.number(x, y, t, col), sound: k => { const f = SOUND[k]; if (f) try { f(ctx.sfx); } catch {} }, shake: n => ctx.shake(n),
      music: ph => { BOSS_PHASE.greatdrill = ph; if (ctx.music) ctx.music('greatdrill');   /* (the file plays through all three phases: the synth's ':p2' / ':p3' voicings are not played) */ },
      hit: (bx, d, name, o = {}) => { let any = false; for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
          if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P)) || (o.duck !== undefined && ctx.duckClears && ctx.duckClears(P, o.duck)) || keyed(pp, o.key || name)) return;   /* (deeprails3: a ducked tub is under the lunge) */
          const hp0 = P.hp; hurt(name, () => ctx.damagePlayer(bx[0], d, { who: e, name, unblockable: !o.blockable, noKnock: true })); if (P.hp < hp0) any = true; }); return any; },
      crash: (h, o) => ctx.asPlayer(h.pp, () => { const P = ctx.hero(); hurt('AN ORE CART', () => ctx.damagePlayer(o.x, DRILL.oreDmg, { who: e, name: 'AN ORE CART', unblockable: true, noKnock: true })); const c = ctx.cartOf(P); if (c) { c.v = Math.min(c.v, MC.cruise); c.bounce = 40; }
        ctx.burst(o.x, o.y - 8, 12, ['#5a6270', '#d89a5a', '#ffd36b'], 80, 0.5); ctx.number(o.x, o.y - 30, 'TOO SLOW: PUMP TO RAM IT', '#ff9a5c'); }),
      rammed: (h, o) => { ctx.burst(o.x, o.y - 10, 14, ['#ffd36b', '#d89a5a', '#ffffff'], 110, 0.4); const c = ctx.cartOf(h.pp); if (c) c.v = Math.max(MC.cruise, c.v - 40); },
      shove: (h, px) => { const c = ctx.cartOf(h.pp); if (c) { c.bounce = Math.sqrt(2 * 700 * px); c.v = MC.cruise; } },
      snag: h => { ctx.shake(3); ctx.burst(h.x, h.y - 10, 8, ['#8a919c', '#c8d8e8'], 70, 0.4); },
    };
  }
  H.update = (e, dt) => {
    if (!S || !e.alive) return; const Ar = A(); if (!Ar) return;
    if (e.mode === 'wake' && !S.woke) { S.woke = true; ctx.number(S.G.x0 + 140, S.G.laneY[2] - 40, 'THE GREAT DRILL BORES ON AHEAD: CHASE IT', '#ffd36b'); ctx.shake(8); }
    if (e.mode === 'wake') S.R = Math.max(DRILL.homeR, S.R - 120 * dt);
    GD.stepDrill(e, S, dt, heroes(), world(e));
    /* (deeprails3) THE CHAIN lets go: a jump off the line, or a blow on it; THE POINTS LEVER thrown by a blow that lands on its post */
    if (S.snag) { const pp = S.snag.pp; ctx.asPlayer(pp, () => { const P = ctx.hero(); if (P.vy < -60 && !P.ground) { GD.freeSnag(S, 'jump'); ctx.number(P.x, P.y - 34, 'OFF THE LINE: THE HOOK SLIPS', '#8fd160'); } else if (ctx.attackBox && ctx.attackBox()) { GD.freeSnag(S, 'cut'); ctx.sfx.clank && ctx.sfx.clank(); ctx.sparks(P.x + 10, P.y - 10, 1, 6); ctx.number(P.x, P.y - 34, 'CHAIN CUT', '#8fd160'); } }); }
    if (S.lever && !S.lever.thrown && ctx.attackBox) for (const pp of ctx.players) ctx.asPlayer(pp, () => { const hb = ctx.attackBox(); if (hb && ctx.overlap(hb, GD.leverBox(S.G, S.lever))) throwIt(); });
    syncGears(e); e.phase = S.ph; S.scroll = (S.scroll || 0) + (fighting() ? DRILL.cruise * dt : 0);
    if (!S.told.cab && e.mode === 'idle' && S.t > 3) { S.told.cab = 1; ctx.number(GD.rearX(S) - 20, S.G.laneY[2] - 44, 'ITS CAB IS ARMOURED: JAM ITS GEARS', '#ffd36b'); }
  };
  /* (deeprails4) THE GEAR BANKS: one foe each, up its rear face while it is in the phase and whole; hidden under the floor otherwise (never dead until the fight ends) */
  function syncGears(e) { if (!S) return; if (!S.gearEnts) { S.gearEnts = GD.GEARS.map(g => ({ t: 'drillgear', gid: g.id, x: S.G.x0, y: S.G.floor - 900, w: 2, h: 2, vx: 0, vy: 0, face: -1, alive: true, dying: 0, anim: 0, flash: 0, stagger: 0,
      hp: DRILL.gearHp, maxHp: DRILL.gearHp, noGrav: true, part: true, parent: e })); const list = ctx.enemies(); for (const ge of S.gearEnts) list.push(ge); }
    const up = fighting() && e.mode !== 'phase';
    for (const ge of S.gearEnts) { const g = GD.GEARS.find(k => k.id === ge.gid), q = S.gears && S.gears[g.id]; ge.alive = e.alive;
      if (up && q && !q.broken) { const b = GD.gearBoxOf(S.G, S, g); ge.x = (b.l + b.r) / 2; ge.y = b.b; ge.w = b.r - b.l; ge.h = b.b - b.t; ge.hp = q.hp; ge.maxHp = q.max; }
      else { ge.x = S.G.x0; ge.y = S.G.floor - 900; ge.w = 2; ge.h = 2; } } }
  /* A BLOW ON A GEAR BANK (src/main.js hurtEnemy0 hands it here): whole; broken, its attack is gone for the phase, the rig stalls, a shut gate may open (the held blows land) */
  H.takeGear = (ge, dmg) => { const e = ctx.boss; if (!S || !e || !fighting()) { ctx.sfx.clank && ctx.sfx.clank(); return; }
    const out = {}, g = GD.GEARS.find(k => k.id === ge.gid), d = GD.hitGear(e, S, ge.gid, dmg, world(e), out), b = GD.gearBoxOf(S.G, S, g), mx = (b.l + b.r) / 2, my = (b.t + b.b) / 2;
    if (d > 0) { ctx.number(mx - 10, b.t - 4, Math.round(d), '#fff6e0'); ctx.sparks(mx - 6, my, -1, 5); ctx.sfx.clank && ctx.sfx.clank(); ge.flash = 0.12; ge.hp = S.gears[g.id].hp; }
    else if (out.word) { ctx.sfx.clank && ctx.sfx.clank(); ctx.number(mx - 10, b.t - 6, out.word, '#9aa39a'); }
    if (out.broke) { ctx.burst(mx, my, 22, ['#ffd36b', '#ff9a3c', '#8a919c', '#ffffff'], 140, 0.7); ctx.shake(5); }
    if (out.release && ctx.hurtBoss) ctx.hurtBoss(e, out.release); };
  /* A BLOW ON THE CAB */
  H.take = (e, dmg) => { if (!S) return dmg; const o = {}; const d = GD.takeBlow(e, S, dmg, o);
    if (o.word) { e.guardFx = 0.45; e.guardWord = o.word; }
    if (!GD.drillOpen(e)) { e.chipHit = ctx.time(); ctx.sfx.clank && ctx.sfx.clank(); ctx.sparks(GD.cabBox(S.G, S).l, S.G.laneY[1] - 20, 1, 4); }
    return d; };
  H.gate = (e, d) => { if (!S || e.t !== 'greatdrill') return d; const o = {}, k = GD.gateBlow(e, S, d, o); if (o.word) { e.guardFx = 0.45; e.guardWord = o.word; ctx.sfx.clank && ctx.sfx.clank(); } return k; };   /* (deeprails4) the gate, on what lands */
  H.interact = P => { if (!S || !fighting() || !S.lever || S.lever.thrown) return false; if (Math.abs(P.x - S.lever.x) > DRILL.leverReach) return false; return throwIt(); };   /* (GREAT DRILL 3: E at its chute's points lever - the opening) */
  H.barName = e => 'THE GREAT DRILL' + (e.mode === 'jammed' ? (S && S.openKind === 'gear' ? '  STALLED' : '  JAMMED') : S && S.ward > 0 ? '  PLATES UP' : '') + (S && S.gears && GD.gateShut(S) ? '  GEARS ' + GD.brokenN(S) + '/' + GD.gearsNeed(S.ph) : '');   /* (deeprails4) the gate: the gears it still wants broken */
  H.end = e => { dropGears(); if (S) { S.ores = []; S.rocks = []; S.chute = null; S.dyn = []; S.spots = []; S.lunge = null; S.hook = null; S.snag = null; S.lever = null; if (S.highDown) { S.highDown = false; highLine(true); } } BOSS_PHASE.greatdrill = 1; if (ctx.L) ctx.L.mcDrillDown = true; };
  H.read = () => S && { mode: ctx.boss && ctx.boss.mode, ph: S.ph, R: R(S.R), rear: R(GD.rearX(S)), ores: S.ores.map(o => ({ x: R(o.x), fly: o.fly })), chute: !!S.chute, rocks: S.rocks.length, lever: S.lever ? { x: R(S.lever.x), thrown: S.lever.thrown } : null, dyn: S.dyn.length, spots: S.spots.length, lunge: S.lunge ? S.lunge.lane : -1, hook: S.hook ? S.hook.lane : -1, snag: !!S.snag, ward: S.ward, n: { ...S.n }, hurt: { ...(S.hurt || {}) }, gears: Object.fromEntries(Object.entries(S.gears || {}).map(([k, q]) => [k, { hp: R(q.hp), broken: q.broken }])), gate: GD.gateShut(S), held: R(S.held), open: S.openKind };

  /* ---------- DRAWING ---------- */
  /* THE TUNNEL: drawn in the world layer OVER the arena's own tiles (the static floor and rails must not show: that was the half-moving scenery), and while it fights
     over the WHOLE screen - one seamless loop of wall, ribs, lamps, floor, rails and roof, every layer running past at the same pace (the far rock at half) */
  const inArena = () => { const Ar = A(), P = ctx.hero(); return !!(Ar && P && P.x > Ar.x0 - 220 && P.x < Ar.x1 + 60); };
  H.drawBack = () => {};
  H.drawWorld = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar) return; const G = S.G, fight = fighting(), vw = ctx.VW(), vh = ctx.VH();
    if (fight || inArena()) { const x0 = fight ? 0 : R(G.x0 - cx), x1 = fight ? vw : R(G.x1 - cx);
      MCA.tunnel(g, x0, x1, R(G.ceilY - cy), R(G.floor - cy), vh, S.scroll || 0, G.laneY.map(v => R(v - cy)), !!S.highDown, time);
      if (S.ph === 3) for (let i = 0; i < 7; i++) { const W2 = vw + 80, gx = (((i * 97 + 300 - (S.scroll || 0)) % W2) + W2) % W2 - 40; MCA.gouge(g, gx, Math.max(2, R(G.ceilY - cy)) + 2 + (i % 3) * 2, 8 + (i % 3) * 3); } }   /* (dr3art) P3: the roof gouged where it tore at the rock */
    /* the chute (its tell: it rattles and its shadow is on the LOW line) */
    if (S.chute) { const x = R(GD.rearX(S) - cx), y = R(G.laneY[0] - cy), k = 1 - S.chute.t / DRILL.chuteTell, sh = Math.floor(time * 24) % 2;   /* ITS ORE CART on its back deck, rattling - then kicked off onto the LOW line */
      MCA.tub(g, x - 12 + sh, R(G.laneY[1] - cy) - 1, 'ore', time, 0); g.fillStyle = 'rgba(0,0,0,' + (0.3 + 0.4 * k).toFixed(2) + ')'; g.fillRect(x - 30, y - 2, 24, 3); txt('ORE!', x - 14, R(G.laneY[1] - cy) - 26, Math.floor(time * 12) % 2 ? '#ffd36b' : '#ff9a5c', 'center', 6); }
    /* THE ORE CARTS (rammed, one flies up the line trailing sparks) */
    for (const o of S.ores) { const x = R(o.x - cx), y = R(o.y + o.dy - cy); MCA.tub(g, x, y, 'ore', time, o.fly ? 300 : 150); if (o.fly) { for (let i = 1; i < 4; i++) { g.fillStyle = i & 1 ? '#ffd36b' : '#ff9a3c'; g.fillRect(x - 12 - i * 6, y - 4 - (i % 2), 3, 1); } }
      else txt('RAM IT', x, y - 26, '#ffd36b', 'center', 5); }
    /* THE BOULDERS' SHADOWS sliding at you, the rock coming down on them */
    for (const r of S.rocks) { if (r.t <= 0) continue; const x = R(r.x - cx), y = R(G.laneY[r.lane] - cy), k = 1 - r.t / DRILL.rockTell; g.fillStyle = 'rgba(0,0,0,' + (0.3 + 0.45 * k).toFixed(2) + ')'; g.fillRect(x - DRILL.rockW / 2, y - 2, DRILL.rockW, 3);
      MCA.boulder(g, x - DRILL.rockW / 2, DRILL.rockW, y, k, time); txt('!', x, y - 50, '#ffd36b', 'center', 6); }
    /* (deeprails3) THE CHUTE'S POINTS LEVER coming down the tunnel (a tall trackside post: its disc and the word on it), the DYNAMITE (in its throw, then fizzing on its
       line), THE ROOF's told spots (dust and shadows over every line) */
    if (S.lever && !S.lever.gone) { const lv = S.lever, x = R(lv.x - cx); MCA.pointsPost(g, x, R(G.laneY[2] - 34 - cy), R(G.laneY[0] - cy), lv.thrown, time); if (!lv.thrown) { const k = 0.5 + 0.5 * Math.sin(time * 10); g.strokeStyle = 'rgba(255,211,107,' + (0.5 + 0.5 * k).toFixed(2) + ')'; g.lineWidth = 2; g.beginPath(); g.arc(x, R(G.laneY[2] - 38 - cy), 10 + 3 * k, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; txt('THROW IT', x, R(G.laneY[2] - 58 - cy), Math.floor(time * 8) % 2 ? '#ffd36b' : '#ffffff', 'center', 6); } }
    for (const d of S.dynPend || []) { const k = 1 - Math.max(0, S.mT || 0) / DRILL.dynTell, x = R(d.x0 + (d.x - DRILL.cruise * DRILL.dynTell * k - d.x0) * k - cx), y = R(G.laneY[d.lane] - Math.sin(k * Math.PI) * 50 - cy); MCA.dynamite(g, x, y - 5, time, k * 9); }
    for (const d of S.dyn) { if (d.t <= 0) continue; const x = R(d.x - cx), y = R(G.laneY[d.lane] - cy), k = 1 - d.t / DRILL.dynFuse; MCA.lobMark(g, x, y, DRILL.dynR, k, time); MCA.dynamite(g, x, y - 5, time, 0.1 * Math.sin(time * 30)); }
    for (const sp of S.spots) { if (sp.t <= 0) continue; const x = R(sp.x - cx), k = 1 - sp.t / DRILL.collapseTell; for (const ly of GD.lanesOf(S).map(l => G.laneY[l])) { g.fillStyle = 'rgba(0,0,0,' + (0.25 + 0.45 * k).toFixed(2) + ')'; g.fillRect(x - DRILL.collapseW / 2, R(ly - cy) - 2, DRILL.collapseW, 3); }
      g.fillStyle = '#8a7660'; for (let i = 0; i < 5; i++) g.fillRect(x - 12 + ((i * 7 + R(time * 40)) % 24), R(G.ceilY - cy) + ((i * 19 + R(time * 90)) % 70), 2, 2); for (const l of GD.lanesOf(S)) MCA.boulder(g, x - DRILL.collapseW / 2, DRILL.collapseW, R(G.laneY[l] - cy), k, time); txt('!', x, R(G.ceilY - cy) + 12, '#ff6b6b', 'center', 7); }
    for (const sp of S.spots) { if (sp.t > 0) continue; const x = R(sp.x - cx); for (const ly of GD.lanesOf(S).map(l => G.laneY[l])) MCA.rubble(g, x, R(ly - cy), DRILL.collapseW, Math.min(1, -sp.t / 0.2), time); }   /* (dr3art) the roof, down */
  };
  /* THE RIG: its rear (the gear housing, the gears, the deck and the cab with its goblin), its engine and stack, its tracks, the bit drilling the face ahead */
  /* (deeprails4) ITS POSE: jammed, it SLUMPS (eased in over 0.25 s, lifted over the window's last 0.4 s - the read of 'now'); each gear-driven windup has its own (B16) */
  const poseOf = e => { if (GD.drillOpen(e)) { const k = Math.max(0, Math.min(1, ((e.openT0 || DRILL.jamT) - e.open) / 0.25, e.open / 0.4)); return { tilt: 0.035 * k, drop: 2 * k, slump: k }; }
    if (e.mode === 'dynTell') return { tilt: -0.012, drop: 0 }; if (e.mode === 'lunge' && S.lunge && !S.lunge.on) return { tilt: 0.022 * Math.min(1, 1 - S.lunge.t / DRILL.lungeTell), drop: 1 };
    if (e.mode === 'chain' && S.hook && !S.hook.flying) return { tilt: -0.024, drop: 0 }; if (e.mode === 'rockTell' || e.mode === 'collapseTell') return { tilt: -0.01, drop: -2 + R(Math.sin(ctx.time() * 30)) };
    return { tilt: 0, drop: 0 }; };
  H.drawBoss = (g, e, cx, cy, time) => { if (!S || e.t !== 'greatdrill') return; const G = S.G, rx = R(GD.rearX(S) - cx), jam = GD.drillOpen(e), ward = S.ward > 0, lanes = G.laneY.map(v => R(v - cy)), pose = poseOf(e);
    MCA.rig(g, rx, lanes, R(G.ceilY - cy), { jam, ward, hurt: (e.hurtT || 0) > 0 || (e.flash || 0) > 0, rev: e.mode === 'revTell' || e.mode === 'reverse',
      moving: fighting() && !jam, scroll: S.scroll || 0, spray: null, plateW: DRILL.plateW, plateH: DRILL.plateH, cabIn: DRILL.cabIn, cabW: DRILL.cabW, cabH: DRILL.cabH, stackX: DRILL.stackX, ph: S.ph, tilt: pose.tilt, drop: pose.drop, slump: pose.slump || 0 }, time);
    if (pose.slump) MCA.jamFx(g, pose.slump, rx + 174, R((lanes[1] + lanes[0]) / 2 - 6 + 6 * pose.slump), rx + 23, lanes[0] - DRILL.plateH / 2 - 5, rx + DRILL.cabIn + R(DRILL.cabW / 2), lanes[1] - DRILL.cabH + 8, time);   /* (deeprails4) the head smokes, sparks, the driver knocked silly */
    /* (deeprails4) THE GEAR TOWER up its rear face: each bank, its label, its state (spinning / spun up on its attack's windup / broken and smoking / shuttered) */
    if (S.gears && rx > -60 && rx < ctx.VW() + 60) { const banks = GD.GEARS.map(gg => { const q = S.gears[gg.id], t = R(G.laneY[gg.lane] + gg.t - cy), b = R(G.laneY[gg.lane] + gg.b - cy);
        return { id: gg.id, t, b, state: !q ? 'off' : q.broken ? 'broken' : 'up', hot: q && q.hot > 0 ? Math.min(1, q.hot / 0.6) : 0, k: q ? q.hp / q.max : 0, flash: q ? q.flash : 0, smoke: q ? q.smoke : 0 }; });
      MCA.gearTower(g, rx, lanes[2] - 38, lanes[0] - 4, banks, time);
      for (const b of banks) if (b.state !== 'off') { const gg = GD.GEARS.find(k => k.id === b.id), lab = { chain: 'CHAIN', lunge: 'LUNGE', dyn: 'DYNAMITE', roof: 'ROOF' }[b.id];
        txt(lab, rx - 12, R((b.t + b.b) / 2) - 2, b.state === 'broken' ? '#6a6a6a' : b.hot > 0 ? '#ffd36b' : '#ff8a6a', 'right', 5); if (gg.jump || (gg.lane === 2 && S.highDown)) txt('JUMP', rx - 12, R((b.t + b.b) / 2) + 5, '#c8d8e8', 'right', 4); } }
    if (jam) MCA.oreDump(g, rx + 23, lanes[0] - DRILL.plateH - 14, lanes[0] - DRILL.plateH / 2 - 5, time);   /* (dr3art) its own ore pouring into its bare gears */
    if ((S.dynPend || []).length) MCA.driverArm(g, rx + DRILL.cabIn + R(DRILL.cabW / 2), lanes[1] - DRILL.cabH + 14, 1 - Math.max(0, S.mT || 0) / DRILL.dynTell, time);   /* the dynamite throw */
  };
  /* OVER EVERYTHING: the tells (the reverse, the sparks' cone) and THE READ (the jam's outline and timer, the words) */
  H.drawOver = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar || !ctx.bossActive) return; const e = ctx.boss; if (!e || e.t !== 'greatdrill') return; const G = S.G, rx = R(GD.rearX(S) - cx), blink = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0';
    if (e.mode === 'revTell') { const k = 1 - Math.max(0, S.mT || 0) / DRILL.revTell, sw = R(DRILL.revV * DRILL.revT); g.fillStyle = 'rgba(255,90,70,' + (0.12 + 0.18 * k).toFixed(2) + ')'; g.fillRect(rx - sw, R(G.laneY[0] - cy) - DRILL.plateH, sw, DRILL.plateH);
      g.fillStyle = 'rgba(255,90,70,' + (0.08 + 0.12 * k).toFixed(2) + ')'; g.fillRect(rx + DRILL.cabIn - sw, R(G.laneY[1] - DRILL.cabH - cy), sw, DRILL.cabH); if (!S.highDown) { g.fillStyle = 'rgba(255,90,70,' + (0.06 + 0.08 * k).toFixed(2) + ')'; g.fillRect(rx + DRILL.stackX - sw, R(G.laneY[2] - 40 - cy), sw, 40); }
      txt('!! REVERSE', rx - 50, R(G.laneY[2] - 34 - cy), blink, 'center', 7); }
    /* (deeprails3) THE SPIN-UP LUNGE: its told red line at head height down your line, then the spinning head along it; THE HOOK swinging, flying, and the chain on you */
    if (S.lunge) { const y = R(G.laneY[S.lunge.lane] - DRILL.lungeHead - cy); if (!S.lunge.on) { const k = 1 - S.lunge.t / DRILL.lungeTell; g.fillStyle = 'rgba(255,70,60,' + (0.15 + 0.35 * k).toFixed(2) + ')'; g.fillRect(0, y - 3, rx, 6); for (let i = 0; i < 4; i++) { g.fillStyle = i & 1 ? '#ffd36b' : '#ff9a3c'; g.fillRect(rx - 6 + ((i * 5 + R(time * 60)) % 12), y - 6 + ((i * 3) % 9), 2, 1); } MCA.cutter(g, rx, y, 14 + R(34 * k), false, k, time); txt('!! DUCK', rx - 60, y - 14, blink, 'center', 7); }
      else { MCA.cutter(g, rx, y, Math.max(20, rx - 12), true, 1, time); for (let x = (R(time * 400) % 12); x < rx; x += 12) { g.fillStyle = '#ffd36b'; g.fillRect(x, y - 4, 2, 8); } } }
    if (S.hook) { const y = R(G.laneY[S.hook.lane] - 12 - cy); if (!S.hook.flying) { const a = time * 9; MCA.chainHook(g, rx - 2, y - 10, rx - 12 + R(Math.cos(a) * 8), y - 8 + R(Math.sin(a) * 8), time, false); txt('!! HOOK', rx - 50, y - 26, blink, 'center', 7); g.fillStyle = 'rgba(255,90,70,0.25)'; for (let x = 0; x < rx; x += 10) g.fillRect(x, y + 10, 5, 1); }
      else { const k = 1 - S.hook.t / DRILL.chainFly, hx = R(rx - (rx - 20) * k); MCA.chainHook(g, rx - 2, y - 10, hx, y, time, true); } }
    if (S.snag) { const P = S.snag.pp; MCA.chainHook(g, rx - 2, R(G.laneY[S.snag.lane] - 22 - cy), R(P.x - cx), R(P.y - 8 - cy), time, true); txt('JUMP OR STRIKE', R(P.x - cx), R(P.y - 40 - cy), blink, 'center', 6); }
    const cb = GD.cabBox(G, S), cl = R(cb.l - cx), ct = R(cb.t - cy), cw = R(cb.r - cb.l), ch = R(cb.b - cb.t), mx = cl + R(cw / 2);
    if (GD.drillOpen(e)) { const k = Math.max(0, e.open / (e.openT0 || DRILL.jamT)), on = 0.6 + 0.4 * Math.sin(time * 10); g.globalAlpha = on; g.strokeStyle = '#ffd36b'; g.lineWidth = 2;
      g.strokeRect(cl - 2, ct - 2, cw + 4, ch + 4); const gb = GD.gearBox(G, S); g.strokeRect(R(gb.l - cx) - 2, R(gb.t - cy) - 2, R(gb.r - gb.l) + 4, R(gb.b - gb.t) + 4); g.lineWidth = 1; g.globalAlpha = 1;   /* B10: OPEN - the gold outline on the cab and the jammed gears */
      const byy = ct - 12; txt('JAMMED: STRIKE THE CAB', mx, byy - 6, '#ffd36b', 'center', 6); g.fillStyle = '#1b1626'; g.fillRect(mx - 18, byy, 36, 3); g.fillStyle = '#ffd36b'; g.fillRect(mx - 18, byy, R(36 * k), 3); }
    if (S.ward > 0) txt('PLATES UP', mx, ct - 10, '#c8d8e8', 'center', 5);
    if (S.gears && GD.gateShut(S) && e.hp <= GD.gateFloor(S, e) + 1 && e.mode !== 'phase') txt('ITS GEARS HOLD IT: BREAK ' + (GD.gearsNeed(S.ph) - GD.brokenN(S)) + ' MORE', mx - 30, ct - 30, Math.floor(time * 4) % 2 ? '#ffd36b' : '#ff8a6a', 'center', 6);   /* (deeprails4) the gate, shut */
    if (e.guardFx > 0 && e.guardWord) { e.guardFx = Math.max(0, e.guardFx - 1 / 60); txt(e.guardWord, mx, ct - 22 - R((0.45 - e.guardFx) * 30), Math.floor(time * 12) % 2 ? '#ffffff' : '#c8d8e8', 'center', 6); }
  };
  return H;
}
