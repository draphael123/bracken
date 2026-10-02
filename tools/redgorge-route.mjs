// tools/redgorge-route.mjs - THE RED GORGE walked end to end with REAL KEYS (claude/redgorge, the review's fix 1). Not in the suite: a route pilot.
// The level-1 pilot (tools/level1-pilot.mjs) lifts its bot by teleport past every rope and basket - exactly where a climb hurts - so its row was
// blind here (48 lifts). This is a scripted hand, as tools/welltown-route.mjs: it holds a direction, jumps onto the next ledge, holds UP on a rope,
// stands on a basket and waits for the water, presses E at a wheel, and cuts down what stands in its way with plain swings (it never blocks or
// dodges: a careless player). A fresh save's hero (level 1, no skills), god off, every foe alive.
// Every leg prints where it ended, the health left, and THE DAMAGE BY SOURCE in that leg (the flood, the burst, a slingstone, a raptor's stoop, a
// knife, a sting...). A death stands you up at the last checkpoint: the hand is TAKEN BACK to the leg's foot (a retry, counted); a leg that fails
// three times is LIFTED past (a teleport, counted and named). Two plans:
//   gate  shut the falls' gate and the narrows' gate before their ropes (the safe answer)
//   race  race the next flood up both ropes instead (the falls' rope and the exam's)
//   node tools/redgorge-route.mjs [plans=gate,race] [hero=knight] [god=0|1]
import { openPage } from './cdp.mjs';
const plans = (process.argv[2] || 'gate,race').split(','), hero = process.argv[3] || 'knight', god = process.argv[4] === '1', DBG = process.argv.includes('--dbg');
const pg = await openPage({ audio: false, fonts: false });
let bad = 0; const summary = [];
try {
  for (const plan of plans) {
    await pg.reload();
    const r = await pg.evalp(`(async()=>{
      const { LEVELS } = await import('/src/level.js'); const TS = 16, PLAN = ${JSON.stringify(plan)};
      BK.manualSimulation = true; BK.setHero(${JSON.stringify(hero)}); BK.reset({ fresh: true });
      BK.load(LEVELS.findIndex(l => l.id === 'redgorge')); BK.start ? BK.start() : (BK.state = 'play'); BK.god = ${god};
      const P = () => BK.P, k = BK.keys, G = () => BK.redgorge(), legs = [], dbg = [], D = ${DBG} ? (...a) => dbg.push(a.join(' ')) : () => {}; let frames = 0, legDmg = {}, dips = 0, low = false, lowest = 1;
      const maxHp = P().maxHp, lvl = BK.PROG && BK.PROG.xp ? Object.keys(BK.PROG.skillOwned || {}).length : 0;
      const clear = () => { k.left = k.right = k.jump = k.down = k.up = k.atk = k.block = false; };
      class Died extends Error {}
      /* ONE FRAME: the health it cost, and what took it (BK.log's blows on the hero; the flood's own count for the water) */
      const tick = n => { for (let i = 0; i < (n || 1); i++) {
        const hp0 = P().hp, d0 = BK.stats().deaths, sw0 = G().n.swept, b0 = G().spans.some(s => s.kind === 'burst'); BK.log = [];
        BK.sim(1); frames++;
        const lost = hp0 - P().hp, died = BK.stats().deaths > d0;
        if (lost > 0 || died) { const hits = BK.log.filter(q => q.k === 'dmgP');
          const who = hits.length ? (hits[0].who || (hits[0].by && hits[0].by.t) || (G().n.swept > sw0 ? (b0 ? 'burst' : 'flood') : 'hazard')) : (G().n.swept > sw0 ? 'flood' : 'other');
          legDmg[who] = (legDmg[who] || 0) + Math.max(0, died ? hp0 : lost); }
        const f = P().hp / maxHp; lowest = Math.min(lowest, f); if (f < 0.4 && !low) { low = true; dips++; } if (f > 0.6) low = false;
        if (died || P().dead) { for (let j = 0; j < 600 && (P().dead || BK.state !== 'play'); j++) { BK.sim(1); frames++; if (BK.state === 'dead' || BK.state === 'gameover') { BK.state = 'play'; } } throw new Died('died'); } } };
      const feet = () => Math.round(P().y / TS), col = () => Math.floor(P().x / TS);
      const fight = () => { const e = BK.enemies().filter(q => q.alive && !q.harmless && !q.noGrav && Math.abs(q.x - P().x) < 56 && Math.abs(q.y - P().y) < 14).sort((a, b) => Math.abs(a.x - P().x) - Math.abs(b.x - P().x))[0];
        if (!e) return false; clear();
        for (let j = 0; j < 30 && Math.abs(e.x - P().x) > 14 && e.alive; j++) { clear(); k[e.x > P().x ? 'right' : 'left'] = true; tick(1); }
        clear(); P().face = Math.sign(e.x - P().x) || P().face; BK.press('atk'); tick(8); clear(); tick(4);
        e.routeSwings = (e.routeSwings || 0) + 1; return e.routeSwings < 60; };
      const walk = (tx, o = {}) => { const goal = tx * TS + 8; let still = 0, lx = P().x, n = 0;
        while (Math.abs(P().x - goal) > (o.tol || 4) && n++ < (o.max || 1500)) {
          if (!o.noFight && fight()) continue;
          clear(); k[goal > P().x ? 'right' : 'left'] = true;
          if (Math.abs(P().x - lx) < 0.3) still++; else still = 0; lx = P().x;
          if (still > 8 && P().ground && !o.noJump) { k.jump = true; BK.press('jump'); still = 0; tick(14); continue; }
          tick(1); }
        clear(); tick(2); return Math.abs(P().x - goal) <= (o.tol || 4) + 3; };
      const settle = () => { for (let j = 0; j < 90 && !P().ground && !P().climb; j++) { clear(); tick(1); } };
      const wait = (n, o = {}) => { for (let i = 0; i < n; i++) { if (!o.noFight && fight()) continue; clear(); tick(1); } };
      const waitFor = (cond, max, o = {}) => { for (let i = 0; i < max && !cond(); i++) { if (!o.noFight && fight()) continue; clear(); if (o.hold) o.hold(); tick(1); } return cond(); };
      /* A HOP onto the ledge whose surface is ROW: from column FROM (on the floor you stand on), jump holding toward DIR; three tries */
      const hop = (from, row, dir = 0) => { for (let a = 0; a < 3; a++) { if (feet() === row && P().ground) return true; walk(from, { tol: 3 }); settle();
          clear(); if (dir) k[dir > 0 ? 'right' : 'left'] = true; k.jump = true; BK.press('jump');
          for (let j = 0; j < 70; j++) { tick(1); if (j > 26) k.jump = false; if (j > 4 && P().ground) break; }
          clear(); tick(3); if (feet() === row && P().ground) return true; }
        return feet() === row; };
      const hops = list => { for (const [x, row, dir] of list) if (!hop(x, row, dir)) return false; return true; };
      /* E at a wheel (THE GATE), facing it */
      const wheel = (x, want) => { walk(x, { tol: 3 }); for (let i = 0; i < 6; i++) { while (fight()) {} settle(); clear(); BK.press('talk'); tick(4); if (!want || want()) return true; tick(30); } return !want || want(); };
      const gate = id => G().gates.find(g => g.id === id).state;
      /* UP A ROPE at column X to its top row TOP, then off the top through the bridge above */
      const rope = (x, top) => { walk(x, { tol: 2, noFight: true }); for (let j = 0; j < 30 && !P().climb; j++) { clear(); k.up = true; if (j === 6 && !P().climb) { k.jump = true; BK.press('jump'); } tick(1); }
        for (let j = 0; j < 900 && P().climb; j++) { clear(); k.up = true; tick(1); }
        clear(); tick(2); if (feet() > top + 1) return false; k.jump = true; BK.press('jump'); tick(20); clear(); tick(10); return feet() < top; };
      /* THE NARROWS: off the landing's lip and onto the rope in the channel (a hop up and right, UP held) */
      const ontoRope = x => { walk(x - 1, { tol: 3, noFight: true }); settle();
        for (let j = 0; j < 60 && !P().climb; j++) { clear(); if (j < 18) k.jump = true; if (j > 8) k.up = true; if (j < 14) k.right = true; if (j === 0) BK.press('jump'); tick(1); }   /* (jump first, then UP: an UP held into the jump waits for an up-slash) */
        for (let j = 0; j < 900 && P().climb; j++) { clear(); k.up = true; tick(1); } };
      /* A BASKET: stand on it, wait for the water to wind it to its top, then step off toward DIR */
      /* A BASKET: clear the knives at its berth first (a hand that fights beside the berth steps into it when the basket is up: it is a hole in the
         bridge), wait at its edge for the basket to be home, step on, and stand still on it while the water winds it up; then step off toward toCol */
      const basket = (id, dir, toCol) => { const m = BK.movers().find(q => q.gorge === id), edge = Math.floor((m.x + m.w) / TS) + 1;
        const on = () => P().ground && Math.abs(P().y - m.y) < 3 && P().x > m.x + 2 && P().x < m.x + m.w - 2;
        walk(edge, { tol: 3 }); for (let i = 0; i < 40 && fight(); i++) {}
        for (let a = 0; a < 4 && !on(); a++) { walk(edge, { tol: 3, noFight: true }); waitFor(() => m.y >= m.y0 - 0.5, 60 * 14, { noFight: true }); walk(Math.floor((m.x + 16) / TS), { tol: 4, noJump: true, noFight: true }); clear(); tick(6);
          if (!on() && feet() > Math.round(m.y0 / TS) + 1) return false; }
        for (let j = 0; j < 60 * 30 && !(on() && m.y <= m.y1 + 1); j++) { if (j % 30 === 0) D(id, G().phase, Math.round(P().x), Math.round(P().y), Math.round(m.y), on(), P().hp | 0); clear(); if (!on() && P().ground) k[(m.x + 16) > P().x ? 'right' : 'left'] = true; tick(1); }
        if (!(m.y <= m.y1 + 1)) return false; return walk(toCol, { tol: 3 }); };
      const leg = (name, start, fn) => { let ok = false, tries = 0, lifted = false; const t0 = frames; legDmg = {};
        for (; tries < 3 && !ok; tries++) { try { if (tries) { BK.tp(start[0], start[1]); clear(); tick(4); } ok = !!fn(); } catch (e) { if (!(e instanceof Died)) throw e; } }
        if (!ok) { lifted = true; }
        legs.push({ name, ok, lifted, retries: tries - 1, at: [col(), feet()], hp: Math.round(P().hp), pct: Math.round(100 * P().hp / maxHp), dmg: Object.fromEntries(Object.entries(legDmg).map(([a, b]) => [a, Math.round(b)])), s: +((frames - t0) / 60).toFixed(1), deaths: BK.stats().deaths });
        return ok; };
      const lift = to => { BK.tp(to[0], to[1]); clear(); tick(4); };
      /* ===== 1. THE GORGE MOUTH ===== */
      leg('the floor crossing (wait out a flood on the east bank, cross in the dry)', [41, 165], () => { walk(30); waitFor(() => G().phase === 'flood', 60 * 14); waitFor(() => G().phase === 'dry', 60 * 4); return walk(18); }) || lift([18, 165]);
      leg('up the west ledges to bridge one, under the mouth slingers', [18, 165], () => hops([[17, 163], [14, 160], [14, 157], [13, 154], [12, 151], [11, 148], [11, 145], [11, 142]])) || lift([11, 141]);
      /* ===== 2. THE DRY FALLS ===== */
      leg('along bridge one, up to the terrace (checkpoint one)', [11, 141], () => hops([[29, 139], [29, 136]]) && walk(40)) || lift([40, 135]);
      leg('THE FALLS\\' KEEPER (the elite scorpion at the gate)', [40, 135], () => { for (let i = 0; i < 40 && BK.enemies().some(e => e.elite && e.alive && Math.abs(e.y - P().y) < 40); i++) { walk(32); wait(60); } return !BK.enemies().some(e => e.elite && e.alive && Math.abs(e.y - P().y) < 40); }) || lift([30, 135]);
      if (PLAN === 'gate') leg('THE FALLS: shut the gate, let it bank, climb the dry rope', [30, 135], () => { wheel(28, () => gate('falls') !== 'open'); if (!waitFor(() => gate('falls') === 'full', 60 * 14)) return false; return rope(24, 119); }) || lift([20, 117]);
      else leg('THE FALLS: race the next flood up the rope (wait off the channel)', [30, 135], () => { walk(20); waitFor(() => G().phase === 'flood', 60 * 14); waitFor(() => G().phase === 'dry', 60 * 4); return rope(24, 119); }) || lift([20, 117]);
      /* ===== 3. THE RAPTOR LEDGES ===== */
      leg('THE LEDGES BASKET: ride it on a flood, and its top', [20, 117], () => basket('ledges', -1, 12) && hops([[12, 97], [12, 94]])) || lift([12, 93]);
      /* ===== 4. THE CAVE OF HANDS ===== */
      leg('across bridge three (its knives in the channel), up the cave ledges to bridge four', [12, 93], () => walk(30) && hops([[30, 91], [33, 88], [34, 85], [35, 82], [36, 79], [36, 76], [36, 73], [33, 70]])) || lift([33, 69]);
      leg('THE JAM: shut its gate, hold the bank, release', [33, 69], () => { wheel(28, () => gate('jam') !== 'open'); if (!waitFor(() => gate('jam') === 'full', 60 * 14)) return false; wheel(28); return waitFor(() => G().jams[0].open, 60 * 3); }) || lift([21, 69]);
      /* ===== 5. THE NARROWS (the exam) ===== */
      leg('THE NARROWS BASKET: ride it to the landing, its knives', [21, 69], () => basket('narrows', -1, 13) && waitFor(() => !BK.enemies().some(e => e.alive && !e.noGrav && Math.abs(e.y - P().y) < 20 && Math.abs(e.x - P().x) < 120), 60 * 10)) || lift([13, 64]);
      if (PLAN === 'gate') leg('THE NARROWS: shut the gate at the landing, let it bank, climb the dry rope', [13, 64], () => { wheel(10, () => gate('narrows') !== 'open'); if (!waitFor(() => gate('narrows') === 'full', 60 * 14)) return false; ontoRope(22); clear(); k.jump = true; BK.press('jump'); tick(20); clear(); tick(10); return feet() <= 42; }) || lift([24, 41]);
      else leg('THE NARROWS: race the next flood up the twenty-row rope', [13, 64], () => { walk(20); waitFor(() => G().phase === 'flood', 60 * 14); waitFor(() => G().phase === 'dry', 60 * 4); ontoRope(22); clear(); k.jump = true; BK.press('jump'); tick(20); clear(); tick(10); return feet() <= 42; }) || lift([24, 41]);
      /* ===== 6. THE SUMMIT ===== */
      leg('bridge five\\'s knives, up the summit ledges to the dam\\'s door (checkpoint two)', [24, 41], () => walk(37) && hops([[37, 39], [36, 36, -1], [35, 33], [35, 30], [36, 27], [37, 25], [37, 22, 1]]) && walk(44)) || lift([44, 21]);
      leg('THE OLD DAM: through the door, the crab wakes', [44, 21], () => { walk(56, { noFight: true }); wait(90, { noFight: true }); return BK.bossActive && BK.boss && BK.boss.t === 'gorgecrab'; });
      return { dbg, plan: PLAN, hero: ${JSON.stringify(hero)}, maxHp, legs, dips, lowest: Math.round(lowest * 100), deaths: BK.stats().deaths, s: +(frames / 60).toFixed(1) };
    })()`, 2400000);
    if (DBG) console.log(r.dbg.join(String.fromCharCode(10))); const lifts = r.legs.filter(l => l.lifted).length, retries = r.legs.reduce((a, l) => a + l.retries, 0);
    console.log('== ' + r.hero + ' L1 (fresh save' + (god ? ', GOD' : ', god off') + '), plan ' + r.plan + ': ' + r.deaths + ' deaths, health under 40% ' + r.dips + ' times (lowest ' + r.lowest + '%), ' + r.s + ' s; ' + retries + ' retries (taken back to a leg\'s foot after a death or a miss), ' + lifts + ' lifts (teleported past a leg)');
    for (const l of r.legs) { const d = Object.entries(l.dmg).map(([a, b]) => a + ' ' + b).join(', ') || 'none';
      console.log('  ' + (l.ok ? 'ok  ' : 'LIFT') + ' ' + l.name.padEnd(84) + ' hp ' + String(l.pct).padStart(3) + '%  ' + String(l.s).padStart(5) + 's  dmg: ' + d + (l.retries ? '  (' + l.retries + ' retr' + (l.retries > 1 ? 'ies' : 'y') + ')' : '')); }
    summary.push({ plan: r.plan, deaths: r.deaths, dips: r.dips, lowest: r.lowest, lifts, retries, legs: r.legs.map(l => ({ name: l.name.slice(0, 40), ok: l.ok, dmg: l.dmg, pct: l.pct })) });
    if (lifts) bad++;
  }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 5).join(' | '));
} finally { pg.close(); }
console.log(JSON.stringify(summary));
process.exitCode = bad ? 1 : 0;
