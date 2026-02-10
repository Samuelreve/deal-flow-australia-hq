import { motion } from "framer-motion";

const stats = [
  { value: "500+", label: "Deals Completed" },
  { value: "200+", label: "Law Firms Trust Us" },
  { value: "$2B+", label: "Transaction Value" },
  { value: "99.9%", label: "Uptime SLA" },
];

const SocialProof = () => {
  return (
    <section className="py-14 border-y border-border/50 bg-card">
      <div className="container max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
