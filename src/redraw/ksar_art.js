// ksar_art.js - THE BANDIT KSAR's cast, GREYBOX skins (claude/ksar, the Opus greybox, 2026-10-07; the art pass replaces every one of these). Each reskin is its
// proven machine's own sheet with its colours shifted (every frame keeps its pose, its tells and its hit box), so the fort's men read apart from the gorge's
// and the well town's at a glance; THE HAWK SCOUT (the one new foe) and a bestiary card for THE HAWK-MISTRESS (she draws herself live in the fight) are
// plain shapes.
//   KSAR BLADE      the cutthroat in the fort's madder red          GONG LOOKOUT   the cutthroat in an ochre scarf (the runner: kill-first)
//   WHIP APPRENTICE the cutthroat in falconer's brown leather        SHIELD SENTRY  the shield guard in bronze and dark mail
//   SMOKE THROWER   the dynamite bandit in ash grey                  WALL SLINGER   the slinger in indigo
//   HAWK SCOUT      0,1 glide/flap | 2 shriek | 3 stoop tell | 4 stoop | 5 on the ground | 6 blind
import { canvas, rect, ellipse, line, outline, flipX, whiten, fillPoly } from '../px.js';

const pack = (frames, ax, ay, w, h) => { const R = frames, L = frames.map(c => flipX(c)), white = frames.map(c => whiten(c)); return { R, L, white: { R: white, L: white.map(c => flipX(c)) }, ax, ay, w, h }; };
/* every pixel through fn([r, g, b]) -> [r, g, b] (skin-ish warm light tones are kept so faces stay faces) */
function shift(base, fn) {
  if (!base || !base.R) return null;
  const frames = base.R.map(c => { const [d, g] = canvas(c.width, c.height); g.drawImage(c, 0, 0); const img = g.getImageData(0, 0, d.width, d.height), p = img.data;
    for (let i = 0; i < p.length; i += 4) { if (!p[i + 3]) continue; const r = p[i], gg = p[i + 1], b = p[i + 2];
      if (r > 150 && gg > 100 && b > 60 && r > b + 40 && r - gg < 70) continue;   /* skin and bone-light: kept */
      const [nr, ng, nb] = fn([r, gg, b]); p[i] = Math.max(0, Math.min(255, nr | 0)); p[i + 1] = Math.max(0, Math.min(255, ng | 0)); p[i + 2] = Math.max(0, Math.min(255, nb | 0)); }
    g.putImageData(img, 0, 0); return d; });
  return pack(frames, base.ax, base.ay, base.w, base.h);
}
const lum = ([r, g, b]) => 0.3 * r + 0.55 * g + 0.15 * b;
export const bakeKsarBlade = base => shift(base, c => { const l = lum(c); return [l * 1.35 + 20, l * 0.55, l * 0.45]; });
export const bakeGongLookout = base => shift(base, c => { const l = lum(c); return [l * 1.3 + 25, l * 1.05 + 10, l * 0.4]; });
export const bakeWhipApprentice = base => shift(base, c => { const l = lum(c); return [l * 1.15 + 18, l * 0.82 + 6, l * 0.55]; });
export const bakeShieldSentry = base => shift(base, c => { const l = lum(c); return [l * 1.2 + 10, l * 0.95, l * 0.6]; });
export const bakeSmokeThrower = base => shift(base, c => { const l = lum(c); return [l * 0.95 + 14, l * 0.95 + 12, l * 0.98 + 14]; });
export const bakeWallSlinger = base => shift(base, c => { const l = lum(c); return [l * 0.65, l * 0.7, l * 1.25 + 20]; });

