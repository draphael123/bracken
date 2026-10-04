// tools/bandit-mystic.mjs - THE BANDIT MYSTICS held to the brief (claude/djinn2, Daniel 10-03: THE WELL TOWN's one new foe). PURE (Node) then the PAGE.
//   THE KIND            both are the goblin mage's AI (t 'gobmage') under a man's skin (cnSkin): placed only in THE BINDING WORKS, a sprite set with the mage's
//                       seven frames each, a bestiary card each, and a corpse frame (main.js DF2_CORPSE) - tools/corpses.mjs and goblin-lint hold the rest
//   THE WARDING LIGHT   a foe inside a lit lamp's light takes x0.5 (the bearer is not warded by his own lamp); outside it, whole
//   THE POUR            a pour reaches a lit lamp in front (held up or lying), not one behind; poured, it wards nobody
//   THE LAMP            the bearer killed, it drops LIT (and still wards where it lies); E takes it; ATTACK throws it; it bursts - a blow to what it hits and a
//                       LAMP FIRE on the floor that burns foes standing in it (and you)
//   EVERY BLOW TOLD     the caster's bolt (!) and rune (!!) are the mage's told windups; the bearer never bolts (main.js updateGobMage)
// PORT=6993 node tools/bandit-mystic.mjs [--static]
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MYSTIC, MYSTIC_SKIN, BEARER_SKIN, newLamp, wardOf, wardDamage, pourLamp, takeLamp, newFire, fireStep, lampWards } from '../src/bandit-mystic.js';
import { THROW_KIND } from '../src/throwables.js';
import { CALL_LINES } from '../src/hint-lines.js';
import { LEVELS } from '../src/level.js';
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; console.log('  ok  ' + m); };

/* ---- PURE ---- */
const bearer = { x: 100, y: 200, h: 22, face: 1, alive: true }, foe = { x: 140, y: 200, h: 22 }, far = { x: 100 + MYSTIC.wardR + 40, y: 200, h: 22 };
const lamp = newLamp(bearer); lamp.x = 111; lamp.y = 179;
ok(wardOf([lamp], foe) === lamp && wardDamage([lamp], foe, 10) === 10 * MYSTIC.wardMul && MYSTIC.wardMul === 0.5, 'a foe in the lamp\'s light takes HALF (' + MYSTIC.wardR + ' px round the lamp)');
ok(!wardOf([lamp], far) && wardDamage([lamp], far, 10) === 10, 'a foe outside it takes the whole blow');
ok(!wardOf([lamp], bearer), 'the bearer is not warded by his own lamp: kill him first');
ok(pourLamp([lamp], 80, 200, 1) === lamp && !pourLamp([lamp], 80, 200, -1) && !pourLamp([lamp], 111 + MYSTIC.pourR + 30, 200, -1), 'a pour reaches a lit lamp in front of you, inside ' + MYSTIC.pourR + ' px - not behind you, not far');
{ const l2 = newLamp(bearer); l2.x = 111; l2.y = 179; l2.lit = false; ok(!lampWards(l2) && !wardOf([l2], foe) && !pourLamp([l2], 80, 200, 1), 'poured out, the lamp wards nobody (and takes no second pour)'); }
{ const l3 = newLamp(bearer); l3.state = 'rest'; l3.bearer = null; l3.x = 300; l3.y = 200; ok(lampWards(l3) && wardOf([l3], { x: 320, y: 200, h: 22 }) === l3, 'dropped LIT, it still wards where it lies');
  ok(takeLamp([l3], 306, 200) === l3 && !takeLamp([l3], 360, 200), 'E takes a lying lamp at your feet (' + MYSTIC.takeR + ' px)');
  l3.state = 'carried'; ok(!lampWards(l3), 'carried by a hero (or thrown), it wards nobody'); }
{ const f = newFire(500, 200), foes = [{ x: 505, y: 200, w: 10 }], heroes = [{ x: 495, y: 200, w: 10 }]; let fb = 0, hb = 0; for (let t = 0; t < MYSTIC.fire.life + 1; t += 1 / 60) { const r = fireStep(f, foes, heroes, 1 / 60); fb += r.foes.length; hb += r.heroes.length; }
  ok(fb >= 8 && hb >= 6 && f.out, 'a LAMP FIRE burns foes standing in it (' + fb + ' ticks) and you (' + hb + '), then goes out after ' + MYSTIC.fire.life + ' s'); }
