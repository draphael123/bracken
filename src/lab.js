// src/lab.js — THE FIGHT LAB and THE BOSS LAB.
// The playtest bot walks levels. These FIGHT, and measure what a player feels: how long a foe or a boss takes to
// kill, and how much of your health it costs. Both yield between fights, so a page can be polled while they run.
//   await BK.fightLab({ levels: ['wood', 'spire', 'waymeet'], heroes: [...], foes: [...], reps: 2 })   -> window.__lab
//   await BK.bossLab({ bosses: ['wood', 'kings', ...], heroes: [...] })                                -> window.__bossLab
import { MARK } from './marks.js';   /* THE MARK TABLE: every red !! in it is a tell the bot steps out of, never guards */

// each hero's real reach (attackBox in main.js), so the bot swings from where the blow actually lands
export const LAB_REACH = { knight: 22, pyro: 30, paladin: 24, pirate: 20, reaper: 29, warden: 40 };   /* her point lands at 44: the bot stands just inside it, where the TIP zone is */
export const LAB_FOES = ['sprig', 'shield', 'swornsword', 'archer', 'hedgeknight', 'cutlass', 'harpy', 'crab', 'tideguard', 'scout'];
const HEROES = ['knight', 'warden', 'pyro', 'paladin', 'pirate', 'reaper'];
/* THE CO-OP ALLY IS THIS BOT. main.js imports threatOf, SHIELDED and HARD_TELLS below and plays a hero
   with them, so the ally and the labs answer a wind-up by ONE set of rules. When two files answer the same question
   one of them is wrong and nobody knows which - so there is one, and it lives here with the bot that earned it. */
export const threatOf = e => e.alive && ((e.mode && /Tell|tell|wind|aim|draw|charge|lunge|raise/.test(e.mode)) || e.draw > 0 || e.liftT > 0);
const yieldNow = () => new Promise(r => setTimeout(r, 0));
export const SHIELDED = h => h === 'knight' || h === 'paladin' || h === 'reaper';   // C holds a guard; the others roll
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
export const LAST_CHARGE = (P, ad, dy) => (P.resolve || 0) >= 100 && P.ground && !P.cWas && !(P.lcBrace > 0) && !(P.lcLeft > 0) && ad < 140 && Math.abs(dy) < 24;

/* THE KEY VERB. The family table in main.js (FAMILY, read through BK.keyOf) says what each common body wants: the right tool lands half
   as hard again and the wrong one GLANCES. A bot that only cut and blocked was left chipping at plate and bouncing off shields - and it
   is the co-op ally - so it asks the table, one verb per body, the plainest one each hero has:
     guard  - the DASH ATTACK from outside its reach: the table's head-on answer, it throws the guard OFF BALANCE and every cut after is open;
              already inside its reach (or the dash still cooling), the LOW SWEEP under it; the held HEAVY while it cannot be tripped again
     plate, shell, beast - the held HEAVY
     small  - the LOW SWEEP          wing - the RISING CUT          shooter, crew - the DASH ATTACK, from just outside reach
   and whatever is OPEN (tripped, broken, reeling) takes the plain cut, which is quickest. Per hero: the freebooter's heavy is his pistol, so
   loaded he shoots anything that is not small and empty he comes down on plate; his and the death knight's heavies go over the low mimic, so
   they plunge it; the warden's rise goes over the haunt, so she cuts wings plain; under water there is no sweep and no dash, only the cut. */
