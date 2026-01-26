
'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser, useDatabase } from '@/firebase';
import { ref, onValue, set, push, remove, update } from 'firebase/database';
import { toast } from '@/hooks/use-toast';
import type { BudgetData, Category, Expense } from '@/lib/types';
import { Loader2, MoreVertical, Pencil, Plus, Trash2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

const categoryStyles = [
    { color: 'primary', icon: 'home_work', bg: 'bg-primary/10', text: 'text-primary' },
    { color: 'orange-500', icon: 'restaurant', bg: 'bg-orange-100 dark:bg-orange-900/50', text: 'text-orange-600 dark:text-orange-400' },
    { color: 'indigo-500', icon: 'photo_camera', bg: 'bg-indigo-100 dark:bg-indigo-900/50', text: 'text-indigo-600 dark:text-indigo-400' },
    { color: 'pink-500', icon: 'local_florist', bg: 'bg-pink-100 dark:bg-pink-900/50', text: 'text-pink-600 dark:text-pink-400' },
    { color: 'emerald-500', icon: 'music_note', bg: 'bg-emerald-100 dark:bg-emerald-900/50', text: 'text-emerald-600 dark:text-emerald-400' },
    { color: 'sky-500', icon: 'card_giftcard', bg: 'bg-sky-100 dark:bg-sky-900/50', text: 'text-sky-600 dark:text-sky-400' },
];

export default function BudgetPage() {
  const { user } = useUser();
  const database = useDatabase();
  const [loading, setLoading] = useState(true);
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);

  // Dialog states
  const [isEditTotalBudgetOpen, setIsEditTotalBudgetOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // State for active item
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activeExpense, setActiveExpense] = useState<Expense | null>(null);

  // Form states
  const [totalBudgetInput, setTotalBudgetInput] = useState('');
  const [categoryNameInput, setCategoryNameInput] = useState('');
  const [categoryAllocatedInput, setCategoryAllocatedInput] = useState('');
  const [categoryStyleIndex, setCategoryStyleIndex] = useState(0);

  const [expenseDescriptionInput, setExpenseDescriptionInput] = useState('');
  const [expenseAmountInput, setExpenseAmountInput] = useState('');
  const [expenseDateInput, setExpenseDateInput] = useState(new Date().toISOString().split('T')[0]);
  
  // Accordion State
  const [openAccordion, setOpenAccordion] = useState<string | undefined>();

  useEffect(() => {
    if (user && database) {
      const budgetRef = ref(database, `users/${user.uid}/budget`);
      const unsubscribe = onValue(budgetRef, (snapshot) => {
        const data = snapshot.val();
        setBudgetData(data);
        setTotalBudgetInput(data?.total?.toString() || '');
        setLoading(false);
      });

      return () => unsubscribe();
    } else if (!user) {
      setLoading(false);
    }
  }, [user, database]);

  const { totalSpent, remainingBudget, categories } = useMemo(() => {
    if (!budgetData || !budgetData.categories) {
        return { totalSpent: 0, remainingBudget: budgetData?.total || 0, categories: [] };
    }
    
    const cats = Object.entries(budgetData.categories).map(([id, cat]) => {
        const expensesList = cat.expenses ? Object.values(cat.expenses) : [];
        const spent = expensesList.reduce((sum, expense) => sum + expense.amount, 0);
        return { id, ...cat, spent, expenses: cat.expenses || {} };
    });
    
    const totalSpent = cats.reduce((sum, cat) => sum + (cat.spent || 0), 0);
    const remainingBudget = (budgetData?.total || 0) - totalSpent;
    return { totalSpent, remainingBudget, categories: cats };
  }, [budgetData]);

  const handleSetTotalBudget = async () => {
    if (!user || !database) return;
    const newTotal = parseFloat(totalBudgetInput);
    if (isNaN(newTotal) || newTotal < 0) {
      toast({ variant: 'destructive', title: 'Invalid amount', description: 'Please enter a valid budget amount.' });
      return;
    }
    try {
      await set(ref(database, `users/${user.uid}/budget/total`), newTotal);
      toast({ title: 'Success', description: 'Total budget updated.' });
      setIsEditTotalBudgetOpen(false);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update total budget.' });
    }
  };

  const openCategoryDialog = (category: Category | null) => {
    setActiveCategory(category);
    setCategoryNameInput(category?.name || '');
    setCategoryAllocatedInput(category?.allocated?.toString() || '');
    const styleIndex = category ? categoryStyles.findIndex(s => s.icon === category.icon) : 0;
    setCategoryStyleIndex(styleIndex > -1 ? styleIndex : 0);
    setIsCategoryDialogOpen(true);
  };
  
  const handleSaveCategory = async () => {
    if (!user || !database) return;
    const name = categoryNameInput.trim();
    const allocated = parseFloat(categoryAllocatedInput);
    
    if (!name || isNaN(allocated) || allocated < 0) {
      toast({ variant: 'destructive', title: 'Invalid input', description: 'Please fill out all fields correctly.' });
      return;
    }

    const categoryStyle = categoryStyles[categoryStyleIndex];
    const categoryData = {
        name,
        allocated,
        icon: categoryStyle.icon,
        color: categoryStyle.color,
    };

    try {
      if (activeCategory) { // Editing existing category
        const categoryRef = ref(database, `users/${user.uid}/budget/categories/${activeCategory.id}`);
        await update(categoryRef, categoryData);
        toast({ title: 'Success', description: 'Category updated.' });
      } else { // Adding new category
        const categoriesRef = ref(database, `users/${user.uid}/budget/categories`);
        const newCategoryRef = push(categoriesRef);
        await set(newCategoryRef, categoryData);
        toast({ title: 'Success', description: 'Category added.' });
      }
      setIsCategoryDialogOpen(false);
      setActiveCategory(null);
    } catch(e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not save category.' });
    }
  };

  const openDeleteDialog = (category: Category) => {
    setActiveCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (!user || !database || !activeCategory) return;
    try {
      await remove(ref(database, `users/${user.uid}/budget/categories/${activeCategory.id}`));
      toast({ title: 'Success', description: 'Category deleted.' });
      setIsDeleteDialogOpen(false);
      setActiveCategory(null);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not delete category.' });
    }
  };

  const openExpenseDialog = (category: Category, expense: Expense | null) => {
    setActiveCategory(category);
    setActiveExpense(expense);
    setExpenseDescriptionInput(expense?.description || '');
    setExpenseAmountInput(expense?.amount?.toString() || '');
    setExpenseDateInput(expense?.date || new Date().toISOString().split('T')[0]);
    setIsExpenseDialogOpen(true);
  }

  const handleSaveExpense = async () => {
    if (!user || !database || !activeCategory) return;
    const amount = parseFloat(expenseAmountInput);
    const description = expenseDescriptionInput.trim();
    const date = expenseDateInput;
    if (isNaN(amount) || amount <= 0 || !description || !date) {
      toast({ variant: 'destructive', title: 'Invalid input', description: 'Please check your expense details.' });
      return;
    }

    const expenseData = { description, amount, date };
    
    try {
      if (activeExpense) { // Editing
        const expenseRef = ref(database, `users/${user.uid}/budget/categories/${activeCategory.id}/expenses/${activeExpense.id}`);
        await update(expenseRef, expenseData);
        toast({ title: 'Success', description: 'Expense updated.' });
      } else { // Adding
        const expensesRef = ref(database, `users/${user.uid}/budget/categories/${activeCategory.id}/expenses`);
        const newExpenseRef = push(expensesRef);
        await set(newExpenseRef, expenseData);
        toast({ title: 'Success', description: 'Expense added.' });
      }

      setIsExpenseDialogOpen(false);
      setActiveCategory(null);
      setActiveExpense(null);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not save expense.' });
    }
  };

  const handleDeleteExpense = async (categoryId: string, expenseId: string) => {
    if (!user || !database) return;
    try {
      await remove(ref(database, `users/${user.uid}/budget/categories/${categoryId}/expenses/${expenseId}`));
      toast({ title: 'Success', description: 'Expense deleted.' });
    } catch(e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not delete expense.' });
    }
  }

  const getCategoryStyle = (icon: string) => {
    const style = categoryStyles.find(s => s.icon === icon);
    return style || categoryStyles[0];
  }

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  const budgetPercentage = budgetData?.total ? (totalSpent / budgetData.total) * 100 : 0;

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen text-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center p-4 justify-between">
          <Link href="/" className="text-slate-900 dark:text-white flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors">
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </Link>
          <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center">Budget Tracker</h2>
          <div className="flex size-10 items-center justify-end">
             <Dialog open={isEditTotalBudgetOpen} onOpenChange={setIsEditTotalBudgetOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-900 dark:text-white">
                  <Pencil className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{budgetData?.total ? 'Edit' : 'Set'} Total Budget</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="total-budget" className="text-right">Amount</Label>
                    <Input id="total-budget" type="number" value={totalBudgetInput} onChange={(e) => setTotalBudgetInput(e.target.value)} className="col-span-3" placeholder="e.g., 500000" />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSetTotalBudget}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="pb-24">
        <div className="p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total Budget</p>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">₹{budgetData?.total?.toLocaleString('en-IN') || '0'}</h1>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 border-r border-slate-100 dark:border-slate-800">
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Total Spent</p>
                <p className="text-primary text-xl font-bold">₹{totalSpent.toLocaleString('en-IN')}</p>
                { budgetData?.total && budgetData.total > 0 &&
                  <p className="text-emerald-500 text-xs font-medium flex items-center">
                    <span className="material-symbols-outlined text-xs mr-1">trending_up</span>
                    {Math.round(budgetPercentage)}% of total
                  </p>
                }
              </div>
              <div className="flex flex-col gap-1 pl-2">
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Remaining</p>
                <p className="text-slate-900 dark:text-white text-xl font-bold">₹{remainingBudget.toLocaleString('en-IN')}</p>
                 <p className="text-slate-400 text-xs font-medium italic">
                   {budgetPercentage > 100 ? 'Over budget' : 'Within limits'}
                 </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 flex items-center justify-between">
          <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">Spending by Category</h3>
        </div>

        <div className="flex flex-col gap-2 p-4">
          {categories.length === 0 ? (
            <div className="text-center p-10 text-slate-500 dark:text-slate-400">
              <p>You haven't added any budget categories yet.</p>
              <p>Click the '+' button to get started.</p>
            </div>
          ) : (
             <Accordion type="single" collapsible className="w-full space-y-2" value={openAccordion} onValueChange={setOpenAccordion}>
              {categories.map((cat) => {
                const progress = cat.allocated > 0 ? (cat.spent / cat.allocated) * 100 : 0;
                const style = getCategoryStyle(cat.icon);
                const expensesArray = cat.expenses ? Object.entries(cat.expenses).map(([id, ex]) => ({ id, ...ex })) : [];

                return (
                  <AccordionItem value={cat.id} key={cat.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden data-[state=open]:border-primary/30 data-[state=open]:dark:border-primary/50 data-[state=open]:ring-1 data-[state=open]:ring-primary/10">
                    <AccordionTrigger className="p-4 hover:no-underline">
                      <div className="flex flex-col gap-3 w-full">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", style.bg, style.text)}>
                              <span className="material-symbols-outlined">{cat.icon}</span>
                            </div>
                            <div>
                              <p className="text-slate-900 dark:text-white text-base font-bold text-left">{cat.name}</p>
                              <p className="text-slate-500 dark:text-slate-400 text-xs text-left">₹{cat.spent.toLocaleString('en-IN')} of ₹{cat.allocated.toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                          <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 text-slate-400 group-data-[state=open]:text-primary" />
                        </div>
                         <div className="flex flex-col gap-1.5">
                            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: progress > 100 ? '#ef4444' : `hsl(var(--primary))` }}></div>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">{Math.round(progress)}% utilized</p>
                                <p className="text-slate-900 dark:text-white text-xs font-bold">₹{(cat.allocated - cat.spent).toLocaleString('en-IN')} left</p>
                            </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 px-4 py-3">
                        <div className="flex flex-col gap-3">
                          {expensesArray.length > 0 ? expensesArray.map(exp => (
                            <div key={exp.id} className="flex justify-between items-center group">
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">{exp.description}</span>
                                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{format(parseISO(exp.date), 'MMM dd, yyyy')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-900 dark:text-white">₹{exp.amount.toLocaleString('en-IN')}</span>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => openExpenseDialog(cat, exp)}>
                                      <Pencil className="mr-2 h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDeleteExpense(cat.id, exp.id)} className="text-destructive">
                                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          )) : (
                            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No expenses added yet.</p>
                          )}
                        </div>
                        <div className="flex gap-2 mt-4">
                            <Button onClick={() => openExpenseDialog(cat, null)} variant="outline" className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 h-9">
                              <Plus className="mr-2 h-4 w-4" /> Add Expense
                            </Button>
                            <Button onClick={() => openCategoryDialog(cat)} variant="ghost" size="icon" className="h-9 w-9 border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                                <Pencil className="h-4 w-4"/>
                            </Button>
                             <Button onClick={() => openDeleteDialog(cat)} variant="ghost" size="icon" className="h-9 w-9 border bg-white dark:bg-slate-900 border-destructive/20 dark:border-destructive/20 text-destructive">
                                <Trash2 className="h-4 w-4"/>
                            </Button>
                        </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          )}
        </div>
      </main>
      
      {/* ADD CATEGORY DIALOG */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{activeCategory ? 'Edit' : 'Add'} Category</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cat-name" className="text-right">Name</Label>
              <Input id="cat-name" value={categoryNameInput} onChange={(e) => setCategoryNameInput(e.target.value)} className="col-span-3" placeholder="e.g., Venue" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cat-allocated" className="text-right">Budget</Label>
              <Input id="cat-allocated" type="number" value={categoryAllocatedInput} onChange={(e) => setCategoryAllocatedInput(e.target.value)} className="col-span-3" placeholder="e.g., 100000" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Icon</Label>
              <div className="col-span-3 grid grid-cols-6 gap-2">
                {categoryStyles.map((style, index) => (
                    <button key={style.icon} onClick={() => setCategoryStyleIndex(index)} className={cn("h-10 w-10 rounded-lg flex items-center justify-center", style.bg, categoryStyleIndex === index && 'ring-2 ring-primary ring-offset-2')}>
                        <span className={cn("material-symbols-outlined", style.text)}>{style.icon}</span>
                    </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveCategory}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* ADD/EDIT EXPENSE DIALOG */}
      <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{activeExpense ? 'Edit' : 'Add'} Expense for "{activeCategory?.name}"</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="exp-desc" className="text-right">Description</Label>
              <Input id="exp-desc" value={expenseDescriptionInput} onChange={(e) => setExpenseDescriptionInput(e.target.value)} className="col-span-3" placeholder="e.g., Venue Deposit" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="exp-amount" className="text-right">Amount</Label>
              <Input id="exp-amount" type="number" value={expenseAmountInput} onChange={(e) => setExpenseAmountInput(e.target.value)} className="col-span-3" placeholder="e.g., 5000" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="exp-date" className="text-right">Date</Label>
              <Input id="exp-date" type="date" value={expenseDateInput} onChange={(e) => setExpenseDateInput(e.target.value)} className="col-span-3"/>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveExpense}>Save Expense</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the "{activeCategory?.name}" category and all its expenses. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </DialogContent>
      </AlertDialog>

      <div className="fixed bottom-28 right-6 z-30">
        <Button onClick={() => openCategoryDialog(null)} className="w-14 h-14 rounded-full shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform">
          <span className="material-symbols-outlined text-3xl">add</span>
        </Button>
      </div>
    </div>
  );
}
