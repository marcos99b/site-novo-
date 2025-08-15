# 🎨 ESPECIFICAÇÕES PARA IMAGENS DO BANNER - RELIET

## 📍 **LOCALIZAÇÃO DO BANNER**
- **Página**: http://localhost:3000/ (Página Principal)
- **Posição**: Logo abaixo dos produtos em destaque
- **Seção**: Entre produtos e "A experiência Reliet"

## 🖼️ **ESPECIFICAÇÕES TÉCNICAS DAS IMAGENS**

### **📱 MOBILE (Prioridade Alta)**
- **Resolução**: 800 x 600 pixels
- **Formato**: JPG ou PNG
- **Tamanho arquivo**: Máximo 200KB
- **Aspect ratio**: 4:3 (horizontal)
- **Qualidade**: 85-90%

### **💻 DESKTOP (Prioridade Média)**
- **Resolução**: 1200 x 800 pixels
- **Formato**: JPG ou PNG
- **Tamanho arquivo**: Máximo 400KB
- **Aspect ratio**: 3:2 (horizontal)
- **Qualidade**: 90-95%

### **🖥️ LARGE DESKTOP (Opcional)**
- **Resolução**: 1600 x 1000 pixels
- **Formato**: JPG ou PNG
- **Tamanho arquivo**: Máximo 600KB
- **Aspect ratio**: 8:5 (horizontal)
- **Qualidade**: 95%

## 🎯 **RECOMENDAÇÕES DE DESIGN**

### **📐 COMPOSIÇÃO**
- **Foco principal**: Centro-esquerda da imagem
- **Espaço para texto**: Lado direito livre
- **Profundidade**: Evitar elementos muito próximos das bordas
- **Contraste**: Alto contraste para legibilidade

### **🎨 PALETA DE CORES**
- **Cores principais**: Tons de outono (âmbar, laranja, marrom)
- **Complementares**: Azuis e verdes suaves
- **Neutros**: Branco, cinza claro, bege
- **Evitar**: Cores muito vibrantes ou neon

### **👗 CONTEÚDO SUGERIDO**
- **Modelo feminina** em pose elegante
- **Roupas de outono** (casacos, coletes, blazers)
- **Ambiente**: Exterior urbano ou interior sofisticado
- **Iluminação**: Natural e suave
- **Estilo**: Elegante, sofisticado, premium

## 📁 **ESTRUTURA DE ARQUIVOS**

### **📍 LOCALIZAÇÃO**
```
public/
├── banner-outono-2025.jpg          ← IMAGEM PRINCIPAL
├── banner-outono-2025-mobile.jpg   ← VERSÃO MOBILE (opcional)
└── banner-outono-2025-large.jpg    ← VERSÃO LARGE (opcional)
```

### **🏷️ NOMENCLATURA**
- **Formato**: `banner-[tema]-[ano].jpg`
- **Exemplos**:
  - `banner-outono-2025.jpg`
  - `banner-inverno-2025.jpg`
  - `banner-verao-2025.jpg`

## 🔧 **IMPLEMENTAÇÃO TÉCNICA**

### **📱 RESPONSIVIDADE**
- **Mobile**: 100% da largura da tela
- **Tablet**: 50% da largura da tela
- **Desktop**: 40% da largura da tela

### **⚡ OTIMIZAÇÃO**
- **Lazy loading**: Não (prioridade alta)
- **WebP**: Suporte automático
- **Compressão**: Automática via Next.js
- **Cache**: 1 ano para imagens estáticas

## 🎨 **EXEMPLOS DE BANNERS**

### **🍂 OUTONO 2025 (Atual)**
- **Tema**: Coleção Outono
- **Cores**: Âmbar, laranja, marrom
- **Elementos**: Casacos, coletes, folhas de outono
- **Mensagem**: "Até 40% de desconto"

### **❄️ INVERNO 2025 (Próximo)**
- **Tema**: Coleção Inverno
- **Cores**: Azul, cinza, branco
- **Elementos**: Casacos de lã, cachecóis, neve
- **Mensagem**: "Novidades Inverno"

### **🌸 PRIMAVERA 2025 (Futuro)**
- **Tema**: Coleção Primavera
- **Cores**: Rosa, verde, amarelo
- **Elementos**: Vestidos leves, flores, jardim
- **Mensagem**: "Renovação Primavera"

## 📱 **TESTE DE RESPONSIVIDADE**

### **🔍 VERIFICAÇÕES**
1. **Mobile (320px)**: Imagem ocupa 100% da largura
2. **Tablet (768px)**: Imagem ocupa 50% da largura
3. **Desktop (1024px+)**: Imagem ocupa 40% da largura

### **📏 BREAKPOINTS**
- **sm**: 640px (Mobile grande)
- **md**: 768px (Tablet)
- **lg**: 1024px (Desktop pequeno)
- **xl**: 1280px (Desktop)
- **2xl**: 1536px (Desktop grande)

## 🚀 **PRÓXIMOS PASSOS**

### **1. CRIAR IMAGEM**
- [ ] Designar imagem seguindo especificações
- [ ] Otimizar para web (compressão)
- [ ] Testar em diferentes dispositivos

### **2. IMPLEMENTAR**
- [ ] Colocar imagem em `/public/`
- [ ] Atualizar `imageSrc` no componente
- [ ] Testar responsividade

### **3. PERSONALIZAR**
- [ ] Ajustar texto do banner
- [ ] Modificar cores (highlightColor)
- [ ] Atualizar links dos botões

## 💡 **DICAS IMPORTANTES**

### **🎯 PARA MELHOR CONVERSÃO**
- **Rosto visível**: Modelo olhando para a câmera
- **Produto destacado**: Roupas em primeiro plano
- **Emoção positiva**: Expressão feliz e confiante
- **Call-to-action**: Elementos que direcionam o olhar

### **📱 PARA MOBILE**
- **Texto legível**: Evitar textos pequenos
- **Elementos grandes**: Botões e ícones bem visíveis
- **Navegação simples**: Gestos intuitivos
- **Carregamento rápido**: Imagens otimizadas

### **💻 PARA DESKTOP**
- **Detalhes visíveis**: Imagens de alta resolução
- **Hover effects**: Interações sutis
- **Layout equilibrado**: Espaçamento harmonioso
- **Hierarquia visual**: Foco no conteúdo principal

---

**🎨 Crie sua imagem seguindo estas especificações para um banner perfeito e responsivo!**
