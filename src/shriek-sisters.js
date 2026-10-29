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
export const SS = {
  hp: { diver: 830, shrieker: 625, snatcher: 720 },   /* (claude/rookery2 tune: 770/580/670 -> 830/625/720 with the ride and phase 2, n=12/hero 74% -> see the lane report) */   /* (claude/sisters2 tune, BOT_PROFILE=human L14 n=36/hero: 920/690/800 -> 770/580/670, grab dmg 12 -> 10, grab cd 8/5.5/4.5 -> 10/7/5.5 first 7 -> 9: 47% -> 68%) */
  wing: 0.4, downK: 1.5, wardMul: 0.4, last: 0.8,
  hover: { diver: 112, shrieker: 150, snatcher: 104 },   /* (claude/sisters2: the boulder's carry 150 -> 118 so the dropTell pose and its mark are on the arena's screen; the shrieker stays at 150 - at 124 her own dives after the diver falls came too fast: 54%) */
  dive: { tell: [0.75, 0.75, 0.72], lock: 0.26, markTell: 0.62, v: 430, dmg: 20, land: 0.7, rise: 0.8, cd: [2.4, 2.1, 1.8], second: 0.42, pairDmg: 12, downed: 1.1 },   /* (claude/rookery3) MEDIUM: 0.75 in every phase (was 0.85/0.75/0.7); the pair's second dive is LIGHT (0.42, 12) */
  stun: { t: 2.6, mul: 2, cap: 0.24 },
  ward: 2.5,
  slab: { w: 48, regrow: [9, 9, 6.5] },
  scream: { tell: 1.15, cd: [4.6, 4.0, 3.4], mark: 1.6, swoop: 1.9, low: 34 },   /* (claude/rookery3) HEAVY: 0.95 -> 1.15 (head thrown back, a deep cue); the swoop after it is the punish */
  wave: { tell: 0.7, v: 230, h: 26, dmg: 18, life: 1.8 },   /* (claude/rookery3) MEDIUM */
  rock: { tell: 1.1, fall: 0.62, r: 22, dmg: 24, life: 11, pick: 1.0, carry: 2.2, high: 118, spent: 1.1, low: 40 },   /* (claude/rookery3) HEAVY: 0.8 -> 1.1, 21 -> 24; then SPENT: she sinks low and empty-handed for SS.rock.spent s (whole: the punish) */   /* THE BOULDER DROP (claude/sisters2: carried high, a shadow marker) */
  snatch: { tell: 0.42, v: 320, h: 16, dmg: 12, cd: 6.5 },   /* (claude/rookery3) LIGHT: 0.8 -> 0.42, 22 -> 12 (she sweeps in from the far wall: the crossing is the read) */
  sister: { w: 26, h: 18 },
  /* (claude/sisters2) THE SIGNATURE MOVES. sig: each survivor's own cooldown x this by phase (0 = all three, 1 = one fallen, 2 = the last) */
  sig: [1, 0.72, 0.6],
  chain: { tell: 1.15, n: [2, 3, 3], every: [3, 2, 2], aim: 0.66, jar: 0.42, stun: 4.0, cap: 0.34, rise: 12, dmg: 24, spent: 1.2 },   /* (rise 40 -> 12: the heavy climb, grown, stayed under the screen's top edge) */   /* (claude/rookery3) HEAVY: 0.9 -> 1.15, each dive 24; a chain that ends in no rock leaves her SPENT on the floor (whole) */
  rake: { tell: 0.4, v: 250, T: 0.5, h: 16, dmg: 11, chance: [0.6, 1, 1], end: 0.6, pre: 0.25 },   /* (claude/rookery3) LIGHT: 0.5 -> 0.4, 18 -> 11, a shorter slide */
  shock: { tell: 0.7, range: 150, h: 64, dmg: 8, vx: 300, vy: -160, low: 30, gap: 64, edge: 30, teeter: 0.7, T: 0.45 },
  echo: { tell: 0.42, ahead: 56, w: 22, dmg: 8, life: 8, T: 0.3 },   /* (claude/rookery3) LIGHT: 0.75 -> 0.42, 14 -> 8 (the tile is AHEAD of you: a quick flash) */
  grab: { tell: 0.7, v: 290, T: 0.8, h: 14, dmg: 10, lift: 0.8, hold: 1.8, strikes: 3, gap: 0.22, liftH: 56, drop: 14, free: 1.6, cd: [10, 7, 5.5], first: 9, hang: 24 },
  /* (claude/rookery2) THE LEVEL'S VERB IN THE FIGHT - P1: a sister KNOCKED DOWN (her dive or rake on a shield, a grab struck loose) climbs off the rock (ferryWait, SS.ride.window s:
     UP: GRAB): grab her talons and she FERRIES you up to the SHRIEKER'S PERCH (a bone nest lashed to a spire); land beside the shrieker and she is CORNERED (open x SS.ride.mul,
     up to SS.ride.cap of her) for SS.ride.startle s, then flees behind her ward. The nest tips you off after SS.ride.tip s (no camping on it) */
  ride: { window: 1.1, reach: 24, v: 170, minT: 0.9, hang: 22, startle: 2.6, mul: 1.5, cap: 0.24, tip: 3.4, rise: 30 },
  /* (claude/rookery2) PHASE 2 = TWO SISTERS DEAD: the survivor GROWS (SS.p2.scale, no HP) and takes a reduced set of the dead sisters' moves (P2KIT), one at a time, each its own tell;
     and THE SNATCH: she seizes you (her red !! talon line) and carries you over the summit - STRIKE HER SS.p2.strikes times mid-carry and you both fall: she lands STUNNED (the
     big opening, SS.p2.stun s up to SS.p2.cap of her) */
  p2: { grow: 1.5, scale: 1.3, hover: 96, cd: 1.5, strikes: 2, stun: 3.2, cap: 0.3, liftH: 70, drift: 46, grabCd: 7.5, grabFirst: 3 },
  /* (claude/rookery3) THE TEMPO (Daniel 10-29 live: "they attack way too quickly and at the same speed ... a heavy, a light, and a medium one"). Every told move has a CLASS (TEMPO below):
     HEAVY a long readable windup (1.1-1.15 s), her biggest pose, a deep cue, hits hard, then a long recovery (the punish); MEDIUM 0.7-0.75 s; LIGHT 0.4-0.42 s, low damage, short.
     THE STAGGER: no sister STARTS a move while another is winding up or striking, nor sooner than gap[class of the last start] s after it (so two never wind up in lock-step);
     a move kept waiting holds its pose (the boulder stays carried, the rake stays planted) for at most `hold` s */
  tempo: { gap: { heavy: 1.6, medium: 1.1, light: 0.75 }, hold: 2.0 },
};
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
  snatchP2: 'THE SNATCH: STRIKE HER IN THE AIR', fellBoth: 'YOU FALL TOGETHER: SHE IS STUNNED' };
