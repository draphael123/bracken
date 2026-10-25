// lane-unique helper (palisadefoe): anchored edits to src/main.js (CRLF tree). Each anchor must occur exactly once.
import { readFileSync, writeFileSync } from 'node:fs';
const f = new URL('../../src/main.js', import.meta.url);
let s = readFileSync(f, 'utf8');
const rep = (a, b, label) => { const n = s.split(a).length - 1; if (n !== 1) throw new Error(label + ': anchor occurs ' + n + ' times'); s = s.replace(a, () => b); };

rep("import * as FAF from './fair-foes.js';", "import * as HM from './hornsman.js'; import * as HMA from './redraw/hornsman_art.js'; import * as FAF from './fair-foes.js';", 'import');
rep('barker: FAF.BARKER.hp', 'hornsman: HM.HORNSMAN.hp, barker: FAF.BARKER.hp', 'EHP');
rep("      case 'barker': { const st = FAF.newBarker(",
  "      case 'hornsman': { const st = HM.newHornsman(px, py, e.face || -1); enemies.push({ ...base, t: 'hornsman', w: HM.HORNSMAN.w, h: HM.HORNSMAN.h, markH: 34, hp: EHP.hornsman, mode: st.mode, st, speed: 0 }); break; }   /* THE HORNSMAN (claude/palisadefoe, src/hornsman.js): the Palisade Wood's siege-crew handler - his horn hurries every archer in earshot (updateHornsman) */\r\n"
  + "      case 'barker': { const st = FAF.newBarker(", 'spawn');
rep("if (e.t === 'barker') { updateBarker(e, dt); continue; }", "if (e.t === 'barker') { updateBarker(e, dt); continue; } if (e.t === 'hornsman') { updateHornsman(e, dt); continue; }", 'dispatch');
rep('function updateBarker(e, dt) {', `function updateHornsman(e, dt) {   // THE HORNSMAN (claude/palisadefoe, src/hornsman.js): a told horn that hurries the towers' archers, and a maul at close range
  const s = e.st; if (!s) return;
  const C = HM.HORNSMAN;
  e.orderFx = Math.max(0, (e.orderFx || 0) - dt);
  const grav = () => { e.vy = Math.min(360, (e.vy || 0) + 1000 * dt); const r = moveBody(e, 0, e.vy * dt, false); if (r.ground || r.hitY) e.vy = 0; };
  if (e.hp0 === undefined) e.hp0 = e.hp;
  const struck = e.hp < e.hp0 || e.stagger > 0; e.hp0 = e.hp;
  if (struck && HM.hornsmanStruck(s) === 'lost') { number(e.x, e.y - e.h - 10, 'ORDER LOST', '#ffd36b'); SFX.clank(); e.orderFx = 0; }
  e.hornT = s.mode === 'orderTell' ? s.hornK * C.orderTell : 0; e.hornDraw = C.orderTell;
  if (Math.abs(e.x - P.x) > 460) { e.mode = s.mode; grav(); return; }
  if (Math.abs(e.x - P.x) < 240) beastSeen(e.t);
  if (e.stagger > 0) { e.mode = s.mode; e.hornT = 0; grav(); return; }
  s.x = e.x; s.y = e.y;
  const hear = q => q.alive && q.t === 'archer' && !q.dozing && !q.horn && Math.abs(q.x - e.x) <= C.earR && Math.abs(q.y - e.y) <= C.earY;
  const x0 = e.x, evs = HM.hornsmanStep(s, { heroes: players.map(p => ({ x: p.x, y: p.y, face: p.face || 1, alive: upright(p), p })), canStep: (x, dir) => fairStep(e, dir), archers: enemies.reduce((n, q) => n + (hear(q) ? 1 : 0), 0) }, dt);
  if (s.vx) moveBody(e, s.vx * dt, 0, false);
  grav(); s.x = e.x; s.y = e.y; e.face = s.face || e.face; e.mode = s.mode; e.vx = (e.x - x0) / Math.max(dt, 1e-4); e.anim = (e.anim || 0) + dt;
  e.hornT = s.mode === 'orderTell' ? s.hornK * C.orderTell : 0;
  for (const v of evs) {
    if (v.t === 'orderTell') { SFX.hornDraw(); number(e.x, e.y - e.h - 8, 'THE ORDER', '#ff9a5c'); }
    else if (v.t === 'order') { SFX.hornBlast(); shakeCam(1.5); e.orderFx = 0.6; let n = 0;
      for (const q of enemies) if (hear(q)) { q.ordered = HM.ORDER.len; q.timer = Math.min(q.timer, HM.ORDER.first); n++; number(q.x, q.y - q.h - 12, 'VOLLEY', '#ff6b6b'); }
      if (n) callout('THE HORNSMAN ORDERS A VOLLEY: HIT HIM WHILE THE HORN IS UP'); }
    else if (v.t === 'maulTell') { number(e.x, e.y - e.h - 8, '!', '#ffd36b'); SFX.strikeTell(); }
    else if (v.t === 'maul') { SFX.haftKnock();
      for (const pp of players) asPlayer(pp, () => { if (!upright(pp)) return; const [l, r, t, b] = v.box; if (overlap({ l, r, t, b }, box(P))) damagePlayer(e.x, v.dmg, { who: e, name: 'THE HORNSMAN' }); }); }
  }
}
function updateBarker(e, dt) {`, 'fn');
rep('    else if (e.t === \'barker\') frame = e.hurtT > 0 ? 7 :',
  "    else if (e.t === 'hornsman') frame = e.hurtT > 0 || e.mode === 'lost' ? 7 : ({ orderTell: 3, order: 4, maulTell: 5, maul: 6 })[e.mode] ?? (e.mode === 'walk' ? 1 + Math.floor(e.anim * 6) % 2 : 0);   /* THE HORNSMAN: 3 the horn at his lips, 4 the blast, 5 the maul back */\r\n"
  + "    else if (e.t === 'barker') frame = e.hurtT > 0 ? 7 :", 'frame');
