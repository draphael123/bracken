// tools/duel-roster.mjs - DUEL (BETA) ROSTER PICK SCREEN, claude/duelroster (src/duel-roster.js). NODE ONLY, no browser:
//   seat/cursor logic (grid walk + wrap, own cursor per seat, locked heroes, taken heroes), the '?' random tile, bot seats (add / remove / skill / team),
//   READY -> FIGHT -> begin(settings), back / un-ready, the settings round-trip (what is picked is remembered and is what begin runs),
//   the campaign hero restore (a duel pick never changes player one's equipped hero), and text that fits the 320 px screen.
// node tools/duel-roster.mjs
import { makeDuel, cleanSettings, loadSettings } from '../src/pvp-duel.js';
import { GRID_COLS, FIGHT_BANNER_S } from '../src/duel-roster.js';
const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log('  FAIL ' + m); } else console.log('  ok   ' + m); return c; };
const HEROES = ['knight', 'warden', 'geomancer', 'ranger', 'berserker', 'pyro', 'paladin', 'pirate', 'reaper'];
function world(o = {}) {
  let now = 0, cur = null, tavern = true; const players = [], enemies = [], store = {}, calls = { enter: [], swap: [], restore: [], text: [] };
  const mk = (hero, extra = {}) => ({ hero, n: players.length + 1, x: 0, y: 272, down: 0, dead: 0, hp: 100, maxHp: 100, maxSt: 100, st: 100, flasks: 0, face: 1, ...extra });
  const equipped = { hero: 'knight' }, owned = new Set(o.owned || ['knight', 'warden', 'pyro']);
  const ls = { getItem: k => k in store ? store[k] : null, setItem: (k, v) => { store[k] = String(v); } };
  const pit = { floor: 17, spots: [5, 20, 9, 16] };
  const api = { L: () => tavern ? { tavern: true, duelPit: null, W: 26 } : { duelPit: pit, W: 26 }, players: () => players, time: () => now, TS: 16, P: () => cur,
    asPlayer: (p, fn) => { const w = cur; cur = p; try { return fn(); } finally { cur = w; } }, passOn: () => cur, upright: p => !(p.down > 0), enemies: () => enemies, owned: () => [],
    goDown: p => { p.down = 1; }, seatAdd: sp => { if (players.length >= 4) return null; const p = mk(sp.hero, { src: sp.src }); players.push(p); return p; },
    seatDrop: p => { const i = players.indexOf(p); if (i > 0) { players.splice(i, 1); players.forEach((q, k) => { q.n = k + 1; }); } },
    float() {}, callout() {}, hint() {}, sfx() {}, colourOf: n => ({ c: '#' + ((n * 111111) % 0xffffff).toString(16).padStart(6, '0'), name: 'C' + n }), tagOf: p => 'P' + p.n, heroName: h => String(h).toUpperCase(), heroes: () => [],
    text: (s, x, y, c, a, z) => calls.text.push({ s: String(s), x, a, z }), board() {}, bar() {}, damage: (v, fx, probe) => ({ r: 'hit', landed: probe }), norm: () => 1, hand: () => ({ base: 10, add: 0 }),
    rankOf: p => p === players[0] ? { key: 'slot1', name: 'SAVE 1' } : null, ls: () => ls, leave() {},
    enter: (bot, settings) => calls.enter.push({ bot, settings }), pressRead: () => ({}), eatPress() {}, keysWrite() {}, pressWrite() {},
    heroPick: () => HEROES, owns: h => owned.has(h) || players[0].hero === h,
    setSeatHero: (p, h) => { if (!h || p.hero === h) return false; if (p === players[0]) { if (!owned.has(h)) return false; if (players.slice(1).some(q => q.hero === h)) return false; calls.swap.push(h); equipped.hero = h; } p.hero = h; return true; },
    restoreHero: h => { calls.restore.push(h); equipped.hero = h; players[0].hero = h; return true; },
    fit: (s, w) => { s = String(s); return s.length * 5 <= w ? s : s.slice(0, Math.max(1, Math.floor(w / 5))); }, inkW: s => String(s).length * 5, keyLabel: a => ({ jump: 'Z', atk: 'X', dodge: 'V', talk: 'E' })[a] || a };
  const D = makeDuel(api); players.push(mk('knight'));
  const press = (p, ...names) => { const pr = {}, keys = {}; for (const n of names) pr[n] = true; return D.cardHands(p, pr, keys); };
  const tick = s => { for (let i = 0; i < Math.round(s * 60); i++) { now += 1 / 60; D.post(1 / 60); } };
  return { D, api, players, calls, store, press, tick, mk, equipped, goPit: () => { tavern = false; }, ls };
}
const st = D => D.roster.state();
console.log('roster: open, cursors, random, ready -> fight');
{ const w = world(), { D, players: [P1] } = w;
  ok(D.openCard(P1) && D.rosterOpen() && D.st.card.roster, 'the DUEL entry opens the pick screen (not the interim card)');
  ok(st(D).cur[1].idx === 0, "P1's cursor starts on his own hero's tile (knight = 0)");
  w.press(P1, 'right'); w.press(P1, 'right'); ok(st(D).cur[1].idx === 2, 'RIGHT walks the grid');
  w.press(P1, 'left'); w.press(P1, 'left'); w.press(P1, 'left'); ok(st(D).cur[1].idx === 9, 'LEFT from the first tile wraps to the ? tile (index 9)');
  w.press(P1, 'right'); w.press(P1, 'down'); ok(st(D).cur[1].idx === GRID_COLS, 'DOWN is one grid row');
  w.press(P1, 'up'); ok(st(D).cur[1].idx === 0, 'UP is back a row');
  const r = D.roster.pick(P1, 2); ok(r === false && !st(D).ready[1], 'a hero P1 does not own cannot be picked (geomancer): no READY, ' + st(D).msg);
  ok(D.roster.pick(P1, 5), 'an owned hero (pyro) picks'); ok(D.getSettings().seats[0].hero === 'pyro' && st(D).ready[1], '...it is stored in the settings and P1 is READY');
  ok(st(D).fightT > 0, 'every seat READY (the bot always is) -> the FIGHT banner starts');
  w.tick(FIGHT_BANNER_S + 0.1);
  ok(w.calls.enter.length === 1 && w.calls.enter[0].settings.seats[0].hero === 'pyro' && w.calls.enter[0].settings.seats.length === 2, 'the banner ends in enter(bot, settings) with P1 pyro vs 1 bot');
  ok(!D.rosterOpen() && !D.st.card, '...and the screen is gone'); }
{ const w = world(), { D, players: [P1] } = w; D.openCard(P1);
  D.roster.pick(P1, 9); ok(D.getSettings().seats[0].hero === 'random', 'the ? tile stores random for P1');
  w.tick(FIGHT_BANNER_S + 0.1); ok(w.calls.enter[0].settings.seats[0].hero === 'random', 'RANDOM goes out as random: begin resolves it'); }
