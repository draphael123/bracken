/* tools/save-safety.mjs - A SAVE IS NEVER LOST IN SILENCE (claude/shipfix, Daniel 10-11; src/save-safety.js, src/main.js).
 *   A. THE RULES, no page (a fake storage with a size cap): a slot's text is judged empty / ok / newer / corrupt (a truncated file, a bad hero, a bad type, a
 *      future version); a damaged text is KEPT (key.corrupt) and restore puts the last good copy back without losing the damaged one; the migration backups are pruned to one;
 *      a full disk first frees the safety copies (never another slot's save) and tries again, and when nothing helps says so and leaves the old text exactly as it was.
 *   B. THE PAGE: the picker shows a corrupt slot as CORRUPT (not EMPTY) and a later-version one as NEWER SAVE; Z opens FIX IT (RESTORE the last good copy / EXPORT / ERASE / BACK);
 *      RESTORE brings the slot back and keeps the damaged text; X on a damaged slot asks ERASE (it used to say 'already empty') and erasing keeps a copy; the title's other doors
 *      never load a damaged slot (they open the picker); a failed write (quota) sets 'SAVE FAILED - STORAGE FULL', paints a banner, leaves the old text, and the next write that
 *      lands clears it; loading a save that needs migrating leaves ONE migration backup, not a pile.
 */
import assert from 'node:assert/strict';
import { slotHealth, keepCorruptCopy, keepLastGood, backupCandidates, restoreSlot, pruneBackups, safeSet, MIG, CORRUPT, LASTGOOD } from '../src/save-safety.js';
import { migrateProgress } from '../src/progression.js';
import { openPage } from './cdp.mjs';

/* ---------------- A. the rules ---------------- */
class Fake { constructor(cap = Infinity) { this.m = new Map(); this.cap = cap; }
  get length() { return this.m.size; } key(i) { return [...this.m.keys()][i] ?? null; } getItem(k) { return this.m.has(k) ? this.m.get(k) : null; } removeItem(k) { this.m.delete(k); }
  used() { let n = 0; for (const [k, v] of this.m) n += k.length + v.length; return n; }
  setItem(k, v) { const was = this.m.has(k) ? k.length + this.m.get(k).length : 0; if (this.used() - was + k.length + v.length > this.cap) throw Object.assign(new Error('quota exceeded'), { name: 'QuotaExceededError', code: 22 }); this.m.set(k, String(v)); } }
const good = JSON.stringify(migrateProgress(null).progress), K = 'bracken.progress.1';
assert.equal(slotHealth(null).state, 'empty'); assert.equal(slotHealth(good).state, 'ok');
assert.equal(slotHealth(good.slice(0, good.length - 12)).state, 'corrupt', 'a truncated file is corrupt, not empty');
assert.equal(slotHealth('not json at all').state, 'corrupt'); assert.equal(slotHealth('[]').state, 'corrupt');
assert.equal(slotHealth('{"hero":"nobody"}').state, 'corrupt', 'an unknown hero is damage');
assert.equal(slotHealth('{"coins":-5}').state, 'corrupt', 'a bad value is damage');
{ const fut = JSON.stringify({ ...JSON.parse(good), progressionVersion: 99 }); const h = slotHealth(fut); assert.equal(h.state, 'newer', 'a later BRACKEN\'s save is NEWER, not damaged'); assert.match(h.reason, /newer/i); }
console.log('ok  A1 health      empty / ok / corrupt (truncated, junk, bad hero, bad value) / newer, each told apart');
{ const s = new Fake(); const bad = good.slice(0, 40);
  assert.equal(keepCorruptCopy(s, K, bad), true); assert.equal(s.getItem(K + CORRUPT), bad); assert.equal(keepCorruptCopy(s, K, bad), true, 'an identical copy is not an error');
  assert.equal(keepLastGood(s, K, good), true); assert.equal(s.getItem(K + LASTGOOD), good); assert.equal(keepLastGood(s, K, bad), false, 'a damaged text is never kept as the last good one');
  s.setItem(K, bad); s.setItem(K + MIG + 'v2.aaaa', good); s.setItem(K + MIG + 'v2.bbbb', bad);
  const c = backupCandidates(s, K); assert.deepEqual(c.map(x => x.kind), ['last good copy', 'before an update'], 'the last good copy first, then the migration backup that reads clean (the damaged backup is skipped)');
  restoreSlot(s, K, c[0]); assert.equal(s.getItem(K), good, 'restore puts the good text back'); assert.equal(s.getItem(K + CORRUPT), bad, 'and the damaged one is still kept');
  assert.equal(pruneBackups(s, K, K + MIG + 'v2.aaaa'), 1); assert.equal(s.getItem(K + MIG + 'v2.bbbb'), null); assert.notEqual(s.getItem(K + MIG + 'v2.aaaa'), null, 'the one kept survives'); }
