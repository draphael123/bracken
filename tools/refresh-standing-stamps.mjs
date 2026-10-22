// Explicit maintenance command, never a gate: retain default heroes, seeds, run lengths and verdict assertions.
// Ore Road squads moved in bc14ff36 and WORKS coordinates followed in 1547a2c8.
// Moor's room/ledge/fall-clear data changed deliberately in bd35f8a3; only its mash row was refreshed later.
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
mkdirSync('gate-data', { recursive: true });
const runs = [];
for (const args of [
  ['tools/mash-bot.mjs', 'oreroad', '--level', 'oreroad', '--write'],
  ['tools/level1-pilot.mjs', 'oreroad', 'moor', '--curve'],
]) {
  const started = new Date().toISOString();
  const p = spawn(process.execPath, args, { stdio: 'inherit', env: { ...process.env,
    BRACKEN_PROCESS_LOG: 'gate-data/refresh.processes.jsonl', BRACKEN_CHECK: args[0],
  } });
  console.log('START ' + args.join(' ') + ' pid=' + p.pid);
  const code = await new Promise((resolve, reject) => { p.once('error', reject); p.once('close', resolve); });
  runs.push({ args, pid: p.pid, started, finished: new Date().toISOString(), code });
  writeFileSync('gate-data/refresh.json', JSON.stringify({ complete: runs.length === 2 && runs.every(r => r.code === 0), runs }, null, 2) + '\n');
  if (code !== 0) { process.exitCode = code || 2; break; }
}
