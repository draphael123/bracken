// tools/gq2-lab.mjs - THE GOBLIN QUEEN 3 IN THE BOSS LAB, THE NODE HALF (claude/gq2). No page, no browser. The harness a tune lane needs for
// `node tools/boss-rates.mjs crown --seeds=6 --ways=built --heroes=knight,warden,geomancer,ranger,berserker,pyro,paladin,pirate,reaper` (browser; owed):
//   SKIP     gqueen-hands H.skipRoof: from the escape -> shrine lit (checkpoint + persist 'roof') -> the tower top at her second bar; refused in the hall
//   RETRY    a death on the tower top puts her back in the escape with the shrine already lit (P2 is retried from the roof, P1 never again)
//   CLOCKS   src/lab-gqueen.js: stage clocks (p1 / escape / p2), stuns counted, 'skip' goes straight up, a played escape that stalls GQ_ESC_STALL s is skipped + flagged 'stall'
//   WIRING   src/lab.js calls gqLabStep in bossLab's loop and puts `gq` on the row; tools/boss-run.mjs prints it and never runs her row under 360 s
//   CO-OP    two seats with main.js's asPlayer swap (ctx.eachHero / allHeroes / target): crown + shards meet the nearer seat, the flee heals the party, the fire ticks each, the portal takes all, the lash hits all
//   PARRY    src/lab.js parryAt: EVERY hero in src/hero-roster.js HERO_IDS has a parry hand for her crown / shards (no hero is left with only a roll), keyed on time-to-impact
//   node tools/gq2-lab.mjs
import { readFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rd = f => readFileSync(path.join(ROOT, f), 'utf8');
const imp = f => import(pathToFileURL(path.join(ROOT, f)).href);
let fails = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };

const { LEVELS, T } = await imp('src/level.js');
const { makeGQueenHands, GQ3 } = await imp('src/gqueen-hands.js');
const { gqLabState, gqLabStep, gqLabRow, GQ_ESC_STALL } = await imp('src/lab-gqueen.js');
/* the fake world (the same shape as tools/gqueen3.mjs's: main.js's ctx, stubbed) */
const make = () => {
  const Lw = LEVELS.find(l => l.id === 'crown').build(), W = Lw.W;
  const st = { time: 0, parries: 0, dmg: [], called: [], active: true, spawned: [], checkpoint: null };
  const P = { x: 9150, y: 320, hp: 50, maxHp: 100, st: 5, maxSt: 20, flasks: 0, dead: false, ground: true, vy: 0, vx: 0, face: 1, inv: 0 };
  const e = { t: 'gqueen', alive: true, x: 9300, y: 320, w: 68, h: 52, hp: 2400, maxHp: 2400, mode: 'stand', modeT: 0, face: -1, phase: 1, anim: 0, vx: 0, vy: 0, crownCd: 99, portalCd: 99 };
  const noop = () => {};
  const ctx = { L: Lw, TS: 16, T, sfx: new Proxy({}, { get: () => noop }), P: () => P, boss: () => e, bossActive: () => st.active, enemies: () => [e], props: () => [], time: () => st.time,
    number: noop, burst: noop, dust: noop, part: noop, shake: noop, zoom: noop, ring: noop,
    damage: (x, d, o) => { st.dmg.push({ x, d, o: o || {} }); return 'hit'; }, parries: () => st.parries,
    hurt: (en, d) => { en.hp -= d; if (en.hp <= 0) H.spare(en); }, solid: (tx, ty) => Lw.grid[ty * W + tx] === T.SOLID, overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t,
    hurtBox: () => ({ l: P.x - 5, r: P.x + 5, t: P.y - 14, b: P.y }),
    endFight: () => { st.active = false; st.called.push('endFight'); }, shutWest: () => st.called.push('shutWest'), layEscape: () => st.called.push('layEscape'), tiles: noop,
    spawnEnt: o => st.spawned.push(o), setCheckpoint: (x, y) => { st.checkpoint = { x, y }; }, flaskMax: () => 3, music: noop, hint: noop,
    enterRoof: () => { Object.assign(Lw.arena, Lw.arenaRoof); st.called.push('enterRoof'); }, wave: noop, ducking: () => false };
  const H = makeGQueenHands(ctx); H.load(); H.reset();
  /* main.js's frame order (l.28814): GQH.step first; only when it does not take the frame does updateGQueen count modeT down, tick and ask her mode */
  const step = (n, dt = 1 / 60) => { for (let i = 0; i < n; i++) { st.time += dt; if (!(H.step(e, dt))) { e.modeT -= dt; e.anim += dt; H.tick(e, dt); const w = e.stage === 'roof' ? H.roofStep(e, dt) : H.mode(e, dt); if (w !== undefined) e.vx = 0; } H.update(dt); } };
  const BK = { P, gqStage: () => H.stage(), gqHands: () => H, SET: { speed: 1 } };
  return { H, st, P, e, step, Lw, BK };
};
const toEscape = w => { w.e.hp = 0; w.H.spare(w.e); w.step(60 * 2); };

