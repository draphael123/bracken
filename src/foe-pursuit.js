// src/foe-pursuit.js - THE FOE PASS, LEVER 1 (punish running) AND LEVER 4a (squad roles) (claude/foepass; scratch/brief-foepass-1016.md).
//
// Daniel 10-16: "you can just largely ignore them". Running past cost little: few foes chased, archers shot where you WERE. On the levels
// src/foe-pass.js makes live:
//   PURSUIT    a walking foe of a PURSUE kind that SEES a hero (on its floor, PURSUIT.see) beyond the ring's reach comes after him - a walker at
//              ~2.2x its own pace (never past PURSUIT.walk, under a hero's run: you can still get away, you cannot stroll past), a HUNTER (the
//              hound) at PURSUIT.hunt, faster than a run. ON A LEASH: never more than PURSUIT.leash from where it stood, never off a ledge or
//              into spikes, and after PURSUIT.lose s out of sight it walks home. Inside the ring's reach (TOKENS.near) its own AI and the attack
//              tokens have it, as before. Its windup, a stagger, a break, a throw and a held token are never touched.
//   LEAD       an archer looses where the hero WILL be: his run x the arrow's flight x LEAD.k, at most LEAD.max px ahead. Stop or turn and it
//              misses - running in a straight line past a bowman is what it punishes.
//   SQUAD ROLES (every level): each designed squad's members are given a role under the attack tokens - FRONT (holds the hero, presses in),
//              BACK (keeps range), FLANK (goes round) - from src/foe-react.js roleOf, then BALANCED: a squad of two or more with no front gets its
//              sturdiest melee as its front. foe-react.js reads e.sqRole first.
// main.js hooks: updateEnemies after the token hold (step), the archer's loose (aimX), spawnEntities (assignRoles).

export const PURSUIT = { see: 230, leash: 300, walkMul: 2.2, walkMin: 45, walk: 72, hunt: 112, home: 40, lose: 2.0, dy: 36, blockedT: 1.0 };
/* WHO PURSUES: 'walk' (a man or a goblin on foot) or 'hunt' (faster than a run). The act sweeps add their kinds. */
export const PURSUE = {
  hound: 'hunt',
  soldier: 'walk', pike: 'walk', shield: 'walk', brute: 'walk', heavy: 'walk', javelin: 'walk', miner: 'walk', cutter: 'walk', sheargob: 'walk',
  sprig: 'walk', thief: 'walk', badger: 'walk', hearthgob: 'walk', assassin: 'walk', burngob: 'walk', swornsword: 'walk', hedgeknight: 'walk',
  cutlass: 'walk', sailor: 'walk', boarder: 'walk', cutthroat: 'walk', tippler: 'walk', bellman: 'walk', trophyhunter: 'walk',
};
export const LEAD = { k: 0.7, max: 80 };

/* THE ARCHER'S AIM: x to loose at, for a flight of T s (on: the level leads) */
export const aimX = (hero, T, on) => on ? hero.x + Math.max(-LEAD.max, Math.min(LEAD.max, (hero.vx || 0) * T * LEAD.k)) : hero.x;
/* its pace when it pursues */
export const paceOf = e => PURSUE[e.t] === 'hunt' ? Math.max(e.speed || 0, PURSUIT.hunt) : Math.max(PURSUIT.walkMin, Math.min(PURSUIT.walk, (e.speed || 30) * PURSUIT.walkMul));
/* may it pursue at all? (a common foe that walks: not a boss, a mini, an elite, a trainer, the harmless) */
export const pursuer = e => !!(e && PURSUE[e.t] && !e.elite && !e.xpRole && !e.mini && !e.harmless && !e.trainer && !e.turncoat && !e.big);

/* ONE FRAME. True: it pursued or walked home this frame (main.js skips its own AI; it still falls). api: { near, standing(e), windingUp(e),
   safeStep(x, y), move(e, dx), fall(e, dt) } */
