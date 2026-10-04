// src/controls.js - CONTROL CUSTOMISATION (claude/storeui, HANDOFF item 22a) and THE PER-HERO CONTROLS CARD (item 18).
//
// EVERY ACTION IS REBINDABLE, for the KEYBOARD (player one) and for each PAD (player one's and player two's): move, up, crouch/down,
// jump, attack (HOLD it for the heavy blow: one key, the way the game has always had it), C (the guard, or the hero's own ability),
// dodge, skill one (F), skill two (G), talk, map, the skills menu, pause and the emote.
//
// THE MODEL. `binds` is { kb, pad1, pad2 }, each { action: [slotA, slotB] } holding ONLY the actions the player changed. An action that is
// not in there runs on its DEFAULT list (KB_DEFAULT / PAD_DEFAULT: the same keys the game has always answered to, alternates
// included, so an old save and an untouched controls page behave exactly as before). Changing either slot of an action turns its two
// visible slots into its whole list. Keys are stored by a plain name (a letter in lower case, 'Space', 'ArrowLeft', 'Shift'...); a pad
// button by its Gamepad API index (0 = A ... 15 = right on the pad). Nothing here touches the DOM or the game: main.js applies
// keysTable(binds) onto its KEYS arrays in place and padTable() into its pad reader, and calls the draw/update pair at the foot.
//
// WHAT CANNOT BE LOST: ESC always pauses, the menus keep Z / ENTER / SPACE to choose and the arrows to move (main.js reads them for
// every state but play), START pauses, and the pad's A still chooses in a menu. R (back to the shrine) and M (music) are
// reserved: they cannot be bound. A key shared by two actions is FLAGGED (both rows go red and the screen says which), not refused.
//
// The card (cardRows) is the one place the hero-by-hero button words live: it used to be a fixed table in main.js with the Pyromancer's
// C listed as 'block' (it is her ember and her jet; her down is the EMBER FLARE).

export const KB_ACTIONS = [
  { id: 'left', label: 'MOVE LEFT' }, { id: 'right', label: 'MOVE RIGHT' }, { id: 'up', label: 'UP / LOOK UP' }, { id: 'down', label: 'CROUCH / DOWN' },
  { id: 'jump', label: 'JUMP' }, { id: 'atk', label: 'ATTACK / HEAVY' }, { id: 'block', label: 'C: GUARD/ABILITY' }, { id: 'dodge', label: 'DODGE' },
  { id: 'throw', label: 'SKILL ONE' }, { id: 'skill2', label: 'SKILL TWO' }, { id: 'talk', label: 'TALK / READ' }, { id: 'map', label: 'MAP' },
  { id: 'talents', label: 'SKILLS MENU' }, { id: 'pause', label: 'PAUSE' }, { id: 'dance', label: 'EMOTE' },
];
export const ACTION_IDS = KB_ACTIONS.map(a => a.id);
export const PROFILES = [{ id: 'kb', name: 'KEYBOARD  P1' }, { id: 'pad1', name: 'GAMEPAD  P1' }, { id: 'pad2', name: 'GAMEPAD  P2' }];
const PROFILE_IDS = PROFILES.map(p => p.id);

/* THE DEFAULTS: the lists main.js's KEYS held before rebinding existed, word for word */
export const KB_DEFAULT = {
  jump: ['z', 'Space', 'ArrowUp', 'w', 'k'], atk: ['x', 'j', 'Enter'], block: ['c', 'l'], dodge: ['v', 'Shift'],
  throw: ['f', 'b'], skill2: ['g', 'n'], talk: ['e', 't'],
  left: ['ArrowLeft', 'a'], right: ['ArrowRight', 'd'], down: ['ArrowDown', 's'], up: ['ArrowUp', 'w'], pause: ['Escape', 'p'], talents: ['q'], dance: ['h'], map: ['Tab'],
};
/* the pad's defaults: A jump, X swing, B dodge, Y skill one, RT skill two, LB/RB C, BACK the emote, START pause, the d-pad to move (the stick always moves too).
   skill three / four (L3, R3) have no menu row (the game has two skill slots) but keep their buttons. */
