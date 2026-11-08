// tools/hero-account.mjs - ACCOUNT-WIDE HEROES + CATCH-UP XP, IN NODE (claude/heroroster2, Daniel 11-07). No page: a fake storage.
//   A. THE ROSTER IS THE ACCOUNT: a hero bought in slot A is in the device roster and owned in slot B (the co-op heroes list, the seat, the guest's summary,
//      an empty slot); a hero-gating FEAT (the Blood Knight's boss:unburied, the Paladin's boss:church, the Berserker's boss:warcairn) beaten in any slot propagates
//      the same way; an old roster (no feats) still reads; a damaged one is restored from its last good copy WITH its feats, or rebuilt from the slots with them;
//      a full disk keeps the game's copy in memory and spares the slots; nobody new writes nothing.
//   B. THE CO-OP SEAT: seatFromSlot / slotSummary / snapshotOf / the credit see the roster heroes; a roster hero credited into a slot is ADOPTED by it
//      (PROG.heroes), an xpOnly (AI companion) credit adopts nothing.
//   C. NO DOUBLE CHARGE (source checks on src/main.js): the store's confirm tests ownership BEFORE any price, owns() reads the roster, the swap panel's rows,
//      swapHeroTo, setSeatHero, tavHeroes and the boss select all read heroOwned, a buy never refunds (no silverSpent decrease), the roster is written
//      by rosterNote (every save) and its feats are the HEROES' feats.
//   D. CATCH-UP XP (src/xp.js xpGrant): x2 while a hero is below this save's best hero, capped at that level's XP floor, off the moment he is there, never above
//      LV_MAX, never stacked with the wood's x3 curve catch-up (the larger of the two), the soft cap applied first, a hero at or above the best is paid n.
//   node tools/hero-account.mjs
import { readFileSync } from 'node:fs';
import { LEVELS } from '../src/level.js';
import * as CS from '../src/coop-save.js';
import { migrateProgress } from '../src/progression.js';
import { ROSTER_KEY, STARTERS, HERO_FEATS, parseRoster, parseFeats, rosterText, heroesInSlots, featsInSlots, rosterHeroes, rosterOwned, loadRoster, noteRoster, ownedInSlots, parseOwn, LASTGOOD, CORRUPT } from '../src/hero-roster.js';
import { xpFloor, levelOfXp, xpCap, xpGrant, xpRosterCatchUp, rosterCatching, XP_ROSTER, XP_CATCHUP, LV_MAX, xpCatchUp, xpSoftCap } from '../src/xp.js';

const fails = [], ok = (c, m) => { if (!c) fails.push(m); else if (process.env.HA_VERBOSE) console.log('  ok   ' + m); };
const CAMP = LEVELS.filter(l => !l.hidden).map(l => l.id);
class Store { constructor(o = {}) { this.m = new Map(Object.entries(o)); this.cap = Infinity; } get length() { return this.m.size; } key(i) { return [...this.m.keys()][i] ?? null; }
  getItem(k) { return this.m.has(k) ? this.m.get(k) : null; } removeItem(k) { this.m.delete(k); }
  used() { let n = 0; for (const [k, v] of this.m) n += k.length + v.length; return n; }
  setItem(k, v) { const was = this.m.has(k) ? k.length + this.m.get(k).length : 0; if (this.used() - was + k.length + String(v).length > this.cap) { const e = new Error('quota'); e.name = 'QuotaExceededError'; throw e; } this.m.set(k, String(v)); } }
const K = CS.slotKey;
const save = (extra = {}) => { const p = migrateProgress(null).progress; Object.assign(p, { hero: 'knight', heroes: { knight: true }, coins: 5 }, extra); return JSON.stringify(p); };

