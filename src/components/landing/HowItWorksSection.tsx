import { motion } from "framer-motion";
import { Upload, Brain, PenTool, CheckCircle } from "lucide-react";

const steps = [
  {
    number: 1,
    icon: Upload,
    title: "Create Your Deal Room",
    description:
      "Set up your deal in minutes. Invite buyers, sellers, lawyers, and advisors with role-based access. Trustroom.ai configures the workflow based on your transaction type.",
  },
  {
    number: 2,
    icon: Brain,
    title: "AI-Powered Due Diligence",
    description:
      "Upload documents and let AI handle the heavy lifting — automated risk flagging, clause analysis, plain-language summaries, and intelligent checklist generation.",
  },
  {
    number: 3,
    icon: PenTool,
    title: "Negotiate & Execute",
    description:
      "Track every revision with version control, communicate in context, and execute agreements with integrated DocuSign — all without leaving the platform.",
  },
  {
    number: 4,
    icon: CheckCircle,
    title: "Close with Confidence",
    description:
      "Monitor deal health in real-time, hit every milestone on schedule, and maintain a complete audit trail for post-closing compliance and record-keeping.",
  },
];

const HowItWorksSection = () => {
  return (
    <section
      id="how-it-works"
      className="py-[100px] px-6 bg-background relative overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        viewport={{ once: true }}
        className="absolute top-40 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"
      />

      <div className="container mx-auto max-w-[800px] relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-[60px] max-w-[700px] mx-auto"
        >
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-semibold text-primary bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-full mb-4">
            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
            Simple 4-Step Process
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground font-serif">
            From Upload to{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
              Close
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">
            A structured approach that guides every transaction from start to finish
          </p>
        </motion.div>

        <div className="space-y-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex gap-5 md:gap-8 items-start"
            >
              {/* Number + Line */}
              <div className="flex flex-col items-center flex-shrink-0">
                <motion.div
                  className="w-12 h-12 bg-gradient-to-br from-primary to-purple-500 text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg shadow-[0_4px_14px_0_hsl(var(--primary)/0.35)]"
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  {step.number}
                </motion.div>
                {index < steps.length - 1 && (
                  <motion.div
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.12 + 0.3 }}
                    className="w-0.5 h-full min-h-[40px] bg-gradient-to-b from-primary/30 to-transparent mt-3 origin-top"
                  />
                )}
              </div>

              {/* Content Card */}
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.3 } }}
                className="bg-card border border-border/50 rounded-3xl p-7 md:p-8 flex-1 hover:border-border hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 group-hover:scale-110 transition-all duration-300">
                    <step.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground font-serif">{step.title}</h3>
                </div>
                <p className="text-muted-foreground leading-[1.7] text-[15px] pl-[56px]">
                  {step.description}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
