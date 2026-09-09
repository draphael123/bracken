// BRACKEN — a 16-bit forest platformer with a knight, a sword, a shield, and a plunge.
import { canvas, mulberry, fromGrid, outline } from './px.js';
import * as ART from './art.js';
import { bakeKnight, bakeSprig, bakeShield, bakeSpitter, bakeWasp, bakeSeed, bakeThornback } from './chars.js';
import { LEVEL, T, TS, tileAt, W as LW, H as LH, START } from './level.js';
import { initAudio, SFX, music, ready as audioReady, setVolume } from './audio.js';

// ---------- display ----------
const VW = 320, VH = 180;
const disp = document.getElementById('c');
const dg = disp.getContext('2d');
const [buf, g] = canvas(VW, VH);
let S = 3, offX = 0, offY = 0;
function resize() {
  disp.width = innerWidth || 1280; disp.height = innerHeight || 720;
  S = Math.max(1, Math.floor(Math.min(disp.width / VW, disp.height / VH)));
  offX = Math.floor((disp.width - VW * S) / 2); offY = Math.floor((disp.height - VH * S) / 2);
  dg.imageSmoothingEnabled = false;
}
addEventListener('resize', resize); resize();
const q = new URLSearchParams(location.search);

// ---------- settings ----------
const SET = { music: true, sfx: 0.5, shake: true };
try { Object.assign(SET, JSON.parse(localStorage.getItem('bracken.settings') || '{}')); } catch {}
function saveSettings() { try { localStorage.setItem('bracken.settings', JSON.stringify(SET)); } catch {} }
function applySettings() { setVolume(SET.sfx); music.set(SET.music); }
applySettings();

// ---------- tuning ----------
const RUN = 100, GRAV = 1000, JUMPV = -320, POGO = -330;
const SWORD_DMG = 10, PLUNGE_DMG = 20;
const DMG = { sprig: 20, shield: 25, spit: 15, wasp: 15, thorn: 30, spike: 20, seed: 15, spined: 20 };
const EHP = { sprig: 10, shield: 20, spit: 10, wasp: 10, thorn: 30 };
const ST = { swing: 12, plunge: 15, dodge: 25, blockHit: 16, hold: 9, regen: 48, delay: 0.5 };

// ---------- bake ----------
const K = bakeKnight();
const SPR = { sprig: bakeSprig(), shield: bakeShield(), spit: bakeSpitter(), wasp: bakeWasp(), seed: bakeSeed(), thorn: bakeThornback() };
const TILE = {
  dirt: [0, 1, 2, 3].map(i => ART.bakeDirt(10 + i)),
  top: {}, edge: {},
  log: [0, 1, 2].map(i => ART.bakeLog(50 + i)), logL: ART.bakeLogEnd(60, false), logR: ART.bakeLogEnd(61, true),
  thorns: [0, 1, 2, 3].map(i => ART.bakeThorns(70 + i)),
  crate: ART.bakeCrate(), roots: [0, 1, 2].map(i => ART.bakeDirtRoots(80 + i)),
};
for (const eL of [0, 1]) for (const eR of [0, 1]) {
  TILE.top[eL + '' + eR] = [0, 1, 2, 3].map(i => ART.bakeGrassTop(100 + i + eL * 7 + eR * 13, eL, eR));
  TILE.edge[eL + '' + eR] = [0, 1].map(i => ART.bakeDirtEdge(140 + i + eL * 3 + eR * 5, eL, eR));
}
const PROP = {
  acorn: ART.bakeAcorn(), coin: ART.bakeCoin(), shrine: [ART.bakeShrine(false), ART.bakeShrine(true)], gate: ART.bakeGate(), sign: ART.bakeSign(),
  tuft: [0, 1, 2, 3].map(i => ART.bakeTuft(200 + i)), flower: [0, 1, 2, 3].map(i => ART.bakeFlower(210 + i)),
  mushroom: [0, 1].map(i => ART.bakeMushroom(220 + i)), bush: [0, 1, 2].map(i => ART.bakeBush(230 + i)),
  shadow: ART.bakeShadow(6, 2),
  heart: outline(fromGrid(['.ww.ww.', 'wwwwwww', 'wLwwwww', '.wwwww.', '..www..', '...w...'], { w: '#e04848', L: '#ff9a9a' }, 1), ART.OUT),
  bolt: outline(fromGrid(['..gg.', '.gg..', 'gggg.', '..gg.', '.gg..'], { g: '#8fd160' }, 1), ART.OUT),
};
const BG = { sky: ART.bakeSky(VH), skyDusk: ART.bakeSkyDusk(VH), sun: ART.bakeSun(), far: ART.bakeFar(320, 90, 1), mid: ART.bakeMid(480, 140, 2), near: ART.bakeNear(640, 300, 3), fg: ART.bakeFG(640, VH, 4) };
// Water pools and falls that live in the pits.
const POOLS = [{ x0: 85 * TS, x1: 98 * TS, y: 26 * TS }, { x0: 161 * TS, x1: 172 * TS, y: 26 * TS }, { x0: 215 * TS, x1: 218 * TS, y: 19 * TS }, { x0: 251 * TS, x1: 255 * TS, y: 13 * TS }];
const FALLS = [{ x: 98 * TS - 9, y0: 22 * TS, y1: 26 * TS, w: 8 }, { x: 172 * TS - 9, y0: 12 * TS, y1: 26 * TS, w: 8 }, { x: 218 * TS - 9, y0: 15 * TS, y1: 19 * TS, w: 6 }, { x: 255 * TS - 9, y0: 9 * TS, y1: 13 * TS, w: 6 }];

// Per-tile sprite choice, resolved once from neighbours.
const grid0 = new Uint8Array(LEVEL.grid);
const tileSpr = new Array(LW * LH).fill(null);
const decor = [];
function resolveTiles() {
  const rnd = mulberry(7);
  decor.length = 0;
  for (let y = 0; y < LH; y++) for (let x = 0; x < LW; x++) {
    const t = tileAt(x, y); let s = null;
    if (t === T.SOLID) {
      const up = tileAt(x, y - 1), l = tileAt(x - 1, y), r = tileAt(x + 1, y);
      const eL = l === T.AIR || l === T.ONEWAY || l === T.SPIKE ? 1 : 0, eR = r === T.AIR || r === T.ONEWAY || r === T.SPIKE ? 1 : 0;
      if (up !== T.SOLID && up !== T.CRATE) {
        s = TILE.top[eL + '' + eR][(rnd() * 4) | 0];
        const roll = rnd();
        if (roll < 0.3) decor.push({ x: x * TS + ((rnd() * 8) | 0), y: y * TS - 5, c: PROP.tuft[(rnd() * 4) | 0] });
        else if (roll < 0.42) decor.push({ x: x * TS + 3 + ((rnd() * 8) | 0), y: y * TS - 6, c: PROP.flower[(rnd() * 4) | 0] });
        else if (roll < 0.5) decor.push({ x: x * TS + 2 + ((rnd() * 7) | 0), y: y * TS - 6, c: PROP.mushroom[(rnd() * 2) | 0] });
        else if (roll < 0.56 && tileAt(x + 1, y - 1) === T.AIR && tileAt(x + 1, y) === T.SOLID) decor.push({ x: x * TS - 4, y: y * TS - 15, c: PROP.bush[(rnd() * 3) | 0] });
      } else if (eL || eR) s = TILE.edge[eL + '' + eR][(rnd() * 2) | 0];
      else if (tileAt(x, y - 2) !== T.SOLID && rnd() < 0.4) s = TILE.roots[(rnd() * 3) | 0];
      else s = TILE.dirt[(rnd() * 4) | 0];
    } else if (t === T.ONEWAY) {
      const l = tileAt(x - 1, y) === T.ONEWAY, r = tileAt(x + 1, y) === T.ONEWAY;
      s = !l ? TILE.logL : !r ? TILE.logR : TILE.log[(rnd() * 3) | 0];
    } else if (t === T.SPIKE) s = TILE.thorns[(rnd() * 4) | 0];
    else if (t === T.CRATE) s = TILE.crate;
    tileSpr[y * LW + x] = s;
  }
}
resolveTiles();

// ---------- world state ----------
const P = { x: 0, y: 0, vx: 0, vy: 0, w: 10, h: 14, face: 1, ground: false, groundTile: 0, coyote: 0, jbuf: 0, abuf: 0, dbuf: 0, atk: -1, plunge: false, plungeRec: 0, canCut: false,
  hp: 100, maxHp: 100, hpShown: 100, st: 100, maxSt: 100, stDelay: 0, stFlash: 0, block: false, dodge: 0, dodgeCd: 0, inv: 0, hurt: 0, anim: 0, dead: 0, onMover: null, hitSet: new Set(), drop: 0, dust: 0, sqX: 1, sqY: 1, sqT: 0, landT: 0, guardTired: 0 };
