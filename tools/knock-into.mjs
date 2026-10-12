// tools/knock-into.mjs - KNOCK FOES INTO THE LEVEL + THE ANTI-PLUNGE REWORK DO WHAT THE BRIEF SAYS (claude/knockinto, scratch/brief-combat2.md
// sections 1 and 4 '!! UPDATE'; src/knock-into.js, src/anti-plunge.js, src/foe-react.js REACT_AIR).
//   pure     the shared helper against stub worlds: hazardAt (spikes / a drop / deep water vs a swim / a turtle at home / fire / a foul pool /
//            the press / a level's own L.knockHazards row), deathBelow, the weight classes, throwWhy; the four reactions a-d (guards high
//            turns a plunge, the anti-air thrust is told then open, the sidestep only where the step is safe, catch + throw never into a death)
//   throw    in the page: a HEAVY cut throws a small foe far, a mid one about half, a BRUTE a step, an ELITE shorter; a boss is never thrown;
//            a RIPOSTE cut and the FINISHER-ON-BREAK throw (and the blow that broke him does not spend his opening); a guarded foe SLIDES
//   hazard   thrown INTO THE SPIKES it dies and says so; an ELITE is not killed (a share, put back at his post); a ledge over a death drop is
//            told OFF THE EDGE before it lands; thrown INTO THE FIRE it burns (a share, not a kill)
//   anti     THE SPIKE GOBLIN bristles (told) with a hero over him and only then bites a plunge - unbristled he is plunged like anyone;
//            a THORNED elite's plunge never counts toward his mash, lands while his spines are down, is SPIKED while they are up, and his
//            spines draw on his body; THE SPITTER sidesteps a plunge and stands OFF BALANCE, and a cut then finishes it
//   (claude/damagepct) the throw distance is the foe's DAMAGE % now: every foe here is set at 70% - the old fixed throw (tools/damage-pct.mjs asks the curve)
// node tools/knock-into.mjs [pure,throw,hazard,anti]      (PORT from the environment)
import assert from 'node:assert/strict';
import * as KI from '../src/knock-into.js';
import * as FR from '../src/foe-react.js';
import * as AP from '../src/anti-plunge.js';
const WANT = process.argv[2] ? process.argv[2].split(',') : ['pure', 'throw', 'hazard', 'anti'];
const ok = (c, m) => { assert(c, m); console.log('  ok  ' + m); };

