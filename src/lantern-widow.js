/* src/lantern-widow.js - THE LANTERN WIDOW, WISPWOOD's boss (claude/wispwood, the OPUS GREYBOX; brief-wispwood-1108.md, Daniel's pick). THE FIGHT, PURE: no canvas,
   no page, no main.js. src/lantern-widow-hands.js binds it to the world (the heroes' lanterns through src/wispwood-hands.js, the rim lamps, the hurt) and draws it;
   tools/wispwood.mjs fights it.
   A ghost bride who carries the wood's great lantern. She was to be married in this glade; she keeps every light that comes into it.
   THE ARENA: THE WIDOW'S GLADE - two banks, the black mere between them under a pale bridge, pale tiers (rows 29 / 26 / the high perch 23), four lamps on the rim.
   THE RULE OF THE FIGHT (B14): SHE TAKES YOUR LIGHT. Told 1.2 s (she beckons; every lantern's flame leans toward her): every hero's lantern and every rim lamp goes out,
     the glade goes dark, and she flies to a perch. The pale tiers and the bridge are real only in HER glow now - climb to her. STRIKE HER LANTERN while she holds
     the stolen light: every flame comes home and SHE REELS - OPEN x2 for WD.reclaim.open s (capped WD.openCap of her per opening).
     P1: not reclaimed in WD.theft.drown s, she drowns it - the flames go to the rim lamps (relight by touch).
   P1 (100% -> 50%), the glade lit between thefts:
     VEIL SWEEP     told 0.6 s (the veil drawn back, yellow !), a wide sweep - blockable
     THE WAIL       told 0.9 s (her mouth opens, red !!): a ring runs out along the ground to WD.wail.r - jump it. It snuffs the rim lamps it passes
     SHADOW HANDS   told 1.0 s (she sinks a hand into the ground, red !!): three ripples at and beside each hero, then hands erupt - move off them
     SHE TAKES YOUR LIGHT   every WD.theft.every s (the first at WD.theft.first after she wakes)
   P2 (50% -> 0) SHE TAKES ALL THE LIGHT: told 2.0 s (the lament; still x0.45 - never untouchable), then the glade stays dark. A reclaim lights it for WD.p2.lit s (with
     the opening) before she takes it again (told). Two FALSE LIGHTS orbit her (struck: popped - nothing; they glow, so they hold the tiers too). She adds:
     THE WEDDING MARCH  told 1.2 s (a bell, red !! at the far wall): a low procession of mourners sweeps the glade's floor wall to wall - jump it, or stand on a lit tier
   B15: x0.45 outside an opening (P1, P2, the lament), x2 in one (capped); never untouchable. P1 cannot pass 50% (the floor holds until her move in hand ends).
   Every move: its own windup pose, release pose, sound (POSE, src/lantern-widow-hands.js). */

export const WD = {
  hp: 4000, w: 14, h: 30, markH: 46, speed: 70, hover: 12,
  resist: 0.55, openMul: 2, openCap: 0.16, floorP1: 0.5,
  veil: { tell: 0.6, act: 0.18, reach: 44, dmg: 28, cd: 1.0 },
  wail: { tell: 0.9, act: 0.7, r: 160, band: 20, dmg: 34, cd: 4.5 },
  hands: { tell: 1.0, rise: 0.8, n: 3, spread: 40, w: 12, dmg: 25, hold: 0.5, cd: 5.0 },
  theft: { tell: 1.2, every: 20, first: 5, drown: 16 },
  reclaim: { open: 4.5, r: 14, lanternDx: 12, lanternDy: 16 },
  perch: { glide: 1.0, stay: 4.5 },
  lament: 2.0,
  p2: { lit: 14 },
  march: { tell: 1.2, speed: 150, h: 20, dmg: 25, cd: 8 },
  falseLight: { n: 2, orbit: 38, glow: 44 },
  glow: 96, glowStolen: 120,
};
const OPEN_MODES = new Set(['reel']);
export const wdOpen = e => !!e && OPEN_MODES.has(e.mode) && e.modeT > 0;
export const OPEN_NAME = { reel: 'RECLAIMED' };
export const lanternAt = e => ({ x: e.x + (e.face || 1) * WD.reclaim.lanternDx, y: e.y - WD.reclaim.lanternDy });

