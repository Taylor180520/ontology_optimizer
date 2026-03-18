import { useState } from 'react';
import { Search, Mail, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { topExperts } from '../data/mockData';

const PAGE_SIZE = 4;

function fuzzyScore(text: string, query: string): number {
  const lower = text.toLowerCase();
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  let score = 0;
  for (const term of terms) {
    if (lower.includes(term)) score += 1;
  }
  return score;
}

interface Props {
  searchQuery?: string;
}

export default function ExpertPoolPanel({ searchQuery }: Props) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Determine visible experts
  let displayExperts = topExperts;

  if (searchQuery) {
    const scored = topExperts.map((e) => ({
      e,
      score: fuzzyScore(`${e.name} ${e.department} ${e.email} ${e.domains.join(' ')}`, searchQuery),
    }));
    scored.sort((a, b) => b.score - a.score);
    displayExperts = scored.filter((s) => s.score > 0).slice(0, 2).map((s) => s.e);
  } else if (search) {
    displayExperts = topExperts.filter((e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.domains.some((d) => d.toLowerCase().includes(search.toLowerCase())) ||
      e.department.toLowerCase().includes(search.toLowerCase())
    );
  }

  const totalPages = Math.max(1, Math.ceil(displayExperts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = searchQuery ? displayExperts : displayExperts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Reset to page 1 when search changes
  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleExport = () => {
    const headers = ['Name', 'Department', 'Email', 'Domains', 'Status', 'Total Answers', 'Accuracy (%)'];
    const rows = topExperts.map((e) => [
      e.name,
      e.department,
      e.email,
      e.domains.join('; '),
      e.online ? 'Online' : 'Offline',
      e.totalAnswers,
      e.correctionRate,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expert_pool.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Expert Pool</h2>
          <p className="text-sm text-gray-500">
            {searchQuery
              ? `Top matches for "${searchQuery}" · ${displayExperts.length} result${displayExperts.length !== 1 ? 's' : ''}`
              : 'Manage and view expert profiles'}
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Summary stats */}
      {!searchQuery && (
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-dark-50 rounded-2xl p-5 border border-white/5 text-center">
          <div className="text-3xl font-bold text-white">{topExperts.length}</div>
          <p className="text-xs text-gray-400 mt-1">Total Experts</p>
        </div>
        <div className="bg-dark-50 rounded-2xl p-5 border border-white/5 text-center">
          <div className="text-3xl font-bold text-emerald-400">{topExperts.filter((e) => e.online).length}</div>
          <p className="text-xs text-gray-400 mt-1">Online Now</p>
        </div>
        <div className="bg-dark-50 rounded-2xl p-5 border border-white/5 text-center">
          <div className="text-3xl font-bold text-cyan-400">
            {Math.round(topExperts.reduce((s, e) => s + e.dailyCompleted / e.dailyLimit, 0) / topExperts.length * 100)}%
          </div>
          <p className="text-xs text-gray-400 mt-1">Avg Utilization</p>
        </div>
      </div>
      )}

      {/* Search */}
      {!searchQuery && (
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by name, domain, or department..."
          className="w-full pl-10 pr-4 py-2.5 bg-dark-50 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/20"
        />
      </div>
      )}

      {/* Expert list */}
      <div className="space-y-3">
        {paged.map((exp) => (
          <div key={exp.id} className="bg-dark-50 rounded-2xl border border-white/5 p-4 hover:bg-black/40 transition-colors">
            <div className="flex items-center gap-4">
              {/* Avatar with online indicator */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-indigo/20 flex items-center justify-center text-indigo-400 font-semibold text-lg">
                  {exp.avatar}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-dark-50 ${exp.online ? 'bg-emerald-400' : 'bg-gray-600'}`} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm text-white font-medium">{exp.name}</span>
                  <span className="text-[10px] text-gray-500">{exp.online ? 'Online' : 'Offline'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                  <span>{exp.department}</span>
                  <span className="text-gray-700">·</span>
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{exp.email}</span>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {exp.domains.map((d) => (
                    <span key={d} className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-gray-400">{d}</span>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right">
                  <span className="text-sm text-white font-medium">{exp.totalAnswers}</span>
                  <p className="text-[10px] text-gray-500">Answers</p>
                </div>
                <div className="text-right">
                  <span className="text-sm text-emerald-400 font-medium">{exp.correctionRate}%</span>
                  <p className="text-[10px] text-gray-500">Accuracy</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {!searchQuery && (
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-gray-500">
          {displayExperts.length} expert{displayExperts.length !== 1 ? 's' : ''} · Page {currentPage} of {totalPages}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                n === currentPage ? 'bg-indigo/20 text-indigo-400' : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      )}
    </div>
  );
}
