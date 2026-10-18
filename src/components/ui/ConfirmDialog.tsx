import { useState } from 'react';
import { AlertTriangle, Check, type LucideIcon } from 'lucide-react';
import { Button } from './Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './Dialog';

interface ConfirmDialogProps {
  trigger: React.ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  pending?: boolean;
  icon?: LucideIcon;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  destructive = false,
  pending = false,
  icon,
  onConfirm,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const Icon = icon ?? (destructive ? AlertTriangle : Check);
  async function confirm() {
    await onConfirm();
    setOpen(false);
  }
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!pending) setOpen(nextOpen); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md gap-5 rounded-2xl border-[#e4e9e4] p-5 sm:p-6">
        <DialogHeader className="items-center gap-3 pr-8 text-center sm:items-start sm:text-left">
          <span className={`grid size-12 place-items-center rounded-2xl ${destructive ? 'bg-danger-bg text-danger' : 'bg-primary-soft text-primary'}`}>
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div className="grid gap-2">
            <DialogTitle className="text-lg font-semibold tracking-tight">{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:pt-1">
          <Button variant="secondary" className="rounded-xl" onClick={() => setOpen(false)} disabled={pending}>{cancelLabel}</Button>
          <Button variant={destructive ? 'danger' : 'primary'} className="rounded-xl" onClick={() => { void confirm(); }} disabled={pending}>
            {pending ? 'Aguarde...' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
