// src/shriek-sisters.js - THE SHRIEK SISTERS, THE ROOKERY's boss (claude/rookery, the OPUS GREYBOX, 2026-10-25; brief scratch/brief-rookery-1024.md, Daniel's pick;
// claude/sisters2, 2026-10-25: EACH SISTER HER OWN SIGNATURE MOVES - Daniel live 10-25 ~17:00, two each, each with its own clear tell; the survivors use theirs more once a sister falls).
// THREE HARPIES AS A TEAM on the summit of the rookery, under the Roc's peak - her daughters. This file is the fight, PURE (each sister's moves, how the team changes when
// one falls, the summit's cracked slabs and the stones the snatcher drops, what a blow does to each, and the bot's plan); src/shriek-sisters-hands.js binds it to the
// world (main.js) and draws them. tools/rookery.mjs checks it.
// HEADER (design-standard B1 / B11 / B14 / B15 / B17): A PUZZLE TEAM WITH THE LEVEL'S RULE AS ITS OPENING. No sister is ever invulnerable:
//   ON THE WING a blow lands at SS.wing (0.4, the B15 floor; told: ON THE WING). LOW (skidded in, raking, swooping, shrieking low, on her perch, grabbing) a blow lands whole.
//   FROM ABOVE (a plunge) whole. KNOCKED DOWN (her dive or rake taken on a shield, or a grab struck loose) x SS.downK.
//   THE LEVEL'S RULE IS THE OPENING (B1): "A HARPY'S DIVE BREAKS WHAT IT HITS". The summit has THREE CRACKED SLABS (and every boulder the snatcher drops lies as a CRACKED
//     STONE for a while, and every CRACKING ECHO leaves a cracked tile). A dive that comes down on cracked rock BREAKS IT and she lies STUNNED IN THE RUBBLE (the shared OPEN
//     read, B10: gold ring + timer) - x SS.stun.mul, up to SS.stun.cap of her (THE PER-BREAK CAP) - then she tears free behind a told WARD (B3: SS.ward s, a pale ring,
//     WARDED). The slab is rubble for SS.slab.regrow s. So: STAND ON THE CRACK, let her aim (the red line LOCKS before she drops), STEP OFF.
//   THE SISTERS (each her own bar segment; the bar is the three) and THEIR SIGNATURE MOVES (claude/sisters2):
//     THE DIVER    hangs over you and DIVES (her red aim line, it locks SS.dive.lock s before she drops) - at YOU, or at the shrieker's MARK. Her own:
//                  CHAIN STOOP  she climbs high and screams (!!), then 2-3 dives back to back, each one AIMED AND MARKED (a numbered ring, the line locks): one that meets
//                               cracked rock breaks it and she bursts out of the rubble for the next; bait EVERY dive of the chain onto cracked rock and she is
//                               EXHAUSTED - the big opening (SS.chain.stun s, up to SS.chain.cap). Only the last dive into rock stuns her if any missed.
//                  TALON RAKE   a dive that meets no rock (a skid): she plants her talons (a yellow !, sparks) and RAKES along the summit floor at you - jump it, or take
//                               it on a shield (she is knocked down, open).
//     THE SHRIEKER hangs highest and SCREAMS (rings, red !!): a red ring snaps onto your spot - THE MARK - and her sisters strike it. Then she SWOOPS low on your side (whole).
//                  Her own:
//                  SHOCK SHRIEK   she drops low on the middle side of you, chest swelling (a yellow !, the pale cone drawn along the floor), and SHRIEKS: the cone SHOVES you
//                                 toward the summit's edge - brace on a shield (no shove) or roll through it; shoved onto the crumbling LIP you TEETER (a told stagger).
//                  CRACKING ECHO  she screams at the floor AHEAD of you (red !!, the tile shivers red): it CRACKS - shards burst up off that tile (off it!) - and it lies
//                                 as a new CRACKED TILE, a new bait spot, for SS.echo.life s.
//     THE SNATCHER perches on a shelf to heave up a BOULDER (whole). Her own:
//                  BOULDER DROP  she carries it HIGH over you; its SHADOW follows you on the floor, then fixes (red !!, the shadow darkens) and she lets it fall: off the
//                                shadow. It lies as a CRACKED STONE (a new bait spot).
//                  THE GRAB      she swoops in at your height from the side (red !!, a red talon line): roll through it or jump it. Caught, she LIFTS you over the summit
//                                floor (never over a drop) - STRIKE HER (SS.grab.strikes blows) to break free: she falls, KNOCKED DOWN; too slow and she lets you fall.
//   TAKE ONE OUT AND THE OTHERS CHANGE (the phases are the deaths; ONE NEW MOVE each, B5) - and THE SURVIVORS USE THEIR OWN MOVES MORE (SS.sig, the chain's count, the rake):
//     the DIVER falls      -> the other two DIVE in her place (the shrieker at her own mark, the snatcher after each drop) - the opening never goes
//     the SHRIEKER falls   -> the diver's dives come in PAIRS (a second, quicker one off the floor); the snatcher drops TWO boulders a carry
//     the SNATCHER falls   -> the slabs crack again faster; the shrieker gains THE SHRIEK WAVE (a told yellow ! cone along the floor from her swoop: jump it or block)
//     after the first fall, a sister left with the snatcher's talons gains THE SNATCH (a low red !! sweep across the summit at your height: jump it or roll)
//     the LAST SISTER is frantic: every cooldown x SS.last
//   NO ADDS (the three are the fight). Every move TOLD with its own windup and release pose (B16, src/shriek-sisters-hands.js POSE) and its own sound.
import { tempoOf } from './marks.js';   /* (claude/rookery3) THE TEMPO CLASSES: src/marks.js TEMPO_CLASS */
import { GALE, inCone as GHinCone } from './gale-harpy.js';   /* (claude/rookery4) THE SNATCHER's WING GUST is the gale harpy's cone (a shared foe module, pure) */
export const SS = {
  hp: { diver: 775, shrieker: 585, snatcher: 675 },   /* (claude/rookery3: +4% with the stagger, 830/625/720 -> 860/650/750: n=24/hero read 62% at +11%, 60% at +7%; the fights had fallen to ~95 s at +0%) */   /* (claude/rookery2 tune: 770/580/670 -> 830/625/720 with the ride and phase 2, n=12/hero 74% -> see the lane report) */   /* (claude/sisters2 tune, BOT_PROFILE=human L14 n=36/hero: 920/690/800 -> 770/580/670, grab dmg 12 -> 10, grab cd 8/5.5/4.5 -> 10/7/5.5 first 7 -> 9: 47% -> 68%) */
  wing: 0.4, downK: 1.5, wardMul: 0.4, last: 0.8,
  hover: { diver: 112, shrieker: 150, snatcher: 104 },   /* (claude/sisters2: the boulder's carry 150 -> 118 so the dropTell pose and its mark are on the arena's screen; the shrieker stays at 150 - at 124 her own dives after the diver falls came too fast: 54%) */
  dive: { tell: [0.75, 0.75, 0.72], lock: 0.26, markTell: 0.62, v: 430, dmg: 18, land: 0.7, rise: 0.8, cd: [1.8, 1.6, 1.4], second: 0.42, pairDmg: 15, downed: 0.9 },   /* (claude/rookery3: the shield's knock-down 1.1 -> 0.9 - the knight blocks every medium dive now that they come one at a time: 24/24) */   /* (claude/rookery3) MEDIUM: 0.75 in every phase (was 0.85/0.75/0.7); the pair's second dive is LIGHT (0.42, 12) */
  stun: { t: 2.6, mul: 2, cap: 0.24 },
  ward: 2.5,
  slab: { w: 48, regrow: [9, 9, 6.5] },
  scream: { tell: 1.15, cd: [3.8, 3.3, 2.8], mark: 1.6, swoop: 1.9, low: 34 },   /* (claude/rookery3) HEAVY: 0.95 -> 1.15 (head thrown back, a deep cue); the swoop after it is the punish */
  wave: { tell: 0.7, v: 230, h: 26, dmg: 18, life: 1.8 },   /* (claude/rookery3) MEDIUM */
  rock: { tell: 1.1, fall: 0.62, r: 22, dmg: 28, life: 11, pick: 1.0, carry: 2.2, high: 118, spent: 0.9, low: 40 },   /* (claude/rookery3) HEAVY: 0.8 -> 1.1, 21 -> 24; then SPENT: she sinks low and empty-handed for SS.rock.spent s (whole: the punish) */   /* THE BOULDER DROP (claude/sisters2: carried high, a shadow marker) */
  snatch: { tell: 0.42, v: 320, h: 16, dmg: 15, cd: 6.5 },   /* (claude/rookery3) LIGHT: 0.8 -> 0.42, 22 -> 12 (she sweeps in from the far wall: the crossing is the read) */
  sister: { w: 26, h: 18 },
  /* (claude/sisters2) THE SIGNATURE MOVES. sig: each survivor's own cooldown x this by phase (0 = all three, 1 = one fallen, 2 = the last) */
  sig: [1, 0.72, 0.6],
  chain: { tell: 1.15, n: [2, 3, 3], every: [3, 2, 2], aim: 0.66, jar: 0.42, stun: 4.0, cap: 0.34, rise: 12, dmg: 28, spent: 1.0 },   /* (rise 40 -> 12: the heavy climb, grown, stayed under the screen's top edge) */   /* (claude/rookery3) HEAVY: 0.9 -> 1.15, each dive 24; a chain that ends in no rock leaves her SPENT on the floor (whole) */
  rake: { tell: 0.4, v: 250, T: 0.5, h: 16, dmg: 14, chance: [0.6, 1, 1], end: 0.6, pre: 0.25 },   /* (claude/rookery3) LIGHT: 0.5 -> 0.4, 18 -> 11, a shorter slide */
  shock: { tell: 0.7, range: 150, h: 64, dmg: 8, vx: 300, vy: -160, low: 30, gap: 64, edge: 30, teeter: 0.7, T: 0.45 },
  echo: { tell: 0.42, ahead: 56, w: 22, dmg: 11, life: 8, T: 0.3 },   /* (claude/rookery3) LIGHT: 0.75 -> 0.42, 14 -> 8 (the tile is AHEAD of you: a quick flash) */
  grab: { tell: 0.7, v: 290, T: 0.8, h: 14, dmg: 16, lift: 0.8, hold: 2.6,   /* (claude/rookery4: hold 1.8 -> 2.6 - she carries you to a roost now) */ strikes: 3, gap: 0.22, liftH: 56, drop: 22, free: 1.6, cd: [6.5, 5, 4], first: 8, hang: 24 },
  /* (claude/rookery2) THE LEVEL'S VERB IN THE FIGHT - P1: a sister KNOCKED DOWN (her dive or rake on a shield, a grab struck loose) climbs off the rock (ferryWait, SS.ride.window s:
     UP: GRAB): grab her talons and she FERRIES you up to the SHRIEKER'S PERCH (a bone nest lashed to a spire); land beside the shrieker and she is CORNERED (open x SS.ride.mul,
     up to SS.ride.cap of her) for SS.ride.startle s, then flees behind her ward. The nest tips you off after SS.ride.tip s (no camping on it) */
  ride: { window: 1.1, reach: 24, v: 170, minT: 0.9, hang: 22, startle: 2.6, mul: 1.5, cap: 0.24, tip: 3.4, rise: 30 },
  /* (claude/rookery2) PHASE 2 = TWO SISTERS DEAD: the survivor GROWS (SS.p2.scale, no HP) and takes a reduced set of the dead sisters' moves (P2KIT), one at a time, each its own tell;
     and THE SNATCH: she seizes you (her red !! talon line) and carries you over the summit - STRIKE HER SS.p2.strikes times mid-carry and you both fall: she lands STUNNED (the
     big opening, SS.p2.stun s up to SS.p2.cap of her) */
  p2: { grow: 1.5, scale: 1.3, hover: 96, cd: 1.3, strikes: 2, stun: 3.2, cap: 0.3, liftH: 70, drift: 46, grabCd: 7.5, grabFirst: 3 },
  /* (claude/rookery3) THE TEMPO (Daniel 10-29 live: "they attack way too quickly and at the same speed ... a heavy, a light, and a medium one"). Every told move has a CLASS (TEMPO below):
     HEAVY a long readable windup (1.1-1.15 s), her biggest pose, a deep cue, hits hard, then a long recovery (the punish); MEDIUM 0.7-0.75 s; LIGHT 0.4-0.42 s, low damage, short.
     THE STAGGER: no sister STARTS a move sooner than gap[class of the last start] s after the last one, nor while another is striking; she may wind up while another
     winds up only if their two blows land at least sep s apart (a light snaps out before a heavy lands) - so two never wind up in lock-step;
     a move kept waiting holds its pose (the boulder stays carried, the rake stays planted) for at most `hold` s */
  tempo: { gap: { heavy: 1.1, medium: 0.7, light: 0.5 }, hold: 2.0, sep: 0.5 },
  /* ---------- (claude/rookery4) ONE HUNTER AT A TIME (Daniel 10-30 17:33, brief scratch/brief-rookery4-1030.md) ----------
     turn: a sister HUNTS for t +/- jit s (x k per death) or until she is OPENED and the opening is done; then a hand-over of `hand` s (the old Hunter climbs to her roost, the next one
           drops: her portrait pulses on the bar). support: while one hunts, the other two ROOST and ONE of them at a time does ONE small told support move, every cd s (x k per death),
           never while the Hunter winds up or strikes (and the Hunter never starts into one). The three support moves (all MEDIUM tells, small blows): */
  turn: { t: 12, jit: 2, k: 0.75, hand: 0.8 },   /* (12 +/- 2: with the wait for her to finish what she is in, a turn reads 12-16 s) */
  support: { cd: 5, first: 3.5, k: 0.85 },   /* (claude/rookery4tune: 6/4.5 -> 4/3 and dive.cd x0.78: rookery4 as built read 83% with 150-200 s fights; master 67% at ~100 s) */
  pebble: { tell: 0.7, T: 0.8, r: 14, dmg: 8, arc: 50 },   /* THE DIVER's PEBBLE KICK from her roost: a slow rock lobbed at your spot (or the mark), its landing ring drawn the whole way */
  smark: { tell: 0.7, life: 3.2 },                         /* THE SHRIEKER's MARK from her perch: her ring on your spot - the Hunter's next blow goes to it */
  gust: { tell: 0.7, T: 0.5, low: 30, broken: 0.9, out: 170 },       /* THE SNATCHER's WING GUST (src/gale-harpy.js GALE + inCone): she drops low by her nest and beats a gust along the floor - a shield braces
                                                              (half), a blow in the tell BREAKS it (she tumbles, knocked down) */
  /* BONE NESTS ON CRACKED ARMS (the main new opening): bait the Hunter's dive (or the Snatcher's boulder) onto a nest's cracked ARM FOOT on the summit floor - the arm snaps, the nest
     DROPS (a platform low over the floor for the rest of the fight) and the sister ROOSTING on it crashes down STUNNED (x mul up to cap of her); the Hunter herself skids off the arm */
  nest: { stun: 4, mul: 2, cap: 0.08, foot: 24 },
  /* A ROOSTING SISTER: x0.4 on the wing (B15) - WHOLE when you strike her from her own roost; landing on a roost beside her CORNERS her (the ride's corner: x ride.mul, up to ride.cap;
     struck loose from the grab onto her roost: x roost.mul up to roost.cap) - once per `again` s each; r: how near a roost the grab must be for you to land on it */
  roost: { mul: 1, cap: 0.2, again: 12, close: 40, r: 56 },
  ff: { stun: 3, mul: 2, cap: 0.05 },   /* FRIENDLY FIRE: brace on the mark as the Hunter's line locks on it - her dive goes to a roosting sister instead: that one crashes STUNNED, the Hunter DOWN */
  vent: { lift: 170 },                  /* THE UPDRAFTS (plugged until the Snatcher falls): the way up to the roost tier once her gusts are gone */
};
/* (claude/rookery4) THE SUMMIT'S ROOSTS (tile columns from the arena's west edge, rows over the summit floor): the Diver's low nest, the Snatcher's two side nests (she takes the nearer),
   the Shrieker's perch (the level's plank, L.arena.perchS) over THE CRACKED OVERHANG - its foot on the floor; broken, it slides down as STEPS up to her perch. Two UPDRAFT VENTS. */
