import { patch } from './patch.mjs';
import { readFileSync } from 'node:fs';
const s = readFileSync('src/main.js', 'utf8').replace(/\r\n/g, '\n');
const a = s.indexOf("    /* HIS BOWMAN IS COMING (C1)"), b = s.indexOf("    if (e.t === 'lance' && e.alive && lanceOpen(e)) {", a);
const block = a >= 0 && b > a ? s.slice(a, b) : null;
const body = block ? block.replace("    if (e.t === 'lance' && e.alive && e.bowCall) { const c = e.bowCall,", "function drawBowCall(c, cx, cy) { const").replace(/\n {6}/g, '\n  ') : null;
patch('src/main.js', [
  ...(block ? [[block, '']] : []),
  ["  for (const fx of deathFx) drawDeathFx(g, fx, cx, cy);   /* what they were made of, after the bodies and before the living */\n  for (const e of enemies) {",
   "  for (const fx of deathFx) drawDeathFx(g, fx, cx, cy);   /* what they were made of, after the bodies and before the living */\n  if (boss && boss.t === 'lance' && boss.alive && boss.bowCall) drawBowCall(boss.bowCall, cx, cy);   /* drawn whether he is on the screen or not: his bowman is coming to where YOU are */\n  for (const e of enemies) {"],
  ...(body ? [["const lanceOpen = e => e.mode === 'planted' ||", body.replace(/^ {4}/, '') + "const lanceOpen = e => e.mode === 'planted' ||"]] : []),
]);
