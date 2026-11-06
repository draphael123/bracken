// src/airship.js - THE DESERT AIRSHIP, desert act V level 12, the road's end (claude/airship, 11-06, the OPUS GREYBOX: geometry, the stoke/altitude rule, the COLD,
// the cast placement; code-only, NOT on the live road). Sources: scratch/brief-desertairship-1104.md (concept approved 10-14; '!! 10-16' foes + wyrmling),
// scratch/plan-desert-1105.md s1.12 / s3d (sandstorm visibility reuse) / s3h (DRAIN: COLD is the 3rd source) / s3i (the road insert) / s4 (theme). The plan wins.
//
// THE FLAG: AS_SHIPS = false. Off, src/level.js does not append the row: LEVELS is master's array exactly (no index, no save, no tool moves).
// On (?airship=1 on the page, globalThis.BRACKEN_AS, or AS=1 in a Node tool's env) the row is appended LAST and HIDDEN (no map node): ?airship=1&level=airship.
// THE ROAD INSERT (kingspyramid > airship, the road's end) is data in src/route-insert.js, live with AS_SHIPS (art before live).
//
// THE RULE: THE SHIP CLIMBS AS YOU FEED ITS BURNERS - HIGHER IS CLEAR AND COLD, LOWER IS WARM AND NEAR THE SAND.
//   STOKE  hold E (or UP) at a burner: it burns STOKE.fuel s and adds STOKE.lift to the ship's LIFT; the ship's ALTITUDE (0..1) follows the lift at ALT.rate
//          (~6 s floor to top, told: creaks, the horizon tilts, an arrow on the HUD). A VENT (a brass valve) dumps every burner: the ship settles LOW.
//   LOW    (alt < ALT.low)  the keel skims the dunes: THE KEEL BRUSH through the hold's breaches (a told sand blast); the LOW gangways line up.
//   HIGH   (alt >= ALT.high) the cloud line: the HIGH spars close the gaps aloft; the air is COLD (src/drain.js, the 2nd drain source after the sun;
//          floor 1 hp; warmth = a stoked burner or a brazier in reach). The cold counts in the air (gliders do not skip it).
//   The two bands exclude each other for the same gaps (what is open LOW is shut HIGH). No soft-lock: burners out = the ship settles LOW and stays,
//   every station stands on the always-solid deck or a fighting top reached by a ratline from it, no fall is a death (the hull is under every gap).
// SIX PARTS (columns): LAUNCH DECK 0-70 (teach) | CARGO HOLD 71-150 (LOW test) | RIGGING 151-250 (HIGH, platforming 1) | CLOUD LINE 251-340 (exam:
//   both bands twice, platforming 2 to 320, the wyrmlings 327-340) | THE BRIDGE 341-380 (breather, pre-boss shrine) | THE STORM DECK 381-424 (THE THUNDER WYRM).
// CHECKPOINTS: the start + two (the hold's stair head 152, the bridge 372). CAST: sky raiders (bandit reskins: cutthroat, slinger, archer - existing AIs),
// WYRMLINGS (src/wyrmling.js, the one new foe, SHOCK skin), the boss (src/thunder-wyrm.js). No goblins, no generic wood: a lacquered, brass-banded hull.

export const AS_SHIPS = false;
export function asOn() {
  if (AS_SHIPS) return true;
  try { if (globalThis.BRACKEN_AS === true || globalThis.BRACKEN_AS === '1') return true; } catch { /* no global */ }
  try { if (typeof location !== 'undefined' && /[?&]airship=1\b/.test(location.search || '')) return true; } catch { /* no page */ }
  try { if (typeof process !== 'undefined' && process.env && process.env.AS === '1') return true; } catch { /* no node */ }
  return false;
}
export const AS_RULE = 'THE SHIP CLIMBS AS YOU FEED ITS BURNERS. HIGH IS CLEAR AND COLD; LOW IS WARM AND NEAR THE SAND.';
export const AS_NAME = 'THE DESERT AIRSHIP';   /* working name (brief Q2: rec 'THE DUSKWING' for the ship - Daniel's pick) */
export const AS = { H: 40, D: 26, holdTop: 28, holdFloor: 34, W: 426 };   /* D: the main deck's floor row (feet on D - 1); the hold's air rows holdTop..holdFloor-1 */

