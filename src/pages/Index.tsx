
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, BarChart3, ShieldCheck, Clock, Calendar, FileText, MessageSquare } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen bg-background">
      <header className="h-16 px-4 md:px-6 flex items-center justify-between border-b">
        <div className="text-xl font-semibold">DealPilot</div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Button onClick={() => navigate("/dashboard")}>Dashboard</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate("/login")}>Log in</Button>
              <Button onClick={() => navigate("/signup")}>Get Started</Button>
            </>
          )}
        </div>
      </header>
      
      <main>
        {/* Hero Section */}
        <section className="py-16 md:py-24 lg:py-32 px-4 md:px-6 bg-gradient-to-b from-background to-muted/40">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 animate-fade-in">
                Revolutionizing Business Transactions
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10 animate-fade-in">
                DealPilot reduces the typical business sale timeline from months to weeks through AI-powered workflows, secure document management, and intelligent collaboration.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => navigate("/signup")} className="animate-fade-in">
                  Start For Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("#how-it-works")} className="animate-fade-in">
                  See How It Works
                </Button>
              </div>
            </div>
            
            {/* Stats Section */}
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              <div className="bg-card p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow animate-fade-in">
                <div className="text-3xl font-bold text-primary mb-2">40%</div>
                <p className="text-muted-foreground">Faster Deal Completion</p>
              </div>
              <div className="bg-card p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow animate-fade-in">
                <div className="text-3xl font-bold text-primary mb-2">90%</div>
                <p className="text-muted-foreground">Reduced Documentation Errors</p>
              </div>
              <div className="bg-card p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow animate-fade-in">
                <div className="text-3xl font-bold text-primary mb-2">60%</div>
                <p className="text-muted-foreground">Less Legal Back-and-Forth</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section id="features" className="py-16 bg-muted/50 px-4 md:px-6">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold text-center mb-4">Our Platform Features</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
              DealPilot combines cutting-edge technology with industry expertise to streamline every aspect of business sales.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-card p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="h-12 w-12 bg-primary/10 rounded-md flex items-center justify-center mb-4">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI-Powered Document Intelligence</h3>
                <p className="text-muted-foreground">
                  Our advanced AI explains complex legal clauses in plain language, generates customized document templates, and provides quick summaries of lengthy documents.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="h-12 w-12 bg-primary/10 rounded-md flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Smart Document Management</h3>
                <p className="text-muted-foreground">
                  Secure storage with version history, automated organization, and role-based access ensures everyone sees exactly what they need to see.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="h-12 w-12 bg-primary/10 rounded-md flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Unified Communication</h3>
                <p className="text-muted-foreground">
                  Centralized messaging, contextual commenting, and document annotations keep all communications in one place, eliminating confusion.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="h-12 w-12 bg-primary/10 rounded-md flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
                <p className="text-muted-foreground">
                  Visual milestone tracking with automated updates keeps everyone informed of deal progress and upcoming steps.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 md:py-20 px-4 md:px-6">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold text-center mb-4">How DealPilot Works</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
              Our structured approach simplifies even the most complex business transactions.
            </p>
            
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="md:w-1/2 order-2 md:order-1">
                  <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                    <h3 className="text-xl font-medium flex items-center mb-3">
                      <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center mr-3">1</span>
                      Deal Creation
                    </h3>
                    <p className="text-muted-foreground">
                      Set up your deal with basic information, invite all relevant stakeholders, and establish the initial timeline. DealPilot configures the appropriate workflow based on transaction type.
                    </p>
                  </div>
                </div>
                <div className="md:w-1/2 order-1 md:order-2 flex justify-center">
                  <div className="bg-card rounded-lg border p-4 shadow-sm w-full max-w-md aspect-video flex items-center justify-center">
                    <Calendar className="h-16 w-16 text-primary/60" />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="md:w-1/2 flex justify-center">
                  <div className="bg-card rounded-lg border p-4 shadow-sm w-full max-w-md aspect-video flex items-center justify-center">
                    <FileText className="h-16 w-16 text-primary/60" />
                  </div>
                </div>
                <div className="md:w-1/2">
                  <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                    <h3 className="text-xl font-medium flex items-center mb-3">
                      <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center mr-3">2</span>
                      Document Management
                    </h3>
                    <p className="text-muted-foreground">
                      Upload, generate, and share crucial documents. AI assistance helps clarify legal terms, generate templates, and ensure everyone understands their commitments.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="md:w-1/2 order-2 md:order-1">
                  <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                    <h3 className="text-xl font-medium flex items-center mb-3">
                      <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center mr-3">3</span>
                      Milestone Progress
                    </h3>
                    <p className="text-muted-foreground">
                      Track the deal's progression through key milestones with automated notifications and reminders to keep things moving forward efficiently.
                    </p>
                  </div>
                </div>
                <div className="md:w-1/2 order-1 md:order-2 flex justify-center">
                  <div className="bg-card rounded-lg border p-4 shadow-sm w-full max-w-md aspect-video flex items-center justify-center">
                    <Clock className="h-16 w-16 text-primary/60" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Benefits Section */}
        <section id="benefits" className="py-16 bg-muted/50 px-4 md:px-6">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose DealPilot</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-5 border rounded-lg bg-card hover:shadow-md transition-shadow">
                <CheckCircle className="h-8 w-8 text-green-500 mb-3" />
                <h3 className="font-semibold text-lg mb-2">Speed & Efficiency</h3>
                <p className="text-sm text-muted-foreground">Reduce transaction time by up to 40% with structured workflows and automation.</p>
              </div>
              
              <div className="p-5 border rounded-lg bg-card hover:shadow-md transition-shadow">
                <CheckCircle className="h-8 w-8 text-green-500 mb-3" />
                <h3 className="font-semibold text-lg mb-2">Transparency</h3>
                <p className="text-sm text-muted-foreground">Everyone knows exactly where things stand at all times.</p>
              </div>
              
              <div className="p-5 border rounded-lg bg-card hover:shadow-md transition-shadow">
                <CheckCircle className="h-8 w-8 text-green-500 mb-3" />
                <h3 className="font-semibold text-lg mb-2">Reduced Legal Costs</h3>
                <p className="text-sm text-muted-foreground">AI-assisted document generation and review save on expensive legal hours.</p>
              </div>
              
              <div className="p-5 border rounded-lg bg-card hover:shadow-md transition-shadow">
                <CheckCircle className="h-8 w-8 text-green-500 mb-3" />
                <h3 className="font-semibold text-lg mb-2">Security & Compliance</h3>
                <p className="text-sm text-muted-foreground">Bank-level encryption and role-based access protects sensitive information.</p>
              </div>
              
              <div className="p-5 border rounded-lg bg-card hover:shadow-md transition-shadow">
                <CheckCircle className="h-8 w-8 text-green-500 mb-3" />
                <h3 className="font-semibold text-lg mb-2">Stress Reduction</h3>
                <p className="text-sm text-muted-foreground">Clear processes and better communication eliminate deal anxiety.</p>
              </div>
              
              <div className="p-5 border rounded-lg bg-card hover:shadow-md transition-shadow">
                <CheckCircle className="h-8 w-8 text-green-500 mb-3" />
                <h3 className="font-semibold text-lg mb-2">Higher Success Rate</h3>
                <p className="text-sm text-muted-foreground">More deals close successfully with fewer last-minute surprises.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="py-16 md:py-20 px-4 md:px-6">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left">
                  How does DealPilot speed up the business sale process?
                </AccordionTrigger>
                <AccordionContent>
                  DealPilot eliminates common bottlenecks by providing a structured workflow, automated document management, clear milestone tracking, and AI-assisted document creation and review. This significantly reduces the back-and-forth between parties and minimizes delays.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">
                  Is my sensitive business information secure on the platform?
                </AccordionTrigger>
                <AccordionContent>
                  Absolutely. DealPilot uses bank-level encryption, role-based access controls, and secure cloud infrastructure. Each participant only sees the information they're authorized to access based on their role in the transaction.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">
                  Can my lawyer and accountant collaborate on the platform?
                </AccordionTrigger>
                <AccordionContent>
                  Yes, DealPilot is designed for multi-party collaboration. You can invite any professional advisors to the platform and assign them appropriate roles and permissions. They'll be able to review documents, provide input, and communicate efficiently with all parties.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">
                  How accurate is the AI document assistance?
                </AccordionTrigger>
                <AccordionContent>
                  Our AI tools are trained on extensive legal and business transaction datasets. While they provide excellent assistance for understanding and generating standard documents, we always recommend professional review for critical legal documents. The AI serves as an efficiency tool, not a replacement for professional advice.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left">
                  What types of businesses is DealPilot appropriate for?
                </AccordionTrigger>
                <AccordionContent>
                  DealPilot is flexible and works for businesses of all sizes, from small local establishments to mid-market companies. The platform is particularly valuable for transactions between $500,000 and $50 million where efficiency and organization are critical, but legal resources might be limited.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 md:py-24 px-4 md:px-6">
          <div className="container mx-auto max-w-5xl">
            <div className="bg-primary text-primary-foreground rounded-lg p-8 md:p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Ready to transform your business sale experience?
              </h2>
              <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
                Join thousands of business owners who have streamlined their transactions with DealPilot. Get started for free today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" onClick={() => navigate("/signup")}>
                  Create Free Account
                </Button>
                <Button size="lg" variant="outline" className="bg-primary/90 border-primary-foreground/20" onClick={() => navigate("/login")}>
                  Log In
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="border-t py-8 px-4 md:px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="text-lg font-semibold">DealPilot</div>
              <p className="text-sm text-muted-foreground">
                Revolutionizing business exchange
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 DealPilot. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
