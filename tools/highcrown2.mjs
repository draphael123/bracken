/* tools/highcrown2.mjs - HIGHCROWN 2, PLAYED IN THE PAGE (claude/highcrown2, scratch/brief-highcrown2.md). The node half is tools/crown-exam.mjs (the layout);
   this is the rule's machinery, with real blows (BK.press) on the built level:
     winch     a) the bailey winch struck: its gate lifts, and drops again on a foe stood under it when the hold runs out
     lure      c) the ward bell struck by the HERO rings (it is never broken): the ward gate drops, the BARRACKS DOOR opens, the watch turns out of it;
                  the grate bell struck drops its grate on a foe under it; a death puts the door back
     vest      b) the vestibule's sentry rings: the grate drops behind the hero, the heavy elite is marked into the alarm
     hall      d) the hall bell struck by the hero rings: the stair-head grate drops, and the watch turns out on the stair side of it
     ring      THE GOBLIN QUEEN rings her own bell (round two, the hero by the grate): told, then the grate comes down on him; it winds back up
     b15       her plate turns part of a blade: a blow outside an opening lands (B15), never nothing
   PORT=<free port> node tools/highcrown2.mjs     (one headless page; ~1 min) */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { T } from '../src/level.js';
import { HC2 } from '../src/highcrown2.js';

