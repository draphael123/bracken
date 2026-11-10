// src/charms2.js - EIGHT NEW CHARMS (claude/charms2; plan passiveplan.md sec 5 / lane 5). Pure data and numbers, no game, no page.
//
// STILL ONE CHARM WORN, PER HERO: PROG.charmOf[h] / PROG.charm, bought in the store's CHARMS tab, owned in PROG.charms. A charm is locked by its
// own gate like every other line of the store (src/store.js lockOf): `needs` (a level cleared) or `feat` (main.js featDone).
//
// THE WHOLE THING SHIPS DARK: CHARMS2_SHIP is false, and while it is false rows() is [] (the shop is exactly today's six), worn() answers
// null for every new id (so a stray 'thorn' in a save does nothing), the multipliers are exactly 1 and noteDeath / noteSecret write nothing.
// It flips only after the icon pass merges (art before live: the icons are art.js bakeCharms, thorn..pilgrim).
//
// RULE (plan sec 5): no charm adds damage or mitigation beyond the existing IRON CHARM tier (a fifth less taken); no flask charms (bosses are
// tuned WITH flasks). So HOUND'S TOOTH never touches a boss or a mini-boss, GAMBLER'S COIN is a gold-for-risk trade, and THORN CHARM is one point.
//
// DUPLICATES (plan risk 5): STONE CHARM overlaps the UNFLINCHING / IRONCLAD family only for the hero who has them; here it is a small-blow charm
// for anyone, a sidegrade, and those traits stay as they are. PILGRIM'S KNOT is an XP charm next to the roster catch-up (xp.js xpGrant x2 below the
// best hero): it adds +15% only inside the same 5-level gap and never stacks past the cap, so it is the sidegrade to the roster rule.
export const CHARMS2_SHIP = false;
let ship = CHARMS2_SHIP;
export const setCharms2Ship = v => { ship = !!v; return ship; };   /* tools and the lab only: the shipped value is CHARMS2_SHIP */
export const charms2Ship = () => ship;

/* THE EIGHT. price in gold. Exactly one of needs / feat. needsName / featName are the words the store shows ('clear X first' / 'X to earn it'). */
export const CHARMS2 = [
  { id: 'thorn',   name: 'THORN CHARM',     price: 80,  desc: 'a foe whose blade lands on you takes 1 back. melee only',                 feat: 'wood',       featName: 'clear the Lumber Trail' },
  { id: 'stone',   name: 'STONE CHARM',     price: 80,  desc: 'small blows no longer knock you back. they still hurt',                    needs: 'stockade',   needsName: 'the Stockade' },
  { id: 'hound',   name: "HOUND'S TOOTH",   price: 90,  desc: 'the first blow on an unhurt foe lands 15% harder. never a boss',           feat: 'medals:15',  featName: 'win 15 medals' },
  { id: 'gambler', name: "GAMBLER'S COIN",  price: 70,  desc: 'a quarter more gold, and a tenth more damage taken',                       needs: 'moor',       needsName: 'Gale Moor' },
  { id: 'salt',    name: 'SALT CHARM',      price: 40,  desc: 'your dropped purse shows on the map and the edge of the screen, and glows. a comfort, not a buff', feat: 'deaths:10', featName: 'fall 10 times' },
  { id: 'quiet',   name: 'QUIET BOOTS',     price: 90,  desc: 'foes notice you 30% later: ambushes, sleepers',                            needs: 'spire',      needsName: 'the Monastery' },
  { id: 'lantern', name: 'LANTERN CHARM',   price: 80,  desc: 'breakable walls and secrets glint within 6 tiles',                         feat: 'secrets:10', featName: 'find 10 secrets' },
  { id: 'pilgrim', name: "PILGRIM'S KNOT",  price: 100, desc: '15% more XP while this hero is 5 or more levels below your best hero',     feat: 'heroes:3',   featName: 'own 3 heroes' },
];
export const CHARM2_IDS = CHARMS2.map(c => c.id);
export const rows = () => ship ? CHARMS2.map(c => ({ ...c })) : [];
/* the new charm a save is wearing, or null: flag off = null for every id, so the hook sites below are inert and the base six read PROG.charm as before */
export const worn = charm => ship && CHARM2_IDS.includes(charm) ? charm : null;

