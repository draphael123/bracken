// tools/archmage-pilot.mjs [salts=1,2,3] [heroes] — THE UNDEAD ARCHMAGE (the Falling Tower's boss, fought from the carpet) through
// BK.bossLab, all seven heroes, one pass per salt (bossLab pins its dice per row; the salt makes each pass its own fight -
// docs/INTEGRATOR.md §6). Round 2 of the tower (docs/briefs/falling-tower-round2.md) measures him before and after his portals:
// REFILL health (the bot is topped up, so the number is how long HE takes, not how long the bot lasts) and a 150 s cap.
// `opened` is how many openings the bot had (the mark that finds no one; after round 2 also THE DODGE-THROUGH), `hitBy` which of
// his modes did the damage. Not in the suite: it is too long.
// usage: node tools/archmage-pilot.mjs            (salts 1,2,3 x 7 heroes = 21 fights)
//        HEALTH=normal CAP=300 node tools/archmage-pilot.mjs 1 knight,warden
//        (then the SPIRAL STAIR per hero, with the lab's stair bot - STAIR=0 skips it; undead4)
import { openLevelPage as openPage } from './boss-level.mjs';   /* the hero fights at the level's campaign level (tools/boss-level.mjs; --level=N overrides) */
const salts = (process.argv[2] || '1,2,3').split(',').map(Number);
const heroes = (process.argv[3] || 'knight,warden,pyro,paladin,pirate,reaper,geomancer').split(',');
const health = process.env.HEALTH || 'refill', cap = +(process.env.CAP || 150);
const pg = await openPage({ audio: false, fonts: false });
const rows = [];
try {
  for (const salt of salts) {
    await pg.reload();
    const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;
      const seen={};let was=null;   /* how many of the openings were THE DODGE THROUGH (breached) and how many the mark (gather) */
      const onFrame=({boss,h})=>{const s=seen[h]||(seen[h]={breached:0,gather:0});if(boss.mode!==was&&['breached','gather','scorched','shattered','vented'].includes(boss.mode))s[boss.mode]=(s[boss.mode]||0)+1;was=boss.mode;};
      const o=await BK.bossLab({bosses:['fallingtower'],heroes:${JSON.stringify(heroes)},healthMode:${JSON.stringify(health)},maxSecs:${cap},modes:true,salt:${salt},onFrame});
      return o.rows.map(r=>({h:r.h,salt:${salt},out:r.outcome||r.skipped,secs:r.secs,taken:r.health&&Math.round(r.health.damageTaken),opened:r.opened,left:r.hpLeftPct,swings:r.swings,hitBy:r.hitBy,portal:seen[r.h]}));})()`, 3600000);
    for (const x of r) console.log(JSON.stringify(x));
    rows.push(...r);
  }
  const wins = rows.filter(r => r.out === 'win'), secs = wins.map(r => r.secs).sort((a, b) => a - b);
  const by = {}; for (const r of rows) { by[r.h] = by[r.h] || [0, 0]; by[r.h][1]++; if (r.out === 'win') by[r.h][0]++; }
  const hit = {}; for (const r of rows) for (const [k, v] of Object.entries(r.hitBy || {})) hit[k] = (hit[k] || 0) + v;
  const left = rows.filter(r => r.out !== 'win' && typeof r.left === 'number').map(r => r.left).sort((a, b) => a - b);
  console.log(JSON.stringify({ health, cap, fights: rows.length, wins: wins.length, pct: Math.round(100 * wins.length / Math.max(1, rows.length)), medianWin: secs.length ? secs[secs.length >> 1] : null,
    medianLeftOnLoss: left.length ? left[left.length >> 1] : null, openedAvg: +(rows.reduce((a, r) => a + (r.opened || 0), 0) / Math.max(1, rows.length)).toFixed(1),
    breachedAvg: +(rows.reduce((a, r) => a + ((r.portal && r.portal.breached) || 0), 0) / Math.max(1, rows.length)).toFixed(1), markOpenAvg: +(rows.reduce((a, r) => a + ((r.portal && r.portal.gather) || 0), 0) / Math.max(1, rows.length)).toFixed(1),
    byHero: Object.fromEntries(Object.entries(by).map(([h, [w, n]]) => [h, w + '/' + n])), hitBy: Object.fromEntries(Object.entries(hit).map(([k, v]) => [k, Math.round(v)])) }));
  /* THE SPIRAL STAIR (undead4; claude/towerscroll): each hero climbs it with the lab's stair bot (src/lab.js chaseClimb) ahead of the rising dark,
     health held up, no god mode - the seconds, what it took, and how often the dark caught it (tools/stair-pilot.mjs is the normal-health pilot) */
  if (process.env.STAIR !== '0') for (const h of heroes) { await pg.reload();
    const q = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');const LB=await import('/src/lab.js');BK.manualSimulation=true;
      BK.setHero(${JSON.stringify(h)});BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='fallingtower'));BK.state='play';BK.god=false;BK.sim(10);
      BK.tp(33,50);BK.sim(5);for(let i=0;i<90;i++){BK.keys.right=true;BK.sim(1);}BK.keys.right=false;BK.sim(20);
      const r=LB.chaseClimb(BK,BK.enemies().find(e=>e.t==='magechase'),{secs:180,refill:true});
      return {h:${JSON.stringify(h)},stair:BK.carpet()?'top':'stuck',secs:Math.round(r.t/60),taken:Math.round(r.taken),died:r.died};})()`, 600000);
    console.log(JSON.stringify(q)); }
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
