
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-24 px-4 md:px-6">
      <div className="container mx-auto max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-primary/90 to-purple-500/90 text-white rounded-2xl p-8 md:p-12 text-center shadow-xl"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to transform your business sale experience?
          </h2>
          <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto">
            Join thousands of business owners who have streamlined their transactions with Trustroom.ai. Get started for free today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary" 
              onClick={() => navigate("/signup")} 
              className="font-medium shadow-lg hover:shadow-xl transition-all"
            >
              Create Free Account <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-transparent border-white/20 text-white hover:bg-white/10 transition-all" 
              onClick={() => navigate("/login")}
            >
              Log In
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
