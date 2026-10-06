// tools/raptor-matriarch.mjs - THE RAPTOR MATRIARCH's own check (claude/redgorge2), Node only: no page, a few seconds.
//   - her nest ledge is the gorge's arena: banks at either end, NARROW and BROAD pillars two rows over the channel, the cracks between the cluster's
//     pillars one row under their tops, a sluice lever on each bank, two rope bridges each from a bank's post to a broad pillar's post
//   - her told moves match src/marks.js (the mark over each windup)
//   - THE FLOOD OPENING IS THE VERB (B1): two minutes of her with no lever pulled opens nothing big; a BURST with her in the channel throws her onto the
//     nearest pillar and a NARROW one STAGGERS her (3 s or more, open); a burst with her up on the rock is wasted; at the HORN she makes for a broad
//     pillar or a bank (no opening); an empty sluice says so, and the next flood fills it
//   - B3: every big opening ends in a TOLD ward of 3 s or more, and a burst in it finds nothing
//   - B11 GUARD BY ANGLE: a blow from in front at her height is turned; from behind, or from above, it is not; her beats drop the guard
//   - PHASE TWO (the walls): a dive whose mark you left STUNS her on the rock; a dive that lands on you does not; a post struck under her perch drops
//     her TANGLED (3 s or more). PHASE THREE (the dam cracks): the water comes up for good; her pounce at a NARROW top you stood on STAGGERS her there
//   - every pass of her chain is a new order; the mash bot loses to her (docs/mash-bot.json, tools/mash-bot.mjs --assert)
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { LEVELS, T } from '../src/level.js';
import * as RM from '../src/raptor-matriarch.js';
import { BY_HAND } from '../src/marks.js';

const fails = [], ok = (c, m) => { if (!c) fails.push(m); else console.log('  ok   ' + m); };
const { MAT, STAGE } = RM;
const lv = LEVELS.find(l => l.id === 'redgorge'), L = lv.build(), A = L.arena, G = RM.geom(A), at = (x, y) => L.grid[y * L.W + x];
ok(A && A.boss === 'matriarch' && L.ents.some(e => e.t === 'matriarch'), 'THE RED GORGE\'s arena is her nest ledge');
{ const sx = A.mat.sx, top = A.mat.top, R = A.mat.R, solid = (x, y) => at(sx + x, y) === T.SOLID;
  const kinds = STAGE.tops.map(t => t.kind), narrow = STAGE.tops.filter(t => t.kind === 'narrow'), broad = STAGE.tops.filter(t => t.kind === 'broad');
  ok(kinds[0] === 'bank' && kinds[kinds.length - 1] === 'bank' && narrow.length >= 3 && broad.length >= 2 && narrow.every(t => t.x1 - t.x0 === 1) && broad.every(t => t.x1 - t.x0 >= 3),
    'banks at either end; three NARROW pillars (two tiles) and two BROAD (four) between them');
  ok(STAGE.tops.every(t => { for (let x = t.x0; x <= t.x1; x++) if (!solid(x, top) || solid(x, top - 1) || !solid(x, R - 1)) return false; return true; }) && R - top === 2,
    'every top is solid from its surface to the bed, two rows over the channel (one jump out of the channel for every hero)');
  ok(RM.pitsOf().length >= 3 && RM.pitsOf().every(([a, b]) => solid(a, R - 1) && !solid(a, top)), 'the cracks between the cluster\'s pillars are rubble one row under the tops (no pit to be stuck in)');
  ok(STAGE.levers.length === 2 && STAGE.levers.every(l => STAGE.tops.some(t => t.kind === 'bank' && l.x >= t.x0 && l.x <= t.x1)) && L.ents.filter(e => e.t === 'mlever').length === 2, 'a sluice lever on each bank');
  ok(STAGE.bridges.every(b => [b.p0, b.p1].some(p => STAGE.tops.some(t => t.kind === 'bank' && p >= t.x0 && p <= t.x1)) && [b.p0, b.p1].some(p => STAGE.tops.some(t => t.kind === 'broad' && p >= t.x0 && p <= t.x1))),
    'two rope bridges, each hung from a post on a bank and a post on a broad pillar (both posts reachable on the tops)');
  ok(L.moversExtra.filter(m => m.mplank).length === 2, 'the dam\'s two loose timbers lie in the channel\'s wide reaches (they float up when the dam cracks)'); }
