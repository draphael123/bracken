// tools/chase-shots.mjs - THE SPIRAL STAIR (src/spiral-chase.js, Daniel 2026-09-29): pictures of the chase up to the Undead Archmage's
// carpet, rendered with BK.step and saved at 2x into work/undeadchase/<tag>/. God mode. Not in the suite: pictures are for eyes.
// usage: node tools/chase-shots.mjs <tag>
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'after', out = join(ROOT, 'work/undeadchase', tag); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');const SC=await import('/src/spiral-chase.js');BK.manualSimulation=true;const res=[];
    const snap=(name,note)=>{const c=document.createElement('canvas');c.width=BK.view.VW*2;c.height=BK.view.VH*2;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,c.width,c.height);res.push([name,c.toDataURL('image/png'),note]);};
    const run=(n)=>{for(let i=0;i<n;i++){BK.sim(1);if(i%4===0)BK.step(1);}BK.step(1);};
    BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='fallingtower'));BK.state='play';BK.god=true;BK.sim(10);
    BK.tp(31,50);run(60);snap('parapet-ring','the crown parapet: his ring where the door into his hall stood');
    const m=()=>BK.enemies().find(e=>e.t==='magechase');
    BK.tp(33,50);for(let i=0;i<60;i++){BK.keys.right=true;BK.sim(1);}BK.keys.right=false;run(40);snap('spiral-foot','through the ring: the foot of the spiral stair, and him waking over the first landing');
    BK.tp(95,117);run(30);const e=m();for(let i=0;i<400&&!(e.mode==='fireTell');i++)run(1);run(20);snap('fire-tell','flight 1: his FIREBOLT told, the yellow mark over him');run(40);snap('fire-bolt','the bolt on its way');
    BK.tp(91,102);run(10);e.reached=1;for(let i=0;i<600&&!(e.mode==='markWait');i++)run(1);run(30);snap('death-mark','flight 3: the DEATH MARK laid on you, the failing steps');
    BK.tp(96,87);run(120);snap('gallery','flight 5: the failing gallery');
    BK.tp(SC.TOP.check,SC.TOP.row);run(90);snap('top','the top: the door into his hall with his carpet laid in front of it');
    BK.board();run(90);snap('hall','the carpet boarded: his hall, the fight as it was');
    return res;})()`, 600000);
  r.forEach(([name, d, note], j) => { writeFileSync(join(out, String(j).padStart(2, '0') + '-' + name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log(tag + '/' + String(j).padStart(2, '0') + '-' + name, '-', note); });
} finally { pg.close(); }