export const NESTS = [{ id: 'diver', role: 'diver', c: [14, 16], up: 4, down: 2, foot: 15 }, { id: 'snW', role: 'snatcher', c: [0, 2], up: 7, down: 2, foot: 2 }, { id: 'snE', role: 'snatcher', c: [39, 41], up: 7, down: 2, foot: 39 }];
export const OVERHANG = { foot: 25, slab: [22, 26, 5], steps: [[22, 23, 2], [24, 25, 4], [26, 26, 6]] };
export const VENTS = [{ c: 12, top: 8 }, { c: 30, top: 8 }];
/* (claude/rookery2) THE SURVIVOR'S KIT (P2): her own moves + one or two of each dead sister's, in this order, one at a time */
export const P2KIT = { diver: ['dive', 'shock', 'chain', 'boulder', 'grab'], shrieker: ['mark', 'dive', 'echo', 'boulder', 'grab', 'shock'], snatcher: ['boulder', 'dive', 'grab', 'shock'] };
export const ROLES = ['diver', 'shrieker', 'snatcher'];
export const NAME = { diver: 'THE DIVER', shrieker: 'THE SHRIEKER', snatcher: 'THE SNATCHER' };
export const SS_SAY = { wake: 'THE SHRIEK SISTERS', rule: 'STAND ON A CRACK. WHEN HER LINE LOCKS, STEP OFF: SHE BREAKS IT AND LIES STUNNED.', stunned: 'STUNNED IN THE RUBBLE', ward: 'SHE TEARS FREE',
  wing: 'ON THE WING', warded: 'WARDED', mark: 'SHE MARKS YOU', rock: 'A BOULDER: OFF ITS SHADOW', stone: 'IT LIES CRACKED', diverFell: 'THE DIVER FALLS: HER SISTERS DIVE',
  shriekerFell: 'THE SHRIEKER FALLS: THE DIVES COME IN PAIRS', snatcherFell: 'THE SNATCHER FALLS: THE CRAG CRACKS FASTER', last: 'THE LAST SISTER', snatch: 'THE SNATCH: JUMP IT',
  wave: 'THE SHRIEK WAVE: JUMP IT OR BLOCK', skid: 'SHE SKIDS ON THE ROCK', downed: 'KNOCKED DOWN',
  /* (claude/sisters2) the signature moves */
  chain: 'CHAIN STOOP: A CRACK FOR EVERY DIVE', burst: 'SHE BURSTS FROM THE RUBBLE', exhausted: 'EXHAUSTED IN THE RUBBLE', rake: 'TALON RAKE: JUMP IT OR BLOCK',
  shock: 'SHOCK SHRIEK: BRACE OR ROLL', teeter: 'TEETERING ON THE EDGE', braced: 'BRACED', echo: 'CRACKING ECHO: OFF THE SHIVERING ROCK', echoCrack: 'A NEW CRACK',
  grab: 'THE GRAB: ROLL OR JUMP IT', grabbed: 'GRABBED: STRIKE HER', free: 'BROKE FREE', letGo: 'SHE LETS YOU FALL',
  /* (claude/rookery2) the ride, the perch, phase 2 */
  ride: 'UP: GRAB HER TALONS', ferry: 'SHE CARRIES YOU UP', cornered: 'CORNERED ON HER PERCH', tips: 'THE NEST TIPS', grow: 'THE LAST SISTER TAKES THEIR GIFTS',
  snatchP2: 'THE SNATCH: STRIKE HER IN THE AIR', fellBoth: 'YOU FALL TOGETHER: SHE IS STUNNED',
  /* (claude/rookery4) one hunter at a time, the roosts, the support moves */
  hunts: 'THE DIVER HUNTS', huntsS: 'THE SHRIEKER HUNTS', huntsN: 'THE SNATCHER HUNTS',
  pebble: 'A PEBBLE: OFF ITS RING', smark: 'HER SISTER MARKS YOU', gust: 'A WING GUST: BRACE', gustBroken: 'THE GUST IS BROKEN',
  nestFalls: 'THE NEST FALLS', crash: 'SHE CRASHES DOWN: STUNNED', overhang: 'THE OVERHANG SLIDES: STEPS TO HER PERCH', updraft: 'THE UPDRAFT OPENS',
  roost: 'BAIT HER DIVE ONTO A NEST\'S CRACKED ARM: THE NEST FALLS WITH HER SISTER', perch: 'ON HER PERCH', landed: 'STRUCK LOOSE ONTO HER ROOST',
  ff: 'FRIENDLY FIRE', ffTurn: 'BRACE ON THE MARK AS HER LINE LOCKS: SHE MEETS HER SISTER' };
export const HUNTS = { diver: SS_SAY.hunts, shrieker: SS_SAY.huntsS, snatcher: SS_SAY.huntsN };
export const OPEN_NAME = { stuck: 'STUNNED', downed: 'DOWN', startled: 'CORNERED' };
const WING_MODES = new Set(['grow', 'ferry', 'perched', 'hover', 'diveTell', 'rise', 'screamTell', 'scream', 'carry', 'dropTell', 'drop', 'fly', 'snatchTell', 'wake', 'sleep', 'chainTell', 'echoTell', 'echo',
  'shockTell', 'shock', 'toRoost', 'pebbleTell', 'pebble', 'markTell']);   /* (claude/rookery4: the Shrieker hunts from the high perch tier - her shock shriek too; her mark dive is the only time she comes low) */
const LOW_MODES = new Set(['spent', 'ferryWait', 'land', 'swoop', 'pick', 'waveTell', 'wave', 'snatch', 'jar', 'rakeTell', 'rake', 'grabTell', 'grab', 'lift', 'hold', 'gustTell', 'gust']);
export const sisOpen = s => !!s && s.alive && (s.mode === 'stuck' || s.mode === 'downed' || s.mode === 'startled');
export const ssOpen = S => !!S && ROLES.some(r => sisOpen(S.sis[r]));
const TELLS = new Set(['diveTell', 'screamTell', 'dropTell', 'snatchTell', 'waveTell', 'chainTell', 'rakeTell', 'shockTell', 'echoTell', 'grabTell', 'pebbleTell', 'markTell', 'gustTell']);
/* (claude/rookery4) THE SUPPORT MOVES a roosting sister makes (one at a time, never into the Hunter's blow) */
export const SUPPORT = new Set(['pebbleTell', 'pebble', 'markTell', 'gustTell', 'gust']);
export const sisTelling = s => !!s && TELLS.has(s.mode);
/* (claude/rookery3) THE TEMPO CLASS of each told move (by its windup). The diveTell is MEDIUM on its own, HEAVY inside a chain stoop or at the shrieker's mark (those are the
   heavy moves' strikes), LIGHT as the pair's quick second dive: s.tempo carries the class a windup was started with */
export const TEMPO = Object.fromEntries([...TELLS].map(m => [m, tempoOf('shrieksister|' + m)]));   /* the table lives in src/marks.js TEMPO_CLASS (the tell system; tools/tells.mjs audits it) */
const BUSY = new Set([...TELLS, 'dive', 'rake', 'shock', 'echo', 'grab', 'snatch', 'wave', 'pebble', 'gust']);
const ATTACK = new Set([...BUSY].filter(m => !SUPPORT.has(m)));   /* a Hunter's blow (the support moves are not) */
/* a windup starts: its class (the hands draw and sound it by class); own = an independent start, which the stagger counts (a heavy move's own strikes, the pair, are not) */
function told(S, s, cls, w, own) { s.tempo = cls; s.tempoT = Math.max(0.01, s.modeT); S.n.tempo[cls] = (S.n.tempo[cls] || 0) + 1;
  if (own !== false) { if (S.tLast > -50) S.n.minGap = Math.min(S.n.minGap, S.clock - S.tLast); S.tLast = S.clock; S.tCls = cls; }
  if (w && w.tempo) w.tempo(s, cls); }
/* THE STAGGER: may sister s start a move now? (no other sister winding up or striking, and the last start's gap gone by) */
/* len: the windup she would start. Another sister STRIKING blocks it; another WINDING UP allows it only if their two blows land at least SS.tempo.sep s apart (a quick light
   snaps out well before a slow heavy lands, or after it) - and never with two others winding up. len omitted: no overlap at all */
/* (claude/rookery4) ONE HUNTER AT A TIME: no overlap at all any more - another sister winding up or striking (the Hunter, or a roosting sister's support move, or a pebble in the air)
   blocks the start; the gap and the sep stay */
export function teamClear(S, s, len) { if (S.clock - S.tLast < SS.tempo.gap[S.tCls || 'light']) return false; if (S.clock + (len || 0) - (S.lastRel ?? -99) < SS.tempo.sep) return false;   /* (and not landing just after a blow that just landed) */
  if ((S.pebbles || []).length) return false;
  for (const r of ROLES) { const q = S.sis[r]; if (r === s.role || !q.alive) continue; if (BUSY.has(q.mode)) return false; }
  return true; }
/* is sister s the one who may start a blow now (the Hunter, not in the hand-over; the last sister always) */
export const isHunter = (S, s) => !!s && (S.p2 ? S.p2 === s.role : S.hunter === s.role && !(S.hand > 0));
/* ...and may she START a new move (her turn not run out: once it has, she finishes what she is in and hands over) */
const mayStart = (S, s) => isHunter(S, s) && (!!S.p2 || S.turnT > 0);
/* THE SHRIEKER's turn: what her next scream is, by phase (the survivors lean on their own: SHOCK and ECHO) */
export const ROT = [['mark', 'echo', 'mark', 'shock'], ['shock', 'echo', 'mark', 'shock', 'echo'], ['shock', 'echo', 'shock', 'echo', 'mark']];
/* THE SUMMIT (px): x0/x1 inside the walls, floorY, the three slabs (tile columns of their middles), the two shelves (the snatcher's perches) */
export function geom(A, TS = 16) {
  const fl = A.floor, slabs = (A.slabs || []).map((c, i) => ({ id: i, x: c * TS + 8, st: 'crack', t: 0 }));
  const pr = A.perchS || null;   /* (claude/rookery2) [x0, x1, row] tiles: the shrieker's nest, high on its spire */
  const perchS = pr ? { x: (pr[0] + pr[1] + 1) * TS / 2, w: (pr[1] - pr[0] + 1) * TS, y: pr[2] * TS } : null;
  /* (claude/rookery4) the nests on their cracked arms, the overhang and its steps, the vents - in px; cells (tile x, row) for the hands to lay */
  const c0 = Math.round(A.x0 / TS), F = Math.round(fl / TS), wide = Math.round((A.x1 - A.x0) / TS) >= 42;
  const nests = wide ? NESTS.map(n => ({ ...n, x0: (c0 + n.c[0]) * TS, x1: (c0 + n.c[1] + 1) * TS, x: (c0 + (n.c[0] + n.c[1] + 1) / 2) * TS, w: (n.c[1] - n.c[0] + 1) * TS,
    topUp: (F - n.up) * TS, topDown: (F - n.down) * TS, rowUp: F - n.up, rowDown: F - n.down, cols: [c0 + n.c[0], c0 + n.c[1]], footX: (c0 + n.foot) * TS + 8, st: 'up' })) : [];
  const over = wide && perchS ? { footX: (c0 + OVERHANG.foot) * TS + 8, slab: { x0: (c0 + OVERHANG.slab[0]) * TS, x1: (c0 + OVERHANG.slab[1] + 1) * TS, y: (F - OVERHANG.slab[2]) * TS },
    steps: OVERHANG.steps.map(([a, b, up]) => ({ cols: [c0 + a, c0 + b], row: F - up, x0: (c0 + a) * TS, x1: (c0 + b + 1) * TS, y: (F - up) * TS })), st: 'up' } : null;
  const vents = wide ? VENTS.map(v => ({ x: (c0 + v.c) * TS + 8, topY: fl - v.top * TS, open: false })) : [];
  return { x0: A.x0, x1: A.x1, floorY: fl, mid: (A.x0 + A.x1) / 2, slabs, perch: [A.x0 + 5 * TS, A.x1 - 5 * TS], perchY: fl - 3 * TS, perchS, TS, nests, over, vents };
}
/* (claude/rookery4) EVERY ROOST: { id, x, w, top (its footing's top, px), high (out of a jump: the nest tips a hero off it) } - the nests where they hang (or lie, dropped), the perch */
export function roostList(S) { const G = S.G, out = G.nests.map(n => ({ id: n.id, x: n.x, w: n.w, top: n.st === 'up' ? n.topUp : n.topDown, high: n.st === 'up', nest: n }));
  if (G.perchS) out.push({ id: 'perch', x: G.perchS.x, w: G.perchS.w, top: G.perchS.y, high: true }); return out; }
export const roostById = (S, id) => roostList(S).find(R => R.id === id) || null;
/* where sister s roosts: the Diver her nest, the Shrieker her perch, the Snatcher the side nest nearer her (never one a hero stands on, if the other is free) */
function roostOf(S, s, P) { if (s.role === 'shrieker') return S.G.perchS ? 'perch' : null; if (s.role === 'diver') return S.G.nests.length ? 'diver' : null;
  const ns = S.G.nests.filter(n => n.role === 'snatcher'); if (!ns.length) return null; if (s.roost && ns.some(n => n.id === s.roost) && !(S.onT[s.roost] > 0)) return s.roost;
  const free = ns.filter(n => !(S.onT[n.id] > 0)), pick = (free.length ? free : ns).slice().sort((a, b) => Math.abs(a.x - s.x) - Math.abs(b.x - s.x))[0]; return pick.id; }
