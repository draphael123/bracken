// tools/fair-shots.mjs - THE HARVEST FAIR's greybox pictures, one per section, rendered with BK.step and saved at 2x into work/claude/fair1/. God mode.
// Not in the suite: pictures are for eyes (Daniel's approval of the greybox). usage: node tools/fair-shots.mjs [tag]
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || '', out = join(ROOT, 'work/claude/fair1', tag); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const res=[];
    const snap=(name,note)=>{const c=document.createElement('canvas');c.width=BK.view.VW*2;c.height=BK.view.VH*2;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,c.width,c.height);res.push([name,c.toDataURL('image/png'),note]);};
    const run=(n)=>{for(let i=0;i<n;i++){BK.sim(1);if(i%4===0)BK.step(1);}BK.step(1);};
    const fi=LEVELS.findIndex(l=>l.id==='fair');
    BK.setHero('knight');BK.reset({fresh:true});BK.load(fi);BK.state='play';BK.god=true;BK.sim(10);
    const mums=()=>BK.enemies().filter(e=>e.t==='mummer').sort((a,b)=>a.x-b.x);
    // 1 THE GATE (teach): the first mummer, alone on the lane, faced and frozen
    BK.tp(52,27);BK.P.face=1;run(50);snap('1-the-gate-teach','THE GATE (teach): one mummer on a flat lane, faced and frozen; the rule on the sign');
    // 2 THE STALL STAIR (develop): at the foot of the climb, the pair behind and the one at the top
    BK.tp(148,27);BK.P.face=1;run(40);snap('2-the-stall-stair-develop','THE STALL STAIR (develop): the slope stair, two mummers at its foot, one waiting at the top');
    // 3 THE CAROUSEL (twist): on the ride, canopy and painted horses, a mummer at each end
    BK.tp(300,25);BK.P.face=1;run(60);snap('3-the-carousel-twist','THE CAROUSEL (twist): on the ride, a mummer at each end; it turns you when the bulbs go red');
    // 4 THE HAYRICKS (combine): the first rick and its spikes, the horse on lane A
    BK.tp(391,27);BK.P.face=1;run(60);snap('4-the-hayricks-combine','THE HAYRICKS (combine): a haystack over three tiles of spikes, and the hobby-horse on the lane past it');
    // 5 THE LAST ROUND (exam): the small carousel with a mummer and a horse aboard
    BK.tp(526,27);BK.P.face=1;run(60);snap('5-the-last-round-exam','THE LAST ROUND (exam): the mummer on the lane, the small ride ahead with a mummer and a horse on it');
    // 6 THE MAYPOLE GREEN (greybox boss room): door, maypole, bonfire, the gate
    BK.tp(646,27);BK.P.face=1;run(60);snap('6-the-maypole-green','THE MAYPOLE GREEN (greybox): the door behind, the maypole and the bonfire; no boss yet');
    return res;})()`, 600000);
  r.forEach(([name, d, note], j) => { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/fair1/' + (tag ? tag + '/' : '') + name + '.png  -  ' + note); });
} finally { pg.close(); }
