import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink, FileText, MessageCircle } from "lucide-react";

interface Source {
  title: string;
  url: string;
  type: "stackoverflow" | "documentation";
}

interface SourceCitationProps {
  sources: Source[];
}

export function SourceCitation({ sources }: SourceCitationProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            Source Citations ({sources.length})
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {expanded && (
        <div className="p-4 space-y-3 bg-white">
          {sources.map((source, idx) => (
            <a
              key={idx}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:border-[#3B82F6] hover:bg-blue-50 transition-colors group"
            >
              <div className="flex-shrink-0 mt-0.5">
                {source.type === "documentation" ? (
                  <FileText className="w-5 h-5 text-blue-600" />
                ) : (
                  <MessageCircle className="w-5 h-5 text-orange-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 group-hover:text-[#3B82F6]">
                  {source.title}
                </p>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {source.url}
                </p>
                <span className="inline-block mt-2 text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                  {source.type === "documentation"
                    ? "Official Documentation"
                    : "Stack Overflow"}
                </span>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
