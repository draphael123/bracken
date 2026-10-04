/* THE LIVE ABILITY PREVIEW (item 17a). A small looping vignette of the highlighted ability: the hero stands, casts, and a
   training post takes it. PURE DRAW: nothing here reads or writes the running game (no P, no enemies, no PROG, no saves,
   no timers, no random) - the picture is a function of (ability id, time, the frames handed in), so it can be drawn from
   a menu, from the store or from a test without touching anything. Icons and descriptions stay in main.js's tables:
   this file only says WHAT SHAPE an ability has (a thrust, a ring, a wall...), keyed by the skill id, and falls back to
   a plain "cast" for any id it does not know, so a new ability never breaks the screen. */

const LOOP = 3.6, CAST_AT = 0.8, FX_LEN = 1.9;

/* id -> shape. Unknown ids draw 'cast'. */
export const SHAPE = {
  // knight
  risingCut: 'rise', lunge: 'dash', shieldThrow: 'boomerang', warCry: 'ring', groundSlam: 'quake', whirlwind: 'spin',
  disarm: 'mark', ironclad: 'aura', swordOfRealm: 'waves',
  // pyromancer
  vent: 'burst', emberFlare: 'flare', meteor: 'sky', wisp: 'wisp', flameRing: 'ring', fireWall: 'wall', cinderStep: 'dash',
  // paladin
  consecrate: 'zone', lightLance: 'thrust', holyCharge: 'dash', divineShield: 'aura', blessedHammer: 'spiral', hammerLeap: 'leap',
  // freebooter
  grapeshot: 'cone', broadside: 'thrust', rum: 'aura', blackSpot: 'mark', boarding: 'hook', keelhaul: 'hook',
  // reaper
  harvestMoon: 'zone', graveTide: 'hands', summonSkeleton: 'summon', unholyGround: 'zone', gravecall: 'summon', scytheThrown: 'bolt', deathGrip: 'hook',
  // warden
  skewer: 'thrust', setSpears: 'spikes', harrier: 'leap', wheel: 'spin', javelin: 'bolt', poleSpring: 'leap', fullStretch: 'aura', spearDance: 'flurry', rainOfSpears: 'rain',
  // geomancer
  stoneStep: 'pillar', boulder: 'roll', spikeRow: 'spikes', archway: 'arch', stoneWall: 'wall', entomb: 'entomb', faultLine: 'quake', golem: 'summon', avalanche: 'rain',
  // berserker (claude/berserker): the roar, the spin, the harden, the long cleave, the charge, the shrug, the stand, the frenzy, the hatchets
  bzRoar: 'ring', bzSpin: 'spin', bzHarden: 'aura', bzCleave: 'thrust', bzRampage: 'dash', bzShrug: 'aura', bzStand: 'aura', bzUnchained: 'burst', bzStorm: 'cone',
};
export const shapeOf = id => SHAPE[id] || 'cast';

/* how each shape reads on the post: [hit window in fx progress, push in px] (0 push = it flinches in place) */
const HIT = { thrust: [.12, .5, 5], dash: [.35, .7, 6], boomerang: [.3, .5, 3], ring: [.15, .6, 7], quake: [.2, .7, 3], spin: [.2, .7, 4], mark: [.2, .9, 0], aura: [2, 2, 0],
  flare: [.4, .85, 0], waves: [.2, .9, 4], burst: [.1, .5, 6], sky: [.55, .9, 4], wisp: [.4, .9, 2], wall: [.2, .6, 2], zone: [.1, .95, 0], spiral: [.25, .8, 3], leap: [.5, .7, 5], cone: [.1, .4, 5],
  hook: [.35, .7, -14], hands: [.1, .9, 0], summon: [.6, .9, 3], bolt: [.4, .6, 5], spikes: [.3, .8, 0], flurry: [.1, .9, 2], rain: [.3, .9, 0], pillar: [2, 2, 0],
  roll: [.4, .7, 7], arch: [2, 2, 0], entomb: [.2, .9, 0], rise: [.15, .6, 0], cast: [.2, .5, 3] };

