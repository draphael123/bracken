/* src/foe-variety.js - THE FOE VARIETY pass (claude/foevariety, Daniel 11-05 live: "the goblin with no weapon that just walks at you is boring; ARCHER VARIANTS - fire
   archers, rock archers, etc. - and make enemies FEEL impactful").
   Everything here is a SKIN on a proven AI, so the cost is a palette, a projectile look and an effect - no new brain:
     CLUB GOBLIN   (cnSkin 'clubsprig')   the sprig, armed: same TOLD bite-hop (a yellow ! and a sit-back), but with a club - reach 42 not 34, and a hit that LANDS throws you back
                                          (the shield goblin's shove). The hop is still the only thing that hurts; a touch is nothing.
     FIRE ARCHER   (cnSkin 'firearcher')  the archer in embers: a burning arrow with a flame head and an ember trail; where it lands it leaves the fire patch the game's fire
                                          arrows always left (src/main.js seeds: s.fire), and the draw glints orange at the bow so you SEE it before the loose.
     ROCK ARCHER   (cnSkin 'rockarcher')  the archer with a sling: a tumbling stone on the same arcing flight; where it lands (floor or wall) it SHATTERS into three small shards
                                          that skip away (6 damage each, short-lived, a parry or a shield kills them). Dust trail; a grey glint at the bow.
     VENOM ARCHER  (cnSkin 'venomarcher') the archer in the marsh's palette: a green arrow dripping venom; a hit that lands POISONS (the game's own poisonPlayer), a block does not.
   A shot of any variant is still an ARROW to the rest of the game: s.arrow + s.owner, so a parry / a reflected cut sends it home to the archer exactly as the base arrow does.
   Level data names a variant by its cnSkin alone (tools/foe-cast.mjs counts a skin as its own kind); this file gives the enemy its flags at spawn (spawned) and the shot its look
   and effects (loosed / fly / landed / onHit / draw). Art: palette swaps of the archer (bakeArcher(palette)) and a club laid over the sprig's own frames. */
import { bakeArcher } from './chars.js';
import { canvas, flipX, whiten, outline } from './px.js';

export const OUT = '#1b1626';
export const SKINS = {
  firearcher: { fv: 'fire', name: 'FIRE ARCHER', col: ['#ff9a5c', '#ffd36b', '#c9463d'], tell: 'hiss' },
  rockarcher: { fv: 'rock', name: 'ROCK ARCHER', col: ['#9aa39a', '#c9d1dc', '#5a6470'], tell: 'thud' },
  venomarcher: { fv: 'venom', name: 'VENOM ARCHER', col: ['#a6e04a', '#d8ff98', '#4a8a24'], tell: 'hiss' },
};
export const ARCHER_PAL = {
  firearcher: { H: '#b8431f', b: '#5a2a1a', g: '#d9823a', G: '#9a5420', r: '#ff7a2c', R: '#a8401a', e: '#ffe9a0', w: '#3a2214', a: '#ffd36b' },
  rockarcher: { H: '#6e675c', b: '#7a6a54', g: '#7c9a5a', G: '#566e3c', r: '#a89878', R: '#7a6c52', e: '#f3f0d2', w: '#8a6a42', a: '#bdb5a0' },
  venomarcher: { H: '#5a2f7a', b: '#2e4a2a', g: '#b4d63a', G: '#7a9a22', r: '#8a3ab0', R: '#5a2478', e: '#f0ff90', w: '#3a2a4a', a: '#a6e04a' },
};
export const CLUB_SKIN = 'clubsprig';
export const CLUB = { reach: 42, knock: 170 };   /* the bite's trigger distance (the sprig's is 34) and the throw on a club that lands */
export const SHARD = { dmg: 6, n: 3, life: 0.6 };
export const isVariant = s => !!SKINS[s] || s === CLUB_SKIN;

