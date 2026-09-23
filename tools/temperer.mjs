// tools/temperer.mjs — THE TEMPERER ACTUALLY GOES, AND THE FIRE IS THE ONLY REASON HE IS DANGEROUS.
//
// A3 in as many words: a cooldown that is never initialised does not exist, `undefined <= 0` is false for ever,
// and the attack simply never fires while nothing tells you. He is the creature that rule was written for: his
// heat cooldown is the ONLY thing standing between "an ordinary goblin with a long blade" and the whole idea,
// and if it were left undefined he would walk her halls for a year and never once turn round. So his update
// function is run here, out of src/main.js, in a room with one brazier in it, and every state is forced:
//   cold -> he breaks off        the shoulder, then the run, with a lit brazier in reach
//   at the fire -> defenceless   e.open is set while he heats, which is the double-damage window
//   hot -> the quench            unblockable, ONE use, and the glow is spent whether it lands or not
//   the brazier out -> nothing   with no lit fire in reach he never goes, and stays on his ordinary blow
//   left alone -> it fades       the glow goes out on its own clock, so a hot blade can be outlasted
// and the placements are read off the BUILT level: three of them, each within reach of a lit brazier, none of
// them in the Forgemaster's forge hall (482-570), which is his and does not want a second fire idea in it.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { LEVELS } from '../src/level.js';

const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

// ---- A3: every cooldown he owns is a NUMBER the day he is spawned ----
const spawn = src.slice(src.indexOf("case 'temperer': enemies.push("));
const spawnLine = spawn.slice(0, spawn.indexOf('break;'));
for (const k of ['cd', 'heatCd', 'hot', 'open', 'quenched', 'shoved'])
  assert.match(spawnLine, new RegExp('\\b' + k + ':\\s*[^,}]'), k + ' is not initialised in his spawn case — A3, and he would simply never go');

// ---- the fight, lifted out and run ----
const a = src.indexOf('const TEMP = {'), b = src.indexOf('// THE ROPE CUTTER', a);
assert.ok(a > 0 && b > a, 'updateTemperer is not where this check expects it');
const TS = 16, DMG = { temperCut: 13, temperShove: 6, temperQuench: 20 };
const hits = [];
const ctx = {
  Math, TS, DMG, T: { AIR: 0 },
  P: { x: 0, y: 320, vx: 0, dead: false },
  props: [], parts: [], fires: [], enemies: [],
  SFX: new Proxy({}, { get: () => () => {} }),
  number: () => {}, ringAt: () => {}, burst: () => {}, shakeCam: () => {}, sparks: () => {},
  answered: () => false,
  tileAt: () => 1,                                        /* solid floor everywhere: nothing here is a ledge */
  damagePlayer: (x, dmg, o = {}) => { hits.push({ dmg, unblockable: !!o.unblockable, blow: o.blow || null }); return 'hit'; },
  moveBody: (e, dx) => { e.x += dx; return { ground: true, hitX: false }; },
};
vm.createContext(ctx);
vm.runInContext(src.slice(a, b), ctx);
vm.runInContext('__TEMP = TEMP', ctx);                     /* a `const` in a script is lexical, not a property of the context */
const TEMP = ctx.__TEMP;
assert.ok(TEMP && TEMP.heat > 0 && TEMP.hot > 0 && TEMP.cool > 0, 'his clock (TEMP) did not come out of main.js');

const him = (o = {}) => Object.assign({ t: 'temperer', x: 0, y: 320, vx: 0, vy: 0, w: 10, h: 14, face: 1,
  hp: 30, alive: true, speed: 26, mode: 'walk', modeT: 0, anim: 0, stagger: 0, ground: true,
  cd: 0, heatCd: 0, hot: 0, open: 0, quenched: 0, shoved: 0, fire: null }, o);
const brazier = (x, lit = true) => ({ t: 'brazier', x, y: 320, lit, tipped: !lit });
const run = (e, secs, stop) => { for (let i = 0; i < Math.round(secs * 60); i++) { ctx.updateTemperer(e, 1 / 60); if (stop && stop(e)) return true; } return false; };
const reset = (px = 0) => { ctx.P.x = px; ctx.P.vx = 0; ctx.props.length = 0; ctx.fires.length = 0; hits.length = 0; };

// 1. CROWDED, COLD, WITH A FIRE IN REACH: the shoulder, and the shoulder hands him to the run
reset(18); ctx.props.push(brazier(200));
{ const e = him();
  assert.ok(run(e, 2, x => x.mode === 'shoveTell'), 'crowded with a lit brazier in reach he never showed the shoulder');
  assert.ok(run(e, 2, x => x.mode === 'going'), 'the shoulder did not hand him to the run');
  assert.ok(hits.some(h => !h.unblockable && h.dmg === DMG.temperShove), 'the shoulder threw no blow, or threw one no shield turns');
  // 2. HE GETS THERE, AND AT THE FIRE HE IS OPEN
  assert.ok(run(e, 6, x => x.mode === 'heating'), 'he never reached the brazier he set off for');
  ctx.updateTemperer(e, 1 / 60);                          /* the frame after he arrives: the first one is the hand-over */
  assert.ok(e.open > 0, 'he is not open while he heats: the window the player CAUSED does not exist');
  assert.ok(run(e, TEMP.heat + 1, x => x.hot > 0), 'he left the fire without a hot blade');
  assert.equal(e.open, 0, 'he walks away from the fire still open');
  assert.ok(e.heatCd > 0, 'nothing stops him turning round and doing it again at once'); }

