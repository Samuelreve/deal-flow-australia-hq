
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import ProtectedRoute from "./components/ProtectedRoute";

// Import pages
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import DocumentsPage from "./pages/DocumentsPage";
import ContractAnalysisPage from "./pages/ContractAnalysisPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route 
                path="/documents/:dealId" 
                element={
                  <ProtectedRoute>
                    <DocumentsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/deals/:dealId/documents" 
                element={
                  <ProtectedRoute>
                    <DocumentsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/contract-analysis" 
                element={
                  <ProtectedRoute>
                    <ContractAnalysisPage />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
