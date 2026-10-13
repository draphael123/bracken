// tools/damage-caps.mjs - A BOSS'S OPENING CAP IS ON WHAT LANDS (claude/capsfix, the damage-caps audit of 10-11). Fails when:
//   a boss that counts its per-opening cap EARLY in hurtEnemy0 (before the mix-up chain x1.3, the riposte opening x1.5, a poise-broken x1.5 and a hero talent's x2 are
//   multiplied on) lets more than its cap through one opening. Six bosses count early and each has a fix function that main.js calls after the multipliers:
//     the Wicker Man (WM.fireCap), the Archmage (0.18 of his health an opening, a twelfth through the familiar's eye, and the stage's gate floor), the Glass Colossus
//     (COL.openCap a crack, COL.legPurse a knee), the Great Drill (DRILL.jamCap a jam), the Goblin Huntmaster (HM.hitCap blows' worth, landed), the Grandmother
//     (GRAN.purse her back, GRAN.rapPurse her rap)
//   PAGE (the real bosses, each level loaded, a hero's blows through hurtAs -> hurtEnemy): for every boss and each way a blow can grow after the count - the chain at its
//   5 pips (x1.30), the chain + a riposte opening (x1.95), + a poise-broken blow (x2.93), and a x2 talent-shaped blow (e.sunder) on top - twelve full-sized blows are struck
//   into ONE opening and the health it lost must be no more than the cap says (and more than nothing: a test that lands nothing proves nothing)
//   node tools/damage-caps.mjs            (PORT from tools/ports.mjs)
import { openPage } from './cdp.mjs';

