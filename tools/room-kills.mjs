// tools/room-kills.mjs - A FOE THE ROOM KILLS GOES DOWN (claude/flotilla4, Daniel 10-27: "many foes, once dead, don't disappear - they stand there, no attacks").
// The page test for every common foe on the build, killed by each of the ROOM's blows - not the hero's:
//   hurt     an untagged hurt (what a broadside ball, a crusher, a falling rock, a loose gun, a rod's bolt or a fire hand to hurtEnemy)
//   explode  a blast (a keg, a struck-back keg, a bomb: main.js explode)
//   ball     a round shot down the deck (main.js updateBalls: the deck guns, a ball through a door)
// For each level, each source and each foe kind (t + its reskin + elite) the first one placed is hit until it dies (a cap of 60 blows) and the test asserts:
//   (1) it is DEAD: never left alive at hp <= 0 (the standing-dead state), and out of the living draw;
//   (2) its BODY GOES DOWN: every common body says how (c.fall: its own case, a death frame, or THE COMMON FALL - tipped onto its back). A body with no c.fall would stand
//       upright in its last frame where it died: the bug. A 'tip' body has turned past 1 rad by 1.5 s (hitstops and level-up cards included);
//   (3) no page error, and after every kill in the level nothing is left alive at hp <= 0.
// A foe the room cannot hurt by design (under sand, dim fog, a wisp popped and re-formed...) is listed as IMMUNE, never failed.
// usage: PORT=6616 node tools/room-kills.mjs [ids,comma] [--sources=hurt,explode,ball]
//        ROOMKILLS_ONLY=flotilla,hurricane narrows too. One page every 6 levels, a hard limit per level (tools/sweep-pages.mjs).
import { sweepLevels } from './sweep-pages.mjs';
import { pathToFileURL } from 'url';
import { join } from 'path';
import { ROOT } from './cdp.mjs';
const arg = process.argv.slice(2), only = ((arg.find(a => !a.startsWith('--')) || process.env.ROOMKILLS_ONLY || '')).split(',').filter(Boolean);
const SOURCES = ((arg.find(a => a.startsWith('--sources=')) || '--sources=hurt,explode,ball').slice(10)).split(',');
const { LEVELS } = await import(pathToFileURL(join(ROOT, 'src/level.js')).href).catch(() => ({ LEVELS: null }));
const ALL = LEVELS ? LEVELS.map(l => l.id) : null;
if (!ALL && !only.length) { console.log('FAIL room-kills: src/level.js did not load in Node - name the levels'); process.exit(1); }
const IDS = only.length ? only : ALL;
const code = id => `(async()=>{ const { LEVELS } = await import('/src/level.js'); const li = LEVELS.findIndex(l => l.id === ${JSON.stringify(id)}); if (li < 0) return { skip: 'no level' };
  BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true }); const rows = [], errs = [];
  const SKIP = new Set(['dummy', 'folk', 'fisher', 'magechase']);
  const go = k => { for (let i = 0; i < k; i++) { if (BK.state !== 'play') BK.state = 'play'; BK.sim(1); } };   /* a level-up card off a kill pauses the world: the room's kills are watched in play */
  const kindOf = e => e.t + (e.cnSkin ? ':' + e.cnSkin : '') + (e.elite ? '*' : '');
  for (const src of ${JSON.stringify(SOURCES)}) {
    try { BK.load(li); BK.state = 'play'; BK.god = true; BK.sim(2); } catch (x) { errs.push(src + ' load: ' + String(x).slice(0, 120)); continue; }
    const B = BK.boss, seen = new Set(), list = [];
    for (const e of BK.enemies()) { if (!e.alive || e.maxHp || e.mini || e.xpRole === 'mini' || e === B || e.harmless || e.trainer || SKIP.has(e.t)) continue; const k = kindOf(e); if (seen.has(k)) continue; seen.add(k); list.push(e); }
    for (const e of list) { const row = { src, k: kindOf(e), errs: [] };
      try {
        const hp0 = e.hp, c0 = BK.corpses().length; let n = 0;
        for (; n < 60 && e.alive; n++) {
          if (src === 'hurt') BK.env().hurt(e, 80, e.x + 30);
          else if (src === 'explode') BK.env().explode(e.x, e.y - Math.min(10, (e.h || 16) / 2), 30);
          else BK.env().ball({ x: e.x + 2, y: e.y - Math.min(6, (e.h || 16) / 2), vx: -520 });
          go(src === 'ball' ? 3 : 1); if (e.alive) go(12); }
        row.n = n;
        if (e.alive) { row.res = e.hp >= hp0 ? 'IMMUNE' : 'SURVIVED'; if (e.hp <= 0) row.errs.push('left ALIVE at hp ' + e.hp + ' (the standing dead)'); }
        else { const cs = BK.corpses().slice(c0); const c = cs.find(q => q.body) || null;   /* its own body (main.js spawnCorpse marks it): a cap, a horse or a plate thrown beside it is not */
          row.res = c ? 'corpse:' + (c.fall || 'NONE') : 'gone';
          if (c) { if (!c.fall) row.errs.push('its body has no c.fall: it would stand upright where it died (frame ' + c.frame + ', rot ' + c.rot.toFixed(2) + ')');
            if (c.fall === 'tip') { go(90); if (BK.corpses().includes(c) && Math.abs(c.rot) < 1.0) row.errs.push('a tipped body still upright at 1.5 s (rot ' + c.rot.toFixed(2) + ')'); } } }
      } catch (x) { row.errs.push('THREW ' + String(x).slice(0, 140)); }
      rows.push(row); }
    go(60); for (const e of BK.enemies()) if (e.alive && !(e.hp > 0) && !e.maxHp && e !== BK.boss && !e.trainer && e.t !== 'dummy') errs.push(src + ': ' + kindOf(e) + ' left alive at hp ' + e.hp);
  }
  return { rows, errs }; })()`;
