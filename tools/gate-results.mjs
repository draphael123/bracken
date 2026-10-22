// One partition and one summary contract for the local gate and GitHub Actions. No game checks live here.
export function assignShards(names, timings, count) {
  if (!Number.isInteger(count) || count < 1 || count > 64) throw new Error('shard count must be 1..64');
  if (new Set(names).size !== names.length) throw new Error('duplicate check name');
  const load = Array(count).fill(0), assigned = new Map();
  const cost = name => Math.max(1, Number(timings[name]) || 30000);
  for (const name of [...names].sort((a, b) => cost(b) - cost(a) || a.localeCompare(b))) {
    const i = load.indexOf(Math.min(...load)); assigned.set(name, i + 1); load[i] += cost(name);
  }
  return assigned;
}

export function formatSummary(results, { allDetails = false, subset = false, label = 'A SUBSET', total = results.length } = {}) {
  const lines = [], failed = results.filter(r => !r.ok).length;
  for (const r of results) lines.push((r.ok ? ' ok  ' : 'FAIL ') + r.name.padEnd(14) + ' ' + String(r.ms).padStart(6) + 'ms  ' + r.last.slice(0, 110));
  for (const r of results) if (allDetails || !r.ok) {
    lines.push('\n---- ' + r.name + ' ----', (allDetails ? r.out : r.out.slice(-30)).map(line => '  ' + line).join('\n'));
  }
  lines.push(failed ? '\n' + failed + ' check(s) failed.' : subset
    ? '\n' + results.length + ' of ' + total + ' checks pass - ' + label + ', NOT THE SUITE.'
      + '\nRun `npm run check` with no arguments before a commit that matters, and before any deploy.'
    : '\nall checks pass.');
  return lines.join('\n');
}

export function mergeReports(plan, reports) {
  const answers = new Map(), seenShards = new Set(), infrastructure = [];
  for (const report of reports) {
    const id = report.shard?.[0];
    if (report.schema !== 1 || report.commit !== plan.commit || report.shard?.[1] !== plan.count || !plan.shards[id - 1])
      throw new Error('shard identity, schema or commit does not match the gate plan');
    if (seenShards.has(id)) throw new Error('duplicate shard ' + id);
    seenShards.add(id);
    const expected = plan.shards[id - 1].names;
    if (JSON.stringify(expected) !== JSON.stringify(report.expected)) throw new Error('shard ' + id + ' inventory differs from the plan');
    for (const r of report.results) {
      if (!expected.includes(r.name) || answers.has(r.name) || typeof r.ok !== 'boolean' || !Number.isFinite(r.ms) || !Array.isArray(r.out) || typeof r.last !== 'string')
        throw new Error('invalid, unexpected or duplicate check result: ' + r.name);
      answers.set(r.name, r);
    }
    if (!report.complete) infrastructure.push('shard ' + id + ' ended without its completion receipt');
  }
  for (let id = 1; id <= plan.count; id++) if (!seenShards.has(id)) infrastructure.push('shard ' + id + ' artifact is missing');
  const results = plan.names.map(name => answers.get(name) || { name, ok: false, ms: 0,
    last: 'NO VERDICT: shard interrupted or artifact missing', out: ['This check did not complete. The release gate is incomplete.'] });
  if (infrastructure.length) results.push({ name: 'gate-infrastructure', ok: false, ms: 0,
    last: infrastructure.join('; '), out: infrastructure });
  return results;
}

export function annotations(results) {
  const escape = s => s.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
  const failed = results.filter(r => !r.ok);
  if (!failed.length) return [];
  /* GitHub caps errors per STEP. One annotation always carries EVERY failing name; details are packed into
     at most eight additional annotations instead of losing failures after the first few checks. */
  const overview = failed.length + ' check(s) failed.\n' + failed.map(r => 'FAIL ' + r.name + ' ' + r.last.slice(0, 110)).join('\n');
  const details = failed.map(r => '---- ' + r.name + ' ----\n' + r.out.slice(-30).map(s => '  ' + s).join('\n')).join('\n\n');
  const chunks = []; let part = '', bytes = 0;
  for (const c of details) { const n = Buffer.byteLength(c); if (bytes + n > 48000) { chunks.push(part); part = ''; bytes = 0; } part += c; bytes += n; }
  if (part) chunks.push(part);
  if (chunks.length > 8) { chunks.length = 8; chunks[7] += '\nFurther details are retained in gate-summary.txt and the job summary.'; }
  return ['::error title=release gate::' + escape(overview), ...chunks.map((s, i) =>
    '::error title=check detail ' + (i + 1) + '/' + chunks.length + '::' + escape(s))];
}
