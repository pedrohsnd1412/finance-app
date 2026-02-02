import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PluggyWebhookPayload {
    event: string;
    itemId: string;
    clientUserId?: string;
}

const getPluggyApiKey = async () => {
    const clientId = Deno.env.get("PLUGGY_CLIENT_ID");
    const clientSecret = Deno.env.get("PLUGGY_CLIENT_SECRET");
    const response = await fetch("https://api.pluggy.ai/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, clientSecret }),
    });
    const data = await response.json();
    return data.apiKey;
};

const mapStatus = (status: string): string => {
    const map: Record<string, string> = {
        'UPDATED': 'UPDATED',
        'UPDATING': 'UPDATING',
        'LOGIN_IN_PROGRESS': 'PENDING',
        'WAITING_USER_INPUT': 'PENDING',
        'ERROR': 'ERROR',
        'LOGIN_ERROR': 'ERROR',
        'OUTDATED': 'UPDATING'
    };
    return map[status] || 'PENDING';
};

serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    try {
        const payload: PluggyWebhookPayload = await req.json();
        const { event, itemId, clientUserId } = payload;

        console.log(`[Webhook] Event Received: ${event} | ItemId: ${itemId} | ClientUserId: ${clientUserId}`);

        const syncEvents = ["item/created", "item/updated", "item/login_succeeded", "transactions/created"];

        if (!syncEvents.includes(event)) {
            console.log(`[Webhook] Event ${event} ignored.`);
            return new Response("Event ignored", { status: 200 });
        }

        const apiKey = await getPluggyApiKey();
        const pluggyItemRes = await fetch(`https://api.pluggy.ai/items/${itemId}`, {
            headers: { "X-API-KEY": apiKey }
        });

        if (!pluggyItemRes.ok) {
            console.error(`[Webhook] Failed to fetch item ${itemId} from Pluggy`);
            return new Response("Item not found in Pluggy", { status: 200 });
        }

        const pluggyItem = await pluggyItemRes.json();
        console.log(`[Webhook] Pluggy Item Status: ${pluggyItem.status}`);

        // 1. Find or Auto-create connection
        let { data: conn, error: findError } = await supabase
            .from("connections")
            .select("id, user_id")
            .eq("pluggy_item_id", itemId)
            .maybeSingle();

        if (findError) console.error(`[Webhook] DB Find Error: ${findError.message}`);

        if (!conn) {
            if (clientUserId) {
                console.log(`[Webhook] Connection missing in DB. Auto-creating for User: ${clientUserId}`);
                const { data: newConn, error: insertError } = await supabase
                    .from("connections")
                    .insert({
                        user_id: clientUserId,
                        pluggy_item_id: itemId,
                        connector_name: pluggyItem.connector?.name || "Banco",
                        status: mapStatus(pluggyItem.status),
                    })
                    .select("id, user_id")
                    .single();

                if (insertError) {
                    console.error(`[Webhook] DB Insert Error: ${insertError.message}`);
                    return new Response("DB Insert Failed", { status: 200 });
                }
                conn = newConn;
            } else {
                console.error(`[Webhook] ERROR: Connection not found in DB and NO clientUserId provided. Cannot proceed.`);
                return new Response("No context to save data", { status: 200 });
            }
        }

        // 2. Update connection status
        await supabase.from("connections").update({
            status: mapStatus(pluggyItem.status),
            last_synced_at: new Date().toISOString()
        }).eq("id", conn.id);

        // 3. Sync Accounts
        console.log(`[Webhook] Triggering Account/Transaction sync for Connection: ${conn.id}`);
        const accRes = await fetch(`https://api.pluggy.ai/accounts?itemId=${itemId}`, { headers: { "X-API-KEY": apiKey } });
        const { results: accounts } = await accRes.json();

        for (const acc of accounts) {
            let type: "BANK" | "CREDIT" | "INVESTMENT" = "BANK";
            if (acc.type.includes('CREDIT')) type = "CREDIT";
            else if (acc.type.includes('INVESTMENT')) type = "INVESTMENT";

            const { data: dbAcc } = await supabase.from("accounts").upsert({
                connection_id: conn.id,
                pluggy_account_id: acc.id,
                name: acc.name,
                type,
                balance: acc.balance,
                currency: acc.currencyCode
            }, { onConflict: "pluggy_account_id" }).select("id").single();

            if (dbAcc) {
                // 4. Sync Transactions
                const txRes = await fetch(`https://api.pluggy.ai/transactions?accountId=${acc.id}&pageSize=500`, { headers: { "X-API-KEY": apiKey } });
                const { results: transactions } = await txRes.json();

                console.log(`[Webhook] Saving ${transactions.length} transactions for account ${acc.name}`);

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
                    const { error: txUpsertError } = await supabase.from("transactions").upsert(txBatch, { onConflict: "pluggy_transaction_id" });
                    if (txUpsertError) console.error(`[Webhook] Transactions Upsert Error: ${txUpsertError.message}`);
                }
            }
        }

        console.log(`[Webhook] FINISHED SUCCESS for itemId: ${itemId}`);
        return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
    } catch (error) {
        console.error("[Webhook Fatal Error]", error.message);
        return new Response(JSON.stringify({ error: error.message }), { status: 200, headers: corsHeaders });
    }
});
