// tools/damage-pct.mjs - DAMAGE % STAGGER (Smash-style) DOES WHAT THE BRIEF SAYS (claude/damagepct, scratch/brief-damagepct.md; src/damage-pct.js).
//   pure     the curves: a throw at 0% is a shove, ~72% the old fixed throw, 200% a launch (capped); the lift and the shove the same way; a heavy's
//            hitstun grows more than a light's; a boss's break up to +50% and no more; the gain - a heavy / a riposte worth more than a light cut,
//            the mix-up pips more on top, a boss's against a share of his health
//   gain     in the page: a hero blow builds the foe's %; a burn / a hazard / a foe's fire do not; MASHING one light verb builds it slower than
//            MIXED / HEAVY play for the same damage; out of combat it runs down, in a fight it holds
//   weight   the same heavy cut at 0% / 70% / 150%: further each time, a higher arc, and at 150% it TUMBLES; a brute at 150% still goes less far than a
//            small foe at 70% (the weight classes stay); an elite at 200% thrown into the spikes is still not killed; the hitstun grows with the %
//   boss     a boss is never thrown at any %; his poise break is longer at a high % (capped), the break spends it, and the B3 ward after it is unchanged
//   read     the readout draws: the % over a common foe (heat-coloured), beside an elite's health; the number fits at 320x180 (6 px)
// node tools/damage-pct.mjs [pure,gain,weight,boss,read] [sheet.png]      (PORT from the environment)
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import * as DP from '../src/damage-pct.js';
const WANT = process.argv[2] && !process.argv[2].endsWith('.png') ? process.argv[2].split(',') : ['pure', 'gain', 'weight', 'boss', 'read'];
const SHEET = process.argv.find(a => a.endsWith('.png'));
const ok = (c, m) => { assert(c, m); console.log('  ok  ' + m); };

if (WANT.includes('pure')) {
  console.log('pure');
  ok(DP.knockMul(0) <= 0.4 && Math.abs(DP.knockMul(72) - 1) < 0.03 && DP.knockMul(200) > 2 && DP.knockMul(999) === DP.knockMul(300), 'the throw: 0% a shove (' + DP.knockMul(0) + '), ~72% the old throw, 200% over twice it, capped');
  ok(DP.liftMul(0) < 1 && DP.liftMul(150) > 1.4 && DP.shoveMul(0) < 1 && DP.shoveMul(150) > 1.2, 'the arc and the shove grow the same way');
  ok(DP.stunMul(0, true) === 1 && DP.stunMul(150, true) > 1.8 && DP.stunMul(150, false) < 1.35 && DP.stunMul(999, true) === DP.stunMul(150, true), 'hitstun: a heavy\'s grows a lot, a light\'s a little, capped');
  ok(DP.breakMul(0) === 1 && Math.abs(DP.breakMul(150) - 1.5) < 1e-9 && DP.breakMul(300) === 1.5, 'a boss\'s break: up to +50%, capped');
  const g = (v, p = 0) => DP.gainOf(10, 100, v, p, false);
  ok(g('heavy') > 2.5 * g('cut') && g('riposte') > g('heavy') && g('cut', 3) > g('cut') * 1.25, 'gain: a heavy ~3x a light cut, a riposte more, the mix-up pips more on top (' + [g('cut'), g('heavy'), g('riposte'), g('cut', 3)].map(n => n.toFixed(1)).join(' / ') + ')');
  ok(DP.gainOf(10, 1000, 'heavy', 0, true) > DP.gainOf(10, 1000, 'heavy', 0, false) * 5, 'a boss\'s % is against a share of his health');
  ok(DP.heatOf(0) !== DP.heatOf(120) && DP.heatOf(120) === '#ff6b6b', 'the readout runs white -> red');
}