let trail = [], killFlash = 0, fireflies = [];
let enemies = [], seeds = [], movers = [], parts = [], leaves = [], nums = [], ghosts = [];
let acorns = [], signs = [], shrines = [], gate = null;
let checkpoint = { x: START.x * TS + 8, y: (START.y + 1) * TS };
let state = 'title', time = 0, levelTime = 0, deaths = 0, got = 0, total = 0, kills = 0, pogoCount = 0, parries = 0, blocks = 0, dodges = 0;
let stop = 0, shake = 0, kick = 0, camX = 0, camY = 0, flash = 0, introSeen = false;
const collectedCrates = new Set();

function spawnEntities() {
  enemies = []; seeds = []; movers = [];
  for (const e of LEVEL.ents) {
    const px = e.x * TS + 8, py = (e.y + 1) * TS;
    const base = { x: px, y: py, vx: 0, vy: 0, face: e.face || 1, alive: true, dying: 0, anim: Math.random() * 3, flash: 0, stagger: 0 };
    switch (e.t) {
      case 'sprig': enemies.push({ ...base, t: 'sprig', w: 8, h: 10, hp: EHP.sprig, speed: 28 }); break;
      case 'shield': enemies.push({ ...base, t: 'shield', w: 10, h: 14, hp: EHP.shield, speed: 26, turnT: 0 }); break;
      case 'spit': enemies.push({ ...base, t: 'spit', w: 12, h: 12, hp: EHP.spit, timer: 1 + Math.random(), mouth: 0 }); break;
      case 'wasp': enemies.push({ ...base, t: 'wasp', hx: px, hy: py, w: 8, h: 6, hp: EHP.wasp, face: -1 }); break;
      case 'thorn': enemies.push({ ...base, t: 'thorn', w: 14, h: 8, hp: EHP.thorn, speed: 22, mode: 'walk', modeT: 0 }); break;
      case 'mover': movers.push({ x0: e.x * TS, x: e.x * TS, y: e.y * TS, w: e.len * TS, h: 8, range: e.range * TS, p: 0, dir: 1, dx: 0, speed: 36 }); break;
    }
  }
  for (let i = 0; i < LW * LH; i++) if (grid0[i] === T.CRATE && LEVEL.grid[i] !== T.CRATE) { LEVEL.grid[i] = T.CRATE; tileSpr[i] = TILE.crate; }
}
function setupLevel() {
  acorns = []; signs = []; shrines = []; total = 0;
  for (const e of LEVEL.ents) {
    const px = e.x * TS + 8, py = (e.y + 1) * TS;
    if (e.t === 'coin') { acorns.push({ x: px, y: py - 6, got: false, ph: Math.random() * 6 }); total++; }
    if (e.t === 'sign') signs.push({ x: px, y: py, text: e.text });
    if (e.t === 'check') shrines.push({ x: px, y: py, lit: false });
    if (e.t === 'gate') gate = { x: px, y: py };
  }
  for (let i = 0; i < LW * LH; i++) if (grid0[i] === T.CRATE) total++;
  spawnEntities();
}
setupLevel();

function respawn() {
  Object.assign(P, { x: checkpoint.x, y: checkpoint.y, vx: 0, vy: 0, hp: P.maxHp, hpShown: P.maxHp, st: P.maxSt, inv: 1, hurt: 0, dead: 0, atk: -1, plunge: false, onMover: null, face: 1, block: false, dodge: 0 });
  spawnEntities(); seeds = []; nums = []; ghosts = [];
}
function startGame() {
  state = 'play'; levelTime = 0; deaths = 0; kills = 0; got = 0; pogoCount = 0; parries = 0; blocks = 0; dodges = 0;
  for (const a of acorns) a.got = false; for (const s of shrines) s.lit = false; collectedCrates.clear();
  checkpoint = { x: START.x * TS + 8, y: (START.y + 1) * TS };
  if (q.get('tx')) checkpoint = { x: +q.get('tx') * TS + 8, y: (+(q.get('ty') || 21) + 1) * TS };
  respawn(); camX = P.x - VW / 2; camY = P.y - 100;
}

// ---------- intro ----------
const INTRO = [
  'The forest of Bracken has gone quiet. No birds, no woodcutters. Only the hum of wasps.',
  'Every knight the king sent came back with the same story. Most did not come back at all.',
  'Beyond the old gate lies whatever silenced the wood. You are the last one he can spare.',
];
const intro = { card: 0, chars: 0, t: 0, kx: -20 };
function startIntro() { state = 'intro'; intro.card = 0; intro.chars = 0; intro.t = 0; intro.kx = -20; introSeen = true; camX = 0; camY = LH * TS - VH; }
function introNext() { const line = INTRO[intro.card]; if (intro.chars < line.length) { intro.chars = line.length; return; } intro.card++; intro.chars = 0; if (intro.card >= INTRO.length) startGame(); }

// ---------- menu ----------
const MENU = ['Music', 'Sound', 'Screen shake', 'Resume', 'Quit to title'];
let menuI = 0, menuFrom = 'play';
function openMenu(from) { menuFrom = from; menuI = 0; state = 'menu'; }
function menuAdjust(dir) {
  const k = MENU[menuI];
  if (k === 'Music') SET.music = !SET.music; else if (k === 'Sound') SET.sfx = Math.round(Math.max(0, Math.min(1, SET.sfx + dir * 0.1)) * 10) / 10; else if (k === 'Screen shake') SET.shake = !SET.shake; else return;
  applySettings(); saveSettings(); SFX.ui();
}
function menuConfirm() {
  const k = MENU[menuI];
  if (k === 'Resume') { state = menuFrom; SFX.uiSel(); }
  else if (k === 'Quit to title') { state = 'title'; SFX.uiSel(); }
  else menuAdjust(1);
}

// ---------- input ----------
const keys = {};
let jumpPress = false, atkPress = false, dodgePress = false, pausePress = false, anyPress = false, upPress = false, downPress = false, leftPress = false, rightPress = false, confirmPress = false;
const isKey = (e, names) => names.includes(e.key) || names.includes(e.code);
const KEYS = {
  jump: ['z', 'Z', ' ', 'Space', 'ArrowUp', 'w', 'W', 'k', 'K'], atk: ['x', 'X', 'j', 'J', 'Enter'], block: ['c', 'C', 'l', 'L'], dodge: ['v', 'V', 'Shift'],
  left: ['ArrowLeft', 'a', 'A'], right: ['ArrowRight', 'd', 'D'], down: ['ArrowDown', 's', 'S'], up: ['ArrowUp', 'w', 'W'], pause: ['Escape', 'p', 'P'],
};
addEventListener('keydown', e => {
  if (e.repeat) { e.preventDefault(); return; }
  initAudio(); anyPress = true;
  if (isKey(e, KEYS.jump)) { jumpPress = true; keys.jump = true; }
  if (isKey(e, KEYS.atk)) { atkPress = true; keys.atk = true; }
  if (isKey(e, KEYS.block)) keys.block = true;
  if (isKey(e, KEYS.dodge)) { dodgePress = true; keys.dodge = true; }
  if (isKey(e, KEYS.left)) { keys.left = true; leftPress = true; }
  if (isKey(e, KEYS.right)) { keys.right = true; rightPress = true; }
  if (isKey(e, KEYS.down)) { keys.down = true; downPress = true; }
  if (isKey(e, KEYS.up)) upPress = true;
  if (isKey(e, ['z', 'Z', 'Enter', ' ', 'Space'])) confirmPress = true;
  if (isKey(e, KEYS.pause)) pausePress = true;
  if (isKey(e, ['m', 'M'])) { SET.music = !SET.music; applySettings(); saveSettings(); }
  if (isKey(e, ['r', 'R']) && state === 'play') die();
  e.preventDefault();
});
addEventListener('keyup', e => {
  if (isKey(e, KEYS.jump)) keys.jump = false;
  if (isKey(e, KEYS.atk)) keys.atk = false;
  if (isKey(e, KEYS.block)) keys.block = false;
  if (isKey(e, KEYS.dodge)) keys.dodge = false;
  if (isKey(e, KEYS.left)) keys.left = false;
  if (isKey(e, KEYS.right)) keys.right = false;
  if (isKey(e, KEYS.down)) keys.down = false;
});
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
function clearPresses() { jumpPress = atkPress = dodgePress = pausePress = anyPress = upPress = downPress = leftPress = rightPress = confirmPress = false; }

