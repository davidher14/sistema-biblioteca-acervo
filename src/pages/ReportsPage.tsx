import { useMemo, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  CalendarDays,
  Download,
  LineChart as LineChartIcon,
  UsersRound,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useToast } from '../contexts/ToastContext';
import { relatoriosService } from '../services/api/relatoriosService';
import type { Loan, ReportFilters } from '../types';
import { downloadCsv } from '../utils/csv';
import { getErrorMessage } from '../utils/errors';

function localDate(date: Date) {
  const value = new Date(date);
  value.setMinutes(value.getMinutes() - value.getTimezoneOffset());
  return value.toISOString().slice(0, 10);
}

function defaultReportRange() {
  const end = new Date();
  const start = new Date(end.getFullYear(), end.getMonth() - 11, 1);
  return { data_inicio: localDate(start), data_fim: localDate(end) };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
}

function formatMonth(value: string) {
  const [year, month] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: 'UTC' })
    .format(new Date(Date.UTC(year, month - 1, 1)))
    .replace('.', '');
}

interface ReportPanelProps {
  title: string;
  description: string;
  icon: typeof BookOpen;
  loading: boolean;
  error: unknown;
  empty: boolean;
  onRetry: () => void;
  onExport: () => void;
  children: ReactNode;
}

function ReportPanel({ title, description, icon: Icon, loading, error, empty, onRetry, onExport, children }: ReportPanelProps) {
  return (
    <section className="report-panel">
      <div className="report-panel__header">
        <div className="report-panel__heading">
          <div className="report-panel__icon"><Icon size={17} /></div>
          <div><h2>{title}</h2><p>{description}</p></div>
        </div>
        <button className="button button--secondary report-export" onClick={onExport} disabled={loading || Boolean(error) || empty}>
          <Download size={14} /> Exportar CSV
        </button>
      </div>
      <div className="report-panel__content">
        {loading && <div className="report-loading" aria-label="Carregando relatório"><span /><span /><span /><span /><span /></div>}
        {!loading && Boolean(error) && (
          <div className="report-state report-state--error" role="alert">
            <strong>Não foi possível carregar este relatório.</strong>
            <span>{getErrorMessage(error, 'Verifique sua conexão e tente novamente.')}</span>
            <button className="text-link" onClick={onRetry}>Tentar novamente</button>
          </div>
        )}
        {!loading && !error && empty && <div className="report-state">Não há dados para o período selecionado.</div>}
        {!loading && !error && !empty && children}
      </div>
    </section>
  );
}

