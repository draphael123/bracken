// tools/gob-priest.mjs — THE GOBLIN PRIEST HAS AN ANSWER AT EVERY RANGE, AND EVERY ONE OF THEM IS TOLD.
//
// Daniel, 2026-09-25: "make goblin priests a real enemy of this level with a proper small kit ... each move told". It had one
// move, the rite, and "alone it is a free kill". A3 in as many words: a cooldown never initialised does not exist, so every move
// is FORCED here, out of src/main.js, in a room with a flat floor, the way tools/temperer.mjs forces the Temperer:
//   the rite       a hurt goblin near it and it lifts the censer (no mark: it strikes nobody), and at the end the goblin is
//                  mended and blessed; a blow on the windup breaks it and mends nobody
//   the censer     across the room: a yellow !, then a pot in a lob that comes down where you stood - a shield turns it
//   the bell       in its face: a yellow !, then the bell rung into you and a shove - a shield turns it - and it backs off
//   first things   a goblin to mend AND you in its face: the rite still comes first (E2 - the thing it is about tops its chain)
// and off the page: each move has its own pose (ten frames, hurt last), its own sound, a row in src/marks.js that agrees with the
// mark it calls, a place in windingUp() by name, and a bestiary row that says what it does now. Then the BUILT Monastery: at least
// six priests, and not one of them without a flock to bless (a rite with nobody in the smoke teaches nothing).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { LEVELS, T } from '../src/level.js';
import { MARK } from '../src/marks.js';

const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const audio = readFileSync(new URL('../src/audio.js', import.meta.url), 'utf8');
const cut = (from, to) => { const a = src.indexOf(from), b = src.indexOf(to, a + 1); assert.ok(a > 0 && b > a, 'cannot find ' + from.slice(0, 40) + ' in src/main.js'); return src.slice(a, b); };

// ---- A3: every cooldown it owns is a NUMBER the day it is spawned ----
const spawn = cut("case 'gobpriest': enemies.push(", 'break;');
for (const k of ['cd', 'censerCd', 'bellCd']) assert.match(spawn, new RegExp('\\b' + k + ':\\s*[^,}]'), k + ' is not initialised in its spawn case - A3, and that move would simply never fire');

// ---- the priest, lifted out and run ----
const code = cut('const PRIEST = {', '/* THE GOBLIN MAGE');
const priestConst = code.slice(0, code.indexOf('};') + 2);
const arc = cut('const DRUNK_G = 440;', 'function drunkThrow(');
const surf = cut('const surfaceUnder = ', '\n');
const body = cut('function priestThrow(e) {', '/* THE GOBLIN MAGE');
const FLOOR = 20, hits = [], said = [], sounds = [];
const ctx = {
  Math, TS: 16, T, LH: 40, DMG: { priestCenser: 10, priestBell: 7 },
  P: { x: 0, y: FLOOR * 16, vx: 0, dead: false }, enemies: [], seeds: [], parts: [],
  ONE_HIT: new Set(['rook', 'wasp', 'harpy', 'bat', 'kite', 'drone', 'crow']), fullHp: e => e.maxHp || e.hp0 || e.hp,
  SFX: new Proxy({}, { get: (_, k) => () => sounds.push(k) }),
  number: (x, y, word, col) => said.push({ word, col }), ringAt: () => {}, burst: () => {},
  tileAt: (x, y) => y >= FLOOR ? T.SOLID : T.AIR, isSolid: (x, y) => y >= FLOOR, isOneWay: () => false,
  damagePlayer: (x, dmg, o = {}) => { hits.push({ dmg, unblockable: !!o.unblockable, blow: o.blow || null }); return 'hit'; },
  moveBody: (e, dx) => { e.x += dx; return { ground: true, hitX: false }; },
};
vm.createContext(ctx);
vm.runInContext(priestConst + '\n' + arc + '\n' + surf + '\n' + body + '\n__P = PRIEST;', ctx);
const PRIEST = ctx.__P;
for (const k of ['censerTell', 'censerCd', 'censerMin', 'censerMax', 'bellTell', 'bellCd', 'bellR']) assert.ok(PRIEST[k] > 0, 'PRIEST.' + k + ' is not a number: the kit has no clock');

const priest = (o = {}) => Object.assign({ t: 'gobpriest', x: 400, y: FLOOR * 16, vx: 0, vy: 0, w: 10, h: 16, face: -1, hp: 14, alive: true, speed: 34,
  mode: 'keep', modeT: 0, anim: 0, stagger: 0, onGround: true, cd: 99, censerCd: 99, bellCd: 99 }, o);
const goblin = (x, o = {}) => Object.assign({ t: 'rockgoblin', x, y: FLOOR * 16, w: 12, h: 14, hp: 20, alive: true }, o);
const run = (e, secs, stop) => { for (let i = 0; i < Math.round(secs * 60); i++) { ctx.updateGobPriest(e, 1 / 60); if (stop && stop(e)) return true; } return false; };
const reset = px => { ctx.P.x = px; ctx.P.vx = 0; ctx.enemies.length = 0; ctx.seeds.length = 0; hits.length = 0; said.length = 0; sounds.length = 0; };
const SOFT = '#ffd36b';

