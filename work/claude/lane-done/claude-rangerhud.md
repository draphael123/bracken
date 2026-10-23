# claude/rangerhud - Ranger BOW / KNIFE swap on every input + quiver row under the XP bar (Daniel 10-23)
Base 0f56945e. PNGs: work/claude/lane-done/rangerhud/{before,after}-*.png (desktop 960x540 full + minimal HUD, phone 915x412, touch before/after; bow/knife; full/low/empty/lying).
- Keys: 2 (kept; no second key - O/Y are rebind targets partner-throw relies on). Pad: BACK (a ranger's BACK is the stance and does not dance; every other pad button is a skill/flask/grab/guard). Touch: BOW/KNIFE button (shows current stance), 3rd in the right bar / beside the thumb arc. Remap label 'BOW / KNIFE'. Co-op seats (pad + online guest + touch) now carry stance too.
- Swap: pop + sound + new poses rgSling (bow slung, knife drawn) / rgBowUp. Hint line once ('2: SWAP BOW / KNIFE...' per input) 9 s after her first arrow; hero card + controls card row updated.
- HUD: quiver row tab directly under the XP bar (icon, word, arrow per quiver place, hollow = out, glint + '+N' lying, refill fill on next hollow, LOW amber pulse, EMPTY red KNIFE, knife stance dims). Stays on in the minimal HUD. Seat plates: ranger seats get their own row (plate 9 px taller).
- Checks: ranger OK; textfit hud,party --strict 0 issues (new ranger HUD + 4-ranger seat frames); settings-tabs, hint-shown, touch, keys, ui-hud, hud-default, ability-poses, rgart-poses, coop-progress, ai-companion, online-coop OK; mobile-perf OK (58.5 fps).
- Reds: partner-throw 'captain CHIPPED hero blow' fails identically on base (preexisting); audit-touch needs untracked audits/combat data (not run-able here).
## QUESTIONS FOR DANIEL
- Pad swap on BACK (rec, built) vs R3 (shared with grab, breaks partner-throw's rule). OK?
- Add a second keyboard key? Rec: none.
