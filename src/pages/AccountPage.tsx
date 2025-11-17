import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Gavel,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Edit,
  Eye,
  EyeOff,
  Star,
  Activity,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ProfileEditDialog } from '@/components/ProfileEditDialog';
import { PaymentMethodsDialog } from '@/components/PaymentMethodsDialog';
import { NotificationPreferencesDialog } from '@/components/NotificationPreferencesDialog';
import AuctionManagement from '@/components/AuctionManagement';
// removed invalid Node import (was causing build/runtime issues in the browser)
import { useNavigate } from 'react-router-dom';
// --- Types ---

type RawBid = {
  id: string;
  amount: string | number | null;
  bidder_id: string | null;
  created_at: string | null;
  status?: string | null;
};

type BidProfile = {
  user_id?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
};

type SellerProfile = {
  user_id?: string | null;
  display_name?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
};

type EnrichedBid = {
  id: string;
  amount: number;
  bidder_id: string;
  created_at: string | null;
  status?: string | null;
  bidder?: BidProfile | null;
  isLeading?: boolean;
  seller_profile?: SellerProfile | null;
  auction_items?: any;
};

type AuctionItemWithBids = {
  id: string;
  title: string;
  image_url?: string | null;
  current_bid?: string | number | null;
  starting_price?: string | number | null;
  status?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  seller_id?: string | null;
  bids?: EnrichedBid[] | null;
  // newly added
  winner_profile?: SellerProfile | null;
  winner_id?: string | null;
};

const AccountPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();

  const [userStats, setUserStats] = useState({
    totalBids: 0,
    itemsWon: 0,
    itemsSold: 0,
    totalSpent: 0,
    totalEarned: 0,
    rating: 0,
    reviewCount: 0
  });
  // const [myListings, setMyListings] = useState<AuctionItemWithBids[]>([]);
  const [activeListings, setActiveListings] = useState([]);

  const [myBids, setMyBids] = useState<EnrichedBid[]>([]);
  const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);
  const [expandedListingIds, setExpandedListingIds] = useState<Record<string, boolean>>({});
 const [drafts, setDrafts] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchUserData();
    fetchDrafts();
    fetchActiveListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  const fetchActiveListings = async () => {
    try {
      const { data: listingsData, error: listingsError } = await (supabase as any)
        .from('auction_shop')
        .select('*')
        .eq('status', 'active')
        .eq('shopowner_id', user.id);
      if (listingsError) {
        console.error('Error fetching active listings:', listingsError);
      } else {
        setActiveListings(listingsData || []);
        console.log('Active listings:', listingsData);
      }
    } catch (err) {
      console.error('fetchActiveListings error', err);
    }
  };
  const formatRemainingTime = (endTime?: string | null) => {
    if (!endTime) return 'Unknown';
    const now = Date.now();
    const endTs = new Date(endTime).getTime();
    if (isNaN(endTs)) return 'Unknown';
    if (endTs <= now) return 'Ended';
    const diff = endTs - now;
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    const parts = [] as string[];
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (mins || parts.length === 0) parts.push(`${mins}m`);
    return parts.join(' ');
  };

  /**
   * finalizeEndedAuctions
   * - Detect auctions that ended (based on end_time).
   * - Choose winner (highest amount, tiebreaker newest created_at).
   * - Persist statuses to DB: bids.status -> 'won'/'outbid', auction_items.status -> 'sold'/'ended'.
   * - Returns local copy with updated statuses so UI reflects immediately.
   */
  const finalizeEndedAuctions = async (auctionItemsRaw: any[] = []) => {
    if (!Array.isArray(auctionItemsRaw) || auctionItemsRaw.length === 0) return auctionItemsRaw;
    const now = Date.now();

    const bidIdsToMarkWon: string[] = [];
    const bidIdsToMarkOutbid: string[] = [];
    const auctionIdsToMarkSold: string[] = [];
    const auctionIdsToMarkEnded: string[] = [];

    const localCopy = JSON.parse(JSON.stringify(auctionItemsRaw)) as any[];

    for (const it of localCopy) {
      const endTs = it?.end_time ? new Date(it.end_time).getTime() : NaN;
      const auctionEnded = !isNaN(endTs) && endTs <= now;

      // IMPORTANT: Do not touch items that are in draft state.
      // Drafts should remain as 'draft' until explicitly published by the seller.
      if (it && it.status && String(it.status).toLowerCase() === 'draft') {
        continue;
      }

      if (!auctionEnded) continue;

      const bidsArr: RawBid[] = Array.isArray(it.bids) ? it.bids : [];
      if (bidsArr.length === 0) {
        auctionIdsToMarkEnded.push(it.id);
        it.status = it.status ?? 'ended';
        continue;
      }

      // determine leading bid
      let maxAmount = -Infinity;
      let leadingIndex = -1;
      let leadingCreatedAt = 0;
      for (let i = 0; i < bidsArr.length; i++) {
        const b = bidsArr[i];
        const amt = Number(b.amount ?? 0);
        const created = b.created_at ? new Date(b.created_at).getTime() : 0;
        if (amt > maxAmount || (amt === maxAmount && created > leadingCreatedAt)) {
          maxAmount = amt;
          leadingIndex = i;
          leadingCreatedAt = created;
        }
      }

      if (leadingIndex >= 0) {
        const winner = bidsArr[leadingIndex];
        bidIdsToMarkWon.push(String(winner.id));
        for (let i = 0; i < bidsArr.length; i++) {
          if (i === leadingIndex) continue;
          bidIdsToMarkOutbid.push(String(bidsArr[i].id));
        }
        auctionIdsToMarkSold.push(String(it.id));

        // update local copy statuses
        for (let i = 0; i < it.bids.length; i++) {
          if (String(it.bids[i].id) === String(winner.id)) {
            it.bids[i].status = 'won';
            it.bids[i].isLeading = true;
          } else {
            it.bids[i].status = it.bids[i].status ?? 'outbid';
            it.bids[i].isLeading = false;
          }
        }
        it.status = 'sold';
      } else {
        auctionIdsToMarkEnded.push(String(it.id));
        it.status = it.status ?? 'ended';
      }
    }

    // persist changes (batch)
    try {
      if (bidIdsToMarkWon.length > 0) {
        const { error: wonErr } = await (supabase as any)
          .from('bids')
          .update({ status: 'won' })
          .in('id', bidIdsToMarkWon);
        if (wonErr) console.warn('Error marking winning bids', wonErr);
      }

      if (bidIdsToMarkOutbid.length > 0) {
        const { error: outErr } = await (supabase as any)
          .from('bids')
          .update({ status: 'outbid' })
          .in('id', bidIdsToMarkOutbid);
        if (outErr) console.warn('Error marking outbid bids', outErr);
      }

      if (auctionIdsToMarkSold.length > 0) {
        const { error: soldErr } = await (supabase as any)
          .from('auction_items')
          .update({ status: 'sold' })
          .in('id', auctionIdsToMarkSold);
        if (soldErr) console.warn('Error marking auctions sold', soldErr);
      }

      if (auctionIdsToMarkEnded.length > 0) {
        const { error: endErr } = await (supabase as any)
          .from('auction_items')
          .update({ status: 'ended' })
          .in('id', auctionIdsToMarkEnded);
        if (endErr) console.warn('Error marking auctions ended', endErr);
      }
    } catch (e) {
      console.warn('Exception while finalizing ended auctions', e);
    }

    return localCopy;
  };
  const fetchDrafts = async () => {
    try{
      // Fetch drafts logic here
      const { data: draftsData, error: draftsError } = await (supabase as any).from('auction_shop').select('*').eq('status', 'draft').eq('shopowner_id',user.id);
      if(draftsError){
        console.error('Error fetching drafts:', draftsError);
      } else {
        // Process draftsData as needed
        setDrafts(draftsData || []);
        console.log(draftsData);
      }

    } catch (err) {
      console.error('fetchDrafts error', err);
    }    
  };
  const manageAuction = async (auctionId: string) => {
    console.log("managing auction:", auctionId);
    navigate(`/manageAuctionShop/${auctionId}`);
  };  
  //   let check = false;
  // const activateListing = async (listingId: string) => {
  //   if(check){
  //   console.log("activating listing:", listingId);
  //   try {
  //     const { data, error } = await (supabase as any)
  //       .from('auction_items')
  //       .update({ status: 'active' })
  //       .eq('id', listingId);
  //     if (error) {
  //       console.error('Error activating listing:', error);
  //     } else {
  //       console.log('Listing activated:', data);
  //     }
  // }
  //   catch (err) { 
  //     console.error('activateListing error', err);
  //   }
  //   }
  //   else{
  //     console.log("activateListing skipped due to check=false");
  //   try {
  //     // Prefer using the draft item's data if available, otherwise fall back to sending the listingId
  //     const listing = (drafts || []).find((d: any) => String(d.id) === String(listingId));
  //     const payload: any = listing
  //       ? { quantity: listing.quantity ?? 1, itemTitle: listing.title ?? '', listingId: String(listingId) }
  //       : { listingId: String(listingId) };

  //     const { data, error } = await supabase.functions.invoke('calculate-listing-fee', {
  //       body: payload
  //     });
  //     console.log("Payload: ", payload);
  //     console.log("Data: ", data);


  //     if (error) {
  //       console.error('listing fee function error', error);
  //       alert('Failed to process payment. Please try again.');
  //       return;
  //     }

  //     if (data?.url){
  //     check = true; 
  //     window.open(data.url, '_self');
  //     }
  //     // if (data?.url) console.log(listingId);

  //     else {
  //       console.error('No URL returned from listing fee function:', data);
  //       alert('Payment provider did not return a checkout URL.');
  //     }
  //     check = true;
  //   } catch (err) {
  //     console.error('Error calling listing fee function:', err);
  //     alert('An error occurred while creating payment.');
  //   }
  //   }
    
  // };
  const fetchUserData = async () => {
    if (!user) return;

    try {
      // --- profile ---
      const { data: profileData, error: profileError } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      } else {
        setProfile(profileData);
      }

      // --- fetch auction items (seller's listings) and finalize ended ones ---
      const { data: auctionItemsRaw, error: auctionError } = await (supabase as any)
        .from('lots')
        .select('*, bids(*)')
        .eq('seller_id', user.id);

      if (auctionError) {
        console.error('Error fetching auction items:', auctionError);
        // setActiveListings([]);
      } else {
        const finalizedLocal = await finalizeEndedAuctions(Array.isArray(auctionItemsRaw) ? auctionItemsRaw : []);
        const items = (finalizedLocal || []).map((it: any) => ({
          id: String(it.id),
          title: it.title,
          image_url: it.image_url ?? null,
          current_bid: it.current_bid ?? it.current_price ?? null,
          starting_price: it.starting_price ?? null,
          status: it.status ?? null,
          start_time: it.start_time ?? null,
          end_time: it.end_time ?? null,
          seller_id: it.seller_id ?? null,
          bids: Array.isArray(it.bids) ? it.bids : []
        }));
        // setActiveListings(items as any);
      }

      // --- fetch my bids joined with auction_items ---
      const { data: bidsData, error: bidsError } = await (supabase as any)
        .from('bids')
        .select(`*, lots(*)`)
        .eq('bidder_id', user.id)
        .order('created_at', { ascending: false });

      if (bidsError) {
        console.error('Error fetching bids:', bidsError);
        setMyBids([]);
      } else {
        // normalize
        const normalizedMyBids = (bidsData || []).map((b: any) => ({
          ...b,
          amount: Number(b.amount ?? 0),
          auction_items: b.auction_items
            ? {
                ...b.auction_items,
                start_time: b.auction_items.start_time ?? null,
                end_time: b.auction_items.end_time ?? null,
                seller_id: b.auction_items.seller_id ?? null
              }
            : null
        }));

        // compute leading bids per auction (so we can detect winning)
        const auctionIds = Array.from(
          new Set(
            normalizedMyBids
              .map((b: any) => b.auction_item_id ?? b.auction_items?.id)
              .filter(Boolean)
              .map(String)
          )
        );

        let leadingBidByAuction: Record<string, { bidId: string; bidderId: string | null; amount: number }> = {};

        if (auctionIds.length > 0) {
          try {
            const { data: auctionsWithBids, error: auctionsErr } = await (supabase as any)
              .from('auction_items')
              .select('id, end_time, bids(*)')
              .in('id', auctionIds);

            if (auctionsErr) {
              console.warn('Could not fetch auction_items with bids for leading calculation', auctionsErr);
            } else if (Array.isArray(auctionsWithBids)) {
              for (const ai of auctionsWithBids) {
                const bidsArr = Array.isArray(ai.bids) ? ai.bids : [];
                let maxAmount = -Infinity;
                let leadingBidId: string | null = null;
                let leadingBidder: string | null = null;
                let leadingCreatedAt = 0;

                for (const b of bidsArr) {
                  const amt = Number(b.amount ?? 0);
                  const created = b.created_at ? new Date(b.created_at).getTime() : 0;
                  if (amt > maxAmount || (amt === maxAmount && created > leadingCreatedAt)) {
                    maxAmount = amt;
                    leadingBidId = String(b.id);
                    leadingBidder = b.bidder_id ? String(b.bidder_id) : null;
                    leadingCreatedAt = created;
                  }
                }

                if (leadingBidId) {
                  leadingBidByAuction[String(ai.id)] = { bidId: leadingBidId, bidderId: leadingBidder, amount: maxAmount };
                }
              }
            }
          } catch (e) {
            console.warn('Exception while fetching auctionsWithBids', e);
          }
        }

        // enrich bids with isLeading and local computed statuses
        let enrichedMyBids: EnrichedBid[] = normalizedMyBids.map((b: any) => {
          const auctionId = String(b.auction_item_id ?? b.auction_items?.id ?? '');
          let isLeading = false;
          let computedStatus: string | undefined = b.status ?? undefined;

          if (auctionId && leadingBidByAuction[auctionId]) {
            isLeading = String(leadingBidByAuction[auctionId].bidId) === String(b.id);
          } else {
            const current = Number(b.auction_items?.current_bid ?? b.auction_items?.current_price ?? 0);
            if (!Number.isNaN(current) && Number(b.amount) === current && current > 0) {
              isLeading = true;
            }
          }

          const auctionEndTs = b.auction_items?.end_time ? new Date(b.auction_items.end_time).getTime() : null;
          const auctionEnded = auctionEndTs !== null && !isNaN(auctionEndTs) && auctionEndTs <= Date.now();

          if (auctionEnded) {
            computedStatus = isLeading ? 'won' : 'outbid';
          } else {
            computedStatus = isLeading ? (b.status ?? 'winning') : (b.status ?? 'active');
          }

          return {
            id: String(b.id),
            amount: Number(b.amount ?? 0),
            bidder_id: String(b.bidder_id ?? ''),
            created_at: b.created_at ?? null,
            status: computedStatus,
            bidder: null,
            isLeading,
            seller_profile: null,
            auction_items: b.auction_items ?? null
          } as EnrichedBid;
        });

        // --- NEW: fetch seller profiles for auctions referred by user's bids (so we can show seller contact to winners) ---
        const sellerIds = Array.from(
          new Set(
            normalizedMyBids
              .map((b: any) => b.auction_items?.seller_id)
              .filter(Boolean)
              .map(String)
          )
        );

        if (sellerIds.length > 0) {
          try {
            const { data: sellerProfiles, error: sellerErr } = await (supabase as any)
              .from('profiles')
              .select('user_id, display_name, phone, address, city, state, zip_code')
              .in('user_id', sellerIds);

            if (sellerErr) {
              console.warn('Error fetching seller profiles', sellerErr);
            } else if (Array.isArray(sellerProfiles)) {
              const sellerMap = new Map<string, SellerProfile>();
              sellerProfiles.forEach((p: any) => {
                if (!p) return;
                sellerMap.set(String(p.user_id), {
                  user_id: p.user_id,
                  display_name: p.display_name ?? null,
                  phone: p.phone ?? null,
                  address: p.address ?? null,
                  city: p.city ?? null,
                  state: p.state ?? null,
                  zip_code: p.zip_code ?? null
                });
              });

              // attach seller_profile to bids (only meaningful for bids that reference auction_items.seller_id)
              enrichedMyBids = enrichedMyBids.map((eb) => {
                const sellerId = eb.auction_items?.seller_id ?? null;
                if (sellerId && sellerMap.has(String(sellerId))) {
                  eb.seller_profile = sellerMap.get(String(sellerId)) ?? null;
                } else {
                  eb.seller_profile = null;
                }
                return eb;
              });
            }
          } catch (e) {
            console.warn('Exception fetching seller profiles', e);
          }
        }

        setMyBids(enrichedMyBids);
      }

      // --- purchases ---
      const { data: purchasesData, error: purchasesError } = await (supabase as any)
        .from('purchases')
        .select(`*, auction_items(*)`)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      if (purchasesError) {
        console.error('Error fetching purchases:', purchasesError);
        setPurchaseHistory([]);
      } else {
        setPurchaseHistory(purchasesData || []);
      }

      // Re-fetch auction items for listing enrichment (reflect DB-updated statuses)
      const { data: auctionItemsForEnrichment } = await (supabase as any)
        .from('auction_items')
        .select('*, bids(*)')
        .eq('seller_id', user.id);

      const allListings: any[] = auctionItemsForEnrichment && Array.isArray(auctionItemsForEnrichment) ? auctionItemsForEnrichment : [];
      const bidderIdSet = new Set<string>();
      allListings.forEach((li) => {
        if (Array.isArray(li.bids)) {
          li.bids.forEach((b: any) => {
            if (b?.bidder_id) bidderIdSet.add(String(b.bidder_id));
          });
        }
      });
      (myBids || []).forEach((b: any) => {
        if (b?.bidder_id) bidderIdSet.add(String(b.bidder_id));
      });

      const bidderIdsArr = Array.from(bidderIdSet).map(String).filter(Boolean);

      // fetch bidder profiles in bulk for listing enrichment (your previous logic)
      let profilesList: BidProfile[] = [];
      if (bidderIdsArr.length > 0) {
        const chunk = (arr: readonly string[], n = 100) => {
          const out: string[][] = [];
          for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
          return out;
        };

        for (const group of chunk(bidderIdsArr, 100)) {
          try {
            const { data: byUserId, error: errUser } = await (supabase as any)
              .from('profiles')
              .select('user_id, display_name, avatar_url')
              .in('user_id', group);

            if (!errUser && Array.isArray(byUserId)) {
              profilesList = profilesList.concat(byUserId.map((r: any) => ({
                user_id: r.user_id,
                display_name: r.display_name,
                avatar_url: r.avatar_url
              })));
            }
          } catch (e) {
            console.warn('profiles by user_id fetch exception', e);
          }
        }
      }

      const profileLookup = new Map<string, BidProfile>();
      profilesList.forEach((p) => {
        if (!p) return;
        const kUser = (p.user_id ?? '').toString().toLowerCase().trim();
        if (kUser) profileLookup.set(kUser, p);
      });

      // --- Enrich listing bids + attach winner profiles for ended auctions ---
      if (allListings.length === 0) {
        // setActiveListings([]);
      } else {
        // First pass: build enriched items and record any detected winner bidder ids for ended auctions
        const enrichedItemsTemp = (allListings || []).map((it: any) => {
          const rawBids: RawBid[] = Array.isArray(it.bids) ? it.bids : [];
          const enriched: EnrichedBid[] = rawBids
            .map((b) => {
              const bidderRaw = b?.bidder_id ? String(b.bidder_id) : '';
              const bidderNorm = bidderRaw.toLowerCase().trim();
              const matched: BidProfile | null = bidderNorm ? (profileLookup.get(bidderNorm) ?? null) : null;

              return {
                id: String(b.id),
                amount: Number(b.amount ?? 0),
                bidder_id: bidderRaw,
                created_at: b.created_at ?? null,
                status: b.status ?? undefined,
                bidder: matched,
                isLeading: b.status === 'won' || b.status === 'winning'
              } as EnrichedBid;
            })
            .sort((a, c) => {
              const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
              const tb = c.created_at ? new Date(c.created_at).getTime() : 0;
              return tb - ta;
            });

          // Determine winner for ended auctions where DB hasn't set statuses properly
          const auctionEndTs = it.end_time ? new Date(it.end_time).getTime() : null;
          const auctionEnded = auctionEndTs !== null && !isNaN(auctionEndTs) && auctionEndTs <= Date.now();

          if (enriched.length > 0) {
            let maxAmount = -Infinity;
            let leadingIndex = -1;
            for (let i = 0; i < enriched.length; i++) {
              const amt = Number(enriched[i].amount ?? 0);
              if (
                amt > maxAmount ||
                (amt === maxAmount &&
                  new Date(enriched[i].created_at || 0).getTime() >
                    new Date(enriched[leadingIndex]?.created_at || 0).getTime())
              ) {
                maxAmount = amt;
                leadingIndex = i;
              }
            }
            if (leadingIndex >= 0) {
              enriched[leadingIndex].isLeading =
                enriched[leadingIndex].status === 'won' || (!auctionEnded && enriched[leadingIndex].status === 'winning') || enriched[leadingIndex].isLeading;
              if (auctionEnded) {
                enriched[leadingIndex].status = enriched[leadingIndex].status ?? 'won';
                for (let i = 0; i < enriched.length; i++) {
                  if (i !== leadingIndex) enriched[i].status = enriched[i].status ?? 'outbid';
                }
              } else {
                enriched[leadingIndex].status = enriched[leadingIndex].status ?? 'winning';
              }
            }
          }

          let listingStatus = it.status ?? null;
          if (auctionEnded) {
            const hasWinner = enriched.some((b) => b.status === 'won');
            listingStatus = hasWinner ? 'sold' : (listingStatus ?? 'ended');
          }

          // calculate winner_id candidate if auction ended (highest amount + tie newest)
          let winnerBidderId: string | null = null;
          if (auctionEnded && enriched.length > 0) {
            let maxAmount = -Infinity;
            let winnerIdx = -1;
            let winnerCreatedAt = 0;
            for (let i = 0; i < enriched.length; i++) {
              const b = enriched[i];
              const amt = Number(b.amount ?? 0);
              const created = b.created_at ? new Date(b.created_at).getTime() : 0;
              if (amt > maxAmount || (amt === maxAmount && created > winnerCreatedAt)) {
                maxAmount = amt;
                winnerIdx = i;
                winnerCreatedAt = created;
              }
            }
            if (winnerIdx >= 0) {
              winnerBidderId = enriched[winnerIdx].bidder_id ?? null;
            }
          }

          return {
            id: String(it.id),
            title: it.title,
            image_url: it.image_url ?? null,
            current_bid: it.current_bid ?? it.current_price ?? null,
            starting_price: it.starting_price ?? null,
            status: listingStatus,
            start_time: it.start_time ?? null,
            end_time: it.end_time ?? null,
            seller_id: it.seller_id ?? null,
            bids: enriched,
            // temp field
            _winner_candidate_id: winnerBidderId
          } as any;
        });

        // Collect unique winner ids to fetch profiles for (exclude nulls)
        const winnerIdsSet = new Set<string>();
        enrichedItemsTemp.forEach((li) => {
          const wid = li._winner_candidate_id;
          if (wid) winnerIdsSet.add(String(wid));
        });
        const winnerIdsArr = Array.from(winnerIdsSet).filter(Boolean);

        // Fetch winner profiles in one batch
        let winnerProfiles: any[] = [];
        if (winnerIdsArr.length > 0) {
          try {
            const { data: winProfData, error: winProfErr } = await (supabase as any)
              .from('profiles')
              .select('user_id, display_name, phone, address, city, state, zip_code, avatar_url')
              .in('user_id', winnerIdsArr);

            if (!winProfErr && Array.isArray(winProfData)) {
              winnerProfiles = winProfData;
            } else if (winProfErr) {
              console.warn('Error fetching winner profiles', winProfErr);
            }
          } catch (e) {
            console.warn('Exception fetching winner profiles', e);
          }
        }

        // Map winner profiles and attach to listings
        const winnerMap = new Map<string, any>();
        winnerProfiles.forEach((p) => {
          if (!p) return;
          winnerMap.set(String(p.user_id), p);
        });

        const enrichedItems: AuctionItemWithBids[] = enrichedItemsTemp.map((li: any) => {
          const winnerId = li._winner_candidate_id ?? null;
          const winnerProfile = winnerId && winnerMap.has(String(winnerId)) ? {
            user_id: winnerMap.get(String(winnerId)).user_id,
            display_name: winnerMap.get(String(winnerId)).display_name ?? null,
            phone: winnerMap.get(String(winnerId)).phone ?? null,
            address: winnerMap.get(String(winnerId)).address ?? null,
            city: winnerMap.get(String(winnerId)).city ?? null,
            state: winnerMap.get(String(winnerId)).state ?? null,
            zip_code: winnerMap.get(String(winnerId)).zip_code ?? null
          } : null;

          return {
            id: String(li.id),
            title: li.title,
            image_url: li.image_url ?? null,
            current_bid: li.current_bid ?? li.current_price ?? null,
            starting_price: li.starting_price ?? null,
            status: li.status,
            start_time: li.start_time ?? null,
            end_time: li.end_time ?? null,
            seller_id: li.seller_id ?? null,
            bids: li.bids,
            winner_profile: winnerProfile,
            winner_id: winnerId
          } as AuctionItemWithBids;
        });

        // setActiveListings(enrichedItems);
      }

      // --- stats ---
      try {
        const { data: wonBidsForUser } = await (supabase as any)
          .from('bids')
          .select('id')
          .eq('bidder_id', user.id)
          .eq('status', 'won');

        const itemsWonCount = Array.isArray(wonBidsForUser) ? wonBidsForUser.length : 0;
        const totalBids = (Array.isArray(myBids) ? myBids.length : 0) || 0;
        const itemsSold = (allListings || []).filter((item: any) => item.status === 'sold').length || 0;
        const totalSpent = (purchaseHistory || []).reduce((sum: number, purchase: any) => sum + Number(purchase.final_price ?? 0), 0) || 0;
        const totalEarned = (allListings || []).filter((item: any) => item.status === 'sold').reduce((sum: number, it: any) => sum + Number(it.current_bid ?? it.current_price ?? 0), 0) || 0;

        setUserStats({
          totalBids,
          itemsWon: itemsWonCount,
          itemsSold,
          totalSpent,
          totalEarned,
          rating: 4.8,
          reviewCount: 23
        });
      } catch (e) {
        console.warn('Error computing stats', e);
      }
    } catch (err) {
      console.error('fetchUserData error', err);
    }
  };
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: "",
    category: "",
    condition: "",
    description: "",
    policy: "",
    payment_policy: "",
  });const openEditModal = (list) => {
    setEditFormData({
      title: list.title || "",
      category: list.category || "",
      condition: list.condition || "",
      description: list.description || "",
      policy: list.policy || "",
      payment_policy: list.payment_policy || "",
    });
    setActiveId(list.id);
    setEditModalOpen(true);
  }; const handleUpdate = async () => {
    const insertPayload = {
      title: editFormData.title,
      description: editFormData.description || null,
      category: editFormData.category || null,
      condition: editFormData.condition || null,
      starting_price: null,
      end_time: null,
      shopowner_id: user.id,
      status: "active",
      consignment_status: "pending",
      listing_fee: 0,
      commission_rate: 15.0,
      listing_fee_paid: false,
      policy: editFormData.policy,
      payment_policy: editFormData.payment_policy,
    };

    console.log("Updating:", activeId, insertPayload);

    // your update function here
    await editAuction(activeId, insertPayload);
    setEditModalOpen(false);
  };
  const toggleListingExpanded = (id: string) => {
    setExpandedListingIds((s) => ({ ...s, [id]: !s[id] }));
  };
  const deleteAuction = async (id) => {
    if (!confirm("Are you sure you want to delete this Auction?")) return;
    const { error } = await supabase.from("auction_shop").delete().eq("id", id);
    if (error) {
      console.error("Error deleting lot:", error);
      alert("Something went wrong while deleting!");
    } else {
      const { error } = await supabase.from("lots").delete().eq("auction_id", id);
      if(error){
      alert("Something went wrong while deleting!");
      }
      else{
      alert("Lot deleted successfully!");
        fetchDrafts();
      }
    }
  };
  const getStatusBadge = (status?: string | null) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'sold':
        return <Badge className="bg-success text-success-foreground">Sold</Badge>;
      case 'winning':
        return <Badge className="bg-success text-success-foreground">Winning</Badge>;
      case 'outbid':
        return <Badge variant="destructive">Outbid</Badge>;
      case 'won':
        return <Badge className="bg-accent text-accent-foreground">Won</Badge>;
      default:
        return <Badge variant="secondary">{status ?? 'Unknown'}</Badge>;
    }
  };

  const maskId = (id?: string | null) => {
    if (!id) return '***';
    return `${id.slice(0, 4)}...${id.slice(-3)}`;
  };

  async function editAuction(id: any, payload?: any): Promise<any | null> {
    if (!id) {
      console.warn('editAuction called without id');
      return null;
    }

    try {
      // If payload provided -> perform update (publishing/updating a draft)
      if (payload) {
        // ensure id is string
        const sid = String(id);
        // add/update updated_at timestamp
        const updatePayload = { ...payload, updated_at: new Date().toISOString() };
        const { data, error } = await (supabase as any).from('auction_shop').update(updatePayload).eq('id', sid);
        if (error) {
          console.error('Error updating auction_shop row', error);
          throw error;
        }
        // refresh local data so UI reflects changes
        try {
          await fetchDrafts();
          await fetchUserData();
        } catch (e) {
          // non-fatal
          console.warn('Warning: failed to refresh data after editAuction', e);
        }
        return data;
      }

      // No payload -> navigate to edit page for that auction
      navigate(`/editAuction/${String(id)}`);
      return null;
    } catch (e) {
      console.error('editAuction error', e);
      throw e;
    }
  }
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback>
                {profile?.display_name?.slice(0, 2) || user?.email?.slice(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {profile?.display_name || user?.email || 'User'}
              </h1>
              <div className="flex items-center space-x-4 mt-1">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-accent fill-current" />
                  <span className="font-semibold">{userStats.rating}</span>
                  <span className="text-muted-foreground">({userStats.reviewCount} reviews)</span>
                </div>
                <Badge variant="outline">Verified Member</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="drafts">My Drafts</TabsTrigger>
            <TabsTrigger value="management">Auction Mgmt</TabsTrigger>
            <TabsTrigger value="bids">My Bids</TabsTrigger>
            <TabsTrigger value="purchases">Purchases</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>

          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Gavel className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">{userStats.totalBids}</div>
                  <div className="text-sm text-muted-foreground">Total Bids</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <ShoppingBag className="h-8 w-8 text-success mx-auto mb-2" />
                  <div className="text-2xl font-bold">{userStats.itemsWon}</div>
                  <div className="text-sm text-muted-foreground">Items Won</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <DollarSign className="h-8 w-8 text-accent mx-auto mb-2" />
                  <div className="text-2xl font-bold">${userStats.totalSpent.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Spent</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 text-warning mx-auto mb-2" />
                  <div className="text-2xl font-bold">${userStats.totalEarned.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Earned</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bids</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {myBids.slice(0, 3).map((bid) => (
                      <div key={bid.id} className="flex items-center space-x-3">
                        <img
                          src={bid.auction_items?.image_url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'}
                          alt={bid.auction_items?.title || 'Auction Item'}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{bid.auction_items?.title || 'Auction Item'}</div>
                          <div className="text-sm text-muted-foreground">
                            Your bid: ${Number(bid.amount ?? 0).toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">Bid ID: {maskId(bid.id)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">{bid.auction_items?.end_time && new Date(bid.auction_items.end_time) > new Date() ? formatRemainingTime(bid.auction_items.end_time) : 'Ended'}</div>
                        </div>
                        {getStatusBadge(bid.status || 'active')}
                      </div>
                    ))}
                    {myBids.length === 0 && <p className="text-muted-foreground text-sm">No bids placed yet</p>}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>My Active Listings</CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="space-y-4">
                    {activeListings.filter((item) => item.status === 'active').map((listing) => (
                      <div key={listing.id} className="flex items-center space-x-3">
                        <img
                          src={listing.image_url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'}
                          alt={listing.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{listing.title}</div>
                          <div className="text-sm text-muted-foreground">
                            Current bid: ${Number(listing.current_bid ?? listing.starting_price ?? 0).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{listing.end_time && new Date(listing.end_time) > new Date() ? formatRemainingTime(listing.end_time) : 'Ended'}</div>
                        </div>
                      </div>
                    ))}
                    {activeListings.filter((item) => item.status === 'active').length === 0 && <p className="text-muted-foreground text-sm">No active listings</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* My Listings */}
          <TabsContent value="listings">
            <Card>
              <CardHeader>
                <CardTitle>My Listings</CardTitle>
                <CardDescription>Items you've posted for sale</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                {activeListings.length === 0 ? (
  <p className="text-muted-foreground">No Auctions In Drafts yet.</p>
) : (
          activeListings.map((list) => (
    <div key={list.id} className="p-4 border rounded-lg">
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <h3 className="font-semibold">{list.title}</h3>
          <div className="flex items-center space-x-4 mt-2">
          <p className="text-sm">{(list.description ?? '').replace(/<[^>]*>/g, '')}</p>            
          </div>
        </div>
        <div className="flex items-center space-x-2">
        <Button
              variant="outline"
              size="sm"
              onClick={() => editAuction(list.id)}
            >
            <Edit size={16} />
            </Button>
        <Button
              variant="outline"
              size="sm"
              onClick={() => deleteAuction(list.id)}
            >
            <Trash2 size={16} />
            </Button>
             <Button
              variant="ghost"
              size="sm"
              onClick={() => manageAuction(list.id)}
            >
              Manage Auction
            </Button>
        </div>
      </div>
    </div>
  ))
)}

                  
                </div>
              </CardContent>
            </Card>
          </TabsContent>
           <TabsContent value="drafts">
            <Card>
              <CardHeader>
                <CardTitle>My Drafts</CardTitle>
                <CardDescription>Auctions In Drafts </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                {drafts.length === 0 ? (
  <p className="text-muted-foreground">No Auctions In Drafts yet.</p>
) : (
  drafts.map((list) => (
    <div key={list.id} className="p-4 border rounded-lg">
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <h3 className="font-semibold">{list.title}</h3>
          <div className="flex items-center space-x-4 mt-2">
          <p className="text-sm">{(list.description ?? '').replace(/<[^>]*>/g, '')}</p>            
          </div>
        </div>
        <div className="flex items-center space-x-2">
        <Button
              variant="outline"
              size="sm"
              onClick={() => editAuction(list.id)}
            >
            <Edit size={16} />
            </Button>
        <Button
              variant="outline"
              size="sm"
              onClick={() => deleteAuction(list.id)}
            >
            <Trash2 size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => manageAuction(list.id)}
            >
              Manage Auction
            </Button>

        </div>
      </div>
    </div>
  ))
)}

                  
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Auction Management */}
          <TabsContent value="management">
            <AuctionManagement />
          </TabsContent>

          {/* My Bids */}
          <TabsContent value="bids">
            <Card>
              <CardHeader>
                <CardTitle>My Bids</CardTitle>
                <CardDescription>Items you've bid on</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myBids.map((bid) => {
                    const endTime = bid.auction_items?.end_time ?? null;
                    const imageUrl = bid.auction_items?.image_url[0] ?? 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400';
                    const title = bid.auction_items?.title ??  'Auction Item';
                    const current = Number(bid.auction_items?.current_bid ??  bid.auction_items?.current_price ?? 0);

                    return (
                      <div key={bid.id} className="flex flex-col space-y-2 p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <img
                            src={imageUrl}
                            alt={title}
                            className="w-20 h-20 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold">{title}</h3>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-sm">Your bid: ${Number(bid.amount ?? 0).toLocaleString()}</span>
                              <span className="text-sm">Current: ${current.toLocaleString()}</span>
                              <span className="text-sm text-muted-foreground">{endTime && new Date(endTime) > new Date() ? formatRemainingTime(endTime) : 'Ended'}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">Bid ID: {maskId(bid.id)}</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(bid.status || 'active')}
                            {bid.isLeading && (
                              <Badge className="bg-yellow-400 text-yellow-900 px-2 py-0.5 text-xs">Leading</Badge>
                            )}
                            {bid.status === 'outbid' && (
                              <Button size="sm" variant="default">Bid Again</Button>
                            )}
                          </div>
                        </div>

                        {/* NEW: If user won this bid, show seller contact info (joined from profiles table) */}
                        {bid.status === 'won' && bid.seller_profile && (
                          <div className="border-t pt-3">
                            <div className="text-sm font-medium">Seller information</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              <div>{bid.seller_profile.display_name ?? `Seller ${maskId(bid.seller_profile.user_id ?? '')}`}</div>
                              {bid.seller_profile.phone && <div>Phone: <a className="text-primary" href={`tel:${bid.seller_profile.phone}`}>{bid.seller_profile.phone}</a></div>}
                              {(bid.seller_profile.address || bid.seller_profile.city || bid.seller_profile.state || bid.seller_profile.zip_code) && (
                                <div>
                                  Address:
                                  <div className="text-xs text-muted-foreground">
                                    {bid.seller_profile.address ?? ''}{bid.seller_profile.city ? `, ${bid.seller_profile.city}` : ''}{bid.seller_profile.state ? `, ${bid.seller_profile.state}` : ''}{bid.seller_profile.zip_code ? ` ${bid.seller_profile.zip_code}` : ''}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="mt-2">
                              <Button size="sm" variant="outline" onClick={() => {
                                if (bid.seller_profile?.phone) {
                                  navigator.clipboard?.writeText(bid.seller_profile.phone).catch(() => {});
                                }
                              }}>
                                {bid.seller_profile?.phone ? 'Copy Phone' : 'Contact Seller'}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {myBids.length === 0 && <p className="text-muted-foreground">No bids placed yet. <a href="/auctions" className="text-primary hover:underline">Browse auctions</a></p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Purchases */}
          <TabsContent value="purchases">
            <Card>
              <CardHeader>
                <CardTitle>Purchase History</CardTitle>
                <CardDescription>Items you've successfully purchased</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {purchaseHistory.map((purchase) => (
                    <div key={purchase.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <img
                        src={purchase.auction_items?.image_url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'}
                        alt={purchase.auction_items?.title || 'Purchase'}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{purchase.auction_items?.title || 'Purchase'}</h3>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm">Price: ${Number(purchase.final_price ?? 0).toLocaleString()}</span>
                          <span className="text-sm text-muted-foreground">
                            {purchase.created_at ? new Date(purchase.created_at).toLocaleDateString() : ''}
                          </span>
                          <Badge variant="outline">Auction</Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">View Details</Button>
                      </div>
                    </div>
                  ))}
                  {purchaseHistory.length === 0 && <p className="text-muted-foreground">No purchases yet. <a href="/auctions" className="text-primary hover:underline">Start bidding</a></p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Profile Information</h3>
                      <p className="text-sm text-muted-foreground">Update your personal details</p>
                    </div>
                    <ProfileEditDialog profile={profile} onProfileUpdate={setProfile} />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Payment Methods</h3>
                      <p className="text-sm text-muted-foreground">Manage your payment options</p>
                    </div>
                    <PaymentMethodsDialog />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Notification Preferences</h3>
                      <p className="text-sm text-muted-foreground">Choose what notifications you receive</p>
                    </div>
                    <NotificationPreferencesDialog />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AccountPage;
// module-scoped activeId that the component can read/write
export let activeId: string | null = null;

/**
 * Sets the module-scoped activeId used by the component's edit flow.
 * Storing this at module scope keeps the implementation minimal while
 * allowing handlers inside the component to reference `activeId`.
 */
export function setActiveId(id: any) {
  activeId = id == null ? null : String(id);
}