/* THE ARENA'S GEOMETRY from the built level (src/wispwood.js) */
export function geom(L, TS = 16) {
  const A = L.arena;
  return { x0: A.x0, x1: A.x1, floorY: A.floor, perches: A.perches.map(p => ({ ...p })), mere: A.mere.slice(), lamps: A.lamps.slice(), TS };
}
export function newFight(G) {
  return { G, ph: 1, stolen: false, stolenT: 0, litT: 0, perchI: -1, perchT: 0, rings: [], spots: [], marches: [], falses: [], openDealt: 0, opens: 0,
    cd: { veil: 0.8, wail: 3.0, hands: 4.5, theft: WD.theft.first, march: 3.0 }, told: {},
    n: { veils: 0, wails: 0, handsCast: 0, thefts: 0, reclaims: 0, drowns: 0, marches: 0, opens: 0, openHits: 0, veilHits: 0, popped: 0 }, hurt: {}, won: false };
}
const near = (heroes, x) => heroes.filter(h => h.alive).sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x))[0] || null;
const setMode = (e, m, t) => { e.mode = m; e.modeT = t; e.modeT0 = t; };
export const glowOf = (e, S) => (S.stolen ? WD.glowStolen : WD.glow);

/* A BLOW ON HER: [damage, word]. Open x2 (capped per opening), x0.45 otherwise; P1 cannot pass 50% */
export function takeBlow(e, S, dmg) {
  let d, word = null;
  if (wdOpen(e)) { const cap = WD.openCap * e.maxHp, room = cap - S.openDealt; d = dmg * WD.openMul <= room ? dmg * WD.openMul : Math.max(dmg * WD.resist, room); S.openDealt = Math.min(cap, S.openDealt + d); S.n.openHits++; }
  else { d = dmg * WD.resist; word = 'VEIL'; }
  if (S.ph === 1 && e.hp - d < e.maxHp * WD.floorP1) { d = Math.max(0, e.hp - e.maxHp * WD.floorP1); if (!S.told.holds) { S.told.holds = 1; word = 'HOLDS'; } }
  return [Math.round(d * 100) / 100, word];
}
/* RECLAIM: a hero's blow on her lantern while she holds the stolen light. Returns 'reclaimed' | 'nothing' */
export function reclaim(e, S, W) {
  if (!S.stolen || !e.alive || e.mode === 'theftTell' || e.mode === 'lament') return 'nothing';
  S.stolen = false; S.stolenT = 0; S.n.reclaims++; S.opens++; S.n.opens++; S.openDealt = 0; S.rings = []; S.spots = []; S.marches = [];
  W.giveAll && W.giveAll(); W.sound('reclaim'); W.say && W.say('reclaim', e.x, e.y); W.fx && W.fx('open', e.x, e.y);
  if (S.ph === 2) S.litT = WD.p2.lit + WD.reclaim.open;
  S.cd.theft = Math.max(S.cd.theft, WD.theft.every * 0.6);
  setMode(e, 'reel', WD.reclaim.open); return 'reclaimed';
}
/* a FALSE LIGHT struck */
export function popFalse(S, i, W) { const f = S.falses[i]; if (!f || f.dead) return false; f.dead = true; S.n.popped++; W.say && W.say('falseLight', f.x, f.y); W.sound('pop'); return true; }

