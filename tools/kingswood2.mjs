// tools/kingswood2.mjs - KINGSWOOD 2, THE KING'S HUNTING WOOD (claude/kingswood2, the opus greybox of the level; Node, no page). It replaces tools/kings2-beats.mjs, which
// pinned the old grafted wood's beats (fork one's high-road plate, the fired wood, the toll bridge...) that the rework (Daniel 10-14: "fine but very BLAND") took out.
//   THE ROAD: Rootway > Underleaf > Palisade Wood > Kingswood > Scree; gated by level-quality; the rule line; the five named areas in order (Daniel's brief); THE GREAT OAK drawn on the skyline.
//   THE ROUTE: the fill reaches every shrine, silver, the mini, the King and the court gate's plate; every REQUIRED rope is a LOCK (without its drop the next shrine is
//   out of reach): the checkpoint's cage, the stands' log span, the three cages of the cage stair; the taught ropes and the log traps are weapons, not locks.
//   THE RULE'S ARC: taught safe (the sleeping brute, a sign at the peg), developed, remixed, examined (A4) - each rope's load drawn to where it lands (L.hoists has the
//   numbers the drawing uses); every log trap's road ends at a wall inside its rollMax and has foes on it; every area closes on a shrine after its exam (A10c).
//   THE PROCESSION: six marchers on the carpet road, out of view of the trigger, nothing solid on the road between them and the side gate they leave by (they walk it),
//   the boughs four rows over the road (no jump from it, a board step up) - so hiding is real; the ambush pegs stand on the boughs.
//   THE HANDS IN A FAKE WORLD: a cut cage falls and lands (a step's cells solid, the brute under it crushed), a span lands as one-way cells, a log trap rolls through the
//   foes on its road and splits at the wall; a marcher keeps step under a hero on the boughs and leaves by the side gate; a hero on the road turns the whole court.
//   FIRE IS SAVED FOR THE ESCAPE: no firepit, fire vent or brazier in the level (the old wood had 22).
//     node tools/kingswood2.mjs
import { readFileSync } from 'node:fs';
import { install } from './node-canvas.mjs';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { KINGSWOOD, SECTIONS, ARCS } from '../src/kingswood.js';
import { makeKingswoodHands, KW_SAY, ROPE } from '../src/kingswood-hands.js';
install();
const TS = 16;
let bad = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
const lv = LEVELS.find(l => l.id === 'kings'), L = lv.build();
const src = f => readFileSync(new URL('../' + f, import.meta.url), 'utf8');

