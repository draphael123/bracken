// tools/ksar-route.mjs - THE BANDIT KSAR walked end to end with REAL KEYS (claude/ksar; the shape of tools/glasssea-route.mjs). Not in the suite: a route
// pilot. A scripted hand holds a direction, hops onto the next ledge, CUTS the gongs on its way (ATTACK at a gong), RINGS THE GREAT GONG (E) and hauls the
// gate winch (E, notch by notch), KICKS the powder store's first keg (ATTACK) and waits for the chain to blow the bricked arch, and cuts down what stands in
// its way with plain swings (it never blocks or dodges: a careless player). A fresh save's hero (level 1, no skills), every foe alive unless foes=0.
// Every leg prints where it ended, the health left and THE DAMAGE BY SOURCE in that leg. A death stands you up at the last checkpoint: the hand is taken back to
// the leg's foot (a retry, counted); a leg that fails three times is LIFTED past (a teleport, counted and named).
//   PORT=8704 node tools/ksar-route.mjs [heroes=knight,warden,pyro] [god=0|1] [foes=1|0]   (god=1 foes=0: base movement only - can this hero do the route)
import { openPage } from './cdp.mjs';
const heroes = (process.argv[2] || 'knight,warden,pyro').split(','), god = process.argv[3] === '1', foes = process.argv[4] !== '0', LVL = +((process.argv.find(a => a.startsWith('--lvl=')) || '--lvl=0').slice(6));   /* --lvl=N: a hero of level N (BKT.setHeroLevel, no skills) instead of a fresh one */
const pg = await openPage({ audio: false, fonts: false });
let bad = 0; const summary = [];
try {
  for (const hero of heroes) {
    await pg.reload();
    const r = await pg.evalp(`(async()=>{
      const { LEVELS } = await import('/src/level.js'); const TS = 16;
      BK.manualSimulation = true; if (${LVL}) { const P0 = BKT.PROG; BKT.setHeroLevel(${JSON.stringify(hero)}, ${LVL}); P0.skillOwned = P0.skillOwned || {}; P0.loadouts = P0.loadouts || {}; P0.skillOwned[${JSON.stringify(hero)}] = {}; P0.loadouts[${JSON.stringify(hero)}] = []; } BK.setHero(${JSON.stringify(hero)}); BK.reset({ fresh: !${LVL} }); if (${LVL}) BK.applyUpgrades && BK.applyUpgrades();
      BK.load(LEVELS.findIndex(l => l.id === 'ksar')); BK.state = 'play'; BK.god = ${god}; BK.sim(5);
      if (!${foes}) for (const e of BK.enemies()) if (!e.boss && e.t !== 'hawkmistress') e.alive = false;
      const P = () => BK.P, k = BK.keys, K = () => BK.ksar(), legs = [], DBG = []; let frames = 0, legDmg = {}, lowest = 1, cards = 0;
      const maxHp = P().maxHp;
      const clear = () => { k.left = k.right = k.jump = k.down = k.up = k.atk = k.block = false; };
      class Died extends Error {}
      const tick = n => { for (let i = 0; i < (n || 1); i++) {
        if (BK.state === 'card') { BK.cardClose(); cards++; }
        const hp0 = P().hp, d0 = BK.stats().deaths; BK.log = []; BK.sim(1); frames++;
        const lost = hp0 - P().hp, died = BK.stats().deaths > d0;
        if (lost > 0 || died) { const hits = (BK.log || []).filter(q => q.k === 'dmgP'); const who = hits.length ? (hits[0].who || hits[0].name || (hits[0].by && (hits[0].by.cnSkin || hits[0].by.t)) || 'hazard') : 'other';
          legDmg[who] = (legDmg[who] || 0) + Math.max(0, died ? hp0 : lost); }
        lowest = Math.min(lowest, P().hp / maxHp);
        if (died || P().dead) { for (let j = 0; j < 600 && (P().dead || BK.state !== 'play'); j++) { BK.sim(1); frames++; if (BK.state === 'dead' || BK.state === 'gameover') BK.state = 'play'; } throw new Died('died'); } } };
      const feet = () => Math.round(P().y / TS) - 1, col = () => Math.floor(P().x / TS);
      const fight = () => { const e = BK.enemies().filter(q => q.alive && !q.boss && !q.harmless && q.t !== 'hawkmistress' && Math.abs(q.x - P().x) < 56 && Math.abs(q.y - P().y) < 16).sort((a, b) => Math.abs(a.x - P().x) - Math.abs(b.x - P().x))[0];
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
      const wait = (n, o = {}) => { for (let i = 0; i < n; i++) { if (!o.noFight && fight()) continue; clear(); tick(1); } };
      const waitFor = (cond, max, o = {}) => { for (let i = 0; i < max && !cond(); i++) { if (!o.noFight && fight()) continue; clear(); tick(1); } return cond(); };
      const hop = (from, row, dir = 0) => { for (let a = 0; a < 3; a++) { if (feet() === row && P().ground) return true; walk(from, { tol: 3 }); settle();
          clear(); if (dir) k[dir > 0 ? 'right' : 'left'] = true; k.jump = true; BK.press('jump');
          for (let j = 0; j < 90; j++) { tick(1); if (j > 26) k.jump = false; if (j > 4 && P().ground) break; }
          clear(); tick(3); if (feet() === row && P().ground) return true; }
        DBG.push('hop ' + from + '>' + row + ' failed at ' + col() + ',' + feet()); return feet() === row; };
      const leap = (from, to) => { for (let a = 0; a < 3; a++) { walk(from - 2, { tol: 3 }); settle(); clear(); let n = 0; while (P().x < from * TS + 12 && n++ < 120) { k.right = true; tick(1); }
          k.jump = true; BK.press('jump'); for (let j = 0; j < 80; j++) { k.right = true; k.jump = j < 26; tick(1); if (j > 6 && P().ground) break; } clear(); tick(3); if (col() >= to) return true; }
        DBG.push('leap ' + from + '>' + to + ' failed at ' + col() + ',' + feet()); return false; };
      const face = d => { clear(); k[d > 0 ? 'right' : 'left'] = true; tick(1); clear(); tick(1); P().face = d; };
      const press = (key, d) => { settle(); if (d) face(d); BK.press(key); tick(8); clear(); tick(4); };
      const gong = id => K().gongs.find(g => g.id === id);
      /* CUT a gong: stand a step before it and swing */
      const cutGong = id => { const g = gong(id); if (!g || g.cut) return true; walk(g.x - 1, { tol: 3 }); for (let i = 0; i < 4 && !gong(id).cut; i++) press('atk', 1); DBG.push('cut ' + id + ': ' + gong(id).cut); return gong(id).cut; };
      const LEGS = [
        ['the caravan road: the first gong, up the outer wall', [3, 37], () => { walk(20); cutGong('g1'); walk(60); hop(61, 31, 1); hop(65, 29, 1); hop(69, 27, 1); walk(74); return col() >= 72 && feet() === 27; }, [74, 27]],
        ['the outer walls: the lookout\\'s gong, the sentry\\'s', [74, 27], () => { leap(83, 87); walk(91); hop(91, 25, 1); hop(94, 23, 1); hop(96, 21, 1); walk(104); walk(121); leap(123, 127); cutGong('g2'); walk(151); hop(151, 25, 1); hop(154, 23, 1); hop(157, 20, 1); walk(164); walk(186); cutGong('g3'); leap(188, 192); walk(211); leap(213, 217); walk(230); hop(231, 24, 1); return col() >= 231 && feet() === 24; }, [233, 24]],
        ['the gate winch: ring the great gong, haul the gate', [168, 27], () => { walk(235, { tol: 3 }); press('talk', 1); DBG.push('great gong rung: ' + (gong('great').hum > 0));
            walk(251, { noFight: true }); walk(253, { tol: 3 }); settle(); walk(253, { tol: 2 }); settle(); DBG.push('at the winch ' + col() + ',' + feet()); for (let i = 0; i < 12 && !K().gate.pinned; i++) { press('talk', 1); wait(14); } DBG.push('gate ' + JSON.stringify({ n: K().gate.notch, p: K().gate.pinned }));
            if (!K().gate.pinned) return false; walk(276); return col() >= 274; }, [276, 33]],
        ['the souq yard: up the stair to the terrace', [276, 33], () => { walk(340); hop(342, 31, 1); hop(348, 29, 1); hop(351, 27, 1); hop(354, 25, 1); hop(355, 24, 1); cutGong('terrace'); walk(392); return col() >= 390 && feet() === 24; }, [392, 24]],
        ['the powder store: kick the first keg, the chain blows the arch', [392, 24], () => { walk(398, { tol: 3 }); for (let i = 0; i < 3 && K().setKegs[0].st === 'set'; i++) press('atk', 1);
            walk(390, { noFight: true }); waitFor(() => K().barricades.find(b => b.id === 'storeArch').broken, 900); DBG.push('chain: ' + K().setKegs.map(q => q.st).join(','));
            if (!K().barricades.find(b => b.id === 'storeArch').broken) return false; walk(424); settle(); if (feet() > 24) { if (feet() > 27) { hop(420, 28, 1); } hop(424, 26, 1); hop(425, 24, 1); } walk(455); DBG.push('past the arch ' + col() + ',' + feet()); return col() >= 452; }, [455, 24]],
        ['the hawk tower roofs: the gaps, the bridge gong, the tower door', [455, 24], () => { hop(455, 21, 1); hop(458, 18, 1); leap(466, 470); cutGong('roofA'); leap(478, 482); walk(489); leap(490, 494);
            cutGong('bridge'); DBG.push('bridge ' + K().n.bridges); walk(533); cutGong('roofC'); walk(557, { tol: 3 }); settle(); press('talk', 1); DBG.push('keg in hand ' + !!(P().carry && P().carry.thrKind)); walk(554, { tol: 3, noFight: true }); press('atk', 1);
            waitFor(() => K().barricades.find(b => b.id === 'towerArch').broken, 240, { noFight: true }); DBG.push('tower door ' + K().barricades.find(b => b.id === 'towerArch').broken); if (!K().barricades.find(b => b.id === 'towerArch').broken) return false;
            walk(574); walk(581); settle(); DBG.push('the door ' + col() + ',' + feet()); return col() >= 579 && feet() === 33; }, [581, 33]],
      ];
      let lifts = [], retries = 0;
      for (const [name, foot, plan, end] of LEGS) {
        legDmg = {}; let okLeg = false, tries = 0; const f0 = frames;
        while (!okLeg && tries < 3) { tries++; try { okLeg = !!plan(); if (!okLeg) throw new Died('failed'); } catch (e) { if (!(e instanceof Died)) throw e; retries++; BK.tp(foot[0], foot[1]); P().vx = P().vy = 0; clear(); BK.sim(5); } }
        if (!okLeg) { lifts.push(name); BK.tp(end[0], end[1]); BK.sim(5); }
        legs.push({ name, ok: okLeg, tries, at: [col(), feet()], hp: Math.round(P().hp), secs: +((frames - f0) / 60).toFixed(1), dmg: legDmg });
      }
      return { hero: ${JSON.stringify(hero)}, maxHp, legs, dbg: DBG.slice(0, 50), lifts, retries, cards, deaths: BK.stats().deaths, lowest: +lowest.toFixed(2), secs: +(frames / 60).toFixed(0), n: K().n };
    })()`, 1800000);
    console.log('\n== ' + r.hero + ' (hp ' + r.maxHp + ')' + (god ? ' GOD' : '') + (foes ? '' : ' NO FOES'));
    for (const l of r.legs) console.log('  ' + (l.ok ? 'ok  ' : 'LIFT') + ' ' + l.name.padEnd(58) + ' tries ' + l.tries + '  at ' + l.at.join(',') + '  hp ' + l.hp + '  ' + l.secs + ' s  ' + JSON.stringify(l.dmg));
    if (process.argv.includes('--dbg')) console.log('  ' + r.dbg.join(' | '));
    console.log('  level-up cards ' + r.cards + ';  deaths ' + r.deaths + ', retries ' + r.retries + ', lifts ' + r.lifts.length + (r.lifts.length ? ' (' + r.lifts.join('; ') + ')' : '') + ', lowest ' + Math.round(r.lowest * 100) + '%, ' + r.secs + ' s  ' + JSON.stringify(r.n));
    summary.push(r.hero + ': ' + (r.lifts.length ? r.lifts.length + ' LIFTED' : 'walked') + ', ' + r.deaths + ' deaths'); if (r.lifts.length) bad++;
  }
} finally { await pg.close(); }
console.log('\n' + summary.join(' | '));
process.exit(bad ? 1 : 0);
