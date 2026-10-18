import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { BookOpen, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormField,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui';
import { bookSchema, type BookFormValues } from '../schemas/bookSchema';
import { categoriasService } from '../services/api/categoriasService';
import type { Book } from '../types';
import type { BookInput } from '../services/api/livrosService';
import { getErrorMessage, getFieldErrors } from '../utils/errors';

interface Props {
  book: Book | null;
  pending: boolean;
  error: unknown;
  onClose: () => void;
  onSubmit: (input: BookInput) => Promise<void>;
}

interface TextFieldDefinition {
  name: Exclude<keyof BookFormValues, 'categoria'>;
  label: string;
  placeholder: string;
  type?: 'text' | 'number';
  min?: number;
  wide?: boolean;
}

const textFields: TextFieldDefinition[] = [
  { name: 'titulo', label: 'Título do livro', placeholder: 'Ex.: A biblioteca da meia-noite', wide: true },
  { name: 'autor', label: 'Autor(a)', placeholder: 'Nome completo do autor' },
  { name: 'isbn', label: 'ISBN', placeholder: '978-85-0000-000-0', wide: true },
  { name: 'ano', label: 'Ano de publicação', type: 'number', placeholder: '2024', min: 1 },
  { name: 'quantidade_total', label: 'Quantidade total', type: 'number', placeholder: '0', min: 0 },
  { name: 'quantidade_disponivel', label: 'Exemplares disponíveis', type: 'number', placeholder: '0', min: 0 },
];

const bookFieldNames = ['titulo', 'autor', 'categoria', 'isbn', 'ano', 'quantidade_total', 'quantidade_disponivel'] as const;

export default function BookFormModal({ book, pending, error, onClose, onSubmit }: Props) {
  const categoriesQuery = useQuery({
    queryKey: ['categories', 'book-form'],
    queryFn: categoriasService.listarTodas,
  });
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    mode: 'onChange',
    defaultValues: book ? {
      titulo: book.titulo,
      autor: book.autor,
      categoria: book.categoria,
      isbn: book.isbn,
      ano: book.ano,
      quantidade_total: book.quantidade_total,
      quantidade_disponivel: book.quantidade_disponivel,
    } : {
      titulo: '',
      autor: '',
      categoria: '',
      isbn: '',
      ano: new Date().getFullYear(),
      quantidade_total: 1,
      quantidade_disponivel: 1,
    },
  });
  const categories = categoriesQuery.data ?? [];
  const categoryValue = watch('categoria');
  const categoryOptions = book?.categoria && !categories.some((category) => category.nome === book.categoria)
    ? [...categories, { id: -1, nome: book.categoria, descricao: null }]
    : categories;

  useEffect(() => {
    const fieldErrors = getFieldErrors(error);
    bookFieldNames.forEach((field) => {
      if (fieldErrors[field]) setError(field, { message: fieldErrors[field] });
    });
  }, [error, setError]);

  async function submit(values: BookFormValues) {
    await onSubmit({
      ...values,
      titulo: values.titulo.trim(),
      autor: values.autor.trim(),
      categoria: values.categoria.trim(),
      isbn: values.isbn.trim(),
    });
  }

  const fieldErrors = getFieldErrors(error);

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !pending) onClose(); }}>
      <DialogContent className="max-w-2xl" showClose={false}>
        <DialogHeader>
          <p className="m-0 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
            <BookOpen className="size-4" aria-hidden="true" />
            {book ? 'Atualização do acervo' : 'Novo título'}
          </p>
          <DialogTitle>{book ? 'Editar livro' : 'Adicionar livro'}</DialogTitle>
          <DialogDescription>Preencha os dados do título e a quantidade de exemplares disponíveis.</DialogDescription>
        </DialogHeader>

        <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={onClose} disabled={pending} aria-label="Fechar formulário">
          <X className="size-4" aria-hidden="true" />
        </Button>

        <form onSubmit={handleSubmit(submit)} noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {textFields.slice(0, 1).map(({ name, label, placeholder, wide }) => (
              <FormField key={name} className={wide ? 'sm:col-span-2' : undefined} label={label} htmlFor={`book-${name}`} required error={errors[name]?.message}>
                <Input
                  id={`book-${name}`}
                  autoFocus
                  placeholder={placeholder}
                  hasError={Boolean(errors[name])}
                  aria-describedby={errors[name] ? `book-${name}-message` : undefined}
                  {...register(name)}
                />
              </FormField>
            ))}

            <FormField label="Autor(a)" htmlFor="book-autor" required error={errors.autor?.message}>
              <Input
                id="book-autor"
                placeholder="Nome completo do autor"
                hasError={Boolean(errors.autor)}
                aria-describedby={errors.autor ? 'book-autor-message' : undefined}
                {...register('autor')}
              />
            </FormField>

            <FormField label="Categoria" htmlFor="book-categoria" required error={errors.categoria?.message}>
              <Select
                value={categoryValue || undefined}
                onValueChange={(value) => setValue('categoria', value, { shouldDirty: true, shouldTouch: true, shouldValidate: true })}
                disabled={categoriesQuery.isLoading || categoriesQuery.isError || categoryOptions.length === 0}
              >
                <SelectTrigger
                  id="book-categoria"
                  aria-label="Categoria do livro"
                  aria-invalid={Boolean(errors.categoria)}
                  aria-describedby={errors.categoria ? 'book-categoria-message' : undefined}
                  className={errors.categoria ? 'border-danger' : ''}
                >
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((category) => <SelectItem key={category.id} value={category.nome}>{category.nome}</SelectItem>)}
                </SelectContent>
              </Select>
              {categoriesQuery.isLoading && <p className="m-0 text-xs text-text-muted">Carregando categorias...</p>}
              {categoriesQuery.isError && (
                <p className="m-0 text-xs text-danger" role="alert">
                  Não foi possível carregar as categorias.{' '}
                  <Button variant="ghost" size="sm" type="button" className="px-1 text-primary" onClick={() => { void categoriesQuery.refetch(); }}>Tentar novamente</Button>
                </p>
              )}
              {!categoriesQuery.isLoading && !categoriesQuery.isError && categories.length === 0 && !book && (
                <p className="m-0 text-xs leading-5 text-text-muted">
                  Nenhuma categoria cadastrada. <Link className="inline-flex min-h-11 items-center font-medium text-primary underline underline-offset-2" to="/categorias">Cadastrar categoria</Link>
                </p>
              )}
            </FormField>

            {textFields.slice(2).map(({ name, label, placeholder, type, min, wide }) => (
              <FormField
                key={name}
                className={wide ? 'sm:col-span-2' : undefined}
                label={label}
                htmlFor={`book-${name}`}
                required
                error={errors[name]?.message}
                hint={name === 'quantidade_disponivel' ? 'Não pode exceder a quantidade total.' : undefined}
              >
                <Input
                  id={`book-${name}`}
                  type={type}
                  min={min}
                  step={type === 'number' ? 1 : undefined}
                  placeholder={placeholder}
                  hasError={Boolean(errors[name])}
                  aria-describedby={errors[name] ? `book-${name}-message` : name === 'quantidade_disponivel' ? `book-${name}-message` : undefined}
                  {...register(name)}
                />
              </FormField>
            ))}
          </div>

          {Boolean(error) && Object.keys(fieldErrors).length === 0 && (
            <div className="mt-4 rounded-md border border-danger bg-danger-bg p-3 text-sm leading-6 text-danger" role="alert">
              {getErrorMessage(error, 'Não foi possível salvar o livro.')}
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button variant="secondary" type="button" onClick={onClose} disabled={pending}>Cancelar</Button>
            <Button type="submit" disabled={pending || categoriesQuery.isLoading || categoriesQuery.isError || (!book && categories.length === 0) || (Boolean(book) && !isDirty)}>
              {pending ? 'Salvando...' : book ? 'Salvar alterações' : 'Adicionar ao acervo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
