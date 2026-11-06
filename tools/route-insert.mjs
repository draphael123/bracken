// tools/route-insert.mjs - THE ONE ROAD-INSERT MIGRATION TEST (plan-desert-1105 s3i; claude/greatdune 11-06). Node only: no page, no port, no Chrome.
// For each desert insert (carpet / greatdune / kingspyramid / airship - src/route-insert.js ROAD_INSERTS), made LIVE on a copy of master's LEVELS:
//   A  a save past the insert keeps everything open: for a save at EVERY level of the campaign (that level's whole needs chain cleared), every level that was
//      open before the insert went live is open after it (applyInserts + roadMigrate) - none relocks;
//   B  the new level shows UNPLAYED, not a wall: for a save that had cleared `after`, the insert is open and has no progress;
//   C  a fresh profile walks it: `before` stays shut until the insert is cleared, then opens;
//   D  a save that clears `after` only after the migration ran walks it too (the migration is once, not a standing key);
//   E  the migration is idempotent, and NOT LIVE it is inert (LEVELS and PROG untouched - the flag-off game is master's);
//   F  the wiring is in place: levelLocked reads roadKept, progDefaults calls roadMigrate, level.js calls applyInserts; appending keeps every index.
// The model of the lock is the needs clause of main.js levelLocked (src/route-insert.js needsOpen); the per-level extra rules (crownOpen and the rest) are
// other roads' and are not in it.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const { install } = await import('./node-canvas.mjs'); install();
delete process.env.GD; delete process.env.KP;
const { LEVELS } = await import('../src/level.js');
const RI = await import('../src/route-insert.js');

const master = LEVELS.map(l => ({ id: l.id, needs: l.needs || null, hidden: !!l.hidden }));
const ids = new Set(master.map(l => l.id));
ok(RI.ROAD_INSERTS.map(i => i.id).join() === 'carpet,greatdune,kingspyramid,airship', 'the four desert inserts, in road order');
ok(RI.ROAD_INSERTS.every(i => !i.live), 'on this branch none is live (each waits for its art)');
ok(RI.ROAD_INSERTS.every(i => ids.has(i.after) || RI.ROAD_INSERTS.some(j => j.id === i.after)) && RI.ROAD_INSERTS.every(i => !i.before || ids.has(i.before)), 'every after / before is a level (or an earlier insert)');

const clone = () => master.map(l => ({ ...l }));
const chain = (rows, id) => { const out = []; let cur = rows.find(l => l.id === id); const seen = new Set(); while (cur && cur.needs && !seen.has(cur.needs)) { seen.add(cur.needs); out.push(cur.needs); cur = rows.find(l => l.id === cur.needs); } return out; };
const saveAt = (rows, id) => { const P = {}; for (const k of chain(rows, id)) P[k] = { cleared: true }; return P; };
const openSet = (rows, P) => new Set(rows.filter(l => RI.needsOpen(P, l)).map(l => l.id));
const live = ins => [{ ...ins, live: true }];

/* E (inert): not live, nothing moves */
{ const rows = clone(), before = JSON.stringify(rows), P = saveAt(rows, 'sealedpyramid'), p0 = JSON.stringify(P);
  ok(RI.applyInserts(rows).length === 0 && JSON.stringify(rows) === before, 'E: not live - applyInserts changes no row');
  ok(RI.roadMigrate(P).length === 0 && JSON.stringify(P) === p0, 'E: not live - roadMigrate writes nothing into the save'); }

