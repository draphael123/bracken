const IDLE_OLD = "if (SET.hud === 'minimal' && state === 'play' && P.hp === P.maxHp && P.st >= P.maxSt - 1 && !venomIcon(P, CQG.CQ.venom) && !bossActive && bannerT <= 0 && !Object.values(P.cds || {}).some(v => v > 0)) { /* nothing to say: hide the plates until something changes */ } else {";
export default [
[IDLE_OLD, "{   /* (the MINIMAL HUD's bars wait out of sight below when there is nothing to say - hudIdle; the counters, the clock, the hint and the boss bar are always on) */"],
// geometry header
["const hudMeter = hudMeterLabel(), hudPW = Math.max(touchOn ? 110 : 116, hudMeter ? (isReaper() ? 112 : 92) + inkW(hudMeter.s, 6) + 5 : touchOn ? 110 : 116), xpRow = xpWood() ? 8 : 0, hudPH = (SET.iron ? 38 : 26) + 10 + xpRow;   /* (xpRow: the XP bar's line) */   /* the plate is as wide as what C does */",
`const hudMin = SET.hud === 'minimal', HS = hudMin ? 'outline' : 'shadow', HY = SET.iron ? 43 : 31;   /* HY: the row of the hero's own meter. Rows go 8 down from y 4: HP, stamina, FLASK ROW (y 20-28, FLASKS 2 gives the flasks their own row here), the hero's meter, XP */
    const hudMeter = hudMeterLabel(), hudPW = 66, xpRow = xpWood() ? 8 : 0, hudPH = HY + 7 + xpRow;   /* ONE slim plate: 66 wide (~20% of the 320 view) however long a meter's prompt is - the prompt goes beside it, on a strip (meterPrompt) */
    const hudIdle = hudMin && state === 'play' && P.hp === P.maxHp && P.st >= P.maxSt - 1 && !venomIcon(P, CQG.CQ.venom) && !bossActive && bannerT <= 0 && !hudMeter && !P.swim && !(P.torch > 0) && heroMeterFrac() < 0.01 && !Object.values(P.cds || {}).some(v => v > 0);   /* nothing to say: the bars wait out of sight until something changes */
    const gShown = g, hudG = () => { g = hudIdle ? NULLG : gShown; }, hudShow = () => { g = gShown; };   /* (what the idle MINIMAL HUD draws, it draws into NULLG: one code path, nothing on the screen) */
    const hudStrip = (x, y, w, h) => { g.fillStyle = 'rgba(10,8,20,0.55)'; g.beginPath(); g.roundRect(x, y, w, h, 2); g.fill(); hudRects.push([x, y, w, h]); };   /* a status strip: what is not a bar sits on one, never floating */
    const meterPrompt = (hm, hy) => { const t = fitText(hm.s, VW - 80, 6), w = inkW(t, 6) + 7; hudStrip(69, hy - 3, w, 9); text(t, 72, hy - 1, hm.col, 'left', 6, 'shadow'); };
    const flaskN = L && !L.shop && !L.trial ? Math.max(SV.flaskMax(PROG), P.flasks | 0) : 0;`],
["    board(1, 1, hudPW, hudPH, UI.border, 'rgba(10,8,20,0.5)', true);\n", "    if (!hudMin) board(1, 1, hudPW, hudPH, UI.border, 'rgba(10,8,20,0.5)', true);   /* (the PLATE HUD only: the MINIMAL one has bars with a 1px outline and nothing behind them) */\n"],
["g.globalAlpha = coinA; board(VW - 7 - pw, 1, pw + 2, 30, UI.border, 'rgba(10,8,20,0.5)', true); g.globalAlpha = 1; hudRects = [[0, 0, hudPW + 2, hudPH + 2], [VW - 8 - pw, 0, pw + 4, 32]]; }",
 "g.globalAlpha = coinA; if (!hudMin) board(VW - 7 - pw, 1, pw + 2, 30, UI.border, 'rgba(10,8,20,0.5)', true); g.globalAlpha = 1; hudRects = [hudIdle ? [0, 0, 0, 0] : [0, 0, hudPW + 2, hudPH + 2], [VW - 8 - pw, 0, pw + 4, 32]]; }\n    hudG();"],
["    g.drawImage(PROP.heart, 5, 5);\n", "    g.drawImage(PROP.heart, 4, 4);\n"],
["g.drawImage(K.R.idle[0], 0, 0, 12, 12, 6 + i * 11, 23, 12, 12); } g.globalAlpha = 1; text('IRON', 42, 26, '#c9d1dc'); }", "g.drawImage(K.R.idle[0], 0, 0, 12, 12, 4 + i * 11, 29, 12, 12); } g.globalAlpha = 1; text('IRON', 40, 32, '#c9d1dc', 'left', 8, HS); }"],
["const tx = 112, ty = 6; g.fillStyle = 'rgba(10,8,20,0.45)'", "const tx = 92, ty = 24; g.fillStyle = 'rgba(10,8,20,0.45)'"],
["g.fillStyle = 'rgba(143,209,96,' + (statFlash * 0.5) + ')'; g.fillRect(2, 2, 104, 22); }", "g.fillStyle = 'rgba(143,209,96,' + (statFlash * 0.5) + ')'; g.fillRect(2, 2, 62, 28); }"],
["bar(16, 6, 70, 6, P.hp / P.maxHp,", "bar(15, 6, 45, 5, P.hp / P.maxHp,"],
["g.fillRect(16, 6, Math.round(70 * Math.max(0, P.hp / P.maxHp)), 1); for (let i = 1; i < 4; i++) { g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(16 + Math.round(70 * i / 4), 6, 1, 6); }",
 "g.fillRect(15, 6, Math.round(45 * Math.max(0, P.hp / P.maxHp)), 1); for (let i = 1; i < 4; i++) { g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(15 + Math.round(45 * i / 4), 6, 1, 5); }"],
["text(String(Math.max(0, Math.ceil(P.hp))), 90, 6, '#fff6e0');", "text(String(Math.max(0, Math.ceil(P.hp))), 59, 5, '#fff6e0', 'right', 8, 'outline');   /* the number is ON the bar's end: one readout, no column beside it */"],
// flasks: always on, in the flask row
["    if (L && !L.shop && !L.trial) { const fm = SV.flaskMax(PROG), fn = P.flasks | 0; for (let i = 0; i < Math.max(fm, fn); i++) { g.globalAlpha = i < fn ? 1 : 0.25; g.drawImage(TONIC_ICON, 90 + i * 7, 14); if (i >= fm) { g.fillStyle = '#ffd36b'; g.fillRect(91 + i * 7, 12, 3, 1); } } g.globalAlpha = 1; }",
 "    hudShow(); if (flaskN) { const fm = SV.flaskMax(PROG), fn = P.flasks | 0; for (let i = 0; i < flaskN; i++) { g.globalAlpha = i < fn ? 1 : 0.25; g.drawImage(PROP.hudFlask, 4 + i * 8, 20); if (i >= fm) { g.fillStyle = '#ffd36b'; g.fillRect(6 + i * 8, 19, 3, 1); } } g.globalAlpha = 1; }   /* THE FLASK ROW (y 20-28), always on: FLASKS 2 builds its own row here. */"],
["    if (campaignTag) text(campaignTag, 4, VH - 9, '#e8d9a0', 'left', 6);", "    if (campaignTag) text(campaignTag, 4, VH - 9, '#e8d9a0', 'left', 6, 'outline');"],
["    if (coop()) drawCoopHud();   // and player two's small plate beside his", "    if (coop()) drawCoopHud();   // and player two's small plate beside his\n    hudG();"],
["    if (SET.invincible || SET.godmode) { const ph = (SET.iron ? 36 : 24) + 10 + xpRow;\n      text((SET.invincible ? 'GOD MODE ' : '') + (SET.godmode ? 'UNLOCK ALL' : ''), 6, 2 + ph + 3, '#ff9a5c', 'left', 6); }",
 "    if (SET.invincible || SET.godmode) { hudShow();\n      text((SET.invincible ? 'GOD MODE ' : '') + (SET.godmode ? 'UNLOCK ALL' : ''), 6, hudPH + 4, '#ff9a5c', 'left', 6, 'outline'); hudG(); }"],
["    g.drawImage(PROP.bolt, 6, 15);\n", "    g.drawImage(PROP.hudBolt, 4, 12);\n"],
// hero meters: bars and prompts
["bar(16, hy, 70, 4,", "bar(15, hy, 45, 4,", 7],
["const hy = SET.iron ? 41 : 29", "const hy = HY", 7],
["const by = (SET.iron ? 41 : 29) + 10 + xpRow;", "const by = hudPH + 6;"],
["const yy = (SET.iron ? 41 : 29) + 8,", "const yy = HY + 8,"],
["if (hudMeter) text(hudMeter.s, 90, hy - 1, hudMeter.col, 'left', 6);", "if (hudMeter) meterPrompt(hudMeter, hy);", 6],
["if (hudMeter) text(fitText(hudMeter.s, VW - 116, 6), 110, hy - 1, hudMeter.col, 'left', 6);", "if (hudMeter) meterPrompt(hudMeter, hy);"],
["bar(110, hy + 7, 48, 2, wk,", "bar(69, hy + 8, 48, 2, wk,"],
["const px2 = 90, py2 = 14;", "const px2 = 69, py2 = 20;"],
// breath
["g.roundRect(2, by - 4, low ? 92 + inkW(k2 <= 0 ? 'NO AIR' : 'BREATH', 6) + 4 : 104, 13, 3); g.fill(); hudRects.push([2, by - 4, low ? 128 : 104, 13]);", "g.roundRect(2, by - 4, low ? 58 + inkW(k2 <= 0 ? 'NO AIR' : 'BREATH', 6) + 4 : 62, 13, 3); g.fill(); hudRects.push([2, by - 4, low ? 98 : 62, 13]);"],
["bar(16, by, 70, 4, k2,", "bar(15, by, 38, 4, k2,"],
["text(k2 <= 0 ? 'NO AIR' : low ? 'BREATH' : '', 90, by - 1,", "text(k2 <= 0 ? 'NO AIR' : low ? 'BREATH' : '', 58, by - 1,"],
// xp
["bx = 6 + inkW(lab, 6) + 4;", "bx = 4 + inkW(lab, 6) + 4;"],
["g.globalAlpha = xpA; text(lab, 6, yy - 3, up ? (fl ? '#fff6c8' : '#ffd36b') : cu ? '#8fd160' : '#c9b27c', 'left', 6);\n      bar(bx, yy, 86 - bx, 3,", "g.globalAlpha = xpA; text(lab, 4, yy - 3, up ? (fl ? '#fff6c8' : '#ffd36b') : cu ? '#8fd160' : '#c9b27c', 'left', 6, HS);\n      if (60 - bx >= 8) bar(bx, yy, 60 - bx, 3,"],
["    if (SET.hud === 'minimal') { g.globalAlpha = 1; } \n", "    hudShow(); g.globalAlpha = 1;\n"],
["g.drawImage(PROP.charm[PROG.charm], 152, 14); g.globalAlpha = 1; }", "g.drawImage(PROP.charm[PROG.charm], 146, 6); g.globalAlpha = 1; }"],
// skill slots
["const slot = (sk, x, key, col) => { if (!sk ||", "const slot0 = (sk, x, key, col) => { if (!sk ||"],
["text(key, x + 7, 27, busy ? '#7a7a84' : col, 'center', 6); };\n      const load=equipped(PROG,hero(),heroLevel());slot(load[0]||skillNow(),74,'F','#c9d1dc');slot(load[1]||skill2Now(),92,'G','#8fd160');slot(load[2],110,SET.skill3Key.toUpperCase(),'#8fb8ff');slot(load[3],128,SET.skill4Key.toUpperCase(),'#e6a8e0'); }",
 "text(key, x + 7, 27, busy ? '#7a7a84' : col, 'center', 6); };\n      const slot = (sk, x, key, col) => { g.save(); g.translate(0, -7); slot0(sk, x, key, col); g.restore(); };   /* the skill row sits beside the plate, at the top: y 4-20 */\n      const load=equipped(PROG,hero(),heroLevel());slot(load[0]||skillNow(),70,'F','#c9d1dc');slot(load[1]||skill2Now(),88,'G','#8fd160');slot(load[2],106,SET.skill3Key.toUpperCase(),'#8fb8ff');slot(load[3],124,SET.skill4Key.toUpperCase(),'#e6a8e0'); }"],
// stamina + venom
["    bar(16, 16, 56, 4, P.st / P.maxSt,", "    hudG(); bar(15, 14, 45, 4, P.st / P.maxSt,"],
["g.fillRect(16, 16, Math.round(56 * Math.max(0, P.st / P.maxSt)), 1); if (P.winded) { g.strokeStyle = '#ff6b6b'; g.lineWidth = 1; g.strokeRect(15.5, 15.5, 57, 5); }", "g.fillRect(15, 14, Math.round(45 * Math.max(0, P.st / P.maxSt)), 1); if (P.winded) { g.strokeStyle = '#ff6b6b'; g.lineWidth = 1; g.strokeRect(14.5, 13.5, 46, 5); }"],
["if (vi) drawVenomIcon(g, text, 16, 21, vi, time); }", "if (vi) { hudStrip(2, 20, 4 + flaskN * 8 + vi.slots * 8 + (vi.slow > 0 ? 30 : vi.mode === 'plain' ? 40 : 0), 10); drawVenomIcon(g, (s, x, y, c, a, z) => text(s, x, y, c, a, z, HS), 4 + flaskN * 8 + 2, 21, vi, time); } }   /* (a strip, in the flask row after the flasks)\n    hudShow();"],
// coin readout + quest
["g.drawImage(PROP.coin[0], px0 + 4, 5); text(lab, VW - 10, 7, '#ffd34a', 'right');", "g.drawImage(PROP.coin[0], px0 + 4, 5); text(lab, VW - 10, 7, '#ffd34a', 'right', 8, HS);"],
["g.fillStyle = 'rgba(10,8,20,0.38)'; g.beginPath(); g.roundRect(VW - 10 - lw - (ic ? 13 : 4), 32, lw + (ic ? 17 : 8), 11, 3); g.fill(); hudRects.push(", "if (!hudMin) { g.fillStyle = 'rgba(10,8,20,0.38)'; g.beginPath(); g.roundRect(VW - 10 - lw - (ic ? 13 : 4), 32, lw + (ic ? 17 : 8), 11, 3); g.fill(); } hudRects.push("],
["text(lab, VW - 10, 34, done ? '#ffd36b' : '#c9b27c', 'right', 6);", "text(lab, VW - 10, 34, done ? '#ffd36b' : '#c9b27c', 'right', 6, HS);"],
// timer
["g.globalAlpha = UIH.idleAlpha(levelTime, 6, 2, 0.5); g.fillStyle = 'rgba(10,8,20,0.34)'; g.beginPath(); g.roundRect(tx - tw / 2, 2, tw, 13, 3); g.fill(); hudRects.push([tx - tw / 2, 2, tw, 13]);\n      text(ts, tx, 5, 'rgba(224,216,196,0.82)', 'center'); g.globalAlpha = 1; }",
 "g.globalAlpha = UIH.idleAlpha(levelTime, 6, 2, 0.5); if (!hudMin) { g.fillStyle = 'rgba(10,8,20,0.34)'; g.beginPath(); g.roundRect(tx - tw / 2, 2, tw, 13, 3); g.fill(); } hudRects.push([tx - tw / 2, 2, tw, 13]);\n      text(ts, tx, 5, '#e8dcc0', 'center', 8, 'outline'); g.globalAlpha = 1; }   /* (thin Silkscreen over the world: a 1px dark outline, not a plate) */"],
];