// 1. THE RITE: a hurt goblin beside it, and it goes up; the goblin comes out mended and blessed
reset(560); { const e = priest({ cd: 0 }), g = goblin(430, { hp: 5, hp0: 20 }); ctx.enemies.push(e, g);
  assert.ok(run(e, 1, x => x.mode === 'riteTell'), 'a hurt goblin beside it and the priest never lifted the censer');
  assert.ok(!said.some(s => s.word === '!' || s.word === '!!'), 'THE RITE wears a guard mark: it strikes nobody, so it must say THE RITE and nothing a shield could answer');
  assert.ok(sounds.includes('priestRite'), 'the rite is silent: a windup you cannot hear off screen (A2)');
  assert.ok(run(e, PRIEST.tell + 0.2, x => x.mode !== 'riteTell'), 'the rite never ended');
  assert.ok(g.hp > 5 && g.blessT > 0, 'the rite ended and the goblin in the smoke was neither mended nor blessed'); }
// 1b. ANY BLOW BREAKS IT, and nobody is mended
reset(560); { const e = priest({ cd: 0 }), g = goblin(430, { hp: 5, hp0: 20 }); ctx.enemies.push(e, g);
  run(e, 1, x => x.mode === 'riteTell'); e.stagger = 0.3; run(e, 0.1);
  assert.equal(e.mode, 'broken', 'a blow on the rite did not break it'); run(e, PRIEST.tell + 0.5);
  assert.ok(g.hp === 5 && !(g.blessT > 0), 'the rite was broken and still mended its goblin'); }

// 2. THE CENSER: you across the room, a yellow !, and a pot in the air that comes down where you stood - on a shield's terms
reset(400 - 120); { const e = priest({ censerCd: 0 }); ctx.enemies.push(e);
  assert.ok(run(e, 1, x => x.mode === 'censerTell'), 'you were across the room and it never swung the censer');
  const mk = said[said.length - 1]; assert.ok(mk && mk.word === '!' && mk.col === SOFT, 'THE CENSER is not called with a yellow !: ' + JSON.stringify(mk));
  assert.ok(sounds.includes('priestCenserTell'), 'the censer swings back in silence (A2)');
  assert.ok(Math.abs(e.aimX - ctx.P.x) < 1 && e.aimY === FLOOR * 16, 'it did not aim where you stood, on your floor');
  assert.ok(run(e, PRIEST.censerTell + 0.2, x => ctx.seeds.length > 0), 'the swing ended and nothing was thrown');
  const s = ctx.seeds[0]; assert.ok(s.drunkLob && s.kind === 'censer' && s.dmg === 10 && !s.unblockable, 'the censer is not a blockable lob that lands on its ring: ' + JSON.stringify({ lob: s.drunkLob, kind: s.kind, dmg: s.dmg, unblockable: s.unblockable }));
  let t = 0, x = s.x, y = s.y, vy = s.vy; while (t < 3 && !(vy > 0 && y >= s.ty - 2)) { vy += s.g / 60; x += s.vx / 60; y += vy / 60; t += 1 / 60; }
  assert.ok(Math.abs(x - s.tx) < 12, 'the censer comes down ' + Math.round(x - s.tx) + ' px from where you stood, not on its ring'); }
// 2b. a blow on the swing throws it off, and nothing flies
reset(400 - 120); { const e = priest({ censerCd: 0 }); ctx.enemies.push(e); run(e, 1, x => x.mode === 'censerTell'); e.stagger = 0.3; run(e, 0.1); e.stagger = 0; run(e, PRIEST.censerTell);
  assert.equal(ctx.seeds.length, 0, 'struck on its swing, it threw the censer anyway'); }
// 2c. too near and too far, it does not throw
for (const dx of [20, 260]) { reset(400 - dx); const e = priest({ censerCd: 0 }); ctx.enemies.push(e); assert.ok(!run(e, 1.5, x => x.mode === 'censerTell'), 'it threw the censer at ' + dx + ' px, outside its reach'); }

// 3. THE BELL: in its face, a yellow !, and a shove a shield turns; then it gives ground
reset(400 - 16); { const e = priest({ bellCd: 0 }); ctx.enemies.push(e);
  assert.ok(run(e, 1, x => x.mode === 'bellTell'), 'you stood in its face and it never raised the bell');
  const mk = said[said.length - 1]; assert.ok(mk && mk.word === '!' && mk.col === SOFT, 'THE BELL is not called with a yellow !: ' + JSON.stringify(mk));
  assert.ok(sounds.includes('priestBellTell'), 'the bell goes up in silence (A2)');
  assert.ok(run(e, PRIEST.bellTell + 0.2, () => hits.length > 0), 'the bell was rung and hit nothing');
  assert.ok(!hits[0].unblockable && hits[0].dmg === 7, 'THE BELL is not a blow a shield turns: ' + JSON.stringify(hits[0]));
  assert.ok(Math.abs(ctx.P.vx) > 0, 'rung into you, the bell did not shove you back');
  const x0 = e.x; run(e, 1.2); assert.ok(Math.abs(e.x - ctx.P.x) > Math.abs(x0 - ctx.P.x), 'rung, it did not give ground'); }
