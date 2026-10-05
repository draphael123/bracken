// tools/rule-openings.mjs - THE LEVEL'S RULE IS AN OPENING ON ITS BOSS, AND BOSS WAVE 2's GAME-WIDE RULES (claude/bosswave2, 2026-10-05).
// Daniel 10-03 (scratch/audit-rules.md): three bosses ignored their level's rule; each gets ONE rule-based opening, retrofitted. And his
// BOSS WAVE 2 interview: poise fills from heavies only outside an opening, and a mini's opening is worth a third of him at most.
// Played in the real page through the real input (a swing that meets the winch, the bell, the rune), the boss stood where the test says:
//   lance     STORMHOLD (THREE GATES): from the middle lookout, the BRIDGE GATE's winch struck while the Lance stands under it brings the bars
//             down on HIM - planted (lanceOpen), 3 s or more, open; struck while he is a stride off, it only shuts the lane (its tiles close)
//   gqueen    HIGHCROWN (EVERY HALL HAS A BELL, AND A GATE THAT DROPS WITH IT): the hall bell struck while she stands under its grate pins her
//             (gqPin, by 'grate'), 3 s or more, open; rung while she is elsewhere it only shuts the hall
//   gargoyle  THE WITCHLIGHT STAIR (RUNES LIFT): the rune column struck while he flies in it turns him over - he crashes onto the spikes and
//             lies STUNNED (his one opening) 3 s or more; struck while he is out of it, nothing happens to him and it goes dark to recharge
//   herald    under WEIGHT: one mire is at most HERALD_MIRE_TAKE of him - he drags himself out after it
//   poise     a boss outside his opening: a tap fills nothing of his bar, a held heavy blow does
//   minicap   (node) a mini's opening shuts after a third of him (src/boss-greed.js miniCap): the rest is his outside value, until it ends
// PROVED RED FIRST on master 2423ff42 (no gate, bell, rune or cap there: every row of the page fails, and the node rows throw).
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import * as GB from '../src/boss-greed.js';

/* THE MINI CAP, in node: a chip mini (the Serjeant) in his opening */
{ const e = { t: 'lancer', xpRole: 'mini', maxHp: 120, hp: 120, open: 3, alive: true }; let said = 0;
  assert.equal(GB.openOf(e), true, 'minicap: the lancer with e.open is open');
  let took = 0; for (let i = 0; i < 6; i++) { const d = GB.miniCap(e, GB.chipOf(e, 15, 15), 15, () => said++);   /* (bossChip's order: the chip, then the cap) */ took += d; e.hp -= d; }
  assert.ok(took >= 40 && took <= 43, 'minicap: six blows of 15 in one opening take a third of 120 (40) and then scratches: ' + took);
  assert.equal(said, 1, 'minicap: HE GATHERS HIMSELF is told once');
  assert.equal(GB.openOf(e), false, 'minicap: once he has given his third, he is shut');
  e.open = 0; GB.capStep(e); assert.equal(e.capShut, false, 'minicap: the opening over, the purse is full again');
  e.open = 3; assert.equal(GB.openOf(e), true, 'minicap: and the next opening opens him');
  const own = { t: 'greathound', xpRole: 'mini', maxHp: 90, hp: 90, open: 3, alive: true };
  assert.equal(GB.miniCap(own, 80, 80), 80, 'minicap: the hound caps its own windows (MINI_OWN_CAP): left alone'); }

