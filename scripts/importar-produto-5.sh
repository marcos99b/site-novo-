#!/bin/zsh
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"

NODE_CMD="node"
if ! command -v $NODE_CMD >/dev/null 2>&1; then
  echo "Erro: Node.js não encontrado. Instale o Node (ex.: brew install node) e tente novamente."
  exit 1
fi

SRC_DIR="$HOME/Downloads/Colete Tricot Decote V"

if [ ! -d "$SRC_DIR" ]; then
  echo "Erro: pasta não encontrada: $SRC_DIR"
  exit 1
fi

echo "Importando imagens do produto 5 a partir de: $SRC_DIR"
$NODE_CMD "$REPO_DIR/scripts/import-from-folder-into-product.js" 5 "$SRC_DIR"
echo "Concluído. Atualize o navegador em /produto/5 e /catalogo."



