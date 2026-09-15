// tools/audit-touch.mjs — WHICH BODIES HURT ON TOUCH. Findings only; it changes nothing.
// updatePlayer's contact pass (the damagePlayer call beside HOP[...].dmg) hurts the hero for touching any creature not on its
// "their damage comes from their attacks" list. That is damage with no windup and no mark. Each creature is stood up alone in its own
// level (a boss in its arena), every other creature is removed EVERY frame (a boss's pups, adds and spawns would otherwise be counted as
// its own touch), and the hero is pinned inside its body for four seconds with his invulnerability reset every frame. A hit counts only
// when the game's own log says the contact line threw it and the creature it names is the one under test.
//   SCRATCH=<dir with habitats.json from audit-hitboxes> PORT=5908 node tools/audit-touch.mjs      -> SCRATCH/touch.json and a list
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { openAudit, SCRATCH, ROOT } from './audit-lib.mjs';

const hab = JSON.parse(readFileSync(join(SCRATCH, 'habitats.json'), 'utf8'));
const contactLine = readFileSync(join(ROOT, 'src/main.js'), 'utf8').split('\n').findIndex(l => /damagePlayer\(e\.x, e\.t === 'hopper'/.test(l)) + 1;
const SKIP = new Set(['folk', 'dummy', 'bearer', 'pad', 'deco', 'npc', 'sign', 'chest', 'fisher', 'squirrel', 'bale', 'fox', 'hare']);

async function TOUCH(o) {
  const A = window.__AUD, BK = window.BK, P = BK.P, rows = [];
  for (const key of o.keys) { const t = key.split(':')[0];
    let e = null; try { await A.stand(t, o.hab[key]); e = A.e; } catch (err) { rows.push({ key, skipped: err.message.slice(0, 80) }); continue; }
    if (!e || e.t !== t) { rows.push({ key, skipped: 'did not spawn' }); continue; }
    let touch = 0, dmg = null, other = 0, harmless = !!e.harmless;
    for (let f = 0; f < 240 && e.alive; f++) {
      for (const q of BK.enemies()) if (q !== e && q.alive) q.alive = false;
      A.pin(e.x, e.y, 1); BK.log.length = 0; BK.sim(1);
      for (const l of BK.log) if (l.k === 'dmgP') { if (l.who === t && A.stackLine(l.stack) === o.contactLine) { touch++; dmg = l.dmg; } else other++; } }
    rows.push({ key, touch, dmg, other, harmless });
    if (rows.length % 20 === 0) await new Promise(r => setTimeout(r, 0)); }
  return rows;
}

const pg = await openAudit();
try {
  await pg.evalp('window.__AUD.HAB = ' + JSON.stringify(hab));
  const keys = Object.keys(hab).filter(k => !SKIP.has(k.split(':')[0]) && (hab[k].ent || hab[k].arena || hab[k].mini)).sort();
  const rows = await pg.evalp('(' + TOUCH.toString() + ')(' + JSON.stringify({ keys, hab, contactLine }) + ')');
  writeFileSync(join(SCRATCH, 'touch.json'), JSON.stringify({ contactLine, rows }, null, 1));
  const hurt = rows.filter(r => r.touch > 0).sort((a, b) => b.touch - a.touch);
  console.log('contact line main.js:' + contactLine + '; ' + rows.filter(r => !r.skipped).length + ' creatures stood inside; ' + hurt.length + ' hurt on touch:');
  console.log(hurt.map(r => r.key + ' (' + r.touch + ' hits, ' + r.dmg + ' dmg)').join(', '));
  if (pg.errors.length) console.log('page errors: ' + [...new Set(pg.errors)].slice(0, 3).join(' | ').slice(0, 300));
} finally { pg.close(); }
