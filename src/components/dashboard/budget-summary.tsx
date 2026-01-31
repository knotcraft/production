
'use client';
import { useFirebase, useUser } from '@/firebase';
import { ref, onValue } from 'firebase/database';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Wallet, Pencil } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type BudgetData = {
    total: number;
    spent: number;
};

function BudgetSummarySkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 p-6 shadow-lg h-[190px]">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-slate-200/50 dark:bg-slate-700/50" />
      <div className="absolute -left-12 -bottom-12 h-32 w-32 rounded-full bg-slate-200/50 dark:bg-slate-700/50" />
      <div className="relative z-10 animate-pulse">
        <Skeleton className="h-4 w-32 mb-4 bg-slate-300 dark:bg-slate-700" />
        <Skeleton className="h-10 w-48 mb-8 bg-slate-300 dark:bg-slate-700" />
        <Skeleton className="h-2 w-full mb-3 rounded-full bg-slate-300 dark:bg-slate-700" />
        <div className="flex justify-between">
          <Skeleton className="h-3 w-24 bg-slate-300 dark:bg-slate-700" />
          <Skeleton className="h-3 w-28 bg-slate-300 dark:bg-slate-700" />
        </div>
      </div>
    </div>
  );
}

export function BudgetSummary() {
  const { user } = useUser();
  const { database } = useFirebase();
  const [budget, setBudget] = useState<BudgetData>({ total: 0, spent: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && database) {
      setLoading(true);
      const budgetRef = ref(database, 'users/' + user.uid + '/budget');
      const unsubscribe = onValue(budgetRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          let totalBudget = 0;
          let totalSpent = 0;
          if (data.categories) {
            totalBudget = Object.values(data.categories).reduce((sum: number, cat: any) => sum + (cat.allocated || 0), 0);
            totalSpent = Object.values(data.categories).reduce((sum: number, cat: any) => {
                const categorySpent = cat.expenses 
                  ? Object.values(cat.expenses).reduce((expenseSum: number, expense: any) => expenseSum + (expense.amount || 0), 0)
                  : 0;
                return sum + categorySpent;
            }, 0);
          }
          setBudget({ total: totalBudget, spent: totalSpent });
        } else {
            setBudget({ total: 0, spent: 0 });
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else if (!user) {
        setLoading(false);
    }
  }, [user, database]);
  
  if (loading) {
    return <BudgetSummarySkeleton />;
  }

  const { spent, total } = budget;
  const remainingBudget = total - spent;
  const budgetPercentage = total > 0 ? (spent / total) * 100 : 0;
  const isOverBudget = budgetPercentage > 100;

  if (total <= 0) {
    return (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-card p-6 shadow-none dark:bg-card/50 text-center">
            <div className="flex justify-center mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                    <Wallet className="h-6 w-6 text-slate-500" />
                </div>
            </div>
            <h3 className="text-lg font-bold mb-1">Set Your Budget</h3>
            <p className="text-sm text-muted-foreground mb-4">Start tracking your wedding expenses.</p>
            <Link href="/budget" passHref>
                <Button>Get Started</Button>
            </Link>
        </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-pink-500 to-rose-500 p-6 text-white shadow-lg dark:from-primary/80 dark:via-pink-500/80 dark:to-rose-500/80">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -left-12 -bottom-12 h-32 w-32 rounded-full bg-white/10" />

        <div className="relative z-10">
            <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium uppercase tracking-widest text-white/80">Total Spent</p>
                <Link href="/budget" passHref>
                    <Button variant="ghost" size="icon" className="-mr-2 rounded-full text-white/80 hover:bg-white/20 hover:text-white">
                        <Pencil className="h-5 w-5" />
                    </Button>
                </Link>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight">
                ₹{spent.toLocaleString('en-IN')}
            </h1>

            <div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/30">
                    <div
                    className="h-full rounded-full bg-white transition-all duration-500"
                    style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                    />
                </div>
                <div className="mt-2 flex justify-between text-xs font-semibold text-white/90">
                    <span>Remaining: ₹{remainingBudget.toLocaleString('en-IN')}</span>
                    <span>Total: ₹{total.toLocaleString('en-IN')}</span>
                </div>
                {isOverBudget && (
                    <p className="mt-2 text-right text-xs font-bold text-yellow-300">
                    You've gone over budget by ₹{(spent - total).toLocaleString('en-IN')}!
                    </p>
                )}
            </div>
        </div>
    </div>
  );
}
