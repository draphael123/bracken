// tools/bc4-probe.mjs - THE BURIED CITY 4 lane's probe (claude/buriedcity4): stand a hero somewhere in the city, optionally strike glasses, and sample once a second
// where he is, his health, whether the sun drains him (and why not: shade / a cloud) and what foes are near. Not in the suite: a lane's eyes.
//   PORT=8904 node tools/bc4-probe.mjs <x> <row> [secs=20] [--hero=knight] [--lvl=40] [--hold=right|left|none] [--pre=<js>]
import { openPage } from './cdp.mjs';
const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const [x, row, secs = 20] = args.filter(a => !a.startsWith('--')).map(Number);
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async () => {
    const { LEVELS } = await import('/src/level.js'); const hero = ${JSON.stringify(opt('hero', 'knight'))}, lvl = ${+opt('lvl', 40)};
    BK.manualSimulation = true; if (lvl) { BKT.setHeroLevel(hero, lvl); } BK.setHero(hero); BK.reset({ fresh: !lvl }); if (lvl) BK.applyUpgrades && BK.applyUpgrades();
    BK.load(LEVELS.findIndex(l => l.id === 'buriedcity')); BK.state = 'play'; BK.sim(5); ${opt('pre', '')};
    BK.tp(${x}, ${row}); BK.sim(2); const out = [], k = BK.keys, hold = ${JSON.stringify(opt('hold', 'none'))};
    for (let s = 0; s < ${secs}; s++) { for (let f = 0; f < 60; f++) { if (BK.state === 'card') BK.cardClose(); k.left = hold === 'left'; k.right = hold === 'right'; BK.sim(1); }
      const P = BK.P, H = BK.buriedCityHands(), near = BK.enemies().filter(e => e.alive && Math.abs(e.x - P.x) < 120).map(e => (e.cnSkin || e.t) + '@' + Math.round(e.x / 16) + ',' + Math.round(e.y / 16) + (e.elite ? '*' : ''));
      out.push(s + 's ' + Math.round(P.x / 16) + ',' + Math.round(P.y / 16) + ' hp ' + Math.round(P.hp) + ' stage ' + (P.sunStage || 0) + (H.cloudAt(P.x) ? ' CLOUD' : '') + (H.sunAt(P.x) ? '' : ' roofed') + ' ' + near.join(' ')); }
    return out; })()`, 600000);
  console.log(r.join('\n'));
} finally { pg.close(); }
