// tools/ranger.mjs - THE RANGER'S KIT, PLAYED THROUGH HER REAL INPUT IN THE REAL PAGE (claude/ranger, scratch/brief-ranger.md).
//   quick     a TAP of X looses a QUICK SHOT (let go before the draw starts): an arrow out of the quiver, short (lands 50-95 px out) and tagged 'shot'
//   draw      HOLD X: she DRAWS and is ROOTED (a way held moves her nowhere); let go and a full draw lands 125-185 px out (longer than a tap),
//             tagged HEAVY (B14's heavy key) - and it is not loosed by itself while she holds it
//   quiver    loosed arrows STICK (in the floor, a wall or a foe) and she takes them back by walking over them; with none, X is the KNIFE;
//             a slow trickle gives one back every RG.quiver.refill s
//   knife     point-blank X is the knife (a swing, no arrow); DOWN+X on her feet is the knife's low sweep ('sweep': B14's sweep key)
//   rise      UP+X: the rising shot, steeply up, tagged 'rise' (B14's FROM BELOW)
//   down      DOWN+X in the air: the downward shot, straight down, tagged 'plunge' (B14's FROM ABOVE), and a hop UP off it
//   focus     an arrow that lands from the SWEET SPOT fills HUNTER'S FOCUS; one point-blank does not
//   mark      focus full + UP+C MARKS the quarry ahead: its blows land RG.mark.mul harder; the focus is spent
//   pierce    (claude/chargetiers) held to T2 the draw is the PIERCING SHOT: through two foes in a line; on a full focus it is FOCUSED (the focus spent)
//   tiers     (claude/chargetiers) THE THREE-TIER DRAW: BK.rg().tier climbs 1-2-3 on the hold (each arrival its own pose: rgDraw2/rgDraw3), let go at T1 a LONG SHOT
//             (the focus kept), T2 a PIERCING SHOT, T3 a TRIPLE SHOT (Daniel 10-22: a tight flat 3-arrow FAN, each arrow strong, one arrow of her quiver, nothing held)
//             and more damage on one foe than the piercing shot; each tier costs its own wind; held at T3 RG.tiers.hold s it goes by itself; the stand / knee poses and looses exist
//   bash      C is the BOW-BASH: tapped AS a yellow blow lands it is HER PARRY (nothing taken, the riposte window, the foe thrown back out to range)
//             and her next arrow is the RIPOSTE ('riposte' tag: B14's parry key); off the beat the blow lands; a RED one is never parried
//   snare     DOWN+C sets a snare at her feet: a common foe that walks into it is HELD
//   flip      the dodge is a BACKFLIP: away from what she faces, she does not turn, up off the ground - and X in it is a shot
//   roll      a way held toward her face: an ordinary forward roll
//   skills    every one of her nine actives fires when bought and slotted (cooldown set)
//   art       her set has every key her draw asks for (placeholders for the art lane), and a weapon skin touches the bow only
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
const fails = [], ok = (c, m) => { if (!c) fails.push(m); };
try {
  await pg.evalp(`(async()=>{const {xpFloor}=await import('/src/xp.js');
    window.__rg=(ids=[],lv=1)=>{BK.manualSimulation=true;BK.SET.speed=1;BK.setHero('ranger');BK.reset({fresh:true});BKT.PROG.xp.ranger=xpFloor(lv);
      BKT.PROG.skillOwned.ranger=Object.fromEntries(ids.map(i=>[i,true]));BKT.PROG.loadouts.ranger=ids.slice(0,3);BK.applyUpgrades();BK.load(0);BK.state='play';
      BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');const L=BK.L;for(let x=2;x<70;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;
      BK.tp(10,21);BK.sim(30);for(const k in BK.keys)BK.keys[k]=false;const P=BK.P;P.hp=P.maxHp;P.inv=0;P.st=P.maxSt;P.face=1;BK.rgk().clear();P.rgFocus=0;BK.rgk().resetStats();};
    window.__foe=(dx,t='sprig',hp=5000,dy=0)=>{BK.spawnEnt({t,x:(BK.P.x+dx)/16,y:21+dy});const e=BK.enemies().at(-1);e.hp=e.hp0=hp;e.cd=99;e.dmgPct=70;return e;};
    window.__tap=(k='atk')=>{BK.keys[k]=true;BK.press(k);BK.sim(2);BK.keys[k]=false;BK.sim(1);};
    window.__c=()=>{BK.keys.block=true;BK.sim(1);BK.keys.block=false;};
    return 1})()`);
  const r = await pg.evalp(`(()=>{const out={},P=()=>BK.P,K=BK.keys,R=()=>BK.rg(),G=()=>BK.rgk();
    const last=()=>R().arrows.at(-1)||{};
    /* quick */
    { __rg(); const q0=R().q, x0=P().x; __tap(); const a=last(); BK.sim(60); out.quick={q0,q1:R().q,kind:a.kind,tag:a.tag,state:last().state,land:Math.round(last().x-x0)}; }
    /* draw: rooted (right held), held at full and not loosed by itself, then let go */
    { __rg(); K.atk=true; BK.press('atk'); K.right=true; BK.sim(12); const c0=P().charge>0, xd=P().x; BK.sim(58); const x0=xd; out.draw={c0,charge:+(P().charge||0).toFixed(2),moved:Math.round(P().x-xd),flying:R().arrows.length};
      K.right=false; K.atk=false; BK.sim(2); const a=last(); BK.sim(80); Object.assign(out.draw,{kind:a.kind,tag:a.tag,land:Math.round(last().x-x0),full:G().read().stats.full}); }
    /* quiver: walk over the arrows to take them back; empty = knife; the trickle */
    { __rg(); __tap(); BK.sim(20); __tap(); BK.sim(60); const q1=R().q, xs=R().arrows.map(a=>a.x); K.right=true; for(let i=0;i<120&&R().arrows.length;i++)BK.sim(1); K.right=false; BK.sim(5);
      out.quiver={q1,stuck:xs.length,after:R().q,left:R().arrows.length,picked:R().stats.picked};
      __rg(); P().rgQ=0; const f=__foe(60); BK.sim(1); __tap(); out.quiver.emptyAtk=P().atk>=0; out.quiver.emptyArrows=R().arrows.length; f.alive=false;
      BK.sim(2); P().rgQ=0; P().rgRefT=0; BK.sim(Math.round(60*8.3)); out.quiver.trickle=R().q; }
    /* CROUCH TO RESTOCK: a quick duck does not, a held still one does (1 arrow per ~1.3 s after 0.4 s), moving cancels and resets the delay */
    { __rg(); P().rgQ=0; P().rgRefT=0; K.down=true; BK.sim(18); const duck=!!P().ducking, quick=R().q; K.down=false; BK.sim(6);
      K.down=true; BK.sim(60); const at1s=R().q; BK.sim(60); const at2s=R().q; BK.sim(340); const full=R().q; K.down=false; BK.sim(3);
      P().rgQ=0; P().rgRefT=0; K.down=true; BK.sim(30); K.right=true; BK.sim(3); K.right=false; const rt=P().rgRsT; BK.sim(40); const afterMove=R().q; K.down=false; BK.sim(3);
      out.restock={duck,quick,at1s,at2s,full,rt,afterMove,stat:R().stats.restocked,max:R().max}; }
    /* knife: point-blank, and the low sweep */
    { __rg(); const f=__foe(12); BK.sim(1); __tap(); out.knife={atk:P().atk>=0,arrows:R().arrows.length,q:R().q}; f.alive=false; BK.sim(30);
      K.down=true; __tap(); out.knife.sweep=P().swingKind; K.down=false; out.knife.sweepArrows=R().arrows.length; BK.sim(30); }
    /* rise */
    { __rg(); K.up=true; __tap(); K.up=false; const a=last(); out.rise={kind:a.kind,tag:a.tag}; BK.sim(10); out.rise.vy=0; }
    /* down: jump, then DOWN+X */
    { __rg(); BK.press('jump'); K.jump=true; BK.sim(14); K.jump=false; const vy0=P().vy; K.down=true; __tap(); K.down=false; const a=last(); out.down={kind:a.kind,tag:a.tag,vy0:Math.round(vy0),vy:Math.round(P().vy),plunge:!!P().plunge,ground:P().ground}; BK.sim(60); }
    /* down onto a foe: the FROM ABOVE key lands */
    { __rg(); const f=__foe(0,'dummy',500); BK.press('jump'); K.jump=true; BK.sim(16); K.jump=false; const h0=G().read().stats.hits; K.down=true; __tap(); K.down=false; BK.sim(20); out.down.hit=G().read().stats.hits-h0; f.alive=false; }
    /* focus: the sweet spot fills it, point-blank does not */
    { __rg(); const f=__foe(90,'sprig',5000); BK.sim(1); K.atk=true; BK.press('atk'); BK.sim(50); K.atk=false; BK.sim(40); out.focus={sweet:+(P().rgFocus||0).toFixed(1),hit:G().read().stats.hits}; f.alive=false;
      __rg(); const g=__foe(34,'sprig',5000); BK.sim(1); __tap(); BK.sim(30); out.focus.close=+(P().rgFocus||0).toFixed(1); out.focus.closeHit=G().read().stats.hits; g.alive=false; }
    /* mark: full focus, UP+C, then the same shot on a marked and an unmarked foe */
    { __rg(); const f=__foe(70,'sprig',5000); BK.sim(1); P().rgFocus=100; K.up=true; __c(); BK.sim(2); K.up=false; out.mark={on:(f.rgMarkT||0)>BK.time,focus:P().rgFocus};
      BK.sim(10); let hp0=f.hp; __tap(); BK.sim(40); const marked=hp0-f.hp; f.rgMarkT=0; BK.sim(25); hp0=f.hp; __tap(); BK.sim(40); out.mark.marked=marked; out.mark.plain=hp0-f.hp; f.alive=false; }
    /* pierce (claude/chargetiers): the hold to T2 through two in a line; on a full focus it is FOCUSED and spends it */
    { __rg(); const a=__foe(60,'dummy',5000), b=__foe(80,'dummy',5000); BK.sim(1); P().rgFocus=100; const ha=a.hp, hb=b.hp; K.atk=true; BK.press('atk'); BK.sim(80); K.atk=false; BK.sim(30);
      out.pierce={hits:G().read().stats.hits,focus:P().rgFocus,n:G().read().stats.pierces,focused:G().read().stats.focused}; a.alive=b.alive=false; }
    /* (claude/chargetiers) THE THREE TIERS: the climb and its poses, each shot, the wind each costs, the fan (three arrows, one from the quiver, more damage than the pierce), a mini hit not held, the auto-loose */
    { const T=G().RG.tiers, hold=n=>{K.atk=true;BK.press('atk');BK.sim(n);}, rel=()=>{K.atk=false;BK.sim(2);}; out.tiers={};
      __rg(); P().rgFocus=100; const seen=[], keys=[]; K.atk=true; BK.press('atk'); for(let i=0;i<120;i++){BK.step(1);const t=R().tier;if(t&&!seen.includes(t))seen.push(t);if(t>=2&&!keys.includes(P().lastKey))keys.push(P().lastKey);} out.tiers.at=R().tierAt; out.tiers.seen=seen; out.tiers.keys=keys; rel(); out.tiers.t3kind=last().kind; BK.sim(40);
      __rg(); P().rgFocus=100; hold(50); out.tiers.t1tier=R().tier; rel(); out.tiers.t1={kind:last().kind,focus:P().rgFocus,t1:G().read().stats.tier1}; BK.sim(40);
      __rg(); hold(80); out.tiers.t2tier=R().tier; rel(); out.tiers.t2={kind:last().kind,t2:G().read().stats.tier2,focused:G().read().stats.focused}; BK.sim(40);
      for(const [n,nf] of [[50,1],[80,2],[115,3]]){__rg();P().st=100;const st0=P().st;hold(n);P().st=st0;rel();out.tiers['st'+nf]=Math.round(st0-P().st);BK.sim(40);}
      __rg(); const q0=P().rgQ; const f=__foe(90,'sprig',5000); f.h=28; BK.sim(1); const hp3=f.hp; hold(114); BK.step(1); out.tiers.t3tier=R().tier; out.tiers.key3=P().lastKey; K.atk=false; BK.step(3); out.tiers.looseKey=P().lastKey; const ar=R().arrows.filter(a=>a.kind==='fan'); out.tiers.fan={kinds:ar.length,vys:ar.map(a=>Math.round(a.vy)).sort((a,b)=>a-b),free:ar.filter(a=>a.free).length,rgQ:q0-P().rgQ,looseKey:out.tiers.looseKey}; BK.sim(22); out.tiers.fan.hits=G().read().stats.fanHits; out.tiers.fan.lost=hp3-f.hp; out.tiers.fan.pinned=+(f.pinned||0); f.alive=false; BK.sim(30);
      __rg(); { const g=__foe(90,'sprig',5000); g.h=28; BK.sim(1); const hp2=g.hp; hold(80); rel(); BK.sim(25); out.tiers.pierceLost=hp2-g.hp; g.alive=false; BK.sim(10); }
      __rg(); const bz=__foe(90,'sprig',5000); bz.mini=true; BK.sim(1); const hpb=bz.hp; hold(115); rel(); BK.sim(25); out.tiers.big={pinned:+(bz.pinned||0).toFixed(2),lost:hpb-bz.hp}; bz.alive=false; BK.sim(10);
      __rg(); K.atk=true; BK.press('atk'); let fired=-1; for(let i=0;i<400;i++){BK.sim(1);if(R().arrows.length&&fired<0)fired=i;} K.atk=false; BK.sim(2); out.tiers.auto={fired,kind:(R().arrows[0]||{}).kind}; BK.sim(20); }
    /* bash: the parry on the beat, the riposte arrow, off the beat, red */
    { __rg(); const e=__foe(14,'sprig',5000); BK.sim(1); P().st=P().maxSt; __c(); let hp0=P().hp; const res=BKT.damagePlayer(e.x,10,{who:e}); out.bash={res,lost:hp0-P().hp,ripT:+(P().riposteT||0).toFixed(2),foeVx:Math.round(e.vx),parries:G().read().stats.parries};
      BK.sim(20); e.alive=false; __tap(); const a=last(); out.bash.ripTag=a.tag; BK.sim(30);
      __rg(); const f=__foe(14,'sprig',5000); BK.sim(1); __c(); BK.sim(18); P().inv=0; hp0=P().hp; BKT.damagePlayer(f.x,10,{who:f}); out.bash.lateLost=hp0-P().hp;
      __rg(); const g=__foe(14,'sprig',5000); BK.sim(1); __c(); P().inv=0; hp0=P().hp; BKT.damagePlayer(g.x,10,{who:g,unblockable:true}); out.bash.redLost=hp0-P().hp; g.alive=false; f.alive=false; }
    /* snare */
    { __rg(); K.down=true; __c(); BK.sim(2); K.down=false; out.snare={n:R().snares.length}; const e=__foe(0,'sprig',5000); e.cd=0; BK.sim(4); out.snare.stagger=+(e.stagger||0).toFixed(2); out.snare.snared=G().read().stats.snared; e.alive=false; }
    /* backflip, and a shot in it */
    { __rg(); const x0=P().x; BK.press('dodge'); BK.sim(3); out.flip={face:P().face,vx:Math.round(P().vx),vy:Math.round(P().vy),flip:R().flip}; __tap(); out.flip.shots=G().read().stats.flipShots; BK.sim(40); out.flip.moved=Math.round(P().x-x0);
      __rg(); K.right=true; BK.press('dodge'); BK.sim(3); out.flip.fwdVx=Math.round(P().vx); out.flip.fwdFlip=R().flip; K.right=false; BK.sim(30); }
    /* skills */
    const IDS=['rgVolley','rgHawk','rgLeap','rgBearTrap','rgRain','rgSmoke','rgRefill','rgHeart','rgWildHunt']; out.skills={};
    for(const id of IDS){__rg([id],24);__foe(40);BK.sim(2);P().st=P().maxSt;if(id==='rgRefill')P().rgQ=0;const st=P().st,q=R().q;BK.press('throw');BK.sim(3);out.skills[id]={cd:+((P().cds||{})[id]||0).toFixed(1),spent:Math.round(st-P().st),q:R().q-q};BK.sim(90);}
    /* art */
    const set=BKT.heroSet('bracken','steel',false,'ranger');const need=['idle','run','jump','fall','land','takeoff','apex','skid','climb','atk','atkB','atkC','air','plunge','hurt','crouch','slide','block','dashAtk','cast','fidget','dance','dance2','dance3','follow','slump','swim','tread','roll','rise','sweep','airUp','windup','heavy','blast','parry','ripo',
      'rgShot','rgAirShot','rgLoose','rgRise','rgDown','rgBash','rgSnare','rgMark','rgHawkPose','rgLeapPose','rgVolleyPose','rgTrapPose','rgRainPose','rgSmokePose','rgRefillPose','rgHeartPose','rgHuntPose',
      'rgDraw2','rgDraw3','rgKneelDraw2','rgKneelDraw3','rgLoose2','rgLoose3'];   /* (claude/chargetiers: the three-tier draw's own bodies) */
    const gold=BKT.heroSet('bracken','ember',false,'ranger');const diff=(a,b)=>{const A=a.getContext('2d').getImageData(0,0,a.width,a.height).data,B=b.getContext('2d').getImageData(0,0,b.width,b.height).data;let n=0;for(let i=0;i<A.length;i+=4){if(A[i]!==B[i]||A[i+1]!==B[i+1]||A[i+2]!==B[i+2])n++;}return n;};
    out.art={missing:need.filter(k=>!set.R[k]),skinDiff:diff(set.R.idle[0],gold.R.idle[0])};
    return out;})()`);
  console.log(JSON.stringify(r));
  const has = (t, v) => [].concat(t || []).includes(v);
  ok(r.quick.q1 === r.quick.q0 - 1 && r.quick.kind === 'quick' && has(r.quick.tag, 'shot'), 'quick: a tap did not loose a quick shot from the quiver: ' + JSON.stringify(r.quick));
  ok(r.quick.land >= 50 && r.quick.land <= 95, 'quick: it should land 50-95 px out (short): ' + r.quick.land);
  ok(r.draw.c0 && r.draw.charge > 0 && Math.abs(r.draw.moved) <= 1 && r.draw.flying === 0, 'draw: held X should draw, rooted, and not loose by itself: ' + JSON.stringify(r.draw));
  ok(r.draw.kind === 'draw' && has(r.draw.tag, 'heavy') && r.draw.full === 1, 'draw: a full draw should be a HEAVY arrow: ' + JSON.stringify(r.draw));
  ok(r.draw.land >= 125 && r.draw.land <= 185 && r.draw.land > r.quick.land + 40, 'draw: a full draw should land 125-185 px out, well past a tap: ' + r.draw.land);
  ok(r.quiver.stuck === 2 && r.quiver.left === 0 && r.quiver.after === r.quiver.q1 + 2 && r.quiver.picked === 2, 'quiver: walking over the stuck arrows should take them back: ' + JSON.stringify(r.quiver));
  ok(r.quiver.emptyAtk && r.quiver.emptyArrows === 0, 'quiver: empty, X should be the knife: ' + JSON.stringify(r.quiver));
  ok(r.quiver.trickle === 1, 'quiver: one arrow should trickle back in ~8 s: ' + r.quiver.trickle);
  ok(r.restock.duck && r.restock.quick === 0, 'restock: a quick duck (0.3 s) must not restock: ' + JSON.stringify(r.restock));
  ok(r.restock.at1s === 0 || r.restock.at1s === 1, 'restock: about one arrow in the first second after the delay: ' + JSON.stringify(r.restock));
  ok(r.restock.at2s >= 1 && r.restock.at2s <= 2 && r.restock.full === r.restock.max, 'restock: crouching still fills the quiver, one arrow per ~1.3 s: ' + JSON.stringify(r.restock));
  ok(r.restock.rt === 0 && r.restock.afterMove === 0, 'restock: moving cancels it and resets the delay: ' + JSON.stringify(r.restock));
  ok(r.knife.atk && r.knife.arrows === 0 && r.knife.sweep === 'sweep' && r.knife.sweepArrows === 0, 'knife: point-blank X and DOWN+X should be the knife: ' + JSON.stringify(r.knife));
  ok(r.rise.kind === 'rise' && has(r.rise.tag, 'rise'), 'rise: UP+X should be the rising shot, tagged rise: ' + JSON.stringify(r.rise));
  ok(r.down.kind === 'down' && has(r.down.tag, 'plunge') && r.down.vy < 0 && !r.down.plunge, 'down: DOWN+X in the air should shoot down (plunge tag) and hop her up: ' + JSON.stringify(r.down));
  ok(r.down.hit > 0, 'down: the downward shot should land on a foe under her: ' + r.down.hit);
  ok(r.focus.sweet > 0 && r.focus.close === 0 && r.focus.closeHit > 0, 'focus: the sweet spot should fill it and point-blank should not: ' + JSON.stringify(r.focus));
  ok(r.mark.on && r.mark.focus === 0 && r.mark.marked > r.mark.plain * 1.2, 'mark: UP+C on full focus should mark (and its blows land harder): ' + JSON.stringify(r.mark));
  ok(r.pierce.hits === 2 && r.pierce.focus === 0 && r.pierce.n === 1 && r.pierce.focused === 1, 'pierce: the draw held to T2 should go through both (FOCUSED on a full focus): ' + JSON.stringify(r.pierce));
  { const t = r.tiers;   /* (claude/chargetiers) THE THREE-TIER DRAW */
    ok(t.seen.join() === '1,2,3' && t.at[0] < t.at[1] && t.at[1] < t.at[2] && t.at[1] - t.at[0] >= 0.4 && t.at[2] - t.at[1] >= 0.4, 'tiers: the hold climbs T1, T2, T3 at least 0.4 s apart: ' + JSON.stringify(t));
    ok(t.keys.includes('rgDraw2') && t.keys.includes('rgDraw3'), 'tiers: T2 and T3 held each show their own draw pose: ' + JSON.stringify(t.keys));
    ok(t.t1tier === 1 && t.t1.kind === 'draw' && t.t1.focus === 100 && t.t1.t1 === 1, 'tiers: let go at T1 a LONG SHOT, the focus kept: ' + JSON.stringify(t.t1));
    ok(t.t2tier === 2 && t.t2.kind === 'pierce' && t.t2.t2 === 1 && t.t2.focused === 0, 'tiers: let go at T2 a PIERCING SHOT (no focus: not focused): ' + JSON.stringify(t.t2));
    ok(t.t3tier === 3 && t.fan.kinds === 3 && t.fan.vys[0] < 0 && t.fan.vys[2] > 0 && t.fan.vys[1] === 0 && t.fan.looseKey === 'rgLoose3' && t.key3 === 'rgDraw3', 'tiers: let go at T3 a TRIPLE SHOT, three flat arrows in a tight fan: ' + JSON.stringify(t.fan) + ' ' + t.key3);
    ok(t.fan.rgQ === 1 && t.fan.free === 2, 'tiers: the fan costs ONE arrow of her quiver (the flankers are free): ' + JSON.stringify(t.fan));
    ok(t.fan.hits === 3 && t.fan.pinned === 0 && t.fan.lost > t.pierceLost * 1.4, 'tiers: all three land on a 28 px foe at 90 px, hold nothing, and out-damage the piercing shot (' + t.fan.lost + ' vs ' + t.pierceLost + '): ' + JSON.stringify(t.fan));
    ok(t.big.lost > 0 && !(t.big.pinned > 0), 'tiers: a mini-like foe takes the fan and is never held: ' + JSON.stringify(t.big));
    ok(t.st1 < t.st2 && t.st2 < t.st3, 'tiers: each tier costs more wind: ' + [t.st1, t.st2, t.st3]);
    ok(t.auto.fired > 0 && t.auto.kind === 'fan', 'tiers: held at T3 it goes by itself, a triple shot: ' + JSON.stringify(t.auto));
    ok(t.t3kind === 'fan', 'tiers: the climb ends in a fan: ' + t.t3kind); }
  ok(r.bash.res === 'blocked' && r.bash.lost === 0 && r.bash.ripT > 0 && r.bash.foeVx > 150 && r.bash.parries === 1, 'bash: C on the beat should parry and throw the foe back out: ' + JSON.stringify(r.bash));
  ok(has(r.bash.ripTag, 'riposte') && has(r.bash.ripTag, 'shot'), 'bash: the arrow after the parry should be the riposte: ' + JSON.stringify(r.bash.ripTag));
  ok(r.bash.lateLost > 0 && r.bash.redLost > 0, 'bash: off the beat, or a red blow, should land: ' + JSON.stringify(r.bash));
  ok(r.snare.n === 1 && r.snare.snared === 1 && r.snare.stagger > 1, 'snare: DOWN+C should set a snare that holds a foe: ' + JSON.stringify(r.snare));
  ok(r.flip.face === 1 && r.flip.vx < 0 && r.flip.vy < 0 && r.flip.flip && r.flip.shots === 1 && r.flip.moved < -20, 'flip: the dodge should be a backflip she can shoot in: ' + JSON.stringify(r.flip));
  ok(r.flip.fwdVx > 0 && !r.flip.fwdFlip, 'flip: a way held toward her face should roll forward: ' + JSON.stringify(r.flip));
  for (const [id, s] of Object.entries(r.skills)) ok(s.cd > 0 && (s.spent > 0 || (id === 'rgRefill' && s.q > 0)), 'skill ' + id + ' did not fire: ' + JSON.stringify(s));
  ok(!r.art.missing.length, 'art: missing keys ' + r.art.missing);
  ok(r.art.skinDiff > 0 && r.art.skinDiff < 40, 'art: a weapon skin changed ' + r.art.skinDiff + ' pixels of her idle (only the bow should change)');
  /* (Daniel 10-15) HER STANCE: KNIFE makes X (tap and hold) the knife and keeps the quiver; BOW again shoots. UP+C below full focus says why, and marks nothing */
  const s = await pg.evalp(`(()=>{const P=()=>BK.P,K=BK.keys,R=()=>BK.rg(),G=()=>BK.rgk(),out={};
    __rg(); __foe(60); out.st0=G().stance(); G().toggleStance(); out.st1=G().stance(); const q0=R().q; __tap(); BK.sim(20); out.tapQ=R().q-q0; out.tapArrows=R().arrows.length;
    K.atk=true; BK.press('atk'); BK.sim(70); K.atk=false; BK.sim(30); out.holdQ=R().q-q0; out.holdArrows=R().arrows.length;
    G().toggleStance(); out.st2=G().stance(); BK.sim(30); __tap(); BK.sim(5); out.bowArrows=R().arrows.length;
    __rg(); __foe(60); P().rgFocus=40; K.up=true; __c(); BK.sim(2); K.up=false; out.marks=G().read().stats.marks; out.said=!!P().rgFocusSaid; return out;})()`);
  ok(s.st0 === 'bow' && s.st1 === 'knife' && s.st2 === 'bow', 'stance: she starts in BOW and toggles KNIFE / BOW: ' + JSON.stringify(s));
  ok(s.tapQ === 0 && s.tapArrows === 0 && s.holdQ === 0 && s.holdArrows === 0, 'stance: in KNIFE a tap and a held X loose no arrow and spend none: ' + JSON.stringify(s));
  ok(s.bowArrows === 1, 'stance: back in BOW a tap looses an arrow: ' + JSON.stringify(s));
  ok(s.marks === 0 && s.said, 'UP+C below full focus marks nothing and says why: ' + JSON.stringify(s));
  assert.deepEqual(pg.errors, []);
} finally { pg.close(); }
if (fails.length) { console.log('FAIL\n  ' + fails.join('\n  ')); process.exit(1); }
console.log('ranger: OK');
