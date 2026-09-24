// tools/pose-sheet.mjs — THE KNIGHT'S AND THE WARDEN'S ABILITIES, CAUGHT MID-MOVE. Each active is bought alone and pressed
// on a flat floor in the real page, and the drawn frame (BK.step renders it) is cropped round the hero at three moments after
// the press; then the jump - take-off, rising, the top, falling - and the landing, three frames of it. One row a move.
//   node tools/pose-sheet.mjs before    -> docs/pose-before.png
//   node tools/pose-sheet.mjs after     -> docs/pose-after.png: the same captures, BEFORE (read from docs/pose-before.png) on the
//                                          left of each row and AFTER on the right
//   node tools/pose-sheet.mjs before others  (and after others) -> docs/pose2-before.png / pose2-after.png: the same, for the
//                                          OTHER FOUR heroes (Paladin, Pyromancer, Freebooter, Death Knight), every active of theirs
//                                          taken from the catalog (lane P, 2026-09-24)
import { writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { openPage, ROOT } from './cdp.mjs';
import { SKILLS } from '../src/progression-catalog.js';

const MODE = process.argv[2] === 'after' ? 'after' : 'before';
const OTHERS = process.argv[3] === 'others';
const actives = h => [...new Set(SKILLS.filter(s => s.active && s.hero === h).map(s => s.id))];
const MOVES = OTHERS ? Object.fromEntries(['paladin', 'pyro', 'pirate', 'reaper'].map(h => [h, actives(h)])) : {
  knight: ['risingCut', 'lunge', 'shieldThrow', 'warCry', 'groundSlam', 'whirlwind', 'disarm', 'ironclad', 'swordOfRealm'],
  warden: ['skewer', 'setSpears', 'harrier', 'wheel', 'javelin', 'poleSpring', 'fullStretch', 'spearDance', 'rainOfSpears'],
};
const STEM = OTHERS ? 'docs/pose2-' : 'docs/pose-', BASE = OTHERS ? 'master 341cb78' : 'master 313e0da', BRANCH = OTHERS ? 'claude/poses2' : 'claude/poses';
const AT = [3, 9, 16];                     /* frames after the press */
/* THE BLINK IS HELD OFF for the frame before each capture: a dodge (HOLY CHARGE, CINDER STEP) sets P.inv, whose blink leaves the hero
   undrawn on half its frames, and a capture landing on one of those showed an empty floor labelled with the last key drawn */
const CW = 72, CH = 64, SC = 2;            /* the crop round the hero, and how much it is blown up */
const pg = await openPage({ audio: false, fonts: false });
try {
  await pg.evalp(`(async()=>{const {xpFloor}=await import('/src/xp.js');
    window.__kit=(hero,ids)=>{BK.manualSimulation=true;BK.SET.speed=1;BK.setHero(hero);BK.reset({fresh:true});BKT.PROG.xp[hero]=xpFloor(24);
      BKT.PROG.skillOwned[hero]=Object.fromEntries(ids.map(i=>[i,true]));BKT.PROG.loadouts[hero]=ids.slice(0,4);BK.applyUpgrades();BK.load(0);BK.state='play';
      BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');const L=BK.L;for(let x=2;x<40;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;
      BK.tp(10,21);BK.sim(120);BK.P.hp=BK.P.maxHp;BK.P.inv=0;BK.P.st=BK.P.maxSt;BK.P.face=1;BK.P.heat=100;
      /* a foe out of the crop for the ones that need somebody to aim at (THE BLACK SPOT, KEELHAUL), held still and unkillable */
      if(${OTHERS}&&ids.length){BK.spawnEnt({t:'sprig',x:(BK.P.x+40)/16,y:21});const e=BK.enemies().at(-1);e.hp=e.hp0=5000;e.cd=99;}};
    /* the hero's box in the drawn frame, allowing for a zoom kick about the middle of the screen */
    window.__crop=(label)=>{const v=BK.view,P=BK.P,z=v.z||1,sx=v.VW/2+(P.x-v.x-v.VW/2)*z,sy=v.VH/2+(P.y-v.y-v.VH/2)*z;
      const c=document.createElement('canvas');c.width=${CW};c.height=${CH};const g=c.getContext('2d');g.imageSmoothingEnabled=false;
      g.drawImage(v.buf,Math.round(sx-${CW / 2}),Math.round(sy-${CH - 10}),${CW},${CH},0,0,${CW},${CH});return {c,label:label+' '+P.lastKey+':'+P.lastFrame};};
    window.__shots=[];return 1})()`);
  const rows = [];
  for (const [hero, ids] of Object.entries(MOVES)) {
    for (const id of ids) {
      await pg.evalp(`(()=>{__kit('${hero}',['${id}']);const s=[];BK.step(1);BK.press('throw');if(BK.stop>0&&!(BK.P.cds&&Object.keys(BK.P.cds).length)){for(let i=0;i<120&&BK.stop>0;i++)BK.step(1);BK.press('throw');}let f=0;for(const at of ${JSON.stringify(AT)}){BK.step(at-f-1);BK.P.inv=0;BK.step(1);f=at;s.push(__crop('+'+at));}__shots.push(s);return 1})()`);
      rows.push(hero + ' ' + id);
    }
    /* THE JUMP AND THE LANDING: a full jump from the floor, caught take-off, rising, the top, falling; then the three frames after touch-down */
    await pg.evalp(`(()=>{__kit('${hero}',[]);const P=BK.P,s=[];BK.step(1);BK.keys.jump=true;BK.press('jump');BK.step(2);s.push(__crop('off'));BK.step(6);s.push(__crop('rise'));
      for(let i=0;i<60&&P.vy<-10;i++)BK.step(1);s.push(__crop('top'));for(let i=0;i<60&&P.vy<160&&!P.ground;i++)BK.step(1);s.push(__crop('fall'));__shots.push(s);
      BK.keys.jump=false;for(let i=0;i<90&&!P.ground;i++)BK.step(1);const l=[__crop('land0')];BK.step(3);l.push(__crop('land3'));BK.step(4);l.push(__crop('land7'));__shots.push(l);return 1})()`);
    rows.push(hero + ' jump', hero + ' landing');
  }
  const before = MODE === 'after' ? 'data:image/png;base64,' + readFileSync(join(ROOT, STEM + 'before.png')).toString('base64') : null;
  const url = await pg.evalp(`(async()=>{const rows=${JSON.stringify(rows)},shots=__shots,W=${CW * SC},H=${CH * SC},LW=150,cols=4,gap=6,half=cols*(W+gap);
    const pair=${JSON.stringify(!!before)};let prev=null;if(pair){prev=new Image();prev.src=${JSON.stringify(before || '')};await prev.decode();}
    const c=document.createElement('canvas');c.width=LW+half*(pair?2:1)+(pair?20:0);c.height=40+rows.length*(H+18);const g=c.getContext('2d');g.imageSmoothingEnabled=false;
    g.fillStyle='#14121c';g.fillRect(0,0,c.width,c.height);g.fillStyle='#e8dcc0';g.font='bold 16px monospace';
    const x0=LW+(pair?half+20:0);g.fillText(pair?'BEFORE (${BASE})':'BEFORE: ${BASE}',LW,24);if(pair)g.fillText('AFTER (${BRANCH})',x0,24);
    rows.forEach((r,i)=>{const y=40+i*(H+18);g.fillStyle='#e8dcc0';g.font='bold 13px monospace';g.fillText(r,6,y+H/2);
      if(pair)g.drawImage(prev,${150},y,half,H+18,LW,y,half,H+18);
      shots[i].forEach((s,j)=>{const x=x0+j*(W+gap);g.drawImage(s.c,x,y,W,H);g.strokeStyle='#3a3450';g.strokeRect(x+.5,y+.5,W-1,H-1);
        g.fillStyle='#c9b27c';g.font='11px monospace';g.fillText(s.label,x+2,y+H+12);});});
    return c.toDataURL('image/png')})()`);
  const out = join(ROOT, STEM + MODE + '.png');
  writeFileSync(out, Buffer.from(url.split(',')[1], 'base64'));
  if (pg.errors.length) console.log('page errors:', pg.errors);
  console.log('wrote ' + out + ' (' + rows.length + ' rows)');
} finally { pg.close(); }
