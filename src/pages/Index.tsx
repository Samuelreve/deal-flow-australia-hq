
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

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
              <Button onClick={() => navigate("/login")}>Get Started</Button>
            </>
          )}
        </div>
      </header>
      
      <main>
        {/* Hero Section */}
        <section className="py-16 md:py-24 lg:py-32 px-4 md:px-6">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Streamlined Business Exchange Platform
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
                Dramatically speed up the process of buying and selling businesses, reducing the typical timeline from months to weeks.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => navigate("/login")}>
                  Start Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/login")}>
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-muted/50 px-4 md:px-6">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg shadow-sm border">
                <div className="h-12 w-12 bg-primary/10 rounded-md flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Guided Workflow</h3>
                <p className="text-muted-foreground">Step-by-step process engine with customizable milestones for each business deal.</p>
              </div>
              
              <div className="bg-card p-6 rounded-lg shadow-sm border">
                <div className="h-12 w-12 bg-primary/10 rounded-md flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Deal Room</h3>
                <p className="text-muted-foreground">A central, secure space for all communications, documents, and progress tracking.</p>
              </div>
              
              <div className="bg-card p-6 rounded-lg shadow-sm border">
                <div className="h-12 w-12 bg-primary/10 rounded-md flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Collaboration</h3>
                <p className="text-muted-foreground">Real-time notes, chat, and commenting features within the deal room.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 md:py-24 px-4 md:px-6">
          <div className="container mx-auto max-w-5xl">
            <div className="bg-primary text-primary-foreground rounded-lg p-8 md:p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Ready to transform your business deals?
              </h2>
              <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
                Join DealPilot today and experience the future of business buying and selling.
              </p>
              <Button size="lg" variant="secondary" onClick={() => navigate("/login")}>
                Get Started
              </Button>
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
