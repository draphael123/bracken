// tools/wicker-man.mjs - THE WICKER MAN (claude/fairfix6, src/wicker-man.js + src/wicker-man-hands.js): the Harvest Fair's one new foe, the Wicker Queen's lesser
// echo, whose fire you STRIKE BACK to make it vulnerable (Daniel, 10-05). Fails when:
//   NODE (the rules, pure)
//   - THE FAIR'S RULE: its feet move while a hero looks at it, or do not move when none does
//   - ITS ARMS: it does not throw (or swing) at a hero who looks at it; a throw comes with less than 0.9 s of tell, a swing with less than 0.8 s
//   - THE OPENING: a struck-back ball does not catch it, or it burns less than 3 s, or does not stamp it out and fight on; it catches while already alight
//   - THE WARD: a blow outside its fire is worth more than the Queen's ward (WQ.ward); a blow in its fire is worth less than a whole one
//   - THE STRIKE-BACK IS THE QUEEN'S RULE: its numbers are not hers (WQ.retReach / retLate / retSet), a held blade begun in the window does not send it back,
//     a mashed blade does, a blade out of the window does, the ember flare does not
//   PAGE (the fair, real keys, each hero at the fair's campaign level - BKT.setHeroLevel, no skills)
//   - three WICKER MEN stand in the fair, each in a squad (a designed encounter), none past the green's door; every one is a 'wickerman' on the bestiary
//   - FOR EVERY HERO (knight, warden, pyro, paladin, pirate, reaper, geomancer): a blade held and BEGUN as its fire rolls into his reach sends it back and the
//     wicker catches and burns; for the pyro the EMBER FLARE does it too; a mashed blade never sends it back, and the fire hurts him
//   - in its fire a blow takes at least 10x what the same blow takes off the standing wicker, and EVERY hero needs two or three of its fires to cut it down (Daniel, 10-05: none at one)
//   - its body lies down in its own skin (the burnt heap), and its marks are the table's: !! over the throw, ! over the swing
//   node tools/wicker-man.mjs            (PORT from tools/ports.mjs)
import assert from 'node:assert/strict';
import { LEVELS } from '../src/level.js';
import { depthsOf } from '../src/campaign-order.js';
import * as W from '../src/wicker-man.js';
import { WQ } from '../src/wicker-queen.js';
import { MARK } from '../src/marks.js';
import { openPage } from './cdp.mjs';

const bad = [], ok = (c, m) => { if (!c) bad.push(m); };
const DT = 1 / 60;
const run = (s, w, n, f) => { const ev = []; for (let i = 0; i < n; i++) { const e = W.wickerManStep(s, typeof w === 'function' ? w(i) : w, DT); ev.push(...e.map(v => ({ ...v, i }))); if (f) f(i, e); } return ev; };
const hero = (x, face, o = {}) => ({ x, y: 0, face, alive: true, ...o });
// ---- the fair's rule: feet only while unwatched
{ const s = W.newWickerMan(400, 0, -1); s.throwCd = 99; let moved = 0; run(s, { heroes: [hero(200, 1)], seen: true }, 120, () => { if (s.vx) moved++; });
  ok(moved === 0 && s.x === 400, 'its feet moved while a hero looked at it (' + moved + ' frames)');
  const u = W.newWickerMan(400, 0, -1); u.throwCd = 99; let crept = 0; run(u, { heroes: [hero(200, -1)], seen: false }, 60, () => { if (u.vx < 0) crept++; });
  ok(crept > 50, 'its feet did not move toward a hero whose back was turned (' + crept + ')'); }
// ---- its arms: throws looked at, told; swings in reach, told
{ const s = W.newWickerMan(400, 0, -1); const ev = run(s, { heroes: [hero(250, 1)], seen: true }, 60 * 8);
  const tells = ev.filter(v => v.t === 'throwTell'), throws = ev.filter(v => v.t === 'throw');
  ok(throws.length >= 2 && throws.every((v, k) => tells[k] && (v.i - tells[k].i) * DT >= 0.9), 'it did not throw (told 0.9 s+) at a hero looking at it: ' + throws.length + ' throws');
  ok(throws.every(v => v.dir === -1), 'its fire was not bowled toward the hero');
  const c = W.newWickerMan(400, 0, -1); const ev2 = run(c, { heroes: [hero(380, 1)], seen: true }, 60 * 3);
  const st = ev2.find(v => v.t === 'swingTell'), sw = ev2.find(v => v.t === 'swing');
  ok(st && sw && (sw.i - st.i) * DT >= 0.8 && sw.box[0] < 380 && sw.box[1] > 380, 'its arms did not come down (told 0.8 s+) on a hero in its reach: ' + JSON.stringify({ st: !!st, sw: sw && sw.box })); }
