
import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import DealDetailsHeader from "@/components/deal-details/DealDetailsHeader";
import DealDetailsContent from "@/components/deal-details/DealDetailsContent";

const DealDetailsPage = () => {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <DealDetailsHeader />
        <DealDetailsContent />
      </div>
    </AppLayout>
  );
};

export default DealDetailsPage;
