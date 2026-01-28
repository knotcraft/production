import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

export const AppLogo = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("flex items-center justify-center text-primary font-bold text-3xl", className)} {...props}>
        <span>Knotcraft</span>
    </div>
  );
};
