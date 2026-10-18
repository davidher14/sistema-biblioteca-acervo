import { useState } from 'react';
import { ArrowDown, ArrowUp, BookOpen, CircleHelp, Search } from 'lucide-react';
import {
  Badge,
  Breadcrumb,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Combobox,
  ConfirmDialog,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  EmptyState,
  ErrorState,
  FormField,
  Header,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sidebar,
  SidebarItem,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Toast,
} from '../components/ui';

const books = [
  { title: 'O pequeno príncipe', author: 'Antoine de Saint-Exupéry', available: '2 de 5 disponíveis', status: 'available' as const },
  { title: 'Dom Casmurro', author: 'Machado de Assis', available: '0 de 3 disponíveis', status: 'unavailable' as const },
  { title: 'Quarto de despejo', author: 'Carolina Maria de Jesus', available: '1 de 4 disponíveis', status: 'borrowed' as const },
];

const statuses = [
  { status: 'available', label: 'Disponível' },
  { status: 'borrowed', label: 'Emprestado' },
  { status: 'pending', label: 'Pendente' },
  { status: 'reserved', label: 'Reservado' },
  { status: 'overdue', label: 'Atrasado' },
  { status: 'unavailable', label: 'Indisponível' },
  { status: 'inactive', label: 'Inativo' },
] as const;

const comboboxOptions = [
  { value: '1', label: 'O pequeno príncipe', description: 'Antoine de Saint-Exupéry · 2 disponíveis' },
  { value: '2', label: 'Dom Casmurro', description: 'Machado de Assis · sem exemplares', disabled: true },
  { value: '3', label: 'Quarto de despejo', description: 'Carolina Maria de Jesus · 1 disponível' },
];

