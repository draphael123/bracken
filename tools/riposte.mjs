// tools/riposte.mjs - THE UNIVERSAL PARRY -> RIPOSTE, THE POISE BAR AND THE MIX-UP CHAIN DO WHAT THE BRIEF SAYS (claude/riposte,
// scratch/brief-riposte.md; src/riposte.js). Played in the real page through the real keys, the blows delivered through damagePlayer:
//   heroes   ALL EIGHT PARRY: each hero's own answer (found by trying its input - hold / tap / down / let go - at every lead up to 24 frames)
//            parries a yellow blow -> the hero has the riposte window, the common foe stands reeling (rpHold) - and the next cut into it
//            lands at least 1.8x the same hero's plain first cut. A RED blow met the same way is NOT parried (it lands) and says TOO STRONG.
//   elite    an elite parried staggers shorter than a common foe, and two ripostes BREAK HIS GUARD (his poise broken: his opening)
//   boss     a boss parried is OPEN a short told while (src/boss-greed.js openOf true, no chip) - a duelist longer - then WARDED: a parry in
//            the ward opens nothing; the poise bar draws (HUD + plate) and a break ends in the same ward
//   chain    each landed blow with a new verb adds a pip (max 5) and +6% a pip on damage; repeating a verb adds nothing (the mash: 0 pips);
//            a blow taken resets it; 3 s idle resets it
//   teach    the wood's lesson sign names the parry and the riposte for all eight heroes
// node tools/riposte.mjs [heroes,elite,boss,chain,teach]
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { LEVELS } from '../src/level.js';
const WANT = process.argv[2] ? process.argv[2].split(',') : ['teach', 'heroes', 'elite', 'boss', 'chain'];
const HEROES = ['knight', 'pyro', 'paladin', 'pirate', 'reaper', 'warden', 'geomancer', 'berserker'];

if (WANT.includes('teach')) {
  const R = LEVELS.find(l => l.id === 'wood').build(), z = (R.lessons || []).find(q => q.kind === 'parry');
  const sign = R.ents.find(e => e.t === 'sign' && e.x >= z.x0 && e.x <= z.x1);
  for (const h of HEROES) { const t = sign[h] || sign.text; assert(/PARRY|PERFECT GUARD/.test(t) && /RIPOSTE/.test(t), 'the wood teaches ' + h + ' the parry and the riposte: ' + t); }
  console.log('teach: the wood sign names the parry + riposte for all 8');
}

