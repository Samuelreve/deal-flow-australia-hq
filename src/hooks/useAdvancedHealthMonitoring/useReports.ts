
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { HealthReport } from '@/types/advancedHealthMonitoring';

export const useReports = (userId?: string) => {
  const [reports, setReports] = useState<HealthReport[]>([]);

  const fetchReports = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('health_reports_new')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
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
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('health_reports_new')
        .insert({
          user_id: userId,
          report_name: reportConfig.report_name,
          report_type: reportConfig.report_type,
          deal_ids: reportConfig.deal_ids,
          date_range_start: reportConfig.date_range_start,
          date_range_end: reportConfig.date_range_end,
          status: 'generating'
        })
        .select()
        .single();

      if (error) throw error;
      
      const newReport: HealthReport = {
        id: data.id,
        user_id: data.user_id,
        report_name: data.report_name,
        report_type: data.report_type,
        deal_ids: data.deal_ids,
        date_range_start: data.date_range_start,
        date_range_end: data.date_range_end,
        status: 'generating',
        created_at: data.created_at
      };
      
      setReports(prev => [newReport, ...prev]);
      toast.success('Report generation started');
      
      // Simulate report generation (in a real app, this would be a background job)
      setTimeout(async () => {
        const { data: updatedData, error: updateError } = await supabase
          .from('health_reports_new')
          .update({
            status: 'completed',
            report_data: {
              summary: 'Health report generated successfully',
              deal_count: reportConfig.deal_ids?.length || 0,
              generated_at: new Date().toISOString()
            },
            file_url: `/reports/${newReport.id}.${reportConfig.report_type}`
          })
          .eq('id', newReport.id)
          .select()
          .single();
          
        if (!updateError && updatedData) {
          setReports(prev => 
            prev.map(report => 
              report.id === newReport.id 
                ? {
                    ...report,
                    status: 'completed',
                    report_data: updatedData.report_data,
                    file_url: updatedData.file_url
                  }
                : report
            )
          );
          toast.success('Report generated successfully');
        }
      }, 3000);
      
      return newReport;
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
