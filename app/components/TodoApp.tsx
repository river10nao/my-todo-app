'use client';

import { useState, useEffect } from 'react';
import { Todo, Priority, Category, FilterStatus } from '../types/todo';

const CATEGORIES: Category[] = ['仕事', '副業', 'プライベート', '学習', 'その他'];

const CATEGORY_ICONS: Record<Category, string> = {
  仕事: '💼', 副業: '💡', プライベート: '🏠', 学習: '📚', その他: '📌',
};

const CATEGORY_COLORS: Record<Category, string> = {
  仕事:       'bg-blue-100 text-blue-700',
  副業:       'bg-yellow-100 text-yellow-700',
  プライベート: 'bg-pink-100 text-pink-700',
  学習:       'bg-green-100 text-green-700',
  その他:     'bg-purple-100 text-purple-700',
};

const PRIORITY_LABELS: Record<Priority, string> = {
  high: '高', medium: '中', low: '低',
};

const PRIORITY_COLORS: Record<Priority, string> = {
  high:   'bg-red-100 text-red-600',
  medium: 'bg-orange-100 text-orange-600',
  low:    'bg-teal-100 text-teal-600',
};

const PRIORITY_BORDER: Record<Priority, string> = {
  high:   'border-l-red-400',
  medium: 'border-l-orange-400',
  low:    'border-l-teal-400',
};

