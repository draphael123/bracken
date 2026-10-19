// src/foe-affix.js - THE FOE PASS, LEVER 3: AFFIXES ON COMMON FOES, FROM ACT II (claude/foepass; scratch/brief-foepass-1016.md).
//
// A visible variant layer on the foes the levels already stand - never a new AI. At most ONE affix a foe; each a CLEAR READ: a tint over the
// body, an icon left of its health bar, and the affix's own picture (the shell, the streaks, the embers). Density rises by act
// (src/foe-pass.js AFFIX_ACT; Master adds, src/difficulty.js 'affix'). The tell-colour language holds: WHITE is breakable, RED is get clear.
//   SHIELDED   a WHITE SHELL round it (a share of its health): a blow into the shell lands at SHELL.take of itself (B15's floor: NEVER immune -
//              "every blow must land") and wears the shell down; a heavy, a plunge, a riposte, a dash attack, an ability or its family's
//              right tool SHATTERS it at once and lands whole. Shattered: SHIELD BROKEN, it reels and its bar leans.
//   HASTED     pale blue, streaks behind it: its clock runs HASTE.clock fast while it walks, rests and reloads - its TELLS keep their own
//              length (a told windup is never shortened by an affix)
//   HEAVY      dark iron, dust off its feet: its blows land HEAVY.blow harder, its stagger bar is HEAVY.poise deeper, a little more health
//   VOLATILE   embers off it: when it dies it BURSTS - told: a red !! and a red ring closing on the body for VOLATILE.fuse s, then a blast
//              that nothing turns (get clear). Knock it away from you, or finish it and step off.
// Not on: bosses, minis, elites (their own affixes, src/elite-kit.js), a boss's adds, the harmless, trainers, one-blow flyers, ambush waves.
// main.js hooks: spawnEntities (assign), updateEnemies (clock, the fuses), damagePlayer0 (blowMul), poiseMax (poiseMul), hurtEnemy0
// (shellTake), drawEnemies (tint, drawIcon, drawShell) and the world pass (drawFuses).

export const AFFIX = {
  shielded: { word: 'SHIELDED', col: '#f4f8ff', tint: 0.18, shell: 0.5, take: 0.4 },
  hasted:   { word: 'HASTED',   col: '#9ad0ff', tint: 0.22, clock: 1.3 },
  heavy:    { word: 'HEAVY',    col: '#5a5048', tint: 0.32, blow: 1.3, poise: 1.6, hp: 1.25 },
  volatile: { word: 'VOLATILE', col: '#ff7a2c', tint: 0.2, fuse: 0.9, r: 36, dmg: 14 },
};
export const KINDS = Object.keys(AFFIX);
/* THE BLOWS THAT SHATTER A SHELL AT ONCE (src/anti-mash.js verbs) - the same family as the boss break bar's heavy verbs */
export const SHATTER = new Set(['heavy', 'plunge', 'riposte', 'skill', 'dash']);
/* WHICH AFFIX FITS A ROLE (src/foe-react.js roleOf: front = a cover kind, back = ranged, flank = the rest) */
export const FIT = { front: ['shielded', 'heavy'], flank: ['hasted', 'volatile', 'heavy'], back: ['shielded', 'hasted'] };
/* the icons, 5x5 (left of the health bar) */
export const ICON = {
  shielded: ['.###.', '#####', '#####', '.###.', '..#..'],
  hasted: ['#.#..', '.#.#.', '..#.#', '.#.#.', '#.#..'],
  heavy: ['#####', '.###.', '..#..', '.###.', '#####'],
  volatile: ['..#..', '.##..', '.###.', '#####', '.###.'],
};

const hash = s => { let x = 2166136261; for (let i = 0; i < s.length; i++) x = Math.imul(x ^ s.charCodeAt(i), 16777619); return (x >>> 0) / 4294967296; };
/* MAY e CARRY ONE? (a common foe that fights). skip: the kinds main.js knows to leave alone (one-blow flyers, the skip lists) */
export const eligible = (e, skip) => !!(e && e.alive && !e.maxHp && !e.mini && !e.elite && !e.xpRole && !e.harmless && !e.trainer && !e.turncoat && !e.big
  && !e.squirrel && e.t !== 'dummy' && !(skip && skip.has(e.t)) && e.hp > 1 && !e.fa);
