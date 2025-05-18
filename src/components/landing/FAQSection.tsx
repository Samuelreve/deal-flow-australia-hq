
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";

const FAQSection = () => {
  return (
    <section className="py-24 px-4 md:px-6 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get answers to commonly asked questions about our platform
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-b border-border/50">
              <AccordionTrigger className="text-left hover:text-primary transition-colors py-5">
                How does DealPilot speed up the business sale process?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                DealPilot eliminates common bottlenecks by providing a structured workflow, automated document management, clear milestone tracking, and AI-assisted document creation and review. This significantly reduces the back-and-forth between parties and minimizes delays.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2" className="border-b border-border/50">
              <AccordionTrigger className="text-left hover:text-primary transition-colors py-5">
                Is my sensitive business information secure on the platform?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Absolutely. DealPilot uses bank-level encryption, role-based access controls, and secure cloud infrastructure. Each participant only sees the information they're authorized to access based on their role in the transaction.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3" className="border-b border-border/50">
              <AccordionTrigger className="text-left hover:text-primary transition-colors py-5">
                Can my lawyer and accountant collaborate on the platform?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes, DealPilot is designed for multi-party collaboration. You can invite any professional advisors to the platform and assign them appropriate roles and permissions. They'll be able to review documents, provide input, and communicate efficiently with all parties.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4" className="border-b border-border/50">
              <AccordionTrigger className="text-left hover:text-primary transition-colors py-5">
                How accurate is the AI document assistance?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Our AI tools are trained on extensive legal and business transaction datasets. While they provide excellent assistance for understanding and generating standard documents, we always recommend professional review for critical legal documents. The AI serves as an efficiency tool, not a replacement for professional advice.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5" className="border-b border-border/50">
              <AccordionTrigger className="text-left hover:text-primary transition-colors py-5">
                What types of businesses is DealPilot appropriate for?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                DealPilot is flexible and works for businesses of all sizes, from small local establishments to mid-market companies. The platform is particularly valuable for transactions between $500,000 and $50 million where efficiency and organization are critical, but legal resources might be limited.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
