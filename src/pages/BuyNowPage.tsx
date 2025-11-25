import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Grid, List } from 'lucide-react';
import AuctionCard from '@/components/AuctionCard';

import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const BuyNowPage = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('featured');
  const [buyNowItems, setBuyNowItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
  
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);
  
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchBuyNowItems();
  }, []);

  const fetchBuyNowItems = async () => {
    try {
      console.log('Fetching buy now items...');
      const { data, error } = await supabase
        .from('auction_items')
        .select('*')
        .eq('consignment_status', 'approved')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching items:', error);
        throw error;
      }

      console.log('Raw data from Supabase:', data);

      const formattedItems = data?.map(item => ({
        id: item.id,
        title: item.title,
        image: item.image_url,
        currentBid: item.current_price,
        timeLeft: 'Buy Now',
        buyNowPrice: item.current_price,
        category: item.category
      })) || [];

      console.log('Formatted items:', formattedItems);
      setBuyNowItems(formattedItems);
    } catch (error) {
      console.error('Error fetching buy now items:', error);
    } finally {
      // setLoading(false);
    }
  };

const categories = ['All Categories', 'Electronics', 'Fashion', 'Furniture', 'Music', 'Art', 'Watches', 'Jewelry', 'Collectibles', 'Antiques'];


  // Filter and sort buy now items
  const filteredItems = buyNowItems
    .filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All Categories' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'featured':
          return 0; // Keep original order
        case 'price-low':
          return a.currentBid - b.currentBid;
        case 'price-high':
          return b.currentBid - a.currentBid;
        case 'newest':
          return parseInt(b.id) - parseInt(a.id);
        case 'name-asc':
          return a.title.localeCompare(b.title);
        case 'name-desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Buy Now Items</h1>
          <p className="text-muted-foreground">Shop instantly with fixed prices - no bidding required</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="mb-8 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="name-asc">Name: A to Z</SelectItem>
                <SelectItem value="name-desc">Name: Z to A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">View:</span>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {selectedCategory !== 'All Categories' && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedCategory('All Categories')}>
                {selectedCategory} ×
              </Badge>
            )}
            {searchTerm && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchTerm('')}>
                "{searchTerm}" ×
              </Badge>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredItems.length} of {buyNowItems.length} items
          </p>
        </div>

        {/* Items Grid/List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">Loading items...</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <AuctionCard key={item.id} {...item} />
              ))
            ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">No items found matching your criteria</p>
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All Categories');
              }}>
                Clear Filters
              </Button>
            </div>
          )}
          </div>
        )}

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Load More Items
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BuyNowPage;
