import type { Author, AuthorFilters, Book, BookFilters, Category, CategoryFilters, DashboardSummary, Loan, LoanFilters, ManagedUser, PaginatedResponse, ReportBookRow, ReportFilters, ReportPeriodRow, ReportResponse, ReportUserRow, Reservation, ReservationFilters, User, UserFilters } from '../../types';

const BOOKS_KEY = 'biblioteca_mock_livros';
const AUTHORS_KEY = 'biblioteca_mock_autores';
const CATEGORIES_KEY = 'biblioteca_mock_categorias';
const USERS_KEY = 'biblioteca_mock_usuarios';
const SESSION_KEY = 'biblioteca_mock_usuario';
const LOANS_KEY = 'biblioteca_mock_emprestimos';
const RESERVATIONS_KEY = 'biblioteca_mock_reservas';

const seedBooks: Book[] = [
  { id: 1, titulo: 'O pequeno príncipe', autor: 'Antoine de Saint-Exupéry', categoria: 'Literatura', isbn: '978-85-359-0277-5', ano: 1943, quantidade_total: 8, quantidade_disponivel: 6 },
  { id: 2, titulo: 'Dom Casmurro', autor: 'Machado de Assis', categoria: 'Romance', isbn: '978-85-359-0271-3', ano: 1899, quantidade_total: 5, quantidade_disponivel: 0 },
  { id: 3, titulo: 'Quarto de despejo', autor: 'Carolina Maria de Jesus', categoria: 'Biografia', isbn: '978-85-359-0270-6', ano: 1960, quantidade_total: 4, quantidade_disponivel: 2 },
  { id: 4, titulo: 'Capitães da Areia', autor: 'Jorge Amado', categoria: 'Literatura', isbn: '978-85-359-0268-3', ano: 1937, quantidade_total: 6, quantidade_disponivel: 3 },
  { id: 5, titulo: 'A hora da estrela', autor: 'Clarice Lispector', categoria: 'Romance', isbn: '978-85-359-0269-0', ano: 1977, quantidade_total: 3, quantidade_disponivel: 1 },
  { id: 6, titulo: 'Ideias para adiar o fim do mundo', autor: 'Ailton Krenak', categoria: 'Ensaio', isbn: '978-85-359-0272-0', ano: 2019, quantidade_total: 7, quantidade_disponivel: 7 },
  { id: 7, titulo: 'Torto arado', autor: 'Itamar Vieira Junior', categoria: 'Romance', isbn: '978-85-359-0273-7', ano: 2019, quantidade_total: 5, quantidade_disponivel: 2 },
  { id: 8, titulo: 'O alienista', autor: 'Machado de Assis', categoria: 'Literatura', isbn: '978-85-359-0274-4', ano: 1882, quantidade_total: 4, quantidade_disponivel: 4 },
];

const seedAuthors: Author[] = [
  { id: 1, nome: 'Ailton Krenak' },
  { id: 2, nome: 'Antoine de Saint-Exupéry' },
  { id: 3, nome: 'Carolina Maria de Jesus' },
  { id: 4, nome: 'Clarice Lispector' },
  { id: 5, nome: 'Itamar Vieira Junior' },
  { id: 6, nome: 'Jorge Amado' },
  { id: 7, nome: 'Machado de Assis' },
];

const seedCategories: Category[] = [
  { id: 1, nome: 'Biografia', descricao: 'Histórias de vida e trajetórias reais.' },
  { id: 2, nome: 'Ensaio', descricao: 'Reflexões e ideias sobre diferentes temas.' },
  { id: 3, nome: 'Literatura', descricao: 'Obras literárias e clássicos.' },
  { id: 4, nome: 'Romance', descricao: 'Narrativas de ficção e histórias de amor.' },
];

interface MockAccount extends ManagedUser {
  senha: string;
}

const seedUsers: MockAccount[] = [
  { id: 1, nome: 'Marina Costa', email: 'admin@biblioteca.com', perfil: 'admin', ativo: true, senha: 'admin123' },
  { id: 2, nome: 'Rafael Santos', email: 'usuario@biblioteca.com', perfil: 'usuario', ativo: true, senha: 'usuario123' },
];

