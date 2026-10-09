// src/flasks2.js - FLASKS 2 (claude/flasks2, Daniel 2026-10-08: "I like the flask system, but the number of flasks isn't clear - the abilities
// cover it up; store upgrades unlocked by criteria + hidden ones; a drinking animation so it's a risk"). Pure: no page, no DOM.
//
//   THE STORE'S FLASK TAB (store id 'flasks', main.js STORE_TABS; owned in PROG.flaskItems). Nine lines in three groups:
//     COUNT    EXTRA FLASK I (from the start; id 'tonic', the old store line), EXTRA FLASK II (THE GOBLIN QUEEN beaten: Highcrown cleared),
//              EXTRA FLASK III (HIDDEN: the FLASK SHARD in the Undercrown). Each is +1 flask: 1 to start, 4 at most. PROG.flaskUp stays the count
//              (survival.js flaskMax reads it) and is re-derived from the items on every load and buy.
//     POTENCY  RICH DRAUGHT (THE STOCKADE cleared: the Chieftain), DISTILLED DRAUGHT (THE UNDERWATER KEEP cleared: the Drowned King),
//              BOTTLED SUNLIGHT (HIDDEN: the Glass Sea's silver vault). The best one owned is the flask's heal, 50% at most. (Daniel 10-09: the level-up
//              card's RICH FLASK, minor perk 'tonic', is folded in: the card is SECOND DRAUGHT now - a flask also refills the stamina.)
//     PERKS    QUICK DRAUGHT (OBJECTIVE: clear any level without drinking) - the drink is ~0.5 s, not 0.75; STEADY HAND (HIDDEN: a Harvest Fair
//              cellar) - a blow interrupts the drink but the flask is not spilled; SHRINE BLESSING (OBJECTIVE: break 5 shrines) - a shrine reached
//              gives back TWO flasks, not one.
//   A LOCKED line shows its requirement; a HIDDEN one is '???' (name and text) until its find is picked up. Finding a hidden thing does not give
//   it: it puts it on the smith's list (bought with gold like the rest). GOD MODE (the assist guard) earns no objective.
//   OLD SAVES: PROG.flaskUp 1/2 (the old EXTRA FLASK line bought once/twice) becomes EXTRA FLASK I/II owned, whatever is beaten - a save keeps
//   every flask it had. Nothing else existed to migrate (the old RICH FLASK card pick keeps its id: it is SECOND DRAUGHT now).
//   THE CAMPAIGN KIT (src/campaign-kit.js) reads typicalFlaskKit: the flask build a typical player has bought by each point of the road.

export const POTENCY = { base: 0.35, cap: 0.50 };   /* +35% of max health a flask; the store's tiers only, 50% at most (Daniel 10-09: the card's RICH FLASK is folded in - it is SECOND DRAUGHT now, stamina) */
export const QUICK = { drinkT: 0.30, swallowAt: 0.20 };   /* GAME s: at game speed 0.6 the drink is 0.5 s on the clock, the swallow at 0.33 s (was 0.45 / 0.3) */
export const BLESSING_REFILL = 2;
export const SHRINES_FOR_BLESSING = 5;