/* THE PICK: deterministic by level, spawn key and kind - the same foe carries the same affix on every attempt and every replay */
export function pick(levelId, key, kind, role, density) {
  if (!(density > 0)) return null;
  if (hash('fa|' + levelId + '|' + key + '|' + kind) >= density) return null;
  const fit = FIT[role] || FIT.flank; return fit[Math.floor(hash('fk|' + levelId + '|' + key) * fit.length) % fit.length];
}
/* PUT IT ON: its numbers (health and shell), counted once */
export function apply(e, a) {
  if (!AFFIX[a]) return; e.fa = a;
  if (a === 'heavy') { e.hp = Math.round(e.hp * AFFIX.heavy.hp); if (e.hp0) e.hp0 = e.hp; }
  if (a === 'shielded') { e.faShell = e.faShell0 = Math.max(2, Math.round((e.hp0 || e.hp) * AFFIX.shielded.shell)); }
}

/* HASTED: the clock its own AI runs on this frame (wu: it is winding up - a tell keeps its length) */
export const clock = (e, wu) => (e.fa === 'hasted' && !wu ? AFFIX.hasted.clock : 1);
/* HEAVY: on its blows, and its bar */
export const blowMul = src => (src && src.fa === 'heavy' ? AFFIX.heavy.blow : 1);
export const poiseMul = e => (e && e.fa === 'heavy' ? AFFIX.heavy.poise : 1);

/* SHIELDED: a hero's blow of verb into the shell. keyed: its family's right tool. Returns what reaches the body.
   api: { say(e, word, col), sfx(k), burst(x, y, n, cols, sp, life), lean(e, share), stagger(e, s) } */
export function shellTake(e, dmg, verb, keyed, api) {
  if (e.fa !== 'shielded' || !(e.faShell > 0) || !(dmg > 0)) return dmg;
  if (SHATTER.has(verb) || keyed) { shatter(e, api); return dmg; }   /* the right blow goes straight through it, whole */
  e.faShell -= dmg; const body = Math.max(1, Math.round(dmg * AFFIX.shielded.take));   /* B15: never immune */
  if (e.faShell <= 0) shatter(e, api);
  else { e.faClank = 0.12; if (!(e.faSaid > 0)) { e.faSaid = 0.9; api.say(e, AFFIX.shielded.word, AFFIX.shielded.col); } if (api.sfx) api.sfx('clank'); }
  return body;
}
export function shatter(e, api) {
  e.faShell = 0; e.faBroke = 0.4; api.say(e, 'SHIELD BROKEN', AFFIX.shielded.col); if (api.sfx) api.sfx('crack');
  if (api.burst) api.burst(e.x, e.y - (e.h || 16) / 2, 12, ['#ffffff', '#f4f8ff', '#bfc8d4'], 110, 0.45);
  if (api.stagger) api.stagger(e, 0.5); if (api.lean) api.lean(e, 0.5);
}

/* VOLATILE: the fuses. One list for the level, put back on every spawn (reset) */
export const FUSES = [];
export const reset = () => { FUSES.length = 0; };
/* ONCE A FRAME: a dead volatile foe lights its fuse; a fuse burns down and bursts. api: { hurtHero(x, y, r, dmg), sfx(k), ring(x, y, r, col, life),
   burst(...), mark(x, y, word, col), shake(n) } */
export function frame(enemies, dt, api) {
  for (const e of enemies) if (e.fa === 'volatile' && !e.alive && !e.faLit && !e.gone) { e.faLit = true;
    FUSES.push({ x: e.x, y: e.y - (e.h || 16) / 2, t: AFFIX.volatile.fuse, t0: AFFIX.volatile.fuse }); api.mark(e.x, e.y - (e.h || 16) - 14, '!!', '#ff6b6b'); if (api.sfx) api.sfx('fuse'); }
  for (const f of FUSES) { if (f.done) continue; f.t -= dt;
    if (f.t <= 0) { f.done = true; const V = AFFIX.volatile; if (api.sfx) api.sfx('boom'); if (api.shake) api.shake(4);
      if (api.burst) api.burst(f.x, f.y, 22, ['#fff6c8', '#ffd36b', '#ff7a2c', '#c0401c'], 150, 0.55);
      if (api.ring) api.ring(f.x, f.y, V.r, '#ff6b6b', 0.35);
      api.hurtHero(f.x, f.y, V.r, V.dmg); } }
  for (let i = FUSES.length - 1; i >= 0; i--) if (FUSES[i].done) FUSES.splice(i, 1);
}

