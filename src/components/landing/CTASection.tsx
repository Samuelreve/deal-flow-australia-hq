import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 md:py-28 px-4 md:px-6">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="bg-gradient-to-br from-primary via-primary/90 to-purple-600 text-white rounded-3xl p-10 md:p-16 text-center shadow-2xl shadow-primary/20 relative overflow-hidden"
        >
          {/* Decorative */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
          />
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"
          />

          <div className="relative">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-block px-4 py-1.5 rounded-full bg-white/20 text-white text-sm font-semibold mb-6"
            >
              Get Started Today
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-3xl md:text-5xl font-bold mb-6 leading-tight"
            >
              Ready to close deals
              <br />
              faster than ever?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg md:text-xl mb-10 text-white/90 max-w-2xl mx-auto leading-relaxed"
            >
              Join hundreds of M&A professionals who have streamlined their
              transactions with Trustroom.ai. Start your free trial — no credit card required.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  onClick={() => navigate("/signup")}
                  className="bg-white text-primary hover:bg-white/90 font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 h-14 px-8 text-lg"
                >
                  Create Free Account <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-300 h-14 px-8 text-lg"
                  onClick={() => navigate("/login")}
                >
                  Log In
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
