
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Filter, Plus } from "lucide-react";

interface EmptyDealsStateProps {
  isFiltered: boolean;
  canCreateDeals: boolean;
}

const EmptyDealsState: React.FC<EmptyDealsStateProps> = ({ isFiltered, canCreateDeals }) => {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardContent className="py-8">
        <div className="text-center">
          <Filter className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No deals found</h3>
          <p className="text-muted-foreground mb-4">
            {isFiltered 
              ? "Try adjusting your search or filters" 
              : "Create a new deal to get started"}
          </p>
          {canCreateDeals && !isFiltered && (
            <Button onClick={() => navigate("/create-deal")}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Deal
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyDealsState;
