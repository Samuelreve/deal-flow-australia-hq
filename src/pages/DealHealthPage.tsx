
import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import DealHealthDashboard from "@/components/dashboard/DealHealthDashboard";

const DealHealthPage = () => {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Deal Health Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Monitor the health and risk levels of all your deals in one place
          </p>
        </div>
        
        <DealHealthDashboard />
      </div>
    </AppLayout>
  );
};

export default DealHealthPage;
