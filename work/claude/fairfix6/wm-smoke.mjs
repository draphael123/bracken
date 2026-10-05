// scratch: the wicker man in the page. PORT=8619 node work/claude/fairfix6/wm-smoke.mjs
import { openPage, ROOT } from '../../../tools/cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs'; import { join } from 'path';
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const out={};
    const fi=LEVELS.findIndex(l=>l.id==='fair');BK.setHero(${JSON.stringify(process.env.HERO||'knight')});BK.reset({fresh:true});BK.load(fi);BK.state='play';BK.god=false;BK.sim(5);
    const wms=BK.enemies().filter(e=>e.t==='wickerman');out.n=wms.length;out.at=wms.map(e=>[Math.round(e.x/16),Math.round(e.y/16)]);
    const e=wms[0];BK.tp(200,27);BK.P.face=1;BK.sim(2);const hp0=BK.P.hp;let log=[];
    for(let i=0;i<60*6;i++){BK.sim(1);const H=BK.wickerMan();if(i%15===0)log.push(e.mode+':'+H.balls.map(b=>Math.round(b.x)+'/'+Math.round(b.y)+(b.ret?'R':'')).join(';'));}out.H=BK.wickerMan().read();out.P=[BK.P.x,BK.P.y];
    out.log=log.join(' ');out.hurt=hp0-BK.P.hp;out.st=e.st;
    const c=document.createElement('canvas');c.width=BK.view.VW*3;c.height=BK.view.VH*3;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
    BK.P.hp=BK.P.maxHp;for(let i=0;i<200;i++){BK.sim(1);if(e.mode==='throw'||(e.st&&e.st.mode==='throw'))break;}for(let i=0;i<40;i++)BK.sim(1);BK.step(1);out.after=[BK.view.x,BK.view.y,BK.wickerMan().balls.map(b=>[b.x,b.y])];g.drawImage(BK.buf,0,0,c.width,c.height);out.png=c.toDataURL('image/png');
    return out;})()`, 300000);
  mkdirSync(join(ROOT, 'work/claude/fairfix6/smoke'), { recursive: true });
  writeFileSync(join(ROOT, 'work/claude/fairfix6/smoke/wm.png'), Buffer.from(r.png.split(',')[1], 'base64')); delete r.png;
  console.log(JSON.stringify(r)); console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
