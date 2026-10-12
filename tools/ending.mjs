/* tools/ending.mjs - THE END OF THE ROAD, FOR NOW (claude/shipfix, Daniel 10-11; src/ending.js, main.js drawVictory).
 *   A solo player's last level used to be a win card and the map; the co-op VICTORY card fired in the MIDDLE of the road, at THE MAGE'S FOLLY ('THE ARCHMAGE IS DOWN'),
 *   with the Falling Tower and the whole desert still ahead. Now:
 *   - the end of the road is the end of the main-road gate chain (src/campaign-order.js), never a hard-coded id, and THE MAGE'S FOLLY is not it;
 *   - clearing that last level (solo OR co-op) shows 'END OF THE ROAD - FOR NOW' with the figures the save holds (road cleared, best times and deaths added up, medals,
 *     completion %) and 'MORE ROAD IS COMING'; Z takes it back to the map; nothing on it speaks of the archmage;
 *   - clearing THE MAGE'S FOLLY (solo or co-op) is an ordinary win card and the map.
 */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';

const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{BK.manualSimulation=true; const out={fails:[],seen:{}}; const F=m=>out.fails.push(m);
const {LEVELS}=await import('/src/level.js'); const E=await import('/src/ending.js');
const idx=id=>LEVELS.findIndex(l=>l.id===id), road=E.roadOf(LEVELS), end=E.roadEndId(LEVELS); out.road=road.length; out.end=end;
if(end==='mage')F('the end of the road is still the Mage\\'s Folly'); if(road.indexOf('mage')<0||road.indexOf('mage')>=road.length-1)F('the Mage\\'s Folly is not mid-road in the chain?');
for(const l of LEVELS) if(!l.hidden&&l.needs===end)F(l.id+' needs the end of the road ('+end+'): it is not the end');
const texts=()=>{const s=new Set(); for(let k=0;k<3;k++){window.__textRec=[]; BK.step(2); for(const t of (window.__textRec||[])) if(t.kind==='text') s.add(t.s); window.__textRec=null;} return [...s];};
const press=k=>{BK.press(k);BK.sim(1);};
const clearRoad=()=>{for(const id of road) BKT.PROG[id]={cleared:true,medal:id===end?0:3,best:100,deaths:2,gold:5,total:5};};
const run=(id,co)=>{BK.setHero('knight'); BK.reset({fresh:true}); BK.load(idx(id)); BK.state='play'; BK.step(2); if(co){BK.coopStart('warden',false); BK.sim(2);} clearRoad(); BK.xpWin(); BK.sim(2);
  const win=BK.state; press('confirm'); const after=BK.state; const t=after==='victory'?texts():[]; const T=E.roadTally(BKT.PROG,LEVELS); press('confirm'); return {win,after,t,T,back:BK.state};};
for(const co of [false,true]){ const tag=co?'coop':'solo';
  const m=run('mage',co); out.seen[tag+'-mage']=m.win+'>'+m.after; if(m.win!=='win')F(tag+' mage: no win card ('+m.win+')'); if(m.after==='victory')F(tag+': the victory card fired at the Mage\\'s Folly, mid-road'); if(m.after!=='map')F(tag+' mage: Z from the win card went to '+m.after+', not the map');
  const e=run(end,co); out.seen[tag+'-end']=e.win+'>'+e.after+'>'+e.back; if(e.win!=='win')F(tag+' end: no win card ('+e.win+')'); if(e.after!=='victory')F(tag+' end: the last level did not show the end card ('+e.after+')'); if(e.back!=='map')F(tag+' end: Z from the end card went to '+e.back);
  if(e.after==='victory'){ const t=e.t; out.seen[tag+'-texts']=t.join(' / ');
    if(!t.includes('END OF THE ROAD')||!t.includes('- FOR NOW -'))F(tag+' card title missing: '+t.join(' / ')); if(!t.includes('MORE ROAD IS COMING'))F(tag+' card lacks MORE ROAD IS COMING');
    if(t.some(s=>/ARCHMAGE|^VICTORY$/.test(s)))F(tag+' card still speaks of the archmage / VICTORY: '+t.join(' / '));
    if(!co){ if(!t.includes(e.T.cleared+' / '+e.T.levels))F('solo card road cleared figure ('+e.T.cleared+' / '+e.T.levels+') missing: '+t.join(' / ')); if(!t.includes(e.T.pct+'%'))F('solo card completion % missing ('+e.T.pct+'%)'); if(!t.some(s=>s==='G '+e.T.medals[3]+'   S '+e.T.medals[2]+'   B '+e.T.medals[1]))F('solo card medals missing: '+t.join(' / ')); if(!t.includes('completion'))F('no completion label'); }
    else if(!t.some(s=>/^P1 /.test(s)))F('co-op card lost its two columns'); } }
/* the figures: a fresh save is 0, the full road is 100 on cleared+gold */
const P0={}; if(E.completion(P0,LEVELS)!==0)F('an empty save is not 0%'); const Pf={}; for(const l of LEVELS.filter(l=>!l.hidden)) Pf[l.id]={cleared:true,medal:3}; if(E.completion(Pf,LEVELS)!==100)F('a full gold save is not 100%: '+E.completion(Pf,LEVELS));
const Th=E.roadTally(Pf,LEVELS); if(Th.cleared!==road.length||Th.medals[3]!==road.length)F('the tally of a full road is wrong');
return out; })()`);
  console.log('   road ' + r.road + ' levels, ends at ' + r.end + ' | ' + Object.entries(r.seen).filter(([k]) => !/texts/.test(k)).map(([k, v]) => k + ': ' + v).join(' | '));
  assert.deepEqual(r.fails, [], 'FAILS:\n  ' + r.fails.join('\n  '));
  console.log('ok  ending         solo and co-op: the Mage\'s Folly is a plain win; the last level of the road shows END OF THE ROAD - FOR NOW with its figures and MORE ROAD IS COMING');
} finally { await pg.close(); }