/* ---- THE RULE'S NUMBERS ---- */
export const STOKE = { hold: 0.8, fuel: 25, lift: 0.5, reach: 18, dimAt: 6, ventHold: 0.6 };   /* hold: s of E to stoke; fuel: s a burner burns; lift: each stoked burner */
export const ALT = { rate: 1 / 6, low: 0.34, high: 0.66, hyst: 0.04, warnT: 1.2 };            /* rate: altitude a second; a band edge holds hyst either side (no flicker) */
export const COLD = { fill: 1 / 10, thaw: 0.6, ease: 0.15, drain: 0.012, floor: 1, warmR: 56 };   /* fill/s at HIGH; thaw/s warm; ease/s below HIGH; drain: max-hp share/s once full */
export const BRUSH = { tell: 0.9, hit: 0.35, rest: 1.8, dmg: 12 };                              /* THE KEEL BRUSH (LOW only): a shadow, then the sand through the breach */
export const AS_MEDALS = [300, 420, 600];   /* an ESTIMATE (~420 columns, two altitude climbs, a boss ~2 min); the tune lane times a real run */

export const band = a => a >= ALT.high ? 'high' : a < ALT.low ? 'low' : 'mid';

/* ---- THE SHIP (pure): stations [{ id, x (px), y (px, feet), kind: 'stoke' | 'vent', lift }]; alt follows the stoked lift ---- */
export function newShip(stations, alt = 0) {
  return { alt, target: alt, stations: stations.map(s => ({ lift: STOKE.lift, kind: 'stoke', ...s, fuel: 0, prog: 0 })), vented: 0, bands: { high: alt >= ALT.high, low: alt < ALT.low } };
}
export const lift = ship => Math.min(1, ship.stations.reduce((a, s) => a + (s.kind === 'stoke' && s.fuel > 0 && !s.dead ? s.lift : 0), 0));
/* a hero's hold at a station: prog fills over STOKE.hold; full -> it fires. -> 'stoked' | 'vented' | null */
export function holdAt(ship, s, dt) {
  s.prog += dt;
  if (s.kind === 'vent') { if (s.prog >= STOKE.ventHold) { s.prog = 0; for (const q of ship.stations) q.fuel = 0; ship.vented++; return 'vented'; } return null; }
  if (s.prog >= STOKE.hold) { s.prog = 0; s.fuel = STOKE.fuel; s.dead = false; return 'stoked'; }
  return null;
}
/* the ship's frame: the fuel burns, the altitude follows the lift; the bands flip with hysteresis. -> events [{ ev: 'high'|'unhigh'|'low'|'unlow'|'out', id }] */
export function shipStep(ship, dt) {
  const out = [];
  for (const s of ship.stations) { if (s.kind !== 'stoke') continue; if (!(s.prog > 0)) s.prog = 0; if (s.fuel > 0) { s.fuel = Math.max(0, s.fuel - dt); if (s.fuel === 0) out.push({ ev: 'out', id: s.id }); } }
  ship.target = lift(ship);
  const d = ship.target - ship.alt, st = ALT.rate * dt; ship.alt = Math.abs(d) <= st ? ship.target : ship.alt + Math.sign(d) * st;
  const b = ship.bands;
  if (!b.high && ship.alt >= ALT.high) { b.high = true; out.push({ ev: 'high' }); } else if (b.high && ship.alt < ALT.high - ALT.hyst) { b.high = false; out.push({ ev: 'unhigh' }); }
  if (!b.low && ship.alt < ALT.low - ALT.hyst) { b.low = true; out.push({ ev: 'low' }); } else if (b.low && ship.alt >= ALT.low) { b.low = false; out.push({ ev: 'unlow' }); }
  return out;
}
/* a band is ABOUT TO GO (told: its pieces blink) - the lift is under its edge and the ship is moving out of it within ALT.warnT s */
export function bandLeaving(ship, which) {
  if (which === 'high') return ship.bands.high && ship.target < ALT.high - ALT.hyst && (ship.alt - (ALT.high - ALT.hyst)) / ALT.rate < ALT.warnT;
  return ship.bands.low && ship.target >= ALT.low && (ALT.low - ship.alt) / ALT.rate < ALT.warnT;
}
/* ---- THE COLD (pure): c = { v: 0..1 }; o = { high, warm } -> the drain rate to set (0 = stop) ---- */
export function coldStep(c, dt, o) {
  if (o.warm) c.v = Math.max(0, c.v - COLD.thaw * dt);
  else if (o.high) c.v = Math.min(1, c.v + COLD.fill * dt);
  else c.v = Math.max(0, c.v - COLD.ease * dt);
  return c.v >= 1 && o.high && !o.warm ? COLD.drain : 0;
}
/* ---- THE KEEL BRUSH (pure): z = { t, ph } cycles tell -> hit -> rest while LOW; anything else holds it at rest. -> 'tell' | 'hit' | null (this frame's edge) ---- */
export function brushStep(z, dt, low) {
  if (!low) { z.ph = 'rest'; z.t = BRUSH.rest * 0.5; return null; }
  z.t -= dt; if (z.t > 0) return null;
  if (z.ph === 'rest') { z.ph = 'tell'; z.t = BRUSH.tell; return 'tell'; }
  if (z.ph === 'tell') { z.ph = 'hit'; z.t = BRUSH.hit; return 'hit'; }
  z.ph = 'rest'; z.t = BRUSH.rest; return null;
}

