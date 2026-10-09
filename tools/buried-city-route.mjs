// tools/buried-city-route.mjs - THE BURIED CITY walked end to end with REAL KEYS (claude/buriedcity; the shape of tools/ksar-route.mjs). Not in the suite: a route
// pilot. A scripted hand holds a direction, hops onto the next ledge, works THE RULE with E (pulls a sand-gate lever, turns the great wheel) and WAITS on the sand
// (it rides a filling room up, walks over a filled one), and cuts down what stands in its way with plain swings (it never blocks or dodges: a careless player).
// A fresh save's hero (level 1, no skills) unless --lvl=N, every foe alive unless foes=0. Every leg prints where it ended, the health left and THE DAMAGE BY
// SOURCE in that leg. A death stands you up at the last checkpoint: the hand is taken back to the leg's foot (a retry, counted); a leg that fails three times is
// LIFTED past (a teleport, counted and named).
//   PORT=8763 node tools/buried-city-route.mjs [heroes=knight,warden,pyro] [god=0|1] [foes=1|0] [--lvl=N] [--dbg]   (god=1 foes=0: base movement only)
import { openPage } from './cdp.mjs';
const heroes = (process.argv[2] || 'knight,warden,pyro').split(','), god = process.argv[3] === '1', foes = process.argv[4] !== '0', LVL = +((process.argv.find(a => a.startsWith('--lvl=')) || '--lvl=0').slice(6)), FROM = +((process.argv.find(a => a.startsWith('--from=')) || '--from=0').slice(7));   /* --from=N: start at leg N (a teleport to its foot, the rooms before it left as built) */
const pg = await openPage({ audio: false, fonts: false });
let bad = 0; const summary = [];
try {
  for (const hero of heroes) {
    await pg.reload();
    const r = await pg.evalp(`(async()=>{
      const { LEVELS } = await import('/src/level.js'); const TS = 16;
      BK.manualSimulation = true; if (${LVL}) { const P0 = BKT.PROG; BKT.setHeroLevel(${JSON.stringify(hero)}, ${LVL}); P0.skillOwned = P0.skillOwned || {}; P0.loadouts = P0.loadouts || {}; P0.skillOwned[${JSON.stringify(hero)}] = {}; P0.loadouts[${JSON.stringify(hero)}] = []; } BK.setHero(${JSON.stringify(hero)}); BK.reset({ fresh: !${LVL} }); if (${LVL}) BK.applyUpgrades && BK.applyUpgrades();
      BK.load(LEVELS.findIndex(l => l.id === 'buriedcity')); BK.state = 'play'; BK.god = ${god}; BK.sim(5);
      if (!${foes}) for (const e of BK.enemies()) if (!e.boss) e.alive = false;
      const P = () => BK.P, k = BK.keys, K = () => BK.buriedCity(), legs = [], DBG = []; let frames = 0, legDmg = {}, lowest = 1, cards = 0;
      const maxHp = P().maxHp;
      const clear = () => { k.left = k.right = k.jump = k.down = k.up = k.atk = k.block = false; };
      class Died extends Error {}
      const tick = n => { for (let i = 0; i < (n || 1); i++) {
        if (BK.state === 'card') { BK.cardClose(); cards++; }
        if (!${foes} && frames % 20 === 0) for (const e of BK.enemies()) if (!e.boss && e.alive) e.alive = false;   /* (the quarter's risen too) */
        const hp0 = P().hp, d0 = BK.stats().deaths; BK.log = []; BK.sim(1); frames++;
        const lost = hp0 - P().hp, died = BK.stats().deaths > d0;
        if (lost > 0 || died) { const hits = (BK.log || []).filter(q => q.k === 'dmgP'); const who = hits.length ? (hits[0].who || hits[0].name || (hits[0].by && (hits[0].by.cnSkin || hits[0].by.t)) || 'hazard') : 'other';
          legDmg[who] = (legDmg[who] || 0) + Math.max(0, died ? hp0 : lost); }
        lowest = Math.min(lowest, P().hp / maxHp);
        if (died || P().dead) { for (let j = 0; j < 600 && (P().dead || BK.state !== 'play'); j++) { BK.sim(1); frames++; if (BK.state === 'dead' || BK.state === 'gameover') BK.state = 'play'; } throw new Died('died'); } } };
      const feet = () => Math.round(P().y / TS) - 1, col = () => Math.floor(P().x / TS);
      const fight = () => { const e = BK.enemies().filter(q => q.alive && !q.boss && !q.harmless && Math.abs(q.x - P().x) < 56 && Math.abs(q.y - P().y) < 16).sort((a, b) => Math.abs(a.x - P().x) - Math.abs(b.x - P().x))[0];
        if (!e) return false; clear();
        for (let j = 0; j < 30 && Math.abs(e.x - P().x) > 14 && e.alive; j++) { clear(); k[e.x > P().x ? 'right' : 'left'] = true; tick(1); }
        clear(); P().face = Math.sign(e.x - P().x) || P().face; BK.press('atk'); tick(8); clear(); tick(4);
        e.routeSwings = (e.routeSwings || 0) + 1; if (e.routeSwings === 60) DBG.push('unbeaten ' + (e.cnSkin || e.t) + ' at ' + Math.round(e.x / TS) + ',' + Math.round(e.y / TS)); return e.routeSwings < 60; };
      const walk = (tx, o = {}) => { const goal = tx * TS + 8; let still = 0, lx = P().x, n = 0;
        while (Math.abs(P().x - goal) > (o.tol || 4) && n++ < (o.max || 2500)) {
          if (!o.noFight && fight()) continue;
          clear(); k[goal > P().x ? 'right' : 'left'] = true;
          if (Math.abs(P().x - lx) < 0.3) still++; else still = 0; lx = P().x;
          if (still > 8 && P().ground && !o.noJump) { k.jump = true; BK.press('jump'); still = 0; tick(14); continue; }
          tick(1); }
        clear(); tick(2); return Math.abs(P().x - goal) <= (o.tol || 4) + 3; };
      const settle = () => { for (let j = 0; j < 150 && !P().ground && !P().climb; j++) { clear(); tick(1); } };
      const waitFor = (cond, max, o = {}) => { for (let i = 0; i < max && !cond(); i++) { if (!o.noFight && fight()) continue; clear(); tick(1); } return cond(); };
      const hop = (from, row, dir = 0) => { for (let a = 0; a < 3; a++) { if (feet() === row && P().ground) return true; walk(from, { tol: 3 }); settle();
          clear(); if (dir) k[dir > 0 ? 'right' : 'left'] = true; k.jump = true; BK.press('jump');
          for (let j = 0; j < 90; j++) { tick(1); if (j > 26) k.jump = false; if (j > 4 && P().ground) break; }
          clear(); tick(3); if (feet() === row && P().ground) return true; }
        DBG.push('hop ' + from + '>' + row + ' failed at ' + col() + ',' + feet()); return feet() === row; };
      const face = d => { clear(); k[d > 0 ? 'right' : 'left'] = true; tick(1); clear(); tick(1); P().face = d; };
      const press = (key, d) => { settle(); if (d) face(d); BK.press(key); tick(8); clear(); tick(4); };
      const room = id => K().rooms.find(r => r.id === id);
      const full = id => room(id).level >= room(id).full - 0.05, empty = id => room(id).level <= 0.05;
      /* pull a lever (stand on it, E) until the room's gate is the one wanted */
      const lever = (x, id, want) => { for (let i = 0; i < 4 && room(id).gate !== want; i++) { walk(x, { tol: 3 }); press('talk', 1); } DBG.push(id + ' gate ' + room(id).gate); return room(id).gate === want; };
      const LEGS = [
        ['the sand stair: down into the city, drain the first room', [3, 21], () => { walk(50); if (!lever(51, 'first', 'open')) return false; waitFor(() => empty('first'), 900); walk(89); return col() >= 87 && feet() === 33; }, [89, 33]],
        ['the market: THE GRANARY - shut its gate, ride the sand up', [89, 33], () => { walk(116); walk(121, { tol: 3 }); if (!lever(121, 'granary', 'shut')) return false; walk(128, { noFight: true }); waitFor(() => full('granary'), 1200, { noFight: true });
            DBG.push('granary ' + room('granary').level.toFixed(1) + ' at ' + col() + ',' + feet()); walk(140); return col() >= 138 && feet() === 25; }, [140, 25]],
        ['the upper street and down to the cellar lip', [140, 25], () => { walk(175); walk(206); return col() >= 204 && feet() === 33; }, [206, 33]],
        ['THE SPIKE CELLAR: shut its gate, wait for the fill, walk over', [206, 33], () => { if (!lever(208, 'cellar', 'shut')) return false; waitFor(() => full('cellar'), 900); walk(238); walk(244); return col() >= 242 && feet() === 29; }, [244, 29]],
        ['THE HOURGLASS: open the upper hall, it runs into the lower; over both', [244, 29], () => { if (!lever(245, 'upperbulb', 'open')) return false; waitFor(() => empty('upperbulb') && full('lowerbulb'), 900);
            DBG.push('bulbs ' + room('upperbulb').level.toFixed(1) + '/' + room('lowerbulb').level.toFixed(1)); walk(300); walk(310); return col() >= 308 && feet() === 33; }, [310, 33]],
        ['THE GREAT SAND-GATE: three turns, the quarter drains, over the ruins', [310, 33], () => { for (let i = 0; i < 6 && !K().wheel.done; i++) { walk(313, { tol: 3 }); press('talk', 1); tick(30); }
            DBG.push('wheel ' + JSON.stringify(K().wheel)); if (!K().wheel.done) return false; waitFor(() => room('great').level <= 0.05, 1500);
            walk(323); hop(325, 38, 1); walk(328, { tol: 3 }); hop(329, 35, 1); walk(333, { tol: 3 }); hop(334, 32, 1); walk(338, { tol: 3 }); hop(338, 29, 1); walk(343, { tol: 3 }); walk(348); hop(349, 38, 1); walk(352, { tol: 3 }); hop(353, 35, 1); walk(357, { tol: 3 }); hop(358, 32, 1); walk(363, { tol: 3 }); hop(363, 30, 1); walk(372); walk(400); return col() >= 398 && feet() === 41; }, [400, 41]],
        ['THE CLOCK SHAFT: shut its gate, ride the sand up to the throne street', [400, 41], () => { walk(422); if (!lever(423, 'shaft', 'shut')) return false; walk(428, { noFight: true }); waitFor(() => full('shaft'), 1500, { noFight: true });
            DBG.push('shaft ' + room('shaft').level.toFixed(1) + ' at ' + col() + ',' + feet()); walk(445); return col() >= 443 && feet() === 29; }, [445, 29]],
        ['THE TRAP HALL: shut its floor-gate, wait for the fill, over to the throne door', [445, 29], () => { if (!lever(449, 'trap', 'shut')) return false; waitFor(() => full('trap'), 900); DBG.push('trap ' + room('trap').level.toFixed(1) + ' at ' + col() + ',' + feet()); walk(470); DBG.push('past the hall ' + col() + ',' + feet()); walk(520); return col() >= 518 && feet() === 29; }, [520, 29]],
      ];
      let lifts = [], retries = 0;
      if (${FROM}) { BK.tp(LEGS[${FROM}][1][0], LEGS[${FROM}][1][1]); BK.sim(5); if (${FROM} > 5) { const W = K().wheel; W.done = true; W.turns = 3; const g = room('great'); g.gate = 'open'; g.drain = 4; } }
      for (const [name, foot, plan, end] of LEGS.slice(${FROM})) {
        legDmg = {}; let okLeg = false, tries = 0; const f0 = frames;
        while (!okLeg && tries < 3) { tries++; try { okLeg = !!plan(); if (!okLeg) throw new Died('failed'); } catch (e) { if (!(e instanceof Died)) throw e; retries++; BK.tp(foot[0], foot[1]); P().vx = P().vy = 0; clear(); BK.sim(5); } }
        if (!okLeg) { lifts.push(name); BK.tp(end[0], end[1]); BK.sim(5); }
        legs.push({ name, ok: okLeg, tries, at: [col(), feet()], hp: Math.round(P().hp), secs: +((frames - f0) / 60).toFixed(1), dmg: legDmg });
      }
      return { hero: ${JSON.stringify(hero)}, maxHp, legs, dbg: DBG.slice(0, 60), lifts, retries, cards, deaths: BK.stats().deaths, lowest: +lowest.toFixed(2), secs: +(frames / 60).toFixed(0), n: K().n };
    })()`, 1800000);
    console.log('\n== ' + r.hero + ' (hp ' + r.maxHp + ')' + (god ? ' GOD' : '') + (foes ? '' : ' NO FOES'));
    for (const l of r.legs) console.log('  ' + (l.ok ? 'ok  ' : 'LIFT') + ' ' + l.name.padEnd(72) + ' tries ' + l.tries + '  at ' + l.at.join(',') + '  hp ' + l.hp + '  ' + l.secs + ' s  ' + JSON.stringify(l.dmg));
    if (process.argv.includes('--dbg')) console.log('  ' + r.dbg.join(' | '));
    console.log('  level-up cards ' + r.cards + ';  deaths ' + r.deaths + ', retries ' + r.retries + ', lifts ' + r.lifts.length + (r.lifts.length ? ' (' + r.lifts.join('; ') + ')' : '') + ', lowest ' + Math.round(r.lowest * 100) + '%, ' + r.secs + ' s  ' + JSON.stringify(r.n));
    summary.push(r.hero + ': ' + (r.lifts.length ? r.lifts.length + ' LIFTED' : 'walked') + ', ' + r.deaths + ' deaths'); if (r.lifts.length) bad++;
  }
} finally { await pg.close(); }
console.log('\n' + summary.join(' | '));
process.exit(bad ? 1 : 0);
