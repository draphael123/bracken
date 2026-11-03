/* tools/kite-openings.mjs - DOES THE ANTI-KITE CLOCK SHORTEN A BOSS'S TOLD OPENING? (claude/smallfix10, BATCH139 A11 audit)
   The anti-kite clock (src/boss-pressure.js KITE) runs a boss's idle clock up to x1.45 once the hero has stayed out of reach for 5 s+. It skips windups, e.open/broken/
   stagger/ward and the FROZEN modes - but an opening that is only a plain MODE (planted, beached, mired, a crusader's recovery ...) was not skipped, so a hero who had
   kited for a while was given a SHORTER window than the one designed. Fix: main.js skips the clock whenever GB.openOf(e) (the OPEN_RULE table) says he is open.
   For each boss+mode below: put him in the mode with its designed timer, the hero 300 px away, the clock fully wound (kiteT 30), and count frames until the mode ends.
     node tools/kite-openings.mjs         prints  boss | mode | designed s | measured s   (exit 1 when any is shorter than 0.95 x designed)
   Mode-only openings that no boss walks into on a bare placement are listed as 'n/a' with the reason. */
import { openPage } from './cdp.mjs';
const ROWS = [   /* [boss kind, mode, designed s] (designed = the modeT its own code sets) */
  ['queen', 'winded', 2.0], ['chief', 'planted', 2.6], ['herald', 'mired', 3.6], ['reefmaw', 'beached', 2.0], ['captain', 'beach', 2.6],
  ['closedhelm', 'cutRec', 0.6], ['closedhelm', 'thrustRec', 0.6], ['closedhelm', 'grabMiss', 1.0], ['closedhelm', 'brandRec', 1.0],
  ['grandmother', 'opened', 3.2], ['grandmother', 'floated', 3.2], ['hourglassking', 'turn', 0.6], ['owl', 'crash', 2.2], ['owl', 'grounded', 2.8],
];
const pg = await openPage({ audio: false, fonts: false });
let bad = 0;
try {
  const r = await pg.evalp(`(async()=>{
  const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const ROWS=${JSON.stringify(ROWS)};const out=[];const done=new Set();
  for(let li=${+(process.env.KITE_FROM || 0)};li<Math.min(LEVELS.length,${+(process.env.KITE_TO || 999)});li++){
    const want=ROWS.filter(r=>!done.has(r.join()));if(!want.length)break;
    try{BK.setHero('knight');BK.reset({fresh:true});BK.load(li);BK.state='play';BK.god=true;const A=BK.L&&BK.L.arena;if(!A||A.carpet)continue;
      BK.tp(Math.round(A.trigger/16)+(A.reverse?-1:1),Math.round(A.floor/16)-1);BK.sim(150);const b=BK.boss;if(!b)continue;
      for(const row of want.filter(r=>r[0]===b.t)){done.add(row.join());
        b.mode=row[1];b.modeT=row[2];b.open=0;b.broken=0;b.stagger=row[0]==='owl'?row[2]:0;b.kiteT=30;BK.P.x=b.x-300;let f=0;
        for(;f<900&&b.mode===row[1];f++){b.kiteT=30;BK.P.x=b.x-300;BK.sim(1);}
        out.push({boss:row[0],mode:row[1],designed:row[2],measured:+(f/60).toFixed(2),level:LEVELS[li].id,openNow:BK.bossOpen?BK.bossOpen(b):null});}
    }catch(e){out.push({err:String(e).slice(0,120),level:LEVELS[li].id});}
  }
  if(!${!!process.env.KITE_TO})for(const r of ROWS)if(!done.has(r.join()))out.push({boss:r[0],mode:r[1],designed:r[2],measured:null,note:'no level boss of this kind reached'});
  return out;})()`);
  console.log('boss | mode | designed s | measured s');
  for (const x of r) { if (x.err) { console.log('ERR', x.level, x.err); continue; } console.log([x.boss, x.mode, x.designed, x.measured ?? 'n/a'].join(' | ')); if (x.measured != null && x.measured < 0.95 * x.designed) bad++; }
} finally { await pg.close?.(); }
if (bad) { console.error('kite-openings FAIL: ' + bad + ' opening(s) shortened'); process.exit(1); }
console.log('kite-openings OK');
