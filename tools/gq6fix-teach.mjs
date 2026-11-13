/* tools/gq6fix-teach.mjs <tree> <outPrefix> - GQ6FIX items 1 + 2 in a real page, on any checkout (pass the master checkout for the BEFORE numbers).
   The lab's skip puts the hero on the tower top (the same toRoof as the real portal step), the hero stands, and - when the teach shard is within reach - strikes it with a real swing.
   Logs, per second from ARRIVAL: her mode / x, the shard, every floating label that was actually put on screen (BK.textLab.nums), the first told action, the first prompt on screen,
   the hit confirm; then a direct blow on her (the ward glance). Stills: prompt, struck, ward. */
import { pathToFileURL } from 'node:url'; import { writeFileSync, mkdirSync } from 'fs';
const tree = process.argv[2], pre = process.argv[3]; mkdirSync(pre.slice(0, Math.max(pre.lastIndexOf('/'), pre.lastIndexOf(String.fromCharCode(92)))), { recursive: true });
const { openPage } = await import(pathToFileURL(tree + '/tools/cdp.mjs').href);
const pg = await openPage({ audio: false, fonts: false, seed: 11 });
try { const d = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); const out = [], shots = {}; const hold = () => { BK.P.hp = BK.P.maxHp; };
 const cv = document.createElement('canvas'); cv.width = 640; cv.height = 360; const cg = cv.getContext('2d'); const snap = id => { cg.drawImage(BK.buf, 0, 0, 640, 360); shots[id] = cv.toDataURL('image/png'); };
 BK.manualSimulation = true; BK.SET.speed = 1; BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'crown')); BK.state = 'play'; BK.god = false; BK.step(5);
 const A0 = BK.L.arena; BK.tp(Math.round(A0.trigger / 16) + 1, Math.round(A0.floor / 16) - 1); for (let k = 0; k < 300; k++) { hold(); BK.step(1); }
 const q = BK.boss; q.hp = 2; const hu = BK.hurt || (BK.env && BK.env().hurt); if (hu) hu(q, 50, BK.P.x); for (let k = 0; k < 140; k++) { hold(); BK.step(1); }
 const H = BK.gqHands(); H.skipRoof(); const P = BK.P, G52 = H.q52(); const seen = new Map(); const labels = () => { for (const n of BK.textLab.nums()) if (typeof n.txt === 'string' && !seen.has(n.txt)) seen.set(n.txt, +(f / 60).toFixed(2)); };
 let f = 0, firstTold = null, firstShard = null, struckAt = null, hp0 = q.hp, wardAt = null, phase = 'teach', ward0 = 0;
 for (f = 0; f < 60 * 16; f++) { hold(); const T = G52.state().teach, sh = T.shard, t = f / 60; const m = q.mode;
   if (!firstTold && (/Tell$/.test(m) || sh)) firstTold = { t: +t.toFixed(2), what: sh ? 'shard' : m };
   if (sh && !firstShard) { firstShard = +t.toFixed(2); snap('prompt'); }
   if (phase === 'teach' && sh && !sh.dead && !sh.home) { const dx = sh.x - P.x; P.face = dx < 0 ? -1 : 1; if (Math.abs(dx) < 20 && Math.abs(sh.y - (P.y - 9)) < 22) BK.press('atk'); }
   BK.step(1); labels(); if (phase === 'teach' && G52.state().teach.struck && !struckAt) { struckAt = +(f / 60).toFixed(2); out.push('hit confirm: boss hp ' + hp0 + ' -> ' + q.hp + ' (' + Math.round((hp0 - q.hp) / q.maxHp * 1000) / 10 + '% of her bar), flash ' + q.flash); for (let k = 0; k < 6; k++) { hold(); BK.step(1); } snap('struck'); labels(); phase = 'direct'; q.mode = 'roofStand'; q.modeT = 5; q.x = P.x + 26; q.y = P.y; P.face = 1; P.vx = 0; ward0 = f; BK.press('atk'); }
   if (phase === 'direct' && f - ward0 > 6 && !wardAt) { for (const n of BK.textLab.nums()) if (/WARDED|NO EFFECT|GLANCE/.test(String(n.txt))) wardAt = { t: +((f - ward0) / 60).toFixed(2), txt: n.txt }; if (wardAt) snap('ward'); }
   if (struckAt && wardAt) break; }
 out.push('first told action ' + JSON.stringify(firstTold) + '; first shard ' + firstShard + 's; struck at ' + struckAt + 's; direct blow read ' + JSON.stringify(wardAt));
 out.push('labels put on screen (txt: first second): ' + JSON.stringify([...seen.entries()].filter(([k]) => /[A-Z]/.test(k)))); out.push('her x ' + Math.round(q.x) + ', hero x ' + Math.round(P.x));
 return { out, shots }; })()`, 600000);
  console.log(d.out.join('\n')); for (const [id, png] of Object.entries(d.shots)) writeFileSync(pre + '-' + id + '.png', Buffer.from(png.split(',')[1], 'base64')); console.log('errors', JSON.stringify(pg.errors.slice(0, 3))); } finally { pg.close(); }
