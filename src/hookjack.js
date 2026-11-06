// src/hookjack.js - THE HOOKJACK, THE HIGH LINES' new foe (claude/highlines1, the OPUS GREYBOX, 11-05; scratch/lane-reports/zipclimb-plan.md section 4,
// amended: Daniel 11-05 15:27 "Hookjack ambush, cut lines drop you a level"). A PURE foe module, like src/gale-harpy.js: no DOM, no main.js. The level's hands
// (src/highlines-hands.js) call hookStep(e, dt, w) for each one every frame, hookTake(e, dmg, fromX) when a blow lands, and drawHook for the greybox picture.
//
// WHO HE IS: a ROPEWAY RIGGER - a brigand of the line crews in the Queen's pay (a man, not a goblin: theme rule), hanging from a hand-cranked TROLLEY with a long
// iron boat-hook. He rides the line kit's lines either way (src/line-kit.js foeRide) and comes AT you along your line.
//   ride      patrols his line; sees a hero on it (or near it) inside HK.see and cranks at him. His hook is held across his body: a GUARD - a blow from the
//             front clanks off at x HK.guard (grey spark, clank); from behind it is whole
//   tell      at HK.tellAt px he stops and DRAWS THE HOOK BACK over his shoulder for HK.tell s: a yellow !, the trolley sparks, his rasp. HE IS OPEN: any blow
//             or shot (whole damage) and he LOSES HIS GRIP - he falls (onto a landing: he fights on foot; into the void: he is gone)
//   swipe     HK.swipeT s, reach HK.reach px at hand height: HK.dmg and the rider is KNOCKED OFF the line (riderHit). A PARRY (any hero's tap C on the beat:
//             the hit comes back 'parried') bounces the hook - he SPINS on his trolley HK.spin s (gold ring) and one blow drops him; a HELD guard
//             ('blocked') takes no damage, keeps the grip and is pushed back along the line (riderHit guard)
//   recover   HK.recover s, guard up, then he comes again. Never two Hookjacks swiping inside HK.noStack s of each other (w.lastSwipe / w.swiped).
//   AMBUSH (role 'cutter'): he waits ON FOOT at the high station of a CUTTABLE line. When a hero rides that line he SAWS it: HK.saw s, told (red !!, the
//             rasp, sparks, a fray bar over the pylon). Open while he saws (any blow or shot staggers him and stops it). If the saw runs out the line
//             PARTS (lineCut): every rider on it falls a level (the kit's lint guarantees a catch under every cuttable line). ONE cut: then he hooks onto
//             the line when it is strung again and rides down at you as a rider.
//   foot      on a landing (fallen, or a cutter): walks at you, guard up; the same told hook draw (open) and a ground swipe.
// HP HK.hp (sturdier than a gale harpy). Contact 0. Every hero beats him: the tell is at HK.tellAt px (inside the shortest melee reach - the Warden's bare jab and
// the Ranger's knife - so a melee-only hero hits him from where he hangs), and the parry is the shared tap C (damagePlayer says 'parried').
// API: HK, HK_SAY, newHook(o), hookStep(e, dt, w), hookTake(e, dmg, fromX, o), hookOpen(e), hookFrame(e), drawHook(g, e, cx, cy, time).
// w (the world, from the hands): { kit, LK: { foeRide, lineY, lineCut, riderHit }, heroes(): [body], hurt(h, dmg, fromX) -> 'parried'|'blocked'|'hit'|'miss',
//   time(), lastSwipe(), swiped(t), landingUnder(x, y) -> top px | null, pitY, say(x, y, text, col), sound(k), mark(e, m) }
export const HK = {
  hp: 36, guard: 0.4, see: 170, speed: 110, footSpeed: 34, tellAt: 20, tell: 0.7, swipeT: 0.2, reach: 28, dmg: 12, recover: 0.6, spin: 1.2,
  noStack: 0.8, saw: 2.2, sawFrom: 48, footTell: 0.7, footReach: 26, fallG: 900, w: 10, h: 18, cutHold: 8, first: 0.6,
};
export const HK_SAY = { tell: 'THE HOOK IS BACK: HE IS OPEN', fell: 'HE LOSES HIS GRIP', parried: 'PARRIED: HE SPINS', saw: 'HE SAWS THE LINE: GET OFF OR CUT HIM DOWN', cut: 'THE LINE PARTS', clank: 'HIS HOOK GUARDS HIS FRONT' };
export function newHook(o = {}) {
  return { t: 'hookjack', hp: HK.hp, w: HK.w, h: HK.h, face: o.dir || -1, mode: o.role === 'cutter' ? 'perch' : 'ride', modeT: HK.first, role: o.role || 'rider',
    line: o.line || null, lx: o.lx ?? null, dir: o.dir || -1, vx: 0, vy: 0, sawT: 0, cuts: 0, hkN: { tells: 0, swipes: 0, parried: 0, blocked: 0, hits: 0, falls: 0, saws: 0, cutsDone: 0, clanks: 0 }, ...o };
}
/* is he open (whole damage, a blow drops him)? */
export const hookOpen = e => e.mode === 'tell' || e.mode === 'spin' || e.mode === 'saw' || e.mode === 'footTell';
const near = (e, hs) => hs.filter(h => h && h.alive !== false && !h.dead).sort((a, b) => Math.hypot(a.x - e.x, a.y - e.y) - Math.hypot(b.x - e.x, b.y - e.y))[0];
function fall(e, w, why) {
  e.mode = 'fall'; e.vy = 0; e.vx = (e.face || 1) * -30; e.line = null; e.hkN.falls++;
  if (why) w.say(e.x, e.y - 24, why, '#8fd160'); w.sound('fell');
}

