import { useState } from 'react';
import { Eye, ChevronDown, ChevronUp, UserPlus, Tag, FileText, AlertTriangle } from 'lucide-react';
import type { OntologyQuestion } from '../data/mockData';

const sourceLabels: Record<string, string> = {
  structural: 'Structural Traversal',
  inference: 'Logical Inference',
  runtime: 'Runtime Trace',
};

const conclusionConfig: Record<string, { label: string; color: string }> = {
  correct: { label: '✅ Correct', color: 'text-emerald-400' },
  incorrect: { label: '❌ Incorrect', color: 'text-rose-400' },
  uncertain: { label: '⏭️ Uncertain', color: 'text-gray-400' },
};

const stageColors: Record<string, { node: string; line: string }> = {
  completed: { node: 'bg-emerald-500', line: 'bg-emerald-500' },
  in_progress: { node: 'bg-indigo-400 animate-pulse', line: 'bg-indigo-400/50' },
  pending: { node: 'bg-gray-600', line: 'bg-gray-700' },
};

const statusLabels: Record<string, string> = {
  pending_dispatch: 'Pending Dispatch',
  pending_answer: 'Pending Answer',
  concluded: 'Concluded',
  timeout: 'Timed Out',
  closed: 'Closed',
};

export default function QuestionDetailPanel({ question }: { question: OntologyQuestion }) {
  const [showTrace, setShowTrace] = useState(false);
  const q = question;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-lg font-bold text-white">{q.id}</span>
          <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
            q.status === 'pending_answer' ? 'bg-amber-500/20 text-amber-400' :
            q.status === 'concluded' ? 'bg-emerald-500/20 text-emerald-400' :
            q.status === 'timeout' ? 'bg-rose-500/20 text-rose-400' :
            'bg-gray-500/20 text-gray-400'
          }`}>
            {statusLabels[q.status]}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-gray-400">{q.domain}</span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-gray-400">{sourceLabels[q.source]}</span>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed mb-4">{q.fullDescription}</p>
        <div className="p-4 rounded-xl bg-white/5 border-l-2 border-gray-600">
          <p className="text-xs text-gray-500 mb-1">Current Ontology Definition</p>
          <p className="text-sm text-gray-300">{q.currentDefinition}</p>
        </div>
      </div>

      {/* Runtime Trace */}
      {q.runtimeTrace && (
        <div className="bg-dark-50 rounded-2xl border border-orange-500/20 p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            <span className="text-sm text-orange-400 font-medium">Runtime Source</span>
            <span className="text-xs text-gray-500">From {q.runtimeTrace.agentId} on {q.runtimeTrace.date}</span>
          </div>
          <button
            onClick={() => setShowTrace(!showTrace)}
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors mt-1"
          >
            <Eye className="w-3.5 h-3.5" />
            {showTrace ? 'Collapse' : 'View Trace'}
            {showTrace ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {showTrace && (
            <div className="mt-3 space-y-2">
              {q.runtimeTrace.snippet.map((line, i) => {
                const isSystem = line.startsWith('System');
                const isAgent = line.startsWith('Agent');
                return (
                  <div key={i} className={`flex ${isAgent ? 'justify-end' : ''}`}>
                    <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs ${
                      isSystem ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' :
                      isAgent ? 'bg-indigo/20 text-indigo-300' :
                      'bg-white/5 text-gray-300'
                    }`}>
                      {line}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Consensus Monitor */}
      <div className="bg-dark-50 rounded-2xl border border-white/5 p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Consensus Monitor</h3>
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>Answered {q.consensusAnswered}/{q.consensusTotal}</span>
            <span>Consistency {q.consensusConsistency}%, threshold {q.consensusThreshold}%</span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${q.consensusConsistency >= q.consensusThreshold ? 'bg-emerald-400' : 'bg-amber-400'}`}
              style={{ width: `${(q.consensusAnswered / q.consensusTotal) * 100}%` }}
            />
          </div>
        </div>

        {q.answers.length > 0 && (
          <div className="space-y-2">
            {q.answers.map((a) => {
              const cfg = conclusionConfig[a.conclusion];
              return (
                <div key={a.expertId} className="p-3 rounded-xl bg-black/60">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo/20 flex items-center justify-center text-indigo-400 text-xs font-semibold">
                      {a.expertName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white font-medium">{a.expertName}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-gray-400">{a.domain}</span>
                      </div>
                      <span className="text-xs text-gray-500">{a.time}</span>
                    </div>
                    <span className={`text-sm font-medium ${cfg.color}`}>{cfg.label}</span>
                  </div>
                  {a.note && (
                    <p className="text-xs text-gray-400 mt-2 pl-11">{a.note}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Disagreement comparison */}
        {q.answers.some((a) => a.conclusion === 'incorrect') && q.answers.some((a) => a.conclusion === 'correct') && (
          <div className="mt-4 p-4 rounded-xl bg-black/40 border border-white/5">
            <p className="text-xs text-gray-500 uppercase mb-3">Disagreement Comparison</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <p className="text-xs text-emerald-400 font-medium mb-2">Marked Correct</p>
                {q.answers.filter((a) => a.conclusion === 'correct').map((a) => (
                  <p key={a.expertId} className="text-xs text-gray-300">{a.expertName}</p>
                ))}
              </div>
              <div className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/20">
                <p className="text-xs text-rose-400 font-medium mb-2">Marked Incorrect</p>
                {q.answers.filter((a) => a.conclusion === 'incorrect').map((a) => (
                  <div key={a.expertId}>
                    <p className="text-xs text-gray-300">{a.expertName}</p>
                    {a.note && <p className="text-[10px] text-gray-500 mt-0.5">{a.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dispatch Stages */}
      <div className="bg-dark-50 rounded-2xl border border-white/5 p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Dispatch Stages</h3>
        <div className="flex items-center gap-2">
          {q.dispatchStages.map((stage, i) => {
            const cfg = stageColors[stage.status];
            return (
              <div key={stage.stage} className="flex items-center gap-2 flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${cfg.node}`}>
                    {stage.stage}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 text-center max-w-[100px]">{stage.label}</p>
                  {stage.experts.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {stage.experts.map((e) => (
                        <span key={e} className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-gray-400">{e}</span>
                      ))}
                    </div>
                  )}
                </div>
                {i < q.dispatchStages.length - 1 && (
                  <div className={`flex-1 h-0.5 ${cfg.line}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button className="px-4 py-2.5 rounded-xl text-sm font-medium bg-indigo/20 text-indigo-400 hover:bg-indigo/30 transition-colors flex items-center gap-2">
          <UserPlus className="w-4 h-4" />Expand Dispatch
        </button>
        <button className="px-4 py-2.5 rounded-xl text-sm font-medium bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors flex items-center gap-2">
          <Tag className="w-4 h-4" />Mark as Concluded
        </button>
        <button className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 text-gray-400 hover:bg-white/10 transition-colors">
          Archive
        </button>
        <button className="px-4 py-2.5 rounded-xl text-sm font-medium bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors flex items-center gap-2">
          <FileText className="w-4 h-4" />Create Issue
        </button>
      </div>
    </div>
  );
}