/* ---- THE NUMBERS (one place; tools/charms2.mjs reads them) ---- */
export const THORN_BACK = 1;                    /* hit points a melee attacker takes back */
export const STONE_SMALL = { share: 0.10, floor: 6 };   /* a blow is SMALL when it is <= max(floor, share of max hp), counted after the armour chain */
export const HOUND_MUL = 1.15;                  /* the first blow on a never-hit, non-boss, non-mini foe */
export const GAMBLER = { gold: 1.25, take: 1.10 };
export const QUIET_SIGHT = 0.70;                /* a foe's notice radius x 0.7 = "30% later" */
export const LANTERN_TILES = 6;
export const PILGRIM = { gap: 5, mul: 1.15 };

export const smallBlow = (dmg, maxHp) => dmg <= Math.max(STONE_SMALL.floor, Math.round((maxHp || 0) * STONE_SMALL.share));
export const houndMul = (charm, e) => worn(charm) === 'hound' && e && !e.maxHp && !e.mini && !e.c2Bit ? HOUND_MUL : 1;
export const takeMul = charm => worn(charm) === 'gambler' ? GAMBLER.take : 1;
export const sightMul = charm => worn(charm) === 'quiet' ? QUIET_SIGHT : 1;
export const pilgrimMul = (charm, level, bestLevel) => worn(charm) === 'pilgrim' && bestLevel - level >= PILGRIM.gap ? PILGRIM.mul : 1;
/* GAMBLER's gold: the extra whole coins for `n` picked up; the fraction waits in `st.frac` so four coins pay five and nothing is lost to rounding */
export function goldExtra(charm, st, n) { if (worn(charm) !== 'gambler' || !(n > 0)) return 0; st.frac = (st.frac || 0) + n * (GAMBLER.gold - 1); const w = Math.floor(st.frac + 1e-9); st.frac -= w; return w; }
/* THORN: the foe took the blow in melee: the hit is on the body (no hazard share, no projectile), within a blade's reach */
export const thornHits = (charm, { who, pct = 0, geo = false, dist = 0 } = {}) => worn(charm) === 'thorn' && !!who && !(pct > 0) && !geo && dist < 44;
export const thornDamage = () => THORN_BACK;
/* LANTERN: is a wall / secret at (dx, dy) pixels inside the glint range */
export const lanternNear = (charm, dx, dy, ts = 16) => worn(charm) === 'lantern' && Math.hypot(dx, dy) <= LANTERN_TILES * ts;

/* ---- THE FEATS the new charms add to main.js's featDone (kind:N), and the counters behind them (PROG.c2, written only with the flag on) ---- */
export const featKinds = ['deaths', 'secrets', 'heroes'];
export const isFeat = f => featKinds.includes(String(f || '').split(':')[0]);
export const featNeed = f => +String(f).split(':')[1] || 0;
export const c2 = prog => { if (!prog.c2 || typeof prog.c2 !== 'object' || Array.isArray(prog.c2)) prog.c2 = { deaths: 0, secrets: {} }; if (!prog.c2.secrets || typeof prog.c2.secrets !== 'object') prog.c2.secrets = {}; if (!Number.isFinite(prog.c2.deaths)) prog.c2.deaths = 0; return prog.c2; };
export const deathsOf = prog => Number.isFinite(prog && prog.c2 && prog.c2.deaths) ? prog.c2.deaths : 0;
export const secretsOf = prog => prog && prog.c2 && prog.c2.secrets && typeof prog.c2.secrets === 'object' ? Object.keys(prog.c2.secrets).length : 0;
export const noteDeath = prog => { if (!ship) return false; c2(prog).deaths = Math.min(9999, deathsOf(prog) + 1); return true; };
export const noteSecret = (prog, key) => { if (!ship || !key) return false; const s = c2(prog).secrets; if (s[key]) return false; if (Object.keys(s).length >= 200) return false; s[key] = 1; return true; };
/* facts: { heroes: how many heroes the player owns } */
export const featDone = (f, prog, facts = {}) => { const k = String(f).split(':')[0], n = featNeed(f);
  return k === 'deaths' ? deathsOf(prog) >= n : k === 'secrets' ? secretsOf(prog) >= n : k === 'heroes' ? (facts.heroes | 0) >= n : false; };
export const featProgress = (f, prog, facts = {}) => { const k = String(f).split(':')[0], n = featNeed(f), have = k === 'deaths' ? deathsOf(prog) : k === 'secrets' ? secretsOf(prog) : (facts.heroes | 0);
  return Math.min(have, n) + ' OF ' + n + ' ' + (k === 'deaths' ? 'FALLS' : k === 'secrets' ? 'SECRETS' : 'HEROES'); };
