# work/claude/winch-mutants.py - PROVE THE WINCHMASTER CHECKS ARE NOT VACUOUS (AGENT-HANDOFF: "verify a fix against the OLD code").
# The old fight cannot be run under the new checks at all (its `c` contract is gone: they crash, which is red but says nothing
# about any one check), so each check is proved the other way: break exactly the thing it guards, run tools/ore-road.mjs, and
# the named check must go FAIL. Every mutant is reverted whatever happens.
# usage (from the checkout root): python work/claude/winch-mutants.py
import subprocess, sys
MUT = [
  ('src/winchmaster.js', "if (!e.hk && !climbing && e.hookCd <= 0 && hd <", "if (false && e.hookCd <= 0 && hd <", ['THE HOOK: anyone in reach', 'A3: EVERY ATTACK']),
  ('src/winchmaster.js', "const r = c.hit(e.x, WINCH.dmg.lever, false, 'THE BRAKE BAR')", "const r = c.hit(e.x, WINCH.dmg.lever, true, 'THE BRAKE BAR')", ['a blow a shield turns (yellow)']),
  ('src/winchmaster.js', "e.toX = N.homeX; e.toY = N.topY; e.face", "e.toX = c.H[e.at].homeX; e.toY = c.H[e.at].topY; e.face", ['half way through the swing']),
  ('src/winchmaster.js', "if (e.modeT <= 0) { arrive(e, c, winchNext(e.at));", "if (e.modeT <= 0) { arrive(e, c, e.at);", ['the circuit is A -> B -> C -> A']),
  ('src/winchmaster.js', "revT: 2.5, revMul: 1.5, revCd: 12.0,", "revT: 2.5, revMul: 1.5, revCd: 7.0,", ['phase 1, THE GREAT DRUM: after a reverse']),
  ('src/winchmaster.js', "if (riding && riding.coming && riding.dist < WINCH.revRange", "if (riding && riding.coming", ['but not at a rider still far out']),
  ('src/winchmaster.js', "Math.abs(P.y - ly) < WINCH.sendH)", "Math.abs(P.y - ly) < 60)", ['a hero in the air over it is missed']),
  ('src/winchmaster.js', "if (res === 'hit') { c.drag(", "if (false) { c.drag(", ['DRAGS them toward him']),
  ('src/winchmaster.js', "c.drive(winchNext(at), 1, mulOf(e)); c.drive(at, 1, mulOf(e));", "c.drive(at, 1, mulOf(e));", ['turned round from the Tail Wheel toward the Head Frame']),
  ('src/winchmaster.js', "export const winchTake = e => winchOpen(e) ? WINCH.downMul : 1;", "export const winchTake = e => 1;", ['takes double while he is down']),
  ('src/winchmaster.js', "if (e.hp <= e.maxHp * 0.5 && e.phase !== 2) { e.phase = 2;", "if (false) { e.phase = 2;", ['PHASE TWO, said over him']),
  ('src/ore-road.js', "x1: 481, top: 4, home: 478.5", "x1: 481, top: 5, home: 478.5", ['four rows under it']),
  ('src/ore-road.js', "ledge: [482, 484, 18], ladder: [482, 13, 18] }", "ledge: [482, 484, 18], ladder: [482, 14, 18] }", ['the drum pit']),
  ('src/main.js', "keys.down && !ln.drum) { m.dump += dt;", "keys.down) { m.dump += dt;", ["a drum line's skips cannot be tipped"]),
  ('src/winchmaster.js', "if (((riding && riding.dist > WINCH.sendMin) || c.onLine(e.at)) && !climbing && !atMouth", "if ((riding || c.onLine(e.at)) && !climbing && !atMouth", ['is never sent a bucket']),
  ('src/winchmaster.js', "const pick = can.length > 1 ? can.find(k => k !== e.last) : can[0];", "const pick = can[0];", ['in turn, never one starving']),
  ('src/winchmaster.js', "if (!c.seen()) { e.cd = Math.max(e.cd, 0.25); return; }", "", ['off the hero']),
  ('src/winchmaster.js', "if (r.delay <= 0 && c.atMouth(r.at, WINCH.sendR * 2 + 8)) e.runaway = r.next || null;", "", ['not sent the second one on top']),
  ('src/winchmaster.js', "if (r.delay > 0) { if (prev) prev.next = null; else e.runaway = null; break; }", "", ['a jammed drum lets nothing go']),
  ('src/ore-road.js', "{ id: 'steep', x0: 353, x1: 407,", "{ id: 'steep', x0: 353, x1: 390,", ['reaches the bottom of the level']),
  ('src/ore-road.js', "PIT_BITE: 0.2,", "PIT_BITE: 0.5,", ['a fifth of your health']),
  ('src/ore-road.js', "CEIL_GAP: 6,", "CEIL_GAP: 2,", ['the ceiling keeps']),
  ('src/ore-road.js', "ROCK_TELL: 1.0,", "ROCK_TELL: 0.5,", ['rockfalls is told']),
  ('src/art.js', "rect(g, 1, 31, 18, 3, '#4a321e'); rect(g, 1, 31, 18, 1, '#6a4a2c'); rect(g, 1, 33, 18, 1, '#2e2014');", "rect(g, 1, 31, 8, 3, '#4a321e');", ['sits on it with a flat foot']),
  ('src/ore-road.js', "ent('check', 415, WINCH);", "ent('check', 414, WINCH);", ['stands on a flat floor']),
  ('src/winchmaster.js', "if (e.qMark !== undefined && e.qMark - e.hp >= e.maxHp * WINCH.retreat) {", "if (false) {", ['HE RETREATS']),
  ('src/winchmaster.js', "retreat: 0.25,", "retreat: 0.1,", ['retreats 9 times']),
  ('src/winchmaster.js', "c.drag(c.onHousing(e.at) ? H.away : (Math.sign(e.x - P.x) || 1))", "c.drag(Math.sign(e.x - P.x) || 1)", ['off its edge, toward the gorge']),
  ('src/winchmaster.js', "|| (c.onHousing(e.at) && Math.abs(P.x - e.x) < WINCH.leverHit))) { const r", ")) { const r", ['a shield turns it']),
  ('src/winchmaster.js', "rockEveryP2: 3.5,", "rockEveryP2: 7,", ['twice as often']),
  ('src/winchmaster.js', "(e.rocks || (e.rocks = [])).push({ x: sp.x, y0: sp.y0, gy: sp.gy, t: WINCH.rockTell });", "c.dropRock(sp.x, sp.y0);", ['every rock that falls is told']),
  ('src/ore-road.js', "ladder: [482, 5, 18] },", "ladder: [482, 6, 18] },", ['THE HEAD FRAME: a ladder up']),
  ('src/winchmaster.js', "if (e.phase === 2 && e.leapCd <= 0) {", "if (false) {", ['he crouches']),
  ('src/winchmaster.js', "c.drive(0, (at === 0 || winchNext(at) === 0) ? 1 : -1, mulOf(e));", "", ['runs back to the deck']),
  ('src/ore-road.js', "x1: 508, top: 4", "x1: 505, top: 4", ['a platform to fight on']),
  ('src/winchmaster.js', "if (!e.hk && !climbing && e.hookCd <= 0", "if (!e.hk && e.hookCd <= 0", ['neither hooked nor sent']),
  ('src/winchmaster.js', "&& hd < WINCH.hookR * 0.9 && hd > WINCH.leverHit + 12) can.push('hook');", "&& hd < WINCH.hookR * 0.9) can.push('hook');", ["never from arm's length"]),
  ('src/marks.js', "'winchmaster|hookTell': '!!',", "'winchmaster|cutTell': '!!',", ['no longer shows a cut']),
]
bad = 0
for f, a, b, want in MUT:
    s = open(f, encoding='utf-8').read()
    if s.count(a) != 1: print('MUTANT DOES NOT APPLY:', f, a[:60]); bad += 1; continue
    try:
        open(f, 'w', encoding='utf-8', newline='').write(s.replace(a, b))
        out = subprocess.run([sys.executable.replace('python.exe', 'node.exe') if False else 'node', 'tools/ore-road.mjs'], capture_output=True, text=True, encoding='utf-8').stdout
    finally:
        open(f, 'w', encoding='utf-8', newline='').write(s)
    fails = [l for l in out.splitlines() if l.startswith('  FAIL')]
    hit = all(any(w in l for l in fails) for w in want) if want else bool(fails)
    print(('RED  ' if hit and fails else 'MISS ') + f + ': ' + b[:70] + '\n       -> ' + (' | '.join(l[7:90] for l in fails[:3]) if fails else 'nothing failed'))
    if not (hit and fails): bad += 1
print('\n%d mutant(s) survived' % bad if bad else '\nevery mutant was caught')
sys.exit(1 if bad else 0)