function readBooks(): Book[] {
  const saved = localStorage.getItem(BOOKS_KEY);
  if (!saved) {
    localStorage.setItem(BOOKS_KEY, JSON.stringify(seedBooks));
    return seedBooks;
  }
  return JSON.parse(saved) as Book[];
}

function saveBooks(books: Book[]) {
  localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
}

function readAuthors(): Author[] {
  const saved = localStorage.getItem(AUTHORS_KEY);
  if (!saved) {
    localStorage.setItem(AUTHORS_KEY, JSON.stringify(seedAuthors));
    return seedAuthors;
  }
  return JSON.parse(saved) as Author[];
}

function saveAuthors(authors: Author[]) {
  localStorage.setItem(AUTHORS_KEY, JSON.stringify(authors));
}

function readCategories(): Category[] {
  const saved = localStorage.getItem(CATEGORIES_KEY);
  const categories = saved
    ? JSON.parse(saved) as Category[]
    : seedCategories.map((category) => ({ ...category }));
  const knownNames = new Set(categories.map((category) => category.nome.toLocaleLowerCase('pt-BR')));
  let nextId = Math.max(0, ...categories.map((category) => category.id)) + 1;
  for (const name of new Set(readBooks().map((book) => book.categoria.trim()).filter(Boolean))) {
    if (knownNames.has(name.toLocaleLowerCase('pt-BR'))) continue;
    categories.push({ id: nextId, nome: name, descricao: null });
    knownNames.add(name.toLocaleLowerCase('pt-BR'));
    nextId += 1;
  }
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  return categories;
}

