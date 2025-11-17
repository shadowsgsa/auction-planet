import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HomePage from "./pages/HomePage";
import LotPage from "./pages/LotsPage";
import BuyNowPage from "./pages/BuyNowPage";
import ManageAuctionShopPage from "./pages/ManageAuctionShopPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SellPage from "./pages/SellPage";
import EditAuctionPage from "./pages/editAuction";
import ConsignmentPage from "./pages/ConsignmentPage";
import AccountPage from "./pages/AccountPage";
import AuctionShopPage from "./pages/AuctionShopPage";
import CartPage from "./pages/CartPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import AboutPage from "./pages/AboutPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import SellerGuidePage from "./pages/SellerGuidePage";
import BuyerProtectionPage from "./pages/BuyerProtectionPage";
import HelpCenterPage from "./pages/HelpCenterPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import ContactPage from "./pages/ContactPage";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";

import ProductDetailPage from "./pages/ProductDetailPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Admin routes without header/footer */}
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              
              {/* Main site routes with header/footer */}
              <Route path="/*" element={
                <div className="min-h-screen flex flex-col">
                  <Header />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/auctions/:id" element={<LotPage />} />
                      <Route path="/auction-shop" element={<AuctionShopPage />} />
                      <Route path="/buy-now" element={<BuyNowPage />} />
                      <Route path="/sell" element={<SellPage />} />
                      <Route path="/consignment" element={<ConsignmentPage />} />
                      <Route path="/account" element={<AccountPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/payment-success" element={<PaymentSuccessPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                      <Route path="/reset-password" element={<ResetPasswordPage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/how-it-works" element={<HowItWorksPage />} />
                      <Route path="/seller-guide" element={<SellerGuidePage />} />
                      <Route path="/buyer-protection" element={<BuyerProtectionPage />} />
                      <Route path="/help" element={<HelpCenterPage />} />
                      <Route path="/terms" element={<TermsPage />} />
                      <Route path="/privacy" element={<PrivacyPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/manageAuctionShop/:auctionId" element={<ManageAuctionShopPage />} />
                      <Route path="/editAuction/:id" element={<EditAuctionPage />} />
                      {/* <Route path="/manageAuctionShop" element={<ManageAuctionShopPage />} /> */}
                      <Route path="/auction/:id" element={<ProductDetailPage />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              } />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
