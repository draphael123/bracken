/* tools/underleaf.mjs - UNDERLEAF 2 (claude/underleaf2; Daniel's interview 2026-10-08, scratch/brief-underleaf2.md). What it proves:
     1. SOUND IS A VERB (A2): pots on CARRY & THROW (one system: THROW_KIND.pot + carry-throw KINDS.pot, the arc told is the arc flown), HIGHLIGHTED,
        a first-use sign at the first one; a thrown pot breaks where its arc lands into a NOISE RING (what = 'pot'): a sleeper inside it rolls over
        to face it and stays asleep, the BELLMAN walks to it and looks, a window lights only under it
     2. QUIET PAYS: a sleeper struck from behind dies in one silent blow (no sound: the swing, the step and the kill make none); struck from the
        front it wakes. Each street's SILVER CACHE opens for a street that stayed dark and is BARRED by one lit window; three caches, three silvers
     3. LOUD COSTS: the Bellman who hears you RINGS - his street's alarm, its STREET GATE drops (rock in the grid), its cache barred; two windows lit
        do the same; a death puts it all back; with every street gate shut the arena is still reached by every hero's legs (no soft-lock: the roofs)
     4. THE TOLL: the churchyard's bell tolls on its clock, told first; under it nothing made in the churchyard is heard
     5. THE ONE REQUIRED THROW: the bone key hangs on the bell-cote out of reach (a hung key cannot be taken); a pot lobbed from the roof knocks it
        down onto the roof, and the bone gate opens to it
     6. THE GRANDMOTHER (B11/B13/B14, keyed FROM BEHIND): off the chip; a blade from her front is turned (SHE HEARD YOU), from behind it lands whole;
        a pot behind her (or a bell-pull's chime) and she whirls and LASHES at it - open (the gold read, BK.bossOpen), x2 on her back, her front still
        turned - then a TOLD ward (WARDED, no lure turns her); her rap after a silent listen x1.5; phase two burns her rugs to boards, phase three's
        knell runs the boards (a grounded hero is hit, a jumping one is not) and the chimes are lost in it; no callers, no vanishing
   PORT=8740 node tools/underleaf.mjs */
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';
import { THROW_KIND } from '../src/throwables.js';
import { KINDS } from '../src/carry-throw.js';
import { POT, BELLMAN, GRAN, TOLL, ALARM, LINES } from '../src/hush-hands.js';
import { CALL_LINES } from '../src/hint-lines.js';
import { floodReach } from '../src/reachcore.js';
import { FULL_DAMAGE, OPEN_RULE } from '../src/boss-greed.js';
import { GATE } from './level-quality.mjs';
import { openPage } from './cdp.mjs';