function saveCategories(categories: Category[]) {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

function readUsers(): MockAccount[] {
  const saved = localStorage.getItem(USERS_KEY);
  if (!saved) {
    const users = seedUsers.map((account) => ({ ...account }));
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return users;
  }
  return JSON.parse(saved) as MockAccount[];
}

function saveUsers(users: MockAccount[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function readLoans(): Loan[] {
  const saved = localStorage.getItem(LOANS_KEY);
  if (!saved) {
    localStorage.setItem(LOANS_KEY, JSON.stringify([]));
    return [];
  }
  return JSON.parse(saved) as Loan[];
}

function saveLoans(loans: Loan[]) {
  localStorage.setItem(LOANS_KEY, JSON.stringify(loans));
}

function readReservations(): Reservation[] {
  const saved = localStorage.getItem(RESERVATIONS_KEY);
  if (!saved) {
    localStorage.setItem(RESERVATIONS_KEY, JSON.stringify([]));
    return [];
  }
  return JSON.parse(saved) as Reservation[];
}

function saveReservations(reservations: Reservation[]) {
  localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations));
}

function toPublicUser({ senha: _senha, ...user }: MockAccount): ManagedUser {
  return user;
}

function localDateString(date: Date) {
  const localDate = new Date(date);
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
  return localDate.toISOString().slice(0, 10);
}

function getLoanStatus(loan: Pick<Loan, 'status' | 'data_devolucao' | 'data_prevista_devolucao'>): Loan['status'] {
  if (loan.status === 'solicitado' || loan.status === 'recusado' || loan.data_devolucao) {
    return loan.data_devolucao ? 'devolvido' : loan.status;
  }
  return loan.data_prevista_devolucao < localDateString(new Date()) ? 'atrasado' : 'ativo';
}

function delay() {
  return new Promise((resolve) => window.setTimeout(resolve, 250));
}

export async function mockLogin(email: string, senha: string): Promise<User> {
  await delay();
  const normalizedEmail = email.trim().toLocaleLowerCase('pt-BR');
  if (!normalizedEmail || !senha) throw new Error('Informe seu e-mail e sua senha.');
  const account = readUsers().find((user) => user.email.toLocaleLowerCase('pt-BR') === normalizedEmail);
  if (!account) throw new Error('Não encontramos uma conta com esse e-mail. Crie sua conta para continuar.');
  if (!account.ativo) throw new Error('Esta conta está inativa. Entre em contato com a biblioteca.');
  const user = toPublicUser(account);
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export async function mockMe(): Promise<User> {
  await delay();
  const session = localStorage.getItem(SESSION_KEY);
  if (!session) throw new Error('Sessão encerrada. Entre novamente.');
  const user = JSON.parse(session) as User;
  const account = readUsers().find((item) => item.id === user.id && item.ativo);
  if (!account) {
    localStorage.removeItem(SESSION_KEY);
    throw new Error('Sessão encerrada. Entre novamente.');
  }
  return toPublicUser(account);
}

export async function mockLogout(): Promise<void> {
  await delay();
  localStorage.removeItem(SESSION_KEY);
}

export async function mockListBooks(filters: BookFilters): Promise<PaginatedResponse<Book>> {
  await delay();
  const search = filters.busca?.trim().toLocaleLowerCase('pt-BR') ?? '';
  const matched = readBooks()
    .filter((book) => !search || [book.titulo, book.autor, book.categoria, book.isbn].some((value) => value.toLocaleLowerCase('pt-BR').includes(search)))
    .filter((book) => !filters.categoria || book.categoria === filters.categoria)
    .filter((book) => !filters.disponibilidade || (filters.disponibilidade === 'disponivel' ? book.quantidade_disponivel > 0 : book.quantidade_disponivel === 0))
    .sort((a, b) => {
      const left = a[filters.ordenar_por as keyof Book];
      const right = b[filters.ordenar_por as keyof Book];
      const comparison = typeof left === 'number' && typeof right === 'number' ? left - right : String(left).localeCompare(String(right), 'pt-BR');
      return filters.ordem === 'asc' ? comparison : -comparison;
    });
  const start = (filters.pagina - 1) * filters.por_pagina;
  return { dados: matched.slice(start, start + filters.por_pagina), pagina: filters.pagina, por_pagina: filters.por_pagina, total: matched.length };
}

export async function mockCreateBook(input: Omit<Book, 'id'>): Promise<Book> {
  await delay();
  const books = readBooks();
  const book = { ...input, id: Math.max(0, ...books.map((item) => item.id)) + 1 };
  saveBooks([book, ...books]);
  return book;
}

export async function mockUpdateBook(id: number, input: Omit<Book, 'id'>): Promise<Book> {
  await delay();
  const books = readBooks();
  const index = books.findIndex((book) => book.id === id);
  if (index < 0) throw new Error('Livro não encontrado.');
  books[index] = { ...input, id };
  saveBooks(books);
  return books[index];
}

export async function mockDeleteBook(id: number): Promise<void> {
  await delay();
  const books = readBooks();
  saveBooks(books.filter((book) => book.id !== id));
}

export async function mockDashboardSummary(): Promise<DashboardSummary> {
  await delay();
  const books = readBooks();
  const activeUsers = readUsers().filter((user) => user.ativo).length;
  const overdueLoans = readLoans().filter((loan) => getLoanStatus(loan) === 'atrasado').length;
  return {
    total_livros: books.length,
    livros_emprestados: books.reduce((sum, book) => sum + book.quantidade_total - book.quantidade_disponivel, 0),
    emprestimos_atrasados: overdueLoans,
    reservas_pendentes: readReservations().filter((reservation) => reservation.status === 'pendente').length,
    usuarios: activeUsers,
  };
}

function loansInReportPeriod(filters: ReportFilters) {
  return readLoans().filter((loan) => loan.data_emprestimo >= filters.data_inicio && loan.data_emprestimo <= filters.data_fim);
}

export async function mockReportTopBooks(filters: ReportFilters): Promise<ReportResponse<ReportBookRow[]>> {
  await delay();
  const loans = loansInReportPeriod(filters);
  const books = new Map(readBooks().map((book) => [book.id, book]));
  const totals = new Map<number, number>();
  for (const loan of loans) totals.set(loan.livro_id, (totals.get(loan.livro_id) ?? 0) + 1);
  const dados = [...totals].map(([livro_id, total_emprestimos]) => {
    const book = books.get(livro_id);
    const loan = loans.find((item) => item.livro_id === livro_id);
    return {
      livro_id,
      titulo: book?.titulo ?? loan?.livro_titulo ?? 'Livro não encontrado',
      autor: book?.autor ?? '',
      total_emprestimos,
    };
  }).sort((a, b) => b.total_emprestimos - a.total_emprestimos).slice(0, 10);
  return { tipo: 'livros-mais-emprestados', filtros: filters, dados };
}

export async function mockReportLoansByPeriod(filters: ReportFilters): Promise<ReportResponse<ReportPeriodRow[]>> {
  await delay();
  const totals = new Map<string, number>();
  for (const loan of loansInReportPeriod(filters)) {
    const month = loan.data_emprestimo.slice(0, 7);
    totals.set(month, (totals.get(month) ?? 0) + 1);
  }
  const start = new Date(`${filters.data_inicio}T00:00:00Z`);
  const end = new Date(`${filters.data_fim}T00:00:00Z`);
  const dados: ReportPeriodRow[] = [];
  for (const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1)); cursor <= end; cursor.setUTCMonth(cursor.getUTCMonth() + 1)) {
    const periodo = cursor.toISOString().slice(0, 7);
    dados.push({ periodo, total: totals.get(periodo) ?? 0 });
  }
  return { tipo: 'emprestimos-por-periodo', filtros: filters, dados };
}

