import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import DataTable from "react-data-table-component";
import { Plus, Edit, Trash2, Search, Upload, Info } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@radix-ui/react-tabs";

const ManageAuctionShopPage = () => {
  const { auctionId } = useParams();
  const { user } = useAuth();

  const [lots, setLots] = useState([]);
  const [filteredLots, setFilteredLots] = useState([]);
  const [search, setSearch] = useState("");
  const [auctionShop, setAuctionShop] = useState<any>(null);

  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [editLot, setEditLot] = useState<any>(null);
  const [newLot, setNewLot] = useState({
    title: "",
    description: "",
    category: "",
    condition: "",
    startingBid: "",
    reservePrice: "",
    buyNowPrice: "",
    start_date: "",
    end_date: "",
    location: "",
    shippingOption: "",
    shipping_cost: "",
  });

  const [images, setImages] = useState([]);
  const [editImages, setEditImages] = useState([]);

  // Fetch Auction Details + Lots
  useEffect(() => {
    if (auctionId) {
      fetchAuctionShop();
      showLots();
    }
  }, [auctionId]);

  const fetchAuctionShop = async () => {
    const { data, error } = await supabase
      .from("auction_shop")
      .select("*")
      .eq("id", Number(auctionId))
      .single();

    if (error) {
      console.error("Auction Fetch Error:", error);
      alert("Auction not found or unavailable!");
    } else {
      setAuctionShop(data);
    }
  };

  const showLots = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("lots")
      .select("*")
      .eq("auction_id", Number(auctionId));
    if (error) console.error("Error fetching lots:", error);
    else {
      setLots(data || []);
      setFilteredLots(data || []);
    }
    setLoading(false);
  };

  // Image Upload
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length < 5) {
      alert("Please select at least 5 images!");
      return;
    }
    setImages(files);
  };

  const handleEditFileChange = (e) => {
    const files = Array.from(e.target.files);
    setEditImages(files);
  };

  // Add Lot
  const addLots = async () => {
    setLoading(true);

    try {
      if (!newLot.title || !newLot.startingBid) {
        alert("Title and Starting Bid are required!");
        return;
      }

      if (images.length < 5) {
        alert("Please upload at least 5 images!");
        return;
      }

      const imageUrls: string[] = [];

      for (const image of images) {
        const fileName = `${Date.now()}_${image.name}`;
        const { error: uploadError } = await supabase.storage
          .from("listing-images")
          .upload(fileName, image);

        if (uploadError) {
          console.error("Upload Error:", uploadError);
          alert("Error uploading image(s)!");
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("listing-images")
          .getPublicUrl(fileName);

        imageUrls.push(publicUrlData.publicUrl);
      }

      const insertPayload: any = {
        auction_id: Number(auctionId),
        title: newLot.title,
        description: newLot.description,
        category: newLot.category,
        condition: newLot.condition,
        starting_bid: parseFloat(newLot.startingBid),
        reserve_price: newLot.reservePrice
          ? parseFloat(newLot.reservePrice)
          : null,
        buy_now_price: newLot.buyNowPrice
          ? parseFloat(newLot.buyNowPrice)
          : null,
        image_urls: JSON.stringify(imageUrls),
        start_date: newLot.start_date || null,
        end_date: newLot.end_date || null,
        location: newLot.location || null,
        seller_id: user?.id || null,
        shipping_option: newLot.shippingOption || null,
        shipping_cost: newLot.shipping_cost
          ? parseFloat(newLot.shipping_cost)
          : 0,
      };

      const { error } = await supabase.from("lots").insert([insertPayload]);

      if (error) {
        console.error("Insert Error:", error);
        alert("Error adding lot!");
      } else {
        alert("Lot added successfully!");
        setOpen(false);
        showLots();
        resetNewLot();
      }
    } catch (err) {
      console.error("Unexpected Error:", err);
      alert("Unexpected error while adding lot!");
    } finally {
      setLoading(false);
    }
  };

  const resetNewLot = () => {
    setNewLot({
      title: "",
      description: "",
      category: "",
      condition: "",
      startingBid: "",
      reservePrice: "",
      buyNowPrice: "",
      start_date: "",
      end_date: "",
      location: "",
      shippingOption: "",
      
      shipping_cost: "",
    });
    setImages([]);
  };

  // Delete Lot
  const handleDeleteLot = async (id) => {
    if (!confirm("Are you sure you want to delete this lot?")) return;
    const { error } = await supabase.from("lots").delete().eq("id", id);
    if (error) {
      console.error("Error deleting lot:", error);
      alert("Something went wrong while deleting!");
    } else {
      alert("Lot deleted successfully!");
      showLots();
    }
  };

  // Edit Lot
  const openEditDialog = (lot) => {
    // Ensure image_urls is always an array
    const safeLot = {
      ...lot,
      image_urls: Array.isArray(lot.image_urls)
        ? lot.image_urls
        : lot.image_urls
        ? JSON.parse(lot.image_urls)
        : [],
    };
    setEditLot(safeLot);
    setEditImages([]);
    setEditOpen(true);
  };

  const updateLot = async () => {
    setLoading(true);
    if (!editLot.title || !editLot.starting_bid) {
      alert("Title and Starting Bid are required!");
      return;
    }

    try {
      let imageUrls = Array.isArray(editLot.image_urls)
        ? editLot.image_urls
        : editLot.image_urls
        ? JSON.parse(editLot.image_urls)
        : [];

      if (editImages.length > 0) {
        const uploadedUrls = [];
        for (const image of editImages) {
          const fileName = `${Date.now()}_${image.name}`;
          const { error: uploadError } = await supabase.storage
            .from("listing-images")
            .upload(fileName, image);

          if (uploadError) {
            console.error("Upload Error:", uploadError);
            alert("Error uploading image(s)!");
            return;
          }

          const { data: publicUrlData } = supabase.storage
            .from("listing-images")
            .getPublicUrl(fileName);

          uploadedUrls.push(publicUrlData.publicUrl);
        }
        imageUrls = JSON.stringify(uploadedUrls);
      }

      const { data,error } = await supabase
        .from("lots")
        .update({
          title: editLot.title,
          description: editLot.description,
          category: editLot.category,
          condition: editLot.condition,
          starting_bid: parseFloat(editLot.starting_bid),
          reserve_price: editLot.reserve_price
            ? parseFloat(editLot.reserve_price)
            : null,
          buy_now_price: editLot.buy_now_price
            ? parseFloat(editLot.buy_now_price)
            : null,
          image_urls:imageUrls ,
          start_date: editLot.start_date,
          end_date: editLot.end_date,
          location: editLot.location,
          shipping_option: editLot.shipping_option,
          shipping_cost: editLot.shipping_cost
            ? parseFloat(editLot.shipping_cost)
            : 0,
        })
        .eq("id", editLot.id);

      if (error) {
        console.error("Error updating lot:", error);
        alert("Failed to update lot!");
      } else {
        alert("Lot updated successfully!");
        console.log("Lot updated successfully",data);
        setEditOpen(false);
        showLots();
      }
    } catch (err) {
      console.error("Unexpected Error:", err);
      alert("Unexpected error while updating lot!");
    }
    finally{
      setLoading(false);
    }
  };

  // Search Filter
  useEffect(() => {
    const filtered = lots.filter(
      (lot) =>
        lot.title.toLowerCase().includes(search.toLowerCase()) ||
        lot.category.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredLots(filtered);
  }, [search, lots]);

  // DataTable Columns
  const columns = [
    {
      name: "Images",
      selector: (row) => {
        const imgs = Array.isArray(row.image_urls)
          ? row.image_urls
          : row.image_urls
          ? JSON.parse(row.image_urls)
          : [];
        return imgs.length ? (
          <img
            src={imgs[0]}
            alt={row.title}
            className="w-16 h-16 object-cover rounded-md"
          />
        ) : (
          <img
            src="/placeholder.png"
            alt="no image"
            className="w-16 h-16 object-cover rounded-md"
          />
        );
      },
    },
    { name: "Title", selector: (row) => row.title, sortable: true },
    { name: "Category", selector: (row) => row.category, sortable: true },
    { name: "Condition", selector: (row) => row.condition, sortable: true },
    {
      name: "Starting Bid",
      selector: (row) => `$${row.starting_bid}`,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => openEditDialog(row)}>
            <Edit size={16} />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDeleteLot(row.id)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
        <h1 className="text-2xl font-semibold">Manage Auction #{auctionId}</h1>

        <div className="flex gap-3">
          {/* Auction Details Modal */}
          <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary" className="flex items-center gap-2">
                <Info size={18} /> Auction Details
              </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Auction Details</DialogTitle>
              </DialogHeader>

              {auctionShop ? (
                <div>
                  <p>
                    <strong>Title:</strong> {auctionShop.title}
                  </p>
                  <p>
                    <strong>Created At:</strong>{" "}
                    {new Date(auctionShop.created_at).toLocaleString()}
                  </p>
                  <p>
                    <strong>Inspect:</strong> You can inspect the items between{" "}
                    {new Date(auctionShop.inspection_start).toLocaleString()} and{" "}
                    {new Date(auctionShop.inspection_end).toLocaleString()}
                  </p>
                  <p>
                    <strong>Remove lots before:</strong>{" "}
                    {new Date(auctionShop.removal_end).toLocaleString()}
                  </p>

                  <div className="mt-4">
                    <Tabs defaultValue="description" className="w-full">
                      <TabsList className="grid grid-cols-3 mb-4 border rounded-lg overflow-hidden">
                        {["description", "payment_terms", "auction_policy"].map((tab) => (
                          <TabsTrigger
                            key={tab}
                            value={tab}
                            className="py-2 text-sm font-medium text-center transition-colors data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:bg-background data-[state=inactive]:text-foreground hover:bg-primary/10"
                          >
                            {tab === "description"
                              ? "Description"
                              : tab === "payment_terms"
                              ? "Payment Terms"
                              : "Auction Policy"}
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      <TabsContent value="description">
                        <div
                          className="p-3 border rounded-md bg-muted text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html:
                              auctionShop?.description || "<p>No description provided.</p>",
                          }}
                        />
                      </TabsContent>

                      <TabsContent value="payment_terms">
                        <div
                          className="p-3 border rounded-md bg-muted text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html:
                              auctionShop?.payment_terms ||
                              "<p>No payment terms added.</p>",
                          }}
                        />
                      </TabsContent>

                      <TabsContent value="auction_policy">
                        <div
                          className="p-3 border rounded-md bg-muted text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html:
                              auctionShop?.terms || "<p>No auction policy added.</p>",
                          }}
                        />
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No details available.</p>
              )}
            </DialogContent>
          </Dialog>

          {/* Add Lot Dialog */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={18} /> Upload New Lot
              </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Lot</DialogTitle>
              </DialogHeader>

              <LotForm lot={newLot} setLot={setNewLot} />

              <div className="mt-3">
                <label className="font-semibold mb-2 flex items-center gap-2">
                  <Upload size={18} /> Upload Images (min 5)
                </label>
                <Input type="file" multiple accept="image/*" onChange={handleFileChange} />
                {images.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Selected {images.length} images
                  </p>
                )}
              </div>

              <div className="mt-4">
                <Button onClick={addLots} disabled={loading}>
                  {loading ? "Adding..." : "Add Lot"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Lot Dialog */}
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Lot</DialogTitle>
              </DialogHeader>

              {editLot && <LotForm lot={editLot} setLot={setEditLot} />}

              <div className="mt-3">
                <label className="font-semibold mb-2 flex items-center gap-2">
                  <Upload size={18} /> Upload Images (optional, min 5 if changing)
                </label>

                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleEditFileChange}
                />

                {editLot?.image_urls && editLot.image_urls.length > 0 && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {editLot.image_urls.map((imgUrl, idx) => (
                      <img
                        key={idx}
                        src={imgUrl}
                        alt={`lot-${idx}`}
                        className="w-20 h-20 object-cover rounded-md border"
                      />
                    ))}
                  </div>
                )}
              </div>

                    <div className="mt-4">
      <Button
        onClick={updateLot}
        disabled={loading} // disable button while loading
      >
        {loading ? "Updating..." : "Update Lot"}
      </Button>
    </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 mb-4">
        <Search className="text-gray-500" size={18} />
        <Input
          placeholder="Search lots by title or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2"
        />
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lots</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredLots}
            progressPending={loading}
            pagination
            highlightOnHover
            striped
            noDataComponent="No lots uploaded yet."
          />
        </CardContent>
      </Card>
    </div>
  );
};

