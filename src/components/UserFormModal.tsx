import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { LoaderCircle, ShieldCheck, UserRound, X } from 'lucide-react';
import { createUserSchema, type UserFormValues } from '../schemas/userSchema';
import type { ManagedUser, User, UserRole } from '../types';
import { getErrorMessage, getFieldErrors } from '../utils/errors';

interface Props {
  user: ManagedUser | null;
  currentUser: User | null;
  pending: boolean;
  error: unknown;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => Promise<void>;
}

export default function UserFormModal({ user, currentUser, pending, error, onClose, onSubmit }: Props) {
  const isEditing = Boolean(user);
  const isEditingSelf = user?.id === currentUser?.id;
  const { register, handleSubmit, setError, formState: { errors, isDirty } } = useForm<UserFormValues>({
    resolver: zodResolver(createUserSchema(isEditing)),
    mode: 'onChange',
    defaultValues: {
      nome: user?.nome ?? '',
      email: user?.email ?? '',
      senha: '',
      perfil: user?.perfil ?? 'usuario',
    },
  });

  useEffect(() => {
    const fieldErrors = getFieldErrors(error);
    for (const field of ['nome', 'email', 'senha', 'perfil'] as const) {
      if (fieldErrors[field]) setError(field, { message: fieldErrors[field] });
    }
  }, [error, setError]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !pending) onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, pending]);

  function submit(values: UserFormValues) {
    const perfil: UserRole = isEditingSelf && user ? user.perfil : values.perfil;
    return onSubmit({
      ...values,
      nome: values.nome.trim(),
      email: values.email.trim(),
      senha: values.senha.trim(),
      perfil,
    });
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !pending) onClose(); }}>
      <section className="book-modal user-modal" role="dialog" aria-modal="true" aria-labelledby="user-modal-title">
        <div className="book-modal__header">
          <div className="book-modal__icon"><UserRound size={20} /></div>
          <div>
            <div className="eyebrow">{user ? 'ATUALIZAÇÃO DO CADASTRO' : 'NOVO CADASTRO'}</div>
            <h2 id="user-modal-title">{user ? 'Editar usuário' : 'Adicionar usuário'}</h2>
          </div>
          <button className="icon-button" onClick={onClose} disabled={pending} aria-label="Fechar formulário"><X size={19} /></button>
        </div>
        <form onSubmit={handleSubmit(submit)} noValidate>
          <div className="user-form-grid">
            <div className="form-field user-form-field--wide">
              <label className="field-label" htmlFor="user-nome">Nome completo</label>
              <input
                className={`text-input ${errors.nome ? 'text-input--error' : ''}`}
                id="user-nome"
                autoFocus
                maxLength={120}
                autoComplete="name"
                placeholder="Ex.: Marina Costa"
                {...register('nome')}
              />
              {errors.nome && <span className="field-error">{errors.nome.message}</span>}
            </div>
            <div className="form-field user-form-field--wide">
              <label className="field-label" htmlFor="user-email">E-mail</label>
              <input
                className={`text-input ${errors.email ? 'text-input--error' : ''}`}
                id="user-email"
                type="email"
                maxLength={180}
                autoComplete="email"
                placeholder="nome@biblioteca.com"
                {...register('email')}
              />
              {errors.email && <span className="field-error">{errors.email.message}</span>}
            </div>
            <div className="form-field user-form-field--wide">
              <label className="field-label" htmlFor="user-senha">{user ? 'Nova senha' : 'Senha'}</label>
              <input
                className={`text-input ${errors.senha ? 'text-input--error' : ''}`}
                id="user-senha"
                type="password"
                autoComplete="new-password"
                maxLength={100}
                placeholder={user ? 'Deixe em branco para manter a senha atual' : 'Mínimo de 8 caracteres'}
                {...register('senha')}
              />
              {errors.senha && <span className="field-error">{errors.senha.message}</span>}
            </div>
            <div className="form-field user-form-field--wide">
              <label className="field-label" htmlFor="user-perfil">Perfil de acesso</label>
              <select
                className={`text-input ${errors.perfil ? 'text-input--error' : ''}`}
                id="user-perfil"
                disabled={Boolean(isEditingSelf)}
                {...register('perfil')}
              >
                <option value="usuario">Usuário comum</option>
                <option value="admin">Administrador</option>
              </select>
              {isEditingSelf && <span className="field-hint"><ShieldCheck size={12} /> Seu próprio perfil administrativo não pode ser alterado.</span>}
              {errors.perfil && <span className="field-error">{errors.perfil.message}</span>}
            </div>
          </div>
          {Boolean(error) && Object.keys(getFieldErrors(error)).length === 0 && (
            <div className="form-alert" role="alert">{getErrorMessage(error, 'Não foi possível salvar o usuário.')}</div>
          )}
          <div className="book-modal__footer">
            <button className="button button--secondary" type="button" onClick={onClose} disabled={pending}>Cancelar</button>
            <button className="button button--primary" type="submit" disabled={pending || (Boolean(user) && !isDirty)}>
              {pending
                ? <><LoaderCircle size={17} className="spin" /> Salvando...</>
                : user ? 'Salvar alterações' : 'Adicionar usuário'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
