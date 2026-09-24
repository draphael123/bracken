import io
p = 'src/main.js'
s = io.open(p, encoding='utf8').read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:90])
    s = s.replace(a, b)
    io.open(p, 'w', encoding='utf8', newline='').write(s)

# imports: the Scalder's sprite and Stormhold's stone house fronts
rep("import { bakeWinchmaster } from './redraw/winchmaster.js';",
    "import { bakeWinchmaster } from './redraw/winchmaster.js';\nimport { bakeScalder } from './redraw/scalder.js';\nimport { bakeStoneFront } from './redraw/stone-town.js';")
# the sprite
rep("SPR.temperer = bakeTemperer();", "SPR.temperer = bakeTemperer(); SPR.scalder = bakeScalder();")
# health and blows
rep("temperer: 30,", "temperer: 30, scalder: 26,")
rep("temperCut: 13", "temperCut: 13, scalderPour: 16, scalderLadle: 9")
# the spawn: every clock written down (A3)
rep("      case 'temperer': enemies.push(",
    "      case 'scalder': enemies.push({ ...base, t: 'scalder', w: 10, h: 14, hp: EHP.scalder, speed: 30, mode: 'watch', modeT: 0, cd: 0.6, pourCd: 1.2 + Math.random() * 0.8, poured: 0, struck: 0, post: e.post || [e.x, e.x] }); break;   /* THE SCALDER (updateScalder): both clocks written down, or he never pours (A3) */\n      case 'temperer': enemies.push(")
# bestiary
rep("  { t: 'temperer', name: 'THE TEMPERER',",
    "  { t: 'scalder', name: 'THE SCALDER', sub: 'he holds the top of the ladder', desc: 'A goblin and a pot of boiling pitch on the lip of a tower. Climb under him and he tips it straight down the ladder: no shield turns it. Wait on a landing while he stirs the pot back up, then climb.' },\n  { t: 'temperer', name: 'THE TEMPERER',")
# he shows he is hit; his colours when he goes; his family (small: he goes over on a sweep); a goblin
rep("'hearthgob', 'temperer', 'spider',", "'hearthgob', 'temperer', 'scalder', 'spider',")
rep("temperer: ['#6faa4a', '#6b4a2a', '#ffd36b'],", "temperer: ['#6faa4a', '#6b4a2a', '#ffd36b'], scalder: ['#6faa4a', '#5a3a24', '#ff9a5c'],")
rep("    case 'temperer': Object.assign(c, { vx: dir * 45,",
    "    case 'scalder': Object.assign(c, { vx: dir * 40, vy: -130, spin: dir * 5, life: 1.1, max: 1.1 }); SFX.hiss(); burst(e.x + e.face * 8, e.y - 6, 12, ['#ff9a5c', '#ffd36b', '#2e3038'], 70, 0.6); break;   /* the pot goes over with him (his voice: DIE.scalder) */\n    case 'temperer': Object.assign(c, { vx: dir * 45,")
rep("'topiary', 'propman', 'miner', 'fledgling', 'thorn', 'temperer'] },", "'topiary', 'propman', 'miner', 'fledgling', 'thorn', 'temperer', 'scalder'] },")
rep("'brute', 'hearthgob', 'temperer', 'miner', 'sentry',", "'brute', 'hearthgob', 'temperer', 'scalder', 'miner', 'sentry',")
# the dispatch
rep("    if (e.t === 'temperer') { beastSeen('temperer'); updateTemperer(e, dt); continue; }",
    "    if (e.t === 'temperer') { beastSeen('temperer'); updateTemperer(e, dt); continue; }\n    if (e.t === 'scalder') { beastSeen('scalder'); updateScalder(e, dt); continue; }")
# the frame
rep("    else if (e.t === 'sweep') frame = e.mode === 'pop' ? 2 : e.mode === 'throw' ? 1 : 0;",
    "    else if (e.t === 'sweep') frame = e.mode === 'pop' ? 2 : e.mode === 'throw' ? 1 : 0;\n    else if (e.t === 'scalder') frame = e.mode === 'stir' ? 1 : e.mode === 'pourTell' ? 2 : e.mode === 'pour' ? 3 : e.mode === 'ladleTell' ? 4 : e.mode === 'ladle' ? 5 : 0;")
