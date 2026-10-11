// src/redraw/buried_city_backdrop.js - THE BURIED CITY's BACKDROP (claude/buriedcity2, the OPUS design pass, 2026-10-11: PLACEHOLDER shapes in the right places;
// the SONNET art pass redraws every layer - its list is in work/claude/lane-done/claude-buriedcity2.md). The review's M2: the greybox showed an OPEN DESERT SKY
// (sunset, sun disc, clouds, dunes) on every street of a city that is BURIED. Now:
//   - THE DUNES (cols 0-37) keep the sky: it fades out as the camera goes down the sinkhole, and never shows again
//   - UNDER THE SAND ROOF: a dim coursed back wall (warm near the lamps, cold sand-shadow away from them), far arches and columns of the buried city, the roof's
//     UNDERSIDE as a ceiling band (beams and buried rooftops hanging in the sand, grains sifting through its cracks)
//   - THE HOURGLASS TOWER (the landmark, brief 2): a vast glass-and-brass column the city is built round, ALWAYS in view (parallax 0.035: it drifts a few hundred
//     pixels across the whole level and grows as you near the throne at its foot); THE SAND RUNS IN IT - the level's clock: its upper bulb empties as you go
//   - the shafts' light is drawn in the world (src/buried-city-hands.js drawWorld): only where the roof is open
// main.js calls drawBackdrop(g, cx, cy, VW, VH, L, time, dY) in place of the sky's far layers (and always, whatever the parallax setting: there is no sky to show).
const R = Math.round;
const PAL = { wall: '#3a2a1c', wallHi: '#4a3624', course: '#2c2016', arch: '#24190f', roof: '#1c140c', roofHi: '#5a4028', sand: '#c9a464', glass: 'rgba(200,230,240,0.22)', brass: '#b08a3a', brassHi: '#e0b860' };

export function drawBackdrop(g, cx, cy, VW, VH, L, time, dY = 0) {
  const TS = 16, levelW = L.W * TS, open = 38 * TS;
  /* how much of the view is the DUNES' sky (the camera's centre over the dunes, fading out down the sinkhole) */
  const mid = cx + VW / 2, sky = Math.max(0, Math.min(1, (open - mid) / (8 * TS) + 0.5));
  /* 1. THE BACK WALL (opaque: it covers the desert sky the shared renderer laid first) */
  g.globalAlpha = 1 - sky * 0.999;
  if (g.globalAlpha > 0.001) {
    const gr = g.createLinearGradient(0, 0, 0, VH); gr.addColorStop(0, '#1a120a'); gr.addColorStop(0.35, PAL.wall); gr.addColorStop(1, '#2a1e14'); g.fillStyle = gr; g.fillRect(0, 0, VW, VH);
    /* coursed stone, parallax 0.5 (a far wall, not the tiles) */
    const px = cx * 0.5, py = cy * 0.5; g.fillStyle = PAL.course;
    for (let y = -((py % 12) + 12) % 12; y < VH; y += 12) { g.fillRect(0, R(y), VW, 1); const off = (Math.floor((y + py) / 12) & 1) ? 16 : 0; for (let x = -((px + off) % 32 + 32) % 32; x < VW; x += 32) g.fillRect(R(x), R(y), 1, 12); }
    /* far arches and columns of the buried city (parallax 0.3) */
    const ax = cx * 0.3; g.fillStyle = PAL.arch;
    for (let i = -1; i < VW / 120 + 2; i++) { const x = R(i * 120 - (ax % 120)), y0 = R(VH * 0.38 - cy * 0.05);
      g.fillRect(x, y0, 14, VH); g.fillRect(x + 60, y0 + 30, 10, VH);
      g.beginPath(); g.moveTo(x + 14, y0 + 40); g.quadraticCurveTo(x + 37, y0 - 4, x + 60, y0 + 40); g.lineTo(x + 60, y0 + 46); g.quadraticCurveTo(x + 37, y0 + 4, x + 14, y0 + 46); g.closePath(); g.fill(); }
    /* 2. THE HOURGLASS TOWER (the landmark): always on screen, nearer and bigger as you go */
    drawTower(g, cx, VW, VH, levelW, time, dY);
    /* 3. THE ROOF'S UNDERSIDE: a ceiling band of sand and buried rooftops (parallax 0.6), grains sifting from its cracks */
    const rx = cx * 0.6, band = R(26 - cy * 0.04);
    g.fillStyle = PAL.roof; g.fillRect(0, 0, VW, Math.max(0, band));
    g.fillStyle = PAL.roofHi; for (let i = -1; i < VW / 70 + 2; i++) { const x = R(i * 70 - (rx % 70)); g.fillRect(x, Math.max(0, band - 6), 44, 6); g.fillRect(x + 50, Math.max(0, band - 2), 4, 14); }
    g.fillStyle = 'rgba(226,196,130,0.35)'; for (let i = 0; i < 9; i++) { const x = R(((i * 97 - rx) % VW + VW) % VW), y = band + ((time * 30 + i * 41) % Math.max(20, VH - band)); g.fillRect(x, R(y), 1, 3); }
    g.globalAlpha = 1;
  }
  g.globalAlpha = 1;
  /* THE DUNES (only while the sky shows): far dune silhouettes under the open sky */
  if (sky > 0.01) { g.globalAlpha = sky; g.fillStyle = '#c8945a'; const dx = cx * 0.15;
    g.beginPath(); g.moveTo(0, VH); for (let x = 0; x <= VW; x += 8) g.lineTo(x, R(VH * 0.62 + Math.sin((x + dx) * 0.012) * 14 - cy * 0.05)); g.lineTo(VW, VH); g.closePath(); g.fill();
    drawTower(g, cx, VW, VH, levelW, time, dY, 0.55);   /* (the tower's tip over the dunes: you see where you are going before you go down) */
    g.globalAlpha = 1; }
}

