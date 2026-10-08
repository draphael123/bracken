/* tools/survival.mjs - SURVIVAL (claude/survival, Daniel's decisions 2026-10-07 after scratch/audit-healing.md: OPTION A + design-standard A10 amended).
 *
 * WHAT IT HOLDS (each fails on the code before it):
 *   1. HAZARDS ARE A SHARE OF THE BAR. Spikes and deep water in a wood that says L.waterHurts cost SV.HAZARD.pct of max health (25-30%), the
 *      same with plate, ringmail and the iron charm on (the % path skips the difficulty/tier/armour chain), and hand the hero back to the
 *      last safe footing (P.safe) - spikes too, which used to knock him up and leave him in the bed. Safe footing is never beside spikes.
 *   2. THE EXAM KILLS, AND SAYS SO. In an exam span (L.examSpans) spikes are a real death (THE SPIKES on the card), and walking into the
 *      span says it (SV.LINES.exam). NEVER UNTOLD: every span with spikes in it has hurt spikes earlier in its wood (SV.untoldExams), every wood.
 *   3. THE FLASK. Three a shrine interval (the smith's extra ones on top), drunk on a key (U / 1), LT on a pad, the DRINK button on a phone, or
 *      BK.drinkFlask() for a bot: +35% of max health at the swallow, a committed drink (no swing, no jump while it lasts), and a blow before the
 *      swallow SPILLS it (spent, nothing healed). No auto-drink: a blow under a quarter of the bar no longer drinks for you.
 *   4. DRY SHRINES. A shrine lights, fills the flasks and the stamina, and does NOT heal; a death does heal in full and fills them; R (back to
 *      the shrine) carries health and flasks. HEARTS heal 12% of max; KILL HEALS halve and cap at 5 (the charm alone: 3).
 *   5. (claude/survival2, Daniel 10-07 A10b - the approved design change, same strictness: 3 flasks -> ONE to start, the smith's two -> max 3; a
 *      shrine FILLED them -> gives back ONE, once a shrine a LIFE; stamina regen 75 -> 90, Daniel 10-08 pulled x1.4 back to x1.2) a shrine reached gives one back and no more that life
 *      (R is not a new life); a death gives back all (and keeps a broken shrine's undrunk extra); BREAKING a shrine (hold interact) takes its
 *      checkpoint for the run (a death wakes at the one lit before), gives +1 over the max, is told, never at the pre-boss shrine or in a boss
 *      fight, and blocks nothing (he walks on past it); the bar refills ~20% faster (x1.2).
 */
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';
import * as SV from '../src/survival.js';
import { openPage } from './cdp.mjs';
import { ctxButton } from '../src/touch-interact.js';
import { padStateOf, padTable, emptyBinds, keysTable } from '../src/controls.js';
import { readFileSync } from 'node:fs';
import { STAM } from '../src/commit.js';

/* ---------- node: the rules and the lint ---------- */
assert.ok(SV.HAZARD.pct >= 0.25 && SV.HAZARD.pct <= 0.3, 'a hazard costs 25-30% of the bar (Daniel 10-07)');
let spans = 0;
for (const lv of LEVELS) { const L = lv.build(); spans += (L.examSpans || []).length;
  for (const s of L.examSpans || []) assert.ok(Array.isArray(s) && s[0] <= s[1] && s[1] < L.W, lv.id + ': an exam span is [x0, x1] in its columns: ' + JSON.stringify(s));
  assert.deepEqual(SV.untoldExams(L, T.SPIKE), [], lv.id + ': an exam\'s spikes kill with no hurt spikes before it to teach them (an UNTOLD death)'); }
assert.ok(spans >= 1, 'no wood marks an exam span');
{ const F = LEVELS.find(l => l.id === 'fair').build(); assert.deepEqual(F.examSpans, [F.arc.exam], 'the Harvest Fair\'s LAST ROUND is its exam span');
  assert.equal(SV.spikeRule(F, 570 * 16 + 8), 'death'); assert.equal(SV.spikeRule(F, 300 * 16 + 8), 'hurt'); assert.equal(SV.spikeRule({ fallRule: 'death' }, 0), 'death'); }

/* the hands: U and 1 on the keyboard, LT on the pad (talk keeps the d-pad's up), and the phone's contextual button when no lane's hook answers */
{ const t = keysTable(emptyBinds()); assert.ok(t.flask.includes('u') && t.flask.includes('1'), 'U and 1 drink: ' + t.flask);
  const btn = i => ({ axes: [0, 0], buttons: Array.from({ length: 17 }, (_, k) => ({ pressed: k === i })) }), pt = padTable(emptyBinds(), 'pad1');
  assert.ok(padStateOf(btn(6), pt).flask && !padStateOf(btn(6), pt).talk, 'LT drinks (and no longer talks)'); assert.ok(padStateOf(btn(12), pt).talk, 'the d-pad up still talks');
  const P = { hp: 10, maxHp: 100, ground: true }, c = { P, state: 'play', flask: () => ({ label: 'FLASK 3', key: 'flask' }) };
  assert.deepEqual(ctxButton(c), { label: 'FLASK 3', key: 'flask', dim: false }, 'the phone shows the flask'); }
