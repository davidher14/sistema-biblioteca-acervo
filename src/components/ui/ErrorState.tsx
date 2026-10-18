import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  description: string;
  onRetry: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = 'Não foi possível carregar os dados.',
  description,
  onRetry,
  retryLabel = 'Tentar novamente',
}: ErrorStateProps) {
  return (
    <section className="flex min-h-56 flex-col items-center justify-center gap-3 px-6 py-8 text-center" role="alert">
      <AlertCircle className="size-6 text-danger" aria-hidden="true" />
      <h2 className="m-0 text-lg font-semibold leading-[1.35] text-text">{title}</h2>
      <p className="m-0 max-w-prose text-sm leading-6 text-text-muted">{description}</p>
      <Button variant="secondary" onClick={onRetry}>{retryLabel}</Button>
    </section>
  );
}
