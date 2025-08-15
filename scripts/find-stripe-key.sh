#!/usr/bin/env bash
set -euo pipefail

# Procura por STRIPE_SECRET_KEY e padrões sk_test_/sk_live_ em locais comuns

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
say() { printf "%b%s%b\n" "$YELLOW" "$*" "$NC"; }

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
HOME_DIR="$HOME"

say "[1/4] Verificando variáveis no ambiente atual..."
env | grep -i '^STRIPE_' || echo "(nenhuma STRIPE_* no ambiente desta shell)"

say "[2/4] Buscando em arquivos do projeto (.env*, scripts, config)..."
grep -RInE "(STRIPE_SECRET_KEY|NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY|sk_(test|live)_[A-Za-z0-9_]+)" \
  "$PROJECT_DIR" \
  --exclude-dir node_modules --exclude-dir .git --color=always || echo "(nada encontrado no projeto)"

say "[3/4] Buscando em arquivos do seu shell (histórico e perfis)..."
FILES=(
  "$HOME_DIR/.zsh_history"
  "$HOME_DIR/.bash_history"
  "$HOME_DIR/.zshrc"
  "$HOME_DIR/.bash_profile"
  "$HOME_DIR/.profile"
  "$HOME_DIR/.config/fish/config.fish"
)
for f in "${FILES[@]}"; do
  if [ -r "$f" ]; then
    if grep -qE "(STRIPE_SECRET_KEY|sk_(test|live)_[A-Za-z0-9_]+)" "$f"; then
      printf "\n${GREEN}-- %s --${NC}\n" "$f"
      grep -nE "(STRIPE_SECRET_KEY|sk_(test|live)_[A-Za-z0-9_]+)" "$f" | sed 's/^/  /'
    fi
  fi
done

say "[4/4] Verificando config do Stripe CLI (~/.config/stripe)..."
if [ -d "$HOME_DIR/.config/stripe" ]; then
  grep -RInE "(STRIPE_SECRET_KEY|sk_(test|live)_[A-Za-z0-9_]+)" "$HOME_DIR/.config/stripe" || \
    echo "(geralmente o Stripe CLI NÃO armazena a API Secret Key; apenas device tokens)"
else
  echo "(~/.config/stripe não encontrado)"
fi

echo
say "Se encontrar a linha completa, copie a sk_test_/sk_live_ e eu salvo no .env.local e executo o autorun."




