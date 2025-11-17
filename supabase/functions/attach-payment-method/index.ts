import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.12.0";
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), {
  apiVersion: "2023-10-16"
});
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  try {
    const { userId, paymentMethodId } = await req.json();
    // Find or create Stripe customer for this user
    const customers = await stripe.customers.list({
      limit: 1
    });
    const customer = customers.data[0];
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id
    });
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });
    return new Response(JSON.stringify({
      success: true
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
