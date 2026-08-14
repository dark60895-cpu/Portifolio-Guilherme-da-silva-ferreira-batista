# Agente WhatsApp + Gemini — Documentação e Prompt de Referência

## O que é

Um bot de WhatsApp em Node.js que:
- Conecta ao WhatsApp via `whatsapp-web.js` (sessão local salva em `.wwebjs_auth`, login por QR code).
- Recebe mensagens privadas (ignora grupos, broadcasts e newsletters).
- Responde usando a API do Google Gemini (`@google/generative-ai`), mantendo histórico de conversa por usuário.
- Tem persona configurável e retry automático se o modelo estiver sobrecarregado.

Pasta do projeto: `C:\Users\dark6\Music\whatsapp-gemini-bot`

---

## Stack / dependências

- Node.js
- `whatsapp-web.js` (usa Puppeteer/Chrome por baixo dos panos)
- `qrcode-terminal` (mostra o QR code no terminal)
- `@google/generative-ai` (SDK do Gemini)
- `dotenv` (variáveis de ambiente)

## Variáveis de ambiente (`.env`)

```
GEMINI_API_KEY=sua_chave_aqui
BOT_NAME=Assistente
BOT_PERSONA=Você é um assistente simpático e prestativo, que responde de forma clara e direta em português do Brasil.
```

## Modelo usado

```js
const PRIMARY_MODEL = "gemini-flash-latest";
```

Use sempre o alias `gemini-flash-latest` (ou `gemini-pro-latest`) em vez de fixar uma versão específica tipo `gemini-2.5-flash`. O Google descontinua modelos com frequência; o alias `-latest` aponta automaticamente pra versão estável mais recente e evita quebrar o bot no futuro.

---

## Fluxo da lógica principal (`index.js`)

1. Carrega `.env` e valida se `GEMINI_API_KEY` existe (encerra com erro claro se não existir).
2. Inicializa o cliente do Gemini e o cliente do WhatsApp (`LocalAuth`, Puppeteer headless).
3. Ao receber `qr`, mostra o QR code no terminal pra escanear.
4. Ao receber `message`:
   - Ignora grupos, broadcast, newsletter e status.
   - Pega o texto da mensagem; se vazio, ignora.
   - Mostra "digitando..." no chat.
   - Mantém um histórico por usuário (`Map`), limitado a 20 mensagens.
   - Monta uma sessão de chat com a persona + histórico.
   - Chama a API do Gemini, com até 3 tentativas se der erro 503 (sobrecarga).
   - Envia a resposta de volta no WhatsApp e loga no terminal.
   - Em caso de erro, responde com uma mensagem amigável de fallback.

---

## Erros já enfrentados (e como evitar)

1. **`404 This model ... is no longer available to new users`**
   Causa: modelo do Gemini fixado numa versão descontinuada (ex: `gemini-2.5-flash`).
   Solução: usar `gemini-flash-latest` em vez de uma versão numerada fixa.

2. **`EBUSY: resource busy or locked, unlink .../lockfile`**
   Causa: processo anterior do `node`/Chrome ainda rodando e travando o arquivo de sessão do WhatsApp.
   Solução:
   ```powershell
   Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
   Get-Process chrome -ErrorAction SilentlyContinue | Stop-Process -Force
   Remove-Item -Path ".\.wwebjs_auth" -Recurse -Force
   node index.js
   ```
   Depois disso, escaneie o QR code de novo.

3. **"Não está respondendo" (falso alarme)**
   Causa real: apertar `Ctrl+C` no terminal logo após mandar a mensagem, matando o processo antes da IA responder (a chamada pra API leva alguns segundos).
   Solução: deixar o terminal aberto e não interromper o processo. O bot só responde enquanto `node index.js` estiver rodando.

---

## Checklist rápido pra rodar sem erro (na próxima vez)

```powershell
cd C:\Users\dark6\Music\whatsapp-gemini-bot

# 1. Confirmar que não tem processo travado de uma sessão anterior
Get-Process node -ErrorAction SilentlyContinue

# 2. Se tiver sessão antiga com problema de login, limpar:
# Remove-Item -Path ".\.wwebjs_auth" -Recurse -Force

# 3. Rodar o bot
node index.js

# 4. Escanear o QR code (se pedido) com WhatsApp > Aparelhos conectados > Conectar aparelho

# 5. Deixar o terminal ABERTO e RODANDO — não apertar Ctrl+C
```

---

## Prompt de referência (para recriar ou pedir ajustes no bot)

Use este texto como prompt caso precise recriar o projeto do zero ou pedir uma modificação a uma IA de código:

> Crie um bot de WhatsApp em Node.js usando `whatsapp-web.js` com `LocalAuth` e QR code no terminal (`qrcode-terminal`). O bot deve responder mensagens privadas (ignorando grupos, broadcasts, newsletters e status) usando a API do Google Gemini via `@google/generative-ai`, com o modelo `gemini-flash-latest` (nunca fixar uma versão numerada específica, para evitar quebra quando o Google descontinuar modelos antigos). Deve manter histórico de conversa por usuário (máx. 20 mensagens), aplicar uma persona configurável por variável de ambiente (`BOT_PERSONA`), mostrar "digitando..." antes de responder, e implementar retry automático (até 3 tentativas) em caso de erro 503 (sobrecarga do modelo). Configuração via `.env` com `GEMINI_API_KEY`, `BOT_NAME` e `BOT_PERSONA`. Se a `GEMINI_API_KEY` não estiver definida, o processo deve encerrar com uma mensagem de erro clara.

---

## Próximo passo sugerido: rodar em segundo plano com PM2

Hoje o bot só funciona com o terminal aberto. Se quiser que ele continue rodando mesmo fechando a janela (e reinicie sozinho se cair), dá pra usar o **PM2**:

```powershell
npm install -g pm2
pm2 start index.js --name whatsapp-bot
pm2 save
pm2 logs whatsapp-bot   # ver os logs a qualquer momento
```

Isso resolve de vez o problema de "esqueci de deixar o terminal aberto" / Ctrl+C sem querer.
