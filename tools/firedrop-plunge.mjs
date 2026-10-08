/* tools/firedrop-plunge.mjs - THE PYRO BUG, PROVED IN THE PAGE (claude/keyscore, scratch/audit-keys.md 0.4). The pyromancer's plunge is her FIREDROP: the ember
   strikes with hurtAs('plunge', e, d, x, false) - the tag says plunge, the boolean (the hero's own body) says no. Before keys-core every boss gate on the
   boolean left her out. This strikes the bosses exactly as the ember does and asks each gate:
     THE SCARECROW KING (fields): stage three, his lantern lit - a plunge knocks it into his straw (ablaze), a plain cut does not.
     THE BULLFROG KING (marsh): a plunge on his head counts (headHits), a plain cut does not. */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
let r;
try {
  r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const out={};
    const boot=id=>{BK.setHero('pyro');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id===id));BK.state='play';BK.god=true;
      const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);BK.sim(150);return BK.boss;};
    {const q=boot('fields');const set=()=>{q.stage=3;q.lantern=true;q.open=0;q.mode='idle';q.modeT=5;q.hp=q.maxHp;};
     set();BKT.hurtAs('light',q,8,q.x-20,false);out.strawCut=q.mode;
     set();BKT.hurtAs('plunge',q,8,q.x,false);out.strawDrop=q.mode;}
    {const q=boot('marsh');const set=()=>{q.mode='idle';q.modeT=5;q.headHits=0;q.hp=q.maxHp;};
     set();BKT.hurtAs('light',q,8,q.x-20,false);out.frogCut=q.headHits||0;
     set();BKT.hurtAs('plunge',q,8,q.x,false);out.frogDrop=q.headHits||0;}
    return out;})()`, 120000);
} finally { pg.close(); }
assert.equal(r.strawCut, 'idle', 'a plain cut does not knock his lantern in (' + JSON.stringify(r) + ')');
assert.equal(r.strawDrop, 'ablaze', 'the FIREDROP (a plunge by its tag) knocks the Scarecrow King\'s lantern into his straw (' + JSON.stringify(r) + ')');
assert.equal(r.frogCut, 0, 'a plain cut is not a head stomp'); assert.equal(r.frogDrop, 1, 'the FIREDROP counts on the Bullfrog King\'s head (' + JSON.stringify(r) + ')');
console.log('firedrop-plunge: ok (the firedrop is a plunge by its tag: the Scarecrow King burns, the Bullfrog King\'s head counts)');
