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
ok(SECTIONS.length === 10 && SECTIONS.every((s, i) => i === 0 || s[1] > SECTIONS[i - 1][1]) && SECTIONS[SECTIONS.length - 1][1] * TS === L.arena.x0, 'nine sections and the rooftops, in order (claude/ksar2: the powder quarter, the keg alley and the line to the roofs added before her)');
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
const chain = L.setKegs.filter(k => k.chain && !k.alley).sort((a, b) => a.x - b.x); ok(chain.length >= 4, 'the store\'s keg chain: ' + chain.length + ' kegs');
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
const cpx = L.ents.filter(e => e.t === 'check').map(e => e.x).sort((a, b) => a - b), c4 = cpx.filter(x => x < 505).pop(), c5 = cpx.find(x => x > 560);   /* (claude/ksar2) the checkpoints that bracket the roofs' climax (more come after it now) */
ok(c4 < bg.x && c5 > ta.x1 && L.gongs.some(g => !g.bridge && !g.arena && g.x > bx1 && g.x < ta.x0), 'the climax (bridge gong ' + bg.x + ', a gong on roof three, the tower door ' + ta.x0 + ') sits between checkpoint ' + c4 + ' and checkpoint ' + c5 + ' (after it)');
ok(L.ents.filter(e => e.ks === 'reserve' && e.x > bx1 && e.x < ta.x0).length >= 3, 'the hawk tower\'s squad sleeps in its hut on roof three (a ring calls them)');
/* (MUST 2) THE FORT HITS HARD: weight, not hazards; the post kegs cut to a dozen */
ok(['ksarblade', 'whipapprentice', 'shieldsentry'].every(k => L.foeHit[k] >= 1.8) && L.foeHit.gonglookout >= 1.5, 'the fort\'s men hit hard (L.foeHit ' + JSON.stringify(L.foeHit) + ')');
ok(L.setKegs.filter(k => !k.alley && !k.caged).length <= 14 && L.setKegs.filter(k => !k.chain && !k.caged).length <= 8, 'set kegs: ' + L.setKegs.length + ' - the store chain, the keg alley chain, the caged keg on the trail, and a few by the squads (' + L.setKegs.filter(k => !k.chain && !k.caged).length + ') - not a keg at every post');
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
/* (claude/ksar2) THE LONGER KSAR: each new verb REQUIRED where it stands - THE TORCH (the reed screen, the raised bridge, the trail), THE CARRIED KEG (the powder run's
   walls), THE CHAIN (the keg alley's arch), THE FLASK (the nests), THE ZIP LINE (the line over the last chasm), THE CUT ROPE (the raider line) */
{ const solidRow = (x0, x1, y) => { for (let x = x0; x <= x1; x++) if (at(x, y) !== T.SOLID) return false; return true; }, sk = (x, y) => (b => Math.hypot(b.x * TS + 8 - x, (b.y + 1) * TS - 6 - y));
  const blastReaches = b => L.setKegs.some(k => { for (let cy = b.y0; cy <= b.y1; cy++) for (let cx = b.x0; cx <= b.x1; cx++) if (Math.hypot(cx * TS + 8 - (k.x * TS + 8), cy * TS + 8 - ((k.y + 1) * TS - 6)) < KS.breakR) return true; return false; });
  const r = L.reeds.find(q => q.id === 'reedA'); ok(r && solidRow(r.x0, r.x1, r.y0 - 1) && r.y1 - r.y0 + 1 >= 6 && !blastReaches(r), 'THE REED SCREEN: six rows of reed under an eave - no way over, no set keg reaches it: a TORCH burns it (required)');
  ok(L.stacks.some(s => s.kind === 'torch' && s.x < r.x0 && r.x0 - s.x <= 12) && sign(r.x0 - 12, r.x0, /FIRE EATS REED/), 'a torch rack and a sign (FIRE EATS REED) before the reed screen: the torch taught safe (no foe between)');
  ok(!L.ents.some(e => (e.ks || e.t === 'hawkscout') && e.x > r.x0 - 14 && e.x < r.x1), 'the torch is taught where failure is cheap: no foe at the reeds');
  for (const id of ['runA', 'runB']) { const w = L.barricades.find(b => b.id === id), st = L.stacks.filter(s => s.kind === 'keg' && s.x < w.x0).sort((a, b) => b.x - a.x)[0];
    ok(w && solidRow(w.x0 - 1, w.x1 + 1, w.y0 - 1) && w.y1 - w.y0 + 1 >= 6 && !blastReaches(w) && st && w.x0 - st.x >= 7 && w.x0 - st.x <= 12, 'THE POWDER RUN, wall ' + id + ': under its eave, no set keg reaches it, its stack ' + (w.x0 - st.x) + ' tiles back - too far to throw: CARRY a keg (required)'); }
  const rb = L.ropeBridges[0], [sx0, sx1, srow] = rb.span; let open = true; for (let x = sx0; x <= sx1; x++) open = open && at(x, srow) === T.AIR;
  ok(rb && sx1 - sx0 + 1 >= 7 && open && solidRow(sx0, sx1, srow - 8) && at(rb.x, rb.y1) === T.SOLID && L.stacks.some(s => s.kind === 'torch' && s.x < sx0 && sx0 - s.x <= 6), 'THE RAISED BRIDGE: a chasm of ' + (sx1 - sx0 + 1) + ' under a low beam (no jump crosses it), the bridge standing raised on the far lip, a torch rack on the near: a thrown TORCH burns its rope (required)');
  const tr = L.trails[0], tk = L.setKegs.find(k => k.id === tr.keg), tw = L.barricades.find(b => b.id === 'trailWall'), bars = L.barricades.find(b => b.id === 'trailBars');
  ok(tk && tk.caged && bars && bars.x0 < tk.x && tw.x0 > tk.x && tr.x1 >= tk.x && tr.x0 < bars.x0 && solidRow(bars.x0, tw.x1, tw.y0 - 1) && Math.hypot((tw.x0 * TS + 8) - (tk.x * TS + 8), 0) < KS.breakR, 'THE POWDER TRAIL: its keg caged behind bars beside the bricked wall (no blade, no throw reaches it), the trail running to it: a TORCH lights the trail (required)');
  const alley = L.setKegs.filter(k => k.alley).sort((a, b) => a.x - b.x), aa = L.barricades.find(b => b.id === 'alleyArch');
  ok(alley.length >= 6 && alley.every((k, i) => !i || (k.x - alley[i - 1].x) * TS <= KS.chainR) && Math.hypot(aa.x0 * TS + 8 - (alley[alley.length - 1].x * TS + 8), 0) < KS.breakR && solidRow(aa.x0 - 1, aa.x1 + 1, aa.y0 - 1), 'THE KEG ALLEY: ' + alley.length + ' kegs, each in reach of the last; the last breaks the bricked arch under its eave: the CHAIN opens it');
  const ad = L.drops.filter(([x0]) => x0 > alley[0].x && x0 < aa.x0); ok(ad.length >= 2 && sign(alley[0].x - 14, alley[0].x, /A FALL IS THE END/), 'the alley is an exam: ' + ad.length + ' breaks in its floor are deaths (A10), told by a sign at its mouth');
  ok(ad.every(([x0, x1]) => foeNear(x0, x1, 8).length > 0), 'a foe at each break in the alley floor: ' + ad.map(([x0, x1]) => foeNear(x0, x1, 8).map(e => e.cnSkin || e.t).join('+')).join(' | '));
  const rl = L.raidLines[0], z = rl.line; ok(rl && L.zipLines.includes(z) && L.gongs.some(g => g.id === rl.gong) && L.ents.some(e => e.ks === 'lookout' && e.gong === rl.gong) && z.y0 < z.y1 && sign(rl.post.x - 4, rl.post.x + 4, /A BLADE ON ITS POST CUTS IT/),
    'THE RAIDER LINE: off the tower into the alley, its gong raced for by a lookout, its post signed A BLADE ON ITS POST CUTS IT (the CUT remix)');
  const ns = L.ents.filter(e => e.nest); ok(ns.length >= 2 && ns.every(e => L.nests.some(n => e.x >= n.x0 && e.x <= n.x1)) && L.stacks.some(s => s.kind === 'flask' && s.x < ns[0].x && ns[0].x - s.x <= 16) && KS.nestStun >= 3, 'THE ARCHER NESTS: ' + ns.length + ' slingers in nests over the climb, a flask rack before them, a flash blinds a nest ' + KS.nestStun + ' s');
  const zs = L.zipLines.filter(q => !q.raid).sort((a, b) => a.x0 - b.x0), teach = zs[0], last = zs[zs.length - 1];
  ok(teach && !L.drops.some(([x0, x1]) => x1 * TS >= teach.x0 && x0 * TS <= teach.x1) && sign(Math.floor(teach.x0 / TS) - 3, Math.floor(teach.x0 / TS), /UP TAKES/), 'THE ZIP LINE taught safe: a rope off the terrace to the street, nothing deadly under it, a sign at its handle (UP TAKES...)');
  const ld = L.drops.find(([x0, x1]) => x0 * TS >= last.x0 && x1 * TS < last.x1); ok(last && ld && ld[1] - ld[0] + 1 >= 7 && last.x1 < L.arena.x0 && L.arena.x0 - last.x1 < 8 * TS && cps.some(x => x * TS > last.x1 && x * TS < L.arena.x0),
    'THE LINE TO HER ROOFS: from the tower top over a ' + (ld ? ld[1] - ld[0] + 1 : 0) + '-tile chasm (no jump) to the rooftops\' door, a checkpoint at its foot: the ZIP LINE is required');
  /* the hands: a torch's fire, the trail, the raiders and the cut */
  const g2 = L.grid.slice(), W3 = L.W, spawned = [], P2 = { x: 594 * TS, y: 34 * TS, face: 1, dead: false, hp: 100, hurt: 0, ground: true, w: 10, h: 18, atk: -1 };
  const ctx2 = Object.assign({}, ctx, { L: Object.assign({}, L, { zipLines: L.zipLines.slice() }), players: [P2], hero: () => P2, enemies: () => spawned, cellGet: (x, y) => g2[y * W3 + x], cellSet: (x, y, t) => { g2[y * W3 + x] = t; }, cellOpen: (x, y) => { g2[y * W3 + x] = T.AIR; },
    standable: (x, y) => g2[y * W3 + x] === T.SOLID || g2[y * W3 + x] === T.ONEWAY, spawnFoe: o => { const e = { t: o.t, cnSkin: o.cnSkin, x: o.x * TS + 8, y: (o.y + 1) * TS, alive: true, hp: 30, face: -1, vy: 0 }; spawned.push(e); return e; } });
  const H2 = makeKsarHands(ctx2); H2.reset(); const K2 = H2.state();
  K2.items.push({ t: 'kstorch', thrKind: 'torch', state: 'fly', x: (r.x0 - 1) * TS + 8, y: 30 * TS, vx: 60, vy: 0, burnT: 0, counted: 1 });
  for (let i = 0; i < 180; i++) H2.update(1 / 60); ok(K2.reeds[0].st === 'burnt' && g2[30 * W3 + r.x0] === T.AIR, 'a torch thrown at the reed screen burns it away: the way is open');
  K2.items.push({ t: 'kstorch', thrKind: 'torch', state: 'burn', x: (tr.x0 + 1) * TS, y: (tr.y + 1) * TS - 2, vx: 0, vy: 0, burnT: 4, counted: 1 });
  for (let i = 0; i < 600; i++) H2.update(1 / 60); ok(K2.trails[0].st !== 'dry' && K2.barricades.find(b => b.id === 'trailWall').broken, 'a torch on the trail: the fire runs to the caged keg and the wall blows');
  K2.items.push({ t: 'kstorch', thrKind: 'torch', state: 'fly', x: (rb.x - 2) * TS, y: 31 * TS, vx: 80, vy: 0, burnT: 0, counted: 1 });
  for (let i = 0; i < 240; i++) H2.update(1 / 60); let down = true; for (let x = sx0; x <= sx1; x++) down = down && g2[srow * W3 + x] === T.ONEWAY; ok(K2.ropes[0].st === 'down' && down, 'a torch at the raised bridge: its rope burns through and it falls across the chasm');
  H2.ringGong(rl.gong, 'bandit'); for (let i = 0; i < 120; i++) { H2.update(1 / 60); for (const e of spawned) H2.hold(e, 1 / 60); }
  ok(spawned.length === rl.n && spawned.some(e => e.ksRide || e.ks.st === 'fight'), 'the alley gong rung: ' + spawned.length + ' raiders ride the line in');
  for (let i = 0; i < 200; i++) H2.update(1 / 60); H2.cutLine(rl.id); ok(K2.raids[0].cut && !ctx2.L.zipLines.includes(z), 'a blade on its post cuts the raider line: the rope is gone (no one rides it, the hero neither)');
  const s0 = spawned.length; H2.ringGong(rl.gong, 'hero'); for (let i = 0; i < 120; i++) H2.update(1 / 60); ok(spawned.length === s0, 'a cut line brings no more raiders'); }
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
/* (claude/ksar2) ONE NEW TOLD MOVE OF HERS A PHASE (B5): the snare (one), the knife fan (two), the keg kick (three); the hawk's rake from the start and its
   snatch from phase two; the call (her guard: the arena's change) from phase two */
