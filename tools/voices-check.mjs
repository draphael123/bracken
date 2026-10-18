// tools/voices-check.mjs — (claude/audiovoices 10-18) THE VOICE GATE. Static, node only, a second or two:
//  1. every bestiary type (BEASTS in src/main.js) has a hurt voice AND a death voice (SFX.hurtOf / SFX.dieOf), recorded kit or synth;
//  2. every kit a CAST row names has a hurt pool and a die pool (or the nearest act VOK would fall back to) in audio/manifest.json;
//  3. each of the nine heroes has its own kit with an effort (or attack/heavy), a hurt (3+ takes) and a die (3+ takes) pool, no hero falls to the
//     goblin 'effort' grunt, and no two heroes share a kit;
//  4. the credits name both packs (CREDITS.txt, src/credits.js).
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
const ROOT = new URL('..', import.meta.url), rd = f => readFileSync(fileURLToPath(new URL(f, ROOT)), 'utf8').replace(/\r\n/g, '\n');
const { SFX, castTable, heroKitTable } = await import('../src/audio.js');
const man = JSON.parse(rd('audio/manifest.json')), problems = [];
const pool = (kit, act) => (man['vo_' + kit + '_' + act] || []).length;
const bare = kit => (man['vo_' + kit] || []).length;   /* a kit that is one pool (bark, bug, slime, scream...) */
const fb = { alert: 'attack', effort: 'heavy', heavy: 'attack', jump: 'attack', die: 'hurt', attack: 'alert' };
const has = (kit, act) => pool(kit, act) || pool(kit, fb[act] || '-') || bare(kit);
// 1
const src = rd('src/main.js'), i = src.indexOf('const BEASTS = ['), j = src.indexOf('\n];', i);
const types = [...src.slice(i, j).matchAll(/\{ t: '(\w+)', name:/g)].map(m => m[1]);
if (types.length < 250) problems.push('only ' + types.length + ' bestiary types read (the BEASTS array moved?)');
for (const t of types) { if (!SFX.hurtOf(t)) problems.push('bestiary type ' + t + ' has no hurt voice'); if (!SFX.dieOf(t)) problems.push('bestiary type ' + t + ' has no death voice'); }
// 2
const cast = castTable();
for (const [t, c] of Object.entries(cast)) { if (!has(c.kit, 'hurt')) problems.push('CAST.' + t + ': kit ' + c.kit + ' has no hurt pool'); if (!has(c.kit, 'die')) problems.push('CAST.' + t + ': kit ' + c.kit + ' has no die pool'); }
// 3
const hk = heroKitTable(), seen = {};
for (const [h, k] of Object.entries(hk)) {
  if (seen[k.kit]) problems.push('heroes ' + seen[k.kit] + ' and ' + h + ' share the kit ' + k.kit); seen[k.kit] = h;
  if (!has(k.kit, 'effort')) problems.push(h + ' (' + k.kit + ') has no effort / heavy / attack pool: it would fall to nothing');
  if (pool(k.kit, 'hurt') < 3) problems.push(h + ' (' + k.kit + ') has fewer than 3 hurt takes');
  if (pool(k.kit, 'die') < 3) problems.push(h + ' (' + k.kit + ') has fewer than 3 death takes');
}
if (Object.keys(hk).length !== 9) problems.push('HERO_KIT has ' + Object.keys(hk).length + ' heroes, not 9');
const audioSrc = rd('src/audio.js');
if (/pEffort\(\)\s*\{[^}]*file\('effort'/.test(audioSrc)) problems.push("pEffort still falls back to the goblin 'effort' clip");
// 4
const cred = rd('audio/CREDITS.txt') + rd('src/credits.js');
for (const w of ['Dying Voices', 'Little Robot']) if (!cred.includes(w)) problems.push('credits do not name "' + w + '"');
if (problems.length) { console.log('FAIL voices-check\n  ' + problems.join('\n  ')); process.exit(1); }
console.log('ok  voices-check  ' + types.length + ' bestiary types all have hurt + death, ' + Object.keys(cast).length + ' CAST rows resolve to real pools, 9 heroes on 9 kits');
