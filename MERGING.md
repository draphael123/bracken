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

Tell, main-game dispatch and preload migration are still in progress on this branch. Their existing
source locations remain authoritative until the corresponding migration and equivalence proof land.