if (WANT.includes('pure')) {
  console.log('pure');
  /* a stub world: 40 x 30 tiles, a floor at row 20, spikes at 10-11 on it, a pit (nothing to the bottom) at 20-22, a deep pool 26-29 */
  const T = { AIR: 0, SOLID: 1, SPIKE: 3 }, TS = 16, LH = 30, grid = new Map();
  for (let x = 0; x < 40; x++) for (let y = 20; y < LH; y++) if (!(x >= 20 && x <= 22) && !(x >= 26 && x <= 29 && y < 25)) grid.set(x + ',' + y, T.SOLID);
  for (const x of [10, 11]) grid.set(x + ',19', T.SPIKE);
  const pools = [{ x0: 26 * TS, x1: 30 * TS, y: 20 * TS, bottom: 25 * TS }, { x0: 32 * TS, x1: 34 * TS, y: 20 * TS, swim: true, harm: true, poison: true, bottom: 25 * TS }];
  const W = { TS, LH, T, tile: (x, y) => grid.get(x + ',' + y) || 0, standable: (x, y) => (grid.get(x + ',' + y) || 0) === T.SOLID, pools, props: [], fires: [], extra: [], amphib: e => e.t === 'turtle' };
  const at = (x, y, o = {}) => ({ x, y, t: 'sprig', w: 10, h: 12, ...o });
  ok(KI.hazardAt(at(10.5 * TS, 20 * TS), W, false).kind === 'spikes', 'spikes at the feet kill (walked or thrown)');
  ok(KI.hazardAt(at(5 * TS, 20 * TS), W, true) === null, 'open floor is nothing');
  ok(KI.hazardAt(at(21 * TS, (LH + 1) * TS), W, false).kind === 'drop', 'under the floor of the world is the drop');
  ok(KI.hazardAt(at(27 * TS, 22 * TS), W, false).kind === 'water' && KI.hazardAt(at(27 * TS, 22 * TS, { t: 'turtle' }), W, false) === null, 'deep water drowns a sprig; a turtle is home in it');
  ok(KI.hazardAt(at(33 * TS, 22 * TS), W, false) === null && KI.hazardAt(at(33 * TS, 22 * TS), W, true).kind === 'poison', 'a poison SWIM pool only takes a THROWN foe (a share, not a kill)');
  W.fires.push({ x: 6 * TS, y: 20 * TS, delay: 0 }); ok(KI.hazardAt(at(6 * TS + 4, 20 * TS), W, true).kind === 'fire' && KI.hazardAt(at(6 * TS + 4, 20 * TS), W, false) === null, 'a fire takes a thrown foe');
  W.fires.length = 0; W.props.push({ t: 'crusher', x: 14 * TS, y: 20 * TS, st: 'tell' }); ok(KI.hazardAt(at(14 * TS + 6, 20 * TS), W, true).kind === 'press', 'the press, told and coming down, holds a thrown foe under it');
  W.props[0].st = 'up'; ok(KI.hazardAt(at(14 * TS + 6, 20 * TS), W, true) === null, 'the press at rest is nothing');
  W.extra.push({ kind: 'lava', x0: 36 * TS, x1: 38 * TS, y0: 18 * TS, y1: 21 * TS }); ok(KI.hazardAt(at(37 * TS, 20 * TS), W, true).kind === 'lava', "a level's own L.knockHazards row (the Sonnet data pass) is read");
  ok(KI.deathBelow(21 * TS, 19 * TS, W) === true && KI.deathBelow(5 * TS, 19 * TS, W) === false && KI.deathBelow(27 * TS, 19 * TS, W) === false, 'deathBelow: the pit is a death drop; a floor or a pool is not');
  ok(KI.weightOf({ t: 'sprig' }) === 1 && KI.weightOf({ t: 'soldier' }) === KI.KNOCK.mid && KI.weightOf({ t: 'brute' }) === KI.KNOCK.brute && KI.weightOf({ t: 'brute', elite: true }) < KI.KNOCK.brute, 'weights: small 1, mid, brute a step, an elite shorter still');
  ok(KI.throwWhy({ riposte: true, heavy: true }) === 'riposte' && KI.throwWhy({ broke: true }) === 'broke' && KI.throwWhy({}) === null, 'throwWhy: the riposte and the break name the throw; a plain cut throws nothing');
  ok(KI.guardedOf({ t: 'shield', x: 100, face: -1 }, 60, FR.COVER) && !KI.guardedOf({ t: 'shield', x: 100, face: 1 }, 60, FR.COVER) && KI.guardedOf({ t: 'sprig', x: 100, face: 1, rxGuard: 0.5 }, 60, FR.COVER), "guarded: a cover kind's front toward the blow, or a raised guard - it slides");
  /* the reactions */
  const said = [], api = { say: (e, t) => said.push(t), sfx() {}, safeStep: x => !(x > 20 * TS && x < 23 * TS), offBalance: (e, s) => { e.broken = s; e.offBal = true; }, hitHero: (h, e, d) => { h.hp -= d; }, throwHero: (h, vx, vy) => { h.vx = vx; h.vy = vy; }, deathAt: x => x > 20 * TS && x < 23 * TS };
  const foe = (o = {}) => ({ x: 10 * TS, y: 20 * TS, w: 12, h: 16, alive: true, face: 1, ...o }), hero = (o = {}) => ({ x: 10 * TS, y: 20 * TS - 60, vy: 120, hp: 100, plunge: true, ground: false, ...o });
  { const e = foe(), h = hero(); for (let i = 0; i < 12; i++) FR.guardsHighTick(e, [h], 1 / 60); const r = FR.guardsHigh(e, h, api);
    ok(r && h.vy < 0 && !h.plunge && said.includes('GUARDS HIGH'), 'a: GUARDS HIGH - the guard up over his head turns the plunge (clank, the hero bounced, no damage)');
    const e2 = foe(); ok(!FR.guardsHigh(e2, hero(), api), 'a: a guard not yet up turns nothing (the pose is the read)'); }
  { said.length = 0; const e = foe(), h = hero({ plunge: false }); let t = 0; FR.antiAirTick(e, [h], 1 / 60, api); ok(e.aa === 'tell' && said.includes('!'), 'b: a hero above -> a TOLD thrust (a yellow !)');
    while (e.aa === 'tell' && t < 120) { FR.antiAirTick(e, [h], 1 / 60, api); t++; } ok(t >= 25, 'b: the tell holds ~0.45 s (' + t + ' frames)');
    h.y = e.y - 30; for (let i = 0; i < 12; i++) FR.antiAirTick(e, [h], 1 / 60, api); ok(h.hp < 100, 'b: a hero over him in the thrust is hit');
    let open = 0; for (let i = 0; i < 60; i++) { FR.antiAirTick(e, [h], 1 / 60, api); if (e.aaOpen > 0) open++; } ok(open >= 30, 'b: then the RECOVERY is open (the punish): ' + open + ' frames'); }
  { const e = foe(), h = hero({ x: 10 * TS + 4 }); FR.sidestepTick(e, [h], 1 / 60, api); ok(e.ssT > 0 && e.ssTo < e.x, 'c: a plunge coming down on it -> it hops aside, away from the hero');
    for (let i = 0; i < 20; i++) FR.sidestepTick(e, [h], 1 / 60, api); ok(e.offBal && Math.abs(e.x - (10 * TS - FR.REACT_AIR.sidestep.hop)) < 1, 'c: and lands OFF BALANCE');
    const c = foe({ x: 19 * TS + 8 }), hc = hero({ x: 19 * TS - 4 });   /* the pit is to its right, the hero to its left: away is into the pit */ FR.sidestepTick(c, [hc], 1 / 60, api); ok(c.ssT > 0 && c.ssTo < c.x, 'c: never steps into the pit - it takes the safe side');
    const nb = foe(), hp = hero({ plunge: false }); FR.sidestepTick(nb, [hp], 1 / 60, api); ok(!(nb.ssT > 0), 'c: a hero merely above (no plunge) is not sidestepped'); }
  { said.length = 0; const e = foe({ x: 14 * TS }), h = hero({ x: 14 * TS + 10, y: 20 * TS - 20 });   /* thrown his way (right) he would land in the pit */ FR.catchThrowTick(e, [h], 1 / 60, api); ok(e.ct === 'tell' && said.includes('!!'), 'd: a told grab (a red !!)');
    for (let i = 0; i < 60 && e.ct !== 'rec'; i++) FR.catchThrowTick(e, [h], 1 / 60, api); ok(e.ctN === 1 && h.vx < 0, 'd: caught in the window and thrown - to the SAFE side (away from the pit): vx ' + h.vx);
    ok(FR.safeThrowDir({ x: 30 * TS }, { x: 29 * TS }, { deathAt: () => true }) === 0, 'd: no safe side -> not thrown (set down)'); }
  /* the drawn spikes */
  { const K = { thornAt: 3, thornRoused: 2, mashWindow: 2 }; const e = { affix: 'THORNED', alive: true, ekCuts: 0 };
    ok(AP.thornedBristle(e, 10, K) === 0, 'e: THORNED unmashed: spines down'); e.ekCuts = 1; e.ekCutAt = 9.5; const k1 = AP.thornedBristle(e, 10, K); e.ekCuts = 2; const k2 = AP.thornedBristle(e, 10, K);
    ok(k1 > 0 && k2 > k1 && k2 < 1, 'e: they rise with each cut of a mash (' + k1.toFixed(2) + ' -> ' + k2.toFixed(2) + ')'); ok(AP.thornedBristle(e, 12, K) === 0, 'e: and go down when the flurry is over');
    e.mode = 'ekThornsTell'; ok(AP.thornedBristle(e, 12, K) === 1, 'e: full through the !!');
    const g = { a: 0, set fillStyle(v) {}, fillRect() { this.a++; } }; AP.drawSpines(g, 50, 50, 12, 16, 1, 1, 'thorned', 0, true); ok(g.a > 10, 'e: the spines are pixels on the body (' + g.a + ')');
    const t = { t: 'thorn', x: 100, y: 200, w: 12, h: 11, alive: true }; let first = 0; for (let i = 0; i < 30; i++) if (AP.thornTick(t, [{ x: 104, y: 150 }], 1 / 60, FR.heroAbove)) first++;
    ok(first === 1 && AP.thornSpiked(t), 'e: the Spike Goblin bristles (once told) with a hero over him and is spiked in ~0.3 s');
    const t2 = { t: 'thorn', x: 100, y: 200, w: 12, h: 11, alive: true }; AP.thornTick(t2, [{ x: 104, y: 150 }], 1 / 60, FR.heroAbove); ok(!AP.thornSpiked(t2), 'e: not on the first frame (no untold bite)'); }
}

