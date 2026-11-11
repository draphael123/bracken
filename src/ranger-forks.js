// src/ranger-forks.js - the Ranger's fork BODIES that are not a one-line read (claude/rangerfork): the SMOKE cloud (BIG CLOUD, VEIL) and the ARROW STORM capstone. Everything else is an inline fk() read in src/ranger.js.
// Pure of main.js: it gets the ranger api, a read fk(id) (main.js rb(id): false with FORKS_SHIP off, for another hero, in an EVEN-L1 duel) and the hero's player object. Flag off (every fk false) nothing here is ever started: update() is a no-op on empty lists.
// Boss law: a boss is only staggered ONCE per cloud (as the base smoke does) and is hit by every storm volley; nothing here pins, freezes or makes anything invulnerable, and no resist is touched.
export const RGF_K = {
  cloud: { r: 34, bigR: 58, bigLife: 4, bigPulse: 0.5, commonStag: 0.6, eliteStag: 0.3, bossStag: 0.4, veilR: 28, veilLife: 1.5 },
  storm: { volleys: 8, gap: 0.19, strip: 240, k: 0.7, draw: 0.5 },
};
const big = (e, boss) => !!(e.maxHp || e.mini || e === boss);
export function makeRangerForks(api, fk, getP) {
  const S = { clouds: [], storm: null };
  const smokeParts = (c, n) => { for (let i = 0; i < n; i++) api.parts.push({ x: c.x + (Math.random() - 0.5) * c.r * 1.4, y: c.y - Math.random() * 14, vx: (Math.random() - 0.5) * 24, vy: -8 - Math.random() * 14, life: 1.1, max: 1.1, col: Math.random() < 0.5 ? '#b8bcb0' : '#8a9088', size: 3, grav: -8 }); };
  /* a lingering cloud (BIG CLOUD) or a short veil at her feet (VEIL); kind 'big' | 'veil' */
  function cloud(x, y, kind) { const K = RGF_K.cloud, c = kind === 'veil' ? { kind, x, y, r: K.veilR, life: K.veilLife, tick: 0, hit: new Set() } : { kind: 'big', x, y, r: K.bigR, life: K.bigLife, tick: 0, hit: new Set() };
    S.clouds.push(c); smokeParts(c, kind === 'veil' ? 12 : 22); return c; }
  function stormStart(p) { const K = RGF_K.storm; S.storm = { x0: p.x + p.face * 10, dir: p.face, n: 0, t: 0, ph: 0, strip: K.strip }; return S.storm; }
  function step(dt) {
    for (const c of S.clouds) { c.life -= dt; c.tick -= dt;
      if (c.kind === 'veil') { for (const s of api.seeds || []) { if (s.dead || s.reflected || s.chain || s.noBlock || s.unblockable) continue; if (Math.hypot(s.x - c.x, s.y - c.y) <= c.r + 4) { s.dead = true; api.sparks(s.x, s.y, 0, 3); } } }   /* a yellow shot flying into the veil dissolves; a red one and a chain go through */
      if (c.tick <= 0) { c.tick = RGF_K.cloud.bigPulse; if (c.life > 0 && Math.random() < 0.9) smokeParts(c, c.kind === 'veil' ? 3 : 6);
        if (c.kind === 'big') for (const e of api.enemies) { if (!e.alive || e.harmless || e.gone > 0 || e.turncoat || Math.hypot(e.x - c.x, (e.y - (e.h || 16) / 2) - c.y) > c.r) continue;
          if (big(e, api.boss)) { if (!c.hit.has(e)) { c.hit.add(e); e.stagger = Math.max(e.stagger || 0, RGF_K.cloud.bossStag); } continue; }   /* a boss is staggered the once */
          e.stagger = Math.max(e.stagger || 0, e.elite ? RGF_K.cloud.eliteStag : RGF_K.cloud.commonStag); } } }
    S.clouds = S.clouds.filter(c => c.life > 0);
    const st = S.storm; if (st) { const K = RGF_K.storm; st.t += dt; st.ph -= dt;
      if (st.ph <= 0 && st.n < K.volleys) { st.n++; st.ph = K.gap; const lo = Math.min(st.x0, st.x0 + st.dir * st.strip), hi = Math.max(st.x0, st.x0 + st.dir * st.strip), p = getP();
        for (let i = 0; i < 7; i++) { const x = lo + (hi - lo) * ((i + Math.random() * 0.8) / 7); api.parts.push({ x, y: p.y - 70 - Math.random() * 20, vx: 0, vy: 280, life: 0.3, max: 0.3, col: '#e8dcb0', size: 2, grav: 0 }); }
        let hits = 0; for (const e of api.enemies) { if (!e.alive || e.harmless || e.gone > 0 || e.turncoat) continue; if (e.x < lo - 4 || e.x > hi + 4 || Math.abs(e.y - p.y) > 90) continue;
          api.hurtAs(['heavy', 'shot'], e, Math.max(1, Math.round(api.swordDmg() * K.k)), e.x, false); api.sparks(e.x, e.y - (e.h || 16) / 2, 0, 3); hits++; }
        api.shakeCam(2, 0); if (api.SFX.rgLoose) api.SFX.rgLoose(1); if (hits) api.hitstop(0.02); }
      if (st.n >= K.volleys && st.ph <= -0.05) S.storm = null; } }
  const clear = () => { S.clouds = []; S.storm = null; };
  return { S, cloud, stormStart, step, clear, clouds: () => S.clouds, storm: () => S.storm };
}
