// src/death-fx.js — DEATH BY MATERIAL (docs/animation-audit.md: "a skeleton, a knight, a ghost and a slime all go down the same way").
// Pure: no DOM, no main.js. Proved and filmed by tools/death-fx.mjs. Not wired in.
// The game already throws the dead foe's own sprite as a corpse (main.js killEnemy ~4520: a fling, a spin, a tip, a crumple, per type).
// This LAYERS a burst of what it was made of on top: bone clatters and bounces, armour sheds plates and sparks, a spirit comes apart
// upward, rot slumps into a stain, glass sparkles, sand runs out into a heap, pages flutter. A burst is a list of particles; a few
// leave a DECAL (a stain, a heap, a scatter of bones) that fades on the floor a few seconds later.
//   const fx = deathBurst(materialOf(e.t), e.x, e.y, dir, seed)   // on the kill, dir = away from the blow
//   stepDeathFx(fx, dt, floorAt)                                    // each frame; floorAt(x) -> the floor's y under x (or null)
//   drawDeathFx(g, fx, cx, cy)                                      // after the corpses, before the hero
// Every burst is at most MAX particles and is gone in LIFE_MAX seconds; decals last DECAL_T.
export const DFX = { MAX: 24, LIFE_MAX: 2.5, DECAL_T: 4 };
const R = s => { let a = s >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };

/* MATERIAL, by foe type (anything unlisted is 'cloth': a puff of dust and a scrap, which is what a goblin goes out as) */
export const MATERIAL_OF = {
  bone: ['skeleton', 'bonecorsair', 'bonegob', 'bonearcher', 'skeletonguard', 'gildedguard', 'burieddead', 'lich'],
  rot: ['zombie', 'husk', 'mummy', 'drowned', 'apprentice'],
  spirit: ['wight', 'haunt', 'boo', 'ghostfarmer', 'ghostwife', 'ghostchild', 'shadow', 'emberwisp', 'nighthunter'],
  armour: ['hedgeknight', 'soldier', 'armour', 'tideguard', 'closedhelm', 'heavy', 'swornsword', 'marine', 'jackalguard', 'sentry', 'pike', 'lancer'],
  fur: ['bat', 'hound', 'dog', 'fox', 'greathound', 'badger', 'hare', 'squirrel', 'goat', 'ram', 'troll'],
  feather: ['crow', 'harpy', 'petrel', 'roc', 'vulture', 'raptor', 'owl', 'kite', 'fledgling'],
  chitin: ['wasp', 'weaver', 'drone', 'crab', 'scorpion', 'scarab', 'grub', 'queen'],
  slime: ['sporeling', 'spitcap', 'lurker', 'jelly', 'slime', 'hopper', 'hopper_yellow', 'hopper_blue', 'puffer', 'urchin'],
  glass: ['glassscorp', 'shardling', 'suncatcher', 'crystal', 'stalker'],
  sand: ['sandgob', 'warden', 'sandwarden', 'golem', 'ambusher'],   /* THE SAND-CLOAKED AMBUSHER goes out as the sand he hid in */
  wood: ['broom', 'scarecrow', 'topiary', 'strawking', 'piece', 'bale', 'dummy'],
  paper: ['tome', 'mimic'],
  clockwork: ['construct', 'turret', 'hourglass'],
  water: ['eel', 'lamprey', 'manta', 'siren', 'merrowcaller', 'gar', 'angler'],
};
const MAT = {}; for (const [m, ts] of Object.entries(MATERIAL_OF)) for (const t of ts) MAT[t] = m;
export const materialOf = t => MAT[t] || 'cloth';

