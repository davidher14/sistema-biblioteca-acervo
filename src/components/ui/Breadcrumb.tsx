import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Trilha de navegação" className={className}>
      <ol className="m-0 flex list-none flex-wrap items-center gap-2 p-0 text-[13px]">
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {index > 0 && <ChevronRight className="size-4 text-text-muted" aria-hidden="true" />}
              {current
                ? <span aria-current="page" className="font-medium text-text">{item.label}</span>
                : item.href
                  ? <a href={item.href} className="rounded-sm text-text-muted underline-offset-4 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">{item.label}</a>
                  : <span className="text-text-muted">{item.label}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
