/* tools/underleaf.mjs - UNDERLEAF 3: THE GRANDMOTHER'S VILLAGE + HER JARS (claude/underleaf3; Daniel's interview 2026-10-15, scratch/brief-underleaf3-1015.md).
   A DELIBERATE DESIGN CHANGE, stated (never a weakened test): Underleaf 2's SOUND / HUSH rule is RETIRED from this level on Daniel's word ("the sound situation
   just doesn't really work") - the streets, alarms, caches, the toll, the Bellman and the bone key went with the old village, and so did their assertions here.
   The pot STAYED: it is the potion system now (THROW_KIND.pot / KINDS.pot, the told arc is the arc flown), and every rule below is held at least as hard.
   What it proves:
     1. ONE SYSTEM: her jars are the carry-throw pot with a colour; every jar at rest is in a level row; each colour is TAUGHT by a sign at its first jar
     2. THE RULE IS DRAWN AND THE ARC IS TOLD: a thrown jar breaks where its told arc lands (every colour)
        GREEN on a seed bed grows its vine - a ladder (rungs up the wall) or a bridge (across the ditch) - and the vine STAYS through a death; elsewhere a snare
        BLUE a bubble: the hero who steps in is lifted onto the ledge he could not jump to; a foe it meets is lifted off its feet, helpless
        RED burns a thorn hedge away (and it stays gone), burns the thorn-beast's coat off (until then a blade does x0.4 and says BURN IT)
     3. TEACH -> TEST -> REMIX -> EXAM in five NAMED areas, one shrine closing each exam (A10c) and one at her door; every REQUIRED use is a LOCK (the plain fill,
        legs only, does not reach the boss; the full fill does; take any one required bed/hedge/well out and the boss room is lost) and is glinted (src/stuck-spots.js)
     4. THE GRANDMOTHER 3: her BROOD wards her x0.4 (WARDED - never wholly invulnerable, B15); brood dead, blows land whole; a BLUE jar floats her OPEN x2
        (the gold read) on a purse; a told ward after (no bubble holds her, still x0.4); her fireballs and hurled jars land on spots marked first; phase two
        STIRS THE CAULDRON - a bigger brood and gouts on marked spots; no soft-lock (her shelves refill)
     5. OLD SAVES: a save that cleared Underleaf (its silvers' bits, its relic tick) or stood between Kingswood and it loads, keeps its bits, and plays the new level
   PORT=8793 node tools/underleaf.mjs */
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';
import { THROW_KIND } from '../src/throwables.js';
import { KINDS } from '../src/carry-throw.js';
import { JAR, GM, PO_SAY } from '../src/potion-hands.js';
import { SECTIONS, ARCS } from '../src/underleaf3.js';
import { SAY_LINES } from '../src/hint-lines.js';
import { floodReach } from '../src/reachcore.js';
import { FULL_DAMAGE, OPEN_RULE } from '../src/boss-greed.js';
import { STUCK } from '../src/stuck-spots.js';
import { THREAT } from '../src/threat.js';
import { GATE } from './level-quality.mjs';
import { openPage } from './cdp.mjs';

const TS = 16, lv = LEVELS.find(l => l.id === 'underleaf'), L = lv.build(), at = (x, y) => L.grid[y * L.W + x];
const E = t => L.ents.filter(e => e.t === t);
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
/* ---- 1. one system, signed ---- */
ok(THROW_KIND.pot && KINDS.pot && KINDS.pot.g === THROW_KIND.pot.g, 'her jar is the pot row: the told arc falls as the thrown jar does');
ok(KINDS.pot.aims.mid.vx === THROW_KIND.pot.vx && KINDS.pot.aims.high.vy < KINDS.pot.aims.mid.vy && KINDS.pot.aims.low.vx < KINDS.pot.aims.mid.vx, 'UP lobs, DOWN tosses short');
ok(!L.hush && !E('bellman').length && !E('npot').length && !E('streetgate').length, 'the hush is retired from Underleaf (no streets, no Bellman, no noise pots)');
ok(lv.rule === 'HER JARS CHANGE WHAT THEY BREAK ON: GREEN GROWS A VINE, BLUE LIFTS IN A BUBBLE, RED BURNS.', 'the rule line says what the code does');
const jars = [...E('jarshelf'), ...E('brewpot')], signs = E('sign');
for (const c of ['green', 'blue', 'red']) { const first = jars.filter(j => j.col === c).sort((a, b) => a.x - b.x)[0];
  ok(first && signs.some(s => Math.abs(s.x - first.x) <= 4 && Math.abs(s.y - first.y) <= 1 && s.text.includes(c.toUpperCase())), 'the first ' + c + ' jar is signed where it is taken (' + (first && first.x) + ')'); }
