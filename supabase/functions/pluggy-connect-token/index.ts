import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PluggyClient } from "npm:pluggy-sdk@0.41.0";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // 1. Verify User Authentication
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            throw new Error("Missing authorization header");
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } },
        });

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            throw new Error("Unauthorized");
        }

        // 2. Initialize Pluggy Client
        const pluggyClientId = Deno.env.get("PLUGGY_CLIENT_ID");
        const pluggyClientSecret = Deno.env.get("PLUGGY_CLIENT_SECRET");

        if (!pluggyClientId || !pluggyClientSecret) {
            throw new Error("Missing Pluggy credentials in Edge Function Secrets");
        }

        const pluggy = new PluggyClient({
            clientId: pluggyClientId,
            clientSecret: pluggyClientSecret,
        });

        // 3. Create Connect Token
        // The first argument is itemId (optional, for updating connection). 
        // We pass undefined to create a NEW connection.
        // The second argument is the options object.
        const data = await pluggy.createConnectToken(undefined, {
            clientUserId: user.id
        });

        return new Response(
            JSON.stringify({ accessToken: data.accessToken }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Error creating connect token:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
