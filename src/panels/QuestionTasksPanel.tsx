import { useState } from 'react';
import { Search, ListFilter, Download } from 'lucide-react';
import { questions } from '../data/mockData';
import type { OntologyQuestion } from '../data/mockData';

const statusFilters = [
  { key: 'all', label: 'All' },
  { key: 'concluded', label: 'Concluded' },
];

const sourceFilters = [
  { key: 'all', label: 'All Sources' },
  { key: 'structural', label: 'Structural' },
  { key: 'inference', label: 'Inference' },
  { key: 'runtime', label: 'Runtime' },
];

const responseFilters = [
  { key: 'all', label: 'All Responses' },
  { key: 'no_response', label: 'No Response' },
  { key: 'partial', label: 'Partial' },
  { key: 'full', label: 'Fully Answered' },
];

const sourceColors: Record<string, string> = {
  structural: 'bg-cyan-500/20 text-cyan-400',
  inference: 'bg-purple-500/20 text-purple-400',
  runtime: 'bg-orange-500/20 text-orange-400',
};

const statusColors: Record<string, string> = {
  pending_dispatch: 'bg-gray-500/20 text-gray-400',
  pending_answer: 'bg-amber-500/20 text-amber-400',
  concluded: 'bg-emerald-500/20 text-emerald-400',
  timeout: 'bg-rose-500/20 text-rose-400',
  closed: 'bg-white/5 text-gray-500',
};

const statusLabels: Record<string, string> = {
  pending_dispatch: 'Pending',
  pending_answer: 'Awaiting',
  concluded: 'Concluded',
  timeout: 'Timed Out',
  closed: 'Closed',
};

const priorityDots: Record<string, string> = {
  high: 'bg-rose-400',
  medium: 'bg-amber-400',
  low: 'bg-gray-400',
};

function fuzzyMatch(text: string, query: string): number {
  const lower = text.toLowerCase();
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  let score = 0;
  for (const term of terms) {
    if (lower.includes(term)) score += 1;
  }
  return score;
}

function getResponseCategory(q: OntologyQuestion): string {
  if (q.consensusAnswered === 0) return 'no_response';
  if (q.consensusAnswered >= q.consensusTotal) return 'full';
  return 'partial';
}

interface Props {
  onSelectQuestion: (q: OntologyQuestion) => void;
  searchQuery?: string;
}

export default function QuestionTasksPanel({ onSelectQuestion, searchQuery }: Props) {
  const [localSearch, setLocalSearch] = useState('');
  const [activeStatus, setActiveStatus] = useState('all');
  const [activeSource, setActiveSource] = useState('all');
  const [activeResponse, setActiveResponse] = useState('all');

  const effectiveSearch = searchQuery || localSearch;

  let filtered = questions;

  // Fuzzy search
  if (effectiveSearch.trim()) {
    const scored = filtered.map((q) => ({
      q,
      score: fuzzyMatch(`${q.id} ${q.summary} ${q.fullDescription} ${q.domain} ${q.currentDefinition}`, effectiveSearch),
    }));
    scored.sort((a, b) => b.score - a.score);
    filtered = scored.filter((s) => s.score > 0).map((s) => s.q);
    // If driven by chat searchQuery, limit to top 3
    if (searchQuery) {
      filtered = filtered.slice(0, 3);
    }
  }

  // Filters (only apply when not in searchQuery mode, to keep fuzzy results clean)
  if (!searchQuery) {
    if (activeStatus !== 'all') filtered = filtered.filter((q) => q.status === activeStatus);
    if (activeSource !== 'all') filtered = filtered.filter((q) => q.source === activeSource);
    if (activeResponse !== 'all') filtered = filtered.filter((q) => getResponseCategory(q) === activeResponse);
  }

  const handleExport = () => {
    const headers = ['ID', 'Source', 'Domain', 'Priority', 'Status', 'Summary', 'Consensus Answered', 'Consensus Total', 'Consistency (%)'];
    const rows = questions.map((q) => [
      q.id, q.source, q.domain, q.priority, q.status, q.summary,
      q.consensusAnswered, q.consensusTotal, q.consensusConsistency,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'question_tasks.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Question Tasks</h2>
          {searchQuery && (
            <p className="text-sm text-gray-500">
              Top matches for "{searchQuery}" · {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Search bar (hidden when driven by chat query) */}
      {!searchQuery && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search questions by keyword, ID, or domain..."
            className="w-full pl-10 pr-4 py-2.5 bg-dark-50 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/20"
          />
        </div>
      )}

      {/* Multi-dimensional filters (hidden when driven by chat query) */}
      {!searchQuery && (
        <div className="space-y-2">
          {/* Status */}
          <div className="flex items-center gap-1 flex-wrap">
            {statusFilters.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveStatus(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeStatus === tab.key
                    ? 'bg-indigo/20 text-indigo-400'
                    : 'bg-white/5 text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Question list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-10 text-gray-500 text-sm">No matching tasks found.</div>
        )}
        {filtered.map((q) => (
          <div
            key={q.id}
            onClick={() => onSelectQuestion(q)}
            className="p-4 rounded-xl bg-dark-50 border border-white/5 hover:bg-black/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs text-gray-500 font-mono flex-shrink-0">{q.id}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-gray-400 flex-shrink-0">{q.domain}</span>
              {q.status === 'concluded' && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold flex-shrink-0 ${statusColors[q.status]}`}>
                  {statusLabels[q.status]}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-300 mb-2">{q.summary}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Experts: {q.consensusAnswered}/{q.consensusTotal}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
