// tools/ksar.mjs - THE BANDIT KSAR's own check (claude/ksar). Node only: no page, no port, no Chrome. The built level, the pure modules, and the hands in a
// fake world (src/ksar-hands.js takes a context; here it is a grid and a list of men):
//   - the rule line is the code's (LEVELS row == src/ksar.js header); the arcs teach -> test -> remix -> exam; each verb REQUIRED once before the boss:
//     RING (the gatehouse squad holds the winch's brake from a room you cannot enter: only the great gong - on a chain, never cut - calls it out),
//     THROW (the powder store's bricked arch under its overhang: no way over, the chain reaches it); signs at the point of use say the verb
//   - the gong rule in the hands: a ring calls every fort man in earshot and no one outside it; a cut gong never rings; the brake lets go when the squad is
//     called; a blast breaks brick in reach and lights the next keg; the murder holes stop when the gatehouse empties
//   - the cast: one new foe (the hawk scout), reskins by cnSkin, a ranged one, role mix, every gong calls someone; checkpoints 90..175 route tiles apart;
//     the desert's sun: no walk on the route over SUN.maxWalk out of the shade; five seals and the strongroom; silver at most 3
//   - THE HAWK-MISTRESS (src/hawk-mistress.js, a fake world): a gong while the hawk is up -> it wheels -> she whistles, OPEN >= 3 s, standing still (B4); a ward
//     follows (the hawk home: a gong in it finds the glove); a flash in reach blinds the hawk and opens her, one out of reach does not; her gauntlet guards
//     the front at her height on guard, not her back, not from above, not in her tells (B11); one new told move a phase; her marks are src/marks.js's
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS, T } from '../src/level.js';
import { SUN } from '../src/sunstroke.js';
import { pacing } from './pacing.mjs';
import { SECTIONS, ARCS, RULE, KSAR } from '../src/ksar.js';
import * as HM from '../src/hawk-mistress.js';
import { makeKsarHands, KS } from '../src/ksar-hands.js';
import { HAWK } from '../src/ksar-foes.js';
import { MARK, ANSWER } from '../src/marks.js';
import { OPEN_RULE, FULL_DAMAGE } from '../src/boss-greed.js';
import { SYNTH_BOSS, SYNTH_VARIANT } from '../src/boss-music.js';
import { STUCK_HANDS } from '../src/stuck-spots.js';
import { isCallout } from '../src/hint-lines.js';
const TS = 16; let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const lv = LEVELS.find(l => l.id === 'ksar'); ok(lv, 'ksar is in LEVELS'); ok(lv.needs === 'glasssea', 'THE BANDIT KSAR needs THE GLASS SEA (the main road)');
const L = lv.build(), at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H ? T.SOLID : L.grid[y * L.W + x]);
/* THE RULE LINE is the code's */
const src = readFileSync(new URL('../src/ksar.js', import.meta.url), 'utf8');
ok(lv.rule === RULE && src.includes('// THE RULE: ' + lv.rule), 'the rule line in LEVELS is the one src/ksar.js states: ' + lv.rule);
ok(/GONG/.test(lv.rule) && /CALLS EVERY BANDIT IN EARSHOT/.test(lv.rule) && /CUT ROPE SILENCES IT/.test(lv.rule), 'the rule line names the verb and what it does (calls / silences)');
/* THE ARCS */
for (const v of ['cut', 'ring', 'throw']) ok(ARCS[v].teach && ARCS[v].test && ARCS[v].remix && ARCS[v].exam, 'the ' + v + ' is taught, tested, remixed and examined');
ok(SECTIONS.length === 7 && SECTIONS.every((s, i) => i === 0 || s[1] > SECTIONS[i - 1][1]), 'six sections and the courtyard, in order');
/* REQUIRED: RING (the gate winch) */
const G = L.gate; ok(G && G.notches >= 3, 'the gate winch has a portcullis of notches');
for (let y = G.y0; y <= G.y1; y++) ok(at(G.x, y) === T.SOLID, 'the portcullis is shut as laid (' + G.x + ',' + y + ')');
const standTop = []; for (let x = G.x - 8; x < G.x; x++) for (let y = 0; y < L.H - 1; y++) if (at(x, y) !== T.SOLID && (at(x, y + 1) === T.SOLID || at(x, y + 1) === T.ONEWAY)) standTop.push(y + 1);
let gTop = 0; while (gTop < L.H && at(G.x + 3, gTop) !== T.SOLID) gTop++;
ok(Math.min(...standTop) - gTop >= 8, 'no way over the gatehouse: its top (row ' + gTop + ') is ' + (Math.min(...standTop) - gTop) + ' rows over the highest footing before it');
for (let y = G.grille.y0; y <= G.grille.y1; y++) ok(at(G.grille.x, y) === T.SOLID, 'the guard room is behind its grille (' + G.grille.x + ',' + y + ')');
const squadEnts = L.ents.filter(e => e.ks === 'gatehouse'); ok(squadEnts.length >= 2 && squadEnts.every(e => e.x >= G.room[0] && e.x <= G.room[1] && e.y >= G.room[2] && e.y <= G.room[3]), 'the gatehouse squad (' + squadEnts.length + ') stands in its guard room');
const great = L.gongs.find(g => g.great); ok(great && Math.abs(great.x - G.room[1]) <= great.ear && Math.abs(great.y - G.room[3]) <= great.earY, 'THE GREAT GONG\'s earshot reaches the guard room (the one way to empty it)');
ok(!L.gongs.some(g => !g.great && !g.arena && Math.abs(g.x - G.room[0]) <= g.ear && Math.abs(g.y - G.room[3]) <= g.earY), 'no other gong reaches the guard room: the great gong is the gate\'s verb');
const sign = (x0, x1, re) => L.ents.some(e => e.t === 'sign' && e.x >= x0 && e.x <= x1 && re.test(e.text));
ok(sign(great.x - 6, great.x, /E RINGS IT/), 'a sign at the great gong says E RINGS IT');
ok(sign(G.winch[0] - 6, G.winch[0], /E HAULS IT/), 'a sign at the winch says E HAULS IT');
/* REQUIRED: THROW (the powder store's arch) */
const arch = L.barricades.find(b => b.id === 'storeArch'); ok(arch, 'the powder store has its bricked arch');
ok(arch.y1 - arch.y0 + 1 >= 7, 'the arch stands ' + (arch.y1 - arch.y0 + 1) + ' rows over the roof: no jump goes over it');
for (let x = arch.x0; x <= arch.x1; x++) ok(at(x, arch.y1 + 1) === T.SOLID, 'the arch stands on the roof (' + x + ')');
const chain = L.setKegs.filter(k => k.chain).sort((a, b) => a.x - b.x); ok(chain.length >= 4, 'the store\'s keg chain: ' + chain.length + ' kegs');
for (let i = 1; i < chain.length; i++) ok((chain[i].x - chain[i - 1].x) * TS <= KS.chainR, 'each keg of the chain is in reach of the one before (' + chain[i - 1].x + ' > ' + chain[i].x + ')');
ok(Math.hypot((arch.x0 * TS + 8) - (chain[chain.length - 1].x * TS + 8), (arch.y1 * TS + 8) - ((chain[chain.length - 1].y + 1) * TS - 6)) < KS.breakR, 'the chain\'s last keg breaks the arch');
ok(sign(chain[0].x - 8, chain[0].x, /A BLOW LIGHTS A KEG/), 'a sign at the store says A BLOW LIGHTS A KEG');
ok(sign(20, 40, /A BLADE CUTS ITS ROPE; E RINGS IT/) && sign(50, 60, /ATTACK THROWS IT/), 'the first gong and the first keg stack are taught at the point of use (CUT, RING, THROW)');
/* (fix pass, review MUST 1) THE BREACHES AND THE GAPS: real platforming on the walls (spiked rubble: a hurt, never a death) and in the exam (a fall between the roofs is a
   death, A10 amended - told by a sign before the first gap). The first breach is taught bare; every other breach and gap has a foe AT the jump */
