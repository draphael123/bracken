/* tools/transition-woodmarsh.mjs - THE FIRST LEVEL TRANSITION, pinned (claude/transwm; src/transitions.js + transitions-art.js; brief-transition-woodmarsh-1018.md).
   OLD TUSKER falls -> the clear is credited -> the way opens -> the heroes walk out -> the ferry carries them -> fade -> MARSH begins with them stepping off.
     node tools/transition-woodmarsh.mjs            node-only: the table, the timeline (skip, walk cap, policy), the ferry scene's geometry, the source wiring
     node tools/transition-woodmarsh.mjs --browser  adds the page: Old Tusker's kill shows the win card, no ferry (smallfix5 turned the L1 ferry off), flag on or off
     node tools/transition-woodmarsh.mjs --perf     the ride on a phone viewport at 4x CPU throttle: frames per second over the ride (>= ~45 fps)
   Exit 1 on any red row. */
import { readFileSync } from 'node:fs';
import * as TRM from '../src/transitions.js';
import { tabOf, tabRows } from '../src/settings-ui.js';
const rows = []; const ok = (name, pass, why = '') => { rows.push({ name, pass: !!pass, why }); console.log((pass ? 'ok   ' : 'FAIL ') + name + (pass ? '' : '  ' + why)); };
const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

/* ---- the table and the timeline ---- */
/* (claude/hornetsnest2) the wood -> marsh ferry row is GONE from the table (smallfix5 had turned it off; the road runs through the nest). The ferry scene's art stays in src/transitions-art.js, so its
   timeline and geometry are still pinned here with a LOCAL copy of the old row; the live row is the walk-out into the nest. */
const E = { from: 'wood', to: 'marsh', scene: 'ferry', beats: [{ id: 'open', dur: 1.5 }, { id: 'walk', dur: 2.4, max: 3.6 }, { id: 'shore', dur: 3.3 }, { id: 'ride', dur: 7.5 }, { id: 'fade', dur: 0.7 }], open: { col: 549, rows: [3, 8], lintel: 2 }, arrive: { ferry: true, walk: 1.7 } };
const WN = TRM.entryFor('wood');
ok('the table has the wood -> hornetsnest WALK-OUT row (scene null, open / walk / fade, no ferry) and no wood -> marsh row', WN && WN.to === 'hornetsnest' && WN.scene === null && WN.beats.map(b => b.id).join() === 'open,walk,fade' && !WN.arrive.ferry && WN.arrive.walk >= 1 && WN.open.col === 549 && !TRM.entryFor('wood', 'marsh'));
{ const tl = TRM.start(WN), seen = [TRM.phase(tl)]; let guard = 0; while (!tl.done && guard++ < 5000) for (const e of TRM.step(tl, 1 / 60, { ready: true })) seen.push(e);
  ok('the walk-out runs open, walk, fade, done (about 4 s)', seen.join() === 'open,walk,fade,done' && tl.t > 2.5 && tl.t < 7, seen.join() + ' ' + tl.t.toFixed(1));
  ok('main.js: trnSceneS returns 0 for a timeline with no shore / ride beat (a null scene: beats[-1] would crash)', src.includes("if (sh < 0 || ri < 0) return 0;")); }
