import { Activity, BarChart3, CircleHelp, Eraser, MessageSquarePlus, Server, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Composer } from './components/Composer';
import { EmptyState } from './components/EmptyState';
import { MessageBubble } from './components/MessageBubble';
import { streamQuery } from './lib/agentApi';
import { summarizeResult } from './lib/format';
import type { AgentEvent, ChatMessage, StepState } from './types/agent';

const examples = [
  '查询华东地区 2025 年第一季度销售额最高的前 5 个商品',
  '统计 2025 年第一季度各大区的 GMV，并按 GMV 从高到低排序',
  '统计 2025 年 3 月各商品品类的销量和销售额',
  '按会员等级统计 2025 年第一季度的订单数和销售额',
];
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'Vite /api proxy';
const makeId = () => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
function upsertStep(steps: StepState[] = [], event: Extract<AgentEvent, { type: 'progress' }>): StepState[] {
  return [...steps.filter((item) => item.step !== event.step), { step: event.step, status: event.status, updatedAt: Date.now() }];
}
export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [activeController, setActiveController] = useState<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isStreaming = activeController !== null;
  const completedCount = useMemo(() => messages.filter(m => m.role === 'assistant' && m.result !== undefined).length, [messages]);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [messages]);
  const startQuery = async (rawQuery = draft) => {
    const query = rawQuery.trim();
    if (!query || activeController) return;
    const userMessage: ChatMessage = { id: makeId(), role: 'user', content: query, createdAt: Date.now() };
    const assistantId = makeId();
    const assistantMessage: ChatMessage = { id: assistantId, role: 'assistant', content: '正在连接问数智能体...', createdAt: Date.now(), status: 'streaming', steps: [] };
    const controller = new AbortController();
    setActiveController(controller); setDraft('');
    setMessages(current => [...current, userMessage, assistantMessage]);
    const onEvent = (event: AgentEvent) => {
      setMessages(current => current.map(message => {
        if (message.id !== assistantId) return message;
        if (event.type === 'progress') return { ...message, content: event.status === 'running' ? `正在执行：${event.step}` : message.content, steps: upsertStep(message.steps, event) };
        if (event.type === 'result') return { ...message, status: 'done', content: summarizeResult(event.data), result: event.data };
        return { ...message, status: 'error', content: '这次查询没有成功。', error: event.message };
      }));
    };
    try {
      await streamQuery(query, { signal: controller.signal, onEvent });
      setMessages(current => current.map(m => m.id === assistantId && m.status === 'streaming' ? { ...m, status: 'done', content: '流程已结束，后端未返回查询结果。' } : m));
    } catch (error) {
      const aborted = error instanceof DOMException && error.name === 'AbortError';
      setMessages(current => current.map(m => m.id !== assistantId ? m : { ...m, status: aborted ? 'done' : 'error', content: aborted ? '已停止本次查询。' : '无法连接问数接口。', error: aborted ? undefined : error instanceof Error ? error.message : String(error) }));
    } finally { setActiveController(null); }
  };
  const clearConversation = () => { if (!isStreaming) { setMessages([]); setDraft(''); } };
  return (
    <div className="blue-app">
      <aside className="blue-sidebar">
        <div className="blue-brand"><div className="blue-brand-icon"><BarChart3 size={24} /></div><div><strong>电商问数</strong><small>shopkeeper-agent</small></div></div>
        <div className="blue-side-body">
          <button className="blue-new-chat" type="button" disabled={isStreaming} onClick={clearConversation}><MessageSquarePlus size={18}/> 新会话</button>
          <div className="blue-side-label"><Sparkles size={15}/> 示例问题</div>
          <div className="blue-examples">{examples.map((example, index) => <button type="button" className={`blue-example ${index === 0 ? 'blue-example-first' : ''}`} key={example} disabled={isStreaming} onClick={() => startQuery(example)}>{example}</button>)}</div>
        </div>
        <div className="blue-sidebar-foot"><div><Server size={16}/> API 接入 <span>{API_BASE_URL}</span></div><a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer"><CircleHelp size={16}/> 接口文档</a><div><Activity size={16}/> 已完成查询 <span>{completedCount}</span></div></div>
      </aside>
      <main className="blue-main">
        <header className="blue-header"><div><h1>智能数据分析 Agent <span className="blue-beta">Beta</span></h1><p>基于 FastAPI + SSE · LangGraph 构建的电商数据分析助手</p></div><button className="blue-clear" title="清空会话" aria-label="清空会话" disabled={!messages.length || isStreaming} onClick={clearConversation}><Eraser size={18}/></button></header>
        <div className="blue-conversation" ref={scrollRef}>{messages.length === 0 ? <EmptyState examples={examples} onUseExample={setDraft}/> : <div className="blue-message-list">{messages.map(m => <MessageBubble key={m.id} message={m}/>)}</div>}</div>
        <div className="blue-status"><span className={isStreaming ? 'blue-dot busy' : 'blue-dot'}/>{isStreaming ? 'Agent 正在处理请求' : '服务就绪'} <span>· 已完成 {completedCount} 次查询</span></div>
        <Composer value={draft} disabled={!draft.trim() || isStreaming} isStreaming={isStreaming} onChange={setDraft} onSubmit={() => startQuery()} onStop={() => activeController?.abort()}/>
      </main>
    </div>
  );
}
