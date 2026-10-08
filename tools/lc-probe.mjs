// tools/lc-probe.mjs - THE LIT CHURCH's smoke probe (claude/litchurch; not in the suite). Loads the church, runs a few seconds, and drives its rule by hand:
// the flame, the porch lamp and the west door, a snuff, the bellows, the chord, the seal, lamp three and the dark rising, the rood screen; prints the hands' state
// and every page error. PORT=8734 node tools/lc-probe.mjs [hero]
import { openPage } from './cdp.mjs';
const hero = process.argv[2] || 'knight';
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js'); const TS = 16, out = [];
    BK.manualSimulation = true; BK.setHero(${JSON.stringify(hero)}); BK.reset({ fresh: true });
    BK.load(LEVELS.findIndex(l => l.id === 'church')); BK.state = 'play'; BK.sim(30);
    const K = () => BK.litChurch(), H = BK.litChurchHands(), P = () => BK.P, say = (k, v) => out.push(k + ': ' + JSON.stringify(v));
    say('start', { x: Math.round(P().x / TS), y: Math.round(P().y / TS), hp: P().hp, rooms: H.read().rooms });
    const at = (x, y) => { BK.tp(x, y); P().vx = P().vy = 0; BK.sim(3); };
    const press = k => { BK.press(k); BK.sim(10); };
    /* the brazier, the porch lamp, the west door */
    at(9, 45); press('talk'); say('flame', P().lcFlame);
    at(40, 45); press('talk'); say('porch/west', { porch: H.read().lamps.porch, west: H.read().doors.west });
    /* the narthex lamp: snuff */
    at(51, 45); P().face = 1; BK.sim(2); press('atk'); BK.sim(20); say('narthex snuffed', { lamp: H.read().lamps.narthex, room: H.read().rooms.narthex });
    BK.sim(240); say('after 4s (relit?)', { lamp: H.read().lamps.narthex, n: H.read().n.relit, foes: H.read().foes.filter(f => f.room === 'narthex') });
    /* lamp one */
    at(162, 37); press('talk'); at(175, 37); press('talk'); say('lamp1', { chapel1: H.read().lamps.chapel1, rood1: H.read().lamps.rood1 });
    /* the bellows */
    at(165, 37); P().face = 1; BK.sim(2); press('atk'); BK.sim(2); at(166, 37); let top = 99; for (let i = 0; i < 120; i++) { BK.sim(1); top = Math.min(top, P().y / TS); } say('bellows top row', top.toFixed(1));
    /* the chord */
    at(109, 27); press('talk'); BK.sim(40); say('chord', K().desks[0]);
    at(106, 27); BK.keys.left = true; BK.press('jump'); for (let i = 0; i < 60; i++) BK.sim(1); BK.keys.left = false; BK.sim(30); say('after gust jump col,row', [Math.round(P().x / TS), Math.round(P().y / TS)]);
    /* lamp two */
    at(66, 27); press('talk'); at(61, 27); press('talk'); say('lamp2', { chapel2: H.read().lamps.chapel2, rood2: H.read().lamps.rood2 });
    /* the seal */
    at(52, 31); P().face = 1; BK.sim(2); press('atk'); BK.sim(10); say('seal/hatch', { seal: H.read().lamps.seal, hatch: H.read().doors.hatch });
    /* lamp three, the dark */
    at(172, 62); press('talk'); at(175, 62); press('talk'); say('lamp3', { chapel3: H.read().lamps.chapel3, grate: H.read().doors.cryptgrate, dark: H.read().dark });
    at(161, 60); BK.sim(200); say('dark after 3s in the well', H.read().dark);
    at(163, 45); BK.sim(10); say('escaped', { esc: H.read().escaped, nave: H.read().rooms.nave });
    /* the rood screen */
    at(172, 62); press('talk'); at(177, 45); press('talk'); say('rood3', { rood3: H.read().lamps.rood3, rood: H.read().doors.rood });
    /* the boss */
    at(243, 49); BK.sim(240); const b = BK.boss; say('boss', b ? { t: b.t, mode: b.mode, hp: b.hp, light: Math.round(b.pbLight) } : null);
    say('n', H.read().n);
    return out;
  })()`);
  console.log(r.join('\n'));
  console.log('page errors:', pg.errors.length ? pg.errors.slice(0, 8).join('\n') : 'none');
} finally { await pg.close(); }
