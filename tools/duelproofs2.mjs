// tools/duelproofs2.mjs - PHASE 2 browser proofs for the duel arenas + duel foes slices (claude/duelarenas-d, 11-13 desktop).
// AI-vs-AI full matches in a headless page, ONE browser at a time (page recycled every RECYCLE matches). Nothing here changes a number.
//   WHAT=matrix  : every arena x goblins off/few/many (+ the Pit flags OFF), 2 seats, N matches each
//   WHAT=seats   : 3 and 4 seats (and a 2v2 TEAMS run, friendly fire off/on) in every arena: matches end, camera keeps everyone in the picture
//   WHAT=cam     : camera stills at the widest moments (4 seats, each arena)
//   WHAT=vents   : the Rootway's spore vents: told, lift every seat, hurt nobody
// env: N (matches per cell), ARENAS=pit,stockade,rootway,kitchen, SHOTS (stills dir), OUT (json results), RECYCLE, CAP (sim seconds)
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';
const SHOTS = process.env.SHOTS || 'C:/Users/danie/Projects/desktop-stills/duel-proofs-2';
const RES = process.env.OUT || 'C:/Users/danie/Projects/desktop-stills/duel-proofs-2/results.jsonl';
mkdirSync(SHOTS, { recursive: true });
const WHAT = (process.env.WHAT || 'matrix').split(','), N = +(process.env.N || 6), CAP = +(process.env.CAP || 1800), RECYCLE = +(process.env.RECYCLE || 6);
const LEVEL = { pit: 'duel_pit', stockade: 'duel_stockade', rootway: 'duel_rootway', kitchen: 'duel_kitchen' };
const ARENAS = (process.env.ARENAS || 'pit,stockade,rootway,kitchen').split(',');
const HEROES = ['knight', 'warden', 'pyro', 'paladin', 'pirate', 'reaper', 'geomancer', 'berserker', 'ranger'];
const heroSet = (i, n) => Array.from({ length: n }, (_, k) => HEROES[(i * 2 + k * 3 + (n > 2 ? i : 0)) % 9]).map((h, k, a) => a.indexOf(h) === k ? h : HEROES[(HEROES.indexOf(h) + 1 + k) % 9]);
const fails = [];
const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails.push(m); };
const log = o => { appendFileSync(RES, JSON.stringify(o) + '\n'); };

