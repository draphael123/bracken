// tools/dk2.mjs — THE DEATH KNIGHT 2 (claude/dk2b, scratch/brief-dk2.md; src/dk2.js). On flat Stockade floor, the hero held where he
// stands, this fails when:
//   - REAPER'S RHYTHM is not the Paladin's pace (src/commit.js artRate = DK2.rhythm.rate 0.56; claude/dkfeel, was ~35% quicker than the old 0.34), a swing in the page takes as long
//     as it did, the HOOK (the 2nd cut) does not pull a straw man a step toward him, the DRAG (the 3rd) gives back no health, or a landed
//     chain does not FEED THE BLOOD WARD (P.wardG) - or feeds it to full
//   (claude/bloodknight: THE BLOOD PRICE held on X, its crescent and its drink-back are gone - X held is THE FIVE-TIER HEAVY and the drag drinks
//   nothing: BLOOD DEBT is his one sustain. tools/blood-kit.mjs checks all of that. What this checked was:) THE BLOOD PRICE: holding X does not cost DK2.price.pct of his max health every DK2.price.every s, it can take his last point (floored
//     at 1: HE NEVER KILLS HIMSELF), it does not go by itself after the last price is held, the crescent is not HEAVY, or its box is not
//     bigger than a rhythm cut's
//   - THE CRESCENT that lands does not DRAIN BACK double what he paid; one that hits nothing gives nothing back
//   - GRAVE KNEEL: crouched, a LOW blow from the front (marks.js HEIGHT 'low', or o.low) is not turned; one from behind, a middle one, or a
//     low one while he draws a body is turned; a high one does not still go over (the universal duck)
//   - THE DEAD LINGER: a foe he kills does not leave a body for DK2.linger.body s, or its fallen picture is gone long before; for the knight
//     the picture does not go as it always did
//   - the page throws
//   node tools/dk2.mjs            (PORT from tools/ports.mjs, or PORT=)
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { DK2 } from '../src/dk2.js';
import { artRate } from '../src/commit.js';

