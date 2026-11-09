// SCREEN FIT and RESOLUTION (Settings > Picture; Daniel 11-08). Pure maths, no DOM, so tools/screenfit.mjs can test it.
//   SET.fit  'sharp' (default) | 'fill'   SHARP: whole-number pixel scale, borders. FILL: the scale is a float, the 16:9 picture fills the height or the width.
//   SET.res  'native' (default) | '1280x720' ... '3840x2160'   the display canvas's BACKING size is shrunk to fit inside that size (the CSS size stays the window).
export const FITS = ['sharp', 'fill'];
export const RESES = ['native', '1280x720', '1600x900', '1920x1080', '2560x1440', '3840x2160'];
export const FIT_LABEL = { sharp: 'SHARP', fill: 'FILL' };
export const resLabel = r => (r === 'native' ? 'NATIVE' : r);
export const cleanFit = f => (FITS.includes(f) ? f : 'sharp');
export const cleanRes = r => (RESES.includes(r) ? r : 'native');
export const cycle = (list, cur, dir) => list[(Math.max(0, list.indexOf(cur)) + dir + list.length) % list.length];
/* the backing-size factor in (0,1]: fit (nativeW x nativeH) inside the chosen resolution, never larger than native, aspect kept */
export function resFactor(res, nativeW, nativeH) {
  const m = /^(\d+)x(\d+)$/.exec(cleanRes(res)); if (!m) return 1;
  return Math.max(0.05, Math.min(1, +m[1] / Math.max(1, nativeW), +m[2] / Math.max(1, nativeH)));
}
/* the picture's scale on a (w x h) canvas for a (VW x VH) view. SHARP: floor (>= 1), capped by the old Pixel scale cap. FILL: the exact float, the cap ignored. */
export function pictureScale(w, h, VW, VH, fit = 'sharp', cap = 'auto') {
  const raw = Math.min(w / VW, h / VH);
  if (cleanFit(fit) === 'fill') return Math.max(0.1, raw);
  let S = Math.max(1, Math.floor(raw)); if (cap !== 'auto' && cap > 0) S = Math.min(S, cap); return S;
}
/* the drawn picture's size and offset: the size is rounded to whole canvas pixels (a float S makes VW*S fractional), centred */
export function pictureRect(w, h, VW, VH, S) {
  const dw = Math.round(VW * S), dh = Math.round(VH * S);
  return { dw, dh, offX: Math.floor((w - dw) / 2), offY: Math.floor((h - dh) / 2) };
}
/* whole-number scale for things that need one (the scanline pattern's period) */
export const wholeScale = S => Math.max(1, Math.round(S));
/* canvas px -> game px, the inverse of the draw */
export const toGamePx = (px, py, S, offX, offY) => [(px - offX) / S, (py - offY) / S];