if (WANT.some(w => w !== 'pure')) {
  const { openPage } = await import('./cdp.mjs');
  const pg = await openPage({ audio: false, fonts: false });
  try {
    await pg.evalp(`(()=>{
      window.__set=(h,foes,o={})=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero(h);BK.reset({fresh:true});
        BKT.PROG.skillOwned[h]={};BKT.PROG.loadouts[h]=[];BK.applyUpgrades();BK.load(0);BK.state='play';BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');
        const L=BK.L;for(let x=2;x<90;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;
        for(const x of (o.spikes||[]))L.grid[21*L.W+x]=3;
        L.pools=[];BK.fires().length=0;BK.props().length=0;BK.tp(10,21);BK.sim(60);const P=BK.P;P.hp=P.maxHp;P.inv=0;P.st=P.maxSt;P.face=1;P.combo=0;P.riposteT=0;P.mixN=0;P.mixLast=null;
        BK.knockInto().reset();BK.damagePct().reset();
        return foes.map(([t,dx,eo])=>{BK.spawnEnt({t,x:(P.x+dx)/16,y:21,...(eo||{})});const e=BK.enemies().at(-1);e.hp=e.hp0=(eo&&eo.hp)||5000;e.cd=99;e.elT=99;e.face=-1;e.dmgPct=0;return e;});};
      window.__fly=(e,n=120)=>{let maxK=0,minY=e.y,spun=0;const x0=e.x,y0=e.y;for(let i=0;i<n;i++){BK.sim(1);if(e.pctTumble>0&&e.knock>0)spun=1;if(e.alive){maxK=Math.max(maxK,Math.abs(e.x-x0));minY=Math.min(minY,e.y);}}return {d:Math.round(maxK),up:Math.round(y0-minY),spun};};
      return 1;})()`);
    if (WANT.includes('gain')) {
      console.log('gain');
      const r = await pg.evalp(`(()=>{const o={};const P=BK.P,D=BK.damagePct();
        { const [e]=__set('knight',[['soldier',16,{hp:200}]]);BKT.hurtAs('light',e,10,P.x,false);o.light=+e.dmgPct.toFixed(2);e.dmgPct=0;e.stagger=0;
          BK.combat2().strike(e,'heavy',10);o.heavy=+e.dmgPct.toFixed(2); }
        { const [e]=__set('knight',[['soldier',16,{hp:200}]]);e.burn=1;e.burnTick=0;BK.sim(2);o.burnHurt=e.hp<200;o.burnPct=e.dmgPct||0;e.burn=0; }
        /* MASH: the same verb six times; MIXED: six verbs - the same damage each blow */
        { const [e]=__set('knight',[['soldier',16,{hp:400}]]);for(let i=0;i<6;i++){P.mixAt=BK.time;BKT.hurtAs('light',e,10,P.x,false);e.stagger=0;e.broken=0;e.poiseCd=9;}o.mash=+e.dmgPct.toFixed(1);o.mashDealt=400-e.hp; }
        { const [e]=__set('knight',[['soldier',16,{hp:400}]]);for(const v of ['light','heavy','sweep','rise','heavy','dash']){P.mixAt=BK.time;if(v==='heavy')BK.combat2().strike(e,'heavy',10);else BKT.hurtAs(v,e,10,P.x,false);e.stagger=0;e.broken=0;e.poiseCd=9;}o.mixed=+e.dmgPct.toFixed(1);o.mixedDealt=400-e.hp;o.pips=P.mixN; }
        { const [e]=__set('knight',[['soldier',16,{hp:400}]]);e.dmgPct=50;e.pctAt=BK.time;BK.sim(60);o.held=+e.dmgPct.toFixed(1);BK.sim(240);o.decayed=+e.dmgPct.toFixed(1); }
        return o;})()`);
      console.log('  ' + JSON.stringify(r));
      ok(r.light > 0 && r.heavy > r.light * 2.5, 'a hero blow builds the %: a light cut ' + r.light + '%, a heavy ' + r.heavy + '% for the same damage');
      ok(r.burnHurt && r.burnPct === 0, 'a burn hurts it and adds nothing to its %');
      ok(r.mixed > r.mash * 1.6, 'MASHING one light verb builds it slowly (' + r.mash + '% for ' + r.mashDealt + ') against MIXED / HEAVY play (' + r.mixed + '% for ' + r.mixedDealt + ', ' + r.pips + ' pips)');
      ok(r.held === 50 && r.decayed < r.held - 10, 'in a fight it holds (' + r.held + '%), out of combat it runs down (' + r.decayed + '%)');
    }
    if (WANT.includes('weight')) {
      console.log('weight');
      const r = await pg.evalp(`(()=>{const o={};const C=BK.combat2();
        for(const p of [0,70,150]){const [e]=__set('knight',[['sprig',14]]);e.face=1;e.dmgPct=p;C.strike(e,'heavy',40);o['kvy'+p]=Math.round(e.kvy||0);o['s'+p]=__fly(e);}
        { const [e]=__set('knight',[['brute',14]]);e.face=1;e.dmgPct=150;C.strike(e,'heavy',40);o.brute150=__fly(e); }
        { const [e]=__set('knight',[['brute',14,{elite:true,hp:400}]],{spikes:[12,13,14,15,16,17,18,19,20,21,22,23,24]});e.affix=null;e.hp=e.hp0=e.maxHp0=400;e.dmgPct=200;e.face=1;C.strike(e,'heavy',40);__fly(e,120);o.eliteAlive=e.alive;o.eliteInto=BK.knockInto().stats.into.spikes||0; }
        { const [e]=__set('knight',[['sprig',14,{hp:300}]],{spikes:[17,18,19,20,21,22,23,24,25,26]});e.face=1;e.dmgPct=0;C.strike(e,'heavy',20);__fly(e,120);o.spike0=!e.alive;
          const [f]=__set('knight',[['sprig',14,{hp:300}]],{spikes:[17,18,19,20,21,22,23,24,25,26]});f.face=1;f.dmgPct=130;C.strike(f,'heavy',20);__fly(f,120);o.spike130=!f.alive;o.words=BK.knockInto().stats.said; }
        for(const p of [0,150]){const [e]=__set('knight',[['soldier',30]]);e.dmgPct=p;BKT.hurtAs('light',e,5,BK.P.x,false);o['ls'+p]=+(e.stagger||0).toFixed(3);e.stagger=0;e.dmgPct=p;C.strike(e,'heavy',5);o['hs'+p]=+(e.stagger||0).toFixed(3);}
        return o;})()`);
      console.log('  ' + JSON.stringify(r));
      ok(r.s0.d < r.s70.d * 0.6 && r.s150.d > r.s70.d * 1.3, 'the same heavy cut at 0% / 70% / 150%: ' + r.s0.d + ' / ' + r.s70.d + ' / ' + r.s150.d + ' px (low % a shove, high % a launch)');
      ok(r.kvy150 < r.kvy70 && r.kvy70 < r.kvy0 && r.s150.up > r.s70.up, 'a higher arc at a higher % (lift ' + [r.kvy0, r.kvy70, r.kvy150].join(' / ') + ', rose ' + r.s150.up + ' px)');
      ok(r.s150.spun === 1 && r.s70.spun === 0, 'LAUNCHED at 150% it tumbles; at 70% it does not');
      ok(r.brute150.d < r.s70.d, 'a BRUTE at 150% still goes less far than a small foe at 70% (' + r.brute150.d + ' px): the weight classes stay');
      ok(r.eliteInto >= 1 && r.eliteAlive, 'an ELITE at 200% thrown into the spikes is still not killed');
      ok(!r.spike0 && r.spike130 && r.words.includes('INTO THE SPIKES'), 'the spikes 3+ tiles off: a fresh foe (0%) is only shoved short of them; worn to 130% the same heavy throws it in');
      ok(r.ls150 > r.ls0 && r.ls150 < r.ls0 * 1.4 && r.hs150 > r.hs0 * 1.7, 'the hitstun grows with the %: a light ' + r.ls0 + ' -> ' + r.ls150 + ' s, a heavy ' + r.hs0 + ' -> ' + r.hs150 + ' s');
    }
    if (WANT.includes('boss')) {
      console.log('boss');
      const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');const o={};
        const go=()=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero('knight');BK.reset({fresh:true});
          BK.load(LEVELS.findIndex(l=>l.id==='stockade'));BK.state='play';BK.god=true;const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+(A.reverse?-1:1),Math.round(A.floor/16)-1);BK.sim(200);BK.god=false;return BK.boss;};
        const brk=(b,p)=>{b.rpWardT=0;b.rpOpenT=0;b.poiseCd=0;b.broken=0;b.poise=0;BK.sim(1);b.dmgPct=p;b.poise=BK.combat2().poiseMax(b)-1;BK.combat2().strike(b,'heavy',1);return {broken:+(b.broken||0).toFixed(2),after:+(b.dmgPct||0).toFixed(1)};};
        const b=go();if(!b)return {none:true};o.t=b.t;const P=BK.P;P.x=b.x-20;
        o.b0=brk(b,0);let m=0;while(b.broken>0&&m<400){BK.sim(1);m++;}BK.sim(1);o.ward0=+(b.rpWardT||0).toFixed(2);
        o.b150=brk(b,150);m=0;while(b.broken>0&&m<400){BK.sim(1);m++;}BK.sim(1);o.ward150=+(b.rpWardT||0).toFixed(2);
        o.b300=brk(b,300);
        b.broken=0;b.dmgPct=300;const x0=b.x;BK.combat2().strike(b,'heavy',1);o.thrown=b.knock>0||!!b.kiWhy;BK.sim(30);o.dx=Math.round(Math.abs(b.x-x0));
        return o;})()`);
      console.log('  ' + JSON.stringify(r));
      ok(!r.none && !r.thrown, 'a BOSS is never thrown, at any % (' + r.t + ' at 300%)');
      ok(r.b150.broken > r.b0.broken * 1.4 && r.b300.broken <= r.b150.broken + 0.01, 'his poise break grows with his % - ' + r.b0.broken + ' s at 0%, ' + r.b150.broken + ' s at 150%, capped (' + r.b300.broken + ' s at 300%)');
      ok(r.b150.after < 10, 'the break spends his % (150 -> ' + r.b150.after + ': only the breaking blow own share starts the next count)');
      ok(r.ward0 > 2.5 && Math.abs(r.ward150 - r.ward0) < 0.05, 'the B3 ward after the break is unchanged (' + r.ward0 + ' / ' + r.ward150 + ' s)');
    }
    if (WANT.includes('read')) {
      console.log('read');
      const r = await pg.evalp(`(()=>{const o={};const P=BK.P;
        const [a,b,c]=__set('knight',[['soldier',40],['sprig',80],['brute',24,{elite:true,hp:400}]]);c.affix=null;a.dmgPct=37;a.pctAt=BK.time;b.dmgPct=124;b.pctAt=BK.time;c.dmgPct=61;c.pctAt=BK.time;
        BK.step(2);window.__textRec=[];BK.step(1);const rec=window.__textRec;window.__textRec=null;
        const pc=rec.filter(t=>/^\\d+%$/.test(t.s));o.n=pc.length;o.s=pc.map(t=>t.s);o.size=pc.map(t=>t.size);o.onScreen=pc.every(t=>t.x0>=0&&t.x0+t.w<=t.VW&&t.y0>=0&&t.y0+t.h<=t.VH);o.VW=rec[0]&&rec[0].VW;o.VH=rec[0]&&rec[0].VH;
        const v=BK.view;o.sheet=(()=>{const cv=document.createElement('canvas');cv.width=v.VW*3;cv.height=v.VH*3;const g=cv.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(v.buf,0,0,v.VW,v.VH,0,0,v.VW*3,v.VH*3);return cv.toDataURL('image/png');})();
        return o;})()`);
      const sheet = r.sheet; delete r.sheet; console.log('  ' + JSON.stringify(r));
      ok(r.s.includes('37%') && r.s.includes('124%') && r.s.includes('61%'), 'the % reads over a common foe and beside an elite\'s health (' + r.s.join(', ') + ')');
      ok(r.size.every(z => z === 6) && r.onScreen, 'at ' + r.VW + 'x' + r.VH + ': 6 px figures, on the screen');
      if (SHEET) { writeFileSync(SHEET, Buffer.from(sheet.split(',')[1], 'base64')); console.log('wrote ' + SHEET); }
    }
    const errs = pg.errors || [];
    assert(!errs.length, 'page errors: ' + JSON.stringify(errs).slice(0, 400));
  } finally { await pg.close(); }
}
console.log('damage-pct: ' + WANT.join(', ') + ' - all hold');