const TS = 16, lv = LEVELS.find(l => l.id === 'underleaf'), L = lv.build(), R = 34, at = (x, y) => L.grid[y * L.W + x];
const E = t => L.ents.filter(e => e.t === t);
// ---- 1 (static): the pot is one system, highlighted and signed ----
assert.ok(THROW_KIND.pot && KINDS.pot, 'the pot is a row in THROW_KIND and in carry-throw KINDS');
assert.equal(KINDS.pot.g, THROW_KIND.pot.g, 'the told arc falls as the thrown pot does');
assert.deepEqual(KINDS.pot.aims.mid, { vx: THROW_KIND.pot.vx, vy: THROW_KIND.pot.vy }, 'the plain throw is the kind\'s own');
assert.ok(KINDS.pot.aims.high.vy < KINDS.pot.aims.mid.vy && KINDS.pot.aims.low.vx < KINDS.pot.aims.mid.vx, 'UP lobs, DOWN tosses short');
const pots = E('npot').sort((a, b) => a.x - b.x), signs = E('sign');
assert.ok(pots.length >= 12, 'pots all the way along the village: ' + pots.length);
assert.ok(signs.some(s => Math.abs(s.x - pots[0].x) <= 4 && /POT/.test(s.text)), 'a first-use sign at the first pot (' + pots[0].x + ')');
for (const ln of Object.values(LINES)) if (ln !== LINES.potTake) assert.ok(CALL_LINES.has(ln), 'the line is routed to the hint box (src/hint-lines.js): ' + ln);
// ---- 2/3 (static): three streets, each with its alarm, its gate under a roof, its cache; one new foe ----
const secs = L.hushSecs; assert.equal(secs.length, 3, 'three streets');
for (let i = 0; i < 3; i++) {
  const inS = e => e.x >= secs[i].x0 && e.x <= secs[i].x1;
  assert.equal(E('alarm').filter(e => e.sec === i && inS(e)).length, 1, 'street ' + i + ' has one alarm post');
  const g = E('streetgate').find(e => e.sec === i && inS(e)); assert.ok(g, 'street ' + i + ' has a street gate');
  /* UNDER A ROOF, a ladder each side of it within the roof's span: the alarm's way round */
  const roof = L.roofs.find(([x0, x1]) => g.x > x0 && g.x < x1); assert.ok(roof, 'street ' + i + "'s gate stands under a roof");
  for (let y = g.y - 2; y <= g.y; y++) assert.equal(at(g.x, y), T.AIR, 'its gate column is open street until the alarm (' + g.x + ',' + y + ')');
  assert.equal(E('darkcache').filter(e => e.sec === i).length, 1, 'street ' + i + ' has one silver cache');
  assert.ok(E('bellman').some(e => e.sec === i && inS(e)), 'street ' + i + ' has a Bellman');
}
const silvers = E('silver'); assert.equal(silvers.length, 3, 'three silvers (A11: cap 3)');
for (const s of silvers) assert.ok(E('darkcache').some(c => c.x === s.x && c.y === s.y), 'each silver is a cache\'s: ' + s.x + ',' + s.y);
assert.ok(signs.some(s => /BELLMAN/.test(s.text) && Math.abs(s.x - E('bellman').sort((a, b) => a.x - b.x)[0].x) < 14), 'the first Bellman is signed where you meet him');
assert.ok(signs.some(s => /SLEEPER/.test(s.text) && /BEHIND/.test(s.text)), 'the quiet kill is signed where it is taught');
assert.ok(signs.some(s => /TOLL/.test(s.text)), 'the toll is signed in the churchyard');
/* NO SOFT-LOCK: with every street gate shut (and the lock gates open, as their keys come first: tools/keys.mjs), a hero's LEGS (the plain fill:
   no ride, no mover) still reach the boss room from the start - over the roofs */
{ const grid = L.grid.slice(); for (const g of E('streetgate')) for (let y = g.y - (g.h || 3) + 1; y <= g.y; y++) grid[y * L.W + g.x] = T.SOLID;
  for (const g of E('lockgate')) for (let y = 0; y < L.H; y++) if (grid[y * L.W + g.x] === T.PORT) grid[y * L.W + g.x] = T.AIR;
  const F = floodReach({ ...L, grid }, T, { noAssist: true }), A = L.arena, ax = Math.floor(A.trigger / TS) + 2, ay = Math.round(A.floor / TS) - 1;
  assert.ok(F.seen.has(ax + ',' + ay) || F.seen.has(ax + ',' + (ay - 1)), 'every street gate shut, the boss room is still reached on legs alone (the roofs go round)');
  for (const g of E('streetgate')) { const side = [...F.seen].some(k => { const [x, y] = k.split(',').map(Number); return x === g.x + 2 && y >= g.y - 1 && y <= g.y; }); assert.ok(side, 'the street past the gate at ' + g.x + ' is reached with it shut'); } }
