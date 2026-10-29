/* tools/boss-run.mjs - THE BOSS BOT'S FIGHT RUNNER, shared by tools/boss-rates.mjs and tools/bot-calibrate.mjs (claude/bot2).
   runFights(fights, {jobs, secs, onRow}) plays each {r: 'level[:mini]', way: 'practiced'|'first'|'built', h, s, profile} fight in a fresh page
   at the boss's campaign level (tools/boss-level.mjs; --level=N overrides), NORMAL health, and returns a row per fight. `profile` is a name in
   src/bot-profile.js or an object ({base:'human', rtMode: 320, ...}); 'first' adds a first attempt; 'built' carries the typical build. */
import { openPage } from './cdp.mjs';
import { campaignLevel, levelOverride } from './boss-level.mjs';
import { LEVELS } from '../src/level.js';
import { depthsOf } from '../src/campaign-order.js';
import { flaskKitAt, beatenBeforeIn } from '../src/campaign-kit.js';
/* (claude/flasks2, B6: bosses are tuned WITH the campaign kit's flasks) THE FLASKS A FIGHT CARRIES: 'kit' (the default) - the typical flask build at that
   point of the road (src/campaign-kit.js flaskKitAt: count, potency, QUICK DRAUGHT); 'bare' - one flask at 35%, what every boss row was measured with before
   (a fresh page's save). --flasks=bare|kit on boss-rates, or BOSS_FLASKS=bare. */