// ---------- collision ----------
const isSolid = (tx, ty) => { const t = tileAt(tx, ty); return t === T.SOLID || t === T.CRATE; };
function moveBody(b, dx, dy, allowDrop = false) {
  const r = { hitX: false, hitY: false, ground: false, groundTile: null };
  if (dx !== 0) {
    const dir = Math.sign(dx); let nx = b.x + dx;
    const top = b.y - b.h + 0.5, bot = b.y - 0.5;
    const ty0 = Math.floor(top / TS), ty1 = Math.floor(bot / TS);
    const edge = dir > 0 ? nx + b.w / 2 - 0.01 : nx - b.w / 2;
    const tx = Math.floor(edge / TS);
    for (let ty = ty0; ty <= ty1; ty++) if (isSolid(tx, ty)) { nx = dir > 0 ? tx * TS - b.w / 2 : (tx + 1) * TS + b.w / 2; r.hitX = true; break; }
    b.x = nx;
  }
  if (dy !== 0) {
    const dir = Math.sign(dy); let ny = b.y + dy;
    const l = b.x - b.w / 2 + 0.5, rr = b.x + b.w / 2 - 0.5;
    const tx0 = Math.floor(l / TS), tx1 = Math.floor(rr / TS);
    if (dir > 0) {
      const ty = Math.floor((ny - 0.01) / TS);
      for (let tx = tx0; tx <= tx1; tx++) {
        const t = tileAt(tx, ty);
        if (t === T.SOLID || t === T.CRATE) { ny = ty * TS; r.ground = true; r.hitY = true; r.groundTile = t; break; }
        if (t === T.ONEWAY && !allowDrop && b.y <= ty * TS + 0.5) { ny = ty * TS; r.ground = true; r.groundTile = t; }
      }
    } else {
      const ty = Math.floor((ny - b.h) / TS);
      for (let tx = tx0; tx <= tx1; tx++) if (isSolid(tx, ty)) { ny = (ty + 1) * TS + b.h; r.hitY = true; break; }
    }
    b.y = ny;
  }
  return r;
}
const box = b => ({ l: b.x - b.w / 2, r: b.x + b.w / 2, t: b.y - b.h, b: b.y });
const overlap = (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;

// ---------- feel helpers ----------
function burst(x, y, n, cols, spd = 70, life = 0.5, grav = 300, size = 2) {
  for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, s = spd * (0.4 + Math.random() * 0.8); parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - spd * 0.3, life: life * (0.6 + Math.random() * 0.6), max: life, col: cols[(Math.random() * cols.length) | 0], size, grav }); }
}
function sparks(x, y, dir, n = 8) { for (let i = 0; i < n; i++) { const a = (Math.random() - 0.5) * 1.6 + (dir > 0 ? 0 : Math.PI); const s = 90 + Math.random() * 120; parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 30, life: 0.25 + Math.random() * 0.2, max: 0.4, col: i & 1 ? '#fff6c8' : '#ffd36b', size: i % 3 === 0 ? 2 : 1, grav: 200 }); } }
function dust(x, y, n = 4) { for (let i = 0; i < n; i++) parts.push({ x: x + (Math.random() - 0.5) * 8, y, vx: (Math.random() - 0.5) * 40, vy: -20 - Math.random() * 20, life: 0.3, max: 0.3, col: '#c9b27c', size: 2, grav: 60 }); }
function number(x, y, txt, col) { nums.push({ x, y, txt, col, life: 0.75, vy: -38 }); }
function hitstop(t) { stop = Math.max(stop, t); }
function shakeCam(n, k = 0) { if (SET.shake) { shake = Math.max(shake, n); kick += k; } }
function squash(sx, sy, t = 0.12) { P.sqX = sx; P.sqY = sy; P.sqT = t; }
const invulnerable = () => P.inv > 0 || P.dodge > 0 || (window.BK && window.BK.god);

// ---------- damage ----------
// Returns 'blocked' | 'hit' | false.
function damagePlayer(fromX, dmg, { up = false, unblockable = false } = {}) {
  if (P.dead || invulnerable()) return false;
  const front = Math.sign(fromX - P.x) === P.face || fromX === P.x;
  if (P.block && front && !unblockable) {
    if (P.st >= ST.blockHit) {
      P.st -= ST.blockHit; P.stDelay = ST.delay; blocks++;
      P.vx = -P.face * 90; hitstop(0.05); shakeCam(1.5, -P.face * 2); SFX.block();
      sparks(P.x + P.face * 9, P.y - 8, P.face, 7);
      return 'blocked';
    }
    P.st = 0; P.stFlash = 0.5; P.block = false; SFX.guardBreak(); shakeCam(5, -P.face * 4); hitstop(0.1);
    dmg = Math.ceil(dmg / 2); P.hurt = 0.55;
    number(P.x, P.y - 22, 'GUARD BREAK', '#ffd36b');
  }
  P.hp -= dmg; P.inv = 1.1; P.hurt = Math.max(P.hurt, 0.35); P.atk = -1; P.plunge = false; P.block = false;
  const dir = Math.sign(P.x - fromX) || -P.face;
  P.vx = dir * 150; P.vy = up ? -230 : -170; P.ground = false;
  hitstop(0.08); shakeCam(5, dir * 3); flash = 0.14; SFX.hurt();
  burst(P.x, P.y - 8, 8, ['#e04848', '#ffd36b'], 60, 0.4);
  number(P.x, P.y - 20, '-' + dmg, '#ff6b6b');
  if (P.hp <= 0) die();
  return 'hit';
}
function die() {
  if (P.dead) return;
  P.dead = 1.2; deaths++; P.hp = 0; SFX.die(); shakeCam(7);
  burst(P.x, P.y - 8, 22, ['#c9d1dc', '#3d5aa8', '#c9463d'], 120, 0.9);
}
function hurtEnemy(e, dmg, fromX, plunge) {
  e.hp -= dmg; e.flash = 0.12; e.stagger = 0.35;
  if (e.t === 'thorn' && e.mode === 'charge') { e.mode = 'rest'; e.modeT = 0.7; }
  number(e.x, e.y - e.h - 6, dmg, plunge ? '#ffd36b' : '#fff6e0');
  const dir = Math.sign(e.x - fromX) || 1;
  if (e.hp <= 0) {
    e.alive = false; e.dying = 0.35; kills++; killFlash = 0.05; SFX.kill(); if (e.t === 'thorn' || e.t === 'shield') SFX.heavy();
    hitstop(0.09); shakeCam(3, dir * 2);
    const cols = e.t === 'sprig' ? ['#6faa4a', '#c9463d', '#3f6e2c'] : e.t === 'shield' ? ['#5d4a8a', '#8a5a32', '#c9d1dc'] : e.t === 'spit' ? ['#c9463d', '#f0e6c8', '#ff9a5c'] : e.t === 'thorn' ? ['#5a3a24', '#e8dcc0', '#3a2214'] : ['#e0b040', '#1b1626', '#dfe8ff'];
    burst(e.x, e.y - e.h / 2, 16, cols, 100, 0.6);
    sparks(e.x, e.y - e.h / 2, dir, 6);
  } else {
    SFX.hit(); hitstop(0.05); shakeCam(1.5, dir * 1.5);
    sparks(e.x - dir * 2, e.y - e.h / 2, dir, 5);
    if (e.t !== 'wasp' && e.t !== 'spit') e.vx = dir * (plunge ? 30 : 80);
  }
}
function breakCrate(tx, ty) {
  const i = ty * LW + tx; LEVEL.grid[i] = T.AIR; tileSpr[i] = null;
  SFX.crack(); hitstop(0.03); shakeCam(1.5);
  burst(tx * TS + 8, ty * TS + 8, 10, ['#8a5a32', '#a8743f', '#5c3a1d'], 80, 0.5, 350, 2);
  const key = tx + ',' + ty;
  if (!collectedCrates.has(key)) acorns.push({ x: tx * TS + 8, y: ty * TS + 8, got: false, ph: 0, crate: key, vy: -60 });
}

