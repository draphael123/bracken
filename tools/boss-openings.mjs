/* tools/boss-openings.mjs — THE WINDOW THE PLAYER MAKES.
   All four of the levels added in the Codex pass shipped a boss that chose its attacks with turn++%n and handed out a
   timed rest after every one of them, so nothing the player did ever opened anything: docs/audit-new-levels-0920.md.
   Each of them now has one opening the player causes, and this proves it is caused - the same boss, left alone through
   the same attack, must NOT open.
     THE BURIED DEAD   slam him down on the ground he already erupted through; and (claude/burial2) light a gas vent under him - he is
                       SCORCHED, open, where the same vent cold, or his rest after any blow, opens nothing
     THE BREAKWATER WARDEN  turn the anchor on the shield
     THE UNDEAD ARCHMAGE  fly out of his DEATH MARK: the mark that finds no one comes back on him (batch 4, the sky fight)
     THE PYROMANDER    keep hitting him while he runs hot: he cannot vent, and his own fire takes him over the top (batch 5)
     THE GRAVE WARDEN  let his dig mark you beside an open grave and leave late: the spade goes in and he kneels (batch 4b)
     THE HEDGE WARDEN  cut him down beside a witchlight brazier: the stump burns, open, and cannot regrow while it does (batch 4c); a
                       stump on the open lawn is green wood a blow only chips, a quarter, and nothing grows back (claude/hedgewarden3)
     THE GATE GARGOYLE  be on the slab his shadow finds and leave it late: his dive smashes through it - a low slab or a high one
                        (GARG.smashAny) - and he crashes onto the spikes, stunned, where a stomp is the only blow (round three,
                        2026-09-27); leaving early only moves his aim (tools/gargoyle-smash.mjs and tools/gargoyle-stomp.mjs ask the rest)
     THE DEATH KNIGHT  the hero turned boss (2026-09-25): be under his CLEAVE when he commits it and dodge out of it, and the blade
                       sticks in the chapel floor - he is open; a Cleave taken, or one nobody was under, sticks nothing. (THE FIRST
                       DEATH KNIGHT's ward-break, renamed THE REAPER and benched, is asked in Node by tools/unburied-fights.mjs)
     THE WINDCALLER    brace through his howl (the guard key held on the ground): his own wind fails him and he falls, open; the
                       same howl left to blow walks you to the wall and opens nothing (Gale Moor rework, 2026-09-25)
     THE DUNE WORM     wind the hollow's awning out and let his breach come up under it: he comes up INTO the canvas, tangled, and
                       the awning comes down; the same breach in the open sand, or under the awning rolled IN, opens nothing (2026-09-25)
     THE SEXTON        make him rush you across a counting plank: it breaks under his charge and he is caught in the bell pit (2026-09-25)
     THE DIVING BELL   let a ballast stone go over the valve on his crown: he vents, open; every attack of his left alone keeps the shell
                       shut, and the rack sets its stone back (the Deep rework, docs/briefs/deep-rework-2.md)
     THE WICKER QUEEN  turn round on her while she stands on the bonfire's embers: the wicker catches and burns open; the same look short of them,
                       or her crossing them unseen, opens nothing (claude/fair3)
     THE PUPPETEER     drop both his puppets (blows or cut strings) and he is dragged down to the boards, open; a minute of his puppets left alone -
                       windups, blows - opens nothing (claude/puppeteer, PUPPETEER3)
     JENNY GREENTEETH  drain her lock (strike the lower paddle) while she is at your gate: the water runs out from under her and she is stranded in
                       the mud, open; a minute of her left alone opens nothing (claude/lockkeeper)
     THE LAMPREEVE, THE HEADLESS PLOUGHMAN, THE HOMUNCULUS (minis, claude/weakboss): strike the lamp he hoods / bait the plough into the
                       trough or the fence / make a trick miss you - each against the same thing left alone, in tools/weak-bosses.mjs
     THE CISTERN QUEEN flood her burrow (a pour on her mound): SOAKED; a pour down her wall from its ledge: ON HER BACK; her claw struck as it comes: REARING -
                       each open; E at her on the open floor pours nothing; a minute of her left alone opens nothing. THE GANG LEADER (a mini): his bottle
                       struck home sets him alight, open, a third of him a burning (claude/welltown3)
     THE BARROW RIDER  strike him as he rides through and he is out of the saddle, open; a ride left alone opens nothing - and in
                       his second phase, the bones crawling back struck twice scatter, and he is open on foot; left alone he remounts */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';

