// src/gq6s2.js - GQ6S2 (Daniel 11-13 17:14, Highcrown pass 6 item 3, slice S2): THE FINAL PLATFORM. One switch, SHIPS OFF (?gq6s2=1 / BRACKEN_GQ6S2=1 / globalThis.BRACKEN_GQ6S2 = true).
// ON, on the tower top (phase 2), when she reaches 50 pct and is free:
//   THE LADDER    the one-tile ladder at the deck's east end (the stub of the outside stretch's mouth ladder) is GONE for the fight (sealHatch); a ladder rises from the deck's cupola side to ...
//   THE PLATFORM  ... a 12-tile solid stone roof (the bell-cage roof), tile row 7 (stand 6), 192 px, nothing above it. Laid at the transition, taken away with the rest of the fight (resetCastle / a retry).
//   SHE IS ON IT  she blinks up (told 1.6 s), HOLDS every attack until each hero stands on it (a stand-in lift after 25 s so a bot / a hero who cannot climb never soft-locks), then fights ON the 12 tiles.
//   KEPT          sweep, lash, crown (from two sky rings 56 px off each end), volley (the second ring 0.4 s after the first), boulder, rockfall (3 rocks, one on you, two >= 40 px from you and each other),
//                 the rage's Mountain (12 columns, a 48 px gap within 64 px of you, a told 1.5 s, then the geode). Every one of her hits up here is noKnock: nothing throws a hero off the edge.
//   DROPPED       leap + quake, ambush, blink, the crown storm, the bell perch, the hatch eruption, the burning bays, reinforcements (soldiers), the tier burns (that is S3).
//   UNCHANGED     reflected stones are the damage (8 pct a shard, daze after 4), blows chip 0.5x, her bar, the dmgK.
// S3 (the burn driven by HER HEALTH 85 / 70 / 50 and the tier ladders) is NOT built here: with S2 alone the fight goes deck -> platform at 50 pct (the stand-in).
import { MOVE, HERO_RUN, HERO_MOVE_IDS } from './hero-move.js';
import { S3, S3N, tierGeom, spansFor, arriveX } from './gq6s3.js';   /* (claude/gq6s3) THE BURN AND THE CLIMB (src/gq6s3.js, its own switch, OFF): S3 on implies S2 on */
export const GQ6S2_SHIPS = false;
export function gq6s2On() {
  try { if (globalThis.BRACKEN_GQ6S2 === false || globalThis.BRACKEN_GQ6S2 === '0') return false; } catch { /* no global */ }
  try { if (typeof location !== 'undefined' && /[?&]gq6s2=0\b/.test(location.search || '')) return false; } catch { /* no page */ }
  try { if (typeof process !== 'undefined' && process.env && process.env.BRACKEN_GQ6S2 === '0') return false; } catch { /* no node */ }
  if (GQ6S2_SHIPS) return true;
  try { if (globalThis.BRACKEN_GQ6S2 === true || globalThis.BRACKEN_GQ6S2 === '1') return true; } catch { /* no global */ }
  try { if (typeof location !== 'undefined' && /[?&]gq6s2=1\b/.test(location.search || '')) return true; } catch { /* no page */ }
  try { if (typeof process !== 'undefined' && process.env && process.env.BRACKEN_GQ6S2 === '1') return true; } catch { /* no node */ }
  return false;
}
export const S2 = gq6s2On() || S3;
export const S2N = {
  at: 0.5,                       // her bar when the climb starts (Daniel: the final platform is reached at her 50 pct)
  tell: 1.6, liftHold: 25, liftOn: 20, arrive: 1.0,   // s: the told blink up, the stand-in lift when nobody is up (first arrival / after a fall), the beat after the hero arrives
  plat: { off: 24, w: 12, row: 7, ladderAt: 1, herCol: 8.5 },   // first column = deck x0 + off; 12 tiles; tile row 7 (stand row 6); the ladder is the 2nd tile; she stands 8.5 tiles in
  ringDx: 4,                     // the two sky rings: this many columns outside each end (56 px from the edge)
  rock: { n: 3, sep: 40, edge: 12 },   // rockfall on the platform: 3 rocks (one on the hero, two >= sep px from him and each other), kept edge px inside the ends
  volley: { gap: 0.4 },          // the second ring fires this long after the first
  mtn: { cols: 12, gap: 48, tell: 1.5, off: 40, edge: 40 },   // one column per tile, a 48 px gap +-40 px from the hero, clamped 40 px inside the ends
  speed: Math.min(...HERO_MOVE_IDS.map(h => MOVE.RUN * HERO_RUN[h].ground)),   // the slowest hero's run cap (px/s) - the reaper's 0.8
  words: { tell: 'THE BELL-CAGE ROOF', go: 'UP THE LADDER!', wait: 'SHE WAITS ABOVE', lift: 'THE TOWER LIFTS YOU', on: 'REFLECT HER STONES' },
  hint: 'SHE HAS GONE UP TO THE BELL-CAGE ROOF. CLIMB THE LADDER AND FINISH HER THERE: STRIKE HER STONES BACK AT HER.',
  kept: ['sweep', 'lash', 'crown', 'volley', 'boulder', 'rockfall', 'mountain'],
  dropped: ['leap', 'ambush', 'blink', 'storm', 'perch', 'hatch', 'bays', 'reinforcements', 'tierBurn'],
};
/* the platform's numbers from the tower's own data (tiles; px = tile * TS). TW = the tower table (src/gq3-tower.js TW). */
export function pfGeom(TW, TS = 16) {
  const N = S2N.plat, c0 = TW.DECK.x0 + N.off, c1 = c0 + N.w - 1, row = N.row, lad = c0 + N.ladderAt, stand = TW.DECK.floor - 1;
  return { c0, c1, row, lad, stand, x0: c0 * TS, x1: (c1 + 1) * TS, floor: row * TS, herX: c0 * TS + N.herCol * TS, ladX: lad * TS + 8, w: N.w,
    rings: [{ id: 's2w', x: c0 - S2N.ringDx, y: row - 1, noStorm: true }, { id: 's2e', x: c1 + S2N.ringDx, y: row - 1, noStorm: true }] };
}
/* ROCKFALL on the platform: rock 1 under the hero; two more >= sep from him and from each other, edge px inside the ends. Deterministic fallback so it never comes up short. rnd() in [0,1). */
export function pfRockXs(x0, x1, tx, rnd = Math.random, K = S2N.rock) {
  const lo = x0 + K.edge, hi = x1 - K.edge, xs = [Math.max(lo, Math.min(hi, tx))]; let guard = 0;
  while (xs.length < K.n && guard++ < 80) { const x = lo + rnd() * (hi - lo); if (xs.every(o => Math.abs(o - x) >= K.sep)) xs.push(x); }
  for (let x = lo; xs.length < K.n && x <= hi; x += 4) if (xs.every(o => Math.abs(o - x) >= K.sep)) xs.push(x);
  return xs;
}
/* THE MOUNTAIN on the platform: where the gap sits (within near px of the hero, clamped), and which columns fall. */
export function pfMtnGap(x0, x1, hx, dir) { const M = S2N.mtn; return Math.max(x0 + M.edge, Math.min(x1 - M.edge, hx + dir * M.off)); }
export function pfMtnCols(x0, x1, gapX, MT) { const w = (x1 - x0) / MT.cols, out = []; for (let i = 0; i < MT.cols; i++) { const x = x0 + (i + 0.5) * w; if (Math.abs(x - gapX) < MT.gap / 2) continue; out.push({ i, x }); } return out; }
/* a hero is ON the platform: over its x range, standing or jumping above its top (y = feet) */
export const pfOn = (P1, G) => !!P1 && !P1.dead && P1.x >= G.x0 - (G.slack ?? 6) && P1.x <= G.x1 + (G.slack ?? 6) && P1.y <= G.floor + 3 && P1.y >= G.floor - (G.up ?? 70);   /* (claude/gq6s3) a tier's own slack / up; the final platform's are S2's 6 / 70 */

