# THE KNIGHT REWORK, chunk 2: THE THIRD CUT PAYS FOR WHERE YOU FINISH (docs/briefs/knight-rework.md)
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kpatch import patch as _p
ROOT = sys.argv[1]
def patch(path, pairs): _p(ROOT, path, pairs)

M = []
# knockFoe says whether it threw
M.append(("  if (!e.alive || e.maxHp || e.mini || e.slamming || e.mounted || KNOCK_SKIP.has(e.t)) return;   /* a horse is not thrown across the road by a sword */\n  e.slammed = false;\n  const wt = POISE_HEAVY.has(e.t) || e.big ? 0.45 : 1;\n  e.knockAir = 0; e.knock = 0.45; e.kvx = dir * Math.max(150, push * 1.15) * wt; e.kvy = Math.min(e.vy || 0, -150 * wt); e.bounced = false;   /* (bounced: it comes up off the floor once when it lands) */\n}",
"  if (!e.alive || e.maxHp || e.mini || e.slamming || e.mounted || KNOCK_SKIP.has(e.t)) return false;   /* a horse is not thrown across the road by a sword */\n  e.slammed = false; e.thirdT = 0;   /* (a throw is the knight's third-cut throw only if the third cut marks it, after this) */\n  const wt = POISE_HEAVY.has(e.t) || e.big ? 0.45 : 1;\n  e.knockAir = 0; e.knock = 0.45; e.kvx = dir * Math.max(150, push * 1.15) * wt; e.kvy = Math.min(e.vy || 0, -150 * wt); e.bounced = false;   /* (bounced: it comes up off the floor once when it lands) */\n  return true;\n}"))
# the third cut throws, for every knight now; the talent throws further
M.append(("      if (!e.maxHp && !e.mini && (P.heavy || P.dash > 0 || P.dashAtk > 0 || hurtKnock || (P.heavySwing && P.atk >= 0 && hero() === 'knight' && tal('thirdCut')))) knockFoe(e, dir, push);   /* THIRD CUT: the end of a run throws them */",
"      /* THE KNIGHT'S THIRD CUT THROWS, every knight's now and not only the talent's: where he finishes the run is the decision.\n"
"         A body it throws is MARKED (e.thirdT) for a moment, and what the throw ends in pays (thirdPay): a wall, the spikes, a drop,\n"
"         deep water or another foe. Open air pays nothing. The held heavy cut and the shield bash (P.heavy) are not third cuts. */\n"
"      const thirdThrow = hero() === 'knight' && P.heavySwing && P.atk >= 0 && !P.heavy && !hurtKnock && !thirdPaying;\n"
"      if (!e.maxHp && !e.mini && (P.heavy || P.dash > 0 || P.dashAtk > 0 || hurtKnock || thirdThrow)) { const thrown = knockFoe(e, dir, thirdThrow && !(P.dash > 0 || P.dashAtk > 0) ? push * (tal('thirdCut') ? THIRD_PAY.talentThrow : 1) : push);   /* THIRD CUT (the talent): it throws them further */\n"
"        if (thrown && thirdThrow) e.thirdT = time + THIRD_PAY.live; }"))
# the wall slam, when it is the third cut's
M.append(("function wallSlam(e) {\n  const dir = Math.sign(e.kvx) || 1; e.slammed = true; e.kvx = -dir * Math.min(200, Math.abs(e.kvx) * 0.55); e.kvy = -130; e.knock = Math.max(e.knock, 0.3); e.knockAir = 0;\n",
"function wallSlam(e) {\n  const dir = Math.sign(e.kvx) || 1; e.slammed = true; e.kvx = -dir * Math.min(200, Math.abs(e.kvx) * 0.55); e.kvy = -130; e.knock = Math.max(e.knock, 0.3); e.knockAir = 0;\n"
"  if (e.thirdT > time) { thirdPay(e, 'wall', null, dir); return; }   /* THE KNIGHT'S THIRD CUT into the wall: its own, bigger payoff */\n"))
# the payoff itself, beside the wall slam
M.append(("const KNOCK_SKIP = new Set(['hedgewarden',",
"/* THE THIRD CUT PAYS FOR WHERE YOU FINISH (the knight rework). A body the knight's third cut threw that ENDS in something pays:\n"
"   against a wall or into another foe it takes a second, bigger blow (mul x his sword) and reels; into the spikes, a drop or deep\n"
"   water the room kills it as it always did (hazardFoe) and now it is said and heard as his. Each has the same feedback, loud on\n"
"   purpose - the stop, the shake, the zoom, a crunch of its own (SFX.thirdCrunch), the word and the number - because the tip hit's\n"
"   ring is what makes the Warden's swing a decision, and this is his. Thrown into open air, nothing: the choice is where to stand.\n"
"   live: how long a throw stays his (a drop can take a while to reach the bottom). other: the share the foe it was thrown into takes.\n"
"   talentThrow: THIRD CUT (the talent) throws them this much further. */\n"
"const THIRD_PAY = { live: 1.4, mul: 1.6, other: 0.8, stagger: 1.2, talentThrow: 1.4, minSpeed: 30 };\n"
"const THIRD_WORD = { wall: 'AGAINST THE WALL', foe: 'BOWLED OVER', spikes: 'ON THE SPIKES', pit: 'OFF THE EDGE', water: 'INTO THE WATER' };\n"
"let thirdPaying = false;   /* the blow the payoff lands is not itself a third cut, or one throw would bowl a whole room */\n"
"function thirdPay(e, kind, other, dir) {\n"
"  e.thirdT = 0; dir = dir || Math.sign(e.kvx) || P.face; P.thirdPays = (P.thirdPays || 0) + 1; P.thirdPayLast = kind;\n"
"  const y = e.y - (e.h || 16) / 2;\n"
"  hitstop(0.12); shakeCam(6, dir * 3); zoomKick(1.08, 0.25); if (SFX.thirdCrunch) SFX.thirdCrunch(kind);\n"
"  ringAt(e.x, y, 26, '#fff6e0', 0.35); ringAt(e.x, y, 12, '#ffd36b', 0.25); sparks(e.x + dir * 6, y, -dir, 10); dust(e.x + dir * 6, e.y - 4, 8);\n"
"  burst(e.x + dir * 4, y, 10, ['#fff6e0', '#ffd36b', '#c9b27c'], 110, 0.45);\n"
"  number(e.x, e.y - (e.h || 16) - 18, THIRD_WORD[kind], '#ffd36b');\n"
"  if (kind !== 'wall' && kind !== 'foe') return;   /* the room does the rest */\n"
"  thirdPaying = true; try {\n"
"    e.slamming = true; hurtEnemy(e, Math.max(6, Math.round(swordDmg() * THIRD_PAY.mul)), e.x - dir * 20, false); e.slamming = false;\n"
"    if (e.alive) e.stagger = Math.max(e.stagger || 0, THIRD_PAY.stagger);\n"
"    if (other && other.alive) { other.slamming = true; hurtEnemy(other, Math.max(4, Math.round(swordDmg() * THIRD_PAY.mul * THIRD_PAY.other)), e.x, false); other.slamming = false;\n"
"      if (other.alive) { other.stagger = Math.max(other.stagger || 0, THIRD_PAY.stagger); knockFoe(other, dir, 170); other.thirdT = 0; } }\n"
"  } finally { thirdPaying = false; e.slamming = false; if (other) other.slamming = false; } }\n"
"/* what a third-cut throw has run into: another creature standing in its way, on its level (not a boss's own hide: it takes the blow\n"
"   and is not thrown, which knockFoe already refuses) */\n"
"function bowlTarget(e) { const b = box(e); b.l -= 2; b.r += 2;\n"
"  for (const q of enemies) if (q !== e && q.alive && !q.harmless && !(q.gone > 0) && !q.trainer && q.t !== 'dummy' && overlap(b, box(q))) return q; return null; }\n"
"const KNOCK_SKIP = new Set(['hedgewarden',"))
# the spikes, the drop and the water: the room kills it, and says it was his
M.append(("  if (!why) return false;\n  number(e.x, Math.min(e.y, LH * TS) - (e.h || 16) - 10, why, '#8fd160');",
"  if (!why) return false;\n  if (e.thirdT > time) thirdPay(e, why === 'IMPALED' ? 'spikes' : why === 'DROWNED' ? 'water' : 'pit');   /* the knight's third cut put it there */\n"
"  number(e.x, Math.min(e.y, LH * TS) - (e.h || 16) - 10, why, '#8fd160');"))
# in flight: a wall at any speed a third cut can give, or another foe
M.append(("      if (!e.slammed && Math.abs(e.kvx) > 110 && Math.abs(e.x - kx0) < Math.abs(e.kvx * dt) * 0.3) wallSlam(e);",
"      if (e.thirdT > time && !e.slammed && Math.abs(e.kvx) > THIRD_PAY.minSpeed) {   /* a THIRD-CUT throw finds the wall at any speed it was given (a heavy foe's is slow), or a foe */\n"
"        if (Math.abs(e.x - kx0) < Math.abs(e.kvx * dt) * 0.3) wallSlam(e); else { const q = bowlTarget(e); if (q) { e.slammed = true; e.kvx *= -0.3; thirdPay(e, 'foe', q); } } }\n"
"      if (!e.slammed && Math.abs(e.kvx) > 110 && Math.abs(e.x - kx0) < Math.abs(e.kvx * dt) * 0.3) wallSlam(e);"))
# the words may float
M.append(("'KNOCKED DOWN', 'ON ITS BACK', 'DISARMED']);",
          "'KNOCKED DOWN', 'ON ITS BACK', 'DISARMED', 'AGAINST THE WALL', 'BOWLED OVER', 'ON THE SPIKES', 'OFF THE EDGE', 'INTO THE WATER']);   /* (the last five: the knight's third cut, paid where it threw them - THIRD_WORD) */"))
