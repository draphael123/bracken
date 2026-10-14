/* tools/ranger-canal-trace.mjs (claude/rangercanal) - a measuring tool: Ranger-vs-boss fights with a trace (where she stood, what the boss did, what hit her).
     PORT=8920 node tools/ranger-canal-trace.mjs [boss=canal] [seeds=1,2,3] [hero=ranger]     env T0/T1: dump every frame between those seconds */
import { openRetry, fightJs } from './boss-run.mjs';
const [boss = 'canal', seedsA = '1,2,3', hero = 'ranger'] = process.argv.slice(2);
const T0 = +(process.env.T0 || 0), T1 = +(process.env.T1 || 0);
const pg = await openRetry();
for (const s of seedsA.split(',').map(Number)) {
  let { js } = fightJs({ r: boss, way: 'practiced', h: hero, s, profile: 'human', flasks: 'kit' }, 240);
  const hook = `modes:true,healthMode:'normal',onFrame:(o)=>{const P=o.P,b=o.boss,w=window.__tr=window.__tr||{rows:[],lastHp:null,hits:[],modes:[]};const t=+(o.f/60).toFixed(2);
    const rg=BK.rg&&BK.rg();const q=rg?rg.arrows.filter(a=>a.state==='fly').length:0;
    if(o.f%60===0||(t>=${T0}&&t<=${T1}&&${T1}>0))w.rows.push([t,Math.round(P.x),Math.round(P.y),Math.round(P.vy||0),P.hp|0,b.mode,+(b.modeT||0).toFixed(2),b.part||'',Math.round(b.x),Math.round(b.y),P.ground?1:0,P.ducking?1:0,q,BK.rgArrows?BK.rgArrows():null,o.why||'']);
    if(w.lastHp!==null&&P.hp<w.lastHp-1)w.hits.push([t,b.mode,Math.round(w.lastHp-P.hp),Math.round(P.x),Math.round(P.y),P.ground?1:0,P.swim?'swim':'']);w.lastHp=P.hp;
    if(w.lm!==b.mode){w.modes.push([t,b.mode,b.part||'',Math.round(P.x),Math.round(b.x),o.why||'']);w.lm=b.mode;}}`;
  js = js.replace("healthMode:'normal'", hook).replace(/return \{maxHp/, "return {tr:window.__tr,rrow:r,maxHp");
  await pg.reload();
  const r = await pg.evalp(js, 1200000);
  console.log('=== seed', s, r.outcome, r.secs + 's', 'boss left', r.bossLeft + '%', 'taken', r.taken, 'hitBy', JSON.stringify(r.rrow && r.rrow.hitBy));
  if (!process.env.NOMODES) console.log('modes', JSON.stringify(r.tr && r.tr.modes)); console.log('hits [t,mode,dmg,x,y,ground]', JSON.stringify(r.tr && r.tr.hits));
  if (T1) { console.log('rows [t,x,y,vy,hp,mode,modeT,part,bx,by,ground,duck,flying,quiver,why]'); for (const row of (r.tr && r.tr.rows) || []) console.log(JSON.stringify(row)); }
}
pg.close();
