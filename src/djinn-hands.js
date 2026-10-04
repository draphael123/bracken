// src/djinn-hands.js - THE DJINN OF THE GREAT WELL's HANDS (claude/welltown5). src/djinn.js is the fight (pure: his three phases, his cycles, his
// openings, the bot's reading); this binds it to the world: his told blows on the heroes (keyed once a blow, a shield turns only the yellow ones, a duck
// goes under the high ones), his fire on the heroes (alight: a tick at a time until it burns out or the skin puts it out), the spout's hold (the game's
// own P.snare: strike out of it), the flood, the pour (src/well-town-hands.js asks pourables()), the windlass and the crank and the shaft's great bucket,
// and the drawing (src/redraw/djinn_art.js draws him; this draws the hall's machines and his tells).
// main.js calls: spawnBoss, owns, update, take, pourable, drawBoss, drawBack, drawOver, barName, end, read, show, clear, onLedge. Every teaching line goes
// through ctx.number with a line listed in src/hint-lines.js.
import * as DJG from './djinn.js';
import * as DJA from './redraw/djinn_art.js';
import * as CQA from './redraw/cistern_queen_art.js';
const { DJ } = DJG;

const SOUND = { tell: s => s.tell && s.tell(false), tellHard: s => s.tell && s.tell(true), lash: s => (s.slash || s.heavy)(), blast: s => (s.rubble || s.thud)(), devil: s => (s.whoosh || s.throwWhoosh || s.slash)(),
  breath: s => (s.fireWhoosh || s.hiss || s.crack)(), pillar: s => { (s.fireWhoosh || s.crack)(); (s.rubble || s.thud)(); }, flare: s => (s.fireWhoosh || s.hiss || s.crack)(), spout: s => (s.whirlpool || s.splash)(),
  wave: s => (s.wave || s.splash)(), slam: s => (s.heavy || s.thud)(), soak: s => { (s.splash)(); (s.hiss || s.thud)(); }, windlass: s => { (s.clank)(); s.ratchet && s.ratchet(); }, splash: s => (s.whirlpool || s.splash)(),
  flood: s => { (s.whirlpool || s.splash)(); (s.roar || s.heavy)(); },
  ward: s => { (s.chime || s.golemChime || s.clank)(); (s.whoosh || s.throwWhoosh || s.hiss || s.splash)(); },   /* (claude/djinn2) HIS WARD rises: a ring and a rush */
  seal: s => { (s.rubble || s.thud)(); (s.boreRoar || s.roar || s.heavy)(); } };

