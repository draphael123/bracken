// tools/zoom-coverage.mjs - EVERY FIGHT THAT ZOOMS OUT AT ITS WAKE STAYS ZOOMED OUT (Node, static + vm).
// render() calls setView(desiredView()) every frame, so a wake's setView('zoom') lasts one frame unless desiredView()
// also asks for it. The Gate Gargoyle's lane (2026-09-25) found ten bosses - harbormaster, pyromancer, bellcrab,
// closedhelm, drownedking, prince, grandmother, troll, strawking, archmage - zoomed at the wake and back to normal by the
// first drawn frame. This reads every boss and mini the wake zooms (literal `boss.t === 'x'` tests next to
// setView('zoom'), plus the src/boss-view.js lists when the wake reads them) and runs the real desiredView() for each in a
// vm, mid-fight: every one must come back 'zoom'. `--src <file>` runs it against another main.js (red on abcd773's).
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { ZOOM_BOSSES, ZOOM_MINIS, bossZooms, miniZooms } from '../src/boss-view.js';
const ai = process.argv.indexOf('--src');
const src = readFileSync(ai > 0 ? process.argv[ai + 1] : new URL('../src/main.js', import.meta.url), 'utf8');
const fails = [], ok = (c, m) => { if (!c) fails.push(m); };

/* 1. WHAT THE WAKES ZOOM. The boss wake is bossStart(); the mini wake is the statement that sets miniActive = true. */
const cut = (from, to) => { const i = src.indexOf(from); return i < 0 ? '' : src.slice(i, src.indexOf(to, i + from.length)); };
const bossWake = cut('function bossStart()', '\nfunction ');
const miniWake = (src.match(/[^\n]*const mb = miniOne\(\); if \(mb\) \{ miniActive = true;[^\n]*/) || [''])[0];
ok(bossWake.length > 0, 'bossStart() not found');
ok(miniWake.length > 0, 'the mini wake (miniActive = true) not found');
const zoomedBy = (code, who) => { const got = new Set();
  const re = /if \(([^{}]*?)\)\s*(?:\{[^{}]*?setView\('zoom'\)[^{}]*\}|setView\('zoom'\))/g; let m;
  while ((m = re.exec(code))) { for (const t of m[1].matchAll(new RegExp(who + "\\.t === '(\\w+)'", 'g'))) got.add(t[1]);
    if (/bossZooms\(/.test(m[1])) ZOOM_BOSSES.forEach(t => got.add(t)); if (/miniZooms\(/.test(m[1])) ZOOM_MINIS.forEach(t => got.add(t)); }
  /* a bare setView('zoom') inside a block guarded by a boss test (the old Mother wake) */
  const re2 = new RegExp("if \\(" + who + "\\.t === '(\\w+)'\\) \\{[^{}]*setView\\('zoom'\\)", 'g');
  while ((m = re2.exec(code))) got.add(m[1]);
  return got; };
const bosses = zoomedBy(bossWake, 'boss'), minis = zoomedBy(miniWake, 'mb');
ok(bosses.size >= 20, 'the boss wake zooms only ' + bosses.size + ' bosses: the reader lost the list');
for (const t of ['harbormaster', 'pyromancer', 'bellcrab', 'closedhelm', 'drownedking', 'prince', 'grandmother', 'troll', 'strawking', 'archmage', 'gargoyle', 'queen', 'mother'])
  ok(bosses.has(t), t + ' no longer zooms out at its wake');

/* 2. AND WHAT desiredView() KEEPS: the real function, run in a vm for each of them mid-fight */
const dv = (src.slice(src.indexOf('function desiredView()')).replace(/\r/g, '').split('\n\n')[0]);
ok(dv.length > 0, 'desiredView() not found');
const ask = (bossT, miniT) => { const c = vm.createContext({ state: 'play', menuFrom: '', SET: { zoom: 'normal' },
  bossActive: !!bossT, boss: bossT ? { t: bossT } : null, miniActive: !!miniT, miniOne: () => miniT ? { t: miniT } : null, bossZooms, miniZooms });
  try { vm.runInContext(dv + '\n;globalThis.__v = desiredView();', c); return c.__v; } catch (e) { return 'threw ' + e.message; } };
const lost = [...bosses].filter(t => ask(t, null) !== 'zoom'), lostMini = [...minis].filter(t => ask(null, t) !== 'zoom');
ok(!lost.length, 'zoomed at the wake, NOT kept zoomed by desiredView() (back to normal on the first frame): ' + lost.join(', '));
ok(!lostMini.length, 'minis zoomed at the wake, not kept zoomed by desiredView(): ' + lostMini.join(', '));
ok(ask('frog', null) === 'normal', 'a boss that never zoomed (the Frog King) must stay at the normal view');
ok(ask(null, null) === 'normal', 'no fight: normal view');

/* 3. ONE LIST: no other setView('zoom') a boss or mini could hide behind */
const sites = [...src.matchAll(/setView\('zoom'\)/g)].length;
ok(sites <= 4, sites + " setView('zoom') calls in main.js (the wake, the mini wake, the editor and resize): a new one belongs in src/boss-view.js");

if (fails.length) { for (const f of fails) console.log('FAIL ' + f); console.log(fails.length + ' FAILED'); process.exitCode = 1; }
else console.log('zoom-coverage: ' + bosses.size + ' bosses and ' + minis.size + ' minis zoom out at the wake, and desiredView() keeps every one of them zoomed all fight.');
