
import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/layout/AppLayout';
import DealRoomHeader from '@/components/deal-room/DealRoomHeader';
import DealRoomTabs from '@/components/deal-room/DealRoomTabs';
import ParticipantInvitations from '@/components/deal-room/ParticipantInvitations';
import DocumentReviews from '@/components/deal-room/DocumentReviews';
import DealCompletion from '@/components/deal-room/DealCompletion';
import { Loader2 } from 'lucide-react';

interface Deal {
  id: string;
  title: string;
  description: string;
  status: string;
  seller_id: string;
  buyer_id?: string;
  created_at: string;
  updated_at: string;
}

interface DealParticipant {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profile_name: string;
  profile_avatar_url?: string;
}

const DealRoomPage = () => {
  const { dealId } = useParams<{ dealId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [deal, setDeal] = useState<Deal | null>(null);
  const [participants, setParticipants] = useState<DealParticipant[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (dealId && user) {
      fetchDealData();
    }
  }, [dealId, user]);

  const fetchDealData = async () => {
    if (!dealId || !user) return;

    try {
      // Fetch deal information
      const { data: dealData, error: dealError } = await supabase
        .from('deals')
        .select('*')
        .eq('id', dealId)
        .single();

      if (dealError) {
        console.error('Error fetching deal:', dealError);
        toast({
          title: "Error",
          description: "Failed to load deal information",
          variant: "destructive"
        });
        return;
      }

      setDeal(dealData);

      // Fetch participants
      const { data: participantsData, error: participantsError } = await supabase
        .from('deal_participants')
        .select(`
          *,
          profiles!deal_participants_user_id_fkey(name, avatar_url)
        `)
        .eq('deal_id', dealId);

      if (participantsError) {
        console.error('Error fetching participants:', participantsError);
      } else {
        const formattedParticipants = participantsData.map(p => ({
          id: p.id,
          user_id: p.user_id,
          role: p.role,
          joined_at: p.joined_at,
          profile_name: p.profiles?.name || 'Unknown User',
          profile_avatar_url: p.profiles?.avatar_url
        }));
        setParticipants(formattedParticipants);

        // Set current user's role
        const currentUserParticipant = formattedParticipants.find(p => p.user_id === user.id);
        setUserRole(currentUserParticipant?.role || null);
      }
    } catch (error) {
      console.error('Error fetching deal data:', error);
      toast({
        title: "Error",
        description: "Failed to load deal data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading deal room...</span>
        </div>
      </AppLayout>
    );
  }

  if (!deal) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Deal not found</h2>
          <p className="text-gray-600 mt-2">The deal you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      </AppLayout>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Deal Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-medium capitalize">{deal.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="font-medium">{new Date(deal.created_at).toLocaleDateString()}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="font-medium">{deal.description || 'No description provided'}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Participants ({participants.length})</h3>
              <div className="space-y-3">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {participant.profile_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{participant.profile_name}</p>
                        <p className="text-sm text-gray-600 capitalize">{participant.role}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      Joined {new Date(participant.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'invitations':
        return <ParticipantInvitations dealId={dealId!} userRole={userRole} onInvitationSent={fetchDealData} />;
      
      case 'documents':
        return <DocumentReviews dealId={dealId!} userRole={userRole} />;
      
      case 'completion':
        return <DealCompletion dealId={dealId!} deal={deal} userRole={userRole} />;
      
      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <DealRoomHeader deal={deal} userRole={userRole} />
        
        <DealRoomTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          userRole={userRole}
        />
        
        <div className="mt-6">
          {renderTabContent()}
        </div>
      </div>
    </AppLayout>
  );
};

export default DealRoomPage;
