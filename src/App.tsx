
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
import DemoContractPage from "@/pages/DemoContractPage";
import Index from "@/pages/Index";
import { AuthProvider } from "@/contexts/AuthContext"; // Update to use the main AuthContext
import { Toaster } from "@/components/ui/toaster";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import OnboardingCheck from "@/components/auth/OnboardingCheck";
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
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            
            {/* Demo route - accessible to everyone */}
            <Route path="/demo/contract" element={<DemoContractPage />} />
            
            {/* Add OnboardingCheck wrapper for protected routes */}
            <Route element={<OnboardingCheck />}>
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
            </Route>

            {/* Add onboarding routes */}
            <Route 
              path="/onboarding/intent" 
              element={
                <ProtectedRoute>
                  <OnboardingIntentPage />
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
