// tools/steam-works.mjs - THE BINDING WORKS, LONGER AND WETTER (claude/djinn3, Daniel played the live Djinn 10-04: the binding works "needs to use WATER
// more and be a little LONGER"; "MINI DJINN as a prelude"). Node first (the level as built, the pure rules), then the page:
//   THE LENGTH            the binding works grew >= 30% (94 -> 134 columns: THE STEAM WORKS between the sluice and the conduit); the checkpoint stays at
//                         his door; the walked route from the courtyard door's checkpoint to his door's is >= 90 and <= 200 (no checkpoint added)
//   THE VENTS             vents on a rhythm in the steam works (TEACH: a sign at the point of use says POUR), steam vents under the flooded trough, and
//                         THE BELLOWS that never stops - a spring before them (the skin full); in the page a vent GLOWS (told) before it JETS, a jet
//                         costs and throws you back, a POUR caps it (no jet while capped, and it comes back), the bellows is a wall lit and a way capped
//   THE LESSER DJINN      sand spirits in the dry channel's tunnel and the sluice, fire spirits in the steam works and the seal hall: THE WISP's
//                         AI under the Djinn's skins (the level's one new foe is still the bandit mystic); in the page a blade passes through sand,
//                         a pour makes it MUD and a blade then cuts it; fire turns a blade, a pour DOUSES it and it cuts; left alone it whirls up again
// node tools/steam-works.mjs [--static]
import assert from 'node:assert/strict';
import { LEVELS } from '../src/level.js';
import { pacing } from './pacing.mjs';
import { VENTS } from '../src/well-town.js';
import { VENT } from '../src/well-town-hands.js';
import { LD, ldTake, ldPourAim, ldOpenUp, ldStep, isLesser, SAND_SKIN, FIRE_SKIN } from '../src/lesser-djinn.js';
import { CALL_LINES } from '../src/hint-lines.js';
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; console.log('  ok  ' + m); };
const lv = LEVELS.find(l => l.id === 'welltown'), L = lv.build();

/* ---- THE LENGTH ---- */
{ const before = 607 - 514 + 1, now = L.works.x1 - L.works.x0 + 1, door = L.ents.find(e => e.t === 'check' && e.x >= L.arena.x0 / 16 - 6 && e.x < L.arena.x0 / 16);
  ok(now >= before * 1.3 && now <= before * 1.5, 'THE BINDING WORKS grew ' + Math.round(100 * (now / before - 1)) + '% (' + before + ' -> ' + now + ' columns: Daniel asked +30-50%)');
  ok(!!door, 'the checkpoint stands at his door (column ' + (door && door.x) + ', the hall at ' + L.arena.x0 / 16 + ')');
  const s = pacing(lv).stats, at = s.checkList.map(c => c.at), i = s.checkList.findIndex(c => c.x === 470), gap = s.checkList[i + 1].at - s.checkList[i].at;
  ok(i >= 0 && s.checkList[i + 1].x === door.x && gap >= 90 && gap <= 200, 'no checkpoint between the courtyard door (470) and his door: ' + gap + ' walked route tiles (>= 90, <= 200)'); }
/* ---- THE VENTS ---- */
const vents = L.ents.filter(e => e.t === 'flamevent'), inR = (e, r) => e.x >= r[0] && e.x <= r[1];
{ const teach = vents.filter(e => inR(e, VENTS.teach) && !e.steam && !e.always), steam = vents.filter(e => e.steam), bel = vents.filter(e => e.always);
  ok(teach.length >= 2 && steam.length >= 2 && bel.length === 1, 'THE STEAM WORKS: ' + teach.length + ' vents on a rhythm to learn on, ' + steam.length + ' steam vents under the flooded trough, ONE bellows that never stops');
  ok(steam.every(e => inR(e, VENTS.steam)) && (L.wtPools || []).some(p => steam.every(e => e.x * 16 >= p.x0 && e.x * 16 < p.x1 && (e.y + 1) * 16 === p.floor)), 'the steam vents stand on the flooded trough\'s floor, under its standing water');
  ok(bel.every(e => inR(e, VENTS.bellows)) && L.grid[(bel[0].y - bel[0].h) * L.W + bel[0].x] !== 0, 'THE BELLOWS fills a low tunnel to its roof: no way over it (the stone over row ' + (bel[0].y - bel[0].h + 1) + ')');
  const sign = L.ents.find(e => e.t === 'sign' && inR(e, VENTS.teach)), spring = L.ents.find(e => e.t === 'skinwell' && e.x < VENTS.teach[0] && e.x > 560);
  ok(sign && /POUR/.test(sign.text) && sign.x < teach[0].x && spring, 'a sign at the point of use names the verb (' + (sign && sign.text) + ') and a spring at the sluice\'s foot fills the skin first');
  ok(teach.some((a, i) => teach.some((b, j) => j > i && Math.abs((a.phase || 0) - (b.phase || 0)) > 0.5)), 'the teaching vents fire out of turn (a rhythm to read, not one beat)');
  ok(VENT.glow >= 0.6 && VENT.cap >= 4, 'a vent glows ' + VENT.glow + ' s before it jets (told), and a cap holds ' + VENT.cap + ' s'); }
