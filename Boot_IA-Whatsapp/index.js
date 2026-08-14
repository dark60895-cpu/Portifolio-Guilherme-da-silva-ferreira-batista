require("dotenv").config();
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const BOT_NAME = process.env.BOT_NAME || "Assistente";
const BOT_PERSONA =
  process.env.BOT_PERSONA ||
  "Você é um assistente simpático e prestativo, que responde de forma clara e direta em português do Brasil.";

if (!GEMINI_API_KEY) {
  console.error(
    "\n? ERRO: Você precisa definir GEMINI_API_KEY no arquivo .env\n" +
      "Copie o .env.example para .env e preencha sua chave.\n"
  );
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const PRIMARY_MODEL = "gemini-flash-lite-latest";
const model = genAI.getGenerativeModel({ model: PRIMARY_MODEL });

const conversationHistory = new Map();
const MAX_HISTORY_MESSAGES = 20;

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

client.on("qr", (qr) => {
  console.log("\n?? Escaneie o QR code abaixo com o WhatsApp do celular:\n");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log(`\n? ${BOT_NAME} está online e conectado ao WhatsApp!\n`);
});

client.on("auth_failure", (msg) => {
  console.error("? Falha na autenticação:", msg);
});

client.on("disconnected", (reason) => {
  console.log("??  WhatsApp desconectado:", reason);
});

client.on("message", async (message) => {
  try {
    const isGroup = message.from.endsWith("@g.us");
    const isBroadcast = message.from.endsWith("@broadcast");
    const isNewsletter = message.from.endsWith("@newsletter");

    if (isGroup || isBroadcast || isNewsletter) {
      return;
    }

    if (message.isStatus) {
      return;
    }

    const userId = message.from;
    const userText = message.body?.trim();

    if (!userText) return;

    console.log(`?? Mensagem de ${userId}: ${userText}`);

    try {
      const chat = await message.getChat();
      chat.sendStateTyping();
    } catch (_) {}

    if (!conversationHistory.has(userId)) {
      conversationHistory.set(userId, []);
    }
    const history = conversationHistory.get(userId);

    history.push({ role: "user", parts: [{ text: userText }] });

    while (history.length > MAX_HISTORY_MESSAGES) {
      history.shift();
    }

    const buildChatSession = (m) =>
      m.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: `Instrução de personalidade: ${BOT_PERSONA}` }],
          },
          {
            role: "model",
            parts: [{ text: "Entendido, vou seguir essa personalidade." }],
          },
          ...history,
        ],
      });

    const MAX_RETRIES = 3;
    let responseText = null;
    let lastError = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const chatSession = buildChatSession(model);

      try {
        const result = await chatSession.sendMessage(userText);
        responseText = result.response.text();
        break;
      } catch (err) {
        lastError = err;
        const isOverloaded =
          err?.status === 503 || err?.message?.includes("high demand");

        if (isOverloaded && attempt < MAX_RETRIES) {
          const waitMs = 1500;
          console.log(
            `? Modelo sobrecarregado, tentando de novo em ${waitMs / 1000}s (tentativa ${attempt}/${MAX_RETRIES})...`
          );
          await new Promise((resolve) => setTimeout(resolve, waitMs));
        } else {
          throw err;
        }
      }
    }

    if (!responseText) {
      throw lastError;
    }

    history.push({ role: "model", parts: [{ text: responseText }] });

    await client.sendMessage(message.from, responseText);
    console.log(`?? Resposta enviada: ${responseText.slice(0, 80)}...`);
  } catch (err) {
    console.error("? Erro ao processar mensagem:", err);
    const isOverloaded =
      err?.status === 503 || err?.message?.includes("high demand");
    try {
      await message.reply(
        isOverloaded
          ? "O sistema de IA está sobrecarregado agora, tenta de novo em alguns minutos ??"
          : "Desculpa, tive um problema para responder agora. Tenta de novo em instantes ??"
      );
    } catch (_) {}
  }
});

client.initialize();


