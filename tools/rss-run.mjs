// tools/rss-run.mjs - RUN ONE COMMAND AND LOG ITS TEST BROWSERS' MEMORY (claude/browserleak 11-12). A measuring wrapper, not a check.
//   node tools/rss-run.mjs <label> [--every=3] -- node tools/boss-rates.mjs 12 --ways=practiced --heroes=knight --seeds=12 --jobs=1
// Gives the child a private BRACKEN_RUN tag (it is in every profile folder name), samples that tag's whole Chrome tree every N s through tools/proc-rss.mjs (working set, what memguard judges),
// writes scratch-free CSV lines to stdout as '[rss] t=..s total=.. browser=.. renderers=.. biggest=..' and a PEAK line at the end. Works on any checkout that has proc-rss.mjs (copy it to compare master).
import { spawn } from 'child_process';
import { newRunTag } from './ports.mjs';
import { treeRss } from './proc-rss.mjs';
const argv = process.argv.slice(2), cut = argv.indexOf('--');
if (cut < 1 || cut === argv.length - 1) { console.log('usage: node tools/rss-run.mjs <label> [--every=3] -- <command...>'); process.exit(2); }
const label = argv[0], every = +((argv.slice(1, cut).find(a => a.startsWith('--every=')) || '--every=3').slice(8)) * 1000, cmd = argv.slice(cut + 1);
const tag = newRunTag(), t0 = Date.now(), peak = { total: 0, browser: 0, renderers: 0, biggest: 0 };
const child = spawn(cmd[0], cmd.slice(1), { stdio: 'inherit', env: { ...process.env, BRACKEN_RUN: tag } });
let stop = false;
const loop = (async () => { while (!stop) { const m = await treeRss('-' + tag + '-'); if (m) { for (const k of Object.keys(peak)) peak[k] = Math.max(peak[k], m[k]);
  console.log('[rss] ' + label + ' t=' + Math.round((Date.now() - t0) / 1000) + 's total=' + m.total + ' browser=' + m.browser + ' renderers=' + m.renderers + ' biggest=' + m.biggest + ' procs=' + m.n); }
  await new Promise(r => setTimeout(r, every)); } })();
const code = await new Promise(r => child.on('exit', c => r(c)));
stop = true; await loop;
console.log('[rss] PEAK ' + label + ' total=' + peak.total + ' browser=' + peak.browser + ' renderers=' + peak.renderers + ' biggest=' + peak.biggest + ' MB, wall ' + Math.round((Date.now() - t0) / 1000) + 's, exit ' + code);
process.exit(code || 0);
