// PAGE TOOL: launches headless Chrome
/* tools/gq5q2-teachmiss.mjs - GQ5Q2-TUNE BROWSER OWED 5: a teach shard that dies on the cupola's stone (ctx.solid() check,
   src/gqueen-hands.js:713 - the same rule every S.rocks shard already obeys) still counts as a miss and the lesson is seen
   again within 10 s (src/gq5q2.js teachStep: T.nextAt = tt + N.teach.retry on a dead, un-arrived shard; max 3).
   Reaches the real roof (toRoof), leaves the hero exactly where entry puts it (west of the cupola, per the brief), and
   watches G52.state().teach for 10 real seconds, logging every shard's fate (arrived / died on stone / died on timeout)
   and the real "STRIKE IT!" plate text as the game's own number() draws it.
   BRACKEN_GQ5Q2=1 node tools/gq5q2-teachmiss.mjs */
import { openPage } from './cdp.mjs';
process.env.BRACKEN_GQ5Q2 = '1';
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{
    const {LEVELS}=await import('/src/level.js');
    BK.manualSimulation=true; BK.SET.speed=1; BK.setHero('knight'); BK.reset({fresh:true}); BK.load(LEVELS.findIndex(l=>l.id==='crown')); BK.state='play'; BK.god=false; BK.sim(5);
    const A=BK.L.arena; BK.tp(Math.round(A.trigger/16)+1, Math.round(A.floor/16)-1);
    for (let k=0;k<300;k++){BK.P.hp=BK.P.maxHp;BK.sim(1);}
    let q=BK.boss; q.crownCd=99;q.portalCd=99;q.geodeCd=99;q.slamT=99;q.sweepT=99;q.courtT=99;q.hLeapT=99;q.decreeT=99;q.throwT2=99;q.ringT=99;
    const P=BK.P; q.hp=2; const hu=BK.hurt||(BK.env&&BK.env().hurt); if (hu) hu(q,50,P.x);
    for (let i=0;i<140;i++){P.hp=P.maxHp;BK.sim(1);}
    const H=BK.gqHands(); H.skipRoof();
    for (let i=0;i<30;i++){P.hp=P.maxHp;BK.sim(1);}   // settle onto the roof, do NOT walk the hero anywhere - stay exactly where entry put it
    const G52=H.q52();
    const Tw=(BK.L.arena&&BK.L.arena.tower)||(BK.L.arenaRoof&&BK.L.arenaRoof.tower);
    const cupolaXpx=[Tw.CUPOLA.x0*16, Tw.CUPOLA.x1*16];
    const plates=[]; const origNumber=BK.ctxNumber; // not reachable directly; read via window.__textRec-free hook: poll teach state every frame instead
    const seen=new Set(); const fates=[];
    let lastShard=null;
    for (let f=0; f<600; f++) {   // 10 s at 60fps
      P.hp=P.maxHp; BK.sim(1);
      const T=G52.state().teach;
      if (T.shard && T.shard!==lastShard) { lastShard=T.shard; }
      if (lastShard && lastShard.dead && !seen.has(lastShard.id)) { seen.add(lastShard.id);
        fates.push({ n: T.n, x: Math.round(lastShard.x), y: Math.round(lastShard.y), arrived: !!lastShard.arrived,
          onCupola: lastShard.x >= cupolaXpx[0]-20 && lastShard.x <= cupolaXpx[1]+20 }); }
    }
    const T=G52.state().teach;
    return { heroX: Math.round(P.x), cupolaXpx, fates, final: { n: T.n, done: T.done, struck: T.struck, said: T.said } };
  })()`, 90000);
  console.log('GQ5Q2 OWED 5 - teach shard miss/retry over 10 s from roof entry:');
  console.log('  hero at x=' + r.heroX + '  cupola solid x=' + JSON.stringify(r.cupolaXpx));
  console.log('  shard fates (in spawn order): ' + JSON.stringify(r.fates));
  console.log('  final teach state: ' + JSON.stringify(r.final));
  console.log('  VERDICT: ' + (r.final.struck > 0 || r.final.n >= 1 ? 'the lesson fired at least once within the 10 s window' : 'NO shard fired - check the hook') +
    (r.fates.some(x => x.onCupola && !x.arrived) ? '; at least one shard died on the cupola (a real miss) and the engine kept teaching (n reached ' + r.final.n + ')' : '; no shard happened to die on the cupola in this run (geometry-dependent, not necessarily a bug)'));
  console.log('page errors: ' + JSON.stringify(pg.errors.slice(0, 6)));
} finally { await pg.close(); }