console.log('roster: back, un-ready, escape');
{ const w = world(), { D, players: [P1] } = w; D.openCard(P1); D.roster.pick(P1, 0);
  ok(st(D).fightT > 0, 'banner up'); w.press(P1, 'dodge'); ok(st(D).fightT === 0 && !st(D).ready[1] && D.rosterOpen(), 'BACK during the banner cancels it and un-readies');
  w.tick(2); ok(w.calls.enter.length === 0, '...and nothing starts');
  w.press(P1, 'talk'); ok(st(D).tab === 1, 'TALK flips to the RULES tab'); w.press(P1, 'dodge'); ok(st(D).tab === 0 && D.rosterOpen(), 'BACK leaves RULES first');
  w.press(P1, 'dodge'); ok(!D.rosterOpen() && !D.st.card, 'BACK on the grid leaves the screen (back at the pit)');
  D.openCard(P1); D.rosterEsc(); ok(!D.rosterOpen(), 'ESC = BACK'); }
console.log('roster: bot seats, skill, teams, rules');
{ const w = world(), { D, players: [P1] } = w; D.openCard(P1);
  w.press(P1, 'down'); w.press(P1, 'down'); ok(st(D).cur[1].focus === 'strip', 'DOWN off the grid reaches the seat strip');
  const n0 = D.getSettings().seats.length;
  w.press(P1, 'right'); w.press(P1, 'right'); ok(st(D).cur[1].scol === (n0 + 1) % (n0 + 1) || st(D).cur[1].scol <= n0, 'LEFT/RIGHT walk the seat cards (col ' + st(D).cur[1].scol + ')');
  D.roster.seatEdit(P1, n0, 'TYPE'); ok(D.getSettings().seats.length === n0 + 1, 'TYPE on the + card adds a bot seat (' + n0 + ' -> ' + D.getSettings().seats.length + ')');
  { const S = D.getSettings(), k = S.seats.length - 1; D.roster.seatEdit(P1, k, 'SKILL'); const a = D.getSettings().seats[k].botDifficulty; D.roster.seatEdit(P1, k, 'SKILL'); const b = D.getSettings().seats[k].botDifficulty;
    ok(a !== b && ['easy', 'normal', 'hard'].includes(a) && ['easy', 'normal', 'hard'].includes(b), 'SKILL cycles a bot seat (' + a + ' -> ' + b + ')');
    ok(D.roster.seatEdit(P1, 0, 'SKILL') === false, 'a human seat has no bot skill');
    ok(D.roster.seatEdit(P1, k, 'TYPE') && D.getSettings().seats.length === n0, 'TYPE on the last bot seat removes it');
    ok(D.roster.seatEdit(P1, 0, 'TYPE') === false && D.getSettings().seats.length === n0, 'the human seat cannot be removed'); }
  ok(D.roster.seatEdit(P1, 1, 'TEAM') === false, 'TEAM does nothing with teams off');
  D.setSettings({ teams: true }); ok(D.getSettings().seats.length === 4, 'teams on = four seats');
  const t0 = D.getSettings().seats[2].team; D.roster.seatEdit(P1, 2, 'TEAM'); ok(D.getSettings().seats[2].team !== t0, 'TEAM flips a seat to the other team (' + t0 + ' -> ' + D.getSettings().seats[2].team + ')');
  D.roster.seatEdit(P1, 3, 'HERO'); ok(st(D).cur[1].focus === 'grid' && st(D).cur[1].drive === 3, 'HERO on a bot seat drives it from the grid');
  D.roster.pick(P1, 6); ok(D.getSettings().seats[3].hero === 'paladin', "P1 picks the bot seat's hero (paladin)"); ok(!st(D).ready[1] && st(D).fightT === 0, "a bot's pick does not ready P1 or start the fight");
  w.press(P1, 'dodge'); w.press(P1, 'dodge');
  D.openCard(P1); w.press(P1, 'talk'); const h0 = D.getSettings().health; w.press(P1, 'down'); w.press(P1, 'right'); ok(D.getSettings().health !== h0, 'RULES: LEFT/RIGHT change the row (health ' + h0 + ' -> ' + D.getSettings().health + ')');
  const lv = D.getSettings().lives; w.press(P1, 'up'); w.press(P1, 'right'); ok(D.getSettings().lives !== lv, 'RULES: UP walks back to LIVES and changes it'); }
