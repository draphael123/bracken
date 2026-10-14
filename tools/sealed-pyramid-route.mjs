// tools/sealed-pyramid-route.mjs - THE SEALED PYRAMID walked end to end with REAL KEYS (claude/sealedpyramid; the shape of tools/buried-city-route.mjs). A route
// pilot: a scripted hand holds a direction, hops onto the next step, works THE RULE by its feet (treads a plate, stands on a counterweight and waits for it), jumps
// the gaps a block leaves in a pit, and cuts down what stands in its way with plain swings (a careless player: it never blocks or dodges).
// A fresh save's hero (level 1, no skills) unless --lvl=N, every foe alive unless foes=0. Every leg prints where it ended, the health left and THE DAMAGE BY SOURCE.
// A death stands you up at the last checkpoint: the hand is taken back to the leg's foot (a retry, counted); a leg that fails three times is LIFTED past (a teleport,
// counted and named).
//   PORT=8864 node tools/sealed-pyramid-route.mjs [heroes=knight,warden,pyro] [god=0|1] [foes=1|0] [--lvl=N] [--dbg] [--from=N]   (god=1 foes=0: base movement only)
import { openPage } from './cdp.mjs';
const heroes = (process.argv[2] || 'knight,warden,pyro').split(','), god = process.argv[3] === '1', foes = process.argv[4] !== '0', LVL = +((process.argv.find(a => a.startsWith('--lvl=')) || '--lvl=0').slice(6)), FROM = +((process.argv.find(a => a.startsWith('--from=')) || '--from=0').slice(7));
const pg = await openPage({ audio: false, fonts: false });
let bad = 0; const summary = [];
try {
  for (const hero of heroes) {
    await pg.reload();
    const r = await pg.evalp(`(async()=>{
      const { LEVELS } = await import('/src/level.js'); const TS = 16;
      BK.manualSimulation = true; if (${LVL}) { const P0 = BKT.PROG; BKT.setHeroLevel(${JSON.stringify(hero)}, ${LVL}); P0.skillOwned = P0.skillOwned || {}; P0.loadouts = P0.loadouts || {}; P0.skillOwned[${JSON.stringify(hero)}] = {}; P0.loadouts[${JSON.stringify(hero)}] = []; } BK.setHero(${JSON.stringify(hero)}); BK.reset({ fresh: !${LVL} }); if (${LVL}) BK.applyUpgrades && BK.applyUpgrades();
      BK.load(LEVELS.findIndex(l => l.id === 'sealedpyramid')); BK.state = 'play'; BK.god = ${god}; BK.sim(5);
      if (!${foes}) for (const e of BK.enemies()) if (!e.boss) e.alive = false;
      const P = () => BK.P, k = BK.keys, K = () => BK.sealedPyramid(), legs = [], DBG = []; let frames = 0, legDmg = {}, lowest = 1, cards = 0;
      const maxHp = P().maxHp;
      const clear = () => { k.left = k.right = k.jump = k.down = k.up = k.atk = k.block = false; };
      class Died extends Error {}
      const tick = n => { for (let i = 0; i < (n || 1); i++) {
        if (BK.state === 'card') { BK.cardClose(); cards++; }
        if (!${foes} && frames % 20 === 0) for (const e of BK.enemies()) if (!e.boss && e.alive) e.alive = false;
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
          if (P().qsDepth > 0) { if (n % 7 === 0) BK.press('jump'); tick(1); continue; }   /* A DRIFT holds you: jump, and keep jumping */
          if (Math.abs(P().x - lx) < 0.3) still++; else still = 0; lx = P().x;
          if (still > 8 && P().ground && !o.noJump) { k.jump = true; BK.press('jump'); still = 0; tick(14); continue; }
          tick(1); }
        clear(); tick(2); return Math.abs(P().x - goal) <= (o.tol || 4) + 3; };
      const settle = () => { for (let j = 0; j < 150 && !P().ground && !P().climb; j++) { clear(); tick(1); } };
      const waitFor = (cond, max, o = {}) => { for (let i = 0; i < max && !cond(); i++) { if (!o.noFight && fight()) continue; clear(); tick(1); } return cond(); };
      const leap = d => { settle(); clear(); k[d > 0 ? 'right' : 'left'] = true; k.jump = true; BK.press('jump'); for (let j = 0; j < 70; j++) { tick(1); if (j > 22) k.jump = false; if (j > 4 && P().ground) break; } clear(); tick(2); };   /* a running jump over a gap */
      const trap = id => K().traps.find(t => t.id === id), pair = id => K().pairs.find(p => p.id === id);
      const LEGS = [
        ['THE FACE: up the steps in the storm, down the robbers\\' hole', [3, 27], () => { walk(46); walk(69, { tol: 3 }); settle(); waitFor(() => P().ground && feet() === 21, 200); return feet() === 21 && col() >= 66 && col() <= 72; }, [70, 21]],
        ['THE GALLERY OF PLATES: the guard under the block, the dart run (tread, wait, cross), down the hole', [70, 21], () => { walk(103, { tol: 3 }); walk(104, { tol: 3 }); waitFor(() => trap('g1darts').st === 'reset' || trap('g1darts').st === 'ready' && K().n.byTrap.g1darts, 240);
            DBG.push('darts ' + trap('g1darts').st); walk(119, { tol: 6, noJump: true }); settle(); waitFor(() => P().ground, 120); return feet() === 29; }, [119, 29]],
        ['THE LOWER GALLERY: tread the groove\\'s plate, the stone runs it, walk the groove', [119, 29], () => { walk(122, { tol: 3 }); waitFor(() => trap('g2stone').st === 'reset', 600); DBG.push('stone ' + trap('g2stone').st); walk(170); return col() >= 168 && feet() === 29; }, [170, 29]],
        ['THE FIRST COUNTERWEIGHT: stand on the block, ride it down', [170, 29], () => { walk(180, { tol: 5 }); waitFor(() => pair('cw1').t > 0.97, 600, { noFight: true }); DBG.push('cw1 ' + pair('cw1').t.toFixed(2) + ' at ' + col() + ',' + feet()); walk(192); return col() >= 190 && feet() === 39; }, [192, 39]],
        ['WEIGH IT: tread the pale block, the tomb\\'s block falls on its mate, up to the corridor', [192, 39], () => { walk(214, { tol: 5 }); waitFor(() => pair('cw2').t > 0.97, 900, { noFight: true }); DBG.push('cw2 ' + pair('cw2').t.toFixed(2) + ' at ' + col() + ',' + feet()); walk(226); return col() >= 224 && feet() === 29; }, [226, 29]],
        ['THE FALSE TOMB: tread the great stone\\'s plate, it breaks the false door, down the robbers\\' shaft', [226, 29], () => { walk(256, { tol: 3 }); waitFor(() => K().broken.falsedoor, 1200); DBG.push('door ' + !!K().broken.falsedoor); walk(310); settle(); walk(331); settle(); waitFor(() => P().ground, 200); walk(338); return col() >= 336 && feet() === 43; }, [338, 43]],
        ['THE SCARAB PITS: fill the first, fill the second (too wide), the darts\\' corridor, down the hole', [338, 43], () => { walk(340, { tol: 3 }); waitFor(() => trap('pit1').filled, 240); walk(353, { tol: 3 }); waitFor(() => trap('pit2').filled, 240); DBG.push('pits ' + trap('pit1').filled + '/' + trap('pit2').filled);
            walk(357, { tol: 2, noJump: true }); leap(1); walk(363, { tol: 2, noJump: true }); leap(1); walk(383, { tol: 3 }); waitFor(() => trap('corr').st === 'reset', 240); walk(402, { tol: 6, noJump: true }); settle(); waitFor(() => P().ground, 200); return feet() === 50; }, [402, 50]],
        ['THE DEEP WAY: the warden\\'s block, over his pit, spend the shaft\\'s darts, ride under them', [402, 50], () => { walk(408, { tol: 3 }); tick(60); walk(419, { tol: 2, noJump: true }); leap(1); walk(436, { tol: 3 }); waitFor(() => trap('shaft').st === 'reset', 300); DBG.push('shaft ' + trap('shaft').st);
            walk(440, { tol: 5, noFight: true }); waitFor(() => pair('cw3').t > 0.97, 900, { noFight: true }); DBG.push('cw3 ' + pair('cw3').t.toFixed(2) + ' at ' + col() + ',' + feet()); walk(441, { tol: 4 }); leap(1); walk(448); return col() >= 446 && feet() === 56; }, [448, 56]],
      ];
      let lifts = [], retries = 0;
      if (${FROM}) { BK.tp(LEGS[${FROM}][1][0], LEGS[${FROM}][1][1]); BK.sim(5); }
      for (const [name, foot, plan, end] of LEGS.slice(${FROM})) {
        legDmg = {}; let okLeg = false, tries = 0; const f0 = frames;
        while (!okLeg && tries < 3) { tries++; try { okLeg = !!plan(); if (!okLeg) throw new Died('failed'); } catch (e) { if (!(e instanceof Died)) throw e; retries++; BK.tp(foot[0], foot[1]); P().vx = P().vy = 0; clear(); BK.sim(5); } }
        if (!okLeg) { lifts.push(name); DBG.push('LIFT at ' + col() + ',' + feet()); BK.tp(end[0], end[1]); BK.sim(5); }
        legs.push({ name, ok: okLeg, tries, at: [col(), feet()], hp: Math.round(P().hp), secs: +((frames - f0) / 60).toFixed(1), dmg: legDmg });
      }
      return { hero: ${JSON.stringify(hero)}, maxHp, legs, dbg: DBG.slice(0, 60), lifts, retries, cards, deaths: BK.stats().deaths, lowest: +lowest.toFixed(2), secs: +(frames / 60).toFixed(0), n: K().n };
    })()`, 1800000);
    console.log('\n== ' + r.hero + ' (hp ' + r.maxHp + ')' + (god ? ' GOD' : '') + (foes ? '' : ' NO FOES'));
    for (const l of r.legs) console.log('  ' + (l.ok ? 'ok  ' : 'LIFT') + ' ' + l.name.padEnd(96) + ' tries ' + l.tries + '  at ' + l.at.join(',') + '  hp ' + l.hp + '  ' + l.secs + ' s  ' + JSON.stringify(l.dmg));
    if (process.argv.includes('--dbg')) console.log('  ' + r.dbg.join(' | '));
    console.log('  level-up cards ' + r.cards + ';  deaths ' + r.deaths + ', retries ' + r.retries + ', lifts ' + r.lifts.length + (r.lifts.length ? ' (' + r.lifts.join('; ') + ')' : '') + ', lowest ' + Math.round(r.lowest * 100) + '%, ' + r.secs + ' s  ' + JSON.stringify(r.n));
    summary.push(r.hero + ': ' + (r.lifts.length ? r.lifts.length + ' LIFTED' : 'walked') + ', ' + r.deaths + ' deaths'); if (r.lifts.length) bad++;
  }
} finally { await pg.close(); }
console.log('\n' + summary.join(' | '));
process.exit(bad ? 1 : 0);
