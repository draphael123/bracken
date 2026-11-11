/* tools/old-save-traits.mjs (claude/traittune-d) - an OLD (pre-traits, v1) save loads with TRAITS_SHIP on: no throw, progress intact, migration idempotent (load -> export -> load is stable). Node only. */
import assert from 'node:assert/strict'; import { readFileSync } from 'node:fs';
import { migrateProgress, exportProgress, passiveOn, SKILLS, HERO_IDS, TRT } from '../src/progression.js'; import { levelOfXp } from '../src/xp.js';
const fx = JSON.parse(readFileSync(new URL('./fixtures/progression-v1-passives.json', import.meta.url), 'utf8'));
const strip = p => { const q = JSON.parse(JSON.stringify(p)); delete q.traits; delete q.progressionReceipt; delete q.progressionVersion; return q; };
const fat = JSON.parse(JSON.stringify(fx)); fat.xp = { knight: 90000, pyro: 60000, warden: 40000, ranger: 30000 }; fat.heroes = { knight: true, pyro: true, warden: true, ranger: true };   /* a long v1 save: high levels, four heroes */
for (const [name, base] of [['fixture v1', fx], ['long v1 (4 heroes, high XP)', fat]]) {
  TRT.setTraitsShip(false); const off = migrateProgress(JSON.stringify(base), []).progress;
  TRT.setTraitsShip(true);
  const on1 = migrateProgress(JSON.stringify(base), []).progress, saved = exportProgress(on1), on2 = migrateProgress(saved, []).progress, saved2 = exportProgress(on2);
  assert.deepEqual(strip(on1), strip(off), name + ': progress/levels/kit differ ON vs OFF (beyond traits)');
  assert.deepEqual(on2, JSON.parse(saved2), name + ': load-save-load changed the save'); assert.equal(saved, saved2, name + ': export not stable');
  assert.deepEqual(JSON.parse(saved).traits, on1.traits, name + ': traits not preserved across a round trip');
  const lost = []; for (const h of Object.keys(base.xp)) { const lv = levelOfXp(base.xp[h]); for (const n of SKILLS.filter(x => x.hero === h && !x.active)) { TRT.setTraitsShip(false); const a = passiveOn(on1, h, n.id, lv); TRT.setTraitsShip(true); const b = passiveOn(on1, h, n.id, lv); if (a && !b) lost.push(h + ':' + n.id); } }
  console.log(name + ' PASS: levels ' + Object.entries(base.xp).map(([h, x]) => h + ' L' + levelOfXp(x)).join(' ') + '; traits written ' + JSON.stringify(on1.traits) + '; owned passives not worn (off under TRAITS) ' + (lost.length ? lost.join(',') : 'none'));
}
console.log('old-save-traits ok');
