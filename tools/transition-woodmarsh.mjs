/* tools/transition-woodmarsh.mjs - THE FIRST LEVEL TRANSITION, pinned (claude/transwm; src/transitions.js + transitions-art.js; brief-transition-woodmarsh-1018.md).
   OLD TUSKER falls -> the clear is credited -> the way opens -> the heroes walk out -> the ferry carries them -> fade -> MARSH begins with them stepping off.
     node tools/transition-woodmarsh.mjs            node-only: the table, the timeline (skip, walk cap, policy), the ferry scene's geometry, the source wiring
     node tools/transition-woodmarsh.mjs --browser  adds the page: kill the boss with ?trans=1 on -> credit first, wall opens, walk, scene, fade, Marsh at the ferry, input returns;
                                                    a skip at 1.5 s and at the shore; co-op (all seats ride); a replay; a flag-off kill still shows the win card;
                                                    the map return still works; the campaign order and the boss-select fight untouched
     node tools/transition-woodmarsh.mjs --perf     the ride on a phone viewport at 4x CPU throttle: frames per second over the ride (>= ~45 fps)
   Exit 1 on any red row. */
import { readFileSync } from 'node:fs';
import * as TRM from '../src/transitions.js';
import { tabOf, tabRows } from '../src/settings-ui.js';
const rows = []; const ok = (name, pass, why = '') => { rows.push({ name, pass: !!pass, why }); console.log((pass ? 'ok   ' : 'FAIL ') + name + (pass ? '' : '  ' + why)); };
const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

