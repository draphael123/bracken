import {breathCapacity} from './deepair.js';
import { AMBUSH_TARGET } from './ambush.js';
import { mulberry } from './px.js'; import { committed, COMMIT, artLim, artRate, ROLL_COST } from './commit.js';   /* bossLab seeds Math.random for the row it is about to fight - see the note over the loop in runbossLab */
// src/lab.js — THE FIGHT LAB and THE BOSS LAB.
// The playtest bot walks levels. These FIGHT, and measure what a player feels: how long a foe or a boss takes to
// kill, and how much of your health it costs. Both yield between fights, so a page can be polled while they run.
//   await BK.fightLab({ levels: ['wood', 'spire', 'waymeet'], heroes: [...], foes: [...], reps: 2 })   -> window.__lab
//   await BK.bossLab({ bosses: ['wood', 'kings', ...], heroes: [...] })                                -> window.__bossLab
import { MARK, HEIGHT } from './marks.js';
import { profileOf, SKILL_RANGE } from './bot-profile.js'; import { makePerception, makeSkillHands } from './lab-perceive.js';   /* (claude/bot2) WHO THE BOT IS (opts.profile; 'legacy' = the old bot, the default) and ITS EYES */
import { CHARGE_TELL } from './crouch-a.js';   /* THE CROUCH TWISTS, PART A (claude/croucha): what the warden sets her spear against */
import { FLIGHTS as SPIRAL_FLIGHTS, pendSafe as spiralPendSafe } from './spiral-chase.js';
import { boneGaps as mageBoneGaps, MAGE as UMAGE, orbitWorlds as mageOrbitWorlds } from './undead-mage.js';   /* (claude/archmage2b) the Undead Archmage's bone storm, for the carpet bot */   /* THE SPIRAL STAIR's flights, for chaseClimb (undead4) */
import { realmBox } from './mage-realms.js';   /* HIS SPELL REALMS' rooms, for the carpet bot (undead4) */
import { GEO as GEO_K } from './geomancer.js';
import { hiding as crouchHiding } from './crouch-b.js';   /* THE CROUCH TWISTS (claude/crouchb): what the geomancer's sense counts as hidden, so the bot's calm does not count it as near */   /* THE GEOMANCER's FAULT LINE: how far the crack will run is read off the same numbers the kit uses */
import { greenteethPlan, gtOpen } from './jenny-greenteeth.js';   /* JENNY GREENTEETH (claude/lockkeeper): the bot reads her rings, bands, hand and paddles off her own module */
import { OR } from './ore-road.js';   /* THE ORE ROAD's arena, for the Winchmaster's hands */
import { puppetPlan } from './puppeteer.js';
import { queenPlan, qOpen } from './cistern-queen.js'; import { glPlan, glOpen } from './gang-leader.js'; import { djinnPlan, djOpen } from './djinn.js';   /* (claude/welltown5) THE DJINN OF THE GREAT WELL: the bot works the skin on him, the crank and his hand */   /* THE CISTERN QUEEN and THE GANG LEADER (claude/welltown3): the bot reads their tells off their own modules, and works the skin */
import { gorgeCrabPlan, crabOpen } from './gorge-crab.js';   /* THE GREAT RED CRAB (claude/redgorge): the bot reads his tells, the dam's water and his channel off his own module, and works the sluice gate */
import { sweepFront as wqSweepFront } from './wicker-queen.js';   /* (claude/fairfix3) THE WICKER QUEEN's ribbon sweep, read off her own module */   /* THE PUPPETEER (claude/puppeteer): the bot reads the glowing strings, the tells and the batten off his own module */
import { WINCH as WM_K, winchFloors } from './winchmaster.js';   /* THE WINCHMASTER's phase three (claude/winch4): his reaches and the floors he fights on, read off his own module (winchFloors reads OR.ARENA) */   /* THE MARK TABLE: every red !! in it is a tell the bot steps out of, never guards */

// LAB_REACH is each hero's real reach (attackBox in main.js): how far the blow actually lands.
export const LAB_REACH = { knight: 22, pyro: 30, paladin: 24, pirate: 20, reaper: 29, warden: 40, geomancer: 24 };   /* (geomancer: the stone of her stave lands 21-26 out) */   /* her point lands at 44: the bot stands just inside it, where the TIP zone is */
/* LAB_STAND, THE HAND'S CHOSEN DISTANCE (BOT BUG A, Daniel, 2026-09-25: "stands one pixel outside its own reach").
   It used to be a second, independently hand-set table - close to LAB_REACH for six heroes, but off by only 2 px
   for the warden (stand 38, reach 40). The generic goal math (below, "desired") walks to boss.x +/- (LAB_STAND[h] +
   half the boss's width) and STOPS once it is within WALK_DEADBAND of that spot, so the hand can rest as far as
   LAB_STAND[h] + WALK_DEADBAND out - and on a flat floor, with nothing to make it hop closer, it often does. Once
   that rested distance passes LAB_REACH[h] the hand is parked outside its own swing and cuts at the air; the Reef
   lane found this on the Reefmaw's flat arena floor (claude/reef2) and fixed it for him alone, standing his hands
   six pixels further in. It was never his bug: it is this formula, for every hero and every boss that uses it.
   LAB_STAND is now DERIVED from LAB_REACH, not hand-set beside it, so the rested distance (stand + deadband) can
   never reach the edge of the swing: STAND_MARGIN leaves two pixels of reach still spare after the deadband. */
export const WALK_DEADBAND = 4;   /* exported for tools/lab-reach.mjs: the worst-case rested distance is LAB_STAND + WALK_DEADBAND, and that is the distance a reach check has to prove, not LAB_STAND alone */
const STAND_MARGIN = 6;   /* > WALK_DEADBAND, so the worst rested spot (stand + deadband) is still 2 px inside reach */
export const LAB_STAND = Object.fromEntries(Object.keys(LAB_REACH).map(h => [h, LAB_REACH[h] - STAND_MARGIN]));
export const LAB_FOES = ['sprig', 'shield', 'swornsword', 'archer', 'hedgeknight', 'cutlass', 'harpy', 'crab', 'tideguard', 'scout'];
const HEROES = ['knight', 'warden', 'pyro', 'paladin', 'pirate', 'reaper'];
/* THE CO-OP ALLY IS THIS BOT. main.js imports threatOf, SHIELDED and HARD_TELLS below and plays a hero
   with them, so the ally and the labs answer a wind-up by ONE set of rules. When two files answer the same question
   one of them is wrong and nobody knows which - so there is one, and it lives here with the bot that earned it. */
export const threatOf = e => e.alive && ((e.mode && /Tell|tell|wind|aim|draw|charge|lunge|raise/.test(e.mode)) || e.draw > 0 || e.liftT > 0);
const yieldNow = () => new Promise(r => setTimeout(r, 0));
export const SHIELDED = h => h === 'knight' || h === 'paladin' || h === 'reaper' || h === 'geomancer';   // C holds a guard; the others roll (THE GEOMANCER's RUNE-WARD, round 3: a held guard like his)
/* THE WARDEN'S C IS NOT A GUARD EITHER. It is a TAP - a sweep of the shaft that turns any yellow blow met on the beat
   and swats what flies at her - so the bot answers anything the marks do not call red with it, and gives ground from
   the rest. It is edge-triggered, so the bot must let the key UP again between sweeps: DEFLECT_TAP is that beat.
   (Her dodge goes BACKWARD by itself, so the bot never has to aim it.) */
export const DEFLECT_TAP = f => f % 8 < 2;
export const WARDEN_TIP = 32;   /* (claude/herokit) the near-edge distance the warden's point pays at (tipPay: TIP_AT 28 .. her reach 44): the plans' 'cut him' spots stood her at 0.6 of her reach, inside the shaft, and she only shoved and glanced */
/* AND ON THE BEAT. A sweep is live a quarter second and then a quarter second spent, so tapping all through a long wind-up leaves half of
   it bare - measured: a hedge knight's swing landed on the spent half one fight in three. A common foe's tell counts its modeT down to
   the blow, so she holds the sweep until the last fifth of a second of it (a tell that keeps no such clock is swept at as before). */
/* A BROKEN OR PINNED FOE IS NOT SWINGING. Its AI stands still (main.js skips it) with its wind-up frozen where it was, so its mode still
   reads as a tell - and the bot that broke a brute with a heavy blow then stood behind its shield for the whole of the opening. Until the
   last third of a second of it, that is time to cut, not to guard. (The boss lab keeps threatOf as it was: its numbers are its own.) */
/* THE UNIVERSAL DUCK, in the hands (claude/duck): a HIGH blow told at the hero (src/marks.js HEIGHT) is ducked - down held, nothing
   else - from the last 0.3 s of its windup until it has gone over (its blow's own mode, or a high arrow still in the air at him). A
   RED high blow (a crow, the gaff's hook) is ducked by every hero; a yellow one by the heroes with no held guard (the warden, the
   pyromancer, the freebooter), since a guard already turns it and a guard turned is the knight's opening. */
export function duckNow(BK, h, e) { const D = BK.duck && BK.duck(), P = BK.P; if (!D || !e || !e.alive || !P.ground || P.swim || P.climb || P.dead) return false;
  const near = Math.abs(e.x - P.x) < 120 && Math.abs(e.y - P.y) < 40, red = BK.markOf(e) === '!!';
  if (!red && SHIELDED(h)) return false;
  if (near && BK.telling(e) && D.height(e) === 'high' && (e.t === 'archer' || !(e.modeT > 0.3))) return true;
  if (near && D.high(e) && e.blowMode && e.mode === e.blowMode) return true;
  return !SHIELDED(h) && BK.seeds().some(s => s.high && !s.dead && !s.reflected && Math.abs(s.x - P.x) < 56 && Math.abs(s.y - (P.y - 8)) < 20 && (s.x - P.x) * (s.vx || 0) < 0 && Math.abs(s.vy || 0) <= Math.abs(s.vx || 0) * 0.8); }
/* THE EMBER WARD, in the hands (claude/ember-ward): the pyromancer's crouch is a dome of fire that turns a YELLOW blow and melts what flies
   into it (src/ember-ward.js). emberPlan says, for one frame against one foe:
     'raise' - hold down: a yellow windup near her is in its last EMBER_LATE s (raised then, the blow lands inside the perfect window and
               the ward FLARES), or the ward is up and the blow is landing (held EMBER_HOLD s at least: the swing lands a beat after the
               windup), or a yellow projectile is EMBER_LATE s from the dome
     'wait'  - a yellow windup near her, not yet in its last beat: stand still for it (the common-foe frame; a boss frame keeps its own plan)
     null    - nothing for the ward: the ward heat is at EMBER_HOT (a block or two from overheating, which staggers her), it is locked, she is
               in water or off her feet - then she does what she did before (the roll)
   The duck (duckNow) is left as it was: a HIGH yellow blow is still ducked early, and ducked is warded - it goes over her for nothing. */
export const EMBER_LATE = 0.1, EMBER_HOT = 70, EMBER_HOLD = 0.45;
export const emberReady = (BK, h) => { if (h !== 'pyro' || !BK.ember) return false; const W = BK.ember(), P = BK.P; return !!W && !(W.rec > 0) && !(W.spent > 0) && !W.wet && P.ground && !P.swim && !P.dead; };   /* (the flare: not in a mistime's recovery, not in the beat after a catch) */
export function emberPlan(BK, h, e) {
  if (!emberReady(BK, h)) return null; const P = BK.P, W = BK.ember();
  if (W.up && W.t < EMBER_HOLD) return 'raise';
  if (e && e.alive && Math.abs(e.x - P.x) < 80 + (e.w || 12) / 2 && Math.abs(e.y - P.y) < 40 && BK.markOf(e) === '!') {
    if (BK.telling(e) || /Tell$/.test(e.mode || '')) return typeof e.modeT !== 'number' || e.modeT <= EMBER_LATE || W.up ? 'raise' : 'wait';   /* (a boss's windup is its ...Tell mode) */
    if (W.up && W.t < 0.9 && e.blowMode && e.mode === e.blowMode) return 'raise'; }
  return BK.seeds().some(s => !s.dead && !s.reflected && !s.noBlock && !s.unblockable && !s.chain && (s.x - P.x) * (s.vx || 0) < 0 && Math.abs(s.y - (P.y - 6)) < 22
    && Math.abs(s.x - P.x) < 18 + Math.max(10, Math.abs(s.vx || 0) * EMBER_LATE)) ? 'raise' : null; }
export const emberNow = (BK, h, e) => emberPlan(BK, h, e) === 'raise';
/* THE CROUCH TWISTS, PART B, in the hands (claude/crouchb, src/crouch-b.js). Each is a crouch that leaves the hero exposed, so the bot
   only ever does it when it is CALM (crouchCalm): nothing that can hurt him within CRB_CALM px on his level, nothing telling within
   CRB_TELL px, nothing thrown at him within 140 px, his feet on dry ground. crouchBPlan says, for one frame:
     'down'          - hold down where he stands:
                         the PALADIN kneels while his light is under CRB_LOW (and once down, until it is full, while it stays calm)
                         the GEOMANCER takes a LOOK (CRB_LOOK s) when she has not looked for CRB_EVERY s - in the labs a calm moment
                         after a fight or on coming into a room is where a section starts
                         the DEATH KNIGHT, over a body he has not drawn, draws it
     'left'/'right'  - the death knight walks to a body within CRB_WALK px (health or blood not full)
     null            - nothing: it is not calm, or there is nothing to do */
export const CRB_CALM = 130, CRB_TELL = 220, CRB_LOW = 50, CRB_LOOK = 0.5, CRB_EVERY = 8, CRB_WALK = 64;
export function crouchCalm(BK) { const P = BK.P;
  if (!P.ground || P.swim || P.climb || P.dead || P.atk >= 0 || P.dodge > 0 || (P.hurt || 0) > 0 || (BK.L.pools || []).some(q => !q.dry && P.x > q.x0 && P.x < q.x1 && P.y > q.y + 1 && (q.bottom === undefined || P.y <= q.bottom + 4))) return false;
  for (const e of BK.enemies()) { if (!e.alive || e.harmless || crouchHiding(e)) continue; const ad = Math.abs(e.x - P.x), dy = Math.abs(e.y - P.y);
    if (ad < CRB_CALM && dy < 60) return false; if (ad < CRB_TELL && dy < 90 && (BK.telling(e) || /Tell$/.test(e.mode || ''))) return false; }
  return !BK.seeds().some(s => !s.dead && !s.reflected && Math.hypot(s.x - P.x, s.y - (P.y - 8)) < 140); }
export function crouchBPlan(BK, h) {
  if (h !== 'paladin' && h !== 'geomancer' && h !== 'reaper') return null; const C = BK.crouchB && BK.crouchB(); if (!C) return null;
  const P = BK.P; P.crbF = (P.crbF || 0) + 1;
  if (!crouchCalm(BK)) { P.crbLook = 0; return null; }
  if (h === 'paladin') return (P.light || 0) < (C.praying ? 100 : CRB_LOW) ? 'down' : null;
  if (h === 'geomancer') { if (P.crbLook > 0) { P.crbLook--; return 'down'; }
    if (P.crbF - (P.crbLookAt ?? -1e9) > CRB_EVERY * 60) { P.crbLookAt = P.crbF; P.crbLook = Math.round(CRB_LOOK * 60); return 'down'; } return null; }
  if ((P.hp >= P.maxHp && (P.harvest || 0) >= 100) || !C.bodies.length) return null;
  let b = null; for (const q of C.bodies) if (Math.abs(q.x - P.x) < CRB_WALK && q.y - P.y > -20 && q.y - P.y < 6 && (!b || Math.abs(q.x - P.x) < Math.abs(b.x - P.x))) b = q;
  if (!b) return null; return Math.abs(b.x - P.x) <= 6 || C.drawing ? 'down' : b.x > P.x ? 'right' : 'left'; }
/* the hands for it: only the keys it names, every other action key let go (false, and nothing pressed, for no plan) */
export function crouchBKeys(BK, plan) { if (!plan) return false; const k = BK.keys; k.atk = k.block = k.jump = k.up = false; k.down = plan === 'down'; k.left = plan === 'left'; k.right = plan === 'right'; if (plan === 'down') BK.unpress(); return true; }
/* THE CROUCH TWISTS, PART A, in the hands (claude/croucha, src/crouch-a.js). Each says, for one frame against one foe, "hold down":
     lowGuardNow  - THE KNIGHT: a YELLOW blow that is not a high one (a high one goes over him anyway), told near him and in its last
                    LOW_LATE s, or landing now - he takes it on the low guard (no step back, so he is still in reach to answer) instead
                    of standing up behind the shield. Not on a nearly empty bar (the low guard costs a raised shield's wind, and out
                    of it the guard breaks). His crouched X is the SHIELD TRIP: the family table's sweep, when he is stood still for it
     setSpearNow  - THE WARDEN: a YELLOW charge (a tell CHARGE_TELL names) told in front of her, or the run itself coming at her - she
                    sets the spear and it runs onto the point. Her crouched X is the LOW POKE, under a shield (the table's sweep again)
     reloadCrouchNow - THE FREEBOOTER: the pistol empty and the foe well out of the cutlass's reach and walking in on him - he kneels
                    and reloads (twice as fast) while it comes, and the loaded pistol is then the table's heavy from range. (He does
                    NOT wind the pistol from the crouch: on three pinned Kennel Yard seeds that cost him 12-29 more taken - knelt to
                    aim in front of the room, the low blows find him - so the STEADY shot is the player's, not the bot's) */
export const LOW_LATE = 0.35;
export function lowGuardNow(BK, h, e) {
  if (h !== 'knight' || !BK.crouchA || !e || !e.alive) return false; const P = BK.P, C = BK.crouchA();
  if (!C || !P.ground || P.swim || P.climb || P.dead || P.st < 16 || P.atk >= 0 || P.dodge > 0 || HELD(e)) return false;
  if (Math.abs(e.x - P.x) > 64 + (e.w || 12) / 2 || Math.abs(e.y - P.y) > 30) return false;
  if (BK.telling(e)) return BK.markOf(e) === '!' && BK.duck().height(e) !== 'high' && !(typeof e.modeT === 'number' && e.modeT > LOW_LATE);
  const k = e.toldK; return !!(k && MARK[k] === '!' && HEIGHT[k] !== 'high' && C.now - (e.toldAt ?? -9) < 0.2); }
export function setSpearNow(BK, h, e) {
  if (h !== 'warden' || !BK.crouchA || !e || !e.alive) return false; const P = BK.P, C = BK.crouchA();
  if (!C || !P.ground || P.swim || P.climb || P.dead || P.atk >= 0 || P.dodge > 0 || HELD(e)) return false;
  if (Math.abs(e.x - P.x) > 110 || Math.abs(e.y - P.y) > 30) return false;
  if (BK.telling(e)) return BK.markOf(e) === '!' && CHARGE_TELL.test(String(e.mode || ''));
  const k = e.toldK; return !!(k && MARK[k] === '!' && CHARGE_TELL.test(k.split('|')[1] || '') && e.blowMode && e.mode === e.blowMode && (e.x - P.x) * (e.vx || 0) < 0 && C.now - (e.toldAt ?? -9) < 1.5); }
export function reloadCrouchNow(BK, h, e) {
  if (h !== 'pirate' || !BK.crouchA) return false; const P = BK.P;
  if (P.loaded || !P.ground || P.swim || P.climb || P.dead || P.atk >= 0 || P.dodge > 0) return false;
  if (!e || !e.alive) return true;
  const d = e.x - P.x, ad = Math.abs(d);   /* only while it comes to him: a shooter that keeps its distance is walked in on, as before */
  return ad > LAB_REACH.pirate + (e.w || 12) / 2 + 40 && ad < 170 && d * (e.vx || 0) < 0 && Math.abs(e.vx || 0) > 12 && Math.abs(e.y - P.y) < 30 && !BK.telling(e); }
export const HELD = e => (e.broken || 0) > 0.3 || (e.pinned || 0) > 0.3;
/* FIRE ON THE GROUND, under x (a sapper's pot, a burning stake): the fire hurts inside nine pixels of it, so the bot keeps fourteen off.
   A bot that plants its feet to wind a heavy or stands off to shoot was measured standing in one for four ticks of it in the Stockade's room */
export const fireAt = (BK, x, y) => BK.fires ? BK.fires().find(q => !(q.delay > 0) && Math.abs(q.x - x) < 14 && y > q.y - 14 && y <= q.y + 2) : null;
export const ON_THE_BEAT = e => !(typeof e.modeT === 'number' && e.modeT > 0.2 && e.modeT < 5);
/* THE KNIGHT SPENDS HIS BAR. A full RESOLVE is THE LAST CHARGE on a tap of C with his feet under him - so the bot taps it (C not
   already held, or it is not a tap) when the foe is in front of him, inside a charge's run and on his level. A bot that never
   spent it would measure a knight who never charges. */
/* THE KNIGHT'S HELD SWING IS THE HEAVY CUT (2026-09-23): it comes down when it is LET GO, at whatever stage it reached, and never by
   itself until 1.8 s - so a bot that held X until something fired stood there with the sword up. The bot lets go at the chop, or at the guard-break on anything with a bar. */
export const KNIGHT_CUT = 0.72, knightCutAt = e => e && (e.maxHp || e.elite || e.mini) ? KNIGHT_CUT : 0.32;   /* a thing with a bar (a duelist, an elite, a boss) is worth the guard-break; the rest take the chop, which is sooner (measured: fightLab, 2026-09-23) */
export const LAST_CHARGE = (P, ad, dy) => (P.resolve || 0) >= 100 && P.ground && !P.cWas && !(P.lcBrace > 0) && !(P.lcLeft > 0) && ad < 140 && Math.abs(dy) < 24;

/* THE KEY VERB. The family table in main.js (FAMILY, read through BK.keyOf) says what each common body wants: the right tool lands half
   as hard again and the wrong one GLANCES. A bot that only cut and blocked was left chipping at plate and bouncing off shields - and it
   is the co-op ally - so it asks the table, one verb per body, the plainest one each hero has:
     guard  - the DASH ATTACK from outside its reach: the table's head-on answer, it throws the guard OFF BALANCE and every cut after is open;
              already inside its reach (or the dash still cooling), the LOW SWEEP under it; the held HEAVY while it cannot be tripped again
     plate, shell, beast - the held HEAVY
     small  - the LOW SWEEP          wing - the RISING CUT          shooter, crew - the DASH ATTACK, from just outside reach
   and whatever is OPEN (tripped, broken, reeling) takes the plain cut, which is quickest. Per hero: the freebooter's heavy is his pistol, so
   loaded he shoots from pistol range and otherwise uses his blade; his and the death knight's heavies go over the low mimic, so
   they plunge it; the warden's rise goes over the haunt, so she cuts wings plain; under water there is no sweep and no dash, only the cut. */
export function keyVerb(BK, h, e) {
  const P = BK.P, K = BK.keyOf ? BK.keyOf(e) : null;
  if (P.charge > 0 || P.atkHeld > 0) return 'heavy';   /* a blow being wound is finished, not dropped for another */
  if (!K || K.open) return 'light';
  const f = K.family, swim = !!P.swim;
  if (h === 'pirate' && P.loaded && f !== 'small' && e.t !== 'mimic' && Math.abs(e.x-P.x)>LAB_REACH[h]+(e.w||12)/2+12) return 'heavy';
  if ((h === 'pirate' || h === 'reaper') && e.t === 'mimic') return swim ? 'light' : 'plunge';
  if (f === 'guard') { const ad = Math.abs(e.x - P.x), reach = LAB_REACH[h] + (e.w || 12) / 2;
    if (!swim && (P.dash > 0 || P.dashAtk > 0 || (ad > reach + 4 && !(P.dashCd > 0)))) return 'dash';   /* (and a dash under way is seen through) */
    return K.tripped || swim ? (h === 'pirate' ? 'light' : 'heavy') : 'sweep'; }
  // A loaded pistol was selected above. An empty one cannot execute a heavy attack.
  if (f === 'plate' || f === 'shell' || f === 'beast') return h === 'pirate' ? 'light' : 'heavy';
  if (f === 'small') return swim ? 'light' : 'sweep';
  if (f === 'wing') return h === 'warden' ? 'light' : 'rise';
  if (f === 'shooter' || f === 'crew') return swim ? 'light' : 'dash';
  return 'light';
}
/* WHERE EACH VERB WANTS TO STAND, in pixels from the foe: inside reach for a cut (and a dash, which is taken on the way in), a step out for the knight's charge and for the warden's lunge (it drives her a tile on, and must end with the point on it), well out of its reach for the freebooter's pistol (it carries 150 px), on top of it for a plunge */
/* (the geomancer: her held X is FAULT LINE, a crack along the floor 22-160 px long by the wind - so she winds it from where she stands and lets go when the crack will reach the foe: see strike) */
export const wantOf = (h, e, verb) => { const reach = LAB_REACH[h] + (e.w || 12) / 2; return verb === 'plunge' ? 0 : verb === 'heavy' ? (h === 'knight' ? reach + 2 : h === 'warden' ? reach + 12 : h === 'geomancer' ? reach + 20 : h === 'pirate' ? Math.min(120,reach+80) : reach - 4) : reach - 2; };
/* THE HANDS FOR IT: one frame of whichever verb keyVerb chose. It presses and holds the action keys only (attack, up, down, jump, and the
   double tap of a dash) and never lets one go (whoever calls it clears them first), and leaves the walking to whoever called it (wantOf).
   Every one of them waits on the wind it costs: a bot that swung on an empty bar would stand there winded in front of the thing. */
export function strike(BK, h, e, f) {
  const P = BK.P, k = BK.keys, d = e.x - P.x, ad = Math.abs(d), dir = Math.sign(d) || P.face, dy = e.y - P.y;
  const reach = LAB_REACH[h] + (e.w || 12) / 2, cost = BK.stepCost ? BK.stepCost() : 12, verb = keyVerb(BK, h, e);
  const S = P.kvBot || (P.kvBot = { tap: -99 }), want = wantOf(h, e, verb); if (f < S.tap) S.tap = -99;   /* (a new fight counts its frames from nought) */
  let swing = 0;
  const level = Math.abs(dy) < 26, free = P.atk < 0 && !P.plunge && !(P.rush > 0);
  if (verb === 'heavy') {
    const winding = P.charge > 0 || P.atkHeld > 0;
    if (h === 'knight' && winding && P.atkHeld >= knightCutAt(e)) { /* let go: THE HEAVY CUT comes down */ }
    else if (h === 'geomancer' && P.charge > 0 && GEO_K.fault.len0 + GEO_K.fault.lenK * Math.min(1, P.charge / GEO_K.wind) >= ad - (e.w || 12) / 2 + 4) { /* let go: the crack will run past his near edge */ }
    else if (winding || (free && !P.heavy && ad < want + 4 && (h !== 'pirate' || ad > reach + 12) && level && (P.ground || P.swim) && P.st >= (BK.heavyCost ? BK.heavyCost() : 26) + 2)) { k.atk = true; if (!winding) swing = 1; }
    else if (free && ad < reach && level && P.st < 20 && P.st >= 8 && h !== 'pirate') { BK.press('atk'); swing = 1; }   /* no wind for a heavy: a plain cut rather than standing idle */
  } else if (verb === 'sweep' || verb === 'rise') {
    if (free && ad < reach && level && (P.ground || P.swim) && P.st >= cost + 4) { k[verb === 'sweep' ? 'down' : 'up'] = true; BK.press('atk'); swing = 1; }
  } else if (verb === 'plunge') {
    if (P.ground && ad < reach + 10 && level && P.st >= cost + 6) { k.jump = true; BK.press('jump'); }
    else if (!P.ground && !P.plunge && P.atk < 0 && P.vy > -80 && ad < (e.w || 12) / 2 + 6 && P.y < e.y - (e.h || 16) + 6) { k.down = true; BK.press('atk'); swing = 1; }
    else if (!P.ground && P.vy < 0) k.jump = true;
  } else if (verb === 'dash') {
    /* ON THE WAY IN: walking up to it, and a dash's length out with the wind for it, tap toward it twice and cut while the dash carries.
       A bot that stood off waiting for the dash to come round was measured: it gave an archer ten seconds of free shots. Once in reach it cuts. */
    if ((P.dash > 0 || P.dashLate > 0) && P.atk < 0 && P.st >= cost) { BK.press('atk'); swing = 1; }
    else if (f - S.tap === 2 && P.ground) { BK.press(dir > 0 ? 'right' : 'left'); k[dir > 0 ? 'right' : 'left'] = true; k[dir > 0 ? 'left' : 'right'] = false; }
    else if (free && P.ground && !(P.dashCd > 0) && ad > reach + 4 && ad < reach + 40 && level && P.st >= cost + 22 && f - S.tap > 20)   /* (the wind for the dash, the swing and the dash attack's own cost on top) */ { S.tap = f; BK.press(dir > 0 ? 'right' : 'left'); k[dir > 0 ? 'right' : 'left'] = true; k[dir > 0 ? 'left' : 'right'] = false; }
    else if (ad < reach && free && level && P.st >= 8 && f - S.tap > 6) { BK.press('atk'); swing = 1; }   /* already on it: the plain cut, not a step back into its blade */
  } else if (free && ad < reach && level && P.st >= 8) { BK.press('atk'); swing = 1; }
  return { verb, want, swing };
}

/* ONE FRAME OF THE LAB BOT against one foe: close to where its key verb wants it and strike; on a windup, defend the way the hero does.
   The fight lab and the ambush lab both play with it, so a room and a single foe are measured by the same hands */

// Find an actual edge of the shelf above the foe, not merely a sword's distance from its centre.
function lowerFooting(BK, e, T, avoidTarget = true) {
  const P = BK.P, L = BK.L, ty = Math.floor(P.y / 16), ey = Math.floor(e.y / 16), px = Math.floor(P.x / 16);
  const floors = Object.values(T).filter(t => t !== T.AIR && t !== T.SPIKE);
  let best = null, score = Infinity;
  for (let x = Math.max(1, px - 20); x <= Math.min(L.W - 2, px + 20); x++) {
    if (BK.enemies().some(q => (avoidTarget || q !== e) && q.alive && !q.harmless && Math.abs(q.y - e.y) < 32 &&
      Math.abs(x * 16 + 8 - q.x) < (q.w || 16) / 2 + (P.w || 10) / 2 + 20)) continue;
    let clear = true;
    for (let y = ty; y < ey; y++) if (L.grid[y * L.W + x] !== T.AIR) { clear = false; break; }
    if (!clear || !floors.includes(L.grid[ey * L.W + x])) continue;
    const cost = Math.abs(x * 16 + 8 - P.x) + 2 * Math.abs(x * 16 + 8 - e.x);
    if (cost < score) { score = cost; best = x * 16 + 8; }
  }
  return best ?? e.x + (Math.sign(P.x - e.x) || 1) * ((e.w || 16) / 2 + 24);
}
function labBotFrame(BK, h, e, f) {
  const P = BK.P, k = BK.keys; let defend = 0, swing = 0;
  const d = e.x - P.x, ad = Math.abs(d); if (!(P.dash > 0) && !(P.rush > 0)) P.face = Math.sign(d) || P.face;
  const threat = threatOf(e) && !HELD(e) && ad < 70 && Math.abs(e.y - P.y) < 50;
  k.left = false; k.right = false; k.block = false; k.atk = false; k.up = false; k.down = false; k.jump = false;
  if (h === 'reaper') { k.throw = P.harvest >= 100; if (k.throw && !(P.fHeld > 0)) BK.press('throw'); }   /* HOLD F on a full bar: the surge */
  if (duckNow(BK, h, e)) { defend = 1; k.down = true; BK.unpress(); }   /* THE DUCK: a high blow goes over (duckNow) */
  else if (emberPlan(BK, h, e)) { defend = 1; k.down = emberPlan(BK, h, e) === 'raise'; BK.unpress(); }   /* THE EMBER WARD: stood still for a yellow windup and raised in its last beat, to flare (emberPlan) */
  else if (lowGuardNow(BK, h, e) || setSpearNow(BK, h, e)) { defend = 1; k.down = true; BK.unpress(); }   /* THE KNIGHT'S LOW GUARD, THE WARDEN'S SET SPEAR (src/crouch-a.js) */
  else if (crouchBKeys(BK, crouchBPlan(BK, h))) { /* nothing more */ }   /* THE CROUCH TWISTS: calm, the paladin kneels for light, the geomancer looks, the death knight draws a body (crouchBPlan) */
  else if (threat && P.atk < 0 && !(P.dash > 0)) {
    defend = 1;   /* (a heavy half wound goes if it can, and is dropped if it cannot) */
    if (HARD_TELLS.has(e.t + '|' + e.mode)) { k[d > 0 ? 'left' : 'right'] = true; if (f % 14 === 0) BK.press('dodge'); }
    else if (h === 'pyro') { if (f % 20 === 0) { k[d > 0 ? 'left' : 'right'] = true; BK.press('dodge'); } }
    else if (h === 'pirate') { if (f % 12 === 0) k.block = true; }
    else if (h === 'warden') { if (HARD_TELLS.has(e.t + '|' + e.mode)) { if (f % 14 === 0) BK.press('dodge'); } else k.block = ON_THE_BEAT(e) && DEFLECT_TAP(f); }
    else k.block = true;
  } else if (reloadCrouchNow(BK, h, e)) { k.down = true; }   /* THE FREEBOOTER DUCKS AND RELOADS, well out of the cutlass's reach */
  else {
    const s = strike(BK, h, e, f); swing = s.swing;
    /* THE WARDEN KEEPS HER POINT OUT: inside the haft she only shoves, so she steps back out of it (her step goes backward by itself) */
    if (h === 'warden' && ad < 20 && P.atk < 0 && !(P.charge > 0) && !(P.dodge > 0) && P.st >= 20 && f % 10 === 0) BK.press('dodge');
    if (!k.left && !k.right && !(P.charge > 0) && !(swing && s.verb === 'sweep' && (h === 'knight' || h === 'warden'))) { if (h === 'pirate' && s.verb === 'heavy' && ad < s.want - 8) k[d > 0 ? 'left' : 'right'] = true; else if (ad > s.want + 2) k[d > 0 ? 'right' : 'left'] = true; else if (s.verb === 'plunge' && !P.ground && ad > 3) k[d > 0 ? 'right' : 'left'] = true; }
  }
  { const fire = fireAt(BK, P.x, P.y); if (fire && !(h === 'pyro')) { const away = Math.sign(P.x - fire.x) || -Math.sign(d) || 1; k.left = away < 0; k.right = away > 0; k.atk = false; k.block = false; } }   /* (her own fire does not burn her) */
  if (h === 'knight' && !threat && !k.atk && !(P.charge > 0) && LAST_CHARGE(P, ad, e.y - P.y)) { k.left = false; k.right = false; k.block = true; }
  return { defend, swing };
}

