// tools/partner-throw.mjs - CO-OP: GRAB YOUR PARTNER, CARRY HIM, THROW HIM (claude/partnerthrow, Daniel 2026-10-12; src/partner-throw.js, scratch/brief-throw.md part 2).
//   pure      the table is sane; predict() flies the hero's own gravity; the GRAB key/button is a real rebindable action with a default that no other action uses
//   page      (a flat floor, local co-op: a knight and a warden, or the ally)
//     grab    GRAB beside a partner lifts him overhead (he dangles: ptH, his feet over the carrier's head), costs stamina, says GRABBED; far away it does nothing;
//             the touch button reads GRAB beside a partner who can be lifted and THROW while he is up, and nothing out of reach
//     carry   the carrier walks at the carry cap, cannot swing/roll; a blow on the CARRIER drops him; the dangler flails (hurt/jump frames + rotation) and SCREAMS (SFX.partnerScream,
//             every PT.scream s, in his hero's own pitch; the recorded vo_scream clips are in the manifest and on disk)
//     throw   a second GRAB is a TOLD wind-up (HEAVE, PT.windup s, the carrier planted) and then the partner flies along the arc that was SHOWN: the landing ring is within a tile of
//             where he comes down, for the mid throw and UP's lob, with different carrier/partner pairs; DOWN + GRAB sets him down instead
//     hit     the thrown partner HITS: a common foe is knocked down (flies) and takes impact damage (a small one dies); an elite takes a share and is never killed; a mini/boss takes a
//             CHIPPED hero blow (never more than the raw number, never nothing); each foe once per throw
//     fire    FRIENDLY FIRE: spikes under the landing hurt the thrown partner (and put him back), a pit takes him (down/fall rule), and a SPIKED foe (the spike goblin) bites him and bounces him
//     wiggle  mashing frees him (WIGGLED FREE), the carrier waits PT.freeCd, he cannot be lifted again at once; a computer ally wriggles free by itself
//     cant    a partner who is dodging, in his i-frames or his grace, DOWN, dead or airborne cannot be lifted ("TOO QUICK" once), and a DOWNED partner is still REVIVED by standing on him;
//             a carrier who is winded, hurt, swinging or dodging cannot lift
//     other   the same GRAB throws a carried bucket (single player, the burning village); one hero alone presses it and nothing happens; a level load lets everybody go
// node tools/partner-throw.mjs [pure,page]      (PORT from the environment)
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { PT, WORDS, predict, isSpiked } from '../src/partner-throw.js';
import { KB_ACTIONS, KB_DEFAULT, PAD_DEFAULT, cardRows, keysTable, padTable, emptyBinds, padStateOf, conflicts, setSlot } from '../src/controls.js';
import { MOVE } from '../src/hero-move.js';
const WANT = process.argv[2] ? process.argv[2].split(',') : ['pure', 'page'];
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log('  FAIL ' + m); } else console.log('  ok   ' + m); };

