// tools/riposte-shots.mjs - THE PARRY AND THE RIPOSTE, LIVE (claude/riposteart): every hero parries a sprig through his real input, and the drawn frame (BK.step renders it) is cropped round him
// at the catch, the hold, then at the three beats of the riposte strike (step-in, cut, follow-through); the foe's recoil is cropped with him. One row a hero. Also asserts the draw CHOSE the
// new keys (P.lastKey 'parry' while the pose runs, 'ripo' through the strike) - the art is wired, not just baked.   node tools/riposte-shots.mjs [out.png]
import assert from 'node:assert/strict';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { openPage } from './cdp.mjs';
const OUT = process.argv[2];   /* no path: assert only (the check); a path: also write the sheet */
if (OUT) mkdirSync(dirname(OUT), { recursive: true });
const HEROES = ['knight', 'warden', 'pyro', 'paladin', 'pirate', 'reaper', 'geomancer', 'berserker'];
const CW = 96, CH = 64, SC = 3;
const pg = await openPage({ audio: false, fonts: false });
try {
  await pg.evalp(`(async()=>{
    window.__set=(h,foes,lv=1)=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero(h);BK.reset({fresh:true});BKT.setHeroLevel(h,lv);
      BKT.PROG.skillOwned[h]={};BKT.PROG.loadouts[h]=[];BK.applyUpgrades();BK.load(0);BK.state='play';BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');
      const L=BK.L;for(let x=2;x<60;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;BK.tp(10,21);BK.sim(60);const P=BK.P;P.hp=P.maxHp;P.inv=0;P.st=P.maxSt;P.face=1;P.combo=0;P.riposteT=0;P.mixN=0;P.mixLast=null;
      return foes.map(([t,dx,o])=>{BK.spawnEnt({t,x:(P.x+dx)/16,y:21,...(o||{})});const e=BK.enemies().at(-1);e.hp=e.hp0=5000;e.cd=99;e.elT=99;return e;});};
    window.__answer=(how,n)=>{const K=BK.keys;if(how==='hold'){K.block=true;BK.sim(n);}else if(how==='tap'){K.block=true;BK.sim(1);K.block=false;BK.sim(n);}else if(how==='down'){K.down=true;let hh=0;while(!(BK.ember&&BK.ember()&&BK.ember().flare)&&hh<60){BK.sim(1);hh++;}K.down=false;BK.sim(n);}else if(how==='release'){K.block=true;BK.sim(45);K.block=false;BK.sim(n);}};
    window.__crop=(label)=>{const v=BK.view,P=BK.P,z=v.z||1,sx=v.VW/2+(P.x-v.x-v.VW/2)*z,sy=v.VH/2+(P.y-v.y-v.VH/2)*z;
      const c=document.createElement('canvas');c.width=${CW};c.height=${CH};const g=c.getContext('2d');g.imageSmoothingEnabled=false;
      g.drawImage(v.buf,Math.round(sx-${CW / 2 - 14}),Math.round(sy-${CH - 10}),${CW},${CH},0,0,${CW},${CH});return {c,label:label+' '+P.lastKey+':'+P.lastFrame};};
    window.__shots=[];return 1})()`);
  const rows = [], keys = {};
  for (const h of HEROES) {
    const r = await pg.evalp(`(()=>{const h=${JSON.stringify(h)},R=BK.riposte(),out={keys:[]};
      for(const how of ['hold','tap','down','release'])for(let n=0;n<=24;n++){const [e]=__set(h,[['sprig',16]]);const P=BK.P;R.resetStats();__answer(how,n);P.inv=0;P.hurt=0;
        BKT.damagePlayer(P.x+14,10,{});BK.keys.block=false;BK.keys.down=false;
        if(R.stats.parries>0&&P.ripSrc==='parry'&&P.riposteT>0){
          const s=[];BK.step(1);out.keys.push(P.lastKey);s.push(__crop('catch'));BK.step(7);out.keys.push(P.lastKey);s.push(__crop('hold'));
          BK.step(14);e.x=P.x+16;P.face=1;P.inv=0;
          BK.press('atk');for(let i=0;i<24&&!(P.atk>=0);i++)BK.step(1);
          const seen=[];for(let i=0;i<40&&P.atk>=0;i++){seen.push(P.lastKey+':'+P.lastFrame);if(i===1)s.push(__crop('step'));if(i===4)s.push(__crop('cut'));if(i===9)s.push(__crop('thru'));BK.step(1);}
          out.strike=seen;out.how=how+n;__shots.push(s);return out;}}
      return null;})()`);
    assert(r, h + ': parried through its real input');
    rows.push(h); keys[h] = r;
    console.log(h.padEnd(10), r.how, 'pose keys', r.keys.join(','), '| strike', [...new Set(r.strike)].join(' '));
    assert(r.keys[0] === 'parry', h + ': the catch frame is drawn from the parry key (got ' + r.keys[0] + ')');
    assert(r.strike.some(k => k.startsWith('ripo:0')) && r.strike.some(k => k.startsWith('ripo:1')) && r.strike.some(k => k.startsWith('ripo:2')), h + ': the riposte strike plays all three frames (got ' + [...new Set(r.strike)].join(' ') + ')');
  }
  if (OUT) { const url = await pg.evalp(`(()=>{const rows=${JSON.stringify(rows)},shots=__shots,W=${CW * SC},H=${CH * SC},LW=96,cols=5,gap=4;
    const c=document.createElement('canvas');c.width=LW+cols*(W+gap);c.height=rows.length*(H+gap)+4;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
    g.fillStyle='#14121c';g.fillRect(0,0,c.width,c.height);g.font='bold 14px monospace';
    rows.forEach((r,i)=>{const y=2+i*(H+gap);g.fillStyle='#e8dcc0';g.fillText(r,6,y+H/2);shots[i].forEach((s,j)=>{const x=LW+j*(W+gap);g.drawImage(s.c,x,y,W,H);g.fillStyle='#e8dcc0';g.font='11px monospace';g.fillText(s.label,x+4,y+12);});});
    return c.toDataURL('image/png')})()`);
  writeFileSync(OUT, Buffer.from(url.split(',')[1], 'base64')); console.log('wrote ' + OUT); }
  if (pg.errors.length) console.log('page errors:', pg.errors.slice(0, 5));
} finally { pg.close(); }