export async function mockReportOverdueLoans(filters: ReportFilters): Promise<ReportResponse<Loan[]>> {
  await delay();
  const dados = loansInReportPeriod(filters)
    .map((loan) => ({ ...loan, status: getLoanStatus(loan) }))
    .filter((loan) => loan.status === 'atrasado');
  return { tipo: 'emprestimos-atrasados', filtros: filters, dados };
}

export async function mockReportTopUsers(filters: ReportFilters): Promise<ReportResponse<ReportUserRow[]>> {
  await delay();
  const totals = new Map<number, { nome: string; total_emprestimos: number }>();
  for (const loan of loansInReportPeriod(filters)) {
    const user = totals.get(loan.usuario_id);
    totals.set(loan.usuario_id, {
      nome: user?.nome ?? loan.usuario_nome,
      total_emprestimos: (user?.total_emprestimos ?? 0) + 1,
    });
  }
  const dados = [...totals].map(([usuario_id, user]) => ({ usuario_id, ...user }))
    .sort((a, b) => b.total_emprestimos - a.total_emprestimos)
    .slice(0, 10);
  return { tipo: 'usuarios-mais-ativos', filtros: filters, dados };
}

export async function mockListLoans(filters: LoanFilters): Promise<PaginatedResponse<Loan>> {
  await delay();
  const matched = readLoans()
    .map((loan) => ({ ...loan, status: getLoanStatus(loan) }))
    .filter((loan) => !filters.usuario_id || loan.usuario_id === filters.usuario_id)
    .filter((loan) => !filters.status || loan.status === filters.status)
    .filter((loan) => !filters.data_inicio || loan.data_emprestimo >= filters.data_inicio)
    .filter((loan) => !filters.data_fim || loan.data_emprestimo <= filters.data_fim)
    .sort((a, b) => {
      const comparison = a[filters.ordenar_por].localeCompare(b[filters.ordenar_por]);
      return filters.ordem === 'asc' ? comparison : -comparison;
    });
  const start = (filters.pagina - 1) * filters.por_pagina;
  return {
    dados: matched.slice(start, start + filters.por_pagina),
    pagina: filters.pagina,
    por_pagina: filters.por_pagina,
    total: matched.length,
  };
}

export async function mockRequestLoan(livroId: number): Promise<Loan> {
  await delay();
  const session = localStorage.getItem(SESSION_KEY);
  if (!session) throw new Error('Entre na sua conta para solicitar um empréstimo.');
  const currentUser = JSON.parse(session) as User;
  const user = readUsers().find((item) => item.id === currentUser.id && item.ativo);
  if (!user) throw new Error('Sua conta não está ativa.');
  if (user.perfil !== 'usuario') throw new Error('A solicitação de empréstimo é exclusiva para leitores.');
  const books = readBooks();
  const book = books.find((item) => item.id === livroId);
  if (!book) throw new Error('Livro não encontrado.');
  if (book.quantidade_disponivel <= 0) throw new Error('Este livro está indisponível.');
  const loans = readLoans();
  if (loans.some((loan) => loan.usuario_id === user.id && loan.livro_id === livroId && (loan.status === 'solicitado' || getLoanStatus(loan) === 'ativo' || getLoanStatus(loan) === 'atrasado'))) {
    throw new Error('Você já tem uma solicitação ou empréstimo ativo deste livro.');
  }
  const today = localDateString(new Date());
  const dueDate = new Date(`${today}T00:00:00`);
  dueDate.setDate(dueDate.getDate() + 14);
  const loan: Loan = {
    id: Math.max(0, ...loans.map((item) => item.id)) + 1,
    usuario_id: user.id,
    usuario_nome: user.nome,
    livro_id: book.id,
    livro_titulo: book.titulo,
    data_emprestimo: today,
    data_prevista_devolucao: localDateString(dueDate),
    data_devolucao: null,
    status: 'solicitado',
  };
  saveLoans([loan, ...loans]);
  return loan;
}

