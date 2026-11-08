// tools/attract.mjs - ATTRACT MODE (claude/intro, Daniel 11-08). After ~20 s idle on the title scene or the main menu the game plays short bot clips like an arcade cabinet.
//   STATIC   the clip list is the first act's, free starters only, 3-4 clips of 8-10 s; the "may it start" rule names each reason; the idle clock zeroes on any touch
//   OFF      a tool page (BK.manualSimulation) never gets it; ?noattract never gets it, even forced; reduce-motion never gets it; not in a submenu, not under the press prompt
//   CLIPS    forced on, 20 s idle starts the first clip; the bot MOVES (platforming), the pair has a second seat, the boss glimpse has a live boss; the whole pass ends on the title
//   PRESS    a key, a click, a tap and a pad press each end a clip THAT FRAME, on the title, with the cursor where it was and nothing opened (the press is not also a menu choice)
//   SAVE     every localStorage key and value, PROG, the party and the sandbox flag are exactly as they were, after a whole pass and after a pressed clip
//   AFTER    the title still works: CONTINUE goes on to the map and a wood still starts, with no page error
// usage: node tools/attract.mjs
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import * as AT from '../src/attract.js';
import { DEMO_IDS } from '../src/demo-slots.js';
import { DEMO_HEROES } from '../src/demo-flag.js';

/* ---- STATIC ---- */
assert.ok(AT.CLIPS.length >= 3 && AT.CLIPS.length <= 4, 'three or four clips');
assert.ok(AT.CLIP_S >= 8 && AT.CLIP_S <= 10, 'a clip is about 8-10 s (' + AT.CLIP_S + ')');
assert.equal(AT.IDLE_S, 20, 'about 20 s idle');
for (const c of AT.CLIPS) { assert.ok(DEMO_IDS.has(c.level), c.id + ' is in the first act (the demo slice)'); assert.ok(DEMO_HEROES.has(c.hero) && (!c.buddy || DEMO_HEROES.has(c.buddy)), c.id + ' uses the starters only'); }
assert.ok(AT.CLIPS.some(c => c.kind === 'boss') && AT.CLIPS.some(c => c.buddy) && AT.CLIPS.some(c => c.kind === 'run' && !c.buddy), 'a boss glimpse, a co-op pair and platforming');
const base = { state: 'title', pressCard: false, titleSub: null, overlay: false, savePrompt: false, hidden: false, off: false, reduceMotion: false };
assert.equal(AT.blockedBy(base), '', 'the plain title may');
for (const [k, v] of Object.entries({ off: true, reduceMotion: true, state: 'slots', pressCard: true, titleSub: 'OPTIONS', overlay: true, savePrompt: true, hidden: true })) assert.notEqual(AT.blockedBy({ ...base, [k]: v }), '', 'blocked by ' + k);
assert.equal(AT.idleStep(5, 1, false, false), 6); assert.equal(AT.idleStep(5, 1, true, false), 0); assert.equal(AT.idleStep(5, 1, false, true), 0);
assert.equal(AT.nextClip(-1), 0); assert.equal(AT.nextClip(AT.CLIPS.length - 1), -1);
console.log('ok  static         ' + AT.CLIPS.length + ' clips (' + AT.CLIPS.map(c => c.id).join(', ') + '), ' + AT.CLIP_S + ' s each, ' + AT.IDLE_S + ' s idle, every reason named');

const SAVE = { hero: 'knight', heroes: { knight: true, warden: true }, coins: 137, wood: { cleared: true, mini: true, medal: 2, best: 188 }, xp: { knight: 420 } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pg = await openPage({ audio: false });
const E = (x, t) => pg.evalp(x, t);
const store = () => E('JSON.stringify(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)]))');
const key = async (k, code, vk) => { for (const type of ['keyDown', 'keyUp']) await pg.send('Input.dispatchKeyEvent', { type, key: k, code, windowsVirtualKeyCode: vk }); };
/* a page with the seeded save, on `query` */
async function nav(query = '') {
  await E('(()=>{ localStorage.clear(); localStorage.setItem("bracken.progress.0", ' + JSON.stringify(JSON.stringify(SAVE)) + '); localStorage.setItem("bracken.settings", JSON.stringify({ speed: 1, speedV3: 1, hints: "high" })); window.__gone = 1; setTimeout(() => location.assign("/' + query + '"), 0); })()').catch(() => {});
  for (let i = 0; i < 400; i++) { await sleep(150); const r = await E('!window.__gone && typeof window.BK === "object" && !!window.BK.lookPass && location.search === ' + JSON.stringify(query), 3000).catch(() => false); if (r) break; }
  await E('BK.manualSimulation = true; BK.ui.pressCard = false; BK.state = "title"; BK.ui.titleSub = null; BK.ui.titleI = 0; BK.step(3); 0');
}
/* step n frames in chunks, yielding between so the bot's modules (a dynamic import) can land */
const steps = async n => { for (let done = 0; done < n;) { const k = Math.min(30, n - done); await E('BK.step(' + k + '); 0'); done += k; await sleep(5); } };
const snapState = () => E('JSON.stringify({ prog: BK.PROG, want: BK.ui.attract.want, bj: BK.bossJump.on, titleI: BK.ui.titleI, sub: BK.ui.titleSub, hero: BK.PROG.hero })');
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log('  FAIL ' + m); } };

