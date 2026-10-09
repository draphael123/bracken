// tools/towpath-route.mjs - THE TOWPATH walked end to end with REAL KEYS (claude/towpath; the shape of tools/ksar-route.mjs). Not in the suite: a route pilot.
// A scripted hand holds a direction, hops and leaps onto the next footing, and WORKS THE RULE the way a player does: it strikes a lock's paddle from the punt
// and waits for the water to lift it, drains a full chamber from its bank and rides it up again, drains the mill race and climbs the stilled wheel, swings
// the bridges across with their capstans, climbs the warehouse ladder, drains the last lock and goes down its ledges over the irons, through the culvert,
// refills Y on its punt, and swings the last cut across. Base movement only (no skill). A death stands you up at the last checkpoint: the hand is taken
// back to the leg's foot (a retry, counted); a leg that fails three times is LIFTED past (a teleport, counted and named).
//   PORT=8735 node tools/towpath-route.mjs [heroes=knight,warden,pyro,pirate,paladin,geomancer,reaper] [god=1|0] [foes=0|1] [--dbg]
//   (god=1 foes=0, the defaults: can this hero do the route on base movement)
import { openPage } from './cdp.mjs';
const heroes = (process.argv[2] && !process.argv[2].startsWith('-') ? process.argv[2] : 'knight,warden,pyro,pirate,paladin,geomancer,reaper').split(','),
  god = process.argv[3] !== '0', foes = process.argv[4] === '1';
