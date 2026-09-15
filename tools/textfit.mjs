// tools/textfit.mjs — DOES THE TEXT FIT WHAT IT IS DRAWN ON?
// The owner keeps finding words running out of their box. Measuring strings against a guessed width misses that the box
// is whatever the draw code happened to put behind them. So this puts every player-facing screen on the page and records
// what is DRAWN: every text() with its pixel box and its call site, every fitText() that cut a string short, every wrap()
// and which of its lines made it on screen, and every plate (fillRect / roundRect / strokeRect) laid down before it.
// (src/main.js records them while window.__textRec is an array; nothing is recorded in play.)
//   OVERFLOW   text runs past the smallest plate under its anchor
//   OFFSCREEN  text runs off the screen
//   COLLIDE    two different strings drawn over one another
//   TRUNCATED  fitText cut the string (the player never sees the end of it)
//   CLIPPED    wrap() made more lines than were drawn
//   SMUDGE     a 6px string with lower case: drawn in the resampled canvas font, not the pixel caps (B, D, 8, 0 all smear)
//   COVERS     a hint or talk box drawn over the hero
// Screens: every hint message in src/main.js (hintMsg = ..., tombHint), every sign and NPC page in every level for every
// hero, the bestiary (all seen), the store and equip lists for every hero, the talent tree for every hero, the pause menu,
// the HUD with every meter full, and every boss and mini name card as the fight starts.
//   node tools/textfit.mjs                  everything (report mode: prints, writes textfit.json, exits 0)
//   node tools/textfit.mjs hints,talk       only those screens (hints talk bestiary store tree menu hud boss)
//   node tools/textfit.mjs --strict         exit 1 on any OVERFLOW, OFFSCREEN, CLIPPED, TRUNCATED, COVERS, COLLIDE or SMUDGE (LONGHINT only reports)
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { openPage, ROOT } from './cdp.mjs';

const OUT = process.env.OUT || 'C:/Users/danie/AppData/Local/Temp/claude/C--Users-danie-OneDrive-Desktop-Claude-Cowork/ec08cdbf-cdf3-4173-bf3b-817b3da483be/scratchpad/audit-readability';
const args = process.argv.slice(2), strict = args.includes('--strict');
const only = (args.find(a => !a.startsWith('--')) || '').split(',').filter(Boolean);

