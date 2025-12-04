
import { motion } from "framer-motion";
import { Building2, Users, Award, Globe } from "lucide-react";

const TrustSection = () => {
  const stats = [
    { icon: Building2, value: "500+", label: "Companies Trust Us" },
    { icon: Users, value: "10K+", label: "Deals Completed" },
    { icon: Award, value: "99%", label: "Success Rate" },
    { icon: Globe, value: "25+", label: "Countries Served" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      }
    }
  };

  return (
    <section className="py-20 px-4 md:px-6 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      
      <div className="container mx-auto max-w-6xl relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Trusted Worldwide
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            Trusted by Industry Leaders
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of businesses that have streamlined their transactions with Trustroom.ai
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-gradient-to-br from-card via-card to-primary/5 rounded-2xl p-6 border border-border/50 hover:border-primary/20 hover:shadow-xl transition-all duration-500 text-center group"
            >
              <motion.div 
                className="h-12 w-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
                initial={{ scale: 0, rotate: -90 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <stat.icon className="h-6 w-6 text-primary" />
              </motion.div>
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent mb-1">
                {stat.value}
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mt-16 bg-gradient-to-br from-card via-card to-primary/5 rounded-3xl p-8 md:p-12 border border-border/50 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="relative max-w-3xl mx-auto text-center">
            <motion.div 
              className="text-5xl text-primary/20 mb-4"
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              "
            </motion.div>
            <p className="text-lg md:text-xl text-foreground/80 mb-6 italic leading-relaxed">
              Trustroom.ai transformed how we handle business acquisitions. What used to take months now takes weeks, with complete transparency for all parties involved.
            </p>
            <motion.div 
              className="flex items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold">
                JD
              </div>
              <div className="text-left">
                <p className="font-semibold">James Davidson</p>
                <p className="text-sm text-muted-foreground">CEO, Davidson Holdings</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TrustSection;
