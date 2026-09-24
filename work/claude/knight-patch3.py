# THE KNIGHT REWORK, chunk 3: BLOCKING IS A CHOICE, NOT A DEFAULT (docs/briefs/knight-rework.md)
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kpatch import patch as _p
ROOT = sys.argv[1]
def patch(path, pairs): _p(ROOT, path, pairs)

M = []
M.append(("const ST = { swing: 12, plunge: 28, dodge: 16, blockHit: 11, hold: 6, regen: 48, delay: 0.5 };",
"const ST = { swing: 12, plunge: 28, dodge: 16, blockHit: 11, hold: 15, regen: 48, delay: 0.5 };   /* hold: 6 -> 15 a second (the knight rework): a raised shield empties a full bar in under seven seconds, so turtling is a cost and a timed guard - free - is the answer */\n"
"/* HOLDING THE SHIELD COSTS, and only holding it. The first moments of a guard - the perfect guard's own window - are free, so a\n"
"   shield raised on the beat costs nothing at all (and the parry pays wind back); after that it drains ST.hold a second, half\n"
"   that with STEADY ARM (it made holding free, which made holding the default). HEAVY BLOWS PUSH HIM: a blow on the shield\n"
"   shoves him back by how hard it was, from a light one's step to a heavy one's slide (guardPush). */\n"
"const perfectWindow = () => tal('parry') ? 0.22 : 0.11;\n"
"function guardHoldDrain(dt) { if ((P.blockT || 0) <= perfectWindow()) return; P.st -= ST.hold * dt * (tal('holdLine') ? 0.5 : 1); }\n"
"const guardPush = dmg => Math.min(260, 90 + Math.max(0, dmg - 12) * 9);"))
M.append(("    if (!tal('holdLine')) P.st -= ST.hold * dt; P.stDelay = ST.delay;   /* STEADY ARM (the knight's; it was HOLD THE LINE, a name the warden's capstone also had) */",
          "    guardHoldDrain(dt); P.stDelay = ST.delay;   /* STEADY ARM halves it (the knight's; it was HOLD THE LINE, a name the warden's capstone also had) */"))
M.append(("  if (P.block) { if (!tal('holdLine')) P.st -= ST.hold * dt; P.stDelay = ST.delay;",
          "  if (P.block) { guardHoldDrain(dt); P.stDelay = ST.delay;"))
M.append(("  const perfectUp = !rushUp && (P.blockT || 0) < (tal('parry') ? 0.22 : 0.11);",
          "  const perfectUp = !rushUp && (P.blockT || 0) < perfectWindow();"))
M.append(("      if (!rushUp) P.vx = -P.face * 90; hitstop(0.05); shakeCam(1.5, -P.face * 2); SFX.block();",
          "      const push = guardPush(dmg), hard = push > 150;   /* a heavy blow on the shield SLIDES him */\n"
          "      if (!rushUp) { P.vx = -P.face * push; if (hard) { dust(P.x - P.face * 4, P.y, 5); number(P.x, P.y - 22, 'PUSHED BACK', '#c9d1dc'); } }\n"
          "      hitstop(hard ? 0.08 : 0.05); shakeCam(hard ? 3 : 1.5, -P.face * 2); SFX.block();"))
M.append(("'AGAINST THE WALL', 'BOWLED OVER', 'ON THE SPIKES', 'OFF THE EDGE', 'INTO THE WATER']);",
          "'AGAINST THE WALL', 'BOWLED OVER', 'ON THE SPIKES', 'OFF THE EDGE', 'INTO THE WATER', 'PUSHED BACK']);"))
patch('src/main.js', M)
patch('src/progression-catalog.js', [('"desc": "holding the shield up costs no wind: only what lands on it does",',
                                      '"desc": "holding the shield up costs half the wind. what lands on it costs the same",')])
print('chunk 3 patched')
