import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import OnboardingCheck from "@/components/auth/OnboardingCheck";
import Index from "./pages/Index";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import CreateDealPage from "./pages/CreateDealPage";
import DealsPage from "./pages/DealsPage";
import DealDetails from "./pages/DealDetails";
import DealHealthPage from "./pages/DealHealthPage";
import DocumentsPage from "./pages/DocumentsPage";
import ProfilePage from "./pages/ProfilePage";
import ProfessionalsDirectoryPage from "./pages/ProfessionalsDirectoryPage";
import ProfessionalProfilePage from "./pages/ProfessionalProfilePage";
import SettingsPage from "./pages/SettingsPage";
import NotificationsPage from "./pages/NotificationsPage";
import OnboardingIntentPage from "./pages/OnboardingIntentPage";
import IntentCapturePage from "./pages/IntentCapturePage";
import AcceptInvitePage from "./pages/AcceptInvitePage";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import DemoContractPage from "./pages/DemoContractPage";
import RealContractPage from "./pages/RealContractPage";
import SharePage from "./pages/SharePage";
import DealHealthMonitoring from "@/pages/DealHealthMonitoring";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/onboarding/intent" element={<OnboardingIntentPage />} />
              <Route path="/intent" element={<IntentCapturePage />} />
              <Route path="/accept-invitation" element={<AcceptInvitePage />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/share/:token" element={<SharePage />} />
              
              {/* Demo routes */}
              <Route path="/demo/contract" element={<DemoContractPage />} />
              
              {/* Protected routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <OnboardingCheck>
                      <Dashboard />
                    </OnboardingCheck>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/deals" 
                element={
                  <ProtectedRoute>
                    <OnboardingCheck>
                      <DealsPage />
                    </OnboardingCheck>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/deals/health" 
                element={
                  <ProtectedRoute>
                    <OnboardingCheck>
                      <DealHealthPage />
                    </OnboardingCheck>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/deals/create" 
                element={
                  <ProtectedRoute>
                    <OnboardingCheck>
                      <CreateDealPage />
                    </OnboardingCheck>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/deals/:id" 
                element={
                  <ProtectedRoute>
                    <OnboardingCheck>
                      <DealDetails />
                    </OnboardingCheck>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/deals/:id/documents" 
                element={
                  <ProtectedRoute>
                    <OnboardingCheck>
                      <DocumentsPage />
                    </OnboardingCheck>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/contracts" 
                element={
                  <ProtectedRoute>
                    <OnboardingCheck>
                      <RealContractPage />
                    </OnboardingCheck>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <OnboardingCheck>
                      <ProfilePage />
                    </OnboardingCheck>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/professionals" 
                element={
                  <ProtectedRoute>
                    <OnboardingCheck>
                      <ProfessionalsDirectoryPage />
                    </OnboardingCheck>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/professionals/:id" 
                element={
                  <ProtectedRoute>
                    <OnboardingCheck>
                      <ProfessionalProfilePage />
                    </OnboardingCheck>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <OnboardingCheck>
                      <SettingsPage />
                    </OnboardingCheck>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/notifications" 
                element={
                  <ProtectedRoute>
                    <OnboardingCheck>
                      <NotificationsPage />
                    </OnboardingCheck>
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
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
