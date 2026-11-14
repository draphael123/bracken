// PAGE TOOL: launches headless Chrome
/* tools/rookery4-shots.mjs [only,tags] - real-page stills of ROOKERY 4 (claude/rookery4tune): the summit with the nests up and dropped, the overhang's steps, the vents open, the support moves
   (pebble, the MARK, the gust), friendly fire, a sister mid fall arc, and the turn-order portraits at the hand-over. Headless Chrome through tools/cdp.mjs, the knight in god mode.
   Not in the suite. OUT=<dir> (default work/claude/shots/rookery4)   PORT=<port> node tools/rookery4-shots.mjs */
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)), OUT = process.env.OUT || join(ROOT, 'work', 'claude', 'shots', 'rookery4');
const only = process.argv[2] ? new Set(process.argv[2].split(',')) : null;
mkdirSync(OUT, { recursive: true });
/* quiet: nobody starts anything but what the shot forces */
const quiet = `{for(const r of ['diver','shrieker','snatcher']){const q=S.sis[r];q.cd=99;}S.grabCd=99;S.snatchCd=99;S.turnT=999;S.supCd=999;}`;
/* snap the arm of a nest / the overhang by a real dive of the Hunter onto its foot (the hero stands on it, then steps off as the line locks) */
const breakFoot = (role, xExpr) => `{S.hunter='${role}';S.hand=0;const d=S.sis['${role}'];d.mode='hover';d.cd=0;d.nAtk=0;S.tLast=-99;S.lastRel=-99;const fx=${xExpr};P.x=fx;P.vx=0;
  for(let i=0;i<500;i++){P.hp=P.maxHp;BK.step(1);if(d.mode==='diveTell'&&d.aim&&d.aim.lock)P.x=fx+(fx<S.G.mid?70:-70);if(d.mode==='land'||d.mode==='downed'||d.mode==='jar'||d.mode==='rise')break;}${'' }BK.sim(8);}`;
const SHOTS = [
  ['summit-up', `{}`, null],
  ['nests-down', `{${quiet.slice(1, -1)}
    for(const n of S.G.nests.slice()){ ${breakFoot('diver', 'n.footX').slice(1, -1)} ${quiet.slice(1, -1)} BK.sim(30);} P.x=S.G.mid-40;BK.sim(40);}`, null],
  ['steps', `{${quiet.slice(1, -1)} ${breakFoot('diver', 'S.G.over.footX').slice(1, -1)} BK.sim(90);P.x=S.G.over.footX-80;BK.sim(30);}`, 'over'],
  ['vents-open', `{${quiet.slice(1, -1)} S.sis.snatcher.hp=0;BK.sim(150);P.x=S.G.mid-30;BK.sim(60);}`, 'vent'],
  ['pebble', `{${quiet.slice(1, -1)} S.hunter='shrieker';S.hand=0;S.supCd=0;S.supI=0;S.sis.shrieker.mode='hover';S.sis.diver.mode='perched';S.sis.snatcher.mode='perched';for(let i=0;i<300&&S.sis.diver.mode!=='pebbleTell';i++)BK.step(1);BK.sim(12);}`, 'diver'],
  ['support-mark', `{${quiet.slice(1, -1)} S.hunter='diver';S.hand=0;S.supCd=0;S.supI=1;S.sis.diver.mode='hover';S.sis.shrieker.mode='perched';S.sis.snatcher.mode='perched';for(let i=0;i<300&&S.sis.shrieker.mode!=='markTell';i++)BK.step(1);BK.sim(28);}`, 'shrieker'],
  ['gust', `{${quiet.slice(1, -1)} S.hunter='diver';S.hand=0;S.supCd=0;S.supI=2;S.sis.diver.mode='hover';S.sis.shrieker.mode='perched';S.sis.snatcher.mode='perched';for(let i=0;i<300&&S.sis.snatcher.mode!=='gustTell';i++)BK.step(1);BK.sim(20);}`, 'snatcher'],
  ['handover', `{${quiet.slice(1, -1)} S.hunter='diver';S.turnT=0.01;S.sis.diver.mode='hover';for(let i=0;i<200&&!(S.hand>0);i++)BK.step(1);BK.sim(14);}`, null],
  ['fall-arc', `{${quiet.slice(1, -1)} ${breakFoot('diver', 'S.G.nests[0].footX').slice(1, -1)} }`, 'crash'],
].filter(s => !only || only.has(s[0]));
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const LV=(await import('/src/level.js')).LEVELS;const idx=LV.findIndex(l=>l.id==='rookery');BK.manualSimulation=true;
    const snap=(foc,full)=>{const c=document.createElement('canvas');c.width=640;c.height=360;const g=c.getContext('2d');g.imageSmoothingEnabled=false;if(!foc){g.drawImage(BK.buf,0,0,640,360);return c.toDataURL('image/png');}
      const [cx,cy]=BK.cam,k=BK.buf.width/640,sx=Math.max(0,Math.min(BK.buf.width-320*k,(foc.x-cx)*k-160*k)),sy=Math.max(0,Math.min(BK.buf.height-180*k,(foc.y-cy)*k-110*k));g.drawImage(BK.buf,sx,sy,320*k,180*k,0,0,640,360);return c.toDataURL('image/png');};
    let P,SH,S;const tp=(x,y)=>{BK.tp(x,y);P.vx=0;P.vy=0;BK.sim(4);};
    const load=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(idx);BK.start();BK.god=true;BK.sim(420);P=BK.P;SH=BK.shriekSistersHands();};
    const boss=()=>{BK.tp(Math.round(BK.L.arena.x0/16)+10,10);BK.sim(300);S=SH.show();P.x=S.G.mid-60;BK.sim(2);};
    const out=[];for(const [tag,code,foc] of ${JSON.stringify(SHOTS)}){load();try{boss();eval(code);BK.step(1);let f=null;
      if(foc==='over'&&S.G.over)f={x:S.G.over.footX,y:S.G.floorY-60};else if(foc==='vent'&&S.G.vents[0])f={x:S.G.vents[0].x,y:S.G.floorY-60};else if(foc==='crash'){const q=S.sis.snatcher.crash?S.sis.snatcher:S.sis.diver;f={x:q.x,y:q.y};}else if(foc&&S.sis[foc])f=S.sis[foc];
      out.push({tag,png:snap(null),png2:f?snap(f):null,info:JSON.stringify({hunter:S.hunter,modes:['diver','shrieker','snatcher'].map(r=>S.sis[r].mode),nests:S.G.nests.map(n=>n.st),over:S.G.over&&S.G.over.st,vents:S.G.vents.map(v=>v.open)})});}catch(e){out.push({tag,err:String(e&&e.stack||e).slice(0,300)});}}
    BK.manualSimulation=false;return out;})()`, 900000);
  for (const s of r) { if (s.err) { console.log(s.tag + ' ERROR ' + s.err); continue; }
    writeFileSync(join(OUT, 'rookery4-' + s.tag + '.png'), Buffer.from(s.png.split(',')[1], 'base64'));
    if (s.png2) writeFileSync(join(OUT, 'rookery4-' + s.tag + '-zoom.png'), Buffer.from(s.png2.split(',')[1], 'base64'));
    console.log('rookery4-' + s.tag + '.png ' + s.info); }
  if (pg.errors.length) console.log('page errors', pg.errors.slice(0, 5));
} finally { await pg.close(); }
process.exit(0);
