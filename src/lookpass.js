// src/lookpass.js — CAN YOU SEE WHERE TO STAND, AND WHAT IS COMING?   await BK.lookPass({ levels: ['undercrown'] })
//
// The floating-prop lab asks the tiles whether a sprite touches ground. This asks the PICTURE whether a player can read
// it. It stands the hero at every checkpoint, along the route the flood fill says is reachable (src/reachcore.js), and in
// the boss room (next to the boss, if it swims or flies out of frame), lets the camera and the dark settle, draws the
// frame the player gets, and measures five things:
//   FOOTING    every reachable standable tile top on screen: how far the tile's top band (six rows) stands off the air
//              just above it (CIE76 delta E, best row per column, median over the tile's columns). A walkway you cannot
//              see is a low number here.
//   CREATURES  every creature on screen: the frame is drawn again with the creatures moved off it, so the pixels that
//              change ARE the creature as drawn, and each is compared with what was behind it. p75 is how hard the most
//              visible quarter of the creature stands off its background: under 12 is a creature you find by being hit.
//   DARKNESS   the luminance of the open play space (pixels over air tiles, the HUD band left out): mean, median, p90 L*.
//   THE HERO   the frame drawn once without him: how many of his pixels stand off what is over and behind him (the foreground).
//   THE TELLS  where a ! would sit over every creature: the contrast of the mark's ink, or its line, against the pixels under it.
// Frames that fail come back with an annotated PNG (red: footing that does not read; magenta: a creature that does not;
// yellow frame: too dark; cyan: the hero behind the foreground; orange: a mark that would sink). A first-time hint is cleared before each picture. tools/lookpass.mjs drives it headless.
import { LEVELS, T, TS } from './level.js';
import { floodReach } from './reachcore.js';

const STAND = new Set([T.SOLID, T.ONEWAY, T.PLANK, T.SHELF, T.RAIL, T.CRATE]);
const SOLIDISH = new Set([T.SOLID, T.CRATE, T.PALISADE, T.PORT, T.CLIMB, T.SOFT, T.ICE, T.CRYST]);   /* not play space when it fills a pixel's tile */
/* THE ONES THAT ARE MEANT TO BE INVISIBLE: a feeler under the mud and a sweep in its hole are hidden by design, and the mud stirring
   is their tell. A creature in one of these modes is not judged (the playtest keeps the same kind of list, INROCK_FOE) */
const HIDDEN = { feeler: new Set(['hide', 'sink']), sweep: new Set(['hide']), lurker: new Set(['hide']), eel: new Set(['lurk', 'leapTell']) };   /* a river eel under its water is not drawn at all: its boil of bubbles and its mark are the tell */
export const LOOK = { hud: 46, footLow: 14, footFrac: 0.4, footMin: 5, creatureVisE: 20, creatureP75: 12, creatureMin: 24, darkP90: 20, darkMean: 9, heroMin: 60, tellRatio: 3 };   /* calibrated by eye: the Deep's lit floor (open p90 31) reads; the Undercrown's unlit tunnels (p90 6) do not. heroMin: a standing knight is ~220 pixels; under 60 of them clearing 12 dE is a hero behind something. tellRatio: WCAG 3:1, the least a mark's ink or line must stand off what it sits over */

