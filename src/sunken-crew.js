// src/sunken-crew.js - THE SUNKEN CREW -> THE CURSED SAILOR (claude/deep3): THE DEEP 3's boss. Daniel's own design (scratch/brief-sunkencrew.md, 10-08), the 11-05
// water plan's line on it (4 crew, shared bar, 10-s soul-lantern revive, P2 stance swaps = gold windows). PURE: no canvas, no main.js; src/deep3-hands.js binds it
// (the shriek sisters' anchor pattern: ONE boss, the ANCHOR, whose bar is the crew's health together; the crew are bodies a blade can find).
//
// PHASE 1 - THE SUNKEN CREW: four drowned sailors, each his own bar, sharing ~600. They SWIM after you, slowly. AT MOST TWO ATTACK AT ONCE (two attack tokens);
//   the rest circle. Two told moves each (every move its own windup pose + release pose + sound - POSE names below):
//     CUTLASS   LUNGE ! (a dash along his line - block it)            FLURRY ! (three quick cuts - block them)
//     SHIELD    SHIELD BASH ! (a short shove - block it, no knock)    HOLD THE LINE (he guards a mate: blows on that mate land at the 0.4 floor; strike HIM to break it)
//     HARPOON   HARPOON THROW !! (aimed where you are GOING - dodge)  REEL ! (a hit drags you to the crew - block it, or dodge it)
//     HEAVY     ANCHOR SLAM !! (a shockwave along the floor - jump / swim up)   GUT CHARGE ! (a slow bull rush - block it: he staggers)
//   THE TEN-SECOND RULE: a fallen sailor's corpse sinks and a SOUL LANTERN rises over it with a ten-second ring. When it burns out, a living mate swims over and
//   RAISES him (told: 1.6 s, he kneels and the lantern pulses); a blow on the raiser breaks it off (he reels, then tries again). Fell all four (every lantern lit
//   at once) and the souls go up together: PHASE 2. Kill order is the puzzle: chip them all low, then fell them in a row.
// PHASE 2 - THE CURSED SAILOR (~600): the four souls merge into one drowned giant. Four STANCES (cutlass / shield / harpoon / anchor), that stance's two moves;
//   the SWAP is told (swapTell) and its moment is a GOLD STAGGER WINDOW; a REEL that misses leaves the harpoon STUCK in the floor = OPEN while he hauls it free;
//   a told WARD after every opening.
// B15 - NO INVULNERABILITY ANYWHERE. Crew: whole (1.0), the shield-man's FRONT 0.5, a GUARDED mate 0.4 (never lower), a broken guard 1.5. A lantern window makes
//   nobody immune: the living fight on at their own numbers. The merge takes blows at the 0.4 floor. The Sailor: 0.75 outside openings, 0.4 on his ward / shield
//   front, 1.5 in an opening. tools/deep3.mjs walks every mode and asserts the floor.

export const CREW = {
  /* THE BRIEF said ~600 + ~600, from the Diving Bell's 740 - but the Bell took most blows SHUT (x0.4); the crew have no shell. x1.6 (the lane's placeholder, Q2): */
  hp: { cutlass: 225, shield: 270, harpoon: 210, heavy: 255 }, sailorHp: 960,
  speed: { cutlass: 46, shield: 38, harpoon: 40, heavy: 30 },
  w: 18, h: 26, sailor: { w: 34, h: 46, speed: 34 },
  tokens: 2, atkCd: [2.2, 3.6], circle: [84, 120],
  lantern: { t: 10, raise: 1.6, reel: 1.0, rise: 0.4 },   /* the ring, the raising, the raiser's reel when struck; the raised come back at `rise` of their max */
  resist: { front: 0.5, guarded: 0.4, broken: 1.5, merge: 0.4, sailor: 0.75, ward: 0.4, open: 1.5, floor: 0.4 },
  moves: {
    lunge:  { tell: 0.55, act: 0.45, rec: 0.6, dmg: 12, speed: 300, block: true, mark: '!' },
    flurry: { tell: 0.5, act: 0.6, rec: 0.7, dmg: 6, hits: 3, range: 30, block: true, mark: '!' },
    bash:   { tell: 0.6, act: 0.3, rec: 0.7, dmg: 10, speed: 230, block: true, mark: '!' },
    guard:  { tell: 0.6, act: 4.0, rec: 0.4, breakHits: 3, broken: 2.0, cd: 7, mark: '' },
    throw:  { tell: 0.7, act: 0.0, rec: 0.6, dmg: 12, speed: 330, lead: 0.4, block: false, mark: '!!' },
    reel:   { tell: 0.6, act: 0.0, rec: 0.8, dmg: 6, speed: 300, pull: 90, block: true, mark: '!' },
    slam:   { tell: 0.85, act: 0.9, rec: 0.9, dmg: 16, wave: 14, waveV: 200, waveH: 18, block: false, mark: '!!' },
    charge: { tell: 0.8, act: 1.4, rec: 0.9, dmg: 14, speed: 170, block: true, stagger: 0.8, mark: '!' },
  },
  kit: { cutlass: ['lunge', 'flurry'], shield: ['bash', 'guard'], harpoon: ['throw', 'reel'], heavy: ['slam', 'charge'] },
  merge: 1.8,
  p2: { swapTell: 0.8, swap: 1.4, ward: 1.2, stuck: 2.2, perStance: 3, gap: [0.9, 1.5], scale: 1.4, guardHold: 3.0 },
  wake: 1.6,
};
export const ROLES = ['cutlass', 'shield', 'harpoon', 'heavy'];
export const STANCE_OF = { cutlass: 'cutlass', shield: 'shield', harpoon: 'harpoon', heavy: 'anchor' };
export const NAME = { cutlass: 'THE CUTLASS', shield: 'THE SHIELD', harpoon: 'THE HARPOONER', heavy: 'THE HEAVY', sailor: 'THE CURSED SAILOR' };
export const MOVE_NAME = { lunge: 'LUNGE', flurry: 'FLURRY', bash: 'SHIELD BASH', guard: 'HOLD THE LINE', throw: 'HARPOON THROW', reel: 'REEL', slam: 'ANCHOR SLAM', charge: 'GUT CHARGE' };
export const SAY = { wake: 'THE SALT WIDOW\'S CREW', rule: 'FELL THEM ALL BEFORE A LANTERN GOES OUT', lantern: 'A SOUL LANTERN: 10 SECONDS', raise: 'HE RAISES HIM', broke: 'BROKEN OFF',
  risen: 'BACK UP', guard: 'HOLD THE LINE', guardBroke: 'HIS SHIELD BREAKS', merge: 'THE SOULS GO UP TOGETHER', sailor: 'THE CURSED SAILOR', swap: 'HE CHANGES HIS GRIP', stuck: 'STUCK FAST',
  ward: 'WARDED', front: 'SHIELDED', guarded: 'GUARDED' };