const bad = [];
const ok = (c, m) => { if (!c) bad.push(m); };
ok(Math.abs(artRate("reaper", false) - artRate("paladin", false)) < 0.01 && Math.abs(artRate("reaper", true) - artRate("paladin", true)) < 0.02, "REAPERS RHYTHM (claude/dkfeel, Daniel 10-16): the swing clock is " + artRate("reaper", false) + " and the crescent " + artRate("reaper", true) + ", not the Paladins " + artRate("paladin", false) + " / " + artRate("paladin", true));
const pg = await openPage({ audio: false, fonts: false });
let R;
try {
  await pg.reload();
  R = await pg.evalp(`(async()=>{
    if (!BK.dk2) return { err: 'no BK.dk2' };
    BK.SET.speed = 1;
    const { LEVELS } = await import('/src/level.js');
    const out = {}, D = () => BK.dk2(), P = () => BK.P, STEP = 1 / 60, secs = s => BK.sim(Math.round(s * 60));
    const setUp = h => { BK.setHero(h); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'stockade')); BK.start(); BK.god = false; BK.sim(5);
      for (const e of D().enemies) e.alive = false; };
    setUp('reaper');
    const L0 = BK.L, W = L0.W, at = (x, y) => L0.grid[y * W + x];
    let spot = null;
    for (let x0 = 8; x0 < W - 30 && !spot; x0++) for (let y = 7; y < L0.H - 2 && !spot; y++) {
      let ok = true; for (let x = x0; x < x0 + 20 && ok; x++) ok = at(x, y + 1) === 1 && [0, 1, 2, 3, 4, 5].every(k => at(x, y - k) === 0); if (ok) spot = { x: x0 + 8, y }; }
    if (!spot) return { err: 'no flat floor' };
    const place = () => { const p = P(); p.x = spot.x * 16 + 8; p.y = (spot.y + 1) * 16; p.vx = p.vy = 0; p.face = 1; p.hp = p.maxHp; p.st = p.maxSt; p.atk = -1; p.atkRec = 0; p.heavy = false; p.combo = 0; p.dodge = 0; p.hurt = 0; p.inv = 0;
      for (const k in BK.keys) BK.keys[k] = false; BK.sim(20); };
    const dummy = dx => { const n0 = D().enemies.length; D().spawn({ t: 'dummy', x: spot.x + dx, y: spot.y }); const e = D().enemies[n0]; e.x = P().x + dx * 16; e.y = P().y; return e; };
    /* 1. THE RHYTHM: a swing, timed */
    place(); BK.keys.atk = true; BK.press('atk'); BK.sim(1); BK.keys.atk = false; let n = 0; while (P().atk >= 0 && n < 200) { BK.sim(1); n++; } out.swingS = +(n / 60).toFixed(3);
    /* the chain on a straw man two tiles off: hook, drag, ward fed */
    place(); const dm = dummy(2); const x0 = dm.x; P().wardG = 0; const s0 = D().stats(); let hp0 = (P().hp = P().maxHp - 30); P().bd = 0; P().bdLast = P().hp;   /* (claude/bloodknight: set, not struck - no BLOOD DEBT) */
    for (let i = 0; i < 9; i++) { BK.keys.atk = true; BK.press('atk'); BK.sim(2); BK.keys.atk = false; let k = 0; while ((P().atk >= 0 || P().atkRec > 0) && k < 120) { BK.sim(1); k++; } }
    const s1 = D().stats(); out.chain = { hooks: s1.hooks - s0.hooks, drags: s1.drags - s0.drags, feeds: s1.feeds - s0.feeds, pulled: +(x0 - dm.x).toFixed(1), healed: P().hp - hp0, wardG: +D().wardG().toFixed(1), wardCap: D().wardCap() };
    dm.alive = false;
    /* 4. GRAVE KNEEL */
    place(); BK.keys.down = true; BK.sim(20); out.kneel = { ducking: !!P().ducking };
    const foe = k => ({ t: 'kneeltest', alive: true, x: 0, y: P().y, toldK: k, toldAt: -99, blowMode: 'go', mode: 'go' });
    const blow = (k, side, o = {}) => { P().hp = P().maxHp; P().inv = 0; P().hurt = 0; P().st = P().maxSt; BK.sim(12); P().inv = 0; const f = foe(k); const r = D().hit(P().x + side * 20, 10, { who: f, ...o }); BK.keys.down = true; BK.sim(30); return { r: String(r), took: P().maxHp - P().hp }; };
    out.kneel.lowFront = blow('waterthief|slashTell', 1); out.kneel.lowBehind = blow('waterthief|slashTell', -1); out.kneel.mid = blow(null, 1);
    out.kneel.flag = blow(null, 1, { low: true }); out.kneel.high = blow('owl|swoopTell', 1);
    BK.keys.down = false; out.kneel.standing = blow('waterthief|slashTell', 1);
    /* 5. THE DEAD LINGER */
    place(); const n0 = D().enemies.length; D().spawn({ t: 'brute', x: spot.x + 2, y: spot.y }); const br = D().enemies[n0]; br.x = P().x + 40; br.y = P().y; br.mode = 'walk';
    D().kill(br);
    BK.sim(2); const body = D().bodies[D().bodies.length - 1], cor = D().corpses.find(c => c.dkHeld === body);
    for (const e of D().enemies) if (e.alive) e.alive = false;
    out.linger = { body: !!body, held: !!cor }; secs(15); out.linger.after30 = { body: D().bodies.includes(body), corpse: D().corpses.includes(cor) };
    secs(DK2_BODY - 15 + 2); out.linger.gone = { body: D().bodies.includes(body), corpse: D().corpses.includes(cor) };
    /* the knight's dead go as they always did */
    setUp('knight'); place(); const n1 = D().enemies.length; D().spawn({ t: 'brute', x: spot.x + 2, y: spot.y }); const br2 = D().enemies[n1]; br2.x = P().x + 40; br2.y = P().y;
    D().kill(br2); BK.sim(2); const kc = D().corpses[D().corpses.length - 1]; secs(6); out.knightCorpse = { held: !!(kc && kc.dkHeld), after6: D().corpses.includes(kc), bodies: D().bodies.length };
    return out; })()`.replace('DK2_BODY', String(DK2.linger.body)), 120000);
  console.log(JSON.stringify(R, null, 1));
  if (R.err) bad.push(R.err); else {
    ok(R.swingS < 0.72, 'a rhythm swing takes ' + R.swingS + ' s (the old one 0.88 + its recovery)');
    ok(R.chain.hooks >= 1 && R.chain.pulled > 4, 'the HOOK did not pull the straw man: ' + JSON.stringify(R.chain));
    ok(R.chain.drags >= 1 && R.chain.healed <= 0, 'the DRAG still drinks (claude/bloodknight: BLOOD DEBT is his one sustain, and he had no debt): ' + JSON.stringify(R.chain));
    ok(R.chain.feeds >= 3 && R.chain.wardG > 0 && R.chain.wardG <= R.chain.wardCap * DK2.rhythm.wardTop + 0.01, 'the chain did not feed the ward (or fed it past ' + DK2.rhythm.wardTop + '): ' + JSON.stringify(R.chain));
    ok(R.kneel.ducking, 'down held did not kneel');
    ok(R.kneel.lowFront.r === 'blocked' && R.kneel.lowFront.took === 0, 'GRAVE KNEEL did not turn a low blow from the front: ' + JSON.stringify(R.kneel.lowFront));
    ok(R.kneel.flag.r === 'blocked', 'GRAVE KNEEL did not turn a blow flagged low: ' + JSON.stringify(R.kneel.flag));
    ok(R.kneel.lowBehind.took > 0 && R.kneel.mid.took > 0, 'GRAVE KNEEL turned a blow from behind or a middle one: ' + JSON.stringify(R.kneel));
    ok(R.kneel.high.took === 0, 'the high blow did not go over the kneel (the universal duck): ' + JSON.stringify(R.kneel.high));
    ok(R.kneel.standing.took > 0, 'standing, a low blow was turned: ' + JSON.stringify(R.kneel.standing));
    ok(R.linger.body && R.linger.held && R.linger.after30.body && R.linger.after30.corpse, 'the dead did not linger: ' + JSON.stringify(R.linger));
    ok(!R.linger.gone.body && !R.linger.gone.corpse, 'the dead never went: ' + JSON.stringify(R.linger));
    ok(!R.knightCorpse.held && !R.knightCorpse.after6 && R.knightCorpse.bodies === 0, 'the knight\'s dead lingered: ' + JSON.stringify(R.knightCorpse));
  }
  ok(pg.errors.length === 0, 'page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
if (bad.length) { console.error('FAIL\n- ' + bad.join('\n- ')); process.exit(1); }
console.log('dk2: the rhythm, the hook, the ward fed, the low guard and the dead (24 s) all hold');
