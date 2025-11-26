"use client";

import { motion } from "motion/react";
import { Lock, Clock, Shield, Maximize2 } from "lucide-react";
import { cn } from "~/lib/utils";

export function SecureDeliveryPreview() {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-slate-900 font-bold text-xs sm:text-sm flex-shrink-0">
              X
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                Calculus Assessment
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium">
              <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="hidden sm:inline">45:23</span>
              <span className="sm:hidden">45m</span>
            </div>
            <div className="w-16 sm:w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "65%" }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-amber-500 rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Security Badges */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="px-4 sm:px-6 pt-3 sm:pt-4 flex items-center gap-1.5 sm:gap-2 flex-wrap"
        >
          <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[10px] sm:text-xs font-medium border border-amber-200 dark:border-amber-800">
            <Lock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            <span className="hidden sm:inline">Password Protected</span>
            <span className="sm:hidden">Locked</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[10px] sm:text-xs font-medium border border-amber-200 dark:border-amber-800">
            <Maximize2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            <span className="hidden sm:inline">Fullscreen Mode</span>
            <span className="sm:hidden">Fullscreen</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[10px] sm:text-xs font-medium border border-amber-200 dark:border-amber-800">
            <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            <span className="hidden sm:inline">Secure Session</span>
            <span className="sm:hidden">Secure</span>
          </div>
        </motion.div>

        {/* Question Card */}
        <div className="p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 space-y-3 sm:space-y-4"
          >
            <div className="flex gap-3 sm:gap-4">
              <div className="flex-none">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">
                  1
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-3 sm:mb-4">
                  What is the derivative of f(x) = x² + 3x - 5?
                </h4>
                <div className="space-y-2">
                  {[
                    "2x + 3",
                    "x² + 3",
                    "2x - 5",
                    "x + 3",
                  ].map((option, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      className={cn(
                        "flex items-center p-3 rounded-lg border transition-all cursor-pointer",
                        index === 0
                          ? "border-amber-400 bg-amber-50/50 dark:bg-amber-900/20 ring-1 ring-amber-400/20"
                          : "border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50/30 dark:hover:bg-amber-900/10"
                      )}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center",
                          index === 0
                            ? "border-amber-500 bg-amber-500"
                            : "border-slate-300 dark:border-slate-600"
                        )}
                      >
                        {index === 0 && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {option}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Password Protection UI */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-center gap-2"
          >
            <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-xs text-amber-800 dark:text-amber-200">
              This assessment is protected. All security features are active.
            </span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