const foeEnts = L.ents.filter(e => e.ks || e.t === 'hawkscout'), foeNear = (x0, x1, r) => foeEnts.filter(e => (e.t === 'hawkscout' ? Math.max(e.x0, x0 - r) <= Math.min(e.x1, x1 + r) : e.x >= x0 - r && e.x <= x1 + r));
const walls = L.breaches.filter(([x0]) => x0 >= 72 && x0 <= 231); ok(walls.length >= 3, 'the wall walk is breached ' + walls.length + ' times (real platforming on the walls)');
for (const [x0, x1, row] of L.breaches) { let rub = true; for (let x = x0; x <= x1; x++) rub = rub && at(x, row) === T.AIR && at(x, row + 1) === T.SPIKE && at(x, row + 2) === T.SOLID; ok(rub, 'breach ' + x0 + '-' + x1 + ': rubble with spikes in it (a hurt you climb out of, not a fall)');
  ok(x1 - x0 + 1 >= 3, 'breach ' + x0 + '-' + x1 + ' is a jump (' + (x1 - x0 + 1) + ' wide)'); }
ok(sign(walls[0][0] - 6, walls[0][0], /BREACHED/) && foeNear(walls[0][0], walls[0][1], 4).length === 0, 'the first breach is taught bare: a sign, no foe at it');
for (const [x0, x1] of walls.slice(1)) ok(foeNear(x0, x1, 6).length > 0, 'breach ' + x0 + '-' + x1 + ' has a foe at the jump: ' + foeNear(x0, x1, 6).map(e => e.cnSkin || e.t).join(','));
const exam = L.drops.filter(([x0]) => x0 >= 446 && x0 < 584); ok(exam.length >= 4, 'the exam\'s roofs are broken: ' + exam.length + ' gaps');
for (const [x0, x1] of exam) { let open = true; for (let x = x0; x <= x1; x++) for (let y = 0; y < L.H; y++) open = open && at(x, y) === T.AIR; ok(open, 'gap ' + x0 + '-' + x1 + ' falls to the world\'s floor (a real death)');
  ok(foeNear(x0, x1, 6).length > 0, 'gap ' + x0 + '-' + x1 + ' has a foe at the jump: ' + foeNear(x0, x1, 6).map(e => e.cnSkin || e.t).join(',')); }