export const PAD_DEFAULT = { jump: [0], atk: [2], dodge: [1], throw: [3], skill2: [7], skill3: [10], skill4: [11], skill5: [], talk: [12, 6], block: [4, 5], dance: [8], pause: [9],
  left: [14], right: [15], up: [12], down: [13], map: [], talents: [] };
const ALL_PAD_ACTIONS = Object.keys(PAD_DEFAULT);

export const RESERVED_KEYS = ['r', 'm'];   /* R: back to the shrine, M: music (main.js's keydown) */

export const KEY_NAMES = { ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT', Space: 'SPACE', Shift: 'SHIFT', Enter: 'ENTER', Tab: 'TAB', Escape: 'ESC', Backspace: 'BKSP', Control: 'CTRL', Alt: 'ALT', Delete: 'DEL', Home: 'HOME', End: 'END', PageUp: 'PGUP', PageDown: 'PGDN', Insert: 'INS' };
export const BTN_NAMES = ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT', 'BACK', 'START', 'L3', 'R3', 'D-UP', 'D-DOWN', 'D-LEFT', 'D-RIGHT'];
export const keyLabel = k => k == null ? '' : (KEY_NAMES[k] || String(k).toUpperCase());
export const btnLabel = b => b == null ? '' : (BTN_NAMES[b] || 'B' + b);

/* A KEYBOARD EVENT'S KEY IN THE NAME THIS FILE STORES: 'z' whether shift was down or not, ' ' as 'Space'. null when it is no key to bind. */
export function normaliseKey(e) {
  let k = e && e.key; if (typeof k !== 'string' || !k) return null;
  if (k === ' ') return 'Space';
  if (['Dead', 'Unidentified', 'Meta', 'OS', 'ContextMenu', 'CapsLock', 'NumLock', 'ScrollLock', 'Process'].includes(k) || /^F\d+$/.test(k)) return null;
  return k.length === 1 ? k.toLowerCase() : k;
}
/* the spellings isKey() (main.js) needs for a stored key: it compares e.key AND e.code */
export function keyVariants(k) {
  if (k === 'Space') return [' ', 'Space'];
  if (typeof k === 'string' && k.length === 1 && k.toLowerCase() !== k.toUpperCase()) return [k.toLowerCase(), k.toUpperCase()];
  return [k];
}

export const emptyBinds = () => ({ kb: {}, pad1: {}, pad2: {} });
/* WHAT CAME OUT OF localStorage IS NOT TRUSTED: only known actions, at most two slots, a key string or a button 0-31 or nothing */
export function cleanBinds(raw) {
  const out = emptyBinds();
  if (!raw || typeof raw !== 'object') return out;
  for (const p of PROFILE_IDS) {
    const src = raw[p]; if (!src || typeof src !== 'object') continue;
    for (const a of (p === 'kb' ? ACTION_IDS : ALL_PAD_ACTIONS)) {
      const v = src[a]; if (!Array.isArray(v)) continue;
      const slots = v.slice(0, 2).map(x => p === 'kb' ? (typeof x === 'string' && (x.length === 1 || KEY_NAMES[x]) ? x : null) : (Number.isInteger(x) && x >= 0 && x < 32 ? x : null));
      while (slots.length < 2) slots.push(null);
      out[p][a] = slots;
    }
  }
  return out;
}
const tableOf = p => p === 'kb' ? KB_DEFAULT : PAD_DEFAULT;
export const isCustom = (binds, prof, action) => !!(binds && binds[prof] && binds[prof][action]);
/* the whole list an action answers to */
export function effective(binds, prof, action) {
  if (isCustom(binds, prof, action)) return binds[prof][action].filter(x => x != null);
  return (tableOf(prof)[action] || []).slice();
}
/* the two slots the rebind screen shows: the custom pair, or the first two defaults */
export function slotsOf(binds, prof, action) {
  if (isCustom(binds, prof, action)) return binds[prof][action].slice(0, 2);
  const d = tableOf(prof)[action] || []; return [d[0] ?? null, d[1] ?? null];
}
export function setSlot(binds, prof, action, slot, value) {
  const cur = slotsOf(binds, prof, action);
  cur[slot === 1 ? 1 : 0] = value;
  if (cur[0] == null && cur[1] != null) { cur[0] = cur[1]; cur[1] = null; }   /* a lone key sits in the first slot */
  if (cur[0] != null && cur[0] === cur[1]) cur[1] = null;
  binds[prof][action] = cur;
  return binds;
}
export function resetProfile(binds, prof) { binds[prof] = {}; return binds; }
export const resetAll = binds => { for (const p of PROFILE_IDS) binds[p] = {}; return binds; };
export const anyCustom = binds => PROFILE_IDS.some(p => Object.keys((binds && binds[p]) || {}).length > 0);

/* CONFLICTS: a key (or button) that two different actions both answer to, where at least one of the two was changed by the player.
   (The defaults share on purpose: UP is also jump on the arrow key and W, and the d-pad's up is also talk. Those are not flags.)
   -> { action: [{ other, key }] } */
export function conflicts(binds, prof) {
  const out = {}, ids = prof === 'kb' ? ACTION_IDS : ALL_PAD_ACTIONS, key = x => prof === 'kb' ? String(x).toLowerCase() : x;
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
    const a = ids[i], b = ids[j]; if (!isCustom(binds, prof, a) && !isCustom(binds, prof, b)) continue;
    const la = effective(binds, prof, a).map(key), lb = effective(binds, prof, b).map(key);
    const shared = la.find(x => lb.includes(x)); if (shared === undefined) continue;
    (out[a] = out[a] || []).push({ other: b, key: shared }); (out[b] = out[b] || []).push({ other: a, key: shared });
  }
  return out;
}
export const actionLabel = id => (KB_ACTIONS.find(a => a.id === id) || { label: String(id).toUpperCase() }).label;