/* each material's recipe: colours, how many of what, how they fly, whether they bounce or float, and its decal */
const RECIPE = {
  bone:     { cols: ['#ece2c8', '#c8bca0', '#8f8270'], n: 9, sizes: [[4, 1], [3, 1], [2, 2], [5, 1]], speed: 150, up: 190, grav: 900, bounce: 0.45, spin: true, special: 'skull', decal: 'bones', life: 1.8 },
  rot:      { cols: ['#7a9a5a', '#56703e', '#6a5a44'], n: 10, sizes: [[2, 2], [3, 2], [1, 1]], speed: 90, up: 120, grav: 800, bounce: 0, decal: 'stain', decalCol: '#3e4a2c', life: 1.2 },
  spirit:   { cols: ['#f4f8f0', '#d8e0d4', '#9affd0'], n: 14, sizes: [[1, 2], [2, 1], [1, 1]], speed: 30, up: 60, grav: -70, bounce: 0, float: true, fade: true, life: 1.4 },
  armour:   { cols: ['#9aa4b0', '#c8d0da', '#6a7480'], n: 7, sizes: [[4, 3], [3, 2], [5, 2]], speed: 130, up: 170, grav: 950, bounce: 0.3, spin: true, special: 'helm', sparks: 6, decal: 'plates', life: 2.0 },
  fur:      { cols: ['#8a6a4a', '#b08a5a', '#5a4430'], n: 10, sizes: [[2, 1], [1, 2], [2, 2]], speed: 60, up: 80, grav: 120, bounce: 0, float: true, fade: true, life: 1.3 },
  feather:  { cols: ['#2a2432', '#4a4458', '#e8e0d0'], n: 8, sizes: [[3, 1], [2, 1]], speed: 50, up: 90, grav: 60, bounce: 0, float: true, sway: true, fade: true, life: 2.2 },
  chitin:   { cols: ['#2a2014', '#f0c030', '#8a5a2a'], n: 9, sizes: [[2, 1], [1, 3], [3, 2]], speed: 120, up: 150, grav: 900, bounce: 0.25, spin: true, life: 1.4 },
  slime:    { cols: ['#8ac860', '#b0e080', '#4a7a3a'], n: 12, sizes: [[2, 2], [1, 1], [3, 2]], speed: 110, up: 140, grav: 900, bounce: 0, splat: true, decal: 'stain', decalCol: '#4a7a3a', life: 1.0 },
  glass:    { cols: ['#e4f4ea', '#bcd8c4', '#ffffff'], n: 12, sizes: [[2, 1], [1, 2], [1, 1]], speed: 160, up: 180, grav: 850, bounce: 0.5, sparkle: true, life: 1.6 },
  sand:     { cols: ['#d0a868', '#ecc888', '#9a7440'], n: 16, sizes: [[1, 1], [2, 1]], speed: 40, up: 30, grav: 700, bounce: 0, decal: 'heap', decalCol: '#c49860', life: 1.1 },
  wood:     { cols: ['#8a6440', '#b08458', '#d8c070'], n: 9, sizes: [[4, 1], [3, 1], [1, 3]], speed: 120, up: 160, grav: 850, bounce: 0.35, spin: true, life: 1.5 },
  paper:    { cols: ['#efe4c8', '#c9b894', '#6e2a3a'], n: 10, sizes: [[3, 2], [2, 2]], speed: 60, up: 110, grav: 70, bounce: 0, float: true, sway: true, fade: true, life: 2.3 },
  clockwork:{ cols: ['#c89a3a', '#f0cc6a', '#6a7078'], n: 8, sizes: [[3, 3], [2, 2], [4, 1]], speed: 130, up: 180, grav: 900, bounce: 0.5, spin: true, special: 'cog', sparks: 4, life: 1.8 },
  water:    { cols: ['#7ac0d8', '#e0f0f0', '#3e8ab0'], n: 12, sizes: [[1, 2], [1, 1]], speed: 90, up: 160, grav: 700, bounce: 0, fade: true, life: 0.9 },
  cloth:    { cols: ['#c8b8a0', '#a89880', '#8a6a4a'], n: 8, sizes: [[2, 2], [1, 1], [3, 2]], speed: 60, up: 70, grav: 200, bounce: 0, float: true, fade: true, special: 'scrap', life: 1.0 },
};
export const MATERIALS = Object.keys(RECIPE);

