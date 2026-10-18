import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, hasError, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-24 w-full resize-y rounded-md border bg-surface px-3 py-2 text-sm leading-6 text-text placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:bg-neutral-bg',
      hasError ? 'border-danger' : 'border-border',
      className,
    )}
    aria-invalid={hasError || props['aria-invalid']}
    {...props}
  />
));
Textarea.displayName = 'Textarea';
