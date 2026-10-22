# Feature registries

Add a check as `tools/checks/<feature>.json`. The runner discovers every JSON file automatically:

```json
{"name":"my-feature","args":["tools/my-feature.mjs"]}
```

The default order is 9000 (then check name); existing checks retain their original relative order.
The final profile cleanup stays after feature checks. Set `port` to a checkout-relative port slot,
`timeout` to milliseconds, or `order` for an intentional earlier position. `subset` defaults to
`match`; `exact`, `full`, and `always` preserve the existing exceptional selection rules.
Use `subsetArgs` for additional arguments on a named subset. Runtime argument placeholders
`{"runtime":"suiteStart"}` and `{"runtime":"runTag"}` are reserved for cleanup declarations.

Do not edit `tools/check.mjs` to add a check. Run `node tools/check.mjs --list` and
`node tools/check-registry-selftest.mjs`. A duplicate name or malformed manifest fails immediately.

Add tell declarations in `src/tells/<feature>.json`:

```json
{"byHand":{"myfoe|swingTell":"!"},"answers":{"myfoe|swingTell":"block"},"heights":{"myfoe|swingTell":"high"}}
```

`thrown` and `quiet` are lists of `updateFunction|mode` keys; `harmless` is a list of creature types.
Existing comments/provenance moved into each feature's `notes`. Order-chapter expansion remains in
marks.js. Generated tell modules are implementation artifacts; their rows are never hand-edited.

The main game's 21 migrated content tables come from `src/registries/<feature>.json`. Entries retain
the original JavaScript expressions and ordering. For example:

```json
{"imports":["import * as MY from './my-foe.js';"],"entries":{"EHP":{"key":"myfoe","value":"MY.FOE.hp"},"COLS":{"key":"myfoe","value":"['#fff','#222']"}}}
```

Expressions use the same main.js scope. Import paths are relative to src/main.js. Existing tuned
overrides remain separate and retain their original precedence. A new entry defaults to order 9000;
set `order` only when initialization order matters. Duplicate names across features fail generation.
The one pre-existing duplicate property is explicitly retained in its feature with legacy metadata.

`npm run registries` rebuilds main.js's marked registry/import blocks, the tell modules, and the
modulepreload block from the actual import graph. Development server startup, full/subset checks,
and the production build run it automatically. `--list` stays side-effect-free.

When generated blocks conflict during a merge, preserve the feature declarations and run
`npm run registries`, then stage the regenerated files. Do not resolve generated rows by hand.
The generator is tested against conflict markers inside a generated main block. Conflicts in
actual game logic outside those blocks still need the responsible feature author's review.
