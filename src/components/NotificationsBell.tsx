import { useEffect, useState } from 'react';
import { Bell, BellRing, BookOpen, CheckCircle2, Clock3, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/Dialog';
import { emprestimosService } from '../services/api/emprestimosService';
import type { LoanStatus, User } from '../types';

interface ReaderNotification {
  id: string;
  loanId: number;
  status: 'ativo' | 'recusado';
  bookTitle: string;
  read: boolean;
}

interface NotificationStore {
  statuses: Record<string, LoanStatus>;
  updates: ReaderNotification[];
}

const emptyStore: NotificationStore = { statuses: {}, updates: [] };

function readStore(userId: number): NotificationStore {
  const stored = localStorage.getItem(`acervo_notificacoes_${userId}`);
  return stored ? JSON.parse(stored) as NotificationStore : emptyStore;
}

function getNotificationHref(status: LoanStatus) {
  return `/emprestimos?status=${status}`;
}

export function NotificationsBell({ user }: { user: User }) {
  const isAdmin = user.perfil === 'admin';
  const [open, setOpen] = useState(false);
  const [store, setStore] = useState(() => readStore(user.id));
  const loansQuery = useQuery({
    queryKey: ['loans', 'notifications', user.id, user.perfil],
    queryFn: () => emprestimosService.listar({
      usuario_id: isAdmin ? undefined : user.id,
      status: isAdmin ? 'solicitado' : undefined,
      pagina: 1,
      por_pagina: 100,
      ordenar_por: 'data_emprestimo',
      ordem: 'desc',
    }),
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });

  const loans = loansQuery.data?.dados ?? [];
  const pendingLoans = isAdmin ? loans.filter((loan) => loan.status === 'solicitado') : [];
  const unreadUpdates = store.updates.filter((notification) => !notification.read);
  const notificationCount = isAdmin ? (loansQuery.data?.total ?? pendingLoans.length) : unreadUpdates.length;

  useEffect(() => {
    if (isAdmin || !loansQuery.data) return;

    const nextStatuses = { ...store.statuses };
    const updates = [...store.updates];
    let changed = false;

    for (const loan of loans) {
      const previousStatus = nextStatuses[String(loan.id)];
      if (previousStatus === 'solicitado' && (loan.status === 'ativo' || loan.status === 'recusado')) {
        const id = `${loan.id}:${loan.status}`;
        if (!updates.some((notification) => notification.id === id)) {
          updates.unshift({
            id,
            loanId: loan.id,
            status: loan.status,
            bookTitle: loan.livro_titulo,
            read: false,
          });
        }
      }
      if (previousStatus !== loan.status) {
        nextStatuses[String(loan.id)] = loan.status;
        changed = true;
      }
    }

    if (changed || updates.length !== store.updates.length) {
      const nextStore = { statuses: nextStatuses, updates: updates.slice(0, 50) };
      localStorage.setItem(`acervo_notificacoes_${user.id}`, JSON.stringify(nextStore));
      setStore(nextStore);
    }
  }, [isAdmin, loans, loansQuery.data, store, user.id]);

  function markAsRead(notificationId: string) {
    const nextStore = {
      ...store,
      updates: store.updates.map((notification) => (
        notification.id === notificationId ? { ...notification, read: true } : notification
      )),
    };
    localStorage.setItem(`acervo_notificacoes_${user.id}`, JSON.stringify(nextStore));
    setStore(nextStore);
    setOpen(false);
  }

  function markAllAsRead() {
    const nextStore = {
      ...store,
      updates: store.updates.map((notification) => ({ ...notification, read: true })),
    };
    localStorage.setItem(`acervo_notificacoes_${user.id}`, JSON.stringify(nextStore));
    setStore(nextStore);
  }

  const BellIcon = notificationCount > 0 ? BellRing : Bell;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="relative inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-primary transition-colors hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          aria-label={notificationCount ? `Notificações, ${notificationCount} ${isAdmin ? 'solicitações pendentes' : 'não lidas'}` : 'Notificações'}
        >
          <BellIcon className="size-5" aria-hidden="true" />
          {notificationCount > 0 && (
            <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-danger px-1 text-[11px] font-semibold leading-none text-white">
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          )}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md gap-5 rounded-2xl border-[#e4e9e4] p-5 sm:p-6">
        <DialogHeader>
          <DialogTitle>{isAdmin ? 'Solicitações para aprovar' : 'Notificações'}</DialogTitle>
          <DialogDescription>
            {isAdmin
              ? 'Acompanhe os pedidos de empréstimo que aguardam sua análise.'
              : 'Avisaremos aqui quando o administrador analisar suas solicitações.'}
          </DialogDescription>
        </DialogHeader>

        {loansQuery.isError ? (
          <div className="rounded-xl border border-danger/20 bg-danger-bg p-4 text-sm text-danger" role="alert">
            <p className="m-0 font-medium">Não foi possível atualizar as notificações.</p>
            <button className="mt-2 min-h-11 text-sm font-semibold underline" onClick={() => { void loansQuery.refetch(); }}>
              Tentar novamente
            </button>
          </div>
        ) : isAdmin ? (
          <div className="grid gap-3">
            {pendingLoans.length ? pendingLoans.slice(0, 5).map((loan) => (
              <Link
                key={loan.id}
                to={getNotificationHref('solicitado')}
                onClick={() => setOpen(false)}
                className="flex min-h-16 items-center gap-3 rounded-xl border border-border p-3 text-text no-underline transition-colors hover:bg-primary-soft"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Clock3 className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-sm">{loan.usuario_nome} solicitou um livro</strong>
                  <span className="block truncate text-xs text-text-muted">{loan.livro_titulo}</span>
                </span>
              </Link>
            )) : loansQuery.isLoading ? (
              <p className="m-0 rounded-xl bg-background p-4 text-sm text-text-muted">Verificando solicitações...</p>
            ) : (
              <p className="m-0 rounded-xl bg-background p-4 text-sm text-text-muted">Você está em dia. Não há solicitações aguardando aprovação.</p>
            )}
            {pendingLoans.length > 5 && (
              <p className="m-0 text-sm text-text-muted">E mais {pendingLoans.length - 5} solicitações.</p>
            )}
            {notificationCount > 0 && (
              <Link
                to={getNotificationHref('solicitado')}
                onClick={() => setOpen(false)}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white no-underline hover:bg-primary-hover"
              >
                Ver solicitações para aprovação
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-3">
            {unreadUpdates.length ? (
              <button className="min-h-11 justify-self-end text-sm font-medium text-primary underline" onClick={markAllAsRead}>
                Marcar todas como lidas
              </button>
            ) : null}
            {store.updates.length ? store.updates.map((notification) => {
              const approved = notification.status === 'ativo';
              const StatusIcon = approved ? CheckCircle2 : XCircle;
              return (
                <Link
                  key={notification.id}
                  to={getNotificationHref(notification.status)}
                  onClick={() => markAsRead(notification.id)}
                  className={`flex min-h-16 items-center gap-3 rounded-xl border border-border p-3 text-text no-underline transition-colors hover:bg-primary-soft ${notification.read ? 'opacity-70' : 'bg-primary-soft/40'}`}
                >
                  <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${approved ? 'bg-primary-soft text-primary' : 'bg-danger-bg text-danger'}`}>
                    <StatusIcon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block text-sm">{approved ? 'Empréstimo aprovado!' : 'Solicitação recusada'}</strong>
                    <span className="block truncate text-xs text-text-muted">
                      {approved ? 'Você já pode retirar ' : 'Não foi possível aprovar '}<span className="font-medium">{notification.bookTitle}</span>.
                    </span>
                  </span>
                  {!notification.read && <span className="size-2 shrink-0 rounded-full bg-primary" aria-label="Não lida" />}
                </Link>
              );
            }) : (
              <p className="m-0 rounded-xl bg-background p-4 text-sm text-text-muted">
                <BookOpen className="mr-2 inline size-4 align-[-3px]" aria-hidden="true" />
                Você ainda não tem novidades sobre suas solicitações.
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