/* her seat on it (the Shrieker on the perch's east end, as before) */
function seatOf(S, R) { if (R.id === 'perch') { const P0 = S.G.perchS; return [P0.x + P0.w / 2 - 6, P0.y - 2]; } return [R.x, R.top - 2]; }
export function newFight(G) {
  const sis = {}; for (const r of ROLES) sis[r] = { role: r, hp: SS.hp[r], maxHp: SS.hp[r], alive: true, x: G.mid + (r === 'diver' ? -60 : r === 'snatcher' ? 70 : 0), y: G.floorY - SS.hover[r], face: -1, mode: 'sleep', modeT: 0, ward: 0, cd: r === 'diver' ? 1.2 : r === 'shrieker' ? 2.6 : 0.6, purse: 0, rocks: 0, side: r === 'snatcher' ? 1 : -1, act: 0, nAtk: 0, rot: 0 };
  return { G, sis, ph: 1, dead: {}, ride: null, p2: null, perchT: 0, tLast: -99, tCls: 'light', marks: [], rocks: [], stones: [], waves: [], echoes: [], told: {}, act: 0, snatchCd: SS.snatch.cd, grabCd: SS.grab.first, held: null, clock: 0, rnd: Math.random,
    /* (claude/rookery4) THE TURN: who hunts, how long she has, the hand-over; the support clock and whose support is next; the pebbles in the air; heroes on each roost (s) */
    hunter: 'diver', turnT: SS.turn.t, hand: 0, handAt: -9, supCd: SS.support.first, supI: 0, pebbles: [], onT: {}, landMul: null, turnLog: [],
    n: { dives: 0, stuns: 0, skids: 0, downs: 0, screams: 0, marksStruck: 0, drops: 0, stones: 0, snatches: 0, waves: 0, wardHits: 0, wingHits: 0, lowHits: 0, openHits: 0, fell: [],
      turns: 0, turnsOpened: 0, supports: { pebble: 0, mark: 0, gust: 0 }, gustBroken: 0, nests: 0, crashes: 0, overhang: 0, vents: 0, landed: 0, ff: 0, ffTurned: 0, perchHits: 0, multi: 0, overlap: 0,
      rides: 0, ferries: 0, cornered: 0, tips: 0, p2Grabs: 0, p2Falls: 0, p2Moves: {},
      tempo: { heavy: 0, medium: 0, light: 0 }, minGap: 99, held: 0,   /* (claude/rookery3) starts by class, the shortest gap between two independent starts, moves the stagger held back */
      chains: 0, chainDives: 0, bursts: 0, exhausted: 0, rakes: 0, rakeDowns: 0, shocks: 0, shoved: 0, braced: 0, teeters: 0, echoes: 0, echoStruck: 0, grabs: 0, grabbed: 0, freed: 0, letGo: 0 } };
}
const alive = S => ROLES.filter(r => S.sis[r].alive);
const ph = S => Math.min(2, 3 - alive(S).length);   /* 0, 1, 2: the deaths */
const cdK = S => alive(S).length === 1 ? SS.last : 1;
const sigK = S => SS.sig[ph(S)] * cdK(S);
/* the cracked rock under x on the floor: a slab ('crack'), a stone (a dropped boulder) or an echo's tile */
export function crackAt(S, x) {
  for (const n of S.G.nests || []) if (n.st === 'up' && Math.abs(x - n.footX) < SS.nest.foot / 2 + 4) return { kind: 'arm', s: n };   /* (claude/rookery4) a nest's cracked arm */
  { const o = S.G.over; if (o && o.st === 'up' && Math.abs(x - o.footX) < SS.nest.foot / 2 + 4) return { kind: 'over', s: o }; }   /* the overhang's cracked foot */
  for (const s of S.G.slabs) if (s.st === 'crack' && Math.abs(x - s.x) < SS.slab.w / 2 + 4) return { kind: 'slab', s };
  for (const q of S.stones) if (Math.abs(x - q.x) < 14) return { kind: 'stone', s: q };
  for (const q of S.echoes || []) if (Math.abs(x - q.x) < SS.echo.w / 2 + 2) return { kind: 'echo', s: q };
  return null;
}
export const cracks = S => [...S.G.slabs.filter(s => s.st === 'crack').map(s => ({ x: s.x, w: SS.slab.w, slab: s })), ...S.stones.map(q => ({ x: q.x, w: 24, stone: q })), ...(S.echoes || []).map(q => ({ x: q.x, w: SS.echo.w, echo: q }))];
/* (claude/rookery4) the arms and the overhang's foot (once each): { x, w, arm: nest | over } */
export const arms = S => [...(S.G.nests || []).filter(n => n.st === 'up').map(n => ({ x: n.footX, w: SS.nest.foot, arm: n })), ...(S.G.over && S.G.over.st === 'up' ? [{ x: S.G.over.footX, w: SS.nest.foot, over: S.G.over }] : [])];
function breakCrack(S, c, w) { if (c.kind === 'arm') return dropNest(S, c.s, w); if (c.kind === 'over') return dropOver(S, w);
  if (c.kind === 'slab') { c.s.st = 'rubble'; c.s.t = SS.slab.regrow[S.dead.snatcher ? 2 : 0]; } else c.s.t = 0; if (c.kind === 'echo') S.n.echoStruck++; }
/* (claude/rookery4) A NEST'S ARM SNAPS: the nest drops low (a platform for the rest of the fight), and the sister roosting on it crashes down STUNNED */
function dropNest(S, n, w) { if (!n || n.st !== 'up') return; n.st = 'down'; S.n.nests++; if (w && w.nest) w.nest(n); if (w) { w.shake(6); w.sound('smash'); w.number(n.x, n.topDown - 30, SS_SAY.nestFalls, '#ffd36b'); }
  const s = ROLES.map(r => S.sis[r]).find(q => q.alive && q.roost === n.id && (q.mode === 'perched' || q.mode === 'toRoost' || SUPPORT.has(q.mode)) && !isHunter(S, q) && Math.abs(q.x - n.x) < n.w);
  if (!s) return; s.chain = null; s.mode = 'stuck'; s.modeT = SS.nest.stun; s.openT0 = s.modeT; s.purse = s.maxHp * SS.nest.cap; s.openMul = SS.nest.mul; s.big = false; s.x = clampX(S, n.x + (n.x < S.G.mid ? 1 : -1) * (n.w / 2 + 10), 18); s.y = S.G.floorY; s.crash = true;   /* (down on the summit floor beside her nest: every hero reaches her - B12) */
  S.n.crashes++; S.n.stuns++; if (w) { w.fx('open', s.x, s.y); w.number(s.x, s.y - 40, SS_SAY.crash, '#ffd36b'); } }
function dropOver(S, w) { const o = S.G.over; if (!o || o.st !== 'up') return; o.st = 'down'; S.n.overhang++; if (w && w.over) w.over(o); if (w) { w.shake(5); w.sound('smash'); w.number(o.footX, S.G.floorY - 60, SS_SAY.overhang, '#ffd36b'); } }
/* ---------- ONE FRAME OF THE TEAM. heroes: [{ x, y, ground, alive, face, pp }]; w: the world (src/shriek-sisters-hands.js world()) ---------- */
export function stepSisters(S, dt, heroes, w) {
  const G = S.G, P = heroes.find(h => h.alive && !(S.held && S.held.pp && h.pp === S.held.pp)) || heroes.find(h => h.alive) || heroes[0];
  S.clock += dt; S._heroes = heroes;
  for (const sl of G.slabs) if (sl.st === 'rubble') { sl.t -= dt; if (sl.t <= 0) { sl.st = 'crack'; w.sound('crack'); } }
  for (const q of S.stones) q.t -= dt; S.stones = S.stones.filter(q => q.t > 0);
  for (const q of S.echoes) q.t -= dt; S.echoes = S.echoes.filter(q => { if (q.t > 0) return true; w.dust(q.x, G.floorY, 4); return false; });
  for (const m of S.marks) m.t -= dt; S.marks = S.marks.filter(m => m.t > 0);
  stepRocks(S, dt, heroes, w); stepWaves(S, dt, heroes, w); stepPebbles(S, dt, heroes, w);
  stepRoosts(S, dt, heroes, w);
  stepTurn(S, dt, P, w);
  for (const r of ROLES) { const s = S.sis[r]; if (!s.alive) continue; s.ward = Math.max(0, s.ward - dt); s.cornerCd = Math.max(0, (s.cornerCd || 0) - dt); if (s.mode === 'sleep') continue; s.modeT -= dt; s.cd -= dt;
    if (stepFerry(S, s, dt, P, w)) continue;
    if (s.mode === 'startled') { stepStartled(S, s, dt, w); continue; }
    if (SUPPORT.has(s.mode)) { stepSupportMove(S, s, dt, P, w, heroes); continue; }
    if (S.p2 === r) { stepSurvivor(S, s, dt, P, w, heroes); continue; }
    if (!isHunter(S, s) && ROOST_IDLE.has(s.mode)) { stepRoosting(S, s, dt, P, w); continue; }   /* (claude/rookery4) roosting: to her roost, sit (a support move now and then) */
    if (r === 'diver') stepDiver(S, s, dt, P, w); else if (r === 'shrieker') stepShrieker(S, s, dt, P, w); else stepSnatcher(S, s, dt, P, w, heroes); }   /* the Hunter - and a roosting sister finishing what she was in (no new start: ready() asks isHunter) */
  stepSupport(S, dt, P, w);
  for (const r of ROLES) { const s = S.sis[r], t = s.alive && TELLS.has(s.mode); if (s.wasTell && !t) S.lastRel = S.clock; s.wasTell = t; }   /* (claude/rookery3) when the last blow landed: the stagger keeps the next one sep s off it */
  /* (claude/rookery4) THE PROOF (tools/rookery.mjs): never a blow from anyone but the Hunter; never a support move while the Hunter winds up or strikes */
  { const hs = S.sis[S.hunter]; for (const r of ROLES) { const q = S.sis[r]; if (q.alive && r !== S.hunter && ATTACK.has(q.mode)) { S.n.multi++; break; } }
    if (hs && hs.alive && ATTACK.has(hs.mode) && supportBusy(S)) S.n.overlap++; }
  S.snatchCd -= dt; if (!S.held) S.grabCd -= dt;
}
/* ---------- (claude/rookery4) THE TURN ---------- */
const ROOST_IDLE = new Set(['hover', 'fly', 'rise', 'perched', 'toRoost', 'wake']);
const HUNT_IDLE = new Set(['hover', 'fly', 'rise', 'perched', 'toRoost']);
export const supportBusy = S => (S.pebbles || []).length > 0 || ROLES.some(r => S.sis[r].alive && SUPPORT.has(S.sis[r].mode));
const turnLen = S => (SS.turn.t + (S.rnd() * 2 - 1) * SS.turn.jit) * Math.pow(SS.turn.k, Object.keys(S.dead).length);
function stepTurn(S, dt, P, w) {
  if (S.p2) { S.hunter = S.p2; S.hand = 0; return; }
  if (!alive(S).length) return;
  const h = S.sis[S.hunter];
  if (!h || !h.alive) { nextHunter(S, w); return; }
  if (h.mode === 'sleep' || h.mode === 'wake') return;
  if (S.hand > 0) { S.hand -= dt; if (S.hand <= 0) { S.hand = 0; h.cd = Math.min(Math.max(h.cd, 0.3), 0.9); } return; }
  S.turnT -= dt;
  if (sisOpen(h)) h.openedTurn = true;
  const idle = HUNT_IDLE.has(h.mode) && !S.held && !S.ride && !S.rocks.length && !supportBusy(S);
  if (idle && (h.openedTurn || S.turnT <= 0)) { if (h.openedTurn) S.n.turnsOpened++; nextHunter(S, w); }
}
function nextHunter(S, w) {
  const left = alive(S); if (!left.length) return; const i0 = ROLES.indexOf(S.hunter); let nx = null;
  for (let k = 1; k <= 3 && !nx; k++) { const r = ROLES[(i0 + k) % 3]; if (S.sis[r].alive) nx = r; }
  const old = S.sis[S.hunter]; if (old) { old.openedTurn = false; if (old.alive && (old.mode === 'hover' || old.mode === 'fly' || old.mode === 'rise')) { old.mode = 'toRoost'; old.roost = roostOf(S, old); } }
  S.hunter = nx; S.turnT = turnLen(S); S.hand = SS.turn.hand; S.handAt = S.clock; S.n.turns++; S.turnLog.push({ r: nx, at: Math.round(S.clock * 10) / 10 });
  const s = S.sis[nx]; s.openedTurn = false; s.cd = Math.max(s.cd, SS.turn.hand + 0.3);
  if (s.mode === 'perched' || s.mode === 'toRoost') { s.mode = nx === 'snatcher' ? 'fly' : nx === 'shrieker' ? 'rise' : 'hover'; s.modeT = 0.4; if (nx === 'snatcher') s.perchI = s.x > S.G.mid ? 1 : 0; }
  if (w) { w.number(S.G.mid, S.G.floorY - 112, HUNTS[nx], '#ffd36b'); w.sound('screech'); if (!S.told.roost) { S.told.roost = 1; w.number(S.G.mid, S.G.floorY - 98, SS_SAY.roost, '#ffd36b'); } }   /* (the main opening, said once: at the first hand-over) */
}
/* A ROOSTING SISTER: to her roost, then sit (her support move is started by stepSupport). Struck on her perch from her own roost: whole (takeBlow's close) */
function stepRoosting(S, s, dt, P, w) {
  if (s.mode === 'wake') { if (s.modeT <= 0) s.mode = 'toRoost'; return; }
  if (s.mode === 'rise' && s.modeT > 0) { fly(s, s.x, Math.min(s.y, S.G.floorY - 60), dt, 2.5); return; }
  const id = roostOf(S, s, P); s.roost = id; const R = id && roostById(S, id);
  if (!R) { s.mode = 'hover'; fly(s, clampX(S, S.G.mid + (s.role === 'snatcher' ? 140 : -140)), S.G.floorY - SS.hover[s.role] - 30, dt, 1.5); return; }
  const [tx, ty] = seatOf(S, R);
  if (s.mode !== 'perched') { s.mode = 'toRoost'; fly(s, tx, ty, dt, 3); if (Math.abs(s.x - tx) < 4 && Math.abs(s.y - ty) < 4) { s.mode = 'perched'; s.x = tx; s.y = ty; } }
  else { s.x += (tx - s.x) * Math.min(1, dt * 6); s.y += (ty - s.y) * Math.min(1, dt * 6); }
  if (P) s.face = Math.sign(P.x - s.x) || s.face;
}
/* THE ROOSTS: a hero standing on one beside the sister roosting there CORNERS her (once per SS.roost.again s); a high one tips him off after SS.ride.tip s */
function stepRoosts(S, dt, heroes, w) {
  for (const R of roostList(S)) {
    const on = heroes.find(h => h.alive && h.ground && Math.abs(h.x - R.x) < R.w / 2 + 6 && Math.abs(h.y - R.top) < 8);
    if (!on) { S.onT[R.id] = 0; if (R.id === 'perch') S.perchT = 0; continue; }
    S.onT[R.id] = (S.onT[R.id] || 0) + dt; if (R.id === 'perch') S.perchT = S.onT[R.id];
    const s = ROLES.map(r => S.sis[r]).find(q => q.alive && !S.p2 && q.mode === 'perched' && q.roost === R.id && q.ward <= 0 && !(q.cornerCd > 0));
    if (s) { const lm = S.landMul && S.landMul.id === R.id ? S.landMul : null; s.mode = 'startled'; s.modeT = SS.ride.startle; s.openT0 = s.modeT; s.purse = s.maxHp * (lm ? SS.roost.cap : SS.ride.cap); s.openMul = lm ? SS.roost.mul : SS.ride.mul; S.n.cornered++; if (lm) S.landMul = null;
      w.shake(4); w.sound('screech'); w.fx('open', s.x, s.y); w.number(s.x, s.y - 34, SS_SAY.cornered, '#ffd36b'); }
    if (R.high && S.onT[R.id] >= SS.ride.tip) { S.onT[R.id] = -9; if (R.id === 'perch') S.perchT = -9; S.n.tips++; if (w.tip) w.tip(on, { x: R.x, y: R.top, w: R.w }); w.number(R.x, R.top - 30, SS_SAY.tips, '#c8d8e8'); }
  }
  if (S.landMul && (S.landMul.t -= dt) <= 0) S.landMul = null;
}
/* CORNERED (any sister on her roost): she rears on it, open; then flees behind her ward and may not be cornered again for SS.roost.again s */
function stepStartled(S, s, dt, w) { const R = s.roost && roostById(S, s.roost); if (R) { const [tx, ty] = seatOf(S, R); s.x += (tx - s.x) * Math.min(1, dt * 6); s.y = ty; }
  if (s.modeT <= 0) { s.big = false; s.ward = SS.ward; s.cornerCd = SS.roost.again; s.mode = 'rise'; s.modeT = 1.0; s.cd = Math.max(s.cd, 1.4); w.fx('ward', s.x, s.y); w.number(s.x, s.y - 34, SS_SAY.ward, '#c8d8e8'); } }
