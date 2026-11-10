/* src/crypt-mother.js - THE CRYPT MOTHER, THE SILK UNDERCROFT's boss (claude/silk, the OPUS GREYBOX; brief-silkundercroft-1015.md). THE FIGHT, PURE: no canvas,
   no page, no main.js. src/crypt-mother-hands.js binds it to the world (the knots, the floor strands, the sacs, the hurt) and draws it; tools/silk.mjs fights it.
   A huge spider in a cathedral-sized web over a pit, under the manor. The fight is ON the strands. Distinct from THE WEAVER (the Hanging Village's mini).
   THE ARENA: THE CATHEDRAL WEB - two stone banks, four floor strands over the pit, five tiers, a taut web on each bank, three KNOTS (a high ledge at each wall, the top tier).
   THE RULE OF THE FIGHT (B14, the level's verb): she HANGS from ONE ANCHOR LINE, run to one of the knots. CUT THE KNOT she hangs from -> she drops onto her back:
     OPEN x2 for CM.drop.open s (capped CM.openCap of her per opening), then she climbs and runs a new line to the next knot. BOUNCE: a blow from ABOVE (a hero over her
     abdomen, off a taut web or the top tier) lands x1 while she hangs - not the x0.45 her hide gives.
   MOVES (each its own windup pose, release pose and sound - POSE / SOUND in src/crypt-mother-hands.js):
     WEB SPIT          told 0.7 s (her spinnerets lift, yellow !): a slow glob - a shield stops it; a hit is 8 and SNARED (mash free)
     POUNCE            told 1.0 s (her SHADOW and a thread drop under the target, red !!): she falls on the shadow (22) - move off. She sits CM.pounce.ground s, then climbs
     SPIDERLING CLUTCH told 0.9 s (her abdomen pulses, red !!): she lays a sac on a strand near you; it hatches CM.clutch.n spiderlings in CM.clutch.hatch s - burn it early
     LEG SWEEP         told 0.6 s (a leg drawn back along the strand, red !!): a low sweep along the strand under her - jump it
   P2 (50% -> 0) SHE CUTS HER OWN STRANDS: told CM.p2.lament s (still x0.45 - never untouchable), then every CM.p2.every s one floor strand FLASHES CM.p2.flash s (told) and falls;
     the net catches a hero on it (16, spare). CM.p2.keep strands always stay; the banks, tiers, taut webs and knots never fall (never a soft-lock, never an untold death).
   B15: x0.45 outside an opening, x2 in one (capped), x1 from above; never untouchable. P1 cannot pass 50% (the floor holds until her move in hand ends). */

export const CM = {
  hp: 3000, w: 30, h: 20, markH: 40, speed: 60,
  resist: 0.45, openMul: 2, openCap: 0.12, floorP1: 0.5, aboveMul: 1.0,
  spit: { tell: 0.7, speed: 150, dmg: 8, snare: 1.3, cd: 3.2, life: 3.2, r: 9 },
  pounce: { tell: 1.0, fall: 380, dmg: 22, w: 22, ground: 1.2, climb: 120, cd: 7 },
  clutch: { tell: 0.9, hatch: 4.0, n: 3, cd: 12, max: 2 },
  sweep: { tell: 0.6, act: 0.35, dmg: 18, reach: 110, cd: 5 },
  drop: { open: 3.0, fall: 420 },
  p2: { lament: 2.0, every: 14, flash: 2.0, keep: 2, faster: 0.8 },
};
export const cmOpen = e => !!e && e.mode === 'fallen' && e.modeT > 0;
export const OPEN_NAME = { fallen: 'ON HER BACK' };
const HANGING = new Set(['hang', 'spitTell', 'spit', 'pounceTell', 'clutchTell', 'clutch', 'sweepTell', 'sweep']);
export const hanging = e => HANGING.has(e.mode);

