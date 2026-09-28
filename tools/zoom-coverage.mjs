// tools/zoom-coverage.mjs - EVERY FIGHT THAT ZOOMS OUT AT ITS WAKE STAYS ZOOMED OUT (Node, static + vm).
// render() calls setView(desiredView()) every frame, so a wake's setView('zoom') lasts one frame unless desiredView()
// also asks for it. The Gate Gargoyle's lane (2026-09-25) found ten bosses - harbormaster, pyromancer, bellcrab,
// closedhelm, drownedking, prince, grandmother, troll, strawking, archmage - zoomed at the wake and back to normal by the
// first drawn frame. src/boss-view.js holds bossStart() and desiredView() to ONE shared answer (bossZooms/miniZooms),
// so that particular drift cannot recur; this now checks the shared answer itself.
//
// 2026-09-28 (Daniel, claude/bosszoom): "boss battles in general need to be more zoomed out." bossZooms()/miniZooms()
// flipped from an opt-IN list (every new boss defaulted to the normal view until someone remembered to add it) to an
// opt-OUT one (every boss and every mini with its own arena zooms by default; only a named, reasoned exception does
// not). So this file no longer hardcodes which bosses to expect - it reads every boss `L.arena.boss` and every mini
// `L.mini.boss` actually placed in the levels (src/*.js) the same way spawnEntities does, then checks EVERY one of
// them zooms unless src/boss-view.js excludes it by name. `--src <file>` runs step 2 against another main.js.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import vm from 'node:vm';
import { ZOOM_BOSS_EXCLUDE, ZOOM_MINI_EXCLUDE, bossZooms, miniZooms } from '../src/boss-view.js';
const ai = process.argv.indexOf('--src');
const SRC_DIR = new URL('../src/', import.meta.url);
const src = readFileSync(ai > 0 ? process.argv[ai + 1] : new URL('main.js', SRC_DIR), 'utf8');
const fails = [], ok = (c, m) => { if (!c) fails.push(m); };

/* 1. EVERY BOSS AND MINI ACTUALLY PLACED: every `arena: {...boss: 'x'...}` and `mini: {...boss: 'x'...}` object
   literal across src/**\/*.js - not just src/*.js: a level's own arena/mini is as often built by its draft
   (src/draft/*.js, e.g. the Dune Worm's hollow) as it is inline, and a level builds its own arena/mini as
   `const arena = {...}` as often as inline, so this matches either `arena:` or `arena =`. Read the same
   brace-balanced way a hand would, not a single-line regex - several arenas nest another object (dais, housings)
   before their own `boss:` key. */
const allJsFiles = (dir) => { const out = [];
  for (const f of readdirSync(dir)) { const p = new URL(f, dir);
    if (statSync(p).isDirectory()) out.push(...allJsFiles(new URL(f + '/', dir)));
    else if (f.endsWith('.js')) out.push(p); }
  return out; };
const SRC_FILES = allJsFiles(SRC_DIR);
const placed = (keyRe) => { const out = new Set();
  for (const f of SRC_FILES) {
    const body = readFileSync(f, 'utf8'); let idx = 0;
    while (true) { const rest = body.slice(idx); const m = rest.match(keyRe); if (!m) break;
      const start = idx + m.index + m[0].length - 1; let depth = 0, i = start;
      for (; i < body.length; i++) { if (body[i] === '{') depth++; else if (body[i] === '}') { depth--; if (depth === 0) break; } }
      const bm = body.slice(start, i + 1).match(/\bboss:\s*'(\w+)'/); if (bm) out.add(bm[1]);
      idx = i + 1; } }
  return out; };