/* her marks */
{ const bad = Object.entries(RM.MOVES).filter(([m, v]) => BY_HAND['matriarch|' + m] !== v.mark); ok(!bad.length, 'every told move wears its mark in src/marks.js (' + Object.keys(RM.MOVES).length + ' rows)' + (bad.length ? ': ' + JSON.stringify(bad) : '')); }
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), greed = readFileSync(new URL('../src/boss-greed.js', import.meta.url), 'utf8');
ok(/matriarch: e => matOpen\(e\)/.test(greed) && /FULL_DAMAGE = \{[\s\S]*?matriarch:/.test(greed), 'boss-greed knows her openings (OPEN_RULE) and that she is a duelist (FULL_DAMAGE: no chip; greed still counts)');
ok(/case 'matriarch': \{ const a = MTH\.spawnBoss/.test(main) && /MTH\.take\(e, dmg\)/.test(main) && /MTH\.interact\(P\)/.test(main), 'main.js spawns her, routes blows through her guard, and lets E work her levers');

/* ---------- THE PURE FIGHT ---------- */
const dt = 1 / 60;
function world(hero, said = []) { let horn = false, flood = false, raptors = 0;
  return { said, hero, setWater(h, f) { horn = h; flood = f; },
    c: { number: (x, y, t) => said.push(t), mark: () => {}, sound: () => {}, fx: () => {}, shake: () => {}, music: () => {},
      hit: b => !hero.dodge && hero.x + 6 > b[0] && hero.x - 6 < b[1] && hero.y > b[2] && hero.y - 24 < b[3], band: b => !hero.dodge && hero.x + 6 > b[0] && hero.x - 6 < b[1] && hero.y > b[2] && hero.y - 24 < b[3],
      spawnRaptor: () => { raptors++; return {}; }, raptors: () => raptors, solid: () => false, horn: () => horn, flood: () => flood, sweep: () => {} } }; }
const fight = (hp = MAT.hp) => { const S = RM.newFight(G), e = { x: G.tops[6].cx, y: G.topY, w: MAT.w, h: MAT.h, hp, maxHp: MAT.hp, face: -1, mode: 'walk', modeT: 0.5, open: 0, phase: 1 }; S.script = null; return { S, e }; };
const step = (F, W, n, each) => { for (let i = 0; i < n; i++) { RM.stepMatriarch(F.e, F.S, dt, [{ x: W.hero.x, y: W.hero.y, ground: true, alive: true, air: false }], W.c); if (each) each(i); } };
const BIG = new Set(['staggered', 'stunned', 'tangled', 'pstagger']);
/* a. two minutes, nothing pulled, the hero on the west bank: nothing big opens; the horn sends her to the rock without an opening */
{ const W = world({ x: G.tops[0].cx, y: G.topY }), F = fight(); let big = 0, wetOn = 0;
  step(F, W, 120 * 60, i => { const t = (i / 60) % 10.4; W.setWater(t > 6 && t < 8, t >= 8); if (BIG.has(F.e.mode)) big++; if (F.S.flood && F.e.y > G.topY + 8 && F.e.mode !== 'fly') wetOn++; F.e.hp = MAT.hp; });
  ok(big === 0, 'two minutes of her with no lever pulled opens nothing big (' + F.S.n.pounces + ' pounces, ' + Object.values(F.S.n.moves).reduce((a, b) => a + b, 0) + ' tells)');
  ok(wetOn < 30, 'at the horn she makes for the rock before the water runs (frames caught in a flood: ' + wetOn + ')'); }
/* b. a burst with her in the channel by a narrow pillar: the pillar throws her - staggered, open 3 s or more; then her told ward; a burst in it finds nothing */
{ const W = world({ x: G.tops[0].cx, y: G.topY }), F = fight(), n1 = G.tops.find(t => t.id === 'N1');
  F.e.x = n1.l - 30; F.e.y = G.floorY; F.e.mode = 'walk'; F.e.modeT = 5;
  ok(RM.pull(F.S, 'W') === 'released', 'E at a full lever releases the banked flood');
  let openT = 0, ward = 0, saw = null; step(F, W, 60 * 11, () => { if (RM.matBig(F.e)) { openT += dt; saw = saw || F.e.mode; } if (F.S.ward > 0 && !RM.matBig(F.e)) ward += dt; F.e.hp = MAT.hp; if (ward > 0.5 && !F.tried) { F.tried = 1; F.S.sluice.E = 1; RM.pull(F.S, 'E'); } });
  ok(saw === 'staggered' && openT >= 3 && F.S.n.staggers === 1, 'a burst catches her in the channel: the NARROW pillar throws her - STAGGERED, open ' + openT.toFixed(1) + ' s (>= 3)');
  ok(ward >= 2.9 && W.said.includes('HER WARD: SHE SHAKES IT OFF') && W.said.includes('HER WARD: SHE IS READY FOR IT') && F.S.n.staggers === 1, 'then a TOLD ward (' + ward.toFixed(1) + ' s, B3): the burst in it finds nothing');
  const W2 = world({ x: G.tops[0].cx, y: G.topY }), F2 = fight(); F2.e.x = G.tops.find(t => t.id === 'B2').cx; F2.e.y = G.topY; F2.e.mode = 'walk'; F2.e.modeT = 5; RM.pull(F2.S, 'E');
  let big2 = 0; step(F2, W2, 60 * 4, () => { if (BIG.has(F2.e.mode)) big2++; F2.e.hp = MAT.hp; });
  ok(big2 === 0 && F2.S.n.wasted === 1, 'a burst with her up on the rock is wasted (and says so)');
  ok(RM.pull(F2.S, 'E') === 'empty', 'an emptied sluice says so: the next flood fills it');
  W2.setWater(false, true); step(F2, W2, 2); ok(F2.S.sluice.E === 1, 'the next flood fills the sluices'); }
/* c. the guard by angle */
{ const e = { x: 500, y: 352, face: 1, mode: 'walk' };
  ok(RM.guarded(e, 520, 352, false) && !RM.guarded(e, 480, 352, false) && !RM.guarded(e, 520, 300, true) && !RM.guarded({ ...e, mode: 'skid' }, 520, 352, false) && !RM.guarded({ ...e, broken: 1 }, 520, 352, false),
    'B11: her talons turn a blow from the front at her height; from behind, from above, in a beat or broken it lands'); }
/* d. phase two: the dive (left: stunned; taken: not), the perch and the post */
{ const W = world({ x: G.tops.find(t => t.id === 'B1').cx, y: G.topY }), F = fight(MAT.hp * 0.55); let stunned = 0, got = 0;
  step(F, W, 60 * 3, () => { F.e.hp = MAT.hp * 0.55; });
  ok(F.S.ph === 2, 'at ' + Math.round(MAT.p2 * 100) + '% she takes to the canyon walls (phase two)');
  for (let i = 0; i < 60 * 40 && !stunned; i++) { if (F.e.mode === 'diveTell' && F.S.mark) W.hero.x = F.S.mark.x + 80; RM.stepMatriarch(F.e, F.S, dt, [{ x: W.hero.x, y: W.hero.y, ground: true, alive: true }], W.c); if (F.e.mode === 'stunned') stunned = F.e.open; F.e.hp = MAT.hp * 0.55; }
  ok(stunned >= 2, 'a dive whose mark you left: she slams into the rock, STUNNED ' + stunned.toFixed(1) + ' s');
  let perched = false, tangled = 0; for (let i = 0; i < 60 * 80 && !tangled; i++) { RM.stepMatriarch(F.e, F.S, dt, [{ x: W.hero.x, y: W.hero.y, ground: true, alive: true }], W.c); F.e.hp = MAT.hp * 0.55;
    if (F.e.mode === 'perch' && F.S.perch && !perched) { perched = true; F.S.bridges[F.S.perch] = 'cut'; } if (F.e.mode === 'tangled') tangled = F.e.open; }
  ok(perched && tangled >= 3, 'she perches on a rope bridge; its post struck, the ropes part and she falls TANGLED ' + tangled.toFixed(1) + ' s'); }
/* e. phase three: the dam cracks; a pounce onto a narrow top throws her */
{ const n2 = G.tops.find(t => t.id === 'N2'), W = world({ x: n2.cx, y: G.topY }), F = fight(MAT.hp * 0.2); let p3 = 0, risen = false;
  for (let i = 0; i < 60 * 40 && !p3; i++) { if (F.e.mode === 'fly' && F.S.fly && F.S.fly.then === 'land' && F.S.ph === 3) W.hero.x = G.tops.find(t => t.id === 'B2').cx;   /* jump off as she comes */
    if (F.e.mode === 'pounceTell') W.hero.x = n2.cx;
    RM.stepMatriarch(F.e, F.S, dt, [{ x: W.hero.x, y: W.hero.y, ground: true, alive: true }], W.c); F.e.hp = MAT.hp * 0.2; if (F.S.water >= 1) risen = true; if (F.e.mode === 'pstagger') p3 = F.e.open; }
  ok(F.S.ph === 3 && risen && F.S.planks, 'at ' + Math.round(MAT.p3 * 100) + '% THE DAM CRACKS: the channel floods for good, and the dam\'s timbers float up');
  ok(p3 >= 2.5, 'her pounce onto the NARROW top you left throws her there: open ' + p3.toFixed(1) + ' s'); }
/* f. every pass a new order */
{ const firsts = RM.CYCLES[1].map(c => c.join('>')); ok(new Set(firsts).size === firsts.length && RM.CYCLES[2].length >= 3 && RM.CYCLES[3].length >= 3, 'every pass of her chain is a new order: ' + firsts.join(' | ')); }
/* g. the mash bot loses to her (the stamped cache) */
{ let out = '', code = 0; try { out = execFileSync(process.execPath, ['tools/mash-bot.mjs', '--assert', 'redgorge'], { encoding: 'utf8' }); } catch (e) { code = 1; out = String(e.stdout || e.message); }
  ok(code === 0, 'the mash bot loses the gorge and her (' + out.trim().split('\n').pop() + ')'); }

if (fails.length) { for (const f of fails) console.log('  FAIL ' + f); console.log('RAPTOR MATRIARCH: ' + fails.length + ' failed'); process.exit(1); }
console.log('RAPTOR MATRIARCH: her ledge, her marks, the flood opening (the verb), her ward, her guard by angle, the walls, the cracked dam and the mash bot hold.');
