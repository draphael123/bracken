import assert from 'node:assert/strict';
import {openPage} from './cdp.mjs';
const pg=await openPage({audio:false,fonts:false});
try {
  const rows=await pg.evalp(`(async()=>{
    BK.manualSimulation=true; const {LEVELS}=await import('/src/level.js'); const rows=[];
    const yard=LEVELS.findIndex(l=>l.id==='trial_open');
    for(const hero of ['knight','warden','pyro','paladin','pirate','reaper']) for(const face of [-1,1]) for(const kind of ['rise','sweep']){
      BK.setHero(hero);BK.load(yard);BK.state='play';BK.enemies().forEach(e=>e.alive=false);BK.tp(10,21);BK.sim(30);BK.reset();
      const p=BK.P; p.face=face;p.st=p.maxSt;BK.keys[kind==='rise'?'up':'down']=true;BK.press('atk');
      const frames=[];
      for(let f=0;f<100;f++){BK.sim(1);BK.step(0);if(p.atk>=0){
        if(p.swingKind!==kind||p.lastKey!==kind)throw Error(hero+' '+kind+' rendered '+p.lastKey+' for '+p.swingKind);
        frames.push(p.lastFrame);
        if(BK.attackBox()&&p.atk>=.02&&p.atk<(kind==='rise'?.17:.15)&&p.lastFrame>=3)throw Error('recovery drawn during directional contact');
      }else if(frames.length)break;}
      if(!frames.includes(1)||!frames.includes(2)||!frames.includes(3))throw Error('missing motion phase '+hero+' '+kind);
      const K=BK.heroSet;if(!K.L[kind]||!K.white.L[kind])throw Error('missing mirrored or hurt-flash pose');
      rows.push({hero,face,kind,frames:[...new Set(frames)]});
      for(const k in BK.keys)BK.keys[k]=false;
    }
    BK.setHero('reaper');Object.assign(BK.P,{atk:.08,heavy:false,swingKind:null,ground:true,hurt:0,dodge:0,charge:0,inv:0});BK.step(0);
    if(BK.P.lastFrame!==0)throw Error('greatsword leaves preparation before its .12 contact window');
    BK.setHero('warden');Object.assign(BK.P,{atk:.28,heavy:true,swingKind:null,ground:true});BK.step(0);
    if(BK.P.lastKey!=='heavy'||BK.P.lastFrame!==2)throw Error('run-through recovers while its full reach is still live');
    return rows;
  })()`);
  assert.equal(rows.length,24);assert.deepEqual(pg.errors,[]);
  console.log('24 real-input directional attacks render preparation, contact and recovery in both directions; greatsword and spear timing verified.');
} finally {pg.close();}
