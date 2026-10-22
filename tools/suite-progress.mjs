// Atomic, source-bound checkpoints. Incomplete attempts never become game verdicts; existing FAIL verdicts survive resume.
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { closeSync, existsSync, mkdirSync, openSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { formatSummary } from './gate-results.mjs';

export function sourceIdentity(root) {
  const git = args => { const r = spawnSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64 << 20 });
    if (r.status !== 0) throw new Error('cannot identify source: ' + (r.stderr || r.error?.message)); return r.stdout; };
  const commit = git(['rev-parse', 'HEAD']).trim(), hash = createHash('sha256');
  hash.update(git(['diff', '--binary', 'HEAD', '--', 'src', 'tools', 'index.html', 'serve.mjs', 'package.json', 'assets']));
  for (const f of git(['ls-files', '--others', '--exclude-standard', '-z', '--', 'src', 'tools']).split('\0').filter(Boolean).sort())
    hash.update(f).update(readFileSync(join(root, f)));
  return { commit, dirtyHash: hash.digest('hex') };
}

export function openProgress(path, { identity, expected, shard, selection, resume = false, run, startedAt }) {
  path = resolve(path); mkdirSync(dirname(path), { recursive: true });
  const lock = path + '.lock';
  if (existsSync(lock)) {
    const old = JSON.parse(readFileSync(lock, 'utf8'));
    let alive = true; try { process.kill(old.pid, 0); } catch (e) { if (e.code === 'ESRCH') alive = false; }
    if (alive) throw new Error('progress is in use by PID ' + old.pid + ': ' + path);
    unlinkSync(lock);
  }
  const fd = openSync(lock, 'wx'); writeFileSync(fd, JSON.stringify({ pid: process.pid })); closeSync(fd);
  const close = () => { try { unlinkSync(lock); } catch {} };
  try {
    let state = { schema: 1, ...identity, expected, shard, selection, run, startedAt, complete: false, results: [], interrupted: [] };
    if (resume) {
      state = JSON.parse(readFileSync(path, 'utf8'));
      for (const key of ['schema', 'commit', 'dirtyHash', 'expected', 'shard', 'selection']) {
        const want = key === 'schema' ? 1 : key in identity ? identity[key] : { expected, shard, selection }[key];
        if (JSON.stringify(state[key]) !== JSON.stringify(want)) throw new Error('resume rejected: ' + key + ' changed');
      }
      const names = new Set();
      for (const r of state.results) {
        if (!expected.includes(r.name) || names.has(r.name) || typeof r.ok !== 'boolean' || !Number.isFinite(r.ms) || !Array.isArray(r.out) || typeof r.last !== 'string')
          throw new Error('resume rejected: invalid/duplicate verdict ' + r.name);
        names.add(r.name);
      }
    } else if (existsSync(path)) throw new Error('progress already exists; use --resume or a fresh path: ' + path);
    delete state.fatal;
    const completed = new Map(state.results.map(r => [r.name, r])), attempts = new Map((state.interrupted || []).map(r => [r.name, r]));
    const atomic = (file, data) => { writeFileSync(file + '.tmp', data); renameSync(file + '.tmp', file); };
    const snapshot = (active = null) => {
      state.results = expected.filter(n => completed.has(n)).map(n => completed.get(n));
      state.interrupted = [...attempts.values()]; state.active = active;
      state.complete = state.results.length === expected.length; state.updatedAt = new Date().toISOString();
      atomic(path, JSON.stringify(state) + '\n');
      const pending = expected.filter(n => !completed.has(n));
      atomic(path + '.summary.txt', formatSummary(state.results, { subset: !!pending.length || !!selection.length || !!shard,
        label: pending.length ? 'INCOMPLETE' : shard ? 'SHARD ' + shard.join('/') : 'A SUBSET (' + selection.join(', ') + ')', total: expected.length })
        + (pending.length ? '\nINCOMPLETE: ' + pending.length + ' check(s) have no verdict: ' + pending.join(', ') : '') + '\n');
    };
    snapshot();
    return { path, state, completed, snapshot, close, done(r) {
      if (r.interrupted) attempts.set(r.name, r); else { completed.set(r.name, r); attempts.delete(r.name); }
      snapshot();
    } };
  } catch (e) { close(); throw e; }
}
