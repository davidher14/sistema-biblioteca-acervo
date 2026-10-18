# Folha — Gestão de biblioteca

Front-end em React 18 + TypeScript + Vite para gerenciamento do acervo. As etapas entregues incluem autenticação, navegação protegida, painel inicial, gerenciamento de livros, autores, categorias e usuários, empréstimos, devoluções e reservas.

## Rodar localmente

Requisitos: Node.js 20.19+ (ou 22.12+) e npm.

```bash
npm install
Copy-Item .env.example .env
npm run dev
```

Abra `http://localhost:5173`. Para validar a compilação de produção, rode `npm run build`.

## Configuração

Defina em `.env`:

```dotenv
VITE_API_URL=http://localhost:8000
VITE_USE_MOCK=false
```

O front usa sessão PHP por cookie (`withCredentials: true`). Configure o CORS do PHP para permitir `http://localhost:5173` com credenciais e não use `Access-Control-Allow-Origin: *` nesse modo.

O formulário de livros carrega as categorias cadastradas e envia em `categoria` o nome selecionado; esse valor deve corresponder a uma categoria existente.

### Modo demonstração

Defina `VITE_USE_MOCK=true` e reinicie o servidor Vite. A autenticação, livros, autores, categorias, usuários, empréstimos, devoluções, reservas, relatórios e resumo do painel passam a usar dados locais no `localStorage`; não é necessária API. Neste modo de demonstração, qualquer senha é aceita para as contas existentes e contas de leitor são criadas pelo formulário de cadastro. Não use o modo mock em produção.

- Administrador: `admin@biblioteca.com` / qualquer senha
- Leitor seed: `usuario@biblioteca.com` / qualquer senha
- Novos leitores: crie uma conta pela tela de login; escolha qualquer senha com pelo menos 8 caracteres.

O estado demonstrativo pode ser removido limpando os dados locais do site (`biblioteca_mock_usuario`, `biblioteca_mock_livros`, `biblioteca_mock_autores`, `biblioteca_mock_categorias`, `biblioteca_mock_usuarios`, `biblioteca_mock_emprestimos` e `biblioteca_mock_reservas`).

## Arquitetura

- **TypeScript**: tipos compartilhados para usuário, livro, filtros e erros da API.
- **CSS próprio**: tokens, componentes e breakpoints em um único stylesheet; escolhido para manter esta base enxuta sem adicionar uma etapa de configuração de Tailwind.
- **React Router** protege as páginas e preserva a rota solicitada no redirecionamento para login.
- **TanStack Query** trata cache, loading, erros e invalidação após alterações.
- **Recharts** apresenta os gráficos dos relatórios; os resultados também podem ser exportados em CSV.
- **Axios** centraliza URL, cookies e o tratamento de sessão HTTP 401.
- **React Hook Form + Zod** validam formulários no cliente; mensagens de validação por campo enviadas pela API também são mostradas.
- Os arquivos `src/services/api/config.ts` e `src/services/api/` centralizam caminhos e integração. O mock tem implementação local separada.
- Apenas administradores podem criar, editar ou excluir livros. Demais usuários têm acesso de leitura.
- A gestão de empréstimos é restrita a administradores; livros sem exemplares disponíveis não podem ser emprestados e oferecem a criação de uma reserva para um usuário ativo.

## Contrato HTTP esperado nesta etapa

Todos os corpos e respostas usam `application/json` e UTF-8. Os exemplos de resposta indicam o corpo retornado (sem envelope adicional).

### Sessão

`POST /api/login`

Request:

```json
{ "email": "admin@biblioteca.com", "senha": "senha" }
```

Response `200` (a API também define o cookie de sessão):

```json
{ "id": 1, "nome": "Marina Costa", "email": "admin@biblioteca.com", "perfil": "admin" }
```

Perfis aceitos pelo front: `admin` e `usuario`.

`GET /api/me` retorna o mesmo objeto de usuário (`200`). Sem sessão, responder `401`.

`POST /api/logout` encerra e invalida o cookie; resposta esperada `200` com `{ "mensagem": "Sessão encerrada." }` ou `204` sem corpo.

### Livros

`GET /api/livros` aceita os parâmetros:

| Parâmetro | Tipo | Descrição |
| --- | --- | --- |
| `busca` | string | Busca por título, autor, categoria ou ISBN |
| `categoria` | string | Categoria exata |
| `disponibilidade` | `disponivel` \| `indisponivel` | Situação calculada pela quantidade disponível |
| `pagina` | inteiro | Página iniciada em 1 |
| `por_pagina` | inteiro | Tamanho da página |
| `ordenar_por` | string | Campo da ordenação (`titulo`, `autor`, `ano`) |
| `ordem` | `asc` \| `desc` | Direção da ordenação |