ok('the beats are open, walk, shore, ride, fade in that order', E && E.beats.map(b => b.id).join() === 'open,walk,shore,ride,fade');
ok('the way opens in the wood\'s last column (the clearing\'s east gate)', E && E.open.col === 549 && E.open.rows[0] < E.open.rows[1]);
ok('the ferry leaves the jetty and is on the water 8-10 s (shore after pole-off + ride)', (() => { const sh = E.beats.find(b => b.id === 'shore').dur, ri = E.beats.find(b => b.id === 'ride').dur, on = sh - TRM.FERRY.poleAt + ri; return on >= 8 && on <= 10; })());
ok('the next level begins with a stepping-off walk', E && E.arrive && E.arrive.ferry && E.arrive.walk >= 1 && E.arrive.walk <= 3);
{ const tl = TRM.start(E), seen = [TRM.phase(tl)]; let guard = 0;
  while (!tl.done && guard++ < 5000) { const en = TRM.step(tl, 1 / 60, { ready: true }); for (const e of en) seen.push(e); }
  ok('a full watch runs every beat once and ends done', seen.join() === 'open,walk,shore,ride,fade,done', seen.join());
  ok('a full watch is ~12-14 s with the walk ending early', tl.t > 10 && tl.t < 16, tl.t.toFixed(2)); }
{ const tl = TRM.start(E); TRM.step(tl, 0.3, { press: true }); ok('a press in the first 0.8 s does NOT skip (a hero mashing attack as the boss falls)', !tl.skipped && TRM.phase(tl) === 'open');
  TRM.step(tl, 0.7, {}); ok('a press after 0.8 s skips to the fade', (TRM.step(tl, 1 / 60, { press: true }), tl.skipped && TRM.phase(tl) === 'fade'));
  let n = 0; while (!tl.done && n++ < 100) TRM.step(tl, 1 / 60, {}); ok('the skip fade is short (<= 0.35 s) and ends done', tl.done && n <= 0.35 * 60 + 2, n + ' frames'); }
{ const tl = TRM.start(E); while (TRM.phase(tl) !== 'walk') TRM.step(tl, 1 / 60, {}); let t = 0; while (TRM.phase(tl) === 'walk' && t < 10) { TRM.step(tl, 1 / 60, { ready: false }); t += 1 / 60; }
  ok('the walk cannot run past its cap even if a hero never arrives (no softlock)', t <= E.beats[1].max + 0.05, t.toFixed(2)); }
{ const tl = TRM.start(E); while (TRM.phase(tl) !== 'shore') TRM.step(tl, 1 / 60, { ready: true }); TRM.step(tl, 1 / 60, { press: true }); ok('a skip works in the scene too', tl.skipped && TRM.phase(tl) === 'fade'); }
ok('the policy: ON BY DEFAULT (the art is in); ?trans=0 / force(false) is the off switch; the setting is honoured (NEVER stops it, FIRST TIME skips a seen pair, ALWAYS replays)',
  TRM.policy({}) && !TRM.policy({ off: true }) && !TRM.policy({ mode: 'never' }) && TRM.policy({ mode: 'first', seen: false }) && !TRM.policy({ mode: 'first', seen: true }) && TRM.policy({ mode: 'always', seen: true }) && !TRM.policy({ off: true, mode: 'always' }));
ok('main.js: trnBegin only plays a transition into a level that needs the one just won (smallfix5: the L1 ferry is off, the road goes on to the Hornet Nest)', src.includes('LEVELS[to].needs !== LEVELS[levelIndex].id'));
ok('main.js: the ?trans=1 gate is gone (default on), ?trans=0 is the off switch', src.includes("q.get('trans') === '0'") && !src.includes("q.get('trans') === '1'"));
ok('the TRANSITIONS row is in Settings > Gameplay (Helpers), on the title and the pause menu alike, with its description, value and cycle wired in main.js', tabOf('Transitions') === 'gameplay' && tabRows('gameplay', 'play').includes('Transitions') && tabRows('gameplay', 'title').includes('Transitions') && src.includes("k === 'Transitions' ? TRM.MODE_LABEL") && src.includes("k === 'Transitions') { const o = ['always', 'first', 'never']") && src.includes("'Transitions': 'the cutscene"));ok('the setting: three values, ALWAYS / FIRST TIME / NEVER, an unknown value is FIRST TIME', TRM.MODES.join() === 'always,first,never' && TRM.modeOf(undefined) === 'first' && TRM.modeOf('bogus') === 'first' && TRM.MODE_LABEL.first === 'FIRST TIME');
ok('letterbox bars slide in (0 -> 22) and out', TRM.barIn(0) === 0 && TRM.barIn(1) === TRM.BAR && TRM.barOut(0, 1.7) === TRM.BAR && TRM.barOut(1.7, 1.7) === 0);
ok('the walk: slower is never under WALK_MIN, a long way is a run capped at WALK_MAX', TRM.walkSpeed(1) === TRM.WALK_MIN && TRM.walkSpeed(5000) === TRM.WALK_MAX);
/* ---- the ferry scene geometry ---- */
{ const F = TRM.FERRY, VW = 320;
  ok('every hero is aboard before the ferryman poles off', [0, 1, 2, 3].every(i => TRM.heroOnScene(i, 4, F.poleAt, VW).aboard));
  ok('they walk in from off-screen left and end on the deck', TRM.heroOnScene(0, 4, 0, VW).x < 0 && [0, 1, 2, 3].every(i => { const h = TRM.heroOnScene(i, 4, 9, VW); return h.x >= VW * F.dockAt && h.x <= VW * F.dockAt + F.deckW; }));
  ok('the world does not slide until she is poled off, then slides monotonically', TRM.sceneScroll(F.poleAt) === 0 && TRM.sceneScroll(F.poleAt + 1) > 0 && TRM.sceneScroll(F.poleAt + 5) > TRM.sceneScroll(F.poleAt + 4));
  ok('reduce-motion slows the slide (parallax speed dropped), keeps the boarding', TRM.sceneScroll(F.poleAt + 6, true) < TRM.sceneScroll(F.poleAt + 6) * 0.6); }
