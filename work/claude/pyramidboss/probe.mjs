// work/claude/pyramidboss/probe.mjs - a quick page probe of THE SCARAB MOTHER as the mini and THE TOMB-KING'S SARCOPHAGUS (claude/pyramidboss; not a suite tool)
//   PORT=8895 node work/claude/pyramidboss/probe.mjs [lab]
import { openPage } from '../../../tools/cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
const LAB = process.argv.includes('lab');
try {
  const r = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js'); const TKM = await import('/src/tomb-king.js'); const TS = 16, out = [];
    BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true });
    BK.load(LEVELS.findIndex(l => l.id === 'sealedpyramid')); BK.state = 'play'; BK.god = true; BK.sim(5);
    const P = () => BK.P, k = BK.keys, clear = () => { k.left = k.right = k.jump = k.down = k.up = k.atk = k.block = false; };
    const put = (x, y) => { P().x = x; P().y = y; P().vx = P().vy = 0; BK.sim(2); };
    const L = BK.L, M = L.mini, A = L.arena;
    out.push('mini ' + M.boss + ' gate ' + M.gate + ' | arena ' + A.boss + ' | until ' + ('until' in A) + ' routePast ' + ('routePastBoss' in L));
    /* THE MINI */
    const mom = BK.enemies().find(e => e.t === 'scarabmother'); out.push('mother: mini ' + !!mom.mini + ' xpRole ' + mom.xpRole + ' hp ' + mom.hp + ' boss is ' + (BK.boss && BK.boss.t));
    for (const e of BK.enemies()) if (e !== mom && !e.maxHp && Math.abs(e.x - mom.x) < 40 * TS) e.alive = false;
    put(M.start[0] * TS + 8, M.floor); BK.sim(240);
    out.push('mini fight: miniActive ' + BK.miniActive + ' bossActive ' + BK.bossActive + ' mode ' + mom.mode + ' SMH.on ' + BK.scarabMotherHands().on() + ' active ' + BK.scarabMotherHands().active());
    let modes = {}; for (let i = 0; i < 60 * 25; i++) { P().hp = P().maxHp; BK.sim(1); modes[mom.mode] = (modes[mom.mode] || 0) + 1; } out.push('her modes in 25 s (hero standing still): ' + Object.keys(modes).join(','));
    for (let i = 0; i < 50 && mom.alive; i++) { mom.hp = 1; mom.inv = 0; mom.mode = "recover"; BKT.hurtEnemy(mom, 999, mom.x - 20, false); BK.sim(2); } BK.sim(120);
    const gateOpen = [51,52,53,54,55,56].every(y => L.grid[y * L.W + M.gate] !== 3 && L.grid[y * L.W + M.gate] !== BK.T?.PORT);
    out.push('mother down: alive ' + mom.alive + ' miniActive ' + BK.miniActive + ' gate cells ' + [51,56].map(y => L.grid[y * L.W + M.gate]).join(','));
    /* THE BOSS */
    const tk = BK.boss; out.push('boss: ' + (tk && tk.t) + ' hp ' + (tk && tk.hp) + ' x ' + (tk && Math.round(tk.x / TS)));
    out.push("state after the mini: " + BK.state); BK.state = "play"; BK.tp(A.start[0], A.start[1]); BK.sim(240);
    const H = BK.tombKingHands(), S = () => H.show();
    out.push('fight: bossActive ' + BK.bossActive + ' mode ' + tk.mode + ' on ' + H.on() + ' traps ' + H.trapsOn());
    /* the WEST SWITCH from the west ledge, him in its sweep */
    const G = S().G; tk.mode = 'recover'; tk.modeT = 3; tk.x = (G.levers[0].sweep[0] + G.levers[0].sweep[1]) / 2 + 40; S().ward = 0;
    put(G.ledges[0].x0 + 6, G.ledges[0].y); P().face = -1; clear(); BK.press('atk'); BK.sim(3); out.push('lever after the blow: ' + S().levers[0].st + ' P ' + Math.round(P().x) + ',' + Math.round(P().y) + ' ground ' + P().ground);
    let opened = false; for (let i = 0; i < 90; i++) { BK.sim(1); if (TKM.tkOpen(tk)) opened = true; } out.push('west switch: opened ' + opened + ' kind ' + tk.openKind + ' n ' + JSON.stringify(S().n.byKind));
    for (let i = 0; i < 60 * 8 && (TKM.tkOpen(tk) || tk.mode === 'clamp' || S().ward > 0); i++) BK.sim(1);
    /* climb test: from the floor under the east ledge, a jump lands on it */
    put(G.ledges[1].x0 - 8, G.floorY); BK.sim(10); clear(); BK.press("jump"); for (let i = 0; i < 40; i++) { k.jump = i < 18; k.right = i > 2 && i < 30; BK.sim(1); } clear(); BK.sim(20); out.push('jump onto the east ledge: y ' + Math.round(P().y) + ' (ledge ' + G.ledges[1].y + ') ground ' + P().ground);
    /* PHASE TWO: the traps arm */
    tk.hp = Math.round(tk.maxHp * 0.55); tk.mode = 'recover'; tk.modeT = 0.1; for (let i = 0; i < 200 && S().ph < 2; i++) BK.sim(1); out.push('phase ' + S().ph + ' traps ' + H.trapsOn());
    for (let i = 0; i < 400 && (tk.mode !== 'recover' && tk.mode !== 'walk'); i++) BK.sim(1);
    /* the west block: him in its reach, the hero treads its plate */
    const pw = G.plates[0]; S().ward = 0; tk.mode = 'recover'; tk.modeT = 2.5; tk.x = (pw.reach[0][0] + pw.reach[0][1]) / 2; put(pw.x0 - 30, G.floorY); clear(); k.right = true; for (let i = 0; i < 40 && P().x < pw.x0 + 12; i++) BK.sim(1); clear();
    opened = false; for (let i = 0; i < 90; i++) { BK.sim(1); if (TKM.tkOpen(tk)) opened = true; } out.push('west block plate: opened ' + opened + ' kind ' + tk.openKind + ' trap ' + BK.sealedPyramid().traps.find(t => t.id === 'tkBlockW').st);
    for (let i = 0; i < 60 * 8 && (TKM.tkOpen(tk) || tk.mode === 'clamp' || S().ward > 0); i++) BK.sim(1); BK.sim(400);
    /* he stands on the middle plate to strike: it fires on him */
    const pm = G.plates[1]; S().ward = 0; put(pm.x0 - 100, G.floorY); tk.x = (pm.x0 + pm.x1) / 2; tk.mode = 'slamTell'; tk.modeT = 0.7; S().act++; const n0 = S().n.onPlate;
    opened = false; for (let i = 0; i < 60; i++) { BK.sim(1); if (TKM.tkOpen(tk)) opened = true; } out.push('he stands on the middle plate: onPlate +' + (S().n.onPlate - n0) + ' opened ' + opened + ' kind ' + tk.openKind);
    out.push('read ' + JSON.stringify(H.read()).slice(0, 400));
    return out.join('\\n'); })()`, 300000);
  console.log(r);
  if (LAB) for (const [lv, mini] of [['sealedpyramid', true], ['sealedpyramid', false]]) {
    const q = await pg.evalp(`(async()=>{ await pg_reload_dummy; })()`.replace('await pg_reload_dummy;', ''), 10000);
  }
} finally { pg.close(); }
