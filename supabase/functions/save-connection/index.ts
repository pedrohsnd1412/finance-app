import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SaveConnectionRequest {
    item_id: string;
    connector_name?: string;
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // Get authorization header
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: "Missing authorization header" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const { item_id, connector_name } = (await req.json()) as SaveConnectionRequest;

        if (!item_id) {
            return new Response(
                JSON.stringify({ error: "item_id is required" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Initialize Supabase with service role to bypass RLS for insert
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Also create auth client to get user ID
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
        const authClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } },
        });

        // Get user
        const { data: { user }, error: userError } = await authClient.auth.getUser();
        if (userError || !user) {
            return new Response(
                JSON.stringify({ error: "Unauthorized" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Ensure user exists in our users table
        const { error: upsertUserError } = await supabase
            .from("users")
            .upsert({
                id: user.id,
                email: user.email || "",
            }, { onConflict: "id" });

        if (upsertUserError) {
            console.error("Error upserting user:", upsertUserError);
        }

        // Insert connection
        const { data: connection, error: connError } = await supabase
            .from("connections")
            .upsert({
                user_id: user.id,
                pluggy_item_id: item_id,
                connector_name: connector_name || null,
                status: "PENDING",
            }, { onConflict: "pluggy_item_id" })
            .select()
            .single();

        if (connError) {
            console.error("Error saving connection:", connError);
            throw connError;
        }

        return new Response(
            JSON.stringify({
                success: true,
                connection,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