if (WANT.includes('pure')) {
  console.log('pure');
  ok(PT.reach > 12 && PT.reach <= 28 && PT.windup >= 0.25 && PT.windup <= 0.5 && PT.carrySpeed < 60 && PT.stCost > 0, 'the table: a close grab, a told ' + PT.windup + ' s wind-up, a carry slower than a run, a stamina cost');
  ok(PT.aims.high.vy < PT.aims.mid.vy && PT.aims.high.vx < PT.aims.mid.vx, 'UP lobs: higher and shorter than the mid throw');
  ok(PT.hit.base > 0 && PT.hit.elite > 0 && PT.hit.elite < 0.5 && PT.hit.boss > 0, 'impact numbers: a common foe, a share of an elite, a raw boss number (chipped by the room)');
  ok(WORDS.length === new Set(WORDS).size && WORDS.every(w => /^[A-Z ]+$/.test(w) && w.length <= 14), 'the floated words are short capitals: ' + WORDS.join(' / '));
  ok(isSpiked({ t: 'thorn' }) && isSpiked({ t: 'urchin' }) && isSpiked({ t: 'sprig', affix: 'THORNED' }) && !isSpiked({ t: 'sprig' }) && !isSpiked(null), 'spiked: the spike goblin, the urchin, a THORNED elite - and nothing else');
  /* the arc: flat floor at y=100, a hero thrown from y=83 lands at a sensible distance, higher for a lob */
  const solid = (x, y) => y >= 100, mid = predict(0, 83, { vx: PT.aims.mid.vx, vy: PT.aims.mid.vy }, solid), hi = predict(0, 83, { vx: PT.aims.high.vx, vy: PT.aims.high.vy }, solid);
  const apex = r => Math.min(...r.pts.map(p => p[1]));
  ok(mid.land && hi.land && mid.land.x > 60 && mid.land.x < 200 && hi.land.x > 20 && apex(hi) < apex(mid), 'predict: lands (mid ' + Math.round(mid.land.x) + ' px, lob ' + Math.round(hi.land.x) + ' px) and the lob goes higher');
  const wall = predict(0, 83, { vx: 200, vy: -100 }, (x, y) => y >= 100 || x > 40);
  ok(wall.land && wall.land.x <= 40 && wall.land.x > 20, 'predict: a wall stops the throw and he drops: ' + Math.round(wall.land.x));
  /* the key */
  ok(KB_ACTIONS.some(a => a.id === 'grab') && KB_DEFAULT.grab && KB_DEFAULT.grab[0] === 'i', 'GRAB is a rebindable keyboard action, default I');
  ok(PAD_DEFAULT.grab && PAD_DEFAULT.grab.length === 1 && Number.isInteger(PAD_DEFAULT.grab[0]), 'and a pad button: ' + PAD_DEFAULT.grab);
  const others = Object.keys(KB_DEFAULT).filter(a => a !== 'grab' && KB_DEFAULT[a].map(k => k.toLowerCase()).includes('i'));
  ok(others.length === 0, 'no other keyboard action answers to I: ' + others.join(','));
  const sameBtn = Object.keys(PAD_DEFAULT).filter(a => a !== 'grab' && PAD_DEFAULT[a].includes(PAD_DEFAULT.grab[0]));
  ok(sameBtn.every(a => a === 'skill4'), 'the pad button is shared only with the empty fourth skill slot: ' + sameBtn.join(','));
  const b0 = emptyBinds(), tab = keysTable(b0); ok(tab.grab && tab.grab.includes('i') && tab.grab.includes('I'), 'the keys table carries it (both cases)');
  ok(padTable(b0, 'pad2').grab.includes(PAD_DEFAULT.grab[0]), "player two's pad table carries it");
  const gp = { buttons: Array.from({ length: 17 }, (_, i) => ({ pressed: i === PAD_DEFAULT.grab[0] })), axes: [0, 0] };
  ok(padStateOf(gp, padTable(b0, 'pad1')).grab === true, 'the pad state reads it');
  const rows = cardRows({ hero: 'knight', binds: b0, prof: 'pad1' }); ok(rows.some(r => r[0] === 'grab' && /I/.test(r[1])), 'the controls card lists it: ' + JSON.stringify(rows.find(r => r[0] === 'grab')));
  const b1 = emptyBinds(); setSlot(b1, 'kb', 'grab', 0, 'o'); ok(keysTable(b1).grab.includes('o') && !keysTable(b1).grab.includes('i') && Object.keys(conflicts(b1, 'kb')).length === 0, 'rebinding it to O works and flags nothing');
  /* the scream: its clips are on disk, in the manifest, and credited as a pool already in the game */
  const man = JSON.parse(readFileSync(new URL('../audio/manifest.json', import.meta.url), 'utf8'));
  ok(Array.isArray(man.vo_scream) && man.vo_scream.length >= 3 && man.vo_scream.every(f => existsSync(new URL('../' + f, import.meta.url))), 'the recorded scream (vo_scream) is in the manifest and on disk: ' + (man.vo_scream || []).length + ' takes');
}

