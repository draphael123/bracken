/* tools/spore-walk.mjs [heroes] [steps] — F9 for SPOREWOOD (docs/briefs/sporewood-rebuild.md): the in-page play bot (src/playtest.js), NO
   god mode, start to the Mother's door, once per hero (default knight,warden). Not in the suite: it is long, and the bot cannot fight
   (RULES M) - it proves nothing crashes, floats or strands, and says where a plain run gets to.
     1. BK.playtest, both passes: the sweep's art and geometry findings, and how far a plain run gets.
     2. THE LEGS: the same bot walked section by section over every use of the rule - the glade's root step, the leaning caps, the
        dripping stair, the bog and the pillars, the Deep Gills' sprouts - each leg until it arrives, dies three times or runs out of
        frames. The two locks it cannot win (the Undercap ambush in the root cellar and the elite at the pillars' gate) sit between legs;
        the cellar is the fork's LOWER road and the legs take the upper. */
import { openPage } from './cdp.mjs';
const heroes = (process.argv[2] || 'knight,warden').split(',');
const steps = +(process.argv[3] || 12000);
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const rep=await BK.playtest({levels:['spore'],heroes:${JSON.stringify(heroes)},mode:'both',quiet:true,log:false,playSteps:${steps}});
    return {text:rep.text};})()`, 1800000);
  console.log(r.text);
  for (const hero of heroes) {
    const legs = await pg.evalp(`(async()=>{
      const { LEVELS } = await import('/src/level.js'); const { makeBot } = await import('/src/playtest.js');
      const keep = BK.PROG.hero; BK.PROG.hero = ${JSON.stringify(hero)}; BK.SET.speed = 1; const out = [];
      const idx = LEVELS.findIndex(l => l.id === 'spore');
      BK.load(idx); BK.start(); BK.god = false;
      const L = BK.L, el = L.ents.find(e => e.elite && e.gate !== undefined), door = L.arena.wallL;
      const foot = x => { for (let y = 1; y < L.H - 1; y++) { const t = L.grid[y * L.W + x], u = L.grid[(y + 1) * L.W + x]; if (t === 0 && u !== 0 && u !== 17) return y; } return 13; };
      const LEGS = [['start -> the fork (the glade\\'s root step, the canyon, the grove, the shelf climb)', null, 130],
        ['the old vent marsh -> the Tumble (the leaning caps, the web tunnels)', 175, 244],
        ['the Tumble -> the bog (the dripping stair, the lantern terrace)', 245, 328],
        ['the bog -> the elite\\'s gate (the bog, the pillars)', 329, el.gate - 20],
        ['past the elite -> the Mother\\'s door (the Deep Gills, the sprouts, the hollow)', el.gate + 2, door - 2]];
      for (const [name, from, to] of LEGS) {
        BK.load(idx); BK.start(); BK.god = false; if (from !== null) BK.tp(from, foot(from));
        const bot = makeBot(BK); const d0 = BK.stats().deaths; let s = 0, arrived = false, best = BK.P.x;
        for (; s < ${steps}; s++) { if (BK.state !== 'play') break; bot(to * 16 + 8); BK.sim(1); best = Math.max(best, BK.P.x);
          if (BK.P.x >= to * 16 - 8) { arrived = true; break; } if (BK.stats().deaths - d0 >= 3) break; }
        out.push(name.padEnd(84) + (arrived ? 'ARRIVED' : 'stopped at col ' + Math.round(best / 16)) + ' in ' + (s / 60).toFixed(0) + ' s, ' + (BK.stats().deaths - d0) + ' deaths, hp ' + Math.round(BK.P.hp) + ', state ' + BK.state);
      }
      BK.PROG.hero = keep; return out.join('\\n');
    })()`, 1800000);
    console.log('\n' + hero.toUpperCase() + ', no god mode, section by section:\n' + legs);
  }
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