/* ======================= THE LEVEL ======================= */
export function buildAirship({ T, TS }) {
  const { H, D, holdTop, holdFloor, W } = AS;
  const grid = new Uint8Array(W * H);
  const set = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) grid[y * W + x] = v; };
  const get = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : grid[y * W + x];
  const fill = (x0, x1, y0, y1, v) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, v); };
  const ents = [], ent = (t, x, y, extra = {}) => ents.push({ t, x, y, ...extra });
  const sign = (x, y, text) => ent('sign', x, y, { text });
  const deckFeet = D - 1;
  const stations = [], braziers = [], bandDecks = [], keelBrush = [], visZones = [], zipLines = [], moversExtra = [], masonry = [], facades = [], decor = [], rockZones = [];
  const station = (id, x, y, kind = 'stoke', o = {}) => { stations.push({ id, x, y, kind, ...o }); ent(kind === 'vent' ? 'asvent' : 'asburner', x, y, { id, ...o }); };
  const banded = (x0, x1, row, which, why) => bandDecks.push({ x0, x1, row, band: which, why });
  const climb = (x, y0, y1) => fill(x, x, y0, y1, T.CLIMB);
  const sections = { launch: 0, hold: 71, rigging: 151, cloud: 251, bridge: 341, storm: 381 };

  /* ---- THE HULL: the deck (two rows of lacquered planking, brass-banded) on a solid hull to the keel; the hold is carved out under 71-149 ---- */
  fill(0, W - 1, D, H - 1, T.SOLID);
  fill(0, 0, 0, D - 1, T.SOLID); fill(W - 2, W - 1, 0, H - 1, T.SOLID);   /* the stern post, the bow */
  masonry.push([0, W - 1, D, D + 1, 'hull']);   /* (art: the lacquered hull, brass bands - plan s4 'airship hull = ship', never generic wood) */

  /* ==== 1. THE LAUNCH DECK (0-70) - TEACH: the rule, the first stoke (the ship lifts off the sand), the first boarders ==== */
  sign(4, deckFeet, AS_RULE);
  sign(14, deckFeet, 'HOLD E AT A BURNER: STOKE IT. EACH ONE LIFTS THE SHIP A WHILE - TWO TAKE HER INTO THE CLOUD.');
  station('launchA', 18, deckFeet); station('launchB', 24, deckFeet);
  ent('brazier', 9, deckFeet); braziers.push({ x: 9, y: deckFeet });
  /* the quarterdeck (a raised step at the bow end of the launch deck) */
  fill(56, 68, D - 3, D - 1, T.SOLID); set(54, D - 1, T.SOLID); set(55, D - 1, T.SOLID); set(55, D - 2, T.SOLID);
  fill(27, 28, D - 2, D - 1, T.SOLID); masonry.push([27, 28, D - 2, D - 1, 'cargo']);   /* lashed cargo on the launch deck (brass-strapped chests) */
  for (let i = 0; i < 5; i++) ent('coin', 30 + i * 2, deckFeet - 1);
  sign(40, deckFeet, 'A WHISTLE ON THE WIND: SKY RAIDERS BOARD FROM THEIR GLIDERS.');
  zipLines.push({ x0: 67 * TS + 8, y0: (D - 3) * TS - 10, x1: 82 * TS + 8, y1: D * TS - 12, id: 'quarterZip' });   /* the raiders' boarding line, quarterdeck to the waist (past the hatch) */

  /* ==== 2. THE CARGO HOLD (71-150) - TEST (LOW): down the hatch; the keel brushes the dunes through the breaches; stoke to rise above it ==== */
  fill(71, 149, holdTop, holdFloor - 1, T.AIR);                 /* the hold's air (the deck over it, rows D..D+1, stays) */
  fill(72, 74, D, D + 1, T.AIR);                                /* the hatch */
  sign(68, deckFeet, 'THE HOLD. WHEN SHE FLIES LOW THE DUNES COME IN THROUGH THE BREACHES - STOKE AND SHE RISES OVER THEM.');
  station('holdA', 80, holdFloor - 1); station('holdB', 84, holdFloor - 1);
  ent('torch', 78, holdFloor - 1); ent('torch', 116, holdFloor - 1); ent('torch', 138, holdFloor - 1);
  keelBrush.push({ x0: 92, x1: 99, row: holdFloor - 1, id: 'breach1' }, { x0: 118, x1: 125, row: holdFloor - 1, id: 'breach2' });
  fill(104, 105, holdFloor - 2, holdFloor - 1, T.SOLID); masonry.push([104, 105, holdFloor - 2, holdFloor - 1, 'cargo']);   /* lashed cargo (brass-strapped chests) */
  fill(108, 114, holdFloor - 4, holdFloor - 4, T.ONEWAY);        /* a cargo shelf */
  climb(110, holdTop, holdFloor - 5);                           /* a hanging net */
  fill(130, 131, holdFloor - 2, holdFloor - 1, T.SOLID); masonry.push([130, 131, holdFloor - 2, holdFloor - 1, 'cargo']);
  ent('silver', 112, holdFloor - 5);
  for (let i = 0; i < 4; i++) ent('coin', 120 + i * 2, holdFloor - 3);
  /* the companion stair up to the deck (142-149: one row a column) */
  fill(143, 149, D, D + 1, T.AIR);
  for (let i = 0; i < 8; i++) fill(142 + i, 142 + i, holdFloor - 1 - i, holdFloor - 1, T.SOLID);
  ent('check', 152, deckFeet);

  /* ==== 3. THE RIGGING (151-250) - REMIX + PLATFORMING 1: up the masts, HIGH spars, a zip, a swinging yard; no fight inside ==== */
  sign(154, deckFeet, 'THE FORECASTLE IS SHUT. GO OVER IT - UP THE MASTS. HIGH, THE SPARS MEET; HIGH, THE AIR IS COLD.');
  station('rigDeck', 157, deckFeet);
  const mast = (x, top, yardW) => { climb(x, top, D - 1); fill(x - 3, x + 3, 17, 17, T.ONEWAY); fill(x - yardW, x + yardW, top, top, T.ONEWAY); decor.push({ k: 'mast', x, y0: top - 3, y1: D - 1 }); };
  mast(162, 9, 4); mast(190, 9, 4); mast(218, 9, 4);
  station('rigTopA', 163, 16); station('rigTopC', 219, 16);       /* fighting-top burners (mid-climb), each warms its top */
  banded(167, 185, 9, 'high', 'spar A-B: the tilt brings the yards together');
  zipLines.push({ x0: 194 * TS + 8, y0: 9 * TS - 10, x1: 214 * TS + 8, y1: 17 * TS - 12, id: 'rigZip' });   /* mast B's yard to mast C's top (src/zipline.js) */
  moversExtra.push({ kind: 'swing', px: 229 * TS, py: 3 * TS, arm: 5 * TS, x: 0, y: 0, w: 40, h: 8, period: 3.6, phase: 0, id: 'yardSwing' });   /* THE PIVOTING YARD: swings in the wind */
  fill(244, 250, 9, D - 1, T.SOLID); masonry.push([244, 250, 9, D - 1, 'forecastle']);   /* the forecastle bulkhead: over it, not through it */
  banded(236, 243, 9, 'high', 'spar C-forecastle');
  climb(251, 9, D - 1);                                         /* the forecastle's far-side net down to the deck */
  ent('coin', 176, 8); ent('coin', 180, 8); ent('silver', 247, 8);
  for (const x of [176, 204, 232]) { fill(x, x + 1, D - 2, D - 1, T.SOLID); masonry.push([x, x + 1, D - 2, D - 1, 'cargo']); }   /* deck cargo under the rigging (a second height on the deck road) */
  climb(190, 5, 8); fill(188, 192, 5, 5, T.ONEWAY); ent('silver', 190, 4);   /* THE CROW'S NEST over mast B: a silver for the climb past the yard (off the route) */

  /* ==== 4. THE CLOUD LINE (251-340) - EXAM + PLATFORMING 2: both bands twice; then the wyrmlings on the open deck ==== */
  visZones.push({ x0: 255, x1: 326, k: 0.55, why: 'the cloud bank (src/desert-rules.js sandstorm visibility, reused - plan s3d)' });
  sign(253, deckFeet, 'THE CLOUD LINE. A VALVE VENTS THE BURNERS: SHE SINKS. HIGH CLOSES THE SPARS, LOW LINES UP THE GANGWAYS.');
  station('cloudA', 255, deckFeet); station('cloudB', 257, deckFeet);
  climb(260, 10, D - 1); fill(258, 262, 10, 10, T.ONEWAY);
  banded(263, 272, 10, 'high', 'cloud spar one');
  fill(273, 278, 10, 10, T.ONEWAY); station('cloudLedge', 276, 9);
  climb(279, 10, D - 1);
  station('vent1', 281, deckFeet, 'vent');
  /* two BURNT GAPS in the deck: a LOW gangway lines up across each; high, the gap is open (a drop to the bilge walk and a ladder back - never a death) */
  const burnt = (x0, x1) => { fill(x0, x1, D, holdFloor - 1, T.AIR); set(x0, D, T.ONEWAY); fill(x0, x0, D + 1, holdFloor - 1, T.CLIMB); banded(x0 + 1, x1, D, 'low', 'the gangway over the burnt deck ' + x0); };   /* the bilge ladder back up under a one-way lip */
  burnt(283, 294); burnt(297, 307);   /* 11 / 10 tiles over: past any hero's jump (the reach heroes check owed in the browser) */
  sign(280, deckFeet, 'BURNT THROUGH. LET HER SINK AND THE GANGWAY LINES UP.');
  station('cloudC', 309, deckFeet); station('cloudD', 310, deckFeet);
  climb(311, 12, D - 1); fill(311, 311, 12, 12, T.ONEWAY);
  banded(312, 321, 12, 'high', 'cloud spar two');
  fill(322, 325, 12, D - 1, T.SOLID); masonry.push([322, 325, 12, D - 1, 'envelope rib']);   /* a rib of the envelope's frame down to the deck */
  climb(326, 12, D - 1);
  for (let i = 0; i < 4; i++) ent('coin', 264 + i * 2, 9);
  ent('silver', 300, holdFloor - 1);
  fill(315, 316, D - 2, D - 1, T.SOLID); masonry.push([315, 316, D - 2, D - 1, 'cargo']);
  /* the wyrmlings' deck (327-340): open, a brazier for the shock (a warm station cleanses it) */
  ent('brazier', 330, deckFeet); braziers.push({ x: 330, y: deckFeet });
  for (const [x, y] of [[327, 20], [331, 18], [335, 21], [338, 19]]) ent('wyrmling', x, y, { el: 'shock', squad: 'brood' });

  /* ==== 5. THE BRIDGE (341-380) - breather: the captain's cabin, the chart, the wyrm's first sighting; the pre-boss shrine ==== */
  fill(345, 376, 18, 18, T.SOLID); masonry.push([345, 376, 18, 18, 'cabin roof']); fill(345, 345, 19, 22, T.SOLID); fill(376, 376, 19, 22, T.SOLID);   /* the cabin (doors under its posts) */
  ent('brazier', 352, deckFeet); braziers.push({ x: 352, y: deckFeet });
  sign(356, deckFeet, "THE CAPTAIN'S CHART: A STORM SERPENT COILS THE SKY ROUND THE SHIP. HIS BOLTS FIND THE HOTTEST THING ON DECK.");
  for (let i = 0; i < 6; i++) ent('coin', 360 + i * 2, deckFeet - 1);
  fill(362, 363, D - 1, D - 1, T.SOLID); masonry.push([362, 363, D - 1, D - 1, 'chart table']);
  zipLines.push({ x0: 346 * TS + 8, y0: 18 * TS - 10, x1: 366 * TS + 8, y1: D * TS - 12, id: 'cabinZip' });   /* off the cabin roof (up its stern post net) to the chart */
  climb(344, 18, D - 1);
  ent('check', 372, deckFeet);
  sign(378, deckFeet, 'A BOLT ON A STOKED BURNER GROUNDS IN THE HULL - AND IN HIM.');

  /* ==== 6. THE STORM DECK (381-424) - THE THUNDER WYRM ==== */
  const sx = 382, ex = 422;
  const burners = [388, 396, 410, 418];
  burners.forEach((x, i) => station('storm' + i, x, deckFeet, 'stoke', { arena: true }));
  fill(403, 403, D - 3, D - 1, T.SOLID); masonry.push([403, 403, D - 3, D - 1, 'mast stump']);   /* THE MAST STUMP: brace behind it (the roar), stand on it (the slam) */
  ent('thunderwyrm', 414, deckFeet, { face: -1 });
  ent('gate', 423, deckFeet);
  const arena = { x0: sx * TS, x1: ex * TS, floor: D * TS, trigger: (sx + 3) * TS, wallL: sx - 1, wallR: ex, boss: 'thunderwyrm', music: 'boss3',
    tint: '#5a3a8a', tintA: 0.1, y0: 4 * TS, y1: (D + 1) * TS, tw: { sx, ex, D, burners, stump: 403 } };

  /* ---- THE CAST: sky raiders (bandit reskins on existing AIs: goggles, harnesses, glider cloaks - art owed) ---- */
  const raider = (t, x, y, o) => ent(t, x, y, Object.assign({ face: -1, skyRaider: true }, o || {}));
  /* each knot is a SQUAD (one designed encounter): the boarders off the gliders, the quarterdeck's shooters, the hold's three knots, the cloud deck's raid, the bridge door */
  const sq = (t, x, y, squad, o) => raider(t, x, y, Object.assign({ squad }, o || {}));
  sq('cutthroat', 34, deckFeet, 'boarders'); sq('cutthroat', 40, deckFeet, 'boarders');
  sq('slinger', 60, D - 4, 'quarterdeck'); sq('archer', 66, D - 4, 'quarterdeck');
  sq('cutthroat', 98, holdFloor - 1, 'holdFore'); sq('shield', 102, holdFloor - 1, 'holdFore');   /* THE PLATED BOARDER: the bandit shield's AI in a sky raider's harness (the Plated Bandit's skin is Ksar-bound: Q) */
  sq('slinger', 112, holdFloor - 5, 'holdShelf'); sq('cutthroat', 108, holdFloor - 1, 'holdShelf');
  sq('archer', 130, holdFloor - 3, 'holdAft'); sq('cutthroat', 135, holdFloor - 1, 'holdAft');
  raider('cutthroat', 254, deckFeet, { face: 1 });   /* the boarder waiting at the forecastle's foot (after the rigging, before the cloud line's climbs) */
  sq('archer', 329, deckFeet, 'brood'); sq('cutthroat', 337, deckFeet, 'brood');   /* the cloud deck's raid fights beside the brood (one encounter) */
  sq('cutthroat', 343, deckFeet, 'bridgeDoor'); sq('shield', 347, deckFeet, 'bridgeDoor'); sq('slinger', 350, deckFeet, 'bridgeDoor');

  const START = { x: 3, y: deckFeet };
  return {
    W, H, grid, ents, START, pools: [], falls: [], moversExtra, interiors: [], zipLines,
    shade: [], decor, rockZones, masonry, facades, ledgeKit: 'ship',
    sections, arena, gateAfterBoss: true,
    airship: { stations, braziers, bandDecks, keelBrush, visZones, burners, D, holdFloor },
    asStations: stations, bandDecks, keelBrush,   /* the same pieces at the top level, where tools/level-quality.mjs counts gadgets (SYSTEM_ARRAYS) */
    calm: [[0, W - 1, 0, H - 1]],   /* placed wholly by hand: nothing sprinkled */
    checkRun: 230,
    squadBands: [{ lo: 151, hi: 250, spots: 0, why: 'THE RIGGING (platforming 1): no fight inside' }, { lo: 255, hi: 326, spots: 0, why: 'THE CLOUD LINE climbs (platforming 2): no fight inside' }, { lo: 381, hi: W - 1, spots: 0, why: 'THE STORM DECK: the boss arena' }],
    platforming: [{ x0: 151, x1: 251, why: 'THE RIGGING' }, { x0: 255, x1: 326, why: 'THE CLOUD LINE' }],
    unlocks: [
      { kind: 'asburner', opens: 'STOKE (hold E): a burner burns 25 s and lifts the ship; two take her HIGH (the spars close, the air is cold)', hud: 'STOKED' },
      { kind: 'asvent', opens: 'THE VENT (hold E): every burner out - she settles LOW (the gangways line up, the keel brushes the dunes)', hud: 'VENTED' },
    ],
    music: 'skyroad',   /* placeholder: borrowed until the art lane's own pick (REPORT-ONLY music; brief s5: CC0 wind/storm candidates) */
    ambient: [{ x0: 0, x1: 99999, kind: 'wind' }],
    palette: { set: 'sky', near: 'none', dress: 'sky', noFg: true, noNear: true, haze: 'rgba(120,100,170,0.12)' },
    sky: true,
  };
}