/* the in-page match: window.__mk(O) sets one up, returns after the countdown starts; __M.step(frames) samples every 6 frames; __M.result() */
const PAGE = `(()=>{window.__props=()=>{const p=BK.props;return typeof p==='function'?p():p;};window.__en=()=>{const p=BK.enemies;return typeof p==='function'?p():p;};window.__mk=async O=>{
 BK.manualSimulation=true; for(const k in BK.keys)BK.keys[k]=false;
 const {LEVELS}=await import('/src/level.js'); const di=LEVELS.findIndex(l=>l.id===O.level); if(di<0) return {err:'no level '+O.level};
 BK.setHero(O.heroes[0]); BK.reset({fresh:true}); BK.applyUpgrades(); BK.load(di); BK.start(); if(!O.idle) BK.coopStart(O.heroes[1],false); BK.sim(10);
 const D=BK.duel(), S=D.D.st; const L0=typeof BK.L==='function'?BK.L():BK.L;
 const pulls0=BK.players().reduce((a,p)=>a+(p.leashes|0),0), xp0=JSON.stringify(BK.PROG.xp||0), c0=BK.PROG.coins||0, st0={...S.stats};
 const settings={goblins:O.goblins||'off',teams:!!O.teams,friendlyFire:!!O.ff,seats:O.heroes.map((h,i)=>({hero:h,isBot:i>0,botDifficulty:'normal'}))};
 const began=D.begin({...(O.idle?{}:{bots:'all'}),seed:O.seed,settings,seats:O.heroes.length,botHeroes:O.idle?O.heroes.slice(1):(O.heroes.length>2?O.heroes.slice(2):undefined)});
 const M={O,began,D,S,xp0,c0,st0,f:0,W:(L0&&L0.W||0)*16,H:(L0&&L0.H||0)*16,offArena:0,offScreen:0,fightSamples:0,minMargin:1e9,minWho:'',maxGob:0,gobKinds:{},gobOut:0,gobOverlap:0,kos:[],prevHp:S.seats.map(p=>p.duelHp),minY:S.seats.map(()=>1e9),firstTop:S.seats.map(()=>null),maxClock:0,firstOff:null,flasks0:BK.players().map(p=>p.flasks|0),widest:{span:0},maxRound:0};
 const VWc=()=>BK.view.VW, VHc=()=>BK.view.VH;
 M.sample=()=>{ const m=S.m; if(!m) return; { const c=BK.tavern.cam(); if(c.want!==c.view) BK.setView(c.want); } const v=BK.view, fight=m.phase==='fight';
  S.seats.forEach((p,i)=>{ const up=p.duelHp>0&&!p.dead&&!(p.down>0);
   if(up&&fight){ if(p.x<-4||p.x>M.W+4||p.y>M.H+16||p.y<-24){ M.offArena++; M.firstOff=M.firstOff||{seat:i,x:p.x|0,y:p.y|0,W:M.W,H:M.H,t:M.f/60}; }
    if(p.y<M.minY[i]) M.minY[i]=p.y; if(M.firstTop[i]===null&&p.y<=7*16) M.firstTop[i]=+(M.f/60).toFixed(1); }
   if(M.prevHp[i]>0&&!(p.duelHp>0)) M.kos.push({seat:i,hero:p.hero,by:p.duelKoBy|0,t:+(M.f/60).toFixed(1),x:p.x|0,y:p.y|0});
   M.prevHp[i]=p.duelHp; });
  M.vwMin=Math.min(M.vwMin||1e9,v.VW);M.vwMax=Math.max(M.vwMax||0,v.VW);M.vhMax=Math.max(M.vhMax||0,v.VH);\n  if(fight){ const ups=S.seats.filter(p=>p.duelHp>0&&!p.dead&&!(p.down>0));
   if(ups.length){ M.fightSamples++; let mm=1e9,who='',mnx=1e9,mxx=-1e9,mny=1e9,mxy=-1e9;
    for(const p of ups){ const sx=p.x-v.x, sy=p.y-v.y, mg=Math.min(sx,VWc()-sx,sy-20,VHc()-sy); if(mg<mm){mm=mg;who=p.hero+'@'+(p.x|0)+','+(p.y|0);} mnx=Math.min(mnx,p.x);mxx=Math.max(mxx,p.x);mny=Math.min(mny,p.y);mxy=Math.max(mxy,p.y); }
    if(mm<0) M.offScreen++; if(mm<M.minMargin){M.minMargin=mm;M.minWho=who;}
    const span=Math.max(mxx-mnx,(mxy-mny)*1.6); if(ups.length>=2&&span>M.widest.span) M.widest={span:+span.toFixed(0),t:+(M.f/60).toFixed(1),margin:+mm.toFixed(1)}; M.lastMargin=mm; }
   const F=S.foe; if(F){ const al=F.list.filter(e=>e.alive); M.maxGob=Math.max(M.maxGob,al.length); const VV=__props().filter(p=>p.t==='vent'); for(const e of al){ M.gobKinds[e.t]=(M.gobKinds[e.t]||0)+1; { const prev=e.__php; e.__php=e.hp; for(const v of VV) if(v.active&&Math.abs(e.x-v.x)<13&&e.y<=v.y+2&&e.y>v.y-v.h){ M.gobOnVent=(M.gobOnVent||0)+1; if(prev!==undefined&&e.hp<prev&&!ups.some(p=>Math.abs(p.x-e.x)<48)) M.gobVentHurt=(M.gobVentHurt||0)+1; if(e.y<v.y-10) M.gobLifted=(M.gobLifted||0)+1; } } if(e.x<-8||e.x>M.W+8||e.y>M.H+16) M.gobOut++; for(const p of ups) if(Math.abs(p.x-e.x)<12&&Math.abs(p.y-e.y)<16) M.gobOverlap++; } }
   M.maxClock=Math.max(M.maxClock,m.clock||0); M.maxRound=Math.max(M.maxRound,m.round|0); } };
 M.step=n=>{ for(let k=0;k<n&&S.m&&S.m.phase!=='over';k+=6){ if(O.hold&&S.m.phase==='count') S.m.t=99; BK.sim(6); M.f+=6; M.sample(); } return {phase:S.m&&S.m.phase,round:S.m&&S.m.round,clock:S.m&&S.m.clock,f:M.f}; };
 M.result=()=>{ const d=D.D.debug(), st1=S.stats, df={}; for(const k in st1) df[k]=(st1[k]||0)-(st0[k]||0);
  return {O,began,phase:d.m&&d.m.phase,winner:d.m&&d.m.winner,rounds:d.m&&d.m.log.length,secs:+(M.f/60).toFixed(1),state:BK.state,arena:d.arena&&d.arena.id,heroes:d.seats.map(s=>s.hero),stats:df,
   offArena:M.offArena,firstOff:M.firstOff,offScreen:M.offScreen,fightSamples:M.fightSamples,minMargin:+M.minMargin.toFixed(1),minWho:M.minWho,widest:M.widest,maxGob:M.maxGob,gobKinds:M.gobKinds,gobOut:M.gobOut,gobOverlap:M.gobOverlap,gobOnVent:M.gobOnVent|0,gobVentHurt:M.gobVentHurt|0,gobLifted:M.gobLifted|0,
   kos:M.kos,minY:M.minY.map(y=>y|0),firstTop:M.firstTop,pulls:BK.players().reduce((a,p)=>a+(p.leashes|0),0)-pulls0,maxClock:+M.maxClock.toFixed(1),view:[M.vwMin,M.vwMax,M.vhMax],maxRound:M.maxRound,foeAlive:d.foe&&d.foe.alive,foeLoss:S.seats.map(p=>p.duelFoeLoss|0),gobs:S.seats.map(p=>p.duelGobs|0),
   xpSame:JSON.stringify(BK.PROG.xp||0)===M.xp0,coinsSame:(BK.PROG.coins||0)===M.c0,flasks:BK.players().map(p=>p.flasks|0),nPlayers:BK.players().length,cerr:(window.__cerr||[]).slice(-3)}; };
 window.__M=M; if(O.skip) M.S.m.t=Math.min(M.S.m.t,DUEL_COUNT_SKIP); return {began,seats:S.seats.length,W:M.W,H:M.H,view:BK.view.VW+'x'+BK.view.VH}; };
 return 1;})()`.replace('DUEL_COUNT_SKIP', '0.05');

const hook = `(()=>{window.__cerr=[];const oe=console.error;console.error=(...a)=>{try{window.__cerr.push(a.map(String).join(' ').slice(0,200));}catch(e){}oe.apply(console,a);};addEventListener('error',e=>window.__cerr.push(String(e.message).slice(0,200)));addEventListener('unhandledrejection',e=>window.__cerr.push('rej '+String(e.reason).slice(0,200)));return 1;})()`;

