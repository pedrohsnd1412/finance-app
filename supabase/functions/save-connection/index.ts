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

        // Trigger immediate sync
        try {
            console.log("Triggering immediate sync for connection:", connection.id);
            const clientId = Deno.env.get("PLUGGY_CLIENT_ID");
            const clientSecret = Deno.env.get("PLUGGY_CLIENT_SECRET");
            const authResponse = await fetch("https://api.pluggy.ai/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clientId, clientSecret }),
            });
            const { apiKey } = await authResponse.json();

            // 1. Sync Accounts
            const accRes = await fetch(`https://api.pluggy.ai/accounts?itemId=${item_id}`, {
                headers: { "X-API-KEY": apiKey }
            });
            const { results: accounts } = await accRes.json();

            for (const acc of accounts) {
                let type: "BANK" | "CREDIT" | "INVESTMENT" = "BANK";
                if (acc.type.includes('CREDIT')) type = "CREDIT";
                else if (acc.type.includes('INVESTMENT')) type = "INVESTMENT";

                const { data: dbAcc } = await supabase.from("accounts").upsert({
                    connection_id: connection.id,
                    pluggy_account_id: acc.id,
                    name: acc.name,
                    type,
                    balance: acc.balance,
                    currency: acc.currencyCode
                }, { onConflict: "pluggy_account_id" }).select("id").single();

                if (dbAcc) {
                    // 2. Sync Transactions
                    const txRes = await fetch(`https://api.pluggy.ai/transactions?accountId=${acc.id}&pageSize=500`, {
                        headers: { "X-API-KEY": apiKey }
                    });
                    const { results: transactions } = await txRes.json();

                    const txBatch = transactions.map((tx: any) => ({
                        account_id: dbAcc.id,
                        pluggy_transaction_id: tx.id,
                        date: tx.date.split('T')[0],
                        amount: tx.amount,
                        description: tx.description,
                        category_id: tx.categoryId,
                        type: tx.amount < 0 ? 'DEBIT' : 'CREDIT',
                        merchant_name: tx.merchant?.name || null
                    }));

                    if (txBatch.length > 0) {
                        await supabase.from("transactions").upsert(txBatch, { onConflict: "pluggy_transaction_id" });
                    }
                }
            }
            console.log("Immediate sync finished successfully");
        } catch (syncError) {
            console.error("Immediate sync error (non-fatal):", syncError);
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