const PRIORITY_DOT: Record<Priority, string> = {
  high:   'bg-red-400',
  medium: 'bg-orange-400',
  low:    'bg-teal-400',
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
  const done   = filtered.filter(t => t.done);

  const stats = [
    { label: '合計',    value: todos.length,                          emoji: '📋', color: 'from-violet-400 to-purple-500' },
    { label: '未完了',  value: todos.filter(t => !t.done).length,     emoji: '🔥', color: 'from-orange-400 to-pink-500'   },
    { label: '完了',    value: todos.filter(t => t.done).length,      emoji: '✅', color: 'from-green-400 to-teal-500'    },
    { label: '期限切れ', value: todos.filter(t => isOverdue(t)).length, emoji: '⚠️', color: 'from-red-400 to-rose-500'     },
  ];

  const filterButtons: { key: FilterStatus; label: string; emoji: string }[] = [
    { key: 'all',     label: 'すべて',   emoji: '🗂️' },
    { key: 'active',  label: '未完了',   emoji: '🔥' },
    { key: 'done',    label: '完了',     emoji: '✅' },
    { key: 'overdue', label: '期限切れ', emoji: '⚠️' },
  ];

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(135deg, #fdf6ff 0%, #fef9ee 50%, #f0fffe 100%)' }}>
      <div className="max-w-2xl mx-auto">

        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">🌈</div>
          <h1 className="text-4xl font-extrabold tracking-tight" style={{ background: 'linear-gradient(90deg, #f472b6, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            My Todo App
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">タスクを管理してハッピーに！🎉</p>
        </div>

        {/* 追加フォーム */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6 border border-pink-100">
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTodo()}
              placeholder="✏️ 新しいタスクを入力..."
              className="flex-1 border-2 border-purple-200 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-purple-400 transition-colors font-medium"
            />
          </div>
          <div className="flex gap-2 mb-4 flex-wrap">
            <select
              value={category}
              onChange={e => setCategory(e.target.value as Category)}
              className="border-2 border-blue-200 rounded-2xl px-3 py-2.5 text-sm text-gray-800 font-medium outline-none focus:border-blue-400 bg-white cursor-pointer"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
              ))}
            </select>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as Priority)}
              className="border-2 border-orange-200 rounded-2xl px-3 py-2.5 text-sm text-gray-800 font-medium outline-none focus:border-orange-400 bg-white cursor-pointer"
            >
              <option value="high">🔴 優先度：高</option>
              <option value="medium">🟠 優先度：中</option>
              <option value="low">🟢 優先度：低</option>
            </select>
            <input
              type="date"
              value={due}
              onChange={e => setDue(e.target.value)}
              className="border-2 border-teal-200 rounded-2xl px-3 py-2.5 text-sm text-gray-800 font-medium outline-none focus:border-teal-400 bg-white cursor-pointer"
            />
          </div>
          <button
            onClick={addTodo}
            className="w-full text-white font-bold py-3 rounded-2xl text-sm transition-all active:scale-[0.98] shadow-md hover:shadow-lg"
            style={{ background: 'linear-gradient(90deg, #f472b6, #a78bfa, #60a5fa)' }}
          >
            ＋ タスクを追加する
          </button>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {stats.map(s => (
            <div key={s.label} className={`rounded-2xl p-4 text-center text-white bg-gradient-to-br ${s.color} shadow-md`}>
              <div className="text-xl mb-1">{s.emoji}</div>
              <div className="text-2xl font-extrabold">{s.value}</div>
              <div className="text-xs font-semibold opacity-90 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* フィルター */}
        <div className="flex gap-2 flex-wrap items-center mb-5">
          {filterButtons.map(b => (
            <button
              key={b.key}
              onClick={() => setFilter(b.key)}
              className={`px-4 py-2 rounded-2xl text-sm font-bold border-2 transition-all ${
                filter === b.key
                  ? 'text-white border-transparent shadow-md'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
              }`}
              style={filter === b.key ? { background: 'linear-gradient(90deg, #f472b6, #a78bfa)' } : {}}
            >
              {b.emoji} {b.label}
            </button>
          ))}
          <select
            value={catFilter}
            onChange={e => setCatFilter(e.target.value as Category | 'all')}
            className="ml-auto border-2 border-purple-200 rounded-2xl px-3 py-2 text-sm text-gray-800 font-medium bg-white outline-none cursor-pointer"
          >
            <option value="all">🗂️ カテゴリ: すべて</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
            ))}
          </select>
        </div>

        {/* タスクリスト */}
        <div className="flex flex-col gap-3">
          {filtered.length === 0 && (
            <div className="text-center text-gray-400 py-16 bg-white rounded-3xl border-2 border-dashed border-purple-200">
              <div className="text-5xl mb-3">🎊</div>
              <div className="font-bold text-gray-500">タスクがありません！</div>
              <div className="text-sm text-gray-400 mt-1">新しいタスクを追加しよう</div>
            </div>
          )}

          {active.length > 0 && (
            <>
              {done.length > 0 && (
                <div className="text-xs font-extrabold text-purple-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                  <span>🔥 未完了</span>
                </div>
              )}
              {active.map(todo => <TaskItem key={todo.id} todo={todo} onToggle={toggleDone} onDelete={deleteTodo} />)}
            </>
          )}

          {done.length > 0 && (
            <>
              <div className="text-xs font-extrabold text-teal-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                <span>✅ 完了</span>
              </div>
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
    <div className={`bg-white rounded-2xl shadow-sm p-4 flex items-start gap-4 border-l-4 ${PRIORITY_BORDER[todo.priority]} ${todo.done ? 'opacity-50' : ''} transition-all hover:shadow-md border border-gray-100`}>
      {/* チェックボタン */}
      <button
        onClick={() => onToggle(todo.id)}
        className={`w-7 h-7 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
          todo.done
            ? 'border-transparent text-white'
            : 'border-gray-300 hover:border-purple-400 bg-white'
        }`}
        style={todo.done ? { background: 'linear-gradient(135deg, #f472b6, #a78bfa)' } : {}}
      >
        {todo.done && <span className="text-sm font-bold">✓</span>}
      </button>

      {/* 本文 */}
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-bold mb-2 break-words ${todo.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
          {todo.title}
        </div>
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[todo.category]}`}>
            {CATEGORY_ICONS[todo.category]} {todo.category}
          </span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${PRIORITY_COLORS[todo.priority]}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[todo.priority]}`}></span>
            {PRIORITY_LABELS[todo.priority]}優先度
          </span>
          {todo.due && (
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${overdue ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
              📅 {formatDate(todo.due)}{overdue && ' 期限切れ'}
            </span>
          )}
        </div>
      </div>

      {/* 削除ボタン */}
      <button
        onClick={() => onDelete(todo.id)}
        className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none flex-shrink-0 pt-0.5 hover:scale-110"
      >
        ✕
      </button>
    </div>
  );
}