for (const p of [1, 2, 3]) { const nw = HM.NEW_MOVES[p]; ok(movesOf(p).has(nw) && (p === 1 || !movesOf(p - 1).has(nw)), 'phase ' + p + "'s new move of hers: " + nw); }
ok(movesOf(1).has('rake') && !movesOf(1).has('snatch') && movesOf(2).has('snatch') && movesOf(2).has('call') && !movesOf(1).has('call'), "the hawk's two told attacks: the rake (from phase one) and the snatch (from phase two); the call from phase two");
ok(!Object.values(HM.CYCLES).flat(2).includes('dive'), "the old hawk's dive is the rake now (a told line, not a straight stoop)");
/* THE ROOFTOPS: three roofs, two spiked shafts between them (a jump for every hero), the updraft's floor under each */
{ const sh = L.shafts || []; ok(sh.length === 2, 'the arena is the fort\'s roofs with ' + sh.length + ' shafts between them');
  for (const q of sh) { let open = true; for (let x = q.x0; x <= q.x1; x++) { for (let y = q.top - 18; y <= q.bottom; y++) open = open && at(x, y) === T.AIR; open = open && at(x, q.bottom + 1) === T.SOLID; }
    ok(open && q.x1 - q.x0 + 1 <= 3 && q.x1 - q.x0 + 1 >= 2, 'shaft ' + q.x0 + '-' + q.x1 + ': ' + (q.x1 - q.x0 + 1) + ' wide (a plain jump), ' + (q.bottom - q.top + 1) + ' deep to a floor (the spikes; the updraft throws you out - never a death)');
    ok(at(q.x0 - 1, q.top) === T.SOLID && at(q.x1 + 1, q.top) === T.SOLID, 'shaft ' + q.x0 + ': a roof at its height on each side'); }
  ok(KS.shaftPct >= 0.2 && KS.shaftPct <= 0.3 && KS.updraftV >= 300, 'a fall in costs ' + Math.round(KS.shaftPct * 100) + '% (A10) and the updraft throws you up at ' + KS.updraftV + ' px/s'); }