/* ---------- ONE FRAME ---------- */
export function hookStep(e, dt, w) {
  const now = w.time(), hs = w.heroes(), P = near(e, hs); e.anim = (e.anim || 0) + dt;
  const kit = w.kit, Lk = w.LK;
  if (e.mode !== 'fall' && e.mode !== 'foot' && e.mode !== 'footTell' && e.mode !== 'footSwipe' && e.mode !== 'perch' && e.mode !== 'saw' && e.mode !== 'wait') {
    const z = e.line && kit.lines[e.line]; if (!z || z.cut > 0) { fall(e, w, null); }
  }
  switch (e.mode) {
    case 'perch': {   /* a CUTTER on foot at his station: he saws when a hero rides HIS line, far enough down it */
      e.modeT -= dt; const z = kit.lines[e.line]; if (!z) { e.mode = 'foot'; break; }
      const on = hs.find(h => h && h.lk && h.lk.id === z.id && !h.dead && Math.abs(h.x - e.x) > HK.sawFrom);
      if (on) e.face = Math.sign(on.x - e.x) || e.face;
      if (on && e.modeT <= 0 && !(z.cut > 0)) { e.mode = 'saw'; e.sawT = HK.saw; e.hkN.saws++; w.mark(e, '!!'); w.sound('saw'); w.say(e.x, e.y - 30, HK_SAY.saw, '#ff6b6b'); }
      else if (P && !P.lk && Math.abs(P.x - e.x) < 90 && Math.abs(P.y - e.y) < 20) e.mode = 'foot';   /* a hero walks up to him: he fights on foot */
      break; }
    case 'saw': {
      e.sawT -= dt; const z = kit.lines[e.line];
      if (!z) { e.mode = 'foot'; break; }
      if (!hs.some(h => h && h.lk && h.lk.id === z.id && !h.dead)) { e.mode = 'perch'; e.modeT = 0.4; break; }   /* nobody left on it: he stops (the saw is for riders) */
      if (e.sawT <= 0) { Lk.lineCut(kit, z.id, HK.cutHold); e.cuts++; e.hkN.cutsDone++; w.say(e.x, e.y - 30, HK_SAY.cut, '#ff6b6b'); w.sound('cut'); e.mode = 'wait'; e.modeT = 0; }
      break; }
    case 'wait': {   /* the line he cut is strung again: he hooks on and rides down it at you (one cut only) */
      const z = kit.lines[e.line]; if (!z) { e.mode = 'foot'; break; }
      if (!(z.cut > 0)) { e.mode = 'ride'; e.role = 'rider'; e.lx = Math.max(z.xa + 8, Math.min(z.xb - 8, e.x)); e.dir = -z.dir; e.modeT = 0.4; }
      break; }
    case 'ride': case 'recover': {
      const z = kit.lines[e.line]; e.modeT -= dt;
      const tgt = P && Math.abs(P.x - e.x) < HK.see && Math.abs(P.y - e.y) < 48 ? P : null;
      if (tgt) e.dir = Math.sign(tgt.x - e.x) || e.dir;
      const d = tgt ? Math.abs(tgt.x - e.x) : 1e9;
      if (e.mode === 'recover' && e.modeT <= 0) e.mode = 'ride';
      if (e.mode === 'ride' && tgt && d <= HK.tellAt + 2 && Math.abs(tgt.y - e.y) < 24 && e.modeT <= 0) {
        if (now - w.lastSwipe() < HK.noStack) { e.hkN.held = (e.hkN.held || 0) + 1; }   /* another one's swipe is in the air: he waits his turn (guard up) */
        else { e.mode = 'tell'; e.modeT = HK.tell; e.hkN.tells++; e.face = e.dir; w.mark(e, '!'); w.sound('tell'); if (!e.saidTell) { e.saidTell = 1; w.say(e.x, e.y - 30, HK_SAY.tell, '#ffd36b'); } break; }
      }
      const stop = tgt && d <= HK.tellAt;
      e.lx = e.lx ?? (z.dir > 0 ? z.xa + 8 : z.xb - 8);
      const ride = { line: z.id, x: e.lx, dir: e.dir, speed: stop ? 0.0001 : e.mode === 'recover' ? HK.speed * 0.35 : HK.speed };
      if (e.mode === 'recover') ride.dir = -e.dir;   /* he backs off a little to swing again */
      const turned = Lk.foeRide(kit, ride, dt);
      e.lx = ride.x; e.x = ride.x; e.y = ride.y; if (!tgt && turned) e.dir = ride.dir; if (!tgt) e.dir = ride.dir;
      e.face = tgt ? e.dir : ride.dir; e.vx = stop ? 0 : ride.dir * ride.speed;
      break; }
    case 'tell': {
      e.modeT -= dt; e.vx = 0; const z = kit.lines[e.line]; if (z) { e.y = Lk.lineY(z, e.x) + z.hang; }
      if (e.modeT <= 0) { e.mode = 'swipe'; e.modeT = HK.swipeT; e.hit = false; e.hkN.swipes++; w.swiped(now); w.sound('swipe'); }
      break; }
    case 'swipe': {
      e.modeT -= dt;
      if (!e.hit) for (const h of hs) { if (!h || h.dead || h.alive === false) continue;
        const dx = (h.x - e.x) * e.face; if (dx < -4 || dx > HK.reach || Math.abs((h.y - 10) - (e.y - 10)) > 22) continue;
        e.hit = true; const r = w.hurt(h, HK.dmg, e.x);
        if (r === 'parried') { e.hkN.parried++; e.mode = 'spin'; e.modeT = HK.spin; w.say(e.x, e.y - 30, HK_SAY.parried, '#ffd36b'); w.sound('parried'); break; }
        if (r === 'blocked') { e.hkN.blocked++; if (h.lk) Lk.riderHit(kit, h, { guard: true }); }
        else if (r === 'hit') { e.hkN.hits++; if (h.lk) Lk.riderHit(kit, h, { from: e.x }); }
      }
      if (e.mode === 'swipe' && e.modeT <= 0) { e.mode = 'recover'; e.modeT = HK.recover; }
      break; }
    case 'spin': { e.modeT -= dt; if (e.modeT <= 0) { e.mode = 'recover'; e.modeT = HK.recover * 0.5; } break; }
    case 'fall': {
      e.vy = Math.min(420, e.vy + HK.fallG * dt); const oy = e.y; e.y += e.vy * dt; e.x += e.vx * dt; e.vx *= Math.pow(0.3, dt);
      const top = w.landingUnder(e.x, oy, e.y);
      if (top !== null && top !== undefined) { e.y = top; e.vy = 0; e.vx = 0; e.mode = 'foot'; e.modeT = 0.8; e.line = null; w.sound('land'); }
      else if (e.y > w.pitY) { e.alive = false; e.hp = 0; e.gone = true; }
      break; }
    case 'foot': {   /* on a landing: walk at the nearest hero, guard up; the told hook draw at his reach */
      e.modeT -= dt;
      if (P && Math.abs(P.y - e.y) < 30) { const d = P.x - e.x; e.face = Math.sign(d) || e.face;
        if (Math.abs(d) <= HK.footReach && e.modeT <= 0 && now - w.lastSwipe() >= HK.noStack) { e.mode = 'footTell'; e.modeT = HK.footTell; e.hkN.tells++; w.mark(e, '!'); w.sound('tell'); }
        else if (Math.abs(d) > 14) { const nx = e.x + e.face * HK.footSpeed * dt; if (w.landingUnder(nx, e.y - 2, e.y + 2) !== null) e.x = nx; } }
      break; }
    case 'footTell': { e.modeT -= dt; if (e.modeT <= 0) { e.mode = 'footSwipe'; e.modeT = HK.swipeT; e.hit = false; e.hkN.swipes++; w.swiped(now); w.sound('swipe'); } break; }
    case 'footSwipe': {
      e.modeT -= dt;
      if (!e.hit) for (const h of hs) { if (!h || h.dead) continue; const dx = (h.x - e.x) * e.face; if (dx < -4 || dx > HK.reach || Math.abs(h.y - e.y) > 22) continue;
        e.hit = true; const r = w.hurt(h, HK.dmg, e.x); if (r === 'parried') { e.hkN.parried++; e.mode = 'footSpin'; e.modeT = HK.spin; w.say(e.x, e.y - 30, HK_SAY.parried, '#ffd36b'); w.sound('parried'); }
        else if (r === 'blocked') e.hkN.blocked++; else if (r === 'hit') e.hkN.hits++; }
      if (e.mode === 'footSwipe' && e.modeT <= 0) { e.mode = 'foot'; e.modeT = HK.recover; }
      break; }
    case 'footSpin': { e.modeT -= dt; if (e.modeT <= 0) { e.mode = 'foot'; e.modeT = HK.recover; } break; }
  }
}
/* A BLOW LANDS (the hands call this from hurtEnemy): returns the damage to take. Open -> whole, and a hanging Hookjack loses his grip; guarded front -> x HK.guard */
export function hookTake(e, dmg, fromX, w) {
  const front = Math.sign(fromX - e.x) === (e.face || 1);
  if (e.mode === 'saw') { e.mode = 'perch'; e.modeT = 1.6; e.stagger = 0.6; if (w) w.say(e.x, e.y - 24, HK_SAY.fell, '#8fd160'); return dmg; }   /* the saw stops; he is staggered */
  if (e.mode === 'footSpin' || e.mode === 'footTell') { e.mode = 'foot'; e.modeT = 0.8; e.stagger = 0.6; return dmg; }
  if (e.mode === 'tell' || e.mode === 'spin') { if (w) fall(e, w, HK_SAY.fell); else e.mode = 'fall'; return dmg; }
  if (e.mode === 'fall') return dmg;
  if (front) { e.hkN.clanks++; if (w && !e.saidClank) { e.saidClank = 1; w.say(e.x, e.y - 24, HK_SAY.clank, '#c8ccd4'); } if (w) w.sound('clank'); return dmg * HK.guard; }
  return dmg;
}
export const hookFrame = e => e.mode === 'tell' || e.mode === 'footTell' ? 2 : e.mode === 'swipe' || e.mode === 'footSwipe' ? 3 : e.mode === 'spin' || e.mode === 'footSpin' ? 4 : e.mode === 'fall' ? 5 : e.mode === 'saw' ? 6 : (e.mode === 'foot' || e.mode === 'perch' || e.mode === 'wait') ? 7 : Math.floor((e.anim || 0) * 6) % 2;
/* THE GREYBOX PICTURE (art owed: zipclimb-plan.md 6 - ride 2, tell 2, swipe 1, spin 2, fall 2, foot 4, saw 2). Plain shapes, every pose its own picture */
export function drawHook(g, e, cx, cy, time) {
  const x = Math.round(e.x - cx), y = Math.round(e.y - cy), f = e.face || 1, fr = hookFrame(e), hang = fr !== 7 && fr !== 5 && fr !== 6;
  if (hang) { g.fillStyle = '#2a2420'; g.fillRect(x - 4, y - 24, 9, 4); g.fillStyle = '#9aa0a8'; g.fillRect(x - 3, y - 23, 7, 2);   /* the crank-trolley on the rope */
    g.fillStyle = '#5a4630'; g.fillRect(x, y - 20, 1, 4); }
  g.fillStyle = e.flash > 0 ? '#ffffff' : '#5a6a7a'; g.fillRect(x - 4, y - 16, 9, 10);   /* coat (slate: the line crews) */
  g.fillStyle = '#c8a888'; g.fillRect(x - 2, y - 19, 5, 4);                               /* head */
  g.fillStyle = '#3a3a40'; g.fillRect(x - 3, y - 6, 3, 6); g.fillRect(x + 1, y - 6, 3, 6); /* legs */
  g.fillStyle = '#c8ccd4';
  if (fr === 2) { g.fillRect(x - f * 8, y - 24, 2, 12); g.fillRect(x - f * 10, y - 25, 4, 2); }          /* THE TELL: the hook drawn back over his shoulder */
  else if (fr === 3) { g.fillRect(x + (f > 0 ? 4 : -HK.reach), y - 12, HK.reach, 2); g.fillRect(x + f * HK.reach - (f > 0 ? 2 : 0), y - 15, 2, 5); }   /* THE SWIPE: the hook out at full reach */
  else if (fr === 4) { const a = time * 14; g.fillRect(x + Math.round(Math.cos(a) * 9), y - 12 + Math.round(Math.sin(a) * 9), 3, 3); }   /* SPUN: the hook flung round */
  else if (fr === 6) { g.fillRect(x + f * 3, y - 18, 2, 8); }                                               /* SAWING at the pylon */
  else { g.fillRect(x - 6, y - 13, 13, 2); g.fillRect(x + f * 6, y - 16, 2, 4); }                          /* THE GUARD: the hook across his body */
  if (fr === 2 || e.mode === 'saw') { g.fillStyle = e.mode === 'saw' ? '#ff6b6b' : '#ffd36b'; g.fillRect(x - 1, y - 34, 3, 6); g.fillRect(x - 1, y - 26, 3, 2); }   /* the ! (red !! for the saw) */
  if (e.mode === 'saw') { const k = Math.max(0, e.sawT) / HK.saw; g.fillStyle = '#2a2420'; g.fillRect(x - 10, y - 40, 21, 3); g.fillStyle = '#ff6b6b'; g.fillRect(x - 10, y - 40, Math.round(21 * (1 - k)), 3); }   /* the fray bar */
  if (fr === 4) { g.strokeStyle = '#ffd36b'; g.beginPath(); g.arc(x + 0.5, y - 12, 13, 0, Math.PI * 2); g.stroke(); }   /* PARRIED: the gold ring - one blow drops him */
}
