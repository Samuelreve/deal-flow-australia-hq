
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download } from "lucide-react";
import { DealSummary } from "@/types/deal";
import { HealthReport } from '@/types/advancedHealthMonitoring';

interface HealthReportGeneratorProps {
  deals: DealSummary[];
  reports: HealthReport[];
  onGenerateReport: (reportConfig: Omit<HealthReport, 'id' | 'created_at' | 'status' | 'report_data' | 'file_url'>) => Promise<HealthReport | null>;
}

const HealthReportGenerator: React.FC<HealthReportGeneratorProps> = ({
  deals,
  reports,
  onGenerateReport
}) => {
  const [reportName, setReportName] = useState('');
  const [reportType, setReportType] = useState<'pdf' | 'csv' | 'json'>('pdf');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async () => {
    if (!reportName) return;
    
    setIsGenerating(true);
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      await onGenerateReport({
        user_id: '', // Will be set by the hook
        report_name: reportName,
        report_type: reportType,
        deal_ids: deals.map(d => d.id),
        date_range_start: thirtyDaysAgo.toISOString(),
        date_range_end: now.toISOString()
      });
      
      setReportName('');
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Health Report Generator
        </CardTitle>
        <CardDescription>
          Generate comprehensive health reports for your deals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Generate New Report */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h4 className="font-medium">Generate New Report</h4>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="report-name">Report Name</Label>
              <Input
                id="report-name"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="e.g., Monthly Health Report"
              />
            </div>
            
            <div>
              <Label>Report Format</Label>
              <Select value={reportType} onValueChange={(value: 'pdf' | 'csv' | 'json') => setReportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            onClick={handleGenerateReport} 
            disabled={isGenerating || !reportName}
            className="w-full"
          >
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>

        {/* Recent Reports */}
        <div className="space-y-3">
          <h4 className="font-medium">Recent Reports</h4>
          {reports.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reports generated yet.</p>
          ) : (
            reports.slice(0, 5).map((report) => (
              <div key={report.id} className="flex items-center justify-between border rounded-lg p-3">
                <div>
                  <p className="font-medium">{report.report_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {report.report_type.toUpperCase()} • {report.status}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Created: {new Date(report.created_at).toLocaleDateString()}
                  </p>
                </div>
                {report.status === 'completed' && report.file_url && (
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthReportGenerator;