/* WHAT MAIN.JS APPLIES: every action's list in the spellings isKey() compares. ESC is always a pause key. */
export function keysTable(binds) {
  const t = {};
  for (const a of ACTION_IDS) { const list = []; for (const k of effective(binds, 'kb', a)) for (const v of keyVariants(k)) if (!list.includes(v)) list.push(v); t[a] = list; }
  for (const v of ['Escape']) if (!t.pause.includes(v)) t.pause.push(v);
  return t;
}
/* a pad's action -> [button, ...], for player one's pad or player two's. START always pauses. */
export function padTable(binds, prof) {
  const t = {}; for (const a of ALL_PAD_ACTIONS) t[a] = effective(binds, prof, a);
  if (!t.pause.includes(9)) t.pause.push(9);
  return t;
}
/* a pad's pressed state through a table: the same fields padState always returned, the stick still moving */
export function padStateOf(gp, table) {
  const b = i => !!(gp.buttons[i] && gp.buttons[i].pressed), any = a => table[a].some(b), ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
  return { jump: any('jump'), atk: any('atk'), dodge: any('dodge'), throw: any('throw'), skill2: any('skill2'), skill3: any('skill3'), skill4: any('skill4'), skill5: any('skill5'), talk: any('talk'), block: any('block'), dance: any('dance'),
    pause: any('pause'), map: any('map'), talents: any('talents'), left: any('left') || ax < -0.5, right: any('right') || ax > 0.5, up: any('up') || ay < -0.5, down: any('down') || ay > 0.5 };
}

/* "Z / SPACE": the keys (or buttons) an action answers to, n of them */
export function labelFor(binds, prof, action, n = 2) {
  const ls = slotsOf(binds, prof, action).filter(x => x != null).slice(0, n).map(prof === 'kb' ? keyLabel : btnLabel);
  return ls.length ? ls.join(' / ') : '-';
}
const first = (binds, prof, action) => labelFor(binds, prof, action, 1);

/* ============================== THE PER-HERO CONTROLS CARD ==============================
   Rows are [what, keys, pad]. The words are the hero's; the keys are whatever the player has bound (tokens: the first key of the action). */