/* THE POSE every mode wears (the art lane's names: windup + release per move, B16) */
export const POSE = { sleep: 'crewSleep', wake: 'crewWake', circle: 'crewSwim', approach: 'crewSwim', lungeTell: 'cutLungeWind', lunge: 'cutLungeRel', flurryTell: 'cutFlurryWind', flurry: 'cutFlurryRel',
  bashTell: 'shBashWind', bash: 'shBashRel', guardTell: 'shGuardWind', guard: 'shGuardHold', throwTell: 'hpThrowWind', throw: 'hpThrowRel', reelTell: 'hpReelWind', reel: 'hpReelRel',
  slamTell: 'hvSlamWind', slam: 'hvSlamRel', chargeTell: 'hvChargeWind', charge: 'hvChargeRel', rec: 'crewRecover', reeling: 'crewReel', toRaise: 'crewSwimFast', raise: 'crewRaise',
  fallen: 'crewCorpse', broken: 'shBroken', staggered: 'crewStagger', merge: 'sailorMerge', swapTell: 'sailorSwapWind', swap: 'sailorSwapStagger', stuck: 'sailorStuck', dead: 'sailorFall' };

const rnd = (S, a, b) => a + (b - a) * S.rng();
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
/* the stage: px; floor = the arena floor's top; top = the cavern's ceiling */
export function geom(st) { return { x0: st.x0, x1: st.x1, floor: st.floor, top: st.top, mid: (st.x0 + st.x1) / 2 }; }
function seeded(seed) { let s = (seed >>> 0) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }

export function newFight(G, seed = 7) {
  const S = { G, ph: 1, t: 0, woke: false, rng: seeded(seed), crew: {}, lanterns: [], shots: [], waves: [], tokens: 0, sailor: null, mergeT: 0, told: {},
    n: { falls: 0, raises: 0, broken: 0, guards: 0, guardBreaks: 0, swaps: 0, stuck: 0, openHits: 0, wardHits: 0, flooredHits: 0, moves: {} } };
  ROLES.forEach((r, i) => { S.crew[r] = { role: r, x: G.x0 + (G.x1 - G.x0) * (0.3 + 0.14 * i), y: G.floor, vx: 0, vy: 0, hp: CREW.hp[r], maxHp: CREW.hp[r], alive: true, fallen: false,
    mode: 'sleep', modeT: 0, face: -1, token: false, atkCd: 1.2 + i * 0.7, move: null, key: 0, guarding: null, guardHits: 0, guardCd: 3, orbit: i * 1.6, hits: 0 }; });
  return S;
}
export const crewOf = S => ROLES.map(r => S.crew[r]);
export const living = S => crewOf(S).filter(c => c.alive);
/* the anchor's health: the living crew (phase 1) + the Sailor's, or the Sailor's alone (phase 2) */
export function totalHp(S) { return S.ph === 1 ? living(S).reduce((n, c) => n + c.hp, 0) + CREW.sailorHp * (S.k || 1) : Math.max(0, S.sailor ? S.sailor.hp : 0); }
/* THE GAME'S SCALING on the anchor (road tier, difficulty): k shares it out - every crewman and the Sailor by the same factor */
export function scale(S, k) { S.k = k; for (const c of crewOf(S)) { c.maxHp = Math.round(c.maxHp * k); c.hp = c.maxHp; } }
export const sailorMax = S => Math.round(CREW.sailorHp * (S.k || 1));

