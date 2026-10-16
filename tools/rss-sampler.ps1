# tools/rss-sampler.ps1 - samples the working set of THIS suite run's test browsers (profile dir bracken-<kind>-<runtag>-...) every few
# seconds and appends "epochMs totalMB maxProcMB procCount" to the file given. check.mjs reads it to print each check's peak RSS live.
# Exits when the parent (check.mjs) is gone. Read-only: it never kills anything (scratch/memguard.ps1 is the guard).
param([string]$Out, [string]$Tag, [int]$ParentPid, [int]$Every = 3)
while ($true) {
  if (-not (Get-Process -Id $ParentPid -ErrorAction SilentlyContinue)) { break }
  try {
    $re = 'Temp.bracken-[a-z]+-' + [regex]::Escape($Tag) + '-'
    $ids = @(Get-CimInstance Win32_Process -Filter "Name='chrome.exe' or Name='msedge.exe'" | Where-Object { $_.CommandLine -match $re } | ForEach-Object { $_.ProcessId })
    $tot = 0; $max = 0
    foreach ($i in $ids) { $p = Get-Process -Id $i -ErrorAction SilentlyContinue; if ($p) { $m = [int]($p.WorkingSet64 / 1MB); $tot += $m; if ($m -gt $max) { $max = $m } } }
    $ms = [int64]([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())
    Add-Content -Path $Out -Value ("{0} {1} {2} {3}" -f $ms, $tot, $max, $ids.Count)
  } catch { }
  Start-Sleep -Seconds $Every
}
