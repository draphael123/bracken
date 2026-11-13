/* tools/gq6fix-bells.mjs - GQ6FIX item 5: every bell a player can strike in Highcrown, struck at player speed (a real BK.press('atk') swing / shot) by each hero.
   node tools/gq6fix-bells.mjs [hall|props|all] [--heroes=knight,warden,pyro,ranger]   (BRACKEN_GQ6FIX=0 for the old build)
   hall  = the Queen's hall bell (src/gqueen-hands.js mechStep -> ringIt; GQ5Q1: the hoists rise) in the live fight
   props = every level bell prop (ward lure, crag, vestibule, ...) by its own rule (src/main.js)                                                   */
import { openPage } from './cdp.mjs';
const a = process.argv.slice(2), mode = a.find(x => !x.startsWith('--')) || 'all', heroes = (a.find(x => x.startsWith('--heroes=')) || '--heroes=knight,warden,pyro,ranger').slice(9).split(',');
const pg = await openPage({ audio: false, fonts: false });
try {
  const res = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); const out = []; const heroes = ${JSON.stringify(heroes)}; const mode = ${JSON.stringify(mode)};
    const hold = () => { BK.P.hp = BK.P.maxHp; }; const run = k => { for (let i = 0; i < k; i++) { hold(); BK.step(1); } };
    const fresh = hero => { BK.manualSimulation = true; BK.SET.speed = 1; BK.setHero(hero); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'crown')); BK.state = 'play'; BK.god = false; BK.step(5); };
    const bellsAll = () => BK.props().filter(p => p.t === 'bell').map(p => ({ x: p.x, y: p.y, section: p.section, lure: !!p.lure, gate: p.gate, hp: p.hp, col: Math.round(p.x / 16), row: Math.round(p.y / 16) }));
    fresh('knight'); out.push('BELL PROPS ' + JSON.stringify(bellsAll())); out.push('ALARMS ' + JSON.stringify((BK.L.alarms || []).map(x => ({ id: x.id, gates: x.gates, opens: x.opens, wake: x.wake })))); out.push('ARENA ' + JSON.stringify({ x0: BK.L.arena.x0, x1: BK.L.arena.x1, floor: BK.L.arena.floor, trigger: BK.L.arena.trigger }));
    if (mode === 'hall' || mode === 'all') for (const h of heroes) { fresh(h); const A = BK.L.arena; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); run(300);
      const q = BK.boss; const H = BK.gqHands(); const G5 = H.q5 && H.q5(); for (const k of ['crownCd','portalCd','geodeCd','slamT','sweepT','courtT','hLeapT','decreeT','throwT2','ringT']) q[k] = 99;
      const bell = BK.props().find(p => p.t === 'winch' && p.bell && p.bossGate); const P = BK.P; if (!bell) { out.push(h + ' NO HALL BELL'); continue; }
      const r = { hero: h, bell: [bell.x, bell.y], q5: !!G5 };
      for (const [label, dx] of [['near', -14], ['far', -64]]) { // melee/shot from dx west of the bell, facing east, feet on the same floor
        const st0 = G5 && G5.state ? G5.state().phase : null; const cd0 = H.mech ? H.mech().cd : null; const sw0 = bell.swing || 0;
        P.x = bell.x + dx; P.y = bell.y; P.vx = 0; P.vy = 0; P.face = 1; P.ground = true; run(2); const act = i => { if (h === 'ranger') { BK.keys.atk = i < 40; } else if (i === 0) BK.press('atk'); }; let seen = { swing: 0, phase: st0, cd: cd0, rung: !!bell.rung, ringAt: 0 };
        for (let i = 0; i < 90; i++) { act(i); hold(); BK.step(1); if ((bell.swing || 0) > seen.swing) seen.swing = bell.swing; const s = G5 && G5.state ? G5.state() : null; if (s && s.phase !== st0 && seen.phase === st0) { seen.phase = s.phase; seen.ringAt = i; } if (H.mech && H.mech().cd !== cd0) { seen.cd = H.mech().cd; if (!seen.cdAt) seen.cdAt = i; } if (bell.rung) seen.rung = true; }
        BK.keys.atk = false; r[label] = seen; if (seen.phase !== st0 || seen.cdAt) { /* rung: wait out the cooldown so the next probe is fresh */ for (let i = 0; i < 60 * 17; i++) { hold(); BK.step(1); } } }
      out.push('HALL ' + JSON.stringify(r)); }
    return out.join('|'); })()`, 900000);
  console.log(res.split('|').join('\n')); console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
