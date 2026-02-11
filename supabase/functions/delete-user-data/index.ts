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
        // 1. Verify Authentication
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            console.error("Missing Authorization header");
            return new Response(
                JSON.stringify({ error: 'Missing Authorization header' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Initialize Supabase client
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!supabaseUrl || !supabaseKey) {
            console.error("Missing Supabase configuration");
            throw new Error("Internal Server Error: Missing Supabase configuration");
        }

        const supabase = createClient(supabaseUrl, supabaseKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);

        if (userError || !user) {
            console.error("Invalid user token:", userError);
            return new Response(
                JSON.stringify({ error: 'Unauthorized', details: userError?.message }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const userId = user.id;
        console.log(`Starting data deletion for user: ${userId}`);

        // 2. Initialize Pluggy client
        const pluggyClientId = Deno.env.get("PLUGGY_CLIENT_ID");
        const pluggyClientSecret = Deno.env.get("PLUGGY_CLIENT_SECRET");

        if (!pluggyClientId || !pluggyClientSecret) {
            console.error("Missing Pluggy credentials");
            throw new Error("Pluggy credentials not configured");
        }

        const pluggy = new PluggyClient({
            clientId: pluggyClientId,
            clientSecret: pluggyClientSecret,
        });

        // 3. Get all connection items for this user
        const { data: connectionItems, error: fetchError } = await supabase
            .from('connection_items')
            .select('pluggy_item_id')
            .eq('user_id', userId);

        if (fetchError) {
            console.error("Error fetching connection items:", fetchError);
            throw fetchError;
        }

        console.log(`Found ${connectionItems?.length || 0} connections to delete`);

        // 4. Delete each item from Pluggy
        const deletionResults = [];
        for (const item of connectionItems || []) {
            if (!item.pluggy_item_id) continue;

            try {
                // Check if item exists first? No, just try delete.
                await pluggy.deleteItem(item.pluggy_item_id);
                console.log(`Deleted Pluggy item: ${item.pluggy_item_id}`);
                deletionResults.push({
                    pluggy_item_id: item.pluggy_item_id,
                    status: 'deleted'
                });
            } catch (pluggyError: any) {
                console.error(`Error deleting Pluggy item ${item.pluggy_item_id}:`, pluggyError);
                // Continue even if Pluggy deletion fails
                deletionResults.push({
                    pluggy_item_id: item.pluggy_item_id,
                    status: 'error',
                    error: pluggyError.message || 'Unknown error'
                });
            }
        }

        // 5. Delete all data from Supabase
        // Cascading delete is dangerous if not configured right, but schema should handle it.
        // We delete from connection_items using Service Role.
        const { error: deleteError } = await supabase
            .from('connection_items')
            .delete()
            .eq('user_id', userId);

        if (deleteError) {
            console.error("Error deleting from Supabase:", deleteError);
            throw deleteError;
        }

        console.log("Supabase data deletion complete");

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
        console.error('CRITICAL ERROR in delete-user-data:', error);
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
