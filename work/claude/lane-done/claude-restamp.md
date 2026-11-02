# claude/restamp
tools/restamp.mjs: one command refreshing per-level stamps (pilot, curve, mash level, optional boss/mini; walker rows listed stale, report-only). See README.md section and the file header.
Usage: node tools/restamp.mjs --level <id>[,<id>] | --all [--dry] [--boss] [--only=..] [--no-verify].
Also: gorm-unlock fix (3a50cbf5 cherry-picked) + 15-min watchdog, awaited close, explicit exit.
Full report: scratch/lane-reports/restamp.md