export async function mockApproveLoan(id: number): Promise<Loan> {
  await delay();
  const loans = readLoans();
  const loanIndex = loans.findIndex((item) => item.id === id);
  if (loanIndex < 0) throw new Error('Solicitação não encontrada.');
  if (loans[loanIndex].status !== 'solicitado') throw new Error('Esta solicitação já foi processada.');
  const books = readBooks();
  const bookIndex = books.findIndex((item) => item.id === loans[loanIndex].livro_id);
  if (bookIndex < 0) throw new Error('O livro solicitado não foi encontrado no acervo.');
  if (books[bookIndex].quantidade_disponivel <= 0) throw new Error('Não há exemplares disponíveis para aprovar esta solicitação.');
  const today = localDateString(new Date());
  const dueDate = new Date(`${today}T00:00:00`);
  dueDate.setDate(dueDate.getDate() + 14);
  const approvedLoan: Loan = {
    ...loans[loanIndex],
    data_emprestimo: today,
    data_prevista_devolucao: localDateString(dueDate),
    status: 'ativo',
  };
  books[bookIndex] = { ...books[bookIndex], quantidade_disponivel: books[bookIndex].quantidade_disponivel - 1 };
  loans[loanIndex] = approvedLoan;
  saveBooks(books);
  saveLoans(loans);
  return approvedLoan;
}

export async function mockRejectLoanRequest(id: number): Promise<Loan> {
  await delay();
  const loans = readLoans();
  const loanIndex = loans.findIndex((item) => item.id === id);
  if (loanIndex < 0) throw new Error('Solicitação não encontrada.');
  if (loans[loanIndex].status !== 'solicitado') throw new Error('Esta solicitação já foi processada.');
  const rejectedLoan = { ...loans[loanIndex], status: 'recusado' as const };
  loans[loanIndex] = rejectedLoan;
  saveLoans(loans);
  return rejectedLoan;
}

export async function mockCreateLoan(input: Omit<Loan, 'id' | 'usuario_nome' | 'livro_titulo' | 'data_devolucao' | 'status'>): Promise<Loan> {
  await delay();
  const user = readUsers().find((item) => item.id === input.usuario_id && item.ativo);
  if (!user) throw new Error('Selecione um usuário ativo.');
  const books = readBooks();
  const bookIndex = books.findIndex((item) => item.id === input.livro_id);
  if (bookIndex < 0) throw new Error('Livro não encontrado.');
  if (books[bookIndex].quantidade_disponivel <= 0) {
    throw new Error('Este livro está indisponível. Você pode reservá-lo.');
  }
  if (input.data_prevista_devolucao <= input.data_emprestimo) {
    throw new Error('A data prevista de devolução deve ser posterior à data do empréstimo.');
  }
  const loan: Loan = {
    ...input,
    id: Math.max(0, ...readLoans().map((item) => item.id)) + 1,
    usuario_nome: user.nome,
    livro_titulo: books[bookIndex].titulo,
    data_devolucao: null,
    status: getLoanStatus({ ...input, status: 'ativo', data_devolucao: null }),
  };
  books[bookIndex] = { ...books[bookIndex], quantidade_disponivel: books[bookIndex].quantidade_disponivel - 1 };
  saveBooks(books);
  saveLoans([loan, ...readLoans()]);
  return loan;
}