// ---------- A. the roster is the account ----------
{
  const slotA = save({ hero: 'pyro', heroes: { knight: true, pyro: true }, bossDown: { unburied: true } }), slotB = save({ hero: 'warden', heroes: { warden: true } });
  const st = new Store({ [K(0)]: slotA, [K(1)]: slotB });
  const r = loadRoster(st, () => [slotA, slotB]);
  ok(r.state === 'migrated' && r.heroes.includes('pyro') && !r.heroes.includes('paladin'), 'A: the first boot seeds the roster from every slot: ' + r.heroes);
  ok(r.feats.join() === 'boss:unburied', 'A: ...and the hero-gating feats done in any slot (the Blood Knight in slot 1): ' + r.feats);
  ok(rosterOwned(st).includes('pyro'), 'A: a page that does not run the game reads the roster from the storage');
  /* slot B never owned pyro: only the roster gives him to it */
  const own = JSON.parse(slotB);
  ok(!CS.heroesOf(own).includes('pyro'), 'A: slot B alone does not own pyro');
  ok(CS.heroesOf(own, rosterOwned(st)).includes('pyro') && CS.heroesOf(own, rosterOwned(st)).includes('warden'), 'A: with the roster slot B has pyro and keeps its own warden');
  ok(CS.heroesOf({}, rosterOwned(st)).includes('pyro'), 'A: an EMPTY (new) slot has him too');
  ok(CS.slotSummary(slotB, CAMP, rosterOwned(st)).heroes.includes('pyro') && !CS.slotSummary(slotB, CAMP).heroes.includes('pyro'), 'A: the slot summary (the guest picker) lists him through the roster only');
  /* a hero unlocked LATER in slot A (the real buy path ends in saveProgress -> rosterNote -> noteRoster) is in slot B's world at once */
  const cur = { heroes: r.heroes, feats: r.feats, own: r.own };
  ok(r.own.includes('pyro') && r.own.includes('knight') && !r.own.includes('geomancer') && !r.own.includes('paladin'), 'A: the OWNED list is what a save really owns: pyro and the knight, NOT the starters nobody bought: ' + r.own);
  ok(rosterOwned(st).join() === r.own.join() && !CS.heroesOf({}, rosterOwned(st)).includes('paladin'), 'A: a page that does not run the game reads the owned list (and not the pick list)');
  const add = noteRoster(st, cur, ['paladin', 'ranger'], ['boss:church']);
  ok(add.added.includes('paladin') && add.addedOwn.join() === 'ranger,paladin' && add.addedFeats.join() === 'boss:church' && add.ok, 'A: a hero bought and a feat earned later are added: ' + add.addedOwn + ' / ' + add.addedFeats);
  ok(rosterOwned(st).includes('paladin') && rosterOwned(st).includes('ranger') && !rosterOwned(st).includes('geomancer') && parseFeats(st.getItem(ROSTER_KEY)).includes('boss:church') && parseFeats(st.getItem(ROSTER_KEY)).includes('boss:unburied'), 'A: stored: the new heroes and BOTH feats (the old one is kept); an unbought starter is still not owned');
  ok(st.getItem(ROSTER_KEY + LASTGOOD) === st.getItem(ROSTER_KEY), 'A: ...and backed up');
  const none = noteRoster(st, add, ['paladin', 'knight'], ['boss:church']); ok(none.heroes === add.heroes && !none.added.length && !none.addedOwn.length && !none.addedFeats.length, 'A: nobody new, nothing written');
  ok(noteRoster(st, add, [], ['boss:warcairn']).addedFeats.join() === 'boss:warcairn', 'A: a feat alone (nobody bought him yet) is written');
  ok(rosterText(['pyro'], ['boss:nope']) === rosterText(['pyro']), 'A: an unknown feat is dropped; no feats writes the old shape');
  ok(HERO_FEATS.join() === 'boss:unburied,boss:church,boss:warcairn', 'A: the three hero feats');
  /* an OLD roster (before feats) still reads, and its heroes are kept */
  ok(parseRoster(JSON.stringify({ v: 1, heroes: ['pyro'] })).includes('pyro') && parseFeats(JSON.stringify({ v: 1, heroes: ['pyro'] })).length === 0, 'A: an old roster (no feats) reads as no feats');
  const oldSt = new Store({ [ROSTER_KEY]: JSON.stringify({ v: 1, heroes: ['reaper'] }) }); const lo = loadRoster(oldSt, () => []);
  ok(lo.state === 'ok' && lo.heroes.includes('reaper') && lo.feats.length === 0, 'A: an old roster loads as ok (feats empty)');
  ok(lo.own.join() === 'reaper' && parseOwn(oldSt.getItem(ROSTER_KEY)).join() === 'reaper', 'A: an old roster (no owned list) is upgraded: its non-starters were bought; the file now carries the list');
  const oldSl = new Store({ [ROSTER_KEY]: JSON.stringify({ v: 1, heroes: ['reaper'] }) }); ok(loadRoster(oldSl, () => [save({ heroes: { warden: true } })]).own.join() === 'warden,reaper', 'A: ...and the slots say which starters a save owns (warden)');
  /* damaged: restored from the last good copy WITH its feats */
  st.setItem(ROSTER_KEY, '{"heroes":['); const fix = loadRoster(st, () => []);
  ok(fix.state === 'restored' && fix.heroes.includes('paladin') && fix.feats.includes('boss:church'), 'A: a damaged roster is restored from its last good copy, feats included: ' + fix.state + ' ' + fix.feats);
  ok(st.getItem(ROSTER_KEY + CORRUPT) === '{"heroes":[', 'A: the damaged text is kept');
  /* damaged with no copy: REBUILT from the slots, feats too */
  st.setItem(ROSTER_KEY, 'junk'); st.removeItem(ROSTER_KEY + LASTGOOD); const rb = loadRoster(st, () => [slotA, slotB]);
  ok(rb.state === 'rebuilt' && rb.heroes.includes('pyro') && rb.feats.join() === 'boss:unburied', 'A: with no copy it is rebuilt from the slots (heroes and feats)');
  ok(heroesInSlots([slotA, slotB]).includes('pyro') && featsInSlots([slotA, slotB]).join() === 'boss:unburied' && featsInSlots(['{bad', null]).length === 0, 'A: the slot scans');
  /* a full disk: the roster is not written, the game still has it, no slot is touched */
  const full = new Store({ [K(0)]: slotA }); full.cap = full.used() + 5; const fr = loadRoster(full, () => [slotA]);
  ok(fr.heroes.includes('pyro') && fr.wrote === false && full.getItem(K(0)) === slotA, 'A: a full disk keeps the roster in memory and spares the slot');
  ok(STARTERS.every(h => rosterHeroes(new Store()).includes(h)), 'A: an empty storage still has the four starters');
}

