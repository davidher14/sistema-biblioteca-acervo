import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from './Button';

export type ToastVariant = 'success' | 'error' | 'info';

interface ToastProps {
  variant: ToastVariant;
  title: string;
  description?: string;
  onDismiss?: () => void;
  action?: ReactNode;
}

const toastIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

export function Toast({ variant, title, description, onDismiss, action }: ToastProps) {
  const Icon = toastIcons[variant];
  return (
    <div className={`ui-toast ui-toast--${variant}`} role={variant === 'error' ? 'alert' : 'status'} aria-live={variant === 'error' ? 'assertive' : 'polite'}>
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <strong className="block text-sm font-medium">{title}</strong>
        {description && <p className="m-0 mt-1 text-xs leading-5">{description}</p>}
        {action}
      </div>
      {onDismiss && <Button variant="ghost" size="icon" onClick={onDismiss} aria-label="Fechar notificação"><X className="size-4" aria-hidden="true" /></Button>}
    </div>
  );
}
