// Diagnostic only: compare the unchanged trace with the pre-9ddf2230 weapon freeze multiplier, restore source exactly.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
mkdirSync('gate-data', { recursive: true });
const file = 'src/main.js', original = readFileSync(file), text = original.toString();
const marker = ' * (wpn ? wpn.stop : 1)';
assert.equal(text.split(marker).length, 2, 'diagnostic must target exactly one weapon-weight multiplier');
try {
  writeFileSync(file, text.replace(marker, ''));
  const r = spawnSync(process.execPath, ['tools/slopes-trace.mjs'], { encoding: 'utf8', timeout: 240000,
    env: { ...process.env, BRACKEN_PROCESS_LOG: 'gate-data/trace.processes.jsonl' } });
  const log = (r.stdout || '') + (r.stderr || ''); console.log(log);
  writeFileSync('gate-data/trace-old-weight.log', log);
  writeFileSync('gate-data/trace-old-weight.json', JSON.stringify({ code: r.status,
    error: r.error?.message, scope: 'diagnostic; production source restored; no baseline changes' }, null, 2));
} finally { writeFileSync(file, original); assert.deepEqual(readFileSync(file), original); }
