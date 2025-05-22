
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import OnboardingCheck from "@/components/auth/OnboardingCheck";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import DealsPage from "./pages/DealsPage";
import DealDetails from "./pages/DealDetails";
import CreateDealPage from "./pages/CreateDealPage";
import NotificationsPage from "./pages/NotificationsPage";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import ProfessionalsDirectoryPage from "./pages/ProfessionalsDirectoryPage";
import ProfessionalProfilePage from "./pages/ProfessionalProfilePage";
import OnboardingIntentPage from "./pages/OnboardingIntentPage";
import IntentCapturePage from "./pages/IntentCapturePage";
import AcceptInvitePage from "./pages/AcceptInvitePage";
import SharePage from "./pages/SharePage";
import DocumentsPage from "./pages/DocumentsPage";
import DemoContractPage from "./pages/DemoContractPage";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/professionals" element={<ProfessionalsDirectoryPage />} />
            <Route path="/professionals/:professionalId" element={<ProfessionalProfilePage />} />
            <Route path="/accept-invite" element={<AcceptInvitePage />} />
            <Route path="/share/:token" element={<SharePage />} />
            <Route path="/demo/contract" element={<DemoContractPage />} />

            {/* Onboarding routes */}
            <Route path="/onboarding/intent" element={<OnboardingIntentPage />} />
            <Route path="/onboarding/capture" element={<IntentCapturePage />} />

            {/* Protected routes with onboarding check */}
            <Route element={<ProtectedRoute />}>
              <Route element={<OnboardingCheck />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/deals" element={<DealsPage />} />
                <Route path="/deals/:id" element={<DealDetails />} />
                <Route path="/deals/:dealId/documents" element={<DocumentsPage />} />
                <Route path="/create-deal" element={<CreateDealPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
