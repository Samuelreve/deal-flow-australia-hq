
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { HealthReport } from '@/types/advancedHealthMonitoring';

export const useReports = (userId?: string) => {
  const [reports, setReports] = useState<HealthReport[]>([]);

  const fetchReports = useCallback(async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('health_reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Cast the data to match our TypeScript interface
      const typedData = (data || []).map(item => ({
        ...item,
        report_type: item.report_type as 'pdf' | 'csv' | 'json',
        status: item.status as 'generating' | 'completed' | 'failed',
        deal_ids: Array.isArray(item.deal_ids) ? item.deal_ids as string[] : undefined
      })) as HealthReport[];
      
      setReports(typedData);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  }, [userId]);

  const generateReport = useCallback(async (
    reportConfig: Omit<HealthReport, 'id' | 'created_at' | 'status' | 'report_data' | 'file_url'>
  ): Promise<HealthReport | null> => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('health_reports')
        .insert({
          ...reportConfig,
          user_id: userId,
          status: 'generating'
        })
        .select()
        .single();

      if (error) throw error;
      
      const typedData = {
        ...data,
        report_type: data.report_type as 'pdf' | 'csv' | 'json',
        status: data.status as 'generating' | 'completed' | 'failed',
        deal_ids: Array.isArray(data.deal_ids) ? data.deal_ids as string[] : undefined
      } as HealthReport;
      
      setReports(prev => [typedData, ...prev]);
      return typedData;
    } catch (error) {
      console.error('Error generating report:', error);
      return null;
    }
  }, [userId]);

  return {
    reports,
    fetchReports,
    generateReport
  };
};
