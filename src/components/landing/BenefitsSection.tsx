import { motion } from "framer-motion";
import { Zap, Eye, DollarSign, Shield, Heart, TrendingUp } from "lucide-react";

const benefits = [
  {
    icon: Zap,
    title: "Close 60% Faster",
    description:
      "Automated workflows, AI document review, and integrated signatures eliminate weeks of manual work from every transaction.",
  },
  {
    icon: DollarSign,
    title: "Cut Legal Costs by 40%",
    description:
      "AI-powered document analysis reduces billable review hours, generating plain-language summaries and flagging issues automatically.",
  },
  {
    icon: Eye,
    title: "Full Deal Transparency",
    description:
      "Every stakeholder gets real-time visibility into deal progress, document status, and upcoming milestones — no status meetings needed.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "Bank-level encryption, row-level access control, and full audit trails meet the strictest compliance requirements for sensitive M&A data.",
  },
  {
    icon: Heart,
    title: "Reduce Deal Fatigue",
    description:
      "Automated reminders, clear checklists, and structured processes eliminate confusion and reduce the anxiety that kills deals.",
  },
  {
    icon: TrendingUp,
    title: "Higher Completion Rate",
    description:
      "AI-powered deal health scoring and proactive alerts help you intervene early and keep transactions on track to close.",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const BenefitsSection = () => {
  return (
    <section
      id="benefits"
      className="py-20 md:py-28 px-4 md:px-6 bg-muted/20 relative overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        viewport={{ once: true }}
        className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none"
      />

      <div className="container mx-auto max-w-6xl relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-semibold text-primary bg-primary/10 rounded-full mb-4">
            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
            Why Choose Trustroom
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Built for{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
              Results
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Whether you're buying, selling, or advising — Trustroom.ai gives every party
            a competitive edge.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {benefits.map((benefit) => (
            <motion.div
              key={benefit.title}
              variants={cardVariants}
              whileHover={{ y: -4, transition: { duration: 0.25, ease: "easeOut" } }}
              className="bg-card border border-border/50 rounded-2xl p-6 hover:border-border hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 group-hover:scale-110 transition-all duration-300">
                <benefit.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default BenefitsSection;