/* THE ARENA'S GEOMETRY from the built level (src/silk-undercroft.js): knots in px, the hang point, the floor strands */
export function geom(L, TS = 16) {
  const A = L.arena, an = (L.sk && L.sk.anchors) || [];
  const knots = A.knots.map(id => { const a = an.find(q => q.id === id); return { id, x: a.x, y: a.y }; });
  return { x0: A.x0, x1: A.x1, floorY: A.floor, hangY: A.hang.y, knots, secs: A.secs.map(s => ({ ...s, px0: s.x0 * TS, px1: (s.x1 + 1) * TS })), TS };
}
export function newFight(G) {
  return { G, ph: 1, knot: 1, openDealt: 0, globs: [], sacs: [], shadow: null, flash: null, fallen: new Set(), collapseT: CM.p2.every,
    cd: { spit: 1.2, pounce: 3.0, clutch: 6.0, sweep: 2.0 }, told: {},
    n: { spits: 0, spitHits: 0, snares: 0, pounces: 0, pounceHits: 0, clutches: 0, hatched: 0, sacsBurned: 0, sweeps: 0, sweepHits: 0, cuts: 0, opens: 0, openHits: 0, above: 0, collapses: 0 }, hurt: {}, won: false };
}
const near = (heroes, x) => heroes.filter(h => h.alive).sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x))[0] || null;
const setMode = (e, m, t) => { e.mode = m; e.modeT = t; e.modeT0 = t; };
const cdk = S => (S.ph === 2 ? CM.p2.faster : 1);
export const knotOf = S => S.G.knots[S.knot];

/* A BLOW ON HER: [damage, word]. Open x2 (capped per opening); from above x1 while she hangs; x0.45 otherwise; P1 cannot pass 50% */
export function takeBlow(e, S, dmg, from = null) {
  let d, word = null;
  if (cmOpen(e)) { const cap = CM.openCap * e.maxHp, room = cap - S.openDealt; d = dmg * CM.openMul <= room ? dmg * CM.openMul : Math.max(dmg * CM.resist, room); S.openDealt = Math.min(cap, S.openDealt + d); S.n.openHits++; }
  else if (from && hanging(e) && from.y < e.y - 8 && Math.abs(from.x - e.x) < CM.w) { d = dmg * CM.aboveMul; S.n.above++; word = 'ABOVE'; }
  else { d = dmg * CM.resist; word = 'HIDE'; }
  if (S.ph === 1 && e.hp - d < e.maxHp * CM.floorP1) { d = Math.max(0, e.hp - e.maxHp * CM.floorP1); if (!S.told.holds) { S.told.holds = 1; word = 'HOLDS'; } }
  return [Math.round(d * 100) / 100, word];
}
/* THE CUT: a hero's blow on a knot. Only the knot she hangs from is live. Returns 'cut' | 'nothing' */
export function cutKnot(e, S, id, W) {
  const k = knotOf(S); if (!e.alive || !k || k.id !== id) return 'nothing';
  if (['sleep', 'wake', 'lament', 'fallen', 'climb'].includes(e.mode)) return 'nothing';
  S.n.cuts++; S.n.opens++; S.openDealt = 0; S.shadow = null; e.fallFrom = e.y; e.fallTo = S.G.floorY;
  W.sound('cut'); W.say && W.say('open', e.x, e.y); W.fx && W.fx('open', e.x, e.y);
  setMode(e, 'fallen', CM.drop.open); e.upside = true; return 'cut';
}
/* A SAC struck: with a torch it burns; without, it bursts now (its spiderlings hatch) */
export function strikeSac(S, i, torch, W) { const s = S.sacs[i]; if (!s || s.dead) return false; s.dead = true;
  if (torch) { S.n.sacsBurned++; W.sound('burn'); W.say && W.say('burned', s.x, s.y); } else { S.n.hatched += CM.clutch.n; W.spawnLings && W.spawnLings(s.x, s.y, CM.clutch.n); W.sound('hatch'); } return true; }

