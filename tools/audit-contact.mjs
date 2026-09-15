// tools/audit-contact.mjs — CONTACT DURING PLAY, BY THE PIXELS. Findings only; it changes nothing.
// The load-time pass (node tools/headless.mjs floats) catches a sprite floating where it SPAWNS. This one lets the playtest bot
// (src/playtest.js) play every level (lifted to a quarter, half and three quarters of the way along, so the samples cover the level and
// not only its first screens) and, every few frames, reads the real frame: each creature and the hero are drawn again with them moved off
// the picture, and the pixels that change ARE the body. The shadow blob every walker stands on (PROP.shadow) is blanked while the body is
// read - it is drawn at the feet and would read as a sunk foot - and read on its own with a third picture. The lowest opaque row of the body
// is measured against the floor under it: the top of the standable tile (and its art's first opaque row) or the mover it rides, taken
// only near where the game itself stands the body; where there is no such tile (a ramp, a slope) the game's own foot line is the floor
// and the row says so (floorFrom: physics).
//   SUNK       opaque rows below the visible floor line by 2 px or more (a 1 px overlap is how the art is drawn to meet the ground)
//   HOVER      the lowest opaque row 2 px or more above the visible floor while the game says it is standing
//   TIP        a walker standing with fewer than 4 px of its collision width on the platform it stands on
//   AIR SHADOW the shadow blob drawn under a body that is more than 6 px off the floor
//   DUST       a landing's dust spawned above the hero's foot row
// Skipped: bodies cut by the screen edge, swimmers, the hero while flipped onto a ceiling, in a potion form or reeling from a blow.
// It writes a JSON with every sample, a per-level table, and a contact sheet of the worst 30 cases with the floor line (red) and the
// body's lowest row (cyan) drawn on the real frame, three times up.
//   node tools/audit-contact.mjs                     every campaign level, 40 s each, the five heroes in rotation
//   node tools/audit-contact.mjs wood,reef           those levels
//   OUT=<dir> SECS=40 EVERY=10 PORT=5908 node tools/audit-contact.mjs
// REPORT MODE: it prints and exits 0 unless the page throws.
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { openPage } from './cdp.mjs';

const OUT = process.env.OUT || 'audits/animation';
const SECS = +(process.env.SECS || 40), EVERY = +(process.env.EVERY || 10);
const HEROES = ['knight', 'warden', 'pyro', 'paladin', 'pirate', 'reaper'];
const arg = process.argv[2] || '';

