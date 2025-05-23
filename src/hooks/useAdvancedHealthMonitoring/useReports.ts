
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { HealthReport } from '@/types/advancedHealthMonitoring';

export const useReports = (userId?: string) => {
  const [reports, setReports] = useState<HealthReport[]>([]);

  const fetchReports = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase.rpc('get_health_reports', {
        p_user_id: userId
      });

      if (error) {
        console.error('RPC error:', error);
        setReports([]);
        return;
      }
      
      const formattedReports: HealthReport[] = (data || []).map((report: any) => ({
        id: report.id,
        user_id: report.user_id,
        report_name: report.report_name,
        report_type: report.report_type as 'pdf' | 'csv' | 'json',
        deal_ids: Array.isArray(report.deal_ids) ? report.deal_ids : undefined,
        date_range_start: report.date_range_start,
        date_range_end: report.date_range_end,
        report_data: report.report_data,
        file_url: report.file_url,
        status: report.status as 'generating' | 'completed' | 'failed',
        created_at: report.created_at
      }));
      
      setReports(formattedReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
      setReports([]);
    }
  };

  const generateReport = async (reportConfig: Omit<HealthReport, 'id' | 'created_at' | 'status' | 'report_data' | 'file_url'>) => {
    try {
      const mockReport: HealthReport = {
        id: crypto.randomUUID(),
        user_id: reportConfig.user_id,
        report_name: reportConfig.report_name,
        report_type: reportConfig.report_type,
        deal_ids: reportConfig.deal_ids,
        date_range_start: reportConfig.date_range_start,
        date_range_end: reportConfig.date_range_end,
        status: 'generating',
        created_at: new Date().toISOString()
      };
      
      setReports(prev => [mockReport, ...prev]);
      toast.success('Report generation started');
      
      setTimeout(() => {
        setReports(prev => 
          prev.map(report => 
            report.id === mockReport.id 
              ? { 
                  ...report, 
                  status: 'completed' as const, 
                  report_data: { 
                    summary: 'Health report generated successfully',
                    deal_count: reportConfig.deal_ids?.length || 0,
                    generated_at: new Date().toISOString()
                  },
                  file_url: `/reports/${mockReport.id}.${reportConfig.report_type}` 
                } 
              : report
          )
        );
        toast.success('Report generated successfully');
      }, 3000);
      
      return mockReport;
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
      return null;
    }
  };

  return {
    reports,
    fetchReports,
    generateReport
  };
};
