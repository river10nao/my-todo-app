export type Priority = 'high' | 'medium' | 'low';
export type Category = '仕事' | '副業' | 'プライベート' | '学習' | 'その他';
export type FilterStatus = 'all' | 'active' | 'done' | 'overdue';

export interface Todo {
  id: number;
  title: string;
  category: Category;
  priority: Priority;
  due: string;
  done: boolean;
  createdAt: string;
}