const pg = await openPage({ audio: false, fonts: false });
let out;
try {
  out = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');const PORT=${T.PORT},AIR=${T.AIR},H=${JSON.stringify(HC2)};const res={};
    const cell=(c,y)=>BK.L.grid[y*BK.L.W+c];
    const load=()=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='crown'));BK.state='play';BK.god=false;BK.sim(5);};
    const hold=()=>{if(BK.state==='card')BK.cardClose();BK.P.hp=BK.P.maxHp;BK.P.inv=0.5;};
    const at=(tx,ty,face)=>{BK.P.x=tx*16+8;BK.P.y=(ty+1)*16;BK.P.vx=0;BK.P.vy=0;BK.P.face=face;};
    const strike=(tx,ty,face,n=30)=>{for(let i=0;i<n;i++){at(tx,ty,face);hold();if(BK.P.atk<0&&i%6===0)BK.press('atk');BK.sim(1);}};
    const gate=(c,y0,y1,t)=>{for(let y=y0;y<=y1;y++)if(cell(c,y)!==t)return false;return true;};
    /* a) the bailey winch */
    load(); { const w=BK.props().find(p=>p.t==='winch'&&!p.drop&&p.gate===H.WINCH_GATE); const r={shutAtStart:gate(w.gate,w.gy0,w.gy1,PORT)};
      strike(H.WINCH+1,63,-1); r.lifted=gate(w.gate,w.gy0,w.gy1,AIR);
      const hd=BK.enemies().find(e=>e.t==='hound'&&e.alive); if(hd){hd.x=w.gate*16+8;hd.y=64*16;hd.vx=0;}
      for(let i=0;i<60*8&&w.open>0;i++){hold();if(hd){hd.x=w.gate*16+8;hd.vx=0;}BK.P.x=(H.WINCH-3)*16;BK.sim(1);}
      r.dropped=gate(w.gate,w.gy0,w.gy1,PORT); r.houndDead=hd?!hd.alive:null; res.winch=r; }
    /* c) the ward bell as a lure, the barracks door, the grate bell */
    load(); { const sec=BK.L.alarms.find(a=>a.id==='ward'), b=BK.props().find(p=>p.t==='bell'&&p.section==='ward'); const [dc,dy0,dy1]=sec.opens[0];
      for(const e of BK.enemies())if(e.t==='sentry'&&e.section==='ward')e.alive=false;
      const r={doorShut:gate(dc,dy0,dy1,PORT)}; strike(H.WARD_BELL-1,63,1); r.rung=!!sec.on; r.broken=!!b.broken; r.doorOpen=gate(dc,dy0,dy1,AIR); r.wardGate=gate(sec.gates[0][0],sec.gates[0][1],sec.gates[0][2],PORT);
      const watch=BK.enemies().filter(e=>e.alive&&e.garrison==='ward'); r.watch=watch.length;
      const g=BK.props().find(p=>p.t==='winch'&&p.drop&&p.bell&&!p.bossGate&&p.gate===H.GRATE); const v=watch[0]; if(v){v.x=g.gate*16+8;v.y=64*16;v.vx=0;}
      for(let i=0;i<40;i++){at(H.GRATE_BELL+1,63,-1);if(v){v.x=g.gate*16+8;v.vx=0;}hold();if(BK.P.atk<0&&i%6===0)BK.press('atk');BK.sim(1);if(g.open>0)break;}
      r.grateDown=gate(g.gate,g.gy0,g.gy1,PORT); r.grateTook=v?!v.alive:null;
      BKT.respawn(); BK.sim(2); r.resetDoor=gate(dc,dy0,dy1,PORT); r.resetRung=!!b.rung; res.lure=r; }
    /* b) the vestibule */
    load(); { const sec=BK.L.alarms.find(a=>a.id==='vestibule'), s=BK.enemies().find(e=>e.t==='sentry'&&e.section==='vestibule'); const r={};
      for(let i=0;i<300&&!sec.on;i++){at(H.VEST[0]+6,63,1);hold();BK.sim(1);} r.rung=!!sec.on; r.behind=gate(sec.gates[0][0],58,63,PORT);
      r.eliteMarked=BK.enemies().some(e=>e.elite&&e.alive&&e.garrison==='vestibule'); res.vest=r; }
    /* d) the hall bell */
    load(); { const sec=BK.L.alarms.find(a=>a.id==='hall'); for(const e of BK.enemies())if(e.t==='sentry'&&e.section==='hall')e.alive=false; const r={};
      strike(H.HALL_BELL-1,31,1); r.rung=!!sec.on; r.grate=gate(H.HALL_GRATE,26,31,PORT); r.watchWest=BK.enemies().filter(e=>e.alive&&e.garrison==='hall').every(e=>e.x<H.HALL_GRATE*16); res.hall=r; }
    /* THE GOBLIN QUEEN: her bell, and B15 */
    load(); { const A=BK.L.arena; BK.god=true; BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1); for(let k=0;k<300;k++){hold();BK.sim(1);}
      const q=BK.boss, b=BK.props().find(p=>p.t==='winch'&&p.bell&&p.bossGate), gx=b.gate*16+8, r={};
      q.phase=2; q.plate=6; q.plateOff=false; q.hp=Math.floor(q.maxHp*0.6); q.x=gx+140; q.mode='stand'; q.modeT=0; q.ringT=0;
      for(const k of ['slamT','sweepT','chandT','decreeT','throwT2','gLeapT','shadowT','courtT','hLeapT'])q[k]=99;
      let told=false; for(let i=0;i<120;i++){BK.P.x=gx;BK.P.vx=0;BK.P.hp=BK.P.maxHp;BK.sim(1);if(q.mode==='ringTell')told=true;if(b.open>0)break;}
      r.told=told; r.down=gate(b.gate,b.gy0,b.gy1,PORT); r.pushed=Math.abs(BK.P.x-gx)>=12;
      for(let i=0;i<60*6&&b.open>0;i++){BK.P.x=gx-80;BK.sim(1);} r.upAgain=gate(b.gate,b.gy0,b.gy1,AIR);
      q.ringT=99; q.x=gx+200; q.vx=0; const hp0=q.hp; let open=false; for(let i=0;i<40;i++){q.mode='stand';q.modeT=5;q.x=gx+200;q.vx=0;BK.P.x=q.x-40;BK.P.y=A.floor;BK.P.face=1;BK.P.hp=BK.P.maxHp;if(BK.bossOpen(q))open=true;if(BK.P.atk<0&&i%10===0)BK.press('atk');BK.sim(1);} r.b15Took=hp0-q.hp; r.open=open; res.queen=r; }
    return res;})()`);
  out.errors = pg.errors.slice(0, 3);
} finally { pg.close(); }
console.log(JSON.stringify(out));
const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); };
const { winch: w, lure: l, vest: v, hall: h, queen: q } = out;
ok(w.shutAtStart && w.lifted && w.dropped, 'winch: the bailey gate must start shut, lift to the winch and drop again: ' + JSON.stringify(w));
ok(w.houndDead !== false, 'winch: the gate dropped and the hound under it lived: ' + JSON.stringify(w));
ok(l.doorShut && l.rung && !l.broken && l.doorOpen && l.wardGate, 'lure: the hero rings the ward bell, it opens the barracks door and drops the ward gate: ' + JSON.stringify(l));
ok(l.watch >= 2 && l.grateDown && l.grateTook !== false, 'lure: the barracks turns out and the grate bell drops its grate on one: ' + JSON.stringify(l));
ok(l.resetDoor && !l.resetRung, 'lure: a death shuts the barracks door again and unrings the bell: ' + JSON.stringify(l));
ok(v.rung && v.behind && v.eliteMarked, 'vest: the vestibule sentry rings, the grate drops behind, the elite is in the watch: ' + JSON.stringify(v));
ok(h.rung && h.grate && h.watchWest, 'hall: the hall bell rung by the hero drops the stair-head grate, the watch on the stair side: ' + JSON.stringify(h));
ok(q.told && q.down && q.pushed && q.upAgain, 'queen: she rings her bell (told), the grate comes down on the hero and winds back up: ' + JSON.stringify(q));
ok(q.b15Took > 0 && !q.open, 'queen: B15 - blows outside her openings must land part of themselves: ' + JSON.stringify(q));
if ((out.errors || []).length) fails.push('page errors: ' + JSON.stringify(out.errors));
if (fails.length) { console.log('FAIL highcrown2\n  ' + fails.join('\n  ')); process.exit(1); }
console.log('ok  highcrown2  winch gate, ward lure + barracks + grate bell, vestibule, hall bell, the Queen rings her bell, B15 ' + q.b15Took + ' hp from four swings outside her openings');
