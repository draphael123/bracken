/* tools/sky-probe.mjs (claude/skytune): one skylab fight with the mode ledger. HERO=warden SEED=1 node tools/sky-probe.mjs */
process.env.BOSS_MODES = '1'; process.env.HERO_LEVEL = process.env.HERO_LEVEL || '40';
import { runFights } from './boss-run.mjs';
const out = await runFights([{ r: 'skylab', way: 'practiced', h: process.env.HERO || 'warden', s: +(process.env.SEED || 1), profile: 'human', flasks: 'kit' }], { jobs: 1, secs: 240 });
const x = out[0]; console.log(JSON.stringify({ outcome: x.outcome, secs: x.secs, left: x.bossLeft, err: x.err, modes: x.modes, hitBy: x.hitBy, swings: x.swings, taken: x.taken, drank: x.drank, maxHp: x.maxHp }, null, 0));