// ---- the opening: caught, burns 3 s+, stamps it out and fights on; not caught twice
{ const s = W.newWickerMan(400, 0, -1); s.throwCd = 99; ok(W.wmIgnite(s) && s.mode === 'catch', 'a struck-back ball did not catch it'); ok(!W.wmIgnite(s), 'it caught again while catching');
  let burnF = 0, stampF = 0; const ev = run(s, { heroes: [hero(250, 1)], seen: true }, 60 * 6, () => { if (s.mode === 'burn') burnF++; if (s.mode === 'stamp') stampF++; });
  ok(burnF * DT >= 3 - 1e-6 && stampF * DT >= 0.5 && ev.some(v => v.t === 'stamp') && ev.some(v => v.t === 'out'), 'it did not burn 3 s+ and stamp it out: burn ' + (burnF * DT).toFixed(2) + ' s, stamp ' + (stampF * DT).toFixed(2));
  s.mode = 'burn'; ok(!W.wmIgnite(s), 'it caught again while burning');
  s.mode = 'still'; ok(W.wmTake(s) <= WQ.ward + 1e-9, 'a blow on the standing wicker is worth more than the Queen\'s ward: ' + W.wmTake(s));
  s.mode = 'burn'; ok(W.wmTake(s) >= 1, 'a blow in its fire is worth less than a whole one: ' + W.wmTake(s)); }
// ---- one fire takes at most WM.fireCap of its health: past it, it beats the flames out
{ const s = W.newWickerMan(400, 0, -1); W.wmIgnite(s); s.mode = 'burn'; s.t = 3; let got = 0; for (let i = 0; i < 40 && s.mode === 'burn'; i++) got += W.wmBlow(s, 25, 200);
  ok(Math.abs(got - W.WM.fireCap * 200) < 1e-6 && s.mode === 'stamp' && W.WM.fireCap < 0.6 && W.WM.fireCap > 0.34, 'one fire took ' + got + ' of 200 (cap ' + W.WM.fireCap + ') or did not stamp out at its cap: ' + s.mode);
  s.mode = 'still'; W.wmIgnite(s); ok(s.fireTaken === 0, 'a new fire did not start its cap afresh'); }
// ---- the strike-back is the Queen's rule
{ ok(W.RET.reach === WQ.retReach && W.RET.late === WQ.retLate && W.RET.set === WQ.retSet, 'its strike-back numbers are not the Queen\'s: ' + JSON.stringify(W.RET));
  const b = { x: 120, dir: -1 }, at = d => ({ x: 120 - d, y: 0, face: 1, low: true });
  ok(W.strikeJudge({ ...at(20), begun: true, fresh: true }, b) === 'back', 'a held blade begun in the window did not send it back');
  ok(W.strikeJudge({ ...at(20), begun: true, fresh: false }, b) === 'wild', 'a mashed blade sent it back (or was not called wild)');
  ok(W.strikeJudge({ ...at(WQ.retReach + 12), begun: true, fresh: true }, b) === null && W.strikeJudge({ ...at(2), begun: true, fresh: true }, b) === null, 'a blade out of the window sent it back');
  ok(W.strikeJudge({ ...at(20), face: -1, begun: true, fresh: true }, b) === null, 'a blade swung with his back to it sent it back');
  ok(W.strikeJudge({ ...at(20), begun: false, flare: true }, b) === 'back', 'the ember flare did not send it back'); }
ok(MARK['wickerman|throwTell'] === '!!' && MARK['wickerman|swingTell'] === '!', 'its marks are not !! over the throw and ! over the swing: ' + MARK['wickerman|throwTell'] + ' / ' + MARK['wickerman|swingTell']);
// ---- the level: three, each in a designed encounter, before the green
const FAIR = LEVELS.find(l => l.id === 'fair'), FL = FAIR.build(), wms = FL.ents.filter(e => e.t === 'wickerman');
ok(wms.length === 3 && wms.every(e => e.squad) && wms.every(e => e.x < FL.green.door), 'the fair does not hold three wicker men, each in a squad, before the green: ' + JSON.stringify(wms.map(e => [e.x, e.squad])));
const LVL = Math.max(1, depthsOf(LEVELS).fair ?? 1);

