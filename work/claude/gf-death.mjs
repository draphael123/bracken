import { openPage } from '../../tools/cdp.mjs';
import { writeFileSync } from 'node:fs';
const out='work/claude/shots-gormfinish';
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js');
    BK.manualSimulation = true; BKT.setHeroLevel('knight', 8); BK.setHero('knight'); BK.reset({ fresh: false }); BK.load(LEVELS.findIndex(l => l.id === 'kings')); BK.state = 'play'; BK.god = false; BK.sim(10);
    const P=BK.P, step=n=>{for(let i=0;i<n;i++){if(BK.state==='card')BK.cardClose();BK.sim(1);}}, keep=()=>{P.hp=P.maxHp;P.dead=0;};
    const K=()=>BK.enemies().find(e=>e.t==='king'); BK.tp(426,13); for(let i=0;i<150;i++){keep();step(1);} let b=K(); b.hp=3; b.open=0; b.ward=0; b.mode='carried'; BKT.hurtEnemy(b,40,b.x-10,false); for(let i=0;i<500;i++){keep();step(1);} b=K();
    const gx=b.x; P.x=gx-200; P.y=b.y; P.vx=0; for(let i=0;i<400&&!(b.club&&b.mode==='walk');i++){keep();P.x=Math.max(P.x,gx-200);step(1);}
    P.x=b.x-60; P.y=b.y; b.hp=1; b.open=0; b.ward=0; b.stagger=0; const n0=BK.corpses().length; BKT.hurtEnemy(b,500,P.x,false);
    const cells=[]; const W=190,H=120;
    for(let k=0;k<12;k++){ keep(); step(8); BK.draw1(); const cs=BK.corpses().slice(n0).find(c=>c.t==='kingUp'); const cam=BK.cam; const cx=(cs?cs.x:b.x), cy=(cs?cs.y:b.y); const c=document.createElement('canvas'); c.width=W; c.height=H; const g=c.getContext('2d'); g.drawImage(BK.view.buf,Math.round(cx-cam[0]-W/2),Math.round(cy-cam[1]-H*0.75),W,H,0,0,W,H); cells.push({c,l:'t'+(k*8)+' '+(cs?cs.frame+' y'+Math.round(cs.y)+' rot'+cs.rot.toFixed(2):'nocorpse')}); }
    const sc=2,cols=4,rows=3; const sh=document.createElement('canvas'); sh.width=cols*W*sc; sh.height=rows*H*sc; const g=sh.getContext('2d'); g.imageSmoothingEnabled=false; cells.forEach((q,i)=>{const X=(i%cols)*W*sc,Y=Math.floor(i/cols)*H*sc; g.drawImage(q.c,X,Y,W*sc,H*sc); g.fillStyle='#ff0'; g.font='11px monospace'; g.fillText(q.l,X+4,Y+12);});
    return { png: sh.toDataURL('image/png'), alive: b.alive, state: BK.state, corpses: BK.corpses().slice(n0).map(c=>c.t+':'+c.frame) }; })()`, 120000);
  writeFileSync(out+'/gorm-death-debris.png', Buffer.from(r.png.split(',')[1],'base64')); delete r.png; console.log(r);
} finally { await pg.close(); }
