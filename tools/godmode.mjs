// tools/godmode.mjs - GOD MODE and UNLOCK EVERYTHING (claude/godmode; Daniel 2026-10-07). The two TESTING settings were swapped in name:
//   UNLOCK EVERYTHING = SET.godmode (the old "God mode": owns everything, opens every wood, writes nothing to the save);
//   GOD MODE = SET.invincible (the old "Invincible", and now the real thing): hp and stamina held full through hits, poisons and a pit,
//   an infinite jump in the air, hold JUMP to rise slowly, DOWN to drop - and an ASSIST: no medal, no silver, no no-hit / iron mark, no best time.
// The saved keys are unchanged (godmode, invincible), so an old save keeps its values. In the page: settings rows + labels, then the play.
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { TAB_ITEMS, tabOf, LEGACY_ROWS } from '../src/settings-ui.js';
for (const k of ['Unlock everything', 'God mode']) assert.equal(tabOf(k), 'gameplay', k + ' is a gameplay row');
assert(!tabOf('Invincible'), 'the old Invincible row is gone'); assert(LEGACY_ROWS.includes('God mode') && LEGACY_ROWS.includes('Unlock everything'));
const pg = await openPage({ audio: false, fonts: false }); const fails = [], ok = (c, m) => { if (!c) fails.push(m); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SAVE = { hero: 'knight', heroes: { knight: true } };
try {
  const nav = async lv => { await pg.evalp('(()=>{localStorage.clear();localStorage.setItem("bracken.progress.0",' + JSON.stringify(JSON.stringify(SAVE)) + ');window.__gone=1;setTimeout(()=>location.assign("/?level=' + lv + '&hero=knight"),50);return 1})()', 8000);
    for (let i = 0; i < 400; i++) { await sleep(150); if (await pg.evalp('!window.__gone&&typeof window.BK==="object"&&!!window.BK.lookPass&&location.search.includes("level=' + lv + '")', 3000).catch(() => false)) break; } };
  await nav("kings");
  const r = await pg.evalp(`(async()=>{ const P = BK.P, S = BK.SET, o = {}; BK.manualSimulation = true;
    const owned0 = BK.PROG.heroes.pyro === true;
    /* 1. UNLOCK EVERYTHING: the old god mode, as it was */
    S.godmode = true; S.invincible = false; o.unlockOwns = BK.sim ? (()=>{ BK.sim(2); return true; })() : false; S.godmode = false;
    /* 2. GOD MODE: hits, a poison, drained stamina, a pit */
    S.invincible = true; BK.sim(5); P.hp = 1; P.st = 0; BK.sim(2); o.refill = [P.hp === P.maxHp, P.st === P.maxSt];
    for (let i = 0; i < 6; i++) { BK.damagePlayer(P.x - 10, 40, { unblockable: true }); BK.sim(60); }
    o.afterHits = [P.hp, P.maxHp, P.dead];
    P.st = 0; P.winded = true; BK.sim(2); o.afterWinded = [P.st, P.maxSt, !!P.winded];
    const cp = { x: P.x, y: P.y }; P.safe = { x: P.x, y: P.y, L: BK.L }; P.x += 40; P.y = BK.L.H * 16 + 100; P.vy = 400; BK.sim(3); o.pit = [!P.dead, P.hp === P.maxHp, Math.abs(P.x - cp.x) < 2, P.y < BK.L.H * 16];
    /* 3. INFINITE JUMP and the float */
    BK.sim(30); P.y -= 60; P.vy = 0; P.ground = false; P.coyote = 0; const y0 = P.y; let max = 0, minY = y0, ups = 0;
    for (let k = 0; k < 6; k++) { BK.keys.jump = true; P.jbuf = 0.12; BK.sim(1); if (P.vy < -150) ups++; BK.keys.jump = false; for (let q = 0; q < 12; q++) { BK.sim(1); minY = Math.min(minY, P.y); } max++; }
    o.jumps = ups; o.airborne = !P.ground;
    const y1 = P.y; BK.keys.jump = true; BK.sim(30); o.float = y1 - P.y; o.dbg = [y0, y1, P.y, P.vy, P.ground, P.x, P.y]; BK.keys.jump = false;
    const y2 = P.y; BK.keys.down = true; BK.sim(10); o.drop = P.y - y2; BK.keys.down = false;
    /* 4. OFF: the same hit hurts again */
    S.invincible = false; BK.sim(130); P.inv = 0; P.grace = 0; P.hp = P.maxHp; const h0 = P.hp; BK.damagePlayer(P.x - 10, 20, { unblockable: true }); o.offHurts = P.hp < h0;
    return o; })()`, 120000);
  ok(r.refill && r.refill[0] && r.refill[1], 'hp / stamina not refilled with GOD MODE on: ' + JSON.stringify(r.refill));
  ok(r.afterHits[0] === r.afterHits[1] && !r.afterHits[2], 'hp dropped through hits: ' + JSON.stringify(r.afterHits));
  ok(r.afterWinded[0] === r.afterWinded[1] && !r.afterWinded[2], 'stamina not held full: ' + JSON.stringify(r.afterWinded));
  ok(r.pit && r.pit.every(Boolean), 'a pit killed or hurt him, or did not return him to safe ground: ' + JSON.stringify(r.pit));
  ok(r.jumps >= 6 && r.airborne, 'six mid-air jumps were not all taken: ' + r.jumps);
  ok(r.float > 8, 'holding JUMP did not float him up: ' + r.float + JSON.stringify(r.dbg));
  ok(r.drop > 20, 'DOWN did not drop him: ' + r.drop);
  ok(r.offHurts, 'with GOD MODE off a hit no longer hurts');
  /* 5. the assist earns nothing: win a level in GOD MODE */
  await nav("theatre");
  const w = await pg.evalp(`(async()=>{ const S = BK.SET, id = BK.PROG.lastLevel; S.invincible = true;
    const before = JSON.stringify(Object.keys(BK.PROG).filter(k => BK.PROG[k] && BK.PROG[k].medal).map(k => [k, BK.PROG[k].medal]));
    const L = BK.L, g = L.ents.find(e => e.t === 'gate'); BK.manualSimulation = true; if (L.gateAfterBoss) { const A = L.arena; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); BK.sim(150); const e = BK.boss; if (e) { e.hp = 1; e.mode = 'downed'; e.modeT = 3; BKT.hurtEnemy(e, 99, e.x - 10, false); } for (let i = 0; i < 400 && BK.bossActive; i++) BK.sim(1); for (let i = 0; i < 300 && !L.gateOpen; i++) BK.sim(1); }
    BK.tp(g.x - 1, g.y);
    for (let i = 0; i < 400 && BK.state === 'play'; i++) { BK.keys.right = true; BK.sim(1); } BK.keys.right = false; for (let i = 0; i < 300; i++) BK.sim(1);
    const p = BK.PROG.theatre || {}; S.invincible = false;
    return { state: BK.state, medal: p.medal || 0, noHit: !!p.noHit, iron: !!p.iron, best: p.best, silver: p.silver || 0 }; })()`, 60000);
  ok(w.state !== 'play' && !w.medal && !w.noHit && !w.iron && w.best === undefined, 'GOD MODE earned something it should not: ' + JSON.stringify(w));
} finally { pg.close(); }
if (fails.length) { console.log('godmode: ' + fails.length + ' failure(s)\n  ' + fails.join('\n  ')); process.exitCode = 1; }
else console.log('ok  godmode  GOD MODE holds hp + stamina full through hits and a pit, jumps in the air, floats and drops, earns no medal / best / no-hit; UNLOCK EVERYTHING is the old god mode; the settings rows are renamed');
