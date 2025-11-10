# Personalizar Emails do Supabase

O Supabase permite personalizar os templates de email enviados para autenticação (confirmação de email, recuperação de senha, etc.).

## Como Personalizar os Emails

### 1. Acessar as Configurações de Email

1. Acesse o painel do Supabase: [https://app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto
3. Vá para **Authentication** > **Email Templates** (no menu lateral)

### 2. Templates Disponíveis

O Supabase oferece os seguintes templates que podem ser personalizados:

- **Confirm signup** - Email de confirmação de cadastro
- **Magic Link** - Link mágico para login
- **Change Email Address** - Mudança de email
- **Reset Password** - Recuperação de senha (este é o que você precisa!)
- **Invite user** - Convite para usuário

### 3. Personalizar o Template de Recuperação de Senha

1. Clique em **Reset Password**
2. Você verá um editor com HTML e variáveis disponíveis
3. Personalize o conteúdo do email usando:

#### Variáveis Disponíveis:
- `{{ .ConfirmationURL }}` - Link para redefinir a senha
- `{{ .Email }}` - Email do usuário
- `{{ .Token }}` - Token de confirmação (geralmente não usado no HTML)
- `{{ .TokenHash }}` - Hash do token
- `{{ .RedirectTo }}` - URL de redirecionamento após redefinir a senha

#### Exemplo de Template Personalizado:

```html
<h2>Recuperação de Senha - Alfa Jóias</h2>

<p>Olá,</p>

<p>Recebemos uma solicitação para redefinir a senha da sua conta na Alfa Jóias.</p>

<p>Clique no link abaixo para criar uma nova senha:</p>

<p>
  <a href="{{ .ConfirmationURL }}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
    Redefinir Senha
  </a>
</p>

<p>Ou copie e cole este link no seu navegador:</p>
<p>{{ .ConfirmationURL }}</p>

<p><strong>Este link expira em 1 hora.</strong></p>

<p>Se você não solicitou a redefinição de senha, ignore este email.</p>

<p>Atenciosamente,<br>
Equipe Alfa Jóias</p>

<hr>
<p style="color: #666; font-size: 12px;">
  Este é um email automático, por favor não responda.
</p>
```

### 4. Personalizar Outros Templates

Você pode personalizar todos os outros templates da mesma forma:

#### Confirm Signup (Confirmação de Cadastro):

```html
<h2>Bem-vindo à Alfa Jóias!</h2>

<p>Olá,</p>

<p>Obrigado por se cadastrar na Alfa Jóias!</p>

<p>Por favor, confirme seu email clicando no link abaixo:</p>

<p>
  <a href="{{ .ConfirmationURL }}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
    Confirmar Email
  </a>
</p>

<p>Atenciosamente,<br>
Equipe Alfa Jóias</p>
```

### 5. Adicionar Estilo CSS

Você pode adicionar estilos CSS inline ou usar uma tag `<style>`:

```html
<style>
  .email-container {
    max-width: 600px;
    margin: 0 auto;
    font-family: Arial, sans-serif;
  }
  .button {
    background-color: #2563eb;
    color: white;
    padding: 12px 24px;
    text-decoration: none;
    border-radius: 5px;
    display: inline-block;
    margin: 20px 0;
  }
</style>

<div class="email-container">
  <h2>Recuperação de Senha - Alfa Jóias</h2>
  <p>...</p>
  <a href="{{ .ConfirmationURL }}" class="button">Redefinir Senha</a>
</div>
```

### 6. Usar Imagens

Você pode incluir imagens usando URLs absolutas:

```html
<img src="https://seu-dominio.com/logo.png" alt="Alfa Jóias" style="max-width: 200px;">
```

### 7. Testar os Emails

Após personalizar, você pode testar os emails:

1. Use a função "Send test email" no painel do Supabase
2. Ou faça uma solicitação real de recuperação de senha
3. Verifique se o email chega com o novo formato

### 8. Limitações

- Os emails são enviados através do serviço de email do Supabase
- Você não pode alterar o remetente (sender) no plano gratuito
- No plano pago, é possível configurar um domínio de email personalizado
- O template suporta HTML, mas evite JavaScript (não será executado)

### 9. Dicas

- Use cores da sua marca
- Mantenha o design simples e responsivo
- Inclua informações de contato
- Teste em diferentes clientes de email (Gmail, Outlook, etc.)
- Sempre inclua um link de fallback caso o botão não funcione

### 10. Reverter para o Padrão

Se precisar reverter para o template padrão do Supabase, clique em **Reset to default**.

## Próximos Passos

Após personalizar os emails:

1. Salve as alterações
2. Teste enviando um email real
3. Verifique se os links funcionam corretamente
4. Ajuste conforme necessário

---

**Nota:** As alterações nos templates de email são aplicadas imediatamente. Não é necessário fazer deploy ou reiniciar o servidor.