export async function mockReturnLoan(id: number, dataDevolucao?: string): Promise<Loan> {
  await delay();
  const loans = readLoans();
  const loanIndex = loans.findIndex((item) => item.id === id);
  if (loanIndex < 0) throw new Error('Empréstimo não encontrado.');
  if (loans[loanIndex].status === 'solicitado' || loans[loanIndex].status === 'recusado') {
    throw new Error('Somente empréstimos aprovados podem ser devolvidos.');
  }
  if (getLoanStatus(loans[loanIndex]) === 'devolvido') throw new Error('Este empréstimo já foi devolvido.');
  const books = readBooks();
  const bookIndex = books.findIndex((item) => item.id === loans[loanIndex].livro_id);
  if (bookIndex < 0) throw new Error('O livro deste empréstimo não foi encontrado no acervo.');
  const returnedLoan: Loan = {
    ...loans[loanIndex],
    data_devolucao: dataDevolucao ?? localDateString(new Date()),
    status: 'devolvido',
  };
  books[bookIndex] = {
    ...books[bookIndex],
    quantidade_disponivel: Math.min(books[bookIndex].quantidade_total, books[bookIndex].quantidade_disponivel + 1),
  };
  loans[loanIndex] = returnedLoan;
  saveBooks(books);
  saveLoans(loans);
  return returnedLoan;
}

export async function mockCreateReservation(input: { usuario_id: number; livro_id: number }): Promise<Reservation> {
  await delay();
  const user = readUsers().find((item) => item.id === input.usuario_id && item.ativo);
  if (!user) throw new Error('Selecione um usuário ativo.');
  const book = readBooks().find((item) => item.id === input.livro_id);
  if (!book) throw new Error('Livro não encontrado.');
  if (book.quantidade_disponivel > 0) throw new Error('Este livro está disponível para empréstimo.');
  const reservations = readReservations();
  if (reservations.some((item) => item.usuario_id === input.usuario_id && item.livro_id === input.livro_id && item.status === 'pendente')) {
    throw new Error('Este usuário já possui uma reserva pendente para este livro.');
  }
  const reservation: Reservation = {
    ...input,
    id: Math.max(0, ...reservations.map((item) => item.id)) + 1,
    usuario_nome: user.nome,
    livro_titulo: book.titulo,
    data_reserva: localDateString(new Date()),
    status: 'pendente',
  };
  saveReservations([reservation, ...reservations]);
  return reservation;
}

export async function mockListReservations(filters: ReservationFilters): Promise<PaginatedResponse<Reservation>> {
  await delay();
  const matched = readReservations()
    .filter((reservation) => !filters.status || reservation.status === filters.status)
    .filter((reservation) => !filters.usuario_id || reservation.usuario_id === filters.usuario_id)
    .filter((reservation) => !filters.livro_id || reservation.livro_id === filters.livro_id)
    .sort((a, b) => {
      const comparison = a.data_reserva.localeCompare(b.data_reserva);
      return filters.ordem === 'asc' ? comparison : -comparison;
    });
  const start = (filters.pagina - 1) * filters.por_pagina;
  return {
    dados: matched.slice(start, start + filters.por_pagina),
    pagina: filters.pagina,
    por_pagina: filters.por_pagina,
    total: matched.length,
  };
}

export async function mockCancelReservation(id: number): Promise<Reservation> {
  await delay();
  const reservations = readReservations();
  const index = reservations.findIndex((reservation) => reservation.id === id);
  if (index < 0) throw new Error('Reserva não encontrada.');
  if (reservations[index].status !== 'pendente') throw new Error('Esta reserva já foi cancelada.');
  reservations[index] = { ...reservations[index], status: 'cancelada' };
  saveReservations(reservations);
  return reservations[index];
}

export async function mockListAuthors(filters: AuthorFilters): Promise<PaginatedResponse<Author>> {
  await delay();
  const search = filters.busca?.trim().toLocaleLowerCase('pt-BR') ?? '';
  const matched = readAuthors()
    .filter((author) => !search || author.nome.toLocaleLowerCase('pt-BR').includes(search))
    .sort((a, b) => {
      const comparison = a.nome.localeCompare(b.nome, 'pt-BR');
      return filters.ordem === 'asc' ? comparison : -comparison;
    });
  const start = (filters.pagina - 1) * filters.por_pagina;
  return {
    dados: matched.slice(start, start + filters.por_pagina),
    pagina: filters.pagina,
    por_pagina: filters.por_pagina,
    total: matched.length,
  };
}

