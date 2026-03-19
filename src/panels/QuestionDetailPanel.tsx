import { ArrowLeft } from 'lucide-react';
import type { OntologyQuestion } from '../data/mockData';

export default function QuestionDetailPanel({ question }: { question: OntologyQuestion }) {
  const q = question;
  const isConcluded = q.status === 'concluded';

  // Determine final answer for concluded questions
  const getFinalAnswer = () => {
    if (!isConcluded || q.answers.length === 0) return null;
    
    // Count conclusions
    const counts = q.answers.reduce((acc, a) => {
      acc[a.conclusion] = (acc[a.conclusion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Get majority conclusion
    const majority = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    const conclusionType = majority[0];
    
    if (conclusionType === 'correct') {
      return 'The current ontology definition is correct and should be maintained.';
    } else if (conclusionType === 'incorrect') {
      // Get notes from experts who marked incorrect
      const notes = q.answers.filter(a => a.conclusion === 'incorrect' && a.note).map(a => a.note);
      return notes.length > 0 ? notes[0] : 'The current ontology definition needs revision.';
    } else {
      return 'The conclusion is uncertain and requires further review.';
    }
  };

  return (
    <div className="space-y-8 py-2">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-semibold text-white">{q.id}</h1>
          <span className="px-3 py-1 rounded-full text-xs bg-white/5 text-gray-400">{q.domain}</span>
          {isConcluded && (
            <span className="px-3 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-400 font-medium">
              Concluded
            </span>
          )}
        </div>

        {!isConcluded ? (
          // Non-concluded: show description, current definition, and options
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500 mb-3">Question</p>
              <p className="text-base text-gray-200 leading-[1.7]">{q.fullDescription}</p>
            </div>
            
            <div className="pt-6 border-t border-white/5">
              <p className="text-sm text-gray-500 mb-3">Current Definition</p>
              <p className="text-base text-gray-200 leading-[1.7]">{q.currentDefinition}</p>
            </div>

            {q.options && q.options.length > 0 && (
              <div className="pt-6 border-t border-white/5">
                <p className="text-sm text-gray-500 mb-4">Options</p>
                <div className="space-y-2">
                  {q.options.map((option, index) => (
                    <div key={index} className="flex items-start gap-3 py-2">
                      <span className="text-sm text-gray-500 font-medium mt-0.5">{String.fromCharCode(65 + index)}.</span>
                      <p className="text-base text-gray-200 leading-[1.7]">{option}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Concluded: show question, answer and contributors
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500 mb-3">Question</p>
              <p className="text-base text-gray-200 leading-[1.7]">{q.fullDescription}</p>
            </div>

            <div className="pt-6 border-t border-white/5">
              <p className="text-sm text-emerald-400 mb-3">Answer</p>
              <p className="text-base text-gray-200 leading-[1.7]">{q.correctAnswer || getFinalAnswer()}</p>
            </div>
            
            <div className="pt-6 border-t border-white/5">
              <p className="text-sm text-gray-500 mb-4">Contributing Experts</p>
              <div className="flex flex-wrap gap-3">
                {q.answers.map((a) => (
                  <div key={a.expertId} className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/8 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-indigo/20 flex items-center justify-center text-indigo-400 text-xs font-medium">
                      {a.expertName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-sm text-gray-300">{a.expertName}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Back button */}
      <div className="pt-4 border-t border-white/5">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Question Tasks
        </button>
      </div>
    </div>
  );
}
