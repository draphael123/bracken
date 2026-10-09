// src/store.js - ONE STORE (claude/onestore, Daniel 2026-09-30: "just having ONE STORE that you can reach from the menu").
//
// There used to be three ways to spend coins: the walk-in shop rooms (THE STORE, THE HIGH STORE, THE CHANDLER - buy mode), the EQUIP board
// (the map's V, the pause menu's Equip - owned things only) and the skills tree (Q, the pause menu's Skills - a screen of its own).
// There is one now, and this file is its rules with no game in them, so tools/store.mjs can hold them without a page:
//
//   TABS     HEROES, SKINS, WEAPONS, CHARMS, SKILLS (the old tree and its loadout on F and G, with its live previews), then the
//            three the walk-in store also carried: SMITH, MUSIC, PRACTICE.
//   ENTRIES  every way in: the map (V for the store, Q for the skills tab), the wood (Q, skills tab), the pause menu (Store,
//            Skills) and the keeper's counter in a walk-in shop room. All of them call openStore() in main.js, and every one of
//            them is refused in a fight: not at a boss, not in a mini-boss room, not in a live ambush, not with a foe on you.
//   STOCK    the three walk-in rooms never had stock of their own: all three opened the same eight tabs, and every item that is held
//            back is held back by ITS OWN gate (a level cleared, a feat done, or silver). So the stock rule is "what you have reached",
//            for every door into the store alike, and the room you buy in is flavour (it picks the tab the store opens on).
//            A room is still reached through its own map node (the High Store wants Scree, the Chandler the Reef); that gates the
//            WALK, never a coin's worth of stock.
//   SPENDING the walk-in room was also where coins could be spent in safety (the death cost, src/death-cost.js, leaves what you
//            carry between two shrines at risk). So the store opens anywhere outside a fight, but BUYING (and slotting a skill) wants
//            the map, a shop room or a lit shrine: in the wood away from a shrine it is a window to equip and look through.
//
// Nothing here reads or writes a save: browsing costs nothing (tools/store.mjs compares the whole save before and after).

/* the tabs, in order. `id` is what a caller asks for; main.js's STORE_TABS carries the stock under the same ids. */
export const TABS = [
  { id: 'heroes',   name: 'HEROES' },
  { id: 'skins',    name: 'SKINS' },
  { id: 'weapons',  name: 'WEAPONS' },
  { id: 'charms',   name: 'CHARMS' },
  { id: 'skills',   name: 'SKILLS' },
  { id: 'smith',    name: 'SMITH' },
  { id: 'music',    name: 'MUSIC' },
  { id: 'practice', name: 'PRACTICE' },
];
export const TAB_IDS = TABS.map(t => t.id);

/* every way in (docs/ and tools/store.mjs list them): the place you are, and the tab you land on unless asked for another */
export const ENTRIES = {
  'map':        { tab: 'heroes', how: 'the world map: V' },
  'map-skills': { tab: 'skills', how: 'the world map: Q' },
  'wood-skills': { tab: 'skills', how: 'in a wood: Q' },
  'pause':      { tab: 'heroes', how: 'the pause menu: Store' },
  'pause-skills': { tab: 'skills', how: 'the pause menu: Skills' },
  'keeper':     { tab: 'heroes', how: "a walk-in store's counter: UP at the keeper" },
};

/* THE WALK-IN ROOMS OPEN THE SAME STORE, each on a tab that suits the room (flavour only: every tab is there in all three) */
export const SHOP_START = { shop: 'heroes', shopCrag: 'smith', shopSea: 'charms', shopWell: 'weapons' };   /* (claude/welltown: THE WELL STORE, the desert's room) */

export const tabIndex = id => Math.max(0, TAB_IDS.indexOf(id));
export const tabId = i => TAB_IDS[((i % TAB_IDS.length) + TAB_IDS.length) % TAB_IDS.length];
/* TAB or E (LB on a pad) is the next tab, Q (RB) the one before: the same keys the settings use. The strip wraps. */
export const stepTab = (i, dir) => ((i + dir) % TAB_IDS.length + TAB_IDS.length) % TAB_IDS.length;

/* WHY THE STORE WON'T OPEN: null when it may. `fight` is the game's own answer (a boss, a mini-boss room, a live ambush or a foe close by). */
export const STORE_REFUSAL = 'NOT IN A FIGHT';
export const refusal = ({ fight }) => fight ? STORE_REFUSAL : null;

/* WHERE COINS MAY BE SPENT. 'map' and 'shop' always; 'wood' only at a lit shrine with no fight (the rule the skills loadout has always had) */
export const mayBuy = ({ where, fight, atShrine }) => where === 'map' || where === 'shop' ? true : !fight && !!atShrine;
export const BUY_HINT = 'VIEW ONLY: BUY AT A SHRINE, MAP OR SHOP';
/* the footer of each page (drawn fitted): where buying is allowed, and where it is not */
export const STORE_HELP = {
  buy: 'L/R tabs  Z buy  ESC back',
  look: 'Z equip  buy at a shrine, map or shop',
  skills: 'TAB/Q tabs  L/R list  Z buy  F/G slot  X more',
  skillsLook: BUY_HINT,
  passives: 'PASSIVES COME WITH LEVELS',
};

/* WHAT HOLDS AN ITEM BACK. One place for the three locks a stock line can carry:
     needs  a level id that must be CLEARED (progress: PROG[id].cleared)    - the smith's better edges, the class heroes' levels
     feat   a feat string (featDone in main.js: 'boss:<level id>', 'medals:N', 'iron', or a level id cleared)
   Returns the sentence the store shows for the lock, or null when the item is open. `feat` is main.js's featDone. */
export function lockOf(k, prog, featDone) {
  if (k.needs && !(prog[k.needs] && prog[k.needs].cleared)) return 'clear ' + k.needsName + ' first';
  if (k.feat && !featDone(k.feat)) return k.featName + ' to earn it';
  return null;
}
