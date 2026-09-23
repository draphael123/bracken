/* tools/unburied.mjs — THE UNBURIED FIELD, MEASURED AGAINST ITS OWN BRIEF (.claude/briefs/unburied-field.md, agreed with
   Daniel 2026-09-21). Node only: no page, no port, no Chrome. The brief names this file at its line 73 - "tools/unburied.mjs
   in check.mjs" - so it exists because the brief asked for it, and it is in the suite.

   WHY IT EXISTS AT ALL, WHICH IS THE WHOLE POINT. The greybox (src/draft/unburied-field.js) was written on the machine that
   held the brief, and the brief lived nowhere else: .claude/ was gitignored until 5493df8. So for four days there were two
   halves of one design in two places and NOTHING in this repository had ever compared them. When they were finally read side
   by side, NINE of the brief's named features had no answer in the greybox - including ARROW PEGS, which the brief calls the
   signature - and three shipped rules were broken (a 121-column checkpoint gap, a 57-tile arena, a two-wave ambush).
   A convention nothing checks is a wish, and so is a brief. This is the brief, asserted.

   WHAT IT READS TODAY. The DRAFT, because the level is not in LEVELS yet: there is no 'unburied' entry, no map node, no
   bannerbearer/corpse/standardbearer/deathknight in EHP and no art. WHEN THE LEVEL IS WIRED, the first line of this file
   changes from the draft's build() to LEVELS[idx('unburied')].build() and everything below it should still hold - the
   numbers here are the brief's numbers, not the draft's. Until then it is honest about what it cannot see, and it says so
   in its own output rather than quietly scoring a smaller number.

   WHAT IT CANNOT SEE, SAID OUT LOUD:
     - the FIGHTS. A10/A11 are not statically checkable (RULES section A says so in as many words) and neither boss exists.
     - the ART, the music, the tints and the ghost armies in the backdrop: the brief's fourth distinct feature is a look.
     - the GARRISON and ELITES rows are carried on the draft as data. A build moves them into src/level.js and this counts
       them either way, but nothing here proves a placer honoured them.
     - F7's shop/shrine, three quest strays and a relic: those live on the LEVELS entry, which does not exist yet. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { build, UF } from '../src/draft/unburied-field.js';
import { audit } from './route-breaks.mjs';

const SOURCE = 'DRAFT src/draft/unburied-field.js';
const L = build(T), { W, H, G } = UF, TS = 16;
const fill = S => { const R = floodReach(S, T, { rides: true }); return { R, seen: [...R.seen].map(k => k.split(',').map(Number)) }; };
const { R, seen } = fill(L);
const near = e => { for (let dy = -2; dy <= 5; dy++) for (let dx = -3; dx <= 3; dx++) if (R.seen.has((e.x + dx) + ',' + (e.y + dy))) return true; return false; };
const box = (x0, x1, y0, y1) => seen.filter(([x, y]) => x >= x0 && x <= x1 && y >= y0 && y <= y1).length;
const ents = L.ents, of = t => ents.filter(e => e.t === t);
const tiles = t => { let n = 0; for (let i = 0; i < L.grid.length; i++) if (L.grid[i] === t) n++; return n; };
const ok = (what, extra = '') => console.log('  ok  ' + what.padEnd(46) + extra);

/* ---- 1. THE SHAPE: three acts (the brief) and seven sections (F1), every one of them walked ---- */
for (const [k, [a, b]] of Object.entries(UF.ACTS)) assert.ok(box(a, b, 0, H) > 60, 'act ' + k + ' is walked');
{ const S = Object.entries(UF.SECTIONS).sort((p, q) => p[1][0] - q[1][0]);
  assert.equal(S.length, 7, 'F1: seven named sections, not one stretch - ' + S.length + ' named');
  assert.equal(S[0][1][0], 0); assert.equal(S[S.length - 1][1][1], W - 1);
  for (let i = 1; i < S.length; i++) assert.equal(S[i][1][0], S[i - 1][1][1] + 1, 'the sections tile the level with no gap: ' + S[i][0]);
  for (const [k, [a, b]] of S) { assert.ok(b - a + 1 >= 34, k + ' is ' + (b - a + 1) + ' columns'); assert.ok(box(a, b, 0, H) > 20, k + ' is walked'); }
  ok('F1 seven sections, all walked', S.map(s => s[0]).join(' ')); }