/* IS HE OPEN? (gold read) */
export const crewOpen = c => c.mode === 'broken' || (c.mode === 'staggered' && c.why === 'charge');
export const sailorOpen = s => !!s && (s.mode === 'swap' || s.mode === 'stuck' || s.mode === 'broken');
/* the shield-man guarding this crewman (alive, guarding, not broken) */
const guardOf = (S, c) => { const sh = S.crew.shield; return sh.alive && sh.mode === 'guard' && sh.guarding === c.role && c.role !== 'shield' ? sh : null; };

/* A BLOW ON A CREWMAN: [dmg, word]. fromX: where the blow came from */
export function takeCrew(S, c, dmg, fromX) {
  if (!c.alive) return [0, null];
  let k = 1, word = null;
  if (c.role === 'shield' && c.mode === 'guard') c.guardHits++;   /* every blow on him while he holds the line counts toward breaking it */
  if (guardOf(S, c)) { k = CREW.resist.guarded; word = SAY.guarded; }
  else if (c.role === 'shield' && c.mode === 'broken') k = CREW.resist.broken;
  else if (crewOpen(c)) k = CREW.resist.broken;
  else if (c.role === 'shield' && c.mode !== 'fallen' && Math.sign(fromX - c.x) === c.face && c.mode !== 'guard') { k = CREW.resist.front; word = SAY.front; }
  k = Math.max(CREW.resist.floor, k);
  const d = Math.max(1, Math.round(dmg * k));
  if (word) S.n.flooredHits++;
  return [d, word];
}
/* A BLOW ON THE SAILOR (or on the merge) */
export function takeSailor(S, dmg, fromX) {
  const s = S.sailor; if (!s) return [Math.max(1, Math.round(dmg * CREW.resist.merge)), SAY.ward];
  let k = CREW.resist.sailor, word = null;
  if (s.mode === 'merge') { k = CREW.resist.merge; word = SAY.ward; }
  else if (sailorOpen(s)) { k = CREW.resist.open; S.n.openHits++; }
  else if (s.ward > 0) { k = CREW.resist.ward; word = SAY.ward; S.n.wardHits++; }
  else if (s.stance === 'shield' && s.mode === 'guard' && Math.sign(fromX - s.x) === s.face) { k = CREW.resist.ward; word = SAY.front; s.guardHits++; }
  k = Math.max(CREW.resist.floor, k);
  return [Math.max(1, Math.round(dmg * k)), word];
}

/* hero box (feet x,y): 10 x 14 */
const heroBox = h => ({ l: h.x - 5, r: h.x + 5, t: h.y - 14, b: h.y });
const over = (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
const bodyBox = (c, w = CREW.w, h = CREW.h) => ({ l: c.x - w / 2, r: c.x + w / 2, t: c.y - h, b: c.y });
const nearest = (hs, x, y) => hs.filter(h => h.alive).sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0] || null;

