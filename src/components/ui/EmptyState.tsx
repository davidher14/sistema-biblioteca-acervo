import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <section className="flex min-h-56 flex-col items-center justify-center gap-3 px-6 py-8 text-center" aria-live="polite">
      {icon && <div className="mb-1 text-primary" aria-hidden="true">{icon}</div>}
      <h2 className="m-0 text-lg font-semibold leading-[1.35] text-text">{title}</h2>
      <p className="m-0 max-w-prose text-sm leading-6 text-text-muted">{description}</p>
      {action}
    </section>
  );
}
