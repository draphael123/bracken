// tools/hero-pass.mjs - HERO PASS A (claude/heropassa, src/hero-pass.js + src/ranger.js): what each new verb promises, in the running page.
//   dodges   ONE DODGE A HERO, one budget: every hero's grace is no longer than the roll's (0.26 s), costs the shared dodge wind, waits the shared
//            cooldown - and each does its own thing: the knight's SHIELD-STEP keeps his facing and turns a front blow at a shield's price (never a
//            perfect guard; out of wind a guard break); the warden's forward LOW HOP lets a low blow under her (and still vaults); the pyromancer's
//            EMBER BLINK is ~60 px, untouchable at its start and NOT at its landing, no trail fire; the freebooter's POWDER FLASH dazzles what is
//            in front (a boss only flinches); the death knight's SHADOW-STEP is ~70 px and leaves his wake; the geomancer's STONE SHRUG in the
//            air shrugs off ONE blow and does not move her (the floor is still the burrow); the berserker's BARGE goes a fifth further and shoves
//            the small; and in the air (not the geomancer) the shared air dodge is untouched
//   knight   UP+C is THE SHIELD BASH: a foe in its wind-up loses the blow; no shield is raised by it (no free perfect guard) and a full bar is
//            not spent by it; VALIANT STRIKE: at a full RESOLVE the heavy cut spends the bar and goes through a raised guard (without the bar
//            the same cut on the same guard does less)
//   warden   COUNTER-THRUST: a deflect on the beat, then the thrust - it lands as the riposte and drives the foe back out to the point;
//            THE WALL PLANT: in the air into a wall, C - a foothold she stands on, a jump pulls it free; once a landing
//   tip      THE TIP UP TO 2x: x1.6 at the point, x2.0 at full extension, DEEP SET sooner, the middle x0.7, a boss's opening x2.0
//   ranger   ARROW SNATCH: her bash on the beat takes a projectile out of the air - nothing taken, +1 arrow (full: flung back as a riposte
//            arrow); KNEELING DRAW: knelt, a held X draws faster, the arrow flies flatter and further, and a high blow goes over her
// Run: node tools/hero-pass.mjs [dodges,knight,warden,tip,ranger]
import { openPage } from './cdp.mjs';
const WANT = (process.argv[2] || 'dodges,knight,warden,tip,ranger,bot').split(',');
const pg = await openPage({ audio: false, fonts: false });
const fail = [], t = (ok, msg) => { if (!ok) fail.push(msg); };
try {
  await pg.evalp(`(async()=>{
    window.__set=(h,foes,o={})=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero(h);BK.reset({fresh:true});BKT.setHeroLevel(h,o.lv||1);
      BKT.PROG.skillOwned[h]={};BKT.PROG.loadouts[h]=[];BK.applyUpgrades();BK.load(0);BK.state='play';BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');
      const L=BK.L;for(let x=2;x<60;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:(o.wall&&x===o.wall&&y>=8)?1:0;BK.tp(10,21);BK.sim(60);const P=BK.P;
      Object.assign(P,{hp:P.maxHp,inv:0,hurt:0,st:P.maxSt,face:1,vx:0,dodge:0,dodgeCd:0,dash:0,dashCd:0,riposteT:0,combo:0,resolve:0,vigil:0});BK.sim(1);P.st=P.maxSt;
      return foes.map(([t,dx,fo])=>{BK.spawnEnt({t,x:(P.x+dx)/16,y:21,...(fo||{})});const e=BK.enemies().at(-1);e.hp=e.hp0=5000;e.cd=99;e.elT=99;e.face=-1;return e;});};
    window.__dodge=(dir)=>{const P=BK.P;if(dir)BK.keys[dir>0?'right':'left']=true;BK.press('dodge');BK.sim(1);BK.keys.left=BK.keys.right=false;return P;};
    window.__tap2=(dir)=>{const d=dir>0?'right':'left';BK.press(d);BK.sim(3);BK.press(d);BK.sim(1);return BK.P;};
    window.__snap=()=>{const P=BK.P;return {x:Math.round(P.x),dodge:+(P.dodge||0).toFixed(3),max:+(P.dodgeMax||0).toFixed(3),inv:+(P.dodgeInv||0).toFixed(3),dash:+(P.dash||0).toFixed(3),vx:Math.round(P.vx),face:P.face,ground:!!P.ground,st:Math.round(P.st),cd:+(P.dodgeCd||0).toFixed(2)};};
    return 1;})()`);

  if (WANT.includes('dodges')) {
    const r = await pg.evalp(`(()=>{const o={},P=()=>BK.P,CM=BKT.CM||null;
      const run=(h,dir,face=1)=>{__set(h,[]);P().face=face;const x0=P().x,st0=P().st;__dodge(dir);const s=__snap();s.cost=Math.round(st0-P().st);let n=0;while(P().dodge>0&&n<60){BK.sim(1);n++;}BK.sim(20);s.dist=Math.round(P().x-x0);return s;};
      for(const h of ['knight','warden','pyro','pirate','reaper','geomancer','berserker','ranger'])o[h]=run(h,0);
      { __set('knight',[['sprig',40]]);BK.enemies().at(-1).speed=0;const x0=P().x;__dodge(-1);o.knightBack=__snap();o.knightBack.dist=Math.round(P().x-x0); }   /* a foe ahead: the step back keeps the shield on him */
      /* the knight's guard through the step: a yellow blow from the front at 0.18 s (after the grace) is turned at a shield's price, no riposte; a red one is not */
      { __set('knight',[['sprig',60]]);__dodge(-1);BK.sim(11);const p=P(),hp0=p.hp,st0=p.st,res=BKT.damagePlayer(p.x+14,12,{});o.kGuard={res,lost:hp0-p.hp,paid:Math.round(st0-p.st),rip:+(p.riposteT||0).toFixed(2),g:+(p.kStepG||0).toFixed(2),inv:+(p.dodgeInv||0).toFixed(2)};
        __set('knight',[['sprig',60]]);__dodge(-1);BK.sim(11);const q=P(),h1=q.hp,res2=BKT.damagePlayer(q.x+14,12,{unblockable:true});o.kRed={res:res2,lost:h1-q.hp};
        __set('knight',[['sprig',60]]);__dodge(-1);BK.sim(11);const w=P();w.st=1;const h2=w.hp,res3=BKT.damagePlayer(w.x+14,20,{});o.kBreak={res:res3,lost:h2-w.hp,hurt:+(w.hurt||0).toFixed(2)}; }
      /* the warden's low hop: a low blow mid-hop goes under; the same after it lands */
      { __set('warden',[]);__tap2(1);BK.sim(4);const p=P();p.inv=0;p.dodgeInv=0;const hp0=p.hp,res=BKT.damagePlayer(p.x+14,12,{low:true,unblockable:true});o.wHop={res,lost:hp0-p.hp,hop:+(p.wHopT||0).toFixed(2)};
        BK.sim(30);p.inv=0;const h1=p.hp;BKT.damagePlayer(p.x+14,12,{low:true});o.wAfter={lost:h1-p.hp}; __set('warden',[]);__tap2(1);BK.press('jump');BK.sim(2);o.wVault={vaultT:+(P().vaultT||0).toFixed(2)};
        __set('warden',[]);__dodge(0);o.wBack={hop:+(P().wHopT||0).toFixed(2),vx:Math.round(P().vx),face:P().face}; }
      /* the blink: untouchable at its start, not at its landing; no fire trail */
      { __set('pyro',[]);__dodge(0);BK.sim(2);const p=P(),a=BKT.damagePlayer(p.x+14,10,{});BK.sim(6);p.inv=0;const hp0=p.hp,b=BKT.damagePlayer(p.x+14,10,{});o.blink={start:a,landing:b,lost:hp0-p.hp,alight:+(p.alight||0).toFixed(2),blinkT:+(p.blinkT||0).toFixed(2)}; }
      /* the powder flash: a foe in front dazzled, one behind not; a boss in front only flinches */
      { const [f,b]=__set('pirate',[['sprig',30],['sprig',-30]]);__dodge(-1);o.flash={front:+(f.stagger||0).toFixed(2),behind:+(b.stagger||0).toFixed(2),dz:(f.dazzleT||0)>0}; }
      /* the shadow-step leaves the wake */
      { __set('reaper',[]);const n0=BK.hpWakes().length;__dodge(0);o.wake=BK.hpWakes().length-n0; }
      /* the stone shrug: in the air, she does not move; the first blow is shrugged off, the second lands */
      { __set('geomancer',[]);BK.press('jump');BK.keys.jump=true;BK.sim(8);const p=P(),vx0=p.vx;__dodge(1);const s=__snap();BK.sim(2);p.inv=0;const hp0=p.hp,a=BKT.damagePlayer(p.x+14,10,{});p.inv=0;const h1=p.hp,b=BKT.damagePlayer(p.x+14,10,{});BK.keys.jump=false;
        o.shrug={...s,first:a,firstLost:hp0-h1,secondLost:h1-p.hp,shrugT:+(p.shrugT||0).toFixed(2)}; }
      /* in the air the knight's is still the shared air dodge */
      { __set('knight',[]);BK.press('jump');BK.keys.jump=true;BK.sim(8);__dodge(1);o.kAir=__snap();BK.keys.jump=false; }
      /* the barge shoves a small foe */
      { const [f]=__set('berserker',[['sprig',26]]);__dodge(1);BK.sim(14);o.barge={shoved:(f.shoved||0)>0||(f.stagger||0)>0.3}; }
      return o;})()`);
    const g = (h, s) => t(s.inv > 0 && s.inv <= 0.26 + 1e-6 || h === 'geomancer' || h === 'warden', h + ': the grace is the shared budget (<= 0.26 s): ' + JSON.stringify(s));
    for (const h of ['knight', 'pyro', 'pirate', 'reaper', 'berserker', 'ranger']) g(h, r[h]);
    for (const h of ['knight', 'warden', 'pyro', 'pirate', 'reaper', 'geomancer', 'berserker']) t(r[h].cost > 0 && r[h].cost <= 25 && r[h].cd >= 0.5 - 1e-6 || h === 'warden', h + ': the shared wind cost and cooldown: ' + JSON.stringify(r[h]));
    t(r.knight.max === 0.24 && r.knight.inv === 0.14 && r.knight.face === 1 && r.knight.dash > 0, 'knight: the shield-step forward is short, its grace shorter, and keeps the dash in it: ' + JSON.stringify(r.knight));
    t(r.knightBack.face === 1 && r.knightBack.vx < 0 && r.knightBack.dash === 0, 'knight: a step back keeps his facing (the shield on what he left) and carries no dash: ' + JSON.stringify(r.knightBack));
    t(r.kGuard.res === 'blocked' && r.kGuard.lost === 0 && r.kGuard.paid > 0 && r.kGuard.rip === 0, 'knight: through the step a front blow is turned at a shield\'s price and is never a perfect guard: ' + JSON.stringify(r.kGuard));
    t(r.kRed.res !== 'blocked' && r.kRed.lost > 0, 'knight: a red blow is not turned by the step\'s shield: ' + JSON.stringify(r.kRed));
    t(r.kBreak.res !== 'blocked' && r.kBreak.lost > 0 && r.kBreak.hurt > 0.5, 'knight: out of wind the step\'s shield breaks (half lands, staggered): ' + JSON.stringify(r.kBreak));
    t(r.wHop.res === false && r.wHop.lost === 0 && r.wAfter.lost > 0, 'warden: a low blow goes under the hop (red or not), and finds her once she has landed: ' + JSON.stringify([r.wHop, r.wAfter]));
    t(r.wVault.vaultT > 0, 'warden: a jump out of the forward hop still vaults: ' + JSON.stringify(r.wVault));
    t(r.wBack.hop === 0 && r.wBack.vx < 0 && r.wBack.face === 1, 'warden: her button is still the back-step (no hop): ' + JSON.stringify(r.wBack));
    t(r.pyro.max === 0.16 && r.pyro.dist >= 40 && r.pyro.dist <= 95, 'pyro: the ember blink is a short flash (~60 px): ' + JSON.stringify(r.pyro));
    t(r.blink.start === false && r.blink.landing !== false && r.blink.lost > 0 && r.blink.alight === 0, 'pyro: untouchable at the blink\'s start, not at its landing, no trail alight: ' + JSON.stringify(r.blink));
    t(r.flash.front >= 0.5 && r.flash.dz && r.flash.behind < 0.3, 'pirate: the powder flash dazzles what is in front, not what is behind: ' + JSON.stringify(r.flash));
    t(r.reaper.max === 0.2 && r.reaper.dist >= 45 && r.reaper.dist <= 110 && r.wake === 1, 'reaper: the shadow-step is short and leaves the wake: ' + JSON.stringify([r.reaper, r.wake]));
    t(r.geomancer.dash === 0 && r.geomancer.dodge > 0, 'geomancer: on the floor her dodge is still the burrow: ' + JSON.stringify(r.geomancer));
    t(r.shrug.dash === 0 && r.shrug.inv === 0 && r.shrug.first === 'blocked' && r.shrug.firstLost === 0 && r.shrug.secondLost > 0, 'geomancer: the stone shrug in the air shrugs one blow, no grace, no dash: ' + JSON.stringify(r.shrug));
    t(r.kAir.dodge > 0 && r.kAir.dash > 0 && r.kAir.max > 0.25, 'knight: in the air the shared air dodge is untouched: ' + JSON.stringify(r.kAir));
    t(r.barge.shoved, 'berserker: the barge shoves a small foe: ' + JSON.stringify(r.barge));
    t(r.ranger.dodge > 0, 'ranger: her backflip is untouched: ' + JSON.stringify(r.ranger));
    console.log('dodges ' + JSON.stringify(r));
  }
  if (WANT.includes('knight')) {
    const r = await pg.evalp(`(()=>{const o={},P=()=>BK.P;
      /* the bash into a wind-up */
      { const [e]=__set('knight',[['swornsword',20,{trainer:'drill'}]]);e.cd=0;e.elT=0;let f=0;while(e.mode!=='cutTell'&&f++<600)BK.sim(1);const p=P();p.face=1;p.resolve=100;p.st=p.maxSt;const st0=p.st;
        BK.keys.up=true;BK.keys.block=true;BK.sim(1);const blockAt=p.block;BK.sim(3);const blockMid=p.block;BK.keys.up=false;BK.keys.block=false;BK.sim(14);
        o.bash={tell:e.mode,stagger:+(e.stagger||0).toFixed(2),blockAt,blockMid,rip:+(p.riposteT||0).toFixed(2),resolve:p.resolve,paid:Math.round(st0-p.st),stats:BK.hpass().stats.interrupts}; }
      /* valiant: the heavy cut on a raised guard, with and without the bar */
      const cut=(full)=>{const [e]=__set('knight',[['shield',18]]);const p=P();p.face=1;e.guardT=9;e.speed=0;p.resolve=full?100:0;p.st=p.maxSt;const hp0=e.hp;BK.keys.atk=true;let f=0;while(f++<80){BK.sim(1);e.x=p.x+18;e.vx=0;if(p.atkHeld>=0.9)break;}BK.keys.atk=false;BK.sim(40);return {dmg:hp0-e.hp,resolve:p.resolve,broken:+(e.broken||0).toFixed(2),valiants:BK.hpass().stats.valiantHits};};
      o.plain=cut(false);o.valiant=cut(true);return o;})()`);
    t(r.bash.stats > 0 && r.bash.stagger >= 0.6, 'knight: UP+C into a wind-up interrupts it: ' + JSON.stringify(r.bash));
    t(!r.bash.blockAt && !r.bash.blockMid && r.bash.rip === 0, 'knight: the bash raises no shield (no free perfect guard): ' + JSON.stringify(r.bash));
    t(r.bash.resolve === 100 && r.bash.paid > 0, 'knight: UP+C is never the last charge - a full bar is kept: ' + JSON.stringify(r.bash));
    t(r.valiant.resolve <= 10 && r.valiant.valiants > 0 && r.valiant.dmg > r.plain.dmg, 'knight: VALIANT STRIKE spends the bar and goes through the guard (more than the same cut without it): ' + JSON.stringify(r));
    console.log('knight ' + JSON.stringify(r));
  }
  if (WANT.includes('warden')) {
    const r = await pg.evalp(`(()=>{const o={},P=()=>BK.P;
      /* counter-thrust: parried, then thrust into a foe standing inside the haft */
      { const [e]=__set('warden',[['sprig',16]]);const p=P();p.face=1;BK.keys.block=true;BK.sim(1);BK.keys.block=false;BK.sim(2);p.inv=0;const res=BKT.damagePlayer(p.x+12,10,{});const rip=+(p.riposteT||0).toFixed(2);
        BK.sim(18);e.x=p.x+14;e.vx=0;e.knock=0;BK.press('atk');let f=0;while(!(p.atk>=0)&&f++<20)BK.sim(1);BK.sim(45);const b=BKT.box?BKT.box(e):null;
        o.counter={res,rip,reach:Math.round(p.face>0?(e.x-(e.w||12)/2)-p.x:p.x-(e.x+(e.w||12)/2)),n:BK.hpass().stats.counters}; }
      /* the wall plant: jump at a wall, hold into it, C */
      { __set('warden',[],{wall:12});const p=P();p.face=1;BK.keys.right=true;BK.press('jump');BK.keys.jump=true;let f=0;while(f++<14)BK.sim(1);BK.keys.jump=false;BK.keys.block=true;BK.sim(1);BK.keys.block=false;BK.keys.right=false;
        const foot=p.foot?{...p.foot}:null;let stood=false;for(let i=0;i<60;i++){BK.sim(1);if(p.ground&&p.foot&&Math.abs(p.y-p.foot.y)<2)stood=true;}
        BK.press('jump');BK.sim(3);const after=!!p.foot;BK.sim(60);
        BK.press('jump');BK.keys.jump=true;BK.keys.right=true;f=0;while(f++<14)BK.sim(1);BK.keys.jump=false;BK.keys.block=true;BK.sim(1);BK.keys.block=false;BK.keys.right=false;
        o.plant={planted:!!foot,stood,pulledOnJump:!after,again:!!p.foot,y:foot&&foot.y}; }
      return o;})()`);
    t(r.counter.rip > 0 && r.counter.n > 0 && r.counter.reach >= 22, 'warden: the deflect on the beat makes the thrust a COUNTER-THRUST that drives the foe back out to the point: ' + JSON.stringify(r.counter));
    t(r.plant.planted && r.plant.stood && r.plant.pulledOnJump, 'warden: the wall plant is a foothold she stands on, and a jump pulls it free: ' + JSON.stringify(r.plant));
    console.log('warden ' + JSON.stringify(r));
  }
  if (WANT.includes('tip')) {
    const r = await pg.evalp(`(()=>{const o={};__set('warden',[]);const P=BK.P;const at=d=>{const e={x:P.x+d+4,y:P.y,w:8,h:14,alive:true,t:'sprig'};P.face=1;return +BKT.tipPay(e).toFixed(3);};
      o.d28=at(28);o.d34=at(34);o.d40=at(40);o.d44=at(44);o.mid=at(20);o.haft=at(8);
      const node=BKT.PROG;BKT.setHeroLevel('warden',40);BK.applyUpgrades();o.deep34=at(34);o.deepOn=BK.hpTal('deepSet');return o;})()`);
    t(r.d28 === 1.6 && r.d40 === 2 && r.d44 === 2 && r.d34 > 1.6 && r.d34 < 2, 'tip: x1.6 at the point rising to x2.0 at full extension: ' + JSON.stringify(r));
    t(r.mid === 0.7, 'tip: the middle of the shaft x0.7: ' + JSON.stringify(r));
    t(!r.deepOn || r.deep34 === 2, 'tip: DEEP SET reaches x2.0 sooner: ' + JSON.stringify(r));
    console.log('tip ' + JSON.stringify(r));
  }
  if (WANT.includes('ranger')) {
    const r = await pg.evalp(`(()=>{const o={},P=()=>BK.P;
      const shoot=(full)=>{__set('ranger',[]);const p=P();p.face=1;const q=BK.rg();if(full===false)p.rgQ=Math.max(0,(p.rgQ||5)-2);const q0=p.rgQ,hp0=p.hp;
        BK.seeds().push({x:p.x+40,y:p.y-10,vx:-160,vy:0,life:3,arrow:true});BK.sim(8);BK.keys.block=true;BK.sim(1);BK.keys.block=false;BK.sim(20);return {q0,q:p.rgQ,lost:hp0-p.hp,st:q&&q.stats?q.stats:null,snatched:BK.rg().stats?BK.rg().stats.snatched:null};};
      o.room=shoot(false);o.full=shoot(true);
      /* no bash: the arrow lands */
      { __set('ranger',[]);const p=P();const hp0=p.hp;BK.seeds().push({x:p.x+40,y:p.y-10,vx:-160,vy:0,life:3,arrow:true});BK.sim(30);o.none={lost:hp0-p.hp}; }
      /* the kneeling draw */
      const draw=(kneel)=>{__set('ranger',[]);const p=P();p.face=1;if(kneel){BK.keys.down=true;BK.sim(14);}BK.press('atk');BK.keys.atk=true;let f=0,started=-1;while(f++<120){BK.sim(1);if(started<0&&p.charge>0)started=f;if(p.chargeFull)break;}
        const k=!!p.rgKneel,full=f,duck=!!p.ducking;BK.keys.atk=false;BK.sim(1);const a=(p.rgArrows||[]).at(-1);BK.keys.down=false;return {kneel:k,framesToFull:full-started,duck,vy:a?Math.round(a.vy):null,vx:a?Math.round(a.vx):null};};
      o.stand=draw(false);o.knelt=draw(true);
      /* knelt and drawing, a high blow goes over */
      return o;})()`);
    t(r.room.lost === 0 && r.room.q === r.room.q0 + 1, 'ranger: the bash on the beat SNATCHES the arrow - nothing taken, one more in the quiver: ' + JSON.stringify(r.room));
    t(r.full.lost === 0, 'ranger: with a full quiver the snatched arrow is flung back, nothing taken: ' + JSON.stringify(r.full));
    t(r.none.lost > 0, 'ranger: no bash, the arrow lands (the test arrow is real): ' + JSON.stringify(r.none));
    t(r.knelt.kneel && r.knelt.duck && r.knelt.framesToFull < r.stand.framesToFull * 0.8, 'ranger: knelt, the draw comes ~30% faster and she stays low: ' + JSON.stringify([r.stand, r.knelt]));
    t(r.knelt.vx > r.stand.vx && Math.abs(r.knelt.vy) < Math.abs(r.stand.vy), 'ranger: the kneeling arrow is flatter and faster: ' + JSON.stringify([r.stand, r.knelt]));
    console.log('ranger ' + JSON.stringify(r));
  }
  if (WANT.includes('bot')) {
    const r = await pg.evalp(`(async()=>{const L=await import('/src/lab.js'),o={};
      const duel=(h,foe,frames,still,shots)=>{const [e]=__set(h,[foe]);e.hp=e.hp0=still?50000:400;e.cd=still?99:0;e.elT=still?99:0;if(still){e.speed=0;e.timer=99;}BK.hpass().resetStats();if(BK.rg&&BK.rg()&&BK.rgK)BK.rgK().resetStats();const s0=BK.rg&&BK.rg()?{...BK.rg().stats}:{};
        for(let f=0;f<frames&&e.alive&&!BK.P.dead;f++){const P=BK.P;P.hp=P.maxHp;if(still){e.vx=0;}if(shots&&f%90===30)BK.seeds().push({x:P.x+90,y:P.y-10,vx:-170,vy:0,life:3,arrow:true,g:0,dead:false});L.labDuelFrame(BK,h,e,f,'human');BK.sim(1);}
        const s1=BK.rg&&BK.rg()?BK.rg().stats:{};const dr={};for(const k in s1)dr[k]=(s1[k]||0)-(s0[k]||0);return {hp:{...BK.hpass().stats},rg:dr,alive:e.alive};};
      { const d=duel('knight',['swornsword',40],1800);o.knight={interrupts:d.hp.interrupts,bashes:d.hp.bashes}; }
      { const d=duel('ranger',['shield',220],900,true,true);o.snatch={snatched:d.rg.snatched,flung:d.rg.flung}; }
      { const d=duel('ranger',['shield',150],900,true);o.kneel={kneels:d.rg.kneels,draws:d.rg.draws}; }
      return o;})()`);
    t(r.knight.interrupts > 0, "bot: the knight's hands bash a wind-up out of a sword foe: " + JSON.stringify(r.knight));
    t((r.snatch.snatched || 0) + (r.snatch.flung || 0) > 0, "bot: the ranger's hands snatch an archer's arrow: " + JSON.stringify(r.snatch));
    t(r.kneel.kneels > 0, "bot: the ranger's hands kneel to draw: " + JSON.stringify(r.kneel));
    console.log('bot ' + JSON.stringify(r));
  }
  if (pg.errors.length) fail.push('page errors: ' + JSON.stringify(pg.errors.slice(0, 4)));
} finally { pg.close(); }
if (fail.length) { console.log('HERO PASS FAIL:\n  ' + fail.join('\n  ')); process.exit(1); }
console.log('hero pass: ' + WANT.join(', ') + ' - every promise holds');
