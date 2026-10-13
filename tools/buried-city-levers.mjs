// tools/buried-city-levers.mjs - THE HOURGLASS KING's LEVERS, REAL KEYS (claude/buriedcity fix pass 10-09; the BCREVIEW's M1: phase two's banks buried both
// levers and the opening - the level's verb - was dead for two thirds of the fight). A page check (tools/cdp.mjs, PORT): for knight, warden and pyro, in EVERY
// phase (one, two with its banks up, three with its pours), for EACH lever (west, east): the hero starts on the floor eight tiles in from the lever, WALKS to it with
// the arrow keys (no teleport onto it), and presses E (talk) while his glass is low - the king must STALL ('stall': open). God mode, the city's other foes gone,
// the king's blows still running (he walks and swings at you; the hero must still get there). Also: a hero held against the wall (into the bank in phase two)
// still stands within reach of the lever, and the levers are LIT (M5: HGK.leversLit) while the glass is low.
//   BC3 (claude/buriedcity3): phase three has NO lever stall - its opening is THE GREAT HOURGLASS (the hero walks to it, presses E, the king stalls, the levers stay unlit); a pull at a lever in phase three must do nothing.
//   PORT=8794 node tools/buried-city-levers.mjs [--heroes=knight,warden,pyro]
import { openPage } from './cdp.mjs';
const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const heroes = opt('heroes', 'knight,warden,pyro').split(',');
const pg = await openPage({ audio: false, fonts: false });
let bad = 0, n = 0;
try {
  for (const hero of heroes) {
    await pg.reload();
    const r = await pg.evalp(`(async()=>{
      const { LEVELS } = await import('/src/level.js'); const { HK_STAGE } = await import('/src/hourglass-king.js'); const TS = 16; const out = [];
      BK.manualSimulation = true; BK.setHero(${JSON.stringify(hero)}); BK.reset({ fresh: true });
      const idx = LEVELS.findIndex(l => l.id === 'buriedcity');
      const k = BK.keys, P = () => BK.P, clear = () => { k.left = k.right = k.jump = k.down = k.up = k.atk = k.block = false; };
      for (const ph of [1, 2, 3]) for (const side of ['W', 'E']) for (const mode of (ph === 1 ? ['walk'] : ph === 2 ? ['walk', 'wall'] : ['walk', 'dry'])) {   /* (wall: held into the wall - in phases two and three the bank stops him by the lever) */
        BK.load(idx); BK.state = 'play'; BK.god = true; BK.sim(5);
        for (const e of BK.enemies()) if (!e.boss) e.alive = false;
        const AH = BK.L.arena.hk;   /* (claude/buriedcity2: the throne room from the arena, not columns - the city was rebuilt round it) */
        BK.tp(AH.sx + 16, AH.R - 1); for (let i = 0; i < 240; i++) BK.sim(1);
        const B = BK.boss, HH = BK.hourglassKingHands(), S = HH && HH.show();
        if (!B || !S) { out.push({ ph, side, mode, err: 'no king' }); continue; }
        for (const [p, k] of [[2, 0.5], [3, 0.2]]) if (ph >= p) { B.hp = B.maxHp * k; for (let i = 0; i < 900 && S.ph < p; i++) BK.sim(1); }   /* through phase two, as a fight goes */
        const sx = S.G.sx, dir = side === 'W' ? -1 : 1;
        /* (BC3, claude/buriedcity3: phase three's gates are DRY - its opening is THE GREAT HOURGLASS in the middle of the room. Phase three mode 'walk' walks to IT from that side and presses E; mode 'dry' walks to the lever and checks a pull does NOT stall him and the lever is unlit) */
        const great = ph === 3 && mode === 'walk', lvc = great ? Math.round(S.G.great / TS - 0.5) : sx + HK_STAGE.levers[side === 'W' ? 0 : 1];
        /* start on the floor eight tiles in from the lever, keep the king off you for the walk (he still runs his blows) */
        BK.tp(lvc - dir * (great ? -8 : 8), AH.R - 1); clear(); for (let i = 0; i < 20; i++) BK.sim(1);
        S.glass = S.glassMax * 0.3; S.ward = 0; S.lowSaid = true; if (/Tell$|^pend|^slip|^stall|^turn/.test(B.mode)) { B.mode = 'walk'; B.modeT = 0.5; }
        let f = 0, at = null; const lx = great ? S.G.great : lvc * TS + 8;
        for (; f < (great ? 900 : 360); f++) { clear(); const d = lx - P().x;
          if (mode === 'wall') k[dir < 0 ? 'left' : 'right'] = true; else if (Math.abs(d) > 4) { k[d > 0 ? 'right' : 'left'] = true; if (great && f % 40 < 8) k.jump = true; }   /* (phase three: the sandstone blocks and the drift - a hero jumps) */
          S.glass = Math.max(S.glass, S.glassMax * 0.05); S.ward = 0; if (great) S.great.cd = 0;
          BK.sim(1); if (mode === 'wall' ? f > 240 : (Math.abs(lx - P().x) <= 6 && P().ground)) { at = [+(P().x / TS).toFixed(2), +(P().y / TS).toFixed(2), P().ground]; break; } }
        clear(); const lit = HH.leversLit();
        if (/^stall|^turn/.test(B.mode)) { B.mode = 'walk'; B.modeT = 0.5; } S.ward = 0; S.glass = S.glassMax * 0.3;
        if (great) { S.great.cd = 0; S.great.run = 0; } const opens0 = S.n.opens, g0 = S.n.greatOpens; BK.press('talk'); for (let i = 0; i < 3; i++) BK.sim(1);
        out.push({ ph, phNow: S.ph, banks: S.ph >= 2, side, mode, frames: f, at, dx: +(Math.abs(lx - P().x)).toFixed(1), lit, stalled: great ? (S.n.greatOpens > g0 && /^stall/.test(B.mode)) : S.n.opens > opens0, great, dry: mode === 'dry', kingMode: B.mode, open: +(B.open || 0).toFixed(2) });
      }
      return out; })()`, 600000);
    for (const q of r) { n++; const good = !q.err && q.phNow === q.ph && q.at && q.at[2] && (q.dry ? (!q.stalled && !q.lit) : (q.stalled && (q.great ? !q.lit : q.lit)));   /* (phase three: the great glass flips him in and the levers are NOT lit; a dry pull does nothing) */
      if (!good) bad++; console.log((good ? 'ok  ' : 'BAD ') + hero.padEnd(7) + ' phase ' + q.ph + ' lever ' + q.side + ' ' + q.mode.padEnd(4) + '  ' + JSON.stringify(q)); }
  }
} finally { pg.close(); }
if (bad) { console.log('buried-city-levers: ' + bad + ' of ' + n + ' FAILED - a hero on the floor cannot pull a throne-room lever in that phase'); process.exit(1); }
console.log('buried-city-levers: ' + n + ' pulls green - ' + heroes.join('/') + ' pull both levers in phases one and two (and from against the wall; lit while his glass is low), and in phase three walk to THE GREAT HOURGLASS and flip it (a lever pull is dry, unlit)');