const DEPTH = depthsOf(LEVELS);
export const fightFlasks = (id, mode = process.env.BOSS_FLASKS || 'kit') => mode === 'bare' ? {} : flaskKitAt(id, DEPTH[id] ?? 1, beatenBeforeIn(LEVELS, id));
/* (claude/flasklever) FLASK_LEVER='{"drinkT":..,"swallowAt":..,"quick":{"drinkT":..,"swallowAt":..},"potency":{"base":..,"cap":..},"tiers":{"rich":..,"distilled":..,"sunlight":..}}' sets the flask numbers in the page before a fight (a lever experiment, no code edit) */
const leverJs = () => { const L = process.env.FLASK_LEVER; if (!L) return ''; return "{const SV=await import('/src/survival.js'),F2=await import('/src/flasks2.js');const L=" + L + ";if(L.drinkT)SV.FLASK.drinkT=L.drinkT;if(L.swallowAt)SV.FLASK.swallowAt=L.swallowAt;if(L.quick){F2.QUICK.drinkT=L.quick.drinkT;F2.QUICK.swallowAt=L.quick.swallowAt;}if(L.potency){F2.POTENCY.base=L.potency.base;F2.POTENCY.cap=L.potency.cap;}if(L.tiers)for(const k in L.tiers){const it=F2.itemOf(k);if(it)it.heal=L.tiers[k];}if(L.pressure){const BP=await import('/src/boss-pressure.js');for(const a in L.pressure)Object.assign(BP.PRESSURE[a],L.pressure[a]);}}"; };
/* (claude/bkbot) BK_LEVER='{"debt":{"reclaim":0.7},"price":{"pct":0.08}}' deep-merges into src/blood-kit.js BLOOD in the page before the fight (a hero-tune experiment, no code edit) */
const bkLeverJs = () => { const L = process.env.BK_LEVER; if (!L) return ''; return "{const BKM=await import('/src/blood-kit.js');const L=" + L + ";const mg=(t,s)=>{for(const k in s){if(s[k]&&typeof s[k]==='object'&&!Array.isArray(s[k])&&t[k]&&typeof t[k]==='object')mg(t[k],s[k]);else t[k]=s[k];}};mg(BKM.BLOOD,L);}"; };
export function fightJs({ r, way, h, s, profile, flasks }, secs = 240) {
  const [id, fl] = r.split(':'), lvl = levelOverride() ?? campaignLevel(id), built = way === 'built', fk = fightFlasks(id, flasks), fkN = Object.keys(fk).filter(k => ['tonic', 'extra2', 'extra3'].includes(k)).length;
  const prof = way === 'first' ? (typeof profile === 'string' ? profile + '+first' : { ...profile, first: true }) : profile;
  return { lvl, js: `(async()=>{BK.manualSimulation=true;const P0=BKT.PROG,h=${JSON.stringify(h)},lvl=${lvl};BKT.setHeroLevel(h,lvl);P0.skillOwned=P0.skillOwned||{};P0.loadouts=P0.loadouts||{};P0.skillOwned[h]={};P0.loadouts[h]=[];if(P0.talents)P0.talents[h]={};let kit=[];
    ${built ? `const B=await import('/src/bot-profile.js'),PR=await import('/src/progression.js');P0.card[h]=B.typicalCard(lvl);kit=${process.env.BK_KIT ? JSON.stringify(process.env.BK_KIT.split(",")) : "(B.TYPICAL_SKILLS[h]||[])"}.filter(id=>{const n=PR.skillFor(h,id);return n&&n.active&&n.level<=lvl;}).slice(0,PR.slotsAt(lvl));for(const id of kit)P0.skillOwned[h][id]=true;P0.loadouts[h]=kit.slice();` : ''}
    P0.flaskItems=${JSON.stringify(fk)};P0.flaskUp=${fkN};${leverJs()}${bkLeverJs()}
    BK.setHero(h);BK.reset({fresh:true});BK.applyUpgrades();${process.env.BLOW_CENSUS ? 'BK.blowRec={};' : ''}${process.env.HITLOG ? 'BK.hitLog=[];' : ''}const maxHp=BK.P.maxHp,flasks0=BK.P.flasks,heal0=BK.flaskHealPct?BK.flaskHealPct():null;
    if(h==='ranger'&&BK.rgk&&BK.rgk())BK.rgk().resetStats();if(h==='geomancer'&&BK.geo&&BK.geo()&&BK.geo().resetTierStats)BK.geo().resetTierStats();const r=(await BK.bossLab({bosses:[${JSON.stringify(id)}],heroes:[h],maxSecs:${secs},healthMode:'normal',seed:${s},profile:${JSON.stringify(prof)}${built ? ',skills:true' : ''}${fl === 'mini2' ? ',mini:2' : fl ? ',mini:true' : ''}${process.env.BOSS_MODES ? ',modes:true' : ''}})).rows[0]||{};
    return {stk:BK.stockade?(q=>q&&q.tower?q.tower.st+':'+q.tower.pegs.filter(p=>p.cut).length+(q.stats?' '+Object.entries(q.stats).map(([k,v])=>k+v).join(','):''):null)(BK.stockade()):null,maxHp,kit,flasks0,heal0,drank:r.health&&r.health.drinks,outcome:r.outcome||r.skipped,boss:r.boss,secs:r.secs,bossLeft:r.hpLeftPct,taken:r.health?Math.round(r.health.damageTaken):null,opened:r.opened,swings:r.swings,eyes:r.eyes,casts:r.skillCasts,rp:BK.riposte?(q=>({par:q.parries,open:q.boss,warded:q.bossWarded,openHits:q.bossOpenHits,pips:q.pips,pipsMax:q.pipsMax,verbs:q.verbs}))(BK.riposte().stats):null,bz:h==='berserker'&&BK.bz?(q=>({fr:q.frenzies,rend:q.rends,crack:q.cracks,heal:Math.round(q.healed),take:q.takes,abs:Math.round(q.absorbed),par:q.parries,pn:BK.crouchC?BK.crouchC().stats&&BK.crouchC().stats.pounces:null,t:[q.tier1,q.tier2,q.tier3]}))(BK.bz().stats):null,geo:h==='geomancer'&&BK.geoTier?(q=>q&&({t:q.tiers,pil:q.pillars,step:q.steps,shard:q.shardHits}))(BK.geoTier().stats):null,rg:h==='ranger'&&BK.rgk?(q=>({t1:q.tier1,t2:q.tier2,t3:q.tier3,fan:q.fans,fh:q.fanHits,foc:q.focused,quick:q.quick,draws:q.draws}))(BK.rgk().read().stats):null${process.env.BLOW_CENSUS ? ',blows:BK.blowRec' : ''}${process.env.HITLOG ? ',hits:BK.hitLog' : ''}${process.env.BOSS_MODES ? ',modes:r.modes,hitBy:r.hitBy' : ''},bk:h==='reaper'?(q=>({par:BK.stats().parries,perf:q.bkPerfects||0,price:q.bkPrices||0,spike:q.bkSpikes||0,rec:Math.round(q.bkReclaimed||0),drain:q.bkDrains||0,paid:Math.round(q.bkHostPaid||0),frz:q.bkFrenzies||0,stole:Math.round(q.bkStole||0),lash:q.bkLashHits||0,bfed:Math.round(q.bkBleedFed||0)}))(BK.P):null,am:BK.antiMash?(q=>({stale:q.stale,lost:q.staleLost,breaks:q.breaks,fin:q.finishers,verbs:q.verbs,pun:q.punish}))(BK.antiMash()):null,rot:window.__labRot||null};})()` };
}
/* (claude/difficulty) THE MODE A FIGHT IS PLAYED ON: DIFFICULTY=easy|normal|master (--difficulty= on boss-rates / mash-bot / level-walk sets it); set in the page after every reload (src/difficulty.js setOverride) */
export const diffJs = () => 'BK.difficulty&&BK.difficulty.setOverride(' + JSON.stringify(process.env.DIFFICULTY || 'normal') + ')';
/* a page, tried three times: under a loaded machine a first navigate can miss its 15 s */
export async function openRetry(opts = {}) { let e0; for (let i = 0; i < 3; i++) { try { return await openPage({ audio: false, fonts: false, ...opts }); } catch (e) { e0 = e; await new Promise(r => setTimeout(r, 3000)); } } throw e0; }
export const won = x => x.outcome === 'win' || x.outcome === 'trade';
export async function runFights(list, { jobs = 2, secs = 240, onRow = null } = {}) {
  if (!list.length) return [];
  const queue = list.slice(), out = [], keeper = await openRetry();
  /* One browser owns the server and profile. Each seed gets a fresh, disposable browser context,
     so no fight inherits localStorage or page state and we skip the old page's extra reload. */
  const worker = async () => { for (;;) { const F = queue.shift(); if (!F) return; let row, pg; const { lvl, js } = fightJs(F, secs);
    try { pg = await openRetry({ browserPort: keeper.browserPort }); await pg.evalp(diffJs()); row = await pg.evalp(js, +process.env.BOSS_EVAL_MS || 1200000);   /* (claude/bkbot) BOSS_EVAL_MS: give up on a fight whose page died (memguard kills a leaking headless Chrome) instead of waiting 20 min */ }
    catch (e) { row = { err: String(e.message).slice(0, 120) }; }
    finally { if (pg) await pg.close(); }
    const rec = { row: F.r, way: F.way, hero: F.h, seed: F.s, lvl, tag: F.tag, ...row }; out.push(rec); if (onRow) onRow(rec, out); } };
  try { await Promise.all(Array.from({ length: Math.min(jobs, list.length) }, () => worker())); } finally { await keeper.close(); }
  return out;
}
export const line = x => x.row + ' ' + x.way + ' ' + x.hero + ' s' + x.seed + ' L' + x.lvl + ': ' + (x.err ? 'ERR ' + x.err : x.outcome + ' ' + x.secs + 's left ' + x.bossLeft + '% taken ' + x.taken + (x.stk ? ' tower ' + x.stk : '')
  + (x.eyes ? ' rt' + x.eyes.rtMean + ' mis' + x.eyes.misreads + ' greed' + x.eyes.greeds + (x.eyes.guardTells !== undefined ? ' guard ' + x.eyes.guardRaised + '/' + x.eyes.guardTried + '/' + x.eyes.guardTells : '') : '') + (x.bk ? ' bk ' + JSON.stringify(x.bk) : '') + (x.casts ? ' casts ' + JSON.stringify(x.casts) : '') + (x.rp ? ' rp ' + JSON.stringify(x.rp) : '') + (x.bz ? ' bz ' + JSON.stringify(x.bz) : '') + (x.rg ? ' rg ' + JSON.stringify(x.rg) : '') + (x.geo ? ' geo ' + JSON.stringify(x.geo) : '') + (x.am ? ' am ' + JSON.stringify(x.am) : '') + (x.rot ? ' rot ' + JSON.stringify(x.rot) : ''));   /* (claude/riposte) the parries, the boss's riposte openings and the mix-up chain's pips and verbs */
