
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateDealFormProps {
  onDealCreated?: () => void;
}

export const CreateDealForm: React.FC<CreateDealFormProps> = ({ onDealCreated }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    asking_price: '',
    business_legal_name: '',
    business_industry: '',
    target_completion_date: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('You must be logged in to create a deal');
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('deals')
        .insert({
          title: formData.title,
          description: formData.description,
          asking_price: formData.asking_price ? parseFloat(formData.asking_price) : null,
          business_legal_name: formData.business_legal_name,
          business_industry: formData.business_industry,
          target_completion_date: formData.target_completion_date || null,
          seller_id: user.id,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      // Add the creator as a participant
      await supabase
        .from('deal_participants')
        .insert({
          deal_id: data.id,
          user_id: user.id,
          role: 'seller'
        });

      toast.success('Deal created successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        asking_price: '',
        business_legal_name: '',
        business_industry: '',
        target_completion_date: ''
      });

      if (onDealCreated) {
        onDealCreated();
      }
    } catch (error: any) {
      console.error('Error creating deal:', error);
      toast.error('Failed to create deal: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Deal</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Deal Title *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Enter deal title"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the deal..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="business_legal_name">Business Legal Name</Label>
            <Input
              id="business_legal_name"
              name="business_legal_name"
              value={formData.business_legal_name}
              onChange={handleInputChange}
              placeholder="Enter business legal name"
            />
          </div>

          <div>
            <Label htmlFor="business_industry">Industry</Label>
            <Input
              id="business_industry"
              name="business_industry"
              value={formData.business_industry}
              onChange={handleInputChange}
              placeholder="e.g., Technology, Healthcare, Retail"
            />
          </div>

          <div>
            <Label htmlFor="asking_price">Asking Price</Label>
            <Input
              id="asking_price"
              name="asking_price"
              type="number"
              value={formData.asking_price}
              onChange={handleInputChange}
              placeholder="Enter asking price"
            />
          </div>

          <div>
            <Label htmlFor="target_completion_date">Target Completion Date</Label>
            <Input
              id="target_completion_date"
              name="target_completion_date"
              type="date"
              value={formData.target_completion_date}
              onChange={handleInputChange}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating Deal...' : 'Create Deal'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateDealForm;
