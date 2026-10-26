#!/bin/bash
# usage: run.sh <row> <tag>; waits for >=1500 MB free
export PATH="/c/Program Files/nodejs:$PATH"
cd "$(dirname "$0")/../.."
while true; do f=$(powershell -c "[int]((Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory/1024)" | tr -d '\r'); [ "$f" -ge 1500 ] && break; sleep 30; done
SEED0=${SEED0:-0} BOT_PROFILE=human node tools/boss-rates.mjs $1 --ways=practiced --seeds=${3:-12} --jobs=1 --profile=human --out=work/b122tune/$2.json > work/b122tune/$2.log 2>&1
