import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PluggyWebhookPayload {
    event: string;
    eventId: string;
    itemId?: string;
    transactionIds?: string[];
    createdTransactionsLink?: string;
    clientId: string;
    clientUserId?: string;
    triggeredBy?: string;
    error?: {
        code: string;
        message: string;
    };
}

interface PluggyTransaction {
    id: string;
    description: string;
    descriptionRaw: string;
    currencyCode: string;
    amount: number;
    amountInAccountCurrency: number;
    date: string;
    balance: number;
    category: {
        id: string;
        description: string;
        descriptionTranslated: string;
    } | null;
    accountId: string;
    providerCode: string;
    status: string;
    paymentData: Record<string, unknown> | null;
    type: string;
    merchant?: {
        name: string;
        businessName: string;
        cnpj: string;
        category: string;
    };
}

interface PluggyAccount {
    id: string;
    itemId: string;
    type: string;
    subtype: string;
    number: string;
    name: string;
    balance: number;
    currencyCode: string;
    bankData?: Record<string, unknown>;
    creditData?: Record<string, unknown>;
}

async function getPluggyApiKey(): Promise<string> {
    const PLUGGY_CLIENT_ID = Deno.env.get("PLUGGY_CLIENT_ID");
    const PLUGGY_CLIENT_SECRET = Deno.env.get("PLUGGY_CLIENT_SECRET");

    if (!PLUGGY_CLIENT_ID || !PLUGGY_CLIENT_SECRET) {
        throw new Error("Missing Pluggy credentials");
    }

    const authResponse = await fetch("https://api.pluggy.ai/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            clientId: PLUGGY_CLIENT_ID,
            clientSecret: PLUGGY_CLIENT_SECRET,
        }),
    });

    if (!authResponse.ok) {
        throw new Error("Pluggy authentication failed");
    }

    const authData = await authResponse.json();
    return authData.apiKey;
}