// 3. HOT: the quench is unblockable, it lights the ground, and it spends the glow whether it lands or not
reset(20); ctx.props.push(brazier(200));
{ const e = him({ hot: TEMP.hot, heatCd: TEMP.cool });
  assert.ok(run(e, 2, x => x.mode === 'quenchTell'), 'hot and in his face, he never reached for the quench — E2: it has to sit at the TOP of the chain');
  assert.ok(run(e, 2, x => hits.length > 0), 'the quench threw no blow');
  const q = hits[hits.length - 1];
  assert.equal(q.unblockable, true, 'THE QUENCH IS TURNED ON THE SHIELD: it is marked !! and must not be');
  assert.equal(q.dmg, DMG.temperQuench);
  assert.ok(ctx.fires.length > 0, 'the ground where it landed did not stay alight');
  assert.equal(e.hot, 0, 'the glow survived its own blow: it is one use');
  hits.length = 0; run(e, 4);
  assert.ok(!hits.some(h => h.unblockable), 'he threw a second unblockable off one trip to the fire: the glow is ONE use');
  assert.ok(hits.some(h => h.dmg === DMG.temperCut), 'cold again, he does not go back to his ordinary blow'); }

// 4. THE BRAZIER IS OUT: he has nowhere to go, and is an ordinary goblin with a long blade
reset(20); ctx.props.push(brazier(200, false));
{ const e = him();
  assert.ok(!run(e, 8, x => x.mode === 'going' || x.mode === 'heating' || x.hot > 0),
    'he went for a brazier that is not lit — putting the fire out is one of the three answers and it must work');
  assert.ok(hits.some(h => !h.unblockable && h.dmg === DMG.temperCut), 'with no fire to fetch he does not even throw his ordinary blow'); }

// 5. NOTHING IN REACH AT ALL: same answer, and he gives the run up rather than running at a wall for ever
reset(20); ctx.props.push(brazier(9000));
{ const e = him();
  assert.ok(!run(e, 8, x => x.hot > 0), 'he heated himself at a brazier a level away'); }

// 6. LEFT ALONE, THE GLOW GOES OUT. A hot blade can be outlasted; it is not a permanent upgrade.
reset(9000);
{ const e = him({ hot: TEMP.hot });
  assert.ok(run(e, TEMP.hot + 2, x => x.hot === 0), 'the glow never faded: it is meant to be on a timer, not on a hit');
  assert.equal(hits.length, 0); }

// ---- and where he stands in her castle ----
/* who counts as company: her garrison and her household, not the furniture and not the folk */
const GOBS = new Set(['soldier', 'javelin', 'heavy', 'pike', 'shield', 'archer', 'brute', 'hound', 'sentry',
  'gobmage', 'hearthgob', 'harpy', 'goat', 'rockgoblin', 'temperer']);
const L = LEVELS.find(l => l.id === 'crown').build();
const mine = L.ents.filter(e => e.t === 'temperer');
assert.ok(mine.length >= 2 && mine.length <= 3, 'two or three of him in Highcrown, never one and never a crowd: alone he is a non-event, and that is the point of him');
const fires = L.ents.filter(e => e.t === 'brazier');
for (const e of mine) {
  assert.ok(!(e.x >= 482 && e.x <= 570), 'a Temperer at ' + e.x + ' is in the forge hall, which is the Forgemaster\'s and does not want a second fire idea in it');
  const near = fires.filter(f => Math.abs(f.x - e.x) <= 20 && Math.abs(f.y - e.y) <= 2);
  assert.ok(near.length, 'the Temperer at ' + e.x + ',' + e.y + ' has no brazier on his own floor to fetch: A4, the room has to be able to give him his trick');
  /* company is the ROOM, not the row: a javelineer on a scaffold over your head is exactly the fight he is
     a tax on, so the window is a storey either way rather than the floor he happens to be standing on */
  const others = L.ents.filter(o => o !== e && GOBS.has(o.t) && Math.abs(o.x - e.x) < 30 && Math.abs(o.y - e.y) <= 8);
  assert.ok(others.length >= 2, 'the Temperer at ' + e.x + ' stands with ' + others.length + ' other goblins: he is a tax on your attention during somebody else\'s fight, so he is never met alone');
}
console.log('ok  temperer       ' + mine.length + ' in Highcrown, each by a brazier and in company; he shoulders off, runs, heats, '
  + 'and comes back with one unblockable that spends itself. With the fire out he never goes at all.');