/* ---------- (claude/rookery4) THE SUPPORT MOVES: one roosting sister at a time, never into the Hunter's windup or blow ---------- */
const supMark = S => S.marks.find(m => m.sup && m.t > 0) || null;
function stepSupport(S, dt, P, w) {
  if (S.p2 || !P || !P.alive) return; S.supCd -= dt;
  if (S.supCd > 0 || S.hand > 0 || S.held || S.ride || supportBusy(S)) return;
  const h = S.sis[S.hunter]; if (!h || !h.alive || !HUNT_IDLE.has(h.mode) || S.rocks.length) return;   /* (the Hunter between her moves: never mid-chain, mid-carry, low after a blow) */
  if (S.clock - S.tLast < SS.tempo.gap[S.tCls || 'light'] || S.clock - (S.lastRel ?? -99) < SS.tempo.sep) return;
  const cand = ROLES.filter(r => r !== S.hunter && S.sis[r].alive && S.sis[r].mode === 'perched' && S.sis[r].ward <= 0); if (!cand.length) return;
  for (let k = 0; k < ROLES.length; k++) { const r = ROLES[(S.supI + k) % ROLES.length]; if (!cand.includes(r)) continue; const s = S.sis[r];
    if (r === 'snatcher' && !gustReach(S, s, P)) continue;
    if (r === 'shrieker' && (supMark(S) || h.role === 'shrieker')) continue;
    S.supI = (ROLES.indexOf(r) + 1) % ROLES.length; S.supCd = SS.support.cd * Math.pow(SS.support.k, Object.keys(S.dead).length); startSupport(S, s, P, w); return; }
}
/* she swoops down off her nest toward you - at most SS.gust.out px from it - and beats from there, low (a blow in the tell breaks it) */ function gustLow(S, s, P) { const R = s.roost && roostById(S, s.roost), x = R ? R.x : s.x, d = P ? Math.sign(P.x - x) || 1 : (x < S.G.mid ? 1 : -1), want = P ? P.x - d * 70 : x + d * 28; return [clampX(S, x + Math.max(-SS.gust.out, Math.min(SS.gust.out, want - x)), 20), S.G.floorY - SS.gust.low]; }
function gustReach(S, s, P) { const [gx] = gustLow(S, s, P); return Math.abs(P.x - gx) < GALE.len - 10; }
function startSupport(S, s, P, w) {
  s.act = ++S.act; s.openT0 = 0.01;
  if (s.role === 'diver') { s.mode = 'pebbleTell'; s.modeT = SS.pebble.tell; const m = supMark(S); s.pbX = clampX(S, m ? m.x : P.x, 12); S.n.supports.pebble++; w.mark(s, '!!'); w.sound('pebbleTell'); if (!S.told.pebble) { S.told.pebble = 1; w.number(s.pbX, S.G.floorY - 48, SS_SAY.pebble, '#ff6b6b'); } }
  else if (s.role === 'shrieker') { s.mode = 'markTell'; s.modeT = SS.smark.tell; S.n.supports.mark++; w.mark(s, '!!'); w.sound('screamTell'); }
  else { const [gx, gy] = gustLow(S, s, P); s.gX = gx; s.gY = gy; s.mode = 'gustTell'; s.modeT = SS.gust.tell; s.face = Math.sign(P.x - gx) || (gx < S.G.mid ? 1 : -1); s.gustHit = false; S.n.supports.gust++; w.mark(s, '!'); w.sound('gustTell'); if (!S.told.gust) { S.told.gust = 1; w.number(gx, S.G.floorY - 60, SS_SAY.gust, '#ffd36b'); } }
  s.openT0 = s.modeT; told(S, s, 'medium', w);
}
function stepSupportMove(S, s, dt, P, w, heroes) {
  const G = S.G;
  if (s.mode === 'pebbleTell') { if (P) s.face = Math.sign(s.pbX - s.x) || s.face; if (s.modeT <= 0) { s.mode = 'pebble'; s.modeT = 0.3; S.pebbles.push({ x0: s.x, y0: s.y - 4, tx: s.pbX, t: 0, T: SS.pebble.T, key: 'pb' + s.act }); w.sound('pebble'); } return; }
  if (s.mode === 'pebble') { if (s.modeT <= 0) s.mode = 'perched'; return; }
  if (s.mode === 'markTell') { if (P) s.face = Math.sign(P.x - s.x) || s.face; if (s.modeT <= 0) { const m = { x: clampX(S, P ? P.x : G.mid), t: SS.smark.life, T: SS.smark.life, sup: true }; S.marks.push(m); w.sound('scream'); if (!S.told.smark) { S.told.smark = 1; w.number(m.x, G.floorY - 60, SS_SAY.smark, '#ff6b6b'); w.number(m.x, G.floorY - 46, SS_SAY.ffTurn, '#8fd160'); } s.mode = 'perched'; } return; }
  if (s.mode === 'gustTell') { fly(s, s.gX, s.gY, dt, 5);
    if (s.gustBroken) { s.gustBroken = false; s.mode = 'downed'; s.modeT = SS.gust.broken; s.openT0 = s.modeT; s.y = G.floorY - 4; S.n.gustBroken++; S.n.downs++; w.number(s.x, s.y - 30, SS_SAY.gustBroken, '#8fd160'); w.sound('free'); return; }
    if (s.modeT <= 0) { s.mode = 'gust'; s.modeT = SS.gust.T; s.hitKey = 'gu' + s.act; w.sound('gust'); } return; }
  if (s.mode === 'gust') { const e = { x: s.x, y: s.y, face: s.face };
    for (const h of heroes) if (h.alive && GHinCone(e, h.x, h.y - 10) && w.gust) { const r = w.gust(s, h, s.face, s.hitKey); if (r === 'braced') S.n.braced++; }
    if (s.modeT <= 0) { s.mode = 'toRoost'; } return; }
}
/* the pebbles in the air: an arc from her roost to the ring; where it lands it hurts (off the ring) */
function stepPebbles(S, dt, heroes, w) {
  for (const p of S.pebbles) { p.t += dt; if (p.t < p.T || p.done) continue; p.done = true; const fy = S.G.floorY; w.dust(p.tx, fy, 5); w.sound('rockLand');
    w.hitArea([p.tx - SS.pebble.r, p.tx + SS.pebble.r, fy - 26, fy + 2], SS.pebble.dmg, 'pebble', p.key); }
  S.pebbles = S.pebbles.filter(p => !p.done);
}
export const pebbleAt = (p, floorY) => { const k = Math.min(1, p.t / p.T); return { x: p.x0 + (p.tx - p.x0) * k, y: p.y0 + (floorY - p.y0) * k - SS.pebble.arc * 4 * k * (1 - k), k }; };
const fly = (s, tx, ty, dt, k = 3) => { s.x += (tx - s.x) * Math.min(1, dt * k); s.y += (ty - s.y) * Math.min(1, dt * k); };
const clampX = (S, x, m = 16) => Math.max(S.G.x0 + m, Math.min(S.G.x1 - m, x));
const ready = (S, s, P) => s.cd <= 0 && P && P.alive && s.ward <= 0 && !S.held && mayStart(S, s);   /* (claude/rookery4: only the Hunter starts a blow) */   /* (claude/rookery3: the stagger is asked with the move chosen - teamClear(S, s, its windup)) */
/* A DIVE: aim (the red line follows you, then LOCKS), then straight down the line; what it meets breaks */
function aimAt(S, s, P, w, mark, pair) {
  s.mode = 'diveTell'; s.modeT = mark ? SS.dive.markTell : s.chain ? SS.chain.aim : pair ? SS.dive.second : SS.dive.tell[ph(S)]; s.pair = !!pair; s.openT0 = s.modeT; s.aim = mark ? { x: mark.x, y: S.G.floorY, lock: true, mark: true } : { x: P ? P.x : s.x, y: S.G.floorY, lock: false };
  if (s.chain) s.aim.n = s.chain.i + 1, s.aim.of = s.chain.n;
  s.act = ++S.act; w.mark(s, '!!'); w.sound('screech');
  told(S, s, mark || s.chain ? 'heavy' : pair ? 'light' : 'medium', w, !(mark || s.chain || pair));   /* (claude/rookery3) */
}
/* CHAIN STOOP (the diver's own): she climbs and screams, then dives SS.chain.n back to back */
function startChain(S, s, P, w) {
  s.chain = { n: SS.chain.n[ph(S)], i: 0, hit: 0 }; s.mode = 'chainTell'; s.modeT = SS.chain.tell; s.openT0 = s.modeT; s.act = ++S.act; S.n.chains++;
  w.mark(s, '!!'); w.sound('chainTell'); told(S, s, 'heavy', w); if (!S.told.chain) { S.told.chain = 1; w.number(s.x, s.y - 40, SS_SAY.chain, '#ff6b6b'); }
}
function stuckOpen(S, s, w, big) {
  s.mode = 'stuck'; s.modeT = big ? SS.chain.stun : SS.stun.t; s.openT0 = s.modeT; s.purse = s.maxHp * (big ? SS.chain.cap : SS.stun.cap); s.big = !!big; s.openMul = SS.stun.mul; s.crash = false; S.n.stuns++; if (big) S.n.exhausted++;
  if (s.aim && s.aim.mark) S.n.marksStruck++;
  w.shake(big ? 8 : 6); w.sound('smash'); w.fx('open', s.x, s.y); w.number(s.x, s.y - 34, big ? SS_SAY.exhausted : SS_SAY.stunned, '#ffd36b');
}
function stepDive(S, s, dt, P, w) {
  if (s.mode === 'chainTell') { fly(s, clampX(S, P ? P.x - s.side * 40 : s.x), S.G.floorY - SS.hover[s.role] - SS.chain.rise, dt, 2.5); if (P) s.face = Math.sign(P.x - s.x) || s.face;
    if (s.modeT <= 0) { if (P && P.alive) aimAt(S, s, P, w); else { s.chain = null; s.mode = 'rise'; s.modeT = SS.dive.rise; } } return true; }
  if (s.mode === 'diveTell') { if (!s.aim.lock) { if (P) s.aim.x = clampX(S, P.x); if (s.modeT <= SS.dive.lock) { s.aim.lock = true; w.sound('lock'); } }
    if (s.aim.mark && s.aim.lock && !s.aim.ff) turnMark(S, s, w);   /* (claude/rookery4) FRIENDLY FIRE: braced on the mark as her line locks */
    if (s.aim.ff) { const q = S.sis[s.aim.ff]; if (q && q.alive) { s.aim.x = q.x; s.aim.y = q.y; } }
    s.face = Math.sign(s.aim.x - s.x) || s.face; s.y += (S.G.floorY - SS.hover[s.role] - 14 - s.y) * Math.min(1, dt * 2);
    if (s.modeT <= 0) { s.mode = 'dive'; const ty = s.aim.ff ? s.aim.y : S.G.floorY - 4, d = Math.hypot(s.aim.x - s.x, ty - 6 - s.y) || 1; s.dv = { fx: s.x, fy: s.y, tx: s.aim.x, ty, t: 0, T: Math.max(0.15, d / SS.dive.v), ff: s.aim.ff || null }; s.hitKey = 'dv' + s.act; S.n.dives++; w.sound('dive'); }
    return true; }
  if (s.mode === 'dive') { const v = s.dv; v.t += dt; const k = Math.min(1, v.t / v.T); s.x = v.fx + (v.tx - v.fx) * k; s.y = v.fy + (v.ty - v.fy) * k;
    const res = w.hit(s, [s.x - 11, s.x + 11, s.y - 16, s.y + 2], s.chain ? SS.chain.dmg : s.pair ? SS.dive.pairDmg : SS.dive.dmg, 'dive', { key: s.hitKey, blockable: true });   /* (claude/rookery3) heavy 24 / medium 20 / light 12 */
    if (res === 'blocked') { s.chain = null; s.mode = 'downed'; s.modeT = SS.dive.downed; s.openT0 = s.modeT; s.y = S.G.floorY; S.n.downs++; w.number(s.x, s.y - 30, SS_SAY.downed, '#8fd160'); return true; }
    if (k >= 1 && v.ff) { friendlyFire(S, s, v.ff, w); return true; }   /* (claude/rookery4) */
    if (k >= 1) { let c = crackAt(S, v.tx); s.y = S.G.floorY; if (c) breakCrack(S, c, w);
      if (c && (c.kind === 'arm' || c.kind === 'over')) { w.rubble(v.tx); c = null; }   /* (claude/rookery4) a nest's arm or the overhang's foot: it breaks - she skids off it (the sister on the nest is the one who falls) */
      const ch = s.chain; s.pair = false;
      if (ch) { ch.i++; if (c) ch.hit++; S.n.chainDives++;
        if (ch.i < ch.n) { s.mode = 'jar'; s.modeT = c ? SS.chain.jar : SS.chain.jar * 0.6;   /* (a dive of the chain: she is jarred a beat - low, whole - and goes again) */
          if (c) { S.n.bursts++; w.shake(4); w.sound('smash'); w.rubble(v.tx); if (!S.told.burst) { S.told.burst = 1; w.number(s.x, s.y - 34, SS_SAY.burst, '#c8d8e8'); } } else { w.dust(s.x, S.G.floorY, 6); w.sound('skid'); }
          return true; }
        s.chain = null;
        if (c) { stuckOpen(S, s, w, ch.hit === ch.n); w.rubble(v.tx); return true; } }
      if (c) { stuckOpen(S, s, w, false); w.rubble(v.tx); }
      else { s.mode = 'land'; S.n.skids++; w.dust(s.x, S.G.floorY, 8); w.sound('skid'); if (!S.told.skid) { S.told.skid = 1; w.number(s.x, s.y - 30, SS_SAY.skid, '#c8d8e8'); }
        s.rakeNext = !ch && s.role === 'diver' && isHunter(S, s) && !s.raked && !!P && P.alive && S.rnd() < SS.rake.chance[ph(S)]; s.modeT = s.rakeNext ? SS.rake.pre : ch ? SS.chain.spent : SS.dive.land; } }   /* (claude/rookery3) a spent chain: no rake, a long recovery */
    return true; }
  if (s.mode === 'jar') { if (s.modeT <= 0) { if (P && P.alive && s.chain) aimAt(S, s, P, w); else { s.chain = null; s.mode = 'rise'; s.modeT = SS.dive.rise; s.cd = SS.dive.cd[ph(S)] * cdK(S); } } return true; }
  if (s.mode === 'stuck') { if (s.modeT <= 0) { s.mode = 'tear'; s.modeT = 0.45; s.big = false; w.sound('screech'); } return true; }
  if (s.mode === 'tear') { if (s.modeT <= 0) { s.ward = SS.ward; s.mode = 'rise'; s.modeT = SS.dive.rise; s.cd = SS.dive.cd[ph(S)] * cdK(S); w.fx('ward', s.x, s.y); w.number(s.x, s.y - 34, SS_SAY.ward, '#c8d8e8'); } return true; }
  /* TALON RAKE (the diver's own): a missed dive - she plants her talons and rakes along the floor at you */
  if (s.mode === 'rakeTell') { s.y = S.G.floorY; if (s.modeT <= 0) { s.mode = 'rake'; s.modeT = SS.rake.T; s.hitKey = 'rk' + s.act + 'r'; S.n.rakes++; w.sound('rake'); } return true; }
  if (s.mode === 'rake') { s.x = clampX(S, s.x + s.rDir * SS.rake.v * dt, 18); s.y = S.G.floorY; if (Math.random() < dt * 30) w.dust(s.x - s.rDir * 8, S.G.floorY, 1);
    const res = w.hit(s, [s.x - 12, s.x + 12, S.G.floorY - SS.rake.h, S.G.floorY + 2], SS.rake.dmg, 'rake', { key: s.hitKey, blockable: true });
    if (res === 'blocked') { s.mode = 'downed'; s.modeT = SS.dive.downed; s.openT0 = s.modeT; S.n.downs++; S.n.rakeDowns++; w.number(s.x, s.y - 30, SS_SAY.downed, '#8fd160'); return true; }
    if (s.modeT <= 0 || s.x <= S.G.x0 + 18.5 || s.x >= S.G.x1 - 18.5) { s.mode = 'land'; s.modeT = SS.rake.end; } return true; }
  if (s.mode === 'land' || s.mode === 'downed') { if (s.modeT <= 0) {
      if (s.mode === 'land' && s.rakeNext && P && P.alive && !teamClear(S, s, SS.rake.tell) && (s.rakeWait = (s.rakeWait || 0) + 0.05) < 0.6) { s.modeT = 0.05; S.n.held++; return true; }   /* (claude/rookery3) the stagger: planted, she waits her turn (then gives the rake up) */
      if (s.mode === 'land' && s.rakeNext && P && P.alive && teamClear(S, s, SS.rake.tell)) { s.rakeWait = 0; s.rakeNext = false; s.raked = true; s.mode = 'rakeTell'; s.modeT = SS.rake.tell; s.openT0 = s.modeT; s.rDir = Math.sign(P.x - s.x) || s.face; s.face = s.rDir; s.act = ++S.act;
        w.mark(s, '!'); w.sound('rakeTell'); told(S, s, 'light', w); if (!S.told.rake) { S.told.rake = 1; w.number(s.x, s.y - 34, SS_SAY.rake, '#ffd36b'); } return true; }
      s.rakeNext = false; s.rakeWait = 0;
      if (s.role === 'diver' && S.dead.shrieker && !s.second && P && isHunter(S, s)) { s.second = true; aimAt(S, s, P, w, null, true); s.openT0 = s.modeT; return true; }   /* (claude/rookery3: LIGHT) */   /* THE PAIR (the shrieker gone) */
      if (s.role === 'shrieker' && s.mode === 'land' && S.dead.snatcher && !S.p2 && !s.waved && P && isHunter(S, s) && teamClear(S, s, SS.wave.tell)) { s.waved = true; s.mode = 'waveTell'; s.modeT = SS.wave.tell; s.face = Math.sign(P.x - s.x) || 1; s.act = ++S.act; w.mark(s, '!'); w.sound('inhale'); told(S, s, 'medium', w); w.number(s.x, s.y - 30, SS_SAY.wave, '#ffd36b'); return true; }   /* (claude/rookery4) the snatcher gone: THE SHRIEK WAVE off her mark dive's landing */
      s.second = false; s.raked = false;
      if (s.mode === 'downed' && canFerry(S, s)) { s.mode = 'ferryWait'; s.modeT = SS.ride.window; s.openT0 = s.modeT; if (!S.told.ride) { S.told.ride = 1; w.number(s.x, s.y - 40, SS_SAY.ride, '#ffd36b'); } return true; }
      s.mode = 'rise'; s.modeT = SS.dive.rise; s.cd = SS.dive.cd[ph(S)] * cdK(S); } return true; }
  return false;
}
/* ---------- (claude/rookery2) THE RIDE TO THE PERCH (P1) ---------- */
const canFerry = (S, s) => !!S.G.perchS && !S.p2 && s.role !== 'shrieker' && S.sis.shrieker.alive && !S.held && !S.ride;
/* a hero asks to grab (UP / GRAB): a sister in her ferry window within reach takes him - true when she has him */
export function tryRide(S, h) {
  if (!S || S.ride || S.held || !h) return false;
  for (const r of ROLES) { const s = S.sis[r]; if (!s.alive || s.mode !== 'ferryWait' || !canFerry(S, s)) continue;
    if (Math.abs(h.x - s.x) < SS.ride.reach && h.y - s.y > -16 && h.y - s.y < 44) { const G = S.G, P0 = G.perchS, tx = P0.x - P0.w / 2 + 10, ty = P0.y - 6 - SS.ride.hang;
      const pts = [[s.x, s.y], [s.x + (tx - s.x) * 0.35, Math.min(s.y, ty) - 18], [tx, ty]], len = Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]) + Math.hypot(pts[2][0] - pts[1][0], pts[2][1] - pts[1][1]);
      S.ride = { pp: h.pp, by: r, t: 0, T: Math.max(SS.ride.minT, len / SS.ride.v), pts }; s.mode = 'ferry'; s.modeT = S.ride.T + 0.2; S.n.rides++; return true; } }
  return false;
}
const along = (pts, k) => { const a = Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]), b = Math.hypot(pts[2][0] - pts[1][0], pts[2][1] - pts[1][1]), t = k * (a + b);
  if (t <= a) { const q = a ? t / a : 1; return [pts[0][0] + (pts[1][0] - pts[0][0]) * q, pts[0][1] + (pts[1][1] - pts[0][1]) * q]; } const q = b ? (t - a) / b : 1; return [pts[1][0] + (pts[2][0] - pts[1][0]) * q, pts[1][1] + (pts[2][1] - pts[1][1]) * q]; };