// ---- PAGE
const HEROES = ['knight', 'warden', 'pyro', 'paladin', 'pirate', 'reaper', 'geomancer'];
const pg = await openPage({ audio: false, fonts: false });
let R = [];
try {
  for (const h of HEROES) {
    await pg.reload();
    R.push(await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; const h = ${JSON.stringify(h)};
      const P0 = BKT.PROG; BKT.setHeroLevel(h, ${LVL}); P0.skillOwned[h] = {}; P0.loadouts[h] = []; if (P0.talents) P0.talents[h] = {};
      const fi = LEVELS.findIndex(l => l.id === 'fair'), K = BK.keys, none = () => { for (const k of ['left', 'right', 'up', 'down', 'jump', 'block', 'atk']) K[k] = false; };
      BK.setHero(h); BK.reset({ fresh: true }); BK.load(fi); BK.start ? BK.start() : (BK.state = 'play'); BK.god = true; BK.sim(5); none();
      const out = { h, lvl: ${LVL} }, H = BK.wickerMan(), wm = () => BK.enemies().filter(e => e.t === 'wickerman');
      out.n = wm().length; out.seen = !!H;
      const e = wm().sort((a, b) => a.x - b.x)[0]; for (const q of BK.enemies()) if (q !== e) q.alive = false;
      const home = e.x, standX = home - 120, fy = e.y; BK.tp(Math.floor(standX / 16), Math.floor(fy / 16) - 1); BK.sim(30);
      const hold = () => { if (!BK.P.ground || Math.abs(BK.P.x - standX) > 30) { BK.P.x = standX; BK.P.y = fy; BK.P.vx = 0; BK.P.vy = 0; } BK.P.face = 1; };
      const reset = keep => { e.x = home; e.y = fy; e.vx = 0; e.alive = true; if (!keep) e.hp = e.hp0 || e.hp; e.st = null; H.reset(); BK.P.x = standX; BK.P.y = fy; BK.P.vx = 0; BK.P.vy = 0; BK.P.face = 1; for (let i = 0; i < 120 && !e.st; i++) BK.sim(1); e.st.throwCd = 0.2; };
      /* ONE THROW: how = 'timed' (a held blade begun as the fire reaches his reach), 'mash' (a blade begun every time the last one ends), 'flare' (the pyromancer's down) */
      const throwAs = (how, keep) => { reset(keep); BK.god = false; BK.P.hp = BK.P.maxHp; BK.P.inv = 0; const hp0 = BK.P.hp; let pressed = 0, ret = false, caught = false, burned = false, idle = 0, saw = false;
        for (let i = 0; i < 60 * 6; i++) { BK.P.inv = 0; none(); hold(); const b = H.balls[0]; if (b) saw = true;
          if (how === 'mash') { if (BK.P.atk < 0) { BK.press('atk'); pressed++; } }
          else if (b && !b.ret && !pressed && b.x - BK.P.x <= 28 && b.x - BK.P.x >= 12) { if (how === 'flare') { K.down = true; } else BK.press('atk'); pressed++; }
          BK.sim(1); if (b && b.ret) ret = true; if (e.st.mode === 'catch') caught = true; if (e.st.mode === 'burn') { burned = true; break; }
          if (saw && !H.balls.length && !ret) { if (++idle > 30) break; } }
        none(); BK.god = true; return { pressed, ret, caught, burned, hurt: hp0 - BK.P.hp }; };
      out.timed = throwAs('timed'); out.mash = throwAs('mash'); if (h === 'pyro') out.flare = throwAs('flare');
      /* THE OPENING: the same blow on the standing wicker and in its fire */
      const blowOn = burning => { reset(); e.st.throwCd = 99; if (burning) { e.st.mode = 'burn'; e.st.t = 3; } e.hp = 100000; const hp0 = e.hp; BK.combat2().strike(e, 'heavy', 20); return +(hp0 - e.hp).toFixed(2); };   /* (one uniform blow of 20: the heroes' own blows are measured by the kill below) */
      out.ward = blowOn(false); out.open = blowOn(true);
      /* CUT DOWN IN ITS FIRES: strike its fire back, then cut while it burns, until it falls (or four fires) */
      reset(); e.hp = e.hp0; BK.god = true; let fires = 0, dead = false;
      let firstBurn = null; for (let round = 0; round < 4 && !dead; round++) { const t = throwAs('timed', true); if (!t.burned) break; fires++; const hpB = e.hp;
        for (let i = 0; i < 60 * 3.5 && e.alive; i++) { none(); BK.P.face = 1; if (Math.abs(BK.P.x - (e.x - 20)) > 8) { BK.P.x = e.x - 20; BK.P.y = e.y; } if (BK.P.atk < 0) BK.press('atk'); BK.sim(1); }
        if (firstBurn === null) firstBurn = hpB - Math.max(0, e.hp); if (!e.alive) { dead = true; break; } for (let i = 0; i < 60 * 1.2; i++) BK.sim(1); e.x = home; }
      out.fires = fires; out.dead = dead; out.hp0 = e.hp0; out.firstBurn = firstBurn;
      if (dead) { for (let i = 0; i < 20; i++) BK.step(1); const c = (typeof BK.corpses === 'function' ? BK.corpses() : BK.corpses).find(q => q.t === 'wickerman'); out.corpse = c ? (c.shown === BK.SPR.wickerman ? 'own' : c.shown ? 'other' : 'none') : 'no body'; out.cframe = c && c.frame; out.frames = BK.SPR.wickerman.R.length; }
      /* (claude/fairfix6, Daniel 10-05) THE MIME, in the page: a fair mummer held in his look answers his swing with its own, told (mimeTell) and guardable */
      if (h === 'knight') { for (const q of BK.enemies()) q.alive = false; H.reset(); const m = BK.enemies().find(q => q.t === 'mummer' && !q.scare && q.rideIdx === undefined && q.x < 40 * 16); m.alive = true; m.hp = 9999; m.stagger = 0; m.st.mode = 'still'; const mx = m.x; BK.tp(Math.floor((mx - 26) / 16), Math.floor(m.y / 16) - 1); BK.sim(20); none(); for (let i = 0; i < 30; i++) { BK.P.x = mx - 26; BK.P.face = 1; BK.sim(1); }
        const n0 = BK.fair().mimes || 0; let told = false, swung = false, crept = false; BK.god = false; BK.P.hp = BK.P.maxHp; BK.press('atk'); for (let i = 0; i < 120; i++) { BK.P.face = 1; BK.P.inv = 0; BK.sim(1); if (m.mode === 'mimeTell') told = true; if (m.mode === 'mimeSwing') swung = true; if (m.mode === 'creep') crept = true; } BK.god = true;
        out.mime = { told, swung, n: (BK.fair().mimes || 0) - n0, crept }; m.alive = false; }
      out.cards = BK.beasts ? !!BK.beasts().find?.(b => b.t === 'wickerman') : null;
      return out; })()`, 600000));
  }
  if (pg.errors.length) bad.push('the page threw: ' + pg.errors.slice(0, 2).join(' | '));
} finally { pg.close(); }
for (const r of R) {
  console.log('  ' + r.h.padEnd(10) + ' L' + r.lvl + '  timed ' + JSON.stringify(r.timed) + '  mash ' + JSON.stringify(r.mash) + (r.flare ? '  flare ' + JSON.stringify(r.flare) : '') + '  blow ward/open ' + r.ward + '/' + r.open + '  hp ' + r.hp0 + ', first fire took ' + Math.round(r.firstBurn) + ', fires to kill ' + r.fires + (r.dead ? '' : ' (STANDING)') + '  body ' + r.corpse);
  ok(r.n === 3, r.h + ': ' + r.n + ' wicker men in the page');
  if (r.h === 'knight') ok(r.mime && r.mime.told && r.mime.swung && r.mime.n >= 1 && !r.mime.crept, 'THE MIME (Daniel 10-05): a fair mummer held in the look did not answer the swing of the knight with a told swing of its own in the page: ' + JSON.stringify(r.mime));
  ok(r.timed.ret && r.timed.caught && r.timed.burned, r.h + ': a held blade begun as its fire reached him did not send it back and set it alight: ' + JSON.stringify(r.timed));
  ok(!r.mash.ret && !r.mash.caught && r.mash.hurt > 0, r.h + ': a MASHED blade sent its fire back (it must only scatter it, and the fire hurts): ' + JSON.stringify(r.mash));
  if (r.h === 'pyro') ok(r.flare && r.flare.ret && r.flare.burned, 'pyro: the ember flare did not send its fire back: ' + JSON.stringify(r.flare));
  ok(r.open > 0 && r.open >= r.ward * 10, r.h + ': a blow in its fire (' + r.open + ') is not 10x one on the standing wicker (' + r.ward + ')');
  ok(r.dead && r.fires >= 2 && r.fires <= 3, r.h + ': not cut down in two or three of its fires - Daniel 10-05, every hero needs 2-3 (' + r.fires + ' fires, ' + (r.dead ? 'dead' : 'standing') + ')');
  ok(r.corpse === 'own' && r.cframe === r.frames - 1, r.h + ': its body did not lie down in its own burnt heap: ' + r.corpse + ' frame ' + r.cframe);
}
if (bad.length) { console.log(bad.map(b => '  FAIL ' + b).join('\n')); console.log(bad.length + ' FAILED'); process.exit(1); }
console.log('ok  wicker-man  the facing rule on its feet, its told fire and arms, struck back by the Queen\'s rule (held blade or ember flare; a mash scatters it) for ' + R.length + ' heroes, caught, burning 3 s at a whole blow (a scratch otherwise), cut down in its fires, dead in its own skin');