// THE AMBUSH LAB. Each hero into each level's ambush room, played straight: walk in, fight whatever of the room is nearest (its
// elite when nothing else is closer), defend on its tells. The hero's health is put back each frame and what the room took is
// counted. It reports how long the room took to open (section Q rule 4: 15 to 35 seconds), how long its elite stood, and
// whether killing the captain opened it; surviving minions are allowed to flee.
//   await BK.ambushLab({ levels: ['stockade'], heroes: [...], reps: 1 })   -> window.__ambushLab
export async function ambushLab(BK, opts = {}) {
  const previous = BK.manualSimulation;
  BK.manualSimulation = true;
  try { return await runambushLab(BK, opts); }
  finally { BK.manualSimulation = previous; }
}
async function runambushLab(BK, opts) {
  const lvm = await import('./level.js');
  const heroes = opts.heroes || HEROES, levels = opts.levels || ['stockade'], reps = opts.reps || 1, maxSecs = opts.maxSecs || 150;
  const rows = [], out = { rows, started: Date.now() };
  if (typeof window !== 'undefined') window.__ambushLab = out;
  for (const lvId of levels) for (const h of heroes) for (let rep = 0; rep < reps; rep++) {
    BK.setHero(h); BK.reset({ fresh: true }); BK.load(lvm.LEVELS.findIndex(l => l.id === lvId)); BK.start(); BK.god = false; BK.sim(300);
    const A = BK.ambushes()[opts.room || 0]; if (!A) { rows.push({ lvl: lvId, h, skipped: 'no ambush room' }); continue; }
    const P = BK.P, k = BK.keys, x0 = A.trigger !== undefined ? A.trigger : A.wallL + 3, mid = (A.wallL + A.wallR) / 2 * 16 + 8;
    for (const e of BK.enemies()) if (Math.abs(e.x - mid) < (A.wallR - A.wallL + 30) * 8 && !e.maxHp) e.alive = false;   /* the level's own creatures by the door are not the room's */
    P.ambLandX=undefined;P.ambLandSide=0;P.ambJump=0;P.ambRest=false;BK.tp(x0 + 1, A.row); P.hp = P.maxHp; P.st = P.maxSt; P.inv = 0;
    let f = 0, taken = 0, last = P.hp, elite = null, eliteSecs = null, eliteFrom = null, shutAt = null, waveAt = 0, slow = null;
    const spd = BK.SET.speed || 1, maxF = Math.round(maxSecs * 60 / spd);
    for (; f < maxF && A.st !== 'done'; f++) {
      if (P.hp < last) taken += Math.min(60, last - P.hp); P.hp = P.maxHp; last = P.hp; if (P.dead) break;
      if (A.st && shutAt === null) shutAt = f;
      const foes = (A.foes || []).filter(e => e.alive);
      if (A.st !== 'fight') waveAt = f;
      else if (!slow && (f - waveAt) * spd / 60 > AMBUSH_TARGET.max) slow = 'captain still up at ' + AMBUSH_TARGET.max + ' s: ' + foes.map(e => e.t + (e.elite ? '*' : '')).join(', ');   /* what a room that runs long is waiting on */
      if (!elite) { elite = foes.find(e => e.elite) || null; if (elite) eliteFrom = f; }
      if (elite && eliteSecs === null && !elite.alive) eliteSecs = +((f - eliteFrom) * spd / 60).toFixed(1);
      if(P.st<12)P.ambRest=true;if(P.st>=48)P.ambRest=false;
      const e = A.st === 'fight' && A.leader?.alive ? A.leader : null;
      if(P.ambRest){k.atk=k.block=k.up=k.down=false;}
      else if (e && e.y <= P.y+18) labBotFrame(BK, h, e, f);
      else if (crouchBKeys(BK, crouchBPlan(BK, h))) { /* nothing more */ }   /* (between waves, calm: the crouch twists, crouchBPlan) */
      else { k.block = false; k.left = P.x > mid + 20; k.right = P.x < mid - 20; }   /* between waves: to the middle of the room */
      if(e&&e.y>P.y+18){P.ambLandSide=P.ambLandSide||Math.sign(P.x-e.x)||1;if(P.ambLandX!==undefined&&BK.enemies().some(q=>q.alive&&!q.harmless&&Math.abs(q.y-e.y)<32&&Math.abs(q.x-P.ambLandX)<(q.w||16)/2+25))P.ambLandX=undefined;const gx=P.ambLandX??(P.ambLandX=lowerFooting(BK,e,lvm.T));k.left=P.x>gx+4;k.right=P.x<gx-4;k.up=k.down=k.jump=k.block=k.atk=false;if(P.ground&&[lvm.T.ONEWAY,lvm.T.PLANK,lvm.T.SHELF,lvm.T.RAIL].includes(P.groundTile)){k.down=true;BK.press('jump');P.ambLandX=undefined;}}else{P.ambLandSide=0;P.ambLandX=undefined;if(e&&e.y<P.y-24){k.left=e.x<P.x;k.right=e.x>P.x;k.block=false;}}
      /* A PLAYER JUMPS THE ROOM'S OWN PIT. The fight lab's bot fights on a flat floor and walked straight into THE CLIFF HALL's
         spikes after a sprig, and sat in them: it hops a gap or a spike a tile ahead of it, and hops out of one it is in */
      { const dir = k.right ? 1 : k.left ? -1 : 0, G = BK.L, at = (tx, ty) => G.grid[ty * G.W + tx], ty = Math.floor((P.y + 2) / 16);
        const bad = tx => at(tx, ty) === lvm.T.AIR || at(tx, ty) === lvm.T.SPIKE || at(tx, ty - 1) === lvm.T.SPIKE;
        const inPit = [-5, 0, 5].some(ox => at(Math.floor((P.x + ox) / 16), Math.floor((P.y - 4) / 16)) === lvm.T.SPIKE || at(Math.floor((P.x + ox) / 16), Math.floor((P.y + 2) / 16)) === lvm.T.SPIKE);
        if (inPit) { const out = at(Math.floor((P.x - 24) / 16), ty - 1) === lvm.T.SOLID ? 1 : -1; k.left = out < 0; k.right = out > 0; k.block = false; k.jump = true; if (f % 6 === 0) BK.press('jump'); }
        else if (dir && P.ground && !(e&&e.y>P.y+18) && bad(Math.floor((P.x + dir * 12) / 16))) { k.jump = true; BK.press('jump'); } else k.jump = false; }
      if(P.ground && (k.left||k.right) && (Math.abs(P.vx)<4 || (e&&e.y<P.y-18)) && f%12===0){BK.press('jump');P.ambJump=28;}
      if(e&&e.y>P.y+24){P.ambJump=0;k.jump=false;}
      else if(P.ambJump>0){P.ambJump--;k.jump=true;}
      if(P.st<12)P.ambRest=true;if(P.st>=48)P.ambRest=false;
      if(P.ambRest){k.atk=k.block=k.up=k.down=false;const wet=(BK.L.pools||[]).some(q=>P.x>q.x0&&P.x<q.x1&&P.y>q.y);if(wet&&P.ground){BK.press('jump');P.ambJump=28;}if(P.ambJump>0)k.jump=true;}
      BK.sim(1);
    }
    k.left = false; k.right = false; k.block = false; k.jump = false;
    if (elite && eliteSecs === null && !elite.alive) eliteSecs = +((f - eliteFrom) * spd / 60).toFixed(1);
    const secs = shutAt === null ? null : +((f - shutAt) * spd / 60).toFixed(1);
    rows.push({ lvl: lvId, room: A.name, h, opened: A.st === 'done', secs, inTarget: A.st==='done' && secs>=AMBUSH_TARGET.min && secs<=AMBUSH_TARGET.max, leader: elite ? elite.t : null, eliteSecs, taken: Math.round(taken), takenPct: +(100 * taken / P.maxHp).toFixed(0), slow });
    await yieldNow();
  }
  out.done = true; out.ms = Date.now() - out.started;
  return out;
}

// Every hero against the common foes, one at a time, in an early, a middle and a late level (so the tier scaling of
// hp and damage is in it). The bot closes to its reach and swings; when the foe winds up it defends the way its hero
// does: the knight, the paladin and the death knight hold C, the freebooter taps it to parry, the pyromancer rolls.
export async function fightLab(BK, opts = {}) {
  const lvm = await import('./level.js');
  const heroes = opts.heroes || HEROES, foes = opts.foes || LAB_FOES;
  const levels = opts.levels || ['wood', 'spire', 'waymeet'], reps = opts.reps || 2, maxF = opts.maxF || 1800;
  const rows = [], out = { rows, started: Date.now(), progress: 0, total: levels.length * heroes.length * foes.length };
  if (typeof window !== 'undefined') window.__lab = out;
  for (const lvId of levels) for (const h of heroes) for (const t of foes) {
    const fights = [];
    for (let rep = 0; rep < reps; rep++) {
      BK.setHero(h); BK.reset({ fresh: true }); BK.load(lvm.LEVELS.findIndex(l => l.id === lvId)); BK.start(); BK.god = false;
      /* opts.home: a foe that needs its own ground (the marsh's gar needs its hole) is fought where the level put the first one,
         with the hero set down six tiles short of it, instead of five tiles past the start */
      const home = opts.home && BK.enemies().find(q => q.t === t && q.alive);
      for (const e of BK.enemies()) if (e !== home) e.alive = false; BK.sim(20);
      const P = BK.P, k = BK.keys; P.hp = P.maxHp; P.st = P.maxSt; P.inv = 0;
      /* opts.elite: the same foe as its ELITE (main.js), rule and all */
      const before = BK.enemies().length;
      if (home) { BK.tp(Math.round((home.hx !== undefined ? home.hx : home.x) / 16) - 6, Math.round(home.pool ? home.pool.y / 16 - 2 : home.y / 16 - 1)); BK.sim(20); P.hp = P.maxHp; }
      else BK.spawnEnt(Object.assign({ t, x: Math.round(P.x / 16) + 5, y: Math.round(P.y / 16) - 1 }, opts.elite ? { elite: true } : {}));
      const e = home || BK.enemies()[BK.enemies().length - 1];
      if ((!home && BK.enemies().length === before) || !e) { fights.push({ skipped: true }); continue; }
      let f = 0, taken = 0, swings = 0, defends = 0, died = false, last = P.hp; const ehp = e.hp;
      for (; f < maxF && e.alive; f++) {
        /* opts.keepAlive: the hero's health is put back each frame and what the foe took off him is counted, as the boss lab does -
           a long fight (an elite) is measured to its end instead of to the first time the bot runs out of health */
        if (opts.keepAlive) { if (P.hp < last) taken += Math.min(60, last - P.hp); P.hp = P.maxHp; last = P.hp; }
        if (P.dead) { died = true; break; }
        const s = labBotFrame(BK, h, e, f); defends += s.defend; swings += s.swing;
        BK.sim(1);
        if (P.hp < last) taken += last - P.hp; last = P.hp;
      }
      k.left = false; k.right = false; k.block = false; k.atk = false; k.up = false; k.down = false; k.jump = false;
      fights.push({ killed: !e.alive, died, secs: f * (BK.SET.speed || 1) / 60, taken, swings, defends, ehp, maxHp: P.maxHp });
      for (const q of BK.enemies()) q.alive = false;
      await yieldNow();
    }
    const ok = fights.filter(x => !x.skipped), ks = ok.filter(x => x.killed);
    const avg = (a, fn) => a.length ? a.reduce((s, x) => s + fn(x), 0) / a.length : null;
    out.progress++;
    if (!ok.length) { rows.push({ lvl: lvId, h, t, skipped: true }); continue; }
    rows.push({ lvl: lvId, h, t, ehp: ok[0].ehp, kills: ks.length + '/' + ok.length, deaths: ok.filter(x => x.died).length,
      ttk: ks.length ? +avg(ks, x => x.secs).toFixed(2) : null, taken: +avg(ok, x => x.taken).toFixed(1), perMin: Math.round(avg(ok, x => x.taken / Math.max(1, x.secs) * 60)),
      takenPct: +(100 * avg(ok, x => x.taken / x.maxHp)).toFixed(1), swings: +avg(ok, x => x.swings).toFixed(1), defends: Math.round(avg(ok, x => x.defends)) });
  }
  const acc = {};
  for (const r of rows) {
    if (r.skipped) continue;
    const s = acc[r.lvl + '/' + r.h] || (acc[r.lvl + '/' + r.h] = { n: 0, ttk: 0, ttkN: 0, pct: 0, deaths: 0, unkilled: 0 });
    s.n++; if (r.ttk != null) { s.ttk += r.ttk; s.ttkN++; } else s.unkilled++; s.pct += r.takenPct; s.deaths += r.deaths;
  }
  out.summary = {};
  for (const key in acc) { const s = acc[key]; out.summary[key] = { ttk: s.ttkN ? +(s.ttk / s.ttkN).toFixed(2) : null, hpPerFoe: +(s.pct / s.n).toFixed(1), deaths: s.deaths, unkilled: s.unkilled }; }
  out.done = true; out.ms = Date.now() - out.started;
  return out;
}

// THE BOSS LAB. Each hero into each boss's room. A boss that has an OPENING is played the way its room teaches it:
//   the paladin       - meet his sword ON THE BEAT, each hero its own way (see below); roll the bash; step off judgement's mark
//   the king          - stand beside one of his cages until it comes down on him, then cut him while he is held or open
//   the goblin queen  - wait by a pillar, crack it twice, and the third blow when she holds court beside it (it comes down on her); in her second
//                       round strike her back while she points and cut chandeliers down on her until her plate breaks; jump her quake; cut her
//                       while she is pinned or her plate is off (2026-09-29, her court; before that her charge into a pillar, a chandelier, her gallery)
//   the roc           - stand on the glass so her dive sticks in it, then cut her while she is down
//   the buried prince - in the dark, light a lamp; with him under a timber set, cut its post; off the red mark when he is under the floor
// Every other boss is cut whenever it is in reach. All of them are defended against on their tells. The hero's health is
// put back each frame and what the boss took is counted: how long it lasts, and the damage per minute it takes to see it out.
/* AND THE ONES WHOSE GATE LIVES IN main.js ASK IT (BK.bossOpen): the Queen's Lance turns every blade until he is
   committed, so a bot that treated him as open swung at his plate for the whole fight. */
const OPEN = (b, BK) => { const g = BK && BK.bossOpen ? BK.bossOpen(b) : null; return g === null || g === undefined ? OPEN0(b) : g; };
const DK_FREE = new Set(['rest', 'stuck', 'wrench', 'reel', 'open', 'held', 'pinned', 'down', 'stagger', 'staggered', 'winded', 'skid', 'downed', 'rise', 'catch', 'idle']);   /* (claude/herobots) modes a Death Knight may begin his slow swing in */
const OPEN0 = b => b.t === 'ploughman' ? b.open > 0 : b.t === 'master' ? b.open > 0 : b.t === 'troll' && b.hill ? b.mode === 'pinned' : b.t === 'closedhelm' ? b.open > 0 : b.t === 'king' ? (b.mode === 'held' || b.open > 0) : b.t === 'gqueen' ? (b.mode === 'pinned' || (b.phase === 2 && !!b.plateOff)) : b.t === 'roc' ? (b.mode === 'stuck' || b.mode === 'skid' || b.mode === 'downed') : true;
/* THE RED MARKS, from tools/tells.mjs (scratchpad hardtells.mjs writes this line): a tell no shield turns is dodged, never guarded */
export const HARD_TELLS = new Set(["troll|slamTell","troll|ripTell","assassin|markTell","berserker|windTell","captain|kegTell","captain|shootTell","closedhelm|bashTell","drownedking|slamTell","forgemaster|anvilTell","forgemaster|breathTell","forgemaster|dragTell","forgemaster|dropTell","forgemaster|hurlTell","forgemaster|ladleTell","forgemaster|pourTell","forgemaster|slamTell","forgemaster|whirlTell","golem|stompTell","gqueen|chandTell","gqueen|chargeTell","gqueen|gDropTell","gqueen|leapTell","gqueen|shadowTell","gqueen|slamTell","gqueen|sweepTell","grandmother|sweepTell","grandmother|throwTell","herald|sweepTell","king|cageTell","king|chargeTell","king|grabTell","king|liftTell","king|shoutTell","king|slamTell","lance|bashTell","lance|whirlTell","master|leapTell","masthead|boomTell","masthead|dropTell","owl|hootTell","prince|sinkTell","prince|snuffTell","quarter|shootTell","quarter|stanceTell","ram|leapTell","ram|stampTell","ram|tossTell","roadman|leapTell","roc|diveTell","suncatcher|frostTell","suncatcher|hailTell","suncatcher|spireTell","roc|shriekTell","tollmaster|tollTell","troop|grabTell","windcaller|wallTell"]);
HARD_TELLS.add('owl|skimTell');
HARD_TELLS.add('gobmage|runeTell');   /* THE GOBLIN MAGE'S RUNE: stepped off, never guarded */
for (const m of ['sweepTell', 'baleTell', 'lanternTell', 'leapTell']) HARD_TELLS.add('strawking|' + m); HARD_TELLS.add('ploughman|chargeTell');   /* THE HEXED FIELDS' red marks */
for (const m of ['scuttleTell', 'poundTell', 'flaskTell']) HARD_TELLS.add('homunculus|' + m); for (const m of ['rendTell', 'slamTell', 'crushTell', 'glyphTell', 'pairTell']) HARD_TELLS.add('archmage|' + m);   /* THE MAGE'S FOLLY's red marks */
for (const m of ['whirlTell', 'gulpTell']) HARD_TELLS.add('drownedking|' + m);   /* THE MAELSTROM and DROWNED BREATH: a current and a burst, and no shield is in either */
HARD_TELLS.add('herald|glideTell');   /* THE TIDE HERALD'S GLIDE ends in his low sweep: gone from, never guarded */
HARD_TELLS.add('drownedking|ramTell'); HARD_TELLS.add('drownedking|diveTell');   /* THE DROWNED KING'S CHARGE AND FALL: gone across, never guarded */
for (const m of ['grabTell', 'sweepTell', 'rakeTell', 'hurlTell', 'jetTell', 'geyserTell', 'lungeTell', 'roarTell', 'rollTell']) HARD_TELLS.add('kraken|' + m);   /* THE RAKE is HIGH in red: an arm that size turns on no shield either */   /* THE KRAKEN's red marks */   /* THE OWL REEVE'S SKIM: talons at ankle height, dodged or jumped, never guarded */
/* AND EVERY RED MARK IN src/marks.js, the table the screen draws from: the hand list above predates it and stays as it was. An elite's own moves are '*|mode', and answer for whatever creature is the elite */
for (const [k, v] of Object.entries(MARK)) if (v === '!!') HARD_TELLS.add(k);
{ const has = HARD_TELLS.has.bind(HARD_TELLS); HARD_TELLS.has = k => has(k) || has('*|' + String(k).slice(String(k).indexOf('|') + 1)); }
// WHAT THE BOT GOES TO IN THE PRINCE'S TOMB, or null to fight him: a cold lamp while the tomb is mostly dark (or any cold lamp
// while he is far off), else the post of the intact set he is standing under. { x: where to stand, at: what to strike }
function princeTarget(BK, boss, A, P) {
  if (['sunk', 'buried', 'sleep', 'wake', 'rise'].includes(boss.mode)) return null;
  /* A LAMP IS TRIED FOR THREE SECONDS AND THEN LEFT: a bot that never lights it must not spend the fight walking to it and back */
  const lamps = BK.props().filter(p => p.t === 'minerlamp' && p.x > A.x0 - 8 && p.x < A.x1 + 8 && p.y > A.floor - 200 && p.y <= A.floor + 4);
  for (const p of lamps) if (!p.lit && Math.abs(p.x - P.x) < 24) p.labTried = (p.labTried || 0) + 1;
  const cold = lamps.filter(p => !p.lit && !((p.labTried || 0) > 180));
  if (cold.length && (cold.length * 2 > lamps.length || Math.abs(boss.x - P.x) > 120)) { const lp = cold.sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0]; return { x: lp.x + (P.x < lp.x ? -12 : 12), at: lp.x }; }
  const set = BK.props().find(p => p.t === 'timber' && p.tomb && !p.broken && boss.x > p.x0 * 16 && boss.x < (p.x1 + 1) * 16 && Math.abs(boss.y - A.floor) < 8);
  if (set) { const side = Math.sign((set.x0 + set.x1 + 1) * 8 - set.x) || 1; return { x: set.x - side * 14, at: set.x }; }
  return null;
}
/* THE BOSSES A RUN OPENS. One so far: the Queen's Lance, whose plate turns every blade until he is committed - and whose
   own gate now says a DASH ATTACK into his guard puts him off balance. The hands for it are the dash branch of strike()
   with the family table taken out of it, because a boss is in no family: double-tap toward him from a dash's length out,
   swing while it carries, and leave the cutting to the OPEN branch above. */
const DASH_IN = new Set(['lance']);
/* a stable hash of the row's own key (level + hero + health mode), not the array index: renaming or reordering bosses[]/heroes[] must not reseed anything */
const seedOf = s => { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; };
function dashIn(BK, h, e, f) {
  const P = BK.P, k = BK.keys, d = e.x - P.x, ad = Math.abs(d), dir = Math.sign(d) || P.face;
  const reach = LAB_REACH[h] + (e.w || 12) / 2, cost = BK.stepCost ? BK.stepCost() : 12;
  const S = P.dashBot || (P.dashBot = { tap: -99 }); if (f < S.tap) S.tap = -99;   /* (a new fight counts its frames from nought) */
  if (Math.abs(e.y - P.y) > 30 || P.atk >= 0 || P.plunge) return 0;
  const go = () => { S.tap = f; P.face = dir; BK.press(dir > 0 ? 'right' : 'left'); k[dir > 0 ? 'right' : 'left'] = true; k[dir > 0 ? 'left' : 'right'] = false; };
  if ((P.dash > 0 || P.dashLate > 0) && P.st >= cost) { P.face = dir; BK.press('atk'); return 1; }   /* the swing that makes it a dash ATTACK */
  if (f - S.tap === 2 && P.ground) { go(); return 1; }                                               /* the second tap */
  if (P.ground && !(P.dashCd > 0) && !(P.dashRec > 0) && ad < reach + 52 && P.st >= cost + 22 && f - S.tap > 18) { go(); return 1; }
  return 0;
}
/* ==== THE TWO THINGS A HUMAN DOES UNDER COMMITMENT (WEIGHT, Daniel 10-02). The lab bot is a model of a player at human speed, and a
   player who knows a swing is seen through does not start one he cannot finish: (a) no swing whose commit outlasts the nearest foe's
   remaining windup (a tell he can see, or a boss's greed ring), and (b) one roll's wind kept back - a swing that would leave less than a
   roll is not started. This is not a weaker bot: under the old combat a swing into a tell could be rolled out of, so the bot never had to
   read it; now it must, as a person must. Only a STARTED cut is held back (a plunge from the air is not), and only on the ground. ==== */
let HUMAN_H = null; export const LAB_RESERVE_DEFAULT = 0.5; let LAB_RESERVE = LAB_RESERVE_DEFAULT;
let LABP = profileOf(null), PERC = null, SKH = null, ROWBOSS = null;   /* the row's bot profile (src/bot-profile.js), its perception (src/lab-perceive.js) and its skill hands, or null */
function humanSwingOk(BK) {
  const P = BK.P, h = HUMAN_H; if (BK.labHuman === false || !P || !h || !(P.ground || P.swim) || committed(P)) return true;
  const total = artLim(false) / artRate(h, false) + (COMMIT[h] || COMMIT.knight).light;
  const cost = BK.stepCost ? BK.stepCost() : 15, roll = ROLL_COST[h] || 24;
  if (P.st - cost < roll * (BK.labReserve ?? LAB_RESERVE) && P.st < P.maxSt && !BK.labSlip) return false;   /* (b): keep (half) a roll (BK.labSlip: a profile's hands forgetting to, src/lab-perceive.js) */
  if (BK.labGreedy) return true;   /* (a) is off while a profile's hands are GREEDY after a hit: they stay in, blind to what he starts */
  for (const e of BK.enemies()) { if (!e.alive || e.harmless || Math.abs(e.x - P.x) > 110 || Math.abs(e.y - P.y) > 60) continue;
    const greed = e.greedT > 0 ? e.greedT : 0, wu = BK.windingUp ? BK.windingUp(e) : false;
    if (!greed && !wu) continue;
    const left = greed || (typeof e.modeT === 'number' && e.modeT > 0 ? e.modeT : 0);
    if (left < total) return false; }   /* (a): it would land before he is free */
  return true;
}
/* (c) ONE ROLL A TELL, LATE IN IT. The bot's hands press the roll every 14-20 frames for as long as a red tell runs (a held key, in effect).
   Under the old roll that was free - the whole roll untouchable, 20 wind with the bar refilling under it. Under WEIGHT a roll is 22-28 wind
   with no regen through it, and only its first 0.20 s is safe, so a person rolls ONCE, as the tell ends. A roll press is let through when the
   nearest winding foe's tell has under ROLL_LATE s left (or its time cannot be read), once per tell (0.7 s); with no tell in reach (a shot, a
   hazard) at most one roll in ROLL_GAP s. */
