// tools/minecart-route.mjs - THE DEEP RAILS RIDDEN END TO END WITH REAL KEYS (claude/minecart). Not in the suite: a route pilot. THE CART PILOT
// (tools/cart-pilot.mjs) rides the level from the start to the drill's door: it boosts the long gaps, brakes for crushers, gates and rock, ducks the beams,
// throws the points the plan wants (E), changes lines. A fresh save's hero (level 1, no skills).
//   PORT=8707 node tools/minecart-route.mjs [heroes=knight,warden,pyro] [god=0|1] [foes=1|0] [--dbg]   (god=1 foes=0: base inputs only - can this hero ride it)
// Each hero rides from each STATION in turn (a death or a lift puts the hand at the next station), and it prints per leg where it ended, the health left,
// the damage by source, the falls, crashes and crushes; a hero who does not reach the door on a leg fails the tool.
//   --probe  the boost-gap measure: at each of the level's boost gaps, a CRUISING jump at the lip must fall in, and a BOOSTED one must clear it.
import { openPage } from './cdp.mjs';
import { CART_PILOT, ROUTE_PLAN } from './cart-pilot.mjs';
const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
const heroes = (args[0] || 'knight,warden,pyro').split(','), god = args[1] === '1', foes = args[2] !== '0', dbg = process.argv.includes('--dbg'), probe = process.argv.includes('--probe');
const pg = await openPage({ audio: false, fonts: false });
let bad = 0; const summary = [];
try {
  if (probe) {
    const r = await pg.evalp(`(async()=>{
      const { LEVELS } = await import('/src/level.js'); const TS = 16;
      BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true });
      BK.load(LEVELS.findIndex(l => l.id === 'minecart')); BK.state = 'play'; BK.god = true; BK.sim(5);
      for (const e of BK.enemies()) if (!e.boss) { e.alive = false; e.mcWait = false; }
      const P = () => BK.P, k = BK.keys, out = [];
      const clear = () => { k.left = k.right = k.jump = k.down = k.up = k.atk = false; };
      for (const p of BK.L.mcPoints) if (p.req) BK.minecart().setPoints(p.id, 'set');
      for (const g of BK.L.mcBoost) for (const boost of [false, true]) {
        BK.tp(g.x0 - 14, g.row - 1); P().vx = 0; P().vy = 0; BK.minecart().cart(P()).v = boost ? 230 : 150; clear(); BK.sim(3);
        let n = 0; while (P().x < g.x0 * TS - 4 && n++ < 300) { clear(); k.right = boost; BK.sim(1); }
        BK.press('jump'); let landed = null; for (let j = 0; j < 90; j++) { k.jump = true; k.right = boost; BK.sim(1); if (j > 5 && P().ground) { landed = Math.floor(P().x / TS); break; } if (P().y > (g.row + 5) * TS) break; }
        clear(); out.push({ gap: g.x0, w: g.x1 - g.x0 + 1, boost, cleared: landed !== null && landed > g.x1, landed });
        BK.sim(30); }
      return out; })()`, 600000);
    for (const x of r) { const ok = x.boost ? x.cleared : !x.cleared; if (!ok) bad++; console.log((ok ? 'ok  ' : 'BAD ') + 'gap ' + x.gap + ' (' + x.w + ' wide) ' + (x.boost ? 'boosted' : 'cruising') + ': ' + (x.cleared ? 'cleared, landed ' + x.landed : 'fell in')); }
    console.log(bad ? 'THE BOOST GAPS ARE WRONG' : 'every boost gap: a cruising jump falls in, a boosted one clears');
  } else for (const hero of heroes) {
    await pg.reload();
    const r = await pg.evalp(`(async()=>{
      const { LEVELS } = await import('/src/level.js'); const TS = 16;
      ${CART_PILOT}
      BK.manualSimulation = true; BK.setHero(${JSON.stringify(hero)}); BK.reset({ fresh: true });
      BK.load(LEVELS.findIndex(l => l.id === 'minecart')); BK.state = 'play'; BK.god = ${god}; BK.sim(5);
      if (!${foes}) for (const e of BK.enemies()) if (!e.boss) { e.alive = false; e.mcWait = false; }
      const P = () => BK.P, k = BK.keys, pilot = makeCartPilot(BK, ${JSON.stringify({ ...ROUTE_PLAN, fight: true })});
      const stations = [[4, 29], ...BK.L.ents.filter(e => e.t === 'check').map(e => [e.x, e.y])], door = Math.floor(BK.L.arena.trigger / TS) - 2;
      const legs = []; let frames = 0, cards = 0, lifts = 0; const maxHp = P().maxHp, trace = [];
      for (let i = 0; i < stations.length; i++) {
        const [sx, sy] = stations[i], goal = i + 1 < stations.length ? stations[i + 1][0] : door, f0 = frames, mc0 = JSON.parse(JSON.stringify(BK.minecart().read().n)), d0 = BK.stats().deaths; let dmg = {}, ok = false;
        if (i > 0) { BK.tp(sx, sy); P().vx = 0; P().vy = 0; P().hp = P().maxHp; BK.sim(3); }
        for (let f = 0; f < 60 * 70; f++) {
          if (BK.state === 'card') { BK.cardClose(); cards++; }
          pilot.step(); const hp0 = P().hp; BK.log = []; BK.sim(1); frames++;
          if (P().hp < hp0) { const h = (BK.log || []).filter(q => q.k === 'dmgP')[0]; const who = h ? (h.name || (h.by && (h.by.cnSkin || h.by.t)) || 'hazard') : 'other'; dmg[who] = (dmg[who] || 0) + Math.round(hp0 - P().hp); }
          if (${dbg ? 'true' : 'false'} && f % 30 === 0) trace.push(i + ':' + Math.floor(P().x / TS) + ',' + Math.round(P().y / TS) + ' ' + pilot.why());
          if (P().dead || BK.stats().deaths > d0) break;
          if (P().x >= goal * TS) { ok = true; break; } }
        if (BK.state !== 'play') BK.state = 'play';
        const n = BK.minecart().read().n, dn = {}; for (const q in n) if (n[q] !== mc0[q]) dn[q] = n[q] - (mc0[q] || 0);
        legs.push({ from: sx, to: goal, ok, at: Math.floor(P().x / TS) + ',' + Math.round(P().y / TS), hp: Math.round(P().hp), secs: +((frames - f0) / 60).toFixed(1), dmg, n: dn, died: BK.stats().deaths > d0 });
        if (!ok) lifts++;
        if (P().dead) { for (let j = 0; j < 400 && (P().dead || BK.state !== 'play'); j++) { BK.sim(1); if (BK.state === 'dead' || BK.state === 'gameover') BK.state = 'play'; } }
        if (!${foes}) for (const e of BK.enemies()) if (!e.boss) { e.alive = false; e.mcWait = false; }   /* (a death brings every foe back: a no-foes ride clears them again) */
      }
      return { hero: ${JSON.stringify(hero)}, maxHp, legs, lifts, cards, secs: +(frames / 60).toFixed(0), trace: trace.slice(0, 3000) };
    })()`, 1800000);
    console.log('\n== ' + r.hero + ' (hp ' + r.maxHp + ')' + (god ? ' GOD' : '') + (foes ? '' : ' NO FOES'));
    for (const l of r.legs) console.log('  ' + (l.ok ? 'ok  ' : l.died ? 'DIED' : 'STUCK') + ' ' + String(l.from).padStart(4) + ' -> ' + String(l.to).padEnd(5) + ' at ' + l.at.padEnd(8) + ' hp ' + String(l.hp).padStart(4) + '  ' + String(l.secs).padStart(5) + ' s  ' + JSON.stringify(l.dmg) + ' ' + JSON.stringify(l.n));
    if (dbg) console.log('  ' + r.trace.join(' | '));
    console.log('  legs failed ' + r.lifts + ', ' + r.secs + ' s ridden');
    summary.push(r.hero + ': ' + (r.lifts ? r.lifts + ' legs FAILED' : 'rode it')); if (r.lifts) bad++;
  }
} finally { await pg.close(); }
console.log('\n' + summary.join(' | '));
process.exit(bad ? 1 : 0);
