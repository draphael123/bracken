// src/gqueen-hands.js - THE GOBLIN QUEEN 3's HANDS (claude/gqueen3, scratch/plan-goblinqueen3-1104.md; modelled on src/gorm-hands.js: P1 -> flee -> P2 persists across death).
// main.js owns the world and her mode machine (updateGQueen); this file owns what is NEW:
//   - her CROWN and her PORTAL ROCK SHARDS, in their OWN arrays (never `seeds`: the pyro's ember ward, the pirate's hook catch and the ranger's snatch eat seeds)
//   - the PARRY of either one: gqHit() asks damagePlayer and reads the shared parry counter (RP.stats.parries), so every hero's beat path covers it
//   - STUNNED (the main opening), the flee, the escape up the burning hall, the portal step and phase two on THE TOWER TOP (later commits)
// Starting numbers are the plan's (tune lane next week). Art = placeholders (frames 2/6/7/15/16 until the art lane).
export const GQ3 = {
  stunGuard: 1.5,                      // s after a stun in which no second stun can land (no stunlock, B12)
  crown: { cd: 7, cd2: 5.5, tell: 0.8, out: 230, reach: 210, hang: 0.15, back: 260, dmg: 16, home: 340, stun: 3.5, stunHp: 0.04, fetch: 1.2, dy: 14, r: 5 },
  portal: { cd: 8, cd2: 6, tell: 1.0, n: 2, n2: 3, glow: 0.9, gap: 0.35, fan: 3, spread: 14, v: 210, dmg: 10, minDist: 90, home: 320, stun: 2.2, stunHp: 0.03, clankHp: 0.01, rows: [12, 13, 14, 15, 16], r: 4 },
};
export const GQ_SAY = { crowned: 'CROWNED', clank: 'CLANK', fetch: 'SHE FETCHES HER CROWN' };

export function makeGQueenHands(ctx) {
  const TS = ctx.TS, H = {};
  const L = () => ctx.L, P = () => ctx.P();
  let S = null;
  const q = () => { const b = ctx.boss(); return b && b.t === 'gqueen' && b.alive ? b : null; };
  H.on = () => !!(L() && L().arena && L().arena.boss === 'gqueen');
  H.load = () => { S = null; };
  H.reset = () => { if (!H.on()) { S = null; return; } S = fresh(); };
  const fresh = () => ({ crown: null, rocks: [], portals: [], cast: null, stunUntil: 0, stunGuardUntil: 0, said: new Set() });

  /* ONE DOOR for every blow of hers that can be parried: a yellow, blockable damagePlayer, and the answer is whether the shared parry counter moved.
     (Every hero's beat path - the knight's raised shield, the warden's deflect, the pyro's ward, the pirate's catch - calls RP.parried, so all nine are covered with no per-hero code.)
     Never `unblockable`, never `pierce`: a red or a piercing blow is TOO STRONG and is never parried. */
  function gqHit(x, dmg, who, name) {
    const n0 = ctx.parries();
    const r = ctx.damage(x, dmg, { who, name });
    return { res: r, parried: ctx.parries() > n0 };
  }
  H.hit = gqHit;

  /* ---------------- PER FRAME ---------------- */
  H.update = dt => {
    if (!S) return;
  };

  /* ---------------- TOOLS / BOT ---------------- */
  H.shots = () => {
    if (!S) return [];
    const out = [];
    if (S.crown && S.crown.state !== 'floor') out.push({ x: S.crown.x, y: S.crown.y, vx: S.crown.vx, vy: 0, kind: 'crown', home: !!S.crown.home });
    for (const r of S.rocks) if (!r.dead) out.push({ x: r.x, y: r.y, vx: r.vx, vy: r.vy, kind: 'rock', home: !!r.home });
    return out;
  };
  H.stage = () => { const e = q(); return e && e.stage ? e.stage : 'hall'; };
  H.portals = () => (S ? S.portals.map(p => ({ x: p.x, y: p.y, state: p.state })) : []);
  H.read = () => S ? { crown: S.crown ? { ...S.crown } : null, rocks: S.rocks.length, portals: S.portals.length, stunUntil: S.stunUntil } : null;
  return H;
}
