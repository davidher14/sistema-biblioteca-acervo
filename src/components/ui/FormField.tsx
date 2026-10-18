import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({ label, htmlFor, error, hint, required, children, className }: FormFieldProps) {
  const messageId = `${htmlFor}-message`;
  return (
    <div className={cn('grid gap-2', className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-text">
        {label}{required && <span aria-hidden="true"> *</span>}
      </label>
      {children}
      {error && <p id={messageId} className="m-0 text-xs font-medium text-danger" role="alert">{error}</p>}
      {!error && hint && <p id={messageId} className="m-0 text-xs leading-5 text-text-muted">{hint}</p>}
    </div>
  );
}
