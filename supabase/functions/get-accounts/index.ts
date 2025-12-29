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
        // Get authorization header
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: "Missing authorization header" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Initialize Supabase client with user's token
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } },
        });

        // Get user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return new Response(
                JSON.stringify({ error: "Unauthorized" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Fetch all accounts for this user (through connections via RLS)
        const { data: accounts, error: accountsError } = await supabase
            .from("accounts")
            .select(`
        id,
        name,
        type,
        balance,
        currency,
        connection:connections!inner(
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

        // Calculate total balance
        const totalBalance = (accounts || []).reduce((sum, acc) => {
            // Credit accounts typically show negative balances as debt
            const balance = acc.type === "CREDIT" ? -Math.abs(acc.balance) : acc.balance;
            return sum + balance;
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
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