/* the nine lines. req: { beat: <level id> } a level cleared | { find: <find id> } picked up | { obj: <objective id> } done. hidden: '???' until done */
export const FLASK_ITEMS = [
  { id: 'tonic', group: 'COUNT', name: 'EXTRA FLASK I', price: 150, count: 1, desc: 'one more red flask to carry. you start with one. a shrine gives one back, a death all.' },
  { id: 'extra2', group: 'COUNT', name: 'EXTRA FLASK II', price: 300, count: 1, req: { beat: 'crown', name: 'beat THE GOBLIN QUEEN (Highcrown)' }, desc: 'a second extra flask: three to carry with the first.' },
  { id: 'extra3', group: 'COUNT', name: 'EXTRA FLASK III', price: 450, count: 1, hidden: true, req: { find: 'flaskshard', name: 'find the FLASK SHARD' }, desc: 'made from the flask shard you found under the castle: one more flask to carry.' },
  { id: 'rich', group: 'POTENCY', name: 'RICH DRAUGHT', price: 200, heal: 0.40, req: { beat: 'stockade', name: "beat THE STOCKADE'S CHIEFTAIN" }, desc: 'a flask heals 40% of your health, not 35%.' },
  { id: 'distilled', group: 'POTENCY', name: 'DISTILLED DRAUGHT', price: 400, heal: 0.45, req: { beat: 'keep', name: 'beat THE DROWNED KING (the Underwater Keep)' }, desc: 'a flask heals 45% of your health.' },
  { id: 'sunlight', group: 'POTENCY', name: 'BOTTLED SUNLIGHT', price: 500, heal: 0.50, hidden: true, req: { find: 'sunlight', name: 'find the bottled sunlight' }, desc: 'the Glass Sea\'s light, stoppered: a flask heals 50% of your health.' },
  { id: 'quick', group: 'PERKS', name: 'QUICK DRAUGHT', price: 250, perk: true, req: { obj: 'dry', name: 'clear any level without drinking a flask' }, desc: 'the drink is quicker: about half a second, not three quarters. less time to be hit.' },
  { id: 'steady', group: 'PERKS', name: 'STEADY HAND', price: 300, perk: true, hidden: true, req: { find: 'steady', name: 'find the steady hand' }, desc: 'a blow still stops the drink, but the flask is not spilled: it goes back on your belt.' },
  { id: 'blessing', group: 'PERKS', name: 'SHRINE BLESSING', price: 250, perk: true, req: { obj: 'shrines5', name: 'break ' + SHRINES_FOR_BLESSING + ' shrines' }, desc: 'a shrine you reach gives back TWO flasks, not one.' },
];
export const COUNT_IDS = FLASK_ITEMS.filter(k => k.count).map(k => k.id);
export const FLASK_IDS = FLASK_ITEMS.map(k => k.id);
export const itemOf = id => FLASK_ITEMS.find(k => k.id === id) || null;
export const owned = (prog, id) => !!(prog && prog.flaskItems && prog.flaskItems[id]);

/* THE HIDDEN FINDS: placed at load (main.js flaskFindsAt), never written into a level's ents (no level hash moves). x, y in TILES: the find sits
   on that tile. Each one is beside a silver or behind a secret wall (tools/flasks2.mjs checks the tile is open and reached from the start or a silver). */
export const FINDS = [
  { id: 'flaskshard', level: 'undercrown', x: 128, y: 115, name: 'THE FLASK SHARD', line: 'A FLASK SHARD: THE SMITH CAN MAKE A THIRD EXTRA FLASK (STORE: FLASKS)' },
  { id: 'sunlight', level: 'glasssea', x: 593, y: 18, name: 'BOTTLED SUNLIGHT', line: 'BOTTLED SUNLIGHT: THE SMITH CAN BREW IT (STORE: FLASKS)' },
  { id: 'steady', level: 'fair', x: 334, y: 34, name: 'THE STEADY HAND', line: "A DRINKER'S GLOVE: THE SMITH SELLS STEADY HAND NOW (STORE: FLASKS)" },
];
export const findsIn = (levelId, prog) => FINDS.filter(f => f.level === levelId && !(prog && prog.flaskFinds && prog.flaskFinds[f.id]));

/* is a line's requirement met? (prog: PROG; a beaten level is PROG[id].cleared) */
export function reqDone(k, prog) {
  const r = k && k.req; if (!r) return true; prog = prog || {};
  if (r.beat) return !!(prog[r.beat] && prog[r.beat].cleared);
  if (r.find) return !!(prog.flaskFinds && prog.flaskFinds[r.find]);
  if (r.obj) return !!(prog.flaskObj && prog.flaskObj[r.obj]);
  return true;
}
/* the store's lock sentence (src/store.js lockOf shape): null when it may be bought */
export const lockText = (k, prog) => reqDone(k, prog) || owned(prog, k.id) ? null : k.hidden ? '???: something hidden, out in the woods' : k.req.name + ' to earn it';
/* a hidden line not yet found shows '???' */
export const shownAsHidden = (k, prog) => !!(k && k.hidden && !reqDone(k, prog) && !owned(prog, k.id));
export const displayName = (k, prog) => shownAsHidden(k, prog) ? '???' : k.name;

