"use client";

import { motion } from "motion/react";
import { List, Type, CheckSquare, GripVertical } from "lucide-react";
import { cn } from "~/lib/utils";

export function DragDropBuilderPreview() {
  const fieldTypes = [
    { icon: List, label: "Multiple Choice", color: "text-blue-600" },
    { icon: Type, label: "Short Input", color: "text-blue-600" },
    { icon: CheckSquare, label: "Checkboxes", color: "text-blue-600" },
  ];

  const sampleQuestions = [
    {
      number: 1,
      type: "Multiple Choice",
      question: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
    },
    {
      number: 2,
      type: "Short Input",
      question: "Solve for x: 2x + 5 = 15",
      placeholder: "Enter your answer...",
    },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="flex flex-col sm:flex-row h-[500px] min-h-[500px]">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full sm:w-48 lg:w-64 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3 sm:p-4 space-y-2 sm:space-y-3 overflow-y-auto"
          >
            <div className="mb-4">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Field Types
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Drag to build
              </p>
            </div>
            {fieldTypes.map((field, index) => {
              const Icon = field.icon;
              return (
                <motion.div
                  key={field.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700",
                    "bg-white dark:bg-slate-800 shadow-sm cursor-grab active:cursor-grabbing",
                    "hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all"
                  )}
                >
                  <GripVertical className="h-4 w-4 text-slate-400" />
                  <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                    <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      {field.label}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Canvas Area */}
          <div className="flex-1 bg-slate-50/50 dark:bg-slate-950/50 p-3 sm:p-4 lg:p-6 overflow-y-auto">
            <div className="max-w-2xl mx-auto space-y-3 sm:space-y-4">
              {sampleQuestions.map((question, index) => (
                <motion.div
                  key={question.number}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-3 sm:gap-4">
                    <div className="flex-none">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">
                        {question.number}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-3 sm:mb-4">
                        {question.question}
                      </h4>
                      {question.type === "Multiple Choice" && (
                        <div className="space-y-2">
                          {question.options?.map((option, optIndex) => (
                            <motion.div
                              key={optIndex}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.5 + optIndex * 0.05 }}
                              className={cn(
                                "flex items-center p-3 rounded-lg border border-slate-200 dark:border-slate-700",
                                "hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all"
                              )}
                            >
                              <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 mr-3" />
                              <span className="text-sm text-slate-700 dark:text-slate-300">
                                {option}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      )}
                      {question.type === "Short Input" && (
                        <div className="h-12 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 flex items-center text-sm text-slate-400">
                          {question.placeholder}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center bg-slate-50/50 dark:bg-slate-900/30"
              >
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Drop questions here to build your test
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

