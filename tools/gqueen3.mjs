// tools/gqueen3.mjs - THE GOBLIN QUEEN 3, THE NODE HALF (claude/gqueen3, scratch/plan-goblinqueen3-1104.md section 8). No page, no browser.
//   LEVEL    the hall has no pillar, no roof rod and no cuttable chandelier; her bell + grate stay; the escape table (L.gqEscape) is laid inside the hall and every tier is within every hero's legs
//            (src/reach-hero.js, as tools/gorm-scaffold-reach.mjs); the hole opens onto the roof walk; the roof has its shrine and her portal; the tower top (L.arenaRoof) is SEALED from the main level;
//            a checkpoint within 14 columns of each arena; every escape ledge anchored.
//   SOURCE   (static, src/main.js + src/gqueen-hands.js) the crown, the shards and the storm are hit through gqHit and never `unblockable` / `pierce`; GREED.chipBy.gqueen >= 0.4; gqOpen names stunned + the roof;
//            every new mode has its MARK / ANSWER / HEIGHT row; the flee full-heals (hp, stamina, flasks); the stun guard is >= 1.0 s; the pillar / plate / chandelier-pin machinery is gone.
//   node tools/gqueen3.mjs        (GQ_ROOT=<checkout> runs it against another checkout: the plan's "prove it RED on master")
import { readFileSync, existsSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';
const ROOT = process.env.GQ_ROOT ? path.resolve(process.env.GQ_ROOT) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rd = f => existsSync(path.join(ROOT, f)) ? readFileSync(path.join(ROOT, f), 'utf8') : '';
const imp = f => import(pathToFileURL(path.join(ROOT, f)).href);
const TS = 16;
let fails = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/[^\n]*/g, '$1');   /* code only: a comment may say the word */
const fnBody = (src, name) => { const i = src.search(new RegExp('function ' + name + '\\b')); if (i < 0) return ''; let d = 0, st = false; for (let k = src.indexOf('{', i); k < src.length; k++) { if (src[k] === '{') { d++; st = true; } else if (src[k] === '}') { d--; if (st && d === 0) return src.slice(i, k + 1); } } return ''; };

const { LEVELS, T } = await imp('src/level.js');
const L = LEVELS.find(l => l.id === 'crown').build();
const A = L.arena, W = L.W, at = (x, y) => L.grid[y * W + x];

/* ================= LEVEL ================= */
console.log('== LEVEL');
ok(!L.ents.some(e => e.t === 'qpillar'), 'no cracked pillar (qpillar) in her hall');
ok(!L.ents.some(e => e.t === 'rod'), 'no roof lightning rod (the roof phase is retired)');
ok(!L.ents.some(e => e.t === 'weight' && e.gq), 'no chandelier weight is hers to cut (chandeliers are scenery: no gq flag)');
{ const wn = L.ents.find(e => e.t === 'winch' && e.bossGate && e.bell);
  ok(!!wn && at(wn.gate, wn.gy0) === T.AIR, 'her hall bell + its grate (winch bossGate) stay, the grate up'); }
