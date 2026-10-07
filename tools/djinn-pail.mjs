// tools/djinn-pail.mjs - THE DJINN's PAIL, IN THE PAGE, FOR EVERY HERO (claude/djinn4, Daniel 10-05 picked SCOOP + THROW). src/djinn.js holds the rule
// (tools/djinn.mjs proves it in Node); this proves the wiring with each hero the game has, in THE WELL TOWN's hall, in the flood:
//   THE PAIL COMES   the flood brings a pail to the hero (told: A PAIL FLOATS UP: E SCOOPS THE FLOOD)
//   E SCOOPS         E in the water fills it at once (a step off the windlass, where E still winds the great bucket)
//   E THROWS         he REARS UP (the hand slam's windup): E throws it into his core - he CHOKES, open (OPEN_RULE agrees), the throw takes his chokeHit,
//                    the slam never lands
//   A STRIKE THROWS  the same with ATTACK, for every hero whose blow is a blade (a hero whose attack makes no blade box - a caster - throws with E, as he
//                    winds the windlass with E: listed, not failed)
//   NOT REARING      (claude/djinn5, Daniel 10-06 "another way to hit him in the water") E throws it while he is UP and not rearing: he REELS -
//                    a short told stagger (open reelT s), the throw takes his reelHit. (djinn4: it splashed off - a design change, asserted to the new design)
//   PORT=8641 node tools/djinn-pail.mjs
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';