ok(THROW_KIND.lamp && THROW_KIND.lamp.vx > 0 && THROW_KIND.lamp.g > 0, 'the lamp is a row in THROW_KIND: carried and thrown by the game\'s own carry & throw');
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
for (const k of [MYSTIC_SKIN, BEARER_SKIN]) ok(main.includes("{ t: '" + k + "', name:") && main.includes('SPR.' + k + ' = MYA.bake') && new RegExp('DF2_CORPSE = \\{[^}]*' + k + ': 6').test(main), k + ': a bestiary card, a sprite set (the mage\'s frames) and a corpse frame');
ok(/e\.cnSkin !== 'lampbearer'\) \{/.test(main), 'the bearer never bolts (updateGobMage): he holds the light up, and his flare is the mage\'s told rune');
const hands = readFileSync(new URL('../src/bandit-mystic-hands.js', import.meta.url), 'utf8'), said = [...hands.matchAll(/ctx\.number\([^']*'([^']+)'/g)].map(m => m[1]);
ok(said.length >= 8 && said.every(s => CALL_LINES.has(s)), 'every line the mystics\' hands say is a teaching line in src/hint-lines.js (' + said.length + ')');
{ const L = LEVELS.find(l => l.id === 'welltown').build(), my = L.ents.filter(e => e.cnSkin === MYSTIC_SKIN || e.cnSkin === BEARER_SKIN);
  ok(my.length >= 6 && my.every(e => e.t === 'gobmage' && e.x >= L.works.x0 && e.x <= L.works.x1), 'THE WELL TOWN places ' + my.length + ' mystics, all in THE BINDING WORKS (' + my.filter(e => e.cnSkin === BEARER_SKIN).length + ' lamp-bearers)'); }
if (process.argv.includes('--static')) { console.log('bandit-mystic (static): ' + n + ' checks pass'); process.exit(0); }

/* ---- THE PAGE: the channel's bearer and his knife ---- */
const { openPage } = await import('./cdp.mjs');
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === 'welltown'); BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(4);
    const foes = () => BK.enemies(), P = BK.P, H = BK.mysticHands(), out = {};
    for (const e of foes()) if (!(e.x / 16 > 535 && e.x / 16 < 552)) e.alive = false;
    BK.tp(536, 35); for (let i = 0; i < 40; i++) { P.hp = P.maxHp; BK.sim(1); }
    const b = foes().find(e => e.alive && e.cnSkin === 'lampbearer'), k = foes().find(e => e.alive && e.t === 'cutthroat');
    const M = BK.mystics(); out.lamps = M.lamps.length; out.bearer = !!b; out.knife = !!k;
    const kk = { x: b.x + 30, y: b.y, h: k.h }; out.wardHalf = H.ward(kk, 10); out.wardFar = H.ward({ x: b.x + 300, y: b.y, h: 20 }, 10); out.wardSelf = H.ward(b, 10);
    /* THE POUR on his lamp */
    for (const e of foes()) if (e !== b) e.alive = false; b.mode = 'keep'; b.cd = 99; b.runeCd = 99; b.boltCd = 99; b.speed = 0;
    const l = M.lamps[0]; P.skin.sips = 3; P.x = l.x - 36; P.y = b.y; P.vx = 0; P.face = 1; for (let i = 0; i < 4; i++) { P.hp = P.maxHp; BK.sim(1); } P.x = l.x - 36; P.face = 1; BK.press('talk'); for (let i = 0; i < 10; i++) { P.hp = P.maxHp; BK.sim(1); }
    out.poured = !l.lit; out.sips = P.skin.sips;
    /* KILL HIM: the lamp drops (relight it to see a lit drop) */
    l.lit = true; l.doused = false; b.hp = 1; P.x = b.x - 14; P.face = 1; for (let i = 0; i < 60 && b.alive; i++) { P.hp = P.maxHp; P.x = b.x - 14; P.face = 1; if (P.atk < 0) BK.press('atk'); BK.sim(1); }
    for (let i = 0; i < 10; i++) BK.sim(1); out.dead = !b.alive; out.dropped = l.state; out.dropLit = l.lit;
    /* E TAKES IT, ATTACK THROWS IT at a scorpion: a blow and a fire */
    l.x = 552 * 16 + 8; l.y = 36 * 16;   /* (on the channel's flat floor past the trough: the throw lands on level ground) */
    P.x = l.x; P.y = l.y; P.vy = 0; for (let i = 0; i < 6; i++) { P.hp = P.maxHp; BK.sim(1); } P.x = l.x; BK.press('talk'); for (let i = 0; i < 4; i++) BK.sim(1); out.carried = P.carry === l;
    const tgt = foes().find(e => !e.alive && e.t === 'scorpion') || foes().find(e => e.t === 'scorpion'); out.tgt = !!tgt;
    if (tgt) { tgt.alive = true; tgt.hp = 200; tgt.x = P.x + 60; tgt.y = P.y; tgt.vx = 0; tgt.dead = false; }
    const hp0 = tgt ? tgt.hp : 0; P.face = 1; BK.press('atk'); for (let i = 0; i < 90; i++) { P.hp = P.maxHp; if (tgt) { if (l.state === 'fly' && l.vy > 0) tgt.x = l.x; tgt.vx = 0; } BK.sim(1); }   /* (the scorpion stands where the lamp comes down: the test is the burst and the fire, not the aim) */
    out.burst = M.n.bursts; out.fires = M.fires.length + (M.n.fireFoe > 0 ? 1 : 0); out.tgtHurt = tgt ? hp0 - tgt.hp : 0; out.fireFoe = M.n.fireFoe; out.dbg = { f: M.fires.map(f => [Math.round(f.x), f.y, +f.t.toFixed(1)]), t: tgt && [Math.round(tgt.x), Math.round(tgt.y), tgt.alive, tgt.hp] };
    return out; })()`, 300000);
  console.log('  page: ' + JSON.stringify(r));
  ok(r.lamps >= 1 && r.bearer && r.knife, 'the channel holds a lamp-bearer, his lamp, and a knife in its light');
  ok(r.wardHalf === 5 && r.wardFar === 10 && r.wardSelf === 10, 'in the page: a blow in the light lands half (10 -> ' + r.wardHalf + '), outside whole, the bearer whole');
  ok(r.poured && r.sips === 2, 'E with the skin, the lamp in front: it goes out (a sip spent)');
  ok(r.dead && r.dropped === 'rest' && r.dropLit, 'the bearer killed, his lamp drops LIT');
  ok(r.carried, 'E at the lamp takes it up (P.carry)');
  ok(r.burst >= 1 && r.tgtHurt >= MYSTIC.hitDmg * 0.5 && r.fireFoe >= 1, 'ATTACK throws it: it bursts on a foe (' + r.tgtHurt + ' taken) and its fire burns him (' + r.fireFoe + ' ticks)');
} finally { pg.close(); }
console.log('bandit-mystic: ' + n + ' checks pass');