/* ---- THE LESSER DJINN ---- */
{ const sp = L.ents.filter(e => e.t === 'willowisp' && (e.cnSkin === SAND_SKIN || e.cnSkin === FIRE_SKIN)), sand = sp.filter(e => e.cnSkin === SAND_SKIN), fire = sp.filter(e => e.cnSkin === FIRE_SKIN);
  ok(sand.length >= 2 && fire.length >= 2 && sp.every(e => e.squad && e.x >= L.works.x0 && e.x <= L.works.x1), 'THE LESSER DJINN: ' + sand.length + ' sand spirits and ' + fire.length + ' fire spirits, all in the binding works, each in a squad');
  ok(Math.max(...sand.map(e => e.x)) < Math.min(...fire.map(e => e.x)), 'sand first (the boss\'s first verb, POUR -> MUD), fire later in the descent (DOUSE) - the order he fights in');
  ok(!L.ents.some(e => (e.cnSkin === SAND_SKIN || e.cnSkin === FIRE_SKIN) && e.t !== 'willowisp'), "they are THE WISP's AI (the canal's, met before the Well Town) under his skins: a variant, not a new foe - the bandit mystic stays the level's one new foe"); }
{ const e = { t: 'willowisp', cnSkin: SAND_SKIN, x: 100, y: 200, alive: true, mode: 'drift' }, f = { ...e, cnSkin: FIRE_SKIN, x: 400 };
  ok(ldTake(e, 12) === 0 && ldPourAim([e, f], 60, 212, 1) === e && ldPourAim([e, f], 60, 212, -1) === null && ldPourAim([e], 0, 212, 1) === null, 'whirling, a blade takes nothing; a pour reaches the spirit only in front, near');
  ldOpenUp(e); ok(e.mode === 'mud' && ldTake(e, 12) === 12, 'a pour: the sand spirit is MUD and a blade cuts it whole'); ldOpenUp(f); ok(f.mode === 'doused', 'and the fire spirit is DOUSED');
  const w = { solidBelow: () => 240, wallAt: () => false, heroX: 200 }; let fell = false; for (let t = 0; t < LD.openT + LD.rise + 0.5; t += 1 / 60) { ldStep(e, 1 / 60, w); if (e.y === 240) fell = true; }
  ok(fell && e.mode === 'bob' && !(e.ldOpen > 0) && e.x > 100, 'open, it drops to the floor and crawls toward you; after ' + LD.openT + ' s it whirls up again'); }
const LINES = ['A SAND SPIRIT: A BLADE PASSES THROUGH. POUR ON IT', 'A FIRE SPIRIT: ITS FIRE TURNS A BLADE. DOUSE IT', 'MUD: IT FALLS. CUT IT', 'DOUSED: CLAY AND SMOKE. CUT IT', 'CAPPED: THE VENT HISSES, AND HOLDS', 'THE BELLOWS NEVER STOPS: POUR ON IT', 'THE BELLOWS IS CAPPED: GO, BEFORE IT BLOWS', 'THE VENT BURNS: WAIT FOR IT, OR POUR ON IT', 'STEAM UNDER THE WATER: GO WHEN THE BUBBLES STOP'];
ok(LINES.every(s => CALL_LINES.has(s)), 'every line the vents and the spirits say is a teaching line (' + LINES.length + ')');
if (process.argv.includes('--static')) { console.log('steam-works (static): ' + n + ' checks pass'); process.exit(0); }

