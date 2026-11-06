// tools/shrinekey.mjs - claude/shrinekey (Daniel 11-06): R no longer sends the hero back to the shrine. The pause menu's 'Back to shrine'
// asks YES / NO (opens on NO), and is greyed 'no shrine here' in the tutorial and the Arena Yard. Needs a headless browser (RAM >= 1500 MB free).
import assert from 'node:assert/strict';
import { LEVELS } from '../src/level.js';
import { openPage } from './cdp.mjs';
import { readFileSync } from 'node:fs';
const m = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
assert.ok(!/isKey\(e, \['r', 'R'\]\)/.test(m), 'main.js still binds R');
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const out={};
const W=id=>LEVELS.findIndex(l=>l.id===id);
const key=(k)=>{dispatchEvent(new KeyboardEvent('keydown',{key:k,code:k}));BK.step(1);dispatchEvent(new KeyboardEvent('keyup',{key:k,code:k}));};
const go=id=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(W(id));BK.start();BK.god=false;BK.enemies().forEach(e=>{e.alive=false;});BK.sim(20);};
const row=()=>{const rows=BK.ui.menuRows();BK.ui.menuI=rows.indexOf('Back to shrine');return rows.indexOf('Back to shrine');};
go('wood');const P=BK.P;const sx=P.x;
P.x+=200;BK.sim(2);const moved=P.x;key('r');key('R');BK.sim(2);out.rKeepsPlace=Math.abs(P.x-moved)<30;
BK.ui.openMenu('play');out.rowThere=row()>=0;out.noShrine=BKT.noShrineHere();
key('Enter');out.asked=BKT.shrineAsk;key('Enter');out.afterNo=[BKT.shrineAsk,BK.state,Math.abs(P.x-moved)<30];
BK.ui.openMenu('play');row();key('Enter');key('ArrowRight');key('Enter');out.afterYes=[BKT.shrineAsk,BK.state,Math.abs(P.x-moved)>60];
for(const id of ['lesson','arena_yard']){go(id);BK.ui.openMenu('play');out[id]={row:row()>=0,no:BKT.noShrineHere()};const x0=BK.P.x;key('Enter');out[id].ask=BKT.shrineAsk;out[id].msg=BK.ui.menuMsg;out[id].stayed=BK.P.x===x0;key('R');BK.sim(2);out[id].rNothing=BK.P.x===x0;}
return out;})()`);
  console.log(JSON.stringify(r));
  assert.ok(r.rKeepsPlace, 'R moved the hero'); assert.equal(r.noShrine, false);
  assert.equal(r.asked, true, 'the menu row asks'); assert.deepEqual(r.afterNo, [false, 'menu', true], 'NO leaves him where he is');
  assert.equal(r.afterYes[0], false); assert.equal(r.afterYes[1], 'play'); assert.ok(r.afterYes[2], 'YES sends him back');
  for (const id of ['lesson', 'arena_yard']) { const o = r[id]; assert.ok(o.row && o.no && !o.ask && o.stayed && o.rNothing, id + ': ' + JSON.stringify(o)); }
  assert.deepEqual(pg.errors, []);
  console.log('SHRINEKEY: ok');
} finally { pg.close(); }