/* ---- THE MOVES (shared by the crew and the Sailor: `who` is either; sc = the Sailor's reach / damage scale) ---- */
function startMove(S, who, mv, h, w) {
  const M = CREW.moves[mv]; who.move = mv; who.mode = mv + 'Tell'; who.modeT = M.tell; who.key++; who.hit = 0;
  who.face = h ? (Math.sign(h.x - who.x) || who.face) : who.face; who.aim = h ? { x: h.x + (mv === 'throw' ? (h.vx || 0) * M.lead : 0), y: h.y - 7 } : null;
  S.n.moves[mv] = (S.n.moves[mv] || 0) + 1;
  if (M.mark) w.mark && w.mark(who, M.mark); w.sound && w.sound(mv + 'Tell');
  if (mv === 'guard') { const mates = living(S).filter(c => c.role !== 'shield' && !c.fallen); const m = mates.sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0]; who.guarding = m ? m.role : null; }
}
function release(S, who, w) {
  const M = CREW.moves[who.move]; who.mode = who.move; who.modeT = M.act; w.sound && w.sound(who.move);
  if (who.move === 'throw' || who.move === 'reel') { const a = who.aim || { x: who.x + who.face * 100, y: who.y - 12 }, ox = who.x + who.face * 10, oy = who.y - (who.sailor ? 30 : 16);
    const d = Math.hypot(a.x - ox, a.y - oy) || 1; S.shots.push({ x: ox, y: oy, vx: (a.x - ox) / d * M.speed, vy: (a.y - oy) / d * M.speed, t: 1.6, kind: who.move, by: who, key: 'hp' + who.key + (who.sailor ? 's' : who.role), sc: who.sailor ? CREW.p2.scale : 1 }); }
  if (who.move === 'slam') { const sc = who.sailor ? CREW.p2.scale : 1; for (const dir of [-1, 1]) S.waves.push({ x: who.x, dir, t: M.act, key: 'wv' + who.key + dir + (who.sailor ? 's' : who.role), sc });
    w.shake && w.shake(5); w.slamAt && w.slamAt(who.x, S.G.floor); }
  if (who.move === 'guard') { S.n.guards++; who.guardHits = 0; w.say && w.say(who.x, who.y - 40, SAY.guard, '#c8d8e8'); }
}
function stepMoveAct(S, who, dt, hs, w) {
  const M = CREW.moves[who.move], sc = who.sailor ? CREW.p2.scale : 1, bw = who.sailor ? CREW.sailor.w : CREW.w, bh = who.sailor ? CREW.sailor.h : CREW.h, G = S.G;
  const hitAll = (box, dmg, key, o = {}) => { for (const h of hs) if (h.alive && over(box, heroBox(h))) { const r = w.hit(h, Math.round(dmg * (who.sailor ? 1.25 : 1)), MOVE_NAME[who.move], key, { blockable: M.block, fromX: who.x, ...o }); if (r) who.hit++; if (r === 'blocked' && o.onBlock) o.onBlock(h); } };
  switch (who.move) {
    case 'lunge': case 'bash': case 'charge': {
      const v = M.speed * (who.move === 'charge' ? 1 : 1); who.x = clamp(who.x + who.face * v * dt, G.x0 + bw / 2, G.x1 - bw / 2);
      if (who.move !== 'charge' && who.aim) who.y = clamp(who.y + Math.sign(who.aim.y + 7 - who.y) * Math.min(Math.abs(who.aim.y + 7 - who.y), 120 * dt), G.top + bh, G.floor);
      hitAll(bodyBox(who, bw + 8, bh), M.dmg, who.move + who.key + (who.sailor ? 's' : who.role), { knock: who.move === 'bash' ? who.face : 0,
        onBlock: who.move === 'charge' ? () => { who.mode = 'staggered'; who.why = 'charge'; who.modeT = M.stagger; w.say && w.say(who.x, who.y - bh - 10, 'BRACED', '#8fd160'); } : null });
      break; }
    case 'flurry': { const i = Math.min(M.hits - 1, Math.floor((M.act - who.modeT) / (M.act / M.hits)));
      const box = { l: who.face > 0 ? who.x : who.x - M.range * sc, r: who.face > 0 ? who.x + M.range * sc : who.x, t: who.y - bh, b: who.y };
      hitAll(box, M.dmg, 'fl' + who.key + '.' + i + (who.sailor ? 's' : who.role)); break; }
    case 'slam': if (who.modeT > M.act - 0.08) hitAll({ l: who.x - 20 * sc, r: who.x + 20 * sc, t: who.y - bh, b: who.y + 4 }, M.dmg, 'sl' + who.key + (who.sailor ? 's' : who.role)); break;
    case 'guard': if (who.sailor) { if (who.guardHits >= CREW.moves.guard.breakHits) { who.mode = 'broken'; who.modeT = 1.2; who.guardHits = 0; S.n.guardBreaks++; w.say && w.say(who.x, who.y - bh - 12, SAY.guardBroke, '#ffd36b'); w.fx && w.fx('open', who.x, who.y - bh / 2); } }
      else { const m = who.guarding && S.crew[who.guarding]; if (!m || !m.alive) who.modeT = 0;
        else { const tx = m.x + (hs[0] ? Math.sign(hs[0].x - m.x) || 1 : 1) * 18; who.x += Math.sign(tx - who.x) * Math.min(Math.abs(tx - who.x), CREW.speed.shield * 1.6 * dt); who.y += Math.sign(m.y - who.y) * Math.min(Math.abs(m.y - who.y), 60 * dt); who.face = Math.sign(m.x - who.x) || who.face; }
        if (who.guardHits >= CREW.moves.guard.breakHits) { who.mode = 'broken'; who.modeT = CREW.moves.guard.broken; who.guarding = null; who.guardHits = 0; S.n.guardBreaks++; w.say && w.say(who.x, who.y - bh - 12, SAY.guardBroke, '#ffd36b'); w.fx && w.fx('open', who.x, who.y - 14); } }
      break;
  }
}
function endMove(S, who, w) { who.mode = 'rec'; who.modeT = CREW.moves[who.move].rec;
  if (who.move === 'guard') who.guarding = null; }

