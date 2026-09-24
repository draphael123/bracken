# THE KNIGHT REWORK, chunk 1: THE PERFECT GUARD BECOMES THE STAR (docs/briefs/knight-rework.md)
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kpatch import patch as _p
ROOT = sys.argv[1]
def patch(path, pairs): _p(ROOT, path, pairs)

M = []
# the window, named once
M.append(("const ST = { swing: 12, plunge: 28, dodge: 16, blockHit: 11, hold: 6, regen: 48, delay: 0.5 };",
"const ST = { swing: 12, plunge: 28, dodge: 16, blockHit: 11, hold: 6, regen: 48, delay: 0.5 };\n"
"/* THE KNIGHT'S RIPOSTE (the knight rework, docs/briefs/knight-rework.md). A PERFECT GUARD - the shield RAISED as the blow lands,\n"
"   inside its six frames (twelve with PERFECT GUARD) - opens a window this long, and the first cut he starts inside it is a HEAVY\n"
"   cut whatever its place in the run: it counts as a third cut, with everything a third cut does. This is his answer to the\n"
"   Warden's deflect - a read, paid off where you can see it. (A plain block with the RIPOSTE talent keeps its own, older promise:\n"
"   the next swing within a breath cuts twice as hard, and it is not made heavy.) */\n"
"const RIPOSTE = { window: 0.6, beat: 0.25 };   /* beat: how long before the blow lands the wood's lesson swordsman's sword flashes for a knight */"))
# a plain block with the talent: the old x2, never the heavy riposte
M.append(("P.st -= bc; P.stDelay = ST.delay; blocks++; trialEvent('block'); if (tal('riposte')) P.riposteT = 1;",
          "P.st -= bc; P.stDelay = ST.delay; blocks++; trialEvent('block'); if (tal('riposte')) { P.riposteT = 1; P.riposteHeavy = false; }"))
# the perfect guard: the window, the flash and the clang
M.append(("P.st = Math.min(P.maxSt, P.st + 12 + (tal('parry') ? 10 : 0)); P.riposteT = 1;",
          "P.st = Math.min(P.maxSt, P.st + 12 + (tal('parry') ? 10 : 0)); P.riposteT = RIPOSTE.window; P.riposteHeavy = true; perfectGuardFx();"))
# a plain block in the wood's lesson stretch: say it was early
M.append(("      if (!rushUp) P.vx = -P.face * 90; hitstop(0.05); shakeCam(1.5, -P.face * 2); SFX.block();",
          "      if (!rushUp) guardEarlySay();\n      if (!rushUp) P.vx = -P.face * 90; hitstop(0.05); shakeCam(1.5, -P.face * 2); SFX.block();"))
