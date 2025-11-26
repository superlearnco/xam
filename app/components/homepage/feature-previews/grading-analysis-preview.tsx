"use client";

import { motion } from "motion/react";
import { BarChart3, TrendingDown } from "lucide-react";
import { cn } from "~/lib/utils";

export function GradingAnalysisPreview() {
  const questionData = [
    { label: "Question 1: Basic Algebra", percentage: 92, color: "bg-green-500" },
    { label: "Question 2: Quadratic Equations", percentage: 78, color: "bg-blue-500" },
    { label: "Question 3: Calculus Basics", percentage: 65, color: "bg-yellow-500" },
    { label: "Question 4: Advanced Limits", percentage: 45, color: "bg-pink-500" },
    { label: "Question 5: Derivatives", percentage: 88, color: "bg-green-500" },
  ];

  const statCards = [
    { label: "Most Missed", value: "Q4", percentage: "45%", color: "text-pink-600" },
    { label: "Average Score", value: "73.6%", color: "text-blue-600" },
    { label: "Total Submissions", value: "24", color: "text-slate-600" },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              Question Analysis
            </h3>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4"
              >
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {stat.label}
                </div>
                <div className={cn("text-2xl font-bold", stat.color)}>
                  {stat.value}
                </div>
                {stat.percentage && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {stat.percentage} avg
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Chart */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 sm:mb-4">
              Question Performance
            </h4>
            <div className="space-y-3 sm:space-y-4">
              {questionData.map((question, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[120px] sm:max-w-[200px]">
                      {question.label}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400 font-mono flex-shrink-0 ml-2">
                      {question.percentage}%
                    </span>
                  </div>
                  <div className="relative h-6 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${question.percentage}%` }}
                      transition={{
                        delay: 0.5 + index * 0.1,
                        duration: 0.8,
                        ease: "easeOut",
                      }}
                      className={cn(
                        "h-full rounded-full",
                        question.color,
                        "shadow-sm"
                      )}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Most Missed Highlight */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-xl p-4 flex items-center gap-3"
          >
            <TrendingDown className="h-5 w-5 text-pink-600 dark:text-pink-400" />
            <div>
              <div className="text-sm font-semibold text-pink-900 dark:text-pink-100">
                Most Missed Question
              </div>
              <div className="text-xs text-pink-700 dark:text-pink-300">
                Question 4: Advanced Limits - Only 45% of students answered correctly
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

