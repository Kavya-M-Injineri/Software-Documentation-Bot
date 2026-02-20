import { Search, BookOpen, FileText, ExternalLink } from "lucide-react";
import { useState } from "react";

interface Documentation {
  id: string;
  title: string;
  category: string;
  description: string;
  url: string;
  lastUpdated: string;
}

const documentationData: Documentation[] = [
  {
    id: "1",
    title: "Python Official Documentation",
    category: "Programming Languages",
    description:
      "Comprehensive Python documentation covering all standard libraries, language reference, and tutorials.",
    url: "https://docs.python.org/3/",
    lastUpdated: "2026-02-15",
  },
  {
    id: "2",
    title: "React Documentation",
    category: "Web Frameworks",
    description:
      "Official React documentation with guides, API reference, and best practices for building user interfaces.",
    url: "https://react.dev/",
    lastUpdated: "2026-02-10",
  },
  {
    id: "3",
    title: "Node.js Documentation",
    category: "Runtime Environments",
    description:
      "Complete Node.js documentation including API references, guides, and tutorials for server-side JavaScript.",
    url: "https://nodejs.org/docs/",
    lastUpdated: "2026-02-12",
  },
  {
    id: "4",
    title: "PostgreSQL Documentation",
    category: "Databases",
    description:
      "Official PostgreSQL documentation covering installation, SQL syntax, administration, and performance tuning.",
    url: "https://www.postgresql.org/docs/",
    lastUpdated: "2026-02-08",
  },
  {
    id: "5",
    title: "Docker Documentation",
    category: "DevOps",
    description:
      "Docker documentation with guides on containerization, image building, and orchestration.",
    url: "https://docs.docker.com/",
    lastUpdated: "2026-02-14",
  },
  {
    id: "6",
    title: "AWS Documentation",
    category: "Cloud Services",
    description:
      "Amazon Web Services documentation covering all cloud services, APIs, and deployment guides.",
    url: "https://docs.aws.amazon.com/",
    lastUpdated: "2026-02-18",
  },
];

export function DocumentationPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDocs = documentationData.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full bg-gray-50 overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <h1 className="text-2xl font-semibold text-[#0F172A] mb-2">
          Documentation Library
        </h1>
        <p className="text-sm text-gray-600">
          Browse official documentation sources indexed by DevDoc AI.
        </p>
      </div>

      {/* Search Bar */}
      <div className="px-6 py-6">
        <div className="max-w-3xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documentation..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Documentation Grid */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <a
              key={doc.id}
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border border-gray-200 rounded-lg p-6 hover:border-[#3B82F6] hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-[#3B82F6]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 group-hover:text-[#3B82F6] mb-1">
                    {doc.title}
                  </h3>
                  <span className="inline-block text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                    {doc.category}
                  </span>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </div>
              <p className="text-sm text-gray-600 mb-3">{doc.description}</p>
              <p className="text-xs text-gray-500">
                Last updated: {new Date(doc.lastUpdated).toLocaleDateString()}
              </p>
            </a>
          ))}
        </div>

        {filteredDocs.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No documentation found</p>
          </div>
        )}
      </div>
    </div>
  );
}
