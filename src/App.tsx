
import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from "react-router-dom";
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
import AIDisclaimerPage from "@/pages/AIDisclaimerPage";
import FAQPage from "@/pages/FAQPage";
import AIAssistantPage from "@/pages/AIAssistantPage";
import DealHealthPage from "@/pages/DealHealthPage";
import DealHealthMonitoring from "@/pages/DealHealthMonitoring";
import AdvancedHealthMonitoring from "@/pages/AdvancedHealthMonitoring";
import ProfilePage from "@/pages/ProfilePage";
import AcceptInvitePage from "@/pages/AcceptInvitePage";
import IntentCapturePage from "@/pages/onboarding/IntentCapturePage";
import ProfessionalProfileSetupPage from "@/pages/onboarding/ProfessionalProfileSetupPage";
import InstallPage from "@/pages/InstallPage";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import OnboardingCheck from "@/components/auth/OnboardingCheck";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";

// Layout wrapper for authenticated pages
const AuthenticatedLayoutWrapper = () => (
  <AuthenticatedLayout>
    <Outlet />
  </AuthenticatedLayout>
);

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
            <Route path="/accept-invite" element={<AcceptInvitePage />} />
            
            {/* Legal and Policy Pages */}
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/cookie-policy" element={<CookiePolicyPage />} />
            <Route path="/accessibility" element={<AccessibilityPage />} />
            <Route path="/ai-disclaimer" element={<AIDisclaimerPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/install" element={<InstallPage />} />
            
            {/* AI Assistant - accessible to everyone */}
            <Route path="/ai-assistant" element={<AIAssistantPage />} />
            
            {/* Contract Analysis - accessible to everyone */}
            <Route path="/contract-analysis" element={<ContractAnalysisPage />} />
            
            {/* Protected routes - require authentication */}
            <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
              {/* Routes that require onboarding completion - with sidebar layout */}
              <Route element={<OnboardingCheck />}>
                <Route element={<AuthenticatedLayoutWrapper />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/deals" element={<DealsPage />} />
                  <Route path="/deals/:dealId" element={<DealDetailsPage />} />
                  <Route path="/create-deal" element={<CreateDealPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/deal-health" element={<DealHealthPage />} />
                  <Route path="/health-monitoring" element={<DealHealthMonitoring />} />
                  <Route path="/advanced-health-monitoring" element={<AdvancedHealthMonitoring />} />
                </Route>
                
                {/* Fallback for authenticated, onboarded users to dashboard */}
                <Route path="/app/*" element={<Navigate to="/dashboard" replace />} />
              </Route>
              
              {/* Onboarding routes - accessible if authenticated but onboarding incomplete */}
              {/* These are outside OnboardingCheck so users can access them during onboarding */}
              <Route path="/onboarding/intent" element={<IntentCapturePage />} />
              <Route path="/profile/professional-setup" element={<ProfessionalProfileSetupPage />} />
            </Route>
            
            {/* Catch-all for 404 Not Found (ensure it's the last route) */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </div>
    </Router>
  );
}

export default App;
