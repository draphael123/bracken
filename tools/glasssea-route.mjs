// tools/glasssea-route.mjs - THE GLASS SEA walked end to end with REAL KEYS (claude/glasssea; the shape of tools/underwell-route.mjs). Not in the suite: a
// route pilot. A scripted hand holds a direction, hops onto the next ledge, SLIDES (down held) down the slick glass and leaps the slide gap, TURNS the mirrors
// (E) and waits for the glass to fuse, climbs the Sunken Head's holds, relays the fires onto the boiling cracks, and cuts down what stands in its way with plain
// swings (it never blocks or dodges: a careless player). A fresh save's hero (level 1, no skills), every foe alive unless foes=0.
// Every leg prints where it ended, the health left, and THE DAMAGE BY SOURCE in that leg. A death stands you up at the last checkpoint: the hand is taken back to
// the leg's foot (a retry, counted); a leg that fails three times is LIFTED past (a teleport, counted and named).
//   PORT=8664 node tools/glasssea-route.mjs [heroes=knight,warden,pyro] [god=0|1] [foes=1|0]   (god=1 foes=0: base movement only - can this hero do the route)
import { openPage } from './cdp.mjs';
const heroes = (process.argv[2] || 'knight,warden,pyro').split(','), god = process.argv[3] === '1', foes = process.argv[4] !== '0';
const pg = await openPage({ audio: false, fonts: false });
let bad = 0; const summary = [];
try {
  for (const hero of heroes) {
    await pg.reload();
    const r = await pg.evalp(`(async()=>{
      const { LEVELS } = await import('/src/level.js'); const TS = 16;
      BK.manualSimulation = true; BK.setHero(${JSON.stringify(hero)}); BK.reset({ fresh: true });
      BK.load(LEVELS.findIndex(l => l.id === 'glasssea')); BK.state = 'play'; BK.god = ${god}; BK.sim(5);
      if (!${foes}) for (const e of BK.enemies()) if (!e.boss && e.t !== 'colossus') e.alive = false;
      const P = () => BK.P, k = BK.keys, G = () => BK.glassSea(), legs = [], DBG = []; let frames = 0, legDmg = {}, lowest = 1, cards = 0;
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
      const wait = (n, o = {}) => { for (let i = 0; i < n; i++) { if (!o.noFight && fight()) continue; clear(); tick(1); } };
      const waitFor = (cond, max, o = {}) => { for (let i = 0; i < max && !cond(); i++) { if (!o.noFight && fight()) continue; clear(); tick(1); } return cond(); };
      const hop = (from, row, dir = 0) => { for (let a = 0; a < 3; a++) { if (feet() === row && P().ground) return true; walk(from, { tol: 3 }); settle();
          clear(); if (dir) k[dir > 0 ? 'right' : 'left'] = true; k.jump = true; BK.press('jump');
          for (let j = 0; j < 90; j++) { tick(1); if (j > 26) k.jump = false; if (j > 4 && P().ground) break; }
          clear(); tick(3); if (feet() === row && P().ground) return true; }
        DBG.push('hop ' + from + '>' + row + ' failed at ' + col() + ',' + feet()); return feet() === row; };
      const drop = () => { settle(); for (let a = 0; a < 3; a++) { const f0 = feet(); clear(); k.down = true; BK.press('jump'); tick(4); k.down = false; settle(); if (feet() > f0) return true; } return false; };
      const leap = (from, to) => { for (let a = 0; a < 3; a++) { walk(from - 2, { tol: 3 }); settle(); clear(); let n = 0; while (P().x < from * TS + 12 && n++ < 120) { k.right = true; tick(1); }
          k.jump = true; BK.press('jump'); for (let j = 0; j < 80; j++) { k.right = true; k.jump = j < 26; tick(1); if (j > 6 && P().ground) break; } clear(); tick(3); if (col() >= to) return true; }
        DBG.push('leap ' + from + '>' + to + ' failed at ' + col() + ',' + feet()); return false; };
      const face = d => { clear(); k[d > 0 ? 'right' : 'left'] = true; tick(1); clear(); tick(1); P().face = d; };
      const press = (key, d) => { settle(); if (d) face(d); BK.press(key); tick(6); clear(); tick(4); };
      const bed = id => G().beds.find(b => b.id === id), fused = id => bed(id).k >= 1, held = id => G().cracks.find(c => c.id === id).held;
      const mirror = id => G().mirrors.find(m => m.id === id);
      /* TURN a mirror until it stands at the wanted notch (at most three presses): E from where the hero stands */
      const turn = (id, want) => { for (let i = 0; i < 4 && mirror(id).state !== want; i++) press('talk'); return mirror(id).state === want; };
      /* THE SLIDE: from the crest, right and down held down the slick slope; at the foot, a leap with right held */
      const slideLeap = (crest, foot) => { walk(crest, { tol: 2, noFight: true }); clear(); k.right = true; k.down = true; let n = 0;
        while (P().x < foot * TS + 6 && n++ < 400) { tick(1); k.right = true; k.down = true; }
        k.down = false; k.jump = true; BK.press('jump'); for (let j = 0; j < 80; j++) { k.right = true; k.jump = j < 26; tick(1); if (j > 6 && P().ground) break; } clear(); tick(4);
        DBG.push('slide leap from ' + crest + ': landed ' + col() + ',' + feet() + ' vx ' + Math.round(P().vx)); };
      /* (claude/slickslope) THE LANDING HAS ROOM: col() >= 148 passed a toe on the far lip (the mantle's catch) and the hand's frame-perfect leap hid that a person had
         nothing to spare (Daniel's geomancer, 10-07). A leap over the slide gap counts only a tile clear of the far lip (tools/glasssea-slide.mjs measures the window) */
      const pastGap = id => { const c = BK.level.cracks.find(q => q.id === id); return P().ground && P().x >= (c.x1 + 2) * TS; };
      /* (glasssea2) THE ROCKING MIRRORS: set a mirror's notch (a rocking mirror's state flips with its rhythm: count the notch, not the state); then cross its glass steps -
         wait for a FRESH beam (the timer full), run, and take a short hop off the end of each step; a fall (soft or real) is retried from where the hand was put back */
      const turnSet = (id, n) => { for (let i = 0; i < 4 && mirror(id).n !== n; i++) press('talk'); return mirror(id).n === n; };
      const skip = (id, takeoffs, land) => { for (let a = 0; a < 4; a++) { const f0 = G().n.falls;
          if (!waitFor(() => mirror(id).pph === 'on' && mirror(id).pk > 0.8 && bed(id).k >= 1, 900, { noFight: true })) { DBG.push('rhythm ' + id + ' never came'); return false; }
          for (const c of takeoffs) { let n = 0; clear(); while (P().x < c * TS + 12 && n++ < 200) { k.right = true; tick(1); }
            k.jump = true; BK.press('jump'); for (let j = 0; j < 70; j++) { k.right = true; k.jump = j < 9; tick(1); if (j > 4 && P().ground) break; } }
          clear(); tick(4); if (G().n.falls === f0 && col() >= land && P().ground) return true; DBG.push('skip ' + id + ' try ' + a + ' at ' + col() + ',' + feet()); settle(); }
        return false; };
      const LEGS = [
        ['the glass edge: the slide, the first mirror, the stair', [4, 29], () => { walk(26); walk(40, { tol: 3 }); turn('first', '\\\\'); waitFor(() => fused('firstStair'), 300);
            hop(43, 31, 0); hop(44, 29, 1); hop(47, 28, 1); walk(69); walk(95); return col() >= 93 && fused('firstStair'); }, [95, 33]],
        ['the fulgurite field: the slide gap', [95, 33], () => { walk(131); walk(134, { tol: 2 }); slideLeap(134, 142); if (!pastGap('slideGap')) return false; walk(169, { tol: 3 }); turnSet('pulseA', 1); if (!skip('pulseA', [171, 175, 179], 181)) return false; walk(189); hop(189, 30, 1); walk(197); return col() >= 196; }, [199, 33]],
        ['the bone crossing: the sun-mirror bridge', [165, 33], () => { walk(223, { tol: 3 }); turn('bridge', '\\\\'); waitFor(() => fused('bridge'), 300); walk(244); walk(261, { tol: 3 }); turnSet('hawkX', 1); if (!skip('hawkX', [263, 266, 269], 271)) return false; walk(272, { tol: 3, noFight: true }); turnSet('hawkY', 1); if (!skip('hawkY', [273, 276, 279], 282)) return false; walk(295); return col() >= 293; }, [295, 33]],
        ['the fork obelisk: the chain', [300, 33], () => { walk(316, { tol: 3 }); turn('chainA', '/'); hop(319, 30, 1); hop(320, 27, 1); hop(320, 24, 0); walk(317, { tol: 3, noFight: true }); turn('chainB', '/');
            waitFor(() => fused('headBridge'), 400); walk(322, { tol: 3 }); drop(); walk(330); hop(333, 30, 1); hop(337, 27, 1); walk(361); return fused('headBridge') && col() >= 360 && feet() === 27; }, [361, 27]],
        ['the sunken head: the climb', [361, 27], () => { hop(363, 24, 0); hop(363, 21, 0); hop(365, 18, 0); hop(368, 16, 1); walk(382); walk(400); leap(408, 412); walk(446); return col() >= 444; }, [446, 33]],
        ['the cold flats: the dark cut', [446, 33], () => { leap(448, 452); leap(491, 495); walk(501, { tol: 3 }); turn('relay', '/'); waitFor(() => held('darkCut'), 100); leap(519, 523); leap(559, 563); walk(571); return col() >= 569 && held('darkCut'); }, [571, 33]],
        ['the colossus steps: the gaze and the relay', [571, 33], () => { walk(586, { tol: 3 }); hop(586, 27, 0); walk(588, { tol: 3, noFight: true }); turn('gaze', '/'); DBG.push('gaze at ' + col() + ',' + feet() + ' ' + mirror('gaze').state); waitFor(() => fused('stepsBridge'), 300); DBG.push('bridge ' + bed('stepsBridge').k);
            walk(584, { tol: 3 }); settle(); walk(582, { tol: 3 }); turn('stepsRelay', '/'); waitFor(() => held('steps'), 100); walk(600); return col() >= 598; }, [600, 30]],
      ];
      let lifts = [], retries = 0;
      for (const [name, foot, plan, end] of LEGS) {
        legDmg = {}; let okLeg = false, tries = 0; const f0 = frames;
        while (!okLeg && tries < 3) { tries++; try { okLeg = !!plan(); if (!okLeg) throw new Died('failed'); } catch (e) { if (!(e instanceof Died)) throw e; retries++; BK.tp(foot[0], foot[1]); P().vx = P().vy = 0; clear(); BK.sim(5); } }
        if (!okLeg) { lifts.push(name); BK.tp(end[0], end[1]); BK.sim(5); }
        legs.push({ fall: G().lastFall, falls: G().n.falls, name, ok: okLeg, tries, at: [col(), feet()], hp: Math.round(P().hp), secs: +((frames - f0) / 60).toFixed(1), dmg: legDmg });
      }
      return { hero: ${JSON.stringify(hero)}, maxHp, legs, dbg: DBG.slice(0, 40), lifts, retries, cards, deaths: BK.stats().deaths, lowest: +lowest.toFixed(2), secs: +(frames / 60).toFixed(0), n: G().n };
    })()`, 1800000);
    console.log('\n== ' + r.hero + ' (hp ' + r.maxHp + ')' + (god ? ' GOD' : '') + (foes ? '' : ' NO FOES'));
    for (const l of r.legs) console.log('  ' + (l.ok ? 'ok  ' : 'LIFT') + ' ' + l.name.padEnd(52) + ' tries ' + l.tries + '  at ' + l.at.join(',') + '  hp ' + l.hp + '  ' + l.secs + ' s  ' + JSON.stringify(l.dmg) + ' falls ' + l.falls + ' ' + JSON.stringify(l.fall));
    if (process.argv.includes('--dbg')) console.log('  ' + r.dbg.join(' | '));
    console.log('  level-up cards ' + r.cards + ';  deaths ' + r.deaths + ', retries ' + r.retries + ', lifts ' + r.lifts.length + (r.lifts.length ? ' (' + r.lifts.join('; ') + ')' : '') + ', lowest ' + Math.round(r.lowest * 100) + '%, ' + r.secs + ' s  ' + JSON.stringify(r.n));
    summary.push(r.hero + ': ' + (r.lifts.length ? r.lifts.length + ' LIFTED' : 'walked') + ', ' + r.deaths + ' deaths'); if (r.lifts.length) bad++;
  }
} finally { await pg.close(); }
console.log('\n' + summary.join(' | '));
process.exit(bad ? 1 : 0);
