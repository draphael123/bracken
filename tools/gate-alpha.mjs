// tools/gate-alpha.mjs — NOTHING DRAWN PLAIN INHERITS ANOTHER PROP'S GLOW (Falling Tower's desert gate, claude/ft3 follow-up,
// 2026-09-27). Daniel: the desert's level-end gate drew faint and see-through, reproduced at the desert's old rows too, so
// it was not about where the gate sat. Found with a canvas monkey-patch: drawHealths() called bloom() directly (not the
// fbloom() wrapper that puts globalAlpha back to 1) to glow a floating heart pickup, and did it with no screen bounds check
// - so ANY heart still falling anywhere in the level, on screen or off, left the buffer at alpha 0.3 for every plain
// g.drawImage() after it that trusts globalAlpha to be 1 (as the gate's own draw does). Node only, static: it does not
// re-run the browser render every check, only holds the source to the fix.
import { readFileSync } from 'node:fs';
const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const fails = [], ok = (c, m) => { if (!c) fails.push(m); };
const fn = (src.match(/function drawHealths\([^)]*\)\s*\{[^}]*\}/) || [''])[0];
ok(fn.length > 0, 'drawHealths() not found (renamed or moved: update this check)');
ok(!/[^f]bloom\(/.test(fn.replace('fbloom', '')), 'drawHealths() calls bloom() directly - it leaves globalAlpha set, and the next plain drawImage (the desert gate among them) draws faint; use fbloom(), which puts it back to 1');
ok(/fbloom\(/.test(fn), 'drawHealths() no longer calls fbloom() at all: the heart lost its glow, or the check no longer matches it');
ok(/h\.x\s*<\s*cx\s*-\s*\d+.*h\.x\s*>\s*cx\s*\+\s*VW\s*\+\s*\d+|h\.x\s*>\s*cx\s*\+\s*VW/.test(fn), 'drawHealths() has no off-screen bounds check: every heart anywhere in the level blooms every frame, on screen or not');
if (fails.length) { for (const f of fails) console.log('FAIL ' + f); console.log(fails.length + ' FAILED'); process.exitCode = 1; }
else console.log('ok  gate-alpha   drawHealths() glows a heart with fbloom() (globalAlpha put back to 1) and skips ones off screen: nothing after it in the frame draws faint');
