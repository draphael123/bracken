/* tools/hero-roster.mjs - THE DEVICE-LEVEL HERO ROSTER + NO UNLOCK-ALL (claude/heroroster, Daniel 10-12).
 *   A. THE RULES, no page (a fake storage): howTo says BUY IN THE STORE - 10 SILVER until the hero-unlock rule ships (the hook, HERO_RULE_SHIPS) and
 *      BEAT HIM, THEN 10 SILVER after; the roster text is parsed/judged; MIGRATION seeds it from every slot once; a damaged roster is kept (.corrupt)
 *      and put back from its last good copy, or REBUILT from the slots; a hero bought is added and written once; a full disk never loses the old text;
 *      UNLOCK EVERYTHING is not a settings row without the dev flag.
 *   B. THE PAGE (one page at a time, no ?dev=1): the roster is seeded from the existing slots at boot; a hero bought in slot 1 (the real buy path) is
 *      pickable in slot 2's NEW GAME; a LOCKED hero stands as a black silhouette of his real outline (checked pixel by pixel against his idle frame),
 *      is named '???', says how to get him, and Z on him is a soft no (nothing is taken, the how-to line pulses); the co-op pick list follows the roster
 *      (the online guest's pick is that list); a saved SET.godmode does nothing without the flag, the HUD row and the settings row are gone, and with
 *      ?dev=1 (or the BK.setDev test hook) they are back; a damaged roster is restored on the next boot.
 *   node tools/hero-roster.mjs          (PORT for the page server)
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ROSTER_KEY, STARTERS, HERO_IDS, howTo, parseRoster, rosterText, heroesInSlots, loadRoster, addHeroes, LASTGOOD, CORRUPT } from '../src/hero-roster.js';
import { TAB_ITEMS, tabRows, LEGACY_ROWS } from '../src/settings-ui.js';
import { isDev, setDev } from '../src/dev-flag.js';
import { openPage } from './cdp.mjs';

/* ---------------- A. the rules ---------------- */
class Fake { constructor(cap = Infinity) { this.m = new Map(); this.cap = cap; }
  get length() { return this.m.size; } key(i) { return [...this.m.keys()][i] ?? null; } getItem(k) { return this.m.has(k) ? this.m.get(k) : null; } removeItem(k) { this.m.delete(k); }
  used() { let n = 0; for (const [k, v] of this.m) n += k.length + v.length; return n; }
  setItem(k, v) { const was = this.m.has(k) ? k.length + this.m.get(k).length : 0; if (this.used() - was + k.length + v.length > this.cap) throw Object.assign(new Error('quota exceeded'), { name: 'QuotaExceededError' }); this.m.set(k, String(v)); } }
