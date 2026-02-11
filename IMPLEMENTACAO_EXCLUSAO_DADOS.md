# Implementação de Exclusão de Dados do Usuário

## Visão Geral
Esta implementação permite que os usuários excluam permanentemente todos os seus dados financeiros consentidos, incluindo:
- Desconexão de todas as contas bancárias conectadas via Pluggy
- Exclusão de todos os dados financeiros do Supabase (contas, transações, etc.)

## Arquivos Criados/Modificados

### 1. Edge Function - Supabase
**Arquivo**: `supabase/functions/delete-user-data/index.ts`
- Função serverless que gerencia a exclusão completa dos dados
- Desconecta itens do Pluggy via API
- Remove dados do banco de dados com cascade

### 2. Hook Personalizado
**Arquivo**: `hooks/useDeleteUserData.ts`
- Hook React para gerenciar o estado da exclusão
- Fornece loading states e tratamento de erros
- Interface simples para componentes

### 3. Tela de Configurações Atualizada
**Arquivo**: `screens/SettingsScreen.tsx`
- Nova seção "Dados e Privacidade"
- Exibição de bancos conectados
- Botão de exclusão com confirmação
- Modal de confirmação com validação de texto

### 4. Traduções
**Arquivos**: 
- `i18n/locales/pt.json`
- `i18n/locales/en.json`

Novas chaves adicionadas:
- `settings.dataPrivacy`
- `settings.deleteAllData`
- `settings.deleteDataDesc`
- `settings.deleteDataWarning`
- `settings.confirmDelete`
- `settings.confirmDeleteTitle`
- `settings.confirmDeleteMessage`
- `settings.typeDeleteToConfirm`
- `settings.deleting`
- `settings.dataDeleted`
- `settings.deleteError`
- `settings.connectedBanks`
- `settings.noBanksConnected`

## Fluxo de Exclusão

### 1. Usuário Inicia Exclusão
- Navega para Settings (Ajustes)
- Vê a seção "Dados e Privacidade"
- Clica em "Excluir Todos os Dados"

### 2. Modal de Confirmação
- Modal aparece com aviso claro
- Lista todos os bancos conectados
- Requer que o usuário digite "EXCLUIR" (ou "DELETE" em inglês)
- Botões de cancelar e confirmar

### 3. Processamento
- Hook `useDeleteUserData` invoca a edge function
- Edge function:
  1. Autentica o usuário
  2. Busca todos os connection_items do usuário
  3. Para cada item, chama Pluggy API para deletar
  4. Remove todos os connection_items do Supabase
  5. Cascade deleta accounts e transactions automaticamente

### 4. Feedback ao Usuário
- Loading indicator durante o processo
- Alert de sucesso ou erro
- Modal fecha automaticamente em caso de sucesso

## Segurança

### Autenticação
- Edge function valida o token de autenticação
- Apenas o próprio usuário pode deletar seus dados

### Row Level Security (RLS)
- Políticas RLS garantem isolamento de dados
- Usuário só pode deletar seus próprios registros

### Confirmação Dupla
- Modal de confirmação visual
- Validação de texto digitado ("EXCLUIR"/"DELETE")
- Previne exclusões acidentais

## Deploy da Edge Function

### Pré-requisitos
```bash
# Instalar Supabase CLI se necessário
npm install -g supabase

# Login no Supabase
supabase login
```

### Configurar Variáveis de Ambiente
No dashboard do Supabase, configure:
- `PLUGGY_CLIENT_ID`
- `PLUGGY_CLIENT_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Deploy
```bash
# Na raiz do projeto
cd /Users/eupedrohie/Library/Mobile\ Documents/com~apple~CloudDocs/finance-app/finance-app

# Deploy da função
supabase functions deploy delete-user-data
```

## Teste

### Teste Manual
1. Conecte uma conta bancária de teste
2. Vá para Settings
3. Verifique que o banco aparece na lista
4. Clique em "Excluir Todos os Dados"
5. Digite "EXCLUIR" no campo de confirmação
6. Confirme a exclusão
7. Verifique que os dados foram removidos

### Verificação no Banco de Dados
```sql
-- Verificar que não há mais dados do usuário
SELECT * FROM connection_items WHERE user_id = 'USER_ID';
SELECT * FROM accounts WHERE connection_item_id IN (
  SELECT id FROM connection_items WHERE user_id = 'USER_ID'
);
SELECT * FROM transactions WHERE account_id IN (
  SELECT id FROM accounts WHERE connection_item_id IN (
    SELECT id FROM connection_items WHERE user_id = 'USER_ID'
  )
);
```

## Considerações Importantes

### Irreversibilidade
- A exclusão é permanente e não pode ser desfeita
- Avisos claros são mostrados ao usuário
- Confirmação de texto previne ações acidentais

### Cascade Deletion
- O schema do banco usa `ON DELETE CASCADE`
- Quando um `connection_item` é deletado:
  - Todos os `accounts` relacionados são deletados
  - Todas as `transactions` relacionadas são deletadas
- Isso garante que não ficam dados órfãos

### Tratamento de Erros
- Se a API do Pluggy falhar, a função continua
- Dados são removidos do Supabase mesmo se Pluggy falhar
- Logs de erro são registrados para debugging

## Próximos Passos (Opcional)

### Melhorias Futuras
1. **Soft Delete**: Implementar exclusão suave com período de recuperação
2. **Export de Dados**: Permitir download dos dados antes da exclusão
3. **Logs de Auditoria**: Registrar exclusões para compliance
4. **Email de Confirmação**: Enviar email após exclusão bem-sucedida
5. **Exclusão Parcial**: Permitir deletar apenas bancos específicos

### Compliance LGPD/GDPR
Esta implementação atende aos requisitos de:
- ✅ Direito ao esquecimento
- ✅ Exclusão de dados sob demanda
- ✅ Transparência sobre dados armazenados
- ✅ Controle do usuário sobre seus dados

## Suporte

Para problemas ou dúvidas:
1. Verifique os logs da edge function no dashboard Supabase
2. Verifique os logs do console do navegador
3. Confirme que as variáveis de ambiente estão configuradas
4. Teste a conexão com a API do Pluggy separadamente
