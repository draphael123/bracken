/* src/campaign-kit.js - A HERO AS A PLAYER ARRIVING AT A LEVEL (claude/levelpilot). ONE place for what tools/level-walk.mjs gives its walker and
   the playtest jump (?level=<id>&campaign=1, docs/PLAYTEST.md) gives Daniel: the level's campaign level, the typical build (perks, skills in the
   slots), the smith's gear of every level beaten before it, the tonics and charm. Pure apart from the page globals it is handed (BKT, BK). */
import { depthsOf, gateOf } from './campaign-order.js';
import { levelOfXp } from './xp.js';
import * as B from './bot-profile.js';
import * as PR from './progression.js';
import { actOf } from './foe-react.js';
import { FLASK } from './survival.js';
import * as F2 from './flasks2.js';
export const LV_FLOOR = 3;
export const beatenBeforeIn = (levels, id) => { const by = Object.fromEntries(levels.map(l => [l.id, l])), out = []; let p = gateOf(by[id]); while (p && !out.includes(p)) { out.push(p); p = gateOf(by[p]); } return out; };
export const tonicsAt = d => d <= 1 ? 1 : d < 8 ? 3 : 5;
export const charmAt = d => d >= 4 ? 'heart' : null;
/* (claude/survival2, A10b) THE SMITH'S EXTRA FLASKS a player who buys them has by now (PROG.flaskUp): none in act I (1 flask), one from act II (2),
   both from act III on (3). (tonicsAt is kept for the walker's report column: the red tonic itself is gone, refunded on load) */
export const flaskUpAtOld = (id, d) => Math.min(2, Math.max(0, actOf(id, d).act - 1));   /* (the survival2 rule, kept for the before/after tables) */
/* (claude/flasks2, Daniel 10-08) THE TYPICAL FLASK BUILD - the CAMPAIGN KIT's flasks, what B6 tunes every boss WITH (src/flasks2.js typicalFlaskKit):
     EXTRA FLASK I from depth 3, EXTRA FLASK II once the Goblin Queen (crown) is beaten  -> 1 flask to depth 2, 2 to Highcrown, 3 after it
     RICH DRAUGHT once the Stockade is beaten (40%), DISTILLED once the Underwater Keep is beaten (45%); the card's RICH FLASK (+10, the typical L5 pick) on top
     QUICK DRAUGHT from act II (0.5 s drink), SHRINE BLESSING from act III. The hidden three are never typical.
   beaten: the level ids cleared before this one (beatenBeforeIn). */
export const flaskKitAt = (id, d, beaten = []) => F2.typicalFlaskKit({ depth: d, beaten, act: actOf(id, d).act });
export const flaskUpAt = (id, d, beaten = []) => F2.countOf({ flaskItems: flaskKitAt(id, d, beaten) });
export const flasksAt = (id, d, beaten = []) => FLASK.base + flaskUpAt(id, d, beaten);
/* the campaign level, as tools/boss-level.mjs campaignLevel: the higher of the depth and the level the road before it banks (xpRows = tools/fixtures/campaign-xp.json .rows), never under L3 */
export function campaignLevelIn(levels, id, xpRows) {
  const by = Object.fromEntries(levels.map(l => [l.id, l])), d = depthsOf(levels)[id] ?? 1; let xb = 0, seen = new Set(), p = gateOf(by[id]);
  while (p && !seen.has(p)) { seen.add(p); const r = xpRows && xpRows[p]; if (!r) { xb = null; break; } xb += r.run; p = gateOf(by[p]); }
  return Math.max(LV_FLOOR, d, xb === null ? 0 : levelOfXp(xb));
}
/* BEFORE the body is made (BK.setHero + BK.reset({fresh:true})): the hero's level, card, skills and loadout, the gear, the charm. Returns the kit's skill ids. */
export function kitPre(BKT, BK, c) {
  const h = c.hero, lvl = c.lvl, P0 = BKT.PROG;
  BKT.setHeroLevel(h, lvl); P0.skillOwned = P0.skillOwned || {}; P0.loadouts = P0.loadouts || {}; P0.skillOwned[h] = {}; P0.loadouts[h] = []; if (P0.talents) P0.talents[h] = {};
  P0.card[h] = B.typicalWalkCard(h, lvl, n => (PR.heroPerkAt(h, n) || {}).id);
  const kit = (B.TYPICAL_SKILLS[h] || []).filter(id => { const n = PR.skillFor(h, id); return n && n.active && n.level <= lvl; }).slice(0, PR.slotsAt(lvl)); for (const id of kit) P0.skillOwned[h][id] = true; P0.loadouts[h] = kit.slice();
  P0.items = P0.items || {}; for (const u of BK.UPGRADES) { if (u.consumable) continue; P0.items[u.id] = u.needs ? c.beaten.includes(u.needs) : c.depth >= 2; }
  P0.charmOf = P0.charmOf || {}; P0.charm = c.charm || null; P0.charmOf[h] = c.charm || null;
  P0.flaskItems = { ...(c.flaskItems || flaskKitAt(c.id, c.depth, c.beaten || [])) }; P0.flaskUp = c.flaskUp ?? F2.countOf(P0);   /* before the reset: BK.reset fills the flasks to flaskMax (claude/flasks2: the typical flask build) */
  return kit;
}
/* AFTER the reset: the tonics and coins, then the gear applied (the flasks are the game's own: BK.reset fills them to flaskMax) */
export function kitPost(BKT, BK, c) { const P0 = BKT.PROG; P0.tonics = c.tonics; P0.coins = c.coins; BK.applyUpgrades(); }
/* the whole config for a level and a hero (the walker's walkCfg numbers) */
export const kitCfg = (levels, id, hero, lvl, xpRows) => { const d = depthsOf(levels)[id] ?? 1; return { id, hero, lvl: lvl ?? campaignLevelIn(levels, id, xpRows), depth: d, beaten: beatenBeforeIn(levels, id), tonics: tonicsAt(d), flaskItems: flaskKitAt(id, d, beatenBeforeIn(levels, id)), charm: charmAt(d), coins: 60 * d }; };