/* ---- PHASE 1: ONE CREWMAN'S STEP ---- */
function stepCrewman(S, c, dt, hs, w) {
  const G = S.G; c.modeT -= dt; c.atkCd -= dt; if (c.role === 'shield') c.guardCd -= dt;
  if (!c.alive) return;
  const h = nearest(hs, c.x, c.y);
  const swimTo = (tx, ty, v) => { const dx = tx - c.x, dy = ty - c.y, d = Math.hypot(dx, dy); if (d > 2) { c.x += dx / d * Math.min(d, v * dt); c.y += dy / d * Math.min(d, v * dt); }
    c.x = clamp(c.x, G.x0 + CREW.w / 2, G.x1 - CREW.w / 2); c.y = clamp(c.y, G.top + CREW.h + 4, G.floor); if (Math.abs(dx) > 3) c.face = Math.sign(dx); };
  const free = () => { if (c.token) { c.token = false; S.tokens--; } };
  switch (c.mode) {
    case 'sleep': return;
    case 'wake': if (c.modeT <= 0) { c.mode = 'circle'; c.modeT = 0; } return;
    case 'circle': case 'approach': {
      if (!h) return;
      const M = CREW.moves; const pick = () => { const kit = CREW.kit[c.role].filter(m => m !== 'guard' || (c.guardCd <= 0 && living(S).some(o => o.role !== 'shield'))); return kit[Math.floor(S.rng() * kit.length)]; };
      if (!c.token && c.atkCd <= 0 && S.tokens < CREW.tokens) { c.token = true; S.tokens++; c.want = pick(); c.mode = 'approach'; c.modeT = 0; }
      if (c.mode === 'approach') { const mv = c.want, M2 = M[mv];
        const want = mv === 'throw' || mv === 'reel' ? 110 : mv === 'guard' ? 9999 : mv === 'slam' ? 26 : mv === 'charge' ? 150 : mv === 'flurry' ? 26 : 70;
        const d = Math.abs(h.x - c.x), dy = Math.abs(h.y - c.y);
        if ((d <= want && dy < 24) || mv === 'guard' || c.modeT < -3.5) { startMove(S, c, mv, { ...h, vx: h.vx }, w); if (mv === 'guard') c.guardCd = M2.cd; return; }
        swimTo(h.x - Math.sign(h.x - c.x || 1) * Math.min(want * 0.8, d), mv === 'charge' || mv === 'slam' ? G.floor : h.y, CREW.speed[c.role]); return; }
      /* CIRCLING: hold off at the ring, drift round it */
      c.orbit += dt * 0.6; const r = CREW.circle[0] + (CREW.circle[1] - CREW.circle[0]) * (0.5 + 0.5 * Math.sin(c.orbit));
      const side = c.x < h.x ? -1 : 1; swimTo(h.x + side * r, clamp(h.y - 20 + 26 * Math.sin(c.orbit * 1.3), G.top + 40, G.floor), CREW.speed[c.role] * 0.8); return; }
    case 'rec': if (c.modeT <= 0) { free(); c.mode = 'circle'; c.atkCd = rnd(S, CREW.atkCd[0], CREW.atkCd[1]); } return;
    case 'staggered': case 'broken': case 'reeling': if (c.modeT <= 0) { if (c.mode === 'reeling' && c.raising) { c.mode = 'toRaise'; return; } free(); c.mode = 'circle'; c.atkCd = 1.0; c.why = null; } return;
    case 'toRaise': { const f = c.raising && S.crew[c.raising]; if (!f || f.alive) { c.raising = null; c.mode = 'circle'; return; }
      swimTo(f.x + 14, f.y, CREW.speed[c.role] * 1.6); if (Math.abs(c.x - (f.x + 14)) < 6 && Math.abs(c.y - f.y) < 8) { c.mode = 'raise'; c.modeT = CREW.lantern.raise; w.sound && w.sound('raiseTell'); w.say && w.say(c.x, c.y - 40, SAY.raise, '#ff9a5c'); } return; }
    case 'raise': { const f = c.raising && S.crew[c.raising]; if (!f || f.alive) { c.raising = null; c.mode = 'circle'; return; }
      if (c.modeT <= 0) { raise(S, f, w); c.raising = null; c.mode = 'rec'; c.modeT = 0.5; c.move = 'lunge'; } return; }
    default:
      if (/Tell$/.test(c.mode)) { if (c.modeT <= 0) release(S, c, w); return; }
      if (c.move && c.mode === c.move) { stepMoveAct(S, c, dt, hs, w); if (c.modeT <= 0 && c.mode === c.move) endMove(S, c, w); return; }
  }
}
function raise(S, f, w) {
  f.alive = true; f.fallen = false; f.hp = Math.max(1, Math.round(f.maxHp * CREW.lantern.rise)); f.mode = 'wake'; f.modeT = 0.8; f.atkCd = 2; f.y = S.G.floor;
  S.lanterns = S.lanterns.filter(l => l.role !== f.role); S.n.raises++; w.sound && w.sound('raise'); w.say && w.say(f.x, f.y - 40, SAY.risen, '#ff6b6b'); w.fx && w.fx('raise', f.x, f.y - 20);
}
/* A CREWMAN FALLS: his corpse sinks, his lantern rises */
export function fall(S, c, w) {
  if (!c.alive) return; c.alive = false; c.fallen = true; c.hp = 0; if (c.token) { c.token = false; S.tokens--; } c.mode = 'fallen'; c.guarding = null; S.n.falls++;
  for (const o of crewOf(S)) if (o.raising === c.role && o.mode !== 'raise') o.raising = null;
  if (c.raising) { c.raising = null; }
  S.lanterns.push({ role: c.role, t: CREW.lantern.t, x: c.x, y: c.y });
  w.sound && w.sound('fall'); w.say && w.say(c.x, c.y - 44, S.told.lantern ? '10' : SAY.lantern, '#7ff0e0'); S.told.lantern = 1;
  if (!living(S).length) merge(S, w);
}
/* a blow on a raiser breaks it off (B15: nothing here is immune - the blow itself is his own number) */
export function struck(S, c, w) {
  if (c.mode === 'raise' || c.mode === 'toRaise') { if (c.mode === 'raise') { S.n.broken++; w.say && w.say(c.x, c.y - 40, SAY.broke, '#ffd36b'); w.sound && w.sound('broke'); }
    c.mode = 'reeling'; c.modeT = CREW.lantern.reel; }
}
function merge(S, w) {
  S.ph = 2; S.lanterns = []; S.shots = []; S.waves = []; S.tokens = 0;
  const G = S.G; S.sailor = { sailor: true, x: G.mid, y: G.floor, hp: sailorMax(S), maxHp: sailorMax(S), mode: 'merge', modeT: CREW.merge, face: -1, stance: 'cutlass', ward: 0, n: 0, key: 100, move: null, guardHits: 0, gap: 1.2 };
  S.n.merges = (S.n.merges || 0) + 1; w.sound && w.sound('merge'); w.say && w.say(G.mid, G.floor - 90, SAY.merge, '#7ff0e0'); w.music && w.music(2); w.shake && w.shake(6);
}
const STANCES = ['cutlass', 'shield', 'harpoon', 'anchor'];
const STANCE_KIT = { cutlass: ['lunge', 'flurry'], shield: ['bash', 'guard'], harpoon: ['throw', 'reel'], anchor: ['slam', 'charge'] };
export { STANCES, STANCE_KIT };
/* ---- PHASE 2: THE CURSED SAILOR ---- */
function stepSailor(S, dt, hs, w) {
  const s = S.sailor, G = S.G, h = nearest(hs, s.x, s.y); if (!s || s.hp <= 0) return;
  s.modeT -= dt; s.ward = Math.max(0, s.ward - dt);
  const bw = CREW.sailor.w, bh = CREW.sailor.h;
  const swimTo = (tx, ty, v) => { const dx = tx - s.x, dy = ty - s.y, d = Math.hypot(dx, dy); if (d > 2) { s.x += dx / d * Math.min(d, v * dt); s.y += dy / d * Math.min(d, v * dt); }
    s.x = clamp(s.x, G.x0 + bw / 2, G.x1 - bw / 2); s.y = clamp(s.y, G.top + bh + 4, G.floor); if (Math.abs(dx) > 3) s.face = Math.sign(dx); };
  const opened = (mode, t) => { s.mode = mode; s.modeT = t; w.fx && w.fx('open', s.x, s.y - bh / 2); };
  const after = () => { s.ward = CREW.p2.ward; w.fx && w.fx('ward', s.x, s.y - bh / 2); s.mode = 'idle'; s.gap = rnd(S, CREW.p2.gap[0], CREW.p2.gap[1]); };
  switch (s.mode) {
    case 'merge': if (s.modeT <= 0) { s.mode = 'idle'; s.gap = 0.8; w.say && w.say(s.x, s.y - bh - 16, SAY.sailor, '#ff6b6b'); } return;
    case 'idle': { if (!h) return; s.gap -= dt;
      if (s.n >= CREW.p2.perStance) { s.mode = 'swapTell'; s.modeT = CREW.p2.swapTell; s.next = STANCES[(STANCES.indexOf(s.stance) + 1) % 4]; w.sound && w.sound('swapTell'); w.mark && w.mark(s, '!'); w.say && w.say(s.x, s.y - bh - 14, SAY.swap, '#ffd36b'); return; }
      const kit = STANCE_KIT[s.stance], mv = s.plan || (s.plan = kit[Math.floor(S.rng() * kit.length)]);
      const want = mv === 'throw' || mv === 'reel' ? 130 : mv === 'guard' ? 60 : mv === 'slam' ? 30 : mv === 'charge' ? 170 : mv === 'flurry' ? 34 : 90;
      const d = Math.abs(h.x - s.x);
      if (s.gap <= 0 && (d <= want || s.gap < -3)) { s.plan = null; startMove(S, s, mv, { ...h, vx: h.vx }, w); s.n++; return; }
      swimTo(h.x - Math.sign(h.x - s.x || 1) * Math.min(want * 0.8, d), mv === 'charge' || mv === 'slam' ? G.floor : h.y, CREW.sailor.speed); return; }
    case 'swapTell': if (s.modeT <= 0) { s.stance = s.next; s.n = 0; S.n.swaps++; opened('swap', CREW.p2.swap); w.sound && w.sound('swap'); } return;
    case 'swap': case 'stuck': case 'broken': if (s.modeT <= 0) after(); return;
    case 'rec': if (s.modeT <= 0) { s.mode = 'idle'; s.gap = rnd(S, CREW.p2.gap[0], CREW.p2.gap[1]); } return;
    case 'staggered': if (s.modeT <= 0) after(); return;
    default:
      if (/Tell$/.test(s.mode)) { if (s.modeT <= 0) release(S, s, w); return; }
      if (s.move && s.mode === s.move) { stepMoveAct(S, s, dt, hs, w); if (s.modeT <= 0 && s.mode === s.move) { endMove(S, s, w); if (s.move === 'guard') s.modeT = 0.4; } }
  }
}
/* THE HARPOONS and THE SHOCKWAVES (both phases) */
function stepShots(S, dt, hs, w) {
  const G = S.G;
  for (const q of S.shots) { q.t -= dt; q.x += q.vx * dt; q.y += q.vy * dt;
    const box = { l: q.x - 5 * q.sc, r: q.x + 5 * q.sc, t: q.y - 3 * q.sc, b: q.y + 3 * q.sc };
    for (const h of hs) if (h.alive && !q.done && over(box, heroBox(h))) { const M = CREW.moves[q.kind];
      const r = w.hit(h, Math.round(M.dmg * (q.by.sailor ? 1.25 : 1)), MOVE_NAME[q.kind], q.key, { blockable: M.block, fromX: q.x - Math.sign(q.vx || 1) * 8 });
      if (r) { q.done = true; if (r === 'hit' && q.kind === 'reel') w.pull && w.pull(h, q.by.x, q.by.y, M.pull * q.sc); } }
    if (q.y >= G.floor - 1 || q.x < G.x0 || q.x > G.x1 || q.y < G.top) { q.done = true; q.miss = true; }
    if (q.done && !q.reported) { q.reported = true; const by = q.by;
      /* A MISSED REEL (phase 2): the harpoon is stuck in the floor - open while he hauls it free */
      if (q.kind === 'reel' && q.miss && by.sailor && S.sailor === by && (by.mode === 'reel' || by.mode === 'rec' || by.mode === 'idle')) { S.n.stuck++; by.mode = 'stuck'; by.modeT = CREW.p2.stuck; w.say && w.say(by.x, by.y - CREW.sailor.h - 14, SAY.stuck, '#ffd36b'); w.fx && w.fx('open', by.x, by.y - 20); w.sound && w.sound('stuck'); } } }
  S.shots = S.shots.filter(q => !q.done && q.t > 0);
  for (const v of S.waves) { v.t -= dt; v.x += v.dir * CREW.moves.slam.waveV * dt;
    const box = { l: v.x - 8, r: v.x + 8, t: G.floor - CREW.moves.slam.waveH * v.sc, b: G.floor + 2 };
    for (const h of hs) if (h.alive && over(box, heroBox(h))) w.hit(h, Math.round(CREW.moves.slam.wave * v.sc), 'THE SHOCKWAVE', v.key, { blockable: false, fromX: v.x - v.dir * 8 }); }
  S.waves = S.waves.filter(v => v.t > 0 && v.x > G.x0 && v.x < G.x1);
}
/* THE LANTERNS: each burns its ten seconds; at nought the nearest free mate swims over to raise him */
function stepLanterns(S, dt, w) {
  for (const l of S.lanterns) { l.t = Math.max(0, l.t - dt); const f = S.crew[l.role]; f.y = Math.min(S.G.floor, f.y + 40 * dt); l.x = f.x; l.y = f.y - 30 - 10 * (1 - l.t / CREW.lantern.t);
    if (l.t <= 0 && !crewOf(S).some(o => o.raising === l.role)) {
      const mates = living(S).filter(o => !o.raising && o.mode !== 'raise' && o.mode !== 'toRaise' && !/Tell$/.test(o.mode) && !(o.move && o.mode === o.move));
      const m = mates.sort((a, b) => Math.abs(a.x - f.x) - Math.abs(b.x - f.x))[0];
      if (m) { if (m.token) { m.token = false; S.tokens--; } m.raising = l.role; m.mode = 'toRaise'; m.guarding = null; } } }
}
/* ONE STEP OF THE WHOLE FIGHT. hs: [{ x, y (feet), vx, alive, ground }]; w: hit(h, dmg, name, key, o) -> 'hit'|'blocked'|null, pull, say, mark, sound, fx, shake, music */
export function stepFight(S, dt, hs, w) {
  S.t += dt;
  if (!S.woke) return S;
  if (S.ph === 1) { for (const c of crewOf(S)) stepCrewman(S, c, dt, hs, w); stepLanterns(S, dt, w); }
  else stepSailor(S, dt, hs, w);
  stepShots(S, dt, hs, w);
  return S;
}
export function wake(S) { S.woke = true; crewOf(S).forEach((c, i) => { c.mode = 'wake'; c.modeT = CREW.wake * 0.5 + i * 0.3; }); }
/* the read for the bar: 'OPEN' / 'WARDED' / the phase name */
export function barWord(S) {
  if (S.ph === 2) { const s = S.sailor; return !s ? '' : s.mode === 'merge' ? 'RISING' : sailorOpen(s) ? 'OPEN' : s.ward > 0 ? 'WARDED' : s.stance.toUpperCase(); }
  const n = S.lanterns.length; return n ? n + ' LANTERN' + (n > 1 ? 'S' : '') + ' LIT' : living(S).length + ' OF 4';
}

