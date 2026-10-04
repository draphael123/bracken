/* THE DEATH COST (Daniel, 2026-09-28: the Salt & Sanctuary / Shovel Knight direction).
   What you pick up between two shrines is UNBANKED: a death drops it, a shrine banks it. This file is the rules with no game in
   them - the save shape, the carry, the bundle, and where a bundle may lie - so tools/death-cost.mjs can hold them without a page.
     CARRIED   {coins, purse, xp} on the hero: coins = the level's gold count (`got`), purse = gold paid straight into the save
               (an elite, a shut room, a spoil), xp = the hero's XP. All three are already in the totals the rest of the game reads
               (PROG.coins at the end of a wood, PROG.xp now); "carried" is only how much of them is still at risk.
     BUNDLE    what a death took, one per hero at a time: {lv, hero, x, y, coins, purse, xp, foe, safe, mode}. `foe` is the xpKey of the
               creature that killed you (it carries the bundle, glowing, and drops it when it dies); with no foe it lies at `x,y`.
     SAVE      PROG.deathCost = {v, carried:{xp:{hero:n}, purse:n}, bundle}. An older save has none: normalize() gives it an empty one, so
               everything it already had counts as banked (nothing is ever taken from a save that did not know about this). */
export const DC_VERSION = 1;
const num = v => Number.isFinite(v) && v > 0 ? Math.round(v) : 0;
const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);
export const emptyCarry = () => ({ coins: 0, purse: 0, xp: 0 });
export const carryHas = c => !!c && (c.coins > 0 || c.purse > 0 || c.xp > 0);
export const freshDeathCost = () => ({ v: DC_VERSION, carried: { xp: {}, purse: 0 }, bundle: null });

/* A SAVE'S BUNDLE, judged: anything that is not a well-formed bundle is dropped (the amounts are whole and never negative; the place is a
   finite spot in a level), never thrown - a corrupt bundle must not lock the player out of a save. */
export function cleanBundle(b) {
  if (!isObj(b) || typeof b.lv !== 'string' || !b.lv || typeof b.hero !== 'string' || !b.hero) return null;
  if (!Number.isFinite(b.x) || !Number.isFinite(b.y)) return null;
  const out = { lv: b.lv, hero: b.hero, x: Math.round(b.x), y: Math.round(b.y), coins: num(b.coins), purse: num(b.purse), xp: num(b.xp), foe: typeof b.foe === 'string' && b.foe ? b.foe : null, mode: b.mode === 'foe' && typeof b.foe === 'string' && b.foe ? 'foe' : 'spot' };
  out.safe = isObj(b.safe) && Number.isFinite(b.safe.x) && Number.isFinite(b.safe.y) ? { x: Math.round(b.safe.x), y: Math.round(b.safe.y) } : { x: out.x, y: out.y };
  return out.coins || out.purse || out.xp ? out : null;
}
/* THE MIGRATION. Sets p.deathCost to a clean one (keeping what a newer save already holds) and says whether it had to. Old saves have
   nothing carried and no bundle: every coin and every point of XP they hold is banked. */
export function normalizeDeathCost(p) {
  const had = isObj(p.deathCost) && p.deathCost.v === DC_VERSION, d = isObj(p.deathCost) ? p.deathCost : {}, out = freshDeathCost();
  if (isObj(d.carried)) { if (isObj(d.carried.xp)) for (const h of Object.keys(d.carried.xp)) { const n = Math.min(num(d.carried.xp[h]), num((p.xp || {})[h])); if (n) out.carried.xp[h] = n; }
    out.carried.purse = Math.min(num(d.carried.purse), num(p.coins)); }
  out.bundle = cleanBundle(d.bundle); if (num(d.told)) out.told = num(d.told);   /* (how many times the game has SAID what a death costs: it says it twice, not every death) */
  const changed = !had || JSON.stringify(out) !== JSON.stringify(d);
  p.deathCost = out; return changed;
}

/* THE BANK'S STAKE (LEVELING, Daniel 2026-10-03: the gold half of the death cost was ~0.5% of the bank after wood 8 - no bite). A death also puts
   this much of the BANKED gold into the bundle: a quarter of everything over STAKE_FLOOR, never more than STAKE_MAX. It comes back with the
   bundle like the rest, and is lost with it. bank = the save's gold not already carried. */
export const STAKE_FLOOR = 500, STAKE_SHARE = 0.25, STAKE_MAX = 300;
export const bankStake = bank => Math.min(STAKE_MAX, Math.round(STAKE_SHARE * Math.max(0, num(bank) - STAKE_FLOOR)));
/* THE DROP. What a death takes out of the totals, and what is left: the bundle holds exactly what left them. XP can never take a hero
   under what he banked (the carried part is always the part above the last shrine), and the purse can never go below zero. */
export function drop(carry, totals) {
  const coins = Math.min(num(carry.coins), num(totals.got)), purse = Math.min(num(carry.purse), num(totals.purse)), xp = Math.min(num(carry.xp), num(totals.xp));
  return { coins, purse, xp, got: num(totals.got) - coins, purseLeft: num(totals.purse) - purse, xpLeft: num(totals.xp) - xp };
}

/* WHERE A BUNDLE MAY LIE, on a level's own grid. Standing room = a solid tile with two clear ones over it (the hero is ~14px, a
   tile is 16: one clear row is enough to stand, two is what the bundle wants so its bag is not inside a ceiling). solid(tx,ty) and
   spike(tx,ty) are the game's own tests. */
export const TSZ = 16;
export function standing(tx, ty, solid, spike) { return solid(tx, ty) && !spike(tx, ty) && !solid(tx, ty - 1) && !solid(tx, ty - 2) && !spike(tx, ty - 1); }
/* A BOSS NEVER CARRIES ONE: it lies at his arena door. The door is the arena's trigger column (where the fight starts); the row is the
   first standing place going down from a little above the last shrine (or the arena floor); if the column has none, the columns
   either side in turn (out to ten back toward the shrine: THE GARGOYLE's room has spikes for a floor, so its door is the shrine's ledge). Returns {x,y} (feet, pixels) or null (a flight arena has no floor: the caller falls back to the shrine). */
export function doorSpot(A, cp, solid, spike, H) {
  if (!A || A.carpet) return null;
  const bx = A.trigger !== undefined ? A.trigger : A.x0; if (!Number.isFinite(bx)) return null;
  const row0 = Math.floor(((cp && Number.isFinite(cp.y) ? Math.min(cp.y, Number.isFinite(A.floor) ? A.floor : cp.y) : A.floor) - 1) / TSZ) - 3;
  const c0 = Math.floor(bx / TSZ);
  for (const dx of [0, -1, 1, -2, 2, -3, 3, -4, 4, -5, -6, -7, -8, -9, -10]) for (let ty = Math.max(2, row0); ty < Math.min(H - 1, row0 + 24); ty++)
    if (standing(c0 + dx, ty, solid, spike)) return { x: (c0 + dx) * TSZ + 8, y: ty * TSZ };
  return null;
}