console.log('ok  A2 backups     a damaged text is kept; restore returns the last good copy and keeps the damage; migration backups pruned to the one kept');
{ /* a disk that holds the slot but not a bigger one beside the pile of safety copies */
  const other = 'bracken.progress.0', slotKeys = [other, K]; const s = new Fake(); s.setItem(other, good); s.setItem(K, 'x'.repeat(100));
  const pile = 'y'.repeat(600); s.setItem(K + MIG + 'v2.1', pile); s.setItem(other + MIG + 'v2.2', pile); s.setItem(K + CORRUPT, pile); s.cap = s.used() + 200;
  const r = safeSet(s, K, 'z'.repeat(500), slotKeys); assert.equal(r.ok, true, 'freeing the safety copies made room'); assert.ok(r.pruned >= 1); assert.equal(s.getItem(K).length, 500); assert.equal(s.getItem(other), good, 'another slot\'s save is never pruned');
  const t = new Fake(); t.setItem(K, 'old text'); t.cap = t.used() + 5; const r2 = safeSet(t, K, 'n'.repeat(5000), slotKeys);
  assert.equal(r2.ok, false); assert.equal(r2.full, true, 'a full disk is named as one'); assert.equal(t.getItem(K), 'old text', 'and the old text is exactly as it was'); }
console.log('ok  A3 full disk   safety copies freed in order (never another slot), and a write that cannot land says so and leaves the old text alone');

