import { Check, ChevronsUpDown } from 'lucide-react';
import { useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { cn } from '../../lib/utils';
import { Input } from './Input';

export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  id?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  'aria-label': string;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = 'Selecione uma opção',
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'Nenhum resultado encontrado.',
  disabled,
  id,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  'aria-label': ariaLabel,
}: ComboboxProps) {
  const generatedId = useId();
  const baseId = id ?? generatedId;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const selected = options.find((option) => option.value === value);
  const filteredOptions = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR');
    return options.filter((option) => `${option.label} ${option.description ?? ''}`.toLocaleLowerCase('pt-BR').includes(normalizedSearch));
  }, [options, search]);
  const enabledOptions = filteredOptions.filter((option) => !option.disabled);
  const activeOptionIndex = filteredOptions.findIndex(
    (option) => option.value === enabledOptions[activeIndex]?.value,
  );

  function openMenu() {
    if (disabled) return;
    setOpen(true);
    setSearch('');
    setActiveIndex(0);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }

  function choose(option: ComboboxOption) {
    if (option.disabled) return;
    onValueChange(option.value);
    setOpen(false);
    setSearch('');
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function handleKeys(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Tab') {
      setOpen(false);
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      window.requestAnimationFrame(() => triggerRef.current?.focus());
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        openMenu();
        return;
      }
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((current) => (current + delta + enabledOptions.length) % Math.max(enabledOptions.length, 1));
    }
    if (event.key === 'Enter' && open && enabledOptions[activeIndex]) {
      event.preventDefault();
      choose(enabledOptions[activeIndex]);
    }
  }

  return (
    <div className="relative w-full" onKeyDown={handleKeys}>
      <button
        type="button"
        ref={triggerRef}
        id={id}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={`${baseId}-listbox`}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        aria-haspopup="listbox"
        disabled={disabled}
        className={cn(
          'flex min-h-11 w-full items-center justify-between gap-2 rounded-md border border-border bg-surface px-3 py-2 text-left text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:bg-neutral-bg',
        )}
        onClick={() => (open ? setOpen(false) : openMenu())}
      >
        <span className={selected ? 'truncate' : 'truncate text-text-muted'}>{selected?.label ?? placeholder}</span>
        <ChevronsUpDown className="size-4 shrink-0 text-text-muted" aria-hidden="true" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-surface p-2 shadow-dropdown">
          <Input
            ref={inputRef}
            value={search}
            onChange={(event) => { setSearch(event.target.value); setActiveIndex(0); }}
            placeholder={searchPlaceholder}
            aria-label={`Buscar: ${ariaLabel}`}
            role="combobox"
            aria-expanded={open}
            aria-controls={`${baseId}-listbox`}
            aria-activedescendant={activeOptionIndex >= 0 ? `${baseId}-option-${activeOptionIndex}` : undefined}
            aria-autocomplete="list"
            className="mb-2"
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === 'Escape') {
                event.stopPropagation();
                handleKeys(event);
              }
            }}
          />
          <ul id={`${baseId}-listbox`} role="listbox" aria-label={ariaLabel} className="max-h-56 overflow-y-auto">
            {filteredOptions.map((option, index) => {
              const optionIndex = enabledOptions.findIndex((item) => item.value === option.value);
              const isSelected = option.value === value;
              return (
                <li
                  key={option.value}
                  id={`${baseId}-option-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled || undefined}
                  tabIndex={-1}
                  className={cn(
                    'flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-left text-sm hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
                    optionIndex === activeIndex && 'bg-primary-soft',
                  )}
                  onMouseEnter={() => { if (!option.disabled) setActiveIndex(optionIndex); }}
                  onClick={() => choose(option)}
                >
                  <Check className={cn('size-4 shrink-0 text-primary', !isSelected && 'invisible')} aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block truncate">{option.label}</span>
                    {option.description && <span className="block truncate text-xs text-text-muted">{option.description}</span>}
                  </span>
                </li>
              );
            })}
          </ul>
          {filteredOptions.length === 0 && <p className="m-0 px-3 py-4 text-center text-sm text-text-muted">{emptyMessage}</p>}
        </div>
      )}
    </div>
  );
}
