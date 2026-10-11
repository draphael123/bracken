// tools/order-shots.mjs - THE ROAD WARDENS, LOOKED AT (claude/order): the three exams with their knight in place (his gate and its banner),
// and a sheet of every body's frames in each built chapter's skin. Writes work/claude/order/<tag>-*.png for the Sonnet art lane.
//   node tools/order-shots.mjs [tag]      (PORT from the environment)
import { openPage, ROOT } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'greybox', dir = join(ROOT, 'work/claude/order'); mkdirSync(dir, { recursive: true });
const pg = await openPage({ audio: false, fonts: true });
const save = (name, url) => { writeFileSync(join(dir, tag + '-' + name + '.png'), Buffer.from(url.split(',')[1], 'base64')); console.log('wrote ' + tag + '-' + name + '.png'); };
try {
  for (const [id, t, mode] of [['wood', 'oathmaul', 'slamTell'], ['marsh', 'oathblade', 'cutTell'], ['oreroad', 'oathlance', 'chargeTell']]) {
    const url = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.setHero('knight');BK.reset({fresh:true});
      BK.load(LEVELS.findIndex(l=>l.id==='${id}'));BK.state='play';BK.god=true;BK.sim(3);const e=BK.enemies().find(q=>q.t==='${t}');
      BK.tp(Math.round(e.x/16)-3,Math.round(e.y/16)-1);BK.sim(2);BK.look(Math.round((e.x/16+e.gate)/2),Math.round(e.y/16)-2);e.elT=99;e.mode='${mode}';e.modeT=0.1;e.elBack=['walk',0];BK.step(40);e.elT=99;e.mode='${mode}';e.modeT=0.3;e.elBack=['walk',0];e.okTell0=0.6;e.okMark=null;BK.step(1);
      const v=BK.view,c=document.createElement('canvas');c.width=v.buf.width*3;c.height=v.buf.height*3;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(v.buf,0,0,c.width,c.height);return c.toDataURL('image/png');})()`);
    save(id, url);
  }
  const sheet = await pg.evalp(`(()=>{const T=['oathblade','oathmaul','oathlance','oathmage'],CH=['thorn','bog','ore'],S=2,W=92*S,H=72*S;
    const c=document.createElement('canvas');c.width=12*W+120;c.height=T.length*CH.length*H;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#5a6a7a';g.fillRect(0,0,c.width,c.height);g.font='bold 14px monospace';
    let row=0;for(const t of T)for(const ch of CH){const s=BK.SPR[t+'_'+ch]||BK.SPR[t];g.fillStyle='#fff';g.fillText(t,4,row*H+20);g.fillText(ch+(BK.SPR[t+'_'+ch]?'':' (base)'),4,row*H+38);
      s.R.forEach((f,i)=>g.drawImage(f,120+i*W,row*H,f.width*S,f.height*S));row++;}
    return c.toDataURL('image/png');})()`);
  save('sheet', sheet);
  if (pg.errors.length) console.log('page errors:', pg.errors.slice(0, 5));
} finally { await pg.close(); }