ok(sign(exam[0][0] - 8, exam[0][0], /FALL/) && !L.drops.some(([x0]) => x0 < exam[0][0]), 'the first deadly gap is told by a sign before it, and no deadly gap comes before the exam (taught by the breaches)');
/* (MUST 3) CUT REQUIRED: THE ROOF BRIDGE - its gong's rope holds the bridge up over the widest drop; nothing else crosses it */
const bg = L.gongs.find(g => g.bridge); ok(bg && !bg.great, 'the bridge gong hangs on a rope (it can be cut)');
const [bx0, bx1, brow] = bg.bridge, bd = L.drops.find(([x0, x1]) => x0 === bx0 && x1 === bx1); ok(bd && bx1 - bx0 + 1 >= 7, 'THE ROOF BRIDGE spans the widest drop: ' + (bx1 - bx0 + 1) + ' tiles, past any jump');
ok(at(bx0 - 1, brow) === T.SOLID && at(bx1 + 1, brow) === T.SOLID && bg.x < bx0 && bx0 - bg.x <= 4, 'the bridge lies between two roofs at their own height, its gong on the near lip');
ok(sign(bg.x - 26, bg.x, /A BLADE CUTS IT/), 'a sign at the bridge gong says A BLADE CUTS IT');
ok(L.ents.some(e => e.ks === 'lookout' && e.gong === bg.id), 'a lookout races you for the bridge gong (cut it before he rings it)');
/* (MUST 3) THROW REQUIRED: THE HAWK TOWER's bricked door - no set keg's blast reaches it, so a keg must be THROWN; a stack before it */
const ta = L.barricades.find(b => b.id === 'towerArch'); ok(ta && ta.y1 - ta.y0 + 1 >= 7, 'the hawk tower\'s door is ' + (ta.y1 - ta.y0 + 1) + ' rows of brick');
for (let y = 0; y < ta.y0; y++) if (y >= ta.y0 - 5) ok(at(ta.x0, y) === T.SOLID, 'the tower stands over its door (' + ta.x0 + ',' + y + '): no way over');
ok(!L.setKegs.some(k => { for (let cy = ta.y0; cy <= ta.y1; cy++) for (let cx = ta.x0; cx <= ta.x1; cx++) if (Math.hypot(cx * TS + 8 - (k.x * TS + 8), cy * TS + 8 - ((k.y + 1) * TS - 6)) < KS.breakR) return true; return false; }), 'no set keg\'s blast reaches the tower door: only a THROWN keg opens it');
ok(L.stacks.some(s => s.kind === 'keg' && s.x < ta.x0 && ta.x0 - s.x <= 6) && sign(ta.x0 - 6, ta.x0, /THROWN KEG/), 'a keg stack and a sign (A THROWN KEG) stand before the tower door');
/* (MUST 4) THE CLIMAX, THEN A CHECKPOINT: CUT (the bridge), RING (the roof-three gong over the tower's squad), THROW (the door) between checkpoint four and five */
const cpx = L.ents.filter(e => e.t === 'check').map(e => e.x).sort((a, b) => a - b), c4 = cpx[cpx.length - 2], c5 = cpx[cpx.length - 1];
ok(c4 < bg.x && c5 > ta.x1 && L.gongs.some(g => !g.bridge && !g.arena && g.x > bx1 && g.x < ta.x0), 'the climax (bridge gong ' + bg.x + ', a gong on roof three, the tower door ' + ta.x0 + ') sits between checkpoint ' + c4 + ' and checkpoint ' + c5 + ' (after it)');
ok(L.ents.filter(e => e.ks === 'reserve' && e.x > bx1 && e.x < ta.x0).length >= 3, 'the hawk tower\'s squad sleeps in its hut on roof three (a ring calls them)');
/* (MUST 2) THE FORT HITS HARD: weight, not hazards; the post kegs cut to a dozen */
ok(['ksarblade', 'whipapprentice', 'shieldsentry'].every(k => L.foeHit[k] >= 1.8) && L.foeHit.gonglookout >= 1.5, 'the fort\'s men hit hard (L.foeHit ' + JSON.stringify(L.foeHit) + ')');
ok(L.setKegs.length <= 14, 'set kegs: ' + L.setKegs.length + ' (the chain and a few by the squads - not a keg at every post)');
/* THE GONG RULE IN THE HANDS (a fake world: the grid, the men, a hero) */
const grid = L.grid.slice(), P = { x: 30 * TS, y: 34 * TS, face: 1, dead: false, hp: 100, hurt: 0, ground: true, w: 10, h: 18 };
const men = L.ents.map((e, i) => ({ e, i })).filter(({ e }) => e.ks).map(({ e, i }) => ({ t: e.t, cnSkin: e.cnSkin, x: e.x * TS + 8, y: (e.y + 1) * TS, alive: true, hp: 30, face: e.face || -1, xpKey: i + '.0', vy: 0 }));
const W2 = L.W, ctx = { L, players: [P], TS, T, sfx: {}, hero: () => P, movers: () => [], enemies: () => men, time: () => 0, VW: () => 320, VH: () => 180, number() {}, text() {}, burst() {}, sparks() {}, dust() {}, shake() {},
  overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t, box: e => ({ l: e.x - 5, r: e.x + 5, t: e.y - 14, b: e.y }), attackBox: () => null, asPlayer: (p, fn) => fn(), hurtHero() {},
  hurtFoe: (e, d) => { e.hp -= d; if (e.hp <= 0) e.alive = false; }, cellGet: (x, y) => grid[y * W2 + x], cellSet: (x, y, t) => { grid[y * W2 + x] = t; }, cellOpen: (x, y) => { grid[y * W2 + x] = T.AIR; },
  standable: (x, y) => grid[y * W2 + x] === T.SOLID || grid[y * W2 + x] === T.ONEWAY, moveFoe: (e, dx) => { e.x += dx; }, moveFoeY: () => {}, keys: () => ({}), questGot: () => 0, questN: () => 5 };
