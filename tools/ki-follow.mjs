// tools/ki-follow.mjs - THE KNOCK-INTO FOLLOW-UP DOES WHAT THE BRIEF SAYS (claude/kifollow, scratch/brief-combat2.md '!! 10-11 16:35').
//   pure     the art + data tables (src/ki-art.js, src/knock-data.js): the spines are keyed 0 / 1 / 2 / full / fire with a layout per elite body, the armed
//            ramps (urchin / jelly / grub / marshlight), every hazard kind has an entry burst, the Deep Rails' lava and every quicksand patch become rows,
//            a killing row is found for a thrown common foe, the poses (hop, wobble, braced slide) move the body
//   page     ARMED-ONLY TOUCH: the spitter no longer hurts on touch; the grub / marshlight / urchin / jelly hurt on touch ONLY once their drawn state is full
//            (arK 1); a worn foe thrown into a lava row dies INTO THE LAVA; a tumble ends with the dizzy stars; a slide is flagged for its braced pose
// node tools/ki-follow.mjs [pure,page]      (PORT from the environment)
import assert from 'node:assert/strict';
import * as KA from '../src/ki-art.js';
import * as KD from '../src/knock-data.js';
import * as KI from '../src/knock-into.js';
import * as FR from '../src/foe-react.js';
const WANT = process.argv[2] ? process.argv[2].split(',') : ['pure', 'page'];
const ok = (c, m) => { assert(c, m); console.log('  ok  ' + m); };
const ctx = () => ({ n: 0, cols: new Set(), set fillStyle(v) { this.cols.add(v); }, fillRect() { this.n++; }, set globalAlpha(v) {} });