const HEROES = (process.env.HEROES || 'knight,warden,pyro,paladin,pirate,reaper,geomancer').split(',');
const pg = await openPage({ audio: false, fonts: false });
let rows;
try {
  rows = await pg.evalp(`(async()=>{
  const {LEVELS}=await import('/src/level.js');const DJG=await import('/src/djinn.js');BK.manualSimulation=true;BK.SET.speed=1;const out=[];
  for(const hero of ${JSON.stringify(HEROES)}){
    BK.setHero(hero);BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='welltown'));BK.state='play';BK.god=true;
    const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);BK.sim(150);const b=BK.boss,DH=BK.djinnHands(),S=DH.show(),G=S.G,P=BK.P;
    b.hp=Math.round(b.maxHp*0.3);let i=0;for(;i<60*30&&!(S.ph===3&&S.flood&&S.pailsGiven&&b.mode!=='rise');i++){P.hp=P.maxHp;P.x=G.windlass+60;P.vx=0;BK.sim(1);}
    const r={hero,given:!!P.djPail,full0:!!(P.djPail&&P.djPail.full)};
    const still=()=>{P.hp=P.maxHp;P.x=G.windlass+60;P.y=G.floor;P.vx=0;P.vy=0;P.ground=true;P.atk=-1;P.climb=false;P.snare=0;S.tide={st:'low',t:60};S.water=DJG.DJ.waterH;};
    const calm=()=>{b.open=0;b.mode='hover';b.modeT=5;S.ward=0;S.marks=[];S.hand=null;S.held=null;S.pails=[];};
    const scoop=()=>{still();calm();if(P.djPail&&P.djPail.full){P.djPail.full=false;P.djPail.refill=0;}BK.sim(14);still();BK.press('talk');BK.sim(1);return !!(P.djPail&&P.djPail.full);};
    const refill=()=>{still();calm();P.djPail.full=true;BK.press('talk');BK.sim(1);let k=1;const e0=!P.djPail.full;for(;k<120&&!P.djPail.full;k++){still();calm();BK.sim(1);}return {emptied:e0,full:!!P.djPail.full,t:+(k/60).toFixed(2)};};
    const rear=()=>{still();calm();b.x=P.x+80;P.face=1;S.act++;S.cur={k:'slam',id:S.act,x:P.x,y:G.floor};S.marks=[{x:P.x,y:G.floor,t:0.9,k:'slam',key:'slT'+S.act}];b.mode='slamTell';b.modeT=0.9;b.face=-1;};
    const after=(n)=>{const hp0=b.hp;let choked=0,reel=0,slam=0,h0=P.hp;for(let k=0;k<n;k++){P.hp=Math.max(P.hp,P.maxHp*0.5);const hh=P.hp;BK.sim(1);if(P.hp<hh)slam+=(hh-P.hp);if(b.mode==='choked')choked=Math.max(choked,b.open);if(b.mode==='reel')reel=Math.max(reel,b.open);}return {choked:+choked.toFixed(2),reel:+reel.toFixed(2),took:hp0-b.hp,slam};};
    const hold=()=>{for(let k=0;k<24;k++){still();BK.sim(1);}};
    /* E */
    r.refill=refill();r.refillT=DJG.DJ.pailRefill;
    hold();r.scoopE=scoop();rear();BK.sim(18);BK.press('talk');const e1=after(40);r.throwE=e1;r.openRule=BK.bossOpen?!!BK.bossOpen(b):null;
    /* a strike */
    hold();calm();r.scoop2=scoop();rear();BK.sim(18);P.face=1;BK.press('atk');const e2=after(40);r.throwAtk=e2;
    /* not rearing */
    hold();calm();r.scoop3=scoop();still();calm();b.x=P.x+80;b.mode='hover';b.modeT=5;BK.press('talk');const e3=after(40);r.notRear=e3;r.n={chokes:S.n.chokes||0,reels:S.n.reels||0,splashed:S.n.splashed||0,throws:S.n.throws||0,byStrike:S.n.byStrike||0};
    r.chokeHit=Math.floor(b.maxHp*DJG.DJ.chokeHit);r.reelHit=Math.floor(b.maxHp*DJG.DJ.reelHit);r.reelT=DJG.DJ.reelT;out.push(r);}
  return out;})()`, 600000);
} finally { pg.close(); }
if (process.env.DUMP) console.log(JSON.stringify(rows));
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; console.log('  ok  ' + m); };
const strikeless = [];
for (const r of rows) {
  ok(r.given && r.full0, r.hero + ': the flood brings him a FULL pail (claude/djinn6: was empty - no scoop needed now)');
  ok(r.refill.emptied && r.refill.full && r.refill.t <= r.refillT + 0.1, r.hero + ': thrown, it FILLS ITSELF again ' + r.refill.t + ' s later, wherever he stands');
  ok(r.scoopE && r.scoop2 && r.scoop3, r.hero + ': E in the water scoops it full, at once');
  ok(r.throwE.choked >= 1.8 && r.throwE.took >= r.chokeHit && r.throwE.slam === 0, r.hero + ': he rears up - E throws the pail into his core: he CHOKES (' + r.throwE.choked + ' s open, ' + r.throwE.took.toFixed(1) + ' hp off him, the slam never lands)');
  if (r.throwAtk.choked >= 1.8) ok(r.throwAtk.took >= r.chokeHit && r.throwAtk.slam === 0, r.hero + ': ... and a STRIKE throws it the same (' + r.throwAtk.choked + ' s)'); else strikeless.push(r.hero);
  ok(r.notRear.choked === 0 && r.notRear.reel >= r.reelT - 0.1 && r.notRear.took >= r.reelHit && r.n.reels >= 1, r.hero + ': thrown when he is up and not rearing, he REELS (' + r.notRear.reel + ' s open, ' + r.notRear.took.toFixed(1) + ' hp off him) - not a choke');
}
ok(strikeless.every(h => h === 'pyro' || h === 'geomancer'), 'a strike throws the pail for every blade hero; ' + (strikeless.length ? strikeless.join(', ') + ' (no blade box) throw' + (strikeless.length > 1 ? '' : 's') + ' with E, as with the windlass' : 'every hero'));
console.log('djinn-pail: ' + n + ' checks pass (' + rows.map(r => r.hero + ' E ' + r.throwE.choked + 's / strike ' + r.throwAtk.choked + 's').join(', ') + ')');
