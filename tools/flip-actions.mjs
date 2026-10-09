/* tools/flip-actions.mjs — TURNED OVER, THE HERO KEEPS EVERYTHING (claude/witchfix; Daniel, live on THE WITCHLIGHT STAIR, 10-08: "glyphs turn
   you over" - in EVERY reverse-gravity section the hero keeps dodge/roll, block/guard and every attack - light, heavy, the plunge toward his new
   'down', his skills - nothing disabled, every hero).
   THE CAUSE: a turned-over hero was run by magePlayer, a second, smaller hero update: it kept the walk, the jump, a light swing, the KNIGHT's
   shield (hero() === 'knight' - nobody else's guard), a floor roll and a plunge, and dropped every other hero's C, the heavy blows, the up-slash,
   the dash attack and every skill. Now he runs the hero's own update in his own frame (main.js updatePlayer / flipMove / attackBox).
   With REAL KEYS (keydown/keyup on the page), in EVERY reverse-gravity section the levels have - each floor glyph of the Witchlight Stair, the
   Mage's Folly and the Falling Tower, and the Gate Gargoyle's glyph flare (the underside of a slab) - for EVERY hero:
     turned over and stood on the ceiling: V rolls (P.dodge); C raises his own answer (the knight's shield, the warden's deflect, the
     pyromancer's jet, the paladin's aegis, the death knight's ward, the freebooter's parry, the geomancer's stave); X swings; X held winds a
     heavy and lets it go; his first skill (F) is cast; and off the ceiling, DOWN + X plunges toward the ceiling (his floor) - and after all of
     it he is still turned over, on his ceiling.
   Every assertion is SOFT and all are printed. */
import { LEVELS } from '../src/level.js';
import { openPage } from './cdp.mjs';
const fails = [], ok = (c, m) => { if (!c) fails.push(m); console.log((c ? '  ok   ' : '  FAIL ') + m); };
const HEROES = ['knight', 'warden', 'pyro', 'paladin', 'pirate', 'reaper', 'geomancer'];
const SKILL = { knight: 'lunge', warden: 'skewer', pyro: 'flameRing', paladin: 'lightLance', pirate: 'grapeshot', reaper: 'scytheThrown', geomancer: 'stoneWall' };
/* each hero's C: what it raises, and whether it is a hold or a tap */
const GUARD = { knight: ['hold', 'block'], warden: ['tap', 'deflectT'], pyro: ['hold', 'jet'], paladin: ['hold', 'aegis'], reaper: ['hold', 'warding'], pirate: ['tap', 'parryW'], geomancer: ['hold', 'geoGuard'] };
const sections = [];
for (const id of ['witchlight', 'mage', 'fallingtower']) { const I = LEVELS.findIndex(l => l.id === id), L = LEVELS[I].build();
  for (const g of (L.ents || []).filter(e => e.t === 'glyph' && !e.ceiling)) sections.push({ id, I, x: g.x, y: g.y }); }
