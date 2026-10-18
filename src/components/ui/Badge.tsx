import { AlertCircle, Ban, BookOpen, CheckCircle2, Clock3, Info, type LucideIcon } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export type StatusKind = 'available' | 'borrowed' | 'pending' | 'reserved' | 'overdue' | 'unavailable' | 'inactive' | 'neutral';

const statusIcons: Record<StatusKind, LucideIcon> = {
  available: CheckCircle2,
  borrowed: BookOpen,
  pending: Clock3,
  reserved: Info,
  overdue: AlertCircle,
  unavailable: Ban,
  inactive: Ban,
  neutral: Info,
};

const statusLabels: Record<StatusKind, string> = {
  available: 'Disponível',
  borrowed: 'Emprestado',
  pending: 'Pendente',
  reserved: 'Reservado',
  overdue: 'Atrasado',
  unavailable: 'Indisponível',
  inactive: 'Inativo',
  neutral: 'Neutro',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: StatusKind;
  label?: string;
  showIcon?: boolean;
}

export function Badge({ className, status, label, showIcon = true, ...props }: BadgeProps) {
  const Icon = statusIcons[status];
  return (
    <span className={cn('inline-flex min-h-7 items-center gap-1.5 rounded-sm px-2 py-1 text-xs font-medium', `badge--${status}`, className)} {...props}>
      {showIcon && <Icon className="size-3.5 shrink-0" aria-hidden="true" />}
      <span>{label ?? statusLabels[status]}</span>
    </span>
  );
}
