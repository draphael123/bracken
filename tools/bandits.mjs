// tools/bandits.mjs — THE SUNKEN CARAVAN's THREE BANDITS (src/desert-foes.js; docs/briefs/caravan-ruins-bandits.md), proved in Node,
// and the wiring the game needs for each of them read off the source. Daniel, 2026-09-25: "I don't want goblins in the level. There
// should be new bandit enemies replacing them." Node only: no page, no port, no Chrome. usage: node tools/bandits.mjs
//   THE CUTTHROAT  every told blow fires; THE FEINT is told and throws nothing, and it wears no mark (rule H) while the real
//                  cut wears the yellow !; a fighter who reads the mark takes nothing, one who answers the FIRST windup he sees
//                  and then drops his guard is caught by the real one - the feint does something
//   THE SLINGER    the whirl marks the spot you stand on and the stone lands THERE: step off it and the stone misses, stand and it
//                  hits, block and the shield turns it; up close he kicks, told
//   THE AMBUSHER   buried he is untouchable and harmless (nothing he does from under the sand hurts), he rises only when you pass,
//                  the rise is told, both cuts are told, and he comes up again ahead of you
//   THE WIRING     each kind has a spawn case, health, a sprite (every frame on one canvas, E6), a bestiary row, a death and a hurt
//                  voice (E9), a death material, a threat weight, its marks, and it is in the caravan's hands (CV_FOES); and no
//                  goblin is left in the level (the sand goblin, the goblin thief and the goblin archer)
import { readFileSync } from 'fs';
import { install } from './node-canvas.mjs';
install();
const F = await import('../src/desert-foes.js');
const ART = await import('../src/redraw/caravan_bandits.js');
const { MARK, BY_HAND } = await import('../src/marks.js');
const { THREAT } = await import('../src/threat.js');
const { MATERIAL_OF } = await import('../src/death-fx.js');