assert.equal(SV.killHeal({ charm: true, bloodDrawn: true, bloodletter: true }), 5, 'kill heals cap at 5'); assert.equal(SV.killHeal({ charm: true }), 3);
assert.equal(SV.flaskMax({}), 1); assert.equal(SV.flaskMax({ flaskUp: 9 }), 3);   /* (survival2: one to start, max three) */
assert.equal(SV.shrineRefill(0, 3), 1); assert.equal(SV.shrineRefill(3, 3), 3); assert.equal(SV.shrineRefill(4, 3), 4); assert.equal(SV.deathRefill(0, 3), 3); assert.equal(SV.deathRefill(4, 3), 4);
assert.equal(STAM.regen, Math.round(75 * SV.STAM_REGEN_MUL), 'stamina regen is not ~20% faster than 75 (Daniel 10-08: x1.2)');
{ const m = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'); assert.equal(m.split('keys.talk = true').length - 1, 1, 'keys.talk (the BREAK hold) must be set only by a person key (and the pad held list): a bot never breaks a shrine'); } assert.equal(SV.flaskHeal(200), 70); assert.equal(SV.heartHeal(200), 24);

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
/* 3. THE FLASK */
{go('wood');const P=BK.P,f={};f.start=P.flasks;f.max=BK.flaskMax();BKT.PROG.flaskUp=2;P.flasks=3;P.hp=30;P.inv=0;const hp0=P.hp;f.drank=BK.drinkFlask();f.after=P.flasks;f.maxUp=BK.flaskMax();f.api=BK.flasks()===P.flasks&&BK.flaskKey==='U';
 BK.keys.right=true;BK.press('jump');BK.press('atk');const x0=P.x;BK.sim(10);f.rooted=Math.abs(P.x-x0)<3&&P.atk<0&&P.ground;BK.keys.right=false;
 let n=10;while(n<80&&P.hp===hp0){BK.sim(1);n++;}f.heal=P.hp-hp0;f.want=Math.round(P.maxHp*SV.FLASK.heal);f.swallowF=n;f.swallowWant=Math.round(SV.FLASK.swallowAt*60/(BK.SET.speed||1));BK.sim(40);f.done=!(P.drinkT>0);
 /* spilled: a blow before the swallow */
 P.hp=30;P.inv=0;P.hurt=0;BK.sim(5);const n0=P.flasks;BK.drinkFlask();BK.sim(6);P.inv=0;BK.damagePlayer(P.x+20,10,{unblockable:true});const hpHit=P.hp;BK.sim(60);f.spill={spent:n0-P.flasks,healed:P.hp-hpHit,drinking:P.drinkT>0};
 /* the key */
 P.hurt=0;P.inv=0;P.hp=30;BK.sim(5);dispatchEvent(new KeyboardEvent('keydown',{key:'u'}));BK.step(1);dispatchEvent(new KeyboardEvent('keyup',{key:'u'}));f.key=P.drinkT>0;BK.sim(60);
 /* no auto-drink under a quarter */
 P.flasks=3;P.hp=40;P.inv=0;BK.damagePlayer(P.x+20,30,{unblockable:true,pct:0.2});f.auto={flasks:P.flasks,hp:P.hp};
 /* empty */
 P.flasks=0;P.hp=30;f.empty=BK.drinkFlask();out.flask=f;}
/* 4. DRY SHRINES, a full death, R, a heart, a kill */
{go('wood');BKT.PROG.flaskUp=2;const P=BK.P,s=BK.shrines().filter(q=>!q.lit).sort((a,b)=>a.x-b.x)[1],o={};BK.sim(5);P.hp=40;P.flasks=1;P.st=1;P.x=s.x;P.y=s.y;BK.sim(3);o.shrine={lit:s.lit,hp:P.hp,flasks:P.flasks,st:P.st===P.maxSt};
 P.x=s.x-60;BK.sim(3);P.flasks=0;P.x=s.x;P.y=s.y;BK.sim(3);o.again=P.flasks;   /* the same life: no second flask from it */
 P.hp=50;P.flasks=1;dispatchEvent(new KeyboardEvent('keydown',{key:'r'}));BK.step(1);dispatchEvent(new KeyboardEvent('keyup',{key:'r'}));BK.sim(2);o.r={hp:P.hp,flasks:P.flasks,at:Math.abs(P.x-s.x)<20};P.flasks=0;BK.sim(3);o.rLife=P.flasks;P.flasks=1;
 P.inv=0;P.flasks=0;BK.damagePlayer(P.x,9999,{unblockable:true});let n=0;while(n<300&&(P.dead||P.hp<=0)){BK.sim(1);n++;}o.death={hp:P.hp,max:P.maxHp,flasks:P.flasks};
 P.hp=40;BK.healths().push({x:P.x,y:P.y-8,vy:0,t:0,stay:true});BK.sim(3);o.heart=P.hp-40;o.heartWant=Math.round(P.maxHp*SV.HEART_PCT);
 go('wood');BKT.PROG.charm='heart';const e=BK.enemies().find(q=>!q.maxHp&&!q.harmless&&!q.mini);if(e){e.alive=true;BK.P.hp=10;BK.P.inv=99;BKT.hurtEnemy(e,1e5,e.x-10,false);o.kill=BK.P.hp-10;}BKT.PROG.charm=null;
 out.dry=o;BKT.PROG.flaskUp=0;}
/* 5. BREAK THE SHRINE (survival2) */
{go('wood');BKT.PROG.flaskUp=2;const P=BK.P,L=BK.L,b={},SH=BK.shrines(),pre=SV.preBossShrine(L,SH),ok=SH.filter(q=>q!==pre&&!(L.arena&&q.x>=L.arena.x0&&q.x<=L.arena.x1)).sort((a,c)=>a.x-c.x),s1=ok[0],s2=ok[1];
 const visit=s=>{P.x=s.x;P.y=s.y;P.vx=0;P.vy=0;BK.sim(3);};
 visit(s1);visit(s2);b.cpS2=BK.checkpointAt().x===s2.x;b.prompt=BK.breakShrineAt()===s2;P.flasks=BK.flaskMax();
 BK.keys.talk=true;BK.sim(10);BK.keys.talk=false;BK.sim(2);b.tap={broken:!!s2.broken,flasks:P.flasks};   /* a tap is not a break */
 const want=Math.ceil(SV.SHRINE.breakHold*60/(BK.SET.speed||1));let n=0;BK.keys.talk=true;while(n<want+30&&!s2.broken){BK.sim(1);n++;}BK.keys.talk=false;BK.sim(2);
 b.broke={broken:!!s2.broken,frames:n,want,flasks:P.flasks,max:BK.flaskMax(),cpS1:BK.checkpointAt().x===s1.x,told:!!(BK.hint&&BK.hint.msg===SV.LINES.broken)};
 visit(s2);b.relight={lit:!!s2.lit,cpS1:BK.checkpointAt().x===s1.x};
 /* no soft-lock: he walks on past it */
 P.x=s2.x-40;P.y=s2.y;BK.sim(2);BK.keys.right=true;let k=0;while(k<240&&P.x<s2.x+40){BK.sim(1);k++;}BK.keys.right=false;b.walkPast=P.x>=s2.x+40;
 /* a death: wakes at s1 with the extra kept (4/3) */
 P.inv=0;BK.damagePlayer(P.x,9999,{unblockable:true});let d=0;while(d<300&&(P.dead||P.hp<=0)){BK.sim(1);d++;}b.death={x:Math.abs(P.x-s1.x)<20,flasks:P.flasks,still:!!s2.broken};
 /* the pre-boss shrine and a boss fight: never */
 if(pre){pre.lit=true;P.x=pre.x;P.y=pre.y;BK.sim(2);b.preBlock=SV.breakBlock(L,pre,SH,{});BK.keys.talk=true;BK.sim(want+20);BK.keys.talk=false;b.preBroken=!!pre.broken;}
 b.fightBlock=SV.breakBlock(L,s1,SH,{bossActive:true});
 /* restart the wood: mended */
 go('wood');b.mended=BK.shrines().every(q=>!q.broken);out.brk=b;BKT.PROG.flaskUp=0;}
/* 6. STAMINA: the bar's refill rate, a fresh knight */
{go('wood');const P=BK.P;BK.sim(30);P.st=10;P.stDelay=0;P.exhaustT=0;P.winded=false;const s0=P.st;BK.sim(20);out.stam={rate:(P.st-s0)/(20*(BK.SET.speed||1)/60),max:P.maxSt};}
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
  const f = r.flask, d = r.dry;
  assert.ok(f.api, 'the walker names: BK.flasks() is the count held, BK.flaskKey the key (U)');
  assert.equal(f.start, 1, 'a fresh knight does not start with ONE flask (survival2)'); assert.equal(f.max, 1); assert.equal(f.maxUp, 3, 'the smith two extra flasks do not make three');
  assert.ok(f.drank && f.after === 2, 'BK.drinkFlask() did not start a drink: ' + JSON.stringify(f));
  assert.ok(f.rooted, 'a drink is not committed: he moved, jumped or swung through it: ' + JSON.stringify(f));
  assert.equal(f.heal, f.want, 'a flask heals ' + f.heal + ', not 35% of the bar (' + f.want + ')');
  assert.ok(Math.abs(f.swallowF - f.swallowWant) <= 3 && f.done, 'the swallow lands at ' + f.swallowF + ' frames (want ~' + f.swallowWant + ': FLASK.swallowAt at the game speed) and the drink ends');
  assert.deepEqual([f.spill.spent, f.spill.healed, f.spill.drinking], [1, 0, false], 'a blow before the swallow does not spill the flask: ' + JSON.stringify(f.spill));
  assert.ok(f.key, 'U does not drink'); assert.equal(f.auto.flasks, 3, 'a blow under a quarter still drinks for you'); assert.equal(f.empty, false, 'a drink with no flask');
  assert.ok(d.shrine.lit && d.shrine.hp === 40 && d.shrine.flasks === 2 && d.shrine.st, 'a shrine must light, give back ONE flask (1 -> 2 of 3) and the stamina, and NOT heal: ' + JSON.stringify(d.shrine));
  assert.equal(d.again, 0, 'a shrine gave a second flask back in the same life (touch-farming)');
  assert.equal(d.rLife, 0, 'R (back to the shrine) started a new life: the shrine gave a flask back for it');
  assert.ok(d.r.at && d.r.hp === 50 && d.r.flasks === 1, 'R (back to the shrine) healed or filled the flasks: ' + JSON.stringify(d.r));
  assert.ok(d.death.hp === d.death.max && d.death.flasks === 3, 'a death does not heal in full and fill the flasks: ' + JSON.stringify(d.death));
  const b = r.brk;
  assert.ok(b.cpS2 && b.prompt, 'the BREAK prompt does not stand over a lit shrine: ' + JSON.stringify(b));
  assert.ok(!b.tap.broken, 'a tap of interact broke the shrine (it is a HOLD): ' + JSON.stringify(b.tap));
  assert.ok(b.broke.broken && Math.abs(b.broke.frames - b.broke.want) <= 3, 'holding interact did not break the shrine in SHRINE.breakHold: ' + JSON.stringify(b.broke));
  assert.equal(b.broke.flasks, b.broke.max + 1, 'breaking a shrine does not give +1 OVER the max: ' + JSON.stringify(b.broke));
  assert.ok(b.broke.cpS1 && b.broke.told, 'the broken shrine is still the checkpoint (or it was not told): ' + JSON.stringify(b.broke));
  assert.ok(!b.relight.lit && b.relight.cpS1, 'a broken shrine lit again: ' + JSON.stringify(b.relight));
  assert.ok(b.walkPast, 'SOFT-LOCK: he could not walk on past the broken shrine');
  assert.ok(b.death.x && b.death.flasks === b.broke.max + 1 && b.death.still, 'a death after a break did not wake at the shrine before it, keep the undrunk extra and leave it broken: ' + JSON.stringify(b.death));
  if (b.preBlock !== undefined) assert.ok(b.preBlock && !b.preBroken, 'the pre-boss shrine broke: ' + JSON.stringify(b));
  assert.ok(b.fightBlock, 'a shrine is breakable in a boss fight'); assert.ok(b.mended, 'a restarted wood kept a broken shrine');
  assert.ok(r.stam.rate >= 75 * SV.STAM_REGEN_MUL * 0.97, 'stamina refills at ' + r.stam.rate.toFixed(1) + '/s, not ~20% over 75: ' + JSON.stringify(r.stam));
  assert.equal(d.heart, d.heartWant, 'a heart heals ' + d.heart + ', not 12% (' + d.heartWant + ')');
  assert.equal(d.kill, 3, 'the HEART CHARM heals ' + d.kill + ' a kill, not 3');
  assert.deepEqual(pg.errors, []);
  console.log('SURVIVAL: flask +' + f.heal + ' at frame ' + f.swallowF + ', committed, spills, U/LT/phone; shrines dry, death full, R carries, heart +' + d.heart + ', charm +' + d.kill + '.');
  console.log('SURVIVAL2: one flask (smith: 3), a shrine gives one a life, a death all; BREAK held ' + b.broke.frames + ' f -> ' + b.broke.flasks + '/' + b.broke.max + ', checkpoint back, walks past, pre-boss and fight refused; stamina ' + r.stam.rate.toFixed(1) + '/s.');
  console.log('SURVIVAL: hazards ' + r.spike.lost + '/' + r.spike.max + ' (armoured ' + r.spikeArmour.lost + '/' + r.spikeArmour.max + '), water ' + r.water.lost + ', both hand back; the exam kills and is told; ' + spans + ' exam span(s), none untold.');
} finally { pg.close(); }