Response `200`:

```json
{
  "dados": [
    {
      "id": 1,
      "titulo": "O pequeno príncipe",
      "autor": "Antoine de Saint-Exupéry",
      "categoria": "Literatura",
      "isbn": "978-85-359-0277-5",
      "ano": 1943,
      "quantidade_total": 8,
      "quantidade_disponivel": 6
    }
  ],
  "pagina": 1,
  "por_pagina": 8,
  "total": 1,
  "categorias": ["Literatura"]
}
```

`categorias` é uma lista opcional de categorias existentes, útil para preencher o filtro mesmo quando uma categoria não está na página atual.

`POST /api/livros` recebe os campos do livro sem `id`:

```json
{
  "titulo": "O pequeno príncipe",
  "autor": "Antoine de Saint-Exupéry",
  "categoria": "Literatura",
  "isbn": "978-85-359-0277-5",
  "ano": 1943,
  "quantidade_total": 8,
  "quantidade_disponivel": 6
}
```

Retorna o livro criado com `id` (`201`).

`GET /api/livros/{id}` retorna o livro (`200`).
`PUT /api/livros/{id}` recebe o mesmo JSON de criação e retorna o livro atualizado (`200`).
`DELETE /api/livros/{id}` retorna `204` sem corpo (ou `200`).

Para erros, o front entende `400`, `401`, `403`, `404` e `422`. Use o formato:

```json
{
  "mensagem": "Verifique os dados informados.",
  "erros": {
    "isbn": "Este ISBN já está cadastrado.",
    "quantidade_disponivel": "A quantidade disponível excede o total."
  }
}
```

`erros` é opcional; as chaves devem corresponder aos nomes dos campos. O front redireciona para login em respostas `401`.

## Escopo entregue

Autenticação, layout, painel inicial, livros, autores, categorias, usuários, empréstimos, devoluções, reservas e relatórios estão implementados.

## Contrato de API

Os formatos abaixo registram o contrato esperado para orientar a implementação do PHP. Autores, categorias, usuários e empréstimos são consumidos pela interface; os demais contratos são previstos para módulos ainda não implementados. Listagens usam `pagina` e `por_pagina` e retornam o envelope `dados`, `pagina`, `por_pagina`, `total` já exemplificado acima. Os campos `busca`, `ordenar_por` e `ordem` são opcionais quando aplicáveis.

### Autores (integrado)

`GET /api/autores?busca=&pagina=1&por_pagina=8&ordenar_por=nome&ordem=asc` retorna:

```json
{
  "dados": [{ "id": 1, "nome": "Machado de Assis" }],
  "pagina": 1,
  "por_pagina": 8,
  "total": 1
}
```

`POST /api/autores` recebe `{ "nome": "Machado de Assis" }` e retorna o autor criado com `id` (`201`).
`GET /api/autores/{id}` retorna o autor (`200`).
`PUT /api/autores/{id}` recebe `{ "nome": "Machado de Assis" }` e retorna o autor atualizado (`200`).
`DELETE /api/autores/{id}` retorna `204` sem corpo (ou `200`).

### Categorias (integrado)

`GET /api/categorias?busca=&pagina=1&por_pagina=8&ordenar_por=nome&ordem=asc` busca pelo nome ou descrição e retorna:

```json
{
  "dados": [{ "id": 1, "nome": "Literatura", "descricao": "Obras literárias" }],
  "pagina": 1,
  "por_pagina": 8,
  "total": 1
}
```

Cada item de categoria tem formato `{ "id": 1, "nome": "Literatura", "descricao": "Obras literárias" }`; `descricao` pode ser `null`.
`POST /api/categorias` recebe `{ "nome": "Literatura", "descricao": "Obras literárias" }` (a descrição pode ser `null` ou vazia) e retorna a categoria criada com `id` (`201`).
`GET /api/categorias/{id}` retorna a categoria (`200`).
`PUT /api/categorias/{id}` recebe `{ "nome": "Literatura", "descricao": "Obras literárias" }` e retorna a categoria atualizada (`200`).
`DELETE /api/categorias/{id}` retorna `204` sem corpo (ou `200`). Se houver livros associados à categoria, a API deve rejeitar a exclusão (`409` ou `422`) com `{ "mensagem": "Não é possível excluir esta categoria porque ela está associada a livros." }`. Ao renomear uma categoria, a API deve preservar a associação dos livros existentes ao novo nome da categoria.

