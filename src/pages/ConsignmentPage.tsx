import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, TrendingUp, Truck, DollarSign, CheckCircle, CreditCard } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
// import { count } from "console";
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];


const CATEGORIES = [
  'Coins, Currency & Precious Metals',
  'Commercial & Industrial',
  'Farm Equipment',
  'Heavy Equipment & Construction',
  'Household, Estate & Personal Property',
  'Real Estate',
  'Sporting Goods & Hobbies',
  'Technology',
  'Vehicles & Marine'
];


// Same tiered listing fee as SellPage
const calculateListingFee = (quantity: number) => {
  if (quantity >= 51 && quantity <= 100) return 10.0;
  if (quantity >= 11 && quantity <= 50) return 5.0;
  return 2.99;
};

const ConsignmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminAuth();

  const [loading, setLoading] = useState(false);

  const isAdminFlag = (() => {
    if (typeof isAdmin === 'boolean') return isAdmin;
    if (typeof isAdmin === 'number') return isAdmin > 0;
    const s = String(isAdmin || '').trim().toLowerCase();
    if (!s || s === 'false' || s === '0' || s === 'null' || s === 'undefined') return false;
    return ['true', '1', 'admin', '2'].includes(s);
  })();

  const [formData, setFormData] = useState({
    itemName: "",
    description: "",
    terms: `<p><strong>For Questions?</strong> Please call 952-486-2318</p>

  <p><strong>Payment Types Accepted:</strong> We accept Cash, Check, and all major CC's up to $5,000. Wire transfer required over $10,000.</p>

  <p><strong>Removal:</strong> Items are to be removed during the scheduled removal date. Late removals should not be assumed. A $25 fee will apply to alternative removal times without prior approval. Items paid for and not removed within 14 days will be considered abandoned, and no refunds will be issued.</p>

  <p><strong>Shipping:</strong> Please view the shipping tab for more information, and always look to see if an item is shippable before bidding.</p>

  <p><strong>Disclosure:</strong> Everything is sold "as is, where is" with no guarantees or warranties. You are responsible for inspecting items prior to purchase. Photos are provided for your convenience and do not provide a guarantee or warranty. Every effort is made to provide an accurate description and condition of the item; however, it is the bidder's responsibility to verify condition, quality, count, dimensions, etc. during their own personal inspection.</p>`,
    paymentTerms: ` <p><strong>Accepted Payment Methods:</strong><br>
  We accept <strong>Cash, Bank Transfer, and all major Credit/Debit Cards (Visa, MasterCard, American Express)</strong>.</p>

  <p><strong>Payment Deadline:</strong><br>
  Full payment must be received <strong>within 3 business days</strong> of invoice or auction close.</p>

  <p><strong>Wire Transfers:</strong><br>
  Wire transfers are <strong>required for invoices over $10,000</strong>. Buyer is responsible for any bank fees.</p>

  <p><strong>Checks:</strong><br>
  Personal or business checks are accepted but must clear before items are released.</p>

  <p><strong>Late Payments:</strong><br>
  A <strong>5% late fee</strong> may be applied to invoices not paid by the due date.</p>

  <p><strong>Sales Tax:</strong><br>
  Applicable taxes will be added to all invoices unless a valid resale or tax-exempt certificate is provided prior to payment.</p>

  <p><strong>Refunds:</strong><br>
  All sales are <strong>final</strong>. Refunds will only be issued in cases of verified billing errors.</p>`,
    category: "",
    estimatedValue: "",
    inspection_start: "",
    inspection_end: "",
    removal_start: "",
    removal_end: "",
    condition: "",

    // pickup
    pickupAddressLine1: "",
    pickupAddressLine2: "",
    pickupCity: "",
    pickupState: "",
    pickupZip: "",
    pickupCountry: "",
    pickupLandmark: "",

    state_tax_rate: "",
    country_tax_rate: "",
    city_tax_rate: "",
    total_tax: "",
    transport_excise_tax_rate: "",
    misc_tax_rate: "",

    contactPersonName: "",
    contactPhone: "",
    alternativeContact: "",

    idRequired: false,
    proofOfPurchaseRequired: false,
    notesForBuyer: "",

    // quantity for listing fee

    // auction shipping policy fields
    standardShipping: false,
    expeditedShipping: false,
    overnightShipping: false,
    shippingCostPolicy: "",
    shipping_contact_name: "",
    shipping_contact_phone: "",

    // shop location fields
    shopAddressLine1: "",
    shopAddressLine2: "",
    shopCity: "",
    shopState: "",
    shopZip: "",
    shopCountry: "",
    pickupInstructions: ""
  });

  useEffect(() => {
    window.scrollTo(0, 0);

  }, []);
  const calculateTotalTax = () => {
    const total = parseFloat(formData.state_tax_rate) +
      parseFloat(formData.country_tax_rate) +
      parseFloat(formData.city_tax_rate) +
      parseFloat(formData.transport_excise_tax_rate) +
      parseFloat(formData.misc_tax_rate);
    console.log("Total tax calculated:", total);
    setFormData((prev) => ({ ...prev, total_tax: total.toFixed(3) }));
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };



  const toggleBoolean = (field: 'idRequired' | 'proofOfPurchaseRequired') => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // const handleFiles = (files: File[]) => {
  //   setFormData(prev => ({ ...prev, photos: files }));
  // };

  // const currentListingFee = calculateListingFee(Number(formData.quantity || 1));

  // When non-admin: call remote function to create checkout link
  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!user) {
  //     navigate('/login');
  //     return;
  //   }

  //   if (isAdminFlag) {
  //     await handleConfirmPayment();
  //     return;
  //   }

  //   try {
  //     const { data, error } = await supabase.functions.invoke('calculate-listing-fee', {
  //       body: { quantity: formData.quantity, itemTitle: formData.itemName }
  //     });

  //     if (error) {
  //       console.error('listing fee function error', error);
  //       alert('Failed to process payment. Please try again.');
  //       return;
  //     }

  //     if (data?.url) window.open(data.url, '_blank');
  //     else {
  //       console.error('No URL returned from listing fee function:', data);
  //       alert('Payment provider did not return a checkout URL.');
  //     }
  //   } catch (err) {
  //     console.error('Error calling listing fee function:', err);
  //     alert('An error occurred while creating payment.');
  //   }
  // };

  // Admin flow: prepare payload but DO NOT insert into DB (per request)
  //   const handleConfirmPayment = async () => {
  //     if (!user) {
  //       alert('User must be logged in.');
  //       return;
  //     }

  //     if (!formData.itemName?.trim()) {
  //       alert('Please enter an Auction name.');
  //       return;
  //     }


  //     try {
  //       // minimal validation passed
  //       const listingFee = calculateListingFee(Number(formData.quantity));
  //       const consignmentStatus = isAdminFlag ? 'approved' : 'pending';

  //       const insertPayload: any = {
  //         title: formData.itemName,
  //         description: formData.description || null,
  //         category: formData.category || null,
  //         condition: formData.condition || null,
  //         starting_price: null,
  //         end_time: null,
  //         shopowner_id: user.id,
  //         status: 'active',
  //         consignment_status: consignmentStatus,
  //         listing_fee: listingFee,
  //         commission_rate: 15.0,
  //         listing_fee_paid: isAdminFlag ? true : false
  //       };

  //       // DB insertion removed — log payload and continue
  //       console.log('Admin Site Prepared consignment payload (DB insertion removed):', insertPayload);
  // // const { data, error } = await supabase
  // //     .from('profiles')
  // //     .insert([insertPayload]) // 👈 array of objects

  // //   if (error) {
  // //     console.error('Insert error:', error)
  // //   } else {
  // //     console.log('Inserted successfully:', data)
  // //   }
  //       // Optionally send this payload to your server / webhook here.
  //       // Example: await fetch('/api/queue-consignment', { method: 'POST', body: JSON.stringify(insertPayload) });

  //       // Navigate back to account (or choose another UX: show success message, clear form, etc.)
  //       navigate('/account');
  //     } catch (err) {
  //       console.error('Error while preparing consignment payload:', err);
  //       alert('An unexpected error occurred. See console for details.');
  //     }


  //   };
  const handleSubmission = async (e) => {
    e.preventDefault();
     setLoading(true);

    if (!user) {
      alert("User must be logged in.");
      return;
    }

    if (!formData.itemName?.trim()) {
      alert("Please enter an item name.");
      return;
    }



    // ✅ Upload multiple images



    // ✅ Prepare DB payload
    try {

      const insertPayload: any = {
        title: formData.itemName,
        description: formData.description || null,
        category: formData.category || null,
        condition: formData.condition || null,
        start_time: null,
        current_price: formData.estimatedValue || null,
        inspection_start: formData.inspection_start || null,
        inspection_end: formData.inspection_end || null,
        removal_start: formData.removal_start || null,
        removal_end: formData.removal_end || null,
        starting_price: formData.estimatedValue || null,
        end_time: null,
        shopowner_id: user.id,
        state_tax_rate: formData.state_tax_rate,
        country_tax_rate: formData.country_tax_rate,
        city_tax_rate: formData.city_tax_rate,
        total_tax: formData.total_tax,
        transport_excise_tax_rate: formData.transport_excise_tax_rate,
        misc_tax_rate: formData.misc_tax_rate,
        status: "draft",
        terms: formData.terms,
        shipping_contact_phone: formData.shipping_contact_phone,
        shipping_contact_name: formData.shipping_contact_name,
        shop_address_line1: formData.shopAddressLine1,
        shop_address_line2: formData.shopAddressLine2,
        shop_city: formData.shopCity,
        shop_country: formData.shopCountry,
        shop_state: formData.pickupState,
        shop_zip: formData.pickupZip,
        payment_terms: formData.paymentTerms,
        listing_fee: 0.0,
        commission_rate: 15.0,
        listing_fee_paid: isAdminFlag ? true : false,
      };
      console.log("Prepared consignment payload:", insertPayload);



      const { data, error } = await supabase
        .from("auction_shop")
        .insert([insertPayload]);


      if (error) {
        console.error("Insert error:", error);
        alert("Database insert failed!");
      } else {

        navigate("/account");
      }

      setLoading(false);

    } catch (err) {
      console.error("Error while preparing consignment payload:", err);
      alert("An unexpected error occurred. See console for details.");
    }
  };

  const [inspectionByAppt, setInspectionByAppt] = useState(false);
  const [preventSameDayCancel, setPreventSameDayCancel] = useState(true);
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Sell Your Consignment</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Let Auction Planet handle everything - from professional listing to worldwide shipping.
          </p>
        </div>

        <Tabs defaultValue="submit" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="submit">Upload Shop</TabsTrigger>
            <TabsTrigger value="monitor">Monitor Sales</TabsTrigger>
            <TabsTrigger value="how-it-works">How It Works</TabsTrigger>
          </TabsList>

          <TabsContent value="submit">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" /> Submit Your Auction for Consignment
                </CardTitle>
                <CardDescription>Provide details about your Auction and we'll handle the rest - from photography to shipping.</CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmission} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="itemName">Auction Name</Label>
                      <Input id="itemName" value={formData.itemName} onChange={(e) => handleInputChange('itemName', e.target.value)} placeholder="e.g., Vintage Rolex Submariner" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(v) => handleInputChange('category', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid grid-cols-5 w-full">
                      <TabsTrigger value="details">Shop Details</TabsTrigger>
                      <TabsTrigger value="shipping">Contact Details</TabsTrigger>
                      <TabsTrigger value="security">Terms</TabsTrigger>
                      <TabsTrigger value="payment">Payment Terms</TabsTrigger>
                      <TabsTrigger value="tax">Tax</TabsTrigger>

                    </TabsList>

                    {/* --- TAB 1: ITEM DETAILS --- */}
                    <TabsContent value="details" className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="description">Auction Description</Label>
                        {/* id="description" value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} rows={4} */}
                        <ReactQuill
                          theme="snow"
                          value={formData.description}
                          id="description"
                          onChange={(e) => handleInputChange("description", e)}
                          placeholder="Provide detailed information about your item"
                          modules={{
                            toolbar: [
                              [{ header: [1, 2, false] }],
                              ["bold", "italic", "underline", "strike"],
                              [{ list: "ordered" }, { list: "bullet" }],
                              ["link", "image"],
                              ["clean"],
                            ],
                          }}
                          className="bg-white rounded-md border border-gray-300"
                        />
                      </div>


                    </TabsContent>

                    {/* --- TAB 2: PICKUP --- */}
                    {/* <TabsContent value="pickup" className="space-y-6">
        <div className="p-4 border rounded-lg space-y-4 bg-white">
          <h3 className="font-semibold text-lg">Pickup Location Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Address Line 1</Label>
              <Input
                value={formData.pickupAddressLine1}
                onChange={(e) => handleInputChange("pickupAddressLine1", e.target.value)}
              />
            </div>
            <div>
              <Label>Address Line 2 (optional)</Label>
              <Input
                value={formData.pickupAddressLine2}
                onChange={(e) => handleInputChange("pickupAddressLine2", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>City</Label>
              <Input
                value={formData.pickupCity}
                onChange={(e) => handleInputChange("pickupCity", e.target.value)}
              />
            </div>
            <div>
              <Label>State/Province</Label>
              <Input
                value={formData.pickupState}
                onChange={(e) => handleInputChange("pickupState", e.target.value)}
              />
            </div>
            <div>
              <Label>ZIP/Postal Code</Label>
              <Input
                value={formData.pickupZip}
                onChange={(e) => handleInputChange("pickupZip", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Country</Label>
              <Input
                value={formData.pickupCountry}
                onChange={(e) => handleInputChange("pickupCountry", e.target.value)}
              />
            </div>
            <div>
              <Label>Landmark / Directions (optional)</Label>
              <Input
                value={formData.pickupLandmark}
                onChange={(e) => handleInputChange("pickupLandmark", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Pickup Availability</Label>
            <div className="mt-2">
              <div className="text-sm text-muted-foreground mb-2">Available Days</div>
              <div className="flex flex-wrap gap-3">
                {DAYS.map((d) => (
                  <label key={d} className="inline-flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.availableDays.includes(d)}
                      onChange={() => toggleDay(d)}
                    />
                    <span className="text-sm">{d}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={formData.pickupStartTime}
                  onChange={(e) => handleInputChange("pickupStartTime", e.target.value)}
                />
              </div>
              <div>
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={formData.pickupEndTime}
                  onChange={(e) => handleInputChange("pickupEndTime", e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4">
              <Label>Special Instructions (optional)</Label>
              <Input
                value={formData.pickupSpecialInstructions}
                onChange={(e) =>
                  handleInputChange("pickupSpecialInstructions", e.target.value)
                }
                placeholder='e.g., "Call 15 min before arrival"'
              />
            </div>
          </div>
        </div>
      </TabsContent> */}

                    {/* --- TAB 2: SHIPPING --- */}
                    <TabsContent value="shipping" className="space-y-6">
                      <div className="p-4 border rounded-lg space-y-4 bg-white">

                        {/* Shipping Availability */}


                        {/* Shipping Methods */}


                        {/* Shipping Costs */}


                        {/* International Shipping */}


                        {/* Shipping Restrictions */}


                        {/* Shop Location */}
                        <div className="space-y-4">
                          <h4 className="font-medium">Shop Location</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Address Line 1</Label>
                              <Input
                                value={formData.shopAddressLine1 || ""}
                                onChange={(e) => handleInputChange("shopAddressLine1", e.target.value)}
                                placeholder="Street address"
                              />
                            </div>
                            <div>
                              <Label>Address Line 2 (optional)</Label>
                              <Input
                                value={formData.shopAddressLine2 || ""}
                                onChange={(e) => handleInputChange("shopAddressLine2", e.target.value)}
                                placeholder="Suite, unit, etc."
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>City</Label>
                              <Input
                                value={formData.shopCity || ""}
                                onChange={(e) => handleInputChange("shopCity", e.target.value)}
                                placeholder="City"
                              />
                            </div>
                            <div>
                              <Label>State/Province</Label>
                              <Input
                                value={formData.pickupState || ""}
                                onChange={(e) => handleInputChange("pickupState", e.target.value)}
                                placeholder="State"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>ZIP/Postal Code</Label>
                              <Input
                                value={formData.pickupZip || ""}
                                onChange={(e) => handleInputChange("pickupZip", e.target.value)}
                                placeholder="ZIP code"
                              />
                            </div>
                            <div>
                              <Label>Country</Label>
                              <Input
                                value={formData.shopCountry || ""}
                                onChange={(e) => handleInputChange("shopCountry", e.target.value)}
                                placeholder="Country"
                              />
                            </div>
                          </div>

                        </div>

                        {/* Shipping Contact */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Contact Name</Label>
                            <Input
                              value={formData.shipping_contact_name || ""}
                              onChange={(e) => handleInputChange("shipping_contact_name", e.target.value)}
                              placeholder="Contact person for shipping questions"
                            />
                          </div>
                          <div>
                            <Label>Contact Phone</Label>
                            <Input
                              value={formData.shipping_contact_phone || ""}
                              onChange={(e) => handleInputChange("shipping_contact_phone", e.target.value)}
                              placeholder="Phone number for shipping inquiries"
                            />
                          </div>

                        </div>
                        {/* <div className="mt-4">
        <Label>Map Preview</Label>
        <iframe
          title="Shop Location Map"
          width="100%"
          height="300"
          style={{ borderRadius: "12px", border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps?q=${encodeURIComponent(
            `${formData.shopAddressLine1 || ""} ${formData.shopCity || ""} ${formData.shopCountry || ""}`
          )}&output=embed`}
        ></iframe>
      </div> */}
                      </div>
                    </TabsContent>
                    <TabsContent value="tax" className="space-y-4">
                      {/* <div className="flex justify-between items-center">
    <Label className="text-lg font-semibold">Bid Increments</Label>
    <Button
      type="button"
      onClick={() =>
        handleInputChange("bidIncrements", [
          ...(formData.bidIncrements || []),
          { price: "", increment: "" },
        ])
      }
    >
      + Add Row
    </Button>
  </div> */}

                      {/* <div className="overflow-x-auto border rounded-lg">
    <table className="w-full text-sm">
      <thead className="bg-muted text-muted-foreground">
        <tr>
          <th className="text-left px-4 py-2">Price</th>
          <th className="text-left px-4 py-2">Increment</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {(formData.bidIncrements || []).map((row, index) => (
          <tr key={index} className="border-t">
            <td className="px-4 py-2">
              <Input
                type="number"
                step="0.01"
                value={row.price}
                onChange={(e) => {
                  const newRows = [...(formData.bidIncrements || [])];
                  newRows[index].price = e.target.value;
                  handleInputChange("bidIncrements", newRows);
                }}
                placeholder="Price"
              />
            </td>
            <td className="px-4 py-2">
              <Input
                type="number"
                step="0.01"
                value={row.increment}
                onChange={(e) => {
                  const newRows = [...(formData.bidIncrements || [])];
                  newRows[index].increment = e.target.value;
                  handleInputChange("bidIncrements", newRows);
                }}
                placeholder="Increment"
              />
            </td>
            <td className="px-4 py-2 text-right">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  const newRows = formData.bidIncrements.filter(
                    (_, i) => i !== index
                  );
                  handleInputChange("bidIncrements", newRows);
                }}
              >
                Remove
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div> */}
                      <div>
                        <Label>State Tax Rate</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.state_tax_rate}
                          onChange={(e) => {
                            handleInputChange("state_tax_rate", e.target.value);
                            calculateTotalTax();
                          }}
                          placeholder="e.g. 6.875"
                        />

                      </div>
                      <div>
                        <Label>Country Tax Rate</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.country_tax_rate}
                          onChange={(e) => { handleInputChange("country_tax_rate", e.target.value); calculateTotalTax(); }}
                          placeholder="e.g. 0.15"
                        />
                      </div>
                      <div>
                        <Label>City Tax Rate</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.city_tax_rate}
                          onChange={(e) => { handleInputChange("city_tax_rate", e.target.value); calculateTotalTax() }}
                          placeholder="e.g. 1.25"
                        />
                      </div>
                      <div>
                        <Label>Transport / Excise Tax Rate</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.transport_excise_tax_rate}
                          onChange={(e) => { handleInputChange("transport_excise_tax_rate", e.target.value); calculateTotalTax(); }}
                          placeholder="e.g. 1.25"
                        />
                      </div>
                      <div>
                        <Label>Miscellaneous Tax Rate</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.misc_tax_rate}
                          onChange={(e) => {
                            handleInputChange("misc_tax_rate", e.target.value);
                            calculateTotalTax();
                          }}
                          placeholder="e.g. 0.25"
                        />
                      </div>
                      <div>
                        <Label>Total Tax</Label>
                        <Input
                          type="number"
                          value={formData.total_tax}
                          onChange={(e) => handleInputChange("total_tax", e.target.value)}
                          disabled
                          placeholder="e.g. 0.25"
                        />
                      </div>
                    </TabsContent>
                    {/* --- TAB 4: SECURITY --- */}
                    <TabsContent value="security" className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="terms">Terms</Label>
                        {/* id="description" value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} rows={4} */}
                        <ReactQuill
                          theme="snow"
                          value={formData.terms}
                          id="terms"
                          onChange={(e) => handleInputChange("terms", e)}
                          placeholder="Terms and Condition of your Auction"
                          modules={{
                            toolbar: [
                              [{ header: [1, 2, false] }],
                              ["bold", "italic", "underline", "strike"],
                              [{ list: "ordered" }, { list: "bullet" }],
                              ["link", "image"],
                              ["clean"],
                            ],
                          }}
                          className="bg-white rounded-md border border-gray-300"
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="payment" className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="paymentTerms">Payment Terms</Label>
                        {/* id="description" value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} rows={4} */}
                        <ReactQuill
                          theme="snow"
                          value={formData.paymentTerms}
                          id="paymentTerms"
                          onChange={(e) => handleInputChange("paymentTerms", e)}
                          placeholder="Payment Terms and Condition"
                          modules={{
                            toolbar: [
                              [{ header: [1, 2, false] }],
                              ["bold", "italic", "underline", "strike"],
                              [{ list: "ordered" }, { list: "bullet" }],
                              ["link", "image"],
                              ["clean"],
                            ],
                          }}
                          className="bg-white rounded-md border border-gray-300"
                        />
                      </div>


                    </TabsContent>
                    {/* --- TAB 5: SUMMARY / PAYMENT --- */}
                  </Tabs>
                  <div className="p-2 space-y-6 ">
                    {/* Auction Schedule */}
                    <Accordion type="single" collapsible defaultValue="auction">


                      {/* Inspection Schedule */}
                      <AccordionItem value="inspection">
                        <AccordionTrigger>Inspection Schedule</AccordionTrigger>
                        <AccordionContent className="space-y-4">
                          <div>
                            <Label>Start</Label>
                            <Input value={formData.inspection_start}
                              onChange={(e) => handleInputChange("inspection_start", e.target.value)} type="datetime-local" />
                          </div>
                          <div>
                            <Label>End</Label>
                            <Input value={formData.inspection_end}
                              onChange={(e) => handleInputChange("inspection_end", e.target.value)} type="datetime-local" />
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Removal Schedule */}
                      <AccordionItem value="removal">
                        <AccordionTrigger>Removal Schedule</AccordionTrigger>
                        <AccordionContent className="space-y-4">
                          <div>
                            <Label>Start</Label>
                            <Input value={formData.removal_start}
                              onChange={(e) => handleInputChange("removal_start", e.target.value)} type="datetime-local" />
                          </div>
                          <div>
                            <Label>End</Label>
                            <Input value={formData.removal_end}
                              onChange={(e) => handleInputChange("removal_end", e.target.value)} type="datetime-local" />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>

                  {/* Listing fee card (for non-admins) */}
                  {/* {adminLoading ? null : !isAdminFlag && (
                    <Card className="border-warning bg-warning/5">
                      <CardContent className="pt-6">
                        <div className="flex items-start space-x-3">
                          <CreditCard className="h-5 w-5 text-warning mt-0.5" />
                          <div>
                            <h3 className="font-medium text-foreground mb-1">Listing Fee & Commission</h3>
                            <p className="text-sm text-muted-foreground mb-2">Listing fee for {formData.quantity} item{Number(formData.quantity) > 1 ? 's' : ''}: <strong>${currentListingFee.toFixed(2)}</strong></p>
                            <p className="text-sm text-muted-foreground mb-3">Plus 15% commission on successful sales.</p>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline">✓ Fraud protection</Badge>
                              <Badge variant="outline">✓ Professional handling</Badge>
                              <Badge variant="outline">✓ Dedicated support</Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )} */}

                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">What happens next?</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• We'll review your submission within 24 hours</li>
                      <li>• If accepted, we'll provide shipping instructions</li>
                      <li>• Our experts will authenticate and professionally photograph your item</li>
                      <li>• We'll create an optimized listing and handle all bidding</li>
                      <li>• After sale, we manage payment and worldwide shipping</li>
                    </ul>
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" variant="outline" className="flex-1" disabled={loading}>{loading ? 'Processing...' : 'Save as Draft'}</Button>

                    {/* {adminLoading ? (
                      <Button type="button" className="flex-1" disabled>Checking permissions...</Button>
                    ) : isAdminFlag ? (
                      <Button type="button" className="flex-1" onClick={handleConfirmPayment}>Approve & Post Consignment</Button>
                    ) : (
                      <Button type="submit" className="flex-1">Pay ${currentListingFee.toFixed(2)} & Submit Consignment</Button>
                    )} */}
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitor">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Your Consignment Dashboard</CardTitle>
                <CardDescription>Track your items, monitor sales, and view payouts.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">{/* Placeholder: implement dashboard fetching elsewhere */}
                  <div className="text-sm text-muted-foreground">No active consignments to show here in this demo.</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="how-it-works">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Package className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">1. Submit Your Item</h3>
                  <p className="text-sm text-muted-foreground">Tell us about your item and upload photos. Our experts will review within 24 hours.</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">2. Ship to Us</h3>
                  <p className="text-sm text-muted-foreground">We provide insured shipping labels. Send your item to our secure facility.</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Truck className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">3. Lookup &amp; Pickup</h3>
                  <p className="text-sm text-muted-foreground">Buyers can look up listings and choose local pickup when available — an easy option for nearby buyers.</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">4. We Handle Sales</h3>
                  <p className="text-sm text-muted-foreground">Professional photos, authentication, listing optimization, and auction management.</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <DollarSign className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">5. Get Paid</h3>
                  <p className="text-sm text-muted-foreground">Receive your payout within 5 business days after the sale completes.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ConsignmentPage;