export const OPEN_NAME = { stuck: 'STUNNED', downed: 'DOWN', startled: 'CORNERED' };
const WING_MODES = new Set(['grow', 'ferry', 'perched', 'hover', 'diveTell', 'rise', 'screamTell', 'scream', 'carry', 'dropTell', 'drop', 'fly', 'snatchTell', 'wake', 'sleep', 'chainTell', 'echoTell', 'echo']);
const LOW_MODES = new Set(['spent', 'ferryWait', 'land', 'swoop', 'pick', 'waveTell', 'wave', 'snatch', 'jar', 'rakeTell', 'rake', 'shockTell', 'shock', 'grabTell', 'grab', 'lift', 'hold']);
export const sisOpen = s => !!s && s.alive && (s.mode === 'stuck' || s.mode === 'downed' || s.mode === 'startled');
export const ssOpen = S => !!S && ROLES.some(r => sisOpen(S.sis[r]));
const TELLS = new Set(['diveTell', 'screamTell', 'dropTell', 'snatchTell', 'waveTell', 'chainTell', 'rakeTell', 'shockTell', 'echoTell', 'grabTell']);
export const sisTelling = s => !!s && TELLS.has(s.mode);
/* (claude/rookery3) THE TEMPO CLASS of each told move (by its windup). The diveTell is MEDIUM on its own, HEAVY inside a chain stoop or at the shrieker's mark (those are the
   heavy moves' strikes), LIGHT as the pair's quick second dive: s.tempo carries the class a windup was started with */
export const TEMPO = Object.fromEntries([...TELLS].map(m => [m, tempoOf('shrieksister|' + m)]));   /* the table lives in src/marks.js TEMPO_CLASS (the tell system; tools/tells.mjs audits it) */
const BUSY = new Set([...TELLS, 'dive', 'rake', 'shock', 'echo', 'grab', 'snatch', 'wave', 'drop', 'lift', 'hold']);
/* a windup starts: its class (the hands draw and sound it by class); own = an independent start, which the stagger counts (a heavy move's own strikes, the pair, are not) */
function told(S, s, cls, w, own) { s.tempo = cls; s.tempoT = Math.max(0.01, s.modeT); S.n.tempo[cls] = (S.n.tempo[cls] || 0) + 1;
  if (own !== false) { if (S.tLast > -50) S.n.minGap = Math.min(S.n.minGap, S.clock - S.tLast); S.tLast = S.clock; S.tCls = cls; }
  if (w && w.tempo) w.tempo(s, cls); }
