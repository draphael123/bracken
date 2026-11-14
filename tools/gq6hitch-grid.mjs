/* GQ6HITCH scratch: grid patch at the tower's west rim: at level load, in the hall, on the roof deck (before the first tell). A measuring tool. */
import { openPage } from './cdp.mjs';
process.env.BRACKEN_GQ6S2 = '1'; process.env.BRACKEN_GQ6S3 = '1';
const pg = await openPage({ audio: false, fonts: true, seed: 7 });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const hold = () => { BK.P.hp = BK.P.maxHp; };
    BK.manualSimulation = true; BK.SET.speed = 1; BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'crown')); BK.state = 'play'; BK.god = false; BK.step(5);
    const T = BK.tileProbe(); const patch = () => { const o = []; for (let y = 14; y <= 24; y++) { let s = ''; for (let x = 860; x <= 880; x++) s += T.grid[y * T.LW + x].toString(36); o.push(y + ' ' + s); } return o; };
    const out = { load: patch() }; const A = BK.L.arena; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1);
    for (let k = 0; k < 300; k++) { hold(); BK.step(1); } out.hall = patch(); const Tw = (BK.L.arenaRoof && BK.L.arenaRoof.tower); out.out = Tw.OUT; out.deck = Tw.DECK; out.hatch = Tw.HATCH;
    const q = BK.boss; q.hp = 2; (BK.hurt || (BK.env && BK.env().hurt))(q, 50, BK.P.x); for (let k = 0; k < 140; k++) { hold(); BK.step(1); }
    const H = BK.gqHands(); H.skipRoof(); for (let k = 0; k < 600; k++) { hold(); BK.step(1); if (BK.boss.stage === 'roof' && (BK.boss.mode === 'roofStand' || BK.boss.mode === 'rec') && k > 200) break; }
    out.roof = patch(); out.warmed = H.gq6s2().warmed(); return out; })()`, 600000);
  console.log(JSON.stringify(r, null, 0).replace(/\],"/g, '],\n"'));
} finally { pg.close(); }