// EVERY HINT IN THE SOURCE. A hint is `hintMsg = <expression>` or `tombHint(key, '...')`. String literals are joined;
// a ternary between two literals gives both versions; anything else in the expression stands in as 9.
function hints() {
  const src = readFileSync(join(ROOT, 'src/main.js'), 'utf8').split(/\r?\n/), out = [];
  const lit = /'((?:[^'\\]|\\.)*)'/g;
  const exprAt = (line, from) => { let depth = 0, q = null, i = from; for (; i < line.length; i++) { const c = line[i];
    if (q) { if (c === '\\') i++; else if (c === q) q = null; continue; } if (c === "'" || c === '"' || c === '`') { q = c; continue; }
    if (c === '(' || c === '[' || c === '{') depth++; else if (c === ')' || c === ']' || c === '}') { if (!depth) break; depth--; } else if ((c === ';' || c === ',') && !depth) break; } return line.slice(from, i); };
  const build = (e, pick) => { let s = e.replace(/\?\s*'((?:[^'\\]|\\.)*)'\s*:\s*'((?:[^'\\]|\\.)*)'/g, (m, a, b) => "'" + (pick ? a : b) + "'");
    const parts = []; let last = 0, m; lit.lastIndex = 0;
    while ((m = lit.exec(s))) { if (s.slice(last, m.index).replace(/[\s+()]/g, '')) parts.push('9'); parts.push(m[1].replace(/\\'/g, "'")); last = m.index + m[0].length; }
    return parts.join(''); };
  src.forEach((line, k) => {
    for (const m of line.matchAll(/hintMsg = /g)) { const e = exprAt(line, m.index + 10); if (!/'/.test(e)) continue; for (const v of new Set([build(e, true), build(e, false)])) out.push({ at: 'main.js:' + (k + 1), s: v }); }
    for (const m of line.matchAll(/tombHint\('\w+', /g)) { const e = exprAt(line, m.index + m[0].length); for (const v of new Set([build(e, true), build(e, false)])) out.push({ at: 'main.js:' + (k + 1), s: v }); }
  });
  return out.filter(h => h.s && h.s !== '9');
}

// THE PAGE SIDE. Serialised and run in the page, so it may only use what is passed in.
async function pageTextFit(input) {
  const BK = window.BK, TL = BK.textLab, lvm = await import('/src/level.js'), G = BK.g;
  const issues = [], stats = { frames: 0, texts: 0, screens: {} }, seenIssue = new Set();
  const HEROES = ['knight', 'warden', 'pyro', 'paladin', 'pirate', 'reaper'];
  const campaign = lvm.LEVELS.map((l, i) => [l, i]).filter(([l]) => (!l.hidden || l.secret) && l.id !== 'custom');
  const want = s => !input.only.length || input.only.includes(s);
  const yieldNow = () => new Promise(r => setTimeout(r, 0));
  /* THE PLATES: every filled or stroked rectangle drawn while recording */
  const orig = {};
  for (const m of ['fillRect', 'roundRect', 'strokeRect']) { orig[m] = G[m]; G[m] = function (x, y, w, h, ...rest) { const r = window.__textRec; if (r && Math.abs(w) >= 6 && Math.abs(h) >= 6) r.push({ kind: 'rect', m, x0: Math.min(x, x + w), y0: Math.min(y, y + h), w: Math.abs(w), h: Math.abs(h) }); return orig[m].call(this, x, y, w, h, ...rest); }; }
  const report = (type, screen, t, extra = {}) => { const key = type + '|' + t.s + '|' + t.at + '|' + (extra.other || ''); if (seenIssue.has(key)) { const it = issues.find(q => q.key === key); if (it) it.n++; return; }
    seenIssue.add(key); issues.push(Object.assign({ key, type, screen, s: t.s, at: t.at, via: t.via, n: 1 }, extra)); };
  function analyse(screen, rec, opts = {}) {
    stats.frames++; const VW = BK.view.VW, VH = BK.view.VH;
    rec.forEach((r, i) => { r.i = i; });
    const texts = rec.filter(r => r.kind === 'text' && r.s.trim() && r.alpha > 0.05);
    stats.texts += texts.length;
    for (const t of texts) {
      if (t.x0 < -1 || t.x0 + t.w > VW + 1 || t.y0 < -1 || t.y0 + t.h > VH + 1) report('OFFSCREEN', screen, t, { box: [t.x0, t.y0, t.w, t.h], VW, VH });
      if (t.size <= 6 && !t.tiny && /[a-z]/.test(t.s)) report('SMUDGE', screen, t, { size: t.size });
      const ax = t.align === 'center' ? t.x0 + t.w / 2 : t.align === 'right' ? t.x0 + t.w - 2 : t.x0 + 2, ay = t.y0 + t.h / 2;
      /* THE PLATE: drawn before it, under its anchor, at least 20 wide and as tall as the text, and holding most of the text (60%
         of its box). A scroll arrow's square or a slider's knob under the start of a word is not the box the word is in. */
      const inside = r => { const ix = Math.min(t.x0 + t.w, r.x0 + r.w) - Math.max(t.x0, r.x0), iy = Math.min(t.y0 + t.h, r.y0 + r.h) - Math.max(t.y0, r.y0); return ix > 0 && iy > 0 ? ix * iy / Math.max(1, t.w * t.h) : 0; };
      /* (a board() is a box on purpose, so any overlap makes it the plate; a bare rectangle must hold a third of the text and its full height) */
      /* (and nothing laid down UNDER a later board: a world rectangle or a HUD plate beneath the talk box or the pause menu is not the box its words are in) */
      const under = rec.filter(r => r.kind === 'rect' && r.i < t.i && ((r.m === 'board' && ax >= r.x0 && ax <= r.x0 + r.w && ay >= r.y0 && ay <= r.y0 + r.h)
        || (r.w < VW - 2 && t.x0 >= r.x0 && t.x0 + t.w <= r.x0 + r.w && t.y0 >= r.y0 && t.y0 + t.h <= r.y0 + r.h))).pop(), floor = under ? under.i : -1;   /* (or any plate that holds the whole string) */
      const cands = rec.filter(r => r.kind === 'rect' && r.i < t.i && r.i >= floor && ax >= r.x0 && ax <= r.x0 + r.w && ay >= r.y0 && ay <= r.y0 + r.h && r.h >= t.h && r.w >= 20 && !(r.w >= VW - 2 && r.h >= VH - 2)
        && (r.m === 'board' ? inside(r) > 0 : inside(r) >= 0.35 && t.y0 >= r.y0 - 1 && t.y0 + t.h <= r.y0 + r.h + 1));
      if (cands.length && t.style !== 'outline') { const p = cands.reduce(   /* (outlined text is drawn over the world on purpose, with no plate: a tell, a prompt over a gate) */(a, b) => a.w * a.h <= b.w * b.h ? a : b);
        const over = Math.max(p.x0 - t.x0, t.x0 + t.w - (p.x0 + p.w), p.y0 - t.y0, t.y0 + t.h - (p.y0 + p.h));
        if (over > 2) report('OVERFLOW', screen, t, { by: Math.round(over), plate: [Math.round(p.x0), Math.round(p.y0), Math.round(p.w), Math.round(p.h)], text: [t.x0, t.y0, t.w, t.h] }); }
    }
    for (let a = 0; a < texts.length; a++) for (let b = a + 1; b < texts.length; b++) { const A = texts[a], B = texts[b];
      if (A.s === B.s && Math.abs(A.x0 - B.x0) <= 1 && Math.abs(A.y0 - B.y0) <= 1) continue;
      const ix = Math.min(A.x0 + A.w, B.x0 + B.w) - Math.max(A.x0, B.x0), iy = Math.min(A.y0 + A.h, B.y0 + B.h) - Math.max(A.y0, B.y0);
      if (ix > 1 && iy > 1) report('COLLIDE', screen, A, { other: B.s, otherAt: B.at }); }
    for (const c of rec.filter(r => r.kind === 'cut')) report('TRUNCATED', screen, c, { out: c.out, maxW: c.maxW });
    const pagedS = new Set(rec.filter(r => r.kind === 'paged').map(r => r.s));   /* a description with a page key reaches its every line */
    if (!opts.paged) for (const w of rec.filter(r => r.kind === 'wrap' && !pagedS.has(r.s))) { const later = texts.filter(t => t.i > w.i).map(t => t.s.trim());
      const drawn = w.lines.filter(l => later.some(s => s === l.trim() || l.trim().startsWith(s) || l.trim().endsWith(s))).length;
      if (drawn > 0 && drawn < w.lines.length) report('CLIPPED', screen, w, { lines: w.lines.length, drawn }); }
    if (opts.cover) { const v = BK.view, P = BK.P, hx = P.x - Math.max(0, Math.min(BK.L.W * 16 - v.VW, v.x)), hy = P.y - Math.max(0, Math.min(BK.L.H * 16 - v.VH, v.y));
      const box = rec.filter(r => r.kind === 'rect' && r.i < (texts[0] ? texts.find(t => opts.cover(t)) || texts[0] : { i: 0 }).i).pop();
      const mine = texts.filter(opts.cover); if (mine.length) { const y0 = Math.min(...mine.map(t => t.y0)) - 4, y1 = Math.max(...mine.map(t => t.y0 + t.h)) + 4, x0 = Math.min(...mine.map(t => t.x0)) - 8, x1 = Math.max(...mine.map(t => t.x0 + t.w)) + 8;
        if (hx > x0 && hx < x1 && hy - 24 < y1 && hy > y0) report('COVERS', screen, mine[0], { lines: mine.length, box: [Math.round(x0), Math.round(y0), Math.round(x1 - x0), Math.round(y1 - y0)], hero: [Math.round(hx), Math.round(hy)] }); } }
  }
  /* A PICTURE OF THE FIRST FRAME EACH PROBLEM IS SEEN ON, three times up, with the text's box in red and its plate in cyan */
  const shots = [];
  const shoot = (screen, fresh) => { if (shots.length >= (input.maxShots || 120)) return; const v = BK.view, S = 3, c = document.createElement('canvas'); c.width = v.VW * S; c.height = v.VH * S;
    const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(v.buf, 0, 0, c.width, c.height); x.lineWidth = 2;
    for (const it of fresh) { const tb = it.text || it.box; if (tb) { x.strokeStyle = '#ff3030'; x.strokeRect(tb[0] * S - 1, tb[1] * S - 1, tb[2] * S + 2, tb[3] * S + 2); }
      if (it.plate) { x.strokeStyle = '#30e0ff'; x.strokeRect(it.plate[0] * S, it.plate[1] * S, it.plate[2] * S, it.plate[3] * S); } }
    x.font = '12px monospace'; x.fillStyle = 'rgba(0,0,0,0.75)'; x.fillRect(0, c.height - 18, c.width, 18); x.fillStyle = '#fff';
    x.fillText(fresh.map(it => it.type + ' ' + String(it.s).slice(0, 40)).join(' | ').slice(0, 150), 6, c.height - 5);
    shots.push({ screen, types: [...new Set(fresh.map(it => it.type))], png: c.toDataURL('image/png') }); fresh.forEach(it => { it.shot = shots.length - 1; }); };
  const frame = (screen, setup, opts = {}) => { window.__textRec = []; const before = issues.length;
    try { if (setup) setup(); BK.step(opts.settle || 0); } catch (e) { issues.push({ type: 'ERROR', screen, s: String(e && e.message), n: 1 }); }
    const r = window.__textRec || []; window.__textRec = null; analyse(screen, r, opts); stats.screens[screen.split(' ')[0]] = (stats.screens[screen.split(' ')[0]] || 0) + 1;
    const fresh = issues.slice(before).filter(it => it.type !== 'SMUDGE' && it.type !== 'ERROR'); if (fresh.length) shoot(screen, fresh); return r; };
  const toPlay = (i, hero) => { if (hero) BK.setHero(hero); BK.load(i); BK.state = 'play'; BK.god = true; BK.sim(170); BK.reset(); };
  const P = BK.P, PROG = BK.PROG || null;

  if (want('hints')) { toPlay(0, 'knight');
    for (const h of input.hints) { const rec = frame('hint ' + h.at, () => { BK.state = 'play'; TL.hint(h.s); }, { cover: t => t.size === 6 && h.s.includes(t.s.trim()) });
      const last = issues[issues.length - 1]; if (last && !last.hintAt && last.screen === 'hint ' + h.at) last.hintAt = h.at;
      /* A HINT IS TWO LINES: a longer one covers the middle of the play space (soft: new hints from other work land here first) */
      const wr = rec.find(r => r.kind === 'wrap' && r.s === h.s); if (wr && wr.lines.length > 2) report('LONGHINT', 'hint ' + h.at, { s: h.s, at: h.at }, { lines: wr.lines.length }); }
    await yieldNow(); }

  if (want('talk')) { const done = new Set();
    for (const h of HEROES) for (const [l, i] of campaign) { try { toPlay(i, h); } catch (e) { issues.push({ type: 'ERROR', screen: 'talk ' + l.id, s: 'load: ' + e.message, n: 1 }); continue; }
      for (const t of TL.talkers()) { const key = t.lines.join('|') + '|' + t.name; if (done.has(key)) continue; done.add(key);
        const lines = t.lines.filter(Boolean);
        for (let p = 0; p < lines.length; p++) frame('talk ' + l.id + ' ' + t.kind + '@' + t.x + ',' + t.y + ' [' + h + '] page ' + (p + 1) + '/' + lines.length, () => { BK.state = 'play'; TL.talk(lines, t.name); if (TL.talking) TL.talking.i = p; }, { cover: q => q.size === 8 && lines[p].includes(q.s.trim()) });
        BK.state = 'play'; }
      await yieldNow(); } }

  if (want('bestiary')) { const PR = window.BK.PROG; PR.beasts = PR.beasts || {};
    for (const b of TL.beasts()) PR.beasts[b.t] = Object.assign({}, PR.beasts[b.t], { seen: true, slain: PR.beasts[b.t] && PR.beasts[b.t].slain || 12 });
    for (const tab of [0, 1]) { BK.state = 'bestiary'; BK.ui.bestTab = tab; const n = BK.ui.beasts();
      for (let i = 0; i < n; i++) frame('bestiary tab' + tab + ' #' + i, () => { BK.state = 'bestiary'; BK.ui.bestTab = tab; BK.ui.bestI = i; }, { paged: true, settle: 20 }); }   /* settle: the screen's fade-in covers the first frame drawn */
    await yieldNow(); }

  if (want('store')) for (const h of HEROES) { BK.setHero(h);
    for (const mode of ['shop', 'equip']) { BK.state = 'store'; BK.ui.storeMode = mode; const tabs = BK.ui.tabs();
      for (let tb = 0; tb < tabs; tb++) { BK.ui.storeTab = tb; BK.ui.storeI = 0; const n = BK.ui.items();
        for (let i = 0; i < n; i++) frame('store ' + mode + ' [' + h + '] tab' + tb + ' #' + i, () => { BK.state = 'store'; BK.ui.storeMode = mode; BK.ui.storeTab = tb; BK.ui.storeI = i; }, { settle: 20 }); } }
    await yieldNow(); }

  if (want('tree')) for (const h of HEROES) { BK.setHero(h); BK.state = 'tree'; const n = BK.ui.treeRows();
    for (let i = 0; i < n; i++) frame('tree [' + h + '] #' + i, () => { BK.state = 'tree'; BK.ui.treeI = i; });
    await yieldNow(); }

  if (want('menu')) { toPlay(0, 'knight'); BK.state = 'menu'; const n = BK.ui.menuCount();
    for (let i = 0; i < n; i++) frame('menu #' + i, () => { BK.state = 'menu'; BK.ui.menuKind = 'pause'; BK.ui.menuI = i; }, { settle: 40 });
    /* THE PAUSE MAP: its title, its legend and its controls line, on a wood with every kind of mark (Stormhold: gates, keys, doors) */
    for (const id of ['wood', 'storm']) { const li = lvm.LEVELS.findIndex(l => l.id === id); if (li < 0) continue; toPlay(li, 'knight'); frame('menu map ' + id, () => { BK.state = 'menu'; BK.ui.mapOpen(); }, { settle: 40 }); }
    BK.ui.menuKind = 'pause'; }

  if (want('hud')) for (const h of HEROES) { toPlay(campaign.findIndex(([l]) => l.id === 'waymeet') >= 0 ? campaign.find(([l]) => l.id === 'waymeet')[1] : 0, h);
    frame('hud [' + h + '] meters full', () => { BK.state = 'play'; Object.assign(P, { resolve: 100, heat: 100, full: true, light: 100, harvest: 100, plunder: 100, loaded: true }); window.BK.PROG.tonics = 3; });
    frame('hud [' + h + '] swimming, no air', () => { BK.state = 'play'; Object.assign(P, { swim: true, breath: 0 }); });
    P.swim = false; await yieldNow(); }

  if (want('boss')) { const meas = document.createElement('canvas').getContext('2d');
    for (const [l, i] of campaign) { let Lb; try { toPlay(i, 'knight'); Lb = BK.L; } catch (e) { continue; }
      for (const [nm, A] of [['arena', Lb.arena], ['mini', Lb.mini]]) { if (!A) continue;
        const boss = BK.enemies().find(e => e.t === A.boss && e.alive);
        const names = nm === 'mini' ? [TL.miniName()] : boss ? [TL.bossTitle(boss), TL.bossTitle(Object.assign({}, boss, { phase: 3 })), TL.bossTitle(Object.assign({}, boss, { need: 'violet' }))] : [];
        for (const s of new Set(names)) { let w; if (TL.cardFit) w = TL.cardFit(s)[1]; else { meas.font = '12px "Press Start 2P", monospace'; w = Math.ceil(meas.measureText(s).width); }   /* the size the card really draws it at */
          if (w > 320 - 8) report('OVERFLOW', 'boss card ' + l.id + ' ' + nm, { s, at: 'main.js boss intro card (centred on a 320px screen)' }, { by: w - 312, text: [160 - w / 2, 0, w, 12] }); }
        if (!boss) continue;
        for (const e of BK.enemies()) if (e !== boss && !e.maxHp) e.alive = false;
        BK.tp(Math.round((A.trigger || (A.x0 + A.x1) / 2) / 16) + 1, Math.round(A.floor / 16) - 1);
        for (let f = 0; f < 90; f++) { BK.sim(6); if (f % 3 === 0) frame('boss fight ' + l.id + ' ' + nm, () => { BK.state = 'play'; }); if (BK.P.dead) BK.reset(); }
      }
      await yieldNow(); } }

  for (const m in orig) G[m] = orig[m];
  BK.god = false;
  window.__textfitShots = shots;
  return { issues, stats, shots: shots.map((s, k) => ({ k, screen: s.screen, types: s.types })) };
}

async function main() {
  const pg = await openPage();
  const input = { only, hints: hints() };
  console.log(input.hints.length + ' hint messages read out of src/main.js');
  const t0 = Date.now();
  const r = await pg.evalp('(' + pageTextFit.toString() + ')(' + JSON.stringify(input) + ')');
  const by = {}; for (const it of r.issues) (by[it.type] = by[it.type] || []).push(it);
  const ORDER = ['OVERFLOW', 'OFFSCREEN', 'CLIPPED', 'TRUNCATED', 'COVERS', 'COLLIDE', 'LONGHINT', 'SMUDGE', 'ERROR'];
  for (const ty of ORDER) { const list = by[ty] || []; if (!list.length) continue;
    console.log('\n== ' + ty + ' (' + list.length + ')');
    for (const it of list.slice(0, 60)) console.log('  ' + (it.at || '').padEnd(15) + ' ' + it.screen.slice(0, 60).padEnd(60) + ' ' + JSON.stringify(String(it.s).slice(0, 70)) +
      (it.by !== undefined ? ' +' + it.by + 'px' : '') + (it.out !== undefined ? ' -> ' + JSON.stringify(it.out) : '') + (it.other ? ' x ' + JSON.stringify(String(it.other).slice(0, 40)) + ' (' + it.otherAt + ')' : '') + (it.lines ? ' lines ' + (it.drawn !== undefined ? it.drawn + '/' : '') + it.lines : '') + (it.n > 1 ? '  (x' + it.n + ')' : ''));
    if (list.length > 60) console.log('  ... ' + (list.length - 60) + ' more in textfit.json'); }
  console.log('\n' + r.stats.frames + ' screens drawn, ' + r.stats.texts + ' strings measured, ' + Math.round((Date.now() - t0) / 1000) + 's. ' + ORDER.map(t => t + ' ' + (by[t] || []).length).join('  '));
  mkdirSync(OUT, { recursive: true });
  const SHOTS = join(OUT, 'textfit'); mkdirSync(SHOTS, { recursive: true });
  for (const s of r.shots) { const url = await pg.evalp('window.__textfitShots[' + s.k + '].png');
    s.file = join(SHOTS, String(s.k).padStart(3, '0') + '-' + s.types.join('+') + '-' + s.screen.replace(/[^\w@,.#-]+/g, '_').slice(0, 70) + '.png');
    writeFileSync(s.file, Buffer.from(url.split(',')[1], 'base64')); }
  for (const it of r.issues) if (it.shot !== undefined) it.file = r.shots[it.shot].file;
  writeFileSync(join(OUT, 'textfit.json'), JSON.stringify(r, null, 1));
  console.log(r.shots.length + ' pictures in ' + SHOTS);
  if (pg.errors.length) console.log('page errors:\n  ' + [...new Set(pg.errors)].slice(0, 8).join('\n  '));
  pg.close();
  const hard = ['OVERFLOW', 'OFFSCREEN', 'CLIPPED', 'TRUNCATED', 'COVERS', 'COLLIDE', 'SMUDGE'].reduce((n, ty) => n + (by[ty] || []).length, 0);   /* LONGHINT is reported, not failed */
  process.exit(strict && hard ? 1 : 0);
}
main().catch(e => { console.error(e.message); process.exit(1); });
