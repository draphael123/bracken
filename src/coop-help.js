// src/coop-help.js - CO-OP, TAUGHT (claude/storeui, HANDOFF item 22b).
//
// A four-page HOW TO PLAY for local co-op: how player two joins, their keys and pad, the shared camera, being downed and revived, what
// the pair share and what they do not. It opens by itself the first time co-op is switched on (SET.coopHelpSeen, kept with the settings),
// and from the pause menu ('Co-op guide') and the Settings > CONTROLS tab at any time. The numbers on the page are the game's own
// (main.js passes DOWN_T and REVIVE_T in), so the words cannot drift from the rules.
//
// tools/settings-tabs.mjs checks the page opens once, and tools/textfit.mjs sweeps every page for text that runs out of its box.

export const COOP_HELP_PAGES = ({ downT = 20, reviveT = 1.5 } = {}) => [
  { title: 'JOINING', lines: [
    ['#', 'PLAYER ONE  keyboard, or the first pad'],
    ['#', 'PLAYER TWO  a gamepad, or an ALLY the game plays'],
    ['', 'TURN IT ON: title screen > LOCAL CO-OP, or the pause menu > Co-op, then pick the second hero. Z takes a pad player, X asks for the ally instead.'],
    ['', 'Start any wood from the map and the pair go in together. Shops, trials and the rush are one hero at a time.'],
    ['', 'With two pads plugged in, the second one takes player one, so both of you can sit back. Pause > Co-op turns it off again.'],
  ] },
  { title: 'THE SECOND PLAYER', lines: [
    ['#', 'GAMEPAD DEFAULTS'],
    ['', 'STICK or D-PAD move   A jump   X swing (hold: heavy)   B dodge'],
    ['', 'LB or RB the hero\'s C   Y skill one   RT skill two   BACK emote'],
    ['', 'START and every menu belong to player one, so nobody pauses on a partner who is reading.'],
    ['#', 'CHANGE ANY OF IT'],
    ['', 'Settings > CONTROLS > Rebind keys: one page each for the keyboard, pad one and pad two. A key or button used twice is flagged red.'],
  ] },
  { title: 'ONE SCREEN, DOWN NOT DEAD', lines: [
    ['#', 'THE SHARED CAMERA'],
    ['', 'One camera follows the pair, with no zoom. The frame is a wall: whoever runs ahead stops at the edge until the other catches up. Nobody is dragged.'],
    ['#', 'DOWN, NOT DEAD'],
    ['', 'A hero at zero lies down and crawls. Their partner stands on them for ' + reviveT + 's and they are up at a third of their health, with a moment of grace.'],
    ['', 'Leave them ' + downT + 's, or lose both at once, and you BOTH wake at the last shrine.'],
  ] },
  { title: 'SHARED, AND NOT', lines: [
    ['#', 'SHARED'],
    ['', 'the purse (every coin), the last shrine, the wood you have cleared, its medals and your unlocks. The way out opens only when BOTH stand at it.'],
    ['#', 'YOUR OWN'],
    ['', 'health, stamina and meters, skills and level, blows and kills. Every creature and boss has twice the health and hits twice as hard.'],
    ['', 'A score is kept: kills, coins, and above all revives.'],
  ] },
];

/* THE TWO PROMPTS THAT COME UP IN A FIRST DOWN AND A FIRST REVIVE, at most twice each per save (PROG.coopTips). Returns true when one is due
   and counts it; main.js sets its own hint line (hintMsg is read by tools/textfit.mjs from the source, so the words stay in main.js). */
export function coopTipDue(prog, kind, max = 2) {
  prog.coopTips = prog.coopTips || {};
  if ((prog.coopTips[kind] || 0) >= max) return false;
  prog.coopTips[kind] = (prog.coopTips[kind] || 0) + 1; return true;
}

/* THE PAGE, drawn with main.js's own hand (c = { g, text, wrap, panel, UI, VW, VH }) */
export function drawCoopHelp(c, page, pages) {
  const { g, text, wrap, panel, UI, VW, VH } = c;
  g.fillStyle = 'rgba(10,14,12,0.88)'; g.fillRect(0, 0, VW, VH);
  const x = 12, y = 4, w = VW - 24, h = VH - 8; panel(x, y, w, h);
  const p = pages[page];
  text('HOW TO PLAY CO-OP', VW / 2, y + 5, UI.title, 'center', 9);   /* 9 = TYPE.head (main.js FONT.size): the panel header in Press Start 2P */
  text(p.title, VW / 2, y + 17, '#ffd36b', 'center', 8);
  let yy = y + 31;
  for (const [tag, s] of p.lines) {
    if (tag === '#') { text(s.toUpperCase(), x + 10, yy, '#8fd160', 'left', 6); yy += 9; continue; }
    for (const ln of wrap(s.toUpperCase(), w - 20, 6)) { text(ln, x + 10, yy, UI.text, 'left', 6); yy += 8; }
    yy += 3;
  }
  pages.forEach((_, i) => { g.fillStyle = i === page ? '#ffd36b' : 'rgba(255,255,255,0.25)'; g.fillRect(VW / 2 - pages.length * 5 + i * 10, y + h - 21, 6, 3); });
  text(page < pages.length - 1 ? 'LEFT/RIGHT page   Z next   ESC close' : 'LEFT/RIGHT page   Z or ESC close', VW / 2, y + h - 12, UI.dim, 'center', 6);
}
