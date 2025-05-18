
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="border-t py-12 px-4 md:px-6 bg-gradient-to-b from-background/50 to-muted/20">
      <div className="container mx-auto max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-center"
        >
          <div className="mb-6 md:mb-0">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">DealPilot</div>
            <p className="text-sm text-muted-foreground mt-1">
              Revolutionizing business exchange
            </p>
          </div>
          <div className="flex flex-col items-center md:items-end">
            <div className="text-sm text-muted-foreground">
              © 2025 DealPilot. All rights reserved.
            </div>
            <div className="mt-2 flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Terms</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Privacy</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Contact</a>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
