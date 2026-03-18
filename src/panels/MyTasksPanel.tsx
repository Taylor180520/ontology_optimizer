import { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { myTasks, currentUser } from '../data/mockData';

type Tab = 'todo' | 'replied';

const priorityDots: Record<string, string> = {
  high: 'bg-rose-400',
  medium: 'bg-amber-400',
  low: 'bg-gray-400',
};

const conclusionLabels: Record<string, { label: string; color: string }> = {
  correct: { label: '✅ Correct', color: 'text-emerald-400' },
  incorrect: { label: '❌ Incorrect', color: 'text-rose-400' },
  uncertain: { label: '⏭️ Uncertain', color: 'text-gray-400' },
};

export default function MyTasksPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('todo');

  const todoTasks = myTasks.filter((t) => t.status === 'todo');
  const repliedTasks = myTasks.filter((t) => t.status === 'replied');
  const visible = activeTab === 'todo' ? todoTasks : repliedTasks;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">My Tasks</h2>
          <p className="text-sm text-gray-500">
            {currentUser.name} · {todoTasks.length} pending, {repliedTasks.length} replied
          </p>
        </div>
        <ClipboardList className="w-8 h-8 text-indigo-400" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-50 rounded-xl p-1 border border-white/5">
        <button
          onClick={() => setActiveTab('todo')}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'todo' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Today's To-Do
          <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${
            activeTab === 'todo' ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-gray-500'
          }`}>
            {todoTasks.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('replied')}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'replied' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          History
          <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${
            activeTab === 'replied' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-500'
          }`}>
            {repliedTasks.length}
          </span>
        </button>
      </div>

      {/* Task list */}
      <div className="space-y-3">
        {visible.length === 0 && (
          <div className="text-center py-10 text-gray-500 text-sm">
            {activeTab === 'todo' ? 'All caught up — no pending tasks.' : 'No history yet.'}
          </div>
        )}
        {visible.map((task) => (
          <div
            key={task.id}
            className={`p-4 rounded-xl bg-dark-50 border transition-colors ${
              task.status === 'todo' ? 'border-amber-500/15 hover:bg-black/40' : 'border-white/5 hover:bg-black/40'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs text-gray-500 font-mono flex-shrink-0">{task.questionId}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-gray-400">{task.domain}</span>
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ml-auto ${priorityDots[task.priority]}`} />
            </div>
            <p className="text-sm text-gray-300 mb-2">{task.summary}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Assigned {task.assignedDate}</span>
              {task.status === 'replied' && task.repliedDate && (
                <span>Replied {task.repliedDate}</span>
              )}
              {task.conclusion && (
                <span className={conclusionLabels[task.conclusion].color}>
                  {conclusionLabels[task.conclusion].label}
                </span>
              )}
            </div>
            {task.note && (
              <p className="text-xs text-gray-400 mt-2 pl-0 border-l-2 border-white/10 pl-3">{task.note}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