// ---- 5 (static): the required throw ----
const nail = E('keynail')[0], bone = E('key').find(k => k.kind === 'bone');
assert.ok(nail && bone && bone.x === nail.x && bone.y > nail.y, 'the bone key\'s data is on the roof under its nail (every reach tool finds it there)');
assert.ok(bone.y - nail.y >= 5, 'its nail is five rows over the roof: out of a jump\'s reach, in a lob\'s: ' + (bone.y - nail.y));
{ const F = floodReach(L, T, { noAssist: true }); assert.ok(F.seen.has(bone.x + ',' + bone.y), 'the roof under the nail is on foot'); }
// ---- 6 (static): the Grandmother's rules ----
assert.ok(FULL_DAMAGE.grandmother && OPEN_RULE.grandmother, 'off the chip (FULL_DAMAGE), with her openings named (OPEN_RULE)');
assert.ok(GRAN.back >= 2.4 && GRAN.ward >= 2.5 && GRAN.ward <= 3.5 && GRAN.backMul === 2, 'an opening worth taking, a ~3 s ward, x2 on her back');
assert.ok(E('granpull').length === 2 && E('granpull').every(p => Math.abs(p.chime - p.x) > 30), 'two bell-pulls, each ringing the far end of her room');
assert.ok(L.rugs && L.rugs.length >= 2 && L.rugs.every(([x0, x1, y]) => { for (let x = x0; x <= x1; x++) if (at(x, y) !== T.SOFT) return false; return true; }), 'her rugs are the quiet floor (moss in the grid)');

