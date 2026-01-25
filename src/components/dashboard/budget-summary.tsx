import { Progress } from '@/components/ui/progress';

export function BudgetSummary() {
  const spent = 12400;
  const total = 25000;
  const percentage = Math.round((spent / total) * 100);
  const circumference = 2 * Math.PI * 40; // 2 * pi * r

  return (
    <div className="rounded-xl border border-primary/10 bg-card p-6 shadow-lg dark:bg-card/50">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Budget Progress</h3>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">On Track</span>
        </div>
        <div className="flex items-center gap-6">
            <div className="relative flex h-24 w-24 items-center justify-center">
                <svg className="h-full w-full -rotate-90 transform">
                    <circle className="stroke-secondary" cx="48" cy="48" r="40" fill="transparent" strokeWidth="8"></circle>
                    <circle className="text-primary" cx="48" cy="48" r="40" fill="transparent" stroke="currentColor" strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - (percentage / 100) * circumference}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold">{percentage}%</span>
                </div>
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Spent vs. Remaining</p>
                <p className="text-xl font-bold">
                    ${spent.toLocaleString()} / ${total.toLocaleString('en-US', { notation: 'compact', compactDisplay: 'short' })}
                </p>
                <Progress value={percentage} className="mt-2 h-1.5" />
            </div>
        </div>
    </div>
  );
}