const E = L.gqEscape;
ok(!!E && Array.isArray(E.tiers) && E.tiers.length === 5, 'L.gqEscape: five burning tiers T1..T5');
if (E) {
  const x0 = A.wallL + 1, x1 = A.wallR - 1;
  ok(E.tiers.every(t => t.x0 >= x0 && t.x1 <= x1 && t.row >= 10 && t.row <= 17), 'every tier is inside her hall (cols ' + x0 + '-' + x1 + ', rows 10-17)');
  ok(E.tiers.filter(t => t.collapse).length === 1, 'exactly one tier collapses (T4)');
  ok(A.hole && A.hole.y1 <= 9 && at(A.hole.x0, A.hole.y0) === T.SOLID, 'the hole is roof stone until the flee opens it (rows 8-9)');
  ok(!!E.check && !!E.start && !!E.portal && E.hallPortals && E.hallPortals.length === 2, 'escapeStart on T1, a roof shrine, her portal, two hall portals');
  ok(E.check && at(E.check.x, E.check.y + 1) === T.SOLID && at(E.check.x, E.check.y) === T.AIR, 'the roof shrine stands on roof stone');
  ok(E.portal && at(E.portal.x, E.portal.y + 1) === T.SOLID && at(E.portal.x, E.portal.y) === T.AIR && E.portal.x > E.check.x, 'her portal stands on the roof walk past the shrine');
  ok(E.supports && E.tiers.every((t, i) => E.supports.filter(s => s.tier === i).length >= 2), 'every escape ledge is anchored (two chains a tier)');
  ok(E.throwers && E.throwers.length === 2 && E.slates && E.slates.x1 - E.slates.x0 >= 3, 'two roof throwers and a stretch of collapsing slates');
  ok(Math.abs(E.check.x - (L.arenaRoof ? L.arenaRoof.wallL : 0)) <= 14, 'the roof shrine is within 14 columns of the tower-top arena');
}
ok(Math.abs((L.START ? 0 : 0)) === 0 && ((L.ents.filter(e => e.t === 'check').map(e => e.x).some(x => Math.abs(x - A.wallL) <= 14))), 'a shrine within 14 columns of her hall');
const RA = L.arenaRoof;
ok(!!RA && RA.boss === 'gqueen' && RA.music === 'gqjudge' && RA.x1 - RA.x0 >= 40 * TS, 'L.arenaRoof: the tower top, 40+ tiles, her judgement music');
if (RA && E) {
  const { floodReach } = await imp('src/reachcore.js'), { HERO_MOVE_IDS } = await imp('src/hero-move.js');
  /* the level as the flee lays it: the tiers, the hole */
  const g2 = new Uint8Array(L.grid); for (const t of E.tiers) for (let x = t.x0; x <= t.x1; x++) g2[t.row * W + x] = T.ONEWAY;
  for (let y = A.hole.y0; y <= A.hole.y1; y++) for (let x = A.hole.x0; x <= A.hole.x1; x++) g2[y * W + x] = T.AIR;
  const L2 = { ...L, grid: g2 }, fl = Math.round(A.floor / TS) - 1, start = [A.wallL + 4, fl];
  const marks = [[E.tiers[0].x0 + 1, E.tiers[0].row - 1], ...E.tiers.map(t => [Math.floor((t.x0 + t.x1) / 2), t.row - 1]), [E.check.x, E.check.y], [E.portal.x, E.portal.y]];
  for (const hero of [null, ...HERO_MOVE_IDS]) {
    const R = floodReach(L2, T, { rides: true, hero: hero || undefined, seeds: [start] });
    const miss = marks.filter(m => !R.seen.has(m[0] + ',' + m[1]));
    ok(!miss.length, (hero || 'any hero') + ': the floor reaches every tier, the roof shrine and her portal' + (miss.length ? ' - MISSING ' + miss.map(m => m.join(',')).join(' ') : ''));
  }
  /* SEALED: from the tower top's portal exit nothing walkable leads west of its wall; from the level, nothing leads east of col 609 */
  const R1 = floodReach(L, T, { rides: true, seeds: [[RA.exit.x, RA.exit.y]] }), west = [...R1.seen].filter(k => +k.split(',')[0] < RA.wallL);
  ok(west.length === 0, 'the tower top is sealed: nothing walkable from its portal exit leads west of col ' + RA.wallL);
  const R2 = floodReach(L2, T, { rides: true, seeds: [start] }), east = [...R2.seen].filter(k => +k.split(',')[0] > E.portal.x + 2);
  ok(east.length === 0, 'the main level never walks onto the tower top (only her portal does)');
}

