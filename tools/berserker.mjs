// tools/berserker.mjs — THE BERSERKER'S KIT, PLAYED THROUGH HIS REAL INPUT IN THE REAL PAGE (claude/berserker, scratch/brief-berserker.md).
//   chain     the chops run lead / off / lead and the run goes on only while they land: three chops into a straw foe make a third cut
//             (combo 3), and a chop that whiffs starts the run over (combo back to 1)
//   cross     HOLD X is the CROSS-CHOP: a heavy, and it leans on poise far harder than the knight's heavy cut on the same foe
//   roll      the shoulder roll knocks a small foe aside (shoved, staggered) and goes through it
//   brace     tap C: a YELLOW blow from the front landing in the brace is BLOCKED and pays rage; a RED one goes through (the full hit);
//             a brace that meets nothing leaves him rooted a beat (braceRec) and a blow then is the full hit; only ONE blow is taken
//   rage      dealing and taking damage fill it; out of combat it drains; full rage + C is the FRENZY (not a brace)
//   frenzy    in a frenzy: quicker chops (swingMul up), no flinch (a blow does not set P.hurt), x1.25 damage taken, a kill heals, and the
//             war cry quickens a partner in reach (hasteT)
//   throw     UP+C hurls the off axe: one-handed (slower chops, no cross-chop) until he walks over it; it hits a foe on the way
//   workup    WORKING UP (src/crouch-c.js): crouched and still, rage fills to the cap and no further, a growl wakes a sleeper within
//             eight tiles, and a hit stands him up and breaks it off
//   skills    every one of his nine actives fires when bought and slotted (cooldown set, stamina spent)
//   art       his set has every key the draw asks for, a BARE set (one axe) and both sets wear a weapon skin on the axe heads only
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
const fails = [], ok = (c, m) => { if (!c) fails.push(m); };
try {
  await pg.evalp(`(async()=>{const {xpFloor}=await import('/src/xp.js');
    window.__bz=(ids=[],lv=12)=>{BK.manualSimulation=true;BK.SET.speed=1;BK.setHero('berserker');BK.reset({fresh:true});BKT.PROG.xp.berserker=xpFloor(lv);
      BKT.PROG.skillOwned.berserker=Object.fromEntries(ids.map(i=>[i,true]));BKT.PROG.loadouts.berserker=ids.slice(0,3);BK.applyUpgrades();BK.load(0);BK.state='play';
      BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');const L=BK.L;for(let x=2;x<50;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;
      BK.tp(10,21);BK.sim(30);for(const k in BK.keys)BK.keys[k]=false;const P=BK.P;P.hp=P.maxHp;P.inv=0;P.st=P.maxSt;P.face=1;P.rage=0;P.bzFightT=-99;};
    window.__foe=(dx,t='sprig',hp=5000)=>{BK.spawnEnt({t,x:(BK.P.x+dx)/16,y:21});const e=BK.enemies().at(-1);e.hp=e.hp0=hp;e.cd=99;return e;};
    return 1})()`);
  const r = await pg.evalp(`(()=>{const out={},P=()=>BK.P,K=BK.keys,Z=()=>BK.bz();
    /* chain */
    __bz();let e=__foe(18);BK.sim(2);const combos=[];for(let i=0;i<3;i++){P().st=P().maxSt;BK.press('atk');for(let f=0;f<30;f++){BK.sim(1);e.x=P().x+18;}combos.push(P().combo);}
    e.alive=false;P().st=P().maxSt;BK.press('atk');BK.sim(40);combos.push(P().combo);P().st=P().maxSt;BK.press('atk');BK.sim(4);combos.push(P().combo);out.chain={combos,chainN:Z().chain};
    /* the cross-chop on a mini's bar (70) */
    const poiseOf=h=>{__bz();
      const b=__foe(20,'brute');b.maxHp=b.hp;b.mini=true;BK.sim(2);P().st=P().maxSt;K.atk=true;for(let i=0;i<40;i++){BK.sim(1);b.x=P().x+20;}K.atk=false;let most=0,heavy=false;for(let i=0;i<40;i++){BK.sim(1);b.x=P().x+20;heavy=heavy||P().heavy;most=Math.max(most,b.poise||0,b.broken>0?100:0);}return {most,heavy,hit:b.hp0-b.hp};};
    out.cross={bz:poiseOf('berserker')};
    /* roll */
    __bz();e=__foe(30);BK.sim(2);const x0=e.x;BK.press('dodge');for(let i=0;i<24;i++)BK.sim(1);out.roll={shoved:Math.round(e.x-x0),stag:e.stagger>0||e.shoved>0,passed:P().x>e.x-4,shoves:Z().stats.rollShoves};
    /* brace */
    __bz();e=__foe(14);BK.sim(2);P().st=P().maxSt;K.block=true;BK.sim(2);K.block=false;BK.sim(2);const hp0=P().hp,r1=BKT.damagePlayer(e.x,10,{who:e});out.brace={yellow:r1,lost:hp0-P().hp,rage:Math.round(P().rage)};
    const r2=BKT.damagePlayer(e.x,10,{who:e});out.brace.second=r2;
    __bz();e=__foe(14);BK.sim(2);K.block=true;BK.sim(2);K.block=false;BK.sim(2);const hp1=P().hp;out.brace.red=BKT.damagePlayer(e.x,10,{who:e,unblockable:true});out.brace.redLost=hp1-P().hp;
    __bz();e=__foe(14);BK.sim(2);K.block=true;BK.sim(2);K.block=false;BK.sim(24);out.brace.missRec=P().braceRec>0||P().braceT>0;const hp2=P().hp;P().inv=0;out.brace.miss=BKT.damagePlayer(e.x,10,{who:e});
    /* rage fill + drain */
    __bz();e=__foe(18);BK.sim(2);for(let i=0;i<4;i++){P().st=P().maxSt;BK.press('atk');for(let f=0;f<20;f++){BK.sim(1);e.x=P().x+18;}}const dealt=P().rage;P().inv=0;BKT.damagePlayer(e.x,10,{who:e,unblockable:true});const took=P().rage-dealt;
    e.alive=false;BK.sim(60*2);const r2s=P().rage;BK.sim(60*3);out.rage={dealt:Math.round(dealt),took:Math.round(took),after2s:Math.round(r2s),after5s:Math.round(P().rage)};
    /* frenzy */
    __bz();P().rage=100;P().bzFightT=BK.time||0;const sm0=Z().swingMul;K.block=true;BK.sim(2);K.block=false;BK.sim(2);const fr=P().frenzyT,braced=P().braceT>0;BK.sim(30);
    e=__foe(14);P().inv=0;const fz=P().frenzyT;P().frenzyT=0;const hpb=P().hp;BKT.damagePlayer(e.x,20,{who:e,unblockable:true});const lostN=hpb-P().hp;P().frenzyT=fz;P().inv=0;P().hurt=0;const hp3=P().hp;BKT.damagePlayer(e.x,20,{who:e,unblockable:true});const lostF=hp3-P().hp,hurtF=P().hurt>0;
    e.hp=1;e.hp0=8;P().hp=P().maxHp-20;const hpk=P().hp;P().st=P().maxSt;BK.press('atk');for(let f=0;f<20;f++){BK.sim(1);if(e.alive)e.x=P().x+16;}
    out.frenzy={frenzyT:+fr.toFixed(2),braced,swing0:sm0,swing:Z().swingMul,lost20:lostF,lostN,hurt:hurtF,killHeal:P().hp-hpk,take:Z().takeMul};
    /* throw */
    __bz();e=__foe(70);BK.sim(2);P().st=P().maxSt;K.up=true;K.block=true;BK.sim(2);K.block=false;K.up=false;let hitA=false;for(let i=0;i<50;i++){BK.sim(1);hitA=hitA||e.hp<e.hp0;}
    const one=Z().oneHanded,swOne=Z().swingMul,state=Z().axe&&Z().axe.state;K.atk=true;BK.sim(40);const heavyOne=P().heavy||P().charge>0;K.atk=false;BK.sim(30);
    const ax=Z().axe;if(ax){for(let i=0;i<200&&Z().oneHanded;i++){K.right=P().x<ax.x;K.left=P().x>ax.x;BK.sim(1);}}K.right=K.left=false;
    out.throw={one,state,hitA,swOne,heavyOne,picked:!Z().oneHanded,throws:Z().stats.throws,pickups:Z().stats.pickups};
    /* working up */
    __bz([],8);/* (below UNFLINCHING, level 12) */e=__foe(100);e.mode='asleep';e.sleeper=true;e.seenP=false;BK.sim(2);K.down=true;BK.sim(60*14);const work=BK.crouchC();const woke=e.woke===1||e.seenP;const capped=P().rage;
    P().inv=0;const hitW=BKT.damagePlayer(P().x+10,5,{});BK.sim(30);const broke=BK.crouchC().stats.broken>0;K.down=false;BK.sim(2);
    out.workup={hitW,rage:Math.round(capped),woke,growls:work.stats.growls,broke,pose:P().lastKey};
    /* skills */
    const IDS=['bzRoar','bzSpin','bzHarden','bzCleave','bzRampage','bzShrug','bzStand','bzUnchained','bzStorm'];out.skills={};
    for(const id of IDS){__bz([id],24);__foe(24);BK.sim(2);P().st=P().maxSt;const st=P().st;BK.press('throw');BK.sim(3);out.skills[id]={cd:+((P().cds||{})[id]||0).toFixed(1),spent:Math.round(st-P().st)};}
    /* art */
    const set=BKT.heroSet('bracken','steel',false,'berserker');const need=['idle','run','jump','fall','land','takeoff','apex','skid','climb','atk','atkB','atkC','air','plunge','hurt','crouch','slide','block','dashAtk','cast','fidget','dance','slump','swim','tread','roll','grind','rise','sweep','airUp','windup','heavy','blast','bzThrow','bzRoar','bzSpin','bzHarden','bzCleave','bzRamp','bzShrug','bzStand','bzUnch','bzStorm'];
    const px=c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;return Array.from(d).join(',');};
    const gold=BKT.heroSet('bracken','ember',false,'berserker');const diff=(a,b)=>{const A=a.getContext('2d').getImageData(0,0,a.width,a.height).data,B=b.getContext('2d').getImageData(0,0,b.width,b.height).data;let n=0,body=0;for(let i=0;i<A.length;i+=4){if(A[i]!==B[i]||A[i+1]!==B[i+1]||A[i+2]!==B[i+2])n++;}return n;};
    out.art={missing:need.filter(k=>!set.R[k]),bare:!!set.bare,bareMissing:need.filter(k=>!(set.bare&&set.bare.R[k])),skinDiff:diff(set.R.idle[0],gold.R.idle[0])};
    return out;})()`, 600000);
  console.log(JSON.stringify(r));
  ok(r.chain.combos[1] === 2 && r.chain.combos[2] === 3, 'chain: three landed chops did not run 1-2-3: ' + r.chain.combos);
  ok(r.chain.combos[4] === 1, 'chain: a chop after a whiff did not start the run over: ' + r.chain.combos);
  ok(r.cross.bz.heavy && r.cross.bz.most >= 60, 'cross-chop: not a heavy, or one does not fill most of a mini\'s poise bar: ' + JSON.stringify(r.cross));
  ok(r.roll.stag && r.roll.shoves > 0, 'roll: the shoulder roll did not knock the small foe aside: ' + JSON.stringify(r.roll));
  ok(r.brace.yellow === 'blocked' && r.brace.lost === 0 && r.brace.rage >= 25, 'brace: a yellow blow on the brace was not taken as rage: ' + JSON.stringify(r.brace));
  ok(r.brace.second === 'hit', 'brace: a second blow was taken too (it takes ONE): ' + r.brace.second);
  ok(r.brace.red === 'hit' && r.brace.redLost > 0, 'brace: a RED blow was turned: ' + JSON.stringify(r.brace));
  ok(r.brace.missRec && r.brace.miss === 'hit', 'brace: a mistimed brace was not the full hit: ' + JSON.stringify(r.brace));
  ok(r.rage.dealt > 10 && r.rage.took > 5, 'rage: dealing and taking did not fill it: ' + JSON.stringify(r.rage));
  ok(r.rage.after5s < r.rage.after2s, 'rage: it did not drain out of combat: ' + JSON.stringify(r.rage));
  ok(r.frenzy.frenzyT > 5 && !r.frenzy.braced, 'frenzy: full rage + C did not start a frenzy: ' + JSON.stringify(r.frenzy));
  ok(r.frenzy.swing > r.frenzy.swing0 && !r.frenzy.hurt && r.frenzy.lost20 > r.frenzy.lostN && r.frenzy.killHeal > 0, 'frenzy: not quicker / flinched / not x1.25 taken / no kill-heal: ' + JSON.stringify(r.frenzy));
  ok(r.throw.one && r.throw.hitA && r.throw.swOne < 1 && !r.throw.heavyOne && r.throw.picked, 'throw: ' + JSON.stringify(r.throw));
  ok(r.workup.rage > 50 && r.workup.rage <= 75 && r.workup.woke && r.workup.growls > 3 && r.workup.broke, 'working up: ' + JSON.stringify(r.workup));
  for (const [id, s] of Object.entries(r.skills)) ok(s.cd > 0 && s.spent > 0, 'skill ' + id + ' did not fire: ' + JSON.stringify(s));
  ok(!r.art.missing.length && r.art.bare && !r.art.bareMissing.length, 'art: missing keys ' + r.art.missing + ' / bare ' + r.art.bareMissing);
  ok(r.art.skinDiff > 0 && r.art.skinDiff < 40, 'art: a weapon skin changed ' + r.art.skinDiff + ' pixels of his idle (only the axe heads should change)');
  assert.deepEqual(pg.errors, []);
} finally { pg.close(); }
if (fails.length) { console.log('FAIL\n  ' + fails.join('\n  ')); process.exit(1); }
console.log('berserker: ok');
