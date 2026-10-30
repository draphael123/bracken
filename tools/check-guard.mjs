// tools/check-guard.mjs - A WALL-CLOCK BUDGET FOR EVERY CHECK (claude/smallfix4, batch128 gate: levelling-runtime sat 1808 s, geomancer 1861 s,
// load-leak 957 s; earlier pixels / bells / verb-matrix hung in Runtime.evaluate and stalled the whole release).
// A check that passes in this suite never took more than ~8 min, so the default budget is 15 min; a check that legitimately needs longer
// is named in OVERRIDES. When the budget runs out ONLY THAT CHECK'S OWN process tree is killed (by the PID this guard spawned - never by name)
// and the check is reported as a failure: 'FAIL <name> TIMEOUT'. The gate moves on to the next check.
//
// As a wrapper (serial gate):  node tools/check-guard.mjs <name> <cmd> [args...]   -> exits with the child's code, 124 on a timeout.
// As a module (the pool):      import { budgetFor, killTree } from './check-guard.mjs'
import { spawn, spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

export const DEFAULT_BUDGET_MS = 15 * 60 * 1000;
/* checks that are allowed longer (or held shorter) than the default; the values come from the batch128 gate log (largest passing check: 253 s) */
export const OVERRIDES = { 'textfit-full': 10 * 60 * 1000 /* its own long-standing ten-minute budget */ };
export const budgetFor = name => { const env = +process.env.BRACKEN_CHECK_TIMEOUT_MS; return env > 0 ? env : OVERRIDES[name] || DEFAULT_BUDGET_MS; };

/* Kill one process and everything it started, by PID. Windows: taskkill /PID n /T /F (a PID, never /IM). Elsewhere: the child leads its own group. */
export function killTree(pid, detached = false) {
  if (!pid) return;
  try { if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' });
    else process.kill(detached ? -pid : pid, 'SIGKILL'); } catch {}
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [name, cmd, ...args] = process.argv.slice(2);
  if (!name || !cmd) { console.error('usage: node tools/check-guard.mjs <name> <cmd> [args...]'); process.exit(2); }
  const ms = budgetFor(name), child = spawn(cmd, args, { stdio: 'inherit', detached: process.platform !== 'win32' });
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true;
    console.log('FAIL ' + name + ' TIMEOUT after ' + Math.round(ms / 1000) + ' s: killed pid ' + child.pid + ' and its children');
    killTree(child.pid, true); }, ms);
  child.on('error', e => { clearTimeout(timer); console.error(String(e)); process.exit(1); });
  child.on('close', code => { clearTimeout(timer); process.exit(timedOut ? 124 : code === null ? 1 : code); });
}
