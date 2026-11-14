// PAGE TOOL: launches headless Chrome
// tools/gorm-reenter.mjs - KING GORM's phase across visits (claude/smallfix9). Two rules, one page:
//   a phase-1 bar that empties is no death: he flees, the level is NOT cleared (Burning Village stays shut)
//   a fresh visit to Kingswood (BK.load) resets him to phase 1 (stage 'court'); only a respawn keeps the flee / glade stage
//     node tools/gorm-reenter.mjs
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); const out = {}, KI = LEVELS.findIndex(l => l.id === 'kings');
    BK.manualSimulation = true; BKT.setHeroLevel('knight', 8); BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(KI); BK.state = 'play';
    const step = n => { for (let i = 0; i < n; i++) { if (BK.state === 'card') BK.cardClose(); BK.sim(1); } };
    let k = BK.enemies().find(e => e.t === 'king'); out.start = { stage: k.stage, persist: BK.gorm() ? BK.gorm().persist : 'off' };
    const P = BK.P; BK.tp(426, 13); for (let i = 0; i < 400; i++) { P.hp = P.maxHp; P.dead = 0; step(1); } k = BK.enemies().find(e => e.t === 'king'); out.woke = { active: BK.bossActive, mode: k.mode };
    k.hp = 1; BK.env().hurt(k, 9999, BK.P.x); step(2);
    k = BK.enemies().find(e => e.t === 'king'); const p1 = BKT.PROG.kings || {};
    out.p1 = { alive: !!k.alive, stage: k.stage, cleared: !!p1.cleared, persist: BK.gorm() ? BK.gorm().persist : null };
    BK.respawn && BK.respawn(); step(2);
    out.afterRespawn = { persist: BK.gorm() ? BK.gorm().persist : null };
    BK.load(KI); BK.state = 'play'; step(2); k = BK.enemies().find(e => e.t === 'king');
    out.reenter = { stage: k && k.stage, alive: !!(k && k.alive), hp: k && k.hp, maxHp: k && k.maxHp, persist: BK.gorm() ? BK.gorm().persist : null };
    return out; })()`);
  console.log(JSON.stringify(r));
  assert(r.start.stage === 'court', 'he starts in phase 1 ' + JSON.stringify(r.start));
  assert(r.p1.alive && r.p1.stage === 'flee' && !r.p1.cleared, 'a phase-1 death is no death: he flees, the level is not cleared ' + JSON.stringify(r.p1));
  assert(r.reenter.stage === 'court' && !r.reenter.persist && r.reenter.hp === r.reenter.maxHp, 're-entering Kingswood resets him to phase 1 ' + JSON.stringify(r.reenter));
  assert.deepEqual(pg.errors, []);
  console.log('gorm-reenter: green');
} finally { pg.close(); }