export async function mockCreateAuthor(nome: string): Promise<Author> {
  await delay();
  const authors = readAuthors();
  if (authors.some((author) => author.nome.toLocaleLowerCase('pt-BR') === nome.toLocaleLowerCase('pt-BR'))) {
    throw new Error('Já existe um autor com esse nome.');
  }
  const author = { id: Math.max(0, ...authors.map((item) => item.id)) + 1, nome };
  saveAuthors([...authors, author]);
  return author;
}

export async function mockUpdateAuthor(id: number, nome: string): Promise<Author> {
  await delay();
  const authors = readAuthors();
  const index = authors.findIndex((author) => author.id === id);
  if (index < 0) throw new Error('Autor não encontrado.');
  if (authors.some((author) => author.id !== id && author.nome.toLocaleLowerCase('pt-BR') === nome.toLocaleLowerCase('pt-BR'))) {
    throw new Error('Já existe um autor com esse nome.');
  }
  authors[index] = { id, nome };
  saveAuthors(authors);
  return authors[index];
}

export async function mockDeleteAuthor(id: number): Promise<void> {
  await delay();
  const authors = readAuthors();
  if (!authors.some((author) => author.id === id)) throw new Error('Autor não encontrado.');
  saveAuthors(authors.filter((author) => author.id !== id));
}

export async function mockListCategories(filters: CategoryFilters): Promise<PaginatedResponse<Category>> {
  await delay();
  const search = filters.busca?.trim().toLocaleLowerCase('pt-BR') ?? '';
  const matched = readCategories()
    .filter((category) => !search || [category.nome, category.descricao ?? ''].some((value) => value.toLocaleLowerCase('pt-BR').includes(search)))
    .sort((a, b) => {
      const comparison = a.nome.localeCompare(b.nome, 'pt-BR');
      return filters.ordem === 'asc' ? comparison : -comparison;
    });
  const start = (filters.pagina - 1) * filters.por_pagina;
  return {
    dados: matched.slice(start, start + filters.por_pagina),
    pagina: filters.pagina,
    por_pagina: filters.por_pagina,
    total: matched.length,
  };
}

export async function mockGetCategory(id: number): Promise<Category> {
  await delay();
  const category = readCategories().find((item) => item.id === id);
  if (!category) throw new Error('Categoria não encontrada.');
  return category;
}

export async function mockCreateCategory(input: Omit<Category, 'id'>): Promise<Category> {
  await delay();
  const categories = readCategories();
  if (categories.some((category) => category.nome.toLocaleLowerCase('pt-BR') === input.nome.toLocaleLowerCase('pt-BR'))) {
    throw new Error('Já existe uma categoria com esse nome.');
  }
  const category = { ...input, id: Math.max(0, ...categories.map((item) => item.id)) + 1 };
  saveCategories([...categories, category]);
  return category;
}

export async function mockUpdateCategory(id: number, input: Omit<Category, 'id'>): Promise<Category> {
  await delay();
  const categories = readCategories();
  const index = categories.findIndex((category) => category.id === id);
  if (index < 0) throw new Error('Categoria não encontrada.');
  if (categories.some((category) => category.id !== id && category.nome.toLocaleLowerCase('pt-BR') === input.nome.toLocaleLowerCase('pt-BR'))) {
    throw new Error('Já existe uma categoria com esse nome.');
  }
  const previousName = categories[index].nome;
  categories[index] = { ...input, id };
  saveCategories(categories);
  if (previousName !== input.nome) {
    const books = readBooks().map((book) => book.categoria === previousName ? { ...book, categoria: input.nome } : book);
    saveBooks(books);
  }
  return categories[index];
}

export async function mockDeleteCategory(id: number): Promise<void> {
  await delay();
  const categories = readCategories();
  const category = categories.find((item) => item.id === id);
  if (!category) throw new Error('Categoria não encontrada.');
  if (readBooks().some((book) => book.categoria === category.nome)) {
    throw new Error('Não é possível excluir esta categoria porque ela está associada a um ou mais livros.');
  }
  saveCategories(categories.filter((item) => item.id !== id));
}

