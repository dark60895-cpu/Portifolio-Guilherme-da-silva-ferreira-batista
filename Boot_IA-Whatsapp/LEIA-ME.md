# WhatsApp Gemini Bot

Bot de WhatsApp com IA (Google Gemini) que conversa de forma fluida, mantém
contexto da conversa e segue regras de conduta configuráveis.

## Arquivos

- `index.js` — arquivo principal do bot
- `filtro.js` — filtro de segurança (guardrail) antes de chamar a IA
- `package.json` — dependências do projeto
- `.env.example` — modelo do arquivo de configuração

## Como instalar (Windows / PowerShell)

1. Extraia esta pasta em `C:\Users\SEU_USUARIO\Videos\whatsapp-gemini-bot`
   (ou qualquer outro lugar de sua preferência).

2. Abra o PowerShell nessa pasta:

   ```powershell
   cd C:\Users\SEU_USUARIO\Videos\whatsapp-gemini-bot
   ```

3. Instale as dependências:

   ```powershell
   npm install
   ```

4. Crie o arquivo `.env` a partir do exemplo:

   ```powershell
   Copy-Item .env.example .env
   notepad .env
   ```

   Troque `coloque_sua_chave_aqui` pela sua chave real da API do Gemini
   (gerada em https://aistudio.google.com/apikey). Salve e feche.

5. Rode o bot:

   ```powershell
   node index.js
   ```

6. Vai aparecer um QR code no terminal. Abra o WhatsApp no celular:
   **Configurações → Aparelhos conectados → Conectar um aparelho**,
   e escaneie o QR code.

7. Pronto — mande uma mensagem de qualquer número (fora de grupos) para o
   número conectado, e o bot deve responder.

## Personalizando o bot

- **Personalidade e regras**: edite `BOT_PERSONA` no `.env`.
- **Nome do bot**: edite `BOT_NAME` no `.env`.
- **Modelo de IA usado**: edite `GEMINI_MODEL` no `.env`
  (padrão: `gemini-2.5-flash`, uma versão estável).
- **Palavras bloqueadas**: edite a lista `palavrasBloqueadas` em `filtro.js`.

## O que o bot já faz

- Responde qualquer pessoa em conversa privada (nunca em grupos, listas de
  transmissão ou canais — por segurança e para respeitar os termos do
  WhatsApp).
- Mantém contexto da conversa (memória das últimas 20 mensagens por pessoa,
  enquanto o processo estiver rodando).
- Tenta de novo automaticamente se a IA estiver sobrecarregada (erro 503).
- Avisa educadamente se a cota diária da API acabar (erro 429) — nesse caso
  é preciso esperar o reset da cota ou verificar o billing da conta Google.

## Problemas comuns

- **Erro "GEMINI_API_KEY não definida"**: verifique se o `.env` existe e
  tem a chave preenchida corretamente.
- **Erro 429 (quota exceeded)**: sua chave está no nível gratuito da API,
  ou o billing não está vinculado ao projeto correto no Google Cloud
  Console. Veja https://ai.google.dev/gemini-api/docs/rate-limits.
- **Erro 503 (high demand)**: sobrecarga temporária do modelo — o bot já
  tenta de novo automaticamente algumas vezes.