for (const k of ['jarshelf', 'brewpot', 'vinebed', 'thornhedge', 'floatwell']) ok(THREAT[k] === 0, k + ' is a gadget (THREAT 0), not a foe');
for (const t of Object.values(PO_SAY)) ok(SAY_LINES.has(t), 'routed to the hint box: ' + t);
/* ---- 3. areas, shrines, arcs ---- */
ok(L.sections.length === 6 && L.sections.map(s => s.name).join('|') === SECTIONS.map(s => s[0]).join('|'), 'five named areas and her cottage');
const checks = E('check').map(c => c.x).sort((a, b) => a - b);
ok(checks.length === 5 && SECTIONS.slice(0, 5).every(([, x0, x1]) => checks.filter(c => c >= x0 && c < x1).length === 1), 'one shrine in each area, closing its exam: ' + checks);
for (const [col, arc] of Object.entries(ARCS)) for (const [stage, [a, b]] of Object.entries(arc)) {
  const uses = col === 'green' ? E('vinebed') : col === 'blue' ? [...E('floatwell'), ...jars.filter(j => j.col === 'blue')] : [...E('thornhedge'), ...L.ents.filter(e => e.thornCoat)];
  ok(uses.some(u => u.x >= a && u.x <= b), col + ' ' + stage + ' has its use in ' + a + '-' + b); }
/* every REQUIRED use is a lock: plain = no; full = yes; each one taken out = no */
const A = L.arena, ax = Math.floor(A.trigger / TS) + 2, ay = Math.round(A.floor / TS) - 1, reached = F => F.seen.has(ax + ',' + ay) || F.seen.has(ax + ',' + (ay - 1));
ok(!reached(floodReach(L, T, { noAssist: true })), 'legs alone never reach her (the jars are the way)');
ok(reached(floodReach(L, T, { rides: true })), 'the jars done, the boss room is reached');
const optional = new Set(['72']);   /* the high leaf's bed: a silver, off the road */
const req = [...E('vinebed').filter(b => !optional.has(String(b.x))).map(b => ({ k: 'bed ' + b.x, cut: { reachSpans: L.reachSpans.filter(s => !(b.grow === 'ladder' ? s[0] === b.x && s[1] === b.x : s[0] === b.x0 && s[2] === b.row)) } })),
  /* an unburnt hedge is as good as rock (the shared fill's jump checks only rock between its ends, src/reachcore.js: a barred cell it counts as a door) */
  ...E('thornhedge').map(h => { const grid = L.grid.slice(); for (let y = h.y0; y <= h.y1; y++) for (let x = h.x0; x <= h.x1; x++) grid[y * L.W + x] = T.SOLID; return { k: 'hedge ' + h.x0, cut: { grid, reachDoors: L.reachDoors.filter(d => d.x0 !== h.x0) } }; }),
  ...E('floatwell').map(w => ({ k: 'well ' + w.x, cut: { reachVents: L.reachVents.filter(v => v.x !== w.x) } }))];
for (const r of req) ok(!reached(floodReach({ ...L, ...r.cut }, T, { rides: true })), 'the ' + r.k + ' is a LOCK: without it the boss room is lost');
ok(req.length >= 14, 'fourteen required jar uses: ' + req.length);
const spots = (STUCK.underleaf || []);
for (const r of req) { const x = +r.k.split(' ')[1]; ok(spots.some(s => s.at && Math.abs(s.at[0] - x) <= 1), 'the ' + r.k + ' is glinted and nudged (src/stuck-spots.js)'); }
ok(E('silver').length === 3, 'three silvers (A11: cap 3)');
/* her numbers */
ok(GM.ward >= 0.4 && GM.openMul >= 1.5 && GM.openMul <= 2 && GM.after >= 2.5 && GM.after <= 3.5 && GM.purse <= 0.25, 'her ward x0.4 (B15 floor), x2 open on a purse, a ~3 s told ward after');
ok(FULL_DAMAGE.grandmother && OPEN_RULE.grandmother({ mode: 'floated', gm3: true }) === true, 'off the chip, and floated is her opening (src/boss-greed.js)');
ok(GATE.includes('underleaf'), 'UNDERLEAF is held to the level-quality bar');
ok(JAR.bubbleR > 8 && JAR.rise > 60, 'a bubble a hero fits in, that rises');

