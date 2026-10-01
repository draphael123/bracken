// tools/frame-cost.mjs - WHAT A FRAME ASKS OF THE GRAPHICS CARD (claude/perf51, 2026-09-30: Daniel, "why is the game so laggy now?").
// Three costs a frame counter does not show, each counted in the page rather than timed (a count is the same on every machine):
//   1. IN PLAY the foreground sheet (main.js drawFront) is never read back. A per-frame getImageData kept the sheet on the CPU, so the near
//      layer's GPU art was pulled back to the CPU every frame: ~3 ms a frame in every outdoor level and, with the card busy, 100-600 ms frames.
//   2. A VIEW CHANGE (a boss that zooms, his respawns, the WIDE camera) re-bakes only the backdrop, not every tile and prop (setView).
//   3. THE THEATRE: a flat landing re-resolves the tiles and must not make a fresh canvas for every side-lit block again.
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false }); const fails = [], ok = (c, m) => { if (!c) fails.push(m); };
try {
  const r = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; BK.god = true;
    const C = CanvasRenderingContext2D.prototype, gi = C.getImageData, ce = Document.prototype.createElement; let reads = 0, made = 0;
    C.getImageData = function (...a) { const v = BK.view; if (this.canvas && this.canvas.width === v.VW && this.canvas.height === v.VH) reads++; return gi.apply(this, a); };   /* a sheet the size of the frame: a sprite baked on first sight is not counted */
    Document.prototype.createElement = function (t, ...x) { if (String(t).toLowerCase() === 'canvas') made++; return ce.call(this, t, ...x); };
    const at = id => LEVELS.findIndex(l => l.id === id), out = {}, zoom0 = BK.SET.zoom;
    try {
      BK.SET.zoom = 'close'; BK.load(at('wood')); BK.state = 'play'; BK.sim(200);
      reads = 0; for (let i = 0; i < 120; i++) { BK.keys.right = i % 60 < 40; BK.step(1); } BK.keys.right = false; out.woodReads = reads;
      made = 0; BK.SET.zoom = 'wide'; BK.step(1); out.zoomMade = made; made = 0; BK.SET.zoom = 'close'; BK.step(1); out.unzoomMade = made;
      made = 0; BK.load(at('wood')); out.loadMade = made;
      const th = at('theatre'); if (th >= 0) { BK.load(th); BK.state = 'play'; BK.sim(60); made = 0; BK.sim(1500); out.theatreMade = made; }
    } finally { C.getImageData = gi; Document.prototype.createElement = ce; BK.SET.zoom = zoom0; }
    return out; })()`, 600000);
  console.log('wood, 120 frames in play: ' + r.woodReads + ' read-backs; view change: ' + r.zoomMade + ' + ' + r.unzoomMade + ' canvases (a level load makes ' + r.loadMade +
    '); theatre, 25 s: ' + r.theatreMade + ' canvases');
  ok(r.woodReads === 0, 'the wood read the GPU back ' + r.woodReads + ' times in 120 frames of play (main.js drawFront: the coverage read is for tools only, BK.frontProbe)');
  ok(r.loadMade > 200 && r.zoomMade < r.loadMade * 0.25 && r.unzoomMade < r.loadMade * 0.25, 'a view change re-baked far more than the backdrop: ' + r.zoomMade + ' and ' + r.unzoomMade + ' canvases against a level load\'s ' + r.loadMade + ' (setView should call bakeBackdrop, not bakeAll)');
  if (r.theatreMade !== undefined) ok(r.theatreMade < 60, 'the theatre made ' + r.theatreMade + ' canvases in 25 s of play (src/redraw/theatre_tiles.js trimmed(): one copy per tile and edge set)');
  ok(!pg.errors.length, 'the page threw: ' + pg.errors.slice(0, 3).join(' | '));
} catch (e) { fails.push('frame-cost failed to run: ' + e.message); }
finally { await pg.close(); }
if (fails.length) { for (const f of fails) console.log('FAIL ' + f); process.exit(1); }
console.log('frame cost: no read-back in play, a view change re-bakes only the backdrop, the theatre keeps its trimmed blocks.');
