import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Package, Loader2 } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const CATEGORIES = [
  "Coins, Currency & Precious Metals",
  "Commercial & Industrial",
  "Farm Equipment",
  "Heavy Equipment & Construction",
  "Household, Estate & Personal Property",
  "Real Estate",
  "Sporting Goods & Hobbies",
  "Technology",
  "Vehicles & Marine",
];

const EditAuctionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin } = useAdminAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saving2, setSaving2] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    terms: "",
    payment_terms: "",
    shopAddressLine1: "",
    shopAddressLine2: "",
    shopCity: "",
    shopState: "",
    shopZip: "",
    shopCountry: "",
    shippingContactName: "",
    shippingContactPhone: "",
    standardShipping: false,
    expeditedShipping: false,
    overnightShipping: false,
    inspection_start: "",
    inspection_end: "",
    removal_start: "",
    removal_end: "",
    // Tax fields
    state_tax_rate: "",
    country_tax_rate: "",
    city_tax_rate: "",
    total_tax: "",
    transport_excise_tax_rate: "",
    misc_tax_rate: "",
  });

  // Fetch auction data
  useEffect(() => {
    
        const fetchAuction = async () => {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("auction_shop")
        .select("*")
        .eq("id", Number(id))
        .single();

      if (error) {
        console.error("Error fetching auction:", error);
        alert("Failed to load auction data.");
      } else if (data) {
        
        setFormData({
          title: data.title || "",
          description: data.description || "",
          category: data.category || "",
          terms: data.terms || "",
          payment_terms: data.payment_terms || "",
          shopAddressLine1: data.shop_address_line1 || "",
          shopAddressLine2: data.shop_address_line2 || "",
          shopCity: data.shop_city || "",
          shopState: data.shop_state || "",
          shopZip: data.shop_zip || "",
          shopCountry: data.shop_country || "",
          shippingContactName: data.shipping_contact_name || "",
          shippingContactPhone: data.shipping_contact_phone || "",
          standardShipping: data.standard_shipping || false,
          expeditedShipping: data.expedited_shipping || false,
          overnightShipping: data.overnight_shipping || false,
          inspection_start: data.inspection_start || "",
          inspection_end: data.inspection_end || "",
          removal_start: data.removal_start || "",
          removal_end: data.removal_end || "",
          state_tax_rate: data.state_tax_rate || "",
          country_tax_rate: data.country_tax_rate || "",
          city_tax_rate: data.city_tax_rate || "",
          transport_excise_tax_rate: data.transport_excise_tax_rate || "",
          misc_tax_rate: data.misc_tax_rate || "",
          total_tax: data.total_tax||"",

        });
      }
      setLoading(false);
    };

    fetchAuction();
  }, [id]);
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
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
   const publish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("You must be logged in to update this auction.");
    
    setSaving(true);
     const requiredFields = [
  "title",
  "description",
  "category",
  "terms",
  "payment_terms",
  "shopAddressLine1",
  "shopCity",
  "shopState",
  "shopZip",
  "shopCountry",
  "shippingContactName",
  "shippingContactPhone",
  "inspection_start",
  "inspection_end",
  "removal_start",
  "removal_end",
];

for (const field of requiredFields) {
  if (!formData[field] || formData[field].toString().trim() === "") {
    alert(`⚠️ ${field.replace(/_/g, " ")} is required`);
    setSaving(false);
    return;
  }
}
    const { error } = await supabase
      .from("auction_shop")
      .update({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        terms: formData.terms,
        payment_terms: formData.payment_terms,
        shop_address_line1: formData.shopAddressLine1,
        shop_address_line2: formData.shopAddressLine2,
        shop_city: formData.shopCity,
        shop_state: formData.shopState,
        shop_zip: formData.shopZip,
        shop_country: formData.shopCountry,
        shipping_contact_name: formData.shippingContactName,
        shipping_contact_phone: formData.shippingContactPhone,
        standard_shipping: formData.standardShipping,
        expedited_shipping: formData.expeditedShipping,
        overnight_shipping: formData.overnightShipping,
        inspection_start: formData.inspection_start,
        inspection_end: formData.inspection_end,
        removal_start: formData.removal_start,
        removal_end: formData.removal_end,
        state_tax_rate: formData.state_tax_rate,
        country_tax_rate: formData.country_tax_rate,
        city_tax_rate: formData.city_tax_rate,
        transport_excise_tax_rate: formData.transport_excise_tax_rate,
        misc_tax_rate: formData.misc_tax_rate,
        total_tax: formData.total_tax,
        status: "active",
      })
      .eq("id", Number(id));

    setSaving(false);

    if (error) {
      console.error("Update failed:", error);
      alert("Failed to update auction.");
    } else {
      alert("Auction updated successfully!");
      navigate("/account");
    }
  };
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("You must be logged in to update this auction.");

    setSaving2(true);
      const requiredFields = [
  "title",
  "description",
  "category",
  "terms",
  "payment_terms",
  "shopAddressLine1",
  "shopCity",
  "shopState",
  "shopZip",
  "shopCountry",
  "shippingContactName",
  "shippingContactPhone",
  "inspection_start",
  "inspection_end",
  "removal_start",
  "removal_end",
];

