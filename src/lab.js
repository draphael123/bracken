import {breathCapacity} from './deepair.js';
import { AMBUSH_TARGET } from './ambush.js';
import { mulberry } from './px.js';   /* bossLab seeds Math.random for the row it is about to fight - see the note over the loop in runbossLab */
// src/lab.js — THE FIGHT LAB and THE BOSS LAB.
// The playtest bot walks levels. These FIGHT, and measure what a player feels: how long a foe or a boss takes to
// kill, and how much of your health it costs. Both yield between fights, so a page can be polled while they run.
//   await BK.fightLab({ levels: ['wood', 'spire', 'waymeet'], heroes: [...], foes: [...], reps: 2 })   -> window.__lab
//   await BK.bossLab({ bosses: ['wood', 'kings', ...], heroes: [...] })                                -> window.__bossLab
import { MARK } from './marks.js';
import { GEO as GEO_K } from './geomancer.js';   /* THE GEOMANCER's FAULT LINE: how far the crack will run is read off the same numbers the kit uses */
import { OR } from './ore-road.js';   /* THE ORE ROAD's arena, for the Winchmaster's hands */   /* THE MARK TABLE: every red !! in it is a tell the bot steps out of, never guards */

// each hero's real reach (attackBox in main.js), so the bot swings from where the blow actually lands
const LAB_STAND = {knight:12,warden:38,pyro:18,paladin:14,pirate:12,reaper:18,geomancer:16};
export const LAB_REACH = { knight: 22, pyro: 30, paladin: 24, pirate: 20, reaper: 29, warden: 40, geomancer: 24 };   /* (geomancer: the stone of her stave lands 21-26 out) */   /* her point lands at 44: the bot stands just inside it, where the TIP zone is */
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
/* AND ON THE BEAT. A sweep is live a quarter second and then a quarter second spent, so tapping all through a long wind-up leaves half of
   it bare - measured: a hedge knight's swing landed on the spent half one fight in three. A common foe's tell counts its modeT down to
   the blow, so she holds the sweep until the last fifth of a second of it (a tell that keeps no such clock is swept at as before). */