/* ONE STEP. heroes: [{ x, y, alive, ground, pp, id }]. W: the world (src/crypt-mother-hands.js, or the test's fake) */
export function step(e, S, dt, heroes, W) {
  if (!e.alive) return;
  for (const k in S.cd) S.cd[k] = Math.max(0, S.cd[k] - dt);
  e.modeT -= dt;
  stepGlobs(S, dt, heroes, W); stepSacs(S, dt, W); if (S.ph === 2) stepCollapse(e, S, dt, heroes, W);
  const tgt = near(heroes, e.x);
  switch (e.mode) {
    case 'sleep': return;
    case 'wake': if (e.modeT <= 0) setMode(e, 'hang', 0.4); return;
    case 'fallen': e.y += (S.G.floorY - 2 - e.y) * Math.min(1, dt * 8); if (e.modeT <= 0) { e.upside = false; S.knot = nextKnot(S, heroes); W.sound('climb'); setMode(e, 'climb', 0); } return;
    case 'landed': if (e.modeT <= 0) { W.sound('climb'); setMode(e, 'climb', 0); } return;
    case 'climb': { e.y -= CM.pounce.climb * dt; if (e.y <= S.G.hangY) { e.y = S.G.hangY; setMode(e, 'hang', 0.3); } return; }
    case 'pounce': { e.y += CM.pounce.fall * dt; const fy = landY(S, e.x); if (e.y >= fy) { e.y = fy; S.n.pounces++; W.sound('slam'); W.shake && W.shake(5);
        for (const h of heroes) if (h.alive && Math.abs(h.x - e.x) < CM.pounce.w && Math.abs(h.y - fy) < 30) { S.n.pounceHits++; W.hitHero(h, CM.pounce.dmg, 'pounce', 'pc' + S.n.pounces + ':' + h.id, {}); }
        S.shadow = null; S.cd.pounce = CM.pounce.cd * cdk(S); setMode(e, 'landed', CM.pounce.ground); } return; }
    case 'lament': if (e.modeT <= 0) { S.ph = 2; e.phase = 2; S.collapseT = 2.0; W.music && W.music(2); setMode(e, 'hang', 0.4); } return;
  }
  if (/Tell$|^spit$|^clutch$|^sweep$/.test(e.mode)) { if (e.modeT <= 0) stepMove(e, S, dt, heroes, W); else if (e.mode === 'pounceTell' && tgt && S.shadow) S.shadow.x += Math.sign(tgt.x - S.shadow.x) * Math.min(Math.abs(tgt.x - S.shadow.x), 30 * dt); return; }
  /* P1 -> P2 at the floor, once the move in hand is done */
  if (S.ph === 1 && e.hp <= e.maxHp * CM.floorP1 + 0.01) { setMode(e, 'lament', CM.p2.lament); W.sound('lament'); W.say && W.say('p2', e.x, e.y); return; }
  return think(e, S, dt, heroes, tgt, W);
}
function landY(S, x) { const sec = S.G.secs.find(s => x >= s.px0 && x < s.px1); if (sec && S.fallen.has(S.G.secs.indexOf(sec))) return S.G.floorY + 40; return S.G.floorY; }
function nextKnot(S, heroes) { const ks = S.G.knots; let best = (S.knot + 1) % ks.length, bd = -1;
  ks.forEach((k, i) => { if (i === S.knot) return; const d = heroes && heroes.length ? Math.min(...heroes.filter(h => h.alive).map(h => Math.abs(h.x - k.x)).concat([1e9])) : i; if (d > bd) { bd = d; best = i; } }); return best; }
