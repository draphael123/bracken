/* tools/lab-reach.mjs — BOT BUG A: the parked hand must reach its own boss (Daniel, 2026-09-25, "stands one pixel
   outside its own reach"). LAB_STAND used to be a second, hand-set table beside LAB_REACH - close for six heroes,
   but only 2 px of margin over the walk deadband (4 px) for the warden, so on a flat floor his hands could rest
   past LAB_REACH and swing at air. The Reef lane found this on the Reefmaw's widened arena (claude/reef2) and
   fixed it for him alone, standing his hands six pixels further in. It was never his bug: it is the generic goal
   math in src/lab.js, for every hero against every boss that uses it (claude/botfix derives LAB_STAND from
   LAB_REACH instead, with its own margin). This parks each hero at exactly the distance the hand's own "desired"
   formula rests at - LAB_STAND[h] + half the boss's width, out from a real boss on its own arena floor - and
   swings once. Every one of them must land. */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';

const HEROES = ['knight', 'warden', 'pyro', 'paladin', 'pirate', 'reaper', 'geomancer'];
const BOSSES = ['wood', 'kings', 'spire', 'crown', 'reef', 'flotilla', 'hurricane', 'waymeet', 'undercrown'];   /* the default bossLab roster, minus 'deep': the King swims and is played by a special-cased branch, not the generic stand */

const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{
    const lvm = await import('/src/level.js');
    const lab = await import('/src/lab.js');
    const heroes = ${JSON.stringify(HEROES)}, bosses = ${JSON.stringify(BOSSES)};
    const SPECIAL = new Set(['drownedking', 'bellcrab', 'quarter']);   /* their own movement branches in runbossLab, not the generic "desired" stand */
    const out = [];
    for (const lvId of bosses) for (const h of heroes) {
      BK.setHero(h); BK.reset({ fresh: true }); BK.load(lvm.LEVELS.findIndex(l => l.id === lvId)); BK.start(); BK.sim(10);
      BK.reset();
      const L = BK.L, A = L.arena;
      if (!A) { out.push({ lvl: lvId, h, skip: 'no arena' }); continue; }
      const boss = BK.enemies().find(e => e.t === A.boss && e.alive);
      if (!boss) { out.push({ lvl: lvId, h, skip: 'no boss' }); continue; }
      if (SPECIAL.has(boss.t)) { out.push({ lvl: lvId, h, skip: 'special-cased movement' }); continue; }
      for (const e of BK.enemies()) if (e !== boss && !e.maxHp) e.alive = false;
      if (A.carpet) { BK.board(); BK.sim(30); } else { BK.tp(Math.round(A.trigger / 16) + (A.reverse ? -1 : 1), Math.round(A.floor / 16) - 1); BK.sim(30); }
      /* GOD MODE, SET HERE (after the resets, which would clear it) AND KEPT ON THROUGH THE WHOLE SWING: the Death
         Knight's cleave is the slowest swing in the game, and without it the boss's own attack interrupted his windup
         often enough to read as a reach miss on every boss - which was never what this check is asking (found the hard
         way: the first two passes of this file chased a math bug that was really P.hurt cancelling a swing that had
         not landed yet). */
      BK.god = true;
      const P = BK.P;
      /* THE WORST CASE, NOT THE IDEAL ONE: the walk that gets a hand to its stand distance stops once it is within
         WALK_DEADBAND of it (src/lab.js), so the hand can rest anywhere out to LAB_STAND[h] + WALK_DEADBAND. A margin
         of 2 against a deadband of 4 (the warden, before this lane) still passes a test that checks LAB_STAND alone -
         it only fails once it is parked at the edge the real walk can actually stop on, which is what this checks. */
      const stand = lab.LAB_STAND[h] + lab.WALK_DEADBAND + (boss.w || 20) / 2;
      P.x = boss.x - stand; P.y = boss.y; P.face = 1; P.vx = 0; P.vy = 0; P.ground = true;
      P.hp = P.maxHp; P.st = P.maxSt; P.dead = 0; P.hurt = 0; P.block = false; P.atk = -1; P.dodge = 0;
      BK.sim(2);
      /* CONTACT, NOT DAMAGE. Several of these bosses only take damage through a gate (the Goblin Queen's plate is
         only down while gqOpen, the Paladin's ward only while its own open flag is set, and so on) - asking whether
         hp fell would fail on a perfectly-reached, perfectly-guarded boss for a reason that has nothing to do with
         BOT BUG A. P.hitSet.add(boss) happens on plain hitbox overlap, BEFORE any shield or gate is asked (main.js,
         every swing site), so it is the one signal that means only "the blade's box touched the boss's box" - which
         is exactly what a stand distance derived from LAB_REACH promises. */
      P.hitSet.clear();
      /* A TAP, NOT A HOLD: BK.press('atk') alone, exactly as every hand in src/lab.js swings ("BK.press('atk');swings++;").
         Holding keys.atk true across frames was tried first and reads on the Death Knight as the held input that starts
         THE PLANTED BLADE (P.heavy) instead of the plain cleave - a much shorter reach (main.js attackBox, "isReaper() &&
         P.heavy": r caps at 20-32 against the plain swing's 31) that failed on every boss for a reason that had nothing
         to do with LAB_STAND. A real player's tap, and the bot's, never holds the button down like that. */
      BK.press('atk');
      /* THE HAND TRACKS, IT DOES NOT COMMIT: in real play the goal math re-centres on the boss's CURRENT position every
         frame (src/lab.js, "desired"), so a mobile boss (the Hornet Queen drifts and hovers; the King paces) never
         outruns a parked hand mid-swing. Re-pinning P.x here every frame removes that chase from the test, which is
         about reach, not pursuit - and the Death Knight needs it: his cleave is the slowest swing in the game
         (P.atk += dt * 0.34) and does not reach its full 31 px until 0.44 s in, plenty of time for a hovering queen
         to walk out from under a hand that was only checked once. */
      for (let f = 0; f < 90 && boss.alive && !P.hitSet.has(boss); f++) { P.x = boss.x - stand; P.y = boss.y; P.vx = 0; P.vy = 0; BK.sim(1); }   /* the Hornet Queen also moves in y: pin both axes, not only x */
      out.push({ lvl: lvId, h, stand: Math.round(stand), hit: P.hitSet.has(boss) });
    }
    return out;
  })()`);
  const tested = r.filter(x => !x.skip);
  const misses = tested.filter(x => !x.hit);
  assert(tested.length >= 30, 'expected a real sample of hero x boss pairs, only got ' + tested.length + ': ' + JSON.stringify(r));
  assert.equal(misses.length, 0, misses.length + ' of ' + tested.length + ' parked hands never touched the boss they were parked against (P.hitSet never gained it): ' + JSON.stringify(misses));
  assert.deepEqual(pg.errors, []);
  console.log('Every hero, parked at its lab stand distance, reaches with its strike against a sample of ' + BOSSES.length + ' bosses (' + tested.length + ' pairs checked, ' + r.filter(x=>x.skip).length + ' skipped).');
} finally { pg.close(); }
