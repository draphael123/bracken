/* tools/lab-order.mjs - THE LAB DOES NOT REMEMBER THE FIGHT BEFORE (claude/harness). A check.
   Every bossLab row is seeded end to end (src/lab.js runbossLab), so the same boss, hero, profile and seed must come out the SAME whether it
   is the first fight in a freshly loaded page or the last of a batch. Before claude/harness it did not, because a fight left state behind:
     - the one-windup clock (main.js lastTellT) and the move-word cooldowns, kept in absolute time while BK.reset({ fresh }) set time to 0;
     - the ambient pools and clocks (air motes, fish, crickets, drips, the footstep parity in src/audio.js): they draw on Math.random, the
       same stream the lab seeds per row, so a full pool from the last fight shifted every roll the boss made after it;
     - a won fight's boss effects, rings and level-up count, the attack-token board, the once-a-level lessons;
     - the save itself (PROG): the XP a kill paid levelled the hero for the next row, and the lessons told stopped being told.
   BK.reset({ fresh }) now clears the first three, and each bossLab row puts PROG back as it found it.
   This plays each TARGET alone in a reloaded page, then again in one page after a BATCH (a won fight, other bosses, other heroes, both
   bot profiles, a mini), and asserts the target's row is identical: outcome, seconds, boss hp left, damage taken, swings, openings.
     PORT=8683 node tools/lab-order.mjs [--targets=lvl:hero:profile:secs,...] [--before=...] [--verbose]
   About a minute and a half. */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { LEVELS } from '../src/level.js';
import { depthsOf } from '../src/campaign-order.js';
const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const verbose = args.includes('--verbose');
const parse = s => s.split(',').map(x => { const [lvl, h, profile, secs] = x.split(':'); const mini = lvl.endsWith('+mini'); return { lvl: lvl.replace('+mini', ''), mini, h, profile, secs: +secs || 60 }; });
/* the targets: the leak's first witness (the Stockade Chief, whom the pyro beats at 65 s alone), a legacy row (the old bot the suite uses), a
   long fight, a perceiving row. The batch: a WIN first (its XP, its death throes, its music), then a boss, a mini and the other profile. */
const TARGETS = parse(opt('targets', 'stockade:pyro:human:90,reef:warden:legacy:75,kings:knight:human:60,unburied:knight:legacy:60'));
const BEFORE = parse(opt('before', 'wood:pyro:human:60,marsh:warden:legacy:40,kings+mini:knight:legacy:40,crown:warden:human:40'));
const fight = (f, seed) => `(await BK.bossLab({bosses:[${JSON.stringify(f.lvl)}],heroes:[${JSON.stringify(f.h)}],maxSecs:${f.secs},healthMode:'normal',seed:${seed},profile:${JSON.stringify(f.profile)}${f.mini ? ',mini:true' : ''}})).rows[0]`;
const pick = r => r && ({ outcome: r.outcome || r.skipped, secs: r.secs, left: r.hpLeftPct, taken: r.health ? Math.round(r.health.damageTaken * 100) / 100 : null, swings: r.swings, opened: r.opened });
const pg = await openPage({ audio: false, fonts: false });
const bad = [];
/* THE ELITE ROW (claude/harness Q1): tools/elite-lab.mjs fights through window.__elite, which puts the save back; the first elite in the
   campaign, the same fight alone and after the batch (a win's XP and the lessons told must not reach it) */
const depth = depthsOf(LEVELS); let ELITE = null;
for (const lv of LEVELS) { if ((lv.hidden && !lv.secret) || lv.id === 'custom' || /^(trial_|shop)/.test(lv.id)) continue; const e = lv.build().ents.filter(q => q.elite).sort((a, b) => a.x - b.x)[0]; if (e) { ELITE = { level: lv.id, kind: e.t, nth: 0, spawn: false, lvl: Math.max(1, depth[lv.id] ?? 1), hero: 'knight', mode: 'human', seed: 0, secs: 40 }; break; } }
const SETUP_ELITE = `(async () => { const { mulberry } = await import('/src/px.js'); const lab = await import('/src/lab.js'); const real = Math.random;
  const hash = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  window.__elite = async o => { const P0 = BKT.PROG, progRow = JSON.stringify(P0); BKT.setHeroLevel(o.hero, o.lvl); P0.skillOwned[o.hero] = {}; P0.loadouts[o.hero] = []; if (P0.talents) P0.talents[o.hero] = {};
    Math.random = mulberry(hash(o.level + '|' + o.kind + '|' + o.hero + '|' + o.mode + '|' + o.seed)); try { return await lab.eliteLab(BK, o); } finally { Math.random = real; const p0 = JSON.parse(progRow); for (const k of Object.keys(BKT.PROG)) if (!(k in p0)) delete BKT.PROG[k]; Object.assign(BKT.PROG, p0); } };
  return true; })()`;
const pickE = r => r && ({ out: r.out || r.skipped, secs: r.secs, hero: r.hpLeftPct, elite: r.eliteLeftPct, affix: r.affix || null });
try {
  for (const T of TARGETS) {
    await pg.reload();
    const alone = pick(await pg.evalp(`(async()=>{BK.manualSimulation=true;return ${fight(T, 3)};})()`, 600000));
    await pg.reload();
    const after = pick(await pg.evalp(`(async()=>{BK.manualSimulation=true;${BEFORE.map(b => fight(b, 7) + ';').join('')}return ${fight(T, 3)};})()`, 600000));
    const same = JSON.stringify(alone) === JSON.stringify(after), name = T.lvl + (T.mini ? ':mini' : '') + ' ' + T.h + ' ' + T.profile;
    console.log((same ? 'same ' : 'DIFF ') + name + '  alone ' + JSON.stringify(alone) + (same && !verbose ? '' : '  after the batch ' + JSON.stringify(after)));
    if (!same) bad.push(name);
  }
  if (ELITE) {
    const J = JSON.stringify(ELITE);
    await pg.reload(); await pg.evalp(SETUP_ELITE); const alone = pickE(await pg.evalp(`window.__elite(${J})`, 600000));
    await pg.reload(); await pg.evalp(SETUP_ELITE);
    const after = pickE(await pg.evalp(`(async()=>{BK.manualSimulation=true;${BEFORE.map(b => fight(b, 7) + ';').join('')}return await window.__elite(${J});})()`, 600000));
    const same = JSON.stringify(alone) === JSON.stringify(after), name = 'elite ' + ELITE.kind + '@' + ELITE.level;
    console.log((same ? 'same ' : 'DIFF ') + name + '  alone ' + JSON.stringify(alone) + (same && !verbose ? '' : '  after the batch ' + JSON.stringify(after)));
    if (!same) bad.push(name);
  }
  assert.deepEqual(pg.errors, []);
  assert.deepEqual(bad, [], 'a lab row came out differently after other fights in the same page: state leaks between fights (' + bad.join(', ') + ')');
  console.log('lab-order: ' + (TARGETS.length + (ELITE ? 1 : 0)) + ' seeded rows are the same alone and after a ' + BEFORE.length + '-fight batch in the same page.');
} finally { pg.close(); }