const ROLL_LATE = 0.22, ROLL_GAP = 0.6;
function humanRollOk(BK) {
  const P = BK.P; if (BK.labHuman === false || !P || !HUMAN_H || HUMAN_H === 'warden') return true;   /* (her BACK-STEP is spacing, not a roll: 15 wind, a 0.09 s grace, taken in pairs to stay at the point's range - a person steps it as often as the bot does) */
  const now = BK.time !== undefined ? BK.time : performance.now() / 1000;
  let best = null, bd = 1e9;
  for (const e of BK.enemies()) { if (!e.alive || e.harmless) continue; const d = Math.abs(e.x - P.x); if (d > 160 || Math.abs(e.y - P.y) > 90) continue;
    if (!(e.greedT > 0) && !(BK.windingUp && BK.windingUp(e))) continue; if (d < bd) { bd = d; best = e; } }
  if (best) { const left = best.greedT > 0 ? best.greedT : (typeof best.modeT === 'number' && best.modeT > 0 ? best.modeT : 0);
        if (left > ROLL_LATE) { P.labRollWant = { e: best, until: now + left + 0.35 }; return false; }   /* too early: he means to roll, and waits for it (rollWhenDue) */
    if (now - (best.labRollT ?? -9) < 0.7) return false; best.labRollT = now; P.labRollT = now; return true; }
  if (now - (P.labRollT ?? -9) < ROLL_GAP) return false; P.labRollT = now; return true;
}
/* the roll he decided on, pressed when the tell is down to ROLL_LATE (or over): once a frame, before the world steps */
function rollWhenDue(BK, press0) {
  const P = BK.P, w = P && P.labRollWant; if (!w) return; const now = BK.time, e = w.e;
  if (now > w.until || !e.alive) { P.labRollWant = null; return; }
  const winding = e.greedT > 0 || (BK.windingUp && BK.windingUp(e)), left = e.greedT > 0 ? e.greedT : (typeof e.modeT === 'number' && e.modeT > 0 ? e.modeT : 0);
  if (winding && left > ROLL_LATE) return;
  P.labRollWant = null; if (now - (e.labRollT ?? -9) < 0.7) return; e.labRollT = now; P.labRollT = now; press0.call(BK, 'dodge');
}
export async function bossLab(BK, opts = {}) {
  const previous = BK.manualSimulation, press0 = BK.press, sim0 = BK.sim, step0 = BK.step;
  BK.press = k => (k === 'atk' && !humanSwingOk(BK)) || (k === 'dodge' && !humanRollOk(BK)) ? undefined : press0.call(BK, k);
  LABP = profileOf(opts.profile ?? BK.labProfile);   /* (BK.labProfile: a page-wide default a measuring tool sets - tools/boss-level.mjs openLevelPage sets the standard) */   /* opts.profile: 'legacy' (or none) = the old bot exactly; 'human' = the boss standard; '+first' = a first attempt */
  /* WITH EYES (a perceiving profile) the world steps one frame at a time: the hands decide on what was SEEN, the seen state comes off, the world steps, and what is seen now goes back on */
  const stepEyes = (fn, n) => { let r; for (let i = 0; i < (n || 1); i++) { if (BK.labHuman !== false && HUMAN_H) rollWhenDue(BK, press0); if (SKH) SKH.step(); if (PERC) PERC.restore(); r = fn.call(BK, 1); if (PERC) { PERC.update(); PERC.apply(); } if (OBS && ROWBOSS) OBS(BK, ROWBOSS, HUMAN_H); } return r; };   /* (OBS: opts.observe, a watcher called after every world frame on the real state - tools/boss-read-audit.mjs) */
  const OBS = opts.observe || null;
  BK.sim = n => { if (PERC || (OBS && ROWBOSS)) return stepEyes(sim0, n); if (BK.labHuman !== false && HUMAN_H) rollWhenDue(BK, press0); return sim0.call(BK, n); };
  BK.step = n => { if (PERC || (OBS && ROWBOSS)) return stepEyes(step0, n); if (BK.labHuman !== false && HUMAN_H) rollWhenDue(BK, press0); return step0.call(BK, n); };
  const miniBefore=opts.mini?Object.fromEntries(Object.entries(BK.PROG).filter(([,v])=>v&&typeof v==='object').map(([k,v])=>[k,v.mini])):null;
  BK.manualSimulation = true;
  try { return await runbossLab(BK, opts); }
  finally { if (PERC) PERC.restore(); PERC = null; SKH = null; ROWBOSS = null; LABP = profileOf(null); BK.press = press0; BK.sim = sim0; BK.step = step0; BK.manualSimulation = previous; if(miniBefore)for(const[k,v]of Object.entries(miniBefore)){if(v===undefined)delete BK.PROG[k].mini;else BK.PROG[k].mini=v;} }
}
async function runbossLab(BK, opts) {
  const healthMode=opts.healthMode||'refill';
  if(!['refill','normal'].includes(healthMode))throw Error('healthMode must be refill or normal');
  const normalHealth=healthMode==='normal';
  const lvm = await import('./level.js'), T = lvm.T, TS = 16, PT = await import('./playtest.js');
  const heroes = opts.heroes || HEROES;
  const bosses = opts.bosses || ['wood', 'kings', 'spire', 'crown', 'reef', 'flotilla', 'hurricane', 'deep', 'waymeet', 'undercrown'], maxSecs = opts.maxSecs || 120;
  const rows = [], out = { rows, healthMode, started: Date.now(), progress: 0, total: bosses.length * heroes.length };
  if (typeof window !== 'undefined') window.__bossLab = out;
  for (const lvId of bosses) for (const h of heroes) { HUMAN_H = h;
    /* THE WHOLE ROW IS SEEDED, from the FIRST frame BK.load draws: a fresh level's own goblins and critters wander on real
       Math.random for the few frames before bossLab kills everything but the boss, and that unseeded wander (an idleT roll,
       a look, a mutter - main.js's temper()) was shifting frame counts before the boss fight even began, so a fight seeded
       only at its own first frame still opened on a different footing every run. Seeding here, before BK.load, and restoring
       in the finally below (every continue in this row is covered) pins the row end to end - the level it loads, the setup
       sim before the arena wakes, and the fight itself. */
    const realRandom = Math.random; Math.random = mulberry(seedOf(lvId + '|' + h + '|' + healthMode + (opts.seed ? '|' + opts.seed : '') + (opts.salt ? '|' + opts.salt : '')));   /* opts.seed: a DIFFERENT pinned roll, for reps; opts.salt: a pilot's pass number (Ore Road) - both left out, every row replays exactly as before */
    try {
    if(opts.mini && BK.PROG[lvId]) BK.PROG[lvId].mini=false;
    BK.setHero(h); BK.reset({ fresh: true }); BK.load(lvm.LEVELS.findIndex(l => l.id === lvId)); BK.start(); BK.god = false; BK.sim(10);
    /* A FRESH HERO EACH ROW. The last swing of the row before used to arrive with him - a heavy swing still going roots the
       paladin for a second on whatever he is dropped on, and at the Roc's door that is the glass over the shaft */
    BK.reset();
    /* A LEVEL'S MINI, fought the same way: opts.mini puts the bot in L.mini's room against L.mini's boss, not the arena's */
    const L = BK.L, A = opts.mini ? L.mini : L.arena; out.progress++;
    if (!A) { rows.push({ lvl: lvId, h, skipped: opts.mini ? 'no mini' : 'no arena' }); continue; }
    /* A MINI IS THE ONE MARKED mini: the Weaver's level has small spiders, the Boatswain's ship has bosuns, the Overman's tomb has propmen - the first of the kind found was one of those */
    const boss = BK.enemies().find(e => e.t === A.boss && e.alive && (!opts.mini || e.mini));
    if (!boss) { rows.push({ lvl: lvId, h, skipped: 'no boss' }); continue; }
    for (const e of BK.enemies()) if (e !== boss && !e.maxHp) e.alive = false;
    if (A.carpet) { BK.board(); BK.sim(30); }   /* THE SKY FIGHT: its fight starts when the carpet is boarded */
    else { if (A.start) BK.tp(A.start[0], A.start[1]); else BK.tp(Math.round(A.trigger / 16) + (A.reverse?-1:1), Math.round(A.floor / 16) - 1);   /* A.start: a room whose floor is no place to stand (the Gate Gargoyle's spikes) says where the fight begins */ if (opts.nudge) BK.P.x += opts.nudge; BK.sim(30); }   /* opts.nudge: start a few px off, for reps of a fight no dice reach (the Deep and the Hurricane replay identically under any seed) */
    /* THE QUARTERMASTER GOES UP HER SHIP: the playtest walker knows ropes, steps and ledges, so it follows her deck to deck */
    const walker = boss.t === 'quarter' ? PT.makeBot(BK) : null;
    const air = boss.t === 'bellcrab' ? (await import('./deepair.js')).airBoxes(L).filter(a=>a.kind==='vent' && a.l>A.x0 && a.r<A.x1).map(a=>({...a,x:(a.l+a.r)/2,ty:A.floor-12,o:{}})) : (boss.airs||[]);
    const P = BK.P, k = BK.keys, hp0 = boss.hp, maxF = Math.round(maxSecs * 60 / (BK.SET.speed || 1));
    // ONE LIFE TELLS A DIFFERENT STORY: normal mode never refills health or clears death between blows.
    P.hp=P.maxHp;P.dead=0;
    const health={mode:healthMode,startHp:P.hp,damageTaken:0,healthRecovered:0};
    /* THE SMALL-FOE LEDGER (tools/small-adds.mjs asserts it). A swing STARTED with a small foe (FAMILY 'small' in main.js: a sporeling, a sprig)
       in front of the hero and inside his reach is a swing at it; it counts as MISSED if it touched no small foe (P.hitSet) and the foe it was
       aimed at lost nothing. A swing that struck something else instead (the boss, the Mother's heart, her knot) was aimed at that, and is not
       counted. Found by claude/dkmother: the Mother pilot cut her sporelings with the Death Knight's late plain cut and 8 of his 14 swings
       at them met air, and no number anywhere said so. It only watches: it presses nothing and draws no dice. */
    const smallFoes=()=>BK.enemies().filter(e=>e!==boss&&e.alive&&BK.keyOf&&(BK.keyOf(e)||{}).family==='small');
    let smallSw=null,smallSwings=0,smallMissed=0;
    const smallAim=()=>{let best=null,bd=1e9;const bossEdge=Math.abs(boss.x-P.x)-(boss.w||20)/2,bossIn=bossEdge<=LAB_REACH[h]+8&&Math.abs(boss.y-P.y)<40;for(const e of smallFoes()){const dx=e.x-P.x,ad=Math.abs(dx);if(ad>LAB_REACH[h]+(e.w||12)/2+8||Math.abs(e.y-P.y)>=24||(ad>=6&&Math.sign(dx)!==P.face)||(bossIn&&ad-(e.w||12)/2>bossEdge))continue;if(ad<bd){bd=ad;best=e;}}return best;};   /* (and nearer than the boss, when he is in reach too: a swing at him with a hopper behind it is a swing at him) */
    const smallEnd=()=>{const s=smallSw;smallSw=null;if(!s||(!s.hit&&s.other))return;smallSwings++;if(!s.hit)smallMissed++;};
    const smallWatch=(a0,aim)=>{if(a0<0&&P.atk>=0){smallEnd();if(aim)smallSw={aim,hp:aim.hp,set:new Set(smallFoes().concat([aim])),hit:false,other:false};}
      if(smallSw){for(const x of P.hitSet||[]){if(smallSw.set.has(x))smallSw.hit=true;else smallSw.other=true;}if(smallSw.aim.hp<smallSw.hp)smallSw.hit=true;if(P.atk<0)smallEnd();}};
    const advance=(n,draw=false)=>{const before=P.hp,a0=P.atk,aim=a0<0?smallAim():null;BK[draw?'step':'sim'](n);health.damageTaken+=Math.max(0,before-Math.max(0,P.hp));health.healthRecovered+=Math.max(0,P.hp-before);smallWatch(a0,aim);};
    P.labPogo=0;P.labNextPogo=0;P.labPogoJump=-100;P.labHeavyAt=0;P.labShipVault=0;P.labRest=false;P.labJump=0;P.labHold=0;P.labMageLanding=null;P.labMageTap=-99;
    // the old roof boards in the roc's nest, once: her dive sticks in them
    const glass = []; if (boss.t === 'roc') for (const [x0, x1] of ((L.monk && L.monk.boards) || [])) for (let x = x0; x <= x1; x++) glass.push(x * TS + 8);
    /* nearest the middle of the room first; the bot moves between three of them so it is always standing on one when she comes down */
    { const mid = (A.x0 + A.x1) / 2; glass.sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid)); }
    /* THE MODE LEDGER (opts.modes): how often the boss ENTERED each mode, and how much of the hero's health was lost while it was in each - which attacks fired at all, and which ones did the damage */
    const modeN = {}, hitBy = {}; let lastMode = null;
    const ledger = (m0, lost) => { if (!opts.modes) return; if (boss.mode !== lastMode) { lastMode = boss.mode; modeN[lastMode] = (modeN[lastMode] || 0) + 1; } if (lost > 0) hitBy[m0] = (hitBy[m0] || 0) + lost; };
    /* THE FIGHT ITSELF IS RESEEDED HERE, on the row's own seed again, right before its loop starts. The seed above
       (before BK.load) still pins the level's load and its settle sim end to end - so a retry of the SAME level is
       reproducible - but a boss's own rolls (the Abbot's archer-or-sprig summon, among others) used to draw from
       wherever that stream happened to land after the load-time settle and the walk into the arena, and THAT depends
       on how many Math.random calls everything else in the level made first: an unrelated enemy added anywhere in
       the level shifts the count, shifts the stream, and the boss's OWN rolls change though nothing about the fight
       did (claude/monastery3, batch38: small-adds went red on spire/abbot from Monastery level content alone, with
       boss-fight-end unmoved - the fight still ended, just on a different sample of the Abbot's own dice). Reseeding
       again here, on the identical seedOf(...) string, makes the fight loop depend only on the row's own key - never
       on how many creatures anything else in the level spawned before it. */
    Math.random = mulberry(seedOf(lvId + '|' + h + '|' + healthMode + (opts.seed ? '|' + opts.seed : '') + (opts.salt ? '|' + opts.salt : '')));
    /* (claude/bot2) A PERCEIVING PROFILE gets its eyes here, on their own dice (the boss's stream above is not touched), and opts.skills its skill hands */
    if (LABP.perceive) { PERC = makePerception(BK, LABP, lvId + '|' + h + '|' + healthMode + '|' + (opts.seed || '') + '|' + (opts.salt || ''), boss, opts); PERC.apply(); }
    ROWBOSS = boss; SKH = opts.skills ? makeSkillHands(BK, boss, h, SKILL_RANGE, ROLL_COST[h] || 24) : null;
    let f = 0, taken = 0, swings = 0, opened = 0, wasOpen = false, falls = 0, holdC = 0; const bowSeen = new Set();   /* the Queen's Lance's bowmen, every one that came (row: archers, archersCut) */
    /* THE DEATH KNIGHT'S WARD, played like a man: C held through a tell, and let go when the ward has stopped the blow (the nova) - or,
       once he has SEEN how late a tell's blow lands after its windup ends (dkLag), let go just before it lands, with a reaction
       time behind it, so it is RETURNED. One release in ten is early. dkHold keeps the ward up a little past the end of a tell. */
    const dkOpen = () => { const g = BK.bossOpen ? BK.bossOpen(boss) : null; return g !== null && g !== undefined ? !!g : boss.open > 0; };   /* (OPEN() is TRUE for a boss with no opening of its own: here only a real one counts) */
    const dkSwingOK = () => !(LABP.v2 && LABP.dkPunish !== false && h === 'reaper') || dkOpen() || DK_FREE.has(boss.mode) || !(f - dkS.tellF < dkF(6) || f - dkS.hitSwF < dkF(8)) || f - Math.max(dkS.endF, dkS.hitF) < dkF(LABP.dkWin ?? 0.25);   /* (claude/herobots) may the Death Knight begin his slow swing now? */
    const dkS = { m: '', blow: null, endF: -999, tellF: -9999, hitF: -9999, hitSwF: -9999, hp: -1, relF: -999 };
    const dkLag = {}, dkF = s => Math.round(s * 60 / (BK.SET.speed || 1)), par0 = BK.stats().parries; let dkHold = 0, dkRel = { mode: null, t0: 0, at: -9 }, dkG = 0, dkEndF = -99, dkEndM = null;   /* the paladin's aegis is HELD: a tap of C is a mend that roots her, so the guard is kept up through the tell */
    for (; f < maxF && boss.alive && (!normalHealth || !P.dead); f++) {
      { const bm = boss.mode || '';   /* (claude/herobots) what the Death Knight has SEEN of the boss's rhythm: when a tell was last up, and when the blow it told ended (his punish window) */
        if (bm !== dkS.m) { if (/Tell$/.test(dkS.m)) dkS.blow = bm; else if (dkS.blow && dkS.m === dkS.blow) { dkS.endF = f; dkS.blow = null; } dkS.m = bm; } if (/Tell$/.test(bm)) dkS.tellF = f;
        if (dkS.hp >= 0 && P.hp < dkS.hp - 0.5) { dkS.hitF = f; if (P.atk >= 0) dkS.hitSwF = f; } dkS.hp = P.hp; }
      if(!normalHealth){P.hp = P.maxHp; P.dead = 0;} // refill mode observes health separately; stamina must be earned back by the real recovery rule
      const hum=BK.labHuman!==false;if(P.st<(hum?(ROLL_COST[h]||24)+2:12))P.labRest=true;if(P.st>=(hum?Math.min(60,P.maxSt*.65):Math.min(48,P.maxSt*.6)))P.labRest=false;   /* WEIGHT: rest before the bar is below a roll (it was below 12), back in at 60 (it was 48) */
      if(P.labRest&&!P.plunge&&boss.t!=='mother'&&boss.t!=='undeadmage'&&boss.t!=='pyromancer'&&boss.t!=='gravewarden'&&boss.t!=='hedgewarden'&&boss.t!=='gargoyle'&&boss.t!=='winchmaster'&&boss.t!=='duneworm'&&boss.t!=='greenteeth'&&boss.t!=='cisternqueen'&&boss.t!=='gangleader'&&boss.t!=='djinn'){   /* (and the Dune Worm's: his hands rest inside their own branch, still off every tell - a rest that backed off blind stood in his sinkholes) */   /* (the Winchmaster's too, round three: its floor is the pit, and this rest backs 30 px away from him - off his ledge into the spikes, measured, over and over) */   /* (the Mother's pilot rests inside its own branch: resting used to stand it still under her vines) */
        k.left=k.right=k.up=k.down=k.jump=k.block=k.atk=k.throw=false;
        const wet=(L.pools||[]).some(q=>P.x>q.x0&&P.x<q.x1&&P.y>q.y);
        if(wet&&P.ground){BK.press('jump');P.labJump=24;}if(P.labJump>0){P.labJump--;k.jump=true;}
        if(Math.abs(P.x-boss.x)<80){const dir=P.x<boss.x?-1:1;if(P.x+dir*30>A.x0&&P.x+dir*30<A.x1)k[dir>0?'right':'left']=true;}
        const was=P.hp;advance(1);taken+=Math.max(0,was-P.hp);if(f%600===599)await yieldNow();continue;
      }
      // Optional controlled strategy comparison. Only real movement, jump and attack inputs; stamina is never restored.
      if(opts.attackStyle){
        if(P.labPogo && P.ground && f-P.labPogo>8){P.labPogo=0;P.labNextPogo=f+Math.round(6*60/(BK.SET.speed||1));}
        if(!P.labPogo && P.ground && (opts.attackStyle==='plunge'||(f>=(P.labNextPogo||0)&&OPEN(boss,BK))))P.labPogo=f||1;
        if(P.labPogo){
          k.left=k.right=k.up=k.down=k.jump=k.block=k.atk=false;const dx=boss.x-P.x;
          if(Math.abs(dx)>5)k[dx>0?'right':'left']=true;
          if(P.ground&&P.atk<0&&P.st>=28){BK.press('jump');P.labPogoJump=f;}
          if(f-(P.labPogoJump??-100)<24)k.jump=true;
          if(!P.ground&&P.vy>15&&!P.plunge&&Math.abs(dx)<18&&boss.y-boss.h-P.y>-10&&boss.y-boss.h-P.y<50){k.down=true;BK.press('atk');swings++;}
          if(P.plunge)k.down=true;if(P.perch>0)BK.press('jump');
          const was=P.hp;advance(1);taken+=Math.max(0,was-P.hp);if(f%600===599)await yieldNow();continue;
        }
      }
      /* THE DEEP: THE KING SWIMS. No stone - a stone is a man standing on the floor, and he is not there. The bot swims at him, up
         and down as well as along; it leaves a marked charge by going across its line and a marked fall by going aside, keeps a
         shield up for what a shield turns, and cuts him whenever he is in reach. */
      if (boss.t === 'drownedking' || boss.t === 'bellcrab') { if (boss.t === 'drownedking' && P.ballast) { P.ballast.held = false; P.ballast = null; }
        k.left = k.right = k.up = k.down = k.jump = k.block = false;
        const by = boss.y - 16, dx = boss.x - P.x, dy = by - (P.y - 10), adx = Math.abs(dx), reach2 = LAB_REACH[h] + (boss.w || 20) / 2;
        if (OPEN(boss, BK) && boss.open > 0 && !wasOpen) opened++; wasOpen = boss.open > 0;
        /* THE BELL. With a stone in hand his tells are answered by the stone (below); low and empty-handed his floor ring and his charge
           are risen over; under the floor ring with a stone, up is not a stroke - it is letting go */
        const bellGo = boss.t === 'bellcrab' && boss.phase !== 3 && !(boss.open > 0) && !['crack', 'wake', 'sleep'].includes(boss.mode), low = P.y > A.floor - 40;
        /* PRESSURE: MOVE (claude/bot2 triage). The ring is laid where you are as he tells it (34 px, 0.8 s): with a stone in hand the hands
           used to stay put under him waiting to drop it, and the ring took 124 of the knight's 182. Out of it first, stone or not, then back to the plan */
        const pm = LABP.v2 && boss.t === 'bellcrab' && boss.mode === 'pressureTell' && boss.bellMark, pIn = pm && Math.abs(P.x - pm.x) < 44 && Math.abs(P.y - 10 - pm.y) < 44;
        if (pIn) { k[P.x < pm.x ? 'left' : 'right'] = true; if (Math.abs(P.x - pm.x) < 20) k[(P.y - 10) < pm.y ? 'up' : 'down'] = true; }
        /* HIS RUSH AND HIS LEAP (the scuttle 42 px x 48 high, unblockable; out of the bell, the leap): up out of their line, and a stone that
           holds you on the floor is let go first - he will come again, the stone is on its rack */
        else if (LABP.v2 && boss.t === 'bellcrab' && ['scuttleTell', 'scuttle', 'leapTell', 'leap'].includes(boss.mode) && adx < 130 && P.y > boss.y - 70 && (boss.mode !== 'scuttle' || (boss.x - P.x) * (boss.vx || 0) < 0 || adx < 50)) {
          if (P.ballast) BK.press('jump'); k.up = true; k[dx > 0 ? 'left' : 'right'] = true; }
        else if (bellGo && P.ballast && boss.mode === 'ballastTell' && low) BK.press('jump');
        else if (boss.t === 'bellcrab' && !P.ballast && (low || !bellGo) && ['ballastTell', 'scuttleTell', 'scuttle'].includes(boss.mode)) k.up = true;
        else if (boss.t === 'bellcrab' && !P.ballast && boss.mode === 'pressureTell' && Math.abs(P.x - boss.bellMark.x) < 45) k[P.x < boss.bellMark.x ? 'left' : 'right'] = true;
        /* THE BELL IS SHUT UNTIL A STONE LANDS ON HIS CROWN (docs/briefs/deep-rework-2.md §4), and this is how the bot does it: swim up to a
           rack's stone (walking onto it takes it), wait on the rack for him to come under, step off toward him, and let go (the jump key)
           when the stone would fall onto his valve. A stone carried to the floor has missed: let it go and go back up. Open, it cuts him. */
        else if (bellGo && (P.ballast || (P.breath ?? 6) >= 3)) { P.labAir = false; if (P.ballast && (P.breath ?? 6) < 2) BK.press('jump');   /* out of breath with a stone: let it go first */
          const crownY = boss.y - boss.h, sy = P.y + 4;
          if (!P.ballast) { const st = BK.props().filter(p => p.t === 'ballast' && p.rack && !p.gone && !p.held).sort((a, b) => Math.hypot(a.x - P.x, a.y - P.y) - Math.hypot(b.x - P.x, b.y - P.y))[0];
            if (st) { if (Math.abs(st.x - P.x) > 3) k[st.x > P.x ? 'right' : 'left'] = true; if (P.y > st.y + 6) k.up = true; else if (P.y < st.y - 4) k.down = true;   /* the water floats you up past it: stop level with it */ }
            if (adx <= reach2 && Math.abs(dy) < 22 && P.atk < 0 && f % 4 === 0) { P.face = Math.sign(dx) || P.face; k.up = k.down = false; BK.press('atk'); swings++; } }
          else if (P.ballast && BK.enemies().some(q => q.alive && q.brood && Math.abs(q.x - P.x) < 34 && Math.abs(q.y - P.y) < 24)) {   /* THE BROOD (phase two): cut the prise off before it takes the stone */
            const q = BK.enemies().filter(q => q.alive && q.brood).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0]; P.face = Math.sign(q.x - P.x) || P.face; if (P.atk < 0) { BK.press('atk'); swings++; } }
          else if ((P.ground || BK.L.grid[Math.floor(P.y / 16) * BK.L.W + Math.floor(P.x / 16)] === lvm.T.PLANK) && P.y < A.floor - 24) { if (adx < 40 || boss.mode === 'pressureTell') k[dx > 0 ? 'right' : 'left'] = true; }
          else if (!P.ground) { if (adx > 2) k[dx > 0 ? 'right' : 'left'] = true;
            if ((adx < 9 && sy < crownY - 2 && sy > crownY - 46) || sy > crownY + 6) BK.press('jump'); }
          else BK.press('jump'); }
        else if (boss.mode === 'ramTell' || (boss.mode === 'ram' && Math.hypot(dx, dy) < 120)) { const nx = -(boss.rdy || 0), ny = boss.rdx || 1, s = ((P.x - boss.x) * nx + ((P.y - 10) - by) * ny) >= 0 ? 1 : -1;
          if (Math.abs(nx) > 0.35) k[nx * s > 0 ? 'right' : 'left'] = true; k[ny * s > 0 ? 'down' : 'up'] = true; }
        else if (boss.mode === 'diveTell' || boss.mode === 'dive') k[P.x < (boss.dcol !== undefined ? boss.dcol : boss.x) ? 'left' : 'right'] = true;
        /* THE MAELSTROM: away from him at a full stroke, and a dash out of the current the moment it is turning */
        else if (boss.mode === 'whirlTell' || boss.mode === 'whirl') { k[dx > 0 ? 'left' : 'right'] = true; k[dy > 0 ? 'up' : 'down'] = true;
          if (boss.mode === 'whirl' && f % 18 === 0) BK.press('dodge'); }
        /* AND IT BREATHES. Under two and a half seconds of breath it goes to the nearest air he has not burst (and is not about to), and
           stays in it until the breath is back: a swimmer who fights him without breathing is a swimmer who drowns in the lab and not in play */
        else if (air.length && ((P.breath ?? 6) < 3 || (P.labAir && (P.breath ?? 6) < (breathCapacity(BK.L)) - 0.3))) {
          const live = air.filter(s => !(s.o.goneUntil > BK.time) && !(s.o.shiverUntil > BK.time));
          const src = live.sort((a, b) => Math.hypot(a.x - P.x, a.ty - P.y) - Math.hypot(b.x - P.x, b.ty - P.y))[0];
          if (src) { P.labAir = true; const gx = Math.max(src.l + 8, Math.min(src.r - 8, P.x)), gy = src.ty;
            if (Math.abs(gx - P.x) > 4) k[gx > P.x ? 'right' : 'left'] = true; if (gy < P.y - 4) k.up = true; else if (gy > P.y + 4) k.down = true;
            if (adx <= reach2 && Math.abs(dy) < 22 && P.atk < 0 && f % 3 === 0) { P.face = Math.sign(dx) || P.face; k.down = k.up = false; BK.press('atk'); swings++; } }
          else P.labAir = false; }
        /* HE IS OPEN AND YOU ARE ON THE RACK OVER HIM: off it by its nearer end, and down to him */
        else if (boss.t === 'bellcrab' && boss.open > 0 && P.y < A.floor - 24 && BK.L.grid[Math.floor(P.y / 16) * BK.L.W + Math.floor(P.x / 16)] === lvm.T.PLANK) { const tx = Math.floor(P.x / 16), ty = Math.floor(P.y / 16), G = BK.L.grid, W = BK.L.W;
          let l = 0, r = 0; while (l < 8 && G[ty * W + tx - l - 1] === lvm.T.PLANK) l++; while (r < 8 && G[ty * W + tx + r + 1] === lvm.T.PLANK) r++; k[l < r ? 'left' : 'right'] = true; }
        else { P.labAir = false; if (adx > Math.max(10, LAB_REACH[h] * 0.6)) k[dx > 0 ? 'right' : 'left'] = true; if (dy < -10) k.up = true; else if (dy > 10) k.down = true;
          if (SHIELDED(h) && /Tell$/.test(boss.mode || '') && !HARD_TELLS.has(boss.t + '|' + boss.mode) && Math.hypot(dx, dy) < 120 && (h === 'paladin' || h === 'reaper' || boss.modeT < 0.2)) { k.block = true; k.left = k.right = k.up = k.down = false; P.face = Math.sign(dx) || P.face; }
          else if (adx <= reach2 && Math.abs(dy) < 22 && P.atk < 0) { P.face = Math.sign(dx) || P.face; k.down = k.up = false; BK.press('atk'); swings++; } }   /* a cut, not a plunge: down held under the swing is a down attack, and the lab was plunging him to death */
        if (opts.samples && f % 45 === 0) { out.samples = out.samples || []; out.samples.push([h, Math.round(f / 60), boss.mode, Math.round(dx), Math.round(dy), boss.open > 0 ? 'OPEN' : '', P.swim ? 'swim' : 'dry', P.ballast ? 'STONE' : '-', P.ground ? 'gnd' : 'air', Math.round(A.floor - P.y)].join(' ')); }
        const was = P.hp, m0 = boss.mode; advance(1,!!opts.draw); if (P.hp < was && !P.dead) taken += Math.min(60, was - P.hp); ledger(m0, P.dead ? 0 : was - P.hp); if (P.dead) falls++;
        if (opts.onFrame) await opts.onFrame({ boss, P, f, h, lvl: lvId, open: boss.open > 0 });   /* THE CAMERA HOOK: with opts.draw the frame was rendered, and a recorder can take it */
        if (f % 600 === 599) await yieldNow();
        continue; }
      if(boss.t==='mother'){
        k.left=k.right=k.up=k.down=k.jump=k.block=false;
        const node=BK.props().find(p=>p.motherNode),heart=boss.heart;
        let gx=node?node.x-12:boss.x;
        if(P.ground)P.labSpring=false;if(P.vy<-350)P.labSpring=true;
        if(boss.mode==='open')gx=P.labSpring?boss.x-(LAB_REACH[h]*.65):boss.x-3*TS;
        // THE ROOT MOVES UNDER THE SHELVES. Step through a one-way shelf before swinging at a ground knot.
        const descend=boss.mode!=='open'&&node&&P.ground&&P.y<node.y-20&&Math.abs(P.x-node.x)<32;
        const column=(boss.zones||[]).find(z=>P.x>z.l-10&&P.x<z.r+10&&z.top<A.floor-100);
        /* EVERY TELL HAS AN ANSWER, and the pilot now gives each one (the provenance run, outputs/56-mother-provenance-*.json, traced every blow it
           took to the vine, the stab mark, the floor surge or a door spider): the marked ground is kept off, the fan and the surge are
           jumped at the moment they arrive, and nothing is swung that would still be swinging when the jump is due. */
        const fl=A.floor,m=boss.mode,danger=[];
        for(const z of boss.zones||[])if(z.top<fl-100)danger.push([z.l-8,z.r+8]);
        if(m==='rootStabTell')danger.push([boss.rootMark-32,boss.rootMark+32]);
        if(m==='seedRainTell'||m==='seedRain'||boss.layer==='seedRain')for(const sx of [-96,-48,0,48,96])danger.push([boss.x+sx-12,boss.x+sx+12]);
        /* THE HARDER MOTHER (batch 4a): the mycelium at the walls, and phase three's rain wherever it is falling */
        if((boss.creep||0)>1){danger.push([A.x0-20,A.x0+boss.creep+8]);danger.push([A.x1-boss.creep-8,A.x1+20]);}
        for(const s of BK.seeds())if(s.mrain&&!s.dead)danger.push([s.x-14,s.x+14]);
        const bad=x=>danger.some(([l,r])=>x>l&&x<r);
        let safe=false;const crosses=danger.some(([l,r])=>Math.min(P.x,gx)<r&&Math.max(P.x,gx)>l);
        if(m!=='open'&&crosses&&!bad(P.x)){   /* standing clear already: go no further than the edge of this clear ground */
          const lo=Math.max(A.x0+14,...danger.filter(([,r])=>r<=P.x).map(([,r])=>r+8)),hi=Math.min(A.x1-14,...danger.filter(([l])=>l>=P.x).map(([l])=>l-8));
          gx=hi-lo<16?(lo+hi)/2:Math.max(lo,Math.min(hi,gx));safe=true;}
        else if(m!=='open'&&crosses){   /* the free ground between the marks, and the middle of the nearest piece of it: a 24px gap is not overshot */
          const cuts=[...danger].sort((a,b)=>a[0]-b[0]),free=[];let lo=A.x0+14;
          for(const [l,r] of cuts){if(l>lo)free.push([lo,l]);lo=Math.max(lo,r);}if(lo<A.x1-14)free.push([lo,A.x1-14]);
          const pick=free.map(([l,r])=>{const x=r-l<40?(l+r)/2:Math.max(l+12,Math.min(r-12,P.x));return x;}).sort((a,b)=>Math.abs(a-P.x)-Math.abs(b-P.x))[0];
          if(pick!==undefined){gx=pick;safe=true;}}
        /* HER SPORELINGS (batch 4a) are cut down when they come close, the way a player clears an add before going back to the knot.
           THE STAND-OFF (batch34): reach*.6 stood the pilot too close to a sporeling still walking in - the low sweep carries every
           hero forward on its own (lowSweep's vx), and closing that on top of a sporeling already closing the last few px sent the
           swing clean past it before the blow landed (measured after claude/npcs: the removed decorative NPCs and quest strays
           shifted the pinned dice enough that the Mother's own attack timing left a sporeling walking in right as the pyromancer
           swung, and her wide reach (30, LAB_REACH) meant the old *.6 stand-off - 18 px - left less room than the lunge covers).
           reach-2 stands it right at the edge of its own reach - as close as the strike still lands from - instead of the *.6 (or
           the other branches' reach-4) that left slack for the lunge and a closing foe to eat between them: measured (batch34),
           reach-4 still left the Mother's warden row at the limit (2 of 6, 33%); reach-2 clears every row with room to spare. */
        const add=BK.enemies().filter(q=>q.alive&&q.fromMother&&Math.abs(q.y-P.y)<30).sort((a,b)=>Math.abs(a.x-P.x)-Math.abs(b.x-P.x))[0],addNear=add&&boss.mode!=='open'&&Math.abs(add.x-P.x)<110;
        if(addNear&&!bad(add.x)){gx=add.x-(Math.sign(add.x-P.x)||1)*(LAB_REACH[h]-(h==='geomancer'?6:2));safe=false;}   /* (geomancer stands 4 px closer, sprinkle cut 2026-09-29: her stave's stone lands 21-26 out, and with the halved garrison shifting the pinned dice she swung past 3 of 5 sporelings; 29% worst row now) */
        const shelf=P.ground&&P.y<fl-20;
        const clap=m==='capClapTell'&&Math.abs(P.x-boss.x)<125,sweep=m==='sporeSweepTell'&&P.y<fl-30&&P.y>fl-80;
        const vine=(BK.vines?BK.vines():[]).find(v=>v.t>=v.tell-.05&&(P.x-v.x)*v.dir>-6&&(P.x-v.x)*v.dir<34);
        const surge=m==='floorSurgeTell'&&boss.modeT<.09||m==='floorSurge'&&boss.modeT>.25;
        const hopSoon=m==='floorSurgeTell'&&boss.modeT<.75||m==='rootFanTell';
        if(Math.abs(gx-P.x)>(safe?3+Math.abs(P.vx)*.12:5))k[gx>P.x?'right':'left']=true;
        if((descend||(shelf&&(clap||sweep)))&&!surge){k.down=true;BK.press('jump');}
        if(!shelf&&(surge||vine)&&!clap){BK.press('jump');if(!(P.labJump>0))P.labJump=22;}
        if(boss.mode==='open'&&P.ground&&Math.abs(P.x-(boss.x-3*TS))<20){BK.press('jump');P.labJump=16;}
        if(P.labJump>0){P.labJump--;k.jump=true;}
        const tired=P.labRest||P.st<14;
        const lead=h==='reaper'?(.12/.34):h==='paladin'?.08:.06,landingCutY=P.y+P.vy*lead+600*lead*lead;
        if(boss.mode==='open'&&heart&&Math.abs(P.x-heart.x)<LAB_REACH[h]+12&&(h==='reaper'||P.vy>0)&&(h==='pyro'||h==='warden'||h==='reaper'?Math.abs(landingCutY-(heart.y+3))<16:Math.abs(P.y-8-(heart.y-7))<46)&&P.atk<0){P.face=Math.sign(heart.x-P.x)||1;BK.press('atk');swings++;}
        else if(addNear&&!hopSoon&&!bad(P.x)&&Math.abs(add.x-P.x)<LAB_REACH[h]+add.w/2+2&&P.atk<0){P.face=Math.sign(add.x-P.x)||1;if(P.ground&&keyVerb(BK,h,add)==='sweep'&&P.st>=(BK.stepCost?BK.stepCost():12)+4)k.down=true;BK.press('atk');swings++;}   /* HER SPORELINGS ARE SMALL, and a small thing is cut LOW (the family table's key verb, which strike() gives every common foe): the plain cut was the only blow this pilot knew, and the Death Knight's lands a third of a second late and 31 px out - past a sporeling that has scuttled on. Measured (2026-09-24): he swung at them 14 times a fight and 8 of those met air (the other heroes: 0-5 of 4-15), and he followed them about the room, off the knot, for most of the extra 40 s his fight took */
        else if(!tired&&!hopSoon&&!bad(P.x)&&!descend&&!column&&boss.mode!=='open'&&!(boss.nodeRest>0)&&node&&Math.abs(P.x-node.x)<20&&Math.abs(P.y-node.y)<20&&P.atk<0){P.face=Math.sign(node.x-P.x)||1;BK.press('atk');swings++;}
        if(opts.samples&&f%120===0){out.samples=out.samples||[];out.samples.push([h,f/60,boss.mode,boss.nodeRest,Math.round(P.x-boss.x),Math.round(P.y-A.floor),P.atk,heart?.hp]);} const was=P.hp,m0=boss.mode;advance(1);taken+=Math.max(0,was-P.hp);ledger(m0,Math.max(0,was-P.hp));if(f%600===599)await yieldNow();continue;
      }
      /* THE UNDEAD ARCHMAGE, FROM THE CARPET (batch 4). The bot flies: out of the storm column sideways, straight out of a death
         mark's ring, around the poison clouds, across the line of anything thrown at it (or onto the shield, for the three who
         carry one), and away from the death hand. Otherwise it closes on him and cuts - and when the mark has come back on him
         (gather) it goes in hard. Resting is done on the wing, away from him. */
      if(boss.t==='undeadmage'){
        k.left=k.right=k.up=k.down=k.jump=k.block=false;
        const py=P.y-8,by=boss.y-24,dx=boss.x-P.x,dy=by-py,side=Math.sign(dx)||1,m=boss.mode;let vx=0,vy=0,threat=false;
        if(boss.open>0&&!wasOpen)opened++;wasOpen=boss.open>0;
        const away=(x,y,r,w=1)=>{const ex=P.x-x,ey=py-y,d=Math.hypot(ex,ey)||1;if(d<r){vx+=ex/d*w;vy+=ey/d*w;threat=true;}};
        if(m==='stormTell'&&Math.abs(P.x-boss.markX)<44){vx+=P.x>=boss.markX?1:-1;threat=true;}
        /* ARCHMAGE2 (claude/archmage2b): THE BONE STORM - once the skulls are loosed it flies out along the nearest gap (where the gap will be a
           beat on); HIS ECHO's lightning - out of its pale column; THE GRAVE PULL - it leans away from the void while it drags */
        {const B=boss.bones;if(B&&B.live){const k=B.t/UMAGE.bone.secs,R=UMAGE.bone.r0+(UMAGE.bone.r1-UMAGE.bone.r0)*k,d0=Math.hypot(P.x-B.cx,py-B.cy);
          if(d0<R+14){const me=Math.atan2(py-B.cy,P.x-B.cx);let best=null,bd=9;for(const a of mageBoneGaps(B,Math.min(1,k+0.18))){let d=Math.abs(((a-me)%(2*Math.PI)+3*Math.PI)%(2*Math.PI)-Math.PI);if(d<bd){bd=d;best=a;}}
            if(best!==null){const tx=B.cx+Math.cos(best)*(R+40),ty=B.cy+Math.sin(best)*(R+40),ex=tx-P.x,ey=ty-py,dd=Math.hypot(ex,ey)||1;vx+=ex/dd*3;vy+=ey/dd*3;threat=true;}}}}
        /* ARCHMAGE3 (claude/archmage3): HIS ORRERY - it keeps to the nearest clear ring between two orbits (or out past the last) and away from any world near it;
           THE GRAVE SCRIPT - it flies to the dark line while the lines are written */
        {const O=boss.orbit;if(O){const ex=P.x-O.cx,ey=py-O.cy,d=Math.hypot(ex,ey)||1,R=O.worlds.map(w=>w.R),safe=R.slice(1).map((r,i)=>(r+R[i])/2).concat([R[R.length-1]+34]);let want=safe[0];for(const r of safe)if(Math.abs(r-d)<Math.abs(want-d))want=r;
          if(Math.abs(want-d)>6){const s=Math.sign(want-d);vx+=ex/d*s*2;vy+=ey/d*s*2;}threat=true;for(const [wx,wy] of mageOrbitWorlds(O,O.live?O.t+0.15:0))away(wx,wy,UMAGE.orbit.r+30,2.5);}}
        {const S=boss.script;if(S&&boss.mode==='scriptTell'){const sy=S.y0+(S.safe+0.5)*S.h;if(Math.abs(sy-py)>S.h*0.25)vy+=Math.sign(sy-py)*3;threat=true;}}
        for(const q of boss.echoes||[])if(q.markX!==null&&q.markX!==undefined&&Math.abs(P.x-q.markX)<44){vx+=P.x>=q.markX?1:-1;threat=true;}
        if(boss.void&&boss.void.live){const V=boss.void,ex=P.x-V.x,ey=py-V.y,d=Math.hypot(ex,ey)||1;if(d<200){vx+=ex/d*1.6;vy+=ey/d*0.8;}if(d<70)threat=true;}
        if(boss.deathMark)away(boss.deathMark.x,boss.deathMark.y,boss.deathMark.r+18,2);
        for(const c of boss.clouds||[])away(c.x,c.y,c.r+30,3);
        /* HIS RINGS (Falling Tower round 2): a FLARED exit by you is his step coming - with the stamina for it the bot DODGES THROUGH it
           (his rings work both ways: the opening), without it it gets out of the ring's reach; an exit GLOWING a bolt's colour is a bent
           bolt coming - it flies across the line from the ring to itself */
        for(const r of boss.rings||[]){if(r.kind!=='exit'||r.used||r.t>=r.life||r.on<0.5)continue;const rx=P.x-r.x,ry=py-r.y,d=Math.hypot(rx,ry)||1;
          if(r.flare){if(P.st>25&&d<110){vx-=rx/d*2.2;vy-=ry/d*2.2;threat=true;if(d<46&&!(P.dodge>0)){P.face=Math.sign(r.x-P.x)||P.face;BK.press('dodge');}}else away(r.x,r.y,80,2.5);}
          else if(r.glow){const s4=Math.sign(((A.y0+A.floor)/2-py)*(rx/d))||1;   /* across the line, toward the middle of the sky */vx+=(-ry/d)*1.5*s4+rx/d*0.4;vy+=(rx/d)*1.5*s4+ry/d*0.4;threat=true;}}
        let block=false;
        for(const q of boss.shots||[]){const rx=P.x-q.x,ry=py-q.y,d=Math.hypot(rx,ry);if(d>(q.kind==='hand'?120:130))continue;
          if(q.kind==='hand'){const hs=Math.hypot(q.vx,q.vy)||1,nx=-q.vy/hs,ny=q.vx/hs,s3=((P.x-q.x)*nx+(py-q.y)*ny)>=0?1:-1;vx+=(nx*s3+(P.x-q.x)/d*0.6)*1.8;vy+=(ny*s3+(py-q.y)/d*0.6)*1.8;threat=true;if(d<26&&P.st>20)BK.press('dodge');continue;}   /* across its line: it turns slower than the carpet does */
          if(q.kind==='orb'){away(q.x,q.y,80,2);continue;}
          /* (claude/archmage3, Daniel 10-05) HIS FIREBOLT CAN BE STRUCK BACK - home, it breaks his ward: the bot swings at one in its reach (a human hand: it tries about two in three, decided once a bolt), and otherwise guards or dodges it as ever */
          if(q.kind==='fire'&&!q.echo&&!q.reflected&&!boss.realm&&!(boss.wardHold>0)&&!(boss.open>0)){q.botTry??=Math.random()<0.65;const ahead=(q.x-P.x)*Math.sign(-q.vx||1)<0;if(q.botTry&&Math.abs(q.x-P.x)<LAB_REACH[h]*0.85&&Math.abs(q.y-py)<16&&P.atk<0&&P.st>=8){P.face=Math.sign(q.x-P.x)||P.face;BK.press('atk');swings++;void ahead;continue;}}
          const sp=Math.hypot(q.vx,q.vy)||1,closing=(rx*q.vx+ry*q.vy)/sp;if(closing<0)continue;
          if((SHIELDED(h)||(h==='warden'&&DEFLECT_TAP(f)))&&d<46&&q.kind!=='orb'){block=true;P.face=Math.sign(q.x-P.x)||P.face;continue;}
          const nx=-q.vy/sp,ny=q.vx/sp,s2=(rx*nx+ry*ny)>=0?1:-1;vx+=nx*s2*1.4;vy+=ny*s2*1.4;threat=true;if(d<24&&P.st>20&&!(P.dodge>0))BK.press('dodge');}   /* and the dash's i-frames through the one that is about to land */
        /* HIS SPELL REALMS (claude/undead3, round undead4: "teach the bot the three openings"). In a realm his ward holds, so the bot does
           not close on him: it reads the realm's hazards and goes for its ONE opening - FIRE: over or under his wall going out, and a DODGE
           THROUGH it coming back (it runs on into him); ICE: under the ceiling at the icicle over his shell (any within 30 px: a struck one homes onto him, claude/archfix), and a swing at it; POISON: over
           the mire and out of the spore rings, and while the beam is cut, down to the vent and a swing at it. Open, it goes in as ever. */
        let realmGoal=null;const RL=boss.realm;
        if(RL&&boss.alive&&!(boss.open>0)){const b=realmBox(boss,A),toward=(gx,gy,w=1.6)=>{if(Math.abs(gx-P.x)>4)vx+=Math.sign(gx-P.x)*w;if(Math.abs(gy-py)>4)vy+=Math.sign(gy-py)*w;};
          if(RL.kind==='fire'){const tw=(b.x1-b.x0)/7,ti=Math.floor((P.x-b.x0)/tw);
            if((RL.ph==='tell'||RL.ph==='burn')&&RL.lit&&RL.lit.includes(ti)){let best=null;for(let j=0;j<7;j++)if(!RL.lit.includes(j)&&(best===null||Math.abs(j-ti)<Math.abs(best-ti)))best=j;if(best!==null){vx+=Math.sign(b.x0+(best+0.5)*tw-P.x)*2.5;threat=true;}}
            const W=RL.wall;if(W){const closing=(P.x-W.x)*W.d>0,dd=Math.abs(P.x-W.x);
              if(!W.back&&closing&&dd<110&&Math.abs(py-W.y)<60){vy+=(py<W.y?-1:1)*2.5;threat=true;}
              if(W.back&&closing&&dd<46&&!W.hitP){threat=true;if(P.st>=10&&!(P.dodge>0)&&dd<34){P.face=-W.d;k.left=W.d>0;k.right=W.d<0;BK.press('dodge');}}}
            realmGoal=[boss.x+(P.x<boss.x?-110:110),by];}
          if(RL.kind==='ice'){for(const q of RL.icicles)if((q.st==='crack'||(q.st==='fall'&&!q.struck))&&Math.abs(q.x-P.x)<24){vx+=Math.sign(P.x-q.x||1)*2.5;threat=true;}
            let over=null;for(const q of RL.icicles)if(q.st==='hang'&&(!over||Math.abs(q.x-boss.x)<Math.abs(over.x-boss.x)))over=q;
            if(over){realmGoal=[over.x-10,b.y0+2-8];if(Math.abs(over.x-boss.x)<30&&Math.abs(P.x-(over.x-10))<8&&py<b.y0+10&&P.atk<0){P.face=1;BK.press('atk');swings++;}}}
          if(RL.kind==='poison'){if(RL.exposedT<=0&&P.y>RL.mire-26){vy-=2.5;threat=true;}for(const s of [...(RL.spores||[]),...(RL.clouds||[])])away(s.x,s.y,(s.r||26)+24,3);
            if(RL.exposedT>0){realmGoal=[RL.vent.x-12,RL.mire-6];if(Math.abs(P.x-(RL.vent.x-12))<8&&Math.abs(py-(RL.mire-6))<10&&P.atk<0){P.face=1;BK.press('atk');swings++;}}
            else realmGoal=[RL.vent.x-110,RL.mire-70];}
          if(realmGoal)toward(realmGoal[0],realmGoal[1],threat?0.8:1.6);}
        const rest=P.st<14||(P.labRest&&P.st<40);P.labRest=rest;
        if(!threat&&!realmGoal){const want=boss.open>0?(h==='warden'?boss.w/2+32:LAB_REACH[h]*0.55):(rest?150:(h==='warden'?boss.w/2+32:LAB_REACH[h]*0.7));   /* (claude/herokit) THE WARDEN'S POINT PAYS 34+ px out (tipPay): flown in to 0.55-0.7 of her reach she only ever struck with the haft and the middle of the shaft (0 tip hits in 66 on the Archmage) - she holds the tip distance, as a person does */const gx=boss.x-side*want,gy=by;
          if(Math.abs(gx-P.x)>6)vx+=Math.sign(gx-P.x);if(Math.abs(gy-py)>6)vy+=Math.sign(gy-py);}
        if(vx>0.3)k.right=true;else if(vx<-0.3)k.left=true;if(vy>0.3)k.down=true;else if(vy<-0.3)k.up=true;
        if(block){k.block=true;}
        else if(!rest&&!['blinkOut','blinkIn','wake'].includes(m)&&Math.abs(dx)<LAB_REACH[h]+10&&Math.abs(dy)<20&&P.atk<0){P.face=side;BK.press('atk');swings++;}
        if(threat&&m==='markWait'&&boss.deathMark&&Math.hypot(P.x-boss.deathMark.x,py-boss.deathMark.y)<boss.deathMark.r&&P.st>20&&f%20===0)BK.press('dodge');
        const was=P.hp;advance(1,!!opts.draw);taken+=Math.max(0,was-P.hp);ledger(m,Math.max(0,was-P.hp));if(P.dead)falls++;
        if(opts.onFrame)await opts.onFrame({boss,P,f,h,lvl:lvId,open:boss.open>0});
        if(f%600===599)await yieldNow();continue;
      }
      /* THE PYROMANCER (batch 5; THE MIRROR DUEL, 2026-09-28): the bot reads the square. It never stands on burning ground (a
         burning or catching cell of the village's fire grid), guards his staff cuts (the three who carry a shield) or steps back out
         of their reach, is out of THE BELLOWS' cone (red: nothing turns it) and the vent's ring, takes his embers on the shield or
         rolls through them, and otherwise stays in reach and cuts - which is what keeps him from venting and takes him over the top
         into OVERHEAT, where it goes in. It HEARS HIS READ: two of its blows in a row and his guard is up, so it does not throw a
         light third into it - it holds attack for a heavy, which goes through. And it THROWS A BUCKET, as a player is told to: while
         he is dry and not open it fetches the nearest one off a floor rack (INTERACT) and throws it at him (ATTACK) from a few steps,
         and he stands doused and open. Resting is done on clear ground, away. */
      if(boss.t==='pyromancer'){
        k.left=k.right=k.up=k.down=k.jump=k.block=false;k.atk=false;
        if(boss.open>0&&!wasOpen)opened++;wasOpen=boss.open>0;
        const VGr=BK.village?BK.village().G():null,fl=A.floor,m=boss.mode,dx=boss.x-P.x,side=Math.sign(dx)||1;
        const hotAt=x=>{if(fireAt(BK,x,fl-1))return true;if(!VGr)return false;const c=VGr.get(Math.floor(x/16),Math.floor(fl/16)-1);return !!c&&(c.s===2||c.s===1);};   /* the square's grid AND every other flame on the floor: his embers leave fire where they land */
        const danger=[];
        if(m==='ventTell'||m==='vent')danger.push([boss.x-84,boss.x+84]);
        if(m==='bellowsTell'||m==='bellows')danger.push(boss.face>0?[boss.x-6,boss.x+104]:[boss.x-104,boss.x+6]);   /* THE BELLOWS' cone: nothing turns it */
        if(m==='cutTell'||m==='cut'){if(SHIELDED(h)&&Math.abs(boss.y-P.y)<26){k.block=true;P.face=side;}else danger.push([boss.x-58,boss.x+58]);}   /* his staff: guarded, or stepped back from */
        const bad=x=>danger.some(([l,r])=>x>l&&x<r)||hotAt(x),free=x=>x>A.x0+16&&x<A.x1-16&&!bad(x);
        const rest=P.st<14||(P.labRest&&P.st<44);P.labRest=rest;
        /* THE BUCKET: the nearest one standing at a floor rack in his square, while he is dry and not already open */
        const bucket=!P.carry&&!rest&&!(boss.open>0)&&!(boss.wetT>0)&&BK.village?BK.village().buckets().filter(q=>q.state==='rest'&&Math.abs(q.y-fl)<4&&q.x>A.x0&&q.x<A.x1).sort((a,b)=>Math.abs(a.x-P.x)-Math.abs(b.x-P.x))[0]:null;
        let gx=rest?boss.x-side*150:P.carry?boss.x-side*44:bucket?bucket.x:boss.x-side*Math.max(18,LAB_REACH[h]*.65);
        if(!free(gx)){let best=null;for(let s=6;s<440&&best===null;s+=6){if(free(gx-s))best=gx-s;else if(free(gx+s))best=gx+s;}if(best!==null)gx=best;}
        if(Math.abs(gx-P.x)>4)k[gx>P.x?'right':'left']=true;
        if(P.ground&&Math.abs(gx-P.x)>12){const dir=gx>P.x?1:-1;if(hotAt(P.x+dir*8)||hotAt(P.x+dir*22)||hotAt(P.x+dir*34)){BK.press('jump');P.labJump=16;}}   /* a player jumps the flames between him and where he is going - a full jump, held: a tapped hop is six pixels and the fire reaches fourteen */
        if(P.labJump>0){P.labJump--;k.jump=true;}
        if(P.ground&&P.y<fl-20){k.down=true;BK.press('jump');}   /* off a stall: the bot fights on the floor, and he hops down to it */
        if(bucket&&P.ground&&Math.abs(bucket.x-P.x)<12&&Math.abs(bucket.y-P.y)<12){k.left=k.right=false;BK.press('talk');}   /* INTERACT takes it */
        const inRing=danger.length&&bad(P.x)&&Math.abs(gx-P.x)>40;
        if(inRing&&(m==='bellows'||m==='vent'||(m.endsWith('Tell')&&boss.modeT<.18))&&P.st>20&&!(P.dodge>0))BK.press('dodge');
        const inc=BK.seeds().find(s=>s.pyroEmber&&!s.dead&&Math.abs(s.x-P.x)<80&&Math.abs(s.y-(P.y-8))<30&&(s.x-P.x)*s.vx<0);
        const volley=(m==='emberTell'||m==='ember')&&Math.abs(dx)<220;   /* his ember '!': a player with a shield guards the whole volley, facing him */
        const reach=Math.abs(dx)<LAB_REACH[h]+boss.w/2&&Math.abs(P.y-boss.y)<32;
        if(P.carry){if(P.ground&&!danger.length&&Math.abs(boss.y-P.y)<20&&Math.abs(dx)>16&&Math.abs(dx)<66){P.face=side;BK.press('atk');}}   /* ATTACK throws it: a few steps off him, on his floor */
        else if(volley&&SHIELDED(h)){k.block=true;k.left=k.right=false;P.face=side;}
        else if(inc&&SHIELDED(h)){k.block=true;k.left=k.right=false;P.face=Math.sign(inc.x-P.x)||P.face;}
        else if(inc&&P.st>20&&!(P.dodge>0)&&Math.abs(inc.x-P.x)<24)BK.press('dodge');
        else if(h==='reaper'&&reach&&P.atk<0&&!dkSwingOK()){k.block=true;k.left=k.right=false;P.face=side;}   /* (claude/herobots) the Death Knight keeps the ward up and does not begin a swing into his staff */
        else if(!rest&&!danger.length&&reach&&P.atk<0&&!(P.labHold>0)){P.face=side;
          if((boss.readN||0)>=2&&!(boss.open>0))P.labHold=1;   /* HIS GUARD IS UP: not a third light blow into it - a held one */
          else{BK.press('atk');swings++;}}
        if(P.labHold>0){if(P.heavy||P.labHold>Math.round(0.9*60/(BK.SET.speed||1))||danger.length||P.carry)P.labHold=0;else{P.labHold++;k.atk=true;P.face=side;}}   /* held until the heavy goes, then let go */
        if(opts.samples&&f%60===0){out.samples=out.samples||[];out.samples.push([h,Math.round(f/60),m,Math.round(boss.heat),boss.open>0?'OPEN':'',Math.round(dx),hotAt(P.x)?'HOT':'',P.carry?'BUCKET':''].join(' '));}
        const was=P.hp,m0=boss.mode;advance(1,!!opts.draw);taken+=Math.max(0,was-P.hp);ledger(m0,Math.max(0,was-P.hp));if(P.dead)falls++;
        if(opts.onFrame)await opts.onFrame({boss,P,f,h,lvl:lvId,open:boss.open>0});if(f%600===599)await yieldNow();continue;
      }
      /* THE GRAVE WARDEN (batch 4b): the bot plays him as a player does - jumps the lantern when it comes round, is off the crack
         when the hand comes up, guards the spade and the dirt (or backs off without a shield), cuts his risen dead when they are
         close, and puts everything into him while he kneels in the grave. It does not hunt the opening on purpose: it gets the
         kneels a player gets by moving off a dig that was aimed beside a grave. */
      if(boss.t==='gravewarden'){
        k.left=k.right=k.up=k.down=k.jump=k.block=false;
        if(boss.open>0&&!wasOpen)opened++;wasOpen=boss.open>0;
        const fl=A.floor,m=boss.mode,dx=boss.x-P.x,side=Math.sign(dx)||1,danger=[];
        if(m==='digTell'||m==='dig')danger.push([boss.markX-30,boss.markX+30]);
        const bad=x=>danger.some(([l,r])=>x>l&&x<r),free=x=>x>A.x0+16&&x<A.x1-16&&!bad(x);
        const add=BK.enemies().filter(q=>q.alive&&q.fromWarden&&Math.abs(q.y-P.y)<30).sort((a,b)=>Math.abs(a.x-P.x)-Math.abs(b.x-P.x))[0];
        const rest=P.st<14||(P.labRest&&P.st<44);P.labRest=rest;
        let gx=m==='kneel'?boss.x-side*Math.max(14,LAB_REACH[h]*.6):rest?boss.x-side*120:boss.x-side*Math.max(20,LAB_REACH[h]*.7);
        if((m==='cleaveTell'||m==='tossTell')&&!SHIELDED(h))gx=boss.x-side*80;
        if(add&&Math.abs(add.x-P.x)<70&&m!=='kneel')gx=add.x-(Math.sign(add.x-P.x)||1)*LAB_REACH[h]*.6;
        if(!free(gx)){let best=null;for(let s=6;s<300&&best===null;s+=6){if(free(gx-s))best=gx-s;else if(free(gx+s))best=gx+s;}if(best!==null)gx=best;}
        if(Math.abs(gx-P.x)>4)k[gx>P.x?'right':'left']=true;
        const swingNow=(m==='swing'&&boss.modeT<.42&&boss.modeT>.2)||(m==='swingTell'&&boss.modeT<.12);
        if(swingNow&&P.ground&&Math.abs(dx)<70){BK.press('jump');P.labJump=18;}
        const skull=(boss.skulls||[]).find(s=>Math.abs(s.x-P.x)<40&&(s.x-P.x)*s.vx<0);if(skull&&P.ground){BK.press('jump');P.labJump=18;}
        if(P.ground&&P.y>fl+2){BK.press('jump');P.labJump=18;k[gx>P.x?'right':'left']=true;}   /* down in an open grave: out of it */
        if(P.labJump>0){P.labJump--;k.jump=true;}
        if((m==='cleaveTell'||m==='tossTell'||m==='toss')&&SHIELDED(h)&&Math.abs(dx)<120){k.block=true;k.left=k.right=false;P.face=side;}
        else if(add&&Math.abs(add.x-P.x)<LAB_REACH[h]+add.w/2+2&&Math.abs(add.y-P.y)<24&&P.atk<0&&m!=='kneel'){P.face=Math.sign(add.x-P.x)||1;BK.press('atk');swings++;}
        else if(!rest&&!bad(P.x)&&Math.abs(dx)<LAB_REACH[h]+boss.w/2&&Math.abs(P.y-boss.y)<40&&P.atk<0&&(m==='kneel'||m==='stalk'||m==='toll'||m==='tollTell'||m==='dig'||m==='toss')){P.face=side;BK.press('atk');swings++;}
        const was=P.hp,m0=boss.mode;advance(1,!!opts.draw);taken+=Math.max(0,was-P.hp);ledger(m0,Math.max(0,was-P.hp));if(P.dead)falls++;
        if(f%600===599)await yieldNow();continue;
      }
      /* THE SEXTON (Falling Tower round 3): the bot plays his deck as a player does now that his pit is SPIKED - it never stands on a
         plank that is counting or gone (the room's rule, the toll's sign), is in the air when a toll lands (it strikes the deck), leaves a
         bell's shadow, guards the swing and the rush (or backs off and jumps the rush without a shield), and goes in on him while he is
         caught in the pit. Before the spikes it played him with the generic walker, which stood on counting planks and fell into a pit
         that cost nothing - so its 3/3 measured a bot that ignored the room. */
      if(boss.t==='sexton'){
        k.left=k.right=k.up=k.down=k.jump=k.block=false;
        if(boss.open>0&&!wasOpen)opened++;wasOpen=boss.open>0;
        const fl=A.floor,m=boss.mode,dx=boss.x-P.x,side=Math.sign(dx)||1,danger=[];
        for(const c of (L.crumbles||[]))if(c.kind==='deck'&&(c.st==='count'||c.st==='down'))danger.push([c.x0*16-8,(c.x1+1)*16+8]);
        for(const x of (boss.spots||[]))danger.push([x-30,x+30]);
        const bad=x=>danger.some(([l,r])=>x>l&&x<r),free=x=>x>A.x0+20&&x<A.x1-20&&!bad(x);
        const pit=m==='pit',rest=P.st<14||(P.labRest&&P.st<44);P.labRest=rest;
        let gx=pit?boss.x-side*Math.max(12,LAB_REACH[h]*.5):rest?boss.x-side*110:boss.x-side*Math.max(20,LAB_REACH[h]*.7);
        if((m==='swingTell'||m==='rushTell')&&!SHIELDED(h))gx=boss.x-side*90;
        /* A PLANK COUNTS UNDER YOUR OWN WEIGHT, so it fights from what does not: a joist, a ringers' walk (one jump up) - he comes to you */
        const D=L.bellDeck,safe=D?[...D.joists.filter((_,i)=>i!==0&&i!==4),...[13,39].map(c=>c*16+8)].filter(x=>!bad(x)):[];
        if(safe.length&&!pit){gx=safe.reduce((b,x)=>Math.abs(x-gx)+Math.abs(x-P.x)*.3<Math.abs(b-gx)+Math.abs(b-P.x)*.3?x:b,safe[0]);}
        else if(!free(gx)){let best=null;for(let q=6;q<400&&best===null;q+=6){if(free(gx-q))best=gx-q;else if(free(gx+q))best=gx+q;}if(best!==null)gx=best;}
        if(Math.abs(gx-P.x)>4)k[gx>P.x?'right':'left']=true;
        if(P.ground&&(gx===13*16+8||gx===39*16+8)&&Math.abs(gx-P.x)<34&&P.y>fl-20){BK.press('jump');P.labJump=18;}   /* up onto the walk */
        if(P.ground&&bad(P.x)){BK.press('jump');P.labJump=16;}   /* on a counting plank, or at the lip of a gone one: off it */   /* on a counting plank: off it */
        if(m==='tollTell'&&boss.modeT<.2&&P.ground){BK.press('jump');P.labJump=18;}   /* the toll strikes the deck: be off it when it lands */
        if(m==='rush'&&!SHIELDED(h)&&P.ground&&Math.abs(dx)<60&&(boss.face||1)*(P.x-boss.x)>0){BK.press('jump');P.labJump=18;}
        if(P.ground&&P.y>fl+8){BK.press('jump');P.labJump=18;}   /* down in the pit: out */
        if(P.labJump>0){P.labJump--;k.jump=true;}
        if((m==='swingTell'||m==='rushTell'||m==='rush')&&SHIELDED(h)&&Math.abs(dx)<110){k.block=true;k.left=k.right=false;P.face=side;}
        else if(!rest&&Math.abs(dx)<LAB_REACH[h]+boss.w/2&&Math.abs(P.y-boss.y)<44&&P.atk<0&&m!=='leap'&&m!=='climb'){P.face=side;BK.press('atk');swings++;}
        const was=P.hp,m0=boss.mode;advance(1,!!opts.draw);taken+=Math.max(0,was-P.hp);ledger(m0,Math.max(0,was-P.hp));if(P.dead)falls++;
        if(f%600===599)await yieldNow();continue;
      }
      /* THE HEDGE WARDEN (batch 4c): the bot plays him as a player does - fights him BESIDE A BRAZIER (it stands past the nearest
         one, so he follows it there and is felled by the fire), gets clear of the thorns, guards the cut and the rush (or backs
         off / jumps the rush without a shield), cuts the cuttings he throws off, and puts everything into a stump. The THORN LASH
         (claude/hedgewarden2) it guards with a shield and jumps without one; a ROOT crawling at it it jumps (standing past the brazier,
         most of them burn out before they reach it). */
      if(boss.t==='hedgewarden'){
        k.left=k.right=k.up=k.down=k.jump=k.block=false;
        if(boss.open>0&&!wasOpen)opened++;wasOpen=boss.open>0;
        const m=boss.mode,dx=boss.x-P.x,side=Math.sign(dx)||1,stump=m==='felled'||m==='stump';
        const add=BK.enemies().filter(q=>q.alive&&q.fromHedge&&Math.abs(q.y-P.y)<30).sort((a,b)=>Math.abs(a.x-P.x)-Math.abs(b.x-P.x))[0];
        const bz=((L.witch&&L.witch.braziers)||[]).map(([x])=>x*16+8).sort((a,b)=>Math.abs(a-boss.x)-Math.abs(b-boss.x))[0];
        const rest=P.st<14||(P.labRest&&P.st<44);P.labRest=rest;
        let gx=stump?boss.x-side*Math.max(12,LAB_REACH[h]*.55):rest?boss.x-side*110:bz!==undefined?bz+(bz>boss.x?1:-1)*Math.max(20,LAB_REACH[h]*.6):boss.x-side*Math.max(20,LAB_REACH[h]*.7);
        if(!stump&&!rest&&Math.abs(dx)<LAB_REACH[h]+boss.w/2)gx=P.x;   /* in reach: stand and cut */
        if(m==='thornTell'||m==='thorn')gx=boss.x-side*80;
        if(m==='cutTell'&&!SHIELDED(h))gx=boss.x-side*80;
        if(add&&Math.abs(add.x-P.x)<70&&!stump)gx=add.x-(Math.sign(add.x-P.x)||1)*LAB_REACH[h]*.6;
        gx=Math.max(A.x0+18,Math.min(A.x1-18,gx));
        if(Math.abs(gx-P.x)>4)k[gx>P.x?'right':'left']=true;
        if((m==='rush'&&Math.abs(dx)<60&&(boss.x-P.x)*boss.face<0&&!SHIELDED(h))&&P.ground){BK.press('jump');P.labJump=18;}
        if(m==='lashTell'&&!SHIELDED(h)&&boss.modeT<0.12&&Math.abs(dx)<170&&P.ground){BK.press('jump');P.labJump=18;}   /* THE THORN LASH: over it */
        {const rt=(L.hedgeRoots||[]).find(r=>!r.dead&&Math.abs(r.y-P.y)<10&&(P.x-r.x)*r.dir>0&&(P.x-r.x)*r.dir<30);if(rt&&P.ground){BK.press('jump');P.labJump=18;}}   /* A ROOT coming: over it */
        if(P.labJump>0){P.labJump--;k.jump=true;}
        if((m==='cutTell'||m==='cut'||m==='rushTell'||m==='rush'||m==='lashTell'||m==='lash')&&SHIELDED(h)&&Math.abs(dx)<170&&!(L.hedgeRoots||[]).some(r=>!r.dead&&Math.abs(r.x-P.x)<40)){k.block=true;k.left=k.right=false;P.face=side;}
        else if(add&&Math.abs(add.x-P.x)<LAB_REACH[h]+add.w/2+2&&Math.abs(add.y-P.y)<24&&P.atk<0&&!stump){P.face=Math.sign(add.x-P.x)||1;BK.press('atk');swings++;}
        else if(!rest&&m!=='thornTell'&&m!=='thorn'&&!(m==='cutTell'&&!SHIELDED(h))&&Math.abs(dx)<LAB_REACH[h]+boss.w/2&&Math.abs(P.y-boss.y)<40&&P.atk<0){P.face=side;BK.press('atk');swings++;}   /* (no shield: it steps out of the cut, it does not trade with it) */
        const was=P.hp,m0=boss.mode,rh=(L.hedgeRoots&&L.hedgeRoots.hits)||0;advance(1,!!opts.draw);taken+=Math.max(0,was-P.hp);ledger(((L.hedgeRoots&&L.hedgeRoots.hits)||0)>rh?'roots':m0,Math.max(0,was-P.hp));if(P.dead)falls++;   /* (a root's bite is booked to THE ROOTS, whatever he is doing when it lands) */
        if(f%600===599)await yieldNow();continue;
      }
      /* THE GATE GARGOYLE (the Witchlight Stair's boss; round three, 2026-09-27): the bot plays him as a player does. He is stone, so it
         never swings at him: on a slab it leaves LATE when his shadow is on its slab (after he has dropped, so the aim is his and the slab
         breaks under him), gets off a slab whose glyph is lit, guards the gust and the fire breath (or, with no shield, gets off the
         breath's line to the next slab away from him as the line sets), and when he lies STUNNED on the spikes it walks off its slab over
         him and comes down on his back - the stomp - and lets the wind bring it back up. A fall is the wind's too. */
      /* THE WINCHMASTER, ROUND TWO (Daniel's playtest, 2026-09-25): his housings have ladders now, so the hands play him the way the
         round-two fight is built - GO UP TO HIM AND FIGHT HIM. They work out which housing he is on (or swinging to), get to its
         ledge (down whatever ladder or rope they are near, across the spoil, up the rope to that ledge), climb its ladder and step
         onto the housing, and fight him there: in to their reach and cut; the brake bar shielded (or backed off, without a
         shield); the hook jumped as it comes; a ring on the floor from the roof stepped out of. When he retreats they chase. If a
         jam puts him down on a ledge they cut him there. They never tip a skip and never ride - the jam is the bonus, not the plan. */
      if(boss.t==='winchmaster'){
        k.left=k.right=k.up=k.down=k.jump=k.block=false;
        if(boss.open>0&&!wasOpen)opened++;wasOpen=boss.open>0;
        /* ROUND FIVE (claude/winch3, 2026-09-28): EVERY COLUMN AND ROW BELOW IS READ OFF OR.ARENA (and the drum pit off OR.PITS) - these
           hands used to carry their own copies of his ladder columns, and a room edit that moved one stalled the warden at the cap while
           every geometry check stayed green (claude/oreroad3, item 3). tools/ore-road.mjs now fails on a literal arena column here */
        const O=OR.ARENA,TZ=16,HS=O.housings,m=boss.mode,spoilY=(O.spoil+1)*TZ,deckY=(O.deck+1)*TZ;
        const GA=HS[0],HB=HS[1],HC=HS[2],PD=OR.PITS.find(q=>q.id==='drum'),LA=GA.ladder[0],LB=HB.ladder[0],LC=HC.ladder[0],row=y=>(y+1)*TZ;
        const deck0=O.x0-1,deck1=LB-1;   /* the entrance deck: the arena's first column to the tile before the Head Frame's ladder (the ladder is boarded from, at its level) */
        const go=x=>{if(Math.abs(x-P.x)>3)k[x>P.x?'right':'left']=true;};
        const tgt=(m==='letgo'||m==='swing')?(boss.at+1)%3:(boss.at||0),T0=HS[tgt],reach2=LAB_REACH[h]+boss.w/2;
        const on=P.onMover&&P.onMover.kind==='bucket'?P.onMover:null;
        const onTop=i=>{const q=HS[i];return P.ground&&!on&&Math.abs(P.y-(q.top+1)*TZ)<3&&P.x>q.x0*TZ-4&&P.x<(q.x1+1)*TZ+4;};
        const onLedge=i=>{const q=HS[i];return P.ground&&!on&&Math.abs(P.y-(q.ledgeTop+1)*TZ)<3&&P.x>q.ledge[0]*TZ-8&&P.x<(q.ledge[1]+1)*TZ+8;};
        if(P.ground||P.climb)P.labAir=null;
        /* THE THREAT, wherever the hands are: the hook as it comes, a sent bucket, the bar (shield, or out of its reach), the roof's ring */
        /* the hook: jumped as it comes - and close in, where it is on you the instant it leaves his hand, as its tell runs out */
        const hk=boss.hk&&boss.hk.st==='out'?boss.hk:null,hkNear=(hk&&Math.hypot(hk.x-P.x,hk.y-(P.y-9))<46)||(m==='hookTell'&&boss.modeT<0.1&&Math.hypot(boss.x-P.x,boss.y-P.y)<90);
        const rw=boss.runaway&&!(boss.runaway.delay>0)?boss.runaway:null;let rwNear=false;
        if(rw){const q=HS[rw.at],ln=BK.L.cableway.lines.find(l=>l.id===q.line),p=ln.pts,n=q.at==='end'?p[p.length-1]:p[0],f2=q.at==='end'?p[0]:p[p.length-1],x=n[0]+(Math.sign(f2[0]-n[0])||-1)*rw.s;rwNear=Math.abs(x-P.x)<56&&Math.abs(P.y-n[1])<16;}
        const ring=(boss.rocks||[]).find(r=>Math.abs(r.x-P.x)<16&&Math.abs(r.gy-P.y)<8)||((m==='leapTell'||m==='leap')&&boss.leapTo!==undefined&&onTop(boss.leapTo)&&Math.abs(P.x-HS[boss.leapTo].home*TZ)<34?{x:HS[boss.leapTo].home*TZ,gy:P.y}:null);   /* (and the ring he will land on) */
        let busy=false;
        if((hkNear||rwNear)&&(P.ground||P.climb)){BK.press('jump');P.labJump=12;busy=true;}
        /* THE BAR lands at his drum's mouth (his ledge) and on his housing top: shield it on the ground, or jump it as it comes */
        const mq=HS[boss.at||0],mouthY=(mq.ledgeTop+1)*TZ,mouthX=mq.at==='end'?mq.ledge[0]*TZ:(mq.ledge[1]+1)*TZ;
        const barHere=(Math.abs(P.y-mouthY)<14&&Math.abs(P.x-mouthX)<72)||(onTop(boss.at||0)&&Math.abs(P.x-boss.x)<62);
        if(m==='leverTell'&&barHere&&!P.climb){busy=true;if(SHIELDED(h)&&P.ground){k.block=true;P.face=Math.sign(boss.x-P.x)||1;}else if(boss.modeT<0.22&&P.ground){BK.press('jump');P.labJump=14;}}
        if(!busy&&ring&&P.ground){busy=true;const side=P.x>ring.x?1:-1;go(ring.x+side*42);}
        /* ROUND SIX (claude/winch4): PHASE THREE - HE HAS COME DOWN. The hands go to the floor he stands on (the deck, or the Great Drum's
           ledge after his ride: the low line always runs to him) and duel him there: out of THE HOOK SWUNG's reach as it winds up, or,
           with no room to step out of it, a roll through it; THE WRENCH shielded (or backed off, without a shield) and cut while it
           is bitten into the planks; his ride in a skip jumped as it comes; the ring he comes down on stepped out of */
        const ph3=boss.phase===3,FLs=winchFloors(),hf=m==='descendTell'||m==='descend'?0:(boss.fl||0);
        const onF=i=>{const q=FLs[i];return P.ground&&!on&&!P.climb&&Math.abs(P.y-q.y)<4&&P.x>q.x0-8&&P.x<q.x1+8;};
        const duel=()=>{ const F=FLs[hf],dx=boss.x-P.x,ad=Math.abs(dx),side=Math.sign(dx)||1,md=boss.modeT,R=WM_K.whirlR;
          if(m==='descendTell'||m==='descend'){const rx=boss.toX,s=P.x>=rx?1:-1,out=rx+s*(WM_K.leapHit+26);if(Math.abs(P.x-rx)<WM_K.leapHit+14)go(out>F.x0+6&&out<F.x1-6?out:rx-s*(WM_K.leapHit+26));return;}
          if(m==='whirlTell'){ if(ad<R+8){const out=Math.max(F.x0+3,Math.min(F.x1-3,boss.x-side*(R+10)));if(Math.abs(out-boss.x)>R+3)go(out);else if(md<0.24&&P.ground&&!P.labJump){BK.press('jump');P.labJump=16;}} return; }   /* (no room on the deck to step out of it: over it) */
          if(m==='wrenchTell'&&ad<WM_K.wrenchHit+14){ if(SHIELDED(h)&&P.ground){k.block=true;P.face=side;} else go(boss.x-side*(WM_K.wrenchHit+22)); return; }
          if(m==='rideTell'||m==='ride'){ if(m==='ride'&&ad<64&&P.ground&&!P.labJump){BK.press('jump');P.labJump=14;} return; }
          if(ad>reach2-6)k[side>0?'right':'left']=true;
          if(ad<reach2&&Math.abs(P.y-boss.y)<40&&P.atk<0&&m!=='whirl'){P.face=side;BK.press('atk');swings++;} };
        if(busy){}
        else if(ph3&&onF(hf))duel();
        else if((m==='downed'||m==='thrown')&&Math.abs(P.y-(boss.toY??boss.y))<30&&!P.climb){ /* THE BONUS WINDOW: he is down on a ledge beside you - cut */
          const lx=boss.toX??boss.x,dx=boss.x-P.x,side=Math.sign(lx-P.x)||1,d=Math.abs(lx-P.x);
          const ln0=on?BK.L.cableway.lines[on.line]:null;
          if(ln0&&ln0.jam>0)k[ln0.dir>0?'right':'left']=true;   /* out of the jammed skip onto the ledge: when he cuts loose he takes the cable, and the skip goes into the pit */
          else if(P.atk<0&&d>reach2-4)k[side>0?'right':'left']=true;
          if(Math.abs(dx)<reach2&&P.atk<0&&m==='downed'){P.face=Math.sign(dx)||1;BK.press('atk');swings++;} }
        else if(on){ /* RIDING (round three: the room's floor is the pit, so the lines are the way round) - answer him and stay on: in the
          MIDDLE of the skip (a rider on its trailing lip who jumps the bar comes down behind it), and off onto the ledge at the far end */
          const ln0=BK.L.cableway.lines[on.line],p0=ln0.pts,end=ln0.dir>0?p0[p0.length-1]:p0[0],cx=on.x+on.w/2;
          if(ln0.jam>0||Math.abs(end[0]-cx)<10)k[ln0.dir>0?'right':'left']=true; else if(Math.abs(cx-P.x)>5)k[cx>P.x?'right':'left']=true;
          if(ph3&&m==='ride'&&Math.abs(boss.x-P.x)<64&&Math.abs(boss.y-P.y)<20&&!P.labJump){BK.press('jump');P.labJump=14;} }   /* (phase three: his skip coming along the line - over it) */
        else if(!ph3&&onTop(tgt)){ /* UP WITH HIM: in to reach, and cut */
          const dx=boss.x-P.x,side=Math.sign(dx)||1;
          if(Math.abs(dx)>reach2-6)k[side>0?'right':'left']=true;
          if(Math.abs(dx)<reach2&&Math.abs(P.y-boss.y)<40&&P.atk<0&&m!=='letgo'&&m!=='swing'&&m!=='leap'){P.face=side;BK.press('atk');swings++;} }
        else if(P.climb){ /* ON A LADDER: to the row this housing is reached from, and off it there */
          const lx=Math.floor(P.x/TZ);let want=null,off=0;
          if(ph3){ if(lx===LB){want=row(O.deck);off=Math.sign(deck1-LB);} else k.down=true; }   /* phase three: every ladder leads down - the Head Frame's to the deck */
          else if(lx===LB){ if(tgt===1){want=null;k.up=true;} else if(tgt===2){want=row(HB.ledgeTop);off=Math.sign(HB.ledge[0]-LB);} else {want=row(O.deck);off=Math.sign(deck1-LB);} }
          else if(lx===LA){ if(tgt===0)k.up=true; else k.down=true; }
          else if(lx===LC){ if(tgt===2)k.up=true; else k.down=true; }
          else k.up=true;
          /* step off from a hair ABOVE the floor it leads to (letting go level with it drops you a few pixels short, into the pit) */
          if(want!==null){ if(P.y<=want-2&&P.y>want-10)k[off>0?'right':'left']=true; else if(P.y>want-2)k.up=true; else k.down=true; } }
        else if(P.ground){
          const L2=BK.L,lines=L2.cableway.lines,lo=lines.find(l=>l.id==='low'),hi=lines.find(l=>l.id==='high');
          const at2=(x0,x1,r)=>Math.abs(P.y-(r+1)*TZ)<3&&P.x>x0*TZ-6&&P.x<(x1+1)*TZ+6;
          const topAt=HS.findIndex((q,i)=>onTop(i)||(Math.abs(P.x-(q.ladder[0]*TZ+8))<6&&Math.abs(P.y-(q.top+1)*TZ)<3));
          /* onto a skip coming under the step at a lip (the ore-ride rule: look before you step) - and never a rusted one (his phase
             two rusts every third skip, told by its colour: the hands read it the way a player does) */
          const board=(ln,lip,dir)=>{ const li=lines.indexOf(ln),step=P.x+dir*14,stand=lip-dir*6;
            const skip=ln.dir*dir>0&&!(ln.jam>0)&&BK.movers().some(q=>q.kind==='bucket'&&q.line===li&&q.vis&&!(q.fallen>0)&&!q.cracked&&step>q.x+4&&step<q.x+q.w-4&&Math.abs(q.y-P.y)<6);
            if(skip)k[dir>0?'right':'left']=true;else go(stand); };
          const climb=x=>{const lx=x*TZ+8;if(Math.abs(lx-P.x)>3)go(lx);else k.up=true;};
          const onLad=[LB,LA,LC].find(x=>Math.abs(P.x-(x*TZ+8))<7&&(BK.L.grid[Math.floor((P.y+2)/TZ)*BK.L.W+x]===T.NET||BK.L.grid[Math.floor((P.y-4)/TZ)*BK.L.W+x]===T.NET));
          const deck=at2(deck0,LB,O.deck);   /* (the Head Frame's ladder at deck level is part of the deck: that is where the low line is boarded) */
          if(ph3){ /* PHASE THREE, not on his floor: down off any housing, along whatever line runs to him, down the Head Frame's ladder to the deck */
            if(topAt>=0){const lx=HS[topAt].ladder[0]*TZ+8;if(Math.abs(lx-P.x)>3)go(lx);else k.down=true;}
            else if(onLad!==undefined){ if(onLad===LB){const w=row(O.deck);if(P.y<=w&&P.y>w-10)k[Math.sign(deck1-LB)>0?'right':'left']=true;else if(P.y>w)k.up=true;else k.down=true;} else k.down=true; }
            else if(deck){ if(hf===1)board(lo,(LB+1)*TZ,1); }
            else if(at2(HB.ledge[0],HB.ledge[1],HB.ledgeTop))climb(LB);
            else if(at2(HC.ledge[0],HC.ledge[1],HC.ledgeTop))board(hi,HC.ledge[0]*TZ,-1);
            else if(at2(GA.ledge[0],GA.ledge[1],GA.ledgeTop)){ if(lo.dir<0)board(lo,GA.ledge[0]*TZ,-1); else go((GA.ledge[0]+1)*TZ); }
            else if(PD&&at2(PD.ledge[0],PD.ledge[1],PD.ledge[2]))climb(PD.ladder[0]);
            else go(LB*TZ+8); }
          else if(deck&&tgt===0)board(lo,(LB+1)*TZ,1);
          else if(onLad!==undefined&&topAt<0){ /* STANDING ON A LADDER (its top, or a rung level with a floor): take hold the way it leads */
            if(onLad===LB){ const w=tgt===1?-1:tgt===2?row(HB.ledgeTop):row(O.deck),side=tgt===2?Math.sign(HB.ledge[0]-LB):Math.sign(deck1-LB); if(w<0)k.up=true; else if(P.y<=w&&P.y>w-10)k[side>0?'right':'left']=true; else if(P.y>w)k.up=true; else k.down=true; }
            else if((onLad===LA&&tgt===0)||(onLad===LC&&tgt===2))k.up=true; else k.down=true; }
          else if(topAt===tgt){ /* at the top of his ladder: step onto the housing */ const q=HS[tgt]; k[q.ladder[0]<q.x0?'right':'left']=true; }
          else if(topAt>=0){ /* up on a housing he has left: back down its ladder */ const lx=HS[topAt].ladder[0]*TZ+8; if(Math.abs(lx-P.x)>3)go(lx);else k.down=true; }
          else if(deck){ /* THE ENTRANCE DECK, for the Head Frame or the Tail Wheel: his ladder */ climb(LB); }
          else if(at2(HB.ledge[0],HB.ledge[1],HB.ledgeTop)){ /* the Head Frame's ledge */ if(tgt===2)board(hi,(HB.ledge[1]+1)*TZ,1); else climb(LB); }
          else if(at2(HC.ledge[0],HC.ledge[1],HC.ledgeTop)){ /* the Tail Wheel's ledge */ if(tgt===2)climb(LC);
            else board(hi,HC.ledge[0]*TZ,-1); /* for the Head Frame, and for the Great Drum the long way, never through the spikes - back along the high line, down the Head Frame's ladder to the deck, and the low line in */ }
          else if(at2(GA.ledge[0],GA.ledge[1],GA.ledgeTop)){ /* the Great Drum's ledge */ if(tgt===0)climb(LA); else if(lo.dir<0)board(lo,GA.ledge[0]*TZ,-1); else go((GA.ledge[0]+1)*TZ); }   /* (the low line runs in only while he is on the Great Drum: wait for it to turn, do not step into the pit) */
          else if(PD&&at2(PD.ledge[0],PD.ledge[1],PD.ledge[2])){ /* the pit's recovery ledge */ climb(PD.ladder[0]); }
          else go(LB*TZ+8); }
        else if(P.labAir) k[P.labAir]=true;
        /* A JUMP OFF A SKIP comes back down INTO it: in the air, steer over the skip it left (it goes on moving under you) */
        if(on)P.labSkip=on; else if(P.ground||P.climb)P.labSkip=null;
        else if(P.labSkip&&P.labSkip.vis&&!(P.labSkip.fallen>0)&&!k.left&&!k.right){const cx=P.labSkip.x+P.labSkip.w/2;if(Math.abs(cx-P.x)>4)k[cx>P.x?'right':'left']=true;}
        if(P.labJump>0){P.labJump--;k.jump=true;}
        const was=P.hp,m0=boss.mode;advance(1,!!opts.draw);taken+=Math.max(0,was-P.hp);{const lost=Math.max(0,was-P.hp),pit=P.pitLift&&P.pitLift.t===0;if(lost>0&&!pit){P.labLastHit=m0;P.labLastF=f;} ledger(pit?'PIT after '+(f-(P.labLastF??-999)<180?P.labLastHit:'a misstep'):m0,lost);}   /* a fall into the drum pit, and what put him there: a blow in the 3 s before it, or his own feet */if(P.dead)falls++;
        if(opts.onFrame)await opts.onFrame({boss,P,f,h,lvl:lvId,open:boss.open>0});if(f%600===599)await yieldNow();continue;
      }
      if(boss.t==='gargoyle'){
        k.left=k.right=k.up=k.down=k.jump=k.block=false;
        if(boss.open>0&&!wasOpen)opened++;wasOpen=boss.open>0;
        const m=boss.mode,slabs=BK.movers().filter(q=>q.arena&&q.slab&&!q.broken),on=P.onMover&&slabs.includes(P.onMover)?P.onMover:null,cen=q=>q.x+q.w/2;
        const dx=boss.x-P.x,side=Math.sign(dx)||1;
        const rest=P.st<14||(P.labRest&&P.st<40);P.labRest=rest;
        const next=(from,avoid,away)=>slabs.filter(q=>q!==from&&q!==avoid&&(!away||Math.sign(cen(q)-cen(from))===-side)).sort((a,b)=>Math.abs(cen(a)-cen(from))+(a.y!==from.y?200:0)-Math.abs(cen(b)-cen(from))-(b.y!==from.y?200:0))[0];   /* the same tier first: a hop across, not up */
        const goSlab=n=>{if(!n||!on)return;P.labTo=n;const dir=Math.sign(cen(n)-P.x)||1,edge=dir>0?on.x+on.w:on.x;k[dir>0?'right':'left']=true;if(P.ground&&Math.abs(edge-P.x)<14){BK.press('jump');P.labJump=16;}};
        if(on||P.windRide)P.labTo=null;
        if(P.windRide){ /* the wind has it: nothing to do */ }
        else if(P.flip){ /* under a slab: walk to its middle */ const s0=P.flareSlab;if(s0&&Math.abs(cen(s0)-P.x)>6)k[cen(s0)>P.x?'right':'left']=true; }
        else if(m==='stunned'){ /* HE IS ON THE SPIKES: over him, and down onto his back. A slab over him is stepped off its nearer end first */
          if(on&&boss.x>on.x-4&&boss.x<on.x+on.w+4){const l=boss.x-on.x,r=on.x+on.w-boss.x;k[l<r?'left':'right']=true;} else if(Math.abs(dx)>3)k[dx>0?'right':'left']=true; }
        else if(!on){ /* in the air (a jump, or off the lip): over a slab, steer onto it */
          const to=P.labTo&&!P.labTo.broken&&P.labTo.y>P.y-60?P.labTo:null,s0=to||slabs.filter(q=>q.y>P.y+2).sort((a,b)=>Math.abs(cen(a)-P.x)-Math.abs(cen(b)-P.x))[0];if(s0&&(P.vy>-60||P.labJump>0)&&Math.abs(cen(s0)-P.x)>4)k[cen(s0)>P.x?'right':'left']=true;else if(!s0&&P.ground)k.right=true; }
        else {
          let done=false;
          /* THE RUNE COLUMN (claude/bosswave2): ready, he flying in it, and it in reach from this slab - strike it, as a player who has read the sign does */
          { const rc=A.rune;if(rc&&!(rc.cd>0)&&P.atk<0&&['hover','diveTell','dive','fireballTell','breathTell','recover','flareTell','rise','reset'].includes(m)&&Math.abs(boss.x-rc.x)<13+15&&Math.abs(rc.x-P.x)<LAB_REACH[h]+8&&P.y>rc.top&&P.y<rc.bot){P.face=Math.sign(rc.x-P.x)||P.face;BK.press('atk');swings++;done=m!=='dive';} }
          if(m==='diveTell'&&boss.tgt===on){const n=next(on),dir=n?Math.sign(cen(n)-P.x)||1:1,ex=dir>0?on.x+on.w-10:on.x+10;if(Math.abs(ex-P.x)>3)k[ex>P.x?'right':'left']=true;done=true;}   /* to the edge, and wait: the aim is his until he drops */
          else if(m==='dive'&&boss.tgt===on){goSlab(next(on));done=true;}   /* LATE: he has dropped - go */
          else if(m==='flareTell'&&boss.fm===on){goSlab(next(on));done=true;}
          else if((m==='breathTell'&&boss.modeT<0.45)||m==='breath'){ if(SHIELDED(h)){k.block=true;P.face=side;} else if(m==='breathTell'){goSlab(next(on,null,true)||next(on));} done=true; }   /* THE FIRE: a shield, or off its line */
          else if((m==='smash'||m==='crash')&&boss.y>on.y+8){done=true;}
          if(!done){const tx=cen(on);if(Math.abs(tx-P.x)>6)k[tx>P.x?'right':'left']=true;}
          /* THE FIREBALLS (2026-09-28, in the wing gust's place; two, one after the other, since claude/gargoyle5 - the nearest one coming in is the one it answers): slow and aimed where it was thrown - a shield faces it; the others jump it
             as it comes in (a roll could carry them off the slab) */
          const b=(boss.balls||[]).filter(q=>Math.sign(q.vx)===-(Math.sign(q.x-P.x)||side)||Math.abs(q.x-P.x)<10).sort((p,q)=>Math.abs(p.x-P.x)-Math.abs(q.x-P.x))[0];if(b){const bs=Math.sign(b.x-P.x)||side,near=Math.abs(b.x-P.x),closing=Math.sign(b.vx)===-bs||near<10;
            if(closing&&near<70&&Math.abs(b.y-(P.y-9))<40){if(SHIELDED(h)){if(!done){k.block=true;k.left=k.right=false;P.face=bs;}}else if(near<34&&P.ground&&!P.labJump){BK.press('jump');P.labJump=10;}}}
        }
        if(P.labJump>0){P.labJump--;k.jump=true;}
        const was=P.hp,m0=boss.mode,ball0=(boss.balls||[]).length;advance(1,!!opts.draw);taken+=Math.max(0,was-P.hp);ledger(P.windRide&&P.windRide.why==='fall'&&P.windRide.t<0.05?'SPIKES after '+m0:ball0>(boss.balls||[]).length&&P.hp<was?'FIREBALL':m0,Math.max(0,was-P.hp));if(P.dead)falls++;if(opts.onFrame)await opts.onFrame({boss,P,f,h});
        if(f%600===599)await yieldNow();continue;
      }
      /* THE DUNE WORM, played as his hollow teaches it (docs/briefs/dune-worm.md). With the awning DOWN, wind it (to THE HOLLOW WINCH, strike it);
         with it OUT, wait under it while the ripple tracks, and when it COMMITS - a human beat later, 0.2 s - get off the locked spot, so he comes
         up INTO the canvas; cut him while he is up, twice as hard tangled. Every red tell is walked off (the lunge's shadow, the sinkhole - jumped
         out of while it pulls); his spit is taken on a shield, or got behind. In the storm a gust is braced for with block. It reads the REAL
         ripple only at the commit, where a player reads the bulge: before it both look the same and it follows neither. */
      if(boss.t==='duneworm'){
        k.left=k.right=k.up=k.down=k.jump=k.block=k.atk=false;
        const W=boss.st,m=boss.mode,cv=BK.caravan?BK.caravan():null,wn=cv&&cv.winches?cv.winches.find(q=>q.hollow):null;
        const can=wn&&wn.canopy?[wn.canopy.x0*TS+8,(wn.canopy.x1+1)*TS-8]:null,out=!!(wn&&wn.k>=0.95),mid=can?(can[0]+can[1])/2:(A.x0+A.x1)/2;
        const reach=LAB_REACH[h]+(boss.w||30)/2,dx=boss.x-P.x,side=Math.sign(dx)||1,touch=!!W&&['breach','tangled','surfaced','spitTell','spit','lungeTell','swallow','dive'].includes(m);
        const rest=P.labRest;let gx=null,swing=false,brace=false,wind=false;
        const real=W&&W.ripples.find(r=>r.real&&r.commit);
        const G=cv&&cv.stormNow&&cv.stormNow.phase==='gust'?cv.stormNow.dir:0;   /* in a gust, the way the arrow points */
        if(real){ P.dwSeen=P.dwSeen||f; if(f-P.dwSeen>=12){ const away=G||Math.sign(P.x-real.tx)||(P.x<mid?-1:1),room=(away>0?A.x1-P.x:P.x-A.x0)>60?away:-away;
            gx=real.tx+room*48; if(Math.abs(P.x-real.tx)<22&&P.ground&&!(P.dodge>0)&&P.st>20){k[room>0?'right':'left']=true;BK.press('dodge');} } }
        else P.dwSeen=0;
        if(gx===null&&(m==='swallowTell'||m==='swallow')&&W&&W.pit){ const away=Math.sign(P.x-W.pit.x)||(P.x<mid?1:-1),room=(away>0?A.x1-P.x:P.x-A.x0)>70?away:-away; gx=W.pit.x+room*70;
            if(m==='swallow'&&Math.abs(P.x-W.pit.x)<50&&P.ground){BK.press('jump');P.labJump=12;} }
        if(gx===null&&(m==='lungeTell'||m==='lunge')&&W){ const away=Math.sign(W.lungeTo-W.lungeFrom)||Math.sign(P.x-W.x)||1,room=(away>0?A.x1-P.x:P.x-A.x0)>70?away:-away; if(Math.abs(P.x-W.lungeTo)<52)gx=W.lungeTo+room*60; }   /* on, the way he is coming: away from the shadow AND from him */
        if(gx===null&&(m==='spitTell'||m==='spit')&&Math.abs(dx)<160){ if(SHIELDED(h)){k.block=true;P.face=side;}else if(h==='warden'){k.block=DEFLECT_TAP(f);P.face=side;}else gx=boss.x+side*24; }   /* the fan lands 35-145 px in front of him: shield it, or be behind him */
        if(gx===null&&!k.block){
          if(m==='tangled'||(touch&&!rest)){gx=boss.x-side*Math.max(12,Math.min(LAB_STAND[h]||14,reach-6));swing=!rest;}
          else if(wn&&!out&&wn.out===0&&!(wn.cd>0.2)){gx=wn.x-(P.x<wn.x?10:-10);wind=true;}
          else if(m==='rippleTell'||m==='under'||m==='dive'||m==='sleep'||m==='wake')gx=out?mid:P.x;
          else gx=P.x; }
        if(wind&&Math.abs(wn.x-P.x)<16&&P.atk<0&&P.ground){P.face=Math.sign(wn.x-P.x)||P.face;BK.press('atk');swings++;}
        const S=cv&&cv.stormNow;if(S&&S.phase==='gust'&&P.ground&&!real&&!(m==='swallow'||m==='swallowTell'||m==='lunge'||m==='lungeTell')&&!swing){brace=true;}
        if(brace&&(h==='knight'||h==='paladin'||h==='reaper'||h==='warden'||h==='pirate'))k.block=true;
        if(gx!==null&&!k.block&&Math.abs(gx-P.x)>4){gx=Math.max(A.x0+10,Math.min(A.x1-10,gx));k[gx>P.x?'right':'left']=true;}
        if(P.labJump>0){P.labJump--;k.jump=true;}
        if(swing&&!k.block&&P.atk<0&&Math.abs(dx)<=reach&&Math.abs(boss.y-P.y)<70){P.face=side;if(dx>0)k.left=false;else k.right=false;BK.press('atk');swings++;}
        const was=P.hp,m0=m;advance(1,!!opts.draw);taken+=Math.max(0,was-P.hp);ledger(m0,Math.max(0,was-P.hp));
        { const op=!!(boss.st&&boss.st.mode==='tangled'); if(op&&!wasOpen)opened++; wasOpen=op; }
        if(opts.onFrame)await opts.onFrame({boss,P,f,h,lvl:lvId,open:wasOpen});if(P.dead)falls++;if(f%600===599)await yieldNow();continue;
      }
      if(boss.t==='burieddead'){
        k.left=k.right=k.up=k.down=k.jump=k.block=false;
        const add=BK.enemies().filter(e=>e.alive&&e.graveAdd&&e.mode!=='riseTell').sort((a,b)=>Math.abs(a.x-P.x)-Math.abs(b.x-P.x))[0];
        const target=add&&Math.abs(add.x-P.x)<130?add:boss,dx=target.x-P.x,side=Math.sign(dx)||1,mode=boss.mode;let gx=target.x-side*(target.graveAdd?12:Math.max(20,LAB_REACH[h]*.65));
        const eruption=mode==='burrow'||mode==='eruptTell';
        if(eruption){const near=Math.abs(P.x-boss.x)<65;gx=near?boss.x+(P.x>boss.x?1:-1)*80:P.x;if(gx<A.x0+20)gx=boss.x+80;if(gx>A.x1-20)gx=boss.x-80;}
        /* THE GAS (claude/burial2): his rest opens nothing now, so the bot makes his opening the way a player does - fire from a wall
           candle, the vent he is nearest struck with it, then stand past the flame so he walks into it. Open, it fights him. */
        let ventHit=null;const HANDS_HIGH=34;
        if(!eruption&&!(boss.open>0)&&!(target.graveAdd&&Math.abs(target.x-P.x)<40)&&!['slamTell','novaTell','bodyTell','bodyFly','clawTell'].includes(mode)){
          const vents=(BK.L.gasVents||[]).filter(v=>v.x*16>A.x0&&v.x*16<A.x1),vx=v=>v.x*16+8,burning=vents.find(v=>v.litT>1&&!v.burnt);
          if(burning){const side=Math.sign(vx(burning)-boss.x)||1;gx=vx(burning)+side*44;if(gx<A.x0+14||gx>A.x1-14)gx=vx(burning)-side*44;}
          else if(P.candle>0){const v=vents.slice().sort((a,b)=>Math.abs(vx(a)-boss.x)-Math.abs(vx(b)-boss.x))[0];if(v){const from=Math.sign(P.x-vx(v))||1;gx=vx(v)+from*12;if(Math.abs(P.x-gx)<8&&P.ground)ventHit=v;}}
          else{const c=(BK.L.candles||[]).filter(c=>c.x*16>A.x0-24&&c.x*16<A.x1+24).sort((a,b)=>Math.abs(a.x*16+8-P.x)-Math.abs(b.x*16+8-P.x))[0];if(c)gx=c.x*16+8;}}
        /* (claude/bot2 triage) THE ATTACKS BURIAL3 ADDED, answered as his own callouts say - the hands had none of them, and they did most of the
           damage the lab put down to his 'rest' (they land after the tell, while he rests): POISON NOVA: GET CLEAR (112 px); BODY SLAM: MOVE (78 px
           of his mark); THE HANDS COME UP: MOVE YOUR FEET (34 px of the mark); HE THROWS THE DEAD (it lands where you stood: step off it);
           GRAVE HANDS: JUMP THEM (each arm as it comes up under you). Nothing is swung while one of these is coming. */
        let bdFlee=false;if(LABP.v2){const away=(x,r)=>{const s2=P.x>=x?1:-1;let g=x+s2*r;if(g<A.x0+16||g>A.x1-16)g=x-s2*r;return g;};
        if(mode==='novaTell'&&Math.abs(P.x-boss.x)<128&&P.y>A.floor-80){gx=away(boss.x,134);bdFlee=true;}
        else if((mode==='bodyTell'||mode==='bodyFly')&&Number.isFinite(boss.markX)&&Math.abs(P.x-boss.markX)<92){gx=away(boss.markX,96);bdFlee=true;}
        else if(mode==='clawTell'&&Number.isFinite(boss.markX)&&Math.abs(P.x-boss.markX)<44){gx=away(boss.markX,52);bdFlee=true;}
        else if(mode==='throwTell'&&boss.modeT<.3&&!P.labBdStep){P.labBdStep=P.x+((Math.sign(P.x-boss.x)||1)*40);}
        if(P.labBdStep!==undefined&&P.labBdStep!==null){if(boss.flying||mode==='throwTell'){gx=P.labBdStep;bdFlee=true;}else P.labBdStep=null;}
        const hl=boss.handLine;if(hl&&P.y>A.floor-HANDS_HIGH){const arm=hl.arms.find(q=>Math.abs(q.x-P.x)<16&&hl.t>q.at-0.14&&hl.t<q.at+0.2);if(arm){bdFlee=true;gx=P.x;if(P.ground&&!(P.labJump>0)){BK.press('jump');P.labJump=18;}}}}   /* (the triage answers ride the v2 profiles; 'legacy' is the old hands exactly) */
        if(ventHit&&P.atk<0){P.face=Math.sign(ventHit.x*16+8-P.x)||1;BK.press('atk');}
        if(mode==='slamTell'&&boss.modeT<.3&&P.ground){BK.press('jump');P.labJump=18;}
        if(P.labJump>0){P.labJump--;k.jump=true;}
        if(P.ground&&P.y<A.floor-20&&mode!=='slamTell'){k.down=true;BK.press('jump');}
        const guard=!eruption&&(mode==='cleaveTell'&&Math.abs(boss.x-P.x)<95||(boss.skulls||[]).some(q=>q.t>=0&&Math.abs(q.x-P.x)<70)||target.graveAdd&&target.mode==='grabTell'&&target.modeT<.22);
        if(guard&&SHIELDED(h)){k.block=true;gx=P.x;P.face=mode==='cleaveTell'?(Math.sign(boss.x-P.x)||1):side;}else if(guard){const gs=mode==='cleaveTell'?(Math.sign(boss.x-P.x)||1):side;gx=P.x-gs*65;if((mode==='cleaveTell'?boss:target).modeT<.2)BK.press('dodge');}
        if(Math.abs(gx-P.x)>5)k[gx>P.x?'right':'left']=true;
        if((h!=='paladin'||P.st>=44)&&!guard&&!bdFlee&&!eruption&&mode!=='sinkTell'&&!(mode==='slamTell'&&boss.modeT<.65)&&Math.abs(dx)<LAB_REACH[h]+target.w/2&&Math.abs(P.y-target.y)<32&&P.atk<0){P.face=side;BK.press('atk');swings++;}
        const was=P.hp,m0=mode;advance(1,!!opts.draw);taken+=Math.max(0,was-P.hp);ledger(m0,Math.max(0,was-P.hp));if(opts.onFrame)await opts.onFrame({boss,P,target,f,h});if(f%600===599)await yieldNow();continue;
      }
      if(boss.t==='gorgecrab'){
        /* THE GREAT RED CRAB (claude/redgorge): src/gorge-crab.js gorgeCrabPlan reads what a player sees - his tells a quarter-second late (some misread), the boulders'
           marks, the dam's water (the horn, a flood running, the gate holding one) - and works the level's machine: it shuts the gate at a wheel, waits for a flood to
           bank, baits him into the channel, releases (INTERACT) and cuts him on his back. It rests inside its own branch */
        k.left=k.right=k.up=k.down=k.jump=k.block=false;
        const CH=BK.gorgeCrabHands(),F=CH&&CH.fight(),Wt=CH?CH.water():{};
        if(f===0||!P.labGcMem)P.labGcMem={};
        const pl=F?gorgeCrabPlan({P:{x:P.x,y:P.y,face:P.face,ground:P.ground,atk:P.atk},F,e:boss,water:Wt,wheels:BK.L.arena.wheels,ch:BK.L.arena.ch,reach:LAB_REACH[h],shield:SHIELDED(h),t:f/60,rng:Math.random,mem:P.labGcMem}):{gx:null,face:P.face};
        if(pl.jump&&P.ground){if(P.labJumpF===undefined||f-P.labJumpF>14){BK.press('jump');P.labJumpF=f;P.labJump=14;}}
        if(P.labJump>0){P.labJump--;k.jump=true;}
        if(pl.block)k.block=true;
        if(!pl.block&&pl.gx!=null&&Math.abs(pl.gx-P.x)>3)k[pl.gx>P.x?'right':'left']=true;else if(!k.left&&!k.right)P.face=pl.face||P.face;
        if(pl.talk){P.face=pl.face||P.face;if(P.labTalkF===undefined||f-P.labTalkF>12){BK.press('talk');P.labTalkF=f;}}
        if(pl.atk&&P.atk<0){P.face=pl.face||P.face;BK.press('atk');swings++;}
        const was=P.hp,m0=boss.mode;advance(1,!!opts.draw);taken+=Math.max(0,was-P.hp);ledger(m0,Math.max(0,was-P.hp));if(opts.onFrame)await opts.onFrame({boss,P,f,h,lvl:lvId,open:F?crabOpen(F):false,why:pl.why});if(f%600===599)await yieldNow();continue;
      }
      if(boss.t==='cisternqueen'){
        /* THE CISTERN QUEEN (claude/welltown3): src/cistern-queen.js queenPlan reads what a player sees - her tells a quarter-second late (some misread), the mound
           under the sand, her wall, the bands, the rubble's shadows, the claw - and works the level's verb: it fills the skin at a basin, floods her burrow (a pour
           on the mound, or the windlass's bucket on the sump), climbs to her wall's ledge and pours down the wall, strikes the claw or mashes out of it, and cuts
           in her openings. It rests inside its own branch */
        k.left=k.right=k.up=k.down=k.jump=k.block=false;
        const QH=BK.cisternQueenHands(),S=QH&&QH.show();
        if(f===0||!P.labCqMem)P.labCqMem={};
        const pl=S?queenPlan({tip:h==='warden'?WARDEN_TIP:0,P:{x:P.x,y:P.y,face:P.face,ground:P.ground,atk:P.atk,climb:!!P.climb,onLedge:QH.onLedge(P),snare:P.snare||0},e:boss,S,sips:(P.skin&&P.skin.sips)||0,reach:LAB_REACH[h],shield:SHIELDED(h),t:f/60,rng:Math.random,mem:P.labCqMem}):{gx:null,face:P.face};
        if(pl.dodge&&P.ground&&(P.labDodgeF===undefined||f-P.labDodgeF>30)){if(pl.gx!=null)k[pl.gx>P.x?'right':'left']=true;BK.press('dodge');P.labDodgeF=f;}
        if(pl.jump&&(P.ground||P.climb)){if(P.labJumpF===undefined||f-P.labJumpF>14){BK.press('jump');P.labJumpF=f;P.labJump=14;}}
        if(P.labJump>0){P.labJump--;k.jump=true;}
        if(pl.down)k.down=true;if(pl.up)k.up=true;
        if(pl.block)k.block=true;
        if(!pl.block&&!(pl.down&&P.ground&&!pl.jump)&&pl.gx!=null&&Math.abs(pl.gx-P.x)>3)k[pl.gx>P.x?'right':'left']=true;else if(!k.left&&!k.right)P.face=pl.face||P.face;
        if(pl.talk){P.face=pl.face||P.face;if(P.labTalkF===undefined||f-P.labTalkF>12){BK.press('talk');P.labTalkF=f;}}
        if(pl.atk&&P.atk<0){P.face=pl.face||P.face;BK.press('atk');swings++;}
        if(OPEN(boss,BK)&&!wasOpen)opened++;wasOpen=!!OPEN(boss,BK);
        const was=P.hp,m0=boss.mode;advance(1,!!opts.draw);taken+=Math.max(0,was-P.hp);ledger(m0,Math.max(0,was-P.hp));if(opts.onFrame)await opts.onFrame({boss,P,f,h,lvl:lvId,open:qOpen(boss),why:pl.why});if(f%600===599)await yieldNow();continue;
      }
      if(boss.t==='djinn'){
        /* THE DJINN OF THE GREAT WELL (claude/welltown5): src/djinn.js djinnPlan reads what a player sees - his tells a quarter-second late (some misread), the
           marks on the floor, the devil and the waves, his hand on a ledge - and works the level's verb: it fills the skin at a spring, pours on him (mud, then
           the douse), douses itself, climbs to the east ledge in the flood and strikes the crank, and cuts in his openings. It rests inside its own branch */
        k.left=k.right=k.up=k.down=k.jump=k.block=false;
        const DH=BK.djinnHands(),S=DH&&DH.show();
        if(f===0||!P.labDjMem)P.labDjMem={};
        const pl=S?djinnPlan({tip:h==='warden'?WARDEN_TIP:0,P:{x:P.x,y:P.y,face:P.face,ground:P.ground,atk:P.atk,climb:!!P.climb,onLedge:DH.onLedge(P),snare:P.snare||0,burn:P.djBurn||0,busy:h==='warden'?(P.blastT||0)+(P.deflectRec||0):0},e:boss,S,sips:(P.skin&&P.skin.sips)||0,reach:LAB_REACH[h],shield:SHIELDED(h),deflect:h==='warden',t:f/60,rng:Math.random,mem:P.labDjMem}):{gx:null,face:P.face};
        if(pl.dodge&&P.ground&&(P.labDodgeF===undefined||f-P.labDodgeF>30)){if(pl.gx!=null)k[pl.gx>P.x?'right':'left']=true;BK.press('dodge');P.labDodgeF=f;}
        if(pl.jump&&(P.ground||P.climb)){if(P.labJumpF===undefined||f-P.labJumpF>14){BK.press('jump');P.labJumpF=f;P.labJump=14;}}
        if(P.labJump>0){P.labJump--;k.jump=true;}
        if(pl.down)k.down=true;if(pl.up)k.up=true;
        if(pl.block)k.block=h==='warden'?DEFLECT_TAP(f):true;
        if(!pl.block&&!(pl.down&&P.ground&&!pl.jump)&&pl.gx!=null&&Math.abs(pl.gx-P.x)>3)k[pl.gx>P.x?'right':'left']=true;else if(!k.left&&!k.right)P.face=pl.face||P.face;
        if(pl.talk){P.face=pl.face||P.face;if(P.labTalkF===undefined||f-P.labTalkF>12){BK.press('talk');P.labTalkF=f;}}
        if(pl.atk&&P.atk<0){P.face=pl.face||P.face;BK.press('atk');swings++;}
        if(OPEN(boss,BK)&&!wasOpen)opened++;wasOpen=!!OPEN(boss,BK);
        const was=P.hp,m0=boss.mode;advance(1,!!opts.draw);taken+=Math.max(0,was-P.hp);ledger(m0,Math.max(0,was-P.hp));if(opts.onFrame)await opts.onFrame({boss,P,f,h,lvl:lvId,open:djOpen(boss),why:pl.why});if(f%600===599)await yieldNow();continue;
      }
      if(boss.t==='gangleader'){
        /* THE GANG LEADER (claude/welltown3): src/gang-leader.js glPlan - his tells a quarter-second late (some misread), a bottle struck back when it comes in
           reach (some let go), cuts between his blows a blow short of greed, the whirl and the fire stepped out of, hard cuts while he burns */
        k.left=k.right=k.up=k.down=k.jump=k.block=false;
        const GH=BK.gangLeaderHands(),F=GH&&GH.fight();
        if(f===0||!P.labGlMem)P.labGlMem={};
        const greed=BK.greed?BK.greed.count(boss):0;
        const pl=F?glPlan({tip:h==='warden'?WARDEN_TIP:0,P:{x:P.x,y:P.y,face:P.face,ground:P.ground,atk:P.atk,burn:P.glBurn||0,busy:h==='warden'?(P.blastT||0)+(P.deflectRec||0):0},e:boss,F,reach:LAB_REACH[h],shield:SHIELDED(h),deflect:h==='warden',sips:(P.skin&&P.skin.sips)||0,t:f/60,rng:Math.random,mem:P.labGlMem,greed}):{gx:null,face:P.face};   /* (claude/welltown5: and the skin - a puddle in his path, a douse when his fire catches you, a fill at the well head) */
        if(pl.dodge&&P.ground&&(P.labDodgeF===undefined||f-P.labDodgeF>30)){if(pl.gx!=null)k[pl.gx>P.x?'right':'left']=true;BK.press('dodge');P.labDodgeF=f;}
        if(pl.jump&&P.ground){if(P.labJumpF===undefined||f-P.labJumpF>14){BK.press('jump');P.labJumpF=f;P.labJump=14;}}
        if(P.labJump>0){P.labJump--;k.jump=true;}
        if(pl.block)k.block=h==='warden'?DEFLECT_TAP(f):true;   /* (the warden's deflect is a sweep on the beat, tapped) */
        if(!pl.block&&pl.gx!=null&&Math.abs(pl.gx-P.x)>3)k[pl.gx>P.x?'right':'left']=true;else if(!k.left&&!k.right)P.face=pl.face||P.face;
        if(pl.talk){P.face=pl.face||P.face;if(P.labTalkF===undefined||f-P.labTalkF>12){BK.press('talk');P.labTalkF=f;}}
        if(pl.atk&&P.atk<0){P.face=pl.face||P.face;BK.press('atk');swings++;}
        if(OPEN(boss,BK)&&!wasOpen)opened++;wasOpen=!!OPEN(boss,BK);
        const was=P.hp,m0=boss.mode;advance(1,!!opts.draw);taken+=Math.max(0,was-P.hp);ledger(m0,Math.max(0,was-P.hp));if(opts.onFrame)await opts.onFrame({boss,P,f,h,lvl:lvId,open:glOpen(boss),why:pl.why});if(f%600===599)await yieldNow();continue;
      }
      if(boss.t==='greenteeth'){
        /* JENNY GREENTEETH (claude/lockkeeper): src/jenny-greenteeth.js greenteethPlan reads what a player sees - the ring on the water, the bands, the
           surge's crest, her hand on the paddle, OPEN - a quarter-second late and not always right (PLAN: it misreads some tells, lets some hands go, is
           late to some paddles); it swims, climbs the walers, works the paddles and drops the lamps. It rests inside its own branch */
        k.left=k.right=k.up=k.down=k.jump=k.block=false;
        const GH=BK.greenteethHands(),show=GH&&GH.show();
        if(f===0||!P.labGtMem)P.labGtMem={};
        const mv=P.onMover,wi=mv&&mv.weed&&show?show.weed.findIndex(q=>q.m===mv.wi&&q.firm&&!(q.broken>0)):-1;
        const pl=show?greenteethPlan({P:{x:P.x,y:P.y,face:P.face,ground:P.ground,swim:!!P.swim,snare:P.snare||0,atk:P.atk,onWeed:P.ground?wi:-1,onTile:!!P.ground&&!P.onMover,dodge:P.dodge||0},e:boss,show,reach:LAB_REACH[h],shield:SHIELDED(h),t:f/60,rng:Math.random,mem:P.labGtMem}):{gx:null,face:P.face};
        if(pl.meet!==undefined){P.face=pl.face||P.face;if(h==='warden')k.block=pl.meet<0.2&&DEFLECT_TAP(f);else if(h==='pyro'){if(emberPlan(BK,h,boss)==='raise')k.down=true;}else k.block=pl.meet<0.4;}   /* (claude/jenny2: her bite MET dazes her - the knight's shield, the warden's deflect on the beat, the pyromancer's flare) */
        if(pl.drop&&P.ground){k.down=true;if(P.labDrop===undefined||f-P.labDrop>20){BK.press('jump');P.labDrop=f;}}
        else if(pl.jump&&(P.ground||P.swim)){if(P.labJumpF===undefined||f-P.labJumpF>14){BK.press('jump');P.labJumpF=f;P.labJump=14;}}
        if(P.labJump>0){P.labJump--;k.jump=true;}
        if(pl.down)k.down=true;if(pl.up)k.up=true;
        if(pl.block)k.block=true;
        if(!(pl.down&&P.ground)&&!pl.block&&pl.gx!=null&&Math.abs(pl.gx-P.x)>3)k[pl.gx>P.x?'right':'left']=true;else if(!k.left&&!k.right)P.face=pl.face||P.face;
        if(pl.atk&&P.atk<0){P.face=pl.face||P.face;BK.press('atk');swings++;}
        const was=P.hp,m0=boss.mode;advance(1,!!opts.draw);taken+=Math.max(0,was-P.hp);ledger(m0,Math.max(0,was-P.hp));if(opts.onFrame)await opts.onFrame({boss,P,f,h,lvl:lvId,open:gtOpen(boss),why:pl.why});if(f%600===599)await yieldNow();continue;
      }
      if(boss.t==='puppeteer'){
        /* THE PUPPETEER (claude/puppeteer): src/puppeteer.js puppetPlan reads what a player sees - a glowing string in reach is cut, a told blow is blocked,
           jumped, ducked or stepped out of, the opening (him re-stringing, or fallen) is run to, and from phase 2 the batten takes it up to the gallery */
        k.left=k.right=k.up=k.down=k.jump=k.block=false;
        const PH=BK.puppeteerHands(),show=PH&&PH.show(),bat=show&&show.batten;
        if(f===0||!P.labPupMem)P.labPupMem={};
        const pl=show?puppetPlan({P:{x:P.x,y:P.y,face:P.face,ground:P.ground,atk:P.atk,snare:P.snare,dazzle:P.pupDazzle||0},e:boss,show,reach:LAB_REACH[h],shield:SHIELDED(h),onBatten:!!bat&&P.onMover===bat,t:f/60,rng:Math.random,mem:P.labPupMem}):{gx:null,face:P.face};   /* A HUMAN BOT (claude/puppeteer2): it sees a tell or a glow a quarter-second late, lets some glows go, misreads some tells (puppeteer.js PLAN); Math.random is the row's own seeded dice */
        if(pl.drop&&P.ground){k.down=true;if(P.labDrop===undefined||f-P.labDrop>20){BK.press('jump');P.labDrop=f;}}
        else if(pl.jump&&P.ground){BK.press('jump');P.labJump=16;}
        if(P.labJump>0){P.labJump--;k.jump=true;}
        if(pl.down&&P.ground)k.down=true;
        if(pl.block)k.block=true;
        if(!pl.down&&!pl.block&&pl.gx!=null&&Math.abs(pl.gx-P.x)>4)k[pl.gx>P.x?'right':'left']=true;else if(!k.left&&!k.right)P.face=pl.face||P.face;
        if(pl.atk&&P.atk<0&&!pl.down){P.face=pl.face||P.face;BK.press('atk');swings++;}
        const was=P.hp,m0=boss.mode;advance(1,!!opts.draw);taken+=Math.max(0,was-P.hp);ledger(m0,Math.max(0,was-P.hp));if(opts.onFrame)await opts.onFrame({boss,P,f,h,lvl:lvId,open:boss.open>0,why:pl.why});if(f%600===599)await yieldNow();continue;
      }
      if(boss.t==='wickerqueen'){
        /* THE WICKER QUEEN ON HER CAROUSEL (claude/fair3; the carousel, claude/fairboss): the fire opening, taught, and the read between up and down.
           UP: when the floor is told to burn (or burns), get on a horse - the nearest one on the front run that will not go round the back under him - and
           ride it; one near the far end, hop to the next. DOWN: when the high ribbons or her high spear thrust come, off the horse and ducked on the boards;
           her LOW thrust is jumped (claude/fairfix2-spear: her spear replaced her sickle).
           THE FIRE: stand on the far side of the embers from her with your back turned; turn round the moment she stands well onto them (in her dark, near
           enough for the look to reach her); cut her while she burns. Looking at her he lets the ride carry him (it carries her the same, so the look
           holds) rather than walk against it with his back to her. The rest of the time: face her (she cannot move), jump the low ribbon, turn on a reap's
           glow, and cut down a crowned mummer that gets near. */
        k.left=k.right=k.up=k.down=k.jump=k.block=false;
        /* (claude/fairfix3) HER FIRES ARE SEVERAL NOW (BK.L.wqPits: the firebox and the ring pits): lure her to the hot one nearest her; her ball is jumped, her sweep read like a
           lash (low: jump each pass; high: duck), her leap's crouch looked at (it holds her), and a told landing stepped away from */
        const G=BK.L.green,q=boss,mx=G.maypole*16+8,hot=(BK.L.wqPits||[]).filter(p=>!(p.fire?q.bank>0:p.bank>0)),pit=hot.sort((a,b)=>Math.abs(a.mid-q.x)-Math.abs(b.mid-q.x))[0],mid=pit?pit.mid:G.bonfire*16+8,E=pit?(pit.x1-pit.x0)/2:40,dq=q.x-P.x,sq=Math.sign(dq)||1;
        /* (claude/fairfix4) HER BALL IS STRUCK BACK: coming at him he holds his blade (a mash only scatters it), faces it, and begins one blow as it reaches him - the Pyromancer
           flares instead; a ball he cannot meet is jumped as before. HER COPIES are read like her crowd was: a glowing one is looked at, a near one cut down. THE BONFIRE RING:
           the gap or a horse, whichever is nearer */
        const balls=(BK.fair()&&BK.fair().wqBalls)||[],ballCome=balls.find(b=>!b.ret&&Math.abs(b.x-P.x)<150&&Math.sign(P.x-b.x)===b.dir),ballNear=balls.find(b=>!b.ret&&Math.abs(b.x-P.x)<36&&Math.sign(P.x-b.x)===b.dir),sweepK=q.mode==='sweepLowTell'?'low':q.mode==='sweepHighTell'?'high':q.mode==='sweep'?q.sweepKind:null,sFront=q.mode==='sweep'?wqSweepFront(A,q.sweepK||0,q.sweepDir||1):null;
        const landing=(q.mode==='leapTell'||q.mode==='leap')&&q.leapTo&&q.leapTo.kind==='floor'&&Math.abs(q.leapTo.x-P.x)<36;
        let gx=P.x,face=sq,swing=null,look=false;
        const lashK=q.mode==='lashLowTell'?'low':q.mode==='lashHighTell'?'high':q.mode==='lash'?q.lashKind:null,front=q.mode==='lash'?(q.lashR||0):-1,dm=Math.abs(P.x-mx);
        const mums=[...BK.enemies().filter(e=>e.alive&&e.t==='mummer'),...(q.fakes||[]).map(f=>Object.assign(f,{w:22,alive:true}))].filter(e=>Math.abs(e.x-P.x)<120&&Math.abs(e.y-P.y)<30).sort((a,b)=>Math.abs(a.x-P.x)-Math.abs(b.x-P.x));
        const glowM=mums.find(e=>e.mode==='glow'),nearM=mums.find(e=>Math.abs(e.x-P.x)<60);
        const HS=BK.movers().filter(m=>m.kind==='carhorse'&&!m.broken),hc=m=>m.x+m.w/2,ride=P.onMover&&P.onMover.kind==='carhorse'?P.onMover:null;
        const ringOn=q.mode==='ringTell'||q.mode==='ring',gapX=ringOn?(q.gapX||0):0,horseD=Math.min(1e9,...HS.map(m=>Math.abs(hc(m)-P.x))),toGap=ringOn&&!ride&&Math.abs(gapX-P.x)<=horseD+20;
        const floorD=q.mode==='floorTell'||q.mode==='floor'||(ringOn&&!toGap);
        const thrK=q.mode==='thrustHighTell'?'high':q.mode==='thrustLowTell'?'low':q.mode==='thrust'?q.thrustKind:null,thrTell=q.mode==='thrustHighTell'||q.mode==='thrustLowTell',adq=Math.abs(dq);
        const thrIn=!!thrK&&adq<96+12&&Math.sign(P.x-q.x)===(q.thrustDir||q.face)&&!(q.mode==='thrust'&&(q.tip||0)>adq+8);   /* her spear told (or running out) his way, and not yet past him */
        const highD=lashK==='high'||(thrK==='high'&&thrIn)||(sweepK==='high'&&(q.mode==='sweep'?Math.abs(sFront-P.x)<70:q.modeT<0.35));
        const side=-1,lureX=Math.max(A.x0+20,Math.min(A.x1-20,mid+side*46)),transit=Math.abs(lureX-P.x)>40&&Math.sign(lureX-P.x)!==sq&&!(LABP.v2&&h==='reaper');   /* (claude/herobots) the Death Knight cannot outrun her stab, so he looks at it like everyone else */
        if(landing&&!highD){gx=P.x+(P.x<q.leapTo.x?-1:1)*60;face=sq;}   /* (claude/fairfix3) her landing is marked: off the mark */
        else if(q.mode==='leapTell'){face=sq;look=true;gx=P.x;}   /* her crouch: look at her, and the leap is held */
        else if(toGap&&!highD){gx=gapX+(q.mode==='ring'?(q.gapDir||1)*6:0);face=sq;}   /* (claude/fairfix4) THE BONFIRE RING: into the gap, and keep in it as it travels */
        else if(floorD&&!highD){   /* UP ON A HORSE */
          const end=A.x1-70,ok=HS.filter(m=>hc(m)<end),pick=ok.sort((a,b)=>Math.abs(hc(a)-P.x)-Math.abs(hc(b)-P.x))[0];
          if(ride&&hc(ride)<end+30){gx=hc(ride);face=glowM?Math.sign(glowM.x-P.x)||1:sq;look=true;}
          else if(pick){gx=hc(pick);face=Math.sign(gx-P.x)||sq;if((P.ground||ride)&&Math.abs(P.x-gx)<(ride?40:9)&&!(P.labJump>0)){BK.press('jump');P.labJump=22;}}
        }
        else if(highD){   /* DOWN ON THE BOARDS, AND DUCKED (her ribbons, and a thrust once told, do not care which way he faces: mid-lure, he keeps his back to her) */
          if(ride){const l=ride.x-6,r=ride.x+ride.w+6;gx=Math.abs(P.x-l)<Math.abs(P.x-r)?l:r;face=Math.sign(gx-P.x)||sq;}
          else{gx=P.x;face=glowM?Math.sign(glowM.x-P.x)||1:(lashK!=='high'&&!(thrK==='high'&&thrIn)&&P.face===-sq)?-sq:sq;look=true;}   /* (ducked, he still looks at a mummer whose mask glows: it stops) */
        }
        else if(q.open>0){gx=q.x-sq*Math.max(10,LAB_REACH[h]-6);face=sq;swing=q;}   /* she burns: get on her */
        else if(glowM){face=Math.sign(glowM.x-P.x)||1;swing=glowM;}   /* a mummer's red mask: look at it (it stops), and cut it */
        else if(nearM){const ms=Math.sign(nearM.x-P.x)||1;face=ms;gx=nearM.x-ms*Math.max(10,LAB_REACH[h]-6);swing=nearM;}   /* one of her crowd near: face it, step in, cut it down */
        else if(q.mode==='stabTell'&&!transit){face=sq;look=true;}   /* the stab's red glow: LOOK, and it is cancelled (or, already running for the far side, outrun it) */
        else if(q.mode==='rise'||q.mode==='catch'){face=sq;look=true;}   /* flung off the fire: hold her with the look */
        else if(q.x<mid-E+4){gx=q.x+34;face=-1;look=P.x>q.x;}   /* UPSTREAM of the fire: stand by her, looking - the ride carries them both, and brings her onto it */
        else{gx=lureX;const deep=Math.abs(q.x-mid)<E-8&&!(q.bank>0),reach=q.phase===2?90:600;
          if(Math.abs(gx-P.x)>8)face=Math.sign(gx-P.x)||1;else{face=(deep&&Math.abs(dq)<reach)||Math.abs(dq)<60?sq:-sq;look=face===sq;}}   /* THE LURE: upstream of the embers, back turned until she is well onto them (banked, she comes on across them to be brought back), then look */
        if(!ride&&lashK==='low'&&P.ground&&q.mode==='lash'&&front>dm-70&&front<dm+10){BK.press('jump');P.labJump=16;}
        if(!ride&&thrK==='low'&&thrIn&&P.ground&&((thrTell&&q.modeT<0.12)||q.mode==='thrust')){BK.press('jump');P.labJump=16;}   /* her LOW thrust: over it as the line runs out */
        let striking=false;
        if(!ride&&P.ground&&ballCome&&!highD&&!floorD&&!toGap){const ahead=(ballCome.x-P.x)*Math.sign(ballCome.x-P.x),held=f-(P.labSwingF??-999)>=48;
          if(held||ahead<60){striking=true;swing=null;gx=P.x;face=Math.sign(ballCome.x-P.x)||face;}   /* hold the blade and face it */
          /* a human's hand, not a machine's: where he begins the blow is his own for each ball (0-44 px off, deterministic - the row's dice are left alone); the window is 6-32 */
          const tgt=ballCome.labTgt??(ballCome.labTgt=((ballCome.n||0)*37+h.length*11)%45);
          if(!ballCome.labTried&&h==='pyro'&&ahead<=tgt&&!(P.labFlare>0)){k.down=true;P.labFlare=30;ballCome.labTried=true;}   /* the ember flare */
          else if(!ballCome.labTried&&h!=='pyro'&&held&&ahead<=tgt&&P.atk<0){P.face=face;BK.press('atk');swings++;P.labSwingF=f;ballCome.labTried=true;}}
        if(P.labFlare>0)P.labFlare--;
        if(!ride&&P.ground&&ballNear&&!(striking&&!ballNear.labTried)){BK.press('jump');P.labJump=16;}   /* (claude/fairfix3) her wicker ball: over it (when he is not meeting it, or his blow went wide) */
        if(!ride&&P.ground&&sweepK==='low'&&q.mode==='sweep'&&Math.abs(sFront-P.x)<34){BK.press('jump');P.labJump=16;}   /* her low sweep: over each pass */
        if(P.labJump>0){P.labJump--;k.jump=true;}
        const duck=!ride&&P.ground&&((lashK==='high'&&((q.mode==='lashHighTell'&&q.modeT<0.25)||(q.mode==='lash'&&front<dm+20)))||(thrK==='high'&&thrIn&&(!thrTell||q.modeT<0.3))||(sweepK==='high'&&q.mode==='sweep'&&Math.abs(sFront-P.x)<60));   /* (claude/fairfix3) and under her high sweep as each pass comes by */
        if(duck){k.down=true;gx=P.x;swing=null;}
        /* looking at her he does not walk with his back to her: the ride carries them both, so the look holds */
        const want=Math.abs(gx-P.x)>5&&!(look&&Math.sign(gx-P.x)!==face);
        if(!duck&&want)k[gx>P.x?'right':'left']=true;else P.face=face;
        if(!duck&&!floorD&&!striking&&swing&&P.atk<0&&Math.abs(swing.x-P.x)<LAB_REACH[h]+(swing.w||10)/2+4&&Math.abs(swing.y-P.y)<30){P.face=Math.sign(swing.x-P.x)||1;BK.press('atk');swings++;P.labSwingF=f;}
        const was=P.hp,m0=q.mode;advance(1,!!opts.draw);taken+=Math.max(0,was-P.hp);ledger(m0,Math.max(0,was-P.hp));if(opts.onFrame)await opts.onFrame({boss,P,f,h,lvl:lvId,open:q.open>0});if(f%600===599)await yieldNow();continue;
      }
      if(boss.t==='harbormaster'){
        k.left=k.right=k.up=k.down=k.jump=k.block=false;
        const dx=boss.x-P.x,side=Math.sign(dx)||1;let gx=boss.x-side*Math.max(18,LAB_REACH[h]*.65);
        const pressure=['pressureTell','twinTell'].includes(boss.mode),marked=pressure&&(boss.marks||[]).some(x=>Math.abs(P.x-x)<31);
        if(pressure){const gaps=(boss.marks||[]).flatMap(x=>[x-34,x+34]).filter(x=>x>A.x0+18&&x<A.x1-18&&(boss.marks||[]).every(m=>Math.abs(x-m)>30));gx=gaps.sort((a,b)=>Math.abs(a-P.x)-Math.abs(b-P.x))[0]??P.x;}
        if(boss.mode==='lowTell'&&boss.modeT<.25&&P.ground){BK.press('jump');P.labJump=18;}
        if(P.labJump>0){P.labJump--;k.jump=true;}
        if(boss.mode==='highTell'&&P.ground&&P.y<A.floor-20){k.down=true;BK.press('jump');}
        const guard=['anchorTell','harpoonTell'].includes(boss.mode);
        if(guard&&SHIELDED(h)){k.block=true;gx=P.x;P.face=side;}
        else if(guard&&boss.modeT<.24){k[side>0?'left':'right']=true;BK.press('dodge');gx=P.x;}
        if(Math.abs(gx-P.x)>5)k[gx>P.x?'right':'left']=true;
        if(!guard&&!pressure&&!(boss.mode==='lowTell'&&boss.modeT<.65)&&!(boss.mode==='highTell'&&P.y<A.floor-20)&&Math.abs(dx)<LAB_REACH[h]+boss.w/2&&Math.abs(P.y-boss.y)<30&&P.atk<0){P.face=side;BK.press('atk');swings++;}
        const was=P.hp,m0=boss.mode;advance(1,!!opts.draw);taken+=Math.max(0,was-P.hp);ledger(m0,Math.max(0,was-P.hp));if(opts.onFrame)await opts.onFrame({boss,P,f,h,lvl:lvId,open:boss.open>0});if(f%600===599)await yieldNow();continue;
      }
      if(boss.salvage){
        k.left=k.right=k.up=k.down=k.jump=k.block=false;
        const dx=boss.x-P.x,side=Math.sign(dx)||1;let gx=boss.x-side*Math.max(20,LAB_REACH[h]*.7);
        const cargo=['salvageCargoTell','salvageCargo'].includes(boss.mode)&&(boss.cargo||[]).find(x=>Math.abs(P.x-x)<30);
        if(cargo!==false&&cargo!==undefined){const gaps=[cargo-34,cargo+34].filter(x=>x>A.x0+18&&x<A.x1-18&&(boss.cargo||[]).every(m=>Math.abs(x-m)>27));gx=gaps.sort((a,b)=>Math.abs(a-P.x)-Math.abs(b-P.x))[0]??P.x;}
        const incoming=BK.seeds().some(s=>s.salvageShot&&!s.dead&&(P.x-s.x)*s.vx>0&&Math.abs(P.x-s.x)<90);
        if(incoming&&P.ground){BK.press('jump');P.labJump=20;}
        if(P.labJump>0){P.labJump--;k.jump=true;}
        const guard=['salvagePinTell','salvageHookTell'].includes(boss.mode);
        if(guard&&SHIELDED(h)){k.block=true;gx=P.x;P.face=side;}
        else if(guard&&h==='warden'&&boss.mode==='salvagePinTell'){k.block=DEFLECT_TAP(f);gx=P.x;P.face=side;}   /* (claude/bosswave1) the warden's deflect answers his pin too */
        else if(guard&&boss.modeT<.24){k[side>0?'left':'right']=true;BK.press('dodge');gx=P.x;}
        /* (claude/bosswave1: he is on the chip now, his parried pin his opening) the hands stop short of his greed and step out of its ring */
        const Gq=BK.greed,greedy=Gq&&!(boss.open>0)&&Gq.count(boss)>=Gq.limit(boss)-2;if(Gq&&boss.greedT>0&&Math.abs(dx)<(Gq.reach||60)+boss.w/2+18)gx=boss.x-side*((Gq.reach||60)+boss.w/2+30);
        if(Math.abs(gx-P.x)>5)k[gx>P.x?'right':'left']=true;
        if(!guard&&!incoming&&!greedy&&!(boss.greedT>0)&&(cargo===false||cargo===undefined)&&Math.abs(dx)<LAB_REACH[h]+boss.w/2&&Math.abs(P.y-boss.y)<28&&P.atk<0){P.face=side;BK.press('atk');swings++;}
        const was=P.hp,m0=boss.mode;advance(1,!!opts.draw);taken+=Math.max(0,was-P.hp);ledger(m0,Math.max(0,was-P.hp));if(opts.onFrame)await opts.onFrame({boss,P,f,h,lvl:lvId,open:boss.mode==='salvageRest'});if(f%600===599)await yieldNow();continue;
      }
      const d = boss.x - P.x, ad = Math.abs(d), reach = LAB_REACH[h] + (boss.w || 20) / 2, open = OPEN(boss, BK);
      if (open && !wasOpen) { opened++; if (opts.trace) { out.trace = out.trace || []; out.trace.push({ h, mode: boss.mode, startD: Math.round(ad), dy: Math.round(boss.y - P.y), minD: 9999, pressed: 0, swung: 0, hpAt: boss.hp }); } }
      if (!open && wasOpen && opts.trace && out.trace && out.trace.length) { const tw = out.trace[out.trace.length - 1]; tw.lost = tw.hpAt - boss.hp; }
      if (open && opts.trace && out.trace && out.trace.length) { const tw = out.trace[out.trace.length - 1]; tw.minD = Math.min(tw.minD, Math.round(ad)); if (P.atk >= 0) tw.swung++; }
      wasOpen = open;
      k.left = false; k.right = false; k.block = false; k.up = false; k.down = false; k.jump = false; k.atk = false;
      if (h === 'paladin' && f < holdC) k.block = true;
      if (h === 'reaper' && f < dkHold) k.block = true;
      if (h === 'reaper') { k.throw = false;   /* F: SUMMON SKELETON (when his tree has it) near the boss with none of his up; with a full bar and the boss close, HOLD F for the surge */
        if (P.harvest >= 100 && ad < 110 && !(boss.mode && /Tell$/.test(boss.mode))) { k.throw = true; if (!(P.fHeld > 0)) BK.press('throw'); }
        else if (f % 20 === 0 && ad < 110 && BK.skillNow() === 'summonSkeleton' && !(P.cds && P.cds.summonSkeleton > 0) && !BK.risen().some(r => r.life > 0)) BK.press('throw'); }
      let goal = null, strike = false, princeT = null;
      /* HER DRONES, while two of them are up: the nearest one, and the queen's own openings come first */
      const swarm = boss.t === 'queen' ? BK.enemies().filter(q => q.alive && q.t === 'wasp' && q.drone) : [];
      const swarmT = swarm.length >= 2 && boss.mode !== 'winded' && boss.mode !== 'stuck' ? swarm.sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0] : null;
      /* THE GUN FOR HER GUARD: a deck gun on her own deck, cold, inside the arena - the nearest one to the bot */
      const gunT = boss.t === 'quarter' && boss.guard ? BK.props().filter(q => q.t === 'cannon' && q.deck && !(q.cool > 0) && Math.abs(q.y - boss.y) < 30 && q.x > A.x0 - 16 && q.x < A.x1 + 16)
        .sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0] || null : null;
      const tell = boss.mode && /Tell$/.test(boss.mode) && boss.mode !== 'stanceTell' && ad < 90;
      /* THE SHOULDER is no Tell by the time it reaches you: it is the rush itself, and it is answered as it arrives */
      const rushing = ((boss.mode === 'rush' || (boss.t === 'masthead' && boss.mode === 'sail')) && ad < 46) || (boss.t === 'master' && boss.mode === 'charge' && ad < 64 && (boss.x - P.x) * boss.vx < 0);   /* THE HOUND MASTER's charge is no Tell by the time it reaches you either */   /* THE RAM is answered as it arrives, like the shoulder */
      /* whatever is thrown and about to arrive - rubble, spit, a shot - is taken on the shield */
      const incoming = BK.seeds().find(s => (s.rubble || s.mawSpit || s.timber || s.shot || s.bolt) && !s.dead && !s.reflected && Math.abs(s.x - P.x) < 34 && Math.abs(s.y - (P.y - 8)) < 30 && (s.x - P.x) * (s.vx || 0) < 0);
      /* THE QUEEN'S BOWS (docs/briefs/lance-support.md): the archers he calls to the end lookouts. An arrow of theirs about to
         arrive goes on a shield, like the rest of what is thrown; and a bowman is CUT DOWN when the hands can get to him - on a
         lookout within 200 px, with the Lance neither open (cut HIM) nor coming at you (his charge, vault, rush and gale are
         answered first). Up on his lookout, it jumps from under it: the lookouts are one-way decks three rows up. */
      const bowArrow = boss.t === 'lance' ? BK.seeds().find(s => s.arrow && !s.jav && s.owner && s.owner.lanceBow && !s.dead && !s.reflected && Math.abs(s.x - P.x) < 40 && Math.abs(s.y - (P.y - 8)) < 30 && (s.x - P.x) * (s.vx || 0) < 0) : null;
      const bowT = boss.t === 'lance' && !open && !['couch', 'charge', 'vaultTell', 'vault', 'rushTell', 'rush', 'galeTell', 'gale'].includes(boss.mode) ? BK.enemies().filter(q => q.alive && q.lanceBow && Math.abs(q.x - P.x) < 200).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0] || null : null;
      /* THE BRIDGE GATE (claude/bosswave2, src/lance-support.js): when he levels the lance or comes on and its lookout is near, up onto the lookout
         and strike the winch as he runs under it - a quarter-second ahead of him, as a human leads a moving thing. Nothing is dropped for the bot */
      const lgate = boss.t === 'lance' && !open ? BK.props().find(p => p.t === 'winch' && p.bossGate && !(p.open > 0)) : null;
      /* HIGHCROWN's hall bell (claude/bosswave2): rung when she stands under its grate and the bell is in reach - a human glancing up at it */
      const hbell = boss.t === 'gqueen' && !open ? BK.props().find(p => p.t === 'winch' && p.bell && !(p.open > 0) && Math.abs(boss.x - (p.gate * 16 + 8)) < 12 + (boss.w || 20) / 2 && Math.abs(p.x - P.x) < 24 && Math.abs(p.y - P.y) < 30) : null;
      const gateDuty = lgate && ['couch', 'charge', 'rushTell', 'rush'].includes(boss.mode) && Math.abs(lgate.x - P.x) < 220 ? lgate : null;
      // THE ANSWER, on the beat. The paladin's aegis and the death knight's blood ward take a moment to come up, so they hold C from the start of the tell
      /* THE PALADIN'S WARD only breaks to his own sword met on the beat: the knight's guard in its last tenth of a second, the
         freebooter's tap just before it lands, the aegis raised in the last half second, the blood ward LET GO as it lands, a roll through for the
         pyromancer. The bash is rolled through as it arrives; the judgement is walked off its mark. */
      const KA = boss.t === 'kraken' && BK.krak ? BK.krak() : null, SA = boss.t === 'strawking' && BK.straw ? BK.straw() : null, MA = boss.t === 'archmage' && BK.mage ? BK.mage() : null;
      /* THE SPIRE'S GOLEM (claude/bot2 triage): his LOW sweep and his stomp's floor waves are JUMPED - the sweep is 0.45 s live and 66 px wide,
         unblockable, and only hits a hero on the ground, so the roll the red mark used to send the hands into (0.2 s safe) ate it every time.
         It is the read his own callout gives ('LOW'), late in the tell, as a person jumps a sweep he can see coming. */
      let gBell = null; const golemWave = boss.t === 'golem' && BK.waves().some(w => !w.royal && w.life > 0 && Math.abs(w.x - P.x) < 30 && (P.x - w.x) * w.dir > 0 && P.y > w.y - 6);
      if (boss.t === 'golem' && LABP.v2 && (golemWave || (boss.mode === 'sweepTell' && boss.modeT < 0.07 && ad < 74) || (boss.mode === 'sweep' && ad < 74) || (boss.mode === 'stompTell' && boss.modeT < 0.12 && ad < 60))) { goal = null;
        if (P.ground && !(P.labJump > 0)) { BK.press('jump'); P.labJump = 16; } if (P.labJump > 0) { P.labJump--; k.jump = true; } }
      /* AND STONE DOES NOT BLEED (its sign, at the chapel door): the note of a hanging bell struck while he stands under it cracks him for 3.6 s.
         The hands stand just this side of the nearest bell, let him walk in under it, and strike it from a jump; cracked, they cut him as ever.
         The lab had never done it, so it swung 170 times at stone and measured him 0/18 (claude/bot2 triage: a bot gap, not the mini) */
      else if (boss.t === 'golem' && LABP.v2 && boss.mode === 'sweepTell') { goal = boss.x - (Math.sign(d) || 1) * 96; strike = false; }   /* the sweep's line is drawn on the floor, 66 each side: walk off it, and jump it if still on it */
      else if (boss.t === 'golem' && LABP.v2 && !(boss.crackT > 0) && boss.mode !== 'stagger' && (gBell = BK.props().filter(p => p.t === 'tbell' && p.guard).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0])) {
        const side = Math.sign(boss.x - gBell.x) || 1; goal = gBell.x - side * 20; strike = false; if (Math.abs(P.x - goal) < 8) P.face = side;   /* (he stops 40 short of a hero: stood 20 this side of the bell, he halts 20 past it - under it) */
        if (Math.abs(boss.x - gBell.x) < 30 && !(gBell.cool > 0) && P.ground && Math.abs(P.x - goal) < 10 && !(P.labJump > 0)) { BK.press('jump'); P.labJump = 22; goal = null; }
        if (P.labJump > 0) { P.labJump--; k.jump = true; goal = null; }
        if (!P.ground && P.y - gBell.y < 20 && P.y - gBell.y > -20 && P.atk < 0 && !(gBell.cool > 0)) { P.face = Math.sign(gBell.x - P.x) || side; BK.press('atk'); swings++; } }
      else if (boss.t === 'closedhelm' && boss.mode && (/Tell$/.test(boss.mode) || boss.mode === 'bash')) { const m = boss.mode, t = boss.modeT; P.face = Math.sign(d) || P.face;
        if (m === 'bash') { if (ad < 60 && (boss.x - P.x) * boss.vx < 0 && f % 4 === 0) { k[d > 0 ? 'right' : 'left'] = true; BK.press('dodge'); } }
        else if (m === 'bashTell') { if (ad > 150) goal = null; }
        else if (m === 'judgeTell') { const mk = (boss.marks || [])[0]; if (mk !== undefined && Math.abs(P.x - mk) < 44) goal = mk + (P.x < mk ? -64 : 64); }
        else if (ad > (m === 'thrustTell' ? 86 : 62)) goal = boss.x - Math.sign(d || 1) * (h === 'warden' ? 30 : 40);   /* she must be INSIDE his sword for it to test her, whatever her own reach would rather do */
        else if (h === 'knight') { if (t < 0.08) k.block = true; }
        else if (h === 'pirate') { if (t < 0.16 && t > 0.08) k.block = true; }
        /* THE WARDEN sweeps LATE: the shaft is live 0.18 s, so a tap at a tenth of a second left is still out when his sword arrives */
        else if (h === 'warden') { if (t < 0.12) k.block = true; }
        else if (h === 'paladin') { if (t < 0.4) k.block = true; }
        else if (h === 'reaper') { if (dkRel.mode !== m || t > dkRel.t0 + 0.05) dkRel = { mode: m, t0: t, at: 0.45 - (0.12 + Math.random() * 0.22 + (Math.random() < 0.1 ? 0.3 : 0)) }; dkRel.t0 = t;
          if (t > dkRel.at) k.block = true; dkHold = 0; }   /* the ward up through his windup and LET GO at the flash, a reaction time late: one in ten is too late, and only turns it */
        else if (t < 0.1 && f % 3 === 0) { k[d > 0 ? 'right' : 'left'] = true; BK.press('dodge'); } }
      else /* THE KRAKEN is read from the arena, not from where its body is: BK.krak() says what is coming and what is open (the same
         things its marks are drawn from) - cut the arms where they lie, get up out of the surge, ring the bell while it breathes,
         and stand behind a waystone for the spear */
      if (KA) { goal = KA.goal; if (KA.up) k.up = true;
        /* WHERE EACH HERO'S OWN BLOW LANDS (2026-09-25): the advice points at the thing - an arm lying on the road, a crate, a chest, the pinned
           spear - and the lab stands this hero off it by its own reach (LAB_STAND). The warden's point lands 38 out: stood ON a crate she swung
           over it, and the first pilot had her 90 s on the four arms the knight cut in 28. A CHEST is struck from the landward side only (it
           has to go out to him), and the swing waits until the hero is there. */
        const stand = (LAB_STAND[h] || 12) - 4, far = (LAB_STAND[h] || 12) >= 18;   /* (only the heroes whose blow lands further out than a stride: the knight's cut from on top of an arm was already right) */
        if (far && KA.strike !== null && KA.kind === 'arm') { const s = Math.sign(KA.strike - P.x) || P.face || 1; goal = KA.strike - s * stand; }
        if (KA.kind === 'chest') { goal = KA.strike - Math.max(13, stand); if (Math.abs(goal - P.x) > 7) KA.strike = null; }
        if (KA.block && SHIELDED(h)) { goal = null; P.face = Math.sign(boss.x - P.x) || P.face; k.block = true; if (h === 'paladin') holdC = f + 30; }   /* the snap the shield turns: a shielded hero takes it on the shield */
        if (KA.dodge && f % 6 === 0) { k.left = KA.dodgeDir < 0; k.right = KA.dodgeDir > 0; BK.press('dodge'); }   /* a blow that has chosen you is rolled through */ if (KA.jump && (P.ground || (P.swim && f % 10 === 0))) { BK.press('jump'); k.jump = true; } else if (KA.hold && P.vy < 0) k.jump = true;   /* a climb the Kraken's advice asks for is held while it rises: let go and it is a hop */ if (KA.mash && f % 3 === 0) BK.press(f % 6 ? 'atk' : 'jump');
        if (KA.climb && P.ground && Math.abs(P.vx) < 8 && goal !== null && Math.abs(goal - P.x) > 6 && f % 8 === 0) BK.press('jump');
        if (KA.strike !== null && Math.abs(KA.strike - P.x) <= LAB_REACH[h] + 12 && P.atk < 0) { P.face = Math.sign(KA.strike - P.x) || P.face; BK.press('atk'); swings++; } }
      else /* THE ARCHMAGE is read from the room (BK.mage): cross what the room has become to wherever he is, cut the runes as
         they come round, and cut the familiar's eye only when the head is down */
      if (MA) { goal = MA.goal;
        if (MA.climb) { goal = MA.goal; if (P.ground && Math.abs(P.vx) < 4 && goal !== null && Math.abs(goal - P.x) > 10 && f % 20 === 0) BK.press('jump'); }
        else { if (tell && SHIELDED(h) && !HARD_TELLS.has(boss.t + '|' + boss.mode) && (h === 'paladin' || h === 'reaper' || boss.modeT < 0.14)) { k.block = true; goal = null; P.face = Math.sign(d) || P.face; if (h === 'paladin') holdC = f + 40; }
          else if (tell && HARD_TELLS.has(boss.t + '|' + boss.mode) && boss.modeT < 0.3 && f % 6 === 0) { k[d > 0 ? 'left' : 'right'] = true; BK.press('dodge'); goal = null; }
          const wave = BK.mg && BK.mg() && BK.mg().shots.some(s => s.wave && Math.abs(s.x - P.x) < 40 && (s.x - P.x) * s.vx < 0); if (wave && P.ground) { BK.press('jump'); P.labJump = 12; }
          if (!k.block && MA.strike !== null && Math.abs(MA.strike - P.x) <= LAB_REACH[h] + 14 && P.atk < 0) { P.face = Math.sign(MA.strike - P.x) || P.face; BK.press('atk'); swings++; }
          if (P.ground && Math.abs(P.vx) < 4 && goal !== null && Math.abs(goal - P.x) > 10 && f % 15 === 0 && !P.flip) { BK.press('jump'); P.labJump = 10; }
          if (P.swim && f % 20 === 0) { BK.press('jump'); P.labJump = 32; } }   /* in the acid: leap out of it, and keep leaping */
        if (MA.sub===1 && P.swim){const spots=[{x:L.arena.x0+40},...(BK.mg().stacks||[]).filter(q=>q.up).map(q=>({x:q.x*16+16})),{x:L.mage.dais[0]*16+24}];P.labMageLanding=spots.sort((a,b)=>Math.abs(a.x-P.x)-Math.abs(b.x-P.x))[0].x;k.up=true;goal=P.labMageLanding;}else if(MA.sub===1&&P.labMageLanding&&!P.ground)goal=P.labMageLanding;else P.labMageLanding=null;
        if (MA.jump && P.ground) { BK.press('jump'); P.labJump = 32; }   /* the flood's stacks: a held jump off the edge of this footing onto the next */
        // THE FLOOD'S BOOKS ARE TWO TILES APART: a double-tapped air dash carries the slower jump to the next stack.
        if (MA.sub===1 && !P.ground && !P.swim && goal!==null && goal>P.x+32 && P.vy>-180 && !P.dashedAir && !(P.dashCd>0) && P.st>=10) {
          if (f-(P.labMageTap??-99)>20) { P.labMageTap=f; BK.press('right'); }
          else if (f-P.labMageTap===2) BK.press('right');
        }
        /* THE HARDER ARCHMAGE (claude/archmage2): the room's attacks and his pairs, answered the way the marks say - roll out from under the
           stack and off the glyph late in the tell, jump straight up over a pair, and take the flying books on a shield (or jump them) */
        if (MA.dodge) { if (MA.dodgeAt < 0.3 && f % 4 === 0) { k.left = MA.dodge < 0; k.right = MA.dodge > 0; BK.press('dodge'); } else goal = P.x + MA.dodge * 40; }
        if (MA.jumpAt !== undefined && MA.jumpAt < 0.25 && !(P.labJump > 0)) { BK.press('jump'); P.labJump = 16; goal = null; }
        if (MA.book) { if (SHIELDED(h)) { k.block = true; P.face = MA.book; goal = null; if (h === 'paladin') holdC = f + 30; } else if (!(P.labJump > 0)) { BK.press('jump'); P.labJump = 16; } }
        if (P.labJump > 0) { P.labJump--; k.jump = true; } }
      else /* THE SCARECROW KING is read from the field (BK.straw): cut the pole he hangs on, strike the trough by the vine he stands at,
         knock his lantern with the third blow of a run (a heavy one), and jump his low scythe and his bales */
      if (SA) { goal = SA.goal;
        if (tell && SHIELDED(h) && !HARD_TELLS.has(boss.t + '|' + boss.mode) && (h === 'paladin' || h === 'reaper' || boss.modeT < 0.14)) { k.block = true; goal = null; P.face = Math.sign(d) || P.face; if (h === 'paladin') holdC = f + 40; }
        else if (tell && HARD_TELLS.has(boss.t + '|' + boss.mode) && boss.modeT < 0.22 && P.ground) { BK.press('jump'); P.labJump = 14; }
        if (SA.jump && P.ground && f % 4 === 0) { BK.press('jump'); P.labJump = 14; }
        if (!k.block && SA.strike !== null && Math.abs(SA.strike - P.x) <= LAB_REACH[h] + 14 && P.atk < 0) { P.face = Math.sign(SA.strike - P.x) || P.face; BK.press('atk'); swings++; }
        if (P.ground && Math.abs(P.vx) < 4 && goal !== null && Math.abs(goal - P.x) > 10 && f % 15 === 0) { BK.press('jump'); P.labJump = 14; }
        if (P.labJump > 0) { P.labJump--; k.jump = true; } }   /* a held jump: a tap does not clear a bale */
      /* THE REEFMAW ON LAND (docs/briefs/reef-longer.md): the tide is out and he is on the reef. Stand in front of him on the floor and let
         him lunge; JUMP IT as the head comes (or be up on a ledge), and he beaches himself - that is when to cut. Stay out from behind him: the
         tail comes round (a shield turns it, so the shielded heroes guard it). Caught, swing to tear free. Up on a ledge in his reach, get off it. */
      else if (boss.t==='reefmaw' && boss.land) {
        const mawIn=boss.x+(Math.sign(boss.x-P.x)||1)*6;   /* (see below) */
        const fc=boss.face||1, headX=boss.x+fc*40, ahead=(P.x-boss.x)*fc>0, hd=(P.x-headX)*fc;
        const lo=A.x0+20, hi=A.x1-20, clampX=x=>Math.max(lo,Math.min(hi,x));
        if (boss.mode==='roll') { goal=null; strike=false; if (f%4===0) BK.press('atk'); }
        else if (boss.mode==='lungeTell'||boss.mode==='lunge') { goal=null; strike=false; k.block=false;
          if (ahead && P.ground && ((boss.mode==='lunge'&&hd>36&&hd<150)||(boss.mode==='lungeTell'&&boss.modeT<0.12&&hd<70))) { BK.press('jump'); P.labJump=26; } }
        else if (boss.mode==='tailTell'||boss.mode==='tail') { strike=false;
          if (!ahead && SHIELDED(h)) { k.block=true; P.face=Math.sign(boss.x-P.x)||P.face; goal=null; if (h==='paladin') holdC=f+30; }
          else if (!ahead) { goal=clampX(boss.x-fc*150); if (P.ground&&boss.mode==='tail') { BK.press('jump'); P.labJump=26; } }
          else goal=null; }
        else if (boss.mode==='thrashTell'||boss.mode==='thrash') { strike=false; { const r1=boss.x+120, r2=boss.x-120; goal=r1<=hi&&(r2<lo||Math.abs(P.x-r1)<=Math.abs(P.x-r2))?r1:r2; } if (P.y<A.floor-20&&P.ground&&[T.ONEWAY,T.PLANK].includes(P.groundTile)) { k.down=true; BK.press('jump'); } }
        else if (boss.mode==='beached'||boss.mode==='haul') { goal=mawIn; strike=boss.mode==='beached'; }
        else if (!ahead && Math.abs(P.x-boss.x)<110) { goal=mawIn; strike=true; }   /* behind him after a beaching: a cut or two, and off at the tell */
        else { const g0=boss.x+fc*105; goal=Math.abs(clampX(g0)-g0)<30?clampX(g0):clampX(boss.x-fc*150); strike=false; }   /* in front, on the floor, in his reach: bait the lunge (and with a wall in front of him, go round behind: he turns) */
      }
      // BAIT THE JAW, THEN CLOSE: clear the bite volume before returning to its recovery.
      /* mawIn: the spot to strike from is six pixels INSIDE the hero's stand. The stand used to be LAB_STAND out with the walk stopping
         within four of it, so the warden (stand 38 + half the eel 15 = 53, reach 40 + 15 = 55) parked at 56 on the reef's flat floor,
         one pixel out of his own reach, and swung at nothing for a whole phase - the old coral stools kept him hopping, which hid it
         (claude/reef2). LAB_STAND is now derived from LAB_REACH with its own margin (claude/botfix, BOT BUG A), so this fixed six-pixel
         approach is redundant for the warden today, but it is left as it was: harmless, and this arena has its own long straight walls. */
      else if (boss.t==='reefmaw') { const mawIn=boss.x+(Math.sign(boss.x-P.x)||1)*6;
        let side=Math.sign(P.x-boss.x)||1;if(boss.x+side*116>A.x1-14||boss.x+side*116<A.x0+14)side=-side;
        if(['biteTell','bite','thrashTell','thrash'].includes(boss.mode)){
          goal=boss.mode==='bite'&&P.y<boss.y-65?boss.x+side*40:boss.x+side*116;strike=false;k.block=false;
          if(P.ground||P.swim){BK.press('jump');P.labJump=24;}if(P.swim)k.up=true;
        }else if(['stuck','reel','recoil'].includes(boss.mode)){goal=mawIn;strike=true;}
        else {goal=mawIn;strike=true;}
      }
      /* THE DEATH KNIGHT (the hero as the boss; rebuilt from his kit, claude/dk3), played the way his fight teaches it, at a human's speed: the
         hands see a new move of his ~250 ms after it begins (P.labDkM/P.labDkF) and until then carry on with what they were doing.
         HIS CUTS (gold): guarded (a shield; the warden's deflect), or stepped back out of. THE CLEAVE: stand in its reach while he lifts it
         (that is what makes him commit), and once he has COMMITTED dodge out of it, away: the blade goes into the floor and the hands cut the
         stuck man. His recoveries (after a cut, a cleave, the bolts) are cut too: every blow lands whole now. THE PLANTED BLADE: the middle
         of the widest gap. DEATH GRIP: jump the chain as it arrives. BLOOD BOIL: out of its ring. DEATH COIL: on the shield, or dodged as it
         arrives. GRAVE TIDE: round behind him. THE WARD: from behind his back is cut; on its face the hands FILL it and break it (he reels
         open), and back off before a nova they did not break. NOVA, SURGE: out of the ring. His dead are cut when they come close. */
      else if (boss.t === 'bloodknight') { const S = BK.unbU ? BK.unbU.UNB.bk : null, side = Math.sign(P.x - boss.x) || 1, m = boss.mode;
        if (P.labDkM !== m) { P.labDkM = m; P.labDkF = f; } const seen = f - P.labDkF >= 15, shield = SHIELDED(h);
        const guard = () => { goal = null; strike = false; P.face = -side; if (shield) k.block = !(LABP.v2 && h === 'reaper' && LABP.dkRelease !== false && f - dkS.relF < dkF(0.2));   /* (claude/herobots) the ward took a cut: LET GO (the nova hurts him and heals the blood back) and put it up for the next; held through a string it fills and breaks */ else if (h === 'warden') k.block = DEFLECT_TAP(f); else { goal = boss.x + side * ((S ? S.swingR : 54) + 24); } };
        const add = BK.enemies().filter(q => q.alive && q.t === 'corpse' && q.from === boss && q.mode !== 'down' && Math.abs(q.y - P.y) < 24).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
        const pool = S && (boss.pools || []).find(p => Math.abs(P.x - p.x) < S.boilR + 6);
        const coil = S && (boss.coils || []).find(q => q.t < S.coilT - 0.25 && Math.abs(q.x - P.x) < 46 && Math.abs(q.y - (P.y - 12)) < 30);   /* (seen a quarter-second after it leaves his hand) */
        if (m === 'stuck' || m === 'wrench' || m === 'reel') { goal = boss.x; strike = true; }
        else if (coil) { strike = false; if (shield || h === 'warden') { goal = null; P.face = Math.sign(coil.x - P.x) || P.face; k.block = shield ? true : DEFLECT_TAP(f); } else if (Math.abs(coil.x - P.x) < 26 && !(P.dodge > 0) && P.st >= 10) { BK.press('dodge'); goal = null; } else goal = null; }
        else if ((shield || h === 'warden') && Math.abs(P.x - boss.x) < (S ? S.swingR : 54) + 16 && (m === 'swing' || (m === 'swingTell' && boss.strLeft > 0 && !boss.punish))) guard();   /* inside a string the guard stays up between its cuts (a player holds it through) */
        else if (!seen && /Tell$/.test(m)) { goal = boss.x; strike = !(P.labRest); }   /* not read yet */
        else if (m === 'swingTell') { if (Math.abs(P.x - boss.x) < (S ? S.swingR : 54) + 16 && boss.modeT < 0.24) guard(); else { goal = boss.x + side * ((S ? S.swingR : 54) + 24); strike = false; } }
        else if (m === 'cleaveTell') { strike = false;
          if (!boss.committed) { goal = boss.x + side * 36; P.labDkC = f; }   /* in its reach: bait the commit */
          else if (f - (P.labDkC ?? f) < 12 || boss.modeT > 0.14) goal = boss.x + side * 36;   /* (the commit is seen a fifth of a second late; WEIGHT's roll is short and safe only early, so it is rolled late, through the blade as it comes down) */
          else if (!(P.dodge > 0) && P.st >= 30) { k.left = side < 0; k.right = side > 0; BK.press('dodge'); goal = null; }   /* (WEIGHT: a roll is 22-28 wind - with less, it is not tried) */
          else if (shield || h === 'warden') guard(); else goal = boss.x + side * 120; }
        else if (m === 'swing' || m === 'cleave' || m === 'blade' || m === 'coil' || m === 'rest') { goal = pool ? pool.x + side * (S.boilR + 20) : boss.x; strike = !pool && !(P.labRest); }
        else if (m === 'bladeTell') { strike = false; const xs = (boss.boltAt || []).slice().sort((a, b) => a - b), spots = [];
          for (let i = 0; i + 1 < xs.length; i++) spots.push((xs[i] + xs[i + 1]) / 2); if (xs.length) { spots.push(xs[0] - 44, xs[xs.length - 1] + 44); }
          goal = spots.filter(x => x > A.x0 + 20 && x < A.x1 - 20).sort((a, b) => Math.abs(a - P.x) - Math.abs(b - P.x))[0] ?? P.x; }
        else if (m === 'gripTell') { goal = null; strike = false; }
        else if (m === 'grip') { goal = null; strike = false; if (P.ground && Number.isFinite(boss.chainX) && Math.abs(boss.chainX - P.x) < 60 && (P.x - boss.chainX) * boss.face > 0) { BK.press('jump'); P.labJump = 18; } }
        else if (m === 'boilTell') { strike = false; goal = Number.isFinite(boss.boilX) ? boss.boilX + (Math.sign(P.x - boss.boilX) || side) * ((S ? S.boilR : 28) + 26) : null; }
        else if (m === 'coilTell') { goal = null; strike = false; }
        else if (m === 'tideTell' || m === 'tide') { strike = false; goal = boss.x - boss.face * 44; if (m === 'tide' && P.ground && (boss.hands || []).some(q => Math.abs(q.x - P.x) < 20 && q.delay < 0.15)) { BK.press('jump'); P.labJump = 16; } }
        else if (m === 'wardTell' || m === 'ward') { const back = (P.x - boss.x) * (boss.wardFace || boss.face) < 0;
          const R = S ? S.novaR + S.novaPer * (boss.wardFill || 0) : 90;
          if (back) { goal = boss.x; strike = true; }
          else if (!boss.wardLock && (boss.wardFill || 0) >= (S ? S.wardFull : 3) - 0 && boss.modeT > 0.25) { goal = boss.x; strike = true; }   /* full: break it */
          else if (!boss.wardLock && boss.modeT > 0.9) { goal = boss.x; strike = true; }   /* fill it (and leave time to get out of the nova if it will not break) */
          else { goal = boss.x + side * (R + 26); strike = false; } }
        else if (m === 'novaTell' || m === 'nova') { strike = false; goal = boss.x + side * ((S ? S.novaR + S.novaPer * (boss.wardFill || 0) : 90) + 30); }
        else if (m === 'surgeTell' || m === 'surge') { strike = false; goal = boss.x + side * ((S ? S.surgeR : 90) + 40); }
        else if (m === 'pass' || m === 'drag') { goal = null; strike = false; }
        else if (add && Math.abs(add.x - P.x) < 60) { goal = add.x; strike = false; if (Math.abs(add.x - P.x) < LAB_REACH[h] + 6 && P.atk < 0) { P.face = Math.sign(add.x - P.x) || P.face; BK.press('atk'); swings++; } }
        else if (pool) { goal = pool.x + side * (S.boilR + 20); strike = false; }
        else { goal = boss.x; strike = !(P.labRest); }
        if (goal !== null) goal = Math.max(A.x0 + 18, Math.min(A.x1 - 18, goal)); }
      else if (hbell) { goal = null; strike = false; k.left = k.right = false; if (P.atk < 0) { P.face = Math.sign(hbell.x - P.x) || P.face; BK.press('atk'); swings++; } }
      else if (gateDuty) { const wx = gateDuty.x, gx = gateDuty.gate * 16 + 8, onTop = P.ground && P.y <= gateDuty.y + 2; strike = false; k.block = false;
        if (!onTop) { goal = wx - 6; if (P.ground && Math.abs(wx - P.x) < 36) { BK.press('jump'); P.labJump = 20; } if (P.labJump > 0) { P.labJump--; k.jump = true; } }
        else { goal = null; k.left = k.right = false; const ahead = boss.x + (boss.vx || 0) * 0.12; if (Math.abs(ahead - gx) < 14 + (boss.w || 20) / 2 && Math.abs(boss.x - gx) < 40 && P.atk < 0) { P.face = Math.sign(wx - P.x) || 1; BK.press('atk'); swings++; } } }
      else if (boss.mode === 'stanceTell') goal = boss.x - Math.sign(d || 1) * 72;   /* EN GARDE: cut into it and she answers; stand off and wait for the point to drop */
      else if (rushing || (tell && (h === 'paladin' || h === 'reaper' || boss.modeT < (boss.t === 'closedhelm' ? 0.1 : h === 'geomancer' ? 0.17 : 0.14)))) {   /* (THE GEOMANCER's ward takes a tenth of a second to rise: she plants it that much sooner, so it is up on the beat) */
        P.face = Math.sign(d) || P.face;
        if ((h === 'warden' || h === 'pirate' && boss.t === 'herald') && !HARD_TELLS.has(boss.t + '|' + boss.mode)) { k.block = DEFLECT_TAP(f); }   /* THE DEFLECT, at any blow of his the marks do not call red */
        else if (SHIELDED(h) && !HARD_TELLS.has(boss.t + '|' + boss.mode)) { k.block = true; if (h === 'paladin') holdC = f + 40;
          if (h === 'reaper') { dkHold = f + dkF(0.5); const lg = dkLag[boss.mode];
            if (tell && lg !== undefined && lg <= 0.15) { if (dkRel.mode !== boss.mode || boss.modeT > dkRel.t0 + 0.05) dkRel = { mode: boss.mode, t0: boss.modeT, at: 0.03 + Math.random() * 0.16 + (Math.random() < 0.1 ? 0.25 : 0) - lg }; dkRel.t0 = boss.modeT;
              if (boss.modeT < dkRel.at) { k.block = false; dkHold = 0; } } } }
        else if (f % 6 === 0 && !P.climb) { k[d > 0 ? 'right' : 'left'] = true; BK.press('dodge'); }   /* YOU CANNOT ROLL ON A ROPE: a dodge lets go of the rungs, and the Quartermaster shoots at a climber every two seconds - the pyromancer rolled off her shrouds all the way back down into the hold */
      } else if ((incoming || bowArrow) && SHIELDED(h)) { P.face = Math.sign((incoming || bowArrow).x - P.x) || P.face; k.block = true; }
      /* THE QUARTERMASTER BEHIND HER GUARD: nothing a hero carries gets through it - a round shot is the only thing that does
         (updateBalls), which is what the deck guns and her own sign are for. So the hands do what the room says: to the nearest
         cold gun on HER deck, and strike the breech. A bot that only swung at her measured 0 kills for all six heroes and a
         wall at 31-33% of her health, which is where she raises it. */
      else if (gunT) { goal = gunT.x + (P.x < gunT.x ? -10 : 10);
        if (Math.abs(gunT.x - P.x) < 22 && P.atk < 0) { P.face = Math.sign(gunT.x - P.x) || P.face; BK.press('atk'); swings++; } }
      /* THE BURIED PRINCE, played the way his tomb teaches it: off the red mark while he is under the floor; in the dark, light
         a lamp; with him standing under a timber set, cut its post from outside the span it holds */
      else if (boss.t === 'prince' && boss.mode === 'sunk') goal = P.x + (Math.sign(P.x - (boss.markX || boss.x)) || 1) * 60;
      else if (boss.t === 'prince' && (princeT = princeTarget(BK, boss, A, P))) { goal = princeT.x;
        if (Math.abs(princeT.x - P.x) < 8 && P.atk < 0) { P.face = Math.sign(princeT.at - P.x) || P.face; BK.press('atk'); swings++; } }
      /* THE HORNET QUEEN'S SWARM closes over her while two of her drones are up and turns most of a blow (hurtEnemy0),
         so the hands thin it first, the way her hint says. A drone posts a tile and a half over the floor and darts at
         you, so it is taken with the rising cut when it is above and a plain one when it comes down. */
      /* THE HORNET QUEEN'S STING GOES IN THE WOOD (claude/firsthour): her only openings are a dive taken on the shield and a dive lured
         into wood. So while she aims, the hands get up onto the nearest perch (a comb's, or the felled pine) and, once she is diving
         and close, roll off it: the sting goes into the plank and she is open - then the generic 'open' branch below cuts her. */
      else if (boss.t === 'queen' && (boss.mode === 'aim' || (boss.mode === 'dive' && P.y < A.floor - 4))) {
        const LL = BK.L, onWood = P.ground && P.y < A.floor - 4; strike = false; k.block = false;
        if (boss.mode === 'dive') { if (Math.abs(boss.x - P.x) < 80 && f % 4 === 0) { k[boss.x < P.x ? 'right' : 'left'] = true; BK.press('dodge'); } }
        else if (onWood) goal = P.x;
        else { let best = null; for (let ty = Math.floor(A.floor / TS) - 5; ty < Math.floor(A.floor / TS) - 1; ty++) for (let tx = Math.ceil(A.x0 / TS) + 1; tx < Math.floor(A.x1 / TS) - 1; tx++) {
            const t = LL.grid[ty * LL.W + tx]; if ((t === T.ONEWAY || t === T.PLANK) && LL.grid[(ty - 1) * LL.W + tx] === T.AIR) { const x = tx * TS + 8; if (!best || Math.abs(x - P.x) < Math.abs(best - P.x)) best = x; } }
          if (best !== null) { goal = best; if (Math.abs(best - P.x) < 22 && P.ground) { BK.press('jump'); P.labJump = 22; } } }
        if (P.labJump > 0) { P.labJump--; k.jump = true; } }
      else if (swarmT) { goal = swarmT.x;
        /* a drone posts two and a half tiles over the floor: the rising cut reaches one that is a little up, and one
           posted higher is jumped at (her own bestiary row says you can pogo off them) */
        if (Math.abs(swarmT.x - P.x) < LAB_REACH[h] + 10 && P.atk < 0) { P.face = Math.sign(swarmT.x - P.x) || P.face;
          const dyw = swarmT.y - P.y;
          if (dyw < -26 && P.ground) { BK.press('jump'); P.labJump = 10; }
          if (dyw < -8) k.up = true; BK.press('atk'); swings++; }
        if (P.labJump > 0) { P.labJump--; k.jump = true; } }
      else if (bowT) { const up = bowT.y < P.y - 20, side = Math.sign(bowT.x - P.x) || 1;
        goal = up ? bowT.x : bowT.x - side * Math.max(8, LAB_REACH[h] * 0.6); strike = false;
        if (up && P.ground && Math.abs(bowT.x - P.x) < 36) { BK.press('jump'); P.labJump = 20; }
        if (!up && Math.abs(bowT.y - P.y) < 16 && Math.abs(bowT.x - P.x) <= LAB_REACH[h] + 6 && P.atk < 0) { P.face = side; BK.press('atk'); swings++; } }
      /* THE TIDE HERALD (claude/botfix follow-up, Daniel: "fix the cause, never weaken the test"). He takes full damage
         only while mired (the tide out, stuck in the mud) or reel (just parried) - BK.bossOpen now reports both (it
         used to return null for him, which the generic OPEN() fallback, OPEN0, reads as ALWAYS open, so "open" was
         true for him every frame, not only in mired/reel). Everywhere else a hit is cut to 0.35x (main.js ~5623). This
         has to run BEFORE the generic "else if (open)" right below, which would otherwise catch every mired/reel frame
         first now that "open" is honestly gated to them, and never let the block-clearing below run at all (traced with
         opts.samples: before this reorder it never fired once in 180 s, because control never reached it).
         Retreating from his raise/wave was tried first and made the herald-pirate check WORSE, not better: the 4+ s a
         cycle spent running from the wave and walking back cost more kill time than the 0.35x chip damage it gave up
         was worth, so the plain default holds for every one of his modes - approach and swing on the beat, mired or
         not - and now that "open" is honest it also lets the pirate's own mixedHeavy (below: ad 40-140, open,
         P.loaded) hold for a full-power heavy from range the instant he is truly vulnerable, instead of firing on
         almost every frame the way the old always-open bug let it.
         DROP THE GUARD WHILE HE IS OPEN. mired and reel throw nothing - he is stuck, or just parried - but the shared
         tap-block above (line ~1031, the deflect that answers "any blow of his the marks do not call red") taps on a
         rhythm keyed to his TELLS, not to whether a blow is actually coming, and kept tapping through mired too - the
         walker skips its own frame outright while k.block is held ("else if (goal !== null && !k.block)" below).
         Clearing k.block whenever OPEN(boss, BK) is true costs nothing here - nothing is thrown to guard against.
         THE REAL FIND, though, was one frame away: the general stuck-recovery just below (P.labStuckF, "HOLDING
         JUMP DOWN FOREVER IS ITS OWN STUCK STATE") held k.jump true forever once triggered, with no bounded release like
         every other jump in this file - and being stuck is exactly the condition that never clears itself, so once it
         fired here it never let go. Traced on the herald-pirate check's own seed: the pirate parked at 30 px (one
         pixel past LAB_REACH.pirate + half his width) for whole mired windows, k.jump and k.left both true on every
         single frame and P.vx pinned at exactly 0 the entire time - not because he could not reach, but because
         holding jump down forever, with no ground contact to ever let go on, meant this file's own walk code never
         got a frame to move him at all. That bug is general (every boss's stuck-recovery held jump the same way),
         not herald-specific - fixed once, below, for all of them. */
      /* HE STANDS ON A STONE YOU CANNOT HOP (claude/batch45 fixer): his y follows the ground under him, so between blows he can stand on top of one of the
         square's four-tile stones with the hero at its foot - under 50 px he does not stride, and his sweep and thrust pass over a hero that far below, so
         the two stand there for the rest of the fight (traced: herald-pirate, 130 s at 34 px, not a hit either way). A player walks off: past 50 px he
         strides after you, down off the stone. So the hands step 80 px off him, on the side with room, until he comes down. */
      else if (boss.t === 'herald' && boss.y < A.floor - 40 && P.y > boss.y + 30 && !open) { const side = (Math.sign(P.x - boss.x) || 1) * (P.x + (Math.sign(P.x - boss.x) || 1) * 80 > A.x1 - 18 || P.x + (Math.sign(P.x - boss.x) || 1) * 80 < A.x0 + 18 ? -1 : 1);
        goal = Math.max(A.x0 + 18, Math.min(A.x1 - 18, boss.x + side * 90)); strike = false; }
      else if (boss.t === 'herald') { goal = boss.x; strike = true; if (open) k.block = false; }
      /* THE GOBLIN QUEEN'S QUAKE (claude/gqueen2): her shadow is where she lands - off the floor as she comes down on it, and over her floor waves;
         asked before the open branch, because plate off she leaps AT you */
      else if (boss.t === 'gqueen' && ((boss.mode === 'hallLeap' && boss.tx !== undefined && Math.abs(boss.tx - P.x) < 100 && boss.modeT - 0.8 < 0.16) || BK.waves().some(w => w.royal && w.life > 0 && Math.abs(w.x - P.x) < 30 && (P.x - w.x) * w.dir > 0 && P.y > w.y - 4))) { goal = null; strike = false; if (P.ground) { BK.press('jump'); P.labJump = 14; } }
      /* THE LAMPREEVE (claude/weakboss), played the way his hall teaches it: when he goes for a lamp, get to that lamp first, on its far side
         from him, and strike it while the hood is on it - the flare blinds him, and then he is open (the branch below). With your light taken
         (his phase two), go to the nearest burning lamp and stand at it until it is back. Nothing is flared for the bot: a real swing on the lamp. */
      else if (boss.t === 'lampreeve' && !open) { const t = boss.target, hooding = t && (boss.mode === 'toLamp' || boss.mode === 'snuffTell' || boss.mode === 'snuff');
        if (hooding) { const side = Math.sign(boss.x - t.x) || 1; goal = t.x - side * 12; strike = false;
          if (boss.mode !== 'toLamp' && Math.abs(P.x - t.x) < 20 && P.ground && P.atk < 0) { P.face = side; k.left = k.right = false; goal = null; BK.press('atk'); swings++; } }
        else if (P.snuffed) { const lp = BK.props().filter(p => p.t === 'lantern' && p.city && p.lit && !(p.gut > 0) && p.x > A.x0 - 8 && p.x < A.x1 + 8).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
          if (lp) { goal = lp.x; strike = false; } else { goal = boss.x; strike = true; } }
        else { goal = boss.x; strike = true; } }
      /* THE HEADLESS PLOUGHMAN (claude/weakboss): his plough sticks only in the trough or the fence, so the hands stand just beyond one, on its
         far side from him - his plough comes at them and goes into it - and cut him while he heaves (the open branch below). The bait picked is
         the one furthest from him, so his walk in does not carry him past it. His head and his furrows are red tells: rolled (above). */
      else if (boss.t === 'ploughman' && !open && L.mini && L.mini.baits) { const bs = L.mini.baits.map(([tx]) => tx * 16 + 8);
        const spots = bs.map(bx => { const side = Math.sign(bx - boss.x) || 1; return { bx, x: bx + side * 26, far: Math.abs(bx - boss.x) }; }).filter(s => s.x > A.x0 + 18 && s.x < A.x1 - 18 && s.far > 40);
        const s = spots.sort((a, b) => b.far - a.far)[0];
        if (s && boss.mode !== 'charge') { goal = s.x; strike = false; if (Math.abs(boss.x - P.x) < LAB_REACH[h] + 14 && Math.abs(P.x - s.x) < 8 && P.atk < 0) { P.face = Math.sign(boss.x - P.x) || P.face; BK.press('atk'); swings++; } }
        else if (boss.mode === 'charge') { goal = null; strike = false; if (P.ground && Math.abs(boss.x - P.x) < 70 && (P.x - boss.x) * boss.face > 0) { BK.press('jump'); P.labJump = 20; } }
        else { goal = boss.x; strike = true; } }
      /* THE HOMUNCULUS (claude/weakboss): it is only open when a trick has MISSED, so the hands stand off it a stride out of its swipe and
         let it try - every red trick rolled or jumped, every yellow one guarded (the tell branch above) - and its pound's floor wave jumped.
         Bare, it is cut (the open branch below). In the smoke there is nothing to cut: wait for it to come out. */
      else if (boss.t === 'homunculus' && !open) { const mg = BK.mg && BK.mg(), wave = mg && mg.shots.some(s => s.wave && Math.abs(s.x - P.x) < 40 && (s.x - P.x) * s.vx < 0);
        if (wave && P.ground) { BK.press('jump'); P.labJump = 12; goal = null; strike = false; }
        else if (boss.mode === 'scurry' || boss.mode === 'dive' || boss.mode === 'leap' || boss.mode === 'hide') { goal = null; strike = false; }
        else { goal = boss.x - Math.sign(d || 1) * 64; strike = false; }
        if (P.labJump > 0) { P.labJump--; k.jump = true; } }
      else if (open) { goal = boss.x; strike = true; }
      /* THE PLATE THAT TURNS EVERY BLADE (the Queen's Lance): chipping at it does nothing at all, so the hands MAKE the
         opening the way a player does - stand a dash's length off and come at his guard at a run. His own gate says a
         dash attack knocks him OFF BALANCE, and the cut after it lands. (A bot that only pressed attack measured a boss
         nobody could finish: the freebooter swung 1822 times at his plate for no damage at all.) */
      else if (DASH_IN.has(boss.t)) { const r = dashIn(BK, h, boss, f);
        goal = r ? null : boss.x - Math.sign(d || 1) * (reach + 24); }
      else if (boss.t === 'closedhelm') goal = boss.x - Math.sign(d || 1) * 42;                       // close enough to be swung at
      /* THE SHRIEK is answered from the room: to the nest bell, struck as she comes over it; with no bell near, off the boards */
      else if (boss.t === 'roc') {const fk=BK.props().find(p=>p.t==='tbell'&&p.roc);if(fk){goal=fk.x-14;if(Math.abs(fk.x-P.x)<24&&fk.cool<=0&&fk.over&&P.atk<0){k.block=false;P.face=Math.sign(fk.x-P.x)||1;BK.press('atk');swings++;}}if(boss.mode==='carry'){strike=true;goal=boss.x;}}
      /* THE FALSE ABBOT is a BELL FIGHT, and the bot was fighting him with the sword alone: it had a branch for the
         Roc's nest bell and none for his, so the first pilot measured brute force against a five-times ward and came
         back 7/24. A sim cannot measure a strategy the bot cannot play. It plays it now: keep station by the bell,
         ring it the moment he is under it, and swing at him the rest of the time - the ward makes that poor, which is
         the point of the bell. */
      else if (boss.t === 'abbot') { const bl = BK.props().find(p => p.t === 'tbell' && p.abbot);
        /* AND THE REST OF THE STRATEGY (2026-09-23). The first version of this branch only waited by the bell, so it stood
           still while his chain reeled it in from across the floor and his congregation hit it from behind: 3/24, every
           death a cast TAKEN and an add's blow. A player does two more things, and both are his design, not an assist:
           GUARD THE CHAIN at any range (guarded, it hauls HIM a step toward you - it is how he is walked under the bell;
           a hero with no shield hops it), and CUT THE CONGREGATION that reaches you while you wait. */
        const far = !bl || Math.abs(boss.x - bl.x) > 70;   /* he is nowhere near the bell: time to thin his congregation, as a player would */
        const add = BK.enemies().filter(q => q.alive && q !== boss && !q.boss && Math.abs(q.y - P.y) < 26 && Math.abs(q.x - P.x) < (far ? 150 : LAB_REACH[h] + 18)).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
        const arrow = BK.seeds().find(s => s.arrow && !s.dead && !s.reflected && Math.abs(s.x - P.x) < 60 && Math.abs(s.y - (P.y - 8)) < 40 && (s.x - P.x) * (s.vx || 0) < 0);   /* HIS ARCHERS: 18 a shaft, and the old guard only watched for rubble and shot */
        const chain = boss.mode === 'castTell' || (boss.mode === 'cast' && !boss.castHit);
        const proc = (boss.mode === 'process' || boss.mode === 'processTell') && (P.x - boss.x) * (boss.procDir || boss.face) > 0 && ad < 44;
        if (bl) { const under = Math.abs(boss.x - bl.x) < 40;
          if (under && bl.cool <= 0 && Math.abs(bl.x - P.x) < 26 && P.atk < 0 && !chain) { k.block = false; P.face = Math.sign(bl.x - P.x) || 1; BK.press('atk'); swings++; }
          else if (boss.open > 0) { goal = boss.x; strike = true; }              /* downed: get on him, the window is worth three blows */
          else if (chain) { goal = null; P.face = Math.sign(boss.x - P.x) || P.face;
            if (SHIELDED(h)) { k.block = true; if (h === 'paladin') holdC = f + 20; }
            else if (h === 'warden') k.block = DEFLECT_TAP(f);
            else if (boss.mode === 'castTell' && boss.modeT < 0.12 && P.ground) { BK.press('jump'); P.labJump = 14; } }   /* the chain is judged the frame it flies: be off the boards by then */
          else if (proc) { if (P.ground) { BK.press('jump'); P.labJump = 16; } goal = boss.x + (boss.procDir || boss.face) * 30; }
          else if (arrow) { goal = null; P.face = Math.sign(arrow.x - P.x) || P.face; if (SHIELDED(h)) k.block = true; else if (h === 'warden') k.block = DEFLECT_TAP(f); else if (P.ground) { BK.press('jump'); P.labJump = 10; } }
          else if (add) { P.face = Math.sign(add.x - P.x) || P.face; goal = Math.abs(add.x - P.x) > LAB_REACH[h] ? add.x - P.face * (LAB_REACH[h] - 4) : null; if (Math.abs(add.x - P.x) <= LAB_REACH[h] + 6 && P.atk < 0) { if (keyVerb(BK, h, add) === 'sweep') k.down = true; BK.press('atk'); swings++; } }   /* HIS CONGREGATION IS SMALL (family 'small'): the low sweep, same as the Mother's sporelings (see the ledger's own comment) - this is the spire/abbot pilot's own add-branch, and the plain cut it threw before missed the knight 6 of 16 (tools/small-adds.mjs) */
          else goal = bl.x + (boss.x > bl.x ? -20 : 20);                          /* wait on the far side, so his chain hauls him under it */
          if (P.labJump > 0) { P.labJump--; k.jump = true; }
        } else { goal = boss.x; strike = true; } }
      else if (boss.t === 'troll') { goal = boss.x; strike = true;
        /* THE HILL TROLL: his stones drop from a hook a player jumps to strike - when he walks under one, the bot drops it, as a player at that hook would */
        const st = BK.props().find(q => q.t === 'weight' && q.crane && q.state === 'hang' && Math.abs(q.x - boss.x) < 12); if (st) { st.state = 'fall'; st.fy = st.y + st.len; st.vy = 0; } }
      /* LURE THE CROWN UNDER A CAGE. While closed, stand beyond the cage without applying sword spacing to that
         destination. The open branch above closes to sword reach after a catch. The cage activation below is an
         environmental lab assist, not evidence that the pilot climbed to and operated its pressure plate. */
      else if (boss.t === 'king') { const cages = BK.props().filter(c => c.t === 'dropcage' && c.boss && !c.dropped);
        const c = cages.sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0]; goal = c ? c.x + (boss.x > c.x ? -60 : 60) : boss.x; strike = false;
        // his cages drop from pressure plates up on the scaffold, where the bot cannot climb: when he walks under one, it drops it, as a player on that plate would
        /* opts.noCage takes the cage hand away, which is how the above was found: without it, zero swings and 100% of him */
        const under = opts.noCage ? null : cages.find(q => Math.abs(q.x - boss.x) < 18); if (under) { under.dropped = true; under.landed = 0; if (under.hit) under.hit.clear(); under.resetT = 5; } }
      /* THE GOBLIN QUEEN, played as her court teaches it (docs/briefs/goblin-queen-court.md, 2026-09-29). She holds court beside the standing
         pillar nearest you, on its far side: so WAIT BY A PILLAR, crack it twice while she is away from it, and when she lands beside it and points,
         the third blow - it totters, and comes down on her. In her second round the pillars are down: a blow to her back while she points cracks her
         plate, and the chandeliers do the rest (and plate off she is simply open, the branch above). Nothing is broken or dropped for the bot: a real
         swing on the pillar's own box, a real jump and swing at a chain. Her quake is jumped (the branch above, open or not). */
      else if (boss.t === 'gqueen') { const cs = BK.props().filter(p => p.t === 'weight' && p.gq && p.state === 'hang');
        const ps = BK.props().filter(p => p.t === 'qpillar' && !p.broken), AX0 = A.x0 + 24, fr = Math.floor(A.floor / 16) - 1;
        let fx = Math.floor(A.x0 / 16); while (fx < Math.floor(A.x1 / 16) && L.grid[fr * L.W + fx + 1] !== T.SOLID) fx++; const AX1 = Math.min(A.x1 - 24, (fx + 1) * 16 - 10);   /* the hall floor ends at her dais */
        /* HER DECREE runs along the floor both ways, three beats: a wave coming at the hands is jumped (it only takes a hero standing on the floor) */
        const wave = BK.waves().some(w => w.royal && w.life > 0 && Math.abs(w.x - P.x) < 34 && (P.x - w.x) * w.dir > 0 && P.y > w.y - 4);
        const court = boss.mode === 'point' && boss.courtP && !boss.courtP.broken ? boss.courtP : null;
        /* the pillar the hands wait by: the one she is going to (her aim), else the one it already cracked, else the nearest to the hands */
        const aimP = (boss.mode === 'hallLeapTell' || boss.mode === 'hallLeap' || boss.mode === 'quake') && boss.court && boss.courtP && !boss.courtP.broken ? boss.courtP : null;
        const tp = court || aimP || ps.filter(p => !(p.totter > 0)).sort((a, b) => ((b.blows || 0) - (a.blows || 0)) || (Math.abs(a.x - P.x) - Math.abs(b.x - P.x)))[0] || null;
        const strikeP = p => { const side = Math.sign(p.x - P.x) || 1, at = Math.max(AX0, Math.min(AX1, p.x - side * 15)); goal = at; strike = false;
          if (Math.abs(P.x - at) < 7 && P.ground && P.atk < 0 && !(p.totter > 0)) { P.face = side; k.left = false; k.right = false; goal = null; BK.press('atk'); swings++; } };
        if (wave && P.ground) { BK.press('jump'); P.labJump = 12; goal = null; strike = false; }
        else if (P.labCut > 0) { P.labCut--; k.jump = true; if (P.labCut === 6 && P.atk < 0) { BK.press('atk'); swings++; } goal = null; }
        else if (court) strikeP(court);                                                      /* SHE HOLDS COURT BESIDE IT: bring it down */
        else if (tp && tp.totter > 0) { goal = Math.max(AX0, Math.min(AX1, tp.x - (Math.sign(boss.x - tp.x) || 1) * 40)); strike = false; }   /* it goes: stand off its fall */
        else if (boss.phase === 2 && boss.mode === 'point') { goal = boss.x; strike = true; }  /* HER BACK, while she points (her plate) */
        else { const under = cs.find(c => Math.abs(c.x - boss.x) < boss.w / 2 + 6 && Math.abs(c.x - P.x) < 28);
          if (under && boss.mode !== 'hallLeapTell' && boss.mode !== 'hallLeap') { strike = false; goal = null; if (P.ground) { P.face = Math.sign(under.x - P.x) || P.face; BK.press('jump'); P.labCut = 16; } }
          else if (tp && boss.phase !== 2) { const far = Math.abs(boss.x - tp.x) > 110 && !aimP;
            if (far && (tp.blows || 0) < 2) strikeP(tp);                                        /* crack it twice while she is away from it */
            else { goal = Math.max(AX0, Math.min(AX1, tp.x - (Math.sign((aimP ? boss.tx : boss.x) - tp.x) || 1) * 15)); strike = false; } }   /* and wait by it, on the side away from her */
          /* wait just on HER side of the nearest chandelier: she stops 56 px short of you, which is right under it */
          else { const c = cs.sort((a, b) => Math.abs(a.x - boss.x) - Math.abs(b.x - boss.x))[0]; goal = c ? c.x - (Math.sign(boss.x - c.x) || 1) * 22 : boss.x - Math.sign(d || 1) * 70; strike = false; } } }
      else { goal = boss.x; strike = true; }
      /* THE OWL'S DEAD BOUGHS: when the Reeve is low under one the bot cuts its peg, as a player standing at it would, and it hops the skim */
      if (boss.t === 'owl') {
        const down=['grounded','crash','pinned','stuckTalons'].includes(boss.mode);
        if(!down){strike=false;const lamps=BK.props().filter(p=>p.owl&&!p.perch);const lamp=lamps.sort((a,b)=>Math.abs(a.x-P.x)-Math.abs(b.x-P.x))[0];if(lamp){goal=lamp.x;if(!lamp.lit&&Math.abs(P.x-lamp.x)<22&&P.atk<0){k.block=false;P.face=Math.sign(lamp.x-P.x)||1;BK.press('atk');swings++;}}}
        if (boss.mode === 'skim' && Math.abs(boss.x-P.x)<64 && (boss.x-P.x)*boss.vx<0 && P.ground){k.jump=true;BK.press('jump');}
        /* HER SWOOP, BY A LIT LAMP (claude/bosswave1: her windows pay x1.3 now, not double): "step aside by a lit lantern and it crashes into the light" -
           the lamp put between her and you as she comes */
        if (boss.mode === 'swoop' && (boss.x-P.x)*(boss.vx||0)<0 && Math.abs(boss.x-P.x)<120) { const lit=BK.props().filter(p=>p.owl&&!p.perch&&p.lit).sort((a,b)=>Math.abs(a.x-P.x)-Math.abs(b.x-P.x))[0];
          if (lit && Math.abs(lit.x-P.x)<56) { strike=false; goal=lit.x+(Math.sign(lit.x-boss.x)||1)*30; } }
      }
      /* THE WINDCALLER'S HOWL (claude/bosswave1: his fall is now his only opening): HE CALLS THE WIND is told, and a player braces through it -
         DOWN held on the ground (every hero has it; block is the same brace) - and he falls */
      if (boss.t === 'windcaller' && (boss.mode === 'howlTell' || boss.mode === 'howl') && P.ground) { strike = false; goal = null; k.left = k.right = false; k.down = true; }
      /* THE RAM'S CHARGE (claude/bosswave1: a charge that finds you stops on you and dazes nothing): rolled through as it arrives, so it runs on into the wall */
      else if (boss.t === 'ram' && boss.mode === 'charge' && Math.abs(boss.x - P.x) < 72 && (boss.x - P.x) * (boss.vx || 0) < 0 && !(P.dodge > 0)) { strike = false; k.block = false; k[boss.x > P.x ? 'right' : 'left'] = true; BK.press('dodge'); }
      else if (boss.t === 'ram' && (boss.mode === 'lower' || boss.mode === 'rear')) strike = false;   /* (his head goes down: no swing started that would still be running when he comes) */
      /* THE GRANDMOTHER LISTENS (claude/bosswave1: her rap and her feel turned are her openings now): SHE IS LISTENING is told, and a player stands
         still and silent through it - no step, no swing - and she raps the floor, open */
      else if (boss.t === 'grandmother' && (boss.mode === 'listenTell' || boss.mode === 'listen')) { strike = false; goal = null; k.left = k.right = false; }
      /* and his twister walks the heather toward him: a player keeps out of its way (it lifts and cuts whatever it touches), on the side away from it */
      else if (boss.t === 'windcaller' && boss.twister && boss.mode !== 'fallen' && Math.abs(P.x - boss.twister.x) < 70) { strike = false; goal = boss.twister.x + (Math.sign(P.x - boss.twister.x) || 1) * 90; }
      /* THE CHIP AND THE GREED REPRISAL (claude/combat3, src/boss-greed.js): outside an opening a hero's blow on a boss is a twentieth, and
         the GREED.n-th in a few seconds is answered by a told burst round him. A player stops one blow short of it and stands off for the
         opening; when the ring closes on him he steps out of it. (BK.greed.open is strict: a boss with no rule is not "open" here, so a
         mini with none is never mashed into his reprisal either.) */
      if (BK.greed) { const G = BK.greed, out = (G.reach || 60) + (boss.w || 20) / 2;
        if (strike && G.open(boss) !== true && G.count(boss) >= G.limit(boss) - (boss.xpRole === 'mini' && G.chipped(boss) ? 2 : 1)) {   /* (claude/bosswave1: a mini on the chip answers harder - 26 a reprisal - so the hands stop two short) */ strike = false; goal = boss.x - (Math.sign(boss.x - P.x) || 1) * ((LAB_STAND[h] || 12) + (boss.w || 20) / 2); }   /* (it holds its ground at sword's length and keeps answering him: it only stops swinging) */
        if (boss.greedT > 0 && ad < out + 18) { strike = false; goal = boss.x - (Math.sign(boss.x - P.x) || 1) * (out + 30); } }
      // step in close before swinging: from the very edge of reach, a boss standing a little above the floor (the roc in her glass) is missed by a pixel
      // THE DECK MUST BE UNDER HER FEET: sword reach is not the top of the ladder.
      const shipAscending=lvId==='flotilla'&&(boss.y<P.y-30||!P.ground&&boss.y<P.y+8);
      if (walker && boss.t !== 'owl' && (Math.abs(boss.y - P.y) > 30 || shipAscending) && !k.block) {
        /* she is on another deck. Walking at HER x from under her deck only jumps on the spot: go to the nearest way UP -
           a rope or a ledge over the deck the bot stands on - and let the walker climb it */
        let goalUp = boss.x;
        if (boss.y < P.y - 30) { const fr = Math.floor(P.y / TS), px = Math.floor(P.x / TS); let bestX = null, bd = 1e9;
          for (let x = Math.floor(A.x0 / TS); x <= Math.floor(A.x1 / TS); x++) for (let y = fr - 6; y <= fr - 1; y++) { const t = L.grid[y * L.W + x];
            if (t === T.NET || t === T.ONEWAY || t === T.PLANK) { const dd = Math.abs(x - px) + (t === T.NET ? 0 : 4); if (dd < bd) { bd = dd; bestX = x; } break; } }
          if (bestX !== null) goalUp = bestX * TS + 8; }
        /* THE FLOTILLA'S OWN ROUTE UP, because the nearest ledge over her is not a way to it: the main deck climbs by the block
           steps at the companion house (column 292 on), and her second deck to the poop by the nets at 338 */
        /* THE FLOTILLA'S OWN RUNGS, and they are CLIMBED BY HAND. Traced with opts.samples: left to the walker, the bot
           went round and round between the quarterdeck and the hold while she sat on the poop at 33% of her health, and
           when the phase-three deck fall took the main deck out from under it (fallFrom 366 to fallTo 304) it dropped
           into the hold and stayed there 60 s with her 450 px away and five rows up. Her ship has two runs that survive
           everything she cuts: the shroud at column 310, which reaches from the hold to the quarterdeck, and the ladder
           at 366 from the quarterdeck to the poop. So: walk the deck to the foot of the run, then hold UP on the rungs -
           and never jump while climbing, because a jump off a rope is how you let go of it. */
        let flotClimb = false;
        if (shipAscending) { const py = P.y / TS;
          if (py > 17 || (P.climb && py > 15.2)) goalUp = 310 * TS + 8;                    /* the shroud out of the hold and up the ship's side */
          else if (boss.y < 14 * TS) goalUp = 366 * TS + 8;      /* the one ladder to the poop she does not cut */
          flotClimb = true; }
        if (flotClimb && Math.abs(goalUp - P.x) < 28) { k.left = false; k.right = false; k.up = true;
          if (!P.climb && P.ground && f % 12 === 0) { BK.press('jump'); P.labJump = 12; }   /* a hop to find the rungs, only while it is not on them */
          if (!P.climb && P.labJump > 0) { P.labJump--; k.jump = true; } }
        else { if(flotClimb){k.left=goalUp<P.x;k.right=goalUp>P.x;k.down=false;}else walker(goalUp);
          /* AND A STEP OF THREE ROWS IS A HELD JUMP (rule E4): her companion house is 48 px against a 49 px jump, so a
             tap does not clear it. Walking and not moving means something that size is in the way. */
          if (flotClimb && P.ground && Math.abs(P.vx) < 8 && (k.left || k.right) && f % 14 === 0) { BK.press('jump'); P.labJump = 18; }
          if (P.labJump > 0) { P.labJump--; k.jump = true; } } }
      else if (goal !== null && !k.block) { const desired=strike ? goal-(Math.sign(goal-P.x)||P.face)*(LAB_STAND[h]+(boss.w||20)/2) : goal; const gd = desired - P.x;
        if (Math.abs(gd) > 4) k[gd > 0 ? 'right' : 'left'] = true;
        /* THE TOMB'S RUBBLE IS A STEP: walking and not moving there means a mound in the way, and a player hops it */
        if (boss.t === 'prince' && (k.left || k.right) && P.ground && Math.abs(P.vx) < 4 && f % 15 === 0) BK.press('jump');
        /* AND WATER HAS A SECOND AXIS. Outside the Deep's own swimming branch the hands only ever walked left and
           right, so when the Tollmaster fills his square the bot floated at the surface with him on the stones below
           it: every hero stalled between 3% and 27% of him, which is his flood phase and nothing else. A swimmer
           strokes up and down as well. */
        if (P.swim) { const dyb = (boss.y - 10) - P.y; if (dyb < -12) k.up = true; else if (dyb > 12) k.down = true; } }
      if(shipAscending){
        if(P.climb && P.y<17.5*TS && P.y>15.2*TS && Math.abs(P.x-311*TS)<20 && !(P.labShipVault>0)){BK.press('jump');P.labShipVault=32;}
        if(P.ground&&(k.left||k.right)){const dir=k.right?1:-1,tx=Math.floor((P.x+dir*20)/TS),ty=Math.floor((P.y+2)/TS);if(!L.grid[ty*L.W+tx]){BK.press('jump');P.labShipVault=32;}}
        if(P.labShipVault>0){P.labShipVault--;k.left=false;k.right=true;k.up=k.down=k.block=false;k.jump=true;}
      }
      // A blade cannot reach down from a step: leave the shelf and land beside the foe before choosing sword range.
      /* (2026-09-25, the Goblin Queen: Daniel, "FIX THE BOT, not the Queen"). A SHELF IS SOMETHING YOU STAND ON. This fired on the
         hands' own hops as well as on a real shelf: measured on the pillar build, 700-1700 frames a fight were cancelled strikes
         in the air over her, and half of them (288-843) while she was PINNED - the window the whole fight is for. She is 52 px
         tall, so a hop does reach her, and the same is true of the other eight on this list: a jump apex is well under 24 px of
         hang time before it is falling again, so "boss.y>P.y+24" was reading the bot's OWN HOP as a step it had climbed. It asks
         for the ground now, for every boss here, not only her (Daniel, "apply the same fix to the other eight", 2026-09-25). */
      if(!walker&&!P.swim&&boss.y>P.y+24&&P.ground&&['chief','frog','king','ram','windcaller','gqueen','closedhelm','prince','strawking'].includes(boss.t)){const gx=lowerFooting(BK,boss,T);k.left=P.x>gx+3;k.right=P.x<gx-3;k.block=false;strike=false;}
      const descending=!P.swim&&boss.y>P.y+24&&(boss.t==='lance'&&!bowT&&!gateDuty||boss.t==='reefmaw'&&strike&&(P.ground||P.vy>=0));
      if(descending){const gx=boss.t==='reefmaw'?boss.x:lowerFooting(BK,boss,T);k.left=P.x>gx+3;k.right=P.x<gx-3;k.block=false;strike=false;P.labJump=0;k.jump=false;if(P.ground&&[T.ONEWAY,T.PLANK,T.SHELF,T.RAIL].includes(P.groundTile)){k.down=true;BK.press('jump');}}
      if(!descending&&P.ground&&Math.abs(P.vx)<4&&(k.left||k.right)&&f%15===0){BK.press('jump');P.labJump=18;}
      if(P.labJump>0&&!walker){P.labJump--;k.jump=true;}
      // THE HERALD'S STONES LEAVE PISTOL ROOM: a loaded shot reaches across them; the short C release answers his yellow thrust.
      const cutGo=h==='knight'&&P.atkHeld>=KNIGHT_CUT;   /* the heavy cut is let go at the guard-break */
      const mixedHeavy=(opts.attackStyle==='mixed'||h==='pirate'&&boss.t==='herald'&&P.loaded) && !cutGo && !P.heavy && !k.block && (P.charge>0||P.atkHeld>0||(open&&P.ground&&f>=(P.labHeavyAt||0)&&(h==='pirate'&&boss.t==='herald'?ad>40&&ad<140:ad<reach+8)&&P.st>=(BK.heavyCost?BK.heavyCost():26)+8));
      if(mixedHeavy){k.atk=true;if(!(P.charge>0||P.atkHeld>0))P.labHeavyAt=f+Math.round(4*60/(BK.SET.speed||1));}
      /* THE SWING GOES AT HIM, NOT BEHIND. Standing closer than its spot, the bot walks back to it - and the game turns a hero to the key he
         holds before a swing starts (updatePlayer: if (!attacking) P.face = move), so a swing pressed on that frame went out behind him: on
         the Reefmaw the Death Knight's first swing in every stuck jaw was cut facing away and rooted him 0.78 s of a 2.2 s window (claude/dk2).
         On the frame it swings, the bot lets go of the key that points away. */
      /* (claude/herobots) THE DEATH KNIGHT'S SWING IS A SECOND OF COMMITMENT (0.9 s light, 1.75 heavy; armoured through it, but the ward cannot come up and he cannot roll): a player does not
         begin one into a boss that is winding up - he keeps the ward up and punishes in the half second after the boss's blow has gone, or in his rest, his open and his reel. Only while the boss
         is attacking in tells (one seen in the last six seconds); v2 profiles, and prof.dkPunish false turns it off. */
      if (LABP.v2 && LABP.dkPunish !== false && h === 'reaper' && strike && P.atk < 0 && ad < 110 && !dkSwingOK()) { strike = false; k.block = true; P.face = Math.sign(d) || P.face; k.left = k.right = false; }
      if (!mixedHeavy && !cutGo && strike && ad <= reach && P.atk < 0 && !k.block) { P.face = Math.sign(d) || P.face; if (d > 0) k.left = false; else if (d < 0) k.right = false;
        /* A SMALL FOE IN FRONT WANTS THE LOW SWEEP, not the plain cut this generic swing otherwise throws (tools/small-adds.mjs):
           smallAim() is the same "what is this swing really aimed at" pick the ledger below judges it against, so asking it here,
           before the press, makes the bot actually throw the blow the ledger expects rather than a cut that glances the family table
           calls wrong for it (marsh: the frog king's hoppers, generic fallback path - no boss-specific branch of its own). */
        const nearSmall = smallAim(); const smallBand = nearSmall ? [nearSmall.y - (nearSmall.h || 8) - P.y, nearSmall.y - P.y] : null;   /* the top and the foot of the foe, up (-) from the hero's feet */
        /* THE BLOW MUST BE ABLE TO LAND (claude/herokit small-adds): the low sweep covers feet-8 .. feet+2 and every plain cut or thrust feet-16 .. feet-1, and a hopper
           mid-hop (foot 9-18 up) or on the ledge below (16 down) is in neither. Both of the warden's two 'misses' at the Bullfrog's hoppers were a sweep at a hopper in the
           air and a swing at one a tile below - nothing to do with her point (the knight misses the same way). Out of the sweep's band but inside the cut's: throw the cut;
           out of both: hold the swing for the frame it can land (it is the same boss swing, it comes round again next frame). */
        const inSweep = smallBand && smallBand[1] >= -8 && smallBand[0] <= 2, inCut = smallBand && smallBand[1] >= -16 && smallBand[0] <= -1;
        if (!nearSmall || inSweep || inCut) {
          if (nearSmall && inSweep && keyVerb(BK, h, nearSmall) === 'sweep') k.down = true;
          BK.press('atk'); swings++; } }
      if (opts.samples && f % 45 === 0) { out.samples = out.samples || []; out.samples.push([h, Math.round(f / 60), boss.mode, Math.round(d), Math.round(boss.y - P.y), k.block ? 'B' : '-', goal === null ? '·' : Math.round(goal - P.x), P.hurt > 0 ? 'hurt' : '', P.ground ? 'g' : 'air'].join(' ')); }
      if (f % 30 === 0 && boss.y < P.y - 12 && strike && ad < reach + 20) { BK.press('jump'); if(boss.t==='herald')P.labJump=18; }   /* a boss standing a tile up (the roc in the glass) is cut from a hop */
      /* THE LAST CHARGE, spent as a player spends it: at the boss while he is in front of the knight, open, and not winding up or rushing him */
      if (h === 'knight' && open && !tell && !rushing && !k.block && LAST_CHARGE(P, ad, boss.y - P.y)) { P.face = Math.sign(d) || P.face; k.left = false; k.right = false; k.jump = false; k.block = true; }
      // A BANKED PYRE IS FOR SPENDING: release the full heat meter toward a clear target between committed swings.
      if (h==='pyro' && P.full && !tell && !rushing && ad<140 && Math.abs(boss.y-P.y)<30 && !P.plunge && !P.cWas && P.atk<0) { P.face=Math.sign(d)||P.face; k.block=true; }
      /* A HAND CAUGHT ON A SPRING DOES NOT KNOW IT: nothing here has ever asked a bouncer a question, so a knockback that lands
         one on T.BOUNCER bounces it straight up forever - no swing starts (every one of them wants P.ground or P.swim), and every
         bounce touches down for the one frame that resets a simple "has it been airborne" counter before launching it again, so
         that reads as never stuck at all. Found on the Herald's river arena (claude/botfix): a changed action order upstream
         shifted the seeded roll enough to land the Freebooter on one that a different roll never touched, and he hung there
         bouncing for the rest of a 600 s fight, boss.hp frozen the whole time. This checks PROGRESS instead of ground state - has
         he actually moved, or the boss actually taken a hit, in the last three seconds - which a bounce that never carries him
         anywhere fails and ordinary footwork never does. It is a general floor under every boss fight, not a Herald fix. */
      /* CHECKED ONCE EVERY 30 FRAMES, NOT EVERY FRAME: a bounce's own period is close enough to any short sampling window that
         asking "is it grounded RIGHT NOW" lines up with the bounce's one grounded instant almost every time and never sees the
         stall at all (measured: adding !P.ground here brought back the exact frozen numbers this was written to fix). Position
         and boss.hp across three checks (1.5 s) is asked instead, which a bounce that carries him nowhere and lands nothing
         still fails, and which ordinary play - moving, or hitting something - still passes even through a long held guard. */
      /* THE DEATH KNIGHT'S WARD IS THE ONE HELD GUARD THIS DOES NOT SEE THROUGH (found on tools/boss-navigation.mjs, longwater/reaper,
         claude/botfix): WARD WALK (src/main.js, the reaper's C) sets P.vx = 0 outright while it is held, by design ("the blade comes
         with him, slowly"), so a Death Knight correctly turtling through a run of the Herald's tells - not moving, and taking nothing
         himself while the boss is not open to land a blow on - reads as no different from a bot truly stuck bouncing on a spring.
         Three checks of that (1.5 s) tripped P.labStuckF and the line below it dropped his guard (k.block = false) mid-tell, which is
         exactly the frame the Herald's sweep or thrust then landed clean: traced, every hit in the failing run had P.warding false and
         P.st untouched, so it was never a stamina question - the ward was ripped down by this check, not run dry. Excluded here, not
         removed: every OTHER stuck state (the spring, a jump held with no ground contact) never sets P.warding, so this still catches
         them exactly as before. */
      if (f % 30 === 0) { const stuck = !P.warding && Math.abs(P.x - (P.labStuckX ?? P.x)) < 6 && boss.hp === (P.labStuckHp ?? boss.hp);
        P.labStuckF = stuck ? (P.labStuckF || 0) + 1 : 0; P.labStuckX = P.x; P.labStuckHp = boss.hp; }
      /* HOLDING JUMP DOWN FOREVER IS ITS OWN STUCK STATE (found chasing this same herald-pirate check, claude/botfix
         follow-up): this used to set k.jump = true directly, with nothing to ever let it go again while P.labStuckF
         stayed at 3 or more - and being stuck is exactly the condition that never clears itself. Every other jump in
         this file taps BK.press('jump') once and holds k.jump only for a counted P.labJump frames; held down forever
         instead, a hero who is already airborne (which the alternating left/right below usually keeps him, hopping
         off the last thing he landed on) never gets the ground contact this file's own walk code needs to move him
         at all - traced on the Herald's mired window, pinned 30 px out of reach for 30+ real seconds, k.jump and
         k.left both true on every single frame and P.vx pinned at 0 throughout. Tap it instead, on the same bounded
         hold as everywhere else. */
      /* BOTH DIRECTIONS AT ONCE IS NO DIRECTION, on the Death Knight against the Herald specifically (found on this same check,
         longwater/reaper, claude/botfix): the walker above this had already set one of k.left/k.right for the frame (walking
         toward its own goal), and this only ever SET its alternating key, never clearing the other - so a frame where the two
         disagreed left both true, which cancels to net zero vx exactly like the two keys held together on a keyboard. Traced:
         the Death Knight parked 42-47 px from the Herald for the rest of a 180 s fight, left AND right both true every single
         frame, P.x not moved one pixel from the first stuck tick to the last.
         NOT WIDENED PAST THAT PAIR: the same swap made herald-pirate regress hard (71.9 s kill -> a 180 s timeout at 49-59% HP
         left, reproduced with the P.warding exemption above removed too, so it is this swap alone) - the Freebooter's own
         approach against the Herald evidently leans on exactly the cancel-to-standstill this "bug" produces (most likely his
         own hold-and-reload spacing getting read as "stuck" the same false-positive way the ward did, just by a mechanism this
         lane did not chase down). Scoped to the one pairing it is proven for; every other hero and boss keeps the old, narrower
         (do not widen without separately proving it safe for herald-pirate, boss-openings and boss-fight-end, which all also
         exercise this boss). */
      if ((P.labStuckF || 0) >= 3) { k.block = false;
        if (h === 'reaper' && boss.t === 'herald') { const goLeft = f % 40 < 20; k.left = goLeft; k.right = !goLeft; }
        else k[f % 40 < 20 ? 'left' : 'right'] = true;
        if (P.ground) { BK.press('jump'); P.labJump = 18; BK.press('dodge'); } }
      { const cb = crouchBPlan(BK, h); if (cb) { crouchBKeys(BK, cb); P.labJump = 0; } }   /* THE CROUCH TWISTS, when the room is calm (crouchBPlan) */
      if (duckNow(BK, h, boss) || emberNow(BK, h, boss)) { k.down = true; k.left = k.right = k.block = k.atk = k.jump = false; P.labJump = 0; BK.unpress(); }   /* (and the pyromancer's EMBER WARD, raised late to flare: emberNow) */   /* THE DUCK, last: whatever else the hands meant, a high blow at them goes over (duckNow) */
      const was = P.hp, m0 = boss.mode; advance(1,!!opts.draw); if (P.hp < was && !P.dead) taken += Math.min(60, was - P.hp); ledger(m0, P.dead ? 0 : was - P.hp);
      if (boss.t === 'lance') for (const q of BK.enemies()) if (q.lanceBow) bowSeen.add(q);
      if (h === 'reaper') { if (/Tell$/.test(m0 || '') && boss.mode !== m0) { dkEndF = f; dkEndM = m0; }
        /* the ward took something: learn how late that tell's blow came, and let go now - the nova */
        if ((P.wardG || 0) > dkG + 0.5 && !(P.parryT > 0)) { if (dkEndM && f - dkEndF <= dkF(0.8)) dkLag[dkEndM] = Math.min(dkLag[dkEndM] ?? 9, (f - dkEndF) * (BK.SET.speed || 1) / 60); dkHold = 0; dkS.relF = f; }
        dkG = P.wardG || 0; }
      if (opts.onFrame) await opts.onFrame({ boss, P, f, h, lvl: lvId, open });   /* THE CAMERA HOOK (opts.draw renders each frame; opts.onFrame may take it) */   /* a fall into a pit is a death and a respawn, not a blow: it is counted as falls, not as damage */
      if (P.dead) falls++;
      if (f % 600 === 599) await yieldNow();
    }
    k.left = false; k.right = false; k.block = false; smallEnd();
    let eyes = null; if (PERC) { PERC.restore(); eyes = PERC.stats(); PERC = null; } const skillCasts = SKH ? SKH.casts() : null; SKH = null; ROWBOSS = null;   /* the real state back on before the row is read */
    const secs = f * (BK.SET.speed || 1) / 60;
    rows.push({ lvl: lvId, boss: boss.t, h, killed: !boss.alive, secs: +secs.toFixed(1), bossHp: hp0, hpLeftPct: boss.alive ? Math.round(100 * boss.hp / hp0) : 0,
      health: {...health,endHp:Math.max(0,P.hp),died:!!P.dead}, outcome: !boss.alive ? (P.dead?'trade':'win') : P.dead&&normalHealth?'death':'timeout',
      takenPerMin: Math.round(taken / Math.max(1 / 60, secs) * 60), heroHp: P.maxHp, crowned: boss.crowned || 0, swings, smallSwings, smallMissed, opened, damage: boss.damageLedger || {plunge:0,other:0}, ripostes: boss.ripostes || 0, wallOpens: boss.wallOpens || 0, falls, returns: BK.stats().parries - par0, ...(opts.modes ? { modes: modeN, hitBy } : {}), ...(boss.t === 'lance' ? { archers: bowSeen.size, archersCut: [...bowSeen].filter(q => q.hp <= 0).length } : {}), ...(eyes ? { profile: LABP.name, eyes } : {}), ...(skillCasts ? { skillCasts } : {}) });
    await yieldNow();
    } finally { Math.random = realRandom; if (PERC) { PERC.restore(); PERC = null; } SKH = null; }
  }
  out.done = true; out.ms = Date.now() - out.started;
  return out;
}