// ---------- player ----------
function attackBox() {
  if (P.plunge) return { l: P.x - 10, r: P.x + 10, t: P.y - 6, b: P.y + 12 };
  if (P.atk >= 0.04 && P.atk < 0.16) return P.face > 0 ? { l: P.x + 2, r: P.x + 19, t: P.y - 17, b: P.y - 1 } : { l: P.x - 19, r: P.x - 2, t: P.y - 17, b: P.y - 1 };
  return null;
}
function spend(cost) {
  if (P.st < cost) { P.stFlash = 0.35; return false; }
  P.st -= cost; P.stDelay = ST.delay; return true;
}
function updatePlayer(dt) {
  if (P.dead) { P.dead -= dt; if (P.dead <= 0) respawn(); return; }
  for (const k of ['inv', 'hurt', 'coyote', 'jbuf', 'abuf', 'dbuf', 'plungeRec', 'drop', 'dodgeCd', 'stFlash', 'sqT', 'stDelay', 'landT', 'guardTired']) P[k] = Math.max(0, P[k] - dt);
  if (P.stDelay <= 0 && P.st < P.maxSt) P.st = Math.min(P.maxSt, P.st + ST.regen * dt);
  P.hpShown += (P.hp - P.hpShown) * Math.min(1, dt * 6);
  const stunned = P.hurt > 0;
  const attacking = P.atk >= 0;
  const dodging = P.dodge > 0;
  P.block = !!keys.block && P.ground && !attacking && !P.plunge && !dodging && !stunned && P.guardTired <= 0 && P.st > 0;
  if (P.block) { // holding the shield up costs stamina; run dry and the arm drops for a moment
    P.st -= ST.hold * dt; P.stDelay = ST.delay;
    if (P.st <= 0) { P.st = 0; P.block = false; P.guardTired = 0.8; P.stFlash = 0.5; SFX.guardBreak(); number(P.x, P.y - 22, 'TIRED', '#ffd36b'); }
  }
  const move = (stunned || dodging) ? 0 : (keys.left ? -1 : 0) + (keys.right ? 1 : 0);
  if (P.onMover) { const m = P.onMover; if (P.x + 4 > m.x && P.x - 4 < m.x + m.w && Math.abs(P.y - m.y) < 2) P.x += m.dx; else P.onMover = null; }

  // dodge roll: i-frames, fixed burst, no steering
  if (P.dbuf > 0 && P.ground && !attacking && !stunned && !P.plunge && !dodging && P.dodgeCd <= 0) {
    P.dbuf = 0;
    if (spend(ST.dodge)) { P.dodge = 0.3; P.dodgeCd = 0.5; P.vx = P.face * 215; P.block = false; dodges++; SFX.dodge(); dust(P.x, P.y, 5); squash(1.2, 0.8, 0.1); }
  }
  if (dodging) { P.dodge -= dt; ghosts.push({ x: P.x, y: P.y, face: P.face, life: 0.22, frame: Math.floor(Math.max(0, P.dodge) * 14) % 2 }); }

  // horizontal
  const groundAtk = attacking && P.ground;
  const cap = P.block ? 32 : RUN;
  if (move && !groundAtk) {
    const acc = P.ground ? 1000 : 700;
    if (Math.abs(P.vx) > cap && Math.sign(P.vx) === move) P.vx = move * Math.max(cap, Math.abs(P.vx) - 400 * dt);
    else { P.vx += move * acc * dt; if (Math.abs(P.vx) > cap) P.vx = move * cap; }
    if (!attacking) P.face = move;
  } else if (!dodging) {
    const fr = P.ground ? (groundAtk ? 1600 : 1100) : 200;
    const s = Math.sign(P.vx); P.vx -= s * fr * dt; if (Math.sign(P.vx) !== s) P.vx = 0;
  } else { P.vx *= Math.pow(0.05, dt); }
  if (P.plunge) {
    P.vx *= Math.pow(0.15, dt);
    let best = null, bd = 30;
    for (const e of enemies) { if (!e.alive) continue; const dx = e.x - P.x, dy = (e.y - e.h) - P.y; if (dy > -6 && dy < 70 && Math.abs(dx) < bd) { bd = Math.abs(dx); best = e; } }
    if (best) P.vx += Math.sign(best.x - P.x) * Math.min(Math.abs(best.x - P.x) * 45, 700) * dt;
  }

  // jump
  if (P.jbuf > 0 && (P.ground || P.coyote > 0) && !stunned && !P.plunge && !dodging && !P.block) {
    if (keys.down && P.ground && P.groundTile === T.ONEWAY) { P.drop = 0.2; P.jbuf = 0; }
    else { P.vy = JUMPV; P.ground = false; P.coyote = 0; P.jbuf = 0; P.onMover = null; P.canCut = true; P.block = false; SFX.jump(); dust(P.x, P.y, 3); squash(0.8, 1.2, 0.1); }
  }
  if (!keys.jump && P.canCut && P.vy < -110 && !P.plunge) P.vy = -110;

  // attack / plunge
  if (P.abuf > 0 && !stunned && !P.plunge && !dodging) {
    if (!P.ground && keys.down) { P.abuf = 0; if (spend(ST.plunge)) { P.plunge = true; P.vy = Math.max(P.vy, 60); P.atk = -1; P.hitSet.clear(); SFX.slash(); } }
    else if (P.atk < 0 && P.plungeRec <= 0) { P.abuf = 0; if (spend(ST.swing)) { P.atk = 0; P.hitSet.clear(); SFX.slash(); if (P.ground) P.vx = P.face * 75; } }
  }
  if (P.atk >= 0) {
    P.atk += dt; if (P.atk > 0.3) P.atk = -1;
    if (P.atk >= 0.03 && P.atk < 0.17) { // blade tip sweeps from over the shoulder to low-forward
      const k = (P.atk - 0.03) / 0.14, ang = -1.9 + k * 2.6;
      const px0 = P.x + P.face * 2, py0 = P.y - 9;
      trail.push({ x0: px0, y0: py0, x: px0 + Math.cos(ang) * 18 * P.face, y: py0 + Math.sin(ang) * 18, life: 0.11 });
    }
  }

  // gravity
  P.vy += GRAV * dt * (P.plunge ? 1.6 : 1);
  const maxFall = P.plunge ? 340 : 270; if (P.vy > maxFall) P.vy = maxFall;

  // move
  const wasGround = P.ground, prevY = P.y;
  P.ground = false;
  const r = moveBody(P, P.vx * dt, P.vy * dt, P.drop > 0);
  if (r.hitX) P.vx = 0;
  if (r.ground) { P.ground = true; P.groundTile = r.groundTile; P.vy = 0; P.coyote = 0.1; }
  else if (r.hitY) P.vy = 0;
  if (!P.ground && wasGround && !P.onMover) P.coyote = 0.1;
  if (!P.ground && P.vy >= 0) for (const m of movers) {
    if (prevY <= m.y + 1 && P.y >= m.y && P.y <= m.y + 12 && P.x + 4 > m.x && P.x - 4 < m.x + m.w) { P.y = m.y; P.vy = 0; P.ground = true; P.groundTile = T.SOLID; P.onMover = m; P.coyote = 0.1; }
  }
  if (P.ground && !wasGround) {
    if (P.plunge) {
      const ty = Math.floor((P.y + 2) / TS); let broke = false;
      for (const tx of [Math.floor((P.x - 4) / TS), Math.floor((P.x + 4) / TS)]) if (tileAt(tx, ty) === T.CRATE) { breakCrate(tx, ty); broke = true; }
      if (broke) { P.vy = POGO; P.ground = false; P.plunge = false; P.canCut = false; SFX.pogo(); P.hitSet.clear(); squash(0.8, 1.25, 0.1); }
      else { P.plunge = false; P.plungeRec = 0.12; shakeCam(3); dust(P.x, P.y, 10); SFX.thud(); squash(1.4, 0.6, 0.14); }
    } else { dust(P.x, P.y, 4); SFX.land(); squash(1.25, 0.75, 0.1); P.landT = 0.1; }
  }
  if (P.ground && Math.abs(P.vx) > 40 && !dodging) { P.dust -= dt; if (P.dust <= 0) { P.dust = 0.18; dust(P.x - P.face * 4, P.y, 1); } }
  P.anim += dt;

  // spikes
  const pb = box(P);
  for (let ty = Math.floor(pb.t / TS); ty <= Math.floor((pb.b - 1) / TS); ty++) for (let tx = Math.floor(pb.l / TS); tx <= Math.floor((pb.r - 1) / TS); tx++) {
    if (tileAt(tx, ty) === T.SPIKE && pb.b > ty * TS + 6) damagePlayer(tx * TS + 8, DMG.spike, { up: true, unblockable: true });
  }
  if (P.y > LH * TS + 30) { die(); P.dead = 0.6; }

  // attack hits
  const hb = attackBox();
  if (hb) {
    for (const e of enemies) {
      if (!e.alive || P.hitSet.has(e)) continue;
      if (!overlap(hb, box(e))) continue;
      P.hitSet.add(e);
      if (P.plunge) {
        if (e.t === 'thorn') {
          // spined back: the blade skates off and you eat the spines
          P.plunge = false; P.ground = false; P.canCut = false; P.hitSet.clear();
          SFX.clank(); sparks(P.x, P.y + 4, P.face, 8); number(e.x, e.y - e.h - 6, 'SPINED', '#ffd36b');
          P.inv = 0; damagePlayer(e.x, DMG.spined, { up: true, unblockable: true }); P.vy = -250;
          continue;
        }
        hurtEnemy(e, PLUNGE_DMG, P.x, true); P.vy = POGO; P.ground = false; P.plunge = false; P.canCut = false; P.hitSet.clear(); SFX.pogo(); pogoCount++; squash(0.8, 1.25, 0.1); continue;
      }
      const front = Math.sign(P.x - e.x) === e.face;
      if (e.t === 'shield' && front) {
        SFX.clank(); hitstop(0.05); P.vx = e.face * 170; P.vy = Math.min(P.vy, -70); P.ground = false; e.stagger = 0.4; P.atk = 0.22; shakeCam(2, e.face * 2);
        sparks(e.x + e.face * 8, e.y - 8, e.face, 7);
      } else hurtEnemy(e, SWORD_DMG, P.x, false);
    }
    for (const s of seeds) if (!s.dead && overlap(hb, { l: s.x - 3, r: s.x + 3, t: s.y - 3, b: s.y + 3 })) { s.dead = true; parries++; SFX.parry(); sparks(s.x, s.y, P.face, 6); number(s.x, s.y - 8, 'PARRY', '#8fd160'); }
    if (!P.plunge) for (let ty = Math.floor(hb.t / TS); ty <= Math.floor((hb.b - 1) / TS); ty++) for (let tx = Math.floor(hb.l / TS); tx <= Math.floor((hb.r - 1) / TS); tx++) if (tileAt(tx, ty) === T.CRATE) breakCrate(tx, ty);
  }
  // contact damage
  const cb = { l: pb.l + 1, r: pb.r - 1, t: pb.t + 2, b: pb.b - 1 };
  for (const e of enemies) {
    if (!e.alive || e.flash > 0 || !overlap(cb, box(e))) continue;
    const res = damagePlayer(e.x, DMG[e.t]);
    if (res === 'blocked' && e.t !== 'wasp' && e.t !== 'spit') { e.vx = Math.sign(e.x - P.x) * 150; e.stagger = 0.5; if (e.t === 'thorn' && e.mode === 'charge') { e.mode = 'rest'; e.modeT = 0.9; } }
  }
  for (const s of seeds) if (!s.dead && overlap(cb, { l: s.x - 2, r: s.x + 2, t: s.y - 2, b: s.y + 2 })) { s.dead = true; damagePlayer(s.x, DMG.seed); }
  // pickups
  for (const a of acorns) {
    if (a.got) continue;
    if (a.vy !== undefined) { a.vy += 400 * dt; a.y += a.vy * dt; const ty = Math.floor((a.y + 3) / TS); if (isSolid(Math.floor(a.x / TS), ty)) { a.y = ty * TS - 3; a.vy = 0; } }
    if (Math.abs(a.x - P.x) < 10 && Math.abs(a.y - (P.y - 7)) < 12) { a.got = true; got++; SFX.acorn(); if (a.crate) collectedCrates.add(a.crate); burst(a.x, a.y, 6, ['#ffd36b', '#fff6c8'], 40, 0.35, -40, 1); }
  }
  for (const s of shrines) if (!s.lit && Math.abs(s.x - P.x) < 12 && Math.abs(s.y - P.y) < 20) { s.lit = true; checkpoint = { x: s.x, y: s.y }; P.hp = P.maxHp; P.st = P.maxSt; SFX.check(); burst(s.x, s.y - 22, 14, ['#ffd36b', '#fff6c8', '#8fd160'], 50, 0.9, -30, 1); number(s.x, s.y - 40, 'SHRINE', '#ffd36b'); }
  if (gate && Math.abs(gate.x - P.x) < 12 && Math.abs(gate.y - P.y) < 30 && state === 'play') { state = 'win'; SFX.win(); burst(gate.x, gate.y - 30, 30, ['#ffd36b', '#fff6c8', '#8fd160'], 70, 1.2, -20, 2); }
}

