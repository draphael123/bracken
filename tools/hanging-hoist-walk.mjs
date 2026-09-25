/* tools/hanging-hoist-walk.mjs [heroes] - THE HANGING VILLAGE's machine, WALKED in the real page with real key input, no god mode
   (docs/briefs/hanging-village-rework.md §3, F9). The playtest bot (src/playtest.js) walks toward the gate's column and a switchback
   level defeats it, so it never reaches a hoist; this drives the hero there and does what a player does, once per hero (default
   knight,warden):
     ROPEWALK  walk onto a coil, carry it to the deck, hop on, walk into the well - the deck must rise to the market floor, and the
               hero must be able to step off onto it
     MILL      stand on the deck and cut the peg - the sack must drop in, the deck rise to the lamp ledge, and the lamp be taken
     NEST      carry the near sack in, fetch the far one off the springy bough's ledge, carry it back - the deck must wait for two
     CROWN     carry a stone in and ride up level with the Reeve's middle perch
   Each hoist must also TIP and come home once the hero is off it. Not in the suite: it is a minute of the page. */
import { openPage } from './cdp.mjs';
const heroes = (process.argv[2] || 'knight,warden').split(',');
const pg = await openPage({ audio: false, fonts: false });
let bad = 0;
try {
  for (const h of heroes) {
    const r = await pg.evalp(`(async () => {
      const LV = (await import('/src/level.js')).LEVELS, out = [], k = BK.keys, TS = 16;
      const fresh = () => { BK.setHero('${h}'); BK.load(LV.findIndex(l => l.id === 'hanging')); BK.state = 'play'; BK.start(); BK.god = false; BK.reset(); BK.sim(30); for (const e of BK.enemies()) e.alive = false; };
      const P = () => BK.P, H = id => BK.hoists().find(m => m.hoist === id), clear = () => { k.left = k.right = k.jump = k.up = k.down = k.atk = k.block = false; };
      const hold = (key, n, until) => { clear(); for (let i = 0; i < n; i++) { k[key] = true; BK.sim(1); if (until && until()) break; } clear(); };
      const hop = dir => { clear(); BK.press('jump'); for (let i = 0; i < 26; i++) { k.jump = true; if (dir) k[dir] = true; BK.sim(1); } clear(); BK.sim(20); };
      const note = (what, ok, extra) => out.push({ what, ok: !!ok, extra });
      const until = (cond, n = 1200) => { for (let i = 0; i < n && !cond(); i++) BK.sim(1); };
      const take = () => { clear(); k.down = true; BK.sim(1); k.down = false; BK.sim(3); return P().ballast; };   /* DOWN picks a load up */
      const at = m => ({ deck: Math.round(m.y), state: m.hs && m.hs.state, load: m.hs && m.hs.load, x: +(P().x / TS).toFixed(1), row: Math.floor(P().y / TS), onDeck: P().onMover === m, carrying: !!P().ballast });
      /* ROPEWALK: the coils at 11-15, the deck at 3-4, the well at 2 on the deck's far side */
      fresh(); let m = H('rope'); BK.tp(11, 93); BK.sim(20);
      note('rope: DOWN picked up a coil', take() && P().ballast.kind === 'coil');
      hold('left', 200, () => P().x < 6 * TS); hop('left'); hold('left', 60, () => m.hs && m.hs.load > 0);
      note('rope: stood on the deck and the coil went in the basket', m.hs && m.hs.load >= 1 && P().onMover === m, at(m));
      until(() => m.hs.state === 'top'); BK.sim(10); note('rope: the deck rose to the market floor with the hero on it', P().onMover === m && m.y === m.y1, at(m));
      hop('right'); hold('right', 30); note('rope: hopped off onto the market floor', P().ground && Math.floor(P().y / TS) === 80 && P().x > 6 * TS, at(m));
      until(() => m.hs.state === 'rest' && BK.props().filter(p => p.t === 'load' && p.hoist === 'rope' && p.state === 'free').length === 3); note('rope: the basket tipped and the deck came home, the coil back on its pile', m.hs.state === 'rest' && m.y === m.y0 && BK.props().filter(p => p.t === 'load' && p.hoist === 'rope' && p.state === 'free').length === 3, at(m));
      /* MILL: on the deck, cut the peg to the west of it */
      fresh(); m = H('mill'); BK.tp(76, 64); P().x = m.x + 5; P().y = m.y; P().vy = 0; BK.sim(4); clear(); k.left = true; BK.sim(1); clear();
      BK.press('atk'); BK.sim(24); const sack = BK.props().find(p => p.t === 'load' && p.hoist === 'mill');
      if (P().onMover !== m && m.hs && m.hs.state === 'creak') { hop(null); }
      BK.sim(40); note('mill: the peg cut dropped the sack in the basket', m.hs && m.hs.load >= 1, { sack: sack && sack.state, ...at(m) });
      until(() => m.hs.state === 'top'); BK.sim(10); note('mill: the deck rose to the lamp ledge with the hero on it', m.y === m.y1 && Math.abs(P().y - m.y) < 2 && Math.abs(P().x - m.x - 16) < 20, at(m));
      const lampsBefore = BK.strays(); hold('left', 60); note('mill: stepped onto the ledge and took the lamp', BK.strays() > lampsBefore && Math.floor(P().y / TS) === 59, { strays: BK.strays(), ...at(m) });
      until(() => sack.state === 'hung' && m.hs.state === 'rest'); note('mill: the sack was hauled back up onto its peg and the deck came home', sack.state === 'hung' && m.hs.state === 'rest', { sack: sack.state, ...at(m) });
      /* NEST: two sacks, one near, one up on the springy bough's ledge; the well at 64, east of the deck */
      fresh(); m = H('nest'); BK.tp(58, 51); BK.sim(10); take(); hold('right', 90, () => P().x > 62 * TS + 8); hop('right'); hold('right', 240, () => m.hs && m.hs.load > 0);
      note('nest: one sack in, and the deck waits for two', m.hs && m.hs.load === 1 && m.hs.state === 'rest', at(m));
      hold('left', 80, () => !P().onMover && P().ground); BK.tp(43, 42); BK.sim(10); take(); note('nest: took the far sack off the ledge', P().ballast);
      hold('right', 900, () => P().x > 62 * TS + 8 && P().ground && Math.floor(P().y / TS) === 52); hop('right'); hold('right', 240, () => m.hs.load >= 2);
      note('nest: two sacks in, and it rises with the hero on it', m.hs.load >= 2 && P().onMover === m, at(m));
      until(() => m.hs.state === 'top'); BK.sim(10); hold('right', 60); note('nest: rode up and stepped onto the relic nest', Math.floor(P().y / TS) === 44 && P().x > 65 * TS, { relic: P().relic, ...at(m) });
      /* CROWN: a stone in, and up level with the middle perch; the well at 56, west of the deck */
      fresh(); m = H('crown'); BK.tp(65, 19); BK.sim(10); for (const e of BK.enemies()) if (e.t === 'owl') { e.mode = 'sleep'; }
      take(); hold('left', 300, () => P().x < 60 * TS); hop('left'); hold('left', 60, () => m.hs.load > 0);
      note('crown: stood on the deck and a stone went in the basket', m.hs.load >= 1 && P().onMover === m, at(m));
      until(() => m.hs.state === 'top'); BK.sim(10); note('crown: rode up level with the middle perch', P().onMover === m && m.y === m.y1, at(m));
      hold('left', 40); note('crown: stepped onto the perch', P().ground && Math.floor(P().y / TS) === 12 && !P().onMover, at(m));
      clear(); return out; })()`, 600000);
    for (const x of r) { if (!x.ok) bad++; console.log((x.ok ? ' ok  ' : 'FAIL ') + h.padEnd(8) + x.what + (x.extra ? '  ' + JSON.stringify(x.extra) : '')); }
  }
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
  if (pg.errors.length) bad++;
} finally { pg.close(); }
process.exitCode = bad ? 1 : 0;
