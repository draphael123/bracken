/* tools/save-slots.mjs - FIVE SAVE SLOTS (Daniel 2026-10-02: five instead of three).
 *   A. main.js: SLOTS is 5 (and the level editor's ED_SLOTS is left alone).
 *   B. EACH SLOT IS ITS OWN: five saves written to bracken.progress.0..4 read back, load into PROG and erase one at a time, and erasing
 *      one never touches another. Slot 5 (index 4) is reachable, not clamped away.
 *   C. OLD SAVES LOAD UNCHANGED: a three-slot era save in slots 0-2 (hero, coins, xp, a cleared wood and a medal) keeps every one of those
 *      fields through loadSlot, byte-identical in storage after writing slots 4-5 and erasing one of them; the legacy single save
 *      (bracken.progress) still opens as slot 1.
 *   D. THE SCREEN: ARROWS wrap over all five (right from 5 is 1, left from 1 is 5), UP/DOWN walk the five rows, Z opens the
 *      picked slot, X twice erases only it. Every card draws its slot number, and a filled one its HERO and HERO LEVEL besides the
 *      woods, gold and medal points; all five fit the screen (the textfit 'slots' scope checks the pixels).
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { openPage } from './cdp.mjs';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
assert.ok(/const SLOTS = 5;/.test(main), 'main.js SLOTS is not 5');
assert.ok(/const ED_SLOTS = \d+/.test(main) || /ED_SLOTS/.test(main), 'the editor slots vanished (they are unrelated and must stay)');

const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const{xpFloor,levelOfXp}=await import('/src/xp.js');BK.manualSimulation=true;
const out={fails:[]};const F=m=>out.fails.push(m);
const K=i=>'bracken.progress.'+i, ls=localStorage;
const press=(k,n=1)=>{for(let j=0;j<n;j++){BK.press(k);BK.sim(1);}};
ls.clear();
/* a three-slot-era save: hero, coins, xp, one cleared wood and a medal */
const old=(i,hero,coins,lv)=>({hero,heroes:{knight:true,[hero]:true},coins,xp:{[hero]:xpFloor(lv)},xpVersion:1,perHero:1,done:{[hero]:{wood:1}},wood:{cleared:true,medal:2}});
const saves=[old(0,'knight',111,3),old(1,'pyro',222,7),old(2,'paladin',333,12),null,null];
for(let i=0;i<3;i++)ls.setItem(K(i),JSON.stringify(saves[i]));
/* the FIRST load of an old save migrates it (a refund of old skills pays gold), so the baseline is what it is after that one load; every later load, write elsewhere and erase must leave that text byte-identical */
const base=[];for(let i=0;i<3;i++){BK.loadSlot(i);base.push({coins:BKT.PROG.coins,stored:JSON.parse(ls.getItem(K(i))).coins,text:ls.getItem(K(i))});}
const before=base.map(b=>b.text);
/* B. slots 4 and 5 are their own */
for(const i of [3,4]){BK.loadSlot(i);BKT.PROG.coins=900+i;BKT.PROG.hero='pirate';BKT.PROG.heroes.pirate=true;BKT.PROG.xp.pirate=xpFloor(5+i);ls.setItem(K(i),JSON.stringify(BKT.PROG));}
if(BK.slot!==4)F('loadSlot(4) did not take slot 4: '+BK.slot);
for(let i=0;i<5;i++){const p=BK.readSlot(i);if(!p)F('slot '+i+' reads empty');}
for(let i=0;i<5;i++){BK.loadSlot(i);const want=i<3?base[i].coins:900+i;if(BKT.PROG.coins!==want)F('slot '+i+' loaded coins '+BKT.PROG.coins+', wanted '+want);}
/* C. the old three are intact */
for(let i=0;i<3;i++){const p=BK.readSlot(i),o=saves[i];if(p.hero!==o.hero||p.coins!==base[i].stored||p.xp[o.hero]!==o.xp[o.hero]||!p.wood||p.wood.medal!==2)F('old slot '+i+' changed: '+JSON.stringify(p));}
BK.loadSlot(1);if(BKT.PROG.hero!=='pyro'||BKT.PROG.coins!==base[1].coins||BKT.heroLevel('pyro')!==7)F('old slot 1 did not load as it was: '+BKT.PROG.hero+' '+BKT.PROG.coins+' L'+BKT.heroLevel('pyro'));
BK.eraseSlot(3);if(BK.readSlot(3))F('slot 3 not erased');if(!BK.readSlot(4)||BK.readSlot(4).coins!==904)F('erasing slot 3 hurt slot 4');
for(let i=0;i<3;i++)if(ls.getItem(K(i))!==before[i])F('old slot '+i+' text changed in storage');
BK.eraseSlot(4);if(BK.readSlot(4))F('slot 4 not erased');
for(let i=0;i<3;i++)if(ls.getItem(K(i))!==before[i])F('old slot '+i+' text changed after the erases');
/* the legacy single save is slot 1 */
ls.clear();ls.setItem('bracken.progress',JSON.stringify(old(0,'knight',77,2)));
if(!BK.readSlot(0)||BK.readSlot(0).hero!=='knight')F('the legacy save no longer reads as slot 1');
for(let i=1;i<5;i++)if(BK.readSlot(i))F('the legacy save leaked into slot '+(i+1));
BK.loadSlot(0);if(BKT.PROG.hero!=='knight'||BKT.heroLevel('knight')!==2||!ls.getItem(K(0)))F('the legacy save did not load as slot 1');
/* D. the screen */
ls.clear();for(let i=0;i<5;i++)if(i!==3)ls.setItem(K(i),JSON.stringify(old(i,['knight','pyro','paladin','x','warden'][i],100+i,3+i)));
BK.state='slots';BK.ui.slotI=0;BK.step(2);
press('right',4);if(BK.ui.slotI!==4)F('RIGHT x4 from slot 1 is '+BK.ui.slotI);
press('right');if(BK.ui.slotI!==0)F('RIGHT from slot 5 did not wrap to 1');
press('left');if(BK.ui.slotI!==4)F('LEFT from slot 1 did not wrap to 5');
BK.ui.slotI=1;press('down');if(BK.ui.slotI!==2)F('DOWN from slot 2 is '+BK.ui.slotI+', wanted slot 3');
press('up');press('up');if(BK.ui.slotI!==0)F('UP twice from slot 3 is '+BK.ui.slotI+', wanted slot 1');press('up');if(BK.ui.slotI!==4)F('UP from slot 1 did not wrap to 5');
window.__textRec=[];BK.step(1);const rec=window.__textRec;window.__textRec=null;
const T=rec.filter(q=>q.kind==='text').map(q=>q.s);out.texts=T;
for(let i=1;i<=5;i++)if(!T.includes('SLOT '+i))F('no card for SLOT '+i);
for(const w of ['KNIGHT','PYROMANCER','PALADIN','WARDEN'])if(!T.includes(w))F('no hero name '+w+' on a card');
for(const lv of [3,4,5,7])if(!T.includes('LEVEL '+lv))F('no LEVEL '+lv+' on a card');
if(T.filter(s=>s==='empty').length!==1)F('the empty slot is not drawn once');
for(const q of rec.filter(q=>q.kind==='text'))if(q.x0<0||q.x0+q.w>BK.view.VW||q.y0<0||q.y0+q.h>BK.view.VH)F('off screen: '+q.s);
/* Z opens the picked one; X X erases only it */
BK.ui.slotI=4;press('confirm');if(BK.slot!==4||BKT.PROG.hero!=='warden')F('Z on slot 5 opened slot '+(BK.slot+1)+' as '+BKT.PROG.hero);
BK.state='slots';BK.ui.slotI=4;const keep=[0,1,2].map(i=>ls.getItem(K(i)));press('atk');press('atk');
if(BK.readSlot(4))F('X X did not erase slot 5');for(let i=0;i<3;i++)if(ls.getItem(K(i))!==keep[i])F('erasing slot 5 touched slot '+(i+1));
ls.clear();
return out;})()`, 60000);
  assert.deepEqual(r.fails, [], 'SAVE SLOTS: ' + r.fails.join(' | '));
  assert.deepEqual(pg.errors, []);
  console.log('SAVE SLOTS: five independent slots, the three old saves and the legacy save load unchanged, the five-row screen navigates and wraps, every card shows hero and level');
} finally { pg.close(); }
