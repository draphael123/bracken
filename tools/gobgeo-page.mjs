// PAGE TOOL: launches headless Chrome
/* tools/gobgeo-page.mjs - THE GOBLIN GEOMANCER, THE PAGE HALF (claude/gobgeo): every hero's REAL parry (src/lab.js parryAt: the knight's guard, the warden's deflect, the
   pyro's ward, ...) on the TEACH Geomancer's rock in the Captains Hall sends it back and shatters the seal on the gate; and every hero's REAL BLOW (an attack pressed as
   the rock arrives) does too. One headless page, ~1 min. Not in the suite.  PORT=<free port> node tools/gobgeo-page.mjs */
import { openPage } from './cdp.mjs';
const HEROES = (process.env.HEROES || 'knight,warden,pyro,paladin,pirate,reaper,geomancer,berserker,ranger').split(',');
const pg = await openPage({ audio: false, fonts: false });
let out;
try {
  out = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');const lab=await import('/src/lab.js');const HEROES=${JSON.stringify(HEROES)};const res={};
    const load=h=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero(h);BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='crown'));BK.state='play';BK.god=false;BK.sim(5);};
    const hold=()=>{if(BK.state==='card')BK.cardClose();BK.P.hp=BK.P.maxHp;};
    /* the rock's true time to the hero (it is a LOB: gravity shortens the straight-line estimate lab.parryShot makes for the Queen's flat shards) */
    const ttiOf=r=>{let x=r.x,y=r.y,vy=r.vy;const P=BK.P;for(let t=0;t<2;t+=1/240){x+=r.vx/240;vy+=(r.g||0)/240;y+=vy/240;if(Math.abs(x-P.x)<9&&y>P.y-26&&y<P.y+2)return t;}return null;};
    /* (claude/gobgeo) the guard's timing for a LOB, per hero, where src/lab.js's Queen-shard leads (GQ_RAISE 0.06) miss it: found by sweeping the lead (0.02-0.25 s, held and tapped) - each of these three parries his rock only at its own beat */
    const LEAD={paladin:{at:0.25},geomancer:{at:0.15},reaper:{at:0.1,tap:true}};
    const geo=()=>BK.enemies().find(e=>e.t==='gobgeo'&&e.sealId==='gg-teach');
    for(const h of HEROES){ res[h]={};
      for(const how of ['parry','blow']){ load(h); BK.tp(437,19); BK.P.face=1; for(let k=0;k<30;k++){hold();BK.sim(1);} const g=geo(); if(g){g.cd=0.3;g.n=0;}
        let pressed=new Set();
        for(let i=0;i<60*7;i++){ hold(); const H=BK.gobgeo&&BK.gobgeo(); const rocks=(H&&H.test.rocks())||[]; const r=rocks.find(q=>!q.back);
          if(g&&g.mode==='slateTell')g.mode='rockTell';
          if(r){ if(how==='parry'){ const t=ttiOf(r); if(t!==null){ BK.P.face=Math.sign(r.x-BK.P.x)||1; BK.keys.left=BK.keys.right=false; const own=LEAD[h]; if(own) BK.keys.block = own.tap ? (t<=own.at && t>own.at-0.05) : t<=own.at; else lab.parryAt(BK,h,t); } } else { const d=Math.hypot(BK.P.x-r.x,(BK.P.y-12)-r.y); if(d<(h==='ranger'?(r.x<441*16?70:0):34)&&!pressed.has(r.id)){pressed.add(r.id);BK.P.face=Math.sign(r.x-BK.P.x)||1;BK.press('atk');} } }
          BK.sim(1); if(H&&H.read().n.seals) break; }
        const n=BK.gobgeo?BK.gobgeo().read().n:{}; res[h][how]={seal:n.seals||0,parried:n.parried||0,struck:n.struck||0,thrown:n.thrown||0,hits:n.hits||0}; } }
    return res; })()`);
  console.log(JSON.stringify(out, null, 0).replace(/\},"/g, '},\n"'));
  const bad = []; for (const h of HEROES) { if (!out[h].parry.seal) bad.push(h + ': a parry did not shatter the seal'); if (!out[h].blow.seal && h !== 'ranger') bad.push(h + ': a blow did not shatter the seal'); }   /* THE RANGER's tap X is a low bow shot, not a blade: her answer is the BASH (tap C, her parry, proven above); an arrow that does meet a rock knocks it back (src/gobgeo-hands.js), but her shot flies under a lob */
  console.log(bad.length ? 'gobgeo-page: ' + bad.length + ' red\n  ' + bad.join('\n  ') : 'gobgeo-page: all nine heroes send his rock back by parry; eight by a blow too (the ranger answers with her bash)'); console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
  process.exitCode = bad.length ? 1 : 0;
} finally { pg.close(); }