ok(sections.length >= 6, 'every reverse-gravity section: ' + sections.map(s => s.id + '@' + s.x).join(' '));
const pg = await openPage({ audio: false, fonts: false, seed: 5 });
const PAGE = `const key=(t,k,code)=>window.dispatchEvent(new KeyboardEvent(t,{key:k,code:code||k,bubbles:true}));
  const tap=(k,code)=>{key('keydown',k,code);BK.sim(1);key('keyup',k,code);};
  const P=()=>BK.P,fresh=()=>{const p=P();p.st=p.maxSt;p.hp=p.maxHp;p.inv=0;p.hurt=0;p.dodgeCd=0;p.cds={};p.guardTired=0;p.parryCd=0;p.deflectRec=0;p.deflectT=0;p.blastT=0;p.jetRecover=0;p.aegisCd=0;p.castT=0;p.full=false;p.plungeRec=0;p.atkRec=0;p.loaded=true;};
  const settle=n=>{for(let i=0;i<n;i++){BK.sim(1);if(P().atk<0&&!(P().dodge>0)&&!P().plunge&&!(P().atkRec>0)&&P().ground&&!P().charge&&!P().heavy&&!(P().castT>0)&&!(P().kPoseT>0))break;}};
  const act=(h,skill,G)=>{const o={};const flip0=()=>!!P().flip;
    /* C: his own answer */
    fresh();settle(60);if(G[0]==='tap'){key('keydown','c');let s=0;for(let i=0;i<3;i++){BK.sim(1);s=Math.max(s,+(P()[G[1]]||0));}key('keyup','c');for(let i=0;i<4;i++){BK.sim(1);s=Math.max(s,+(P()[G[1]]||0));}o.guard=s>0;}   /* (a tap's answer may open on the release - the freebooter's parry does, upright as well)*/
    else{key('keydown','c');let s=false;for(let i=0;i<24;i++){BK.sim(1);s=s||!!P()[G[1]];}key('keyup','c');o.guard=s;}
    BK.sim(4);o.guardFlip=flip0();
    /* X: a swing */
    fresh();settle(60);tap('x');let a=false;for(let i=0;i<4;i++){a=a||P().atk>=0;BK.sim(1);}o.light=a;
    /* off the ceiling, DOWN + X: the plunge, at the ceiling */
    fresh();settle(90);const y0=P().y;key('keydown','z');BK.sim(10);key('keyup','z');BK.sim(2);const away=P().y-y0;key('keydown','ArrowDown');BK.sim(1);tap('x');let pl=false,up=false;for(let i=0;i<6;i++){BK.sim(1);if(P().plunge){pl=true;up=up||P().vy<0;}}
    key('keyup','ArrowDown');for(let i=0;i<120&&!(P().ground&&!P().plunge);i++)BK.sim(1);o.plunge={left:Math.round(away),on:pl,atCeiling:up};
    /* X held: the heavy, wound and let go */
    fresh();settle(90);key('keydown','x');let ch=0;for(let i=0;i<55;i++){BK.sim(1);ch=Math.max(ch,P().charge||0,P().atkHeld||0);}key('keyup','x');let hv=false;for(let i=0;i<12;i++){BK.sim(1);hv=hv||!!P().heavy||P().atk>=0||(P().blastT>0);}o.heavy={wound:ch>0,blow:hv};
    /* F: the skill (settle(240): the death knight's heavy just before runs ~3 s, upright as well - a press inside it is held for its window) */
    fresh();settle(240);tap('f');let cd=0;for(let i=0;i<4;i++){BK.sim(1);cd=Math.max(cd,(P().cds&&P().cds[skill])||0);}o.skill=cd>0;
    settle(120);
    /* V: the roll */
    fresh();settle(90);tap('v');let d=0;for(let i=0;i<3;i++){d=Math.max(d,P().dodge||0);BK.sim(1);}o.dodge=d>0;settle(60);
    o.flipEnd=flip0()&&!!P().ground;return o;};`;
