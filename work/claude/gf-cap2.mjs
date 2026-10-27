// gormfinish: sequences of King Gorm in the live game. Each scenario -> a contact sheet (crop around the king, x2).
import { openPage } from '../../tools/cdp.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
const out='work/claude/shots-gormfinish'; mkdirSync(out,{recursive:true});
const which = process.argv[2];
const pg = await openPage({ audio: false, fonts: false });
const setup = `(async () => { const { LEVELS } = await import('/src/level.js');
  BK.manualSimulation = true; BKT.setHeroLevel('knight', 8); BK.setHero('knight'); BK.reset({ fresh: false }); BK.load(LEVELS.findIndex(l => l.id === 'kings')); BK.state = 'play'; BK.god = false; BK.sim(10);
  window.P=BK.P; window.keep=()=>{P.hp=P.maxHp;P.dead=0;}; window.step=n=>{for(let i=0;i<n;i++){if(BK.state==='card')BK.cardClose();BK.sim(1);}};
  window.K=()=>BK.enemies().find(e=>e.t==='king');
  /* crop: a W x H window centred on the king, drawn x2 into a sheet cell */
  window.SHEET=[]; window.snap=(label)=>{ BK.draw1(); const b=K(); const v=BK.view, cam=BK.cam; const s=v.buf; const W=window.CW||190,H=window.CH||100;
    let sx=Math.round(b.x-cam[0]-W/2), sy=Math.round(b.y-cam[1]-H*0.9); sx=Math.max(0,Math.min(s.width-W,sx)); sy=Math.max(0,Math.min(s.height-H,sy));
    const c=document.createElement('canvas'); c.width=W; c.height=H; c.getContext('2d').drawImage(s,sx,sy,W,H,0,0,W,H); SHEET.push({label,c,x:b.x,mode:b.mode,vx:b.vx}); };
  window.sheet=(cols,sc)=>{ const W=window.CW||190,H=window.CH||100,n=SHEET.length,rows=Math.ceil(n/cols); const c=document.createElement('canvas'); c.width=cols*W*sc; c.height=rows*(H*sc+0); const g=c.getContext('2d'); g.imageSmoothingEnabled=false; g.fillStyle='#000'; g.fillRect(0,0,c.width,c.height);
    SHEET.forEach((s,i)=>{ const x=(i%cols)*W*sc,y=Math.floor(i/cols)*H*sc; g.drawImage(s.c,x,y,W*sc,H*sc); g.fillStyle='#ff0'; g.font='10px monospace'; g.fillText(s.label+' '+s.mode+' x'+s.x.toFixed(1),x+3,y+11); g.strokeStyle='#444'; g.strokeRect(x,y,W*sc,H*sc); });
    return c.toDataURL('image/png'); };
  return true; })()`;
