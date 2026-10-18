import { useMemo, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, CirclePlus, LoaderCircle, Pencil, Search, ShieldCheck, UserRound, UserRoundCheck, UserRoundX, UsersRound, X } from 'lucide-react';
import UserFormModal from '../components/UserFormModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { usuariosService, type UserCreateInput, type UserUpdateInput } from '../services/api/usuariosService';
import type { ManagedUser, UserFilters, UserRole } from '../types';
import { getErrorMessage } from '../utils/errors';
import type { UserFormValues } from '../schemas/userSchema';

const PAGE_SIZE = 8;

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [profile, setProfile] = useState<UserRole | ''>('');
  const [status, setStatus] = useState<UserFilters['status'] | ''>(() => {
    const initialStatus = searchParams.get('status');
    return initialStatus === 'ativo' || initialStatus === 'inativo' ? initialStatus : '';
  });
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<UserFilters['ordenar_por']>('nome');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [editing, setEditing] = useState<ManagedUser | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filters: UserFilters = useMemo(() => ({
    busca: search || undefined,
    perfil: profile || undefined,
    status: status || undefined,
    pagina: page,
    por_pagina: PAGE_SIZE,
    ordenar_por: sortBy,
    ordem: sortOrder,
  }), [search, profile, status, page, sortBy, sortOrder]);

  const usersQuery = useQuery({
    queryKey: ['users', filters],
    queryFn: () => usuariosService.listar(filters),
  });

  const saveMutation = useMutation({
    mutationFn: ({ id, values }: { id?: number; values: UserFormValues }) => {
      if (id) {
        const input: UserUpdateInput = {
          nome: values.nome,
          email: values.email,
          perfil: values.perfil,
          ativo: editing?.ativo ?? true,
        };
        if (values.senha) input.senha = values.senha;
        return usuariosService.atualizar(id, input);
      }
      const input: UserCreateInput = {
        nome: values.nome,
        email: values.email,
        senha: values.senha,
        perfil: values.perfil,
        ativo: true,
      };
      return usuariosService.criar(input);
    },
    onSuccess: async (savedUser, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
      if (savedUser.id === currentUser?.id) queryClient.setQueryData(['auth', 'me'], savedUser);
      setModalOpen(false);
      setEditing(null);
      setPage(1);
      if (!variables.id) {
        setSearch('');
        setSearchInput('');
        setProfile('');
        changeStatus('');
      }
      toast.success(variables.id ? 'Usuário atualizado com sucesso.' : 'Usuário cadastrado com sucesso.');
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ target, active }: { target: ManagedUser; active: boolean }) => {
      if (!active) return usuariosService.inativar(target.id);
      return usuariosService.atualizar(target.id, {
        nome: target.nome,
        email: target.email,
        perfil: target.perfil,
        ativo: true,
      });
    },
    onSuccess: async (updatedUser) => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
      if (updatedUser.id === currentUser?.id) queryClient.setQueryData(['auth', 'me'], updatedUser);
      if (!updatedUser.ativo && users.length === 1 && page > 1) setPage((value) => value - 1);
      toast.success(updatedUser.ativo ? 'Usuário reativado com sucesso.' : 'Usuário inativado com sucesso.');
    },
  });

  const users = usersQuery.data?.dados ?? [];
  const total = usersQuery.data?.total ?? 0;
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

  function changeProfile(value: string) {
    if (value === '' || value === 'admin' || value === 'usuario') setProfile(value);
    setPage(1);
  }

  function changeStatus(value: string) {
    const nextStatus = value === 'ativo' || value === 'inativo' ? value : '';
    setStatus(nextStatus);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (nextStatus) next.set('status', nextStatus);
      else next.delete('status');
      return next;
    }, { replace: true });
    setPage(1);
  }

  function changeSort(field: UserFilters['ordenar_por']) {
    if (sortBy === field) setSortOrder((order) => order === 'asc' ? 'desc' : 'asc');
    else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  }

  function openCreate() {
    saveMutation.reset();
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(target: ManagedUser) {
    saveMutation.reset();
    setEditing(target);
    setModalOpen(true);
  }

  async function changeUserStatus(target: ManagedUser) {
    if (target.id === currentUser?.id && target.ativo) {
      toast.error('Você não pode inativar sua própria conta enquanto estiver conectado.');
      return;
    }
    const active = !target.ativo;
    const action = active ? 'reativar' : 'inativar';
    try {
      await statusMutation.mutateAsync({ target, active });
    } catch (error) {
      toast.error(getErrorMessage(error, `Não foi possível ${action} o usuário.`));
    }
  }

  async function saveUser(values: UserFormValues) {
    try {
      await saveMutation.mutateAsync({ id: editing?.id, values });
    } catch {
      // Os erros da API são apresentados no próprio formulário.
    }
  }

  function sortIcon(field: UserFilters['ordenar_por']) {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />;
  }

  return (
    <div className="users-page">
      <div className="page-title-row">
        <div>
          <div className="eyebrow">ACESSO À BIBLIOTECA</div>
          <h1>Usuários<span>.</span></h1>
          <p className="page-subtitle">Gerencie leitores, equipe e permissões de acesso.</p>
        </div>
        <button className="button button--primary" onClick={openCreate}><CirclePlus size={18} /> Adicionar usuário</button>
      </div>

      <section className="catalog-card" aria-label="Cadastro de usuários">
        <div className="catalog-toolbar users-toolbar">
          <form className="catalog-search" onSubmit={submitSearch} role="search">
            <Search size={18} />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Buscar por nome ou e-mail..."
              aria-label="Buscar usuários"
            />
            {searchInput && <button type="button" className="icon-button search-clear" onClick={clearSearch} aria-label="Limpar busca"><X size={16} /></button>}
            <button className="search-submit" type="submit">Buscar</button>
          </form>
          <div className="users-filters">
            <label className="filter-select"><ShieldCheck size={16} /><span className="sr-only">Filtrar perfil</span>
              <select value={profile} onChange={(event) => changeProfile(event.target.value)}>
                <option value="">Todos os perfis</option>
                <option value="admin">Administradores</option>
                <option value="usuario">Usuários comuns</option>
              </select>
            </label>
            <label className="filter-select"><UserRound size={16} /><span className="sr-only">Filtrar status</span>
              <select value={status} onChange={(event) => changeStatus(event.target.value)}>
                <option value="">Todos os status</option>
                <option value="ativo">Ativos</option>
                <option value="inativo">Inativos</option>
              </select>
            </label>
          </div>
          <div className="authors-total users-total"><UsersRound size={16} /><span><strong>{total}</strong> {status === 'inativo' ? 'usuários inativos' : search || profile ? 'resultados' : (total === 1 ? 'usuário cadastrado' : 'usuários cadastrados')}</span></div>
        </div>

        <div className="table-wrap">
          <table className="users-table">
            <thead>
              <tr>
                <th><button className="table-sort" onClick={() => changeSort('nome')}>USUÁRIO {sortIcon('nome')}</button></th>
                <th><button className="table-sort" onClick={() => changeSort('email')}>E-MAIL {sortIcon('email')}</button></th>
                <th><button className="table-sort" onClick={() => changeSort('perfil')}>PERFIL {sortIcon('perfil')}</button></th>
                <th>STATUS</th>
                <th><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {usersQuery.isLoading && Array.from({ length: 5 }, (_, index) => (
                <tr className="skeleton-row" key={`skeleton-${index}`}><td><span /></td><td><span /></td><td><span /></td><td><span /></td><td /></tr>
              ))}
              {!usersQuery.isLoading && usersQuery.isError && (
                <tr><td colSpan={5}>
                  <div className="table-state table-state--error">
                    <strong>Não foi possível carregar os usuários.</strong>
                    <button className="text-link" onClick={() => usersQuery.refetch()}>Tentar novamente</button>
                  </div>
                </td></tr>
              )}
              {!usersQuery.isLoading && !usersQuery.isError && users.length === 0 && (
                <tr><td colSpan={5}>
                  <div className="table-state">
                    <div className="empty-icon"><UsersRound size={23} /></div>
                    <strong>Nenhum usuário encontrado</strong>
                    <span>{search || profile || status ? 'Tente ajustar ou limpar os filtros.' : 'Cadastre os usuários que terão acesso à biblioteca.'}</span>
                    {(search || profile || status) && <button className="text-link" onClick={() => { clearSearch(); setProfile(''); changeStatus(''); }}>Limpar filtros</button>}
                  </div>
                </td></tr>
              )}
              {!usersQuery.isLoading && !usersQuery.isError && users.map((target) => {
                const initials = target.nome.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toLocaleUpperCase('pt-BR');
                const isCurrentUser = target.id === currentUser?.id;
                return (
                  <tr key={target.id} className={!target.ativo ? 'user-row--inactive' : ''}>
                    <td>
                      <div className="user-info">
                        <div className={`user-avatar ${!target.ativo ? 'user-avatar--inactive' : ''}`} aria-hidden="true">{initials}</div>
                        <div><strong className="user-name">{target.nome}</strong>{isCurrentUser && <span className="user-you-tag">VOCÊ</span>}</div>
                      </div>
                    </td>
                    <td className="user-email">{target.email}</td>
                    <td><span className={`user-role-badge ${target.perfil === 'admin' ? 'user-role-badge--admin' : ''}`}>{target.perfil === 'admin' ? 'Administrador' : 'Usuário comum'}</span></td>
                    <td><span className={`user-status-badge ${target.ativo ? 'user-status-badge--active' : 'user-status-badge--inactive'}`}><span />{target.ativo ? 'Ativo' : 'Inativo'}</span></td>
                    <td>
                      <div className="row-actions">
                        <button className="icon-button row-action" onClick={() => openEdit(target)} aria-label={`Editar ${target.nome}`} title="Editar"><Pencil size={16} /></button>
                        <ConfirmDialog
                          trigger={<button
                            className={`icon-button row-action ${target.ativo ? 'row-action--delete' : 'row-action--activate'}`}
                            disabled={statusMutation.isPending || (isCurrentUser && target.ativo)}
                            aria-label={target.ativo ? `Inativar ${target.nome}` : `Reativar ${target.nome}`}
                            title={target.ativo ? (isCurrentUser ? 'Não é possível inativar sua própria conta' : 'Inativar usuário') : 'Reativar usuário'}
                          >
                            {target.ativo ? <UserRoundX size={16} /> : <UserRoundCheck size={16} />}
                          </button>}
                          title={target.ativo ? 'Inativar acesso?' : 'Reativar acesso?'}
                          description={target.ativo
                            ? `${target.nome} não poderá mais entrar na biblioteca. O histórico de empréstimos será preservado.`
                            : `${target.nome} poderá voltar a acessar a biblioteca com a conta cadastrada.`}
                          confirmLabel={target.ativo ? 'Inativar usuário' : 'Reativar usuário'}
                          destructive={target.ativo}
                          pending={statusMutation.isPending}
                          onConfirm={() => changeUserStatus(target)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="catalog-footer">
          <span>Mostrando <strong>{firstResult}–{lastResult}</strong> de <strong>{usersQuery.data?.total ?? '—'}</strong> usuários</span>
          <div className="pagination">
            <button className="icon-button pagination__button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page <= 1} aria-label="Página anterior"><ChevronLeft size={17} /></button>
            <span>Página <strong>{page}</strong> de <strong>{totalPages}</strong></span>
            <button className="icon-button pagination__button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={page >= totalPages} aria-label="Próxima página"><ChevronRight size={17} /></button>
          </div>
        </div>
      </section>
      {modalOpen && (
        <UserFormModal
          user={editing}
          currentUser={currentUser}
          pending={saveMutation.isPending}
          error={saveMutation.error}
          onClose={() => { if (!saveMutation.isPending) setModalOpen(false); }}
          onSubmit={saveUser}
        />
      )}
      {statusMutation.isPending && <div className="saving-indicator"><LoaderCircle size={16} className="spin" /> Atualizando usuários...</div>}
    </div>
  );
}
