import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";

export function SuccessAnimation() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        duration: 0.6,
      }}
      className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          delay: 0.2,
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
      >
        <CheckCircle2 className="h-16 w-16 text-green-600" strokeWidth={2} />
      </motion.div>
    </motion.div>
  );
}

