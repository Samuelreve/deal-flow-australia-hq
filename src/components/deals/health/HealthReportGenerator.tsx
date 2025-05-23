
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileDown, Download, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { DealSummary } from "@/types/deal";
import { HealthReport } from "@/types/advancedHealthMonitoring";
import { useAuth } from "@/contexts/AuthContext";
import { format } from 'date-fns';

interface HealthReportGeneratorProps {
  deals: DealSummary[];
  reports: HealthReport[];
  onGenerateReport: (report: Omit<HealthReport, 'id' | 'created_at' | 'status' | 'report_data' | 'file_url'>) => Promise<any>;
}

const HealthReportGenerator: React.FC<HealthReportGeneratorProps> = ({
  deals,
  reports,
  onGenerateReport
}) => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [newReport, setNewReport] = useState({
    report_name: '',
    report_type: 'pdf' as 'pdf' | 'csv' | 'json',
    deal_ids: [] as string[],
    date_range_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    date_range_end: new Date().toISOString().split('T')[0]
  });

  const handleGenerateReport = async () => {
    if (!user?.id || !newReport.report_name.trim()) return;

    setIsGenerating(true);
    await onGenerateReport({
      user_id: user.id,
      report_name: newReport.report_name,
      report_type: newReport.report_type,
      deal_ids: newReport.deal_ids.length > 0 ? newReport.deal_ids : undefined,
      date_range_start: newReport.date_range_start,
      date_range_end: newReport.date_range_end
    });

    setNewReport({
      report_name: '',
      report_type: 'pdf',
      deal_ids: [],
      date_range_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      date_range_end: new Date().toISOString().split('T')[0]
    });
    setIsGenerating(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'generating':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generating':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileDown className="h-5 w-5" />
          Health Report Generator
        </CardTitle>
        <CardDescription>
          Generate and export comprehensive health reports
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Report Generation Form */}
          <div className="space-y-4">
            <h3 className="font-semibold">Generate New Report</h3>
            
            <div>
              <Label htmlFor="report-name">Report Name</Label>
              <Input
                id="report-name"
                placeholder="e.g., Monthly Health Summary"
                value={newReport.report_name}
                onChange={(e) => setNewReport(prev => ({ 
                  ...prev, 
                  report_name: e.target.value 
                }))}
              />
            </div>
            
            <div>
              <Label>Report Format</Label>
              <Select 
                value={newReport.report_type} 
                onValueChange={(value: 'pdf' | 'csv' | 'json') => 
                  setNewReport(prev => ({ ...prev, report_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Report</SelectItem>
                  <SelectItem value="csv">CSV Data Export</SelectItem>
                  <SelectItem value="json">JSON Data Export</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Include Deals (optional - leave empty for all deals)</Label>
              <div className="mt-2 max-h-32 overflow-y-auto border rounded p-2">
                {deals.slice(0, 8).map((deal) => (
                  <label key={deal.id} className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      checked={newReport.deal_ids.includes(deal.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewReport(prev => ({
                            ...prev,
                            deal_ids: [...prev.deal_ids, deal.id]
                          }));
                        } else {
                          setNewReport(prev => ({
                            ...prev,
                            deal_ids: prev.deal_ids.filter(id => id !== deal.id)
                          }));
                        }
                      }}
                    />
                    <span className="text-sm">{deal.title}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={newReport.date_range_start}
                  onChange={(e) => setNewReport(prev => ({ 
                    ...prev, 
                    date_range_start: e.target.value 
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={newReport.date_range_end}
                  onChange={(e) => setNewReport(prev => ({ 
                    ...prev, 
                    date_range_end: e.target.value 
                  }))}
                />
              </div>
            </div>
            
            <Button 
              onClick={handleGenerateReport}
              disabled={isGenerating || !newReport.report_name.trim()}
              className="w-full"
            >
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>
          
          {/* Recent Reports */}
          <div className="space-y-4">
            <h3 className="font-semibold">Recent Reports</h3>
            
            <div className="space-y-3">
              {reports.slice(0, 5).map((report) => (
                <div key={report.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-medium truncate">{report.report_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(report.created_at), 'MMM dd, yyyy HH:mm')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(report.status)}>
                        {getStatusIcon(report.status)}
                        {report.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {report.report_type.toUpperCase()} • {report.deal_ids?.length || 'All'} deals
                    </div>
                    
                    {report.status === 'completed' && (
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {reports.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No reports generated yet
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthReportGenerator;