assert.equal(howTo('pyro', false), 'BUY IN THE STORE - 10 SILVER'); assert.equal(howTo('paladin', true), 'BEAT HIM, THEN 10 SILVER', 'the hook: the unlock rule changes the line');
/* (claude/ranger, Daniel 10-12 - a deliberate design change: THE RANGER is the fourth free starter and the berserker is bought; a roster or a slot that holds him keeps him) */
assert.deepEqual(STARTERS, ['knight', 'warden', 'geomancer', 'ranger']); assert.equal(HERO_IDS.length, 9);
assert.deepEqual(parseRoster(rosterText(['pyro'])), ['knight', 'warden', 'geomancer', 'ranger', 'pyro'], 'the four starters are always in it, in hero order');
assert.deepEqual(parseRoster(JSON.stringify({ v: 1, heroes: ['knight', 'warden', 'geomancer', 'berserker'] })), ['knight', 'warden', 'geomancer', 'ranger', 'berserker'], 'an old roster (written when the berserker was a starter) keeps him, and gains the ranger');
assert.deepEqual(parseRoster(rosterText(['nobody', 'reaper'])), [...STARTERS, 'reaper'], 'an unknown id is dropped');
assert.throws(() => parseRoster('{bad'), /not readable/); assert.throws(() => parseRoster('{"heroes":3}'), /no hero list/);
const slotA = JSON.stringify({ hero: 'knight', heroes: { knight: true, pyro: true } }), slotB = JSON.stringify({ hero: 'paladin', heroes: { paladin: true, reaper: false } }), slotBad = '{trunc';
assert.deepEqual(heroesInSlots([slotA, null, slotB, slotBad]), [...STARTERS, 'pyro', 'paladin'], 'every hero owned anywhere; a damaged slot is skipped, a false is not owned');
{ const s = new Fake(); const r = loadRoster(s, () => [slotA, slotB]);
  assert.equal(r.state, 'migrated'); assert.deepEqual(r.heroes, [...STARTERS, 'pyro', 'paladin']); assert.equal(s.getItem(ROSTER_KEY), rosterText(r.heroes)); assert.equal(s.getItem(ROSTER_KEY + LASTGOOD), s.getItem(ROSTER_KEY));
  const again = loadRoster(s, () => [JSON.stringify({ heroes: { reaper: true } })]); assert.equal(again.state, 'ok'); assert.ok(!again.heroes.includes('reaper'), 'the slots are scanned ONCE: a stored roster is not re-seeded');
  const add = addHeroes(s, r.heroes, ['pirate', 'knight']); assert.deepEqual(add.added, ['pirate']); assert.ok(add.heroes.includes('pirate')); assert.ok(parseRoster(s.getItem(ROSTER_KEY)).includes('pirate'));
  const none = addHeroes(s, add.heroes, ['pirate']); assert.equal(none.added.length, 0); assert.equal(none.heroes, add.heroes, 'nobody new: nothing is written');
  /* a damaged roster: kept, then restored from the last good copy */
  s.setItem(ROSTER_KEY, '{"heroes":[');
  const fix = loadRoster(s, () => []); assert.equal(fix.state, 'restored'); assert.ok(fix.heroes.includes('pirate') && fix.heroes.includes('pyro')); assert.equal(s.getItem(ROSTER_KEY + CORRUPT), '{"heroes":[', 'the damaged text is kept');
  assert.equal(parseRoster(s.getItem(ROSTER_KEY)).join(), fix.heroes.join(), 'and the roster is whole again');
  /* damaged with no good copy: rebuilt from the slots */
  s.setItem(ROSTER_KEY, 'junk'); s.removeItem(ROSTER_KEY + LASTGOOD);
  const rb = loadRoster(s, () => [slotA]); assert.equal(rb.state, 'rebuilt'); assert.deepEqual(rb.heroes, [...STARTERS, 'pyro']); }
{ const full = new Fake(); full.setItem('bracken.progress.0', 'x'.repeat(200)); full.cap = full.used() + 10;   /* a full disk: the roster cannot be written, the game still has it in memory */
  const r = loadRoster(full, () => [slotA]); assert.deepEqual(r.heroes, [...STARTERS, 'pyro']); assert.equal(r.wrote, false); assert.equal(full.getItem('bracken.progress.0').length, 200, 'a slot is never touched to make room'); }
/* UNLOCK EVERYTHING is a dev row */
assert.ok(isDev() === false); assert.ok(TAB_ITEMS.gameplay.includes('Unlock everything') && LEGACY_ROWS.includes('Unlock everything'), 'the row is still a known row (the settings-tabs ledger)');
assert.ok(!tabRows('gameplay', 'title').includes('Unlock everything') && tabRows('gameplay', 'title').includes('God mode'), 'no dev flag: the settings list has no UNLOCK EVERYTHING (God mode, the other TESTING row, is as it was)');
setDev(true); assert.ok(tabRows('gameplay', 'title').includes('Unlock everything'), 'with the dev flag it is back'); setDev(false);
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
assert.ok(/const godMode = \(\) => isDev\(\) && !!SET\.godmode;/.test(main), 'godMode() is gated by the dev flag');
assert.ok(!/SET\.godmode\s*\?\s*'UNLOCK ALL'/.test(main) && /godMode\(\) \? 'UNLOCK ALL'/.test(main), 'the HUD row reads godMode(), not the raw setting');
const rawUses = [...main.matchAll(/SET\.godmode/g)].length;   /* the raw setting: godMode(), the toggle (twice), the stale-setting clear, and the comment words - nothing that grants anything */
console.log('ok  A rules        howTo + its unlock-rule hook; the roster text; migration once from every slot; damaged -> kept + restored / rebuilt; add writes once; a full disk spares the slots; UNLOCK EVERYTHING is a dev-only row (' + rawUses + ' raw SET.godmode uses, all guards)');

