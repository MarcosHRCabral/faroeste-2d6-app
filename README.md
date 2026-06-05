# Faroeste +2D6

Aplicacao web em React + TypeScript para criar, editar, salvar e rolar fichas de personagens de RPG de velho oeste inspirado no espirito do +2D6.

O app tem dois modos:

- **Modo local:** funciona sozinho no navegador, salva fichas no `localStorage`, importa/exporta JSON e imprime a ficha para salvar como PDF.
- **Sessao online:** usa um servidor Node + Express + Socket.IO para salas privadas em tempo real, com Mestre/Jogadores, fichas sincronizadas, rolagens oficiais no servidor, chat e painel basico do Mestre.

## Rodando localmente

Instale as dependencias:

```bash
npm install
```

Copie `.env.example` para `.env` se quiser ajustar a URL do servidor:

```bash
VITE_SOCKET_URL=http://localhost:3001
PORT=3001
CLIENT_ORIGIN=http://localhost:5173
```

Suba cliente e servidor juntos:

```bash
npm run dev
```

Ou rode cada parte separada:

```bash
npm run dev:client
npm run dev:server
```

O cliente abre em `http://localhost:5173`. O servidor responde em `http://localhost:3001/health`.

## Usando a sessao online

1. Abra o app e clique em **Sessao online**.
2. Crie uma sala como Mestre ou entre com um codigo existente.
3. Compartilhe o link `/session/CODIGO` com os jogadores.
4. Cada jogador cria sua ficha; o Mestre pode ver e editar todas.
5. Rolagens de ficha e chat aparecem em tempo real para a mesa.

As credenciais de entrada ficam no `localStorage` do navegador. Nao ha sistema de contas.

## Testes e build

```bash
npm run test
npm run build
npm run test:server
```

O build copia `dist/index.html` para `dist/404.html`, permitindo links diretos como `/session/CODIGO` no GitHub Pages.

## Deploy

### Frontend: GitHub Pages

O workflow em `.github/workflows/deploy.yml` roda testes, build e publica `dist` no GitHub Pages.

No repositorio do GitHub, configure:

- `Settings` -> `Pages` -> `Build and deployment` -> `Source: GitHub Actions`
- `Settings` -> `Secrets and variables` -> `Actions` -> `Variables`
- crie a variavel `VITE_SOCKET_URL` com a URL publica do backend no Render

### Backend: Render

O arquivo `render.yaml` cria um Web Service Node chamado `faroeste-2d6-server`.

Configure no Render:

- `CLIENT_ORIGIN=https://marcoshrcabral.github.io`
- `NODE_ENV=production`
- `PORT` pode ficar automatico pelo Render

Depois do deploy do backend, use a URL gerada pelo Render como `VITE_SOCKET_URL` no GitHub.

## Persistencia e limites

O servidor salva sessoes em `server/data/db.json` via LowDB. Esta e uma persistencia simples para uma v1: boa para mesas pequenas e um unico processo, mas nao substitui banco dedicado para escala maior.

O modo local continua independente do servidor.