export function makeDjinnHands(ctx) {
  let S = null, wls = [];
  const H = {};
  const A = () => (ctx.L && ctx.L.arena && ctx.L.arena.boss === 'djinn' ? ctx.L.arena : null);
  const R = Math.round;
  H.show = () => S;
  H.on = () => !!(S && A());
  H.owns = e => e.t === 'djinn';
  H.clear = () => { S = null; };
  const hurt = (name, fn) => { const P = ctx.hero(), h0 = P.hp; fn(); if (S) { S.hurt = S.hurt || {}; S.hurt[name] = (S.hurt[name] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); } };
  const keyed = (pp, key) => { pp.djKeys = pp.djKeys || new Map(); if (pp.djKeys.size > 80) pp.djKeys.clear(); if (pp.djKeys.has(key)) return true; pp.djKeys.set(key, 1); return false; };
  const onLedgeOf = (pp, G) => { if (!G || !(pp.ground || pp.climb) || pp.y > G.ledgeY + 4 || pp.y < G.ledgeY - 18) return null; if (pp.x >= G.ledgeW[0] && pp.x <= G.ledgeW[1] + 18) return 'W'; if (pp.x >= G.ledgeE[0] - 18 && pp.x <= G.ledgeE[1]) return 'E'; return null; };
  H.onLedge = pp => onLedgeOf(pp, S && S.G);
  const ignite = P => { if (P.dead || P.djBurn > 0) return; P.djBurn = DJ.burnT; P.djBurnTick = DJ.burnTick; if (S) S.n.alight = (S.n.alight || 0) + 1;
    if (S && !S.told.alight) { S.told.alight = 1; ctx.number(P.x, P.y - 30, 'YOU CATCH FIRE: E DOUSES YOU', '#ff9a5c'); } };

  /* ---------- SPAWNING: a fresh attempt is a fresh show (the hall dry, the bucket up, his fire out) ---------- */
  H.spawnBoss = base => { const Ar = A(); if (!Ar) return null;
    S = DJG.newShow(DJG.geom(Ar, ctx.TS)); wls = (ctx.L.ents || []).filter(q => q.t === 'djwindlass').map(q => ({ x: q.x * ctx.TS + 8, y: (q.y + 1) * ctx.TS, crank: !!q.crank }));
    const e = { ...base, t: 'djinn', w: DJ.w, h: DJ.h, hp: ctx.EHP.djinn, maxHp: ctx.EHP.djinn, noGrav: true, markH: DJ.markH, face: -1, mode: 'sleep', modeT: 0, open: 0, phase: 1 };
    e.x = base.x; e.y = S.G.floor; for (const pp of ctx.players) { pp.djKeys = null; pp.djBurn = 0; } return e; };

  const heroes = () => ctx.players.map(pp => ({ x: pp.x, y: pp.y, ground: !!pp.ground, alive: ctx.upright(pp) && !pp.dead, ducking: !!pp.ducking, onLedge: onLedgeOf(pp, S.G), climb: !!pp.climb, pp }));
  function world(e) {
    return {
      number: (x, y, t, col) => ctx.number(x, y, t, col), sound: k => { const f = SOUND[k]; if (f) try { f(ctx.sfx); } catch {} }, shake: n => ctx.shake(n), music: ph => ctx.music && ctx.music(ph === 3 ? 'cisternqueen:p3' : 'cisternqueen:p2'),
      mark: m => ctx.number(e.x, e.y - (S.pose === 'column' ? 150 : DJ.markH), m, m === '!' ? '#ffd36b' : '#ff6b6b'),
      fx: (k, x, y) => {
        if (k === 'mud') ctx.burst(x, y - 30, 18, ['#6e4a2c', '#8a6a3e', '#7ab8e8'], 70, 0.7);
        else if (k === 'steam') { ctx.burst(x, y - 34, 22, ['#e8f4f8', '#c8d0d8', '#9aa39a'], 50, 1.0); try { (ctx.sfx.hiss || ctx.sfx.splash)(); } catch {} }
        else if (k === 'flare') ctx.burst(x, y - 34, 24, ['#ff9a3c', '#ffd36b', '#d84a14'], 90, 0.8);
        else if (k === 'splash') ctx.burst(x, y - 6, 18, ['#7ab8e8', '#e8f4f8', '#3a7ab8'], 90, 0.6);
        else if (k === 'sand') ctx.dust(x, y, 3); },
      hit: (bx, d, name, o = {}) => { for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
        if (o.flood && (pp.climb || onLedgeOf(pp, S.G))) return;
        if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P)) || keyed(pp, o.key || name)) return;
        const hp0 = P.hp; hurt(name, () => ctx.damagePlayer(e.x, d, { who: e, name, unblockable: !o.blockable, noKnock: !!o.noKnock }));
        if (o.flood && !S.told.flood) { S.told.flood = 1; ctx.number(P.x, P.y - 30, 'THE FLOOD COSTS YOU: THE LEDGES ARE DRY', '#7ab8e8'); }
        if (o.ignite && P.hp < hp0) ignite(P); if (o.onHit) o.onHit(); }); },
      band: (kind, [t, b], x0, x1, d, name, key, o = {}) => { for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
        if (P.x < x0 || P.x > x1) return; const hb = kind === 'high' ? ctx.duckBox(P) : ctx.box(P); if (!(hb.b > t && hb.t < b) || keyed(pp, key)) return;
        const hp0 = P.hp; hurt(name, () => ctx.damagePlayer(e.x, d, { who: e, name, unblockable: true })); if (o.ignite && P.hp < hp0) ignite(P); }); },
      grab: (bx, key) => { for (const pp of ctx.players) { if (!ctx.upright(pp) || pp.dead || pp.snare > 0) continue; let got = null;
          ctx.asPlayer(pp, () => { const P = ctx.hero(); if (keyed(pp, key + 'g')) return; if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P))) return;
            if (P.dodge > 0 || P.inv > 0) return;
            P.snare = DJ.snare; P.vx = 0; hurt(DJG.MOVE_NAME.spout, () => ctx.damagePlayer(e.x, DJ.dmg.spout, { who: e, name: DJG.MOVE_NAME.spout, unblockable: true, noKnock: true })); got = { pp }; });
          if (got) return got; } return null; },
      free: h => !(h.pp.snare > 0) || h.pp.dead,
      holdAt: (h, x) => ctx.asPlayer(h.pp, () => { const P = ctx.hero(); P.vx = Math.max(-60, Math.min(60, (x - P.x) * 5)); }),
      release: h => { if (h && h.pp && h.pp.snare > 0) h.pp.snare = 0; },
      water: d => { S.waterShown = d; },
      /* THE WHIRLPOOL (claude/djinn2): whoever stands in the flood (not on a ledge, not up a ladder) is drawn toward the shaft at v px/s - a walk away
         from it still wins, slowly. It only ever draws toward the shaft, across the hall's open floor: never into a wall */
      pull: (x, v, dt) => { for (const pp of ctx.players) { if (!ctx.upright(pp) || pp.dead || pp.climb || onLedgeOf(pp, S.G)) continue; if (!DJG.inFlood(S, { x: pp.x, y: pp.y, onLedge: null, climb: pp.climb })) continue;
        const d = x - pp.x; if (Math.abs(d) < 4) continue; pp.x += Math.sign(d) * Math.min(Math.abs(d), v * dt); pp.djPulled = (pp.djPulled || 0) + 1; } },
    };
  }

  /* ---------- ONE FRAME OF HIM ---------- */
  H.update = (e, dt) => {
    if (!S || !e.alive) return; const Ar = A(); if (!Ar) return;
    /* he rises: the hero came down the old well with water (the courtyard's well is the last before his door, and the checkpoint refills it) */
    /* (claude/djinn2: told, cutscene-lite - THE LAST SEAL on the hall's back wall CRACKS, sand pours down the shaft, and he forms out of it) */
    if (e.mode === 'wake' && !S.woke) { S.woke = true; e.modeT = DJ.wakeT; S.sealT = 0; for (const pp of ctx.players) if (pp.skin) pp.skin.sips = pp.skin.max || 3;
      ctx.number(S.G.seal.x, S.G.seal.y - 30, 'THE LAST SEAL BREAKS', '#ff9a5c'); try { SOUND.seal(ctx.sfx); } catch {} ctx.shake(4); }
    if (e.mode === 'wake') { S.sealT = (S.sealT || 0) + dt; if (S.sealT > 1.0 && Math.random() < dt * 40) ctx.dust(S.G.mid + (Math.random() - 0.5) * 50, S.G.floor, 1);
      if (S.sealT >= 1.6 && !S.told.rises) { S.told.rises = 1; ctx.number(e.x, e.y - 110, 'THE DJINN OF THE GREAT WELL RISES', '#ffd36b'); try { (ctx.sfx.boreRoar || ctx.sfx.roar || ctx.sfx.heavy)(); } catch {} } }
    const c = world(e), hs = heroes();
    DJG.stepDjinn(e, S, dt, hs, c);
    /* his body's box follows his pose: a man of sand on the floor, a column of water in the shaft, spilled on a ledge */
    if (S.pose === 'column') { e.w = 44; e.h = 150; e.y = S.G.floor; const hd = DJG.handOut(S); if (hd) e.w = 2 * Math.max(22, Math.abs(hd.x - e.x) + DJ.handR + 2); }   /* (his slammed hand is part of him: a blow can reach it) */ else if (S.pose === 'spilled') { e.w = 52; e.h = 36; } else { e.w = DJ.w; e.h = DJ.h; }
    /* THE WINDLASS and THE CRANK: a blow on either sends the great bucket down the shaft */
    const hb = ctx.attackBox();
    if (hb) for (const w of wls) if (ctx.overlap(hb, { l: w.x - 14, r: w.x + 14, t: w.y - 26, b: w.y })) { S.bucket.who = { x: ctx.hero().x, onLedge: onLedgeOf(ctx.hero(), S.G) }; if (DJG.strikeWindlass(e, S, c)) ctx.sparks(w.x, w.y - 14, ctx.hero().face || 1, 5); }
    /* A HERO ALIGHT: a tick at a time until it burns out or the skin puts it out */
    for (const pp of ctx.players) { if (!(pp.djBurn > 0)) continue; if (pp.dead) { pp.djBurn = 0; continue; } pp.djBurn -= dt; pp.djBurnTick = (pp.djBurnTick ?? DJ.burnTick) - dt;
      if (pp.djBurnTick <= 0) { pp.djBurnTick = DJ.burnTick; ctx.asPlayer(pp, () => hurt('ALIGHT', () => ctx.damagePlayer(pp.x - (pp.face || 1) * 4, DJ.dmg.burn, { who: e, name: 'ALIGHT', unblockable: true, noKnock: true }))); } }
    /* THE FIRST TIME: what a blade does to him, and where the water is */
    if (!S.told.how && e.mode !== 'wake' && e.mode !== 'sleep') { S.told.how = 1; ctx.number(e.x, e.y - 120, 'A BLADE PASSES THROUGH SAND: POUR WATER ON HIM', '#ffd36b'); }
    if (!S.told.basin && ctx.players.some(pp => pp.skin && pp.skin.sips <= 0) && S.ph < 3) { S.told.basin = 1; ctx.number(S.G.basinW, S.G.floor - 40, 'THE SPRINGS REFILL YOUR SKIN', '#7ab8e8'); }
    if (S.ph === 3 && !S.told.crank && e.mode === 'hover') { S.told.crank = 1; ctx.number(S.G.windlass, S.G.floor - 70, 'THE WINDLASS OR THE CRANK: DROP THE BUCKET ON HIM', '#7ab8e8'); }
  };
  /* ---------- A BLOW ON HIM: in a water opening x openMul (one opening takes at most openCap); his slammed hand in phase three, whole (at most handCap a
     slam); anything else passes through sand, is turned by fire, or splashes through water (0) ---------- */
  H.take = (e, dmg) => { if (!S) return dmg; const P = ctx.hero();
    if (DJG.djOpen(e)) { const cap = e.maxHp * DJ.openCap, d = Math.min(dmg * DJ.openMul, Math.max(0, cap - (S.openTaken || 0))); S.openTaken = (S.openTaken || 0) + d;
      if (S.openTaken >= cap - 0.01 && e.open > 0.4) { e.open = 0.4; ctx.number(e.x, e.y - 90, e.mode === 'mud' ? 'THE MUD CRACKS: HE IS SAND AGAIN' : 'HE GATHERS HIMSELF', '#9aa39a'); } return d; }
    if (e.mode === 'sleep' || e.mode === 'wake') return 0;
    const hd = DJG.handOut(S), hb = ctx.attackBox();
    if (hd && hb && ctx.overlap(hb, DJG.handBox(hd))) { const cap = e.maxHp * DJ.handCap, d = Math.min(dmg * DJ.handMul, Math.max(0, cap - (hd.taken || 0))); hd.taken = (hd.taken || 0) + d; S.n.handHits++;
      ctx.burst(hd.x, hd.y - 4, 6, ['#7ab8e8', '#e8f4f8'], 60, 0.4); if (hd.taken >= cap - 0.01 && hd.stay > 0.2) hd.stay = 0.2; return d; }
    /* HIS WARD (claude/djinn2): the shell, the white heat, the shroud - a blade rings off it (told once) */
    if (S.ward > 0) { e.chipHit = ctx.time(); S.n.wardPassed++; e.passFx = 0.25; ctx.burst(P.x + (P.face || 1) * 14, P.y - 16, 5, S.ph === 1 ? ['#fff2c0', '#e8d8a0'] : S.ph === 2 ? ['#ffffff', '#fff2c0'] : ['#bfe4ff', '#ffffff'], 50, 0.35);
      if (!S.told.wardBlade) { S.told.wardBlade = 1; ctx.number(e.x, e.y - (S.pose === 'column' ? 150 : 110), 'HIS WARD TURNS THE BLADE: WAIT IT OUT', '#9aa39a'); } return 0; }
    e.chipHit = ctx.time(); S.n.passed++; e.passFx = 0.25;
    if (S.ph === 1) { ctx.burst(P.x + (P.face || 1) * 14, P.y - 16, 4, ['#d8b47a', '#c9a46a'], 40, 0.4); if (!S.told.sand) { S.told.sand = 1; ctx.number(e.x, e.y - 100, 'THE SAND TAKES THE BLADE', '#c9a46a'); } }
    else if (S.ph === 2) { ctx.burst(P.x + (P.face || 1) * 14, P.y - 16, 4, ['#ff9a3c', '#ffd36b'], 50, 0.4); if (!S.told.fire) { S.told.fire = 1; ctx.number(e.x, e.y - 100, 'HIS FIRE TURNS THE BLADE: DOUSE HIM', '#ff9a5c'); } }
    else { ctx.burst(P.x + (P.face || 1) * 14, P.y - 16, 4, ['#7ab8e8', '#e8f4f8'], 50, 0.4); if (!S.told.water) { S.told.water = 1; ctx.number(P.x, P.y - 40, 'WATER CANNOT BE CUT: THE BUCKET, OR HIS HAND', '#7ab8e8'); } }
    return 0; };
  /* ---------- THE POUR (src/well-town-hands.js asks: what would a pour land on, and pour it). Alight yourself, it goes over you first ---------- */
  const heroOf = P => ({ x: P.x, y: P.y, face: P.face || 1, onLedge: onLedgeOf(P, S && S.G) });
  H.pourable = {
    aim: P => { const e = ctx.boss; if (!S || !ctx.bossActive || !e || e.t !== 'djinn' || !e.alive) return null; if (P.djBurn > 0) return { x: P.x, y: P.y - 14, what: 'self' }; return DJG.pourAim(e, S, heroOf(P)); },
    pour: P => { const e = ctx.boss; if (!S || !e || e.t !== 'djinn') return null;
      if (P.djBurn > 0) { P.djBurn = 0; ctx.burst(P.x, P.y - 16, 12, ['#e8f4f8', '#7ab8e8', '#9aa39a'], 50, 0.7); ctx.number(P.x, P.y - 30, 'THE WATER PUTS YOU OUT', '#7ab8e8'); return 'self'; }
      const r = DJG.pourAt(e, S, heroOf(P), world(e)); if (r === 'wasted') ctx.number(P.x, P.y - 30, 'IT RUNS INTO THE SAND', '#9aa39a'); return r; },
  };
  H.barName = e => 'THE DJINN' + (DJG.djOpen(e) ? (e.mode === 'mud' ? '  MUD' : e.mode === 'doused' ? '  DOUSED' : '  BAILED OUT') : S && S.ward > 0 ? '  WARDED' : S && S.ph === 1 ? '  SAND' : S && S.ph === 2 ? (S.burn ? '  ALIGHT' : '  SMOKE') : S && S.ph === 3 ? '  THE WELL' : '');
  H.end = e => { if (S) { S.bands = []; S.shots = []; S.marks = []; S.hand = null; if (S.held) { const h = S.held; if (h.pp && h.pp.snare > 0) h.pp.snare = 0; S.held = null; } } for (const pp of ctx.players) { pp.djBurn = 0; if (pp.snare > 0) pp.snare = 0; } };
  H.read = () => S && { mode: ctx.boss && ctx.boss.mode, ph: S.ph, pose: S.pose, cycle: S.cycle, n: JSON.parse(JSON.stringify(S.n)), water: S.water, burn: S.burn, ward: S.ward, bucket: S.bucket.st, hurt: { ...(S.hurt || {}) } };

  /* ---------- DRAWING ---------- */
  H.drawBoss = (g, e, cx, cy, time) => { if (!S) return; e.passFx = Math.max(0, (e.passFx || 0) - 1 / 60); DJA.drawDjinn(g, e, S, R(e.x - cx), R(e.y - cy), time); };
  H.drawBack = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar) return; const G = S.G;
    DJA.drawSeal(g, R(G.seal.x - cx), R(G.seal.y - cy), ctx.boss && ctx.boss.t === 'djinn' && ctx.boss.mode === 'sleep' ? -1 : (S.sealT || 9), time);   /* THE LAST SEAL (claude/djinn2): whole and glowing until he wakes, then cracked */
    for (const w of wls) CQA.drawWindlass(g, R(w.x - cx), R(w.y - cy), S.bucket, time);
    CQA.drawBucket(g, R(G.mid - cx), R(G.vault - cy), S.bucket, DJ, time); };
  H.drawOver = (g, cx, cy, time) => { const Ar = A(); if (!S || !Ar || !ctx.bossActive) return; const e = ctx.boss; if (!e || e.t !== 'djinn') return;
    DJA.drawOver(g, e, S, cx, cy, time);
    for (const pp of ctx.players) if (pp.djBurn > 0 && !pp.dead) { const x = R(pp.x - cx), y = R(pp.y - cy); for (let k = 0; k < 4; k++) { g.fillStyle = k % 2 ? '#ff9a3c' : '#ffd36b'; g.fillRect(x - 6 + k * 3, y - 18 - R(5 * Math.abs(Math.sin(time * 12 + k))), 2, 7); } } };
  return H;
}