console.log('== SKIP (gqueen-hands H.skipRoof)');
{ const w = make();
  ok(w.H.skipRoof() === false && w.e.stage !== 'roof', 'refused in her hall (P1 is never skipped)');
  toEscape(w); ok(w.e.stage === 'escape', 'the flee -> the escape');
  const r = w.H.skipRoof(), E = w.Lw.gqEscape, RA = w.Lw.arenaRoof;
  ok(r === true && w.e.stage === 'roof' && w.e.hp === GQ3.hp2 && !w.e.hidden, 'from the escape: the tower top, her second bar (' + w.e.hp + ')');
  ok(w.st.called.includes('enterRoof'), 'the arena becomes the tower top (enterRoof: bossStart, walls, music)');
  ok(w.st.checkpoint && w.st.checkpoint.x === E.check.x * 16 + 8 && w.H.persist().stage === 'roof', 'the roof shrine is lit on the way (checkpoint + persist roof)');
  ok(Math.abs(w.P.x - (RA.exit.x * 16 + 8)) < 2, 'the hero is set down at the island portal exit');
  console.log('== RETRY (a death on the tower top)');
  w.e.stage = undefined; w.e.hidden = false; w.e.mode = 'sleep'; w.H.reset();
  ok(w.e.stage === 'escape' && w.e.hidden && w.H.read().esc && w.H.read().esc.checked === true, 'reset: back in the escape with the shrine lit (P2 retried from the roof, never P1)');
  ok(w.H.skipRoof() === true && w.e.hp === GQ3.hp2, 'and the tower top starts again at her full second bar');
}

