// src/naga-guard.js - THE NAGA GUARD, SIREN ROCKS' one new foe (claude/sirenrocks, the greybox, 2026-11-06; brief-sirenrocks-1024 "one NEW foe max (rec: a NAGA GUARD,
// serpent-tailed spear)", plan-water-1105 item 4 "New foe: NAGA GUARD"). PURE: no DOM, no main.js - src/siren-rocks-hands.js binds it to the world and draws it (GREYBOX).
// A serpent-bodied spear guard of the Naga Queen's court. ITS ONE THING: THE SONG NEVER MOVES IT - it coils its tail round the rock (e.anchored: the pull field skips it),
// so where a song drags YOU, it drags you onto its spear (THE HOLDING SONG on the urchin bridge, the exam stack).
// TWO TOLD MOVES (B4: ! = a guard answers it, !! = it must be dodged), each with its own windup and release pose:
//   THE SPEAR    (! guard it)  it draws the spear back (0.55 s), then thrusts. A guard turns it: the shaft recoils and the guard REELS (NG.recoil s, x NG.open).
//   THE LUNGE    (!! jump it)  it winds its tail into a coil (0.8 s), then springs along the ground - low (a hero NG.lunge.h px off the floor is over it).
//                              Spent after (NG.spent s, x NG.open): it lies stretched out on the rock.
export const NG = {
  hp: 56, w: 12, h: 22, see: 150, seeY: 40, slither: 38, keep: 26,
  spear: { tell: 0.55, reach: 30, dmg: 16, rec: 0.5, cd: 1.1 },
  lunge: { tell: 0.8, air: 0.28, speed: 260, h: 12, dmg: 18, cd: 3.2, min: 46, max: 112 },
  recoil: 0.9, spent: 1.0, open: 1.5,
};
export const NG_SAY = { spent: 'SPENT', reel: 'TURNED' };
export const NG_TELLS = { spearTell: { mark: '!', answer: 'block' }, coilTell: { mark: '!!', answer: 'jump' } };
export const TELL_ROWS = Object.entries(NG_TELLS).map(([m, v]) => ['nagaguard', m, v.mark, v.answer, 'low']);   /* (claude/sea3) the rows of src/marks.js: marks.js registers every module's TELL_ROWS, tools/tells.mjs discovers them */
export const ngOpen = e => e.mode === 'spent' || e.mode === 'recoil';

export function spawnGuard(base, ent, hp) {
  return { ...base, t: 'nagaguard', w: NG.w, h: NG.h, hp: hp || NG.hp, face: ent.face || -1, mode: 'idle', modeT: 0.4 + Math.random() * 0.6, cd: 0.6, lcd: 1.2 + Math.random(), anchored: true, noPull: true, vx: 0, vy: 0, n: 0 };
}
/* a blow on it: whole, and NG.open while it is spent or reeling */
export const guardTake = (e, dmg) => dmg * (ngOpen(e) ? NG.open : 1);

/* ONE FRAME. h = the nearest hero { x, y, alive }, c = { mark(m), sound(k), hit(box, dmg, name, o) -> 'hit'|'blocked'|null, move(e, dx, dy) -> { ground }, wet(e) } */
export function stepGuard(e, dt, h, c) {
  if (!e.alive) return;
  e.modeT -= dt; e.cd = Math.max(0, e.cd - dt); e.lcd = Math.max(0, e.lcd - dt); e.anim = (e.anim || 0) + dt * 6;
  const wet = c.wet ? c.wet(e) : false;
  e.vy = Math.min(wet ? 60 : 300, (e.vy || 0) + (wet ? 240 : 1000) * dt);
  let want = 0;
  const dx = h ? h.x - e.x : 0, ad = Math.abs(dx), near = !!(h && h.alive && ad < NG.see && Math.abs(h.y - e.y) < NG.seeY);
  switch (e.mode) {
    case 'spearTell': if (e.modeT <= 0) { e.mode = 'spear'; e.modeT = 0.14; e.n++; c.sound('slash');
        const r = c.hit([e.x + (e.face > 0 ? 0 : -NG.spear.reach), e.x + (e.face > 0 ? NG.spear.reach : 0), e.y - 18, e.y - 4], NG.spear.dmg, 'THE NAGA SPEAR', { blockable: true, key: 'ngs' + e.n });
        if (r === 'blocked') { e.mode = 'recoil'; e.modeT = NG.recoil; c.sound('clank'); c.say && c.say(e, NG_SAY.reel); } }
      break;
    case 'spear': if (e.modeT <= 0) { e.mode = 'rec'; e.modeT = NG.spear.rec; e.cd = NG.spear.cd; } break;
    case 'coilTell': if (e.modeT <= 0) { e.mode = 'lunge'; e.modeT = NG.lunge.air; e.n++; c.sound('whoosh'); } break;
    case 'lunge': want = e.face * NG.lunge.speed;
      c.hit([e.x - 8, e.x + 8, e.y - NG.lunge.h, e.y], NG.lunge.dmg, 'THE NAGA LUNGE', { key: 'ngl' + e.n, low: true });
      if (e.modeT <= 0) { e.mode = 'spent'; e.modeT = NG.spent; e.lcd = NG.lunge.cd; c.say && c.say(e, NG_SAY.spent); }
      break;
    case 'spent': case 'recoil': case 'rec': if (e.modeT <= 0) { e.mode = 'idle'; e.modeT = 0.3; } break;
    default: {
      e.mode = near ? 'slither' : 'idle';
      if (!near) break;
      e.face = Math.sign(dx) || e.face;
      if (ad > NG.keep) want = e.face * NG.slither;
      if (e.lcd <= 0 && ad >= NG.lunge.min && ad <= NG.lunge.max) { e.mode = 'coilTell'; e.modeT = NG.lunge.tell; c.mark('!!'); c.sound('tellHard'); want = 0; }
      else if (e.cd <= 0 && ad < NG.spear.reach + 6) { e.mode = 'spearTell'; e.modeT = NG.spear.tell; c.mark('!'); c.sound('tell'); want = 0; }
    }
  }
  e.vx = want ? want : e.vx * Math.max(0, 1 - dt * 10);
  const r = c.move(e, e.vx * dt, e.vy * dt); if (r && r.ground) e.vy = 0;
  if (r && r.wall && e.mode === 'lunge') e.modeT = Math.min(e.modeT, 0);
}
