import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import UserManagement from './pages/UserManagement'
import ProductManagement from './pages/ProductManagement'
import OrderManagement from './pages/OrderManagement'
import DiscountCodeManagement from './pages/DiscountCodeManagement'
// Legal Pages
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import LegalNotice from './pages/LegalNotice'
import CookiePolicy from './pages/CookiePolicy'
import ShippingReturns from './pages/ShippingReturns'
import ProtectedRoute from './components/ProtectedRoute'
import RoleProtectedRoute from './components/RoleProtectedRoute'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import CartSidebar from './components/CartSidebar'
import { useState } from 'react'
import './App.css'

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false)

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-stone-50">
            <Header onCartOpen={() => setIsCartOpen(true)} />
            <main className="pt-20">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <RoleProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </RoleProtectedRoute>
                  </ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                  <ProtectedRoute>
                    <RoleProtectedRoute allowedRoles={['admin']}>
                      <UserManagement />
                    </RoleProtectedRoute>
                  </ProtectedRoute>
                } />
                <Route path="/admin/products" element={
                  <ProtectedRoute>
                    <RoleProtectedRoute allowedRoles={['admin']}>
                      <ProductManagement />
                    </RoleProtectedRoute>
                  </ProtectedRoute>
                } />
                <Route path="/admin/orders" element={
                  <ProtectedRoute>
                    <RoleProtectedRoute allowedRoles={['admin']}>
                      <OrderManagement />
                    </RoleProtectedRoute>
                  </ProtectedRoute>
                } />
                <Route path="/admin/discount-codes" element={
                  <ProtectedRoute>
                    <RoleProtectedRoute allowedRoles={['admin']}>
                      <DiscountCodeManagement />
                    </RoleProtectedRoute>
                  </ProtectedRoute>
                } />
                {/* Legal Pages */}
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/legal" element={<LegalNotice />} />
                <Route path="/cookies" element={<CookiePolicy />} />
                <Route path="/shipping" element={<ShippingReturns />} />
              </Routes>
            </main>
            <Footer />
            <CartSidebar 
              isOpen={isCartOpen} 
              onClose={() => setIsCartOpen(false)} 
            />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
