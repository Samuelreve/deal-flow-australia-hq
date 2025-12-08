import { motion } from "framer-motion";
import { Building2, Globe, Briefcase, Lightbulb, Home, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const categories = [
  {
    icon: Building2,
    title: "Business Sale",
    description: "Full business acquisitions with comprehensive due diligence",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Lightbulb,
    title: "IP Transfer",
    description: "Patents, trademarks, and intellectual property deals",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Home,
    title: "Real Estate",
    description: "Commercial and residential property transactions",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Globe,
    title: "Cross-Border",
    description: "International deals with multi-jurisdiction support",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Briefcase,
    title: "Micro Deals",
    description: "Smaller transactions with streamlined workflows",
    color: "from-rose-500 to-red-500",
  },
  {
    icon: Sparkles,
    title: "AI-Powered",
    description: "Let AI guide you through custom deal structures",
    color: "from-primary to-purple-600",
  },
];

const DealCategories = () => {
  return (
    <section id="deal-categories" className="py-16 md:py-24">
      <div className="container max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
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
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="group h-full hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                <CardContent className="p-6">
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <category.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{category.title}</h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DealCategories;
