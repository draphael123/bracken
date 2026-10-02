/* tools/store.mjs - ONE STORE (claude/onestore). Coins are spent in ONE store, reached from the menu, the map and the walk-in shop rooms.
 *
 * WHAT IT HOLDS (each of these fails on the old code, where there were three ways to spend coins):
 *   A. RULES (no page): src/store.js's tabs match main.js's STORE_TABS one for one, every entry names a real tab, the walk-in rooms
 *      are the three shop levels, TAB/Q step and wrap, a fight refuses the store, buying is for the map, a shop room or a lit shrine.
 *   B. NO DEAD PATHS: no storeMode / equipFrom / treeFrom / openEquip / learnTalent / state 'tree' left in main.js.
 *   C. EVERY ENTRY OPENS THE ONE STORE, by the real keys: the map's V and Q, Q in a wood, the pause menu's Store and Skills, the keeper's
 *      counter in each of the THREE shop rooms (each on its own start tab) - and the three rooms sell the same thing as the map does.
 *   D. A FIGHT REFUSES IT: a foe beside you, and the wood's Q / the pause menu's Store stay shut; away from a shrine a wood buys nothing.
 *   E. TABS: TAB / E next, Q before (wrapping), LEFT/RIGHT on every tab but SKILLS (where they switch ACTIVES/PASSIVES), ESC goes back
 *      to where it came from (map, menu, play).
 *   F. STOCK IS GATED BY PROGRESS, not by the room: a locked line opens exactly when its level is cleared; prices and gates are the
 *      golden table in tools/store-stock.json (the stock the three rooms and the equip board always had).
 *   G. OLD SAVES: two seeded saves (a batch50-era one and a version-0 one with bought skills and training) open the store with
 *      everything they owned and everything they could buy, through every entry.
 *   H. BUYING STILL WORKS (a skin, an edge, a tonic, an ability) and BROWSING COSTS NOTHING: the whole save and the slot's text are
 *      byte-identical after every entry, every tab and every row has been looked at.
 */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { openPage } from './cdp.mjs';
import * as S from '../src/store.js';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

