/* tools/spore-caps.mjs — THE CAPS GROW INTO STEPS, PROVED IN THE PAGE (docs/briefs/sporewood-rebuild.md). Headless Chrome, real input.
   tools/spore-loop.mjs reads the built level and the Mother's code in Node; this drives a hero over every use of the rule, in route order,
   with the keys a player presses, and fails if one of them does not do what its sign says:
     0. THE ROOT STEP (glade): walking THROUGH a bud does not grow it; stopping on it does, and the grown cap sets you on the root.
     1. THE LEANING CAPS: the lip's bud carries a hero who stops on it over the gap, to the stump - and back home if they stay on it.
     2. THE DRIPPING STAIR: a hero who rides the bud up in the spore fall's column is hit by the clump; one standing UNDER a grown cap is not
        (a grown cap is a roof), and the grown bud sets you on the next tier.
     3. THE DEEP GILLS: a struck glowbud wakes the sprout beside it.
     4. HER ROOM: a hero who grows a room bud and drops off it before her fold lands opens her heart by the jam - with the knot unstruck -
        and her knot's rest still gates it; the knot never grows a room bud.
   Knight and warden (the two heroes F9 is walked with). */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
const HEROES = (process.argv[2] || 'knight,warden').split(',');
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');const idx=LEVELS.findIndex(l=>l.id==='spore');BK.manualSimulation=true;
    const out={};const K=BK.keys,rel=()=>{for(const k in K)K[k]=false;};
    const fresh=h=>{BK.SET.speed=1;BK.setHero(h);BK.reset({fresh:true});BK.load(idx);BK.state='play';BK.god=false;BK.P.hp=BK.P.maxHp||100;BK.ambushes().forEach(a=>a.st='done');rel();};
    const caps=()=>BK.movers().filter(m=>m.kind==='growcap');
    const capAt=tx=>caps().find(m=>Math.abs((m.bx??m.x)/16-tx)<0.6);
    const standOn=(m,frames)=>{const P=BK.P;BK.tp((m.x+m.w/2)/16-.5,m.y/16-1);P.x=m.x+m.w/2;P.y=m.y-1;P.vx=0;P.vy=0;BK.sim(2);rel();BK.sim(frames);};
    for(const h of ${JSON.stringify(HEROES)}){const o=out[h]={};
      /* 0. THE ROOT STEP */
      fresh(h);BK.enemies().forEach(e=>e.alive=false);let P=BK.P,m=capAt(37);o.teachFound=!!m;if(!m)continue;
      BK.tp(31,19);BK.sim(20);K.right=true;for(let f=0;f<40&&P.x<37*16+8;f++)BK.sim(1);K.right=false;BK.sim(20);o.walkedThrough=m.state;
      standOn(m,60);o.teachGrown=m.state;K.right=true;BK.sim(40);K.right=false;BK.sim(10);o.teachOn=[Math.round(P.x/16*10)/10,P.y/16,P.ground];
      /* 1. THE LEANING CAPS */
      fresh(h);BK.enemies().forEach(e=>e.alive=false);P=BK.P;m=capAt(177);o.leanFound=!!(m&&m.lean);
      standOn(m,20);let x0=P.x;BK.sim(130);o.leanCarried=Math.round((P.x-x0)/16*10)/10;o.leanState=m.state;
      K.right=true;BK.sim(30);K.right=false;BK.sim(20);o.leanLanded=[Math.round(P.x/16*10)/10,P.y/16,P.ground];
      fresh(h);BK.enemies().forEach(e=>e.alive=false);P=BK.P;m=capAt(177);standOn(m,20);BK.sim(60*11);o.leanHome=[Math.round(P.x/16*10)/10,P.y/16,m.state];
      /* 2. THE DRIPPING STAIR */
      fresh(h);BK.enemies().forEach(e=>e.alive=false);P=BK.P;m=capAt(250);const rf=BK.props().filter(p=>p.t==='rockfall'&&p.spore);o.drips=rf.length;
      let hp0=P.hp;standOn(m,5);for(let f=0;f<60*6&&P.hp===hp0;f++){if(m.state==='up'){P.x=m.x+m.w/2+6;P.y=m.y;}BK.sim(1);}o.riderHit=P.hp<hp0;
      fresh(h);BK.enemies().forEach(e=>e.alive=false);P=BK.P;m=capAt(250);m.state='up';m.k=1;m.upT=99;m.y=m.y0-m.rise;BK.tp(250.5,13);P.x=m.x+m.w/2+6;BK.sim(2);hp0=P.hp;
      const r0=BK.props().find(p=>p.t==='rockfall'&&Math.abs(p.x-m.x-24)<12);let fell=0;for(let f=0;f<60*7;f++){P.x=m.x+m.w/2+6;P.vx=0;if(r0&&r0.timer<=1/60)fell++;BK.sim(1);}o.roofed={fell,hurt:P.hp<hp0};
      fresh(h);BK.enemies().forEach(e=>e.alive=false);BK.props().forEach(p=>{if(p.t==='rockfall')p.timer=99;});P=BK.P;m=capAt(250);standOn(m,60);K.right=true;BK.sim(30);K.right=false;BK.sim(10);o.stairOn=[Math.round(P.x/16*10)/10,P.y/16,P.ground];
      /* 3. THE DEEP GILLS */
      fresh(h);BK.enemies().forEach(e=>e.alive=false);P=BK.P;const gb=BK.props().find(p=>p.t==='glowbud'&&p.mycelium&&Math.abs(p.x/16-449.5)<1.5);m=capAt(449.5)||caps().find(q=>Math.abs(q.x/16-449.5)<1);
      BK.tp(gb.x/16-1.2,21);BK.sim(20);P.face=1;BK.press('atk');BK.sim(40);o.gillsWoke=m&&m.state;
      /* 4. HER ROOM */
      fresh(h);P=BK.P;const A=BK.L.arena;BK.tp(A.trigger/16+1,A.floor/16-1);BK.sim(240);BK.god=true;const b=BK.boss;o.bossMode0=b&&b.mode;
      const room=caps().filter(q=>q.mother);o.roomBuds=room.length;
      const node=BK.props().find(p=>p.motherNode);BK.P.x=node.x-10;BK.sim(2);BK.P.face=1;BK.press('atk');BK.sim(20);o.knotOpened=b.mode;o.knotGrewRoomBud=room.some(q=>q.state!=='bud');
      /* let that window go, and the knot's rest run out */
      b.mode='idle';b.modeT=99;b.nodeRest=0;BK.sim(2);
      const lb=room.find(q=>q.x<b.x);standOn(lb,50);o.roomGrown=lb.state;o.highOnIt=Math.round(A.floor-BK.P.y);
      b.mode='capClapTell';b.modeT=0.9;b.nodeRest=0;BK.sim(20);   /* the fold is told: drop off it, toward her */
      BK.P.x=lb.x+lb.w+10;BK.P.y=A.floor;BK.P.vy=0;BK.P.onMover=null;BK.sim(60);o.jammed=b.mode;o.jams=b.jams||0;o.capAfter=lb.state;
      /* the same jam while the knot is resting opens nothing */
      b.mode='idle';b.modeT=99;BK.sim(200);const rb=room.find(q=>q.x>b.x);b.nodeRest=5;standOn(rb,50);b.mode='capClapTell';b.modeT=.3;BK.P.x=rb.x-10;BK.P.y=A.floor;BK.P.onMover=null;BK.sim(30);o.restingJam=b.mode;
    }
    return out;})()`, 600000);
  console.log(JSON.stringify(r, null, 1));
  assert.deepEqual(pg.errors, []);
  for (const [h, o] of Object.entries(r)) {
    const w = s => h + ': ' + s;
    assert.ok(o.teachFound, w('no bud at the glade\'s root step (37)'));
    assert.equal(o.walkedThrough, 'bud', w('walking through the glade\'s bud grew it'));
    assert.ok(['grow', 'up'].includes(o.teachGrown), w('stopping on the glade\'s bud did not grow it: ' + o.teachGrown));
    assert.ok(o.teachOn[2] && o.teachOn[1] === 16 && o.teachOn[0] >= 39, w('the grown bud did not set the hero on the root: ' + o.teachOn));
    assert.ok(o.leanFound, w('no leaning bud on the gap\'s lip (177)'));
    assert.ok(o.leanCarried >= 8, w('the leaning cap carried the hero only ' + o.leanCarried + ' tiles'));
    assert.ok(o.leanLanded[2] && o.leanLanded[0] >= 189 && o.leanLanded[0] <= 194 && o.leanLanded[1] === 14, w('the leaning cap did not set the hero on the stump: ' + o.leanLanded));
    assert.ok(o.leanHome[0] < 180 && o.leanHome[1] <= 14, w('a hero who stayed on the leaning cap was not carried home: ' + o.leanHome));
    assert.ok(o.drips >= 2, w('fewer than two spore falls on the stair: ' + o.drips));
    assert.ok(o.riderHit, w('riding the stair bud up in the spore fall\'s column never met a clump'));
    assert.ok(o.roofed.fell >= 2 && !o.roofed.hurt, w('under a grown cap the spore fall still hurt (or never fell): ' + JSON.stringify(o.roofed)));
    assert.ok(o.stairOn[2] && o.stairOn[1] === 10 && o.stairOn[0] >= 252, w('the stair bud did not set the hero on the next tier: ' + o.stairOn));
    assert.ok(['grow', 'up'].includes(o.gillsWoke), w('striking the Gills\' glowbud did not wake its sprout: ' + o.gillsWoke));
    assert.equal(o.roomBuds, 2, w('her room should hold two buds: ' + o.roomBuds));
    assert.equal(o.knotOpened, 'open', w('the knot did not open her (the pilot\'s lock is broken): ' + o.knotOpened));
    assert.ok(!o.knotGrewRoomBud, w('striking the knot grew a room bud'));
    assert.ok(['grow', 'up'].includes(o.roomGrown) && o.highOnIt >= 60, w('the room bud did not lift the hero into the fold\'s height: ' + o.roomGrown + ' ' + o.highOnIt));
    assert.equal(o.jammed, 'open', w('her fold came down on a grown cap and did not open her: ' + o.jammed));
    assert.equal(o.jams, 1, w('the opening was not the jam'));
    assert.ok(o.restingJam !== 'open', w('a jam opened her while the knot was resting'));
  }
  console.log('the caps grow into steps: the root step, the leaning cap, the dripping stair, the Gills\' sprout and her jam, for ' + HEROES.join(' and ') + '.');
} finally { pg.close(); }