const LIN = new Float32Array(256); for (let i = 0; i < 256; i++) { const c = i / 255; LIN[i] = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
const fLab = t => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
function labOf(d, n) {   /* the frame's RGBA as L*, a*, b* in one pass */
  const L = new Float32Array(n), A = new Float32Array(n), B = new Float32Array(n);
  for (let i = 0, j = 0; i < n; i++, j += 4) {
    const r = LIN[d[j]], g = LIN[d[j + 1]], b = LIN[d[j + 2]];
    const x = fLab((0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047), y = fLab(0.2126 * r + 0.7152 * g + 0.0722 * b), z = fLab((0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883);
    L[i] = 116 * y - 16; A[i] = 500 * (x - y); B[i] = 200 * (y - z);
  }
  return { L, A, B };
}
const dE = (P, i, Q, j) => Math.hypot(P.L[i] - Q.L[j], P.A[i] - Q.A[j], P.B[i] - Q.B[j]);

// WHERE TO STAND: the checkpoints, a sample of the reachable footing every `every` columns (one per band of rows), the boss rooms
function points(L, o) {
  const out = [], every = o.every || 40, band = 10;
  const R = floodReach(L, T, { rides: true });
  /* A PICTURE AT CHOSEN PLACES ONLY. A place is [tx, ty], or a selector found in the BUILT level (the builders shift what they
     graft, so level.js numbers are not where things end up): 'tile=RAIL', 'ent=deco.column', 'ent=check', 'pool=foul', with
     '#n' for the n-th match. The hero is stood on the reachable tile nearest it. */
  if (o.at) return { out: o.at.map(a => {
    if (Array.isArray(a)) return { kind: 'at', tx: a[0], ty: a[1], sel: a.join(',') };
    const m = String(a).match(/^(tile|ent|pool)=([\w.]+)(?:#(\d+))?$/); if (!m) return null;
    const [, what, name, nth] = m; let hits = [];
    if (what === 'tile' && T[name] !== undefined) { for (let y = 0; y < L.H; y++) for (let x = 0; x < L.W; x++) if (L.grid[y * L.W + x] === T[name]) hits.push([x, y - 1]); }
    if (what === 'ent') { const [t, kind] = name.split('.'); hits = (L.ents || []).filter(e => e.t === t && (!kind || e.kind === kind)).map(e => [e.x, e.y]); }
    if (what === 'pool') hits = (L.pools || []).filter(p => p[name]).map(p => [Math.round((p.x0 + p.x1) / 2 / TS), Math.floor(p.y / TS) - 1]);
    if (!hits.length) return null;
    const [hx, hy] = hits[Math.min(hits.length - 1, nth !== undefined ? +nth : hits.length >> 1)];
    let best = null, bd = 1e9; for (const k of R.seen) { const [x, y] = k.split(',').map(Number); const d = Math.abs(x - hx) + Math.abs(y - hy) * 1.5; if (d < bd) { bd = d; best = [x, y]; } }
    return { kind: 'at', tx: best && bd < 30 ? best[0] : hx, ty: best && bd < 30 ? best[1] : hy, sel: String(a) };
  }).filter(Boolean), seen: R.seen };
  const byB = new Map();
  for (const k of R.seen) { const [x, y] = k.split(',').map(Number); if (x < 0 || y < 0 || x >= L.W || y >= L.H) continue;
    const b = Math.floor(x / every) + ':' + Math.floor(y / band); const c = (Math.floor(x / every) + 0.5) * every;
    const cur = byB.get(b); if (!cur || Math.abs(x - c) < Math.abs(cur[0] - c)) byB.set(b, [x, y]); }
  let route = [...byB.values()].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const max = o.max || 40; if (route.length > max) { const step = route.length / max; route = Array.from({ length: max }, (_, i) => route[Math.floor(i * step)]); }
  for (const e of (L.ents || [])) if (e.t === 'check') out.push({ kind: 'check', tx: e.x, ty: e.y });
  for (const [x, y] of route) out.push({ kind: 'route', tx: x, ty: y });
  for (const [nm, A] of [['arena', L.arena], ['mini', L.mini]]) if (A && A.floor !== undefined) {
    const x0 = A.x0 !== undefined ? A.x0 : A.trigger, x1 = A.x1 !== undefined ? A.x1 : A.trigger + 200;
    out.push({ kind: nm, tx: Math.round((x0 + x1) / 2 / TS), ty: Math.round(A.floor / TS) - 1 }); }
  return { out, seen: R.seen };
}

export async function lookPass(BK, o = {}) {
  const want = o.levels || null, frames = [], shots = o.shots !== false;
  const idx = LEVELS.map((l, i) => i).filter(i => { const l = LEVELS[i]; return (!l.hidden || l.secret) && l.id !== 'custom' && (!want || want.includes(l.id)); });
  const shake0 = BK.SET.shake; BK.SET.shake = false;
  for (const li of idx) {
    const id = LEVELS[li].id;
    try { BK.load(li); } catch (e) { frames.push({ id, error: 'will not load: ' + e.message }); continue; }
    BK.state = 'play'; BK.god = true; BK.sim(180);   /* past the level's title card and the iris */
    const L = BK.L, { out: pts, seen } = points(L, o);
    let pi = 0;
    for (const pt of pts) {
      const P = BK.P; BK.reset();
      const boss = pt.kind === 'arena' || pt.kind === 'mini';
      BK.look(pt.tx, pt.ty); BK.sim(boss ? (o.bossFrames || 300) : (o.settle || 45));
      /* A HERO WHO DIED IN THE SETTLE (a kill zone, the dark's own teeth) is put back and the frame taken at once */
      if (P.dead || P.hp <= 0) { BK.reset(); BK.look(pt.tx, pt.ty); BK.sim(1); BK.reset(); }
      /* A NAME CARD IS A MOMENT, NOT THE LEVEL: a route point that wakes a mini or a boss gets its intro (black bars, the world dimmed
         behind the name) and the Undercrown's galleries measured as black as the Overman's card. Wait it out, and the level's banner too. */
      for (let k = 0; k < 4 && (BK.bannerT > 0 || (BK.miniIntroT || 0) > 0 || (BK.boss && BK.boss.alive && BK.boss.mode === 'wake')); k++) BK.sim(60);
      /* THE BOSS IN THE PICTURE: a boss that swims or flies is often out of frame when the hero stands mid-room; go stand by it */
      let bossInfo = null;
      if (boss) { const A = pt.kind === 'arena' ? L.arena : L.mini, b = A && BK.enemies().find(e => e.t === A.boss && e.alive);
        if (b) { const vx = BK.view;
          if (Math.abs(b.x - (vx.x + vx.VW / 2)) > vx.VW / 2 - 40 || Math.abs(b.y - (vx.y + vx.VH / 2)) > vx.VH / 2 - 30) {
            P.x = b.x + (b.x > P.x ? -56 : 56); P.y = b.y; P.vx = P.vy = 0; BK.sim(40); if (P.dead) { BK.reset(); P.x = b.x - 56; P.y = b.y; BK.sim(1); } }
          bossInfo = { t: b.t, mode: b.mode, x: Math.round(b.x / TS), y: Math.round(b.y / TS) }; } }
      if (BK.state !== 'play') BK.state = 'play';
      if (BK.textLab && BK.textLab.hint) BK.textLab.hint('', 0);   /* a first-time hint is a moment; the level's art is what is measured */
      BK.step(0);
      const v = BK.view, VW = v.VW, VH = v.VH, W = L.W, H = L.H;
      const cx = Math.round(Math.max(0, Math.min(W * TS - VW, v.x))), cy = Math.round(Math.max(0, Math.min(H * TS - VH, v.y)));
      const g = v.buf.getContext('2d'), imgA = g.getImageData(0, 0, VW, VH), A = labOf(imgA.data, VW * VH);
      const fr = { id, i: pi++, kind: pt.kind, tx: pt.tx, ty: pt.ty, hx: Math.round(P.x / TS), hy: Math.round(P.y / TS), cx, cy, VW, VH, dead: !!P.dead, boss: bossInfo, warped: (v.z || 1) !== 1 || !!v.tilt };   /* a boss zoom or a rolling deck: the tiles are not where the numbers say, so footing and creatures are not measured */
      // DARKNESS OF THE PLAY SPACE: only the pixels over open tiles, under the HUD band. A frame of rock wall is not dark play.
      { const vals = []; let s = 0;
        for (let y = LOOK.hud; y < VH; y++) { const ty = Math.floor((y + cy) / TS); for (let x = 0; x < VW; x++) { const tx = Math.floor((x + cx) / TS);
          if (tx < 0 || ty < 0 || tx >= W || ty >= H || SOLIDISH.has(L.grid[ty * W + tx])) continue; const l = A.L[y * VW + x]; vals.push(l); s += l; } }
        vals.sort((a, b) => a - b); const n = vals.length, open = +(n / (VW * (VH - LOOK.hud))).toFixed(2);
        fr.dark = n > VW * 8 ? { open, mean: +(s / n).toFixed(1), p50: +vals[n >> 1].toFixed(1), p90: +vals[Math.floor(n * 0.9)].toFixed(1) } : { open, mean: null, p50: null, p90: null };
        fr.dark.bad = fr.dark.mean !== null && (fr.dark.p90 < LOOK.darkP90 || fr.dark.mean < LOOK.darkMean); }
      // FOOTING
      { const tiles = [];
        const tile = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : L.grid[y * W + x];
        for (let ty = Math.floor(cy / TS); ty <= Math.floor((cy + VH) / TS); ty++) for (let tx = Math.floor(cx / TS); tx <= Math.floor((cx + VW) / TS); tx++) {
          const t = tile(tx, ty); if (fr.warped || !STAND.has(t) || tile(tx, ty - 1) !== T.AIR || !seen.has(tx + ',' + (ty - 1))) continue;
          const sx = tx * TS - cx, sy = ty * TS - cy; if (sx < 0 || sx + TS > VW || sy - 8 < LOOK.hud || sy + 3 > VH) continue;
          const cols = [];
          for (let c = 0; c < TS; c++) { let bL = 0, bA = 0, bB = 0; for (let r = 2; r <= 7; r++) { const j = (sy - r) * VW + sx + c; bL += A.L[j]; bA += A.A[j]; bB += A.B[j]; }
            const bg = { L: [bL / 6], A: [bA / 6], B: [bB / 6] }; let best = 0;
            for (let r = 0; r < 6; r++) { if (sy + r >= VH) break; const j = (sy + r) * VW + sx + c; best = Math.max(best, dE(A, j, bg, 0)); }   /* the walkway's band: a light course a few rows down reads as the ledge too */
            cols.push(best); }
          cols.sort((a, b) => a - b); const e = cols[TS >> 1];
          tiles.push({ tx, ty, t, sx, sy, e: +e.toFixed(1), low: e < LOOK.footLow });
        }
        const low = tiles.filter(q => q.low);
        fr.foot = { n: tiles.length, low: low.length, frac: tiles.length ? +(low.length / tiles.length).toFixed(2) : 0, median: tiles.length ? tiles.map(q => q.e).sort((a, b) => a - b)[tiles.length >> 1] : null,
          lowTiles: low.slice(0, 40).map(q => [q.tx, q.ty, q.e]) };
        fr.foot.bad = tiles.length >= LOOK.footMin && fr.foot.frac >= LOOK.footFrac;
        fr._low = low; }
      // CREATURES: draw again with them off the frame, and the pixels that change are the creature
      { const on = fr.warped ? [] : BK.enemies().filter(e => e.alive && e.x > cx - 40 && e.x < cx + VW + 40 && e.y > cy - 20 && e.y < cy + VH + 80);
        fr.creatures = [];
        if (on.length) {
          const saved = on.map(e => [e, e.x]); for (const e of on) e.x += 100000;
          BK.step(0); const imgB = g.getImageData(0, 0, VW, VH), Bl = labOf(imgB.data, VW * VH); fr._imgB = imgB;   /* (kept for the tells: the pixels a mark would sit over, with no creature under it) */
          for (const [e, x] of saved) e.x = x;
          BK.step(0);
          const dA = imgA.data, dB = imgB.data;
          for (const e of on) {
            if (HIDDEN[e.t] && HIDDEN[e.t].has(e.mode)) continue;
            /* THE BOX IS THE BODY. It was a generous box round the creature's hitbox, and a creature that carries a light (an angler,
               the Drowned King, whose eyes open the dark for ninety pixels round him) had the whole soft edge of that light counted
               as itself: seven thousand pixels that changed a little, and a p75 that could never clear 12 whatever his body did.
               The draw loop remembers the set and frame it drew (e.lastSet, e.lastFrame, e.lastBigF), so the box is the sprite's own
               footprint, three pixels either side, and the creature is measured by its body; the old box is kept for anything drawn
               some other way. */
            let x0, x1, y0, y1;
            const S = e.lastSet; let c0 = S && (e.face < 0 ? S.L : S.R);   /* a foe's set is an array of frames a side (a hero's is keyed by pose, and has no width: the old box) */
            if (Array.isArray(c0)) c0 = c0[(((e.lastFrame || 0) % c0.length) + c0.length) % c0.length];
            if (c0 && c0.width && S.ax !== undefined) { const k = e.lastBigF || 1, ax = e.face < 0 ? c0.width - S.ax : S.ax;
              x0 = Math.max(0, Math.floor(e.x - ax * k - cx) - 3); x1 = Math.min(VW - 1, Math.ceil(e.x - ax * k + c0.width * k - cx) + 3); y0 = Math.max(0, Math.floor(e.y - S.ay * k - cy) - 3); y1 = Math.min(VH - 1, Math.ceil(e.y - S.ay * k + c0.height * k - cy) + 3); }
            else { const hw = Math.max(20, (e.w || 12) * 1.6), hh = Math.max(36, (e.h || 12) * 2.4);
            /* only the play space is judged: under the HUD band the plates are opaque, and what shows between them is a sliver
               of a creature nobody is looking at (a scout behind the health bar, a petrel behind the tide gauge, both flagged) */
              x0 = Math.max(0, Math.floor(e.x - cx - hw)); x1 = Math.min(VW - 1, Math.ceil(e.x - cx + hw)); y0 = Math.max(LOOK.hud, Math.floor(e.y - cy - hh)); y1 = Math.min(VH - 1, Math.ceil(e.y - cy + 6)); }
            /* THE BODY, NOT ITS LIGHT. A pixel that changed at all (more than 6 across the three channels) used to be the creature; a
               creature that carries a light - the anglers, the Drowned King's eyes - changes every pixel under the soft edge of it
               by a little, and those thousands of barely-changed pixels were three quarters of "the creature", so its p75 could
               never clear 12 whatever its body did. Now a pixel is the body when it changed by more than 24; the faint set is kept
               only for a creature with no solid body at all (fewer than creatureMin such pixels), which is then measured as the ghost
               it is, not skipped. */
            let n = 0, vis = 0, sumA = 0, sumB = 0, bx0 = 1e9, by0 = 1e9, bx1 = -1, by1 = -1; const ds = [], faint = [];
            for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const i = y * VW + x, j = i * 4;
              const ch = Math.abs(dA[j] - dB[j]) + Math.abs(dA[j + 1] - dB[j + 1]) + Math.abs(dA[j + 2] - dB[j + 2]); if (ch <= 6) continue;
              if (ch <= 24) { faint.push(i); continue; }
              n++; const d = dE(A, i, Bl, i); ds.push(d); if (d >= LOOK.creatureVisE) vis++; sumA += A.L[i]; sumB += Bl.L[i];
              if (x < bx0) bx0 = x; if (x > bx1) bx1 = x; if (y < by0) by0 = y; if (y > by1) by1 = y; }
            if (n < LOOK.creatureMin) for (const i of faint) { n++; const d = dE(A, i, Bl, i); ds.push(d); if (d >= LOOK.creatureVisE) vis++; sumA += A.L[i]; sumB += Bl.L[i];
              const x = i % VW, y = (i / VW) | 0; if (x < bx0) bx0 = x; if (x > bx1) bx1 = x; if (y < by0) by0 = y; if (y > by1) by1 = y; }
            if (n < 6) continue;
            if (bx0 <= 0 || bx1 >= VW - 1) continue;   /* cut by the edge of the screen: two columns of a tideguard walking off it are not a creature */
            ds.sort((a, b) => a - b);
            /* p75: how hard the most visible quarter of the creature stands off what is behind it. A ghost drawn at half alpha
               with a bright crown reads; a black goblin in a black tunnel does not, whatever fraction of it changed a little. */
            const c = { t: e.t, boss: !!e.maxHp || !!e.mini, mode: e.mode || '', x: Math.round(e.x / TS), y: Math.round(e.y / TS), n, vis: +(vis / n).toFixed(2), p75: +ds[Math.floor(n * 0.75)].toFixed(1), Lcre: +(sumA / n).toFixed(1), Lbg: +(sumB / n).toFixed(1), box: [bx0, by0, bx1, by1] };
            c.bad = n >= LOOK.creatureMin && c.p75 < LOOK.creatureP75;
            fr.creatures.push(c);
          }
        } }
      // THE HERO: the frame again without him (BK.hideHero), so the pixels that change are him as drawn, and how many of them stand
      // off what is in front of and behind him. A post or a strip laid over him at full strength changes nothing there, and a hero
      // you cannot see is worse than a creature you cannot: `strong` is the count of his pixels that clear the creature threshold.
      { BK.hideHero = true; BK.step(0); const imgH = g.getImageData(0, 0, VW, VH), Hl = labOf(imgH.data, VW * VH); BK.hideHero = false; BK.step(0);
        const dA = imgA.data, dH = imgH.data, hx = Math.round(P.x - cx), hy = Math.round(P.y - cy);
        const x0 = Math.max(0, hx - 14), x1 = Math.min(VW - 1, hx + 14), y0 = Math.max(0, hy - 36), y1 = Math.min(VH - 1, hy + 2);
        let n = 0, strong = 0; const ds = [];
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const i = y * VW + x, j = i * 4;
          if (Math.abs(dA[j] - dH[j]) + Math.abs(dA[j + 1] - dH[j + 1]) + Math.abs(dA[j + 2] - dH[j + 2]) <= 6) continue;
          n++; const d = dE(A, i, Hl, i); ds.push(d); if (d >= LOOK.creatureP75) strong++; }
        ds.sort((a, b) => a - b);
        const onScreen = hx >= 0 && hx < VW && hy >= LOOK.hud && hy < VH;
        fr.hero = { n, strong, p75: n ? +ds[Math.floor(n * 0.75)].toFixed(1) : 0, front: BK.front ? { fade: +BK.front.fade.toFixed(2), covered: BK.front.covered } : null, onScreen, box: [x0, y0, x1, y1] };
        fr.hero.bad = onScreen && !fr.warped && !P.dead && strong < LOOK.heroMin; }
      // THE TELLS: where a mark would sit over every creature on screen (the wind-up's own place: e.y - e.h - 12, clamped the way
      // drawTells clamps), the pixels it would sit over are read from the frame with the creatures off it, and the mark's contrast
      // is the WCAG ratio of its ink against them - or of its outline against them, whichever is higher, because that is the edge
      // the eye finds: the yellow reads on the dark, the black line reads on the sky. Every ink the game uses (yellow, red, and
      // the blue the colour-safe setting turns red into); under 3:1 is a mark that sinks.
      { const YOF = c => { const ch = [c.slice(1, 3), c.slice(3, 5), c.slice(5, 7)].map(h => parseInt(h, 16) / 255).map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)); return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]; };
        const INKS = { yellow: '#ffd36b', red: '#ff6b6b', blue: '#5aa8ff' }, LINE = '#1b1626', SHADOW = '#08060c', PLATE = '#2a0c12', RIM = '#f4e6e0';
        const YL = YOF(LINE), YS = YOF(SHADOW), YP = YOF(PLATE), YR = YOF(RIM), YI = {}; for (const k in INKS) YI[k] = YOF(INKS[k]);
        const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
        /* the yellow ! is ink, line and shadow straight on the ground: the best of the three edges. The red !! (blue, colour-safe) is a BADGE:
           its ink sits on its own dark plate (that ratio never changes), and the badge stands off the ground by its pale rim, its plate or its
           shadow, whichever is the stronger edge; the mark reads only if both the ink on the plate and the badge on the ground do */
        const markRatio = (k, bg) => k === 'yellow' ? Math.max(ratio(YI[k], bg), ratio(YL, bg), ratio(YS, bg)) : Math.min(ratio(YI[k], YP), Math.max(ratio(YR, bg), ratio(YP, bg), ratio(YS, bg)));
        const src = fr.warped ? null : (fr._imgB || imgA);
        fr.tells = [];
        if (src) for (const e of BK.enemies()) { if (!e.alive || e.harmless) continue;
          const w = 8, x = Math.round(Math.max(w / 2 + 2, Math.min(VW - w / 2 - 2, e.x - cx))), y = Math.round(Math.max(4, Math.min(VH - 14, e.y - e.h - 12 - cy)));
          if (e.x - cx < -8 || e.x - cx > VW + 8 || y < LOOK.hud) continue;   /* a mark in the HUD band is pushed off the plates by drawTells; not what is measured here */
          const d = src.data; let sy = 0, n = 0;
          for (let yy = y - 1; yy < y + 11; yy++) for (let xx = x - 4; xx < x + 4; xx++) { if (xx < 0 || yy < 0 || xx >= VW || yy >= VH) continue; const j = (yy * VW + xx) * 4; sy += 0.2126 * LIN[d[j]] + 0.7152 * LIN[d[j + 1]] + 0.0722 * LIN[d[j + 2]]; n++; }
          if (!n) continue; const bg = sy / n, line = ratio(YL, bg), out = { t: e.t, x, y, bgY: +bg.toFixed(3), line: +line.toFixed(2) };
          for (const k in INKS) out[k] = +markRatio(k, bg).toFixed(2);
          out.min = Math.min(out.yellow, out.red, out.blue); out.bad = out.min < LOOK.tellRatio; fr.tells.push(out); } }
      fr.bad = fr.dark.bad || fr.foot.bad || fr.creatures.some(c => c.bad) || fr.hero.bad || fr.tells.some(t => t.bad);
      fr._img = imgA;
      frames.push(fr);
      await new Promise(r => setTimeout(r, 0));
    }
    // ONE PICTURE PER LEVEL, clean or not: the route point nearest the middle of the level
    const mine = frames.filter(f => f.id === id && !f.error);
    if (mine.length) { const mid = L.W / 2; const rep = mine.filter(f => f.kind === 'route').sort((a, b) => Math.abs(a.tx - mid) - Math.abs(b.tx - mid))[0] || mine[0]; rep.rep = true; }
    for (const f of mine) { if (shots && (f.bad || f.rep || f.boss || f.kind === 'at')) f.png = annotate(f); delete f._img; delete f._low; delete f._imgB; }
  }
  BK.SET.shake = shake0; BK.god = false;
  const out = { frames, look: LOOK };
  if (typeof window !== 'undefined') window.__lookPass = out;
  return out;
}