// ---- the audit, run inside the page (no closures over this file: it is sent as source) ----
const PAGE = async function (o) {
  const BK = window.BK, lv = await import('/src/level.js'), PT = await import('/src/playtest.js');
  const { LEVELS, T, TS } = lv;
  const li = LEVELS.findIndex(l => l.id === o.level); if (li < 0) return { error: 'no level ' + o.level };
  const shake0 = BK.SET.shake; BK.SET.shake = false; BK.SET.sfx = 0; BK.SET.music = false;
  BK.setHero(o.hero); BK.load(li); BK.state = 'play'; BK.start(); BK.god = false; BK.reset();
  const L = BK.L, W = L.W, H = L.H, P = BK.P, FLY = BK.FLYERS, PROP = BK.PROP, shadow0 = PROP.shadow;
  const blank = document.createElement('canvas'); blank.width = shadow0 ? shadow0.width : 12; blank.height = shadow0 ? shadow0.height : 4;
  const STAND = new Set([T.SOLID, T.ONEWAY, T.PLANK, T.SHELF, T.RAIL, T.CRATE, T.PALISADE, T.PORT, T.CLIMB, T.SOFT, T.ICE, T.WEB, T.REED, T.BOUNCER, T.CRYST].filter(v => v !== undefined));
  const SOLIDT = new Set([T.SOLID, T.CRATE, T.PALISADE, T.PORT, T.CLIMB, T.SOFT, T.ICE, T.WEB].filter(v => v !== undefined));
  const tile = (tx, ty) => (tx < 0 || ty < 0 || tx >= W || ty >= H) ? T.SOLID : L.grid[ty * W + tx];
  const INWATER = new Set(['eel', 'angler', 'urchin', 'reefmaw', 'drownedking', 'kraken', 'feeler', 'gill', 'heart', 'mother']);
  const inPool = (x, y) => (L.pools || []).some(p => p.swim && x >= p.x0 && x <= p.x1 && y >= p.y && y <= (p.bottom !== undefined ? p.bottom : p.y + 60) + 2);
  const gateE = (L.ents || []).find(e => e.t === 'gate'); const goal = gateE ? gateE.x * TS : (W - 3) * TS;
  let bot = PT.makeBot(BK);
  const v = BK.view, VW = v.VW, VH = v.VH, g = v.buf.getContext('2d');
  const samples = [], crops = []; let renders = 0, lifted = 0, spread = 0; const deaths0 = BK.stats().deaths;
  const tileArtTop = (tx, ty) => { const ts = BK.tileSpr(); const c = ts && ts[ty * W + tx]; if (!c || !c.width) return 0; if (c.__top !== undefined) return c.__top;
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let top = c.height; for (let y = 0; y < c.height && top === c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 40) { top = y; break; } c.__top = top >= c.height ? 0 : top; return c.__top; };
  /* the floor NEAR where the game stands the body: a standable tile top from 6 px above its feet to 20 px below, or a mover top in the same band */
  const floorNear = (wx, cyWorld) => { const out = []; const tx = Math.floor(wx / TS);
    for (let ty = Math.floor((cyWorld - 6) / TS); ty <= Math.floor((cyWorld + 20) / TS); ty++) { if (ty < 0) continue; const top = ty * TS; if (top < cyWorld - 6 || top > cyWorld + 20) continue; if (STAND.has(tile(tx, ty)) && !SOLIDT.has(tile(tx, ty - 1))) out.push({ y: top, art: tileArtTop(tx, ty), from: 'tile' }); }
    for (const m of BK.movers()) { if (m.gone) continue; const top = m.y + (m.kind === 'pad' ? 2 : 0), w = m.w || 16; if (wx >= m.x - 2 && wx <= m.x + w + 2 && top >= cyWorld - 6 && top <= cyWorld + 20) out.push({ y: top, art: 0, from: 'mover' }); }
    return out; };
  const nextFooting = from => { for (let x = Math.max(2, from); x < W - 2; x++) for (let y = 1; y < H - 1; y++) if (STAND.has(tile(x, y)) && !SOLIDT.has(tile(x, y - 1)) && !SOLIDT.has(tile(x, y - 2)) && !inPool(x * TS + 8, y * TS - 4)) return [x, y - 1]; return null; };
  const cam = () => { const c = BK.cam; return [Math.round(Math.max(0, Math.min(W * TS - VW, c[0]))), Math.round(Math.max(0, Math.min(H * TS - VH, c[1])))]; };

  function sample(f, landed) {
    if (BK.textLab && BK.textLab.hint) BK.textLab.hint('', 0);   /* a first-time hint is an opaque plate over the hero: not the picture measured */
    /* a zoomed or rolled frame: the tiles are not where the numbers say. BK.view is a getter that returns a fresh object, so the
       zoom is read NOW - the `v` taken at the start kept z at 1 forever, and a boss's intro zoom was measured as a 9 px sink */
    const [cx, cy] = cam(), vNow = BK.view; if ((vNow.z || 1) !== 1 || vNow.tilt) return;
    const who = [];
    for (const e of BK.enemies()) { if (!e.alive || e.gone > 0 || e.harmless) continue; if (e.x < cx - 20 || e.x > cx + VW + 20 || e.y < cy - 10 || e.y > cy + VH + 30) continue; if (e.t === 'kraken' || e.t === 'krakenarm' || e.t === 'mother' || e.t === 'heart' || e.t === 'gill') continue; who.push(e); }
    /* THE HERO ONLY WHEN HE IS CALM: a swing's trail, a roll's ghost, a ward's ring, the harvest's smoke and a squash are all drawn with him
       and vanish when he is hidden, so they would be read as his body; and nobody in shallow water, where the art sinks them on purpose */
    const wading = (x, y) => (L.pools || []).some(p => x >= p.x0 && x <= p.x1 && y >= p.y - 2);
    const heroIn = !P.dead && !P.flip && !P.form && !(P.hurt > 0) && P.atk < 0 && !(P.dodge > 0) && !(P.dash > 0) && !P.block && !P.aegis && !P.warding && !(P.sqT > 0) && !(P.castT > 0) && !(P.blastT > 0) && !(P.harvest >= 100) && !wading(P.x, P.y) && P.x > cx - 20 && P.x < cx + VW + 20;
    for (let i = who.length - 1; i >= 0; i--) if (wading(who[i].x, who[i].y)) who.splice(i, 1);
    if (!who.length && !heroIn) return;
    PROP.shadow = blank;
    try {
      BK.step(0); renders++; const A = g.getImageData(0, 0, VW, VH), dA = A.data;
      let dB = null, dH = null, dS = null;
      if (who.length) { const saved = who.map(c => c.x); for (const c of who) c.x += 100000; BK.step(0); renders++; dB = g.getImageData(0, 0, VW, VH).data; who.forEach((c, i) => { c.x = saved[i]; }); }
      if (heroIn) { BK.hideHero = true; BK.step(0); renders++; dH = g.getImageData(0, 0, VW, VH).data; BK.hideHero = false; who.push(P); }
      /* THE SHADOW ON ITS OWN: the same frame with the blob put back, only when something is off its feet */
      const anyAir = who.some(c => c === P ? !P.ground && !P.swim : (c.vy && Math.abs(c.vy) > 1));
      if (anyAir) { PROP.shadow = shadow0; BK.step(0); renders++; dS = g.getImageData(0, 0, VW, VH).data; PROP.shadow = blank; }
      const boxes = who.map(c => { const hw = Math.round(Math.max(16, (c.w || 12) * 1.2 + 6)), hh = Math.round(Math.max(24, (c.h || 12) * 1.6 + 14)), sx = Math.round(c.x - cx), sy = Math.round(c.y - cy);
        return { c, d: c === P ? dH : dB, x0: Math.max(0, sx - hw), x1: Math.min(VW - 1, sx + hw), y0: Math.max(0, sy - hh), y1: Math.min(VH - 1, sy + 8), sx, sy, px: [] }; });
      const owner = new Map();
      for (let bi = 0; bi < boxes.length; bi++) { const b = boxes[bi], d = b.d;
        for (let y = b.y0; y <= b.y1; y++) for (let x = b.x0; x <= b.x1; x++) { const i = y * VW + x, j = i * 4;
          if (Math.abs(dA[j] - d[j]) + Math.abs(dA[j + 1] - d[j + 1]) + Math.abs(dA[j + 2] - d[j + 2]) <= 6) continue;
          const prev = owner.get(i); if (prev !== undefined && Math.abs(x - boxes[prev].sx) <= Math.abs(x - b.sx)) continue; owner.set(i, bi); } }
      for (const [i, bi] of owner) boxes[bi].px.push(i % VW, (i / VW) | 0);
      for (const b of boxes) { const c = b.c, isHero = c === P, t = isHero ? 'hero:' + o.hero : c.t;
        if (b.px.length < 24) continue;
        let low = -1, top = 1e9, bx0 = 1e9, bx1 = -1; for (let k = 1; k < b.px.length; k += 2) { const y = b.px[k], x = b.px[k - 1]; if (y > low) low = y; if (y < top) top = y; if (x < bx0) bx0 = x; if (x > bx1) bx1 = x; }
        if (bx0 <= 0 || bx1 >= VW - 1 || low >= VH - 1 || top <= 0) continue;   /* cut by the screen's edge */
        const cols = new Set(); for (let k = 1; k < b.px.length; k += 2) if (b.px[k] >= low - 1) cols.add(b.px[k - 1]);
        const footWorldY = cy + low + 1;
        const swimming = isHero ? !!P.swim : (INWATER.has(c.t) || inPool(c.x, c.y - 4));
        const flyer = !isHero && FLY.has(c.t);
        const grounded = isHero ? !!P.ground : ((c.ground === true || (c.ground === undefined && !flyer && !(c.air) && !(c.knock > 0))) && (c.vy === 0 || c.vy === undefined));
        const fl = new Map(); let pick = null;
        for (const sx of cols) { const cand = floorNear(cx + sx, c.y); if (!cand.length) continue; cand.sort((a, b2) => Math.abs(a.y - c.y) - Math.abs(b2.y - c.y)); const k = cand[0].y + ':' + cand[0].art + ':' + cand[0].from; fl.set(k, (fl.get(k) || 0) + 1); }
        let fn = 0; for (const [k, n] of fl) if (n > fn) { fn = n; pick = k; }
        let floorY = null, art = 0, floorFrom = null;
        if (pick) { const [yy, aa, ff] = pick.split(':'); floorY = +yy; art = +aa; floorFrom = ff; }
        if (grounded && (floorY === null || Math.abs(floorY - c.y) > 6)) { floorY = Math.round(c.y); art = 0; floorFrom = 'physics'; }
        const support = cols.size ? fn / cols.size : 0;
        let tipPx = null; if (!isHero && floorY !== null && floorFrom === 'tile' && !flyer) { const ty = Math.floor(floorY / TS); let ov = 0; const l = c.x - (c.w || 12) / 2, r = c.x + (c.w || 12) / 2; for (let tx = Math.floor(l / TS); tx <= Math.floor((r - 0.01) / TS); tx++) if (STAND.has(tile(tx, ty)) && !SOLIDT.has(tile(tx, ty - 1))) ov += Math.min(r, (tx + 1) * TS) - Math.max(l, tx * TS); tipPx = +ov.toFixed(1); }
        const gapTile = floorY === null ? null : floorY - footWorldY;   /* + hovering, - sunk: against the tile top */
        const gap = gapTile === null ? null : gapTile + art;                /* against the first opaque row of the tile's art: what the eye sees */
        let shadowN = 0; if (dS) { for (let y = Math.max(0, b.sy - 3); y <= Math.min(VH - 1, b.sy + 2); y++) for (let x = Math.max(0, b.sx - 7); x <= Math.min(VW - 1, b.sx + 6); x++) { const j = (y * VW + x) * 4; if (Math.abs(dS[j] - dA[j]) + Math.abs(dS[j + 1] - dA[j + 1]) + Math.abs(dS[j + 2] - dA[j + 2]) > 6) shadowN++; } }
        const airborne = !grounded && !swimming;
        const telling = !isHero && BK.telling(c);
        const floorBelow = (() => { const tx = Math.floor(c.x / TS); for (let ty = Math.floor(c.y / TS); ty < Math.min(H, Math.floor(c.y / TS) + 12); ty++) if (STAND.has(tile(tx, ty)) && !SOLIDT.has(tile(tx, ty - 1))) return ty * TS; return null; })();
        const s = { f, t, hero: isHero, telling, x: Math.round(c.x), y: Math.round(c.y), tx: Math.round(c.x / TS), ty: Math.round(c.y / TS), w: c.w, h: c.h, mode: isHero ? (P.atk >= 0 ? 'atk' : P.dodge > 0 ? 'roll' : P.block ? 'block' : P.climb ? 'climb' : P.onMover ? 'mover' : P.onRamp ? 'ramp' : 'move') : (c.mode || ''),
          low: cy + low, foot: footWorldY, floor: floorY, floorFrom, art, gapTile, gap, grounded, swimming, flyer, airborne, support: +support.toFixed(2), tipPx, shadowN, n: b.px.length / 2, box: [bx0 + cx, top + cy, bx1 + cx, low + cy] };
        s.sunk = gap !== null && grounded && gap <= -(telling ? 3 : 2) && !swimming; s.hover = gap !== null && gap >= 2 && grounded && !swimming; s.tip = tipPx !== null && grounded && tipPx < 4 && !swimming;
        s.airShadow = airborne && shadowN >= 6 && floorBelow !== null && (floorBelow - c.y) > 6;
        if (landed && isHero) { const fresh = BK.parts().filter(p => p.col === '#c9b27c' && p.life >= p.max - 0.001 && Math.abs(p.x - P.x) < 12 && Math.abs(p.y - P.y) < 12); if (fresh.length) { const ys = fresh.map(p => p.y); s.dustN = fresh.length; s.dustY = Math.min(...ys); s.dustVsFoot = +(Math.min(...ys) - (footWorldY - 1)).toFixed(1); } }
        samples.push(s);
        const worth = !isHero && !telling && (s.sunk || s.hover || s.tip);   /* the sheet is the creatures: the heroes' anchors are measured frame by frame in audit-hitboxes --hero */
        if (worth && crops.length < 80) {
          const S = 3, x0 = Math.max(0, bx0 - 10), x1 = Math.min(VW - 1, bx1 + 10), y0 = Math.max(0, top - 6), y1 = Math.min(VH - 1, low + 12);
          const cw = x1 - x0 + 1, ch = y1 - y0 + 1, src = document.createElement('canvas'); src.width = cw; src.height = ch; src.getContext('2d').putImageData(A, -x0, -y0);
          const cc = document.createElement('canvas'); cc.width = Math.max(cw * S, 150); cc.height = ch * S + 12; const gg = cc.getContext('2d'); gg.imageSmoothingEnabled = false; gg.fillStyle = '#000'; gg.fillRect(0, 0, cc.width, cc.height); gg.drawImage(src, 0, 0, cw * S, ch * S);
          gg.lineWidth = 1; if (floorY !== null) { const fy = (floorY - art - cy - y0 + art) * S; gg.strokeStyle = '#ff3030'; gg.beginPath(); gg.moveTo(0, (floorY + art - cy - y0) * S + 0.5); gg.lineTo(cw * S, (floorY + art - cy - y0) * S + 0.5); gg.stroke(); }
          { const ly = (low - y0 + 1) * S; gg.strokeStyle = '#40e0ff'; gg.beginPath(); gg.moveTo((bx0 - x0) * S, ly + 0.5); gg.lineTo((bx1 - x0 + 1) * S, ly + 0.5); gg.stroke(); }
          if (s.dustY !== undefined) { const dy = (s.dustY - cy - y0) * S; gg.strokeStyle = '#ffd36b'; gg.beginPath(); gg.moveTo(0, dy + 0.5); gg.lineTo(cw * S, dy + 0.5); gg.stroke(); }
          gg.fillStyle = '#fff'; gg.font = '9px monospace'; gg.fillText(o.level + ' ' + t + ' ' + (s.sunk ? 'SUNK ' + -gap : s.hover ? 'HOVER ' + gap : s.tip ? 'TIP ' + tipPx + 'px' : s.airShadow ? 'AIR SHADOW' : 'DUST ' + s.dustVsFoot) + ' ' + (floorFrom || '') + ' @' + s.tx + ',' + s.ty, 2, cc.height - 3);
          crops.push({ score: (s.sunk || s.hover ? Math.abs(gap) : s.tip ? 3 : 2) + (floorFrom === 'tile' ? 0.5 : 0), label: o.level + ' ' + t, kind: s.sunk ? 'sunk' : s.hover ? 'hover' : s.tip ? 'tip' : s.airShadow ? 'airShadow' : 'dust', png: cc.toDataURL('image/png'), w: cc.width, h: cc.height }); }
      }
    } finally { PROP.shadow = shadow0; BK.hideHero = false; }
  }
  const frames = Math.round(o.secs * 60); let dieAt = [], dSeen = BK.stats().deaths, wasLand = false;
  const lift = () => { const nx = nextFooting(Math.round(P.x / TS) + 5); if (nx) { BK.tp(nx[0], nx[1]); P.hp = P.maxHp; P.dead = 0; bot = PT.makeBot(BK); lifted++; } };
  for (let f = 0; f < frames; f++) {
    if (BK.state !== 'play') break;
    if (f > 0 && f % Math.round(frames / 4) === 0) { const nx = nextFooting(Math.round(W * (f / frames))); if (nx && nx[0] > P.x / TS) { BK.tp(nx[0], nx[1]); P.hp = P.maxHp; bot = PT.makeBot(BK); spread++; } }
    const r = bot(goal); BK.sim(1);
    const landed = P.landT > 0 && !wasLand; wasLand = P.landT > 0;
    if (f % o.every === 0 || landed) sample(f, landed);
    const dn = BK.stats().deaths; if (dn > dSeen) { dSeen = dn; dieAt.push(Math.round(P.x / TS)); if (dieAt.length >= 3 && Math.abs(dieAt[dieAt.length - 1] - dieAt[dieAt.length - 3]) < 9) { lift(); dieAt = []; } }
    if (r === 'stuck') lift();
    if (f % 300 === 299) await new Promise(res => setTimeout(res, 0));
  }
  BK.keys.left = BK.keys.right = BK.keys.jump = BK.keys.up = BK.keys.down = BK.keys.block = false; BK.SET.shake = shake0;
  window.__contactCrops = (window.__contactCrops || []).concat(crops);
  return { level: o.level, hero: o.hero, samples, renders, lifted, spread, deaths: BK.stats().deaths - deaths0, walked: Math.round(P.x / TS), W };
};
/* THE SHEET: the worst cases laid out on one canvas, in the page (the tile-floor cases first: those are the ones the tile grid vouches for) */
const SHEET = async function (n) {
  const crops = (window.__contactCrops || []).slice().sort((a, b) => b.score - a.score).slice(0, n); if (!crops.length) return null;
  const imgs = await Promise.all(crops.map(c => new Promise(res => { const im = new Image(); im.onload = () => res(im); im.src = c.png; })));
  const cols = 5, cw = Math.max(...crops.map(c => c.w)), ch = Math.max(...crops.map(c => c.h)), rows = Math.ceil(crops.length / cols);
  const c = document.createElement('canvas'); c.width = cols * (cw + 6) + 6; c.height = rows * (ch + 6) + 6; const g = c.getContext('2d'); g.fillStyle = '#101018'; g.fillRect(0, 0, c.width, c.height);
  imgs.forEach((im, i) => g.drawImage(im, 6 + (i % cols) * (cw + 6), 6 + Math.floor(i / cols) * (ch + 6)));
  return { png: c.toDataURL('image/png'), n: crops.length, kinds: crops.map(q => q.kind + ':' + q.label) };
};