for (const field of requiredFields) {
  if (!formData[field] || formData[field].toString().trim() === "") {
    alert(`⚠️ ${field.replace(/_/g, " ")} is required`);
    setSaving2(false);
    return;
  }
}
    const { error } = await supabase
      .from("auction_shop")
      .update({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        terms: formData.terms,
        payment_terms: formData.payment_terms,
        shop_address_line1: formData.shopAddressLine1,
        shop_address_line2: formData.shopAddressLine2,
        shop_city: formData.shopCity,
        shop_state: formData.shopState,
        shop_zip: formData.shopZip,
        shop_country: formData.shopCountry,
        shipping_contact_name: formData.shippingContactName,
        shipping_contact_phone: formData.shippingContactPhone,
        standard_shipping: formData.standardShipping,
        expedited_shipping: formData.expeditedShipping,
        overnight_shipping: formData.overnightShipping,
        inspection_start: formData.inspection_start,
        inspection_end: formData.inspection_end,
        removal_start: formData.removal_start,
        removal_end: formData.removal_end,
        state_tax_rate: formData.state_tax_rate,
        country_tax_rate: formData.country_tax_rate,
        city_tax_rate: formData.city_tax_rate,
        transport_excise_tax_rate: formData.transport_excise_tax_rate,
        misc_tax_rate: formData.misc_tax_rate,
        total_tax: formData.total_tax,
      })
      .eq("id", Number(id));


    setSaving2(false);

    if (error) {
      console.error("Update failed:", error);
      alert("Failed to update auction.");
    } else {
      alert("Auction updated successfully!");
      navigate("/account");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
          <p className="text-muted-foreground">Loading auction details...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-foreground mb-2">Edit Auction</h1>
          <p className="text-muted-foreground">Update your auction details below</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" /> Edit Auction Details
            </CardTitle>
            <CardDescription>Modify your auction details below</CardDescription>
          </CardHeader>

          <CardContent>
            <form className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Auction Name</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Auction title"
                  />
                </div>

                <div>
                  <Label>Category</Label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    className="w-full border rounded-md px-3 py-2 bg-background"
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid grid-cols-5">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="shipping">Contact</TabsTrigger>
                  <TabsTrigger value="terms">Terms</TabsTrigger>
                  <TabsTrigger value="payment">Payment</TabsTrigger>
                  <TabsTrigger value="tax">Tax</TabsTrigger>
                </TabsList>

                {/* DETAILS TAB */}
                <TabsContent value="details" className="space-y-6">
                  <div>
                    <Label>Description</Label>
                    <ReactQuill
                      theme="snow"
                      value={formData.description}
                      onChange={(val) => handleInputChange("description", val)}
                      className="bg-white rounded-md border"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Inspection Start</Label>
                      <Input
                        type="datetime-local"
                        value={formData.inspection_start}
                        onChange={(e) => handleInputChange("inspection_start", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Inspection End</Label>
                      <Input
                        type="datetime-local"
                        value={formData.inspection_end}
                        onChange={(e) => handleInputChange("inspection_end", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Removal Start</Label>
                      <Input
                        type="datetime-local"
                        value={formData.removal_start}
                        onChange={(e) => handleInputChange("removal_start", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Removal End</Label>
                      <Input
                        type="datetime-local"
                        value={formData.removal_end}
                        onChange={(e) => handleInputChange("removal_end", e.target.value)}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* SHIPPING TAB */}
                <TabsContent value="shipping" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<div>
                    <Label>Contact Name</Label>
                    <Input
                      value={formData.shippingContactName}
                      onChange={(e) => handleInputChange("shippingContactName", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Contact Phone</Label>
                    <Input
                      value={formData.shippingContactPhone}
                      onChange={(e) => handleInputChange("shippingContactPhone", e.target.value)}
                    />
                  </div> <div>
                    <Label>Shop Address Line 1 </Label>
                    <Input
                      value={formData.shopAddressLine1}
                      onChange={(e) => handleInputChange("shopAddressLine1", e.target.value)}
                    />
                  </div> <div>
                    <Label>Shop Address Line 2 (Optional)</Label>
                    <Input
                      value={formData.shopAddressLine2}
                      onChange={(e) => handleInputChange("shopAddressLine2", e.target.value)}
                    />
                  </div> <div>
                    <Label>Zip / Postal</Label>
                    <Input
                      value={formData.shopZip}
                      onChange={(e) => handleInputChange("shopZip", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Country</Label>
                    <Input
                      value={formData.shopCountry}
                      onChange={(e) => handleInputChange("shopCountry", e.target.value)}
                    />
                  </div>
                    <div>
                    <Label>City</Label>
                    <Input
                      value={formData.shopCity}
                      onChange={(e) => handleInputChange("shopCity", e.target.value)}
                    />
                  </div>
                   <div>
                    <Label>State</Label>
                    <Input
                      value={formData.shopState}
                      onChange={(e) => handleInputChange("shopState", e.target.value)}
                    />
                  </div>

                  </div>
                   <div className="mt-4">
        <Label>Map</Label>
        <iframe
          title="Shop Location Map"
          width="100%"
          height="300"
          style={{ borderRadius: "12px", border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps?q=${encodeURIComponent(
            `${formData.shopAddressLine1 || formData.shopAddressLine2 || ""} ${formData.shopCity || ""} ${formData.shopCountry || ""}`
          )}&output=embed`}
        ></iframe>
      </div>
                
                </TabsContent>

                {/* TERMS TAB */}
                <TabsContent value="terms">
                  <Label>Terms & Conditions</Label>
                  <ReactQuill
                    theme="snow"
                    value={formData.terms}
                    onChange={(val) => handleInputChange("terms", val)}
                    className="bg-white rounded-md border"
                  />
                </TabsContent>

                {/* PAYMENT TERMS TAB */}
                <TabsContent value="payment">
                  <Label>Payment Terms</Label>
                  <ReactQuill
                    theme="snow"
                    value={formData.payment_terms}
                    onChange={(val) => 
                        handleInputChange("payment_terms", val) }
                    className="bg-white rounded-md border"
                  />
                </TabsContent>

                {/* TAX TAB */}
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
                      onChange={(e) => {handleInputChange("country_tax_rate", e.target.value);calculateTotalTax();}}
                      placeholder="e.g. 0.15"
                    />
                  </div>
                  <div>
                    <Label>City Tax Rate</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.city_tax_rate}
                      onChange={(e) =>{ handleInputChange("city_tax_rate", e.target.value);calculateTotalTax()}}
                      placeholder="e.g. 1.25"
                    />
                  </div>
                  <div>
                    <Label>Transport / Excise Tax Rate</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.transport_excise_tax_rate}
                      onChange={(e) => {handleInputChange("transport_excise_tax_rate", e.target.value);calculateTotalTax();}}
                      placeholder="e.g. 1.25"
                    />
                  </div>
                  <div>
                    <Label>Miscellaneous Tax Rate</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.misc_tax_rate}
                      onChange={(e) =>{ 
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
              </Tabs>

              <div className="pt-4 flex justify-end">
                   <Button onClick={publish} variant="outline" className="px-6 " disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Publish Auction"
                  )}
                </Button>
                <Button onClick={handleUpdate} className="px-6 ml-3" disabled={saving2}>
                  {saving2 ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Auction As Draft"
                  )}
                </Button>
             
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditAuctionPage;
