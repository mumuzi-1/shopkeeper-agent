import { Bot, CheckCircle2, Copy, UserRound } from 'lucide-react';
import { useState } from 'react';
import { ResultTable } from './ResultTable';
import { StepRail } from './StepRail';
import { formatTime, toClipboardText } from '../lib/format';
import type { ChatMessage } from '../types/agent';
export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  const [expanded, setExpanded] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(message.result !== undefined ? toClipboardText(message.result) : message.content); } catch { /* clipboard may be unavailable */ } };
  if (isUser) return <article className="blue-user-row"><div className="blue-user-message">{message.content}<small>{formatTime(message.createdAt)}</small></div><div className="blue-user-avatar"><UserRound size={19}/></div></article>;
  return <article className="blue-assistant-row"><div className="blue-bot-avatar"><Bot size={21}/></div><div className="blue-answer-card"><div className="blue-answer-heading"><div className="blue-answer-title">{message.status === 'done' && message.result !== undefined && <CheckCircle2 size={18} className="blue-success-icon"/>}<strong>{message.content}</strong></div><div className="blue-answer-actions"><button type="button" onClick={copy} title="复制结果" aria-label="复制结果"><Copy size={17}/></button></div></div>{message.error && <div role="alert" className="blue-error">{message.error}</div>}{Boolean(message.steps?.length) && <div className="blue-flow-shell"><button type="button" className="blue-flow-toggle" aria-expanded={expanded} onClick={() => setExpanded(x => !x)}><span><SparkleMark/> 执行流程 <small>LangGraph · {message.steps?.filter(s => s.status === 'success').length}/{message.steps?.length} 步完成</small></span><span>{expanded ? '收起完整流程 −' : '展开完整流程 +'}</span></button><div className="blue-step-summary">{message.steps?.map(s => <span key={s.step} className={`blue-step-chip ${s.status}`}><span>{s.status === 'success' ? '✓' : s.status === 'error' ? '!' : s.status === 'running' ? '◌' : '·'}</span>{s.step}</span>)}</div>{expanded && <StepRail steps={message.steps}/>}</div>}{message.result !== undefined && <ResultTable data={message.result}/>}<div className="blue-message-time">{formatTime(message.createdAt)}</div></div></article>;
}
function SparkleMark() { return <span className="blue-flow-symbol">✦</span>; }
