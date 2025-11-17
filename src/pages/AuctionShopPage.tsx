import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const AuctionShopPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShops();
  }, []);

const fetchShops = async () => {
  try {
    // 1️⃣ Fetch shops first
    const { data: shops, error } = await supabase
      .from("auction_shop")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // 2️⃣ Attach lot count for each shop
    const shopsWithLotCount = await Promise.all(
      shops.map(async (shop: any) => {
        const { count } = await supabase
          .from("lots")
          .select("*", { count: "exact", head: true })
          .eq("auction_id", shop.id);

        return {
          ...shop,
          lots_count: count || 0,
        };
      })
    );

    setShops(shopsWithLotCount);
    console.log(shopsWithLotCount);
  } catch (error) {
    console.error("Error fetching shops:", error);
  } finally {
    setLoading(false);
  }
};


  const filteredShops = shops.filter((shop) =>
    (shop.title || '')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Auction Shops
        </h1>

        {/* Search */}
        <input
          type="text"
          placeholder="Search shops..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <p className="text-gray-500">Loading shops...</p>
      ) : filteredShops.length === 0 ? (
        <p className="text-gray-500 text-lg">No auction shops found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShops.map((shop) => (
            
            <div
              key={shop.id}
              className="bg-white shadow-md rounded-xl p-5 hover:shadow-lg transition-all border border-gray-200"
            >
              {/* Avatar + Name */}
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 text-white font-bold rounded-full w-12 h-12 flex items-center justify-center text-xl">
                  {(shop.title || 'A').charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {shop.title|| 'Unknown Shop'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {shop.shop_country || 'No location'}
                  </p>
                </div>
              </div>

              {/* Description */}


<p
  className="text-gray-600 text-sm mt-3 line-clamp-2"
  dangerouslySetInnerHTML={{
    __html: shop.description || "No description available."
  }}
/>


              {/* Stats */}
              <div className="flex justify-between text-sm mt-4 text-gray-700">
                <span>
                  Lots: <b>{shop.lots_count || 0}</b>
                </span>
            
              </div>

              {/* Rating */}
              {/* <div className="flex items-center mt-2 text-yellow-500">
                {'⭐'.repeat(Math.round(shop.rating || 4))}
                <span className="text-xs text-gray-500 ml-2">
                  {shop.rating || '4.0'}
                </span>
              </div> */}

              {/* Button */}
              <button
                onClick={() => (window.location.href = `/auctions/${shop.id}`)}
                className="mt-4 w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-all"
              >
                View Lots →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuctionShopPage;
