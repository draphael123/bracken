// PAGE TOOL: launches headless Chrome
// tools/ranger-windlass-probe.mjs (claude/smallfix12) - RANGER vs WINDLASS: with arrows in the quiver, plain X beside a strikable gadget (the Fog Canal's stop-planks windlass)
// knifes it (the prop is struck: its flash fires); the same X a few tiles back looses an arrow. A probe, not in the suite.   usage: node tools/ranger-windlass-probe.mjs
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const TS = 16, out = {};
    BK.manualSimulation = true; BK.setHero('ranger'); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === 'canal'); BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(4);
    const C = BK.canal(); const w = C.props.find(p => p.t === 'stopwinch'); if (!w) return { err: 'no windlass' };
    out.prop = [w.x, w.y]; const trial = (dx) => { BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(4); const C2 = BK.canal(), w2 = C2.props.find(p => p.t === 'stopwinch'); BK.tp((w2.x - dx) / TS, w2.y / TS - 1); for (let i = 0; i < 30; i++) BK.sim(1); BK.step(1);
      const P = BK.P; P.face = 1; const rg0 = BK.rg(); const q0 = rg0 && rg0.hud ? rg0.hud.q : null; w2.flash = 0; BK.press('atk'); let flash = 0, loosed = 0; for (let i = 0; i < 24; i++) { BK.sim(1); if (i % 2 === 0) BK.step(1); flash = Math.max(flash, w2.flash || 0); } const rg1 = BK.rg(); return { dx, x: Math.round(P.x), wx: w2.x, flash: +flash.toFixed(2), arrows: rg1 ? rg1.arrows.length : null, q0, q1: rg1 && rg1.hud ? rg1.hud.q : null, hitSet: !!P.hitSet.has(w2) }; };
    out.near = trial(14); out.far = trial(70); return out; })()`, 600000);
  console.log(JSON.stringify(r, null, 1));
} finally { pg.close(); }