const HEROES_C = {
  knight:     ['block', tk => 'HOLD ' + tk.c + (tk.toggle ? ' (TOGGLE)' : '')],
  pyro:       ['ember / jet', tk => 'TAP ' + tk.c + ' EMBER, HOLD JET'],
  paladin:    ['mend / aegis', tk => 'TAP ' + tk.c + ' MEND, HOLD AEGIS'],
  pirate:     ['parry / hook', tk => 'TAP ' + tk.c + ' PARRY, HOLD HOOK'],
  reaper:     ['blood ward', tk => 'HOLD ' + tk.c + ', LET GO: NOVA'],
  warden:     ['the deflect', tk => 'TAP ' + tk.c + '  (FULL: PHALANX)'],
  geomancer:  ['rune-ward', tk => 'HOLD ' + tk.c + '  (SHE IS PLANTED)'],
};
export function cardRows({ hero = 'knight', binds = emptyBinds(), prof = 'pad1', swapZX = false, blockToggle = false } = {}) {
  const kb = a => labelFor(binds, 'kb', a), pd = a => labelFor(binds, prof, a), k1 = a => first(binds, 'kb', a);
  const swapped = swapZX && !isCustom(binds, 'kb', 'jump') && !isCustom(binds, 'kb', 'atk');
  const jumpKeys = swapped ? 'X / SPACE' : kb('jump'), atkKeys = swapped ? 'Z / J' : kb('atk');
  const tk = { c: k1('block'), toggle: blockToggle };
  const cRow = HEROES_C[hero] || HEROES_C.knight;
  const stock = !isCustom(binds, 'kb', 'left') && !isCustom(binds, 'kb', 'right');
  const rows = [
    ['move', stock ? 'ARROWS / WASD' : k1('left') + ' ' + k1('right') + ' (MOVE)', 'STICK'],
    ['emote', k1('dance') + ': DANCE, MOVE TO STOP', pd('dance')],
    ['jump', jumpKeys, pd('jump')],
    ['swing', atkKeys, pd('atk')],
    ['plunge', k1('down') + '+SWING IN AIR', pd('down') + '+' + pd('atk')],
    [hero === 'knight' ? 'heavy cut' : hero === 'geomancer' ? 'fault line' : 'heavy blow', hero === 'geomancer' ? 'HOLD SWING, LET GO' : hero === 'knight' ? 'HOLD SWING, LET GO' : 'HOLD SWING', 'HOLD ' + pd('atk')],
    ['third cut', 'SWING x3 IN A RUN', pd('atk') + ' x3'],
    ['rising cut', k1('up') + '+SWING', pd('up') + '+' + pd('atk')],
    ['low sweep', k1('down') + '+SWING', pd('down') + '+' + pd('atk')],
    /* THE CROUCH: every hero ducks (src/duck.js); the Pyromancer's PRESS of down is also the EMBER FLARE (src/ember-ward.js) */
    [hero === 'pyro' ? 'weak guard' : 'crouch', 'HOLD ' + k1('down') + ' (STILL)', 'HOLD ' + pd('down')],
    ['slide', 'HOLD ' + k1('down') + ' ON A SLOPE', 'HOLD ' + pd('down')],   /* THE BUTT-SLIDE (src/slide.js): down on any slope, feet first; it wins over the weak guard there */
    ...(hero === 'pyro' ? [['ember flare', 'TAP ' + k1('down') + ' ON A HIT', 'TAP ' + pd('down')]] : []),
    [cRow[0], cRow[1](tk), pd('block')],
    ['dodge', hero === 'warden' ? k1('dodge') + ' BACK, OR TAP A WAY TWICE' : 'TAP A WAY TWICE, OR ' + kb('dodge'), pd('dodge')],
    ['', 'TELLS ARE TIMED FOR ONE PRESS', pd('dodge')],
    hero === 'reaper' ? ['summon', kb('throw') + '  (HOLD, FULL: SURGE)', pd('throw')] : ['skill', kb('throw') + ' (equipped)', pd('throw')],
    hero === 'reaper' ? ['his skill', kb('skill2') + ' (CHOSEN)', pd('skill2')] : ['skill two', kb('skill2') + ' (equipped)', pd('skill2')],
    ['talk', kb('talk') + ' (signs, folk)', pd('talk')],
    ['pause', kb('pause') + '   (MAP: ' + k1('map') + ')', pd('pause')],
    ['drop', k1('down') + '+' + k1('jump') + ' ON A LEDGE', pd('down') + '+' + pd('jump')],
    ['to shrine', 'R (NOT A DEATH)', '-'],
  ];
  return rows;
}

