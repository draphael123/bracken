// tools/lit-church.mjs - THE LIT CHURCH's own check (claude/litchurch). Node only: no page, no port, no Chrome. The built level, the pure modules, and the hands in
// a fake world (src/lit-church-hands.js takes a context; here it is the built grid, a hero and a few clergy):
//   - the road: an optional class spur (needs waymeet until THE TOWPATH lands - FORK says 'towpath' then), the Paladin sold for 800 coins after it; Waymeet's boss is
//     THE CRUSADER now (names only)
//   - the rule line is the code's (LEVELS row == src/lit-church.js header); the verbs' arcs teach -> test -> remix -> exam; EACH VERB REQUIRED: LIGHT (the west door,
//     the rood screen's three sconces - no way over either), SNUFF (the seal lamp holds the crypt hatch: the crypt has no other way in), THE ORGAN (the bellows are
//     the only way up to the gallery; the broken loft is wider than any jump), THE CRYPT (lamp three cracks the crossing's grate: the only way up out of it);
//     signs at the point of use say the verb
//   - the rule in the hands: rooms lit / dark by their lamps; a flame taken, carried, put out by a blow, burnt out; a lamp lit and snuffed; a priest's blows by his
//     room's light; the doors; THE DARK RISES and a lit sconce holds it; out of the well, the nave goes dark
//   - the cast: no goblin without a skin, a ranged foe, three roles, every foe tied to the light (clergy or dead); every climb on the route a two-row step
//   - THE PALADIN (src/paladin-boss.js, a fake world): his aegis turns the front on guard and FEEDS his light; behind, above, in his tells it lands and DRAINS;
//     emptied, he FALTERS >= 3 s standing still (B4), then a told ward (B3); hammering his aegis for a minute never opens him; a snuffed lamp dims him; his
//     radiance has a column for each lamp burning; one new told move a phase (B5); his marks are src/marks.js's; OPEN_RULE + FULL_DAMAGE (B11)
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS, T } from '../src/level.js';
import { CHURCH, RULE, ARCS, SECTIONS, FORK } from '../src/lit-church.js';
import * as PBM from '../src/paladin-boss.js';
import { makeLitChurchHands, FLAME, LC } from '../src/lit-church-hands.js';
import { BY_HAND, ANSWER } from '../src/marks.js';
import { OPEN_RULE, FULL_DAMAGE } from '../src/boss-greed.js';
import { SYNTH_BOSS } from '../src/boss-music.js';
import { STUCK_HANDS } from '../src/stuck-spots.js';
import { isCallout } from '../src/hint-lines.js';
import { ROLES } from './level-quality.mjs';
const TS = 16; let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const lv = LEVELS.find(l => l.id === 'church'); ok(lv, 'church is in LEVELS');
ok(['waymeet', 'towpath'].includes(lv.needs) && lv.classFor === 'paladin' && lv.opensOn && [FORK.now, FORK.then].includes(lv.opensOn.level), 'THE LIT CHURCH is the Paladin\'s optional class spur off ' + lv.needs + ' (the fork: ' + FORK.why + ')');
ok(FORK.then === 'towpath', 'the fork hook names THE TOWPATH for the integrator');
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
ok(/\{ id: 'paladin', name: 'THE PALADIN', price: 10, silver: true, coinPrice: 800, coinNeeds: 'church',/.test(main), 'clearing the church sells the Paladin for 800 coins (beside his 10 silver)');
ok(/\{ t: 'closedhelm', name: 'THE CRUSADER',/.test(main) && !/'THE PALADIN  THE WARD IS DOWN'/.test(main) && /closedhelm: 'THE CRUSADER'/.test(main), 'Waymeet\'s boss is THE CRUSADER (bestiary, short name, plate)');
ok(/\{ t: 'paladinboss', name: 'THE PALADIN',/.test(main), 'the church\'s boss is THE PALADIN');
ok(/id: 'church', kind: 'level'.*spur: true/.test(main), 'the church has its spur node on the inland map');
const L = lv.build(), at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H ? T.SOLID : L.grid[y * L.W + x]);
const stand = (x, y) => at(x, y) !== T.SOLID && at(x, y) !== T.PORT && (at(x, y + 1) === T.SOLID || at(x, y + 1) === T.ONEWAY || at(x, y + 1) === T.PORT);
/* THE RULE LINE is the code's */
const src = readFileSync(new URL('../src/lit-church.js', import.meta.url), 'utf8');
ok(lv.rule === RULE && src.includes('// THE RULE: ' + RULE), 'the rule line in LEVELS is the one src/lit-church.js states');
ok(/LIT ROOM/.test(RULE) && /DARK ONE LETS THE DEAD UP/.test(RULE) && /CARRY A FLAME TO LIGHT A LAMP/.test(RULE) && /A BLOW SNUFFS IT/.test(RULE), 'the rule line names both states and both verbs');
for (const v of ['light', 'snuff', 'organ', 'crypt']) ok(ARCS[v].teach && ARCS[v].test && ARCS[v].remix && ARCS[v].exam, 'the ' + v + ' is taught, tested, remixed and examined');
ok(SECTIONS.length === 8, 'eight places in the cross');
const sign = (x0, x1, re) => L.ents.some(e => e.t === 'sign' && e.x >= x0 && e.x <= x1 && re.test(e.text));
const door = id => L.doors.find(d => d.id === id), lamp = id => L.lamps.find(l => l.id === id);
for (const d of L.doors) for (let y = d.y0; y <= d.y1; y++) for (let x = d.x0; x <= d.x1; x++) ok(at(x, y) === T.PORT, 'the door ' + d.id + ' is barred as laid (' + x + ',' + y + ')');
/* REQUIRED: LIGHT - the west door (no way over the church's west wall from the graveyard) */
{ const d = door('west'); ok(d.by === 'porch' && lamp('porch').opens === 'west' && !lamp('porch').lit, 'the west door opens to the porch lamp, dark as laid');
  let top = 0; while (top < L.H && at(d.x0, top) !== T.SOLID) top++; let hi = 99; for (let x = 0; x < d.x0; x++) for (let y = 0; y < L.H - 1; y++) if (stand(x, y)) hi = Math.min(hi, y);
  ok(hi - top >= 6, 'no way over the west wall: its top is row ' + top + ', the graveyard\'s highest footing row ' + hi);
  ok(sign(0, 12, /E AT A FIRE TAKES A FLAME/) && sign(30, 43, /THE WEST DOOR OPENS TO A LIT LAMP/), 'the flame and the porch lamp are taught at the point of use'); }
/* REQUIRED: LIGHT - the rood screen (three sconces; no way over the screen) */
{ const d = door('rood'), rs = L.lamps.filter(l => l.kind === 'rood'); ok(rs.length === 3 && rs.filter(l => l.hand).length === 1 && rs.every(l => !l.lit), 'the rood screen has three dark sconces, the third lit by hand');
  ok(['chapel1', 'chapel2', 'chapel3'].every(id => lamp(id) && lamp(id).kind === 'chapel' && rs.some(q => q.of === id)), 'each chapel lamp has its sconce on the screen');
  for (let y = 0; y < d.y0; y++) ok(at(d.x0, y) === T.SOLID, 'the rood screen stands to the vault (' + d.x0 + ',' + y + ')');
  ok(sign(165, 178, /THE ROOD SCREEN OPENS WHEN ITS THREE SCONCES BURN/), 'a sign at the screen says what opens it'); }
/* REQUIRED: SNUFF - the seal lamp holds the crypt hatch, and the crypt has no other way in */
{ const s = lamp('seal'); ok(s.lit && s.opens === 'hatch' && door('hatch').by === 'seal', 'the seal lamp burns as laid and holds the hatch');
  const crypt = (x, y) => x >= 46 && x <= 178 && y >= CHURCH.nave + 2 && y <= CHURCH.crypt - 1;
  const ways = []; for (let x = 46; x <= 178; x++) { const y = CHURCH.nave + 1; if (at(x, y) !== T.SOLID) ways.push(x + ':' + at(x, y)); }
  ok(ways.every(w => /:(12)$/.test(w) || /:(2)$/.test(w)), 'the crypt\'s ceiling has no open hole but barred doors and the grate\'s step: ' + ways.join(' '));
  for (let y = CHURCH.nave + 2; y < CHURCH.crypt; y++) { ok(at(45, y) === T.SOLID, 'the crypt\'s west wall (' + y + ')'); if (y !== 39 && y !== 40) ok(at(179, y) === T.SOLID, 'the crypt\'s east wall (' + y + ')'); }
  ok(door('sacristy').x0 === 184 && door('sacristy').by === 'stubs', 'the crypt\'s only east way is the sacristy passage, barred until the reliquary');
  ok(sign(46, 55, /A BLOW SNUFFS A LAMP/) && sign(46, 55, /THE SEAL LAMP: ITS LIGHT HOLDS THE CRYPT SHUT/), 'the snuff and the seal are taught at the point of use'); }
/* REQUIRED: THE ORGAN - the bellows (the gallery is out of reach from the transept) and the chord (the broken loft is wider than a jump) */
{ const b = L.bellows.find(q => q.id === 'transept'); ok(b && b.top < CHURCH.gallery - 4, 'the transept\'s bellows lift past the gallery floor');
  let hi = 99; for (let x = 152; x <= 178; x++) for (let y = CHURCH.gallery + 1; y < CHURCH.nave; y++) if (stand(x, y)) hi = Math.min(hi, y);
  ok(hi - (CHURCH.gallery - 1) >= 6, 'no jump from the crossing or the transept reaches the gallery: highest footing row ' + hi);
  const gap = []; for (let x = 56; x <= 178; x++) if (at(x, CHURCH.gallery) !== T.SOLID && !(x >= b.x - 1 && x <= b.x + 1)) gap.push(x);
  ok(gap.length >= 9 && gap[gap.length - 1] - gap[0] === gap.length - 1, 'THE BROKEN LOFT is ' + gap.length + ' columns: no jump crosses it (the real jump is ~4 tiles)');
  for (const x of gap) for (let y = 6; y < CHURCH.gallery; y++) ok(at(x, y) === T.AIR, 'nothing to land on over the broken loft (' + x + ',' + y + ')');
  const d = L.desks[0]; ok(d && d.dir === -1 && d.x0 <= gap[0] - 4 && d.x1 >= gap[gap.length - 1] + 4 && d.x > gap[gap.length - 1], 'the key desk is on the loft\'s east lip and its gust covers the gap, blowing west');
  ok(sign(160, 168, /THE ORGAN'S BELLOWS: STRIKE IT/) && sign(106, 114, /E PLAYS A CHORD/), 'the bellows and the key desk are taught at the point of use'); }
/* REQUIRED: THE CRYPT - lamp three cracks the crossing's grate, the only way up */
{ ok(lamp('chapel3').cracks && door('cryptgrate').by === 'chapel3', 'lamp three cracks the crossing\'s crypt grate');
  const w = L.rooms.find(r => r.rises); ok(w && w.rises.floor === CHURCH.crypt, 'the crypt well is where the dark rises');
  const holds = L.lamps.filter(l => l.room === w.id && l.hold); ok(holds.length >= 3, 'three sconces on the well\'s landings hold the dark'); }
/* EVERY CLIMB ON THE ROUTE IS A TWO-ROW STEP (the jump peaks at 51 px: main.js JUMPV) - the well's landings, the piers */
{ const rows = [52, 50, 48, 46, 44, 42, 40]; for (const r of rows) ok([...Array(9).keys()].some(i => at(159 + i, r) === T.ONEWAY), 'a landing on row ' + r + ' of the well');
  ok(at(152, 35) === T.ONEWAY && at(155, 33) === T.ONEWAY && at(156, 31) === T.ONEWAY && at(160, 29) === T.SOLID, 'the piers: two-row steps to the transept floor'); }
/* THE CAST */
const GOB = new Set(['gobmage', 'sprig', 'shield', 'archer', 'thief', 'sapper', 'brute']);
const foes = L.ents.filter(e => e.lc || ['wight', 'haunt', 'boo', 'bonearcher', 'husk'].includes(e.t));
ok(L.ents.filter(e => GOB.has(e.t)).every(e => e.cnSkin), 'no living goblin: every goblin machine wears the church\'s skin');
ok(foes.some(e => ROLES.ranged.includes(e.cnSkin || e.t)), 'a ranged foe (the priest\'s light bolt)');
{ const roles = new Set(); for (const e of foes) for (const [r, ks] of Object.entries(ROLES)) if (ks.includes(e.cnSkin || e.t)) roles.add(r); ok(roles.size >= 3, 'three roles at least: ' + [...roles].join(', ')); }
ok(L.ents.filter(e => ['gobmage', 'acolyte', 'swornsword', 'hedgeknight', 'crossbow'].includes(e.t)).every(e => e.lc && e.room), 'every clergy and knight is tied to a room\'s light');
ok(L.ents.filter(e => e.t === 'gobmage' && e.elite).length === 1 && L.ents.find(e => e.elite).cnSkin === 'archdeacon' && L.ents.find(e => e.elite).gate, 'THE ARCHDEACON is the exam\'s elite and holds the sanctuary\'s way');
{ const A = (L.ambushes || []).find(q => q.name === 'THE SEALED VAULT'); ok(A && A.row === CHURCH.crypt - 1, 'THE SEALED VAULT stands on the crypt floor (row ' + (A && A.row) + ')');
  for (const x of [A.wallL, A.wallR]) { ok(at(x, A.row) === T.AIR && at(x, A.row + 1) === T.SOLID, 'its wall column ' + x + ' drops onto the floor'); let y = A.row; while (y > 0 && at(x, y) === T.AIR) y--; ok(A.row - y >= 4 && A.row - y <= 9, 'its wall ' + x + ' hangs under the lintel (' + (A.row - y) + ' rows)'); }
  for (const [k, x, y] of A.waves.flat()) if (y != null) ok(at(x, y) === T.AIR, 'the vault ' + k + ' stands in the room (' + x + ',' + y + ')'); }
ok(L.ents.filter(e => e.t === 'check').length === 4, 'four checkpoints (one per stretch, one before the sanctuary)');
ok(L.ents.filter(e => e.t === 'stray' && e.kind === 'candlestub').length === 5 && L.quest.n === 5, 'five candle stubs, the reliquary\'s key');
ok(L.ents.filter(e => e.t === 'silver').length <= 3, 'at most three silvers');
ok(L.ents.some(e => e.t === 'gate') && L.arena.boss === 'paladinboss' && L.arena.music === 'paladin' && L.music === 'litchurch', 'the sanctuary is THE PALADIN\'s arena; its music and the church\'s are named');
{ const au = readFileSync(new URL('../src/audio.js', import.meta.url), 'utf8'), cr = readFileSync(new URL('../audio/CREDITS.txt', import.meta.url), 'utf8'), cs = readFileSync(new URL('../src/credits.js', import.meta.url), 'utf8');
  ok(!SYNTH_BOSS.litchurch && !SYNTH_BOSS.paladin && au.includes("litchurch: './audio/litchurch.ogg'") && au.includes("paladin: './audio/paladin.ogg'"), 'the level track and his theme are FILES (art pass: no composed bed, no composed theme)');
  ok(cr.includes('"Cathedral" by Umplix, CC0') && cr.includes('"Church combat" by Centurion_of_war') && cr.includes('CC BY 4.0') && cs.includes("'Cathedral', 'Umplix', 'CC0'") && cs.includes("'Church combat', 'Centurion_of_war', 'CC-BY 4.0'") && au.includes('Umplix, CC0') && au.includes('Centurion_of_war, CC-BY'), 'both tracks are credited in CREDITS.txt, MUSIC_CREDITS and the credits page (the CC-BY one with its author, licence and link)'); }
ok((STUCK_HANDS.church || []).length >= 8 && STUCK_HANDS.church.every(sp => (sp.steps || [sp]).every(s => s.line && s.line.length <= 62)), 'the glint and the nudge: STUCK_HANDS.church');

/* ---------- THE HANDS IN A FAKE WORLD ---------- */
{ const grid = L.grid.slice(), W = L.W, Hh = L.H, cell = (x, y) => (x < 0 || y < 0 || x >= W || y >= Hh ? T.SOLID : grid[y * W + x]);
  const Lw = Object.assign({}, L, { lamps: L.lamps.map(l => ({ ...l })), darkZones: L.darkZones.map(z => ({ ...z })) });
  const hero = { x: 9 * TS + 8, y: 37 * TS, hp: 100, maxHp: 100, face: 1, dead: false, ground: true, atk: -1, vx: 0, vy: 0 }, foes = [], said = [];
  let t = 0, got = 0, atkBox = null;
  const ctx = { L: Lw, players: [hero], TS, T, sfx: {}, hero: () => hero, movers: () => [], enemies: () => foes, time: () => t, VW: () => 400, VH: () => 240,
    number: (x, y, s) => said.push(s), text() {}, burst() {}, shake() {}, overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t, box: P => ({ l: P.x - 5, r: P.x + 5, t: P.y - 14, b: P.y }), attackBox: () => atkBox,
    asPlayer: (p, fn) => fn(), hurtHero: () => {}, hurtFoe: (e, d) => { e.hp -= d; if (e.hp <= 0) e.alive = false; }, cellGet: cell, cellSet: (x, y, v) => { grid[y * W + x] = v; }, cellOpen: (x, y) => { grid[y * W + x] = T.AIR; },
    standable: (x, y) => cell(x, y) === T.SOLID || cell(x, y) === T.ONEWAY, moveFoe: (e, dx) => { e.x += dx; }, moveFoeY: () => {}, keys: () => ({}), questGot: () => got,
    spawn: (k, x, y) => { const e = { t: k, x: x * TS + 8, y: (y + 1) * TS, hp: 20, alive: true }; foes.push(e); return e; }, bossLamp() {}, bossKindled() {} };
  const H = makeLitChurchHands(ctx); H.reset(); const S = H.state(), step = (s, f) => { for (let i = 0; i < Math.round(s * 60); i++) { t += 1 / 60; if (f) f(); H.update(1 / 60); } };
  const go = (x, y) => { hero.x = x * TS + 8; hero.y = (y + 1) * TS; };
  ok(!H.lit('graveyard') && H.lit('nave') && H.lit('narthex') && H.lit('tower') && !H.lit('gallery') && !H.lit('ossuary'), 'as laid: the graveyard, the gallery and the crypt are dark; the nave, the narthex and the tower lit');
  ok(Lw.darkZones.find(z => z.room === 'gallery').dark > Lw.darkZones.find(z => z.room === 'nave').dark, 'a dark room is drawn darker than a lit one');
  /* THE FLAME */
  go(40, 36); ok(H.interact(hero) && !S.lamps.find(l => l.id === 'porch').lit && hero.lcFlame === undefined || !(hero.lcFlame > 0), 'with no flame E at a dark lamp lights nothing');
  go(9, 36); ok(H.interact(hero) && hero.lcFlame === FLAME.life, 'E at the brazier: a flame (' + FLAME.life + ' s)');
  step(1); ok(hero.lcFlame < FLAME.life && hero.lcFlame > FLAME.life - 1.1, 'the flame burns down');
  hero.hp = 90; step(0.05); ok(hero.lcFlame === 0 && said.includes('THE BLOW PUTS YOUR FLAME OUT'), 'a blow that lands puts it out');
  go(9, 36); H.interact(hero); step(FLAME.life + 0.2); ok(hero.lcFlame === 0 && said.includes('THE FLAME BURNS OUT'), 'carried too long, it burns out');
  go(9, 36); H.interact(hero); go(40, 36); ok(H.interact(hero) && S.lamps.find(l => l.id === 'porch').lit && H.lit('graveyard'), 'E at the porch lamp with the flame: lit, and the graveyard is lit');
  ok(H.door('west') && cell(44, 36) === T.AIR && cell(45, 32) === T.AIR, 'THE WEST DOOR OPENS (its bars lifted)');
  /* THE SNUFF, AND THE CLERGY BY THE LIGHT */
  const pr = { t: 'gobmage', cnSkin: 'priest', x: 54 * TS + 8, y: 37 * TS, hp: 30, alive: true, mode: 'keep', lc: { role: 'priest', room: 'narthex', home: 54 * TS, st: 'free', t: 0, hp: 30, cd: 99, lamp: null }, maxHp0: 30 }; foes.push(pr);
  H.hold(pr, 1 / 60); ok(pr.lcMul === LC.litMul, 'a priest in a lit room hits x' + LC.litMul);
  const nl = S.lamps.find(l => l.id === 'narthex'); go(51, 36); atkBox = { l: nl.x * TS, r: nl.x * TS + 16, t: (nl.y + 1) * TS - 30, b: (nl.y + 1) * TS - 8 }; hero.atk = 0; step(1 / 60); atkBox = null; hero.atk = -1;
  ok(!nl.lit && !H.lit('narthex'), 'A BLOW SNUFFS A LAMP: the narthex is dark');
  go(46, 36); H.hold(pr, 1 / 60); ok(pr.lcMul === LC.darkMul, 'in the dark he is weak: x' + LC.darkMul);
  ok(pr.lc.st === 'toLamp' && pr.lc.lamp === nl, 'you are not on him: he goes for the snuffed lamp');
  for (let i = 0; i < 400 && !nl.lit; i++) { H.hold(pr, 1 / 60); t += 1 / 60; } ok(nl.lit && S.n.relit === 1, 'and he RE-LIGHTS it (a told rite)');
  snuffAgain: { nl.lit = false; pr.lc.st = 'free'; H.hold(pr, 1 / 60); for (let i = 0; i < 200 && pr.lc.st !== 'rite'; i++) H.hold(pr, 1 / 60); pr.hp -= 5; H.hold(pr, 1 / 60); ok(pr.lc.st === 'free' && !nl.lit && S.n.ritesCut === 1, 'a blow in his rite cuts it: the lamp stays dark, and he does not go back to it at once'); }
  /* THE DEAD COME UP IN THE DARK (told first), AND THE LIGHT BURNS THEM */
  go(48, 36); const n0 = foes.length; step(LC.riseEvery - LC.riseTell + 0.05); ok(S.grates.find(g => g.room === 'narthex').glow === 1, 'a dark room\'s grate glows cold before the dead come');
  step(LC.riseTell + 0.1); const dead = foes.slice(n0).find(e => e.lcRisen === 'narthex'); ok(dead, 'THE DARK LETS THE DEAD UP through the grate');
  nl.lit = true; H.reset(); for (let i = 0; i < 120; i++) { H.hold(dead, 1 / 60); } ok(dead.hp < 20, 'in a lit room the light burns the dead');
  /* THE CHAPEL LAMPS AND THE ROOD SCREEN */
  hero.lcFlame = 5; go(176, 28); H.interact(hero); ok(S.lamps.find(l => l.id === 'chapel1').lit && S.lamps.find(l => l.id === 'rood1').lit, 'lamp one lights its sconce on the rood screen');
  hero.lcFlame = 5; go(60, 18); H.interact(hero); ok(S.lamps.find(l => l.id === 'rood2').lit && !H.door('rood'), 'lamp two lights the second; the screen still shut');
  /* THE SEAL */
  const seal = S.lamps.find(l => l.id === 'seal'); atkBox = { l: seal.x * TS, r: seal.x * TS + 16, t: (seal.y + 1) * TS - 30, b: (seal.y + 1) * TS - 8 }; hero.atk = 0; go(52, 22); step(1 / 60); atkBox = null; hero.atk = -1;
  ok(!seal.lit && H.door('hatch') && cell(49, 37) === T.AIR, 'THE SEAL IS OUT: THE CRYPT HATCH OPENS');
  /* LAMP THREE, AND THE DARK RISES */
  hero.lcFlame = 5; go(175, 53); H.interact(hero); ok(S.lamps.find(l => l.id === 'chapel3').lit && !S.lamps.find(l => l.id === 'rood3').lit && H.door('cryptgrate') && S.dark.st === 'armed', 'lamp three: the crossing\'s grate cracks, the third sconce stays dark, the dark is armed');
  go(161, 51); step(0.1); ok(S.dark.st === 'tell', 'on the well\'s first landing: THE DARK RISES (told)'); step(1.5); const y0 = S.dark.y; step(1); ok(S.dark.y < y0 - LC.darkV * 0.8, 'it climbs (' + Math.round(y0 - S.dark.y) + ' px in a second)');
  const wa = S.lamps.find(l => l.id === 'wellB'); wa.lit = true; wa.hold = LC.holdT; S.dark.y = (wa.y + 1) * TS + 4; const y1 = S.dark.y; go(161, 41); step(2); ok(Math.abs(S.dark.y - y1) < 1 && said.includes('THE LIGHT HOLDS IT BELOW'), 'a lit sconce just over it holds the dark there');
  step(LC.holdT); ok(!wa.lit && S.dark.y < y1 - 2, 'it burns down holding it, gutters out, and the dark climbs on');
  hero.lcFlame = 5; hero.y = S.dark.y + 30; step(0.05); ok(hero.lcFlame === 0, 'in the dark your flame goes out');
  go(165, 36); step(0.05); ok(S.escaped && S.dark.st === 'done' && !H.lit('nave'), 'out on the crossing: the dark stops in the crypt, and the nave goes dark behind you');
  hero.lcFlame = 5; go(177, 36); H.interact(hero); ok(S.lamps.find(l => l.id === 'rood3').lit && H.door('rood') && cell(179, 36) === T.AIR, 'the third sconce lit by hand: THE ROOD SCREEN OPENS');
  /* THE ORGAN */
  const bl = S.bellows.find(b => b.id === 'transept'); go(165, 28); atkBox = { l: bl.x * TS, r: bl.x * TS + 16, t: (bl.y + 1) * TS - 14, b: (bl.y + 1) * TS - 2 }; hero.atk = 0; step(1 / 60); atkBox = null; hero.atk = -1;
  ok(bl.air > 0, 'a blow on the bellows: the pipe breathes'); go(166, 28); hero.vy = 0; step(1 / 60); ok(hero.vy <= -LC.lift, 'its breath lifts you');
  go(109, 18); H.interact(hero); step(LC.chordTell - 0.05); ok(S.desks[0].on <= 0 && S.desks[0].tell > 0, 'the chord is told before the gust (the pipes draw breath)');
  step(0.1); hero.ground = false; hero.vx = 0; step(0.3); ok(hero.vx < -LC.gustAir * 0.8, 'then the gust carries a hero west (' + Math.round(hero.vx) + ' px/s in the air)');
  /* THE RELIQUARY */
  go(188, 40); hero.ground = true; H.interact(hero); ok(!H.door('reliquary'), 'the reliquary wants five stubs'); got = 5; H.interact(hero); ok(H.door('reliquary') && H.door('sacristy'), 'five candle stubs: the reliquary opens, and the sacristy door with it');
  ok(said.filter(s => /^[A-Z]/.test(s) && !/^\+/.test(s)).every(s => isCallout(s) || s === '!'), 'every line the hands said is one the player can see (src/hint-lines.js): ' + said.filter(s => /^[A-Z]/.test(s) && !isCallout(s) && s !== '!').slice(0, 3).join(' | ')); }

/* ---------- THE PALADIN in a fake world ---------- */
{ const A = L.arena, G = PBM.geom(A, TS), mkC = (lit = 3) => { const c = { lamps: () => G.lamps.map((l, i) => ({ id: l.id, x: l.x, lit: i < lit })), kindle: () => true, hit: () => false, number: (x, y, s) => c.said.push(s), mark: m => c.marks.push(m), sound() {}, fx() {}, shake() {}, music() {}, said: [], marks: [] }; return c; };
  const mk = () => { const S = PBM.newFight(G), e = { t: 'paladinboss', x: G.x0 + 30 * TS, y: G.floorY, hp: PBM.PB.hp, maxHp: PBM.PB.hp, face: -1, mode: 'walk', modeT: 5, open: 0, alive: true }; S.script = ['chain']; return { S, e }; };
  { const { S, e } = mk(), c = mkC(); const L0 = S.light;
    const r1 = PBM.blowOn(e, S, c, 30, e.x - 20, e.y, false, false); ok(r1.read === 'aegis' && r1.dmg === Math.round(30 * PBM.PB.aegisTake) && r1.dmg < 30 && PBM.PB.aegisTake >= 0.4 && S.light === Math.min(100, L0 + PBM.PB.light.feed), 'HIS AEGIS turns a blow from the front at his height on guard - it bites at x' + PBM.PB.aegisTake + ' only (B15: never a wall) - and it FEEDS his light');
    const r2 = PBM.blowOn(e, S, c, 30, e.x + 20, e.y, false, false); ok(r2.read === 'landed' && r2.dmg === 30 && S.light < L0 + PBM.PB.light.feed, 'from behind it lands whole, and drains his light');
    const r3 = PBM.blowOn(e, S, c, 30, e.x - 10, e.y - 30, true, false); ok(r3.read === 'landed', 'from above (a jump) it lands');
    e.mode = 'chainTell'; const r4 = PBM.blowOn(e, S, c, 30, e.x - 20, e.y, false, false); ok(r4.read === 'landed', 'in his tells (committed) the front lands too'); e.mode = 'walk';
    e.mode = 'mendTell'; PBM.blowOn(e, S, c, 30, e.x - 20, e.y, false, false); ok(e.mode === 'recover' && S.n.mendsCut === 1, 'a blow in his MEND cuts it (the light stays spent)'); }
  { const { S, e } = mk(), c = mkC(); S.light = 3; e.mode = 'walk'; const x0 = e.x; PBM.blowOn(e, S, c, 20, e.x + 20, e.y, false, false); PBM.stepPaladin(e, S, 1 / 60, [{ x: e.x + 60, y: e.y, alive: true }], c);
    ok(PBM.pbOpen(e) && e.open >= 3, 'STARVED of light he FALTERS: open ' + e.open.toFixed(2) + ' s');
    let still = true, t = 0; while (PBM.pbOpen(e)) { PBM.stepPaladin(e, S, 1 / 60, [{ x: e.x + 60, y: e.y, alive: true }], c); if (Math.abs(e.x - x0) > 0.01) still = false; t += 1 / 60; if (t > 5) break; } ok(still && t >= 2.9, 'he stands still through it (B4): ' + t.toFixed(2) + ' s');
    ok(S.ward > 0 && PBM.blowOn(e, S, c, 30, e.x + 20, e.y, false, false).read === 'ward' && S.light === PBM.PB.light.refill, 'then a told ward (B3) as his light comes back to ' + PBM.PB.light.refill);
    const ca = mkC(); const { S: S2, e: e2 } = mk(); S2.light = 30; e2.mode = 'falter'; e2.open = 3; const d1 = PBM.blowOn(e2, S2, ca, 100, e2.x - 10, e2.y, false, false).dmg; ok(d1 === Math.round(100 * PBM.PB.falterMul), 'open, a blow lands x' + PBM.PB.falterMul); }
  { const { S, e } = mk(), c = mkC(); let fal = 0, t = 0, opened = false; const h = [{ x: e.x - 30, y: e.y, alive: true, ground: true }];
    for (let i = 0; i < 60 * 60; i++) { h[0].x = e.x - (e.face || 1) * -30 * -1; h[0].x = e.x + (e.face || -1) * 30; if (i % 30 === 0) PBM.blowOn(e, S, c, 20, h[0].x, e.y, false, false); PBM.stepPaladin(e, S, 1 / 60, h, c); if (PBM.pbOpen(e)) opened = true; t += 1 / 60; }
    ok(!opened, 'hammering his aegis from the front for a minute never opens him (it feeds him)'); }
  { const { S, e } = mk(), c = mkC(); e.mode = 'bash'; const l0 = S.light; PBM.blowTurned(e, S, c, false); ok(e.mode === 'reel' && Math.abs(e.modeT - PBM.PB.reboundT) < 1e-9 && S.light === l0 - PBM.PB.light.turned, 'his BASH taken on a shield REBOUNDS him (' + PBM.PB.reboundT + ' s on his heels: the shield window) and dims him');
    const f = mk(); f.e.mode = 'chain'; PBM.blowTurned(f.e, f.S, c, false); ok(f.e.mode === 'chain', '(a hammer blow turned plainly does not: only ON THE BEAT is a riposte)'); PBM.blowTurned(f.e, f.S, c, true); ok(f.e.mode === 'reel' && f.e.modeT === PBM.PB.reelT, '(on the beat he reels ' + PBM.PB.reelT + ' s)'); }
  { const { S, e } = mk(); const l0 = S.light, rb = PBM.burnOn(e, S, 2); ok(rb.dmg === 2 && S.light === l0, 'a BURN tick on him is no blow: it burns whole and his light neither feeds nor drains (paladin tune: the pyro starved him off her fire)');
    S.ward = 1; ok(PBM.burnOn(e, S, 2).dmg === 0, '(his ward stops a burn)'); S.ward = 0; e.mode = 'falter'; e.open = 3; ok(PBM.burnOn(e, S, 2).dmg === 2 && S.light === l0, '(open, a burn pays x1 - the falter pays blows - and still leaves the light alone)'); }
  { const { S, e } = mk(), c = mkC(); const l0 = S.light; PBM.lampOut(e, S, c); ok(S.light === l0 - PBM.PB.light.lampDim, 'a snuffed sanctuary lamp dims his light at once'); }
  { const { S, e } = mk(), c1 = mkC(2), c3 = mkC(3); e.hp = e.maxHp * 0.5; S.ph = 2; S.script = ['rad']; S.step = 0; S.light = 90; e.mode = 'recover'; e.modeT = 0; PBM.stepPaladin(e, S, 1 / 60, [{ x: e.x - 40, y: e.y, alive: true }], c1);
    ok(e.mode === 'radTell' && S.marks.length === 2, 'RADIANCE: one column for each lamp that burns (two lit: two)');
    const f = mk(); f.e.hp = f.e.maxHp * 0.5; f.S.ph = 2; f.S.script = ['rad']; f.S.step = 0; f.S.light = 90; f.e.mode = 'recover'; f.e.modeT = 0; PBM.stepPaladin(f.e, f.S, 1 / 60, [{ x: f.e.x - 40, y: f.e.y, alive: true }], c3); ok(f.S.marks.length === 3, '(three lit: three)'); }
  { const moves = ph => new Set(PBM.CYCLES[ph].flat()); const p1 = moves(1), p2 = moves(2), p3 = moves(3);
    ok([...p2].filter(m => !p1.has(m)).join() === 'rad' && [...p3].filter(m => !p2.has(m)).join() === 'leap', 'one new told move a phase (B5): radiance, then judgement'); }
  for (const [mode, mv] of Object.entries(PBM.MOVES)) ok(BY_HAND['paladinboss|' + mode] === mv.mark && (!mv.answer || ANSWER['paladinboss|' + mode] === mv.answer), 'his ' + mode + ' wears ' + (mv.mark || 'no mark') + ' in src/marks.js');
  ok(OPEN_RULE.paladinboss && FULL_DAMAGE.paladinboss, 'he has an opening rule and is on FULL_DAMAGE (a duelist: no chip)'); }
console.log('ok  lit-church  ' + n + ' checks: the spur and the Paladin\'s price, the Crusader, the rule line, each verb required (the west door, the rood screen, the seal, the bellows, the broken loft, lamp three), the hands in a fake world (rooms, flame, snuff, clergy, the dead, the doors, the dark rising and its holds, the organ, the reliquary), the cast, THE PALADIN (aegis, starve, falter, ward, lamps, phases, marks)');
