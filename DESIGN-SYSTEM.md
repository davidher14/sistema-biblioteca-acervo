# Design system Folha

## Escopo entregue

A etapa 1 entrega os tokens, a configuração Tailwind/shadcn, os componentes de base e a página pública `/design-system` para validação visual. A etapa 2 migra o layout autenticado, o login e o dashboard para esses componentes e tokens. A etapa 3 migra o catálogo de livros, os estados da listagem e o formulário de cadastro/edição para o design system.

## Princípios de uso

- Use variáveis `--color-*` e utilitários semânticos como `bg-primary`, `text-text-muted` e `border-border`; não adicione cores hexadecimais nos componentes.
- A marca usa verde profundo, fundos em tom de papel e a tipografia `DM Sans`, com fallback `system-ui, sans-serif`; mantenha o mesmo tema entre login, navegação e telas internas.
- Use a escala tipográfica e os espaçamentos definidos em `src/styles/tokens.css`; mantenha texto de leitura em aproximadamente 65 caracteres por linha.
- Cores de status devem usar `Badge` com texto e ícone. A cor nunca deve ser o único indicador.
- Use `FormField` para rótulos, dicas e erros; associe cada controle ao `htmlFor` fornecido.
- Use `Button` e componentes Radix para manter foco visível, teclado e áreas de toque.
- Use `EmptyState`, `ErrorState` e `Skeleton` para explicitar estados de carregamento e resultado.
- Prefira bordas finas, superfícies claras e sombras de tokens. Não crie uma nova cor de marca nem raios de borda fora da escala.

## Arquivos

- `src/styles/tokens.css`: tokens globais e foco acessível.
- `tailwind.config.js`: cores, fonte, raios e sombras Tailwind mapeados para tokens.
- `components.json`: configuração shadcn/ui e aliases.
- `src/components/ui/`: wrappers de componentes reutilizáveis com Radix quando apropriado.
- `src/pages/DesignSystemPage.tsx`: página de demonstração visual.
- `src/layouts/AppLayout.tsx`, `src/pages/LoginPage.tsx` e `src/pages/DashboardPage.tsx`: telas migradas na etapa 2.
- `src/pages/BooksPage.tsx` e `src/components/BookFormModal.tsx`: catálogo, filtros, tabela, paginação e formulário migrados na etapa 3.

Os cards do dashboard levam às listas correspondentes; empréstimos, reservas e usuários preservam o filtro selecionado no parâmetro `status` da URL.
Na lista de livros, a ação por título encaminha administradores ao formulário existente de empréstimo/reserva com o livro selecionado. A tabela mantém rolagem horizontal em telas estreitas e estados de carregamento, erro e vazio.

## Instalação e validação

As dependências Tailwind, Recharts e Radix são instaladas pelo `npm install`. Execute `npm run dev` e abra `http://localhost:5173/design-system`; `npm run build` valida a aplicação.

## Suposições

- A demonstração fica acessível sem autenticação para facilitar revisão de design.
- Os componentes Sidebar e Header são primitivos de layout nesta etapa; a integração com a navegação real ocorre na etapa 2.
- O contrato atual de livro não inclui URL de capa; por isso, o catálogo usa um placeholder genérico na proporção 2:3 até a API expor uma imagem.
- Ações de empréstimo e reserva permanecem administrativas, de acordo com as permissões existentes; leitores podem consultar o acervo sem ver ações administrativas.
- Os demais módulos ainda preservam composições próprias, mas compartilham os tokens de cor e tipografia da marca para manter a identidade visual consistente.
