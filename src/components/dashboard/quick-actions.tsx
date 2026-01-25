import Link from 'next/link';
import { UserPlus, ClipboardList } from 'lucide-react';

export function QuickActions() {
  return (
    <div>
      <h3 className="mb-4 text-lg font-bold">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-4">
        <Link href="/guests" passHref>
          <button className="flex w-full items-center gap-3 rounded-xl border border-primary/20 bg-primary/10 p-4 text-left transition-all hover:scale-[1.02] dark:bg-primary/20">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold">Add Guest</p>
              <p className="text-[10px] font-semibold uppercase text-muted-foreground">Invite List</p>
            </div>
          </button>
        </Link>
        <Link href="/tasks" passHref>
          <button className="flex w-full items-center gap-3 rounded-xl border border-primary/20 bg-primary/10 p-4 text-left transition-all hover:scale-[1.02] dark:bg-primary/20">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold">New Task</p>
              <p className="text-[10px] font-semibold uppercase text-muted-foreground">To-do list</p>
            </div>
          </button>
        </Link>
      </div>
    </div>
  );
}
