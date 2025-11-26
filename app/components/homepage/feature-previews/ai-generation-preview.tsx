"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { Sparkles, GraduationCap, BookOpen, BarChart, Wand2 } from "lucide-react";
import { cn } from "~/lib/utils";

export function AIGenerationPreview() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setShowSparkles(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowSparkles(false);
    }, 3000);
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              Generate with AI
            </h3>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Describe your ideal test and let AI create it instantly.
          </p>
        </div>

        {/* Form */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5" /> Grade
              </label>
              <div className="h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center px-3 text-sm text-slate-600 dark:text-slate-400">
                10th
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" /> Subject
              </label>
              <div className="h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center px-3 text-sm text-slate-600 dark:text-slate-400">
                Math
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart className="h-3.5 w-3.5" /> Level
              </label>
              <div className="h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center px-3 text-sm text-slate-600 dark:text-slate-400">
                Medium
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-2"
          >
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Wand2 className="h-3.5 w-3.5" /> Description
            </label>
            <div className="min-h-[100px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm text-slate-600 dark:text-slate-400">
              Create a 15-question calculus test focusing on derivatives and limits. Include a mix of multiple choice and word problems...
            </div>
          </motion.div>

          {/* Generate Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerate}
            className={cn(
              "w-full h-12 rounded-lg font-medium text-white transition-all",
              "bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600",
              "flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20",
              "relative overflow-hidden"
            )}
          >
            {isGenerating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-4 w-4" />
                </motion.div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate Test</span>
              </>
            )}
            {showSparkles && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0, x: "50%", y: "50%" }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      x: `calc(50% + ${(Math.random() - 0.5) * 200}px)`,
                      y: `calc(50% + ${(Math.random() - 0.5) * 200}px)`,
                    }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.1,
                      repeat: Infinity,
                    }}
                    className="absolute"
                  >
                    <Sparkles className="h-3 w-3 text-yellow-300" />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

