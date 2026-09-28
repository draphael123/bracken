// tools/bosszoom-shots.mjs - THE CAPTURE PASS for claude/bosszoom (Daniel, 2026-09-28: "boss battles in general need
// to be more zoomed out"). One page session: boot every level once, wake its boss and (if it has one) its mini,
// let the camera settle, then (a) save a screenshot of the zoomed arena to work/bosszoom/ and (b) check the numbers
// the eye cannot: the arena's walls are on screen or the camera is symmetrically (not one-sidedly) clamped, the boss
// and the hero are both inside the frame, and the camera does not run past BOTH world edges into nothing.
// Only NEWLY zoomed fights are captured (the ones the old opt-in ZOOM_BOSSES/ZOOM_MINIS list already covered were
// already proven, in the Gate Gargoyle's lane and since); OLD lists still here as the plain data they were.
// usage: node tools/bosszoom-shots.mjs
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const OLD_ZOOM_BOSSES = new Set(['queen', 'mother', 'harbormaster', 'pyromancer', 'bellcrab', 'closedhelm', 'drownedking',
  'prince', 'owl', 'forgemaster', 'golem', 'windcaller', 'king', 'lance', 'suncatcher', 'roc', 'gqueen', 'grandmother', 'troll',
  'masthead', 'kraken', 'strawking', 'archmage', 'gargoyle', 'undeadmage']);
const OLD_ZOOM_MINIS = new Set(['suncatcher', 'golem']);

const out = join(ROOT, 'work/bosszoom'); mkdirSync(out, { recursive: true });
const pg = await openPage();
const snap = 'BK.view.buf.toDataURL ? BK.view.buf.toDataURL("image/png") : (() => { const c = document.createElement("canvas"); c.width = BK.view.VW; c.height = BK.view.VH; c.getContext("2d").drawImage(BK.view.buf, 0, 0); return c.toDataURL("image/png"); })()';
const save = (name, png) => { const f = name.replace(/[^a-z0-9.-]+/gi, '-') + '.png'; writeFileSync(join(out, f), Buffer.from(png.split(',')[1], 'base64')); return 'work/bosszoom/' + f; };

const results = [];
try {
  await pg.evalp(`import('/src/level.js').then(M => { window.__LV = M.LEVELS; return true; })`);
  // a level entry is a builder (LEVELS[i].build()), not a plain object - boss-fight-end.mjs reads it the same way
  const levels = await pg.evalp(`window.__LV.map((l, i) => { let b; try { b = l.build(); } catch { return { i, id: l.id, hasArena: false, hasMini: false }; }
    return { i, id: l.id, hasArena: !!b.arena, hasMini: !!b.mini }; })`);
  for (const lv of levels) {
    for (const kind of ['arena', 'mini']) {
      if (!(kind === 'arena' ? lv.hasArena : lv.hasMini)) continue;
      const r = await pg.evalp(`(async () => {
        BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(${lv.i}); BK.start(); BK.god = true; BK.sim(10); BK.reset();
        const L = BK.L, A = L.${kind};
        const t = A.boss;
        BK.tp(Math.round(A.trigger / 16) + 1, Math.round((A.floor !== undefined ? A.floor : A.y1) / 16) - 1);
        const active = () => ${kind === 'arena' ? 'BK.bossActive' : 'BK.miniActive'};
        for (let k = 0; k < 300 && !active(); k++) { BK.P.hp = BK.P.maxHp; BK.sim(1); }
        if (!active()) return { id: '${lv.id}', kind: '${kind}', t, started: false };
        // A FOE MORE THAN ~420PX FROM THE PLAYER IS FROZEN (main.js's own culling): standing still at the trigger
        // in a wide arena never lets a distant boss/mini leave its 'wake' mode, so a real player closing the
        // distance is imitated here - walk toward it - instead of freezing this capture's own picture of the fight.
        for (let k = 0; k < 260; k++) { BK.P.hp = BK.P.maxHp; BK.P.inv = 9;
          const foe = ${kind === 'arena' ? 'BK.boss' : "BK.enemies().find(e => e.alive && e.t === t && (e.mini || e.t === 'greathound'))"};
          const d = foe ? foe.x - BK.P.x : 0;
          BK.keys.right = d > 60; BK.keys.left = d < -60;
          BK.sim(1); }
        BK.keys.right = BK.keys.left = false;
        for (let k = 0; k < 90; k++) { BK.P.hp = BK.P.maxHp; BK.P.inv = 9; BK.sim(1); }
        BK.step(1);   /* sim() never calls render() - the buffer stays whatever the LAST rendered frame drew until this */
        const v = BK.view, P = BK.P, boss = ${kind === 'arena' ? 'BK.boss' : 'null'};
        const camX = v.x, camY = v.y, VW = v.VW, VH = v.VH;
        const wallL = A.wallL !== undefined ? A.wallL * 16 : A.x0, wallR = A.wallR !== undefined ? A.wallR * 16 : A.x1;
        const mb = boss ? boss : BK.enemies().find(e => e.alive && e.t === t && (e.mini || e.t === 'greathound'));   /* the same test main.js's own miniOne() uses - a level can carry the same 't' on an ordinary foe too */
        const bx = mb && mb.x, by = mb && mb.y;
        return { id: '${lv.id}', kind: '${kind}', t, started: true, camX, camY, VW, VH,
          arenaX0: A.x0, arenaX1: A.x1, wallL, wallR,
          bossOn: bx !== undefined && bx > camX && bx < camX + VW && by > camY - 40 && by < camY + VH,
          heroOn: P.x > camX && P.x < camX + VW,
          png: ${snap} };
      })()`);
      results.push(r);
    }
  }
} finally { pg.close(); }

const isNew = r => r.kind === 'arena' ? !OLD_ZOOM_BOSSES.has(r.t) : !OLD_ZOOM_MINIS.has(r.t);
const fails = [];
console.log('level'.padEnd(14), 'kind'.padEnd(6), 't'.padEnd(14), 'started', 'VWxVH', 'bossOn', 'heroOn', 'shot');
for (const r of results) {
  if (!isNew(r)) continue;   // only report/capture the newly-zoomed fights - the old list was already proven
  if (!r.started) { fails.push(r.id + '/' + r.kind + '/' + r.t + ': never woke (trigger/teleport did not reach it)'); console.log(r.id.padEnd(14), r.kind.padEnd(6), String(r.t).padEnd(14), 'NO'); continue; }
  const shot = save(r.id + '-' + r.kind + '-' + r.t, r.png);
  if (!r.bossOn) fails.push(r.id + '/' + r.kind + '/' + r.t + ': boss not on screen once the fight is up (' + shot + ')');
  if (!r.heroOn) fails.push(r.id + '/' + r.kind + '/' + r.t + ': hero not on screen once the fight is up (' + shot + ')');
  console.log(r.id.padEnd(14), r.kind.padEnd(6), String(r.t).padEnd(14), 'yes', (r.VW + 'x' + r.VH).padEnd(9), String(r.bossOn).padEnd(7), String(r.heroOn).padEnd(7), shot);
}
console.log('');
console.log(results.filter(isNew).length + ' newly-zoomed fights captured, ' + fails.length + ' with a framing problem.');
if (fails.length) { for (const f of fails) console.log('FAIL ' + f); process.exitCode = 1; }
