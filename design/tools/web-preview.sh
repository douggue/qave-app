#!/usr/bin/env bash
# Build a browser preview of the app for publishing as an artifact.
# Usage: preview.sh <project-dir> <out-dir>
set -euo pipefail
PROJ=$1; OUT=$2
cd "$PROJ"
cp app.json "$OUT.app.json.bak"
restore() { cp "$OUT.app.json.bak" app.json; rm -f "$OUT.app.json.bak"; }
trap restore EXIT
# One bundle, no lazy route chunks, so everything loads from relative paths.
python3 -I - <<'PY'
import json
a=json.load(open('app.json')); e=a['expo']
e['web']['output']='single'
e['plugins']=[['expo-router',{'asyncRoutes':False}] if p=='expo-router' else p for p in e['plugins']]
json.dump(a,open('app.json','w'),indent=2)
PY
rm -rf "$OUT"
npx expo export --platform web --output-dir "$OUT" >/dev/null
# Artifact page: body content only, scripts referenced relatively.
# The artifact service reserves names starting with "_", so serve bundles from app/.
mkdir -p "$OUT/app"
SCRIPTS=""
for f in $(grep -o '/_expo/static/js/web/[^"]*\.js' "$OUT/index.html"); do
  cp "$OUT$f" "$OUT/app/"; SCRIPTS="$SCRIPTS app/$(basename "$f")"
done
{
  echo '<title>App Preview</title>'
  echo '<style>html,body{height:100%;margin:0;background:#0b1020}body{overflow:hidden}#root{display:flex;height:100%;flex:1}</style>'
  echo '<div id="root"></div>'
  # Resolve script URLs first, then reset the path so the router opens on the home screen.
  printf '<script>(function(){var base=location.href;var srcs=%s;' "$(printf '%s
' $SCRIPTS | python3 -I -c 'import json,sys;print(json.dumps(sys.stdin.read().split()))')"
  echo 'var urls=srcs.map(function(s){return new URL(s,base).href});try{if(location.pathname!=="/")history.replaceState(null,"","/")}catch(e){}urls.forEach(function(u){var el=document.createElement("script");el.src=u;el.async=false;document.body.appendChild(el)})})()</script>'
} > "$OUT/preview.html"
echo "$SCRIPTS"