# the effects, next to parryBurst
M.append(("/* THE PARRY GOES OFF: a star of light off the edge of the shield, a second ring twice the size, and a breath of white */",
"/* THE KNIGHT'S PERFECT GUARD GOES OFF BRIGHTER than any other hero's parry, because it is the thing he is FOR now: a white screen\n"
"   flash the size of a kill's, a bell-bright clang of its own (SFX.perfectGuard - never the plain block's knock or the parry's file),\n"
"   a star off the shield rim, and the word. The riposte window it opens is drawn on him until it is spent or gone (drawRiposteGlint). */\n"
"function perfectGuardFx() { const x = P.x + P.face * 10, y = P.y - 10;\n"
"  if (SFX.perfectGuard) SFX.perfectGuard(); if (SET.flashes) killFlash = Math.max(killFlash, 0.06);\n"
"  ringAt(x, y, 44, '#ffffff', 0.3); ringAt(x, y, 24, '#fff6c8', 0.45);\n"
"  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; parts.push({ streak: true, x, y, vx: Math.cos(a) * 260, vy: Math.sin(a) * 260, life: 0.16, max: 0.16, col: i % 2 ? '#ffffff' : '#fff6c8', size: 1, grav: 0 }); }\n"
"  lessonHint('parry'); }\n"
"/* A GUARD RAISED EARLY in the wood's lesson stretch is a block and not a perfect guard: say so, a few times, while it is true */\n"
"function guardEarlySay() { if (hero() !== 'knight' || !lessonAt('parry') || hintT > 0) return; if ((PROG.guardEarly || 0) >= 3 || (PROG.lessons && PROG.lessons.parry)) return;\n"
"  PROG.guardEarly = (PROG.guardEarly || 0) + 1; hintT = 3.5; hintMsg = 'TOO EARLY: THAT WAS ONLY A BLOCK. RAISE C AS HIS SWORD FLASHES, NOT BEFORE.'; }\n"
"/* THE RIPOSTE WINDOW, ON HIM: a gold ring round the sword hand that closes as the window does, and a glint running up the blade */\n"
"function drawRiposteGlint(cx, cy) {\n"
"  if (hero() !== 'knight' || !P.riposteHeavy || !(P.riposteT > 0) || P.dead) return;\n"
"  const k = Math.min(1, P.riposteT / RIPOSTE.window), x = Math.round(P.x - cx) + P.face * 7, y = Math.round(P.y - cy) - 12;\n"
"  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.35 + 0.5 * k; g.strokeStyle = '#ffd36b'; g.lineWidth = 1;\n"
"  g.beginPath(); g.arc(x, y, 6 + 12 * k, 0, 7); g.stroke();\n"
"  g.globalAlpha = 0.9; g.fillStyle = '#ffffff'; const gy = y - 2 - Math.floor((1 - k) * 10) % 6; g.fillRect(x - 1, gy, 3, 1); g.fillRect(x, gy - 1, 1, 3);\n"
"  g.restore(); }\n"
"/* THE PARRY GOES OFF: a star of light off the edge of the shield, a second ring twice the size, and a breath of white */"))
# the swing: a riposte is a heavy cut
M.append(("  P.heavySwing = P.combo % 3 === 0; const rip = P.riposteT > 0; P.swingRiposte=!!rip;",
"  /* THE KNIGHT'S RIPOSTE: a cut started inside a perfect guard's window IS a third cut, as EVASION's is - the count is\n"
"     moved on to the next third, so everything that reads the third cut (the shove, the throw, the poise, the swing-through,\n"
"     OPENED UP on the one who swung) reads this one. The doubling is the RIPOSTE talent's and only the talent's. */\n"
"  const ripHeavy = hero() === 'knight' && P.riposteT > 0 && !!P.riposteHeavy; if (ripHeavy) P.combo = Math.ceil(P.combo / 3) * 3;\n"
"  P.heavySwing = P.combo % 3 === 0; const rip = P.riposteT > 0; P.swingRiposte=!!rip;"))
M.append(("  P.swingMul = (P.heavySwing ? 1.5 + 0.25 * tal('thirdCut') : 1) * (rip ? 2 : 1);\n  if (rip) { P.riposteT = 0; ringAt(P.x + P.face * 10, P.y - 10, 12, '#ffd36b', 0.2); }",
"  P.swingMul = (P.heavySwing ? 1.5 + 0.25 * tal('thirdCut') : 1) * (rip && (!ripHeavy || tal('riposte')) ? 2 : 1);\n"
"  if (rip) { P.riposteT = 0; P.riposteHeavy = false; ringAt(P.x + P.face * 10, P.y - 10, 12, '#ffd36b', 0.2); }\n"
"  if (ripHeavy) { P.ripostes = (P.ripostes || 0) + 1; SFX.riposte(); number(P.x, P.y - 30, 'RIPOSTE', '#ffd36b'); ringAt(P.x + P.face * 12, P.y - 11, 22, '#fff6c8', 0.25); streaks(P.x + P.face * 12, P.y - 12, 7, ['#ffffff', '#ffd36b'], 190); zoomKick(1.03, 0.14); }"))
# the lesson's line
M.append(("  else if (kind === 'dashatk') hintMsg =",
"  else if (kind === 'parry') hintMsg = hero() === 'knight' ? 'A PERFECT GUARD: IT COST NOTHING AND HE REELS. CUT NOW - THE NEXT CUT LANDS HEAVY.' : 'ON THE BEAT: HE REELS OPEN. CUT HIM NOW.';\n"
"  else if (kind === 'dashatk') hintMsg ="))
# drawn every frame with the swing
M.append(("function drawSwing(cx, cy) {\n  drawRiseCrescent(cx, cy);",
          "function drawSwing(cx, cy) {\n  drawRiseCrescent(cx, cy); drawRiposteGlint(cx, cy);"))
# THE WOOD'S LESSON SWORDSMAN: a trial's tell, and the flash at the knight's own beat
M.append(("if (ad < 30 && wf === e.face && e.cd <= 0) { e.mode = 'cutTell'; e.modeT = L.trial ? 0.9 : 0.55; e.glint = 0;",
          "if (ad < 30 && wf === e.face && e.cd <= 0) { e.mode = 'cutTell'; e.modeT = L.trial || e.lesson ? 0.9 : 0.55; e.glint = 0;"))