/* ---- THE LAB BOT'S PLAN (the brief's "kill order, interrupt revives"): what a careful player does this frame.
   P = { x, y, hp, max }, returns { target (crewman / sailor / null), gx, gy, atk, block, dodge, jump } ---- */
export function crewPlan(S, P, o = {}) {   /* o.greedy: a player who fells whoever is lowest at once (no chip discipline): the lantern rule's victim */
  const out = { target: null, gx: P.x, gy: P.y, atk: false, block: false, dodge: false, jump: false };
  /* THE THREATS: a told move aimed at him */
  const actors = S.ph === 1 ? living(S) : (S.sailor ? [S.sailor] : []);
  for (const a of actors) { const near = Math.abs(a.x - P.x) < 170;
    if (!near) continue;
    if (a.mode === 'slamTell' || a.mode === 'slam') out.jump = true;
    else if (a.mode === 'throwTell' && a.modeT < 0.25) out.dodge = true;
    else if (a.sailor && a.mode === 'reelTell' && a.modeT < 0.25) out.dodge = true;   /* phase 2: ROLL the reel - a miss sticks his harpoon (the opening) */
    else if (/^(lunge|flurry|bash|charge|reel)Tell$/.test(a.mode) && a.modeT < 0.3 && Math.abs(a.x - P.x) < 120) out.block = true;
    else if (/^(lunge|flurry|bash|charge)$/.test(a.mode) && Math.abs(a.x - P.x) < 60) out.block = true; }
  if (S.waves.some(v => Math.abs(v.x - P.x) < 50)) out.jump = true;
  if (S.shots.some(q => Math.abs(q.x - P.x) < 60 && Math.abs(q.y - (P.y - 7)) < 30)) { const q = S.shots.find(q => Math.abs(q.x - P.x) < 60); if (q && CREW.moves[q.kind].block && !(q.kind === 'reel' && q.by.sailor)) out.block = true; else out.dodge = true; }
  /* THE TARGET */
  let t = null;
  if (S.ph === 2) t = S.sailor;
  else { const L = living(S);
    t = L.find(c => c.mode === 'raise' || c.mode === 'toRaise');   /* 1. break off a raising */
    if (!t && S.lanterns.length) t = L.filter(c => !guardOf(S, c)).sort((a, b) => a.hp - b.hp)[0] || L.sort((a, b) => a.hp - b.hp)[0];   /* 2. a lantern is lit: fell the rest, weakest first */
    if (!t) { const ready = o.greedy || L.every(c => c.hp <= c.maxHp * 0.4);   /* 3. chip them ALL low, then start felling */
      t = ready ? L.sort((a, b) => a.hp - b.hp)[0] : L.filter(c => c.hp > c.maxHp * 0.4 && !guardOf(S, c)).sort((a, b) => (b.role === 'shield' && b.mode === 'guard') - (a.role === 'shield' && a.mode === 'guard') || b.hp / b.maxHp - a.hp / a.maxHp)[0] || L[0];
      /* a lone low man is left alone until the rest are low too (felling him starts the clock) */ } }
  if (t) { out.target = t; const side = t.role === 'shield' && t.mode !== 'guard' && !crewOpen(t) ? -t.face : (Math.sign(P.x - t.x) || 1);
    out.gx = t.x + side * 16; out.gy = t.y; out.atk = Math.abs(t.x - P.x) < 28 && Math.abs(t.y - P.y) < 24;
    if (!o.greedy && S.ph === 1 && !(t.mode === 'raise' || t.mode === 'toRaise') && t.hp <= t.maxHp * 0.4 && !S.lanterns.length && living(S).some(c => c.hp > c.maxHp * 0.4)) out.atk = false; }
  if (out.block || out.dodge) out.atk = false;
  return out;
}
export const TELL_ROWS = [['lungeTell', '!', 'block'], ['flurryTell', '!', 'block'], ['bashTell', '!', 'block'], ['reelTell', '!', 'block'], ['chargeTell', '!', 'block'], ['throwTell', '!!', 'dodge'], ['slamTell', '!!', 'jump']].map(([m, mk, an]) => ['sunkencrew', m, mk, an, 'low']);   /* (claude/sea3) the rows of src/marks.js: marks.js registers every module's TELL_ROWS, tools/tells.mjs discovers them */
