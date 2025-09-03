import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  current: number;
  total: number;
  operation?: string;
  className?: string;
}

export function ProgressIndicator({
  current,
  total,
  operation,
  className,
}: ProgressIndicatorProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className={cn('w-full', className)} role="progressbar" aria-valuenow={percentage}>
      {operation && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted-foreground">{operation}</span>
          <span className="text-muted-foreground font-medium">{percentage}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <motion.div
          className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
      <div className="sr-only">
        {operation || 'Progress'}: {current} of {total} completed
      </div>
    </div>
  );
}
