// tools/lit-church.mjs - THE LIT CHURCH's own check (claude/litchurch). Node only: no page, no port, no Chrome. The built level, the pure modules, and the hands in
// a fake world (src/lit-church-hands.js takes a context; here it is the built grid, a hero and a few clergy):
//   - the road: an optional class spur off WAYMEET that opens on its three votive lamps (src/votive-hands.js), the Paladin sold for 800 coins after it; Waymeet's boss is
//     THE CRUSADER now (names only)
//   - the rule line is the code's (LEVELS row == src/lit-church.js header); the verbs' arcs teach -> test -> remix -> exam; EACH VERB REQUIRED: LIGHT (the west door,
//     the rood screen's three sconces - no way over either), SNUFF (the seal lamp holds the crypt hatch: the crypt has no other way in), THE ORGAN (the bellows are
//     the only way up to the gallery; the broken loft is wider than any jump), THE CRYPT (lamp three cracks the crossing's grate: the only way up out of it);
//     signs at the point of use say the verb
//   - the rule in the hands: rooms lit / dark by their lamps; a flame taken, carried, put out by a blow, burnt out; a lamp lit and snuffed; a priest's blows by his
//     room's light; the doors; THE DARK RISES and a lit sconce holds it; out of the well, the nave goes dark
//   - the cast: no goblin without a skin, a ranged foe, three roles, every foe tied to the light (clergy or dead); every climb on the route a two-row step
//   - THE DEACON (src/deacon.js, a fake world; claude/church2 moved the litchurch Paladin's light bar and falter to him): his pole guards HIGH (front, at his
//     height or from a jump: x0.4); low, behind, committed it lands and his light gutters; emptied he GROPES >= 2.5 s standing still (B4), then a told ward (B3);
//     hammering his guard a minute never opens him; a snuffed lamp dims him, a chandelier dropped on him hurts; he kindles; one new move (the arc); marks, OPEN_RULE
//     + FULL_DAMAGE. THE PALADIN (the hero as the boss) has his own check: tools/paladin-boss.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS, T } from '../src/level.js';
import { CHURCH, RULE, ARCS, SECTIONS, FORK } from '../src/lit-church.js';
import * as PBM from '../src/paladin-boss.js';
import * as DCM from '../src/deacon.js';
import { makeLitChurchHands, FLAME, LC } from '../src/lit-church-hands.js';
import { BY_HAND, ANSWER } from '../src/marks.js';
import { OPEN_RULE, FULL_DAMAGE } from '../src/boss-greed.js';
import { SYNTH_BOSS } from '../src/boss-music.js';
import { STUCK_HANDS } from '../src/stuck-spots.js';
import { isCallout } from '../src/hint-lines.js';
import { ROLES } from './level-quality.mjs';
const TS = 16; let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const lv = LEVELS.find(l => l.id === 'church'); ok(lv, 'church is in LEVELS');
/* STATED ASSERTION CHANGE (claude/towpathchurch, Daniel 10-08 / 10-16): the road is an optional spur off WAYMEET that opens on its three votive lamps, not a fork on THE TOWPATH's first screen behind its bronze medal */
ok(lv.needs === 'waymeet' && lv.spurOf === 'waymeet' && lv.votiveLamps === 'waymeet' && lv.classFor === 'paladin' && !lv.opensOn, 'THE LIT CHURCH is the Paladin optional class spur off WAYMEET, opened by its votive lamps (' + FORK.why + ')');
ok(FORK.now === 'waymeet' && FORK.then === 'waymeet', 'the road hook names WAYMEET (no Towpath fork)');
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
for (const v of ['light', 'snuff', 'organ', 'crypt', 'fire', 'relay']) ok(ARCS[v].teach && ARCS[v].test && ARCS[v].remix && ARCS[v].exam, 'the ' + v + ' is taught, tested, remixed and examined');
ok(SECTIONS.length === 9 && SECTIONS.some(([n]) => n === 'THE CHANTRY'), 'nine places in the cross (claude/church2, a stated change: THE CHANTRY joins - the holy fire and the relay)');
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
  ok(door('sacristy').x0 === 184 + 34 && door('sacristy').by === 'stubs', 'the crypt\'s only east way is the sacristy passage (under the chantry - the east wing stands 34 columns on, claude/church2), barred until the reliquary');
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
  ok(cr.includes('"Wendale Abbey" by Yubatake') && cr.includes('"Crypt" by Machine') && cr.includes('"Final Confrontation" by tcarisland') && cs.includes("'Wendale Abbey', 'Yubatake', 'CC-BY 4.0'") && cs.includes("'Crypt', 'Machine', 'CC-BY 3.0'") && cs.includes("'Final Confrontation', 'tcarisland', 'CC-BY 4.0'") && au.includes('"Wendale Abbey" — Yubatake') && au.includes('"Crypt" — Machine') && au.includes('"Final Confrontation" — tcarisland') && !cs.includes("'Cathedral', 'Umplix'") && !cs.includes("'Church combat'"), 'the three church tracks are credited in CREDITS.txt, MUSIC_CREDITS and the credits page (author, licence and link), and the old Cathedral / Church combat lines are gone (claude/musicchurch)');
  ok(au.includes("churchcrypt: './audio/churchcrypt.ogg'") && /TRACK_INTRO = {[^}]*litchurch: 5.0, churchcrypt: 3.0, paladin: 4.0/.test(au) && L.mini && L.mini.music === 'churchcrypt', 'the crypt track is a file, its loop points are named (TRACK_INTRO) and THE DEACON fights on it (claude/musicchurch)');
  const hands = readFileSync(new URL('../src/lit-church-hands.js', import.meta.url), 'utf8'), mn = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  ok(hands.includes("CRYPT_ROOMS = new Set(['ossuary', 'vault', 'altar', 'well'])") && hands.includes("ctx.zoneMusic(CRYPT_ROOMS.has(r.id) ? 'churchcrypt' : 'litchurch'") && mn.includes('zoneMusic: (n, own) =>') && ['ossuary', 'vault', 'altar', 'well'].every(id => L.darkZones.some(z => z.room === id)), 'the zone switch: the four crypt rooms play "Crypt", every other room "Wendale Abbey", only while the level track is up (claude/musicchurch)'); }
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
  /* (claude/church2) HOLY FIRE AND THE CHANTRY'S RELAY */
  { const tr = id => L.troughs.find(q => q.id === id); ok(L.troughs.length >= 4 && tr('nave').lamp === 'naveA' && tr('chantry1').lamp === 'chantryA' && tr('chantry2').lamp === 'chantryB' && tr('south').lamp === 'southLow', 'HOLY FIRE: the nave\'s trough (teach), the chantry\'s two (test, remix), the exam\'s - each fed by its own lamp');
    ok(H.fireAt(190 * TS + 8, 38 * TS) && H.fireAt(82 * TS + 8, 38 * TS) === !!S.lamps.find(l => l.id === 'naveA').lit, 'a trough BLAZES exactly while its lamp burns');
    go(190, 37); hero.lcFireCd = 0; step(1 / 60); ok(S.n.fireBurns === 1 && hero.y === 37 * TS && (hero.x === 184 * TS + 8 || hero.x === 196 * TS + 8), 'a hero in the blazing trough is burnt and put back on its lip (' + Math.round(hero.x / TS) + ')');
    const la = S.lamps.find(l => l.id === 'chantryA'); atkBox = { l: la.x * TS, r: la.x * TS + 16, t: (la.y + 1) * TS - 30, b: (la.y + 1) * TS - 8 }; hero.atk = 0; go(184, 36); step(1 / 60); atkBox = null; hero.atk = -1;
    ok(!la.lit && !H.fireAt(190 * TS + 8, 38 * TS) && H.fireAt(200 * TS + 8, 38 * TS), 'snuff chantry lamp one: its trough sinks to EMBERS (the second still blazes on its own lamp)');
    go(190, 37); const nb = S.n.fireBurns; step(0.5); ok(S.n.fireBurns === nb, 'embers burn nobody: walk them');
    let col = true; for (let y = 22; y <= 36; y++) if (cell(213, y) === T.AIR) col = false; ok(col && cell(213, 36) === T.PORT, 'the chantry door is the only way on (its column is wall and bars)');
    go(181, 36); H.interact(hero); ok(hero.lcFlame === 6.5 && said.includes('A DRAUGHT: THE TAPER BURNS FAST HERE'), 'in the chantry a taper burns fast: ' + hero.lcFlame + ' s (the draught, told)');
    const r1 = S.lamps.find(l => l.id === 'relay1'); hero.lcFlame = 2; go(r1.x, r1.y); hero.hp = hero.maxHp; hero.lcHp = hero.hp; H.interact(hero); ok(r1.lit && hero.lcFlame === 6.5, 'a RELAY BRAZIER lit hands you a fresh flame');
    hero.lcFlame = 3; go(210, 36); H.interact(hero); ok(H.door('chantry') && cell(213, 36) === T.AIR, 'the door\'s lamp lit: THE CHANTRY DOOR OPENS');
    hero.lcFlame = 0; }
  /* THE RELIQUARY */
  go(188 + 34, 40); hero.ground = true; H.interact(hero); ok(!H.door('reliquary'), 'the reliquary wants five stubs'); got = 5; H.interact(hero); ok(H.door('reliquary') && H.door('sacristy'), 'five candle stubs: the reliquary opens, and the sacristy door with it');
  ok(said.filter(s => /^[A-Z]/.test(s) && !/^\+/.test(s)).every(s => isCallout(s) || s === '!'), 'every line the hands said is one the player can see (src/hint-lines.js): ' + said.filter(s => /^[A-Z]/.test(s) && !isCallout(s) && s !== '!').slice(0, 3).join(' | ')); }

