import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Shuffle, BookmarkPlus, Check, Loader2 } from "lucide-react";
import { motion } from "motion/react";

interface Flashcard {
  id: string;
  category: string;
  term: string;
  definition: string;
  source: string;
}

export function FlashcardsPage() {
  const [flashcardsData, setFlashcardsData] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [learnedCards, setLearnedCards] = useState<Set<string>>(new Set());
  const [bookmarkedCards, setBookmarkedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadFlashcards() {
      try {
        const res = await fetch("/api/flashcards");
        if (!res.ok) throw new Error("Failed to load flashcards");
        const data = await res.json();
        setFlashcardsData(data.flashcards || []);
      } catch (err) {
        console.error(err);
        setError("Could not load flashcards. Make sure the backend is running.");
      } finally {
        setIsLoading(false);
      }
    }
    loadFlashcards();
  }, []);

  const categories = [...new Set(flashcardsData.map((c) => c.category))].sort();

  const filteredCards =
    selectedCategory === "All"
      ? flashcardsData
      : flashcardsData.filter((card) => card.category === selectedCategory);

  const currentCard = filteredCards[currentCardIndex];
  const progress = flashcardsData.length
    ? Math.round((learnedCards.size / flashcardsData.length) * 100)
    : 0;

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prev) =>
        prev < filteredCards.length - 1 ? prev + 1 : 0
      );
    }, 200);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prev) =>
        prev > 0 ? prev - 1 : filteredCards.length - 1
      );
    }, 200);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * filteredCards.length);
      setCurrentCardIndex(randomIndex);
    }, 200);
  };

  const toggleLearned = () => {
    if (!currentCard) return;
    setLearnedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(currentCard.id)) newSet.delete(currentCard.id);
      else newSet.add(currentCard.id);
      return newSet;
    });
  };

  const toggleBookmark = () => {
    if (!currentCard) return;
    setBookmarkedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(currentCard.id)) newSet.delete(currentCard.id);
      else newSet.add(currentCard.id);
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full gap-3 text-gray-600">
        <Loader2 className="w-6 h-6 animate-spin text-[#3B82F6]" />
        <span>Loading flashcards…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md bg-white p-8 rounded-xl border border-red-200">
          <p className="text-red-600 font-medium mb-2">Failed to load</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No flashcards available</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <h1 className="text-2xl font-semibold text-[#0F172A] mb-2">
          Developer Fundamentals – Flashcards
        </h1>
        <p className="text-sm text-gray-600">
          Master core programming concepts before diving into advanced queries.
        </p>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Overall Progress
            </span>
            <span className="text-sm text-gray-600">
              {learnedCards.size} / {flashcardsData.length} Completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#3B82F6] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 overflow-x-auto">
        <div className="flex gap-2 py-3">
          <button
            onClick={() => { setSelectedCategory("All"); setCurrentCardIndex(0); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === "All"
                ? "bg-[#3B82F6] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            All ({flashcardsData.length})
          </button>
          {categories.map((category) => {
            const count = flashcardsData.filter((c) => c.category === category).length;
            return (
              <button
                key={category}
                onClick={() => { setSelectedCategory(category); setCurrentCardIndex(0); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === category
                    ? "bg-[#3B82F6] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {category} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Flashcard Display */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* Card Counter */}
          <div className="text-center mb-4">
            <span className="text-sm text-gray-600">
              Card {currentCardIndex + 1} of {filteredCards.length}
            </span>
          </div>

          {/* Flashcard */}
          <div
            className="perspective-1000 cursor-pointer mb-6"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <motion.div
              className="relative w-full h-80"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Front */}
              <div
                className="absolute inset-0 bg-white rounded-xl shadow-lg border-2 border-gray-200 p-8 flex flex-col items-center justify-center"
                style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
              >
                <div className="text-center">
                  <span className="inline-block px-3 py-1 bg-[#3B82F6] bg-opacity-10 text-[#3B82F6] text-xs font-medium rounded-full mb-4">
                    {currentCard.category}
                  </span>
                  <h2 className="text-3xl font-semibold text-[#0F172A] mb-6">
                    {currentCard.term}
                  </h2>
                  <p className="text-sm text-gray-500 italic">
                    Click to reveal explanation
                  </p>
                </div>
              </div>

              {/* Back */}
              <div
                className="absolute inset-0 bg-gradient-to-br from-[#3B82F6] to-blue-600 rounded-xl shadow-lg p-8 flex flex-col justify-between"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <div>
                  <p className="text-white text-lg leading-relaxed">
                    {currentCard.definition}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white bg-opacity-20 rounded-lg">
                    <BookmarkPlus className="w-4 h-4 text-white" />
                    <span className="text-xs text-white">
                      Source: {currentCard.source}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handlePrevious}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden md:inline">Previous</span>
            </button>

            <div className="flex gap-2">
              <button
                onClick={handleShuffle}
                className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Shuffle"
              >
                <Shuffle className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={toggleLearned}
                className={`p-2 rounded-lg transition-colors ${learnedCards.has(currentCard.id)
                    ? "bg-green-500 text-white"
                    : "bg-white border border-gray-300 hover:bg-gray-50"
                  }`}
                title="Mark as Learned"
              >
                <Check className="w-5 h-5" />
              </button>
              <button
                onClick={toggleBookmark}
                className={`p-2 rounded-lg transition-colors ${bookmarkedCards.has(currentCard.id)
                    ? "bg-yellow-500 text-white"
                    : "bg-white border border-gray-300 hover:bg-gray-50"
                  }`}
                title="Bookmark"
              >
                <BookmarkPlus className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <span className="hidden md:inline">Next</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
