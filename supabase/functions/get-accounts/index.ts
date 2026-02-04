import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: "Missing authorization header" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } },
        });

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return new Response(
                JSON.stringify({ error: "Unauthorized" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Fetch all accounts for this user (through connection_items via RLS)
        // We select connection:connection_items because the foreign key is connection_item_id
        const { data: accounts, error: accountsError } = await supabase
            .from("accounts")
            .select(`
        id,
        name,
        type,
        subtype,
        balance,
        currency,
        connection:connection_items!inner(
          id,
          user_id,
          connector_name,
          status
        )
      `)
            .eq("connection.user_id", user.id);

        if (accountsError) {
            console.error("Error fetching accounts:", accountsError);
            throw accountsError;
        }

        const totalBalance = (accounts || []).reduce((sum: number, acc: any) => {
            // Adjust balance logic if needed based on type
            return sum + (Number(acc.balance) || 0);
        }, 0);

        return new Response(
            JSON.stringify({
                total_balance: totalBalance,
                accounts: accounts || [],
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error:", error);
        return new Response(
            JSON.stringify({ error: (error as Error).message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
