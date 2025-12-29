import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TransactionsParams {
    page?: number;
    per_page?: number;
    start_date?: string;
    end_date?: string;
    category_id?: string;
    type?: "DEBIT" | "CREDIT";
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

        // Parse query params
        const url = new URL(req.url);
        const params: TransactionsParams = {
            page: parseInt(url.searchParams.get("page") || "1"),
            per_page: parseInt(url.searchParams.get("per_page") || "20"),
            start_date: url.searchParams.get("start_date") || undefined,
            end_date: url.searchParams.get("end_date") || undefined,
            category_id: url.searchParams.get("category_id") || undefined,
            type: (url.searchParams.get("type") as "DEBIT" | "CREDIT") || undefined,
        };

        // Initialize Supabase client
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

        // Build query
        let query = supabase
            .from("transactions")
            .select(`
        *,
        category:categories(id, description, description_translated, icon, color),
        account:accounts!inner(
          id,
          name,
          connection:connections!inner(user_id)
        )
      `, { count: "exact" })
            .eq("account.connection.user_id", user.id)
            .order("date", { ascending: false });

        // Apply filters
        if (params.start_date) {
            query = query.gte("date", params.start_date);
        }
        if (params.end_date) {
            query = query.lte("date", params.end_date);
        }
        if (params.category_id) {
            query = query.eq("category_id", params.category_id);
        }
        if (params.type) {
            query = query.eq("type", params.type);
        }

        // Pagination
        const from = (params.page! - 1) * params.per_page!;
        const to = from + params.per_page! - 1;
        query = query.range(from, to);

        const { data: transactions, error: txError, count } = await query;

        if (txError) {
            console.error("Error fetching transactions:", txError);
            throw txError;
        }

        return new Response(
            JSON.stringify({
                data: transactions || [],
                total: count || 0,
                page: params.page,
                per_page: params.per_page,
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