export function keyVerb(BK, h, e) {
  const P = BK.P, K = BK.keyOf ? BK.keyOf(e) : null;
  if (P.charge > 0 || P.atkHeld > 0) return 'heavy';   /* a blow being wound is finished, not dropped for another */
  if (!K || K.open) return 'light';
  const f = K.family, swim = !!P.swim;
  if (h === 'pirate' && P.loaded && f !== 'small' && e.t !== 'mimic') return 'heavy';
  if ((h === 'pirate' || h === 'reaper') && e.t === 'mimic') return swim ? 'light' : 'plunge';
  if (f === 'guard') { const ad = Math.abs(e.x - P.x), reach = LAB_REACH[h] + (e.w || 12) / 2;
    if (!swim && (P.dash > 0 || P.dashAtk > 0 || (ad > reach + 4 && !(P.dashCd > 0)))) return 'dash';   /* (and a dash under way is seen through) */
    return K.tripped || swim ? 'heavy' : 'sweep'; }
  if (f === 'plate') return h === 'pirate' ? (swim ? 'light' : 'plunge') : 'heavy';
  if (f === 'shell' || f === 'beast') return 'heavy';
  if (f === 'small') return swim ? 'light' : 'sweep';
  if (f === 'wing') return h === 'warden' ? 'light' : 'rise';
  if (f === 'shooter' || f === 'crew') return swim ? 'light' : 'dash';
  return 'light';
}
/* WHERE EACH VERB WANTS TO STAND, in pixels from the foe: inside reach for a cut (and a dash, which is taken on the way in), a step out for the knight's charge and for the warden's lunge (it drives her a tile on, and must end with the point on it), well out of its reach for the freebooter's pistol (it carries 150 px), on top of it for a plunge */
export const wantOf = (h, e, verb) => { const reach = LAB_REACH[h] + (e.w || 12) / 2; return verb === 'plunge' ? 0 : verb === 'heavy' ? (h === 'knight' ? reach + 6 : h === 'warden' ? reach + 12 : h === 'pirate' ? reach + 36 : reach - 4) : reach - 2; };
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
    if (winding || (free && !P.heavy && ad < want + 4 && level && (P.ground || P.swim) && P.st >= (BK.heavyCost ? BK.heavyCost() : 26) + 2)) { k.atk = true; if (!winding) swing = 1; }
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
function labBotFrame(BK, h, e, f) {
  const P = BK.P, k = BK.keys; let defend = 0, swing = 0;
  const d = e.x - P.x, ad = Math.abs(d); if (!(P.dash > 0) && !(P.rush > 0)) P.face = Math.sign(d) || P.face;
  const threat = threatOf(e) && !HELD(e) && ad < 70 && Math.abs(e.y - P.y) < 50;
  k.left = false; k.right = false; k.block = false; k.atk = false; k.up = false; k.down = false; k.jump = false;
  if (h === 'reaper') { k.throw = P.harvest >= 100; if (k.throw && !(P.fHeld > 0)) BK.press('throw'); }   /* HOLD F on a full bar: the surge */
  if (threat && P.atk < 0 && !(P.dash > 0)) {
    defend = 1;   /* (a heavy half wound goes if it can, and is dropped if it cannot) */
    if (h === 'pyro') { if (f % 20 === 0) { k[d > 0 ? 'left' : 'right'] = true; BK.press('dodge'); } }
    else if (h === 'pirate') { if (f % 12 === 0) k.block = true; }
    else if (h === 'warden') { if (HARD_TELLS.has(e.t + '|' + e.mode)) { if (f % 14 === 0) BK.press('dodge'); } else k.block = ON_THE_BEAT(e) && DEFLECT_TAP(f); }   /* sweep at a yellow blow, step back off a red one */
    else k.block = true;
  } else {
    const s = strike(BK, h, e, f); swing = s.swing;
    /* THE WARDEN KEEPS HER POINT OUT: inside the haft she only shoves, so she steps back out of it (her step goes backward by itself) */
    if (h === 'warden' && ad < 20 && P.atk < 0 && !(P.charge > 0) && !(P.dodge > 0) && P.st >= 20 && f % 10 === 0) BK.press('dodge');
    if (!k.left && !k.right && !(P.charge > 0)) { if (ad > s.want + 2) k[d > 0 ? 'right' : 'left'] = true; else if (s.verb === 'plunge' && !P.ground && ad > 3) k[d > 0 ? 'right' : 'left'] = true; }
  }
  { const fire = fireAt(BK, P.x, P.y); if (fire && !(h === 'pyro')) { const away = Math.sign(P.x - fire.x) || -Math.sign(d) || 1; k.left = away < 0; k.right = away > 0; k.atk = false; k.block = false; } }   /* (her own fire does not burn her) */
  if (h === 'knight' && !threat && !k.atk && !(P.charge > 0) && LAST_CHARGE(P, ad, e.y - P.y)) { k.left = false; k.right = false; k.block = true; }
  return { defend, swing };
}