// THE PICTURE, three times up so a person can see it, with what failed drawn round it
function annotate(f) {
  const S = 3, c = document.createElement('canvas'); c.width = f.VW * S; c.height = f.VH * S;
  const src = document.createElement('canvas'); src.width = f.VW; src.height = f.VH; src.getContext('2d').putImageData(f._img, 0, 0);
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(src, 0, 0, c.width, c.height);
  g.lineWidth = 2;
  for (const q of f._low) { g.strokeStyle = 'rgba(255,40,40,0.95)'; g.beginPath(); g.moveTo(q.sx * S + 2, q.sy * S - 2); g.lineTo((q.sx + TS) * S - 2, q.sy * S - 2); g.stroke(); }
  g.font = '12px monospace';
  for (const cr of f.creatures) { const bad = cr.bad; if (!bad && !cr.boss) continue;
    g.strokeStyle = bad ? '#ff40ff' : '#40ff80'; g.strokeRect(cr.box[0] * S - 3, cr.box[1] * S - 3, (cr.box[2] - cr.box[0] + 1) * S + 6, (cr.box[3] - cr.box[1] + 1) * S + 6);
    g.fillStyle = bad ? '#ff40ff' : '#40ff80'; g.fillText(cr.t + ' p75 dE ' + cr.p75, cr.box[0] * S, cr.box[1] * S - 6); }
  if (f.dark.bad) { g.strokeStyle = '#ffd000'; g.lineWidth = 4; g.strokeRect(2, 2, c.width - 4, c.height - 4); }
  if (f.hero && f.hero.bad) { const b = f.hero.box; g.strokeStyle = '#40c0ff'; g.lineWidth = 2; g.strokeRect(b[0] * S - 3, b[1] * S - 3, (b[2] - b[0] + 1) * S + 6, (b[3] - b[1] + 1) * S + 6); g.fillStyle = '#40c0ff'; g.fillText('hero ' + f.hero.strong + ' px', b[0] * S, b[1] * S - 6); }   /* cyan: a hero behind the foreground */
  for (const t of (f.tells || [])) if (t.bad) { g.strokeStyle = '#ff9a20'; g.lineWidth = 2; g.strokeRect((t.x - 4) * S - 2, (t.y - 1) * S - 2, 8 * S + 4, 12 * S + 4); g.fillStyle = '#ff9a20'; g.fillText('tell ' + t.min + ':1', (t.x - 4) * S, (t.y - 1) * S - 6); }   /* orange: a mark that would sink here */
  const lab = f.id + ' ' + f.kind + ' @' + f.tx + ',' + f.ty + '  open L* mean ' + f.dark.mean + ' p90 ' + f.dark.p90 + '  footing ' + f.foot.low + '/' + f.foot.n + ' low' + (f.creatures.length ? '  creatures ' + f.creatures.filter(q => q.bad).length + '/' + f.creatures.length + ' low' : '') + (f.hero ? '  hero ' + f.hero.strong + 'px' + (f.hero.front && f.hero.front.fade > 0.05 ? ' fade ' + f.hero.front.fade : '') : '') + (f.tells && f.tells.length ? '  tells min ' + Math.min(...f.tells.map(t => t.min)).toFixed(1) + ':1' : '') + (f.boss ? '  boss ' + f.boss.t + ' (' + f.boss.mode + ')' : '');
  g.fillStyle = 'rgba(0,0,0,0.7)'; g.fillRect(0, c.height - 18, c.width, 18); g.fillStyle = '#fff'; g.fillText(lab, 6, c.height - 5);
  return c.toDataURL('image/png');
}