let fails = 0; const log = s => console.log(s), ok = (c, m) => { log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const DT = 1 / 60, FLOOR = 320;

/* A FIGHTER on flat ground at FLOOR who walks in to 16 px. policy(o, t) is asked about each tell as it shows and says what to do
   0.25 s later (or [what, when] - a stone is blocked as it comes down the arc, not as the sling starts to whirl): 'block' (the shield up for 0.7 s), 'step' (off the marked spot / away from the foe for 0.7 s) or nothing. */
function duel(make, step, policy, { secs = 30, py = FLOOR, standOff = 16 } = {}) {
  const e = make(); let px = e.x - 90, face = 1, t = 0, block = 0, flee = 0, fleeFrom, inv = 0, pending = [], hits = 0, blocked = 0, tells = {}, marks = {}, hitsBy = {};
  while (t < secs) {
    const out = step(e, { px, py, pface: face, time: t }, DT);
    for (const o of out) {
      if (o.t === 'tell') { tells[o.what] = (tells[o.what] || 0) + 1; (marks[o.what] = marks[o.what] || new Set()).add(o.mark); const a = policy(o, t); if (a) pending.push(Array.isArray(a) ? [t + a[1], a[0], o.x] : [t + 0.25, a, o.x]); }
      if (o.t === 'hit' && inv <= 0 && px >= o.box[0] - 5 && px <= o.box[1] + 5 && py - 14 <= o.box[3] && py >= o.box[2]) {
        if (o.blockable && block > 0) blocked++; else { hits++; hitsBy[o.what] = (hitsBy[o.what] || 0) + 1; } inv = 0.6; if (o.stone) e.stone = null; } }
    pending = pending.filter(([at, a, mx]) => { if (t < at) return true; if (a === 'block') block = 0.7; else if (a === 'step') { flee = 0.7; fleeFrom = mx; } return false; });
    const ex = e.x; if (flee > 0) { const from = fleeFrom ?? ex; px += (Math.sign(px - from) || -1) * 92 * DT; flee -= DT; if (flee <= 0) fleeFrom = undefined; }
    else if (Math.abs(ex - px) > standOff) { px += Math.sign(ex - px) * 92 * DT * (block > 0 ? 0.35 : 1); face = Math.sign(ex - px) || face; }
    block = Math.max(0, block - DT); inv = Math.max(0, inv - DT); t += DT; }
  return { hits, blocked, tells, marks, hitsBy };
}
const byMark = o => o.mark === '!' ? 'block' : o.mark === 'X' || o.mark === '!!' ? 'step' : null;   /* the house marks, read as a player reads them: a feint wears none */

log('THE CUTTHROAT: he feints, and the mark says which one is real');
{ const mk = () => F.newCutthroat(400, FLOOR);
  const reader = duel(mk, F.cutthroatStep, byMark), idle = duel(mk, F.cutthroatStep, () => null);
  ok(reader.tells.feint > 0 && reader.tells.slash > 0 && reader.hits === 0 && idle.hits > 0,
    `told feint x${reader.tells.feint}, slash x${reader.tells.slash}; a fighter who blocks on the mark takes ${reader.hits} (${reader.blocked} blocked), one who ignores it takes ${idle.hits}`);
  ok([...reader.marks.feint].join() === '' && [...reader.marks.slash].join() === '!', `the feint wears no mark (it throws nothing: rule H) and the real cut the yellow ! - distinct, the one to read`);
  /* THE FEINT DOES SOMETHING: a fighter who answers the FIRST windup he sees and then drops his guard (no block again within 1.2 s) */
  let last = -9; const eager = duel(mk, F.cutthroatStep, (o, t) => { if (t - last < 1.2) return null; last = t; return 'block'; });
  ok(eager.hits > 0 && (eager.hitsBy.slash || 0) === eager.hits, `a fighter who blocks the first windup he sees and then lowers his shield is cut ${eager.hits} times by the real one behind the feint`);
  /* and the feint is a pose of its own: no blow in feintTell or feintHold, and the real windup is longer than the feint's */
  const e = mk(); let blowInFeint = 0, sawHold = false; for (let t = 0; t < 20; t += DT) { const m0 = e.mode; const out = F.cutthroatStep(e, { px: 380, py: FLOOR, pface: 1, time: t }, DT);
    if (e.mode === 'feintHold') sawHold = true; if ((m0 === 'feintTell' || m0 === 'feintHold') && out.some(o => o.t === 'hit')) blowInFeint++; }
  ok(sawHold && blowInFeint === 0 && F.CUTTHROAT.slashTell > F.CUTTHROAT.feintTell, `the feint throws nothing (${blowInFeint} blows) and stops short (feintHold); the real windup is told longer (${F.CUTTHROAT.slashTell} s against ${F.CUTTHROAT.feintTell} s)`); }

log('THE ROOFTOP SLINGER: the stone lands where he marked');
{ const mk = () => F.newSlinger(400, FLOOR - 160);   /* up on a roof ten tiles over the road */
  const stand = duel(mk, F.slingerStep, () => null, { standOff: 200 }), blocker = duel(mk, F.slingerStep, o => o.mark === '!' ? ['block', F.SLINGER.whirl + F.SLINGER.flight - 0.45] : null, { standOff: 200 }), stepper = duel(mk, F.slingerStep, () => 'step', { standOff: 200 });
  ok(stand.tells.sling > 0 && stand.hits > 0 && blocker.hits === 0 && blocker.blocked > 0 && stepper.hits === 0,
    `told sling x${stand.tells.sling}: a man who stands on his mark is stoned ${stand.hits} times; one who blocks on the ! turns ${blocker.blocked} and takes ${blocker.hits}; one who steps off the mark takes ${stepper.hits}`);
  const s = mk(); let tell = null, land = null; for (let t = 0; t < 6 && !land; t += DT) for (const o of F.slingerStep(s, { px: 300, py: FLOOR, pface: 1, time: t }, DT)) { if (o.t === 'tell' && o.what === 'sling' && !tell) tell = [o.x, o.y, t]; if (o.t === 'land') land = [o.x, o.y, t]; }
  ok(tell && land && Math.abs(land[0] - tell[0]) < 1 && Math.abs(land[1] - tell[1]) < 1 && land[2] - tell[2] >= 1.2,
    `the whirl marks the spot (${tell && tell.slice(0, 2).map(Math.round)}) and the stone lands on it ${land && (land[2] - tell[2]).toFixed(2)} s later: time to read the arc and leave it`);
  const k = duel(() => F.newSlinger(400, FLOOR), F.slingerStep, byMark, { standOff: 12 }), k0 = duel(() => F.newSlinger(400, FLOOR), F.slingerStep, () => null, { standOff: 12 });
  ok(k.tells.kick > 0 && k.hits === 0 && k0.hits > 0, `up on his roof with him: he kicks, told x${k.tells.kick}; blocked on the mark it lands ${k.hits} times, ignored ${k0.hits}`); }

log('THE SAND-CLOAKED AMBUSHER: harmless and untouchable under the sand');
{ const a = F.newAmbusher(400, FLOOR);
  ok(!F.ambusherTouchable(a), 'buried he cannot be hit: a mound with two eyes, and the blade goes through the cloak');
  let hurtBuried = 0, rose = false; for (let t = 0; t < 10; t += DT) { const out = F.ambusherStep(a, { px: 250, py: FLOOR, pface: 1, time: t }, DT); if (out.some(o => o.t === 'hit')) hurtBuried++; if (a.mode !== 'buried') rose = true; }
  ok(hurtBuried === 0 && !rose, 'ten seconds with you standing off: he never rises and nothing he does hurts (harmless while buried)');
  const r = duel(() => F.newAmbusher(400, FLOOR), F.ambusherStep, byMark), p = duel(() => F.newAmbusher(400, FLOOR), F.ambusherStep, () => null);
  ok(r.tells.rise > 0 && r.tells.cut > 0 && r.hits === 0 && p.hits > 0, `told rise x${r.tells.rise}, cut x${r.tells.cut}; answered on the mark he lands ${r.hits} (${r.blocked} blocked), ignored ${p.hits}`);
  const g = F.newAmbusher(400, FLOOR); let px = 300; for (let i = 0; i < 1200 && g.mode !== 'under'; i++) { px = Math.min(px + 1.5, 420); F.ambusherStep(g, { px, py: FLOOR, pface: 1, time: i * DT }, DT); }
  for (let i = 0; i < 120 && g.mode !== 'buried'; i++) F.ambusherStep(g, { px, py: FLOOR, pface: 1, time: i * DT }, DT);
  ok(g.mode === 'buried' && g.x > px, `after his two cuts he throws the cloak over himself and comes up AHEAD of you (at ${Math.round(g.x)}, you at ${Math.round(px)})`); }

log('THE WIRING (read off the source)');
{ const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), audio = readFileSync(new URL('../src/audio.js', import.meta.url), 'utf8'), level = readFileSync(new URL('../src/level.js', import.meta.url), 'utf8');
  const sets = { cutthroat: ART.bakeCutthroat(), slinger: ART.bakeSlinger(), ambusher: ART.bakeAmbusher() }, FR = { cutthroat: 7, slinger: 7, ambusher: 8 };
  for (const k of ['cutthroat', 'slinger', 'ambusher']) {
    const S = sets[k], lows = S.R.map(c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let lo = -1, hi = -1, left = c.width, right = -1;
      for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) { if (hi < 0) hi = y; lo = y; left = Math.min(left, x); right = Math.max(right, x); } return { lo, hi, left, right, w: c.width, h: c.height }; });
    const fits = lows.every(l => l.hi > 0 && l.left > 0 && l.right < l.w - 1 && l.lo === l.h - 1);   /* E6: nothing clipped at the top or the sides, feet on the last row */
    const wired = [
      ['spawn case', new RegExp(`case '${k}': \\{ const st = DF\\.new`).test(main)], ['health', new RegExp(`${k}: DF\\.[A-Z]+\\.hp`).test(main)],
      ['sprite', new RegExp(`SPR\\.${k} = `).test(main)], ['bestiary row', new RegExp(`\\{ t: '${k}', name: '`).test(main)], ['colours', new RegExp(`${k}:\\['#`).test(main)],
      ['in the caravan\'s hands', new RegExp(`CV_FOES = new Set\\(\\[[^\\]]*'${k}'`).test(main)], ['death voice', new RegExp(`\\n  ${k}\\(\\) \\{`).test(audio) && new RegExp(`${k}: \\{ kit: '`).test(audio)],
      ['death material', Object.values(MATERIAL_OF).some(l => l.includes(k)) || k !== 'ambusher'], ['threat weight', THREAT[k] > 0],
      ['marks', Object.keys(MARK).some(m => m.startsWith(k + '|')) && Object.keys(BY_HAND).some(m => m.startsWith(k + '|'))]];
    ok(S.R.length === FR[k] && fits && wired.every(([, v]) => v), `${k}: ${S.R.length} frames ${lows[0].w}x${lows[0].h}, all on their canvas (E6); wired: ${wired.map(([n, v]) => (v ? '' : 'NOT ') + n).join(', ')}`); }
  ok(MARK['cutthroat|feintTell'] === '' && MARK['cutthroat|slashTell'] === '!' && MARK['slinger|slingTell'] === '!' && MARK['ambusher|cutTell'] === '!',
    `the table the screen reads: feint '${MARK['cutthroat|feintTell']}', slash '${MARK['cutthroat|slashTell']}', sling '${MARK['slinger|slingTell']}', cut '${MARK['ambusher|cutTell']}'`);
  const row = [...level.matchAll(/\n  caravan: \[\[[^\n]*/g)].map(m => m[0]).join(' '), goblins = ['sandgob', 'thief', 'archer', 'bomber', 'sprig', 'brute', 'spit', 'javelin'].filter(k => row.includes(`'${k}'`));
  const cv = readFileSync(new URL('../src/sunken-caravan.js', import.meta.url), 'utf8'), wave = (cv.match(/waves: \[\[[^\n]*/) || [''])[0];
  ok(row && !goblins.length && !/'(sandgob|thief|archer)'/.test(wave), `no goblin left in the caravan: its garrison row and elites (${row.trim().slice(0, 90)}...) and the yard's wave name none`); }

console.log(fails ? `\nbandits: ${fails} FAILED` : '\nbandits: all passed');
process.exit(fails ? 1 : 0);