let pg = null, nPage = 0, curFlags = null, nErrSeen = 0;
async function fresh(flags) { try { await pg?.close?.(); } catch (e) {} curFlags = flags; pg = await openPage(flags); nPage = 0; nErrSeen = 0; await pg.evalp(hook); await pg.evalp(PAGE); }
const E = (e, ms) => pg.evalp(e, ms);
const shot = async n => { await E('BK.draw1()'); const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(join(SHOTS, n + '.png'), Buffer.from(r.result.data, 'base64')); console.log('shot ' + n); };
const FON = { duelBeta: true, duelArenas: true, duelFoes: true, audio: false, fonts: false, seed: 5 };
const FOFF = { duelBeta: true, duelArenas: false, duelFoes: false, audio: false, fonts: false, seed: 5 };

async function runMatch(O, tag) {
  if (nPage >= RECYCLE) await fresh(curFlags); nPage++;
  let r;
  const go = async () => { const s = await E(`__mk(${JSON.stringify(O)})`); if (s.err) throw new Error(s.err); await E(`(()=>{const M=__M;let g=0;while(g<${CAP * 60}&&M.S.m&&M.S.m.phase!=='over'){M.step(60);g+=60;}return 1;})()`, 20 * 60000); return E('__M.result()'); };
  try { r = await go(); } catch (e) { console.log('  note ' + tag + ': ' + String(e.message || e).slice(0, 100) + ' -> fresh page, retry'); await fresh(curFlags); nPage = 1; r = await go(); }
  r.tag = tag; r.pageErrs = pg.errors.slice(nErrSeen); nErrSeen = pg.errors.length; log(r);
  return r;
}

function judge(r, cell) {
  const tag = r.tag, goblins = r.O.goblins && r.O.goblins !== 'off', n = r.O.heroes.length;
  ok(r.began && r.phase === 'over' && r.state === 'play', tag + ': ENDS inside ' + CAP + ' s (' + r.secs + ' s, ' + r.rounds + ' rounds, winner ' + r.winner + ')');
  ok(r.winner != null, tag + ': a winner is declared (' + r.winner + ')');
  ok(r.arena === cell.arena || (cell.arena === 'pit' && (r.arena === 'pit' || !r.arena)), tag + ': arena id ' + r.arena);
  ok(r.offArena === 0, tag + ': no fighter outside the arena (' + r.offArena + ' samples' + (r.firstOff ? ', first ' + JSON.stringify(r.firstOff) : '') + ')');
  ok(r.pageErrs.length === 0 && r.cerr.length === 0, tag + ': no console / page errors ' + JSON.stringify(r.pageErrs.concat(r.cerr)).slice(0, 160));
  ok(r.maxClock < 400 && r.maxRound <= 8, tag + ': no stuck round (longest round clock ' + r.maxClock + ' s, rounds ' + r.maxRound + ')');
  ok(r.flasks.every(x => x === 0) && r.xpSame && r.coinsSame, tag + ': no flask, no XP, no coins');
  ok(r.nPlayers === n, tag + ': ' + n + ' seats');
  if (goblins) { ok(r.foeAlive <= 4 && r.maxGob <= 4, tag + ': goblins alive <= 4 (max ' + r.maxGob + ')'); ok(r.gobOut === 0, tag + ': no goblin outside the arena'); ok(r.kos.every(k => k.by > 0), tag + ': every seat K.O. is a HERO blow (by: ' + r.kos.map(k => k.by).join(',') + ')'); }
}

const summary = [];
function tally(label, rs) {
  const t = { label, n: rs.length, ended: rs.filter(r => r.phase === 'over').length, winner: rs.filter(r => r.winner != null).length, offArena: rs.reduce((a, r) => a + r.offArena, 0), errs: rs.reduce((a, r) => a + r.pageErrs.length + r.cerr.length, 0),
    secsAvg: +(rs.reduce((a, r) => a + r.secs, 0) / Math.max(1, rs.length)).toFixed(0), secsMax: Math.max(...rs.map(r => r.secs)), rounds: +(rs.reduce((a, r) => a + r.rounds, 0) / Math.max(1, rs.length)).toFixed(1),
    gobSpawned: rs.reduce((a, r) => a + (r.stats.gobSpawned || 0), 0), foeBlows: rs.reduce((a, r) => a + (r.stats.foeBlows || 0), 0), foeBlocked: rs.reduce((a, r) => a + (r.stats.foeBlocked || 0), 0), gobKills: rs.reduce((a, r) => a + (r.stats.gobKills || 0), 0),
    kosHero: rs.reduce((a, r) => a + r.kos.filter(k => k.by > 0).length, 0), kosOther: rs.reduce((a, r) => a + r.kos.filter(k => !(k.by > 0)).length, 0), self: rs.reduce((a, r) => a + (r.stats.self || 0), 0), nobody: rs.reduce((a, r) => a + (r.stats.nobody || 0), 0),
    offScreenSamples: rs.reduce((a, r) => a + r.offScreen, 0), fightSamples: rs.reduce((a, r) => a + r.fightSamples, 0), minMargin: Math.min(...rs.map(r => r.minMargin)), gobOverlap: rs.reduce((a, r) => a + r.gobOverlap, 0) };
  summary.push(t); console.log('SUMMARY ' + JSON.stringify(t)); return t;
}

