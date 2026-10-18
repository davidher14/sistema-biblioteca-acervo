import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Layers3, LoaderCircle, X } from 'lucide-react';
import { categorySchema, type CategoryFormValues } from '../schemas/categorySchema';
import type { Category } from '../types';
import { getErrorMessage, getFieldErrors } from '../utils/errors';

interface Props {
  category: Category | null;
  pending: boolean;
  error: unknown;
  onClose: () => void;
  onSubmit: (input: Omit<Category, 'id'>) => Promise<void>;
}

export default function CategoryFormModal({ category, pending, error, onClose, onSubmit }: Props) {
  const { register, handleSubmit, setError, formState: { errors, isDirty } } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    mode: 'onChange',
    defaultValues: { nome: category?.nome ?? '', descricao: category?.descricao ?? '' },
  });

  useEffect(() => {
    const fieldErrors = getFieldErrors(error);
    if (fieldErrors.nome) setError('nome', { message: fieldErrors.nome });
    if (fieldErrors.descricao) setError('descricao', { message: fieldErrors.descricao });
  }, [error, setError]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !pending) onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, pending]);

  function submit(values: CategoryFormValues) {
    return onSubmit({
      nome: values.nome.trim(),
      descricao: values.descricao.trim() || null,
    });
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !pending) onClose(); }}>
      <section className="book-modal category-modal" role="dialog" aria-modal="true" aria-labelledby="category-modal-title">
        <div className="book-modal__header">
          <div className="book-modal__icon"><Layers3 size={20} /></div>
          <div>
            <div className="eyebrow">{category ? 'ATUALIZAÇÃO DO CADASTRO' : 'NOVO CADASTRO'}</div>
            <h2 id="category-modal-title">{category ? 'Editar categoria' : 'Adicionar categoria'}</h2>
          </div>
          <button className="icon-button" onClick={onClose} disabled={pending} aria-label="Fechar formulário"><X size={19} /></button>
        </div>
        <form onSubmit={handleSubmit(submit)} noValidate>
          <div className="category-form-grid">
            <div className="form-field">
              <label className="field-label" htmlFor="category-nome">Nome da categoria</label>
              <input
                className={`text-input ${errors.nome ? 'text-input--error' : ''}`}
                id="category-nome"
                autoFocus
                maxLength={80}
                placeholder="Ex.: Literatura"
                {...register('nome')}
              />
              {errors.nome && <span className="field-error">{errors.nome.message}</span>}
            </div>
            <div className="form-field">
              <label className="field-label" htmlFor="category-descricao">Descrição <span className="optional-label">OPCIONAL</span></label>
              <textarea
                className={`text-input category-description ${errors.descricao ? 'text-input--error' : ''}`}
                id="category-descricao"
                maxLength={240}
                placeholder="Descreva brevemente os livros desta categoria."
                rows={4}
                {...register('descricao')}
              />
              {errors.descricao && <span className="field-error">{errors.descricao.message}</span>}
            </div>
          </div>
          {Boolean(error) && Object.keys(getFieldErrors(error)).length === 0 && (
            <div className="form-alert" role="alert">{getErrorMessage(error, 'Não foi possível salvar a categoria.')}</div>
          )}
          <div className="book-modal__footer">
            <button className="button button--secondary" type="button" onClick={onClose} disabled={pending}>Cancelar</button>
            <button className="button button--primary" type="submit" disabled={pending || (Boolean(category) && !isDirty)}>
              {pending
                ? <><LoaderCircle size={17} className="spin" /> Salvando...</>
                : category ? 'Salvar alterações' : 'Adicionar categoria'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
