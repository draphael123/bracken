/* tools/survival.mjs - SURVIVAL (claude/survival, Daniel's decisions 2026-10-07 after scratch/audit-healing.md: OPTION A + design-standard A10 amended).
 *
 * WHAT IT HOLDS (each fails on the code before it):
 *   1. HAZARDS ARE A SHARE OF THE BAR. Spikes and deep water in a wood that says L.waterHurts cost SV.HAZARD.pct of max health (25-30%), the
 *      same with plate, ringmail and the iron charm on (the % path skips the difficulty/tier/armour chain), and hand the hero back to the
 *      last safe footing (P.safe) - spikes too, which used to knock him up and leave him in the bed. Safe footing is never beside spikes.
 *   2. THE EXAM KILLS, AND SAYS SO. In an exam span (L.examSpans) spikes are a real death (THE SPIKES on the card), and walking into the
 *      span says it (SV.LINES.exam). NEVER UNTOLD: every span with spikes in it has hurt spikes earlier in its wood (SV.untoldExams), every wood.
 */
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';
import * as SV from '../src/survival.js';
import { openPage } from './cdp.mjs';

/* ---------- node: the rules and the lint ---------- */
assert.ok(SV.HAZARD.pct >= 0.25 && SV.HAZARD.pct <= 0.3, 'a hazard costs 25-30% of the bar (Daniel 10-07)');
let spans = 0;
for (const lv of LEVELS) { const L = lv.build(); spans += (L.examSpans || []).length;
  for (const s of L.examSpans || []) assert.ok(Array.isArray(s) && s[0] <= s[1] && s[1] < L.W, lv.id + ': an exam span is [x0, x1] in its columns: ' + JSON.stringify(s));
  assert.deepEqual(SV.untoldExams(L, T.SPIKE), [], lv.id + ': an exam\'s spikes kill with no hurt spikes before it to teach them (an UNTOLD death)'); }
assert.ok(spans >= 1, 'no wood marks an exam span');
{ const F = LEVELS.find(l => l.id === 'fair').build(); assert.deepEqual(F.examSpans, [F.arc.exam], 'the Harvest Fair\'s LAST ROUND is its exam span');
  assert.equal(SV.spikeRule(F, 570 * 16 + 8), 'death'); assert.equal(SV.spikeRule(F, 300 * 16 + 8), 'hurt'); assert.equal(SV.spikeRule({ fallRule: 'death' }, 0), 'death'); }

/* ---------- the page ---------- */
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const {LEVELS,T}=await import('/src/level.js');const SV=await import('/src/survival.js');BK.manualSimulation=true;const out={};
const W=id=>LEVELS.findIndex(l=>l.id===id);
const go=id=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(W(id));BK.start();BK.god=false;BK.SET.invincible=false;BK.enemies().forEach(e=>{e.alive=false;});BK.sim(20);};
const G=()=>BK.L.grid,Wd=()=>BK.L.W,at=(c,r)=>G()[r*Wd()+c];
/* a spike tile with a solid floor under it and open air over it, outside every span, and dry standing ground a few columns from it */
const spikeAt=(lo,hi)=>{for(let c=lo;c<=hi;c++)for(let r=2;r<BK.L.H-1;r++)if(at(c,r)===T.SPIKE&&at(c,r-1)===T.AIR&&at(c,r-2)===T.AIR)return [c,r];return null;};
const standNear=(c0,r0)=>{for(const d of [-6,-7,-8,-9,-10,6,7,8,9,10])for(let r=r0-6;r<=r0+3;r++){const c=c0+d;if(at(c,r)===T.AIR&&at(c,r-1)===T.AIR&&(at(c,r+1)===T.SOLID)&&![-1,0,1].some(k=>at(c+k,r+1)===T.SPIKE||at(c+k,r)===T.SPIKE))return [c,r];}return null;};
/* 1. SPIKES (the Bracken Wood's first bed), bare and armoured */
const spikeRun=(armour)=>{go('wood');const P=BK.P,PR=BKT.PROG;PR.items.mail=PR.items.plate=PR.items.mail2=armour;PR.charm=armour?'iron':null;const s=spikeAt(0,Wd()-1),st=standNear(s[0],s[1]);
 BK.tp(st[0],st[1]);BK.sim(30);const safe=P.safe&&{x:P.safe.x,y:P.safe.y};P.inv=0;P.hp=P.maxHp;const hp0=P.hp;BK.tp(s[0],s[1]-1);P.vy=60;let n=0;while(n<40&&P.hp===hp0){BK.sim(1);n++;}BK.sim(2);
 return {spike:s,stand:st,lost:hp0-P.hp,max:P.maxHp,want:Math.round(P.maxHp*SV.HAZARD.pct),back:safe&&Math.abs(P.x-safe.x)<2&&Math.abs(P.y-safe.y)<2,safe,at:[P.x,P.y],dead:!!P.dead,safeBy:BK.P.safe?[BK.P.safe.x,BK.P.safe.y]:null};};