/* ---- the source wiring ---- */
ok('the clear is credited BEFORE the cutscene: winLevel() runs, then trnBegin()', /else \{ winLevel\(\); trnBegin\(\); \}/.test(src));
ok('rush, boss select, trials, shops and the editor never start one', /function trnBegin\(\) \{\n?\s*if \(TRN \|\| !L \|\| !LEVELS\[levelIndex\] \|\| rushOn\(\) \|\| bossSelectFight \|\| edTesting \|\| L\.trial \|\| L\.shop\) return false;/.test(src.replace(/\r\n/g, '\n')));
ok('the next level loads through loadThen (the map start\'s own path) and startGame', /loadThen\(tr\.to, \(\) => \{ TRN = null; startGame\(\); trnArriveBegin\(entry\); \}\)/.test(src));
ok('the win card and the HUD plates stay down while a transition runs', (src.match(/state === 'win' && !TRN/g) || []).length >= 3);
ok('any press skips: the update hands anyPress to the timeline', /TRM\.step\(tl, dt, \{ press: anyPress, ready \}\)/.test(src));
ok('no text in the scenes but the skip hint (dialogue-free): transitions-art.js has no text()', !/\btext\(/.test(readFileSync(new URL('../src/transitions-art.js', import.meta.url), 'utf8').replace(/\/\*[^]*?\*\//g, '')));

/* ---- the page ---- */
if (process.argv.includes('--browser')) {
  /* smallfix5: the Lumber Trail -> Marsh Wood ferry is OFF (the road goes wood -> Hornet's Nest -> marsh). The table row and the art stay; this pins that
     Old Tusker's kill now shows the normal win card, with the transition flag on or off, and that no page error comes of it. */
  const { openPage } = await import('./cdp.mjs'); const pg = await openPage({ audio: false });
  const ev = x => pg.evalp(x, 600000);
  try {
    const run = flag => ev(`(async()=>{ const out = {}; BK.manualSimulation = true; const { LEVELS } = await import('/src/level.js'); BK.setHero('knight'); BK.reset({ fresh: true }); delete BK.PROG.transSeen; BK.SET.transitions = undefined; BK.trans.force(${flag}); BK.load(LEVELS.findIndex(l => l.id === 'wood')); BK.start(); BK.sim(30);
      const A = BK.L.arena, e = BK.enemies().find(q => q.t === A.boss && q.alive); BK.god = true; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); BK.sim(200);
      for (let n = 0; n < 1000 && e && e.alive; n++) { BK.P.inv = 99; BK.P.hp = BK.P.maxHp; e.hp = Math.min(e.hp, 1); e.inv = 0; e.open = 9; e.passThrough = true; BKT.hurtEnemy(e, 1e6, e.x + (n % 2 ? 10 : -10), n % 3 === 0); if (e.alive) BK.sim(6); }
      out.killed = !!e && !e.alive; let tr = false; for (let i = 0; i < 800; i++) { BK.sim(1); if (BK.trans.tr) { tr = true; break; } if (BK.state === 'win') break; }
      out.tr = tr; out.state = BK.state; out.lvl = BK.trans.levelId(); out.wood = !!(BK.PROG.wood && BK.PROG.wood.cleared); out.scene = tr ? !!BK.trans.tr.scene : null;
      if (tr) { for (let i = 0; i < 1500 && (BK.trans.tr || BK.trans.levelId() === 'wood'); i++) { if (i % 200 === 100) BK.press('atk'); BK.sim(2); } out.after = BK.trans.levelId(); out.arrive = !!(BK.trans.arrive && BK.trans.arrive.entry && !BK.trans.arrive.ferry); }
      return out; })()`);
    for (const flag of ['true', 'false']) {
      const a = await run(flag);
      if (flag === 'true') ok('flag true: Old Tusker falls, the wood is cleared, the WALK-OUT plays (no ferry scene) and the party arrives in the nest', a.killed && a.wood && a.tr && a.scene === false && a.after === 'hornetsnest' && a.arrive, JSON.stringify(a));
      else ok('flag false: Old Tusker falls, the wood is cleared, the WIN CARD shows and no transition plays', a.killed && a.wood && a.state === 'win' && !a.tr && a.lvl === 'wood', JSON.stringify(a));
    }
    ok('no page errors', pg.errors.length === 0, JSON.stringify(pg.errors.slice(0, 3)));
  } finally { pg.close(); }
}
/* ---- the ride on a phone: a 915x412 landscape viewport at DPR 2.625 with the CPU throttled (MP_CPU, default 4x), the game on its own requestAnimationFrame loop ---- */
if (process.argv.includes('--perf')) {
  const { openPage } = await import('./cdp.mjs'); const sleep = ms => new Promise(r => setTimeout(r, ms));
  const CPU = +(process.env.MP_CPU || 4), FPS_MIN = +(process.env.MP_FPS_MIN || 45);
  const pg = await openPage({ audio: false, fonts: false, speed: 0.6 });
  try {
    await pg.send('Emulation.setDeviceMetricsOverride', { width: 915, height: 412, deviceScaleFactor: 2.625, mobile: true, screenOrientation: { type: 'landscapePrimary', angle: 90 } });
    await pg.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await pg.send('Emulation.setCPUThrottlingRate', { rate: CPU });
    /* the boss is killed on the sim (a step at a time), then the page's own loop plays the transition */
    await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); BK.setHero('knight'); BK.reset({ fresh: true }); BK.trans.force(true); BK.load(LEVELS.findIndex(l => l.id === 'wood')); BK.start(); BK.sim(30);
      const A = BK.L.arena, e = BK.enemies().find(q => q.t === A.boss && q.alive); BK.god = true; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); BK.sim(200);
      for (let n = 0; n < 1000 && e && e.alive; n++) { BK.P.inv = 99; BK.P.hp = BK.P.maxHp; e.hp = Math.min(e.hp, 1); e.inv = 0; e.open = 9; e.passThrough = true; BKT.hurtEnemy(e, 1e6, e.x + (n % 2 ? 10 : -10), n % 3 === 0); if (e.alive) BK.sim(6); } return 1; })()`, 600000);
    const wait = async (pred, ms) => { for (const until = Date.now() + ms; Date.now() < until;) { if (await pg.evalp(pred, 5000).catch(() => false)) return true; await sleep(100); } return false; };
    const ride = await wait(`!!(BK.trans.tr && !BK.trans.tr.loading && BK.trans.TRM.phase(BK.trans.tr.tl) === 'shore')`, 120000);
    ok('PERF: the page reached the ferry scene on its own loop', ride);
    if (ride) {
      await pg.evalp(`(() => { const a = window.__fr = { n: 0, dts: [], last: performance.now(), on: true }; const f = t => { if (!a.on) return; a.n++; a.dts.push(t - a.last); a.last = t; requestAnimationFrame(f); }; requestAnimationFrame(f); window.__t0 = performance.now(); })()`);
      await wait(`BK.trans.tr && BK.trans.TRM.phase(BK.trans.tr.tl) === 'fade'`, 40000);
      const r = await pg.evalp(`(() => { const a = window.__fr; a.on = false; const d = a.dts.slice().sort((x, y) => x - y); return { n: a.n, wall: (performance.now() - window.__t0) / 1000, p95: d[Math.floor(d.length * 0.95)] || 0, worst: d[d.length - 1] || 0 }; })()`);
      const fps = r.n / r.wall; console.log('ride (shore + ride): ' + JSON.stringify({ fps: +fps.toFixed(1), p95: +r.p95.toFixed(1), worst: +r.worst.toFixed(1), secs: +r.wall.toFixed(1), cpu: CPU + 'x' }));
      ok('PERF: >= ' + FPS_MIN + ' fps over the ferry scene at ' + CPU + 'x CPU on a phone viewport', fps >= FPS_MIN, fps.toFixed(1) + ' fps');
    }
    ok('PERF: no page errors', pg.errors.length === 0, JSON.stringify(pg.errors.slice(0, 3)));
  } finally { pg.close(); }
}
const bad = rows.filter(x => !x.pass); console.log(bad.length ? bad.length + ' red of ' + rows.length : 'all ' + rows.length + ' green'); process.exit(bad.length ? 1 : 0);
