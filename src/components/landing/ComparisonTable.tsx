import { motion } from "framer-motion";
import { Check, X, Zap } from "lucide-react";

interface ComparisonItem {
  feature: string;
  traditional: string | boolean;
  trustroom: string | boolean;
}

const comparisonData: ComparisonItem[] = [
  {
    feature: "Deal Timeline",
    traditional: "3-6 months",
    trustroom: "4-8 weeks",
  },
  {
    feature: "Document Review",
    traditional: "Manual, days",
    trustroom: "AI-powered, minutes",
  },
  {
    feature: "Legal Back-and-Forth",
    traditional: "Endless emails",
    trustroom: "60% reduction",
  },
  {
    feature: "Due Diligence",
    traditional: "Paper-based",
    trustroom: "Automated checklists",
  },
  {
    feature: "Real-time Updates",
    traditional: false,
    trustroom: true,
  },
  {
    feature: "AI Deal Advisor",
    traditional: false,
    trustroom: true,
  },
  {
    feature: "Signature Integration",
    traditional: "External tools",
    trustroom: "Built-in DocuSign",
  },
];

const ComparisonTable = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Businesses Choose{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
              Trustroom.ai
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See how AI-powered deal management transforms the traditional process
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="overflow-hidden rounded-xl border border-border bg-card"
        >
          {/* Header */}
          <div className="grid grid-cols-3 bg-muted/50 border-b border-border">
            <div className="p-4 font-medium text-muted-foreground">Feature</div>
            <div className="p-4 font-medium text-center text-muted-foreground border-l border-border">
              Traditional M&A
            </div>
            <div className="p-4 font-medium text-center border-l border-border">
              <span className="inline-flex items-center gap-1.5 text-primary">
                <Zap className="h-4 w-4" />
                Trustroom.ai
              </span>
            </div>
          </div>

          {/* Rows */}
          {comparisonData.map((item, index) => (
            <motion.div
              key={item.feature}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true }}
              className={`grid grid-cols-3 ${
                index !== comparisonData.length - 1 ? "border-b border-border" : ""
              } hover:bg-muted/30 transition-colors`}
            >
              <div className="p-4 font-medium">{item.feature}</div>
              <div className="p-4 text-center border-l border-border text-muted-foreground">
                {typeof item.traditional === "boolean" ? (
                  item.traditional ? (
                    <Check className="h-5 w-5 text-primary mx-auto" />
                  ) : (
                    <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                  )
                ) : (
                  item.traditional
                )}
              </div>
              <div className="p-4 text-center border-l border-border">
                {typeof item.trustroom === "boolean" ? (
                  item.trustroom ? (
                    <Check className="h-5 w-5 text-primary mx-auto" />
                  ) : (
                    <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                  )
                ) : (
                  <span className="font-medium text-primary">{item.trustroom}</span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ComparisonTable;