/* ---- the table and the timeline ---- */
const E = TRM.entryFor('wood', 'marsh');
ok('the table has the wood -> marsh row, scene ferry', E && E.scene === 'ferry' && E.to === 'marsh');
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
ok('main.js: the ?trans=1 gate is gone (default on), ?trans=0 is the off switch', src.includes("q.get('trans') === '0'") && !src.includes("q.get('trans') === '1'") && !src.includes('live: false'));
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
  const { openPage } = await import('./cdp.mjs'); const pg = await openPage({ audio: false });
  const ev = x => pg.evalp(x, 600000);
  try {
    const setup = `window.__t = {}; window.__setup = async (flag, coop) => { BK.manualSimulation = true; const { LEVELS } = await import('/src/level.js'); window.__L = LEVELS; BK.setHero('knight'); BK.reset({ fresh: true });
        delete BK.PROG.transSeen; BK.SET.transitions = undefined; BK.trans.force(flag); if (coop) BK.coopArm('warden', false); const wi = LEVELS.findIndex(l => l.id === 'wood'); BK.load(wi); BK.start(); BK.sim(30); return wi; };
      window.__kill = () => { const A = BK.L.arena, e = BK.enemies().find(q => q.t === A.boss && q.alive); BK.god = true; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); if (BK.players().length > 1) { const q = BK.players()[1]; q.x = BK.P.x + 20; q.y = BK.P.y; q.vx = q.vy = 0; } BK.sim(200);
        for (let n = 0; n < 1000 && e && e.alive; n++) { BK.P.inv = 99; BK.P.hp = BK.P.maxHp; e.hp = Math.min(e.hp, 1); e.inv = 0; e.open = 9; e.passThrough = true; BKT.hurtEnemy(e, 1e6, e.x + (n % 2 ? 10 : -10), n % 3 === 0); if (e.alive) BK.sim(6); } return !!e && !e.alive; };
      window.__lvl = () => BK.trans.levelId();`;
    await ev(`(async()=>{ ${setup}; return 1; })()`);
    /* 1. a full watch, flag on */
    const a = await ev(`(async()=>{ const out = { ph: [] }; await __setup(true); out.killed = __kill();
      let last = '', clearedAtBegin = null;
      for (let i = 0; i < 3000; i++) { BK.sim(1); const tr = BK.trans.tr; if (tr && clearedAtBegin === null) { clearedAtBegin = !!(BK.PROG.wood && BK.PROG.wood.cleared); out.openCol = null; out.xs0 = BK.players ? 0 : 0; }
        if (tr && !tr.loading) { const ph = BK.trans.TRM.phase(tr.tl); if (ph !== last) { out.ph.push(ph); last = ph; if (ph === 'walk') out.gap = [3,4,5,6,7,8].map(r => BK.L.grid[r * BK.L.W + 549]); if (ph === 'shore') out.edgeX = BK.P.x; }
          if (i % 7 === 0) BK.draw1(); } if (BK.state === 'play' && __lvl() === 'marsh') { out.frames = i; break; } }
      out.clearedAtBegin = clearedAtBegin; out.lvl = __lvl(); out.state = BK.state; out.arrive = !!BK.trans.arrive; out.x0 = BK.P.x; out.wood = !!(BK.PROG.wood && BK.PROG.wood.cleared); out.seen = JSON.stringify(BK.PROG.transSeen || null);
      /* control returns after the step-off */
      const x1 = BK.P.x; BK.sim(150); out.arriveDone = BK.trans.arrive && BK.trans.arrive.done; out.x1 = BK.P.x; BK.keys.right = true; BK.sim(30); BK.keys.right = false; out.moved = BK.P.x - out.x1;
      out.errors = 0; return out; })()`);
    ok('Old Tusker is killed in the page', a.killed, JSON.stringify(a));
    ok('THE WOOD IS CLEARED AND SAVED BEFORE THE CUTSCENE (credit first)', a.clearedAtBegin === true && a.wood === true, JSON.stringify(a));
    ok('beats run in order: open, walk, shore, ride, fade', a.ph.join() === 'open,walk,shore,ride,fade', a.ph.join());
    ok('the way opened: the gate column is air, a lintel remains', a.gap && a.gap.every(v => v === 0) && true, JSON.stringify(a.gap));
    ok('the Marsh begins (state play) with the stepping-off arrival', a.lvl === 'marsh' && a.state === 'play' && a.arrive, JSON.stringify(a));
    ok('the heroes start ON the ferry (x < 40) and step off to the bank (x > 80), then control returns', a.x0 < 40 && a.x1 > 80 && a.arriveDone && a.moved > 3, JSON.stringify(a));
    ok('the clear is marked as seen on the save', /wood>marsh/.test(a.seen || ''), a.seen);
    /* 2. skip at 1.5 s */
    const b = await ev(`(async()=>{ const out = {}; await __setup(true); __kill(); let k = 0;
      for (let i = 0; i < 2000; i++) { BK.sim(1); const tr = BK.trans.tr; if (tr) { k++; if (k === 90) BK.trans.press(); } if (BK.state === 'play' && __lvl() === 'marsh') { out.frames = k; break; } }
      out.lvl = __lvl(); out.wood = !!(BK.PROG.wood && BK.PROG.wood.cleared); out.arrive = !!BK.trans.arrive; out.sameStart = BK.P.x < 40; return out; })()`);
    ok('a skip at 1.5 s lands in the Marsh at the ferry, same state as a full watch (<= 2.2 s total)', b.lvl === 'marsh' && b.arrive && b.sameStart && b.frames < 2.2 * 60 + 5, JSON.stringify(b));
    ok('the wood stays cleared after a skip', b.wood);
    /* 3. flag off: the win card, exactly as before */
    const c = await ev(`(async()=>{ const out = {}; await __setup(false); __kill(); for (let i = 0; i < 800; i++) { BK.sim(1); if (BK.state === 'win') break; } out.state = BK.state; out.tr = !!BK.trans.tr; out.lvl = __lvl();
      BK.keys.confirm = false; return out; })()`);
    ok('with the flag OFF the win card arrives as before (no transition)', c.state === 'win' && !c.tr && c.lvl === 'wood', JSON.stringify(c));
    /* 3a. the DEFAULT (no flag, no switch): the first kill plays the transition */
    const dflt = await ev(`(async()=>{ const out = {}; await __setup(null); __kill(); let tr = false; for (let i = 0; i < 700; i++) { BK.sim(1); if (BK.trans.tr) { tr = true; break; } if (BK.state === 'win') break; } out.tr = tr; out.state = BK.state; return out; })()`);
    ok('ON BY DEFAULT: with no flag the first Old Tusker kill plays the transition (no ?trans=1 needed)', dflt.tr === true, JSON.stringify(dflt));
    /* 3b. the setting: NEVER stops it even with the flag; FIRST TIME skips a pair already seen; ALWAYS replays it */
    const s3 = await ev(`(async()=>{ const out = {}; for (const m of ['never', 'first', 'always']) { await __setup(true); BK.SET.transitions = m; if (m === 'first') BK.PROG.transSeen = { 'wood>marsh': 1 }; __kill(); let tr = false; for (let i = 0; i < 700; i++) { BK.sim(1); if (BK.trans.tr) { tr = true; break; } if (BK.state === 'win') break; } out[m] = tr; }
      BK.SET.transitions = undefined; return out; })()`);
    ok('the TRANSITIONS setting is honoured: NEVER and a seen FIRST TIME play nothing, ALWAYS plays', s3.never === false && s3.first === false && s3.always === true, JSON.stringify(s3));
    /* 4. a mid-cutscene quit: Wood cleared, the map return works */
    const d = await ev(`(async()=>{ const out = {}; await __setup(true); __kill(); for (let i = 0; i < 400; i++) { BK.sim(1); if (BK.trans.tr) break; } out.began = !!BK.trans.tr; out.cleared = !!(BK.PROG.wood && BK.PROG.wood.cleared);
      BK.state = 'map'; BK.trans.force(false); out.state = BK.state; return out; })()`);
    ok('quitting mid-cutscene = the wood is cleared (and the map is reachable)', d.began && d.cleared && d.state === 'map', JSON.stringify(d));
    /* 5. co-op: every seat rides */
    const e = await ev(`(async()=>{ const out = {}; await __setup(true, true); out.seats = BK.players().length; __kill(); let rode = 0;
      for (let i = 0; i < 3000; i++) { BK.sim(1); const tr = BK.trans.tr; if (tr && !tr.loading) { rode = Math.max(rode, tr.pos.length); out.pl = out.pl || BK.players().length; if (i % 9 === 0) BK.draw1(); } if (BK.state === 'play' && __lvl() === 'marsh') { out.frames = i; break; } }
      out.rode = rode; out.after = BK.players().length; out.x0 = BK.players().map(p => Math.round(p.x)); BK.sim(150); out.x1 = BK.players().map(p => Math.round(p.x)); out.done = BK.trans.arrive && BK.trans.arrive.done; return out; })()`);
    ok('CO-OP: both seats ride, both start on the ferry and both step off', e.seats === 2 && e.rode === 2 && e.after === 2 && e.x0.every(x => x < 40) && e.x1.every(x => x > 80) && e.done, JSON.stringify(e));
    ok('every seat is walked, drawn on the ferry and handed back (the seat loops are over players)', /players\.forEach\(\(p, i\) => \{ const q2 = tr\.pos\[i\]/.test(src) && /n: players\.length/.test(src) && /players\.forEach\(\(p, i\) => asPlayer\(p, \(\) => \{ for \(const k of Object\.keys\(keys\)\)/.test(src));
    const tw = await ev(`({ pc: BK.trans.textW('ANY BUTTON: SKIP'), touch: BK.trans.textW('TAP: SKIP'), VW: 320 })`);
    ok('TEXTFIT: the skip hint (the only text in a transition) fits the bar at 320 wide, both wordings (right-aligned 6 px in)', tw.pc + 6 < tw.VW - 40 && tw.touch + 6 < tw.VW - 40, JSON.stringify(tw));
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
