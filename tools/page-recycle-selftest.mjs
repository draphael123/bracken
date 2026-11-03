// tools/page-recycle-selftest.mjs - NO BROWSER (claude/botmem): the recycler's counting, its one labelled rerun, INFRA-KILLED, and infra-kill.mjs's kill-log reader.
import { writeFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
process.env.BRACKEN_KILLLOG = join(tmpdir(), 'bracken-selftest-kills-' + process.pid + '.jsonl');
const { recycler } = await import('./page-recycle.mjs'), { killedByGuard, infraWhy } = await import('./infra-kill.mjs');
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.log('FAIL ' + m); } };
let opened = 0; const mk = () => { const p = { n: ++opened, errors: [], infra: false, closed: false, killedByGuard: () => null, close: async () => { p.closed = true; } }; return p; };
const quiet = { log: () => {} };
/* 1. recycle every 6 loads: 14 single loads -> pages opened at loads 1, 7, 13 */
let rc = recycler({ open: async () => mk(), every: 6, ...quiet }); const seen = [];
for (let i = 0; i < 14; i++) await rc.run(async p => { seen.push(p.n); return {}; }, 1);
ok(JSON.stringify([...new Set(seen)]) === '[1,2,3]' && seen.filter(n => n === 1).length === 6, 'recycles every 6 loads: ' + seen.join(','));
/* 2. one call of 6 loads after another: each gets its own page; a 12-load call is not split but still gets a fresh page */
opened = 0; rc = recycler({ open: async () => mk(), every: 6, ...quiet }); const s2 = []; for (let i = 0; i < 3; i++) await rc.run(async p => { s2.push(p.n); return {}; }, 6); ok(s2.join() === '1,2,3', 'one 6-load call per page: ' + s2);
/* 3. every=0 never recycles */
opened = 0; rc = recycler({ open: async () => mk(), every: 0, ...quiet }); for (let i = 0; i < 20; i++) await rc.run(async () => ({}), 1); ok(opened === 1, 'every=0 keeps one page');
/* 4. a killed page: rerun once on a fresh page, labelled */
opened = 0; rc = recycler({ open: async () => mk(), every: 6, ...quiet }); let calls = 0;
const r4 = await rc.run(async p => { calls++; if (calls === 1) { p.infra = true; throw new Error('the page CRASHED (Inspector.targetCrashed)'); } return { v: p.n }; }, 1);
ok(r4.infraRetry === true && r4.v === 2 && rc.stats().retries === 1, 'infra death -> one labelled rerun on a new page');
/* 5. killed twice -> INFRA-KILLED, not a red; a plain error is thrown as is and never retried */
opened = 0; rc = recycler({ open: async () => mk(), every: 6, ...quiet }); let e5 = null;
try { await rc.run(async () => { throw new Error('the page connection closed'); }, 1); } catch (e) { e5 = e; }
ok(e5 && e5.infraKilled && /^INFRA-KILLED/.test(e5.message), 'two deaths -> INFRA-KILLED'); 
let plain = 0; rc = recycler({ open: async () => mk(), every: 6, ...quiet }); let e6 = null; try { await rc.run(async () => { plain++; throw new Error('BK is not defined'); }, 1); } catch (e) { e6 = e; }
ok(plain === 1 && e6 && !e6.infraKilled, 'a code error is not retried');
/* 6. the kill log */
const now = Date.now(); writeFileSync(process.env.BRACKEN_KILLLOG, JSON.stringify({ t: now - 5000, pid: 1, profile: 'bracken-look-aaaaaa-bbbbbb', lane: 'aaaaaa', mb: 3100, free: 700, why: 'cap' }) + '\nnot json\n' + JSON.stringify({ t: now - 1000, pid: 2, profile: 'bracken-look-cccccc', lane: 'bracken-look-cccccc', mb: 1800, free: 600, why: 'floor' }) + '\n');
ok(killedByGuard({ profile: 'bracken-look-cccccc', sinceMs: now - 3000 })?.pid === 2, 'kill found by profile');
ok(!killedByGuard({ profile: 'bracken-look-cccccc', sinceMs: now }), 'kill before the tool started is ignored');
ok(killedByGuard({ tag: 'aaaaaa', sinceMs: now - 9000 })?.pid === 1, 'kill found by lane tag');
process.env.BRACKEN_RUN = 'aaaaaa';
ok(/memguard killed pid 1/.test(infraWhy(['x', 'the page CRASHED (Inspector.targetCrashed)'], now - 9000) || ''), 'infraWhy: kill + crash message');
ok(infraWhy(['FAIL x TIMEOUT after 900 s'], now - 9000) === null, 'a timeout is never infra');
ok(infraWhy(['expected 3 got 4'], now - 9000) === null, 'an assertion is never infra');
rmSync(process.env.BRACKEN_KILLLOG, { force: true });
console.log(bad ? bad + ' selftest failure(s)' : 'page-recycle selftest ok');
process.exitCode = bad ? 1 : 0;