let bad = 0, immune = 0, tipped = 0, n = 0; const pageErrs = new Set();
const got = await sweepLevels(IDS, async (pg, id, ms) => { const x = await pg.evalp(code(id), ms); for (const e of pg.errors.splice(0, 3)) pageErrs.add(id + ': ' + String(e).split('\n')[0]); return x; }, { label: 'room-kills', chunk: 6, perLevelMs: +(process.env.SWEEP_LEVEL_MS || 180000) });
for (const g of got) {
  if (g.error) { bad++; console.log('  FAIL ' + g.id.padEnd(16) + g.error); continue; }
  const r = g.result || {}; if (r.skip) { console.log('  skip ' + g.id + ' ' + r.skip); continue; }
  const fails = (r.rows || []).filter(q => q.errs.length); for (const q of r.rows || []) { n++; if (q.res === 'IMMUNE') immune++; if (q.res === 'corpse:tip') tipped++; }
  for (const q of fails) { bad++; console.log('  FAIL ' + g.id.padEnd(16) + (q.src + ' ' + q.k).padEnd(34) + q.errs.join('; ')); }
  for (const e of r.errs || []) { bad++; console.log('  FAIL ' + g.id.padEnd(16) + e); }
  const im = (r.rows || []).filter(q => q.res === 'IMMUNE' || q.res === 'SURVIVED').map(q => q.src + ' ' + q.k + ' ' + q.res);
  console.log((fails.length || (r.errs || []).length ? '  red  ' : '  ok   ') + g.id.padEnd(16) + (r.rows || []).length + ' kills' + (im.length ? '  (not killed by the room: ' + im.slice(0, 6).join(', ') + (im.length > 6 ? ' ...' : '') + ')' : ''));
}
if (pageErrs.size) { bad++; console.log('page errors: ' + [...pageErrs].slice(0, 5).join(' | ')); }
console.log(bad ? bad + ' FAILED  room-kills' : 'ok  room-kills  ' + n + ' room kills over ' + IDS.length + ' levels: every one dead and down (' + tipped + ' by the common fall, ' + immune + ' immune by design)');
process.exit(bad ? 1 : 0);
