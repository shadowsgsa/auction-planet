import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("PayPal payment function called");

  try {
    const body = await req.json();
    console.log("PayPal request body:", body);
    
    const { amount, itemTitle, currency = "USD" } = body;
    
    console.log("PayPal payment details:", { amount, itemTitle, currency });
    
    if (!amount || amount <= 0) {
      console.error("Invalid amount:", amount);
      throw new Error("Valid amount is required");
    }

    const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
    
    console.log("PayPal credentials check:", { 
      hasClientId: !!clientId, 
      hasClientSecret: !!clientSecret,
      clientIdLength: clientId?.length || 0,
      clientSecretLength: clientSecret?.length || 0
    });
    
    if (!clientId || !clientSecret) {
      console.error("PayPal credentials missing");
      const missingKeys = [];
      if (!clientId) missingKeys.push("PAYPAL_CLIENT_ID");
      if (!clientSecret) missingKeys.push("PAYPAL_CLIENT_SECRET");
      throw new Error(`PayPal credentials not configured. Missing: ${missingKeys.join(', ')}`);
    }

    console.log("Getting PayPal access token...");
    
    // Get PayPal access token
    const authResponse = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Accept-Language": "en_US",
        "Authorization": `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    console.log("PayPal auth response status:", authResponse.status);

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error("PayPal auth error:", errorText);
      throw new Error("Failed to get PayPal access token");
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;
    console.log("PayPal access token obtained");

    console.log("Creating PayPal order...");
    
    // Create PayPal order
    const orderResponse = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount.toFixed(2),
            },
            description: `Payment for ${itemTitle || 'Auction Item'}`,
          },
        ],
        application_context: {
          return_url: `${req.headers.get("origin")}/payment-success?provider=paypal&amount=${amount}&item=${encodeURIComponent(itemTitle || '')}`,
          cancel_url: `${req.headers.get("origin")}/`,
        },
      }),
    });

    console.log("PayPal order response status:", orderResponse.status);

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.error("PayPal order error:", errorText);
      throw new Error("Failed to create PayPal order");
    }

    const orderData = await orderResponse.json();
    console.log("PayPal order created:", { orderId: orderData.id });
    
    const approvalUrl = orderData.links.find((link: any) => link.rel === "approve")?.href;

    if (!approvalUrl) {
      console.error("PayPal approval URL not found in order data:", orderData);
      throw new Error("PayPal approval URL not found");
    }

    console.log("PayPal approval URL:", approvalUrl);

    return new Response(JSON.stringify({ url: approvalUrl, orderId: orderData.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("PayPal payment error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return new Response(JSON.stringify({ 
      error: error.message,
      details: "Check edge function logs for more information"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});