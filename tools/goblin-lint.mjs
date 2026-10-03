/* tools/goblin-lint.mjs - NO GOBLINS PAST THE GOBLIN QUEEN (Daniel, 2026-10-02, the standing THEME FIT rule). Node only: no page, no port, no Chrome.

   The rule: once the Goblin Queen is dead, the goblins are done. A later level that wants a goblin's proven AI keeps the AI and REskins it to
   something of the place (THE FOG CANAL: the gaffer's boat hook is a human BARGEMAN, the boarding gang RIVER RATS, the basin's elite THE DECK
   FOREMAN, the goblin archer a WATCHMAN with a crossbow, the snuffer a LAMPLIGHTER). A reskin is an ent flag, `canal.cnSkin` (or `cnSkin`), that
   src/main.js draws with SPR[cnSkin] and the bestiary names.

   WHAT FAILS and WHAT IS ONLY REPORTED. The levels a lane has FIXED are listed in FIXED: a goblin kind there with no reskin FAILS. Every other level
   past the Goblin Queen (by the gate chain's depth, src/campaign-order.js) is REPORTED, not failed - the list is for a later sweep lane, and a
   level leaves the report by being fixed and joining FIXED. A FIXED level that names a skin with no sprite or no bestiary card fails too.

   LIVING GOBLINS ONLY (Daniel, 10-02): the UNDEAD goblins - the skeleton 'bonegob', and an archer raised as bones (ent.bone: the caverns' bone archer) -
   are fine anywhere they fit, and are neither failed nor reported.

   WHICH KINDS ARE GOBLINS. Listed by hand below (a goblin's sprite and its bestiary card say so); the list is checked against the bestiary so a
   kind that is renamed or removed is found, not silently skipped. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS } from '../src/level.js';
import { depthsOf } from '../src/campaign-order.js';
import { SKIN_MAPS } from '../src/redraw/undercrown_skins.js';   /* the recoloured skins (claude/goblinsweep) are baked from a table, not assigned one by one */

export const GOBLIN_KINDS = new Set(['sprig', 'shield', 'thorn', 'archer', 'sapper', 'brute', 'rockgoblin', 'gobpriest', 'gobmage', 'assassin', 'berserker',
  'burngob', 'hearthgob', 'stormshaman', 'sailer', 'horn', 'thief', 'miner', 'sheargob', 'gaffer', 'kite', 'sandgob', 'chief', 'lance', 'snuffer',
  'propman', 'tippler', 'scalder', 'sentry', 'pike', 'temperer']);