const bosses = placed(/\barena\s*[:=]\s*\{/), minis = placed(/\bmini\s*[:=]\s*\{/);
ok(bosses.size >= 25, 'only found ' + bosses.size + ' placed boss arenas across src/*.js: the reader broke');
ok(minis.size >= 10, 'only found ' + minis.size + ' placed mini arenas across src/*.js: the reader broke');
for (const t of ['harbormaster', 'pyromancer', 'bellcrab', 'closedhelm', 'drownedking', 'prince', 'grandmother', 'troll', 'strawking', 'archmage', 'gargoyle', 'queen', 'mother', 'ram', 'abbot', 'winchmaster', 'duneworm'])
  ok(bosses.has(t), t + "'s arena was not found (level file renamed or restructured?)");
ok(minis.has('golem'), "the Monastery Golem's mini arena was not found");

/* 2. bossZooms()/miniZooms() AGREE WITH THE EXCLUDE LISTS: every placed boss/mini zooms unless named as an exception,
   and every named exception actually exists (no stale name silently doing nothing). */
for (const t of bosses) ok(bossZooms(t) === !ZOOM_BOSS_EXCLUDE.has(t), t + ": bossZooms() disagrees with ZOOM_BOSS_EXCLUDE");
for (const t of minis) ok(miniZooms(t) === !ZOOM_MINI_EXCLUDE.has(t), t + ": miniZooms() disagrees with ZOOM_MINI_EXCLUDE");
for (const t of ZOOM_BOSS_EXCLUDE) ok(bosses.has(t), "ZOOM_BOSS_EXCLUDE names '" + t + "', which is not a placed boss any more");
for (const t of ZOOM_MINI_EXCLUDE) ok(minis.has(t), "ZOOM_MINI_EXCLUDE names '" + t + "', which is not a placed mini any more");

/* 3. THE WAKE ZOOMS EXACTLY WHAT bossZooms()/miniZooms() SAY: bossStart() and the mini wake must read the shared
   function, not their own per-name test (that is the drift the Gate Gargoyle's lane found in the first place). */
const cut = (from, to) => { const i = src.indexOf(from); return i < 0 ? '' : src.slice(i, src.indexOf(to, i + from.length)); };
const bossWake = cut('function bossStart()', '\nfunction ');
const miniWake = (src.match(/[^\n]*const mb = miniOne\(\); if \(mb\) \{ miniActive = true;[^\n]*/) || [''])[0];
ok(bossWake.length > 0, 'bossStart() not found');
ok(miniWake.length > 0, 'the mini wake (miniActive = true) not found');
ok(/if \(bossZooms\(boss\.t\)\) setView\('zoom'\)/.test(bossWake), "bossStart() no longer zooms through bossZooms(boss.t) - a literal per-boss test would drift from desiredView() again");
ok(/if \(miniZooms\(mb\.t\)\) setView\('zoom'\)/.test(miniWake), "the mini wake no longer zooms through miniZooms(mb.t) - a literal per-mini test would drift from desiredView() again");

/* 4. AND WHAT desiredView() KEEPS: the real function, run in a vm for each placed boss/mini mid-fight - every one
   bossZooms()/miniZooms() call true must come back 'zoom', and an excluded one must stay 'normal'. */
const dv = (src.slice(src.indexOf('function desiredView()')).replace(/\r/g, '').split('\n\n')[0]);
ok(dv.length > 0, 'desiredView() not found');
const ask = (bossT, miniT) => { const c = vm.createContext({ state: 'play', menuFrom: '', SET: { zoom: 'normal' },
  bossActive: !!bossT, boss: bossT ? { t: bossT } : null, miniActive: !!miniT, miniOne: () => miniT ? { t: miniT } : null, bossZooms, miniZooms });
  try { vm.runInContext(dv + '\n;globalThis.__v = desiredView();', c); return c.__v; } catch (e) { return 'threw ' + e.message; } };
const wantBoss = [...bosses].filter(t => !ZOOM_BOSS_EXCLUDE.has(t)), wantMini = [...minis].filter(t => !ZOOM_MINI_EXCLUDE.has(t));
const lost = wantBoss.filter(t => ask(t, null) !== 'zoom'), lostMini = wantMini.filter(t => ask(null, t) !== 'zoom');
ok(!lost.length, 'zooms per bossZooms(), NOT kept zoomed by desiredView() (back to normal on the first frame): ' + lost.join(', '));
ok(!lostMini.length, 'minis that zoom per miniZooms(), not kept zoomed by desiredView(): ' + lostMini.join(', '));
for (const t of ZOOM_BOSS_EXCLUDE) ok(ask(t, null) === 'normal', t + ' is excluded but desiredView() still zooms it');
for (const t of ZOOM_MINI_EXCLUDE) ok(ask(null, t) === 'normal', t + ' is excluded but desiredView() still zooms it');
ok(ask(null, null) === 'normal', 'no fight: normal view');

/* 5. ONE LIST: no other setView('zoom') a boss or mini could hide behind */
const sites = [...src.matchAll(/setView\('zoom'\)/g)].length;
ok(sites <= 4, sites + " setView('zoom') calls in main.js (the wake, the mini wake, the editor and resize): a new one belongs in src/boss-view.js");

if (fails.length) { for (const f of fails) console.log('FAIL ' + f); console.log(fails.length + ' FAILED'); process.exitCode = 1; }
else console.log('zoom-coverage: ' + bosses.size + ' placed bosses (' + (bosses.size - ZOOM_BOSS_EXCLUDE.size) + ' zoomed, ' + ZOOM_BOSS_EXCLUDE.size + ' excluded) and '
  + minis.size + ' placed minis (' + (minis.size - ZOOM_MINI_EXCLUDE.size) + ' zoomed, ' + ZOOM_MINI_EXCLUDE.size + ' excluded) all agree: bossStart(), the mini wake and desiredView() zoom exactly the same fights.');
