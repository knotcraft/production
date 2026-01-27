
'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useUser, useFirebase } from '@/firebase';
import { ref, onValue, set, push, update, remove } from 'firebase/database';
import type { Task } from '@/lib/types';
import { Loader2, Trash2, Pencil } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, parseISO, isValid } from 'date-fns';

const taskCategories = [
  '12+ Months Out',
  '9-12 Months Out',
  '6-9 Months Out',
  '3-6 Months Out',
  '1-3 Months Out',
  'Week Of',
  'Day Of',
  'Post-Wedding',
];

const priorities: Task['priority'][] = ['High', 'Medium', 'Low'];

const priorityMap = {
  High: { color: 'text-primary', iconFill: 1 },
  Medium: { color: 'text-orange-400', iconFill: 0 },
  Low: { color: 'text-green-500', iconFill: 0 },
};

export default function TasksPage() {
    const { user } = useUser();
    const { database } = useFirebase();
    const { toast } = useToast();

    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    
    const [formState, setFormState] = useState<Partial<Task>>({
        title: '',
        dueDate: new Date().toISOString().split('T')[0],
        notes: '',
        completed: false,
        category: taskCategories[0],
        priority: 'Medium',
    });
    
    useEffect(() => {
        if (user && database) {
            setLoading(true);
            const tasksRef = ref(database, `users/${user.uid}/tasks`);
            const unsubscribe = onValue(tasksRef, (snapshot) => {
                const data = snapshot.val();
                const tasksList: Task[] = data
                    ? Object.entries(data).map(([id, task]) => ({
                          id,
                          ...(task as Omit<Task, 'id'>),
                      }))
                    : [];
                setTasks(tasksList);
                setLoading(false);
            });
            return () => unsubscribe();
        } else if (!user) {
            setLoading(false);
        }
    }, [user, database]);
    
    const { groupedTasks, overallProgress } = useMemo(() => {
        const filtered = tasks.filter(task => task.title.toLowerCase().includes(searchQuery.toLowerCase()));

        const grouped = taskCategories.map(category => {
            const categoryTasks = filtered.filter(task => task.category === category);
            const completedCount = categoryTasks.filter(t => t.completed).length;
            return {
                name: category,
                tasks: categoryTasks,
                completedCount,
                totalCount: categoryTasks.length
            };
        }).filter(group => group.totalCount > 0);

        const totalTasks = filtered.length;
        const completedTasksCount = filtered.filter(t => t.completed).length;
        const progress = totalTasks > 0 ? (completedTasksCount / totalTasks) * 100 : 0;
        
        return { groupedTasks: grouped, overallProgress: { completed: completedTasksCount, total: totalTasks, percentage: progress } };
    }, [tasks, searchQuery]);


    const openTaskDialog = (task: Task | null) => {
        setActiveTask(task);
        if (task) {
            setFormState(task);
        } else {
            setFormState({ 
                title: '', 
                dueDate: new Date().toISOString().split('T')[0], 
                notes: '', 
                completed: false,
                category: taskCategories[0],
                priority: 'Medium'
            });
        }
        setIsTaskDialogOpen(true);
    };

    const handleSaveTask = async () => {
        if (!user || !database || !formState.title || !formState.dueDate || !formState.category || !formState.priority) {
            toast({ variant: 'destructive', title: 'Invalid input', description: 'Please fill out all required fields.' });
            return;
        }
    
        const taskData = {
            title: formState.title,
            dueDate: formState.dueDate,
            notes: formState.notes || '',
            completed: formState.completed || false,
            category: formState.category,
            priority: formState.priority,
        };

        try {
            if (activeTask) {
                await update(ref(database, `users/${user.uid}/tasks/${activeTask.id}`), taskData);
                toast({ variant: 'success', title: 'Success', description: 'Task updated.' });
            } else {
                await set(push(ref(database, `users/${user.uid}/tasks`)), taskData);
                toast({ variant: 'success', title: 'Success', description: 'Task added.' });
            }
            setIsTaskDialogOpen(false);
            setActiveTask(null);
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'Error', description: e.message || 'Could not save task.' });
        }
    };
    
    const toggleTaskCompletion = async (task: Task) => {
        if (!user || !database) return;
        try {
            await update(ref(database, `users/${user.uid}/tasks/${task.id}`), { completed: !task.completed });
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update task status.' });
        }
    };

    const openDeleteDialog = (task: Task) => {
      setTaskToDelete(task);
      setIsDeleteDialogOpen(true);
    };

    const handleDeleteTask = async () => {
        if (!user || !database || !taskToDelete) return;
        try {
            await remove(ref(database, `users/${user.uid}/tasks/${taskToDelete.id}`));
            toast({ variant: 'success', title: 'Success', description: 'Task deleted.' });
            setIsDeleteDialogOpen(false);
            setTaskToDelete(null);
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'Error', description: e.message || 'Could not delete task.' });
        }
    };
    
    if (loading) {
      return (
        <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    
    return (
        <div className="bg-background-light dark:bg-[#1c0d11] min-h-screen">
          <header className="sticky top-0 z-20 bg-white/90 dark:bg-[#1c0d11]/90 backdrop-blur-md">
            <div className="flex items-center p-4 pb-2 justify-between">
              <Link href="/" className="text-[#181113] dark:text-white flex size-12 shrink-0 items-center justify-start -ml-3">
                <span className="material-symbols-outlined">arrow_back_ios</span>
              </Link>
              <h2 className="text-[#181113] dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center">Wedding Checklist</h2>
              <div className="flex w-12 items-center justify-end">
                <button className="flex cursor-pointer items-center justify-center rounded-lg h-12 bg-transparent text-primary gap-2 text-base font-bold p-0">
                  <span className="material-symbols-outlined">tune</span>
                </button>
              </div>
            </div>
            <div className="px-4 py-2">
                <div className="flex w-full flex-1 items-stretch rounded-xl h-10 bg-[#f4f0f1] dark:bg-[#2d1a1f]">
                    <div className="text-[#89616b] flex items-center justify-center pl-3">
                        <span className="material-symbols-outlined text-[20px]">search</span>
                    </div>
                    <Input
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden text-[#181113] dark:text-white focus:outline-0 focus:ring-0 border-none bg-transparent h-full placeholder:text-[#89616b] px-2 text-sm font-normal"
                        placeholder="Search for tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>
          </header>
          
          <section className="bg-white dark:bg-[#1c0d11]">
            <div className="flex flex-col gap-2 p-4">
              <div className="flex gap-6 justify-between items-end">
                <p className="text-[#181113] dark:text-white text-base font-bold">Overall Progress</p>
                <p className="text-primary text-sm font-bold">{Math.round(overallProgress.percentage)}%</p>
              </div>
              <div className="h-2 w-full rounded-full bg-[#e6dbde] dark:bg-[#3d2a2e] overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${overallProgress.percentage}%` }}></div>
              </div>
              <p className="text-[#89616b] text-xs font-medium">{overallProgress.completed} of {overallProgress.total} tasks completed</p>
            </div>
          </section>
          
          <main className="flex-1 px-4 py-2 space-y-2 pb-24">
             {groupedTasks.length === 0 && !loading ? (
                 <div className="text-center p-10 mt-10 flex flex-col items-center justify-center gap-4 text-muted-foreground h-full rounded-xl border-2 border-dashed bg-card/50">
                    <span className="material-symbols-outlined text-6xl text-slate-400">check_box_outline_blank</span>
                    <h3 className="text-lg font-semibold text-foreground">No Tasks Found</h3>
                    <p>{searchQuery ? "Try a different search term." : "Click the '+' button to add a task."}</p>
                  </div>
             ) : (
                <Accordion type="multiple" className="space-y-2" defaultValue={groupedTasks.map(g => g.name)}>
                  {groupedTasks.map(group => (
                    <AccordionItem value={group.name} key={group.name} className="bg-[#fcfafa] dark:bg-[#251418] rounded-xl overflow-hidden border border-[#e6dbde]/50 dark:border-[#3d2a2e]">
                      <AccordionTrigger className="flex cursor-pointer items-center justify-between gap-4 p-4 hover:no-underline">
                        <div className="flex flex-col text-left">
                          <p className="text-[#181113] dark:text-white text-sm font-bold">{group.name}</p>
                          <p className="text-[#89616b] text-[11px] font-medium uppercase tracking-wider">{group.completedCount}/{group.totalCount} Tasks Done</p>
                        </div>
                        <span className="material-symbols-outlined text-[#89616b] transition-transform group-data-[state=open]:rotate-180">expand_more</span>
                      </AccordionTrigger>
                      <AccordionContent className="p-2 pt-0 space-y-1">
                        {group.tasks.sort((a,b) => (a.completed ? 1 : -1) - (b.completed ? 1 : -1) || (isValid(new Date(a.dueDate)) ? new Date(a.dueDate).getTime() : 0) - (isValid(new Date(b.dueDate)) ? new Date(b.dueDate).getTime() : 0)).map(task => (
                           <div key={task.id} className="flex items-center gap-3 px-3 py-3 rounded-lg bg-white/50 dark:bg-white/5">
                              <div className="flex size-6 items-center justify-center" onClick={(e) => { e.stopPropagation(); toggleTaskCompletion(task);}}>
                                <input
                                  type="checkbox"
                                  checked={task.completed}
                                  readOnly
                                  className="custom-checkbox h-5 w-5 rounded-full border-[#e6dbde] dark:border-[#4d3a3e] border-2 bg-transparent text-primary checked:bg-primary checked:border-primary focus:ring-0 focus:ring-offset-0 focus:outline-none cursor-pointer"
                                />
                              </div>
                              <div className={cn("flex flex-col flex-1", task.completed && "checked-task")}>
                                <p className="text-[#181113] dark:text-white text-sm font-semibold">{task.title}</p>
                                <p className="text-[#89616b] text-[11px]">Due: {isValid(parseISO(task.dueDate)) ? format(parseISO(task.dueDate), 'MMM dd') : 'Invalid Date'} • {task.priority} Priority</p>
                              </div>
                              <span className={cn("material-symbols-outlined text-[20px]", priorityMap[task.priority].color)} style={{fontVariationSettings: `'FILL' ${priorityMap[task.priority].iconFill}`}}>flag</span>
                               <div className="flex items-center gap-1 ml-auto">
                                <button onClick={(e) => { e.stopPropagation(); openTaskDialog(task); }} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors p-1 rounded-md">
                                    <Pencil className="h-4 w-4" />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); openDeleteDialog(task); }} className="text-destructive/70 hover:text-destructive transition-colors p-1 rounded-md">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
             )}
          </main>
          
          <button onClick={() => openTaskDialog(null)} className="fixed bottom-28 right-6 flex items-center justify-center size-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 z-30 active:scale-95 transition-transform">
            <span className="material-symbols-outlined text-3xl">add</span>
          </button>
            
          <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
              <DialogContent>
                  <DialogHeader>
                      <DialogTitle>{activeTask ? 'Edit' : 'Add'} Task</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                          <Label htmlFor="title">Title</Label>
                          <Input id="title" value={formState.title || ''} onChange={(e) => setFormState(p => ({...p, title: e.target.value}))} placeholder="e.g. Book photographer" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="dueDate">Due Date</Label>
                            <Input id="dueDate" type="date" value={formState.dueDate || ''} onChange={(e) => setFormState(p => ({...p, dueDate: e.target.value}))} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select value={formState.category} onValueChange={(value) => setFormState(p => ({...p, category: value}))}>
                              <SelectTrigger id="category"><SelectValue placeholder="Select category" /></SelectTrigger>
                              <SelectContent>
                                  {taskCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                              </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="notes">Notes</Label>
                          <Textarea id="notes" value={formState.notes || ''} onChange={(e) => setFormState(p => ({...p, notes: e.target.value}))} placeholder="e.g. Call them to confirm booking..." />
                      </div>
                      <div className="space-y-2">
                        <Label>Priority</Label>
                        <div className="flex gap-2">
                            {priorities.map(p => (
                                <Button key={p} variant={formState.priority === p ? 'default' : 'outline'} onClick={() => setFormState(s => ({...s, priority: p}))} className="flex-1">
                                    <span className={cn("material-symbols-outlined mr-2 h-4 w-4", formState.priority !== p && priorityMap[p].color)}>flag</span>
                                    {p}
                                </Button>
                            ))}
                        </div>
                      </div>
                  </div>
                  <DialogFooter>
                      <Button onClick={handleSaveTask} className="w-full">Save Task</Button>
                  </DialogFooter>
              </DialogContent>
          </Dialog>

          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the "{taskToDelete?.title}" task. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteTask} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
    );
}