console.log('== CLOCKS (src/lab-gqueen.js)');
{ const w = make(), S = gqLabState(), spf = 1 / 60; let f = 0;
  const run = (n, mode) => { for (let i = 0; i < n; i++, f++) { gqLabStep(w.BK, w.e, f, S, mode, spf); w.step(1); } };
  run(60 * 10, 'play');
  w.e.mode = 'stunned'; run(1, 'play'); w.e.mode = 'stand'; run(1, 'play'); w.e.mode = 'stunned'; run(1, 'play');
  ok(S.stuns === 2 && S.stage === 'hall', 'stuns are counted per stun (2), the stage is the hall');
  w.e.hp = 0; w.H.spare(w.e); run(60 * 3, 'play');
  ok(S.stage === 'escape' && S.hallF !== null && S.escF !== null && S.escHp0 === 100, 'the flee starts the escape clock (the hero arrives at ' + S.escHp0 + '%: fully healed)');
  run(Math.round(60 * (GQ_ESC_STALL - 5)), 'play'); ok(S.stage === 'escape' && S.skip === null, 'a played escape is left to the climbing bot for ' + GQ_ESC_STALL + ' s');
  run(60 * 6, 'play'); ok(S.stage === 'roof' && S.skip === 'stall' && w.e.stage === 'roof', 'a stalled escape is skipped to the tower top and flagged stall');
  run(60 * 5, 'play'); w.e.hp = 400;
  const row = gqLabRow(S, w.e, f, spf);
  ok(row.stage === 'roof' && row.stuns === 2 && row.skip === 'stall', 'the row: stage, stuns, skip (' + JSON.stringify(row) + ')');
  ok(Math.abs(row.p1Secs - 10) < 0.2 && Math.abs(row.escSecs - GQ_ESC_STALL) < 2 && row.p2Secs > 5 && Math.abs(row.p1Secs + GQ3.flee.tell + row.escSecs + row.p2Secs - f * spf) < 0.3, 'the row adds up to the whole row (her flee tell between): p1 ' + row.p1Secs + ' s, escape ' + row.escSecs + ' s, p2 ' + row.p2Secs + ' s');
  ok(row.barLeft === 25, 'barLeft is the CURRENT bar (P2: 400 of ' + GQ3.hp2 + ' = ' + row.barLeft + '%)');
  w.e.alive = false; ok(gqLabRow(S, w.e, f, spf).stage === 'won' && gqLabRow(S, w.e, f, spf).barLeft === 0, 'a dead queen reads won, bar 0');
}
{ const w = make(), S = gqLabState(); let f = 0;
  w.e.hp = 0; w.H.spare(w.e);
  for (let i = 0; i < 60 * 3 && S.stage !== 'roof'; i++, f++) { gqLabStep(w.BK, w.e, f, S, 'skip', 1 / 60); w.step(1); }
  ok(S.stage === 'roof' && S.skip === 'skip' && f < 60 * 2.5, "'skip' goes to the tower top on the escape's first frame (" + f + ' frames, the 1.6 s flee first)');
}

console.log('== WIRING (src/lab.js, tools/boss-run.mjs)');
{ const lab = rd('src/lab.js'), run = rd('tools/boss-run.mjs');
  ok(/import \{ gqLabState, gqLabStep, gqLabRow \} from '\.\/lab-gqueen\.js'/.test(lab), 'lab.js imports the stage clocks');
  const loop = lab.indexOf("for (; f < maxF && boss.alive && (!normalHealth || !P.dead); f++) { let owlDuck = false;");
  ok(loop > 0 && /const GQS = boss\.t === 'gqueen' \? gqLabState\(\)/.test(lab.slice(loop - 400, loop)) && /if \(GQS\) gqLabStep\(/.test(lab.slice(loop, loop + 400)), 'bossLab steps them every frame of the row, before the hands');
  ok(/\.\.\.\(GQS \? \{ gq: gqLabRow\(GQS, boss, f, gqSpf\) \} : \{\}\)/.test(lab), 'the row carries gq');
  ok(/gq:r\.gq\|\|null/.test(run) && /x\.gq \? ' gq '/.test(run), 'boss-run returns and prints gq');
  const { ROW_MIN_SECS } = await imp('tools/boss-run.mjs'); ok(ROW_MIN_SECS.crown >= 300, 'her row never runs under ' + ROW_MIN_SECS.crown + ' s (P1 + escape + P2)');
  ok(/Math\.max\(secs, ROW_MIN_SECS\[id\] \|\| 0\)/.test(run), 'and the clock is applied to maxSecs');
  ok(/stage === 'escape'\) return gqEscapeBot/.test(lab), 'the played escape is the climbing bot (gqEscapeBot)');
}