/* THE HAWK SCOUT: a small brown hawk, a pale barred breast, yellow feet and eye */
const HK = { b: '#6a4428', B: '#8a5a32', d: '#3e2614', breast: '#e0caa0', bar: '#9a7a50', beak: '#d8b040', eye: '#ffd36b', red: '#ff4a3a' };
export function bakeHawk() {
  const W = 26, H = 18, OUT = '#1b1626';
  const body = (g, cx, cy, pitch = 0, eye = HK.eye) => { ellipse(g, cx, cy, 5, 3, HK.b); ellipse(g, cx + 1, cy + 1, 3, 1.6, HK.breast); rect(g, cx, cy + 1, 1, 1, HK.bar); rect(g, cx + 2, cy + 1, 1, 1, HK.bar);
    ellipse(g, cx + 5, cy - 2 + pitch, 2.2, 1.8, HK.B); rect(g, cx + 6, cy - 3 + pitch, 1, 1, eye); line(g, cx + 7, cy - 2 + pitch, cx + 8, cy - 1 + pitch, HK.beak);
    fillPoly(g, [[cx - 5, cy - 1], [cx - 10, cy], [cx - 9, cy + 2], [cx - 4, cy + 1]], HK.d); };
  const wing = (g, cx, cy, lift) => { fillPoly(g, [[cx - 3, cy - 1], [cx + 3, cy - 1], [cx + 1, cy - 1 - lift], [cx - 6, cy - lift]], HK.B); line(g, cx - 6, cy - lift, cx + 1, cy - 1 - lift, HK.d); };
  const F = Array.from({ length: 7 }, (_, f) => { const [c, g] = canvas(W, H), cx = 12, cy = 10;
    if (f === 0) { body(g, cx, cy); wing(g, cx, cy, 6); }
    else if (f === 1) { body(g, cx, cy); wing(g, cx, cy, -3); }
    else if (f === 2) { body(g, cx, cy, -2); wing(g, cx, cy, 8); wing(g, cx - 2, cy, 7); rect(g, cx + 8, cy - 4, 2, 1, HK.red); }
    else if (f === 3) { body(g, cx, cy, 1, HK.red); fillPoly(g, [[cx - 4, cy - 1], [cx + 3, cy - 2], [cx + 2, cy + 1]], HK.B); }
    else if (f === 4) { body(g, cx, cy + 2, 2, HK.red); fillPoly(g, [[cx - 5, cy], [cx + 3, cy - 1], [cx - 8, cy - 5]], HK.B); }
    else if (f === 5) { body(g, cx, cy + 3, 0); fillPoly(g, [[cx - 4, cy + 2], [cx + 3, cy + 1], [cx - 1, cy + 5]], HK.B); rect(g, cx - 1, cy + 6, 1, 2, HK.beak); rect(g, cx + 2, cy + 6, 1, 2, HK.beak); }
    else { body(g, cx, cy, -1, '#ffffff'); wing(g, cx, cy, 7); wing(g, cx + 2, cy, -4); }
    outline(c, OUT); return c; });
  return pack(F, 12, 14, 12, 10);
}
/* THE HAWK-MISTRESS's bestiary card: a falconer in a red-brown coat with her gauntlet raised and the hawk on it */
export function bakeHawkMistressCard() {
  const [c, g] = canvas(28, 38);
  rect(g, 8, 12, 12, 18, '#7a3a2a'); rect(g, 7, 28, 14, 4, '#7a3a2a'); rect(g, 9, 32, 4, 6, '#3a2418'); rect(g, 15, 32, 4, 6, '#3a2418');
  rect(g, 10, 5, 8, 7, '#c89870'); rect(g, 9, 3, 10, 3, '#2a1a12'); rect(g, 19, 10, 5, 8, '#c9a060');
  ellipse(g, 22, 7, 3, 2, '#6a4428'); rect(g, 24, 5, 1, 1, '#ffd36b'); line(g, 4, 20, 1, 34, '#3a2418');
  outline(c, '#1b1626');
  return pack([c, c], 14, 38, 16, 30);
}
/* every set at once (main.js: for (const k in K) SPR[k] = K[k]) */
export function bakeKsarSets(SPR) {
  const out = { hawkscout: bakeHawk(), hawkmistress: bakeHawkMistressCard() };
  const add = (k, v) => { if (v) out[k] = v; };
  add('ksarblade', bakeKsarBlade(SPR.cutthroat)); add('gonglookout', bakeGongLookout(SPR.cutthroat)); add('whipapprentice', bakeWhipApprentice(SPR.cutthroat));
  add('shieldsentry', bakeShieldSentry(SPR.shieldguard || SPR.shield)); add('smokethrower', bakeSmokeThrower(SPR.dynamiter || SPR.sapper)); add('wallslinger', bakeWallSlinger(SPR.slinger));
  return out;
}