/* the sprig's own frames with a club laid over them: held low at the side while it walks (frames 0-4, 7), raised over the head on the tell (5), thrust out on the bite (6) */
function clubOver(base) {
  const frames = base.R.map((f, i) => {
    const [d, g] = canvas(f.width, f.height); g.drawImage(f, 0, 0);
    const [o, k] = canvas(f.width, f.height), W = f.width, px = (x, y, c) => { k.fillStyle = c; k.fillRect(x | 0, y | 0, 1, 1); };
    const wood = '#8a5a32', dark = '#5c3a1d', band = '#c9d1dc';
    if (i === 5) { for (let y = 3; y <= 7; y++) { px(W - 2, y, wood); px(W - 3, y, dark); } for (let y = 0; y <= 2; y++) for (let x = W - 4; x <= W - 1; x++) px(x, y, y === 0 || x === W - 4 ? wood : dark); px(W - 3, 3, band); }
    else if (i === 6) { for (let x = W - 6; x <= W - 1; x++) { px(x, 6, wood); px(x, 7, dark); } for (let y = 4; y <= 8; y++) px(W - 1, y, y === 4 || y === 8 ? dark : wood); }
    else { for (let y = 5; y <= 9; y++) { px(W - 2, y, wood); px(W - 3, y, dark); } for (let y = 2; y <= 4; y++) for (let x = W - 4; x <= W - 1; x++) px(x, y, y === 2 || x === W - 4 ? wood : dark); px(W - 3, 5, band); }
    outline(o, OUT); g.drawImage(o, 0, 0); return d;
  });
  return { R: frames, L: frames.map(c => flipX(c)), white: { R: frames.map(c => whiten(c)), L: frames.map(c => flipX(whiten(c))) }, ax: base.ax, ay: base.ay, w: base.w, h: base.h };
}
/* bake every variant into SPR (called once from src/main.js after SPR.sprig and SPR.archer exist) */
export function bake(SPR) {
  for (const k of Object.keys(ARCHER_PAL)) SPR[k] = bakeArcher(ARCHER_PAL[k]);
  if (SPR.sprig) SPR[CLUB_SKIN] = clubOver(SPR.sprig);
}

/* AT SPAWN: the enemy's flags from its skin. A fire archer placed before this pass (fire: true, no skin) wears the fire archer's look too. */
export function spawned(en) {
  if (!en) return;
  if (en.t === 'archer' && en.fire && !en.cnSkin && !en.bone && !en.elite && !en.horn && !en.juggler && !en.bandit && !en.flyman) en.cnSkin = 'firearcher';
  const row = en.t === 'archer' && SKINS[en.cnSkin]; if (row) { en.fv = row.fv; if (row.fv === 'fire') en.fire = true; }
  if (en.t === 'sprig' && en.cnSkin === CLUB_SKIN) en.club = true;
}

