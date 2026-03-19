import { useState } from 'react';
import { Mail, ChevronLeft, ChevronRight, UserPlus, X } from 'lucide-react';
import type { Expert } from '../data/mockData';

const PAGE_SIZE = 6;

interface Props {
  experts: Expert[];
  onConfirm: (count: number) => void;
}

export default function ImportPreviewPanel({ experts: initialExperts, onConfirm }: Props) {
  const [experts, setExperts] = useState(initialExperts);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(experts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = experts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const removedCount = initialExperts.length - experts.length;

  const handleRemove = (id: string) => {
    setExperts((prev) => {
      const next = prev.filter((e) => e.id !== id);
      // If current page becomes empty, go back one page
      const newTotalPages = Math.max(1, Math.ceil(next.length / PAGE_SIZE));
      if (page > newTotalPages) setPage(newTotalPages);
      return next;
    });
  };

  const handleConfirm = () => {
    onConfirm(experts.length);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Import Preview</h2>
          <p className="text-sm text-gray-500">
            {experts.length} experts
            {removedCount > 0 && <span className="text-amber-400"> · {removedCount} removed</span>}
          </p>
        </div>
        <UserPlus className="w-8 h-8 text-indigo-400" />
      </div>

      {/* Expert cards */}
      <div className="space-y-3">
        {paged.map((exp) => (
          <div key={exp.id} className="bg-dark-50 rounded-2xl border border-white/5 p-4 hover:bg-black/40 transition-colors">
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-indigo/20 flex items-center justify-center text-indigo-400 font-semibold text-lg">
                  {exp.avatar}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-dark-50 ${exp.online ? 'bg-emerald-400' : 'bg-gray-600'}`} />
              </div>

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

              {(
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemove(exp.id); }}
                  className="p-1.5 rounded-lg text-gray-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex-shrink-0"
                  title="Remove from import"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-gray-500">
          {experts.length} experts · Page {currentPage} of {totalPages}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
            const n = start + i;
            if (n > totalPages) return null;
            return (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                  n === currentPage ? 'bg-indigo/20 text-indigo-400' : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {n}
              </button>
            );
          })}
          {totalPages > 5 && currentPage < totalPages - 2 && (
            <span className="text-xs text-gray-600 px-1">…</span>
          )}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Confirm button */}
      <div className="pt-2">
        <button
          onClick={handleConfirm}
          className="w-full py-4 rounded-xl text-base font-semibold bg-indigo/20 text-indigo-400 hover:bg-indigo/30 transition-colors border border-indigo/30"
        >
          Confirm Import ({experts.length} experts)
        </button>
      </div>
    </div>
  );
}
