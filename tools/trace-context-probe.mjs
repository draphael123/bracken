// Read-only diagnostic: instrument the unchanged trace in current and historical isolated checkouts.
import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve, join } from 'node:path';
import assert from 'node:assert/strict';
const root = process.cwd(), out = resolve('gate-data'); mkdirSync(out, { recursive: true });
const old = resolve('../trace-context-old');
const added = spawnSync('git', ['worktree', 'add', '--detach', old, '2cf3294b'], { encoding: 'utf8' });
assert.equal(added.status, 0, added.stderr);
// Use the same modern lab transport on BOTH versions; leave every historical game byte untouched.
for (const file of ['cdp.mjs','browser-profile.mjs','ports.mjs','process-memory.mjs'])
  copyFileSync(join(root,'tools',file),join(old,'tools',file));
let source = readFileSync('tools/slopes-trace.mjs', 'utf8');
source = source.replace('const rows = [];', 'const rows = [], context = [];');
const row = 'rows.push([P.x, P.y, P.vx, P.vy, P.ground ? 1 : 0]);';
assert.equal(source.split(row).length, 3);
source = source.replaceAll(row, row + `
  if ((id === 'kings' && ((rows.length > 650 && rows.length < 750) || (rows.length > 1150 && rows.length < 1230))) ||
      (id === 'burial' && rows.length > 1950) || (id === 'canal' && rows.length > 1690 && rows.length < 1760))
    context.push({ frame: rows.length - 1, stop: BK.stop, p: Object.fromEntries(
      ['x','y','vx','vy','ground','swim','hurt','inv','climb','jbuf','coyote','runT','atk','plunge','dodge','kbT'].map(k => [k,P[k]])),
      enemies: BK.enemies().filter(e => e.alive && Math.abs(e.x-P.x)<90).map(e => ({t:e.t,skin:e.cnSkin,x:e.x,y:e.y,mode:e.mode,modeT:e.modeT})) });`);
source = source.replace('out[id] = rows;', "out[id + ':context'] = context; out[id] = rows;");
source = source.replace('const got = await trace(pg);', "const got = await trace(pg); writeFileSync(process.env.TRACE_CONTEXT_OUT, JSON.stringify(got));");
for (const [name, cwd] of [['old', old], ['current', root]]) {
  const tool = join(cwd, 'tools/trace-context-run.mjs'); writeFileSync(tool, source);
  try {
    const run = spawnSync(process.execPath, [tool], { cwd, encoding: 'utf8', timeout: 240000,
      env: { ...process.env, TRACE_CONTEXT_OUT: join(out, name + '.json') } });
    writeFileSync(join(out, name + '.log'), (run.stdout || '') + (run.stderr || '') + (run.error?.message || ''));
    console.log(name + ': exit=' + run.status); console.log(run.stdout);
  } finally { rmSync(tool); }
}