if (WANT.includes('pure')) {
  console.log('pure');
  /* spines */
  ok(['husk', 'thorn', 'shield', 'hearthgob', 'troll', 'brute', 'scarecrow', 'armour'].every(k => KA.SPINE_BODY[k]), 'a spine layout for each elite body: husk, thorn, shield, hearthgob, troll, brute, scarecrow, armour');
  ok(KA.spineStage(0) === 0 && KA.spineStage(0.2) === 1 && KA.spineStage(0.6) === 2 && KA.spineStage(1) === 3, 'the keyed rise: 0 / 1 (nubs) / 2 (half) / 3 (full)');
  {
    const px = look => { const out = []; for (const [k, fire] of [[0, false], [0.2, false], [0.6, false], [1, false], [1, true]]) { const g = ctx(); KA.drawSpinesK(g, 50, 60, 12, 16, k, 1, look, 0, false, fire); out.push(g.n); } return out; };
    for (const look of Object.keys(KA.SPINE_BODY)) { const a = px(look); ok(a[0] === 0 && a[1] > 0 && a[2] > a[1] && a[3] > a[2] && a[4] >= a[3], 'spines (' + look + '): nothing, nubs, half, full, then the fire frame never smaller (' + a.join('/') + ')'); }
    const t = px('troll'), h = px('husk'); ok(t[3] > h[3], 'the troll carries more (longer, thicker) spines than the husk');
    const g1 = ctx(); KA.drawSpinesK(g1, 50, 60, 12, 16, 1, 1, 'shield', 0, false, false); const g2 = ctx(); KA.drawSpinesK(g2, 50, 60, 12, 16, 1, 1, 'husk', 0, false, false); ok(g1.n !== g2.n, 'and the layouts differ per body (shield studded through the front)');
  }
  /* armed */
  {
    const e = { t: 'urchin', bristle: 0 }; KA.armUpdate(e, 0.1, null); ok(!KA.armed(e), 'urchin: calm, not armed');
    e.bristle = 1; let first = -1; for (let i = 1; i <= 60; i++) { KA.armUpdate(e, 1 / 60, null); if (first < 0 && KA.armed(e)) first = i; } ok(first >= 12 && first <= 20, 'urchin: the needles rise over ~0.28 s, then it stings (frame ' + first + ')');
    e.bristle = 0; for (let i = 0; i < 20; i++) KA.armUpdate(e, 1 / 60, null); ok(e.arK < 1 && e.arK > 0, 'urchin: and they settle slowly (a part-risen one does not sting)');
  }
  { const e = { t: 'jelly', alpha: 0.4 }; KA.armUpdate(e, 1 / 60); ok(!KA.armed(e) && e.arK === 0, 'jelly: dim = limp tentacles'); e.alpha = 0.53; KA.armUpdate(e, 1 / 60); ok(e.arK > 0 && e.arK < 1, 'jelly: brightening = the tentacles stir (not armed)'); e.alpha = 0.7; KA.armUpdate(e, 1 / 60); ok(KA.armed(e), 'jelly: at the bright end of its clock = fanned = armed'); }
  { const e = { t: 'grub', x: 100, y: 100, mode: 'crawl' }, P = { x: 300, y: 108, dead: false }; KA.armUpdate(e, 0.5, P); ok(!KA.armed(e), 'grub: nobody near, not flared');
    P.x = 110; for (let i = 0; i < 30; i++) KA.armUpdate(e, 1 / 60, P); ok(KA.armed(e), 'grub: a hero at its side, it beads and flares (' + e.arK.toFixed(2) + ')'); }
  { const e = { t: 'marshlight', mode: 'lure', modeT: 0 }; KA.armUpdate(e, 1 / 60); ok(e.arK === 0, 'marshlight: drifting, calm'); e.mode = 'flareTell'; e.modeT = 0.3; KA.armUpdate(e, 1 / 60); ok(e.arK > 0 && e.arK < 1, 'marshlight: the corona GROWS through the tell (not armed)'); e.mode = 'flare'; KA.armUpdate(e, 1 / 60); ok(KA.armed(e), 'marshlight: armed only in the flare itself'); }
  for (const t of KA.ARMED) { const g0 = ctx(), g1 = ctx(), g2 = ctx(); KA.drawArmed(g0, { t, arK: 0 }, 50, 50, 0, false); KA.drawArmed(g1, { t, arK: 0.5, face: 1 }, 50, 50, 0, false); KA.drawArmed(g2, { t, arK: 1, face: 1 }, 50, 50, 0, false); ok(g0.n < g1.n && g1.n > 0 && g2.n > g1.n, t + ': the armed state is drawn - calm (nothing / the urchin folded nubs), the rising state, the full state (' + g0.n + '/' + g1.n + '/' + g2.n + ' marks)'); }
  ok(KA.ARMED.size === 4 && !KA.ARMED.has('spit') && !KA.ARMED.has('wisp'), 'the armed set is urchin / jelly / grub / marshlight (the spitter and the wisp are not touch hazards)');
  /* entry fx */
  for (const kind of Object.keys(KI.HAZ)) { const parts = []; KA.entryFx(kind, 50, 50, { parts, ring: () => {} }); ok(parts.length >= 5, 'entry FX for ' + kind + ' (' + parts.length + ' particles)'); }
  /* data */
  {
    const TS = 16, rows = KD.knockRows('minecart', { decor: [{ kind: 'lava', x0: 615, x1: 624, row: 43 }, { kind: 'buffer', x: 633, row: 37 }] }, TS, 60);
    ok(rows.length === 1 && rows[0].kind === 'lava' && rows[0].x0 === 615 * TS && rows[0].x1 === 625 * TS && rows[0].y1 === 60 * TS, "the Deep Rails' lava decor row becomes a knockHazards row");
    const q = KD.knockRows('caravan', { quicksand: [{ x0: 100, x1: 200, y: 320 }] }, TS, 60); ok(q.length === 1 && q[0].kind === 'sand' && KI.HAZ.sand.hold > 0 && !KI.HAZ.sand.kill, 'every quicksand patch is a SAND row: it holds a thrown foe, it never kills one');
    const own = KD.knockRows('wood', { knockHazards: [{ kind: 'lava', x0: 1, x1: 2, y0: 3, y1: 4 }] }, TS, 60); ok(own.length === 1, "a level's own rows are kept");
  }
  {
    const W = { TS: 16, LH: 60, T: { SPIKE: 3 }, tile: () => 0, pools: [], extra: [{ kind: 'lava', x0: 100, x1: 200, y0: 300, y1: 600 }, { kind: 'fire', x0: 0, x1: 50, y0: 0, y1: 50 }] };
    ok(KI.killRowAt({ x: 150, y: 400 }, W) && KI.killRowAt({ x: 150, y: 400 }, W).kind === 'lava' && !KI.killRowAt({ x: 150, y: 100 }, W) && !KI.killRowAt({ x: 20, y: 20 }, W), 'killRowAt: a lava row kills inside its box, not above it, and a fire row is not a kill');
  }
  /* poses */
  {
    const S = FR.REACT_AIR.sidestep, mk = () => ({ dx: 0, dy: 0, sx: 1, sy: 1 });
    const o = mk(); KA.kiPose(o, { ssT: 0.18, ssFrom: 100, ssTo: 122 }, 0, false, S); ok(o.sy < 1, 'hop: crouching at the start');
    const o2 = mk(); KA.kiPose(o2, { ssT: 0.1, ssFrom: 100, ssTo: 122 }, 0, false, S); ok(o2.sy > 1 && o2.rot > 0, 'hop: stretched and leaning into the hop in the air');
    const o3 = mk(); KA.kiPose(o3, { ssT: 0, broken: 0.5, offBalAt: 0 }, 0.1, false, S); ok(o3.rot !== undefined && Math.abs(o3.rot) > 0, 'wobble: OFF BALANCE teeters');
    const o4 = mk(); KA.kiPose(o4, { kiSlide: true, knock: 0.3, kvx: 80 }, 0, false, S); ok(o4.rot < 0 && o4.sx > 1, 'slide: a guarded foe sliding right leans back into the blow');
  }
}

