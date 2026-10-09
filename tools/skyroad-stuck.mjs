// tools/skyroad-stuck.mjs - THE SKY ROAD's DEAD-AIR TRAPS (claude/skyroad2; Daniel 10-08, a photo: "I got stuck here in the Sky Road" - the knight on a
// disc-road pinnacle over the cloud sea, the disc's sun gone off it). THE CAUSE: the cloud sea throws you back to "the last solid footing you stood on" -
// and a gated pinnacle whose air is dead WAS that footing, so a drop off it threw you straight back onto it, for ever. Every hero, both ways.
//   STATIC (Node): with every gated thermal dead (no stone struck, the disc unlit), every footing the level reaches is tested: from it, can a hero get to a
//     checkpoint, a sun-stone, the disc, the cloak or the gate? Every footing that cannot (a DEAD-AIR TRAP) must be in L.airOnly with the thermal that frees
//     it - and that thermal, lit alone, must free it. The list must be exactly the traps (no stale rows).
//   RUNTIME (the page, real key events, a fresh save): THE PHOTO - each hero walks (and glides) off the bridgehead with the disc unlit, lands on the disc road,
//     and walks off the pinnacle into the cloud sea, east and west: the updraft must hand him back to the bridgehead, not the dead pinnacle. Then EVERY
//     L.airOnly footing, from the footing the road comes to it from: off it both ways, he must come back to live footing. And a lit pinnacle still takes
//     you back to itself (the old rule where it was right).
//     node tools/skyroad-stuck.mjs [--static] [heroes=knight,warden,pyro,paladin,pirate,reaper]     (PORT=<your port>)
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
let bad = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
const L = LEVELS.find(l => l.id === 'skyroad').build(), AO = L.airOnly || [], TRAPS = [];
{ const full = floodReach(L, T), gated = e => e.t === 'vent' && e.thermal && e.src, dead = { ...L, ents: L.ents.filter(e => !gated(e)) };
  const EX = L.ents.filter(e => ['sunstone', 'sundisc', 'check', 'gate', 'cloak'].includes(e.t)), frees = (ents, x, y) => { const r = floodReach({ ...L, ents, START: { x, y } }, T); return EX.some(e => r.near(e.x, e.y)); };
  const segs = []; for (const [x, y] of [...full.seen].map(k => k.split(',').map(Number)).sort((a, b) => a[1] - b[1] || a[0] - b[0])) { const s = segs[segs.length - 1]; if (s && s.y === y && s.x1 === x - 1) s.x1 = x; else segs.push({ y, x0: x, x1: x }); }
  const traps = segs.filter(s => !frees(dead.ents, s.x0, s.y)), inAO = s => AO.find(a => a.row === s.y && s.x0 >= a.x0 && s.x1 <= a.x1);
  const loose = traps.filter(s => !inAO(s));
  ok(!loose.length, traps.length + ' dead-air traps with every gated thermal dead, every one in L.airOnly ' + (loose.length ? 'MISSING ' + JSON.stringify(loose) : traps.map(s => s.x0 + '-' + s.x1 + '@' + s.y).join(' ')));
  const stale = AO.filter(a => !traps.some(s => s.y === a.row && s.x0 <= a.x1 && s.x1 >= a.x0)); ok(!stale.length, 'every L.airOnly row is a real trap ' + JSON.stringify(stale));
  const wrong = AO.filter(a => { const v = L.ents.find(e => gated(e) && e.x === a.vent); return !v || !frees(dead.ents.concat(L.ents.filter(e => gated(e) && (e.x === a.vent || e.src === v.src))), a.x0, a.row); });
  ok(!wrong.length, 'each one is freed by its own thermal lit (with its stone or the disc) ' + JSON.stringify(wrong));
  /* the runtime half tests the traps the model finds (not L.airOnly: on master there is no list), each with the thermal that frees it */
  for (const s of traps) { const v = L.ents.find(e => gated(e) && frees(dead.ents.concat([e]), s.x0, s.y)); TRAPS.push({ x0: s.x0, x1: s.x1, row: s.y, vent: v ? v.x : null }); } }
if (process.argv.includes('--static')) { console.log(bad ? 'skyroad-stuck: ' + bad + ' FAILED' : 'skyroad-stuck: all green (static)'); process.exit(bad ? 1 : 0); }

