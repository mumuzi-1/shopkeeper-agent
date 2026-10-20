import { BarChart3, Database, Search, Sparkles } from 'lucide-react';
type Props = { examples: string[]; onUseExample: (example: string) => void };
export function EmptyState({ examples, onUseExample }: Props) {
  return <div className="blue-empty"><div className="blue-empty-icon"><Sparkles size={28}/></div><div className="blue-empty-eyebrow">AI 数据分析助手</div><h2>让数据分析，从提问开始</h2><p>用自然语言探索电商数仓，Agent 自动检索元数据、生成并校验 SQL，返回真实查询结果。</p><div className="blue-feature-row"><span><Database size={16}/> 元数据检索</span><span><Search size={16}/> 智能问数</span><span><BarChart3 size={16}/> 结果可视化</span></div><div className="blue-empty-label">试试这些问题</div><div className="blue-empty-suggestions">{examples.map(example => <button type="button" key={example} onClick={() => onUseExample(example)}>{example}<span>↗</span></button>)}</div></div>;
}
