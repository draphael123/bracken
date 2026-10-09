export PATH="/c/Program Files/nodejs:$PATH"
export PORT=8782
for t in "textfit.mjs hints,bestiary,store,tree,menu,hud,pick,opening,press,title,mapcard,death,results,card,practice,bossjump,plates,bossfix,soundtest,slots,trial,erase,credits --strict" "uiscreens.mjs" "titlescene.mjs" "touch.mjs" "save-slots.mjs" "soundtest.mjs" "modulepreload.mjs" "dangling-paths.mjs" "map-footer.mjs" "map-grammar.mjs" "architecture.mjs" "comments.mjs" "settings-tabs.mjs"; do
  echo "=== $t"; timeout 900 node tools/$t 2>&1 | tail -8; echo "exit ${PIPESTATUS[0]}"
done
