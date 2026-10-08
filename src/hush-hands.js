// src/hush-hands.js - UNDERLEAF 2: SOUND IS A VERB (claude/underleaf2; Daniel's interview 2026-10-08, scratch/brief-underleaf2.md, all recs).
// THE HUSH (main.js: MAT_VOL, noiseAt, footMark, updateHush, drawHush) made Underleaf a level you could only AVOID: the ground had a voice and
// so did your blade, and nothing you could do changed what the village heard (design standard A2: "if the player can only avoid the rule,
// it's not done"). This module gives the player the other half - things that MAKE a sound where you choose, and what the village does with it:
//   1. THROW A NOISE: pots (and the churchyard's stones) on CARRY & THROW (src/throwables.js THROW_KIND.pot, src/carry-throw.js KINDS.pot - the
//      told arc). Every one at rest is HIGHLIGHTED (an outline, a glint, the take-me ring in reach). Where it breaks is a NOISE RING
//      (main.js noiseAt, what = 'pot'): a sleeper inside it ROLLS OVER TO FACE IT (its back to you), a sleeper right under it wakes, the BELLMAN
//      walks to it and looks, and a window lights only if it breaks under it. THE GRANDMOTHER whirls to it and lashes at it (her back is yours).
//   2. QUIET PAYS: a sleeper (or an unwary Bellman) struck FROM BEHIND dies in one silent blow - the swing that does it makes no sound, and the
//      kill none either (main.js hurtEnemy0 / startSwing ask sneakKill / sneakReady). A dagger mark over it says when you are there (A3).
//      Each street has a SILVER CACHE (a strongbox with a lantern on it) that opens only for a street that stayed dark: one lit window in its
//      street (or its alarm) and its lantern goes amber - BARRED for this life. Three caches, the level's three silvers (A11: cap 3).
//   3. LOUD COSTS: a street that wakes RINGS ITS ALARM - two of its windows lit, or its Bellman rings - and its STREET GATE drops: the roofs are
//      the way round (harder, never a fail state, never a soft-lock: every gate stands under a roof with a ladder at each end - tools/underleaf.mjs).
//   4. THE CHURCH BELL TOLLS: every TOLL.every s the tower bell swings back (told) and tolls; for TOLL.len s nothing made in the churchyard is
//      heard - the mill's din made into a clock. Move loud on the toll (the remix, A4).
//   5. THE BELLMAN (the level's one new foe, A9): the blind night-watchman - ear trumpet and handbell - walks his beat, turns to any sound and
//      goes to look. A sound of YOURS inside his ear (BELLMAN.ear, the dotted ring drawn round him) and he RINGS: the street wakes and its gate
//      drops. Turn him with a thrown pot, or strike him from behind. He foreshadows THE GRANDMOTHER (B8): she is the village's ear.
//   6. THE BONE KEY ON THE MASTER'S NAIL: the one REQUIRED throw before the boss (A4) - a pot knocks it down.
// The Grandmother's own fight (her cottage: rugs, candles, bell-pulls and chimes, her back) is here too (granTake / granLure / the arena props);
// her AI stays main.js's updateGrandmother, which calls back into this module for the rules.
import * as CTW from './carry-throw.js';

/* THE POT: ring = how far its break carries (px), wakeK = the share of the ring close enough to wake a sleeper outright, windowR = how near a
   window it must break to light it, hit = what it does to a foe it hits square-on, respawn: THROW_KIND.pot's own */
export const POT = { ring: 124, wakeK: 0.28, windowR: 46, hit: 1, nail: 14 };
export const ALARM = { windows: 2, wakeR: 260 };
/* THE BELLMAN. ear = a sound of YOURS this near him and he rings; near = this close in front and he has you (behind, he does not: he is blind) */
export const BELLMAN = { hp: 26, w: 10, h: 18, patrol: 18, walk: 36, ear: 70, near: 22, heed: 0.5, look: 2.8, ringTell: 0.75, ring: 1.0, ringR: 210, reRing: 6,
  swingAt: 26, swingTell: 0.5, swing: 0.2, swingDmg: 8, cd: 1.4, hearMax: 240 };
export const TOLL = { every: 9, tell: 1.4, len: 1.9 };
/* THE GRANDMOTHER (her rework, B11/B13/B14 - keyed FROM BEHIND): back = her back is open this long after she lashes at a lure; backMul / rapMul;
   ward = the told ward after every opening (B3); pullCd = a bell-pull's chime swings this long before it rings again */
export const GRAN = { back: 2.6, backMul: 2, rapMul: 1.5, purse: 0.18, rapPurse: 0.08, hurlAt: 100, hurlCd: 6, jabTell: 0.3, jabCd: 1.6, ward: 3, lureTell: 0.4, lash: 0.32, lashR: 36, p2: 0.66, p3: 0.33, knellEvery: 6, knellTell: 0.75,
  waveV: 230, waveDmg: 16, chimeR: 260, pullCd: 5, lureMin: 22 };
/* THE CAPITAL LINES this module says (each routed: src/hint-lines.js CALL_LINES) */
export const LINES = {
  potTake: 'INTERACT TAKES THE POT. ATTACK THROWS IT. UP LOBS, DOWN TOSSES.',
  silent: 'STRUCK FROM BEHIND, A SLEEPER DIES WITHOUT A SOUND',
  barred: 'A LIGHT IN THE STREET: THE CACHE IS BARRED',
  opened: 'THE STREET SLEPT: THE CACHE OPENS',
  gateDown: 'THE STREET IS AWAKE: ITS GATE IS DOWN. GO BY THE ROOFS',
  rang: 'THE BELLMAN RINGS: THE STREET WAKES',
  keyDown: 'THE BONE KEY FALLS',
  toll: 'THE BELL TOLLS: NOTHING HERE IS HEARD',
  back: 'HER BACK: CUT IT',
  kick: 'SHE KICKS THE CANDLES OVER',
  knellP3: 'SHE RINGS FOR THE VILLAGE',
  knell: 'THE KNELL: JUMP THE BOARDS',
  lostChime: 'THE CHIMES ARE LOST IN THE BELL',
};

