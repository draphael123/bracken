/* tools/mini-names.mjs — EVERY MINI IS CALLED BY ITS OWN NAME (E7, 2026-09-24).
   The mini's letterbox card and its bar both ask miniName(), and miniName() asked the level and then a hand-kept table
   and then gave up with 'THE BEAST'. The Burial Caverns' mini was in neither, so he announced himself as THE BEAST -
   and "the beast should be renamed the graveyard keeper" is how Daniel reported it. The rule, not the row: every level
   that has a mini must name it, and the Grave Warden's name is THE GRAVEYARD KEEPER everywhere it is shown (the id stays
   'gravewarden', so saves, the bestiary's seen-list and every test keyed on it hold). */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const out=[];
    for(let i=0;i<LEVELS.length;i++){let L;try{L=LEVELS[i].build();}catch(e){continue;}if(!L||!L.mini)continue;
      BK.setHero('knight');BK.reset({fresh:true});BK.load(i);out.push({id:LEVELS[i].id,boss:BK.L.mini.boss,name:BK.textLab.miniName()});}
    const row=BK.textLab.beasts().find(b=>b.t==='gravewarden');
    return{out,beast:row&&row.name,title:BK.textLab.bossTitle({t:'gravewarden'})};})()`, 300000);
  const beasts = r.out.filter(m => m.name === 'THE BEAST');
  assert.deepEqual(beasts, [], 'a mini announced as THE BEAST: ' + JSON.stringify(beasts));
  const burial = r.out.find(m => m.id === 'burial');
  assert.ok(burial, 'the Burial Caverns have a mini');
  assert.equal(burial.boss, 'gravewarden', 'the id stays gravewarden so saves and tests hold');
  assert.equal(burial.name, 'THE GRAVEYARD KEEPER', 'his card and his bar');
  assert.equal(r.beast, 'THE GRAVEYARD KEEPER', 'his bestiary row');
  assert.equal(r.title, 'THE GRAVEYARD KEEPER', 'bossTitle (the rush and anything else that asks the bestiary)');
  assert.deepEqual(pg.errors, []);
  console.log('every mini has its own name (' + r.out.length + ' levels): ' + r.out.map(m => m.id + '=' + m.name).join(', '));
} finally { pg.close(); }