function stepFerry(S, s, dt, P, w) {
  if (s.mode === 'ferryWait') { s.y -= SS.ride.rise * dt; s.face = P ? Math.sign(P.x - s.x) || s.face : s.face; if (s.modeT <= 0) { s.mode = 'rise'; s.modeT = SS.dive.rise; s.cd = (SS.dive.cd[ph(S)] || 2) * cdK(S); } return true; }
  if (s.mode !== 'ferry') return false;
  const R = S.ride; if (!R || R.by !== s.role) { s.mode = 'rise'; s.modeT = SS.dive.rise; return true; }
  R.t += dt; const k = Math.min(1, R.t / R.T), [x, y] = along(R.pts, k); s.face = Math.sign(x - s.x) || s.face; s.x = x; s.y = y;
  if (k >= 1) { R.done = true; S.n.ferries++; s.mode = 'rise'; s.modeT = SS.dive.rise; s.cd = 1.2; w.number(s.x, s.y - 24, SS_SAY.ferry, '#c8d8e8'); }
  return true;
}
/* (THE PERCH's corner is every roost's now: stepRoosts) */
/* ---------- (claude/rookery4) FRIENDLY FIRE: the Hunter's line has LOCKED on a mark and a hero stands BRACED on it (block / crouch) - the mark is turned onto the nearest roosting
   sister: the dive goes to HER. When it lands she crashes STUNNED (x SS.ff.mul, up to SS.ff.cap) and the Hunter is KNOCKED DOWN under her ---------- */
