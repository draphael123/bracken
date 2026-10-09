import { open, reboot, sleep } from './lib.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
const h = await open('anim'); const { E, shot, out } = h;
try {
  await reboot(h); await E('BK.manualSimulation=true');
  await E(`(async()=>{const {LEVELS}=await import('/src/level.js');window.__LV=LEVELS;})()`);
  const play = async (id) => E(`(()=>{BK.manualSimulation=true;BK.setHero('knight');BK.reset({fresh:true});BK.load(__LV.findIndex(l=>l.id==='${id}'));BK.state='play';BK.sim(20);BK.step(3);})()`);
  for (const id of ['wood','welltown','canal','theatre','reef']) { try { await play(id); await E('BK.step(40)'); await shot('level-'+id); } catch(e){console.log('lvl fail',id,e.message);} }
  // hero attack strip: crop strip of 8 frames at x3
  await play('wood');
  await E(`(()=>{const L=BK.L;BK.enemies().forEach(e=>e.alive=false);BK.P.hp=BK.P.maxHp;BK.step(10);})()`);
  const strip = async (name, pressJs, frames, crop) => {
    await E(pressJs);
    const imgs = [];
    for (const f of frames) { await E(`BK.step(${f})`); const r = await h.send('Page.captureScreenshot', { format: 'png', clip: crop(await E(`(()=>{const v=BK.view,P=BK.P;return {x:(P.x-v.x),y:(P.y-v.y),sc:innerWidth/v.VW}})()`)) }); imgs.push(r.result.data); }
    await E(`window.__strip=${JSON.stringify(imgs)}`);
    // compose in-page
    const data = await E(`(async()=>{const im=await Promise.all(__strip.map(d=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src='data:image/png;base64,'+d;})));const c=document.createElement('canvas');c.width=im[0].width*im.length;c.height=im[0].height;const g=c.getContext('2d');im.forEach((i,k)=>g.drawImage(i,k*i.width,0));return c.toDataURL('image/png').split(',')[1]})()`);
    writeFileSync(out + name + '.png', Buffer.from(data, 'base64')); console.log('wrote', name);
  };
  const crop = p => { const s = p.sc; return { x: Math.max(0, (p.x - 40) * s), y: Math.max(0, (p.y - 60) * s), width: 140 * s, height: 90 * s, scale: 1 }; };
  await strip('hero-attack-strip', `(()=>{BK.P.face=1;dispatchEvent(new KeyboardEvent('keydown',{key:'x'}));BK.step(1);dispatchEvent(new KeyboardEvent('keyup',{key:'x'}));})()`, [2,2,2,2,2,2,2,3], crop);
  await strip('hero-jump-strip', `(()=>{dispatchEvent(new KeyboardEvent('keydown',{key:'z'}));BK.step(1);dispatchEvent(new KeyboardEvent('keyup',{key:'z'}));})()`, [2,3,3,4,4,5,6,6], crop);
  await strip('hero-run-strip', `(()=>{dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight'}));})()`, [3,3,3,3,3,3,3,3], crop);
  await E(`dispatchEvent(new KeyboardEvent('keyup',{key:'ArrowRight'}))`);
  // foe tell: spawn a foe ahead
  await E(`(()=>{BK.step(30);BK.spawnEnt({t:'sprig',x:(BK.P.x+40)/16,y:Math.floor(BK.P.y/16)});BK.step(2);})()`);
  const crop2 = p => { const s = p.sc; return { x: Math.max(0, (p.x - 30) * s), y: Math.max(0, (p.y - 60) * s), width: 130 * s, height: 90 * s, scale: 1 }; };
  await strip('foe-sprig-strip', `BK.step(1)`, [4,4,4,4,4,4,4,4], crop2);
} catch(e){ console.log('ERR', e.stack); } finally { await h.pg.close(); }
