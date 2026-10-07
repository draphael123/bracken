/* tools/hero-ledger.mjs - WHERE A HERO'S FIGHT GOES (claude/wardenkit; a measuring tool, not a check).
   The boss standard's fight (tools/boss-run.mjs fightJs: campaign level, normal health, the standard profile, no skills) with a ledger:
   what each of the boss's modes took off the hero (bossLab modes), every blow that landed on the boss (size, and whether he was open),
   her dodges and how far each carried, and the turns (parries / deflects / blocks) her answers made.
     PORT=8675 node tools/hero-ledger.mjs <level>[:mini][,...] [--heroes=knight,warden,pyro] [--seeds=2] [--secs=240] [--profile=human]
   Prints one line a fight and a per-hero summary per row. */
import { openRetry } from './boss-run.mjs';
import { campaignLevel, levelOverride } from './boss-level.mjs';
import { STANDARD } from '../src/bot-profile.js';
const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const rows = args.filter(a => !a.startsWith('-')).flatMap(a => a.split(','));
const heroes = opt('heroes', 'knight,warden,pyro').split(','), seeds = +opt('seeds', 2), secs = +opt('secs', 240), prof = opt('profile', STANDARD);
const js = (id, mini, h, s, lvl) => `(async()=>{BK.manualSimulation=true;const P0=BKT.PROG,h=${JSON.stringify(h)};BKT.setHeroLevel(h,${lvl});P0.skillOwned=P0.skillOwned||{};P0.loadouts=P0.loadouts||{};P0.skillOwned[h]={};P0.loadouts[h]=[];if(P0.talents)P0.talents[h]={};
  BK.setHero(h);BK.reset({fresh:true});BK.applyUpgrades();
  const L={openDmg:0,chipDmg:0,openings:0,tipN:0,midN:0,haftN:0,hits:[],openHits:0,dodges:0,dodgeDx:[],turns:0,deflects:0,frames:0};L.blows={};const RM=await import('/src/playrec.js'),R0={on:RM.REC.on,hurt:RM.REC.hurt,frame:RM.REC.frame,draw:RM.REC.draw,skill:RM.REC.skill};RM.REC.on=true;RM.REC.frame=()=>{};RM.REC.draw=()=>{};RM.REC.skill=()=>{};RM.REC.hurt=(o,lost,r)=>{if(!(lost>0||r==='blocked'))return;const P=BK.P,k=(o&&o.blow||o&&o.name||(o&&o.who&&o.who.t+'|'+o.who.mode)||'?')+(o&&o.unblockable?' RED':' yel')+(r==='blocked'?' TURNED':(P.deflectT>0?' (deflect live)':P.deflectRec>0?' (in recovery)':''));const q=L.blows[k]||(L.blows[k]={n:0,d:0});q.n++;q.d+=Math.round(lost||0);};BK.log=[];const sim0=BK.sim.bind(BK);let dg=null;
  BK.sim=function(n=1){for(let i=0;i<n;i++){const P=BK.P,bs=BK.enemies().filter(e=>e.maxHp&&e.alive),hp=bs.map(e=>e.hp),gc=bs.map(e=>(e.greedLog||[]).length),op=bs.map(e=>BK.bossOpen?BK.bossOpen(e)===true:e.open>0),d0=P.dodge||0,df0=P.deflectT||0,st0=BK.stats().parries;
    sim0(1);L.frames++;bs.forEach((e,j)=>{const d=hp[j]-e.hp;if(d>0.5){L.hits.push(Math.round(d));const o=BK.bossOpen?BK.bossOpen(e)===true:e.open>0;if(o){L.openHits++;L.openDmg+=d;}else{L.chipDmg+=d;L.chipN=(L.chipN||0)+1;L.chipDx=(L.chipDx||0)+Math.abs(BK.P.x-e.x)-(e.w||20)/2;}}if((e.greedN||0)>(L['g'+j]||0)){L.reprisals=(L.reprisals||0)+1;L['g'+j]=e.greedN;}{const g=(e.greedLog||[]).length;if(g>gc[j]){L.greedy=(L.greedy||0)+1;}}const o2=BK.bossOpen?BK.bossOpen(e)===true:e.open>0;if(o2&&!op[j])L.openings++;});
    if((P.dodge||0)>d0+0.05){L.dodges++;dg={x:P.x,f:0};}if(dg){dg.f++;if(!(P.dodge>0)||dg.f>40){L.dodgeDx.push(Math.round(Math.abs(P.x-dg.x)));dg=null;}}
    if((P.deflectT||0)>df0+0.1)L.deflects++;L.turns+=BK.stats().parries-st0;}};
  try{const r=(await BK.bossLab({bosses:[${JSON.stringify(id)}],heroes:[h],maxSecs:${secs},healthMode:'normal',seed:${s},profile:${JSON.stringify(prof)},modes:true${mini ? ',mini:true' : ''}})).rows[0]||{};
  const band={tip:0,mid:0,haft:0};for(const q of BK.log){if(q.k!=='dmgE'||!q.e||!q.e.maxHp)continue;const d=Math.abs(q.e.x-q.fromX)-(q.e.w||20)/2;band[d>=28?'tip':d>=14?'mid':'haft']++;}BK.log=null;L.band=band;return {outcome:r.outcome||r.skipped,secs:r.secs,left:r.hpLeftPct,taken:r.health?Math.round(r.health.damageTaken):null,maxHp:BK.P.maxHp,swings:r.swings,opened:r.opened,hitBy:r.hitBy,blocks:r.returns,L};}finally{BK.sim=sim0;Object.assign(RM.REC,R0);}})()`;
const pg = await openRetry(); const all = [];
try {
  for (const r of rows) { const [id, fl] = r.split(':'), lvl = levelOverride() ?? campaignLevel(id);
    for (const h of heroes) for (let s = 1; s <= seeds; s++) {
      await pg.reload(); let x; try { x = await pg.evalp(js(id, fl, h, s, lvl), 1200000); } catch (e) { x = { err: String(e.message).slice(0, 100) }; }
      all.push({ r, h, s, lvl, ...x });
      if (x.err) { console.log(r, h, 's' + s, 'ERR', x.err); continue; }
      const hits = x.L.hits, avg = hits.length ? Math.round(hits.reduce((a, b) => a + b, 0) / hits.length) : 0, dx = x.L.dodgeDx, top = Object.entries(x.hitBy || {}).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => k + ' ' + Math.round(v)).join(', ');
      const bl=Object.entries(x.L.blows).sort((a,b)=>b[1].d-a[1].d).slice(0,8).map(([k,v])=>k+' '+v.n+'x'+v.d).join('; ');
      console.log(`${r} ${h} s${s} L${lvl}: ${x.outcome} ${x.secs}s boss left ${x.left}% taken ${x.taken}/${x.maxHp} | hits ${hits.length} avg ${avg} (open ${x.L.openHits}) openings ${x.L.openings} dmg/opening ${x.L.openings?Math.round(x.L.openDmg/x.L.openings):'-'} open ${Math.round(x.L.openDmg)} else ${Math.round(x.L.chipDmg)} chips ${x.L.chipN||0} at ${x.L.chipN?Math.round(x.L.chipDx/x.L.chipN):'-'}px reprisals ${x.L.reprisals||0} greedy ${x.L.greedy||0} | bands ${JSON.stringify(x.L.band)} | dodges ${x.L.dodges} dx~${dx.length ? Math.round(dx.reduce((a, b) => a + b, 0) / dx.length) : '-'} | deflects ${x.L.deflects} turns ${x.L.turns} | hurt by: ${top}
    blows: ${bl}`); } }
} finally { pg.close(); }