/* ONE STEP. heroes: [{ x, y, alive, ground, pp, id }]. W: the world (src/lantern-widow-hands.js, or the test's fake) */
export function step(e, S, dt, heroes, W) {
  if (!e.alive) return;
  for (const k in S.cd) S.cd[k] = Math.max(0, S.cd[k] - dt);
  e.modeT -= dt;
  stepRings(e, S, dt, heroes, W); stepSpots(S, dt, heroes, W); stepMarches(S, dt, heroes, W); stepFalses(e, S, dt);
  if (S.stolen) { S.stolenT += dt; if (S.ph === 1 && S.stolenT >= WD.theft.drown && !/Tell$/.test(e.mode)) { S.stolen = false; S.stolenT = 0; S.n.drowns++; W.drown && W.drown(); W.say && W.say('drown', e.x, e.y); S.cd.theft = WD.theft.every; } }
  else if (S.ph === 2 && S.litT > 0) S.litT -= dt;
  const tgt = near(heroes, e.x);
  switch (e.mode) {
    case 'sleep': return;
    case 'wake': if (e.modeT <= 0) setMode(e, 'drift', 0.4); return;
    case 'reel': e.y += ((S.G.floorY - 4) - e.y) * Math.min(1, dt * 3); if (e.modeT <= 0) { setMode(e, 'drift', 0.4); W.sound('rise'); } return;
    case 'glide': { const P = S.G.perches[S.perchI], k = 1 - Math.max(0, e.modeT) / WD.perch.glide; e.x = e.gx0 + (P.x - e.gx0) * k; e.y = e.gy0 + (P.y - e.gy0) * k;
      if (e.modeT <= 0) { e.x = P.x; e.y = P.y; S.perchT = WD.perch.stay; setMode(e, 'perch', 0.2); } return; }
    case 'lament': if (e.modeT <= 0) { S.ph = 2; e.phase = 2; S.falses = Array.from({ length: WD.falseLight.n }, (_, i) => ({ a: i * Math.PI, x: e.x, y: e.y, dead: false }));
      W.music && W.music(2); takeLight(e, S, W, true); } return;
  }
  if (/Tell$|^veil$|^wail$|^hands$|^march$/.test(e.mode)) { if (e.modeT <= 0) stepMove(e, S, dt, heroes, W); return; }
  /* P1 -> P2: at the floor, once the move in hand is done */
  if (S.ph === 1 && e.hp <= e.maxHp * WD.floorP1 + 0.01) { if (S.stolen) { S.stolen = false; W.giveAll && W.giveAll(); } setMode(e, 'lament', WD.lament); W.sound('lament'); W.say && W.say('theftAll', e.x, e.y); return; }
  return think(e, S, dt, heroes, tgt, W);
}
function takeLight(e, S, W, all) {
  S.stolen = true; S.stolenT = 0; S.n.thefts++; S.cd.theft = WD.theft.every; W.stealAll && W.stealAll(); W.snuffLamps && W.snuffLamps(); W.sound('theft'); W.say && W.say(all ? 'theftAll' : 'theft', e.x, e.y);
  if (S.ph === 2) for (const f of S.falses) f.dead = false;
  flyToPerch(e, S, null);
}
function flyToPerch(e, S, heroes) {
  const ps = S.G.perches; let best = 0, bd = -1;
  const mA = S.G.mere[0], mB = S.G.mere[1], sideOf = x => x < (mA + mB) / 2 - 60 ? -1 : x > (mA + mB) / 2 + 60 ? 1 : 0, heroSide = x => x < mA + 16 ? -1 : x > mB - 16 ? 1 : 0, hs = heroes && heroes.length ? (heroes.filter(h => h.alive).map(h => heroSide(h.x))[0] || 0) : 0;   /* (claude/nighthands) she flies far, but to a perch on the hero's own bank (or the high middle one): the pale tiers are real only in her glow (120 px), so a perch across the mere (the farthest one, as it was) cannot be climbed to - the bot sat 60 s on the left bank while she cycled the right tiers */
  ps.forEach((p, i) => { if (i === S.perchI) return; if (hs !== 0 && sideOf(p.x) !== hs) return; const d = heroes && heroes.length ? Math.min(...heroes.filter(h => h.alive).map(h => Math.abs(h.x - p.x))) : (i * 37) % 97; if (d > bd) { bd = d; best = i; } });
  if (bd < 0) { best = (S.perchI + 1) % ps.length; }   /* (no perch on that bank but the one she is on: the next) */
  S.perchI = best; e.gx0 = e.x; e.gy0 = e.y; setMode(e, 'glide', WD.perch.glide);
}
function think(e, S, dt, heroes, tgt, W) {
  if (!tgt) { setMode(e, 'drift', 0.3); return; }
  const dx = tgt.x - e.x, ad = Math.abs(dx);
  /* THE THEFT: P1 on its clock; P2 when the reclaimed light runs out */
  if (!S.stolen && ((S.ph === 1 && S.cd.theft <= 0) || (S.ph === 2 && S.litT <= 0))) { setMode(e, 'theftTell', WD.theft.tell); W.sound('theftTell'); W.mark && W.mark('!!', e); return; }
  if (S.stolen) {   /* she holds your light: from her perch, moving on when she has stayed */
    if (e.mode === 'perch') { S.perchT -= dt; if (S.perchT <= 0) { flyToPerch(e, S, heroes); return; } }
    else if (e.mode !== 'glide') { flyToPerch(e, S, heroes); return; }
  } else {   /* the glade is lit: she drifts at the nearest hero */
    e.face = Math.sign(dx) || e.face || 1; e.x += Math.sign(dx) * Math.min(ad, WD.speed * dt); e.x = Math.max(S.G.x0 + 12, Math.min(S.G.x1 - 12, e.x));
    e.y += ((tgt.y - WD.hover) - e.y) * Math.min(1, dt * 2.5); }
  if (ad < WD.veil.reach + 4 && S.cd.veil <= 0 && Math.abs(tgt.y - e.y) < 40) { e.face = Math.sign(dx) || e.face; setMode(e, 'veilTell', WD.veil.tell); W.sound('veilTell'); W.mark && W.mark('!', e); return; }
  if (S.ph === 2 && S.cd.march <= 0) { setMode(e, 'marchTell', WD.march.tell); e.marchDir = tgt.x < (S.G.x0 + S.G.x1) / 2 ? -1 : 1; W.sound('marchTell'); W.mark && W.mark('!!', e); return; }
  if (S.cd.wail <= 0 && ad < WD.wail.r) { setMode(e, 'wailTell', WD.wail.tell); W.sound('wailTell'); W.mark && W.mark('!!', e); return; }
  if (S.cd.hands <= 0) { setMode(e, 'handsTell', WD.hands.tell); W.sound('handsTell'); W.mark && W.mark('!!', e);
    for (const h of heroes) if (h.alive) for (let i = 0; i < WD.hands.n; i++) S.spots.push({ x: h.x + (i - (WD.hands.n - 1) / 2) * WD.hands.spread, y: h.y, t: WD.hands.tell + WD.hands.rise, key: 'hd' + (S.n.handsCast + 1) + ':' + h.id + ':' + i });
    return; }
  if (!S.stolen && e.mode !== 'drift') setMode(e, 'drift', 0.3);
}
/* a move in hand: its windup runs out, it lands */
function stepMove(e, S, dt, heroes, W) {
  if (e.modeT > 0) return;
  const back = () => setMode(e, S.stolen ? 'perch' : 'drift', 0.3);
  switch (e.mode) {
    case 'theftTell': takeLight(e, S, W, false); return;
    case 'veilTell': setMode(e, 'veil', WD.veil.act); W.sound('veil'); S.n.veils++;
      for (const h of heroes) if (h.alive && Math.sign(h.x - e.x) === e.face && Math.abs(h.x - e.x) < WD.veil.reach && Math.abs(h.y - e.y) < 40) { S.n.veilHits++; W.hitHero(h, WD.veil.dmg, 'veil', 'veil' + S.n.veils, { blockable: true }); } return;
    case 'veil': S.cd.veil = WD.veil.cd; back(); return;
    case 'wailTell': setMode(e, 'wail', WD.wail.act); W.sound('wail'); S.n.wails++; S.rings.push({ x: e.x, y: e.y, t: 0, key: 'wl' + S.n.wails, hit: new Set(), snuffed: new Set() }); return;
    case 'wail': S.cd.wail = WD.wail.cd; back(); return;
    case 'handsTell': setMode(e, 'hands', 0.4); W.sound('hands'); S.n.handsCast++; return;
    case 'hands': S.cd.hands = WD.hands.cd; back(); return;
    case 'marchTell': setMode(e, 'march', 0.4); W.sound('march'); S.n.marches++; const d = e.marchDir || 1;
      S.marches.push({ x: d > 0 ? S.G.x0 : S.G.x1, dir: d, key: 'mr' + S.n.marches }); return;
    case 'march': S.cd.march = WD.march.cd; back(); return;
  }
}
function stepRings(e, S, dt, heroes, W) {
  for (const r of S.rings) { r.t += dt; const rad = WD.wail.r * Math.min(1, r.t / WD.wail.act);
    for (const h of heroes) { if (!h.alive || !h.ground || r.hit.has(h.id) || Math.abs(h.y - r.y) > 120) continue; if (Math.abs(Math.abs(h.x - r.x) - rad) < WD.wail.band / 2) { r.hit.add(h.id); W.hitHero(h, WD.wail.dmg, 'wail', r.key + ':' + h.id, {}); } }
    if (W.lampsNear) for (const id of W.lampsNear(r.x, rad)) if (!r.snuffed.has(id)) { r.snuffed.add(id); W.snuff && W.snuff(id); } }
  S.rings = S.rings.filter(r => r.t < WD.wail.act);
}
function stepSpots(S, dt, heroes, W) {
  for (const s of S.spots) { const was = s.t; s.t -= dt;
    if (was > 0.15 && s.t <= 0.15) { for (const h of heroes) if (h.alive && Math.abs(h.x - s.x) < WD.hands.w && Math.abs(h.y - s.y) < 24) { W.hitHero(h, WD.hands.dmg, 'hands', s.key, { hold: WD.hands.hold }); } } }
  S.spots = S.spots.filter(s => s.t > 0);
}
function stepMarches(S, dt, heroes, W) {
  for (const m of S.marches) { m.x += m.dir * WD.march.speed * dt;
    for (const h of heroes) if (h.alive && Math.abs(h.x - m.x) < 10 && h.y > S.G.floorY - WD.march.h && h.y <= S.G.floorY + 4) W.hitHero(h, WD.march.dmg, 'march', m.key + ':' + h.id, {}); }
  S.marches = S.marches.filter(m => m.x >= S.G.x0 - 4 && m.x <= S.G.x1 + 4);
}
function stepFalses(e, S, dt) { for (const f of S.falses) { f.a += dt * 1.6; f.x = e.x + Math.cos(f.a) * WD.falseLight.orbit; f.y = e.y - 14 + Math.sin(f.a) * WD.falseLight.orbit * 0.6; } }
