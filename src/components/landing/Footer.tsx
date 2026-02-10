import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

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
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="border-t border-border/30 bg-muted/30"
    >
      <div className="container mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-4">
            <img
              src="/trustroom-logo.webp"
              alt="Trustroom.ai"
              className="h-16 w-auto object-contain"
            />
            <p className="text-[15px] text-muted-foreground leading-[1.7] max-w-[240px]">
              AI-powered deal rooms for M&A lawyers. Close deals faster with
              secure document management and intelligent workflows.
            </p>
            <div className="flex items-center gap-4 pt-1">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground/60 hover:text-primary transition-colors duration-200"
                aria-label="Twitter"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground/60 hover:text-primary transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
              </a>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground text-sm">Resources</h3>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-[15px] text-muted-foreground hover:text-primary transition-colors duration-200 inline-flex items-center gap-1.5 group"
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
            <h3 className="font-semibold text-foreground text-sm">Legal</h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-[15px] text-muted-foreground hover:text-primary transition-colors duration-200 inline-flex items-center gap-1.5 group"
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
            <h3 className="font-semibold text-foreground text-sm">Contact Us</h3>
            <ul className="space-y-3">
              <li>
                <a href="mailto:contact@trustroom.ai" className="text-[15px] text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary/60" /> contact@trustroom.ai
                </a>
              </li>
              <li>
                <a href="tel:+6100000000" className="text-[15px] text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary/60" /> +61 0000 0000
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary/60 mt-0.5 flex-shrink-0" />
                <address className="text-[15px] text-muted-foreground not-italic leading-[1.7]">
                  123 Business Street<br />Sydney, NSW 2000<br />Australia
                </address>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border/30 bg-muted/20">
        <div className="container mx-auto max-w-6xl px-6 py-5">
          <p className="text-xs text-muted-foreground text-center">
            © {currentYear} Trustroom.ai. All rights reserved.
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