/* THE STAGGER: may sister s start a move now? (no other sister winding up or striking, and the last start's gap gone by) */
export function teamClear(S, s) { if (S.clock - S.tLast < SS.tempo.gap[S.tCls || 'light']) return false; return !ROLES.some(r => r !== s.role && S.sis[r].alive && BUSY.has(S.sis[r].mode)); }
/* THE SHRIEKER's turn: what her next scream is, by phase (the survivors lean on their own: SHOCK and ECHO) */
export const ROT = [['mark', 'echo', 'mark', 'shock'], ['shock', 'echo', 'mark', 'shock', 'echo'], ['shock', 'echo', 'shock', 'echo', 'mark']];
/* THE SUMMIT (px): x0/x1 inside the walls, floorY, the three slabs (tile columns of their middles), the two shelves (the snatcher's perches) */
export function geom(A, TS = 16) {
  const fl = A.floor, slabs = (A.slabs || []).map((c, i) => ({ id: i, x: c * TS + 8, st: 'crack', t: 0 }));
  const pr = A.perchS || null;   /* (claude/rookery2) [x0, x1, row] tiles: the shrieker's nest, high on its spire */
  const perchS = pr ? { x: (pr[0] + pr[1] + 1) * TS / 2, w: (pr[1] - pr[0] + 1) * TS, y: pr[2] * TS } : null;
  return { x0: A.x0, x1: A.x1, floorY: fl, mid: (A.x0 + A.x1) / 2, slabs, perch: [A.x0 + 5 * TS, A.x1 - 5 * TS], perchY: fl - 3 * TS, perchS, TS };
}
export function newFight(G) {
  const sis = {}; for (const r of ROLES) sis[r] = { role: r, hp: SS.hp[r], maxHp: SS.hp[r], alive: true, x: G.mid + (r === 'diver' ? -60 : r === 'snatcher' ? 70 : 0), y: G.floorY - SS.hover[r], face: -1, mode: 'sleep', modeT: 0, ward: 0, cd: r === 'diver' ? 1.2 : r === 'shrieker' ? 2.6 : 0.6, purse: 0, rocks: 0, side: r === 'snatcher' ? 1 : -1, act: 0, nAtk: 0, rot: 0 };
  return { G, sis, ph: 1, dead: {}, ride: null, p2: null, perchT: 0, tLast: -99, tCls: 'light', marks: [], rocks: [], stones: [], waves: [], echoes: [], told: {}, act: 0, snatchCd: SS.snatch.cd, grabCd: SS.grab.first, held: null, clock: 0, rnd: Math.random,
    n: { dives: 0, stuns: 0, skids: 0, downs: 0, screams: 0, marksStruck: 0, drops: 0, stones: 0, snatches: 0, waves: 0, wardHits: 0, wingHits: 0, lowHits: 0, openHits: 0, fell: [],
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
  for (const s of S.G.slabs) if (s.st === 'crack' && Math.abs(x - s.x) < SS.slab.w / 2 + 4) return { kind: 'slab', s };
  for (const q of S.stones) if (Math.abs(x - q.x) < 14) return { kind: 'stone', s: q };
  for (const q of S.echoes || []) if (Math.abs(x - q.x) < SS.echo.w / 2 + 2) return { kind: 'echo', s: q };
  return null;
}
export const cracks = S => [...S.G.slabs.filter(s => s.st === 'crack').map(s => ({ x: s.x, w: SS.slab.w, slab: s })), ...S.stones.map(q => ({ x: q.x, w: 24, stone: q })), ...(S.echoes || []).map(q => ({ x: q.x, w: SS.echo.w, echo: q }))];
function breakCrack(S, c) { if (c.kind === 'slab') { c.s.st = 'rubble'; c.s.t = SS.slab.regrow[S.dead.snatcher ? 2 : 0]; } else c.s.t = 0; if (c.kind === 'echo') S.n.echoStruck++; }
/* ---------- ONE FRAME OF THE TEAM. heroes: [{ x, y, ground, alive, face, pp }]; w: the world (src/shriek-sisters-hands.js world()) ---------- */
export function stepSisters(S, dt, heroes, w) {
  const G = S.G, P = heroes.find(h => h.alive && !(S.held && S.held.pp && h.pp === S.held.pp)) || heroes.find(h => h.alive) || heroes[0];
  S.clock += dt; S._heroes = heroes;
  for (const sl of G.slabs) if (sl.st === 'rubble') { sl.t -= dt; if (sl.t <= 0) { sl.st = 'crack'; w.sound('crack'); } }
  for (const q of S.stones) q.t -= dt; S.stones = S.stones.filter(q => q.t > 0);
  for (const q of S.echoes) q.t -= dt; S.echoes = S.echoes.filter(q => { if (q.t > 0) return true; w.dust(q.x, G.floorY, 4); return false; });
  for (const m of S.marks) m.t -= dt; S.marks = S.marks.filter(m => m.t > 0);
  stepRocks(S, dt, heroes, w); stepWaves(S, dt, heroes, w);
  stepPerch(S, dt, heroes, w);
  for (const r of ROLES) { const s = S.sis[r]; if (!s.alive) continue; s.ward = Math.max(0, s.ward - dt); if (s.mode === 'sleep') continue; s.modeT -= dt; s.cd -= dt;
    if (stepFerry(S, s, dt, P, w)) continue;
    if (S.p2 === r) stepSurvivor(S, s, dt, P, w, heroes); else if (r === 'diver') stepDiver(S, s, dt, P, w); else if (r === 'shrieker') stepShrieker(S, s, dt, P, w); else stepSnatcher(S, s, dt, P, w, heroes); }
  S.snatchCd -= dt; if (!S.held) S.grabCd -= dt;
}
const fly = (s, tx, ty, dt, k = 3) => { s.x += (tx - s.x) * Math.min(1, dt * k); s.y += (ty - s.y) * Math.min(1, dt * k); };
const clampX = (S, x, m = 16) => Math.max(S.G.x0 + m, Math.min(S.G.x1 - m, x));
const ready = (S, s, P) => s.cd <= 0 && P && P.alive && s.ward <= 0 && !S.held && teamClear(S, s);   /* (claude/rookery3: and the stagger) */
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
  s.mode = 'stuck'; s.modeT = big ? SS.chain.stun : SS.stun.t; s.openT0 = s.modeT; s.purse = s.maxHp * (big ? SS.chain.cap : SS.stun.cap); s.big = !!big; S.n.stuns++; if (big) S.n.exhausted++;
  if (s.aim && s.aim.mark) S.n.marksStruck++;
  w.shake(big ? 8 : 6); w.sound('smash'); w.fx('open', s.x, s.y); w.number(s.x, s.y - 34, big ? SS_SAY.exhausted : SS_SAY.stunned, '#ffd36b');
}
function stepDive(S, s, dt, P, w) {
  if (s.mode === 'chainTell') { fly(s, clampX(S, P ? P.x - s.side * 40 : s.x), S.G.floorY - SS.hover[s.role] - SS.chain.rise, dt, 2.5); if (P) s.face = Math.sign(P.x - s.x) || s.face;
    if (s.modeT <= 0) { if (P && P.alive) aimAt(S, s, P, w); else { s.chain = null; s.mode = 'rise'; s.modeT = SS.dive.rise; } } return true; }
  if (s.mode === 'diveTell') { if (!s.aim.lock) { if (P) s.aim.x = clampX(S, P.x); if (s.modeT <= SS.dive.lock) { s.aim.lock = true; w.sound('lock'); } }
    s.face = Math.sign(s.aim.x - s.x) || s.face; s.y += (S.G.floorY - SS.hover[s.role] - 14 - s.y) * Math.min(1, dt * 2);
    if (s.modeT <= 0) { s.mode = 'dive'; const d = Math.hypot(s.aim.x - s.x, S.G.floorY - 10 - s.y) || 1; s.dv = { fx: s.x, fy: s.y, tx: s.aim.x, ty: S.G.floorY - 4, t: 0, T: Math.max(0.15, d / SS.dive.v) }; s.hitKey = 'dv' + s.act; S.n.dives++; w.sound('dive'); }
    return true; }
  if (s.mode === 'dive') { const v = s.dv; v.t += dt; const k = Math.min(1, v.t / v.T); s.x = v.fx + (v.tx - v.fx) * k; s.y = v.fy + (v.ty - v.fy) * k;
    const res = w.hit(s, [s.x - 11, s.x + 11, s.y - 16, s.y + 2], s.chain ? SS.chain.dmg : s.pair ? SS.dive.pairDmg : SS.dive.dmg, 'dive', { key: s.hitKey, blockable: true });   /* (claude/rookery3) heavy 24 / medium 20 / light 12 */
    if (res === 'blocked') { s.chain = null; s.mode = 'downed'; s.modeT = SS.dive.downed; s.openT0 = s.modeT; s.y = S.G.floorY; S.n.downs++; w.number(s.x, s.y - 30, SS_SAY.downed, '#8fd160'); return true; }
    if (k >= 1) { const c = crackAt(S, v.tx); s.y = S.G.floorY; if (c) breakCrack(S, c);
      const ch = s.chain; s.pair = false;
      if (ch) { ch.i++; if (c) ch.hit++; S.n.chainDives++;
        if (ch.i < ch.n) { s.mode = 'jar'; s.modeT = c ? SS.chain.jar : SS.chain.jar * 0.6;   /* (a dive of the chain: she is jarred a beat - low, whole - and goes again) */
          if (c) { S.n.bursts++; w.shake(4); w.sound('smash'); w.rubble(v.tx); if (!S.told.burst) { S.told.burst = 1; w.number(s.x, s.y - 34, SS_SAY.burst, '#c8d8e8'); } } else { w.dust(s.x, S.G.floorY, 6); w.sound('skid'); }
          return true; }
        s.chain = null;
        if (c) { stuckOpen(S, s, w, ch.hit === ch.n); w.rubble(v.tx); return true; } }
      if (c) { stuckOpen(S, s, w, false); w.rubble(v.tx); }
      else { s.mode = 'land'; S.n.skids++; w.dust(s.x, S.G.floorY, 8); w.sound('skid'); if (!S.told.skid) { S.told.skid = 1; w.number(s.x, s.y - 30, SS_SAY.skid, '#c8d8e8'); }
        s.rakeNext = !ch && s.role === 'diver' && !s.raked && !!P && P.alive && S.rnd() < SS.rake.chance[ph(S)]; s.modeT = s.rakeNext ? SS.rake.pre : ch ? SS.chain.spent : SS.dive.land; } }   /* (claude/rookery3) a spent chain: no rake, a long recovery */
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
      if (s.mode === 'land' && s.rakeNext && P && P.alive && !teamClear(S, s) && (s.rakeWait = (s.rakeWait || 0) + 0.05) < 0.6) { s.modeT = 0.05; S.n.held++; return true; }   /* (claude/rookery3) the stagger: planted, she waits her turn (then gives the rake up) */
      if (s.mode === 'land' && s.rakeNext && P && P.alive && teamClear(S, s)) { s.rakeWait = 0; s.rakeNext = false; s.raked = true; s.mode = 'rakeTell'; s.modeT = SS.rake.tell; s.openT0 = s.modeT; s.rDir = Math.sign(P.x - s.x) || s.face; s.face = s.rDir; s.act = ++S.act;
        w.mark(s, '!'); w.sound('rakeTell'); told(S, s, 'light', w); if (!S.told.rake) { S.told.rake = 1; w.number(s.x, s.y - 34, SS_SAY.rake, '#ffd36b'); } return true; }
      s.rakeNext = false; s.rakeWait = 0;
      if (s.role === 'diver' && S.dead.shrieker && !s.second && P) { s.second = true; aimAt(S, s, P, w, null, true); s.openT0 = s.modeT; return true; }   /* (claude/rookery3: LIGHT) */   /* THE PAIR (the shrieker gone) */
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
/* THE PERCH: a hero who lands on it beside the perched shrieker CORNERS her (the opening); the nest tips him off after SS.ride.tip s */
function stepPerch(S, dt, heroes, w) {
  const P0 = S.G.perchS; if (!P0) return; const on = heroes.find(h => h.alive && h.ground && Math.abs(h.x - P0.x) < P0.w / 2 + 6 && Math.abs(h.y - P0.y) < 8);
  if (!on) { S.perchT = 0; return; } S.perchT += dt; const sh = S.sis.shrieker;
  if (sh.alive && !S.p2 && sh.mode === 'perched' && sh.ward <= 0) { sh.mode = 'startled'; sh.modeT = SS.ride.startle; sh.openT0 = sh.modeT; sh.purse = sh.maxHp * SS.ride.cap; S.n.cornered++;
    w.shake(4); w.sound('screech'); w.fx('open', sh.x, sh.y); w.number(sh.x, sh.y - 34, SS_SAY.cornered, '#ffd36b'); }
  if (S.perchT >= SS.ride.tip) { S.perchT = -9; S.n.tips++; if (w.tip) w.tip(on, P0); w.number(P0.x, P0.y - 30, SS_SAY.tips, '#c8d8e8'); }
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
  if (!ready(S, s, P)) return;
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
  if (ready(S, s, P)) { s.nAtk++; if (s.nAtk % SS.chain.every[ph(S)] === 0) startChain(S, s, P, w); else aimAt(S, s, P, w); }
}
function stepShrieker(S, s, dt, P, w) {
  if (s.mode === 'wake') { if (s.modeT <= 0) s.mode = 'hover'; return; }
  if (stepDive(S, s, dt, P, w)) return;   /* (the diver gone: she dives at her own mark) */
  if (s.mode === 'startled') { const P0 = S.G.perchS; if (P0) { s.x += (P0.x + P0.w / 2 - 6 - s.x) * Math.min(1, dt * 6); s.y = P0.y - 2; }
    if (s.modeT <= 0) { s.big = false; s.ward = SS.ward; s.mode = 'rise'; s.modeT = 1.0; s.cd = 1.4; w.fx('ward', s.x, s.y); w.number(s.x, s.y - 34, SS_SAY.ward, '#c8d8e8'); } return; }
  if (shriekMoves(S, s, dt, P, w)) return;
  if (s.mode === 'rise') { const home = perchHome(S); fly(s, home ? home[0] : clampX(S, S.G.mid - s.side * 90), home ? home[1] : S.G.floorY - SS.hover.shrieker, dt, 2.2); if (s.modeT <= 0) s.mode = home ? 'perched' : 'hover'; return; }
  if (trySnatch(S, s, P, w)) return;
  if (s.mode === 'snatchTell' || s.mode === 'snatch') return stepSnatch(S, s, dt, P, w);
  /* (claude/rookery2) PERCHED: between her moves she sits on her nest (P1) - a hero who rides up beside her corners her. With a hero on it she hangs off it instead */
  const home = perchHome(S);
  if (home) { s.mode = 'perched'; fly(s, home[0], home[1], dt, 3); s.face = P ? Math.sign(P.x - s.x) || s.face : s.face; }
  else { s.mode = 'hover'; fly(s, clampX(S, S.G.mid + Math.sin(S.act * 0.9 + s.cd) * 120), S.G.floorY - SS.hover.shrieker + Math.sin(s.cd * 2) * 6, dt, 1.2); }
  if (ready(S, s, P)) { const rot = ROT[ph(S)], mv = S.dead.diver && s.rot % 2 === 0 ? 'mark' : rot[s.rot % rot.length]; s.rot++;
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
  if (s.mode === 'shockTell') { if (P) { s.shX = clampX(S, P.x + s.shSide * SS.shock.gap, 20); s.face = Math.sign(P.x - s.x) || s.face; } fly(s, s.shX, S.G.floorY - SS.shock.low, dt, 4);
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
  const d = S.sis.diver; if (d.alive && d.ward <= 0 && !S.held && (d.mode === 'hover' || d.mode === 'rise')) aimAt(S, d, P, w, m);
  const n = S.sis.snatcher; if (n.alive && (n.mode === 'carry' || n.mode === 'fly')) { n.target = m.x; n.mode = 'carry'; n.modeT = Math.min(n.modeT, 0.9); }
  if (S.dead.diver || S.p2 === s.role) { aimAt(S, s, P, w, m); s.side = -s.side; return; }   /* the diver gone (or a survivor's own mark): she dives at her own mark */
  s.mode = 'swoop'; s.modeT = SS.scream.swoop; s.waved = false; s.side = Math.random() < 0.5 ? -1 : 1;
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
  if (s.mode === 'fly') { const px = G.perch[s.perchI || 0], py = G.perchY; fly(s, px, py, dt, 2.6); if (Math.abs(s.x - px) < 6 && Math.abs(s.y - py) < 6) { s.mode = 'pick'; s.modeT = SS.rock.pick; s.x = px; s.y = py; w.sound('pick'); } return true; }
  if (s.mode === 'pick') { if (s.modeT <= 0) { s.rocks = S.dead.shrieker && !S.p2 ? 2 : 1; s.mode = 'carry'; s.modeT = SS.rock.carry * cdK(S); s.target = null; } return true; }
  /* THE BOULDER DROP (her own): carried HIGH; its shadow follows you on the floor, then fixes (dropTell) and it falls */
  if (s.mode === 'carry') { const tx = clampX(S, s.target != null ? s.target : P ? P.x : G.mid), hy = G.floorY - SS.rock.high; fly(s, tx, hy, dt, 2.4);
    if ((Math.abs(s.x - tx) < 10 && s.y < hy + 12) || s.modeT <= 0) { if (S.held) { s.modeT = 0.2; return true; }
      if (!teamClear(S, s) && (s.dropWait = (s.dropWait || 0) + dt) < SS.tempo.hold) { s.modeT = Math.max(s.modeT, 0.05); S.n.held++; return true; }   /* (claude/rookery3) the stagger: she keeps it over you a beat longer */
      s.dropWait = 0; s.mode = 'dropTell'; s.modeT = SS.rock.tell; s.openT0 = s.modeT; s.dropX = clampX(S, s.x); s.act = ++S.act; w.mark(s, '!!'); w.sound('rockTell'); told(S, s, 'heavy', w); if (!S.told.rock) { S.told.rock = 1; w.number(s.dropX, G.floorY - 50, SS_SAY.rock, '#ff6b6b'); } } return true; }
  if (s.mode === 'dropTell') { s.x += (s.dropX - s.x) * Math.min(1, dt * 6); if (s.modeT <= 0) { s.mode = 'drop'; s.modeT = 0.35; S.rocks.push({ x: s.dropX, y0: s.y + 6, t: 0, T: SS.rock.fall, key: 'rk' + s.act }); s.rocks--; S.n.drops++; w.sound('drop'); } return true; }
  if (s.mode === 'drop') { if (s.modeT <= 0) {
      if (s.rocks > 0) { s.mode = 'carry'; s.modeT = 1.2; s.target = P ? P.x : G.mid; return true; }   /* (the shrieker gone: two a carry) */
      s.mode = 'spent'; s.modeT = SS.rock.spent; } return true; }
  /* (claude/rookery3) SPENT: the heavy drop's recovery - empty-handed she sinks low over the stone for SS.rock.spent s (a LOW mode: whole), then goes on */
  if (s.mode === 'spent') { fly(s, s.x, G.floorY - SS.rock.low, dt, 3); if (s.modeT <= 0) {
      if (S.p2) { s.rockGo = false; s.mode = 'rise'; s.modeT = 0.8; s.cd = SS.p2.cd * cdK(S); return true; }   /* (claude/rookery2) a survivor goes back to her own hover */
      if (S.dead.diver && P && P.alive && s.ward <= 0 && !S.held && teamClear(S, s)) { aimAt(S, s, P, w); return true; }   /* (the diver gone: she dives after the drop) */
      s.mode = 'fly'; s.perchI = (s.perchI || 0) ^ 1; } return true; }
  return false;
}
/* THE GRAB (the snatcher's own): from the side at your height; caught, lifted over the floor; strike her loose or she lets you fall */
function tryGrab(S, s, P, w) {
  if (!P || !P.alive || !P.ground || S.grabCd > 0 || S.held || S.ride || s.ward > 0 || (s.role !== 'snatcher' && S.p2 !== s.role) || !teamClear(S, s)) return false;   /* (claude/rookery3: the stagger) */
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
    if (pp) { S.held = { pp, t: 0, strikes: 0, last: -9, by: s.role, p2: !!S.p2 }; s.mode = 'lift'; s.modeT = SS.grab.lift; S.n.grabbed++; w.sound('caught'); w.number(s.x, G.floorY - 70, SS_SAY.grabbed, '#ff6b6b'); return true; }
    if (s.modeT <= 0 || s.x < G.x0 + 14 || s.x > G.x1 - 14) { s.x = clampX(S, s.x, 14); s.mode = 'land'; s.modeT = 0.55; s.y = G.floorY; }   /* missed: she overshoots and lands - low */
    return true; }
  if (s.mode === 'lift' || s.mode === 'hold') { const H = S.held;
    if (!H) { s.mode = 'rise'; s.modeT = SS.dive.rise; return true; }
    H.t += dt; const lip = SS.shock.edge + 30, hx = H.p2 ? s.x + (s.x < G.mid ? 1 : -1) * SS.p2.drift * dt : s.x;   /* (claude/rookery2: P2's SNATCH carries you across, higher) */
    fly(s, Math.max(G.x0 + lip, Math.min(G.x1 - lip, hx)), G.floorY - (H.p2 ? SS.p2.liftH : SS.grab.liftH) - SS.grab.hang, dt, s.mode === 'lift' ? 2.2 : 1.2);   /* over the summit floor, never over the lip */
    if (s.mode === 'lift' && s.modeT <= 0) { s.mode = 'hold'; s.modeT = SS.grab.hold - SS.grab.lift; }
    if (s.mode === 'hold' && s.modeT <= 0) { S.held = null; S.n.letGo++; if (w.letGo) w.letGo(s, H.pp, SS.grab.drop); s.mode = 'rise'; s.modeT = SS.dive.rise; }
    return true; }
  return false;
}
/* A STRIKE on the sister who holds you (the hands call it on each swing while held): enough of them and she lets go, KNOCKED DOWN */
export function strikeHeld(S, w) {
  const H = S.held; if (!H || S.clock - H.last < SS.grab.gap) return false; H.last = S.clock; H.strikes++;
  if (H.strikes < (H.p2 ? SS.p2.strikes : SS.grab.strikes)) return 'strike';
  const s = S.sis[H.by || 'snatcher']; S.held = null; S.n.freed++; s.y = S.G.floorY;
  if (H.p2) { S.n.p2Falls++; s.chain = null; s.mode = 'stuck'; s.modeT = SS.p2.stun; s.openT0 = s.modeT; s.purse = s.maxHp * SS.p2.cap; s.big = true; S.n.stuns++; if (w) { w.shake(8); w.sound('smash'); w.fx('open', s.x, s.y); w.number(s.x, s.y - 34, SS_SAY.fellBoth, '#ffd36b'); } return 'fall'; }   /* (claude/rookery2) P2: you fall together - she lands STUNNED */
  s.mode = 'downed'; s.modeT = SS.grab.free; s.openT0 = s.modeT; S.n.downs++; if (w) { w.number(s.x, s.y - 30, SS_SAY.free, '#8fd160'); w.sound('free'); }
  return 'free';
}
/* THE SNATCH (the first fall gives it to whoever has talons for it - the snatcher, else the diver): a low told sweep across the summit at your height */
function trySnatch(S, s, P, w) {
  if (!P || !P.alive || S.snatchCd > 0 || alive(S).length > 2 || s.ward > 0 || S.held || !teamClear(S, s)) return false;   /* (claude/rookery3: the stagger) */
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
export function takeBlow(s, dmg, plunge) {
  if (s.ward > 0 || s.mode === 'tear') return [Math.max(1, Math.round(dmg * SS.wardMul)), 'WARDED'];
  if (s.mode === 'stuck' && !(s.purse > 0)) return [Math.max(1, Math.round(dmg * SS.wardMul)), 'WARDED'];   /* (the stun paid in full: she is tearing free - B15's floor, never nothing) */
  if (s.mode === 'stuck') { const d = Math.round(dmg * SS.stun.mul), left = s.purse ?? Infinity; if (d >= left) { s.purse = 0; s.modeT = Math.min(s.modeT, 0.01); return [Math.max(1, Math.round(left)), null]; } s.purse = left - d; return [d, null]; }
  if (s.mode === 'downed') return [Math.round(dmg * SS.downK), null];
  if (s.mode === 'startled' && !(s.purse > 0)) return [Math.max(1, Math.round(dmg * SS.wardMul)), 'WARDED'];   /* (the corner paid in full: B15's floor) */
  if (s.mode === 'startled') { const d = Math.round(dmg * SS.ride.mul), left = s.purse ?? Infinity; if (d >= left) { s.purse = 0; s.modeT = Math.min(s.modeT, 0.01); return [Math.max(1, Math.round(left)), null]; } s.purse = left - d; return [d, null]; }   /* (claude/rookery2) CORNERED on her perch */
  if (LOW_MODES.has(s.mode) || plunge) return [Math.round(dmg), null];
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
  if (s.held) { out.gx = P.x; out.why = 'held: strike her'; if (seenFor('held' + (S.n.grabbed || 0))) out.atk = P.atk < 0; return out; }
  if (s.ride) { out.gx = P.x; out.why = 'riding to the perch'; return out; }   /* (claude/rookery2) */
  const dropping = sis.filter(q => q.mode === 'dropTell');
  const inHaz = x => S.rocks.some(c => Math.abs(x - c.x) < SS.rock.r + 10) || dropping.some(q => Math.abs(x - q.dropX) < SS.rock.r + 8) || sis.some(q => q.mode === 'echoTell' && q.echoX != null && Math.abs(x - q.echoX) < SS.echo.w / 2 + 8);
  const swing = fx => { out.face = Math.sign(fx - P.x) || out.face; out.atk = P.atk < 0; };
  /* 1. IN THE AIR: keep going */
  if (!P.ground && mem.jumpT !== undefined && t - mem.jumpT < 0.5) { out.gx = mem.jumpX; out.why = 'in the air'; const q = sis.find(z => Math.abs(z.x - P.x) < reach + 12 && z.y < P.y && P.y - z.y < 50); if (q) swing(q.x); return out; }
  /* 2. A BOULDER'S SHADOW ON ME (falling, or fixed and about to fall): off it (the side away from the summit's edge); the echo's shivering tile: off it */
  const rk = S.rocks.find(c => Math.abs(P.x - c.x) < SS.rock.r + 10);
  if (rk && seenFor('rk' + rk.key)) { out.gx = clamp(P.x + (P.x < rk.x ? -1 : 1) * (SS.rock.r + 22)); if (out.gx === P.x) out.gx = clamp(rk.x + (rk.x < G.mid ? 1 : -1) * (SS.rock.r + 22)); out.why = 'off the boulder\'s shadow'; return out; }
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
  const cr = cracks(S).filter(c => !inHaz(c.x)).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x));
  const onCrack = cr.find(c => Math.abs(c.x - P.x) < c.w / 2 - 4);
  const stepOff = (q, why) => { const d = (P.x < G.mid ? 1 : -1); let x = clamp(P.x + d * 46); if (inHaz(x)) x = clamp(P.x - d * 46); out.gx = x; out.why = why; return out; };
  if (diving) { if (s.shield && !onCrack && !roll('db' + diving.act, 0.55)) { out.block = true; out.face = Math.sign(diving.x - P.x) || 1; out.why = 'block the dive'; return out; }
    if (s.dodge && !roll('dd' + diving.act, 0.5)) { out.dodge = true; out.gx = clamp(P.x + (P.x < G.mid ? 1 : -1) * 40); out.why = 'roll out of the dive'; return out; }
    return stepOff(diving, 'out of the dive'); }
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
