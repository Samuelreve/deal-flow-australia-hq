
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import DealsPage from "@/pages/DealsPage";
import DealDetailsPage from "@/pages/DealDetailsPage";
import SettingsPage from "@/pages/SettingsPage";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import NotificationsPage from "@/pages/NotificationsPage";
import ContractAnalysisPage from "@/pages/ContractAnalysisPage";
import Index from "@/pages/Index";
import CreateDealPage from "@/pages/CreateDealPage";
import TermsOfServicePage from "@/pages/TermsOfServicePage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import CookiePolicyPage from "@/pages/CookiePolicyPage";
import AccessibilityPage from "@/pages/AccessibilityPage";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import DealHealthPage from "@/pages/DealHealthPage";
import DealHealthMonitoring from "@/pages/DealHealthMonitoring";
import AdvancedHealthMonitoring from "@/pages/AdvancedHealthMonitoring";
import ProfilePage from "@/pages/ProfilePage";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Toaster />
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route 
              path="/login" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <Login />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/signup" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <SignUp />
                </ProtectedRoute>
              } 
            />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            
            {/* Legal and Policy Pages */}
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/cookie-policy" element={<CookiePolicyPage />} />
            <Route path="/accessibility" element={<AccessibilityPage />} />
            
            {/* Contract Analysis - accessible to everyone */}
            <Route path="/contract-analysis" element={<ContractAnalysisPage />} />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/deals" 
              element={
                <ProtectedRoute>
                  <DealsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create-deal" 
              element={
                <ProtectedRoute>
                  <CreateDealPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/deals/:dealId" 
              element={
                <ProtectedRoute>
                  <DealDetailsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/notifications" 
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/deal-health" 
              element={
                <ProtectedRoute>
                  <DealHealthPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/health-monitoring" 
              element={
                <ProtectedRoute>
                  <DealHealthMonitoring />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/advanced-health-monitoring" 
              element={
                <ProtectedRoute>
                  <AdvancedHealthMonitoring />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </AuthProvider>
      </div>
    </Router>
  );
}

export default App;
