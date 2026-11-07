// tools/first-cards.mjs - NODE-ONLY check of src/first-cards.js (claude/onboard2, Daniel 11-06 DEMO ONBOARDING items 2 + 5). No browser.
//   COVERAGE  every boss of the 12-level demo slice has a hint, and every hint key is a real arena boss id in the level code
//   TRUE      each hint's key claims are anchored to words that really are in the boss's own code (a hint cannot drift from the fight)
//   FIT       every card, in the longest key words (touch / pad), wraps to <= MAX_LINES at 6 px a char inside the card width (textfit still owed in a browser)
//   LOGIC     boss deaths count per boss, the hint is due at BOSS_HINT_AT, once per save, never for a beaten boss or an unlisted one; markTold sticks
// usage: node tools/first-cards.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import * as FC from '../src/first-cards.js';
import { SECOND_SLOT_LEVEL } from '../src/progression.js';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..'), rd = f => fs.readFileSync(path.join(root, 'src', f), 'utf8');

/* COVERAGE: the demo slice's boss ids and the file whose arena names each */
const DEMO_BOSS = { oldtusker: 'lumber-trail.js', hornetqueen: 'hornets-nest.js', frog: 'level.js', bogtroll: 'fen-road.js', chief: 'level.js', mother: 'sporewood.js', huntmaster: 'rootway.js', grandmother: 'underleaf3.js', batteringbeast: 'palisade-wood.js', king: 'kingswood.js', pyromancer: 'burning-village.js' };
for (const [id, file] of Object.entries(DEMO_BOSS)) { assert.ok(FC.hasHint(id), 'no hint for the demo boss ' + id); assert.ok(new RegExp("boss: *'" + id + "'").test(rd(file)), id + ' is not an arena boss id in ' + file); }
for (const id of Object.keys(FC.BOSS_HINTS)) assert.ok(id in DEMO_BOSS, 'a hint for ' + id + ', which is not a demo boss');
assert.ok(!FC.hasHint('toString') && !FC.hasHint('abbot'), 'prototype keys / non-demo bosses must not match');

/* TRUE: each hint's claims, anchored in the boss's own code (file, tokens that must appear) */
const CLAIMS = { oldtusker: ['old-tusker.js', ['plunge', 'four strokes', 'RAMS']], hornetqueen: ['hornet-queen.js', ['STUCK', 'WINDED', 'smoke']], frog: ['frog-king.js', ['royal', 'yellow', 'DAZED', 'WINDED']],
  bogtroll: ['bog-troll.js', ['ROTTEN', 'STUCK', 'DRAG']], chief: ['main.js', ['club', 'rack', 'parry the arrows', 'THREE BLOWS', 'SPENT: CUT HIM']], mother: ['mother-cap2.js', ['SEED CAPS', 'KNOT', 'SPRING SPORE']],
  huntmaster: ['huntmaster.js', ['GOLD ARROW', 'SPORE POD', 'STAGGERS LONG']], grandmother: ['potion-hands.js', ['GREEN BRAMBLE', 'BLUE BUBBLES', 'RED CAULDRON']], batteringbeast: ['battering-beast.js', ['SCAFFOLD', 'PROP', 'STUCK']],
  king: ['gorm-king.js', ['cage', 'unblockable', 'LOG ROLL', 'BELLY QUAKE']], pyromancer: ['pyro-boss.js', ['WATER', 'CANCELS', 'SPENT']] };
for (const [id, [file, toks]] of Object.entries(CLAIMS)) { const src = rd(file).toLowerCase(); for (const t of toks) assert.ok(src.includes(t.toLowerCase()), id + ': "' + t + '" is not in ' + file); }