// ---------- enemies ----------
function updateEnemies(dt) {
  for (const e of enemies) {
    if (!e.alive) { if (e.dying > 0) e.dying -= dt; continue; }
    e.flash = Math.max(0, e.flash - dt); e.stagger = Math.max(0, e.stagger - dt); e.anim += dt;
    if (Math.abs(e.x - P.x) > 420) continue;
    if (e.t === 'wasp') { e.x = e.hx + Math.sin(e.anim * 1.3) * 5; e.y = e.hy + Math.sin(e.anim * 2.4) * 5; e.face = Math.sign(Math.cos(e.anim * 1.3)) || 1; continue; }
    if (e.t === 'spit') {
      const near = Math.abs(e.x - P.x) < 150 && Math.abs(e.y - P.y) < 90 && !P.dead;
      if (near) e.face = Math.sign(P.x - e.x) || e.face;
      e.timer -= dt; e.mouth = Math.max(0, e.mouth - dt);
      if (near && e.timer <= 0) {
        e.timer = 1.8; e.mouth = 0.3;
        const sx = e.x + e.face * 8, sy = e.y - 8, dx = P.x - sx, dy = (P.y - 7) - sy, d = Math.hypot(dx, dy) || 1, sp = 125;
        seeds.push({ x: sx, y: sy, vx: dx / d * sp, vy: dy / d * sp, dead: false, life: 3 }); SFX.spit();
      }
      continue;
    }
    // walkers
    let want = e.face * e.speed;
    if (e.t === 'shield') {
      const near = Math.abs(e.x - P.x) < 130 && Math.abs(e.y - P.y) < 40 && !P.dead;
      const wantFace = near ? (Math.sign(P.x - e.x) || e.face) : e.face;
      if (wantFace !== e.face && e.stagger <= 0) { e.turnT += dt; if (e.turnT > 0.5) { e.face = wantFace; e.turnT = 0; } } else e.turnT = 0;
      want = (near && Math.abs(e.x - P.x) > 14 && wantFace === e.face) ? e.face * e.speed : 0;
    }
    if (e.t === 'thorn') {
      const near = Math.abs(e.x - P.x) < 120 && Math.abs(e.y - P.y) < 30 && !P.dead;
      e.modeT -= dt;
      if (e.mode === 'walk' && near && e.stagger <= 0) { e.mode = 'wind'; e.modeT = 0.45; e.face = Math.sign(P.x - e.x) || e.face; }
      if (e.mode === 'wind') { want = 0; if (e.modeT <= 0) { e.mode = 'charge'; e.modeT = 1.1; SFX.charge(); } }
      else if (e.mode === 'charge') { want = e.face * 95; if (e.modeT <= 0) { e.mode = 'rest'; e.modeT = 0.8; } }
      else if (e.mode === 'rest') { want = 0; if (e.modeT <= 0) e.mode = 'walk'; }
    }
    if (e.stagger > 0) want = 0;
    e.vx += (want - e.vx) * Math.min(1, dt * (e.mode === 'charge' ? 14 : 8));
    e.vy += 1000 * dt; if (e.vy > 270) e.vy = 270;
    const aheadX = e.x + e.face * (e.w / 2 + 2), ftx = Math.floor(aheadX / TS), fty = Math.floor((e.y + 1) / TS);
    const aheadT = tileAt(ftx, fty), aheadUp = tileAt(ftx, fty - 1);
    const r = moveBody(e, e.vx * dt, e.vy * dt, false);
    if (r.ground) e.vy = 0;
    const edge = (aheadT === T.AIR || aheadT === T.SPIKE) || aheadUp === T.SPIKE;
    if (r.ground && edge && e.stagger <= 0 && Math.sign(e.vx) === e.face) {
      if (e.t === 'thorn' && e.mode === 'charge') { e.mode = 'rest'; e.modeT = 0.8; e.vx = 0; }
      else { e.face = -e.face; e.vx = 0; }
    }
    if (r.hitX) {
      if (e.t === 'thorn' && e.mode === 'charge') { e.mode = 'rest'; e.modeT = 1.0; e.stagger = 0.6; SFX.thud(); shakeCam(3); burst(e.x + e.face * 7, e.y - 4, 6, ['#c9b27c', '#e8dcc0'], 50, 0.3); }
      e.face = -e.face; e.vx = 0;
    }
  }
  for (const s of seeds) { if (s.dead) continue; s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt; if (s.life <= 0 || isSolid(Math.floor(s.x / TS), Math.floor(s.y / TS))) { s.dead = true; burst(s.x, s.y, 3, ['#ff9a5c'], 30, 0.2, 0, 1); } }
  seeds = seeds.filter(s => !s.dead);
}
function updateMovers(dt) {
  for (const m of movers) {
    const old = m.x; m.p += m.dir * m.speed / m.range * dt;
    if (m.p >= 1) { m.p = 1; m.dir = -1; } else if (m.p <= 0) { m.p = 0; m.dir = 1; }
    m.x = m.x0 + m.p * m.range; m.dx = m.x - old;
  }
}
function updateParticles(dt) {
  for (const p of parts) { p.life -= dt; p.vy += p.grav * dt; p.x += p.vx * dt; p.y += p.vy * dt; }
  parts = parts.filter(p => p.life > 0);
  for (const n of nums) { n.life -= dt; n.y += n.vy * dt; n.vy *= Math.pow(0.05, dt); }
  nums = nums.filter(n => n.life > 0);
  for (const gh of ghosts) gh.life -= dt; ghosts = ghosts.filter(gh => gh.life > 0);
  for (const t of trail) t.life -= dt; trail = trail.filter(t => t.life > 0);
  killFlash = Math.max(0, killFlash - dt);
  // fireflies drift in the near air; more of them as dusk falls
  const want = 6 + Math.round(dusk() * 14);
  if (fireflies.length < want && Math.random() < dt * 3) fireflies.push({ x: camX + Math.random() * VW, y: camY + 20 + Math.random() * (VH - 60), t: Math.random() * 6, life: 6 + Math.random() * 6 });
  for (const f of fireflies) { f.t += dt; f.life -= dt; f.x += Math.sin(f.t * 1.7) * 14 * dt; f.y += Math.cos(f.t * 1.3) * 10 * dt; }
  fireflies = fireflies.filter(f => f.life > 0 && f.x > camX - 20 && f.x < camX + VW + 20);
  if (Math.random() < dt * 2.5) leaves.push({ x: camX + Math.random() * (VW + 60) - 30, y: camY - 6, t: Math.random() * 6, life: 9, col: ['#8fd160', '#e0b040', '#c9463d', '#5aa33e'][(Math.random() * 4) | 0] });
  for (const l of leaves) { l.t += dt; l.life -= dt; l.y += 22 * dt; l.x += Math.sin(l.t * 2.2) * 18 * dt + 6 * dt; }
  leaves = leaves.filter(l => l.life > 0 && l.y < camY + VH + 10);
}
const dusk = () => Math.max(0, Math.min(1, (camX - 2700) / 1000));
function updateCamera(dt) {
  const tx = P.x + P.face * 26 - VW / 2, ty = P.y - 104;
  camX += (tx - camX) * Math.min(1, dt * 5); camY += (ty - camY) * Math.min(1, dt * 4);
  camX = Math.max(0, Math.min(LW * TS - VW, camX)); camY = Math.max(0, Math.min(LH * TS - VH, camY));
  shake = Math.max(0, shake - dt * 18); kick *= Math.pow(0.002, dt);
}

