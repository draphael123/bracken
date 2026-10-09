// tools/soundtest.mjs — THE SOUND TEST'S LOCK (Daniel's design, 2026-09-27): a song unlocks once it is actually
// heard in play - a level, a boss arena or a menu track - never by browsing the Sound Test itself; sound effects are
// all open from the start. In the page:
//   - a fresh save (and an OLD save with no heardMusic field at all) opens with only what is safe already unlocked
//     (the title theme and the stage-select tune - both play before a player has chosen anything) and every other
//     song in the list drawn as '???'
//   - Z on a locked song does not start it playing
//   - hearing a track for real (music.play, exactly what a level/boss/menu does) unlocks it AND WRITES IT into the
//     slot's own save, not just this session's memory
//   - the unlock survives the save being reloaded from localStorage (loadSlot, what a real page reload does)
//   - once unlocked, the Sound Test shows its real name and Z plays it
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: true, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{
    const { MUSIC_NAMES, music } = await import('/src/audio.js');
    BK.manualSimulation = true; const P0 = BKT.PROG; const out = {};
    const target = 'lance', ti = MUSIC_NAMES.indexOf(target);
    if (ti < 0) throw new Error('MUSIC_NAMES has no ' + target + ' - fixture out of date');
    // a real track loads and decodes off the network before music.track names it - give it real time to land
    const sleep = ms => new Promise(res => setTimeout(res, ms));
    const waitTrack = async (name, ms = 8000) => { const t0 = Date.now(); while (music.track !== name && Date.now() - t0 < ms) await sleep(30); return music.track === name; };

    // a fresh save (also stands in for an OLD save: migrateProgress(null) is the same path an old save with no
    // heardMusic key takes through progDefaults)
    BK.eraseSlot(BK.slot);
    out.freshHasTheme = !!(P0.heardMusic && P0.heardMusic.theme);
    out.freshHasSelect = !!(P0.heardMusic && P0.heardMusic.select);
    out.freshLockedCount = MUSIC_NAMES.filter(n => !(P0.heardMusic && P0.heardMusic[n])).length;
    out.freshTargetLocked = !(P0.heardMusic && P0.heardMusic[target]);

    // open the Sound Test on MUSIC, sitting on the still-locked target
    BK.state = 'soundtest'; BK.soundCat = 1; BK.soundI = ti;
    window.__textRec = []; BK.step(0);
    let shown = (window.__textRec || []).map(t => t.s).filter(Boolean);
    out.lockedDrawnAsQuestions = shown.includes('???');
    out.lockedNameLeaked = shown.includes(target);
    window.__textRec = null;

    // Z on it must not start it playing
    const before = music.track;
    BK.press('confirm'); BK.sim(1);
    out.lockedRefusedToPlay = music.track === before;

    // hearing it for real (a boss arena or a menu would call exactly this) unlocks it and saves it
    music.play(target); await waitTrack(target);
    out.unlockedInMemory = !!(P0.heardMusic && P0.heardMusic[target]);
    const savedRaw = JSON.parse(localStorage.getItem('bracken.progress.' + BK.slot) || '{}');
    out.savedToSlot = !!(savedRaw.heardMusic && savedRaw.heardMusic[target]);

    // a real reload of the slot (migrateProgress + progDefaults from localStorage, what a page reload runs) keeps it
    BK.loadSlot(BK.slot);
    out.survivesSlotReload = !!(BKT.PROG.heardMusic && BKT.PROG.heardMusic[target]);

    // and now the Sound Test shows its name and plays it
    BK.state = 'soundtest'; BK.soundCat = 1; BK.soundI = ti;
    window.__textRec = []; BK.step(0);
    shown = (window.__textRec || []).map(t => t.s).filter(Boolean);
    out.unlockedNameShown = shown.includes(target);
    window.__textRec = null;
    music.stop();
    BK.press('confirm'); BK.sim(1);
    out.unlockedPlays = await waitTrack(target);

    return out;
  })()`, 120000);
  console.log(JSON.stringify(r));

  // Follow-up (Daniel, 2026-09-27): "an option on the MAIN MENU for sound test" - a SOUND TEST item straight off the
  // title screen, next to the existing one buried in Settings. It must be the same screen (not a second copy), and
  // ESC from it must land back on the title, not on the Settings list it never went through.
  const m = await pg.evalp(`(()=>{
    const out = {};
    BK.ui.pressCard = true; BK.ui.pressCard = false; /* the card and its walk-in are over (an earlier key in this run took the card down; the walk-in would swallow the next press) */ BK.state = 'title'; BK.step(0);
    /* OPTIONS (Daniel 10-09): SETTINGS / SOUND TEST / CONTROLS are no longer top-level rows; they are one OPTIONS row away. Same strictness: top level has OPTIONS and none of the three, the list under it has all three. */
    const top = BK.ui.titleItems();
    out.oneOptionsRow = top.includes('OPTIONS') && !top.includes('SETTINGS') && !top.includes('SOUND TEST') && !top.includes('CONTROLS');
    BK.ui.titleI = top.indexOf('OPTIONS'); BK.press('confirm'); BK.sim(1);
    const items = BK.ui.titleItems();
    out.hasEntry = items.includes('SOUND TEST');
    out.keepsSettings = items.includes('SETTINGS');
    const idx = items.indexOf('SOUND TEST');
    BK.ui.titleI = idx; BK.press('confirm'); BK.sim(1);
    out.opensSoundTest = BK.state === 'soundtest';
    BK.press('pause'); BK.sim(1);
    out.backGoesToTitle = BK.state === 'title';
    return out;
  })()`, 30000);
  console.log(JSON.stringify(m));
  assert.ok(m.oneOptionsRow, 'the title screen menu groups SETTINGS / SOUND TEST / CONTROLS under one OPTIONS row: ' + JSON.stringify(m));
  assert.ok(m.hasEntry, 'the OPTIONS list has a SOUND TEST item: ' + JSON.stringify(m));
  assert.ok(m.keepsSettings, 'and SETTINGS is still there too: ' + JSON.stringify(m));
  assert.ok(m.opensSoundTest, 'choosing it opens the Sound Test: ' + JSON.stringify(m));
  assert.ok(m.backGoesToTitle, 'and ESC from it returns to the title screen, not a menu it never opened: ' + JSON.stringify(m));
  console.log('ok  soundtest  the title screen also opens SOUND TEST straight from its main menu, and ESC from it returns to the title');

  assert.ok(r.freshHasTheme, 'a fresh/old save unlocks the title theme by default: ' + JSON.stringify(r));
  assert.ok(r.freshHasSelect, 'and the stage-select tune, also heard before any choice: ' + JSON.stringify(r));
  assert.ok(r.freshTargetLocked, 'and nothing else: ' + JSON.stringify(r));
  assert.ok(r.freshLockedCount > 60, 'a fresh save starts with nearly every song locked: ' + JSON.stringify(r));
  assert.ok(r.lockedDrawnAsQuestions, 'an unheard song is drawn as ??? in the Sound Test: ' + JSON.stringify(r));
  assert.ok(!r.lockedNameLeaked, "an unheard song's real name must not be drawn anywhere on that screen: " + JSON.stringify(r));
  assert.ok(r.lockedRefusedToPlay, 'Z on a locked song does not start it playing');
  assert.ok(r.unlockedInMemory, 'hearing a track in play (music.play) unlocks it in PROG.heardMusic');
  assert.ok(r.savedToSlot, "the unlock is written into the slot's own save, not just held in memory");
  assert.ok(r.survivesSlotReload, 'the unlock survives the save being reloaded from localStorage');
  assert.ok(r.unlockedNameShown, 'once heard, the Sound Test shows its real name');
  assert.ok(r.unlockedPlays, 'and Z on it now plays it');
  assert.deepEqual(pg.errors, []);
  console.log('ok  soundtest  a fresh or old save opens with only the title theme and stage-select unlocked, every other song shown as ??? and refusing to play; hearing one in play unlocks and saves it, the unlock survives a save reload, and the Sound Test then shows its name and plays it');
} finally { pg.close(); }