/* the count of extra flasks owned (PROG.flaskUp) and the heal share */
export const countOf = prog => COUNT_IDS.filter(id => owned(prog, id)).length;
export const tierHeal = prog => FLASK_ITEMS.filter(k => k.heal && owned(prog, k.id)).reduce((m, k) => Math.max(m, k.heal), POTENCY.base);
export const healPct = prog => Math.min(POTENCY.cap, tierHeal(prog));
/* the drink's timing: QUICK DRAUGHT owned, or the standard one (src/survival.js FLASK) */
export const drinkTimes = (prog, FLASK) => owned(prog, 'quick') ? { drinkT: QUICK.drinkT, swallowAt: QUICK.swallowAt } : { drinkT: FLASK.drinkT, swallowAt: FLASK.swallowAt };
export const shrineGives = prog => owned(prog, 'blessing') ? BLESSING_REFILL : 1;

/* OLD SAVES: PROG.flaskUp (0-2, the old consumable line) -> EXTRA FLASK I / II. Then flaskUp is the count of what is owned (never less than it was) */
export function migrate(prog) {
  if (!prog) return prog;
  const had = Math.max(0, prog.flaskUp | 0);
  if (!prog.flaskItems || typeof prog.flaskItems !== 'object') {
    prog.flaskItems = {};
    for (let i = 0; i < Math.min(had, COUNT_IDS.length); i++) prog.flaskItems[COUNT_IDS[i]] = true;
  }
  prog.flaskFinds = prog.flaskFinds && typeof prog.flaskFinds === 'object' ? prog.flaskFinds : {};
  prog.flaskObj = prog.flaskObj && typeof prog.flaskObj === 'object' ? prog.flaskObj : {};
  prog.shrinesBroken = Math.max(0, prog.shrinesBroken | 0);
  prog.flaskUp = countOf(prog);
  return prog;
}

/* THE OBJECTIVES. levelCleared: a level won with `drinks` flasks drunk in it (a death does not reset it). shrineBroken: one more broken. assist: God Mode
   on - nothing is earned. -> the ids newly earned (the caller tells the player) */
export function objLevelCleared(prog, { drinks = 0, assist = false, real = true } = {}) {
  if (assist || !real || drinks > 0 || !prog) return [];
  prog.flaskObj = prog.flaskObj || {}; if (prog.flaskObj.dry) return [];
  prog.flaskObj.dry = true; return ['dry'];
}
export function objShrineBroken(prog, { assist = false } = {}) {
  if (assist || !prog) return [];
  prog.shrinesBroken = (prog.shrinesBroken | 0) + 1; prog.flaskObj = prog.flaskObj || {};
  if (prog.shrinesBroken >= SHRINES_FOR_BLESSING && !prog.flaskObj.shrines5) { prog.flaskObj.shrines5 = true; return ['shrines5']; }
  return [];
}
export const OBJ_LINE = { dry: 'CLEARED WITHOUT A DRINK: QUICK DRAUGHT IS AT THE STORE (FLASKS)', shrines5: SHRINES_FOR_BLESSING + ' SHRINES BROKEN: SHRINE BLESSING IS AT THE STORE (FLASKS)' };

/* THE TYPICAL FLASK BUILD at a point of the campaign road (the CAMPAIGN KIT, B6: bosses are tuned WITH this). depth: the level's depth on the gate
   chain; beaten: the level ids cleared before it; act: its act (foe-react actOf). What a player who buys the smith's flask lines as they open has:
     EXTRA FLASK I    from depth 3 (the Stockade's gold buys it: 150)
     EXTRA FLASK II   once THE GOBLIN QUEEN (crown) is beaten
     RICH DRAUGHT     once THE STOCKADE is beaten;  DISTILLED DRAUGHT once THE UNDERWATER KEEP is beaten
     QUICK DRAUGHT    from act II (any level cleared dry - most players have one by then)
     SHRINE BLESSING  from act III (five shrines broken - it never acts in a boss fight)
   The HIDDEN ones (EXTRA FLASK III, BOTTLED SUNLIGHT, STEADY HAND) are never in the typical kit. */