function update(dt) {
  time += dt;
  if (state === 'title') { if (pausePress) openMenu('title'); else if (anyPress) { if (introSeen || q.get('tx')) startGame(); else startIntro(); } return; }
  if (state === 'menu') {
    if (upPress) { menuI = (menuI + MENU.length - 1) % MENU.length; SFX.ui(); }
    if (downPress) { menuI = (menuI + 1) % MENU.length; SFX.ui(); }
    if (leftPress) menuAdjust(-1); if (rightPress) menuAdjust(1);
    if (confirmPress) menuConfirm();
    if (pausePress) { state = menuFrom; SFX.uiSel(); }
    return;
  }
  if (state === 'intro') {
    intro.t += dt; const line = INTRO[intro.card];
    if (intro.chars < line.length) { const n = intro.chars; intro.chars = Math.min(line.length, intro.chars + dt * 28); if (Math.floor(intro.chars) > Math.floor(n) && line[Math.floor(n)] !== ' ') SFX.text(); }
    intro.kx = Math.min(56, intro.kx + 14 * dt);
    if (confirmPress || atkPress) introNext();
    if (pausePress) startGame();
    updateParticles(dt);
    return;
  }
  if (state === 'win') { if (confirmPress) state = 'title'; updateParticles(dt); updateCamera(dt); return; }
  if (pausePress) { openMenu('play'); return; }
  // Buffer edge presses before the hitstop gate so inputs during freeze frames are kept, not dropped.
  if (jumpPress) P.jbuf = 0.12; if (atkPress) P.abuf = 0.15; if (dodgePress) P.dbuf = 0.12;
  if (stop > 0) { stop -= dt; return; }
  levelTime += dt;
  updateMovers(dt); updatePlayer(dt); updateEnemies(dt); updateParticles(dt); updateCamera(dt);
  flash = Math.max(0, flash - dt);
}

