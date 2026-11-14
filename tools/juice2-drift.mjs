// PAGE TOOL: launches headless Chrome
/* tools/juice2-drift.mjs [heroes] - (claude/juice2tune) THE 3-CUT DRIFT: beside a still foe on a calm level, three cuts in a row, no stepping back. Logs the hero's x relative to the foe at each cut, JUICE2 on vs off.
   FINDING: no game drift - the hero's per-cut step is the same on and off (2 px). The windcaller-gusts drift was the moor's GALE pushing an idle hero (the third press missed its 20-frame slot by the freeze's 2 frames).
   Asserts: never past the foe, and on == off within 2 px. PORT=<port> node tools/juice2-drift.mjs [paladin,reaper,knight] */
import { openPage } from './cdp.mjs';
const heroes = (process.argv[2] || 'knight,paladin,reaper').split(',');
const pg = await openPage({ audio: false, fonts: false });
let bad = 0;
try {
  const rows = await pg.evalp(`(async()=>{
  const J=await import('/src/juice.js');const {LEVELS}=await import('/src/level.js');const lvI=LEVELS.findIndex(l=>l.id==='moor');BK.manualSimulation=true;const out=[];
  for(const hero of ${JSON.stringify(heroes)}) for(const on of [false,true]){
    J.setJuice2(on);const K=BK.keys;
    BK.setHero(hero);BK.reset({fresh:true});BK.load(0);BK.state='play';BK.start();BK.god=true;BK.sim(5);BK.reset();
    const foes=BK.enemies().filter(e=>e.alive&&!e.maxHp);const b=foes[0];for(const e of BK.enemies())if(e!==b)e.alive=false;
    const gx=Math.round(b.x/16),gy=Math.round(b.y/16);BK.tp(gx-2,gy-1);b.hp=99999;b.maxHp=0;const bx=b.x,by=b.y;b.face=1;
    const hold=()=>{b.x=bx;b.vx=0;b.vy=0;b.mode='idle';b.modeT=99;b.atkT=99;};
    const step=n=>{for(let i=0;i<n;i++){hold();BK.sim(1);}};step(10);BK.P.face=1;BK.P.x=b.x-14;BK.P.vx=0;
    const rel=[];let n=0,peak=-99;
    for(let k=0;k<60*6;k++){ if(BK.P.atk<0&&k%20===0){ if(n>=3)break; BK.press('atk');n++; }
      step(1); peak=Math.max(peak,BK.P.x-b.x); if(BK.P.atk>=0&&rel.length<n)rel.push(Math.round(BK.P.x-b.x)); }
    step(30);out.push({hero,on,rel:rel.join(','),end:Math.round(BK.P.x-b.x),peak:Math.round(peak),vx:Math.round(BK.P.vx),hits:99999-b.hp});
  }
  J.setJuice2(true);return out;})()`);
  for (const r of rows) console.log(JSON.stringify(r));
  for (const h of heroes) { const on = rows.find(r => r.hero === h && r.on); if (on && on.peak > 0) { bad++; console.log('FAIL ' + h + ': passed the foe by ' + on.peak + ' px with JUICE2 on'); } const off = rows.find(r => r.hero === h && !r.on); if (on && off && Math.abs(on.end - off.end) > 2) { bad++; console.log('FAIL ' + h + ': end x differs on/off: ' + on.end + ' vs ' + off.end); } }
} catch (e) { console.log('ERR', e.message); bad++; } finally { pg.close(); }
process.exit(bad ? 1 : 0);
