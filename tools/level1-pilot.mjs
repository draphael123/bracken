/* tools/level1-pilot.mjs - THE LEVEL-1 NO-ABILITY PILOT (claude/checklist, 2026-10-01). A brand-new knight (a fresh save: level 1, no talents, no bought
   skills, no upgrades) walks the level's main route (tools/pacing.mjs, a waypoint every ~8 columns) with the play bot's hands and no god mode; where the bot cannot work a lock, winch or lever in 4 s it is LIFTED to the next waypoint (counted and printed), so every stretch of the level is met. A level that costs that hero nothing is a walk, not a level: it must take
   real damage (LIM.pilotHits blows in tools/level-quality.mjs).
     node tools/level1-pilot.mjs <id> [<id>..] [--write] [--steps=30000] [--runs=3] [--hero=knight]
   Without --write it only prints. With --write it records one row a level in docs/level1-pilot.json, stamped with a hash of the level's data
   (levelHash in tools/level-quality.mjs); the level-quality gate reads that file for the GATED levels and fails when a row is missing, stale (the level
   changed since the pilot ran) or under the damage floor. WHY A CACHE AND NOT A LIVE RUN: level-quality is a no-browser check that takes seconds; this
   pilot opens Chrome and plays several minutes of game a level (~30-60 s of wall clock). The cache keeps the gate cheap and still honest: a level edit makes the row stale, and a stale
   row fails until the pilot is run again (a build lane runs it once, at the end, and commits the file). Not in the suite on its own. */
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { LEVELS } from '../src/level.js';
import { levelHash, PILOT_FILE, CURVE_FILE } from './level-quality.mjs';
import { pacing } from './pacing.mjs';
import { openPage } from './cdp.mjs';
const args = process.argv.slice(2), WRITE = args.includes('--write'), CURVE = args.includes('--curve');   /* --curve (claude/combat2): write docs/level1-curve.json instead - THE MEASURED DIFFICULTY CURVE (tools/rule-fights.mjs reads it, every campaign level), never the gate's file */
const opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const steps = +opt('steps', 30000), runs = +opt('runs', 3), hero = opt('hero', 'knight'), ids = args.filter(a => !a.startsWith('-'));
if (!ids.length) { console.log('usage: node tools/level1-pilot.mjs <id> [<id>..] [--write] [--steps=30000] [--hero=knight]'); process.exit(2); }
const OUTF = CURVE ? CURVE_FILE : PILOT_FILE, cache = existsSync(OUTF) ? JSON.parse(readFileSync(OUTF, 'utf8')) : {};
const pg = await openPage({ audio: false, fonts: false });
try {
  for (const id of ids) {
    const lv = LEVELS.find(l => l.id === id); if (!lv) { console.log(id + ': no such level'); continue; }
    const P = pacing(lv), way = []; for (const [x, y] of P.route) { const l = way[way.length - 1]; if (!l || Math.abs(x - l[0]) >= 8 || Math.abs(y - l[1]) >= 6) way.push([x, y]); }
    const r = await pg.evalp(`(async()=>{ BK.manualSimulation = true; BK.setHero(${JSON.stringify(hero)}); BK.reset({ fresh: true });
      const { LEVELS } = await import('/src/level.js'), { makeBot } = await import('/src/playtest.js'), TS = 16, way = ${JSON.stringify(way)};
      const prog = BK.PROG, bare = !(prog.talents && Object.keys(prog.talents).length) && !(prog.skills && Object.keys(prog.skills).length);
      const tot = { hits: 0, deaths: 0, kills: 0, lifts: 0, frames: 0, reached: 0, lost: 0 };
      for (let run = 0; run < ${runs}; run++) { BK.load(LEVELS.findIndex(l => l.id === ${JSON.stringify(id)})); BK.state = 'play'; BK.start(); BK.god = false; BK.reset();
      const k0 = BK.stats().kills, d0 = BK.stats().deaths; let bot = makeBot(BK), lifts = 0, frames = 0, reached = 0;
      for (const [wx, wy] of way) { if (frames > ${steps}) break; let got = false;
        for (let i = 0; i < 240 && frames < ${steps}; i++, frames++) { bot(wx * TS + 8); const h0 = BK.P.hp; BK.sim(1); tot.lost += Math.max(0, h0 - Math.max(0, BK.P.hp)) / (BK.P.maxHp || 100); if (Math.abs(BK.P.x - (wx * TS + 8)) < 10 && (!${!!P.tall} || Math.abs(BK.P.y - (wy + 1) * TS) < 3 * TS)) { got = true; break; } }   /* (claude/redgorge) on a TALL level a waypoint is reached at its own height (by column alone a climb's waypoints were met on the floor under them) */
        if (!got) { lifts++; BK.tp(wx, wy); bot = makeBot(BK); BK.sim(2); } reached++; if (frames % 600 === 0) await new Promise(r => setTimeout(r, 0)); }
      tot.hits += BK.hitsTaken; tot.deaths += BK.stats().deaths - d0; tot.kills += BK.stats().kills - k0; tot.lifts += lifts; tot.frames += frames; tot.reached += reached; }
      return { lost: tot.lost, hits: tot.hits, deaths: tot.deaths, kills: tot.kills, walked: Math.round(tot.reached / (way.length * ${runs}) * 100), lifts: tot.lifts, frames: tot.frames, bare }; })()`, 1800000);
    const walkedPct = r.walked;
    console.log(id + ' (' + hero + ', fresh save, ' + runs + ' runs summed' + (r.bare ? '' : ', NOT BARE: talents or skills present') + '): ' + r.hits + ' hits taken, ' + r.deaths + ' deaths, ' + r.kills + ' kills, walked ' + r.walked + '% of the waypoints, ' + r.lifts + ' lifts (' + r.frames + ' frames)');
    if (WRITE || CURVE) cache[id] = { hash: levelHash(lv), hero, steps, runs, hits: r.hits, deaths: r.deaths, kills: r.kills, lifts: r.lifts, walked: walkedPct, bare: !!r.bare, ...(CURVE ? { lostPct: Math.round(r.lost / runs * 100) } : {}) };
  }
  if (WRITE || CURVE) { writeFileSync(OUTF, JSON.stringify(cache, null, 1) + '\n'); console.log('wrote ' + OUTF.replace(/.*[\/]docs/, 'docs')); }
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
