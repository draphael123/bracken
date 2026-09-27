// tools/levelling.mjs — THE LEVELLING SYSTEM, THE SAVE SIDE (Daniel, 2026-09-24; docs/briefs/hero-kits.md 1b). Node only.
//   1. PASSIVES COME WITH LEVELS, ABILITIES ARE BOUGHT: no passive can be bought or slotted; every ability still can; a passive
//      is on from its catalog level with nothing owned and nothing equipped, and off below it.
//   2. THE REFUND IS EXACT: a real version-1 save (tools/fixtures/progression-v1-passives.json, written by the version-1 code: two
//      passives came across from the old trees, four were bought) gets back the price of the four it BOUGHT and nothing for the
//      two the trees gave it (those points were paid back at 25 a point in version 1). It keeps all six, its slots lose them, and
//      a second migration changes nothing.
//   3. CATCH-UP XP (src/xp.js xpCatchUp) pays x3 below the curve, stops AT the curve, and pays x1 at or above it.
// The page side (tal(), the hero menu, the heal, the XP in a real wood) is tools/levelling-runtime.mjs.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SKILLS, HERO_IDS, PROGRESSION_VERSION, migrateProgress, loadProgress, importProgress, exportProgress, buySkill, equipSkill, equipped, skillFor } from '../src/progression.js';
import * as PR from '../src/progression.js';
import * as XP from '../src/xp.js';
import { xpFloor } from '../src/xp.js';
import { LEVELS } from '../src/level.js';
import { depthsOf } from './campaign-order.mjs';
const memory = () => { const m = new Map(); return { getItem: k => m.has(k) ? m.get(k) : null, setItem: (k, v) => m.set(k, v), removeItem: k => m.delete(k), m }; };
const fails = [];
const check = (name, fn) => { try { fn(); } catch (e) { fails.push(name + ': ' + String(e && e.message || e).replace(/\s+/g, ' ').slice(0, 300)); } };

/* 1. SOLD AND SLOTTED */
check('passives are not sold', () => {
  for (const n of SKILLS.filter(n => !n.active)) { const p = migrateProgress(null).progress; p.coins = 99999;
    const err = buySkill(p, n.hero, n.id, 99); assert(err, n.hero + '/' + n.id + ' was sold'); assert.equal(p.coins, 99999, n.id + ' took coins'); assert(!p.skillOwned[n.hero]?.[n.id]); } });
check('abilities are still sold, at their level', () => {
  for (const n of SKILLS.filter(n => n.active)) { const p = migrateProgress(null).progress; p.coins = 99999;
    assert.equal(buySkill(p, n.hero, n.id, n.level), null, n.id); assert.equal(p.coins, 99999 - n.price); } });
check('passives are not slotted', () => {
  for (const n of SKILLS.filter(n => !n.active)) { const p = migrateProgress(null).progress; p.skillOwned[n.hero] = { [n.id]: true };
    assert(equipSkill(p, n.hero, n.id, 0, 99, true), n.id + ' went into a slot'); assert(!(p.loadouts[n.hero] || []).includes(n.id)); } });
check('a passive is on from its level, owned or not', () => {
  assert.equal(typeof PR.passiveOn, 'function', 'no passiveOn in src/progression.js');
  const p = migrateProgress(null).progress;
  for (const n of SKILLS.filter(n => !n.active)) { assert.equal(PR.passiveOn(p, n.hero, n.id, n.level), true, n.id + ' off at its level');
    assert.equal(PR.passiveOn(p, n.hero, n.id, n.level - 1), false, n.id + ' on below its level'); }
  for (const n of SKILLS.filter(n => n.active)) assert.equal(PR.passiveOn(p, n.hero, n.id, 99), false, n.id + ' is an ability'); });
check('a slot never reads a passive', () => { const n = SKILLS.find(n => !n.active); const p = { loadouts: { [n.hero]: [n.id] } };
  assert.equal(equipped(p, n.hero, 99)[0], null); });

/* 1b. THE LADDER (the integrator for Daniel, 2026-09-24: "a steady reward"): every hero's passives arrive ONE A LEVEL from 1 to 24 -
   never two at the same level - in the old tier order (the price a passive was once sold for IS its old tier: 60/120/220/360 were
   levels 1/4/8/12), the old capstones (cap:true) last at 22, 23 and 24, and nothing arriving before a passive it grew from. */
check('the passive ladder is one a level, tiers in order, capstones last', () => {
  for (const h of HERO_IDS) { const ps = SKILLS.filter(n => n.hero === h && !n.active), seen = new Set();
    for (const n of ps) { assert(n.level >= 1 && n.level <= 24, h + '/' + n.id + ' at ' + n.level); assert(!seen.has(n.level), h + ' gets two passives at level ' + n.level); seen.add(n.level);
      if (n.cap) assert(n.level >= 22, h + '/' + n.id + ' is a capstone at ' + n.level); else assert(n.level <= 21, h + '/' + n.id + ' sits among the capstones');
      const par = ps.find(q => q.id === n.parent); if (par) assert(par.level <= n.level, h + '/' + n.id + ' arrives before ' + par.id); }
    const rest = ps.filter(n => !n.cap).sort((a, b) => a.level - b.level); for (let i = 1; i < rest.length; i++) assert(rest[i].price >= rest[i - 1].price, h + ': ' + rest[i].id + ' (old tier ' + rest[i].price + ') arrives after ' + rest[i - 1].id + ' (' + rest[i - 1].price + ')');
    assert.equal(ps.filter(n => n.cap).length, 3, h + ' capstones'); } });