/* THE LEVEL'S OWN LINT (tools/airship.mjs): -> [] or the problems */
export function lintAirship(L, T) {
  const bad = [], at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H ? T.SOLID : L.grid[y * L.W + x]);
  const solidish = t => t === T.SOLID || t === T.ONEWAY || t === T.CLIMB;
  const checks = L.ents.filter(e => e.t === 'check');
  if (checks.length < 2 || checks.length > 3) bad.push('two or three checkpoints, got ' + checks.length);
  for (const c of checks) if (at(c.x, c.y) !== T.AIR || at(c.x, c.y + 1) !== T.SOLID) bad.push('checkpoint at ' + c.x + ' does not stand on the deck');
  if (!L.ents.some(e => e.t === 'gate')) bad.push('no gate');
  if (L.ents.filter(e => e.t === 'thunderwyrm').length !== 1) bad.push('one thunder wyrm');
  if (L.ents.some(e => /gob/i.test(e.t + (e.cnSkin || '')))) bad.push('a goblin on the airship');
  /* NO SOFT-LOCK: every station stands where it is reached with the burners out (the always-solid deck, or a fighting top / ledge a ratline reaches) */
  for (const s of L.airship.stations) { const under = at(s.x, s.y + 1); if (!(under === T.SOLID || under === T.ONEWAY)) bad.push('station ' + s.id + ' floats'); if (at(s.x, s.y) !== T.AIR) bad.push('station ' + s.id + ' in rock');
    if (L.airship.bandDecks.some(b => s.y + 1 === b.row && s.x >= b.x0 && s.x <= b.x1)) bad.push('station ' + s.id + ' stands on a banded deck (it would vanish)'); }
  /* the bands: the pieces are AIR as built (the hands lay them), HIGH and LOW each used at least twice, and no gap is banded both ways */
  const hi = L.airship.bandDecks.filter(b => b.band === 'high'), lo = L.airship.bandDecks.filter(b => b.band === 'low');
  if (hi.length < 3) bad.push('HIGH spars: ' + hi.length + ' (rigging + cloud line twice)'); if (lo.length < 2) bad.push('LOW gangways: ' + lo.length);
  for (const b of L.airship.bandDecks) { for (let x = b.x0; x <= b.x1; x++) if (at(x, b.row) !== T.AIR) { bad.push('banded deck ' + b.why + ' not air as built at ' + x); break; } }
  /* NO DEATH UNDER A GAP: below every banded piece there is a floor within the hull (a fall lands, never leaves the ship) */
  for (const b of L.airship.bandDecks) for (let x = b.x0; x <= b.x1; x++) { let y = b.row + 1; while (y < L.H && !solidish(at(x, y))) y++; if (y >= L.H) { bad.push('a fall under ' + b.why + ' at ' + x + ' leaves the ship'); break; } }
  /* the wyrmlings only at the cloud line (brief s3) */
  for (const e of L.ents) if (e.t === 'wyrmling' && (e.x < L.sections.cloud || e.x >= L.sections.bridge)) bad.push('a wyrmling off the cloud line at ' + e.x);
  /* the platforming sections hold no foe */
  const FOE = new Set(['cutthroat', 'slinger', 'archer', 'wyrmling', 'shield', 'sapper']);
  for (const p of L.platforming) for (const e of L.ents) if (FOE.has(e.t) && e.x >= p.x0 && e.x <= p.x1) bad.push('a ' + e.t + ' inside ' + p.why + ' at ' + e.x);
  const raiders = L.ents.filter(e => e.skyRaider).length, brood = L.ents.filter(e => e.t === 'wyrmling').length;
  if (raiders < 12 || raiders > 16) bad.push('sky raiders ' + raiders + ' (12-16)'); if (brood < 4 || brood > 6) bad.push('wyrmlings ' + brood + ' (4-6)');
  if (L.arena.tw.burners.length !== 4) bad.push('the storm deck has 4 burners');
  return bad;
}