/* A BROKEN OR PINNED FOE IS NOT SWINGING. Its AI stands still (main.js skips it) with its wind-up frozen where it was, so its mode still
   reads as a tell - and the bot that broke a brute with a heavy blow then stood behind its shield for the whole of the opening. Until the
   last third of a second of it, that is time to cut, not to guard. (The boss lab keeps threatOf as it was: its numbers are its own.) */
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
  if (threat && P.atk < 0 && !(P.dash > 0)) {
    defend = 1;   /* (a heavy half wound goes if it can, and is dropped if it cannot) */
    if (HARD_TELLS.has(e.t + '|' + e.mode)) { k[d > 0 ? 'left' : 'right'] = true; if (f % 14 === 0) BK.press('dodge'); }
    else if (h === 'pyro') { if (f % 20 === 0) { k[d > 0 ? 'left' : 'right'] = true; BK.press('dodge'); } }
    else if (h === 'pirate') { if (f % 12 === 0) k.block = true; }
    else if (h === 'warden') { if (HARD_TELLS.has(e.t + '|' + e.mode)) { if (f % 14 === 0) BK.press('dodge'); } else k.block = ON_THE_BEAT(e) && DEFLECT_TAP(f); }
    else k.block = true;
  } else {
    const s = strike(BK, h, e, f); swing = s.swing;
    /* THE WARDEN KEEPS HER POINT OUT: inside the haft she only shoves, so she steps back out of it (her step goes backward by itself) */
    if (h === 'warden' && ad < 20 && P.atk < 0 && !(P.charge > 0) && !(P.dodge > 0) && P.st >= 20 && f % 10 === 0) BK.press('dodge');
    if (!k.left && !k.right && !(P.charge > 0)) { if (h === 'pirate' && s.verb === 'heavy' && ad < s.want - 8) k[d > 0 ? 'left' : 'right'] = true; else if (ad > s.want + 2) k[d > 0 ? 'right' : 'left'] = true; else if (s.verb === 'plunge' && !P.ground && ad > 3) k[d > 0 ? 'right' : 'left'] = true; }
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
//   the goblin queen  - bait her charge into one of her pillars (stand past it, away from her); with none standing, lead her under a chandelier, jump
//                       and cut its chain; then cut her while she is pinned (2026-09-25; before that it was the chandelier alone, and before THAT her gallery)
//   the roc           - stand on the glass so her dive sticks in it, then cut her while she is down
//   the buried prince - in the dark, light a lamp; with him under a timber set, cut its post; off the red mark when he is under the floor
// Every other boss is cut whenever it is in reach. All of them are defended against on their tells. The hero's health is
// put back each frame and what the boss took is counted: how long it lasts, and the damage per minute it takes to see it out.
/* AND THE ONES WHOSE GATE LIVES IN main.js ASK IT (BK.bossOpen): the Queen's Lance turns every blade until he is
   committed, so a bot that treated him as open swung at his plate for the whole fight. */
const OPEN = (b, BK) => { const g = BK && BK.bossOpen ? BK.bossOpen(b) : null; return g === null || g === undefined ? OPEN0(b) : g; };
const OPEN0 = b => b.t === 'ploughman' ? b.open > 0 : b.t === 'master' ? b.open > 0 : b.t === 'troll' && b.hill ? b.mode === 'pinned' : b.t === 'closedhelm' ? b.open > 0 : b.t === 'king' ? (b.mode === 'held' || b.open > 0) : b.t === 'gqueen' ? b.mode === 'pinned' : b.t === 'roc' ? (b.mode === 'stuck' || b.mode === 'skid' || b.mode === 'downed') : true;
/* THE RED MARKS, from tools/tells.mjs (scratchpad hardtells.mjs writes this line): a tell no shield turns is dodged, never guarded */
export const HARD_TELLS = new Set(["troll|slamTell","troll|ripTell","assassin|markTell","berserker|windTell","captain|kegTell","captain|shootTell","closedhelm|bashTell","drownedking|slamTell","forgemaster|anvilTell","forgemaster|breathTell","forgemaster|dragTell","forgemaster|dropTell","forgemaster|hurlTell","forgemaster|ladleTell","forgemaster|pourTell","forgemaster|slamTell","forgemaster|whirlTell","golem|stompTell","gqueen|chandTell","gqueen|chargeTell","gqueen|gDropTell","gqueen|leapTell","gqueen|shadowTell","gqueen|slamTell","gqueen|sweepTell","grandmother|sweepTell","grandmother|throwTell","herald|sweepTell","king|cageTell","king|chargeTell","king|grabTell","king|liftTell","king|shoutTell","king|slamTell","lance|bashTell","lance|whirlTell","master|leapTell","masthead|boomTell","masthead|dropTell","owl|hootTell","prince|sinkTell","prince|snuffTell","quarter|shootTell","quarter|stanceTell","ram|leapTell","ram|stampTell","ram|tossTell","roadman|leapTell","roc|diveTell","suncatcher|frostTell","suncatcher|hailTell","suncatcher|spireTell","roc|shriekTell","tollmaster|tollTell","troop|grabTell","windcaller|wallTell"]);
HARD_TELLS.add('owl|skimTell');
HARD_TELLS.add('gobmage|runeTell');   /* THE GOBLIN MAGE'S RUNE: stepped off, never guarded */
for (const m of ['sweepTell', 'baleTell', 'lanternTell', 'leapTell']) HARD_TELLS.add('strawking|' + m); HARD_TELLS.add('ploughman|chargeTell');   /* THE HEXED FIELDS' red marks */
for (const m of ['scuttleTell', 'poundTell', 'flaskTell']) HARD_TELLS.add('homunculus|' + m); for (const m of ['rendTell', 'slamTell']) HARD_TELLS.add('archmage|' + m);   /* THE MAGE'S FOLLY's red marks */
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
export async function bossLab(BK, opts = {}) {
  const previous = BK.manualSimulation;
  const miniBefore=opts.mini?Object.fromEntries(Object.entries(BK.PROG).filter(([,v])=>v&&typeof v==='object').map(([k,v])=>[k,v.mini])):null;
  BK.manualSimulation = true;
  try { return await runbossLab(BK, opts); }
  finally { BK.manualSimulation = previous; if(miniBefore)for(const[k,v]of Object.entries(miniBefore)){if(v===undefined)delete BK.PROG[k].mini;else BK.PROG[k].mini=v;} }
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
  for (const lvId of bosses) for (const h of heroes) {
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
    else { BK.tp(Math.round(A.trigger / 16) + (A.reverse?-1:1), Math.round(A.floor / 16) - 1); if (opts.nudge) BK.P.x += opts.nudge; BK.sim(30); }   /* opts.nudge: start a few px off, for reps of a fight no dice reach (the Deep and the Hurricane replay identically under any seed) */
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
    P.labPogo=0;P.labNextPogo=0;P.labPogoJump=-100;P.labHeavyAt=0;P.labShipVault=0;P.labRest=false;P.labJump=0;P.labMageLanding=null;P.labMageTap=-99;
    // the old roof boards in the roc's nest, once: her dive sticks in them
    const glass = []; if (boss.t === 'roc') for (const [x0, x1] of ((L.monk && L.monk.boards) || [])) for (let x = x0; x <= x1; x++) glass.push(x * TS + 8);
    /* nearest the middle of the room first; the bot moves between three of them so it is always standing on one when she comes down */
    { const mid = (A.x0 + A.x1) / 2; glass.sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid)); }
    /* THE MODE LEDGER (opts.modes): how often the boss ENTERED each mode, and how much of the hero's health was lost while it was in each - which attacks fired at all, and which ones did the damage */
    const modeN = {}, hitBy = {}; let lastMode = null;
    const ledger = (m0, lost) => { if (!opts.modes) return; if (boss.mode !== lastMode) { lastMode = boss.mode; modeN[lastMode] = (modeN[lastMode] || 0) + 1; } if (lost > 0) hitBy[m0] = (hitBy[m0] || 0) + lost; };
    let f = 0, taken = 0, swings = 0, opened = 0, wasOpen = false, falls = 0, holdC = 0; const bowSeen = new Set();   /* the Queen's Lance's bowmen, every one that came (row: archers, archersCut) */
    /* THE DEATH KNIGHT'S WARD, played like a man: C held through a tell, and let go when the ward has stopped the blow (the nova) - or,
       once he has SEEN how late a tell's blow lands after its windup ends (dkLag), let go just before it lands, with a reaction
       time behind it, so it is RETURNED. One release in ten is early. dkHold keeps the ward up a little past the end of a tell. */
    const dkLag = {}, dkF = s => Math.round(s * 60 / (BK.SET.speed || 1)), par0 = BK.stats().parries; let dkHold = 0, dkRel = { mode: null, t0: 0, at: -9 }, dkG = 0, dkEndF = -99, dkEndM = null;   /* the paladin's aegis is HELD: a tap of C is a mend that roots her, so the guard is kept up through the tell */
    for (; f < maxF && boss.alive && (!normalHealth || !P.dead); f++) {
      if(!normalHealth){P.hp = P.maxHp; P.dead = 0;} // refill mode observes health separately; stamina must be earned back by the real recovery rule
      if(P.st<12)P.labRest=true;if(P.st>=Math.min(48,P.maxSt*.6))P.labRest=false;
      if(P.labRest&&!P.plunge&&boss.t!=='mother'&&boss.t!=='undeadmage'&&boss.t!=='pyromancer'&&boss.t!=='gravewarden'&&boss.t!=='hedgewarden'&&boss.t!=='gargoyle'&&boss.t!=='winchmaster'&&boss.t!=='duneworm'){   /* (and the Dune Worm's: his hands rest inside their own branch, still off every tell - a rest that backed off blind stood in his sinkholes) */   /* (the Winchmaster's too, round three: its floor is the pit, and this rest backs 30 px away from him - off his ledge into the spikes, measured, over and over) */   /* (the Mother's pilot rests inside its own branch: resting used to stand it still under her vines) */
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
      if (boss.t === 'drownedking' || boss.t === 'bellcrab') { if (P.ballast) { P.ballast.held = false; P.ballast = null; }
        k.left = k.right = k.up = k.down = k.jump = k.block = false;
        const by = boss.y - 16, dx = boss.x - P.x, dy = by - (P.y - 10), adx = Math.abs(dx), reach2 = LAB_REACH[h] + (boss.w || 20) / 2;
        if (OPEN(boss, BK) && boss.open > 0 && !wasOpen) opened++; wasOpen = boss.open > 0;
        if (boss.t==='bellcrab' && ['ballastTell','scuttleTell','scuttle'].includes(boss.mode)) k.up=true;
        else if (boss.t==='bellcrab' && boss.mode==='pressureTell' && Math.abs(P.x-boss.bellMark.x)<45) k[P.x<boss.bellMark.x?'left':'right']=true;
        else if (boss.mode === 'ramTell' || (boss.mode === 'ram' && Math.hypot(dx, dy) < 120)) { const nx = -(boss.rdy || 0), ny = boss.rdx || 1, s = ((P.x - boss.x) * nx + ((P.y - 10) - by) * ny) >= 0 ? 1 : -1;
          if (Math.abs(nx) > 0.35) k[nx * s > 0 ? 'right' : 'left'] = true; k[ny * s > 0 ? 'down' : 'up'] = true; }
        else if (boss.mode === 'diveTell' || boss.mode === 'dive') k[P.x < (boss.dcol !== undefined ? boss.dcol : boss.x) ? 'left' : 'right'] = true;
        /* THE MAELSTROM: away from him at a full stroke, and a dash out of the current the moment it is turning */
        else if (boss.mode === 'whirlTell' || boss.mode === 'whirl') { k[dx > 0 ? 'left' : 'right'] = true; k[dy > 0 ? 'up' : 'down'] = true;
          if (boss.mode === 'whirl' && f % 18 === 0) BK.press('dodge'); }
        /* AND IT BREATHES. Under two and a half seconds of breath it goes to the nearest air he has not burst (and is not about to), and
           stays in it until the breath is back: a swimmer who fights him without breathing is a swimmer who drowns in the lab and not in play */
        else if (air.length && ((P.breath ?? 6) < 3 || (P.labAir && (P.breath ?? 6) < (breathCapacity(BK.L,P.relic)) - 0.3))) {
          const live = air.filter(s => !(s.o.goneUntil > BK.time) && !(s.o.shiverUntil > BK.time));
          const src = live.sort((a, b) => Math.hypot(a.x - P.x, a.ty - P.y) - Math.hypot(b.x - P.x, b.ty - P.y))[0];
          if (src) { P.labAir = true; const gx = Math.max(src.l + 8, Math.min(src.r - 8, P.x)), gy = src.ty;
            if (Math.abs(gx - P.x) > 4) k[gx > P.x ? 'right' : 'left'] = true; if (gy < P.y - 4) k.up = true; else if (gy > P.y + 4) k.down = true;
            if (adx <= reach2 && Math.abs(dy) < 22 && P.atk < 0 && f % 3 === 0) { P.face = Math.sign(dx) || P.face; k.down = k.up = false; BK.press('atk'); swings++; } }
          else P.labAir = false; }
        else { P.labAir = false; if (adx > Math.max(10, LAB_REACH[h] * 0.6)) k[dx > 0 ? 'right' : 'left'] = true; if (dy < -10) k.up = true; else if (dy > 10) k.down = true;
          if (SHIELDED(h) && /Tell$/.test(boss.mode || '') && !HARD_TELLS.has(boss.t + '|' + boss.mode) && Math.hypot(dx, dy) < 120 && (h === 'paladin' || h === 'reaper' || boss.modeT < 0.2)) { k.block = true; k.left = k.right = k.up = k.down = false; P.face = Math.sign(dx) || P.face; }
          else if (adx <= reach2 && Math.abs(dy) < 22 && P.atk < 0) { P.face = Math.sign(dx) || P.face; k.down = k.up = false; BK.press('atk'); swings++; } }   /* a cut, not a plunge: down held under the swing is a down attack, and the lab was plunging him to death */
        if (opts.samples && f % 45 === 0) { out.samples = out.samples || []; out.samples.push([h, Math.round(f / 60), boss.mode, Math.round(dx), Math.round(dy), boss.open > 0 ? 'OPEN' : '', P.swim ? 'swim' : 'dry'].join(' ')); }
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
        /* HER SPORELINGS (batch 4a) are cut down when they come close, the way a player clears an add before going back to the knot */
        const add=BK.enemies().filter(q=>q.alive&&q.fromMother&&Math.abs(q.y-P.y)<30).sort((a,b)=>Math.abs(a.x-P.x)-Math.abs(b.x-P.x))[0],addNear=add&&boss.mode!=='open'&&Math.abs(add.x-P.x)<110;
        if(addNear&&!bad(add.x)){gx=add.x-(Math.sign(add.x-P.x)||1)*LAB_REACH[h]*.6;safe=false;}
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
      if(boss.vaultKeeper){
        k.left=k.right=k.up=k.down=k.jump=k.block=false;
        const dx=boss.x-P.x,side=Math.sign(dx)||1,mode=boss.mode;let gx=boss.x-side*Math.max(20,LAB_REACH[h]*.65),gy=boss.y;
        if(mode==='vaultRingTell'){gx=boss.x+(P.x<boss.x?-120:120);gy=boss.y-55;}
        if(mode==='vaultPressureTell'){gx=boss.aimX+(P.x<boss.aimX?-52:52);gy=boss.aimY-45;}
        if(mode==='vaultBandTell')gy=boss.aimY-48;
        const mx=breathCapacity(L,P.relic);if(P.breath<4||(P.labAir&&P.breath<mx-.3)){P.labAir=true;const xs=[484.5,494.5,504.5].map(x=>x*TS);gx=xs.sort((a,b)=>Math.abs(a-P.x)-Math.abs(b-P.x))[0];gy=A.floor-12;}else P.labAir=false;
        gx=Math.max(A.x0+20,Math.min(A.x1-20,gx));gy=Math.max(A.floor-125,Math.min(A.floor-5,gy));
        if(Math.abs(gx-P.x)>4)k[gx>P.x?'right':'left']=true;if(gy<P.y-4)k.up=true;else if(gy>P.y+4)k.down=true;
        const guard=['vaultHookTell','vaultSpearTell'].includes(mode);
        if(guard&&SHIELDED(h)){k.block=true;k.left=k.right=k.up=k.down=false;P.face=side;}else if(guard&&boss.modeT<.2)BK.press('dodge');
        if(!guard&&!P.labAir&&!mode.endsWith('Tell')&&Math.abs(dx)<LAB_REACH[h]+boss.w/2&&Math.abs(P.y-boss.y)<27&&P.atk<0){P.face=side;k.down=k.up=false;BK.press('atk');swings++;}
        const was=P.hp,m0=boss.mode;advance(1,!!opts.draw);taken+=Math.max(0,was-P.hp);ledger(m0,Math.max(0,was-P.hp));if(f%600===599)await yieldNow();continue;
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
          const sp=Math.hypot(q.vx,q.vy)||1,closing=(rx*q.vx+ry*q.vy)/sp;if(closing<0)continue;
          if(SHIELDED(h)&&d<46&&q.kind!=='orb'){block=true;P.face=Math.sign(q.x-P.x)||P.face;continue;}
          const nx=-q.vy/sp,ny=q.vx/sp,s2=(rx*nx+ry*ny)>=0?1:-1;vx+=nx*s2*1.4;vy+=ny*s2*1.4;threat=true;if(d<24&&P.st>20&&!(P.dodge>0))BK.press('dodge');}   /* and the dash's i-frames through the one that is about to land */
        const rest=P.st<14||(P.labRest&&P.st<40);P.labRest=rest;
        if(!threat){const want=boss.open>0?LAB_REACH[h]*0.55:(rest?150:LAB_REACH[h]*0.7);const gx=boss.x-side*want,gy=by;
          if(Math.abs(gx-P.x)>6)vx+=Math.sign(gx-P.x);if(Math.abs(gy-py)>6)vy+=Math.sign(gy-py);}
        if(vx>0.3)k.right=true;else if(vx<-0.3)k.left=true;if(vy>0.3)k.down=true;else if(vy<-0.3)k.up=true;
        if(block){k.block=true;}
        else if(!rest&&!['blinkOut','blinkIn','wake'].includes(m)&&Math.abs(dx)<LAB_REACH[h]+10&&Math.abs(dy)<20&&P.atk<0){P.face=side;BK.press('atk');swings++;}
        if(threat&&m==='markWait'&&boss.deathMark&&Math.hypot(P.x-boss.deathMark.x,py-boss.deathMark.y)<boss.deathMark.r&&P.st>20&&f%20===0)BK.press('dodge');
        const was=P.hp;advance(1,!!opts.draw);taken+=Math.max(0,was-P.hp);ledger(m,Math.max(0,was-P.hp));if(P.dead)falls++;
        if(opts.onFrame)await opts.onFrame({boss,P,f,h,lvl:lvId,open:boss.open>0});
        if(f%600===599)await yieldNow();continue;
      }
      /* THE PYROMANCER (batch 5): the bot reads the square. It never stands on burning ground (a burning or catching cell of the
         village's fire grid), keeps out of the firedrop's landing ring, the jet's cone and the vent's ring, takes his embers on
         the shield (the three who carry one) or rolls through them, and otherwise stays in reach and cuts - which is what keeps
         him from venting and takes him over the top into OVERHEAT, where it goes in. Resting is done on clear ground, away. */
      if(boss.t==='pyromancer'){
        k.left=k.right=k.up=k.down=k.jump=k.block=false;
        if(boss.open>0&&!wasOpen)opened++;wasOpen=boss.open>0;
        const VGr=BK.village?BK.village().G():null,fl=A.floor,m=boss.mode,dx=boss.x-P.x,side=Math.sign(dx)||1;
        const hotAt=x=>{if(fireAt(BK,x,fl-1))return true;if(!VGr)return false;const c=VGr.get(Math.floor(x/16),Math.floor(fl/16)-1);return !!c&&(c.s===2||c.s===1);};   /* the square's grid AND every other flame on the floor: his embers and his drop leave fire where they land */
        const danger=[];
        if(m==='ventTell'||m==='vent')danger.push([boss.x-84,boss.x+84]);
        if(m==='dropTell'||m==='rise'||m==='drop')danger.push([(boss.tx??P.x)-56,(boss.tx??P.x)+56]);
        if((m==='jetTell'||m==='jet')&&!SHIELDED(h))danger.push(boss.face>0?[boss.x,boss.x+100]:[boss.x-100,boss.x]);
        if((m==='jetTell'||m==='jet')&&SHIELDED(h)&&Math.abs(dx)<100){k.block=true;P.face=side;}
        if(m==='staffTell'){if(SHIELDED(h)){k.block=true;P.face=side;}else danger.push([boss.x-44,boss.x+44]);}   /* his staff: guarded, or stepped back from */
        if(m==='wallTell')danger.push(boss.face>0?[boss.x,boss.x+90]:[boss.x-90,boss.x]);   /* the fire wall's line */   /* the jet is a '!' now: the three with a guard hold it */
        const bad=x=>danger.some(([l,r])=>x>l&&x<r)||hotAt(x),free=x=>x>A.x0+16&&x<A.x1-16&&!bad(x);
        const rest=P.st<14||(P.labRest&&P.st<44);P.labRest=rest;
        let gx=rest?boss.x-side*150:boss.x-side*Math.max(18,LAB_REACH[h]*.65);
        if(!free(gx)){let best=null;for(let s=6;s<440&&best===null;s+=6){if(free(gx-s))best=gx-s;else if(free(gx+s))best=gx+s;}if(best!==null)gx=best;}
        if(Math.abs(gx-P.x)>4)k[gx>P.x?'right':'left']=true;
        if(P.ground&&Math.abs(gx-P.x)>12){const dir=gx>P.x?1:-1;if(hotAt(P.x+dir*8)||hotAt(P.x+dir*22)||hotAt(P.x+dir*34)){BK.press('jump');P.labJump=16;}}   /* a player jumps the flames between him and where he is going - a full jump, held: a tapped hop is six pixels and the fire reaches fourteen */
        if(P.labJump>0){P.labJump--;k.jump=true;}
        if(P.ground&&P.y<fl-20){k.down=true;BK.press('jump');}   /* off a stall: the fight is on the floor */
        const inRing=danger.length&&bad(P.x)&&Math.abs(gx-P.x)>40;
        if(inRing&&(m==='drop'||m==='vent'||m==='jet'||(m.endsWith('Tell')&&boss.modeT<.18))&&P.st>20&&!(P.dodge>0))BK.press('dodge');
        const inc=BK.seeds().find(s=>s.pyroEmber&&!s.dead&&Math.abs(s.x-P.x)<80&&Math.abs(s.y-(P.y-8))<30&&(s.x-P.x)*s.vx<0);
        const volley=(m==='emberTell'||m==='ember')&&Math.abs(dx)<220;   /* his ember '!': a player with a shield guards the whole volley, facing him */
        if(volley&&SHIELDED(h)){k.block=true;k.left=k.right=false;P.face=side;}
        else if(inc&&SHIELDED(h)){k.block=true;k.left=k.right=false;P.face=Math.sign(inc.x-P.x)||P.face;}
        else if(inc&&P.st>20&&!(P.dodge>0)&&Math.abs(inc.x-P.x)<24)BK.press('dodge');
        else if(!rest&&!danger.length&&Math.abs(dx)<LAB_REACH[h]+boss.w/2&&Math.abs(P.y-boss.y)<32&&P.atk<0){P.face=side;BK.press('atk');swings++;}
        if(opts.samples&&f%60===0){out.samples=out.samples||[];out.samples.push([h,Math.round(f/60),m,Math.round(boss.heat),boss.open>0?'OPEN':'',Math.round(dx),hotAt(P.x)?'HOT':''].join(' '));}
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
      /* THE HEDGE WARDEN (batch 4c): the bot plays him as a player does - fights him BESIDE A BRAZIER (it stands past the nearest
         one, so he follows it there and is felled by the fire), gets clear of the thorns, guards the cut and the rush (or backs
         off / jumps the rush without a shield), cuts the cuttings he throws off, and puts everything into a stump. */
      /* THE TIDE REAVER (2026-09-22): played as a player plays him - it JUMPS the low rake as its tell runs out, jumps the wave and jumps
         his cast (which sticks the harpoon in the wall and disarms him: it then puts everything into him), guards the thrust with a
         shield or steps back out of it without one, and otherwise stands in reach and cuts. */
      if(boss.t==='tidemarauder'&&boss.mini){
        k.left=k.right=k.up=k.down=k.jump=k.block=false;
        const open=boss.mode==='disarmed'||boss.mode==='fetch'||boss.mode==='wrench';if(open&&!wasOpen)opened++;wasOpen=open;
        const m=boss.mode,dx=boss.x-P.x,side=Math.sign(dx)||1,hp=boss.harpoon,wv=boss.wave;
        const rest=!open&&(P.st<14||(P.labRest&&P.st<44));P.labRest=rest;
        let gx=rest?boss.x-side*120:boss.x-side*Math.max(14,LAB_REACH[h]*.7);
        if((m==='thrustTell'||m==='reelThrust')&&!SHIELDED(h))gx=boss.x-side*110;   /* no shield: out of the thrust, the reeled one too */
        gx=Math.max(A.x0+18,Math.min(A.x1-18,gx));
        if(Math.abs(gx-P.x)>4)k[gx>P.x?'right':'left']=true;
        const jumpNow=(m==='rakeTell'&&boss.modeT<0.2&&Math.abs(dx)<110)||(wv&&Math.abs(wv.x-P.x)<40&&Math.sign(P.x-wv.x)===wv.dir)||(m==='cast'&&hp&&!hp.stuck&&Math.abs(hp.x-P.x)<46&&Math.sign(P.x-hp.x)===hp.dir);
        if(jumpNow&&P.ground){BK.press('jump');P.labJump=16;}
        if(P.labJump>0){P.labJump--;k.jump=true;}
        if((m==='thrustTell'||m==='reelThrust')&&SHIELDED(h)&&Math.abs(dx)<120){k.block=true;k.left=k.right=false;P.face=side;}
        else if(!rest&&m!=='rakeTell'&&!(m==='thrustTell'&&!SHIELDED(h))&&Math.abs(dx)<LAB_REACH[h]+boss.w/2&&Math.abs(P.y-boss.y)<40&&P.atk<0){P.face=side;BK.press('atk');swings++;}
        const was=P.hp,m0=boss.mode;advance(1,!!opts.draw);taken+=Math.max(0,was-P.hp);ledger(m0,Math.max(0,was-P.hp));if(P.dead)falls++;
        if(f%600===599)await yieldNow();continue;
      }
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
        if(P.labJump>0){P.labJump--;k.jump=true;}
        if((m==='cutTell'||m==='cut'||m==='rushTell'||m==='rush')&&SHIELDED(h)&&Math.abs(dx)<140){k.block=true;k.left=k.right=false;P.face=side;}
        else if(add&&Math.abs(add.x-P.x)<LAB_REACH[h]+add.w/2+2&&Math.abs(add.y-P.y)<24&&P.atk<0&&!stump){P.face=Math.sign(add.x-P.x)||1;BK.press('atk');swings++;}
        else if(!rest&&m!=='thornTell'&&m!=='thorn'&&!(m==='cutTell'&&!SHIELDED(h))&&Math.abs(dx)<LAB_REACH[h]+boss.w/2&&Math.abs(P.y-boss.y)<40&&P.atk<0){P.face=side;BK.press('atk');swings++;}   /* (no shield: it steps out of the cut, it does not trade with it) */
        const was=P.hp,m0=boss.mode;advance(1,!!opts.draw);taken+=Math.max(0,was-P.hp);ledger(m0,Math.max(0,was-P.hp));if(P.dead)falls++;
        if(f%600===599)await yieldNow();continue;
      }
      /* THE GATE GARGOYLE (the Witchlight Stair's boss): the bot plays him as a player does - off the terrace by the nearest rune
         column and onto a slab at its top; on a slab, it leaves LATE when his shadow is on its slab (after he has dropped, so the aim
         is his and a cracked slab breaks under him), gets off a slab whose glyph is lit, guards the gust and the rubble (or rolls
         them), and cuts him wherever he is in reach - most of all hanging from a broken edge, from the slab he hangs on. */
      /* THE WINCHMASTER, ROUND TWO (Daniel's playtest, 2026-09-25): his housings have ladders now, so the hands play him the way the
         round-two fight is built - GO UP TO HIM AND FIGHT HIM. They work out which housing he is on (or swinging to), get to its
         ledge (down whatever ladder or rope they are near, across the spoil, up the rope to that ledge), climb its ladder and step
         onto the housing, and fight him there: in to their reach and cut; the brake bar shielded (or backed off, without a
         shield); the hook jumped as it comes; a ring on the floor from the roof stepped out of. When he retreats they chase. If a
         jam puts him down on a ledge they cut him there. They never tip a skip and never ride - the jam is the bonus, not the plan. */
      if(boss.t==='winchmaster'){
        k.left=k.right=k.up=k.down=k.jump=k.block=false;
        if(boss.open>0&&!wasOpen)opened++;wasOpen=boss.open>0;
        const O=OR.ARENA,TZ=16,HS=O.housings,m=boss.mode,spoilY=(O.spoil+1)*TZ,deckY=(O.deck+1)*TZ;
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
        if(busy){}
        else if((m==='downed'||m==='thrown')&&Math.abs(P.y-(boss.toY??boss.y))<30&&!P.climb){ /* THE BONUS WINDOW: he is down on a ledge beside you - cut */
          const lx=boss.toX??boss.x,dx=boss.x-P.x,side=Math.sign(lx-P.x)||1,d=Math.abs(lx-P.x);
          const ln0=on?BK.L.cableway.lines[on.line]:null;
          if(ln0&&ln0.jam>0)k[ln0.dir>0?'right':'left']=true;   /* out of the jammed skip onto the ledge: when he cuts loose he takes the cable, and the skip goes into the pit */
          else if(P.atk<0&&d>reach2-4)k[side>0?'right':'left']=true;
          if(Math.abs(dx)<reach2&&P.atk<0&&m==='downed'){P.face=Math.sign(dx)||1;BK.press('atk');swings++;} }
        else if(on){ /* RIDING (round three: the room's floor is the pit, so the lines are the way round) - answer him and stay on: in the
          MIDDLE of the skip (a rider on its trailing lip who jumps the bar comes down behind it), and off onto the ledge at the far end */
          const ln0=BK.L.cableway.lines[on.line],p0=ln0.pts,end=ln0.dir>0?p0[p0.length-1]:p0[0],cx=on.x+on.w/2;
          if(ln0.jam>0||Math.abs(end[0]-cx)<10)k[ln0.dir>0?'right':'left']=true; else if(Math.abs(cx-P.x)>5)k[cx>P.x?'right':'left']=true; }
        else if(onTop(tgt)){ /* UP WITH HIM: in to reach, and cut */
          const dx=boss.x-P.x,side=Math.sign(dx)||1;
          if(Math.abs(dx)>reach2-6)k[side>0?'right':'left']=true;
          if(Math.abs(dx)<reach2&&Math.abs(P.y-boss.y)<40&&P.atk<0&&m!=='letgo'&&m!=='swing'&&m!=='leap'){P.face=side;BK.press('atk');swings++;} }
        else if(P.climb){ /* ON A LADDER: to the row this housing is reached from, and off it there */
          const lx=Math.floor(P.x/TZ),row=y=>(y+1)*TZ;let want=null,off=0;
          if(lx===482){ if(tgt===1){want=null;k.up=true;} else if(tgt===2){want=row(8);off=1;} else {want=row(12);off=-1;} }
          else if(lx===509){ if(tgt===0)k.up=true; else k.down=true; }
          else if(lx===501){ if(tgt===2)k.up=true; else k.down=true; }
          else k.up=true;
          /* step off from a hair ABOVE the floor it leads to (letting go level with it drops you a few pixels short, into the pit) */
          if(want!==null){ if(P.y<=want-2&&P.y>want-10)k[off>0?'right':'left']=true; else if(P.y>want-2)k.up=true; else k.down=true; } }
        else if(P.ground){
          const L2=BK.L,lines=L2.cableway.lines,lo=lines.find(l=>l.id==='low'),hi=lines.find(l=>l.id==='high');
          const at2=(x0,x1,r)=>Math.abs(P.y-(r+1)*TZ)<3&&P.x>x0*TZ-6&&P.x<(x1+1)*TZ+6;
          const topAt=HS.findIndex((q,i)=>onTop(i)||(Math.abs(P.x-(q.ladder[0]*TZ+8))<6&&Math.abs(P.y-(q.top+1)*TZ)<3));
          /* onto a skip coming under the step at a lip (the ore-ride rule: look before you step) */
          const board=(ln,lip,dir)=>{ const li=lines.indexOf(ln),step=P.x+dir*14,stand=lip-dir*6;
            const skip=ln.dir*dir>0&&!(ln.jam>0)&&BK.movers().some(q=>q.kind==='bucket'&&q.line===li&&q.vis&&!(q.fallen>0)&&step>q.x+4&&step<q.x+q.w-4&&Math.abs(q.y-P.y)<6);
            if(skip)k[dir>0?'right':'left']=true;else go(stand); };
          const climb=x=>{const lx=x*TZ+8;if(Math.abs(lx-P.x)>3)go(lx);else k.up=true;};
          const onLad=[482,509,501].find(x=>Math.abs(P.x-(x*TZ+8))<7&&(BK.L.grid[Math.floor((P.y+2)/TZ)*BK.L.W+x]===T.NET||BK.L.grid[Math.floor((P.y-4)/TZ)*BK.L.W+x]===T.NET));
          const deck=at2(466,482,12);   /* (the Head Frame's ladder top at deck level is part of the deck: that is where the low line is boarded) */
          if(deck&&tgt===0)board(lo,483*TZ,1);
          else if(onLad!==undefined&&topAt<0){ /* STANDING ON A LADDER (its top, or a rung level with a floor): take hold the way it leads */
            if(onLad===482){ const w=tgt===1?-1:tgt===2?(9*TZ):(13*TZ); if(w<0)k.up=true; else if(P.y<=w&&P.y>w-10)k[tgt===2?'right':'left']=true; else if(P.y>w)k.up=true; else k.down=true; }
            else if((onLad===509&&tgt===0)||(onLad===501&&tgt===2))k.up=true; else k.down=true; }
          else if(topAt===tgt){ /* at the top of his ladder: step onto the housing */ const q=HS[tgt]; k[q.ladder[0]<q.x0?'right':'left']=true; }
          else if(topAt>=0){ /* up on a housing he has left: back down its ladder */ const lx=HS[topAt].ladder[0]*TZ+8; if(Math.abs(lx-P.x)>3)go(lx);else k.down=true; }
          else if(deck){ /* THE ENTRANCE DECK, for the Head Frame or the Tail Wheel: his ladder */ climb(482); }
          else if(at2(483,484,8)){ /* the Head Frame's ledge */ if(tgt===2)board(hi,485*TZ,1); else if(tgt===1)climb(482); else climb(482); }
          else if(at2(499,501,8)){ /* the Tail Wheel's ledge */ if(tgt===2)climb(501);
            else if(tgt===1)board(hi,499*TZ,-1);
            else board(hi,499*TZ,-1); /* for the Great Drum: the long way, and never through the spikes - back along the high line, down the Head Frame's ladder to the deck, and the low line in */ }
          else if(at2(507,509,12)){ /* the Great Drum's ledge */ if(tgt===0)climb(509); else if(lo.dir<0)board(lo,507*TZ,-1); else go(508*TZ); }   /* (the low line runs in only while he is on the Great Drum: wait for it to turn, do not step into the pit) */
          else if(at2(482,484,18)){ /* the pit's recovery ledge */ climb(482); }
          else go(482*TZ+8); }
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
        const dx=boss.x-P.x,side=Math.sign(dx)||1,reach=LAB_REACH[h]+boss.w/2;
        const rest=P.st<14||(P.labRest&&P.st<40);P.labRest=rest;
        const next=(from,avoid)=>slabs.filter(q=>q!==from&&q!==avoid).sort((a,b)=>Math.abs(cen(a)-cen(from))-Math.abs(cen(b)-cen(from)))[0];
        const goSlab=n=>{if(!n||!on)return;const dir=Math.sign(cen(n)-P.x)||1,edge=dir>0?on.x+on.w:on.x;k[dir>0?'right':'left']=true;if(P.ground&&Math.abs(edge-P.x)<14){BK.press('jump');P.labJump=16;}};
        const add=BK.enemies().filter(q=>q.alive&&q.fromGarg&&Math.abs(q.x-P.x)<LAB_REACH[h]+8&&Math.abs(q.y-P.y)<26)[0];
        if(P.flip){ /* under a slab: walk to its middle and cut what comes */ const s=P.flareSlab;if(s&&Math.abs(cen(s)-P.x)>6)k[cen(s)>P.x?'right':'left']=true; }
        else if(!on&&P.ground&&P.y>A.top+40){ /* THE TERRACE: to the nearest rune column */
          const v=BK.props().filter(q=>q.t==='vent'&&q.rune&&q.x>A.x0&&q.x<A.x1).sort((a,b)=>Math.abs(a.x-P.x)-Math.abs(b.x-P.x))[0];if(v&&Math.abs(v.x-P.x)>3)k[v.x>P.x?'right':'left']=true; }
        else if(!on){ /* in the air (a column, or a jump): over a slab, steer onto it */
          const s=slabs.filter(q=>q.y>P.y+2).sort((a,b)=>Math.abs(cen(a)-P.x)-Math.abs(cen(b)-P.x))[0];if(s&&(P.vy>-60||P.labJump>0)&&Math.abs(cen(s)-P.x)>4)k[cen(s)>P.x?'right':'left']=true; }
        else {
          let done=false;
          if(m==='diveTell'&&boss.tgt===on){const n=next(on),dir=n?Math.sign(cen(n)-P.x)||1:1,ex=dir>0?on.x+on.w-10:on.x+10;if(Math.abs(ex-P.x)>3)k[ex>P.x?'right':'left']=true;done=true;}   /* to the edge, and wait: the aim is his until he drops */
          else if(m==='dive'&&boss.tgt===on){goSlab(next(on));if(boss.y>on.y-44&&P.st>16&&!(P.dodge>0))BK.press('dodge');done=true;}   /* LATE: he has dropped - go, or roll under it */
          else if(m==='flareTell'&&boss.fm===on){goSlab(next(on));done=true;}
          else if(m==='hang'&&boss.nb){if(on!==boss.nb)goSlab(boss.nb);else{const ex=boss.hs>0?on.x+on.w-4:on.x+4;if(Math.abs(ex-P.x)>3)k[ex>P.x?'right':'left']=true;}}
          else if(m==='land'&&boss.onM&&boss.onM!==on&&!rest)goSlab(boss.onM);
          else if(!done){const tx=rest?cen(on):Math.max(on.x+6,Math.min(on.x+on.w-6,boss.x-side*Math.max(12,LAB_REACH[h]*.6)));if(Math.abs(tx-P.x)>4)k[tx>P.x?'right':'left']=true;}
          const gusting=(m==='gustTell'&&boss.modeT<0.25)||m==='gust',spitting=m==='spitTell'||m==='spit'||(boss.rubble||[]).some(b=>Math.abs(b.x-P.x)<60);
          if(!done&&(gusting||spitting)){if(SHIELDED(h)){k.block=true;k.left=k.right=false;P.face=side;}else if(P.st>20&&!(P.dodge>0)&&((m==='gustTell'&&boss.modeT<0.08)||(boss.rubble||[]).some(b=>Math.abs(b.x-P.x)<26)))BK.press('dodge');}
        }
        if(P.labJump>0){P.labJump--;k.jump=true;}
        if(!k.block&&P.atk<0){if(add){P.face=Math.sign(add.x-P.x)||1;BK.press('atk');swings++;}else if(!rest&&Math.abs(dx)<reach&&Math.abs(P.y-boss.y)<40&&m!=='diveTell'){P.face=side;BK.press('atk');swings++;}}
        const was=P.hp,m0=boss.mode;advance(1,!!opts.draw);taken+=Math.max(0,was-P.hp);ledger(m0,Math.max(0,was-P.hp));if(P.dead)falls++;
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
        if(mode==='slamTell'&&boss.modeT<.3&&P.ground){BK.press('jump');P.labJump=18;}
        if(P.labJump>0){P.labJump--;k.jump=true;}
        if(P.ground&&P.y<A.floor-20&&mode!=='slamTell'){k.down=true;BK.press('jump');}
        const guard=!eruption&&(mode==='cleaveTell'&&Math.abs(boss.x-P.x)<95||(boss.skulls||[]).some(q=>q.t>=0&&Math.abs(q.x-P.x)<70)||target.graveAdd&&target.mode==='grabTell'&&target.modeT<.22);
        if(guard&&SHIELDED(h)){k.block=true;gx=P.x;P.face=mode==='cleaveTell'?(Math.sign(boss.x-P.x)||1):side;}else if(guard){const gs=mode==='cleaveTell'?(Math.sign(boss.x-P.x)||1):side;gx=P.x-gs*65;if((mode==='cleaveTell'?boss:target).modeT<.2)BK.press('dodge');}
        if(Math.abs(gx-P.x)>5)k[gx>P.x?'right':'left']=true;
        if((h!=='paladin'||P.st>=44)&&!guard&&!eruption&&mode!=='sinkTell'&&!(mode==='slamTell'&&boss.modeT<.65)&&Math.abs(dx)<LAB_REACH[h]+target.w/2&&Math.abs(P.y-target.y)<32&&P.atk<0){P.face=side;BK.press('atk');swings++;}
        const was=P.hp,m0=mode;advance(1,!!opts.draw);taken+=Math.max(0,was-P.hp);ledger(m0,Math.max(0,was-P.hp));if(opts.onFrame)await opts.onFrame({boss,P,target,f,h});if(f%600===599)await yieldNow();continue;
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
        else if(guard&&boss.modeT<.24){k[side>0?'left':'right']=true;BK.press('dodge');gx=P.x;}
        if(Math.abs(gx-P.x)>5)k[gx>P.x?'right':'left']=true;
        if(!guard&&!incoming&&(cargo===false||cargo===undefined)&&Math.abs(dx)<LAB_REACH[h]+boss.w/2&&Math.abs(P.y-boss.y)<28&&P.atk<0){P.face=side;BK.press('atk');swings++;}
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
      const swarmT = swarm.length >= 2 && boss.mode !== 'winded' && boss.mode !== 'slamRest' ? swarm.sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0] : null;
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
      // THE ANSWER, on the beat. The paladin's aegis and the death knight's blood ward take a moment to come up, so they hold C from the start of the tell
      /* THE PALADIN'S WARD only breaks to his own sword met on the beat: the knight's guard in its last tenth of a second, the
         freebooter's tap just before it lands, the aegis raised in the last half second, the blood ward LET GO as it lands, a roll through for the
         pyromancer. The bash is rolled through as it arrives; the judgement is walked off its mark. */
      const KA = boss.t === 'kraken' && BK.krak ? BK.krak() : null, SA = boss.t === 'strawking' && BK.straw ? BK.straw() : null, MA = boss.t === 'archmage' && BK.mage ? BK.mage() : null;
      if (boss.t === 'closedhelm' && boss.mode && (/Tell$/.test(boss.mode) || boss.mode === 'bash')) { const m = boss.mode, t = boss.modeT; P.face = Math.sign(d) || P.face;
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
      // BAIT THE JAW, THEN CLOSE: clear the bite volume before returning to its recovery.
      else if (boss.t==='reefmaw') {
        let side=Math.sign(P.x-boss.x)||1;if(boss.x+side*116>A.x1-14||boss.x+side*116<A.x0+14)side=-side;
        if(['biteTell','bite','thrashTell','thrash'].includes(boss.mode)){
          goal=boss.mode==='bite'&&P.y<boss.y-65?boss.x+side*40:boss.x+side*116;strike=false;k.block=false;
          if(P.ground||P.swim){BK.press('jump');P.labJump=24;}if(P.swim)k.up=true;
        }else if(['stuck','reel','recoil'].includes(boss.mode)){goal=boss.x;strike=true;}
        else {goal=boss.x;strike=true;}
      }
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
          else if (add) { P.face = Math.sign(add.x - P.x) || P.face; goal = Math.abs(add.x - P.x) > LAB_REACH[h] ? add.x - P.face * (LAB_REACH[h] - 4) : null; if (Math.abs(add.x - P.x) <= LAB_REACH[h] + 6 && P.atk < 0) { BK.press('atk'); swings++; } }
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
      /* THE GOBLIN QUEEN, played as her hall teaches it now: she walks to within 56 px of you, so stand that far past a hanging chandelier
         and she comes to stand under it; then step in, JUMP and cut the chain (a real jump and a real swing: nothing is dropped for the bot) */
      else if (boss.t === 'gqueen') { const cs = BK.props().filter(p => p.t === 'weight' && p.gq && p.state === 'hang');
        /* THE BAIT (docs/briefs/queen-pillars.md). She charges a hero more than 100 px off, and a pillar in the way comes down on her: so go and
           stand PAST the nearest standing pillar, on the side away from her and far enough off, and wait. A spot the bot would have to cross her
           to reach costs more than any other. Her charge is ridden out by standing still (it stops at the pillar); if she is coming and nothing
           is between, it is jumped. Nothing is broken for the bot: the pillar falls because she ran into it. */
        const ps = BK.props().filter(p => p.t === 'qpillar' && !p.broken), AX0 = A.x0 + 24, fr = Math.floor(A.floor / 16) - 1;
        let fx = Math.floor(A.x0 / 16); while (fx < Math.floor(A.x1 / 16) && L.grid[fr * L.W + fx + 1] !== T.SOLID) fx++; const AX1 = Math.min(A.x1 - 24, (fx + 1) * 16 - 10);   /* the hall floor ends at her dais: bait on the floor, not up its step */
        let bait = null, bc = 1e9; for (const p of ps) { const side = Math.sign(p.x - boss.x) || 1, gx = Math.max(AX0, Math.min(AX1, p.x + side * Math.max(30, 118 - Math.abs(p.x - boss.x))));
          if ((gx - boss.x) * side <= 104 || (p.x - boss.x) * side <= 8) continue; const cost = Math.abs(gx - P.x) + (Math.sign(P.x - boss.x) !== side ? 400 : 0); if (cost < bc) { bc = cost; bait = gx; } }
        const coming = boss.mode === 'charge' && (P.x - boss.x) * boss.face > 0 && Math.abs(P.x - boss.x) < 70 && !ps.some(p => (p.x - boss.x) * boss.face > 0 && (P.x - p.x) * boss.face > 0);
        /* HER DECREE runs along the floor both ways, three beats: a wave coming at the hands is jumped (it only takes a hero standing on the floor) */
        const wave = !OPEN(boss, BK) && BK.waves().some(w => w.royal && w.life > 0 && Math.abs(w.x - P.x) < 34 && (P.x - w.x) * w.dir > 0 && P.y > w.y - 4);
        if ((coming || wave) && P.ground) { BK.press('jump'); P.labJump = coming ? 18 : 12; goal = null; strike = false; }
        else if (P.labCut > 0) { P.labCut--; k.jump = true; if (P.labCut === 6 && P.atk < 0) { BK.press('atk'); swings++; } goal = null; }
        else { const under = cs.find(c => Math.abs(c.x - boss.x) < boss.w / 2 + 6 && Math.abs(c.x - P.x) < 28);
          if (under) { strike = false; goal = null; if (P.ground) { P.face = Math.sign(under.x - P.x) || P.face; BK.press('jump'); P.labCut = 16; } }
          else if (bait !== null) { goal = bait; strike = false; if (Math.abs(bait - P.x) < 6) { goal = null; P.face = Math.sign(boss.x - P.x) || P.face; } }
          /* wait just on HER side of the nearest one: she stops 56 px short of you, which is right under it */
          else { const c = cs.sort((a, b) => Math.abs(a.x - boss.x) - Math.abs(b.x - boss.x))[0]; goal = c ? c.x - (Math.sign(boss.x - c.x) || 1) * 22 : boss.x - Math.sign(d || 1) * 70; strike = false; } } }
      else { goal = boss.x; strike = true; }
      /* THE OWL'S DEAD BOUGHS: when the Reeve is low under one the bot cuts its peg, as a player standing at it would, and it hops the skim */
      if (boss.t === 'owl') {
        const down=['grounded','crash','pinned','stuckTalons'].includes(boss.mode);
        if(!down){strike=false;const lamps=BK.props().filter(p=>p.owl&&!p.perch);const lamp=lamps.sort((a,b)=>Math.abs(a.x-P.x)-Math.abs(b.x-P.x))[0];if(lamp){goal=lamp.x;if(!lamp.lit&&Math.abs(P.x-lamp.x)<22&&P.atk<0){k.block=false;P.face=Math.sign(lamp.x-P.x)||1;BK.press('atk');swings++;}}}
        if (boss.mode === 'skim' && Math.abs(boss.x-P.x)<64 && (boss.x-P.x)*boss.vx<0 && P.ground){k.jump=true;BK.press('jump');}
      }
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
      /* (2026-09-25, the Goblin Queen: Daniel, "FIX THE BOT, not the Queen"). A SHELF IS SOMETHING YOU STAND ON. This fired for her on the hands' own hops as well:
         measured on the pillar build, 700-1700 frames a fight were cancelled strikes in the air over her, and half of them (288-843) while she was PINNED -
         the window the whole fight is for. She is 52 px tall, so a hop does reach her. For her it asks for the ground now; for the others it is as it was. */
      if(!walker&&!P.swim&&boss.y>P.y+24&&(boss.t!=='gqueen'||P.ground)&&['chief','frog','king','ram','windcaller','gqueen','closedhelm','prince','strawking'].includes(boss.t)){const gx=lowerFooting(BK,boss,T);k.left=P.x>gx+3;k.right=P.x<gx-3;k.block=false;strike=false;}
      const descending=!P.swim&&boss.y>P.y+24&&(boss.t==='lance'&&!bowT||boss.t==='reefmaw'&&strike&&(P.ground||P.vy>=0));
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
      if (!mixedHeavy && !cutGo && strike && ad <= reach && P.atk < 0 && !k.block) { P.face = Math.sign(d) || P.face; if (d > 0) k.left = false; else if (d < 0) k.right = false; BK.press('atk'); swings++; }
      if (opts.samples && f % 45 === 0) { out.samples = out.samples || []; out.samples.push([h, Math.round(f / 60), boss.mode, Math.round(d), Math.round(boss.y - P.y), k.block ? 'B' : '-', goal === null ? '·' : Math.round(goal - P.x), P.hurt > 0 ? 'hurt' : '', P.ground ? 'g' : 'air'].join(' ')); }
      if (f % 30 === 0 && boss.y < P.y - 12 && strike && ad < reach + 20) { BK.press('jump'); if(boss.t==='herald')P.labJump=18; }   /* a boss standing a tile up (the roc in the glass) is cut from a hop */
      /* THE LAST CHARGE, spent as a player spends it: at the boss while he is in front of the knight, open, and not winding up or rushing him */
      if (h === 'knight' && open && !tell && !rushing && !k.block && LAST_CHARGE(P, ad, boss.y - P.y)) { P.face = Math.sign(d) || P.face; k.left = false; k.right = false; k.jump = false; k.block = true; }
      // A BANKED PYRE IS FOR SPENDING: release the full heat meter toward a clear target between committed swings.
      if (h==='pyro' && P.full && !tell && !rushing && ad<140 && Math.abs(boss.y-P.y)<30 && !P.plunge && !P.cWas && P.atk<0) { P.face=Math.sign(d)||P.face; k.block=true; }
      const was = P.hp, m0 = boss.mode; advance(1,!!opts.draw); if (P.hp < was && !P.dead) taken += Math.min(60, was - P.hp); ledger(m0, P.dead ? 0 : was - P.hp);
      if (boss.t === 'lance') for (const q of BK.enemies()) if (q.lanceBow) bowSeen.add(q);
      if (h === 'reaper') { if (/Tell$/.test(m0 || '') && boss.mode !== m0) { dkEndF = f; dkEndM = m0; }
        /* the ward took something: learn how late that tell's blow came, and let go now - the nova */
        if ((P.wardG || 0) > dkG + 0.5 && !(P.parryT > 0)) { if (dkEndM && f - dkEndF <= dkF(0.8)) dkLag[dkEndM] = Math.min(dkLag[dkEndM] ?? 9, (f - dkEndF) * (BK.SET.speed || 1) / 60); dkHold = 0; }
        dkG = P.wardG || 0; }
      if (opts.onFrame) await opts.onFrame({ boss, P, f, h, lvl: lvId, open });   /* THE CAMERA HOOK (opts.draw renders each frame; opts.onFrame may take it) */   /* a fall into a pit is a death and a respawn, not a blow: it is counted as falls, not as damage */
      if (P.dead) falls++;
      if (f % 600 === 599) await yieldNow();
    }
    k.left = false; k.right = false; k.block = false; smallEnd();
    const secs = f * (BK.SET.speed || 1) / 60;
    rows.push({ lvl: lvId, boss: boss.t, h, killed: !boss.alive, secs: +secs.toFixed(1), bossHp: hp0, hpLeftPct: boss.alive ? Math.round(100 * boss.hp / hp0) : 0,
      health: {...health,endHp:Math.max(0,P.hp),died:!!P.dead}, outcome: !boss.alive ? (P.dead?'trade':'win') : P.dead&&normalHealth?'death':'timeout',
      takenPerMin: Math.round(taken / Math.max(1 / 60, secs) * 60), heroHp: P.maxHp, swings, smallSwings, smallMissed, opened, damage: boss.damageLedger || {plunge:0,other:0}, ripostes: boss.ripostes || 0, wallOpens: boss.wallOpens || 0, falls, returns: BK.stats().parries - par0, ...(opts.modes ? { modes: modeN, hitBy } : {}), ...(boss.t === 'lance' ? { archers: bowSeen.size, archersCut: [...bowSeen].filter(q => q.hp <= 0).length } : {}) });
    await yieldNow();
    } finally { Math.random = realRandom; }
  }
  out.done = true; out.ms = Date.now() - out.started;
  return out;
}

// THE COLLECTION LAB. Can every silver, key, relic and quest item actually be PICKED UP? Walking the whole level to each
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
      ...BK.props().filter(p => (p.t === 'stray' || p.t === 'relic' || p.t === 'key') && !p.got).map(p => ({ kind: p.t === 'stray' ? 'quest:' + (p.kind || '') : p.t, ref: p, x: p.x, y: p.y }))];
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

