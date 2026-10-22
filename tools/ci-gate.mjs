// Plan the complete suite, merge immutable shard receipts, or compare the result with a serial log.
import { spawnSync } from 'node:child_process';
import { appendFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { annotations, assignShards, formatSummary, mergeReports } from './gate-results.mjs';
const root = fileURLToPath(new URL('..', import.meta.url)), argv = process.argv.slice(2);
const opt = (key, fallback) => { const i = argv.indexOf('--' + key); return i < 0 ? fallback : argv[i + 1]; };
const json = p => JSON.parse(readFileSync(p, 'utf8'));
const save = (p, data) => { mkdirSync(dirname(resolve(p)), { recursive: true }); writeFileSync(p, data); };
const run = (...args) => { const r = spawnSync(...args, { cwd: root, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(r.stderr || r.error?.message || 'command failed'); return r.stdout.trim(); };

switch (argv[0]) {
  case 'plan': {
    const count = +opt('shards', '16'), names = JSON.parse(run(process.execPath, ['tools/check.mjs', '--list']));
    const timings = json(join(root, 'tools/check-timings.json')), assigned = assignShards(names, timings, count);
    const shards = Array.from({ length: count }, (_, i) => ({ id: i + 1, names: names.filter(n => assigned.get(n) === i + 1) }));
    for (const shard of shards) shard.estimatedMs = shard.names.reduce((t, n) => t + (timings[n] || 30000), 0);
    const plan = { schema: 1, commit: run('git', ['rev-parse', 'HEAD']), count, names, shards };
    save(opt('out', 'gate-plan.json'), JSON.stringify(plan, null, 2) + '\n');
    const matrix = JSON.stringify({ include: shards.map(s => ({ id: s.id })) });
    if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, 'matrix=' + matrix + '\ncommit=' + plan.commit + '\ncount=' + count + '\n');
    console.log(names.length + ' checks at ' + plan.commit);
    for (const s of shards) console.log('shard ' + s.id + ': ' + s.names.length + ' checks, estimated ' + (s.estimatedMs / 60000).toFixed(1) + ' min');
    break;
  }
  case 'merge': {
    const plan = json(opt('plan', 'gate-plan.json')), dir = opt('dir', 'gate-data');
    const files = [];
    const walk = d => { for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name); if (e.isDirectory()) walk(p); else if (/^shard-\d+\.json$/.test(e.name)) files.push(p);
    } }; try { walk(dir); } catch (e) { if (e.code !== 'ENOENT') throw e; }
    let results;
    try { results = mergeReports(plan, files.map(json)); }
    catch (e) { results = mergeReports(plan, []); results.at(-1).out.push('Rejected receipt: ' + e.message); }
    const summary = formatSummary(results) + '\n';
    save(opt('out', 'gate-summary.txt'), summary);
    save(opt('results', 'gate-results.json'), JSON.stringify({ commit: plan.commit, results }, null, 2) + '\n');
    console.log(summary);
    for (const a of annotations(results)) console.log(a);
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY,
      '## Release gate\n\nCommit: `' + plan.commit + '`\n\n```text\n' + summary.replace(/```/g, '~~~') + '```\n');
    process.exitCode = results.some(r => !r.ok) ? 1 : 0;
    break;
  }
  case 'compare': {
    const serial = readFileSync(opt('serial', ''), 'utf8'), gate = json(opt('results', 'gate-results.json'));
    if (!/^(?:all checks pass\.|\d+ check\(s\) failed\.)\s*$/m.test(serial) || /NOT THE SUITE/.test(serial))
      throw new Error('serial log is incomplete or is a subset');
    const verdicts = new Map();
    for (const m of serial.matchAll(/^( ok  |FAIL )(\S+)\s+\d+ms\s/gm)) {
      if (verdicts.has(m[2])) throw new Error('duplicate serial verdict ' + m[2]); verdicts.set(m[2], m[1] !== 'FAIL ');
    }
    const differences = [];
    for (const r of gate.results) {
      if (!verdicts.has(r.name)) differences.push('CI only: ' + r.name);
      else if (verdicts.get(r.name) !== r.ok) differences.push(r.name + ': local=' + (verdicts.get(r.name) ? 'PASS' : 'FAIL') + ' CI=' + (r.ok ? 'PASS' : 'FAIL'));
      verdicts.delete(r.name);
    }
    for (const name of verdicts.keys()) differences.push('serial only: ' + name);
    console.log(differences.length ? differences.join('\n') : gate.results.length + ' checks: identical serial and CI verdicts');
    process.exitCode = differences.length ? 1 : 0;
    break;
  }
  default: throw new Error('usage: node tools/ci-gate.mjs plan|merge|compare [options]');
}
