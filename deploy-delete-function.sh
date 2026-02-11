#!/bin/bash

# Script para fazer deploy da função de exclusão de dados
# Execute este script da raiz do projeto

echo "🚀 Iniciando deploy da função delete-user-data..."

# Verificar se o Supabase CLI está instalado
if ! command -v supabase &> /dev/null
then
    echo "❌ Supabase CLI não encontrado. Instalando..."
    npm install -g supabase
fi

# Fazer login no Supabase (se necessário)
echo "📝 Verificando autenticação..."
supabase login

# Deploy da função
echo "📦 Fazendo deploy da função..."
supabase functions deploy delete-user-data

echo "✅ Deploy concluído!"
echo ""
echo "⚠️  IMPORTANTE: Verifique se as seguintes variáveis de ambiente estão configuradas no dashboard do Supabase:"
echo "   - PLUGGY_CLIENT_ID"
echo "   - PLUGGY_CLIENT_SECRET"
echo "   - SUPABASE_URL"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "📚 Para mais informações, consulte:"
echo "   - supabase/functions/delete-user-data/README.md"
echo "   - IMPLEMENTACAO_EXCLUSAO_DADOS.md"
