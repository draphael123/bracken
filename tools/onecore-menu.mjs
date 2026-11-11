/* tools/onecore-menu.mjs (claude/onecore-d) - BROWSER smoke of the skills menu with ONECORE on (lab switch, as ?onecore=on): for all nine heroes at L22 and L6 the TRAITS tab has ONE core row,
   the moved cores show as trait rows (LV n / S1 / rank), the TRAITS strip under the actives says CORE + S1 + S2, a moved core can be WORN from the picker (confirm on its row) and is then on,
   and nothing throws. ONECORE_SCREEN=<prefix> writes the paladin / pyro / knight passives + strip screens.   node tools/onecore-menu.mjs */
import assert from 'node:assert/strict'; import { openPage } from './cdp.mjs'; import { writeFileSync } from 'node:fs';
const pg = await openPage({ audio: false, fonts: false }); try {
  const r = await pg.evalp(`(async()=>{const TR=await import('/src/traits.js'),{xpFloor}=await import('/src/xp.js'),{passiveOn}=await import('/src/progression.js');TR.setTraitsShip(true);TR.setOnecoreShip(true);BK.manualSimulation=true;const rows=[],shots=[];
  for(const lv of [22,6])for(const h of ['knight','paladin','pyro','warden','ranger','geomancer','pirate','reaper','berserker']){
   BK.setHero(h);BK.reset({fresh:true});BKT.PROG.xp[h]=xpFloor(lv);delete (BKT.PROG.traits||{})[h];BK.applyUpgrades();BK.load(0);BK.state='play';BK.enemies().forEach(e=>e.alive=false);BK.sim(30);
   BK.state='map';dispatchEvent(new KeyboardEvent('keydown',{key:'q'}));BK.sim(1);dispatchEvent(new KeyboardEvent('keyup',{key:'q'}));BK.ui.treeTab=0;
   window.__textRec=[];BK.step(120);BK.step(1);const strip=window.__textRec.filter(q=>q.kind==='text').map(q=>q.s);window.__textRec=null;if(!strip.includes('CORE')||!strip.includes('S1')||!strip.includes('S2'))throw Error('strip missing '+h);
   if(lv===22&&['knight','paladin','pyro'].includes(h))shots.push({name:h+'-actives',png:BK.view.buf.toDataURL()});
   BK.press('right');BK.sim(1);const ns=BKT.treeNodes(),cores=ns.filter(n=>n.tkind==='core'),moved=TR.movedCores(h);
   if(cores.length!==1)throw Error(h+' core rows '+cores.length);for(const id of moved)if(!ns.some(n=>n.id===id&&n.tkind==='trait'))throw Error(h+' moved '+id+' not a trait row');
   const labels=moved.map(id=>{const n=ns.find(x=>x.id===id);return id+'='+TR.rowLabel(BKT.PROG,h,n,lv);});
   /* wear the first LEARNED moved core from the picker: select its row and confirm */
   let wore=null;const m=moved.find(id=>TR.learned(BKT.PROG,h,id,lv));if(m){BK.ui.treeI=ns.findIndex(n=>n.id===m);BK.step(1);BK.press('confirm');BK.sim(2);wore={id:m,worn:TR.wornOf(BKT.PROG,h,lv),on:passiveOn(BKT.PROG,h,m,lv)};}
   window.__textRec=[];BK.step(120);BK.step(1);window.__textRec=null;if(lv===22&&['knight','paladin','pyro'].includes(h))shots.push({name:h+'-traits',png:BK.view.buf.toDataURL()});
   BK.press('left');BK.sim(1);dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));BK.sim(1);dispatchEvent(new KeyboardEvent('keyup',{key:'Escape'}));
   rows.push({h,lv,core:cores[0].id+'('+TR.rowLabel(BKT.PROG,h,cores[0],lv)+')',labels,wore,stripWords:strip.slice(strip.indexOf('CORE'),strip.indexOf('CORE')+7).join('|')});
  }TR.setOnecoreShip(false);return{rows,shots};})()`);
  assert.deepEqual(pg.errors, []);
  if (process.env.ONECORE_SCREEN) for (const s of r.shots) writeFileSync(process.env.ONECORE_SCREEN + '-' + s.name + '.png', Buffer.from(s.png.split(',')[1], 'base64'));
  for (const x of r.rows) console.log(JSON.stringify(x));
  console.log('onecore-menu ok: ' + r.rows.length + ' hero/level screens');
} finally { pg.close(); }