export default function DesignSystemPage() {
  const [comboboxValue, setComboboxValue] = useState('');
  const [checked, setChecked] = useState(true);
  const [selectValue, setSelectValue] = useState('livros');
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <main className="ds-page">
      <header className="ds-page__intro">
        <div>
          <span className="ds-eyebrow">BIBLIOTECA · INTERFACE</span>
          <h1>Design system</h1>
          <p>Fundamentos e componentes acessíveis para uma experiência consistente no acervo.</p>
        </div>
        <Badge status="neutral" label="Etapa 1 · Base visual" />
      </header>

      <section className="ds-section" aria-labelledby="ds-colors-title">
        <div className="ds-section__heading"><span className="ds-section__index">01</span><div><h2 id="ds-colors-title">Cores e tokens</h2><p>Paleta de marca, superfícies e estados semânticos.</p></div></div>
        <div className="ds-swatch-grid">
          {[
            ['Marca', 'primary', '--color-primary'],
            ['Marca · suave', 'primary-soft', '--color-primary-soft'],
            ['Plano de fundo', 'bg', '--color-bg'],
            ['Superfície', 'surface', '--color-surface'],
            ['Texto', 'text', '--color-text'],
            ['Texto auxiliar', 'text-muted', '--color-text-muted'],
            ['Foco', 'focus', '--color-focus'],
            ['Borda', 'border', '--color-border'],
          ].map(([label, token, variable]) => (
            <div className="ds-swatch" key={token}>
              <div className={`ds-swatch__color ds-swatch__color--${token}`} />
              <div><strong>{label}</strong><code>{variable}</code></div>
            </div>
          ))}
        </div>
        <div className="ds-token-statuses">
          {statuses.map(({ status, label }) => <Badge key={status} status={status} label={label} />)}
        </div>
      </section>

      <section className="ds-section" aria-labelledby="ds-type-title">
        <div className="ds-section__heading"><span className="ds-section__index">02</span><div><h2 id="ds-type-title">Tipografia</h2><p>Inter como fonte única da interface e escala tipográfica fixa.</p></div></div>
        <div className="ds-type-samples">
          <div><span>h1 · 28 / 700</span><h1 className="ds-type-h1">Cada livro abre um caminho</h1></div>
          <div><span>h2 · 22 / 600</span><h2 className="ds-type-h2">Acervo da biblioteca</h2></div>
          <div><span>h3 · 18 / 600</span><h3 className="ds-type-h3">Disponibilidade do título</h3></div>
          <div><span>Base · 16 / 400</span><p>Uma biblioteca acolhedora ajuda leitores e equipe a encontrar histórias com facilidade.</p></div>
          <div><span>Tabela · 14 / 400</span><p className="ds-type-table">O pequeno príncipe · Antoine de Saint-Exupéry</p></div>
          <div><span>Auxiliar · 12 / 500</span><p className="ds-type-helper">As informações estão atualizadas.</p></div>
        </div>
      </section>

      <section className="ds-section" aria-labelledby="ds-components-title">
        <div className="ds-section__heading"><span className="ds-section__index">03</span><div><h2 id="ds-components-title">Componentes</h2><p>Estados comuns, variações e controles acessíveis.</p></div></div>
        <div className="ds-demo-grid">
          <Card>
            <CardHeader><CardTitle>Botões</CardTitle><CardDescription>Ação principal, secundária, destrutiva e discreta.</CardDescription></CardHeader>
            <CardContent className="ds-button-row">
              <Button>Salvar alterações</Button>
              <Button variant="secondary">Ação secundária</Button>
              <Button variant="danger">Excluir item</Button>
              <Button variant="ghost">Ação discreta</Button>
              <Button disabled>Desabilitado</Button>
              <Button variant="secondary" size="icon" aria-label="Ajuda"><CircleHelp size={17} /></Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Formulários</CardTitle><CardDescription>Rótulos visíveis, dicas e erros junto ao campo.</CardDescription></CardHeader>
            <CardContent className="ds-form-stack">
              <FormField label="Buscar título" htmlFor="ds-search" hint="Pesquise pelo título, autor ou ISBN.">
                <div className="ds-input-with-icon"><Search aria-hidden="true" /><Input id="ds-search" aria-describedby="ds-search-message" placeholder="Ex.: Dom Casmurro" /></div>
              </FormField>
              <FormField label="Categoria" htmlFor="ds-category">
                <Select value={selectValue} onValueChange={setSelectValue}>
                  <SelectTrigger id="ds-category" aria-label="Categoria"><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="livros">Literatura</SelectItem>
                    <SelectItem value="romance">Romance</SelectItem>
                    <SelectItem value="biografia">Biografia</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Selecionar livro" htmlFor="ds-combobox">
                <Combobox
                  options={comboboxOptions}
                  value={comboboxValue}
                  onValueChange={setComboboxValue}
                  id="ds-combobox"
                  aria-describedby="ds-combobox-message"
                  aria-label="Selecionar livro"
                  placeholder="Buscar livro..."
                />
              </FormField>
              <FormField label="Observação" htmlFor="ds-description" hint="Máximo de 500 caracteres.">
                <Textarea id="ds-description" aria-describedby="ds-description-message" placeholder="Adicione uma observação..." rows={3} />
              </FormField>
              <FormField label="ISBN" htmlFor="ds-isbn" error="Informe um ISBN válido.">
                <Input id="ds-isbn" hasError aria-describedby="ds-isbn-message" placeholder="978-85-0000-000-0" />
              </FormField>
              <label className="ds-checkbox-row">
                <Checkbox id="ds-confirm" checked={checked} onCheckedChange={(value) => setChecked(value === true)} />
                <span>Confirmo que os dados do acervo estão corretos.</span>
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Status e notificações</CardTitle><CardDescription>Status comunicados por cor, texto e ícone.</CardDescription></CardHeader>
            <CardContent className="ds-form-stack">
              <div className="ds-badge-row">{statuses.map(({ status, label }) => <Badge key={status} status={status} label={label} />)}</div>
              <Toast variant="success" title="Alterações salvas" description="O cadastro foi atualizado com sucesso." />
              <Toast variant="error" title="Não foi possível salvar" description="Revise os campos destacados e tente novamente." />
              <Toast variant="info" title="Informação" description="A cópia está reservada para outro leitor." />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Estados e carregamento</CardTitle><CardDescription>Skeleton, vazio e erro são estados explícitos.</CardDescription></CardHeader>
            <CardContent className="ds-state-stack">
              <div className="ds-skeleton-sample" aria-label="Prévia de carregamento">
                <Skeleton className="h-4 w-2/5" /><Skeleton className="h-4 w-4/5" /><Skeleton className="h-4 w-3/5" />
              </div>
              <EmptyState icon={<BookOpen className="size-6" />} title="Nenhum livro encontrado" description="Adicione títulos ao acervo para começar." action={<Button size="sm">Adicionar livro</Button>} />
              <ErrorState title="Falha ao carregar os dados" description="Verifique a conexão e tente novamente." onRetry={() => undefined} />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="ds-section" aria-labelledby="ds-table-title">
        <div className="ds-section__heading"><span className="ds-section__index">04</span><div><h2 id="ds-table-title">Tabelas e organização</h2><p>Cabeçalho fixo, linhas alternadas e ordenação identificada.</p></div></div>
        <Card>
          <CardHeader><CardTitle>Livros do acervo</CardTitle><CardDescription>Exemplo de tabela administrativa com disponibilidade.</CardDescription></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Livro</TableHead><TableHead>Autor</TableHead><TableHead>Exemplares</TableHead><TableHead>Status</TableHead><TableHead><button type="button" className="ds-sort-button" aria-label="Ordenar por ano"><span>Ano</span><ArrowDown size={15} /></button></TableHead></TableRow></TableHeader>
              <TableBody>{books.map((book, index) => (
                <TableRow key={book.title}>
                  <TableCell className="font-medium">{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>{book.available}</TableCell>
                  <TableCell><Badge status={book.status} /></TableCell>
                  <TableCell>{[1943, 1899, 1960][index]}</TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
            <div className="ds-pagination"><span>Mostrando <strong>1–3</strong> de <strong>24</strong> livros</span><div><Button variant="secondary" size="sm" disabled aria-label="Página anterior"><ArrowUp className="rotate-[-90deg]" size={14} /> Anterior</Button><span>Página 1 de 8</span><Button variant="secondary" size="sm" aria-label="Próxima página">Próxima <ArrowDown className="rotate-[-90deg]" size={14} /></Button></div></div>
          </CardContent>
        </Card>
      </section>

      <section className="ds-section" aria-labelledby="ds-layout-title">
        <div className="ds-section__heading"><span className="ds-section__index">05</span><div><h2 id="ds-layout-title">Layout, navegação e diálogos</h2><p>Prévia de navegação, breadcrumb, abas e confirmação acessível.</p></div></div>
        <div className="ds-layout-demo">
          <Sidebar footer={<span className="text-xs text-surface/80">Acervo · Área administrativa</span>}>
            <SidebarItem active><BookOpen size={17} /> Acervo de livros</SidebarItem>
            <SidebarItem><Search size={17} /> Buscar no catálogo</SidebarItem>
          </Sidebar>
          <div className="ds-layout-demo__main">
            <Header userName="Marina Costa" profile="Administradora" onLogout={() => undefined} />
            <div className="ds-layout-demo__content">
              <Breadcrumb items={[{ label: 'Biblioteca', href: '/' }, { label: 'Acervo de livros' }]} />
              <Tabs defaultValue="detalhes">
                <TabsList aria-label="Informações do livro">
                  <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
                  <TabsTrigger value="exemplares">Exemplares</TabsTrigger>
                </TabsList>
                <TabsContent value="detalhes"><p className="m-0 text-sm leading-6 text-text-muted">Informações gerais e descrição do livro.</p></TabsContent>
                <TabsContent value="exemplares"><p className="m-0 text-sm leading-6 text-text-muted">Disponibilidade atual dos exemplares.</p></TabsContent>
              </Tabs>
              <div className="ds-dialog-actions">
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild><Button variant="secondary">Prévia de modal</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Detalhes do livro</DialogTitle><DialogDescription>Modal com foco contido, descrição e ação clara.</DialogDescription></DialogHeader>
                    <p className="m-0 text-sm leading-6 text-text-muted">O pequeno príncipe · Antoine de Saint-Exupéry</p>
                    <DialogFooter><Button variant="secondary" onClick={() => setDialogOpen(false)}>Fechar</Button><Button onClick={() => setDialogOpen(false)}>Salvar</Button></DialogFooter>
                  </DialogContent>
                </Dialog>
                <ConfirmDialog
                  trigger={<Button variant="danger">Prévia de confirmação</Button>}
                  title="Excluir livro do acervo?"
                  description="Esta ação é permanente. Confirme apenas se desejar remover o título."
                  confirmLabel="Excluir livro"
                  destructive
                  onConfirm={() => undefined}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      <footer className="ds-page__footer">Etapa 1 do novo design system · Tokens centralizados, componentes reutilizáveis e foco acessível.</footer>
    </main>
  );
}
