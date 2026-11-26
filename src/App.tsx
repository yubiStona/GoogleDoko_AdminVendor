import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ScrollToTop from "./components/ScrollToTop";
import DocumentTitle from "./components/DocumentTitle";
import CartToast from "./components/CartToast";
import { CartProvider } from "./context/CartContext";
import { OrdersProvider } from "./context/OrdersContext";
import { WishlistProvider } from "./context/WishlistContext";
import { CheckoutProvider } from "./context/CheckoutContext";
import { AccountProvider } from "./context/AccountContext";
import { AuthFlowProvider } from "./context/AuthFlowContext";
import Login from "./pages/Login";
import SignUpVendor from "./pages/SignUpVendor";
import VendorSignupStatus from "./pages/VendorSignupStatus";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminHomepageBuilder from "./pages/admin/AdminHomepageBuilder";
import AdminPagesManager from "./pages/admin/AdminPagesManager";
import AdminCategoriesManager from "./pages/admin/AdminCategoriesManager";
import AdminContentHistory from "./pages/admin/AdminContentHistory";
import OurStory from "./pages/OurStory";
import NotFound from "./pages/NotFound";
import PortalHome from "./pages/PortalHome";
import VendorShell from "./components/vendor/VendorShell";
import VendorHome from "./pages/vendor/VendorHome";
import AdminShell from "./components/admin/AdminShell";
import {
  AdminSupport,
  AdminSubscribers,
  AdminProfile,
  AdminHome,
  AdminOrders,
  AdminProducts,
  AdminReviews,
  AdminUsers,
  AdminVendors,
  AdminCoupons,
  AdminSettings,
} from "./pages/admin/AdminPages";
import {
  VendorAddProduct,
  VendorAnalytics,
  VendorCustomers,
  VendorOrders,
  VendorProducts,
  VendorProfile,
  VendorReports,
  VendorReviews,
  VendorSales,
  VendorSettings,
} from "./pages/vendor/VendorPages";

function App() {
  return (
    <CartProvider>
      <OrdersProvider>
        <WishlistProvider>
          <CheckoutProvider>
            <AccountProvider>
              <BrowserRouter>
                <AuthFlowProvider>
                  <ScrollToTop />
                  <DocumentTitle />
                  <CartToast />
                  <Routes>
                    <Route path="/" element={<PortalHome />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Navigate to="/signup/vendor" replace />} />
                    <Route path="/signup/vendor" element={<SignUpVendor />} />
                    <Route path="/signup/vendor/status" element={<VendorSignupStatus />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/our-story" element={<OurStory />} />
                    <Route path="/vendor/login" element={<Navigate to="/login?role=vendor" replace />} />
                    <Route path="/login/vendor" element={<Navigate to="/login?role=vendor" replace />} />
                    <Route path="/vendor" element={<VendorShell />}>
                      <Route index element={<VendorHome />} />
                      <Route path="products/new" element={<VendorAddProduct />} />
                      <Route path="products/:id/edit" element={<VendorAddProduct />} />
                      <Route path="products" element={<VendorProducts />} />
                      <Route path="orders" element={<VendorOrders />} />
                      <Route path="customers" element={<VendorCustomers />} />
                      <Route path="sales" element={<VendorSales />} />
                      <Route path="reports" element={<VendorReports />} />
                      <Route path="analytics" element={<VendorAnalytics />} />
                      <Route path="reviews" element={<VendorReviews />} />
                      <Route path="profile" element={<VendorProfile />} />
                      <Route path="settings" element={<VendorSettings />} />
                    </Route>
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={<AdminShell />}>
                      <Route index element={<AdminHome />} />
                      <Route path="support" element={<AdminSupport />} />
                      <Route path="subscribers" element={<AdminSubscribers />} />
                      <Route path="profile" element={<AdminProfile />} />
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="vendors" element={<AdminVendors />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="reviews" element={<AdminReviews />} />
                      <Route path="coupons" element={<AdminCoupons />} />
                      <Route path="settings" element={<AdminSettings />} />
                      <Route path="website/homepage" element={<AdminHomepageBuilder />} />
                      <Route path="website/food-home" element={<AdminHomepageBuilder />} />
                      <Route path="website/pages" element={<AdminPagesManager />} />
                      <Route path="website/categories" element={<AdminCategoriesManager />} />
                      <Route path="website/history" element={<AdminContentHistory />} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AuthFlowProvider>
              </BrowserRouter>
            </AccountProvider>
          </CheckoutProvider>
        </WishlistProvider>
      </OrdersProvider>
    </CartProvider>
  );
}

export default App;
