// src/gq6geo.js - GQ6GEO + GQ6CALL: MORE GOBLIN GEOMANCERS IN HIGHCROWN, AND THEIR SECOND ATTACK (Daniel 11-13, scratch/brief-gq6-1113.md item 6; plan scratch/lane-reports/gq6-plan.md section C).
// TWO SWITCHES, each default OFF (OFF = master's Highcrown cell for cell, foe for foe):
//   GQ6GEO_SHIPS   (slice S1, placement) three more Geomancers: THE CRAG WALK (a pier ledge over the climb at 128), THE BAKEHOUSE YARD (a pier ledge over the yard's top walk at 295),
//                  THE KEEP (a chain landing in the tall hall at 400). Level data only (src/gobgeo-level.js); no new art, no new rule. 10 -> 13 Geomancers.
//   GQ6CALL_SHIPS  (slice S4, the attack) THE GEODE CALL: the Queen's portal boulder, borrowed. Told 0.8 s (the aim locks at 0.5 s), the stone falls 0.6 s on the told spot, bursts into two
//                  HANGING SHARDS; any hero blow or shot sends one home to him (stagger 1.4 s + his own rock's damage). Rules in src/gob-geomancer.js, hands in src/gobgeo-hands.js.
//                  ART BEFORE LIVE: this flag cannot ship until the art lane has drawn the two poses (scratch/lane-reports/gq6geo.md lists them).
// The override for review and the lanes: ?gq6geo=1 / ?gq6call=1 on the page, globalThis.BRACKEN_GQ6GEO / BRACKEN_GQ6CALL = true (tools/cdp.mjs sets them from the env), or the same names = '1' in a Node tool's env.
export const GQ6GEO_SHIPS = true;
export const GQ6CALL_SHIPS = false;
function flag(ships, name, query) {
  /* the lab OFF override (GQ6GEO ships ON since batch184): ?gq6geo=0 / globalThis.BRACKEN_GQ6GEO = false or '0' / env =0 = the old Highcrown cell for cell */
  try { if (globalThis[name] === false || globalThis[name] === '0') return false; } catch { /* no global */ }
  try { if (typeof location !== 'undefined' && new RegExp('[?&]' + query + '=0(?![0-9])').test(location.search || '')) return false; } catch { /* no page */ }
  try { if (typeof process !== 'undefined' && process.env && process.env[name] === '0') return false; } catch { /* no node */ }
  if (ships) return true;
  try { if (globalThis[name] === true || globalThis[name] === '1') return true; } catch { /* no global */ }
  try { if (typeof location !== 'undefined' && new RegExp('[?&]' + query + '=1(?![0-9])').test(location.search || '')) return true; } catch { /* no page */ }
  try { if (typeof process !== 'undefined' && process.env && process.env[name] === '1') return true; } catch { /* no node */ }
  return false;
}
export const gq6geoOn = () => flag(GQ6GEO_SHIPS, 'BRACKEN_GQ6GEO', 'gq6geo');
export const gq6callOn = () => flag(GQ6CALL_SHIPS, 'BRACKEN_GQ6CALL', 'gq6call');
export const G6GEO = gq6geoOn();
export const G6CALL = gq6callOn();

/* THE THREE PERCHES (S1). row = the row he stands on; ledge = [x0, x1, floorRow] (one-way tiles he stands on); sup = the stone piers / chain under it (drawn by src/redraw/highcrown2_art.js).
   All three sit OFF the route, 5-7 rows over it (unreachable by a plain jump, like the early sightings 86 / 366): a hero is never forced into melee with him; his rock goes back, he is hurt. */
export const GEO6 = {
  CRAG: { geo: 140, row: 42, ledge: [138, 142, 43], pier: 48, sign: [126, 53], early: true, leash: 8, sight: 300 },       /* over the climb to the tower block: sees the plank bridge and the ramp */
  BAKE: { geo: 300, row: 39, ledge: [298, 302, 40], pier: 45, sign: [285, 55], early: true, leash: 8, sight: 300 },       /* over the yard's top walk: sees the climb's upper half and the walk down the east side */
  KEEP: { geo: 406, row: 40, ledge: [404, 408, 41], chainTop: 33, sign: [416, 45], early: false, leash: 8, sight: 340 },   /* the tall hall's chain landing over the switchback's long walk; the first to use THE GEODE CALL */
};

/* THE GEODE CALL (S4) - the numbers (starting values for the tune lane) */
export const GCALL = {
  tell: 0.8, lockAt: 0.5,          /* the windup; the landing ring stops following you 0.5 s in (0.3 s of warning with a fixed ring) */
  fall: 0.6, r: 14, dmg: 9,        /* the stone's fall; its landing radius (px, either side) and the blow */
  hang: 1.2, shards: 2, dx: 13,    /* the two hanging shards: how long they hang, how many, how far either side of the landing */
  stagger: 1.4,                    /* a shard sent home: his stagger (s); the damage is his own rock's (src/gob-geomancer.js geoStruck) */
  minDist: 60, air: 4,             /* he calls only if you are >= 60 px away and have >= 4 rows of air over your head */
  every: 4, phase: 2,              /* it replaces the throw where n % 4 == 2 */
  perGeo: 1, level: 2,             /* at most one live call per Geomancer, two across the level */
  scale: 0.6,                      /* the Queen's portal boulder, drawn at 0.6x */
  shardR: 9,                       /* the blow box round a hanging shard (the Queen's Q4N.shardHurt) */
  home: 320,                       /* a shard sent home flies at the send-back speed (GG.back.v) */
};