try {
  /* ---- OFF ---- */
  await nav();
  ok(await E('BK.ui.attract.off()') === true, 'a tool page (manualSimulation) is off');
  await steps(60 * 40); ok(await E('BK.state') === 'title' && !(await E('BK.ui.attract.on')), 'forty seconds idle on a tool page: still the title');
  await E('BK.ui.attract.force = true; BK.ui.attract.idle = 0; 0');
  await E('BK.ui.titleSub = "OPTIONS"; BK.ui.titleI = 0; 0'); await steps(60 * 25);
  ok(!(await E('BK.ui.attract.on')) && await E('BK.state') === 'title', 'a submenu open: no clip however long (' + await E('BK.ui.attract.blocked()') + ')');
  await E('BK.ui.titleSub = null; BK.ui.pressCard = true; BK.ui.attract.idle = 0; 0'); await steps(60 * 25);
  ok(!(await E('BK.ui.attract.on')), 'the press prompt up: no clip (' + await E('BK.ui.attract.blocked()') + ')');
  await E('BK.ui.pressCard = false; BK.SET.reduceMotion = true; BK.ui.attract.idle = 0; 0'); await steps(60 * 25);
  ok(!(await E('BK.ui.attract.on')), 'reduce-motion: no clip (' + await E('BK.ui.attract.blocked()') + ')');
  await E('BK.SET.reduceMotion = false; BK.ui.attract.idle = 0; 0');
  console.log('ok  off            tool page, submenu, press prompt and reduce-motion each keep it off');
  await nav('?noattract'); await E('BK.ui.attract.force = true; 0'); await steps(60 * 30);
  ok(!(await E('BK.ui.attract.on')) && await E('BK.ui.attract.off()') === true, '?noattract: off even when forced');
  console.log('ok  noattract      ?noattract is a hard off');

  /* ---- CLIPS + SAVE ---- */
  await nav(); await E('BK.ui.attract.force = true; 0');
  const store0 = await store(), st0 = await snapState();
  await steps(60 * 19); ok(!(await E('BK.ui.attract.on')), 'nineteen seconds idle: not yet');
  /* a key a moment before the end of the wait starts the clock again */
  await key('Shift', 'ShiftLeft', 16); await sleep(50); await steps(2); ok(await E('BK.ui.attract.idle') < 1, 'a key press zeroes the idle clock');
  await steps(60 * 19); ok(!(await E('BK.ui.attract.on')), 'nineteen seconds after the press: still not');
  await steps(60 * 3);
  for (let i = 0; i < 40 && !(await E('BK.ui.attract.on')); i++) { await steps(10); await sleep(60); }   /* the bot's modules land */
  ok(await E('BK.ui.attract.on') === true && await E('BK.state') === 'play', 'twenty seconds idle: a clip is on (state ' + await E('BK.state') + ')');
  const seen = [];
  for (let guard = 0; guard < 60 * 60 && (await E('BK.ui.attract.on')); guard += 30) {
    const c = await E('BK.ui.attract.clip');
    if (!seen.find(s => s.clip === c)) {
      await steps(30);
      const a = await E('({ x: BK.P.x, y: BK.P.y, n: BK.players().length, boss: BK.enemies().some(e => e.alive && e.maxHp && e.t !== "dummy" && (BK.bossActive || BK.miniActive || e.mini || e.t === BK.L.arena?.boss)) })');
      await steps(60 * 5);
      const b = await E('({ x: BK.P.x, y: BK.P.y, bossOn: !!BK.bossActive, hp: BK.P.hp, state: BK.state })');
      seen.push({ clip: c, id: (await E('BK.ui.attract.clips'))[c].id, a, b });
      await steps(25);
    } else await steps(30);
  }
  ok(seen.length === AT.CLIPS.length, 'every clip played in turn (' + seen.map(s => s.id).join(', ') + ')');
  const by = id => seen.find(s => s.id === id);
  ok(by('wood-run') && Math.abs(by('wood-run').b.x - by('wood-run').a.x) > 60, 'platforming: the bot walks (' + (by('wood-run') && Math.round(by('wood-run').b.x - by('wood-run').a.x)) + ' px in five seconds)');
  ok(by('marsh-pair') && by('marsh-pair').a.n === 2, 'the pair has a second seat (' + (by('marsh-pair') && by('marsh-pair').a.n) + ' players)');
  ok(by('tusker') && (by('tusker').a.boss || by('tusker').b.bossOn), 'the boss glimpse has its boss on the board');
  ok(!(await E('BK.ui.attract.on')) && await E('BK.state') === 'title', 'the pass ends on the title (state ' + await E('BK.state') + ')');
  ok((await store()) === store0, 'THE SAVE IS UNTOUCHED after a whole pass: every localStorage key and value as it was');
  const st1 = await snapState(); ok(st1 === st0, 'PROG, the party, the sandbox flag and the cursor are as they were after the pass\n    ' + st0.slice(0, 200) + '\n    ' + st1.slice(0, 200));
  console.log('ok  clips          ' + seen.map(s => s.id).join(' > ') + '; the bot walks, the pair is two, the boss is on the board; the pass ends on the title');
  console.log('ok  save           a whole pass left every localStorage key, PROG and the party exactly as they were');

  /* ---- PRESS: key, click, tap, pad, each on a fresh clip ---- */
  const press = {
    'a key': async () => key('ArrowDown', 'ArrowDown', 40),
    'ENTER (confirm and attack)': async () => key('Enter', 'Enter', 13),
    'a click': async () => { await pg.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 300, y: 200, button: 'left', clickCount: 1 }); await pg.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 300, y: 200, button: 'left', clickCount: 1 }); },
    'a tap': async () => { await pg.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 300, y: 200, id: 1 }] }); await pg.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); },
    'a pad button': async () => { await E('(() => { const pad = { index: 0, id: "test pad", connected: true, mapping: "standard", axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, (_, i) => ({ pressed: i === 0, value: i === 0 ? 1 : 0 })) }; navigator.getGamepads = () => [pad]; BK.ui.pollPad(); BK.step(2); navigator.getGamepads = () => []; })()'); },
  };
  for (const [name, fire] of Object.entries(press)) {
    await nav(); await E('BK.ui.attract.force = true; BK.ui.titleI = 2; 0');
    const s0 = await store();
    await E('BK.ui.attract.idle = 25; 0'); for (let i = 0; i < 60 && !(await E('BK.ui.attract.on')); i++) { await steps(5); await sleep(60); }
    ok(await E('BK.ui.attract.on') === true, name + ': a clip is on first');
    await steps(60 * 2);
    await fire(); await sleep(80); if (name !== 'a pad button') ok(!(await E('BK.ui.attract.on')), name + ' ended the clip at once (the page, before the next frame)');
    await steps(2);
    const after = await E('({ on: BK.ui.attract.on, state: BK.state, titleI: BK.ui.titleI, sub: BK.ui.titleSub, idle: BK.ui.attract.idle })');
    ok(!after.on && after.state === 'title', name + ' returned to the title (' + JSON.stringify(after) + ')');
    ok(after.titleI === 2 && after.sub === null, name + ' was not also a menu choice (cursor ' + after.titleI + ', submenu ' + after.sub + ')');
    await steps(40); ok(await E('BK.state') === 'title' && (await E('BK.ui.titleI')) === 2, name + ': nothing happened on the title after it either');
    ok((await store()) === s0, name + ': the save is untouched after a pressed clip');
  }
  console.log('ok  press          a key, ENTER, a click, a tap and a pad button each end the clip at once, on the title, with the cursor where it was, the save untouched');

  /* ---- AFTER: the title still works ---- */
  await nav(); await E('BK.ui.attract.force = true; BK.ui.attract.idle = 25; 0'); for (let i = 0; i < 60 && !(await E('BK.ui.attract.on')); i++) { await steps(5); await sleep(60); }
  await steps(90); await key('Shift', 'ShiftLeft', 16); await sleep(60); await steps(60);
  await E('BK.ui.attract.force = false; BK.manualSimulation = true; BK.ui.titleSelect("CONTINUE"); BK.press("confirm"); 0'); await steps(30);
  const st = await E('BK.state'); ok(['map', 'play', 'slots', 'heropick'].includes(st), 'CONTINUE after a clip goes on (state ' + st + ')');
  await E('(async () => { const { LEVELS } = await import("/src/level.js"); BK.load(LEVELS.findIndex(l => l.id === "wood")); BK.state = "play"; BK.start(); BK.sim(120); })()', 60000);
  ok(await E('BK.state') === 'play' && await E('BK.L && BK.L.W > 0'), 'and a wood still starts after it');
  console.log('ok  after          CONTINUE and a wood start still work after a clip (' + st + ')');
  ok(pg.errors.length === 0, 'no page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { await pg.close(); }
if (fails.length) { console.log('\nFAILED (' + fails.length + ')'); process.exit(1); }
console.log('ok  console        no page errors');