function turnMark(S, s, w) {
  const h = (S._heroes || []).find(q => q.alive && q.block && q.ground && Math.abs(q.x - s.aim.x) < 18); if (!h) return;
  const q = ROLES.map(r => S.sis[r]).filter(z => z.alive && z !== s && !isHunter(S, z) && (z.mode === 'perched' || z.mode === 'toRoost')).sort((a, b) => Math.abs(a.x - h.x) - Math.abs(b.x - h.x))[0]; if (!q) return;
  s.aim.ff = q.role; s.aim.x = q.x; s.aim.y = q.y; S.n.ffTurned++; S.marks = S.marks.filter(m => Math.abs(m.x - h.x) > 18);
  w.number(h.x, S.G.floorY - 56, SS_SAY.ffTurn, '#8fd160'); w.sound('lock');
}
function friendlyFire(S, s, role, w) {
  const q = S.sis[role]; s.chain = null; s.y = S.G.floorY; s.mode = 'downed'; s.modeT = SS.grab.free; s.openT0 = s.modeT; S.n.downs++;
  if (q && q.alive && !sisOpen(q)) { q.mode = 'stuck'; q.modeT = SS.ff.stun; q.openT0 = q.modeT; q.x = clampX(S, q.x, 18); q.y = S.G.floorY; q.purse = q.maxHp * SS.ff.cap; q.openMul = SS.ff.mul; q.big = false; q.crash = true; S.n.ff++; S.n.stuns++;
    w.fx('open', q.x, q.y); w.number(q.x, q.y - 40, SS_SAY.ff, '#ffd36b'); }
  w.shake(7); w.sound('smash'); w.number(s.x, s.y - 30, SS_SAY.downed, '#8fd160');
}
/* ---------- (claude/rookery2) PHASE 2: THE SURVIVOR ---------- */
function stepSurvivor(S, s, dt, P, w, heroes) {
  const G = S.G;
  if (s.mode === 'grow') { fly(s, clampX(S, G.mid), G.floorY - SS.p2.hover, dt, 2); if (s.modeT <= 0) { s.mode = 'hover'; s.cd = 1.0; } return; }
  if (stepDive(S, s, dt, P, w)) return;
  if (stepGrab(S, s, dt, P, w, heroes)) return;
  if (shriekMoves(S, s, dt, P, w)) return;
  if (rockMoves(S, s, dt, P, w)) return;
  if (s.mode === 'rise') { fly(s, clampX(S, P ? P.x - s.side * 60 : G.mid), G.floorY - SS.p2.hover, dt, 2.5); if (s.modeT <= 0) s.mode = 'hover'; return; }
  s.mode = 'hover'; fly(s, clampX(S, (P ? P.x : G.mid) - s.side * 50 + Math.sin(S.act * 1.3) * 24), G.floorY - SS.p2.hover + Math.sin(s.cd * 3) * 4, dt, 1.6);
  if (!ready(S, s, P) || !teamClear(S, s)) return;
  const kit = P2KIT[s.role]; let mv = kit[(s.p2i || 0) % kit.length]; s.p2i = (s.p2i || 0) + 1;
  if (mv === 'grab' && (S.grabCd > 0 || !P.ground)) { mv = kit[s.p2i % kit.length]; s.p2i++; }
  S.n.p2Moves[mv] = (S.n.p2Moves[mv] || 0) + 1;
  if (mv === 'dive') aimAt(S, s, P, w);
  else if (mv === 'chain') startChain(S, s, P, w);
  else if (mv === 'shock') startShock(S, s, P, w);
  else if (mv === 'echo') startEcho(S, s, P, w);
  else if (mv === 'mark') { s.mode = 'screamTell'; s.modeT = SS.scream.tell; s.openT0 = s.modeT; s.act = ++S.act; w.mark(s, '!!'); w.sound('screamTell'); told(S, s, 'heavy', w); }
  else if (mv === 'boulder') { s.mode = 'fly'; s.rockGo = true; s.perchI = P && P.x > G.mid ? 0 : 1; }
  else if (mv === 'grab') { if (!tryGrab(S, s, P, w)) aimAt(S, s, P, w); else { S.n.p2Grabs++; if (!S.told.snatchP2) { S.told.snatchP2 = 1; w.number(P.x, G.floorY - 80, SS_SAY.snatchP2, '#ff6b6b'); } } }
  s.cd = Math.max(s.cd, 0);
}
function stepDiver(S, s, dt, P, w) {
  if (s.mode === 'wake') { if (s.modeT <= 0) { s.mode = 'hover'; } return; }
  if (stepDive(S, s, dt, P, w)) return;
  if (s.mode === 'rise') { fly(s, clampX(S, P ? P.x - s.side * 60 : s.x), S.G.floorY - SS.hover.diver, dt, 2.5); if (s.modeT <= 0) s.mode = 'hover'; return; }
  if (trySnatch(S, s, P, w)) return;
  if (s.mode === 'snatchTell' || s.mode === 'snatch') return stepSnatch(S, s, dt, P, w);
  /* hover: over you and a little to one side; dive when ready - every SS.chain.every-th time (every other, once a sister has fallen) a CHAIN STOOP */
  s.mode = 'hover'; fly(s, clampX(S, (P ? P.x : S.G.mid) - s.side * 50 + Math.sin(S.act * 1.7) * 20), S.G.floorY - SS.hover.diver + Math.sin(s.cd * 3) * 4, dt, 1.6);
  if (ready(S, s, P)) { const ch = (s.nAtk + 1) % SS.chain.every[ph(S)] === 0; if (!teamClear(S, s, ch ? SS.chain.tell : SS.dive.tell[ph(S)])) return; s.nAtk++; const sm = supMark(S); if (ch) startChain(S, s, P, w); else aimAt(S, s, P, w, sm && !sm.used ? sm : null); if (sm && !ch) sm.used = true; }   /* (claude/rookery4) a sister's MARK on the floor: the Diver's next dive goes to it */
}
function stepShrieker(S, s, dt, P, w) {
  if (s.mode === 'wake') { if (s.modeT <= 0) s.mode = 'hover'; return; }
  if (stepDive(S, s, dt, P, w)) return;   /* (the diver gone: she dives at her own mark) */
  /* (claude/rookery4: CORNERED on her perch is every roost's now - stepStartled) */
  if (shriekMoves(S, s, dt, P, w)) return;
  if (s.mode === 'rise') { const home = perchHome(S); fly(s, home ? home[0] : clampX(S, S.G.mid - s.side * 90), home ? home[1] : S.G.floorY - SS.hover.shrieker, dt, 2.2); if (s.modeT <= 0) s.mode = home ? 'perched' : 'hover'; return; }
  if (trySnatch(S, s, P, w)) return;
  if (s.mode === 'snatchTell' || s.mode === 'snatch') return stepSnatch(S, s, dt, P, w);
  /* (claude/rookery2) PERCHED: between her moves she sits on her nest (P1) - a hero who rides up beside her corners her. With a hero on it she hangs off it instead */
  const home = perchHome(S);
  if (home) { s.mode = 'perched'; fly(s, home[0], home[1], dt, 3); s.face = P ? Math.sign(P.x - s.x) || s.face : s.face; }
  else { s.mode = 'hover'; fly(s, clampX(S, S.G.mid + Math.sin(S.act * 0.9 + s.cd) * 120), S.G.floorY - SS.hover.shrieker + Math.sin(s.cd * 2) * 6, dt, 1.2); }
  if (ready(S, s, P)) { const rot = ROT[ph(S)], mv = S.dead.diver && s.rot % 2 === 0 ? 'mark' : rot[s.rot % rot.length]; if (!teamClear(S, s, mv === 'shock' ? SS.shock.tell : mv === 'echo' ? SS.echo.tell : SS.scream.tell)) return; s.rot++;
    if (mv === 'shock') startShock(S, s, P, w); else if (mv === 'echo') startEcho(S, s, P, w);
    else { s.mode = 'screamTell'; s.modeT = SS.scream.tell; s.openT0 = s.modeT; s.act = ++S.act; w.mark(s, '!!'); w.sound('screamTell'); told(S, s, 'heavy', w); } }
}
/* her nest is home while nobody stands on it (P1; a ride lands a hero there) */
const perchHome = S => { const P0 = S.G.perchS; if (!P0 || S.p2 || S.perchT > 0) return null; return [P0.x + P0.w / 2 - 6, P0.y - 2]; };
/* THE SHRIEKER'S MOVES (her scream and its swoop, the wave, SHOCK SHRIEK, CRACKING ECHO) - true = handled; a P2 survivor who took them runs them here too */
function shriekMoves(S, s, dt, P, w) {
  if (s.mode === 'screamTell') { s.face = P ? Math.sign(P.x - s.x) || s.face : s.face; if (s.modeT <= 0) scream(S, s, P, w); return true; }
  if (s.mode === 'swoop') { const tx = clampX(S, (P ? P.x : S.G.mid) + s.side * 46); fly(s, tx, S.G.floorY - SS.scream.low, dt, 3);
    if (S.dead.snatcher && !S.p2 && !s.waved && s.modeT < SS.scream.swoop - 0.5 && P) { s.waved = true; s.mode = 'waveTell'; s.modeT = SS.wave.tell; s.face = Math.sign(P.x - s.x) || 1; s.act = ++S.act; w.mark(s, '!'); w.sound('inhale'); told(S, s, 'medium', w, false); w.number(s.x, s.y - 30, SS_SAY.wave, '#ffd36b'); return true; }
    if (s.modeT <= 0) { s.mode = 'rise'; s.modeT = 1.0; s.cd = SS.scream.cd[ph(S)] * cdK(S); } return true; }
  if (s.mode === 'waveTell') { if (s.modeT <= 0) { s.mode = 'wave'; s.modeT = 0.4; S.waves.push({ x: s.x + s.face * 14, dir: s.face, life: SS.wave.life, key: 'wv' + s.act }); S.n.waves++; w.sound('shriek'); } return true; }
  if (s.mode === 'wave') { if (s.modeT <= 0) { s.mode = 'rise'; s.modeT = 1.0; s.cd = SS.scream.cd[ph(S)] * cdK(S); } return true; }
  /* SHOCK SHRIEK (her own): low on the middle side of you, the cone along the floor, then the shove toward the edge */
  if (s.mode === 'shockTell') { if (P) { s.shX = clampX(S, P.x + s.shSide * SS.shock.gap, 20); s.face = Math.sign(P.x - s.x) || s.face; } fly(s, s.shX, S.G.floorY - SS.hover.shrieker + 40, dt, 4);   /* (claude/rookery4) from the high tier: the cone comes down along the floor */
    if (s.modeT <= 0) { s.mode = 'shock'; s.modeT = SS.shock.T; S.n.shocks++; w.sound('shock'); w.shake(3);
      for (const h of S._heroes || []) { if (!h.alive) continue; const dx = (h.x - s.x) * s.face; if (dx > -6 && dx < SS.shock.range && S.G.floorY - h.y < SS.shock.h) { const r = w.shove ? w.shove(s, h, s.face, 'sh' + s.act) : null; if (r === 'hit') S.n.shoved++; else if (r === 'blocked') S.n.braced++; } } }
    return true; }
  if (s.mode === 'shock') { if (s.modeT <= 0) { s.mode = 'rise'; s.modeT = 1.0; s.cd = SS.scream.cd[ph(S)] * sigK(S); } return true; }
  /* CRACKING ECHO (her own): a scream at the floor ahead of you - the tile shivers, then cracks (shards off it) and lies as cracked rock */
  if (s.mode === 'echoTell') { fly(s, clampX(S, s.echoX - s.face * 34), S.G.floorY - SS.hover.shrieker + 40, dt, 3); s.face = Math.sign(s.echoX - s.x) || s.face;
    if (s.modeT <= 0) { s.mode = 'echo'; s.modeT = SS.echo.T; const x = s.echoX, fy = S.G.floorY; S.n.echoes++; w.sound('echo'); w.shake(2); w.rubble(x);
      w.hitArea([x - SS.echo.w / 2 - 2, x + SS.echo.w / 2 + 2, fy - 24, fy + 2], SS.echo.dmg, 'echo', 'ec' + s.act);
      if (!crackAt(S, x)) S.echoes.push({ x, t: SS.echo.life }); if (!S.told.echoCrack) { S.told.echoCrack = 1; w.number(x, fy - 40, SS_SAY.echoCrack, '#ffd36b'); } }
    return true; }
  if (s.mode === 'echo') { if (s.modeT <= 0) { s.echoX = null; s.mode = 'rise'; s.modeT = 0.8; s.cd = SS.scream.cd[ph(S)] * sigK(S) * 0.8; } return true; }
  return false;
}
function startShock(S, s, P, w) {
  s.shSide = P.x < S.G.mid ? 1 : -1; s.shX = clampX(S, P.x + s.shSide * SS.shock.gap, 20); s.mode = 'shockTell'; s.modeT = SS.shock.tell; s.openT0 = s.modeT; s.act = ++S.act; s.face = -s.shSide;
  w.mark(s, '!'); w.sound('shockTell'); told(S, s, 'medium', w); if (!S.told.shock) { S.told.shock = 1; w.number(s.x, s.y - 40, SS_SAY.shock, '#ffd36b'); }
}
function startEcho(S, s, P, w) {
  const G = S.G, d0 = P.face || (P.x < G.mid ? 1 : -1); let x = null;
  for (const d of [d0, -d0]) for (const k of [1, 1.6, 0.7]) { const q = Math.max(G.x0 + 26, Math.min(G.x1 - 26, P.x + d * SS.echo.ahead * k)); if (x === null && !crackAt(S, q) && !G.slabs.some(sl => Math.abs(sl.x - q) < SS.slab.w / 2 + 12) && !S.echoes.some(e => Math.abs(e.x - q) < 30)) x = q; }
  if (x === null) x = Math.max(G.x0 + 26, Math.min(G.x1 - 26, P.x + d0 * SS.echo.ahead));
  s.echoX = x; s.mode = 'echoTell'; s.modeT = SS.echo.tell; s.openT0 = s.modeT; s.act = ++S.act; s.face = Math.sign(x - s.x) || s.face;
  w.mark(s, '!!'); w.sound('echoTell'); told(S, s, 'light', w); if (!S.told.echo) { S.told.echo = 1; w.number(x, G.floorY - 50, SS_SAY.echo, '#ff6b6b'); }
}
/* THE SCREAM: the mark snaps onto your spot; her sisters strike it */
function scream(S, s, P, w) {
  const m = { x: clampX(S, P ? P.x : S.G.mid), t: SS.scream.mark, T: SS.scream.mark }; S.marks.push(m); S.n.screams++; w.sound('scream'); w.shake(3);
  if (!S.told.mark) { S.told.mark = 1; w.number(m.x, S.G.floorY - 60, SS_SAY.mark, '#ff6b6b'); }
  /* (claude/rookery4) ONE HUNTER: she dives at her own mark - her stoop is the only time she comes low (no sister strikes it for her any more) */
  s.waved = false; aimAt(S, s, P, w, m); s.side = -s.side;
}
function stepSnatcher(S, s, dt, P, w, heroes) {
  const G = S.G;
  if (s.mode === 'wake') { if (s.modeT <= 0) { s.mode = 'fly'; s.perchI = s.x > G.mid ? 1 : 0; } return; }
  if (stepDive(S, s, dt, P, w)) return;
  if (stepGrab(S, s, dt, P, w, heroes)) return;
  if (s.mode === 'rise') { fly(s, s.x, G.floorY - SS.hover.snatcher, dt, 2.5); if (s.modeT <= 0) { s.mode = 'fly'; s.perchI = P && P.x > G.mid ? 0 : 1; } return; }
  if (trySnatch(S, s, P, w)) return;
  if (s.mode === 'snatchTell' || s.mode === 'snatch') return stepSnatch(S, s, dt, P, w);
  if (s.mode === 'fly' && tryGrab(S, s, P, w)) return;
  if (rockMoves(S, s, dt, P, w)) return;
  s.mode = 'fly';
}
/* THE BOULDER DROP's legs (fly to a shelf, pick, carry, the drop's tell, the drop) - true = handled; a P2 survivor who took it runs it here too (s.rockGo) */
function rockMoves(S, s, dt, P, w) {
  const G = S.G; if (s.mode === 'fly' && s.role !== 'snatcher' && !s.rockGo) return false;
  if (s.mode === 'fly' && !mayStart(S, s)) return false;   /* (claude/rookery4: her turn run out - no new boulder) */
  if (s.mode === 'fly') { const px = G.perch[s.perchI || 0], py = G.perchY; fly(s, px, py, dt, 2.6); if (Math.abs(s.x - px) < 6 && Math.abs(s.y - py) < 6) { s.mode = 'pick'; s.modeT = SS.rock.pick; s.x = px; s.y = py; w.sound('pick'); } return true; }
  if (s.mode === 'pick') { if (s.modeT <= 0) { s.rocks = S.dead.shrieker && !S.p2 ? 2 : 1; s.mode = 'carry'; s.modeT = SS.rock.carry * cdK(S); s.target = null; } return true; }
  /* THE BOULDER DROP (her own): carried HIGH; its shadow follows you on the floor, then fixes (dropTell) and it falls */
  if (s.mode === 'carry') { const sm = supMark(S); if (s.target == null && sm) s.target = sm.x;   /* (claude/rookery4) a sister's MARK: the boulder goes to it */
    const tx = clampX(S, s.target != null ? s.target : P ? P.x : G.mid), hy = G.floorY - SS.rock.high; fly(s, tx, hy, dt, 2.4);
    if ((Math.abs(s.x - tx) < 10 && s.y < hy + 12) || s.modeT <= 0) { if (S.held) { s.modeT = 0.2; return true; }
      if (!teamClear(S, s, SS.rock.tell) && ((s.dropWait = (s.dropWait || 0) + dt) < SS.tempo.hold || ROLES.some(r => r !== s.role && S.sis[r].alive && BUSY.has(S.sis[r].mode)) || supportBusy(S))) {   /* (the cap is on the gap only: never into a blow landing with hers) */ s.modeT = Math.max(s.modeT, 0.05); S.n.held++; return true; }   /* (claude/rookery3) the stagger: she keeps it over you a beat longer */
      s.dropWait = 0; s.mode = 'dropTell'; s.modeT = SS.rock.tell; s.openT0 = s.modeT; s.dropX = clampX(S, s.x); s.act = ++S.act; w.mark(s, '!!'); w.sound('rockTell'); told(S, s, 'heavy', w); if (!S.told.rock) { S.told.rock = 1; w.number(s.dropX, G.floorY - 50, SS_SAY.rock, '#ff6b6b'); } } return true; }
  if (s.mode === 'dropTell') { s.x += (s.dropX - s.x) * Math.min(1, dt * 6); if (s.modeT <= 0) { s.mode = 'drop'; s.modeT = 0.35; S.rocks.push({ x: s.dropX, y0: s.y + 6, t: 0, T: SS.rock.fall, key: 'rk' + s.act }); s.rocks--; S.n.drops++; w.sound('drop'); } return true; }
  if (s.mode === 'drop') { if (s.modeT <= 0) {
      if (s.rocks > 0) { s.mode = 'carry'; s.modeT = 1.2; s.target = P ? P.x : G.mid; return true; }   /* (the shrieker gone: two a carry) */
      s.mode = 'spent'; s.modeT = SS.rock.spent; } return true; }
  /* (claude/rookery3) SPENT: the heavy drop's recovery - empty-handed she sinks low over the stone for SS.rock.spent s (a LOW mode: whole), then goes on */
  if (s.mode === 'spent') { fly(s, s.x, G.floorY - SS.rock.low, dt, 3); if (s.modeT <= 0) {
      if (S.p2) { s.rockGo = false; s.mode = 'rise'; s.modeT = 0.8; s.cd = SS.p2.cd * cdK(S); return true; }   /* (claude/rookery2) a survivor goes back to her own hover */
      if (S.dead.diver && P && P.alive && s.ward <= 0 && !S.held && isHunter(S, s) && teamClear(S, s, SS.dive.tell[ph(S)])) { aimAt(S, s, P, w); return true; }   /* (the diver gone: she dives after the drop) */
      s.mode = 'fly'; s.perchI = (s.perchI || 0) ^ 1; } return true; }
  return false;
}
/* THE GRAB (the snatcher's own): from the side at your height; caught, lifted over the floor; strike her loose or she lets you fall */
function tryGrab(S, s, P, w) {
  if (!P || !P.alive || !mayStart(S, s) || !P.ground || S.grabCd > 0 || S.held || S.ride || s.ward > 0 || (s.role !== 'snatcher' && S.p2 !== s.role) || !teamClear(S, s, SS.grab.tell)) return false;   /* (claude/rookery3: the stagger) */
  if (ROLES.some(r => r !== 'snatcher' && S.sis[r].alive && ['dive', 'rake', 'shock', 'echo'].includes(S.sis[r].mode))) return false;   /* (one blow at a time: never into another sister's release) */
  const G = S.G; S.grabCd = S.p2 ? SS.p2.grabCd : SS.grab.cd[ph(S)] * cdK(S); s.gDir = P.x - G.x0 > 140 ? 1 : -1; s.gX = clampX(S, P.x - s.gDir * 120, 14);
  s.mode = 'grabTell'; s.modeT = SS.grab.tell; s.openT0 = s.modeT; s.face = s.gDir; s.act = ++S.act; S.n.grabs++;
  w.mark(s, '!!'); w.sound('grabTell'); told(S, s, 'medium', w); if (!S.told.grab) { S.told.grab = 1; w.number(P.x, G.floorY - 64, SS_SAY.grab, '#ff6b6b'); }
  return true;
}
function stepGrab(S, s, dt, P, w, heroes) {
  const G = S.G;
  if (s.mode === 'grabTell') { fly(s, s.gX, G.floorY - SS.grab.h - 22, dt, 5); s.face = s.gDir; if (s.modeT <= 0) { s.mode = 'grab'; s.modeT = SS.grab.T; s.hitKey = 'gb' + s.act; w.sound('grab'); } return true; }
  if (s.mode === 'grab') { s.x += s.gDir * SS.grab.v * dt; s.y += (G.floorY - SS.grab.h + 10 - s.y) * Math.min(1, dt * 8);
    const pp = w.grab ? w.grab(s, [s.x - 12, s.x + 12, s.y - 22, s.y + 2], SS.grab.dmg, s.hitKey) : null;
    if (pp) { S.held = { pp, t: 0, strikes: 0, last: -9, by: s.role, p2: !!S.p2, to: S.p2 ? null : carryTo(S, s) }; s.mode = 'lift'; s.modeT = SS.grab.lift; S.n.grabbed++; w.sound('caught'); w.number(s.x, G.floorY - 70, SS_SAY.grabbed, '#ff6b6b'); return true; }
    if (s.modeT <= 0 || s.x < G.x0 + 14 || s.x > G.x1 - 14) { s.x = clampX(S, s.x, 14); s.mode = 'land'; s.modeT = 0.55; s.y = G.floorY; }   /* missed: she overshoots and lands - low */
    return true; }
  if (s.mode === 'lift' || s.mode === 'hold') { const H = S.held;
    if (!H) { s.mode = 'rise'; s.modeT = SS.dive.rise; return true; }
    H.t += dt; const lip = SS.shock.edge + 30, hx = H.p2 ? s.x + (s.x < G.mid ? 1 : -1) * SS.p2.drift * dt : s.x;   /* (claude/rookery2: P2's SNATCH carries you across, higher) */
    if (H.to) { const R = roostById(S, H.to.id); if (R) fly(s, Math.max(G.x0 + 20, Math.min(G.x1 - 20, H.to.x)), R.top - 6 - SS.grab.hang, dt, 2.2); }   /* (claude/rookery4) RIDE THE GRAB: she carries you up toward a sister's roost (all over the summit floor) */
    else fly(s, Math.max(G.x0 + lip, Math.min(G.x1 - lip, hx)), G.floorY - (H.p2 ? SS.p2.liftH : SS.grab.liftH) - SS.grab.hang, dt, s.mode === 'lift' ? 2.2 : 1.2);   /* over the summit floor, never over the lip */
    if (s.mode === 'lift' && s.modeT <= 0) { s.mode = 'hold'; s.modeT = SS.grab.hold - SS.grab.lift; }
    if (s.mode === 'hold' && s.modeT <= 0) { S.held = null; S.n.letGo++; if (w.letGo) w.letGo(s, H.pp, SS.grab.drop); s.mode = 'rise'; s.modeT = SS.dive.rise; }
    return true; }
  return false;
}
/* A STRIKE on the sister who holds you (the hands call it on each swing while held): enough of them and she lets go, KNOCKED DOWN */
export function strikeHeld(S, w) {
  const H = S.held; if (!H || S.clock - H.last < SS.grab.gap) return false; H.last = S.clock; H.strikes++;
  if (H.strikes < (H.p2 ? SS.p2.strikes : SS.grab.strikes)) return 'strike';
  const s = S.sis[H.by || 'snatcher']; S.held = null; S.n.freed++; const hx = s.x, hy = s.y + SS.grab.hang;   /* (the hero's feet: she held him SS.grab.hang under her) */ s.y = S.G.floorY;
  if (H.p2) { S.n.p2Falls++; s.chain = null; s.mode = 'stuck'; s.modeT = SS.p2.stun; s.openT0 = s.modeT; s.purse = s.maxHp * SS.p2.cap; s.big = true; S.n.stuns++; if (w) { w.shake(8); w.sound('smash'); w.fx('open', s.x, s.y); w.number(s.x, s.y - 34, SS_SAY.fellBoth, '#ffd36b'); } return 'fall'; }   /* (claude/rookery2) P2: you fall together - she lands STUNNED */
  S.lastFree = null; { const R = H.to && roostById(S, H.to.id); if (R && Math.abs(hx - R.x) < R.w / 2 + SS.roost.r / 2 && hy <= R.top + 12 && hy > R.top - 70) { S.lastFree = { id: R.id, x: Math.max(R.x - R.w / 2 + 6, Math.min(R.x + R.w / 2 - 6, hx)), y: R.top }; S.landMul = { id: R.id, t: 1.2 }; S.n.landed++; } }   /* (claude/rookery4) struck loose BY A ROOST: you land on it */
  s.y = S.G.floorY; s.mode = 'downed'; s.modeT = SS.grab.free; s.openT0 = s.modeT; S.n.downs++; if (w) { w.number(s.x, s.y - 30, S.lastFree ? SS_SAY.landed : SS_SAY.free, '#8fd160'); w.sound('free'); }
  return 'free';
}
/* THE SNATCH (the first fall gives it to whoever has talons for it - the snatcher, else the diver): a low told sweep across the summit at your height */
/* (claude/rookery4) where the grab carries you: the nearest roost a sister sits on (not the one holding you) - beside her, on its near edge */
function carryTo(S, s) { const occ = roostList(S).filter(R => ROLES.some(r => r !== s.role && S.sis[r].alive && S.sis[r].roost === R.id && (S.sis[r].mode === 'perched' || S.sis[r].mode === 'toRoost')));
  const R = occ.sort((a, b) => Math.abs(a.x - s.x) - Math.abs(b.x - s.x))[0]; if (!R) return null; const side = Math.sign(s.x - R.x) || 1; return { id: R.id, x: R.x + side * Math.max(0, R.w / 2 - 10) }; }
