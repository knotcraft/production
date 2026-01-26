
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

    