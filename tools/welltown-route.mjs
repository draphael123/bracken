// tools/welltown-route.mjs - THE WELL TOWN walked end to end with real keys (claude/welltown). Not in the suite: a route pilot.
// A scripted hand, not the play bot: the bot cannot fill a skin, pour it, or strike a windlass, so this walks each leg with the keys a player would
// press - hold a direction, jump what blocks, E at a well, E facing mud or fire, a blow on the windlass, UP on the rungs - and cuts down what stands
// in its way with plain swings. It says where each leg ended (and the deaths: a death stands you up at the last shrine, and the walk goes on),
// and WHAT HURT IT: every hit point lost is booked to the foe that dealt it, or to THE SUN (an unowned blow while the sun meter is full) or
// FIRE/OTHER. The fix lane's gate (claude/welltown-fix, the review's P1): with god=0 the hand (it never drinks, never blocks) reaches the
// courtyard and the foes deal at least half of what it takes - the town's fights carry it, not the sun.
//   node tools/welltown-route.mjs [heroes=knight,pyro] [god=0|1]
import { openPage } from './cdp.mjs';
const heroes = (process.argv[2] || 'knight,pyro').split(','), god = process.argv[3] === '1';
const pg = await openPage({ audio: false, fonts: false });
let bad = 0;
try {
  for (const hero of heroes) {
    const r = await pg.evalp(`(async()=>{
      const { LEVELS } = await import('/src/level.js'); const TS = 16;
      BK.manualSimulation = true; BK.setHero(${JSON.stringify(hero)}); BK.reset({ fresh: true });
      BK.load(LEVELS.findIndex(l => l.id === 'welltown')); BK.start ? BK.start() : (BK.state = 'play'); BK.god = ${god};
      const P = () => BK.P, k = BK.keys, log = [], W = () => BK.welltown(); let frames = 0; const lifted = [];
      const clear = () => { k.left = k.right = k.jump = k.down = k.up = k.atk = k.block = false; };
      const hurt = {}; BK.log = [];
      const tick = n => { for (let i = 0; i < (n || 1); i++) { const h0 = P().hp, sunUp = P().sun && P().sun.v >= 1, dead0 = P().dead; BK.log.length = 0; BK.sim(1); frames++;
        const d = h0 - P().hp; if (d > 0 && !dead0) { const e = BK.log.find(q => q.k === 'dmgP' && q.who); const key = e ? e.who : sunUp ? 'SUN' : 'FIRE/OTHER'; hurt[key] = (hurt[key] || 0) + d; } } };
      const at = () => [Math.floor(P().x / TS), Math.floor((P().y - 1) / TS)];
      const deaths = () => BK.stats().deaths, sips = () => (P().skin && P().skin.sips) || 0;
      const fight = () => { const e = BK.enemies().filter(q => q.alive && !q.harmless && Math.abs(q.x - P().x) < 56 && Math.abs(q.y - P().y) < 14).sort((a, b) => Math.abs(a.x - P().x) - Math.abs(b.x - P().x))[0];
        if (!e) return false; clear();
        for (let j = 0; j < 30 && Math.abs(e.x - P().x) > 14 && e.alive; j++) { clear(); const d = Math.sign(e.x - P().x); k[d > 0 ? 'right' : 'left'] = true; tick(1); }
        clear(); P().face = Math.sign(e.x - P().x) || P().face; BK.press('atk'); tick(8); clear(); tick(4);
        e.pilotSwings = (e.pilotSwings || 0) + 1; if (e.pilotSwings > 40) { e.alive = false; lifted.push(e.t + '@' + Math.round(e.x / TS)); }
        return true; };
      /* out of an alley of the roost: up its ladder, and onto the next roof */
      const ALLEYS = [[337, 18], [353, 17], [387, 19]];
      const outOfAlley = () => { const a = ALLEYS.find(([lx]) => Math.abs(P().x - (lx * TS + 8)) < 3 * TS && P().y > 24 * TS); if (!a) return false; const [lx, roof] = a;
        for (let j = 0; j < 500 && P().y > roof * TS - 2; j++) { clear(); if (Math.abs(P().x - (lx * TS + 8)) > 3) k[lx * TS + 8 > P().x ? 'right' : 'left'] = true; else k.up = true; tick(1); }
        clear(); k.right = true; k.jump = true; BK.press('jump'); tick(16); clear(); tick(8); return true; };
      const walk = (tx, o = {}) => { const goal = tx * TS + 8; let still = 0, lx = P().x, n = 0;
        while (Math.abs(P().x - goal) > (o.tol || 5) && n++ < (o.max || 2500)) {
          if (BK.state !== 'play') return false;
          if (!o.noFight && fight()) continue;
          if (outOfAlley()) continue;
          clear(); const d = goal > P().x ? 1 : -1; k[d > 0 ? 'right' : 'left'] = true;
          if (Math.abs(P().x - lx) < 0.3) still++; else still = 0; lx = P().x;
          if (still > 6 && P().ground) { k.jump = true; BK.press('jump'); still = 0; tick(16); continue; }
          tick(1); }
        clear(); tick(2); return Math.abs(P().x - goal) <= (o.tol || 5) + 2; };
      const settle = () => { for (let j = 0; j < 90 && !P().ground; j++) { clear(); tick(1); } };   /* a hand presses E and swings with its feet on the floor */
      const strike = (d, until) => { for (let i = 0; i < 4; i++) { settle(); for (let j = 0; j < 120 && P().st < 30; j++) { clear(); tick(1); } clear(); P().face = d; BK.press('atk'); tick(10); clear(); tick(8); if (!until || until()) return; } };   /* (its wind back first: a tired arm does not swing) */
      const interact = (d, done) => { for (let i = 0; i < 5; i++) { while (fight()) {} clear(); settle(); if (d) { P().face = d; k[d > 0 ? 'right' : 'left'] = true; tick(1); k.left = k.right = false; P().face = d; } BK.press('talk'); tick(3); clear(); tick(4); if (!done || done()) return; } };   /* (a blow that lands turns you round: the hand faces the wall again and presses again) */
      const wait = n => { clear(); tick(n); };
      const leg = (name, ok) => { log.push({ name, ok: !!ok, at: at(), deaths: deaths(), hp: Math.round(P().hp), sips: sips(), s: +(frames / 60).toFixed(1), sun: Math.round(hurt.SUN || 0), foes: Math.round(Object.entries(hurt).filter(([k]) => k !== 'SUN' && k !== 'FIRE/OTHER').reduce((q, [, v]) => q + v, 0)) }); return ok; };
      const wall = x => W().walls.find(m => m.x0 === x), fire = x => W().fires.find(f => f.x0 === x);
      // ---- 1. THE CARAVAN GATE ----
      walk(11, { tol: 3 }); interact(0, () => sips() >= 3); leg('the skin filled at the first well', sips() === 3);
      leg('up the dunes, under the gatehouse', walk(40));
      leg('over the mud house roof, down to the street', walk(56));
      leg('past the gate\\'s two knives', walk(66));
      // ---- 2. THE LOWER MARKET, THE COVERED BAZAAR ----
      walk(77, { tol: 3 }); interact(0, () => sips() >= 3); leg('the market well (and past the stall thief)', sips() === 3);
      leg('the market shrine (checkpoint one)', walk(84));
      walk(119, { tol: 2 }); interact(1, () => !fire(121).lit); leg('THE BAZAAR: the stall fire poured out', fire(121) && !fire(121).lit);
      leg('under the bazaar roof, out the far end', walk(133));
      // ---- 3. THE WELL SQUARE: the great well, the windlass ----
      leg('up the market stair into the square', walk(170));
      walk(179, { tol: 3 }); interact(0, () => sips() === 3); leg('the skin filled at THE GREAT WELL', sips() === 3);
      const bucket = BK.movers().find(m => m.windlass); for (let i = 0; i < 30 && fight(); i++) {} walk(177, { tol: 3, noFight: true });   /* (the well head's thief cut down first: a fight walks you off the bucket; stand square on the bucket, not on the well's lip) */ wait(10); strike(-1, () => bucket.dir || bucket.y > bucket.y0 + 2); for (let j = 0; j < 400 && P().y < 38 * TS; j++) tick(1); wait(20);
      leg('THE WINDLASS struck: the bucket down into the cisterns', P().y > 38 * TS);
      walk(181, { tol: 3 }); interact(0, () => sips() >= 3); leg('the cistern\\'s own well, at the bucket\\'s foot (held: its scorpions, and the men down the well after you)', sips() === 3);
      leg('checkpoint two, past the well', walk(194));
      // ---- 4. THE CISTERNS ----
      leg('through the pillared hall', walk(238));
      for (let i = 0; i < 20 && BK.enemies().some(e => e.elite && e.alive); i++) { walk(246); for (let j = 0; j < 120; j++) { if (!fight()) wait(1); } }
      leg('THE OLD STINGER down: his gate opens', !BK.enemies().some(e => e.elite && e.alive));
      walk(255, { tol: 3, noFight: true }); for (let j = 0; j < 600 && P().y > 29 * TS + 2; j++) { clear(); k.up = true; tick(1); } clear(); k.right = true; k.jump = true; BK.press('jump'); tick(14); clear(); tick(8);
      leg('up the rungs into the mud quarter', P().y < 31 * TS && P().x > 255 * TS);
      // ---- 5. THE MUD QUARTER ----
      walk(260, { tol: 2 }); interact(1, () => wall(262).open); leg('MUD WALL ONE poured away', wall(262) && wall(262).open);
      walk(283, { tol: 3 }); interact(0, () => sips() >= 3); leg('the mud quarter\\'s well (its thieves)', sips() >= 2);
      walk(294, { tol: 2 }); interact(1, () => wall(296).open); leg('MUD WALL TWO poured away', wall(296) && wall(296).open);
      leg('down the lane to the dovecote', walk(318));
      walk(322, { tol: 2, noFight: true }); for (let j = 0; j < 800 && P().y > 18 * TS; j++) { clear(); k.up = true; tick(1); } for (let j = 0; j < 90 && P().x < 326 * TS; j++) { clear(); k.right = true; tick(1); } clear(); tick(10);   /* up the rungs to the sill, and out through the window (a walk, not a jump: the window is three rows) */
      leg('up THE DOVECOTE, out of its window onto the roofs (checkpoint three)', P().x > 325 * TS && P().y < 19 * TS);
      walk(364, { tol: 3 }); if (sips() < 3) interact(0); leg('roof C: the water jar', true);
      // ---- 6. THE BANDITS' ROOST ----
      leg('across the roofs to the barricade', walk(370));
      walk(374, { tol: 2 }); interact(1, () => !fire(376).lit); leg('THE BURNING BARRICADE poured out', fire(376) && !fire(376).lit);
      leg('on along the roofs, down to the Kasbah street', walk(430));
      // ---- 7. THE KASBAH: the exam ----
      const deep = () => W().wells.find(w => w.deep);
      for (let i = 0; i < 6 && !(deep().up || deep().wind > 0); i++) { walk(447, { tol: 3 }); strike(-1, () => deep().up || deep().wind > 0); }
      for (let j = 0; j < 400 && !deep().up; j++) { if (!fight()) wait(1); }
      walk(448, { tol: 3 }); interact(0, () => sips() >= 3); leg('THE DEEP WELL wound up and filled (its thieves, its bowman)', sips() >= 2);
      walk(456, { tol: 2 }); interact(1, () => wall(458).open); leg('THE KASBAH\\'S DOOR poured away', wall(458) && wall(458).open);
      if (sips() < 1) { for (let i = 0; i < 6 && !(deep().up || deep().wind > 0); i++) { walk(447, { tol: 3 }); strike(-1, () => deep().up || deep().wind > 0); } for (let j = 0; j < 400 && !deep().up; j++) wait(1); walk(448, { tol: 3 }); interact(0); }
      walk(462, { tol: 2 }); interact(1, () => !fire(464).lit); leg('the gateway fire poured out', fire(464) && !fire(464).lit);
      leg('the courtyard door (checkpoint four)', walk(470));
      walk(482); wait(60); leg('into the courtyard: THE BANDIT KING wakes', BK.bossActive && BK.boss && BK.boss.t === 'banditking');
      BK.log = null;
      return { hero: ${JSON.stringify(hero)}, lifted, log, hurt, state: BK.state, deaths: deaths(), s: +(frames / 60).toFixed(1) };
    })()`, 1200000);
    console.log('== ' + r.hero + (god ? ' (god)' : '') + ': ' + r.state + ', ' + r.deaths + ' deaths, ' + r.s + ' s' + (r.lifted.length ? '; lifted out (the hand cannot parry): ' + r.lifted.join(' ') : ''));
    { const tot = Object.values(r.hurt).reduce((a, b) => a + b, 0), env = (r.hurt.SUN || 0) + (r.hurt['FIRE/OTHER'] || 0), foes = tot - env;
      console.log('  hurt by: ' + Object.entries(r.hurt).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ' ' + Math.round(v)).join(', ') + '  (foes ' + Math.round(foes) + ' of ' + Math.round(tot) + ' = ' + (tot ? Math.round(foes / tot * 100) : 0) + '%)');
      if (!god && tot && foes / tot < 0.5) { console.log('  FAIL the foes dealt under half of it: the sun is still the level'); bad++; } }
    for (const l of r.log) { console.log('  ' + (l.ok ? 'ok  ' : 'MISS') + ' ' + l.name.padEnd(56) + ' at ' + l.at.join(',') + '  hp ' + l.hp + '  sips ' + l.sips + '  deaths ' + l.deaths + '  ' + l.s + 's  sun ' + l.sun + ' foes ' + l.foes); if (!l.ok) bad++; }
  }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 5).join(' | '));
} finally { pg.close(); }
process.exitCode = bad ? 1 : 0;
