import { cn } from './Button';

export function Badge({ className, variant = "default", ...props }) {
  const variants = {
    default: "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100",
    primary: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
    danger: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
    waiting: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    serving: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    served: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    'no-show': "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