// 3b. a blow on the bell's windup throws it off
reset(400 - 16); { const e = priest({ bellCd: 0 }); ctx.enemies.push(e); run(e, 1, x => x.mode === 'bellTell'); e.stagger = 0.3; run(e, 0.1); e.stagger = 0; run(e, PRIEST.bellTell);
  assert.equal(hits.length, 0, 'struck as it raised the bell, it rang it anyway'); }

// 4. E2: a goblin to mend AND you in its face - the rite comes first, because the rite is what it is for
reset(400 - 16); { const e = priest({ cd: 0, bellCd: 0, censerCd: 0 }), g = goblin(460, { hp: 5, hp0: 20 }); ctx.enemies.push(e, g);
  run(e, 0.5, x => x.mode !== 'keep'); assert.equal(e.mode, 'riteTell', 'with a goblin to mend and you in its face it went for ' + e.mode + ': the rite has to top its chain'); }

// ---- off the page ----
for (const m of ['censerTell', 'bellTell']) assert.equal(MARK['gobpriest|' + m], '!', 'src/marks.js has no yellow ! for gobpriest|' + m + ': run node tools/tells.mjs --write');
assert.equal(MARK['gobpriest|riteTell'], '', 'the rite must wear no mark in src/marks.js');
const wind = src.slice(src.indexOf('const windingUp = e =>'), src.indexOf('\n', src.indexOf('const windingUp = e =>')));
for (const m of ['riteTell', 'censerTell', 'bellTell']) assert.ok(new RegExp("e\\.t === 'gobpriest' && \\([^)]*'" + m + "'").test(wind), 'windingUp() does not name gobpriest|' + m + ' (A2)');
for (const k of ['priestRite', 'priestCenserTell', 'priestCenser', 'priestBellTell', 'priestBell']) assert.match(audio, new RegExp('\\b' + k + '\\(\\) \\{'), 'no sound SFX.' + k + ' in src/audio.js');
const frames = src.slice(src.indexOf("else if (e.t === 'gobpriest') frame ="), src.indexOf('\n', src.indexOf("else if (e.t === 'gobpriest') frame =")));
for (const [m, f] of [['censerTell', 5], ['censer', 6], ['bellTell', 7], ['bell', 8], ['broken', 9]]) assert.ok(frames.includes("e.mode === '" + m + "' ? " + f), 'the ' + m + ' pose is not frame ' + f);
const art = readFileSync(new URL('../src/redraw/monastery.js', import.meta.url), 'utf8');
assert.match(art, /return pack\(\[0, 1, 2, 3, 4, 5, 6, 7, 8, 9\]\.map\(frame\), 8, 23/, 'the priest is not baked in ten frames with the hurt pose last');
const row = src.slice(src.indexOf("{ t: 'gobpriest', name: 'GOBLIN PRIEST'"), src.indexOf('\n', src.indexOf("{ t: 'gobpriest', name: 'GOBLIN PRIEST'")));
assert.ok(/censer/i.test(row) && /bell/i.test(row) && /rite/i.test(row), 'the bestiary row does not say what the priest does: the rite, the censer and the bell');

// ---- and where they stand in the Monastery: at least six, and never without a flock ----
const L = LEVELS.find(l => l.id === 'spire').build();
const mine = L.ents.filter(e => e.t === 'gobpriest');
assert.ok(mine.length >= 6, 'only ' + mine.length + ' goblin priests in the Monastery: its rite is a lesson, and a lesson wants saying more than twice');
const NOT_FLOCK = new Set([...ctx.ONE_HIT, 'gobpriest', 'golem', 'abbot', 'deco', 'coin', 'sign', 'check', 'npc', 'vent', 'stal', 'mend', 'silver', 'stray', 'pwheel', 'tbell', 'gate', 'brazier']);
for (const p of mine) {
  const flock = L.ents.filter(q => !NOT_FLOCK.has(q.t) && q !== p && Math.abs(q.x - p.x) * 16 < PRIEST.reach && Math.abs(q.y - p.y) * 16 < 60);
  assert.ok(flock.length, 'the goblin priest at ' + p.x + ',' + p.y + ' has nobody within its rite\'s reach to bless: a rite over an empty floor teaches nothing');
}
console.log('ok  gob-priest     the rite (quiet, broken by any blow), the censer (!, a lob onto your ring) and the bell (!, a shove, then it gives ground) '
  + 'all fire when forced, the rite tops the chain; ten poses, five sounds, marks and windingUp agree; ' + mine.length + ' priests in the Monastery, each with a flock.');
