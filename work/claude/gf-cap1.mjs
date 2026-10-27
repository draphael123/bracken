import { openPage } from '../../tools/cdp.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
const out='work/claude/shots-gormfinish'; mkdirSync(out,{recursive:true});
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js');
    BK.manualSimulation = true; BKT.setHeroLevel('knight', 8); BK.setHero('knight'); BK.reset({ fresh: false }); BK.load(LEVELS.findIndex(l => l.id === 'kings')); BK.state = 'play'; BK.god = false; BK.sim(10);
    const P=BK.P; BK.tp(426,13); for(let i=0;i<200;i++){P.hp=P.maxHp;BK.sim(1);}
    const b=BK.enemies().find(e=>e.t==='king'); 
    const c=document.createElement('canvas'); c.width=BK.view.VW; c.height=BK.view.VH; c.getContext('2d').drawImage(BK.view.buf,0,0);
    return {mode:b.mode,x:b.x,y:b.y,vw:BK.view.VW,vh:BK.view.VH,png:c.toDataURL('image/png'), keys:Object.keys(BK).filter(k=>/draw|render|frame|cam/i.test(k))}; })()`, 60000);
  writeFileSync(out+'/probe1.png', Buffer.from(r.png.split(',')[1],'base64')); delete r.png; console.log(r);
} finally { await pg.close(); }
