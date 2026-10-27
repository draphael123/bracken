import { openPage } from '../../tools/cdp.mjs';
import { writeFileSync } from 'node:fs';
const out='work/claude/shots-gormfinish';
const pg = await openPage({ audio: false, fonts: false });
try {
  await pg.evalp(`(async () => { const { LEVELS, T } = await import('/src/level.js');
    BK.manualSimulation = true; BKT.setHeroLevel('knight', 8); BK.setHero('knight'); BK.reset({ fresh: false }); BK.load(LEVELS.findIndex(l => l.id === 'kings')); BK.state = 'play'; BK.god = true; BK.sim(10);
    window.T_=T; window.SH=[]; const P=BK.P, K=()=>BK.enemies().find(e=>e.t==='king'); BK.god=false; BK.tp(426,13); for(let i=0;i<150;i++){P.hp=P.maxHp;BK.sim(1);} let b=K(); b.hp=3; b.open=0; b.ward=0; b.mode='carried'; BKT.hurtEnemy(b,40,b.x-10,false); for(let i=0;i<500;i++){P.hp=P.maxHp;P.dead=0;if(BK.state==='card')BK.cardClose();BK.sim(1);} BK.god=true; return K().stage; })()`, 60000);
  const xs=[]; for (const x of [644,652,660,668,676,684]) xs.push(x);
  const r = await pg.evalp(`(async()=>{ const L=BK.L, T=T_; const xs=${JSON.stringify(xs)}; const cells=[];
    for (const x of xs) { let y=14;
      BK.tp(x,y-1); for(let i=0;i<40;i++){BK.P.hp=BK.P.maxHp;BK.sim(1);} BK.draw1(); const c=document.createElement('canvas'); c.width=629; c.height=311; c.getContext('2d').drawImage(BK.view.buf,0,0); cells.push({x,c}); }
    const cols=3,sc=0.8,w=Math.round(629*sc),h=Math.round(311*sc), sheets=[]; const per=6;
    for(let s0=0;s0<cells.length;s0+=per){ const part=cells.slice(s0,s0+per); const rows=Math.ceil(part.length/cols); const c=document.createElement('canvas'); c.width=cols*w; c.height=rows*h; const g=c.getContext('2d'); part.forEach((q,i)=>{ const X=(i%cols)*w,Y=Math.floor(i/cols)*h; g.drawImage(q.c,X,Y,w,h); g.fillStyle='#ff0'; g.font='11px monospace'; g.fillText('tile x'+q.x,X+4,Y+12); g.strokeStyle='#000'; g.strokeRect(X,Y,w,h); }); sheets.push(c.toDataURL('image/png')); }
    return sheets; })()`, 280000);
  r.forEach((d,i)=>writeFileSync(out+'/kings-glade-'+(i+1)+'.png',Buffer.from(d.split(',')[1],'base64')));
  console.log(r.length+' sheets');
} finally { await pg.close(); }
