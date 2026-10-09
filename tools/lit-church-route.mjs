// tools/lit-church-route.mjs - THE LIT CHURCH walked end to end with REAL KEYS (claude/litchurch; the shape of tools/ksar-route.mjs). Not in the suite: a route
// pilot. A scripted hand holds a direction, hops onto the next ledge, takes a flame at a fire (E) and carries it to a dark lamp (E), strikes the bellows and rides
// their breath, plays the key desk's chord and jumps the broken loft in its gust, snuffs the seal lamp, climbs the crypt well lighting its sconces as relays,
// lights the rood screen's third sconce, and cuts down what stands in its way with plain swings (it never blocks or dodges: a careless player). A fresh save's
// hero (level 1, no skills), every foe alive unless foes=0. Every leg prints where it ended, the health left and THE DAMAGE BY SOURCE in that leg. A death
// stands you up at the last checkpoint: the hand is taken back to the leg's foot (a retry, counted); a leg that fails three times is LIFTED past (counted).
//   PORT=8734 node tools/lit-church-route.mjs [heroes=knight,warden,pyro] [god=0|1] [foes=1|0] [--lvl=N] [--dbg]
//   (god=1 foes=0: base movement only - can this hero do the route)
import { openPage } from './cdp.mjs';
const heroes = (process.argv[2] || 'knight,warden,pyro').split(','), god = process.argv[3] === '1', foes = process.argv[4] !== '0', LVL = +((process.argv.find(a => a.startsWith('--lvl=')) || '--lvl=0').slice(6));
const pg = await openPage({ audio: false, fonts: false });
let bad = 0; const summary = [];
try {
  for (const hero of heroes) {
    await pg.reload();
    const r = await pg.evalp(`(async()=>{
      const { LEVELS } = await import('/src/level.js'); const TS = 16;
      BK.manualSimulation = true; if (${LVL}) { const P0 = BKT.PROG; BKT.setHeroLevel(${JSON.stringify(hero)}, ${LVL}); P0.skillOwned = P0.skillOwned || {}; P0.loadouts = P0.loadouts || {}; P0.skillOwned[${JSON.stringify(hero)}] = {}; P0.loadouts[${JSON.stringify(hero)}] = []; } BK.setHero(${JSON.stringify(hero)}); BK.reset({ fresh: !${LVL} }); if (${LVL}) BK.applyUpgrades && BK.applyUpgrades();
      BK.load(LEVELS.findIndex(l => l.id === 'church')); BK.state = 'play'; BK.god = ${god}; BK.sim(5);
      const noFoes = () => { if (!${foes}) for (const e of BK.enemies()) if (e.alive && !e.boss && e.t !== 'paladinboss') { e.alive = false; e.hp = 0; e.defeated = true; } };
      noFoes();
      const P = () => BK.P, k = BK.keys, K = () => BK.litChurch(), H = BK.litChurchHands(), legs = [], DBG = []; let frames = 0, legDmg = {}, lowest = 1, cards = 0;
      const maxHp = P().maxHp;
      const clear = () => { k.left = k.right = k.jump = k.down = k.up = k.atk = k.block = false; };
      class Died extends Error {}
      const tick = n => { for (let i = 0; i < (n || 1); i++) {
        if (BK.state === 'card') { BK.cardClose(); cards++; }
        noFoes();
        const hp0 = P().hp, d0 = BK.stats().deaths; BK.log = []; BK.sim(1); frames++;
        const lost = hp0 - P().hp, died = BK.stats().deaths > d0;
        if (lost > 0 || died) { const hits = (BK.log || []).filter(q => q.k === 'dmgP'); const who = hits.length ? (hits[0].who || hits[0].name || (hits[0].by && (hits[0].by.cnSkin || hits[0].by.t)) || 'hazard') : 'other';
          legDmg[who] = (legDmg[who] || 0) + Math.max(0, died ? hp0 : lost); }
        lowest = Math.min(lowest, P().hp / maxHp);
        if (died || P().dead) { for (let j = 0; j < 600 && (P().dead || BK.state !== 'play'); j++) { BK.sim(1); frames++; if (BK.state === 'dead' || BK.state === 'gameover') BK.state = 'play'; } throw new Died('died'); } } };
      const feet = () => Math.round(P().y / TS) - 1, col = () => Math.floor(P().x / TS);
      const fight = () => { const e = BK.enemies().filter(q => q.alive && !q.boss && !q.harmless && q.t !== 'paladinboss' && Math.abs(q.x - P().x) < 56 && Math.abs(q.y - P().y) < 16).sort((a, b) => Math.abs(a.x - P().x) - Math.abs(b.x - P().x))[0];
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
      const face = d => { clear(); k[d > 0 ? 'right' : 'left'] = true; tick(1); clear(); tick(1); P().face = d; };
      const press = (key, d) => { settle(); if (d) face(d); BK.press(key); tick(8); clear(); tick(4); };
      const lamp = id => K().lamps.find(l => l.id === id), door = id => K().doors.find(d => d.id === id);
      /* TAKE A FLAME at a fire and LIGHT a lamp with it */
      const take = (fx, d) => { walk(fx, { tol: 3 }); press('talk', d || 1); return P().lcFlame > 0; };
      const light = (lx, id, d) => { walk(lx, { tol: 3 }); press('talk', d || 1); DBG.push(id + ' lit: ' + lamp(id).lit + ' (flame ' + P().lcFlame.toFixed(1) + ')'); return lamp(id).lit; };
      /* RIDE A BELLOWS: strike it, stand in its breath, steer off the top */
      const bellows = (bx, offDir) => { walk(bx - 1, { tol: 3 }); press('atk', 1); walk(bx, { tol: 2, noFight: true }); let top = 99;
        for (let j = 0; j < 200; j++) { clear(); if (P().y / TS < (K().bellows.find(b => Math.abs(b.x - bx) < 1).top + 3)) k[offDir > 0 ? 'right' : 'left'] = true; tick(1); top = Math.min(top, feet()); if (j > 30 && P().ground) break; }
        clear(); tick(4); DBG.push('bellows ' + bx + ': top row ' + top + ', at ' + col() + ',' + feet()); };
      const LEGS = [
        ['the graveyard: a flame, the porch lamp, the west door', [2, 34], () => { hop(6, 36, 1); take(9); light(40, 'porch'); walk(58); return door('west').open && col() >= 56; }, [58, 36]],
        ['the nave: the pews, the pulpit, to the crossing', [58, 36], () => { walk(149); return col() >= 147; }, [149, 36]],
        ['the north transept: the piers, lamp one, the bellows', [149, 36], () => { hop(151, 34, 1); hop(155, 32, 1); hop(156, 30, 1); hop(159, 28, 1); take(162); light(175, 'chapel1');
            bellows(166, -1); return feet() <= 18 && lamp('chapel1').lit; }, [160, 18]],
        ['the organ gallery: the pipes, the chord over the broken loft, lamp two', [160, 18], () => { walk(158, { tol: 3 }); hop(158, 16, -1); hop(156, 14, -1); walk(152, { tol: 3 }); settle(); hop(152, 16, -1); hop(150, 14, -1); walk(110); walk(109, { tol: 3 }); press('talk', -1);
            waitFor(() => K().desks[0].on > 0, 60, { noFight: true }); walk(107, { tol: 2, noFight: true }); clear(); k.left = true; BK.press('jump'); for (let j = 0; j < 70; j++) { k.left = true; k.jump = j < 26; tick(1); if (j > 6 && P().ground) break; }
            clear(); tick(3); DBG.push('over the loft at ' + col() + ',' + feet()); if (feet() > 19) return false; take(66, -1); light(60, 'chapel2', -1); return lamp('chapel2').lit; }, [70, 18]],
        ['the west tower: the seal lamp, the drop, the hatch', [62, 18], () => { walk(54, { noFight: true }); settle(); walk(52, { tol: 3 }); press('atk', 1); DBG.push('seal ' + lamp('seal').lit + ' hatch ' + door('hatch').open);
            walk(47, { tol: 3 }); settle(); walk(49, { tol: 2 }); settle(); for (let j = 0; j < 200 && feet() < 51; j++) { clear(); k.right = j % 40 > 30; tick(1); } walk(57); settle(); return feet() >= 51; }, [57, 53]],
        ['the crypt: the ossuary, the sealed vault, lamp three', [57, 53], () => { walk(170); take(172); light(175, 'chapel3'); return lamp('chapel3').lit && door('cryptgrate').open; }, [170, 53]],
        ['the crypt well: the dark rises - relay the flame up the landings, light the third sconce', [170, 53], () => { take(172, 1);
            walk(161, { tol: 3 }); hop(161, 51, 0); walk(160, { tol: 3 }); if (!lamp('wellA').lit) press('talk', -1); hop(162, 49, 1); hop(164, 47, -1); hop(162, 45, 1); walk(166, { tol: 3 }); if (!lamp('wellB').lit) { if (P().lcFlame <= 0) DBG.push('no flame at wellB'); press('talk', 1); }
            hop(164, 43, -1); hop(162, 41, 1); hop(164, 39, -1); walk(160, { tol: 3 }); if (!lamp('wellC').lit) press('talk', -1); if (lamp('wellC').lit) press('talk', -1);   /* a fresh flame off the top sconce: the carry to the screen */
            hop(162, 37, 1); clear(); k.right = true; BK.press('jump'); for (let j = 0; j < 50; j++) { k.right = true; k.jump = j < 20; tick(1); if (j > 6 && P().ground && feet() <= 36) break; } clear(); tick(3);
            DBG.push('out of the well at ' + col() + ',' + feet() + ' flame ' + P().lcFlame.toFixed(1) + ' escaped ' + K().escaped); if (feet() > 36) return false;
            walk(176, { tol: 3 }); press('talk', 1); DBG.push('rood3 ' + lamp('rood3').lit + ' rood ' + door('rood').open); return door('rood').open; }, [176, 36]],
        ['the south transept: the charnel pit, the Archdeacon\\'s gate, the sanctuary door', [176, 36], () => { walk(186); walk(201); clear(); k.right = true; BK.press('jump'); for (let j = 0; j < 60; j++) { k.right = true; k.jump = j < 24; tick(1); if (j > 6 && P().ground) break; } clear(); tick(3);
            DBG.push('over the pit at ' + col() + ',' + feet()); walk(238); return col() >= 236; }, [238, 40]],
      ];
      let lifts = [], retries = 0;
      for (const [name, foot, plan, end] of LEGS) {
        legDmg = {}; let okLeg = false, tries = 0; const f0 = frames;
        while (!okLeg && tries < 3) { tries++; try { okLeg = !!plan(); if (!okLeg) throw new Died('failed'); } catch (e) { if (!(e instanceof Died)) throw e; retries++; BK.tp(foot[0], foot[1]); P().vx = P().vy = 0; clear(); BK.sim(5); } }
        if (!okLeg) { lifts.push(name); BK.tp(end[0], end[1]); BK.sim(5); }
        legs.push({ name, ok: okLeg, tries, at: [col(), feet()], hp: Math.round(P().hp), secs: +((frames - f0) / 60).toFixed(1), dmg: legDmg });
      }
      return { hero: ${JSON.stringify(hero)}, maxHp, legs, dbg: DBG.slice(0, 60), lifts, retries, cards, deaths: BK.stats().deaths, lowest: +lowest.toFixed(2), secs: +(frames / 60).toFixed(0), n: H.read().n };
    })()`, 1800000);
    console.log('\n== ' + r.hero + ' (hp ' + r.maxHp + ')' + (god ? ' GOD' : '') + (foes ? '' : ' NO FOES'));
    for (const l of r.legs) console.log('  ' + (l.ok ? 'ok  ' : 'LIFT') + ' ' + l.name.padEnd(64) + ' tries ' + l.tries + '  at ' + l.at.join(',') + '  hp ' + l.hp + '  ' + l.secs + ' s  ' + JSON.stringify(l.dmg));
    if (process.argv.includes('--dbg')) console.log('  ' + r.dbg.join(' | '));
    console.log('  level-up cards ' + r.cards + ';  deaths ' + r.deaths + ', retries ' + r.retries + ', lifts ' + r.lifts.length + (r.lifts.length ? ' (' + r.lifts.join('; ') + ')' : '') + ', lowest ' + Math.round(r.lowest * 100) + '%, ' + r.secs + ' s  ' + JSON.stringify(r.n));
    summary.push(r.hero + ': ' + (r.lifts.length ? r.lifts.length + ' LIFTED' : 'walked') + ', ' + r.deaths + ' deaths'); if (r.lifts.length) bad++;
  }
} finally { await pg.close(); }
console.log('\n' + summary.join(' | '));
process.exit(bad ? 1 : 0);