/* THE LOOSE: the seed the archer just put on the string gets its variant. s.arrow stays set: parry, reflect and the shield all treat it as the arrow it is. */
export function loosed(s, e) {
  if (!s || !e || !e.fv) return;
  s.fv = e.fv; if (e.fv === 'fire') s.fire = true;
}
/* THE DRAW (0.55 s): a glint at the bow in the shot's colour so the variant is read before it leaves the string */
export function tell(e, ctx, dt) {
  if (!e.fv || !(e.draw > 0) || Math.random() > dt * 28) return;
  const row = SKINS[e.cnSkin]; if (!row) return; const x = e.x + e.face * 6, y = e.y - 8;
  ctx.parts.push({ x, y, vx: (Math.random() - 0.5) * 18, vy: e.fv === 'fire' ? -34 : e.fv === 'venom' ? 14 : -10, life: 0.3, max: 0.3, col: row.col[Math.floor(Math.random() * row.col.length)], size: 1, grav: e.fv === 'venom' ? 90 : 0 });
}
export function drawBegan(e, ctx) { const row = SKINS[e.cnSkin]; if (!row) return; const f = ctx.SFX[row.tell]; if (f) f.call(ctx.SFX); }
/* IN FLIGHT: fire already throws its embers (src/main.js); rock sheds dust, venom drips */
export function fly(s, ctx, dt) {
  if (s.reflected || !s.fv) return;
  if (s.fv === 'rock' && Math.random() < dt * 26) ctx.parts.push({ x: s.x, y: s.y, vx: (Math.random() - 0.5) * 16, vy: -8, life: 0.28, max: 0.28, col: Math.random() < 0.5 ? '#9aa39a' : '#c9d1dc', size: 1, grav: 60 });
  else if (s.fv === 'venom' && Math.random() < dt * 30) ctx.parts.push({ x: s.x, y: s.y, vx: (Math.random() - 0.5) * 10, vy: 10, life: 0.4, max: 0.4, col: Math.random() < 0.5 ? '#a6e04a' : '#4a8a24', size: 1, grav: 140 });
}
/* WHERE IT LANDS (floor, wall, or flight over): rock shatters into shards that skip away from the surface; the rest burst in their colour (a fire arrow's patch is src/main.js's own) */
export function landed(s, ctx) {
  if (!s.fv || s.fv === 'shard') return;
  const row = Object.values(SKINS).find(r => r.fv === s.fv);
  if (s.fv === 'rock') {
    ctx.burst(s.x, s.y, 8, row.col, 70, 0.4, -30, 2); ctx.SFX.stone && ctx.SFX.stone();
    if (s.reflected || !(s.life > 0)) return;
    let x = s.x, y = s.y; for (let i = 0; i < 4 && ctx.isSolid(Math.floor(x / ctx.TS), Math.floor(y / ctx.TS)); i++) { x -= Math.sign(s.vx || 1) * 2; y -= Math.sign(s.vy) * 2; }
    const away = -(Math.sign(s.vx) || 1);
    for (let i = 0; i < SHARD.n; i++) ctx.seeds.push({ x, y: y - 1, vx: away * (30 + i * 28) + (i === 1 ? -away * 60 : 0), vy: -(100 + i * 22), g: 420, life: SHARD.life, dead: false, dmg: SHARD.dmg, fv: 'shard', owner: s.owner });
  } else if (s.fv === 'venom') { ctx.burst(s.x, s.y, 7, row.col, 40, 0.5, 20, 2); }
}
/* A SHOT THAT REACHES YOU: a rock breaks on you (no shards: they are the floor's), venom poisons on a landed hit, fire bursts */
export function onHit(s, res, ctx) {
  if (!s.fv) return; const row = Object.values(SKINS).find(r => r.fv === s.fv); if (!row) return;
  if (s.fv === 'venom' && res === 'hit') ctx.poisonPlayer();
  if (s.fv === 'rock') { ctx.burst(s.x, s.y, 8, row.col, 80, 0.4, -20, 2); ctx.SFX.stone && ctx.SFX.stone(); }
  else if (res !== 'blocked') ctx.burst(s.x, s.y, 6, row.col, 70, 0.4, -20, 2);
}
/* THE DEATH BURST of a variant, in its colour (the corpse and the sound are the archer's own) */
export function died(e, ctx) {
  const row = SKINS[e.cnSkin]; if (row) { ctx.burst(e.x, e.y - 6, e.fv === 'fire' ? 14 : 10, row.col, 90, 0.6, -50, 2); return; }
  if (e.club) ctx.burst(e.x, e.y - 5, 8, ['#8a5a32', '#5c3a1d', '#e8dcc0'], 80, 0.5, -40, 2);   /* the club splinters */
}
/* THE SHOT'S LOOK (drawn on the frame buffer g, camera cx/cy) */
export function draw(g, s, cx, cy, time) {
  const x = Math.round(s.x - cx), y = Math.round(s.y - cy);
  if (s.fv === 'shard') { g.fillStyle = '#c9d1dc'; g.fillRect(x - 1, y - 1, 2, 2); g.fillStyle = '#5a6470'; g.fillRect(x, y, 1, 1); return; }
  if (s.fv === 'rock') { const k = Math.floor(time * 14) % 2;
    g.fillStyle = OUT; g.fillRect(x - 3, y - 3, 6, 6); g.fillStyle = '#9aa39a'; g.fillRect(x - 2, y - 2, 4, 4); g.fillStyle = '#c9d1dc'; g.fillRect(k ? x - 2 : x, y - 2, 2, 2); g.fillStyle = '#5a6470'; g.fillRect(k ? x : x - 2, y, 2, 2);
    if (s.reflected) { g.fillStyle = '#8fd160'; g.fillRect(x - 1, y - 4, 2, 1); } return; }
  const a = Math.atan2(s.vy, s.vx); g.save(); g.translate(x, y); g.rotate(a);
  const head = s.fv === 'fire' ? '#ff6b2c' : '#a6e04a', hot = s.fv === 'fire' ? '#ffd36b' : '#d8ff98';
  g.fillStyle = s.fv === 'fire' ? '#e8dcc0' : '#6a8a3a'; g.fillRect(-5, -1, 8, 1);
  g.fillStyle = head; g.fillRect(3, -2, 3, 3); g.fillStyle = hot; g.fillRect(4, -1, 2, 1);
  if (s.fv === 'fire') { g.fillStyle = '#ff9a5c'; g.fillRect(-7, Math.floor(time * 20) % 2 ? -2 : 0, 2, 2); }
  g.fillStyle = s.reflected ? '#8fd160' : (s.fv === 'fire' ? '#c9463d' : '#4a8a24'); g.fillRect(-6, -2, 2, 3);
  g.restore();
}
