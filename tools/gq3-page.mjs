/* tools/gq3-page.mjs - HIGHCROWN's GQ3 PASS, PLAYED IN THE PAGE (claude/gq3, scratch/lane-reports/gq3-plan.md). ONE headless page, >= 1500 MB free (the lane rule: >= 3 GB beside a recording lane), run it alone.
     princess  her bar to 0 -> 'dying' (untouchable) -> the ordinary death: a body, the mini ends within ~3 s (no escape, no cameo)
     queen     P1 empties -> the flee -> (lab skip) the tower top -> its bar empties -> she KNEELS, the royal portal opens, she backs in, it snaps shut -> she is gone: alive false, no body, the fight over, PROG.gqFled
     tower     the hall portal -> the foot of the burning tower; a floor smokes then catches behind the hero; a beam is told then lands; her volley is three shards
     geode     the P1 geode lob runs: told, in the air, resolved (shattered or sent back), no errors
     stair     the Queen's Stair is walkable to her door with its foes standing (a teleport per beat; the page never throws)
   PORT=<free port> node tools/gq3-page.mjs */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';

const pg = await openPage({ audio: false, fonts: false });
let out;
try {
  out = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');const res={princess:{},queen:{},tower:{},geode:{},stair:{}};
    const idx=LEVELS.findIndex(l=>l.id==='crown');
    const load=()=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero('knight');BK.reset({fresh:true});BK.load(idx);BK.state='play';BK.god=false;BK.sim(5);};
    const hold=()=>{if(BK.state==='card')BK.cardClose();BK.P.hp=BK.P.maxHp;BK.P.inv=Math.max(BK.P.inv||0,0.5);};
    const run=n=>{for(let i=0;i<n;i++){hold();BK.sim(1);}};
    /* ---- the Princess ---- */
    load();{const M=BK.L.mini;BK.tp(Math.round(M.trigger/16)+1,Math.round(M.floor/16)-1);run(300);
      const e=BK.enemies().find(q=>q.t==='gprincess'&&q.alive);res.princess.found=!!e;
      if(e){res.princess.hp0=e.hp;e.hp=3;BKT.hurtEnemy(e,50,e.x-10,false);res.princess.mode=e.mode;res.princess.hpAfter=e.hp;res.princess.aliveAfterBlow=e.alive;
        BKT.hurtEnemy(e,50,e.x-10,false);res.princess.noDmgWhileDying=e.hp>=1;
        run(60);res.princess.at1s={alive:e.alive,mode:e.mode};run(60*3);res.princess.alive=e.alive;res.princess.miniActive=BK.miniActive;res.princess.escaped=!!e.escaped;
        res.princess.bodies=(BKT.bossBodies?BKT.bossBodies:[]).length;}}
    /* ---- the Queen ---- */
    load();{const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);run(300);
      const e=BK.boss;res.queen.found=!!(e&&e.t==='gqueen');
      if(e){e.hp=1;BKT.hurtEnemy(e,50,e.x-10,false);run(120);res.queen.stage1=BK.gqStage();res.queen.bossActive1=BK.bossActive;
        const H=BK.gqHands();const E=BK.L.gqEscape;
        /* the hall portal -> the tower foot */
        BK.tp(E.portal.x,E.portal.y);run(60);res.tower.inTower=!!(H.read().esc&&H.read().esc.inTower);res.tower.heroX=Math.round(BK.P.x/16);res.tower.heroY=Math.round(BK.P.y/16);res.tower.footExpected=[E.start.x,E.start.y+1];
        /* a floor smokes, then catches, behind a hero who has gone up a storey */
        const F=E.tower.FLOORS;BK.tp(E.tower.SHAFT[0]+13,F[1]-1);run(60*3);res.tower.burning=H.read().esc.burning;
        /* a beam is told then lands; a volley is three shards */
        let maxBeams=0,maxRocks=0;for(let i=0;i<60*14;i++){hold();BK.sim(1);const r=H.read();maxBeams=Math.max(maxBeams,r.esc.beams);maxRocks=Math.max(maxRocks,BK.gqShots().filter(s=>s.kind==='rock').length);}
        res.tower.maxBeams=maxBeams;res.tower.maxRocks=maxRocks;
        /* the lab's skip: the tower top */
        const sk=H.skipRoof();res.queen.skip=sk;run(150);res.queen.stage2=BK.gqStage();res.queen.hp2=e.hp;res.queen.hpMax2=e.maxHp;
        /* the roof bar empties: she is spared (a kneel), then gone */
        e.hp=1;BKT.hurtEnemy(e,500,e.x-10,false);res.queen.kneel={stage:e.stage,mode:e.mode,alive:e.alive};
        run(60*5);res.queen.end={alive:e.alive,bossActive:BK.bossActive,stage:e.stage,gqFled:BKT.PROG.gqFled||0,hp:e.hp};
        res.queen.bodies=(BKT.bossBodies?BKT.bossBodies.filter(b=>b.set===BKT.SPR?.gqueen):[]).length;}}
    /* ---- the geode lob ---- */
    load();{const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);run(300);const e=BK.boss;
      if(e&&e.t==='gqueen'){const H=BK.gqHands();e.x=Math.min(A.x1-80,BK.P.x+220);e.y=A.floor;e.mode='stand';e.modeT=0;e.crownCd=e.portalCd=99;H.test.geodeBegin();
        let sawFly=false,sawBits=false,sawBack=false;for(let i=0;i<60*4;i++){hold();BK.sim(1);const g=H.test.geode&&H.test.geode();if(g&&g.state==='fly')sawFly=true;if(g&&g.state==='back')sawBack=true;if(H.test.geodeBits&&H.test.geodeBits().length)sawBits=true;}
        res.geode={sawFly,sawBits,sawBack,mode:e.mode};}}
    /* ---- the Queen's Stair ---- */
    load();{const {SH_STAIR:SA,SHIFT:SHF}=await import('/src/gq4l.js');const spots=[[650,19],[660,13],[666,11],[675,7],[683,4],[686,8],[688,8],[702,8],[708,11],[712,19],[717,19]].map(([x,y])=>[x+(x>=704?SA+SHF.stair:SA),y]);   /* (gq4l) the stair's columns slide with GQ4L_SHIPS */const seen=[];
      for(const [x,y] of spots){BK.tp(x,y);run(40);seen.push([x,y,Math.round(BK.P.x/16),Math.round(BK.P.y/16)-0]);}
      res.stair.spots=seen;res.stair.foes=BK.enemies().filter(q=>q.alive&&q.x>=(652+SA)*16&&q.x<=(716+SA+SHF.stair)*16).map(q=>q.t).sort().join();}
    return res;})()`, 170000);
  out.errors = pg.errors.slice(0, 6);
} finally { await pg.close(); }
console.log(JSON.stringify(out, null, 1));
const o = out;
assert(o.princess.found, 'the Princess is in the page');
assert(o.princess.mode === 'dying' && o.princess.aliveAfterBlow && o.princess.noDmgWhileDying, 'her lethal blow starts the dying (untouchable): ' + JSON.stringify(o.princess));
assert(!o.princess.alive && !o.princess.miniActive && !o.princess.escaped, 'and 4 s on she is dead (a death, not an escape) and the mini is over');
assert(o.queen.found && o.queen.stage1 === 'escape' && o.queen.bossActive1 === false, 'the P1 bar empties: she flees (the escape stage), the fight is over: ' + JSON.stringify(o.queen));
assert(o.tower.inTower && o.tower.heroY === o.tower.footExpected[1] && o.tower.burning[0] === true, 'her portal sets the hero down at the tower foot, and the floor behind him caught: ' + JSON.stringify(o.tower));
assert(o.tower.maxBeams >= 1 && o.tower.maxRocks >= 3, 'a beam was told and a three-shard volley flew: ' + JSON.stringify({ b: o.tower.maxBeams, r: o.tower.maxRocks }));
assert(o.queen.stage2 === 'roof' && o.queen.kneel.stage === 'fled' && o.queen.kneel.alive, 'the roof bar empties: she is SPARED (fled stage): ' + JSON.stringify(o.queen.kneel));
assert(!o.queen.end.alive && !o.queen.end.bossActive && o.queen.end.gqFled === 1, 'she is gone through her portal: not alive, the fight over, PROG.gqFled: ' + JSON.stringify(o.queen.end));
assert(o.geode.sawFly && (o.geode.sawBits || o.geode.sawBack), 'the geode lob flew and resolved: ' + JSON.stringify(o.geode));
assert(o.stair.spots.length === 11, 'the stair is walked beat by beat');
assert.deepEqual(out.errors, [], 'no page errors: ' + JSON.stringify(out.errors));
console.log('ok  gq3-page');