// Reusable Lot Form
const LotForm = ({ lot, setLot }) => (
  <>
   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">

  <div>
    <label className="font-semibold mb-1 block">Lot Title</label>
    <Input
      placeholder="Lot Title"
      value={lot.title}
      onChange={(e) => setLot({ ...lot, title: e.target.value })}
    />
  </div>

  <div>
    <label className="font-semibold mb-1 block">Starting Bid</label>
    <Input
      type="number"
      placeholder="Starting Bid"
      value={lot.starting_bid || lot.startingBid}
      onChange={(e) =>
        setLot({
          ...lot,
          starting_bid: e.target.value,
          startingBid: e.target.value,
        })
      }
    />
  </div>
  

  <div>
    <label className="font-semibold mb-1 block">Start Date</label>
    <Input
      type="datetime-local"
      value={lot.start_date || ""}
      onChange={(e) => setLot({ ...lot, start_date: e.target.value })}
    />
  </div>

  <div>
    <label className="font-semibold mb-1 block">End Date</label>
    <Input
      type="datetime-local"
      value={lot.end_date || ""}
      onChange={(e) => setLot({ ...lot, end_date: e.target.value })}
    />
  </div>

  <div>
    <label className="font-semibold mb-1 block">Category</label>
    <select
      value={lot.category}
      onChange={(e) => setLot({ ...lot, category: e.target.value })}
      className="w-full p-2 border rounded-md bg-background text-foreground"
    >
      <option value="">Select Category</option>
      <option value="Electronics">Electronics</option>
      <option value="Collectibles">Collectibles</option>
      <option value="Art">Art</option>
      <option value="Vehicles">Vehicles</option>
      <option value="Jewelry">Jewelry</option>
    </select>
  </div>

  <div>
    <label className="font-semibold mb-1 block">Condition</label>
    <select
      value={lot.condition}
      onChange={(e) => setLot({ ...lot, condition: e.target.value })}
      className="w-full p-2 border rounded-md bg-background text-foreground"
    >
      <option value="">Select Condition</option>
      <option value="New">New</option>
      <option value="Used - Like New">Used - Like New</option>
      <option value="Used - Good">Used - Good</option>
      <option value="Used - Fair">Used - Fair</option>
      <option value="For Parts">For Parts</option>
    </select>
  </div>

<div>
    <label className="font-semibold mb-1 block">Reserve Price</label>
    <Input
      type="number"
      placeholder="Reserve Price"
      value={lot.reservePrice || 0}
      onChange={(e) =>
        setLot({
          ...lot,
          reservePrice: e.target.value,
        })
      }
    />
  </div>

  <div>
    <label className="font-semibold mb-1 block">Shipping Cost</label>
    <Input
      type="number"
      placeholder="Shipping Cost"
      value={lot.shipping_cost || ""}
      onChange={(e) => setLot({ ...lot, shipping_cost: e.target.value })}
    />
  </div>

</div>

<div className="mt-3">
  <label className="font-semibold mb-1 block">Description</label>
  <Textarea
    placeholder="Description"
    rows={4}
    value={lot.description}
    onChange={(e) => setLot({ ...lot, description: e.target.value })}
  />
</div>

  </>
);

export default ManageAuctionShopPage;
