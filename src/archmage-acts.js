// src/archmage-acts.js - THE UNDEAD ARCHMAGE'S WARD AND PHASE CHANGES, DRAWN (claude/archmage3; Daniel 10-04, scratch/brief-archmage3.md 3a + 3c).
// Drawing only: the state lives on him (src/undead-mage.js sets it) and main.js calls drawActs once a frame, after his rings and realm.
//
//   HIS WARD (3c: "invulnerable by default and it must READ"). Outside an opening he is warded, and the ward is DRAWN: a pale shell of his runes,
//            turning round him. A blow it turns (main.js greedHit sets e.wardHitT and e.wardHitX/Y) flares the shell white, throws a ripple from
//            where it struck and says WARDED over him (with his ward's note, SFX.aegis). When an opening takes it down the shell SHATTERS (shards
//            flying off: e.wardDropT) and he burns GOLD while he is open (the sprite's tint: main.js) - so the opening reads as clearly as the ward.
//   HIS PHASE CHANGES (3a: "each change is its own told set piece ... different every time, a breather, never a soft-lock"). Each realm he
//            tears plays its own picture before it takes you (e.trans, MAGE.trans: nothing of his is cast through it):
//              THE SKY CRACKS (fire)                 cracks race across the sky from its edges to him, glowing, and burst into fire
//              HIS RINGS GATHER AND FREEZE: THE ICE REALM (ice)   six of his rings circle in on him and frost over, white
//              HIS DARK SURGES UP THE SKY: THE POISON REALM (poison)   his stair's rising dark comes up the screen, the mire's green on its surface
//            and when you come out of a realm it SHATTERS (e.shatter): its colour breaks into shards across the screen.
import { MAGE, mageOpen, mageSoft } from './undead-mage.js';
import { REALM } from './mage-realms.js';

const WARD = { rx: 19, ry: 30, lift: 26, runes: 10 };
/* a seeded list of n numbers in [0,1) (the cracks are the same every time they are drawn) */
const seeded = (seed, n) => { let s = seed >>> 0 || 1; const out = []; for (let i = 0; i < n; i++) { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; out.push(s / 4294967296); } return out; };

/* the ward is up: not open, not between two places, not asleep, and not in a realm (a realm draws its own ward: src/mage-realms.js) */
export const wardUp = e => !!(e && e.alive && !e.realm && !mageOpen(e) && !mageSoft(e) && !['sleep', 'blinkOut', 'blinkIn'].includes(e.mode));
/* (claude/fallingtower2) the word a turned blow says: the ANSWER (send his own spell back), or that his told ward still holds after an opening */
export const turnWord = e => e && e.wardHold > 0 ? 'WARD HOLDS' : 'SEND IT BACK';

