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
          if (P().qsDepth > 0) { if (n % 7 === 0) BK.press('jump'); tick(1); continue; }   /* A DRIFT holds you: jump, and keep jumping (the play bot's hands, src/playtest.js) */
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
      const leap = d => { settle(); clear(); k[d > 0 ? 'right' : 'left'] = true; k.jump = true; BK.press('jump'); for (let j = 0; j < 70; j++) { tick(1); if (j > 22) k.jump = false; if (j > 4 && P().ground) break; } clear(); tick(2); };   /* a running jump over a gap (the halls' stakes) */
      const press = (key, d) => { settle(); if (d) face(d); BK.press(key); tick(8); clear(); tick(4); };
      const room = id => K().rooms.find(r => r.id === id);
      const full = id => room(id).level >= room(id).full - 0.05, empty = id => room(id).level <= 0.05;
      /* pull a lever (stand on it, E) until the room's gate is the one wanted */
      const lever = (x, id, want) => { for (let i = 0; i < 4 && room(id).gate !== want; i++) { walk(x, { tol: 3 }); press('talk', 1); } DBG.push(id + ' gate ' + room(id).gate); return room(id).gate === want; };
      const chuteOf = id => K().chutes.find(c => c.id === id), heapFull = () => { const c = chuteOf('sluice'); return c.heap.wall.rows >= 8; };
      /* swing a chute (stand on its lever, E) until its fall lands where it is wanted */
      const swing = (x, id, want) => { for (let i = 0; i < 4 && chuteOf(id).at !== want; i++) { walk(x, { tol: 3 }); press('talk', 1); } DBG.push(id + ' at ' + chuteOf(id).at); return chuteOf(id).at === want; };
      /* THE FLIP (claude/buriedcity3): turn a glass (stand by it, E) until it runs; a measured jump to a column (the hand lets go of the direction over it) */
      const glassRuns = id => { const q = (BK.flip() || { glasses: [] }).glasses.find(g => g.id === id); return !!q && q.t > 0; };
      const turn = (x, id) => { for (let i = 0; i < 4 && !glassRuns(id); i++) { walk(x, { tol: 3 }); press('talk', 1); } DBG.push(id + ' glass ' + glassRuns(id)); return glassRuns(id); };
      const solidAt = (x, y) => { const t = BK.L.grid[y * BK.L.W + x]; return t !== 0 && t !== undefined; };
      const jumpTo = (tx, row) => { settle(); const goal = tx * TS + 8, d = Math.sign(goal - P().x) || 1;
        for (let j = 0; j < 120; j++) { const ax = Math.floor((P().x + d * 7) / TS); if (!solidAt(ax, feet() + 1) || Math.abs(P().x - goal) < 20) break; clear(); k[d > 0 ? 'right' : 'left'] = true; tick(1); }   /* (to the edge of this footing first) */
        clear(); k[d > 0 ? 'right' : 'left'] = true; k.jump = true; BK.press('jump');
        for (let j = 0; j < 110; j++) { if (Math.abs(P().x - goal) < 5 || (P().x - goal) * d > 0) { k.left = k.right = false; } tick(1); if (j > 24) k.jump = false; if (j > 4 && P().ground) break; }
        clear(); tick(2); if (feet() !== row) DBG.push('jumpTo ' + tx + '>' + row + ' at ' + col() + ',' + feet()); return feet() === row; };
      /* (BURIED CITY 2, claude/buriedcity2: grid rows - the feet row is the row a hero stands in) */
      const LEGS = [
        ['the dunes and the sand stair: down into the city, drain the first room', [3, 24], () => { walk(56); if (!lever(58, 'first', 'open')) return false; waitFor(() => empty('first'), 900);
            walk(100); if (!turn(102, 'stair')) return false; walk(103, { tol: 2 }); if (!jumpTo(105, 33)) return false; if (!jumpTo(109, 31)) return false; walk(112, { tol: 2 }); settle(); DBG.push('past the house ' + col() + ',' + feet()); return col() >= 112 && feet() >= 33; }   /* (past the fallen house: on the street, or on the stall's awning the jump down lands on) */, [113, 36]],
        ['the bazaar: THE GRANARY - shut its gate, ride the sand up', [113, 36], () => { walk(140); walk(144, { tol: 3 }); if (!lever(144, 'granary', 'shut')) return false; walk(150, { noFight: true }); waitFor(() => full('granary'), 1200, { noFight: true });
            DBG.push('granary ' + room('granary').level.toFixed(1) + ' at ' + col() + ',' + feet()); walk(165); return col() >= 163 && feet() === 28; }, [165, 28]],
        ['THE SINKING STREET: across it to the arch, pull its chain, ride it down', [165, 28], () => { walk(196); walk(231); if (!lever(233, 'street', 'open')) return false; waitFor(() => empty('street'), 900, { noFight: true });
            DBG.push('street ' + room('street').level.toFixed(1) + ' at ' + col() + ',' + feet()); walk(240); return col() >= 238 && feet() === 38; }, [240, 38]],
        ['THE SPIKE CELLAR: shut its gate, wait for the fill, walk over', [240, 38], () => { if (!lever(242, 'cellar', 'shut')) return false; waitFor(() => full('cellar'), 900); walk(270); walk(276); return col() >= 274 && feet() === 32; }, [276, 32]],
        ['THE HOURGLASS: open the upper hall, it runs into the lower; the halls exam in the sun', [276, 32], () => { if (!lever(278, 'upperbulb', 'open')) return false; waitFor(() => empty('upperbulb') && full('lowerbulb'), 900);
            DBG.push('bulbs ' + room('upperbulb').level.toFixed(1) + '/' + room('lowerbulb').level.toFixed(1)); walk(309); if (!turn(311, 'bank')) return false; walk(322, { tol: 3 }); leap(1); walk(334); return col() >= 332 && feet() === 32; }, [334, 32]],
        /* (claude/buriedcity4) THE GLASS WORKS: the sinking roofs and the rising ones, the sand lift, the sand-bound and the tilting dune, the relay of two glasses */
        ['THE GLASS WORKS: two roofs to the kiln stub, its glass sinks them and raises the stair to the gallery', [334, 32], () => { walk(339, { tol: 2 }); if (!jumpTo(343, 32) || !jumpTo(347, 32) || !jumpTo(350, 32)) return false; if (!turn(351, 'works1')) return false;
            if (!jumpTo(354, 30) || !jumpTo(358, 28) || !jumpTo(362, 26)) return false; return col() >= 361 && feet() === 26; }, [362, 26]],
        ['THE SAND LIFT: turn its glass, ride the fall up; the sand-bound: bury it, cut it down; up the tilted dune', [362, 26], () => { if (!turn(364, 'works2')) return false; walk(366, { tol: 2 }); clear(); k.right = true; for (let j = 0; j < 240 && !(P().ground && col() >= 370); j++) tick(1); clear(); tick(2);
            if (feet() !== 15) return false; if (!turn(372, 'works3')) return false; walk(377); walk(386); return col() >= 384 && feet() === 10; }, [386, 10]],
        ['THE RELAY: the high kiln glass raises the way to the stub, its glass the last roof; the sand-bound on the floor, the shrine', [386, 10], () => { if (!turn(385, 'works4')) return false; walk(388, { tol: 2 }); if (!jumpTo(391, 13) || !jumpTo(395, 17) || !jumpTo(399, 21)) return false;
            if (!turn(399, 'works5')) return false; if (!jumpTo(402, 26)) return false; walk(404, { tol: 2 }); settle(); walk(408); return col() >= 406 && feet() === 32; }, [408, 32]],
        ['THE SAND-FALL: swing it onto the wall, let it pile, swing it back, climb to the arch', [408, 32], () => { walk(417, { tol: 3 }); if (!swing(417, 'sluice', 'wall')) return false; waitFor(heapFull, 900);
            if (!swing(438, 'sluice', 'grate')) return false; walk(441, { tol: 3 }); hop(441, 40, 1); walk(444, { tol: 3 }); hop(444, 38, 1); walk(447, { tol: 3 }); hop(447, 36, 1); walk(449, { tol: 3 }); hop(449, 34, 1); walk(474); return col() >= 472 && feet() === 36; }, [474, 36]],
        ['THE GREAT SAND-GATE: three turns, the quarter drains, over the ruins', [474, 36], () => { for (let i = 0; i < 6 && !K().wheel.done; i++) { walk(477, { tol: 3 }); press('talk', 1); tick(30); }
            DBG.push('wheel ' + JSON.stringify(K().wheel)); if (!K().wheel.done) return false; waitFor(() => room('great').level <= 0.05, 1500);
            walk(489); hop(491, 41, 1); walk(494, { tol: 3 }); hop(495, 38, 1); walk(499, { tol: 3 }); hop(500, 35, 1); walk(504, { tol: 3 }); hop(504, 32, 1); walk(509, { tol: 3 }); walk(514); hop(515, 41, 1); walk(518, { tol: 3 }); hop(519, 38, 1); walk(523, { tol: 3 }); hop(524, 35, 1); walk(529, { tol: 3 }); hop(529, 33, 1); walk(538); walk(566); return col() >= 564 && feet() === 44; }, [566, 44]],
        ['THE FOUNDRY FLOOR-GATE, then THE CLOCK SHAFT: ride the sand up through the sun', [566, 44], () => { if (!lever(568, 'yard', 'shut')) return false; waitFor(() => full('yard'), 600); walk(587); if (!lever(588, 'shaft', 'shut')) return false; walk(595, { noFight: true }); waitFor(() => full('shaft'), 1500, { noFight: true });
            DBG.push('shaft ' + room('shaft').level.toFixed(1) + ' at ' + col() + ',' + feet()); walk(605); return col() >= 603 && feet() === 32; }, [605, 32]],
        ['THE TRAP HALL: shut its floor-gate, swing the fall in, wait for the fill, on to the throne door', [605, 32], () => { if (!lever(616, 'trap', 'shut')) return false; if (!swing(610, 'trapfall', 'hall')) return false; waitFor(() => full('trap'), 900);
            DBG.push('trap ' + room('trap').level.toFixed(1) + ' at ' + col() + ',' + feet()); walk(642); DBG.push('past the hall ' + col() + ',' + feet()); walk(700); return col() >= 698 && feet() === 32; }, [700, 32]],
        /* (claude/buriedcity3) THE ROOFTOPS: up the breach, the fall that flows up, the chain of two glasses, the exam's glass, down into the courtyard */
        ['THE BREACH: up out of the roof onto the dune', [700, 32], () => { walk(707, { tol: 3 }); if (!hop(707, 29, 0) || !hop(706, 26, 0) || !hop(706, 23, 0) || !hop(706, 20, 0) || !hop(706, 17, 0)) return false; if (!hop(709, 14, 1)) return false; walk(715); return col() >= 713 && feet() === 14; }, [715, 14]],
        ['THE FALL THAT FLOWS UP: over the roofs to the dome, turn its glass, ride the fall to the high dune', [715, 14], () => { walk(717, { tol: 2 }); if (!jumpTo(722, 14)) return false; walk(725, { tol: 2 }); if (!jumpTo(728, 14)) return false; if (!turn(728, 'fall')) return false;
            walk(730, { tol: 2 }); clear(); k.right = true; k.jump = true; BK.press('jump'); for (let j = 0; j < 200 && !(P().ground && col() >= 735); j++) { tick(1); if (j > 20) k.jump = false; } clear(); tick(4); walk(749); return col() >= 747 && feet() === 6; }, [749, 6]],
        ['THE CHAIN: turn the first glass, over its roofs to the stub, turn the second, over to the far bank', [749, 6], () => { if (!turn(750, 'chain1')) return false; walk(752, { tol: 2 }); if (!jumpTo(755, 8) || !jumpTo(760, 10) || !jumpTo(765, 11) || !jumpTo(769, 11)) return false;
            if (!turn(769, 'chain2')) return false; if (!jumpTo(774, 11) || !jumpTo(779, 11) || !jumpTo(784, 12)) return false; walk(788); return col() >= 786 && feet() === 12; }, [788, 12]],
        ['THE EXAM: the last glass sinks the standing roof and raises the rest; down into the courtyard, its elite', [788, 12], () => { if (!turn(791, 'exam')) return false; walk(794, { tol: 2 }); if (!jumpTo(796, 13) || !jumpTo(802, 12) || !jumpTo(806, 11) || !jumpTo(809, 10)) return false;
            walk(816); waitFor(() => !BK.enemies().some(e => e.alive && e.elite && Math.abs(e.x / TS - 815) < 8), 3000); walk(820); settle(); DBG.push('courtyard ' + col() + ',' + feet()); return col() >= 819 && feet() === 32; }, [820, 32]],
        /* (claude/buriedcity4) THE EXAM BEFORE THE THRONE: the courtyard's glass buries the sand-bound; the antechamber's glass raises the timed slabs - across before they crumble, the shrine */
        ['THE COURTYARD SAND-BOUND and THE ANTECHAMBER: turn the glass, cross the timed slabs before they crumble, the last shrine', [820, 32], () => { if (BK.enemies().some(e => e.alive && e.cnSkin === 'sandbound' && Math.abs(e.x / TS - 819) < 6)) { if (!turn(814, 'court')) return false; walk(819); }
            walk(824, { tol: 3 }); press('talk', 1); if (!glassRuns('ante')) return false; walk(825, { tol: 2 }); if (!jumpTo(828, 31) || !jumpTo(832, 30) || !jumpTo(836, 31) || !jumpTo(840, 32)) return false; walk(842); return col() >= 841 && feet() === 32; }, [842, 32]],
      ];
      let lifts = [], retries = 0;
      if (${FROM}) { BK.tp(LEGS[${FROM}][1][0], LEGS[${FROM}][1][1]); BK.sim(5); if (LEGS[${FROM}][0].startsWith('THE FOUNDRY') || ${FROM} > LEGS.findIndex(l => l[0].startsWith('THE GREAT SAND-GATE'))) { const W = K().wheel; W.done = true; W.turns = 3; const g = room('great'); g.gate = 'open'; g.drain = 4; } }
      for (const [name, foot, plan, end] of LEGS.slice(${FROM}, ${process.env.UPTO ? +process.env.UPTO : 99})) {
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
