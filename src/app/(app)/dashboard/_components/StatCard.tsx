import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

export function StatCard({
  label,
  value,
  icon: Icon,
  href,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  href?: string;
}) {
  const content = (
    <Card
      className={cn(
        'flex items-center gap-3 p-4 transition-colors',
        href && 'hover:border-neutral-300 dark:hover:border-neutral-700'
      )}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-semibold leading-tight">{value}</p>
        <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">{label}</p>
      </div>
    </Card>
  );

  if (!href) return content;
  return <Link href={href}>{content}</Link>;
}
