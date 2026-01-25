'use client';

import Link from 'next/link';
import { useState } from 'react';

const initialTasks = {
  'task1': true,
  'task2': true,
  'task3': false,
  'task4': false,
  'task5': false,
};

const taskGroups = [
  {
    title: '12+ Months Out',
    progressText: '2/8 Tasks Done',
    tasks: [
      { id: 'task1', title: 'Secure Wedding Venue', due: 'Due: Oct 15 • High Priority', priority: 'high' },
      { id: 'task2', title: 'Draft Initial Guest List', due: 'Due: Oct 20 • Medium Priority', priority: 'medium' },
      { id: 'task3', title: 'Set Wedding Budget', due: 'Due: Nov 01 • High Priority', priority: 'high' },
    ],
    defaultOpen: true,
  },
  {
    title: '6-9 Months Out',
    progressText: '5/12 Tasks Done',
    tasks: [
        { id: 'task4', title: 'Hire Photographer', due: 'Due: Jan 15 • Medium Priority', priority: 'medium' },
    ],
    defaultOpen: false,
  },
  {
    title: '3 Months Out',
    progressText: '5/8 Tasks Done',
    tasks: [
        { id: 'task5', title: 'Send Wedding Invitations', due: 'Due: Mar 22 • High Priority', priority: 'high' },
    ],
    defaultOpen: false,
  }
];

const priorityClasses: { [key: string]: string } = {
  high: 'text-primary fill-[1]',
  medium: 'text-orange-400',
  low: 'text-gray-400'
};

export default function TasksPage() {
    const [checkedTasks, setCheckedTasks] = useState<{ [key: string]: boolean }>(initialTasks);

    const handleCheckboxChange = (taskId: string) => {
        setCheckedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
    };
    
    // Note: The progress is hardcoded in the HTML to 45% (12 of 28), so we'll do the same.
    const progressPercentage = 45;
    const completedTasksText = "12 of 28 tasks completed";

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-white dark:bg-[#1c0d11] shadow-xl">
            {/* TopAppBar */}
            <header className="sticky top-0 z-20 bg-white/90 dark:bg-[#1c0d11]/90 backdrop-blur-md">
                <div className="flex items-center p-4 pb-2 justify-between">
                    <Link href="/" className="text-foreground flex size-12 shrink-0 items-center justify-start">
                        <span className="material-symbols-outlined">arrow_back_ios</span>
                    </Link>
                    <h2 className="text-foreground text-lg font-bold leading-tight tracking-tight flex-1 text-center">Wedding Checklist</h2>
                    <div className="flex w-12 items-center justify-end">
                        <button className="flex cursor-pointer items-center justify-center rounded-lg h-12 bg-transparent text-primary gap-2 text-base font-bold p-0">
                            <span className="material-symbols-outlined">tune</span>
                        </button>
                    </div>
                </div>
                {/* SearchBar */}
                <div className="px-4 py-2">
                    <label className="flex flex-col min-w-40 h-10 w-full">
                        <div className="flex w-full flex-1 items-stretch rounded-xl h-full bg-[#f4f0f1] dark:bg-[#2d1a1f]">
                            <div className="text-muted-foreground flex items-center justify-center pl-3">
                                <span className="material-symbols-outlined text-[20px]">search</span>
                            </div>
                            <input className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden text-foreground bg-transparent h-full placeholder:text-muted-foreground px-2 text-sm font-normal focus:outline-none focus:ring-0 border-none" placeholder="Search for tasks..." />
                        </div>
                    </label>
                </div>
            </header>

            {/* Progress Section */}
            <section className="bg-white dark:bg-[#1c0d11]">
                <div className="flex flex-col gap-2 p-4">
                    <div className="flex gap-6 justify-between items-end">
                        <p className="text-foreground text-base font-bold">Overall Progress</p>
                        <p className="text-primary text-sm font-bold">{progressPercentage}%</p>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#e6dbde] dark:bg-[#3d2a2e] overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                    <p className="text-muted-foreground text-xs font-medium">{completedTasksText}</p>
                </div>
            </section>

            {/* Timeline Accordions */}
            <main className="flex-1 px-4 py-2 space-y-2">
                {taskGroups.map(group => (
                    <details key={group.title} className="group bg-[#fcfafa] dark:bg-[#251418] rounded-xl overflow-hidden border border-[#e6dbde]/50 dark:border-[#3d2a2e]" open={group.defaultOpen}>
                        <summary className="flex cursor-pointer items-center justify-between gap-4 p-4 list-none">
                            <div className="flex flex-col">
                                <p className="text-foreground text-sm font-bold">{group.title}</p>
                                <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">{group.progressText}</p>
                            </div>
                            <span className="material-symbols-outlined text-muted-foreground transition-transform group-open:rotate-180">expand_more</span>
                        </summary>
                        <div className="p-2 space-y-1">
                            {group.tasks.map(task => {
                                const isChecked = !!checkedTasks[task.id];
                                return (
                                    <div key={task.id} className="flex items-center gap-3 px-3 py-3 rounded-lg bg-white/50 dark:bg-white/5">
                                        <div className="flex size-6 items-center justify-center">
                                            <input 
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => handleCheckboxChange(task.id)}
                                                className="custom-checkbox h-5 w-5 rounded-full border-[#e6dbde] dark:border-[#4d3a3e] border-2 bg-transparent text-primary checked:bg-primary checked:border-primary focus:ring-0 focus:ring-offset-0 focus:outline-none"
                                            />
                                        </div>
                                        <div className={`flex-1 ${isChecked ? 'checked-task' : ''}`}>
                                            <p className="text-foreground text-sm font-semibold">{task.title}</p>
                                            <p className="text-muted-foreground text-[11px]">{task.due}</p>
                                        </div>
                                        <span className={`material-symbols-outlined text-[20px] ${priorityClasses[task.priority]}`}>flag</span>
                                    </div>
                                )
                            })}
                        </div>
                    </details>
                ))}
                 <div className="h-24"></div>
            </main>

            {/* Floating Action Button */}
            <button className="fixed bottom-24 right-6 flex items-center justify-center size-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 z-30 active:scale-95 transition-transform">
                <span className="material-symbols-outlined text-3xl">add</span>
            </button>
        </div>
    );
}
