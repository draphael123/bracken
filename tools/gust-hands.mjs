// Pilot controls for an explicitly told ground-gust obstacle. No game state, geometry or damage is changed.
export function makeGustHands(BK) {
  let waited = 0;
  return {
    get waited() { return waited; },
    step(goalX) {
      const P = BK.P;
      if (BK.state !== 'play' || !P.ground || P.dead || P.climb || P.swim) return false;
      const dir = Math.sign(goalX - P.x), ahead = P.x + dir * 64;
      const zones = (BK.L.gusts || []).filter(z => z.told && z.shove && !z.arena &&
        P.y > z.y0 && P.y <= z.y1 + 4 &&
        (P.x > z.x0 && P.x < z.x1 || dir && Math.max(P.x, ahead) > z.x0 && Math.min(P.x, ahead) < z.x1));
      const unsafe = zones.some(z => {
        const ph = (BK.time + (z.phase || 0)) % z.period;
        // The same visible 1.2-second whistle used by gustNow(): hop in the still, not through its warning.
        return ph < z.on || ph > z.period - Math.min(1.2, z.period - z.on);
      });
      if (!unsafe) return false;
      const k = BK.keys;
      k.left = k.right = k.up = k.jump = k.atk = k.dodge = false;
      k.block = false; k.down = true; // every hero can brace by crouching, without using a special ability
      BK.unpress(); waited++;
      return true;
    }
  };
}
export const GUST_HANDS = makeGustHands.toString();
