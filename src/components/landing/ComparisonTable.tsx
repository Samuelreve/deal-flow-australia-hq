import { motion } from "framer-motion";
import { Check, X, Zap } from "lucide-react";

interface ComparisonItem {
  feature: string;
  traditional: string | boolean;
  trustroom: string | boolean;
}

const comparisonData: ComparisonItem[] = [
  {
    feature: "Average Deal Timeline",
    traditional: "4–8 months",
    trustroom: "6–12 weeks",
  },
  {
    feature: "Document Review",
    traditional: "Manual, days per batch",
    trustroom: "AI-powered, minutes",
  },
  {
    feature: "Legal Back-and-Forth",
    traditional: "Endless email threads",
    trustroom: "60% reduction",
  },
  {
    feature: "Due Diligence Checklists",
    traditional: "Spreadsheets & email",
    trustroom: "Automated & AI-generated",
  },
  {
    feature: "Real-time Deal Tracking",
    traditional: false,
    trustroom: true,
  },
  {
    feature: "AI Deal Health Scoring",
    traditional: false,
    trustroom: true,
  },
  {
    feature: "Integrated e-Signatures",
    traditional: "External tools required",
    trustroom: "Built-in DocuSign",
  },
  {
    feature: "Role-Based Data Room",
    traditional: "Basic folder sharing",
    trustroom: "Granular permissions",
  },
];

const ComparisonTable = () => {
  return (
    <section id="comparison" className="py-20 md:py-28 bg-muted/30 px-4 md:px-6">
      <div className="container max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-semibold text-primary bg-primary/10 rounded-full mb-4">
            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
            The Difference
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Traditional M&A vs{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
              Trustroom.ai
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See why leading law firms are switching to AI-powered deal management
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
        >
          {/* Header */}
          <div className="grid grid-cols-3 bg-muted/60 border-b border-border">
            <div className="p-4 md:p-5 font-semibold text-muted-foreground text-sm">
              Feature
            </div>
            <div className="p-4 md:p-5 font-semibold text-center text-muted-foreground text-sm border-l border-border">
              Traditional M&A
            </div>
            <div className="p-4 md:p-5 font-semibold text-center border-l border-border text-sm">
              <span className="inline-flex items-center gap-1.5 text-primary">
                <Zap className="h-4 w-4" />
                Trustroom.ai
              </span>
            </div>
          </div>

          {/* Rows */}
          {comparisonData.map((item, index) => (
            <div
              key={item.feature}
              className={`grid grid-cols-3 ${
                index !== comparisonData.length - 1 ? "border-b border-border/50" : ""
              } hover:bg-muted/30 transition-colors`}
            >
              <div className="p-4 md:p-5 font-medium text-sm">{item.feature}</div>
              <div className="p-4 md:p-5 text-center border-l border-border/50 text-muted-foreground text-sm">
                {typeof item.traditional === "boolean" ? (
                  item.traditional ? (
                    <Check className="h-5 w-5 text-primary mx-auto" />
                  ) : (
                    <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />
                  )
                ) : (
                  item.traditional
                )}
              </div>
              <div className="p-4 md:p-5 text-center border-l border-border/50 text-sm">
                {typeof item.trustroom === "boolean" ? (
                  item.trustroom ? (
                    <Check className="h-5 w-5 text-primary mx-auto" />
                  ) : (
                    <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />
                  )
                ) : (
                  <span className="font-semibold text-primary">{item.trustroom}</span>
                )}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ComparisonTable;
