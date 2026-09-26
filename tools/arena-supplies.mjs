/* tools/arena-supplies.mjs — A12: THE ARENA MUST SUPPLY WHAT THE ATTACKS ASSUME. Node only: no page, no port, no Chrome.

   THE QUESTION IT ANSWERS. A boss's attacks carry height conditions - `P.y > A.floor - 80` says "this lands on you
   unless you are eighty pixels over the floor". That is a promise the ROOM has to keep. This reads every boss's own
   code for those conditions, floods every arena for the ground a hero can actually stand on, and fails when a fight
   written for height is fought in a room that has none.

   WHY IT EXISTS. Twice in one day, 2026-09-23, and both rooms say so in their own comments now:
     THE BURIED DEAD - src/burial-expansion.js: "the poison nova only lands within 80px of the floor, the erupt
     within 90 ... There was one tier at row 29, which is 48px up ... So there was nowhere in this room to stand that
     the nova could not reach, in a fight whose code says there should be."
     THE PALADIN - src/level.js, the Waymeet yard: "THE BASH only lands within 44px of the floor, the OATH within 28.
     The yard was eleven rows of open air over a flat street, so neither could ever be answered with your feet."
   Both fights were WRITTEN for height and neither room had any. Both were found by playing the game.

   WHAT IT CHECKS, EXACTLY - and it is deliberately the narrow, certain version of the rule, because a false positive
   here sends somebody to rebuild a room that was fine:

   1. THE LOWEST BLOW YOU CANNOT JUMP MUST BE ONE YOU CAN STAND ABOVE. A guard of `P.y > FLOOR - N` under about fifty
      pixels is answered by jumping, and the game says so itself: 'SLAM: JUMP', 'THE LOW RAKE: JUMP', 'LOW SHOTS:
      JUMP'. The jump comes from src/reachcore.js's own numbers (JUMPV, G), so there is one answer to how high a hero
      goes and not two. Above that, the room owes you footing - and it owes it at the LOWEST such height, not the
      tallest. The tallest blow in a fight is allowed to reach everywhere on purpose: the Waymeet yard's own comment
      says "Deliberately NOT higher: JUDGEMENT reaches 110px, and a ledge over that would be a roof to sit on rather
      than a place to stand." Demanding the tallest would have flagged that deliberate decision as a bug.
   2. A BLOW THAT ONLY LANDS ON A HERO UP HIGH NEEDS SOMEWHERE UP HIGH. `P.y < FLOOR - N` is the other half of the
      same rule (the Spore Mother's cap clap, the Pyromancer's stall, the Straw King's scaffold): if the room has no
      ground at N, the attack can never fire and nothing tells you.

   WHAT IT DOES NOT CHECK, SAID OUT LOUD, because a metric that skips unknown inputs does not fail - it returns a
   confident smaller number, and that is how a 108 was read as a 56 earlier this week. Every run prints the count:
     - GUARDS MEASURED AGAINST THE BOSS (`Math.abs(P.y - e.y) < 30`) are read and NOT scored. They measure a boss that
       walks and climbs, not the room, so the room cannot be judged from them.
     - GUARDS INSIDE A BAND (`P.y < floor - 28 && P.y > floor - 112`) are read and NOT scored: the floor itself is
       already outside the band, so the room answers them by existing.
     - GUARDS WHOSE NUMBER IS NOT A NUMBER (`floor - SOME.table.h`) are UNREAD and every one is named.
     - DISTANCES, WALLS, HAZARDS AND PROPS are not read at all. A12 covers those too; this tool covers height only.
   Run it and read the coverage block: rooms found, rooms whose code was read, rooms scored, and what was skipped. */
import assert from 'node:assert/strict';
import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));   /* not .pathname: a space in the folder name arrives as %20 */
const TS = 16;                                                /* the grid's tile, as level.js builds it */

/* ---- 1. THE JUMP, from the model that already decides where a hero can stand -------------------------------- */
const reachSrc = readFileSync(join(ROOT, 'src/reachcore.js'), 'utf8');
const jv = reachSrc.match(/JUMPV\s*=\s*-?(\d+)/), gg = reachSrc.match(/\bG\s*=\s*(\d+)/);
assert.ok(jv && gg, 'src/reachcore.js no longer states JUMPV and G where this tool reads them: it cannot say how high a hero jumps, and every height below would be scored on a guess');
const APEX = (+jv[1]) ** 2 / (2 * +gg[1]);    /* 51.2px: the top of a plain jump off flat ground */

