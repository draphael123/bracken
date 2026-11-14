/* GQ6HITCH: cost of one whole-level resolveTiles on Highcrown (flags on = per-cell variants, --off = master's single stream). A measuring tool. */
import { openPage } from './cdp.mjs';
const off = process.argv.includes('--off'); if (off) { delete process.env.BRACKEN_GQ6S2; delete process.env.BRACKEN_GQ6S3; } else { process.env.BRACKEN_GQ6S2 = '1'; process.env.BRACKEN_GQ6S3 = '1'; }
const pg = await openPage({ audio: false, fonts: true, seed: 7 });
try { console.log(off ? 'OFF' : 'ON', JSON.stringify(await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'crown')); BK.state = 'play'; BK.step(5); const T = BK.tileProbe(); const r = []; for (let i = 0; i < 8; i++) { const t = performance.now(); T.resolve(); r.push(+(performance.now() - t).toFixed(0)); } return r; })()`))); } finally { pg.close(); }