// ---- THE ROAD ----
ok(lv.needs === 'palisadewood' && LEVELS.find(l => l.id === 'palisadewood').needs === 'underleaf' && LEVELS.find(l => l.id === 'underleaf').needs === 'rootway' && LEVELS.find(l => l.id === 'scree').needs === 'kings' && LEVELS.find(l => l.id === 'hanging').needs === 'scree', 'Rootway > UNDERLEAF > PALISADE WOOD > KINGSWOOD > Scree > Hanging (claude/underleaf4, Daniel 10-25)');   /* (BATCH120: the Palisade Wood is on the road before Kingswood, claude/palisadewood) */
ok(lv.rule === 'THE COURT HOLDS THE ROAD, AND WHAT HANGS OVER IT CAN BE DROPPED ON IT.', 'the rule line (true to the code: the court holds the road with checkpoints and a procession; ropes and plates drop what hangs)');
ok(/GATE = \[[^\]]*'kings'/.test(src('tools/level-quality.mjs')), 'gated by level-quality');
ok(L.kwood === true && L.W === KINGSWOOD.W, 'the level is src/kingswood.js (L.kwood)');
ok(SECTIONS.map(s => s[0]).join('|') === "THE ROYAL ROAD|THE HUNTING STANDS|THE CAGE GROVE|THE COURT'S PROCESSION|THE KING'S HALL|THE BURNING WOOD|THE KING'S GLADE" && L.sections.length === 7, 'the five named areas in the brief\'s order, then his escape and his glade (claude/gorm2): ' + SECTIONS.map(s => s[0]).join(', '));
ok(SECTIONS.every((s, i) => i === 0 || s[1] === SECTIONS[i - 1][2]) && SECTIONS[SECTIONS.length - 1][2] === L.W, 'the areas tile the level, end to end');
ok(/KWH\.drawSky/.test(src('src/main.js')) && /export function drawOak/.test(src('src/redraw/kingswood_oak.js')), 'THE GREAT OAK is drawn on the skyline (KWH.drawSky -> src/redraw/kingswood_oak.js)');
for (const s of SECTIONS.slice(0, 4)) ok(L.ents.some(e => e.t === 'sign' && e.x >= s[1] - 4 && e.x < s[1] + 12 && e.text.startsWith(s[0].replace(/'/g, "'"))), 'a sign names ' + s[0] + ' at its entrance');

// ---- THE ROUTE ----
const at = (e, r) => r.near(e.x, e.y) || r.jumpNear(e.x, e.y);
const full = floodReach(L, T);
const KEY = ['check', 'silver', 'king', 'greathound'];
{ const miss = L.ents.filter(e => KEY.includes(e.t) && !at(e, full)).map(e => e.t + '@' + e.x + ',' + e.y); ok(!miss.length, 'the fill reaches every shrine, silver, the Hound Master and the King ' + miss.join(' ')); }
const plateGate = L.ents.find(e => e.t === 'plate' && typeof e.gate === 'number');
ok(plateGate && at(plateGate, full) && L.grid[13 * L.W + plateGate.gate] === T.PORT, 'THE COURT GATE: shut across the road, its plate on the step before it, reached ' + (plateGate ? plateGate.x + ',' + plateGate.y + ' gate ' + plateGate.gate : ''));
const check = x => L.ents.find(e => e.t === 'check' && e.x === x);
const noRope = id => floodReach({ ...L, hoists: L.hoists.filter(h => h.id !== id) }, T);
ok(!at(check(118), noRope('checkCage')), "THE COURT'S CHECKPOINT: its cage is a LOCK (without the step its wall is five rows)");
ok(!at(check(205), noRope('standSpan')), 'THE HUNTING STANDS: the log span is a LOCK (without it the gap stops the road)');
for (const id of ['stairA', 'stairB', 'stairC']) ok(!at(check(307), noRope(id)), 'THE CAGE STAIR: cage ' + id.slice(-1) + ' is a LOCK (without it the trunk has a four-row step)');
for (const id of ['teachCage', 'roadLog', 'meadowCage', 'hiveCage', 'canopyLog', 'procCage', 'procLog', 'captainCage']) ok(at(L.arena ? { x: KINGSWOOD.arena[0] - 2, y: 13 } : check(414), noRope(id)), 'the rope ' + id + ' is a weapon, not a lock (the road goes on without it)');
ok(L.hoists.filter(h => h.land || h.load === 'span').length === 6, 'six ropes drop a step or a bridge: ' + L.hoists.filter(h => h.land || h.load === 'span').map(h => h.id).join(' '));

// ---- THE RULE'S ARC ----
const signNear = (x, y, re, r = 6) => L.ents.some(e => e.t === 'sign' && Math.abs(e.x - x) <= r && Math.abs(e.y - y) <= 2 && re.test(e.text));
const H = id => L.hoists.find(h => h.id === id);
ok(signNear(H('teachCage').cleat[0], H('teachCage').cleat[1], /STRIKE THE PEG/) && L.ents.some(e => e.t === 'brute' && e.sleeper && Math.abs(e.x - H('teachCage').x) <= 1), 'TAUGHT SAFE: a sleeping brute under the first cage, the sign at its peg says the verb');
ok(Math.abs(H('teachCage').cleat[0] - H('teachCage').x) >= 4, 'the first peg stands four tiles or more off the sleeper (26 px wakes him)');
for (const h of L.hoists) { const hangs = (h.hang + 1) * TS, lands = h.load === 'span' ? (h.span[2] + 1) * TS : h.land ? (h.land[1] + 2) * TS : null;
  if (lands !== null) ok(lands > hangs, h.id + ': hangs over where it lands (' + h.hang + ' -> ' + (lands / TS - 1) + ')');
  ok(h.top < h.hang && L.grid[h.cleat[1] * L.W + h.cleat[0]] === T.AIR && [T.SOLID, T.ONEWAY, T.PLANK].includes(L.grid[(h.cleat[1] + 1) * L.W + h.cleat[0]]), h.id + ': its peg stands on footing at ' + h.cleat); }
for (const h of L.hoists.filter(q => q.land)) { const [x, y] = h.land, under = [x, x + 1].every(c => L.grid[(y + 2) * L.W + c] === T.SOLID), clear = [0, 1].every(dy => [x, x + 1].every(c => L.grid[(y + dy) * L.W + c] === T.AIR));
  ok(under && clear && Math.abs(h.x - 1 - x) === 0, h.id + ': the step lands on solid ground in open air, under its rope'); }
for (const h of L.hoists.filter(q => q.load === 'log')) { const fl = (() => { let r = h.hang + 1; while (r < L.H - 1 && L.grid[r * L.W + h.x] === T.AIR) r++; return r; })();
  let x = h.x, n = 0; while (n < h.rollMax && L.grid[(fl - 1) * L.W + x + h.roll * 2] === T.AIR) { x += h.roll; n++; }
  const foes = L.ents.filter(e => ['pike', 'sprig', 'shield', 'hound', 'brute'].includes(e.t) && e.y === fl - 1 && (e.x - h.x) * h.roll >= -1 && (e.x - h.x) * h.roll <= n + 2);
  ok(n < h.rollMax ? L.grid[(fl - 1) * L.W + x + h.roll * 2] !== T.AIR : true, h.id + ': its road (row ' + (fl - 1) + ') runs ' + n + ' tiles ' + (h.roll > 0 ? 'east' : 'west') + (n < h.rollMax ? ' to a wall it splits on' : ' (rollMax)'));
  ok(foes.length >= (h.id === 'procLog' ? 0 : 2), h.id + ': foes stand on its road: ' + foes.map(e => e.t + '@' + e.x).join(' ')); }
const checks0 = L.ents.filter(e => e.t === 'check').map(e => e.x).sort((a, b) => a - b), checks = checks0.filter(x => x !== 169);   /* (claude/bossheal 10-30: 169 (168 grounded) is the extra shrine a few steps before the kennel's gate - a shrine before every mini) */
ok(checks0.includes(169) && checks.length === 5 && [0, 1, 2, 3, 5].map(i => SECTIONS[i]).every(([n, x0, x1], i) => checks[i] >= x1 - 12 && checks[i] < x1 + 2), 'A10c: one shrine closes each area\'s exam, at its end: ' + checks.join(' '));
const elites = L.ents.filter(e => e.elite);
ok(elites.length === 2 && elites.every(e => L.hoists.some(h => Math.abs(h.x - e.x) <= 1 && h.load === 'cage') || L.ents.some(q => q.t === 'dropcage' && Math.abs(q.x - e.x) <= 1)), 'each exam elite stands under something hung over him: ' + elites.map(e => e.t + '@' + e.x).join(' '));
ok(L.ents.some(e => e.t === 'greathound' && e.mini) && L.mini && L.mini.boss === 'greathound', 'THE HOUND MASTER keeps his kennel (the stands\' exam, a mini)');
ok(!L.ents.some(e => ['firepit', 'firevent', 'brazier'].includes(e.t)), 'FIRE IS SAVED FOR THE ESCAPE: no firepit, fire vent or brazier (the old wood had 22)');
ok(Object.keys(ARCS).every(k => ARCS[k].exam), 'each verb has an exam in ARCS');

// ---- THE PROCESSION ----
const pr = L.procession, march = L.ents.filter(e => e.kw && e.kw.march === pr.id);
ok(march.length === 7 && march.every(e => e.y === 13), 'seven marchers on the carpet road: ' + march.map(e => e.t + '@' + e.x).join(' '));
ok(Math.min(...march.map(e => e.x)) - pr.trigger >= 44, 'the court starts out of view of the trigger (44+ columns: a screen is 40)');
{ let open = true; for (let x = pr.exit; x <= Math.max(...march.map(e => e.x)); x++) for (const y of [12, 13]) if (L.grid[y * L.W + x] === T.SOLID || L.grid[y * L.W + x] === T.PORT) open = false;
  ok(open && L.grid[14 * L.W + pr.exit] === T.SOLID, 'the road is open from the court to its side gate (they walk it, nothing solid in their way)'); }
{ const boughs = []; for (let x = 321; x <= 371; x++) if (L.grid[10 * L.W + x] === T.ONEWAY) boughs.push(x);
  ok(boughs.length >= 40 && floodReach({ ...L, grid: (() => { const g = L.grid.slice(); for (let x = 318; x <= 320; x++) g[11 * L.W + x] = T.AIR; return g; })() }, T).seen.has('330,9') === false, 'THE BOUGHS: four rows over the road (no jump from it): only the board step at their foot reaches them');
  ok(full.seen.has('330,9') && full.seen.has('360,9'), 'the boughs are reached (the hiding place is real)'); }
ok(['procCage', 'procLog'].every(id => H(id).cleat[1] === 9) && L.ents.some(e => e.t === 'plate' && e.y === 9 && e.x > 355 && e.x < 372), 'THE AMBUSH: its pegs and a plate stand on the boughs');

// ---- THE HANDS IN A FAKE WORLD ----
{ const grid = L.grid.slice(), W = L.W, Lw = { ...L, grid }, enemies = [], said = [], players = [];
  const box = e => ({ l: e.x - (e.w || 10) / 2, r: e.x + (e.w || 10) / 2, t: e.y - (e.h || 14), b: e.y });
  const solid = (x, y) => x < 0 || y < 0 || x >= W || y >= L.H || grid[y * W + x] === T.SOLID;
  const P = { x: 0, y: 0, dead: false, w: 10, h: 20 }; players.push(P);
  const ctx = { L: Lw, TS, T, sfx: {}, props: () => [], players: () => players, enemies: () => enemies, time: () => 0, number: (x, y, t) => said.push(t), burst: () => {}, dust: () => {}, shake: () => {},
    overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t, box, boxOf: box, asPlayer: (p, fn) => fn(), damage: () => { P.hit = (P.hit || 0) + 1; }, hurt: (e, d) => { e.hp -= d; if (e.hp <= 0) e.alive = false; },
    cellSet: (x, y, t) => { grid[y * W + x] = t; }, solidAt: solid, tileAt: (x, y) => grid[y * W + x],
    moveBody: (e, dx, dy) => { e.x += dx; const fy = Math.floor((e.y + dy) / TS); if (solid(Math.floor(e.x / TS), fy)) { e.y = fy * TS; return { ground: true }; } e.y += dy; return { ground: false }; } };
  const KH = makeKingswoodHands(ctx); const foe = (t, x, y, o) => { const e = { t, x: x * TS + 8, y: (y + 1) * TS, w: 12, h: 14, hp: 40, alive: true, ...(o || {}) }; enemies.push(e); return e; };
  const run = (s, f) => { for (let i = 0; i < s * 60; i++) { KH.update(1 / 60); if (f) f(); } };
  P.x = 3 * TS; P.y = 40 * TS;
  const brute = foe('brute', 28, 39, { hp: 80 }); KH.reset();
  KH.strike({ l: 23 * TS, r: 24 * TS, t: 38 * TS, b: 40 * TS }); run(2);
  ok(KH.hoist('teachCage').state === 'down' && grid[38 * W + 27] === T.SOLID && grid[39 * W + 28] === T.SOLID && !brute.alive, 'the teach peg struck: the cage falls, kills the brute under it and lands as a step (solid cells)');
  ok(said.includes(KW_SAY.cut) && said.includes(KW_SAY.step), 'it says so (THE ROPE PARTS / THE CAGE LANDS: A STEP)');
  KH.cutRope('standSpan'); run(2); ok([151, 155, 158].every(x => grid[28 * W + x] === T.ONEWAY), 'the stands\' span lands across the gap: one-way cells 151-158');
  const pike = foe('pike', 77, 32), s1 = foe('sprig', 81, 32, { hp: 20 }), s2 = foe('sprig', 84, 32, { hp: 20 });
  KH.cutRope('roadLog'); let rolled = false; run(4, () => { if (KH.hoist('roadLog').state === 'roll') rolled = true; });
  const lg = KH.hoist('roadLog'); ok(rolled && lg.state === 'gone' && lg.lx < 90 * TS && lg.lx > 84 * TS, 'the road\'s log trap drops, rolls east and splits on the stump (at ' + (lg.lx / TS).toFixed(1) + ')');
  ok(pike.hp < 40 && !s1.alive && !s2.alive, 'it ran through the pike line: pike ' + pike.hp + ', sprigs ' + [s1, s2].map(e => e.alive ? e.hp : 'dead').join(' '));
  /* the procession: a hero on the boughs is passed under; the court leaves by the side gate */
  enemies.length = 0; const court = march.map(e => foe(e.t, e.x, e.y, { march: 'court', face: -1 })); KH.reset();
  P.x = 330 * TS; P.y = 10 * TS; run(1, () => { for (const e of court) KH.marcher(e, 1 / 60); });
  ok(KH.read().proc.state === 'march', 'past the trigger the court marches');
  run(60, () => { for (const e of court) KH.marcher(e, 1 / 60); });
  ok(court.every(e => !e.alive) && KH.read().proc.passed === 7 && KH.read().proc.done, 'a hero on the boughs is passed under: all seven leave by the side gate (' + KH.read().proc.passed + ' passed)');
  /* and a hero on the road turns the court */
  enemies.length = 0; const court2 = march.map(e => foe(e.t, e.x, e.y, { march: 'court', face: -1 })); const S2 = makeKingswoodHands(ctx); S2.reset();
  P.x = 340 * TS; P.y = 14 * TS; let turned = 0; for (let i = 0; i < 60 * 40 && !turned; i++) { S2.update(1 / 60); for (const e of court2) S2.marcher(e, 1 / 60); turned = court2.filter(e => e.alive && !e.march).length; }
  ok(turned === 7, 'a hero on the road in front of the court turns all of it (' + turned + ' of 7)');
}
console.log(bad ? '\nkingswood2: ' + bad + ' FAILED' : '\nok  kingswood2');
process.exit(bad ? 1 : 0);
