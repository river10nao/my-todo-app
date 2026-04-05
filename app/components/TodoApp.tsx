'use client';

import { useState, useEffect } from 'react';
import { Todo, Priority, Category, FilterStatus } from '../types/todo';

const CATEGORIES: Category[] = ['仕事', '副業', 'プライベート', '学習', 'その他'];
const CATEGORY_ICONS: Record<Category, string> = {
  仕事: '💼', 副業: '💡', プライベート: '🏠', 学習: '📚', その他: '📌',
};
const PRIORITY_LABELS: Record<Priority, string> = {
  high: '高', medium: '中', low: '低',
};
const PRIORITY_COLORS: Record<Priority, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
};
const PRIORITY_BORDER: Record<Priority, string> = {
  high: 'border-l-red-400',
  medium: 'border-l-yellow-400',
  low: 'border-l-green-400',
};

function isOverdue(todo: Todo): boolean {
  if (!todo.due || todo.done) return false;
  return new Date(todo.due) < new Date(new Date().toDateString());
}

function formatDate(d: string): string {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  return `${y}/${m}/${day}`;
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('仕事');
  const [priority, setPriority] = useState<Priority>('medium');
  const [due, setDue] = useState('');
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [catFilter, setCatFilter] = useState<Category | 'all'>('all');

  useEffect(() => {
    const saved = localStorage.getItem('todos');
    if (saved) setTodos(JSON.parse(saved));
  }, []);

  function save(next: Todo[]) {
    setTodos(next);
    localStorage.setItem('todos', JSON.stringify(next));
  }

  function addTodo() {
    if (!title.trim()) return;
    save([
      { id: Date.now(), title: title.trim(), category, priority, due, done: false, createdAt: new Date().toISOString() },
      ...todos,
    ]);
    setTitle('');
    setDue('');
  }

  function toggleDone(id: number) {
    save(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }

  function deleteTodo(id: number) {
    save(todos.filter(t => t.id !== id));
  }

  const filtered = todos.filter(t => {
    if (catFilter !== 'all' && t.category !== catFilter) return false;
    if (filter === 'active') return !t.done;
    if (filter === 'done') return t.done;
    if (filter === 'overdue') return isOverdue(t);
    return true;
  });

  const active = filtered.filter(t => !t.done);
  const done = filtered.filter(t => t.done);

  const stats = {
    total: todos.length,
    active: todos.filter(t => !t.done).length,
    done: todos.filter(t => t.done).length,
    overdue: todos.filter(t => isOverdue(t)).length,
  };

  const filterButtons: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: 'すべて' },
    { key: 'active', label: '未完了' },
    { key: 'done', label: '完了' },
    { key: 'overdue', label: '期限切れ' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-8 tracking-tight">
          📝 Todoアプリ
        </h1>

        {/* 追加フォーム */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTodo()}
              placeholder="タスクを入力..."
              className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-500 outline-none focus:border-indigo-400 transition-colors"
            />
          </div>
          <div className="flex gap-2 mb-3 flex-wrap">
            <select
              value={category}
              onChange={e => setCategory(e.target.value as Category)}
              className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-400 bg-white cursor-pointer"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
              ))}
            </select>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as Priority)}
              className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-400 bg-white cursor-pointer"
            >
              <option value="high">🔴 優先度：高</option>
              <option value="medium">🟡 優先度：中</option>
              <option value="low">🟢 優先度：低</option>
            </select>
            <input
              type="date"
              value={due}
              onChange={e => setDue(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-400 bg-white cursor-pointer"
            />
          </div>
          <button
            onClick={addTodo}
            className="w-full bg-indigo-500 hover:bg-indigo-600 active:scale-[0.98] text-white font-bold py-2.5 rounded-xl text-sm transition-all"
          >
            ＋ タスクを追加
          </button>
        </div>

        {/* 統計 */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: '合計', value: stats.total },
            { label: '未完了', value: stats.active },
            { label: '完了', value: stats.done },
            { label: '期限切れ', value: stats.overdue },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl shadow-sm p-4 text-center">
              <div className="text-2xl font-extrabold text-indigo-500">{s.value}</div>
              <div className="text-xs text-gray-600 mt-1 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* フィルター */}
        <div className="flex gap-2 flex-wrap items-center mb-4">
          {filterButtons.map(b => (
            <button
              key={b.key}
              onClick={() => setFilter(b.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                filter === b.key
                  ? 'bg-indigo-500 text-white border-indigo-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
              }`}
            >
              {b.label}
            </button>
          ))}
          <select
            value={catFilter}
            onChange={e => setCatFilter(e.target.value as Category | 'all')}
            className="ml-auto border border-gray-300 rounded-full px-3 py-1.5 text-sm text-gray-800 bg-white outline-none cursor-pointer"
          >
            <option value="all">カテゴリ: すべて</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
            ))}
          </select>
        </div>

        {/* タスクリスト */}
        <div className="flex flex-col gap-3">
          {filtered.length === 0 && (
            <div className="text-center text-gray-500 py-16">
              <div className="text-5xl mb-3">✅</div>
              <div>タスクがありません</div>
            </div>
          )}

          {active.length > 0 && (
            <>
              {done.length > 0 && (
                <div className="text-xs font-bold text-gray-600 uppercase tracking-widest mt-2">未完了</div>
              )}
              {active.map(todo => <TaskItem key={todo.id} todo={todo} onToggle={toggleDone} onDelete={deleteTodo} />)}
            </>
          )}

          {done.length > 0 && (
            <>
              <div className="text-xs font-bold text-gray-600 uppercase tracking-widest mt-2">完了</div>
              {done.map(todo => <TaskItem key={todo.id} todo={todo} onToggle={toggleDone} onDelete={deleteTodo} />)}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function TaskItem({ todo, onToggle, onDelete }: {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const overdue = isOverdue(todo);

  return (
    <div className={`bg-white rounded-2xl shadow-sm p-4 flex items-start gap-4 border-l-4 ${PRIORITY_BORDER[todo.priority]} ${todo.done ? 'opacity-50' : ''} transition-opacity`}>
      {/* チェックボタン */}
      <button
        onClick={() => onToggle(todo.id)}
        className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
          todo.done
            ? 'bg-indigo-500 border-indigo-500 text-white'
            : 'border-gray-300 hover:border-indigo-400'
        }`}
      >
        {todo.done && <span className="text-xs font-bold">✓</span>}
      </button>

      {/* 本文 */}
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-semibold mb-1.5 break-words ${todo.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
          {todo.title}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
            {CATEGORY_ICONS[todo.category]} {todo.category}
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PRIORITY_COLORS[todo.priority]}`}>
            {PRIORITY_LABELS[todo.priority]}優先度
          </span>
          {todo.due && (
            <span className={`text-xs flex items-center gap-1 ${overdue ? 'text-red-500 font-semibold' : 'text-gray-600'}`}>
              📅 {formatDate(todo.due)}{overdue && ' (期限切れ)'}
            </span>
          )}
        </div>
      </div>

      {/* 削除ボタン */}
      <button
        onClick={() => onDelete(todo.id)}
        className="text-gray-400 hover:text-red-500 transition-colors text-lg leading-none flex-shrink-0 pt-0.5"
      >
        ✕
      </button>
    </div>
  );
}