console.log('roster: two humans, own cursors');
{ const w = world(), { D, players } = w, P1 = players[0]; const P2 = w.mk('warden'); players.push(P2); D.openCard(P1);
  ok(st(D).cur[2].idx === 1, "P2's cursor starts on his hero (warden = 1)");
  D.roster.pick(P1, 0); ok(st(D).fightT === 0, 'P1 ready but P2 not: no FIGHT yet');
  w.press(P2, 'right'); ok(st(D).cur[2].idx === 2 && st(D).cur[1].idx === 0, 'each seat moves its own cursor');
  ok(D.roster.pick(P2, 0) === false, "P2 cannot take P1's hero (taken)");
  w.press(P2, 'left'); w.press(P2, 'jump'); ok(st(D).ready[2] && st(D).fightT > 0, 'P2 picks his own hero -> everyone READY -> FIGHT');
  w.press(P2, 'dodge'); ok(st(D).fightT === 0, 'any seat can back out of the banner');
  w.press(P2, 'talk'); ok(st(D).tab === 0, 'only player one flips tabs'); }
console.log('roster: settings round-trip');
{ const w = world(), { D, players: [P1] } = w; D.openCard(P1); D.roster.pick(P1, 5); D.roster.seatEdit(P1, 1, 'SKILL'); D.setSettings({ lives: 3, level: 'your', rounds: 5 });
  const saved = loadSettings(w.ls, 'slot1'); ok(saved.seats[0].hero === 'pyro' && saved.lives === 3 && saved.level === 'your' && saved.rounds === 5 && saved.seats[1].botDifficulty !== 'normal', 'the picks and options are remembered per save slot (device storage)');
  const w2 = world(); Object.assign(w2.store, w.store); w2.D.openCard(w2.players[0]); const S2 = w2.D.getSettings();
  ok(S2.seats[0].hero === 'pyro' && S2.lives === 3 && S2.seats[1].botDifficulty === saved.seats[1].botDifficulty, 'a fresh screen is PREFILLED from them');
  ok(st(w2.D).cur[1].idx === 5, "...and P1's cursor sits on the remembered hero (pyro)"); }
