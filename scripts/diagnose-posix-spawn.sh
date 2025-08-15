#!/bin/zsh
set -euo pipefail

echo "=== SHELL ==="
echo "SHELL=$SHELL"
echo "ZSH_VERSION=${ZSH_VERSION:-}"
echo

echo "=== OS & PWD ==="
sw_vers 2>/dev/null || true
pwd
echo

echo "=== PATH ==="
print -l -- $PATH | nl -ba
echo

echo "=== which node / npm ==="
which -a node || true
which -a npm || true
echo

echo "=== node -v (via PATH) ==="
if command -v node >/dev/null 2>&1; then node -v; else echo "node NOT FOUND in PATH"; fi
echo

echo "=== Candidate absolute nodes ==="
for p in /opt/homebrew/bin/node /usr/local/bin/node; do
  if [ -x "$p" ]; then
    echo "$p -> $($p -v)"
  fi
done
echo

SRC_DIR="$HOME/Downloads/Colete Tricot Decote V"
echo "=== SOURCE DIR EXISTS? ==="
echo "$SRC_DIR"
if [ -d "$SRC_DIR" ]; then
  echo "OK: directory exists"
  echo "Image count:"; find "$SRC_DIR" -type f -iregex '.*\.(png|jpe?g|webp)$' | wc -l | awk '{print $1 " files"}'
else
  echo "MISSING: directory not found"
fi
echo

echo "=== Test: run node inline ==="
if command -v node >/dev/null 2>&1; then node -e "console.log('NODE_INLINE_OK', process.version)"; fi
for p in /opt/homebrew/bin/node /usr/local/bin/node; do
  if [ -x "$p" ]; then
    $p -e "console.log('NODE_ABS_OK', process.version)"
  fi
done
echo

echo "=== Repo-relative files ==="
ls -1 scripts/import-from-folder-into-product.js || true
ls -1 scripts/importar-produto-5.sh || true
echo

echo "=== Ready to run import (not executing here) ==="
echo "To run: node scripts/import-from-folder-into-product.js 5 \"$SRC_DIR\""
echo "Or absolute: /opt/homebrew/bin/node scripts/import-from-folder-into-product.js 5 \"$SRC_DIR\""



