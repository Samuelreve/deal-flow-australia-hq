
import React from 'react';
import { useParams } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DealDetailsPage: React.FC = () => {
  const { dealId } = useParams();
  
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Deal Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Deal ID: {dealId}</p>
            <p>This page is under construction. Deal details will be displayed here.</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default DealDetailsPage;
