/* tools/wardenbot-duel.mjs - THE WARDEN BOT vs THE FREEBOOTER, headless (claude/wardenbot). No browser, no page.
   It plays the REAL src/freebooter-boss.js (stepFreebooter / takeAt / parried / landed / fbLabPlan - the bot's own plan) against a small hero model whose blow numbers are the game's:
   swordDmg at L26 (knight (10+16)*1.1, warden 11+16), the warden's blow box (44 out, the long third 60 from 0.09 s), her TIP PAY (src/hero-pass.js tipMul, src/warden-id.js tipStart / bandPay:
   edge-to-edge d >= 28 pays x1.6-2.0, x2.0 in his opening; d 14-28 = mid-shaft x0.7; d < 14 = the haft x0.3), the swing cadence (src/commit.js: art 0.3 s + 0.084 s, the third +0.30 s) and
   the anti-mash stale pay (1, .85, .7, .55 per repeat of one verb in one opening). It measures what the bot's CHOSEN STAND costs the warden, not the whole game: the hero cannot die, no
   stamina, no flasks, and it stops at his 55% line (the phase-two entry).
   node tools/wardenbot-duel.mjs [--seeds=40] [--v2]    (exit 1 on a failed check) */
import * as FBM from '../src/freebooter-boss.js';
import { tipMul } from '../src/hero-pass.js';
import { tipStart, bandPay } from '../src/warden-id.js';
const { FB } = FBM;
const arg = k => { const a = process.argv.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : null; };
const SEEDS = +(arg('seeds') || 40), V2 = process.argv.includes('--v2');
const DT = 1 / 60, W = 14, DECK = [100, 640];
const DMG = { knight: Math.round((10 + 16) * 1.1), warden: 11 + 16 };
const LAB_REACH = { knight: 22, warden: 40 }, WARDEN_TIP = 32;
const reachOf = (h, third, out) => h === 'knight' ? 28 : third ? 60 : (out ? 44 : 33);
let bad = 0, n = 0; const ok = (c, m) => { n++; if (!c) bad++; console.log((c ? 'ok: ' : 'FAIL: ') + m); };

