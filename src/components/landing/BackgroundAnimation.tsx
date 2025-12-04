
import { motion } from "framer-motion";

const BackgroundAnimation = () => {
  // Nodes representing deal participants
  const nodes = [
    { x: "12%", y: "25%", delay: 0, size: "lg" },
    { x: "88%", y: "20%", delay: 0.5, size: "md" },
    { x: "78%", y: "65%", delay: 1, size: "lg" },
    { x: "22%", y: "70%", delay: 1.5, size: "md" },
    { x: "50%", y: "40%", delay: 0.8, size: "xl" },
    { x: "8%", y: "48%", delay: 1.2, size: "sm" },
    { x: "92%", y: "45%", delay: 0.3, size: "sm" },
    { x: "35%", y: "15%", delay: 0.6, size: "sm" },
    { x: "65%", y: "80%", delay: 1.1, size: "sm" },
  ];

  const sizeMap = {
    sm: { node: "w-2 h-2", glow: "w-6 h-6", pulse: "w-8 h-8" },
    md: { node: "w-3 h-3", glow: "w-10 h-10", pulse: "w-12 h-12" },
    lg: { node: "w-4 h-4", glow: "w-14 h-14", pulse: "w-16 h-16" },
    xl: { node: "w-5 h-5", glow: "w-20 h-20", pulse: "w-24 h-24" },
  };

  // Connection lines between nodes
  const connections = [
    { from: 0, to: 4 },
    { from: 1, to: 4 },
    { from: 2, to: 4 },
    { from: 3, to: 4 },
    { from: 0, to: 5 },
    { from: 1, to: 6 },
    { from: 7, to: 4 },
    { from: 8, to: 4 },
    { from: 0, to: 3 },
    { from: 1, to: 2 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient overlay - lighter to show animation better */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background z-10" />
      
      {/* Animated grid pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.08]">
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full z-[1]">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
            <stop offset="50%" stopColor="hsl(262, 83%, 58%)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        {connections.map((conn, i) => {
          const fromNode = nodes[conn.from];
          const toNode = nodes[conn.to];
          return (
            <motion.line
              key={i}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke="url(#lineGradient)"
              strokeWidth="1.5"
              strokeDasharray="8 4"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.4 }}
              transition={{
                duration: 1.5,
                delay: i * 0.2,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            />
          );
        })}
      </svg>

      {/* Animated nodes */}
      {nodes.map((node, i) => {
        const sizes = sizeMap[node.size as keyof typeof sizeMap];
        return (
          <motion.div
            key={i}
            className="absolute z-[2]"
            style={{ left: node.x, top: node.y }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.6,
              delay: node.delay,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            <motion.div
              className="relative"
              animate={{
                y: [0, -6, 0],
              }}
              transition={{
                duration: 3 + i * 0.3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {/* Glow effect */}
              <div className={`absolute ${sizes.glow} -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-primary/40 to-purple-500/40 rounded-full blur-xl`} />
              {/* Node dot */}
              <div className={`${sizes.node} -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-primary via-primary to-purple-500 rounded-full shadow-lg shadow-primary/50`} />
              {/* Pulse ring */}
              <motion.div
                className={`absolute ${sizes.pulse} -translate-x-1/2 -translate-y-1/2 border-2 border-primary/40 rounded-full`}
                style={{ left: "50%", top: "50%" }}
                animate={{
                  scale: [1, 1.8, 1],
                  opacity: [0.6, 0, 0.6],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: node.delay * 0.5,
                  ease: "easeOut",
                }}
              />
            </motion.div>
          </motion.div>
        );
      })}

      {/* Floating document icons */}
      <motion.div
        className="absolute left-[18%] top-[35%] z-[2]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.5 }}
      >
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [0, 3, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-10 h-12 border-2 border-primary/30 rounded-lg bg-card/80 backdrop-blur-sm shadow-lg shadow-primary/20"
        >
          <div className="w-5 h-1 bg-primary/50 m-2 rounded" />
          <div className="w-4 h-1 bg-primary/30 m-2 rounded" />
          <div className="w-5 h-1 bg-primary/50 m-2 rounded" />
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute right-[20%] top-[55%] z-[2]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 2 }}
      >
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [0, -3, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="w-10 h-12 border-2 border-purple-500/30 rounded-lg bg-card/80 backdrop-blur-sm shadow-lg shadow-purple-500/20"
        >
          <div className="w-5 h-1 bg-purple-500/50 m-2 rounded" />
          <div className="w-4 h-1 bg-purple-500/30 m-2 rounded" />
          <div className="w-5 h-1 bg-purple-500/50 m-2 rounded" />
        </motion.div>
      </motion.div>

      {/* Large gradient orbs */}
      <motion.div
        className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-gradient-to-br from-primary/20 to-purple-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-gradient-to-br from-purple-500/20 to-primary/10 rounded-full blur-3xl"
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
      />
      <motion.div
        className="absolute top-1/3 right-1/4 w-[200px] h-[200px] bg-primary/15 rounded-full blur-2xl"
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

export default BackgroundAnimation;