// ---------- B. the co-op seat ----------
{
  const slotA = save({ hero: 'pyro', heroes: { knight: true, pyro: true } }), slotB = save({ hero: 'warden', heroes: { warden: true }, xp: { warden: xpFloor(5) } });
  const st = new Store({ [K(0)]: slotA, [K(1)]: slotB }); loadRoster(st, () => [slotA, slotB]);
  const seat = CS.seatFromSlot(st, 1, 'pyro', CAMP);
  ok(seat && seat.hero === 'pyro' && seat.heroes.includes('pyro') && seat.slot === 1, 'B: slot 2 seats pyro from the roster (his own save never owned him)');
  ok(levelOfXp(seat.view.xp.pyro || 0) === 0 && seat.base.xp === 0, 'B: ...at his own level 0 on this save (nothing is carried over)');
  const warden = CS.seatFromSlot(st, 1, 'warden', CAMP); ok(warden && levelOfXp(warden.view.xp.warden) === 5, 'B: the save\'s own hero is unchanged (level 5)');
  const empty = CS.seatFromSlot(st, 3, 'pyro', CAMP); ok(empty && empty.hero === 'pyro', 'B: an EMPTY slot seats a roster hero too');
  ok(!CS.heroesOf(JSON.parse(slotB), rosterOwned(new Store({ [K(1)]: slotB }))).includes('pyro'), 'B: without a roster entry slot 2 does not list pyro');
  /* the credit: a roster hero he played is adopted */
  const sn = CS.cleanSnapshot(CS.snapshotOf(JSON.parse(slotB), 'pyro', 1, rosterOwned(st))), led = CS.newLedger(sn, CS.newSid('ROST'));
  sn.view.xp.pyro = 300; const c = CS.nextCredit(led, null, true);
  const r = CS.applyCredit(st, K(1), c, { now: 1 }); const after = JSON.parse(st.getItem(K(1)));
  ok(r.ok && after.xp.pyro === 300 && after.heroes.pyro === true && after.heroes.warden === true, 'B: a credit for a roster hero is paid and the save adopts him (heroes.pyro)');
  const sn2 = CS.cleanSnapshot(CS.snapshotOf(JSON.parse(slotB), 'pyro', 1, rosterOwned(st))), led2 = CS.newLedger(sn2, CS.newSid('AIXP')); sn2.view.xp.pyro = 50; const c2 = CS.nextCredit(led2, null, true);
  const st2 = new Store({ [K(1)]: slotB }); loadRoster(st2, () => [slotA]); CS.applyCredit(st2, K(1), c2, { now: 2, xpOnly: true });
  ok(!JSON.parse(st2.getItem(K(1))).heroes.pyro, 'B: an xpOnly (AI companion) credit adopts nothing');
}

