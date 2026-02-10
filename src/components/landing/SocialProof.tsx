import { motion } from "framer-motion";

const stats = [
  { value: "500+", label: "Deals Completed" },
  { value: "200+", label: "Law Firms Trust Us" },
  { value: "$2B+", label: "Transaction Value" },
  { value: "99.9%", label: "Uptime SLA" },
];

const SocialProof = () => {
  return (
    <section className="py-[60px] border-y border-border/30 bg-card">
      <div className="container max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="text-center cursor-default"
            >
              <div className="text-4xl font-bold text-foreground mb-1.5 font-serif">
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
