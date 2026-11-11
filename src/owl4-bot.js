/* src/owl4-bot.js - THE WALK BOT'S LAMP LESSON (claude/owl4b, 11-10). Pure: no page, no DOM, no main.js - src/playtest.js (the in-page walk bot) feeds it a view and does what it says,
   tools/owl4-rules.mjs (section H) runs it against a tiny world in node. It only ever answers for a SHADOW GOBLIN (t:'shadowgob'), so a level without one plays exactly as before.

   WHAT A PLAYER DOES, played:
     1. an UNLIT Shadow Goblin glances every blow - the bot never swings at one (it would stand there glancing until the four-second give-up);
     2. a LIT lamp near it: LURE - stand on the far side of the lamp from the goblin, half a radius past it, and let the goblin walk through the light (REVEALED, then it can be hurt);
     3. a DARK lamp near it: STRIKE the lamp to light it (from the hero's own side of it, a jump if the lamp hangs high), then lure as in 2;
     4. a HUNG lamp (the rookery's): once it is lit and the goblin stands under it, CUT its red-and-gold cord - the lamp drops and its oil pool burns him (src/hanging-ropes.js lampcord);
     5. no lamp within seven tiles on its floor: SKIP it (walk on; nothing is stuck - tools/owl4-rules.mjs D proves every goblin has a lamp).
   The view: { P:{x,y}, foes:[enemy], lamps:[lantern prop], cords:[lampcord rope def], reach, lampR } - every unit px. */
export const SGB = {
  see: 150,         // a goblin farther than this is not this lesson's business yet
  patrol: 180,      // a lamp counts for a goblin within this of it: seven tiles is the level pass's own rule, plus the drift of a goblin that has followed the hero off its post
  stand: 0.4,       // the lure stands this much of the lamp's radius PAST the lamp, away from the goblin
  pool: 28,         // half the oil pool's width (src/owl4.js LAMP_DROP.w / 2): the goblin must stand inside it when the cord is cut
  pad: 6,           // a pixel margin kept inside every reach
  hang: 30,         // a lamp this far over the hero's feet is struck from a jump
  plainR: 56,       // a plain lit lantern's light (src/main.js owl4Lights)
};
const sgn = v => (v < 0 ? -1 : 1);
const lampR = (l, v) => (l.hv ? v.lampR : SGB.plainR);
const lit = e => !!(e.shadow && e.shadow.lit) || e.burn > 0;

/* the foe this lesson is about: the nearest live Shadow Goblin on the hero's floor, in sight */
export function pickShadowGob(v) {
  let best = null, bd = SGB.see;
  for (const e of v.foes || []) { if (!e || !e.alive || e.t !== 'shadowgob' || e.dying > 0 || Math.abs(e.y - v.P.y) > 40) continue; const d = Math.abs(e.x - v.P.x); if (d < bd) { bd = d; best = e; } }
  return best;
}

/* -> null (no Shadow Goblin: not this lesson), or one of
     { act: 'fight' }                                    it is lit: the generic fight takes it
     { act: 'skip' }                                     it cannot be lit from here: do not swing, walk on
     { act: 'lure', goalX }                              stand there, face the goblin, let it come through the light
     { act: 'light', goalX, lamp, jump }                 walk to goalX; inside reach of the lamp, strike it (jump: it hangs high)
     { act: 'cut', goalX, cord, x, y }                   walk to goalX; strike the knot at (x, y) */
export function shadowGobPlan(v) {
  const g = pickShadowGob(v); if (!g) return null;
  const P = v.P, reach = v.reach || 22, lamps = (v.lamps || []).filter(l => l && l.t === 'lantern' && !l.gone && Math.abs(l.x - g.x) <= SGB.patrol && Math.abs(l.y - P.y) <= 100);
  /* 4. the cord: a hung lamp that is lit, with the goblin standing in its pool's width - cut it (even if the light has already revealed him: the oil is the damage) */
  for (const l of lamps) {
    const c = l.cord && (v.cords || []).find(q => q.kind === 'lampcord' && q.id === l.cord); if (!c || !l.lit || !c.knot) continue;
    if (Math.abs(g.x - l.x) <= SGB.pool - SGB.pad && (c.state || 'tied') === 'tied') { const kx = c.knot[0] * 16 + 8, ky = (c.knot[1] + 1) * 16 - 8; return { act: 'cut', goalX: kx - sgn(kx - P.x) * (reach - SGB.pad), cord: c.id, x: kx, y: ky };
    }
  }
  if (lit(g)) return { act: 'fight' };
  /* 2. a lit lamp: the nearest to the goblin */
  const litL = lamps.filter(l => l.lit).sort((a, b) => Math.abs(a.x - g.x) - Math.abs(b.x - g.x))[0];
  if (litL) { const dir = sgn(litL.x - g.x); return { act: 'lure', goalX: litL.x + dir * Math.round(lampR(litL, v) * SGB.stand), lamp: litL }; }
  /* 3. a dark lamp: the nearest to the hero */
  const dark = lamps.sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
  if (dark) return { act: 'light', goalX: dark.x + sgn(P.x - dark.x) * (reach - SGB.pad - 4), lamp: dark, jump: P.y - dark.y > SGB.hang };   /* from the hero's own side: no walk round the goblin */
  return { act: 'skip' };
}

/* what the keys should be for a plan, given where the hero stands: { dir (-1 0 1), face (-1 1), swing, jump } - the walker owns the real keys, this is only the verb */
export function planKeys(plan, v) {
  if (!plan || plan.act === 'fight' || plan.act === 'skip') return null;
  const P = v.P, reach = v.reach || 22, dx = plan.goalX - P.x, near = Math.abs(dx) <= 4, g = pickShadowGob(v);
  const dir = near ? 0 : sgn(dx);
  if (plan.act === 'lure') return { dir, face: g ? sgn(g.x - P.x) : 1, swing: false, jump: false };
  if (plan.act === 'light') { const inReach = Math.abs(plan.lamp.x - P.x) <= reach; return { dir: inReach ? 0 : dir, face: sgn(plan.lamp.x - P.x), swing: inReach, jump: inReach && !!plan.jump }; }
  if (plan.act === 'cut') { const inReach = Math.abs(plan.x - P.x) <= reach; return { dir: inReach ? 0 : sgn(plan.x - P.x), face: sgn(plan.x - P.x), swing: inReach, jump: false }; }
  return null;
}