const pg = await openPage({ audio: false, fonts: false });
let bad = 0; const summary = [];
try {
  for (const hero of heroes) {
    await pg.reload();
    const r = await pg.evalp(`(async()=>{
      const { LEVELS } = await import('/src/level.js'); const TS = 16, O = 10;
      BK.manualSimulation = true; if (BK.setHero) BK.setHero(${JSON.stringify(hero)}); else if (BKT && BKT.setHero) BKT.setHero(${JSON.stringify(hero)});
      BK.load(LEVELS.findIndex(l => l.id === 'towpath')); BK.state = 'play'; BK.god = ${god}; BK.sim(5);
      if (!${foes}) for (const e of BK.enemies()) if (e.t !== 'fogknight') e.alive = false;
      const P = () => BK.P, k = BK.keys, TH = () => BK.towpathHands(), legs = [], DBG = []; let frames = 0, legDmg = {}, lowest = 1;
      const maxHp = P().maxHp, heroIs = (BK.heroId ? BK.heroId() : '');
      const clear = () => { k.left = k.right = k.jump = k.down = k.up = k.atk = k.block = false; };
      class Died extends Error {}
      const tick = n => { for (let i = 0; i < (n || 1); i++) { if (BK.state === 'card') { BK.cardClose && BK.cardClose(); }
        const hp0 = P().hp, d0 = BK.stats().deaths; BK.log = []; BK.sim(1); frames++; const lost = hp0 - P().hp, died = BK.stats().deaths > d0;
        if (lost > 0 || died) { const hits = (BK.log || []).filter(q => q.k === 'dmgP'); const who = hits.length ? (hits[0].who || hits[0].name || 'hazard') : 'other'; legDmg[who] = (legDmg[who] || 0) + Math.max(0, died ? hp0 : lost); }
        lowest = Math.min(lowest, P().hp / maxHp);
        if (died || P().dead) { for (let j = 0; j < 600 && (P().dead || BK.state !== 'play'); j++) { BK.sim(1); frames++; if (BK.state === 'dead' || BK.state === 'gameover') BK.state = 'play'; } throw new Died('died'); } } };
      const feet = () => Math.round(P().y / TS) - 1, col = () => Math.floor(P().x / TS), R = d => d + O - 1;   /* R(design surface row) = the feet row standing on it */
      const walk = (tx, o = {}) => { const goal = tx * TS + 8; let still = 0, lx = P().x, n = 0;
        while (Math.abs(P().x - goal) > (o.tol || 4) && n++ < (o.max || 2500)) { clear(); k[goal > P().x ? 'right' : 'left'] = true;
          if (Math.abs(P().x - lx) < 0.3) still++; else still = 0; lx = P().x;
          if (still > 8 && P().ground && !o.noJump) { k.jump = true; BK.press('jump'); still = 0; tick(14); continue; }
          tick(1); }
        clear(); tick(2); return Math.abs(P().x - goal) <= (o.tol || 4) + 3; };
      const settle = () => { for (let j = 0; j < 150 && !P().ground && !P().climb; j++) { clear(); tick(1); } };
      const waitFor = (cond, max) => { for (let i = 0; i < max && !cond(); i++) { clear(); tick(1); } return cond(); };
      const hop = (from, row, dir = 0) => { for (let a = 0; a < 3; a++) { if (feet() === row && P().ground) return true; walk(from, { tol: 3 }); settle();
          clear(); if (dir) k[dir > 0 ? 'right' : 'left'] = true; k.jump = true; BK.press('jump');
          for (let j = 0; j < 90; j++) { tick(1); if (j > 26) k.jump = false; if (j > 8 && P().vy > 0 && feet() >= row - 1) k.left = k.right = false; if (j > 4 && P().ground) break; }   /* (over the footing, coming down: let go of the direction - a player does not run off the far end of a step) */ clear(); tick(3); settle(); if (feet() === row) return true; }
        DBG.push('hop ' + from + '>' + row + ' failed at ' + col() + ',' + feet()); return feet() === row; };
      const leap = (from, to) => { for (let a = 0; a < 3; a++) { walk(from - 2, { tol: 3 }); settle(); clear(); let n = 0; while (P().x < from * TS + 12 && n++ < 120) { k.right = true; tick(1); }
          k.jump = true; BK.press('jump'); for (let j = 0; j < 80; j++) { k.right = true; k.jump = j < 26; tick(1); if (j > 6 && P().ground) break; } clear(); tick(3); if (col() >= to) return true; }
        DBG.push('leap ' + from + '>' + to + ' failed at ' + col() + ',' + feet()); return false; };
      const face = d => { clear(); k[d > 0 ? 'right' : 'left'] = true; tick(1); clear(); tick(1); P().face = d; };
      const press = (key, d) => { settle(); if (d) face(d); BK.press(key); tick(key === 'atk' ? 20 : 8); clear(); tick(4); };   /* (the Death Knight's two-hander lands late: hold still through it) */
      const lvl = id => TH().lockLevel(id), across = id => TH().bridge(id).across;
      const heading = (id, want) => { const q = TH().lock(id); return want === 'hi' ? q.to <= q.hiY + 1 : q.to > q.hiY + 1; };
      const work = (id, want, d = 1) => { for (let i = 0; i < 4 && lvl(id) !== want && !heading(id, want); i++) { press('atk', d); waitFor(() => heading(id, want), 40); }   /* (a slow blade - the Death Knight's - lands late: wait for it before swinging again, or the second blow sets it back) */
        const ok = waitFor(() => lvl(id) === want, 900); DBG.push(id + ' ' + lvl(id) + ' at ' + col() + ',' + feet()); return ok; };
      const swing = (id, d = 1) => { for (let i = 0; i < 3 && !across(id); i++) { press('atk', d); waitFor(() => TH().bridge(id).k < 0.05 || !across(id), 90); } DBG.push(id + ' ' + across(id)); return across(id); };
      const LEGS = [
        ['the lychgate and the mill-pond lock: onto the punt, the paddle, up', [2, R(34)], () => { walk(46); walk(53, { noJump: true }); settle(); if (!(P().onMover && P().onMover.towpath === 'A')) return false;
            if (!work('A', 'hi')) return false; walk(60); return col() >= 58 && feet() === R(34); }, [60, R(34)]],
        ['the mills: drain the race, climb the stilled wheel, the loft, the yard', [60, R(34)], () => { walk(97, { tol: 3 }); press('atk', 1); waitFor(() => TH().handsState('wheel.mill') === 'still', 900);
            DBG.push('race ' + lvl('race') + ' wheel ' + TH().handsState('wheel.mill')); if (TH().handsState('wheel.mill') !== 'still') return false; hop(99, R(32), 1); DBG.push('A ' + col() + ',' + feet()); hop(102, R(30), 1); DBG.push('B ' + col() + ',' + feet()); hop(105, R(27), 1); DBG.push('C ' + col() + ',' + feet()); walk(124); DBG.push('loft ' + col() + ',' + feet()); walk(130); return col() >= 129 && feet() === R(32); }, [130, R(32)]],
        ['the tail race: swing the bridge across, the hut', [130, R(32)], () => { walk(129, { tol: 3 }); if (!swing('tail')) return false; walk(158); return col() >= 156 && feet() === R(32); }, [158, R(32)]],
        ['the flight, F1: drain it from the bank, ride it up', [158, R(32)], () => { walk(158, { tol: 3 }); if (!work('F1', 'lo')) return false; walk(165, { noJump: true }); settle(); if (!work('F1', 'hi')) return false; walk(167); return feet() === R(27); }, [167, R(27)]],
        ['the flight, F2: the dry chamber, its punt, up', [167, R(27)], () => { walk(170, { noJump: true }); settle(); walk(171, { noJump: true }); settle(); if (!work('F2', 'hi')) return false; walk(175); return feet() === R(22); }, [175, R(22)]],
        ['the flight, F3: in the fog, up to the top', [175, R(22)], () => { walk(181, { noJump: true }); settle(); if (!work('F3', 'hi')) return false; walk(186); return feet() === R(17); }, [186, R(17)]],
        ['the basin: over its bridge, up the warehouse ladder, over the roofs', [186, R(17)], () => { walk(244); walk(245, { tol: 2 }); for (let i = 0; i < 200 && feet() > R(12); i++) { clear(); k.up = true; tick(1); } clear(); walk(250); leap(252, 256); walk(264); walk(266); settle(); return feet() === R(17); }, [266, R(17)]],
        ['the last lock: drain X, down its ledges over the irons, the culvert', [266, R(17)], () => { walk(265, { tol: 3 }); if (!work('X', 'dry')) return false; hop(266, R(21), 1); DBG.push('L1 ' + col() + ',' + feet()); hop(272, R(24), 1); DBG.push('L2 ' + col() + ',' + feet()); walk(283); return col() >= 282 && feet() === R(26); }, [283, R(26)]],
        ['the last lock: Y refilled under you, the last cut swung across', [283, R(26)], () => { walk(287, { noJump: true }); settle(); walk(290, { noJump: true }); if (!work('Y', 'hi')) return false; walk(295); swing('cut'); walk(313); return col() >= 312 && feet() === R(14); }, [313, R(14)]],
      ];
      let lifts = [], retries = 0;
      for (const [name, foot, plan, end] of LEGS) {
        legDmg = {}; let okLeg = false, tries = 0; const f0 = frames;
        while (!okLeg && tries < 3) { tries++; try { okLeg = !!plan(); if (!okLeg) throw new Died('failed'); } catch (e) { if (!(e instanceof Died)) throw e; retries++; BK.tp(foot[0], foot[1]); P().vx = P().vy = 0; clear(); BK.sim(5); } }
        if (!okLeg) { lifts.push(name); BK.tp(end[0], end[1]); BK.sim(5); }
        legs.push({ name, ok: okLeg, tries, at: [col(), feet()], hp: Math.round(P().hp), secs: +((frames - f0) / 60).toFixed(1), dmg: legDmg });
      }
      return { hero: ${JSON.stringify(hero)}, maxHp, legs, dbg: DBG.slice(0, 60), lifts, retries, deaths: BK.stats().deaths, lowest: +lowest.toFixed(2), secs: +(frames / 60).toFixed(0), n: TH().read().n };
    })()`, 1800000);
    console.log('\n== ' + r.hero + ' (hp ' + r.maxHp + ')' + (god ? ' GOD' : '') + (foes ? '' : ' NO FOES'));
    for (const l of r.legs) console.log('  ' + (l.ok ? 'ok  ' : 'LIFT') + ' ' + l.name.padEnd(70) + ' tries ' + l.tries + '  at ' + l.at.join(',') + '  hp ' + l.hp + '  ' + l.secs + ' s  ' + JSON.stringify(l.dmg));
    if (process.argv.includes('--dbg')) console.log('  ' + r.dbg.join(' | '));
    console.log('  deaths ' + r.deaths + ', retries ' + r.retries + ', lifts ' + r.lifts.length + (r.lifts.length ? ' (' + r.lifts.join('; ') + ')' : '') + ', lowest ' + Math.round(r.lowest * 100) + '%, ' + r.secs + ' s');
    summary.push(r.hero + ': ' + (r.lifts.length ? r.lifts.length + ' LIFTED' : 'walked') + ', ' + r.deaths + ' deaths'); if (r.lifts.length) bad++;
  }
} finally { await pg.close(); }
console.log('\n' + summary.join('\n'));
process.exit(bad ? 1 : 0);