out.spike=spikeRun(false);out.spikeArmour=spikeRun(true);
/* 1b. DEEP WATER in a waterHurts wood (the marsh): the same share, and back to dry ground */
{go('marsh');const P=BK.P,L=BK.L;const p=(L.pools||[]).find(q=>!q.shallow&&!q.swim&&!q.dry&&!q.fire&&q.x1-q.x0>48);out.water={pool:!!p};
 if(p){const c=Math.floor((p.x0-24)/16);let r=Math.floor(p.y/16)-4;while(r<L.H-1&&!(at(c,r+1)===T.SOLID&&at(c,r)===T.AIR))r++;BK.tp(c,r);BK.sim(30);const safe=P.safe&&{x:P.safe.x,y:P.safe.y};P.inv=0;P.hp=P.maxHp;const hp0=P.hp;
  P.x=(p.x0+p.x1)/2;P.y=p.y+30;P.vy=0;let n=0;while(n<30&&P.hp===hp0){BK.sim(1);n++;}BK.sim(2);Object.assign(out.water,{lost:hp0-P.hp,want:Math.round(P.maxHp*SV.HAZARD.pct),back:!!safe&&Math.abs(P.x-safe.x)<2&&Math.abs(P.y-safe.y)<2,dead:!!P.dead});}}
/* 2. THE EXAM: the fair's spike yard kills, and walking in said so */
{go('fair');const P=BK.P,ex=BK.L.examSpans[0];const s=spikeAt(ex[0],ex[1]);BK.tp(ex[0]-3,26);BK.sim(2);P.hp=P.maxHp;P.inv=0;BK.tp(s[0],s[1]-1);P.vy=60;let n=0,told=null;while(n<40&&!P.dead){BK.sim(1);n++;if(!told&&BK.hint&&BK.hint.msg===SV.LINES.exam)told=n;}
 out.exam={spike:s,dead:!!P.dead,killer:P.killer&&P.killer.name,told};}
return out;})()`);
  console.log(JSON.stringify(r));
  for (const k of ['spike', 'spikeArmour']) { const s = r[k];
    assert.equal(s.lost, s.want, k + ': spikes cost ' + s.lost + ' of ' + s.max + ', not ' + s.want + ' (' + SV.HAZARD.pct * 100 + '% of the bar): ' + JSON.stringify(s));
    assert.ok(s.back && !s.dead, k + ': spikes did not hand the hero back to his last safe footing: ' + JSON.stringify(s)); }
  assert.ok(r.water.pool, 'the marsh has no deep pool to fall in');
  assert.equal(r.water.lost, r.water.want, 'deep water costs ' + r.water.lost + ', not ' + r.water.want + ': ' + JSON.stringify(r.water));
  assert.ok(r.water.back && !r.water.dead, 'deep water did not hand the hero back: ' + JSON.stringify(r.water));
  assert.ok(r.exam.dead && r.exam.killer === 'THE SPIKES', 'the fair\'s exam spikes did not kill: ' + JSON.stringify(r.exam));
  assert.ok(r.exam.told, 'walking into the exam did not say the spikes kill: ' + JSON.stringify(r.exam));
  assert.deepEqual(pg.errors, []);
  console.log('SURVIVAL: hazards ' + r.spike.lost + '/' + r.spike.max + ' (armoured ' + r.spikeArmour.lost + '/' + r.spikeArmour.max + '), water ' + r.water.lost + ', both hand back; the exam kills and is told; ' + spans + ' exam span(s), none untold.');
} finally { pg.close(); }