// ---------- render ----------
function text(s, x, y, col = '#fff6e0', align = 'left', size = 8) {
  g.font = size + 'px "Press Start 2P", monospace'; g.textAlign = align; g.textBaseline = 'top';
  g.fillStyle = ART.OUT; g.fillText(s, x + 1, y + 1); g.fillStyle = col; g.fillText(s, x, y);
}
function wrap(s, maxW) { const words = s.split(' '), lines = []; let cur = ''; g.font = '8px "Press Start 2P", monospace'; for (const w of words) { const t = cur ? cur + ' ' + w : w; if (g.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; } if (cur) lines.push(cur); return lines; }
function drawSet(set, key, frame, x, y, face, white, sx = 1, sy = 1, alpha = 1) {
  const src = white ? set.white : set; const dir = face < 0 ? 'L' : 'R';
  let c = key == null ? src[dir] : src[dir][key]; if (Array.isArray(c)) c = c[((frame % c.length) + c.length) % c.length];
  const ax = face < 0 ? c.width - set.ax : set.ax;
  if (sx === 1 && sy === 1 && alpha === 1) { g.drawImage(c, Math.round(x - ax), Math.round(y - set.ay)); return; }
  g.save(); g.globalAlpha = alpha; g.translate(Math.round(x), Math.round(y)); g.scale(sx, sy); g.drawImage(c, -ax, -set.ay); g.restore();
}
function drawLayer(c, f, baseY, cx, cy) {
  const w = c.width; const dY = (LH * TS - VH) - cy;
  let x = ((-cx * f) % w + w) % w; if (x > 0) x -= w;
  const y = Math.round(baseY + dY * f);
  for (; x < VW; x += w) g.drawImage(c, Math.round(x), y);
}
function bar(x, y, w, h, frac, col, ghost = null, colGhost = '#fff6e0') {
  g.fillStyle = ART.OUT; g.fillRect(x - 1, y - 1, w + 2, h + 2);
  g.fillStyle = '#2a2230'; g.fillRect(x, y, w, h);
  if (ghost !== null && ghost > frac) { g.fillStyle = colGhost; g.fillRect(x, y, Math.round(w * ghost), h); }
  g.fillStyle = col; g.fillRect(x, y, Math.round(w * Math.max(0, frac)), h);
  g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(x, y, Math.round(w * Math.max(0, frac)), 1);
}
function drawWorld(cx, cy, showPlayer) {
  g.drawImage(BG.sky, 0, 0, 1, VH, 0, 0, VW, VH);
  const dk = dusk();
  if (dk > 0) { g.globalAlpha = dk; g.drawImage(BG.skyDusk, 0, 0, 1, VH, 0, 0, VW, VH); g.drawImage(BG.sun, Math.round(VW * 0.7 - cx * 0.03), Math.round(70 - dk * 30 + ((LH * TS - VH) - cy) * 0.1)); g.globalAlpha = 1; }
  drawLayer(BG.far, 0.15, VH - 90, cx, cy);
  drawLayer(BG.mid, 0.3, VH - 140, cx, cy);
  drawLayer(BG.near, 0.55, -120, cx, cy);
  const tx0 = Math.floor(cx / TS), ty0 = Math.floor(cy / TS);
  for (let ty = ty0; ty <= ty0 + 12; ty++) for (let tx = tx0; tx <= tx0 + 21; tx++) {
    if (tx < 0 || ty < 0 || tx >= LW || ty >= LH) continue;
    const s = tileSpr[ty * LW + tx]; if (s) g.drawImage(s, tx * TS - cx, ty * TS - cy);
  }
  drawWater(cx, cy);
  for (const m of movers) { const n = m.w / TS; for (let i = 0; i < n; i++) g.drawImage(i === 0 ? TILE.logL : i === n - 1 ? TILE.logR : TILE.log[i % 3], Math.round(m.x) + i * TS - cx, m.y - cy); }
  for (const d of decor) if (d.x > cx - 30 && d.x < cx + VW + 4) g.drawImage(d.c, d.x - cx, d.y - cy);
  for (const s of signs) g.drawImage(PROP.sign, s.x - 9 - cx, s.y - 18 - cy);
  for (const s of shrines) { g.drawImage(PROP.shrine[s.lit ? 1 : 0], s.x - 10 - cx, s.y - 34 - cy); if (s.lit) { g.globalAlpha = 0.25 + Math.sin(time * 5) * 0.08; g.fillStyle = '#ffd36b'; g.beginPath(); g.arc(s.x - cx, s.y - 24 - cy, 14, 0, 7); g.fill(); g.globalAlpha = 1; } }
  if (gate) g.drawImage(PROP.gate, gate.x - 24 - cx, gate.y - 52 - cy);
  for (const a of acorns) if (!a.got && a.x > cx - 10 && a.x < cx + VW + 10) g.drawImage(PROP.coin[Math.floor(time * 8 + a.ph) % 4], a.x - 4 - cx, Math.round(a.y - 5 + Math.sin(time * 4 + a.ph) * 1.5) - cy);
  for (const e of enemies) {
    if (e.x < cx - 30 || e.x > cx + VW + 30) continue;
    if (!e.alive) { if (e.dying > 0) { const t = 1 - e.dying / 0.35; drawSet(SPR[e.t], null, 0, e.x - cx, e.y - cy, e.face, true, 1 + t * 0.9, Math.max(0.05, 1 - t * 1.1), 1 - t * 0.7); } continue; }
    if (e.t !== 'wasp') g.drawImage(PROP.shadow, Math.round(e.x) - 6 - cx, Math.round(e.y) - 2 - cy);
    const frame = e.t === 'spit' ? (e.mouth > 0 ? 2 : (Math.floor(e.anim * 1.5) % 4 === 1 ? 1 : 0)) : e.t === 'wasp' ? Math.floor(e.anim * 30) % 3 : (Math.abs(e.vx) > 4 ? Math.floor(e.anim * (e.mode === 'charge' ? 22 : 10)) % 4 : 0);
    const wind = e.t === 'thorn' && e.mode === 'wind';
    const bob = e.t === 'spit' ? Math.round(Math.sin(e.anim * 3) * 0.6) : 0;
    drawSet(SPR[e.t], null, frame, e.x - cx + (wind ? Math.round(Math.sin(e.anim * 60)) : 0), e.y - cy + bob, e.face, e.flash > 0 || (wind && Math.floor(e.anim * 12) % 2 === 0));
    if (wind) text('!', e.x - cx, e.y - e.h - 12 - cy, '#ffd36b', 'center');
  }
  for (const s of seeds) drawSet(SPR.seed, null, 0, s.x - cx, s.y + 3 - cy, 1, false);
  if (showPlayer && !P.dead) {
    for (const gh of ghosts) drawSet(K, 'roll', gh.frame, gh.x - cx, gh.y - cy, gh.face, true, 1, 1, gh.life * 2);
    const vis = P.inv <= 0 || Math.floor(P.inv * 20) % 2 === 0;
    if (vis) {
      g.drawImage(PROP.shadow, Math.round(P.x) - 6 - cx, Math.round(P.y) - 2 - cy);
      let key = 'idle', frame = Math.floor(P.anim * 3) % 4;
      if (P.hurt > 0) key = 'hurt';
      else if (P.dodge > 0) { key = 'roll'; frame = Math.floor((0.3 - P.dodge) / 0.3 * 4) * (P.face > 0 ? 1 : -1); }
      else if (P.plunge) key = 'plunge';
      else if (P.atk >= 0) { key = 'atk'; frame = P.atk < 0.04 ? 0 : P.atk < 0.10 ? 1 : P.atk < 0.17 ? 2 : P.atk < 0.24 ? 3 : 4; }
      else if (P.block) { key = 'block'; frame = Math.floor(P.anim * 2) % 2; }
      else if (!P.ground) { key = P.vy < 0 ? 'jump' : 'fall'; frame = P.vy < 0 ? (P.vy < -150 ? 0 : 1) : (P.vy > 220 ? 1 : 0); }
      else if (keys.down && Math.abs(P.vx) < 10) key = 'crouch';
      else if (P.landT > 0 && Math.abs(P.vx) < 40) key = 'land';
      else if (Math.abs(P.vx) > 10) { key = 'run'; frame = Math.floor(P.anim * 13) % 6; }
      const k = P.sqT > 0 ? P.sqT / 0.12 : 0, sx = 1 + (P.sqX - 1) * Math.min(1, k), sy = 1 + (P.sqY - 1) * Math.min(1, k);
      drawSet(K, key, frame, P.x - cx, P.y - cy, P.face, false, sx, sy);
    }
  }
  // sword trail: tapered fan of recent blade positions
  if (showPlayer && trail.length > 1) {
    for (let i = 1; i < trail.length; i++) {
      const a = trail[i - 1], b = trail[i]; const al = Math.min(1, b.life / 0.11);
      g.globalAlpha = al * 0.75; g.fillStyle = i === trail.length - 1 ? '#fff6c8' : '#ffe9a0';
      g.beginPath(); g.moveTo(b.x0 - cx, b.y0 - cy); g.lineTo(a.x - cx, a.y - cy); g.lineTo(b.x - cx, b.y - cy); g.closePath(); g.fill();
    }
    g.globalAlpha = 1;
    const tip = trail[trail.length - 1]; g.fillStyle = '#ffffff'; g.fillRect(Math.round(tip.x - cx) - 1, Math.round(tip.y - cy) - 1, 2, 2);
  }
  for (const p of parts) { g.globalAlpha = Math.min(1, p.life / p.max * 2); g.fillStyle = p.col; g.fillRect(Math.round(p.x - cx), Math.round(p.y - cy), p.size, p.size); }
  g.globalAlpha = 1;
  for (const l of leaves) { g.fillStyle = l.col; g.fillRect(Math.round(l.x - cx), Math.round(l.y - cy), 2, 2); }
  for (const f of fireflies) { const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(f.t * 4)); g.globalAlpha = a * Math.min(1, f.life); g.fillStyle = '#fff0a0'; g.fillRect(Math.round(f.x - cx), Math.round(f.y - cy), 2, 2); g.globalAlpha = a * 0.25; g.fillRect(Math.round(f.x - cx) - 1, Math.round(f.y - cy) - 1, 4, 4); }
  g.globalAlpha = 1;
  // foreground foliage, closer than the player
  drawLayer(BG.fg, 1.25, 0, cx, cy);
  // dusk tint toward the gate
  if (dk > 0) { g.globalCompositeOperation = 'multiply'; g.globalAlpha = dk * 0.55; const gr = g.createLinearGradient(0, 0, 0, VH); gr.addColorStop(0, '#8a6aa0'); gr.addColorStop(1, '#ffb070'); g.fillStyle = gr; g.fillRect(0, 0, VW, VH); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; }
  if (killFlash > 0) { g.fillStyle = 'rgba(255,255,255,' + (killFlash * 9) + ')'; g.fillRect(0, 0, VW, VH); }
  for (const n of nums) { g.globalAlpha = Math.min(1, n.life * 3); text(String(n.txt), Math.round(n.x - cx), Math.round(n.y - cy), n.col, 'center'); }
  g.globalAlpha = 1;
}
function drawWater(cx, cy) {
  for (const f of FALLS) {
    if (f.x + f.w < cx || f.x > cx + VW || f.y1 < cy || f.y0 > cy + VH) continue;
    const x = f.x - cx;
    g.fillStyle = 'rgba(190,225,240,0.55)'; g.fillRect(x, f.y0 - cy, f.w, f.y1 - f.y0);
    g.fillStyle = 'rgba(255,255,255,0.7)';
    for (let y = f.y0; y < f.y1; y += 6) { const ph = ((time * 90 + y) % 12); if (ph < 6) { g.fillRect(x + 1, y - cy, 2, 3); g.fillRect(x + f.w - 3, y + 3 - cy, 2, 3); } else g.fillRect(x + 3, y - cy, 2, 3); }
    g.fillStyle = 'rgba(240,250,255,0.35)'; for (let i = 0; i < 4; i++) { const t = (time * 1.2 + i * 0.7) % 1; g.fillRect(x - 4 - i * 3 + Math.round(Math.sin(time * 3 + i) * 2), f.y1 - 2 - t * 8 - cy, 6, 3); }
  }
  for (const p of POOLS) {
    if (p.x1 < cx || p.x0 > cx + VW || p.y > cy + VH) continue;
    const x0 = Math.max(p.x0, cx) - cx, x1 = Math.min(p.x1, cx + VW) - cx, y = p.y - cy;
    g.fillStyle = 'rgba(60,120,160,0.85)'; g.fillRect(x0, y, x1 - x0, VH);
    g.fillStyle = 'rgba(110,180,210,0.9)'; g.fillRect(x0, y, x1 - x0, 2);
    g.fillStyle = 'rgba(220,245,255,0.8)';
    for (let x = x0; x < x1; x += 10) { const ph = Math.sin(time * 2 + x * 0.3); if (ph > 0.3) g.fillRect(x + ((time * 12) % 10 | 0), y + 3 + Math.round(ph * 2), 4, 1); }
  }
}
function drawMenu() {
  g.fillStyle = 'rgba(10,14,12,0.7)'; g.fillRect(0, 0, VW, VH);
  const x = 70, y = 34, w = VW - 140, h = 112;
  g.fillStyle = 'rgba(20,16,30,0.92)'; g.fillRect(x, y, w, h); g.strokeStyle = '#ffd36b'; g.lineWidth = 1; g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  text('SETTINGS', VW / 2, y + 8, '#ffd36b', 'center');
  MENU.forEach((k, i) => {
    const yy = y + 28 + i * 15, sel = i === menuI; const col = sel ? '#fff6e0' : '#9aa39a';
    if (sel) text('>', x + 10, yy, '#8fd160');
    text(k, x + 22, yy, col);
    const v = k === 'Music' ? (SET.music ? 'ON' : 'OFF') : k === 'Sound' ? Math.round(SET.sfx * 100) + '%' : k === 'Screen shake' ? (SET.shake ? 'ON' : 'OFF') : '';
    if (v) text('< ' + v + ' >', x + w - 12, yy, col, 'right');
  });
  text('ESC close', VW / 2, y + h - 10, '#9aa39a', 'center');
}
function render() {
  const sh = SET.shake ? shake : 0;
  const cx = Math.round(camX + kick + (sh ? (Math.random() - 0.5) * sh * 2 : 0)), cy = Math.round(camY + (sh ? (Math.random() - 0.5) * sh * 2 : 0));
  if (state === 'intro') {
    drawWorld(cx, cy, false);
    drawSet(K, 'run', Math.floor(intro.t * 8) % 4, intro.kx - cx, checkpoint.y - cy, 1, false);
    const bx = 16, by = VH - 52, bw = VW - 32, bh = 40;
    g.fillStyle = 'rgba(14,10,22,0.88)'; g.fillRect(bx, by, bw, bh); g.strokeStyle = '#ffd36b'; g.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
    const line = INTRO[intro.card].slice(0, Math.floor(intro.chars)); const lines = wrap(line, bw - 16);
    lines.forEach((l, i) => text(l, bx + 8, by + 7 + i * 11, '#fff6e0'));
    if (intro.chars >= INTRO[intro.card].length && Math.floor(time * 3) % 2 === 0) text('Z', bx + bw - 12, by + bh - 11, '#8fd160', 'right');
    text('ESC skip', VW - 6, 4, '#9aa39a', 'right');
  } else {
    drawWorld(cx, cy, true);
  }
  if (flash > 0) { g.fillStyle = 'rgba(255,80,80,' + (flash * 2.5) + ')'; g.fillRect(0, 0, VW, VH); }
  for (const s of signs) if (state === 'play' && Math.abs(s.x - P.x) < 28) {
    g.font = '8px "Press Start 2P", monospace'; const w = g.measureText(s.text).width + 12; const x = Math.max(4, Math.min(VW - w - 4, Math.round(s.x - cx - w / 2)));
    g.fillStyle = 'rgba(20,16,30,0.85)'; g.fillRect(x, 30, w, 16); g.strokeStyle = '#ffd36b'; g.lineWidth = 1; g.strokeRect(x + 0.5, 30.5, w - 1, 15);
    text(s.text, x + 6, 34, '#fff6e0');
  }
  if (state === 'play' || state === 'win' || (state === 'menu' && menuFrom === 'play')) {
    g.drawImage(PROP.heart, 5, 5);
    bar(16, 6, 70, 6, P.hp / P.maxHp, P.hp > 30 ? '#e04848' : (Math.floor(time * 6) % 2 ? '#ff7a6b' : '#e04848'), P.hpShown / P.maxHp);
    g.drawImage(PROP.bolt, 6, 15);
    const low = P.stFlash > 0 && Math.floor(time * 12) % 2 === 0;
    bar(16, 16, 56, 4, P.st / P.maxSt, low ? '#ff6b6b' : '#8fd160');
    g.drawImage(PROP.coin[0], VW - 46, 5); text(got + '/' + total, VW - 36, 7, '#ffd34a');
    if (state === 'play') text(fmt(levelTime), VW / 2, 7, '#dfe8ff', 'center');
  }
  if (state === 'title') {
    const vg = g.createRadialGradient(VW / 2, VH / 2, 40, VW / 2, VH / 2, 200); vg.addColorStop(0, 'rgba(10,20,14,0.35)'); vg.addColorStop(1, 'rgba(10,20,14,0.8)'); g.fillStyle = vg; g.fillRect(0, 0, VW, VH);
    text('BRACKEN', VW / 2 + 1, 35, '#7a4a2a', 'center', 24);
    text('BRACKEN', VW / 2, 34, '#ffd36b', 'center', 24);
    text('a forest slice', VW / 2, 64, '#dfe8ff', 'center');
    text('ARROWS / WASD  move      Z  jump', VW / 2, 88, '#fff6e0', 'center');
    text('X  swing      C  block      V  dodge', VW / 2, 100, '#fff6e0', 'center');
    text('DOWN + X in the air  plunge', VW / 2, 112, '#ffd36b', 'center');
    if (Math.floor(time * 2) % 2 === 0) text('PRESS ANY KEY', VW / 2, 138, '#8fd160', 'center');
    text('ESC settings   M music   R restart', VW / 2, 164, '#9aa39a', 'center');
  }
  if (state === 'menu') drawMenu();
  if (state === 'win') {
    g.fillStyle = 'rgba(10,20,14,0.6)'; g.fillRect(40, 26, VW - 80, 130); g.strokeStyle = '#ffd36b'; g.strokeRect(40.5, 26.5, VW - 81, 129);
    text('THE GATE OPENS', VW / 2, 38, '#ffd36b', 'center', 12);
    text('time     ' + fmt(levelTime), VW / 2, 64, '#fff6e0', 'center');
    text('gold     ' + got + ' / ' + total, VW / 2, 77, '#ffd34a', 'center');
    text('foes     ' + kills, VW / 2, 90, '#fff6e0', 'center');
    text('blocks   ' + blocks + '   dodges ' + dodges, VW / 2, 103, '#fff6e0', 'center');
    text('deaths   ' + deaths, VW / 2, 116, '#fff6e0', 'center');
    if (Math.floor(time * 2) % 2 === 0) text('Z  play again', VW / 2, 138, '#8fd160', 'center');
  }
  if (P.dead && state === 'play') { g.fillStyle = 'rgba(10,6,14,' + Math.min(0.7, (1.2 - P.dead) * 1.2) + ')'; g.fillRect(0, 0, VW, VH); }
  if (!audioReady() && state === 'play') text('press a key for sound', VW - 4, VH - 12, '#9aa39a', 'right');

  if (window.BK && window.BK.sheet) {
    g.fillStyle = '#3a4a6a'; g.fillRect(0, 0, VW, VH);
    let x = 4; const row = (set, keys, y) => { for (const k of keys) { let c = k == null ? set.R : set.R[k]; const arr = Array.isArray(c) ? c : [c]; for (const f of arr) { g.drawImage(f, x, y, f.width * 2, f.height * 2); x += f.width * 2 + 4; } } };
    row(K, ['idle', 'run'], 4); x = 4; row(K, ['jump', 'fall', 'land', 'atk'], 34); x = 4; row(K, ['plunge', 'block', 'roll', 'hurt'], 64); x = 4;
    row(SPR.sprig, [null], 100); row(SPR.shield, [null], 100); x = 4; row(SPR.spit, [null], 136); row(SPR.wasp, [null], 136); row(SPR.thorn, [null], 136); row(SPR.seed, [null], 136);
  }
  dg.fillStyle = '#0b1410'; dg.fillRect(0, 0, disp.width, disp.height);
  dg.drawImage(buf, offX, offY, VW * S, VH * S);
}
const fmt = t => { const m = Math.floor(t / 60), s = Math.floor(t % 60), d = Math.floor((t * 10) % 10); return m + ':' + String(s).padStart(2, '0') + '.' + d; };