export function drawActs(g, e, cx, cy, time, T) {
  if (!e || !e.alive) return; const VW = g.canvas.width, VH = g.canvas.height;
  const x = Math.round(e.x - cx), y = Math.round(e.y - cy) - WARD.lift;
  // ---- THE PHASE CHANGE, over the whole sky ----
  if (e.trans) { const Tr = MAGE.trans[e.trans.kind], k = Math.min(1, e.trans.t / Tr.secs), C = REALM.col[e.trans.kind];
    g.save();
    if (e.trans.kind === 'fire') {   /* THE SKY CRACKS: from the screen's edges toward him */
      const r = seeded(7 + (e.realmN || 0) * 31, 64);
      for (let c = 0; c < 8; c++) { const side = c % 4, t0 = r[c * 8]; let px = side === 0 ? 0 : side === 1 ? VW : t0 * VW, py = side < 2 ? t0 * VH : side === 2 ? 0 : VH;
        const n = 7, upto = Math.min(n, Math.floor(k * 1.4 * n) + 1); g.strokeStyle = C[0]; g.lineWidth = 2; g.beginPath(); g.moveTo(px, py);
        for (let s = 1; s <= upto; s++) { const f = s / n; px = px + (x - px) * (1 / (n - s + 1)) + (r[c * 8 + (s % 8)] - 0.5) * 26; py = py + (y - py) * (1 / (n - s + 1)) + (r[(c * 8 + s * 3) % 64] - 0.5) * 26; void f; g.lineTo(Math.round(px), Math.round(py)); }
        g.stroke(); g.strokeStyle = C[1]; g.lineWidth = 1; g.stroke(); }
      if (k > 0.8) { g.fillStyle = 'rgba(255,155,73,' + ((k - 0.8) * 2.5).toFixed(2) + ')'; g.fillRect(0, 0, VW, VH); } }
    else if (e.trans.kind === 'ice') {   /* HIS RINGS GATHER: six of his rings circle in on him, frosting as they come */
      const R = 130 - 96 * k;
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + time * (1.2 + 2 * k), rx = Math.round(x + Math.cos(a) * R), ry = Math.round(y + Math.sin(a) * R * 0.7), rw = 9, rh = 13;
        g.fillStyle = k < 0.5 ? 'rgba(12,30,22,0.7)' : 'rgba(40,70,110,' + (0.4 + 0.4 * k).toFixed(2) + ')'; g.beginPath(); g.ellipse(rx, ry, rw, rh, 0, 0, Math.PI * 2); g.fill();
        g.strokeStyle = k < 0.5 ? '#6fe08a' : C[0]; g.lineWidth = 2; g.beginPath(); g.ellipse(rx, ry, rw, rh, 0, 0, Math.PI * 2); g.stroke(); }
      if (k > 0.5) for (let i = 0; i < 18; i++) { const a = i * 2.4 + time, d = 10 + ((i * 37 + Math.floor(time * 30)) % 60); g.fillStyle = '#ffffff'; g.fillRect(Math.round(x + Math.cos(a) * d), Math.round(y + Math.sin(a) * d), 1, 1); }
      if (k > 0.85) { g.fillStyle = 'rgba(230,248,255,' + ((k - 0.85) * 4).toFixed(2) + ')'; g.fillRect(0, 0, VW, VH); } }
    else {   /* HIS DARK SURGES: the stair's rising dark comes up the sky, the mire's green on its surface */
      const top = Math.round(VH - VH * 0.75 * Math.sin(Math.min(1, k * 1.1) * Math.PI / 2));
      g.fillStyle = 'rgba(42,16,58,0.82)'; g.fillRect(0, top, VW, VH - top); g.fillStyle = 'rgba(8,4,14,0.6)'; g.fillRect(0, top + 10, VW, VH - top - 10);   /* violet-black, as his stair's dark */
      g.fillStyle = C[0]; for (let i = 0; i < VW; i += 6) { const b = Math.round(Math.sin(i * 0.21 + time * 5) * 2); g.fillRect(i, top + b - 2, 5, 3); }
      for (let i = 0; i < 10; i++) { const bx = (i * 53 + Math.floor(time * 40)) % VW, by = top + 6 + ((i * 29 + Math.floor(time * 60)) % 30); g.fillStyle = C[1]; g.fillRect(bx, by, 2, 2); } }
    g.restore(); }
  // ---- A REALM SHATTERING as you come out of it ----
  if (e.shatter) { const k = e.shatter.t / MAGE.ward.shatterT, C = REALM.col[e.shatter.kind], r = seeded(91 + (e.realmN || 0), 80);
    for (let i = 0; i < 40; i++) { const sx = r[i] * VW, sy = r[i + 40] * VH, dx = (sx - VW / 2) * k * 0.9, dy = (sy - VH / 2) * k * 0.9 + 60 * k * k;
      g.globalAlpha = Math.max(0, 1 - k); g.fillStyle = i % 3 ? C[0] : C[1]; g.fillRect(Math.round(sx + dx), Math.round(sy + dy), 4 + (i % 3) * 2, 2 + (i % 2) * 2); }
    g.globalAlpha = 1; }
  // ---- HIS WARD ----
  if (wardUp(e)) { const hit = e.wardHitT > 0 ? e.wardHitT / MAGE.ward.hitT : 0, pulse = 0.5 + 0.5 * Math.sin(time * 3);
    g.save(); g.globalAlpha = 0.18 + 0.12 * pulse + 0.6 * hit; g.strokeStyle = hit > 0 ? '#ffffff' : '#a8e8c8'; g.lineWidth = 1;
    g.beginPath(); g.ellipse(x, y, WARD.rx + hit * 3, WARD.ry + hit * 3, 0, 0, Math.PI * 2); g.stroke();
    if (e.wardHold > 0) { g.lineWidth = 2; g.strokeStyle = '#e8fff0'; g.beginPath(); g.ellipse(x, y, WARD.rx + 3, WARD.ry + 3, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; }   /* HIS WARD HOLDS (the told anti-spam ward after an opening): doubled and bright - nothing breaks it yet */
    g.globalAlpha = 0.45 + 0.2 * pulse + 0.5 * hit;   /* his runes on the shell, turning */
    for (let i = 0; i < WARD.runes; i++) { const a = i / WARD.runes * Math.PI * 2 + time * 0.9, rx = Math.round(x + Math.cos(a) * WARD.rx), ry = Math.round(y + Math.sin(a) * WARD.ry);
      g.fillStyle = hit > 0 ? '#ffffff' : i % 2 ? '#c8ffd8' : '#6fe08a'; g.fillRect(rx - 1, ry - 1, 2, 3); if (i % 3 === 0) g.fillRect(rx - 2, ry, 4, 1); }
    g.restore();
    if (hit > 0) { const hx = Math.round((e.wardHitX ?? e.x) - cx), hy = Math.round((e.wardHitY ?? e.y - WARD.lift) - cy), R = 4 + (1 - hit) * 18;   /* the ripple from where it struck */
      g.strokeStyle = 'rgba(255,255,255,' + (0.9 * hit).toFixed(2) + ')'; g.beginPath(); g.arc(hx, hy, R, 0, Math.PI * 2); g.stroke();
      if (T) T(turnWord(e), x, y - WARD.ry - 10 - Math.round((1 - hit) * 8), Math.floor(time * 12) % 2 ? '#ffffff' : '#a8e8c8', 6); } }
  // ---- HIS SOFT WINDOWS (claude/fallingtower2): going into a portal, channelling the skulls or the orrery - the shell is down, a dashed gold line round him and the word ----
  if (mageSoft(e)) { g.save(); g.strokeStyle = Math.floor(time * 8) % 2 ? '#ffd36b' : '#fff0c0'; g.setLineDash([3, 3]); g.lineWidth = 1; g.beginPath(); g.ellipse(x, y, WARD.rx, WARD.ry, 0, 0, Math.PI * 2); g.stroke(); g.setLineDash([]); g.restore();
    if (T) T('STRIKE HIM', x, y - WARD.ry - 10, '#ffd36b', 6); }
  // ---- THE WARD SHATTERING as an opening takes it down, and HIM OPEN ----
  if (e.wardDropT > 0) { const k = 1 - e.wardDropT / MAGE.ward.dropT;
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2 + 0.3, d = WARD.rx + k * 46, sx = Math.round(x + Math.cos(a) * d), sy = Math.round(y + Math.sin(a) * d * 1.3 + 30 * k * k);
      g.globalAlpha = Math.max(0, 1 - k); g.fillStyle = i % 2 ? '#c8ffd8' : '#ffffff'; g.fillRect(sx, sy, 3, 2); }
    g.globalAlpha = 1; }
}