const pg = await openPage({ audio: false, fonts: false });
let r;
try {
  r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');const out={};
    const setup=(id,h,t)=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero(h);BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id===id));BK.state='play';BK.god=false;BK.sim(5);
      const A=BK.L.arena;if(A.start)BK.tp(A.start[0],A.start[1]);else BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);for(let i=0;i<200;i++){BK.P.hp=BK.P.maxHp;BK.P.inv=9;BK.sim(1);}
      const q=BK.enemies().find(e=>e.t===t&&e.alive);for(const e of BK.enemies())if(e!==q&&!e.maxHp)e.alive=false;return {A,q,P:BK.P};};
    const swing=(face,n=40,each)=>{const P=BK.P;P.face=face;P.atk=-1;BK.press('atk');for(let i=0;i<n;i++){P.hp=P.maxHp;P.inv=9;if(each)each();BK.sim(1);}};
    const hold=q=>{q.vx=0;q.modeT=99;for(const k of ['chargeT','thrustT','sweepT','bashT','vaultT','javT','galeT','rushT','whirlT','slamT','chargeT','decreeT','throwT2','chandT','gLeapT','shadowT','leapT','courtT','cd'])if(q[k]!==undefined||k==='cd')q[k]=99;};
    /* ---- THE LANCE and the BRIDGE GATE ---- */
    for (const under of [true,false]) { const {q,P}=setup('storm','knight','lance');const w=BK.props().find(p=>p.t==='winch'&&p.bossGate);
      if(!w){out.lance={noGate:true};break;}
      const gx=w.gate*16+8;q.mode='pace';hold(q);q.x=under?gx:gx+140;q.y=(w.gy1+1)*16;P.x=w.x-6;P.y=w.y;P.vy=0;P.vx=0;BK.sim(1);P.x=w.x-6;P.y=w.y;
      let best=0;swing(1,30,()=>{if(q.mode==='planted')best=Math.max(best,q.modeT);if(q.mode!=='planted'){q.x=under?gx:gx+140;q.vx=0;}});
      out['lance'+(under?'Under':'Away')]={mode:q.mode,planted:+best.toFixed(2),open:BK.bossOpen(q),gated:q.gated||0,tiles:BK.L.grid[w.gy1*BK.L.W+w.gate]!==0,pinned:!!w.pinned}; }
    /* ---- THE GOBLIN QUEEN and her HALL BELL ---- */
    for (const under of [true,false]) { const {q,P}=setup('crown','knight','gqueen');const b=BK.props().find(p=>p.t==='winch'&&p.bell);
      if(!b){out.gqueen={noBell:true};break;}
      const gx=b.gate*16+8;q.mode='stand';hold(q);q.x=under?gx:gx-150;q.y=BK.L.arena.floor;P.x=b.x-6;P.y=BK.L.arena.floor;P.vy=0;BK.sim(1);P.x=b.x-6;
      let best=0;swing(1,30,()=>{if(q.mode==='pinned')best=Math.max(best,q.modeT);else{q.x=under?gx:gx-150;q.vx=0;}});
      out['gqueen'+(under?'Under':'Away')]={mode:q.mode,pinned:+best.toFixed(2),by:q.pinBy||null,open:BK.bossOpen(q)}; }
    /* ---- THE GATE GARGOYLE and the RUNE COLUMN ---- */
    for (const inIt of [true,false]) { const {A,q,P}=setup('witchlight','knight','gargoyle');const rc=A.rune;
      if(!rc){out.gargoyle={noRune:true};break;}
      rc.cd=0;rc.flare=0;const m=BK.movers().filter(s=>s.arena&&s.slab&&!s.broken&&s.x<=rc.x&&s.x+s.w>=rc.x).sort((a,b)=>a.y-b.y)[0];
      q.mode='hover';q.cd=99;q.x=inIt?rc.x:rc.x+160;q.y=m.y-50;P.x=rc.x;P.y=m.y;P.vy=0;P.onMover=m;P.ground=true;BK.sim(1);P.x=rc.x;
      let stun=0,crash=false;swing(1,20,()=>{if(q.mode==='hover'){q.x=inIt?rc.x:rc.x+160;q.y=m.y-50;q.cd=99;}});
      for(let i=0;i<180;i++){P.hp=P.maxHp;P.inv=9;BK.sim(1);if(q.mode==='crash')crash=true;if(q.mode==='stunned')stun=Math.max(stun,q.modeT);}
      out['garg'+(inIt?'In':'Out')]={crash,stunned:+stun.toFixed(2),cd:+(rc.cd||0).toFixed(2),lit:rc.lit||0,caught:rc.caught||0}; }
    /* ---- THE TIDE HERALD's mire, capped ---- */
    { const {q}=setup('longwater','knight','herald');q.mode='mired';q.modeT=3.6;q.mireHp0=q.hp;const cut=Math.ceil(q.maxHp*0.3);q.hp-=cut;BK.sim(2);
      out.herald={mode:q.mode,maxHp:q.maxHp}; }
    /* ---- POISE: taps fill nothing outside his opening; a held heavy does ---- */
    { const {q,P}=setup('stockade','knight','chief');q.mode='walk';hold(q);q.poise=0;q.poiseCd=0;q.broken=0;P.heavySwing=false;P.combo=1;P.atk=-1;
      BKT.hurtEnemy(q,8,q.x-10,false);const tap=q.poise||0;q.poise=0;P.heavySwing=true;P.atk=0.05;BKT.hurtEnemy(q,8,q.x-10,false);const heavy=q.poise||0;P.heavySwing=false;P.atk=-1;
      q.mode='planted';q.modeT=5;q.poise=0;BKT.hurtEnemy(q,8,q.x-10,false);const inOpen=q.poise||0;out.poise={tap,heavy,inOpen}; }
    return out;})()`, 300000);
  r.errors = pg.errors.slice(0, 3);
} finally { pg.close(); }
console.log(JSON.stringify(r));
const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); };
ok(r.lanceUnder && r.lanceUnder.gated >= 1 && r.lanceUnder.planted >= 3 && r.lanceUnder.open === true, 'THE LANCE: the bridge gate struck with him under it pins him, planted 3 s+, open: ' + JSON.stringify(r.lanceUnder || r.lance));
ok(r.lanceAway && !r.lanceAway.gated && r.lanceAway.tiles === true, 'THE LANCE: struck with him away, the gate only shuts the lane: ' + JSON.stringify(r.lanceAway));
ok(r.gqueenUnder && r.gqueenUnder.by === 'grate' && r.gqueenUnder.pinned >= 3 && r.gqueenUnder.open === true, 'THE GOBLIN QUEEN: the hall bell rung with her under its grate pins her 3 s+, open: ' + JSON.stringify(r.gqueenUnder || r.gqueen));
ok(r.gqueenAway && r.gqueenAway.mode !== 'pinned', 'THE GOBLIN QUEEN: rung with her away, she is not pinned: ' + JSON.stringify(r.gqueenAway));
ok(r.gargIn && r.gargIn.crash && r.gargIn.stunned >= 3 && r.gargIn.caught === 1, 'THE GARGOYLE: the rune struck while he flies in it turns him onto the spikes, stunned 3 s+: ' + JSON.stringify(r.gargIn || r.gargoyle));
ok(r.gargOut && !r.gargOut.crash && r.gargOut.lit === 1 && r.gargOut.caught === 0, 'THE GARGOYLE: struck while he is out of it, it flares on nothing and goes dark: ' + JSON.stringify(r.gargOut));
ok(r.herald && r.herald.mode !== 'mired', 'THE HERALD: a third of him taken in one mire and he drags himself out: ' + JSON.stringify(r.herald));
ok(r.poise && r.poise.tap === 0 && r.poise.heavy >= 30 && r.poise.inOpen > 0, 'POISE: a tap outside his opening fills none of a boss\'s bar, a held heavy does, and inside an opening any blow does: ' + JSON.stringify(r.poise));
ok(!r.errors.length, 'page errors: ' + JSON.stringify(r.errors));
if (fails.length) { for (const f of fails) console.error('FAIL ' + f); process.exit(1); }
console.log('rule-openings: ok');
