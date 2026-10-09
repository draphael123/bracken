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
export function fightJs({ r, way, h, s, profile, flasks }, secs = 240) {
  const [id, fl] = r.split(':'), lvl = levelOverride() ?? campaignLevel(id), built = way === 'built', fk = fightFlasks(id, flasks), fkN = Object.keys(fk).filter(k => ['tonic', 'extra2', 'extra3'].includes(k)).length;
  const prof = way === 'first' ? (typeof profile === 'string' ? profile + '+first' : { ...profile, first: true }) : profile;
  return { lvl, js: `(async()=>{BK.manualSimulation=true;const P0=BKT.PROG,h=${JSON.stringify(h)},lvl=${lvl};BKT.setHeroLevel(h,lvl);P0.skillOwned=P0.skillOwned||{};P0.loadouts=P0.loadouts||{};P0.skillOwned[h]={};P0.loadouts[h]=[];if(P0.talents)P0.talents[h]={};let kit=[];
    ${built ? `const B=await import('/src/bot-profile.js'),PR=await import('/src/progression.js');P0.card[h]=B.typicalCard(lvl);kit=(B.TYPICAL_SKILLS[h]||[]).filter(id=>{const n=PR.skillFor(h,id);return n&&n.active&&n.level<=lvl;}).slice(0,PR.slotsAt(lvl));for(const id of kit)P0.skillOwned[h][id]=true;P0.loadouts[h]=kit.slice();` : ''}
    P0.flaskItems=${JSON.stringify(fk)};P0.flaskUp=${fkN};
    BK.setHero(h);BK.reset({fresh:true});BK.applyUpgrades();const maxHp=BK.P.maxHp,flasks0=BK.P.flasks,heal0=BK.flaskHealPct?BK.flaskHealPct():null;
    const r=(await BK.bossLab({bosses:[${JSON.stringify(id)}],heroes:[h],maxSecs:${secs},healthMode:'normal',seed:${s},profile:${JSON.stringify(prof)}${built ? ',skills:true' : ''}${fl ? ',mini:true' : ''}})).rows[0]||{};
    return {maxHp,kit,flasks0,heal0,drank:r.health&&r.health.drinks,outcome:r.outcome||r.skipped,boss:r.boss,secs:r.secs,bossLeft:r.hpLeftPct,taken:r.health?Math.round(r.health.damageTaken):null,opened:r.opened,swings:r.swings,eyes:r.eyes,casts:r.skillCasts};})()` };
}
/* a page, tried three times: under a loaded machine a first navigate can miss its 15 s */
export async function openRetry() { let e0; for (let i = 0; i < 3; i++) { try { return await openPage({ audio: false, fonts: false }); } catch (e) { e0 = e; await new Promise(r => setTimeout(r, 3000)); } } throw e0; }
export const won = x => x.outcome === 'win' || x.outcome === 'trade';
export async function runFights(list, { jobs = 2, secs = 240, onRow = null } = {}) {
  const queue = list.slice(), out = [], pages = [await openRetry()];
  for (let i = 1; i < Math.min(jobs, list.length); i++) pages.push(await openRetry());
  const worker = async i => { for (;;) { const F = queue.shift(); if (!F) return; let row; const { lvl, js } = fightJs(F, secs);
    try { await pages[i].reload(); row = await pages[i].evalp(js, 1200000); }
    catch (e) { row = { err: String(e.message).slice(0, 120) }; try { pages[i].close(); } catch {} pages[i] = await openRetry(); }
    const rec = { row: F.r, way: F.way, hero: F.h, seed: F.s, lvl, tag: F.tag, ...row }; out.push(rec); if (onRow) onRow(rec, out); } };
  try { await Promise.all(pages.map((_, i) => worker(i))); } finally { for (const p of pages) try { p.close(); } catch {} }
  return out;
}
export const line = x => x.row + ' ' + x.way + ' ' + x.hero + ' s' + x.seed + ' L' + x.lvl + ': ' + (x.err ? 'ERR ' + x.err : x.outcome + ' ' + x.secs + 's left ' + x.bossLeft + '% taken ' + x.taken
  + (x.eyes ? ' rt' + x.eyes.rtMean + ' mis' + x.eyes.misreads + ' greed' + x.eyes.greeds : '') + (x.casts ? ' casts ' + JSON.stringify(x.casts) : ''));
