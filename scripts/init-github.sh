#!/usr/bin/env bash
set -euo pipefail

# Uso: ./scripts/init-github.sh <github-usuario> <repo-nome> [public|private]
# Ex.: ./scripts/init-github.sh marcos99b novo-site private

USER_NAME=${1:-}
REPO_NAME=${2:-}
VISIBILITY=${3:-private}

if [[ -z "${USER_NAME}" || -z "${REPO_NAME}" ]]; then
  echo "Uso: $0 <github-usuario> <repo-nome> [public|private]" >&2
  exit 1
fi

if [[ "${VISIBILITY}" != "public" && "${VISIBILITY}" != "private" ]]; then
  echo "Visibilidade inválida: ${VISIBILITY}. Use public|private" >&2
  exit 1
fi

# 1) Inicializar git (se necessário)
if ! git rev-parse --git-dir >/dev/null 2>&1; then
  git init
  git branch -M main || true
fi

# 2) .gitignore básico para Node/Next
if [[ ! -f .gitignore ]]; then
  cat > .gitignore <<'EOF'
.DS_Store
node_modules/
.env*
.vercel/
.next/
out/
dist/
*.log
EOF
fi

# 3) Commit inicial (idempotente)
git add -A
if ! git diff --cached --quiet; then
  git commit -m "chore: initial commit"
fi

# 4) Criar repositório no GitHub (se gh estiver logado) e fazer push
if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  if ! gh repo view "${USER_NAME}/${REPO_NAME}" >/dev/null 2>&1; then
    gh repo create "${USER_NAME}/${REPO_NAME}" --${VISIBILITY} --source=. --remote=origin --push
  else
    # Repo já existe: apenas conectar remoto e enviar
    if ! git remote get-url origin >/dev/null 2>&1; then
      git remote add origin "https://github.com/${USER_NAME}/${REPO_NAME}.git"
    fi
    git push -u origin main
  fi
  echo "✅ Repositório pronto: https://github.com/${USER_NAME}/${REPO_NAME}"
else
  echo "⚠️ GitHub CLI (gh) não encontrado ou não autenticado."
  echo "1) Crie o repositório manualmente em: https://github.com/new (nome: ${REPO_NAME}, visibilidade: ${VISIBILITY})"
  echo "2) Depois execute:" 
  echo "   git remote add origin https://github.com/${USER_NAME}/${REPO_NAME}.git"
  echo "   git push -u origin main"
fi


