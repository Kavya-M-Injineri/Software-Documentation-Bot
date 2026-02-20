import { Bookmark, Trash2, ExternalLink, Calendar, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface SavedAnswer {
  id: string;
  question: string;
  answer: string;
  savedDate: string;
  category: string;
}

export function SavedAnswersPage() {
  const [savedAnswers, setSavedAnswers] = useState<SavedAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/saved-answers");
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        setSavedAnswers(data.saved_answers || []);
      } catch (err) {
        console.error(err);
        setError("Could not load saved answers. Make sure the backend is running.");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/saved-answers/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSavedAnswers((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full gap-3 text-gray-600">
        <Loader2 className="w-6 h-6 animate-spin text-[#3B82F6]" />
        <span>Loading saved answers…</span>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <h1 className="text-2xl font-semibold text-[#0F172A] mb-2">
          Saved Answers
        </h1>
        <p className="text-sm text-gray-600">
          Your bookmarked technical answers and solutions.
        </p>
      </div>

      {/* Saved Answers List */}
      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {savedAnswers.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No saved answers yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Click "Save Answer" in the chat to bookmark answers here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {savedAnswers.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:border-[#3B82F6] transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block px-2 py-1 bg-blue-50 text-[#3B82F6] text-xs font-medium rounded">
                        {item.category}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.savedDate).toLocaleDateString()}
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {item.question}
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex-shrink-0 ml-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                  <button className="flex items-center gap-2 text-sm text-[#3B82F6] hover:text-blue-700 font-medium">
                    <ExternalLink className="w-4 h-4" />
                    View Full Answer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