### Usuários (integrado)

`GET /api/usuarios?busca=&perfil=&status=&pagina=1&por_pagina=8&ordenar_por=nome&ordem=asc` busca por nome/e-mail. `perfil` aceita `admin` ou `usuario`; `status` aceita `ativo` ou `inativo`; `ordenar_por` aceita `nome`, `email` ou `perfil`. Retorna:

```json
{
  "dados": [{ "id": 1, "nome": "Marina Costa", "email": "marina@biblioteca.com", "perfil": "admin", "ativo": true }],
  "pagina": 1,
  "por_pagina": 8,
  "total": 1
}
```

Os itens de usuário têm o formato `{ "id": 1, "nome": "Marina Costa", "email": "marina@biblioteca.com", "perfil": "admin", "ativo": true }`. Nunca retorne a senha nos endpoints de leitura nem após criar ou atualizar.
`POST /api/usuarios` recebe `{ "nome": "Marina Costa", "email": "marina@biblioteca.com", "senha": "senha-segura", "perfil": "admin", "ativo": true }` e retorna o usuário sem senha (`201`). A interface exige senha com pelo menos 8 caracteres na criação.
`GET /api/usuarios/{id}` retorna o usuário sem senha (`200`).
`PUT /api/usuarios/{id}` recebe `{ "nome": "Marina Costa", "email": "marina@biblioteca.com", "perfil": "usuario", "ativo": true }`; `senha` é opcional e, se omitida ou vazia, mantém a senha atual. A interface exige ao menos 8 caracteres quando uma nova senha é informada. Retorna o usuário sem senha (`200`).
`DELETE /api/usuarios/{id}` inativa o usuário e retorna `{ "mensagem": "Usuário inativado.", "usuario": { "id": 1, "ativo": false } }` (`200`); não apaga registros de empréstimo associados.
Reativação usa `PUT /api/usuarios/{id}` com os campos atuais do cadastro e `ativo: true`. Exclusões físicas não são oferecidas pela interface para preservar o histórico.
Somente administradores podem acessar a tela, e a API também deve exigir autorização administrativa nas rotas de gerenciamento. A interface não permite ao administrador conectado inativar a própria conta nem alterar seu próprio perfil administrativo.
`POST /api/register` é a rota pública de cadastro. Recebe `{ "nome": "Ana Leitor", "email": "ana@exemplo.com", "senha": "senha-segura" }` e cria uma conta ativa com `perfil: "usuario"` (`201`). O cliente não envia nem pode escolher `perfil` ou `ativo`. O servidor deve validar nome, e-mail e senha (mínimo 8 caracteres), normalizar/validar o e-mail, rejeitar e-mails duplicados (`409` ou `422`) e nunca retornar ou registrar a senha. Após o cadastro, o front-end tenta iniciar a sessão com `/api/login`; o endpoint não deve conceder perfil administrativo.

### Empréstimos (integrado)

`GET /api/emprestimos?status=ativo&usuario_id=1&livro_id=1&data_inicio=2026-01-01&data_fim=2026-01-31&pagina=1&por_pagina=10&ordenar_por=data_emprestimo&ordem=desc` retorna:

```json
{
  "dados": [{
    "id": 1,
    "usuario_id": 1,
    "usuario_nome": "Marina Costa",
    "livro_id": 4,
    "livro_titulo": "Capitães da Areia",
    "data_emprestimo": "2026-01-10",
    "data_prevista_devolucao": "2026-01-24",
    "data_devolucao": null,
    "status": "ativo"
  }],
  "pagina": 1,
  "por_pagina": 20,
  "total": 1
}
```

