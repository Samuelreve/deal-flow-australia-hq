import { motion } from "framer-motion";
import { ShieldCheck, FileText, MessageSquare, BarChart3, Brain, PenTool } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Due Diligence",
    description:
      "Our AI reviews hundreds of documents in minutes, flags risks, and generates plain-language summaries so your team can focus on strategy instead of manual review.",
  },
  {
    icon: FileText,
    title: "Smart Document Management",
    description:
      "Secure virtual data room with version control, role-based access, automated organization, and full audit trails — everything you need for compliant deal execution.",
  },
  {
    icon: PenTool,
    title: "Integrated DocuSign",
    description:
      "Execute agreements directly within the platform. Track signature status, manage envelopes, and maintain a complete signing audit trail without switching tools.",
  },
  {
    icon: MessageSquare,
    title: "Unified Communication",
    description:
      "Contextual messaging, document annotations, and threaded comments keep all deal communications in one place — eliminating scattered email chains.",
  },
  {
    icon: BarChart3,
    title: "Deal Health Monitoring",
    description:
      "Real-time dashboards track milestone progress, flag delays, and provide AI-powered predictions on deal completion probability with actionable recommendations.",
  },
  {
    icon: ShieldCheck,
    title: "Bank-Level Security",
    description:
      "Enterprise-grade encryption, row-level security, and granular permissions ensure sensitive deal data is only accessible to authorized participants.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 md:py-28 px-4 md:px-6 bg-background">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-14 max-w-2xl mx-auto"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-semibold text-primary bg-primary/10 rounded-full mb-4">
            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
            Platform Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Everything You Need to{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
              Close Deals
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Purpose-built tools that eliminate the friction in M&A transactions,
            from first review to final signature.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.25, ease: "easeOut" } }}
              className="group bg-muted/30 border border-border/50 rounded-2xl p-7 hover:bg-card hover:border-border hover:shadow-lg transition-all duration-300"
            >
              <motion.div
                className="w-12 h-12 bg-gradient-to-br from-primary to-purple-500 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300"
                whileHover={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.4 }}
              >
                <feature.icon className="h-6 w-6 text-white" />
              </motion.div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
