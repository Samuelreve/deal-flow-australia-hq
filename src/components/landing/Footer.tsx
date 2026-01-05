import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, ExternalLink, ArrowRight } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const resourceLinks = [
    { name: "Help Center", href: "#" },
    { name: "API Documentation", href: "#" },
    { name: "Developer Resources", href: "#" },
    { name: "Community Forum", href: "#" },
  ];

  const legalLinks = [
    { name: "Terms of Service", href: "/terms-of-service" },
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Cookie Policy", href: "/cookie-policy" },
    { name: "Accessibility", href: "/accessibility" },
  ];

  return (
    <footer className="relative border-t bg-gradient-to-b from-background via-muted/30 to-muted/50">
      {/* Main Footer Content */}
      <div className="container mx-auto max-w-7xl px-4 md:px-6 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8"
        >
          {/* Brand Section */}
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <img 
                src="/trustroom-logo.webp" 
                alt="Trustroom.ai" 
                className="h-16 w-auto object-contain flex-shrink-0" 
              />
              <p className="text-sm text-muted-foreground leading-relaxed">
                Revolutionizing business exchange with AI-powered tools and seamless document management.
              </p>
            </div>
            {/* Social Links */}
            <div className="flex items-center justify-center gap-4">
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
            </div>
          </div>
          
          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Resources</h3>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Legal</h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Contact Us</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="mailto:contact@trustroom.ai" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Mail className="h-4 w-4 text-primary/70" />
                  contact@trustroom.ai
                </a>
              </li>
              <li>
                <a 
                  href="tel:+6100000000" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Phone className="h-4 w-4 text-primary/70" />
                  +61 0000 0000
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary/70 mt-0.5 flex-shrink-0" />
                <address className="text-sm text-muted-foreground not-italic">
                  123 Business Street<br />
                  Sydney, NSW 2000<br />
                  Australia
                </address>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="border-t border-border/40 bg-muted/30"
      >
        <div className="container mx-auto max-w-7xl px-4 md:px-6 py-5">
          <p className="text-sm text-muted-foreground text-center">
            © {currentYear} Trustroom.ai. All rights reserved.
          </p>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;