async function fetchPluggyItem(apiKey: string, itemId: string) {
    const response = await fetch(`https://api.pluggy.ai/items/${itemId}`, {
        headers: { "X-API-KEY": apiKey },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch item: ${response.status}`);
    }

    return response.json();
}

async function fetchPluggyAccounts(apiKey: string, itemId: string): Promise<PluggyAccount[]> {
    const response = await fetch(`https://api.pluggy.ai/accounts?itemId=${itemId}`, {
        headers: { "X-API-KEY": apiKey },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch accounts: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
}

async function fetchAllTransactions(apiKey: string, accountId: string): Promise<PluggyTransaction[]> {
    const allTransactions: PluggyTransaction[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
        const response = await fetch(
            `https://api.pluggy.ai/transactions?accountId=${accountId}&page=${page}&pageSize=100`,
            { headers: { "X-API-KEY": apiKey } }
        );

        if (!response.ok) {
            console.error(`Failed to fetch transactions page ${page}`);
            break;
        }

        const data = await response.json();
        const transactions = data.results || [];
        allTransactions.push(...transactions);

        // Check if there are more pages
        hasMore = transactions.length === 100;
        page++;
    }

    return allTransactions;
}

serve(async (req) => {
    // Handle CORS
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    // Must respond quickly to Pluggy (< 5 seconds)
    const startTime = Date.now();

    try {
        const payload = (await req.json()) as PluggyWebhookPayload;
        console.log("Received webhook:", payload.event, payload.itemId);

        // Initialize Supabase with service role
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Handle different event types
        switch (payload.event) {
            case "item/created":
            case "item/updated": {
                if (!payload.itemId) {
                    console.error("No itemId in payload");
                    break;
                }

                const apiKey = await getPluggyApiKey();

                // Fetch item details
                const item = await fetchPluggyItem(apiKey, payload.itemId);
                console.log("Item status:", item.status);

                // Check if connection exists (app should create it first with real user_id)
                let { data: connection } = await supabase
                    .from("connections")
                    .select("id, user_id")
                    .eq("pluggy_item_id", payload.itemId)
                    .single();

                // If connection doesn't exist, wait and retry (app creates it on success)
                if (!connection) {
                    console.log("Connection not found, waiting for app to create it...");

                    // Wait up to 10 seconds for app to create connection
                    for (let retry = 0; retry < 10; retry++) {
                        await new Promise(resolve => setTimeout(resolve, 1000));

                        const { data: retryConnection } = await supabase
                            .from("connections")
                            .select("id, user_id")
                            .eq("pluggy_item_id", payload.itemId)
                            .single();

                        if (retryConnection) {
                            connection = retryConnection;
                            console.log("Connection found after", retry + 1, "retries");
                            break;
                        }
                    }

                    // If still not found, skip this webhook (will be processed on next update)
                    if (!connection) {
                        console.log("Connection still not found after retries, skipping...");
                        break;
                    }
                } else {
                    // Update existing connection status
                    const { error: connError } = await supabase
                        .from("connections")
                        .update({
                            status: item.status === "UPDATED" ? "UPDATED" : item.status,
                            last_synced_at: new Date().toISOString(),
                            connector_name: item.connector?.name || null,
                        })
                        .eq("pluggy_item_id", payload.itemId);

                    if (connError) {
                        console.error("Error updating connection:", connError);
                    }
                }

                // Fetch and save accounts
                const accounts = await fetchPluggyAccounts(apiKey, payload.itemId);
                console.log(`Found ${accounts.length} accounts`);

                // Upsert accounts
                for (const account of accounts) {
                    // Map Pluggy account type to our ENUM
                    let accountType: "BANK" | "CREDIT" | "INVESTMENT" = "BANK";
                    if (account.type === "CREDIT") accountType = "CREDIT";
                    else if (account.type === "INVESTMENT") accountType = "INVESTMENT";

                    const { error: accError } = await supabase
                        .from("accounts")
                        .upsert({
                            connection_id: connection.id,
                            pluggy_account_id: account.id,
                            name: account.name,
                            type: accountType,
                            balance: account.balance,
                            currency: account.currencyCode,
                        }, { onConflict: "pluggy_account_id" });

                    if (accError) {
                        console.error("Error upserting account:", accError);
                    }

                    // Fetch and upsert transactions for each account
                    const transactions = await fetchAllTransactions(apiKey, account.id);
                    console.log(`Found ${transactions.length} transactions for account ${account.name}`);

                    // Get account ID from our DB
                    const { data: dbAccount } = await supabase
                        .from("accounts")
                        .select("id")
                        .eq("pluggy_account_id", account.id)
                        .single();

                    if (!dbAccount) continue;

                    // Fetch all valid category IDs first to prevent FK errors
                    const { data: validCategories } = await supabase
                        .from("categories")
                        .select("id");

                    const validCategoryIds = new Set(validCategories?.map(c => c.id) || []);

                    // Batch upsert transactions (without description_raw, with category_id)
                    const transactionRecords = transactions.map((t) => {
                        // Validate category ID
                        let categoryId = t.category?.id || null;
                        if (categoryId && !validCategoryIds.has(categoryId)) {
                            console.warn(`Category ID ${categoryId} not found in DB, setting to null`);
                            categoryId = null; // Or '99' for Others if strictly required, but Schema allows null
                        }

                        return {
                            account_id: dbAccount.id,
                            pluggy_transaction_id: t.id,
                            date: t.date.split("T")[0],
                            amount: t.amount,
                            description: t.description,
                            type: t.type === "DEBIT" ? "DEBIT" : "CREDIT",
                            category_id: categoryId,
                            merchant_name: t.merchant?.name || null,
                            payment_data: t.paymentData,
                            metadata: {
                                providerCode: t.providerCode,
                                status: t.status,
                                currencyCode: t.currencyCode,
                                descriptionRaw: t.descriptionRaw, // Store raw description in metadata
                            },
                        };
                    });

                    // Upsert in batches of 100
                    for (let i = 0; i < transactionRecords.length; i += 100) {
                        const batch = transactionRecords.slice(i, i + 100);
                        const { error: txError } = await supabase
                            .from("transactions")
                            .upsert(batch, { onConflict: "pluggy_transaction_id" });

                        if (txError) {
                            console.error("Error upserting transactions batch:", txError);
                        }
                    }
                }

                break;
            }

            case "transactions/created": {
                // Similar to item/updated but only for new transactions
                console.log("New transactions created, will be handled by item/updated");
                break;
            }

            case "item/error": {
                if (payload.itemId) {
                    const { error } = await supabase
                        .from("connections")
                        .update({ status: "ERROR" })
                        .eq("pluggy_item_id", payload.itemId);

                    if (error) {
                        console.error("Error updating connection status:", error);
                    }
                }
                break;
            }

            case "item/deleted": {
                // The cascade delete in our schema will handle this
                if (payload.itemId) {
                    const { error } = await supabase
                        .from("connections")
                        .delete()
                        .eq("pluggy_item_id", payload.itemId);

                    if (error) {
                        console.error("Error deleting connection:", error);
                    }
                }
                break;
            }

            default:
                console.log("Unhandled event type:", payload.event);
        }

        const elapsed = Date.now() - startTime;
        console.log(`Webhook processed in ${elapsed}ms`);

        // Always return 200 quickly to Pluggy
        return new Response(
            JSON.stringify({ success: true }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Webhook error:", error);

        // Still return 200 to prevent retries if we've done some processing
        return new Response(
            JSON.stringify({ success: true, error: error.message }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