/* ---- THE PAGE ---- */
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{
  const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const I=LEVELS.findIndex(l=>l.id==='underleaf');const out={};
  const P=()=>BK.P,K=BK.keys,H=()=>BK.potions();
  const boot=(x,y,hero)=>{BK.setHero(hero||'knight');BK.reset({fresh:true});BK.load(I);BK.state='play';BK.god=true;BK.P.hp=BK.P.maxHp;if(x!==undefined){BK.tp(x,y);BK.sim(20);}};
  const jarAt=(col,x)=>H().state().jars.filter(j=>j.col===col&&j.state==='rest').sort((a,b)=>Math.abs(a.x-x)-Math.abs(b.x-x))[0];
  const take=j=>{P().x=j.x;P().y=j.hy;P().vx=0;P().vy=0;BK.sim(3);BK.press('talk');BK.sim(2);return P().carry===j;};
  const toss=(j,fromX,aim)=>{P().x=fromX;P().vx=0;BK.sim(4);P().face=1;K.up=aim==='high';K.down=aim==='low';BK.sim(1);const a=H().jarArc(j);BK.press('atk');let k=0;for(;k<150&&(j.state==='held'||j.state==='fly');k++)BK.sim(1);K.up=K.down=false;return {land:a.land?{x:Math.round(a.land.x),y:Math.round(a.land.y)}:null,state:j.state};};
  const tile=(x,y)=>BK.L.grid[y*BK.L.W+x];
  /* GREEN: the garden's ladder bed */
  {boot(8,29);const j=jarAt('green',9*16);out.took=take(j);const b=H().state().beds.find(q=>q.tx===13);const t=toss(j,b.x-38,'low');
   out.green={t,grown:b.grown,net:[23,26,29].map(y=>tile(13,y)),said:BK.textLab.nums().map(n=>n.txt)};
   /* and it stays through a death */
   BK.god=false;P().hp=1;BKT.hurtPlayer?BKT.hurtPlayer(99):(P().hp=0,P().dead=1);for(let i=0;i<60*5&&(P().dead||BK.state!=='play');i++)BK.sim(1);BK.god=true;
   out.green.after=H().state().beds.find(q=>q.tx===13).grown&&tile(13,25)===${T.NET};
   /* climb it: the upper garden */
   P().x=13*16+8;P().y=29*16+16;P().vx=0;BK.sim(4);let top=99;for(let i=0;i<240;i++){K.up=true;if(i%14===0)BK.press('jump');K.right=i>150;BK.sim(1);top=Math.min(top,Math.floor(P().y/16));}K.up=K.right=false;out.green.top=top;}
  /* GREEN: the ditch's bridge bed */
  {boot(45,29);const j=jarAt('green',46*16);take(j);const b=H().state().beds.find(q=>q.tx===49);const t=toss(j,b.x-38,'low');out.bridge={t,grown:b.grown,cells:[50,53,57].map(x=>tile(x,30))};}
  /* BLUE: the float well under the loft */
  {boot(98,29);const j=jarAt('blue',99*16);take(j);const w=H().state().wells[0];const t=toss(j,w.x-40,'low');
   const bb=H().state().bubbles[0];out.blue={t,bubble:bb?bb.state:null};
   let rode=false,best=99;for(let i=0;i<60*5;i++){const b=H().state().bubbles[0];if(b&&b.state==='hover'){K.right=P().x<b.x-2;K.left=P().x>b.x+2;}else if(b&&b.rider==='P'){rode=true;K.left=false;K.right=Math.floor(P().y/16)<=21;}else{K.left=false;K.right=rode;}BK.sim(1);if(P().ground)best=Math.min(best,Math.floor(P().y/16));}
   K.left=K.right=false;out.blue.rode=rode;out.blue.stood=best;out.blue.onLoft=P().x>105*16&&Math.floor(P().y/16)<=22;out.blue.used=w.used;}
  /* BLUE on a foe: off its feet */
  {boot(108,21);const j=jarAt('blue',108*16);take(j);const f=BK.enemies().find(e=>e.alive&&e.t==='sprig'&&Math.abs(e.x-113*16-8)<30);f.x=P().x+34;f.y=P().y;f.vx=0;f.stagger=9;const y0=f.y;toss(j,P().x,'low');for(let i=0;i<30;i++)BK.sim(1);out.foeFloat={floatT:+(f.floatT||0).toFixed(2),lifted:Math.round(y0-f.y),stag:(f.stagger||0)>0};}
  /* RED: the first hedge */
  {boot(191,29);const j=jarAt('red',192*16);take(j);const h=H().state().hedges[0];const t=toss(j,h.x0*16-40,'low');for(let i=0;i<90;i++)BK.sim(1);out.red={t,burnt:h.burnt,cells:[23,27,29].map(y=>tile(198,y))};
   BK.god=false;P().hp=1;BKT.hurtPlayer?BKT.hurtPlayer(99):(P().hp=0,P().dead=1);for(let i=0;i<60*5&&(P().dead||BK.state!=='play');i++)BK.sim(1);BK.god=true;out.red.after=H().state().hedges[0].burnt&&tile(198,26)===${T.AIR};}
  /* RED: the thorn-beast's coat */
  {boot(218,32);const b=BK.enemies().find(e=>e.alive&&e.t==='brute'&&e.thornCoat);b.stagger=9;const blow=(n)=>{const h0=b.hp;BKT.hurtAs('light',b,n,b.x-12,false);const d=h0-b.hp;b.hp=h0;return d;};
   const coat=blow(20),said=BK.textLab.nums().map(n=>n.txt);const j=jarAt('red',218*16);take(j);b.x=P().x+44;b.vx=0;toss(j,P().x,'low');for(let i=0;i<40;i++)BK.sim(1);out.coat={coat,said,off:!!b.coatOff,bare:blow(20)};}
  /* GREEN off a bed: a snare */
  {boot(58,29);const f=BK.enemies().find(e=>e.alive&&e.t==='sprig'&&Math.abs(e.x-60*16-8)<20);P().carry=null;const j=jarAt('green',78*16);take(j);f.x=P().x+36;f.y=P().y;f.vx=0;f.stagger=0;toss(j,P().x,'low');out.snare={stag:+(f.stagger||0).toFixed(2)};}
  /* 4. THE GRANDMOTHER 3 */
  {boot();const Ar=BK.L.arena;BK.tp(Math.round(Ar.trigger/16)+1,Math.round(Ar.floor/16)-1);for(let i=0;i<200;i++)BK.sim(1);const b=BK.boss;out.gAlive=b.alive&&BK.bossActive;
   const hold=()=>{b.fireT=b.hurlT=b.sweepT=b.stirT=99;};
   const blow=(fromX,n)=>{const h0=b.hp;BKT.hurtAs('light',b,n||40,fromX,false);const d=h0-b.hp;b.hp=h0;return d;};
   for(let i=0;i<180&&!H().broodOf(b).length;i++){hold();BK.sim(1);}
   const brood=H().broodOf(b).length;const warded=blow(b.x-14,40);const wword=BK.textLab.nums().map(n=>n.txt).includes('WARDED');
   /* a blue jar on her with the brood up: it does not hold her */
   const j0=jarAt('blue',b.x);take(j0);P().x=b.x-56;P().face=1;BK.sim(1);hold();BK.press('atk');for(let i=0;i<40;i++){hold();BK.sim(1);}const heldDown=b.mode!=='floated';
   for(const q of H().broodOf(b))BKT.hurtAs('heavy',q,999,q.x-10,false);for(let i=0;i<10;i++){hold();BK.sim(1);}
   const bare=blow(b.x-14,40),broodLeft=H().broodOf(b).length;
   /* bare: a blue jar floats her */
   b.ward=0;b.mode='walk';b.modeT=0;b.broodT=99;for(let i=0;i<300&&!P().carry;i++){const j=jarAt('blue',P().x);if(j){take(j);}BK.sim(1);}
   P().x=b.x-56;P().y=Ar.floor;P().vy=0;P().face=1;BK.sim(2);hold();b.broodT=99;b.vx=0;P().x=b.x-56;BK.press('atk');let fl=false;for(let i=0;i<50&&!fl;i++){hold();b.broodT=99;BK.sim(1);fl=b.mode==='floated';}
   const open=BK.bossOpen?BK.bossOpen(b):null,floatY=Math.round(b.y);const x2=blow(b.x-14,20);
   let purse=0;const hp0=b.hp;for(let i=0;i<40&&b.mode==='floated';i++){BKT.hurtAs('light',b,30,b.x-14,false);hold();BK.sim(3);}purse=hp0-b.hp;
   for(let i=0;i<300&&b.mode==='floated';i++){hold();BK.sim(1);}
   const after={ward:+(b.ward||0).toFixed(2),mode:b.mode,blade:blow(b.x-14,40)};
   b.hp=hp0;
   /* her marks: a fireball's spot is marked before it lands; a hurled jar's too; a green jar's thorns hurt a grounded hero */
   b.ward=0;b.mode='walk';b.modeT=0;b.broodT=99;b.sweepT=b.hurlT=b.stirT=99;b.fireT=0;let fm=0,landed=false;for(let i=0;i<150;i++){b.broodT=99;b.sweepT=b.hurlT=b.stirT=99;BK.sim(1);fm=Math.max(fm,H().marks().filter(m=>m.kind==='fire').length);if(fm&&!H().marks().some(m=>m.kind==='fire'))landed=true;}
   b.mode='walk';b.modeT=0;b.fireT=99;b.hurlT=0;b.hurls=0;let pm=0;for(let i=0;i<150;i++){b.broodT=99;b.sweepT=b.fireT=b.stirT=99;BK.sim(1);pm=Math.max(pm,H().marks().filter(m=>m.kind==='pot').length);}
   const gp=H().gpatches();
   BK.god=false;P().hp=P().maxHp;P().inv=0;const gq=H().gpatches()[0];let hurt=0;if(gq){P().x=gq.x;P().vx=0;const h0=P().hp;for(let i=0;i<60;i++){b.broodT=b.sweepT=b.fireT=b.stirT=b.hurlT=99;P().x=gq.x;BK.sim(1);}hurt=h0-P().hp;}BK.god=true;P().hp=P().maxHp;
   /* phase two: the cauldron, a bigger brood */
   b.mode='walk';b.modeT=0;b.hp=Math.floor(b.maxHp*0.5);for(const q of H().broodOf(b))q.hp=0;let ph2=null;for(let i=0;i<400;i++){b.fireT=b.hurlT=b.sweepT=99;BK.sim(1);if(b.phase===2&&ph2===null)ph2=i;}
   const brood2=H().broodOf(b).length;b.stirT=0;b.mode='walk';b.modeT=0;let gm=0;for(let i=0;i<120;i++){b.fireT=b.hurlT=b.sweepT=b.broodT=99;BK.sim(1);gm=Math.max(gm,H().marks().filter(m=>m.kind==='gout').length);}
   out.gran={brood,warded,wword,heldDown,bare,broodLeft,fl,open,x2,purse,maxHp:b.maxHp,after,fm,landed,pm,gp:gp.map(q=>q.col),hurt,phase:b.phase,ph2,brood2,gm};}
  /* 5. OLD SAVES */
  {const PR=BKT.PROG;BK.setHero('knight');BK.reset({fresh:true});PR.kings={cleared:true};PR.underleaf={cleared:true,silver:5,relic:true,best:400};PR.potTold=2;
   let err=null;try{BK.load(I);BK.state='play';for(let i=0;i<60;i++)BK.sim(1);}catch(e){err=String(e);}
   out.save={err,silver:PR.underleaf.silver,cleared:PR.underleaf.cleared,got:BK.silvers?BK.silvers().filter(s=>s.got).length:null,jars:H()?H().state().jars.length:0};
   BK.reset({fresh:true});PR.kings={cleared:true};delete PR.underleaf;let err2=null;try{BK.load(I);BK.state='play';for(let i=0;i<60;i++)BK.sim(1);}catch(e){err2=String(e);}out.save.mid=err2;}
  return out;})()`, 900000);
  console.log(JSON.stringify(r));
  ok(r.took, 'INTERACT takes a jar');
  ok(r.green.t.land && r.green.grown && r.green.net.every(t => t === T.NET), 'GREEN on the seed bed: the vine LADDER grows up the wall: ' + JSON.stringify(r.green));
  ok(r.green.after, 'and it stays grown through a death');
  ok(r.green.top <= 23, 'and the hero climbs it onto the upper garden: row ' + r.green.top);
  ok(r.bridge.grown && r.bridge.cells.every(t => t === T.ONEWAY), 'GREEN on the ditch bed: a vine BRIDGE across: ' + JSON.stringify(r.bridge));
  ok(r.blue.bubble === 'hover' && r.blue.rode && r.blue.onLoft && r.blue.used, 'BLUE: a bubble where it broke; stepped into, it LIFTS the hero onto the loft no jump reaches: ' + JSON.stringify(r.blue));
  ok(r.foeFloat.floatT > 0 && r.foeFloat.lifted > 8 && r.foeFloat.stag, 'BLUE on a foe: lifted off its feet, helpless: ' + JSON.stringify(r.foeFloat));
  ok(r.red.burnt && r.red.cells.every(t => t === T.AIR) && r.red.after, 'RED: the thorn hedge burns away, and stays gone: ' + JSON.stringify(r.red));
  ok(r.coat.coat > 0 && r.coat.coat <= 10 && r.coat.said.includes('BURN IT') && r.coat.off && r.coat.bare >= 18, 'the thorn-beast: x0.4 and BURN IT, a red jar burns its coat off, then whole: ' + JSON.stringify(r.coat));
  ok(r.snare.stag > 0.5, 'GREEN off a bed: a snare holds the foe: ' + JSON.stringify(r.snare));
  const G = r.gran;
  ok(r.gAlive && G.brood >= GM.brood, 'her fight is on and she calls her brood: ' + G.brood);
  ok(G.warded > 0 && G.warded <= G.bare * GM.ward + 1 && G.wword, 'brood up: WARDED x0.4 - never wholly invulnerable (B15): ' + G.warded);
  ok(G.heldDown, 'a blue jar does not hold her while her brood stands');
  ok(G.broodLeft === 0 && G.bare >= 38, 'brood dead: a blow lands whole: ' + G.bare);
  ok(G.fl && G.open === true && G.x2 >= 38, 'a BLUE jar floats her: OPEN (the gold read), x2: ' + JSON.stringify({ fl: G.fl, open: G.open, x2: G.x2 }));
  ok(G.purse <= Math.ceil(G.maxHp * GM.purse) + 2, 'one opening pays at most its purse: ' + G.purse + ' of ' + G.maxHp);
  ok(G.after.ward >= GM.after - 0.6 && G.after.mode !== 'floated' && G.after.blade > 0 && G.after.blade <= G.bare * GM.ward + 1, 'the opening over, a told ward - still x0.4, never 0: ' + JSON.stringify(G.after));
  ok(G.fm >= GM.fireN && G.landed, 'her fireballs: the spots are marked before they land: ' + G.fm);
  ok(G.pm >= 1 && G.gp.length >= 1, 'her hurled jar: its spot marked, its patch left: ' + JSON.stringify(G.gp));
  ok(G.hurt > 0, 'her thorns / burning ground hurt a hero who stands in them: ' + G.hurt);
  ok(G.phase === 2 && G.brood2 >= GM.brood2 && G.gm >= GM.stirN, 'phase two: the cauldron (gouts on marked spots) and a bigger brood: ' + JSON.stringify({ phase: G.phase, brood2: G.brood2, gm: G.gm }));
  ok(!r.save.err && r.save.silver === 5 && r.save.cleared && r.save.jars > 10, 'an old save that cleared Underleaf loads the new village with its bits kept: ' + JSON.stringify(r.save));
  ok(!r.save.mid, 'a save standing between Kingswood and Underleaf loads it: ' + r.save.mid);
  assert.deepEqual(pg.errors.slice(0, 3), [], 'no page errors');
  console.log('underleaf: ' + n + ' checks - her jars, the vines, the bubbles, the fires, the locks and THE GRANDMOTHER 3 all hold');
} finally { pg.close(); }