export function duel(h, seed) {
  let r = seed * 7919 + 13; const rand = Math.random; Math.random = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
  try {
    const G = { deck: DECK, sloop: [700, 900] }, S = FBM.newFight(G); S.G = G; S.sloopIn = false;
    const e = { x: DECK[0] + 300, y: 480, face: -1, mode: 'wake', modeT: 1, open: 0, hp: FB.hp, maxHp: FB.hp, w: W };
    const P = { x: DECK[0] + 40, y: 480, face: 1, atk: -1, rec: 0, combo: 0, comboT: 9, hit: false, jumpT: 0, third: false, hits: 0, tips: 0, mids: 0, hafts: 0, dealt: 0, perOpen: [], dEdge: [] };
    const c = { number() {}, sound() {}, mark() {}, hit() { return false; }, shot() {}, floorAt: () => 480, clampX: x => Math.max(DECK[0] + 5, Math.min(DECK[1] - 5, x)), deckOf: () => 0, haul() {}, sloopIn: () => false, flash() {}, ringWard() {}, fx() {}, nearest: () => P };
    const stale = { k: -1, verb: '', n: 0 }; let openN = 0, wasOpen = false, openDealt = 0, t55 = null; const mem = {};
    for (let f = 0; f < 240 * 60; f++) {
      const t = f * DT, open = FBM.fbOpen(e);
      if (open && !wasOpen) { openN++; openDealt = 0; } if (!open && wasOpen) P.perOpen.push(openDealt); wasOpen = open;
      const pl = FBM.fbLabPlan({ tip: h === 'warden' ? WARDEN_TIP : 0, noRoll: h === 'warden' && !V2, v2: V2, hero: h, rest: false, P: { x: P.x, y: P.y, face: P.face, ground: P.jumpT <= 0, atk: P.atk }, e, S, reach: LAB_REACH[h], shield: h === 'knight', t, rng: Math.random, mem });
      if (P.jumpT > 0) P.jumpT -= DT; if (pl.jump && P.jumpT <= 0) P.jumpT = 0.5;
      const swinging = P.atk >= 0;
      if (!pl.block && !swinging && pl.gx != null && Math.abs(pl.gx - P.x) > 3) P.x += Math.sign(pl.gx - P.x) * 118 * DT;
      if (!swinging) P.face = pl.face || P.face;
      if (pl.atk && !swinging && P.rec <= 0.06 && P.jumpT <= 0 && !pl.block) { P.atk = 0; P.hit = false; P.face = pl.face || P.face; P.combo = P.comboT < 0.7 ? P.combo + 1 : 1; P.comboT = 0; P.third = P.combo % 3 === 0 && h === 'warden'; }
      P.comboT += DT; if (P.rec > 0) P.rec -= DT;
      if (P.atk >= 0) {
        const was = P.atk; P.atk += DT; const live = P.third ? [0.09, 0.21] : [0.04, 0.18];
        if (!P.hit && P.atk >= live[0] && was < live[1]) {
          const rr = reachOf(h, P.third, P.atk >= 0.10), dir = P.face, bl = e.x - W / 2, br = e.x + W / 2;
          if (dir > 0 ? (bl <= P.x + rr && br >= P.x + 2) : (br >= P.x - rr && bl <= P.x - 2)) {
            P.hit = true; const d = dir > 0 ? bl - P.x : P.x - br, isOpen = FBM.fbOpen(e); let mul = 1;
            if (h === 'warden') { if (d >= tipStart(0)) { mul = isOpen ? 2.0 : tipMul(d, 28, false) * bandPay(0); P.tips++; } else if (d >= 14) { mul = 0.7; P.mids++; } else { mul = 0.3; P.hafts++; } if (P.third) mul *= 1.25; }
            const k = FBM.takeAt(e, S, { x: P.x, y: P.y }); if (k.parry) FBM.parried(e, S, c); FBM.landed(e, S, t, c);
            let st = 1; if (isOpen) { const verb = P.third ? 'heavy' : 'cut'; if (stale.k !== openN || stale.verb !== verb) { stale.k = openN; stale.verb = verb; stale.n = 1; } else { stale.n++; st = [1, 0.85, 0.7, 0.55][Math.min(stale.n, 4) - 1]; } }
            const real = Math.round(mul * DMG[h]) * Math.max(FB.k.floor, k.k) * st; e.hp -= real; P.dealt += real; P.hits++; openDealt += real; P.dEdge.push(d);
          }
        }
        if (P.atk > 0.3) { P.atk = -1; P.rec = P.third ? 0.30 : 0.084; }
      }
      FBM.stepFreebooter(e, S, DT, [{ x: P.x, y: P.y, ground: P.jumpT <= 0, alive: true }], c);
      if (S.ph === 2 || e.hp <= 0) { t55 = t; break; }
    }
    return { t55, dealt: P.dealt, hits: P.hits, tips: P.tips, mids: P.mids, hafts: P.hafts, openN, perOpen: P.perOpen, dEdge: P.dEdge, secs: t55 === null ? 240 : t55 };
  } finally { Math.random = rand; }
}
export function run(label, h) {
  const rows = []; for (let s = 1; s <= SEEDS; s++) rows.push(duel(h, s));
  const ts = rows.map(x => x.secs).sort((a, b) => a - b), med = ts[Math.floor(ts.length / 2)];
  const tot = k => rows.reduce((a, x) => a + x[k], 0), po = rows.flatMap(x => x.perOpen), pom = po.length ? po.reduce((a, b) => a + b, 0) / po.length : 0;
  const dps = tot('dealt') / tot('secs'), de = rows.flatMap(x => x.dEdge), dem = de.length ? de.reduce((a, b) => a + b, 0) / de.length : 0;
  console.log(label.padEnd(30) + ' to his 55% line: median ' + med.toFixed(0) + ' s [' + ts[0].toFixed(0) + '-' + ts[ts.length - 1].toFixed(0) + ']  dps ' + dps.toFixed(0) + '  per opening ' + pom.toFixed(0) + '  hits ' + tot('hits') + ' (tip ' + tot('tips') + ' mid ' + tot('mids') + ' haft ' + tot('hafts') + ')  mean edge d ' + dem.toFixed(1));
  return { med, dps, pom, tips: tot('tips'), mids: tot('mids'), hafts: tot('hafts'), hits: tot('hits') };
}
if (import.meta.url === new URL(process.argv[1], 'file:///').href || process.argv[1].endsWith('wardenbot-duel.mjs')) {
  console.log('seeds ' + SEEDS + (V2 ? ', v2 hands' : ', legacy hands (0.25 s reaction, 10% miss)'));
  const K = run('knight', 'knight'), Wd = run('warden', 'warden');
  ok(K.med < 200, 'the model knight takes the Freebooter to his phase-two line inside the clock (median ' + K.med.toFixed(0) + ' s)');
  ok(Wd.tips > Wd.mids * 2, 'the warden lands TIP hits, not mid-shaft ones (tip ' + Wd.tips + ', mid ' + Wd.mids + ', haft ' + Wd.hafts + ')');
  ok(Wd.med <= K.med * 1.25, 'the warden reaches his 55% line within 1.25x the knight (' + Wd.med.toFixed(0) + ' s vs ' + K.med.toFixed(0) + ' s)');
  console.log('wardenbot-duel: ' + n + ' checks, ' + (bad ? bad + ' FAILED' : 'all ok'));
  process.exit(bad ? 1 : 0);
}