/* the levels whose goblins are reskinned (a lane adds its level here when it fixes it) */
export const FIXED = ['canal', 'redgorge', 'undercrown', 'lamplit'];   /* (claude/desertfoes: THE RED GORGE's dynamite bandit and shield guard under men's skins; claude/goblinsweep: the Undercrown's miners, rock goblins, sprigs, propmen and sentry; Lamplit Street's snuffers) */

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const beasts = main.slice(main.indexOf('const BEASTS = ['), main.indexOf('];', main.indexOf('const BEASTS = [')));
const cards = new Set([...beasts.matchAll(/\{ t: '([a-zA-Z0-9]+)'/g)].map(m => m[1]));
for (const k of GOBLIN_KINDS) assert.ok(cards.has(k), 'goblin kind ' + k + ' has no bestiary card: renamed or removed? (fix GOBLIN_KINDS)');

const byId = new Map(LEVELS.map(l => [l.id, l]));
const gq = LEVELS.find(l => { try { const L = l.build(); return L.arena && L.arena.boss === 'gqueen'; } catch { return false; } });
assert.ok(gq, 'no level has the Goblin Queen for its boss: this check has nothing to measure from');
const depth = depthsOf(LEVELS), after = LEVELS.filter(l => depth[l.id] !== null && depth[l.id] > depth[gq.id]);
for (const id of FIXED) assert.ok(byId.has(id) && after.includes(byId.get(id)), id + ' is in FIXED but is not a level past the Goblin Queen');

/* THE DEATH FRAMES TOO (claude/corpses, Daniel 10-02: 'the reskinned enemies use a goblin sprite when they die'). A reskin that is only worn while the foe LIVES is not a reskin:
   the corpse, the knocked-back frame and the hurt flash must wear the same skin. The page test is tools/corpses.mjs (every reskinned foe is killed and its body's drawn set read back);
   these source asserts are the Node-only half: the one reskinSet() picks every flag the living draw does, spawnCorpse stores it on the body, and the corpse draw reads it. */
{ const rs0 = main.indexOf('function reskinSet(e)'); assert.ok(rs0 > 0, 'src/main.js has no reskinSet(e): a reskinned foe would die as its base sheet (claude/corpses)');
  const rs = main.slice(rs0, main.indexOf('function spawnCorpse(e, dir)', rs0));
  const living = main.slice(main.indexOf("let sprSet = e.t === 'mummer'"), main.indexOf('if (!sprSet) { g.fillStyle'));
  for (const flag of ['e.cnSkin', 'e.lamplighter', 'e.shy', 'e.juggler', 'e.bandit', 'L.theatre', 'e.bone']) if (living.includes(flag)) assert.ok(rs.includes(flag), 'the living draw reskins by ' + flag + ' but reskinSet() (the corpse and hurt-frame skin) does not: that foe dies as its base sheet');
  const sc = main.slice(main.indexOf('function spawnCorpse(e, dir)'), main.indexOf('function swordEffect(e)'));
  assert.ok(sc.includes('reskinSet(e)') && sc.includes('c.set = '), 'spawnCorpse does not give the body its reskin (c.set = reskinSet(e)): a reskinned foe dies as its base sheet');
  const draw = main.slice(main.indexOf('for (const c of corpses) {', main.indexOf('const al = Math.min(1, c.life / c.max * 2.5)') - 200), main.indexOf('for (const fx of deathFx) drawDeathFx'));
  assert.ok(draw.includes('c.set ||'), 'the corpse draw does not use c.set: the body is drawn from SPR[c.t], the goblin sheet');
}
const undead = e => !!e.bone;   /* a goblin raised as bones (SPR.bonearcher) is not a living goblin */
const skinOf = e => (e.canal && e.canal.cnSkin) || e.cnSkin || (e.juggler ? 'juggler' : e.shy ? 'shy' : null);   /* (the Harvest Fair's archers are its knife jugglers already: claude/fairfix2) */
const report = [], fails = [];
let fixedSkins = 0;
for (const lv of after) {
  let L; try { L = lv.build(); } catch (err) { continue; }
  const gob = (L.ents || []).filter(e => GOBLIN_KINDS.has(e.t) && !undead(e));
  const bare = gob.filter(e => !skinOf(e)), skinned = gob.filter(e => skinOf(e));
  if (FIXED.includes(lv.id)) {
    for (const al of (L.alarms || [])) for (const gd of (al.garrison || [])) if (GOBLIN_KINDS.has(gd.t) && !gd.cnSkin) fails.push(lv.id + ': the alarm ' + al.id + "'s garrison has a living " + gd.t + ' (give it cnSkin)');   /* (claude/goblinsweep) a rung bell's garrison is spawned from the alarm, not the ent list */
    for (const e of bare) fails.push(lv.id + ': a ' + e.t + ' at (' + e.x + ', ' + e.y + ') is a goblin with no reskin (give its ent canal.cnSkin)');
    for (const e of skinned) { const s = skinOf(e); fixedSkins++;
      if (!new RegExp('SPR\\.' + s + '\\s*=').test(main) && !SKIN_MAPS[s]) fails.push(lv.id + ': the skin ' + s + ' (a ' + e.t + ') has no sprite (SPR.' + s + ' in src/main.js)');
      if (!cards.has(s)) fails.push(lv.id + ': the skin ' + s + ' has no bestiary card (a BEASTS row t: \'' + s + '\')'); }
    report.push('  FIXED   ' + lv.id.padEnd(12) + gob.length + ' goblin-AI foes, all reskinned');
  } else if (bare.length) {
    const kinds = {}; for (const e of bare) kinds[e.t] = (kinds[e.t] || 0) + 1;
    report.push('  REPORT  ' + lv.id.padEnd(12) + bare.length + ' goblins: ' + Object.entries(kinds).map(([k, n]) => k + ' x' + n).join(', '));
  }
}
console.log('levels past the Goblin Queen (' + gq.id + ', depth ' + depth[gq.id] + '): ' + after.length);
console.log(report.join('\n'));
assert.equal(fails.length, 0, fails.slice(0, 12).join('\n'));
console.log('ok  goblin-lint    ' + FIXED.join(', ') + ': no goblins (' + fixedSkins + ' reskinned foes, every skin drawn and carded, dead as well as alive); the levels listed REPORT are for a later sweep');
