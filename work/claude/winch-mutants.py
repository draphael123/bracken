# work/claude/winch-mutants.py - PROVE THE WINCHMASTER CHECKS ARE NOT VACUOUS (AGENT-HANDOFF: "verify a fix against the OLD code").
# The old fight cannot be run under the new checks at all (its `c` contract is gone: they crash, which is red but says nothing
# about any one check), so each check is proved the other way: break exactly the thing it guards, run tools/ore-road.mjs, and
# the named check must go FAIL. Every mutant is reverted whatever happens.
# usage (from the checkout root): python work/claude/winch-mutants.py
import subprocess, sys
MUT = [
  ('src/winchmaster.js', "if (!e.hk && e.hookCd <= 0 && Math.hypot(", "if (false && !e.hk && e.hookCd <= 0 && Math.hypot(", ['THE HOOK: anyone in reach', 'A3: EVERY ATTACK']),
  ('src/winchmaster.js', "const r = c.hit(H.drumX, WINCH.dmg.lever, false, 'THE BRAKE BAR')", "const r = c.hit(H.drumX, WINCH.dmg.lever, true, 'THE BRAKE BAR')", ['a blow a shield turns (yellow)']),
  ('src/winchmaster.js', "if (e.phase === 2 && e.stay <= 0) {", "if (false) {", ['has left the Great Drum by himself']),
  ('src/winchmaster.js', "e.toX = N.homeX; e.toY = N.topY;", "e.toX = c.H[e.at].homeX; e.toY = c.H[e.at].topY;", ['half way through the swing']),
  ('src/winchmaster.js', "if (e.modeT <= 0) { arrive(e, c, winchNext(e.at));", "if (e.modeT <= 0) { arrive(e, c, e.at);", ['the circuit is A -> B -> C -> A']),
  ('src/winchmaster.js', "revT: 2.5, revMul: 1.5, revCd: 12.0,", "revT: 2.5, revMul: 1.5, revCd: 7.0,", ['phase 1, THE GREAT DRUM: after a reverse']),
  ('src/winchmaster.js', "if (riding && riding.coming && riding.dist < WINCH.revRange", "if (riding && riding.coming", ['but not at a rider still far out']),
  ('src/winchmaster.js', "Math.abs(P.y - ly) < WINCH.sendH)", "Math.abs(P.y - ly) < 60)", ['a hero in the air over it is missed']),
  ('src/winchmaster.js', "if (res === 'hit') { c.drag(", "if (false) { c.drag(", ['DRAGS them toward him']),
  ('src/winchmaster.js', "c.drive(winchNext(at), 1, mulOf(e)); c.drive(at, 1, mulOf(e));", "c.drive(at, 1, mulOf(e));", ['turned round from the Tail Wheel toward the Head Frame']),
  ('src/winchmaster.js', "export const winchTake = e => winchOpen(e) ? WINCH.downMul : 1;", "export const winchTake = e => 1;", ['takes double while he is down']),
  ('src/winchmaster.js', "if (e.hp <= e.maxHp * 0.5 && e.phase !== 2) { e.phase = 2;", "if (false) { e.phase = 2;", ['PHASE TWO, said over him']),
  ('src/ore-road.js', "{ id: 'B', name: 'THE HEAD FRAME', x0: 476, x1: 480, top: 4,", "{ id: 'B', name: 'THE HEAD FRAME', x0: 476, x1: 480, top: 5,", ['THE HEAD FRAME (row 5']),
  ('src/ore-road.js', "ropes: [[481, 13, 22], [484, 9, 22], [498, 9, 22]]", "ropes: [[481, 13, 22], [484, 8, 22], [498, 9, 22]]", ['THE HEAD FRAME (row 4']),
  ('src/main.js', "keys.down && !ln.drum) { m.dump += dt;", "keys.down) { m.dump += dt;", ["a drum line's skips cannot be tipped"]),
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
