
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, BarChart3, ShieldCheck, Clock, Calendar, FileText, MessageSquare, ChevronRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    transition={{ duration: 0.2 }}
    className="bg-gradient-to-br from-card to-background/80 p-6 rounded-xl shadow-md border border-border/50 hover:border-primary/20 hover:shadow-lg transition-all"
  >
    <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">
      {description}
    </p>
  </motion.div>
);

const StepCard = ({ number, title, description, icon }: { number: number, title: string, description: string, icon: React.ReactNode }) => (
  <motion.div 
    whileInView={{ opacity: [0, 1], y: [20, 0] }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="flex flex-col md:flex-row gap-6 items-center"
  >
    <div className="md:w-1/2 flex justify-center order-1 md:order-2">
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 shadow-inner border border-primary/10 w-full max-w-md aspect-video flex items-center justify-center">
        {icon}
      </div>
    </div>
    <div className="md:w-1/2 order-2 md:order-1">
      <div className="bg-gradient-to-br from-background to-muted/20 p-6 rounded-xl border border-primary/10">
        <h3 className="text-xl font-medium flex items-center mb-3">
          <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center mr-3">{number}</span>
          {title}
        </h3>
        <p className="text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  </motion.div>
);

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // Add a function to handle scrolling to the "how it works" section
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return (
    <div className="min-h-screen">
      {/* Hero Section with gradient background */}
      <header className="relative bg-gradient-to-b from-background to-background/80">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="h-16 px-4 md:px-6 flex items-center justify-between border-b backdrop-blur-sm z-10 relative">
          <div className="text-xl font-semibold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">DealPilot</div>
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
        </div>
        
        <div className="py-16 md:py-28 lg:py-32 px-4 md:px-6 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="container mx-auto max-w-5xl relative z-10"
          >
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-blue-600">
                Revolutionizing Business Transactions
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
                DealPilot reduces the typical business sale timeline from months to weeks through AI-powered workflows, secure document management, and intelligent collaboration.
              </p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button size="lg" onClick={() => navigate("/signup")} className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white border-0">
                  Start For Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => scrollToSection("how-it-works")}>
                  See How It Works
                </Button>
              </motion.div>
            </div>
            
            {/* Stats Section */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center"
            >
              <Card className="bg-gradient-to-br from-card to-muted/20 border-primary/10 hover:border-primary/30 hover:shadow-md transition-all">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary mb-2">40%</div>
                  <p className="text-muted-foreground">Faster Deal Completion</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-card to-muted/20 border-primary/10 hover:border-primary/30 hover:shadow-md transition-all">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary mb-2">90%</div>
                  <p className="text-muted-foreground">Reduced Documentation Errors</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-card to-muted/20 border-primary/10 hover:border-primary/30 hover:shadow-md transition-all">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary mb-2">60%</div>
                  <p className="text-muted-foreground">Less Legal Back-and-Forth</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Decorative elements */}
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-muted/30 to-transparent"></div>
        </div>
      </header>
      
      <main>
        {/* Features Section */}
        <section id="features" className="py-20 bg-gradient-to-b from-muted/30 to-background px-4 md:px-6">
          <div className="container mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold text-center mb-4">Our Platform Features</h2>
              <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
                DealPilot combines cutting-edge technology with industry expertise to streamline every aspect of business sales.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FeatureCard 
                icon={<ShieldCheck className="h-6 w-6 text-primary" />}
                title="AI-Powered Document Intelligence"
                description="Our advanced AI explains complex legal clauses in plain language, generates customized document templates, and provides quick summaries."
              />
              
              <FeatureCard 
                icon={<FileText className="h-6 w-6 text-primary" />}
                title="Smart Document Management"
                description="Secure storage with version history, automated organization, and role-based access ensures everyone sees exactly what they need."
              />
              
              <FeatureCard 
                icon={<MessageSquare className="h-6 w-6 text-primary" />}
                title="Unified Communication"
                description="Centralized messaging, contextual commenting, and document annotations keep all communications in one place, eliminating confusion."
              />
              
              <FeatureCard 
                icon={<BarChart3 className="h-6 w-6 text-primary" />}
                title="Progress Tracking"
                description="Visual milestone tracking with automated updates keeps everyone informed of deal progress and upcoming steps."
              />
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 px-4 md:px-6 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold text-center mb-4">How DealPilot Works</h2>
              <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
                Our structured approach simplifies even the most complex business transactions.
              </p>
            </motion.div>
            
            <div className="space-y-20">
              <StepCard 
                number={1} 
                title="Deal Creation" 
                description="Set up your deal with basic information, invite all relevant stakeholders, and establish the initial timeline. DealPilot configures the appropriate workflow based on transaction type."
                icon={<Calendar className="h-16 w-16 text-primary/60" />}
              />
              
              <StepCard 
                number={2} 
                title="Document Management" 
                description="Upload, generate, and share crucial documents. AI assistance helps clarify legal terms, generate templates, and ensure everyone understands their commitments."
                icon={<FileText className="h-16 w-16 text-primary/60" />}
              />
              
              <StepCard 
                number={3} 
                title="Milestone Progress" 
                description="Track the deal's progression through key milestones with automated notifications and reminders to keep things moving forward efficiently."
                icon={<Clock className="h-16 w-16 text-primary/60" />}
              />
            </div>
          </div>
        </section>
        
        {/* Benefits Section with Cards */}
        <section id="benefits" className="py-20 bg-gradient-to-b from-muted/20 to-background px-4 md:px-6">
          <div className="container mx-auto max-w-5xl">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold text-center mb-12"
            >
              Why Choose DealPilot
            </motion.h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div 
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
                className="p-5 border rounded-xl bg-gradient-to-br from-card to-background/80 hover:border-primary/20 hover:shadow-lg transition-all"
              >
                <CheckCircle className="h-8 w-8 text-green-500 mb-3" />
                <h3 className="font-semibold text-lg mb-2">Speed & Efficiency</h3>
                <p className="text-sm text-muted-foreground">Reduce transaction time by up to 40% with structured workflows and automation.</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
                className="p-5 border rounded-xl bg-gradient-to-br from-card to-background/80 hover:border-primary/20 hover:shadow-lg transition-all"
              >
                <CheckCircle className="h-8 w-8 text-green-500 mb-3" />
                <h3 className="font-semibold text-lg mb-2">Transparency</h3>
                <p className="text-sm text-muted-foreground">Everyone knows exactly where things stand at all times.</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
                className="p-5 border rounded-xl bg-gradient-to-br from-card to-background/80 hover:border-primary/20 hover:shadow-lg transition-all"
              >
                <CheckCircle className="h-8 w-8 text-green-500 mb-3" />
                <h3 className="font-semibold text-lg mb-2">Reduced Legal Costs</h3>
                <p className="text-sm text-muted-foreground">AI-assisted document generation and review save on expensive legal hours.</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
                className="p-5 border rounded-xl bg-gradient-to-br from-card to-background/80 hover:border-primary/20 hover:shadow-lg transition-all"
              >
                <CheckCircle className="h-8 w-8 text-green-500 mb-3" />
                <h3 className="font-semibold text-lg mb-2">Security & Compliance</h3>
                <p className="text-sm text-muted-foreground">Bank-level encryption and role-based access protects sensitive information.</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
                className="p-5 border rounded-xl bg-gradient-to-br from-card to-background/80 hover:border-primary/20 hover:shadow-lg transition-all"
              >
                <CheckCircle className="h-8 w-8 text-green-500 mb-3" />
                <h3 className="font-semibold text-lg mb-2">Stress Reduction</h3>
                <p className="text-sm text-muted-foreground">Clear processes and better communication eliminate deal anxiety.</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
                className="p-5 border rounded-xl bg-gradient-to-br from-card to-background/80 hover:border-primary/20 hover:shadow-lg transition-all"
              >
                <CheckCircle className="h-8 w-8 text-green-500 mb-3" />
                <h3 className="font-semibold text-lg mb-2">Higher Success Rate</h3>
                <p className="text-sm text-muted-foreground">More deals close successfully with fewer last-minute surprises.</p>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="py-20 px-4 md:px-6 bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto max-w-3xl">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold text-center mb-12"
            >
              Frequently Asked Questions
            </motion.h2>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-b border-border/50">
                <AccordionTrigger className="text-left hover:text-primary">
                  How does DealPilot speed up the business sale process?
                </AccordionTrigger>
                <AccordionContent>
                  DealPilot eliminates common bottlenecks by providing a structured workflow, automated document management, clear milestone tracking, and AI-assisted document creation and review. This significantly reduces the back-and-forth between parties and minimizes delays.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2" className="border-b border-border/50">
                <AccordionTrigger className="text-left hover:text-primary">
                  Is my sensitive business information secure on the platform?
                </AccordionTrigger>
                <AccordionContent>
                  Absolutely. DealPilot uses bank-level encryption, role-based access controls, and secure cloud infrastructure. Each participant only sees the information they're authorized to access based on their role in the transaction.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3" className="border-b border-border/50">
                <AccordionTrigger className="text-left hover:text-primary">
                  Can my lawyer and accountant collaborate on the platform?
                </AccordionTrigger>
                <AccordionContent>
                  Yes, DealPilot is designed for multi-party collaboration. You can invite any professional advisors to the platform and assign them appropriate roles and permissions. They'll be able to review documents, provide input, and communicate efficiently with all parties.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4" className="border-b border-border/50">
                <AccordionTrigger className="text-left hover:text-primary">
                  How accurate is the AI document assistance?
                </AccordionTrigger>
                <AccordionContent>
                  Our AI tools are trained on extensive legal and business transaction datasets. While they provide excellent assistance for understanding and generating standard documents, we always recommend professional review for critical legal documents. The AI serves as an efficiency tool, not a replacement for professional advice.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5" className="border-b border-border/50">
                <AccordionTrigger className="text-left hover:text-primary">
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
        <section className="py-20 px-4 md:px-6">
          <div className="container mx-auto max-w-5xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-primary/90 to-purple-500/90 text-white rounded-2xl p-8 md:p-12 text-center shadow-xl"
            >
              <h2 className="text-3xl font-bold mb-4">
                Ready to transform your business sale experience?
              </h2>
              <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto">
                Join thousands of business owners who have streamlined their transactions with DealPilot. Get started for free today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" onClick={() => navigate("/signup")} className="font-medium">
                  Create Free Account <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/10" onClick={() => navigate("/login")}>
                  Log In
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <footer className="border-t py-12 px-4 md:px-6 bg-gradient-to-b from-background/50 to-muted/20">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="text-xl font-semibold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">DealPilot</div>
              <p className="text-sm text-muted-foreground mt-1">
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
