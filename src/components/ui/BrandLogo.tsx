import { cn } from '../../lib/utils';

interface BrandLogoProps {
  className?: string;
  inverse?: boolean;
  size?: 'default' | 'large';
  showTagline?: boolean;
}

export function BrandLogo({
  className,
  inverse = false,
  size = 'default',
  showTagline = true,
}: BrandLogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-3', inverse ? 'text-white' : 'text-primary', className)}>
      <svg
        aria-hidden="true"
        viewBox="0 0 72 72"
        className={cn('shrink-0', size === 'large' ? 'size-12' : 'size-10')}
        fill="none"
      >
        <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3">
          <path d="M13 9h43c-6 7-6 15 0 22H13a11 11 0 0 1 0-22Z" />
          <path d="M13 25h46c-6 7-6 15 0 22H13a11 11 0 0 1 0-22Z" />
          <path d="M13 41h43c-6 7-6 15 0 22H13a11 11 0 0 1 0-22Z" />
          <path d="M17 16h27M17 32h31M17 48h27" />
        </g>
        <path d="M49 27h11v31l-5.5-5-5.5 5V27Z" fill="#C7A55C" stroke="#C7A55C" strokeLinejoin="round" strokeWidth="2" />
      </svg>
      <span className="min-w-0">
        <span className={cn('block font-serif font-semibold leading-none tracking-tight', size === 'large' ? 'text-3xl' : 'text-xl')}>
          Acervo
        </span>
        {showTagline && (
          <span className={cn('mt-1 block text-[10px] uppercase tracking-[0.16em]', inverse ? 'text-white/65' : 'text-text-muted')}>
            Biblioteca
          </span>
        )}
      </span>
    </span>
  );
}