const HERO_INK = { knight: ['#dfe8ff', '#8a96a8'], pyro: ['#ffd36b', '#ff7a3c'], paladin: ['#fff6c8', '#e0b040'], pirate: ['#dfe8ff', '#c9a040'],
  reaper: ['#ff8080', '#8fd160'], warden: ['#c9f0ff', '#6aa8c8'], geomancer: ['#d8c090', '#8a6a3a'], berserker: ['#ffb08a', '#c8402a'] };

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = p => 1 - (1 - p) * (1 - p);

/* draw one frame of the vignette into the box (x, y, w, h).
   o = { id, hero, t (seconds, any origin), idle: [canvas...], atk: [canvas...], icon: canvas | null, bg?: colour } */
export function drawAbilityPreview(g, x, y, w, h, o) {
  const shape = shapeOf(o.id), ink = HERO_INK[o.hero] || HERO_INK.knight, [c1, c2] = ink;
  const c = ((o.t % LOOP) + LOOP) % LOOP, castP = clamp((c - CAST_AT) / FX_LEN), casting = c >= CAST_AT && c < CAST_AT + 0.35;
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.fillStyle = o.bg || 'rgba(14,12,22,0.92)'; g.fillRect(x, y, w, h);
  const gy = y + h - 12, hx = x + Math.round(w * 0.26), dx = x + Math.round(w * 0.66);
  // a strip of floor and a far wall line, so the shapes have something to stand on
  g.fillStyle = '#2a2436'; g.fillRect(x, gy, w, 12); g.fillStyle = '#4a4258'; g.fillRect(x, gy, w, 1);
  g.fillStyle = 'rgba(255,255,255,0.05)'; for (let i = 0; i < 6; i++) g.fillRect(x + 6 + i * 26, gy + 5, 10, 1);
  const S = { g, x, y, w, h, gy, hx, dx, p: castP, c1, c2, c, t: o.t };
  // the post: it flinches inside the shape's hit window
  const hit = HIT[shape] || HIT.cast, inHit = castP > 0 && castP >= hit[0] && castP <= hit[1];
  const shake = inHit ? Math.round(Math.sin(c * 60) * 1) : 0, push = inHit ? Math.round(hit[2] * Math.sin((castP - hit[0]) / (hit[1] - hit[0]) * Math.PI)) : 0;
  const px = dx + push + shake;
  drawPost(g, px, gy, inHit, shape === 'entomb' && inHit, shape === 'mark' && castP > hit[0]);
  // ground / behind-the-hero effects first, then the hero, then the effects that fly in front
  FX[shape] && FX[shape](S, 'under', px);
  const idle = o.idle && o.idle.length ? o.idle[Math.floor(o.t * 4.5) % o.idle.length] : null;
  const atk = o.atk && o.atk.length ? o.atk[Math.min(o.atk.length - 1, casting ? 1 + Math.floor((c - CAST_AT) / 0.17) % Math.max(1, o.atk.length - 1) : 0)] : null;
  const fr = casting && atk ? atk : idle;
  let hxx = hx, hyy = gy;
  const mv = MOVE[shape] && MOVE[shape](S); if (mv) { hxx = hx + mv.dx; hyy = gy - mv.dy; }
  if (fr) g.drawImage(fr, 0, 0, fr.width, fr.height, Math.round(hxx - fr.width / 2), Math.round(hyy - fr.height), fr.width, fr.height);
  else { g.fillStyle = c1; g.fillRect(hxx - 4, hyy - 16, 8, 16); }
  FX[shape] && FX[shape](S, 'over', px, hxx, hyy);
  if (!FX[shape] && o.icon && castP > 0) { const s = 1 + Math.round(castP < .4 ? 1 : 0), a = 1 - castP; g.globalAlpha = clamp(a * 1.6); g.drawImage(o.icon, 0, 0, o.icon.width, o.icon.height, Math.round(hx + 14), Math.round(gy - 34 - castP * 8), o.icon.width * s, o.icon.height * s); g.globalAlpha = 1; }
  g.restore();
  g.strokeStyle = 'rgba(255,255,255,0.14)'; g.lineWidth = 1; g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  return shape;
}