const bad = [], ok = (c, m) => { if (!c) bad.push(m); };
const pg = await openPage({ audio: false, fonts: false });
let R;
try {
  await pg.reload();
  R = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; BK.SET.speed = 1;
    const out = {}, K = BK.keys, none = () => { for (const k of ['left','right','up','down','jump','block','atk']) K[k] = false; };
    const boot = (id) => { none(); BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === id)); BK.state = 'play'; BK.god = true;
      const A = BK.L.arena; if (A && A.carpet) { BK.board(); BK.sim(150); return BK.boss; }
      BK.tp(Math.round(A.trigger / 16) + (A.reverse ? -1 : 1), Math.round(A.floor / 16) - 1); BK.sim(150); return BK.boss; };
    /* the ways a blow grows after its cap counted it */
    const VARIANTS = { chain: { pips: 5 }, chainRip: { pips: 5, rip: 1 }, chainRipBroken: { pips: 5, rip: 1, broken: 1 }, x2: { pips: 5, rip: 1, broken: 1, sunder: 1 } };
    const strike = (b, v, dmg, fromX) => { const P = BK.P; P.mixN = v.pips; P.mixLast = 'light'; P.mixAt = 1e9; b.rpOpenT = v.rip ? 9 : 0; b.rpWardT = 0; b.broken = v.broken ? 9 : 0; b.sunder = v.sunder ? 9 : 0; P.heavy = false;
      const h0 = b.hp; BKT.hurtAs('light', b, dmg, fromX, false); b.flash = 0; b.stagger = 0; b.poiseCd = 9; return h0 - b.hp; };
    /* one opening: setup() opens it, then twelve blows; returns what was lost and what the boss's own counter says */
    const run = (b, name, setup, read, dmg, fromX, live = () => true) => { const res = {}; for (const [vn, v] of Object.entries(VARIANTS)) { setup(); let lost = 0, n = 0; const each = []; for (let i = 0; i < 12 && live(); i++) { const d = strike(b, v, dmg, typeof fromX === 'function' ? fromX() : fromX); lost += d; n++; each.push(+d.toFixed(1)); } res[vn] = { lost: +lost.toFixed(2), n, each, read: read() }; } out[name] = res; };

    const quiet = e => { e.T = Object.assign(e.T || {}, { ward: 99, blink: 99, bolt: 99, rend: 99, room: 99, pair: 99, cast: 99 }); };
    const tryBoot = async (name, f) => { try { await f(); } catch (err) { out[name] = { error: String(err && err.stack || err).slice(0, 400) }; } };

    /* THE WICKER MAN (the fair): in its fire */
    await tryBoot('wicker', async () => { boot('fair'); const wm = BK.enemies().filter(e => e.t === 'wickerman').sort((a, c) => a.x - c.x)[0]; for (const q of BK.enemies()) if (q !== wm) q.alive = false; BK.tp(Math.floor((wm.x - 120) / 16), Math.floor(wm.y / 16) - 1); BK.sim(60);
      const H = BK.wickerMan(), WM = (await import('/src/wicker-man.js')).WM, full = wm.hp0 || wm.maxHp || WM.hp;
      const WMOD = await import('/src/wicker-man.js'); const setup = () => { wm.alive = true; wm.hp = full; if (!wm.st) wm.st = WMOD.newWickerMan(wm.x, wm.y, wm.face || -1); wm.st.mode = 'burn'; wm.mode = 'burn'; wm.st.fireTaken = 0; wm.st.t = 5; };   /* (the fire only: once it is stamped out, a blow on the standing wicker is a scratch by design) */
      run(wm, 'wicker', setup, () => +(wm.st.fireTaken || 0).toFixed(2), 25, wm.x - 40, () => wm.st.mode === 'burn'); out.wicker.cap = WM.fireCap * full; });

    /* THE GLASS COLOSSUS (glasssea): a cracked chest struck at chest height; a knee's purse struck at the foot */
    await tryBoot('colossus', async () => { const b = boot('glasssea'); const H = BK.colossusHands(), CG = await import('/src/glass-colossus.js'), S = H.fight(), COL = CG.COL, G = S.G;
      const chestY = G.floor - 4 * G.TS, footY = G.floor - 1;
      const setupC = () => { b.alive = true; b.hp = b.maxHp * 0.95; S.ward = 0; S.openTaken = 0; b.mode = 'cracked'; b.open = 5; BK.P.y = chestY; BK.P.vy = 0; };
      run(b, 'colossus', setupC, () => +S.openTaken.toFixed(2), 25, b.x - 40); out.colossus.cap = COL.openCap * b.maxHp;
      const setupL = () => { b.alive = true; b.hp = b.maxHp * 0.95; S.ward = 0; b.mode = 'idle'; b.open = 0; S.legPurse = b.maxHp * COL.legPurse[0]; BK.P.y = footY; BK.P.vy = 0; };
      run(b, 'colossusLegs', setupL, () => +S.legPurse.toFixed(2), 25, b.x - 40); out.colossusLegs.cap = COL.legPurse[0] * b.maxHp; });

    /* THE GREAT DRILL (minecart): a jam */
    await tryBoot('drill', async () => { const b = boot('minecart'); const H = BK.drillHands(), GD = await import('/src/great-drill.js'), S = H.fight();
      const setup = () => { b.alive = true; b.hp = b.maxHp * 0.95; S.ward = 0; S.openTaken = 0; b.mode = 'jammed'; b.open = 4; };
      run(b, 'drill', setup, () => +S.openTaken.toFixed(2), 25, b.x - 40); out.drill.cap = GD.DRILL.jamCap * b.maxHp; });

    /* THE GOBLIN HUNTMASTER (rootway): an opening is HM.hitCap blows' worth, landed at his open multiplier */
    await tryBoot('huntmaster', async () => { const b = boot('rootway'); const H = BK.huntmaster(), HM = (await import('/src/huntmaster.js')).HM, F = H.fight();
      const setup = () => { b.alive = true; b.hp = b.maxHp * 0.95; b.mode = 'open'; b.open = 4; b.openT0 = 4; b.openHits = 0; b.hitCap = HM.hitCap; b.capLeft = HM.hitCap * HM.blowRef; b.openMul = HM.openMul; b.ward = 0; };
      run(b, 'huntmaster', setup, () => +(b.capLeft).toFixed(2), 15, b.x - 40, () => b.mode === 'open' && b.open > 0); out.huntmaster.cap = HM.hitCap * HM.blowRef * HM.openMul; });

    /* THE GRANDMOTHER (underleaf): her back and her rap */
    await tryBoot('grandmother', async () => { const b = boot('underleaf'); const GR = (await import('/src/hush-hands.js')).GRAN;
      const setupB = () => { b.alive = true; b.hp = b.maxHp * 0.95; b.ward = 0; b.purseLeft = undefined; b.purseShut = false; b.mode = 'turned'; b.modeT = 5; b.face = 1; };
      run(b, 'grandmotherBack', setupB, () => b.purseLeft === undefined ? -1 : +b.purseLeft.toFixed(2), 25, b.x - 40); out.grandmotherBack.cap = GR.purse * b.maxHp;
      const setupR = () => { b.alive = true; b.hp = b.maxHp * 0.95; b.ward = 0; b.purseLeft = undefined; b.purseShut = false; b.mode = 'rap'; b.modeT = 5; };
      run(b, 'grandmotherRap', setupR, () => b.purseLeft === undefined ? -1 : +b.purseLeft.toFixed(2), 25, b.x - 40); out.grandmotherRap.cap = GR.rapPurse * b.maxHp; });

    /* (claude/pyramidboss) THE TOMB-KING'S SARCOPHAGUS (the Sealed Pyramid): one window (tipped over), counted in wardedDamage after every multiplier (src/tomb-king.js takeBlow) */
    await tryBoot('tombking', async () => { const b = boot('sealedpyramid'); const H = BK.tombKingHands(), TKM = await import('/src/tomb-king.js'), S = H.show();
      const setup = () => { b.alive = true; b.hp = b.maxHp * 0.95; S.ward = 0; S.openTaken = 0; b.mode = 'flipped'; b.open = 4; b.openKind = 'weight'; };
      run(b, 'tombking', setup, () => +S.openTaken.toFixed(2), 25, b.x - 40, () => TKM.tkOpen(b)); out.tombking.cap = TKM.TK.openCap * b.maxHp; });

    /* THE ARCHMAGE (the Mage's Folly): the duel's opening (a fifth), the familiar's eye (a twelfth) and the gate under his health */
    await tryBoot('archmage', async () => { none(); BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'mage')); BK.state = 'play'; BK.god = true; BK.sim(30);
      const A = BK.L.arena; BK.look(A.trigger / 16 + 2, A.floor / 16 - 1); for (let i = 0; i < 900 && !(BK.bossActive && BK.boss && BK.boss.mode === 'idle'); i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); }
      const e = BK.boss; quiet(e); const R0 = BK.mg().A;
      const setup = fam => () => { e.alive = true; e.hp = e.maxHp * 0.95; e.stage = 1; e.fam = fam; e.mode = 'open'; e.modeT = 3; e.open = 3; e.openTaken = 0; e.openHits = 0; e.openHitT = -9; e.capShut = false; e.capLeft = undefined; e.greedLog = []; };
      run(e, 'archmage', setup(false), () => +(e.openTaken || 0).toFixed(2), 25, e.x - 40, () => e.open > 0); out.archmage.cap = e.maxHp * 0.18;
      /* (the familiar's eye - e.fam, a twelfth - is not reached since claude/folly3: the rooms run him to the end, so only the duel is struck here) */
      /* the gate: a blow clamped to the room above the stage floor is not carried past it by what multiplies it later */
      const gate = e.maxHp * 0.66; out.archmageGate = {}; for (const [vn, v] of Object.entries(VARIANTS)) { e.alive = true; e.fam = false; e.stage = 1; e.hp = gate + 20; e.mode = 'idle'; e.open = 0; strike(e, v, 25, e.x - 40); out.archmageGate[vn] = { lost: +(gate + 20 - e.hp).toFixed(2), left: +(e.hp - gate).toFixed(2) }; }
      out.archmage.runes = !!R0; });

    return out; })()`);
} finally { pg.close(); }
const CAPS = ['wicker', 'colossus', 'colossusLegs', 'drill', 'huntmaster', 'grandmotherBack', 'grandmotherRap', 'archmage', 'tombking'];   /* (claude/pyramidboss: THE TOMB-KING's window) */
for (const name of CAPS) { const r = R[name]; if (!r || r.error) { bad.push(name + ': the fight could not be set up: ' + (r && r.error)); continue; }
  for (const [vn, v] of Object.entries(r)) { if (vn === 'cap' || vn === 'runes') continue;
    ok(v.lost <= r.cap + 1, name + ' / ' + vn + ': one opening took ' + v.lost + ' of its health, its cap is ' + r.cap.toFixed(1) + ' (blows ' + JSON.stringify(v.each) + ')');
    ok(v.lost >= r.cap * 0.25 && v.n >= 1, name + ' / ' + vn + ': the opening landed almost nothing (' + v.lost + ' of a cap of ' + r.cap.toFixed(1) + '): the test proves nothing'); } }
/* THE GATE: no blow, however it grew, takes the Archmage past the stage's floor (a spell he has not cast yet) */
if (R.archmageGate) for (const [vn, v] of Object.entries(R.archmageGate)) ok(v.left >= 0, 'archmage gate / ' + vn + ': a blow took him ' + (-v.left) + ' below the stage floor');
else bad.push('archmage gate: not measured');
if (bad.length) { console.log(['FAIL damage-caps:', ...bad].join("\n  ")); process.exit(1); }
console.log('damage-caps ok: ' + CAPS.length + ' caps hold under the chain, the riposte opening, a broken foe and a x2 talent blow');