/* THE HOURGLASS TOWER: glass bulbs in a brass frame; its upper bulb empties as you near the throne (k = how far along) - the city's hour running out */
function drawTower(g, cx, VW, VH, levelW, time, dY, alpha = 1) {
  const k = Math.max(0, Math.min(1, cx / Math.max(1, levelW - VW)));
  const sc = 0.8 + k * 0.5, x = R(VW * 0.82 - cx * 0.035 + 40), w = R(56 * sc), top = R(VH * 0.14), bot = R(top + VH * (0.55 + k * 0.2)), neck = R((top + bot) / 2);   /* (it fits the view: the whole glass, nearer and taller as you go) */
  const a0 = g.globalAlpha; g.globalAlpha = a0 * alpha * 0.85;
  g.fillStyle = PAL.glass;   /* the two bulbs */
  g.beginPath(); g.moveTo(x - w / 2, top); g.lineTo(x + w / 2, top); g.lineTo(x + 4, neck); g.lineTo(x + w / 2, bot); g.lineTo(x - w / 2, bot); g.lineTo(x - 4, neck); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(220,240,250,0.45)'; g.lineWidth = 1; g.stroke();
  g.fillStyle = PAL.sand;   /* the sand: the upper bulb empties (k), the lower fills */
  const ut = top + (neck - top) * Math.min(0.95, 0.15 + k * 0.8), uw = (w / 2) * (1 - (ut - top) / (neck - top));
  g.beginPath(); g.moveTo(x - uw, ut); g.lineTo(x + uw, ut); g.lineTo(x + 3, neck); g.lineTo(x - 3, neck); g.closePath(); g.fill();
  const lt = bot - (bot - neck) * (0.2 + k * 0.6), lw = (w / 2) * ((lt - neck) / (bot - neck));
  g.beginPath(); g.moveTo(x - lw, lt); g.lineTo(x + lw, lt); g.lineTo(x + w / 2, bot); g.lineTo(x - w / 2, bot); g.closePath(); g.fill();
  g.fillRect(x - 1, neck, 2, R(lt - neck));   /* the thread of falling sand: the clock running */
  g.fillStyle = '#fff0c8'; g.fillRect(x - 1, R(neck + ((time * 40) % Math.max(4, lt - neck))), 2, 3);
  g.fillStyle = PAL.brass;   /* the brass frame, the crown and the base the city is built round */
  g.fillRect(x - w / 2 - 6, top - 8, w + 12, 8); g.fillRect(x - w / 2 - 6, bot, w + 12, 10); g.fillRect(x - w / 2 - 4, top, 4, bot - top); g.fillRect(x + w / 2, top, 4, bot - top);
  g.fillRect(x - 10, bot + 10, 20, VH); g.fillStyle = PAL.brassHi; g.fillRect(x - w / 2 - 6, top - 8, w + 12, 2);
  for (let i = 0; i < 5; i++) g.fillRect(x - 12 + i * 6, top - 14, 3, 6);   /* the crown of gears */
  g.globalAlpha = a0;
}
