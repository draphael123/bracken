// tools/reflect-kit.mjs - THE REFLECT TABLE AS DATA, in node (lane S3 REFLECTKIT, claude/reflectkit). No browser, ~1 s. The browser half is tools/reflect-probe.mjs.
//   node tools/reflect-kit.mjs
// Holds: all 12 hero rows (the 9 main.js can play + the Rimebinder, the Demon Hunter and the Desert Priest, who exist only as rows/logic until they are wired) with
//   normal verbs, a power answer and a block note; classify() with a tag that is a string OR an array (an arrow is ['heavy','shot']); the two extra power verbs
//   (the Blood Knight's heavy at tier 2+, the Ranger's steady shot - ONLY the 'steady'-tagged arrow); a burn/bleed tick never touches a bolt; a thrall is not the
//   Rimebinder's hand; the Desert Priest's flare is a power answer inside FLARE_BEAT and in reach; the hooks are in main.js / demon-king-hands.js / ranger.js once.
import { readFileSync } from 'node:fs';
import { REFLECT_KIT, KIT_IDS, DEFAULT_KIT, kitOf, classify, FLARE_BEAT, flareAnswer } from '../src/reflect-kit.js';
import { HERO_IDS } from '../src/hero-roster.js';
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL ' + m); } };
const LIVE = ['knight', 'warden', 'pyro', 'pirate', 'paladin', 'geomancer', 'reaper', 'berserker', 'ranger'], NEW = ['rimebinder', 'demonhunter', 'sunpriest'];
ok(KIT_IDS.length === 12, '12 rows: ' + KIT_IDS.length);
for (const h of [...LIVE, ...NEW]) {
  const K = REFLECT_KIT[h]; ok(!!K, h + ' has a row'); if (!K) continue;
  ok(Array.isArray(K.normal) && K.normal.length > 0 && K.power && K.power.look && K.power.input && typeof K.block === 'string', h + ' row is complete');
  ok(classify(h, { via: 'blow', tag: 'light' }) === 'normal' && classify(h, { via: 'blow', tag: ['light'] }) === 'normal', h + ': a light blow (string or array tag) is a normal return');
  ok(classify(h, { via: 'shot', tag: 'shot' }) === 'normal', h + ': a shot is a normal return');
  ok(classify(h, { via: 'body', result: 'blocked', parried: true }) === 'power' && classify(h, { via: 'body', result: 'blocked', parried: false }) === 'block' && classify(h, { via: 'body', result: 'hit', parried: false }) === 'hit' && classify(h, { via: 'body', result: false, parried: false }) === 'miss', h + ': body reach -> power / block / hit / miss');
  for (const t of ['burn', 'bleed', 'poison', 'tick', 'hazard', 'room', 'reflect', ['light', 'burn']]) ok(classify(h, { via: 'blow', tag: t }) === null, h + ': a ' + JSON.stringify(t) + ' tick/room blow does not touch a bolt');
}
for (const h of HERO_IDS) ok(h in REFLECT_KIT, 'every roster hero has a row: ' + h);
ok(classify('someNewHero', { via: 'blow', tag: 'light' }) === 'normal' && kitOf('someNewHero') === DEFAULT_KIT, 'a hero with no row inherits the default');
/* THE SECOND POWER VERBS (powerAlso) */
ok(classify('reaper', { via: 'blow', tag: ['heavy'], tier: 2 }) === 'power' && classify('reaper', { via: 'blow', tag: 'heavy', tier: 5 }) === 'power', 'Blood Knight heavy at tier 2+ is a POWER return');
ok(classify('reaper', { via: 'blow', tag: 'heavy', tier: 1 }) === 'normal' && classify('reaper', { via: 'blow', tag: 'heavy' }) === 'normal' && classify('reaper', { via: 'blow', tag: 'light', tier: 4 }) === 'normal', 'Blood Knight heavy at tier 1 / no tier / a light cut is a NORMAL return');
ok(classify('ranger', { via: 'shot', tag: ['heavy', 'shot', 'steady'], steady: true }) === 'power', 'Ranger steady shot is a POWER return');
ok(classify('ranger', { via: 'shot', tag: ['heavy', 'shot'] }) === 'normal' && classify('ranger', { via: 'shot', tag: 'shot' }) === 'normal' && classify('ranger', { via: 'shot', tag: ['heavy', 'shot'], steady: false }) === 'normal', 'a drawn heavy arrow that is not steady is only NORMAL');
ok(classify('knight', { via: 'blow', tag: 'heavy', tier: 5 }) === 'normal' && classify('knight', { via: 'shot', tag: ['heavy', 'shot'], steady: true }) === 'normal', 'the extra power verbs belong to their own heroes only');
/* THE THRALL IS NOT THE RIMEBINDER'S HAND */
ok(classify('rimebinder', { via: 'blow', tag: 'light', who: 'thrall' }) === null && classify('rimebinder', { via: 'blow', tag: 'light' }) === 'normal', 'a thrall does not return a bolt; her own hand does');
/* THE DESERT PRIEST'S FLARE */
ok(flareAnswer(0, 10, -6) === 'power' && flareAnswer(FLARE_BEAT, 47, 0) === 'power', 'flare on the beat and in reach = power');
ok(flareAnswer(0.3, 10, 0) === null && flareAnswer(null, 10, 0) === null && flareAnswer(undefined, 0, 0) === null && flareAnswer(0.1, 60, 0) === null && flareAnswer(0.1, 0, -60) === null, 'a late flare, no flare, or a bolt out of reach is no power answer');
ok(REFLECT_KIT.sunpriest.power.look === 'THE FLARE', "the Desert Priest's power answer is THE FLARE");
/* THE HOOKS (each once) */
const rd = f => readFileSync(new URL('../' + f, import.meta.url), 'utf8');
const one = (src, needle, m) => ok(src.split(needle).length === 2, m);
one(rd('src/main.js'), 'SKH && SKH.solidAt(x * TS + TS / 2, y * TS + 1)', "main.js: the Ranger's arrows meet the drake's back once (ranger isSolid through SKH.solidAt)");
one(rd('src/ranger.js'), "tag: ['heavy', 'shot', 'steady']", 'ranger.js: the steady arrow carries the steady tag once');
const H = rd('src/demon-king-hands.js');
ok(/resolving === b\.id/.test(H) && /resolving = boltId/.test(H), "demon-king-hands: a bolt that is reaching a hero cannot be returned as a normal blow by that hero's own guard");
ok(/steady: hid === 'ranger' && has\('steady'\)/.test(H) && /tier: hid === 'reaper'/.test(H), 'demon-king-hands: struck() hands the tier and steady fields to classify');
console.log(fail ? 'reflect-kit: ' + fail + ' FAILED of ' + (pass + fail) : 'reflect-kit: ' + pass + ' checks ok');
process.exit(fail ? 1 : 0);
