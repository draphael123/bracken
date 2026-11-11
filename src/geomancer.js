// geomancer.js — THE GEOMANCER'S KIT (docs/briefs/geomancer.md). The Knight absorbs a blow, the Warden turns it at range, and the
// Geomancer BUILDS SOMETHING IN ITS WAY and then uses what she built. Her magic changes the level itself, so everything here that
// stands is written into the level's own grid for a few seconds - which is why the step is a real platform, why the wall really
// stops an arrow (a shot dies in rock, main.js seeds) and why a foe cannot walk through either.
//
// THE RULES THIS FILE KEEPS (and tools/geomancer.mjs proves, red first):
//   1. ROCK ONLY GOES INTO AIR. A cell is written only if it is empty level (T.AIR) with no living body - her or a foe - in it,
//      and it gives back exactly what was there. A body that is where a pillar comes up is LIFTED onto its top (if there is room
//      over it), never buried; a body with no room over it stops the pillar short.
//   2. (claude/geoid, Daniel 10-31 Q3: THE MAP IS HER RESOURCE - this rule is OVERTURNED) HER STONE STANDS until it is BROKEN or the room changes.
//      It has hp (GEO.wallHp) and cracks by hp (3 states, C1: a thing about to change is told). A foe that presses on it for GEO.stone.gnaw s costs it a
//      hp; a foe that RAMS it at charge speed (GEO.stone.chargeSp) breaks it outright and is OPENED UP (a boss: stunned); UP+C at a FULL board (AVALANCHE) erupts every
//      standing stone down as a rolling boulder; her third blow (the stone fist) shatters one it finds with nothing else to hit. Death, a level
//      change or a reload takes the lot (rule 5). Her ladder-less hold X is the old FAULT LINE below (aimed placement is DEFERRED past the demo). Her held X - FAULT LINE (round 3, 2026-09-24; it was UPHEAVAL, a
//      pillar) - writes no rock at all: it is a crack in the floor that hits, and a spike at the end of it that is drawn, not built.
//   3. THE CAP. At most three pieces (four with THE FOURTH STONE) stand at once: raising another crumbles the oldest.
//   4. NEVER A TRAP. Each frame, a piece with a living body inside it (a foe spawned or thrown there, a respawn) crumbles at once.
//   5. A level that is left or reloaded takes its pieces with it: a piece only ever restores the grid it was written into.
// The kit is bound to main.js through `api` (makeGeomancer) - main.js owns the world, the input and the tal() reads; this owns
// what she makes in it.
import { makeGeoForks } from './geo-forks.js';   /* (claude/geofork) the new bodies of the A/B fork sides: mines, slab, geode, the two capstones */
import { EARTH as EARTH_FALL, earthSpot } from './plunges.js';   /* (claude/plunges) EARTHFALL, her plunge: a stone spike that hits and stands a few seconds as a step */
export const GEO = {
  /* (claude/geoid) THE BOARD: stone = how foes break her stone; fist = THE STONE FIST (her third jab); topple = UP+C */
  stone: { chargeSp: 140, gnaw: 1.1, openT: 1.0, ramStagger: 0.8 },
  fist: { mul: 1.2, knockVy: -300, lock: 2, stagger: 0.3, plantCd: 3.0, plantFrom: 2, plantTo: 4, kvx: 25, kvxUpper: 8, spike: { h: 30, w: 9, rise: 0.06, sink: 0.25, end: 0.55 } },
  /* (claude/geopop, Daniel 11-03 17:24: ALL 8 RECS) THE POPULARITY PASS. KILL SWITCHES - any one can be set false at the cut without a revert:
       fistPlant  the stone fist plants a knee stone 2-4 tiles ahead (no plant at a full board; fist.plantCd s between plants)
       bossStone  one stone stands at every boss start (incl. a retry): main.js bossStart -> fillBoard(1)
       detonate   DOWN+C blows every stone of hers at once (below)
       feel       the heavier-feel layers (ART+SFX lane: sample keys with synth fallbacks) */
  gravel: { reach: 24, slow: 0.25 },   /* (claude/traitdata-a) GRAVEL: px beside a stone, the speed it takes off a common or elite */
  moss: { rate: 3, cap: 0.03 },   /* MOSSBACK: health a second (internal; 0.3 as read), and the share of her max health one stone gives up in all */
  scree: { mul: 0.4, stagger: 0.25 },   /* SCREE: the ripple's blow, x the sword, and its stagger on the small */
  pop: { fistPlant: true, bossStone: true, detonate: true, feel: true, upper: true, skin: false, recall: true },
  /* (claude/geofix, Daniel 11-04) RECALL THE STONES (a TAP of DOWN; STONE SKIN is retired - pop.skin false, and EARTH SENSE stays retired): every standing stone of hers tears out of the floor and slides back along it
     to her feet at sp px/s, bowling over what it passes (a common foe: swordDmg x dmg + knocked down for down s; a boss or a mini: x bossDmg + a stagger, once per stone), then re-plants in a free cell beside her.
     cd s between recalls; tap = the longest a DOWN press may last and still be a tap (main.js: no other button during it). */
  recall: { cd: 1.8, sp: 430, dmg: 0.5, bossDmg: 0.35, down: 0.9, bossStagger: 0.3, tap: 0.22, life: 1.1 },
  /* (claude/geocrouch, Daniel 11-03) upper: jab 3 is a rising UPPERCUT - a stone spike erupts under the foe it hits (drawing only; a whiff raises it at the knee-stone's cell) and the knock-up goes straight up (kvx fist.kvxUpper, commons only); false = the old 25.
     skin: the crouch is STONE SKIN (SKIN, src/crouch-b.js); false = EARTH SENSE as it was. */
  /* DETONATE (DOWN+C, one or more stones standing): tell s of the slam (the stones glow and crack), then every stone goes off - a shockwave of r px (swordDmg x mul) and
     'shards' radial shards (x shardMul). PER FOE: at most perFoeBlasts blasts and perFoeShards shards (2 x 1.0 + 3 x 0.4 = 3.2x sword). A common foe is knocked down, a boss / mini
     takes the damage and no stagger of ours. All the stones are spent, no refund; cd s. Walls (the 11-09 STONE WALL) are uncapped and ignored in v1. shake = camera by stones standing. */
  detonate: { tell: 0.2, r: 40, mul: 1.0, shards: 3, shardMul: 0.4, perFoeBlasts: 2, perFoeShards: 3, cd: 5, hitstop: 0.06, shake: [0, 5, 6, 8], knockDown: 0.9, crackLife: 1.2 },
  /* (claude/ults, Daniel 11-01) AVALANCHE = THE ULTIMATE (UP+C at a FULL board, cap stones standing): every stone ERUPTS as a pillar (eruptT s: launches the common foe in its column, a blow x erupt) and then ROLLS down the room as a boulder (sp px/s, life s, one bounce).
     Each stone hits a BOSS or a mini for swordDmg x boss (a common foe x roll, and is bowled over); the stones are consumed - the board is rebuilt by hand. No cooldown: the cost is the three stones. */
  /* (claude/geofix, Daniel 11-04) AVALANCHE -> MOUNTAIN COLLAPSE (same input, same fuel: UP+C at a full board, the stones consumed). A hit-freeze (freeze s) and a camera pull-back, the stave slam (slam s), cracks run across the ceiling / back wall of the screen (crack..), then a WAVE
     of boulders (per boulders for each stone consumed, B = per x n) crashes down across the VISIBLE screen outward from her (rain s later, one every span/B s, fall s in the air - a shadow tells each landing), dust plumes, shake; settle s later the dust has cleared.
     DAMAGE PARITY: a landing hits every foe within zone px of it (zone = n x spacing / 2, so any foe on screen is under exactly n of the B boulders), once per boulder, for what ONE old boulder did (avalanche.boss x sword to a boss / mini, avalanche.roll to a common foe, bowled over) =
     n x the old per-boulder blow, which is what a foe the old boulders all reached took. */
  collapse: { per: 4, freeze: 0.18, slam: 0.1, crack: 0.2, crackDur: 0.65, rain: 0.8, span: 1.0, fall: 0.4, settle: 1.3, r: 11, pull: 0.9, pullT: 2.9 },
  avalanche: { erupt: 0.9, eruptT: 0.5, roll: 2.0, boss: 8.0, bossStagger: 0.7, sp: 230, life: 3.8, bounces: 1, r: 9, launchVy: -380, reach: 22 },
  bigBodyGrace: 0.4,
  cap: 3, life: 4, lifeLong: 6, archLife: 6, crack: 1.0, rise: 0.12,
  pillarH: 2, wallH: 2, perfect: 0.2, wallHp: 3,
  /* FAULT LINE (her held X from round 3, Daniel, 2026-09-24 - it replaces UPHEAVAL). Upheaval bet on a SPOT and the foe walked off it;
     this is a LINE. She slams the stave and a crack races along the floor ahead of her (speed px/s), hitting everything along it once.
     THE CHARGE SETS THE LENGTH AND THE DAMAGE: len0 + lenK * wound px (22 at the quickest release, which covers a foe touching her -
     and that one is hit AT ONCE, in the release frame - to 160 at a full wind), at mul0 + mulK * wound of her blow. A FULL wind
     (fullAt) ends in a ROCK SPIKE at the tip that launches what it hits (spikeMul, spikeVy). It FOLLOWS THE FLOOR: it stops at the
     first gap (no floor under it) and at the first wall (rock at her feet' height), so it never crosses a pit and never goes up
     through rock (A12). While she winds, the line it will take is drawn on the floor (C1). Her wind stays the longer 0.5 s.
     THE DAMAGE IS AT THE END (Daniel, 2026-09-25: it was spammable - 1.0-1.4x to everything along it, 0.6x more from the spike): the
     crack is half that (mul0/mulK), and the full wind's spike is the big hit (spikeMul), so a foe at its tip takes about what it did
     and a crowd along it takes half. */
  wind: 0.5,
  fault: { len0: 22, lenK: 138, speed: 520, mul0: 0.8, mulK: 0.35, fullAt: 0.98, spikeMul: 1.6, spikeVy: -360, spikeVyTall: -440, linger: 0.35 },
  /* (claude/chargetiers, Daniel 10-21 "each tier a DIFFERENT move ... the pillar ... should ease her stamina wall") THE THREE-TIER STAVE. at = s of WIND (past HEAVY_START, x her
     wind's quickness) each tier arrives at - T2 is the old full wind; let go BEFORE T1 and it is the short crack it always was (it hits what touches her).
       T1 STONE SHARD   a shard of stone flung flat ahead at chest height (shard: px/s, its own blow) - it reaches what the crack cannot: a flyer, a shooter on a ledge; HALF the
                        wind of a heavy (st[1])
       T2 FAULT LINE    hers already: the full crack and the spike at its tip
       T3 RISING PILLAR the full crack, and where it first finds a foe (or at its tip) a PILLAR of her stone rises (pillar.h cells): it strikes and LAUNCHES what is on it, heaves
                        what stands beside it, and STANDS as a STEP (one of her stones, the cap and the crumble as any). TIME TRADED FOR POWER: it costs no more wind than
                        the fault line, and the stone gives wind back as it rises (pillar.refund) - the hold is the price, not the bar.
     hold = s held at T3 before it goes by itself; names/cols = the meter and the words */
  tiers: { at: [0.16, 0.5, 1.06], hold: 0.8, st: [1, 0.5, 1, 1], names: ['', 'STONE SHARD', 'FAULT LINE', 'RISING PILLAR'], cols: [null, '#c8c4b0', '#e8a83a', '#ff8a3a'], label: [null, '#e8e4d0', '#ffd27a', '#ffb070'],
    shard: { vx: 330, vy: -20, g: 120, life: 0.55, dmg: 0.95 }, pillar: { h: 3, mul: 1.6, refund: 14 } },
  /* THE RUNE-WARD (her C from round 3, Daniel, 2026-09-24 - it replaces the two-hit ROCK SHIELD and THE MEND). The Knight's guard,
     SIDEGRADED: the same rules (hold to block, YELLOW blocked, RED breaks through, a blocked blow costs wind, out of wind is a
     GUARD BREAK at half the blow), but a projected slab of rune-cut stone, taller than she is and lipped over her head. Against his:
     `raise` - it takes a tenth of a second to rise (his is up the frame C goes down), and the PERFECT window (`perfect`) opens only
     once it has risen, so her beat is earlier (0.10-0.17 s after C, his 0-0.11) and tighter (0.07 s to his 0.11); `hitSt` - a blocked blow costs 20 wind (his 14); she is ROOTED
     while it stands (the stave planted: she can turn, not walk - he walks at guard pace); `holdSt` - holding it drains as his does
     once the perfect window has passed; no riposte and no wind back on a perfect guard. For that: it covers OVERHEAD, a bolt does not
     pierce it, a blow does not push her back, and a PERFECT guard throws a shot back the way it came and EMPOWERS her for `emp` s -
     her blows `empMul` as hard and TREMOR filling `empTremor` times as fast, the runes on her alight so it reads. `hold`: a tap
     keeps it up this long after it has risen (a tap on the beat is a guard). `lock`: after it breaks, how long before it will rise. */
  ward: { raise: 0.1, perfect: 0.1, hold: 0.15, hitSt: 15, holdSt: 14, lock: 0.6, emp: 3, empMul: 1.25, empTremor: 2 },
  tremor: { wall: 18, perfect: 28, launch: 14, shot: 6 },
  launchVy: -330, heroLaunchVy: -430, stepVy: -400,
  quakeR: 200, quakeWideMul: 1.5,
  roll: { sp: 230, r: 5, life: 1.0, dmg: 1.0 }, boulder: { sp: 190, r: 8, life: 3.2, dmg: 1.0, bounces: 2 },   /* (1.6 and a fresh hit on every bounce measured 120 at level 3 on the probe, four times Harrier's; each foe is hit ONCE now) */
};
/* (claude/chargetiers) THE TIER HER WIND HAS REACHED: held = s X has been down (main.js P.atkHeld), q = her wind's quickness (heavyWind / GEO.wind), start = HEAVY_START. 0 = the short crack */
export const geoTierAt = (i, q = 1, start = 0.14) => start + GEO.tiers.at[i - 1] * q;
export const geoTierFor = (held, q = 1, start = 0.14) => { let t = 0; for (let i = 1; i <= 3; i++) if (held >= geoTierAt(i, q, start) - 1e-6) t = i; return t; };
const STONE = { base: '#7c7a6e', hi: '#a8a696', lo: '#5e5c54', dark: '#44423a', moss: '#6f9a4a', moss2: '#557a38', rune: '#e8a83a', crack: '#26241e' };
const EARTH = { base: '#6e4c30', hi: '#8c6844', lo: '#4c3420' };   /* the packed soil her ward is bound in (the earth shield) */