// THE COLLECTION LAB. Can every silver, key and quest item actually be PICKED UP? Walking the whole level to each
// one measures the walker, not the item - the greedy walker cannot pogo a wasp chain, so it stalled at the first pit
// and called everything after it missed. So the question is split in two: GETTING THERE is the reach model's
// (node tools/reach.mjs, from the start), and the LAST STRETCH is played here. For each item the hero is put down on
// the nearest ground the reach fill says you can stand on, within fourteen tiles of it, and the playtest walker goes
// for it with god mode on. An item with no reachable ground near it at all is reported as NO APPROACH.
//   await BK.collectLab({ levels: ['wood'], secsPer: 25 })   -> window.__collectLab
export async function collectLab(BK, opts = {}) {
  const lvm = await import('./level.js'), PT = await import('./playtest.js'), RC = await import('./reachcore.js'), TS = 16;
  const levels = opts.levels || lvm.LEVELS.filter(l => !l.hidden && !/^(shop|trial|custom)/.test(l.id)).map(l => l.id);
  const out = { rows: [], started: Date.now(), progress: 0, total: levels.length };
  if (typeof window !== 'undefined') window.__collectLab = out;
  const silversOf = () => { const s = BK.silvers; return typeof s === 'function' ? s() : (s || []); };
  for (const id of levels) {
    const li = lvm.LEVELS.findIndex(l => l.id === id); if (li < 0) continue;
    const Lb = lvm.LEVELS[li].build(); const { seen } = RC.floodReach(Lb, lvm.T, { rides: true });
    const stands = [...seen].map(k => k.split(',').map(Number));
    BK.setHero(opts.hero || 'knight'); BK.load(li); BK.state = 'play'; BK.god = true; BK.sim(10);
    const P = BK.P, k = BK.keys;
    const items = [...silversOf().map(s => ({ kind: 'silver', ref: s, x: s.x, y: s.y })),
      ...BK.props().filter(p => (p.t === 'stray' || p.t === 'key') && !p.got).map(p => ({ kind: p.t === 'stray' ? 'quest:' + (p.kind || '') : p.t, ref: p, x: p.x, y: p.y }))];
    /* THE DEAD-END STASHES (opts.stash): the coins and hearts payDeadEnds put at the ends of pockets, gone for like anything
       else. A stash heart is only taken by a hero who is hurt, so he is kept hurt while he goes for it. */
    if (opts.stash) {
      const coinAt = new Set(Lb.ents.filter(e => e.stash && e.t === 'coin').map(e => (e.x * TS + 8) + ',' + ((e.y + 1) * TS - 6)));
      for (const a of (BK.acorns ? BK.acorns() : [])) if (!a.got && coinAt.has(a.x + ',' + a.y)) items.push({ kind: 'stash:coin', ref: a, x: a.x, y: a.y });
      /* only THIS level's: loading a level does not clear the hearts list (starting one does), so the last level's are still in it */
      const mendAt = new Set(Lb.ents.filter(e => e.t === 'mend').map(e => 'mend:' + e.x + ',' + e.y));
      for (const h of (BK.healths ? BK.healths() : [])) if (h.stay && !h.got && mendAt.has(h.key)) items.push({ kind: 'stash:heart', ref: h, x: h.x, y: h.y, hurt: true });
    }
    const got = [], missed = [];
    for (const it of items) {
      it.ref.got = false;
      const ix = Math.floor(it.x / TS), iy = Math.floor(it.y / TS);
      /* the nearest standable tile the fill reaches: same column band first, and ground under or level with it before ground above it */
      let best = null, bs = 1e9;
      for (const [x, y] of stands) { const dx = Math.abs(x - ix), dy = y - iy; if (dx > 14 || dy < -6 || dy > 14) continue; const sc = dx + (dy < 0 ? 12 - dy : dy * 0.7); if (sc < bs) { bs = sc; best = [x, y]; } }
      if (!best) { missed.push({ kind: it.kind, tile: ix + ',' + iy, why: 'NO APPROACH: no reachable ground within 14 tiles' }); continue; }
      for (const e of BK.enemies()) if (!e.maxHp) e.alive = false;
      BK.tp(best[0], best[1]); P.vx = 0; P.vy = 0; BK.sim(8);
      const walker = PT.makeBot(BK), budget = Math.round((opts.secsPer || 25) * 60); let f = 0, closest = 1e9;
      for (; f < budget && !it.ref.got; f++) {
        if (P.dead) { BK.sim(1); continue; }
        if (it.hurt && P.hp >= P.maxHp) P.hp = Math.max(1, P.maxHp - 30);
        walker(it.x);
        /* under it and it is overhead: jump for it */
        if (Math.abs(P.x - it.x) < 14 && it.y < P.y - 20 && P.ground && f % 20 === 0) BK.press('jump');
        BK.sim(1); closest = Math.min(closest, Math.round(Math.hypot(it.x - P.x, it.y - (P.y - 8))));
        if (f % 600 === 599) await new Promise(r0 => setTimeout(r0, 0));
      }
      k.left = k.right = k.up = k.down = k.jump = false;
      (it.ref.got ? got : missed).push({ kind: it.kind, tile: ix + ',' + iy, from: best.join(','), closest, secs: +(f / 60).toFixed(1) });
    }
    BK.god = false; out.progress++;
    out.rows.push({ lvl: id, items: items.length, got: got.length, missed: missed.filter(m => !got.includes(m)) });
    await new Promise(r0 => setTimeout(r0, 0));
  }
  out.done = true; out.ms = Date.now() - out.started;
  return out;
}

