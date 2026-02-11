# Implementação de Exclusão de Dados do Usuário

## Visão Geral
Esta implementação permite que os usuários excluam permanentemente todos os seus dados financeiros consentidos, atendendo aos requisitos de LGPD/GDPR e boas práticas de privacidade. O recurso está disponível tanto na versão Mobile quanto na versão Desktop/Web.

A exclusão abrange:
- Desconexão e exclusão de todos os itens (bancos) conectados via Pluggy API.
- Exclusão de todos os dados financeiros do banco de dados Supabase (contas, transações, saldos, etc.) via *Cascade Delete*.

## Arquivos Criados/Modificados

### 1. Edge Function - Supabase (Backend)
**Arquivo**: `supabase/functions/delete-user-data/index.ts`
- **Função**: Gerencia a exclusão segura e completa dos dados.
- **Melhorias**:
    - Validação robusta de tokens de autenticação (JWT).
    - Verificação explícita de variáveis de ambiente (`PLUGGY_CLIENT_ID`, `PLUGGY_CLIENT_SECRET`).
    - Logs detalhados para debugging no Dashboard do Supabase.
    - Retorno de erros estruturados para o frontend.
    - Continuidade da operação: tenta excluir do Supabase mesmo se a API da Pluggy falhar.

### 2. Frontend - Mobile (React Native)
**Arquivo**: `screens/MoreScreen.tsx`
- Adicionada seção "DADOS E PRIVACIDADE" na aba de Ajustes.
- Exibe contador de bancos conectados.
- Botão "Excluir Todos os Dados" com estilo de alerta (vermelho).
- Modal de confirmação nativo exigindo a digitação da palavra "EXCLUIR" (ou "DELETE").
- Feedback visual de carregamento e sucesso/erro via `Alert`.

### 3. Frontend - Desktop/Web (React DOM)
**Arquivo**: `screens/SettingsScreen.web.tsx`
- Interface adaptada para desktop com *Glassmorphism*.
- Nova seção "Data & Privacy" integrada ao layout.
- Cards visuais para bancos conectados e ação de exclusão.
- Modal web (backdrop blur) para confirmação de segurança.

**Arquivo**: `screens/BanksScreen.web.tsx`
- Implementação da funcionalidade de **Conectar Nova Conta** no Desktop.
- Modal com `PluggyConnect` integrado para permitir reconexão após exclusão.
- Feedback visual de status da conexão.

### 4. Hook Personalizado
**Arquivo**: `hooks/useDeleteUserData.ts`
- Hook centralizado para gerenciar a chamada à Edge Function.
- Trata estados de `loading`, `error` e `success`.

### 5. Traduções (i18n)
**Arquivos**: `i18n/locales/pt.json`, `i18n/locales/en.json`
- Adicionadas todas as strings necessárias para modal, botões, títulos e mensagens de erro/sucesso.

## Fluxo de Usuário

1.  **Acesso**: O usuário acessa **Configurações > Preferências** (Desktop) ou **Mais > Configurações** (Mobile).
2.  **Visualização**: Vê a seção de Privacidade com o número de bancos conectados.
3.  **Ação**: Clica em "Excluir Todos os Dados".
4.  **Segurança**:
    - Um modal explica as consequências (irreversibilidade).
    - O usuário deve digitar "EXCLUIR" para habilitar o botão de confirmação.
5.  **Processamento**:
    - O app chama a Edge Function `delete-user-data`.
    - A função valida o usuário e remove os dados no Pluggy e Supabase.
6.  **Conclusão**:
    - **Sucesso**: Mensagem de confirmação e atualização da tela (zero bancos).
    - **Erro**: Mensagem detalhada com a causa do erro (ex: falha na API, credenciais inválidas).
7.  **Reconexão (Opcional)**:
    - O usuário pode ir à tela "Bancos" e usar o botão "Conectar Nova Conta" para reiniciar o processo do zero.

## Guia de Deploy e Configuração

### 1. Variáveis de Ambiente (Obrigatório)
Para que a exclusão funcione, as seguintes variáveis **DEVEM** ser configuradas nos *Secrets* da Edge Function no Dashboard do Supabase:

```bash
npx supabase secrets set PLUGGY_CLIENT_ID="seu_client_id"
npx supabase secrets set PLUGGY_CLIENT_SECRET="seu_client_secret"
# SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY geralmente são injetados automaticamente, mas verifique se necessário.
```

### 2. Deploy da Função
Se houver atualizações na função, faça o deploy novamente:

```bash
npx supabase functions deploy delete-user-data --no-verify-jwt
```
*(Nota: A flag `--no-verify-jwt` é usada porque nós fazemos a verificação manual do token JWT dentro da função para maior controle e segurança).*

## Solução de Problemas Comuns

-   **Erro "Pluggy credentials not configured"**: Você esqueceu de definir os Secrets no Supabase. Rode o comando de secrets acima.
-   **Erro "Unauthorized"**: O token do usuário expirou ou não foi enviado corretamente. O usuário deve fazer logout e login novamente.
-   **Botão "Conectar" não funciona no Desktop**: Certifique-se de estar usando a versão mais recente do arquivo `screens/BanksScreen.web.tsx` que contém o modal de conexão.

## Considerações de Segurança

-   **Autenticação Obrigatória**: A função rejeita qualquer requisição sem um Header `Authorization` válido de um usuário logado.
-   **Isolamento**: A função opera apenas nos dados do `user_id` extraído do token JWT.
-   **Confirmação Ativa**: A exigência de digitação previne cliques acidentais.
