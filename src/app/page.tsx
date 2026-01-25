import { Header } from '@/components/dashboard/header';
import { BudgetSummary } from '@/components/dashboard/budget-summary';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { TaskList } from '@/components/dashboard/task-list';

export default function Home() {
  return (
    <>
      <Header />
      <div className="relative z-10 -mt-6 px-4">
        <BudgetSummary />
      </div>
      <div className="px-4 pt-8">
        <QuickActions />
      </div>
      <div className="px-4 pt-8">
        <TaskList />
      </div>
    </>
  );
}
