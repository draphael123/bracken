import { readFileSync, writeFileSync } from 'node:fs';
let s = readFileSync('src/main.js', 'utf8');
const a = s.indexOf('const gShown = g, hudG'), b = s.indexOf('/* (what the idle MINIMAL HUD draws');
if (a < 0 || b < 0) throw new Error('anchors');
const nl = s.includes('\r\n') ? '\r\n' : '\n';
const probe = n => "(window.__tr = window.__tr || []).push('" + n + "'); ";
s = s.slice(0, a) + "const gShown = g, hudG = (n) => { " + probe("G'+n+'").replace("'G'+n+'", "G'+n+'") + "g = hudIdle ? NULLG : gShown; }, hudShow = (n) => { " + probe("S'+n+'") + "g = gShown; };   " + s.slice(b);
writeFileSync('src/main.js', s);
