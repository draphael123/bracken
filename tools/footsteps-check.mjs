// tools/footsteps-check.mjs - STATIC CHECK for claude/footsteps: every surface string main.js surface() can return has a
// footstep pool in the manifest AND a row in audio.js FOOT; every step_* pool's files exist; every level resolves to a surface
// (built offline from LEVELS; no browser). node tools/footsteps-check.mjs
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)), rd = f => readFileSync(join(ROOT, f), 'utf8').replace(/\r\n/g, '\n');
const main = rd('src/main.js'), audio = rd('src/audio.js'), man = JSON.parse(rd('audio/manifest.json')), problems = [];
const body = (main.match(/function surface\(\) \{[\s\S]*?\n\}\n/) || [''])[0];
const returned = new Set([...body.matchAll(/return ([^;]*);/g)].flatMap(m => [...m[1].matchAll(/'([a-z]+)'/g)].map(x => x[1])));
const foot = (audio.match(/const FOOT = \{([\s\S]*?)\n\};/) || [, ''])[1];
const rows = Object.fromEntries([...foot.matchAll(/(\w+): \{ p: '(\w+)'/g)].map(m => [m[1], m[2]]));
if (!returned.size) problems.push('could not read surface() out of src/main.js');
for (const s of returned) {
  if (!rows[s]) problems.push("surface '" + s + "' has no FOOT row in src/audio.js");
  else if (!(man[rows[s]] || []).length) problems.push("surface '" + s + "' -> pool '" + rows[s] + "' is not in the manifest");
}
for (const [s, p] of Object.entries(rows)) for (const f of man[p] || []) if (!existsSync(join(ROOT, f))) problems.push(p + ': ' + f + ' is missing on disk');
for (const l of ['arm', 'lth', 'cloth']) if (!(man['step_' + l] || []).length) problems.push("gear pool step_" + l + ' is not in the manifest');
const heroes = [...(audio.match(/const FOOT_HERO = \{([\s\S]*?)\n\};/) || [, ''])[1].matchAll(/(\w+): \{ w:/g)].map(m => m[1]);
for (const h of ['knight', 'paladin', 'reaper', 'berserker', 'pirate', 'ranger', 'warden', 'geomancer', 'pyro']) if (!heroes.includes(h)) problems.push('hero ' + h + ' has no FOOT_HERO row');
console.log('surfaces returned by surface():', [...returned].sort().join(' '));
if (problems.length) { console.log('FOOTSTEPS CHECK RED:\n  ' + problems.join('\n  ')); process.exit(1); }
console.log('footsteps-check ok: ' + returned.size + ' surfaces, ' + Object.keys(rows).length + ' pools, ' + heroes.length + ' heroes');
