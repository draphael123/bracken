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

console.log('Enraged oath sweep and three-column radiance: told unblockable attacks, jump/position counters and 1.6-second openings.');