// ---------- loop ----------
let last = performance.now(), acc = 0, lastTick = 0, rafQueued = false; const STEP = 1 / 60;
function tick(now) {
  lastTick = performance.now();
  let dt = (now - last) / 1000; last = now;
  if (!(dt >= 0)) dt = 0; if (dt > 0.12) dt = 0.12;
  acc += dt;
  let n = 0;
  while (acc >= STEP && n < 8) { update(STEP); acc -= STEP; n++; clearPresses(); }
  render();
}
function frame(now) { rafQueued = false; tick(now); if (!rafQueued) { rafQueued = true; requestAnimationFrame(frame); } }
// Watchdog: embedded preview panes can report 'hidden' and starve rAF; keep painting anyway.
setInterval(() => { if (performance.now() - lastTick > 200) tick(performance.now()); }, 125);
document.getElementById('boot').remove();
window.BK = {
  P, god: false, keys, SET,
  step(n = 1) { for (let i = 0; i < n; i++) { update(STEP); clearPresses(); } render(); },
  tp(tx, ty) { P.x = tx * TS + 8; P.y = (ty + 1) * TS; P.vx = P.vy = 0; },
  reset() { Object.assign(P, { dead: 0, hp: P.maxHp, hpShown: P.maxHp, st: P.maxSt, inv: 0, hurt: 0, vx: 0, vy: 0, plunge: false, atk: -1, onMover: null, dodge: 0, dodgeCd: 0, block: false }); },
  get state() { return state; }, set state(v) { state = v; }, start() { introSeen = true; startGame(); }, intro() { startIntro(); },
  enemies: () => enemies, movers: () => movers, seeds: () => seeds, respawnEnemies: () => spawnEntities(),
  stats: () => ({ got, total, kills, deaths, levelTime, pogoCount, parries, blocks, dodges }),
  get cam() { return [camX, camY]; }, buf, g,
};
P.x = checkpoint.x; P.y = checkpoint.y; P.face = 1; camX = 0; camY = LH * TS - VH;
if (document.fonts && document.fonts.load) document.fonts.load('8px "Press Start 2P"').catch(() => {});
rafQueued = true; requestAnimationFrame(frame);
