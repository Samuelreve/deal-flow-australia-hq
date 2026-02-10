import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "Trustroom.ai cut our average deal timeline from 5 months to 8 weeks. The AI document review alone saves our team 20+ hours per transaction.",
    name: "Sarah Mitchell",
    role: "Partner, Mitchell & Associates Law",
    initials: "SM",
  },
  {
    quote:
      "The integrated DocuSign and real-time deal tracking have eliminated the chaos of email-based deal management. Our clients love the transparency.",
    name: "James Chen",
    role: "M&A Director, Pacific Ventures",
    initials: "JC",
  },
  {
    quote:
      "As a buyer's advisor, having AI-powered due diligence checklists and risk flagging gives my clients confidence that nothing falls through the cracks.",
    name: "Emily Brooks",
    role: "Senior Associate, Brooks Legal Group",
    initials: "EB",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const TrustSection = () => {
  return (
    <section className="py-[100px] px-6 bg-background">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-[60px] max-w-[700px] mx-auto"
        >
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-semibold text-primary bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-full mb-4">
            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
            Trusted by Professionals
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground font-serif">
            What Our{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
              Clients Say
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Hear from M&A professionals who transformed their deal workflow
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              variants={cardVariants}
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
              className="bg-card border border-border/50 rounded-3xl p-8 hover:border-border hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              <Quote className="h-8 w-8 text-primary/20 mb-4 flex-shrink-0" />
              <p className="text-foreground/80 leading-[1.7] mb-6 flex-1 italic text-[15px]">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-primary-foreground text-sm font-bold">
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TrustSection;