const H = makeKsarHands(ctx); H.reset(); const K = H.state();
ok(men.filter(m => m.ks).length === men.length, 'every placed fort man knows his role (' + men.length + ')');
for (const g of L.gongs.filter(g => !g.arena)) ok(men.some(m => m.ks.role !== 'planted' && Math.abs(m.x - (g.x * TS + 8)) <= g.ear * TS && Math.abs(m.y - (g.y + 1) * TS) <= g.earY * TS), 'gong ' + g.id + ' calls someone (its earshot holds a fort man)');
const g1 = L.gongs.find(g => g.id === 'g1'), inEar = m => Math.abs(m.x - (g1.x * TS + 8)) <= g1.ear * TS && Math.abs(m.y - (g1.y + 1) * TS) <= g1.earY * TS;
ok(H.ringGong('g1', 'hero') === 'rung', 'E rings the first gong');
ok(men.filter(inEar).every(m => m.ks.role === 'planted' || m.ks.st === 'called'), 'its earshot\'s men are CALLED to it');
ok(men.filter(m => !inEar(m)).every(m => m.ks.st !== 'called'), 'no man outside its earshot is called');
ok(H.ringGong('g1', 'hero') === 'hum', 'a gong rung again while it hums does nothing');
H.cutGong('g2'); ok(K.gongs.find(g => g.id === 'g2').cut && H.ringGong('g2', 'bandit') === 'cut', 'a cut gong never rings (a bandit cannot ring it either)');
H.cutGong('great'); ok(!K.gongs.find(g => g.id === 'great').cut, 'the great gong hangs on a chain: it is never cut (the gate\'s only verb)');
ok(H.braked(), 'the gatehouse squad holds the winch\'s brake from its room');
ok(H.ringGong('great', 'hero') === 'rung' && !H.braked(), 'THE GREAT GONG calls the squad out: the brake lets go');
for (const m of men) if (m.ks.role === 'gatehouse') { m.ks.st = 'fight'; m.x = (G.winch[0]) * TS + 8; m.y = (G.winch[1] + 1) * TS; }
ok(H.braked(), 'a squad man back at the winch holds the brake again (the race back)');
/* the blast */
const keg0 = K.setKegs.find(k => k.id === 'k0'); K.setKegs.filter(k => k.chain).forEach(k => { k.st = 'set'; });
keg0.st = 'lit'; keg0.t = 0.01; H.update(0.02); ok(keg0.st === 'spent' && K.setKegs.find(k => k.id === 'k1').st === 'lit', 'a keg that blasts lights the next one in reach (the chain)');
for (let i = 0; i < 400; i++) H.update(1 / 60);
ok(K.barricades.find(b => b.id === 'storeArch').broken && grid[arch.y1 * W2 + arch.x0] === T.AIR, 'the chain runs to the arch and the brick gives');
/* (fix pass) the bridge gong rung calls the tower's squad - who stop at the lip of the drop, never walk off it; cut, the bridge comes down for good */
{ const sq = men.filter(m => m.ks.role === 'reserve' && m.x > bx1 * TS && m.x < ta.x0 * TS); ok(H.ringGong('bridge', 'bandit') === 'rung' && sq.every(m => m.ks.st === 'called'), 'the bridge gong calls the tower squad (' + sq.length + ')');
  for (let i = 0; i < 300; i++) H.update(1 / 60), sq.forEach(m => H.hold(m, 1 / 60)); ok(sq.every(m => m.x > (bx1 + 1) * TS - 2), 'called over the raised bridge, they stop at the lip (' + sq.map(m => (m.x / TS).toFixed(1)).join(',') + ')');
  H.cutGong('bridge'); let down = true; for (let x = bx0; x <= bx1; x++) down = down && grid[brow * W2 + x] === T.ONEWAY; ok(K.gongs.find(g => g.bridge).cut && down, 'cut, THE ROOF BRIDGE comes down across the drop'); }