// THE AMBUSH LAB. Each hero into each level's ambush room, played straight: walk in, fight whatever of the room is nearest (its
// elite when nothing else is closer), defend on its tells. The hero's health is put back each frame and what the room took is
// counted. It reports how long the room took to open (section Q rule 4: 20 to 40 seconds), how long its elite stood, and
// whether it opened at all (a wave that runs 70 seconds slinks off, and that is not a clear).
//   await BK.ambushLab({ levels: ['stockade'], heroes: [...], reps: 1 })   -> window.__ambushLab
export async function ambushLab(BK, opts = {}) {
  const lvm = await import('./level.js');
  const heroes = opts.heroes || HEROES, levels = opts.levels || ['stockade'], reps = opts.reps || 1, maxF = (opts.maxSecs || 150) * 60;
  const rows = [], out = { rows, started: Date.now() };
  if (typeof window !== 'undefined') window.__ambushLab = out;
  for (const lvId of levels) for (const h of heroes) for (let rep = 0; rep < reps; rep++) {
    BK.setHero(h); BK.load(lvm.LEVELS.findIndex(l => l.id === lvId)); BK.state = 'play'; BK.god = false; BK.sim(20);
    const A = BK.ambushes()[opts.room || 0]; if (!A) { rows.push({ lvl: lvId, h, skipped: 'no ambush room' }); continue; }
    const P = BK.P, k = BK.keys, x0 = A.trigger !== undefined ? A.trigger : A.wallL + 3, mid = (A.wallL + A.wallR) / 2 * 16 + 8;
    for (const e of BK.enemies()) if (Math.abs(e.x - mid) < (A.wallR - A.wallL + 30) * 8 && !e.maxHp) e.alive = false;   /* the level's own creatures by the door are not the room's */
    BK.tp(x0 + 1, A.row); P.hp = P.maxHp; P.st = P.maxSt; P.inv = 0;
    let f = 0, taken = 0, last = P.hp, elite = null, eliteSecs = null, eliteFrom = null, shutAt = null, waveAt = 0, slow = null;
    const spd = BK.SET.speed || 1;
    for (; f < maxF && A.st !== 'done'; f++) {
      if (P.hp < last) taken += Math.min(60, last - P.hp); P.hp = P.maxHp; last = P.hp; if (P.dead) break;
      if (A.st && shutAt === null) shutAt = f;
      const foes = (A.foes || []).filter(e => e.alive);
      if (A.st !== 'fight') waveAt = f;
      else if (!slow && (f - waveAt) * spd / 60 > 40) slow = 'wave ' + (A.wave + 1) + ' still up at 40 s: ' + foes.map(e => e.t + (e.elite ? '*' : '')).join(', ');   /* what a room that runs long is waiting on */
      if (!elite) { elite = foes.find(e => e.elite) || null; if (elite) eliteFrom = f; }
      if (elite && eliteSecs === null && !elite.alive) eliteSecs = +((f - eliteFrom) * spd / 60).toFixed(1);
      const e = A.st === 'fight' && foes.length ? foes.reduce((b, q) => Math.abs(q.x - P.x) + Math.abs(q.y - P.y) < Math.abs(b.x - P.x) + Math.abs(b.y - P.y) ? q : b) : null;
      if (e) labBotFrame(BK, h, e, f);
      else { k.block = false; k.left = P.x > mid + 20; k.right = P.x < mid - 20; }   /* between waves: to the middle of the room */
      /* A PLAYER JUMPS THE ROOM'S OWN PIT. The fight lab's bot fights on a flat floor and walked straight into THE CLIFF HALL's
         spikes after a sprig, and sat in them: it hops a gap or a spike a tile ahead of it, and hops out of one it is in */
      { const dir = k.right ? 1 : k.left ? -1 : 0, G = BK.L, at = (tx, ty) => G.grid[ty * G.W + tx], ty = Math.floor((P.y + 2) / 16);
        const bad = tx => at(tx, ty) === lvm.T.AIR || at(tx, ty) === lvm.T.SPIKE || at(tx, ty - 1) === lvm.T.SPIKE;
        const inPit = [-5, 0, 5].some(ox => at(Math.floor((P.x + ox) / 16), Math.floor((P.y - 4) / 16)) === lvm.T.SPIKE || at(Math.floor((P.x + ox) / 16), Math.floor((P.y + 2) / 16)) === lvm.T.SPIKE);
        if (inPit) { const out = at(Math.floor((P.x - 24) / 16), ty - 1) === lvm.T.SOLID ? 1 : -1; k.left = out < 0; k.right = out > 0; k.block = false; k.jump = true; if (f % 6 === 0) BK.press('jump'); }
        else if (dir && P.ground && bad(Math.floor((P.x + dir * 12) / 16))) { k.jump = true; BK.press('jump'); } else k.jump = false; }
      BK.sim(1);
    }
    k.left = false; k.right = false; k.block = false; k.jump = false;
    if (elite && eliteSecs === null && !elite.alive) eliteSecs = +((f - eliteFrom) * spd / 60).toFixed(1);
    const secs = shutAt === null ? null : +((f - shutAt) * spd / 60).toFixed(1);
    rows.push({ lvl: lvId, room: A.name, h, opened: A.st === 'done', secs, leader: elite ? elite.t : null, eliteSecs, taken: Math.round(taken), takenPct: +(100 * taken / P.maxHp).toFixed(0), slow });
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
      BK.setHero(h); BK.load(lvm.LEVELS.findIndex(l => l.id === lvId)); BK.state = 'play'; BK.god = false;
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
//   the gallery queen - strike the pillar holding up the stretch of gallery she stands under, then cut her while she is pinned
//   the roc           - stand on the glass so her dive sticks in it, then cut her while she is down
//   the buried prince - in the dark, light a lamp; with him under a timber set, cut its post; off the red mark when he is under the floor
// Every other boss is cut whenever it is in reach. All of them are defended against on their tells. The hero's health is
// put back each frame and what the boss took is counted: how long it lasts, and the damage per minute it takes to see it out.
/* AND THE ONES WHOSE GATE LIVES IN main.js ASK IT (BK.bossOpen): the Queen's Lance turns every blade until he is
   committed, so a bot that treated him as open swung at his plate for the whole fight. */
const OPEN = (b, BK) => { const g = BK && BK.bossOpen ? BK.bossOpen(b) : null; return g === null || g === undefined ? OPEN0(b) : g; };
const OPEN0 = b => b.t === 'ploughman' ? b.open > 0 : b.t === 'master' ? b.open > 0 : b.t === 'troll' && b.hill ? b.mode === 'pinned' : b.t === 'closedhelm' ? b.open > 0 : b.t === 'king' ? (b.mode === 'held' || b.open > 0) : b.t === 'gqueen' ? (b.mode === 'pinned' || b.mode === 'topple') : b.t === 'roc' ? (b.mode === 'stuck' || b.mode === 'skid' || b.mode === 'downed') : true;
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
  const lvm = await import('./level.js'), T = lvm.T, TS = 16, PT = await import('./playtest.js');
  const heroes = opts.heroes || HEROES;
  const bosses = opts.bosses || ['wood', 'kings', 'spire', 'crown', 'reef', 'flotilla', 'hurricane', 'deep', 'waymeet', 'undercrown'], maxSecs = opts.maxSecs || 120;
  const rows = [], out = { rows, started: Date.now(), progress: 0, total: bosses.length * heroes.length };
  if (typeof window !== 'undefined') window.__bossLab = out;
  for (const lvId of bosses) for (const h of heroes) {
    BK.setHero(h); BK.load(lvm.LEVELS.findIndex(l => l.id === lvId)); BK.state = 'play'; BK.god = false; BK.sim(10);
    /* A FRESH HERO EACH ROW. The last swing of the row before used to arrive with him - a heavy swing still going roots the
       paladin for a second on whatever he is dropped on, and at the Roc's door that is the glass over the shaft */
    BK.reset();
    /* A LEVEL'S MINI, fought the same way: opts.mini puts the bot in L.mini's room against L.mini's boss, not the arena's */
    const L = BK.L, A = opts.mini ? L.mini : L.arena; out.progress++;
    if (!A) { rows.push({ lvl: lvId, h, skipped: opts.mini ? 'no mini' : 'no arena' }); continue; }
    /* A MINI IS THE ONE MARKED mini: the Weaver's level has small spiders, the Boatswain's ship has bosuns, the Overman's tomb has propmen - the first of the kind found was one of those */
    const boss = (opts.mini && BK.enemies().find(e => e.t === A.boss && e.alive && e.mini)) || BK.enemies().find(e => e.t === A.boss && e.alive);
    if (!boss) { rows.push({ lvl: lvId, h, skipped: 'no boss' }); continue; }
    for (const e of BK.enemies()) if (e !== boss && !e.maxHp) e.alive = false;
    BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); BK.sim(30);
    /* THE QUARTERMASTER GOES UP HER SHIP: the playtest walker knows ropes, steps and ledges, so it follows her deck to deck */
    const walker = boss.t === 'quarter' ? PT.makeBot(BK) : null;
    const P = BK.P, k = BK.keys, hp0 = boss.hp, maxF = Math.round(maxSecs * 60 / (BK.SET.speed || 1));
    // the old roof boards in the roc's nest, once: her dive sticks in them
    const glass = []; if (boss.t === 'roc') for (const [x0, x1] of ((L.monk && L.monk.boards) || [])) for (let x = x0; x <= x1; x++) glass.push(x * TS + 8);
    /* nearest the middle of the room first; the bot moves between three of them so it is always standing on one when she comes down */
    { const mid = (A.x0 + A.x1) / 2; glass.sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid)); }
    /* THE MODE LEDGER (opts.modes): how often the boss ENTERED each mode, and how much of the hero's health was lost while it was in each - which attacks fired at all, and which ones did the damage */
    const modeN = {}, hitBy = {}; let lastMode = null;
    const ledger = (m0, lost) => { if (!opts.modes) return; if (boss.mode !== lastMode) { lastMode = boss.mode; modeN[lastMode] = (modeN[lastMode] || 0) + 1; } if (lost > 0) hitBy[m0] = (hitBy[m0] || 0) + lost; };
    let f = 0, taken = 0, swings = 0, opened = 0, wasOpen = false, falls = 0, holdC = 0;
    /* THE DEATH KNIGHT'S WARD, played like a man: C held through a tell, and let go when the ward has stopped the blow (the nova) - or,
       once he has SEEN how late a tell's blow lands after its windup ends (dkLag), let go just before it lands, with a reaction
       time behind it, so it is RETURNED. One release in ten is early. dkHold keeps the ward up a little past the end of a tell. */
    const dkLag = {}, dkF = s => Math.round(s * 60 / (BK.SET.speed || 1)), par0 = BK.stats().parries; let dkHold = 0, dkRel = { mode: null, t0: 0, at: -9 }, dkG = 0, dkEndF = -99, dkEndM = null;   /* the paladin's aegis is HELD: a tap of C is a mend that roots her, so the guard is kept up through the tell */
    for (; f < maxF && boss.alive; f++) {
      P.hp = P.maxHp; P.dead = 0; P.st = Math.max(P.st, 40);
      /* THE DEEP: THE KING SWIMS. No stone - a stone is a man standing on the floor, and he is not there. The bot swims at him, up
         and down as well as along; it leaves a marked charge by going across its line and a marked fall by going aside, keeps a
         shield up for what a shield turns, and cuts him whenever he is in reach. */
      if (lvId === 'deep') { if (P.ballast) { P.ballast.held = false; P.ballast = null; }
        k.left = k.right = k.up = k.down = k.jump = k.block = false;
        const by = boss.y - 16, dx = boss.x - P.x, dy = by - (P.y - 10), adx = Math.abs(dx), reach2 = LAB_REACH[h] + (boss.w || 20) / 2;
        if (OPEN(boss, BK) && boss.open > 0 && !wasOpen) opened++; wasOpen = boss.open > 0;
        if (boss.mode === 'ramTell' || (boss.mode === 'ram' && Math.hypot(dx, dy) < 120)) { const nx = -(boss.rdy || 0), ny = boss.rdx || 1, s = ((P.x - boss.x) * nx + ((P.y - 10) - by) * ny) >= 0 ? 1 : -1;
          if (Math.abs(nx) > 0.35) k[nx * s > 0 ? 'right' : 'left'] = true; k[ny * s > 0 ? 'down' : 'up'] = true; }
        else if (boss.mode === 'diveTell' || boss.mode === 'dive') k[P.x < (boss.dcol !== undefined ? boss.dcol : boss.x) ? 'left' : 'right'] = true;
        /* THE MAELSTROM: away from him at a full stroke, and a dash out of the current the moment it is turning */
        else if (boss.mode === 'whirlTell' || boss.mode === 'whirl') { k[dx > 0 ? 'left' : 'right'] = true; k[dy > 0 ? 'up' : 'down'] = true;
          if (boss.mode === 'whirl' && f % 18 === 0) BK.press('dodge'); }
        /* AND IT BREATHES. Under two and a half seconds of breath it goes to the nearest air he has not burst (and is not about to), and
           stays in it until the breath is back: a swimmer who fights him without breathing is a swimmer who drowns in the lab and not in play */
        else if ((boss.airs || []).length && ((P.breath ?? 6) < 3 || (P.labAir && (P.breath ?? 6) < (P.relic === 'tidecharm' ? 12 : P.relic === 'diverlamp' ? 9 : 6) - 0.3))) {
          const live = boss.airs.filter(s => !(s.o.goneUntil > BK.time) && !(s.o.shiverUntil > BK.time));
          const src = live.sort((a, b) => Math.hypot(a.x - P.x, a.ty - P.y) - Math.hypot(b.x - P.x, b.ty - P.y))[0];
          if (src) { P.labAir = true; const gx = Math.max(src.l + 8, Math.min(src.r - 8, P.x)), gy = src.ty;
            if (Math.abs(gx - P.x) > 4) k[gx > P.x ? 'right' : 'left'] = true; if (gy < P.y - 4) k.up = true; else if (gy > P.y + 4) k.down = true;
            if (adx <= reach2 && Math.abs(dy) < 22 && P.atk < 0 && f % 3 === 0) { P.face = Math.sign(dx) || P.face; k.down = k.up = false; BK.press('atk'); swings++; } }
          else P.labAir = false; }
        else { P.labAir = false; if (adx > Math.max(10, LAB_REACH[h] * 0.6)) k[dx > 0 ? 'right' : 'left'] = true; if (dy < -10) k.up = true; else if (dy > 10) k.down = true;
          if (SHIELDED(h) && /Tell$/.test(boss.mode || '') && !HARD_TELLS.has(boss.t + '|' + boss.mode) && Math.hypot(dx, dy) < 120 && (h === 'paladin' || h === 'reaper' || boss.modeT < 0.2)) { k.block = true; k.left = k.right = k.up = k.down = false; P.face = Math.sign(dx) || P.face; }
          else if (adx <= reach2 && Math.abs(dy) < 22 && P.atk < 0) { P.face = Math.sign(dx) || P.face; k.down = k.up = false; BK.press('atk'); swings++; } }   /* a cut, not a plunge: down held under the swing is a down attack, and the lab was plunging him to death */
        if (opts.samples && f % 45 === 0) { out.samples = out.samples || []; out.samples.push([h, Math.round(f / 60), boss.mode, Math.round(dx), Math.round(dy), boss.open > 0 ? 'OPEN' : '', P.swim ? 'swim' : 'dry'].join(' ')); }
        const was = P.hp, m0 = boss.mode; BK[opts.draw ? 'step' : 'sim'](1); if (P.hp < was && !P.dead) taken += Math.min(60, was - P.hp); ledger(m0, P.dead ? 0 : was - P.hp); if (P.dead) falls++;
        if (opts.onFrame) await opts.onFrame({ boss, P, f, h, lvl: lvId, open: boss.open > 0 });   /* THE CAMERA HOOK: with opts.draw the frame was rendered, and a recorder can take it */
        if (f % 600 === 599) await yieldNow();
        continue; }
      const d = boss.x - P.x, ad = Math.abs(d), reach = LAB_REACH[h] + (boss.w || 20) / 2, open = OPEN(boss, BK);
      if (open && !wasOpen) { opened++; if (opts.trace) { out.trace = out.trace || []; out.trace.push({ h, mode: boss.mode, startD: Math.round(ad), dy: Math.round(boss.y - P.y), minD: 9999, pressed: 0, swung: 0, hpAt: boss.hp }); } }
      if (!open && wasOpen && opts.trace && out.trace && out.trace.length) { const tw = out.trace[out.trace.length - 1]; tw.lost = tw.hpAt - boss.hp; }
      if (open && opts.trace && out.trace && out.trace.length) { const tw = out.trace[out.trace.length - 1]; tw.minD = Math.min(tw.minD, Math.round(ad)); if (P.atk >= 0) tw.swung++; }
      wasOpen = open;
      k.left = false; k.right = false; k.block = false; k.up = false; k.down = false; k.jump = false;
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
      // THE ANSWER, on the beat. The paladin's aegis and the death knight's blood ward take a moment to come up, so they hold C from the start of the tell
      /* (the Reefmaw bait was tried and reverted: holding outside its bite lost every opening the bot had; it needs a player's read of the holes) */
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
          if (P.swim && f % 20 === 0) { BK.press('jump'); P.labJump = 10; } }   /* in the acid: leap out of it, and keep leaping */
        if (MA.jump && P.ground) { BK.press('jump'); P.labJump = 16; }   /* the flood's stacks: a held jump off the edge of this footing onto the next */
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
      else if (boss.mode === 'stanceTell') goal = boss.x - Math.sign(d || 1) * 72;   /* EN GARDE: cut into it and she answers; stand off and wait for the point to drop */
      else if (rushing || (tell && (h === 'paladin' || h === 'reaper' || boss.modeT < (boss.t === 'closedhelm' ? 0.1 : 0.14)))) {
        P.face = Math.sign(d) || P.face;
        if (h === 'warden' && !HARD_TELLS.has(boss.t + '|' + boss.mode)) { k.block = DEFLECT_TAP(f); }   /* THE DEFLECT, at any blow of his the marks do not call red */
        else if (SHIELDED(h) && !HARD_TELLS.has(boss.t + '|' + boss.mode)) { k.block = true; if (h === 'paladin') holdC = f + 40;
          if (h === 'reaper') { dkHold = f + dkF(0.5); const lg = dkLag[boss.mode];
            if (tell && lg !== undefined && lg <= 0.15) { if (dkRel.mode !== boss.mode || boss.modeT > dkRel.t0 + 0.05) dkRel = { mode: boss.mode, t0: boss.modeT, at: 0.03 + Math.random() * 0.16 + (Math.random() < 0.1 ? 0.25 : 0) - lg }; dkRel.t0 = boss.modeT;
              if (boss.modeT < dkRel.at) { k.block = false; dkHold = 0; } } } }
        else if (f % 6 === 0 && !P.climb) { k[d > 0 ? 'right' : 'left'] = true; BK.press('dodge'); }   /* YOU CANNOT ROLL ON A ROPE: a dodge lets go of the rungs, and the Quartermaster shoots at a climber every two seconds - the pyromancer rolled off her shrouds all the way back down into the hold */
      } else if (incoming && SHIELDED(h)) { P.face = Math.sign(incoming.x - P.x) || P.face; k.block = true; }
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
      else if (open) { goal = boss.x; strike = true; }
      /* THE PLATE THAT TURNS EVERY BLADE (the Queen's Lance): chipping at it does nothing at all, so the hands MAKE the
         opening the way a player does - stand a dash's length off and come at his guard at a run. His own gate says a
         dash attack knocks him OFF BALANCE, and the cut after it lands. (A bot that only pressed attack measured a boss
         nobody could finish: the freebooter swung 1822 times at his plate for no damage at all.) */
      else if (DASH_IN.has(boss.t)) { const r = dashIn(BK, h, boss, f);
        goal = r ? null : boss.x - Math.sign(d || 1) * (reach + 24); }
      else if (boss.t === 'closedhelm') goal = boss.x - Math.sign(d || 1) * 42;                       // close enough to be swung at
      /* THE SHRIEK is answered from the room: to the nest bell, struck as she comes over it; with no bell near, off the boards */
      else if (boss.t === 'roc' && (boss.mode === 'shriekGo' || boss.mode === 'shriekTell')) { const fk = BK.props().find(p => p.t === 'tbell' && p.roc);
        /* (a bell on its frame stands a little proud of the floor: a hop is how you get round its posts) */
        if (fk && Math.abs(fk.x - P.x) < 200) { goal = fk.x - 12; if (P.ground && Math.abs(P.vx) < 5 && Math.abs(goal - P.x) > 10 && f % 12 === 0) BK.press('jump'); if (Math.abs(fk.x - P.x) < 22 && fk.cool <= 0 && fk.over && P.atk < 0) { P.face = Math.sign(fk.x - P.x) || P.face; BK.press('atk'); swings++; } }
        else { const fy = Math.floor(A.floor / TS), tx = Math.floor(P.x / TS); for (let r = 0; r < 12; r++) { const s = [tx + r, tx - r].find(x => L.grid[fy * L.W + x] === T.SOLID); if (s !== undefined) { goal = s * TS + 8; break; } } } }
      else if (boss.t === 'roc' && glass.length) goal = glass[Math.floor(f / 75) % Math.min(3, glass.length)];   /* one of the three middle boards, a new one every second or so */
      else if (boss.t === 'troll') { goal = boss.x; strike = true;
        /* THE HILL TROLL: his stones drop from a hook a player jumps to strike - when he walks under one, the bot drops it, as a player at that hook would */
        const st = BK.props().find(q => q.t === 'weight' && q.crane && q.state === 'hang' && Math.abs(q.x - boss.x) < 12); if (st) { st.state = 'fall'; st.fy = st.y + st.len; st.vy = 0; } }
      /* AND KING GORM IS CUT LIKE ANYONE (strike). His branch only ever walked to a cage and waited: he carries no gate
         of his own, so the whole of the 16-23 s the survey measured was cage windows and nothing else - with the cage
         hand switched off the bot swung at him ZERO times in 150 s and he finished on 100% health. Now the hands stand
         by the nearest hanging cage, as a player on the plate would, and cut him whenever he comes inside reach. */
      else if (boss.t === 'king') { const cages = BK.props().filter(c => c.t === 'dropcage' && c.boss && !c.dropped);
        const c = cages.sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0]; goal = c ? c.x + (boss.x > c.x ? -22 : 22) : boss.x; strike = true;
        // his cages drop from pressure plates up on the scaffold, where the bot cannot climb: when he walks under one, it drops it, as a player on that plate would
        /* opts.noCage takes the cage hand away, which is how the above was found: without it, zero swings and 100% of him */
        const under = opts.noCage ? null : cages.find(q => Math.abs(q.x - boss.x) < 18); if (under) { under.dropped = true; under.landed = 0; if (under.hit) under.hit.clear(); under.resetT = 5; } }
      else if (boss.t === 'gqueen') { const qx = Math.floor(boss.x / TS);
        const s = BK.props().find(p => p.t === 'support' && !p.broken && p.sx0 !== undefined && qx >= p.sx0 && qx <= p.sx1);
        if (s) { goal = s.x; if (Math.abs(s.x - P.x) < 18) { P.face = Math.sign(s.x - P.x) || P.face; if (P.atk < 0) { BK.press('atk'); swings++; } } } else goal = boss.x - Math.sign(d || 1) * 70; }
      else { goal = boss.x; strike = true; }
      /* THE OWL'S DEAD BOUGHS: when the Reeve is low under one the bot cuts its peg, as a player standing at it would, and it hops the skim */
      if (boss.t === 'owl') {
        const down=['grounded','crash','pinned','stuckTalons'].includes(boss.mode);
        if(!down){strike=false;const lamps=BK.props().filter(p=>p.owl&&!p.perch);const lamp=lamps.sort((a,b)=>Math.abs(a.x-P.x)-Math.abs(b.x-P.x))[0];if(lamp){goal=lamp.x;if(!lamp.lit&&Math.abs(P.x-lamp.x)<22&&P.atk<0){k.block=false;P.face=Math.sign(lamp.x-P.x)||1;BK.press('atk');swings++;}}}
        if (boss.mode === 'skim' && Math.abs(boss.x-P.x)<64 && (boss.x-P.x)*boss.vx<0 && P.ground){k.jump=true;BK.press('jump');}
      }
      // step in close before swinging: from the very edge of reach, a boss standing a little above the floor (the roc in her glass) is missed by a pixel
      if (walker && boss.t !== 'owl' && Math.abs(boss.y - P.y) > 30 && !k.block) {
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
        if (lvId === 'flotilla' && boss.y < P.y - 30) { const py = P.y / TS;
          if (py > 17) goalUp = 310 * TS + 8;                    /* the shroud out of the hold and up the ship's side */
          else if (boss.y < 14 * TS) goalUp = 366 * TS + 8;      /* the one ladder to the poop she does not cut */
          flotClimb = true; }
        if (flotClimb && Math.abs(goalUp - P.x) < 12) { k.left = false; k.right = false; k.up = true;
          if (!P.climb && P.ground && f % 12 === 0) { BK.press('jump'); P.labJump = 12; }   /* a hop to find the rungs, only while it is not on them */
          if (!P.climb && P.labJump > 0) { P.labJump--; k.jump = true; } }
        else { walker(goalUp);
          /* AND A STEP OF THREE ROWS IS A HELD JUMP (rule E4): her companion house is 48 px against a 49 px jump, so a
             tap does not clear it. Walking and not moving means something that size is in the way. */
          if (flotClimb && P.ground && Math.abs(P.vx) < 8 && (k.left || k.right) && f % 14 === 0) { BK.press('jump'); P.labJump = 18; }
          if (P.labJump > 0) { P.labJump--; k.jump = true; } } }
      else if (goal !== null && !k.block) { const gd = goal - P.x;
        if (Math.abs(gd) > (strike ? Math.max(8, LAB_REACH[h] * 0.6) : 6)) k[gd > 0 ? 'right' : 'left'] = true;
        /* THE TOMB'S RUBBLE IS A STEP: walking and not moving there means a mound in the way, and a player hops it */
        if (boss.t === 'prince' && (k.left || k.right) && P.ground && Math.abs(P.vx) < 4 && f % 15 === 0) BK.press('jump');
        /* AND WATER HAS A SECOND AXIS. Outside the Deep's own swimming branch the hands only ever walked left and
           right, so when the Tollmaster fills his square the bot floated at the surface with him on the stones below
           it: every hero stalled between 3% and 27% of him, which is his flood phase and nothing else. A swimmer
           strokes up and down as well. */
        if (P.swim) { const dyb = (boss.y - 10) - P.y; if (dyb < -12) k.up = true; else if (dyb > 12) k.down = true; } }
      if (strike && ad <= reach && P.atk < 0 && !k.block) { P.face = Math.sign(d) || P.face; BK.press('atk'); swings++; }
      if (opts.samples && f % 45 === 0) { out.samples = out.samples || []; out.samples.push([h, Math.round(f / 60), boss.mode, Math.round(d), Math.round(boss.y - P.y), k.block ? 'B' : '-', goal === null ? '·' : Math.round(goal - P.x), P.hurt > 0 ? 'hurt' : '', P.ground ? 'g' : 'air'].join(' ')); }
      if (f % 30 === 0 && boss.y < P.y - 12 && strike && ad < reach + 20) BK.press('jump');   /* a boss standing a tile up (the roc in the glass) is cut from a hop */
      /* THE LAST CHARGE, spent as a player spends it: at the boss while he is in front of the knight, open, and not winding up or rushing him */
      if (h === 'knight' && open && !tell && !rushing && !k.block && LAST_CHARGE(P, ad, boss.y - P.y)) { P.face = Math.sign(d) || P.face; k.left = false; k.right = false; k.jump = false; k.block = true; }
      const was = P.hp, m0 = boss.mode; BK[opts.draw ? 'step' : 'sim'](1); if (P.hp < was && !P.dead) taken += Math.min(60, was - P.hp); ledger(m0, P.dead ? 0 : was - P.hp);
      if (h === 'reaper') { if (/Tell$/.test(m0 || '') && boss.mode !== m0) { dkEndF = f; dkEndM = m0; }
        /* the ward took something: learn how late that tell's blow came, and let go now - the nova */
        if ((P.wardG || 0) > dkG + 0.5 && !(P.parryT > 0)) { if (dkEndM && f - dkEndF <= dkF(0.8)) dkLag[dkEndM] = Math.min(dkLag[dkEndM] ?? 9, (f - dkEndF) * (BK.SET.speed || 1) / 60); dkHold = 0; }
        dkG = P.wardG || 0; }
      if (opts.onFrame) await opts.onFrame({ boss, P, f, h, lvl: lvId, open });   /* THE CAMERA HOOK (opts.draw renders each frame; opts.onFrame may take it) */   /* a fall into a pit is a death and a respawn, not a blow: it is counted as falls, not as damage */
      if (P.dead) falls++;
      if (f % 600 === 599) await yieldNow();
    }
    k.left = false; k.right = false; k.block = false;
    const secs = f * (BK.SET.speed || 1) / 60;
    rows.push({ lvl: lvId, boss: boss.t, h, killed: !boss.alive, secs: +secs.toFixed(1), bossHp: hp0, hpLeftPct: boss.alive ? Math.round(100 * boss.hp / hp0) : 0,
      takenPerMin: Math.round(taken / Math.max(1 / 60, secs) * 60), heroHp: P.maxHp, swings, opened, ripostes: boss.ripostes || 0, wallOpens: boss.wallOpens || 0, falls, returns: BK.stats().parries - par0, ...(opts.modes ? { modes: modeN, hitBy } : {}) });
    await yieldNow();
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