/* ================= SOURCE ================= */
console.log('== SOURCE');
const main = strip(rd('src/main.js')), hands = rd('src/gqueen-hands.js'), handsCode = strip(hands);
ok(hands.length > 0, 'src/gqueen-hands.js exists');
{ const hit = fnBody(handsCode, 'gqHit');
  ok(hit.includes('ctx.damage(') && !/unblockable|pierce/.test(hit), 'gqHit asks damagePlayer for a yellow, blockable blow (no unblockable, no pierce) and reads the shared parry counter');
  ok(/parries\(\)/.test(hit), 'gqHit reads RP.stats.parries (every hero\'s beat path covers it)');
  for (const f of ['crownStep', 'rockStep', 'stormStep']) { const b = fnBody(handsCode, f);
    ok(b.includes('gqHit(') && !/unblockable|pierce|gqRed\(/.test(b), f + ': hits through gqHit, never unblockable / pierce'); }
  ok(!/ctx\.damage\([^)]*(unblockable|pierce)/.test(fnBody(handsCode, 'gqHit')), 'no parryable blow is flagged red'); }
{ const gr = rd('src/boss-greed.js'), m = /chipBy:\s*\{[^}]*?gqueen:\s*([0-9.]+)/.exec(gr);
  ok(!!m && +m[1] >= 0.4, 'GREED.chipBy.gqueen >= 0.4 (' + (m ? m[1] : 'missing') + ')'); }
{ const g = /const gqOpen = e =>([^\n]*)/.exec(main);
  ok(!!g && /stunned/.test(g[1]) && /roof/.test(g[1]) && /pinned/.test(g[1]), 'gqOpen = pinned || stunned || stage roof'); }
{ const mk = await imp('src/marks.js'), modes = ['crownTossTell', 'portalTell', 'lashHighTell', 'lashLowTell', 'ambushTell', 'geyserTell', 'stormTell'];
  for (const m of modes) { const k = 'gqueen|' + m; ok(!!mk.MARK[k] && mk.ANSWER[k] !== undefined && !!mk.HEIGHT[k], k + ' has its MARK, ANSWER and HEIGHT rows'); }
  ok(mk.QUIET.has('updateGQueen|fleeTell'), 'fleeTell is QUIET (no blow)');
  for (const dead of ['chandTell', 'gLeapTell', 'gDropTell', 'leapTell', 'slateTell', 'shadowTell']) ok(!mk.MARK['gqueen|' + dead] && !mk.HEIGHT['gqueen|' + dead], 'the dead row gqueen|' + dead + ' is gone'); }
{ const sp = fnBody(handsCode, 'spare') || (/H\.spare = [\s\S]*?\n  };/.exec(handsCode) || [''])[0];
  ok(/\.hp\s*=\s*[^;]*maxHp/.test(sp) && /\.st\s*=/.test(sp) && /flaskMax/.test(sp), 'the flee FULLY HEALS: hp, stamina and flasks (SV.flaskMax)');
  ok(/persist\s*=/.test(handsCode), 'the escape persists across a death (persist, as King Gorm)'); }
{ const sg = /stunGuard:\s*([0-9.]+)/.exec(hands); ok(!!sg && +sg[1] >= 1.0, 'the stun guard is >= 1.0 s (' + (sg ? sg[1] : 'missing') + ')'); }
for (const f of ['gqPillar', 'drawQPillar', 'gqPillarsStand', 'gqChip', 'gqShatter', 'drawGqPlate', 'gqChandsHang']) ok(!new RegExp('function ' + f).test(main), 'the ' + f + ' machinery is gone from main.js');
ok(!/case 'chandTell'/.test(main) && !/gqPin\(e, pr\.x, 'chandelier'/.test(main), 'the chandelier pin is gone');
ok(/GQH\.hit|makeGQueenHands/.test(main), 'main.js wires GQH (the hands)');
const ck = rd('tools/check.mjs');
ok(!/'queen-court'|'queen-chandelier'/.test(ck) || /superseded/i.test(ck), 'queen-court / queen-chandelier are retired from check.mjs (they assert pillars and a plate)');
ok(/'gqueen3'/.test(ck), 'tools/gqueen3.mjs is registered in check.mjs');

console.log(fails ? 'FAIL gqueen3 (' + fails + ')' : 'ok  gqueen3'); process.exit(fails ? 1 : 0);
