"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export function AnimatedList({ 
  children, 
  className = "",
  staggerDelay = 0.1
}: { 
  children: ReactNode[], 
  className?: string,
  staggerDelay?: number
}) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay
      }
    }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children.map((child, idx) => (
        <AnimatedListItem key={idx}>
          {child}
        </AnimatedListItem>
      ))}
    </motion.div>
  );
}

export function AnimatedListItem({ children, className = "" }: { children: ReactNode, className?: string }) {
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <motion.div variants={item} className={className}>
      {children}
    </motion.div>
  );
}
