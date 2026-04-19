import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Flag } from "lucide-react";
import { ChatMessage } from "./components/ChatMessage";
import { QuickQuestion } from "./components/QuickQuestion";
import { TypingIndicator } from "./components/TypingIndicator";
import backgroundImage from "../imports/image.png";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi there! I'm F1 Bot, your Formula 1 expert assistant. Ask me anything about F1 - drivers, teams, circuits, records, or race history!",
      isBot: true,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    const container = chatScrollRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string = inputValue) => {
    if (!text.trim()) return;

    const messageText = text.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isBot: false,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: messageText }),
      });

      const data = await res.json();

      if (!res.ok || data.error || !data.reply) {
        throw new Error(data.error || "Backend did not return a reply.");
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.reply,
        isBot: true,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Something went wrong. Please check that the backend and embedding server are running.",
        isBot: true,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickQuestions = [
    "Why is Monaco qualifying so important?",
    "Who has the best race starts this season?",
    "How does DRS really work?",
    "Which team improved most this year?",
  ];

  return (
    <div className="relative h-dvh min-h-dvh overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-sm scale-110"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-red-950/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full min-h-0 flex-col">
        {/* Header */}
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="px-6 py-4 backdrop-blur-xl bg-black/35 border-b border-white/10"
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-extrabold tracking-tight">
                F1
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  F1 RAG Bot
                </h1>
                <p className="text-xs text-white/60">
                  Race-weekend insights without the fluff
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-green-500/20 border border-green-500/30">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs tracking-wide text-green-400">LIVE SESSION</span>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Chat Area */}
        <div
          ref={chatScrollRef}
          className="flex-1 min-h-0 overflow-y-auto px-6 py-6"
        >
          <div className="max-w-4xl mx-auto">
            {/* Welcome Section */}
            {messages.length === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-8 text-center"
              >
                <h2 className="text-3xl font-bold text-white mb-2">
                  Lets have a RACE....
                </h2>
                <p className="text-white/70 mb-6">
                  Answer's your questions based on the data feed to us not the LLM's training data.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {quickQuestions.map((question, index) => (
                    <QuickQuestion
                      key={index}
                      question={question}
                      onClick={() => handleSendMessage(question)}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Messages */}
            <div className="space-y-1">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message.text}
                  isBot={message.isBot}
                  timestamp={message.timestamp}
                />
              ))}
              <AnimatePresence>
                {isTyping && <TypingIndicator />}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="px-6 py-5 backdrop-blur-xl bg-black/40 border-t border-white/10"
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Ask me anything about Formula 1..."
                  className="w-full px-5 py-4 pr-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                />
                <Flag className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isTyping}
                className="px-6 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 text-white font-medium hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-500/20"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-white/45 tracking-wide">
              <span>Built for race fans • data + context • no generic replies</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
