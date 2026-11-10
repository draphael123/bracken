// tools/ty-art-draw.mjs (claude/tourneyart; node only): the hands' DRAW calls (src/tourney-hands.js, src/ty-champion-hands.js) run over the whole level against the node canvas
// at a camera every 160 px: no throws. `node --import ./tools/ty-on.mjs tools/ty-art-draw.mjs`
import { install, newCanvas } from './node-canvas.mjs';
install();
const { LEVELS, T, TS } = await import('../src/level.js').then(m => ({ LEVELS: m.LEVELS, T: m.T, TS: m.TS }));
const { makeTourneyHands } = await import('../src/tourney-hands.js'); const { makeChampionHands, POSE } = await import('../src/ty-champion-hands.js');
const L = LEVELS.find(l => l.id === 'tourney').build(); const P = { x: 60 * 16, y: 30 * 16, hp: 100, vx: 0, vy: 0, face: 1, ground: true };
const ens = [], F = { L, TS, T, players: () => [P], enemies: () => ens, time: () => 0, number() {}, hint() {}, sfx: {}, asPlayer: (p, f) => f(), damage() {}, upright: () => true, swordDmg: () => 30, hurt() {}, unhorse() {}, loose() {}, coins() {}, shake() {}, solidAt: () => false, moveBody: () => ({}), hitOnce: () => true, arenaMounted: () => true, lanceSquire: () => false };
const G = makeTourneyHands(F); G.reset(); F.ty = () => G; F.hero = () => P; F.EHP = { tychampion: 2800 }; F.boss = null; F.bossActive = false;
const C = makeChampionHands(F);
const cv = newCanvas(320, 180), g = cv.getContext('2d'); let n = 0;
for (let cx = 0; cx < L.W * TS - 320; cx += 160) { G.drawBack(g, cx, 380, 320, 180, 1.1); G.drawOver(g, cx, 380, 320, 180, 1.1); n++; }
P.x = 60 * 16; G.drive(P, 0.016, { right: true }); for (const v of [0, 120, 240]) { P.tyHorse.v = v; G.drawHorse(g, P, 0, 0, 1.2); G.drawLance(g, P, 0, 0, 1.2); }
G.drawArcher(g, { x: 80, y: 120, face: 1, aim: -1, mode: 'drawTell', mounted: true, vx: 60 }, 0, 0, 1);
for (const m of Object.keys(POSE)) C.drawBoss(g, { x: 100, y: 120, face: -1, vx: 100, mode: m }, 0, 0, 0.7);
console.log('ty-art-draw ok: ' + n + ' cameras, ' + Object.keys(POSE).length + ' champion poses');