function trySnatch(S, s, P, w) {
  if (!P || !P.alive || !mayStart(S, s) || S.snatchCd > 0 || alive(S).length > 2 || s.ward > 0 || S.held || !teamClear(S, s, SS.snatch.tell)) return false;   /* (claude/rookery3: the stagger) */
  const who = S.sis.snatcher.alive ? 'snatcher' : 'diver'; if (s.role !== who || !(s.mode === 'hover' || s.mode === 'fly')) return false;
  S.snatchCd = SS.snatch.cd * cdK(S); s.mode = 'snatchTell'; s.modeT = SS.snatch.tell; s.openT0 = s.modeT; s.act = ++S.act; s.sDir = P.x < S.G.mid ? -1 : 1;
  s.x = s.sDir < 0 ? S.G.x1 - 20 : S.G.x0 + 20; s.y = S.G.floorY - SS.snatch.h - 30; s.face = -s.sDir; w.mark(s, '!!'); w.sound('snatchTell'); told(S, s, 'light', w); if (!S.told.snatch) { S.told.snatch = 1; w.number(S.G.mid, S.G.floorY - 70, SS_SAY.snatch, '#ff6b6b'); }
  return true;
}
function stepSnatch(S, s, dt, P, w) {
  if (s.mode === 'snatchTell') { s.y += (S.G.floorY - SS.snatch.h - s.y) * Math.min(1, dt * 4); if (s.modeT <= 0) { s.mode = 'snatch'; s.hitKey = 'sn' + s.act; S.n.snatches++; w.sound('swoop'); } return; }
  s.x += -s.sDir * SS.snatch.v * dt; s.y = S.G.floorY - SS.snatch.h;
  w.hit(s, [s.x - 14, s.x + 14, s.y - 10, s.y + 10], SS.snatch.dmg, 'snatch', { key: s.hitKey, knockUp: true });
  if (s.x < S.G.x0 + 10 || s.x > S.G.x1 - 10) { s.mode = 'rise'; s.modeT = SS.dive.rise; if (s.role === 'snatcher') s.cd = 0; }
}
function stepRocks(S, dt, heroes, w) {
  for (const c of S.rocks) { c.t += dt; if (c.t < c.T || c.done) continue; c.done = true; const fy = S.G.floorY; w.dust(c.x, fy, 10); w.sound('rockLand'); w.shake(4);
    w.hitArea([c.x - SS.rock.r, c.x + SS.rock.r, fy - 26, fy + 2], SS.rock.dmg, 'rock', c.key);
    { const k = crackAt(S, c.x); if (k && (k.kind === 'arm' || k.kind === 'over')) { breakCrack(S, k, w); w.rubble(c.x); } }   /* (claude/rookery4) a boulder on a nest's arm or the overhang's foot breaks it */
    if (!crackAt(S, c.x)) { S.stones.push({ x: c.x, t: SS.rock.life }); S.n.stones++; if (!S.told.stone) { S.told.stone = 1; w.number(c.x, fy - 40, SS_SAY.stone, '#ffd36b'); } } }
  S.rocks = S.rocks.filter(c => !c.done);
}
function stepWaves(S, dt, heroes, w) {
  for (const q of S.waves) { q.life -= dt; q.x += q.dir * SS.wave.v * dt; if (q.x < S.G.x0 || q.x > S.G.x1) q.life = 0;
    for (const h of heroes) if (h.alive && Math.abs(h.x - q.x) < 9 && S.G.floorY - h.y < SS.wave.h) w.hitHero(h, SS.wave.dmg, 'wave', q.key, true); }
  S.waves = S.waves.filter(q => q.life > 0);
}
export const rockAt = (c, floorY) => { const k = Math.min(1, c.t / c.T); return { x: c.x, y: c.y0 + (floorY - c.y0) * k * k, k }; };
/* ---------- A BLOW ON A SISTER (B15) -> [what lands, the word or null] ---------- */
/* (claude/rookery4) close: the blow comes from a hero standing on HER roost beside her - a roosting sister struck from her own perch takes it WHOLE (ON HER PERCH) */
export function takeBlow(s, dmg, plunge, close) {
  if (s.mode === 'gustTell' && s.ward <= 0) s.gustBroken = true;   /* (claude/rookery4) a blow in the gust's tell breaks it (the gale harpy's rule) */
  if (s.ward > 0 || s.mode === 'tear') return [Math.max(1, Math.round(dmg * SS.wardMul)), 'WARDED'];
  if (s.mode === 'stuck' && !(s.purse > 0)) return [Math.max(1, Math.round(dmg * SS.wardMul)), 'WARDED'];   /* (the stun paid in full: she is tearing free - B15's floor, never nothing) */
  if (s.mode === 'stuck') { const d = Math.round(dmg * (s.openMul || SS.stun.mul)), left = s.purse ?? Infinity; if (d >= left) { s.purse = 0; s.modeT = Math.min(s.modeT, 0.01); return [Math.max(1, Math.round(left)), null]; } s.purse = left - d; return [d, null]; }
  if (s.mode === 'downed') return [Math.round(dmg * SS.downK), null];
  if (s.mode === 'startled' && !(s.purse > 0)) return [Math.max(1, Math.round(dmg * SS.wardMul)), 'WARDED'];   /* (the corner paid in full: B15's floor) */
  if (s.mode === 'startled') { const d = Math.round(dmg * (s.openMul || SS.ride.mul)), left = s.purse ?? Infinity; if (d >= left) { s.purse = 0; s.modeT = Math.min(s.modeT, 0.01); return [Math.max(1, Math.round(left)), null]; } s.purse = left - d; return [d, null]; }   /* (claude/rookery2) CORNERED on her perch */
  if (LOW_MODES.has(s.mode) || plunge) return [Math.round(dmg), null];
  if (close && s.mode === 'perched') return [Math.round(dmg), null];   /* (claude/rookery4) ON HER PERCH */
  return [Math.max(1, Math.round(dmg * SS.wing)), 'ON THE WING'];
}
/* a sister falls: the team changes */
export function fell(S, r, w) {
  S.dead[r] = true; S.n.fell.push(r); S.ph = 1 + Object.keys(S.dead).length; S.marks = []; const left = alive(S);
  if (S.held && r === (S.held.by || 'snatcher')) { const H = S.held; S.held = null; if (w.letGo) w.letGo(S.sis[r], H.pp, 0); }   /* (she falls with you in her talons: you drop, unhurt) */
  if (S.ride) { const R = S.ride; S.ride = null; if (w.unride) w.unride(R.pp); }   /* (claude/rookery2: a fall ends a ride) */
  if (left.length === 1) { const q = S.sis[left[0]]; S.p2 = left[0]; q.chain = null; q.rockGo = false; q.p2i = 0; q.mode = 'grow'; q.modeT = SS.p2.grow; q.openT0 = q.modeT; q.ward = 0; q.cd = 0;
    S.grabCd = SS.p2.grabFirst; w.number(S.G.mid, S.G.floorY - 104, SS_SAY.grow, '#ffd36b'); w.shake(6); }   /* (claude/rookery2) PHASE 2: the survivor grows and takes their gifts */
  const FELL = { diver: SS_SAY.diverFell, shrieker: SS_SAY.shriekerFell, snatcher: SS_SAY.snatcherFell };
  w.number(S.G.mid, S.G.floorY - 90, left.length === 1 ? SS_SAY.last : FELL[r], '#ff6b6b'); w.sound('fall'); w.music(S.ph);
  for (const q of left) { const s = S.sis[q]; if (s.mode === 'hover' || s.mode === 'fly' || s.mode === 'perched') s.cd = Math.min(s.cd, 1.2); }
  if (r === 'snatcher') for (const sl of S.G.slabs) if (sl.st === 'rubble') sl.t = Math.min(sl.t, SS.slab.regrow[2]);
  if (r === 'snatcher' && S.G.vents.length && !S.G.vents[0].open) { for (const v of S.G.vents) v.open = true; S.n.vents++; if (w.vents) w.vents(true); w.number(S.G.mid, S.G.floorY - 76, SS_SAY.updraft, '#8fd160'); }   /* (claude/rookery4) her gusts are gone: THE UPDRAFTS OPEN */
  S.snatchCd = Math.min(S.snatchCd, 3); if (!S.p2) S.grabCd = Math.min(S.grabCd, 3);
}

/* ---------- THE BOT (src/lab.js): what a player reads - the red lines a reaction late (and whether they have LOCKED), the boulder's shadow, the mark, the wave, the snatch,
   the rake, the shock's cone, the echo's shivering tile, the grab's talon line - and THE RULE: stand on a crack while a diver aims, step off when her line locks, then strike
   her stunned in the rubble; cut whoever comes low; held, strike her loose ---------- */
