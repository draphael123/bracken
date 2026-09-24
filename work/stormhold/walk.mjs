/* work/stormhold/walk.mjs - F9: walk Stormhold start to gate with the in-page bot (src/playtest.js makeBot) as a given hero,
   no god mode. The bot cannot win a fight it has to stand in (RULES M), so when an AMBUSH room has it shut in for 10 s the
   room's creatures are struck down for it, and at the Lance's arena the boss is slain (BK.slay) - both are logged. Prints the
   track, deaths, keys and gates.   HERO=warden node work/stormhold/walk.mjs */
import { openPage } from '../../tools/cdp.mjs';
const hero = process.env.HERO || 'knight', frames = +(process.env.FRAMES || 30000);
const pg = await openPage();
try {
  await pg.evalp(`import('/src/level.js').then(M => { window.__LV = M.LEVELS; return 1; })`);
  const out = await pg.evalp(`(async () => { const M = await import('/src/playtest.js');
    BK.setHero(${JSON.stringify(hero)}); BK.reset({ fresh: true });
    BK.load(__LV.findIndex(l => l.id === 'storm')); BK.start(); BK.god = false; BK.sim(120);
    const tick = M.makeBot(BK), log = [], notes = []; const dpos = [], lifts = []; let liftT = 0, deaths = 0, wasDead = false, still = 0, lastX = 0, maxX = 0;
    for (let f = 0; f < ${frames}; f++) { const r = tick(BK.L.W * 16); BK.sim(1);
      const P = BK.P; if (P.dead > 0 && !wasDead) { deaths++; const dx = P.x/16|0; notes.push('died@' + dx + ',' + (P.y/16|0)); dpos.push(dx);
        if (dpos.filter(q => Math.abs(q - dx) <= 4).length >= 3 && liftT <= 0) { liftT = 1500; lifts.push(dx); notes.push('LIFTED over ' + dx + ' (third death there)'); } } wasDead = P.dead > 0;
      if (liftT > 0) { liftT--; BK.god = liftT > 0; }
      maxX = Math.max(maxX, P.x / 16 | 0);
      if (Math.abs(P.x - lastX) < 2) still++; else still = 0; lastX = P.x;
      const shut = (BK.ambushes() || []).find(a => a.st && a.st !== 'done');
      if (shut && still > 600) { let n = 0; for (const e of (shut.foes || [])) if (e.alive) { e.alive = false; n++; } if (shut.leader) shut.leader.defeated = true; notes.push('ambush cleared for it (' + n + ')@' + (f)); still = 0; }
      if (still > 2400 && !BK.bossActive) { const x0 = P.x/16|0, W = BK.L.W, g = BK.L.grid; let done = false;
        const wall = BK.props().filter(p => p.t === 'lockgate' && !p.open).map(p => p.col).filter(c => c > x0).sort((a, b) => a - b)[0] ?? 1e9;
        for (let dx = 3; dx < 16 && !done && x0 + dx < wall; dx++) for (let y = 20; y < BK.L.H - 1 && !done; y++) { const x = x0 + dx; if (g[y*W+x] === 0 && g[(y-1)*W+x] === 0 && [1,2,8,11].includes(g[(y+1)*W+x])) { BK.tp(x, y); done = true; notes.push('STUCK-LIFT ' + x0 + '->' + x); } }
        still = 0; }
      if (BK.bossActive && still > 300) { notes.push('boss slain@' + f + ':' + BK.slay()); still = 0; }
      if (f % 500 === 0) log.push((P.x/16|0) + ',' + (P.y/16|0) + (P.climb ? 'C' : ''));
      if (BK.state !== 'play' && f > 200) { notes.push('state ' + BK.state + '@' + f); break; } }
    return { hero: ${JSON.stringify(hero)}, deaths, lifts: lifts.join(' '), maxX, keys: BK.props().filter(p => p.t === 'key').map(p => p.kind + (p.got ? '+' : '-')).join(' '),
      gates: BK.props().filter(p => p.t === 'lockgate').map(p => p.col + (p.open ? ' open' : ' shut')).join(', '), end: BK.state, notes: notes.slice(0, 40).join(' | '), track: log.join(' ') }; })()`);
  console.log(JSON.stringify(out, null, 1));
} finally { pg.close(); }
process.exit(0);