export function step(e, hero, dt, api, stats) {
  if (!pursuer(e) || !e.alive) return false;
  if (e.fpHome === undefined) e.fpHome = e.x;
  if (e.fpBlock > 0) { e.fpBlock -= dt; return false; }
  if (e.knock > 0 || e.stagger > 0 || e.broken > 0 || e.tokHeld || e.pinned > 0 || e.carried > 0 || api.windingUp(e) || !(api.standing(e) || e.mode === undefined)) { e.fpOn = false; return false; }
  const dx = hero ? hero.x - e.x : 0, ad = Math.abs(dx), sees = !!hero && !hero.dead && ad < PURSUIT.see && Math.abs(hero.y - e.y) < PURSUIT.dy;
  e.fpLost = sees ? 0 : (e.fpLost || 0) + dt;
  if (sees && ad < api.near) { e.fpOn = false; e.fpRet = false; return false; }   /* the ring's reach: its own AI and the tokens */
  const dir = Math.sign(dx) || e.face || 1, out = Math.abs(e.x + dir * 4 - e.fpHome);
  let goal = 0;
  if (sees && out < PURSUIT.leash * (e.fpRet ? 0.6 : 1)) { goal = dir; if (!e.fpOn && stats) stats.pursuits++; e.fpOn = true; e.fpAway = true; e.fpRet = false; }   /* (walking home, it turns again only well inside its leash: no dithering at the line) */
  else if (e.fpAway && Math.abs(e.x - e.fpHome) > 10 && (out >= PURSUIT.leash || e.fpLost > PURSUIT.lose || e.fpRet)) { goal = Math.sign(e.fpHome - e.x); e.fpOn = false; e.fpRet = true; }
  else { if (Math.abs(e.x - e.fpHome) <= 10) e.fpAway = e.fpRet = false; e.fpOn = false; return false; }
  const v = goal * (e.fpRet ? PURSUIT.home : paceOf(e));
  if (!api.safeStep(e.x + goal * ((e.w || 10) / 2 + 3), e.y)) { e.fpBlock = PURSUIT.blockedT; e.fpOn = false; if (e.fpRet) { e.fpHome = e.x; e.fpAway = false; } e.fpRet = false; return false; }   /* a ledge or spikes between: it stops at the lip (and a foe that cannot get home makes this its home) */
  e.face = e.fpRet ? goal : dir; e.vx = v; api.move(e, v * dt); api.fall(e, dt);
  return true;
}

/* SQUAD ROLES, once a spawn: e.sqRole for every squad member (roleOf: src/foe-react.js) - and a squad of two or more is given a FRONT if it had none */
export function assignRoles(enemies, roleOf) {
  const by = new Map();
  for (const e of enemies) if (e.alive && e.squad && !e.elite && !e.xpRole) { let l = by.get(e.squad); if (!l) by.set(e.squad, l = []); l.push(e); }
  let n = 0;
  for (const l of by.values()) { for (const e of l) { e.sqRole = undefined; e.sqRole = roleOf(e); }
    if (l.length >= 2 && !l.some(e => e.sqRole === 'front')) { const m = l.filter(e => e.sqRole === 'flank').sort((a, b) => (b.hp || 0) - (a.hp || 0))[0]; if (m) { m.sqRole = 'front'; n++; } } }
  return { squads: by.size, promoted: n };
}
/* THE LEADED SHOT: { x, T } - where to loose (LEAD) over the archer's own flat flight T0. The flight is NEVER lengthened: a longer, higher shot would
   come down steeply onto a DUCKING hero, and a high arrow's answer is the duck (tools/duck.mjs). A lead past the flat shot's reach (cap x T0) is
   held to it: the arrow falls short of where he is going, as an unled one fell short of where he was. */
export function leadShot(hero, sx, cap, T0 = 0.75) {
  if (hero.ducking || hero.knock > 0 || !(Math.abs(hero.vx || 0) >= 20)) return { x: hero.x, T: T0 };   /* a ducking, a thrown or a standing hero is shot where he is: the lead is for one who RUNS (and a duck under a high arrow stays the answer) */
  const x = aimX(hero, T0, true), r = cap * T0, far = Math.abs(hero.x - sx) >= r;
  return { x: far ? hero.x : Math.max(sx - r, Math.min(sx + r, x)), T: T0 };
}