/* ---- 2. EVERY FUNCTION IN src/, BY NAME ---------------------------------------------------------------------- */
const files = [];
const walk = d => { for (const f of readdirSync(join(ROOT, d))) { const p = join(d, f); if (statSync(join(ROOT, p)).isDirectory()) walk(p); else if (/\.js$/.test(f)) files.push(p); } };
walk('src');
const braced = (s, i) => { let d = 0; for (let j = i; j < s.length; j++) { if (s[j] === '{') d++; else if (s[j] === '}' && !--d) return s.slice(i, j + 1); } return s.slice(i); };
const DEFS = new Map(), ALIAS = new Map();
for (const f of files) {
  const s = readFileSync(join(ROOT, f), 'utf8');
  for (const m of s.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g)) {
    const o = s.indexOf('{', m.index + m[0].length - 1); if (o < 0) continue;
    (DEFS.get(m[1]) || DEFS.set(m[1], []).get(m[1])).push({ file: f.replace(/\\/g, '/'), name: m[1], body: braced(s, o) });
  }
  /* `import { updateBuriedDead as stepBuriedDead }`: main.js wraps nearly every boss module under a second name */
  for (const m of s.matchAll(/([A-Za-z_$][\w$]*)\s+as\s+([A-Za-z_$][\w$]*)/g)) ALIAS.set(m[2], m[1]);
}
assert.ok(DEFS.size > 400, 'only ' + DEFS.size + ' functions were read out of src/: the parse has stopped working and this check is now guarding nothing');

/* ---- 3. WHICH FUNCTION IS WHICH BOSS ------------------------------------------------------------------------- */
/* updateEnemies dispatches on e.t, one line per creature, so the table is read out of main.js rather than written
   here: a boss added there is covered here the day it is added. */
