// tools/levelling-runtime.mjs — THE LEVELLING SYSTEM, IN THE PAGE (the save side is tools/levelling.mjs).
//   PASSIVES: every passive of every hero reads ON through the game's own tal() at its level with nothing owned and nothing in a
//   slot, and OFF a level below; the hero menu's PASSIVES tab is the ladder (lit ON, dim LV n), and Z and F on it neither buy nor slot.
// LEVELLING_SCREEN=<prefix> writes the ladder as a PNG.
import assert from 'node:assert/strict'; import { openPage } from './cdp.mjs'; import { writeFileSync } from 'node:fs';
const pg = await openPage({ audio: false, fonts: false }); let r;
try {
  r = await pg.evalp(`(async()=>{const PR=await import('/src/progression.js'),{xpFloor}=await import('/src/xp.js');BK.manualSimulation=true;const fails=[],shots=[],out={};
const fresh=(h,lv)=>{for(const k in BK.keys)BK.keys[k]=false;BK.setHero(h);BK.reset({fresh:true});BKT.PROG.xp[h]=xpFloor(lv);BKT.PROG.skillOwned[h]={};BKT.PROG.loadouts[h]=[];BK.applyUpgrades();};
/* 1. tal(): on from its level, unowned and unslotted; off a level below */
let n1=0;for(const h of PR.HERO_IDS){const ladder=PR.skillsFor(h).filter(n=>!n.active);
 for(const lv of [...new Set(ladder.map(n=>n.level))]){fresh(h,lv);for(const n of ladder){const want=n.level<=lv?1:0;if(BKT.tal(n.id)!==want)fails.push(h+'/'+n.id+' at level '+lv+' reads '+BKT.tal(n.id)+', not '+want);n1++;}
  fresh(h,lv-1);for(const n of ladder.filter(n=>n.level===lv))if(BKT.tal(n.id)!==0)fails.push(h+'/'+n.id+' is on at level '+(lv-1));}}
out.talReads=n1;
/* 2. the hero menu: the PASSIVES tab is the ladder, and it neither sells nor slots */
fresh('knight',6);BKT.PROG.coins=5000;BK.load(0);BK.state='map';dispatchEvent(new KeyboardEvent('keydown',{key:'q'}));BK.sim(1);dispatchEvent(new KeyboardEvent('keyup',{key:'q'}));
if(BK.state!=='tree')fails.push('Q did not open the hero menu from the map');
BK.ui.treeTab=1;const ns=BKT.treeNodes();if(!ns.length||ns.some(n=>n.active))fails.push('the PASSIVES tab lists an ability');
for(let i=1;i<ns.length;i++)if(ns[i].level<ns[i-1].level)fails.push('the ladder is not in level order at '+ns[i].id);
const before=JSON.stringify([BKT.PROG.coins,BKT.PROG.skillOwned,BKT.PROG.loadouts]);
for(let i=0;i<ns.length;i++){BK.ui.treeI=i;BK.press('confirm');BK.sim(1);BK.press('throw');BK.sim(1);BK.press('skill2');BK.sim(1);}
if(JSON.stringify([BKT.PROG.coins,BKT.PROG.skillOwned,BKT.PROG.loadouts])!==before)fails.push('Z or F on a passive bought or slotted it: '+JSON.stringify([BKT.PROG.coins,BKT.PROG.skillOwned,BKT.PROG.loadouts]));
BK.ui.treeTab=1;BK.ui.treeI=0;window.__textRec=[];BK.step(0);const rec=window.__textRec.filter(t=>t.kind==='text');window.__textRec=null;
const onRows=rec.filter(t=>t.s==='ON').length,lvRows=rec.filter(t=>/^LV \\d+$/.test(t.s)).length,first=ns.slice(0,6);
const wantOn=first.filter(n=>n.level<=6).length;if(onRows!==wantOn||lvRows!==first.length-wantOn)fails.push('ladder page 1 shows '+onRows+' ON and '+lvRows+' LV n; the knight at 6 has '+wantOn+' of '+first.length+' on');
shots.push({name:'passive-ladder-p1',png:BK.view.buf.toDataURL()});BK.ui.treeI=6;BK.step(0);shots.push({name:'passive-ladder-p2',png:BK.view.buf.toDataURL()});
out.ladder=ns.map(n=>n.level+':'+n.name);
return{fails,shots,out};})()`);
  if (process.env.LEVELLING_SCREEN) for (const s of r.shots) writeFileSync(process.env.LEVELLING_SCREEN + '-' + s.name + '.png', Buffer.from(s.png.split(',')[1], 'base64'));
  assert.deepEqual(pg.errors, []);
} finally { pg.close(); }
if (r.fails.length) { console.log('LEVELLING-RUNTIME: ' + r.fails.length + ' red\n  ' + r.fails.slice(0, 30).join('\n  ')); process.exit(1); }
console.log('Levelling runtime: ' + r.out.talReads + ' passive reads through tal() on from their level with nothing owned or slotted; the PASSIVES tab is a ' + r.out.ladder.length + '-step ladder that neither sells nor slots.');
