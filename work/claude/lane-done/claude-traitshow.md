# TRAITSHOW (claude/traitshow)
Menu: the one STORE's SKILLS tab (src/main.js drawSkills), ACTIVES tab (the activatable abilities). The inn bar store is the same store; no separate menu.
Shows: below the ability list a TRAITS strip: `CORE <names>` (lit cores; "NAME + n MORE" when long; dim `LV n` before the first arrives), then two cells `S1 <trait> I/II/III` / `S2 <trait> I/II/III`, `EMPTY` for an open empty slot, `AT LV 20` for the locked 2nd slot. Read only; wearing stays on the TRAITS tab. Only for split heroes (all but the paladin).
Cost: the ACTIVES list shows 4 rows per page (was 6) on split heroes to make room; same up/down navigation, no touch row boxes exist.
Checks: node --check main.js; skill-menu (asserts CORE/S1/S2 drawn for each split hero) pass; skill-icons pass; traits pass; store-ui pass; textfit tree (189 screens) all 0. store-preview: red on master too (tab 0 canvases 272 > 240, pre-existing, not this change; skills tab 126 -> 138, under cap).
Stills: scratch/lane-reports/traitshow/{knight-l12,knight-l22,geomancer-l22,pyro-l5}.png (3x; knight-l12 = 1 trait + locked 2nd; geomancer-l22 = 2 slots). Phone: the canvas is a fixed 320x180 picture scaled up, so a phone shows the same pixels; textfit covers fit.
Questions: (1) 6 rows -> 4 rows OK? rec yes; alternative = shrink the preview box. (2) show a tap-to-wear shortcut from the strip? rec no.
