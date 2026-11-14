// PAGE TOOL: launches headless Chrome
// tools/hero-trials.mjs - EVERY HERO TRAINS IN THE ARENA YARD (rewritten claude/yardswap, Daniel 11-03; it was EVERY HERO HAS A TRIAL YARD).
// The ten hero trial yards and the open yard are RETIRED: the Arena Yard (src/arena-yard.js) is the one training ground. This tool keeps the old promise -
// no hero is left without a place to learn his verbs - pointed at the new yard:
//   rows     every hero on the hero list (main.js HEROES) still has a `trial_<id>` ROW in LEVELS (the index/id never shifts) and it is RETIRED: it builds the
//            Arena Yard (no `trial` stations, no hero-specific yard); trialSteps(hero) (the table the MOVE BOARD reads) is non-empty for every hero
//   board    each hero in the Arena Yard: the move board opens with his own lines (>= 4) and his hero-specific moves are named (the steps the trial used to teach)
//   swing    each hero in the straw row: his own attack runs (P.atk moves) and a straw man is hit (it flashes / is knocked), nothing hurts him, no page errors
// The long station-by-station PLAYTHROUGH of the old yards is gone with them; what each kit does is proved by its own tool (tools/knight*.mjs, geomancer.mjs,
// berserker.mjs, blood-kit.mjs ...) and its grade against the dummies by tools/arena-yard.mjs (perfect / arrows / zone / coop).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { openPage, ROOT } from './cdp.mjs';
import { trialSteps } from '../src/level.js';

const main = readFileSync(join(ROOT, 'src/main.js'), 'utf8');
const heroBlock = main.slice(main.indexOf('const HEROES = ['), main.indexOf('];', main.indexOf('const HEROES = [')));
const heroes = [...heroBlock.matchAll(/\{ id: '(\w+)'/g)].map(m => m[1]);
const fails = [];
if (heroes.length < 7) fails.push('read only ' + heroes.length + ' heroes off main.js HEROES');
for (const h of heroes) { const st = trialSteps(h); if (!st || st.length < 4) fails.push('trialSteps(' + h + ') (the move board\'s table) has ' + (st ? st.length : 'no') + ' steps'); }
if (/YARD_DRILLS|startTrial|id: 'practiceYard'/.test(main)) fails.push('main.js still carries the old practice yard (YARD_DRILLS / startTrial / practiceYard row)');

const pg = await openPage({ audio: false, fonts: false });
const out = {};
try {
  const rows = await pg.evalp(`import('/src/level.js').then(m => m.LEVELS.map(l => ({ id: l.id, retired: l.retired || null, yard: !!l.build().arenaYard, trial: l.build().trial !== undefined })).filter(r => /^trial_/.test(r.id)))`);
  for (const h of heroes) { const r = rows.find(x => x.id === 'trial_' + h); if (!r) fails.push('no retired row trial_' + h + ' in LEVELS (its index would shift)'); else if (r.retired !== 'arena_yard' || !r.yard || r.trial) fails.push('trial_' + h + ' is not a retired row that builds the Arena Yard: ' + JSON.stringify(r)); }
  await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');window.__IDX=LEVELS.findIndex(l=>l.id==='arena_yard');
    window.__go=h=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero(h);BK.reset({fresh:true});BK.applyUpgrades();BK.load(__IDX);BK.start();BK.god=false;BK.sim(30);};
    return 1})()`);
  for (const h of heroes) {
    const r = await pg.evalp(`(()=>{__go(${JSON.stringify(h)});const p=BK.players()[0],Y=BK.yard();Y.open(p);const bd=Y.Y.st.board;const o={lines:bd?bd.b.lines.length:0,hero:bd&&bd.b.hero};Y.Y.st.board=null;BK.sim(3);
      const dum=BK.enemies().filter(e=>e.t==='dummy'&&e.x>14*16&&e.x<28*16).sort((a,b)=>a.x-b.x)[0];o.dummies=BK.enemies().filter(e=>e.t==='dummy').length;
      p.x=dum.x-22;p.y=22*16-0.01;p.vx=0;p.vy=0;p.ground=true;p.face=1;p.st=p.maxSt;let swung=false,flashed=false;const hp0=p.hp;
      for(let f=0;f<150;f++){if(f%12===0)BK.press('atk');p.st=p.maxSt;BK.sim(1);if(p.atk>=0)swung=true;if(dum.flash>0||dum.hurt>0||dum.hitDir)flashed=true;}
      o.swung=swung;o.hit=flashed;o.hpKept=p.hp>=hp0;return o;})()`);
    out[h] = r;
    if (!r || r.hero !== h || r.lines < 4) fails.push(h + ': the Arena Yard move board has ' + (r && r.lines) + ' lines (>= 4 wanted)');
    if (r && r.dummies < 7) fails.push(h + ': only ' + r.dummies + ' straw men in the yard');
    if (r && !r.swung) fails.push(h + ': his attack never ran in the straw row');
    if (r && !r.hit) fails.push(h + ': nothing he swung at the straw man marked a hit');
    if (r && !r.hpKept) fails.push(h + ': he lost health in the straw row');
    if (pg.errors.length) fails.push(h + ': page errors ' + JSON.stringify(pg.errors.slice(0, 3)));
  }
} finally { pg.close(); }
console.log(JSON.stringify({ heroes, out }));
assert.deepEqual(fails, []);
console.log('hero trials (now the Arena Yard): all ' + heroes.length + ' heroes have a board, a straw row, and a retired trial row');