const pg = await openPage({ audio: false, fonts: false });
try {
  await pg.evalp(`(async()=>{
    window.__set=(h,foes,lv=1)=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero(h);BK.reset({fresh:true});BKT.setHeroLevel(h,lv);
      BKT.PROG.skillOwned[h]={};BKT.PROG.loadouts[h]=[];BK.applyUpgrades();BK.load(0);BK.state='play';BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');
      const L=BK.L;for(let x=2;x<60;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;BK.tp(10,21);BK.sim(60);const P=BK.P;P.hp=P.maxHp;P.inv=0;P.st=P.maxSt;P.face=1;P.combo=0;P.riposteT=0;P.mixedT=0;P.mixN=0;P.mixLast=null;
      return foes.map(([t,dx,o])=>{BK.spawnEnt({t,x:(P.x+dx)/16,y:21,...(o||{})});const e=BK.enemies().at(-1);e.hp=e.hp0=5000;e.cd=99;e.elT=99;return e;});};
    /* the hero's answer, by input: hold (C down n frames before), tap (C tapped n frames before), down (down HELD until the flare opens - claude/crouchfix - then n frames before the blow), release (C held, let go n frames before) */
    window.__answer=(how,n)=>{const K=BK.keys;if(how==='hold'){K.block=true;BK.sim(n);}else if(how==='tap'){K.block=true;BK.sim(1);K.block=false;BK.sim(n);}else if(how==='down'){K.down=true;let hh=0;while(!(BK.ember&&BK.ember()&&BK.ember().flare)&&hh<60){BK.sim(1);hh++;}K.down=false;BK.sim(n);}else if(how==='release'){K.block=true;BK.sim(45);K.block=false;BK.sim(n);}};
    window.__parry=(h,foeT,red,foeO)=>{const R=BK.riposte();for(const how of ['hold','tap','down','release'])for(let n=0;n<=24;n++){const [e]=__set(h,[[foeT,16,foeO]]);const P=BK.P;R.resetStats();__answer(how,n);P.inv=0;P.hurt=0;
        const hp0=P.hp,res=BKT.damagePlayer(P.x+14,10,red?{unblockable:true}:{});BK.keys.block=false;BK.keys.down=false;
        if(red){if(R.stats.tooStrong>0)return {how,n,res,lost:hp0-P.hp,parries:R.stats.parries,too:R.stats.tooStrong};continue;}
        if(R.stats.parries>0&&P.ripSrc==='parry'&&P.riposteT>0)return {how,n,res,win:+P.riposteT.toFixed(2),hold:+(e.rpHold||0).toFixed(2),open:+(e.rpOpenT||0).toFixed(2),e};}
      return null;};
    /* the cut after: swing once at the foe and read what it lost */
    window.__cut=(e)=>{const P=BK.P;BK.sim(2);e.x=P.x+16;P.face=1;P.inv=0;const hp0=e.hp;BK.press('atk');for(let i=0;i<24&&!(P.atk>=0);i++)BK.sim(1);BK.sim(40);return hp0-e.hp;};
    return 1;})()`);
  const out = {};
  if (WANT.includes('heroes')) {
    out.heroes = await pg.evalp(`(()=>{const o={};for(const h of ${JSON.stringify(HEROES)}){
      const [p0]=__set(h,[['sprig',16]]);const plain=__cut(p0);
      const r=__parry(h,'sprig',false);let rip=null,held=null;if(r){const e=r.e;delete r.e;BK.sim(10);held=+(e.rpHold||0).toFixed(2)>0||e.vx===0;rip=__cut(e);}
      const red=__parry(h,'sprig',true);o[h]={plain,parry:r,rip,ratio:plain>0&&rip!==null?+(rip/plain).toFixed(2):null,held,red};}return o;})()`);
    for (const h of HEROES) { const r = out.heroes[h]; console.log('heroes ' + h.padEnd(10) + JSON.stringify(r));
      assert(r.parry, h + ': its own answer parries a yellow blow (one of hold/tap/down/release, some lead)');
      assert.equal(r.parry.res, 'blocked', h + ': the parried blow is turned');
      assert(r.parry.win > 0 && r.parry.win <= 0.6, h + ': the riposte window opens (~0.6 s): ' + r.parry.win);
      assert(r.parry.hold > 0, h + ': the common foe stands reeling (rpHold ' + r.parry.hold + ')');
      /* (claude/berserker2, Daniel 10-11) THE BERSERKER'S RIPOSTE IS THE CROSS-CHOP - his run's finisher (x1.5) on top, as the knight's is his heavy third cut; and his plain first cut is a quick flurry chop (x0.85) - so his bound is the knight's */
      assert(r.ratio >= 1.8 && r.ratio <= (h === 'knight' || h === 'berserker' ? 3.8 : 2.7), h + ': the riposte cut lands ~2x the plain first cut, paid once (the knight and the berserker: their finisher x1.5 on top) (' + r.rip + ' vs ' + r.plain + ')');
      assert(r.red && r.red.res === 'hit' && r.red.parries === 0 && r.red.lost > 0, h + ': a RED blow met on the beat is not parried - it lands, and says TOO STRONG (' + JSON.stringify(r.red) + ')'); }
  }
  if (WANT.includes('elite')) {
    out.elite = await pg.evalp(`(()=>{const o={};const r1=__parry('knight','brute',false,{elite:true});if(!r1)return {none:true};const e=r1.e;o.elite=!!e.elite;o.hold=r1.hold;
      const d1=__cut(e);o.broken1=+(e.broken||0).toFixed(2);
      /* the second parry + riposte on the same elite */
      const P=BK.P;e.x=P.x+16;e.stagger=0;e.rpHold=0;BK.keys.block=true;BK.sim(2);P.inv=0;BKT.damagePlayer(P.x+14,10,{who:e});BK.keys.block=false;o.hold2=+(e.rpHold||0).toFixed(2);const d2=__cut(e);
      o.broken2=+(e.broken||0).toFixed(2);o.d1=d1;o.d2=d2;o.breaks=BK.riposte().stats.eliteBreaks;return o;})()`);
    console.log('elite ' + JSON.stringify(out.elite));
    assert(out.elite.elite && out.elite.hold > 0 && out.elite.hold < 0.6, 'an elite parried staggers, shorter than a common foe (' + out.elite.hold + ')');
    assert(!(out.elite.broken1 > 0), 'one riposte does not break his guard');
    assert(out.elite.broken2 > 0 && out.elite.breaks >= 1, 'the second riposte BREAKS his guard (his poise opening): ' + JSON.stringify(out.elite));
  }
  if (WANT.includes('boss')) {
    out.boss = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');const o={};
      const boot=id=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id===id));BK.state='play';BK.god=true;
        const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+(A.reverse?-1:1),Math.round(A.floor/16)-1);BK.sim(200);BK.god=false;return BK.boss;};
      for(const [id,t] of [['stockade','chief'],['towpath','fogknight']]){const b=boot(id);const P=BK.P,R=BK.riposte();R.resetStats();const r={t:b&&b.t};if(!b){o[id]=r;continue;}
        P.x=b.x-24;P.y=b.y;P.face=1;P.grace=0;P.dodge=0;BK.keys.block=true;BK.sim(2);P.inv=0;P.hurt=0;P.grace=0;const res=BKT.damagePlayer(b.x,10,{who:b});BK.keys.block=false;
        r.res=res;r.open=+(b.rpOpenT||0).toFixed(2);r.bossOpen=BK.bossOpen(b);r.poiseMax=BK.combat2().poiseMax(b);
        let n=0;while(b.rpOpenT>0&&n<120){BK.sim(1);n++;}r.openFrames=n;r.ward=+(b.rpWardT||0).toFixed(2);
        for(let k=0;k<12&&!(R.stats.parries>1);k++){BK.keys.block=false;BK.sim(8);P.x=b.x-24;P.y=b.y;P.face=1;P.hurt=0;P.inv=0;P.grace=0;P.vx=0;BK.keys.block=true;BK.sim(2);P.inv=0;P.hurt=0;P.grace=0;r.blockT=P.blockT;r.res2=BKT.damagePlayer(b.x,10,{who:b});}r.par2=R.stats.parries;BK.keys.block=false;r.reopen=+(b.rpOpenT||0).toFixed(2);r.warded=R.stats.bossWarded;
        /* the poise bar, drawn under his health (a canvas of our own) */
        const c=document.createElement('canvas').getContext('2d');r.bar=R.drawPoiseBar(c,b,0,0,120);
        /* a break ends in the same ward */
        b.rpWardT=0;b.rpOpenT=0;b.poiseCd=0;b.broken=0;b.poise=0;BK.sim(1);b.poise=r.poiseMax-1;BK.combat2().strike(b,'heavy',10);r.broke=+(b.broken||0).toFixed(2);let m=0;while(b.broken>0&&m<300){BK.sim(1);m++;}BK.sim(1);r.wardAfterBreak=+(b.rpWardT||0).toFixed(2);
        o[id]=r;}
      return o;})()`);
    console.log('boss ' + JSON.stringify(out.boss));
    for (const [id, dur] of [['stockade', 0.5], ['towpath', 0.9]]) { const r = out.boss[id];
      assert.equal(r.res, 'blocked', id + ': his yellow blow parried');
      assert(Math.abs(r.open - dur) < 0.05 && r.bossOpen === true, id + ': OPEN ' + dur + ' s off a parry (a duelist longer), and openOf says so (' + JSON.stringify(r) + ')');
      assert(r.openFrames >= dur * 60 - 4 && r.openFrames <= dur * 60 + 16, id + ': and it lasts that long (' + r.openFrames + ' frames)');
      assert(r.ward > 2.5, id + ': then his B3 ward (' + r.ward + ')');
      assert(!(r.reopen > 0) && r.warded >= 1, id + ': a parry in the ward opens nothing (never a chain)');
      assert(r.bar === true, id + ': his poise bar draws');
      assert(r.broke > 0 && r.wardAfterBreak > 2.5, id + ': his poise break ends in the same ward (' + r.broke + ' / ' + r.wardAfterBreak + ')'); }
  }
  if (WANT.includes('chain')) {
    out.chain = await pg.evalp(`(()=>{const [e]=__set('knight',[['zombie',20]]);const P=BK.P,R=BK.riposte(),o={};const hit=v=>{const h0=e.hp;BKT.hurtAs(v,e,100,P.x,false);e.stagger=0;e.broken=0;e.poiseCd=9;return h0-e.hp;};
      o.mash=[];for(let i=0;i<8;i++){hit('light');o.mash.push(R.chainOf(P));BK.sim(10);}
      R.resetStats();o.mix=[];o.dmg=[];o.word=[];for(const v of ['light','heavy','sweep','rise','plunge','dash','shot','light']){o.dmg.push(hit(v));o.mix.push(R.chainOf(P));o.word.push(R.stats.mixedUp);BK.sim(10);}
      o.repeat=(hit('light'),R.chainOf(P));
      P.inv=0;P.hurt=0;BKT.damagePlayer(P.x+14,10,{});o.afterHit=R.chainOf(P);
      hit('light');hit('heavy');o.before=R.chainOf(P);BK.sim(200);o.idle=R.chainOf(P);
      o.poise=(()=>{e.broken=0;e.poiseCd=0;e.poise=0;P.mixN=0;P.mixLast=null;const p0=e.poise;P.heavySwing=false;BKT.hurtAs('plunge',e,10,P.x,true);const a=e.poise-p0;e.poise=0;e.broken=0;e.poiseCd=0;P.mixN=5;P.mixAt=BK.time;P.mixLast='x';BKT.hurtAs('plunge',e,10,P.x,true);return {bare:+a.toFixed(2),five:+e.poise.toFixed(2)};})();
      return o;})()`);
    console.log('chain ' + JSON.stringify(out.chain));
    const c = out.chain;
    assert(c.mash.every(n => n === 0), 'a mash (one verb, over and over) adds no pip: ' + c.mash);
    assert.deepEqual(c.mix.slice(0, 7), [0, 1, 2, 3, 4, 5, 5], 'each new verb adds a pip, five at most: ' + c.mix);
    assert(c.dmg[6] > c.dmg[0] * 1.25, 'five pips: about +30% damage (' + c.dmg + ')');
    /* (claude/riposteart, A STATED DESIGN CHANGE: MIXED UP is FOLDED INTO THE CHAIN. It was a parallel bonus - three different verbs in 4 s and the NEXT blow landed x1.5 and broke a common foe - beside the
       chain's own +6% a pip. That bonus is gone: three verbs mixed are now just three pips (+18%), and the chain says MIXED UP, once, as the third pip lands.) */
    assert(Math.max(...c.dmg) <= 135, 'no parallel MIXED UP bonus: no blow lands x1.5 over the chain (' + c.dmg + ')');
    assert.deepEqual(c.word.slice(0, 5), [0, 0, 0, 1, 1], 'the chain says MIXED UP once, at the third pip: ' + c.word);
    assert.equal(c.repeat, 5, 'repeating a verb neither adds nor removes');
    assert.equal(c.afterHit, 0, 'a blow taken resets the chain');
    assert(c.before === 1 && c.idle === 0, 'three seconds without landing one resets it');
    assert(c.poise.five > c.poise.bare * 1.2, 'the pips wear the poise bar faster by the same factor (' + JSON.stringify(c.poise) + ')');
  }
  assert.deepEqual(pg.errors, [], 'no page errors');
  console.log('the riposte: ' + WANT.join(', ') + ' hold.');
} finally { pg.close(); }
