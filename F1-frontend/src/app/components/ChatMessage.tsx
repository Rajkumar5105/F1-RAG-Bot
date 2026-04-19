import { motion } from 'motion/react';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  message: string;
  isBot: boolean;
  timestamp: string;
}

export function ChatMessage({ message, isBot, timestamp }: ChatMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`flex gap-3 mb-4 ${isBot ? '' : 'flex-row-reverse'}`}
    >
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
        isBot ? 'bg-gradient-to-br from-red-600 to-red-700' : 'bg-gradient-to-br from-gray-700 to-gray-800'
      }`}>
        {isBot ? (
          <Bot className="w-5 h-5 text-white" />
        ) : (
          <User className="w-5 h-5 text-white" />
        )}
      </div>
      <div className={`flex flex-col ${isBot ? 'items-start' : 'items-end'} flex-1 max-w-[75%]`}>
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
          className={`rounded-2xl px-4 py-3 ${
            isBot 
              ? 'bg-white/10 backdrop-blur-md border border-white/20 text-white' 
              : 'bg-gradient-to-r from-red-600 to-red-700 text-white'
          }`}
        >
          <p className="text-sm leading-relaxed">{message}</p>
        </motion.div>
        <span className="text-xs text-white/50 mt-1 px-1">{timestamp}</span>
      </div>
    </motion.div>
  );
}