const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{
  const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const out={};
  const boot=(id,hero)=>{BK.setHero(hero||'knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id===id));BK.state='play';BK.god=true;
    const A=BK.L.arena;if(A.carpet){BK.board();BK.sim(150);return BK.boss;}BK.tp(Math.round(A.trigger/16)+(A.reverse?-1:1),Math.round(A.floor/16)-1);BK.sim(150);return BK.boss;};

  /* THE BURIED DEAD: the slam onto his own broken ground */
  {const b=boot('burial');const A=BK.L.arena;
   // left alone, the same slam is just a slam
   b.brokeT=0;BK.P.x=b.x-260;for(let i=0;i<8&&b.mode!=='rest';i++){b.mode='slamTell';b.modeT=0;BK.sim(1);}const alone=b.mode;
   // and with the hole under him it takes his arm
   for(let i=0;i<8&&!(b.brokeT>0);i++){b.mode='eruptTell';b.markX=b.x;b.modeT=0;BK.sim(1);}const broke=b.brokeX;
   for(let i=0;i<8&&b.mode!=='stuck';i++){b.mode='slamTell';b.modeT=0;BK.sim(1);}
   out.buried={alone,broke:Math.round(broke-b.x),mode:b.mode,open:+b.open.toFixed(1)};}
  /* THE BURIED DEAD: a vent under him, cold and then lit (his rest, after a blow nobody answered, is the control: it opens nothing) */
  {const b=boot('burial');const A=BK.L.arena,v=BK.L.gasVents.filter(v=>v.x*16>A.x0&&v.x*16<A.x1).sort((p,q)=>Math.abs(p.x*16-(A.x0+A.x1)/2)-Math.abs(q.x*16-(A.x0+A.x1)/2))[0];
   BK.P.x=b.x-200;b.x=v.x*16+8;b.mode='cleaveTell';b.modeT=0;b.open=0;BK.sim(3);const rest={mode:b.mode,open:+(b.open||0).toFixed(1)};
   b.mode='walk';b.modeT=3;b.open=0;v.litT=0;let coldOpen=0;for(let i=0;i<60;i++){b.x=v.x*16+8;BK.sim(1);coldOpen=Math.max(coldOpen,b.open||0);}
   b.mode='walk';b.modeT=3;b.open=0;v.litT=20;v.burnt=false;let mode=null,open=0;for(let i=0;i<30;i++){BK.sim(1);if(b.mode==='scorched')mode='scorched';open=Math.max(open,b.open||0);}
   out.buriedGas={rest,coldOpen:+coldOpen.toFixed(1),mode,open:+open.toFixed(1)};}

  /* THE BREAKWATER WARDEN: the anchor turned on the shield */
  {const b=boot('harbor');
   b.open=0;for(let i=0;i<8&&b.open===0;i++){b.mode='anchorTell';b.modeT=0;BK.P.x=b.x+40*b.face;BK.P.face=-b.face;BK.keys.block=false;BK.sim(1);}const unguarded=+b.open.toFixed(1);
   /* god mode never reports a block, and the block IS the mechanic: the unguarded pass above runs untouchable, this one does not */
   BK.god=false;BK.P.hp=BK.P.maxHp;BK.P.dead=0;
   b.open=0;BK.keys.block=true;BK.sim(10);for(let i=0;i<10&&b.open===0;i++){b.mode='anchorTell';b.modeT=0;BK.P.hp=BK.P.maxHp;BK.P.dead=0;BK.P.x=b.x+40*b.face;BK.P.face=-b.face;BK.keys.block=true;BK.sim(1);}
   out.warden={unguarded,guarded:+b.open.toFixed(1),mode:b.mode};BK.keys.block=false;BK.god=true;}


  /* THE UNDEAD ARCHMAGE: the death mark, left to land and then flown out of */
  {const b=boot('fallingtower');const hold=()=>{BK.P.vx=BK.P.vy=0;};
   const lay=()=>{b.mode='markTell';b.spell='mark';b.modeT=0;b.deathMark=null;b.shots=[];b.clouds=[];b.blinkT=99;BK.sim(2);return !!b.deathMark;};
   // left to land: he is NOT open
   BK.god=false;BK.P.hp=BK.P.maxHp;const laid1=lay();const m1=b.deathMark&&{x:b.deathMark.x,y:b.deathMark.y};for(let i=0;i<200&&b.deathMark;i++){if(m1){BK.P.x=m1.x;BK.P.y=m1.y+8;}hold();BK.sim(1);}
   const landed={mode:b.mode,open:+(b.open||0).toFixed(1),hurt:BK.P.hp<BK.P.maxHp};BK.P.hp=BK.P.maxHp;BK.god=true;
   // flown out of: it comes back on him
   b.mode='hover';b.modeT=1;BK.sim(5);const laid2=lay();const m2=b.deathMark&&{x:b.deathMark.x,y:b.deathMark.y};for(let i=0;i<200&&b.deathMark;i++){if(m2){BK.P.x=m2.x+b.deathMark.r+40;BK.P.y=m2.y+8;}hold();BK.sim(1);}
   out.mage={laid:laid1&&laid2,landed,mode:b.mode,open:+(b.open||0).toFixed(1)};}
  /* THE PYROMANDER: the same hot boss, left alone (he vents) and struck (he overheats) */
  {const b=boot('burning');BK.P.x=b.x-110;
   b.heat=75;b.calmT=5;b.mode='stalk';b.cd=0;b.open=0;let openA=0;for(let i=0;i<240;i++){BK.sim(1);openA=Math.max(openA,b.open||0);}
   const alone={open:+openA.toFixed(1),heat:Math.round(b.heat)};
   b.heat=75;b.calmT=0;b.mode='stalk';b.cd=0;b.open=0;let openS=0;for(let i=0;i<600&&!(b.open>0);i++){if(i%30===0)BKT.hurtEnemy(b,1,b.x-20,false);BK.sim(1);}openS=b.open||0;
   out.pyro={alone,mode:b.mode,open:+openS.toFixed(1)};}
  /* THE GRAVE WARDEN: his dig, on solid floor and then beside an open grave, the hero gone from the mark both times */
  {BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='burial'));BK.state='play';BK.god=true;
   const M=BK.L.mini;BK.tp(Math.round(M.trigger/16)+1,Math.round(M.floor/16)-1);BK.sim(120);const w=BK.enemies().find(e=>e.t==='gravewarden');
   const dig=markX=>{w.mode='digTell';w.modeT=0;w.markX=markX;w.cd=99;BK.P.x=markX+90;BK.sim(3);return {mode:w.mode,open:+(w.open||0).toFixed(1)};};
   const G=BK.L.graves,solid=dig(((G[0]+G[1])/2|0)*16);w.mode='stalk';w.modeT=0;BK.sim(2);const grave=dig((G[1]+1)*16+6);   /* (read off the level: claude/burial2 moved his vault) */
   out.graveWarden={solid,grave};}
  /* THE HEDGE WARDEN: felled on the open lawn, then felled beside a brazier - the same blow, the hero standing off both times */
  {BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='witchlight'));BK.state='play';BK.god=true;
   const M=BK.L.mini;BK.tp(Math.round(M.trigger/16)+1,Math.round(M.floor/16)-1);BK.sim(120);const w=BK.enemies().find(e=>e.t==='hedgewarden'&&e.mini);
   const third=w.maxHp/3,root=w.maxHp-third+w.maxHp*0.16;
   const fell=x=>{w.mode='stalk';w.cd=99;w.burnT=0;w.growth=0;w.greenUp=false;w.hp=Math.ceil(root)+2;w.x=x;BK.P.x=x-150;BKT.hurtEnemy(w,Math.ceil(third),w.x-20,false);BK.sim(20);return {mode:w.mode,open:+(w.open||0).toFixed(1),hint:(BK.hint||{}).t>0?(BK.hint||{}).msg||'':''};};
   const HW=await import('/src/hedge-warden.js'),call=()=>HW.brazierCall?HW.brazierCall(w):null;
   const smokeN=()=>BK.parts().filter(q=>q.grav<0&&(q.col==='#5a5460'||q.col==='#4a4450')).length;
   const bite=()=>{BK.sim(40);const h0=w.hp,s0=smokeN();BKT.hurtEnemy(w,30,w.x-20,false);const took=Math.round(h0-w.hp);BK.sim(20);   /* (past the blow's hitstop) */bite.smoke=smokeN()-s0;return took;};
   BKT.PROG.hedgeHint=0;const upCall=call();const lawn=fell(143*16);lawn.upCall=upCall;lawn.call=call();
   {const hints=[lawn.hint];for(let i=0;i<3;i++){BK.sim(300);BK.textLab.hint('',0);hints.push(fell(143*16).hint);}lawn.hints=hints;lawn.hintCount=BKT.PROG.hedgeHint;BKT.PROG.hedgeHint=undefined;}
   lawn.bite=bite();lawn.smoke=bite.smoke;lawn.left=Math.round(w.hp);   /* (claude/hedgewarden3: a green stump takes a quarter, and puffs smoke) */
   BK.P.x=w.x-150;BK.sim(330);const grew={mode:w.mode,hp:Math.round(w.hp),full:Math.round(w.maxHp),call:call()};
   /* up again on the green root: a blow on the open lawn chips a quarter and does not fell him; the same blow at a brazier fells him there, burning */
   w.x=143*16;w.cd=99;BK.P.x=w.x-150;grew.upBite=bite();grew.upMode=w.mode;
   w.mode='stalk';w.cd=99;w.x=BK.L.witch.braziers[0][0]*16+20;BK.P.x=w.x-150;BK.sim(2);const h1=w.hp;BKT.hurtEnemy(w,30,w.x-20,false);BK.sim(20);grew.atFire={mode:w.mode,open:+(w.open||0).toFixed(1),hp:Math.round(w.hp),was:Math.round(h1)};
   const fire=fell(BK.L.witch.braziers[0][0]*16+20);BK.P.x=w.x-150;BK.sim(120);const burning={mode:w.mode,open:+(w.open||0).toFixed(1)};burning.bite=bite();
   out.hedgeWarden={lawn,grew,fire,burning};}
  /* THE GATE GARGOYLE: the same dive three times - on a low slab left late, on a high slab left late, on a slab left early */
  {BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='witchlight'));BK.state='play';BK.god=true;
   const g=BK.enemies().find(e=>e.t==='gargoyle');for(const e of BK.enemies())if(e!==g)e.alive=false;const sl=BK.movers().filter(m=>m.arena);
   const on=m=>{BK.P.x=m.x+m.w/2;BK.P.y=m.y;BK.P.vy=0;BK.P.onMover=m;BK.P.ground=true;};
   on(sl[0]);BK.sim(90);
   const next=m=>sl.filter(q=>q!==m&&!q.broken&&q.y===m.y).sort((a,b)=>Math.abs(a.x-m.x)-Math.abs(b.x-m.x))[0];
   const dive=(m,late)=>{g.mode='hover';g.hp=g.maxHp;g.phase=1;BK.sim(2);on(m);g.mode='diveTell';g.modeT=0.4;g.tgt=m;g.off=m.w/2;g.cd=99;g.queue=[];
     if(!late)on(next(m));for(let i=0;i<120&&g.mode==='diveTell';i++){if(late)on(m);BK.sim(1);}
     if(late)on(next(m));for(let i=0;i<240&&['dive','smash','crash'].includes(g.mode);i++)BK.sim(1);const o={mode:g.mode,open:+(g.open||0).toFixed(1),broken:!!m.broken,aim:g.tgt===m};g.mode='hover';g.modeT=0;return o;};
   const S=sl.filter(m=>!m.range).sort((a,b)=>a.x-b.x),top=Math.min(...S.map(m=>m.y)),hi=S.filter(m=>m.y===top),lo=S.filter(m=>m.y!==top);
   const solid=dive(lo[0],true),early=dive(lo[2],false),upper=dive(hi[2],true);
   out.gargoyle={solid,early,upper};}
  /* THE DEATH KNIGHT: THE CLEAVE three times - taken (the hero stays under it), with nobody under it, and committed on the hero and
     DODGED with the game's own dodge key. Only the last sticks the blade in the floor. Then a blow on the stuck man through the game's
     own hurtEnemy (so unbHurt's wiring is asked too): open, he takes more */
  {const b=boot('unburied');const A=BK.L.arena;const kill=()=>{for(const e of BK.enemies())if(e!==b&&e.t==='corpse')e.alive=false;};kill();
   const c={P:BK.P,A:{x0:A.x0,x1:A.x1,floor:A.floor},say:()=>{},sound:()=>{}};
   const cleave=how=>{kill();b.mode='stalk';b.open=0;b.cd=99;b.x=(A.x0+A.x1)/2;BK.P.y=A.floor;BK.P.vy=0;BK.P.vx=0;BK.P.x=b.x+(how==='far'?-200:-40);BK.sim(20);b.cd=99;
     BK.unbU.bkForce(b,'cleave',c);let open=0,dodged=false,hurt=null;
     for(let i=0;i<60*4&&b.mode!=='stalk';i++){if(how==='dodge'&&b.committed&&!dodged){dodged=true;BK.keys.left=true;BK.press('dodge');}
       BK.sim(1);BK.keys.left=false;b.cd=99;open=Math.max(open,b.open||0);
       if(how==='dodge'&&b.mode==='stuck'&&hurt===null){const hp0=b.hp;BKT.hurtEnemy(b,10,b.x-20,false);hurt=hp0-b.hp;}}
     if(how==='under'){const hp0=b.hp;BKT.hurtEnemy(b,10,b.x-20,false);hurt=hp0-b.hp;}
     return {mode:b.mode,open:+open.toFixed(1),hurt};};
   out.deathKnight={taken:cleave('under'),far:cleave('far'),dodged:cleave('dodge'),boss:b.t};}
  /* THE BARROW RIDER: a ride left alone, then a ride struck as it passes (the game's own hurtEnemy, so unbHurt's wiring is asked
     too); then, past half, a remount left alone and a remount whose crawling bones are cut twice by the hero's own swings */
  {BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='unburied'));BK.state='play';BK.god=true;
   const M=BK.L.mini,A={x0:M.x0,x1:M.x1,floor:M.floor},c={P:BK.P,A,say:()=>{},sound:()=>{}};BK.tp(Math.round(M.trigger/16)+1,Math.round(M.floor/16)-1);BK.sim(120);const w=BK.enemies().find(e=>e.t==='barrowrider');
   const ride=hit=>{w.mode='stalk';w.mounted=true;w.cd=99;w.x=A.x1-60;BK.P.x=A.x0+120;BK.P.y=A.floor-60;BK.P.vy=0;BK.unbU.brForce(w,'ride',c);w.modeT=0.02;let open=0,struck=false;
     for(let i=0;i<150;i++){BK.P.y=A.floor-60;BK.P.vy=0;if(hit&&!struck&&w.mode==='ride'&&Math.abs(w.x-BK.P.x)<40){struck=true;BKT.hurtEnemy(w,8,BK.P.x,true);}BK.sim(1);w.cd=99;open=Math.max(open,w.open||0);}
     return {mode:w.mode,open:+open.toFixed(1),mounted:w.mounted};};
   const alone=ride(false),struck=ride(true);
   const remount=cut=>{w.mode='stalk';w.phase=2;w.hp=Math.round(w.maxHp*0.4);w.mounted=false;w.footLeft=0;w.cd=0;w.x=(A.x0+A.x1)/2;BK.P.x=w.x-70;BK.P.y=A.floor;BK.P.vy=0;BK.sim(2);
     let open=0,swings=0;for(let i=0;i<60*3&&w.mode!=='scattered';i++){if(cut&&w.mode==='remountTell'&&i%24===0&&Number.isFinite(w.bonesX)){swings++;BK.P.x=w.bonesX-14;BK.P.face=1;BK.P.y=A.floor;BK.press('atk');}BK.sim(1);open=Math.max(open,w.open||0);}
     return {mode:w.mode,open:+open.toFixed(1),mounted:w.mounted,swings};};
   const left=remount(false),cut=remount(true);
   out.rider={alone,struck,left,cut};}
  /* THE WINDCALLER: his howl twice - left to blow (it walks you to the wall and he blinks away) and braced through, the guard key
     held on the ground (his wind fails him and he falls, open): the moor's own lesson, docs/briefs/gale-moor-rework.md §4 */
  {const b=boot('moor');const A=BK.L.arena;for(const e of BK.enemies())if(e!==b&&!e.maxHp)e.alive=false;
   const howl=brace=>{b.mode='howlTell';b.modeT=0.01;b.hits=0;b.howlT=99;b.stoneT=99;b.wallT=99;b.specialT=99;b.braceT=0;BK.P.x=(A.x0+A.x1)/2+60;BK.P.y=A.floor;BK.P.vy=0;BK.P.vx=0;
     let fell=false,moved=0;const x0=BK.P.x;for(let i=0;i<60*3;i++){BK.keys.block=brace;BK.sim(1);moved=Math.max(moved,Math.abs(BK.P.x-x0));if(b.mode==='fallen'){fell=true;break;}if(b.mode==='blink'||b.mode==='appear')break;}
     BK.keys.block=false;const o={mode:b.mode,fell,moved:Math.round(moved),braceT:+(b.braceT||0).toFixed(2)};b.mode='cast';b.modeT=9;BK.sim(5);return o;};
   const left=howl(false),held=howl(true);out.windcaller={left,held};}

  /* THE DUNE WORM: one breach, three ways. The hero stands where it will lock and leaves LATE (after the commit), as a player baits it */
  {const b=boot('caravan');const A=BK.L.arena;const w=BK.caravan().winches.find(q=>q.hollow);
   for(let i=0;i<200&&(b.mode==='wake'||!b.st);i++)BK.sim(1);
   const mid=(w.canopy.x0+w.canopy.x1+1)*8,open=A.x1-90;
   const breach=(x,rolled)=>{w.out=w.k=rolled;w.cd=0;const W=b.st;W.mode='under';W.t=0;W.i=0;W.ripples=[];let tangled=0,left=false,opened=0;
     for(let f=0;f<60*5;f++){BK.P.hp=BK.P.maxHp;if(!left){BK.P.x=x;BK.P.y=A.floor;BK.P.vx=0;}
       if(!left&&W.mode==='rippleTell'&&W.ripples.some(r=>r.real&&r.commit)){left=true;BK.P.x=x+60;}
       BK.sim(1);if(b.mode==='tangled')tangled++;if(BK.bossOpen(b))opened++;if(W.mode==='dive'||W.mode==='surfaced'&&tangled===0&&f>60)break;}
     return {tangled:+(tangled/60).toFixed(1),open:+(opened/60).toFixed(1),awning:w.out,mode:b.mode};};
   out.worm={openSand:breach(open,1),rolledIn:breach(mid,0),rolledOut:breach(mid,1)};}
  /* THE SEXTON (the Falling Tower's mini): his rush over WHOLE planks is only a rush; over a COUNTING plank it breaks it and he is caught in the bell pit */
  {BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='fallingtower'));BK.state='play';BK.god=true;const D=BK.L.bellDeck;BK.tp(43,D.deck+2);BK.sim(120);
   const s=BK.enemies().find(e=>e.alive&&e.t==='sexton');if(!s)return{error:'no sexton',mini:BK.miniActive};const planks=BK.L.crumbles.filter(c=>c.kind==='deck');
   const rush=count=>{for(const c of planks){c.st='whole';c.t=0;}s.mode='stalk';s.cd=99;s.y=BK.L.mini.floor;s.x=24*16;s.face=1;BK.P.x=39*16+8;BK.P.y=D.deck*16-32;BK.sim(2);
     if(count){const c=planks.find(q=>q.x0===27);c.st='count';c.t=2.5;}s.mode='rushTell';s.modeT=0;let pit=0;for(let i=0;i<50;i++){BK.P.x=39*16+8;BK.sim(1);pit=Math.max(pit,s.mode==='pit'?s.open:0);}return{mode:s.mode,open:+pit.toFixed(1)};};
   out.sexton={whole:rush(false),counting:rush(true)};}
  /* THE DIVING BELL: each attack forced and left to finish, then a rack's stone let go over his crown */
  {const b=boot('deep');const alone={};
   for(const m of ['clawTell','ballastTell','pressureTell','scuttleTell']){b.mode=m;b.modeT=0;b.open=0;b.bellMark={x:BK.P.x,y:BK.P.y-10};let op=0;for(let i=0;i<150;i++){BK.P.hp=BK.P.maxHp;BK.sim(1);op=Math.max(op,b.open);}alone[m]=+op.toFixed(1);}
   b.mode='pressure';b.modeT=2;b.vx=0;b.open=0;const st=BK.props().find(p=>p.t==='ballast'&&p.rack);st.held=false;st.x=b.x;st.y=b.y-b.h-30;st.vy=40;let op=0;for(let i=0;i<60;i++){BK.P.hp=BK.P.maxHp;BK.sim(1);op=Math.max(op,b.open);}
   const crowned={open:+op.toFixed(1),spent:!!st.gone};for(let i=0;i<200;i++){BK.P.hp=BK.P.maxHp;BK.sim(1);}crowned.back=!st.gone&&Math.abs(st.x-st.hx)<2;
   out.bell={alone,crowned};}
  /* THE WICKER QUEEN (claude/fair3): lured across the green and turned on as she stands on the embers, the wicker catches and burns open; the same look
     short of them, or her crossing them with nobody looking, opens nothing (the look is the only verb, the embers the only place) */
  {const b=boot('fair');const G=BK.L.green,A=BK.L.arena,mid=G.bonfire*16+8,fl=A.floor;for(const e of BK.enemies())if(e!==b)e.alive=false;
   const run=turnAt=>{b.mode='still';b.x=mid+110;b.bank=0;b.open=0;b.lashCd=99;b.crownCd=99;b.floorCd=99;b.throwCd=99;b.tossCd=99;b.sweepCd=99;b.leapCd=99;b.thrustCd=99;b.rest=0;let turned=false,op=0;for(let i=0;i<60*6;i++){if(!turned&&turnAt(b))turned=true;BK.P.x=mid-160;BK.P.y=fl;BK.P.vx=0;BK.P.face=turned?1:-1;BK.sim(1);op=Math.max(op,b.open||0);if(b.mode==='burn'||b.mode==='sickleTell')break;}return{mode:b.mode,open:+op.toFixed(1)};};
   out.wicker={short:run(q=>q.x<mid+70),unseen:run(()=>false),embers:run(q=>q.x<mid+20)};}
  /* THE PUPPETEER (claude/puppeteer): left alone a minute his puppets wind up and strike and nothing opens him; both cut down by the hero's swings in their
     windups, he comes down his line and kneels re-stringing them - open (on the Maskwright's Theatre's main stage) */
  {const b=boot('theatre');const S=BK.puppeteerHands().show(),A=BK.L.arena,P=BK.P;let alone=0;
   for(let i=0;i<60*60;i++){P.hp=P.maxHp;P.x=A.x0+60;P.vx=0;BK.sim(1);alone=Math.max(alone,b.open||0);}
   let cutF=0,op=0,mode=null;for(let i=0;i<60*40&&!(op>0);i++){P.hp=P.maxHp;const p=S.puppets.find(q=>q.alive&&q.mode!=='heap'&&/Tell$/.test(q.mode));
     if(p&&P.atk<0){P.x=p.x-(p.t==='harlequin'?14:18);P.face=1;P.vx=0;BK.press('atk');cutF++;}BK.sim(1);op=Math.max(op,b.open||0);if(b.mode==='downed')mode='downed';}
   out.puppeteer={alone:+alone.toFixed(1),swings:cutF,mode,open:+op.toFixed(1),onStage:b.mode==='downed'&&b.y===A.floor||mode==='downed'};}
  /* JENNY GREENTEETH (claude/lockkeeper): a minute of her left alone in her lock, the hero on a gate's walkway, opens nothing; a real swing at the
     lower paddle with her at that gate drains the lock from under her - stranded, open (THE FOG CANAL holds her) */
  {const b=boot('canal');const S=BK.greenteethHands().show(),G=S.A,P=BK.P;let alone=0;
   for(let i=0;i<60*60;i++){P.hp=P.maxHp;P.x=G.W.stand;P.y=G.walk;P.vy=0;BK.sim(1);alone=Math.max(alone,b.open||0);}
   let op=0,mode=null;for(let i=0;i<60*6&&!(op>0);i++){P.hp=P.maxHp;P.x=G.E.paddle.x-14;P.y=G.walk;P.vy=0;P.face=1;b.x=Math.min(b.x,G.E.face-90);if(!S.pad.E.open&&!(S.pad.E.cd>0)&&P.atk<0)BK.press('atk');BK.sim(1);op=Math.max(op,b.open||0);if(b.mode==='stranded')mode='stranded';}
   out.greenteeth={alone:+alone.toFixed(1),mode,open:+op.toFixed(1),drains:S.n.drain};}
  /* THE CISTERN QUEEN (claude/welltown3): a minute of her left alone opens nothing; a pour while she walks the floor runs into the sand; a pour on her
     mound floods her burrow - SOAKED, open; on her wall, a pour from that wall's ledge - ON HER BACK, open; in the flood, her claw struck as it comes -
     the grab broken, REARING, open (THE WELL TOWN holds her) */
  {const b=boot('welltown');const QH=BK.cisternQueenHands(),S=QH.show(),G=S.G,P=BK.P;let alone=0;
   for(let i=0;i<60*60;i++){P.hp=P.maxHp;P.x=G.x0+30;P.vx=0;BK.sim(1);alone=Math.max(alone,b.open||0);}
   let dry=0;for(let i=0;i<60*20&&b.mode!=='walk';i++){P.hp=P.maxHp;BK.sim(1);}P.skin.sips=3;P.x=b.x-60;P.face=1;BK.press('talk');for(let i=0;i<30;i++){P.hp=P.maxHp;BK.sim(1);dry=Math.max(dry,b.open||0);}const drySips=P.skin.sips;
   const op={};const take=(how,setup,act)=>{let o=0;for(let i=0;i<60*60&&!(o>0);i++){P.hp=P.maxHp;if(setup())act();BK.sim(1);if(b.mode===how)o=Math.max(o,b.open||0);}
     let peak=o;for(let i=0;i<60*4&&b.mode===how;i++){P.hp=P.maxHp;BK.sim(1);}op[how]=+peak.toFixed(1);};
   take('soaked',()=>S.pose==='burrow'&&S.mound&&b.mode==='burrow',()=>{P.skin.sips=3;P.x=S.mound.x-30;P.y=G.floor;P.vy=0;P.face=1;BK.press('talk');});
   b.hp=Math.round(b.maxHp*0.6);
   take('fallen',()=>S.pose==='wall'&&b.mode==='cling',()=>{P.skin.sips=3;P.x=S.wall==='W'?G.ledgeW[0]+30:G.ledgeE[1]-30;P.y=G.ledgeY;P.vy=0;P.ground=true;P.face=S.wall==='W'?-1:1;BK.press('talk');});
   b.hp=Math.round(b.maxHp*0.3);
   take('rear',()=>b.mode==='grab'&&S.claw,()=>{P.x=S.claw.x-(b.face>0?16:-16);P.y=G.floor;P.face=b.face>0?1:-1;if(P.atk<0)BK.press('atk');});
   out.cisternqueen={alone:+alone.toFixed(1),dry:+dry.toFixed(1),drySips,open:op,n:{soaked:S.n.soaked,fallen:S.n.fallen,rear:S.n.rear,countered:S.n.countered}};}
  /* THE GANG LEADER (claude/welltown3, a mini): a minute of him left alone (his bottles land and burn) opens nothing; his bottle struck back sets him
     alight - open; and one burning takes no more than a third of him (Daniel's mini rule) */
  {BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='welltown'));BK.state='play';BK.god=true;const M=BK.L.mini,P=BK.P;
   for(const e of BK.enemies())if(e.t!=='gangleader')e.alive=false;BK.tp(Math.round(M.trigger/16)+1,Math.round(M.floor/16)-1);BK.sim(120);
   const b=BK.enemies().find(e=>e.t==='gangleader'),F=BK.gangLeaderHands().fight();let alone=0;
   for(let i=0;i<60*60;i++){P.hp=P.maxHp;P.x=M.x0+30;P.vx=0;BK.sim(1);alone=Math.max(alone,b.open||0);}
   let o=0;for(let i=0;i<60*60&&!(o>0);i++){P.hp=P.maxHp;const bt=F.bottles.find(q=>!q.back);if(bt&&P.atk<0){P.x=bt.x-14;P.y=Math.min(M.floor,bt.y+12);P.face=1;BK.press('atk');}BK.sim(1);o=Math.max(o,b.open||0);}
   const hp0=b.hp,cap=b.maxHp*(await import('/src/gang-leader.js')).GL.capK;for(let k=0;k<12&&b.mode==='burning';k++){BKT.hurtAs('light',b,60,b.x-10,false);BK.sim(2);}const took=hp0-b.hp;
   out.gangleader={alone:+alone.toFixed(1),open:+o.toFixed(1),reflects:F.n.reflects,took:Math.round(took),cap:Math.round(cap)};}
  return out;})()`, 300000);

  assert.notEqual(r.buried.alone, 'stuck', 'the slam alone must not open him');
  assert.equal(r.buried.mode, 'stuck', 'slamming onto his own broken ground must bury his arm');
  assert.ok(r.buried.open > 3, 'the arm in the ground is the long window: ' + r.buried.open);
  assert.ok(!(r.buriedGas.rest.open > 0), 'his rest after a blow opened him on his own timer (A11): ' + JSON.stringify(r.buriedGas));
  assert.equal(r.buriedGas.coldOpen, 0, 'a cold vent under him opened him: ' + JSON.stringify(r.buriedGas));
  assert.equal(r.buriedGas.mode, 'scorched', 'a burning vent under him did not scorch him: ' + JSON.stringify(r.buriedGas));
  assert.ok(r.buriedGas.open >= 3, 'scorched is a window: ' + JSON.stringify(r.buriedGas));

  assert.ok(r.warden.unguarded < 2.1, 'an anchor nobody turned is only his own rest: ' + r.warden.unguarded);
  assert.ok(r.warden.guarded > 3, 'turning the anchor must tear it loose: ' + r.warden.guarded);


  assert.ok(r.mage.laid, 'the death mark must be laid');
  assert.ok(r.mage.landed.hurt, 'left on it, the mark must land: ' + JSON.stringify(r.mage.landed));
  assert.notEqual(r.mage.landed.mode, 'gather', 'a mark that lands opens nothing: ' + JSON.stringify(r.mage.landed));
  assert.equal(r.mage.mode, 'gather', 'flown out of, the mark must come back on him');
  assert.ok(r.mage.open > 2, 'the gathering is the window: ' + r.mage.open);

  assert.equal(r.pyro.alone.open, 0, 'left alone while hot, he vents and opens nothing: ' + JSON.stringify(r.pyro.alone));
  assert.equal(r.pyro.mode, 'overheat', 'struck while hot, he overheats: ' + JSON.stringify(r.pyro));
  assert.ok(r.pyro.open > 2, 'the overheat is the window: ' + r.pyro.open);

  assert.notEqual(r.graveWarden.solid.mode, 'kneel', 'a dig that misses on solid floor opens nothing: ' + JSON.stringify(r.graveWarden));
  assert.equal(r.graveWarden.grave.mode, 'kneel', 'a dig into an open grave puts him on his knees: ' + JSON.stringify(r.graveWarden));
  assert.ok(r.graveWarden.grave.open > 2, 'the kneel is the window: ' + JSON.stringify(r.graveWarden));
  assert.equal(r.hedgeWarden.lawn.mode, 'felled', 'a blow through his root fells him: ' + JSON.stringify(r.hedgeWarden));
  assert.equal(r.hedgeWarden.lawn.open, 0, 'felled on the open lawn, the stump is not open: ' + JSON.stringify(r.hedgeWarden));
  /* (claude/hedgewarden3, Daniel's playtest 2026-09-28: "the stump took no damage and REGREW, so it looked like the boss heals for no
     reason". This used to assert a stump left alone grows him back WHOLE; the rule now is that damage done stays done) */
  assert.ok(!['felled', 'stump'].includes(r.hedgeWarden.grew.mode) && r.hedgeWarden.grew.hp === r.hedgeWarden.lawn.left && r.hedgeWarden.grew.hp < r.hedgeWarden.grew.full, 'a stump left alone stands him up again, and the bar does not go up - no health grows back: ' + JSON.stringify(r.hedgeWarden));
  assert.equal(r.hedgeWarden.lawn.hint, 'GREEN WOOD: DRIVE HIM TO THE FIRE', 'felled on the open lawn, the hint says what to do: ' + JSON.stringify(r.hedgeWarden.lawn));
  assert.ok(r.hedgeWarden.lawn.hints[1] === 'GREEN WOOD: DRIVE HIM TO THE FIRE' && !r.hedgeWarden.lawn.hints[2] && !r.hedgeWarden.lawn.hints[3] && r.hedgeWarden.lawn.hintCount === 2, 'the green-wood hint shows at most twice per save: ' + JSON.stringify(r.hedgeWarden.lawn));
  assert.ok(r.hedgeWarden.lawn.smoke > 0, 'a blow on a green stump puffs smoke off it: ' + JSON.stringify(r.hedgeWarden.lawn));
  assert.ok(r.hedgeWarden.lawn.upCall > 0 && r.hedgeWarden.grew.call > 0 && r.hedgeWarden.lawn.call === 0, 'his braziers glow and pulse while he is up (and not while he is a stump): ' + JSON.stringify(r.hedgeWarden));
  assert.ok(r.hedgeWarden.grew.upBite >= 5 && r.hedgeWarden.grew.upBite <= 10 && !['felled', 'stump'].includes(r.hedgeWarden.grew.upMode), 'up again on his green root, a blow on the open lawn chips a quarter and does not fell him: ' + JSON.stringify(r.hedgeWarden.grew));
  assert.ok(r.hedgeWarden.grew.atFire.mode === 'felled' && r.hedgeWarden.grew.atFire.open > 2 && r.hedgeWarden.grew.atFire.hp <= r.hedgeWarden.grew.atFire.was, 'and the same blow beside a brazier fells him there, and the fire takes the stump: ' + JSON.stringify(r.hedgeWarden.grew));
  assert.ok(r.gargoyle.solid.mode === 'stunned' && r.gargoyle.solid.open > 2 && r.gargoyle.solid.broken, 'left late, a low slab breaks under him and he lies stunned on the spikes, open: ' + JSON.stringify(r.gargoyle));
  assert.ok(!r.gargoyle.early.aim && !r.gargoyle.early.broken && r.gargoyle.early.open === 0, 'leaving a slab early only moves his aim: ' + JSON.stringify(r.gargoyle));
  assert.ok(r.gargoyle.upper.mode === 'stunned' && r.gargoyle.upper.open > 2 && r.gargoyle.upper.broken, 'left late, a high slab breaks under him too and he lies stunned on the spikes, open: ' + JSON.stringify(r.gargoyle));
  assert.ok(r.hedgeWarden.fire.open > 2, 'felled beside a brazier, the stump burns open: ' + JSON.stringify(r.hedgeWarden));
  assert.ok(r.hedgeWarden.burning.mode === 'stump' && r.hedgeWarden.burning.open > 0, 'a burning stump does not regrow: ' + JSON.stringify(r.hedgeWarden));
  assert.ok(r.hedgeWarden.lawn.bite >= 5 && r.hedgeWarden.lawn.bite <= 10 && r.hedgeWarden.burning.bite >= 50, 'THE BRAZIER IS THE BIG OPENING (claude/hedgewarden3; it was the only one, claude/hedgewarden2): a stump on the open lawn is green wood a blow only chips, a quarter; a burning one takes a blow twice over: ' + JSON.stringify(r.hedgeWarden));

  assert.equal(r.deathKnight.boss, 'bloodknight', 'the Unburied Field ends in THE DEATH KNIGHT: ' + JSON.stringify(r.deathKnight));
  assert.equal(r.deathKnight.taken.open, 0, 'A11: a Cleave taken sticks nothing: ' + JSON.stringify(r.deathKnight));
  assert.equal(r.deathKnight.far.open, 0, 'A11: a Cleave nobody was under sticks nothing: ' + JSON.stringify(r.deathKnight));
  assert.ok(r.deathKnight.dodged.open >= 1.3, 'A11: a Cleave committed on you and dodged sticks the blade, and he is open ~1.5 s (UNB.bk.stuckT; it was 2 s until claude/weakboss - Daniel: "a bit too easy"): ' + JSON.stringify(r.deathKnight));
  assert.ok(r.deathKnight.dodged.hurt > r.deathKnight.taken.hurt, 'stuck, a blow takes more: ' + JSON.stringify(r.deathKnight));
  assert.equal(r.rider.alone.open, 0, 'a ride-through left alone opens nothing: ' + JSON.stringify(r.rider));
  assert.ok(r.rider.alone.mounted, 'and leaves him in the saddle: ' + JSON.stringify(r.rider));
  assert.ok(r.rider.struck.open > 3, 'struck as he rides through, he is out of the saddle and open: ' + JSON.stringify(r.rider));
  assert.equal(r.rider.left.open, 0, 'a remount left alone opens nothing: ' + JSON.stringify(r.rider));
  assert.ok(r.rider.left.mounted, 'and puts him back in the saddle: ' + JSON.stringify(r.rider));
  assert.equal(r.rider.cut.mode, 'scattered', 'the crawling bones cut by the hero\'s swings scatter: ' + JSON.stringify(r.rider));
  assert.ok(r.rider.cut.open > 3, 'and he is open on foot: ' + JSON.stringify(r.rider));
  assert.ok(!r.windcaller.left.fell, 'A11: a howl left to blow opens nothing: ' + JSON.stringify(r.windcaller));
  assert.ok(r.windcaller.left.moved > 40, 'and it walks an unbraced hero across the room: ' + JSON.stringify(r.windcaller));
  assert.ok(r.windcaller.held.fell, 'A11: braced through his howl, his own wind fails him and he falls, open: ' + JSON.stringify(r.windcaller));
  assert.equal(r.worm.openSand.tangled, 0, 'THE DUNE WORM: a breach in the open sand opens nothing: ' + JSON.stringify(r.worm));
  assert.equal(r.worm.rolledIn.tangled, 0, 'a breach under his awning ROLLED IN opens nothing: ' + JSON.stringify(r.worm));
  assert.ok(r.worm.rolledOut.tangled >= 2.4 && r.worm.rolledOut.open >= 2.4, 'a breach under the awning rolled OUT comes up into it: tangled and open, the window: ' + JSON.stringify(r.worm));
  assert.equal(r.worm.rolledOut.awning, 0, 'and the awning comes down onto him: it has to be wound out again: ' + JSON.stringify(r.worm));
  assert.equal(r.sexton.whole.open, 0, 'THE SEXTON: a rush over whole planks opens nothing: ' + JSON.stringify(r.sexton));
  assert.ok(r.sexton.counting.open > 2, 'a rush over a counting plank breaks it and he is caught in the bell pit, open: ' + JSON.stringify(r.sexton));
  for (const [m, op] of Object.entries(r.bell.alone)) assert.equal(op, 0, 'A11: THE DIVING BELL left alone through ' + m + ' keeps his shell shut: ' + JSON.stringify(r.bell));
  assert.ok(r.bell.crowned.open > 2, 'a stone let go over his crown vents him, open: ' + JSON.stringify(r.bell));
  assert.ok(r.bell.crowned.spent && r.bell.crowned.back, 'the rack\'s stone splits on his valve and the rack sets it back (A12): ' + JSON.stringify(r.bell));
  assert.ok(r.wicker.short.open === 0 && r.wicker.short.mode !== 'burn', 'THE WICKER QUEEN: frozen short of the embers she opened: ' + JSON.stringify(r.wicker));
  assert.ok(r.wicker.unseen.open === 0 && r.wicker.unseen.mode !== 'burn', 'crossing the embers with nobody looking opened her: ' + JSON.stringify(r.wicker));
  assert.ok(r.wicker.embers.mode === 'burn' && r.wicker.embers.open >= 3, 'frozen ON the embers she did not burn open for 3 s or more (the boss rule; claude/fairfix3 tightened this from > 2): ' + JSON.stringify(r.wicker));
  assert.equal(r.greenteeth.alone, 0, 'JENNY GREENTEETH: a minute of her left alone opened her: ' + JSON.stringify(r.greenteeth));
  assert.ok(r.greenteeth.mode === 'stranded' && r.greenteeth.open >= 3, 'the lock drained with her at the gate and she was not stranded open for 3 s or more (the boss rule; claude/greenwire raised this from 1.4: her stranded window was 1.8 s): ' + JSON.stringify(r.greenteeth));
  assert.equal(r.puppeteer.alone, 0, 'THE PUPPETEER: a minute of his puppets left alone opened him: ' + JSON.stringify(r.puppeteer));
  assert.ok(r.puppeteer.mode === 'downed' && r.puppeteer.open >= 3 && r.puppeteer.onStage,   /* (PUPPETEER3: drop both puppets - blows or cuts - and he is dragged down to the boards, open) */ 'both puppets cut down in their windups and he did not come down open: ' + JSON.stringify(r.puppeteer));
  assert.equal(r.cisternqueen.alone, 0, 'THE CISTERN QUEEN: a minute of her left alone opened her: ' + JSON.stringify(r.cisternqueen));
  assert.ok(r.cisternqueen.dry === 0 && r.cisternqueen.drySips === 3, 'E at her on the open floor opened her (or spent a sip on nothing: the HUD never says POUR there): ' + JSON.stringify(r.cisternqueen));
  assert.ok(r.cisternqueen.open.soaked >= 3 && r.cisternqueen.open.fallen >= 3 && r.cisternqueen.open.rear >= 3, 'her three openings (her burrow flooded, a pour down her wall, a grab broken) are not each 3 s or more (the boss rule): ' + JSON.stringify(r.cisternqueen));
  assert.equal(r.gangleader.alone, 0, 'THE GANG LEADER: a minute of him left alone opened him: ' + JSON.stringify(r.gangleader));
  assert.ok(r.gangleader.open >= 3 && r.gangleader.reflects >= 1, 'his bottle struck back did not set him alight for 3 s or more: ' + JSON.stringify(r.gangleader));
  assert.ok(r.gangleader.took <= r.gangleader.cap + 1 && r.gangleader.took >= r.gangleader.cap * 0.6, 'one burning took more than his cap (GL.capK, inside the third Daniel allows) or nothing like it: ' + JSON.stringify(r.gangleader));
  assert.deepEqual(pg.errors, []);
  console.log(JSON.stringify(r));
} finally { pg.close(); }