rep('SPR.barker = FG.bakeBarker();', 'SPR.barker = FG.bakeBarker(); SPR.hornsman = HMA.bakeHornsman();', 'spr');
rep("HAS_HURT.add('stringjack'); HAS_HURT.add('barker');", "HAS_HURT.add('stringjack'); HAS_HURT.add('barker'); HAS_HURT.add('hornsman');", 'hurt');
rep("  { t: 'barker', name: 'THE BARKER',",
  "  { t: 'hornsman', name: 'THE HORNSMAN', sub: 'the siege crew\\'s handler', desc: 'A man of the siege crew, not a goblin: soot-black face, an iron kettle hat with a red crest, a leather apron and an order horn at his hip. He carries no bow; he commands the towers. While he can see you, he raises the horn (you hear it drawn, a bar fills over his head: THE ORDER) and blows: every archer within earshot DRAWS AT ONCE and then shoots in quick order for a few seconds, from all the towers together. Hit him while the horn is up and the order dies in his throat (ORDER LOST) - or kill him first. Out of sight of the towers he is only a man with a maul: when you come close he swings it (a yellow !, the shield turns it).' },\r\n"
  + "  { t: 'barker', name: 'THE BARKER',", 'beast');
rep("royalboar: 'ROYAL BOAR',", "hornsman: 'HORNSMAN', royalboar: 'ROYAL BOAR',", 'short');
rep('const COLS = { hornetqueen:', "const COLS = { hornsman: ['#6a707e', '#a8442a', '#ffd36b'], hornetqueen:", 'cols');
rep("kinds: ['sprig', 'hopper', 'sporeling', 'broom',", "kinds: ['sprig', 'hornsman', 'hopper', 'sporeling', 'broom',", 'family');
rep('e.timer = e.juggler ? FK.JUGGLER.every : 2.4;', 'e.timer = e.juggler ? FK.JUGGLER.every : e.ordered > 0 ? HM.ORDER.rate : 2.4;', 'rate');
rep('e.timer -= dt; e.draw = Math.max(0, e.draw - dt); e.loose = Math.max(0, (e.loose || 0) - dt);', 'e.timer -= dt; e.draw = Math.max(0, e.draw - dt); e.loose = Math.max(0, (e.loose || 0) - dt); e.ordered = Math.max(0, (e.ordered || 0) - dt);   /* (claude/palisadefoe) THE HORNSMAN\'s order: a hurried beat while it lasts */', 'tick');
rep("    if (e.alive && e.t === 'archer' && e.horn && !e.blown && e.hornT > 0) drawHornTell(e, cx, cy);",
  "    if (e.alive && e.t === 'archer' && e.horn && !e.blown && e.hornT > 0) drawHornTell(e, cx, cy);\r\n"
  + "    if (e.alive && e.t === 'hornsman') { if (e.hornT > 0) drawHornTell(e, cx, cy); if (e.orderFx > 0) drawOrderRings(e, cx, cy); }   /* (claude/palisadefoe) THE HORNSMAN's horn bar, and the blast going out */\r\n"
  + "    if (e.alive && e.t === 'archer' && e.ordered > 0) drawOrdered(e, cx, cy);   /* an archer under the order: a red pennant over him */", 'render');
rep('function drawHornTell(e, cx, cy) {', `function drawOrderRings(e, cx, cy) {   // THE HORNSMAN's blast: arcs of sound going out from the horn, then fading (src/hornsman.js)
  const k = 1 - e.orderFx / 0.6, f = e.face || 1, x = Math.round(e.x - cx), y = Math.round(e.y - cy) - e.h - 2;
  g.save(); for (let n = 0; n < 3; n++) { const r = 10 + (k * 60 + n * 14), a = Math.max(0, 1 - k) * (1 - n * 0.2); g.globalAlpha = a; g.fillStyle = n === 0 ? '#ffd870' : '#ff9a5c';
    for (let t = -5; t <= 5; t++) { const an = t * 0.12; g.fillRect(Math.round(x + f * Math.cos(an) * r), Math.round(y + Math.sin(an) * r * 0.9 - 3), 2, 2); } }
  g.restore();
}
function drawOrdered(e, cx, cy) {   // an archer under THE HORNSMAN's order: a red pennant on a pole over his head, snapping (the volley is coming, quick)
  const x = Math.round(e.x - cx), y = Math.round(e.y - cy) - e.h - 6, w = Math.sin(time * 18) > 0 ? 1 : 0;
  g.fillStyle = ART.OUT; g.fillRect(x - 1, y - 9, 3, 11); g.fillRect(x + 1, y - 10, 8, 6);
  g.fillStyle = '#8a6a40'; g.fillRect(x, y - 8, 1, 9); g.fillStyle = '#ff4a30'; g.fillRect(x + 1, y - 9, 6 + w, 4); g.fillStyle = '#ffd36b'; g.fillRect(x + 1, y - 9, 6 + w, 1);
}
function drawHornTell(e, cx, cy) {`, 'draw');
writeFileSync(f, s.replace(/(?<!\r)\n/g, '\r\n'));
console.log('ok');
