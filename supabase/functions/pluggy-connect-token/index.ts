// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConnectTokenRequest {
    user_id: string;
    item_id?: string; // for refresh/update flows
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const PLUGGY_CLIENT_ID = Deno.env.get("PLUGGY_CLIENT_ID");
        const PLUGGY_CLIENT_SECRET = Deno.env.get("PLUGGY_CLIENT_SECRET");

        if (!PLUGGY_CLIENT_ID || !PLUGGY_CLIENT_SECRET) {
            throw new Error("Missing Pluggy credentials in environment");
        }

        const { user_id, item_id } = (await req.json()) as ConnectTokenRequest;

        if (!user_id) {
            return new Response(
                JSON.stringify({ error: "user_id is required" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Step 1: Get Pluggy API Key
        console.log("Authenticating with Pluggy...");
        const authResponse = await fetch("https://api.pluggy.ai/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                clientId: PLUGGY_CLIENT_ID,
                clientSecret: PLUGGY_CLIENT_SECRET,
            }),
        });

        if (!authResponse.ok) {
            const errorText = await authResponse.text();
            console.error("Pluggy auth error:", errorText);
            throw new Error(`Pluggy auth failed: ${authResponse.status}`);
        }

        const authData = await authResponse.json();
        const apiKey = authData.apiKey;

        // Step 2: Generate Connect Token
        console.log("Generating connect token...");
        const connectTokenBody: Record<string, unknown> = {
            clientUserId: user_id // Link this connection to our user ID
        };

        // If item_id provided, it's for updating an existing connection
        if (item_id) {
            connectTokenBody.itemId = item_id;
        }

        const connectResponse = await fetch("https://api.pluggy.ai/connect_token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-KEY": apiKey,
            },
            body: JSON.stringify(connectTokenBody),
        });

        if (!connectResponse.ok) {
            const errorText = await connectResponse.text();
            console.error("Connect token error:", errorText);
            throw new Error(`Connect token generation failed: ${connectResponse.status}`);
        }

        const connectData = await connectResponse.json();

        // Return the connect token
        return new Response(
            JSON.stringify({
                accessToken: connectData.accessToken,
                expiresAt: connectData.expiresAt,
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("Error:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    }
});