export default function ReportsPage() {
  const toast = useToast();
  const [initialRange] = useState(defaultReportRange);
  const [startDate, setStartDate] = useState(initialRange.data_inicio);
  const [endDate, setEndDate] = useState(initialRange.data_fim);
  const filters: ReportFilters = useMemo(() => ({ data_inicio: startDate, data_fim: endDate }), [startDate, endDate]);
  const isRangeValid = Boolean(startDate && endDate && startDate <= endDate);
  const queryOptions = { enabled: isRangeValid };

  const booksQuery = useQuery({
    queryKey: ['reports', 'livros-mais-emprestados', filters],
    queryFn: () => relatoriosService.livrosMaisEmprestados(filters),
    ...queryOptions,
  });
  const periodsQuery = useQuery({
    queryKey: ['reports', 'emprestimos-por-periodo', filters],
    queryFn: () => relatoriosService.emprestimosPorPeriodo(filters),
    ...queryOptions,
  });
  const overdueQuery = useQuery({
    queryKey: ['reports', 'emprestimos-atrasados', filters],
    queryFn: () => relatoriosService.emprestimosAtrasados(filters),
    ...queryOptions,
  });
  const usersQuery = useQuery({
    queryKey: ['reports', 'usuarios-mais-ativos', filters],
    queryFn: () => relatoriosService.usuariosMaisAtivos(filters),
    ...queryOptions,
  });

  const books = booksQuery.data?.dados ?? [];
  const periods = periodsQuery.data?.dados ?? [];
  const overdueLoans = overdueQuery.data?.dados ?? [];
  const users = usersQuery.data?.dados ?? [];

  function exportCsv(filename: string, rows: Array<Record<string, string | number | null>>) {
    try {
      downloadCsv(filename, rows);
    } catch {
      toast.error('Não foi possível exportar o arquivo CSV.');
    }
  }

  function overdueRow(loan: Loan) {
    return {
      Usuário: loan.usuario_nome,
      Livro: loan.livro_titulo,
      'Data do empréstimo': formatDate(loan.data_emprestimo),
      'Devolução prevista': formatDate(loan.data_prevista_devolucao),
      Status: 'Atrasado',
    };
  }

  return (
    <div className="reports-page">
      <div className="page-title-row">
        <div>
          <div className="eyebrow">VISÃO ANALÍTICA</div>
          <h1>Relatórios<span>.</span></h1>
          <p className="page-subtitle">Acompanhe o desempenho do acervo e a atividade da biblioteca.</p>
        </div>
      </div>

      <section className="reports-filter-card" aria-label="Filtros de relatórios">
        <div className="reports-filter-copy">
          <CalendarDays size={17} />
          <div><strong>Período de análise</strong><span>Os relatórios consideram empréstimos realizados entre as datas selecionadas.</span></div>
        </div>
        <div className="reports-date-fields">
          <label><span>Data inicial</span><input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label>
          <span className="reports-date-separator">até</span>
          <label><span>Data final</span><input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label>
        </div>
      </section>
      {!isRangeValid && <div className="reports-validation" role="alert">Informe um período válido: a data inicial deve ser anterior ou igual à data final.</div>}

      <div className="reports-grid">
        <ReportPanel
          title="Livros mais emprestados"
          description="Títulos com maior circulação no período."
          icon={BookOpen}
          loading={booksQuery.isLoading}
          error={booksQuery.error}
          empty={books.length === 0}
          onRetry={() => { void booksQuery.refetch(); }}
          onExport={() => exportCsv('livros-mais-emprestados.csv', books.map((book) => ({
            Livro: book.titulo,
            Autor: book.autor,
            'Total de empréstimos': book.total_emprestimos,
          })))}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={books} layout="vertical" margin={{ top: 5, right: 12, bottom: 5, left: 8 }}>
              <CartesianGrid stroke="#edf0ec" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fill: '#8a958d', fontSize: 10 }} />
              <YAxis type="category" dataKey="titulo" width={130} tick={{ fill: '#657269', fontSize: 9 }} />
              <Tooltip formatter={(value) => [`${value}`, 'Empréstimos']} />
              <Bar dataKey="total_emprestimos" name="Empréstimos" fill="#64846f" radius={[0, 4, 4, 0]} maxBarSize={19} />
            </BarChart>
          </ResponsiveContainer>
        </ReportPanel>

        <ReportPanel
          title="Empréstimos por período"
          description="Volume mensal de empréstimos realizados."
          icon={LineChartIcon}
          loading={periodsQuery.isLoading}
          error={periodsQuery.error}
          empty={periods.length === 0 || periods.every((period) => period.total === 0)}
          onRetry={() => { void periodsQuery.refetch(); }}
          onExport={() => exportCsv('emprestimos-por-periodo.csv', periods.map((period) => ({
            Período: period.periodo,
            'Total de empréstimos': period.total,
          })))}
        >
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={periods} margin={{ top: 12, right: 18, bottom: 5, left: -15 }}>
              <CartesianGrid stroke="#edf0ec" strokeDasharray="3 3" />
              <XAxis dataKey="periodo" tickFormatter={formatMonth} tick={{ fill: '#8a958d', fontSize: 9 }} />
              <YAxis allowDecimals={false} tick={{ fill: '#8a958d', fontSize: 10 }} />
              <Tooltip labelFormatter={(label) => formatMonth(String(label))} formatter={(value) => [`${value}`, 'Empréstimos']} />
              <Line type="monotone" dataKey="total" name="Empréstimos" stroke="#64846f" strokeWidth={2.5} dot={{ r: 3, fill: '#64846f' }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </ReportPanel>

        <ReportPanel
          title="Empréstimos atrasados"
          description="Registros sem devolução após o prazo previsto."
          icon={AlertCircle}
          loading={overdueQuery.isLoading}
          error={overdueQuery.error}
          empty={overdueLoans.length === 0}
          onRetry={() => { void overdueQuery.refetch(); }}
          onExport={() => exportCsv('emprestimos-atrasados.csv', overdueLoans.map(overdueRow))}
        >
          <div className="report-table-wrap">
            <table className="report-table">
              <thead><tr><th>USUÁRIO</th><th>LIVRO</th><th>DEVOLUÇÃO PREVISTA</th></tr></thead>
              <tbody>{overdueLoans.map((loan) => (
                <tr key={loan.id}>
                  <td>{loan.usuario_nome}</td>
                  <td>{loan.livro_titulo}</td>
                  <td className="report-overdue-date">{formatDate(loan.data_prevista_devolucao)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </ReportPanel>

        <ReportPanel
          title="Usuários mais ativos"
          description="Leitores com maior número de empréstimos."
          icon={UsersRound}
          loading={usersQuery.isLoading}
          error={usersQuery.error}
          empty={users.length === 0}
          onRetry={() => { void usersQuery.refetch(); }}
          onExport={() => exportCsv('usuarios-mais-ativos.csv', users.map((user) => ({
            Usuário: user.nome,
            'Total de empréstimos': user.total_emprestimos,
          })))}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={users} layout="vertical" margin={{ top: 5, right: 12, bottom: 5, left: 8 }}>
              <CartesianGrid stroke="#edf0ec" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fill: '#8a958d', fontSize: 10 }} />
              <YAxis type="category" dataKey="nome" width={115} tick={{ fill: '#657269', fontSize: 9 }} />
              <Tooltip formatter={(value) => [`${value}`, 'Empréstimos']} />
              <Bar dataKey="total_emprestimos" name="Empréstimos" fill="#b69965" radius={[0, 4, 4, 0]} maxBarSize={19} />
            </BarChart>
          </ResponsiveContainer>
        </ReportPanel>
      </div>
      <p className="reports-note"><BarChart3 size={14} /> Os dados apresentados respeitam o período escolhido; arquivos CSV são gerados a partir dos resultados carregados.</p>
    </div>
  );
}
