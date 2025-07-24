import { useEffect, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RealtimeChannel } from '@supabase/supabase-js';

interface DocumentRealtimeData {
  id: string;
  name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  milestone_id?: string;
  deal_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Custom hook for real-time document updates
 */
export function useDocumentRealtime(
  dealId?: string,
  milestoneId?: string,
  onDocumentInsert?: (document: DocumentRealtimeData) => void,
  onDocumentUpdate?: (document: DocumentRealtimeData) => void,
  onDocumentDelete?: (documentId: string) => void
) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!dealId && !milestoneId) return;

    console.log('🔵 Setting up real-time document subscription for:', { dealId, milestoneId });

    // Create filter based on what IDs we have - Supabase doesn't support multiple filters in one string
    let filter = '';
    if (milestoneId) {
      // Priority to milestone-specific filtering
      filter = `milestone_id=eq.${milestoneId}`;
    } else if (dealId) {
      filter = `deal_id=eq.${dealId}`;
    } else {
      return; // No valid filter
    }

    const channelName = milestoneId 
      ? `documents:milestone:${milestoneId}` 
      : `documents:deal:${dealId}`;

    const documentsChannel = supabase.channel(channelName);

    documentsChannel
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'documents',
          filter 
        },
        async (payload) => {
          console.log('🔵 Realtime document INSERT received:', payload);
          
          // Get uploader profile info
          const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', payload.new.uploaded_by)
            .single();

          onDocumentInsert?.(payload.new as DocumentRealtimeData);
          
          const uploaderName = profile?.name || 'Someone';
          if (milestoneId) {
            toast.success(`${uploaderName} uploaded a document to milestone`);
          } else {
            toast.success(`${uploaderName} uploaded a document`);
          }
        }
      )
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'documents',
          filter 
        },
        (payload) => {
          console.log('🔵 Realtime document UPDATE received:', payload);
          onDocumentUpdate?.(payload.new as DocumentRealtimeData);
          toast.info('Document updated');
        }
      )
      .on(
        'postgres_changes',
        { 
          event: 'DELETE', 
          schema: 'public', 
          table: 'documents',
          filter 
        },
        (payload) => {
          console.log('🔵 Realtime document DELETE received:', payload);
          onDocumentDelete?.(payload.old?.id);
          toast.info('Document removed');
        }
      )
      .subscribe();

    setChannel(documentsChannel);

    // Cleanup function
    return () => {
      console.log('🔵 Cleaning up document realtime subscription');
      if (documentsChannel) {
        supabase.removeChannel(documentsChannel);
      }
      setChannel(null);
    };
  }, [dealId, milestoneId, onDocumentInsert, onDocumentUpdate, onDocumentDelete]);

  return { channel };
}