if (WANT.some(w => w !== 'pure')) {
  const { openPage } = await import('./cdp.mjs');
  const pg = await openPage({ audio: false, fonts: false });
  try {
    await pg.evalp(`(()=>{
      window.__set=(h,foes,o={})=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero(h);BK.reset({fresh:true});
        BKT.PROG.skillOwned[h]={};BKT.PROG.loadouts[h]=[];BK.applyUpgrades();BK.load(0);BK.state='play';BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');
        const L=BK.L;for(let x=2;x<70;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;
        for(const x of (o.spikes||[]))L.grid[21*L.W+x]=3;
        for(const x of (o.pit||[]))for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=0;
        L.pools=[];BK.fires().length=0;BK.props().length=0;BK.tp(10,21);BK.sim(60);const P=BK.P;P.hp=P.maxHp;P.inv=0;P.st=P.maxSt;P.face=1;P.combo=0;P.riposteT=0;
        BK.knockInto().reset();
        return foes.map(([t,dx,eo])=>{BK.spawnEnt({t,x:(P.x+dx)/16,y:21,...(eo||{})});const e=BK.enemies().at(-1);e.hp=e.hp0=(eo&&eo.hp)||5000;e.cd=99;e.elT=99;e.face=-1;e.dmgPct=o.pct!==undefined?o.pct:70;return e;});};   /* (claude/damagepct) THE THROW IS THE FOE'S DAMAGE % NOW (src/damage-pct.js): these foes stand at 70%, where a throw goes as far as the old fixed one did (knockMul ~1) - tools/damage-pct.mjs asks 0% (a shove) against a launch */
      window.__words=()=>BK.knockInto().stats.said.concat(BK.textLab.nums().map(n=>n.txt).filter(t=>typeof t==='string'));
      window.__fly=(e,n=90)=>{let maxK=0;const x0=e.x;for(let i=0;i<n;i++){BK.sim(1);if(e.alive)maxK=Math.max(maxK,Math.abs(e.x-x0));}return Math.round(maxK);};
      return 1;})()`);
    if (WANT.includes('throw')) {
      console.log('throw');
      const r = await pg.evalp(`(()=>{const o={};const C=BK.combat2();
        for(const t of ['sprig','soldier','brute']){const [e]=__set('knight',[[t,14]]);e.face=1;C.strike(e,'heavy',40);o[t+'Kv']=Math.round(e.kvx||0);o[t]=__fly(e);}
        { const [e]=__set('knight',[['brute',14,{elite:true}]]);e.face=1;e.affix=null;C.strike(e,'heavy',40);o.eliteBruteKv=Math.round(e.kvx||0);o.eliteBrute=__fly(e); }
        { const [e]=__set('knight',[['sprig',14]]);e.face=1;C.strike(e,'light',1);o.lightWhy=e.kiWhy||null;o.lightKnock=+(e.knock||0).toFixed(2); }
        { const [e]=__set('knight',[['sprig',14]]);e.face=1;const P=BK.P;P.swingRiposte=true;P.atk=0;BKT.hurtAs('light',e,1,P.x,false);P.swingRiposte=false;o.riposte=__fly(e);o.ripWhy=e.kiWhy; }
        { const [e]=__set('knight',[['brute',14,{elite:true}]]);e.affix=null;e.face=1;const P=BK.P;e.broken=1.5;e.brokeAt=BK.time-1;P.heavySwing=true;P.heavy=false;P.atk=0;BKT.hurtAs('light',e,1,P.x,false);P.heavySwing=false;o.brokeWhy=e.kiWhy||null;o.brokeAfter=+(e.broken||0).toFixed(2);o.broke=__fly(e); }
        { const [e]=__set('knight',[['brute',14,{elite:true}]]);e.affix='UNSTOPPABLE';e.face=1;const P=BK.P;e.broken=1.5;e.brokeAt=BK.time-1;P.heavySwing=true;P.heavy=false;P.atk=0;BKT.hurtAs('light',e,1,P.x,false);P.heavySwing=false;o.brokeUnsWhy=e.kiWhy||null;o.brokeUnsAfter=+(e.broken||0).toFixed(2);o.brokeUns=__fly(e); }
        { const [e]=__set('knight',[['oathmaul',14,{elite:true}]]);e.affix=undefined;e.face=1;const P=BK.P;e.broken=1.5;e.brokeAt=BK.time-1;P.heavySwing=true;P.heavy=false;P.atk=0;BKT.hurtAs('light',e,1,P.x,false);P.heavySwing=false;o.brokeMaulWhy=e.kiWhy||null;o.brokeMaulAfter=+(e.broken||0).toFixed(2);o.brokeMaul=__fly(e); }
        { const [e]=__set('knight',[['sprig',14]]);e.face=1;C.strike(e,'light',1);e.broken=1.4;e.brokeAt=BK.time;const P=BK.P;P.heavySwing=true;P.heavy=false;P.atk=0;BKT.hurtAs('light',e,1,P.x,false);P.heavySwing=false;o.breakingBlowWhy=e.kiWhy||null;o.breakingKept=+(e.broken||0).toFixed(2); }
        { const [e]=__set('knight',[['soldier',14]]);e.face=-1;C.strike(e,'heavy',1);o.slideKvy=e.kvy;o.slideKv=Math.round(Math.abs(e.kvx||0));o.slide=__fly(e);o.slideWhy=e.kiWhy; }
        { const [e]=__set('knight',[['soldier',14]]);e.face=1;C.strike(e,'heavy',1);o.openKvy=e.kvy;o.openKv=Math.round(Math.abs(e.kvx||0));o.open=__fly(e); }
        return o;})()`);
      console.log('  ' + JSON.stringify(r));
      ok(r.sprig > 60, 'a HEAVY cut throws a small foe far (' + r.sprig + ' px)');
      ok(r.soldier < r.sprig * 0.8 && r.soldier > 10, 'a mid one less far (' + r.soldier + ' px)');
      ok(r.brute <= 34 && r.brute < r.soldier, 'a BRUTE a step (' + r.brute + ' px)');
      ok(r.eliteBruteKv < r.bruteKv && r.eliteBrute <= r.brute + 6, 'an ELITE brute shorter still (' + r.eliteBrute + ' px)');
      ok(r.lightWhy === null && r.lightKnock === 0, 'a plain light cut throws nothing (a shove, no flight)');
      ok(r.riposte > 60 && r.ripWhy === 'riposte', 'a RIPOSTE cut throws (' + r.riposte + ' px)');
      ok(r.brokeWhy === 'broke' && r.brokeAfter === 0 && r.broke > 5, 'the FINISHER-ON-BREAK throws a broken elite along the blow, spending the break (' + r.broke + ' px)');
      ok(r.brokeUnsWhy === 'broke' && r.brokeUns > 5 && r.brokeMaulWhy === 'broke' && r.brokeMaul > 5, 'a BROKEN UNSTOPPABLE elite and the order BRUTE are thrown by the finisher-on-break (claude/orderart: ' + r.brokeUns + ' / ' + r.brokeMaul + ' px)');
      ok(r.breakingBlowWhy !== 'broke' && r.breakingKept > 0, 'the blow that BROKE him does not spend his opening');
      ok(r.slideKvy === 0 && r.openKvy < 0 && r.slideKv < r.openKv && r.slideWhy === 'heavy', 'a foe guarding toward the blow SLIDES - a heavy that does not break his guard (no lift, ' + r.slideKv + ' px/s vs ' + r.openKv + ' px/s open)');
    }
    if (WANT.includes('throw')) {
      const b = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero('knight');BK.reset({fresh:true});
        BK.load(LEVELS.findIndex(l=>l.id==='stockade'));BK.state='play';BK.god=true;const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+(A.reverse?-1:1),Math.round(A.floor/16)-1);BK.sim(200);BK.god=false;const e=BK.boss;if(!e)return {none:true};
        const P=BK.P;P.x=e.x-20;const x0=e.x;BK.combat2().strike(e,'heavy',1);const thrown=e.knock>0||!!e.kiWhy;BK.sim(30);return {t:e.t,thrown,dx:Math.round(Math.abs(e.x-x0))};})()`);
      console.log('  boss ' + JSON.stringify(b));
      ok(!b.none && !b.thrown, 'a BOSS is never thrown (' + b.t + ': only staggered)');
    }
    if (WANT.includes('hazard')) {
      console.log('hazard');
      const r = await pg.evalp(`(()=>{const o={};const C=BK.combat2();
        { const [e]=__set('knight',[['sprig',14,{hp:200}]],{spikes:[15,16,17,18,19,20]});e.hp=200;e.face=1;C.strike(e,'heavy',20);__fly(e,90);o.spikeDead=!e.alive;o.spikeWords=__words();o.spikeInto=BK.knockInto().stats.into.spikes||0; }
        { const [e]=__set('knight',[['sprig',14,{hp:200}]],{spikes:[15,16,17,18,19,20]});e.hp=200;e.x+=40;BK.sim(1);/* walked onto them, not thrown: the old word */ }
        { const [e]=__set('knight',[['brute',14,{elite:true,hp:400}]],{spikes:[12,13,14,15,16,17,18]});e.affix=null;e.hp=e.hp0=e.maxHp0=400;const x0=e.x;e.face=1;e.x=BK.P.x+14;const xs=e.x;C.strike(e,'heavy',40);o.eliteHit=400-e.hp;__fly(e,90);o.eliteAlive=e.alive;o.eliteLost=400-e.hp-o.eliteHit;o.eliteInto=BK.knockInto().stats.into.spikes||0;o.eliteBack=Math.abs(e.x-xs)<20;o.eliteWords=__words(); }
        { const [e]=__set('knight',[['sprig',14,{hp:200}]],{pit:[16,17,18,19,20,21,22,23]});e.hp=200;e.face=1;C.strike(e,'heavy',20);let saidAt=-1,deadAt=-1;for(let i=0;i<180;i++){BK.sim(1);if(saidAt<0&&e.kiEdge)saidAt=i;if(deadAt<0&&!e.alive)deadAt=i;}o.edgeSaid=saidAt;o.edgeDead=deadAt;o.edgeWords=__words(); }
        { const [e]=__set('knight',[['sprig',14,{hp:200}]]);e.hp=200;e.hp0=200;e.face=1;const P=BK.P;for(let k=40;k<=140;k+=12)BK.fires().push({x:P.x+k,y:22*16,life:99,delay:0});C.strike(e,'heavy',20);const h1=e.hp;let n=0;while(!e.kiHz&&n<90){BK.sim(1);n++;}BK.sim(1);o.fireHit=200-h1;o.fireAlive=e.alive;o.fireLost=h1-e.hp;o.fireBurn=+(e.burn||0).toFixed(2);o.fireInto=BK.knockInto().stats.into.fire||0;BK.fires().length=0; }
        return o;})()`);
      console.log('  ' + JSON.stringify(r));
      ok(r.spikeDead && r.spikeInto === 1 && r.spikeWords.includes('INTO THE SPIKES'), 'thrown INTO THE SPIKES: it dies, and it is said');
      ok(r.eliteInto === 1 && r.eliteAlive && r.eliteLost >= 90 && r.eliteLost <= 120 && r.eliteBack, 'an ELITE thrown into the spikes is NOT killed: a quarter of his bar, and back where he was thrown from (' + r.eliteLost + ')');
      ok(r.edgeSaid >= 0 && r.edgeDead > r.edgeSaid && r.edgeWords.includes('OFF THE EDGE'), 'a ledge over a death drop: OFF THE EDGE is told (frame ' + r.edgeSaid + ') before it dies at the bottom (frame ' + r.edgeDead + ')');
      ok(r.fireInto === 1 && r.fireAlive && r.fireLost >= 80 && r.fireBurn > 0, 'thrown INTO THE FIRE: a share of it and alight, not a kill (' + r.fireLost + ', burn ' + r.fireBurn + ')');
    }
    if (WANT.includes('anti')) {
      console.log('anti');
      const r = await pg.evalp(`(()=>{const o={};
        const drop=(e,above,wait)=>{const P=BK.P,K=BK.keys;P.x=e.x;P.y=e.y-(above||40);P.vx=0;P.vy=0;P.ground=false;P.plunge=false;P.atk=-1;P.dodge=0;P.inv=0;P.hurt=0;P.face=1;
          if(wait){for(let i=0;i<wait;i++){P.x=e.x;P.y=e.y-(above||40);P.vy=0;BK.sim(1);}}
          const hp0=P.hp,eh0=e.hp,brk=+(e.brK||0).toFixed(2);K.down=true;BK.press('atk');for(let k=0;k<50;k++){BK.sim(1);if(k>2)K.down=false;if(P.ground)break;}K.down=false;return {heroLost:hp0-P.hp,foeLost:eh0-e.hp,brk};};
        { const [e]=__set('knight',[['thorn',40]]);e.mode='rest';e.modeT=99;e.brK=0;const r1=drop(e,26,0);o.thornCaught=r1;o.thornBrk0=+(e.brK||0).toFixed(2); }
        { const [e]=__set('knight',[['thorn',40]]);e.mode='rest';e.modeT=99;e.brK=0;const r2=drop(e,60,40);o.thornBristled=r2;o.thornBrk=+(e.brK||0).toFixed(2); }
        { const [e]=__set('knight',[['brute',40,{elite:true}]]);e.affix='THORNED';e.ekCuts=0;e.mode='walk';const r3=drop(e,40,0);o.thornedDown=r3;o.thornedCuts=e.ekCuts||0;
          e.ekCuts=2;e.ekCutAt=BK.time;const r4=drop(e,40,0);o.thornedUp=r4; }
        { const [e]=__set('knight',[['spit',40]]);const x0=e.x;const P=BK.P,K=BK.keys;P.x=e.x+2;P.y=e.y-70;P.vy=0;P.ground=false;P.inv=0;K.down=true;BK.press('atk');
          let hopped=0,off=0;for(let k=0;k<40;k++){BK.sim(1);if(k>2)K.down=false;if(Math.abs(e.x-x0)>12)hopped=1;if(e.broken>0)off=1;if(P.ground)break;}K.down=false;
          o.spitHop=Math.round(Math.abs(e.x-x0));o.spitOff=off;o.spitHp=e.hp;o.spitWords=__words();
          P.face=Math.sign(e.x-P.x)||1;P.x=e.x-P.face*14;BK.sim(1);BK.press('atk');for(let k=0;k<30&&e.alive;k++)BK.sim(1);o.spitFinished=!e.alive; }
        return o;})()`);
      console.log('  ' + JSON.stringify(r));
      ok(r.thornCaught.heroLost === 0 && r.thornCaught.foeLost > 0, 'the Spike Goblin plunged before his spikes are up: he takes it, the hero does not (no untold 20)');
      ok(r.thornBristled.heroLost > 0 && r.thornBristled.brk === 1 && r.thornCaught.brk === 0, 'over him a beat, his back BRISTLES (told) - then a plunge is SPIKED (' + r.thornBristled.heroLost + ')');
      ok(r.thornedCuts === 0, 'a THORNED elite: the plunge does not count toward his mash');
      ok(r.thornedDown.heroLost === 0 && r.thornedDown.foeLost > 0, 'his spines down: he is plunged like anyone');
      ok(r.thornedUp.heroLost > 0 && r.thornedUp.foeLost === 0, 'his spines up (a mash): the plunge is SPIKED');
      ok(r.spitHop >= 15 && r.spitOff === 1 && r.spitWords.includes('OFF BALANCE'), 'THE SPITTER sidesteps the plunge (' + r.spitHop + ' px) and stands OFF BALANCE');
      ok(r.spitFinished, 'and a quick cut then finishes it');
    }
    const errs = pg.errors || [];
    assert(!errs.length, 'page errors: ' + JSON.stringify(errs).slice(0, 400));
  } finally { await pg.close(); }
}
console.log('knock-into: ' + WANT.join(', ') + ' - all hold');
