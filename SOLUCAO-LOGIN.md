# 🔐 Solução para Erro de Login

## ❌ **Problema Identificado:**
- **Erro:** "Email ou senha incorretos"
- **Causa:** "Email not confirmed" - usuário precisa confirmar email antes de fazer login

## ✅ **Solução Rápida:**

### **1. Configurar Supabase (Manual)**
1. Acesse: https://supabase.com/dashboard/project/ljfxpzcdrctqmfydofdh/auth/settings
2. **Desative "Enable email confirmations"** ✅
3. **Ative "Enable sign up"** ✅
4. Configure "Site URL" como: `http://localhost:3000`
5. **Salve as configurações**

### **2. Testar Login**
1. Acesse: http://localhost:3000/login
2. Clique em "Criar conta"
3. Use um email real (gmail, hotmail, etc.)
4. Faça login imediatamente após criar a conta

## 🔧 **Comandos para Testar:**

```bash
# Testar autenticação
node scripts/test-login-no-confirm.js

# Verificar usuários
node scripts/check-users.js

# Configurar via CLI (se disponível)
node scripts/configure-auth.js
```

## 📋 **Configurações Recomendadas:**

### **Para Desenvolvimento:**
- ✅ Enable sign up: **ON**
- ❌ Enable email confirmations: **OFF**
- ✅ Enable phone confirmations: **OFF**
- ✅ Enable manual linking: **OFF**

### **Para Produção:**
- ✅ Enable sign up: **ON**
- ✅ Enable email confirmations: **ON** (com SMTP configurado)
- ✅ Configure SMTP para envio de emails

## 🎯 **Resultado Esperado:**
- ✅ Usuário pode criar conta
- ✅ Login funciona imediatamente
- ✅ Lead e Customer são criados automaticamente
- ✅ Sistema de CRM funcionando

## 🚀 **Site Funcionando:**
- **URL:** http://localhost:3000
- **Login:** http://localhost:3000/login
- **Perfil:** http://localhost:3000/perfil (após login)

---

**⚠️ IMPORTANTE:** Após configurar, teste novamente o login no site!
