import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, Bookmark, BookOpen, CircleAlert, LibraryBig, Sparkles, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton } from '../components/ui/Skeleton';
import { relatoriosService } from '../services/api/relatoriosService';

export default function DashboardPage() {
  const { user } = useAuth();
  const summaryQuery = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: relatoriosService.resumo,
  });
  const isAdmin = user?.perfil === 'admin';
  const firstName = user?.nome.split(' ')[0] ?? 'bibliotecário';
  const numberFormat = new Intl.NumberFormat('pt-BR');
  const allStats = [
    {
      label: 'Livros no acervo',
      value: summaryQuery.data?.total_livros ?? 0,
      note: 'títulos cadastrados',
      icon: LibraryBig,
      iconClass: 'bg-primary-soft text-primary',
      to: '/livros',
    },
    {
      label: 'Livros emprestados',
      value: summaryQuery.data?.livros_emprestados ?? 0,
      note: 'exemplares em circulação',
      icon: BookOpen,
      iconClass: 'bg-warning-bg text-warning',
      to: '/emprestimos?status=ativo',
    },
    {
      label: 'Empréstimos atrasados',
      value: summaryQuery.data?.emprestimos_atrasados ?? 0,
      note: 'precisam de atenção',
      icon: CircleAlert,
      iconClass: 'bg-danger-bg text-danger',
      to: '/emprestimos?status=atrasado',
    },
    {
      label: 'Reservas pendentes',
      value: summaryQuery.data?.reservas_pendentes ?? 0,
      note: 'aguardando disponibilidade',
      icon: Bookmark,
      iconClass: 'bg-info-bg text-info',
      to: '/reservas?status=pendente',
    },
    {
      label: 'Usuários',
      value: summaryQuery.data?.usuarios ?? 0,
      note: 'cadastros ativos',
      icon: UsersRound,
      iconClass: 'bg-neutral-bg text-neutral',
      to: '/usuarios?status=ativo',
    },
  ];
  const stats = isAdmin ? allStats : allStats.slice(0, 1);

  return (
    <div className="grid gap-8">
      <section className="flex items-center justify-between gap-6 overflow-hidden rounded-lg bg-primary p-6 text-surface shadow-card sm:p-8" aria-labelledby="dashboard-title">
        <div className="min-w-0">
          <p className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-primary-soft">
            <Sparkles className="size-4" aria-hidden="true" />
            Seu espaço, suas histórias
          </p>
          <h1 id="dashboard-title" className="m-0 text-2xl font-bold leading-[1.25]">
            Bom dia, {firstName}.
          </h1>
          <p className="mb-0 mt-3 max-w-prose text-sm leading-6 text-primary-soft">
            Um acervo bem cuidado é um convite para descobrir novos mundos.
          </p>
        </div>
        <div className="hidden size-20 shrink-0 items-center justify-center rounded-lg bg-primary-hover text-primary-soft sm:flex">
          <BookOpen className="size-10" aria-hidden="true" />
        </div>
      </section>

      <section className="grid gap-4" aria-labelledby="dashboard-stats-title">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-text-muted">Acompanhamento</p>
            <h2 id="dashboard-stats-title" className="m-0 text-xl font-semibold leading-[1.3]">
              Biblioteca em números
            </h2>
          </div>
          <Link to="/livros" className="inline-flex min-h-11 items-center gap-1 rounded-md px-3 text-sm font-medium text-primary no-underline hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
            Ver acervo
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {summaryQuery.isPending && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5" role="status" aria-label="Carregando indicadores">
            {stats.map(({ label }) => (
              <Card key={label} className="grid min-h-40 content-between gap-4 p-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
              </Card>
            ))}
          </div>
        )}

        {summaryQuery.isError && (
          <ErrorState
            title="Não foi possível carregar os indicadores"
            description="Verifique a conexão e tente carregar o resumo novamente."
            onRetry={() => { void summaryQuery.refetch(); }}
          />
        )}

        {summaryQuery.isSuccess && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {stats.map(({ label, value, note, icon: Icon, iconClass, to }) => (
              <Link key={label} to={to} className="group block rounded-lg no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                <Card className="grid min-h-40 content-between gap-4 p-4 transition-colors group-hover:border-primary">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-sm font-medium text-text">{label}</span>
                    <span className={`grid size-11 shrink-0 place-items-center rounded-md ${iconClass}`}>
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                  </div>
                  <p className="m-0 text-2xl font-bold leading-[1.25]">{numberFormat.format(value)}</p>
                  <p className="m-0 text-xs text-text-muted">{note}</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center" aria-label="Acesso ao acervo">
        <Card className="flex items-center gap-4 p-4 sm:p-6">
          <span className="grid size-11 shrink-0 place-items-center rounded-md bg-primary-soft text-primary">
            <BookOpen className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="m-0 text-lg font-semibold leading-[1.35]">Seu acervo começa por aqui</h2>
            <p className="mb-0 mt-1 max-w-prose text-sm leading-6 text-text-muted">
              Consulte os títulos e encontre sua próxima leitura.
            </p>
          </div>
        </Card>
        <Link to="/livros" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-medium text-primary no-underline hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          Abrir acervo
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </section>

      <p className="m-0 text-xs leading-5 text-text-muted">
        Os indicadores são atualizados pela API conforme o acervo e as movimentações da biblioteca mudam.
      </p>
    </div>
  );
}
