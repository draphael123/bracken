cd "/c/Users/Daniel Raphael/.claude/bracken-lanes/bracken-hudslim"
export PATH="/c/Program Files/nodejs:$PATH"; export PORT=8784
L=work/claude/hudslim/logs
for t in tells floaters frame-cost render-layers mark-integrity shake-mode store-ui save-slots level-complete; do
  node tools/$t.mjs > $L/$t.log 2>&1; echo "$t $?" >> $L/status2.txt
done
echo ALLDONE >> $L/status2.txt