/* ---- 2. THE BRIEF'S FIVE DISTINCT FEATURES ---- */
/* 1 THE VOLLEYS: horn-warned zones, and cover to stop them */
assert.ok(L.volleys && L.volleys.length >= 3, 'the ridge looses volleys across the field');
for (const v of L.volleys) { assert.ok(v.horn > 0, 'a war-horn before each volley'); assert.ok(v.period > 0); }
const covers = of('cover'); assert.ok(covers.length >= 6, 'cover to cross between: ' + covers.length);
assert.ok(new Set(covers.map(c => c.kind)).size >= 3, 'upturned shields, wagons, siege mantlets - three kinds, not one');
/* the high route is DRY AND EXPOSED, which is not the same as bare: it has cover on it too */
assert.ok(covers.some(c => c.x >= UF.HIGH[0] && c.x <= UF.HIGH[1] && c.y < G), 'act two\'s high route carries cover of its own');
ok('the volleys, horn-warned, and cover to cross', covers.length + ' cover props, ' + L.volleys.length + ' zones');
/* 2 SIEGE ENGINES YOU WORK: the brief's audit bar is a prop worked every ~3 screens, and a screen is 24 columns */
const screens = W / 24, engines = ents.filter(e => ['ballista', 'trebuchet', 'oilbarrel'].includes(e.t));
assert.ok(engines.length >= Math.floor(screens / 3), 'a prop worked every ~3 screens: ' + engines.length + ' over ' + screens.toFixed(1) + ' screens');
assert.ok(of('ballista').length && of('trebuchet').length, 'a loaded ballista AND a trebuchet, both named in the brief');
for (const e of engines) assert.ok(near(e), e.t + ' at ' + e.x + ',' + e.y + ' is reachable');
ok('siege engines you work', engines.map(e => e.t).join(' '));
/* 3 BATTLEFIELD GROUND: trenches, stake lines, churned mud, craters, and the two routes */
assert.ok(UF.TRENCHES.length >= 3 && tiles(T.SPIKE) > 0, 'trenches to drop into, and stake lines that hurt');
assert.ok(L.pools.length >= 3 && L.pools.every(p => p.shallow), 'churned mud that slows: shallow, and nothing here is deadly water');
assert.ok(UF.CRATERS.length >= 4, 'craters');
assert.ok(box(UF.HIGH[0], UF.HIGH[1], 0, 32) > 30, 'the HIGH ROUTE over the wreckage is walked');
assert.ok(box(UF.LOW[0], UF.LOW[1], G + 3, G + 5) > 30, 'the LOW ROUTE through the trenches is walked');
ok('battlefield ground', UF.TRENCHES.length + ' trenches, ' + UF.STAKES.length + ' stake lines, ' + L.pools.length + ' mud, ' + UF.CRATERS.length + ' craters');
/* 5 THE FIELD CHANGES AS YOU GO: every volley zone belongs to a banner-bearer, and cutting him quiets that stretch of ridge */
const encNames = new Set(L.encounters.map(e => e.name));
for (const v of L.volleys) { assert.ok(v.bearer, 'a volley zone with no bearer cannot go quiet'); assert.ok(encNames.has(v.bearer), 'no encounter named ' + v.bearer); }
for (const v of L.volleys) assert.ok(ents.some(e => e.t === 'bannerbearer' && e.enc === v.bearer), v.bearer + ' has no banner-bearer in it');
ok('the field goes quiet behind you', L.volleys.map(v => v.bearer).join(' / '));

/* ---- 3. PLATFORMING ---- */
assert.ok(box(UF.TOWER[0], UF.TOWER[1] + 4, 18, 21) > 3, 'THE TOPPLED SIEGE TOWER is climbed to its top');
assert.ok(of('trebuchet').some(e => e.knocks === 'tower'), 'a trebuchet shot knocks part of the tower loose');
/* ARROW PEGS, THE SIGNATURE - and the rule that keeps them honest. The reach model cannot ride a peg, so a peg may never be
   the only way on: delete every peg wall and the level must still be crossed end to end. */
assert.ok(L.pegs && L.pegs.length >= 3, 'ARROW PEGS: the brief\'s signature, and the first greybox had none');
for (const p of L.pegs) { assert.ok(p.rows.length >= 3 && p.why, 'a peg wall says what it is for'); assert.equal(L.grid[G * W + p.x], T.PALISADE, 'a peg wall is a wooden wall at x ' + p.x); }
{ const S = build(T); for (const p of S.pegs) for (let y = p.top; y <= G; y++) for (let x = p.x; x <= p.x + 1; x++) S.grid[y * S.W + x] = T.AIR;
  const s2 = fill(S).seen; assert.ok(s2.some(([x]) => x >= UF.ARENA.x0 + 4), 'WITH EVERY ARROW PEG DELETED the field is still crossed: no peg is on the only way on'); }