console.log('== PARRY (every hero has a parry hand)');
{ const { HERO_IDS } = await imp('src/hero-roster.js'), LAB = await imp('src/lab.js');
  for (const h of HERO_IDS) {
    const P = { x: 100, y: 200, face: 1, cWas: false, dead: false, swim: false }, keys = {};
    const BK = { P, keys, ward: () => ({ ready: true, up: false, wet: false }) };
    const handled = LAB.parryAt(BK, h, 0.5), early = !!keys.block;
    LAB.parryAt(BK, h, 0.03); const late = !!keys.block;
    ok(handled && !early && late, h + ': a parry hand, C held back at 0.5 s to impact and pressed at 0.03 s');
  }
  const P = { x: 100, y: 200, face: 1 }, keys = {}, BK = { P, keys, ward: () => null };
  const q = { id: 1, x: 300, y: 191, vx: -230, vy: 0, kind: 'crown', home: false };
  ok(LAB.parryShot(BK, 'knight', q, true) === true && P.face === 1, 'parryShot faces the hero at the crown coming in');
  ok(LAB.parryShot(BK, 'knight', { ...q, vx: 230 }, true) === false, 'a crown flying away is not parried');
  ok(LAB.parryShot(BK, 'knight', { ...q, home: true }, true) === false, 'a crown already going home is left alone');
}

