"use client";
import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const tasksData = [
  { id: 1, title: 'Finalize Catering Menu', due: 'Due in 2 days' },
  { id: 2, title: 'Bridal Dress Fitting', due: 'Due in 5 days' },
  { id: 3, title: 'Order Floral Decorations', due: 'Due in 1 week' },
];

export function TaskList() {
    const [completedTasks, setCompletedTasks] = useState<number[]>([]);

    const toggleTask = (id: number) => {
        setCompletedTasks(prev => 
            prev.includes(id) ? prev.filter(taskId => taskId !== id) : [...prev, id]
        );
    };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold">Upcoming Tasks</h3>
        <Link href="/tasks" passHref>
            <Button variant="link" className="text-primary px-0">See All</Button>
        </Link>
      </div>
      <div className="space-y-3">
        {tasksData.map(task => {
            const isCompleted = completedTasks.includes(task.id);
            return (
          <div key={task.id} className="flex items-center gap-4 rounded-xl border bg-card p-4 dark:border-white/10">
            <div onClick={() => toggleTask(task.id)} className="flex h-6 w-6 cursor-pointer items-center justify-center rounded border-2 border-primary/30 shrink-0">
              <div className={cn("w-3 h-3 rounded-sm bg-primary transition-opacity", isCompleted ? "opacity-100" : "opacity-0")}></div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">{task.title}</p>
              <p className="text-xs text-muted-foreground">{task.due}</p>
            </div>
            <ChevronRight className="text-muted-foreground" />
          </div>
            );
        })}
      </div>
    </div>
  );
}