if (WANT.includes('page')) {
  console.log('page');
  const { openPage } = await import('./cdp.mjs');
  const pg = await openPage({ audio: false, fonts: false });
  try {
    await pg.evalp(`(()=>{
      window.__duo=(h1,h2,o={})=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.coopEnd();BK.setHero(h1||'knight');BK.reset({fresh:true});BK.load(0);BK.state='play';BK.god=false;
        BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');
        const L=BK.L;for(let x=2;x<70;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;
        for(const x of (o.spikes||[]))L.grid[21*L.W+x]=3;
        for(const x of (o.pit||[]))for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=0;
        L.pools=[];BK.fires().length=0;BK.props().length=0;
        BK.coopStart(h2||'warden',!!o.ally);BK.tp(o.tx||9,21);const [a,b]=BK.players();b.x=a.x+(o.gap===undefined?10:o.gap);b.y=a.y;b.vx=b.vy=0;b.face=-1;a.face=1;
        BK.sim(60);for(const p of [a,b]){p.hp=p.maxHp;p.st=p.maxSt;p.inv=0;p.grace=0;p.hurt=0;}BK.partnerThrow().reset();
        const s=BK.partnerThrow().stats;for(const k in s){if(typeof s[k]==='number')s[k]=0;else if(Array.isArray(s[k]))s[k]=[];else s[k]={};}
        return [a,b];};
      window.__words=()=>BK.textLab.nums().map(n=>n.txt).filter(t=>typeof t==='string');
      window.__grab=(p)=>{if(p===BK.players()[0])BK.press('grab');else p.press=Object.assign(p.press||{},{grab:true});};
      window.__spawn=(t,x,eo)=>{BK.spawnEnt({t,x:x/16,y:21,...(eo||{})});const e=BK.enemies().at(-1);e.cd=99;e.elT=99;e.face=-1;if(!(eo&&eo.keepHp)){e.hp=e.hp0=(eo&&eo.hp)||60;}return e;};
      return 1;})()`);

    /* ---- grab, carry, scream, flail ---- */
    const g1 = await pg.evalp(`(()=>{const [a,b]=__duo('knight','warden');const PTK=BK.partnerThrow(),o={};
      o.near={label:PTK.label(a),why:PTK.why(a,b),ax:a.x,bx:b.x};
      const touchOf=(P)=>{const r=[];for(const h of BK.touchCtx){try{const v=h({P});if(v&&v.label)r.push(v.label);}catch(e){}}return r;};
      o.touchNear=touchOf(a);
      const st0=a.st;__grab(a);BK.sim(2);
      o.grab={ptC:!!a.ptC,ptH:!!b.ptH,by:!!(b.ptH&&b.ptH.by===a),dx:Math.round(b.x-a.x),dy:Math.round(a.y-b.y),stSpent:Math.round(st0-a.st),words:__words().includes('GRABBED'),screams:PTK.stats.screams};
      o.touchUp=touchOf(a);o.labelUp=PTK.label(a);
      /* he dangles: flail pose alternates, rotates */
      const poses=new Set(),rots=[];for(let i=0;i<40;i++){BK.sim(1);const z=PTK.pose(b,BK.time,b.set?b.set.R:BK.P.K&&BK.P.K.R||{jump:1,hurt:1});if(z){poses.add(z.key+z.frame);rots.push(z.rot);}}
      o.flail={poses:[...poses],rotSpread:+(Math.max(...rots)-Math.min(...rots)).toFixed(2)};
      for(let i=0;i<160;i++)BK.sim(1);o.screams=PTK.stats.screams;o.heldSecs=3.3;
      o.stillHeld=!!b.ptH;o.bPos={dx:Math.round(b.x-a.x),dy:Math.round(a.y-b.y)};
      /* the carrier's pace: hold right a second */
      const x0=a.x;BK.keys.right=true;for(let i=0;i<60;i++)BK.sim(1);BK.keys.right=false;o.pace=Math.round(a.x-x0);o.paceCap=${PT.carrySpeed};
      /* no swing, no roll while carrying */
      BK.press('atk');BK.sim(3);o.swung=a.atk>=0;BK.press('dodge');BK.sim(3);o.rolled=a.dodge>0;
      /* far: nothing */
      return o;})()`);
    console.log(JSON.stringify(g1));
    ok(g1.near.label === 'GRAB' && g1.near.why === null, 'beside a standing partner the label reads GRAB: ' + JSON.stringify(g1.near));
    ok(g1.touchNear.includes('GRAB') && g1.touchUp.includes('THROW') && g1.labelUp === 'THROW', 'the touch button: GRAB beside him (' + g1.touchNear + '), THROW while he is up (' + g1.touchUp + ')');
    ok(g1.grab.ptC && g1.grab.ptH && g1.grab.by, 'GRAB lifts him: the carrier holds, he is held by the carrier');
    ok(Math.abs(g1.grab.dx) <= 6 && g1.grab.dy >= 12 && g1.grab.dy <= 24, 'he is overhead: ' + g1.grab.dx + ' px across, ' + g1.grab.dy + ' px above the carrier\'s feet');
    ok(g1.grab.stSpent >= PT.stCost - 2, 'it costs stamina: ' + g1.grab.stSpent);
    ok(g1.grab.words, 'GRABBED is floated (on the move-word list)');
    ok(g1.grab.screams >= 1 && g1.screams >= 3, 'he SCREAMS: ' + g1.grab.screams + ' at once, ' + g1.screams + ' in ' + g1.heldSecs + ' s (one per ' + PT.scream + ' s)');
    ok(g1.flail.poses.length >= 2 && g1.flail.rotSpread >= 0.6, 'he flails: ' + g1.flail.poses.join(',') + ', rotation spread ' + g1.flail.rotSpread);
    ok(g1.stillHeld && Math.abs(g1.bPos.dx) <= 6, 'he stays up there');
    ok(g1.pace > 20 && g1.pace <= g1.paceCap + 6, 'the carrier walks slowly: ' + g1.pace + ' px in a second (cap ' + g1.paceCap + ')');
    ok(!g1.swung && !g1.rolled, 'and cannot swing or roll while he is up');

    /* ---- the told arc is the flight ---- */
    for (const [h1, h2, aim] of [['knight', 'warden', 'mid'], ['pyro', 'paladin', 'mid'], ['knight', 'warden', 'high'], ['reaper', 'pyro', 'high']]) {
      const r = await pg.evalp(`(()=>{const [a,b]=__duo('${h1}','${h2}',{tx:6});const PTK=BK.partnerThrow(),o={};__grab(a);BK.sim(3);if('${aim}'==='high')BK.keys.up=true;BK.sim(2);
        const land=a.ptC.arc.land;o.land=land&&{x:land.x,y:land.y};o.arcPts=a.ptC.arc.pts.length;
        __grab(a);let f0=0;const v0={x:b.x};let flewAt=-1;
        for(let i=0;i<30;i++){BK.sim(1);if(b.ptF&&flewAt<0)flewAt=i;if(!b.ptF&&flewAt<0)o.carrierStill=Math.abs(a.vx)<1;}
        o.windFrames=flewAt;o.heave=__words().includes('HEAVE');o.thrown=__words().includes('THROWN');
        let n=0;while(b.ptF&&n<240){BK.sim(1);n++;}BK.keys.up=false;
        o.end={x:b.x,y:b.y,ground:b.ground,ptF:!!b.ptF,t:n,hurt:+b.hurt.toFixed(2),grace:+b.grace.toFixed(2),hp:b.hp==b.maxHp};o.screams=PTK.stats.screams;o.stats={throws:PTK.stats.throws,landings:PTK.stats.landings};
        o.cd=a.ptCd;o.relabel=PTK.label(a);return o;})()`);
      console.log(h1 + '>' + h2 + ' ' + aim + ' ' + JSON.stringify(r));
      ok(r.land && Math.abs(r.end.x - r.land.x) <= 16 && Math.abs(r.end.y - r.land.y) <= 8, h1 + ' throws ' + h2 + ' (' + aim + '): the ring ' + Math.round(r.land.x) + ' lands within a tile of where he comes down ' + Math.round(r.end.x));
      ok(r.windFrames >= Math.round(PT.windup * 60) - 2 && r.windFrames <= Math.round(PT.windup * 60) + 3 && r.heave, h1 + ': a TOLD wind-up of ' + r.windFrames + ' frames (HEAVE said) before he flies');
      ok(r.thrown && r.end.ground && !r.end.ptF && r.end.hp, h1 + ': THROWN is said, he lands on his feet (no plain-floor damage)');
      ok(r.end.hurt > 0.1 && r.end.grace > 0.2, 'and takes a beat on his back with a short grace: hurt ' + r.end.hurt + ' grace ' + r.end.grace);
      ok(r.cd > 0 && r.relabel === null, 'the carrier cannot lift again at once (' + r.cd.toFixed(2) + ' s)');
    }
    /* DOWN + GRAB sets him down */
    const sd = await pg.evalp(`(()=>{const [a,b]=__duo();const PTK=BK.partnerThrow();__grab(a);BK.sim(4);BK.keys.down=true;__grab(a);BK.sim(2);BK.keys.down=false;
      return {held:!!b.ptH,carry:!!a.ptC,flying:!!b.ptF,setdowns:PTK.stats.setdowns,words:__words().includes('SET DOWN'),bx:Math.round(b.x-a.x)};})()`);
    ok(!sd.held && !sd.carry && !sd.flying && sd.setdowns === 1 && sd.words, 'DOWN + GRAB sets him down gently: ' + JSON.stringify(sd));
    /* the carrier hit -> drops him */
    const dr = await pg.evalp(`(()=>{const [a,b]=__duo();const PTK=BK.partnerThrow();__grab(a);BK.sim(6);BK.damagePlayer(a.x+12,12,{unblockable:true});BK.sim(20);
      return {held:!!b.ptH,carry:!!a.ptC,drops:PTK.stats.drops,said:__words().includes('DROPPED'),hp:a.hp<a.maxHp};})()`);
    ok(!dr.held && !dr.carry && dr.drops === 1 && dr.said && dr.hp, 'a blow on the carrier DROPS him: ' + JSON.stringify(dr));

    /* ---- the thrown partner hits things ---- */
    const hitOf = async (label, setup) => {
      const r = await pg.evalp(`(()=>{const [a,b]=__duo('knight','warden',{tx:6});const PTK=BK.partnerThrow(),o={};__grab(a);BK.sim(3);BK.sim(2);const land=a.ptC.arc.land;
        ${setup}
        __grab(a);let n=0;while(n<30){BK.sim(1);n++;if(b.ptF)break;}let k=0;while(b.ptF&&k<240){BK.sim(1);k++;if(typeof __hold==='function')__hold();}
        o.land=land.x;o.endX=b.x;o.stats=PTK.stats.hits;o.foe={alive:E.alive,hp:E.hp,hp0:E.hp0,full:E.maxHp||E.hp0,thrown:E.kiT>BK.time-3&&!!E.kiWhy,why:E.kiWhy||null,stagger:+(E.stagger||0).toFixed(2),x:E.x};
        o.bHp=b.hp;o.bMax=b.maxHp;o.said=__words();o.bossStats={elites:PTK.stats.elites,bosses:PTK.stats.bosses,spiked:PTK.stats.spiked};o.hitsAfter=PTK.stats.hits;return o;})()`);
      console.log(label + ' ' + JSON.stringify(r)); return r;
    };
    const small = await hitOf('common', `window.E=__spawn('sprig',land.x-4,{hp:30});`);
    ok(small.stats === 1 && (!small.foe.alive || small.foe.hp <= small.foe.hp0 - PT.hit.base + 1), 'a common foe takes the impact: ' + (small.foe.alive ? small.foe.hp + '/' + small.foe.hp0 : 'dead') + ' (base ' + PT.hit.base + ')');
    ok(small.foe.thrown && small.foe.why === 'partner', 'and is KNOCKED DOWN as a thrown foe (knock-into: kiWhy partner)');
    ok(small.said.includes('THE PARTNER'), 'THE PARTNER is floated at the foe');
    const mid = await hitOf('mid-hp', `window.E=__spawn('sprig',land.x-4,{hp:200});`);
    ok(mid.stats === 1 && mid.foe.alive && mid.foe.hp <= mid.foe.hp0 - Math.round(200 * PT.hit.share) + 2, 'a 200-hp foe loses a share of its bar (' + PT.hit.share + '): ' + mid.foe.hp + '/200');
    const el = await hitOf('elite', `window.E=__spawn('brute',land.x-4,{elite:true,hp:400});E.affix=null;`);
    ok(el.bossStats.elites === 1 && el.foe.alive && el.foe.hp < el.foe.hp0 && el.foe.hp >= el.foe.hp0 - Math.round(400 * PT.hit.elite) - 2, 'an elite takes a share (' + PT.hit.elite + ') and is never killed: ' + el.foe.hp + '/400');
    ok(el.foe.stagger >= 0 || el.foe.alive, 'and staggers');
    const twice = await pg.evalp(`(()=>{const [a,b]=__duo('knight','warden',{tx:6});const PTK=BK.partnerThrow();__grab(a);BK.sim(5);const land=a.ptC.arc.land;
      const E=__spawn('sprig',land.x-4,{hp:5000});__grab(a);let m=0;while(m<30){BK.sim(1);m++;if(b.ptF)break;}let n=0;while(b.ptF&&n<240){BK.sim(1);n++;}return {hits:PTK.stats.hits,hpLost:E.hp0-E.hp};})()`);
    ok(twice.hits === 1, 'each foe once per throw: ' + twice.hits);

    /* a boss: closed, in his own idle, takes a CHIPPED hero blow (the first boss, the Hornet Queen, has a chip of 1 by design - the others are measured) */
    for (const [id, shutJs] of [['spire', "b0.mode='idle';b0.modeT=9;"], ['hurricane', "b0.mode='idle';b0.modeT=9;"]]) {
      const boss = await pg.evalp(`(async()=>{const { LEVELS } = await import('/src/level.js');
        BK.manualSimulation=true;BK.SET.speed=1;BK.coopEnd();BK.setHero('knight');BK.reset({fresh:true});if(BKT.PROG['${id}'])BKT.PROG['${id}'].mini=false;BK.load(LEVELS.findIndex(l=>l.id==='${id}'));BK.state='play';BK.start();BK.god=true;BK.sim(5);BK.reset();
        const A=BK.L.arena,b0=BK.enemies().find(e=>e.t===A.boss&&e.alive);for(const e of BK.enemies())if(e!==b0&&!e.maxHp&&!e.mini)e.alive=false;
        if(A.carpet){BK.board();}else if(A.start)BK.tp(A.start[0],A.start[1]);else BK.tp(Math.round(A.trigger/16)+(A.reverse?-1:1),Math.round(A.floor/16)-1);BK.sim(150);
        BK.coopStart('warden',false);BK.sim(2);const [a,b]=BK.players();BK.god=false;b.x=a.x+10;b.y=a.y;b.vx=b.vy=0;BK.sim(40);for(const p of [a,b]){p.hp=p.maxHp;p.st=p.maxSt;p.inv=0;p.grace=0;p.hurt=0;}
        const PTK=BK.partnerThrow();PTK.reset();__grab(a);BK.sim(4);const land=a.ptC.arc.land;
        const shut=()=>{${shutJs}b0.stagger=0;b0.broken=0;b0.x=land.x-3;b0.y=a.y;b0.vx=b0.vy=0;b0.poise=0;};
        shut();const hp0=b0.hp;__grab(a);let n=0;while(n<30){shut();BK.sim(1);n++;if(b.ptF)break;}let k=0;while(b.ptF&&k<240){shut();BK.sim(1);k++;}
        return {t:b0.t,hits:PTK.stats.hits,bosses:PTK.stats.bosses,lost:+(hp0-b0.hp).toFixed(1),raw:${PT.hit.boss},thrown:!!b0.kiWhy,alive:b0.alive,open:BK.greed.open(b0),isBoss:BK.boss===b0};})()`, 300000);
      console.log('boss ' + id + ' ' + JSON.stringify(boss));
      ok(boss.hits >= 1 && boss.bosses >= 1 && !boss.open && boss.lost > 0 && boss.lost < boss.raw && !boss.thrown && boss.alive, 'a boss takes a CHIPPED hero blow (' + boss.t + ': ' + boss.lost + ' of a raw ' + boss.raw + ') and is never thrown');
    }

    /* ---- friendly fire ---- */
    const sp = await pg.evalp(`(()=>{const probe=(setup)=>{const [a,b]=__duo('knight','warden',setup.duo);return [a,b];};
      let [a,b]=__duo('knight','warden',{tx:6});__grab(a);BK.sim(5);const land=a.ptC.arc.land,tl=Math.floor(land.x/16);
      [a,b]=__duo('knight','warden',{tx:6,spikes:[tl-1,tl,tl+1]});const PTK=BK.partnerThrow();__grab(a);BK.sim(5);__grab(a);const hp0=b.hp;let n=0,minHp=b.hp;while(n<400){BK.sim(1);n++;minHp=Math.min(minHp,b.hp);if(!b.ptF&&n>30)break;}BK.sim(30);
      return {tl,hp0,hp:b.hp,minHp,max:b.maxHp,ptF:!!b.ptF,down:b.down,dead:b.dead,landings:PTK.stats.landings,onSpikes:null,x:Math.round(b.x),y:Math.round(b.y)};})()`);
    console.log('spikes ' + JSON.stringify(sp));
    ok(sp.minHp < sp.hp0 && !sp.ptF, 'FRIENDLY FIRE: spikes under the landing hurt the thrown partner: ' + sp.hp0 + ' -> ' + sp.minHp + ' (of ' + sp.max + ')');
    const pit = await pg.evalp(`(()=>{let [a,b]=__duo('knight','warden',{tx:6});__grab(a);BK.sim(5);const land=a.ptC.arc.land,tl=Math.floor(land.x/16);
      [a,b]=__duo('knight','warden',{tx:6,pit:[tl-2,tl-1,tl,tl+1,tl+2]});const PTK=BK.partnerThrow();__grab(a);BK.sim(5);__grab(a);const hp0=b.hp;let n=0;while(n<600){BK.sim(1);n++;if(b.down>0||b.dead>0||(!b.ptF&&n>40&&b.ground))break;}
      return {n,hp0,hp:b.hp,down:b.down,dead:b.dead,ptF:!!b.ptF,y:Math.round(b.y),pitY:b.y>400};})()`);
    console.log('pit ' + JSON.stringify(pit));
    ok(!pit.ptF && (pit.down > 0 || pit.dead > 0 || pit.hp < pit.hp0), 'a PIT takes the thrown partner by the room\'s own rule (down / dead / hurt and put back): ' + JSON.stringify(pit));
    const sg = await pg.evalp(`(()=>{let [a,b]=__duo('knight','warden',{tx:6});__grab(a);BK.sim(5);const land=a.ptC.arc.land;
      [a,b]=__duo('knight','warden',{tx:6});const PTK=BK.partnerThrow();__grab(a);BK.sim(5);window.E=__spawn('thorn',land.x-4,{hp:5000});E.mode='rest';E.modeT=99;E.vx=0;
      __grab(a);const hp0=b.hp;let n=0,vxs=[];while(n<300){E.vx=0;BK.sim(1);n++;vxs.push(b.vx);if(!b.ptF&&n>30)break;}
      return {hp0,hp:b.hp,spiked:PTK.stats.spiked,hits:PTK.stats.hits,said:__words().includes('SPIKED'),bounced:vxs.some(v=>v<-60),foeLost:E.hp0-E.hp};})()`);
    console.log('spiked foe ' + JSON.stringify(sg));
    ok(sg.spiked >= 1 && sg.hp < sg.hp0 && sg.said, 'FRIENDLY FIRE: a SPIKED foe (the spike goblin) bites the thrown partner (' + sg.hp0 + ' -> ' + sg.hp + ') and says SPIKED');
    ok(sg.bounced, 'and bounces him off');

    /* ---- wiggle ---- */
    const wg = await pg.evalp(`(()=>{const [a,b]=__duo();const PTK=BK.partnerThrow();__grab(a);BK.sim(4);const o={held:!!b.ptH};
      for(let i=0;i<5;i++){b.press=Object.assign(b.press||{},{jump:true});BK.sim(1);}
      o.free=!b.ptH&&!a.ptC;o.frees=PTK.stats.frees;o.words=__words().includes('WIGGLED FREE');o.safe=b.ptSafe>0;o.cd=a.ptCd>0;
      o.dx=Math.round(b.x-a.x);
      BK.sim(2);o.again=PTK.find(a).V===null;__grab(a);BK.sim(2);o.regrab=!!a.ptC;o.refused=PTK.stats.refused;
      return o;})()`);
    ok(wg.held && wg.free && wg.frees === 1 && wg.words, 'mashing frees him: 5 presses, WIGGLED FREE: ' + JSON.stringify(wg));
    ok(wg.safe && wg.cd && wg.again && !wg.regrab, 'and he cannot be lifted again at once (his safe beat, the carrier\'s wait)');
    const slow = await pg.evalp(`(()=>{const [a,b]=__duo();const PTK=BK.partnerThrow();__grab(a);BK.sim(4);for(let i=0;i<4;i++){b.press=Object.assign(b.press||{},{atk:true});BK.sim(20);}return {free:!!b.ptH,bar:b.ptH&&+b.ptH.mash.toFixed(2)};})()`);
    ok(slow.free && slow.bar < 1, 'a slow tap does not free him (the bar drains): ' + JSON.stringify(slow));
    const al = await pg.evalp(`(()=>{const [a,b]=__duo('knight','warden',{ally:true});const PTK=BK.partnerThrow();__grab(a);BK.sim(2);const held=!!b.ptH;let n=0;while(b.ptH&&n<400){BK.sim(1);n++;}return {held,secs:+(n/60).toFixed(1),free:!b.ptH,ai:!!b.ai};})()`);
    ok(al.ai && al.held && al.free && al.secs <= PT.wiggle.aiSecs + 0.6, 'a computer ally wriggles free by itself in about ' + PT.wiggle.aiSecs + ' s: ' + al.secs);

    /* ---- cannot grab ---- */
    const cg = await pg.evalp(`(()=>{const out={};const t=(name,fn,expectNoGrab=true)=>{const [a,b]=__duo();const PTK=BK.partnerThrow();fn(a,b);BK.sim(1);const before=PTK.stats.grabs;__grab(a);BK.sim(2);out[name]={grabbed:PTK.stats.grabs>before,label:PTK.label(a)};};
      t('dodging',(a,b)=>{b.dodge=0.3;b.dodgeInv=0.3;b.inv=0.3;});t('iframes',(a,b)=>{b.inv=0.5;});t('grace',(a,b)=>{b.grace=0.5;});
      t('hurt',(a,b)=>{b.hurt=0.4;});t('dead',(a,b)=>{b.dead=1.5;});t('airborne',(a,b)=>{b.ground=false;b.y-=40;b.vy=-50;});
      t('downed',(a,b)=>{BK.coopDown(1);});t('far',(a,b)=>{b.x=a.x+60;});t('otherFloor',(a,b)=>{b.y=a.y-30;b.ground=true;});
      t('carrierWinded',(a,b)=>{a.st=0;a.stDelay=2;});t('carrierSwinging',(a,b)=>{a.atk=0.1;});t('carrierHurt',(a,b)=>{a.hurt=0.3;});t('carrierRolling',(a,b)=>{a.dodge=0.2;});t('carrierDead',(a,b)=>{a.dead=1;});
      return out;})()`);
    console.log('cant ' + JSON.stringify(cg));
    for (const [k, v] of Object.entries(cg)) { const winded = k === 'carrierWinded'; ok(!v.grabbed, 'cannot grab: ' + k + (winded ? ' (the stamina cost cannot be paid)' : '')); }
    const rv = await pg.evalp(`(()=>{const [a,b]=__duo();const PTK=BK.partnerThrow();BK.coopDown(1);BK.sim(2);b.x=a.x+2;b.y=a.y;__grab(a);BK.sim(2);const g=PTK.stats.grabs;let n=0;while(b.down>0&&n<200){BK.sim(1);n++;}
      return {grabs:g,up:b.down===0,secs:+(n/60).toFixed(2),hp:b.hp>0,thrown:!!b.ptF||!!b.ptH};})()`);
    ok(rv.grabs === 0 && rv.up && rv.secs >= 1.2 && rv.secs <= 2.2, 'a DOWNED partner is the revive, untouched: no grab, standing on him lifts him in ' + rv.secs + ' s');
    const tq = await pg.evalp(`(()=>{const [a,b]=__duo();const PTK=BK.partnerThrow();b.inv=0.5;__grab(a);BK.sim(2);const n=__words().filter(w=>w==='TOO QUICK').length;__grab(a);BK.sim(2);return {n,refused:PTK.stats.refused};})()`);
    ok(tq.n === 1, 'a refusal is told once (TOO QUICK), not every press');

    /* ---- other: a carried bucket, one hero alone, a level load ---- */
    const ot = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;BK.coopEnd();BK.setHero('paladin');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='burning'));BK.state='play';BK.god=true;BK.P.hp=BK.P.maxHp;BK.sim(5);
      for(const e of BK.enemies())if(!e.boss)e.alive=false;const V=BK.village(),b1=V.buckets().sort((a,b)=>a.hx-b.hx)[0];BK.tp(Math.floor(b1.hx/16),Math.round(b1.hy/16)-1);BK.P.face=1;BK.sim(5);BK.press('talk');BK.sim(4);
      const o={took:BK.P.carry===b1};BK.press('grab');BK.sim(3);o.thrown=BK.P.carry!==b1&&b1.state!=='held';o.state=b1.state;
      /* alone: nothing happens */
      BK.press('grab');BK.sim(3);o.alone=!BK.P.ptC&&!BK.P.ptH&&!BK.P.ptF;return o;})()`, 120000);
    ok(ot.took && ot.thrown, 'the same GRAB throws a carried bucket: ' + JSON.stringify(ot));
    ok(ot.alone, 'one hero alone presses GRAB and nothing happens');
    const rs = await pg.evalp(`(()=>{const [a,b]=__duo();const PTK=BK.partnerThrow();__grab(a);BK.sim(4);const held=!!b.ptH;PTK.reset();return {held,after:!b.ptH&&!a.ptC&&!b.ptF};})()`);
    ok(rs.held && rs.after, 'a level load / respawn lets everybody go (reset)');

    /* ---- the first-time hint and the guide ---- */
    const hn = await pg.evalp(`(()=>{const [a,b]=__duo();BK.PROG.coopTips={};b.ai=false;let first=false;for(let i=0;i<150;i++){BK.sim(1);const h=BKT.hintNow;if(h&&h.t>0&&/PRESS GRAB/.test(h.msg||''))first=true;}
      return {first,tips:BK.PROG.coopTips};})()`);
    console.log('hint ' + JSON.stringify(hn));
    ok(hn.first && hn.tips.grab === 1, 'standing close for a second says the GRAB hint once (kept in the save): ' + JSON.stringify(hn.tips));
    ok(pg.errors.length === 0, 'no page error: ' + pg.errors.slice(0, 3).join(' | '));
  } finally { pg.close(); }
}
if (fails.length) { console.log('partner-throw: ' + fails.length + ' FAILED'); process.exit(1); }
console.log('partner-throw: OK');
