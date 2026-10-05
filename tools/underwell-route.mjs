// tools/underwell-route.mjs - THE UNDERWELL walked end to end with REAL KEYS (claude/underwell; the shape of tools/redgorge-route.mjs). Not in the suite: a
// route pilot. A scripted hand holds a direction, hops onto the next ledge, climbs the rope, strikes the torches and the great lamp's chain, fills at the
// drips and springs, pours on the old oil fires and lays the firebreaks (E), waits for the fire to burn out, and cuts down what stands in its way with
// plain swings (it never blocks or dodges: a careless player). A fresh save's hero (level 1, no skills), every foe alive.
// Every leg prints where it ended, the health left, and THE DAMAGE BY SOURCE in that leg. A death stands you up at the last checkpoint: the hand is taken
// back to the leg's foot (a retry, counted); a leg that fails three times is LIFTED past (a teleport, counted and named).
//   node tools/underwell-route.mjs [heroes=knight,warden,pyro] [god=0|1] [foes=1|0]      (god=1 foes=0: base movement only - can this hero do the route)
import { openPage } from './cdp.mjs';
const COLD = process.argv.includes('--cold');   /* --cold: cross the sump without lighting the gutter (the reviewer's measure: is the heat the answer?) */
const heroes = (process.argv[2] || 'knight,warden,pyro').split(','), god = process.argv[3] === '1', foes = process.argv[4] !== '0';
const pg = await openPage({ audio: false, fonts: false });
let bad = 0; const summary = [];
try {
  for (const hero of heroes) {
    await pg.reload();
    const r = await pg.evalp(`(async()=>{
      const { LEVELS } = await import('/src/level.js'); const TS = 16;
      BK.manualSimulation = true; BK.setHero(${JSON.stringify(hero)}); BK.reset({ fresh: true });
      BK.load(LEVELS.findIndex(l => l.id === 'underwell')); BK.state = 'play'; BK.god = ${god}; BK.sim(5);
      if (!${foes}) for (const e of BK.enemies()) if (!e.boss) e.alive = false;
      const P = () => BK.P, k = BK.keys, U = () => BK.underwell(), legs = [], DBG = []; let frames = 0, legDmg = {}, lowest = 1, cards = 0;
      const maxHp = P().maxHp;
      const clear = () => { k.left = k.right = k.jump = k.down = k.up = k.atk = k.block = false; };
      class Died extends Error {}
      const tick = n => { for (let i = 0; i < (n || 1); i++) {
        if (BK.state === 'card') { BK.cardClose(); cards++; }   /* a level-up card: taken (the hand plays on) */
        const hp0 = P().hp, d0 = BK.stats().deaths; BK.log = []; BK.sim(1); frames++;
        const lost = hp0 - P().hp, died = BK.stats().deaths > d0;
        if (lost > 0 || died) { const hits = (BK.log || []).filter(q => q.k === 'dmgP'); const who = hits.length ? (hits[0].who || (hits[0].by && (hits[0].by.cnSkin || hits[0].by.t)) || 'hazard') : 'other';
          legDmg[who] = (legDmg[who] || 0) + Math.max(0, died ? hp0 : lost); }
        lowest = Math.min(lowest, P().hp / maxHp);
        if (died || P().dead) { for (let j = 0; j < 600 && (P().dead || BK.state !== 'play'); j++) { BK.sim(1); frames++; if (BK.state === 'dead' || BK.state === 'gameover') BK.state = 'play'; } throw new Died('died'); } } };
      const feet = () => Math.round(P().y / TS) - 1, col = () => Math.floor(P().x / TS);
      const fight = () => { const e = BK.enemies().filter(q => q.alive && !q.boss && !q.harmless && Math.abs(q.x - P().x) < 56 && Math.abs(q.y - P().y) < 16 && q.t !== 'sandworm').sort((a, b) => Math.abs(a.x - P().x) - Math.abs(b.x - P().x))[0];
        if (!e) return false; clear();
        for (let j = 0; j < 30 && Math.abs(e.x - P().x) > 14 && e.alive; j++) { clear(); k[e.x > P().x ? 'right' : 'left'] = true; tick(1); }
        clear(); P().face = Math.sign(e.x - P().x) || P().face; BK.press('atk'); tick(8); clear(); tick(4);
        e.routeSwings = (e.routeSwings || 0) + 1; if (e.routeSwings === 60) DBG.push('unbeaten ' + (e.cnSkin || e.t) + ' at ' + Math.round(e.x / TS) + ',' + Math.round(e.y / TS) + ' hp ' + e.hp + ' mode ' + (e.st ? e.st.mode : e.mode)); return e.routeSwings < 60; };
      const walk = (tx, o = {}) => { const goal = tx * TS + 8; let still = 0, lx = P().x, n = 0;
        while (Math.abs(P().x - goal) > (o.tol || 4) && n++ < (o.max || 2500)) {
          if (!o.noFight && fight()) continue;
          clear(); k[goal > P().x ? 'right' : 'left'] = true;
          if (Math.abs(P().x - lx) < 0.3) still++; else still = 0; lx = P().x;
          if (still > 8 && P().ground && !o.noJump) { k.jump = true; BK.press('jump'); still = 0; tick(14); continue; }
          tick(1); }
        clear(); tick(2); return Math.abs(P().x - goal) <= (o.tol || 4) + 3; };
      const settle = () => { for (let j = 0; j < 150 && !P().ground && !P().climb; j++) { clear(); tick(1); } };
      const wait = (n, o = {}) => { for (let i = 0; i < n; i++) { if (!o.noFight && fight()) continue; clear(); tick(1); } };
      const waitFor = (cond, max, o = {}) => { for (let i = 0; i < max && !cond(); i++) { if (!o.noFight && fight()) continue; clear(); tick(1); } return cond(); };
      const hop = (from, row, dir = 0) => { for (let a = 0; a < 3; a++) { if (feet() === row && P().ground) return true; walk(from, { tol: 3 }); settle();
          clear(); if (dir) k[dir > 0 ? 'right' : 'left'] = true; k.jump = true; BK.press('jump');
          for (let j = 0; j < 90; j++) { tick(1); if (j > 26) k.jump = false; if (j > 4 && P().ground) break; }
          clear(); tick(3); if (feet() === row && P().ground) return true; }
        DBG.push('hop ' + from + '>' + row + ' failed at ' + col() + ',' + feet()); return feet() === row; };
      const face = d => { clear(); k[d > 0 ? 'right' : 'left'] = true; tick(1); clear(); tick(1); P().face = d; };
      const press = (key, d) => { settle(); if (d) face(d); BK.press(key); tick(6); clear(); tick(4); };
      const fireIn = (x0, x1) => U().list.some(c => c.st === 'fire' && c.x >= x0 && c.x <= x1);
      const nest = id => U().nests.find(n => n.id === id).open;
      const rope = (x, top) => { walk(x, { tol: 2, noFight: true }); for (let j = 0; j < 40 && !P().climb; j++) { clear(); k.up = true; if (j === 6 && !P().climb) { k.jump = true; BK.press('jump'); } tick(1); }
        for (let j = 0; j < 1200 && P().climb; j++) { clear(); k.up = true; tick(1); if (feet() <= top) break; }
        clear(); k.right = true; k.jump = true; BK.press('jump'); tick(20); clear(); tick(10); settle(); return feet() <= top; };
      /* THE LEGS: [name, its foot (a checkpoint, for a retry), the plan, where it ends] */
      const LEGS = [
        ['the dry well', [5, 6], () => { walk(11); settle(); walk(7); settle(); walk(10); settle(); walk(5); settle(); walk(4, { tol: 3 }); press('talk');
            walk(10); settle(); walk(5); settle(); walk(3, { tol: 3 }); wait(20); walk(10); settle(); walk(15, { tol: 3 });
            press('atk', 1); waitFor(() => nest('shaft'), 400); waitFor(() => !fireIn(15, 24), 1500);
            hop(23, 42, 1); walk(26, { tol: 3 }); press('talk'); walk(31, { tol: 3 }); press('talk', 1); walk(44); return nest('shaft') && !BK.welltown().fires.find(f => f.x0 === 33).lit; }, [44, 43]],
        ['the brood hall: the great lamp', [44, 43], () => { walk(56); hop(57, 40, 1); hop(59, 37, 1); hop(67, 34, 1); hop(75, 31, 1); walk(85, { tol: 3 }); press('atk', 1);
            waitFor(() => U().lamp.st === 'down', 200); waitFor(() => !fireIn(84, 131), 2500); walk(88); settle(); walk(134); walk(137, { tol: 3 }); wait(20); walk(141, { tol: 3 }); press('talk'); return nest('hall'); }, [141, 43]],
        ['the oil works: the firebreak, the torch, the rope', [137, 43], () => { walk(171, { tol: 3 }); press('talk', -1); walk(174, { tol: 3 }); press('atk', 1); walk(170, { tol: 3, noFight: true });   /* back onto the wet stone while the floor burns */
            waitFor(() => !fireIn(172, 214), 2500); walk(212, { tol: 4 }); wait(30); walk(161, { tol: 3 }); const up = U().ropes[0].burnt ? false : rope(160, 29);
            if (!up) { walk(206); hop(207, 40, 1); hop(208, 37, -1); hop(206, 34, 1); hop(214, 31, 0); hop(215, 29, 1); }
            return feet() <= 29; }, [162, 29]],
        ['the upper works', [162, 29], () => { walk(184); hop(185, 27, 1); walk(189); walk(203); hop(204, 28, 1); walk(213); walk(226, { tol: 3 }); press('talk', 1);
            walk(238); hop(239, 27, 1); walk(246); settle(); walk(247, { tol: 3 }); wait(20); return feet() === 45 && !BK.welltown().fires.find(f => f.x0 === 228).lit; }, [247, 45]],
        ['the silted sump: the burning gutter', [247, 45], () => { walk(250, { tol: 3 }); press('talk'); walk(255, { tol: 3 }); ${COLD ? '' : "press('atk', 1);"} wait(40);
            walk(334); hop(335, 42, 1); walk(350); return col() >= 348; }, [350, 42]],
        ['the lamp stair: the exam', [350, 42], () => { walk(352, { tol: 3 }); press('talk'); walk(354, { tol: 3 }); press('talk', 1); walk(362, { tol: 3 }); press('atk', 1); walk(355, { tol: 3, noFight: true });   /* back onto the firebreak's wet stone while the floor burns */
            waitFor(() => nest('exam'), 600, { noFight: true }); waitFor(() => !fireIn(357, 368), 900); walk(404, { tol: 3 }); press('talk'); DBG.push('exam: sips ' + (P().skin ? P().skin.sips : '-') + ' rope ' + U().ropes.find(r => r.id === 'exam').burnt);
            walk(357, { tol: 3 }); if (!rope(356, 31)) return false; walk(416, { tol: 3 }); press('talk'); walk(418, { tol: 3 }); press('talk', 1); walk(424, { tol: 3 }); press('talk', 1);
            walk(442, { tol: 3 }); wait(20); walk(445, { tol: 3 }); press('talk'); return nest('exam') && feet() === 31; }, [445, 31]],
        ['the queen\\'s door', [442, 31], () => { walk(471, { tol: 3, noFight: true }); settle(); wait(60, { noFight: true }); return feet() >= 45; }, [471, 51]],
      ];
      let lifts = [], retries = 0;
      for (const [name, foot, plan, end] of LEGS) {
        legDmg = {}; let okLeg = false, tries = 0; const f0 = frames;
        while (!okLeg && tries < 3) { tries++; try { okLeg = !!plan(); if (!okLeg) throw new Died('failed'); } catch (e) { if (!(e instanceof Died)) throw e; retries++; BK.tp(foot[0], foot[1]); P().vx = P().vy = 0; clear(); BK.sim(5); } }
        if (!okLeg) { lifts.push(name); BK.tp(end[0], end[1]); BK.sim(5); }
        legs.push({ name, ok: okLeg, tries, at: [col(), feet()], hp: Math.round(P().hp), secs: +((frames - f0) / 100).toFixed(1), dmg: legDmg });
      }
      return { hero: ${JSON.stringify(hero)}, maxHp, legs, dbg: DBG.slice(0, 30), lifts, retries, cards, deaths: BK.stats().deaths, lowest: +lowest.toFixed(2), secs: +(frames / 100).toFixed(0), n: BK.underwell().n };
    })()`, 1800000);
    console.log('\n== ' + r.hero + ' (hp ' + r.maxHp + ')' + (god ? ' GOD' : '') + (foes ? '' : ' NO FOES'));
    for (const l of r.legs) console.log('  ' + (l.ok ? 'ok  ' : 'LIFT') + ' ' + l.name.padEnd(48) + ' tries ' + l.tries + '  at ' + l.at.join(',') + '  hp ' + l.hp + '  ' + l.secs + ' s  ' + JSON.stringify(l.dmg));
    if (process.argv.includes('--dbg')) console.log('  ' + r.dbg.join(' | '));
    console.log('  level-up cards taken ' + r.cards + ';  deaths ' + r.deaths + ', retries ' + r.retries + ', lifts ' + r.lifts.length + (r.lifts.length ? ' (' + r.lifts.join('; ') + ')' : '') + ', lowest ' + Math.round(r.lowest * 100) + '%, ' + r.secs + ' s');
    summary.push(r.hero + ': ' + (r.lifts.length ? r.lifts.length + ' LIFTED' : 'walked') + ', ' + r.deaths + ' deaths'); if (r.lifts.length) bad++;
  }
} finally { await pg.close(); }
console.log('\n' + summary.join(' | '));
process.exit(bad ? 1 : 0);