if (WANT.includes('page')) {
  console.log('page');
  const { openPage } = await import('./cdp.mjs');
  const pg = await openPage({ audio: false, fonts: false });
  try {
    await pg.evalp(`(()=>{
      window.__set2=(h,foes,o={})=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero(h);BK.reset({fresh:true});
        BKT.PROG.skillOwned[h]={};BKT.PROG.loadouts[h]=[];BK.applyUpgrades();BK.load(0);BK.state='play';BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');
        const L=BK.L;for(let x=2;x<70;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;
        L.pools=o.pool?[{x0:6*16,x1:40*16,y:17*16,bottom:22*16,swim:true,clear:true}]:[];BK.fires().length=0;BK.props().length=0;BK.tp(o.pool?20:10,o.pool?19:21);BK.sim(60);const P=BK.P;P.hp=P.maxHp=9999;P.inv=0;P.st=P.maxSt;P.face=1;
        return foes.map(([t,dx,eo])=>{BK.spawnEnt({t,x:(P.x+dx)/16,y:o.pool?19:21,...(eo||{})});const e=BK.enemies().at(-1);e.cd=99;e.elT=99;e.timer=99;return e;});};
      window.__touch=(e,n)=>{const P=BK.P;let viol=0,hurts=0,armedFrames=0;for(let i=0;i<n;i++){P.inv=0;P.hurt=0;P.x=e.x;P.y=e.y+(e.t==='jelly'?-4:0);const hp0=P.hp,k0=e.arK||0;BK.sim(1);const k1=e.arK||0;if(k1>=1)armedFrames++;if(P.hp<hp0){hurts++;if(k0<1&&k1<1)viol++;}}return {viol,hurts,armedFrames};};
      return 1;})()`);
    const r = await pg.evalp(`(()=>{const o={};
      { const [e]=__set2('knight',[['spit',0]]);o.spit=__touch(e,180); }
      { const [e]=__set2('knight',[['grub',0]]);const P=BK.P;let early=0;for(let i=0;i<12;i++){P.inv=0;P.x=e.x;P.y=e.y;const h=P.hp;BK.sim(1);if(P.hp<h)early++;}o.grubEarly=early;o.grub=__touch(e,240); }
      { const [e]=__set2('knight',[['marshlight',0]]);e.cd=0;o.marsh=__touch(e,300); }
      { const [e]=__set2('knight',[['urchin',0]],{pool:true});o.urchinT=e&&e.t;o.urchin=e?__touch(e,300):null; }
      { const [e]=__set2('knight',[['jelly',0]],{pool:true});o.jellyT=e&&e.t;if(e){e.per=e.per||6;o.jelly=__touch(e,720);} }
      return o;})()`);
    console.log('  ' + JSON.stringify(r));
    ok(r.spit.hurts === 0, 'THE SPITTER does not hurt on touch (a hero stood inside it for 3 s: ' + r.spit.hurts + ' hits)');
    ok(r.grubEarly === 0 && r.grub.hurts > 0 && r.grub.viol === 0, 'the CAVE GRUB: not on the first 0.2 s, then it flares and burns - never while unflared (' + r.grub.hurts + ' hits, ' + r.grub.viol + ' unarmed)');
    ok(r.marsh.hurts > 0 && r.marsh.viol === 0, 'the MARSHLIGHT: hurts only in its flare (' + r.marsh.hurts + ' hits, ' + r.marsh.viol + ' unarmed)');
    ok(r.urchinT === 'urchin' && r.urchin.hurts > 0 && r.urchin.viol === 0, 'the URCHIN: stings once its needles are up, never before (' + r.urchin.hurts + ' hits, ' + r.urchin.viol + ' unarmed)');
    ok(r.jellyT === 'jelly' && r.jelly.viol === 0 && r.jelly.armedFrames > 0 && r.jelly.armedFrames < 720, 'the JELLYFISH: armed only at the bright end of its clock (' + r.jelly.armedFrames + ' of 720 frames), and nothing unarmed hurt (' + r.jelly.hurts + ' hits)');
    /* lava + tumble + slide */
    const t = await pg.evalp(`(()=>{const o={};const C=BK.combat2();
      { const [e]=__set2('knight',[['sprig',14]]);const L=BK.L;
        for(let x=13;x<=40;x++)for(let y=22;y<L.H;y++)L.grid[y*L.W+x]=0;
        L.knockHazards=[{kind:'lava',x0:13*16,x1:41*16,y0:22*16+2,y1:L.H*16}];
        e.hp=e.hp0=300;e.face=1;e.dmgPct=250;BK.knockInto().reset();C.strike(e,'heavy',5);o.tumbling=e.pctTumble>0;for(let i=0;i<200;i++){BK.sim(1);if(!e.alive)break;}
        o.lavaDead=!e.alive;o.lavaWords=BK.knockInto().stats.said.slice();o.lavaInto=BK.knockInto().stats.into.lava||0; }
      { const [e]=__set2('knight',[['sprig',14]]);e.hp=e.hp0=5000;e.face=1;e.dmgPct=250;C.strike(e,'heavy',5);let dz=false;for(let i=0;i<80;i++){BK.sim(1);if(e.tumDizzy>BK.time)dz=true;}o.dizzy=dz; }
      { const [e]=__set2('knight',[['soldier',14]]);e.face=-1;C.strike(e,'heavy',1);o.slide=!!e.kiSlide; }
      { const [e]=__set2('knight',[['sprig',14]]);e.face=1;e.hp=e.hp0=5000;C.strike(e,'light',1);o.noSlide=!e.kiSlide; }
      return o;})()`);
    console.log('  ' + JSON.stringify(t));
    ok(t.lavaDead && t.lavaInto === 1 && t.lavaWords.includes('INTO THE LAVA') && !t.lavaWords.includes('OFF THE EDGE'), 'a worn foe thrown into a lava row (the Deep Rails kind) dies and says INTO THE LAVA');
    ok(t.dizzy, 'a TUMBLE (a launch past 100%) lands with the stars');
    ok(t.slide && t.noSlide, 'a guarded foe is flagged as sliding (the braced pose); a plain hit is not');
    /* the REAL levels carry their rows: the Deep Rails' lava, the Sunken Caravan's quicksand */
    const lv = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');const o={};
      for(const id of ['minecart','caravan']){const i=LEVELS.findIndex(l=>l.id===id);if(i<0){o[id]=null;continue;}BK.manualSimulation=true;BK.load(i);o[id]=(BK.L.knockHazards||[]).map(r=>[r.kind,Math.round(r.x0/16),Math.round(r.x1/16),Math.round(r.y0/16),Math.round(r.y1/16)]);o[id+'H']=BK.L.H;}
      return o;})()`);
    console.log('  ' + JSON.stringify(lv));
    ok(lv.minecart && lv.minecart.some(r => r[0] === 'lava' && r[1] === 615 && r[2] === 625), "THE DEEP RAILS loads its lava row (x 615-624, from its decor)");
    ok(lv.caravan === null || lv.caravan.every(r => r[0] === 'sand'), 'THE SUNKEN CARAVAN lists its quicksand as sand rows (' + (lv.caravan ? lv.caravan.length : 'n/a') + ')');
    const errs = pg.errors || [];
    assert(!errs.length, 'page errors: ' + JSON.stringify(errs).slice(0, 400));
  } finally { await pg.close(); }
}
console.log('ki-follow: ' + WANT.join(', ') + ' - all hold');