Os status retornados são `solicitado`, `ativo`, `devolvido`, `atrasado` e `recusado`; atraso é calculado quando a data prevista passou e ainda não há devolução.
`POST /api/emprestimos` recebe `{ "usuario_id": 1, "livro_id": 4, "data_emprestimo": "2026-01-10", "data_prevista_devolucao": "2026-01-24" }` e retorna o empréstimo criado (`201`). A API deve rejeitar livro sem exemplar disponível com `422` e validar disponibilidade atomicamente.
`POST /api/emprestimos/solicitacoes` recebe `{ "livro_id": 4 }` e cria uma solicitação (`201`) para o usuário da sessão, sem permitir que o cliente escolha outro usuário. A solicitação não reduz a disponibilidade. A API rejeita livro sem exemplar disponível e duplicidade de solicitação/empréstimo ativo com `409` ou `422`.
`PUT /api/emprestimos/{id}/aprovacao` aprova uma solicitação pendente (somente administrador), inicia o empréstimo na data corrente, define devolução prevista para 14 dias depois e reduz a disponibilidade atomicamente. Se não houver exemplar disponível ou a solicitação já tiver sido processada, retorna `409` ou `422`.
`PUT /api/emprestimos/{id}/recusa` recusa uma solicitação pendente (somente administrador) e retorna o empréstimo com `status: "recusado"` (`200`); a disponibilidade não muda.
Os filtros `status`, `usuario_id`, `data_inicio` e `data_fim` são usados na listagem; as datas delimitam a data do empréstimo/solicitação. A listagem também usa paginação e ordenação por data. Administradores podem consultar todos os empréstimos; para leitores, a API deve sempre limitar os resultados ao usuário autenticado e ignorar/rejeitar tentativas de consultar outro `usuario_id`.
Leitores consultam disponibilidade no acervo e enviam solicitações para títulos disponíveis. A tela de empréstimos mostra o status das solicitações e dos empréstimos próprios; administradores aprovam ou recusam as solicitações.
`PUT /api/emprestimos/{id}/devolucao` recebe `{ "data_devolucao": "2026-01-20" }` (data opcional: usar a data corrente) e retorna o empréstimo com `status: "devolvido"` e a `data_devolucao` definida (`200`). Administradores podem registrar devolução de qualquer empréstimo; leitores só podem registrar a devolução dos próprios empréstimos ativos/atrasados. O processamento atualiza a disponibilidade atomicamente; solicitações pendentes e empréstimos já devolvidos devem ser rejeitados (`409` ou `422`) para evitar mudanças indevidas ou reposição duplicada. A tela de Devoluções lista apenas os empréstimos do leitor autenticado e permite registrar a devolução; administradores mantêm acesso a todos os registros.

### Reservas (integrado)

`GET /api/reservas?status=pendente&usuario_id=1&livro_id=2&pagina=1&por_pagina=20` retorna:

```json
{
  "dados": [{
    "id": 1,
    "usuario_id": 1,
    "usuario_nome": "Marina Costa",
    "livro_id": 2,
    "livro_titulo": "Dom Casmurro",
    "data_reserva": "2026-01-12",
    "status": "pendente"
  }],
  "pagina": 1,
  "por_pagina": 20,
  "total": 1
}
```

`POST /api/reservas` recebe `{ "usuario_id": 1, "livro_id": 2 }` e retorna a reserva criada com `status: "pendente"` (`201`). A API deve rejeitar livros disponíveis e reservas pendentes duplicadas para o mesmo usuário/livro.
`DELETE /api/reservas/{id}` cancela a reserva sem apagar seu histórico e retorna `{ "mensagem": "Reserva cancelada.", "reserva": { "id": 1, "status": "cancelada" } }` (`200`).
O front lista reservas pendentes e canceladas, oferece cancelamento confirmado e mantém os registros cancelados no histórico. A criação é iniciada na tela de empréstimos ao escolher um livro indisponível. A gestão de reservas e o endpoint também devem exigir autorização administrativa.

### Relatórios (integrado)

`GET /api/relatorios/{tipo}?data_inicio=2026-01-01&data_fim=2026-01-31` retorna `{ "tipo": "...", "filtros": { "data_inicio": "...", "data_fim": "..." }, "dados": [...] }`. Para os cards do painel, `GET /api/relatorios/dashboard` retorna diretamente:

```json
{
  "total_livros": 42,
  "livros_emprestados": 17,
  "emprestimos_atrasados": 3,
  "reservas_pendentes": 5,
  "usuarios": 128
}
```

Os tipos e formatos de `dados` esperados para os relatórios:

- `livros-mais-emprestados`: `{ "livro_id": 4, "titulo": "Capitães da Areia", "autor": "Jorge Amado", "total_emprestimos": 12 }`.
- `emprestimos-por-periodo`: `{ "periodo": "2026-01", "total": 18 }` (períodos cronológicos para gráfico).
- `emprestimos-atrasados`: os mesmos campos de empréstimo da listagem, limitados aos itens com status `atrasado`.
- `usuarios-mais-ativos`: `{ "usuario_id": 1, "nome": "Marina Costa", "total_emprestimos": 9 }`.

O relatório retorna `200`; um `tipo` não suportado retorna `404`. A tela de relatórios consulta os quatro tipos para o período informado, mostra gráficos de livros mais emprestados, empréstimos por mês e usuários mais ativos, e exibe a tabela de atrasados. Cada relatório permite exportar seus dados carregados para CSV, sem endpoint adicional. A gestão de relatórios é restrita a administradores e a API deve aplicar a mesma autorização.