assert.ok(L.moversExtra.filter(m => m.kind === 'swing').length >= 2, 'catapult arms and chains to swing the trench gaps');
/* CORPSE MOUNDS that give way into mass-grave pits, and rule B3: every pocket has a way out */
assert.ok(tiles(T.SOFT) > 0, 'a corpse mound that gives way (the Burial\'s crumbling floors)');
{ let found = false; for (let x = 0; x < W; x++) if (L.grid[(G - 1) * W + x] === T.SOFT && seen.some(([sx, sy]) => sx === x && sy > G)) found = true;
  assert.ok(found, 'the pit under the corpse mound is entered'); }
ok('platforming', 'tower, ' + L.pegs.length + ' peg walls, ' + L.moversExtra.length + ' swings, a mound that gives way');

/* ---- 4. HAZARDS ---- */
assert.ok(L.cavalry && L.cavalry.x1 > L.cavalry.x0 && L.cavalry.period > 0, 'THE GHOST CAVALRY CHARGE has a lane and a rhythm');
assert.ok(L.cavalry.x0 >= UF.LOW[0] * TS - TS && L.cavalry.x1 <= (UF.LOW[1] + 1) * TS, 'the lane is act two\'s, where the brief puts it');
assert.ok(of('oilbarrel').length >= 2 && of('oilbarrel').every(b => b.spill), 'BURNING PITCH: siege-oil barrels that spill a line of fire');
ok('hazards', 'cavalry lane, ' + of('oilbarrel').length + ' oil barrels, stake lines, volleys');

/* ---- 5. THE MINI, THE BOSS AND THEIR ROOMS ---- */
{ const m = L.mini, a = L.arena;
  assert.equal(m.boss, 'standardbearer'); assert.equal(a.boss, 'deathknight');
  const mw = (m.x1 - m.x0) / TS, aw = (a.x1 - a.x0) / TS;
  assert.ok(aw >= 34 && aw <= 44, 'A7: an arena is about forty tiles - the Death Knight\'s is ' + aw);
  assert.ok(mw <= 44, 'A7: the Standard-Bearer\'s room is ' + mw + ' tiles');
  /* RULE I: A BOSS ARENA IS ENTERED FROM THE LEFT. The trigger is P.x > arena.trigger and there is no direction flag. */
  assert.ok(a.trigger > a.x0 && a.trigger < a.x1, 'the arena trigger sits inside its own walls');
  assert.ok(seen.some(([x, y]) => x === (a.x0 / TS) - 2 && y === G), 'the arena is walked into from the LEFT');
  /* A12, the part a grid can answer: the room has standable ground OFF the floor as well as on it */
  assert.ok(box(a.x0 / TS, a.x1 / TS, 0, G - 1) > 4, 'A12: the Death Knight\'s room has footing off its floor');
  /* THE GATE the brief asks for: the mini holds the way on */
  const S = build(T); for (let y = 0; y < S.H; y++) if (S.grid[y * S.W + UF.MINI.gate] === T.PORT) S.grid[y * S.W + UF.MINI.gate] = T.SOLID;
  assert.ok(!fill(S).seen.some(([x]) => x > UF.MINI.gate + 1), 'THE STANDARD-BEARER holds the way on');
  ok('the mini and the boss', 'mini ' + mw + ' tiles, arena ' + aw + ' tiles, the gate holds'); }

/* ---- 6. RULE Q: ONE AMBUSH, ONE WAVE, ONE CAPTAIN ---- */
{ assert.equal(L.ambushes.length, 1, 'rule Q: one ambush room a level, at most');
  const A2 = L.ambushes[0], wide = A2.wallR - A2.wallL;
  assert.equal(A2.waves.length, 1, 'rule Q3: ONE WAVE ONLY, led by a named captain - the first draft had two');
  assert.ok(wide >= 25 && wide <= 45, 'rule Q1: 25 to 45 tiles between the gates, this is ' + wide);
  const w = A2.waves[0]; assert.ok(w.length >= 3 && w.length <= 5, 'a captain and two to four small foes: ' + w.length);
  const cap = w.find(f => f[3] && f[3].captain); assert.ok(cap && cap[3].name, 'the captain announces the lock by name');
  assert.ok(A2.check, 'rule Q5: the door is a checkpoint, placed by hand outside the room');
  assert.ok(A2.check[0] < A2.wallL, 'and it stands OUTSIDE the walls');
  ok('the sealed crypt', wide + ' tiles, one wave of ' + w.length + ' under ' + cap[3].name); }