export function makeHushHands(ctx) {
  const TS = ctx.TS, H = {};
  const L = () => ctx.L, T = ctx.T;
  let secs = [], waves = [], knells = [], said = new Set();
  const once = (k, f) => { if (said.has(k)) return; said.add(k); f(); };
  H.on = () => !!(L() && L().hush);
  const secOf = x => { for (let i = 0; i < secs.length; i++) if (x >= secs[i].x0 * TS && x < (secs[i].x1 + 1) * TS) return i; return -1; };
  const propsOf = t => ctx.props().filter(p => p.t === t);
  const hero = () => ctx.P();
  const behindOf = (e, x) => Math.sign(x - e.x) === -(e.face || 1);

  /* ---------- RESET (spawnEntities: a death puts the whole village back to sleep, its gates up, its caches shut) ---------- */
  H.reset = () => {
    if (!H.on()) { secs = []; return; }
    secs = (L().hushSecs || []).map((s, i) => ({ ...s, i, alarm: false, why: null }));
    waves = []; knells = [];
    for (const pr of propsOf('streetgate')) ctx.clearCol(pr.col, pr.y0, pr.y1);
    for (const [x0, x1, row] of (L().rugs || [])) for (let x = x0; x <= x1; x++) ctx.setTile(x, row, T.SOFT);   /* her rugs, laid again (phase two burns them to boards) */
    /* a cache keeps its silver out of reach until it opens: the silver is the level's own (main.js silvers), moved out of the world while shut */
    for (const c of propsOf('darkcache')) { const sv = ctx.silvers().find(s => Math.abs((s.homeX ?? s.x) - c.x) < 10 && Math.abs(s.y - (c.y - 6)) < 14); c.sv = sv || null;
      if (sv) { if (sv.homeX === undefined) sv.homeX = sv.x; sv.x = sv.got ? sv.homeX : -99999; } }
    /* the bone key on its nail: the key prop is laid on the floor (so every reach tool finds it), and hung up on its nail here */
    for (const n of propsOf('keynail')) { const k = ctx.props().find(p => p.t === 'key' && !p.got && Math.abs(p.x - n.x) < 10 && p.y > n.y); n.key = k || null;
      if (k) { if (k.floorY === undefined) k.floorY = k.y; k.y = n.y + 6; k.hung = true; k.vy = 0; n.down = false; } else n.down = true; }
  };

  /* ---------- THE POT: carried, thrown, broken ---------- */
  H.newPot = (px, py, kind) => ({ t: 'npot', x: px, y: py, hx: px, hy: py, state: 'rest', kind: kind || 'pot', thrKind: 'pot', retT: 0, launch: P0 => CTW.launchOf('pot', P0, ctx.keys()) });
  function breakPot(pr, x, y) {
    ctx.sfx.crack(); ctx.burst(x, y - 3, 10, pr.kind === 'stone' ? ['#8a919c', '#5a6070', '#c9d1dc'] : ['#a8663a', '#7a4a26', '#5a3418', '#e0c49a'], 70, 0.5, 400, 2);
    ctx.noise(x, y, POT.ring, 'pot');
    /* the bone key's nail: a pot that breaks on it knocks the key down */
    for (const n of propsOf('keynail')) if (!n.down && Math.hypot(n.x - x, n.y - y) < POT.nail + 6) knock(n);
    pr.state = 'return'; pr.retT = ctx.respawn('pot'); pr.spent = (pr.spent || 0) + 1; H.n.breaks++;
  }
  function knock(n) { n.down = true; const k = n.key; if (k) { k.hung = false; k.falling = true; k.vy = -40; }
    ctx.sfx.clank(); ctx.ring(n.x, n.y, 16, '#ffd36b', 0.4); ctx.number(n.x, n.y - 16, 'THE BONE KEY FALLS', '#ffd36b'); H.n.keyDown++; }
  function stepPot(pr, dt) {
    const k = CTW.KINDS.pot; CTW.stepArc(pr, dt, k.g);
    for (const n of propsOf('keynail')) if (!n.down && Math.hypot(n.x - pr.x, n.y - pr.y) < POT.nail) { breakPot(pr, pr.x, pr.y); return; }
    for (const e of ctx.enemies()) { if (!e.alive || e.harmless) continue;
      if (ctx.overlap({ l: pr.x - 4, r: pr.x + 4, t: pr.y - 6, b: pr.y + 3 }, ctx.box(e))) { if (!(e.boss || e.maxHp)) ctx.hurt(e, POT.hit, pr.x); breakPot(pr, pr.x, pr.y); return; } }
    const tx = Math.floor(pr.x / TS), ty = Math.floor((pr.y + 2) / TS);
    if (pr.vy >= 0 && (ctx.isSolid(tx, ty) || ctx.oneWay(tx, ty))) { breakPot(pr, pr.x, ty * TS); return; }
    if (ctx.isSolid(Math.floor((pr.x + Math.sign(pr.vx || 1) * 4) / TS), Math.floor(pr.y / TS))) { breakPot(pr, pr.x, pr.y); return; }
    if (pr.y > ctx.LH() * TS || pr.x < 0 || pr.x > ctx.LW() * TS) { pr.state = 'return'; pr.retT = 0.5; }
  }
  H.potArc = pr => { const P = hero(), v = CTW.launchOf('pot', P, ctx.keys());
    const solid = (px, py, falling) => { const tx = Math.floor(px / TS), ty = Math.floor(py / TS); return ctx.isSolid(tx, ty) || (falling && ctx.oneWay(tx, ty)); };
    const stop = (px, py) => propsOf('keynail').find(n => !n.down && Math.hypot(n.x - px, n.y - py) < POT.nail) || ctx.enemies().find(e => e.alive && !e.harmless && ctx.overlap({ l: px - 4, r: px + 4, t: py - 6, b: py + 3 }, ctx.box(e))) || null;
    return CTW.predictArc('pot', pr.x, pr.y, v, solid, { stopAt: stop }); };
  /* WALK ONTO IT AND PRESS INTERACT (main.js asks first, before a sign or a door): the nearest pot at rest in reach is yours */
  H.interact = P => { if (!H.on() || !P || P.carry || P.dead || !P.ground) return false;
    const pr = propsOf('npot').filter(q => q.state === 'rest' && Math.abs(q.x - P.x) < 18 && Math.abs(q.y - P.y) < 14).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
    if (!pr) return false; P.carry = pr; pr.state = 'held'; pr.hurtWas = false; ctx.sfx.clank(); H.n.taken++;
    if (!(ctx.PROG().potTold > 1)) { ctx.PROG().potTold = (ctx.PROG().potTold || 0) + 1; ctx.hint(LINES.potTake, 5); } return true; };
  function updatePots(dt) {
    const P = hero();
    for (const pr of propsOf('npot')) {
      if (pr.state === 'return') { if ((pr.retT -= dt) <= 0) { pr.state = 'rest'; pr.x = pr.hx; pr.y = pr.hy; pr.vx = 0; pr.vy = 0; ctx.burst(pr.x, pr.y - 4, 4, ['#a8663a', '#e0c49a'], 20, 0.3); } continue; }
      if (pr.state === 'held') {
        if (P.carry !== pr || P.dead) { pr.state = 'return'; pr.retT = ctx.respawn('pot'); if (P.carry === pr) P.carry = null; continue; }
        pr.x = P.x + P.face * 7; pr.y = P.y - 3;
        /* A BLOW DROPS IT, and a pot dropped at your feet is the loudest thing you can do */
        if (P.hurt > 0 && !pr.hurtWas) { P.carry = null; pr.hurtWas = true; breakPot(pr, P.x, P.y); continue; }
        pr.hurtWas = P.hurt > 0; continue; }
      if (pr.state === 'fly') { stepPot(pr, dt); continue; }
    }
  }

  /* ---------- WHAT THE VILLAGE HEARS (main.js noiseAt calls this for every sound in Underleaf) ---------- */
  /* returns true when the sleepers were handled here (a lure turns them over rather than waking them) */
  H.heard = (x, y, r, what) => {
    const P = hero(), mine = !what && Math.hypot(x - P.x, y - (P.y - 4)) < 26 && !P.dead;
    for (const e of ctx.enemies()) if (e.alive && e.t === 'bellman' && Math.hypot(e.x - x, e.y - y) <= Math.min(r, BELLMAN.hearMax)) bellHear(e, x, y, mine, what);
    if (what !== 'pot' && what !== 'chime') return false;
    /* A LURE: a sleeper inside the ring rolls over to face it (its back to you); one right under it wakes */
    for (const e of ctx.enemies()) { if (!e.alive || !(e.sleeper && !e.woke)) continue; const d = Math.hypot(e.x - x, e.y - y); if (d > r) continue;
      if (d < r * POT.wakeK) { e.woke = 1; e.sleeper = false; e.emote = 'shock'; e.emoteT = 0.6; continue; }
      const f = Math.sign(x - e.x) || e.face; if (f !== e.face) { e.face = f; e.stir = 0.8; } }
    return true;
  };
  /* a window lights for a lure only when it breaks under it */
  H.windowHears = (pr, x, y, r, what) => (what === 'pot' || what === 'chime') ? Math.hypot(pr.x - x, pr.y - y) < POT.windowR : true;

  /* ---------- QUIET PAYS ---------- */
  const unwary = e => e.alive && !(e.boss || e.maxHp || e.mini || e.elite || e.xpRole === 'mini') && ((e.sleeper && !e.woke) || (e.t === 'bellman' && !e.rung && !['ringTell', 'ring', 'fight', 'swingTell', 'swing'].includes(e.mode)));
  /* a blow (from fromX) that kills this one silently: asleep (or the unwary Bellman), and struck from behind */
  H.sneakKill = (e, fromX) => H.on() && unwary(e) && behindOf(e, fromX);
  /* is the hero standing behind one, close enough to strike? (the swing he starts now is silent, and the dagger mark shows) */
  const sneakTarget = () => { const P = hero(); if (!P || P.dead) return null; let best = null, bd = 1e9;
    for (const e of ctx.enemies()) { if (!unwary(e) || Math.abs(e.y - P.y) > 18) continue; const d = (e.x - P.x) * (P.face || 1); if (d < -4 || d > 30) continue;
      if (!behindOf(e, P.x)) continue; if (Math.abs(d) < bd) { bd = Math.abs(d); best = e; } } return best; };
  H.sneakReady = () => H.on() && !!sneakTarget();
  /* proximity: a sleeper does not wake for a hero who is BEHIND it (only for one it would bump into) */
  H.behind = (e) => H.on() && behindOf(e, hero().x);
  H.killedSilently = e => { e.quiet = true; ctx.word(e.x, e.y - (e.h || 14) - 12, 'SILENT', '#bfe6f5'); ctx.sfx.puff(); H.n.silent++;
    once('silentTold', () => ctx.number(e.x, e.y - 30, 'STRUCK FROM BEHIND, A SLEEPER DIES WITHOUT A SOUND', '#bfe6f5')); };

  /* ---------- THE STREETS: alarm, gate, cache ---------- */
  const litIn = i => ctx.props().filter(p => p.t === 'window' && p.lit && secOf(p.x) === i).length;
  H.alarm = (i, why) => { const s = secs[i]; if (!s || s.alarm) return; s.alarm = true; s.why = why; H.n.alarms++;
    for (const pr of propsOf('alarm')) if (pr.sec === i) { pr.ringT = 4; ctx.sfx.tollBell(); ctx.shake(3); ctx.ring(pr.x, pr.y - 20, 40, '#ff9a5c', 0.6); }
    const P = hero();
    for (const g of propsOf('streetgate')) if (g.sec === i && !g.shut) { g.shut = true;
      /* nobody is shut INSIDE a gate: a hero in its column is put back on the side he stands */
      const gx = g.col * TS + 8; if (Math.abs(P.x - gx) < 14 && P.y > g.y0 * TS && P.y <= (g.y1 + 1) * TS + 2) P.x = gx + (P.x < gx ? -14 : 14);
      ctx.closeGate(g.col, g.y0, g.y1); }
    const al = propsOf('alarm').find(p => p.sec === i);
    for (const e of ctx.enemies()) if (e.alive && e.sleeper && !e.woke && secOf(e.x) === i && (!al || Math.abs(e.x - al.x) < ALARM.wakeR)) { e.woke = 1; e.sleeper = false; e.emote = 'shock'; e.emoteT = 0.6; }
    ctx.number(P.x, P.y - 34, 'THE STREET IS AWAKE: ITS GATE IS DOWN. GO BY THE ROOFS', '#ff9a5c');
  };
  function updateStreets(dt) {
    for (const s of secs) if (!s.alarm && litIn(s.i) >= ALARM.windows) H.alarm(s.i, 'windows');
    for (const pr of propsOf('alarm')) { pr.ringT = Math.max(0, (pr.ringT || 0) - dt); if (pr.ringT > 0 && Math.floor(pr.ringT * 2.5) !== Math.floor((pr.ringT + dt) * 2.5)) ctx.sfx.priestBell(); }
    const P = hero();
    for (const c of propsOf('darkcache')) { if (c.state === 'open') continue; const s = secs[c.sec];
      if (c.state !== 'barred' && s && (s.alarm || litIn(c.sec) > 0)) { c.state = 'barred'; ctx.sfx.clank(); if (Math.abs(c.x - P.x) < 220) ctx.number(c.x, c.y - 22, 'A LIGHT IN THE STREET: THE CACHE IS BARRED', '#ff9a5c'); }
      if (c.state === 'shut' && !P.dead && Math.abs(c.x - P.x) < 18 && Math.abs(c.y - P.y) < 20) { c.state = 'open'; ctx.sfx.medal ? ctx.sfx.medal() : ctx.sfx.coin();
        ctx.burst(c.x, c.y - 10, 14, ['#dfe8ff', '#ffffff', '#9fb4d8'], 60, 0.6, -20, 2); ctx.number(c.x, c.y - 26, 'THE STREET SLEPT: THE CACHE OPENS', '#dfe8ff'); H.n.caches++;
        if (c.sv && !c.sv.got) { c.sv.x = c.sv.homeX; c.sv.y = c.y - 20; } } }
    /* a cache that is barred keeps its silver hidden; a silver taken from an open cache is the game's own pickup (main.js) */
  }
  /* THE TOLL: the church bell's clock, and the churchyard it covers */
  function updateToll(dt) {
    for (const b of propsOf('tollbell')) { b.clk = (b.clk || 0) + dt; const ph = b.clk % TOLL.every, was = (b.clk - dt) % TOLL.every;
      b.tell = b.clk > TOLL.every - TOLL.tell && ph > TOLL.every - TOLL.tell; b.on = b.clk > TOLL.every && ph < TOLL.len;
      if (b.clk > TOLL.every && ph < was) { ctx.sfx.gtBell(); ctx.shake(1); waves.push({ x: b.x, y: b.y - 14, t: 0 }); H.n.tolls++;
        const P = hero(); if (P.x > b.x0 * TS - 60 && P.x < (b.x1 + 1) * TS + 60) once('tollTold', () => ctx.number(b.x, b.y - 30, 'THE BELL TOLLS: NOTHING HERE IS HEARD', '#bfe6f5')); } }
    for (const w of waves) w.t += dt; waves = waves.filter(w => w.t < 1.6);
  }
  /* a sound made here, now, is lost under the toll (main.js noiseAt asks) */
  H.masked = x => H.on() && propsOf('tollbell').some(b => b.on && x >= b.x0 * TS && x < (b.x1 + 1) * TS);
  function updateKeys(dt) {
    for (const n of propsOf('keynail')) { const k = n.key; if (!k || !k.falling) continue; k.vy = Math.min(420, (k.vy || 0) + 900 * dt); k.y += k.vy * dt;
      if (k.y >= k.floorY) { k.y = k.floorY; k.falling = false; ctx.sfx.clank(); ctx.burst(k.x, k.y, 6, ['#ffd34a', '#fff6c8'], 40, 0.4); } }
  }

  /* ---------- THE BELLMAN ---------- */
  H.newBellman = (base, e) => ({ ...base, t: 'bellman', w: BELLMAN.w, h: BELLMAN.h, hp: BELLMAN.hp, mode: 'patrol', modeT: 0, face: e.face || 1, sec: e.sec ?? -1,
    bx0: (e.x0 ?? e.x - 6) * TS + 8, bx1: (e.x1 ?? e.x + 6) * TS + 8, anim: 0, rung: false, cd: 0, ringAgain: 0 });
  function bellHear(e, x, y, mine, what) {
    if (!e.alive || e.rung || ['ringTell', 'ring', 'fight', 'swingTell', 'swing'].includes(e.mode)) return;
    const d = Math.hypot(e.x - x, e.y - y);
    if (mine && d < BELLMAN.ear) { ringTell(e); return; }
    e.goX = x; e.face = Math.sign(x - e.x) || e.face; e.mode = 'heed'; e.modeT = BELLMAN.heed; e.emote = 'q'; e.emoteT = 0.8;
  }
  function ringTell(e) { e.mode = 'ringTell'; e.modeT = BELLMAN.ringTell; const P = hero(); e.face = Math.sign(P.x - e.x) || e.face;
    ctx.word(e.x, e.y - e.h - 14, 'HE HEARS YOU', '#ff9a5c'); ctx.sfx.heard(); }   /* no guard mark: the ring throws no blow (marks.js rule H) - it is the street that answers */
  H.bellmanStep = (e, dt) => {
    const P = hero(), d = P.x - e.x, ad = Math.abs(d), dy = Math.abs(P.y - e.y);
    e.modeT -= dt; e.anim += dt; e.cd = Math.max(0, (e.cd || 0) - dt); e.vy = Math.min(320, (e.vy || 0) + 1000 * dt); e.emoteT = Math.max(0, (e.emoteT || 0) - dt);
    let want = 0;
    const calm = e.mode === 'patrol' || e.mode === 'heed' || e.mode === 'go' || e.mode === 'look';
    /* he has you: in front of him and close, or you walk into him */
    if (calm && !P.dead && dy < 22 && (ad < 10 || (ad < BELLMAN.near && Math.sign(d) === e.face))) ringTell(e);
    switch (e.mode) {
      case 'patrol': want = e.face * BELLMAN.patrol; if ((e.face > 0 && e.x >= e.bx1) || (e.face < 0 && e.x <= e.bx0)) { e.face = -e.face; e.mode = 'look'; e.modeT = 1.2; } break;
      case 'heed': want = 0; if (e.modeT <= 0) { e.mode = 'go'; e.modeT = 6; } break;
      case 'go': { const to = e.goX - e.x; e.face = Math.sign(to) || e.face; want = Math.abs(to) > 6 ? e.face * BELLMAN.walk : 0; if (Math.abs(to) <= 6 || e.modeT <= 0) { e.mode = 'look'; e.modeT = BELLMAN.look; } break; }
      case 'look': want = 0; if (e.modeT <= 0) { e.mode = 'patrol'; e.face = e.x < (e.bx0 + e.bx1) / 2 ? 1 : -1; } break;
      case 'ringTell': want = 0; if (e.modeT <= 0) bellRing(e); break;
      case 'ring': want = 0; if (e.modeT <= 0) { e.mode = 'fight'; e.modeT = 0.5; } break;
      case 'fight': { e.face = Math.sign(d) || e.face; want = ad > BELLMAN.swingAt - 4 && dy < 40 ? e.face * BELLMAN.walk : 0; e.ringAgain -= dt;
        if (e.ringAgain <= 0) { e.ringAgain = BELLMAN.reRing; ctx.sfx.priestBell(); ctx.noise(e.x, e.y, 120, 'bellman'); }
        else if (!P.dead && ad < BELLMAN.swingAt && dy < 20 && e.cd <= 0) { e.mode = 'swingTell'; e.modeT = BELLMAN.swingTell; e.cd = BELLMAN.cd; ctx.number(e.x, e.y - e.h - 12, '!', '#ffd36b'); ctx.sfx.charge(); }
        break; }
      case 'swingTell': want = 0; if (e.modeT <= 0) { e.mode = 'swing'; e.modeT = BELLMAN.swing; ctx.sfx.priestBell();
        if (!P.dead && Math.sign(d) === e.face && ad < BELLMAN.swingAt + 4 && dy < 22) { const res = ctx.damage(e.x, BELLMAN.swingDmg, { who: e, blow: 'THE HANDBELL' }); if (res === 'hit') P.vx = e.face * 140; } } break;
      case 'swing': want = 0; if (e.modeT <= 0) { e.mode = 'fight'; e.modeT = 0.4; } break;
    }
    if (e.stagger > 0) { want = 0; e.stagger -= dt; }
    e.vx = (e.vx || 0) + (want - (e.vx || 0)) * Math.min(1, dt * 8);
    const r = ctx.moveBody(e, e.vx * dt, e.vy * dt); if (r.ground) e.vy = 0;
    if (r.hitX && (e.mode === 'patrol')) { e.face = -e.face; }
  };
  function bellRing(e) { e.mode = 'ring'; e.modeT = BELLMAN.ring; e.rung = true; e.ringAgain = BELLMAN.reRing; H.n.rings++;
    ctx.sfx.priestBell(); ctx.sfx.tollBell(); ctx.shake(2); ctx.ring(e.x, e.y - 12, 30, '#ff9a5c', 0.5);
    ctx.noise(e.x, e.y, BELLMAN.ringR, 'bellman');
    const s = e.sec >= 0 ? e.sec : secOf(e.x); if (s >= 0) H.alarm(s, 'bellman');
    ctx.number(e.x, e.y - e.h - 22, 'THE BELLMAN RINGS: THE STREET WAKES', '#ff9a5c'); }
  /* his frame: 0/1 walk, 2 listen (the trumpet up), 3 ring (the bell up), 4 swing, 5 stunned */
  H.bellmanFrame = e => e.mode === 'look' || e.mode === 'heed' ? 2 : e.mode === 'ringTell' || e.mode === 'ring' ? 3 : e.mode === 'swing' || e.mode === 'swingTell' ? 4 : e.stagger > 0 ? 5 : Math.abs(e.vx || 0) > 4 ? Math.floor(e.anim * 5) % 2 : 0;

  /* ---------- THE GRANDMOTHER: her rules (her AI is main.js updateGrandmother) ---------- */
  const granBack = e => e.mode === 'turned';
  H.granOpen = e => e.mode === 'rap' || e.mode === 'turned';
  /* a hero's blow on her: the multiplier, or 0 (turned: the clank and the word are said here) */
  /* A PURSE AN OPENING (the minis' rule, src/boss-greed.js MINI_CAP, kept for her: one opening is never the whole fight): what her back or her rap
     can lose in one opening is GRAN.purse of her; the blow that empties it ends the opening - she knows where you are (her ward, told) */
  const purse = (e, dmg, k, frac) => { if (e.purseLeft === undefined) e.purseLeft = Math.max(1, Math.round(e.maxHp * (frac || GRAN.purse)));
    const d = Math.round(dmg * k); if (d < e.purseLeft) { e.purseLeft -= d; return k; }
    const out = e.purseLeft / Math.max(1, dmg); e.purseLeft = 0; e.modeT = 0; e.purseShut = true; return out; };
  H.granTake = (e, fromX, blow, dmg) => {
    /* (every HIT on her comes through here - a sword, a spell, a jet, a shot; a burn's tick does not, and what is on her is on her) */
    if (e.mode === 'sleep' || e.mode === 'wake') return 1;
    if (e.ward > 0 || e.purseShut) { ctx.turned(e, fromX, 'WARDED'); H.n.warded++; return 0; }
    if (e.mode === 'rap') { H.n.rapHits++; return purse(e, dmg || 1, GRAN.rapMul, GRAN.rapPurse); }   /* (her rap is the bonus opening: a smaller purse than her back) */
    const back = behindOf(e, fromX);
    if (!back) { ctx.turned(e, fromX, 'SHE HEARD YOU'); H.n.parried++; e.ear = fromX; e.earT = 1.6; e.parryAt = ctx.time(); e.burnBefore = e.burn || 0; if (e.mode === 'walk' && !(e.jabCd > 0)) e.jabNow = true; return 0; }   /* she heard the swing coming - her stick turns it, and comes back at your knuckles */
    if (granBack(e)) { H.n.backHits++; return purse(e, dmg || 1, GRAN.backMul); }
    H.n.backHits++; return 1;
  };
  /* A TURNED BLOW SETS NOTHING ALIGHT: what a parried hit's caller put on her (a pyro's flame) is taken off again (main.js updateGrandmother, each frame) */
  H.granUnburn = e => { if (e.parryAt !== undefined && ctx.time() - e.parryAt < 0.12 && (e.burn || 0) > (e.burnBefore || 0)) e.burn = e.burnBefore || 0; };
  /* an opening over (main.js granWard): the purse is full again for the next */
  H.granRefill = e => { e.purseLeft = undefined; e.purseShut = false; };
  /* a lure: she whirls to it and lashes - her back is yours. Only on her walk (a move once started is finished), never in her ward */
  H.granLure = (e, x, what) => {
    if (!e || !e.alive || e.mode !== 'walk' || e.ward > 0) return false;
    if (what === 'chime' && e.phase >= 3) return false;
    if (Math.abs(x - e.x) < GRAN.lureMin) return false;
    e.mode = 'lureTell'; e.modeT = GRAN.lureTell; e.lureX = x; e.face = Math.sign(x - e.x) || e.face; e.vx = 0; H.n.lures++;
    ctx.number(e.x, e.y - e.h - 14, '!', '#ffd36b'); ctx.sfx.snort(); return true;
  };
  /* THE ARENA: the bell-pulls and their chimes, the candles and the rugs */
  function updateArena(dt) {
    const e = ctx.boss(); const on = e && e.t === 'grandmother' && e.alive && ctx.bossActive();
    const hb = ctx.atkBox(), P = hero();
    for (const pr of propsOf('granpull')) { pr.cd = Math.max(0, (pr.cd || 0) - dt); pr.swing = Math.max(0, (pr.swing || 0) - dt); pr.jangle = on && e.phase >= 3;
      if (hb && !P.hitSet.has(pr) && ctx.overlap(hb, { l: pr.x - 5, r: pr.x + 5, t: pr.y - 30, b: pr.y })) { P.hitSet.add(pr); ctx.sfx.clank();
        if (pr.jangle) { ctx.number(pr.x, pr.y - 36, 'THE CHIMES ARE LOST IN THE BELL', '#9aa39a'); continue; }
        if (pr.cd > 0) continue;
        pr.cd = GRAN.pullCd; pr.swing = 1.2; ctx.sfx.mummerBell(); H.n.pulls++;
        ctx.ring(pr.chimeX, pr.chimeY, 14, '#fff6c8', 0.5); ctx.noise(pr.chimeX, ctx.L.arena ? ctx.L.arena.floor : pr.y, GRAN.chimeR, 'chime'); } }
    for (const c of propsOf('grancandle')) { if (c.fallen) c.burnT = Math.max(0, (c.burnT || 0) - dt); }
    for (const k of knells) { k.x += k.dir * GRAN.waveV * dt; k.life -= dt;
      if (!k.hit && !P.dead && P.ground && Math.abs(P.x - k.x) < 9 && Math.abs(P.y - k.y) < 10) { k.hit = true; ctx.damage(k.x, GRAN.waveDmg, { unblockable: true, name: 'THE KNELL' }); }
      if (Math.random() < dt * 30) ctx.part({ x: k.x, y: k.y - 1, vx: 0, vy: -30, life: 0.3, max: 0.3, col: '#f6f6ee', size: 1, grav: 60 }); }
    knells = knells.filter(k => k.life > 0 && k.x > (ctx.L.arena ? ctx.L.arena.x0 : 0) && k.x < (ctx.L.arena ? ctx.L.arena.x1 : 1e9));
  }
  /* PHASE TWO: she kicks the candles over and the rugs burn away - the quiet floor goes (more loud boards) */
  H.granKick = e => { for (const c of propsOf('grancandle')) { c.fallen = true; c.burnT = 1.6; }
    const lv = L(); for (const [x0, x1, row] of (lv.rugs || [])) for (let x = x0; x <= x1; x++) ctx.setTile(x, row, T.PLANK);
    ctx.number(e.x, e.y - e.h - 20, 'SHE KICKS THE CANDLES OVER', '#ff9a5c'); };
  /* PHASE THREE: the knell - a ring that runs along the boards both ways from her (jump it) */
  H.granKnell = e => { const f = ctx.L.arena.floor; knells.push({ x: e.x - 8, y: f, dir: -1, life: 3 }, { x: e.x + 8, y: f, dir: 1, life: 3 }); ctx.sfx.gtBell(); ctx.shake(3);
    once('knellTold', () => ctx.number(e.x, e.y - e.h - 22, 'THE KNELL: JUMP THE BOARDS', '#f6f6ee')); };
  H.granPhase3 = e => ctx.number(e.x, e.y - e.h - 22, 'SHE RINGS FOR THE VILLAGE', '#ff9a5c');
  H.rugAt = x => { const lv = L(); const tx = Math.floor(x / TS); return (lv.rugs || []).some(([x0, x1]) => tx >= x0 && tx <= x1) && !propsOf('grancandle').some(c => c.fallen); };

  H.update = dt => { if (!H.on()) return; updatePots(dt); updateStreets(dt); updateToll(dt); updateKeys(dt); updateArena(dt); };
  H.n = { breaks: 0, taken: 0, silent: 0, alarms: 0, caches: 0, rings: 0, tolls: 0, keyDown: 0, lures: 0, pulls: 0, parried: 0, warded: 0, backHits: 0, rapHits: 0 };
  H.secs = () => secs; H.knells = () => knells;

  /* ---------- DRAWING ---------- */
  const R = Math.round;
  function drawPotShape(g, x, y, kind) {
    if (kind === 'stone') { g.fillStyle = '#5a6070'; g.fillRect(x - 3, y - 5, 7, 5); g.fillStyle = '#8a919c'; g.fillRect(x - 2, y - 5, 4, 2); g.fillStyle = '#3a3e48'; g.fillRect(x - 3, y - 1, 7, 1); return; }
    g.fillStyle = '#7a4a26'; g.fillRect(x - 3, y - 6, 7, 6); g.fillRect(x - 2, y - 7, 5, 1); g.fillStyle = '#a8663a'; g.fillRect(x - 2, y - 5, 2, 3);
    g.fillStyle = '#5a3418'; g.fillRect(x - 2, y - 9, 5, 2); g.fillStyle = '#e0c49a'; g.fillRect(x - 1, y - 9, 3, 1); }
  /* THROWABLES ARE HIGHLIGHTED (A6, burnvillage2's rule): an outline a pixel out, a glint that sweeps it, the take-me ring in reach */
  function drawPot(g, pr, cx, cy, time) {
    const x = R(pr.x - cx), y = R(pr.y - cy);
    if (pr.state === 'rest') { g.save(); g.globalAlpha = 0.5 + 0.25 * Math.sin(time * 4 + pr.hx); g.fillStyle = '#fff1d0'; g.fillRect(x - 4, y - 8, 9, 9); g.fillRect(x - 3, y - 10, 7, 2); g.restore(); }
    drawPotShape(g, x, y, pr.kind);
    if (pr.state === 'rest') { const ph = (time * 0.55 + pr.hx * 0.013) % 1; if (ph < 0.22) { const gx = x - 4 + R(ph / 0.22 * 8), gy = y - 9 + R(ph / 0.22 * 6); g.fillStyle = '#ffffff'; g.fillRect(gx, gy, 1, 1); g.globalAlpha = 0.7; g.fillRect(gx - 1, gy, 3, 1); g.fillRect(gx, gy - 1, 1, 3); g.globalAlpha = 1; } }
    const P = hero();
    if (pr.state === 'rest' && !P.carry && Math.abs(pr.x - P.x) < 48 && Math.abs(pr.y - P.y) < 32) { g.globalAlpha = 0.3 + 0.2 * Math.sin(time * 5 + pr.hx); g.strokeStyle = '#fff1d0'; g.beginPath(); g.arc(x, y - 4, 9, 0, 7); g.stroke(); g.globalAlpha = 1; }
  }
  function drawStreetGate(g, pr, cx, cy, time) {   /* a goblin watch-gate's frame over the street: two posts, a beam, and the portcullis hung in it */
    const x = R(pr.col * TS + 8 - cx), top = R(pr.y0 * TS - cy), bot = R((pr.y1 + 1) * TS - cy); if (x < -30 || x > ctx.VW() + 30) return;
    g.fillStyle = '#3a2a1c'; g.fillRect(x - 11, top - 6, 3, bot - top + 6); g.fillRect(x + 9, top - 6, 3, bot - top + 6); g.fillStyle = '#5a4026'; g.fillRect(x - 13, top - 8, 27, 4);
    g.fillStyle = '#2a1e14'; for (let k = -10; k <= 10; k += 5) g.fillRect(x + k, top - 4, 1, 2);
    if (!pr.shut) { g.fillStyle = '#4a4a52'; g.fillRect(x - 7, top - 4, 15, 3); for (let k = -6; k <= 6; k += 3) { g.fillRect(x + k, top - 1, 1, 4); g.fillStyle = '#6a6a74'; g.fillRect(x + k, top + 3, 1, 1); g.fillStyle = '#4a4a52'; } }   /* the portcullis drawn up: its teeth over the street */
  }
  function drawAlarm(g, pr, cx, cy, time) {   /* the street's alarm bell on its post, and its lamps: one lights for every window lit in its street */
    const x = R(pr.x - cx), y = R(pr.y - cy); if (x < -30 || x > ctx.VW() + 30) return;
    g.fillStyle = '#3a2a1c'; g.fillRect(x - 1, y - 30, 3, 30); g.fillRect(x - 6, y - 30, 13, 2);
    const sw = pr.ringT > 0 ? R(Math.sin(time * 18) * 3) : 0;
    g.fillStyle = '#8a6a2a'; g.fillRect(x - 4 + sw, y - 27, 9, 7); g.fillStyle = '#c9a03a'; g.fillRect(x - 3 + sw, y - 27, 3, 6); g.fillStyle = '#3a2a1c'; g.fillRect(x + sw, y - 20, 1, 2);
    const s = secs[pr.sec], lit = s ? Math.min(ALARM.windows, litIn(pr.sec)) : 0;
    for (let k = 0; k < ALARM.windows; k++) { const on = (s && s.alarm) || k < lit; g.fillStyle = '#1b1626'; g.fillRect(x - 6 + k * 9, y - 14, 5, 6); g.fillStyle = on ? (Math.floor(time * 6) % 2 && s && s.alarm ? '#ff9a5c' : '#ffd36b') : '#2a3448'; g.fillRect(x - 5 + k * 9, y - 13, 3, 4); }
  }
  function drawCache(g, pr, cx, cy, time) {   /* a strongbox with a lantern on its lid: dark = the street is still asleep, amber = barred */
    const x = R(pr.x - cx), y = R(pr.y - cy); if (x < -30 || x > ctx.VW() + 30) return;
    const open = pr.state === 'open', barred = pr.state === 'barred';
    g.fillStyle = '#1b1626'; g.fillRect(x - 8, y - 9, 16, 9); g.fillStyle = '#4a3222'; g.fillRect(x - 7, y - 8, 14, 7); g.fillStyle = '#8a919c'; g.fillRect(x - 7, y - 6, 14, 1); g.fillRect(x - 1, y - 8, 2, 7);
    if (open) { g.fillStyle = '#4a3222'; g.fillRect(x - 7, y - 14, 14, 3); g.fillStyle = '#dfe8ff'; g.globalAlpha = 0.4 + 0.3 * Math.sin(time * 5); g.fillRect(x - 5, y - 10, 10, 2); g.globalAlpha = 1; }
    else { g.fillStyle = '#5a3a22'; g.fillRect(x - 8, y - 11, 16, 3); }
    if (barred) { g.fillStyle = '#6a6a74'; g.fillRect(x - 9, y - 6, 18, 2); }
    g.fillStyle = '#2a2434'; g.fillRect(x + 3, y - 19, 5, 7); g.fillStyle = barred ? '#ffd36b' : open ? '#dfe8ff' : '#3a4a68'; g.fillRect(x + 4, y - 18, 3, 5);
    if (barred) { g.globalAlpha = 0.18 + 0.08 * Math.sin(time * 9); g.fillStyle = '#ffd36b'; g.beginPath(); g.arc(x + 5, y - 15, 9, 0, 7); g.fill(); g.globalAlpha = 1; }
  }
  function drawTollBell(g, b, cx, cy, time) {
    const x = R(b.x - cx), y = R(b.y - cy); if (x < -60 || x > ctx.VW() + 60) return;
    const ph = (b.clk || 0) % TOLL.every, back = b.tell ? -Math.min(1, (ph - (TOLL.every - TOLL.tell)) / TOLL.tell) * 5 : b.on ? Math.sin(time * 9) * 5 * (1 - ph / TOLL.len) : 0;
    g.fillStyle = '#3a2a1c'; g.fillRect(x - 10, y - 30, 21, 3); g.fillRect(x - 10, y - 30, 2, 30); g.fillRect(x + 9, y - 30, 2, 30);
    g.save(); g.translate(x, y - 27); g.rotate(back * 0.06); g.fillStyle = '#8a6a2a'; g.fillRect(-6, 2, 12, 10); g.fillRect(-7, 11, 14, 3); g.fillStyle = '#c9a03a'; g.fillRect(-5, 3, 3, 8); g.fillStyle = '#3a2a1c'; g.fillRect(0, 13, 1, 3); g.restore();
    g.fillStyle = '#c9b27c'; g.fillRect(x + 6, y - 16, 1, 16 + (b.tell ? R(Math.sin(time * 20) * 2) + 2 : 0));   /* the rope - it jerks before she swings */
  }
  function drawNail(g, n, cx, cy, time) {
    const x = R(n.x - cx), y = R(n.y - cy); g.fillStyle = '#8a919c'; g.fillRect(x - 1, y - 1, 3, 2); g.fillStyle = '#3a3e48'; g.fillRect(x, y + 1, 1, 2);
    if (!n.down) { g.globalAlpha = 0.25 + 0.2 * Math.sin(time * 5); g.strokeStyle = '#ffd36b'; g.beginPath(); g.arc(x, y + 6, 10, 0, 7); g.stroke(); g.globalAlpha = 1; } }
  function drawPull(g, pr, cx, cy, time) {   /* a bell-pull cord from the beam, the line of it along the beam, and the chime it rings at the far end */
    const x = R(pr.x - cx), y = R(pr.y - cy), bx = R(pr.chimeX - cx), by = R(pr.beamY - cy), cyy = R(pr.chimeY - cy);
    g.strokeStyle = '#8a7350'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 0.5, by); g.lineTo(x + 0.5, y - 14); g.stroke();
    g.globalAlpha = 0.6; g.beginPath(); g.moveTo(x + 0.5, by + 0.5); g.lineTo(bx + 0.5, by + 0.5); g.stroke(); g.globalAlpha = 1;
    g.fillStyle = pr.cd > 0 ? '#5a4a3a' : '#c9463d'; g.fillRect(x - 2, y - 16, 5, 6);   /* the tassel: red when it will ring */
    const sw = (pr.swing > 0 || pr.jangle) ? Math.sin(time * 20) * 3 : 0;
    g.strokeStyle = '#8a7350'; g.beginPath(); g.moveTo(bx + 0.5, by); g.lineTo(bx + 0.5 + sw, cyy - 8); g.stroke();
    for (let k = -1; k <= 1; k++) { g.fillStyle = '#c9b27c'; g.fillRect(bx + k * 4 + R(sw), cyy - 8, 2, 7 + Math.abs(k) * 2); }
    g.fillStyle = '#e8dcc0'; g.fillRect(bx - 1 + R(sw), cyy - 9, 3, 1);
  }
  function drawCandle(g, c, cx, cy, time) { const x = R(c.x - cx), y = R(c.y - cy);
    if (!c.fallen) { g.fillStyle = '#e8dcc0'; g.fillRect(x - 1, y - 7, 3, 7); g.fillStyle = Math.floor(time * 9 + c.x) % 2 ? '#ffd36b' : '#ff9a5c'; g.fillRect(x, y - 10, 1, 3);
      g.globalAlpha = 0.12; g.fillStyle = '#ffd36b'; g.beginPath(); g.arc(x, y - 9, 10, 0, 7); g.fill(); g.globalAlpha = 1; }
    else { g.fillStyle = '#e8dcc0'; g.fillRect(x - 3, y - 2, 7, 2); if (c.burnT > 0) { g.fillStyle = Math.floor(time * 14) % 2 ? '#ff9a5c' : '#ffd36b'; for (let k = 0; k < 6; k++) g.fillRect(x - 8 + k * 3, y - 2 - (k % 2), 2, 2); } } }
  /* HER RUGS: a woven runner laid over the boards (the quiet floor) - and after the candles, a charred stripe and its ash */
  function drawRugs(g, cx, cy, time) {
    const lv = L(), burnt = propsOf('grancandle').some(c => c.fallen);
    for (const [x0, x1, row] of (lv.rugs || [])) { const x = R(x0 * TS - cx), w = (x1 - x0 + 1) * TS, y = R(row * TS - cy); if (x > ctx.VW() || x + w < 0) continue;
      if (burnt) { g.fillStyle = '#5c4a2c'; g.fillRect(x, y, w, 3); g.fillStyle = '#1b1414'; for (let q = 1; q < w - 1; q += 4) g.fillRect(x + q, y, 2 + (q % 3), 2); g.fillStyle = '#3a2e2a'; for (let q = 3; q < w; q += 7) g.fillRect(x + q, y - 1, 2, 1); continue; }
      g.fillStyle = '#1b1626'; g.fillRect(x, y - 1, w, 5); g.fillStyle = '#7a2e2a'; g.fillRect(x + 1, y - 1, w - 2, 4); g.fillStyle = '#a8443a'; g.fillRect(x + 1, y - 1, w - 2, 1);
      g.fillStyle = '#c9a03a'; for (let q = 4; q < w - 4; q += 6) { g.fillRect(x + q, y, 2, 1); g.fillRect(x + q + 1, y + 1, 1, 1); } g.fillStyle = '#e8dcc0'; for (let q = 0; q < w; q += 3) { g.fillRect(x + q, y + 3, 1, 1); } } }
  /* HER COTTAGE (the room the fight is in): a plaster wall between timber posts, the beam her bell-pulls run along, the thatch's underside, one window
     with the moon in it, a hearth, shelves of jars and herbs hung to dry - dark, so everything that moves reads against it */
  function drawCottage(g, cx, cy, time) {
    const A = L().arena; if (!A || A.boss !== 'grandmother') return;
    const x0 = R(A.x0 - 24 - cx), x1 = R(A.x1 + 24 - cx), top = R((A.floor / TS - 12) * TS - cy), floor = R(A.floor - cy), beam = R((A.floor / TS - 7) * TS - cy);
    if (x1 < 0 || x0 > ctx.VW()) return;
    g.fillStyle = '#231f29'; g.fillRect(x0, top, x1 - x0, floor - top);
    g.fillStyle = '#2b2632'; for (let y = top + 6; y < floor; y += 9) for (let x = x0 + ((y >> 3) % 2) * 7; x < x1; x += 14) g.fillRect(x, y, 6, 1);   /* the plaster's daub */
    g.fillStyle = '#3a2a1c'; for (let x = x0 + 8; x < x1; x += 72) { g.fillRect(x, top, 5, floor - top); g.fillStyle = '#4a3624'; g.fillRect(x, top, 1, floor - top); g.fillStyle = '#3a2a1c'; }   /* the posts */
    g.fillStyle = '#4a3422'; g.fillRect(x0, beam - 2, x1 - x0, 6); g.fillStyle = '#5c4430'; g.fillRect(x0, beam - 2, x1 - x0, 1); g.fillStyle = '#2a1e14'; g.fillRect(x0, beam + 4, x1 - x0, 1);   /* the beam */
    g.fillStyle = '#3a3020'; g.fillRect(x0, top - 8, x1 - x0, 8); g.fillStyle = '#5c4a2c'; for (let x = x0; x < x1; x += 3) g.fillRect(x, top - 1 - ((x * 7) % 5), 1, 2 + ((x * 3) % 4));   /* the thatch from under */
    const wx = R((A.x0 + A.x1) / 2 - 40 - cx), wy = beam - 34;   /* the window */
    g.fillStyle = '#1b1626'; g.fillRect(wx - 1, wy - 1, 26, 22); g.fillStyle = '#34405e'; g.fillRect(wx, wy, 24, 20); g.fillStyle = '#c9d1dc'; g.beginPath(); g.arc(wx + 16, wy + 7, 4, 0, 7); g.fill();
    g.fillStyle = '#3a2a1c'; g.fillRect(wx + 11, wy, 2, 20); g.fillRect(wx, wy + 9, 24, 2);
    g.globalAlpha = 0.07; g.fillStyle = '#c9d1dc'; g.beginPath(); g.moveTo(wx, wy + 20); g.lineTo(wx + 24, wy + 20); g.lineTo(wx + 44, floor); g.lineTo(wx - 10, floor); g.fill(); g.globalAlpha = 1;   /* moonlight on the floor */
    for (const sx of [x0 + 60, x1 - 120]) { g.fillStyle = '#4a3422'; g.fillRect(sx, beam - 18, 40, 2); for (let k = 0; k < 5; k++) { g.fillStyle = ['#5a4a6a', '#6a5a3a', '#4a6a5a', '#7a4a3a', '#5a5a6a'][k]; g.fillRect(sx + 3 + k * 7, beam - 24 + (k % 2), 5, 6 - (k % 2)); } }   /* shelves of jars */
    for (let k = 0; k < 9; k++) { const hx = x0 + 120 + k * 58; if (hx > x1 - 20) break; const sw = Math.sin(time * 1.3 + k) * 0.6; g.fillStyle = '#4a5a3a'; g.fillRect(R(hx + sw), beam + 5, 2, 7 + (k % 3)); g.fillStyle = '#6a7a4a'; g.fillRect(R(hx - 1 + sw), beam + 9 + (k % 3), 4, 2); }   /* herbs hung to dry */
    const hx = R(A.x1 - 70 - cx), lit = !propsOf('grancandle').some(c => c.fallen);   /* the hearth */
    g.fillStyle = '#3a3640'; g.fillRect(hx - 18, floor - 30, 36, 30); g.fillStyle = '#16121a'; g.fillRect(hx - 11, floor - 18, 22, 18);
    g.fillStyle = Math.floor(time * 8) % 2 ? '#ff9a5c' : '#c9463d'; g.fillRect(hx - 6, floor - 5, 12, 3); g.globalAlpha = lit ? 0.1 : 0.2; g.fillStyle = '#ff9a5c'; g.beginPath(); g.arc(hx, floor - 6, 26, 0, 7); g.fill(); g.globalAlpha = 1;
  }
  /* THE SNEAK MARK and THE BELLMAN'S EAR: what a quiet player reads */
  function drawReads(g, cx, cy, time) {
    const P = hero(), t = sneakTarget();
    if (t) { const x = R(t.x - cx), y = R(t.y - t.h - cy) - 10; g.fillStyle = '#bfe6f5'; g.globalAlpha = 0.6 + 0.3 * Math.sin(time * 8); g.fillRect(x, y - 6, 1, 7); g.fillRect(x - 2, y - 1, 5, 1); g.fillRect(x - 1, y + 1, 3, 2); g.globalAlpha = 1; }
    for (const e of ctx.enemies()) { if (!e.alive || e.t !== 'bellman' || Math.abs(e.x - P.x) > 220) continue; const x = R(e.x - cx), y = R(e.y - cy);
      if (!e.rung) { g.globalAlpha = 0.22; g.strokeStyle = '#d8e070'; g.setLineDash && g.setLineDash([2, 3]); g.beginPath(); g.ellipse(x, y - 2, BELLMAN.ear, BELLMAN.ear * 0.3, 0, 0, 7); g.stroke(); g.setLineDash && g.setLineDash([]); g.globalAlpha = 1; }
      if (e.emoteT > 0 && (e.mode === 'heed' || e.mode === 'go')) { g.fillStyle = '#d8e070'; g.fillRect(x - 1, y - e.h - 14, 3, 1); g.fillRect(x + 1, y - e.h - 13, 1, 2); g.fillRect(x, y - e.h - 11, 1, 1); g.fillRect(x, y - e.h - 9, 1, 1); } }
    for (const w of waves) { const k = w.t / 1.6, x = R(w.x - cx), y = R(w.y - cy); g.globalAlpha = (1 - k) * 0.6; g.strokeStyle = '#f6f6ee'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y, 30 + k * 260, (30 + k * 260) * 0.3, 0, 0, 7); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1; }
    for (const k of knells) { const x = R(k.x - cx), y = R(k.y - cy); g.fillStyle = '#f6f6ee'; g.globalAlpha = 0.85; g.fillRect(x - 3, y - 6, 6, 6); g.fillRect(x - 5, y - 3, 10, 3); g.globalAlpha = 1; }
    /* a carried pot's told arc: where it breaks */
    if (P.carry && P.carry.t === 'npot' && !P.dead) CTW.drawArc(g, H.potArc(P.carry), cx, cy, time, '#fff1d0');
  }
  /* the Grandmother's read (B10): OPEN = the gold ring at her feet and a gold bar over her running out; WARDED = a pale shell and its bar;
     and her EAR: a faint line from her head to where she last heard you (the bearing her sweep will take) */
  H.drawGran = (g, e, cx, cy, time) => {
    const x = R(e.x - cx), y = R(e.y - cy), pul = 0.5 + 0.5 * Math.sin(time * 10);
    if (e.mode !== 'sleep' && e.ear !== undefined && e.earT > 0) { g.globalAlpha = 0.25 * Math.min(1, e.earT); g.strokeStyle = '#f6f6ee'; g.setLineDash && g.setLineDash([3, 3]); g.beginPath(); g.moveTo(x, y - 34); g.lineTo(R(e.ear - cx), y - 4); g.stroke(); g.setLineDash && g.setLineDash([]); g.globalAlpha = 1;
      g.fillStyle = '#f6f6ee'; g.globalAlpha = 0.5 * Math.min(1, e.earT); g.fillRect(R(e.ear - cx) - 2, y - 2, 5, 1); g.globalAlpha = 1; }
    const open = H.granOpen(e), k = e.mode === 'turned' ? Math.max(0, e.modeT / GRAN.back) : e.mode === 'rap' ? Math.max(0, e.modeT / (e.rapLen || 3)) : 0;
    if (open) { g.globalAlpha = 0.5 + 0.35 * pul; g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y - 1, 18 + pul * 2, 5, 0, 0, 7); g.stroke(); g.lineWidth = 1; g.globalAlpha = 1;
      if (e.mode === 'turned') { const bx = x - (e.face || 1) * 10; g.fillStyle = '#ffd36b'; g.globalAlpha = 0.6 + 0.3 * pul; g.fillRect(bx - 1, y - 30, 3, 14); g.globalAlpha = 1; }   /* the back: a gold mark on it */
      g.fillStyle = '#1b1626'; g.fillRect(x - 21, y - 58, 42, 5); g.fillStyle = '#ffd36b'; g.fillRect(x - 20, y - 57, R(40 * k), 3); }
    else if (e.ward > 0) { g.globalAlpha = 0.28 + 0.15 * pul; g.strokeStyle = '#dfe8ff'; g.beginPath(); g.ellipse(x, y - 20, 16, 24, 0, 0, 7); g.stroke(); g.globalAlpha = 0.1; g.fillStyle = '#dfe8ff'; g.fill(); g.globalAlpha = 1;
      g.fillStyle = '#1b1626'; g.fillRect(x - 21, y - 58, 42, 5); g.fillStyle = '#dfe8ff'; g.fillRect(x - 20, y - 57, R(40 * Math.min(1, e.ward / GRAN.ward)), 3); }
  };
  /* drawn in the world, under the creatures */
  H.drawWorld = (g, cx, cy, time) => {
    if (!H.on()) return;
    drawCottage(g, cx, cy, time); drawRugs(g, cx, cy, time);
    for (const pr of ctx.props()) {
      if (pr.t === 'npot' && pr.state !== 'return') drawPot(g, pr, cx, cy, time);
      else if (pr.t === 'streetgate') drawStreetGate(g, pr, cx, cy, time);
      else if (pr.t === 'alarm') drawAlarm(g, pr, cx, cy, time);
      else if (pr.t === 'darkcache') drawCache(g, pr, cx, cy, time);
      else if (pr.t === 'tollbell') drawTollBell(g, pr, cx, cy, time);
      else if (pr.t === 'keynail') drawNail(g, pr, cx, cy, time);
      else if (pr.t === 'granpull') drawPull(g, pr, cx, cy, time);
      else if (pr.t === 'grancandle') drawCandle(g, pr, cx, cy, time);
    }
  };
  /* drawn over the world (main.js drawHush): the reads */
  H.drawOver = (g, cx, cy, time) => { if (H.on()) drawReads(g, cx, cy, time); };
  /* THE WALKER'S HANDS (tools/level-walk.mjs via src/walk-hints.js): where a player goes for the required throw, and what he presses there */
  H.walkHint = P => {
    if (!H.on() || !P || P.dead) return null; const n = propsOf('keynail').find(q => q.key && !q.key.got); if (!n) return null;
    const k = n.key, roofY = k.floorY;
    if (n.down) return k.falling ? { x: P.x, y: P.y, key: null, hold: true, r: 14 } : { x: k.x, y: roofY, key: null, face: 0, r: 14 };
    if (Math.abs(P.y - roofY) > 2 * TS || P.x < n.x - 40 * TS || P.x > n.x + 8 * TS) return null;
    if (P.carry && P.carry.t === 'npot') return { x: n.x - 72, y: roofY, key: 'atk', up: true, face: 1, r: 14 };
    const pot = propsOf('npot').filter(q => q.state === 'rest' && Math.abs(q.y - roofY) < TS).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
    return pot ? { x: pot.x, y: pot.y, key: 'talk', face: 0, r: 14 } : { x: P.x, y: P.y, key: null, hold: true, r: 14 };
  };
  /* what the shared stuck guide may glint (its route list names them by type and place) */
  H.read = () => ({ secs: secs.map(s => ({ x0: s.x0, x1: s.x1, alarm: s.alarm, why: s.why, lit: litIn(s.i) })), n: { ...H.n }, knells: knells.length,
    caches: propsOf('darkcache').map(c => ({ x: c.x, sec: c.sec, state: c.state })), gates: propsOf('streetgate').map(p => ({ col: p.col, shut: !!p.shut })),
    nails: propsOf('keynail').map(n => ({ x: n.x, y: n.y, down: n.down, key: n.key ? { x: n.key.x, y: n.key.y, hung: !!n.key.hung, got: !!n.key.got } : null })),
    pots: propsOf('npot').map(p => ({ x: p.x, y: p.y, state: p.state })), tolls: propsOf('tollbell').map(b => ({ on: !!b.on, tell: !!b.tell })) });
  return H;
}
