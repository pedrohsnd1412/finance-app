import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { PluggyClient } from "npm:pluggy-sdk@0.41.0";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Initialize Supabase client
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Get user from auth header
        const authHeader = req.headers.get('Authorization')!;
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);

        if (userError || !user) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const userId = user.id;

        // Initialize Pluggy client
        const pluggyClientId = Deno.env.get("PLUGGY_CLIENT_ID");
        const pluggyClientSecret = Deno.env.get("PLUGGY_CLIENT_SECRET");

        if (!pluggyClientId || !pluggyClientSecret) {
            throw new Error("Pluggy credentials not configured");
        }

        const pluggy = new PluggyClient({
            clientId: pluggyClientId,
            clientSecret: pluggyClientSecret,
        });

        // 1. Get all connection items for this user
        const { data: connectionItems, error: fetchError } = await supabase
            .from('connection_items')
            .select('pluggy_item_id')
            .eq('user_id', userId);

        if (fetchError) {
            throw fetchError;
        }

        // 2. Delete each item from Pluggy
        const deletionResults = [];
        for (const item of connectionItems || []) {
            try {
                await pluggy.deleteItem(item.pluggy_item_id);
                deletionResults.push({
                    pluggy_item_id: item.pluggy_item_id,
                    status: 'deleted'
                });
            } catch (pluggyError: any) {
                console.error(`Error deleting Pluggy item ${item.pluggy_item_id}:`, pluggyError);
                // Continue even if Pluggy deletion fails (item might already be deleted)
                deletionResults.push({
                    pluggy_item_id: item.pluggy_item_id,
                    status: 'error',
                    error: pluggyError.message
                });
            }
        }

        // 3. Delete all data from Supabase (cascade will handle related tables)
        // Delete connection_items (this will cascade to accounts and transactions)
        const { error: deleteError } = await supabase
            .from('connection_items')
            .delete()
            .eq('user_id', userId);

        if (deleteError) {
            throw deleteError;
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: 'All data deleted successfully',
                pluggy_deletions: deletionResults,
                items_deleted: connectionItems?.length || 0
            }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );

    } catch (error: any) {
        console.error('Error in delete-user-data function:', error);
        return new Response(
            JSON.stringify({
                error: error.message || 'Internal server error',
                details: error.toString()
            }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );
    }
});
