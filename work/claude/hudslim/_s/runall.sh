cd "/c/Users/Daniel Raphael/.claude/bracken-lanes/bracken-hudslim"
export PATH="/c/Program Files/nodejs:$PATH"
export PORT=8784
L=work/claude/hudslim/logs; mkdir -p $L
node tools/textfit.mjs plates,bossjump,bossfix,death,results,card > $L/tf2.log 2>&1; echo "tf2 $?" >> $L/status.txt
for t in fonts signs hint-shown modulepreload dangling-paths ui-hud settings-tabs touch uiscreens death-screen godmode readability zoom-coverage; do
  node tools/$t.mjs > $L/$t.log 2>&1; echo "$t $?" >> $L/status.txt
done
echo ALLDONE >> $L/status.txt