/* ---------- THE DEACON in a fake world (claude/church2: the litchurch Paladin's light bar and falter moved here; THE PALADIN's own check is tools/paladin-boss.mjs) ---------- */
{ const M = L.mini; ok(M && M.boss === 'deacon' && L.ents.some(e => e.t === 'deacon') && L.doors.find(d => d.id === 'parclose' && d.by === 'chapel3' && d.x0 === 160), 'THE DEACON is the crossing\'s mini, behind the parclose until lamp three: you come into his room up the crypt well');
  const dl = L.lamps.filter(l => l.deacon); ok(dl.length === 4 && dl.filter(l => l.hang).length === 2 && dl.every(l => l.x * TS >= M.x0 && (l.x + 1) * TS <= M.x1), 'his four lamps stand in his room: two sconces, two chandeliers on chains');
  ok(L.doors.find(d => d.id === 'cryptgrate').oneway, 'the cracked crypt grate swings up as an iron grate (one-way): his floor is whole, and you come up through it');
  const G = { x0: M.x0, x1: M.x1, floorY: M.floor, roofY: M.y0 };
  const mkC = (lit = 4) => { const c = { said: [], marks: [], kindled: [] }; c.L = [0, 1, 2, 3].map(i => ({ id: 'd' + i, x: G.x0 + 40 + i * 70, lit: i < lit, hang: i % 2 === 1 }));
    return Object.assign(c, { lamps: () => c.L, kindle: id => { const l = c.L.find(q => q.id === id); if (l && !l.lit) { l.lit = true; c.kindled.push(id); return true; } return false; }, hit: () => false, haul() {}, number: (x, y, s) => c.said.push(s), mark: m => c.marks.push(m), sound() {}, fx() {}, shake() {} }); };
  const mk = () => { const S = DCM.newFight(G), e = { t: 'deacon', x: G.x0 + 150, y: G.floorY, hp: DCM.DC.hp, maxHp: DCM.DC.hp, face: -1, mode: 'walk', modeT: 5, open: 0, alive: true }; S.script = ['sweep']; return { S, e }; };
  { const { S, e } = mk(), c = mkC(); const L0 = S.light;
    const g1 = DCM.blowOn(e, S, c, 30, e.x - 20, e.y, false, false, false); ok(g1.read === 'guard' && g1.dmg === Math.round(30 * DCM.DC.guardTake) && DCM.DC.guardTake >= 0.4 && S.light === L0, 'his pole GUARDS HIGH: a blow from his front at his height is turned at x' + DCM.DC.guardTake + ' (B15)');
    ok(DCM.blowOn(e, S, c, 30, e.x - 20, e.y - 30, true, false, false).read === 'guard', '(and from a jump over him: the pole is high)');
    const g2 = DCM.blowOn(e, S, c, 30, e.x - 20, e.y, false, false, true); ok(g2.read === 'landed' && g2.dmg === 30 && S.light < L0, 'a LOW blow (the sweep) lands whole and his light gutters');
    ok(DCM.blowOn(e, S, c, 30, e.x + 20, e.y, false, false, false).read === 'landed', 'from behind it lands');
    for (const m of ['sweepTell', 'hookTell', 'arcTell', 'kindleTell', 'reel']) { e.mode = m; ok(DCM.blowOn(e, S, c, 30, e.x - 20, e.y, false, false, false).read === 'landed', 'committed (' + m + ') the front lands too'); }
    e.mode = 'kindleTell'; DCM.blowOn(e, S, c, 30, e.x - 20, e.y, false, false, false); ok(S.n.kindlesCut >= 1, 'a blow in his KINDLE cuts it'); }
  { const { S, e } = mk(), c = mkC(0); S.light = 5; e.mode = 'walk'; const x0 = e.x; DCM.blowOn(e, S, c, 20, e.x + 20, e.y, false, false, false); DCM.stepDeacon(e, S, 1 / 60, [{ x: e.x + 60, y: e.y, alive: true }], c);
    ok(DCM.dcOpen(e) && e.open >= 2.5, 'his light gone, he GROPES IN THE DARK: open ' + e.open.toFixed(2) + ' s');
    let still = true, t = 0; while (DCM.dcOpen(e)) { DCM.stepDeacon(e, S, 1 / 60, [{ x: e.x + 60, y: e.y, alive: true }], c); if (Math.abs(e.x - x0) > 0.01) still = false; t += 1 / 60; if (t > 5) break; } ok(still && t >= 2.5, 'he stands still through it (B4): ' + t.toFixed(2) + ' s');
    ok(S.ward > 0 && DCM.blowOn(e, S, c, 30, e.x + 20, e.y, false, false, false).read === 'ward' && S.light === DCM.DC.light.refill, 'then a told ward (B3) as he finds his flame again (' + DCM.DC.light.refill + ')');
    const o = mk(); o.e.mode = 'grope'; o.e.open = 3; ok(DCM.blowOn(o.e, o.S, c, 100, o.e.x - 10, o.e.y, false, false, false).dmg === Math.round(100 * DCM.DC.gropeMul) && DCM.DC.gropeMul >= 1.5 && DCM.DC.gropeMul <= 2, 'groping, a blow lands x' + DCM.DC.gropeMul); }
  { const { S, e } = mk(), c = mkC(); let opened = false; const h = [{ x: e.x - 30, y: e.y, alive: true, ground: true }];
    for (let i = 0; i < 60 * 60; i++) { h[0].x = e.x + (e.face || -1) * 30; if (i % 30 === 0 && (e.mode === 'walk' || e.mode === 'recover')) DCM.blowOn(e, S, c, 20, h[0].x, e.y, false, false, false); DCM.stepDeacon(e, S, 1 / 60, h, c); if (DCM.dcOpen(e)) opened = true; }
    ok(!opened, 'hammering his high guard from the front for a minute never opens him: the angle (low, behind) or his lamps do'); }
  { const { S, e } = mk(), c = mkC(); const l0 = S.light; DCM.lampOut(e, S, c, { id: 'd0' }); ok(S.light === l0 - DCM.DC.light.lampDim, 'a snuffed lamp of his: his light gutters at once');
    const f = mk(); const d = DCM.lampOut(f.e, f.S, c, { id: 'd1', dropped: true, under: true }); ok(d > 0 && f.e.mode === 'reel', 'a chandelier brought down ON him: it hurts him (' + d + ') and he reels'); }
  { const { S, e } = mk(), c = mkC(3); S.kindleCd = 0; e.mode = 'recover'; e.modeT = 0; const h = [{ x: e.x - 100, y: e.y, alive: true }]; DCM.stepDeacon(e, S, 1 / 60, h, c);
    ok(e.mode === 'kindleWalk', 'a lamp of his dark: he goes to kindle it'); let t = 0; while (e.mode !== 'recover' && t < 8) { DCM.stepDeacon(e, S, 1 / 60, h, c); t += 1 / 60; } ok(c.kindled.length === 1, 'and lights it again (told: ' + c.said.filter(s => /KINDLES/.test(s)).join() + ')'); }
  { const moves = ph => new Set(DCM.CYCLES[ph].flat()); ok([...moves(2)].filter(m => !moves(1).has(m)).join() === 'arc', 'one new told move in his second half (B5): THE FLAME ARC'); }
  for (const [mode, mv] of Object.entries(DCM.MOVES)) ok(BY_HAND['deacon|' + mode] === mv.mark && (!mv.answer || ANSWER['deacon|' + mode] === mv.answer), 'his ' + mode + ' wears ' + (mv.mark || 'no mark') + ' in src/marks.js');
  ok(OPEN_RULE.deacon && FULL_DAMAGE.deacon, 'he has an opening rule and is on FULL_DAMAGE (a duelist: no chip)'); }
ok(L.arena.boss === 'paladinboss' && PBM.PAL_POSES.length > 20, 'THE PALADIN keeps the sanctuary (his own check: tools/paladin-boss.mjs)');
console.log('ok  lit-church  ' + n + ' checks: the spur and the Paladin\'s price, the Crusader, the rule line, each verb required (the west door, the rood screen, the seal, the bellows, the broken loft, lamp three), the hands in a fake world (rooms, flame, snuff, clergy, the dead, the doors, the dark rising), THE DEACON (guards high, gropes in the dark, his lamps, his kindling, the arc)');