async function main() {
  const pg = await openPage();
  const ids = arg ? arg.split(',') : await pg.evalp('import("/src/level.js").then(m => m.LEVELS.filter(l => (!l.hidden || l.secret) && l.id !== "custom" && !/^trial|^shop/.test(l.id)).map(l => l.id))');
  mkdirSync(OUT, { recursive: true });
  const levels = [], all = [];
  await pg.evalp('window.__contactCrops = []');
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i], hero = HEROES[i % HEROES.length], t0 = Date.now();
    let r; try { r = await pg.evalp('(' + PAGE.toString() + ')(' + JSON.stringify({ level: id, hero, secs: SECS, every: EVERY }) + ')'); }
    catch (e) { console.log(id.padEnd(11) + ' FAILED ' + e.message.split('\n')[0]); continue; }
    if (r.error) { console.log(id.padEnd(11) + ' ' + r.error); continue; }
    const by = {};
    for (const s of r.samples) { const k = s.t; const row = by[k] || (by[k] = { t: k, n: 0, contact: 0, physics: 0, sunk: 0, hover: 0, tip: 0, airShadow: 0, gaps: [], dust: [] });
      row.n++; if (s.gap !== null && s.grounded && !s.swimming) { row.contact++; row.gaps.push(s.gap); if (s.floorFrom === 'physics') row.physics++; } if (s.sunk) row.sunk++; if (s.hover) row.hover++; if (s.tip) row.tip++; if (s.airShadow) row.airShadow++; if (s.dustVsFoot !== undefined) row.dust.push(s.dustVsFoot); }
    const rows = Object.values(by).map(q => { q.gaps.sort((a, b) => a - b); q.medGap = q.gaps.length ? q.gaps[q.gaps.length >> 1] : null; q.minGap = q.gaps.length ? q.gaps[0] : null; q.maxGap = q.gaps.length ? q.gaps[q.gaps.length - 1] : null; delete q.gaps; return q; });
    levels.push({ id, hero, rows, renders: r.renders, lifted: r.lifted, spread: r.spread, deaths: r.deaths, walked: r.walked, W: r.W, secs: Math.round((Date.now() - t0) / 1000) });
    for (const s of r.samples) { s.level = id; all.push(s); }
    const flagged = rows.filter(q => q.sunk || q.hover || q.tip || q.airShadow);
    console.log(id.padEnd(11), hero.padEnd(8), String(r.samples.length).padStart(4) + ' samples', ' reached ' + r.walked + '/' + r.W, ' deaths ' + r.deaths, ' lifted ' + r.lifted, flagged.length ? ' [' + flagged.map(q => q.t + ' med' + q.medGap + (q.sunk ? ' sunk' + q.sunk : '') + (q.hover ? ' hover' + q.hover : '') + (q.tip ? ' tip' + q.tip : '') + (q.airShadow ? ' airsh' + q.airShadow : '') + '/' + q.n).join(', ') + ']' : ' clean', ' ' + Math.round((Date.now() - t0) / 1000) + 's');
    if (pg.errors.length) console.log('  page errors: ' + [...new Set(pg.errors.splice(0))].slice(0, 3).join(' | ').slice(0, 300));
  }
  const sheet = await pg.evalp('(' + SHEET.toString() + ')(30)');
  if (sheet) { writeFileSync(join(OUT, 'contact-worst30.png'), Buffer.from(sheet.png.split(',')[1], 'base64')); console.log('sheet: ' + join(OUT, 'contact-worst30.png') + ' (' + sheet.n + ' cases: ' + sheet.kinds.join(' ') + ')'); }
  writeFileSync(join(OUT, 'contact.json'), JSON.stringify({ levels, samples: all }));
  console.log('wrote ' + join(OUT, 'contact.json'));
  pg.close(); process.exit(0);
}
main().catch(e => { console.error(e.message); process.exit(1); });
