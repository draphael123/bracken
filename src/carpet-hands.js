// src/carpet-hands.js - THE FLYING CARPET's HANDS (claude/carpet, 11-06, the OPUS GREYBOX). Binds the pure pieces to the world and draws them (GREYBOX,
// readable - the art lane draws the kit: sky indigo dusk, necropolis spires, the Ksar's cliff gate, the Sphinx):
//   src/carpet.js     CARPET 2 (the ride: stepRide / rugStep) - the Falling Tower's own carpet code above it is untouched
//   src/sphinx.js     THE SPHINX OF THE HIGH GATE (riddle glyphs, the stones, rake / pounce / gust, the P3 glyph storm)
//   src/desert-rules.js  THE SANDSTORM (newStorm / stormStep): the level's storm section and, through sphinx.js, her glyph storm
// main.js calls (every hunk gated on CRH.on(): only a level with L.flyingCarpet, behind ?carpet=1):
//   on, clear, ride(dt, input) [from carpetPlayer, instead of stepCarpet], box() [the dodge's clamp], update(dt), strike(hb), draw, drawOver,
//   and for the boss spawnBoss(base), owns(e), bossUpdate(e, dt), take(e, dmg), barName(e), drawBoss(g, e, cx, cy, time); read() for the tools.
import { RIDE, newRide, stepRide, newRug, rugStep, rideBox, mountCarpet, drawRug } from './carpet.js';
import * as SXM from './sphinx.js';
import { newStorm, stormStep } from './desert-rules.js';

const C = { mist: 'rgba(200,190,230,', thermal: '#ffe6a8', down: '#8a9ac8', stone: '#cfc4a8', stoneHi: '#f2e8cc', glyph: '#3a2a18', gold: '#ffd36b', ward: '#c8d8e8',
  lion: '#c8a060', lionDk: '#8a6a3a', wing: '#e8d8b0', face: '#e8c890', red: '#ff6b6b', fray: '#c9463d', speed: '#e0b050' };
export const CR_K = { stormSlow: 0.45, stoneHit: 13, setDown: true };   /* a storm gust takes stormSlow x its push off the air speed per second (headwind; a tailwind gives it) */

