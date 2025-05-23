
import React from "react";

interface DealDetailsHeaderProps {
  title?: string;
}

const DealDetailsHeader: React.FC<DealDetailsHeaderProps> = ({ 
  title = "Deal Details" 
}) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground">Deal details content will appear here.</p>
    </div>
  );
};

export default DealDetailsHeader;