/* ---------------- B. the page ---------------- */
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{BK.manualSimulation=true; const out={fails:[],log:[]};
const F=m=>out.fails.push(m), ls=localStorage, K=i=>'bracken.progress.'+i;
const press=(k,n=1)=>{for(let j=0;j<n;j++){BK.press(k);BK.sim(1);}};
const texts=()=>{const s=new Set(); for(let k=0;k<3;k++){window.__textRec=[]; BK.step(2); for(const t of (window.__textRec||[])) if(t.kind==='text') s.add(t.s); window.__textRec=null;} return [...s];};
const keys=()=>{const a=[];for(let i=0;i<ls.length;i++)a.push(ls.key(i));return a;};
ls.clear();
/* slot 2 (index 1): a real save, loaded twice so the last good copy exists, then damaged */
BK.loadSlot(1); BKT.PROG.coins=321; BKT.saveNow(); BK.loadSlot(1);
const goodText=ls.getItem(K(1)); if(!ls.getItem(K(1)+'.lastgood')) F('loading a clean slot wrote no .lastgood copy');
const bad=goodText.slice(0,goodText.length-20); ls.setItem(K(1),bad);
/* slot 3 (index 2): a save from a newer BRACKEN; slot 4 (3): junk with no backup */
const newer=JSON.stringify({...JSON.parse(goodText),progressionVersion:99}); ls.setItem(K(2),newer); ls.setItem(K(3),'{"hero":"knight","coins":12');
const H=i=>BKT.slotHealth(i).state; if(H(0)!=='empty')F('slot 1 should be empty: '+H(0)); if(H(1)!=='corrupt')F('truncated slot is '+H(1)); if(H(2)!=='newer')F('future slot is '+H(2)); if(H(3)!=='corrupt')F('junk slot is '+H(3));
if(BK.readSlot(1)!==null)F('(readSlot still reads the damaged slot as null, as it always did)');
/* the picker draws it as what it is */
BK.state='slots'; BK.ui.slotI=0; const t0=texts(); out.picker=t0;
if(!t0.includes('CORRUPT'))F('the picker does not say CORRUPT: '+t0.join(' / ')); if(!t0.includes('NEWER SAVE'))F('the picker does not say NEWER SAVE'); if(!t0.includes('EMPTY'))F('the empty slots no longer say EMPTY');
/* Z on the corrupt slot opens FIX IT, not the game */
BK.ui.slotI=1; press('confirm'); if(BKT.fixAsk!==1)F('Z on a corrupt slot did not open FIX IT: '+BKT.fixAsk); if(BK.state!=='slots')F('and the game must not have loaded: '+BK.state);
const t1=texts(); out.fix=t1; if(!t1.some(s=>/RESTORE THE LAST GOOD COPY/.test(s)))F('FIX IT has no RESTORE for a slot with a good copy: '+t1.join(' / ')); if(!t1.includes('EXPORT THE FILE')||!t1.includes('ERASE THE SAVE'))F('FIX IT lacks EXPORT / ERASE');
press('confirm');   /* the first row: RESTORE */
if(H(1)!=='ok')F('RESTORE did not bring the slot back: '+H(1)); if(ls.getItem(K(1))!==goodText)F('the restored text is not the good one'); if(ls.getItem(K(1)+'.corrupt')!==bad)F('the damaged text was not kept'); if(BKT.fixAsk!==-1)F('FIX IT stayed open');
/* a corrupt slot with no backup offers no RESTORE; BACK leaves it */
BK.ui.slotI=3; press('confirm'); const t2=texts(); if(t2.some(s=>/RESTORE/.test(s)))F('RESTORE offered with no backup'); press('down'); press('down'); press('confirm'); if(BKT.fixAsk!==-1)F('BACK did not close FIX IT ('+BKT.fixAsk+')'); if(H(3)!=='corrupt')F('BACK changed the slot');
/* X on a damaged slot asks to ERASE (not "already empty"), and erasing keeps a copy */
BK.ui.slotI=2; press('atk'); if(BKT.eraseAskNow()!==2)F('X on a NEWER slot did not ask ERASE ('+BKT.eraseAskNow()+')'); press('right'); press('confirm');
if(H(2)!=='empty')F('erase did not clear the newer slot: '+H(2)); if(ls.getItem(K(2)+'.corrupt')!==newer)F('the erased damaged slot left no copy');
BK.ui.slotI=3; press('atk'); if(BKT.eraseAskNow()!==3)F('X on a CORRUPT slot did not ask ERASE'); press('right'); press('confirm'); if(H(3)!=='empty')F('erase did not clear the corrupt slot');
if(ls.getItem(K(3)+'.corrupt')!=='{"hero":"knight","coins":12')F('the erased corrupt slot kept no copy');
/* the other doors: a damaged CURRENT slot opens the picker */
ls.setItem(K(1),bad); BK.loadSlot(1); if(!/damaged/i.test(BKT.saveBlocked))F('loading a corrupt slot says nothing readable: '+BKT.saveBlocked);
BK.state='title'; const items=BK.ui.titleItems(); out.items=items;
for(const door of ['PRACTICE','LOCAL CO-OP']){ const i=BK.ui.titleTop().indexOf(door); if(i<0){F('no '+door+' door');continue;} BK.state='title'; BK.ui.titleI=i; BK.ui.pressCard=false; press('confirm'); if(BK.state!=='slots')F(door+' with a damaged slot went to '+BK.state); if(BKT.fixAsk!==-1)F('(the picker opens ready)'); }
/* a failed write is told, and the old text stays */
BK.state='title'; ls.setItem(K(1),goodText); BK.loadSlot(1); const before=ls.getItem(K(1)); const orig=Storage.prototype.setItem;
Storage.prototype.setItem=function(k,v){ if(String(k).startsWith('bracken.progress')) throw Object.assign(new Error('The quota has been exceeded.'),{name:'QuotaExceededError',code:22}); return orig.call(this,k,v); };
BKT.PROG.coins=777; BKT.saveNow(); out.failMsg=BKT.saveFail; if(BKT.saveFail!=='SAVE FAILED - STORAGE FULL')F('a full disk was not told: '+JSON.stringify(BKT.saveFail));
if(ls.getItem(K(1))!==before)F('a failed write changed the stored text'); const t3=texts(); if(!t3.includes('SAVE FAILED - STORAGE FULL'))F('no banner on screen: '+t3.join(' / '));
Storage.prototype.setItem=orig; BKT.saveNow(); if(BKT.saveFail!=='')F('a write that landed did not clear the failure: '+BKT.saveFail); if(JSON.parse(ls.getItem(K(1))).coins!==777)F('the retry did not store the progress');
/* a migration leaves ONE backup, not a pile */
ls.clear(); ls.setItem(K(4),'{"hero":"knight","coins":5}'); ls.setItem(K(4)+'.before-progression-v1.aaaa','{"old":1}'); ls.setItem(K(4)+'.before-progression-v2.bbbb','{"old":2}');
BK.loadSlot(4); const mig=keys().filter(k=>k.startsWith(K(4)+'.before-progression-')); out.mig=mig; if(mig.length!==1)F('migration backups left: '+mig.length+' '+mig.join(','));
if(H(4)!=='ok')F('the migrated slot should read ok: '+H(4));
return out; })()`);
  console.log('   picker: ' + r.picker.filter(s => /CORRUPT|NEWER|EMPTY|SLOT/.test(s)).join(' | '));
  assert.deepEqual(r.fails, [], 'FAILS:\n  ' + r.fails.join('\n  '));
  console.log('ok  B page         CORRUPT / NEWER SAVE in the picker, FIX IT (restore, back), erase asks and keeps a copy, the title doors open the picker, a failed write is told and retried, one migration backup');
} finally { await pg.close(); }
