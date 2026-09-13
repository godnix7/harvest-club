"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";

export default function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-50">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-50/50 to-blue-50/50" />
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3] 
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/4 -right-1/4 w-full max-w-[800px] aspect-square rounded-full bg-gradient-to-tr from-[var(--color-harvest-green)] to-[var(--color-harvest-blue)] blur-[120px] mix-blend-multiply opacity-30"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.5, 1],
            x: [0, -100, 0],
            opacity: [0.2, 0.4, 0.2] 
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-1/4 -left-1/4 w-full max-w-[600px] aspect-square rounded-full bg-gradient-to-tr from-[var(--color-harvest-blue)] to-[var(--color-harvest-green)] blur-[100px] mix-blend-multiply opacity-20"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          <motion.div variants={itemVariants} className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-[var(--color-harvest-green-dark)] text-sm font-semibold tracking-wide">
            <Leaf size={16} />
            <span>Cultivating the Future of Agritech</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-harvest-green)] to-[var(--color-harvest-green-dark)]">Harvest</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-harvest-blue-dark)] to-[var(--color-harvest-blue)]">Agritech Innovation</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="mt-6 max-w-2xl text-xl md:text-2xl text-gray-600 mx-auto mb-10 leading-relaxed">
            A dynamic student community exploring the intersection of technology, nature, and future-oriented ideas.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex justify-center gap-4 flex-col sm:flex-row w-full sm:w-auto">
            <Link 
              href="/about" 
              className="group relative inline-flex justify-center items-center gap-2 px-8 py-4 border border-transparent text-lg font-medium rounded-full shadow-lg text-white bg-[var(--color-harvest-green)] hover:bg-[var(--color-harvest-green-dark)] transition-all overflow-hidden"
            >
              <span className="relative z-10">Explore Harvest</span>
              <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 h-full w-full bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out" />
            </Link>
            <Link 
              href="/events" 
              className="inline-flex justify-center items-center px-8 py-4 border-2 border-gray-200 text-lg font-medium rounded-full text-gray-700 bg-white/50 backdrop-blur-sm hover:border-[var(--color-harvest-blue)] hover:text-[var(--color-harvest-blue)] transition-colors shadow-sm"
            >
              View Events
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
