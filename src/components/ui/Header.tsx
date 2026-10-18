import type { ReactNode } from 'react';
import { LogOut } from 'lucide-react';

interface HeaderProps {
  userName: string;
  profile: string;
  onLogout: () => void;
  logoutLabel?: string;
  leading?: ReactNode;
}

export function Header({ userName, profile, onLogout, logoutLabel = 'Sair', leading }: HeaderProps) {
  const initials = userName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toLocaleUpperCase('pt-BR');

  return (
    <header className="flex min-h-[72px] items-center justify-between gap-4 border-b border-border bg-surface px-4 py-2 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        {leading}
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-semibold text-primary" aria-hidden="true">
          {initials}
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-sm font-semibold text-text">{userName}</span>
          <span className="text-xs text-text-muted">{profile}</span>
        </div>
      </div>
      <button type="button" onClick={onLogout} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm font-medium text-primary transition-colors hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:px-4">
        <LogOut className="size-4" aria-hidden="true" />
        {logoutLabel}
      </button>
    </header>
  );
}
