import fs from 'fs';
const ed=(f,pairs)=>{ let s=fs.readFileSync(f,'utf8'); const crlf=s.includes('\r\n'); s=s.replace(/\r\n/g,'\n');
 for(const [a,b] of pairs){ const n=s.split(a).length-1; if(n!==1) throw Error(f+': '+n+' x '+a.slice(0,60)); s=s.replace(a,()=>b); }
 fs.writeFileSync(f,crlf?s.replace(/\n/g,'\r\n'):s); };
let L=fs.readFileSync('tools/leveling.mjs','utf8').replace(/\r\n/g,'\n');
const i=L.indexOf("check('slots', () => {"), j=L.indexOf("check('heroes for silver'");
const block=`check('slots', () => {   // ONE SLOT, A SECOND AT LEVEL 30, TWO AT MOST (Daniel 2026-11-01; it was 2 + a third at 16)
  assert.deepEqual([0, 1, 7, 8, 15, 16, 23, 29, 30, 31, 50].map(PR.slotsAt), [1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2]); assert.equal(PR.MAX_SLOTS, 2); assert.equal(PR.SECOND_SLOT_LEVEL, 30);
  const p = PR.migrateProgress(null).progress, n = PR.skillsFor('knight').find(s => s.active), m = PR.skillsFor('knight').filter(s => s.active)[1]; p.coins = 9999; p.skillOwned.knight = { [n.id]: true, [m.id]: true };
  assert.match(PR.equipSkill(p, 'knight', n.id, 1, 29, true), /level 30/, 'the second slot opens at 30'); assert.equal(PR.equipSkill(p, 'knight', n.id, 2, 50, true), 'Slot is locked'); assert.equal(PR.equipSkill(p, 'knight', n.id, 0, 1, true), null); assert.equal(PR.equipSkill(p, 'knight', m.id, 1, 30, true), null);
  assert.equal(PR.equipped(p, 'knight', 29).length, 1); assert.equal(PR.equipped(p, 'knight', 29)[0], n.id); assert.equal(PR.equipped(p, 'knight', 30)[1], m.id); assert.equal(PR.equipped(p, 'knight', 50).length, 2);
  // OLD SAVES (a two-, three- and four-slot save): the first equipped ability stays first, the rest are unequipped but still owned; a hero at 30+ keeps two
  const act = PR.skillsFor('warden').filter(s => s.active).slice(0, 4).map(s => s.id), mk = (xpLv, lo) => PR.migrateProgress(JSON.stringify({ progressionVersion: 2, hero: 'warden', heroes: { warden: true }, xp: { warden: XP.xpFloor(xpLv) }, skillOwned: { warden: Object.fromEntries(act.map(id => [id, true])) }, loadouts: { warden: lo } })).progress;
  let old = mk(20, act); assert.deepEqual(old.loadouts.warden, [act[0]], 'a four-slot L20 save was not cut to its one'); assert(act.every(id => old.skillOwned.warden[id]), 'an extra ability was lost, not just unslotted');
  old = mk(20, [null, act[1]]); assert.deepEqual(old.loadouts.warden, [act[1]], 'a save with only its second slot filled lost its skill'); assert.deepEqual(PR.equipped(old, 'warden', 20), [act[1]]);
  old = mk(12, [act[0], act[1], act[2]]); assert.deepEqual(old.loadouts.warden, [act[0]]);
  old = mk(31, act); assert.deepEqual(old.loadouts.warden, act.slice(0, 2), 'a hero past 30 keeps two'); old = mk(31, [null, act[1]]); assert.deepEqual(old.loadouts.warden, [null, act[1]], 'a 30+ hero\'s slots stay where they were');
  old = mk(5, []); assert.deepEqual(old.loadouts.warden, []); old = mk(5, [act[0]]); assert.deepEqual(old.loadouts.warden, [act[0]]);
  assert.deepEqual(PR.migrateProgress(JSON.stringify(old)).progress.loadouts.warden, old.loadouts.warden, 'migrating twice changed the loadout');
  for (const lo of [[null], [null, null], [act[0], null, act[2]]]) { assert.doesNotThrow(() => mk(10, lo), 'a loadout ' + JSON.stringify(lo) + ' crashed the load'); }
});

`;
L=L.slice(0,i)+block+L.slice(j);
fs.writeFileSync('tools/leveling.mjs',L.replace(/\n/g,'\r\n'));
ed('tools/progression.mjs',[
 ["assert(p.loadouts[hero].length>=2&&p.loadouts[hero].length<=slotsAt(12));/* an old save keeps what its level's slots hold (LEVELING: three at L12) */","assert(p.loadouts[hero].length===1&&p.loadouts[hero].length<=slotsAt(12));/* an old save keeps what its level's slots hold (Daniel 11-01: ONE until L30; its first skill) */"],
 ["assert.deepEqual([0,1,7,8,15,16,23,24,99].map(slotsAt),[2,2,2,2,2,3,3,3,3]);   /* THE THIRD SLOT AT LEVEL 16, THREE AT MOST (Daniel 2026-10-04) */","assert.deepEqual([0,1,7,8,15,16,23,24,29,30,99].map(slotsAt),[1,1,1,1,1,1,1,1,1,2,2]);   /* ONE SLOT, A SECOND AT LEVEL 30, TWO AT MOST (Daniel 2026-11-01) */"],
]);
let c=fs.readFileSync('tools/check.mjs','utf8'); c=c.replace("a third slot at 16 (three at most)","one slot, a second at 30 (two at most)"); fs.writeFileSync('tools/check.mjs',c);
