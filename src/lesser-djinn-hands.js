// src/lesser-djinn-hands.js - THE LESSER DJINN's HANDS (claude/djinn3). src/lesser-djinn.js is the rules (pure); this binds them to the game: a spirit's
// first sight (its bestiary card), a blade on it (it passes through sand, fire turns it - told; open, it cuts), THE POUR on it (a pourable for
// src/well-town-hands.js: sand to MUD, fire DOUSED), its frames while it is open and re-forming (the wisp's AI waits), and its drawing (its own
// baked skin, src/redraw/lesser_djinn_art.js, so its hurt flash and its corpse wear it too).
// main.js calls: owns, step, take, pourable, draw. Every teaching line goes through ctx.number with a line listed in src/hint-lines.js.
import { LD, isLesser, ldOpen, ldPourAim, ldOpenUp, ldStep, SAND_SKIN } from './lesser-djinn.js';
import { LDJ_F } from './redraw/lesser_djinn_art.js';
import { stepWisp } from './canal-foes.js';

export function makeLesserDjinnHands(ctx) {
  const H = {}, said = {};
  const once = k => { if (said[k]) return false; said[k] = 1; return true; };
  H.n = { pours: 0, passed: 0, opened: 0, reformed: 0 };
  H.owns = e => isLesser(e);
  const init = e => { if (e.ldInit) return; e.ldInit = true; e.hp = e.maxHp = LD.hp; e.lured = true; };   /* (no canal lure line: it hunts from where it hangs) */
  /* THE WISP'S MACHINE (src/canal-foes.js stepWisp), with the works for a world: no fog to clear, no canal hint, its dart named for what it is */
  const wispWorld = e => ({ hero: () => ctx.hero(), solid: (x, y) => ctx.solid(Math.floor(x / ctx.TS), Math.floor(y / ctx.TS)), sfx: ctx.sfx, cleared: () => false, hint: () => {},
    hurtHero: (x, d, o) => ctx.hurtHero(x, d, { ...o, name: e.cnSkin === SAND_SKIN ? 'THE SAND SPIRIT' : 'THE FIRE SPIRIT' }), mark: (q, t, col) => ctx.number(q.x, q.y - (q.h || 10) - 10, t, col), ring: (x, y, r, col) => ctx.ring(x, y, r, col) });
  const TS = () => ctx.TS;
  const solidBelow = (x, y) => { const ts = TS(); let ty = Math.floor((y - 2) / ts); for (let k = 0; k < 12; k++, ty++) if (ctx.standable(Math.floor(x / ts), ty)) return ty * ts; return null; };
  const wallAt = (x, y) => ctx.solid(Math.floor(x / TS()), Math.floor(y / TS()));
  /* ONE FRAME: true while the spirit is open or re-forming (the ember wisp's own machine waits) */
  H.step = (e, dt) => { init(e); const P = ctx.hero();
    if (P && Math.abs(e.x - P.x) < 190) { ctx.seen(e.cnSkin); if (once('seen' + e.cnSkin)) { if (e.cnSkin === SAND_SKIN) ctx.number(e.x, e.y - 30, 'A SAND SPIRIT: A BLADE PASSES THROUGH. POUR ON IT', '#ffd36b'); else ctx.number(e.x, e.y - 30, 'A FIRE SPIRIT: ITS FIRE TURNS A BLADE. DOUSE IT', '#ff9a5c'); } }
    const was = e.ldRise > 0 || ldOpen(e), r = ldStep(e, dt, { solidBelow, wallAt, heroX: P ? P.x : e.x });
    if (e.mode === 'reform' && e.ldRise > LD.rise - dt - 1e-6) { H.n.reformed++; ctx.burst(e.x, e.y - 6, 6, e.cnSkin === SAND_SKIN ? ['#d8b070', '#f2dca0'] : ['#ff9a3c', '#ffd36b'], 40, 0.4); if (once('reform')) ctx.number(e.x, e.y - 30, 'IT WHIRLS UP AGAIN', '#9aa39a'); }
    if (!r) stepWisp(e, dt, wispWorld(e));
    return r; };
  /* A BLOW: open it cuts whole; whirling, it passes through sand, or fire turns it (told once a kind) */
  H.take = (e, dmg) => { init(e); if (ldOpen(e)) return dmg; H.n.passed++; const P = ctx.hero();
    if (e.cnSkin === SAND_SKIN) { ctx.burst(e.x, e.y - 8, 5, ['#d8b47a', '#c9a46a'], 40, 0.35); if (once('pass')) ctx.number(e.x, e.y - 30, 'SAND: THE BLADE PASSES THROUGH. POUR ON IT', '#c9a46a'); }
    else { ctx.burst(e.x, e.y - 8, 5, ['#ff9a3c', '#ffd36b'], 50, 0.35); if (once('turn')) ctx.number(e.x, e.y - 30, 'ITS FIRE TURNS THE BLADE: DOUSE IT', '#ff9a5c'); }
    if (P) e.recoil = Math.max(e.recoil || 0, 0.3);
    return 0; };
  /* THE POUR: the nearest whirling spirit in front of you - sand to mud, fire doused - drops to the floor */
  H.pourable = {
    aim: P => { const e = ldPourAim(ctx.enemies(), P.x, P.y, P.face || 1); return e ? { x: e.x, y: e.y - 8 } : null; },
    pour: P => { const e = ldPourAim(ctx.enemies(), P.x, P.y, P.face || 1); if (!e) return false; init(e); ldOpenUp(e); H.n.pours++; H.n.opened++;
      if (e.cnSkin === SAND_SKIN) { ctx.burst(e.x, e.y - 8, 12, ['#6e4a2c', '#8a6a3e', '#7ab8e8'], 60, 0.6); ctx.sfx.splash && ctx.sfx.splash(); ctx.number(P.x, P.y - 30, 'MUD: IT FALLS. CUT IT', '#8fd160'); }
      else { ctx.burst(e.x, e.y - 8, 14, ['#e8f4f8', '#c8d0d8', '#9aa39a'], 50, 0.8); ctx.sfx.hiss ? ctx.sfx.hiss() : ctx.sfx.splash && ctx.sfx.splash(); ctx.number(P.x, P.y - 30, 'DOUSED: CLAY AND SMOKE. CUT IT', '#8fd160'); }
      return true; } };
  /* DRAWING: its own skin - whirling (two frames), flaring white before the dart, a lump while open; and the time it has left, open */
  H.draw = (g, e, cx, cy, time) => { const set = ctx.spr(e.cnSkin); if (!set) return; const R = Math.round, open = ldOpen(e);
    const f = open ? LDJ_F.open : e.ldRise > 0 ? LDJ_F.whirl0 : e.mode === 'flareTell' ? LDJ_F.flare : (e.hurtT > 0 || e.flash > 0) ? LDJ_F.hurt : Math.floor(time * 8 + e.x * 0.01) % 2;
    const x = R(e.x - cx), y = R(e.y - cy + (open ? 0 : Math.sin(time * 3 + e.x * 0.05) * 1.5)), side = (e.face || 1) > 0 ? 'R' : 'L';
    if (e.mode === 'flareTell') { g.globalAlpha = 0.35 + 0.3 * Math.abs(Math.sin(time * 13)); g.fillStyle = e.cnSkin === SAND_SKIN ? '#fff6d8' : '#fff6c8'; g.beginPath(); g.arc(x, y - 12, 13, 0, 7); g.fill(); g.globalAlpha = 1; }
    const img = (e.flash > 0 ? set.white : set)[side][f]; if (img) g.drawImage(img, x - set.ax, y - set.ay);
    e.lastSet = set; e.lastFrame = f;
    if (open) { g.fillStyle = '#1b1626'; g.fillRect(x - 8, y - 14, 16, 2); g.fillStyle = '#8fd160'; g.fillRect(x - 8, y - 14, R(16 * Math.max(0, e.ldOpen / LD.openT)), 2); }
    if (!open && !(e.ldRise > 0) && e.cnSkin !== SAND_SKIN && Math.random() < 0.3) ctx.ember(e.x + (Math.random() - 0.5) * 8, e.y - 14); };
  H.read = () => ({ ...H.n });
  return H;
}