export async function mockListUsers(filters: UserFilters): Promise<PaginatedResponse<ManagedUser>> {
  await delay();
  const search = filters.busca?.trim().toLocaleLowerCase('pt-BR') ?? '';
  const matched = readUsers()
    .filter((user) => !search || [user.nome, user.email].some((value) => value.toLocaleLowerCase('pt-BR').includes(search)))
    .filter((user) => !filters.perfil || user.perfil === filters.perfil)
    .filter((user) => !filters.status || (filters.status === 'ativo' ? user.ativo : !user.ativo))
    .sort((a, b) => {
      const comparison = a[filters.ordenar_por].localeCompare(b[filters.ordenar_por], 'pt-BR');
      return filters.ordem === 'asc' ? comparison : -comparison;
    });
  const start = (filters.pagina - 1) * filters.por_pagina;
  return {
    dados: matched.slice(start, start + filters.por_pagina).map(toPublicUser),
    pagina: filters.pagina,
    por_pagina: filters.por_pagina,
    total: matched.length,
  };
}

export async function mockGetUser(id: number): Promise<ManagedUser> {
  await delay();
  const user = readUsers().find((item) => item.id === id);
  if (!user) throw new Error('Usuário não encontrado.');
  return toPublicUser(user);
}

export async function mockCreateUser(input: Omit<ManagedUser, 'id'> & { senha: string }): Promise<ManagedUser> {
  await delay();
  const users = readUsers();
  if (users.some((user) => user.email.toLocaleLowerCase('pt-BR') === input.email.toLocaleLowerCase('pt-BR'))) {
    throw new Error('Já existe um usuário cadastrado com este e-mail.');
  }
  const account: MockAccount = { ...input, id: Math.max(0, ...users.map((user) => user.id)) + 1 };
  saveUsers([...users, account]);
  return toPublicUser(account);
}

export async function mockRegisterReader(input: { nome: string; email: string; senha: string }): Promise<ManagedUser> {
  await delay();
  const nome = input.nome.trim();
  const email = input.email.trim();
  if (nome.length < 2) throw new Error('Informe um nome com pelo menos 2 caracteres.');
  if (input.senha.length < 8) throw new Error('A senha deve ter pelo menos 8 caracteres.');
  const users = readUsers();
  if (users.some((user) => user.email.trim().toLocaleLowerCase('pt-BR') === email.toLocaleLowerCase('pt-BR'))) {
    throw new Error('Já existe uma conta cadastrada com este e-mail.');
  }
  const account: MockAccount = {
    id: Math.max(0, ...users.map((user) => user.id)) + 1,
    nome,
    email,
    senha: input.senha,
    perfil: 'usuario',
    ativo: true,
  };
  saveUsers([...users, account]);
  return toPublicUser(account);
}

export async function mockUpdateUser(
  id: number,
  input: Omit<ManagedUser, 'id'> & { senha?: string },
): Promise<ManagedUser> {
  await delay();
  const users = readUsers();
  const index = users.findIndex((user) => user.id === id);
  if (index < 0) throw new Error('Usuário não encontrado.');
  if (users.some((user) => user.id !== id && user.email.toLocaleLowerCase('pt-BR') === input.email.toLocaleLowerCase('pt-BR'))) {
    throw new Error('Já existe um usuário cadastrado com este e-mail.');
  }
  const { senha, ...publicFields } = input;
  const account: MockAccount = { ...users[index], ...publicFields, senha: senha || users[index].senha };
  users[index] = account;
  saveUsers(users);
  if (account.ativo) {
    const session = localStorage.getItem(SESSION_KEY);
    if (session && (JSON.parse(session) as User).id === id) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(toPublicUser(account)));
    }
  } else {
    const session = localStorage.getItem(SESSION_KEY);
    if (session && (JSON.parse(session) as User).id === id) localStorage.removeItem(SESSION_KEY);
  }
  return toPublicUser(account);
}

export async function mockSetUserActive(id: number, ativo: boolean): Promise<ManagedUser> {
  await delay();
  const users = readUsers();
  const index = users.findIndex((user) => user.id === id);
  if (index < 0) throw new Error('Usuário não encontrado.');
  users[index].ativo = ativo;
  saveUsers(users);
  if (!ativo) {
    const session = localStorage.getItem(SESSION_KEY);
    if (session && (JSON.parse(session) as User).id === id) localStorage.removeItem(SESSION_KEY);
  }
  return toPublicUser(users[index]);
}