export function typicalFlaskKit({ depth = 1, beaten = [], act = 1 } = {}) {
  const b = new Set(beaten), it = {};
  if (depth >= 3) it.tonic = true;
  if (b.has('crown')) it.extra2 = true;
  if (b.has('stockade')) it.rich = true;
  if (b.has('keep')) it.distilled = true;
  if (act >= 2) it.quick = true;
  if (act >= 3) it.blessing = true;
  return it;
}
/* a one-line read of a kit (the reports and the walker's table) */
export function kitLine(items) {
  const p = { flaskItems: items || {} };
  return (1 + countOf(p)) + ' flasks ' + Math.round(100 * healPct(p)) + '%' + (owned(p, 'quick') ? ' quick' : '') + (owned(p, 'blessing') ? ' blessing' : '') + (owned(p, 'steady') ? ' steady' : '');
}

/* THE HUD ROW (directly under the health and stamina bars, its own row: y 20-28 of the HUD-SLIM layout; never under the skill slots, which sit
   at x >= 70). n: the bottles drawn (max(max, held)); one bottle 8 px; then the count. -> { x, y, w, h, bottles: [{x, y, kind}] , num: {x, y, s} } */
export const ROW = { x: 4, y: 20, step: 8, h: 9, numGap: 2 };
export function rowLayout(held, max, { x = ROW.x, y = ROW.y, numW = 6 } = {}) {
  held = Math.max(0, held | 0); max = Math.max(0, max | 0); const n = Math.max(held, max), bottles = [];
  for (let i = 0; i < n; i++) bottles.push({ x: x + i * ROW.step, y, kind: i >= max ? 'over' : i < held ? 'full' : 'empty' });
  const s = String(held), nx = x + n * ROW.step + ROW.numGap;
  return { x: x - 2, y: y - 1, w: n * ROW.step + ROW.numGap + numW * s.length + 4, h: ROW.h + 2, bottles, num: { x: nx, y: y + 1, s } };
}

/* THE DRINK, phase by phase (el: game s since the drink began; T: drinkTimes). uncork -> tip and two gulps -> swallow (the heal) -> lower */
export function drinkPhase(el, T) {
  const sw = T.swallowAt, k = el / sw;
  if (el < sw * 0.3) return { ph: 'uncork', lift: 0.25 * (el / (sw * 0.3)), tip: 0 };
  if (el < sw) { const t = (el - sw * 0.3) / (sw * 0.7); return { ph: k < 0.65 ? 'gulp1' : 'gulp2', lift: 0.25 + 0.75 * Math.min(1, t * 1.6), tip: Math.min(1, t * 1.4) }; }
  const t = Math.min(1, (el - sw) / Math.max(0.01, T.drinkT - sw));
  return { ph: 'lower', lift: 1 - t, tip: 1 - t };
}
/* when the two glugs sound: shares of the swallow time */
export const GULPS = [0.5, 0.82];

/* WHERE THE FLASK IS HELD, per hero (the mouth, from his feet: dx forward, dy up), so the bottle meets each one's own face. The real drinking frames
   are the art lane's (a Sonnet pass): this is the placement the overlay uses until then. */
export const MOUTH = {
  knight: { dx: 3, dy: 21 }, pyro: { dx: 3, dy: 21 }, paladin: { dx: 3, dy: 22 }, pirate: { dx: 3, dy: 21 },
  reaper: { dx: 4, dy: 25 }, warden: { dx: 3, dy: 21 }, geomancer: { dx: 3, dy: 21 },
};
export const mouthOf = h => MOUTH[h] || MOUTH.knight;
