import { motion } from 'motion/react';

interface QuickQuestionProps {
  question: string;
  onClick: () => void;
}

export function QuickQuestion({ question, onClick }: QuickQuestionProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="px-4 py-2.5 rounded-md border border-zinc-500/60 bg-zinc-950/65 text-zinc-100 text-sm tracking-wide hover:bg-zinc-900/80 hover:border-red-500/60 transition-colors duration-200"
    >
      {question}
    </motion.button>
  );
}
