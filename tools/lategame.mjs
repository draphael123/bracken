/* tools/lategame.mjs - LATE-GAME FIXES lane A (claude/lategamea, Daniel-approved 10-31, scratch/brief-lategame-1101.md Q2A / Q3A / Q4A). Static, no browser.
 *   1. STAT TAPER: a stat pick is full for the first 12 picks and half after; free growth +2 hp a level to L24 then +1, +1 damage every 4th level to L24 then every 6th.
 *   2. FLASK CAP: a flask never heals more than 150 hp.
 *   3. MITIGATION SOFT FLOOR: the permanent chain never goes under x0.6, is the identity above x0.7, and is monotone.
 *   4. ONE SKILL RULE: every converted skill reads SKK.K (no literal flat number left at its site), the trimmed linear AoE keep their lower k, the Pyro skills are listed as TODO. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as PR from '../src/progression.js';
import * as SV from '../src/survival.js';
import * as SKK from '../src/skill-k.js';
const typical = lv => { const n = Math.min(50, Math.max(0, lv)); return { v: Math.floor(n * 0.45), e: Math.floor(n * 0.2), m: Math.floor(n * 0.35), ms: {} }; };
/* 1 */
assert.equal(PR.taperPicks(12), 12); assert.equal(PR.taperPicks(14), 13); assert.equal(PR.taperPicks(25), 18.5); assert.equal(PR.taperPicks(99), 18.5);
const k24 = PR.growthAt('knight', 24, { v: 8, e: 8, m: 8 }), k0 = PR.growthAt('knight', 0, null);
assert.deepEqual([k24.hp - k0.hp, k24.stamina - k0.stamina, k24.damage - k0.damage], [112, 144, 16], 'nothing changes before L24 / 12 picks');
assert.equal(PR.growthAt('knight', 30, { v: 14, e: 0, m: 0 }).hp - PR.growthAt('knight', 30, { v: 12, e: 0, m: 0 }).hp, 8, 'two picks past 12 are +4 each');
assert.equal(PR.growthAt('knight', 30, { v: 0, e: 14, m: 0 }).stamina - PR.growthAt('knight', 30, { v: 0, e: 12, m: 0 }).stamina, 12, 'ENDURANCE +6 each past 12');
assert.equal(PR.growthAt('knight', 40, { v: 0, e: 0, m: 16 }).damage - PR.growthAt('knight', 40, { v: 0, e: 0, m: 12 }).damage, 2, 'MIGHT +1 every other pick past 12');
assert.equal(PR.freeHp(24), 48); assert.equal(PR.freeHp(50), 74); assert.equal(PR.freeDamage(24), 6); assert.equal(PR.freeDamage(50), 10);
for (const h of PR.HERO_IDS) for (let lv = 0; lv < 50; lv++) { const a = PR.growthAt(h, lv, typical(lv)), b = PR.growthAt(h, lv + 1, typical(lv + 1)); assert(b.hp >= a.hp && b.stamina >= a.stamina && b.damage >= a.damage, h + ' never goes down at ' + lv); }
const kn = lv => PR.growthAt('knight', lv, typical(lv)); assert(kn(50).hp === 310, 'knight L50 hp 310 (was 376 before gear and perks; -66): ' + kn(50).hp);
/* 2 */
assert.equal(SV.FLASK_HEAL_CAP, 150); assert.equal(SV.flaskHeal(300, 0.4), 120); assert.equal(SV.flaskHeal(600, 0.4), 150); assert.equal(SV.flaskHeal(400, 0.35), 140); assert.equal(SV.flaskHeal(1000, 0.5), 150);
/* 3 */
assert.equal(SV.mitigationMul([]), 1); assert.equal(SV.mitigationMul([0.9]), 0.9); assert.equal(SV.mitigationMul([0.9, 0.9]), 0.81);
let prev = 2; for (let r = 1.0; r >= 0.2; r -= 0.01) { const f = SV.softFloorMit(r); assert(f <= prev + 1e-9 && f >= SV.MIT_FLOOR - 1e-9 && f <= 1, 'monotone, floored at ' + r); if (r >= SV.MIT_KNEE) assert.equal(f, r); prev = f; }
assert(SV.mitigationMul([0.9, 0.8, 0.9, 0.9, 0.9]) > 0.6 && SV.mitigationMul([0.9, 0.8, 0.9, 0.9, 0.9]) < 0.65, 'the full chain (was 0.525) lands just over 0.6');
assert(SV.mitigationMul([0.9, 0.9, 0.9, 0.9]) > 0.65 && SV.mitigationMul([0.9, 0.9, 0.9, 0.9]) < 0.68, 'the typical chain (was 0.656) barely moves');
/* 4 */
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), ber = readFileSync(new URL('../src/berserker.js', import.meta.url), 'utf8'), rgr = readFileSync(new URL('../src/ranger.js', import.meta.url), 'utf8');
for (const id of ['hammerLeap', 'lightLance', 'holyCharge', 'dawnburst', 'broadside', 'keelhaul', 'powderKeg', 'heavySeas', 'harvestMoon', 'soulReap', 'whirlwind', 'rainOfSpears'])
  assert(new RegExp('SKK\\.K\\.' + id + '\\b').test(main), id + ' must read SKK.K');
assert(/SKK\.K\.bzStorm/.test(ber) && /SKK\.K\.rgVolley/.test(rgr));
for (const re of [/Math\.round\(24 \* amul\('hammerLeap'\)\)/, /Math\.round\(22 \* amul\('broadside'\)\)/, /Ln\.dmg \* amul\('lightLance'\)/, /swordDmg\(\) \* 1\.1 \* amul\('whirlwind'\)/]) assert(!re.test(main), 'a flat/old literal is still in main.js: ' + re);
for (const [id, k] of Object.entries(SKK.K_LINEAR)) { const was = SKK.WAS[id]; assert(was && k < was, id + ' is trimmed'); }
assert(/whirlwind: 5,/.test(main), 'whirlwind cd 5');
for (const id of ['meteor', 'flashover', 'ember', 'heldFireball']) assert(SKK.PYRO_TODO[id], id + ' listed for the pyrokit follow-up');
for (const id of Object.keys(SKK.K_FLAT)) assert(!(id in SKK.PYRO_TODO));
console.log('Late-game lane A: stat taper (12 full picks, free growth halves after L24), flask heal cap 150, mitigation soft floor 0.6 (knee 0.7), the skill rule table (converted flat skills, trimmed linear AoE) and the Pyro TODO list pass.');