export function makeCarpetHands(ctx) {
  const H = {}, TS = ctx.TS, Rd = Math.round;
  let Lref = null, CR = null, S = null, storm = null, st = null, said = {}, fx = [], gustNow = null, won = false, curR = null, stormPh = 'calm';
  const L = () => ctx.L;
  const say = (x, y, t, col) => ctx.number(x, y, t, col || '#ffd36b');
  const once = k => { if (said[k]) return false; said[k] = 1; return true; };
  const sfx = (k, alt) => { const f = ctx.sfx && (ctx.sfx[k] || ctx.sfx[alt]); if (typeof f === 'function') f(); };
  H.on = () => { const l = L(); if (l !== Lref) { Lref = l; CR = l && l.flyingCarpet && l.cr ? l.cr : null; S = null; storm = CR ? newStorm(CR.storm.dirs) : null; st = null; said = {}; fx = []; won = false; } return !!CR; };
  const solid = (px, py) => { const tx = Math.floor(px / TS), ty = Math.floor(py / TS); if (ty < 0) return false; return ctx.tileAt(tx, ty) === ctx.T.SOLID; };
  const inAbyss = x => CR.abyss.some(([a, b]) => x >= a && x < b);
  const rideOf = p => p.crRide || (p.crRide = newRide({ y0: CR.ceil }));
  const arenaOn = () => (ctx.bossActive && ctx.boss && ctx.boss.t === 'sphinx' && ctx.boss.alive ? CR.arena : null);
  function bounds(p, R) {
    const A = arenaOn();
    if (A) { if (R.mode !== 'arena') R.dir = p.face || 1; R.mode = 'arena'; R.x0 = A.x0 + 12; R.x1 = A.x1 - 12; R.y0 = A.y0 + RIDE.h; R.y1 = A.floor - 10; }
    else { R.mode = 'run'; R.dir = 1; R.x0 = -1e9; R.x1 = 1e9; R.y0 = CR.ceil; R.y1 = inAbyss(p.x) ? CR.mist : 99999; }
  }
  const lift = (px, py) => { let v = 0; for (const z of CR.thermals) if (px >= z.x0 && px < z.x1 && py >= z.y0 && py < z.y1) v += z.lift; return v; };
  /* THE WIND on the ridden carpet: the level's storm (a gust in its section), her wing gust, her glyph storm. Headwind (against the carpet's way) eats speed. */
  const wind = (px) => {
    let slow = 0, vy = 0; const dir = curR ? curR.dir : 1;
    if (st && st.phase === 'gust' && px >= CR.storm.x0 && px < CR.storm.x1) slow += -st.dir * dir * st.push * CR_K.stormSlow;
    const sst = S && S.st; if (sst && sst.phase === 'gust' && arenaOn()) slow += -sst.dir * dir * sst.push * CR_K.stormSlow;
    if (gustNow) { slow += gustNow.slow; vy += gustNow.vy; }
    return slow || vy ? { slow, vy } : null;
  };
  const W = { solid, lift, wind };

  /* ---------- THE RIDE (main.js carpetPlayer -> here, for the hero being stepped) ---------- */
  H.box = () => { const P = ctx.hero(); return { x0: P.x, x1: P.x, y0: P.y, y1: P.y }; };   /* the dodge's clamp: on this carpet a dodge is its i-frames and a jink, the ride moves you (no dodging through stone) */
  function drop(p, R, why) {
    p.carpet = null; R.n.drops++; R.rug = newRug(p.x, p.y + 2, 'lag'); p.vx = R.dir * R.spd * 0.3; p.vy = Math.max(p.vy || 0, why === 'hop' ? RIDE.hop : 0); p.ground = false;
    if (why === 'hop') { R.n.hops++; sfx('leap', 'jump'); return; }
    if (why === 'tear') { say(p.x, p.y - 34, 'THE CARPET TEARS - IT WILL COME UNDER YOU', C.red); sfx('crack'); }
    else { say(p.x, p.y - 34, 'TOO SLOW: IT DROPS YOU - IT WILL COME UNDER YOU', C.red); sfx('buzz'); }
  }
  function board(p, R) {
    const r = R.rug; mountCarpet(p, { x: r.x, y: r.y + 4 }); R.rug = null; R.n.boards++; R.stallT = 0; R.sag = false;
    R.spd = Math.max(R.spd, RIDE.cruise * RIDE.kick); if (R.fray <= 0) R.fray = RIDE.torn; if (R.mode === 'arena') R.dir = p.face || 1;
    sfx('throwWhoosh', 'leap'); if (once('board')) say(p.x, p.y - 34, 'THE CARPET RISES', C.speed);
  }
  H.ride = (dt, input = {}) => {
    const P = ctx.hero(); if (!P || !P.carpet || !H.on()) return false;
    const R = rideOf(P); bounds(P, R); curR = R;
    if (input.hop && !won) { drop(P, R, 'hop'); return true; }
    const px0 = P.x;
    for (const e of stepRide(P, R, input, dt, W)) {
      if (e.t === 'stallWarn') { say(P.x, P.y - 34, 'IT SAGS - DIVE!', C.red); sfx('buzz'); }
      else if (e.t === 'drop') { drop(P, R, e.why); break; }
      else if (e.t === 'scrape') { say(P.x, P.y - 30, 'THE CARPET FRAYS', C.fray); sfx('crack', 'clank'); ctx.burst && ctx.burst(P.x, P.y + 2, 6, [C.fray, C.speed], 50, 0.4); }
    }
    /* A LANDING LEDGE: crossing over its shrine the carpet SETS YOU DOWN (the shrine is lit by standing at it; the rug lies beside you) */
    if (P.carpet && R.mode === 'run') for (const l of CR.landings || []) if (px0 < l.x && P.x >= l.x) { P.carpet = null; P.vx = 0; P.vy = 0; P.x = l.x; R.rug = Object.assign(newRug(P.x, P.y + 2, 'park'), { parked: false, hold: 1e9 }); say(P.x, P.y - 34, 'A LANDING LEDGE: THE CARPET SETS YOU DOWN', C.speed); break; }
    return false;
  };

  /* ---------- PER FRAME: rugs, the storm, the tells, the stones ---------- */
  H.update = dt => {
    if (!H.on()) return;
    const P0 = ctx.hero();
    /* THE STORM SECTION (the sandstorm rule) - its clock runs while a hero is in it */
    const inStorm = ctx.players.some(p => !p.dead && p.x >= CR.storm.x0 - 160 && p.x < CR.storm.x1);
    st = inStorm ? stormStep(storm, dt) : null;
    if (st && st.phase !== stormPh) { stormPh = st.phase; if (st.phase === 'warn') { say(P0.x, P0.y - 44, st.dir < 0 ? '<< THE SAND HISSES: A HEADWIND - DIVE OR LIE FLAT' : 'THE SAND HISSES: A TAILWIND >>', '#d8c8a0'); sfx('hiss', 'wind'); } }
    if (gustNow && (gustNow.t -= dt) <= 0) gustNow = null;
    for (const t of CR.tells) if (!said['tell' + t.x] && P0.x >= t.x && P0.x < t.x + 12 * TS) { said['tell' + t.x] = 1; say(P0.x, P0.y - 40, t.text); }
    for (const p of ctx.players) {
      if (p.dead) continue;
      const R = rideOf(p);
      if (!p.carpet) {
        if (won) { if (R.rug && R.rug.state !== 'park') { R.rug.state = 'park'; R.rug.parked = false; } if (R.rug && !R.rug.parked) rugStep(R.rug, p, dt); continue; }   /* she is down: the carpet lies on the apron (the gate is on foot) */
        if (!R.rug) R.rug = Object.assign(newRug(CR.rug.x, CR.rug.y, 'park'), { parked: true });
        const r = rugStep(R.rug, p, dt);
        if (r === 'board') ctx.asPlayer(p, () => board(ctx.hero(), R));
        else if (r === 'lost') say(p.x, p.y - 34, 'THE CARPET LOST YOU', C.red);
      }
      /* THE STONES: fly through her glyph's stone (or any stone: the wrong one is answered too) */
      if (S && S.riddle) { const b = p.carpet ? rideBox(p, R) : ctx.box(p); for (const s of S.riddle.stones) if (b.l < s.x + CR_K.stoneHit && b.r > s.x - CR_K.stoneHit && b.t < s.y + CR_K.stoneHit && b.b > s.y - CR_K.stoneHit) { answerStone(s, p); break; } }
    }
    /* HER DEATH: the carpet sets you down on the apron (the gate is walked to) */
    if (S && !won && (S.mode === 'dead' || (ctx.boss && ctx.boss.t === 'sphinx' && !ctx.boss.alive))) { won = true; S.riddle = null; S.st = null;
      for (const p of ctx.players) if (p.carpet && CR_K.setDown) { const R = rideOf(p); p.carpet = null; p.vx = 0; p.vy = 0; R.rug = Object.assign(newRug(p.x, p.y + 2, 'park'), { parked: false }); }
      say(P0.x, P0.y - 44, 'THE HIGH GATE OPENS. THE CARPET SETS YOU DOWN.', C.gold); }
    for (const f of fx) f.t -= dt; fx = fx.filter(f => f.t > 0);
  };
  /* a respawn (spawnEntities): every hero is on foot at the checkpoint, the carpet lies beside it; the storm starts calm */
  H.clear = () => {
    if (!H.on()) return;
    const cp = ctx.checkpoint ? ctx.checkpoint() : null, l = L();
    /* only a checkpoint OF THIS LEVEL (a shrine, or the arena's start for a boss jump) moves the rug there; at a fresh load it lies at the launch */
    const spots = l.ents.filter(e => e.t === 'check').map(e => [e.x, e.y]).concat(l.arena && l.arena.start ? [l.arena.start] : []).map(([x, y]) => ({ x: x * TS + 8, y: (y + 1) * TS }));
    const near = cp && spots.find(q => Math.abs(q.x - cp.x) < 48 && Math.abs(q.y - cp.y) < 48);
    for (const p of ctx.players) { p.crRide = newRide({ y0: CR.ceil }); const at = near ? { x: cp.x + 22, y: cp.y - 2 } : CR.rug; p.crRide.rug = Object.assign(newRug(at.x, at.y, 'park'), { parked: true }); }
    storm = newStorm(CR.storm.dirs); st = null; stormPh = 'calm'; gustNow = null; fx = []; if (!won) S = null;
  };

  /* ---------- THE SPHINX ---------- */
  H.owns = e => e.t === 'sphinx';
  H.spawnBoss = base => { const A = L() && L().arena; if (!A || A.boss !== 'sphinx' || !H.on() || won) return null;
    S = SXM.newFight(SXM.geom(A.x0 + 16, A.x1 - 16, A.y0 + 8, A.floor - 60, A.floor));
    return { ...base, t: 'sphinx', w: SXM.SX.w, h: SXM.SX.h, hp: S.hp, maxHp: S.hp, noGrav: true, markH: SXM.SX.markH, face: -1, mode: 'sleep', modeT: 0, open: 0, phase: 1, boss: true, x: S.x, y: S.y + SXM.SX.h / 2 }; };
  function hurtHeroes(b, dmg, name, blockable, onceKey) {
    for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (P.dead || !ctx.upright(pp)) return;
      const hb = P.carpet ? rideBox(P, rideOf(P)) : ctx.box(P); if (!(hb.l < b[1] && hb.r > b[0] && hb.t < b[3] && hb.b > b[2])) return;
      if (onceKey) { pp.sxOnce = pp.sxOnce || {}; if (pp.sxOnce[onceKey]) return; pp.sxOnce[onceKey] = 1; }
      const hp0 = P.hp; ctx.damagePlayer((b[0] + b[1]) / 2, dmg, { name, unblockable: !blockable });
      if (P.carpet && P.hp < hp0) { const R = rideOf(P); R.spd = Math.max(0, R.spd - RIDE.hitSlow); P.vy += 90; } });   /* a blow on the carpet costs it speed */
  }
  function events(evs) {
    for (const v of evs) {
      if (v.t === 'intro') say(S.x, S.y - 60, SXM.SX_SAY.name + ': ' + v.text, C.gold);
      else if (v.t === 'riddle') { sfx(v.sfx, 'roar'); say(S.x, S.y - 60, 'SHE ASKS: ' + v.text, C.gold); fx.push({ k: 'riddleIn', t: 0.6 }); }
      else if (v.t === 'late') { sfx(v.sfx, 'buzz'); say(S.x, S.y - 50, v.text, '#c8b8e8'); }
      else if (v.t === 'open') { sfx(v.sfx, 'clank'); say(S.x, S.y - 50, v.text, C.gold); ctx.ring && ctx.ring(S.x, S.y, 40, C.gold); ctx.shake && ctx.shake(5); ctx.burst && ctx.burst(S.x, S.y, 16, [C.gold, '#fff6c8'], 120, 0.6); }
      else if (v.t === 'ward') { sfx(v.sfx, 'clank'); say(S.x, S.y - 50, v.text, C.ward); ctx.ring && ctx.ring(S.x, S.y, 42, C.ward); }
      else if (v.t === 'wrong') { say(S.x, S.y - 50, v.text, C.red); sfx('buzz'); }
      else if (v.t === 'tell') { sfx(v.sfx, 'roar'); say(S.x, S.y - SXM.SX.markH, v.mark, C.red); fx.push({ k: v.id, t: v.wind + 0.15, line: v.line, spot: v.spot, dir: v.dir }); }
      else if (v.t === 'release') sfx(v.sfx, 'swoosh');
      else if (v.t === 'hit') hurtHeroes(v.box, v.dmg, v.name, v.blockable, v.once);
      else if (v.t === 'gust') gustNow = { slow: v.slow, vy: v.vy, dir: v.dir, t: 0.05 };
      else if (v.t === 'storm' && v.phase === 'warn') { sfx(v.sfx, 'hiss'); say(S.x, S.y - 70, v.dir < 0 ? '<< THE GLYPH STORM GATHERS - DIVE OR LIE FLAT' : 'THE GLYPH STORM GATHERS - DIVE OR LIE FLAT >>', '#d8c8a0'); }
      else if (v.t === 'phase') { sfx(v.sfx, 'roar'); say((S.G.X0 + S.G.X1) / 2, S.G.Y0 + 30, v.text, C.gold); fx.push({ k: 'sky', ph: v.ph, t: SXM.SX.breath }); ctx.shake && ctx.shake(6); }
    }
  }
  function answerStone(s, p) {
    if (!S || !S.riddle) return; s.hit = true;
    const ev = SXM.answer(S, s.glyph, { x: p.x, y: p.y }); events(ev);
    ctx.burst && ctx.burst(s.x, s.y, 10, [C.stone, C.stoneHi], 80, 0.5);
  }
  const nearest = () => { let best = null, bd = 1e9; for (const p of ctx.players) { if (p.dead) continue; const d = Math.hypot(p.x - S.x, p.y - S.y); if (d < bd) { bd = d; best = p; } } return best; };
  H.bossUpdate = (e, dt) => {
    if (!S) return; S.hp = e.hp; const h = nearest();
    events(SXM.sxStep(S, dt, { hero: h ? { x: h.x, y: h.y, alive: !h.dead && ctx.upright(h) } : null, rng: Math.random }));
    e.x = S.x; e.y = S.y + SXM.SX.h / 2; e.face = S.face; e.mode = S.cur ? S.cur.id + ':' + S.cur.st : S.mode; e.open = S.open; e.phase = S.ph; e.hp = Math.min(e.hp, S.hp);
  };
  H.take = (e, dmg) => { if (!S) return dmg; const [d, word] = SXM.takeBlow(S, dmg); if (word) { e.guardWord = word; e.guardFx = 0.25; } return d; };
  H.barName = () => SXM.SX_SAY.name + (S ? (S.open > 0 ? '  STRUCK DUMB' : S.ward > 0 ? '  WARDED' : S.riddle ? '  SHE ASKS' : S.breath > 0 ? '  THE SKY CHANGES' : '  ' + S.ph + '/3') : '');
  /* A BLOW ON A STONE answers her (a blow on her is main.js's: wardedDamage -> take) */
  H.strike = hb => { if (!H.on() || !S || !S.riddle || !hb) return; for (const s of S.riddle.stones) if (hb.l < s.x + CR_K.stoneHit && hb.r > s.x - CR_K.stoneHit && hb.t < s.y + CR_K.stoneHit && hb.b > s.y - CR_K.stoneHit) { answerStone(s, ctx.hero()); return; } };
  H.read = () => ({ won, storm: st && st.phase, sx: S && { ph: S.ph, mode: S.mode, open: S.open, ward: S.ward, riddle: S.riddle && S.riddle.glyph, hp: S.hp, n: S.n }, rides: ctx.players.map(p => p.crRide && { spd: p.crRide.spd, fray: p.crRide.fray, mode: p.crRide.mode, n: p.crRide.n, rug: p.crRide.rug && p.crRide.rug.state, riding: !!p.carpet }) });
  H.fight = () => S;

  /* ---------- THE DRAWING (greybox) ---------- */
  const rect = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Rd(x), Rd(y), Rd(w), Rd(h)); };
  /* the six glyphs, 11 px, drawn plainly (the art lane's carved versions replace these) */
  function glyph(g, kind, x, y, col) {
    x = Rd(x); y = Rd(y); g.fillStyle = col;
    const px = (a, b, w = 1, h = 1) => g.fillRect(x + a, y + b, w, h);
    if (kind === 'sun') { px(-2, -2, 5, 5); px(0, -5, 1, 2); px(0, 4, 1, 2); px(-5, 0, 2, 1); px(4, 0, 2, 1); px(-4, -4); px(4, -4); px(-4, 4); px(4, 4); }
    else if (kind === 'moon') { px(-2, -4, 3, 1); px(-3, -3, 2, 1); px(-4, -2, 2, 5); px(-3, 3, 2, 1); px(-2, 4, 3, 1); }
    else if (kind === 'water') { for (const r of [-3, 0, 3]) { px(-4, r, 2, 1); px(-2, r - 1, 2, 1); px(0, r, 2, 1); px(2, r - 1, 2, 1); } }
    else if (kind === 'eye') { px(-4, 0, 9, 1); px(-3, -1, 7, 1); px(-3, 1, 7, 1); px(-2, -2, 5, 1); px(-2, 2, 5, 1); g.fillStyle = C.stoneHi; px(-1, -1, 3, 3); g.fillStyle = col; px(0, 0); }
    else if (kind === 'key') { px(-4, -2, 3, 3); px(-1, -1, 6, 1); px(3, 0, 1, 2); px(1, 0, 1, 2); }
    else if (kind === 'scarab') { px(-2, -3, 5, 6); px(-1, -5, 3, 2); px(-4, -2); px(4, -2); px(-4, 0); px(4, 0); px(-4, 2); px(4, 2); g.fillStyle = C.stoneHi; px(0, -3, 1, 6); }
  }
  H.draw = (g, cx, cy, time) => {
    if (!H.on()) return;
    const VW = ctx.VW ? ctx.VW() : 320, VH = ctx.VH ? ctx.VH() : 180;
    /* the air: a thermal's shimmer rises, a downdraft's streaks fall */
    for (const z of CR.thermals) { if (z.x1 < cx - 20 || z.x0 > cx + VW + 20) continue;
      g.fillStyle = z.lift > 0 ? C.thermal : C.down; g.globalAlpha = 0.35;
      for (let i = 0; i < 10; i++) { const x = z.x0 + ((i * 37) % Math.max(1, z.x1 - z.x0)), h = z.y1 - z.y0, y = z.y0 + ((((z.lift > 0 ? -1 : 1) * time * 60 + i * 53) % h) + h) % h; g.fillRect(Rd(x - cx), Rd(y - cy), 1, 4); }
      g.globalAlpha = 1; }
    /* the mist over the abyss: the ridden carpet will not go under its line, and under it a drop is a fall */
    for (const [a, b] of CR.abyss) { if (b < cx || a > cx + VW) continue; const y = CR.mist - cy;
      for (let k = 0; k < 4; k++) { g.fillStyle = C.mist + (0.12 + k * 0.08) + ')'; g.fillRect(Rd(Math.max(a, cx) - cx), Rd(y + k * 8 + Math.sin(time + k) * 2), Rd(Math.min(b, cx + VW) - Math.max(a, cx)), VH); } }
    /* the waiting / following rugs */
    for (const p of ctx.players) { const R = p.crRide; if (!R || !R.rug || p.carpet) continue; const r = R.rug;
      drawRug(g, r.x - cx, r.y - cy + Math.sin(time * 2.4) * (r.state === 'park' ? 1.5 : 0.5), time);
      if (r.state === 'follow' || r.state === 'lag') { g.fillStyle = 'rgba(224,176,80,.5)'; g.fillRect(Rd(r.x - cx) - 1, Rd(r.y - cy) - 12, 2, 6); }   /* told: it is coming */
      if (r.state === 'park' && r.parked && !won && Math.abs(p.x - r.x) < 60) ctx.text('WALK ONTO IT', Rd(r.x - cx), Rd(r.y - cy) - 14, C.speed, 'center', 6); }
    /* HER STONES */
    if (S && S.riddle) for (const s of S.riddle.stones) { const x = s.x - cx, y = s.y - cy; rect(g, x - 9, y - 9, 18, 18, C.stone); rect(g, x - 9, y - 9, 18, 2, C.stoneHi); glyph(g, s.glyph, x, y, C.glyph); }
    /* HER TELLS: the rake's line, the pounce's ring, the gust's arrow */
    if (S) for (const f of fx) {
      if (f.k === 'rake' && f.line) { g.strokeStyle = 'rgba(255,107,107,.7)'; g.lineWidth = 2; g.beginPath(); g.moveTo(f.line[0] - cx, f.line[1] - cy); g.lineTo(f.line[2] - cx, f.line[3] - cy); g.stroke(); }
      else if (f.k === 'pounce' && f.spot) { const [x, y, r] = f.spot; g.strokeStyle = 'rgba(255,107,107,.8)'; g.lineWidth = 1; g.beginPath(); g.arc(x - cx, y - cy, r, 0, Math.PI * 2); g.stroke(); }
      else if (f.k === 'gust') { const x = S.x - cx + f.dir * 30, y = S.y - cy; for (let i = 0; i < 3; i++) rect(g, x + f.dir * i * 10, y - 1 + i * 0, 8, 2, 'rgba(232,216,176,.8)'); ctx.text('HER WINGS - LIE FLAT', Rd(S.x - cx), Rd(S.y - cy) + 30, C.wing, 'center', 6); }
    }
  };
  H.drawBoss = (g, e, cx, cy, time) => {
    if (!S) return; const x = Rd(S.x - cx), y = Rd(S.y - cy), f = S.face, flap = Math.sin(time * (S.open > 0 ? 2 : 9)) * 6;
    rect(g, x - 15, y - 4, 30, 12, C.lion); rect(g, x - 15, y + 8, 4, 4, C.lionDk); rect(g, x + 11, y + 8, 4, 4, C.lionDk);   /* the lion's body */
    rect(g, x - 12, y - 10 - flap, 24, 5, C.wing); rect(g, x - 8, y - 14 - flap, 16, 4, C.wing);                                  /* the wings */
    rect(g, x + f * 12 - 5, y - 14, 10, 11, C.face); rect(g, x + f * 12 - 6, y - 16, 12, 4, '#4a6aa8');                          /* the woman's head, the striped cloth */
    rect(g, x - 6, y - 2, 12, 11, '#e8dcb8'); if (S.riddle) glyph(g, S.riddle.glyph, x, y + 3, C.glyph);                          /* HER GLYPH on her breast */
    if (S.open > 0) { g.strokeStyle = C.gold; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 26, 0, Math.PI * 2); g.stroke(); rect(g, x - 20, y - 30, 40 * (S.open / SXM.SX.openT), 3, C.gold); }
    else if (S.ward > 0) { g.strokeStyle = C.ward; g.lineWidth = 1; g.beginPath(); g.arc(x, y, 27, 0, Math.PI * 2); g.stroke(); }
    ctx.text(S.pose, x, y + 18, '#c8b8e8', 'center', 5);   /* greybox: the pose's NAME until the art lane draws it */
  };
  H.drawOver = (g, cx, cy, time) => {
    if (!H.on()) return;
    const VW = ctx.VW ? ctx.VW() : 320, VH = ctx.VH ? ctx.VH() : 180, P = ctx.hero();
    /* THE SANDSTORM's closing view (the level's storm, her glyph storm): sand outside the sight square round the hero */
    const s2 = (st && st.phase !== 'calm') ? st : (S && S.st && S.st.phase !== 'calm' && arenaOn() ? S.st : null);
    if (s2 && P) { const r = s2.sight, hx = P.x - cx, hy = P.y - 10 - cy, a = s2.phase === 'gust' ? 0.82 : 0.35; g.fillStyle = 'rgba(150,120,80,' + a + ')';
      g.fillRect(0, 0, VW, Math.max(0, Rd(hy - r))); g.fillRect(0, Rd(hy + r), VW, VH); g.fillRect(0, Rd(hy - r), Math.max(0, Rd(hx - r)), Rd(2 * r)); g.fillRect(Rd(hx + r), Rd(hy - r), VW, Rd(2 * r));
      g.fillStyle = 'rgba(216,200,160,.6)'; for (let i = 0; i < 24; i++) g.fillRect(Rd(((i * 53 + time * 300 * s2.dir) % VW + VW) % VW), Rd((i * 29) % VH), 3, 1); }
    /* THE RIDE'S BARS over the rider: air speed (red under the stall line) and the fray */
    for (const p of ctx.players) { const R = p.crRide; if (!R || !p.carpet) continue; const x = Rd(p.x - cx) - 12, y = Rd(p.y - cy) - 34;
      rect(g, x, y, 24, 2, 'rgba(0,0,0,.5)'); rect(g, x, y, 24 * Math.min(1, R.spd / RIDE.max), 2, R.spd < RIDE.stall ? C.red : C.speed); rect(g, x + 24 * RIDE.stall / RIDE.max, y - 1, 1, 4, '#fff');
      rect(g, x, y + 3, 24, 2, 'rgba(0,0,0,.5)'); rect(g, x, y + 3, 24 * R.fray, 2, C.fray);
      if (R.sag) ctx.text('IT SAGS - DIVE!', x + 12, y - 9, C.red, 'center', 6); }
    /* HER RIDDLE stands on the screen while it is asked */
    if (S && S.riddle) { rect(g, 20, 22, VW - 40, 22, 'rgba(20,14,40,.75)'); ctx.text('SHE ASKS: ' + S.riddle.text, VW / 2, 26, C.gold, 'center', 6);
      ctx.text('STRIKE THE STONE THAT BEARS HER GLYPH  (' + Math.ceil(S.riddle.t) + ')', VW / 2, 35, '#e8dcc0', 'center', 5); }
    /* the sky changes with her phases: dusk -> night -> the storm */
    if (S && arenaOn() && S.ph > 1) { g.fillStyle = S.ph === 2 ? 'rgba(30,20,70,.18)' : 'rgba(60,40,30,.16)'; g.fillRect(0, 0, VW, VH); }
  };
  return H;
}