/* ---- 7. THE RULES EVERY LEVEL KEEPS (the brief's own last line) ---- */
const silvers = of('silver'); assert.equal(silvers.length, 3, 'three silvers');
for (const s of silvers) assert.ok(near(s), 'silver at ' + s.x + ',' + s.y + ' is reached');
const checks = of('check').sort((a, b) => a.x - b.x);
for (const c of checks) assert.ok(near(c), 'checkpoint at ' + c.x + ',' + c.y + ' is reached');
{ let prev = 0, worst = 0, at = 0; for (const c of checks) { if (c.x - prev > worst) { worst = c.x - prev; at = c.x; } prev = c.x; }
  if (W - 1 - prev > worst) { worst = W - 1 - prev; at = W - 1; }
  assert.ok(worst <= 100, 'B6: checkpoints every 100 columns - worst gap ' + worst + ' ending at ' + at);
  assert.ok(checks.some(c => c.x < UF.ARENA.x0 && c.x > UF.ARENA.x0 - 12), 'B6: one checkpoint just outside the arena walls');
  ok('checkpoints', checks.length + ', worst gap ' + worst); }
for (const e of L.encounters) assert.ok(e.n >= 3 && e.n <= 5, 'encounters are 3-5: ' + e.name + ' is ' + e.n);
/* DENSITY: 3.5-4.5 foes a screen, a screen being 24 columns, counting the garrison row the brief asks for */
{ const inEnc = ents.filter(e => e.enc).length, amb = L.ambushes.reduce((s, a) => s + a.waves.flat().length, 0);
  const gar = L.garrison.reduce((s, r) => s + r[1], 0), el = L.elites.length;
  assert.ok(L.garrison.length >= 4, 'the brief asks for a GARRISON row'); assert.ok(el >= 1, 'and an ELITES row');
  const per = (inEnc + amb + gar + el) / screens;
  assert.ok(per >= 3.5 && per <= 4.5, '3.5-4.5 foes a screen: ' + per.toFixed(2) + ' (' + inEnc + ' authored + ' + amb + ' ambush + ' + gar + ' garrison + ' + el + ' elite over ' + screens.toFixed(1) + ' screens)');
  ok('density', per.toFixed(2) + ' foes a screen across ' + L.encounters.length + ' encounters'); }
/* DEADLY WATER ONLY IF MARKED: there is none here, and the check says so rather than passing silently */
assert.ok(L.pools.every(p => p.shallow && !p.harm && !p.poison), 'no deadly water on this level (the brief: only if marked)');
/* EVERY DEAD END PAYS is checked by tools/deadends.mjs on the built level; the draft is not in LEVELS, so what this can say
   is that the two pockets the layout digs on purpose - the mass-grave pit and the peg shelves - have something in them. */
{ const paid = xy => ents.some(e => ['coin', 'silver'].includes(e.t) && Math.abs(e.x - xy[0]) <= 6 && Math.abs(e.y - xy[1]) <= 4);
  assert.ok(paid([116, G + 3]), 'the mass-grave pit pays');
  for (const p of L.pegs) assert.ok(paid([p.x + 4, p.top - 2]) || paid([p.x + 4, p.top + 2]) || p.why.includes('without'), 'the peg wall at ' + p.x + ' pays or shortens'); }

/* ---- 8. F10: A FOE THE GAME HAS NEVER FOUGHT, AND IT IS NOT THE BOSS ---- */
{ const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  const ehp = src.slice(src.indexOf('const EHP = {'));
  const EHP = new Set([...ehp.slice(0, ehp.indexOf('};')).matchAll(/([a-zA-Z][a-zA-Z0-9]*)\s*:/g)].map(m => m[1]));
  assert.ok(EHP.size > 80, 'only ' + EHP.size + ' creatures read out of EHP: the parse has stopped working');
  const bosses = new Set([L.arena.boss, L.mini.boss]);
  const roster = new Set(ents.filter(e => e.enc).map(e => e.t).concat(L.garrison.map(r => r[0])));
  const news = [...roster].filter(t => !EHP.has(t) && !bosses.has(t));
  assert.ok(news.length >= 1, 'F10: the level must bring a foe the road has never fought, and its boss does not count');
  ok('F10 new foes (not the boss)', news.join(', ')); }

/* ---- 9. ROUTE-BREAKS ---- */
{ const f = audit(L).findings.filter(q => 'ABCD'.includes(q.k));
  for (const q of f) console.log('  route-break ' + q.k + ' ' + q.what);
  assert.equal(f.length, 0, 'route-breaks finds nothing'); }

console.log('ok  unburied       THE UNBURIED FIELD matches its brief, read off the ' + SOURCE);
console.log('      STILL UNBUILT, and this tool cannot see any of it: the LEVELS entry and its map spur, the coinNeeds gate on');
console.log('      the Death Knight, both fights (A10/A11 are not statically checkable), the art, the music and the look.');