// ---------- C. no double charge, one source of truth (src/main.js) ----------
{
  const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  ok(/const owns = \(tab, id\) => godMode\(\) \|\| !!\(PROG\[tab\.owned\] && PROG\[tab\.owned\]\[id\]\) \|\| \(tab\.owned === 'heroes' && ROSTER_OWN\.includes\(id\)\);/.test(main), 'C: owns() reads the device roster for heroes');
  ok(/const heroOwned = id => godMode\(\) \|\| !!\(PROG\.heroes && PROG\.heroes\[id\]\) \|\| ROSTER_OWN\.includes\(id\);/.test(main), 'C: heroOwned = god | this save | the owned roster');
  const confirm = main.slice(main.indexOf('if (confirmPress && items.length) { const coop0'), main.indexOf("if (tab.key === 'hero' && !coop0 && coopOpen(PROG))"));
  ok(confirm.length > 1000 && confirm.indexOf('owned = k.consumable ? false : (k.id === \'none\' || owns(tab, k.id))') >= 0, 'C: the store confirm tests owns() (roster included)');
  const iOwn = confirm.indexOf('if (owned && tab.key)'), iBuy = confirm.indexOf('else if (k.silver)');
  ok(iOwn > 0 && iBuy > iOwn && confirm.indexOf('else if (owned)') > iOwn && confirm.indexOf('else if (owned)') < iBuy, 'C: an owned hero is equipped (never charged) before any buy branch is reached');
  ok(!/silverSpent\s*-=|silverSpent\s*=\s*\(?PROG\.silverSpent[^;]*-/.test(main), 'C: nothing refunds spent silver');
  ok(/function swapHeroTo\(id, quiet\) \{[^\n]*\n\s*if \(!heroOwned\(id\)\) return null;/.test(main), 'C: swapHeroTo takes any owned hero');
  ok(/owned = heroOwned\(id\), boost = owned && rosterCatching\(/.test(main), 'C: the swap panel\'s rows read heroOwned (and tag the catch-up)');
  ok(/if \(p === players\[0\]\) \{ if \(!heroOwned\(h\)\) return false;/.test(main) && /owns: h => heroOwned\(h\) \|\|/.test(main), 'C: the inn\'s seat (setSeatHero, owns) reads heroOwned');
  ok(/const tavHeroes = p => \(p\.n === 1 \? PICK\.filter\(h => heroOwned\(h\)\)/.test(main) && /const coopPickList = \(\) => PICK\.filter\(h => heroOwned\(h\)/.test(main), 'C: the wardrobe card and the co-op list read heroOwned');
  ok(/const bossSelectHeroes = \(\) => HEROES\.filter\(h => heroOwned\(h\.id\)\);/.test(main), 'C: boss select reads heroOwned');
  ok(/function setEquip\(key, id\) \{ if \(key === 'hero'\) adoptHero\(id\);/.test(main) && /function adoptHero\(id\) \{ if \(!id \|\| !ROSTER_OWN\.includes\(id\)/.test(main), 'C: a roster hero is adopted into the save the first time it plays him (never a dev godMode hero)');
  ok(/HR\.HERO_FEATS\.filter\(f => PROG\.bossDown && PROG\.bossDown\[f\.slice\(5\)\]\)/.test(main) && /const lockOfK = k => lockOf\(k, PROG, HEROES\.includes\(k\) \? featDoneH : featDone\);/.test(main), 'C: rosterNote writes the hero-gating feats; a hero\'s sale lock reads them');
  const heroFeats = [...main.matchAll(/^\s*\{ id: '(\w+)'[^\n]*feat: '(boss:\w+)'/gm)].map(m => m[2]), bz = /const BZ_WIN = \{[^}]*feat: '(boss:\w+)'/.exec(main);
  const all = new Set([...heroFeats.filter(f => f.startsWith('boss:')), ...(bz ? [bz[1]] : [])]);
  for (const f of ['boss:unburied', 'boss:church', 'boss:warcairn']) ok(all.has(f), 'C: ' + f + ' is a feat main.js HEROES carries');
  ok(/'SWAP HERO'\] : \['NEW GAME', 'CHOOSE A SAVE'\]/.test(main), 'C: the title has a SWAP HERO row only for a started save');
  ok(/k === 'SWAP HERO'\) \{ loadSlot\(slot\); applySkin\(\); applyUpgrades\(\); if \(!SWAPUI\.open\(\)\) SFX\.buzz\(\); \}/.test(main), 'C: the title row loads the current save and opens the swap panel');
  const tav = readFileSync(new URL('../src/tavern.js', import.meta.url), 'utf8');
  ok(/id: 'wardrobe', x: 40, name: 'SWAP HERO', verb: 'SWAP', first: 'SWAP HERO:/.test(tav), 'C: the tavern\'s wardrobe station is SWAP HERO (verb SWAP) with a first-visit line');
  const ctl = readFileSync(new URL('../src/controls.js', import.meta.url), 'utf8');
  ok(/\['swap hero', k1\('dance'\)/.test(ctl), 'C: the controls card names the swap keys');
}

// ---------- D. catch-up XP ----------
{
  const wood = (o = {}) => ({ n: 100, xp: 0, level: 1, wood: true, expected: 1, highestLevel: 0, ...o });
  /* a hero at or above the best: paid n */
  ok(xpGrant(wood({ xp: xpFloor(10), level: 10, expected: 10, highestLevel: 10 })).paid === 100, 'D: at the best hero\'s level: paid exactly n');
  ok(xpGrant(wood({ xp: xpFloor(12), level: 12, expected: 12, highestLevel: 10 })).paid === 100, 'D: above the best: paid n');
  /* below the best, in a wood whose curve is no help: x2 */
  const lo = xpGrant(wood({ xp: xpFloor(3), level: 3, expected: 3, highestLevel: 10 }));   /* at the wood's own curve (no x3), 7 levels behind the save's best */
  ok(lo.paid === 200 && lo.mul === XP_ROSTER, 'D: below the best hero (and not below the wood): x2: ' + JSON.stringify(lo));
  /* the grant is capped at the best's floor, and turns off exactly there */
  const gap = xpFloor(10) - (xpFloor(10) - 30), near = xpGrant(wood({ n: 100, xp: xpFloor(10) - 30, level: 9, expected: 9, highestLevel: 10 }));
  ok(gap === 30 && near.paid === 130, 'D: 30 XP from the best\'s level: n + 30 (capped at that floor), not n x 2: ' + near.paid);
  ok(xpFloor(10) - 30 + near.paid >= xpFloor(10) && levelOfXp(xpFloor(10) - 30 + near.paid) === 10, 'D: ...and that grant reaches the best\'s level');
  ok(xpGrant(wood({ xp: xpFloor(10), level: 10, expected: 9, highestLevel: 10 })).paid === 100, 'D: the moment he reaches it the bonus is off');
  ok(!rosterCatching(xpFloor(10), 10) && rosterCatching(xpFloor(10) - 1, 10) && !rosterCatching(0, 0), 'D: rosterCatching: off at the floor, on one XP below, off when the best is level 0');
  /* never above LV_MAX */
  ok(xpFloor(LV_MAX) === xpCap() && xpRosterCatchUp(1e6, xpFloor(LV_MAX) - 10, 99) === 1e6 + 10, 'D: a "best" above LV_MAX is clamped: the bonus stops at the L' + LV_MAX + ' floor');
  ok(xpRosterCatchUp(100, xpFloor(LV_MAX), 99) === 100, 'D: a hero at LV_MAX gets no bonus');
  /* never stacked with the x3 curve catch-up: the larger */
  const both = xpGrant(wood({ xp: 0, level: 0, expected: 10, highestLevel: 10 }));   /* below the wood (x3) AND below the best (x2) */
  ok(both.paid === 300 && both.mul === XP_CATCHUP, 'D: x3 curve and x2 roster both apply: the larger (x3), NOT x6: ' + JSON.stringify(both));
  ok(both.paid === xpCatchUp(100, 0, 10), 'D: ...exactly the old rule\'s grant');
  const curveSmall = xpGrant(wood({ n: 100, xp: xpFloor(5) - 10, level: 4, expected: 5, highestLevel: 12 }));   /* the curve's gap is 10: x3 would pay 110; the roster's x2 pays 200 */
  ok(curveSmall.paid === 200 && curveSmall.mul === XP_ROSTER, 'D: when the curve\'s catch-up is nearly done the roster\'s x2 is the larger: ' + JSON.stringify(curveSmall));
  const noBest = xpGrant(wood({ xp: 0, level: 0, expected: 10, highestLevel: 0 })); ok(noBest.paid === xpCatchUp(100, 0, 10), 'D: with no best hero above him it is only the old rule');
  /* the soft cap is applied first: an over-levelled wood still pays its fifth, doubled */
  const over = xpGrant(wood({ n: 100, xp: xpFloor(20), level: 20, expected: 5, highestLevel: 25 }));   /* L20 in a wood that expects 5: soft cap = 1/5 */
  ok(xpSoftCap(100, 20, 5) === 20 && over.paid === 40, 'D: over-levelled for the wood: the soft cap\'s 20, doubled to 40 (not 200): ' + over.paid);
  ok(xpGrant(wood({ n: 100, xp: xpFloor(20), level: 20, expected: 5, highestLevel: 20 })).paid === 20, 'D: ...and with no hero above him it is the soft cap alone');
  /* not a wood (the test hook): the raw pay, doubled below the best */
  ok(xpGrant({ n: 50, xp: 0, level: 0, wood: false, expected: 0, highestLevel: 5 }).paid === 100, 'D: outside a counted wood the roster x2 still holds, with no curve');
  ok(xpGrant({ n: 0, xp: 0, level: 0, wood: true, expected: 5, highestLevel: 5 }).paid === 0, 'D: nothing paid is nothing doubled');
  /* the XP never passes the level cap (main.js clamps with xpCap): the largest grant to a hero 1 XP under the cap is the cap */
  ok(xpFloor(LV_MAX) - 1 + Math.min(xpGrant(wood({ n: 10000, xp: xpFloor(LV_MAX) - 1, level: LV_MAX - 1, expected: 60, highestLevel: LV_MAX })).paid, xpCap() - (xpFloor(LV_MAX) - 1)) === xpCap(), 'D: never past xpCap');
}

if (fails.length) { console.error(fails.length + ' FAILED:\n - ' + fails.join('\n - ')); process.exit(1); }
console.log('ok  hero-account  the roster is the account (heroes and feats, backups, co-op seat, credit adoption); no double charge (source); catch-up XP x2 / x3 max, capped, never stacked');
