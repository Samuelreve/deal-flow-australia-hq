
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
      setReports(data || []);
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
      
      const newReport = data as HealthReport;
      setReports(prev => [newReport, ...prev]);
      return newReport;
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
