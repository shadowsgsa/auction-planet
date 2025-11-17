import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("Stripe payment function called");

  try {
    const body = await req.json();
    console.log("Stripe request body:", body);
    
    const { amount, itemTitle } = body;
    
    console.log("Stripe payment details:", { amount, itemTitle });
    
    if (!amount || amount <= 0) {
      console.error("Invalid amount:", amount);
      throw new Error("Valid amount is required");
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    console.log("Stripe key check:", { hasStripeKey: !!stripeKey });
    
    if (!stripeKey) {
      console.error("Stripe secret key missing");
      throw new Error("Stripe credentials not configured");
    }

    // Initialize Stripe with secret key from environment
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    console.log("Creating Stripe checkout session...");
    
    // Create a one-time payment session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: `Bid on ${itemTitle || 'Auction Item'}` 
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?provider=stripe&amount=${amount}&item=${encodeURIComponent(itemTitle || '')}`,
      cancel_url: `${req.headers.get("origin")}/`,
    });

    console.log("Stripe session created:", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Stripe payment error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});