/* THE CAST */
const foes = L.ents.filter(e => ['cutthroat', 'slinger', 'shield', 'sapper', 'hawkscout'].includes(e.t)), kind = e => e.cnSkin || e.t, cnt = {};
for (const e of foes) cnt[kind(e)] = (cnt[kind(e)] || 0) + 1;
ok(!L.ents.some(e => /gob|goblin/.test(e.t) || /gob/.test(e.cnSkin || '')), 'no living goblins (human bandits only)');
ok(foes.filter(e => e.t === 'hawkscout').length >= 3 && Object.keys(cnt).length >= 7, 'the cast: the hawk scout (the one new AI) and the reskins ' + JSON.stringify(cnt));
ok(foes.filter(e => e.t !== 'hawkscout').every(e => e.cnSkin), 'every man is a reskin by cnSkin (corpses die in their own skin)');
ok(cnt.wallslinger >= 3 && cnt.smokethrower >= 2, 'ranged men: wall slingers and smoke throwers');
ok(Math.max(...Object.values(cnt)) / foes.length <= 0.35, 'no one kind over ~35% (' + Math.round(100 * Math.max(...Object.values(cnt)) / foes.length) + '%: ' + JSON.stringify(cnt) + ')');
ok(((cnt.ksarblade || 0) + (cnt.gonglookout || 0) + (cnt.whipapprentice || 0)) / foes.length <= 0.5, 'the cutthroat machine (blade, lookout, whip) is at most half the cast (' + Math.round(100 * ((cnt.ksarblade || 0) + (cnt.gonglookout || 0) + (cnt.whipapprentice || 0)) / foes.length) + '%)');
/* CHECKPOINTS, SEALS, SILVER */
const cps = L.ents.filter(e => e.t === 'check').map(e => e.x).sort((a, b) => a - b), stops = [L.START.x, ...cps];
for (let i = 1; i < stops.length; i++) ok(stops[i] - stops[i - 1] >= 90 && stops[i] - stops[i - 1] <= 175, 'checkpoints ' + stops[i - 1] + ' > ' + stops[i] + ': ' + (stops[i] - stops[i - 1]) + ' columns (90..175)');
ok(cps[cps.length - 1] * TS < L.arena.x0 && L.arena.x0 / TS - cps[cps.length - 1] < 12, 'a checkpoint stands at the courtyard door');
ok(L.ents.filter(e => e.t === 'stray' && e.kind === 'caravanseal').length === 5 && L.quest.n === 5, 'five caravan seals, and the quest counts five');
ok(L.ents.filter(e => e.t === 'silver').length <= 3 && L.vaultDoors.length === 1 && L.vaultDoors[0].seals === 5, 'silver at most 3; the strongroom wants the five seals');
/* THE DESERT'S SUN: no walk on the route over SUN.maxWalk out of the shade */
const pts = pacing(lv).route.filter(([x]) => x * TS < L.arena.x0), walk = []; for (let i = 0; i + 1 < pts.length; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], m = Math.max(1, Math.abs(x1 - x0)); for (let k = 0; k < m; k++) walk.push([x0 + Math.sign(x1 - x0) * k, k < m / 2 ? y0 : y1]); }
const shaded = (x, y) => { const px = x * TS + 8, py = (y + 1) * TS; if (L.shade.some(([x0, x1, y0, y1]) => px >= x0 && px <= x1 && py - 2 >= y0 && py - 2 <= y1)) return true; for (let d = 1; d <= SUN.roof; d++) if (at(x, y - d) === T.SOLID) return true; return false; };
let start = null, worst = 0, wAt = 0; for (const [x, y] of walk) { if (shaded(x, y)) { if (start !== null && (x - start) * TS / SUN.RUN > worst) { worst = (x - start) * TS / SUN.RUN; wAt = start; } start = null; } else if (start === null) start = x; }
ok(worst <= SUN.maxWalk + 0.5, 'THE SUN: the longest walk out of the shade on the route is ' + worst.toFixed(1) + ' s from column ' + wAt + ' (the rule ' + SUN.maxWalk + ' s)');
/* THE ROUTE'S STUCK SPOTS: every verb lock glints, with a line the hint box shows */
const spots = STUCK_HANDS.ksar || []; ok(['ks-gate', 'ks-store'].every(id => spots.some(s => s.id === id)), 'the gate and the store glint until done (src/stuck-spots.js STUCK_HANDS.ksar)');
ok(spots.every(s => (s.steps || [s]).every(st => isCallout(st.line))), 'every nudge line is a hint-box line');
/* THE HAWK-MISTRESS (a fake world) */
const A = L.arena; ok(A && A.boss === 'hawkmistress' && L.ents.some(e => e.t === 'hawkmistress'), 'THE HAWK-MISTRESS stands in her courtyard');
const Gm = HM.geom(A, TS), mk = () => { const e = { x: Gm.x1 - 80, y: Gm.floorY, hp: 1000, maxHp: 1000, alive: true, face: -1, mode: 'walk', modeT: 5, open: 0 }; const S = HM.newFight(Gm); S.hawk.x = e.x; S.hawk.y = Gm.floorY - HM.HM.hawkAlt; S.script = ['lash']; return { e, S }; };
const said = []; const c = { hit: () => false, number: (x, y, t) => said.push(t), mark() {}, sound() {}, fx() {}, shake() {}, music() {}, time: () => 0, gongs: () => [{ id: 'yardW', x: Gm.x0 + 88, cut: false, hum: 0 }], guardRing: () => false, guards: () => 0, crumble: () => false };
const hero = [{ x: Gm.x0 + 60, y: Gm.floorY, ground: true, alive: true, air: false }];
{ const { e, S } = mk(); ok(HM.ringHeard(e, S, c) === 'wheel' && S.hawk.mode === 'wheel', 'a gong rung while the hawk is up sends it wheeling');
  let t = 0; while (!HM.hmOpen(e) && t < 3) { HM.stepHawkMistress(e, S, 1 / 60, hero, c); t += 1 / 60; }
  ok(HM.hmOpen(e) && e.mode === 'whistle' && e.open >= 3, 'she whistles it back: OPEN, ' + e.open.toFixed(1) + ' s (>= 3)');
  const x0 = e.x; for (let i = 0; i < 120; i++) HM.stepHawkMistress(e, S, 1 / 60, hero, c); ok(e.x === x0 && HM.hmOpen(e), 'open, she stands still (B4)');
  while (HM.hmOpen(e)) HM.stepHawkMistress(e, S, 1 / 60, hero, c);
  ok(S.ward > 2.5 && S.hawk.mode === 'home', 'a told ward follows the opening (' + S.ward.toFixed(1) + ' s), the hawk on her glove');
  ok(HM.ringHeard(e, S, c) === 'home' && !HM.hmOpen(e), 'a gong in the ward finds the hawk home: nothing'); }
{ const { e, S } = mk(); S.script = null; let opened = false; for (let i = 0; i < 60 * 60; i++) { HM.stepHawkMistress(e, S, 1 / 60, hero, c); if (HM.hmOpen(e)) opened = true; } ok(!opened, 'a minute of her left alone (no gong, no flash) never opens her: the opening is made, not waited for (B1, B13)'); }
{ const { e, S } = mk(); ok(HM.flashAt(e, S, c, S.hawk.x + 200, S.hawk.y) === 'far', 'a flash out of the hawk\'s reach does nothing');
  ok(HM.flashAt(e, S, c, S.hawk.x + 20, S.hawk.y + 30) === 'blind', 'a flash in reach blinds the hawk'); let t = 0; while (!HM.hmOpen(e) && t < 3) { HM.stepHawkMistress(e, S, 1 / 60, hero, c); t += 1 / 60; }
  ok(HM.hmOpen(e), 'blinded, she whistles it back: OPEN'); }
{ const e = { x: 500, y: 300, face: -1, mode: 'walk', open: 0 };
  ok(HM.guarded(e, 470, 300, false), 'her gauntlet turns a blow from the front at her height (walking)');
  ok(!HM.guarded(e, 530, 300, false), 'not from behind (GO ROUND)'); ok(!HM.guarded(e, 480, 270, true), 'not from above (a jump)');
  e.mode = 'lashTell'; ok(!HM.guarded(e, 470, 300, false), 'not in her tells: committed, every blow lands'); }
