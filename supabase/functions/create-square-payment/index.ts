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

  console.log("Square payment function called");

  try {
    const body = await req.json();
    console.log("Square request body:", body);
    
    const { amount, itemTitle } = body;
    
    console.log("Square payment details:", { amount, itemTitle });
    
    if (!amount || amount <= 0) {
      console.error("Invalid amount:", amount);
      throw new Error("Valid amount is required");
    }

    const applicationId = Deno.env.get("SQUARE_APPLICATION_ID");
    const accessToken = Deno.env.get("SQUARE_ACCESS_TOKEN");
    
    console.log("Square credentials check:", { 
      hasApplicationId: !!applicationId, 
      hasAccessToken: !!accessToken,
      applicationIdLength: applicationId?.length || 0,
      accessTokenLength: accessToken?.length || 0
    });
    
    if (!applicationId || !accessToken) {
      console.error("Square credentials missing");
      const missingKeys = [];
      if (!applicationId) missingKeys.push("SQUARE_APPLICATION_ID");
      if (!accessToken) missingKeys.push("SQUARE_ACCESS_TOKEN");
      throw new Error(`Square credentials not configured. Missing: ${missingKeys.join(', ')}`);
    }

    console.log("Creating Square checkout link...");
    
    // Create Square checkout link
    const checkoutResponse = await fetch("https://connect.squareupsandbox.com/v2/online-checkout/payment-links", {
      method: "POST",
      headers: {
        "Square-Version": "2023-10-18",
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idempotency_key: crypto.randomUUID(),
        quick_pay: {
          name: `Payment for ${itemTitle || 'Auction Item'}`,
          price_money: {
            amount: Math.round(amount * 100), // Convert to cents
            currency: "USD",
          },
        },
        checkout_options: {
          redirect_url: `${req.headers.get("origin")}/payment-success?provider=square&amount=${amount}&item=${encodeURIComponent(itemTitle || '')}`,
        },
      }),
    });

    console.log("Square checkout response status:", checkoutResponse.status);

    if (!checkoutResponse.ok) {
      const errorData = await checkoutResponse.text();
      console.error("Square API error:", errorData);
      throw new Error("Failed to create Square payment link");
    }

    const checkoutData = await checkoutResponse.json();
    console.log("Square checkout created:", { paymentLinkId: checkoutData.payment_link.id });

    return new Response(JSON.stringify({ 
      url: checkoutData.payment_link.url,
      paymentLinkId: checkoutData.payment_link.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Square payment error details:", {
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