/* ---------------- B. the page ---------------- */
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pg = await openPage({ audio: false, fonts: false });
const fails = [], ok = (c, m) => { if (!c) fails.push(m); };
try {
  const nav = async (search, seed) => {
    await pg.evalp('(()=>{' + (seed ? seed : '') + 'window.__gone=1;setTimeout(()=>location.assign("/' + search + '"),50);return 1})()', 8000);
    for (let i = 0; i < 400; i++) { await sleep(150); if (await pg.evalp('!window.__gone&&typeof window.BK==="object"&&!!window.BK.lookPass', 3000).catch(() => false)) return; }
    throw new Error('page did not come up: ' + search);
  };
  const SLOT0 = JSON.stringify({ hero: 'knight', heroes: { knight: true }, coins: 10 });
  /* 1. BOOT MIGRATION: slot 3 owns the paladin (no roster stored yet) */
  await nav('?noopening=1', 'localStorage.clear();localStorage.setItem("bracken.progress.0",' + JSON.stringify(SLOT0) + ');localStorage.setItem("bracken.progress.2",' + JSON.stringify(JSON.stringify({ hero: 'paladin', heroes: { paladin: true } })) + ');localStorage.setItem("bracken.slot","0");');
  let r = await pg.evalp(`({ roster: BK.roster(), stored: localStorage.getItem('bracken.roster'), lg: localStorage.getItem('bracken.roster.lastgood'), dev: BK.isDev() })`, 8000);
  ok(!r.dev, '1: no ?dev=1: the dev flag is off');
  ok(['knight', 'warden', 'geomancer', 'ranger', 'paladin'].every(h => r.roster.includes(h)) && !r.roster.includes('berserker') && !r.roster.includes('pyro') && !r.roster.includes('pirate') && !r.roster.includes('reaper'), '1: the roster was seeded from every slot: ' + r.roster.join());
  ok(r.stored && r.stored === r.lg, '1: the roster is stored and backed up (.lastgood): ' + r.stored);

  /* 2. A HERO BOUGHT IN SLOT 2 (the real buy path, a coin route) is in the roster at once and open in slot 4's new game; the slots keep their own heroes */
  r = await pg.evalp(`(()=>{ BK.manualSimulation = true; BK.loadSlot(1); const P = BKT.PROG; const hadPirate = !!P.heroes.pirate;
      P.coins = 900; P.heroes = { knight: true }; BKT.saveNow(); const before = BK.roster().includes('pyro');
      BKT.PROG.burning = { cleared: true }; const bought = BK.store.buy('pyro'); BKT.saveNow();
      const slot1 = JSON.parse(localStorage.getItem('bracken.progress.0'));
      BK.loadSlot(3); const fresh = { heroes: Object.keys(BKT.PROG.heroes), picked: !!BKT.PROG.heroPicked };
      return { before, bought, rosterNow: BK.roster(), stored: JSON.parse(localStorage.getItem('bracken.roster')).heroes, slot1Heroes: Object.keys(slot1.heroes), open: HEROS.map(h => [h, BK.heroOpen(h)]), fresh }; })()`.replace('HEROS', JSON.stringify(HERO_IDS)), 8000);
  ok(!r.before && r.bought && r.rosterNow.includes('pyro') && r.stored.includes('pyro'), '2: pyro bought in slot 2 is in the roster, memory and storage: ' + JSON.stringify([r.bought, r.rosterNow, r.stored]));
  ok(r.open.filter(([, o]) => o).map(x => x[0]).join() === 'knight,warden,geomancer,ranger,pyro,paladin', '2: slot 4 (new game) can take the starters + pyro + paladin, not the berserker / pirate / reaper: ' + JSON.stringify(r.open));
  ok(!r.slot1Heroes.includes('paladin') && r.fresh.heroes.length <= 1, '2: each slot keeps its own heroes (slot 1 has no paladin; a fresh slot owns none until it picks): ' + JSON.stringify([r.slot1Heroes, r.fresh]));

  /* 3. THE PICK: a fresh slot, state heropick. Locked = silhouette + '???' + how-to; Z on him is a soft no; an open roster hero is taken */
  r = await pg.evalp(`(async()=>{ BK.manualSimulation = true; BK.loadSlot(3); BK.reset({ fresh: true }); const { VW, VH } = BK.view; const out = { cards: [] };
      const text = i => { BK.state = 'heropick'; BK.ui.heroPickStage = 'pick'; BK.ui.heroPickI = i; BK.step(6); window.__textRec = []; BK.step(1); const rec = (window.__textRec || []).filter(x => x.kind === 'text').map(x => x.s); window.__textRec = null; return rec; };
      for (let i = 0; i < 9; i++) out.cards.push(text(i));
      /* the silhouette is his real outline: the idle frame's alpha, solid black, one pixel in from a faint rim */
      const { silhouetteOf } = await import('/src/hero-silhouette.js'); out.sil = {};
      for (const h of ['pirate', 'reaper', 'paladin']) { const fr = BK.heroArt(h), s = silhouetteOf(fr), a = fr.getContext('2d').getImageData(0, 0, fr.width, fr.height).data, b = s.getContext('2d').getImageData(0, 0, s.width, s.height).data;
        let inside = 0, black = 0, colour = 0, rim = 0, outside = 0; for (let y = 0; y < fr.height; y++) for (let x = 0; x < fr.width; x++) { const ai = (y * fr.width + x) * 4, bi = ((y + 1) * s.width + (x + 1)) * 4;
          if (a[ai + 3] > 0) { inside++; if (b[bi + 3] === 255 && b[bi] === 0 && b[bi + 1] === 0 && b[bi + 2] === 0) black++; else colour++; } }
        for (let y = 0; y < s.height; y++) for (let x = 0; x < s.width; x++) { const bi = (y * s.width + x) * 4; if (b[bi + 3] > 0 && !(b[bi] === 0 && b[bi + 1] === 0 && b[bi + 2] === 0 && b[bi + 3] === 255)) rim++; }
        out.sil[h] = { inside, black, colour, rim, size: [s.width, s.height], frame: [fr.width, fr.height] }; }
      /* Z on a locked card */
      BK.reset({ fresh: true }); BK.state = 'heropick'; BK.ui.heroPickStage = 'pick'; BK.ui.heroPickI = 7; BK.step(3); const d0 = BK.denyAt(); BK.press('confirm'); BK.step(3);
      out.deny = { state: BK.state, picked: !!BKT.PROG.heroPicked, heroes: Object.keys(BKT.PROG.heroes), denied: BK.denyAt() !== d0 };
      /* Z on an open roster hero (pyro) */
      BK.reset({ fresh: true }); BK.state = 'heropick'; BK.ui.heroPickStage = 'pick'; BK.ui.heroPickI = 5; BK.step(3); BK.press('confirm'); BK.step(3);
      out.take = { hero: BK.hero(), heroes: Object.keys(BKT.PROG.heroes), picked: !!BKT.PROG.heroPicked };
      return out; })()`, 60000);
  const shown = i => r.cards[i];
  ok(shown(7).includes('???') && !shown(7).includes('PIRATE') && shown(7).some(s => /BUY IN THE STORE - 10 SILVER/.test(s)), '3: a locked card says ??? and the how-to line: ' + shown(7).join(' | '));
  ok(shown(4).includes('???') && !shown(4).includes('BERSERKER') && shown(4).some(s => /BEAT HIM AT THE WAR CAIRN, THEN BUY: 10 SILVER/.test(s)), '3: (claude/ranger) the berserker is no longer free: his card is locked and says BEAT HIM AT THE WAR CAIRN, THEN BUY: 10 SILVER (WARCAIRN_SHIPS, batch129): ' + shown(4).join(' | '));
  ok(shown(8).includes('???') && shown(8).some(s => /FOUND ON A HIDDEN PATH/.test(s)) && !shown(8).some(s => /UNBURIED/.test(s)), '3: (claude/secrets) the Death Knight card is locked, says FOUND ON A HIDDEN PATH and names no place before the secret is found: ' + shown(8).join(' | '));
  ok(shown(0).includes('KNIGHT') && shown(3).includes('RANGER') && shown(5).includes('PYRO') && shown(6).includes('PALADIN'), '3: open heroes are named: ' + shown(0).join(' | '));
  ok(shown(0).filter(s => s === '???').length === 3, '3: exactly the three locked cards are ??? (berserker, pirate, reaper): ' + shown(0).join(' | '));
  for (const h of ['pirate', 'reaper', 'paladin']) { const s = r.sil[h]; ok(s.inside > 60 && s.black === s.inside && s.colour === 0, '3: ' + h + "'s silhouette is solid black over exactly his idle frame's pixels: " + JSON.stringify(s)); ok(s.rim > 10 && s.size[0] === s.frame[0] + 2, '3: ' + h + ' has a faint rim one pixel out: ' + JSON.stringify(s)); }
  ok(r.deny.state === 'heropick' && !r.deny.picked && r.deny.denied, '3: Z on a locked hero is refused (nothing taken, the soft no sounded): ' + JSON.stringify(r.deny));
  ok(r.take.hero === 'pyro' && r.take.heroes.join() === 'pyro' && r.take.picked, '3: Z on pyro (open by the roster) starts a new game with him alone: ' + JSON.stringify(r.take));

  /* 4. CO-OP follows the roster (the online guest picks from this very list: main.js ONL roster) */
  r = await pg.evalp(`(()=>{ BK.loadSlot(3); BKT.PROG.heroes = { knight: true }; return BK.ui.coopPickList(); })()`, 8000);
  ok(r.includes('pyro') && r.includes('paladin') && !r.includes('pirate') && !r.includes('reaper'), '4: the co-op pick list follows the roster, not only the slot: ' + r.join());
  ok(/roster: \(\) => coopPickList\(\)\.map/.test(main), '4: the online guest\'s roster is the co-op pick list');

  /* 5. NO UNLOCK-ALL without ?dev=1: a saved SET.godmode is cleared on boot and does nothing; the HUD row is not drawn; with the flag everything is back */
  await nav('?noopening=1', 'localStorage.setItem("bracken.settings",JSON.stringify({godmode:true,hudV2:1,speedV2:1}));');
  r = await pg.evalp(`(()=>{ BK.manualSimulation = true; BK.loadSlot(3); BKT.PROG.heroes = { knight: true }; const out = { godmode: BK.SET.godmode, list: BK.ui.coopPickList(), coopOk: BK.coopOk ? BK.coopOk() : null, open: BK.heroOpen('reaper') };
      BK.SET.godmode = true; out.stillList = BK.ui.coopPickList(); out.stillOpen = BK.heroOpen('reaper'); out.dev = BK.isDev(); BK.SET.godmode = false; return out; })()`, 8000);
  ok(!r.godmode, '5: a saved UNLOCK EVERYTHING is cleared on a boot without the flag');
  ok(!r.stillOpen && !r.stillList.includes('reaper') && !r.stillList.includes('pirate'), '5: SET.godmode = true does nothing without the flag: ' + JSON.stringify([r.stillOpen, r.stillList]));
  /* the HUD row: in a level with the setting forced on, no UNLOCK ALL text is drawn */
  const hud = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; BK.load(LEVELS.findIndex(l => l.id === 'wood')); BK.state = 'play'; BK.start(); BK.SET.godmode = true; BK.SET.invincible = false;
      window.__textRec = []; BK.step(3); const a = (window.__textRec || []).filter(x => x.kind === 'text').map(x => x.s); window.__textRec = null;
      BK.setDev(true); window.__textRec = []; BK.step(3); const b = (window.__textRec || []).filter(x => x.kind === 'text').map(x => x.s); window.__textRec = null; BK.setDev(false); BK.SET.godmode = false; return { off: a.some(s => /UNLOCK ALL/.test(s)), on: b.some(s => /UNLOCK ALL/.test(s)) }; })()`, 60000);
  ok(!hud.off, '5: no UNLOCK ALL on the HUD without the flag'); ok(hud.on, '5: with the dev flag the HUD row is back (the tools\' view)');
  await nav('?noopening=1&dev=1', '');
  r = await pg.evalp(`(()=>{ BK.manualSimulation = true; BK.loadSlot(3); BKT.PROG.heroes = { knight: true }; BK.SET.godmode = true; const out = { dev: BK.isDev(), list: BK.ui.coopPickList(), open: BK.heroOpen('reaper') }; BK.SET.godmode = false; return out; })()`, 8000);
  ok(r.dev && r.open && r.list.includes('reaper'), '5: ?dev=1: UNLOCK EVERYTHING works as it did: ' + JSON.stringify(r));

  /* 6. A DAMAGED ROSTER is restored on the next boot (and the damaged text is kept) */
  await nav('?noopening=1', 'localStorage.setItem("bracken.roster","{broken");');
  r = await pg.evalp(`({ roster: BK.roster(), stored: localStorage.getItem('bracken.roster'), corrupt: localStorage.getItem('bracken.roster.corrupt') })`, 8000);
  ok(r.corrupt === '{broken', '6: the damaged roster text is kept: ' + r.corrupt);
  ok(r.roster.includes('pyro') && r.roster.includes('paladin') && r.stored !== '{broken', '6: restored from the last good copy: ' + r.roster.join());
} finally { pg.close(); }
if (fails.length) { console.log('hero-roster: ' + fails.length + ' failure(s)\n  ' + fails.join('\n  ')); process.exitCode = 1; }
else console.log('ok  hero-roster    seeded from every slot at boot; a hero bought in one slot is open in another slot\'s new game; locked heroes are exact black silhouettes named ??? with a how-to line and Z is refused; co-op follows the roster; no UNLOCK ALL (setting, row, HUD) without ?dev=1; a damaged roster is restored');
