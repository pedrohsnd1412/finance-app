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
        const body = await req.json();
        const { event, itemId } = body;

        console.log(`Received Pluggy Webhook: ${event} for Item: ${itemId}`);

        if (!itemId) {
            return new Response(JSON.stringify({ message: "No itemId provided" }), { headers: corsHeaders, status: 200 });
        }

        // Initialize Supabase Admin Client (Service Role)
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        // Initialize Pluggy Client
        const pluggyClientId = Deno.env.get("PLUGGY_CLIENT_ID");
        const pluggyClientSecret = Deno.env.get("PLUGGY_CLIENT_SECRET");

        if (!pluggyClientId || !pluggyClientSecret) {
            throw new Error("Missing Pluggy credentials");
        }

        const pluggy = new PluggyClient({
            clientId: pluggyClientId,
            clientSecret: pluggyClientSecret,
        });

        // Handle Relevant Events
        // We sync on CREATED (initial fetch), UPDATED (refresh), and TRANSACTIONS_SUCCESS (new transactions)
        const SYNC_EVENTS = ["ITEM_CREATED", "ITEM_UPDATED", "TRANSACTIONS_SUCCESS", "ITEM_LOGIN_SUCCEEDED"];

        if (SYNC_EVENTS.includes(event)) {
            await syncAccountData(pluggy, supabase, itemId);
        }

        return new Response(
            JSON.stringify({ received: true }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Webhook Error:", error);
        // Return 200 even on error to avoid Pluggy retrying indefinitely if it's a logic error,
        // but typically we might want 500 for transient. For now, we log and return 200 or 500.
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});

async function syncAccountData(pluggy: any, supabase: any, itemId: string) {
    console.log(`Syncing data for Item ${itemId}...`);

    // 1. Fetch Item Details to get User linkage or verify status
    const item = await pluggy.fetchItem(itemId);

    // Check if we already have this item to get the user_id, OR if the item has clientUserId
    let userId = item.clientUserId;

    if (!userId) {
        // Fallback: Check DB
        const { data: dbItem } = await supabase
            .from('connection_items')
            .select('user_id')
            .eq('pluggy_item_id', itemId)
            .single();

        if (dbItem) {
            userId = dbItem.user_id;
        } else {
            console.warn(`Item ${itemId} has no linked User ID. Skipping sync.`);
            return;
        }
    }

    // 2. Upsert Item
    const { error: itemError } = await supabase
        .from('connection_items')
        .upsert({
            user_id: userId,
            pluggy_item_id: item.id,
            connector_id: item.connector.id.toString(),
            connector_name: item.connector.name,
            status: item.status,
            last_updated_at: item.lastUpdatedAt || new Date().toISOString(),
            error_message: item.error ? item.error.message : null
        }, { onConflict: 'pluggy_item_id' });

    if (itemError) throw itemError;

    // 3. Fetch Accounts
    const { results: accounts } = await pluggy.fetchAccounts(itemId);

    // Get DB ID of the connection item
    const { data: connectionItem } = await supabase
        .from('connection_items')
        .select('id')
        .eq('pluggy_item_id', itemId)
        .single();

    if (!connectionItem) throw new Error("Connection Item not found after upsert");
    const connectionItemId = connectionItem.id;

    for (const acc of accounts) {
        // Upsert Account
        const { data: savedAccount, error: accError } = await supabase
            .from('accounts')
            .upsert({
                connection_item_id: connectionItemId,
                pluggy_account_id: acc.id,
                name: acc.name,
                number: acc.number,
                balance: acc.balance,
                currency: acc.currencyCode,
                type: acc.type,
                subtype: acc.subtype,
            }, { onConflict: 'pluggy_account_id' })
            .select('id')
            .single();

        if (accError) {
            console.error(`Error syncing account ${acc.id}:`, accError);
            continue;
        }

        // 4. Fetch Transactions for this Account
        // We fetch last 30 days or based on last sync? For simplicity, we fetch recent.
        // Pluggy default is usually 30 days if not specified, or we can specify from/to.
        // Let's fetch last 90 days to be safe for initial sync.
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 90);
        const fromString = fromDate.toISOString().split('T')[0];

        const { results: transactions } = await pluggy.fetchTransactions(acc.id, { from: fromString });

        if (transactions.length > 0) {
            const transactionsData = transactions.map((tx: any) => ({
                account_id: savedAccount.id,
                pluggy_transaction_id: tx.id,
                description: tx.description,
                amount: tx.amount,
                date: tx.date,
                category: tx.category,
                status: tx.status,
                type: tx.amount < 0 ? 'DEBIT' : 'CREDIT' // Pluggy amount is usually negative for debits? Need to verify. 
                // Actually Pluggy docs say: "Amount of the transaction. ... Expenses are negative."
                // My schema has type column. I'll infer it.
            }));

            const { error: txError } = await supabase
                .from('transactions')
                .upsert(transactionsData, { onConflict: 'pluggy_transaction_id' });

            if (txError) console.error(`Error syncing transactions for account ${acc.id}:`, txError);
        }
    }

    console.log(`Sync completed for Item ${itemId}`);
}
