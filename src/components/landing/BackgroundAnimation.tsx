
import { motion } from "framer-motion";

const BackgroundAnimation = () => {
  // Nodes representing deal participants
  const nodes = [
    { x: "15%", y: "20%", delay: 0 },
    { x: "85%", y: "25%", delay: 0.5 },
    { x: "75%", y: "70%", delay: 1 },
    { x: "25%", y: "75%", delay: 1.5 },
    { x: "50%", y: "45%", delay: 0.8 },
    { x: "10%", y: "50%", delay: 1.2 },
    { x: "90%", y: "50%", delay: 0.3 },
  ];

  // Connection lines between nodes
  const connections = [
    { from: 0, to: 4 },
    { from: 1, to: 4 },
    { from: 2, to: 4 },
    { from: 3, to: 4 },
    { from: 0, to: 5 },
    { from: 1, to: 6 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background z-10" />
      
      {/* Animated grid pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full">
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
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.2 }}
              transition={{
                duration: 2,
                delay: i * 0.3,
                ease: "easeOut",
              }}
            />
          );
        })}
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(262, 83%, 58%)" stopOpacity="0.3" />
          </linearGradient>
        </defs>
      </svg>

      {/* Animated nodes */}
      {nodes.map((node, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: node.x, top: node.y }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.8,
            delay: node.delay,
            ease: [0.23, 1, 0.32, 1],
          }}
        >
          <motion.div
            className="relative"
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 w-4 h-4 -translate-x-1/2 -translate-y-1/2 bg-primary/30 rounded-full blur-xl" />
            {/* Node dot */}
            <div className="w-3 h-3 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-primary to-purple-500 rounded-full shadow-lg shadow-primary/20" />
            {/* Pulse ring */}
            <motion.div
              className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 border border-primary/30 rounded-full"
              style={{ left: "50%", top: "50%" }}
              animate={{
                scale: [1, 2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: node.delay,
                ease: "easeOut",
              }}
            />
          </motion.div>
        </motion.div>
      ))}

      {/* Floating document icons */}
      <motion.div
        className="absolute left-[20%] top-[30%] w-8 h-10 border border-primary/20 rounded bg-card/50 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.4, y: 0 }}
        transition={{ duration: 1, delay: 2 }}
      >
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-4 h-0.5 bg-primary/30 m-1.5 rounded" />
          <div className="w-3 h-0.5 bg-primary/20 m-1.5 rounded" />
          <div className="w-4 h-0.5 bg-primary/30 m-1.5 rounded" />
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute right-[25%] top-[60%] w-8 h-10 border border-purple-500/20 rounded bg-card/50 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.4, y: 0 }}
        transition={{ duration: 1, delay: 2.5 }}
      >
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <div className="w-4 h-0.5 bg-purple-500/30 m-1.5 rounded" />
          <div className="w-3 h-0.5 bg-purple-500/20 m-1.5 rounded" />
          <div className="w-4 h-0.5 bg-purple-500/30 m-1.5 rounded" />
        </motion.div>
      </motion.div>

      {/* Large gradient orbs */}
      <motion.div
        className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      />
    </div>
  );
};

export default BackgroundAnimation;