function drawPost(g, x, gy, hit, stone, marked) {
  g.fillStyle = '#5a4630'; g.fillRect(x - 1, gy - 8, 3, 8);                           /* the stake */
  g.fillStyle = hit ? '#fff0d0' : '#c9a86a'; g.fillRect(x - 5, gy - 24, 11, 15);     /* straw body */
  g.fillStyle = hit ? '#ffffff' : '#a8884c'; g.fillRect(x - 5, gy - 16, 11, 2);
  g.fillStyle = hit ? '#fff0d0' : '#d8b878'; g.fillRect(x - 4, gy - 31, 9, 7);       /* the head */
  g.fillStyle = '#3a2c1c'; g.fillRect(x - 2, gy - 29, 1, 1); g.fillRect(x + 2, gy - 29, 1, 1);
  if (stone) { g.fillStyle = 'rgba(150,150,165,0.85)'; g.fillRect(x - 7, gy - 33, 15, 33); g.fillStyle = '#c9c9d4'; g.fillRect(x - 7, gy - 33, 15, 2); }
  if (marked) { g.fillStyle = '#0d0d12'; g.fillRect(x - 3, gy - 22, 7, 7); g.fillStyle = '#e0e0e8'; g.fillRect(x - 1, gy - 20, 3, 3); }
}

/* a spark burst at a point, deterministic in p */
const sparks = (g, x, y, p, col, n = 6, r = 10) => { g.fillStyle = col; g.globalAlpha = clamp(1.3 - p); for (let i = 0; i < n; i++) { const a = i / n * 6.283 + 0.5, d = r * ease(p); g.fillRect(Math.round(x + Math.cos(a) * d), Math.round(y + Math.sin(a) * d), 2, 2); } g.globalAlpha = 1; };
const band = (g, x, y, w, h, col, a = 1) => { g.globalAlpha = clamp(a); g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); g.globalAlpha = 1; };
const ringAt = (g, x, y, r, col, a = 1) => { g.globalAlpha = clamp(a); g.strokeStyle = col; g.lineWidth = 2; g.beginPath(); g.ellipse(Math.round(x), Math.round(y), Math.max(1, r), Math.max(1, r * .45), 0, 0, 6.283); g.stroke(); g.globalAlpha = 1; };
const fade = p => clamp(1.6 - p * 1.3);

/* where the hero is while the shape plays (dash and leap move her) */
const MOVE = {
  dash: S => { const q = clamp(S.p / .5); return { dx: Math.round((S.dx - S.hx - 14) * ease(q)) * (S.p < .9 ? 1 : 0), dy: 0 }; },
  leap: S => { const q = clamp(S.p / .6); return { dx: Math.round((S.dx - S.hx - 16) * q), dy: Math.round(Math.sin(q * Math.PI) * 30) }; },
  hook: S => { const q = clamp((S.p - .4) / .3); return { dx: Math.round(8 * q), dy: 0 }; },
};

