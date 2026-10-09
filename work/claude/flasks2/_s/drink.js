/* (claude/flasks2, Daniel 10-08: "a drinking animation so it's a risk") THE DRINK, SEEN: he stops, UNCORKS (a pop, the cork flies), TIPS IT BACK
   (two GULPS, two glugs), and the heal lands at the swallow with a green glow rising off him. A blow before the swallow KNOCKS THE FLASK AWAY: it
   flies off spinning and breaks with a red splash, 'SPILLED', and the HUD's flask row shakes red - unless STEADY HAND (src/flasks2.js): then the
   drink stops and the flask goes back on his belt. QUICK DRAUGHT makes the whole drink ~0.5 s (F2.drinkTimes). */
const flaskHud = { flashT: 0, spillT: 0, last: -1, spills: [], glowT: 0, levelDrinks: 0 };   /* the HUD row's flash and shake, the knocked-away flasks, the rising glow, this wood's drinks */
const drinkT0 = () => P.drinkDur || SV.FLASK.drinkT, swallowT0 = () => P.swallowAt || SV.FLASK.swallowAt;
function tryDrink() {
  if (state !== 'play' || !P || P.dead || P.down > 0 || (L && L.trial) || P.drinkT > 0) return false;
  if (!((P.flasks | 0) > 0)) { SFX.buzz(); number(P.x, P.y - 30, 'NO FLASKS', '#9aa39a'); return false; }
  if (P.hp >= P.maxHp) { SFX.buzz(); number(P.x, P.y - 30, 'FULL', '#9aa39a'); return false; }
  if (!P.ground || P.swim || P.climb || P.plunge || P.hurt > 0 || P.asleep > 0 || P.dodge > 0 || CM.committed(P) || P.carry) { SFX.buzz(); return false; }
  const T = F2.drinkTimes(PROG, SV.FLASK);
  P.flasks--; P.drinkDur = T.drinkT; P.swallowAt = T.swallowAt; P.drinkT = T.drinkT; P.drunk = false; P.gulps = 0; P.corked = true; P.drinkHp = P.hp; P.block = false; P.vx = 0; P.dance = 0; SFX.ui(); PROG.drinkTold = Math.max(PROG.drinkTold || 0, 2);
  flaskHud.levelDrinks++; return true;
}
function drinkTick(dt) {
  if (flaskPress) { flaskPress = false; tryDrink(); }
  spillsTick(dt); if (flaskHud.glowT > 0) flaskHud.glowT = Math.max(0, flaskHud.glowT - dt);
  if (!(P.drinkT > 0)) return;
  if (P.dead || P.down > 0 || state !== 'play') { P.drinkT = 0; return; }
  if (P.hp < P.drinkHp) { P.drinkT = 0; if (!P.drunk) spillFlask(); return; }   /* a blow ends the drink: before the swallow it is spilled */
  P.drinkT = Math.max(0, P.drinkT - dt); P.rootT = Math.max(P.rootT || 0, 0.05); P.vx = 0;
  const el = drinkT0() - P.drinkT, sw = swallowT0();
  if (P.corked && el >= sw * 0.3) { P.corked = false; SFX.cork(); flaskHud.spills.push({ cork: true, x: P.x + P.face * 4, y: P.y - F2.mouthOf(hero()).dy + 2, vx: P.face * 30, vy: -110, rot: 0, t: 0 }); }   /* the cork pops */
  while (P.gulps < F2.GULPS.length && el >= sw * F2.GULPS[P.gulps]) { P.gulps++; SFX.glug(); }   /* two gulps */
  if (!P.drunk && el >= sw) { P.drunk = true; const h = SV.flaskHeal(P.maxHp, F2.healPct(PROG, perk('tonic'))); P.hp = Math.min(P.maxHp, P.hp + h); P.drinkHp = P.hp; SFX.mend(); flaskHud.glowT = 0.7;
    motes(P.x, P.y - 10, 14, 8, ['#8fd160', '#c8f0a0', '#fff6e0']); ringAt(P.x, P.y - 10, 16, '#8fd160', 0.35); number(P.x, P.y - 30, '+' + h, '#8fd160'); }   /* the heal: a green glow rising */
}
/* KNOCKED AWAY: the flask (spent at the lift) flies off the way the blow pushed him and breaks where it lands. STEADY HAND keeps it */
function spillFlask() {
  if (F2.owned(PROG, 'steady')) { P.flasks = (P.flasks | 0) + 1; number(P.x, P.y - 34, 'STEADY HAND', '#ffd36b'); SFX.ui(); return; }
  const away = P.vx ? Math.sign(P.vx) : -P.face;   /* the way the blow threw him */
  flaskHud.spills.push({ x: P.x + P.face * 4, y: P.y - 18, vx: away * 70 + (Math.random() - 0.5) * 20, vy: -150, rot: 0, t: 0 });
  number(P.x, P.y - 34, 'SPILLED', '#ff6b6b'); SFX.puff(); flaskHud.spillT = 0.6; P.drinkSpills = (P.drinkSpills | 0) + 1;
}
function spillsTick(dt) {
  for (const s of flaskHud.spills) { s.t += dt; s.vy += 520 * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.rot += dt * (s.cork ? 18 : 12) * Math.sign(s.vx || 1);
    if (s.t > 0.12 && s.vy > 0 && (isSolid(Math.floor(s.x / TS), Math.floor(s.y / TS)) || s.t > 1.6)) { s.dead = true;
      if (!s.cork) { burst(s.x, s.y - 2, 14, ['#c9463d', '#ff9a9a', '#e04848', '#c8e8f0'], 80, 0.45); SFX.splash(); } } }
  if (flaskHud.spills.length) flaskHud.spills = flaskHud.spills.filter(s => !s.dead);
}
/* the flask in his hand: at his chest to uncork, up to his MOUTH (per hero: F2.MOUTH) and tipped back for the two gulps, then down. The spilled
   flasks and corks in flight, and the green glow of the heal */