/* 2. THE REFUND */
const RAW = readFileSync(new URL('./fixtures/progression-v1-passives.json', import.meta.url), 'utf8').trim(), OLD = JSON.parse(RAW);
check('the fixture is a version-1 save', () => { assert.equal(OLD.progressionVersion, 1); assert(OLD.progressionReceipt.mapped.length === 2); });
const BOUGHT = [['knight', 'riposte'], ['knight', 'momentum'], ['pyro', 'kindle'], ['pyro', 'skip']], MAPPED = [['knight', 'thirdCut'], ['knight', 'plated']];
const PAID = BOUGHT.reduce((s, [h, id]) => s + skillFor(h, id).price, 0);
check('refund is exact', () => {
  assert.equal(PROGRESSION_VERSION, 2, 'PROGRESSION_VERSION'); const r = migrateProgress(RAW), p = r.progress;
  assert.equal(r.changed, true); assert.equal(p.progressionVersion, 2);
  assert.equal(p.coins, OLD.coins + PAID, 'coins ' + p.coins + ', expected ' + OLD.coins + ' + ' + PAID);
  assert.equal(PAID, 360);
  assert.deepEqual(r.passiveReceipt.refunded.map(x => x.hero + '/' + x.id).sort(), BOUGHT.map(x => x.join('/')).sort());
  assert.equal(r.passiveReceipt.refund, PAID); assert.equal(r.passiveReceipt.sourceChecksum, PR.checksum(RAW));
  for (const [h, id] of BOUGHT.concat(MAPPED)) assert.equal(p.skillOwned[h][id], true, h + '/' + id + ' was taken away');
  for (const h of HERO_IDS) for (const id of p.loadouts[h] || []) assert(!id || skillFor(h, id).active, h + ' still slots ' + id);
  assert.deepEqual(p.loadouts.knight, [null, 'risingCut'], 'the ability keeps its key'); assert.deepEqual(p.loadouts.pyro, ['vent']);
  assert.equal(p.progressionNotice, (OLD.progressionNotice || 0) + PAID, 'the notice adds to one not yet shown'); assert.equal(p.passiveNotice, 1);
  assert.deepEqual(p.progressionReceipt, OLD.progressionReceipt, 'the version-1 receipt is history and stays as it was');
  const again = migrateProgress(JSON.stringify(p)); assert.equal(again.changed, false); assert.equal(again.progress.coins, p.coins);
});
check('refund survives load, backup and import once', () => {
  const db = memory(); db.setItem('save', RAW); const saved = loadProgress(db, 'save', RAW);
  assert.equal(db.getItem(saved.backup), RAW); assert(saved.backup.includes('before-progression-v2'));
  assert.equal(JSON.parse(db.getItem('save')).coins, OLD.coins + PAID); assert.equal(loadProgress(db, 'save', db.getItem('save')).changed, false);
  const db2 = memory(); importProgress(db2, 'imp', RAW); importProgress(db2, 'imp', db2.getItem('imp')); assert.equal(JSON.parse(db2.getItem('imp')).coins, OLD.coins + PAID);
  const p = migrateProgress(RAW).progress; assert.deepEqual(migrateProgress(exportProgress(p)).progress, p); });
check('a version-0 save pays nothing twice', () => {
  /* tree points in two passives and an ability: version 1 paid them back at 25 a point; version 2 must not pay the passives again */
  const raw = JSON.stringify({ hero: 'knight', xpVersion: 1, xp: { knight: xpFloor(6) }, coins: 10, talentVersion: 6, talents: { knight: { thirdCut: 1, plated: 1, risingCut: 1 } } });
  const r = migrateProgress(raw), p = r.progress; assert.equal(r.receipt.refund, 25 * 6); assert.equal(r.passiveReceipt.refund, 0);
  assert.equal(p.coins, 10 + 150); assert(p.skillOwned.knight.thirdCut && p.skillOwned.knight.plated); assert(!p.loadouts.knight.includes('thirdCut')); });

/* 3. CATCH-UP */
check('catch-up pays x3 below the curve, stops at it, x1 above', () => {
  assert.equal(typeof XP.xpCatchUp, 'function', 'no xpCatchUp in src/xp.js'); const c = XP.xpCatchUp;
  assert.equal(XP.XP_CATCHUP, 3);
  assert.equal(c(40, xpFloor(2), 9), 120, 'far below: x3');
  assert.equal(c(40, xpFloor(9) - 10, 9), 50, 'ten short: the extra stops at the curve');
  assert.equal(c(40, xpFloor(9), 9), 40, 'on the curve: x1');
  assert.equal(c(40, xpFloor(12), 9), 40, 'above: x1');
  assert.equal(c(40, 0, 0), 40, 'the first wood expects nothing');
  for (let lv = 0; lv < 26; lv++) for (const n of [1, 7, 60, 900]) { const xp = xpFloor(lv) + 3, got = c(n, xp, 12);
    assert(got >= n && got <= 3 * n); if (got > n) assert(xp + got - n <= xpFloor(12), 'the bonus took him past the curve'); } });
check('expected level is the depth on the gate chain', () => {
  const d = depthsOf(LEVELS.filter(l => !l.hidden || l.secret)); assert.equal(d.wood, 0); assert.equal(d.marsh, 1);
  for (const [id, v] of Object.entries(d)) assert(Number.isInteger(v) && v >= 0, id + ' has no depth'); });

if (fails.length) { console.log('LEVELLING: ' + fails.length + ' red\n  ' + fails.join('\n  ')); process.exit(1); }
console.log('Levelling: ' + SKILLS.filter(n => !n.active).length + ' passives unsold, unslotted and on from their level; ' + SKILLS.filter(n => n.active).length + ' abilities sold; a real version-1 save refunded exactly ' + PAID + ' for four bought passives and nothing for two from the trees; catch-up x3 stops at the curve.');