try {
  /* THE GLYPH SECTIONS: each floor glyph, every hero */
  for (const s of sections) for (const h of HEROES) {
    const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;${PAGE}
      BK.setHero('${h}');BK.reset({fresh:true});BKT.setHeroLevel&&BKT.setHeroLevel('${h}',20);const PR=BKT.PROG;PR.loadouts=PR.loadouts||{};PR.loadouts['${h}']=['${SKILL[h]}'];BK.setHero('${h}');
     BK.load(${s.I});BK.state='play';BK.god=true;BK.sim(5);
      const kill=()=>{for(const e of BK.enemies())if(e.alive&&Math.abs(e.x-P().x)<400&&Math.abs(e.y-P().y)<300)e.alive=false;};kill();
      BK.tp(${s.x},${s.y});BK.sim(1);let i=0;for(;i<240&&!(P().flip&&P().ground);i++){kill();BK.sim(1);}
      if(!(P().flip&&P().ground))return {notFlipped:true,flip:!!P().flip,ground:P().ground};
      kill();const o=act('${h}','${SKILL[h]}',${JSON.stringify(GUARD[h])});o.skillAt=BKT.skillAt?BKT.skillAt(0):null;o.errors=(window.__errs||[]).slice(0,3);return o;})()`, 600000);
    const tag = s.id + '@' + s.x + ' ' + h;
    if (r.notFlipped) { ok(false, tag + ': the glyph turns him over onto the ceiling: ' + JSON.stringify(r)); continue; }
    const all = r.guard && r.light && r.heavy.wound && r.heavy.blow && r.skill && r.dodge && r.plunge.on && r.plunge.atCeiling && r.plunge.left > 4 && r.flipEnd;
    ok(all && r.errors.length === 0, tag + ': turned over he rolls, guards (' + GUARD[h][1] + '), swings, winds a heavy, casts ' + SKILL[h] + ' and plunges at the ceiling - and is still on it: ' + JSON.stringify(r));
  }
  /* THE GLYPH FLARE: under the Gate Gargoyle's slab */
  const W = LEVELS.findIndex(l => l.id === 'witchlight');
  for (const h of ['knight', 'warden', 'pyro']) {
    const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;${PAGE}
      BK.setHero('${h}');BK.reset({fresh:true});BKT.setHeroLevel&&BKT.setHeroLevel('${h}',20);const PR=BKT.PROG;PR.loadouts=PR.loadouts||{};PR.loadouts['${h}']=['${SKILL[h]}'];BK.setHero('${h}');
     BK.load(${W});BK.state='play';BK.god=true;BK.sim(5);
      const g=BK.enemies().find(e=>e.t==='gargoyle');for(const e of BK.enemies())if(e!==g)e.alive=false;
      const sl=BK.movers().filter(m=>m.arena).sort((a,b)=>a.x-b.x),m=sl.filter(q=>q.y===Math.min(...sl.map(z=>z.y)))[1];
      const on=()=>{const p=P();p.windRide=null;p.x=m.x+m.w/2;p.y=m.y;p.vy=0;p.vx=0;p.onMover=m;p.ground=true;};on();BK.sim(150);
      const hold=()=>{g.mode='hover';g.cd=99;g.queue=[];g.x=m.x-160;g.y=m.y-140;};
      on();hold();g.mode='flareTell';g.fm=m;g.modeT=0.02;g.cd=99;for(let k=0;k<30&&g.mode==='flareTell';k++){on();BK.sim(1);}g.queue=[];   /* (the tell resolves before he is held: hold() puts him back in hover) */let i=0;for(;i<30&&!(P().flip&&P().ground);i++){hold();BK.sim(1);}
      if(!(P().flip&&P().flareSlab))return {notFlipped:true,flip:!!P().flip,ground:P().ground};
      const o={};const keepUnder=()=>{P().flareT=3;hold();};const sim0=BK.sim;BK.sim=n=>{for(let k=0;k<(n||1);k++){keepUnder();sim0(1);}};
      try{Object.assign(o,act('${h}','${SKILL[h]}',${JSON.stringify(GUARD[h])}));}finally{BK.sim=sim0;}
      o.under=!!P().flareSlab;o.errors=(window.__errs||[]).slice(0,3);return o;})()`, 600000);
    const tag = 'THE GLYPH FLARE (under his slab) ' + h;
    if (r.notFlipped) { ok(false, tag + ': the flare turns him over under the slab: ' + JSON.stringify(r)); continue; }
    const all = r.guard && r.light && r.heavy.wound && r.heavy.blow && r.skill && r.dodge && r.plunge.on && r.plunge.atCeiling;
    ok(all && r.errors.length === 0, tag + ': under the slab he rolls, guards, swings, winds a heavy, casts and plunges at it: ' + JSON.stringify(r));
  }
  ok(pg.errors.length === 0, 'no page errors: ' + JSON.stringify(pg.errors.slice(0, 3)));
} finally { await pg.close(); }
console.log(fails.length ? '\n' + fails.length + ' FAILED' : '\nTURNED OVER, EVERY HERO KEEPS EVERYTHING: the roll, his own guard, the swing, the heavy, his skill and the plunge at the ceiling, in every reverse-gravity section.');
process.exitCode = fails.length ? 1 : 0;
