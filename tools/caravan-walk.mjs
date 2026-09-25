/* tools/caravan-walk.mjs [heroes] [steps] — F9 for THE SUNKEN CARAVAN: the in-page play bot (src/playtest.js), NO god mode, start
   to gate, once per hero (default knight,warden). Not in the suite: it is long, and the bot cannot fight (RULES M) - it proves
   nothing crashes, floats or strands, and says where a plain run gets to.

   Two parts, because the level has two LOCKED fights and the bot cannot win either: the Traders' Yard (an ambush, which pens
   you in until its captain falls) and the rim's elite archer (whose gate stays shut until he falls). A bot lifted over a lock
   is pulled straight back into it, so a single run ends at the first one. So:
     1. BK.playtest, both passes: the sweep's art and geometry findings, and how far a plain run gets (the yard).
     2. THE LEGS: the same bot, no god mode, walked between the locks - start -> the yard, the yard's door -> the elite's
        gate, the gate -> the level's own gate - each leg until it arrives, dies three times, or runs out of frames.
   The locks themselves are measured by the tool made for them: node tools/combat-acceptance.mjs ambush <out> caravan.
   The last leg ends in THE WORM'S HOLLOW since the worm moved in (claude/duneworm): it arrives when it has crossed his trigger and
   the walls have shut behind it. His fight is the boss lab's (node tools/duneworm-pilot.mjs); the gate after him, tools/dune-worm.mjs's. */
import { openPage } from './cdp.mjs';
const heroes = (process.argv[2] || 'knight,warden').split(',');
const steps = +(process.argv[3] || 20000);
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const rep=await BK.playtest({levels:['caravan'],heroes:${JSON.stringify(heroes)},mode:'both',quiet:true,log:false,playSteps:${steps}});
    return {text:rep.text};})()`, 1800000);
  console.log(r.text);
  for (const hero of heroes) {
    const legs = await pg.evalp(`(async()=>{
      const { LEVELS } = await import('/src/level.js'); const { makeBot } = await import('/src/playtest.js');
      const keep = BK.PROG.hero; BK.PROG.hero = ${JSON.stringify(hero)}; const out = [];
      const idx = LEVELS.findIndex(l => l.id === 'caravan');
      BK.load(idx); BK.start(); BK.god = false;
      const L = BK.L, A = L.ambushes[0], el = L.ents.find(e => e.elite && e.gate !== undefined), gate = L.ents.find(e => e.t === 'gate' && !e.elite);
      const foot = x => { for (let y = 1; y < L.H - 1; y++) { const t = L.grid[y * L.W + x]; if (t !== 0 && !(t >= 20 && t <= 25) && t !== 2 && t !== 8) return y - 1; if (t >= 20 && t <= 25) return y; } return 20; };
      const LEGS = [['start -> the Traders\\' Yard', null, A.wallL + 2], ['the yard\\'s far door -> the elite archer\\'s gate', A.wallR + 4, el.gate - 1], ['the elite\\'s gate -> THE WORM\\'S HOLLOW, into his fight', el.gate + 2, Math.round(L.arena.trigger / 16) + 2]];
      const SEC = Object.entries(L.sections).sort((a, b) => a[1] - b[1]), secAt = x => { let k = SEC[0][0]; for (const [n, c] of SEC) if (x >= c) k = n; return k; };
      const { SUN } = await import('/src/sunstroke.js'), SW = SUN.swimAt, S8 = {};
      for (const [name, from, to] of LEGS) {
        if (from !== null) { BK.load(idx); BK.start(); BK.god = false; BK.tp(from, foot(from)); }
        const bot = makeBot(BK); const d0 = BK.stats().deaths; let s = 0, arrived = false, best = BK.P.x;
        let hp0 = BK.P.hp, dN = d0;
        for (; s < ${steps}; s++) { if (BK.state !== 'play') { arrived = BK.state === 'win'; break; } bot(to * 16 + 8); BK.sim(1); best = Math.max(best, BK.P.x);
          { const sec = secAt(Math.floor(BK.P.x / 16)), r = S8[sec] || (S8[sec] = { hurt: 0, deaths: 0, frames: 0, warm: 0, full: 0 }), v = (BK.P.sun || {}).v || 0;   /* RULES S8: what each section cost the bot */
            r.frames++; if (v >= SW) r.warm++; if (v >= 1) r.full++; if (BK.P.hp < hp0) r.hurt += hp0 - BK.P.hp; hp0 = BK.P.hp; const dd = BK.stats().deaths; if (dd > dN) { r.deaths += dd - dN; dN = dd; } }
          if (BK.P.x >= to * 16 - 8) { arrived = true; break; } if (BK.stats().deaths - d0 >= 3) break; }
        out.push(name.padEnd(56) + (arrived ? 'ARRIVED' : 'stopped at col ' + Math.round(best / 16)) + ' in ' + (s / 60).toFixed(0) + ' s (60 frames a second), ' + (BK.stats().deaths - d0) + ' deaths, hp ' + Math.round(BK.P.hp) + ', state ' + BK.state);
      }
      out.push('  RULES S8, per section (hp lost, deaths, share of the time over the sun meter warning / at full):');
      for (const [n] of SEC) { const r = S8[n]; if (r) out.push('    ' + n.padEnd(10) + ' hurt ' + String(Math.round(r.hurt)).padStart(4) + '  deaths ' + r.deaths + '  warm ' + Math.round(100 * r.warm / r.frames) + '%  full ' + Math.round(100 * r.full / r.frames) + '%  (' + (r.frames / 60).toFixed(0) + ' s)'); }
      BK.PROG.hero = keep; return out.join('\\n');
    })()`, 1800000);
    console.log('\n' + hero.toUpperCase() + ', no god mode, legs between the locks:\n' + legs);
  }
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