# the pitch: a seed that falls straight down, is turned by no shield, and burns where it lands (slag lights the footing)
rep("s.soot ? DMG.sweep :", "s.pitch ? DMG.scalderPour : s.soot ? DMG.sweep :")
rep("blow: s.arrow ? 'THE ARROW' :", "blow: s.pitch ? 'THE PITCH' : s.arrow ? 'THE ARROW' :")
rep("} else if (s.soot) {",
    "} else if (s.pitch) { const x = Math.round(s.x - cx), y = Math.round(s.y - cy); g.fillStyle = '#1f1a16'; g.fillRect(x - 2, y - 6, 5, 9); g.fillStyle = '#ff9a5c'; g.fillRect(x - 1, y - 5, 3, 6); g.fillStyle = '#ffd36b'; g.fillRect(x, y - 4, 1, 3); } else if (s.soot) {")
# the house fronts: Stormhold's are stone
rep("if (!h.spr) h.spr = h.town ? TWN.bakeTownFront(h) : bakeHouseFront(h);", "if (!h.spr) h.spr = h.stone ? bakeStoneFront(h) : h.town ? TWN.bakeTownFront(h) : bakeHouseFront(h);")

# THE SCALDER himself, after the Temperer
UPD = r'''
/* THE SCALDER (docs/briefs/stormhold-town.md §5) - a goblin and a pot of boiling pitch on the lip of a tower. The first thing
   in the game that attacks THE CLIMB: every other foe fights on a floor or shoots across one. He keeps to his POST (a run of
   tile columns over a ladder), shuffles along it to stand over you, and when you are under him he tips the pot: the pitch
   goes straight down, through the boards (a one-way plank does not stop a liquid), and no shield turns it. Knocked off the
   ladder you fall to the landing below, which is why every tower has one out of his reach. Then he STIRS the pot back up -
   the window you climb in. Level with him he is a squat goblin with a hot ladle and not much health. */
const SCALD = { band: 20, reach: 12 * 16, tell: 0.7, pour: 0.35, stir: 2.6, ladleTell: 0.45 };
function updateScalder(e, dt) {
  const d = P.x - e.x, ad = Math.abs(d), below = P.y - e.y, dy = Math.abs(below);
  e.vy += 1000 * dt; if (e.vy > 300) e.vy = 300;
  e.modeT -= dt; e.cd = Math.max(0, e.cd - dt); e.pourCd = Math.max(0, e.pourCd - dt);
  const lo = e.post[0] * TS + 4, hi = e.post[1] * TS + 12;
  const under = !P.dead && below > 20 && below < SCALD.reach && P.x > lo - 3 * TS && P.x < hi + 3 * TS;
  let want = 0;
  switch (e.mode) {
    case 'pourTell': want = 0;
      if (Math.random() < dt * 30) parts.push({ x: e.x + e.face * (6 + Math.random() * 8), y: e.y - 12 - Math.random() * 8, vx: 0, vy: -30, life: 0.4, max: 0.4, col: '#dfe8ff', size: 1, grav: 0 });
      if (e.modeT <= 0) { e.mode = 'pour'; e.modeT = SCALD.pour; }
      break;
    /* THE POUR - thrown here and not in the wind-up, so the mark audit can follow the chain to it */
    case 'pour': want = 0;
      if (!e.poured) { e.poured = 1; SFX.splash(); SFX.hiss();
        for (let k = 0; k < 3; k++) seeds.push({ x: e.x + e.face * 4, y: e.y - 4 - k * 9, vx: 0, vy: 40 + k * 10, g: 900, dead: false, life: 3, pitch: true, slag: true, unblockable: true, owner: e }); }
      if (e.modeT <= 0) { e.poured = 0; e.mode = 'stir'; e.modeT = SCALD.stir; }
      break;
    /* THE STIR - the pot coming back to the boil. This is the window: he pours nothing while he stirs. */
    case 'stir': want = 0;
      if (Math.random() < dt * 10) parts.push({ x: e.x + e.face * (6 + Math.random() * 8), y: e.y - 10, vx: 0, vy: -24, life: 0.6, max: 0.6, col: '#dfe8ff', size: 1, grav: 0 });
      if (e.modeT <= 0) e.mode = 'watch';
      break;
    case 'ladleTell': want = 0; e.face = Math.sign(d) || e.face;
      if (e.modeT <= 0) { e.mode = 'ladle'; e.modeT = 0.22; }
      break;
    case 'ladle': want = 0;
      if (!e.struck) { e.struck = 1; SFX.slash();
        if (!P.dead && Math.sign(d) === e.face && ad < 30 && dy < 22) { const res = damagePlayer(e.x, DMG.scalderLadle, { blow: 'THE LADLE' });
          if (answered(res)) { e.mode = 'reel'; e.modeT = 1.0; e.stagger = 1.0; e.struck = 0; number(e.x, e.y - e.h - 12, 'OPEN', '#8fd160'); break; } } }
      if (e.modeT <= 0) { e.struck = 0; e.mode = 'rest'; e.modeT = 0.5; e.cd = 1.2; }
      break;
    case 'reel': want = 0; if (e.modeT <= 0) { e.mode = 'watch'; e.stagger = 0; } break;
    case 'rest': want = 0; if (e.modeT <= 0) e.mode = 'watch'; break;
    default: e.mode = 'watch';
      /* E2: THE POUR GOES AT THE TOP OF THE CHAIN. A climber under him is the whole creature; the ladle is for a hero who
         has already got past it. */
      if (e.stagger > 0) break;
      if (under) { const tx = Math.max(lo, Math.min(hi, P.x));
        if (Math.abs(P.x - e.x) < SCALD.band && e.pourCd <= 0) { e.mode = 'pourTell'; e.modeT = SCALD.tell; e.pourCd = 0.6; e.face = e.face || 1;
          number(e.x, e.y - e.h - 12, '!!', '#ff6b6b'); SFX.charge(); }
        else if (Math.abs(tx - e.x) > 3) want = Math.sign(tx - e.x) * e.speed; }
      else if (!P.dead && dy < 22 && ad < 30 && e.cd <= 0) { e.face = Math.sign(d) || e.face; e.mode = 'ladleTell'; e.modeT = SCALD.ladleTell;
        number(e.x, e.y - e.h - 12, '!', '#ffd36b'); SFX.charge(); }
      else if (!P.dead && dy < 22 && ad < 90) e.face = Math.sign(d) || e.face;
  }
  if (e.stagger > 0) want = 0;
  e.vx += (want - e.vx) * Math.min(1, dt * 8);
  if ((e.x <= lo && e.vx < 0) || (e.x >= hi && e.vx > 0)) e.vx = 0;   /* he keeps to his post: off it is off the tower */
  const r = moveBody(e, e.vx * dt, e.vy * dt, false); if (r.ground) e.vy = 0;
  if (r.hitX) e.vx = 0;
  e.ground = r.ground; e.anim = (e.anim || 0) + dt;
}
'''
rep("// THE ROPE CUTTER - he wants the rope, not you. Ignoring him costs you the bridge.\nfunction updateCutter(e, dt) {",
    UPD.lstrip('\n') + "// THE ROPE CUTTER - he wants the rope, not you. Ignoring him costs you the bridge.\nfunction updateCutter(e, dt) {")