export function makeGQ6S2(env) {
  const { TS, ctx } = env, N = S2N, E = {}; let st = null, laid = false, G = null, derived = null; const TG = {}, layK = new Set();
  const tn = () => env.now();
  const tower = () => { const Lv = env.L(); return (Lv.arena && Lv.arena.tower) || (Lv.arenaRoof && Lv.arenaRoof.tower) || null; };
  const geom = () => { if (G) return G; const Tw = tower(); if (Tw) G = pfGeom(Tw, TS); return G; };
  /* (claude/gq6s3) the tier tables: 1 hoardings, 2 bell loft, 3 the final platform (S2's columns, its ladder moved to the west END). cg() = the geometry she fights on NOW (S2 alone: always the final platform) */
  const tg = k => { const Tw = tower(); if (!Tw) return null; if (k === 3) return S3 ? (TG[3] || (TG[3] = tierGeom(Tw, 3, TS, geom()))) : geom(); return TG[k] || (TG[k] = tierGeom(Tw, k, TS)); };
  const cg = () => (S3 ? (st && st.tier >= 1 ? tg(st.tier) : null) : geom());
  E.state = () => st; E.geom = geom; E.tier = tg; E.cur = () => (st ? st.tier : 0);
  E.phase = () => (st ? st.phase : 'off');
  E.live = () => !!st && st.phase !== 'off';                        // the transition has begun (tell, hold or on)
  E.active = () => !!st && (st.phase === 'hold' || st.phase === 'on');   // a tier above the deck is her arena
  E.final = () => E.active() && (!S3 || st.tier === 3);             // the 12-tile platform is her arena (S2's reshapes apply only here)
  const thr = k => (S3 ? S3N.steps[k] : (k === 0 ? N.at : undefined));   // her bar at which tier k burns away
  E.pending = e => !!st && (st.phase === 'off' || (S3 && st.phase === 'on')) && !!e && e.hp > 0 && thr(st.tier) !== undefined && e.hp / e.maxHp <= thr(st.tier) + 0.0001;
  /* the arena the attacks use: the deck's own fields with x0 / x1 / floor of the tier (a copy; the real arena is never touched) */
  E.arena = A => { const g = cg(); if (!g || !E.active()) return A; if (!derived || derived.src !== A) derived = { ...A, src: A }; derived.x0 = g.x0; derived.x1 = g.x1; derived.floor = g.floor; return derived; };
  E.rings = base => { const g = cg(); return g && E.active() ? g.rings : base; };
  E.mtn = MT => (E.final() ? { ...MT, cols: N.mtn.cols, gap: N.mtn.gap, tell: N.mtn.tell } : MT);
  E.anyOn = () => { const g = cg(); let on = false; if (g) env.seats(P1 => { if (pfOn(P1, g)) on = true; }); return on; };
  E.allOn = () => { const g = cg(); let all = !!g, any = false; if (g) env.seats(P1 => { any = true; if (!pfOn(P1, g)) all = false; }); return all && any; };
  E.noKnock = () => E.active();
  const isStub = (c, r) => { const Tw = tower(); return !!(Tw && Tw.OUT && c === Tw.OUT.mouthLadder && r === Tw.DECK.floor - 1); };
  /* tiles: laid at the transition, lifted at begin / reset (idempotent: main.js gqTiles only touches what it laid) */
  const tilesLay = on => {
    const g = geom(); if (!g || !ctx.tiles) return;
    if (on) {
      ctx.tiles(g.row, g.c0, g.lad - 1, 'solid', true); ctx.tiles(g.row, g.lad + 1, g.c1, 'solid', true); ctx.tiles(g.row, g.lad, g.lad, 'lay', true);   // the roof; the ladder's own tile is one-way (up through it, never a hole)
      ctx.tiles(g.row - 1, g.lad, g.lad, 'ladder', true); for (let r = g.row + 1; r <= g.stand; r++) ctx.tiles(r, g.lad, g.lad, 'ladder', true);
      laid = true;
    } else if (laid) {
      ctx.tiles(g.row, g.c0, g.lad - 1, 'unsolid', true); ctx.tiles(g.row, g.lad + 1, g.c1, 'unsolid', true); ctx.tiles(g.row, g.lad, g.lad, 'unlay', true);
      ctx.tiles(g.row - 1, g.lad, g.lad, 'unladder', true); for (let r = g.row + 1; r <= g.stand; r++) ctx.tiles(r, g.lad, g.lad, 'unladder', true);
      laid = false;
    }
    if (ctx.tilesDone) ctx.tilesDone();
  };
  /* (claude/gq6s3) one tier: its floor + a ladder at each END (top rung at the floor row, so no hole and no gap in the climb). The east stub of the old 'random ladder' is put back (restore) as the bottom rung of the hoardings' east ladder, never 'laid'. */
  const layTier = k => {
    const g = tg(k); if (!g || !ctx.tiles || layK.has(k)) return;
    if (k === 1) ctx.tiles(g.row, g.hoard[0], g.hoard[1], 'lay', true); else if (k === 2) ctx.tiles(g.row, g.c0, g.c1, 'lay', true); else ctx.tiles(g.row, g.c0, g.c1, 'solid', true);
    for (const lc of g.lads) for (let r = g.row; r <= g.lowStand; r++) ctx.tiles(r, lc, lc, isStub(lc, r) ? 'restore' : 'ladder', true);
    layK.add(k); laid = true; if (ctx.tilesDone) ctx.tilesDone();
  };
  const unlayTiers = () => {
    for (const k of [...layK].sort((a, b) => b - a)) { const g = tg(k); if (!g) continue;
      ctx.tiles(g.row, k === 1 ? g.hoard[0] : g.c0, k === 1 ? g.hoard[1] : g.c1, k === 3 ? 'unsolid' : 'unlay', true);
      for (const lc of g.lads) for (let r = g.row; r <= g.lowStand; r++) ctx.tiles(r, lc, lc, 'unladder', true); }
    layK.clear(); laid = false; if (ctx.tilesDone) ctx.tilesDone();
  };
  const setRespawn = r => { if (env.setRespawn) env.setRespawn(r); };
  E.laid = () => laid;
  E.begin = () => { if (S3) { if (layK.size) unlayTiers(); } else tilesLay(false); derived = null; setRespawn(null); st = { phase: 'off', tier: 0, next: 0, t0: tn(), lonely: 0, said: 0, lifts: 0, ladSaid: 0, burns: [], stepT: -99, steps: 0, climbSaid: false, crumbleAt: 0 }; };
  E.reset = () => { if (S3) { if (layK.size) unlayTiers(); } else tilesLay(false); st = null; derived = null; setRespawn(null); };
  /* the trigger (q4Choose, first): her bar is at the next threshold, she is free, and no perch / hatch is mid-way (S3: the steps are >= 4 s apart and someone is on her tier) */
  E.wanted = e => !!st && (st.phase === 'off' || (S3 && st.phase === 'on')) && !!geom() && E.pending(e) && (e.mode === 'roofStand' || e.mode === 'rec') && env.perchIdle() && (!S3 || (tn() - st.stepT >= S3N.gapMin && (st.tier === 0 || E.anyOn())));
  const seatX = () => { let s = 0, n = 0; env.seats(P1 => { s += P1.x; n++; }); return n ? s / n : 0; };
  E.start = (e) => {
    const R0 = env.R0(), p4 = R0 && R0.q4, tt = tn(); st.next = S3 ? st.tier + 1 : 3; st.phase = 'tell'; st.t0 = tt; st.climbSaid = false; e.mode = 's2Tell'; e.modeT = S3 ? S3N.tell : N.tell; e.vx = 0; e.crownOut = false; env.setCrown(null);
    if (p4) { p4.fall = []; p4.vol = null; p4.volTwo = null; p4.boulder = null; p4.mtn = null; p4.bomb = null; p4.ward = 0; }
    if (R0) { R0.blink = null; R0.reinf = null; R0.geysers = []; R0.bays.forEach(b => { b.state = 'idle'; }); }
    env.clearShards();
    if (!S3) {
      const g = geom(); tilesLay(true);
      ctx.number(e.x, e.y - e.h - 12, '!', '#ffd36b'); ctx.number(e.x, e.y - 70, N.words.tell, '#ffd36b'); env.sfx('portalOpen'); ctx.burst(e.x, e.y - 24, 10, ['#b28cff', '#e8dcff'], 60, 0.4);
      if (g) ctx.number(g.ladX, g.stand * TS - 40, N.words.go, '#ffd36b');
      if (ctx.hint) ctx.hint(N.hint);
      return;
    }
    /* (claude/gq6s3) THE BURN IS TOLD: the span smoulders 3.0 s (seams, smoke, 'crumble', the word over every hero), the next tier is laid with its ladders glowing gold; she says 'SHE CLIMBS' in the last 0.6 s */
    const gN = tg(st.next), Tw = tower(); layTier(st.next);
    for (const sp of spansFor(Tw, st.tier, TS, tg(3))) st.burns.push({ ...sp, state: 'smoke', at: tt + S3N.tell, step: st.tier });
    ctx.number(e.x, e.y - e.h - 12, '!', '#ffd36b'); env.sfx('crumble'); st.crumbleAt = tt + 1.4;
    env.seats(P1 => { ctx.number(P1.x, P1.y - 44, S3N.words.burn, '#ff9a5c'); });
    for (const lc of gN.lads) ctx.number(lc * TS + 8, gN.lowStand * TS - 40, N.words.go, '#ffd36b');
    if (st.tier === 2) ctx.number(gN.lads[0] * TS + 8, tg(2).floor - 58, S3N.words.safe, '#8fd160');   /* the final ladder's foot is the one span of the loft that does not burn */
    if (ctx.hint) ctx.hint(S3N.hints[st.tier] || S3N.hints[0]);
  };
  /* her modes (q4Mode, first): the told blink up, then the hold */
  E.mode = (e, dt) => {
    if (!st) return undefined; const g = S3 ? tg(st.next) : geom(), tt = tn();
    if (e.mode === 's2Tell') {
      e.vx = 0; if (Math.random() < dt * 40) ctx.part({ x: e.x + (Math.random() - 0.5) * 30, y: e.y - 20 - Math.random() * 40, vx: 0, vy: -26, life: 0.4, max: 0.4, col: '#b28cff', size: 2, grav: 0, glow: true });
      if (S3) {
        if (st.crumbleAt && tt >= st.crumbleAt) { st.crumbleAt = 0; env.sfx('crumble'); }
        if (!st.climbSaid && e.modeT <= S3N.climbTell) { st.climbSaid = true; ctx.number(e.x, e.y - 76, S3N.words.climbs, '#c9a0ff'); ctx.ring(e.x, e.y - 30, 26, '#c9a0ff', 0.5); env.sfx('portalOpen'); }
      }
      if (e.modeT <= 0 && g) {
        ctx.burst(e.x, e.y - 24, 14, ['#3a2a4a', '#7a4aa0', '#c9a0ff'], 80, 0.5); env.cullAdds();
        if (S3) { st.tier = st.next; st.stepT = tt; st.steps++; for (const b of st.burns) if (b.state === 'smoke') b.state = 'burn'; env.sfx('crack'); setRespawn({ x: g.x0 + S3N.respawnIn, y: g.floor }); e.x = arriveX(g, seatX()); }
        else { st.tier = 3; e.x = g.herX; }
        e.y = g.floor; e.vx = 0; e.vy = 0; e.hidden = false; e.face = -1; e.mode = 's2Hold'; e.modeT = 99; st.phase = 'hold'; st.t0 = tn(); st.lonely = 0; e.gqOpenTaken = 0;
        ctx.burst(e.x, e.y - 22, 14, ['#fff6c8', '#e8dcff', '#b28cff'], 90, 0.5); ctx.ring(e.x, e.y - 30, 30, '#c9a0ff', 0.5); env.sfx('callerBlast'); ctx.number(e.x, e.y - 76, S3 && g.name ? g.name : N.words.wait, '#c9a0ff');
      }
      return 0;
    }
    if (e.mode === 's2Hold') { e.vx = 0; e.face = -1; if (st.phase === 'on') { e.mode = 'rec'; e.modeT = N.arrive; } return 0; }
    return undefined;
  };
  /* the walk: she keeps her feet on the tier (never walks off an end); the old chain (blink, leap, ambush, storm) is off up here */
  E.walkWant = (e, want) => { const g = cg(); if (!g || !want) return want; if ((want < 0 && e.x <= g.x0 + 14) || (want > 0 && e.x >= g.x1 - 14)) return 0; return want; };
  const ladWords = (g, tt) => { for (const lc of (S3 && g.lads ? g.lads : [g.lad])) ctx.number(lc * TS + 8, (S3 ? g.lowStand : g.stand) * TS - 40, N.words.go, '#ffd36b'); };
  /* every frame */
  E.update = dt => {
    if (!st || st.phase === 'off') return; const e = env.q(), g = cg(), tt = tn(); if (!e) return;
    if (st.phase === 'tell') { const gt = S3 ? tg(st.next) : geom(); if (gt && tt >= st.ladSaid && tt - st.t0 < (S3 ? S3N.tell : N.tell) + 6) { st.ladSaid = tt + 1.6; ladWords(gt, tt); } return; }
    if (!g) return;
    if (e.stage !== 'roof' || e.hp <= 0) return;
    const liftHold = S3 ? S3N.liftHold : N.liftHold, liftOn = S3 ? S3N.liftOn : N.liftOn;
    let seats0 = 0; env.seats(() => seats0++); const all = E.allOn(), any = E.anyOn();
    if (st.phase === 'hold') {
      if (all && seats0) { st.phase = 'on'; st.lonely = 0; ctx.number(e.x, e.y - 76, N.words.on, '#8fd160'); return; }
      st.lonely += dt; if (st.lonely >= liftHold) lift();
      if (tt >= st.ladSaid) { st.ladSaid = tt + 2.0; ladWords(g, tt); }
      return;
    }
    if (st.phase === 'on') {   // a hero who fell: she waits (no attack is chosen while nobody is up); a stand-in lift after liftOn s so nothing soft-locks
      if (any) st.lonely = 0; else { st.lonely += dt; if (st.lonely >= liftOn) lift(); if (tt >= st.ladSaid) { st.ladSaid = tt + 2.0; ladWords(g, tt); } }
    }
  };
  function lift() {
    const g = cg(), e = env.q(); if (!g) return; st.lonely = 0; st.lifts++; let n = 0;
    env.everyone(P1 => { if (P1.dead || pfOn(P1, g)) return; P1.x = g.x0 + 24 + (n++ % 4) * 14; P1.y = g.floor; P1.vx = 0; P1.vy = 0; P1.ground = true; P1.climb = false; P1.inv = Math.max(P1.inv || 0, 0.8);
      ctx.burst(P1.x, P1.y - 10, 14, ['#b28cff', '#e8dcff', '#ffd36b'], 90, 0.6); ctx.number(P1.x, P1.y - 34, N.words.lift, '#ffd36b'); });
    if (e) env.sfx('portalOpen');
  }
  E.lift = lift;
  /* (claude/gq6s3) the burning spans (the hands' fire tick reads these) and the lab bot's hand */
  E.burns = () => (st ? st.burns : []);
  E.fireSpans = () => (st ? st.burns.filter(b => b.state === 'burn') : []);
  /* where a hero NOT on her tier should walk (px) and whether to hold UP: the ladder of the next tier up from the level he stands on (the deck's two by the side of the cupola he is on). null = nothing to do */
  E.botGoal = P1 => {
    if (!S3 || !st || st.phase === 'off' || !P1 || P1.dead) return null; const Tw = tower(); if (!Tw) return null;
    const tgt = st.phase === 'tell' ? st.next : st.tier, gT = tg(tgt); if (!gT) return null; if (st.phase !== 'tell' && pfOn(P1, gT)) return null;
    const floors = [Tw.DECK.floor * TS, tg(1).floor, tg(2).floor, tg(3).floor];
    if (P1.climb || !P1.ground) { let best = null; for (let k = 1; k <= tgt; k++) for (const lc of tg(k).lads) { const lx = lc * TS + 8, d = Math.abs(P1.x - lx), gk = tg(k); if (d < 9 && P1.y > gk.floor - 8 && P1.y <= floors[k - 1] + 2 && (!best || d < best.d)) best = { d, lx, top: gk.floor }; }
      if (best) return { goal: best.lx, up: true, top: best.top }; if (!P1.ground) return null; }
    let lvl = -1, bd = 1e9; floors.forEach((f, k) => { const d = Math.abs(P1.y - f); if (d < bd) { bd = d; lvl = k; } }); if (bd > 20 || lvl >= tgt) return null;
    const gN = tg(lvl + 1); let lx = gN.lads[0] * TS + 8;
    if (gN.lads.length > 1) { const cu = Tw.CUPOLA; if (lvl === 0 && P1.x < cu.x0 * TS) lx = gN.lads[0] * TS + 8; else if (lvl === 0 && P1.x > (cu.x1 + 1) * TS) lx = gN.lads[1] * TS + 8; else lx = Math.abs(P1.x - (gN.lads[0] * TS + 8)) <= Math.abs(P1.x - (gN.lads[1] * TS + 8)) ? gN.lads[0] * TS + 8 : gN.lads[1] * TS + 8; }
    return { goal: lx, up: Math.abs(P1.x - lx) < 7, top: gN.floor };
  };
  /* the picture: S3 = the burning spans (Highcrown's own bay fire, drawn once per visible span, clipped to the screen) + the ladder glow while it is the way (tell / hold / nobody up) */
  E.draw = (g2, cx, cy, t) => {
    if (!st || st.phase === 'off' || !laid) return;
    const VWv = (g2.canvas && g2.canvas.width) || 320, VHv = (g2.canvas && g2.canvas.height) || 180, RE = VWv + 8;   /* (claude/gq6s23look) the Queen's fight is drawn on a 629 x 311 picture, not 320 x 180: the old 328 / 190 culls hid every span right of x 328 and below y 190 (the deck itself) */
    if (S3 && env.art) for (let i = 0; i < st.burns.length; i++) { const b = st.burns[i]; let x0 = Math.round(b.x0 - cx), x1 = Math.round(b.x1 - cx); if (x1 < -8 || x0 > RE) continue;
      const fyb = Math.round(b.y - cy); if (fyb < -36 || fyb > VHv + 10) continue;   /* a span off the screen (above / below the camera) draws nothing */
      if (x0 < -8) x0 += 14 * Math.ceil((-8 - x0) / 14); if (x1 > RE) x1 = RE; if (x1 - x0 < 8) continue; const sm = b.state === 'smoke'; if (!(env.art.drawBayBaked && env.art.drawBayBaked(g2, b.x0 - cx, b.x1 - cx, fyb, sm ? 'smoke' : 'burn', t, i, VWv))) env.art.drawBay(g2, x0, x1, fyb, sm ? 'smoke' : 'burn', t, i, 14, 20); }
    const glow = st.phase === 'tell' || st.phase === 'hold' || (st.phase === 'on' && !E.anyOn()); if (!glow) return;
    const g = S3 ? tg(st.phase === 'tell' ? st.next : st.tier) : geom(); if (!g) return;
    const k = 0.3 + 0.2 * Math.sin(t * 6);
    for (const lc of (S3 ? g.lads : [g.lad])) { const x = Math.round(lc * TS - cx), y0 = Math.round((g.row - (S3 ? 0 : 1)) * TS - cy), y1 = Math.round(((S3 ? g.lowStand : g.stand) + 1) * TS - cy);
      g2.globalAlpha = k; g2.fillStyle = '#ffd36b'; g2.fillRect(x, y0, TS, y1 - y0); g2.globalAlpha = 1; }
  };
  return E;
}