M.append(("        if (L.trial && !e.glint && e.modeT <= PAL_BEAT) { e.glint = 1;",
          "        if ((L.trial || e.lesson) && !e.glint && e.modeT <= (e.lesson && hero() === 'knight' ? RIPOSTE.beat : PAL_BEAT)) { e.glint = 1;   /* THE WOOD'S LESSON (e.lesson): his sword flashes too, and for a knight at HIS beat - a reaction's length before the blow, so raising the shield as it flashes is a perfect guard */"))
M.append(("  if (e.trainer || e.lx0) for (let i = n0; i < enemies.length; i++) Object.assign(enemies[i], { trainer: e.trainer,",
          "  if (e.lesson) for (let i = n0; i < enemies.length; i++) enemies[i].lesson = e.lesson;   /* a lesson's foe (the wood's swordsman): slow, and his sword flashes */\n"
          "  if (e.trainer || e.lx0) for (let i = n0; i < enemies.length; i++) Object.assign(enemies[i], { trainer: e.trainer,"))
patch('src/main.js', M)

patch('src/audio.js', [("  parry() { file('parry', 0.5) || tone('square', 1200, 1900, 0.08, 0.16); },",
"  parry() { file('parry', 0.5) || tone('square', 1200, 1900, 0.08, 0.16); },\n"
"  /* THE KNIGHT'S PERFECT GUARD: a clang that rings like a bell - the steel knock high and bright, and two long clean partials over it.\n"
"     Nothing else in the game rings this long, so it is heard as THE thing, and never confused with a block's dull knock */\n"
"  perfectGuard() { file('clang', 0.55, 1.35); tone('sine', 2637, 2610, 0.55, 0.09); tone('sine', 3951, 3920, 0.4, 0.05, 0.01); tone('triangle', 1319, 1312, 0.35, 0.07); noise(0.04, 0.22, 6400, 1.2); },")])

L = []
L.append(("  const RC = LC.done();\n  const LB = grow(RC, RC, 98, 26);",
"  const RC = LC.done();\n"
"  // d. THE PERFECT GUARD (the knight rework): straight after the sign that teaches C, a lone SWORN SWORD on the flat - the slowest\n"
"  // blow in the game, one at a time, and his sword FLASHES on the beat (e.lesson: the trial's long tell, and for a knight the flash\n"
"  // comes a reaction's length before the blow lands). Raised as it flashes, the shield turns it for nothing, he reels, and the next\n"
"  // cut is heavy. Grown at 121 AFTER the badger, so it comes BEFORE the badger on the road.\n"
"  const LD = grow(RC, RC, 121, 26);\n"
"  LD.floor(121, 146, 22);\n"
"  LD.ent('check', 123, 21); LD.ent('deco', 125, 21, { kind: 'fern', v: 0 });\n"
"  LD.ent('sign', 127, 21, { text: 'RAISE C AS HIS SWORD FLASHES, NOT BEFORE: A PERFECT GUARD. HE REELS, AND YOUR NEXT CUT LANDS HEAVY.', pyro: 'ROLL THROUGH HIS CUT WITH V AS HIS SWORD FLASHES, AND HE REELS OPEN.', reaper: 'ROLL THROUGH HIS CUT WITH V AS HIS SWORD FLASHES, AND HE REELS OPEN.', paladin: 'HOLD C FOR THE AEGIS AS HIS SWORD FLASHES, AND HE REELS OPEN.', pirate: 'TAP C AS HIS SWORD FLASHES: THE PARRY TURNS IT, AND HE REELS OPEN.', warden: 'TAP C AS HIS SWORD FLASHES: THE DEFLECT TURNS IT, AND HE REELS OPEN.' });\n"
"  LD.coins([130, 20], [132, 19], [134, 20]);\n"
"  LD.ent('swornsword', 139, 21, { face: -1, lesson: 'parry' });\n"
"  LD.ent('deco', 143, 21, { kind: 'stump', v: 1 }); LD.coins([145, 20]);\n"
"  LD.R.lessons = (LD.R.lessons || []).concat([{ kind: 'parry', x0: 122, x1: 146 }]);\n"
"  const RD = LD.done();\n"
"  const LB = grow(RD, RD, 98, 26);"))
patch('src/level.js', L)
print('chunk 1 patched')
