
const Footer = () => {
  return (
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
  );
};

export default Footer;
