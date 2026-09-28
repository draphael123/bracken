// tools/combat-damage.mjs [levels] [heroes] [seeds] [frames] — WHAT A PLAIN RUN COSTS: the in-page play bot (src/playtest.js, the F9
// bot), NO god mode, from each level's start toward its gate, dice pinned. Not in the suite: a measure, for a before and an after
// (the combat pass, 2026-09-28: damage taken on two sample levels before and after the attack tokens). Prints, per level, hero and
// seed: hp lost, deaths, how far it got, and the hits by who threw them.
//   node tools/combat-damage.mjs stockade,waymeet knight 1,2 5400
import { openPage } from './cdp.mjs';
const levels = (process.argv[2] || 'stockade,waymeet').split(',');
const heroes = (process.argv[3] || 'knight').split(',');
const seeds = (process.argv[4] || '1,2').split(',').map(Number);
const frames = +(process.argv[5] || 5400);
const pg = await openPage({ audio: false, fonts: false });
const rows = [];
try {
  for (const lvl of levels) for (const hero of heroes) for (const seed of seeds) {
    await pg.reload();
    rows.push(await pg.evalp(`(async()=>{
      const { LEVELS } = await import('/src/level.js'); const { makeBot } = await import('/src/playtest.js');
      let a = ${seed} >>> 0; const real = Math.random; Math.random = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
      try {
        BK.PROG.hero = ${JSON.stringify(hero)}; const idx = LEVELS.findIndex(l => l.id === ${JSON.stringify(lvl)});
        BK.load(idx); BK.start(); BK.god = false;
        const L = BK.L, gate = L.ents.find(e => e.t === 'gate'), to = gate ? gate.x : L.W - 4;
        const bot = makeBot(BK), d0 = BK.stats().deaths; let hp0 = BK.P.hp, lost = 0, best = BK.P.x, s = 0; const by = {};
        for (; s < ${frames}; s++) { if (BK.state !== 'play') break; bot(to * 16 + 8); BK.sim(1); best = Math.max(best, BK.P.x);
          if (BK.P.hp < hp0) { lost += hp0 - BK.P.hp; const k = (BK.P.killer && BK.P.killer.name) || '?'; by[k] = (by[k] || 0) + (hp0 - BK.P.hp); }
          hp0 = BK.P.hp; if (BK.stats().deaths - d0 >= 3) break; }
        const tk = BK.tokens ? BK.tokens().board.stats : null;
        return { lvl: ${JSON.stringify(lvl)}, hero: ${JSON.stringify(hero)}, seed: ${seed}, secs: Math.round(s / 60), lost: Math.round(lost), deaths: BK.stats().deaths - d0, col: Math.round(best / 16), by, tk };
      } finally { Math.random = real; }
    })()`, 1800000));
  }
} finally { pg.close(); }
for (const r of rows) console.log(`${r.lvl.padEnd(10)} ${r.hero.padEnd(8)} seed ${r.seed}: ${String(r.lost).padStart(4)} hp lost, ${r.deaths} deaths, to col ${r.col} in ${r.secs} s` +
  `   by ${Object.entries(r.by).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => k + ' ' + Math.round(v)).join(', ')}` + (r.tk ? `   tokens ${JSON.stringify(r.tk)}` : ''));
