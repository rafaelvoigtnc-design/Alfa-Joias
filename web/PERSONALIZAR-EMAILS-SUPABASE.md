# 📧 Personalizar Emails do Supabase

## Como Personalizar os Emails de Recuperação de Senha

Os emails são enviados pelo Supabase e podem ser personalizados no painel de administração.

### 📝 Passo a Passo:

1. **Acesse o Painel do Supabase**
   - Vá para: https://app.supabase.com
   - Faça login na sua conta
   - Selecione seu projeto

2. **Navegue até Authentication → Email Templates**
   - No menu lateral, clique em **"Authentication"**
   - Depois clique em **"Email Templates"**

3. **Selecione o Template "Reset Password"**
   - Você verá vários templates de email
   - Clique em **"Reset Password"** (Recuperar Senha)

4. **Personalize o Email**

Substitua o conteúdo pelo template abaixo (em português):

```html
<h2>Recuperar Senha - Alfa Jóias</h2>

<p>Olá!</p>

<p>Você solicitou a recuperação de senha da sua conta na <strong>Alfa Jóias</strong>.</p>

<p>Clique no botão abaixo para definir uma nova senha:</p>

<p>
  <a href="{{ .ConfirmationURL }}" 
     style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
    Redefinir Senha
  </a>
</p>

<p style="color: #666; font-size: 14px;">
  Ou copie e cole este link no seu navegador:<br>
  {{ .ConfirmationURL }}
</p>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">

<p style="color: #666; font-size: 12px;">
  Se você não solicitou a recuperação de senha, ignore este email.<br>
  Este link expira em 1 hora.
</p>

<p style="color: #666; font-size: 12px;">
  <strong>Alfa Jóias</strong> - A Vitrine dos seus Olhos<br>
  Av. Santa Clara 137, Centro - Nova Candelária/RS<br>
  WhatsApp: (55) 9 9912-88464
</p>
```

5. **Salve as Alterações**
   - Clique em **"Save"** no final da página

---

## 🎨 Personalizar Outros Emails

### **Confirm Signup (Confirmar Cadastro)**

```html
<h2>Bem-vindo à Alfa Jóias! 🎉</h2>

<p>Olá!</p>

<p>Obrigado por criar uma conta na <strong>Alfa Jóias</strong>!</p>

<p>Confirme seu email clicando no botão abaixo:</p>

<p>
  <a href="{{ .ConfirmationURL }}" 
     style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
    Confirmar Email
  </a>
</p>

<p style="color: #666; font-size: 14px;">
  Ou copie e cole este link no seu navegador:<br>
  {{ .ConfirmationURL }}
</p>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">

<p style="color: #666; font-size: 12px;">
  <strong>Alfa Jóias</strong> - A Vitrine dos seus Olhos<br>
  Av. Santa Clara 137, Centro - Nova Candelária/RS<br>
  WhatsApp: (55) 9 9912-88464
</p>
```

### **Magic Link (Link Mágico)**

```html
<h2>Seu Link de Acesso - Alfa Jóias</h2>

<p>Olá!</p>

<p>Clique no botão abaixo para fazer login na <strong>Alfa Jóias</strong>:</p>

<p>
  <a href="{{ .ConfirmationURL }}" 
     style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
    Fazer Login
  </a>
</p>

<p style="color: #666; font-size: 14px;">
  Ou copie e cole este link no seu navegador:<br>
  {{ .ConfirmationURL }}
</p>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">

<p style="color: #666; font-size: 12px;">
  Este link expira em 1 hora e só pode ser usado uma vez.<br>
  Se você não solicitou este email, ignore-o com segurança.
</p>

<p style="color: #666; font-size: 12px;">
  <strong>Alfa Jóias</strong> - A Vitrine dos seus Olhos<br>
  Av. Santa Clara 137, Centro - Nova Candelária/RS<br>
  WhatsApp: (55) 9 9912-88464
</p>
```

### **Change Email Address (Mudar Email)**

```html
<h2>Confirmar Mudança de Email - Alfa Jóias</h2>

<p>Olá!</p>

<p>Você solicitou a alteração do email da sua conta na <strong>Alfa Jóias</strong>.</p>

<p>Clique no botão abaixo para confirmar a mudança:</p>

<p>
  <a href="{{ .ConfirmationURL }}" 
     style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
    Confirmar Novo Email
  </a>
</p>

<p style="color: #666; font-size: 14px;">
  Ou copie e cole este link no seu navegador:<br>
  {{ .ConfirmationURL }}
</p>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">

<p style="color: #666; font-size: 12px;">
  Se você não solicitou esta mudança, ignore este email e seu email permanecerá o mesmo.
</p>

<p style="color: #666; font-size: 12px;">
  <strong>Alfa Jóias</strong> - A Vitrine dos seus Olhos<br>
  Av. Santa Clara 137, Centro - Nova Candelária/RS<br>
  WhatsApp: (55) 9 9912-88464
</p>
```

---

## 🎨 Customização Avançada

### Adicionar Logo

Para adicionar o logo da Alfa Jóias no email:

```html
<div style="text-align: center; margin-bottom: 20px;">
  <img src="URL_DO_LOGO" alt="Alfa Jóias" style="max-width: 200px;">
</div>
```

Substitua `URL_DO_LOGO` pela URL pública do logo.

### Cores Personalizadas

- **Azul primário:** `#2563eb`
- **Verde (sucesso):** `#10b981`
- **Vermelho (erro):** `#ef4444`
- **Cinza escuro:** `#1f2937`

---

## 📝 Variáveis Disponíveis

As seguintes variáveis podem ser usadas nos templates:

- `{{ .ConfirmationURL }}` - URL de confirmação/ação
- `{{ .Token }}` - Token de autenticação
- `{{ .Email }}` - Email do usuário
- `{{ .SiteURL }}` - URL do seu site

---

## ✅ Checklist Final

- [ ] Personalizar template "Reset Password"
- [ ] Personalizar template "Confirm Signup"
- [ ] Personalizar template "Magic Link" (se usar)
- [ ] Personalizar template "Change Email"
- [ ] Testar enviando um email de recuperação
- [ ] Verificar se o link funciona corretamente

---

## 🆘 Problemas Comuns

### Email não chega
- Verifique a pasta de spam
- Aguarde alguns minutos (pode demorar até 5 minutos)
- Verifique se o email foi confirmado no Supabase

### Link dá erro 404
- ✅ **RESOLVIDO!** A página `/auth/reset-password` foi criada
- Certifique-se de que o servidor está rodando

### Email está em inglês
- Siga os passos acima para personalizar no painel do Supabase
- Aguarde alguns minutos para as mudanças propagarem

---

**Pronto!** Agora seus emails estarão personalizados e em português! 🎉










