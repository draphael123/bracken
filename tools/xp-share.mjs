// tools/xp-share.mjs - node-only check of src/xp-share.js (claude/coopai): who is paid when a placed foe falls in co-op
import { hitRecord, payeesOf } from '../src/xp-share.js';
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log('  FAIL ' + m); } else console.log('  ok   ' + m); };
const p1 = { n: 1 }, seat = { n: 2, prof: { view: {} } }, ai = { n: 3, ai: true }, gone = { n: 4, prof: {} };
const party = [p1, seat, ai];
let e = {}; hitRecord(e, seat); hitRecord(e, seat); ok(e.hitBy.length === 1, 'a hitter is recorded once');
ok(payeesOf(e, p1, party).length === 2 && payeesOf(e, p1, party).includes(seat) && payeesOf(e, p1, party).includes(p1), 'seat hit + P1 killed: both paid');
e = {}; hitRecord(e, seat); const w = payeesOf(e, seat, party); ok(w.length === 1 && w[0] === seat, 'only the seat hit and killed: only he is paid (P1 did nothing)');
e = {}; hitRecord(e, ai); const a = payeesOf(e, ai, party); ok(a.length === 1 && a[0] === p1, 'a default AI kill folds into player one');
e = {}; hitRecord(e, ai); hitRecord(e, p1); ok(payeesOf(e, ai, party).length === 1, 'AI + P1 both hit: P1 once (no double pay)');
e = {}; hitRecord(e, gone); ok(payeesOf(e, p1, party).length === 1 && payeesOf(e, p1, party)[0] === p1, 'a hitter who left the party is not paid');
ok(payeesOf({}, null, party)[0] === p1, 'no hitters, no killer: player one (the old path)');
ok(payeesOf({}, null, []).length === 0, 'no party: nobody');
console.log(fails.length ? 'FAIL ' + fails.length : 'ALL OK'); process.exit(fails.length ? 1 : 0);
