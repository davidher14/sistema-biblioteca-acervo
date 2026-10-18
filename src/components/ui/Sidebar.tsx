import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  children: ReactNode;
  label?: string;
  footer?: ReactNode;
  header?: ReactNode;
  className?: string;
}

export function Sidebar({ children, label = 'Navegação principal', footer, header, className }: SidebarProps) {
  return (
    <aside className={cn('flex min-h-full w-64 flex-col bg-primary px-4 py-6 text-surface', className)}>
      {header && <div className="mb-6">{header}</div>}
      <nav aria-label={label} className="grid gap-1">{children}</nav>
      {footer && <div className="mt-auto pt-6">{footer}</div>}
    </aside>
  );
}

interface SidebarItemProps {
  children: ReactNode;
  active?: boolean;
  href?: string;
  onClick?: () => void;
  'aria-label'?: string;
}

export function SidebarItem({ children, active, href, onClick, 'aria-label': ariaLabel }: SidebarItemProps) {
  const className = `flex min-h-11 items-center gap-3 rounded-md border-0 bg-transparent px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${active ? 'bg-primary-soft text-primary' : 'text-surface hover:bg-primary-hover'}`;
  if (href) return <a href={href} className={className} aria-current={active ? 'page' : undefined} aria-label={ariaLabel}>{children}</a>;
  return <button type="button" onClick={onClick} className={`${className} w-full text-left`} aria-current={active ? 'page' : undefined} aria-label={ariaLabel}>{children}</button>;
}