ok(HM.HM.openT >= 3 && HM.HM.wardT >= 2.5 && HM.HM.wardT <= 3.5, 'openings >= 3 s, the ward ~3 s');
const movesOf = ph => new Set(HM.CYCLES[ph].flat());
ok(movesOf(2).has('call') && !movesOf(1).has('call') && movesOf(3).has('dive') && !movesOf(2).has('dive'), 'one new told move a phase: the call (phase two), the hawk\'s dive (phase three)');
for (const [m, v] of Object.entries(HM.MOVES)) { ok(MARK['hawkmistress|' + m] === v.mark, 'her ' + m + ' mark is src/marks.js\'s (' + v.mark + ')'); if (v.answer) ok(ANSWER['hawkmistress|' + m] === v.answer, 'her ' + m + ' answer is src/marks.js\'s'); }
ok(MARK['hawkscout|diveTell'] === '!!', 'the hawk scout\'s stoop is a !! (src/marks.js)');
ok(typeof OPEN_RULE.hawkmistress === 'function' && FULL_DAMAGE.hawkmistress, 'src/boss-greed.js: her opening (OPEN_RULE) and a duelist\'s full damage (FULL_DAMAGE; greed still counts)');
/* THE BOT'S READING: open -> cut her; the hawk up in phase one -> a gong */
{ const { e, S } = mk(); e.mode = 'whistle'; e.open = 2; const o = HM.hmPlan({ P: { x: e.x - 20, y: e.y, face: 1, ground: true, atk: -1 }, e, S, gongs: c.gongs(), racks: [], reach: 26, t: 0, mem: {} }); ok(o.atk, 'the bot cuts her open (' + o.why + ')'); }
{ const { e, S } = mk(); e.mode = 'walk'; const g = c.gongs()[0]; e.x = g.x + 110; const o = HM.hmPlan({ P: { x: g.x - 4, y: e.y, face: 1, ground: true, atk: -1 }, e, S, gongs: c.gongs(), racks: [], reach: 26, t: 5, mem: {}, rng: () => 0.9 }); ok(o.talk || /gong/.test(o.why), 'the bot works the rule: at a gong with the hawk up it rings (' + o.why + ')'); }
/* THE MUSIC, THE BEDS */
ok(!SYNTH_BOSS.ksar && SYNTH_BOSS.hawkmistress && SYNTH_VARIANT['hawkmistress:p2'] && SYNTH_VARIANT['hawkmistress:p3'], "her theme in three phases is composed in code; the level's greybox synth bed is gone (art pass: 'Desert Loop' is the level track)");
ok(readFileSync(new URL('../src/audio.js', import.meta.url), 'utf8').includes("ksar: './audio/ksar.ogg'") && readFileSync(new URL('../audio/CREDITS.txt', import.meta.url), 'utf8').includes('Desert Loop') && readFileSync(new URL('../src/credits.js', import.meta.url), 'utf8').includes("'Desert Loop'"), "the level track is audio/ksar.ogg (\"Desert Loop\" by iamoneabe, CC0), credited in CREDITS.txt, MUSIC_CREDITS and the credits page");
ok(L.music === 'ksar' && A.music === 'hawkmistress' && readFileSync(new URL('../src/audio.js', import.meta.url), 'utf8').includes('  ksar() {') && L.ambient[0].kind === 'ksar', 'the level plays its own bed and its own ambient');
ok(HAWK.blind >= 2 && HAWK.cd > 0, 'the hawk scout: a flash blinds it, it rests between stoops');
ok(readFileSync(new URL('./one-new-foe.mjs', import.meta.url), 'utf8').includes("ksar: ['hawkscout']"), 'one-new-foe pins the Ksar\'s one new foe: the hawk scout');
console.log('ksar: ' + n + ' checks ok');