try {
  if (WHAT.includes('matrix')) {
    console.log('== MATRIX: 2 seats, every arena x goblins ==');
    await fresh(FON);
    const cells = []; for (const a of ARENAS) for (const g of ['off', 'few', 'many']) cells.push({ arena: a, goblins: g, flags: 'on' });
    if (ARENAS.includes('pit')) cells.push({ arena: 'pit', goblins: 'off', flags: 'off' });
    for (const c of cells) {
      if (c.flags === 'off') await fresh(FOFF); else if (curFlags !== FON) await fresh(FON);
      const rs = [];
      for (let i = 0; i < N; i++) { const O = { level: LEVEL[c.arena], heroes: heroSet(i, 2), goblins: c.goblins, seed: 31 * (i + 1), arena: c.arena }; const r = await runMatch(O, c.arena + '/' + c.goblins + '/flags-' + c.flags + ' #' + (i + 1) + ' ' + r0(O)); judge(r, c); rs.push(r); }
      tally(c.arena + ' goblins=' + c.goblins + ' flags=' + c.flags + ' seats=2', rs);
    }
  }
  if (WHAT.includes('seats')) {
    console.log('== SEATS: 3 and 4 seats + teams ==');
    if (curFlags !== FON) await fresh(FON);
    for (const a of ARENAS) for (const n of [3, 4]) {
      const rs = []; for (let i = 0; i < N; i++) { const O = { level: LEVEL[a], heroes: heroSet(i + 1, n), goblins: i % 2 ? 'many' : 'few', seed: 17 * (i + 3), arena: a }; const r = await runMatch(O, a + '/' + n + 'seats #' + (i + 1) + ' ' + r0(O)); judge(r, { arena: a }); rs.push(r); }
      tally(a + ' seats=' + n + ' goblins=few/many', rs);
    }
    for (const a of ARENAS) for (const ff of [false, true]) {
      const rs = []; for (let i = 0; i < Math.max(2, N >> 1); i++) { const O = { level: LEVEL[a], heroes: heroSet(i + 2, 4), goblins: 'few', teams: true, ff, seed: 13 * (i + 5), arena: a }; const r = await runMatch(O, a + '/teams-ff' + (ff ? 'ON' : 'OFF') + ' #' + (i + 1) + ' ' + r0(O)); judge(r, { arena: a }); rs.push(r); }
      tally(a + ' TEAMS 2v2 friendlyFire=' + ff, rs);
    }
  }
  if (WHAT.includes('cam')) {
    console.log('== CAM: widest-moment stills, 2/3/4 seats ==');
    if (curFlags !== FON) await fresh(FON);
    for (const a of ARENAS) for (const n of (process.env.SEATS || '2,3,4').split(',').map(Number)) {
      await E('1'); const O = { level: LEVEL[a], heroes: heroSet(1, n), goblins: 'many', seed: 99, arena: a };
      const s = await E(`__mk(${JSON.stringify(O)})`); let best = 1e9, bestSpan = 0, k = 0, f = 0;
      while (f < 4000 * 6) { const r = await E('(()=>{const M=__M;M.step(24);return {ph:M.S.m&&M.S.m.phase,mm:M.lastMargin,sp:M.widest.span,mg:M.minMargin};})()'); f += 24; if (r.ph === 'over') break;
        if (r.sp > bestSpan + 6 && k < 3) { bestSpan = r.sp; k++; await shot('cam-' + a + '-' + n + 'seats-widest' + k); } if (f % 3000 === 0) await E('0'); }
      const res = await E('__M.result()'); res.tag = 'cam ' + a + ' ' + n; res.pageErrs = []; log(res);
      ok(res.offScreen === 0, a + ' ' + n + ' seats: everyone stays on screen (off-screen samples ' + res.offScreen + '/' + res.fightSamples + ', worst margin ' + res.minMargin + 'px on ' + res.minWho + ', widest span ' + JSON.stringify(res.widest) + ', ended ' + res.phase + ')');
    }
  }
  if (WHAT.includes('vents')) {
    console.log('== VENTS: the Rootway spore vents (held in the countdown so nobody acts) ==');
    if (curFlags !== FON) await fresh(FON);
    const O = { level: LEVEL.rootway, heroes: ['knight', 'warden', 'pyro', 'reaper'], goblins: 'off', seed: 5, hold: true };
    const s0 = await E(`__mk(${JSON.stringify(O)})`); console.log('setup', JSON.stringify(s0));
    const tl = await E(`(()=>{const M=__M;const V=__props().filter(p=>p.t==='vent');const out=[];for(let i=0;i<260;i++){M.step(6);out.push([+BK.time.toFixed(2),...V.map(p=>(p.active?2:p.warm?1:0))]);}return {v:V.map(p=>({x:p.x,y:p.y,h:p.h,period:p.period,on:p.on,phase:p.phase,lift:p.lift,w:p.w,heat:p.heat,ember:p.ember,glass:p.glass,incense:p.incense,gale:p.gale})),out};})()`);
    ok(tl.v.length === 2, 'two vent props in the Rootway (' + tl.v.length + '): ' + JSON.stringify(tl.v[0]));
    const edges = j => { const e = { warm: [], on: [], off: [] }; let prev = 0; for (const r of tl.out) { const v = r[1 + j]; if (v === 1 && prev !== 1 && prev !== 2) e.warm.push(r[0]); if (v === 2 && prev !== 2) e.on.push(r[0]); if (v !== 2 && prev === 2) e.off.push(r[0]); prev = v; } return e; };
    const e0 = edges(0), e1 = edges(1);
    const per = a => a.length > 1 ? +((a[a.length - 1] - a[0]) / (a.length - 1)).toFixed(2) : null;
    console.log('vent0 edges', JSON.stringify(e0), 'vent1 edges', JSON.stringify(e1));
    ok(per(e0.on) !== null && Math.abs(per(e0.on) - 5) < 0.25 && Math.abs(per(e1.on) - 5) < 0.25, 'both vents puff every ~5 s (measured ' + per(e0.on) + ' / ' + per(e1.on) + ')');
    const onLen = e0.on.length && e0.off.length ? +(e0.off.find(t => t > e0.on[0]) - e0.on[0]).toFixed(2) : null; ok(onLen !== null && Math.abs(onLen - 2) < 0.3, 'a puff lasts ~2 s (' + onLen + ')');
    const tellLead = e0.warm.length && e0.on.length ? +(e0.on.find(t => t > e0.warm[0]) - e0.warm[0]).toFixed(2) : null; ok(tellLead !== null && tellLead >= 0.45 && tellLead <= 0.8, 'the spore wisp (warm) is told ~0.6 s before each puff (lead ' + tellLead + ' s)');
    const gap = e0.on.length && e1.on.length ? +Math.abs(e1.on.find(t => t > e0.on[0]) - e0.on[0]).toFixed(2) : null; ok(gap !== null && gap > 2 && gap < 3, 'the two vents are half a period apart (' + gap + ' s) - never both off for more than 3 s');
    ok(tl.v.every(v => !v.heat && !v.ember && !v.glass && !v.incense && !v.gale), 'vent props carry no heat / ember / glass / incense / gale flag (nothing that hurts)');
    /* every seat lifted: all four seats, one at a time, on each vent. hp must not move. */
    const lift = await E(`(()=>{const M=__M,S=M.S,V=__props().filter(p=>p.t==='vent'),res=[];
      const wait=(vi)=>{for(let k=0;k<400&&!(V[vi].warm&&!V[vi].active);k++)M.step(6);};
      S.seats.forEach((p,i)=>{ [0,1].forEach(vi=>{ const v=V[vi]; wait(vi); p.x=v.x; p.y=15*16; p.vx=0;p.vy=0; const hp0=p.duelHp; let minY=p.y, ground0=p.ground; for(let k=0;k<45;k++){ M.step(6); if(p.y<minY)minY=p.y; if(!(v.active)&&k>25)break; }
        for(let k=0;k<60;k++) M.step(6); res.push({seat:i,hero:p.hero,vent:vi,peak:Math.round(240-minY),landY:Math.round(p.y),hp0,hp1:p.duelHp}); p.x=40+i*8; p.y=15*16; p.vx=p.vy=0; M.step(30); }); });
      return res;})()`, 600000);
    for (const r of lift) console.log('  lift seat' + r.seat + ' ' + r.hero + ' vent' + r.vent + ': rose ' + r.peak + ' px, landed y ' + r.landY + ', hp ' + r.hp0 + ' -> ' + r.hp1);
    ok(lift.length === 8 && lift.every(r => r.peak >= 60), 'EVERY seat (P1 and the three bots) is lifted by a puff on either vent (min rise ' + Math.min(...lift.map(r => r.peak)) + ' px of h=140)');
    ok(lift.every(r => r.hp1 === r.hp0), 'a puff costs no health: every seat hp unchanged');
    ok(lift.every(r => r.landY <= 10 * 16), 'every lifted seat lands on a board (long root or crown): y <= 160 (min landY ' + Math.min(...lift.map(r => r.landY)) + ', max ' + Math.max(...lift.map(r => r.landY)) + ')');
    /* goblins over a vent: measured inside the rootway matrix (gobOnVent / gobVentHurt / gobLifted per match) */
    await E(`(()=>{const M=__M;M.S.seats.forEach((p,i)=>{p.x=216-24+i*16;p.y=15*16;p.vx=p.vy=0;});M.step(6);return 1;})()`);
    // stills: the warm tell (a seat at the vent just before the puff) and the lift
    await E(`(()=>{const M=__M,V=__props().filter(p=>p.t==='vent');M.S.seats[0].x=V[0].x;M.S.seats[1].x=V[1].x;M.S.seats[2].x=V[0].x-24;M.S.seats[3].x=V[1].x+24;for(let k=0;k<600&&!(V[0].warm&&!V[0].active);k++)M.step(6);return 1;})()`);
    await shot('vents-1-told-spores'); 
    await E(`(()=>{const M=__M,V=__props().filter(p=>p.t==='vent');for(let k=0;k<400&&!V[0].active;k++)M.step(6);M.step(30);return 1;})()`); await shot('vents-2-lifting');
    await E(`(()=>{const M=__M;M.step(48);return 1;})()`); await shot('vents-3-on-the-crown');
  }  if (WHAT.includes('climb')) {
    console.log('== CLIMB: a seat that holds the top board (idle, health pinned); do the bots come up to him? ==');
    if (curFlags !== FON) await fresh(FON);
    const TOP = { stockade: { x: 192, y: 7 * 16, tiers: [16, 13, 10, 7] }, rootway: { x: 240, y: 6 * 16, tiers: [12, 9, 6] }, kitchen: { x: 88, y: 6 * 16, tiers: [9, 6] } };
    for (const a of ARENAS.filter(q => TOP[q])) {
      const T = TOP[a]; const reach = [];
      for (let i = 0; i < N; i++) {
        const O = { level: LEVEL[a], heroes: heroSet(i + 3, +(process.env.CLIMBSEATS || 2)), goblins: 'off', seed: 7 * (i + 2), idle: true, arena: a };
        if (nPage >= RECYCLE) await fresh(FON); nPage++;
        await E(`__mk(${JSON.stringify(O)})`);
        const r = await E(`(()=>{const M=__M,S=M.S,T=${JSON.stringify(T)};const first=S.seats.map(()=>T.tiers.map(()=>null));let top=S.seats.map(()=>null);
          for(let k=0;k<9000;k+=6){ const p0=S.seats[0]; p0.x=T.x;p0.y=T.y;p0.vx=0;p0.vy=0; for(const p of S.seats){p.duelHp=p.duelMax;} M.step(6);
            S.seats.forEach((p,i)=>{ if(i===0)return; T.tiers.forEach((row,j)=>{ if(first[i][j]===null&&p.y<=row*16+2) first[i][j]=+(M.f/60).toFixed(1); }); });
            if(S.seats.slice(1).every((p,i)=>first[i+1][T.tiers.length-1]!==null)) break; }
          return {heroes:S.seats.map(p=>p.hero),first,f:M.f,ys:S.seats.map(p=>Math.round(p.y)),xs:S.seats.map(p=>Math.round(p.x))};})()`, 120000);
        reach.push(r); console.log('  ' + a + ' #' + (i + 1) + ' ' + r.heroes.join('/') + ' tiers(rows ' + T.tiers.join('>') + ') first-reach f-s per bot: ' + JSON.stringify(r.first.slice(1)) + ' end y ' + r.ys.join(','));
        log({ tag: 'climb ' + a + ' #' + (i + 1), ...r });
        if (i === 0) { await E(`(()=>{const M=__M;M.step(6);return 1;})()`); }
      }
      const ups = reach.flatMap(r => r.first.slice(1)); const topReached = ups.filter(f => f[T.tiers.length - 1] !== null);
      ok(topReached.length === ups.length, a + ': every bot climbs to a seat holding the top board (' + topReached.length + '/' + ups.length + ' bots; times f-s ' + JSON.stringify(topReached.map(f => f[T.tiers.length - 1])) + ')');
    }
  }
  if (WHAT.includes('climbshots')) {
    console.log('== CLIMBSHOTS: a bot on the top board (2 seats), and a 4-seat frame with a climber ==');
    if (curFlags !== FON) await fresh(FON);
    const TOP = { stockade: { x: 192, y: 7 * 16, row: 7 }, kitchen: { x: 88, y: 6 * 16, row: 6 } };
    for (const [a, n, tag] of [['stockade', 2, 'climb-stockade-bot-on-lookout'], ['kitchen', 2, 'climb-kitchen-bot-on-board'], ['kitchen', 4, 'climb-kitchen-4seats-climber'], ['stockade', 4, 'climb-stockade-4seats-climber']]) {
      if (process.env.ONLY && !tag.includes(process.env.ONLY)) continue;
      const T = TOP[a];
      await E(`__mk(${JSON.stringify({ level: LEVEL[a], heroes: n < 4 ? heroSet(3, n) : ['geomancer', 'knight', 'paladin', 'warden'], goblins: n < 4 ? 'off' : 'many', seed: n < 4 ? 14 : 68, idle: n < 4, arena: a })})`);
      const r = await E(`(()=>{const M=__M,S=M.S,T=${JSON.stringify(T)};let hit=null;const N4=${n}===4;
        for(let k=0;k<12000;k+=6){ const p0=S.seats[0]; if(!N4){p0.x=T.x;p0.y=T.y;p0.vx=0;p0.vy=0; for(const p of S.seats){p.duelHp=p.duelMax;}} M.step(6);
          const c=S.seats.findIndex((p,i)=>(N4||i>0)&&p.y<=(N4?${a === 'kitchen' ? 150 : 215}:T.row*16+2)); if(c>=0){ hit={bot:c,f:+(M.f/60).toFixed(1)}; if(!N4)for(let j=0;j<12;j+=6){ p0.x=T.x;p0.y=T.y;p0.vx=0;p0.vy=0; M.step(6);} break; } }
        return {hit,ys:S.seats.map(p=>Math.round(p.y)),xs:S.seats.map(p=>Math.round(p.x))};})()`, 120000);
      console.log('  ' + tag, JSON.stringify(r)); if (r.hit) await shot(tag); else console.log('  no climber reached the top in the time box');
    }
  }
  if (WHAT.includes('shots')) {
    console.log('== SHOTS: torches, plank posts, results card (4 seats), goblins on the Stockade, tavern card rows ==');
    if (curFlags !== FON) await fresh(FON);
    const pinShot = async (name, O, pos, frames = 120, after) => { await E(`__mk(${JSON.stringify({ ...O, hold: false, skip: true })})`);
      await E(`(()=>{const M=__M,S=M.S,P=${JSON.stringify(pos)};for(let k=0;k<${frames};k+=6){P.forEach(([i,x,y])=>{const p=S.seats[i];p.x=x;p.y=y;p.vx=0;p.vy=0;p.duelHp=p.duelMax;});M.step(6);}return 1;})()`);
      if (after) await E(after); await shot(name); };
    await E(`__mk(${JSON.stringify({ level: LEVEL.kitchen, heroes: ['knight', 'warden'], goblins: 'off', seed: 3 })})`); await E('(()=>{for(let k=0;k<120;k+=6)__M.step(6);return 1;})()'); await shot('kitchen-count-feet-cut');
    await pinShot('stockade-torch-left-floor', { level: LEVEL.stockade, heroes: ['knight', 'warden'], goblins: 'off', seed: 3 }, [[0, 3 * 16 + 24, 19 * 16], [1, 3 * 16 + 60, 19 * 16]], 180);
    await pinShot('stockade-torch-right-floor', { level: LEVEL.stockade, heroes: ['knight', 'warden'], goblins: 'off', seed: 3 }, [[0, 20 * 16 - 24, 19 * 16], [1, 20 * 16 - 60, 19 * 16]], 180);
    await pinShot('stockade-lookout', { level: LEVEL.stockade, heroes: ['knight', 'warden'], goblins: 'off', seed: 3 }, [[0, 11 * 16 + 4, 7 * 16], [1, 12 * 16 + 4, 7 * 16]], 180);
    await pinShot('stockade-floor-vs-lookout', { level: LEVEL.stockade, heroes: ['knight', 'warden', 'ranger'], goblins: 'off', seed: 3 }, [[0, 11 * 16 + 4, 7 * 16], [1, 4 * 16, 19 * 16], [2, 19 * 16, 19 * 16]], 240);
    await pinShot('pit-plank-posts', { level: LEVEL.pit, heroes: ['knight', 'warden'], goblins: 'off', seed: 3 }, [[0, 12 * 16, 11 * 16], [1, 5 * 16, 14 * 16]], 180);
    await pinShot('pit-plank-posts-low', { level: LEVEL.pit, heroes: ['knight', 'warden'], goblins: 'off', seed: 3 }, [[0, 20 * 16, 14 * 16], [1, 24 * 16 - 8, 17 * 16]], 180);
    // results card at 4 seats with the GOBLINS column
    const R = await runMatch({ level: LEVEL.stockade, heroes: heroSet(2, 4), goblins: 'many', seed: 55, arena: 'stockade' }, 'results-4seats stockade');
    await E('(()=>{BK.sim(30);return 1;})()'); await shot('results-card-4seats-goblins'); console.log('  gobs per seat', JSON.stringify(R.gobs), 'ended', R.phase);
    // tavern card (?duelcard): ARENA and GOBLINS rows at the natural 196 px card
    await E(`(async()=>{window.__DUELCARD=1;for(const k in BK.keys)BK.keys[k]=false;BK.coopEnd();BK.reset({fresh:true});BK.tavern.record(null);BK.tavern.p1Pad(null);await BK.tavern.enter();BK.sim(10);try{localStorage.removeItem('bracken.duelSettings')}catch(e){}
      const D=BK.duel().D;D.setSettings({teams:false,friendlyFire:false,goblins:'many',arena:'stockade',seats:[{hero:'knight'},{isBot:true,hero:'warden',botDifficulty:'normal'}]});
      const s=BK.tavern.debug().stations.find(q=>q.id==='arena');const p=BK.players()[0];for(let i=0;i<60;i++){p.x=s.x;p.y=20*16;p.vx=p.vy=0;p.face=1;BK.sim(1);} BK.press('talk');BK.sim(5);return 1;})()`, 60000);
    const cardRows = await E('(()=>{const c=BK.duel().D.st.card;return c?{roster:!!c.roster,row:c.row,top:c.top}:null;})()');
    console.log('  tavern card', JSON.stringify(cardRows)); ok(cardRows && !cardRows.roster, 'the interim tavern card (?duelcard) is open (not the roster)');
    for (const [nm, want] of [['arena', 'arena'], ['goblins', 'goblins']]) {
      for (let k = 0; k < 14; k++) { const sel = await E(`(()=>{const c=BK.duel().D.st.card;c.row=${k};window.__textRec=[];BK.sim(2);BK.draw1();return window.__textRec.filter(r=>/^> /.test(r.s||'')).map(r=>r.s);})()`); if (sel.some(s => s.startsWith('> ' + want.toUpperCase()))) break; }
      const rec = await E(`(()=>{window.__textRec=[];BK.sim(2);BK.draw1();return window.__textRec.filter(r=>/THE STOCKADE|FOUR LASHED|GOBLINS:|RANDOM - ONE/.test(r.s||'')).map(r=>({s:r.s,w:r.w,size:r.size,cut:!!r.cut}));})()`);
      console.log('  textrec(' + nm + '):', JSON.stringify(rec)); await shot('tavern-card-' + nm + '-row');
    }
  }  if (WHAT.includes('ctrl')) {
    console.log('== CTRL: do bots react to goblins? seat 1 = an idle human (the control), seats 2-3 = bots; every seat\'s health pinned; goblins MANY; fixed 12000 frames ==');
    if (curFlags !== FON) await fresh(FON);
    for (const a of ARENAS) {
      const rows = [];
      for (let i = 0; i < N; i++) {
        if (nPage >= RECYCLE) await fresh(FON); nPage++;
        const O = { level: LEVEL[a], heroes: heroSet(i + 4, 3), goblins: 'many', seed: 11 * (i + 1), idle: true, skip: true, arena: a };
        await E(`__mk(${JSON.stringify(O)})`);
        const r = await E(`(()=>{const M=__M,S=M.S;const spawned0=S.stats.gobSpawned|0;let fs=0;const pos0=[];for(let k=0;k<12000;k+=6){ for(const p of S.seats)p.duelHp=p.duelMax; if(S.m.phase==='count')S.m.t=0.05; M.step(6); if(S.m.phase==='fight')fs++; }
          return {heroes:S.seats.map(p=>p.hero),foeLoss:S.seats.map(p=>p.duelFoeLoss|0),gobKills:S.seats.map(p=>p.duelGobs|0),spawned:(S.stats.gobSpawned|0)-spawned0,blows:S.stats.foeBlows|0,overlap:M.gobOverlap,fs,x:S.seats.map(p=>Math.round(p.x))};})()`, 300000);
        rows.push(r); console.log('  ' + a + ' #' + (i + 1) + ' ' + r.heroes.join('/') + ' idle-human wound ' + r.foeLoss[0] + ' | bots wound ' + r.foeLoss.slice(1).join(',') + ' | goblin kills (idle,bots) ' + r.gobKills.join(',') + ' | goblins spawned ' + r.spawned);
        log({ tag: 'ctrl ' + a + ' #' + (i + 1), ...r });
      }
      const idle = rows.reduce((s, r) => s + r.foeLoss[0], 0), bots = rows.reduce((s, r) => s + r.foeLoss.slice(1).reduce((x, y) => x + y, 0) / (r.foeLoss.length - 1), 0);
      const kIdle = rows.reduce((s, r) => s + r.gobKills[0], 0), kBots = rows.reduce((s, r) => s + r.gobKills.slice(1).reduce((x, y) => x + y, 0) / (r.gobKills.length - 1), 0);
      console.log('SUMMARY ' + JSON.stringify({ arena: a, n: rows.length, idleWoundPerRun: +(idle / rows.length).toFixed(1), botWoundPerBotPerRun: +(bots / rows.length).toFixed(1), idleGobKills: +(kIdle / rows.length).toFixed(1), botGobKillsPerBot: +(kBots / rows.length).toFixed(1) }));
      ok(bots / rows.length < idle / rows.length || idle === 0, a + ': a bot takes fewer goblin wounds than a seat that stands still (bot ' + (bots / rows.length).toFixed(1) + ' vs idle ' + (idle / rows.length).toFixed(1) + ' hp per 12000 frames)');
    }
  }  if (WHAT.includes('flow')) {
    console.log('== FLOW: RANDOM draws, REMATCH stays, BACK TO THE INN returns ==');
    if (curFlags !== FON) await fresh(FON);
    await E(`(()=>{window.__fresh=async()=>{for(const k in BK.keys)BK.keys[k]=false;BK.coopEnd();BK.reset({fresh:true});BK.tavern.record(null);BK.tavern.p1Pad(null);await BK.tavern.enter();BK.sim(10);return BK.state;};return 1;})()`);
    const S = JSON.stringify({ teams: false, friendlyFire: false, goblins: 'few', arena: 'random', seats: [{ hero: 'knight' }, { isBot: true, hero: 'warden', botDifficulty: 'normal' }] });
    const drawn = {}; const NR = +(process.env.NRANDOM || 24);
    for (let i = 0; i < NR; i++) {
      if (i && i % 8 === 0) await fresh(FON), await E(`(()=>{window.__fresh=async()=>{for(const k in BK.keys)BK.keys[k]=false;BK.coopEnd();BK.reset({fresh:true});BK.tavern.record(null);BK.tavern.p1Pad(null);await BK.tavern.enter();BK.sim(10);return BK.state;};return 1;})()`);
      await E('__fresh()');
      const r = await E(`(async()=>{const D=BK.duel().D;D.st.want={k:'enter',bot:'warden',settings:${S}};for(let k=0;k<200&&!(D.debug().m&&D.debug().m.phase);k++){BK.sim(3);await new Promise(r=>setTimeout(r,25));}const d=D.debug();return {on:d.on,arena:d.arena,phase:d.m&&d.m.phase,levelDuel:!!(BK.level&&BK.level.duelPit)};})()`, 60000);
      const id = r.arena && r.arena.id; drawn[id] = (drawn[id] || 0) + 1;
      if (i === NR - 1) {
        // rematch + leave on the last draw: make it a one-round match, end it, press JUMP (rematch), then end it again and press E (back to the inn)
        const res = await E(`(async()=>{const D=BK.duel().D,st=D.st;st.m.toWin=1;const id0=D.debug().arena.id;let out={id0};
          const finish=()=>{ for(let k=0;k<30000&&D.debug().m.phase!=='over';k++)BK.sim(1); return D.debug().m.phase; };
          out.over1=finish(); BK.press('jump'); for(let k=0;k<200&&!(D.debug().m&&D.debug().m.phase==='count'&&D.debug().m.round===1&&D.debug().on);k++){BK.sim(3);await new Promise(r=>setTimeout(r,25));} const d2=D.debug(); out.reArena=d2.arena&&d2.arena.id; out.reRandomFlag=d2.arena&&d2.arena.random; out.rePhase=d2.m&&d2.m.phase; out.reOn=d2.on;
          st.m.toWin=1; out.over2=finish(); BK.press('talk'); for(let k=0;k<200&&D.debug().on;k++){BK.sim(3);await new Promise(r=>setTimeout(r,25));} await new Promise(r=>setTimeout(r,300)); BK.sim(30); out.leftOn=D.debug().on; out.tavern=!!(BK.level&&BK.level.tavern); out.state=BK.state; return out; })()`, 120000);
        console.log('  rematch/leave:', JSON.stringify(res));
        ok(res.over1 === 'over' && res.reArena === res.id0 && res.rePhase === 'count' && res.reOn, 'REMATCH stays in the same arena (' + res.id0 + ' -> ' + res.reArena + ', phase ' + res.rePhase + ')');
        ok(res.leftOn === false && res.tavern, 'BACK TO THE INN leaves the duel and lands in the tavern (duel on=' + res.leftOn + ', tavern level=' + res.tavern + ')');
      }
    }
    console.log('  RANDOM drew over ' + NR + ' starts: ' + JSON.stringify(drawn));
    ok(['pit', 'stockade', 'rootway', 'kitchen'].every(a => drawn[a] > 0) && Object.keys(drawn).every(a => ['pit', 'stockade', 'rootway', 'kitchen'].includes(a)), 'RANDOM draws all four arenas and nothing else');
  }} finally { try { await pg?.close?.(); } catch (e) {} }
function r0(O) { return O.heroes.join('/'); }
writeFileSync(join(SHOTS, 'summary-' + WHAT.join('+') + '.json'), JSON.stringify(summary, null, 1));
console.log(fails.length ? '\nduelproofs2: ' + fails.length + ' FAIL' : '\nduelproofs2: all ok');
process.exit(fails.length ? 1 : 0);
