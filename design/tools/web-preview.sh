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
  # Asset URLs in the bundle are absolute ("/assets/..."); make them relative to the preview page.
  sed 's#"/assets/#(window.__LK_BASE||"/")+"assets/#g' "$OUT$f" > "$OUT/app/$(basename "$f")"
  SCRIPTS="$SCRIPTS app/$(basename "$f")"
done
{
  echo '<title>App Preview</title>'
  echo '<style>html,body{height:100%;margin:0;background:#0b0c18}body{overflow:hidden}#root{display:flex;height:100%;flex:1}</style>'
  echo '<div id="root"><p id="lk-loading" style="margin:auto;color:#f5f2ff;font:600 15px system-ui,sans-serif">Loading Lokal…</p></div>'
  # Show startup errors on screen, so a screenshot of a broken preview explains itself.
  echo '<script>window.addEventListener("error",function(e){var d=document.createElement("pre");d.style.cssText="position:fixed;left:8px;right:8px;bottom:8px;z-index:9999;white-space:pre-wrap;background:#3a0d14;color:#ffd7dc;padding:10px;border-radius:10px;font:12px monospace";d.textContent="Preview error: "+(e.message||e.error||"unknown")+(e.filename?" at "+e.filename+":"+e.lineno:"");document.body.appendChild(d)});window.addEventListener("unhandledrejection",function(e){var d=document.createElement("pre");d.style.cssText="position:fixed;left:8px;right:8px;bottom:8px;z-index:9999;white-space:pre-wrap;background:#3a0d14;color:#ffd7dc;padding:10px;border-radius:10px;font:12px monospace";d.textContent="Preview error: "+(e.reason&&e.reason.message||e.reason);document.body.appendChild(d)})</script>'
  # Resolve script URLs first, then reset the path so the router opens on the home screen.
  printf '<script>(function(){var base=location.href;var srcs=%s;' "$(printf '%s
' $SCRIPTS | python3 -I -c 'import json,sys;print(json.dumps(sys.stdin.read().split()))')"
  echo 'window.__LK_BASE=new URL(".",base).href;var urls=srcs.map(function(s){return new URL(s,base).href});try{if(location.pathname!=="/")history.replaceState(null,"","/")}catch(e){}urls.forEach(function(u){var el=document.createElement("script");el.src=u;el.async=false;document.body.appendChild(el)})})()</script>'
} > "$OUT/preview.html"
echo "$SCRIPTS"
