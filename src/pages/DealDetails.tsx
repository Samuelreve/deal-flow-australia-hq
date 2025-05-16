
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { FileText, MessageSquare, ChevronLeft, Calendar, Users, AlertCircle } from "lucide-react";
import { Deal } from "@/types/deal";
import { getMockDeal } from "@/data/mockData";
import { cn } from "@/lib/utils";

const DealDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  
  useEffect(() => {
    const fetchDeal = () => {
      // In a real app, this would be an API call
      if (id) {
        const dealData = getMockDeal(id);
        if (dealData) {
          setDeal(dealData);
        }
      }
      setLoading(false);
    };
    
    fetchDeal();
  }, [id]);
  
  const getStatusClass = (status: string) => {
    return `deal-status-${status}`;
  };
  
  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading deal information...</p>
        </div>
      </AppLayout>
    );
  }
  
  if (!deal) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Deal Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The deal you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => navigate("/deals")}>
            <ChevronLeft className="h-4 w-4 mr-2" /> Back to Deals
          </Button>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ChevronLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        
        <div className="flex flex-wrap gap-4 items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-semibold">{deal.title}</h1>
              <Badge className={cn("deal-status-badge", getStatusClass(deal.status))}>
                {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
              </Badge>
            </div>
            <p className="text-muted-foreground">{deal.description}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" /> Add Document
            </Button>
            <Button>
              <MessageSquare className="h-4 w-4 mr-2" /> Message
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Deal Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {deal.milestones.map((milestone, index) => (
                      <div key={milestone.id} className="relative">
                        {index < deal.milestones.length - 1 && (
                          <div className="absolute left-3 top-6 h-full w-0.5 bg-border" />
                        )}
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "flex items-center justify-center w-6 h-6 rounded-full mt-1",
                            milestone.status === "completed" 
                              ? "bg-deal-completed text-white" 
                              : milestone.status === "in_progress" 
                                ? "bg-deal-active text-white" 
                                : "bg-border text-foreground"
                          )}>
                            <span className="text-xs">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="text-base font-medium">{milestone.title}</h3>
                              <Badge variant="outline">
                                {milestone.status === "completed" ? "Completed" : 
                                 milestone.status === "in_progress" ? "In Progress" : 
                                 milestone.status === "blocked" ? "Blocked" : "Not Started"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                            
                            {milestone.dueDate && (
                              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4 mr-1" />
                                Due {milestone.dueDate.toLocaleDateString()}
                              </div>
                            )}
                            
                            {milestone.status === "in_progress" && (
                              <div className="mt-4">
                                <Button size="sm">Continue</Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  {deal.documents.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No documents yet</h3>
                      <p className="text-muted-foreground mb-4">Upload documents to share with deal participants</p>
                      <Button>Upload Document</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {deal.documents.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-8 w-8 text-primary" />
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <span>
                                  {new Intl.DateTimeFormat("en-US", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric"
                                  }).format(doc.uploadedAt)}
                                </span>
                                <span className="mx-1">•</span>
                                <span>{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                                {doc.status === "signed" && (
                                  <>
                                    <span className="mx-1">•</span>
                                    <Badge variant="outline" className="text-xs">Signed</Badge>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">View</Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle>Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Deal created</p>
                        <p className="text-sm text-muted-foreground">
                          {new Intl.DateTimeFormat("en-US", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "numeric",
                            minute: "numeric"
                          }).format(deal.createdAt)}
                        </p>
                      </div>
                    </div>
                    
                    {deal.milestones.filter(m => m.status === "completed").map(milestone => (
                      <div key={milestone.id} className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-deal-completed/20 text-deal-completed flex items-center justify-center">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{milestone.title} completed</p>
                          <p className="text-sm text-muted-foreground">
                            {milestone.completedAt && new Intl.DateTimeFormat("en-US", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "numeric",
                              minute: "numeric"
                            }).format(milestone.completedAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="messages">
              <Card>
                <CardHeader>
                  <CardTitle>Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
                    <p className="text-muted-foreground mb-4">Send messages to other participants in this deal</p>
                    <Button>New Message</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Deal Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-1">
                <Progress value={deal.healthScore} className="h-2 flex-1" />
                <span className="text-sm font-medium">{deal.healthScore}%</span>
              </div>
              <p className="text-xs text-muted-foreground">Based on progress and activity</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Participants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {deal.participants.map(participant => (
                <div key={participant.id} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://ui-avatars.com/api/?name=User+${participant.id}&background=0D8ABC&color=fff`} alt={`User ${participant.id}`} />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {participant.role === "seller" ? "Seller" : 
                       participant.role === "buyer" ? "Buyer" : 
                       participant.role === "lawyer" ? "Lawyer" : "Admin"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Intl.DateTimeFormat("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      }).format(participant.joined)}
                    </p>
                  </div>
                </div>
              ))}
              {deal.status === "draft" && (
                <Button variant="outline" className="w-full text-sm">
                  <Users className="h-4 w-4 mr-2" />
                  Invite Participant
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default DealDetails;
