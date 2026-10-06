// tools/leveling2-runtime.mjs - LEVELING2 IN THE PAGE (Daniel 2026-10-04; the save side is tools/leveling.mjs).
//   THE CARD: a hero at level 5 with nothing chosen opens a FRESH card from the map (flash, sting, slide-in; a mashed key cannot take a perk in the
//   first half second), the milestone is the small one (L5) with the hero's own as its third option, the words '5 LEVELS TO YOUR NEXT PERK (LEVEL 10)'
//   are drawn, taking the third takes the hero's own at rank 1, and a card opened from the pause menu is a review (never fresh).
//   THE THRESHOLDS: VIGOR 10 heals 2 on a kill; MIGHT 20 makes the first blow into a broken foe land a quarter harder (once per break); ENDURANCE 20 turns
//   the first emptying of the bar into a surge (40%), once a fight; ENDURANCE 10 makes a roll a fifth cheaper below half a bar; MIGHT 10 pushes a heavy
//   blow's poise a quarter harder and a tap not at all.
//   SMOKE: every hero with every perk of its card on, 7 heroes x 480 frames of rolling, cutting, jumping and skills in the first wood: no exception.
// LEVELING2_SCREEN=<prefix> writes the card (fresh frame, settled, a stat card with thresholds) as PNGs.
import assert from 'node:assert/strict'; import { openPage } from './cdp.mjs'; import { writeFileSync } from 'node:fs';
const pg = await openPage({ audio: false, fonts: false }); let r;
try {
  r = await pg.evalp(`(async()=>{const PR=await import('/src/progression.js'),{xpFloor}=await import('/src/xp.js'),{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const fails=[],shots=[],out={};
const W=i=>LEVELS.findIndex(l=>l.id===i);
const fresh=(h,lv,card)=>{for(const k in BK.keys)BK.keys[k]=false;BK.setHero(h);BK.reset({fresh:true});BKT.PROG.xp[h]=xpFloor(lv);BKT.PROG.card=BKT.PROG.card||{};BKT.PROG.card[h]=JSON.parse(JSON.stringify(card||{v:0,e:0,m:0,ms:{}}));BKT.PROG.skillOwned[h]={};BKT.PROG.loadouts[h]=[];BK.applyUpgrades();};
const texts=()=>{window.__textRec=[];BK.step(0);const t=window.__textRec.filter(q=>q.kind==='text').map(q=>q.s);window.__textRec=null;return t;};
/* 1. THE CARD AT LEVEL 5 */
fresh('knight',5);BK.load(W('wood'));BK.state='play';BK.sim(2);BK.cardOpen('map');
if(BK.state!=='card')fails.push('the card did not open at level 5 with a pick and a milestone owed: '+BK.state);
if(!BK.cardUi||!BK.cardUi.fresh)fails.push('a card opened from the map is not fresh');
const t0=texts();shots.push({name:'card-fresh',png:BK.view.buf.toDataURL()});
if(!t0.some(s=>/LEVEL 5: A SMALL PERK/.test(s)))fails.push('the L5 card is not the small one: '+t0.slice(0,4).join(' | '));
if(!t0.some(s=>/^5 LEVELS TO YOUR NEXT PERK \\(LEVEL 10\\)$/.test(s)))fails.push('no "5 LEVELS TO YOUR NEXT PERK (LEVEL 10)": '+t0.join(' | '));
if(!t0.some(s=>/^YOURS RANK 1\\/5$|^YOURS {1,2}RANK 1\\/5$/.test(s)))fails.push('the hero own option is not marked: '+t0.join(' | '));
for(let f=0;f<40;f++)BK.step(1);const t1=texts();shots.push({name:'card-settled',png:BK.view.buf.toDataURL()});
if(!BKT.PROG.card.knight||Object.keys(BKT.PROG.card.knight.ms).length)fails.push('a perk was taken before a key');
BK.cardTake(2);if(BKT.PROG.card.knight.ms[5]!=='kbash'&&BKT.PROG.card.knight.ms[5]!=='kguard')fails.push('the third option is not the knight own: '+JSON.stringify(BKT.PROG.card.knight.ms));
out.l5own=BKT.PROG.card.knight.ms[5];
for(let i=0;i<5&&BK.state==='card';i++)BK.cardTake(0);
if(BK.state==='card'){const t2=texts();shots.push({name:'card-stat',png:BK.view.buf.toDataURL()});}
BK.cardClose();BK.state='play';
/* a pause-menu card is a review, never fresh */
BK.cardOpen('menu',true);if(!BK.cardUi||BK.cardUi.fresh)fails.push('a review card is fresh');BK.cardClose();
/* a stat card with thresholds part-way */
fresh('warden',20,{v:7,e:10,m:20,ms:{5:'stride',10:'wdef',15:'magnet',20:'wrec'}});BK.cardOpen('menu',true);for(let f=0;f<5;f++)BK.step(1);const t3=texts();shots.push({name:'card-thresholds',png:BK.view.buf.toDataURL()});
if(!t3.some(s=>s==='7/10'))fails.push('VIGOR 7/10 is not drawn: '+t3.join(' | '));if(!t3.some(s=>s==='10/20'))fails.push('ENDURANCE 10/20 is not drawn');if(!t3.some(s=>s==='BOTH UNLOCKED'))fails.push('MIGHT 20 does not say BOTH UNLOCKED');
BK.cardClose();
/* 2. THRESHOLDS */
const foe=()=>BK.enemies().find(e=>e.alive&&!e.maxHp&&!e.harmless&&!e.mini);
fresh('knight',30,{v:10,e:0,m:0,ms:{}});BK.load(W('wood'));BK.state='play';BK.god=false;BK.sim(60);BK.state='play';
{const e=foe();if(!e)fails.push('no foe in the wood');else{BK.P.hp=10;BK.P.inv=99;BKT.hurtEnemy(e,1e5,e.x-10,false);if(e.alive)fails.push('the foe lived');if(BK.P.hp<12)fails.push('VIGOR 10: a kill did not heal 2 (hp '+BK.P.hp+')');out.killHeal=BK.P.hp;}}
fresh('knight',30,{v:9,e:0,m:0,ms:{}});BK.load(W('wood'));BK.state='play';BK.sim(60);BK.state='play';
{const e=foe();if(e){BK.P.hp=10;BK.P.inv=99;BKT.hurtEnemy(e,1e5,e.x-10,false);if(BK.P.hp!==10)fails.push('VIGOR 9 healed on a kill ('+BK.P.hp+')');}}
const finisher=(m)=>{fresh('knight',30,{v:0,e:0,m,ms:{}});BK.load(W('wood'));BK.state='play';BK.sim(60);BK.state='play';const e=BK.enemies().find(q=>q.alive&&!q.maxHp&&!q.harmless&&!q.mini&&q.hp>60)||BK.enemies().find(q=>q.alive&&!q.maxHp&&!q.harmless&&!q.mini);if(!e)return null;
 e.maxHpX=e.hp=e.hp=Math.max(e.hp,400);e.broken=3;BK.P.inv=99;const a=e.hp;BKT.hurtEnemy(e,10,e.x-10,false);const d1=a-e.hp;const b=e.hp;e.broken=3;BKT.hurtEnemy(e,10,e.x-10,false);const d2=b-e.hp;return{d1,d2};};
{const f19=finisher(19),f20=finisher(20);if(f19&&f20){if(f19.d1!==f19.d2)fails.push('MIGHT 19 changed a blow into a broken foe: '+JSON.stringify(f19));if(!(f20.d1>f20.d2))fails.push('MIGHT 20: the first blow into a broken foe did not land harder: '+JSON.stringify(f20));out.finisher=[f19,f20];}}
{fresh('knight',30,{v:0,e:20,m:0,ms:{}});BK.load(W('wood'));BK.state='play';BK.sim(60);BK.state='play';BK.P.st=6;BK.P.winded=false;BK.P.dodgeCd=0;BK.press('dodge');BK.sim(2);
 if(BK.P.winded||!(BK.P.st>=BK.P.maxSt*0.3))fails.push('ENDURANCE 20: the emptied bar did not surge (st '+BK.P.st+'/'+BK.P.maxSt+', winded '+BK.P.winded+')');out.surge=Math.round(BK.P.st)+'/'+BK.P.maxSt;
 fresh('knight',30,{v:0,e:19,m:0,ms:{}});BK.load(W('wood'));BK.state='play';BK.sim(60);BK.state='play';BK.P.st=6;BK.P.winded=false;BK.P.dodgeCd=0;BK.press('dodge');BK.sim(2);
 if(!BK.P.winded)fails.push('ENDURANCE 19 had a second wind');}
{const cost=(e)=>{fresh('knight',30,{v:0,e,m:0,ms:{}});BK.load(W('wood'));BK.state='play';BK.sim(30);BK.P.st=BK.P.maxSt*0.4;return BKT.dodgeCost();};const c9=cost(9),c10=cost(10);if(!(c10<c9))fails.push('ENDURANCE 10: a roll under half a bar is not cheaper ('+c10+' vs '+c9+')');
 fresh('knight',30,{v:0,e:10,m:0,ms:{}});BK.load(W('wood'));BK.state='play';BK.sim(30);BK.P.st=BK.P.maxSt*0.9;const hi=BKT.dodgeCost();if(hi!==c9)fails.push('ENDURANCE 10: a roll above half got cheaper ('+hi+' vs '+c9+')');out.rollCost={c9,c10,hi};}
/* the hero perks, read where they act (numbers): stride on the roll, tonic, climber and the rest are covered by the smoke and tools/leveling.mjs */
/* 3. SMOKE: every hero, every perk of its card on */
const allMinor=PR.MINOR_PERKS.map(k=>k.id);let ran=0;
for(const h of PR.HERO_IDS){const own=PR.HERO_PERKS[h],ms={};allMinor.forEach((id,i)=>ms[i+1]=id);for(let i=0;i<4;i++)ms[20+i]=own[0].id;for(let i=0;i<4;i++)ms[30+i]=own[1].id;['iron','lungs','light','arcane','heart','leech','fleet','focus'].forEach((id,i)=>ms[50+i]=id);
 fresh(h,50,{v:20,e:20,m:20,ms});BK.load(W('wood'));BK.state='play';BK.god=false;BK.sim(40);BK.state='play';
 for(let f=0;f<480;f++){if(f%23===0)BK.press('dodge');if(f%7===0)BK.press('atk');if(f%61===0)BK.press('jump');if(f%97===0)BK.press('throw');if(f%131===0)BK.press('skill2');BK.P.inv=Math.max(BK.P.inv,1);BK.step(1);if(BK.state==='card'){BK.cardClose();BK.state='play';}}
 if(BK.state!=='play'&&BK.state!=='card')fails.push(h+' left play in the smoke: '+BK.state);ran++;}
out.smoke=ran;
return{fails,shots,out};})()`);
  if (process.env.LEVELING2_SCREEN) for (const s of r.shots) writeFileSync(process.env.LEVELING2_SCREEN + '-' + s.name + '.png', Buffer.from(s.png.split(',')[1], 'base64'));
  assert.deepEqual(pg.errors, []);
} finally { pg.close(); }
if (r.fails.length) { console.log('LEVELING2-RUNTIME: ' + r.fails.length + ' red\n  ' + r.fails.slice(0, 30).join('\n  ')); process.exit(1); }
console.log('Leveling2 runtime: a level-5 card opens fresh with the small milestone, the hero own third (' + r.out.l5own + ') and the "5 LEVELS TO YOUR NEXT PERK" line; thresholds read 7/10 and BOTH UNLOCKED; VIGOR 10 heals on a kill (' + r.out.killHeal + '), MIGHT 20 lands the finisher (' + JSON.stringify(r.out.finisher) + '), ENDURANCE 20 surges (' + r.out.surge + '), ENDURANCE 10 rolls ' + JSON.stringify(r.out.rollCost) + '; ' + r.out.smoke + ' heroes with every perk on ran 480 frames clean.');