console.log('roster: the campaign hero comes back');
{ const w = world(), { D, players: [P1], calls, equipped } = w; w.goPit();
  D.begin({ settings: cleanSettings({ seats: [{ hero: 'pyro', isBot: false }, { hero: 'paladin', isBot: true }] }), seed: 3 });
  ok(P1.hero === 'pyro' && equipped.hero === 'pyro' && calls.swap.join() === 'pyro', 'a duel pick swaps player one to pyro for the match');
  D.begin({ settings: D.st.plan, seed: 4 }); ok(calls.swap.length === 1, 'a rematch does not swap again');
  D.end(); ok(P1.hero === 'knight' && equipped.hero === 'knight' && calls.restore.join() === 'knight', 'the match ending puts the campaign hero (knight) back');
  D.end(); ok(calls.restore.length === 1, 'a second end restores nothing more'); }
{ const w = world(), { D, calls } = w; w.goPit();
  D.begin({ settings: cleanSettings({ seats: [{ hero: '', isBot: false }, { hero: 'knight', isBot: true }] }), seed: 3 }); D.end();
  ok(calls.swap.length === 0 && calls.restore.length === 0, 'no pick (as he is): no swap, no restore'); }
{ const w = world({ owned: ['knight', 'warden'] }), { D, players: [P1] } = w; w.goPit(); let good = true;
  for (let i = 0; i < 20; i++) { D.end(); D.begin({ settings: cleanSettings({ seats: [{ hero: 'random', isBot: false }, { hero: 'random', isBot: true }] }), seed: 10 + i }); if (!['knight', 'warden'].includes(P1.hero)) good = false; }
  ok(good, 'random for P1 picks only a hero he owns (20 seeds)'); D.end(); ok(P1.hero === 'knight', '...and the end restores knight'); }
console.log('roster: text fits');
{ const w = world(), { D, players, calls } = w; const P2 = w.mk('warden'); players.push(P2); D.openCard(players[0]);
  const checkFit = label => { let bad = 0; for (const t of calls.text) { const wd = t.s.length * (t.z >= 16 ? 12 : t.z >= 8 ? 6 : 5), x0 = t.a === 'center' ? t.x - wd / 2 : t.a === 'right' ? t.x - wd : t.x; if (x0 < 3 || x0 + wd > 317) { bad++; console.log('    off-screen: "' + t.s + '" x=' + t.x + ' w~' + wd); } } ok(bad === 0, label + ': every line is on the 320 px screen (' + calls.text.length + ' lines)'); calls.text.length = 0; };
  D.drawRoster(320, 180); checkFit('FIGHTERS tab, 2 humans');
  D.setSettings({ teams: true }); D.roster.pick(players[0], 5); D.roster.seatEdit(players[0], 3, 'HERO'); D.roster.pick(players[0], 9); D.drawRoster(320, 180); checkFit('FIGHTERS tab, 2v2 with teams');
  D.roster.R.tab = 1; D.roster.R.fightT = 0; D.drawRoster(320, 180); checkFit('RULES tab');
  D.roster.R.tab = 0; D.roster.R.fightT = 1; D.drawRoster(320, 180); checkFit('FIGHT banner');
  ok(D.roster.R.hits.length > 0, 'the draw registers mouse hit boxes (' + D.roster.R.hits.length + ')'); }
console.log('roster: the mouse');
{ const w = world(), { D, players: [P1] } = w; D.openCard(P1); D.drawRoster(320, 180);
  const tile = D.roster.R.hits.find(h => h.k === 'tile' && h.i === 5); ok(D.rosterMouse(tile.x + 3, tile.y + 3, true) && D.getSettings().seats[0].hero === 'pyro' && st(D).ready[1], 'a click on a hero tile picks and readies P1');
  D.roster.R.fightT = 0; D.roster.R.ready.clear(); D.drawRoster(320, 180); const tab = D.roster.R.hits.find(h => h.k === 'tab' && h.i === 1); D.rosterMouse(tab.x + 2, tab.y + 2, true); ok(st(D).tab === 1, 'a click on the RULES tab flips to it'); }
console.log(fails.length ? '\nduel-roster: ' + fails.length + ' FAILED' : '\nduel-roster: all ok'); process.exit(fails.length ? 1 : 0);