/* ============================== THE REBIND SCREEN ============================== */
export const newRebind = (prof = 0) => ({ prof, i: 0, slot: 0, listening: false, msg: '', msgT: 0, arm: 0 });
const RESET_ROW = ACTION_IDS.length;
export const rebindProfile = rb => PROFILE_IDS[rb.prof];
const say = (rb, s, t = 3) => { rb.msg = s; rb.msgT = t; };

/* a key or a pad button arrived while listening: bind it. Returns true when the press was used. */
export function rebindCapture(rb, binds, kind, value) {
  if (!rb.listening) return false;
  const prof = rebindProfile(rb), action = ACTION_IDS[rb.i]; if (!action) { rb.listening = false; return true; }
  if ((kind === 'key') !== (prof === 'kb')) return false;
  if (kind === 'key' && RESERVED_KEYS.includes(value)) { say(rb, value.toUpperCase() + ' IS RESERVED'); rb.listening = false; return true; }
  setSlot(binds, prof, action, rb.slot, value); rb.listening = false;
  const c = (conflicts(binds, prof)[action] || [])[0];
  say(rb, c ? 'ALSO USED BY: ' + actionLabel(c.other) : actionLabel(action) + ' = ' + (kind === 'key' ? keyLabel(value) : btnLabel(value)), c ? 4 : 2);
  return true;
}
/* the flags: up, down, left, right, ok (choose), back, clear, tabL, tabR. Returns 'exit' to leave the screen, 'changed' when binds changed. */
export function rebindUpdate(rb, binds, f, dt) {
  rb.msgT = Math.max(0, rb.msgT - dt); rb.arm = Math.max(0, rb.arm - dt);
  if (rb.listening) { if (f.back) { rb.listening = false; say(rb, 'CANCELLED', 1.5); } return null; }
  if (f.tabL) { rb.prof = (rb.prof + PROFILES.length - 1) % PROFILES.length; rb.listening = false; }
  if (f.tabR) { rb.prof = (rb.prof + 1) % PROFILES.length; rb.listening = false; }
  if (f.back) return 'exit';
  if (f.up) rb.i = rb.i <= -1 ? RESET_ROW : rb.i - 1;
  if (f.down) rb.i = rb.i >= RESET_ROW ? -1 : rb.i + 1;
  if (rb.i === -1) { if (f.left) rb.prof = (rb.prof + PROFILES.length - 1) % PROFILES.length; if (f.right) rb.prof = (rb.prof + 1) % PROFILES.length; return null; }
  if (rb.i < RESET_ROW) {
    if (f.left) rb.slot = 0; if (f.right) rb.slot = 1;
    if (f.clear) { setSlot(binds, rebindProfile(rb), ACTION_IDS[rb.i], rb.slot, null); say(rb, 'CLEARED', 1.5); return 'changed'; }
    if (f.ok) { rb.listening = true; say(rb, rebindProfile(rb) === 'kb' ? 'PRESS A KEY  (ESC CANCELS)' : 'PRESS A BUTTON  (ESC CANCELS)', 8); }
  } else if (f.ok) {
    if (rb.arm > 0) { resetProfile(binds, rebindProfile(rb)); rb.arm = 0; say(rb, 'BACK TO THE DEFAULTS', 2); return 'changed'; }
    rb.arm = 3; say(rb, 'CONFIRM AGAIN TO RESET THIS PAGE', 3);
  }
  return null;
}
export function drawRebind(c, rb, binds) {
  const { g, text, fitText, textW, panel, UI, VW, VH, time } = c;
  g.fillStyle = 'rgba(10,14,12,0.85)'; g.fillRect(0, 0, VW, VH);
  const x = 14, y = 2, w = VW - 28, h = VH - 4; panel(x, y, w, h);
  text('REBIND', VW / 2, y + 4, UI.title, 'center');
  const prof = rebindProfile(rb), conf = conflicts(binds, prof);
  /* the strip: three pages, the selected one bracketed (row -1 is the strip itself) */
  { let sx = x + 8; PROFILES.forEach((p, k) => { const on = k === rb.prof, tw = textW(p.name, 6) + 8;
      g.fillStyle = on ? (rb.i === -1 ? 'rgba(143,209,96,0.3)' : 'rgba(255,211,107,0.18)') : 'rgba(255,255,255,0.05)'; g.fillRect(sx, y + 15, tw, 9);
      text(p.name, sx + tw / 2, y + 17, on ? UI.title : UI.dim, 'center', 6); sx += tw + 4; }); }
  const top = y + 28, step = 8, colA = x + 118, colB = x + 178, cw = 56;
  KB_ACTIONS.forEach((a, i) => {
    const yy = top + i * step, sel = rb.i === i, bad = !!conf[a.id];
    if (sel) { g.fillStyle = 'rgba(143,209,96,0.13)'; g.fillRect(x + 4, yy - 1, w - 8, step); }
    text(fitText(a.label, colA - x - 14, 6), x + 8, yy, bad ? '#ff8a7a' : sel ? UI.title : UI.text, 'left', 6);
    const sl = slotsOf(binds, prof, a.id);
    [0, 1].forEach(s => { const cx = s ? colB : colA, on = sel && rb.slot === s, listening = on && rb.listening;
      g.fillStyle = listening ? 'rgba(255,211,107,0.35)' : on ? 'rgba(143,209,96,0.28)' : 'rgba(255,255,255,0.06)'; g.fillRect(cx, yy - 1, cw, step - 1);
      const t = listening ? (Math.floor(time * 3) % 2 ? '...' : '?') : (sl[s] == null ? '-' : prof === 'kb' ? keyLabel(sl[s]) : btnLabel(sl[s]));
      text(fitText(t, cw - 4, 6), cx + cw / 2, yy, listening ? '#ffd36b' : sl[s] == null ? '#6a6f6a' : on ? UI.title : (isCustom(binds, prof, a.id) ? '#ffd36b' : UI.dim), 'center', 6); });
    if (bad) text('!', x + w - 10, yy, '#ff6b5a', 'right', 6);
    else if (!isCustom(binds, prof, a.id) && (tableOf(prof)[a.id] || []).length > 2) text('+' + ((tableOf(prof)[a.id] || []).length - 2), x + w - 10, yy, '#6a6f6a', 'right', 6);
  });
  { const yy = top + KB_ACTIONS.length * step, sel = rb.i === RESET_ROW; if (sel) { g.fillStyle = 'rgba(143,209,96,0.13)'; g.fillRect(x + 4, yy - 1, w - 8, step); }
    text(rb.arm > 0 ? 'PRESS AGAIN: RESET THIS PAGE' : 'RESET THIS PAGE TO DEFAULTS', x + 8, yy, rb.arm > 0 ? '#ffd36b' : sel ? UI.title : UI.text, 'left', 6); }
  const line = rb.msgT > 0 && rb.msg ? rb.msg : prof === 'kb' ? 'Z SET   BKSP CLEAR   TAB PAGE   ESC BACK' : 'A SET   LB RB PAGE   ESC BACK';
  text(fitText(line, w - 12, 6), VW / 2, y + h - 9, rb.msgT > 0 && rb.msg ? (rb.msg.startsWith('ALSO') || rb.msg.includes('RESERVED') ? '#ff8a7a' : '#ffd36b') : UI.dim, 'center', 6);
}