export const PLAN = { react: 0.22, miss: 0.12, early: 0.1 };
export function ssPlan(s) {
  const out = ssPlan0(s);
  if (globalThis.__ssWhy) { const k = out.why.replace(/ \(.*/, ''); globalThis.__ssWhy[k] = (globalThis.__ssWhy[k] || 0) + 1; }
  return out;
}
function ssPlan0(s) {
  const { P, S, reach } = s, G = S.G, out = { gx: null, face: P.face, atk: false, jump: false, dodge: false, block: false, down: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0;
  mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 600) { mem.seen.clear(); mem.roll.clear(); }
  const seenFor = (key, d = s.v2 ? 0 : PLAN.react) => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= d; };
  const roll = (key, pr) => { if (!mem.roll.has(key)) mem.roll.set(key, rng() < pr); return mem.roll.get(key); };
  const lo = G.x0 + 12, hi = G.x1 - 12, clamp = x => Math.max(lo, Math.min(hi, x));
  const sis = ROLES.map(r => S.sis[r]).filter(q => q.alive);
  /* 0. HELD: strike her loose (a reaction late, then every swing) */
  if (s.held) { out.gx = P.x;
    /* (claude/rookery4) RIDE THE GRAB: she is carrying you toward a sister's roost - let her, strike her loose as you come over it (or once the bar is half gone) */
    const H = S.held, hq = H && S.sis[H.by || 'snatcher'], R = H && H.to && roostById(S, H.to.id), near = !!(R && hq && Math.abs(hq.x - H.to.x) < 26 && hq.y + SS.grab.hang <= R.top + 12);
    if (R && !near && H.t < SS.grab.hold * 0.55 && !roll('rg' + (S.n.grabbed || 0), 0.25)) { out.why = 'held: ride her to the roost'; return out; }
    out.why = near ? 'held: over the roost - strike her loose' : 'held: strike her'; if (seenFor('held' + (S.n.grabbed || 0))) out.atk = P.atk < 0; return out; }
  if (s.ride) { out.gx = P.x; out.why = 'riding to the perch'; return out; }   /* (claude/rookery2) */
  const dropping = sis.filter(q => q.mode === 'dropTell');
  const inHaz = x => S.rocks.some(c => Math.abs(x - c.x) < SS.rock.r + 10) || dropping.some(q => Math.abs(x - q.dropX) < SS.rock.r + 8) || sis.some(q => q.mode === 'echoTell' && q.echoX != null && Math.abs(x - q.echoX) < SS.echo.w / 2 + 8);
  const swing = fx => { out.face = Math.sign(fx - P.x) || out.face; out.atk = P.atk < 0; };
  /* 1. IN THE AIR: keep going */
  if (!P.ground && mem.jumpT !== undefined && t - mem.jumpT < 0.5) { out.gx = mem.jumpX; out.why = 'in the air'; const q = sis.find(z => Math.abs(z.x - P.x) < reach + 12 && z.y < P.y && P.y - z.y < 50); if (q) swing(q.x); return out; }
  /* 2. A BOULDER'S SHADOW ON ME (falling, or fixed and about to fall): off it (the side away from the summit's edge); the echo's shivering tile: off it */
  const rk = S.rocks.find(c => Math.abs(P.x - c.x) < SS.rock.r + 10);
  if (rk && seenFor('rk' + rk.key)) { out.gx = clamp(P.x + (P.x < rk.x ? -1 : 1) * (SS.rock.r + 22)); if (out.gx === P.x) out.gx = clamp(rk.x + (rk.x < G.mid ? 1 : -1) * (SS.rock.r + 22)); out.why = 'off the boulder\'s shadow'; return out; }
  /* (claude/rookery4) A PEBBLE's ring on me (from the kick's windup on): off it */
  { const pb = (S.pebbles || []).find(p => Math.abs(P.x - p.tx) < SS.pebble.r + 8) || sis.find(q => q.mode === 'pebbleTell' && Math.abs(P.x - q.pbX) < SS.pebble.r + 8);
    if (pb && seenFor('pb' + (pb.key || pb.act)) && !roll('pbm' + (pb.key || pb.act), PLAN.miss)) { const px = pb.tx ?? pb.pbX, d = P.x === px ? (px < G.mid ? 1 : -1) : Math.sign(P.x - px); out.gx = clamp(px + d * (SS.pebble.r + 20)); out.why = 'off the pebble\'s ring'; return out; } }
  /* THE WING GUST coming at me: cut her in the tell (it breaks), brace on a shield, else get out of its reach */
  for (const q of sis) if (q.mode === 'gustTell' && seenFor('gu' + q.act) && (P.x - q.gX) * q.face > -8 && Math.abs(P.x - q.gX) < GALE.len + 10) {
    if (Math.abs(q.x - P.x) < reach + 14 && !roll('gc' + q.act, 0.3)) { swing(q.x); out.gx = P.x; out.why = 'cut her in the gust\'s tell'; return out; }
    if (s.shield && !roll('gb' + q.act, 0.3)) { out.block = true; out.face = Math.sign(q.x - P.x) || 1; out.why = 'brace for the gust'; return out; }
    out.gx = clamp(q.gX + q.face * (GALE.len + 24)); out.why = 'out of the gust'; return out; }
  const dt0 = dropping.find(q => Math.abs(P.x - q.dropX) < SS.rock.r + 8);
  if (dt0 && seenFor('dt' + dt0.act)) { const d = P.x === dt0.dropX ? (dt0.dropX < G.mid ? 1 : -1) : Math.sign(P.x - dt0.dropX); out.gx = clamp(dt0.dropX + d * (SS.rock.r + 24)); out.why = 'off the shadow before it falls'; return out; }
  const ec = sis.find(q => q.mode === 'echoTell' && q.echoX != null && Math.abs(P.x - q.echoX) < SS.echo.w / 2 + 8);
  if (ec && seenFor('ec' + ec.act) && !roll('ecm' + ec.act, PLAN.miss)) { const d = P.x === ec.echoX ? (ec.echoX < G.mid ? 1 : -1) : Math.sign(P.x - ec.echoX); out.gx = clamp(ec.echoX + d * (SS.echo.w / 2 + 22)); out.why = 'off the shivering tile'; return out; }
  /* 3. THE SNATCH / THE WAVE / THE RAKE / THE GRAB coming at me: jump it (or block the wave / the rake; roll through the grab) */
  for (const q of sis) if (q.mode === 'snatch' && Math.abs(q.x - P.x) < 70 && (P.x - q.x) * (-q.sDir) > -8 && P.ground && !roll('sn' + q.act, PLAN.miss)) { out.jump = true; out.gx = P.x; mem.jumpT = t; mem.jumpX = P.x; out.why = 'jump the snatch'; return out; }
  for (const q of sis) if (q.mode === 'snatchTell' && seenFor('st' + q.act)) { out.gx = P.x; out.why = 'the snatch: ready to jump'; return out; }
  for (const q of sis) if (q.mode === 'grab' && (P.x - q.x) * q.gDir > -6 && Math.abs(q.x - P.x) < 58 && P.ground && !roll('gb' + q.act, PLAN.miss)) {
    if (s.dodge && !roll('gd' + q.act, 0.4)) { out.dodge = true; out.gx = clamp(P.x - q.gDir * 40); out.why = 'roll through the grab'; return out; }
    out.jump = true; out.gx = P.x; mem.jumpT = t; mem.jumpX = P.x; out.why = 'jump the grab'; return out; }
  for (const q of sis) if (q.mode === 'grabTell' && seenFor('gt' + q.act)) { out.gx = P.x; out.face = Math.sign(q.x - P.x) || P.face; out.why = 'the grab: ready'; return out; }
  for (const q of sis) if (q.mode === 'rake' && (P.x - q.x) * q.rDir > -6 && Math.abs(q.x - P.x) < 54 && P.ground && !roll('rr' + q.act, PLAN.miss)) {
    if (s.shield && !roll('rb' + q.act, 0.5)) { out.block = true; out.face = Math.sign(q.x - P.x) || 1; out.why = 'block the rake'; return out; }
    out.jump = true; out.gx = P.x; mem.jumpT = t; mem.jumpX = P.x; out.why = 'jump the rake'; return out; }
  for (const q of sis) if (q.mode === 'rakeTell' && seenFor('rt' + q.act) && Math.abs(q.x - P.x) < 150) { out.gx = P.x; out.face = Math.sign(q.x - P.x) || P.face; out.why = 'the rake: ready'; return out; }
  const wave = S.waves.find(q => (P.x - q.x) * q.dir > 0 && Math.abs(P.x - q.x) < 46);
  if (wave && P.ground && seenFor('wv' + wave.key, 0.08)) { if (s.shield && !roll('wb' + wave.key, 0.5)) { out.block = true; out.face = -wave.dir; out.why = 'block the wave'; return out; } out.jump = true; out.gx = P.x; mem.jumpT = t; mem.jumpX = P.x; out.why = 'jump the wave'; return out; }
  /* 3b. THE SHOCK SHRIEK's cone on me: brace on a shield, else roll through it as it goes off */
  for (const q of sis) if (q.mode === 'shockTell' && seenFor('sk' + q.act)) { const dx = (P.x - q.x) * (Math.sign(P.x - q.x) || 1);
    if (dx < SS.shock.range) { if (s.shield && !roll('kb' + q.act, 0.3)) { out.block = true; out.face = Math.sign(q.x - P.x) || 1; out.why = 'brace for the shriek'; return out; }
      if (s.dodge && q.modeT < 0.16 && !roll('kd' + q.act, PLAN.miss * 2)) { out.dodge = true; out.gx = clamp(q.x + Math.sign(q.x - P.x) * 30); out.why = 'roll through the shriek'; return out; }
      if (Math.abs(q.x - P.x) < reach + 14) { swing(q.x); out.gx = P.x; out.why = 'cut her as she swells'; return out; } } }
  /* 4. A DIVER AIMING AT ME: on a crack - wait for the LOCK, then step off; off a crack - get onto one if there is time, else step off at the lock */
  const aiming = sis.filter(q => q.mode === 'diveTell' && (!q.aim.mark || Math.abs(q.aim.x - P.x) < 26) && seenFor('dt' + q.act));
  const diving = sis.find(q => q.mode === 'dive' && Math.abs(q.dv.tx - P.x) < 20);
  /* (claude/rookery4) THE MAIN OPENING: a nest's cracked arm with a sister roosting on it (or the overhang's foot) is the best crack there is while a Hunter who DIVES hunts */
  const hn = S.sis[S.hunter], diving0 = !!hn && hn.alive && (hn.role !== 'snatcher' || S.dead.diver);
  const occ = arms(S).filter(a => a.over ? !roll('ov' + Math.floor(t / 20), 0.5) : ROLES.some(r => r !== S.hunter && S.sis[r].alive && S.sis[r].roost === a.arm.id && (S.sis[r].mode === 'perched' || SUPPORT.has(S.sis[r].mode))));
  const cr = [...(diving0 && !S.p2 ? occ.filter(c => !inHaz(c.x)).map(c => ({ ...c, pri: 1 })) : []), ...cracks(S).filter(c => !inHaz(c.x))].sort((a, b) => (b.pri || 0) - (a.pri || 0) || Math.abs(a.x - P.x) - Math.abs(b.x - P.x));
  const onCrack = cr.find(c => Math.abs(c.x - P.x) < c.w / 2 - 4);
  const stepOff = (q, why) => { const d = (P.x < G.mid ? 1 : -1); let x = clamp(P.x + d * 46); if (inHaz(x)) x = clamp(P.x - d * 46); out.gx = x; out.why = why; return out; };
  if (diving) { if (s.shield && !onCrack && !roll('db' + diving.act, 0.55)) { out.block = true; out.face = Math.sign(diving.x - P.x) || 1; out.why = 'block the dive'; return out; }
    if (s.dodge && !roll('dd' + diving.act, 0.5)) { out.dodge = true; out.gx = clamp(P.x + (P.x < G.mid ? 1 : -1) * 40); out.why = 'roll out of the dive'; return out; }
    return stepOff(diving, 'out of the dive'); }
  /* (claude/rookery4) FRIENDLY FIRE: her line locked on a MARK under me, a sister roosting - brace on the mark (a shield hero, often) and her dive goes to her sister */
  for (const q of aiming) if (q.aim.mark && q.aim.lock && !q.aim.ff && s.shield && Math.abs(q.aim.x - P.x) < 16 && ROLES.some(r => r !== q.role && S.sis[r].alive && S.sis[r].mode === 'perched') && !roll('ff' + q.act, 0.5)) { out.block = true; out.gx = P.x; out.face = Math.sign(q.x - P.x) || 1; out.why = 'brace on the mark: friendly fire'; return out; }
  for (const q of aiming) { const miss = s.v2 ? false : roll('am' + q.act, PLAN.miss);
    if (q.aim.lock) { if (!seenFor('lk' + q.act, s.v2 ? 0 : PLAN.react * 0.6)) { out.gx = P.x; out.why = 'her line locked: reading it'; return out; }
      if (!miss) return stepOff(q, onCrack ? 'her line locked on the crack: step off' : 'her line locked: step off'); out.gx = P.x; out.why = 'her line locked: late (a miss)'; return out; }
    if (!q.aim.lock) { if (onCrack) { out.gx = onCrack.x; out.why = 'on the crack: let her aim'; return out; }
      const c = cr[0]; if (c && Math.abs(c.x - P.x) < 70 && q.modeT > 0.4) { out.gx = c.x; out.why = 'onto a crack while she aims'; return out; } out.gx = P.x; out.why = 'her line: wait for the lock'; return out; } }
  /* 4b. A CHAIN STOOP coming: get onto the nearest crack */
  const chainer = sis.find(q => q.mode === 'chainTell' || (q.chain && q.mode === 'jar'));
  if (chainer && cr[0] && seenFor('ch' + chainer.act)) { out.gx = cr[0].x; out.why = 'a chain stoop: onto a crack'; return out; }
  /* 4c. (claude/rookery2) THE RIDE: a sister climbing off the rock (a dive or a rake taken on the shield, a grab struck loose) with the shrieker on her perch - most players take it */
  const fw = sis.find(q => q.mode === 'ferryWait'), shr = S.sis.shrieker;
  if (fw && shr.alive && (shr.mode === 'perched' || shr.mode === 'rise') && !roll('fw' + fw.act, 0.3) && seenFor('fw' + fw.act)) { out.gx = clamp(fw.x); if (Math.abs(fw.x - P.x) < 16) out.grab = true; out.why = 'grab her talons: ride to the perch'; return out; }
  /* 5. A SISTER OPEN (stunned / down) or LOW: strike her */
  const open = sis.filter(q => sisOpen(q) && q.ward <= 0).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
  if (open) { const sx = open.x + (P.x < open.x ? -1 : 1) * (s.tip ? 22 : 12); out.gx = clamp(sx); if (Math.abs(open.x - P.x) < reach + 14) swing(open.x); out.why = 'strike her: ' + (OPEN_NAME[open.mode] || 'open').toLowerCase(); return out; }
  const low = sis.filter(q => LOW_MODES.has(q.mode) && !['snatch', 'grab', 'rake', 'lift', 'hold'].includes(q.mode) && q.ward <= 0 && G.floorY - q.y < 60).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
  if (low && Math.abs(low.x - P.x) < 120) { const above = G.floorY - low.y > 26; out.gx = clamp(low.x + (P.x < low.x ? -1 : 1) * 12); if (Math.abs(low.x - P.x) < reach + 14) { if (above && P.ground && !roll('lj' + low.act + Math.floor(t * 2), 0.5)) { out.jump = true; mem.jumpT = t; mem.jumpX = low.x; out.why = 'jump at her'; return out; } swing(low.x); } out.why = 'cut her while she is low'; return out; }
  /* 6. THE MARK under me: if a crack is under it, stay till her line locks (above); else off the mark */
  const mk = S.marks.find(m => Math.abs(m.x - P.x) < 18);
  if (mk && !onCrack && seenFor('mk' + mk.T + Math.round(mk.x))) { out.gx = clamp(P.x + (P.x < G.mid ? 1 : -1) * 40); out.why = 'off the mark'; return out; }
  /* 7. THE RULE: go and stand on the nearest crack (away from a boulder), facing the nearest sister */
  if (s.rest) { out.gx = clamp(G.mid + (P.x < G.mid ? -1 : 1) * 120); out.why = 'winded: off them'; return out; }
  const c = cr[0]; const near = sis.slice().sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
  if (c) { out.gx = c.x; out.face = near ? Math.sign(near.x - P.x) || 1 : P.face; out.why = Math.abs(c.x - P.x) < 6 ? 'on the crack: bait her' : 'to a crack'; return out; }
  out.gx = clamp(G.mid); out.why = 'no crack: the middle'; return out;
}
