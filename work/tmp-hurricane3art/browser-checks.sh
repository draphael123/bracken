cd "/c/Users/Daniel Raphael/.claude/bracken-lanes/bracken-hurricane3art"
export PATH="/c/Program Files/nodejs:$PATH"; export PORT=6606
L=../h3art-logs
ram() { powershell -NoProfile -Command "[int]((Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory/1KB)" | tr -d '\r'; }
run() { n=$1; shift; for i in $(seq 1 40); do r=$(ram); [ "$r" -ge 1500 ] && break; echo "wait ram $r"; sleep 30; done; echo "=== $n ram $(ram)"; timeout 1200 "$@" > $L/$n.log 2>&1; echo "$n exit $?"; tail -3 $L/$n.log | cut -c1-240; }
run pixels node tools/headless.mjs floats
run textfit node tools/textfit.mjs bestiary --strict
run mobileperf env MP_SCENES=hurricane node tools/mobile-perf.mjs
run stormrt node tools/storm-ship-runtime.mjs
run bossread node tools/boss-read.mjs
echo ALLDONE
