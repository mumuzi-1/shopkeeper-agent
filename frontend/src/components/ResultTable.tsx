import { BarChart3, Copy, Download, Table2 } from 'lucide-react';
import { useMemo, useState } from 'react';
function normalizeRows(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data.map((item, i) => item && typeof item === 'object' && !Array.isArray(item) ? item as Record<string, unknown> : { 序号: i + 1, 值: item });
  if (data && typeof data === 'object') return [data as Record<string, unknown>];
  return [{ 值: data ?? '' }];
}
const formatCell = (v: unknown) => v == null ? '-' : typeof v === 'object' ? JSON.stringify(v) : typeof v === 'number' ? v.toLocaleString('zh-CN', { maximumFractionDigits: 4 }) : String(v);
const escapeCSV = (value: unknown) => `"${(value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value)).replace(/"/g, '""')}"`;
export function ResultTable({ data }: { data: unknown }) {
  const [view, setView] = useState<'all' | 'table' | 'chart'>('all');
  const rows = useMemo(() => normalizeRows(data), [data]);
  const columns = useMemo(() => Array.from(new Set(rows.flatMap(row => Object.keys(row)))), [rows]);
  const numericColumns = columns.filter(key => rows.some(row => typeof row[key] === 'number' && Number.isFinite(row[key])));
  const [metric, setMetric] = useState<string>('');
  const numericKey = numericColumns.includes(metric) ? metric : numericColumns[0];
  const labelKey = columns.find(key => key !== numericKey && rows.some(row => typeof row[key] === 'string')) ?? columns.find(key => key !== numericKey);
  const chartRows = numericKey ? rows.map((row, i) => ({ label: labelKey ? formatCell(row[labelKey]) : `第 ${i + 1} 行`, value: typeof row[numericKey] === 'number' ? row[numericKey] as number : Number(row[numericKey]) })).filter(r => Number.isFinite(r.value)).slice(0, 12) : [];
  const maxValue = Math.max(0, ...chartRows.map(row => Math.abs(row.value)));
  const copy = async () => { try { await navigator.clipboard.writeText([columns.join('\t'), ...rows.map(row => columns.map(key => formatCell(row[key])).join('\t'))].join('\n')); } catch { /* unavailable */ } };
  const exportCSV = () => { const content = '\uFEFF' + [columns.map(escapeCSV).join(','), ...rows.map(row => columns.map(key => escapeCSV(row[key])).join(','))].join('\r\n'); const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8;' })); const a = document.createElement('a'); a.href = url; a.download = 'shopkeeper-query-result.csv'; a.click(); URL.revokeObjectURL(url); };
  if (!columns.length) return null;
  return <section className="blue-results"><div className="blue-results-head"><div><BarChart3 size={18}/><strong>查询结果</strong><span>{rows.length} 行 · {columns.length} 列</span></div><div className="blue-results-actions"><button title="复制表格" onClick={copy}><Copy size={15}/> <span>复制</span></button><button title="导出 CSV" onClick={exportCSV}><Download size={15}/> <span>导出</span></button></div></div><div className="blue-view-switch"><button className={view === 'all' ? 'active' : ''} onClick={() => setView('all')}>综合</button><button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')}><Table2 size={14}/> 表格</button>{numericColumns.length > 0 && <button className={view === 'chart' ? 'active' : ''} onClick={() => setView('chart')}><BarChart3 size={14}/> 图表</button>}</div><div className={`blue-result-grid ${view !== 'all' || !numericColumns.length ? 'single' : ''}`}>{view !== 'chart' && <div className="blue-table-panel"><div className="blue-data-scroll"><table><thead><tr>{columns.map(k => <th key={k}>{k}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i}>{columns.map(k => <td key={k} title={formatCell(row[k])}>{formatCell(row[k])}</td>)}</tr>)}</tbody></table></div></div>}{view !== 'table' && numericColumns.length > 0 && <div className="blue-chart-panel"><div className="blue-chart-head"><strong>数据对比</strong><select aria-label="选择图表指标" value={numericKey} onChange={e => setMetric(e.target.value)}>{numericColumns.map(k => <option key={k} value={k}>{k}</option>)}</select></div><div className="blue-chart-scroll">{chartRows.map((row, i) => <div className="blue-chart-row" key={i}><span title={row.label}>{row.label}</span><div className="blue-chart-track"><div className="blue-chart-bar" style={{ width: `${maxValue === 0 ? 0 : Math.abs(row.value) / maxValue * 100}%` }}/></div><strong>{formatCell(row.value)}</strong></div>)}</div><div className="blue-chart-note">图表根据真实查询结果自动生成，负数按绝对值显示长度。</div></div>}</div></section>;
}