/* HER NEW MOVES AND THE HAWK'S, in the fake world */
{ const G2 = HM.geom(A, TS), at2 = { x: G2.roofs[1][0] + 60, y: G2.floorY }, mk2 = (m, hx) => { const e = { x: at2.x, y: G2.floorY, hp: 1000, maxHp: 1000, alive: true, face: -1, mode: 'recover', modeT: 0, open: 0 }; const S = HM.newFight(G2); S.hawk.x = e.x; S.hawk.y = G2.floorY - HM.HM.hawkAlt; S.script = [m]; S.step = 0; return { e, S, hero: [{ x: hx ?? e.x - 50, y: G2.floorY, ground: true, alive: true }] }; };
  const run = (e, S, hero, c2, secs) => { for (let i = 0; i < secs * 60; i++) HM.stepHawkMistress(e, S, 1 / 60, hero, c2); };
  const base = (o = {}) => Object.assign({}, c, { hit: () => true }, o);
  { const { e, S, hero } = mk2('snare'); let dir = null; run(e, S, hero, base({ snare: d => { dir = d; return true; } }), 1.2); ok(dir !== null && S.n.snared === 1, 'THE WHIP SNARE: told (!!), it wraps a hero in reach and hands him to the yank'); }
  { const { e, S, hero } = mk2('fan'); const seen = []; run(e, S, hero, base({ knife: k => { if (!seen.includes(k.key)) seen.push(k.key + ':' + k.ht); return null; } }), 2.5); const hts = new Set(seen.map(s => s.split(':')[1]));
    ok(S.n.knives === 3 && hts.size >= 2, 'THE KNIFE FAN: three knives at their heights (' + seen.map(s => s.split(':')[1]).filter((v, i, a) => a.indexOf(v) === i).join(', ') + ')'); }
  { const { e, S, hero } = mk2('keg'); let struck = false; run(e, S, hero, base({ keg: K => (!struck && Math.abs(K.x - hero[0].x) < 20 ? (struck = true, 'struck') : null) }), 4);
    ok(struck && S.n.kegsBack === 1 && S.n.kegOpens === 1, 'THE KEG KICK: struck back, it rolls home and blows under her: OPEN (' + S.n.kegOpens + ')'); }
  { const { e, S, hero } = mk2('keg'); run(e, S, hero, base({ keg: () => null }), 5); ok(S.n.kegOpens === 0 && !S.keg, 'a keg nobody strikes back opens nothing (it blows where it rolls)'); }
  { const { e, S, hero } = mk2('rake'); let tried = 0; run(e, S, hero, base({ hawkAt: () => (S.hawk.mode === 'rake' && ++tried > 3 ? 'struck' : null) }), 2.5);
    ok(S.n.flinches === 1 && S.n.opens === 1, 'THE RAKE DIVE: struck mid-dive, the hawk FLINCHES and is sent off - she whistles it back: OPEN'); }
  { const { e, S, hero } = mk2('rake'); run(e, S, hero, base({ hawkAt: () => (S.hawk.mode === 'rake' ? 'blocked' : null) }), 2.5); ok(S.n.flinches === 1 && S.n.opens === 1, 'the rake turned on a shield: it flinches, she is open'); }
  { const { e, S, hero } = mk2('rake'); run(e, S, hero, base({ hawkAt: () => null }), 3); ok(S.n.flinches === 0 && S.n.opens === 0, 'a rake stepped off opens nothing'); }
  { const { e, S, hero } = mk2('snatch'); let carried = null; run(e, S, hero, base({ hawkAt: () => (S.hawk.mode === 'drop' ? 'hit' : null), carry: x => { carried = x; } }), 2.5);
    ok(carried !== null && G2.shafts.some(([a, b]) => carried > a && carried < b), 'THE SNATCH: a caught hero is carried over a shaft and let go (x ' + Math.round(carried) + ')'); }
  { const { e, S, hero } = mk2('snatch'); run(e, S, hero, base({ hawkAt: () => (S.hawk.mode === 'drop' ? 'struck' : null) }), 2.5); ok(S.n.flinches === 1 && S.n.opens === 1, 'the snatch struck as it drops: it flinches, she is open'); }
  { const { e, S } = mk2('lash'); const far = [{ x: G2.roofs[0][0] + 40, y: G2.floorY, ground: true, alive: true }]; e.mode = 'walk'; e.modeT = 3; S.script = ['lash']; let leapt = false, inShaft = false;
    for (let i = 0; i < 6 * 60; i++) { HM.stepHawkMistress(e, S, 1 / 60, far, base({ hit: () => false })); if (e.mode === 'leap') leapt = true; if (e.mode !== 'leap' && HM.overShaft(G2, e.x, 4)) inShaft = true; }
    ok(leapt && HM.roofOf(G2, e.x) === 0 && !inShaft, 'she LEAPS the shaft after a hero on another roof and lands on his roof - never standing over a shaft (B12)'); }
  const hsrc = readFileSync(new URL('../src/hawk-mistress-hands.js', import.meta.url), 'utf8');
  ok(HM.HM.floor >= 0.4 && (hsrc.match(/return dmg \* HM\.floor;/g) || []).length === 2 && !/return 0; *}\s*\n\s*if \(HMM\.hmOpen/.test(hsrc), 'B15: her ward and her gauntlet turn a blow to ' + HM.HM.floor + 'x - never wholly');
  const bot = (o) => HM.hmPlan(Object.assign({ e: mk2('lash').e, S: mk2('lash').S, gongs: [], racks: [], reach: 26, t: 9, mem: {}, rng: () => 0.99, v2: true }, o));
  { const m = mk2('lash'); const o = HM.hmPlan({ P: { x: G2.shafts[0][0] - 6, y: G2.floorY, face: 1, ground: true, atk: -1 }, e: Object.assign(m.e, { x: G2.roofs[1][0] + 70, mode: 'walk' }), S: m.S, gongs: [], racks: [], reach: 26, t: 9, mem: {}, v2: true }); ok(o.jump, 'the bot JUMPS a shaft at its lip (' + o.why + ')'); }
  { const m = mk2('lash'), mem = {}, q = t => HM.hmPlan({ P: { x: m.e.x - 40, y: G2.floorY, face: 1, ground: true, atk: -1, snared: true }, e: m.e, S: m.S, gongs: [], racks: [], reach: 26, t, mem, v2: true }); q(9); ok(q(9.5).jump, 'the bot jumps free of a snare (a beat late)'); void bot; } }
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