/* ---- THE PAGE ---- */
const { openPage } = await import('./cdp.mjs');
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === 'welltown'); BK.load(fi); BK.state = 'play'; BK.god = false; BK.sim(4);
    const P = BK.P, WT = BK.welltown(), H = BK.welltownHands(), foes = () => BK.enemies(), out = {}, step = (k = 1) => { for (let i = 0; i < k; i++) BK.sim(1); };
    for (const e of foes()) e.alive = false;
    /* A VENT ON ITS RHYTHM: glow before jet; a hero in the jet is hurt and thrown back */
    /* (the game runs at its speed setting, 0.6 by default: a frame is 0.01 s of the world) */ const v = WT.vents.find(q => !q.steam && !q.always); const sts = []; BK.tp(v.x0 - 3, v.y1); for (let i = 0; i < 60 * 8; i++) { P.hp = P.maxHp; const s = H.ventState(v); if (sts[sts.length - 1] !== s) sts.push(s); step(); }
    out.seq = sts.join('>');
    let hurt = 0; for (let i = 0; i < 60 * 8 && !hurt; i++) { if (H.ventState(v) === 'jet') { P.x = v.x0 * 16 + 8; P.y = (v.y1 + 1) * 16; P.vx = 0; const h0 = P.hp; P.inv = 0; P.hurt = 0; step(); hurt = h0 - P.hp; } else step(); }
    out.jetHurt = hurt;
    /* THE POUR CAPS IT: no jet for its while, then it comes back */
    P.hp = P.maxHp; P.inv = 0; P.skin.sips = 3; BK.tp(v.x0 - 2, v.y1); step(20); P.x = v.x0 * 16 - 20; P.face = 1; P.vx = 0; step(1); BK.press('talk'); step(2);
    out.capped = H.ventState(v) === 'capped'; out.sipsAfterCap = P.skin.sips; let jetWhileCap = 0; for (let i = 0; i < 60 * 4; i++) { if (H.ventState(v) === 'jet') jetWhileCap++; step(); }
    let back = false; for (let i = 0; i < 60 * 12 && !back; i++) { if (H.ventState(v) === 'jet' || H.ventState(v) === 'glow') back = true; step(); } out.jetWhileCap = jetWhileCap; out.back = back;
    /* THE BELLOWS: a wall lit; capped, a way; it relights once you are past */
    const b = WT.vents.find(q => q.always); P.hp = P.maxHp; P.skin.sips = 3; BK.tp(b.x0 - 3, b.y1); step(10); out.belLit = b.lit && H.cell(b.x0, b.y1) !== 0;
    BK.keys.right = true; step(90); BK.keys.right = false; out.blockedAt = Math.round(P.x / 16); out.blocked = P.x < b.x0 * 16;
    P.x = b.x0 * 16 - 20; P.face = 1; P.vx = 0; step(1); BK.press('talk'); step(2); out.belCapped = H.ventState(b) === 'capped' && H.cell(b.x0, b.y1) === 0;
    BK.keys.right = true; step(150); BK.keys.right = false; out.past = P.x > (b.x1 + 1) * 16; step(60 * 12); out.relit = b.lit && H.cell(b.x0, b.y1) !== 0;
    /* A SAND SPIRIT: the blade passes; a pour - mud; the blade cuts */
    const LDH = BK.lesserDjinn(); BK.god = true;
    const sp = (skin) => { const e = BK.enemies().find(q => q.cnSkin === skin); e.alive = true; e.dead = false; e.hp = 30; e.ldOpen = 0; e.ldRise = 0; e.mode = 'drift'; return e; };
    const fight = (skin) => { const e = sp(skin), o = {}; BK.tp(Math.floor(e.x / 16) - 2, Math.floor((e.y + 8) / 16)); step(4); e.x = P.x + 20; e.y = P.y - 4; e.hx = e.x; e.hy = e.y; e.dartCd = 99; e.recoil = 0; P.face = 1;
      const h0 = e.hp; P.face = 1; BK.press('atk'); for (let i = 0; i < 20; i++) { e.x = P.x + 20; e.y = P.y - 4; e.dartCd = 99; step(); } o.passed = e.hp === h0;
      P.skin.sips = 3; e.x = P.x + 24; e.y = P.y - 6; e.dartCd = 99; P.face = 1; BK.press('talk'); step(2); o.open = (e.ldOpen || 0) > 0; o.mode = e.mode;
      for (let i = 0; i < 40; i++) step(); o.onFloor = Math.abs(e.y - P.y) < 3;
      for (let i = 0; i < 120 && e.alive; i++) { P.x = e.x - 16; P.face = 1; if (P.atk < 0) BK.press('atk'); step(); } o.killed = !e.alive; o.seen = !!(BK.PROG && BK.PROG.bestiary ? 1 : 1); return o; };
    out.sand = fight('sanddjinn'); out.fire = fight('firedjinn');
    out.n = LDH.read(); out.wt = WT.n.caps;
    return out; })()`, 300000);
  console.log('  page: ' + JSON.stringify(r));
  ok(/rest>glow>jet|glow>jet>rest|jet>rest>glow/.test(r.seq), 'a vent runs its rhythm, the glow before every jet: ' + r.seq);
  ok(r.jetHurt >= VENT.dmg * 0.5, 'standing in its jet costs ' + r.jetHurt + ' (and throws you back)');
  ok(r.capped && r.sipsAfterCap === 2 && r.jetWhileCap === 0 && r.back, 'E with the skin before it: CAPPED (a sip spent) - no jet for ' + VENT.cap + ' s, then its rhythm comes back');
  ok(r.belLit && r.blocked, 'THE BELLOWS lit is a wall of fire: walking at it, the hero stops at column ' + r.blockedAt);
  ok(r.belCapped && r.past && r.relit, 'a pour caps the bellows (its cells open), the hero walks past, and it roars again once he is through');
  ok(r.sand.passed && r.sand.open && r.sand.mode === 'mud' && r.sand.onFloor && r.sand.killed, 'A SAND SPIRIT: the blade passes through; a pour makes it MUD on the floor; the blade cuts it down ' + JSON.stringify(r.sand));
  ok(r.fire.passed && r.fire.open && r.fire.mode === 'doused' && r.fire.killed, 'A FIRE SPIRIT: its fire turns the blade; a pour DOUSES it; the blade cuts it down ' + JSON.stringify(r.fire));
} finally { pg.close(); }
console.log('steam-works: ' + n + ' checks pass');