/* FIT: 6 px a char, the card is min(VW-16, 280) wide with 7 px a side */
const W = 280 - 14, wrap = (s, w) => { const out = []; let cur = ''; for (const word of s.split(' ')) { const t = cur ? cur + ' ' + word : word; if (t.length * 6 > w && cur) { out.push(cur); cur = word; } else cur = t; } if (cur) out.push(cur); return out; };
const KEYSETS = [{ flask: 'U', skill1: 'F', skill2: 'G', menu: 'Q' }, { flask: 'THE FLASK BUTTON', skill1: 'THE SKILL BUTTON', skill2: 'THE SECOND SKILL BUTTON', menu: 'THE SKILLS BUTTON' }, { flask: 'RIGHT STICK', skill1: 'RIGHT BUMPER', skill2: 'LEFT BUMPER', menu: 'SELECT' }];
let widest = 0, most = 0;
for (const k of KEYSETS) for (const id of [...Object.keys(FC.EXPLAIN), ...Object.keys(FC.BOSS_HINTS).map(FC.hintId)]) {
  const c = FC.cardOf(id, k); assert.ok(c && c.title && c.paras.length, id + ': no card');
  const lines = c.paras.flatMap(p => wrap(p, W)); most = Math.max(most, lines.length); assert.ok(lines.length <= FC.MAX_LINES, id + ': ' + lines.length + ' lines > ' + FC.MAX_LINES);
  for (const l of lines) { widest = Math.max(widest, l.length * 6); assert.ok(l.length * 6 <= W, id + ': a line is too wide: ' + l); }
  assert.ok(c.title.length * 8 <= 280 - 16, id + ': title too wide: ' + c.title);
  for (const p of c.paras) assert.ok(p === p.toUpperCase(), id + ': lower case in the card (the house style is capitals): ' + p);
  assert.ok(!/[—–]/.test(c.paras.join('')), id + ': a dash glyph');
}
assert.ok(38 + FC.MAX_LINES * 8 + 4 <= 180 - 8, 'the tallest card does not fit the 180 px screen');
const lv = FC.cardOf('levelup', KEYSETS[0]).paras.join(' '); assert.ok(lv.includes('VIGOR') && lv.includes('ENDURANCE') && lv.includes('MIGHT'), 'the level card names its three picks (read from CARD)');
const sk = FC.cardOf('skills', KEYSETS[0]).paras.join(' '); assert.ok(sk.includes('LEVEL ' + SECOND_SLOT_LEVEL) && /TWO SLOTS IS THE MOST/.test(sk) && /ONE SLOT/.test(sk), 'the skills card says 1 default, the 2nd at the slot level, max 2');
assert.equal(SECOND_SLOT_LEVEL, 30, 'Daniel 11-01: the second skill slot opens at level 30');

/* LOGIC */
{ const P = {}; assert.equal(FC.noteBossDeath(P, 'frog', false), false); assert.equal(FC.noteBossDeath(P, 'frog', false), false); assert.equal(FC.noteBossDeath(P, 'frog', false), true, 'due at BOSS_HINT_AT (' + FC.BOSS_HINT_AT + ')');
  FC.markTold(P, FC.hintId('frog')); assert.equal(FC.noteBossDeath(P, 'frog', false), false, 'once per save'); assert.equal(P.bossDeaths.frog, 4);
  assert.equal(FC.noteBossDeath(P, 'chief', false), false, 'another boss counts on his own'); assert.equal(P.bossDeaths.chief, 1);
  const Q = {}; for (let i = 0; i < 5; i++) assert.equal(FC.noteBossDeath(Q, 'king', true), false, 'a beaten boss never owes a hint'); assert.equal(Q.bossDeaths, undefined);
  assert.equal(FC.noteBossDeath({}, 'abbot', false), false, 'a boss with no hint (not the demo) owes none');
  assert.equal(FC.told(null, 'x'), false); assert.equal(FC.told({}, 'x'), false); const R = {}; FC.markTold(R, 'flask'); assert.equal(FC.told(R, 'flask'), true);
  assert.equal(FC.cardOf('nope', KEYSETS[0]), null); assert.equal(FC.cardOf('hint:nope', KEYSETS[0]), null); }
/* the save keeps the two new keys (an unknown PROG key rides through migrateProgress like innTold / drinkTold) */
{ const { migrateProgress } = await import('../src/progression.js'); const base = migrateProgress(null).progress; base.firstCards = { flask: 1 }; base.bossDeaths = { frog: 2 };
  const again = migrateProgress(JSON.stringify(base)).progress; assert.deepEqual(again.firstCards, { flask: 1 }, 'firstCards survives a reload'); assert.deepEqual(again.bossDeaths, { frog: 2 }, 'bossDeaths survives a reload'); }
console.log('first-cards ok: ' + Object.keys(FC.BOSS_HINTS).length + ' boss hints + ' + Object.keys(FC.EXPLAIN).length + ' explainers; widest line ' + widest + ' px of ' + W + ', most lines ' + most + ' of ' + FC.MAX_LINES);
