import { useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowLeftRight, ArrowUp, ArrowUpDown, BookOpen, Bookmark, ChevronLeft, ChevronRight, CirclePlus, LoaderCircle, Pencil, Search, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui';
import BookFormModal from '../components/BookFormModal';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { livrosService, type BookInput } from '../services/api/livrosService';
import { emprestimosService } from '../services/api/emprestimosService';
import type { Book, BookFilters } from '../types';
import { getErrorMessage } from '../utils/errors';

const PAGE_SIZE = 8;

export default function BooksPage() {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const isAdmin = user?.perfil === 'admin';
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [availability, setAvailability] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<BookFilters['ordenar_por']>('titulo');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [editing, setEditing] = useState<Book | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filters: BookFilters = useMemo(() => ({
    busca: search || undefined,
    categoria: category || undefined,
    disponibilidade: availability ? availability as BookFilters['disponibilidade'] : undefined,
    pagina: page,
    por_pagina: PAGE_SIZE,
    ordenar_por: sortBy,
    ordem: sortOrder,
  }), [search, category, availability, page, sortBy, sortOrder]);

  const booksQuery = useQuery({
    queryKey: ['books', filters],
    queryFn: () => livrosService.listar(filters),
  });

  const saveMutation = useMutation({
    mutationFn: ({ id, input }: { id?: number; input: BookInput }) => id ? livrosService.atualizar(id, input) : livrosService.criar(input),
    onSuccess: async (_book, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['books'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ]);
      setModalOpen(false);
      setEditing(null);
      toast.success(variables.id ? 'Livro atualizado com sucesso.' : 'Livro cadastrado com sucesso.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: livrosService.excluir,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['books'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ]);
      if (booksQuery.data?.dados.length === 1 && page > 1) setPage((current) => current - 1);
      toast.success('Livro removido do acervo.');
    },
  });

  const requestMutation = useMutation({
    mutationFn: emprestimosService.solicitar,
    onSuccess: async (loan) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['books'] }),
        queryClient.invalidateQueries({ queryKey: ['loans'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ]);
      toast.success(`Solicitação de “${loan.livro_titulo}” enviada para aprovação.`);
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Não foi possível solicitar o empréstimo.')),
  });

  const myLoansQuery = useQuery({
    queryKey: ['loans', 'reader', user?.id],
    queryFn: () => emprestimosService.listar({
      usuario_id: user?.id,
      pagina: 1,
      por_pagina: 100,
      ordenar_por: 'data_emprestimo',
      ordem: 'desc',
    }),
    enabled: Boolean(user && !isAdmin),
  });

  const data = booksQuery.data;
  const books = data?.dados ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));
  const categories = [...new Set([...(data?.categorias ?? []), ...books.map((book) => book.categoria)])].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const hasFilters = Boolean(search || category || availability);
  const firstResult = data?.total ? (page - 1) * PAGE_SIZE + 1 : 0;
  const lastResult = data ? Math.min(page * PAGE_SIZE, data.total) : 0;
  const readerLoanByBook = new Map(
    (myLoansQuery.data?.dados ?? [])
      .filter((loan) => loan.status === 'solicitado' || loan.status === 'ativo' || loan.status === 'atrasado')
      .map((loan) => [loan.livro_id, loan.status]),
  );

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  }

  function updateSort(field: BookFilters['ordenar_por']) {
    if (sortBy === field) setSortOrder((current) => current === 'asc' ? 'desc' : 'asc');
    else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  }

  function sortIcon(field: BookFilters['ordenar_por']) {
    if (sortBy !== field) return <ArrowUpDown className="size-4" aria-hidden="true" />;
    return sortOrder === 'asc'
      ? <ArrowUp className="size-4" aria-hidden="true" />
      : <ArrowDown className="size-4" aria-hidden="true" />;
  }

  function clearFilters() {
    setSearchInput('');
    setSearch('');
    setCategory('');
    setAvailability('');
    setPage(1);
  }

  function openCreate() {
    saveMutation.reset();
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(book: Book) {
    saveMutation.reset();
    setEditing(book);
    setModalOpen(true);
  }

  async function removeBook(book: Book) {
    try {
      await deleteMutation.mutateAsync(book.id);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Não foi possível excluir o livro.'));
    }
  }

  async function saveBook(input: BookInput) {
    try {
      await saveMutation.mutateAsync({ id: editing?.id, input });
    } catch {
      // Os erros da API são apresentados no próprio formulário.
    }
  }

  return (
    <div className="mx-auto w-full max-w-screen-2xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">Catálogo da biblioteca</p>
          <h1 className="m-0 text-2xl font-bold leading-tight text-text">Acervo de livros</h1>
          <p className="mb-0 mt-2 max-w-prose text-base leading-6 text-text-muted">Encontre títulos e confira a disponibilidade do acervo.</p>
        </div>
        {isAdmin && (
          <Button onClick={openCreate} className="w-full shrink-0 sm:w-auto">
            <CirclePlus className="size-4" aria-hidden="true" />
            Adicionar livro
          </Button>
        )}
      </header>

      <Card className="overflow-hidden">
        <CardHeader className="gap-4 border-b border-border p-4 sm:p-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Catálogo</CardTitle>
            <p className="m-0 text-sm text-text-muted" aria-live="polite">
              {data ? `${data.total} ${data.total === 1 ? 'título' : 'títulos'}` : ' '}
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(16rem,1fr)_auto_auto_auto]">
            <form className="flex min-w-0 flex-col gap-2 sm:flex-row" role="search" aria-label="Buscar no acervo" onSubmit={submitSearch}>
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
                <Input
                  className="pl-10"
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Título, autor, categoria ou ISBN"
                  aria-label="Buscar livros por título, autor, categoria ou ISBN"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 sm:flex-none">Buscar</Button>
                {searchInput && (
                  <Button type="button" variant="secondary" size="icon" onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }} aria-label="Limpar busca">
                    <X className="size-4" aria-hidden="true" />
                  </Button>
                )}
              </div>
            </form>

            <Select value={category || 'todas'} onValueChange={(value) => { setCategory(value === 'todas' ? '' : value); setPage(1); }}>
              <SelectTrigger aria-label="Filtrar por categoria" className="w-full lg:w-56">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as categorias</SelectItem>
                {categories.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={availability || 'todas'} onValueChange={(value) => { setAvailability(value === 'todas' ? '' : value); setPage(1); }}>
              <SelectTrigger aria-label="Filtrar por disponibilidade" className="w-full lg:w-56">
                <SelectValue placeholder="Toda disponibilidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Toda disponibilidade</SelectItem>
                <SelectItem value="disponivel">Disponíveis</SelectItem>
                <SelectItem value="indisponivel">Indisponíveis</SelectItem>
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button type="button" variant="ghost" onClick={clearFilters} className="w-full lg:w-auto">
                Limpar filtros
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table className="min-w-[920px]">
            <TableHeader>
              <TableRow className="hover:bg-primary-soft">
                <TableHead aria-sort={sortBy === 'titulo' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-sm font-medium text-text-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus" onClick={() => updateSort('titulo')} aria-label={`Ordenar por título${sortBy === 'titulo' ? (sortOrder === 'asc' ? ', crescente' : ', decrescente') : ''}`}>
                    Livro {sortIcon('titulo')}
                  </button>
                </TableHead>
                <TableHead aria-sort={sortBy === 'autor' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-sm font-medium text-text-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus" onClick={() => updateSort('autor')} aria-label={`Ordenar por autor${sortBy === 'autor' ? (sortOrder === 'asc' ? ', crescente' : ', decrescente') : ''}`}>
                    Autor {sortIcon('autor')}
                  </button>
                </TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead aria-sort={sortBy === 'ano' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-sm font-medium text-text-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus" onClick={() => updateSort('ano')} aria-label={`Ordenar por ano${sortBy === 'ano' ? (sortOrder === 'asc' ? ', crescente' : ', decrescente') : ''}`}>
                    Ano {sortIcon('ano')}
                  </button>
                </TableHead>
                <TableHead>Disponibilidade</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {booksQuery.isLoading && Array.from({ length: 5 }, (_, index) => (
                <TableRow key={`skeleton-${index}`} className="hover:bg-surface">
                  <TableCell><div className="flex items-center gap-3"><Skeleton className="aspect-[2/3] w-12 shrink-0" /><div className="grid flex-1 gap-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div></div></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-7 w-36" /></TableCell>
                  <TableCell />
                </TableRow>
              ))}

              {!booksQuery.isLoading && booksQuery.isError && (
                <TableRow className="hover:bg-surface">
                  <TableCell colSpan={6} className="p-0">
                    <ErrorState description={getErrorMessage(booksQuery.error, 'Verifique sua conexão e tente novamente.')} onRetry={() => { void booksQuery.refetch(); }} />
                  </TableCell>
                </TableRow>
              )}

              {!booksQuery.isLoading && !booksQuery.isError && books.length === 0 && (
                <TableRow className="hover:bg-surface">
                  <TableCell colSpan={6} className="p-0">
                    <EmptyState
                      icon={<BookOpen className="size-8" />}
                      title="Nenhum livro encontrado"
                      description={hasFilters ? 'Ajuste ou limpe os filtros para consultar outros títulos.' : 'O acervo ainda não tem livros cadastrados.'}
                      action={hasFilters
                        ? <Button variant="secondary" onClick={clearFilters}>Limpar filtros</Button>
                        : isAdmin
                          ? <Button onClick={openCreate}><CirclePlus className="size-4" aria-hidden="true" />Adicionar primeiro livro</Button>
                          : undefined}
                    />
                  </TableCell>
                </TableRow>
              )}

              {!booksQuery.isLoading && !booksQuery.isError && books.map((book) => {
                const available = book.quantidade_disponivel > 0;
                return (
                  <TableRow key={book.id}>
                    <TableCell className="min-w-64">
                      <div className="flex items-center gap-3">
                        <div className="grid aspect-[2/3] w-12 shrink-0 place-items-center rounded-sm border border-border bg-primary-soft text-primary" role="img" aria-label={`Capa indisponível para ${book.titulo}`}>
                          <BookOpen className="size-5" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <p className="m-0 line-clamp-2 font-medium leading-5 text-text">{book.titulo}</p>
                          <p className="m-0 mt-1 text-xs text-text-muted">ISBN {book.isbn}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{book.autor}</TableCell>
                    <TableCell><span className="inline-flex rounded-sm bg-primary-soft px-2 py-1 text-xs font-medium text-primary">{book.categoria}</span></TableCell>
                    <TableCell className="tabular-nums">{book.ano}</TableCell>
                    <TableCell>
                      <div className="grid justify-items-start gap-1">
                        <Badge status={available ? 'available' : 'unavailable'} />
                        <span className="text-xs text-text-muted">{book.quantidade_disponivel} de {book.quantidade_total} disponíveis</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isAdmin ? (
                        <div className="flex min-w-max items-center justify-end gap-2">
                          <Button asChild size="sm" className="px-3">
                            <Link to="/emprestimos" state={{ livro: book }} aria-label={`${available ? 'Emprestar' : 'Reservar'} ${book.titulo}`}>
                              {available
                                ? <ArrowLeftRight className="size-4" aria-hidden="true" />
                                : <Bookmark className="size-4" aria-hidden="true" />}
                              {available ? 'Emprestar' : 'Reservar'}
                            </Link>
                          </Button>
                          <Button variant="secondary" size="icon" onClick={() => openEdit(book)} aria-label={`Editar ${book.titulo}`}>
                            <Pencil className="size-4" aria-hidden="true" />
                          </Button>
                          <ConfirmDialog
                            trigger={<Button variant="danger" size="icon" disabled={deleteMutation.isPending} aria-label={`Excluir ${book.titulo}`}><Trash2 className="size-4" aria-hidden="true" /></Button>}
                            title="Excluir livro do acervo?"
                            description={`“${book.titulo}” será removido do catálogo. Esta ação não pode ser desfeita.`}
                            confirmLabel="Excluir livro"
                            destructive
                            pending={deleteMutation.isPending}
                            onConfirm={() => removeBook(book)}
                          />
                        </div>
                      ) : (
                        <div className="flex justify-end">
                          {readerLoanByBook.get(book.id) === 'solicitado' ? (
                            <Badge status="pending" label="Aguardando aprovação" />
                          ) : readerLoanByBook.has(book.id) ? (
                            <span className="whitespace-nowrap text-xs font-medium text-text-muted">Em empréstimo</span>
                          ) : (
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={!available || requestMutation.isPending || myLoansQuery.isPending || myLoansQuery.isError}
                              onClick={() => requestMutation.mutate(book.id)}
                              aria-label={`Solicitar empréstimo de ${book.titulo}`}
                            >
                              {requestMutation.isPending && requestMutation.variables === book.id
                                ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                                : <ArrowLeftRight className="size-4" aria-hidden="true" />}
                              {available ? 'Solicitar' : 'Indisponível'}
                            </Button>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>

        <footer className="flex flex-col gap-3 border-t border-border px-4 py-3 text-sm text-text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="m-0" aria-live="polite">
            Mostrando <strong className="font-medium text-text">{firstResult}–{lastResult}</strong> de <strong className="font-medium text-text">{data?.total ?? '—'}</strong> livros
          </p>
          <nav className="flex items-center justify-between gap-3 sm:justify-end" aria-label="Paginação do acervo">
            <Button variant="secondary" size="icon" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1 || booksQuery.isLoading} aria-label="Página anterior">
              <ChevronLeft className="size-4" aria-hidden="true" />
            </Button>
            <span className="whitespace-nowrap">Página <strong className="font-medium text-text">{page}</strong> de <strong className="font-medium text-text">{totalPages}</strong></span>
            <Button variant="secondary" size="icon" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page >= totalPages || booksQuery.isLoading} aria-label="Próxima página">
              <ChevronRight className="size-4" aria-hidden="true" />
            </Button>
          </nav>
        </footer>
      </Card>

      {!isAdmin && (
        <p className="m-0 flex items-start gap-2 text-sm leading-6 text-text-muted">
          <BookOpen className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />
          Você está no modo leitor. Consulte os títulos e a disponibilidade do acervo.
        </p>
      )}
      {!isAdmin && myLoansQuery.isError && (
        <ErrorState
          title="Não foi possível verificar seus empréstimos"
          description={getErrorMessage(myLoansQuery.error, 'Tente novamente antes de enviar outra solicitação.')}
          onRetry={() => { void myLoansQuery.refetch(); }}
        />
      )}

      {modalOpen && (
        <BookFormModal
          book={editing}
          pending={saveMutation.isPending}
          error={saveMutation.error}
          onClose={() => { if (!saveMutation.isPending) setModalOpen(false); }}
          onSubmit={saveBook}
        />
      )}
    </div>
  );
}
