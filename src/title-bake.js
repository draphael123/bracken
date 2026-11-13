// THE TITLE'S TWO GRADIENTS, BAKED (claude/small1113). The title used to build a new createRadialGradient every frame for the campfire glow
// (radius 46 + sin*2) and another for the screen vignette, which never changes. Both are now drawn once into a small canvas and blitted. The
// glow's wobble is quantised to GLOW_STEPS radii across its +-2 px range (0.5 px apart: under one pixel of the picture, so no banding or pop).
// Without a canvas to bake into (a node tool) the old per-frame gradient path runs unchanged.
export const GLOW_STEPS = 9;
export const glowStep = time => Math.max(0, Math.min(GLOW_STEPS - 1, Math.round((Math.sin(time * 11) * 0.5 + 0.5) * (GLOW_STEPS - 1))));
const radiusOf = k => 44 + k * 4 / (GLOW_STEPS - 1);
// mk(w,h) -> a canvas or null
export function makeTitleBake(mkCanvas) {
  const glows = [], vig = {};
  const canvasOf = (w, h) => { try { const c = mkCanvas(w, h); return c && c.getContext && c.getContext('2d') ? c : null; } catch { return null; } };
  const paintGlow = (q, r) => { const gl = q.createRadialGradient(50, 50, 2, 50, 50, r); gl.addColorStop(0, 'rgba(255,170,90,0.42)'); gl.addColorStop(1, 'rgba(255,120,60,0)'); q.fillStyle = gl; q.fillRect(0, 0, 100, 70); };
  return {
    // the campfire glow centred on (fx, fy - 6): the rect fx-50..fx+50, fy-56..fy+14 exactly as before
    glow(g, fx, fy, time) {
      const k = glowStep(time); let c = glows[k];
      if (c === undefined) { c = canvasOf(100, 70); if (c) paintGlow(c.getContext('2d'), radiusOf(k)); glows[k] = c; }
      g.globalCompositeOperation = 'lighter';
      if (c) g.drawImage(c, fx - 50, fy - 56);
      else { const gl = g.createRadialGradient(fx, fy - 6, 2, fx, fy - 6, radiusOf(k)); gl.addColorStop(0, 'rgba(255,170,90,0.42)'); gl.addColorStop(1, 'rgba(255,120,60,0)'); g.fillStyle = gl; g.fillRect(fx - 50, fy - 56, 100, 70); }
      g.globalCompositeOperation = 'source-over';
    },
    vignette(g, VW, VH) {
      const key = VW + 'x' + VH; let c = vig[key];
      if (c === undefined) { c = canvasOf(VW, VH); if (c) { const q = c.getContext('2d'), vg = q.createRadialGradient(VW / 2, VH / 2, 60, VW / 2, VH / 2, 220); vg.addColorStop(0, 'rgba(10,6,20,0)'); vg.addColorStop(1, 'rgba(10,6,20,0.7)'); q.fillStyle = vg; q.fillRect(0, 0, VW, VH); } vig[key] = c; }
      if (c) g.drawImage(c, 0, 0);
      else { const vg = g.createRadialGradient(VW / 2, VH / 2, 60, VW / 2, VH / 2, 220); vg.addColorStop(0, 'rgba(10,6,20,0)'); vg.addColorStop(1, 'rgba(10,6,20,0.7)'); g.fillStyle = vg; g.fillRect(0, 0, VW, VH); }
    },
  };
}
export const defaultCanvas = (w, h) => { if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h); if (typeof document !== 'undefined' && document.createElement) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; } return null; };
