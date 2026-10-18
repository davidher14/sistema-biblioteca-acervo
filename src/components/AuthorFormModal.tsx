import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { LoaderCircle, UserRound, X } from 'lucide-react';
import { authorSchema, type AuthorFormValues } from '../schemas/authorSchema';
import type { Author } from '../types';
import { getErrorMessage, getFieldErrors } from '../utils/errors';

interface Props {
  author: Author | null;
  pending: boolean;
  error: unknown;
  onClose: () => void;
  onSubmit: (nome: string) => Promise<void>;
}

export default function AuthorFormModal({ author, pending, error, onClose, onSubmit }: Props) {
  const { register, handleSubmit, setError, formState: { errors, isDirty } } = useForm<AuthorFormValues>({
    resolver: zodResolver(authorSchema),
    mode: 'onChange',
    defaultValues: { nome: author?.nome ?? '' },
  });

  useEffect(() => {
    const fieldErrors = getFieldErrors(error);
    if (fieldErrors.nome) setError('nome', { message: fieldErrors.nome });
  }, [error, setError]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !pending) onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, pending]);

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !pending) onClose(); }}>
      <section className="book-modal author-modal" role="dialog" aria-modal="true" aria-labelledby="author-modal-title">
        <div className="book-modal__header">
          <div className="book-modal__icon"><UserRound size={20} /></div>
          <div>
            <div className="eyebrow">{author ? 'ATUALIZAÇÃO DO CADASTRO' : 'NOVO CADASTRO'}</div>
            <h2 id="author-modal-title">{author ? 'Editar autor' : 'Adicionar autor'}</h2>
          </div>
          <button className="icon-button" onClick={onClose} disabled={pending} aria-label="Fechar formulário"><X size={19} /></button>
        </div>
        <form onSubmit={handleSubmit(({ nome }) => onSubmit(nome.trim()))} noValidate>
          <div className="form-field">
            <label className="field-label" htmlFor="author-nome">Nome do(a) autor(a)</label>
            <input
              className={`text-input ${errors.nome ? 'text-input--error' : ''}`}
              id="author-nome"
              autoFocus
              maxLength={120}
              placeholder="Ex.: Machado de Assis"
              {...register('nome')}
            />
            {errors.nome && <span className="field-error">{errors.nome.message}</span>}
          </div>
          {Boolean(error) && Object.keys(getFieldErrors(error)).length === 0 && (
            <div className="form-alert" role="alert">{getErrorMessage(error, 'Não foi possível salvar o autor.')}</div>
          )}
          <div className="book-modal__footer">
            <button className="button button--secondary" type="button" onClick={onClose} disabled={pending}>Cancelar</button>
            <button className="button button--primary" type="submit" disabled={pending || (Boolean(author) && !isDirty)}>
              {pending
                ? <><LoaderCircle size={17} className="spin" /> Salvando...</>
                : author ? 'Salvar alterações' : 'Adicionar autor'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
