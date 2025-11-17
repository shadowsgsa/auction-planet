import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "npm:stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const sessionId = body?.session_id;
    const listingId = body?.listingId ?? body?.listing_id;

    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'session_id required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
    if (!stripeKey) {
      console.error('Missing STRIPE_SECRET_KEY');
      return new Response(JSON.stringify({ error: 'Stripe not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    // Retrieve the session and verify payment
    const session = await stripe.checkout.sessions.retrieve(String(sessionId));
    if (!session) {
      return new Response(JSON.stringify({ error: 'Session not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    console.log(sessionId);
    // Check payment status
    const paid = session.payment_status === 'paid' || session.status === 'complete';
    if (!paid) {
      return new Response(JSON.stringify({ error: 'Payment not completed' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Determine listing id from metadata if not provided
    const metaListingId = session.metadata?.listing_id ?? session.metadata?.listingId ?? null;
    const finalListingId = listingId ?? metaListingId ?? null;

    if (!finalListingId) {
      return new Response(JSON.stringify({ error: 'listing id not provided or found in session metadata' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Use service role to update DB
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: updateErr, data: updateData } = await supabaseAdmin
      .from('auction_items')
      .update({ status: 'active' })
      .eq('id', String(finalListingId));

    if (updateErr) {
      console.error('Error activating listing:', updateErr);
      return new Response(JSON.stringify({ error: updateErr.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    console.log('Listing activated:', finalListingId);  
    return new Response(JSON.stringify({ ok: true, updated: updateData }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('verify-and-activate-listing error:', error);
    return new Response(JSON.stringify({ error: String(error?.message ?? error) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