console.log('== CO-OP (1-4 seats: every hero is tested, as main.js asPlayer does)');
{ /* two seats: ctx.P() is whoever's call it is (main.js's global P, swapped by eachHero / allHeroes); the boss's own frame means the nearer */
  const Lw = LEVELS.find(l => l.id === 'crown').build(), W = Lw.W, noop = () => {};
  const mk = (x, hp) => ({ x, y: 320, hp, maxHp: 100, st: 5, maxSt: 20, flasks: 0, dead: false, ground: true, vy: 0, vx: 0, face: 1, inv: 0 });
  const A = mk(8900, 40), B = mk(9150, 30), seatsL = [A, B]; let cur = A;
  const st = { time: 0, parries: 0, mode: 'hit', dmg: [], called: [], active: true, spawned: [], checkpoint: null, flask: { a: 3, b: 5 } };
  const e = { t: 'gqueen', alive: true, x: 9300, y: 320, w: 68, h: 52, hp: 2400, maxHp: 2400, mode: 'stand', modeT: 0, face: -1, phase: 1, anim: 0, vx: 0, vy: 0, crownCd: 99, portalCd: 99 };
  const swap = (p, fn) => { const w = cur; cur = p; try { return fn(p); } finally { cur = w; } };
  const ctx = { L: Lw, TS: 16, T, sfx: new Proxy({}, { get: () => noop }), P: () => cur, boss: () => e, bossActive: () => st.active, enemies: () => [e], props: () => [], time: () => st.time,
    number: noop, burst: noop, dust: noop, part: noop, shake: noop, zoom: noop, ring: noop,
    damage: (x, d, o) => { st.dmg.push({ who: cur === A ? 'A' : 'B', d, o: o || {} }); if (st.mode === 'parry') st.parries++; return st.mode === 'hit' ? 'hit' : 'blocked'; }, parries: () => st.parries,
    hurt: (en, d) => { en.hp -= d; if (en.hp <= 0) H.spare(en); }, solid: (tx, ty) => Lw.grid[ty * W + tx] === T.SOLID, overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t,
    hurtBox: () => ({ l: cur.x - 5, r: cur.x + 5, t: cur.y - 14, b: cur.y }),
    endFight: () => { st.active = false; }, shutWest: noop, layEscape: noop, tiles: noop, spawnEnt: o => st.spawned.push(o), setCheckpoint: (x, y) => { st.checkpoint = { x, y }; },
    flaskMax: () => (cur === A ? st.flask.a : st.flask.b), music: noop, hint: noop, enterRoof: () => { Object.assign(Lw.arena, Lw.arenaRoof); st.called.push('enterRoof'); }, wave: noop, ducking: () => false,
    eachHero: fn => { for (const p of seatsL) if (!p.dead) swap(p, fn); }, allHeroes: fn => { for (const p of seatsL) swap(p, fn); }, target: () => B };
  const H = makeGQueenHands(ctx); H.load(); H.reset();
  const step = (n, dt = 1 / 60) => { for (let i = 0; i < n; i++) { st.time += dt; cur = B; if (!(H.step(e, dt))) { e.modeT -= dt; e.anim += dt; H.tick(e, dt); const w = e.stage === 'roof' ? H.roofStep(e, dt) : H.mode(e, dt); if (w !== undefined) e.vx = 0; } cur = A; H.update(dt); } };
  /* the crown is thrown at seat two (the nearer); seat one stands far behind: seat two takes it, and HIS parry stuns her */
  st.mode = 'parry'; e.mode = 'crownTossTell'; e.modeT = 0.8; step(60 * 3);
  ok(st.dmg.length >= 1 && st.dmg[0].who === 'B' && H.read().stuns === 1, 'the crown meets seat TWO (the world frame runs as seat one) and his parry stuns her (stuns ' + H.read().stuns + ', hit ' + st.dmg.map(d => d.who).join('') + ')');
  /* a portal shard fan aims at the hero she means (target), and a shard can hit seat two */
  st.mode = 'hit'; st.dmg.length = 0; e.mode = 'portalTell'; e.modeT = 1.0; e.stunned = 0; step(60 * 4);
  ok(st.dmg.some(d => d.who === 'B'), 'her portal shards fly at seat two and hit him (' + st.dmg.map(d => d.who).join('') + ')');
  /* the flee heals the whole party, each to his own flask count */
  A.hp = 10; B.hp = 5; e.hp = 0; H.spare(e);
  ok(A.hp === 100 && B.hp === 100 && A.flasks === 3 && B.flasks === 5, 'the flee FULLY HEALS both seats (flasks ' + A.flasks + ' / ' + B.flasks + ', each his own)');
  step(60 * 2);
  /* the burning floor ticks each hero on it, on his own clock */
  A.x = 9300; B.x = 9350; A.y = B.y = Lw.arena.floor; st.dmg.length = 0; for (let i = 0; i < 60 * 3; i++) { A.y = B.y = Lw.arena.floor; A.ground = B.ground = true; step(1); }   /* (the fake world has no gravity: each frame lands them again) */
  ok(st.dmg.filter(d => d.o.spare && d.who === 'A').length >= 2 && st.dmg.filter(d => d.o.spare && d.who === 'B').length >= 2, 'the burning floor ticks BOTH seats (A ' + st.dmg.filter(d => d.who === 'A').length + ', B ' + st.dmg.filter(d => d.who === 'B').length + ')');
  /* seat two walks into her portal: the WHOLE party goes to the tower top */
  const E = Lw.gqEscape, RA = Lw.arenaRoof; A.x = 9000; A.y = 320; B.x = E.portal.x * 16 + 8; B.y = (E.portal.y + 1) * 16; step(60);
  ok(e.stage === 'roof' && Math.abs(A.y - (RA.exit.y + 1) * 16) < 1 && Math.abs(B.y - (RA.exit.y + 1) * 16) < 1 && A.x !== B.x && Math.abs(A.x - (RA.exit.x * 16 + 8)) < 60 && Math.abs(B.x - (RA.exit.x * 16 + 8)) < 60, 'seat two steps into her portal: BOTH heroes are set down at the island exit, a step apart');
  /* the banner lash hits every seat in front of her */
  H.test.begin(); e.x = 10000; e.y = Lw.arena.floor; A.x = 9950; B.x = 9930; A.y = B.y = Lw.arena.floor; A.ground = B.ground = true; e.face = -1; e.crownCd = e.portalCd = 99; st.dmg.length = 0;
  e.mode = 'lashLowTell'; e.modeT = 0.7; step(60);
  ok(st.dmg.filter(d => d.d === GQ3.roof.lashDmg).map(d => d.who).sort().join('') === 'AB', 'the LOW lash catches BOTH seats on the floor in front of her (' + st.dmg.map(d => d.who).join('') + ')');
  B.dead = true; st.dmg.length = 0; e.mode = 'lashLowTell'; e.modeT = 0.7; step(60);
  ok(st.dmg.every(d => d.who === 'A'), 'a dead seat is never hit again');
}

console.log(fails ? 'FAIL gq2-lab (' + fails + ')' : 'ok  gq2-lab'); process.exit(fails ? 1 : 0);