export function makeGeomancer(api) {
  let pipSig = '', pipChange = -9, pipLast = -9, pieces = [], rollers = [], shards = [], falls = [], spikes = [], faults = [], golem = null, golem2 = null, spurFx = null, shieldDrawn = false, spunAt = -9;   /* (spunAt: when the draw last set a stone round her geode - tools/geomancer.mjs `staff`) */   /* (shieldDrawn: whether the last draw put her shield on screen - tools/geomancer.mjs `drawn`) */
  const TS = api.TS;
  const stats = { tiers: [0, 0, 0, 0], pillars: 0, steps: 0, shardHits: 0, rams: 0, gnaws: 0, topples: 0, fists: 0 };   /* (claude/chargetiers) the three-tier stave: tiers let go (1 shard, 2 fault, 3 pillar), pillars risen, of them steps that stood, shards that landed */
  const T = () => api.T;
  const grid = () => api.L.grid;
  const heroBox = () => api.box(api.P);
  const foes = () => api.enemies.filter(e => e.alive && !(e.gone > 0));
  const bodies = () => [heroBox(), ...(api.players || []).filter(p => p !== api.P && !p.dead && p.hp > 0).map(p => api.box(p)), ...foes().map(api.box)];   /* (claude/geoid) a CO-OP PARTNER is a body too: standing stone never comes up inside either of them (the board is per-world) */
  const cellBox = (tx, ty) => ({ l: tx * TS, r: tx * TS + TS, t: ty * TS, b: ty * TS + TS });
  const fk = id => !!(api.fork && api.fork(id));   /* (claude/geofork) a fork SIDE is picked and live (main.js gb): false flag off, for another hero, in an EVEN-L1 duel. Every read below is `base unless fk(...)` */
  const tal = k => (api.tal()[k] || 0);   /* (claude/traitdata-a) a TRAIT's value is its RANK scale (0.70 / 0.85 / 1, exactly 1 while the flag is off); 0 when unworn */
  const mulK = (x, k) => 1 + (x - 1) * k;   /* a multiplier x whose bonus scales with rank k (exactly x at k = 1) */
  const floor = (e, s) => { const r = api.floorFoe(e, tal('aftershock') ? s * mulK(fk('gtlongfall') ? 2.0 : 1.5, tal('aftershock')) : s);   /* LONG FALL: twice as long (AFTERSHOCK's A side); SHAKEN: a third of a blow as it lands (B) */
    if (r && tal('aftershock') && fk('gtshaken') && !(e.geoShakenT > api.time)) { e.geoShakenT = api.time + 1; api.hurtAs('heavy', e, dmg(0.3 * tal('aftershock')), e.x, false); } return r; };   /* AFTERSHOCK: what her stone knocks down stays down half again as long (only while the flag is on) */
  const lifeOf = () => Infinity;   /* (claude/geoid) it STANDS: hp is its life */
  const cap = () => GEO.cap + (tal('fourth') && (fk('gtfour') || !fk('gttall')) ? 1 : 0);   /* TALL STONES (the FOURTH STONE's B side) keeps the board at three */
  const dmg = (mul, k) => Math.max(1, Math.round(api.swordDmg() * mul * (k ? api.amul(k) : 1)));
  const floorRow = (tx, fromTy, span = 4) => { for (let ty = fromTy; ty <= fromTy + span && ty < api.LH; ty++) { const t = api.tileAt(tx, ty); if (api.isSolid(tx, ty) || api.isOneWay(t)) return ty; } return null; };
  /* RULE 1: empty level, in bounds, and nobody in it */
  function freeCell(tx, ty) {
    if (tx < 1 || ty < 1 || tx >= api.LW - 1 || ty >= api.LH - 1) return false;
    if (grid()[ty * api.LW + tx] !== T().AIR) return false;
    if (api.blockedAt && api.blockedAt(tx, ty)) return false;   /* (claude/geoid) standing stone never goes near a gate, a door, a plate or a lever */
    const c = cellBox(tx, ty); return !bodies().some(b => api.overlap(c, b));
  }
  function refreshTiles() { api.resolveTiles(); const spr = api.tileSpr; if (spr) for (const p of pieces) for (const c of p.cells) spr[c.i] = null; }
  /* (claude/geotune) a standing stone is not eaten by a BOSS that walks onto it (its walk ignores tiles): only a ram or the gnaw breaks it - so a board of three can stand beside a boss */
  const smallBodies = () => [heroBox(), ...(api.players || []).filter(q => q !== api.P && !q.dead && q.hp > 0).map(q => api.box(q)), ...foes().filter(e => !(api.lcBig(e) || e.maxHp || e.mini)).map(api.box)];
  function crumble(p, why) {
    if (p.gone) return; p.gone = true; stats.cr = stats.cr || {}; stats.cr[why] = (stats.cr[why] || 0) + 1;
    const g = grid(); for (const c of p.cells) if (p.grid[c.i] === p.tile) p.grid[c.i] = c.was;   /* RULE 5: only ever the grid it was written into (and always put back, whichever grid is live) */
    pieces = pieces.filter(q => q !== p); if (p.grid === g) refreshTiles();
    const cx = (p.x0 + p.x1) / 2, cy = (p.y0 + p.y1) / 2;
    api.burst(cx, cy, 10 + p.cells.length * 3, [STONE.base, STONE.hi, STONE.lo, STONE.moss], 70, 0.6);
    if (why !== 'silent') api.SFX.geoCrumble && api.SFX.geoCrumble();
    if (why !== 'silent') GFK.crumbled(p, why);   /* CAIRN (the board's B side) */
    if (p.kind === 'wall' && tal('shrapnel') && why !== 'silent' && why !== 'shatter') shrap(cx, cy, 0);   /* SHRAPNEL (3 / 3 / 4 shards by rank; SPLINTERS / HEAVY SHARDS reshape it) */
  }
  /* write a run of cells as one piece (RULE 1 checked per cell by the caller, re-checked here) */
  function place(kind, cells, tile, opt = {}) {
    cells = cells.filter(([tx, ty]) => freeCell(tx, ty)); if (!cells.length) return null;
    const own = pieces.filter(q => q.capped);
    if (!opt.free) while (own.length >= cap()) crumble(own.shift(), 'cap');   /* RULE 3 (EARTHFALL's step is OUTSIDE the cap: it is a plunge's, not one of her three) */
    const g = grid(), t = api.time;
    const p = { kind, tile, grid: g, born: t, age: 0, life: opt.life || lifeOf(kind), crack: GEO.crack, capped: !opt.free, earth: !!opt.free, hp: GEO.wallHp + (opt.free ? 0 : tal('lasting') ? 1 : 0) + (opt.hpPlus || 0), cells: [],
      x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
    for (const [tx, ty] of cells) { const i = ty * api.LW + tx; p.cells.push({ i, tx, ty, was: g[i] }); g[i] = tile;
      p.x0 = Math.min(p.x0, tx * TS); p.x1 = Math.max(p.x1, tx * TS + TS); p.y0 = Math.min(p.y0, ty * TS); p.y1 = Math.max(p.y1, ty * TS + TS); }
    p.hp0 = p.hp; pieces.push(p); refreshTiles(); return p;
  }
  /* A BODY WHERE STONE COMES UP. The hero and anything light are lifted onto the top of it (if the space over it is open);
     a boss, a mini, a flyer or a thing with a ceiling on it is not moved - the stone stops short under it (RULE 1). */
  function roomAbove(b, top) { const l = Math.floor((b.x - b.w / 2 + 1) / TS), r = Math.floor((b.x + b.w / 2 - 1) / TS), t0 = Math.floor((top - b.h) / TS), t1 = Math.floor((top - 1) / TS);
    for (let tx = l; tx <= r; tx++) for (let ty = t0; ty <= t1; ty++) if (api.isSolid(tx, ty)) return false; return true; }
  function liftable(e) { return !api.lcBig(e) && !e.noGrav && !api.knockSkip(e) && !(e.pinned > 0); }
  /* THE ERUPTION: a column of `h` cells standing on the floor row fy at column tx, launching what is standing there */
  function erupt(tx, fy, h, kind, o = {}) {
    if (fk('gttall') && kind === 'pillar' && h >= 2 && !o.free) { h += 1; o = { ...o, hpPlus: 1 }; }   /* TALL STONES: a pillar (not the knee stone) a cell taller, one blow more */
    /* o: { noHero, heroVy, hurt, mul, k, tag (the blow's name: EARTHFALL's is 'plunge'), noLaunch, free, life } */
    const top = (fy - h) * TS, col = { l: tx * TS, r: tx * TS + TS, t: top - 2, b: fy * TS };
    const P = api.P, launched = [], hit = []; let struck = 0;
    if (!o.noHero && !P.dead && api.overlap(col, heroBox()) && roomAbove(P, top)) { P.y = top; P.vy = o.heroVy || GEO.heroLaunchVy; P.ground = false; P.coyote = 0; P.onMover = null; }
    for (const e of foes()) { if (e.harmless) continue; const eb = api.box(e), inCol = api.overlap(col, eb);
      if (!inCol && !api.overlap({ l: col.l - 8, r: col.r + 8, t: col.t, b: col.b + 2 }, eb)) continue;   /* THE GROUND HEAVES a hand either side: what stands beside the column is hit, not lifted */
      if (inCol && !o.noLaunch && liftable(e) && roomAbove(e, top)) { e.y = top; e.vy = GEO.launchVy; e.geoAirT = api.time; e.stagger = Math.max(e.stagger || 0, 0.5); launched.push(e); }
      if (!e.turncoat && o.hurt !== false) { api.hurtAs(o.tag || 'heavy', e, dmg(o.mul || 1.3, o.k), P.x, false); api.sparks(e.x, e.y - (e.h || 16) / 2, 0, 5); struck++; hit.push(e); } }
    const cells = []; for (let k = 1; k <= h; k++) { if (!freeCell(tx, fy - k)) break; cells.push([tx, fy - k]); }   /* bottom up: stop at the first that is not air, or has a body in it */
    const p = cells.length ? place(kind, cells, T().SOLID, o) : null;
    api.dust(tx * TS + 8, fy * TS, 8); api.shakeCam(3); api.SFX.geoRise && api.SFX.geoRise();
    if (launched.length) { gainTremor(GEO.tremor.launch * launched.length); api.number(tx * TS + 8, top - 26, 'LAUNCHED', STONE.rune); }
    return { piece: p, launched, struck, hit };
  }
  function gainTremor() { /* (claude/geoid) THE TREMOR BAR IS GONE: the stones standing ARE her resource (boardFill). Kept as a no-op so the old call sites read the same */ }
  const standing = () => pieces.filter(p => p.capped && !p.gone).length;
  /* ==== THE NEW TRAITS (claude/traitdata-a; plan passiveplan sec 2; all dark behind TRAITS_SHIP - tal() is 0 for them while it is off) ====
     GRAVEL: a common or an elite within GEO.gravel.reach px beside a standing stone of hers moves (1 - 0.25 x rank) as fast (main.js updateEnemies reads the stamp; never a boss, a mini or a big foe).
     MOSSBACK: touching her own stone mends her GEO.moss.rate x rank health a second, and one stone gives up at most GEO.moss.cap of her max health in all (it is bare after: 3% a cast, the rule that keeps it a comfort). */
  function stepTraits(dt) { const P = api.P;
    const gv = fk('gtdeepgrav') ? { reach: GEO.gravel.reach, slow: 0.4 } : fk('gtwidegrav') ? { reach: GEO.gravel.reach * 2, slow: GEO.gravel.slow } : GEO.gravel;   /* DEEP GRAVEL slows 40%, WIDE GRAVEL reaches twice as far */
    if (tal('gravel')) { const K = 1 - gv.slow * tal('gravel');
      for (const p of pieces) { if (!p.capped || p.gone) continue;
        for (const e of foes()) { if (e.harmless || e.turncoat || isBig(e)) continue; const dx = Math.max(p.x0 - e.x, e.x - p.x1, 0); if (dx > gv.reach || e.y < p.y0 - 8 || e.y > p.y1 + 6) continue; e.geoGravelT = api.time + 0.15; e.geoGravelK = K; } } }
    if (tal('moss') && fk('gtlastmoss')) for (const p of pieces) if ((p.mossGot || 0) > 0) p.mossGot = Math.max(0, p.mossGot - dt * P.maxHp * 0.01 / 6);   /* LASTING MOSS: a bare stone grows one in a hundred back every six seconds */
    if (tal('moss') && !P.dead && P.hp > 0 && P.hp < P.maxHp) {
      const st = pieces.find(p => p.capped && !p.gone && P.x + 6 > p.x0 - 2 && P.x - 6 < p.x1 + 2 && P.y > p.y0 - 4 && P.y - 1 < p.y1 + 2 && (p.mossGot || 0) < P.maxHp * GEO.moss.cap);
      if (st) { const g = Math.min(GEO.moss.rate * (fk('gtquickmoss') ? 2 : 1) * tal('moss') * dt, P.maxHp * GEO.moss.cap - (st.mossGot || 0), P.maxHp - P.hp); if (g > 0) { st.mossGot = (st.mossGot || 0) + g; P.hp += g; stats.mossed = (stats.mossed || 0) + g; } } } }
  /* SCREE: the stone fist's plant sends a one-tile ripple along the ground from the knee stone (dmg x0.4 x rank, commons and bosses alike, a short stagger on the small) */
  function scree(tx, fy) { const cx = tx * TS + TS / 2, gy = fy * TS; stats.screes = (stats.screes || 0) + 1;
    const reach = fk('gtlongscree') ? TS * 3 : TS, hard = fk('gthardscree');   /* LONG SCREE: three tiles either way; HARD SCREE: one tile, twice the blow, a longer reel */
    for (const e of foes()) { if (e.harmless || e.turncoat || Math.abs(e.x - cx) > reach + (e.w || 12) / 2 || Math.abs(e.y - gy) > 14) continue; api.hurtAs('heavy', e, dmg(GEO.scree.mul * (hard ? 2 : 1) * tal('scree')), cx, false); if (e.alive && !isBig(e)) e.stagger = Math.max(e.stagger || 0, hard ? 0.5 : GEO.scree.stagger); }
    api.dust(cx - TS / 2, gy, 4); api.dust(cx + TS / 2, gy, 4); api.ringAt(cx, gy - 1, 14, STONE.hi, 0.22); }
  const boardFill = () => Math.round(100 * Math.min(1, standing() / cap()));   /* the hero meter reads this: 3 stones = full */
  const empowered = () => (api.P.geoEmpT || 0) > api.time;   /* EMPOWERED: a perfect ward, for GEO.ward.emp seconds (main.js swordDmg reads it too) */

  /* ==== THE BASE MOVES ==== */
  /* FAULT LINE (hold X, from round 3): a LINE, not a spot. The stave slammed down, and a crack races along the floor ahead of her,
     hitting everything along its length once; the charge sets its length and its damage, and a full one ends in a rock spike that
     launches. No rock is written anywhere (RULE 1 has nothing to guard): the spike is drawn, and gone in 0.6 s. */
  const FL = GEO.fault;
  /* WHERE IT WILL RUN, for the blow and for the line drawn on the floor while she winds it (C1): the same answer both times. It walks
     the floor she stands on two pixels at a time and stops at the first GAP (no floor, solid or one-way, under it) or WALL (rock at her
     feet' height, one row up) - so it never crosses a pit and never climbs into rock (A12) */
  function faultPath(wound) {
    const P = api.P, f = P.face, w = Math.max(0, Math.min(1, wound)), want = FL.len0 + FL.lenK * w;
    const fy = floorRow(Math.floor(P.x / TS), Math.floor((P.y - 1) / TS), 1); if (fy === null) return null;
    let len = 0, stop = null;
    for (let d = 2; d <= want; d += 2) { const tx = Math.floor((P.x + f * d) / TS);
      if (api.isSolid(tx, fy - 1)) { stop = 'wall'; break; }
      if (!(api.isSolid(tx, fy) || api.isOneWay(api.tileAt(tx, fy)))) { stop = 'gap'; break; }
      len = d; }
    return { x0: P.x, dir: f, gy: fy * TS, len, want, full: w >= FL.fullAt, stop };
  }
  /* (claude/chargetiers) tier: 0 the short crack (a wound under T1), 1 THE STONE SHARD (no crack: a shard flung), 2 THE FAULT LINE (the full crack + spike), 3 THE RISING PILLAR (the full crack + a pillar) */
  function faultHeavy(wound, tier = 0) {
    const P = api.P; if (tier === 1) return stoneShard(); if (tier >= 2) wound = 1;
    const w = Math.max(0, Math.min(1, wound)), a = faultPath(w);
    api.SFX.geoThud && api.SFX.geoThud(); api.dust(P.x + P.face * 8, P.y, 5);
    if (!a) { api.number(P.x + P.face * 20, P.y - 20, 'NO GROUND THERE', '#9aa39a'); return null; }
    const fl = { heavy: true, x0: a.x0, dir: a.dir, gy: a.gy, len: Math.min(a.len, FL.len0), max: a.len, spike: a.full && tier !== 3, pillar: tier === 3, spiked: false, hit: new Set(), struck: 0, dmg: dmg(FL.mul0 + FL.mulK * w), life: a.len / FL.speed + FL.linger };
    if (tier >= 2) { stats.tiers[tier]++; api.number(P.x, P.y - 32, GEO.tiers.names[tier], GEO.tiers.label[tier]); }
    faults.push(fl); api.shakeCam(a.full ? 4 : 2); api.SFX.geoShard && api.SFX.geoShard();
    if (tier === 2 && api.SFX.geoQuake) api.SFX.geoQuake(); if (tier === 3 && api.SFX.geoRise) api.SFX.geoRise();   /* (claude/georead) each tier let go has its own low voice: the crack, the heave, the grinding rise */
    faultHits(fl);   /* THE CONTACT: what is touching her is hit in the release frame, not a beat later */
    return fl;
  }
  /* EVERYTHING ALONG IT, ONCE: a foe standing on the floor the crack runs through, anywhere between her and its tip */
  /* (claude/chargetiers) T1, THE STONE SHARD: a shard of her stone flung flat ahead at chest height - a missile ('shot'), where the crack cannot go (a flyer, a ledge) */
  /* (claude/herofeel, Daniel 11-02) THE UP-AIR: the airborne UP+X no longer jabs a stone spur (it needed a cell and an aim): the rising cut is an instant upward staff arc, and a FAN of
     three stone shards is flung up off it (about -60 / -90 / -120 degrees, UP_AIR.v px/s). No cell is placed; the ground spur is unchanged. Called once per airborne rising cut (main.js risingCut). */
  const UP_AIR = { angles: [-60, -90, -120], v: 300, g: 260, life: 0.5, dmg: 0.4 };
  function upAir() { const P = api.P; stats.upAir = (stats.upAir || 0) + 1;
    for (const a of UP_AIR.angles) { const r = a * Math.PI / 180; shards.push({ x: P.x + P.face * 6, y: P.y - 18, vx: Math.cos(r) * UP_AIR.v * P.face, vy: Math.sin(r) * UP_AIR.v, g: UP_AIR.g, life: UP_AIR.life, hit: new Set(), big: true, dmg: dmg(UP_AIR.dmg), fan: true }); }
    api.SFX.geoShard && api.SFX.geoShard(); api.sparks(P.x, P.y - 22, 0, 5); api.dust(P.x, P.y - 20, 3); }
  function stoneShard() { const P = api.P, S = GEO.tiers.shard; stats.tiers[1]++;
    shards.push({ x: P.x + P.face * 10, y: P.y - 13, vx: P.face * S.vx, vy: S.vy, g: S.g, life: S.life, hit: new Set(), big: true, dmg: dmg(S.dmg) });
    api.SFX.geoShard && api.SFX.geoShard(); api.sparks(P.x + P.face * 12, P.y - 13, P.face, 4); api.kitPose && api.kitPose(P, 'gShard', 0.2); return null; }
  /* (claude/chargetiers) T3, THE RISING PILLAR: under the first foe the crack found (in front of a boss or a mini - he is never lifted), or at the crack's tip: a pillar of her stone
     (erupt: strikes, LAUNCHES what is on it, heaves what is beside it) that STANDS as a step; the stone gives her wind back as it rises */
  function faultPillar(fl) { fl.spiked = true; const P = api.P, PL = GEO.tiers.pillar, e = fl.first && fl.first.alive ? fl.first : null, fy = Math.floor(fl.gy / TS);
    const x = e ? (api.lcBig(e) ? e.x - fl.dir * ((e.w || 12) / 2 + 6) : e.x) : fl.x0 + fl.dir * fl.max;
    const r = erupt(Math.floor(x / TS), fy, PL.h + (tal('tall') ? 1 : 0), 'pillar', { noHero: true, mul: PL.mul });
    stats.pf = stats.pf || []; if (stats.pf.length < 14) stats.pf.push([Math.round(x), fy, e ? 1 : 0, r.piece ? 1 : 0, Math.round(P.x), grid()[(fy - 1) * api.LW + Math.floor(x / TS)]]);
    stats.pillars++; if (r.piece) stats.steps++; if (e) GFK.geode(e);   /* GEODE (the stave's A side): the first foe the pillar found */ if (api.refund) api.refund(PL.refund); api.shakeCam(4); api.ringAt(x, fl.gy - 20, 18, GEO.tiers.cols[3], 0.35); api.dust(x, fl.gy, 10); }
  function faultHits(fl) {
    const lo = fl.dir > 0 ? fl.x0 - 2 : fl.x0 - fl.len, hi = fl.dir > 0 ? fl.x0 + fl.len : fl.x0 + 2;
    for (const e of foes()) { if (e.harmless || e.turncoat || fl.hit.has(e)) continue; const b = api.box(e);
      if (b.r < lo || b.l > hi || e.y < fl.gy - 10 || b.t > fl.gy) continue;   /* on the floor it runs through (a flyer over it is missed) */
      fl.hit.add(e); fl.struck++; if (!fl.first) fl.first = e; api.hurtAs('heavy', e, fl.dmg, fl.x0, false); api.sparks(e.x, e.y - (e.h || 16) / 2, fl.dir, 5);
      if (e.alive) e.stagger = Math.max(e.stagger || 0, api.lcBig(e) ? 0.15 : 0.35);
      if (fl.struck === 2) api.trialEvent && api.trialEvent('fault'); }   /* (her yard's station: two caught in one line) */
  }
  /* THE SPIKE at the end of a FULL charge: it juts up at the tip and launches what it hits (a boss, a flyer, a pinned thing is hit and staggered) */
  function faultSpike(fl) {
    fl.spiked = true; const x = fl.x0 + fl.dir * fl.max, launched = [];
    spikes.push({ x, gy: fl.gy, t: 0, hit: new Set(), dmg: 0, h: 34, w: 8 });   /* (t starts at 0, not below it: drawn, and the spike row's own hit never fires) */
    for (const e of foes()) { if (e.harmless || e.turncoat) continue; const b = api.box(e);
      if (Math.abs(e.x - x) > (e.w || 12) / 2 + 8 || e.y < fl.gy - 12 || b.t > fl.gy) continue;
      api.hurtAs('heavy', e, dmg(FL.spikeMul), x - fl.dir * 8, false); api.sparks(e.x, e.y - (e.h || 16) / 2, 0, 6);
      if (e.alive && liftable(e)) { e.vy = tal('tall') ? FL.spikeVyTall : FL.spikeVy; e.geoAirT = api.time; e.stagger = Math.max(e.stagger || 0, 0.6); launched.push(e); }
      else if (e.alive) e.stagger = Math.max(e.stagger || 0, 0.4); }
    api.dust(x, fl.gy, 8); api.shakeCam(3); api.SFX.geoRise && api.SFX.geoRise();
    if (launched.length) { gainTremor(GEO.tremor.launch * launched.length); api.number(x, fl.gy - 44, 'LAUNCHED', STONE.rune); }
  }
  /* RAISE WALL - her C until THE ROCK SHIELD replaced it, and from 2026-09-24 the bought STONE WALL (level 9, where LODESTONE was):
     a wall rises in the first column wholly in front of her. It stops a yellow blow and a shot, a blow on the beat bounces off it, and a
     red one smashes through (wallTakes). Held to THE CAP and the grid rules by tools/geomancer.mjs */
  function raiseWall() {
    const P = api.P, f = P.face, tx = f > 0 ? Math.ceil((P.x + P.w / 2) / TS) : Math.floor((P.x - P.w / 2) / TS) - 1;
    api.SFX.geoThud && api.SFX.geoThud(); api.kitPose(P, 'gWall', 0.34);
    const fy = floorRow(tx, Math.floor((P.y - 1) / TS), 2); if (fy === null) { api.dust(P.x + f * 10, P.y, 3); return null; }
    /* a small foe stood in that column is shoved out the far side of it, never walled in */
    for (const e of foes()) { const b = api.box(e); if (!api.overlap(cellBox(tx, fy - 1), b) && !api.overlap(cellBox(tx, fy - 2), b)) continue;
      if (!liftable(e)) continue; const nx = f > 0 ? (tx + 1) * TS + e.w / 2 + 1 : tx * TS - e.w / 2 - 1; api.moveBody(e, nx - e.x, 0, false); }
    const cells = []; for (let k = 1; k <= GEO.wallH + (fk('gtall') ? 2 : 0); k++) { if (!freeCell(tx, fy - k)) break; cells.push([tx, fy - k]); }   /* TALL WALL: four cells */
    if (fk('gbarricade')) for (let c = 1; c <= 2; c++) { const x2 = tx + f * c, g2 = api.isSolid(x2, fy) || api.isOneWay(api.tileAt(x2, fy)); if (!g2) continue; for (let k = 1; k <= GEO.wallH; k++) { if (!freeCell(x2, fy - k)) break; cells.push([x2, fy - k]); } }   /* BARRICADE: three columns wide, floor under each */
    const p = cells.length ? place('wall', cells, T().SOLID, fk('gbarricade') ? { hpPlus: 1 } : {}) : null;
    if (p) { p.face = f; api.SFX.geoRise && api.SFX.geoRise(); api.dust(tx * TS + 8, fy * TS, 6); }
    return p;
  }
  /* THE WALL IN A BLOW'S WAY (damagePlayer). A yellow blow from the far side stops on it - raised on the beat, the attacker's
     weapon bounces off and it staggers; a RED blow smashes straight through (red still means move), unless BULWARK takes it once. */
  function wallTakes(fromX, unblockable, foe) {
    const P = api.P, w = pieces.find(p => p.kind === 'wall' && !p.gone && Math.abs((p.x0 + p.x1) / 2 - P.x) < 44 && ((p.x0 + p.x1) / 2 - P.x) * (fromX - P.x) > 0 && Math.abs(fromX - P.x) >= Math.abs((p.x0 + p.x1) / 2 - P.x) - 8);
    if (!w) return null;
    const wx = (w.x0 + w.x1) / 2, wy = w.y0 + 6;
    if (unblockable) {
      if (tal('bulwark') && !fk('gtrootward') && (w.bulwarked | 0) < (fk('gtrootwall') ? 2 : 1)) { w.bulwarked = (w.bulwarked | 0) + 1; w.hp = 1;   /* ROOTED WALL holds twice, HARD ROOTS never */ api.SFX.geoBounce(); api.shakeCam(4); api.number(wx, wy - 14, 'THE WALL HOLDS', STONE.rune); api.sparks(wx, wy, -Math.sign(wx - P.x), 8); return 'blocked'; }
      api.number(wx, wy - 14, 'SMASHED THROUGH', '#ff6b6b'); crumble(w, 'smashed'); return null; }
    const perfect = api.time - w.born < GEO.perfect;
    if (perfect && foe) { foe.stagger = Math.max(foe.stagger || 0, api.lcBig(foe) ? 0.5 : 1.2); foe.flash = 0.2; if (!foe.maxHp) foe.vx = Math.sign(foe.x - P.x) * 150;
      api.number(wx, wy - 14, 'BOUNCED OFF', STONE.rune); api.hitstop(0.08); api.ringAt(wx, wy + 6, 16, STONE.rune, 0.3); gainTremor(GEO.tremor.perfect); api.noteParry && api.noteParry(); P.geoBeatT = api.time; }   /* (geoBeatT: her yard asks whether THIS blow bounced) */
    else { api.number(wx, wy - 14, 'THE WALL TAKES IT', STONE.hi); gainTremor(GEO.tremor.wall); }
    api.SFX.geoBounce(); api.sparks(wx, wy, -Math.sign(wx - P.x) || 1, 6); api.shakeCam(2);
    if (!perfect && --w.hp <= 0) crumble(w, 'broken');
    return 'blocked';
  }
  /* ==== THE RUNE-WARD (her C from round 3; docs/briefs/geomancer.md ROUND 3, 2). C goes down: the stave is planted and a slab of
     rune-cut stone rises in front of her - GEO.ward.raise to come up, taller than she is, its top lipped back over her head. While
     it stands she is ROOTED (she can turn on the planted stave, not walk), holding it drains wind as the Knight's does, and it takes
     YELLOW blows and shots from the front and from overhead for GEO.ward.hitSt wind each; out of wind it breaks (GUARD BREAK: half the
     blow finds her, as it does him). A RED blow BREAKS THROUGH it - the ward shatters and the blow goes on into her (red still means
     move; BULWARK halves it). Raised as a blow lands (within GEO.ward.perfect of rising) it is a PERFECT WARD: the blow bounces off,
     the attacker staggers, it costs nothing, a shot is thrown back the way it came - and she is EMPOWERED. No riposte: that is his. ==== */
  const WD = GEO.ward;
  const wardUp = () => { const P = api.P; return !!P.geoGuard && api.time - P.geoGuardAt >= WD.raise; };
  const wardPerfect = () => { const P = api.P, k = api.time - P.geoGuardAt - WD.raise; return k >= 0 && k < WD.perfect; };
  /* up while C is held (and for `hold` once it has risen, so a tap on the beat is a guard); `turn` is the way she is pressing, so she
     can turn on the planted stave; dt pays for holding it */
  function guard(want, can, dt = 0, turn = 0) { const P = api.P;
    if (!can || (P.geoWardLock || 0) > api.time || (!P.geoGuard && !(P.st > 0))) { if (P.geoGuard) P.geoGuard = false; return; }
    if (want && !P.geoGuard) { P.geoGuard = true; P.geoGuardAt = api.time; api.SFX.geoThud && api.SFX.geoThud(); api.dust(P.x + P.face * 8, P.y, 3); }   /* the stave planted: the thud */
    else if (P.geoGuard && !want && api.time - P.geoGuardAt >= WD.raise + WD.hold) P.geoGuard = false;
    if (!P.geoGuard) return;
    P.rootT = Math.max(P.rootT || 0, 0.05); P.vx = 0; if (turn) P.face = turn;   /* ROOTED: the stave is in the ground */
    if (wardUp() && !P.geoWardRose) { P.geoWardRose = true; api.SFX.geoRise && api.SFX.geoRise(); wardRoot(); } else if (!wardUp()) P.geoWardRose = false;   /* (the grind of it coming up) */
    if (api.time - P.geoGuardAt > WD.raise + WD.perfect) { P.st -= WD.holdSt * dt; P.stDelay = Math.max(P.stDelay || 0, 0.5);   /* holding it costs, as his does: the beat itself is free */
      if (P.st <= 0) { P.st = 0; P.stFlash = 0.5; breakWard('TIRED', STONE.hi); } } }
  /* the ward's face in front of her and the lip over her head (for a shot it meets, and for the draw) */
  const wardBoxes = () => { const P = api.P, f = P.face, fr = f > 0 ? { l: P.x + 6, r: P.x + 13 } : { l: P.x - 13, r: P.x - 6 }, lip = f > 0 ? { l: P.x - 7, r: P.x + 13 } : { l: P.x - 13, r: P.x + 7 };
    return [{ ...fr, t: P.y - 34, b: P.y + 1 }, { ...lip, t: P.y - 36, b: P.y - 29 }]; };
  function breakWard(how, col) { const P = api.P, [b] = wardBoxes(), x = (b.l + b.r) / 2, y = (b.t + b.b) / 2;
    P.geoGuard = false; P.geoWardLock = api.time + WD.lock; api.burst(x, y, 18, [STONE.hi, STONE.base, EARTH.base, EARTH.lo, STONE.rune], 140, 0.5); api.SFX.geoCrumble && api.SFX.geoCrumble(); api.SFX.geoShard && api.SFX.geoShard(); api.shakeCam(3);
    api.number(x, y - 20, how, col);
    if (tal('shrapnel')) shrap(x, y, P.face); }   /* SHRAPNEL: what is left of it flies at them */
  function wardParry(foe) { const P = api.P, [b] = wardBoxes(), x = (b.l + b.r) / 2, y = b.t + 10;
    if (api.parried) { api.parried(foe); if (foe && !foe.maxHp && !foe.mini && !foe.elite) foe.vx = Math.sign(foe.x - P.x) * 160; }   /* (claude/riposte) STONE-SKIN on the beat: the shared parry -> riposte (src/riposte.js) */
    else if (foe) { foe.stagger = Math.max(foe.stagger || 0, api.lcBig(foe) ? 0.35 : 1.1); foe.flash = 0.2; if (!foe.maxHp) foe.vx = Math.sign(foe.x - P.x) * 160; }   /* (the Knight's own stagger: the blow bounces, that is all) */
    const was = empowered(); P.geoEmpT = api.time + WD.emp;
    api.number(x, y - 14, was ? 'EMPOWERED AGAIN' : 'EMPOWERED', STONE.rune); api.hitstop(0.08); api.ringAt(x, y + 6, 18, STONE.rune, 0.3); api.sparks(x, y, P.face, 8);
    gainTremor(GEO.tremor.perfect); api.noteParry && api.noteParry(); P.geoBeatT = api.time; }   /* (geoBeatT: her yard asks whether THIS blow was on the beat) */
  /* GRIT WARD: the blow the ward takes throws grit back at whoever struck it - a third of a blow; the small ones reel, a boss takes the grit only */
  function gritBack(foe) { if (!fk('ggrit') || !foe || foe.harmless || foe.turncoat) return; api.hurtAs('shot', foe, dmg(0.33), api.P.x, false); api.sparks(foe.x, foe.y - (foe.h || 16) / 2, -api.P.face, 4);
    if (foe.alive && !isBig(foe) && liftable(foe)) foe.stagger = Math.max(foe.stagger || 0, 0.5); }
  /* BOARD WARD: the ward rising plants a knee stone two tiles ahead (board not full, once every 3 s) */
  function wardRoot() { const P = api.P; if (!fk('gboardward') || standing() >= cap() || api.time - (P.geoWardRootAt ?? -9) < 3) return;
    const tx = Math.floor(P.x / TS) + P.face * 2, fy = floorRow(tx, Math.floor((P.y - 1) / TS), 2); if (fy === null || !freeCell(tx, fy - 1) || pieces.some(q => !q.gone && q.cells.some(c => c.tx === tx))) return;
    const r = erupt(tx, fy, 1, 'pillar', { noHero: true, hurt: false, noLaunch: true }); if (!r.piece) return; r.piece.knee = true; P.geoWardRootAt = api.time; api.ringAt(tx * TS + 8, fy * TS - 2, 12, STONE.rune, 0.2); api.number(tx * TS + 8, fy * TS - 22, 'ROOTED', STONE.hi); }
  /* A BLOW ON IT (damagePlayer asks first): 'blocked', 'half' (out of wind - a GUARD BREAK - or BULWARK under a red blow) or null (not in its way) */
  function wardTakes(fromX, unblockable, foe) {
    const P = api.P; if (!wardUp()) return null;
    const over = Math.abs(fromX - P.x) <= 8 && (!foe || foe.y - (foe.h || 16) < P.y - 20);   /* OVERHEAD: a blow from right over her - the lip takes it */
    if (Math.sign(fromX - P.x) !== P.face && fromX !== P.x && !over) return null;   /* a blow from behind finds her */
    const [b] = wardBoxes(), x = (b.l + b.r) / 2, y = b.t + 10;
    if (unblockable) { breakWard('BROKEN THROUGH', '#ff6b6b'); if (tal('bulwark') && fk('gtrootward') && foe && !isBig(foe) && liftable(foe)) { foe.stagger = Math.max(foe.stagger || 0, 0.6 * tal('bulwark')); api.number(foe.x, foe.y - (foe.h || 16) - 14, 'REELING', STONE.hi); }   /* HARD ROOTS */
      return tal('bulwark') ? 'deep' : null; }   /* DEEP ROOTS: main.js scales 'deep' by rank (half the blow at rank III) */   /* RED STILL MEANS MOVE: it breaks, and the blow goes on into her */
    api.SFX.geoBounce(); api.sparks(x, y, P.face, 6); gritBack(foe);   /* GRIT WARD */
    if (wardPerfect()) { wardParry(foe); api.teach && api.teach('perfect'); return 'blocked'; }   /* PERFECT: it costs nothing */
    const hitSt = WD.hitSt + (fk('gboardward') ? 4 : 0);   /* BOARD WARD: a blocked blow costs 4 more wind, the price of the stone */
    if (P.st < hitSt) { P.st = 0; P.stFlash = 0.5; breakWard('GUARD BREAK', '#ffd36b'); P.hurt = Math.max(P.hurt || 0, 0.55); return 'half'; }   /* out of wind: his guard break, half the blow */
    P.st -= hitSt; P.stDelay = Math.max(P.stDelay || 0, 0.5); gainTremor(GEO.tremor.wall); api.shakeCam(2); api.number(x, y - 14, 'WARDED', STONE.hi); api.teach && api.teach('warded');   /* (claude/georead) the first plain block says where the beat is */
    return 'blocked'; }
  /* THE THIRD BLOW (the spin) shatters any stone piece it hits and sprays it forward as shards */
  function shatter(p, dir) { crumble(p, 'shatter'); burstShards((p.x0 + p.x1) / 2, (p.y0 + p.y1) / 2, dir, 5); api.number((p.x0 + p.x1) / 2, p.y0 - 12, 'SHATTERED', STONE.hi); api.hitstop(0.05); api.shakeCam(4, dir * 2); }
  /* SHRAPNEL's shards by side: base 4 x rank; SPLINTERS twice as many at 0.35; HEAVY SHARDS half as many at 1.2 */
  function shrap(x, y, dir) { const n = Math.max(1, Math.round(4 * tal('shrapnel')));
    if (fk('gtsplinters')) burstShards(x, y, dir, n * 2, { dmg: dmg(0.35) }); else if (fk('gtslugs')) burstShards(x, y, dir, Math.max(1, Math.round(n / 2)), { dmg: dmg(1.2) }); else burstShards(x, y, dir, n); }
  function burstShards(x, y, dir, n, o) {
    let d = dir; if (!d) { const f = foes().filter(e => !e.harmless).sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x))[0]; d = f ? Math.sign(f.x - x) || 1 : api.P.face; }
    for (let i = 0; i < n; i++) shards.push({ x, y: y + (i - n / 2) * 3, vx: d * (240 + i * 26), vy: -50 + i * 22, life: 0.55, hit: new Set(), dmg: o && o.dmg });
    api.SFX.geoShard && api.SFX.geoShard(); }
  /* ROLLING STONE (X early in a dash): she kicks a small stone ahead that bowls through little foes */
  function rollStone() { const P = api.P; rollers.push({ x: P.x + P.face * 12, y: P.y, vy: 0, dir: P.face, ...GEO.roll, bounces: 0, hit: new Set(), spin: 0, kind: 'roll' }); api.SFX.geoThud(); }
  /* THE QUAKE (a full TREMOR, tap C on the ground): every grounded foe knocked down, and loose rock falls - each told by a shadow */
  function quake() {
    const P = api.P, R = GEO.quakeR * (tal('wideQuake') ? mulK(GEO.quakeWideMul, tal('wideQuake')) : 1);
    P.tremor = 0; P.blastT = 0.6; P.atk = -1; P.vx = 0; api.SFX.geoThud(); api.SFX.geoQuake && api.SFX.geoQuake(); api.shakeCam(10); api.zoomKick(1.08, 0.3);
    api.ringAt(P.x, P.y - 2, 60, STONE.rune, 0.5); api.dust(P.x - 20, P.y, 10); api.dust(P.x + 20, P.y, 10); api.number(P.x, P.y - 34, 'THE QUAKE', STONE.rune);
    for (const e of foes()) { if (e.harmless || e.turncoat || Math.abs(e.x - P.x) > R || Math.abs(e.y - P.y) > 48 || e.noGrav) continue;
      api.hurtAs('heavy', e, dmg(1.1), P.x, false); if (e.alive && !floor(e, 1.6)) e.stagger = Math.max(e.stagger || 0, 0.6); }
    const n = tal('wideQuake') ? 7 + Math.round(3 * tal('wideQuake')) : 7, aimed = foes().filter(e => !e.harmless && Math.abs(e.x - P.x) < R).slice(0, n);
    for (let i = 0; i < n; i++) { const x = aimed[i] ? aimed[i].x : P.x + (i % 2 ? 1 : -1) * (30 + Math.floor(i / 2) * (R / 4)); dropRock(x, 0.35 + i * 0.1, dmg(0.9), 0.9, aimed[i]); }
    api.trialEvent && api.trialEvent('meter');
  }
  /* a rock that falls from above onto the floor at x, told by a shadow that grows under it */
  function dropRock(x, delay, hit, knock, foe, big) {
    const tx = Math.floor(x / TS), P = api.P; const fy = floorRow(tx, Math.max(0, Math.floor((P.y - 120) / TS)), 16);
    const gy = fy === null ? P.y : fy * TS; falls.push({ x, gy, y: gy - 170, delay, max: delay, st: 'wait', hit, knock, foe, r: big ? 8 : 5 }); }

  /* ==== EARTHFALL (claude/plunges): HER PLUNGE. A stone spike rises where she lands - under the nearest foe within a hand's reach, else one tile ahead
     of her (then behind) - and HITS (the plunge's own blow, tagged 'plunge': FROM ABOVE's key) and stands EARTH_FALL.life s as a ONE-TILE STEP, cracking for its
     last second. It is written only into open level with four tiles of air over it (never a tunnel or a ledge), never within EARTH.gateR tiles of a gate,
     a door, a plate or a lever (api.blockedAt), at most one at a time and OUTSIDE her cap of three. It is a step for a moment, never a way: baseGrid() is the
     level with every stone of hers taken out, and it is what the reach fill (main.js wayBuild) reads. onFoe: she came down on a head - the step rises
     under it without a second blow and without throwing it (the head was the blow). Returns { struck, piece, why } ==== */
  /* (claude/herofeel, Daniel 11-02: "no standing stone left") THE NEW EARTHFALL: the landing is a SHOCKWAVE. Short stone spikes burst up either side of her (visual: they crumble at once, no cell is written), and every foe within
     EARTH_FALL.wave px is hit (the plunge's own blow, tag 'plunge') and KNOCKED DOWN (floorFoe: a boss / mini / elite is only staggered). No piece, no step: baseGrid() and the reach fill have nothing of it to take out. */
  /* SPIKE STEP (the plunge's A side): one tile ahead of her (else behind), two stones tall, four seconds, a step outside her three; never in a tunnel (five cells of air over it) or near a gate (blockedAt) */
  function spikeStep() { const P = api.P;
    for (const d of [P.face, -P.face]) { const tx = Math.floor(P.x / TS) + d, fy = floorRow(tx, Math.floor((P.y - 1) / TS), 2); if (fy === null || (api.blockedAt && api.blockedAt(tx, fy))) continue;
      let air = true; for (let k = 1; k <= 5; k++) if (!freeCell(tx, fy - k)) air = false; if (!air) continue;
      const r = erupt(tx, fy, 2, 'step', { noHero: true, hurt: false, noLaunch: true, free: true, life: 4 }); if (r.piece) { api.number(tx * TS + 8, fy * TS - 36, 'SPIKE STEP', STONE.hi); return true; } }
    return false; }
  function earthfall(o = {}) {
    const P = api.P, R = EARTH_FALL.wave * (fk('gwidefall') ? 1.6 : 1), fy = floorRow(Math.floor(P.x / TS), Math.floor((P.y - 1) / TS), 3), gy = fy === null ? P.y : fy * TS;
    for (const d of [-1, 1]) for (let i = 1; i <= EARTH_FALL.spikes; i++) spikes.push({ x: P.x + d * (6 + i * 11), gy, t: -0.05 * (i - 1), hit: new Set(), dmg: 0, h: 34 - 6 * i, w: 7, vis: true, end: 0.34 });   /* told by the spikes, hit by the wave below */
    api.dust(P.x - 10, gy, 6); api.dust(P.x + 10, gy, 6); api.shakeCam(4); api.SFX.geoRise && api.SFX.geoRise();
    const hit = [];
    for (const e of foes()) { if (e.harmless || e.turncoat || Math.abs(e.x - P.x) > R + (e.w || 12) / 2 || Math.abs(e.y - P.y) > 28) continue;
      if (e !== o.anchor) api.hurtAs('plunge', e, dmg(EARTH_FALL.mul * (fk('gwidefall') ? 1.2 : 1), 'stoneStep'), P.x, false);   /* WIDE FALL: 60% farther, a fifth harder, 0.4 s longer down */
      hit.push(e); api.sparks(e.x, e.y - (e.h || 16) / 2, Math.sign(e.x - P.x) || 1, 5);
      if (e.alive) { if (floor(e, EARTH_FALL.down + (fk('gwidefall') ? 0.4 : 0))) api.number(e.x, e.y - (e.h || 16) - 14, 'KNOCKED DOWN', STONE.rune); } }
    if (fk('gspikestep')) spikeStep();   /* SPIKE STEP: a two-stone step, outside her cap */
    gainTremor(GEO.tremor.launch + (hit.length ? 6 : 0));
    return { struck: hit.length, piece: null, hit, why: null };
  }
  /* THE LEVEL WITHOUT HER STONE: a copy of the grid with every piece taken back out (the reach fill must never count a step of hers as a way) */
  function baseGrid() { const g0 = grid(), g = g0.slice(); for (const p of pieces) if (p.grid === g0) for (const c of p.cells) if (g[c.i] === p.tile) g[c.i] = c.was; return g; }

  /* ==== THE NINE (main.js geomancerKit calls these once it has checked the press, the wait and the wind) ==== */
  const kit = {
    /* STONE STEP: on the ground a pillar under her own feet lifts her; in the air a stone appears under her boots and she jumps off it */
    stoneStep() { const P = api.P; api.kitPose(P, 'gStep', 0.32); api.SFX.geoThud(); const tx = Math.floor(P.x / TS);
      if (P.ground) { const fy = Math.floor((P.y + 1) / TS); erupt(tx, fy, GEO.pillarH + (tal('tall') ? 1 : 0), 'step', { heroVy: GEO.stepVy, hurt: false }); return; }
      const ty = Math.floor((P.y + 2) / TS); const p = freeCell(tx, ty) ? place('step', [[tx, ty]], T().ONEWAY) : null;
      if (p) P.y = ty * TS; P.vy = GEO.stepVy; P.ground = false; P.coyote = 0; api.dust(P.x, P.y, 6); api.squash(0.8, 1.25, 0.1); },
    boulder() { const P = api.P; api.kitPose(P, 'gHeave', 0.34);
      if (fk('ggreat')) rollers.push({ x: P.x + P.face * 16, y: P.y, vy: 0, dir: P.face, ...GEO.boulder, sp: GEO.boulder.sp * 0.6, r: GEO.boulder.r * 2, dmg: GEO.boulder.dmg * 2, bounces: 1, bigKnock: 1.5, hit: new Set(), spin: 0, kind: 'boulder' });   /* GREAT BOULDER */
      else if (fk('gscatter')) for (const [i, m] of [1.15, 0.85, 0.6].entries()) rollers.push({ x: P.x + P.face * (14 + i * 3), y: P.y, vy: 0, dir: P.face, ...GEO.boulder, sp: GEO.boulder.sp * m, r: 5, dmg: GEO.boulder.dmg * 0.5, bounces: 3, hit: new Set(), spin: 0, kind: 'boulder' });   /* SCATTER */
      else rollers.push({ x: P.x + P.face * 14, y: P.y, vy: 0, dir: P.face, ...GEO.boulder, hit: new Set(), spin: 0, kind: 'boulder' });
      api.SFX.geoRise(); api.shakeCam(3); },
    spikeRow() { const P = api.P; api.kitPose(P, 'gSpikes', 0.4); api.SFX.geoThud(); let fy0 = Math.floor((P.y + 1) / TS);
      for (let i = 0; i < 5; i++) { const x = P.x + P.face * (20 + 15 * i), tx = Math.floor(x / TS), fy = floorRow(tx, fy0 - 1, 2); if (fy === null || api.isSolid(tx, fy - 1)) break; fy0 = fy;
        spikes.push({ x, gy: fy * TS, t: -0.06 * i - 0.1, hit: new Set(), dmg: dmg(0.7, 'spikeRow') }); } },
    archway() { const P = api.P; api.kitPose(P, 'gArch', 0.5); api.SFX.geoRise(); const f = P.face, tx0 = Math.floor(P.x / TS), fy = Math.floor((P.y + 1) / TS);
      const ground = tx => api.isSolid(tx, fy) || api.isOneWay(api.tileAt(tx, fy)); let a = null, b = null;
      for (let k = 1; k <= 8; k++) { const tx = tx0 + f * k; if (a === null) { if (!ground(tx)) a = tx; } else if (ground(tx)) { b = tx - f; break; } }
      const cells = []; if (a !== null && b !== null) { for (let tx = a; tx !== b + f; tx += f) cells.push([tx, fy]); }
      else for (let k = -1; k <= 1; k++) cells.push([tx0 + k, fy - 4]);   /* no gap: an arch over her, a shelter */
      const p = place('arch', cells, T().SOLID); if (p) { api.dust((p.x0 + p.x1) / 2, p.y1, 8); api.number((p.x0 + p.x1) / 2, p.y0 - 12, a !== null && b !== null ? 'A BRIDGE' : 'AN ARCH', STONE.hi); } },
    /* STONE WALL (level 9, in LODESTONE's place from 2026-09-24): her old C, bought back - RAISE WALL, below */
    stoneWall() { return raiseWall(); },
    entomb() { const P = api.P; api.kitPose(P, 'gTomb', 0.36); api.SFX.geoThud();
      const e = foes().filter(q => !q.harmless && !q.turncoat && (q.x - P.x) * P.face > -6 && Math.abs(q.x - P.x) < 72 && Math.abs(q.y - P.y) < 40).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
      if (!e) { api.number(P.x + P.face * 30, P.y - 24, 'NOTHING TO SEAL', '#9aa39a'); return; }
      if (api.lcBig(e)) { e.disarmOpenT = api.time + 1.5; e.stagger = Math.max(e.stagger || 0, 0.4); api.number(e.x, e.y - (e.h || 16) - 20, 'OPENED UP', STONE.rune); api.SFX.geoBounce(); return; }
      e.frozen = 3; e.stagger = Math.max(e.stagger || 0, 3); e.vx = 0; e.geoTomb = { t: 3, cracks: 0 }; api.SFX.geoRise(); api.number(e.x, e.y - (e.h || 16) - 20, 'ENTOMBED', STONE.hi); },
    faultLine() { const P = api.P; api.kitPose(P, 'gFault', 0.45); api.SFX.geoQuake(); api.shakeCam(5); for (const d of [P.face, -P.face]) faults.push({ x0: P.x + d * 8, dir: d, len: 0, max: fk('ghighrift') ? 70 : fk('glongrift') ? 200 : 130, gy: Math.floor((P.y + 1) / TS) * TS, hit: new Set(), life: fk('glongrift') ? 1.2 : 0.9, kick: fk('ghighrift') }); },   /* (claude/herokit) THE RIFT splits the floor BOTH ways at once (her innate FAULT LINE is the one long crack ahead) */
    golem() { const P = api.P; api.kitPose(P, 'gGolem', 0.5); api.SFX.geoRise(); const g0 = { x: P.x + P.face * 22, y: P.y, vy: 0, face: P.face, life: 10, atkT: 0.4, swing: 0, rise: 0 }; golem2 = null;
      if (fk('gtwingolem')) { golem = { ...g0, x: P.x + P.face * 22, sc: 0.8, sp: 75, every: 1.0, k: 0.32, idx: 0 }; golem2 = { ...g0, x: P.x - P.face * 22, face: -P.face, sc: 0.8, sp: 75, every: 1.0, k: 0.32, idx: 1 }; api.dust(golem2.x, golem2.y, 8); }   /* TWO GOLEMS */
      else if (fk('gbiggolem')) golem = { ...g0, sc: 1.5, sp: 40, every: 1.6, k: 1.0, stag: 0.7 };   /* BIG GOLEM */
      else golem = g0;
      api.dust(golem.x, golem.y, 8); },
    avalanche() { const P = api.P; api.kitPose(P, 'gAval', 0.6); api.SFX.geoQuake(); api.shakeCam(6); P.atk = -1;
      const aimed = foes().filter(e => !e.harmless && !e.turncoat && Math.abs(e.x - P.x) < 190 && Math.abs(e.y - P.y) < 120).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x)).slice(0, 6);
      const xs = aimed.map(e => e.x); for (let k = 0; xs.length < 10 && k < 20; k++) { const x = P.x + (k % 2 ? 1 : -1) * (24 + Math.floor(k / 2) * 36); if (!xs.some(q => Math.abs(q - x) < 18)) xs.push(x); }
      xs.forEach((x, i) => dropRock(x, 0.55 + i * 0.1, dmg(0.6, 'avalanche'), 1.2, aimed[i] || null, true)); },
  };
  /* ==== THE BOARD (claude/geoid). FOES BREAK HER STONE: one pressed against it for GEO.stone.gnaw s loses it a hp; one that RAMS it at charge speed breaks it outright and is OPENED UP
     (a boss is stunned for a beat: a told reaction, not an invulnerability - B10). A body's speed is its x-travel over the last frames (so any charger, any boss, with no per-foe table). ==== */
  function footBreak(dt) {
    if (!pieces.length) { for (const e of api.enemies) { e._gx = undefined; e._geoSp = 0; e._geoGn = 0; } return; }
    const SS = GEO.stone, cells = []; for (const p of pieces) for (const c of p.cells) cells.push([p, c]);
    for (const e of foes()) {
      const sp = e._gx === undefined ? 0 : Math.abs(e.x - e._gx) / Math.max(dt, 1e-3); e._gx = e.x; e._geoSp = Math.max(sp, (e._geoSp || 0) * Math.pow(0.002, dt));
      if (e.harmless || e.turncoat || e.frozen > 0 || e.pinned > 0 || e.geoTomb) { e._geoGn = 0; continue; }
      const eb = api.box(e), dir = e.face || Math.sign(e.vx || 0) || 1; let hit = null;
      for (const [p, c] of cells) { if (p.gone) continue; const cb = cellBox(c.tx, c.ty);
        if (cb.r < eb.l - 3 || cb.l > eb.r + 3 || cb.b < eb.t + 3 || cb.t > eb.b - 3) continue;   /* beside the body, not under its feet or over its head */
        if (Math.sign((cb.l + cb.r) / 2 - e.x) !== dir) continue; hit = p; break; }
      if (!hit) { e._geoGn = Math.max(0, (e._geoGn || 0) - dt * 2); continue; }
      if (e._geoSp >= SS.chargeSp) {   /* RAMMED */
        const big = api.lcBig(e) || !!e.maxHp || !!e.mini, x = (hit.x0 + hit.x1) / 2, y = hit.y0 + 6; e._geoSp = 0; e._geoGn = 0; stats.rams++;
        crumble(hit, 'rammed'); api.shakeCam(big ? 5 : 3); api.hitstop(0.05); api.number(x, y - 14, 'ROCK BREAKS', STONE.hi);
        if (e.alive) { e.stagger = Math.max(e.stagger || 0, big ? SS.ramStagger : 0.6); if (big) { e.disarmOpenT = api.time + SS.openT; api.number(e.x, e.y - (e.h || 16) - 20, 'OPENED UP', STONE.rune); } }
        continue; }
      e._geoGn = (e._geoGn || 0) + dt;
      if (e._geoGn >= SS.gnaw) { e._geoGn = 0; hit.hp--; stats.gnaws++; api.sparks((hit.x0 + hit.x1) / 2, hit.y0 + 8, -dir, 4); api.SFX.geoBounce && api.SFX.geoBounce();
        if (hit.hp <= 0) { api.number((hit.x0 + hit.x1) / 2, hit.y0 - 12, 'BROKEN', STONE.hi); crumble(hit, 'broken'); } }
    }
  }
  /* AVALANCHE (UP+C with the board FULL - cap stones standing): every stone of hers ERUPTS where it stands (a pillar that launches the common foe in its column) and a beat later ROLLS away from her
     as a boulder down the room. The stones are consumed. A boss or a mini takes swordDmg x GEO.avalanche.boss from each boulder that reaches it (a stagger too); a common foe is bowled over. */
  let avAt = -9, erupts = [];
  const isBig = e => !!(e.maxHp || e.mini || e === api.boss || api.lcBig(e));
  const avalancheReady = () => standing() >= cap();
  let col = null;   /* (claude/geofix) the MOUNTAIN COLLAPSE in progress */
  const calm = () => !!(api.reduceMotion && api.reduceMotion());
  function avalanche() {
    const P = api.P, own = pieces.filter(p => p.capped && !p.gone), C = GEO.collapse;
    if (own.length < cap() || own.length < 1 || api.time - avAt < 0.5 || col) return false; avAt = api.time; stats.topples++; stats.avalanches = (stats.avalanches || 0) + 1;
    if (fk('ggreatfault') || fk('ghost')) {   /* THE CAPSTONES (the ult's A / B): the same fuel and input, the same damage budget (src/geo-forks.js) */
      const stones = own.map(p => ({ x: (p.x0 + p.x1) / 2, gy: p.y1, h: Math.round((p.y1 - p.y0) / TS) }));
      for (const p of own) { api.burst((p.x0 + p.x1) / 2, (p.y0 + p.y1) / 2, 10, [STONE.base, STONE.hi, STONE.lo, STONE.moss], 60, 0.5); crumble(p, 'silent'); }
      return fk('ggreatfault') ? GFK.greatFault(stones) : GFK.stoneHost(stones); }
    const n = own.length, B = C.per * n, W = api.VW, H = api.VH, left = api.camX, top = api.camY, s = W / (B - n), zone = n * s / 2;
    for (const p of own) { api.burst((p.x0 + p.x1) / 2, (p.y0 + p.y1) / 2, 10, [STONE.base, STONE.hi, STONE.lo, STONE.moss], 60, 0.5); crumble(p, 'silent'); }   /* the stones are the fuel: torn up and spent */
    const landY = x => { const tx = Math.floor(x / TS), t0 = Math.floor(top / TS), t1 = Math.min(api.LH - 1, t0 + Math.ceil(H / TS) + 1); let air = false;
      for (let ty = Math.max(0, t0); ty <= t1; ty++) { const solid = api.isSolid(tx, ty) || api.isOneWay(api.tileAt(tx, ty)); if (!solid) air = true; else if (air) return ty * TS; } return top + H - 4; };
    const span = C.span * (tal('rumble') && !fk('gtheavyroll') ? mulK(fk('gtlongroll') ? 2.0 : 1.5, tal('rumble')) : 1);   /* HEAVY ROLL takes no extra time */   /* RUMBLE (the old 'boulders roll half as far again'): the wave takes half as long again to crash across the screen - no extra damage, the screen is covered either way */
    const bl = []; for (let i = 0; i < B; i++) { const x = left - (n - 1) * s / 2 + i * s; bl.push({ x, gy: landY(Math.max(1, Math.min(api.LW * TS - 1, x))), rank: 0, tl: 0, hit: new Set(), landed: false, seed: i * 7 + 3, r: C.r - (i % 3) }); }
    [...bl].sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x)).forEach((b, k) => { b.rank = k; b.tl = C.rain + C.fall + (k / Math.max(1, B - 1)) * span; });   /* outward from her */
    const cracks = []; const nc = 9; for (let i = 0; i < nc; i++) { const sx = left + ((i + 0.5) / nc) * W + ((i * 37) % 11) - 5, pts = [[sx, top]]; let x = sx, y = top;
      const len = 3 + (i % 3) + 2; for (let k = 0; k < len; k++) { x += ((i * 13 + k * 29) % 17) - 8; y += 9 + ((i * 7 + k * 11) % 9); pts.push([x, y]); }
      cracks.push({ pts, d: Math.abs(sx - P.x) / (W * 0.6), br: i % 2 }); }
    col = { t: 0, span, x0: P.x, y0: P.y, left, top, W, H, n, B, zone, bl, cracks, plumes: [], pile: [], slam: false, nums: new Set(), veil: 0, grit: 0 };
    api.hitstop && api.hitstop(C.freeze); if (!calm() && api.pullBack) api.pullBack(C.pull, C.pullT);
    api.kitPose && api.kitPose(P, 'gAval', 0.35); P.atk = -1; api.number(P.x, P.y - 34, 'MOUNTAIN COLLAPSE', STONE.rune); api.SFX.geoQuake && api.SFX.geoQuake(); if (!calm()) api.shakeCam(4);
    return true; }
  function stepCollapse(dt) { if (!col) return; const C = GEO.collapse, c = col, P = api.P; c.t += dt;
    if (!c.slam && c.t >= C.slam) { c.slam = true; api.kitPose && api.kitPose(P, 'gHeave', 0.5); api.SFX.geoThud && api.SFX.geoThud(); if (!calm()) api.shakeCam(9); api.dust(c.x0 - 8, c.y0, 8); api.dust(c.x0 + 8, c.y0, 8); api.ringAt(c.x0, c.y0 - 1, 24, STONE.rune, 0.3); api.ringAt(c.x0, c.y0 - 1, 40, STONE.hi, 0.45); api.SFX.geoRise && api.SFX.geoRise(); }
    if (c.t > C.crack && c.t < C.rain + 0.4 && api.parts) { c.grit -= dt; if (c.grit <= 0) { c.grit = 0.03; const k = c.cracks[(Math.random() * c.cracks.length) | 0], reach = Math.min(1, (c.t - C.crack) / C.crackDur); if (k.d < reach) { const q = k.pts[1 + ((Math.random() * (k.pts.length - 1)) | 0)];
        api.parts.push({ x: q[0], y: q[1], vx: (Math.random() - 0.5) * 16, vy: 10 + Math.random() * 30, life: 0.7, max: 0.7, col: Math.random() < 0.5 ? STONE.lo : '#8c6844', size: Math.random() < 0.3 ? 2 : 1, grav: 380 }); } } }
    for (const b of c.bl) { if (b.landed || c.t < b.tl) continue; b.landed = true; stats.collapseHits = stats.collapseHits || 0;
      const AV = GEO.avalanche, wide = tal('wideQuake') ? mulK(1.5, tal('wideQuake')) : 1, hr = fk('gtheavyroll') ? mulK(1.5, tal('rumble')) : 1;   /* HEAVY ROLL: commons half again as hard (a boss takes the old blow) */
      for (const e of foes()) { if (e.harmless || e.turncoat || Math.abs(e.x - b.x) > c.zone || e.y < c.top - 24 || e.y > c.top + c.H + 24) continue; const big = isBig(e); b.hit.add(e); stats.collapseHits++;
        const hp0 = e.hp; api.hurtAs('heavy', e, dmg((big ? AV.boss : AV.roll * hr) * wide, 'boulder'), b.x, false); api.sparks(e.x, e.y - (e.h || 16) / 2, Math.sign(e.x - b.x) || 1, 5); (stats.collapseLog = stats.collapseLog || []).push([big ? 'B' : 'c', Math.round(b.x), Math.round(e.x), hp0 - e.hp]);
        if (e.alive && big) { e.stagger = Math.max(e.stagger || 0, AV.bossStagger); if (!c.nums.has(e)) { c.nums.add(e); api.number(e.x, e.y - (e.h || 16) - 16, 'COLLAPSE', STONE.rune); } }
        else if (e.alive && liftable(e) && floor(e, 1.2) && !c.nums.has(e)) { c.nums.add(e); api.number(e.x, e.y - (e.h || 16) - 14, 'BOWLED OVER', STONE.hi); } }
      api.dust(b.x, b.gy, 7); api.burst(b.x, b.gy - 6, 8, [STONE.base, STONE.hi, STONE.lo, STONE.moss], 90, 0.6, 420); if (b.rank % 2 === 0) api.SFX.geoThud && api.SFX.geoThud(); if (b.rank % 4 === 1) api.SFX.geoCrumble && api.SFX.geoCrumble(); if (!calm()) api.shakeCam(b.rank % 3 === 0 ? 4 : 2);
      c.plumes.push({ x: b.x, gy: b.gy, t: 0, seed: b.seed }); c.pile.push({ x: b.x, gy: b.gy, seed: b.seed, r: b.r }); }
    for (const q of c.plumes) q.t += dt; c.plumes = c.plumes.filter(q => q.t < 1.3);
    if (c.t >= C.rain + C.fall + c.span + C.settle) { api.SFX.geoCrumble && api.SFX.geoCrumble(); col = null; } }
  /* one pillar's blow: it heaves the ground under its column - the common foe there is thrown up and hit, a boss or a mini is hit and shaken - and later the boulder goes */
  function eruptBlow(u) { const AV = GEO.avalanche; u.fired = true; api.dust(u.x, u.y, 8); api.SFX.geoRise && api.SFX.geoRise();
    for (const e of foes()) { if (e.harmless || e.turncoat) continue; const b = api.box(e); if (!api.overlap({ l: u.x - AV.reach, r: u.x + AV.reach, t: u.y - 44, b: u.y + 6 }, b)) continue;
      api.hurtAs('heavy', e, dmg(AV.erupt), u.x, false); api.sparks(e.x, e.y - (e.h || 16) / 2, u.dir, 5); u.hit = (u.hit || 0) + 1;
      if (e.alive && isBig(e)) { e.stagger = Math.max(e.stagger || 0, 0.3); }
      else if (e.alive && liftable(e)) { e.y -= 4; e.vy = AV.launchVy; e.geoAirT = api.time; e.stagger = Math.max(e.stagger || 0, 0.7); api.number(e.x, e.y - (e.h || 16) - 14, 'LAUNCHED', STONE.rune); } } }
  function stepErupts(dt) { const AV = GEO.avalanche;
    for (const u of erupts) { u.t += dt; if (!u.fired && u.t >= 0.06) eruptBlow(u);
      if (!u.rolled && u.t >= AV.eruptT) { u.rolled = true; rollers.push({ x: u.x, y: u.y, vy: 0, dir: u.dir, sp: AV.sp, r: AV.r, life: AV.life * (tal('rumble') ? mulK(1.5, tal('rumble')) : 1), dmg: AV.roll * (tal('wideQuake') ? mulK(1.5, tal('wideQuake')) : 1), bounces: AV.bounces, hit: new Set(), spin: 0, kind: 'boulder', topple: true, av: true });
        api.burst && api.burst(u.x, u.y - 14, 10, [STONE.base, STONE.hi, STONE.lo], 90, 0.5); api.shakeCam(3); api.SFX.geoThud && api.SFX.geoThud(); } }
    erupts = erupts.filter(u => u.t < AV.eruptT + 0.25); }
  /* (claude/geofix) RECALL THE STONES - see GEO.recall. recall() takes every capped stone out of the grid (crumble 'silent' gives the cells back) and sends a sliding stone from where it stood; the slide ends at her feet
     (or at the first wall in its way) and plantRecalled() re-plants it on the nearest free floor column beside her - the side it came from first - never inside a body or a gate's reach (freeCell). */
  let recalls = [], recallAt = -9;
  const recallReady = () => !!GEO.pop.recall && !det && standing() >= 1 && api.time - recallAt >= GEO.recall.cd;
  function recall() { const P = api.P, own = pieces.filter(p => p.capped && !p.gone);
    if (!own.length || !recallReady()) return false; const sh = GFK.shatterWanted(); recallAt = api.time;   /* SHATTER RECALL (the board's A side): decided once, on the tap */ stats.recalls = (stats.recalls || 0) + 1;
    for (const p of own) { const cx = (p.x0 + p.x1) / 2, h = Math.max(1, Math.round((p.y1 - p.y0) / TS)), dir = Math.sign(P.x - cx) || -P.face;
      crumble(p, 'silent'); recalls.push({ x: cx, gy: p.y1, h, dir, knee: !!p.knee, shatter: sh, hit: new Set(), t: 0, dustT: 0, spin: 0, done: false }); api.dust(cx, p.y1, 5); }
    api.kitPose && api.kitPose(P, 'gHeave', 0.3); api.number(P.x, P.y - 34, 'RECALL', STONE.rune); api.shakeCam(2); api.SFX.geoRise && api.SFX.geoRise(); api.SFX.geoQuake && api.SFX.geoQuake();
    return true; }
  function plantRecalled(r) { const P = api.P, base = Math.floor(P.x / TS), used = new Set(pieces.filter(q => !q.gone).flatMap(q => q.cells.map(c => c.tx))), side = r.dir > 0 ? -1 : 1;   /* a stone that slid in from the left lands on her left */
    const offs = []; for (let k = 1; k <= 6; k++) offs.push(side * k, -side * k);
    for (const o of offs) { const tx = base + o, fy = floorRow(tx, Math.floor((P.y - 1) / TS), 2); if (fy === null || used.has(tx) || !freeCell(tx, fy - 1)) continue;
      const q = erupt(tx, fy, r.h, 'pillar', { noHero: true, hurt: false, noLaunch: true }); if (!q.piece) continue; q.piece.knee = r.knee;
      if (GEO.pop.feel) { api.SFX.geoPlant && api.SFX.geoPlant(); api.ringAt(tx * TS + 8, fy * TS - 2, 12, STONE.rune, 0.2); } return true; }
    api.burst(r.x, r.gy - 6, 8, [STONE.base, STONE.hi, STONE.lo], 70, 0.5); api.SFX.geoCrumble && api.SFX.geoCrumble(); return false; }   /* no free column in reach: the stone crumbles (nothing is ever buried) */
  function stepRecalls(dt) { const P = api.P, RC = GEO.recall; if (!recalls.length) return;
    for (const r of recalls) { r.t += dt; r.dustT -= dt; const gap = P.x - r.x; r.dir = Math.sign(gap) || r.dir;
      if (Math.abs(gap) <= 14 || r.t > RC.life) { r.done = true; continue; }
      const nx = r.x + r.dir * Math.min(Math.abs(gap), RC.sp * dt), ahead = Math.floor((nx + r.dir * 7) / TS);
      let blocked = false; for (let k = 1; k <= r.h; k++) if (api.isSolid(ahead, Math.floor(r.gy / TS) - k)) blocked = true;
      if (blocked) { r.done = true; continue; }
      r.x = nx; r.spin += dt * 20; const tx = Math.floor(r.x / TS), fy = floorRow(tx, Math.floor((r.gy - 6) / TS), 2); if (fy !== null) r.gy = fy * TS;
      if (r.dustT <= 0) { r.dustT = 0.035; api.dust(r.x - r.dir * 6, r.gy, 2); if (api.parts) api.parts.push({ x: r.x - r.dir * 5, y: r.gy - 2, vx: -r.dir * 30 + (Math.random() - 0.5) * 20, vy: -60 - Math.random() * 40, life: 0.35, max: 0.35, col: Math.random() < 0.5 ? STONE.lo : '#8c6844', size: 1, grav: 400 }); }
      const bb = { l: r.x - 7, r: r.x + 7, t: r.gy - r.h * TS, b: r.gy + 1 };
      for (const e of foes()) { if (e.harmless || e.turncoat || r.hit.has(e) || !api.overlap(bb, api.box(e))) continue; r.hit.add(e); stats.recallHits = (stats.recallHits || 0) + 1;
        if (tal('lode') && !isBig(e) && liftable(e)) { const Pl = api.P; api.moveBody(e, fk('gtsnatch') ? Math.sign(Pl.x - e.x) * Math.min(TS * 3 * tal('lode'), Math.max(0, Math.abs(Pl.x - e.x) - 20)) : r.dir * TS * (fk('gtlongdrag') ? 2 : 1) * tal('lode'), 0, false);   /* LONG DRAG two tiles along its path; SNATCH up to three toward her */ stats.lodes = (stats.lodes || 0) + 1; }   /* LODESTONE: the small foe it passes is dragged a tile along its path */
        const big = isBig(e); api.hurtAs('heavy', e, dmg(big ? RC.bossDmg : RC.dmg), r.x - r.dir * 10, false); api.sparks(e.x, e.y - (e.h || 16) / 2, r.dir, 5); api.hitstop(0.03);
        if (e.alive) { if (big) { e.stagger = Math.max(e.stagger || 0, RC.bossStagger); api.number(e.x, e.y - (e.h || 16) - 16, 'RECALLED', STONE.rune); } else if (liftable(e) && floor(e, RC.down)) api.number(e.x, e.y - (e.h || 16) - 14, 'BOWLED OVER', STONE.hi); } } }
    for (const r of recalls) if (r.done) { api.dust(r.x, r.gy, 6); api.SFX.geoThud && api.SFX.geoThud(); if (r.shatter) GFK.shatterAt(r.x, r.gy); else plantRecalled(r); }
    recalls = recalls.filter(r => !r.done); }
  /* her yard raises two stones for her (the topple station) - on the floor ahead, 3 and 5 cells out */
  function fillBoard(max = cap(), dir = 0) { const P = api.P, d = dir || P.face; let n = standing(); const want = Math.min(max, cap());   /* (claude/geopop) max: a boss start raises ONE, toward the arena centre (dir) */
    for (let k = 3; k <= 15 && n < want; k++) { const tx = Math.floor(P.x / TS) + d * k, fy = floorRow(tx, Math.floor((P.y - 1) / TS), 2); if (fy === null || !freeCell(tx, fy - 1) || k % 2 === 0) continue;
      erupt(tx, fy, 2, 'pillar', { noHero: true, hurt: false, noLaunch: true }); n = standing(); } }
  /* THE STONE FIST (her third jab): the blow that lands KNOCKS THE FOE UP - a normal foe is thrown into the air (every blow on it lands a third harder while it hangs; one lift per 2 s),
     a boss or a mini only reels. Narrower than the spin it replaces (forward only), lighter (GEO.fist.mul) and a beat slower to recover (commit.js) */
  function fistHit(e) {
    const P = api.P, F = GEO.fist, can = !e.maxHp && !e.mini && !api.knockSkip(e) && !e.noGrav && !(e.pinned > 0);
    if (can && !(e.liftImm > api.time)) { e.slammed = false; e.bounced = false; e.knockAir = 0; e.knock = 0.7; e.kvx = P.face * (GEO.pop.upper ? F.kvxUpper : F.kvx); e.kvy = F.knockVy * (api.lcBig(e) ? 0.5 : 1); e.launchedT = api.time + 1.2; e.liftImm = api.time + F.lock; e.geoAirT = api.time;
      api.number(e.x, e.y - (e.h || 16) - 8, 'KNOCKED UP', STONE.rune); stats.fists++; }
    else if (e.alive) e.stagger = Math.max(e.stagger || 0, F.stagger);
    if (GEO.pop.upper) fistSpike(e.x, e.y);   /* (claude/geocrouch) the uppercut raises a spike under the foe it hit */
    api.burst(e.x, e.y - (e.h || 16) / 2, 8, [STONE.base, STONE.hi, STONE.lo], 90, 0.35); api.shakeCam(3, P.face * 2); if (GEO.pop.feel && api.SFX.geoFist) api.SFX.geoFist(); else api.SFX.geoThud && api.SFX.geoThud(); blowPulse(); }   /* (claude/geopop c) bd_stone + the 70 Hz sub-thump; the geode pulses */
  /* (claude/geopop a) THE KNEE STONE. One cell, on the first free floor column plantFrom..plantTo tiles ahead (floorRow + freeCell: never inside a body, never in a gate's reach). A full board gets none (nothing is evicted,
     a ready AVALANCHE is never stolen); plantCd s between plants. No damage and no launch: the blow itself is the fist's, timing is unchanged. */
  /* (claude/geocrouch) THE UPPERCUT'S SPIKE: DRAWING ONLY (the shared `spikes` list with vis: no damage, no stagger, no cell, never solid) - a jagged stone fang one tile wide and two tall, up out of the floor under the foe in GEO.fist.spike.rise s,
     held, down again in .sink s; a dust ring and grit thrown straight up. (x, y): the foe's feet, or the knee-stone's cell on a whiff. */
  function fistSpike(x, y) { const P = api.P, S = GEO.fist.spike, tx = Math.floor(x / TS), fy = floorRow(tx, Math.floor((y - 6) / TS), 3), gy = fy === null ? y : fy * TS;
    spikes.push({ x, gy, t: 0, hit: new Set(), dmg: 0, h: S.h, w: S.w, vis: true, end: S.end, rise: S.rise, sink: S.sink }); stats.fistSpikes = (stats.fistSpikes || 0) + 1;
    api.dust(x, gy, 6); api.ringAt(x, gy - 1, 12, STONE.hi, 0.25);
    for (let i = 0; i < 6; i++) api.parts && api.parts.push({ x: x + (Math.random() - 0.5) * 12, y: gy - 2, vx: (Math.random() - 0.5) * 40, vy: -180 - Math.random() * 40, life: 0.5, max: 0.5, col: i % 3 === 0 ? STONE.hi : i % 3 === 1 ? STONE.base : STONE.lo, size: i % 2 ? 2 : 1, grav: 520 }); }
  let lastDet = null, plantAt = -9, det = null, detCd = -9, decals = [], glowAt = -9;
  /* (claude/geopop c) the geode pulses on every landed blow of hers (main.js geoBlowFx, fistHit) */
  function blowPulse() { glowAt = api.time; }
  function fistPlant() { const P = api.P, F = GEO.fist;
    if (standing() >= cap() || api.time - plantAt < F.plantCd) return false;
    if (GEO.pop.upper && !(P.hitSet && P.hitSet.size)) { for (let k = F.plantFrom; k <= F.plantTo; k++) { const tx = Math.floor(P.x / TS) + P.face * k, fy = floorRow(tx, Math.floor((P.y - 1) / TS), 2); if (fy !== null && freeCell(tx, fy - 1)) { fistSpike(tx * TS + 8, fy * TS); break; } } }   /* (claude/geocrouch) a WHIFFED uppercut raises its spike at the knee-stone's cell: 'the fist raised it' */
    for (let k = F.plantFrom; k <= F.plantTo; k++) { const tx = Math.floor(P.x / TS) + P.face * k, fy = floorRow(tx, Math.floor((P.y - 1) / TS), 2); if (fy === null || !freeCell(tx, fy - 1)) continue;
      if (pieces.some(q => !q.gone && q.cells.some(c => c.tx === tx))) continue;   /* a column that already holds a stone of hers is not free: plants never stack */
      const r = erupt(tx, fy, 1, 'pillar', { noHero: true, hurt: false, noLaunch: true }); if (!r.piece) continue; r.piece.knee = true;   /* (claude/geopop c) drawn as her squat KNEE STONE (drawKneeStone) */
      plantAt = api.time; stats.fistPlants = (stats.fistPlants || 0) + 1; api.shakeCam(1, P.face); if (tal('scree')) scree(tx, fy);
      if (GEO.pop.feel) { if (api.SFX.geoPlant) api.SFX.geoPlant(); api.burst(tx * TS + 8, fy * TS - 4, 6, [STONE.base, STONE.hi, STONE.lo], 80, 0.35, 300); api.ringAt(tx * TS + 8, fy * TS - 2, 12, STONE.rune, 0.2); blowPulse(); }
      api.yardSay && api.yardSay('STONES ' + standing() + '/' + cap(), STONE.rune);
      return true; }
    return false; }
  /* (claude/geopop e) DETONATE. detonateReady: a stone stands, the 5 s are up, none already going. detonate() starts the slam; detFire() (tell s later) blows every stone still standing */
  /* the bot's test (src/lab.js DET_BOT): two or more stones standing and a foe within the blast radius of one of them */
  const detonateWorth = () => { if (!detonateReady() || standing() < 2 || avalancheReady()) return false; const r = GEO.detonate.r;
    return pieces.some(p => p.capped && !p.gone && foes().some(e => !e.harmless && !e.turncoat && Math.hypot(Math.max(api.box(e).l - (p.x0 + p.x1) / 2, 0, (p.x0 + p.x1) / 2 - api.box(e).r), Math.max(api.box(e).t - (p.y0 + p.y1) / 2, 0, (p.y0 + p.y1) / 2 - api.box(e).b)) <= r)); };
  const detonateReady = () => GEO.pop.detonate && !det && standing() >= 1 && api.time >= detCd;
  function detonate() { const P = api.P, D = GEO.detonate; if (!detonateReady()) return false;
    det = { t: 0, slam: false }; detCd = api.time + D.cd; P.atk = -1; P.vx = 0; P.blastT = Math.max(P.blastT || 0, D.tell + 0.08);
    api.kitPose && api.kitPose(P, 'gHeave', D.tell + 0.12); api.SFX.geoThud && api.SFX.geoThud(); api.shakeCam(2); return true; }
  function detFire() { const P = api.P, D = GEO.detonate, own = pieces.filter(p => p.capped && !p.gone); det = null; if (!own.length) return;
    const n = own.length, blasts = new Map(), tag = { sh: new Map() }, down = new Set(); let struck = 0;
    api.hitstop(D.hitstop); api.shakeCam(D.shake[Math.min(3, n)] || 8); api.zoomKick && api.zoomKick(1.04, 0.22);
    const sfx = api.SFX.geoBlast || api.SFX.geoQuake || api.SFX.geoThud; if (sfx) sfx(); blowPulse();
    api.number(P.x, P.y - 34, 'DETONATE', STONE.rune);
    for (const p of own) { const cx = (p.x0 + p.x1) / 2, cy = (p.y0 + p.y1) / 2, fy = p.y1;
      crumble(p, 'silent'); decals.push({ x: cx, y: fy, t: D.crackLife, max: D.crackLife, seed: Math.floor(cx) % 7 });
      api.ringAt(cx, cy, D.r * 0.7, STONE.rune, 0.3); api.dust(cx - 8, fy, 5); api.dust(cx + 8, fy, 5);
      if (GEO.pop.feel) { api.ringAt(cx, cy, D.r, '#fff0c0', 0.26); api.ringAt(cx, fy - 2, D.r * 1.25, STONE.hi, 0.4);   /* (claude/geopop c) the shockwave, a second ring on the floor, rock flung out radially, a dust ring */
        api.burst(cx, cy, 10, [STONE.base, STONE.hi, STONE.lo, STONE.rune], 190, 0.55, 300, 2); api.burst(cx, cy - 4, 4, [STONE.base, STONE.lo], 130, 0.6, 300, 3); api.dustRing && api.dustRing(cx, fy, D.r); }
      for (const e of foes()) { if (e.harmless || e.turncoat) continue; const b = api.box(e), dx = Math.max(b.l - cx, 0, cx - b.r), dy = Math.max(b.t - cy, 0, cy - b.b); if (Math.hypot(dx, dy) > D.r) continue;
        if ((blasts.get(e) || 0) >= D.perFoeBlasts) continue; blasts.set(e, (blasts.get(e) || 0) + 1);
        api.hurtAs('heavy', e, dmg(D.mul, 'geoDetonate'), cx, false); api.sparks(e.x, e.y - (e.h || 16) / 2, Math.sign(e.x - cx) || 1, 5); struck++;
        if (e.alive && !isBig(e) && liftable(e) && !down.has(e)) { down.add(e); if (floor(e, D.knockDown)) api.number(e.x, e.y - (e.h || 16) - 14, 'KNOCKED DOWN', STONE.rune); } }
      const f = foes().filter(e => !e.harmless && !e.turncoat).sort((a, b) => Math.abs(a.x - cx) - Math.abs(b.x - cx))[0], d = f ? Math.sign(f.x - cx) || P.face : P.face, sd = dmg(D.shardMul, 'geoDetonate');
      for (let i = 0; i < D.shards; i++) { const dir = i === 1 ? -d : d, up = i === 2; shards.push({ x: cx, y: cy - 2, vx: dir * (up ? 110 : 250), vy: up ? -230 : -30, life: 0.55, hit: new Set(), dmg: sd, det: tag }); } }
    lastDet = { blasts: Math.max(0, ...blasts.values()), tag }; stats.detonates = (stats.detonates || 0) + 1; stats.detonated = (stats.detonated || 0) + struck; api.trialEvent && api.trialEvent('meter');
    api.yardSay && api.yardSay('DETONATED x' + stats.detonates, '#ffd36b'); }
  /* ENTOMB: a blow on the tomb cracks it and lands half as hard again; the third crack breaks it open (hurtEnemy asks) */
  function tombHit(e, d) { const tb = e.geoTomb; if (!tb) return d; tb.cracks++; api.sparks(e.x, e.y - (e.h || 16) / 2, 0, 5);
    if (tb.cracks >= 3) { e.geoTomb = null; e.frozen = 0; e.stagger = Math.min(e.stagger || 0, 0.3); api.burst(e.x, e.y - (e.h || 16) / 2, 16, [STONE.base, STONE.hi, STONE.lo], 90, 0.6); api.SFX.geoCrumble(); api.number(e.x, e.y - (e.h || 16) - 20, 'BROKEN OPEN', STONE.rune); }
    return Math.round(d * 1.5); }

  /* ==== EACH FRAME ==== */
  function update(dt) {
    const P = api.P, g = grid();
    /* the grid changed under us (a new level, a reload): what stood in the old one is gone with it (RULE 5) */
    if (pieces.some(p => p.grid !== g)) for (const p of [...pieces]) if (p.grid !== g) crumble(p, 'silent');
    P.tremor = boardFill(); { const n = standing(); stats.maxStand = Math.max(stats.maxStand || 0, n); if (n >= cap()) stats.fullT = (stats.fullT || 0) + dt; }   /* (claude/geotune) board stats for the tune */
    footBreak(dt);
    stepTraits(dt); GFK.update(dt);
    for (const p of [...pieces]) { p.age += dt;
      if (p.age >= p.life) { crumble(p, 'time'); continue; }   /* RULE 2 */
      const bs = foes().filter(e => p.age <= GEO.bigBodyGrace || !(api.lcBig(e) || e.maxHp || e.mini)).map(api.box); if (p.cells.some(c => bs.some(b => api.overlap(cellBox(c.tx, c.ty), b)) && p.tile !== T().ONEWAY)) crumble(p, 'body');   /* RULE 4 */ }
    /* the wall and a shot: a wall raised on the beat throws it back (STONEFACE); anything else is stopped in the stone */
    for (const s of api.seeds) { if (s.dead || s.reflected) continue; const w = pieces.find(p => p.kind === 'wall' && s.x > p.x0 - 3 && s.x < p.x1 + 3 && s.y > p.y0 - 3 && s.y < p.y1 + 3); if (!w) continue;
      if (tal('returnFire') && api.time - w.born < 0.5) { api.reflectSeed(s); api.number((w.x0 + w.x1) / 2, w.y0 - 14, 'THROWN BACK', STONE.rune); }
      else { s.dead = true; api.sparks(s.x, s.y, -Math.sign(s.vx) || 1, 4); } gainTremor(GEO.tremor.shot); }
    /* THE WARD MEETS A SHOT, on its face or its lip (so one dropping on her from above is met too). Raised on the beat, it is thrown back
       the way it came (and the beat empowers her); with STONEFACE, EVERY shot it meets is thrown back; otherwise it dies on the stone
       for the wind a blow costs - and with no wind for it, it is let through to her, where damagePlayer breaks the ward (GUARD BREAK) */
    if (wardUp()) { const bs = wardBoxes();
      for (const s of api.seeds) { if (s.dead || s.reflected || !bs.some(b => s.x > b.l - 3 && s.x < b.r + 3 && s.y > b.t - 3 && s.y < b.b + 3)) continue;
        if (s.noBlock || s.unblockable) continue;   /* (a red shot is a red blow: it goes on, and breaks the ward on her) */
        const beat = wardPerfect();
        if (beat || tal('returnFire')) { api.reflectSeed(s); api.number(s.x, s.y - 14, 'THROWN BACK', STONE.rune); if (beat) wardParry(null); gainTremor(GEO.tremor.shot); }
        else if (P.st >= WD.hitSt) { s.dead = true; P.st -= WD.hitSt; P.stDelay = Math.max(P.stDelay || 0, 0.5); api.sparks(s.x, s.y, -Math.sign(s.vx) || 1, 4); api.SFX.geoBounce(); gainTremor(GEO.tremor.shot); } } }
    /* THE THIRD BLOW: the spin shatters what it touches */
    if (P.atk >= 0.17 && P.atk < 0.2 && P.heavySwing && !P.heavy && pieces.length && !(P.hitSet && P.hitSet.size)) {   /* (claude/geoid) THE STONE FIST breaks one of her own stones only when it found nothing else to hit; (claude/geopop, Daniel 11-03) NOW ONLY A WALL - the board stones are the fist's to plant, never to break */ const b = api.attackBox(); if (b) for (const p of [...pieces]) if (p.kind === 'wall' && api.overlap(b, { l: p.x0, r: p.x1, t: p.y0, b: p.y1 })) shatter(p, P.face); }
    /* (claude/geopop a) THE FIST PLANTS A KNEE STONE: on the fist's active frame, hit or whiff, one stone (1 cell) rises on the first free floor column 2-4 tiles ahead. Not at a full board, not within plantCd s */
    if (P.atk < 0) P.geoPlantDone = false;
    else if (P.atk >= 0.17 && !P.geoPlantDone && P.heavySwing && !P.heavy && !P.swingKind && !P.plunge && GEO.pop.fistPlant) { P.geoPlantDone = true; GFK.toppleFist(); GFK.shardFist(); fistPlant(); }   /* TOPPLE / SHARD FIST (the fist's A / B) */
    /* (claude/geopop e) DETONATE: the slam is told for GEO.detonate.tell s, then every stone goes */
    if (detCd > api.time + GEO.detonate.cd + 0.01) detCd = -9; if (plantAt > api.time) plantAt = -9;   /* (a new game restarts the clock: a cd stamped on the old one is void) */
    if (det) { det.t += dt; if (!det.slam && det.t >= GEO.detonate.tell * 0.6) { det.slam = true;   /* (claude/geopop c) THE STAFF SLAM: the butt hits the floor in front of her, grit jumps */
        if (GEO.pop.feel) { api.dust(P.x + P.face * 9, P.y, 7); api.ringAt(P.x + P.face * 9, P.y - 1, 10, STONE.rune, 0.2); api.shakeCam(1, P.face); blowPulse(); } }
      if (det.t >= GEO.detonate.tell) detFire(); }
    for (const c of decals) c.t -= dt; if (decals.length) decals = decals.filter(c => c.t > 0);
    /* a foe her stone threw into the air lands (the end spike of a full FAULT LINE, a step that lifted it) - THROWN DOWN makes it land hard */
    for (const e of foes()) if (e.geoAirT && api.time - e.geoAirT > 0.2 && (e.vy || 0) >= 0 && api.isSolid(Math.floor(e.x / TS), Math.floor((e.y + 2) / TS))) { e.geoAirT = 0;
      if (tal('hardLand')) { api.hurtAs('heavy', e, dmg(0.8), e.x, false); if (e.alive) floor(e, 0.9); api.dust(e.x, e.y, 8); api.shakeCam(3); api.number(e.x, e.y - (e.h || 16) - 14, 'THROWN DOWN', STONE.rune); } }
    for (const e of foes()) if (e.geoTomb) { e.geoTomb.t -= dt; e.vx = 0; if (e.geoTomb.t <= 0 || !(e.frozen > 0)) { e.geoTomb = null; api.burst(e.x, e.y - (e.h || 16) / 2, 10, [STONE.base, STONE.lo], 60, 0.5); } }
    /* the rolling stones and the boulder */
    for (const r of rollers) { r.life -= dt; r.spin += r.dir * dt * r.sp / r.r;
      const nx = r.x + r.dir * r.sp * dt, ahead = Math.floor((nx + r.dir * r.r) / TS), row = Math.floor((r.y - r.r) / TS);
      if (api.isSolid(ahead, row)) { if (r.bounces > 0) { r.bounces--; r.dir = -r.dir; api.SFX.geoThud(); api.dust(r.x, r.y, 4); } else { r.life = 0; } }
      else r.x = nx;
      const under = Math.floor((r.y + 1) / TS), tx = Math.floor(r.x / TS); if (!api.isSolid(tx, under) && !api.isOneWay(api.tileAt(tx, under))) { r.vy = Math.min(500, r.vy + 900 * dt); r.y += r.vy * dt; if (r.y > api.LH * TS) r.life = 0; }
      else { r.vy = 0; r.y = under * TS; }
      for (const e of foes()) { if (e.harmless || e.turncoat || r.hit.has(e)) continue; const b = api.box(e); if (!api.overlap({ l: r.x - r.r, r: r.x + r.r, t: r.y - 2 * r.r, b: r.y }, b)) continue;
        r.hit.add(e); const big = r.av && isBig(e); api.hurtAs('heavy', e, dmg(big ? GEO.avalanche.boss * (tal('wideQuake') ? mulK(1.5, tal('wideQuake')) : 1) : r.dmg, r.kind === 'boulder' ? 'boulder' : null), r.x - r.dir * 10, false); if (big && e.alive) { e.stagger = Math.max(e.stagger || 0, GEO.avalanche.bossStagger); api.shakeCam(5); api.number(e.x, e.y - (e.h || 16) - 16, 'AVALANCHE', STONE.rune); } api.sparks(e.x, e.y - (e.h || 16) / 2, r.dir, 6); api.hitstop(0.03);
        if (e.alive && liftable(e)) { if (floor(e, (r.kind === 'boulder' ? 1.2 : 0.8) * (r.bigKnock || 1))) api.number(e.x, e.y - (e.h || 16) - 14, 'BOWLED OVER', STONE.hi); }
        else { r.life = 0; api.shakeCam(3); } }
      if (r.life <= 0) api.burst(r.x, r.y - r.r, 10, [STONE.base, STONE.hi, STONE.lo], 70, 0.5); }
    rollers = rollers.filter(r => r.life > 0); stepErupts(dt); stepRecalls(dt); stepCollapse(dt);
    for (const s of shards) { s.life -= dt; s.vy += (s.g ?? 300) * dt; s.x += s.vx * dt; s.y += s.vy * dt; if (api.isSolid(Math.floor(s.x / TS), Math.floor(s.y / TS))) s.life = 0;
      for (const e of foes()) { if (s.life <= 0 || e.harmless || e.turncoat || s.hit.has(e)) continue; if (s.det && (s.det.sh.get(e) || 0) >= GEO.detonate.perFoeShards) continue; if (!api.overlap({ l: s.x - 2, r: s.x + 2, t: s.y - 2, b: s.y + 2 }, api.box(e))) continue;
        s.hit.add(e); if (s.det) s.det.sh.set(e, (s.det.sh.get(e) || 0) + 1); api.hurtAs('shot', e, s.dmg || dmg(0.6), s.x - Math.sign(s.vx) * 10, false); s.life = 0; api.sparks(s.x, s.y, Math.sign(s.vx), 3); if (s.big && e.alive) { e.stagger = Math.max(e.stagger || 0, api.lcBig(e) ? 0.1 : 0.3); stats.shardHits++; } } }   /* (claude/chargetiers: the STONE SHARD's own blow and check) */
    shards = shards.filter(s => s.life > 0);
    for (const f of falls) { if (f.st === 'wait') { f.delay -= dt; if (f.foe && f.foe.alive) f.x += (f.foe.x - f.x) * Math.min(1, dt * 10); if (f.delay <= 0) f.st = 'fall'; continue; }
      if (f.st === 'fall') { f.y += 560 * dt; if (f.y >= f.gy) { f.y = f.gy; f.st = 'done'; f.life = 0.4; api.dust(f.x, f.gy, 6); api.shakeCam(2); api.SFX.geoThud();
          for (const e of foes()) { if (e.harmless || e.turncoat || Math.abs(e.x - f.x) > (e.w || 12) / 2 + f.r + 2 || Math.abs(e.y - f.gy) > 30) continue;
            api.hurtAs('heavy', e, api.lcBig(e) ? Math.round(f.hit * 0.6) : f.hit, f.x, false); if (e.alive) floor(e, f.knock); } } }
      else f.life -= dt; }
    falls = falls.filter(f => f.st !== 'done' || f.life > 0);
    for (const s of spikes) { const was = s.t; s.t += dt;
      if (was < 0 && s.t >= 0) { api.dust(s.x, s.gy, 4); api.SFX.geoShard();
        for (const e of s.vis ? [] : foes()) { if (e.harmless || e.turncoat || s.hit.has(e) || Math.abs(e.x - s.x) > (e.w || 12) / 2 + 6 || e.y < s.gy - 30 || e.y - (e.h || 16) > s.gy) continue;
          s.hit.add(e); api.hurtAs('heavy', e, s.dmg, s.x, false); if (e.alive) { e.stagger = Math.max(e.stagger || 0, api.lcBig(e) ? 0.3 : 0.9); e.vx = 0; if (!api.lcBig(e)) api.number(e.x, e.y - (e.h || 16) - 14, 'HELD', STONE.hi); } } } }
    spikes = spikes.filter(s => s.t < (s.end || 0.6));   /* (FAULT LINE's end spike rides the same clock) */
    /* FAULT LINE, her heavy: the crack runs on at its speed, everything it reaches is hit, and a full one spikes at the end */
    for (const fl of faults) { if (!fl.heavy) continue; fl.life -= dt; const was = fl.len; fl.len = Math.min(fl.max, fl.len + FL.speed * dt);
      if (fl.len > was && Math.random() < 0.7) api.dust(fl.x0 + fl.dir * fl.len, fl.gy, 2);
      faultHits(fl); if (fl.spike && !fl.spiked && fl.len >= fl.max) faultSpike(fl); if (fl.pillar && !fl.spiked && (fl.first || fl.len >= fl.max)) faultPillar(fl); }
    for (const fl of faults) { if (fl.heavy) continue; fl.life -= dt; const was = fl.len; fl.len = Math.min(fl.max, fl.len + 380 * dt);
      const tipX = fl.x0 + fl.dir * fl.len, ttx = Math.floor(tipX / TS), fy = Math.floor(fl.gy / TS); if (api.isSolid(ttx, fy - 1) || !(api.isSolid(ttx, fy) || api.isOneWay(api.tileAt(ttx, fy)))) fl.max = Math.min(fl.max, fl.len);
      if (fl.len > was && Math.random() < 0.6) api.dust(tipX, fl.gy, 2);
      for (const e of foes()) { if (e.harmless || e.turncoat || fl.hit.has(e) || Math.abs(e.y - fl.gy) > 14) continue; const d = (e.x - fl.x0) * fl.dir; if (d < -6 || d > fl.len) continue;
        fl.hit.add(e); api.hurtAs('heavy', e, dmg(0.8 * (fl.kick ? 1.33 : 1), 'faultLine'), e.x - fl.dir * 8, false);   /* HIGH RIFT: a third more, two thirds higher */
        if (e.alive && liftable(e)) { e.vy = fl.kick ? -530 : -320; e.geoAirT = api.time; e.stagger = Math.max(e.stagger || 0, 0.8); api.number(e.x, e.y - (e.h || 16) - 14, 'THROWN UP', STONE.hi); } else if (e.alive) e.stagger = Math.max(e.stagger || 0, 0.4); } }
    faults = faults.filter(f => f.life > 0);
    const stepGolem = G => { G.life -= dt;   /* (claude/geofork) one step for the base golem and the second of TWO GOLEMS */ G.rise = Math.min(1, G.rise + dt * 4); G.atkT -= dt; G.swing = Math.max(0, G.swing - dt);
      const tl = foes().filter(e => !e.harmless && !e.turncoat && Math.abs(e.x - G.x) < 200 && Math.abs(e.y - G.y) < 60).sort((a, b) => Math.abs(a.x - G.x) - Math.abs(b.x - G.x)), tgt = G.idx ? (tl[1] || tl[0]) : tl[0];   /* the second twin takes the second-nearest foe */
      if (tgt) { G.face = Math.sign(tgt.x - G.x) || G.face; const ad = Math.abs(tgt.x - G.x) - (tgt.w || 12) / 2;
        if (ad > 10) { const nx = G.x + G.face * (G.sp || 62) * dt, tx = Math.floor((nx + G.face * 6) / TS); if (!api.isSolid(tx, Math.floor((G.y - 8) / TS))) G.x = nx; }
        else if (G.atkT <= 0) { G.atkT = G.every || 1.0; G.swing = 0.2; api.hurtAs('heavy', tgt, dmg(G.k || 0.6, 'golem'), G.x, false); if (tgt.alive && !api.lcBig(tgt)) tgt.stagger = Math.max(tgt.stagger || 0, G.stag || 0.4); api.sparks(tgt.x, tgt.y - 8, G.face, 6); api.SFX.geoThud(); } }
      const under = Math.floor((G.y + 1) / TS), gx = Math.floor(G.x / TS); if (!api.isSolid(gx, under) && !api.isOneWay(api.tileAt(gx, under))) { G.vy = Math.min(500, G.vy + 900 * dt); G.y += G.vy * dt; if (G.y > api.LH * TS) G.life = 0; } else { G.vy = 0; G.y = under * TS; }
      if (G.life <= 0) { api.burst(G.x, G.y - 10, 14, [STONE.base, STONE.hi, STONE.moss], 70, 0.6); api.SFX.geoCrumble(); return false; } return true; };
    if (golem && !stepGolem(golem)) golem = null; if (golem2 && !stepGolem(golem2)) golem2 = null;
  }
  function clear() { for (const p of [...pieces]) crumble(p, 'silent'); pieces = []; rollers = []; erupts = []; recalls = []; recallAt = -9; col = null; shards = []; falls = []; spikes = []; faults = []; golem = null; golem2 = null; GFK.clear(); det = null; decals = []; detCd = -9; plantAt = -9; }   /* (claude/geopop: a death, a retry or a new room starts the 5 s and the 3 s clean) */

  /* ==== DRAWN IN THE WORLD. A piece is rough grey stone with moss on its crown and a faint amber rune; it grinds up out of the
     ground over GEO.rise, and for its last GEO.crack seconds it CRACKS - dark lines spreading through it, and a shiver at the end. */
  function drawStoneCell(g, x, y, top, bot, seed, crackK, rune) {
    g.fillStyle = STONE.base; g.fillRect(x, y, TS, TS);
    g.fillStyle = STONE.lo; g.fillRect(x, y, 2, TS); g.fillRect(x + 7 + (seed % 3), y + 5, 1, 6);
    g.fillStyle = STONE.dark; g.fillRect(x + TS - 1, y, 1, TS); if (bot) g.fillRect(x, y + TS - 1, TS, 1);
    g.fillStyle = STONE.hi; g.fillRect(x + 2, y + 1, 5, 1); g.fillRect(x + 10, y + 8 + (seed % 2), 4, 1);
    if (top) { g.fillStyle = STONE.hi; g.fillRect(x, y, TS, 2); g.fillStyle = STONE.moss; g.fillRect(x + 1 + (seed % 4), y - 1, 4, 2); g.fillRect(x + 9, y, 3, 1); g.fillStyle = STONE.moss2; g.fillRect(x + 11, y - 1, 2, 1); }
    if (rune) { g.globalAlpha = 0.45 + 0.25 * Math.sin(api.time * 4 + seed); g.fillStyle = STONE.rune; g.fillRect(x + 7, y + 6, 1, 4); g.fillRect(x + 6, y + 7, 3, 1); g.globalAlpha = 1; }
    if (crackK > 0) { g.fillStyle = STONE.crack; const n = Math.ceil(crackK * 6);
      for (let k = 0; k < n; k++) { const cx = x + 3 + ((seed * 7 + k * 5) % 10), cy = y + 2 + ((seed * 3 + k * 4) % 12); g.fillRect(cx, cy, 1, 3); g.fillRect(cx + 1, cy + 2, 2, 1); } }
  }
  /* (claude/geopop c) HER KNEE STONE: a squat boulder in the one cell the fist plants - rounded shoulders, the board stone's palette (grey, moss on top), a lit rune and a chip of the staff's amber geode poking out of the crown, so it reads as hers */
  function drawKneeStone(g, x, y, seed, crackK) {
    const IN = [5, 3, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (let r = 0; r < TS; r++) { const i = IN[r]; g.fillStyle = STONE.base; g.fillRect(x + i, y + r, TS - i * 2, 1);
      g.fillStyle = STONE.lo; g.fillRect(x + i, y + r, 2, 1); g.fillStyle = STONE.dark; g.fillRect(x + TS - i - 1, y + r, 1, 1); }
    g.fillStyle = STONE.dark; g.fillRect(x, y + TS - 1, TS, 1); g.fillStyle = STONE.hi; g.fillRect(x + 5, y + 1, 5, 1); g.fillRect(x + 3, y + 3, 4, 1); g.fillRect(x + 9 + (seed % 2), y + 9, 4, 1);
    g.fillStyle = STONE.moss; g.fillRect(x + 3 + (seed % 3), y, 4, 2); g.fillStyle = STONE.moss2; g.fillRect(x + 4, y + 2, 2, 1);
    g.fillStyle = STONE.rune; g.fillRect(x + 11, y - 2, 2, 3); g.fillRect(x + 12, y - 3, 1, 1); g.fillStyle = '#ffd36b'; g.fillRect(x + 11, y - 2, 1, 2);   /* the geode chip */
    g.globalAlpha = 0.7 + 0.2 * Math.sin(api.time * 4 + seed); g.fillStyle = STONE.rune; g.fillRect(x + 7, y + 7, 1, 4); g.fillRect(x + 6, y + 8, 3, 1); g.globalAlpha = 1;
    if (crackK > 0) { g.fillStyle = STONE.crack; g.fillRect(x + 4, y + 5, 1, 4); g.fillRect(x + 5, y + 8, 2, 1); g.fillRect(x + 10, y + 6, 1, 5); } }
  /* (claude/geopop c) a pixel disc on the canvas (the geode's halo: arcs would blur) */
  function disc(g, x, y, r) { for (let dy = -r; dy <= r; dy++) { const w = Math.floor(Math.sqrt(r * r + r * 0.5 - dy * dy)); if (w >= 0) g.fillRect(x - w, y + dy, w * 2 + 1, 1); } }
  /* (claude/geofix) THE MOUNTAIN COLLAPSE, DRAWN: a dim over the room, jagged cracks racing out from her across the ceiling / back wall (dark with an amber seam), a shadow on the floor for every boulder before it lands, the boulders themselves (the board stone's art,
     big), a rising dust plume at each landing and the rubble they leave; the dust haze clears at the end. Reduce motion: the seam is steady (no flicker). */
  function drawCollapse(g, cx, cy) { const C = GEO.collapse, c = col, t = c.t, W = c.W, H = c.H, still = calm(), tEnd = C.rain + C.fall + c.span + C.settle;
    const veil = Math.min(1, Math.max(0, (t - C.slam) / 0.3)) * Math.min(1, Math.max(0, (tEnd - t) / 0.9)); g.fillStyle = 'rgba(20,14,8,' + (0.28 * veil).toFixed(3) + ')'; g.fillRect(0, 0, W, H);
    const reach = Math.min(1, Math.max(0, (t - C.crack) / C.crackDur)), fade = Math.min(1, Math.max(0, (tEnd - 0.3 - t) / 0.8));
    if (reach > 0) { g.save(); g.globalAlpha = fade;
      const seg = (a, b, col2, w) => { g.fillStyle = col2; const dx = b[0] - a[0], dy = b[1] - a[1], n = Math.max(1, Math.max(Math.abs(dx), Math.abs(dy)) | 0); for (let i = 0; i <= n; i++) g.fillRect(Math.round(a[0] + dx * i / n - cx) - (w >> 1), Math.round(a[1] + dy * i / n - cy) - (w >> 1), w, w); };
      for (const k of c.cracks) { const g0 = Math.min(1, Math.max(0, (reach - k.d * 0.7) / 0.5)); if (g0 <= 0) continue; const m = k.pts.length - 1, f = g0 * m;
        for (let i = 0; i < m && i < f; i++) { const a = k.pts[i], b = k.pts[i + 1], u = Math.min(1, f - i), part = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
          seg(a, part, STONE.crack, 4); g.globalAlpha = fade * (still ? 0.9 : 0.65 + 0.3 * Math.sin(t * 30 + i)); seg(a, part, '#ffd27a', 2); g.globalAlpha = fade; }
        if (k.br && f > 2.5) { const q = k.pts[2], r1 = [q[0] + 10, q[1] + 8]; seg(q, r1, STONE.crack, 3); seg(r1, [r1[0] - 2, r1[1] + 10], STONE.crack, 3); } }
      g.restore(); }
    for (const b of c.bl) { const x = Math.round(b.x - cx), gy = Math.round(b.gy - cy), dt0 = b.tl - t;
      if (dt0 > 0 && dt0 < C.fall) { const k = 1 - dt0 / C.fall, w = Math.round(4 + b.r * 1.4 * k); g.globalAlpha = 0.25 + 0.3 * k; g.fillStyle = '#0c0a08'; g.fillRect(x - w, gy - 1, w * 2, 2); g.fillRect(x - w + 2, gy - 2, w * 2 - 4, 1); g.fillRect(x - w + 2, gy + 1, w * 2 - 4, 1); g.globalAlpha = 1;
        const fy = Math.round(c.top - cy - 20 + ((b.gy - b.r) - (c.top - 20)) * k * k); drawBoulder(g, x, fy, b.r, k * 9 + b.seed);
        g.globalAlpha = 0.4; g.fillStyle = STONE.lo; g.fillRect(x - 1, fy - b.r - 8, 2, 7); g.fillRect(x + 2, fy - b.r - 5, 1, 4); g.globalAlpha = 1; } }
    for (const p of c.pile) { const a = Math.min(1, Math.max(0, (tEnd - t) / 1.0)); if (a <= 0) continue; const x = Math.round(p.x - cx), gy = Math.round(p.gy - cy); g.globalAlpha = a;
      g.fillStyle = STONE.dark; g.fillRect(x - 8, gy - 3, 16, 3); g.fillStyle = STONE.base; g.fillRect(x - 6, gy - 5, 12, 3); g.fillStyle = STONE.hi; g.fillRect(x - 4, gy - 7 + (p.seed % 2), 6, 2); g.fillStyle = STONE.lo; g.fillRect(x + 5 - (p.seed % 3), gy - 3, 3, 3); g.fillStyle = STONE.moss; g.fillRect(x - 5, gy - 7 + (p.seed % 3 === 0 ? 1 : 0), 3, 1); g.globalAlpha = 1; }
    for (const q of c.plumes) { const k = q.t / 1.3, x = Math.round(q.x - cx), gy = Math.round(q.gy - cy); g.globalAlpha = (1 - k) * 0.55;
      for (let i = 0; i < 5; i++) { const ox = ((q.seed * (i + 3)) % 19) - 9, rr = Math.round(3 + 7 * Math.sqrt(k) + (i % 2) * 2), yy = gy - Math.round(4 + k * (14 + i * 4)); g.fillStyle = i % 2 ? '#a89878' : '#8c7a5c'; disc(g, x + Math.round(ox * (0.6 + k)), yy, rr); } g.globalAlpha = 1; }
    const hz = Math.min(1, Math.max(0, (t - (C.rain + C.fall + c.span * 0.6)) / 0.4)) * Math.min(1, Math.max(0, (tEnd - t) / 0.9)); if (hz > 0) { g.fillStyle = 'rgba(150,126,90,' + (0.2 * hz).toFixed(3) + ')'; g.fillRect(0, 0, W, H); } }
  function draw(g, cx, cy) { g.save(); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; try { draw0(g, cx, cy); GFK.draw(g, cx, cy); } finally { g.restore(); } }   /* whatever alpha the hero's draw left behind is not the stone's */
  function draw0(g, cx, cy) {
    const P = api.P; shieldDrawn = false;
    /* STONES ORBIT THE GEODE WHILE SHE CASTS (round 3, the staff item: they floated round her body before): winding FAULT LINE (closing
       in and speeding up with the wind), any of her nine, her ward and THE QUAKE - two small stones and a grain of grit going round the
       amber geode at the top of her staff, wherever the pose has put it (api.staffTip reads it off the frame drawn). Drawn touching
       nothing: it is how she reads as the one who MOVES STONE, before any stone has moved */
    if (api.isGeo() && !P.dead && !P.geoBurrow) { const kit = P.kPoseT > 0 && /^g[A-Z]/.test(P.kPoseK || ''), k = P.charge > 0 ? Math.min(1, P.charge / api.heavyWind()) : (kit || P.geoGuard || P.blastT > 0) ? 1 : 0, tip = k > 0 && api.staffTip ? api.staffTip() : null;
      if (tip) for (let i = 0; i < 3; i++) { const a = api.time * (4 + 3 * k) + i * 2.1, r = i === 2 ? 7 : 5 + (1 - k) * 2, x = Math.round(tip.x - cx + Math.cos(a) * r), y = Math.round(tip.y - cy + Math.sin(a) * r * 0.6);
        g.fillStyle = i === 0 ? STONE.hi : i === 1 ? STONE.base : STONE.lo; if (i < 2) { g.fillRect(x, y, 2, 2); g.fillStyle = STONE.dark; g.fillRect(x, y + 2, 2, 1); } else g.fillRect(x, y, 1, 1);
        spunAt = api.time; } }
    /* (claude/geopop c) THE GEODE GLOW: an additive amber halo (r 5-7) on the staff tip - dim with no stone standing, brighter with 1, 2, 3, and a flash that fades over 0.3 s on every blow she lands (and through the detonate's tell) */
    if (GEO.pop.feel && api.isGeo() && !P.dead && !P.geoBurrow && api.staffTip) { const tip = api.staffTip(); if (tip) { const n = Math.min(3, standing()), pul = Math.max(0, 1 - (api.time - glowAt) / 0.3), tk = det ? Math.min(1, det.t / GEO.detonate.tell) : 0, R = Math.min(7, Math.round(5 + n * 0.5 + pul * 1.5 + tk * 2)), a = Math.min(0.95, 0.14 + 0.1 * n + 0.5 * pul + 0.4 * tk), tx = Math.round(tip.x - cx), ty = Math.round(tip.y - cy);
      g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = STONE.rune; g.globalAlpha = a * 0.55; disc(g, tx, ty, R); g.globalAlpha = a * 0.8; disc(g, tx, ty, Math.max(2, R - 3)); g.fillStyle = '#fff0c0'; g.globalAlpha = a; disc(g, tx, ty, 1); g.restore(); } }
    for (const p of pieces) { const k = Math.min(1, p.age / GEO.rise), left = p.life - p.age, crackK = p.life === Infinity ? Math.min(1, Math.max(0, (p.hp0 - p.hp) / Math.max(1, p.hp0)) * 1.25) : left < p.crack ? 1 - left / p.crack : 0;   /* (claude/geoid) a standing stone cracks by hp: whole, cracked, about to go */
      const jit = left < 0.25 || (p.life === Infinity && p.hp <= 1 && p.hp0 > 1) ? (Math.floor(api.time * 40) % 2 ? 1 : -1) : 0, rise = Math.round((1 - k) * (p.y1 - p.y0)), set = new Set(p.cells.map(c => c.i));
      g.save(); g.beginPath(); g.rect(Math.round(p.x0 - cx) - 2, Math.round(p.y0 - cy) - 4, p.x1 - p.x0 + 4, p.y1 - p.y0 + 4); g.clip();
      for (const c of p.cells) { const x = Math.round(c.tx * TS - cx) + jit, y = Math.round(c.ty * TS - cy) + rise;
        const top = !set.has(c.i - api.LW), bot = !set.has(c.i + api.LW);
        if (p.tile === T().ONEWAY) { g.fillStyle = STONE.base; g.fillRect(x, y, TS, 6); g.fillStyle = STONE.hi; g.fillRect(x, y, TS, 2); g.fillStyle = STONE.dark; g.fillRect(x, y + 5, TS, 1); g.fillStyle = STONE.moss; g.fillRect(x + 3, y - 1, 4, 1);
          if (crackK > 0) { g.fillStyle = STONE.crack; g.fillRect(x + 5, y + 1, 1, 4); g.fillRect(x + 10, y + 2, 1, 3); } continue; }
        if (p.knee && GEO.pop.feel && p.cells.length === 1) drawKneeStone(g, x, y, c.i % 11, crackK); else drawStoneCell(g, x, y, top, bot, c.i % 11, crackK, top); }
      g.restore();
      if (p.bulwarked) { g.globalAlpha = 0.5; g.fillStyle = STONE.rune; g.fillRect(Math.round(p.x0 - cx), Math.round(p.y0 - cy) - 2, p.x1 - p.x0, 1); g.globalAlpha = 1; }
      if (det && p.capped) { const k = Math.min(1, det.t / GEO.detonate.tell), x = Math.round(p.x0 - cx), y = Math.round(p.y0 - cy), w = p.x1 - p.x0, h = p.y1 - p.y0, jt = k > 0.5 ? (Math.floor(api.time * 50) % 2 ? 1 : -1) : 0;   /* (claude/geopop e/c) THE TELL: the stone pulses amber, cracks widen, motes lift off it and it shudders as the slam comes down */
        g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = (0.22 + 0.4 * k) * (0.8 + 0.2 * Math.sin(api.time * 40)); g.fillStyle = STONE.rune; g.fillRect(x + jt, y, w, h); g.globalAlpha = 0.28 * k; g.fillStyle = '#fff0c0'; g.fillRect(x + jt + 4, y + 3, w - 8, Math.max(1, h - 8)); g.restore();
        g.fillStyle = STONE.crack; g.fillRect(x + 3 + jt, y + 2, 1, Math.max(2, h - 4)); if (k > 0.3) g.fillRect(x + 6 + jt, y + 5, 3, 1); if (k > 0.5) g.fillRect(x + w - 5 + jt, y + 1, 1, Math.max(2, h - 3)); if (k > 0.75) { g.fillRect(x + 7 + jt, y + 2, 1, 4); g.fillRect(x + 9 + jt, y + h - 5, 3, 1); }
        g.fillStyle = STONE.rune; for (let i = 0; i < 3; i++) { const ph = (api.time * 2.2 + i * 0.37) % 1; g.globalAlpha = (1 - ph) * k; g.fillRect(x + 3 + i * 5 + jt, y - 2 - Math.round(ph * 12), 1, 2); } g.globalAlpha = 1;
        if (det.t > 0.02) { const fx = Math.round(P.x + P.face * 9 - cx), tx2 = Math.round((p.x0 + p.x1) / 2 - cx), fy = Math.round(p.y1 - cy), len = Math.round(Math.abs(tx2 - fx) * Math.min(1, k * 1.4));   /* a seam runs along the floor from the staff to the stone */
          g.globalAlpha = 0.5 + 0.3 * k; g.fillStyle = STONE.rune; for (let i = 0; i < len; i += 4) g.fillRect(fx + Math.sign(tx2 - fx) * i, fy - 1 + ((i >> 2) & 1), 2, 1); g.globalAlpha = 1; } } }
    /* (claude/geopop e) THE FLOOR CRACK a detonated stone leaves (crackLife s, fading): a jagged dark line along the floor with an amber seam */
    for (const c of decals) { const a = Math.min(1, c.t / (c.max * 0.5)), x = Math.round(c.x - cx), y = Math.round(c.y - cy), fresh = Math.max(0, 1 - (c.max - c.t) / 0.45);   /* (claude/geopop c) a jagged crack along the floor (both ways, 56 px), two branches, the amber seam glowing for the first 0.45 s */
      g.globalAlpha = a; g.fillStyle = STONE.crack; for (let i = -7; i <= 7; i++) g.fillRect(x + i * 4 - 2, y - 1 + (((i + c.seed) & 3) === 0 ? 1 : 0) + ((i + c.seed) & 1), 4, 1);
      for (const s of [-1, 1]) { const bx = x + s * (8 + (c.seed % 4) * 3); g.fillRect(bx, y, 1, 3); g.fillRect(bx + s, y + 2, 1, 2); g.fillRect(bx + s * 2, y + 3, 1, 1); }
      g.fillStyle = STONE.rune; g.globalAlpha = a * (0.35 + 0.6 * fresh); g.fillRect(x - 10, y - 1, 21, 1); if (fresh > 0) { g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = fresh * 0.5; g.fillRect(x - 14, y - 2, 29, 2); g.restore(); } g.globalAlpha = 1; }
    /* FAULT LINE, TOLD (C1): while she winds, the line the crack will take is drawn on the floor - a run of amber dashes out to where it
       will stop, longer the longer she holds; at a wall or a gap it ends in a bar, and at a full wind in the spike's point */
    const tierNow = P.charge > 0 && api.isGeo() && api.tierNow ? api.tierNow() : 0;   /* (claude/chargetiers) the tier her hold has reached: T1 tells the SHARD's line, T2 the full crack and its spike, T3 the crack and the PILLAR's outline */
    if (tierNow === 1) { const x0 = Math.round(P.x + P.face * 10 - cx), y = Math.round(P.y - 13 - cy); g.globalAlpha = 0.5 + 0.3 * Math.sin(api.time * 18); g.fillStyle = GEO.tiers.cols[1];
      for (let i = 0; i < 14; i++) if (i % 2 === 0) g.fillRect(Math.min(x0 + P.face * i * 4, x0 + P.face * (i * 4 + 2)), y, 2, 1); g.fillRect(x0 + P.face * 58, y - 1, 1, 3); g.globalAlpha = 1; }
    else if (P.charge > 0 && api.isGeo()) { const a = faultPath(tierNow >= 2 ? 1 : Math.min(1, P.charge / api.heavyWind()));
      if (a && tierNow === 3) { const x = Math.round(a.x0 + a.dir * a.len - cx), y = Math.round(a.gy - cy), H = (GEO.tiers.pillar.h + (tal('tall') ? 1 : 0)) * TS; g.globalAlpha = 0.35 + 0.25 * Math.sin(api.time * 14); g.strokeStyle = GEO.tiers.cols[3]; g.lineWidth = 1; g.strokeRect(x - TS / 2 + 0.5, y - H + 0.5, TS - 1, H - 1); g.globalAlpha = 1; }
      if (a) { const y = Math.round(a.gy - cy), x0 = Math.round(a.x0 - cx), n = Math.floor(a.len / 4); g.globalAlpha = 0.5 + 0.3 * Math.sin(api.time * 18); g.fillStyle = STONE.rune;
        for (let i = 0; i < n; i++) if (i % 2 === 0) g.fillRect(Math.min(x0 + a.dir * i * 4, x0 + a.dir * (i * 4 + 3)), y - 1, 3, 1);
        const tx = x0 + a.dir * a.len; if (a.full) { g.fillRect(tx - 1, y - 4, 3, 1); g.fillRect(tx, y - 6, 1, 5); } else if (a.stop) g.fillRect(tx, y - 4, 1, 4);
        g.globalAlpha = 1; } }
    /* (claude/georead) FOUR TIERS, FOUR LOOKS: while she holds X the geode wears a halo that steps with the tier - T0 (the short crack) a small dim amber dot, T1 a grey ring and one pebble round it,
       T2 an amber ring and two diamonds, T3 an ember ring, three square stones and a pulse - so what X will do when let go is readable at the stave. Visual only. */
    if (P.charge > 0 && api.isGeo() && api.staffTip) { const tip = api.staffTip(); if (tip) { const tx = Math.round(tip.x - cx), ty = Math.round(tip.y - cy), col = tierNow ? GEO.tiers.cols[tierNow] : '#b89a58', R = 3 + 3 * tierNow, ph = api.time * (3 + tierNow * 1.5), still = false;
      g.save(); g.globalAlpha = tierNow ? 0.55 + 0.25 * Math.sin(api.time * (10 + 3 * tierNow)) : 0.4; g.strokeStyle = col; g.lineWidth = 1; g.beginPath(); g.arc(tx, ty, R, 0, Math.PI * 2); g.stroke();
      if (tierNow === 3) { g.globalAlpha = 0.25; g.beginPath(); g.arc(tx, ty, R + 3 + 2 * Math.abs(Math.sin(api.time * 9)), 0, Math.PI * 2); g.stroke(); }
      g.globalAlpha = 0.95; g.fillStyle = col;
      for (let i = 0; i < tierNow; i++) { const a = ph + i * Math.PI * 2 / tierNow, px = Math.round(tx + Math.cos(a) * (R + 2)), py = Math.round(ty + Math.sin(a) * (R + 2) * 0.6);
        if (tierNow === 1) g.fillRect(px, py, 2, 2); else if (tierNow === 2) { g.fillRect(px, py - 1, 1, 3); g.fillRect(px - 1, py, 3, 1); } else g.fillRect(px - 1, py - 1, 3, 3); }
      g.restore(); } }
    /* (claude/georead) THE BOARD, COUNTED: three pips under her feet - one per stone she may stand (the cap), the OLDEST on the left (the one the next stone breaks). A filled pip is a stone standing and its fill is the stone's hp
       (a stone that is cracking runs low and blinks); a stone with a TIMER (EARTHFALL's step, a crumbling piece) drains left to right and gets a little bar on its own top. Shown while any stone is near her or one just came or went. */
    { const own = pieces.filter(p => p.capped && !p.gone).sort((a, b) => a.born - b.born), sig = own.length + ':' + own.map(p => p.hp).join('');
      if (sig !== pipSig) { pipSig = sig; pipChange = api.time; if (own.length) pipLast = api.time; }
      const near = pieces.some(p => !p.gone && Math.abs((p.x0 + p.x1) / 2 - P.x) < 200), recent = api.time - pipChange < 2.2;
      if (api.isGeo() && (own.length || (recent && api.time - pipLast < 2.2)) && (near || recent)) { const n = cap(), W = 7, GP = 2, bx = Math.round(P.x - cx - (n * W + (n - 1) * GP) / 2), by = Math.round(P.y - cy) + 6;
        g.save(); g.globalAlpha = recent ? 0.95 : 0.6;
        for (let i = 0; i < n; i++) { const p = own[i], x = bx + i * (W + GP);
          g.fillStyle = 'rgba(14,12,8,0.75)'; g.fillRect(x - 1, by - 1, W + 2, 4); g.fillStyle = 'rgba(90,86,70,0.6)'; g.fillRect(x, by, W, 2);
          if (p) { const f = p.life === Infinity ? Math.max(0.15, p.hp / Math.max(1, p.hp0)) : Math.max(0, 1 - p.age / p.life), low = f < 0.34, blink = low && (Math.floor(api.time * 8) & 1);
            g.fillStyle = blink ? '#ff6b6b' : low ? '#e88a3a' : f < 0.67 ? '#e8c060' : '#e8e4d0'; g.fillRect(x, by, Math.max(1, Math.round(W * f)), 2);
            if (i === 0 && own.length >= n) { g.fillStyle = '#ff6b6b'; g.fillRect(x - 1, by + 3, 2, 1); } } }
        g.restore(); }
      for (const p of pieces) if (!p.gone && p.life !== Infinity && api.isGeo()) { const f = Math.max(0, 1 - p.age / p.life), w = Math.max(4, Math.min(16, p.x1 - p.x0)), x = Math.round((p.x0 + p.x1) / 2 - cx - w / 2), y = Math.round(p.y0 - cy) - 4;
        g.fillStyle = 'rgba(14,12,8,0.75)'; g.fillRect(x - 1, y - 1, w + 2, 3); g.fillStyle = f < 0.34 ? ((Math.floor(api.time * 8) & 1) ? '#ff6b6b' : '#e88a3a') : '#e8c060'; g.fillRect(x, y, Math.round(w * f), 1); } }
    /* SPUR (UP+X, ON THE GROUND): a stone spike jutting up in front of her while the rising blow is live. IN THE AIR (claude/herofeel) it is an instant upward staff arc instead - the shards fan off it (upAir) */
    if (api.isGeo() && (P.swingKind === 'rise' || P.swingKind === 'airUp') && P.atk >= 0 && !P.ground && !P.swim) { const k = P.atk < 0.2 ? 1 - P.atk / 0.2 : 0; if (k > 0) { g.globalAlpha = 0.8 * k; g.strokeStyle = STONE.hi; g.lineWidth = 2; g.beginPath(); g.arc(Math.round(P.x - cx), Math.round(P.y - 12 - cy), 22, P.face > 0 ? -Math.PI * 0.85 : -Math.PI * 0.15, P.face > 0 ? -Math.PI * 0.15 : -Math.PI * 0.85, P.face < 0); g.stroke(); g.globalAlpha = 1; } }
    else if (api.isGeo() && P.swingKind === 'rise' && P.atk >= 0) { const k = P.atk < 0.06 ? P.atk / 0.06 : P.atk < 0.2 ? 1 : Math.max(0, 1 - (P.atk - 0.2) / 0.1), h = Math.round(34 * k);
      if (h > 0) { const x = Math.round(P.x + P.face * 16 - cx), y = Math.round(P.y - cy); drawSpike(g, x, y, h, 7); } }
    for (const s of spikes) { if (s.t < 0) { g.globalAlpha = 0.6; g.fillStyle = STONE.dark; g.fillRect(Math.round(s.x - cx) - 3, Math.round(s.gy - cy) - 1, 7, 1); g.globalAlpha = 1; continue; }
      const fin = s.end || 0.6, rs = s.rise || 0.07, sk = s.sink || 0.2, k = s.t < rs ? s.t / rs : s.t < fin - sk ? 1 : Math.max(0, 1 - (s.t - (fin - sk)) / sk); drawSpike(g, Math.round(s.x - cx), Math.round(s.gy - cy), Math.round((s.h || 26) * k), s.w || 6); }
    for (const fl of faults) { const x0 = Math.round(fl.x0 - cx), y = Math.round(fl.gy - cy), n = Math.floor(fl.len / 6);
      if (fl.heavy) { const fade = Math.min(1, fl.life / FL.linger); g.globalAlpha = Math.max(0.25, fade);   /* HER CRACK: a jagged dark seam with a lit lip, broken rock kicked up at the tip as it runs */
        for (let i = 0; i < n; i++) { const x = x0 + fl.dir * i * 6, j = (i * 7) % 3 - 1; g.fillStyle = STONE.crack; g.fillRect(Math.min(x, x + fl.dir * 6), y - 1 + (j > 0 ? 1 : 0), 6, 1); if (j < 0) g.fillRect(x, y - 2, 1, 2);
          g.fillStyle = STONE.hi; g.fillRect(Math.min(x, x + fl.dir * 6), y - 2 + (j > 0 ? 1 : 0), 2, 1); }
        if (fl.len < fl.max) { const tx = x0 + fl.dir * fl.len; g.fillStyle = STONE.base; g.fillRect(tx - 2, y - 4, 2, 3); g.fillStyle = STONE.hi; g.fillRect(tx + 1, y - 6, 2, 2); g.fillStyle = STONE.lo; g.fillRect(tx - 1, y - 7, 1, 1); }
        g.globalAlpha = 1; continue; }
      g.fillStyle = STONE.crack; for (let i = 0; i < n; i++) { const x = x0 + fl.dir * i * 6; g.fillRect(Math.min(x, x + fl.dir * 6), y - 1 + (i % 2), 6, 1);
        const lift = Math.max(0, Math.round(5 * Math.sin((i * 6 / Math.max(1, fl.len)) * Math.PI) * Math.min(1, fl.life * 2))); if (lift) { g.fillStyle = STONE.base; g.fillRect(x - 2, y - lift, 4, lift); g.fillStyle = STONE.crack; } } }
    for (const u of erupts) { const AV = GEO.avalanche, k = u.t < 0.12 ? u.t / 0.12 : u.t < AV.eruptT ? 1 : Math.max(0, 1 - (u.t - AV.eruptT) / 0.25), x = Math.round(u.x - cx), y = Math.round(u.y - cy);   /* (claude/ults) the pillar: up fast, held, sunk as the boulder leaves it; a ground crack either side */
      g.globalAlpha = 0.7; g.fillStyle = STONE.dark; g.fillRect(x - 12, y - 1, 25, 1); g.globalAlpha = 1; drawSpike(g, x, y, Math.round(u.h * k), u.w); if (k > 0.6) { g.fillStyle = STONE.rune; g.fillRect(x, y - Math.round(u.h * k * 0.5), 1, 3); } }
    for (const r of rollers) drawBoulder(g, r.x - cx, r.y - r.r - cy, r.r, r.spin);
    if (col) drawCollapse(g, cx, cy);
    for (const r of recalls) { const x = Math.round(r.x - cx) - 8, gy = Math.round(r.gy - cy), jit = Math.floor(r.t * 50) % 2;   /* (claude/geofix) A RECALLED STONE: skidding along the floor, a furrow and a drag of grit behind it */
      g.globalAlpha = 0.6; g.fillStyle = STONE.crack; for (let i = 1; i <= 6; i++) g.fillRect(Math.round(r.x - cx) - r.dir * (8 + i * 4), gy - 1 + (i & 1), 3, 1); g.globalAlpha = 0.35; g.fillStyle = '#8c6844'; g.fillRect(Math.round(r.x - cx) - r.dir * 10, gy - 4, 6, 3); g.globalAlpha = 1;
      for (let k = 0; k < r.h; k++) { const y = gy - (k + 1) * TS - jit; if (r.knee && r.h === 1) drawKneeStone(g, x, y, 3, 0); else drawStoneCell(g, x, y, k === r.h - 1, k === 0, 3 + k, 0, k === r.h - 1); } }
    for (const s of shards) { if (s.big) { const x = Math.round(s.x - cx), y = Math.round(s.y - cy), d = Math.sign(s.vx) || 1;   /* (claude/chargetiers) THE STONE SHARD: a wedge of her stone with an amber rune-glint and a grit trail */
        g.fillStyle = STONE.dark; g.fillRect(x - 3, y - 1, 6, 4); g.fillStyle = STONE.hi; g.fillRect(x - 2, y - 1, 5, 2); g.fillStyle = STONE.base; g.fillRect(x - 2, y + 1, 4, 1); g.fillStyle = STONE.rune; g.fillRect(x + d, y, 1, 1);
        g.globalAlpha = 0.5; g.fillStyle = STONE.lo; g.fillRect(x - d * 7, y, 3, 1); g.fillRect(x - d * 11, y + 1, 2, 1); g.globalAlpha = 1; continue; }
      g.fillStyle = STONE.hi; g.fillRect(Math.round(s.x - cx) - 1, Math.round(s.y - cy) - 1, 3, 2); g.fillStyle = STONE.lo; g.fillRect(Math.round(s.x - cx), Math.round(s.y - cy) + 1, 2, 1); }
    for (const f of falls) { const x = Math.round(f.x - cx), gy = Math.round(f.gy - cy);
      if (f.st !== 'done') { const near = f.st === 'wait' ? 0.35 * (1 - f.delay / Math.max(0.01, f.max)) : 0.35 + 0.65 * Math.min(1, 1 - (f.gy - f.y) / 170); const w = Math.round(4 + f.r * 1.4 * near);
        g.globalAlpha = 0.25 + 0.4 * near; g.fillStyle = '#000000'; g.beginPath(); g.ellipse(x, gy - 1, w, 2, 0, 0, 7); g.fill(); g.globalAlpha = 1; }   /* THE SHADOW grows as it comes */
      if (f.st === 'fall') drawBoulder(g, x, Math.round(f.y - cy) - f.r, f.r, f.y * 0.05);
      if (f.st === 'done') { g.globalAlpha = Math.min(1, f.life / 0.3); drawBoulder(g, x, gy - f.r, f.r, 0); g.globalAlpha = 1; } }
    for (const e of foes()) if (e.geoTomb) { const b = api.box(e), x = Math.round(b.l - cx) - 2, y = Math.round(b.t - cy) - 2, w = Math.round(b.r - b.l) + 4, h = Math.round(b.b - b.t) + 3;
      g.globalAlpha = 0.9; g.fillStyle = STONE.base; g.fillRect(x, y, w, h); g.fillStyle = STONE.hi; g.fillRect(x, y, w, 2); g.fillStyle = STONE.lo; g.fillRect(x, y, 2, h); g.fillStyle = STONE.dark; g.fillRect(x + w - 1, y, 1, h);
      g.fillStyle = STONE.moss; g.fillRect(x + 2, y - 1, 4, 1); g.fillStyle = STONE.crack; for (let k = 0; k < e.geoTomb.cracks * 3; k++) g.fillRect(x + 2 + (k * 5) % Math.max(3, w - 4), y + 3 + (k * 7) % Math.max(3, h - 5), 1, 3); g.globalAlpha = 1; }
    /* THE RUNE-WARD: NOT DRAWN AT ALL WHILE SHE WALKS OR STANDS (round 3, item 4) - only while C has it up. It RISES out of the ground in
       front of her over GEO.ward.raise (faint as it comes, C1: not a guard yet), then stands: an earth shield taller than she is (below),
       its brow curled back over her hood, an amber rune boss at its heart and an amber rim - lit bright for the perfect window, and
       brighter still while she is EMPOWERED. Its break is the burst of shards. */
    if (api.isGeo() && !P.dead && !P.geoBurrow && P.geoGuard) { shieldDrawn = true; const f = P.face, [fr, lip] = wardBoxes(), k = Math.min(1, (api.time - P.geoGuardAt) / WD.raise), beat = wardPerfect(), emp = empowered();
      /* AN EARTH SHIELD, NOT A COURSE OF BLOCKS (Daniel, 2026-09-25): a shield of cracked rock and packed earth, shaped like a heater
         shield, its point driven into a heaped mound of soil at her feet and its top grown back over her hood as a brow with roots and
         dirt hanging from its underside. It SURFACES out of the ground (the whole shield slides up over
         GEO.ward.raise, clipped at the floor), and the amber rune boss at its heart is the guard's tell. The boxes it is drawn over
         (wardBoxes) are the ones the blows and shots meet: only the look changed. `u` runs out from her side of the face, `v` down it. */
      const H = fr.b - fr.t, x0 = Math.round(fr.l - cx), by = Math.round(fr.b - cy), w = fr.r - fr.l, sink = Math.round(H * (1 - k)), top = by - H + sink;
      const px = (u, yy, ww, hh, col) => { g.fillStyle = col; g.fillRect(f > 0 ? x0 + u : x0 + w - u - ww, yy, ww, hh); };
      /* ITS SHAPE, row by row: a heater shield - a rounded top, broad through the middle, tapering to a point driven into the mound -
         with a rough rock edge (a notch here and there) */
      const UC = 4, BV = 13, half = v => (v < 4 ? [3, 5, 6, 6][v] : v < 19 ? 6 : Math.max(1, Math.round(6 - 5 * (v - 19) / (H - 20)))), edge = v => [UC - half(v) + ((v * 7) % 9 === 3 ? 1 : 0), UC + half(v) - ((v * 5) % 11 === 7 ? 1 : 0)];
      const CR = [[-4, 3], [5, 6], [-3, 26], [4, 23], [6, 14]], cracked = new Set();   /* THE CRACKS, run out from its boss to the rim */
      for (const [du, dv] of CR) { const n = Math.max(Math.abs(du), Math.abs(dv - BV)); for (let i = 2; i <= n; i++) cracked.add(Math.round(UC + du * i / n) + ',' + Math.round(BV + (dv - BV) * i / n)); }
      const bodyA = k < 1 ? 0.6 + 0.35 * k : 0.95; g.globalAlpha = bodyA;
      g.save(); g.beginPath(); g.rect(x0 - 16, top - 4, w + 32, by - top + 4); g.clip();
      for (let v = 0; v < H; v++) { const yy = top + v, [ul, ur] = edge(v);
        for (let u = ul + 1; u < ur; u++) { const n = (u * 13 + v * 7) % 17, soil = (v > 20 && n < 6) || n === 0 || (v > H - 7);
          px(u, yy, 1, 1, cracked.has(u + ',' + v) ? EARTH.lo : v === 1 || (v < 4 && u === ul + 1) ? STONE.hi : soil ? (n % 2 ? EARTH.base : EARTH.hi) : n === 5 ? STONE.lo : u >= ur - 2 ? STONE.hi : STONE.base); }
        px(ul, yy, 1, 1, STONE.dark); px(ur, yy, 1, 1, v % 10 === 6 ? STONE.moss : v > H - 8 ? EARTH.hi : STONE.hi);   /* the rim: her side in shadow, the foe's side lit (a tuft of moss here and there) */
        if (v === 0) px(ul + 1, yy, ur - ul - 1, 1, STONE.hi); if (v % 10 === 6) px(ur + 1, yy, 1, 1, STONE.moss2); }
      px(UC - 1, top - 1, 3, 1, STONE.moss); px(UC + 3, top, 2, 1, STONE.moss2);   /* moss along its top */
      if (k >= 1) for (let i = 0; i < 2; i++) { const t = (api.time * 1.3 + i * 0.5) % 1, v = 16 + Math.floor(t * (H - 18)); g.globalAlpha = 0.85 * (1 - t); px(edge(v)[1] + 1, top + v, 1, 1, EARTH.base); }   /* a grain of dirt trickling off its face */
      const cv = top + BV; g.globalAlpha = bodyA;   /* THE BOSS at its heart: a round of worked stone */
      px(UC - 2, cv - 1, 5, 3, STONE.dark); px(UC - 1, cv - 2, 3, 5, STONE.dark); px(UC - 1, cv - 1, 3, 3, STONE.hi); px(UC, cv, 2, 2, STONE.base);
      g.globalAlpha = (emp ? 0.95 : beat ? 0.9 : 0.65) * (k < 1 ? k : 1) + (emp || beat ? 0 : 0.2 * Math.sin(api.time * 5));   /* ITS RUNE, and a glyph cut above and below it: the guard's tell */
      px(UC, cv, 1, 1, STONE.rune); px(UC, top + 5, 1, 3, STONE.rune); px(UC - 1, top + 6, 3, 1, STONE.rune); px(UC, top + 20, 1, 2, STONE.rune); px(UC - 1, top + 21, 1, 1, STONE.rune); px(UC + 1, top + 21, 1, 1, STONE.rune);
      if (beat || emp) { g.globalAlpha = beat ? 0.7 : 0.35 + 0.15 * Math.sin(api.time * 12); for (let v = 0; v < H; v++) px(edge(v)[1] + 1, top + v, 1, 1, STONE.rune); }   /* the amber rim: THE BEAT, and EMPOWERED */
      g.restore(); g.globalAlpha = bodyA;
      if (k > 0) {   /* THE MOUND its point is driven into, heaped either side, with a stone or two in it */
        for (const [r, a, z] of [[1, -3, 11], [2, -1, 9], [3, 1, 7], [4, 3, 5]]) for (let u = a; u <= z; u++) px(u, by - r, 1, 1, r >= 3 ? EARTH.hi : (u * 3 + r) % 5 === 0 ? EARTH.lo : EARTH.base);
        px(-3, by - 2, 1, 1, STONE.lo); px(10, by - 1, 2, 1, STONE.hi); px(0, by - 3, 1, 1, EARTH.hi); }
      if (k >= 1) { const ly = Math.round(lip.t - cy), u0 = f > 0 ? lip.l - fr.l : fr.r - lip.r, uEnd = UC;   /* THE BROW: over her hood, grown from the shield's top, thinning and curling down behind her */
        for (let u = u0; u <= uEnd; u++) { const q = (u - u0) / (uEnd - u0), th = 2 + Math.round(2 * q), dr = Math.round(3 * (1 - q) * (1 - q)), yt = ly + dr;
          px(u, yt, 1, 1, u % 5 === 1 ? STONE.moss : STONE.hi); px(u, yt + 1, 1, th - 1, (u * 3) % 7 === 0 ? EARTH.base : (u + 1) % 5 === 0 ? STONE.lo : STONE.base); px(u, yt + th, 1, 1, EARTH.lo);
          if (u % 4 === 2 && u < uEnd - 3) px(u, yt + th + 1, 1, 1 + (u % 3 === 0 ? 1 : 0), EARTH.lo); }   /* roots and dirt hanging under it */
        px(u0 - 1, ly + 3, 1, 2, STONE.dark); }   /* its curled end */
      g.globalAlpha = 1; }
    /* EMPOWERED (a perfect ward): the runes on HER are alight - four amber marks turning slowly round her chest - and they gutter out
       over the last half second, so the end of it is told */
    if (api.isGeo() && !P.dead && !P.geoBurrow && empowered()) { const left = P.geoEmpT - api.time, a0 = left < 0.5 ? left / 0.5 : 1;
      for (let i = 0; i < 4; i++) { const a = api.time * 1.6 + i * Math.PI / 2, x = Math.round(P.x - cx + Math.cos(a) * 11), y = Math.round(P.y - cy - 12 + Math.sin(a) * 5);
        g.globalAlpha = a0 * (Math.sin(a) > 0 ? 0.95 : 0.5); g.fillStyle = STONE.rune; g.fillRect(x, y - 1, 1, 3); g.fillRect(x - 1, y, 3, 1); }
      g.globalAlpha = 1; }
    const drawGolem = G => { const x0 = Math.round(G.x - cx), y0 = Math.round(G.y - cy), sc = G.sc || 1; g.save(); g.translate(x0, y0); if (sc !== 1) g.scale(sc, sc); const x = 0, y = 0, h = Math.round(20 * G.rise), f = G.face, sw = G.swing > 0 ? 4 : 0;
      g.fillStyle = STONE.lo; g.fillRect(x - 6, y - h, 12, h); g.fillStyle = STONE.base; g.fillRect(x - 5, y - h, 10, h - 1); g.fillStyle = STONE.hi; g.fillRect(x - 5, y - h, 10, 2);
      if (h > 14) { g.fillStyle = STONE.moss; g.fillRect(x - 4, y - h - 1, 5, 2); g.fillStyle = STONE.rune; g.fillRect(x + f * 2, y - h + 5, 2, 1); g.fillStyle = STONE.lo; g.fillRect(x + f * (6 + sw) - 2, y - h + 8, 5, 5); g.fillStyle = STONE.base; g.fillRect(x - 3, y - 4, 2, 4); g.fillRect(x + 1, y - 4, 2, 4); } g.restore(); };
    if (golem) drawGolem(golem); if (golem2) drawGolem(golem2);
  }
  function drawSpike(g, x, y, h, w) { for (let k = 0; k < h; k++) { const ww = Math.max(1, Math.round(w * (1 - k / h))); g.fillStyle = k > h - 3 ? STONE.hi : k % 5 === 0 ? STONE.lo : STONE.base; g.fillRect(x - Math.floor(ww / 2), y - k - 1, ww, 1); } }
  function drawBoulder(g, x, y, r, spin) { x = Math.round(x); y = Math.round(y);
    g.fillStyle = STONE.dark; g.beginPath(); g.arc(x, y, r + 1, 0, 7); g.fill(); g.fillStyle = STONE.base; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    g.fillStyle = STONE.hi; g.fillRect(x - Math.round(r / 2), y - r + 1, Math.max(2, r - 1), 1);
    const a = spin || 0; g.fillStyle = STONE.lo; g.fillRect(Math.round(x + Math.cos(a) * r * 0.5), Math.round(y + Math.sin(a) * r * 0.5), 2, 2); g.fillStyle = STONE.moss; g.fillRect(Math.round(x + Math.cos(a + 2.5) * r * 0.6), Math.round(y + Math.sin(a + 2.5) * r * 0.6), 2, 1); }

  const GFK = makeGeoForks(api, { pieces: () => pieces, shards: () => shards, crumble, floorRow, place, T, dmg, isBig, liftable }, fk, GEO.avalanche);   /* (claude/geofork) the new bodies of the fork sides */
  return { forkBodies: GFK, upAir, UP_AIR, collapsing: () => col, recall, recallReady, recalls: () => recalls, stoneAt: (tx, ty) => { const g = grid(); for (const p of pieces) if (!p.gone && p.grid === g) for (const c of p.cells) if (c.tx === tx && c.ty === ty) return true; return false; }, hasStones: () => pieces.length > 0, tierStats: () => ({ ...stats, tiers: stats.tiers.slice() }), resetTierStats: () => { stats.tiers = [0, 0, 0, 0]; stats.pillars = stats.steps = stats.shardHits = stats.rams = stats.gnaws = stats.topples = stats.fists = 0; }, earthfall, baseGrid, update, draw, clear, avalanche, avalancheReady, topple: avalanche, erupts: () => erupts, fistHit, fillBoard, standing, fistPlant, blowPulse, detonate, detonateReady, detonateWorth, detonating: () => !!det, detCd: () => detCd, plantAt: () => plantAt, decals: () => decals, lastDet: () => lastDet ? { blasts: lastDet.blasts, shards: Math.max(0, ...lastDet.tag.sh.values()) } : null, boardFill, faultHeavy, faultPath, guard, wardTakes, wardUp, wardPerfect, empowered, raiseWall, wallTakes, rollStone, quake, gainTremor, tombHit, kit,
    shieldDrawn: () => shieldDrawn, spunAt: () => spunAt, pieces: () => pieces, rollers: () => rollers, falls: () => falls, spikes: () => spikes, shards: () => shards, faults: () => faults, golem: () => golem, freeCell, erupt, place, crumble };
}
