(async()=>{const{LEVELS}=await import('./src/level.js'),shots=[],rows=[];const LI=LEVELS.findIndex(l=>l.id==='hurricane');BK.setHero('knight');BK.load(LI);BK.state='play';BK.start();BK.god=false;BK.reset();BK.sim(30);
/* (claude/hurricane3) THE HURRICANE DECK 3, in the page - the storm CHANGES the level (scratch/brief-hurricane3-1018.md + the approved review):
   1 the sky fells her foremast across the breach and its length is walked onto her boats; 2 her waist FLOODS on its cycle and a swimmer leaps onto the galley roof;
   3 a struck LASHING frees a cask and her heel runs it to the fore house: a step; 4 ROD 1: the chain struck onto the iron, the next bolt burns the tarred net off the
   main hatch; 5 SHE SINKS: crossing a told step raises the sea, and a respawn wakes to its shrine's step; 6 THE CAPTAIN on his yards: caught off a line by his own
   BRACE! sweep he is KNOCKED FLAT (then warded), the masthead rod's bolt STRIKES him in its column, and at 62% the sea takes the topsail yard */
const fresh=()=>{BK.load(LI);BK.state='play';BK.start();BK.god=false;BK.reset();BK.sim(30);};
const P=()=>BK.P,L=()=>BK.L,H=()=>BK.h3(),clear=(x0,r=900)=>{for(const e of BK.enemies())if(!e.maxHp&&Math.abs(e.x-x0*16)<r)e.alive=false;};
// 1. THE FOREMAST
clear(185);BK.tp(170,35);BK.sim(2);const F=L().felled[0];let n=0;while(F.state!=='down'&&n<900){BK.sim(1);n++;}if(F.state!=='down')throw Error('the foremast did not come down');
BK.tp(172,35);BK.sim(3);BK.keys.right=true;let k=0;while(P().x<199*16&&k<900){BK.sim(1);k++;}BK.keys.right=false;BK.sim(5);
if(P().x<199*16||P().swim||Math.abs(P().y-34*16)>3)throw Error('the foremast was not walked onto her boats: '+P().x/16+','+P().y/16);rows.push({foremast:F.state,frames:n,boatsAt:Math.round(P().x/16)});
// 2. THE WAIST FLOODS: drained it is a well; flooded a swimmer at the galley wall leaps onto the roof
fresh();clear(130);BK.god=true;BK.tp(146,43);BK.sim(5);const fl=()=>BK.h3read().floods[0];let ph0=fl().ph,sawLow=false,sawHigh=false;for(let i=0;i<60*30&&!sawHigh;i++){BK.sim(1);if(fl().ph==='low')sawLow=true;if(sawLow&&fl().ph==='high')sawHigh=true;}
if(!sawHigh)throw Error('the waist never flooded: '+JSON.stringify(fl()));if(!P().swim)throw Error('a hero on the waist floor is not swimming in the flood');
BK.keys.right=true;BK.keys.up=true;for(let i=0;i<30;i++)BK.sim(1);BK.press('jump');BK.sim(1);for(let i=0;i<40;i++)BK.sim(1);BK.keys.right=false;BK.keys.up=false;BK.sim(20);
if(!(P().y<=33*16+2&&P().x>151*16))throw Error('the swimmer did not climb out onto the galley roof: '+P().x/16+','+P().y/16);rows.push({waist:'flooded',roof:Math.round(P().x/16)});
// 3. THE LASHING: struck, the next heel to the stern runs the cask to the fore house - a step
fresh();clear(75);BK.god=true;const c=BK.movers().find(m=>m.id==='step1');if(!c||!c.lashed)throw Error('no lashed cask by the fore house');BK.tp(68,35);BK.P.face=1;BK.sim(2);BK.press('atk');BK.sim(20);
if(c.lashed)throw Error('the blow did not part the lashing');let rest=false;for(let i=0;i<60*50&&!rest;i++){BK.sim(1);if(Math.abs(c.x-78*16)<3&&Math.abs(c.vx)<1&&!(BK.h3read()&&0))rest=true;}
if(!rest)throw Error('her heel never ran the cask to the house: '+c.x/16);rows.push({cask:'step',at:Math.round(c.x/16)});
// 4. ROD 1: strike the chain onto the iron, stand clear: the bolt burns the tarred net
fresh();clear(290);BK.god=true;const r1=()=>BK.h3read().rods.find(r=>r.id==='r1');BK.tp(294,35);BK.P.face=1;BK.sim(3);BK.press('atk');BK.sim(10);if(!r1().connected)throw Error('the chain was not struck onto the iron');
BK.tp(280,35);let burnt=false;for(let i=0;i<60*14&&!burnt;i++){BK.sim(1);if(r1().done)burnt=true;}const g=L().grid,W=L().W;
if(!burnt||g[36*W+288]!==0)throw Error('the bolt did not burn the net off the hatch: '+JSON.stringify(r1())+' cell '+g[36*W+288]);rows.push({rod1:'burnt'});
// 5. SHE SINKS: a told step raises the sea; a death wakes to the step of the shrine it woke at
fresh();clear(260);BK.god=false;const s0=BK.h3read().seaY;BK.tp(214,35);for(let i=0;i<60*4;i++)BK.sim(1);const s1=BK.h3read();if(!(s1.step>=1&&s1.seaY<s0))throw Error('crossing the step did not raise the sea: '+JSON.stringify(s1));
BK.P.hp=0;BK.P.dead=0.01;for(let i=0;i<60*6&&BK.P.dead;i++)BK.sim(1);const s2=BK.h3read();rows.push({sink:{step:s1.step,from:s0,to:Math.round(s1.seaY),afterDeath:s2.step}});
// 6. THE CAPTAIN: his own BRACE! sweep takes him off a line; the rod strikes him in its column; the sea takes the topsail yard at 62%
fresh();clear(300,2000);BK.god=true;BK.tp(298,18);let b=null;for(let i=0;i<300&&!(b&&b.mode!=='sleep'&&b.mode!=='wake');i++){BK.sim(1);b=BK.enemies().find(e=>e.t==='captain');}
if(!b)throw Error('no captain');L().arena.nets=[];let flat=0,ward=0;for(let i=0;i<60*40&&!(flat&&ward);i++){BK.sim(1);if(b.mode==='beach')flat=1;if(flat&&b.ward>0)ward=1;}
if(!flat)throw Error('his BRACE! sweep never knocked the Captain flat off a line');if(!ward)throw Error('no ward after his opening');
let struck=0;b.x=300.5*16;for(let i=0;i<60*20&&!struck;i++){b.x=300.5*16;BK.sim(1);if(b.struck)struck=1;}if(!struck)throw Error('the masthead rod never struck him in its column');
b.hp=Math.round(b.maxHp*0.6);let p2=0,sea=0;for(let i=0;i<60*12&&!sea;i++){BK.sim(1);if(b.phase>=2)p2=1;if(BK.h3read().seaY<19*16)sea=1;}if(!p2||!sea)throw Error('at 62% the sea did not take the topsail yard: '+JSON.stringify(BK.h3read()));
rows.push({captain:{flat:!!flat,ward:!!ward,struck:!!struck,phase2sea:!!sea}});
return{shots,rows};})()
