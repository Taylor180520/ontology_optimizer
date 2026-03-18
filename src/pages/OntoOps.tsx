import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip } from 'lucide-react';
import DashboardPanel from '../panels/DashboardPanel';
import QuestionTasksPanel from '../panels/QuestionTasksPanel';
import QuestionDetailPanel from '../panels/QuestionDetailPanel';
import ExpertPoolPanel from '../panels/ExpertPoolPanel';
import ImportPreviewPanel from '../panels/ImportPreviewPanel';
import MyTasksPanel from '../panels/MyTasksPanel';
import { questions, topExperts, myTasks, currentUser } from '../data/mockData';
import { generateImportedExperts } from '../data/importedExperts';
import type { OntologyQuestion, Expert } from '../data/mockData';

interface ChatMessage {
  id: string;
  role: 'user' | 'steward';
  content: string;
  timestamp: string;
}

type PanelType = 'dashboard' | 'question_tasks' | 'question_detail' | 'expert_pool' | 'import_preview' | 'my_tasks' | null;

const initialMessages: ChatMessage[] = [
  {
    id: '1',
    role: 'steward',
    content: 'WELCOME',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

export default function OntoOps() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentPanel, setCurrentPanel] = useState<PanelType>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<OntologyQuestion | null>(null);
  const [taskSearchQuery, setTaskSearchQuery] = useState<string | undefined>();
  const [expertSearchQuery, setExpertSearchQuery] = useState<string | undefined>();
  const [importedExperts, setImportedExperts] = useState<Expert[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const addStewardMessage = (content: string) => {
    const msg: ChatMessage = {
      id: Date.now().toString(),
      role: 'steward',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, msg]);
  };

  const handleIntent = (text: string) => {
    const lower = text.toLowerCase();

    // Detect JSON API config for expert import
    if (text.includes('/api/hrm/') || (text.includes('"request"') && text.includes('"url"'))) {
      const generated = generateImportedExperts();
      setImportedExperts(generated);
      setCurrentPanel('import_preview');
      addStewardMessage('PANEL:import_preview');
      return;
    }

    // Import experts intent
    if (lower.includes('import expert') || lower.includes('import experts') || lower.includes('add expert') || lower.includes('onboard expert')) {
      setCurrentPanel(null);
      addStewardMessage('IMPORT_PROMPT');
      return;
    }

    // My Tasks intent
    if (lower.includes('my task') || lower.includes('my to-do') || lower.includes('my todo') || lower.includes('assigned to me') || lower.includes('my assignment') || lower.includes('my work')) {
      setCurrentPanel('my_tasks');
      const todoCount = myTasks.filter((t) => t.status === 'todo').length;
      const repliedCount = myTasks.filter((t) => t.status === 'replied').length;
      addStewardMessage(`PANEL:my_tasks:${todoCount}:${repliedCount}`);
      return;
    }

    if (lower.includes('dashboard') || lower.includes('overview') || lower.includes('health') || lower.includes('accuracy')) {
      setCurrentPanel('dashboard');
      setTaskSearchQuery(undefined);
      addStewardMessage('PANEL:dashboard');
      return;
    }
    // Specific question by ID
    if (/q-\d+/i.test(lower)) {
      const match = lower.match(/q-(\d+)/i);
      if (match) {
        const q = questions.find((q) => q.id.toLowerCase() === `q-${match[1]}`);
        if (q) {
          setSelectedQuestion(q);
          setCurrentPanel('question_detail');
          addStewardMessage(`PANEL:question_detail:${q.id}`);
          return;
        }
      }
    }
    // Generic "show all tasks" intent
    if (/^(show |list |all )?(question|task|tasks|questions)\b/i.test(lower) || lower === 'question tasks') {
      setTaskSearchQuery(undefined);
      setCurrentPanel('question_tasks');
      addStewardMessage('PANEL:question_tasks');
      return;
    }
    // Fuzzy task search — if user mentions task-related keywords with specifics
    if (lower.includes('task') || lower.includes('question') || lower.includes('sop') || lower.includes('wms') || lower.includes('inbound') || lower.includes('outbound') || lower.includes('picking') || lower.includes('definition') || lower.includes('conflict')) {
      // Extract the meaningful search query (strip common command words)
      const searchText = text.replace(/^(show|find|search|look up|help me|can you|please|look for|get)\s+(me\s+)?/i, '').trim();
      setTaskSearchQuery(searchText);
      setCurrentPanel('question_tasks');
      addStewardMessage(`PANEL:question_tasks_search:${searchText}`);
      return;
    }
    if (lower.includes('expert') || lower.includes('pool') || lower.includes('who') || lower.startsWith('find ')) {
      // Check if there's a specific name/search beyond just "expert pool"
      const genericPatterns = /^(show |list |all |open )?(expert pool|experts|expert|pool)\s*$/i;
      if (genericPatterns.test(text.trim())) {
        setExpertSearchQuery(undefined);
        setCurrentPanel('expert_pool');
        addStewardMessage('PANEL:expert_pool');
      } else {
        const searchText = text.replace(/^(show|find|search|look up|help me|can you|please|look for|get|who is|who's)\s+(me\s+)?/i, '').replace(/\b(expert|pool|in the|from)\b/gi, '').trim();
        setExpertSearchQuery(searchText);
        setCurrentPanel('expert_pool');
        addStewardMessage(`PANEL:expert_pool_search:${searchText}`);
      }
      return;
    }
    setCurrentPanel(null);
    addStewardMessage(`Got it. You can use the quick actions or tell me what you'd like to see — e.g. "dashboard", "question tasks", "expert pool", etc.`);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    const text = input;
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      handleIntent(text);
      setIsTyping(false);
    }, 800);
  };

  const handleQuickAction = (action: string) => {
    const labelMap: Record<string, string> = {
      dashboard: 'Show Dashboard',
      question_tasks: 'Question Tasks',
      expert_pool: 'Expert Pool',
      import_experts: 'Import Experts',
      my_tasks: 'My Tasks',
    };
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: labelMap[action] || action,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);
    setTimeout(() => {
      if (action === 'import_experts') {
        setCurrentPanel(null);
        addStewardMessage('IMPORT_PROMPT');
      } else if (action === 'my_tasks') {
        setCurrentPanel('my_tasks');
        const todoCount = myTasks.filter((t) => t.status === 'todo').length;
        const repliedCount = myTasks.filter((t) => t.status === 'replied').length;
        addStewardMessage(`PANEL:my_tasks:${todoCount}:${repliedCount}`);
      } else {
        setCurrentPanel(action as PanelType);
        if (action === 'question_tasks') setTaskSearchQuery(undefined);
        if (action === 'expert_pool') setExpertSearchQuery(undefined);
        addStewardMessage(`PANEL:${action}`);
      }
      setIsTyping(false);
    }, 600);
  };

  const handleSelectQuestion = (q: OntologyQuestion) => {
    setSelectedQuestion(q);
    setCurrentPanel('question_detail');
    addStewardMessage(`PANEL:question_detail:${q.id}`);
  };

  const getFollowUps = (panel: string): { label: string; action: string }[] => {
    switch (panel) {
      case 'dashboard':
        return [
          { label: 'Show Question Tasks', action: 'Question Tasks' },
          { label: 'Check My Tasks', action: 'My Tasks' },
          { label: 'Open Expert Pool', action: 'Expert Pool' },
        ];
      case 'question_tasks':
        return [
          { label: 'Search WMS inbound SOP', action: 'Question task related to WMS inbound SOP' },
          { label: 'Open Dashboard', action: 'Show Dashboard' },
          { label: 'Check My Tasks', action: 'My Tasks' },
        ];
      case 'question_tasks_search':
        return [
          { label: 'Show all tasks', action: 'Question Tasks' },
          { label: 'Open Expert Pool', action: 'Expert Pool' },
          { label: 'Open Dashboard', action: 'Show Dashboard' },
        ];
      case 'question_detail':
        return [
          { label: 'Back to all tasks', action: 'Question Tasks' },
          { label: 'Open Expert Pool', action: 'Expert Pool' },
          { label: 'Check My Tasks', action: 'My Tasks' },
        ];
      case 'expert_pool':
        return [
          { label: 'Find Alex', action: 'Find Alex' },
          { label: 'Import Experts', action: 'Import Experts' },
          { label: 'Open Dashboard', action: 'Show Dashboard' },
        ];
      case 'expert_pool_search':
        return [
          { label: 'Show full Expert Pool', action: 'Expert Pool' },
          { label: 'Open Dashboard', action: 'Show Dashboard' },
          { label: 'Check My Tasks', action: 'My Tasks' },
        ];
      case 'my_tasks':
        return [
          { label: 'Open Dashboard', action: 'Show Dashboard' },
          { label: 'Show Question Tasks', action: 'Question Tasks' },
          { label: 'Open Expert Pool', action: 'Expert Pool' },
        ];
      case 'import_preview':
        return [
          { label: 'Open Expert Pool', action: 'Expert Pool' },
          { label: 'Open Dashboard', action: 'Show Dashboard' },
        ];
      case 'import_prompt':
        return [
          { label: 'Open Expert Pool', action: 'Expert Pool' },
          { label: 'Check My Tasks', action: 'My Tasks' },
          { label: 'Open Dashboard', action: 'Show Dashboard' },
        ];
      case 'import_confirmed':
        return [
          { label: 'Open Expert Pool', action: 'Expert Pool' },
          { label: 'Open Dashboard', action: 'Show Dashboard' },
          { label: 'Check My Tasks', action: 'My Tasks' },
        ];
      default:
        return [
          { label: 'Open Dashboard', action: 'Show Dashboard' },
          { label: 'Show Question Tasks', action: 'Question Tasks' },
          { label: 'Open Expert Pool', action: 'Expert Pool' },
          { label: 'Check My Tasks', action: 'My Tasks' },
        ];
    }
  };

  const handleFollowUp = (action: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: action,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);
    setTimeout(() => {
      handleIntent(action);
      setIsTyping(false);
    }, 600);
  };

  const renderFollowUps = (panel: string) => {
    const followUps = getFollowUps(panel);
    return (
      <div className="mt-4 flex flex-wrap gap-3">
        {followUps.map((fu) => (
          <button
            key={fu.label}
            onClick={() => handleFollowUp(fu.action)}
            className="px-6 py-3 rounded-full border border-white/20 text-base text-gray-300 hover:text-white hover:border-white/40 transition-all"
          >
            {fu.label}
          </button>
        ))}
      </div>
    );
  };

  const renderMessageContent = (message: ChatMessage) => {
    if (message.content === 'WELCOME') {
      return (
        <div className="w-full">
          <div className="text-base leading-[1.7] text-gray-200 space-y-3 font-normal">
            <p>Hi, I'm your ontology operations assistant. Here's what I can help you with:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 text-base pl-1">
              <li>Monitor ontology health across all business domains</li>
              <li>Search and browse question tasks with multi-dimensional filters</li>
              <li>Manage the expert pool and workload</li>
              <li>Import experts via manual input, CSV upload, or internal API</li>
              <li>View your personal task list with today's to-do and history</li>
            </ul>
            <p className="text-gray-400">Pick an action below or just tell me what you need.</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {[
              { key: 'dashboard', label: 'Dashboard' },
              { key: 'question_tasks', label: 'Question Tasks' },
              { key: 'expert_pool', label: 'Expert Pool' },
              { key: 'import_experts', label: 'Import Experts' },
              { key: 'my_tasks', label: 'My Tasks' },
            ].map((btn) => (
              <button
                key={btn.key}
                onClick={() => handleQuickAction(btn.key)}
                className="px-6 py-3 rounded-full border border-white/20 text-base text-gray-300 hover:text-white hover:border-white/40 transition-all"
              >
                {btn.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3">{message.timestamp}</p>
        </div>
      );
    }

    if (message.content === 'IMPORT_PROMPT') {
      return (
        <div className="w-full">
          <div className="text-base leading-[1.7] text-gray-200 space-y-3 font-normal">
            <p>Sure, I can help you import experts. Here are your options:</p>
            <div className="space-y-3 mt-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-base text-white font-medium mb-1.5">1. Tell me directly</p>
                <p className="text-sm text-gray-300 leading-relaxed">Just type the expert details (name, email, department, domains) and I'll add them.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-base text-white font-medium mb-1.5">2. Upload CSV / Excel</p>
                <p className="text-sm text-gray-300 leading-relaxed">Drag and drop or attach a spreadsheet file with expert data.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-base text-white font-medium mb-1.5">3. Connect to internal API</p>
                <p className="text-sm text-gray-300 leading-relaxed">Paste your API endpoint config as JSON and I'll fetch the data. Example:</p>
                <pre className="mt-2 p-2 rounded-lg bg-black/60 text-[11px] text-indigo-300 overflow-x-auto">{`{"request": {
  "method": "GET",
  "url": "/api/hrm/employees",
  "query_params": {
    "department": "Logistics",
    "role": "Specialist"
  }
}}`}</pre>
              </div>
            </div>
          </div>
          {renderFollowUps('import_prompt')}
          <p className="text-xs text-gray-500 mt-4">{message.timestamp}</p>
        </div>
      );
    }

    if (message.content.startsWith('PANEL:')) {
      const parts = message.content.replace('PANEL:', '').split(':');
      const panel = parts[0];
      const extra = parts[1];
      const panelTexts: Record<string, string> = {
        dashboard: (() => {
          const behind = topExperts.filter((e) => e.dailyCompleted < e.dailyLimit);
          const slow = topExperts.filter((e) => e.dailyCompleted / e.dailyLimit < 0.5);
          const done = topExperts.length - behind.length;
          if (behind.length === 0) return `All ${topExperts.length} experts have completed their tasks today. No action needed.`;
          let msg = `${done} of ${topExperts.length} experts are done for today. `;
          if (slow.length > 0) {
            msg += `${slow.map((e) => `${e.name} (${e.dailyCompleted}/${e.dailyLimit})`).join(', ')} ${slow.length === 1 ? 'is' : 'are'} significantly behind — I\'d recommend sending a nudge. `;
          }
          const remaining = behind.filter((e) => e.dailyCompleted / e.dailyLimit >= 0.5);
          if (remaining.length > 0) {
            msg += `${remaining.map((e) => e.name).join(', ')} ${remaining.length === 1 ? 'is' : 'are'} making progress but not there yet.`;
          }
          return msg;
        })(),
        question_tasks: 'Here are all question tasks in the bank. Use the filters to narrow by status, source, or expert response.',
        question_tasks_search: extra ? `Found the top matches for "${extra}". Click any task to see full details.` : 'Showing search results.',
        question_detail: extra ? `Loaded full details for ${extra}, including consensus progress and dispatch stages.` : 'Question detail is now showing.',
        expert_pool: 'Expert Pool is open. You can also tell me "add an expert" to quickly onboard someone.',
        expert_pool_search: extra ? `Found the top matches for "${extra}" in the expert pool.` : 'Showing search results.',
        my_tasks: (() => {
          const todo = extra ? parseInt(extra) : 0;
          const replied = parts[2] ? parseInt(parts[2]) : 0;
          if (todo === 0) return `You're all caught up, ${currentUser.name}. No pending tasks today. You have ${replied} completed items in your history.`;
          return `${currentUser.name}, you have ${todo} pending task${todo !== 1 ? 's' : ''} for today and ${replied} completed in your history. I'd recommend starting with the high-priority items.`;
        })(),
        import_preview: `Successfully connected to the HRM API. Found ${importedExperts.length} experts matching department=Logistics & role=Specialist. Review them on the right and confirm to import.`,
      };
      return (
        <div className="w-full">
          <p className="text-base leading-[1.7] text-gray-200 font-normal">{panelTexts[panel] || 'Panel switched.'}</p>
          {renderFollowUps(panel)}
          <p className="text-xs text-gray-500 mt-2">{message.timestamp}</p>
        </div>
      );
    }

    return (
      <div className={message.role === 'user' ? 'text-white text-base' : ''}>
        <p className={`text-base whitespace-pre-wrap leading-[1.7] font-normal ${message.role === 'user' ? 'text-white' : 'text-gray-200'}`}>
          {message.content}
        </p>
        {message.role === 'steward' && (
          message.content.includes('imported to the Expert Pool')
            ? renderFollowUps('import_confirmed')
            : renderFollowUps('fallback')
        )}
        <p className={`text-xs mt-3 ${message.role === 'user' ? 'text-gray-500' : 'text-gray-600'}`}>{message.timestamp}</p>
      </div>
    );
  };

  const renderPanel = () => {
    switch (currentPanel) {
      case 'dashboard':
        return <DashboardPanel />;
      case 'question_tasks':
        return <QuestionTasksPanel onSelectQuestion={handleSelectQuestion} searchQuery={taskSearchQuery} />;
      case 'question_detail':
        return selectedQuestion ? <QuestionDetailPanel question={selectedQuestion} /> : null;
      case 'expert_pool':
        return <ExpertPoolPanel searchQuery={expertSearchQuery} />;
      case 'import_preview':
        return <ImportPreviewPanel experts={importedExperts} onConfirm={(count) => { setCurrentPanel(null); addStewardMessage(`${count} experts have been imported to the Expert Pool.`); }} />;
      case 'my_tasks':
        return <MyTasksPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <header className="h-16 flex items-center justify-between px-6 border-b border-white/5">
        <h1 className="text-xl font-semibold text-white">Ontology Optimizer</h1>
      </header>

      <div className="flex-1 flex">
        <div className={`flex flex-col transition-all duration-300 ${currentPanel ? 'w-[45%]' : 'w-full'}`}>
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={message.role === 'user' ? 'flex justify-end' : ''}
                >
                  <div className={message.role === 'user' ? 'max-w-2xl' : 'max-w-3xl'}>
                    {renderMessageContent(message)}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1 px-4 py-3">
                  <span className="w-2 h-2 bg-indigo rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-indigo rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-indigo rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-white/5">
            <div className="max-w-4xl mx-auto">
              <div className="relative bg-dark-50 rounded-2xl border border-white/10 focus-within:border-white/20 transition-colors">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type a question or command..."
                  rows={3}
                  className="w-full px-4 pt-4 pb-12 bg-transparent text-white placeholder-gray-600 focus:outline-none resize-none"
                />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <button className="p-2 text-gray-500 hover:text-gray-300 transition-colors">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="p-2 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {currentPanel && (
          <div className="w-[55%] border-l border-white/5 bg-dark-100 overflow-y-auto">
            <div className="p-6">
              {renderPanel()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