const { openPage } = await import('./cdp.mjs');
const heroes = (process.argv.slice(2).find(a => !a.startsWith('-')) || 'knight,warden,pyro,paladin,pirate,reaper').split(',');
/* where the road comes to each trap from: [approach col, row] */
const FROM = { 131: [121, 37], 226: [203, 19], 303: [294, 17], 310: [294, 17], 317: [294, 17], 324: [294, 17], 357: [341, 15], 371: [341, 15] };
ok(TRAPS.every(t => FROM[t.vent]), 'every trap has an approach footing ' + JSON.stringify(TRAPS.filter(t => !FROM[t.vent])));
const pg = await openPage({ audio: false, fonts: false });
try {
  for (const h of heroes) {
    const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; const out = { photo: [], traps: [] };
      const KEY = { right: ['ArrowRight', 39], left: ['ArrowLeft', 37], jump: ['z', 90], atk: ['x', 88] };
      const key = (k, down) => { const [name, code] = KEY[k]; dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { key: name, code: name.length === 1 ? 'Key' + name.toUpperCase() : name, keyCode: code, bubbles: true })); };
      const up = () => { for (const k of Object.keys(KEY)) key(k, false); };
      const fi = LEVELS.findIndex(l => l.id === 'skyroad');
      const fresh = () => { up(); BK.setHero(${JSON.stringify(h)}); BK.reset({ fresh: true }); BK.load(fi); BK.state = 'play'; BK.sim(4); for (const e of BK.enemies()) e.alive = false; BK.L.clouds = []; BK.god = true; };
      const P = BK.P, S = () => BK.skyroad(), at = () => [Math.floor(P.x / 16), Math.floor(P.y / 16) - 1], stand = () => { for (let i = 0; i < 90 && !P.ground; i++) BK.sim(1); BK.sim(20); return at(); };
      const ao = ${JSON.stringify(TRAPS)}, aoAt = ([c, r]) => ao.find(a => r === a.row && c >= a.x0 && c <= a.x1);
      const airLive = col => { const pr = BK.props().find(q => q.t === 'vent' && q.thermal && Math.floor(q.x / 16) === col), d = S().read().disc; return !!(pr && pr.src0 && !(pr.src && pr.src.startsWith('disc:') && d && d.until - BK.time < 3)); };
      /* off the edge he stands on, into the cloud sea, holding a direction (and jump, for a glide): until the updraft has him and he stands again */
      const drop = (dir, glide) => { const c0 = S().read().n.catches; key(dir, true); if (glide) key('jump', true); let i = 0; for (; i < 600 && S().read().n.catches === c0; i++) BK.sim(1); up(); const caught = S().read().n.catches > c0, put = at(); stand(); return { caught, at: put, frames: i }; };   /* (where the updraft PUT him: a live column lifts him straight off it) */
      /* THE PHOTO: the bridgehead, the disc unlit; walk (and glide) off east onto the disc road; then off the pinnacle into the sea, east and west */
      for (const [how, dir] of [['walk', 'right'], ['glide', 'right'], ['walk', 'left'], ['glide', 'left']]) { fresh(); BK.tp(294, 17); stand();
        /* steered with the arrows as a player steers a fall: onto the first pinnacle walking, the second gliding */
        const tx = (how === 'glide' ? 310 : 303) * 16 + 8; if (how === 'glide') key('jump', true);
        for (let i = 0; i < 1800 && !(P.ground && P.y > 40 * 16); i++) { const want = P.x < tx - 6 ? 'right' : P.x > tx + 6 ? 'left' : null; for (const k of ['left', 'right']) key(k, k === want); BK.sim(1); } up(); const landed = stand();
        const d = drop(dir, how === 'glide'); out.photo.push({ how, dir, landed, onPin: !!aoAt(landed), caught: d.caught, back: d.at, deadAgain: !!(aoAt(d.at) && !airLive(aoAt(d.at).vent)) }); }
      /* EVERY airOnly footing, from its approach footing: off it both ways */
      const FROM = ${JSON.stringify(FROM)};
      for (const a of ao.filter(q => FROM[q.vent])) for (const dir of ['left', 'right']) { fresh(); const [fx, fy] = FROM[a.vent]; BK.tp(fx, fy); const from = stand(); BK.tp(a.x0 + 1, a.row); const on = stand();
        const d = drop(dir, false); out.traps.push({ zone: a.x0 + '-' + a.x1 + '@' + a.row, dir, from, on, onZone: !!aoAt(on), caught: d.caught, walled: !d.caught && !!aoAt(d.at) && aoAt(d.at) === aoAt(on), back: d.at, deadAgain: !!(aoAt(d.at) && !airLive(aoAt(d.at).vent)) }); }
      /* A LIT PINNACLE still takes you back to itself: strike the disc (a real blow), stand on the second pinnacle, drop off it */
      fresh(); BK.tp(294, 17); stand(); P.face = 1; key('atk', true); BK.sim(3); key('atk', false); BK.sim(20); const lit = !!(S().read().disc && S().read().disc.until > 0);
      BK.sim(60); BK.tp(310, 52); const on = [Math.floor(P.x / 16), Math.floor(P.y / 16) - 1]; BK.sim(2); BK.tp(313, 50); const d = drop('right', false); out.lit = { lit, on, back: d.at, caught: d.caught };
      return out; })()`, 600000);
    for (const p of r.photo) ok(p.onPin && p.caught && !p.deadAgain && p.back[0] <= 298 && p.back[1] <= 18, h + ' THE PHOTO (' + p.how + ' off the bridgehead, then ' + p.dir + ' off the dead pinnacle): back on the bridgehead ' + JSON.stringify(p));
    /* (a side with rock against it - the low roost's west - is no way off: that side is skipped, but every trap needs one side that drops) */
    for (const t of r.traps) if (!t.walled || r.traps.filter(q => q.zone === t.zone).every(q => q.walled)) ok(t.onZone && t.caught && !t.deadAgain, h + ' dead-air trap ' + t.zone + ' off ' + t.dir + ': back on live footing ' + JSON.stringify(t));
    ok(r.lit.lit && r.lit.caught && r.lit.back[0] >= 309 && r.lit.back[0] <= 311, h + ' a LIT pinnacle still takes you back to itself ' + JSON.stringify(r.lit));
  }
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3))); if (pg.errors.length) bad++;
} finally { await pg.close(); }
console.log(bad ? 'skyroad-stuck: ' + bad + ' FAILED' : 'skyroad-stuck: all green'); process.exit(bad ? 1 : 0);
