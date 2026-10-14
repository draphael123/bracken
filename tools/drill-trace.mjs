import { openPage } from './cdp.mjs';
import { fightJs } from './boss-run.mjs';
const h = process.argv[2] || 'knight', s = +(process.argv[3] || 1);
const pg = await openPage({ audio: false, fonts: false });
try { const { js } = fightJs({ r: 'minecart', way: 'practiced', h, s, profile: 'human', flasks: 'kit' }, 240);
  const r = await pg.evalp(`(async()=>{ const GD = await import('/src/great-drill.js'); const log = []; let last = '';
    const iv = setInterval(() => { try { const S = BK.drillHands().show(), e = BK.enemies().find(q => q.t === 'greatdrill'); if (!S || !e) return; const k = 'ph' + S.ph + ' hp' + Math.round(e.hp) + ' br' + GD.brokenN(S) + ' shut' + GD.gateShut(S) + ' fl' + GD.gateFloor(S, e) + ' held' + Math.round(S.held) + ' mode ' + e.mode + ' gears ' + JSON.stringify(Object.fromEntries(Object.entries(S.gears||{}).map(([a,q])=>[a,Math.round(q.hp)]))); if (k !== last) { last = k; log.push(Math.round(S.t*10)/10 + ' ' + k); } } catch (err) { log.push('ERR ' + err.message); } }, 50);
    try { const r = await (${js}); return { r, log: log.slice(-400) }; } finally { clearInterval(iv); } })()`, 1200000);
  console.log(JSON.stringify(r.r).slice(0, 300)); for (const l of r.log) console.log(l);
} finally { pg.close(); }
