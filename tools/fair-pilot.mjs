// tools/fair-pilot.mjs - THE HARVEST FAIR AT LEVEL 1 WITH NO ABILITIES (claude/fairfix2; Daniel 2026-10-01: "INCREDIBLY EASY at level 1 with no abilities").
// A human-ish hand, not god mode: a fresh level-1 hero (no xp, no skills, no loadout, no items), real keys, the foes ON. It walks the low road gate to door
// with the route pilot's legs (tools/fair-route.mjs) and fights like a plain player: it turns to the nearest foe in arm's reach (a quarter-second to react),
// closes, and swings. It does not parry, dodge, duck a told blow or watch its back - a new player at level 1. It counts what the fair takes off it:
// health lost (every drop, summed; a death's refill is not a gain), deaths, and who hit it (the nearest foe at the moment of the drop, or the ground).
//   node tools/fair-pilot.mjs [hero=knight] [maxDeaths=12]
// Prints one line a leg and a summary { lost, deaths, byWho, bySection, reached }. Not in the suite (a minute or two a hero).
import { openPage } from './cdp.mjs';
const hero = process.argv[2] || 'knight', maxDeaths = +(process.argv[3] || 12);
const pg = await openPage({ audio: false, fonts: false });
let R;
try {
  R = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true;
    const fi = LEVELS.findIndex(l => l.id === 'fair'); const out = { legs: [], fail: [] };
    const K = BK.keys, none = () => { for (const k of ['left','right','up','down','jump','block','atk']) K[k] = false; };
    const h = ${JSON.stringify(hero)};
    BK.setHero(h); const PR = BK.PROG; PR.xp = PR.xp || {}; PR.xp[h] = 0; if (PR.skillOwned) PR.skillOwned[h] = {}; if (PR.loadouts) PR.loadouts[h] = []; if (PR.talents) PR.talents[h] = {}; PR.items = {}; PR.skill1 = PR.skill2 = null;
    BK.reset({ fresh: true }); BK.applyUpgrades && BK.applyUpgrades(); BK.load(fi); BK.start(); BK.sim(5); BK.god = false; none();
    const P = () => BK.P, L = () => BK.getL ? BK.getL() : BK.L;
    const tile = (tx, ty) => { const l = L(); return tx < 0 || ty < 0 || tx >= l.W || ty >= l.H ? 1 : l.grid[ty * l.W + tx]; };
    const solid = t => t === 1 || t === 4 || t === 7 || t === 12 || t === 13 || t === 15 || t === 16 || t === 17;
    const stand = t => solid(t) || t === 2 || t === 8 || t === 10 || t === 11 || t === 14 || t === 18 || (t >= 20 && t <= 25);
    const at = () => ({ x: +(P().x / 16).toFixed(1), y: +(P().y / 16).toFixed(2), hp: Math.round(P().hp) });
    /* THE TALLY: every frame, a drop in health is damage; the nearest foe (or a shot) within 220 px is who did it */
    const T = { gaveUp: [], lost: 0, deaths: 0, byWho: {}, bySection: {}, frames: 0, maxHp: P().maxHp, level: BK.heroLevel ? BK.heroLevel() : 1 };
    let lastHp = P().hp, wasDead = false;
    const sect = x => x < 118 ? 'gate' : x < 246 ? 'stalls' : x < 372 ? 'midway' : x < 525 ? 'harvest' : x < 622 ? 'lastround' : 'green';
    const tickOne = () => { BK.sim(1); T.frames++; const p = P();
      if (p.dead && !wasDead) { T.deaths++; wasDead = true; }
      if (!p.dead && wasDead) { wasDead = false; lastHp = p.hp; return; }
      if (p.hp < lastHp - 0.01) { const d = lastHp - p.hp; T.lost += d; const s = sect(p.x / 16); T.bySection[s] = (T.bySection[s] || 0) + d;
        const near = BK.enemies().filter(e => e.alive && Math.abs(e.x - p.x) < 220 && Math.abs(e.y - p.y) < 160).sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0];
        const who = near ? near.t : 'ground'; T.byWho[who] = (T.byWho[who] || 0) + d; }
      lastHp = p.hp; };
    const step = n => { for (let i = 0; i < n; i++) tickOne(); };
    /* THE HAND: a quarter-second to see a foe and turn to it; then close and swing. It fights what is within ~5 tiles on its own height, nearest first */
    let react = 0;
    const foeNear = () => BK.enemies().filter(e => e.alive && !e.harmless && !e.noHurt && e.t !== 'folk' && !(e.pilotTries > 12) && Math.abs(e.x - P().x) < 80 && Math.abs((e.y - (e.h || 16) / 2) - (P().y - 8)) < 30).sort((a, b) => Math.abs(a.x - P().x) - Math.abs(b.x - P().x))[0];
    const fight = () => { const e = foeNear(); if (!e) { react = 0; return false; } if (react < 15) { react++; return false; }
      e.pilotTries = (e.pilotTries || 0) + 1; if (e.pilotTries === 13) T.gaveUp.push(e.t + '@' + Math.round(e.x / 16) + ',' + Math.round(e.y / 16));   /* THE HAND GIVES UP on a foe it cannot reach or finish in a dozen goes (said in the summary), as a player walks on */
      for (let j = 0; j < 150 && e.alive && !P().dead; j++) { const d = Math.sign(e.x - P().x) || 1, gap = Math.abs(e.x - P().x);
        none(); if (gap > 18) K[d > 0 ? 'right' : 'left'] = true; else { P().face = d; if (j % 14 === 0) BK.press('atk'); }
        tickOne(); if (Math.abs(e.y - P().y) > 40) break; }
      none(); react = 0; return true; };
    const fails = (m) => { out.fail.push(m + ' @ ' + JSON.stringify(at())); return false; };
    const dead = () => P().dead > 0 || T.deaths > ${maxDeaths};
    /* WALK to tile tx, hopping pits and steps as a hero does, fighting what stands in reach */
    const walk = (tx, maxF = 6000) => { const gx = tx * 16 + 8; let stuck = 0, lx = P().x;
      for (let i = 0; i < maxF; i++) { if (dead()) return false; if (fight()) continue; const p = P(), d = gx - p.x; if (Math.abs(d) < 5 && p.ground) { none(); return true; }
        const dir = d > 0 ? 1 : -1; K.right = dir > 0; K.left = dir < 0; K.jump = false;
        if (p.ground) { const ax = Math.floor((p.x + dir * 13) / 16), fy = Math.floor(p.y / 16), ay = fy - 1;
          const wall = solid(tile(ax, ay)) || solid(tile(ax, ay - 1)), noFoot = !stand(tile(ax, fy)) && !stand(tile(ax, fy + 1));
          if (wall || noFoot) { K.jump = true; BK.press('jump'); } }
        else if (p.vy < 0) K.jump = true;
        tickOne(); if (Math.abs(P().x - lx) < 0.05) { if (++stuck > 120) { none(); return fails('walk stuck to ' + tx); } } else { stuck = 0; lx = P().x; } }
      none(); return fails('walk to ' + tx + ' timed out'); };
    const hop = (tx, trow, near = 34, maxF = 400) => { const gx = tx * 16 + 8; let jumped = false;
      for (let i = 0; i < maxF; i++) { if (dead()) return false; const p = P(), d = gx - p.x, dir = d > 0 ? 1 : -1; K.right = dir > 0; K.left = dir < 0;
        if (p.ground && !jumped && Math.abs(d) <= near) { K.jump = true; BK.press('jump'); jumped = true; } else if (jumped && P().vy < 0) K.jump = true; else K.jump = false;
        tickOne(); if (jumped && P().ground && Math.abs(P().y - trow * 16) < 4 && Math.abs(P().x - gx) < 30) { none(); return true; }
        if (jumped && P().ground && i > 20 && Math.abs(P().y - trow * 16) >= 4) { none(); return fails('hop to ' + tx + ',' + trow + ' landed low'); } }
      none(); return fails('hop to ' + tx + ',' + trow + ' timed out'); };
    const rick = (x0, tx) => { if (!walk(x0 - 3)) return false; let lastGround = 0;
      for (let i = 0; i < 400; i++) { if (dead()) return false; const p = P(); K.right = true; K.left = false; const near = p.x > (x0 - 1) * 16; if (p.ground && !near) K.jump = false; if (p.ground && near && !lastGround) { K.jump = true; BK.press('jump'); }
        tickOne(); if (P().ground && P().x >= tx * 16) { none(); return true; } }
      none(); return fails('rick ' + x0 + ' did not clear'); };
    const slideDown = (top, endX) => { if (!walk(top)) return false; K.right = true; K.down = true; for (let i = 0; i < 500 && P().x < endX * 16 && !dead(); i++) tickOne(); none(); return P().ground && P().x > (endX - 4) * 16; };
    const chase = () => { const C = (L().chases || [])[0]; if (!C) return true; if (!walk(Math.floor(C.trigger / 16) - 2)) return false;
      for (const b of C.beams || []) { const bx = Math.floor(b.x0 / 16); if (!walk(bx - 1)) return false;
        for (let i = 0; i < 400; i++) { const ph = BK.fairTime() % b.period; if (ph <= b.up - 0.6) break; if (fight()) continue; none(); tickOne(); if (dead()) return false; } }
      return walk(Math.floor(C.end / 16) + 3); };

    /* THE WHEEL OVER ITS PIT (claude/fairfix2): stand on the near bank, board a car as it rises past it, ride it over the top, and jump off to the far bank as it comes down the far side */
    const wheelLow = (standTx, landTx) => { if (!walk(standTx)) return false; const W0 = BK.movers().find(m => m.fair === 'gondola'), hubX = W0.px, hubY = W0.py; let boarded = false, off = 0;
      for (let i = 0; i < 2400; i++) { if (dead()) return false; if (!boarded && P().ground && !P().onMover && fight()) { walk(standTx); continue; } const p = P(); K.right = false; K.left = false; K.jump = false;
        if (!boarded && !p.onMover && p.ground) { const c = BK.movers().find(m => m.fair === 'gondola' && m.dy < 0 && m.x + m.w / 2 < hubX - 30 && m.x + m.w / 2 > p.x + 4 && m.y > p.y - 60 && m.y < p.y - 20); if (c) { K.jump = true; BK.press('jump'); K.right = true; } }
        else if (!boarded && !p.ground && p.vy < 0) { K.jump = true; K.right = true; }
        if (p.onMover && p.onMover.fair === 'gondola') { boarded = true; const c = p.onMover; K.right = (c.x + c.w / 2) > p.x + 6; K.left = (c.x + c.w / 2) < p.x - 6;
          if (c.x + c.w / 2 > hubX + 48 && c.y > hubY + 10) { K.right = true; K.left = false; K.jump = true; BK.press('jump'); off = 1; } }
        else if (boarded && !p.ground) { K.right = true; if (p.vy < 0) K.jump = true; }
        tickOne(); if (boarded && P().ground && !P().onMover && P().x >= landTx * 16 - 8 && Math.abs(P().y - 28 * 16) < 4) { none(); return true; }
        if (!P().onMover && P().ground && boarded && P().y > 28 * 16 + 4) { none(); return fails('fell into the pit under the wheel'); }
        if (boarded && P().ground && !P().onMover && Math.abs(P().y - 17 * 16) < 4) { /* the car set us down on the boardwalk landing at the top: walk off its far end, down to the road past the pit */ if (!walk(313)) return false; for (let j = 0; j < 200 && !(P().ground && P().y > 27 * 16); j++) { K.right = P().x < 315 * 16; K.left = P().x > 315.6 * 16; tickOne(); } none(); return P().x >= landTx * 16 - 8 - 48 && Math.abs(P().y - 28 * 16) < 4 || fails('off the landing to the road'); } }
      none(); return fails('the wheel did not carry us over its pit to ' + landTx); };
    /* THE LEGS, each with the column it starts from: after a death the hand picks up at the first leg at or past the shrine it woke at */
    const ROUTE = globalThis.FAIR_PILOT_ROUTE || [
      [0, 'gate to the tent poles', () => walk(96)], [96, 'the fallen big top: pole to pole (a long jumper who walked up the roof stair onto the boardwalk takes it over the poles)', () => P().y < 25 * 16 || hop(98, 26, 50) && hop(101, 25, 60) && hop(103, 28, 50)], [103, 'to the collapsing stalls', () => walk(235)],
      [235, 'the collapsing stalls', () => hop(237, 26, 40) && hop(240, 25, 60) && hop(244, 28, 60)], [244, 'to the carousel', () => walk(258)], [255, 'the carousel disc', () => walk(263) && walk(291)], [291, 'the wheel over its pit', () => wheelLow(298, 311)], [311, 'the hall of mirrors', () => walk(345)],
      [345, 'the tower stair', () => hop(349, 25) && hop(352, 22) && hop(355, 19) && hop(360, 16) && hop(362, 14)], [361, 'the helter-skelter slide and the pit at its foot', () => { if (!walk(366)) return false; K.right = true; for (let i = 0; i < 500 && !dead() && P().x < 384 * 16; i++) { K.down = P().x > 367.5 * 16; tickOne(); }   /* (step onto the slide, then hold down: a ducked hero on the flat does not walk) */ none(); return P().ground && P().x > 380 * 16; }],
      [380, 'rick one', () => rick(403, 409)], [409, 'the corn maze, tier one', () => walk(431)], [431, 'chimney one', () => hop(432, 26) && hop(430, 23)], [430, 'tier two', () => walk(420)],
      [420, 'chimney two', () => hop(416, 21) && hop(418, 18, 44)], [418, 'tier three and out', () => walk(437) && walk(439) && walk(442) && walk(447)],
      [447, 'rick two', () => rick(449, 456)], [456, 'the chase', () => chase()], [525, 'the small carousel under its canopy', () => walk(527) && walk(531) && walk(550)],
      [550, 'rick three', () => rick(557, 563)], [563, 'the last stretch and the door', () => walk(619)]];
    let i = 0, guard = 0;
    while (i < ROUTE.length && guard++ < 200) { const [, name, fn] = ROUTE[i], d0 = T.deaths, ok = fn();
      out.legs.push((ok ? 'ok   ' : 'MISS ') + name + ' ' + JSON.stringify(at()) + ' deaths ' + T.deaths + ' lost ' + Math.round(T.lost));
      if (T.deaths > ${maxDeaths}) break;
      if (ok) { i++; continue; }
      if (P().dead || T.deaths > d0) { for (let j = 0; j < 240 && P().dead; j++) tickOne(); step(30); const cx = P().x / 16; let k = 0; while (k + 1 < ROUTE.length && ROUTE[k + 1][0] <= cx + 2) k++; i = k; continue; }
      break; }
    out.reached = at(); out.done = i >= ROUTE.length; out.T = T; out.secs = +(T.frames / 60).toFixed(1);
    return out; })()`, 1800000);
} finally { if (R) { for (const l of R.legs) console.log('  ' + l); const T = R.T; for (const k in T.byWho) T.byWho[k] = Math.round(T.byWho[k]); for (const k in T.bySection) T.bySection[k] = Math.round(T.bySection[k]);
    console.log(JSON.stringify({ hero, level: T.level, maxHp: T.maxHp, done: R.done, reached: R.reached, lost: Math.round(T.lost), deaths: T.deaths, gaveUp: T.gaveUp, secs: R.secs, byWho: T.byWho, bySection: T.bySection, fail: R.fail.slice(0, 4) })); }
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3))); pg.close(); }
