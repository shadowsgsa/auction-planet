// src/components/BidDialog.tsx
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gavel } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import type { PaymentMethod } from "@stripe/stripe-js";
import { useParams } from 'react-router-dom';


interface BidDialogProps {
  itemTitle: string;
  currentBid: number;
  auctionItemId?: number;
  children: React.ReactNode;
}

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ""
);

const getApiBase = (): string => {
  const base = import.meta.env.VITE_API_BASE_URL;
  if (!base) {
    throw new Error(
      "VITE_API_BASE_URL is not set. Please add VITE_API_BASE_URL to your .env"
    );
  }
  return base.replace(/\/+$/, "");
};

const AttachCardForm: React.FC<{
  userId: string;
  email: string;
  onAttached: () => void;
}> = ({ userId, email, onAttached }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isAttaching, setIsAttaching] = useState(false);

  const safeFetchJson = async (url: string, options?: RequestInit) => {
    const resp = await fetch(url, options);
    if (!resp.ok) {
      const text = await resp.text().catch(() => "<no body>");
      throw new Error(`Request failed ${resp.status}: ${text}`);
    }
    const contentType = resp.headers.get("content-type") || "";
    if (contentType.includes("application/json")) return resp.json();
    const text = await resp.text();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  };

  const handleAttach = async () => {
    if (!stripe || !elements) {
      toast({
        title: "Stripe not ready",
        description: "Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsAttaching(true);
    try {
      const base = getApiBase();
      const createUrl = `${base}/create-setup-intent`;

      const payload = await safeFetchJson(createUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, email }),
      });

      const clientSecret =
        payload.clientSecret || payload.client_secret || undefined;

      if (!clientSecret) throw new Error("No client_secret returned");

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Card element not found");

      const result = await stripe.confirmCardSetup(clientSecret, {
        payment_method: { card: cardElement },
      });

      if (result.error) throw result.error;

      let paymentMethodId: string | undefined;
      const pmRaw = result.setupIntent?.payment_method as
        | string
        | PaymentMethod
        | undefined;

      if (typeof pmRaw === "string") paymentMethodId = pmRaw;
      else if (pmRaw && (pmRaw as any).id) paymentMethodId = (pmRaw as any).id;

      if (!paymentMethodId)
        throw new Error("No payment method ID returned from Stripe");

      const attachUrl = `${base}/attach-payment-method`;

      await safeFetchJson(attachUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, paymentMethodId }),
      });

      toast({
        title: "Card attached",
        description: "Your card has been saved.",
      });

      onAttached();
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Failed to attach card",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsAttaching(false);
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Attach Card</Label>
      <div className="p-3 border rounded">
        <CardElement options={{ hidePostalCode: true }} />
      </div>
      <Button onClick={handleAttach} disabled={isAttaching} className="w-full">
        {isAttaching ? "Attaching..." : "Attach Card"}
      </Button>
    </div>
  );
};

