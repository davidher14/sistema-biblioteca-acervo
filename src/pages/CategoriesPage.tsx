import { useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, CirclePlus, Layers3, LoaderCircle, Pencil, Search, Trash2, X } from 'lucide-react';
import CategoryFormModal from '../components/CategoryFormModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { categoriasService, type CategoryInput } from '../services/api/categoriasService';
import type { Category, CategoryFilters } from '../types';
import { getErrorMessage } from '../utils/errors';

const PAGE_SIZE = 8;

export default function CategoriesPage() {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const isAdmin = user?.perfil === 'admin';
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [editing, setEditing] = useState<Category | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filters: CategoryFilters = useMemo(() => ({
    busca: search || undefined,
    pagina: page,
    por_pagina: PAGE_SIZE,
    ordenar_por: 'nome',
    ordem: sortOrder,
  }), [search, page, sortOrder]);

  const categoriesQuery = useQuery({
    queryKey: ['categories', filters],
    queryFn: () => categoriasService.listar(filters),
  });

  const saveMutation = useMutation({
    mutationFn: ({ id, input }: { id?: number; input: CategoryInput }) => id
      ? categoriasService.atualizar(id, input)
      : categoriasService.criar(input),
    onSuccess: async (_category, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['categories'] }),
        queryClient.invalidateQueries({ queryKey: ['books'] }),
      ]);
      setModalOpen(false);
      setEditing(null);
      setPage(1);
      if (!variables.id) {
        setSearch('');
        setSearchInput('');
      }
      toast.success(variables.id ? 'Categoria atualizada com sucesso.' : 'Categoria cadastrada com sucesso.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: categoriasService.excluir,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
      if (categories.length === 1 && page > 1) setPage((current) => current - 1);
      toast.success('Categoria removida com sucesso.');
    },
  });

  const categories = categoriesQuery.data?.dados ?? [];
  const total = categoriesQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const firstResult = total ? (page - 1) * PAGE_SIZE + 1 : 0;
  const lastResult = Math.min(page * PAGE_SIZE, total);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  }

  function clearSearch() {
    setSearch('');
    setSearchInput('');
    setPage(1);
  }

  function openCreate() {
    saveMutation.reset();
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(category: Category) {
    saveMutation.reset();
    setEditing(category);
    setModalOpen(true);
  }

  async function removeCategory(category: Category) {
    try {
      await deleteMutation.mutateAsync(category.id);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Não foi possível excluir a categoria.'));
    }
  }

  async function saveCategory(input: CategoryInput) {
    try {
      await saveMutation.mutateAsync({ id: editing?.id, input });
    } catch {
      // Os erros da API são apresentados no próprio formulário.
    }
  }

  return (
    <div className="categories-page">
      <div className="page-title-row">
        <div>
          <div className="eyebrow">ORGANIZAÇÃO DO ACERVO</div>
          <h1>Categorias<span>.</span></h1>
          <p className="page-subtitle">Agrupe os livros por assunto e mantenha o catálogo organizado.</p>
        </div>
        {isAdmin && <button className="button button--primary" onClick={openCreate}><CirclePlus size={18} /> Adicionar categoria</button>}
      </div>

      <section className="catalog-card" aria-label="Catálogo de categorias">
        <div className="catalog-toolbar authors-toolbar">
          <form className="catalog-search" onSubmit={submitSearch} role="search">
            <Search size={18} />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Buscar por nome ou descrição..."
              aria-label="Buscar categorias"
            />
            {searchInput && <button type="button" className="icon-button search-clear" onClick={clearSearch} aria-label="Limpar busca"><X size={16} /></button>}
            <button className="search-submit" type="submit">Buscar</button>
          </form>
          <div className="authors-total"><Layers3 size={16} /><span><strong>{total}</strong> {search ? (total === 1 ? 'resultado' : 'resultados') : (total === 1 ? 'categoria cadastrada' : 'categorias cadastradas')}</span></div>
        </div>

        <div className="table-wrap">
          <table className="categories-table">
            <thead>
              <tr>
                <th>
                  <button className="table-sort" onClick={() => setSortOrder((order) => order === 'asc' ? 'desc' : 'asc')}>
                    CATEGORIA {sortOrder === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
                  </button>
                </th>
                <th>DESCRIÇÃO</th>
                {isAdmin && <th><span className="sr-only">Ações</span></th>}
              </tr>
            </thead>
            <tbody>
              {categoriesQuery.isLoading && Array.from({ length: 5 }, (_, index) => (
                <tr className="skeleton-row" key={`skeleton-${index}`}><td><span /></td><td><span /></td>{isAdmin && <td />}</tr>
              ))}
              {!categoriesQuery.isLoading && categoriesQuery.isError && (
                <tr><td colSpan={isAdmin ? 3 : 2}>
                  <div className="table-state table-state--error">
                    <strong>Não foi possível carregar as categorias.</strong>
                    <button className="text-link" onClick={() => categoriesQuery.refetch()}>Tentar novamente</button>
                  </div>
                </td></tr>
              )}
              {!categoriesQuery.isLoading && !categoriesQuery.isError && categories.length === 0 && (
                <tr><td colSpan={isAdmin ? 3 : 2}>
                  <div className="table-state">
                    <div className="empty-icon"><Layers3 size={23} /></div>
                    <strong>Nenhuma categoria encontrada</strong>
                    <span>{search ? 'Tente ajustar a busca ou limpar o filtro.' : 'Cadastre categorias para organizar os livros do acervo.'}</span>
                    {search && <button className="text-link" onClick={clearSearch}>Limpar busca</button>}
                  </div>
                </td></tr>
              )}
              {!categoriesQuery.isLoading && !categoriesQuery.isError && categories.map((category) => (
                <tr key={category.id}>
                  <td>
                    <div className="category-info">
                      <div className="category-avatar" aria-hidden="true"><Layers3 size={16} /></div>
                      <strong className="category-name">{category.nome}</strong>
                    </div>
                  </td>
                  <td><span className={`category-description-cell ${category.descricao ? '' : 'category-description-cell--empty'}`}>{category.descricao || 'Sem descrição'}</span></td>
                  {isAdmin && <td>
                    <div className="row-actions">
                      <button className="icon-button row-action" onClick={() => openEdit(category)} aria-label={`Editar ${category.nome}`} title="Editar"><Pencil size={16} /></button>
                      <ConfirmDialog
                        trigger={<button className="icon-button row-action row-action--delete" disabled={deleteMutation.isPending} aria-label={`Excluir ${category.nome}`} title="Excluir"><Trash2 size={16} /></button>}
                        title="Excluir categoria?"
                        description={`“${category.nome}” será removida. Categorias associadas a livros não podem ser excluídas.`}
                        confirmLabel="Excluir categoria"
                        destructive
                        pending={deleteMutation.isPending}
                        onConfirm={() => removeCategory(category)}
                      />
                    </div>
                  </td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="catalog-footer">
          <span>Mostrando <strong>{firstResult}–{lastResult}</strong> de <strong>{categoriesQuery.data?.total ?? '—'}</strong> categorias</span>
          <div className="pagination">
            <button className="icon-button pagination__button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1} aria-label="Página anterior"><ChevronLeft size={17} /></button>
            <span>Página <strong>{page}</strong> de <strong>{totalPages}</strong></span>
            <button className="icon-button pagination__button" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page >= totalPages} aria-label="Próxima página"><ChevronRight size={17} /></button>
          </div>
        </div>
      </section>
      {!isAdmin && <p className="reader-hint"><Layers3 size={15} /> Você está no modo leitor. Consulte as categorias cadastradas na biblioteca.</p>}
      {modalOpen && (
        <CategoryFormModal
          category={editing}
          pending={saveMutation.isPending}
          error={saveMutation.error}
          onClose={() => { if (!saveMutation.isPending) setModalOpen(false); }}
          onSubmit={saveCategory}
        />
      )}
      {deleteMutation.isPending && <div className="saving-indicator"><LoaderCircle size={16} className="spin" /> Atualizando categorias...</div>}
    </div>
  );
}