/* THE READ. tint(e, now, paint): paint(col, alpha) lays the affix's colour over the body (main.js drawTinted) */
export function tint(e, now, paint) {
  const A = AFFIX[e.fa]; if (!A || !e.alive) return;
  const pulse = e.fa === 'volatile' ? 0.6 + 0.4 * Math.sin(now * 9) : e.fa === 'hasted' ? 0.8 + 0.2 * Math.sin(now * 14) : 1;
  if (e.fa === 'shielded' && !(e.faShell > 0)) return;
  paint(A.col, A.tint * pulse);
}
/* the icon, left of where its health bar sits (x, top: screen px of its centre and the top of its head) */
export function drawIcon(g, e, x, top, out) {
  const rows = ICON[e.fa]; if (!rows || !e.alive) return; const A = AFFIX[e.fa], x0 = x - 13, y0 = top - 7;
  g.fillStyle = out; g.fillRect(x0 - 1, y0 - 1, 7, 7); g.fillStyle = e.fa === 'shielded' && !(e.faShell > 0) ? '#6a7080' : A.col === '#5a5048' ? '#b8a890' : A.col;
  rows.forEach((r, j) => { for (let i = 0; i < 5; i++) if (r[i] === '#') g.fillRect(x0 + i, y0 + j, 1, 1); });
}
/* the shell (shielded, while it holds): a white oval round the body, cracking as it wears; streaks / embers / dust are main.js parts */
export function drawShell(g, e, x, y, now) {
  if (e.fa !== 'shielded' || !e.alive || !(e.faShell > 0)) return;
  const w = (e.w || 12) / 2 + 4, h = (e.h || 16) / 2 + 4, k = e.faShell / (e.faShell0 || e.faShell), cy = y - (e.h || 16) / 2;
  g.globalAlpha = (e.faClank > 0 ? 0.95 : 0.55) * (0.75 + 0.25 * Math.sin(now * 5)); g.strokeStyle = e.faClank > 0 ? '#ffffff' : '#f4f8ff'; g.lineWidth = 1;
  g.beginPath(); g.ellipse(x + 0.5, cy, w, h, 0, 0, Math.PI * 2); g.stroke();
  if (k < 0.66) { g.fillStyle = '#ffffff'; g.fillRect(Math.round(x - w * 0.5), Math.round(cy - h * 0.6), 1, 3); }
  if (k < 0.33) { g.fillRect(Math.round(x + w * 0.4), Math.round(cy - h * 0.2), 1, 3); g.fillRect(Math.round(x - w * 0.2), Math.round(cy + h * 0.5), 2, 1); }
  g.globalAlpha = 1;
}
/* the burning fuses: a red ring closing on the body, faster as it comes */
export function drawFuses(g, cx, cy, now) {
  for (const f of FUSES) { if (f.done) continue; const k = Math.max(0, f.t / f.t0), r = Math.round(6 + AFFIX.volatile.r * k), x = Math.round(f.x - cx), y = Math.round(f.y - cy);
    g.globalAlpha = 0.5 + 0.5 * Math.abs(Math.sin(now * (10 + (1 - k) * 18))); g.strokeStyle = '#ff6b6b'; g.lineWidth = 1;
    g.beginPath(); g.arc(x + 0.5, y + 0.5, r, 0, Math.PI * 2); g.stroke(); g.fillStyle = '#ffd36b'; g.fillRect(x - 1, y - 1, 3, 3); g.globalAlpha = 1; }
}
/* timers on the foe (once a frame each) */
export function tick(e, dt) { if (e.faClank > 0) e.faClank -= dt; if (e.faSaid > 0) e.faSaid -= dt; if (e.faBroke > 0) e.faBroke -= dt; }
/* ITS OWN PICTURE, as parts (push: main.js parts.push): HASTED streaks behind it as it moves, VOLATILE embers rise off it, HEAVY dust off its feet */
export function fx(e, now, push) {
  if (!e.alive) return; const w = e.w || 12, h = e.h || 16, mv = Math.abs(e.vx || 0);
  if (e.fa === 'hasted' && mv > 18 && Math.random() < 0.4) { const d = Math.sign(e.vx) || 1; push({ x: e.x - d * (w / 2 + 1), y: e.y - 2 - Math.random() * (h - 4), vx: -d * 30, vy: 0, life: 0.18, max: 0.18, col: AFFIX.hasted.col, size: 1, grav: 0 }); }
  else if (e.fa === 'volatile' && Math.random() < 0.22) push({ x: e.x + (Math.random() - 0.5) * w, y: e.y - Math.random() * h, vx: 0, vy: -32, life: 0.4, max: 0.4, col: Math.random() < 0.5 ? '#ff7a2c' : '#ffd36b', size: 1, grav: 0 });
  else if (e.fa === 'heavy' && mv > 8 && Math.random() < 0.1) push({ x: e.x + (Math.random() - 0.5) * w, y: e.y - 1, vx: (Math.random() - 0.5) * 20, vy: -14, life: 0.35, max: 0.35, col: '#8a7a68', size: 1, grav: 60 });
}
/* the words it says over a foe (main.js MOVE_WORDS: a capital word is drawn only when it is one) */
export const WORDS = ['SHIELDED', 'SHIELD BROKEN'];
