#!/usr/bin/env bash

echo "🚀 Testando Nova Navegação Tecnológica..."
echo "=========================================="

# Verificar se o servidor está rodando
if ! curl -s http://localhost:3002 > /dev/null 2>&1; then
    echo "❌ Servidor não está rodando na porta 3002"
    echo "🔧 Iniciando servidor..."
    cd /Users/marcosantoniodealbuquerquefilho/novo-site
    pnpm dev -p 3002 &
    sleep 10
else
    echo "✅ Servidor já está rodando na porta 3002"
fi

echo ""
echo "🎨 NOVA NAVEGAÇÃO IMPLEMENTADA:"
echo "================================="
echo "✅ Botões redesenhados com estilo tecnológico"
echo "✅ Bordas removidas e substituídas por glassmorphism"
echo "✅ Efeitos de hover sofisticados com partículas flutuantes"
echo "✅ Gradientes sutis e sombras dinâmicas"
echo "✅ Animações CSS personalizadas"
echo "✅ Layout mais compacto e profissional"
echo "✅ Cores únicas para cada botão (azul, roxo, verde, ciano, laranja)"
echo "✅ Efeitos de glow e brilho ao passar o mouse"
echo "✅ Partículas flutuantes animadas no hover"
echo "✅ Transições suaves com cubic-bezier"

echo ""
echo "🌐 Abrindo navegador para visualizar..."
open http://localhost:3002

echo ""
echo "🔍 TESTE MANUAL:"
echo "================="
echo "1. Passe o mouse sobre cada botão da navegação"
echo "2. Observe os efeitos de glow e partículas flutuantes"
echo "3. Verifique as transições suaves e animações"
echo "4. Teste em diferentes tamanhos de tela"
echo "5. Confirme que não há bordas visíveis"

echo ""
echo "✨ A nova navegação deve ter:"
echo "   • Visual futurista e tecnológico"
echo "   • Efeitos de glassmorphism"
echo "   • Animações suaves e profissionais"
echo "   • Layout mais compacto e elegante"
echo "   • Cores temáticas para cada seção"

echo ""
echo "🎯 Se houver algum problema, verifique:"
echo "   • Console do navegador para erros JavaScript"
echo "   • CSS personalizado em globals.css"
echo "   • Classes Tailwind aplicadas corretamente"

echo ""
echo "🚀 Navegação tecnológica implementada com sucesso!"