const BidDialog = ({
  itemTitle,
  currentBid,
  auctionItemId,
  children,
}: BidDialogProps) => {
  const [bidAmount, setBidAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { id } = useParams();

  const [hasSavedCard, setHasSavedCard] = useState(false);
  const [checkingSavedCard, setCheckingSavedCard] = useState(false);

  // NEW STATES:
  const [reservePrice, setReservePrice] = useState<number | null>(null);
  const [totalTax, setTotalTax] = useState<number>(0);

  // FETCH reserve price & tax
  useEffect(() => {
    if (!auctionItemId) return;

   const fetchReserve = async () => {
  try {
    // Fetch reserve price from lots table
    const { data: lotData, error: lotError } = await supabase
      .from("lots")
      .select("reserve_price")
      .eq("id", auctionItemId)
      .single();

    if (lotError) {
      console.error("Reserve price fetch error:", lotError);
    } else {
      setReservePrice(lotData?.reserve_price ?? null);
    }

    // Fetch total_tax from auction_shop table
    const { data: shopData, error: shopError } = await supabase
      .from("auction_shop")
      .select("total_tax")
      .eq("id", Number(id))
      .single();

    if (shopError) {
      console.error("Total tax fetch error:", shopError);
    } else {
      setTotalTax(shopData.total_tax || 0);
    }
  } catch (err) {
    console.error("Unexpected fetchReserve error:", err);
  }
};


    fetchReserve();
    console.log("Fetched reserve price and tax", reservePrice)
  }, [auctionItemId]);

  // Check saved card
  useEffect(() => {
    if (!open) return;

    const check = async () => {
      if (!user) return setHasSavedCard(false);
      setCheckingSavedCard(true);
      try {
        const { data, error } = await supabase
          .from("payment_methods")
          .select("id")
          .eq("user_id", user.id)
          .limit(1);

        if (error) setHasSavedCard(false);
        else setHasSavedCard(data.length > 0);
      } catch {
        setHasSavedCard(false);
      } finally {
        setCheckingSavedCard(false);
      }
    };

    check();
  }, [open, user]);

  const handleBid = async () => {
    const amount = parseFloat(bidAmount);

    if (!amount || amount <= currentBid) {
      toast({
        title: "Invalid bid",
        description: `Bid must be higher than $${currentBid}`,
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to place a bid.",
        variant: "destructive",
      });
      return;
    }

    if (!auctionItemId) {
      toast({
        title: "Missing item",
        description: "Auction item ID missing.",
        variant: "destructive",
      });
      return;
    }

    if (!hasSavedCard) {
      toast({
        title: "Card required",
        description: "Attach a card to place a bid.",
        variant: "destructive",
      });
      return;
    }

    // NEW: If bid >= reserve_price → confirm deduction
    if (reservePrice && amount >= reservePrice) {
      const confirmMsg = `Your bid passes the reserve price.\n\nA total of $${(
        amount + totalTax
      ).toFixed(
        2
      )} will be deducted from your payment method.\n\nDo you want to continue?`;

      const confirmed = window.confirm(confirmMsg);
      if (!confirmed) return;

      // Deduct amount + tax
      try {
        const base = getApiBase();
        const deductUrl = `${base}/deduct-amount`;

        const resp = await fetch(deductUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            amountToDeduct: amount + totalTax,
          }),
        });

        if (!resp.ok) throw new Error("Payment deduction failed");
      } catch (err: any) {
        toast({
          title: "Payment failed",
          description: err.message || "Could not deduct payment",
          variant: "destructive",
        });
        return;
      }
    }

    // Place bid
    setIsLoading(true);
    try {
      const { error: bidError } = await supabase.from("bids").insert({
        auction_item_id: auctionItemId,
        bidder_id: user.id,
        amount,
      });

      if (bidError) throw bidError;

      const { error: updateError } = await supabase
        .from("lots")
        .update({ starting_bid: amount })
        .eq("id", auctionItemId);

      if (updateError) throw updateError;

      toast({
        title: "Bid placed!",
        description: `Your bid of $${amount.toLocaleString()} has been placed.`,
      });

      setOpen(false);
      setBidAmount("");
    } catch (err: any) {
      toast({
        title: "Error placing bid",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onCardAttached = () => setHasSavedCard(true);

  return (
    <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5" />
            Place Your Bid
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Item</Label>
            <Input value={itemTitle} disabled />
          </div>

          <div>
            <Label className="text-sm font-medium">Current Bid</Label>
            <Input value={`$${currentBid.toLocaleString()}`} disabled />
          </div>

         

          {!hasSavedCard ? (
            <div>
              <Label className="text-sm font-medium">
                Attach a card to bid
              </Label>
              <div className="mt-2">
                {checkingSavedCard ? (
                  <div>Checking payment methods...</div>
                ) : user ? (
                  <Elements stripe={stripePromise}>
                    <AttachCardForm
                      userId={user.id}
                      email={user.email || ""}
                      onAttached={onCardAttached}
                    />
                  </Elements>
                ) : (
                  <div>Please sign in to attach a card.</div>
                )}
              </div>
            </div>
          ) : (
            <>
              <div>
                <Label className="text-sm font-medium">Your Bid ($)</Label>
                <Input
                  type="number"
                  min={currentBid + 1}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={`Minimum: $${currentBid + 1}`}
                />
              </div>

              <Button
                onClick={handleBid}
                disabled={isLoading || !bidAmount}
                className="w-full"
              >
                {isLoading
                  ? "Processing..."
                  : `Place Bid - $${bidAmount || "0"}`}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BidDialog;