/* the effects. Each is called twice: 'under' (before the hero is drawn) and 'over' (after). */
const FX = {
  thrust(S, ph, px, hx, hy) { if (ph !== 'over') return; const q = clamp(S.p / .3), len = (px - S.hx) * ease(q) + 8;
    band(S.g, S.hx + 6, S.gy - 15, len, 3, S.c1, fade(S.p)); band(S.g, S.hx + 6, S.gy - 14, len, 1, '#fff', fade(S.p)); if (S.p > .12) sparks(S.g, px - 4, S.gy - 14, (S.p - .12) / .5, S.c2, 5, 9); },
  dash(S, ph, px, hx, hy) { if (ph !== 'under') return; const q = clamp(S.p / .5); for (let i = 1; i < 5; i++) band(S.g, S.hx + (S.dx - S.hx - 14) * ease(q) - i * 8, S.gy - 22, 6, 12, S.c2, .5 - i * .1); },
  boomerang(S, ph) { if (ph !== 'over') return; const q = S.p < .5 ? S.p / .5 : 1 - (S.p - .5) / .5, xx = S.hx + 8 + (S.dx - S.hx - 8) * ease(clamp(q));
    if (S.p > 0 && S.p < 1) { band(S.g, xx - 4, S.gy - 21, 9, 9, S.c2); band(S.g, xx - 3, S.gy - 20, 7, 7, S.c1); band(S.g, xx - 1, S.gy - 18, 3, 3, '#8a2a2a'); } },
  bolt(S, ph) { if (ph !== 'over') return; const q = clamp(S.p / .45), xx = S.hx + 8 + (S.dx - S.hx - 10) * q; if (S.p > 0 && q < 1) { band(S.g, xx - 5, S.gy - 16, 9, 2, S.c1); band(S.g, xx - 9, S.gy - 16, 4, 1, S.c2, .6); } else if (S.p > 0) sparks(S.g, S.dx, S.gy - 16, (S.p - .45) / .4, S.c2, 5, 8); },
  ring(S, ph, px, hx, hy) { if (ph !== 'over' || S.p <= 0) return; ringAt(S.g, S.hx, S.gy - 3, 6 + S.p * 62, S.c1, fade(S.p)); ringAt(S.g, S.hx, S.gy - 3, 3 + S.p * 44, S.c2, fade(S.p)); },
  spin(S, ph) { if (ph !== 'over' || S.p <= 0 || S.p > .7) return; const a = S.p * 25; for (let i = 0; i < 3; i++) { const aa = a - i * .5; band(S.g, S.hx + Math.cos(aa) * 17 - 1, S.gy - 14 + Math.sin(aa) * 6, 3, 3, i ? S.c2 : S.c1, 1 - i * .3); } },
  quake(S, ph) { if (ph !== 'under' || S.p <= 0) return; const r = S.p * 58; for (const s of [-1, 1]) { const xx = S.hx + s * r; band(S.g, xx - 3, S.gy - 3 - Math.round(Math.sin(S.p * 9) * 2), 6, 4, S.c2, fade(S.p)); band(S.g, xx - 2, S.gy - 6, 3, 3, S.c1, fade(S.p)); } },
  mark(S, ph, px) { if (ph !== 'over' || S.p <= 0) return; sparks(S.g, px, S.gy - 30, S.p, S.c1, 6, 8); if (S.p > .3) { S.g.globalAlpha = .9; S.g.fillStyle = S.c2; S.g.fillRect(px - 1, S.gy - 40 - Math.round(Math.sin(S.c * 6) * 1), 3, 4); S.g.globalAlpha = 1; } },
  aura(S, ph, px, hx, hy) { if (ph !== 'over' || S.p <= 0) return; const a = S.p < .8 ? .55 : .55 * (1 - (S.p - .8) / .2); ringAt(S.g, S.hx, S.gy - 1, 12 + Math.sin(S.c * 8) * 1, S.c1, a); band(S.g, S.hx - 10, S.gy - 30, 21, 32, S.c1, a * .18); },
  waves(S, ph) { if (ph !== 'over' || S.p <= 0) return; for (let i = 0; i < 3; i++) { const q = clamp((S.p - i * .22) / .4); if (q > 0 && q < 1) band(S.g, S.hx + 8 + q * (S.dx - S.hx), S.gy - 8, 3, 8, S.c1, 1 - q * .5); } },
  /* THE EMBER FLARE: a yellow blow comes in off the post, meets a burst of fire round her and is cancelled there; the post is left burning */
  flare(S, ph, px) { if (S.p <= 0) return; if (ph === 'over') { const q = clamp(S.p / .36), cx = S.hx + 4, cy = S.gy - 12;
      if (q < 1) band(S.g, px - 6 - (px - S.hx - 24) * q, S.gy - 16, 8, 3, '#e8d070');
      if (S.p > .3 && S.p < .62) { const k = (S.p - .3) / .32; ringAt(S.g, cx, cy, 5 + k * 17, S.c1, fade(k)); ringAt(S.g, cx, cy, 3 + k * 11, '#fff', fade(k) * .8); sparks(S.g, cx + 16, cy - 4, k, S.c2, 6, 12); }
      if (S.p > .4 && S.p < .95) for (let i = 0; i < 3; i++) band(S.g, px - 3 + i * 3, S.gy - 26 - Math.round(((S.c * 22 + i * 5) % 8)), 2, 3, i % 2 ? S.c1 : S.c2, .8); } },
  burst(S, ph) { if (ph !== 'over' || S.p <= 0) return; ringAt(S.g, S.hx, S.gy - 12, 4 + S.p * 40, S.c1, fade(S.p)); sparks(S.g, S.hx, S.gy - 14, S.p, S.c2, 10, 34); },
  sky(S, ph, px) { if (ph !== 'over' || S.p <= 0) return; const q = clamp(S.p / .55); if (q < 1) { band(S.g, px - 3 + (1 - q) * 14, S.y + 4 + q * (S.gy - S.y - 16), 6, 6, S.c1); band(S.g, px + (1 - q) * 14 + 1, S.y + 2 + q * (S.gy - S.y - 22), 3, 5, S.c2, .7); } else { ringAt(S.g, px, S.gy - 2, 4 + (S.p - .55) * 60, S.c1, fade(S.p - .3)); sparks(S.g, px, S.gy - 8, (S.p - .55) / .45, S.c2, 8, 16); } },
  wisp(S, ph) { if (ph !== 'over' || S.p <= 0) return; const q = clamp((S.p - .1) / .4), xx = S.hx + 10 + (S.dx - S.hx - 10) * q * .8 + Math.cos(S.c * 7) * 2, yy = S.gy - 26 + q * 6 + Math.sin(S.c * 7) * 3;
    band(S.g, xx - 2, yy - 2, 5, 5, S.c1); band(S.g, xx - 1, yy - 1, 3, 3, '#fff'); band(S.g, xx - 6, yy, 3, 2, S.c2, .5); },
  wall(S, ph) { if (S.p <= 0) return; const q = clamp(S.p / .2), up = S.p < .8 ? 1 : 1 - (S.p - .8) / .2, hh = 26 * ease(q) * up; if (ph === 'under') for (let i = 0; i < 3; i++) band(S.g, S.hx + 20 + i * 5, S.gy - hh, 4, hh, i % 2 ? S.c1 : S.c2); },
  zone(S, ph, px) { if (ph !== 'under' || S.p <= 0) return; const a = fade(S.p * .8); S.g.globalAlpha = a * .45; S.g.fillStyle = S.c2; S.g.beginPath(); S.g.ellipse(S.hx + 20, S.gy - 1, 34, 6, 0, 0, 6.283); S.g.fill(); S.g.globalAlpha = 1;
    for (let i = 0; i < 5; i++) band(S.g, S.hx - 8 + ((i * 17 + Math.round(S.c * 20)) % 58), S.gy - 3 - ((i * 7 + Math.round(S.c * 16)) % 10), 2, 3, S.c1, a); },
  spiral(S, ph) { if (ph !== 'over' || S.p <= 0) return; for (let i = 0; i < 3; i++) { const a = S.p * 14 - i * 2.1, r = 8 + S.p * 34; band(S.g, S.hx + Math.cos(a) * r - 2, S.gy - 16 + Math.sin(a) * r * .35, 5, 5, i ? S.c2 : S.c1, fade(S.p)); } },
  leap(S, ph, px) { if (S.p > .6 && ph === 'under') { const q = (S.p - .6) / .4; ringAt(S.g, px - 8, S.gy - 1, 4 + q * 34, S.c1, fade(q)); for (const s of [-1, 1]) band(S.g, px - 8 + s * q * 34, S.gy - 3, 5, 3, S.c2, fade(q)); } },
  cone(S, ph) { if (ph !== 'over' || S.p <= 0 || S.p > .6) return; const q = S.p / .6; for (let i = -3; i <= 3; i++) { band(S.g, S.hx + 12 + q * (S.dx - S.hx), S.gy - 16 + i * q * 5, 2, 2, i % 2 ? S.c1 : S.c2, 1 - q * .4); } },
  hook(S, ph, px, hx, hy) { if (ph !== 'over' || S.p <= 0) return; const out = clamp(S.p / .35), back = clamp((S.p - .4) / .3), tip = S.hx + 10 + (px - S.hx - 8 + 14 * back) * out * (S.p < .4 ? 1 : 1 - back * .9) + (S.p >= .4 ? 0 : 0);
    const tx = S.p < .4 ? S.hx + 10 + (S.dx - S.hx - 8) * out : S.hx + 10 + (px - S.hx - 8) * (1 - back * .1); band(S.g, S.hx + 10, S.gy - 14, tx - S.hx - 10, 1, '#c9b27c'); band(S.g, tx - 1, S.gy - 16, 4, 5, S.c1); },
  hands(S, ph) { if (ph !== 'under' || S.p <= 0) return; for (let i = 0; i < 5; i++) { const q = clamp((S.p - i * .08) / .3), xx = S.hx + 16 + i * 11; band(S.g, xx, S.gy - 12 * q * fade(S.p), 3, 12 * q * fade(S.p), S.c2); band(S.g, xx - 1, S.gy - 12 * q * fade(S.p) - 2, 5, 2, S.c1); } },
  summon(S, ph) { if (S.p <= 0) return; const q = clamp(S.p / .35), a = S.p < .85 ? 1 : 1 - (S.p - .85) / .15; if (ph === 'under') for (const [off, col] of [[16, S.c2], [26, S.c1]]) { const hh = 18 * ease(q); band(S.g, S.hx + off, S.gy - hh, 6, hh, col, a); band(S.g, S.hx + off + 1, S.gy - hh - 5 * ease(q), 4, 5 * ease(q), '#e8e4d0', a); } },
  spikes(S, ph) { if (ph !== 'under' || S.p <= 0) return; for (let i = 0; i < 4; i++) { const q = clamp((S.p - i * .1) / .16) * (S.p < .85 ? 1 : 1 - (S.p - .85) / .15), hh = 15 * q; band(S.g, S.hx + 20 + i * 12, S.gy - hh, 4, hh, S.c1); band(S.g, S.hx + 21 + i * 12, S.gy - hh - 2, 2, 2, '#fff'); } },
  flurry(S, ph) { if (ph !== 'over' || S.p <= 0 || S.p > .8) return; const n = Math.floor(S.p * 8); for (let i = 0; i <= n && i < 6; i++) { const q = clamp(S.p * 8 - i); if (q > 0 && q < 1) band(S.g, S.hx + 8, S.gy - 20 + (i % 3) * 5, 22 + q * 12, 2, S.c1, 1 - q * .6); } },
  rain(S, ph) { if (ph !== 'over' || S.p <= 0) return; for (let i = 0; i < 7; i++) { const q = clamp((S.p - i * .06) / .3), xx = S.hx + 14 + i * 12 + (i % 2) * 3; if (q > 0 && q < 1) band(S.g, xx, S.y + q * (S.gy - S.y - 4), 3, 7, i % 2 ? S.c1 : S.c2); else if (q >= 1) sparks(S.g, xx, S.gy - 3, (S.p - i * .06 - .3) / .4, S.c1, 4, 6); } },
  pillar(S, ph) { if (ph !== 'under' || S.p <= 0) return; const q = ease(clamp(S.p / .25)), a = S.p < .8 ? 1 : 1 - (S.p - .8) / .2; band(S.g, S.hx - 7, S.gy - 12 * q * a, 14, 12 * q * a, S.c2); band(S.g, S.hx - 7, S.gy - 12 * q * a, 14, 2, S.c1); },
  roll(S, ph) { if (ph !== 'over' || S.p <= 0) return; const q = clamp(S.p / .55), xx = S.hx + 12 + (S.dx - S.hx - 8) * q; if (q < 1 || S.p < .8) { band(S.g, xx - 6, S.gy - 12, 12, 12, S.c2); band(S.g, xx - 6, S.gy - 12, 12, 2, S.c1); band(S.g, xx - 2 + Math.round(Math.cos(S.p * 20) * 3), S.gy - 7, 3, 3, '#5a4630'); } },
  arch(S, ph) { if (ph !== 'under' || S.p <= 0) return; const q = ease(clamp(S.p / .25)), a = S.p < .85 ? 1 : 1 - (S.p - .85) / .15; S.g.globalAlpha = a; S.g.fillStyle = S.c2; S.g.fillRect(S.hx + 18, S.gy - 22 * q, 5, 22 * q); S.g.fillRect(S.hx + 50, S.gy - 22 * q, 5, 22 * q); S.g.fillStyle = S.c1; S.g.fillRect(S.hx + 18, S.gy - 22 * q, 37, 5); S.g.globalAlpha = 1; },
  entomb(S, ph) { if (ph !== 'under' || S.p <= 0) return; sparks(S.g, S.dx, S.gy - 12, S.p, S.c1, 6, 12); },
  rise(S, ph, px) { if (ph !== 'over' || S.p <= 0 || S.p > .8) return; const q = ease(clamp(S.p / .4)), lift = Math.sin(clamp(S.p / .8) * Math.PI) * 18; band(S.g, S.hx + 8, S.gy - 12 - q * 18, 2, 18, S.c1, fade(S.p)); band(S.g, S.hx + 9, S.gy - 16 - q * 14, 14, 2, S.c2, fade(S.p)); S.g.globalAlpha = 0; S.g.globalAlpha = 1; },
};
