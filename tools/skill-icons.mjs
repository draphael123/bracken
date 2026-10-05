/* tools/skill-icons.mjs - EVERY SKILL WEARS ITS OWN ICON, AND NO DESCRIPTION CONTRADICTS THE CODE (docs/ability-audit.md, items 1-4, 18-20).
 *
 * ICONS. The 60 actives each have a drawn icon of their own (nothing falls to the flame default, nothing borrows a
 * sibling's, no two share pixels). The 144 passives each have a row in src/skill-glyphs.js (no regex guess, no sword
 * fallback); a glyph may repeat inside a hero's list (a glyph says what the skill does to you) but never on THE
 * GEOMANCER, whose ten are all different, and the id `sunder` (five heroes, five behaviours) is keyed per hero.
 * DESCRIPTIONS. What is checkable is checked: the pirate's C (tap = parry, hold = hook) is driven in the game and the
 * hero card must say the same; the knight's RESOLVE sources, the death knight's F and G, the paladin's shieldless
 * kit, the "purse" that is really the plunder bar, and the holy fire that only burns the dead.
 * Names of skills or keys in a description that the code does not have are the failures this exists to catch.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async () => {
    const { SKILLS } = await import('/src/progression.js'), { PASSIVE_GLYPH } = await import('/src/skill-glyphs.js');
    BK.manualSimulation = true;
    const url = c => c.toDataURL(), fallback = url(BKT.skillIcon('__nothing__'));
    const actives = SKILLS.filter(n => n.active), seen = {}, dup = [], fell = [];
    for (const n of actives) { const u = url(BKT.skillIcon(n.id)); if (u === fallback) fell.push(n.hero + ':' + n.id); (seen[u] ||= []).push(n.hero + ':' + n.id); }
    for (const u in seen) if (seen[u].length > 1) dup.push(seen[u]);
    const rows = [], missing = [], extra = [], wrong = [];
    for (const n of SKILLS.filter(n => !n.active)) { const k = PASSIVE_GLYPH[n.hero] && PASSIVE_GLYPH[n.hero][n.id]; if (!k) { missing.push(n.hero + ':' + n.id); continue; }
      if (BKT.TAL_KIND(n.id, n.hero) !== k) wrong.push(n.id); if (!BKT.talIcon(n.id, n.hero)) wrong.push(n.id + ' (no canvas)'); rows.push([n.hero, n.id, k]); }
    for (const h in PASSIVE_GLYPH) for (const id in PASSIVE_GLYPH[h]) if (!SKILLS.some(n => n.hero === h && n.id === id && !n.active)) extra.push(h + ':' + id);
    // THE PIRATE'S C, driven: a tap parries, a hold throws the hook
    const prep = () => { for (const k in BK.keys) BK.keys[k] = false; BK.setHero('pirate'); BK.reset({ fresh: true }); BK.load(0); BK.state = 'play'; BK.god = true; BK.enemies().forEach(e => e.alive = false); BK.sim(200); };
    prep(); BK.keys.block = true; BK.sim(4); BK.keys.block = false; BK.sim(1); const tapParry = BK.P.parryW > 0, tapHook = !!BK.P.hookT || BK.P.hookCd > 0;
    prep(); BK.keys.block = true; BK.sim(20); const holdHook = !!BK.P.hookT || BK.P.hookCd > 0; BK.keys.block = false; BK.sim(2); BK.god = false;
    return { total: SKILLS.length, actives: actives.length, dup, fell, missing, extra, wrong, rows, tapParry, tapHook, holdHook };
  })()`);
  assert.equal(r.actives, 60); assert.equal(r.rows.length + r.missing.length, 144);
  assert.deepEqual(r.fell, [], 'actives that fall to the default flame icon');
  assert.deepEqual(r.dup, [], 'actives that share an icon');
  assert.deepEqual(r.missing, [], 'passives with no row in src/skill-glyphs.js');
  assert.deepEqual(r.extra, [], 'rows in src/skill-glyphs.js for a skill that does not exist');
  assert.deepEqual(r.wrong, [], 'the table and the game disagree');
  const geo = r.rows.filter(x => x[0] === 'geomancer').map(x => x[2]);
  assert.equal(new Set(geo).size, geo.length, 'the Geomancer passives share a glyph: ' + geo);
  assert.ok(!geo.includes('blade'), 'a Geomancer passive wears a sword');
  const sun = r.rows.filter(x => x[1] === 'sunder'); assert.equal(sun.length, 5);
  assert.ok(new Set(sun.map(x => x[2])).size >= 4, 'the five different sunders wear too few glyphs: ' + sun.map(x => x.join(':')));
  assert.ok(r.tapParry && !r.tapHook, 'tap C is not the pirate parry'); assert.ok(r.holdHook, 'hold C is not the pirate hook');
  /* DESCRIPTIONS */
  const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), cat = readFileSync(new URL('../src/progression-catalog.js', import.meta.url), 'utf8');
  const card = id => { const line = main.split(/\r?\n/).find(l => l.startsWith("  { id: '" + id + "', name: '") && l.includes(' desc: ')); assert.ok(line, 'no hero card for ' + id); return line.slice(line.indexOf(' desc: ')); };
  const desc = id => { const i = cat.indexOf('"id": "' + id + '",'); assert.ok(i >= 0, 'no skill ' + id); const j = cat.indexOf('"desc": "', i); return cat.slice(j + 9, cat.indexOf('"', j + 9)); };
  const pirate = card('pirate'); assert.ok(/tap C: THE PARRY/.test(pirate) && /HOLD C: THE HOOK/.test(pirate), 'the pirate card does not say tap = parry, hold = hook');
  assert.ok(!/hold C: RUM/i.test(pirate) && !/tap C: THE HOOK/i.test(pirate), 'the pirate card gives C the old jobs (rum is a bought skill, the hook is a hold)');
  const knight = card('knight'); assert.ok(!/third cuts fill RESOLVE/i.test(knight) && /heavy cuts fill RESOLVE/i.test(knight), 'RESOLVE is filled by blocks and HEAVY cuts');
  const dk = card('reaper'); assert.ok(!/TAP F for the equipped/i.test(dk), 'the death knight card gives F the equipped skill; F is summon and G is the equipped skill'); assert.ok(/G is the skill he has equipped/i.test(dk));
  assert.ok(!/shield/i.test(desc('holyCharge')), 'the Paladin has no shield: HOLY CHARGE cannot lead with one');
  assert.ok(!/holy fire/i.test(desc('consecrate')), 'CONSECRATE only burns the dead');
  for (const id of ['deepPockets', 'noQuarter']) assert.ok(!/purse/i.test(desc(id)) && /PLUNDER bar/.test(desc(id)), id + ' fills the plunder bar, not a purse');
  assert.ok(/STONE WALL/.test(desc('geoBulwark')), 'BULWARK also lets a smashed STONE WALL hold once');
  assert.deepEqual(pg.errors, []);
  console.log('skill-icons: ' + r.actives + ' actives each their own, ' + r.rows.length + ' passives each in the table, descriptions match the code');
} finally { pg.close(); }
