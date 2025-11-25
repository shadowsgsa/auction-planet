import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Gavel, 
  TrendingUp, 
  Calendar,
  LogOut,
  Shield,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  DollarSign
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface AdminStats {
  total_users: number;
  pending_consignments: number;
  approved_items: number;
  bids_today: number;
  new_users_week: number;
}

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
  email_confirmed_at: string;
  role: string;
}

interface AuctionItem {
  id: string;
  title: string;
  description: string;
  starting_price: number;
  current_price: number;
  reserve_price: number;
  category: string;
  condition: string;
  consignment_status: string;
  status: string;
  image_url: string;
  start_time: string;
  end_time: string;
  created_at: string;
  seller_id: string;
}

const AdminDashboard = () => {
  const { user, isAdmin, loading: adminLoading } = useAdminAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [pendingItems, setPendingItems] = useState<AuctionItem[]>([]);
  const [approvedItems, setApprovedItems] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


useEffect(() => {
  if (adminLoading) return; 

  if (!user || !isAdmin) {
    navigate('/admin/login', { replace: true });
    return;
  }

  loadDashboardData();
}, [user, isAdmin, adminLoading, navigate]);

useEffect(() => {
  setLoading(true);

  const timer = setTimeout(() => {
    setLoading(false);
  }, 5000);

  return () => clearTimeout(timer);
}, []);


  const loadDashboardData = async () => {
    try {
      // setLoading(true);
      console.log('Starting to load dashboard data...');
      
      // Load basic stats with simple queries
      console.log('Loading basic stats...');
      
      // Count total auction items as a basic stat
      // const { count: totalItems } = await supabase
      //   .from('auction_items')
      //   .select('*', { count: 'exact', head: true });

      // Count pending items
      // const { count: pendingCount } = await supabase
      //   .from('auction_items')
      //   .select('*', { count: 'exact', head: true })
      //   .eq('consignment_status', 'pending');

      // Count approved items
      // const { count: approvedCount } = await supabase
      //   .from('auction_items')
      //   .select('*', { count: 'exact', head: true })
      //   .eq('consignment_status', 'approved');

   
      const [{ count: pendingCount }, { count: approvedCount }] =
      await Promise.all([
        supabase.from("auction_items").select("*", { count: "exact", head: true }),
        supabase.from("auction_items").select("*", { count: "exact", head: true }).eq("consignment_status", "pending"),
        supabase.from("auction_items").select("*", { count: "exact", head: true }).eq("consignment_status", "approved")
      ]);

      // Set basic stats
      setStats({
        total_users: 0, // Will be populated when edge function works
        pending_consignments: pendingCount || 0,
        approved_items: approvedCount || 0,
        bids_today: 0,
        new_users_week: 0
      });

      // Try to load users using the admin edge function (non-blocking)
      try {
        const { data: usersData, error: usersError } = await supabase.functions.invoke('admin-users');
        if (!usersError && usersData?.users) {
          setUsers(usersData.users);
        }
      } catch (error) {
        console.log('Edge function not available, using fallback');
        setUsers([]);
      }

      // Load pending auction items
      const { data: pendingData, error: pendingError } = await supabase
        .from('auction_items')
        .select('*')
        .eq('consignment_status', 'pending')
        .order('created_at', { ascending: false });

      if (pendingError) {
        console.error('Pending items error:', pendingError);
        throw pendingError;
      }

      setPendingItems(pendingData || []);

      // Load approved auction items
      const { data: approvedData, error: approvedError } = await supabase
        .from('auction_items')
        .select('*')
        .eq('consignment_status', 'approved')
        .order('created_at', { ascending: false });

      if (approvedError) {
        console.error('Approved items error:', approvedError);
        throw approvedError;
      }

      setApprovedItems(approvedData || []);

    } catch (error: any) {
      console.error('Dashboard data loading error:', error);
      setError('Failed to load dashboard data: ' + error.message);
    } finally {
        console.log("Dashboard load complete → hiding loader");
      // setLoading(false);
    }
  };

  


  const handleApproveItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('auction_items')
        .update({ consignment_status: 'approved' })
        .eq('id', itemId);

      if (error) throw error;

      // Refresh data
      await loadDashboardData();
      
      console.log('Item approved successfully');
    } catch (error: any) {
      console.error('Error approving item:', error);
      setError('Failed to approve item: ' + error.message);
    }
  };

  const handleRejectItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('auction_items')
        .update({ consignment_status: 'rejected' })
        .eq('id', itemId);

      if (error) throw error;

      // Refresh data
      await loadDashboardData();
      
      console.log('Item rejected successfully');
    } catch (error: any) {
      console.error('Error rejecting item:', error);
      setError('Failed to reject item: ' + error.message);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('auction_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      // Refresh data
      await loadDashboardData();
      
      console.log('Item deleted successfully');
    } catch (error: any) {
      console.error('Error deleting item:', error);
      setError('Failed to delete item: ' + error.message);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading admin dashboard...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-sm text-slate-300">Auction Planet Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-300">{user.email}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="border-slate-600 text-slate-200 hover:bg-slate-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6 border-red-500/50 bg-red-500/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-200">{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Total Users</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.total_users}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Pending Consignments</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.pending_consignments}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Approved Items</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.approved_items}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Bids Today</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.bids_today}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">New Users (Week)</CardTitle>
                <Calendar className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.new_users_week}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-slate-800/50 border-slate-700">
            <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Users Management
            </TabsTrigger>
            <TabsTrigger value="auctions" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Auction Items
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Analytics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">User Management</CardTitle>
                <CardDescription className="text-slate-300">
                  Manage user accounts and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div 
                      key={user.id} 
                      className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="font-medium text-white">{user.email}</p>
                            <p className="text-sm text-slate-300">
                              Joined: {new Date(user.created_at).toLocaleDateString()}
                            </p>
                            {user.last_sign_in_at && (
                              <p className="text-sm text-slate-400">
                                Last sign in: {new Date(user.last_sign_in_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={user.role === 'admin' ? 'default' : 'secondary'}
                          className={user.role === 'admin' ? 'bg-primary text-white' : 'bg-slate-600 text-slate-200'}
                        >
                          {user.role}
                        </Badge>
                        <Badge 
                          variant={user.email_confirmed_at ? 'default' : 'destructive'}
                          className={user.email_confirmed_at ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}
                        >
                          {user.email_confirmed_at ? 'Verified' : 'Unverified'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="auctions">
            <div className="space-y-6">
              {/* Pending Approvals */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Pending Approvals</CardTitle>
                  <CardDescription className="text-slate-300">
                    Review and approve submitted auction items
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingItems.length === 0 ? (
                    <p className="text-slate-300">No pending items to review.</p>
                  ) : (
                    <div className="space-y-4">
                      {pendingItems.map((item) => (
                        <div 
                          key={item.id} 
                          className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600"
                        >
                          <div className="flex-1">
                            <div className="flex items-start space-x-4">
                              {item.image_url && (
                                <img 
                                  src={item.image_url} 
                                  alt={item.title}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              )}
                              <div>
                                <h3 className="font-medium text-white">{item.title}</h3>
                                <p className="text-sm text-slate-300 mt-1">{item.description}</p>
                                <div className="flex items-center space-x-4 mt-2 text-sm text-slate-400">
                                  <span>Starting: ${item.starting_price}</span>
                                  <span>Category: {item.category}</span>
                                  <span>Condition: {item.condition}</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                  Submitted: {new Date(item.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproveItem(item.id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectItem(item.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Live/Approved Items */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Live Auction Items</CardTitle>
                  <CardDescription className="text-slate-300">
                    Manage approved auction items
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {approvedItems.length === 0 ? (
                    <p className="text-slate-300">No approved items found.</p>
                  ) : (
                    <div className="space-y-4">
                      {approvedItems.map((item) => (
                        <div 
                          key={item.id} 
                          className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600"
                        >
                          <div className="flex-1">
                            <div className="flex items-start space-x-4">
                              {item.image_url && (
                                <img 
                                  src={item.image_url} 
                                  alt={item.title}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              )}
                              <div>
                                <h3 className="font-medium text-white">{item.title}</h3>
                                <p className="text-sm text-slate-300 mt-1">{item.description}</p>
                                <div className="flex items-center space-x-4 mt-2 text-sm text-slate-400">
                                  <span>Current: ${item.current_price}</span>
                                  <span>Status: 
                                    <Badge variant={item.status === 'active' ? 'default' : 'secondary'} className="ml-1">
                                      {item.status}
                                    </Badge>
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                  Ends: {new Date(item.end_time).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-600 text-slate-200 hover:bg-slate-700"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Analytics & Reports</CardTitle>
                <CardDescription className="text-slate-300">
                  View platform analytics and generate reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">Analytics dashboard coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
