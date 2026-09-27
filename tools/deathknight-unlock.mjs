/* tools/deathknight-unlock.mjs — THE DEATH KNIGHT OPENS ON HIS OWN DEATH (Daniel, 2026-09-25: "beating him opens the Death Knight hero
   in the shop ... implement as defeated the Unburied boss, a flag set on his death, not just cleared the level"). In the page:
     - a fresh save: the hero is LOCKED in the shop (feat 'boss:unburied') and has no gold route;
     - the level marked cleared and the boss not beaten: still locked;
     - the boss killed in his own arena through the game's own hurtEnemy: PROG.bossDown.unburied is set, the lock lifts, the gold
       route opens, and 800 gold buys him;
     - a save that already owns him, with no flag at all, still owns him.
   Proved red on the old code: a fresh save had him open in the shop (10 silver, no lock). */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const out={};const P0=BKT.PROG;
    const fresh=()=>{BK.setHero('knight');BK.reset({fresh:true});delete P0.bossDown;delete P0.unburied;if(P0.heroes)delete P0.heroes.reaper;};
    fresh();out.fresh={locked:BK.store.locked('reaper'),gold:BK.store.coinRoute('reaper')};
    P0.unburied={cleared:true};out.cleared={locked:BK.store.locked('reaper'),gold:BK.store.coinRoute('reaper')};delete P0.unburied;
    BK.load(LEVELS.findIndex(l=>l.id==='unburied'));BK.state='play';BK.god=true;const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+2,Math.round(A.floor/16)-1);BK.sim(150);
    const b=BK.boss;out.boss=b&&b.t;for(let i=0;i<200&&b.alive;i++){b.mode='stalk';BKT.hurtEnemy(b,60,b.x-20,false);BK.sim(2);}BK.sim(30);
    out.killed={alive:b.alive,flag:!!(P0.bossDown&&P0.bossDown.unburied),locked:BK.store.locked('reaper'),gold:BK.store.coinRoute('reaper')};
    P0.coins=900;out.bought=BK.store.buy('reaper');out.owned=!!(P0.heroes&&P0.heroes.reaper);
    fresh();P0.heroes=P0.heroes||{};P0.heroes.reaper=true;out.keeper={owned:!!P0.heroes.reaper,flag:!!P0.bossDown};
    return out;})()`, 240000);
  console.log(JSON.stringify(r));
  assert.equal(r.fresh.locked, true, 'a fresh save must not have the Death Knight open in the shop: ' + JSON.stringify(r));
  assert.equal(r.fresh.gold, false, 'nor his gold route');
  assert.equal(r.cleared.locked, true, 'clearing the level is not beating its boss: ' + JSON.stringify(r));
  assert.equal(r.cleared.gold, false, 'the gold route asks for the boss, not the clear');
  assert.equal(r.boss, 'bloodknight');
  assert.equal(r.killed.alive, false, 'the boss did not die: ' + JSON.stringify(r));
  assert.ok(r.killed.flag, 'his death sets PROG.bossDown.unburied');
  assert.equal(r.killed.locked, false, 'beaten, he is open in the shop'); assert.equal(r.killed.gold, true, 'and sold for gold');
  assert.ok(r.bought && r.owned, '800 gold buys him');
  assert.ok(r.keeper.owned && !r.keeper.flag, 'a save that owns him keeps him, flag or no flag');
  assert.deepEqual(pg.errors, []);
  console.log('ok  deathknight-unlock  locked on a fresh save and on a clear; his death opens him (feat and gold route); owners keep him');
} finally { pg.close(); }