function drawFlaskDrink(cx, cy) {
  for (const s of flaskHud.spills) { const x = Math.round(s.x - cx), y = Math.round(s.y - cy);
    if (s.cork) { g.fillStyle = '#9a6a34'; g.fillRect(x - 1, y - 1, 2, 2); continue; }
    g.save(); g.translate(x, y); g.rotate(s.rot); g.drawImage(TONIC_ICON, -3, -4); g.restore(); }
  if (flaskHud.glowT > 0 && !P.dead) { const k = flaskHud.glowT / 0.7, x = Math.round(P.x - cx), y = Math.round(P.y - cy);
    g.globalAlpha = 0.35 * k; g.fillStyle = '#8fd160'; g.fillRect(x - 7, y - 28 - Math.round(10 * (1 - k)), 14, 28); g.globalAlpha = 0.6 * k; g.fillStyle = '#c8f0a0';
    for (let i = 0; i < 4; i++) { const yy = y - ((time * 40 + i * 9) % 34); g.fillRect(x - 6 + i * 4, yy, 1, 2); } g.globalAlpha = 1; }
  if (!(P.drinkT > 0) || P.dead) return;
  const ph = F2.drinkPhase(drinkT0() - P.drinkT, { drinkT: drinkT0(), swallowAt: swallowT0() }), M = F2.mouthOf(hero());
  const hx = P.x - cx + P.face * (M.dx + 3 * (1 - ph.lift)), hy = P.y - cy - (9 + (M.dy - 9) * ph.lift);
  g.save(); g.translate(Math.round(hx), Math.round(hy)); g.rotate(-P.face * ph.tip * 2.1); g.drawImage(TONIC_ICON, -3, -4);
  if (ph.ph === 'uncork' || P.corked) { g.fillStyle = '#9a6a34'; g.fillRect(-1, -6, 2, 2); }
  g.restore();
  if (ph.ph === 'gulp1' || ph.ph === 'gulp2') { const k = Math.floor(time * 10) % 2; g.fillStyle = '#ff9a9a'; if (k) g.fillRect(Math.round(hx + P.face * 2), Math.round(hy - 5), 1, 1); }
}