# the first-times hint says what the third cut is for now
M.append(("      hintMsg = 'THE THIRD SWING IN A RUN IS A HEAVY CUT THAT SHOVES. STOP SWINGING AND IT STARTS OVER.'; } } }",
          "      hintMsg = hero() === 'knight' ? 'THE THIRD SWING IN A RUN THROWS THEM. THROW THEM AT A WALL, THE SPIKES OR EACH OTHER.' : 'THE THIRD SWING IN A RUN IS A HEAVY CUT THAT SHOVES. STOP SWINGING AND IT STARTS OVER.'; } } }"))
patch('src/main.js', M)

patch('src/audio.js', [("  perfectGuard() {",
"  /* THE KNIGHT'S THIRD CUT, PAID: a body driven into something. Stone and a deep knock for a wall, a wet crack for the spikes, a\n"
"     wooden clatter of two bodies for a foe, a splash and a fall for water and a drop - over the one low thump they all share */\n"
"  thirdCrunch(k) { file('imp_stone', 0.5, k === 'foe' ? 1.2 : 0.8); tone('sine', 120, 45, 0.3, 0.2); noise(0.12, 0.3, 900, 0.8);\n"
"    if (k === 'spikes') { file('crack', 0.35, 1.3); noise(0.08, 0.2, 3200, 1.5, 0.03); } else if (k === 'foe') { file('imp_wood', 0.3, 1.1); tone('square', 220, 140, 0.08, 0.06, 0.05); }\n"
"    else if (k === 'water' || k === 'pit') tone('triangle', 520, 160, 0.35, 0.06, 0.04); else file('imp_steelH', 0.2, 0.7); },\n"
"  perfectGuard() {")])

patch('src/progression-catalog.js', [('"desc": "the third cut of a run throws what it hits bodily, like the heavy cut: into the wall, the water or the spikes",',
 '"desc": "the third cut of a run already throws: with this it throws them further and cuts a quarter harder",')])
print('chunk 2 patched')