// THE KILL-ZONE SWEEP, with the real loop: every Nth tile the reach fill says you can stand on, a hero is put down on
// it with no creature in the level and left there for a fifth of a second. Anything that hurts or kills him is written
// down. tools/killzones.mjs asks the level data the same question; this asks the running game.
export async function killLab(BK, opts = {}) {
  const lvm = await import('./level.js'), RC = await import('./reachcore.js');
  const levels = opts.levels || lvm.LEVELS.filter(l => !l.hidden && !/^(shop|trial|custom)/.test(l.id)).map(l => l.id);
  const every = opts.every || 5, bad = [], out = { summary: { levels: 0, tiles: 0, bad: 0 }, bad };
  if (typeof window !== 'undefined') window.__killLab = out;
  for (const id of levels) {
    const i = lvm.LEVELS.findIndex(l => l.id === id); if (i < 0) continue;
    const Lb = lvm.LEVELS[i].build(); const { seen } = RC.floodReach(Lb, lvm.T, { rides: true });
    BK.setHero('knight'); BK.load(i); BK.state = 'play'; BK.god = false; BK.sim(5);
    const P = BK.P; let n = 0, lvBad = 0;
    for (const key of seen) { if (n++ % every) continue;
      const [x, y] = key.split(',').map(Number);
      for (const e of BK.enemies()) e.alive = false;
      BK.tp(x, y); P.hp = P.maxHp; P.dead = 0; P.inv = 0; P.vx = 0; P.vy = 0;
      let hurt = 0, wet = false; for (let f = 0; f < 12; f++) { const was = P.hp; BK.sim(1); if (P.swim) wet = true; if (P.hp < was) hurt += was - P.hp; if (P.dead) break; }
      /* WATER IS ITS OWN RULE: breath running out, a foul harbour, a bilge that eats you - every one of them is the level
         doing its job, and the pools already say so (tools/killzones.mjs checks their bottoms). Dry ground is the question. */
      const inPool = (BK.L.pools || []).some(p => P.x > p.x0 && P.x < p.x1 && P.y > p.y - 2 && (p.bottom === undefined || P.y <= p.bottom + 8));
      if (wet || inPool) { out.summary.wet = (out.summary.wet || 0) + 1; continue; }
      /* AND SO IS FIRE: a firepit burns in gouts on its own tile (since the timed prop is the one that spawns, the pits of Kingswood
         actually burn), and a hero put down on a lit one is burnt by the level doing its job, not by a bug. Only a fire ON the tile
         he was put on is excused; a burn from anywhere else is still reported, with the fires count in the row to say so. */
      const tileX = x * 16 + 8, tileY = (y + 1) * 16;
      const onFire = (BK.fires() || []).some(f => !(f.delay > 0) && Math.abs(f.x - tileX) < 14 && Math.abs(f.y - tileY) < 10);
      if (onFire && !P.dead) { out.summary.fire = (out.summary.fire || 0) + 1; continue; }
      out.summary.tiles++;
      if (P.dead || hurt > 0) { lvBad++;
        const tx = Math.floor(P.x / 16), ty = Math.floor(P.y / 16), g = BK.L.grid, W = BK.L.W;
        const near = BK.props().filter(p => Math.abs(p.x - P.x) < 40 && Math.abs(p.y - P.y) < 40).map(p => p.t);
        if (bad.length < 300) bad.push({ lvl: id, tile: x + ',' + y, dead: !!P.dead, hurt, at: tx + ',' + ty, under: g[(ty) * W + tx], body: g[(ty - 1) * W + tx], near: [...new Set(near)].join('/'), fires: (BK.fires() || []).filter(f => Math.abs(f.x - P.x) < 30).length, gas: !!(BK.L.gas && BK.L.gas.length) }); }
      if (n % 400 === 0) await new Promise(r0 => setTimeout(r0, 0));
    }
    out.summary.levels++; out.summary.bad += lvBad;
    await new Promise(r0 => setTimeout(r0, 0));
  }
  out.done = true; out.bad = bad.length ? bad : 0;
  return out;
}


