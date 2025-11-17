import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { quantity = 1, itemTitle, finalSaleAmount, listingId } = await req.json();
    console.log('Calculating listing fee for quantity:', quantity);

    // Calculate tiered listing fee based on quantity
    let listingFee = 2.99; // Default for 1-10 items
    
    if (quantity >= 51 && quantity <= 100) {
      listingFee = 10.00;
    } else if (quantity >= 11 && quantity <= 50) {
      listingFee = 5.00;
    }

    // Calculate commission (10% of final sale amount if provided)
    const commissionRate = 10.00;
    const commission = finalSaleAmount ? (finalSaleAmount * commissionRate / 100) : 0;

    console.log('Calculated listing fee:', listingFee, 'for quantity:', quantity);
    console.log('Commission rate:', commissionRate, '% on amount:', finalSaleAmount);

    // Create Supabase client for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }

    // Initialize Stripe for payment processing
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if a Stripe customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create Stripe checkout session for listing fee
  const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: `Listing Fee - ${itemTitle || 'Auction Item'}`,
              description: `Listing fee for ${quantity} item${quantity > 1 ? 's' : ''}`
            },
            unit_amount: Math.round(listingFee * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      // include listingId in success_url when available so client can resume activation flow
      success_url: listingId
        ? `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}&listingId=${encodeURIComponent(listingId)}`
        : `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/sell`,
      metadata: {
        type: 'listing_fee',
        user_id: user.id,
        quantity: quantity.toString(),
        listing_fee: listingFee.toString(),
        commission_rate: commissionRate.toString(),
        listing_id: listingId ? String(listingId) : ''
      }
    });

    return new Response(JSON.stringify({ 
      url: session.url,
      listingFee,
      commissionRate,
      commission,
      quantity,
      sessionId: session.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Error in calculate-listing-fee:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});