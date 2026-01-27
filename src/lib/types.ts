
export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
}

export interface CategoryInDB {
  name: string;
  allocated: number;
  icon: string; // material-symbols-outlined icon name
  color: string;
  expenses?: Record<string, Omit<Expense, 'id'>>;
}

export interface Category extends CategoryInDB {
  id: string;
  spent: number; // This will be calculated on the client
}

export interface BudgetData {
  total?: number;
  categories?: Record<string, CategoryInDB>;
}

export interface Guest {
  id: string;
  name: string;
  side: 'bride' | 'groom' | 'both';
  status: 'pending' | 'confirmed';
  group?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  diet?: 'none' | 'veg' | 'non-veg';
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  notes?: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
}
