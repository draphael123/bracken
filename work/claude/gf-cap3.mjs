import { openPage } from '../../tools/cdp.mjs';
import { writeFileSync } from 'node:fs';
const pg = await openPage({ audio: false, fonts: false });
try { const r = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js');
    BK.manualSimulation = true; BKT.setHeroLevel('knight', 8); BK.setHero('knight'); BK.reset({ fresh: false }); BK.load(LEVELS.findIndex(l => l.id === 'kings')); BK.state = 'play'; BK.sim(10);
    BK.tp(426,13); for(let i=0;i<100;i++){BK.P.hp=BK.P.maxHp;BK.sim(1);} BK.draw1();
    const v=BK.view; const s=v.buf; const px=s.getContext('2d').getImageData(0,0,s.width,s.height).data; let nz=0; for(let i=0;i<px.length;i+=4) if(px[i]+px[i+1]+px[i+2]) nz++;
    return {vk:Object.keys(v), buf:[s.width,s.height], cam:BK.cam, nz, cvs:[...document.querySelectorAll('canvas')].map(c=>c.id+':'+c.width+'x'+c.height)}; })()`, 60000); console.log(JSON.stringify(r)); } finally { await pg.close(); }
