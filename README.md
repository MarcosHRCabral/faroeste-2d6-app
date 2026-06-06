# Faroeste +2D6

Aplicacao web em React + TypeScript para criar, editar, salvar e rolar fichas de personagens de RPG de velho oeste inspirado no espirito do +2D6.

O app tem dois modos:

- **Modo local:** funciona sozinho no navegador, salva fichas no `localStorage`, importa/exporta JSON e imprime a ficha para salvar como PDF.
- **Sessao online P2P:** funciona no GitHub Pages sem backend obrigatorio usando WebRTC e codigos Offer/Answer.
- **Online Server opcional:** usa Node + Express + Socket.IO quando `VITE_SOCKET_URL` estiver configurado.

## Estrutura

- Frontend Vite + React + TypeScript na raiz do projeto.
- Backend Socket.IO em `server/`, rodando por padrao na porta `3001`.
- Tipos compartilhados em `shared/`.
- O frontend le `import.meta.env.VITE_SOCKET_URL` em `src/services/socketClient.ts`.

## Rodando localmente

Instale as dependencias:

```bash
npm install
```

Crie um arquivo `.env.local` na raiz baseado no `.env.example`:

```bash
VITE_SOCKET_URL=http://localhost:3001
PORT=3001
CLIENT_ORIGIN=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000
```

O Vite so recarrega variaveis de ambiente quando inicia. Depois de criar ou alterar `.env.local`, reinicie o servidor Vite.

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

## Multiplayer sem backend via GitHub Pages

Este e o modo recomendado quando voce nao quer manter servidor central.

Fluxo:

1. Mestre acessa o site no GitHub Pages.
2. Mestre clica em **Sessao online**.
3. Mestre escolhe **Host Game P2P**.
4. Mestre clica em **Gerar novo Offer Code** e envia esse codigo para um jogador.
5. Jogador acessa o mesmo site no GitHub Pages.
6. Jogador escolhe **Join Game P2P**, cola o Offer Code e gera um **Answer Code**.
7. Jogador envia o Answer Code de volta ao Mestre.
8. Mestre cola o Answer Code e clica em **Aceitar jogador**.
9. Quando a conexao abrir, o jogador aparece na mesa.

O Mestre e a autoridade da sessao: jogadores pedem rolagens, mas os dados `2d6` oficiais sao gerados no navegador do Mestre e enviados para todos.

Por que nao basta digitar o IP do Mestre:

- GitHub Pages so hospeda arquivos estaticos; ele nao roda backend.
- Um navegador comum nao abre uma porta publica para receber conexoes diretas como servidor.
- NAT, firewall e CGNAT geralmente impedem conexao direta por IP.
- WebRTC permite P2P entre navegadores, mas precisa trocar Offer/Answer; neste app essa troca e manual, por copiar e colar.

Limitacoes:

- O host precisa manter a aba aberta.
- Se o host desconectar, a sessao cai.
- A sessao nao fica salva na nuvem.
- WebRTC usa STUN publico e pode falhar em redes muito restritas.
- Se precisar de estabilidade maior, use o modo **Online Server** opcional.

Ferramentas do host:

- **Salvar snapshot local:** salva a sessao no navegador do host.
- **Exportar sessao JSON:** gera um backup em texto.
- **Importar sessao JSON:** restaura uma sessao exportada.

## Multiplayer local com servidor opcional

Esta parte e apenas para testar ou usar o modo **Online Server** na sua maquina. O modo **Host Game P2P** nao precisa disso no GitHub Pages.

### Jeito automatico no Windows

Use o arquivo da raiz do projeto:

```bash
start-multiplayer-local.cmd
```

Ele cria o `.env.local`, libera as portas `5173` e `3001`, instala dependencias se precisar e sobe frontend + backend juntos.

Tambem da para rodar pelo npm:

```bash
npm run dev:multiplayer
```

Depois abra `http://localhost:5173`, clique em **Sessao online** e escolha **Online Server** para testar o backend local.

Esse script e apenas para testes na sua maquina. No GitHub Pages, use **Host Game P2P** e **Join Game P2P** sem rodar backend.

### Jeito manual

1. Rode `npm install`.
2. Confirme que existe `.env.local` na raiz com `VITE_SOCKET_URL=http://localhost:3001`.
3. Confirme que o backend usa `PORT=3001`.
4. Rode `npm run dev` para subir cliente e servidor juntos.
5. Se preferir separado, rode `npm run dev:server` e `npm run dev:client` em terminais diferentes.
6. Abra `http://localhost:5173` em duas abas ou dois navegadores.
7. Na primeira aba, entre em **Sessao online**, escolha **Online Server** e crie uma sala como Mestre.
8. Na segunda aba, escolha **Online Server** e entre na mesma sala usando o codigo como Jogador.
9. Crie ou selecione uma ficha e teste uma rolagem `2d6`; ela deve aparecer para os dois jogadores.

Se o modo **Online Server** mostrar erro de conexao, confirme que `npm run dev:server` esta rodando. Para jogar sem backend, use **Host Game P2P**.

## Usando Online Server opcional

O modo Socket.IO antigo continua disponivel apenas quando `VITE_SOCKET_URL` existir.

1. Configure `VITE_SOCKET_URL` apontando para o backend.
2. Abra o app e clique em **Sessao online**.
3. Escolha **Online Server**.
4. Crie uma sala como Mestre ou entre com um codigo existente.
5. Compartilhe o link `/session/CODIGO` com os jogadores.

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

Nao coloque URLs fixas de producao no codigo. Use `VITE_SOCKET_URL` no frontend e `CLIENT_ORIGIN`/`CLIENT_URL`/`CORS_ORIGIN` no backend.

## Persistencia e limites

O servidor salva sessoes em `server/data/db.json` via LowDB. Esta e uma persistencia simples para uma v1: boa para mesas pequenas e um unico processo, mas nao substitui banco dedicado para escala maior.

O modo local continua independente do servidor.
