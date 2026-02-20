import { useState, useRef, useEffect } from "react";
import { Send, CheckCircle2, BookOpen, Search, Loader2, Bookmark, BookmarkCheck, Zap } from "lucide-react";
import { CodeBlock } from "./CodeBlock";
import { SourceCitation } from "./SourceCitation";
import { Link } from "react-router";
import { motion } from "motion/react";

interface Source {
  title: string;
  url: string;
  type: "stackoverflow" | "documentation";
}

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  answer?: {
    directAnswer: string;
    explanation: string;
    codeSnippet?: {
      language: string;
      code: string;
    };
    sources?: Source[];
    aiPowered?: boolean;
  };
}

const suggestedQuestions = [
  "What is list comprehension in Python?",
  "Explain REST API.",
  "Fix TypeError in Python.",
  "Difference between async and threading?",
  "What is RAG?",
  "How to handle CORS errors?",
];

export function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (queryOverride?: string) => {
    const query = (queryOverride ?? inputValue).trim();
    if (!query) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) throw new Error(`Server error ${res.status}`);

      const data = await res.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: data.direct_answer || data.answer || "No answer returned.",
        timestamp: new Date(),
        answer: {
          directAnswer: data.direct_answer || data.answer || "",
          explanation: data.explanation || "",
          codeSnippet: data.code_snippet
            ? { language: data.code_snippet.language, code: data.code_snippet.code }
            : undefined,
          sources: (data.sources || []).map((s: any) => ({
            title: s.title,
            url: s.url,
            type: s.type || "documentation",
          })),
          aiPowered: data.ai_powered ?? false,
        },
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      const errMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "Failed to connect to the backend. Make sure the FastAPI server is running on port 8000.",
        timestamp: new Date(),
        answer: {
          directAnswer: "Backend connection failed.",
          explanation:
            "Please start the backend: open a terminal, run `python -m uvicorn backend.main:app --reload --port 8000` from the project root.",
          sources: [],
        },
      };
      setMessages((prev) => [...prev, errMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAnswer = async (message: Message) => {
    if (!message.answer || savedIds.has(message.id)) return;
    try {
      const res = await fetch("/api/saved-answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: messages.find(
            (m) => m.type === "user" && m.timestamp < message.timestamp
          )?.content || message.content,
          answer: message.answer.directAnswer,
          category: detectCategory(message.content),
        }),
      });
      if (res.ok) {
        setSavedIds((prev) => new Set([...prev, message.id]));
      }
    } catch (e) {
      console.error("Save error:", e);
    }
  };

  const detectCategory = (text: string): string => {
    const t = text.toLowerCase();
    if (t.includes("python")) return "Python";
    if (t.includes("javascript") || t.includes(" js ")) return "JavaScript";
    if (t.includes("database") || t.includes("sql")) return "Databases";
    if (t.includes("docker") || t.includes("devops")) return "DevOps";
    if (t.includes("react") || t.includes("api")) return "Web Development";
    return "General";
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <h1 className="text-2xl font-semibold text-[#0F172A] mb-2">
          Ask a Technical Question
        </h1>
        <p className="text-sm text-gray-600 mb-4">
          Answers are retrieved from Stack Overflow and official documentation
          using Retrieval-Augmented Generation.
        </p>

        {/* Trust Badges */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-green-700">
              Source-Verified
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">
              Documentation-Backed
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg">
            <Search className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-medium text-purple-700">
              Stack Overflow Indexed
            </span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 ? (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#3B82F6] rounded-2xl mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                How can I help you today?
              </h2>
              <p className="text-gray-600">
                Ask any technical question and get answers backed by official
                documentation and Stack Overflow.
              </p>
            </div>

            {/* Suggested Questions */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Suggested questions:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {suggestedQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(question)}
                    className="text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-[#3B82F6] hover:bg-blue-50 transition-colors text-sm text-gray-700"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {message.type === "user" ? (
                  <div className="flex justify-end">
                    <div className="max-w-2xl bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                      <p className="text-gray-900">{message.content}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    {/* AI badge */}
                    {message.answer?.aiPowered && (
                      <div className="flex items-center gap-1.5 mb-3">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-xs font-medium text-amber-600">AI-Powered Response</span>
                      </div>
                    )}

                    {/* Direct Answer */}
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Direct Answer
                      </h3>
                      <p className="text-gray-900">
                        {message.answer?.directAnswer}
                      </p>
                    </div>

                    {/* Explanation */}
                    {message.answer?.explanation && (
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Explanation
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          {message.answer.explanation}
                        </p>
                      </div>
                    )}

                    {/* Code Snippet */}
                    {message.answer?.codeSnippet && (
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Code Example
                        </h3>
                        <CodeBlock
                          code={message.answer.codeSnippet.code}
                          language={message.answer.codeSnippet.language}
                        />
                      </div>
                    )}

                    {/* Source Citations */}
                    {message.answer?.sources && message.answer.sources.length > 0 && (
                      <SourceCitation sources={message.answer.sources} />
                    )}

                    {/* Actions */}
                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                      <Link
                        to="/flashcards"
                        className="inline-flex items-center gap-2 text-sm text-[#3B82F6] hover:text-blue-700 font-medium"
                      >
                        <BookOpen className="w-4 h-4" />
                        New to this concept? Open Flashcard
                      </Link>
                      <button
                        onClick={() => handleSaveAnswer(message)}
                        className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${savedIds.has(message.id)
                            ? "text-green-600 cursor-default"
                            : "text-gray-500 hover:text-[#3B82F6]"
                          }`}
                        disabled={savedIds.has(message.id)}
                      >
                        {savedIds.has(message.id) ? (
                          <><BookmarkCheck className="w-4 h-4" /> Saved</>
                        ) : (
                          <><Bookmark className="w-4 h-4" /> Save Answer</>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 text-gray-600"
              >
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">
                  Retrieving relevant documentation...
                </span>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask a technical question..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className="px-6 py-3 bg-[#3B82F6] text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              <span className="hidden md:inline">Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
