// tools/arena-intruders.mjs - NOBODY WHO IS NOT THE FIGHT DROPS INTO A BOSS ARENA (claude/roofsweep, 11-13; the Headless Ploughman bug, batch178).
// In the Hexed Fields a squad hedge knight stood on the roof past the Ploughman's east gate (col 327, row 21), walked off its edge about two
// seconds after the hero entered and landed in the arena as a 200 hp foe: the garrison 'rooms' box starts at y0/16-2, one row too low for a roof.
// Node only, no page. Every shipped level (hidden ones skipped, as tools/spawns.mjs) is built the way the game builds it (lv.build(): the same
// seeded garrison and squads), and for the MINI and the ARENA of each level every foe ent that is not the encounter is asked:
//   INSIDE   it spawns inside the arena's x-range (x0..x1 in columns), at any row                                                     -> always a hit
//   (A foe that arenaShut() holds - a non-elite more than 2 columns outside the walls - is not asked: it cannot move once the fight is live.)
//   REACH    it spawns up to REACH_COLS columns outside the x-range, is a walker/chaser, and a walk-fall search from its feet can come to a
//            column inside the range: along a roof, over a ledge, round the gate. The walls (wallL and the gate/wallR: SIX rows, floor-6 .. floor-1, as main.js setWall
//            shuts them) are rock, as the fight shuts them, so the floor-level approach does not count: a foe that walks in
//            by the road before the hero is simply met first. A walker steps up one tile, walks off any edge and falls.
//   FLYER    a flyer within REACH_COLS columns of the range (a flyer crosses a wall) is listed as a hit unless whitelisted
// Exit code 1 on any hit that is not in ALLOW. To fix a real hit use the smallest L.calm box (see theHexedFields: [322, 332, 12, 33]).
// usage: node tools/arena-intruders.mjs [levelId ...]      (ARENA_INTRUDERS_ROOT=<dir> reads another checkout's src/ - for proving the base red)
import { readFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = process.env.ARENA_INTRUDERS_ROOT ? path.resolve(process.env.ARENA_INTRUDERS_ROOT) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { LEVELS, T, TS } = await import(pathToFileURL(path.join(ROOT, 'src/level.js')).href);
const MAIN = readFileSync(path.join(ROOT, 'src/main.js'), 'utf8');

const REACH_COLS = 12, ROOF_ROWS = 14;
/* A FOE IS A KIND WITH A SPAWN CASE IN src/main.js (as tools/spawns.mjs); HP is the EHP row where one is written as a plain number */
const KINDS = new Set(), HP = {}, ELITE = new Set();   /* ELITE: a spawn case that sets maxHp - src/main.js arenaShut() HOLDS every level foe outside x0-2..x1+2 when a fight wakes EXCEPT those with a maxHp, so only an elite (hedge knight, tide guard, sworn sword...) can walk in from outside the walls */
for (const m of MAIN.matchAll(/case '(\w+)':([^\n]*(?:\n(?!\s*case ')[^\n]*){0,3})/g)) if (/enemies\.push|boss = /.test(m[2])) KINDS.add(m[1]);
{ const i = MAIN.indexOf('const EHP = {'), seg = MAIN.slice(i, MAIN.indexOf('};', i)); for (const m of seg.matchAll(/\b(\w+): (\d+)\b/g)) HP[m[1]] = +m[2]; }
const FLIES = new Set(['bat', 'crow', 'wasp', 'harpy', 'kite', 'petrel', 'vulture', 'boo', 'haunt', 'imp', 'tome', 'broom', 'emberwisp', 'fledgling', 'gull', 'jelly', 'lanternshade', 'familiar', 'owl']);
/* NEVER A WALKER: swimmers, rooted things and the encounter's own machinery cannot walk off a roof */
const STILL = new Set(['eel', 'angler', 'urchin', 'puffer', 'lamprey', 'manta', 'siren', 'clinger', 'gill', 'lurker', 'sweep', 'mother', 'reefmaw', 'turret', 'spitcap', 'topiary']);

/* WHITELIST: 'levelId:arena|mini:kind@col,row' - a hit that was read and is not a fault (say why, next to it). Add nothing without a reason. */
const ALLOW = {
  'marsh:arena:spit@683,17': 'FALSE POSITIVE (read 11-13): the exam spitter on the near reeds of the court, placed by hand on the bank at the first tile of the arena (ent spit 361,17 in marshWood, shifted +322), before the trigger at col 689. Stationary, one blow, and the frog dais is 78 columns east: the hero passes it to reach the trigger.',
  'stockade:arena:archer@596,9': "FALSE POSITIVE: the Chieftain's own horn-blower on the hall rafters (horn:true, rafters:true, placed by hand over the chief at 595,19) - part of the encounter, the level's rule is the horn.",
  'scree:arena:ramlord@611,8': "FALSE POSITIVE: 'ramlord' is the boss's OWN spawn ent (arena boss 'ram'; ent('ramlord', 327, 8) in screePath, shifted +284), not a second foe.",
  'theatre:arena:marionette@460,33': "FALSE POSITIVE: the Puppeteer's cast (marionette 460,33 and harlequin 468,33, placed by hand on his stage; src/puppeteer-hands.js owns them) - the encounter itself.",
};

const bad = [], notes = [], rows = [];
const want = process.argv.slice(2);
for (const lv of LEVELS) {
  if ((lv.hidden && !lv.secret) || lv.id === 'custom' || (want.length && !want.includes(lv.id))) continue;
  const L = lv.build(), W = L.W, H = L.H, g = L.grid;
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : g[y * W + x];
  const solid = t => t === T.SOLID || t === T.CRATE || t === T.PALISADE || t === T.PORT || t === T.SOFT || t === T.ICE || t === T.WEB || t === T.CLIMB;
  const stand = t => solid(t) || t === T.ONEWAY || t === T.PLANK || t === T.SHELF || t === T.RAIL || t === T.CRYST || (t >= 20 && t <= 25);
  const foes = (L.ents || []).filter(e => KINDS.has(e.t) && !e.mini && !e.boss && !(e.t === (L.mini && L.mini.boss)) && !(e.t === (L.arena && L.arena.boss)));
  for (const [which, A] of [['mini', L.mini], ['arena', L.arena]]) {
    if (!A) continue;
    const x0 = Math.ceil(A.x0 / TS), x1 = Math.floor(A.x1 / TS), fl = Math.round(A.floor / TS);
    const top = A.y0 !== undefined ? Math.round(A.y0 / TS) : fl - 16;
    const walls = new Set([A.wallL, A.wallR, A.gate].filter(v => v !== undefined));
    const sealedL = A.boss === 'winchmaster' ? A.wallL : -1, tall0 = A.boss === 'mother';   /* main.js setWall: a wall is SIX rows (floor-6 .. floor-1); the Winchmaster's west wall runs to row 0 and the Mother's columns from row 0 */
    const isWall = (x, y) => walls.has(x) && y <= fl - 1 && (y >= fl - 6 || x === sealedL || tall0);
    const free = (x, y) => !solid(at(x, y)) && !isWall(x, y);
    /* settle from a start cell down onto the first standable tile; null = off the world or onto spikes */
    const settle = (x, y) => { for (let k = 0; k < 80; k++, y++) { if (y + 1 >= H) return null; if (stand(at(x, y + 1)) || isWall(x, y + 1)) return at(x, y + 1) === T.SPIKE ? null : y; } return null; };
    const inside = (x, y) => x >= x0 && x <= x1 && y >= top && y <= fl && !walls.has(x);   /* (landing in the arena's own rows) */
    const band = y => y >= top - ROOF_ROWS && y <= fl + 3;   /* the rows over and under the arena that can bear a roof or a floor of its own */
    for (const e of foes) {
      const dist = e.x < x0 ? x0 - e.x : e.x > x1 ? e.x - x1 : 0;
      if (dist > REACH_COLS || !band(e.y) || e.t === 'folk') continue;
      const held = dist > 2 && !ELITE.has(e.t);   /* arenaShut holds it where it stands: no walking, no throwing */
      const hp = HP[e.t] ?? '?', how = [], inRows = e.y >= top && e.y <= fl;
      if (dist === 0 && inRows) how.push('spawns INSIDE the arena (cols ' + x0 + '-' + x1 + ', rows ' + top + '-' + fl + ') at row ' + e.y);
      else if (held) continue;
      else if (FLIES.has(e.t)) {   /* a flyer crosses a wall: an air flood fill from its cell (rock stops it, the walls are rock up to the arena's top row) */
        const seen = new Set([e.x + ',' + e.y]), q = [[e.x, e.y]]; let hit = null, steps = 0;
        while (q.length && !hit && steps++ < 40000) { const [cx, cy] = q.shift();
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = cx + dx, ny = cy + dy, k = nx + ',' + ny; if (seen.has(k) || !free(nx, ny) || Math.abs(nx - e.x) > 40 || Math.abs(ny - e.y) > 30) continue; seen.add(k); if (inside(nx, ny)) { hit = [nx, ny]; break; } q.push([nx, ny]); } }
        if (hit) how.push('FLYER ' + dist + ' columns outside the range, open air to col ' + hit[0] + ' row ' + hit[1]); }
      else if (!STILL.has(e.t)) {
        const sy = settle(e.x, e.y); if (sy !== null) {
          const seen = new Set([e.x + ',' + sy]), q = [[e.x, sy]]; let hit = null, steps = 0;
          while (q.length && !hit && steps++ < 20000) {
            const [cx, cy] = q.shift();
            for (const d of [-1, 1]) {
              const nx = cx + d; let ny = cy;
              if (!free(nx, ny) || !free(nx, ny - 1)) { if (free(nx, ny - 1) && free(nx, ny - 2) && free(cx, ny - 2) && !solid(at(nx, ny - 1))) ny = cy - 1; else continue; }   /* one step up */
              const fy = settle(nx, ny); if (fy === null) continue;
              if (seen.has(nx + ',' + fy)) continue; seen.add(nx + ',' + fy);
              if (inside(nx, fy)) { hit = [nx, fy]; break; }
              if (Math.abs(nx - e.x) <= 40) q.push([nx, fy]);
            }
          }
          if (hit) how.push('walks/falls to col ' + hit[0] + ' row ' + hit[1] + ' (' + dist + ' columns outside the range, feet row ' + sy + (sy < top ? ', above the arena top row ' + top : '') + ')');
        }
      }
      if (!how.length) continue;
      const key = lv.id + ':' + which + ':' + e.t + '@' + e.x + ',' + e.y;
      const tag = (e.squad ? 'squad ' + e.squad : e.garrison ? 'garrison' : 'placed');
      const line = lv.id + ' ' + which + ' (' + (A.boss) + ' cols ' + x0 + '-' + x1 + ', floor ' + fl + '): ' + e.t + ' hp ' + hp + ' (' + tag + ') at col ' + e.x + ' row ' + e.y + ' - ' + how[0];
      rows.push({ key, line });
      if (ALLOW[key]) notes.push('allowed ' + key + ': ' + ALLOW[key]); else bad.push(line);
    }
  }
}
for (const r of rows) console.log((ALLOW[r.key] ? 'ok   ' : 'HIT  ') + r.line);
for (const n of notes) console.log(n);
if (bad.length) { console.error('\narena-intruders: ' + bad.length + ' foe(s) that are not the fight can get into a boss arena (see the HIT lines). Fix with the smallest L.calm box (see theHexedFields), or whitelist in ALLOW with the reason.'); process.exit(1); }
console.log('arena-intruders: ok (' + rows.length + ' listed, 0 unlisted)');
