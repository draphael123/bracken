/* tools/longwater-walk.mjs [heroes] [--shots tag [--cols=a,b@row]] [--sections] - F9 for THE LONG WATER (docs/briefs/long-water-river.md): the in-page play bot
   (src/playtest.js), NO god mode, start to gate, once per hero (default knight,warden), then the sweep for art and geometry findings.
   Prints how far it got, where it died and every finding. With --shots <tag> it instead stands (god mode) at a row of river columns,
   renders 60 frames with BK.step and saves the 320x180 buffer at 2x as work/longwater2/<tag>-<col>.png, for a before-and-after.
   With --sections it walks each section on its own and prints what it cost the bot (RULES S8).
   Not in the suite: it is long, and the bot cannot fight or read a tell (RULES M), so it proves nothing crashes, floats or strands -
   not that the level is completable. */
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const args = process.argv.slice(2), si = args.indexOf('--shots'), tag = si >= 0 ? args[si + 1] : null;
const heroes = (args.find((a, k) => !a.startsWith('--') && !(si >= 0 && k === si + 1)) || 'knight,warden').split(',');
const cols = (args.find(a => a.startsWith('--cols=')) || '--cols=4,20,60,100,124,134,150,166,200,232,262,290,320,350').slice(7).split(',').map(c => c.split('@').map(Number));   /* col, or col@row to stand at a row (over water) */
const pg = await openPage({ audio: false, fonts: false });
try {
  if (tag) {
    const out = join(ROOT, 'work/longwater2'); mkdirSync(out, { recursive: true });
    await pg.evalp(`import('/src/level.js').then(M => { window.__LV = M.LEVELS; return true; })`);
    const shots = await pg.evalp(`(() => {
      const i = __LV.findIndex(l => l.id === 'longwater'); BK.load(i); BK.start(); BK.god = true; BK.sim(300);
      const L = BK.L, W = L.W, res = [];
      for (const [x, yAt] of ${JSON.stringify(cols)}) { if (x >= W) continue; let y0 = yAt || 0;
        if (!yAt) for (let y = 2; y < L.H - 1; y++) if (L.grid[y * W + x] === 0 && L.grid[y * W + x - W] === 0 && L.grid[(y + 1) * W + x] !== 0) { y0 = y; break; }
        BK.tp(x, y0); for (let k = 0; k < 60; k++) BK.step(1);
        const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360);
        res.push([yAt ? x + '-' + yAt : x, c.toDataURL('image/png')]); }
      return res;
    })()`, 600000);
    for (const [x, d] of shots) writeFileSync(join(out, tag + '-' + String(x).padStart(3, '0') + '.png'), Buffer.from(d.split(',')[1], 'base64'));
    console.log(tag, shots.length, 'shots in work/longwater2');
  } else if (args.includes('--sections')) {
    /* RULES S8: WHAT EACH SECTION COSTS THE BOT. The play bot (src/playtest.js makeBot), no god mode, stood at the start of each section
       and walked to its end for up to a minute: hits taken, health lost, deaths (and falls - a death at full health), whether it got to
       the end and how long it took. Sections are read off the build: 482 columns is the old river, 570 the new. */
    const OLD = [['MELTFALLS', 3, 127], ['DOCK', 128, 139], ['FERRY RUN', 140, 277], ['SALTREACH', 278, 349], ['SLUICE STAIR', 350, 415], ['SQUARE ROAD', 416, 433]];
    const NEW = [['MELTFALLS', 3, 127], ['THE LINN', 128, 167], ['DOCK', 168, 179], ['FERRY RUN', 180, 317], ['BORE REACH', 318, 365], ['SALTREACH', 366, 437], ['SLUICE STAIR', 438, 503], ['SQUARE ROAD', 504, 521]];
    const rows = await pg.evalp(`(async () => {
      const PT = await import('/src/playtest.js'); const LV = (await import('/src/level.js')).LEVELS; const i = LV.findIndex(l => l.id === 'longwater');
      const out = [];
      for (const hero of ${JSON.stringify(heroes)}) {
        BK.load(i); BK.state = 'play'; BK.start(); BK.god = false; BK.reset(); BK.setHero(hero);
        const L = BK.L, W = L.W, S = W > 500 ? ${JSON.stringify(NEW)} : ${JSON.stringify(OLD)};
        for (const [name, x0, x1] of S) {
          BK.load(i); BK.state = 'play'; BK.start(); BK.god = false; BK.reset(); BK.setHero(hero);
          let y0 = 2; for (let y = 2; y < L.H - 1; y++) if (L.grid[y * W + x0] === 0 && L.grid[y * W + x0 - W] === 0 && L.grid[(y + 1) * W + x0] !== 0) { y0 = y; break; }
          BK.tp(x0, y0); BK.P.hp = BK.P.maxHp; BK.sim(2);
          const bot = PT.makeBot(BK), h0 = BK.hitsTaken, d0 = BK.stats().deaths; let lost = 0, hp = BK.P.hp, falls = 0, dSeen = d0, maxX = BK.P.x, t = 0;
          for (; t < 3600; t++) { if (BK.state !== 'play') break; bot(x1 * 16); BK.sim(1); if (BK.P.hp < hp) lost += hp - BK.P.hp; hp = BK.P.hp;
            const dn = BK.stats().deaths; if (dn > dSeen) { if (hp >= BK.P.maxHp - 1) falls++; dSeen = dn; }
            maxX = Math.max(maxX, BK.P.x); if (BK.P.x >= x1 * 16) break; }
          out.push({ hero, name, cols: x0 + '-' + x1, hits: BK.hitsTaken - h0, hpLost: Math.round(lost), deaths: BK.stats().deaths - d0, falls, reached: BK.P.x >= x1 * 16, got: Math.round(Math.min(1, (maxX / 16 - x0) / (x1 - x0)) * 100) + '%', secs: Math.round(t / 6) / 10 });
        }
      }
      return out;
    })()`, 1800000);
    console.log('hero      section        cols      hits  hp lost  deaths  falls  got    secs');
    for (const r of rows) console.log(r.hero.padEnd(10) + r.name.padEnd(15) + r.cols.padEnd(10) + String(r.hits).padEnd(6) + String(r.hpLost).padEnd(9) + String(r.deaths).padEnd(8) + String(r.falls).padEnd(7) + (r.reached ? 'end' : r.got).padEnd(7) + r.secs);
  } else {
    const r = await pg.evalp(`(async()=>{const rep=await BK.playtest({levels:['longwater'],heroes:${JSON.stringify(heroes)},mode:'both',quiet:true,log:false});return rep.text;})()`, 1800000);
    console.log(r);
  }
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
