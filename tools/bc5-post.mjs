/* tools/bc5-post.mjs - BC5POST (claude/bc5post): the Glassblower's hall and the shrines around it, with the SHIPPED build (no flag, no env).
   (1) KILL, then die: touch the shrine beyond the portcullis, die, come back there (outside the hall), walk right to the exit and on;
   (2) KILL, then die WITHOUT touching it: back at the kiln shrine before the hall, the dead mini's hall open to walk through;
   (3) die DURING the fight: back at the kiln shrine before the arena.   node tools/bc5-post.mjs */
import { openPage } from './cdp.mjs';
const pg = await openPage();
try {
  const r = await pg.evalp(`(async()=>{ const out = { notes: [] };
    const en = () => BK.enemies().find(e => e.t === 'glassblower');
    const boot = async () => { BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true }); const { LEVELS } = await import('/src/level.js'); BK.load(LEVELS.findIndex(l => l.id === 'buriedcity')); BK.state = 'play'; BK.start(); BK.god = true; BK.reset(); BK.sim(300);
      BK.gainXp(1e7); for (let i = 0; i < 20 && BK.state !== 'play'; i++) { BK.press('confirm'); BK.sim(5); } BK.sim(120); };
    const col = x => Math.round(x / 16), live = () => { for (let k = 0; k < 20 && BK.state !== 'play'; k++) { BK.press('confirm'); BK.sim(3); } };
    const touch = s => { BK.god = true; BK.P.x = s.x; BK.P.y = s.y; BK.P.vx = BK.P.vy = 0; BK.sim(20); };
    const die = () => { BK.god = false; BK.P.hp = Math.min(BK.P.hp, BK.P.maxHp); BK.damagePlayer(BK.P.x - 8, 99999, {}); for (let k = 0; k < 150; k++) { if (BK.state !== 'play') BK.press('confirm'); BK.sim(2); } };
    const fight = (until) => { let f = 0; for (; f < 4000; f++) { const e = en(); if (!e || !e.alive) break; if (BK.state === 'talk' || BK.state === 'card') BK.press('confirm'); if (until && f === until) e.hp = 40; const d = e.x - BK.P.x; BK.P.face = Math.sign(d) || 1; if (Math.abs(d) > 30) BK.P.x += Math.sign(d) * 2; if (f % 8 === 0) BK.press('atk'); if (e.mode === 'buried' || e.hp < 41) e.hp = Math.max(1, e.hp); BK.sim(1); } return f; };
    const walk = (toCol, maxF, god) => { BK.god = !!god; BK.keys.right = true; let f = 0, stall = 0, lastx = BK.P.x; for (; f < maxF; f++) { live(); if (f % 40 === 0) BK.press('jump'); BK.sim(1); if (col(BK.P.x) >= toCol) break; } BK.keys.right = false; return { f, col: col(BK.P.x), state: BK.state, hp: BK.P.hp }; };
    await boot(); const M = BK.L.mini; out.mini = M ? [M.x0, M.x1] : null; out.shrines = BK.shrines().map(s => col(s.x)).sort((a, b) => a - b).join(','); out.W = BK.L.W;
    const SH = BK.shrines().slice().sort((a, b) => a.x - b.x); const kiln = SH.find(s => col(s.x) >= 380 && col(s.x) <= 392), after = SH.find(s => col(s.x) >= 400 && col(s.x) <= 415);
    out.kiln = kiln && col(kiln.x); out.after = after && col(after.x); const portc = []; for (let x = 380; x < 420; x++) for (let y = 0; y < 60; y++) { try { if (BK.tileAt && BK.tileAt(x, y) === BK.T.PORT) portc.push(x); } catch (e) {} } out.portcullisCols = [...new Set(portc)].join(',');
    // (3) die DURING the fight
    touch(kiln); BK.tp(397, 32); BK.sim(60); BK.god = true; const fA = fight(0); BK.god = false; out.A = { note: 'DEATH DURING THE FIGHT' }; let e = en(); out.A.foeAlive = !!(e && e.alive);
    // that fight() ran to a kill since god. so rebuild: new boot, fight a while, then die
    await boot(); touch(SH.find(s => col(s.x) >= 380 && col(s.x) <= 392)); BK.tp(397, 32); BK.sim(60); BK.god = false; for (let f = 0; f < 120; f++) { BK.sim(1); live(); } const preCol = col(BK.P.x), inMini = !!BK.miniActive; die(); out.A = { preCol, miniActive: inMini, backCol: col(BK.P.x), state: BK.state, hp: BK.P.hp, cpCol: col(BK.checkpointAt().x), foeAlive: !!(en() && en().alive), foeHp: en() && en().hp };
    // (1) KILL, touch the shrine beyond the portcullis, die, walk
    await boot(); touch(SH.find(s => col(s.x) >= 380 && col(s.x) <= 392)); BK.tp(397, 32); BK.sim(60); BK.god = true; const fk = fight(200); live(); BK.sim(240); live(); out.B = { fightFrames: fk, killedAlive: !!(en() && en().alive), miniActive: !!BK.miniActive, state: BK.state };
    const w1 = walk(after ? col(after.x) + 1 : 412, 1500); out.B.walkToShrine = w1; touch(BK.shrines().slice().sort((a, b) => a.x - b.x).find(s => col(s.x) >= 400 && col(s.x) <= 415)); const lit = !!(BK.shrines().find(s => col(s.x) >= 400 && col(s.x) <= 415) || {}).lit; BK.tp(col(BK.P.x) + 1, 32); BK.sim(5);
    die(); out.B.afterDeath = { backCol: col(BK.P.x), state: BK.state, hp: BK.P.hp, cpCol: col(BK.checkpointAt().x), lit, outsideHall: M ? BK.P.x > M.x1 : null, foeAlive: !!(en() && en().alive), miniActive: !!BK.miniActive };
    out.doors = (BK.L.doors || []).map(d => [d.x0 ?? d.x, d.y0 ?? d.y, d.id].join(":")).join(" "); const w2 = walk(460, 3000, true); out.B.walkOn = w2; const w3 = walk(560, 5000, true); out.B.walkOn2 = w3;
    // (2) KILL, die WITHOUT touching the shrine
    await boot(); touch(SH.find(s => col(s.x) >= 380 && col(s.x) <= 392)); BK.tp(397, 32); BK.sim(60); BK.god = true; fight(200); live(); BK.sim(240); live(); die();
    out.C = { backCol: col(BK.P.x), state: BK.state, cpCol: col(BK.checkpointAt().x), miniActive: !!BK.miniActive, foeAlive: !!(en() && en().alive) }; const w4 = walk(430, 1500, true); out.C.walkThrough = w4; out.C.afterWalk = { foeAlive: !!(en() && en().alive), miniActive: !!BK.miniActive };
    return out; })()`, 600000);
  console.log(JSON.stringify(r, null, 1)); console.log('errors', JSON.stringify(pg.errors));
} finally { pg.close(); }