// ---- THE PAGE ----
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{
  const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const I=LEVELS.findIndex(l=>l.id==='underleaf');const out={};
  const P=()=>BK.P,K=BK.keys,H=()=>BK.hushHands(),S=()=>BK.hush();
  const boot=(x,y,hero,keep)=>{BK.setHero(hero||'knight');BK.reset({fresh:true});BK.load(I);BK.state='play';BK.god=true;BK.P.hp=BK.P.maxHp;if(x!==undefined){BK.tp(x,y);BK.sim(20);}};
  const potNear=x=>BK.props().filter(p=>p.t==='npot'&&p.state==='rest').sort((a,b)=>Math.abs(a.x-x)-Math.abs(b.x-x))[0];
  const take=pr=>{P().x=pr.x;P().y=pr.y;P().vx=0;BK.sim(2);BK.press('talk');BK.sim(2);return P().carry===pr;};
  const throwIt=(pr,face,aim)=>{P().face=face;K.up=aim==='high';K.down=aim==='low';BK.sim(1);const arc=H().potArc(pr);BK.press('atk');let n=0;for(;n<120&&(pr.state==='held'||pr.state==='fly');n++)BK.sim(1);K.up=K.down=false;return {arc:arc.land?{x:Math.round(arc.land.x),y:Math.round(arc.land.y)}:null,state:pr.state,n};};
  /* 1. a pot: highlighted at rest, taken, its told arc, thrown - and what hears it */
  {boot(23,33);const pr=potNear(P().x);out.took=take(pr);K.up=true;BK.sim(1);const hi=H().potArc(pr);K.up=false;K.down=true;BK.sim(1);const lo=H().potArc(pr);K.down=false;BK.sim(1);P().face=1;BK.sim(1);const mid=H().potArc(pr);
   out.arcs={hi:hi.land&&Math.round(hi.land.x-P().x),mid:mid.land&&Math.round(mid.land.x-P().x),lo:lo.land&&Math.round(lo.land.x-P().x),hiTop:Math.round(Math.min(...hi.pts.map(p=>p[1]))-P().y),midTop:Math.round(Math.min(...mid.pts.map(p=>p[1]))-P().y)};
   BK.noiseLog=[];const t=throwIt(pr,1,'mid');const pn=BK.noiseLog.find(n=>n.what==='pot');out.thrown={...t,noise:pn||null,within:pn&&t.arc?Math.abs(pn.x-t.arc.x):null,back:S().pots.find(p=>Math.abs(p.x-pr.hx)<2)};
   for(let i=0;i<60*5;i++)BK.sim(1);out.respawned=pr.state;}
  /* 1. a pot behind a sleeper: it rolls over to face the sound and sleeps on; a Bellman walks to it */
  {boot(54,33);const sp=BK.enemies().find(e=>e.t==='sprig'&&e.sleeper&&Math.abs(e.x-63*16-8)<20);const bm=BK.enemies().find(e=>e.t==='bellman'&&e.x<80*16);
   sp.face=-1;bm.x=64*16;bm.face=-1;bm.mode='look';bm.modeT=0.2;BK.noiseLog=[];BK.noiseAt(70*16,34*16,POTR,'pot');BK.sim(2);out.lure={face:sp.face,sleeper:sp.sleeper,woke:sp.woke||0,bm:bm.mode,goX:Math.round((bm.goX||0)/16)};
   for(let i=0;i<60*4;i++)BK.sim(1);out.lure.bmAt=Math.round(bm.x/16);out.lure.bmMode=bm.mode;out.lure.bmRung=bm.rung;}
  /* 2. the quiet kill: from behind, silent; from the front, it wakes */
  {boot(14,33);const ar=BK.enemies().find(e=>e.t==='archer'&&e.sleeper&&Math.abs(e.x-20*16-8)<20);P().x=ar.x-16;P().face=1;BK.sim(2);const ready=H().sneakReady();BK.noiseLog=[];BK.press('atk');for(let i=0;i<20;i++)BK.sim(1);
   out.quiet={ready,alive:ar.alive,quiet:!!ar.quiet,noise:BK.noiseLog.filter(n=>n.r>=20).length,silent:S().n.silent,words:BK.textLab.nums().map(n=>n.txt)};
   boot(14,33);const ar2=BK.enemies().find(e=>e.t==='archer'&&e.sleeper&&Math.abs(e.x-20*16-8)<20);ar2.face=-1;P().x=ar2.x-16;P().face=1;BK.sim(2);BK.press('atk');for(let i=0;i<20;i++)BK.sim(1);out.front={alive:ar2.alive,sleeper:!!ar2.sleeper,hp:ar2.hp};}
  /* 2. the cache: a dark street opens it; a lit window bars it */
  {boot(130,27);const c=BK.props().find(p=>p.t==='darkcache'&&p.sec===0);P().x=c.x-40;P().y=c.y;BK.sim(5);P().x=c.x;BK.sim(5);out.cacheOpen={state:c.state,silver:!!(c.sv&&c.sv.x>0)};
   boot(130,27);const c2=BK.props().find(p=>p.t==='darkcache'&&p.sec===0);const w=BK.props().find(p=>p.t==='window'&&p.x<60*16);w.lit=1;w.openT=9;BK.sim(3);P().x=c2.x;P().y=c2.y;BK.sim(5);out.cacheBarred={state:c2.state,silverHidden:!!(c2.sv&&c2.sv.x<0)};}
  /* 3. the Bellman hears you: his street's alarm, its gate, its cache; a death puts it back */
  {boot(56,33);const bm=BK.enemies().find(e=>e.t==='bellman'&&e.x<80*16);bm.x=66*16;bm.face=-1;bm.mode='look';bm.modeT=9;P().x=bm.x-18;P().face=1;const modes=new Set();for(let i=0;i<90;i++){BK.sim(1);modes.add(bm.mode);}const tellMode=modes.has('ringTell')?'ringTell':[...modes].join(',');
   const g=BK.props().find(p=>p.t==='streetgate'&&p.sec===0);out.ring={tellMode,mode:bm.mode,rung:bm.rung,alarm:S().secs[0].alarm,gate:g.shut,tiles:[g.y0,g.y1].map(y=>BK.L.grid[y*BK.L.W+g.col]),cache:S().caches.find(c=>c.sec===0).state,others:S().secs.slice(1).map(s=>s.alarm)};
   /* the dropped gate is glinted and, stood at, nudged: the roofs go over it */
   {const sg=BK.props().find(p=>p.t==='streetgate'&&p.sec===0);P().x=(sg.col-3)*16;P().y=34*16;P().vx=0;let hint=null;for(let i=0;i<60*12&&!hint;i++){P().x=(sg.col-3)*16;P().vx=0;BK.sim(1);const t=BKT.hintNow;if(t&&/GATE IS DOWN/.test(t.msg||''))hint=t.msg;}out.ring.nudge=hint;}
   BK.god=false;P().hp=1;BKT.hurtPlayer?BKT.hurtPlayer(99):(P().hp=0,P().dead=1);for(let i=0;i<60*4&&(P().dead||BK.state!=='play');i++)BK.sim(1);
   const g2=BK.props().find(p=>p.t==='streetgate'&&p.sec===0);out.reset={gate:g2.shut,tile:BK.L.grid[g2.y1*BK.L.W+g2.col],alarm:S().secs[0].alarm,cache:S().caches.find(c=>c.sec===0).state,dead:P().dead};}
  /* 3. two windows lit: the same */
  {boot(160,33);let k=0;for(const w of BK.props().filter(p=>p.t==='window'&&p.x>158*16&&p.x<250*16)){if(k++<2){w.lit=1;w.openT=9;}}BK.sim(3);out.windows={alarm:S().secs[1].alarm,why:S().secs[1].why,gate:S().gates.find(g=>g.col===203).shut};}
  /* 4. the toll: told, then nothing in the churchyard is heard */
  {boot(296,33);const b=BK.props().find(p=>p.t==='tollbell');b.clk=TOLLE-TOLLT+0.1;BK.sim(2);const tell=!!b.tell;let on=false;for(let i=0;i<120&&!on;i++){BK.sim(1);on=!!b.on;}
   const sp=BK.enemies().find(e=>e.sleeper&&e.x>290*16&&e.x<312*16);const was=sp?{sleeper:sp.sleeper}:null;if(sp)BK.noiseAt(sp.x+10,sp.y,90,null);BK.sim(1);out.toll={tell,on,masked:H().masked(300*16),sleeper:sp?sp.sleeper:null,was,tolls:S().n.tolls};
   b.clk=TOLLE*2+TOLLL+0.5;BK.sim(2);out.toll.after=H().masked(300*16);}
  /* 5. the bone key: hung (not taken by a hero who reaches it), knocked down by a lobbed pot, taken, and the bone gate opens */
  {boot(353,27);const n=BK.props().find(p=>p.t==='keynail');const key=n.key;out.key0={hung:key.hung,y:Math.round(key.y)};P().x=key.x;P().y=key.y+20;P().vy=0;BK.sim(3);out.key0.reached=key.got;
   P().x=n.x-72;P().y=28*16;P().vy=0;BK.sim(10);const pr=potNear(P().x);const tk=take(pr);P().x=n.x-72;P().y=28*16;P().vy=0;BK.sim(4);
   let best=null;for(let dx=-24;dx<=24&&best===null;dx+=2){P().x=n.x-72+dx;P().vx=0;P().face=1;K.up=true;BK.sim(1);P().face=1;const a=H().potArc(pr);K.up=false;if(a.land&&Math.hypot(a.land.x-n.x,a.land.y-n.y)<16)best=dx;}
   out.key1={took:tk,spot:best};if(best!==null){P().x=n.x-72+best;P().vx=0;BK.sim(1);throwIt(pr,1,'high');}for(let i=0;i<90;i++)BK.sim(1);
   out.key1.down=n.down;out.key1.hung=key.hung;out.key1.y=Math.round(key.y);P().x=key.x;P().y=key.y;BK.sim(4);out.key1.got=key.got;
   const lg=BK.props().find(p=>p.t==='lockgate'&&p.needs==='bone');BK.tp(lg.col-1,33);for(let i=0;i<30;i++)BK.sim(1);out.key1.gate=lg.open;}
  /* 6. THE GRANDMOTHER */
  {boot();const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);for(let i=0;i<150;i++)BK.sim(1);const b=BK.boss;out.gAlive=b.alive&&BK.bossActive;
   const hold=()=>{b.sweepT=b.listenT=b.feelT=b.fireT=b.knellT=99;b.vx=0;};
   const blow=(fromX,n,tag)=>{const h=b.hp;BKT.hurtAs(tag||'light',b,n||40,fromX,false);const d=h-b.hp;b.hp=h;return d;};
   b.mode='walk';b.ward=0;hold();P().x=b.x-60;P().y=A.floor;BK.sim(1);b.face=1;
   const front=blow(b.x+12),back=blow(b.x-12);const said=BK.textLab.nums().map(n=>n.txt);
   /* a pot behind her (she faces right, the hero on her left: the pot breaks on her right) */
   b.mode='walk';b.face=-1;b.ward=0;hold();P().x=b.x-70;BK.sim(1);BK.noiseLog=[];BK.noiseAt(b.x+60,A.floor,124,'pot');const m1=b.mode;let k=0;for(;k<60&&b.mode!=='turned';k++){hold();BK.sim(1);}
   const turned={mode:b.mode,face:b.face,open:BK.bossOpen(b),k};const backX2=blow(b.x-12,20),frontT=blow(b.x+12,20);
   for(let i=0;i<60*4&&b.mode==='turned';i++){hold();BK.sim(1);}
   const ward={ward:+(b.ward||0).toFixed(2),mode:b.mode,open:BK.bossOpen(b),blade:blow(b.x-(b.face||1)*12,40),words:BK.textLab.nums().map(n=>n.txt)};
   b.mode='walk';hold();BK.noiseAt(b.x+60,A.floor,124,'pot');ward.lure=b.mode;
   for(let i=0;i<60*4&&b.ward>0;i++){hold();BK.sim(1);}
   /* the rap: she listens, the hero stands still on a rug, she raps */
   b.mode='walk';b.ward=0;hold();const rug=BK.L.rugs[0];P().x=(rug[0]+3)*16;P().vx=0;b.x=P().x+70;b.listenT=0;b.sweepT=b.feelT=b.fireT=b.knellT=99;let rap=false;for(let i=0;i<60*5&&!rap;i++){b.sweepT=b.feelT=b.fireT=b.knellT=99;K.left=K.right=false;BK.sim(1);rap=b.mode==='rap';}
   const rapRead={rap,open:BK.bossOpen(b),hit:blow(b.x+12,20)};
   for(let i=0;i<60*4&&b.mode==='rap';i++){hold();BK.sim(1);}
   /* a bell-pull: struck, its chime rings across the room and she goes for it */
   b.mode='walk';b.ward=0;hold();const pull=BK.props().find(p=>p.t==='granpull'&&p.x<A.x0+100);b.x=pull.chimeX-120;P().x=pull.x-14;P().face=1;P().vx=0;BK.sim(2);BK.press('atk');let lured=false;for(let i=0;i<40&&!lured;i++){hold();BK.sim(1);lured=b.mode==='lureTell'||b.mode==='lash'||b.mode==='turned';}
   const pullRead={lured,lureX:Math.round((b.lureX||0)/16),chime:Math.round(pull.chimeX/16),pulls:S().n.pulls};
   for(let i=0;i<60*8&&(b.mode!=='walk'||b.ward>0);i++){hold();BK.sim(1);}
   const fresh=()=>{boot();BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);for(let i=0;i<150;i++)BK.sim(1);return BK.boss;};
   /* phase two (a fresh fight): the rugs burn to boards */
   let b2=fresh();b2.mode='walk';b2.ward=0;b2.hp=Math.floor(b2.maxHp*0.6);for(let i=0;i<10;i++){BK.sim(1);}const p2={phase:b2.phase,rug:BK.L.grid[rug[2]*BK.L.W+rug[0]+2]};
   /* phase three: the knell runs the boards */
   b2=fresh();const b3=b2;b3.hp=Math.floor(b3.maxHp*0.3);for(let i=0;i<300&&b3.phase<3;i++){if(b3.mode==='walk')b3.ward=0;BK.sim(1);}for(let i=0;i<90;i++){BK.sim(1);}
   let p3;{const bb=b3;const quiet=()=>{bb.sweepT=bb.listenT=bb.feelT=bb.fireT=99;};
    BK.god=false;P().hp=P().maxHp;P().inv=0;P().x=bb.x-90;P().vx=0;bb.mode='walk';bb.ward=0;bb.knellT=0;quiet();const hp0=P().hp;let knell=false;for(let i=0;i<90;i++){quiet();BK.sim(1);if(bb.mode==='knell')knell=true;}
    const grounded=hp0-P().hp;P().hp=P().maxHp;P().inv=0;P().x=bb.x-90;P().vx=0;bb.mode='walk';bb.ward=0;bb.knellT=0;let jt=0;for(let i=0;i<90;i++){quiet();if(bb.mode==='knell'&&P().ground&&!jt){BK.press('jump');jt=20;}K.jump=jt>0;if(jt>0)jt--;BK.sim(1);}K.jump=false;const jumped=P().maxHp-P().hp;BK.god=true;
    const lost=!!BK.props().find(p=>p.t==='granpull').jangle;p3={phase:bb.phase,knell,grounded,jumped,lost};}
   out.gran={m1,front,back,said,turned,backX2,frontT,ward,rapRead,pullRead,p2,p3,adds:BK.enemies().filter(e=>e.alive&&e!==b3&&e.x>A.x0&&e.x<A.x1).length,alpha:b3.alpha};}
  return out;})()`.replace('POTR', String(POT.ring)).replace('TOLLE-TOLLT', String(TOLL.every - TOLL.tell)).replace('TOLLE*2+TOLLL', String(TOLL.every * 2 + TOLL.len)), 900000);
  console.log(JSON.stringify(r));
  /* 1 */
  assert.ok(r.took, 'INTERACT takes a pot');
  assert.ok(r.arcs.hi > r.arcs.lo && r.arcs.mid > r.arcs.lo && r.arcs.hiTop < r.arcs.midTop, 'UP lobs higher, DOWN tosses short: ' + JSON.stringify(r.arcs));
  assert.ok(r.thrown.noise && r.thrown.within !== null && r.thrown.within <= 16, 'a thrown pot breaks where its told arc lands, into a noise ring: ' + JSON.stringify(r.thrown));
  assert.equal(r.respawned, 'rest', 'and it is back on its shelf a few seconds on');
  assert.ok(r.lure.face === 1 && r.lure.sleeper === true, 'a sleeper inside a pot\'s ring rolls over to face it and sleeps on: ' + JSON.stringify(r.lure));
  assert.ok(['heed', 'go'].includes(r.lure.bm) && r.lure.goX >= 70, 'the Bellman turns to it and goes to look: ' + JSON.stringify(r.lure));
  assert.ok(r.lure.bmAt >= 68 && !r.lure.bmRung, 'and walks to it (and rings nothing: it was not you): ' + JSON.stringify(r.lure));
  /* 2 */
  assert.ok(r.quiet.ready && !r.quiet.alive && r.quiet.quiet && r.quiet.noise === 0, 'a sleeper struck from behind dies in one silent blow - no sound at all: ' + JSON.stringify(r.quiet));
  assert.ok(r.front.alive && !r.front.sleeper, 'struck from the front it wakes (and lives): ' + JSON.stringify(r.front));
  assert.ok(r.cacheOpen.state === 'open' && r.cacheOpen.silver, 'a dark street\'s cache opens, its silver out: ' + JSON.stringify(r.cacheOpen));
  assert.ok(r.cacheBarred.state === 'barred' && r.cacheBarred.silverHidden, 'one window lit in its street and it is BARRED: ' + JSON.stringify(r.cacheBarred));
  /* 3 */
  assert.equal(r.ring.tellMode, 'ringTell', 'the Bellman who has you raises his bell first (told)');
  assert.ok(r.ring.rung && r.ring.alarm && r.ring.gate && r.ring.tiles.every(t => t === T.PORT) && r.ring.cache === 'barred', 'he RINGS: his street\'s alarm, its gate down (rock), its cache barred: ' + JSON.stringify(r.ring));
  assert.ok(r.ring.others.every(a => !a), 'and only his street');
  assert.ok(r.ring.nudge, 'stood at the dropped gate, the hero is told the roofs go over it (A6): ' + r.ring.nudge);
  assert.ok(!r.reset.gate && r.reset.tile === T.AIR && !r.reset.alarm && r.reset.cache === 'shut', 'a death puts the street back to sleep: ' + JSON.stringify(r.reset));
  assert.ok(r.windows.alarm && r.windows.why === 'windows' && r.windows.gate, 'two windows lit ring the alarm too: ' + JSON.stringify(r.windows));
  /* 4 */
  assert.ok(r.toll.tell && r.toll.on && r.toll.masked, 'the bell is TOLD, then tolls, and the churchyard is covered: ' + JSON.stringify(r.toll));
  if (r.toll.was) assert.equal(r.toll.sleeper, true, 'under the toll a sound beside a sleeper wakes nothing');
  assert.equal(r.toll.after, false, 'and between tolls it is not');
  /* 5 */
  assert.ok(r.key0.hung && !r.key0.reached, 'the bone key hangs on its nail, and a hero who reaches it cannot take it: ' + JSON.stringify(r.key0));
  assert.ok(r.key1.took && r.key1.spot !== null, 'a pot from the chimney stack, and a spot on the roof whose UP lob meets the nail: ' + JSON.stringify(r.key1));
  assert.ok(r.key1.down && !r.key1.hung && r.key1.got && r.key1.gate, 'the lobbed pot knocks it down, it is taken, and the bone gate opens: ' + JSON.stringify(r.key1));
  /* 6 */
  const G = r.gran;
  assert.ok(r.gAlive, 'her fight is on');
  assert.equal(G.front, 0, 'a blade from her FRONT is turned...'); assert.ok(G.said.includes('SHE HEARD YOU'), '...and says so (B10): ' + G.said);
  assert.ok(G.back >= 36, 'from BEHIND it lands whole (B11, never a wall): ' + G.back);
  assert.ok(G.turned.mode === 'turned' && G.turned.open === true && G.turned.face === 1, 'a pot behind her: she whirls and lashes at it - and her back is OPEN (the gold read): ' + JSON.stringify(G.turned));
  assert.ok(G.backX2 >= 38 && G.frontT === 0, 'open, her back takes double; her front still turns a blade: ' + G.backX2 + ' / ' + G.frontT);
  assert.ok(G.ward.ward >= GRAN.ward - 0.5 && G.ward.open === false && G.ward.blade === 0 && G.ward.words.includes('WARDED'), 'the opening over, a TOLD ward (B3): ' + JSON.stringify(G.ward));
  assert.ok(G.ward.lure !== 'lureTell', 'in her ward no lure turns her');
  assert.ok(G.rapRead.rap && G.rapRead.open === true && G.rapRead.hit > 20, 'still on a rug through her listen, she raps the floor: open all round, more than a plain blow (x1.5, on the small purse of her rap): ' + JSON.stringify(G.rapRead));
  assert.ok(G.pullRead.lured && Math.abs(G.pullRead.lureX - G.pullRead.chime) <= 2, 'a bell-pull struck rings the far chime, and she goes for the sound: ' + JSON.stringify(G.pullRead));
  assert.ok(G.p2.phase >= 2 && G.p2.rug === T.PLANK, 'phase two: the candles go over and her rugs burn to boards: ' + JSON.stringify(G.p2));
  assert.ok(G.p3.phase === 3 && G.p3.knell && G.p3.grounded > 0 && G.p3.jumped < G.p3.grounded && G.p3.lost, 'phase three: the knell runs the boards (a grounded hero is hit, a jump clears it), the chimes are lost: ' + JSON.stringify(G.p3));
  assert.equal(G.adds, 0, 'no callers from the street'); assert.ok(G.alpha === undefined || G.alpha === 1, 'no vanishing');
  assert.deepEqual(pg.errors.slice(0, 3), [], 'no page errors');
  assert.equal(GATE.includes('underleaf'), true, 'UNDERLEAF is held to the level-quality bar (tools/level-quality.mjs GATE)');
  console.log('underleaf: the pots, the quiet kill, the streets\' alarms, gates and caches, the toll, the bone key and the Grandmother all hold');
} finally { pg.close(); }
