import { ArrowUp, Square, Sparkles } from 'lucide-react';
import { useRef } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
type Props = { value: string; disabled: boolean; isStreaming: boolean; onChange: (value: string) => void; onSubmit: () => void; onStop: () => void };
export function Composer({ value, disabled, isStreaming, onChange, onSubmit, onStop }: Props) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const submit = (e: FormEvent) => { e.preventDefault(); if (!disabled) onSubmit(); };
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); if (!disabled) onSubmit(); } };
  return <form className="blue-composer-wrap" onSubmit={submit}><div className="blue-composer"><div className="blue-composer-spark"><Sparkles size={20}/></div><textarea ref={ref} rows={1} aria-label="输入电商数据问题" placeholder="问一个电商数据问题..." value={value} onChange={e => onChange(e.target.value)} onKeyDown={onKeyDown}/><button type={isStreaming ? 'button' : 'submit'} className="blue-send" disabled={!isStreaming && disabled} onClick={isStreaming ? onStop : undefined} title={isStreaming ? '停止本次请求' : '发送问题'} aria-label={isStreaming ? '停止本次请求' : '发送问题'}>{isStreaming ? <Square size={17} fill="currentColor"/> : <ArrowUp size={21}/>}</button></div><div className="blue-composer-hint">Enter 发送 · Shift + Enter 换行 · 查询由本地 Agent 处理</div></form>;
}
