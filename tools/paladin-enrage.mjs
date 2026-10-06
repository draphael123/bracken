import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const s=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8'),noop=()=>{},hits=[];
const c=vm.createContext({L:{arena:{x0:0,x1:640,floor:320}},P:{x:330,y:320,dead:false},PAL:{open:2,gap:[1,1]},PAL_BEAT:.15,DMG:{palOath:26,palRadiance:22},SFX:new Proxy({},{get:()=>noop}),number:noop,shakeCam:noop,ringAt:noop,burst:noop,hitstop:noop,zoomKick:noop,dust:noop,motes:noop,bolts:[],moveBody:()=>({ground:true}),damagePlayer:(x,d,o)=>{hits.push({x,d,o});return 'hit';}});
vm.runInContext(s.slice(s.indexOf('function updateClosedHelm('),s.indexOf('function drawPaladinMarks(')),c);
const enemy=()=>({x:300,y:320,vx:0,vy:0,h:50,face:1,alive:true,phase:2,told2:1,mode:'stalk',modeT:0,hitT:0,cutT:20,thrustT:20,bashT:20,judgeT:20,oathT:20,radianceT:20});
for(const [timer,mode] of [['oathT','oathTell'],['radianceT','radianceTell']]){
 const e=enemy();e[timer]=0;c.updateClosedHelm(e,.02);assert.equal(e.mode,mode);assert(e.modeT>=.9);
 e.modeT=0;hits.length=0;c.updateClosedHelm(e,.02);assert.equal(e.mode,'oathRecover');assert.equal(e.open,1.6);assert(hits.length);assert(hits.every(h=>h.o.unblockable));
 const quiet=enemy();quiet.phase=1;quiet[timer]=0;c.updateClosedHelm(quiet,.02);assert.equal(quiet.mode,'stalk','new attacks require enrage');
}
const leap=enemy();leap.mode='oathTell';leap.modeT=0;c.P.y=280;hits.length=0;c.updateClosedHelm(leap,.02);assert.equal(hits.length,0,'jumping clears the low oath sweep');
const sidestep=enemy();sidestep.mode='radianceTell';sidestep.modeT=0;sidestep.marks=[100,164,228];c.P.x=400;c.P.y=320;hits.length=0;c.updateClosedHelm(sidestep,.02);assert.equal(hits.length,0,'fixed radiance columns leave safe gaps');
/* THE CHARGE, SLOWED (2026-09-23). Daniel: "I'd like his charge attack to be a lot slower as well to give you time to
   dodge it since it's unblockable." These are read out of main.js rather than re-declared, so the numbers here are the
   ones the game runs on. */
const src=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const PB=JSON.parse('{'+src.match(/const PAL_BASH = \{([^}]*)\}/)[1].replace(/([a-z0-9]+):/gi,'"$1":').trim()+'}');
const TELL=src.match(/bash: \[([0-9.]+), ([0-9.]+)\]/).slice(1).map(Number);
const DIST=170;   /* bashX1 is set e.x + face*170 */
assert.ok(PB.speed <= 160, 'the charge is back up to '+PB.speed+'px/s: it was slowed from 220 because it cannot be blocked');
assert.ok(TELL[0] >= 1.5, 'the charge tell is back down to '+TELL[0]+'s: it was lengthened from 1.2');
/* THE TRAP, pinned: the charge ends at bashX1 OR when its clock runs out, so a slower charge with the old 0.9s clock
   stops short every time and silently becomes a shuffle. Both phases must still cross. */
for (const [name, sp] of [['phase one', PB.speed], ['phase two', PB.speed2]]) {
  const t = DIST / sp;
  assert.ok(t < PB.run, name + ': the charge needs ' + t.toFixed(2) + 's to cross ' + DIST + 'px but is only allowed ' + PB.run + 's, so he stops ' + Math.round(DIST - sp * PB.run) + 'px short'); }
assert.ok(PB.speed2 >= PB.speed, 'enraged is no faster than calm');
console.log('  the charge: ' + PB.speed + 'px/s behind a ' + TELL[0] + 's tell (was 220 behind 1.2), ' + (DIST/PB.speed).toFixed(2) + 's to cross, ' + PB.run + 's allowed');

/* THE LEAP (claude/sweep2 gap-closer, Daniel 10-06: range is no longer a free win). Stood off past PAL_LEAP.far for PAL_LEAP.linger s,
   he leaps: a told !! (HE LEAPS), a red ring that follows you and then stops, an unblockable landing on it, and - landed on nobody - the
   ward down beside you (B2), then risen again (B3). The numbers are main.js's own (the slice above defines PAL_LEAP). */
{ const said=[];c.number=(x,y,t)=>said.push(t);c.streaks=noop;c.thud=noop;
  const LP=c.PAL_LEAP||vm.runInContext('PAL_LEAP',c);
  const far=enemy();far.phase=1;far.leapT=0;c.P.x=far.x+LP.far+90;c.P.y=320;let n=0;
  while(far.mode==='stalk'&&n<200){c.updateClosedHelm(far,.02);n++;}
  assert.equal(far.mode,'leapTell','stood off, he leaps');assert(n*.02>=LP.linger[0]-.03,'not before you have lingered ('+(n*.02).toFixed(2)+' s)');
  assert(said.includes('!!')&&said.includes('HE LEAPS: GET OFF THE RING'),'told with the red mark and a word: '+said.join(','));
  c.P.x-=40;c.updateClosedHelm(far,.02);assert.equal(far.leapX,c.P.x,'the ring follows you through the tell');
  far.modeT=LP.fix-.05;const fixedAt=far.leapX;c.P.x-=60;c.updateClosedHelm(far,.02);assert.equal(far.leapX,fixedAt,'and stops before he goes');
  far.modeT=0;c.updateClosedHelm(far,.02);assert.equal(far.mode,'leap');assert(Math.sign(far.vx)===Math.sign(fixedAt-far.x),'he goes for the ring');
  hits.length=0;n=0;while(far.mode==='leap'&&n<100){c.updateClosedHelm(far,.02);n++;}
  assert.equal(far.mode,'leapLand');assert.equal(hits.length,0,'off the ring: nothing lands on you');
  assert(far.open>=LP.rec-.03,'he whiffed it: the ward is down ('+far.open+')');assert(said.includes('HE OVERREACHED: STRIKE'));
  n=0;while(far.mode==='leapLand'&&n<200){c.updateClosedHelm(far,.02);n++;}assert.equal(far.mode,'reward','the ward rises after it (B3)');
  const on=enemy();on.phase=1;on.mode='leapTell';on.modeT=0;on.leapX=on.x+120;c.P.x=on.leapX;c.P.y=320;c.updateClosedHelm(on,.02);
  hits.length=0;n=0;while(on.mode==='leap'&&n<100){c.P.x=on.x;c.updateClosedHelm(on,.02);n++;}
  assert.equal(hits.length,1,'on the ring when he lands: struck');assert(hits[0].o.unblockable,'and no shield turns it');
  assert(!(on.open>0),'landed on you, he is not open');
  const close=enemy();close.phase=1;close.leapT=0;c.P.x=close.x+40;n=0;while(close.mode==='stalk'&&n<150){c.updateClosedHelm(close,.02);n++;}
  assert.notEqual(close.mode,'leapTell','in his sword reach he does not leap');
  console.log('  the leap: after '+LP.linger[0]+' s past '+LP.far+' px, a '+LP.tell[0]+' s tell (the ring stops '+LP.fix+' s before), '+LP.rec+' s open on a whiff'); }
console.log('Enraged oath sweep and three-column radiance: told unblockable attacks, jump/position counters and 1.6-second openings.');