/* ---------- A. the rules ---------- */
{
  const ids = [...main.matchAll(/\{ id: '([a-z]+)', name: '([A-Z]+)', items: [A-Za-z_\[\]]+, key: (?:'[a-z]+'|null), owned: '[a-z]+'/g)].map(m => m[1]);
  assert.deepEqual(ids, S.TAB_IDS, 'main.js STORE_TABS and src/store.js TABS disagree: ' + ids + ' vs ' + S.TAB_IDS);
  assert.deepEqual(S.TAB_IDS.slice(0, 5), ['heroes', 'skins', 'weapons', 'charms', 'skills'], "Daniel's five tabs come first, in order");
  for (const [k, e] of Object.entries(S.ENTRIES)) assert.ok(S.TAB_IDS.includes(e.tab), 'entry ' + k + ' opens a tab that does not exist: ' + e.tab);
  assert.deepEqual(Object.keys(S.SHOP_START).sort(), ['shop', 'shopCrag', 'shopSea', 'shopWell'], 'the walk-in rooms are the four shop levels (claude/welltown added THE WELL STORE)');
  for (const t of Object.values(S.SHOP_START)) assert.ok(S.TAB_IDS.includes(t));
  assert.equal(S.stepTab(0, -1), S.TAB_IDS.length - 1); assert.equal(S.stepTab(S.TAB_IDS.length - 1, 1), 0); assert.equal(S.stepTab(2, 1), 3);
  assert.equal(S.tabIndex('skills'), 4); assert.equal(S.tabIndex('nope'), 0);
  assert.equal(S.refusal({ fight: true }), 'NOT IN A FIGHT'); assert.equal(S.refusal({ fight: false }), null);
  assert.equal(S.mayBuy({ where: 'map' }), true); assert.equal(S.mayBuy({ where: 'shop' }), true);
  assert.equal(S.mayBuy({ where: 'wood', fight: false, atShrine: false }), false, 'a wood away from a shrine buys nothing');
  assert.equal(S.mayBuy({ where: 'wood', fight: false, atShrine: true }), true);
  assert.equal(S.mayBuy({ where: 'wood', fight: true, atShrine: true }), false);
  const feat = f => f === 'done';
  assert.equal(S.lockOf({ needs: 'spore', needsName: 'Sporewood' }, {}, feat), 'clear Sporewood first');
  assert.equal(S.lockOf({ needs: 'spore', needsName: 'Sporewood' }, { spore: { cleared: true } }, feat), null);
  assert.equal(S.lockOf({ feat: 'x', featName: 'finish it' }, {}, feat), 'finish it to earn it');
  assert.equal(S.lockOf({ feat: 'done', featName: 'finish it' }, {}, feat), null);
  assert.equal(S.lockOf({}, {}, feat), null);
}

/* ---------- B. no dead paths ---------- */
for (const dead of ['storeMode', 'equipFrom', 'treeFrom', 'openEquip', 'learnTalent', 'EQUIP_TABS', 'storeTabs()', "state = 'tree'", "state === 'tree'", "state === 'equip'"])
  assert.ok(!main.includes(dead), 'main.js still has the old path ' + dead);
for (const live of ["openStore('map', 'heroes')", "openStore('menu', 'skills')", "openStore('menu', 'heroes')", "openStore(state, 'skills')", "openStore('play', SHOP_START["])
  assert.ok(main.includes(live), 'main.js lost an entry: ' + live);

const GOLDEN = new URL('./store-stock.json', import.meta.url);   /* STORE_WRITE=1 rewrites it from the live store: only for a deliberate change of stock */

/* ---------- the page ---------- */
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const{xpFloor}=await import('/src/xp.js'),{LEVELS}=await import('/src/level.js'),S=await import('/src/store.js');BK.manualSimulation=true;
const out={fails:[]};const F=m=>out.fails.push(m);
const key=k=>{dispatchEvent(new KeyboardEvent('keydown',{key:k}));BK.sim(1);dispatchEvent(new KeyboardEvent('keyup',{key:k}));BK.sim(1);};
const fresh=(coins=400)=>{for(const k in BK.keys)BK.keys[k]=false;BK.setHero('knight');BK.reset({fresh:true});BKT.PROG.xp.knight=xpFloor(12);BKT.PROG.coins=coins;BK.applyUpgrades();};
const tabNow=()=>S.TAB_IDS[BK.ui.storeTab];
const rows=()=>JSON.stringify(BK.ui.storeRows());
const levelAt=id=>LEVELS.findIndex(l=>l.id===id);
const wood=()=>{fresh();BK.load(0);BK.state='play';BK.enemies().forEach(e=>e.alive=false);BK.sim(120);};
/* C. every entry opens the one store */
const reach={};
fresh();BK.load(0);BK.state='map';BK.step(5);key('v');reach.mapV=[BK.state,tabNow(),BK.ui.storeBack];const stock=rows();BK.press('pause');BK.sim(2);reach.mapVBack=BK.state;
BK.state='map';key('q');reach.mapQ=[BK.state,tabNow(),BK.ui.storeBack];BK.press('pause');BK.sim(2);
wood();key('q');reach.woodQ=[BK.state,tabNow(),BK.ui.storeBack];BK.press('pause');BK.sim(2);reach.woodQBack=BK.state;
wood();BK.ui.openMenu('play');BK.ui.menuI=BK.ui.menuRows().indexOf('Store');BK.step(2);BK.press('confirm');BK.sim(2);reach.pauseStore=[BK.state,tabNow(),BK.ui.storeBack];BK.press('pause');BK.sim(2);reach.pauseStoreBack=BK.state;
wood();BK.ui.openMenu('play');BK.ui.menuI=BK.ui.menuRows().indexOf('Skills');BK.step(2);BK.press('confirm');BK.sim(2);reach.pauseSkills=[BK.state,tabNow()];BK.press('pause');BK.sim(2);
reach.menuHasEquip=BK.ui.menuRows().includes('Equip');
reach.shops={};const shopRows={};
for(const id of ['shop','shopCrag','shopSea','shopWell']){fresh();BK.load(levelAt(id));BK.state='play';BK.sim(60);const kp=BK.props().find(p=>p.t==='npc'&&p.kind==='keeper');if(!kp){F(id+': no keeper');continue;}BK.P.x=kp.x;BK.P.y=kp.y;BK.sim(2);BK.press('talk');BK.sim(2);
 reach.shops[id]=[BK.state,tabNow(),BK.ui.storeBack];shopRows[id]=rows();BK.press('pause');BK.sim(2);reach.shops[id].push(BK.state);}
out.reach=reach;out.sameStock=Object.values(shopRows).every(v=>v===stock);out.tabIds=BK.ui.storeRows().map(t=>t.id);
/* D. a fight refuses the store */
{wood();const e=(()=>{fresh();BK.load(0);BK.state='play';BK.sim(60);return BK.enemies().find(q=>q.alive&&!q.harmless);})();
 if(!e)F('D: no foe to stand beside');else{BK.P.x=e.x;BK.P.y=e.y;BK.sim(1);key('q');out.fightQ=BK.state;
  BK.ui.openMenu('play');BK.ui.menuI=BK.ui.menuRows().indexOf('Store');BK.step(2);BK.press('confirm');BK.sim(2);out.fightMenu=[BK.state,BK.ui.menuRows().length>0];
  BK.ui.openMenu('play');BK.ui.menuI=BK.ui.menuRows().indexOf('Skills');BK.step(2);BK.press('confirm');BK.sim(2);out.fightSkills=BK.state;BK.press('pause');BK.sim(2);
  BK.enemies().forEach(q=>q.alive=false);BK.state='play';BK.sim(2);key('q');out.afterFight=BK.state;BK.press('pause');BK.sim(2);}}
/* a wood away from a shrine: the store opens, equipping works, buying does not */
{wood();BK.ui.openMenu('play');BK.ui.menuI=BK.ui.menuRows().indexOf('Store');BK.step(2);BK.press('confirm');BK.sim(2);BK.ui.storeTab=S.tabIndex('skins');BK.ui.storeI=1;const c0=BKT.PROG.coins,sk0=JSON.stringify(BKT.PROG.skins);BK.step(2);BK.press('confirm');BK.sim(1);
 out.woodBuy={coins:BKT.PROG.coins===c0,skins:JSON.stringify(BKT.PROG.skins)===sk0,safe:BKT.loadoutSafe()};
 BK.ui.storeI=0;BK.step(2);BK.press('confirm');BK.sim(1);out.woodEquip=BKT.PROG.skin;BK.press('pause');BK.sim(2);}
/* E. tabs */
{fresh();BK.load(0);BK.state='map';key('v');const n=S.TAB_IDS.length,seen=[tabNow()];for(let i=0;i<n;i++){key('Tab');seen.push(tabNow());}
 out.tabCycle=seen;key('q');const back1=tabNow();key('e');const fwd1=tabNow();out.qE=[back1,fwd1];
 BK.ui.storeTab=0;key('q');out.qWrap=tabNow();BK.ui.storeTab=0;key('ArrowRight');out.right=tabNow();key('ArrowLeft');out.left=tabNow();
 BK.ui.storeTab=BK.ui.skillsTab;BK.ui.treeTab=0;key('ArrowRight');out.skillsRight=[tabNow(),BK.ui.treeTab];key('ArrowLeft');out.skillsLeft=[tabNow(),BK.ui.treeTab];
 BK.press('pause');BK.sim(2);out.escMap=BK.state;}
/* F. stock by progress: a line opens exactly when its level is cleared */
{fresh();BK.load(0);const gate=[];const st=BK.ui.storeRows();BK.state='map';
 for(const t of st)for(const k of t.rows)if(k.needs)gate.push({tab:t.id,id:k.id,needs:k.needs,was:k.state});
 for(const g of gate){BKT.PROG[g.needs]=BKT.PROG[g.needs]||{};BKT.PROG[g.needs].cleared=true;}
 const after=BK.ui.storeRows();for(const g of gate){g.now=after.find(t=>t.id===g.tab).rows.find(k=>k.id===g.id).state;}
 out.gate=gate;out.stock=st.map(t=>({id:t.id,rows:t.rows.map(k=>({id:k.id,price:k.price,silver:k.silver,needs:k.needs,feat:k.feat}))}));}
return out;})()`);
  assert.deepEqual(r.fails, [], r.fails.join('; '));
  /* C */
  assert.deepEqual(r.reach.mapV, ['store', 'heroes', 'map'], 'V on the map did not open the store: ' + r.reach.mapV);
  assert.equal(r.reach.mapVBack, 'map', 'ESC from the store did not go back to the map');
  assert.deepEqual(r.reach.mapQ, ['store', 'skills', 'map'], 'Q on the map did not open the store on SKILLS: ' + r.reach.mapQ);
  assert.deepEqual(r.reach.woodQ, ['store', 'skills', 'play'], 'Q in a wood did not open the store on SKILLS: ' + r.reach.woodQ);
  assert.equal(r.reach.woodQBack, 'play', 'ESC from the store did not go back to the wood');
  assert.deepEqual(r.reach.pauseStore, ['store', 'heroes', 'menu'], 'the pause menu Store did not open the store: ' + r.reach.pauseStore);
  assert.equal(r.reach.pauseStoreBack, 'menu', 'ESC from the store did not go back to the pause menu');
  assert.deepEqual(r.reach.pauseSkills, ['store', 'skills'], 'the pause menu Skills did not open the store on SKILLS');
  assert.equal(r.reach.menuHasEquip, false, "the pause menu still has an Equip entry: it is the Store now");
  for (const [id, tab] of Object.entries(S.SHOP_START)) assert.deepEqual(r.reach.shops[id], ['store', tab, 'play', 'play'], 'the keeper of ' + id + ' did not open the store on ' + tab + ': ' + r.reach.shops[id]);
  assert.ok(r.sameStock, 'a walk-in room sells something the map store does not (or the other way about)');
  assert.deepEqual(r.tabIds, S.TAB_IDS);
  /* D */
  assert.equal(r.fightQ, 'play', 'Q opened the store with a foe beside you');
  assert.equal(r.fightMenu[0], 'menu', 'the pause menu Store opened with a foe beside you');
  assert.equal(r.fightSkills, 'menu', 'the pause menu Skills opened with a foe beside you');
  assert.equal(r.afterFight, 'store', 'the store stayed shut after the fight was over');
  assert.ok(r.woodBuy.coins && r.woodBuy.skins, 'a wood away from a shrine SOLD something: ' + JSON.stringify(r.woodBuy));
  assert.equal(r.woodBuy.safe, false);
  assert.equal(r.woodEquip, 'bracken', 'equipping an owned line failed in the wood');
  /* E */
  assert.deepEqual(r.tabCycle, [...S.TAB_IDS.slice(0, 1), ...S.TAB_IDS.slice(1), S.TAB_IDS[0]].slice(0, S.TAB_IDS.length + 1), 'TAB did not walk the tabs and wrap: ' + r.tabCycle);
  assert.deepEqual(r.qE, [S.TAB_IDS[S.TAB_IDS.length - 1], S.TAB_IDS[0]], 'Q is the tab before and E the next: ' + r.qE);
  assert.equal(r.qWrap, S.TAB_IDS[S.TAB_IDS.length - 1], 'Q did not wrap');
  assert.equal(r.right, 'skins'); assert.equal(r.left, 'heroes');
  assert.deepEqual(r.skillsRight, ['skills', 1], 'RIGHT on SKILLS must switch to PASSIVES and stay on the tab: ' + r.skillsRight);
  assert.deepEqual(r.skillsLeft, ['skills', 0]);
  assert.equal(r.escMap, 'map');
  /* F */
  assert.ok(r.gate.length >= 4, 'only ' + r.gate.length + ' level-gated lines found: the scan guards nothing');
  for (const g of r.gate) { assert.equal(g.was, 'locked', g.tab + '/' + g.id + ' is open before ' + g.needs + ' is cleared'); assert.notEqual(g.now, 'locked', g.tab + '/' + g.id + ' stays locked after ' + g.needs + ' is cleared'); }
  if (process.env.STORE_WRITE || !existsSync(GOLDEN)) writeFileSync(GOLDEN, JSON.stringify(r.stock, null, 1) + '\n');
  assert.deepEqual(r.stock, JSON.parse(readFileSync(GOLDEN, 'utf8')), 'the stock changed: a price or a gate is not what the three old stores had (tools/store-stock.json)');
} finally { pg.close(); }

/* ---------- G + H. old saves, buying, browsing ---------- */
const pg2 = await openPage({ audio: false, fonts: false });
try {
  /* a save written by the batch50 code (progression version 2) - written out by hand, NOT by this code */
  const batch50 = { progressionVersion: 2, xpVersion: 1, perHero: 1, medalPurseGranted: true, skillRefund: true, coins: 600, hero: 'knight', heroes: { knight: true, pyro: true },
    skins: { bracken: true, black: true, dawn: true }, skin: 'black', swords: { steel: true, ember: true }, sword: 'ember', items: { heart: true, edge: true }, tonics: 2,
    charms: { lucky: true }, charm: 'lucky', charmOf: { knight: 'lucky' }, music: { select: true, town: true }, menu: 'select',
    scree: { cleared: true }, spore: { cleared: true }, done: { knight: { scree: 1, spore: 1 } }, xp: { knight: 2400, pyro: 300 },
    skillOwned: { knight: { shieldThrow: true } }, loadouts: { knight: ['shieldThrow'] }, silverSpent: 0 };
  /* a version-0 save: skills bought as items, training ranks, talents, none of the later fields */
  const ancient = { coins: 90, hero: 'knight', heroes: { knight: true }, skins: { bracken: true, blue: true }, skin: 'blue', swords: { steel: true, thorn: true }, sword: 'thorn',
    items: { heart: true, wind: true, shieldThrow: true }, ranks: { vigour: 2 }, charms: { feather: true }, charm: 'feather', music: { select: true }, scree: { cleared: true }, reef: { cleared: true } };
  const res = await pg2.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js'),S=await import('/src/store.js');BK.manualSimulation=true;const out={fails:[],saves:{}};
const key=k=>{dispatchEvent(new KeyboardEvent('keydown',{key:k}));BK.sim(1);dispatchEvent(new KeyboardEvent('keyup',{key:k}));BK.sim(1);};
const levelAt=id=>LEVELS.findIndex(l=>l.id===id);
const SEEDS=${JSON.stringify({ batch50, ancient })};
const OWN={heroes:'hero',skins:'skin',swords:'sword',charms:'charm',music:'menu'};
for(const [name,old] of Object.entries(SEEDS)){
 localStorage.clear();localStorage.setItem('bracken.progress.0',JSON.stringify(old));BK.loadSlot(0);BK.applyUpgrades();const P=BKT.PROG;
 const rec={name,coinsBefore:old.coins,coinsAfter:P.coins,entries:{},problems:[]};
 const open=(how)=>{BK.state='map';BK.load(0);
  if(how==='map')BK.ui.storeOpen('map','heroes');else if(how==='skills')BK.ui.storeOpen('map','skills');else if(how==='pause'){BK.state='play';BK.enemies().forEach(e=>e.alive=false);BK.ui.storeOpen('menu','heroes');}
  else{BK.load(levelAt(how));BK.state='play';BK.sim(60);const kp=BK.props().find(p=>p.t==='npc'&&p.kind==='keeper');BK.P.x=kp.x;BK.P.y=kp.y;BK.sim(2);BK.press('talk');BK.sim(2);}
  return BK.state==='store';};
 for(const how of ['map','skills','pause','shop','shopCrag','shopSea','shopWell']){
  if(!open(how)){rec.problems.push(how+': did not open');continue;}
  const R=BK.ui.storeRows();rec.entries[how]=JSON.stringify(R);
  /* EVERYTHING IT OWNED is owned, and what it wore is worn; EVERYTHING IT COULD BUY is buyable; what was locked is locked */
  for(const t of R){const tabName=t.id==='skills'?null:t.id;if(!tabName)continue;const ownedKey={heroes:'heroes',skins:'skins',weapons:'swords',charms:'charms',smith:'items',music:'music',practice:null}[t.id];
   for(const k of t.rows){const had=ownedKey&&old[ownedKey]&&old[ownedKey][k.id];const wearKey={heroes:'hero',skins:'skin',weapons:'sword',charms:'charm',music:'menu'}[t.id];
    if(k.id==='none'||(t.id==='smith'&&k.id==='tonic')||t.id==='practice')continue;
    if(had&&!(k.state==='owned'||k.state==='equipped'))rec.problems.push(how+': '+t.id+'/'+k.id+' was owned, shows '+k.state);
    if(had&&wearKey&&old[wearKey]===k.id&&k.state!=='equipped')rec.problems.push(how+': '+t.id+'/'+k.id+' was worn, shows '+k.state);
    if(!had&&(k.state==='owned'||k.state==='equipped')&&!(t.id==='skins'&&k.id==='bracken')&&!(t.id==='weapons'&&k.id==='steel')&&!(t.id==='music'&&k.id==='select')&&!(t.id==='heroes'&&k.id==='knight'))rec.problems.push(how+': '+t.id+'/'+k.id+' shows '+k.state+' but the save never owned it');
    if(!had&&k.needs&&!(old[k.needs]&&old[k.needs].cleared)&&k.state!=='locked')rec.problems.push(how+': '+t.id+'/'+k.id+' is open but '+k.needs+' was never cleared');
    if(!had&&k.needs&&(old[k.needs]&&old[k.needs].cleared)&&!k.feat&&k.state!=='buy')rec.problems.push(how+': '+t.id+'/'+k.id+' should be buyable: '+k.needs+' is cleared');
    if(!had&&!k.needs&&!k.feat&&k.state!=='buy'&&k.state!=='enter')rec.problems.push(how+': '+t.id+'/'+k.id+' could be bought, shows '+k.state);}}
  BK.press('pause');BK.sim(2);}
 const vals=Object.values(rec.entries);rec.sameEverywhere=vals.every(v=>v===vals[0]);
 rec.tonics=P.tonics;rec.kept={skillOwned:JSON.stringify(P.skillOwned.knight||{}),loadout:JSON.stringify(P.loadouts.knight||[])};
 /* BROWSING COSTS NOTHING: every entry, every tab, every row, then compare the slot's text and the whole save with before */
 BK.state='map';BK.load(0);BK.ui.storeOpen('map','heroes');BK.step(3);BK.press('pause');BK.sim(2);
 const snap=()=>JSON.stringify({ls:Object.fromEntries(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)])),prog:BKT.PROG});const before=snap();
 for(const how of ['map','skills','pause']){open(how);for(let t=0;t<BK.ui.tabs();t++){BK.ui.storeTab=t;const n=Math.max(1,t===BK.ui.skillsTab?BKT.treeNodes().length:BK.ui.items());for(let i=0;i<n;i++){if(t===BK.ui.skillsTab)BK.ui.treeI=i;else BK.ui.storeI=i;BK.step(6);}}BK.press('pause');BK.sim(2);}
 rec.pure=snap()===before;out.saves[name]=rec;}
/* H. buying still works, from the map */
localStorage.clear();localStorage.setItem('bracken.progress.0',JSON.stringify(SEEDS.batch50));BK.loadSlot(0);BK.applyUpgrades();BK.state='map';BK.load(0);
{const P=BKT.PROG,buy=(tab,id)=>{BK.ui.storeOpen('map',tab);const t=BK.ui.storeRows().find(q=>q.id===tab);BK.ui.storeI=t.rows.findIndex(k=>k.id===id);BK.step(2);const c=P.coins;BK.press('confirm');BK.sim(1);BK.press('pause');BK.sim(2);return c-P.coins;};
 out.buy={skin:buy('skins','purple'),edge:buy('smith','edge2'),tonic:buy('smith','tonic'),weapon:buy('weapons','ember'),own:{purple:!!P.skins.purple,edge2:!!P.items.edge2,ember:!!P.swords.ember,tonics:P.tonics,skin:P.skin},
  locked:buy('smith','mail'),mail:!!P.items.mail};
 BK.ui.storeOpen('map','skills');BK.ui.treeTab=0;const ns0=BKT.treeNodes(),ix=ns0.findIndex(n=>n.active&&!(P.skillOwned.knight||{})[n.id]&&n.level<=BKT.heroLevel()&&n.price<=P.coins);BK.ui.treeI=ix;const n0=ns0[ix],c0=P.coins;BK.step(2);BK.press('confirm');BK.sim(1);out.buy.skill=[c0-P.coins===n0.price,!!P.skillOwned.knight[n0.id]];}
out.errors=[];return out;})()`);
  assert.deepEqual(res.fails, []);
  for (const [name, rec] of Object.entries(res.saves)) {
    assert.deepEqual(rec.problems, [], name + ': ' + rec.problems.join('; '));
    assert.ok(rec.sameEverywhere, name + ': the six doors did not show the same store');
    assert.ok(rec.coinsAfter >= rec.coinsBefore, name + ': the store opened with fewer coins than the save held (' + rec.coinsBefore + ' -> ' + rec.coinsAfter + ')');
    assert.ok(rec.pure, name + ': BROWSING changed the save or the slot text');
  }
  assert.equal(res.saves.batch50.tonics, 2, 'the tonics an old save carried are gone');
  assert.equal(res.saves.batch50.kept.skillOwned, '{"shieldThrow":true}', 'an owned ability was lost');
  assert.equal(res.saves.batch50.kept.loadout, '["shieldThrow"]', 'the loadout was lost');
  assert.equal(res.saves.ancient.kept.skillOwned.includes('shieldThrow'), true, 'the ancient save\'s bought skill was not carried into the skills tab');
  assert.ok(res.buy.skin > 0 && res.buy.own.purple && res.buy.own.skin === 'purple', 'buying a skin from the map store broke: ' + JSON.stringify(res.buy));
  assert.ok(res.buy.edge > 0 && res.buy.own.edge2, 'buying the smith\'s razor edge broke (spore is cleared in this save)');
  assert.ok(res.buy.tonic > 0 && res.buy.own.tonics === 3, 'buying a tonic broke');
  assert.equal(res.buy.locked, 0, 'a locked line (ringmail: Kingswood not cleared) sold');
  assert.equal(res.buy.mail, false);
  assert.deepEqual(res.buy.skill, [true, true], 'buying an ability in the SKILLS tab broke');
  assert.deepEqual(pg2.errors, []);
  console.log('ONE STORE: rules, six doors (map V/Q, wood Q, pause Store/Skills, four keepers) open the one store, fights refuse it, TAB/E/Q tabs, stock gated by progress (golden table), two old saves open intact, buying works, browsing is free.');
} finally { pg2.close(); }