/* THE SPIRAL STAIR, CLIMBED (claude/undead3, round undead4; claude/towerscroll): the bot for the Undead Archmage's chase, shared by
   tools/tower-chase.mjs, tools/stair-pilot.mjs and tools/archmage-pilot.mjs. It walks each flight's way and jumps off the lip for the next
   step, or at an edge, or under the ledge over it; it does not wait (the rising dark under it is src/chase.js's: it climbs to keep ahead).
   m is the chase's Archmage. o: { secs, refill (hold health up and count what it took), each(t), stop() (true: hand back now), guard() (true: stand and
   guard this frame - a careful hand answering his tells) } -> { t, taken, died } */
export function chaseClimb(BK, m, o = {}) {
  const F = SPIRAL_FLIGHTS, secs = o.secs || 150; let jh = 0, t = 0, taken = 0, died = 0, still = 0, lastX = 0, back = 0, kHere;
  for (; t < 60 * secs && !BK.carpet() && !(o.stop && o.stop()); t++) {
    const P = BK.P, G = BK.L.grid, W = BK.L.W;
    if (P.dead > 0) { BK.keys.right = BK.keys.left = BK.keys.jump = false; BK.sim(1); if (o.each) o.each(t); continue; }   /* (a death: it waits to wake) */
    /* THE FLIGHT IT IS ON, by where its feet are (not how far it has ever been: a fall puts it back on a lower flight) */
    if (P.ground || kHere === undefined) { const feet = Math.round(P.y / 16); kHere = -1; for (let i = 0; i < F.length; i++) if (feet <= F[i].land[2]) kHere = i; }
    const k = kHere, dir = F[Math.min(F.length - 1, k + 1)].dir;   /* (gone through his door, he still left a stair to climb) */
    let walk = dir;
    /* STUCK (a knock or a fall left it against a wall): turn back a moment and come at it again */
    if (Math.abs(P.x - lastX) < 0.5 && P.ground) still++; else still = 0; lastX = P.x;
    if (still > 90 && !(back > 0)) { back = 70; still = 0; } if (back > 0) { back--; walk = -dir; }
    BK.keys.right = walk > 0; BK.keys.left = walk < 0;
    /* THE STAIR IS A LIST (spiral-chase.js FLIGHTS): it knows the step it stands on and the next one its way, and jumps off the very lip
       of this one for that one (the heavy heroes need all of it), or - where the next is over it, on the floor - from under its edge */
    let leap = false;
    if (P.ground) { const f = Math.min(F.length - 1, k + 1), S = BK.L.spiral, seq = [f === 0 ? [S.x0, S.x1 - S.x0 + 1, S.floor] : F[f - 1].land, ...F[f].steps, F[f].land], feet = Math.round(P.y / 16), tx = P.x / 16;
      const at = seq.findIndex(([x0, len, row]) => row === feet && tx >= x0 - 0.4 && tx <= x0 + len + 0.4), nxt = at < 0 ? null : seq[at + (walk === dir ? 1 : -1)];
      if (nxt) { const cur = seq[at], lip = walk > 0 ? (cur[0] + cur[1]) * 16 - P.x : P.x - cur[0] * 16, near = walk > 0 ? nxt[0] * 16 - P.x : P.x - (nxt[0] + nxt[1]) * 16;
        if (near > lip + 4 ? lip < 4 : near < 18 && nxt[2] < cur[2]) leap = true; }
      else if (at < 0 && !G[Math.floor(P.y / 16) * W + Math.floor((P.x + walk * 3) / 16)]) leap = true; }   /* off the list (a landing it fell to): the old rule, jump at an edge */
    /* THE ORRERY LOFT (claude/archmage3): no stair - it waits at the lip of the ledge it boards from (the board step for the inner wheel, the pier for
       the outer) until a world comes up level with it, and steps on; on the inner world it stands still and walks off onto the pier as the
       world comes down past it; on the outer it JUMPS for the landing at the top of the turn */
    { const fo = Math.min(F.length - 1, k + 1), O = F[fo];
      if (O.orrery && P.ground) { const d = O.dir, seq = [F[fo - 1].land, ...O.steps, O.land], on = P.onMover && P.onMover.orrery ? P.onMover : null, ms = BK.movers().filter(m => m.orrery);
        const lipOf = q => d > 0 ? (q[0] + q[1]) * 16 : q[0] * 16, nearOf = q => d > 0 ? q[0] * 16 : (q[0] + q[1]) * 16, feet = P.y;
        if (on) { const nx = on.orrery === 'A' ? seq[2] : seq[3], top = nx[2] * 16, lead = d > 0 ? on.x + on.w : on.x, gap = (nearOf(nx) - lead) * d;
          BK.keys.right = BK.keys.left = false; leap = false;
          const fromBack = d > 0 ? P.x - on.x : on.x + on.w - P.x; if (fromBack < on.w - 8) { BK.keys.right = d > 0; BK.keys.left = d < 0; }   /* to the front of the world first: the step off is short */
          if (on.orrery === 'A') { if (gap < 12 && feet - top < 3) { BK.keys.right = d > 0; BK.keys.left = d < 0; } }
          else if (top - feet > -16 && top < feet && gap < 40 && on.dy >= -0.2 && (on.x - (on.px - on.w / 2)) * d > -6) { BK.keys.right = d > 0; BK.keys.left = d < 0; leap = true; } }
        else { const at = seq.findIndex(([x0, len, row]) => Math.abs(row * 16 - feet) < 3 && P.x / 16 >= x0 - 0.4 && P.x / 16 <= x0 + len + 0.4);
          if (at === 1 || at === 2) { const q = seq[at], id = at === 1 ? 'A' : 'B', lip = lipOf(q), toLip = (lip - P.x) * d;
            BK.keys.right = BK.keys.left = false; leap = false;
            if (toLip > 7) { BK.keys.right = d > 0; BK.keys.left = d < 0; }
            else { const top = q[2] * 16, ready = ms.some(m => m.orrery === id && m.dy < 0 && m.y - top > 2 && m.y - top < 14 && Math.abs((d > 0 ? m.x : m.x + m.w) - lip) < 16);
              if (ready) { BK.keys.right = d > 0; BK.keys.left = d < 0; } still = 0; } } } } }
    /* THE NEW FLIGHTS (claude/archmage2b): it waits out a clock weight's swing (it walks on only when no weight meets it on the way, unless
       where it stands is no safer), and it meets his books - a held guard turns them; the rest jump them as they come */
    const fx = BK.chase && BK.chase.stairFx && BK.chase.stairFx();
    if (fx && P.ground && !(jh > 0)) { const fk = Math.min(F.length - 1, k + 1), sq = [fk === 0 ? [BK.L.spiral.x0, 26, BK.L.spiral.floor] : F[fk - 1].land, ...F[fk].steps, F[fk].land];   /* (the feet it will have on the way: the ledge under it, or over a gap the next one up) */
      const yAt = x => { const tx = x / 16, on = sq.find(([x0, len]) => tx >= x0 && tx <= x0 + len); if (on) return on[2] * 16; const up = sq.filter(([x0, len]) => (x0 + len / 2 - tx) * walk > 0); return (up[0] || sq[sq.length - 1])[2] * 16; };
      const ps = spiralPendSafe(fx.t, P.x, P.y, walk, 1.0, 85, yAt); if (!ps.go && ps.stay) { BK.keys.right = BK.keys.left = false; leap = false; } }
    let bookGuard = false;
    if (fx && P.ground) for (const b of fx.books) { if (b.tell > 0 || (b.x - P.x) * b.vx > 0) continue; const d = Math.abs(b.x - P.x);
      if (d < 70 && Math.abs((P.y - 13) - b.y) < 20) { if (SHIELDED((BK.PROG && BK.PROG.hero) || 'knight') && d < 60) bookGuard = true; else if (d < 34 && !(jh > 0)) { BK.press('jump'); jh = 12; } } }
    const guard = bookGuard || !!(o.guard && P.ground && !(jh > 0) && o.guard());
    if (guard) { BK.keys.right = BK.keys.left = false; leap = false; } BK.keys.block = guard;
    if (leap && !(jh > 0)) { BK.press('jump'); jh = 16; }
    BK.keys.jump = jh > 0; jh--;

    const was = P.hp; BK.sim(1); if (o.each) o.each(t);
    if (BK.P.dead > 0) died++;
    else { taken += Math.max(0, was - BK.P.hp); if (o.refill) BK.P.hp = BK.P.maxHp; }
  }
  BK.keys.right = BK.keys.left = BK.keys.jump = BK.keys.block = false;
  return { t, taken, died };
}
