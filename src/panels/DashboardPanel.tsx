import { useState } from 'react';
import { Activity, Bell, CheckCircle2, X } from 'lucide-react';
import { topExperts } from '../data/mockData';

interface NudgeToast {
  id: string;
  expertName: string;
}

type Tab = 'in_progress' | 'completed';

export default function DashboardPanel() {
  const [toasts, setToasts] = useState<NudgeToast[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('in_progress');

  const doneExperts = topExperts.filter((e) => e.dailyCompleted >= e.dailyLimit);
  const pendingExperts = topExperts.filter((e) => e.dailyCompleted < e.dailyLimit);
  const completedCount = doneExperts.length;
  const totalCount = topExperts.length;
  const visibleExperts = activeTab === 'completed' ? doneExperts : pendingExperts;

  const handleNudge = (expert: typeof topExperts[0]) => {
    const id = `${expert.id}-${Date.now()}`;
    setToasts((prev) => [...prev, { id, expertName: expert.name }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast notifications */}
      <div className="fixed top-20 right-6 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm animate-in slide-in-from-right"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <p className="text-sm text-emerald-300">
              Teams reminder sent to <span className="font-medium text-white">{toast.expertName}</span>
            </p>
            <button onClick={() => dismissToast(toast.id)} className="text-gray-500 hover:text-gray-300 ml-2">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Expert Progress Wall</h2>
          <p className="text-sm text-gray-500">
            {completedCount} of {totalCount} experts on track today
          </p>
        </div>
        <Activity className="w-8 h-8 text-indigo-400" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-50 rounded-xl p-1 border border-white/5">
        <button
          onClick={() => setActiveTab('in_progress')}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'in_progress'
              ? 'bg-white/10 text-white'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          In Progress
          <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${
            activeTab === 'in_progress' ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-gray-500'
          }`}>
            {pendingExperts.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'completed'
              ? 'bg-white/10 text-white'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Completed
          <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${
            activeTab === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-500'
          }`}>
            {doneExperts.length}
          </span>
        </button>
      </div>

      {/* Expert cards */}
      <div className="grid grid-cols-1 gap-3">
        {visibleExperts.length === 0 && (
          <div className="text-center py-10 text-gray-500 text-sm">
            {activeTab === 'completed' ? 'No experts have completed their quota yet.' : 'All experts have met their quota — nice!'}
          </div>
        )}
        {visibleExperts.map((exp) => {
          const pct = Math.round((exp.dailyCompleted / exp.dailyLimit) * 100);
          const isDone = pct >= 100;
          const isLow = pct < 50;
          const barColor = isDone ? 'bg-emerald-400' : isLow ? 'bg-amber-400' : 'bg-indigo-400';

          return (
            <div
              key={exp.id}
              className={`bg-dark-50 rounded-2xl border p-5 transition-colors ${
                isDone ? 'border-emerald-500/10' : isLow ? 'border-amber-500/15' : 'border-white/5'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${
                  isDone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo/20 text-indigo-400'
                }`}>
                  {exp.avatar}
                </div>

                {/* Info + progress */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-white font-medium">{exp.name}</span>
                    <div className="flex gap-1">
                      {exp.domains.map((d) => (
                        <span key={d} className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-gray-500">{d}</span>
                      ))}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <span className={`text-xs font-semibold w-16 text-right ${
                      isDone ? 'text-emerald-400' : isLow ? 'text-amber-400' : 'text-gray-400'
                    }`}>
                      {exp.dailyCompleted}/{exp.dailyLimit}
                      {isDone && ' ✓'}
                    </span>
                  </div>
                </div>

                {/* Nudge button — only if not done */}
                {!isDone && (
                  <button
                    onClick={() => handleNudge(exp)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all flex-shrink-0 ${
                      isLow
                        ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/20'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Bell className="w-3.5 h-3.5" />
                    Nudge
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