function think(e, S, dt, heroes, tgt, W) {
  if (!tgt) return;
  const dx = tgt.x - e.x, ad = Math.abs(dx);
  /* she hangs: she walks her line along the roof toward the nearest hero */
  e.face = Math.sign(dx) || e.face || 1; e.x += Math.sign(dx) * Math.min(ad, CM.speed * dt); e.x = Math.max(S.G.x0 + 40, Math.min(S.G.x1 - 40, e.x)); e.y = S.G.hangY;
  if (S.cd.pounce <= 0 && ad < 60) { setMode(e, 'pounceTell', CM.pounce.tell); S.shadow = { x: tgt.x }; W.sound('pounceTell'); W.mark && W.mark('!!', e); return; }
  if (S.cd.sweep <= 0 && ad < CM.sweep.reach * 0.8 && tgt.ground) { setMode(e, 'sweepTell', CM.sweep.tell); e.sweepDir = Math.sign(dx) || 1; W.sound('sweepTell'); W.mark && W.mark('!!', e); return; }
  if (S.cd.clutch <= 0 && S.sacs.filter(s => !s.dead).length < CM.clutch.max) { setMode(e, 'clutchTell', CM.clutch.tell); W.sound('clutchTell'); W.mark && W.mark('!!', e); return; }
  if (S.cd.spit <= 0 && ad < 260) { setMode(e, 'spitTell', CM.spit.tell); e.spitAt = { x: tgt.x, y: tgt.y - 10 }; W.sound('spitTell'); W.mark && W.mark('!', e); return; }
}
/* a move in hand: its windup runs out, it lands */
function stepMove(e, S, dt, heroes, W) {
  if (e.modeT > 0) return;
  const back = () => setMode(e, 'hang', 0.3);
  switch (e.mode) {
    case 'spitTell': { setMode(e, 'spit', 0.25); W.sound('spit'); S.n.spits++; const a = e.spitAt || { x: e.x, y: S.G.floorY }, dx = a.x - e.x, dy = a.y - (e.y + 8), d = Math.hypot(dx, dy) || 1;
      S.globs.push({ x: e.x, y: e.y + 8, vx: dx / d * CM.spit.speed, vy: dy / d * CM.spit.speed, t: CM.spit.life, key: 'sp' + S.n.spits }); return; }
    case 'spit': S.cd.spit = CM.spit.cd * cdk(S); back(); return;
    case 'pounceTell': setMode(e, 'pounce', 0); if (S.shadow) e.x = S.shadow.x; W.sound('pounce'); return;
    case 'clutchTell': { setMode(e, 'clutch', 0.3); W.sound('clutch'); S.n.clutches++; const tgt = near(heroes, e.x), x = tgt ? tgt.x + (tgt.x < e.x ? 40 : -40) : e.x;
      S.sacs.push({ x: Math.max(S.G.x0 + 24, Math.min(S.G.x1 - 24, x)), y: S.G.floorY, t: CM.clutch.hatch, dead: false, key: 'sc' + S.n.clutches }); return; }
    case 'clutch': S.cd.clutch = CM.clutch.cd * cdk(S); back(); return;
    case 'sweepTell': { setMode(e, 'sweep', CM.sweep.act); W.sound('sweep'); S.n.sweeps++;
      for (const h of heroes) if (h.alive && h.ground && Math.abs(h.x - e.x) < CM.sweep.reach && h.y > e.y + 20) { S.n.sweepHits++; W.hitHero(h, CM.sweep.dmg, 'sweep', 'sw' + S.n.sweeps + ':' + h.id, { low: true }); } return; }
    case 'sweep': S.cd.sweep = CM.sweep.cd * cdk(S); back(); return;
  }
}
function stepGlobs(S, dt, heroes, W) {
  for (const g of S.globs) { g.x += g.vx * dt; g.y += g.vy * dt; g.t -= dt;
    for (const h of heroes) if (h.alive && !g.hit && Math.abs(h.x - g.x) < CM.spit.r && g.y > h.y - 24 && g.y < h.y + 2) { g.hit = true; g.t = 0; const r = W.hitHero(h, CM.spit.dmg, 'spit', g.key + ':' + h.id, { blockable: true, snare: CM.spit.snare }); if (r !== 'blocked') S.n.spitHits++; }
    if (W.solidAt && W.solidAt(g.x, g.y)) g.t = 0; }
  S.globs = S.globs.filter(g => g.t > 0);
}
function stepSacs(S, dt, W) { for (const s of S.sacs) { if (s.dead) continue; s.t -= dt; if (s.t <= 0) { s.dead = true; S.n.hatched += CM.clutch.n; W.spawnLings && W.spawnLings(s.x, s.y, CM.clutch.n); W.sound('hatch'); W.say && W.say('hatch', s.x, s.y); } } }
/* P2: one floor strand at a time, told, never below CM.p2.keep standing */
function stepCollapse(e, S, dt, heroes, W) {
  if (S.flash) { S.flash.t -= dt; if (S.flash.t <= 0) { S.fallen.add(S.flash.i); S.n.collapses++; W.dropSec && W.dropSec(S.flash.i); W.sound('collapse'); S.flash = null; S.collapseT = CM.p2.every; } return; }
  if (['lament', 'sleep'].includes(e.mode)) return;
  S.collapseT -= dt; if (S.collapseT > 0) return;
  const standing = S.G.secs.map((s, i) => i).filter(i => !S.fallen.has(i)); if (standing.length <= CM.p2.keep) { S.collapseT = 1e9; return; }
  const tgt = near(heroes, e.x), cx = tgt ? tgt.x : e.x;   /* the strand nearest her prey */
  const i = standing.sort((a, b) => Math.abs((S.G.secs[a].px0 + S.G.secs[a].px1) / 2 - cx) - Math.abs((S.G.secs[b].px0 + S.G.secs[b].px1) / 2 - cx))[0];
  S.flash = { i, t: CM.p2.flash }; W.sound('flash'); W.say && W.say('falls', (S.G.secs[i].px0 + S.G.secs[i].px1) / 2, S.G.floorY - 20); W.mark && W.mark('!!', { x: (S.G.secs[i].px0 + S.G.secs[i].px1) / 2, y: S.G.floorY + 20 });
}
