import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "How does Trustroom.ai speed up the M&A process?",
    a: "Trustroom.ai eliminates common bottlenecks through AI-powered document review, automated due diligence checklists, integrated e-signatures, and structured milestone tracking. This typically reduces deal timelines from months to weeks by minimizing manual work and back-and-forth communication.",
  },
  {
    q: "Is my sensitive deal data secure on the platform?",
    a: "Absolutely. We use bank-level encryption at rest and in transit, row-level security policies, and granular role-based access controls. Each participant only sees documents and data they're authorized to access based on their deal role. Full audit trails are maintained for compliance.",
  },
  {
    q: "Can my legal team, accountant, and advisors all collaborate?",
    a: "Yes. Trustroom.ai supports multi-party collaboration with role-based permissions for sellers, buyers, lawyers, advisors, and other stakeholders. Each role gets tailored views and appropriate access levels within the deal room.",
  },
  {
    q: "How accurate is the AI document analysis?",
    a: "Our AI is trained on extensive legal and business transaction datasets and provides excellent assistance for summarizing contracts, flagging risks, and explaining complex clauses. While it dramatically accelerates review, we always recommend professional legal review for final decisions — the AI is a powerful efficiency tool, not a replacement for legal counsel.",
  },
  {
    q: "What types of transactions does Trustroom.ai support?",
    a: "We support business sales, IP transfers, real estate transactions, cross-border deals, and micro-deals. Each category has purpose-built workflows, checklists, and milestone templates designed for that specific transaction type. The platform is most valuable for deals between $500K and $50M.",
  },
  {
    q: "Do I need to install anything or can I start immediately?",
    a: "Trustroom.ai is fully cloud-based — no installation required. Create your free account, set up your first deal room in minutes, and invite stakeholders immediately. The platform works on any modern browser, on desktop and mobile.",
  },
];

const FAQSection = () => {
  return (
    <section className="py-20 md:py-28 px-4 md:px-6 bg-muted/20">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-semibold text-primary bg-primary/10 rounded-full mb-4">
            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Frequently Asked{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
              Questions
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about getting started
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border/50 rounded-xl bg-card px-5 data-[state=open]:border-primary/20 data-[state=open]:shadow-sm transition-all"
              >
                <AccordionTrigger className="text-left hover:no-underline py-5 text-sm font-medium">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
