/* tools/gq3tune-sheet.mjs <stillsDir> <outPng> - lays gq3tune-shots.mjs's stills into one labelled contact sheet (one headless page). Not in the suite. */
import { openPage } from './cdp.mjs';
import { readFileSync, writeFileSync } from 'fs';
const dir = process.argv[2], out = process.argv[3];
const L = [['A-burning-floor-below', '1. BURNING TOWER: floor alight below'], ['A2-burning-floor-near', '1b. the burning boards, close'], ['B-towerCrouch', '2. QUEEN: tower-hop crouch (new pose)'], ['B-towerHop', '2b. QUEEN: the spring into the portal'], ['C-blinkTell', '3. P2 BLINK: the tell'], ['C-blinkGone', '3b. P2 BLINK: exit ring glows'], ['C-stumble', '3c. P2 STUMBLE: the opening'], ['D-stormTell-42', '4. PORTAL STORM: the tell'], ['D-stormFire-72', '4b. STORM: rings fire'], ['D-stormOpen-42', '4c. STORM: she stumbles out'], ['E-bays', '5. BURNING BAYS'], ['E-bays2', '5b. BAYS: roof alight']];
const imgs = L.map(([f, l]) => [readFileSync(dir + '/' + f + '.png').toString('base64'), l]);
const pg = await openPage({ audio: false, fonts: false });
try { const d = await pg.evalp(`(async () => { const L = ${JSON.stringify(imgs)}; const cols = 3, rows = Math.ceil(L.length / cols); const c = document.createElement('canvas'); c.width = 640 * cols; c.height = 360 * rows; const g = c.getContext('2d');
  for (let i = 0; i < L.length; i++) { const im = new Image(); await new Promise(r => { im.onload = r; im.src = 'data:image/png;base64,' + L[i][0]; }); const x = (i % cols) * 640, y = Math.floor(i / cols) * 360; g.drawImage(im, x, y); g.fillStyle = 'rgba(0,0,0,0.65)'; g.fillRect(x, y + 338, 640, 22); g.fillStyle = '#ffd36b'; g.font = '15px monospace'; g.fillText(L[i][1], x + 6, y + 354); }
  return c.toDataURL('image/png'); })()`, 60000); writeFileSync(out, Buffer.from(d.split(',')[1], 'base64')); console.log('wrote', out); } finally { await pg.close(); }