export function deathBurst(material, x, y, dir = 1, seed = 1, h = 16) {
  const M = RECIPE[material] || RECIPE.cloth, rnd = R(seed * 7919 + material.length), parts = [], decals = [];
  const add = p => { if (parts.length < DFX.MAX) parts.push(p); };
  for (let i = 0; i < M.n; i++) { const [w, hh] = M.sizes[i % M.sizes.length], a = (rnd() - 0.5) * 1.6;
    add({ x: x + (rnd() - 0.5) * 8, y: y - h * (0.2 + rnd() * 0.6), vx: dir * M.speed * (0.3 + rnd() * 0.8) * Math.cos(a) + (rnd() - 0.5) * M.speed * 0.5, vy: -M.up * (0.4 + rnd() * 0.7),
      w, h: hh, col: M.cols[i % M.cols.length], life: M.life * (0.6 + rnd() * 0.4), t: 0, grav: M.grav, bounce: M.bounce, spin: M.spin ? (rnd() - 0.5) * 20 : 0, rot: 0,
      float: !!M.float, sway: !!M.sway, fade: !!M.fade, sparkle: !!M.sparkle, ph: rnd() * 6, rest: false }); }
  if (M.special === 'skull') add({ x, y: y - h, vx: dir * 70, vy: -230, w: 4, h: 4, col: '#ece2c8', eyes: true, life: M.life, t: 0, grav: M.grav, bounce: 0.55, spin: dir * 8, rot: 0, rest: false });
  if (M.special === 'helm') add({ x, y: y - h, vx: dir * 60, vy: -240, w: 5, h: 4, col: '#b8c0cc', visor: true, life: M.life, t: 0, grav: M.grav, bounce: 0.4, spin: dir * 10, rot: 0, rest: false });
  if (M.special === 'cog') add({ x, y: y - h * 0.6, vx: dir * 90, vy: -200, w: 4, h: 4, col: '#c89a3a', cog: true, life: M.life, t: 0, grav: M.grav, bounce: 0.6, spin: dir * 14, rot: 0, rest: false });
  if (M.special === 'scrap') add({ x, y: y - h * 0.5, vx: dir * 30, vy: -60, w: 4, h: 3, col: '#8a3a3a', life: M.life * 1.2, t: 0, grav: 120, bounce: 0, float: true, sway: true, fade: true, ph: 0, rest: false });
  for (let k = 0; k < (M.sparks || 0); k++) add({ x, y: y - h * 0.5, vx: (rnd() - 0.5) * 260, vy: -rnd() * 220, w: 1, h: 1, col: '#fff4c0', life: 0.25 + rnd() * 0.2, t: 0, grav: 400, bounce: 0, spark: true, rest: false });
  if (M.decal) decals.push({ kind: M.decal, x: x + dir * 4, y, w: M.decal === 'heap' ? 10 : 14, col: M.decalCol || M.cols[1], t: 0, life: DFX.DECAL_T, grow: M.decal === 'heap' || M.decal === 'stain' });
  return { material, parts, decals, t: 0 };
}
/* one step: gravity (negative for what floats up), drag for the light things, a bounce and a slide to rest on the floor, the clock */
export function stepDeathFx(fx, dt, floorAt = () => null) {
  fx.t += dt;
  for (const p of fx.parts) { p.t += dt; if (p.rest) continue;
    const drag = p.float ? Math.pow(0.18, dt) : Math.pow(0.9, dt); p.vx *= drag; if (p.float) p.vy = p.vy * drag + p.grav * dt; else p.vy += p.grav * dt;
    if (p.sway) p.vx += Math.sin(p.t * 6 + p.ph) * 40 * dt;
    p.x += p.vx * dt; p.y += p.vy * dt; p.rot += (p.spin || 0) * dt;
    const fy = floorAt(p.x); if (fy != null && p.y >= fy && p.vy > 0) { p.y = fy; if (p.bounce && Math.abs(p.vy) > 60) { p.vy = -p.vy * p.bounce; p.vx *= 0.6; p.spin = (p.spin || 0) * 0.5; p.clack = true; } else { p.vy = 0; p.vx *= 0.3; if (!p.float) { p.rest = true; p.spin = 0; } } } }
  fx.parts = fx.parts.filter(p => p.t < p.life);
  for (const d of fx.decals) d.t += dt; fx.decals = fx.decals.filter(d => d.t < d.life);
  return fx.parts.length + fx.decals.length > 0;
}
/* draw: rects only (the house way), rotated pieces drawn as their long side turned, spirit and paper fading, glass glinting */
export function drawDeathFx(g, fx, cx = 0, cy = 0) {
  for (const d of fx.decals) { const a = Math.min(1, (d.life - d.t) / 1.2), k = d.grow ? Math.min(1, d.t / 0.4) : 1; g.globalAlpha = a; g.fillStyle = d.col;
    const w = Math.round(d.w * k), x = Math.round(d.x - cx - w / 2), y = Math.round(d.y - cy);
    if (d.kind === 'stain') { g.fillRect(x, y - 1, w, 1); g.fillRect(x + 2, y - 2, w - 4, 1); }
    else if (d.kind === 'heap') { g.fillRect(x, y - 1, w, 1); g.fillRect(x + 2, y - 2, w - 4, 1); g.fillRect(x + 4, y - 3, w - 8, 1); }
    else { g.fillRect(x, y - 1, 3, 1); g.fillRect(x + 6, y - 1, 2, 1); g.fillRect(x + 10, y - 1, 3, 1); } }
  for (const p of fx.parts) { const a = p.fade ? Math.max(0, 1 - p.t / p.life) : Math.min(1, (p.life - p.t) / 0.3); g.globalAlpha = a;
    const x = Math.round(p.x - cx), y = Math.round(p.y - cy), turned = p.spin && (Math.floor(p.rot / (Math.PI / 2)) % 2 !== 0);
    g.fillStyle = p.col; const w = turned ? p.h : p.w, hh = turned ? p.w : p.h; g.fillRect(x - (w >> 1), y - hh, w, hh);
    if (p.eyes) { g.fillStyle = '#1a1414'; g.fillRect(x - 1, y - 3, 1, 1); g.fillRect(x + 1, y - 3, 1, 1); }
    if (p.visor) { g.fillStyle = '#1a1e24'; g.fillRect(x - 1, y - 2, 3, 1); }
    if (p.cog) { g.fillStyle = '#6a4a1a'; g.fillRect(x, y - 2, 1, 1); }
    if (p.sparkle && Math.floor((p.t + p.ph) * 12) % 3 === 0) { g.fillStyle = '#ffffff'; g.fillRect(x - 1, y - hh - 1, 1, 1); } }
  g.globalAlpha = 1;
}