for (const ins0 of RI.ROAD_INSERTS) {
  const ins = live(ins0)[0], tag = ins.id;
  /* a copy of master's rows with the insert appended (as its lane appends it: last, so no index moves); an earlier insert it hangs off is appended too */
  const base = clone();
  for (const j of RI.ROAD_INSERTS) { if (j.id === ins.id) break; if (!ids.has(j.id)) base.push({ id: j.id, needs: j.after, hidden: false }); }
  if (!base.some(l => l.id === ins.id)) base.push({ id: ins.id, needs: ins.after, hidden: false });
  const rows = base.map(l => ({ ...l }));
  ok(RI.applyInserts(rows, [ins]).join() === tag, tag + ': applyInserts rewires it');
  ok(rows.find(l => l.id === tag).needs === ins.after && (!ins.before || rows.find(l => l.id === ins.before).needs === tag), tag + ': it needs ' + ins.after + (ins.before ? ', ' + ins.before + ' needs it' : ' (it ends the road: nothing after it moves)'));
  ok(rows.slice(0, master.length).every((l, i) => l.id === master[i].id), tag + ': appended - every old index keeps its level');
  /* A: a save at every level keeps everything that was open */
  let worst = null, saves = 0;
  for (const at of base.map(l => l.id)) {
    const P0 = saveAt(base, at); if (!Object.keys(P0).length) continue; saves++;
    const was = openSet(base, P0), P = JSON.parse(JSON.stringify(P0)); RI.roadMigrate(P, [ins]); const now = openSet(rows, P);
    const lost = [...was].filter(id => !now.has(id)); if (lost.length && !worst) worst = at + ' loses ' + lost.join(',');
  }
  ok(!worst, tag + ': A - a save at each of ' + saves + ' levels keeps every level it had open' + (worst ? ' - ' + worst : ''));
  /* B: past `after`, the insert is open and unplayed */
  { const P = saveAt(base, ins.before || tag); P[ins.after] = { cleared: true }; RI.roadMigrate(P, [ins]);
    ok(RI.needsOpen(P, rows.find(l => l.id === tag)) && !P[tag], tag + ': B - past ' + ins.after + ' the new level is open and unplayed, not a wall');
    if (ins.before) ok(RI.needsOpen(P, rows.find(l => l.id === ins.before)) && P.roadOpen && P.roadOpen[ins.before], tag + ': B - and ' + ins.before + ' stays open (kept by the migration)'); }
  /* C: a fresh profile walks it */
  if (ins.before) { const P = {}; RI.roadMigrate(P, [ins]); P[ins.after] = { cleared: true };
    ok(!RI.needsOpen(P, rows.find(l => l.id === ins.before)), tag + ': C - a fresh profile that clears ' + ins.after + ' finds ' + ins.before + ' shut');
    P[tag] = { cleared: true }; ok(RI.needsOpen(P, rows.find(l => l.id === ins.before)), tag + ': C - ...until it clears ' + tag); }
  /* D: cleared `after` only after the migration -> walks it; E: idempotent */
  if (ins.before) { const P = saveAt(base, ins.after); RI.roadMigrate(P, [ins]); const snap = JSON.stringify(P); RI.roadMigrate(P, [ins]);
    ok(JSON.stringify(P) === snap, tag + ': E - the migration runs once (idempotent)');
    P[ins.after] = { cleared: true }; ok(!RI.needsOpen(P, rows.find(l => l.id === ins.before)), tag + ': D - ' + ins.after + ' cleared after the migration: ' + ins.before + ' waits for ' + tag); }
}

/* F: the wiring (text, so the test fails if a hunk is lost in a merge) */
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), lvl = readFileSync(new URL('../src/level.js', import.meta.url), 'utf8');
const ll = main.slice(main.indexOf('const levelLocked = lv =>')); const llLine = ll.slice(0, ll.indexOf('\n'));
ok(/lv\.needs && !\(PROG\[lv\.needs\] && PROG\[lv\.needs\]\.cleared\) && !\(PROG\[lv\.id\] && PROG\[lv\.id\]\.cleared\) && !roadKept\(PROG, lv\)/.test(llLine), 'F: levelLocked\'s needs clause reads roadKept');
const pd = main.slice(main.indexOf('function progDefaults()')); ok(/roadMigrate\(PROG\)/.test(pd.slice(0, pd.indexOf('\nfunction '))), 'F: progDefaults calls roadMigrate(PROG)');
ok(/\napplyInserts\(LEVELS\);/.test(lvl) && lvl.indexOf('applyInserts(LEVELS)') > lvl.indexOf("LEVELS.push({ id: 'arena_yard'"), 'F: level.js calls applyInserts(LEVELS) after the last row');
console.log(`road-insert: ${n} ok`);
