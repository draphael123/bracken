// src/hero-strikes.js - ONE RULE FOR "A HERO STRUCK THIS" (GQ4Q, Daniel 11-10 08:15): a swing hitbox OR any live hero projectile that meets a box. Read by src/gqueen-hands.js (her geode, her portal
// shards, her stone shards, the tower's boulders) and src/gobgeo-hands.js (the Geomancers' rocks). The ranger's arrow and a melee blow always counted (that is the legacy rule, flag OFF);
// flag ON adds the pyro's embers, the pirate's / warden's shot tracers, the berserker's hatchets and axe, the paladin's hammers, the reaper's scythe and the geomancer's own stone shards.
// main.js configures it once (configure) with its own arrays. A projectile struck here is marked with `key` so it strikes a given thing once.
import { gq4qOn } from './gq4q.js';
let C = null;
export function configure(c) { C = c; }
const near = (p, b, m) => p.x >= b.l - m && p.x <= b.r + m && p.y >= b.t - m && p.y <= b.b + m;
function segHits(t, b, m) {   // a short tracer line against a box (sampled)
  const dx = t.x1 - t.x0, dy = t.y1 - t.y0, n = Math.max(2, Math.ceil(Math.hypot(dx, dy) / 6));
  for (let i = 0; i <= n; i++) { const k = i / n; if (near({ x: t.x0 + dx * k, y: t.y0 + dy * k }, b, m)) return true; }
  return false;
}
function mark(p, key) { (p.hit || (p.hit = new Set())).add(key); }
const unseen = (p, key) => !(p.hit && p.hit.has(key)) && !(p.hk && p.hk.has(key));
/* box: { l, r, t, b } in world px. key: unique per struck thing. Returns null, or { how: 'blow' | 'arrow' | 'ember' | 'shot' | 'axe' | 'hammer' | 'scythe' | 'stone', P1? }. */
export function heroStrikes(box, key) {
  if (!C) return null;
  let found = null;
  const eachSeat = C.eachSeat || (fn => { const p = C.hero && C.hero(); if (p && !p.dead) fn(p); });
  eachSeat(P1 => {   // 1. the swing: once a blow, the hero's own hitSet (as every struck thing in main.js)
    if (found || !P1) return; const hb = C.attackBox ? C.attackBox() : null;
    if (hb && P1.hitSet && !P1.hitSet.has(key) && C.overlap(hb, box)) { P1.hitSet.add(key); found = { how: 'blow', P1 }; } });
  if (found) return found;
  for (const pp of (C.players ? C.players() : []) || []) {   // 2. the ranger's arrow in flight (legacy rule)
    for (const ar of pp.rgArrows || []) { if (ar.state !== 'fly' || ar.ggHit) continue; if (near(ar, box, 10)) { ar.ggHit = true; ar.state = 'drop'; return { how: 'arrow' }; } } }
  if (!gq4qOn()) return null;
  for (const em of (C.embers ? C.embers() : [])) {   // 3. the pyro's embers (every kind: the tap ember, the lobbed fireball, the cone)
    if (em.life <= 0 || !unseen(em, key) || !near(em, box, em.r || 3)) continue; mark(em, key); em.life = Math.min(em.life, 0.03); return { how: 'ember' }; }
  for (const tr of (C.tracers ? C.tracers() : [])) {   // 4. a pistol ball / a hitscan line (pirate, warden): its tracer lives a breath
    if (tr.life <= 0 || !unseen(tr, key) || !segHits(tr, box, 2)) continue; mark(tr, key); return { how: 'shot' }; }
  for (const pp of (C.players ? C.players() : []) || []) {   // 5. the berserker's hatchets and axe in flight
    for (const h of pp.hatchets || []) { if (h.life <= 0 || !unseen(h, key) || !near(h, box, 4)) continue; mark(h, key); return { how: 'axe' }; }
    const ax = pp.bzAxe; if (ax && ax.state === 'fly' && unseen(ax, key) && near(ax, box, 5)) { mark(ax, key); return { how: 'axe' }; } }
  for (const h of (C.hammers ? C.hammers() : [])) { if (!unseen(h, key) || !near(h, box, 5)) continue; mark(h, key); return { how: 'hammer' }; }   // 6. the paladin's blessed hammers
  { const s = C.scythe ? C.scythe() : null; if (s && unseen(s, key) && near(s, box, 6)) { mark(s, key); return { how: 'scythe' }; } }   // 7. the reaper's scythe
  for (const st of (C.stones ? C.stones() : [])) { if (!st || st.life <= 0 || !unseen(st, key) || !near(st, box, 4)) continue; mark(st, key); return { how: 'stone' }; }   // 8. the geomancer's stone shards
  return null;
}
