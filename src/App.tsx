import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import DealsPage from "@/pages/DealsPage";
import DealDetailsPage from "@/pages/DealDetailsPage";
import SettingsPage from "@/pages/SettingsPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import NotificationsPage from "@/pages/NotificationsPage";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import DealHealthPage from "@/pages/DealHealthPage";
import DealHealthMonitoring from "@/pages/DealHealthMonitoring";
import AdvancedHealthMonitoring from "@/pages/AdvancedHealthMonitoring";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Toaster />
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
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
            
            {/* Add the new advanced health monitoring route */}
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
