import { motion } from "framer-motion";
import { Building2, Globe, Briefcase, Lightbulb, Home } from "lucide-react";

const categories = [
  {
    icon: Building2,
    title: "Business Sales",
    description: "Full business acquisitions with comprehensive due diligence, milestone tracking, and structured settlement workflows.",
  },
  {
    icon: Lightbulb,
    title: "IP Transfers",
    description: "Patent, trademark, and intellectual property transactions with specialized compliance checklists and valuation support.",
  },
  {
    icon: Home,
    title: "Real Estate",
    description: "Commercial and residential property deals with contract review, title analysis, and settlement coordination.",
  },
  {
    icon: Globe,
    title: "Cross-Border Deals",
    description: "International transactions with multi-jurisdiction support, currency handling, and regulatory compliance tracking.",
  },
  {
    icon: Briefcase,
    title: "Micro Deals",
    description: "Streamlined workflows for smaller transactions — get the same professional deal room without the overhead.",
  },
];

const DealCategories = () => {
  return (
    <section id="deal-categories" className="py-20 md:py-28 px-4 md:px-6 bg-background">
      <div className="container max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-semibold text-primary bg-primary/10 rounded-full mb-4">
            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
            Transaction Types
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Every Deal Type,{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
              One Platform
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Purpose-built workflows for every transaction category
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className="bg-card border border-border/50 rounded-2xl p-6 hover:border-border hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <category.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-foreground">{category.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {category.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DealCategories;
