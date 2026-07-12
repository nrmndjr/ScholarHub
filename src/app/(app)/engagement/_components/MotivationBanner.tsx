import { Sparkles } from 'lucide-react';

export function MotivationBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/5 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300">
      <Sparkles className="h-4 w-4 shrink-0 text-accent" />
      <p>{message}</p>
    </div>
  );
}