print('main.js patched')

# the voices (E9): his own death and his own hurt
p = 'src/audio.js'
s = io.open(p, encoding='utf8').read()
rep("  temperer() { gob(0.85, 0.6) ||", "  scalder() { gob(1.05, 0.55) || tone('sawtooth', 300, 80, 0.3, 0.18); SFX.clatter(); noise(0.6, 0.18, 1400, 0.4, 0.08); tone('sine', 120, 50, 0.4, 0.12, 0.1); /* the pot goes over and the pitch hisses out */ },\n  temperer() { gob(0.85, 0.6) ||")
rep("  temperer() { gobH(0.85) ||", "  scalder() { gobH(1.05) || tone('square', 520, 330, 0.08, 0.13); noise(0.1, 0.08, 1200, 0.6, 0.02); /* and the pot rocks under him */ },\n  temperer() { gobH(0.85) ||")
rep("hearthgob: 0.75, temperer: 0.85,", "hearthgob: 0.75, temperer: 0.85, scalder: 1.05,")
print('audio.js patched')

# the weight
p = 'src/threat.js'
s = io.open(p, encoding='utf8').read()
rep("  temperer: 3,", "  temperer: 3,\n  /* THE SCALDER: an archer's reach, aimed down a column instead of across a floor, on a creature that never leaves his post */\n  scalder: 2.5,")
print('threat.js patched')