const save=(n,d)=>writeFileSync(out+'/'+n+'.png',Buffer.from(d.split(',')[1],'base64'));
try {
  await pg.evalp(setup,60000);
  const run = async (name, code, cols=4, sc=2) => { const r = await pg.evalp(`(async()=>{ ${code}; return { png: sheet(${cols},${sc}), log: SHEET.map(s=>s.label+' '+s.mode+' x'+s.x.toFixed(2)+' vx'+(s.vx||0).toFixed(1)) }; })()`, 120000); save(name, r.png); console.log(name+':\n  '+r.log.join('\n  ')); };
  if (which==='hall') {
    await run('hall-walk', `BK.tp(426,13); for(let i=0;i<150;i++){keep();step(1);} SHEET.length=0; for(let k=0;k<12;k++){ step(4); keep(); snap('t'+(k*4)); }`);
  }
  if (which==='hallzoom') { await run('hall-zoom', `window.CW=130;window.CH=62; BK.tp(426,13); for(let i=0;i<150;i++){keep();step(1);} SHEET.length=0; for(let k=0;k<8;k++){ step(8); keep(); snap('t'+(k*8)); }`, 4, 3); }

  const RISE = `window.CW=120;window.CH=84; const b=K(); BK.tp(426,13); for(let i=0;i<150;i++){keep();step(1);} b.hp=b.maxHp*0.2; b.open=0; b.ward=0; step(2); for(let i=0;i<200&&b.mode!=='walk';i++){keep();step(1);} `;
  if (which==='p2walk') { await run('hall-p2-walk', RISE+`P.x=b.x-150; P.y=224; P.vx=0; for(let i=0;i<20;i++){keep();step(1);} SHEET.length=0; for(let k=0;k<12;k++){ keep(); step(10); snap('t'+(k*10)); }`, 4, 3); }
  if (which==='p2turn') { await run('hall-p2-sidestep', RISE+`P.x=b.x-150; P.y=224; P.vx=0; for(let i=0;i<30;i++){keep();step(1);} SHEET.length=0; for(let k=0;k<16;k++){ keep(); if(k===5){P.x=b.x+120;P.y=224;P.vx=0;} step(5); snap('t'+(k*5)); }`, 4, 3); }
  if (which==='held') { await run('hall-held-walk', RISE+`P.x=b.x-150; P.y=224; P.vx=0; step(5); b.mode='held'; b.modeT=0.5; SHEET.length=0; for(let k=0;k<16;k++){ keep(); step(6); snap('t'+(k*6)); }`, 4, 3); }
  if (which==='charge') { await run('hall-charge-flee', `window.CW=190;window.CH=84; const b=K(); BK.tp(426,13); for(let i=0;i<150;i++){keep();step(1);} P.x=b.x-260; P.y=224; P.vx=0; b.mode='chargeTell'; b.modeT=0.8; b.chargeT=9; b.grabT=9; b.hornT=9; SHEET.length=0; for(let k=0;k<16;k++){ keep(); step(8); snap('t'+(k*8)); }`, 4, 2); }
  if (which==='flee') { await run('hall-flee-bearers', `window.CW=200;window.CH=90; const b=K(); BK.tp(426,13); for(let i=0;i<150;i++){keep();step(1);} P.x=b.x-200; P.y=224; b.hp=3; b.open=0; b.ward=0; b.mode='carried'; BKT.hurtEnemy(b,40,b.x-10,false); SHEET.length=0; for(let i=0;i<120;i++){keep();step(1);} for(let k=0;k<12;k++){ keep(); for(let j=0;j<5;j++){P.x=b.x-120;P.y=224;P.vx=0;step(1);} snap('t'+(k*5)); }`, 3, 1.5); }
  if (which==='rise') { await run('hall-litter-break', `window.CW=170;window.CH=80; const b=K(); BK.tp(426,13); for(let i=0;i<150;i++){keep();step(1);} P.x=b.x-100; P.y=224; b.hp=b.maxHp*0.2; b.open=0; b.ward=0; SHEET.length=0; for(let k=0;k<12;k++){ keep(); step(5); snap('t'+(k*5)); }`, 4, 2); }
  if (which==='glade') {
    await run('glade-walk', `window.CW=130;window.CH=90; let b=K(); BK.tp(426,13); for(let i=0;i<150;i++){keep();step(1);} b.hp=3; b.open=0; b.ward=0; b.mode='carried'; BKT.hurtEnemy(b,40,b.x-10,false); for(let i=0;i<500;i++){keep();step(1);} b=K();
      const gx=b.x; P.x=gx-200; P.y=b.y; P.vx=0; for(let i=0;i<400&&!(b.club&&b.mode==='walk');i++){keep();P.x=Math.max(P.x,gx-200);step(1);}
      const log0=[b.mode,b.club,b.stage,b.phase,b.x,P.x].join(',');
      for(let i=0;i<30;i++){keep();step(1);} SHEET.length=0; for(let k=0;k<12;k++){ keep(); P.x=b.x-140;P.y=b.y;P.vx=0; step(10); snap('t'+(k*10)); } SHEET[0].label=log0;`, 4, 3);
  }
  if (which==='glade2') {
    await run('glade-sidestep-oak', `window.CW=130;window.CH=90; let b=K(); BK.tp(426,13); for(let i=0;i<150;i++){keep();step(1);} b.hp=3; b.open=0; b.ward=0; b.mode='carried'; BKT.hurtEnemy(b,40,b.x-10,false); for(let i=0;i<500;i++){keep();step(1);} b=K();
      const gx=b.x; P.x=gx-200; P.y=b.y; P.vx=0; for(let i=0;i<400&&!(b.club&&b.mode==='walk');i++){keep();P.x=Math.max(P.x,gx-200);step(1);}
      SHEET.length=0; for(let k=0;k<12;k++){ keep(); if(k===5){P.x=b.x+140;} else if(k<5||k>5){} P.y=b.y;P.vx=0; if(k<5)P.x=b.x-140; step(10); snap('t'+(k*10)); }`, 4, 3);
  }
} finally { await pg.close(); }
