# The release gate in GitHub Actions

Push a `claude/batch*` branch. `release-gate` runs the **full** check inventory across 16 Ubuntu runners,
with one serial job per runner and fresh browsers. The planner balances the registered checks using
the measured durations; a new check gets a conservative 30-second estimate. No check is omitted for
Linux. The existing master/pull-request workflow is unchanged. `codex/ci-gate` also triggers the new
workflow so its implementation can be proved before the coordinator merges it.

Every runner checks out the same immutable commit selected by the planner. Shard logs and JSON
receipts are uploaded even on failure. The final job verifies exact coverage, duplicate results,
commit identity and completion receipts. A missing or interrupted shard fails explicitly. The merged
output uses the local gate's formatter: result lines, indented failure detail blocks and the final
`N check(s) failed.` line. Errors and details are also emitted as annotations, plus a job summary.
The artifact named `gate-summary.txt` contains the text summary and the machine-readable combined
results. The timeout leaves time to upload partial results before the runner's outer deadline.

After this workflow is on the default branch, manually choose any branch or SHA:

```powershell
gh workflow run release-gate.yml --repo draphael123/bracken --ref master -f branch=claude/batch113
```

Wait for the latest run on a pushed branch and read its result:

```powershell
$branch = 'claude/batch113'
gh run list --repo draphael123/bracken --workflow release-gate.yml --branch $branch --limit 5 --json databaseId,headSha,status,conclusion,url
$run = gh run list --repo draphael123/bracken --workflow release-gate.yml --branch $branch --limit 1 --json databaseId --jq '.[0].databaseId'
gh run watch $run --repo draphael123/bracken --exit-status
gh run view $run --repo draphael123/bracken
gh run view $run --repo draphael123/bracken --log-failed
gh run download $run --repo draphael123/bracken --name gate-summary.txt --dir gate-receipt
Get-Content gate-receipt/gate-summary.txt
Select-String -Path gate-receipt/gate-summary.txt -Pattern '^FAIL '
```

For a manual dispatch on master the run's branch is master; inspect the planner/summary's commit to
confirm the requested target. Always compare `headSha` with the intended pushed commit, not only the
branch name. GitHub's public annotations follow the repository's visibility/access policy; this code
cannot make a private repository's runs publicly visible.

To prove equivalence, save a complete local serial log at the same game commit, download the summary
artifact, and run:

```powershell
npm run check 2>&1 | Tee-Object -FilePath ../serial-gate.log
node tools/ci-gate.mjs compare --serial ../serial-gate.log --results gate-receipt/gate-results.json
```

The comparison requires a full final summary, rejects duplicate or missing check names, and compares
every verdict. It reports differences rather than treating a subset, partial run or a list of known
reds as equivalence. Runtime and platform-specific findings still require investigation.

The current gate permits one resume only after exit2 (unanswered checks), inside the same40-minute
combined shard budget. Existing PASS and FAIL verdicts are kept; a failed assertion is never retried.
If a local run is resumed, compare its final atomic checkpoint summary rather than concatenating
multiple partial result tables. For a checkpoint named ../serial-checkpoint.json:

```powershell
npm run check -- --resume ../serial-checkpoint.json
node tools/ci-gate.mjs compare --serial ../serial-checkpoint.json.summary.txt --results gate-receipt/gate-results.json
```

Both sources must still be the same immutable commit. An incomplete final summary is rejected,
and interruption history remains in each checkpoint.
