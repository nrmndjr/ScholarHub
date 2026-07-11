import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="mb-2 flex items-center gap-1 text-xs text-neutral-400">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={index} className="flex items-center gap-1">
            {index > 0 && <ChevronRight className="h-3 w-3 shrink-0" />}
            {item.href && !isLast ? (
              <Link href={item.href} className="truncate hover:text-neutral-700 dark:hover:text-neutral-200">
                {item.label}
              </Link>
            ) : (
              <span className={`truncate ${isLast ? 'text-neutral-600 dark:text-neutral-300' : ''}`}>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