const main = readFileSync(join(ROOT, 'src/main.js'), 'utf8');
const DISPATCH = new Map();
for (const m of main.matchAll(/e\.t\s*===\s*'([a-z]+)'[^\n]*?(update[A-Za-z]+)\s*\(\s*e\s*,\s*dt/g)) if (!DISPATCH.has(m[1])) DISPATCH.set(m[1], m[2]);
/* THE ONE THAT IS NOT DISPATCHED ON e.t: Stormwreck's boatswain goes through `if (e.salvage)`, so it would otherwise
   be a boss this tool never read and never said it had not read. */
if (!DISPATCH.has('bosun') && /updateSalvageCaptain\s*\(/.test(main)) DISPATCH.set('bosun', 'updateSalvageCaptain');
assert.ok(DISPATCH.size > 60, 'only ' + DISPATCH.size + " creature kinds were read out of main.js's update chain: the parse has stopped working");

/* A boss's own code: its update function, and every update/step it hands the work on to (main.js wraps most of them
   and the real fight lives in src/<boss>.js). Aliases are followed, so the wrapper's `stepBuriedDead` lands on
   buried-dead.js's `updateBuriedDead`. */
const bossSource = fn => {
  const out = [], seen = new Set(), q = [fn];
  while (q.length) {
    const n = q.pop(); if (seen.has(n)) continue; seen.add(n);
    const d = DEFS.get(n);
    if (!d) { const a = ALIAS.get(n); if (a && !seen.has(a)) q.push(a); continue; }
    for (const one of d) { out.push(one); for (const m of one.body.matchAll(/\b((?:update|step)[A-Za-z]+)\s*\(/g)) if (!seen.has(m[1])) q.push(m[1]); }
  }
  return out;
};

/* ---- 4. THE HEIGHT GUARDS IN A BOSS'S CODE ------------------------------------------------------------------- */
const ESC = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const NUM = /^\s*(?:(\d+)|(\d+)\s*\*\s*TS|TS\s*\*\s*(\d+))\s*$/;     /* 80, or 2 * TS. Anything else is UNREAD, and named. */
/* the statement a match sits in, so `P.y > floor - 112` can see the `P.y < floor - 28` it is ANDed with */
const stmt = (b, i) => { let a = i, z = i; while (a > 0 && i - a < 400 && !'{};'.includes(b[a - 1])) a--; while (z < b.length && z - i < 400 && !'{};'.includes(b[z])) z++; return b.slice(a, z); };
/* the mode this guard belongs to, for naming it: the nearest 'xxxTell' or case 'xxx' behind it */
const attackNear = (b, i) => { const w = b.slice(Math.max(0, i - 420), i); let last = null;
  for (const m of w.matchAll(/'([a-zA-Z][\w]*Tell)'|case\s*'([a-zA-Z][\w]*)'|e\.mode\s*===?\s*'([a-zA-Z][\w]*)'/g)) last = m[1] || m[2] || m[3];
  return last || '(unnamed)'; };

function readGuards(fns) {
  const need = [], band = [], bossRel = [], unread = [];
  for (const s of fns) {
    const b = s.body;
    /* what THIS function calls the arena floor: A.floor, M.floor, or a local standing for one of them */
    const al = new Set(['A.floor', 'M.floor']);
    for (const m of b.matchAll(/(?:const|let|var|,)\s*([A-Za-z_$][\w$]*)\s*=\s*[AM]\.floor\b/g)) al.add(m[1]);
    for (const m of b.matchAll(/(?:const|let|var|,)\s*([A-Za-z_$][\w$]*)\s*=\s*L\.(?:arena|mini)\.floor\b/g)) al.add(m[1]);
    const F = [...al].map(ESC).join('|');
    const take = (m, dir, raw) => {
      const num = NUM.exec(raw);
      const at = { fn: s.name, file: s.file, mode: attackNear(b, m.index), dir, text: m[0].replace(/\s+/g, ' ') };
      if (!num) { unread.push(at); return; }
      at.n = +(num[1] ?? num[2] ?? num[3]);
      /* A BAND has its own way out. `P.y < floor - 28 && P.y > floor - 112` is a blow that lands between 28 and 112
         over the floor: the floor itself is below it, so the room answers it by existing and the 112 is not a debt.
         (`P.y - P.h` is the hero's HEAD - a ducking test, never a test of the room.) */
      if (dir === 'above' && new RegExp('P\\.y\\s*(?:-\\s*P\\.h\\s*)?(?:<=|<)\\s*(?:' + F + ')\\s*-').test(stmt(b, m.index).replace(/\s+/g, ''))) { band.push(at); return; }
      need.push(at);
    };
    /* `P.y > A.floor - 80`: it lands unless you are 80 over the floor */
    for (const m of b.matchAll(new RegExp('P\\.y\\s*(?:>=|>)\\s*(?:' + F + ')\\s*-\\s*([^;,:)&|{?]{1,24})', 'g'))) take(m, 'above', m[1]);
    /* `Math.abs(P.y - floor) < 30`: the same thing said the other way */
    for (const m of b.matchAll(new RegExp('Math\\.abs\\(\\s*P\\.y\\s*-\\s*(?:' + F + ')\\s*\\)\\s*(?:<=|<)\\s*([^;,:)&|{?]{1,24})', 'g'))) take(m, 'above', m[1]);
    /* `P.y < floor - 28`: it only lands on a hero who is already up there */
    for (const m of b.matchAll(new RegExp('P\\.y\\s*(?:<=|<)\\s*(?:' + F + ')\\s*-\\s*([^;,:)&|{?]{1,24})', 'g'))) {
      if (/P\.y\s*-\s*P\.h/.test(b.slice(Math.max(0, m.index - 6), m.index + 8))) continue;   /* the head, not the feet */
      take(m, 'up', m[1]);
    }
    /* measured against the boss, not the room: read, counted, never scored */
    for (const m of b.matchAll(/Math\.abs\(\s*P\.y\s*-\s*e\.y\s*\)\s*(?:<=|<)\s*(\d+)/g)) bossRel.push({ fn: s.name, n: +m[1], mode: attackNear(b, m.index) });
  }
  return { need, band, bossRel, unread };
}

/* ---- 5. WHERE A HERO CAN STAND IN THE ROOM ------------------------------------------------------------------- */
/* The flood is src/reachcore.js's, the same one the coin sprinkler and tools/reach.mjs use, so there is one answer to
   "standable" and not two. It is SEEDED with each room's own floor as well as the level's start: the arena walls shut
   behind you, and a room measured only through its door would be measured as if the door were still open. Only ground
   INSIDE the walls is counted. */
const heightsOf = (L, A, seen) => {
  const c0 = A.wallL !== undefined ? A.wallL + 1 : Math.ceil(A.x0 / TS);
  const c1 = A.wallR !== undefined ? A.wallR - 1 : Math.floor(A.x1 / TS);
  const top = (A.y0 !== undefined ? Math.round(A.y0 / TS) : Math.round(A.floor / TS) - 16) - 1;
  const fr = Math.round(A.floor / TS);
  const hs = new Map();
  for (let x = c0; x <= c1; x++) for (let y = top; y < fr; y++) {
    if (!seen.has(x + ',' + y)) continue;
    const h = A.floor - (y + 1) * TS;              /* footing row y means the feet rest at (y+1)*TS */
    if (h >= 0) hs.set(h, (hs.get(h) || 0) + 1);
  }
  return hs;
};

/* ---- 6. EVERY ROOM IN THE GAME ------------------------------------------------------------------------------- */
const rooms = [];
for (const lv of LEVELS) {
  let L; try { L = lv.build(); } catch (e) { rooms.push({ id: lv.id, which: '-', boss: '?', broken: e.message }); continue; }
  const here = ['arena', 'mini'].map(k => [k, L[k]]).filter(([, A]) => A && A.boss);
  if (!here.length) continue;
  const seeds = [];
  for (const [, A] of here) { const r = Math.round(A.floor / TS) - 1; for (let x = Math.ceil(A.x0 / TS); x <= Math.floor(A.x1 / TS); x++) seeds.push([x, r]); }
  const { seen } = floodReach(L, T, { rides: true, seeds });
  for (const [k, A] of here) rooms.push({ id: lv.id, which: k, boss: A.boss, heights: heightsOf(L, A, seen) });
}

assert.ok(rooms.length > 30, 'only ' + rooms.length + ' boss rooms were found in LEVELS: the arena/mini parse has stopped working and this check is now guarding nothing');

const LIST = process.argv.includes('--list');   /* every room, every guard, and the ground it has: for reading by hand */
const fail = [], unreadable = [], noCode = [], scoredRooms = new Set();
let scored = 0, guardsRead = 0, guardsScored = 0, bandSkipped = 0, bossRelSkipped = 0, withGuards = 0;
const overreach = [];
for (const r of rooms) {
  if (r.broken) { noCode.push(r.id + '/' + r.which + ' (the level would not build: ' + r.broken + ')'); continue; }
  const fn = DISPATCH.get(r.boss);
  if (!fn) { noCode.push(r.id + '/' + r.boss + ' (no update function found for it in main.js)'); continue; }
  const fns = bossSource(fn);
  if (!fns.length) { noCode.push(r.id + '/' + r.boss + ' (' + fn + ' is dispatched but not defined in src/)'); continue; }
  const g = readGuards(fns);
  guardsRead += g.need.length + g.band.length; bandSkipped += g.band.length; bossRelSkipped += g.bossRel.length;
  for (const u of g.unread) unreadable.push(r.id + '/' + r.boss + ' ' + u.mode + ': ' + u.text + '  (' + u.file + ')');
  const tall = r.heights.size ? Math.max(...r.heights.keys()) : 0;
  if (LIST) console.log((r.id + '/' + r.boss).padEnd(26) + 'ground ' + [...r.heights.keys()].sort((a, b) => a - b).join(',').padEnd(26)
    + ' guards ' + (g.need.map(x => x.mode + ' ' + (x.dir === 'up' ? '>' : '<') + x.n).join(' ') || '-')
    + (g.band.length ? '  [band ' + g.band.map(x => x.mode + ' ' + x.n).join(' ') + ']' : '')
    + (g.bossRel.length ? '  [vs boss ' + g.bossRel.length + ']' : ''));
  if (!g.need.length) continue;
  withGuards++;

  /* 1. the lowest blow a jump cannot clear must have ground over it */
  const above = g.need.filter(x => x.dir === 'above' && x.n > APEX).sort((a, b) => a.n - b.n);
  /* 2. a blow that only lands on a hero up high needs somewhere up high */
  const up = g.need.filter(x => x.dir === 'up').sort((a, b) => b.n - a.n);
  if (above.length || up.length) { scored++; scoredRooms.add(r.boss); guardsScored += above.length + up.length; }
  const broke = above.length && tall < above[0].n;
  if (broke)
    fail.push('  ' + (r.id + '/' + r.boss).padEnd(26) + ' its ' + above[0].mode + ' only lands within ' + above[0].n + 'px of the floor, and the tallest ground a hero can stand on in that room is '
      + (r.heights.size > 1 ? tall + 'px' : 'the floor itself') + '.\n' + ' '.repeat(29) + 'A jump off the floor tops out at ' + APEX + 'px, so there is nowhere in the room to answer it. '
      + (above.length > 1 ? 'Nor its ' + above.slice(1).map(x => x.mode + ' (' + x.n + 'px)').join(', ') + '. ' : '')
      + 'Give the room a tier at ' + above[0].n + 'px or more (' + Math.ceil(above[0].n / TS) + ' rows), or bring the attack down to something a jump answers.');
  for (const u of up) if (tall < u.n)
    fail.push('  ' + (r.id + '/' + r.boss).padEnd(26) + ' its ' + u.mode + ' ONLY lands on a hero ' + u.n + 'px or more over the floor, and the tallest ground in that room is '
      + (r.heights.size > 1 ? tall + 'px' : 'the floor itself') + ' - so it can never fire, and nothing will tell you.\n' + ' '.repeat(29)
      + 'Give the room ground at ' + u.n + 'px, or take the height condition off the attack.');
  /* the blows the room does not answer but is not failed for: the tallest one in a fight is allowed to reach
     everywhere, and in the Waymeet yard it is on purpose. Printed so nobody has to take that on trust. */
  if (!broke) for (const a of above) if (tall < a.n) overreach.push(r.id + '/' + r.boss + ' ' + a.mode + ' ' + a.n + 'px over ' + tall + 'px of ground');
}

/* ---- 7. WHAT WAS AND WAS NOT MEASURED, every run ------------------------------------------------------------- */
console.log('arena-supplies: ' + rooms.length + ' boss rooms across ' + LEVELS.length + ' levels; ' + (rooms.length - noCode.length) + ' had code this tool could read; '
  + withGuards + ' write a floor-height condition; ' + scored + ' of those put their room to a test.');
console.log('  ' + guardsRead + ' floor-height guards read, ' + guardsScored + ' scored. NOT scored: '
  + (guardsRead - bandSkipped - guardsScored) + ' inside a plain jump (' + APEX + 'px) and so answered anywhere, '
  + bandSkipped + ' inside a band (the floor is already outside it), '
  + bossRelSkipped + ' measured against the boss rather than the floor.');
if (noCode.length) console.log('  NO CODE READ for ' + noCode.length + ' room(s) - these are NOT covered by this check:\n    ' + noCode.join('\n    '));
if (unreadable.length) console.log('  UNREAD (the height is not a plain number, so it was not scored):\n    ' + unreadable.join('\n    '));
if (overreach.length) console.log('  reaches everywhere, and may be meant to (the Waymeet yard says its JUDGEMENT is): ' + overreach.join('; '));

/* THE TWO ROOMS THAT EARNED THE RULE MUST STILL BE SCORED. A check that quietly stops reading a boss does not fail,
   it prints a smaller number and says everything passes. If either of these two ever falls out of the reading, this
   tool is no longer checking the thing it was written for, and it should say so instead of going green. */
for (const [who, why] of [['burieddead', "the nova's 80px and the erupt's 90px over the ossuary's tiers"], ['closedhelm', "the judgement's 90px over the Waymeet yard's tombs"]])
  assert.ok(scoredRooms.has(who), 'THIS CHECK HAS GONE VACUOUS: ' + who + ' no longer reaches the scoring, so ' + why
    + ' is not being read. That is the bug this tool exists for. Fix the reading before trusting any run of it.');

if (fail.length) assert.fail(fail.length + ' boss room(s) do not supply the height their own attacks are written around (A12):\n' + fail.join('\n')
  + '\n  An attack you can only answer by standing somewhere the room does not contain is an attack with no answer.'
  + '\n  DO NOT re-tune the attack to hide this without asking: it is the room that is usually wrong.');

console.log('ok  arena-supplies  ' + rooms.length + ' boss rooms, ' + guardsScored + ' height conditions scored against the ground their arenas actually offer; every one has somewhere to stand.');
