
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Mail, Phone, Copyright, ExternalLink } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t py-12 px-4 md:px-6 bg-gradient-to-b from-background/50 to-muted/20">
      <div className="container mx-auto max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Company Information */}
          <div className="space-y-4">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">DealPilot</div>
            <p className="text-sm text-muted-foreground mt-1">
              Revolutionizing business exchange with AI-powered tools and seamless document management.
            </p>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Copyright className="h-4 w-4" />
              <span>{currentYear} DealPilot. All rights reserved.</span>
            </div>
          </div>
          
          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="#" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="#" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  API Documentation
                </Link>
              </li>
              <li>
                <Link to="#" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Developer Resources
                </Link>
              </li>
              <li>
                <Link to="#" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Community Forum
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Contact Us</h3>
            <div className="space-y-2">
              <a href="mailto:contact@dealpilot.com" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                contact@dealpilot.com
              </a>
              <a href="tel:+6100000000" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                +61 0000 0000
              </a>
              <address className="text-sm text-muted-foreground not-italic">
                123 Business Street <br />
                Sydney, NSW 2000 <br />
                Australia
              </address>
            </div>
            <div className="flex space-x-4 mt-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
            </div>
          </div>
        </motion.div>
        
        {/* Lower Footer - Links */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row justify-center items-center mt-12 pt-6 border-t border-border/40"
        >
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Terms of Service</Link>
            <Link to="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Privacy Policy</Link>
            <Link to="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Cookie Policy</Link>
            <Link to="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Accessibility</Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
