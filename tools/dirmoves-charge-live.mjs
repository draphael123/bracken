// tools/dirmoves-charge-live.mjs - THE CHARGED GRAMMAR ON REAL FOES (claude/dmcharge), one headless page, DM.on forced in the page.
// For a few heroes: hold X + UP past the step -> a brute is LAUNCHED (1.6 s), a wing foe GROUNDED; hold X + DOWN -> a beast is TRIPPED (<= 0.7 s). Findings only.
//   node tools/dirmoves-charge-live.mjs [knight,warden,...]
import { openAudit } from './audit-lib.mjs';
const heroes = (process.argv[2] || 'knight,warden').split(',');
async function PROBE(o) {
  const BK = window.BK, P = BK.P, A = window.__AUD, lvm = await import('/src/level.js'), DMm = await import('/src/dirmoves.js'), TS = 16;
  const wood = lvm.LEVELS.findIndex(l => l.id === 'wood'), h = o.hero; BK.setHero(h); A.settings(); BK.PROG.talents = BK.PROG.talents || {}; BK.PROG.talents[h] = {};
  BK.load(wood); BK.state = 'play'; BK.god = true; BK.sim(3); for (const q of BK.enemies()) q.alive = false; A.clearKeys(); BK.sim(10);
  DMm.DM.on = true; const out = { hero: h };
  const home = { x: P.x, y: P.y };
  const probe = (t, dir, dx) => { for (const q of BK.enemies()) q.alive = false; A.clearKeys(); BK.sim(2); P.x = home.x; P.y = home.y; P.vx = 0; P.vy = 0; P.face = 1; P.stam = 999; P.hp = P.maxHp; P.dead = false; BK.sim(8);
    BK.spawnEnt({ t, x: Math.round(P.x / TS) + dx, y: Math.round(P.y / TS) - 1 }); const e = BK.enemies().at(-1); if (!e) return { error: 'no spawn' }; e.hp = e.hp0 = 5000; e.cd = 99;
    const place = () => { e.x = P.x + P.face * 14; e.y = P.y; e.vx = 0; };
    place(); BK.keys.atk = true; BK.press('atk'); let fired = false, f0 = 0; const log = { launched: 0, broken: 0, hurt: false, vyMax: 0 }; let hp0 = 0;
    for (let f = 0; f < 140; f++) { if (f === 20) BK[ 'keys' ][dir] = true; if (f === 70) { BK.keys[dir] = false; BK.keys.atk = false; }
      if (!fired) place(); BK.sim(1);
      if (!fired && P.dmCharged) { fired = true; f0 = f; hp0 = e.hp; e.hp = e.hp0; hp0 = e.hp; }
      if (fired) { if ((e.launchedT || 0) > BK.time) log.launched = Math.max(log.launched, +(e.launchedT - BK.time).toFixed(2)); log.broken = Math.max(log.broken, +(e.broken || 0).toFixed(2)); if (e.hp < hp0) log.hurt = true; log.vyMax = Math.max(log.vyMax, e.vy || 0); } }
    A.clearKeys(); return { t, dir, fired, atFrame: f0, ...log }; };
  out.rows = [probe('brute', 'up', 1), probe('hound', 'up', 1), probe('brute', 'down', 1), probe('shield', 'down', 1), probe('sprig', 'down', 1)];
  DMm.DM.on = false; A.clearKeys(); BK.god = false; return out;
}
const pg = await openAudit();
try { for (const h of heroes) { const r = await pg.evalp('(' + PROBE.toString() + ')(' + JSON.stringify({ hero: h }) + ')'); console.log(h, JSON.stringify(r.rows || r)); if (pg.errors.length) console.log('  page errors: ' + pg.errors.splice(0).slice(0, 3).join(' | ').slice(0, 300)); } }
finally { pg.close(); }
