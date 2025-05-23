
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ResetPassword from "./pages/ResetPassword";
import DealsPage from "./pages/DealsPage";
import CreateDealPage from "./pages/CreateDealPage";
import DealDetails from "./pages/DealDetails";
import DocumentsPage from "./pages/DocumentsPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfessionalsDirectoryPage from "./pages/ProfessionalsDirectoryPage";
import ProfessionalProfilePage from "./pages/ProfessionalProfilePage";
import DemoContractPage from "./pages/DemoContractPage";
import RealContractPage from "./pages/RealContractPage";
import AcceptInvitePage from "./pages/AcceptInvitePage";
import SharePage from "./pages/SharePage";
import OnboardingIntentPage from "./pages/OnboardingIntentPage";
import IntentCapturePage from "./pages/IntentCapturePage";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/deals" element={<DealsPage />} />
              <Route path="/deals/new" element={<CreateDealPage />} />
              <Route path="/deals/:id" element={<DealDetails />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/professionals" element={<ProfessionalsDirectoryPage />} />
              <Route path="/professionals/:id" element={<ProfessionalProfilePage />} />
              <Route path="/demo/contract" element={<DemoContractPage />} />
              <Route path="/contracts" element={<RealContractPage />} />
              <Route path="/accept-invitation" element={<AcceptInvitePage />} />
              <Route path="/share/:token" element={<SharePage />} />
              <Route path="/onboarding/intent" element={<OnboardingIntentPage />} />
              <Route path="/intent" element={<IntentCapturePage />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
